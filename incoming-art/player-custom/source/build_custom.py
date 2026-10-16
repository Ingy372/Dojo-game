"""
Dojo Ascent - the customizable player (Art Director bot), Batch 6.

Starts from the APPROVED player model (player-character/source/player_character.blend: rig, 13 animations,
gi, belt layers and props untouched) and splits the old `body` layer:
  skin        : head, ears, neck, chest V, forearms, fists, feet ... in a light neutral tone, tinted by the game
  face-01..06 : eyes, brows, mouth, cheeks (pick one; real colours)
  hair-01..08 : hair only, neutral light grey, tinted by the game (pick one)
  body        : what's left (outlines and the untinted base), always drawn
The options are collections with sprite_group = "face" / "hair": tools/render_sprites.py draws only the
active option and renders it with the base layers as holdouts, so any one face + any one hair stack correctly.

    blender -b incoming-art/player-character/source/player_character.blend -P incoming-art/player-custom/source/build_custom.py -- \
        --out $PWD/incoming-art/player-custom/source/player_custom.blend
"""
import bpy, bmesh, math, sys, os, argparse, json
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); A = ap.parse_args(argv)
scene = bpy.context.scene
arm = bpy.data.objects["MartialArtistRig"]
OUTLINE = bpy.data.materials["OUTLINE"]; OUTLINE_W = 0.013
HEAD_C = Vector((0, 0, 1.12)); HA, HB, HC = 0.19, 0.18, 0.185

# rest pose while new parts are parented (meshes are built in rest-pose world space, like build_character.py)
saved_action = arm.animation_data.action; arm.animation_data.action = None
for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
arm.data.pose_position = "REST"; bpy.context.view_layer.update()

def coll(name, order, tint, group=None):
    c = bpy.data.collections.new("L_" + name); scene.collection.children.link(c)
    c["sprite_order"] = order; c["sprite_tint"] = tint; c["sprite_overlay"] = False
    if group: c["sprite_group"] = group
    return c
def mat(name, hex_color, flat=False):
    return toon_material(name, hex_color, *((1.0, 1.0) if flat else ()))
def parent(ob, bone="head"):
    mw = ob.matrix_world.copy(); ob.parent = arm; ob.parent_type = "BONE"; ob.parent_bone = bone
    bpy.context.view_layer.update(); ob.matrix_world = mw
def hull(src, c, bone):
    bm = bmesh.new(); bm.from_mesh(src.data); bm.normal_update()
    for v in bm.verts: v.co += v.normal * OUTLINE_W
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(src.name + "_outline"); bm.to_mesh(me); bm.free(); me.materials.append(OUTLINE)
    ob = bpy.data.objects.new(src.name + "_outline", me); c.objects.link(ob); parent(ob, bone)
def put(c, name, bm, m, outline=True, bone="head", smooth=True):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = smooth
    bm.to_mesh(me); bm.free(); me.materials.append(m)
    ob = bpy.data.objects.new(name, me); c.objects.link(ob); parent(ob, bone)
    if outline: hull(ob, c, bone)
    return ob
def ellipsoid(center, size, rot=(0, 0, 0), segs=16, rings=10):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm
def box(center, size, rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm
def bisect_keep(bm, co, no):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=[-v for v in no], clear_outer=True); return bm
def front(x, z, inset=0.004):
    """y on the front of the head at (x, z), and the pitch that lays a flat piece onto it."""
    k = max(0.0, 1 - (x / HA) ** 2 - ((z - HEAD_C.z) / HC) ** 2); y = -HB * math.sqrt(k)
    return y + inset

# ------------------------------------------------------------------ split the old body layer
body = bpy.data.collections["L_body"]
skin = coll("skin", 1, True)
for k in ("gi", "belt", "belt-sheen", "belt-center", "belt-center-edge", "belt-rim", "belt-tape1-edge", "belt-tape1",
          "belt-tape2-edge", "belt-tape2", "prop-broom", "prop-rag"):
    c = bpy.data.collections["L_" + k]; c["sprite_order"] = int(c["sprite_order"]) + 1      # make room for skin at 1
SKIN_N = mat("SKIN_NEUTRAL", "#f2f2f2")
for ob in list(body.objects):
    ms = [m.name for m in ob.data.materials if m] if ob.type == "MESH" else []
    if ob.name.startswith("hair_") or ob.name.split(".")[0] in ("eye", "eye_shine", "brow", "blush", "mouth"):
        bpy.data.objects.remove(ob, do_unlink=True); continue
    if "SKIN" in ms:
        body.objects.unlink(ob); skin.objects.link(ob); ob.data.materials[0] = SKIN_N

# ------------------------------------------------------------------ faces (real colours; never mocking)
EYE = mat("F_EYE", "#1d1a24", True); SHINE = mat("F_SHINE", "#ffffff", True)
MOUTH = mat("F_MOUTH", "#7a2e2a", True); BLUSH = mat("F_BLUSH", "#e2786b", True); FRECK = mat("F_FRECK", "#9a5a3c", True)
FACES = {
 1: dict(eye=(0.031, 0.048), eye_rot=25, eye_z=1.112, brow=(0.05, 0.011), brow_rot=25, brow_z=1.19, mouth=(0.026, 0.011), blush=True,
         note="the approved face of Batch 1: oval eyes with a shine, friendly brows, a small smile"),
 2: dict(eye=(0.038, 0.045), eye_rot=0, eye_z=1.11, brow=(0.046, 0.01), brow_rot=8, brow_z=1.195, mouth=(0.034, 0.012), blush=True,
         note="big round eyes, soft high brows, a wider smile"),
 3: dict(eye=(0.034, 0.03), eye_rot=12, eye_z=1.108, brow=(0.052, 0.013), brow_rot=4, brow_z=1.175, mouth=(0.026, 0.01), blush=False,
         note="calm almond eyes, straight brows, a small smile"),
 4: dict(eye=(0.03, 0.044), eye_rot=18, eye_z=1.11, brow=(0.05, 0.012), brow_rot=18, brow_z=1.188, mouth=(0.03, 0.013), blush=True, lashes=True,
         note="oval eyes with small lashes at the outer corner, a happy smile"),
 5: dict(eye=(0.03, 0.04), eye_rot=20, eye_z=1.112, brow=(0.056, 0.017), brow_rot=12, brow_z=1.188, mouth=(0.03, 0.011), blush=False,
         note="bold thick brows, determined but friendly"),
 6: dict(eye=(0.033, 0.046), eye_rot=22, eye_z=1.112, brow=(0.048, 0.011), brow_rot=22, brow_z=1.192, mouth=(0.028, 0.012), blush=False, freckles=True,
         note="oval eyes and freckles across the cheeks"),
}
for i, f in FACES.items():
    c = coll(f"face-{i:02d}", 14 + i - 1, False, "face")
    for x, s in ((1, "L"), (-1, "R")):
        ex = 0.071 * x; ez = f["eye_z"]
        put(c, f"f{i}_eye.{s}", ellipsoid((ex, front(ex, ez, 0.005), ez), (f["eye"][0], 0.016, f["eye"][1]), rot=(0, 0, f["eye_rot"] * x), segs=12, rings=8), EYE, outline=False)
        put(c, f"f{i}_shine.{s}", ellipsoid((ex + 0.009 * x, front(ex, ez + 0.02, 0.0) - 0.011, ez + 0.02), (0.012, 0.006, 0.014), segs=8, rings=6), SHINE, outline=False)
        bx = 0.073 * x; bz = f["brow_z"]
        put(c, f"f{i}_brow.{s}", box((bx, front(bx, bz, 0.0), bz), (f["brow"][0], 0.012, f["brow"][1]), rot=(-25, -9 * x, f["brow_rot"] * x)), EYE, outline=False)
        if f.get("lashes"):
            lx = 0.1 * x; lz = ez + 0.03
            put(c, f"f{i}_lash.{s}", box((lx, front(lx, lz, 0.0), lz), (0.022, 0.01, 0.008), rot=(-20, 0, -35 * x)), EYE, outline=False)
        if f.get("blush"):
            put(c, f"f{i}_blush.{s}", ellipsoid((0.112 * x, -0.137, 1.055), (0.024, 0.008, 0.014), rot=(0, 0, 38 * x), segs=10, rings=6), BLUSH, outline=False)
        if f.get("freckles"):
            for k, (fx, fz) in enumerate(((0.1, 1.07), (0.125, 1.06), (0.112, 1.045))):
                put(c, f"f{i}_freck{k}.{s}", ellipsoid((fx * x, front(fx * x, fz, -0.002), fz), (0.007, 0.005, 0.007), segs=8, rings=6), FRECK, outline=False)
    put(c, f"f{i}_mouth", ellipsoid((0, front(0, 1.035, -0.008), 1.035), (f["mouth"][0], 0.008, f["mouth"][1]), segs=10, rings=6), MOUTH, outline=False)

# ------------------------------------------------------------------ hair (neutral light grey, tinted by the game)
HAIR = mat("HAIR_NEUTRAL", "#e6e6e6")
HAIRLINE = 1.262        # the cap's front edge stays above the brows (eyes never covered; room for a headband)
def cap(c, n, lift=0.0, grow=0.0, front_z=HAIRLINE):
    bm = ellipsoid(HEAD_C + Vector((0, 0.008, 0.012 + lift)), (0.203 + grow, 0.195 + grow, 0.2 + grow), segs=24, rings=16)
    bisect_keep(bm, (0, -0.19, front_z), (0, 0.38, 1)); put(c, f"{n}_cap", bm, HAIR)
def back(c, n, grow=0.0, low=1.0):
    bm = ellipsoid(HEAD_C + Vector((0, 0.012, 0.005)), (0.2 + grow, 0.195 + grow, 0.197 + grow), segs=24, rings=16)
    bisect_keep(bm, (0, 0.04, 0), (0, 1, 0)); bisect_keep(bm, (0, 0, low), (0, 0, 1)); put(c, f"{n}_back", bm, HAIR)
def sides(c, n, h=0.075):
    for x, s in ((1, "L"), (-1, "R")):
        put(c, f"{n}_side.{s}", ellipsoid((0.172 * x, 0.0, 1.175), (0.036, 0.06, h), rot=(0, 0, -12 * x)), HAIR)
HAIRS = {}
def hair(fn): HAIRS[len(HAIRS) + 1] = fn; return fn

@hair
def very_short(c, n):
    """very short (close crop): a thin cap that follows the head"""
    bm = ellipsoid(HEAD_C + Vector((0, 0.006, 0.006)), (0.196, 0.187, 0.192), segs=24, rings=16)
    bisect_keep(bm, (0, -0.19, 1.25), (0, 0.5, 1)); put(c, f"{n}_cap", bm, HAIR)
@hair
def short(c, n):
    """short: the approved Batch 1 hair (cap, back, sideburns, a short fringe and a tuft)"""
    cap(c, n); back(c, n); sides(c, n)
    for i, (fx, rz) in enumerate(((-0.07, 18), (0.0, 0), (0.07, -18))):
        put(c, f"{n}_fringe{i}", ellipsoid((fx, front(fx, 1.27, 0.0) - 0.004, 1.27), (0.06, 0.022, 0.034), rot=(-30, 0, rz)), HAIR)
@hair
def curly(c, n):
    """curly: a rounder cap made of soft curls"""
    cap(c, n, lift=0.01, grow=0.01); back(c, n, grow=0.01)
    import random; rnd = random.Random(6)
    for i in range(26):
        a = rnd.uniform(0, 2 * math.pi); el = rnd.uniform(0.15, 1.35)
        d = Vector((math.cos(a) * math.cos(el), math.sin(a) * math.cos(el), math.sin(el)))
        p = HEAD_C + Vector((d.x * 0.2, d.y * 0.2 + 0.01, d.z * 0.2 + 0.02))
        if p.y < -0.12 and p.z < 1.26: continue          # keep the forehead and eyes clear
        put(c, f"{n}_curl{i}", ellipsoid(p, (0.05, 0.05, 0.045), segs=10, rings=6), HAIR)
@hair
def afro(c, n):
    """afro: a big round, soft volume of curls, the front edge above the brows"""
    bm = ellipsoid(HEAD_C + Vector((0, 0.03, 0.07)), (0.245, 0.235, 0.225), segs=28, rings=18)
    bisect_keep(bm, (0, -0.2, 1.255), (0, 0.42, 1)); put(c, f"{n}_volume", bm, HAIR)
    back(c, n, grow=0.02, low=1.0)
    import random; rnd = random.Random(11)
    for i in range(40):        # soft round puffs on the surface so it reads as hair, not a helmet
        a = rnd.uniform(0, 2 * math.pi); el = rnd.uniform(-0.1, 1.4)
        d = Vector((math.cos(a) * math.cos(el), math.sin(a) * math.cos(el), math.sin(el)))
        p = HEAD_C + Vector((0, 0.03, 0.07)) + Vector((d.x * 0.235, d.y * 0.225, d.z * 0.215))
        if p.y < -0.1 and p.z < 1.28: continue
        if p.z < 1.0: continue
        put(c, f"{n}_puff{i}", ellipsoid(p, (0.055, 0.055, 0.05), segs=10, rings=6), HAIR)
@hair
def braids(c, n):
    """braids: a smooth cap with two braids hanging behind the ears to the shoulders"""
    cap(c, n); back(c, n)
    for x, s in ((1, "L"), (-1, "R")):
        for k in range(5):
            z = 1.08 - k * 0.055
            put(c, f"{n}_braid{s}{k}", ellipsoid((0.15 * x, 0.07, z), (0.035, 0.035, 0.034), segs=10, rings=6), HAIR)
        put(c, f"{n}_tie{s}", ellipsoid((0.15 * x, 0.07, 1.08 - 5 * 0.055 + 0.01), (0.022, 0.022, 0.018), segs=8, rings=6), HAIR)
@hair
def ponytail(c, n):
    """ponytail: cap pulled back to a tie at the back of the head, a short tail (above the belt)"""
    cap(c, n); back(c, n)
    put(c, f"{n}_tie", ellipsoid((0, 0.2, 1.2), (0.035, 0.03, 0.035), segs=10, rings=6), HAIR)
    put(c, f"{n}_tail", ellipsoid((0, 0.235, 1.07), (0.05, 0.04, 0.13), rot=(14, 0, 0), segs=12, rings=8), HAIR)
@hair
def bun(c, n):
    """bun: cap with a round bun on top towards the back"""
    cap(c, n); back(c, n); sides(c, n, h=0.06)
    put(c, f"{n}_bun", ellipsoid((0, 0.07, 1.36), (0.085, 0.08, 0.075), segs=14, rings=10), HAIR)
@hair
def tied_back(c, n):
    """tied back: smooth hair combed back to a low knot at the nape"""
    cap(c, n, front_z=1.27); back(c, n, low=1.02)
    put(c, f"{n}_knot", ellipsoid((0, 0.19, 1.04), (0.06, 0.045, 0.045), segs=12, rings=8), HAIR)
for i, fn in HAIRS.items():
    c = coll(f"hair-{i:02d}", 20 + i - 1, True, "hair")
    fn(c, f"h{i}")

# ------------------------------------------------------------------ restore the pose and write the meta
arm.data.pose_position = "POSE"; arm.animation_data.action = saved_action
meta = json.loads(scene.get("sprite_meta", "{}"))
SKINS = ["#f6d7c3", "#efc3a4", "#e0a984", "#c98e65", "#b07650", "#946042", "#7a4b32", "#603926", "#4a2c1f", "#38221a"]
HAIRC = {"black": "#1f1a1c", "dark-brown": "#3a2519", "brown": "#5c3a22", "light-brown": "#8a5f3b", "blonde": "#d9b26a",
         "red": "#b5482a", "auburn": "#8a3a26", "grey": "#9a9aa2", "blue": "#3f6fd1", "purple": "#7d4cc2"}
GIC = {"white": "#f2f2f2", "black": "#2b2b33", "navy": "#24345e", "blue": "#3a6ea5", "red": "#b8322a", "grey": "#8a8d99",
       "green": "#3f7a4a", "unbleached": "#e9dfc9", "sky": "#7fb2e0", "maroon": "#7a2a33"}
meta["palettes"] = dict(
    skin=SKINS, hair=list(HAIRC.values()), gi=list(GIC.values()),
    note="Recommended swatches (hex), shown by the game in this order. They are multiply tints for the tinted layers "
         "(skin, hair-*, gi). Skin runs from light to deep. The ids in palettesDraftLabels are placeholders for the "
         "Content Writer, not names")
meta["palettesDraftLabels"] = dict(skin=[f"skin-{k + 1:02d}" for k in range(10)], hair=list(HAIRC), gi=list(GIC))
meta["groups"] = dict(face=[f"face-{i:02d}" for i in FACES], hair=[f"hair-{i:02d}" for i in HAIRS],
                      note="draw exactly one layer of each group, after the base layers (face, then hair)")
meta["optionNotes"] = {**{f"face-{i:02d}": f["note"] for i, f in FACES.items()}, **{f"hair-{i:02d}": HAIRS[i].__doc__ for i in HAIRS}}
meta.setdefault("tintGuidance", {})
if isinstance(meta["tintGuidance"], dict):
    meta["tintGuidance"]["skin"] = "multiply by a palettes.skin colour (the layer is a light neutral grey)"
    meta["tintGuidance"]["hair"] = "multiply every hair-* layer by a palettes.hair colour (light neutral grey)"
scene["sprite_meta"] = json.dumps(meta)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, "layers:", sorted(c.name for c in bpy.data.collections if c.name.startswith("L_")))
