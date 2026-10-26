"""
Dojo Ascent - earned cosmetics, A1 samples (Art Director bot).

Adds sample cosmetic layers to the APPROVED customizable player (player-custom/source/player_custom_a.blend).
Nothing that exists is changed: rig, animations, gi, belt, faces and hair stay as they are.

  headband   : a soft band around the forehead with a small knot and two short tails at the back.
               Neutral light grey, TINTED by the game (sprite_tint), so one layer gives every colour.
  wraps-*    : hand wraps matching the gear icons (icons/source/build_icons.py colours): cloth, leather, tiger.
               Real colours (no tint). Pick-one group "wraps".
  gi-trim    : a contrasting band on the lapels + collar, the sleeve cuffs and the jacket hem.
               Neutral light grey, TINTED by the game, drawn over the recolourable gi. The belt is untouched
               (it is still its own layer and covers the trim where it passes in front).

    blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/cosmetics-a1/source/build_cosmetics.py -- \
        --out /tmp/player_cosmetics_a.blend
    blender -b /tmp/player_cosmetics_a.blend -P incoming-art/tools/render_sprites.py -- --out incoming-art/cosmetics-a1/sprites/body-a \
        --name player-a --height 160 --anchor-y 0.856 --anims idle --layers headband,wraps-cloth,wraps-leather,wraps-tiger,gi-trim
The aura is 2D (source/make_aura.py), made from the rendered player silhouette.
"""
import bpy, bmesh, math, sys, os, argparse
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material, srgb

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); A = ap.parse_args(argv)
scene = bpy.context.scene
arm = bpy.data.objects["MartialArtistRig"]
OUTLINE = bpy.data.materials["OUTLINE"]; OUTLINE_W = 0.013
HEAD_C = Vector((0, 0, 1.12))

saved_action = arm.animation_data.action; arm.animation_data.action = None
for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
arm.data.pose_position = "REST"; bpy.context.view_layer.update()

def coll(name, order, tint, group=None):
    c = bpy.data.collections.new("L_" + name); scene.collection.children.link(c)
    c["sprite_order"] = order; c["sprite_tint"] = tint; c["sprite_overlay"] = False
    if group: c["sprite_group"] = group
    return c
def parent(ob, bone):
    mw = ob.matrix_world.copy(); ob.parent = arm; ob.parent_type = "BONE"; ob.parent_bone = bone
    bpy.context.view_layer.update(); ob.matrix_world = mw
def hull_bm(bm, w=OUTLINE_W):
    bm.normal_update()
    for v in bm.verts: v.co += v.normal * w
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
def put(c, name, bm, m, bone, outline=True, smooth=True):
    """bm in REST world space."""
    def mk(nm, b, mt):
        me = bpy.data.meshes.new(nm)
        for f in b.faces: f.smooth = smooth
        b.to_mesh(me); me.materials.append(mt)
        ob = bpy.data.objects.new(nm, me); c.objects.link(ob); parent(ob, bone); return ob
    if outline:
        b2 = bm.copy(); hull_bm(b2); mk(name + "_outline", b2, OUTLINE); b2.free()
    ob = mk(name, bm, m); bm.free(); return ob
def world_bm(src, grow=0.0):
    """A copy of src's mesh in rest world space, pushed out along its normals by `grow`."""
    bm = bmesh.new(); bm.from_mesh(src.data); bm.transform(src.matrix_world); bm.normal_update()
    if grow:
        for v in bm.verts: v.co += v.normal * grow
    return bm
def keep_side(bm, co, no):
    """keep the part of bm on the +no side of the plane through co"""
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=[-x for x in no], clear_outer=True)
    return bm
def ellipsoid(center, size, segs=32, rings=20):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    bmesh.ops.transform(bm, matrix=Matrix.Translation(center) @ Matrix.Diagonal((*size, 1)), verts=bm.verts); return bm
def solidify(bm, t):
    """turn an open shell into a closed band of thickness t (outwards)"""
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=-t); return bm

def striped(name, base, line, axis, freq, thresh, shadow=0.66):
    """Toon material whose colour is `base` with bands of `line` across `axis` (object space), so the bands
    wrap around a forearm like real wraps and stay glued to it in every frame."""
    m = toon_material(name, base, shadow); nt = m.node_tree
    mix = [n for n in nt.nodes if n.type == "MIX"][0]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    d = nt.nodes.new("ShaderNodeVectorMath"); d.operation = "DOT_PRODUCT"; d.inputs[1].default_value = axis
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = freq
    sn = nt.nodes.new("ShaderNodeMath"); sn.operation = "SINE"
    gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = thresh
    cm = nt.nodes.new("ShaderNodeMix"); cm.data_type = "RGBA"; cm.inputs[6].default_value = srgb(base); cm.inputs[7].default_value = srgb(line)
    nt.links.new(tc.outputs["Object"], d.inputs[0]); nt.links.new(d.outputs["Value"], mul.inputs[0])
    nt.links.new(mul.outputs[0], sn.inputs[0]); nt.links.new(sn.outputs[0], gt.inputs[0])
    nt.links.new(gt.outputs[0], cm.inputs["Factor"]); nt.links.new(cm.outputs[2], mix.inputs[6])
    return m

# ------------------------------------------------------------------ 1. headband (tinted)
NEUTRAL = toon_material("COSM_NEUTRAL", "#f2f2f2")
hb = coll("headband", 32, True)
TILT = Vector((0, 0.35, 1)).normalized()     # low at the back (round the back of the head), so it never reads as a halo
FRONT_LO, FRONT_HI = 1.203, 1.243             # brows top out at ~1.20; the eyes are never covered
bm = ellipsoid(HEAD_C + Vector((0, 0.006, 0.01)), (0.206, 0.212, 0.21))
for v in bm.verts:                               # hug the forehead at the front (no peeking over the crown from behind),
    if v.co.y < 0: v.co.y *= 0.91                # clear the hair at the back
lo = Vector((0, -0.2, FRONT_LO)); hi = Vector((0, -0.2, FRONT_HI))
keep_side(bm, lo, TILT); keep_side(bm, hi, -TILT)
bm.faces.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[f for f in bm.faces if abs(f.normal.z) > 0.9], context="FACES")   # leave an open ring
solidify(bm, 0.018)
put(hb, "headband_ring", bm, NEUTRAL, "head")
# An invisible HOLDOUT dome over the front of the crown, starting just above the band's top edge. It stands in for the hair
# (every hair option covers the crown), so from behind the forehead part of the band no longer peeks over the
# head as a thin ring (it read as a halo). It draws nothing itself and only affects this layer.
HOLD = bpy.data.materials.new("COSM_HOLDOUT"); HOLD.use_nodes = True; nt = HOLD.node_tree; nt.nodes.clear()
nt.links.new(nt.nodes.new("ShaderNodeHoldout").outputs[0], nt.nodes.new("ShaderNodeOutputMaterial").inputs["Surface"])
bm = ellipsoid(HEAD_C + Vector((0, 0.006, 0.01)), (0.236, 0.236, 0.236), 32, 20)
keep_side(bm, hi + TILT * 0.004, TILT); keep_side(bm, Vector((0, -0.02, 0)), Vector((0, -1, 0)))   # front half only
put(hb, "headband_hair_mask", bm, HOLD, "head", outline=False)
# knot + two short tails at the back (they hang DOWN behind the head; nothing above it)
kz = FRONT_LO + 0.022 - 0.35 * 0.4
put(hb, "headband_knot", ellipsoid(Vector((0.05, 0.215, kz)), (0.034, 0.026, 0.03), 16, 10), NEUTRAL, "head")
for k, (x0, x1, z1) in enumerate(((0.05, 0.095, kz - 0.13), (0.05, 0.02, kz - 0.115))):
    b = bmesh.new()
    p0 = Vector((x0, 0.222, kz - 0.01)); p1 = Vector((x1, 0.245, z1))
    side = Vector((0.018, 0, 0.0)); th = Vector((0, 0.008, 0))
    vs = [b.verts.new(p) for p in (p0 - side - th, p0 + side - th, p1 + side * 1.3 - th, p1 - side * 1.3 - th,
                                    p0 - side + th, p0 + side + th, p1 + side * 1.3 + th, p1 - side * 1.3 + th)]
    for f in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)): b.faces.new([vs[i] for i in f])
    put(hb, f"headband_tail{k}", b, NEUTRAL, "head", smooth=False)

# ------------------------------------------------------------------ 2. hand wraps (real colours, match the gear icons)
WRAPS = {
    "cloth":   ("#f1e7cf", "#cbb88f", 0.55),   # cream cloth with soft tan wrap lines
    "leather": ("#a8744a", "#f1d9a8", 0.90),   # brown leather with thin light stitch lines
    "tiger":   ("#f2a03c", "#3a2a22", 0.30),   # orange with bold dark tiger stripes
}
for i, (k, (base, line, th)) in enumerate(WRAPS.items()):
    c = coll(f"wraps-{k}", 33 + i, False, "wraps")
    for s in ("L", "R"):
        fa = bpy.data.objects[f"forearm.{s}"]; fi = bpy.data.objects[f"fist.{s}"]
        b = arm.data.bones[f"forearm.{s}"]
        ax_w = (b.tail_local - b.head_local).normalized()
        ax = (fa.matrix_world.inverted().to_3x3() @ ax_w).normalized()
        ax = (ax + 0.35 * ax.orthogonal().normalized()).normalized()      # a slight diagonal, like a wrap
        m = striped(f"WRAP_{k}_{s}", base, line, ax, 140.0, th)
        put(c, f"wrap_{k}_forearm.{s}", world_bm(fa, 0.011), m, f"forearm.{s}")
        put(c, f"wrap_{k}_fist.{s}", world_bm(fi, 0.009), m, f"forearm.{s}")

# ------------------------------------------------------------------ 3. gi trim (tinted, over the recolourable gi)
TRIM = toon_material("COSM_TRIM", "#f2f2f2")
gt = coll("gi-trim", 36, True)
torso = bpy.data.objects["gi_torso"]
for n in ("gi_lapel.L", "gi_lapel.R"):                # a band laid ON the jacket front along each lapel line
    lp = bpy.data.objects[n]; vs = [lp.matrix_world @ v.co for v in lp.data.vertices]
    p0, p1 = max(((a, b) for a in vs for b in vs), key=lambda ab: (ab[0] - ab[1]).length)
    c = sum(vs, Vector()) / len(vs); ax = (p1 - p0).normalized(); nrm = ax.cross(Vector((0, 1, 0))).normalized()
    bm = world_bm(torso, 0.005)
    keep_side(bm, c - nrm * 0.028, nrm); keep_side(bm, c + nrm * 0.028, -nrm); keep_side(bm, Vector((0, -0.03, 0)), Vector((0, -1, 0)))
    put(gt, f"trim_{n}", bm, TRIM, torso.parent_bone, outline=False)
src = bpy.data.objects["gi_collar_back"]
put(gt, "trim_collar_back", world_bm(src, 0.004), TRIM, src.parent_bone, outline=False, smooth=False)
for s in ("L", "R"):                                   # trouser cuffs
    src = bpy.data.objects[f"gi_shin.{s}"]; bm = world_bm(src, 0.005)
    zmin = min(v.co.z for v in bm.verts)
    keep_side(bm, Vector((0, 0, zmin + 0.04)), Vector((0, 0, -1)))
    put(gt, f"trim_trouser.{s}", bm, TRIM, src.parent_bone, outline=False)
for s in ("L", "R"):                                   # sleeve cuffs: the wrist end of each sleeve
    src = bpy.data.objects[f"gi_sleeve.{s}"]; bm = world_bm(src, 0.005)
    zmin = min(v.co.z for v in bm.verts)
    keep_side(bm, Vector((0, 0, zmin + 0.04)), Vector((0, 0, -1)))
    put(gt, f"trim_cuff.{s}", bm, TRIM, src.parent_bone, outline=False)
src = bpy.data.objects["gi_skirt"]; bm = world_bm(src, 0.005)        # jacket hem
zmin = min(v.co.z for v in bm.verts)
keep_side(bm, Vector((0, 0, zmin + 0.04)), Vector((0, 0, -1)))
put(gt, "trim_hem", bm, TRIM, src.parent_bone, outline=False)

arm.data.pose_position = "POSE"; arm.animation_data.action = saved_action
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out)
