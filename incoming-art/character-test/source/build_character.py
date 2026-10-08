"""
Dojo Ascent - one-character test: builds the martial artist from scratch.

Run (headless):
    blender -b -P build_character.py -- --out martial_artist.blend

Everything (model, rig, materials, layer collections, the 4 animations) is made
here in code, so the character can be rebuilt exactly and tweaked by changing
numbers. The finished .blend is then rendered with incoming-art/tools/render_sprites.py.

Conventions the render script relies on (see incoming-art/tools/README.md):
  * An empty named CHAR_ROOT at the feet; the render script turns it for the 8 directions.
    The character faces -Y (towards the camera = "S") when CHAR_ROOT is not rotated.
  * One collection per sprite layer, named L_<layer> (L_body, L_gi, L_belt, ...).
  * One action per animation, with custom properties sprite_fps, sprite_loop, sprite_tags.
    Every keyframe is one sprite frame (frames 1..N).
"""
import bpy, bmesh, math, sys, argparse
from mathutils import Vector, Matrix, Euler

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", default="martial_artist.blend")
args = ap.parse_args(argv)

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "Character"
scene.render.fps = 24

def srgb(h):
    """'#rrggbb' -> linear RGBA (node colors are linear)."""
    h = h.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, 1.0)

# ------------------------------------------------------------------ materials
# Cel ("toon") shading done with an emission shader: the light direction is fixed in
# the world, so shading is identical in every engine and every direction.
LIGHT_DIR = Vector((-0.45, -0.55, 0.70)).normalized()   # from the camera side, upper left

def toon_material(name, hex_color, shadow=0.66, highlight=1.10):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    light = nt.nodes.new("ShaderNodeCombineXYZ")
    light.inputs[0].default_value, light.inputs[1].default_value, light.inputs[2].default_value = LIGHT_DIR
    dot = nt.nodes.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "CONSTANT"
    els = ramp.color_ramp.elements
    els[0].position = 0.0; els[0].color = (shadow, shadow, shadow, 1)
    els[1].position = 0.47; els[1].color = (1, 1, 1, 1)          # dot >= -0.06 -> lit
    e = els.new(0.93); e.color = (highlight, highlight, highlight, 1)  # small highlight
    remap = nt.nodes.new("ShaderNodeMapRange")                   # dot [-1,1] -> [0,1]
    remap.inputs["From Min"].default_value = -1.0
    remap.inputs["From Max"].default_value = 1.0
    mult = nt.nodes.new("ShaderNodeMix"); mult.data_type = "RGBA"; mult.blend_type = "MULTIPLY"
    mult.inputs["Factor"].default_value = 1.0
    mult.inputs[6].default_value = srgb(hex_color)
    emit = nt.nodes.new("ShaderNodeEmission")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(geo.outputs["Normal"], dot.inputs[0])
    nt.links.new(light.outputs[0], dot.inputs[1])
    nt.links.new(dot.outputs["Value"], remap.inputs["Value"])
    nt.links.new(remap.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], mult.inputs[7])
    nt.links.new(mult.outputs[2], emit.inputs["Color"])
    nt.links.new(emit.outputs[0], out.inputs["Surface"])
    m.diffuse_color = srgb(hex_color)
    return m

def outline_material():
    """Inverted-hull outline: dark where we see the inside of the hull, see-through elsewhere."""
    m = bpy.data.materials.new("OUTLINE")
    m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    emit = nt.nodes.new("ShaderNodeEmission"); emit.inputs["Color"].default_value = srgb("#14121c")
    clear = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(geo.outputs["Backfacing"], mix.inputs["Fac"])
    nt.links.new(emit.outputs[0], mix.inputs[1])
    nt.links.new(clear.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    m.use_backface_culling = True       # same look in Eevee/viewport
    m.diffuse_color = srgb("#14121c")
    return m

PALETTE = {
    # body layer: real colours (skin tone / hair colour become their own layers later)
    "skin":   "#f0b98d",
    "hair":   "#4a2c1d",
    "eye":    "#1d1a24",
    "shine":  "#ffffff",
    "mouth":  "#9c3d33",
    "blush":  "#f39a8a",
    # recolourable layers are neutral light grey; the game tints them (multiply)
    "gi":     "#f2f2f2",
    "lapel":  "#d2d2d2",
    "belt":   "#dedede",   # belt face, a step darker than its edge so even a charcoal black belt shows an edge
    "belt_edge": "#ffffff",
    "tape":   "#f2f2f2",
    "tape_edge": "#f4f1ea",  # rank stripe edge: NOT tinted, a light rim so stripes read on any belt
}
MAT = {k: toon_material(k.upper(), v) for k, v in PALETTE.items()}
MAT["eye"] = toon_material("EYE", PALETTE["eye"], shadow=1.0, highlight=1.0)
MAT["shine"] = toon_material("SHINE", PALETTE["shine"], shadow=1.0, highlight=1.0)
OUTLINE = outline_material()
OUTLINE_W = 0.013        # world units (~1.1 px at the standard camera)

# ---------------------------------------------------------------- collections
LAYERS = ["body", "gi", "belt", "belt-center", "belt-tape1-edge", "belt-tape1", "belt-tape2-edge", "belt-tape2"]
COLL = {}
for i, name in enumerate(LAYERS):
    c = bpy.data.collections.new("L_" + name)
    scene.collection.children.link(c)
    c["sprite_order"] = i                       # draw order in the game (bottom to top)
    c["sprite_tint"] = name != "body" and not name.endswith("-edge")   # neutral grey: the game recolours it
    c["sprite_overlay"] = name.startswith("belt-")  # optional extra on top of the belt
    COLL[name] = c
rig_coll = bpy.data.collections.new("RIG")
scene.collection.children.link(rig_coll)

# ----------------------------------------------------------------- armature
root = bpy.data.objects.new("CHAR_ROOT", None)
root.empty_display_type = "ARROWS"
rig_coll.objects.link(root)

arm_data = bpy.data.armatures.new("MartialArtistRig")
arm = bpy.data.objects.new("MartialArtistRig", arm_data)
rig_coll.objects.link(arm)
arm.parent = root
arm_data.display_type = "STICK"

bpy.context.view_layer.objects.active = arm
arm.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
eb = arm_data.edit_bones

def bone(name, head, tail, parent=None, deform=True):
    b = eb.new(name)
    b.head, b.tail = Vector(head), Vector(tail)
    d = (b.tail - b.head).normalized()
    # local X = world X for every bone, so "rotate X" always means pitch forward/back
    b.align_roll(Vector((1, 0, 0)).cross(d))
    if parent:
        b.parent = eb[parent]
    b.use_deform = deform
    return b

HIP_Z = 0.55
bone("root", (0, 0, 0), (0, 0, 0.12))
bone("hips", (0, 0, HIP_Z), (0, 0, 0.72), "root")
bone("chest", (0, 0, 0.72), (0, 0, 0.93), "hips")
bone("head", (0, 0, 0.95), (0, 0, 1.30), "chest")
for s, x in (("L", 1), ("R", -1)):
    bone(f"upper_arm.{s}", (0.165 * x, 0.0, 0.895), (0.18 * x, 0.02, 0.71), "chest")
    bone(f"forearm.{s}", (0.18 * x, 0.02, 0.71), (0.19 * x, -0.01, 0.54), f"upper_arm.{s}")
    bone(f"thigh.{s}", (0.085 * x, 0, HIP_Z), (0.085 * x, -0.02, 0.31), "hips")
    bone(f"shin.{s}", (0.085 * x, -0.02, 0.31), (0.085 * x, 0, 0.07), f"thigh.{s}")
    # controls (not deforming)
    bone(f"foot_ik.{s}", (0.085 * x, 0, 0.07), (0.085 * x, 0, 0.19), "root", False)
    bone(f"knee_pole.{s}", (0.085 * x, -0.6, 0.32), (0.085 * x, -0.6, 0.40), f"foot_ik.{s}", False)
    bone(f"hand_ik.{s}", (0.19 * x, -0.01, 0.54), (0.19 * x, -0.01, 0.62), "root", False)
    bone(f"elbow_pole.{s}", (0.28 * x, 0.45, 0.15), (0.28 * x, 0.45, 0.23), "chest", False)
bpy.ops.object.mode_set(mode="OBJECT")

for s in ("L", "R"):
    c = arm.pose.bones[f"shin.{s}"].constraints.new("IK")
    c.target, c.subtarget = arm, f"foot_ik.{s}"
    c.pole_target, c.pole_subtarget = arm, f"knee_pole.{s}"
    c.pole_angle = math.radians(-90)
    c.chain_count = 2
    c = arm.pose.bones[f"forearm.{s}"].constraints.new("IK")
    c.target, c.subtarget = arm, f"hand_ik.{s}"
    c.pole_target, c.pole_subtarget = arm, f"elbow_pole.{s}"
    c.pole_angle = math.radians(90)
    c.chain_count = 2
for pb in arm.pose.bones:
    pb.rotation_mode = "XYZ"

# ------------------------------------------------------------------- meshes
def finish_mesh(name, bm, mat, layer, parent_bone, outline=True, smooth=True):
    me = bpy.data.meshes.new(name)
    for f in bm.faces:
        f.smooth = smooth
    bm.to_mesh(me); bm.free()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    COLL[layer].objects.link(ob)
    parent_to_bone(ob, parent_bone)
    if outline:
        add_outline(ob, layer, parent_bone)
    return ob

def parent_to_bone(ob, bone_name):
    mw = ob.matrix_world.copy()
    ob.parent = arm
    ob.parent_type = "BONE"
    ob.parent_bone = bone_name
    bpy.context.view_layer.update()
    ob.matrix_world = mw

def add_outline(src, layer, bone_name):
    bm = bmesh.new(); bm.from_mesh(src.data)
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * OUTLINE_W
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(src.name + "_outline")
    bm.to_mesh(me); bm.free()
    me.materials.append(OUTLINE)
    ob = bpy.data.objects.new(src.name + "_outline", me)
    COLL[layer].objects.link(ob)
    ob.matrix_world = src.matrix_world.copy()
    parent_to_bone(ob, bone_name)
    return ob

def ellipsoid(center, size, rot=(0, 0, 0), segs=16, rings=10):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() \
        @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    return bm

def tube(p0, p1, r0, r1, segs=12, sx=1.0, sy=1.0):
    """Capped tapered cylinder from p0 to p1 (radius r0 at p0, r1 at p1)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segs,
                          radius1=r0, radius2=r1, depth=d.length)
    # cone is centred on origin along Z; non-uniform cross-section first
    bmesh.ops.transform(bm, matrix=Matrix.Diagonal((sx, sy, 1, 1)), verts=bm.verts)
    if d.normalized().z < -0.9999:
        # straight down: rotation_difference() would flip around a 45-degree axis and swap sx/sy
        # (Revision 2 fix - this made the gi skirt deeper than the belt, so it poked through at the back)
        rot = Matrix.Rotation(math.pi, 4, "X")
    else:
        rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((p0 + p1) / 2) @ rot, verts=bm.verts)
    return bm

def box(center, size, rot=(0, 0, 0), bevel=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    if bevel:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel / max(size), segments=2, affect="EDGES")
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() \
        @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    return bm

def strip(p0, p1, width, thick, normal_hint=(0, -1, 0)):
    """A flat strip (belt tail / tape) from p0 to p1."""
    p0, p1 = Vector(p0), Vector(p1)
    d = (p1 - p0)
    y = d.normalized()
    n = Vector(normal_hint).normalized()
    x = y.cross(n).normalized()
    n = x.cross(y).normalized()
    m = Matrix((x, y, n)).transposed().to_4x4()
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.transform(bm, matrix=Matrix.Translation((p0 + p1) / 2) @ m @ Matrix.Diagonal((width, d.length, thick, 1)),
                        verts=bm.verts)
    return bm

def bisect_keep(bm, co, no):
    """Cut bm with a plane and keep the side the normal points to."""
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=[-v for v in no], clear_outer=True)
    return bm

# ---- head (body layer)
HEAD_C = Vector((0, 0, 1.12))
finish_mesh("head", ellipsoid(HEAD_C, (0.19, 0.18, 0.185), segs=20, rings=14), MAT["skin"], "body", "head")
for x in (1, -1):
    finish_mesh(f"ear.{'L' if x > 0 else 'R'}", ellipsoid((0.183 * x, 0.005, 1.105), (0.03, 0.022, 0.04)),
                MAT["skin"], "body", "head")
# hair: cap + back + sides + short fringe. The hairline sits well above the brows so the
# eyes stay readable from the high camera (Revision 1: Jay found the old fringe covered them).
HAIRLINE_FRONT = 1.262   # cap edge height at the forehead (brows are at ~1.19, eye tops ~1.16)
bm = ellipsoid(HEAD_C + Vector((0, 0.008, 0.012)), (0.203, 0.195, 0.2), segs=24, rings=16)
bisect_keep(bm, (0, -0.19, HAIRLINE_FRONT), (0, 0.38, 1))   # higher at the front, lower at the back
finish_mesh("hair_cap", bm, MAT["hair"], "body", "head")
bm = ellipsoid(HEAD_C + Vector((0, 0.012, 0.005)), (0.2, 0.195, 0.197), segs=24, rings=16)
bisect_keep(bm, (0, 0.04, 0), (0, 1, 0))
bisect_keep(bm, (0, 0, 1.0), (0, 0, 1))
finish_mesh("hair_back", bm, MAT["hair"], "body", "head")

def on_head(x, z, inset=0.004):
    """Point on the front of the head surface, and the pitch that lays a flat piece onto it."""
    a, b, c = 0.19, 0.18, 0.185
    k = max(0.0, 1 - (x / a) ** 2 - ((z - HEAD_C.z) / c) ** 2)
    y = -b * math.sqrt(k)
    ny, nz = y / b ** 2, (z - HEAD_C.z) / c ** 2
    return y + inset, -math.degrees(math.atan2(nz, -ny))

for x, s in ((1, "L"), (-1, "R")):   # sideburns frame the face without reaching the eyes
    finish_mesh(f"hair_side.{s}", ellipsoid((0.172 * x, 0.0, 1.175), (0.036, 0.06, 0.075), rot=(0, 0, -12 * x)),
                MAT["hair"], "body", "head")
for i, (fx, fz, rz, sx) in enumerate(((0.085, 1.255, -26, 0.05), (0.02, 1.268, -6, 0.06), (-0.055, 1.26, 18, 0.05))):
    fy, pitch = on_head(fx, fz)
    finish_mesh(f"hair_fringe{i}", ellipsoid((fx, fy, fz), (sx, 0.022, 0.034), rot=(pitch, 0, rz)),
                MAT["hair"], "body", "head")
finish_mesh("hair_tuft", tube((0.0, 0.02, 1.3), (-0.02, 0.06, 1.39), 0.06, 0.005, segs=8), MAT["hair"], "body", "head")
# face
for x, s in ((1, "L"), (-1, "R")):
    finish_mesh(f"eye.{s}", ellipsoid((0.071 * x, -0.162, 1.112), (0.031, 0.016, 0.048), rot=(0, 0, 25 * x), segs=12, rings=8),
                MAT["eye"], "body", "head", outline=False)
    finish_mesh(f"eye_shine.{s}", ellipsoid((0.08 * x, -0.174, 1.132), (0.012, 0.006, 0.014), segs=8, rings=6),
                MAT["shine"], "body", "head", outline=False)
    finish_mesh(f"brow.{s}", box((0.073 * x, -0.151, 1.19), (0.05, 0.012, 0.011), rot=(-25, -9 * x, 25 * x)),
                MAT["eye"], "body", "head", outline=False)
    finish_mesh(f"blush.{s}", ellipsoid((0.112 * x, -0.137, 1.055), (0.024, 0.008, 0.014), rot=(0, 0, 38 * x), segs=10, rings=6),
                MAT["blush"], "body", "head", outline=False)
finish_mesh("mouth", ellipsoid((0, -0.168, 1.035), (0.026, 0.008, 0.011), segs=10, rings=6), MAT["mouth"], "body", "head", outline=False)
finish_mesh("neck", tube((0, 0, 0.9), (0, 0, 1.0), 0.055, 0.05), MAT["skin"], "body", "chest", outline=False)
# chest skin showing in the gi's V-neck
finish_mesh("chest_v", ellipsoid((0, -0.088, 0.895), (0.055, 0.03, 0.06)), MAT["skin"], "body", "chest", outline=False)

# ---- gi jacket (gi layer)
finish_mesh("gi_torso", ellipsoid((0, 0, 0.815), (0.165, 0.112, 0.16), segs=18, rings=12), MAT["gi"], "gi", "chest")
finish_mesh("gi_skirt", tube((0, 0.0, 0.745), (0, 0.0, 0.455), 0.92, 1.0, segs=18, sx=0.15, sy=0.115), MAT["gi"], "gi", "hips")
# lapels (left panel over right, like a real gi)
finish_mesh("gi_lapel.L", strip((0.072, -0.083, 0.952), (-0.028, -0.124, 0.64), 0.035, 0.012, (0, -1, 0.25)),
            MAT["lapel"], "gi", "chest", outline=False)
finish_mesh("gi_lapel.R", strip((-0.072, -0.083, 0.952), (0.02, -0.118, 0.70), 0.033, 0.010, (0, -1, 0.25)),
            MAT["lapel"], "gi", "chest", outline=False)
finish_mesh("gi_collar_back", tube((0, 0.04, 0.93), (0, 0.06, 0.98), 0.075, 0.065, sx=1.0, sy=0.8), MAT["lapel"], "gi", "chest", outline=False)

# ---- arms
for x, s in ((1, "L"), (-1, "R")):
    sh = Vector((0.165 * x, 0.0, 0.895)); el = Vector((0.18 * x, 0.02, 0.71)); wr = Vector((0.19 * x, -0.01, 0.54))
    finish_mesh(f"gi_shoulder.{s}", ellipsoid(sh + Vector((-0.008 * x, 0, -0.012)), (0.058, 0.058, 0.058)), MAT["gi"], "gi", f"upper_arm.{s}")
    finish_mesh(f"gi_upper_arm.{s}", tube(sh, el, 0.05, 0.046), MAT["gi"], "gi", f"upper_arm.{s}")
    finish_mesh(f"gi_elbow.{s}", ellipsoid(el, (0.046, 0.046, 0.046)), MAT["gi"], "gi", f"upper_arm.{s}")
    cuff = el.lerp(wr, 0.62)
    finish_mesh(f"gi_sleeve.{s}", tube(el, cuff, 0.046, 0.055), MAT["gi"], "gi", f"forearm.{s}")
    finish_mesh(f"forearm.{s}", tube(el.lerp(wr, 0.5), wr, 0.034, 0.032, segs=10), MAT["skin"], "body", f"forearm.{s}")
    d = (wr - el).normalized()
    finish_mesh(f"fist.{s}", ellipsoid(wr + d * 0.035, (0.047, 0.05, 0.05)), MAT["skin"], "body", f"forearm.{s}")

# ---- legs
for x, s in ((1, "L"), (-1, "R")):
    hp = Vector((0.085 * x, 0, HIP_Z)); kn = Vector((0.085 * x, -0.02, 0.31)); an = Vector((0.085 * x, 0, 0.07))
    finish_mesh(f"gi_thigh.{s}", tube(hp + Vector((0, 0, 0.04)), kn, 0.078, 0.064), MAT["gi"], "gi", f"thigh.{s}")
    finish_mesh(f"gi_knee.{s}", ellipsoid(kn, (0.064, 0.064, 0.064)), MAT["gi"], "gi", f"thigh.{s}")
    finish_mesh(f"gi_shin.{s}", tube(kn, kn.lerp(an, 0.78), 0.064, 0.074), MAT["gi"], "gi", f"shin.{s}")
    finish_mesh(f"ankle.{s}", tube(kn.lerp(an, 0.6), an, 0.036, 0.034, segs=10), MAT["skin"], "body", f"shin.{s}")
    finish_mesh(f"foot.{s}", box((0.085 * x + 0.004 * x, -0.045, 0.032), (0.085, 0.175, 0.062), bevel=0.025),
                MAT["skin"], "body", f"foot_ik.{s}")

# ---- belt (always its own layer, neutral grey so the game can recolour it)
BELT_Z0, BELT_Z1 = 0.578, 0.628
finish_mesh("belt_band", tube((0, 0, BELT_Z0), (0, 0, BELT_Z1), 1.0, 1.0, segs=24, sx=0.171, sy=0.131), MAT["belt"], "belt", "hips")
# lighter top edge (Revision 1): gives every belt colour, black included, a visible edge against the outline
finish_mesh("belt_edge", tube((0, 0, 0.6155), (0, 0, 0.6305), 1.0, 1.0, segs=24, sx=0.1735, sy=0.1335),
            MAT["belt_edge"], "belt", "hips", outline=False)
KNOT = Vector((0.0, -0.137, 0.603))
finish_mesh("belt_knot", box(KNOT, (0.058, 0.03, 0.05), rot=(0, 0, 0), bevel=0.012), MAT["belt"], "belt", "hips")
TAILS = [((0.01, -0.145, 0.59), (0.06, -0.168, 0.382)), ((-0.008, -0.145, 0.59), (-0.045, -0.166, 0.388))]
for i, (a, b) in enumerate(TAILS):
    finish_mesh(f"belt_tail{i}", strip(a, b, 0.036, 0.011), MAT["belt"], "belt", "hips")
# centre line for two-colour belts (e.g. red/black): its own overlay layer
finish_mesh("beltc_band", tube((0, 0, 0.5965), (0, 0, 0.6095), 1.0, 1.0, segs=24, sx=0.1735, sy=0.1335),
            MAT["tape"], "belt-center", "hips", outline=False)
for i, (a, b) in enumerate(TAILS):
    a, b = Vector(a), Vector(b)
    finish_mesh(f"beltc_tail{i}", strip(a + Vector((0, -0.007, 0)), b + Vector((0, -0.007, 0)), 0.012, 0.004),
                MAT["tape"], "belt-center", "hips", outline=False)
finish_mesh("beltc_knot", box(KNOT + Vector((0, -0.016, 0)), (0.06, 0.004, 0.013)), MAT["tape"], "belt-center", "hips", outline=False)
# rank stripes (tape) near the end of the left tail: up to 2 per belt (core-design section 10).
# Revision 1: each stripe is 0.065 tiles long (about 4 px at 128 px frames, at least 3 px seen from the front) with an
# untinted light rim (0.011 beyond each end) on its own layer, drawn with the stripe.
a, b = Vector(TAILS[0][0]), Vector(TAILS[0][1])
tail_len = (b - a).length
d = (b - a).normalized()
TAPE_LEN, TAPE_RIM = 0.065, 0.011
end = tail_len - 0.010                       # stop just short of the tail end
for k in range(2):                           # stripe 1 is nearest the end
    core1 = end - TAPE_RIM - k * (TAPE_LEN + 2 * TAPE_RIM + 0.004)
    core0 = core1 - TAPE_LEN
    finish_mesh(f"tape{k + 1}", strip(a + d * core0, a + d * core1, 0.041, 0.017), MAT["tape"],
                f"belt-tape{k + 1}", "hips", outline=False)
    finish_mesh(f"tape{k + 1}_edge", strip(a + d * (core0 - TAPE_RIM), a + d * (core1 + TAPE_RIM), 0.040, 0.0155),
                MAT["tape_edge"], f"belt-tape{k + 1}-edge", "hips", outline=False)

# ------------------------------------------------------------------ animation
PB = arm.pose.bones

def to_local(bone_name, world_vec):
    """Offset in root space -> pose-bone location (bones are not rotated in rest relative to root)."""
    return arm.data.bones[bone_name].matrix_local.to_3x3().inverted() @ Vector(world_vec)

REST = {
    "foot.L": Vector((0.085, 0, 0.07)), "foot.R": Vector((-0.085, 0, 0.07)),
    "hand.L": Vector((0.19, -0.01, 0.54)), "hand.R": Vector((-0.19, -0.01, 0.54)),
}

def lerp(a, b, t):
    if isinstance(a, (int, float)):
        return a + (b - a) * t
    return tuple(x + (y - x) * t for x, y in zip(a, b))

def blend(p, q, t):
    return {k: lerp(p[k], q[k], t) for k in p}

def pose(hips=(0, 0, 0), hips_rot=(0, 0, 0), chest_rot=(0, 0, 0), head_rot=(0, 0, 0),
         foot_l=(0.085, 0, 0.07), foot_r=(-0.085, 0, 0.07), foot_l_rot=(0, 0, 0), foot_r_rot=(0, 0, 0),
         hand_l=(0.19, -0.01, 0.54), hand_r=(-0.19, -0.01, 0.54)):
    return dict(hips=hips, hips_rot=hips_rot, chest_rot=chest_rot, head_rot=head_rot, foot_l=foot_l, foot_r=foot_r,
                foot_l_rot=foot_l_rot, foot_r_rot=foot_r_rot, hand_l=hand_l, hand_r=hand_r)

def apply(p, frame):
    """Rotations in degrees: (pitch forward +, turn-to-own-left +, lean)."""
    def rot(pb, r):
        pb.rotation_euler = Euler([math.radians(v) for v in r], "XYZ")
        pb.keyframe_insert("rotation_euler", frame=frame)
    def loc(pb, offset):
        pb.location = to_local(pb.name, offset)
        pb.keyframe_insert("location", frame=frame)
    loc(PB["hips"], p["hips"])
    rot(PB["hips"], p["hips_rot"]); rot(PB["chest"], p["chest_rot"]); rot(PB["head"], p["head_rot"])
    loc(PB["foot_ik.L"], Vector(p["foot_l"]) - REST["foot.L"]); rot(PB["foot_ik.L"], p["foot_l_rot"])
    loc(PB["foot_ik.R"], Vector(p["foot_r"]) - REST["foot.R"]); rot(PB["foot_ik.R"], p["foot_r_rot"])
    loc(PB["hand_ik.L"], Vector(p["hand_l"]) - REST["hand.L"])
    loc(PB["hand_ik.R"], Vector(p["hand_r"]) - REST["hand.R"])

def make_action(name, poses, fps, loop, tags=None):
    act = bpy.data.actions.new(name)
    act.use_fake_user = True
    arm.animation_data_create()
    arm.animation_data.action = act
    for i, p in enumerate(poses):
        apply(p, i + 1)
    for fc in act.fcurves:
        for k in fc.keyframe_points:
            k.interpolation = "LINEAR"
    act["sprite_fps"] = fps
    act["sprite_loop"] = loop
    act["sprite_tags"] = tags or ""
    act["sprite_order"] = len([a for a in bpy.data.actions if "sprite_fps" in a]) - 1
    act.use_frame_range = True
    act.frame_start, act.frame_end = 1, len(poses)
    return act

# Fighting stance (left side forward), the base of everything
STANCE = pose(hips=(0.0, 0.0, -0.035), hips_rot=(4, -14, 0), chest_rot=(2, -6, 0), head_rot=(-17, 18, 0),
              foot_l=(0.10, -0.11, 0.07), foot_r=(-0.11, 0.11, 0.07), foot_l_rot=(0, 8, 0), foot_r_rot=(0, -38, 0),
              hand_l=(0.085, -0.27, 0.87), hand_r=(-0.05, -0.20, 0.85))

# IDLE: relaxed breathing in fighting stance (loop)
idle = []
for i in range(8):
    ph = 2 * math.pi * i / 8
    b = math.sin(ph)
    p = dict(STANCE)
    p["hips"] = (0, 0, -0.035 - 0.012 * (1 - math.cos(ph)) / 2)
    p["chest_rot"] = (2 + 2.5 * b, -6, 0)
    p["head_rot"] = (-17 - 1.5 * b, 18, 0)
    p["hand_l"] = (0.085, -0.27, 0.87 - 0.012 * (1 - math.cos(ph)) / 2)
    p["hand_r"] = (-0.05, -0.20, 0.85 - 0.014 * (1 - math.cos(ph + 0.6)) / 2)
    idle.append(p)

# WALK (Revision 2): a natural, confident jog. 4.5 tiles/s is a sprint for legs only 0.48 tiles long,
# so a true walk can't keep up without sliding; a light jog can. 10 frames at 30 fps = one loop (2 steps)
# every 1/3 s. A planted foot moves back 4.5 / 30 = 0.15 tiles per frame (exactly the game's travel),
# so the loop covers 4.5 * 10 / 30 = 1.5 tiles (one step = 0.75 tiles, was 1.125 - far too long).
# Each step (5 frames): contact, down (lowest, knee soaks up weight), push (heel peels), up (short
# flight), reach. Hips and shoulders counter-rotate, relaxed arms swing opposite the legs, the body bobs.
WALK_FPS, WALK_SPEED, WALK_FRAMES = 30, 4.5, 10
STEP_PER_FRAME = WALK_SPEED / WALK_FPS                   # 0.15 tiles
STRIDE_TILES = WALK_SPEED * WALK_FRAMES / WALK_FPS       # 1.5 tiles per loop
#            y (forward -)        z      toe pitch (+ = toes down)
LEG_PATH = [(-STEP_PER_FRAME, 0.070, -6),   # 0 contact (heel first)
            (0.0,             0.070, 0),    # 1 down: planted, moved back exactly one frame of travel
            (+STEP_PER_FRAME, 0.086, 12),   # 2 push: planted, heel peels off
            (0.215, 0.148, 30),             # 3 toe-off (up / flight)
            (0.225, 0.185, 38),             # 4 heel lifts behind
            (0.150, 0.240, 32),             # 5 fold (other foot lands)
            (0.035, 0.262, 14),             # 6 passing: knee comes through
            (-0.095, 0.235, -2),            # 7 knee drives forward
            (-0.175, 0.160, -10),           # 8 reach
            (-0.190, 0.105, -10)]           # 9 drop, foot slows to meet the ground
HIP_BOB = [-0.040, -0.058, -0.044, -0.022, -0.026]   # per step: contact, down (lowest), push, up (highest), reach
walk = []
for i in range(WALK_FRAMES):
    l, r = LEG_PATH[i], LEG_PATH[(i + 5) % 10]
    ph = 2 * math.pi * i / WALK_FRAMES
    sw = math.cos(ph)                            # +1 left foot lands in front, -1 right foot lands
    ha = math.cos(ph - 0.35)                     # arms swing a touch behind the legs (relaxed)
    hz = HIP_BOB[i % 5]
    side = 0.008 * math.cos(ph - 0.6)           # weight shifts over the supporting foot
    p = pose(hips=(side, -0.025, hz), hips_rot=(7, -9 * sw, -2.0 * math.cos(ph - 0.6)),
             chest_rot=(3, 18 * sw, 2.0 * math.cos(ph - 0.6)),   # shoulders twist against the hips
             head_rot=(-18 + 1.5 * (hz + 0.04) / 0.018, -9 * sw, 0),  # head stays facing the way we run
             foot_l=(0.085, l[0], l[1]), foot_r=(-0.085, r[0], r[1]),
             foot_l_rot=(l[2], 0, 0), foot_r_rot=(r[2], 0, 0),
             # relaxed arms, elbows bent, swinging opposite the legs: right hand forward as the left foot lands
             hand_l=(0.155 - 0.04 * (1 - ha) / 2, -0.035 + 0.115 * ha, 0.68 - 0.035 * ha + hz + 0.04),
             hand_r=(-0.155 + 0.04 * (1 + ha) / 2, -0.035 - 0.115 * ha, 0.68 + 0.035 * ha + hz + 0.04))
    walk.append(p)

# STRIKE: step-in reverse punch (gyaku-zuki) - right fist from the hip, left hand pulls back (hikite)
LOAD = pose(hips=(0, 0.01, -0.06), hips_rot=(4, -26, 0), chest_rot=(2, -10, 0), head_rot=(-17, 32, 0),
            foot_l=(0.10, -0.12, 0.07), foot_r=(-0.11, 0.11, 0.07), foot_l_rot=(0, 8, 0), foot_r_rot=(0, -38, 0),
            hand_l=(0.06, -0.33, 0.80), hand_r=(-0.13, 0.02, 0.60))
STEP = pose(hips=(0, -0.05, -0.075), hips_rot=(6, -16, 0), chest_rot=(3, -8, 0), head_rot=(-17, 22, 0),
            foot_l=(0.10, -0.22, 0.10), foot_r=(-0.11, 0.12, 0.07), foot_l_rot=(-10, 8, 0), foot_r_rot=(0, -38, 0),
            hand_l=(0.05, -0.34, 0.79), hand_r=(-0.12, 0.0, 0.62))
DRIVE = pose(hips=(0, -0.08, -0.085), hips_rot=(7, 8, 0), chest_rot=(4, 6, 0), head_rot=(-17, -12, 0),
             foot_l=(0.10, -0.25, 0.07), foot_r=(-0.11, 0.14, 0.07), foot_l_rot=(0, 8, 0), foot_r_rot=(0, -40, 0),
             hand_l=(0.10, -0.18, 0.70), hand_r=(-0.06, -0.30, 0.74))
IMPACT = pose(hips=(0, -0.09, -0.09), hips_rot=(8, 26, 0), chest_rot=(4, 12, 0), head_rot=(-17, -36, 0),
              foot_l=(0.10, -0.25, 0.07), foot_r=(-0.11, 0.15, 0.07), foot_l_rot=(0, 8, 0), foot_r_rot=(0, -42, 0),
              hand_l=(0.13, 0.03, 0.60), hand_r=(-0.01, -0.585, 0.79))
HOLD = dict(IMPACT); HOLD["hips"] = (0, -0.09, -0.095); HOLD["hand_r"] = (-0.01, -0.58, 0.785)
RECOVER = blend(IMPACT, STANCE, 0.5); RECOVER["foot_l"] = (0.10, -0.19, 0.08)
strike = [STANCE, LOAD, STEP, DRIVE, IMPACT, HOLD, RECOVER, blend(IMPACT, STANCE, 0.85)]

# COUNTER: outside block with the lead arm (frames 1-4), then a counter punch (frames 5-8)
CHAMBER = pose(hips=(0, 0.01, -0.05), hips_rot=(4, -4, 0), chest_rot=(2, 4, 0), head_rot=(-17, 10, 0),
               foot_l=(0.10, -0.11, 0.07), foot_r=(-0.11, 0.11, 0.07), foot_l_rot=(0, 8, 0), foot_r_rot=(0, -38, 0),
               hand_l=(-0.07, -0.20, 0.76), hand_r=(-0.10, -0.10, 0.66))
BLOCK = pose(hips=(0, 0.0, -0.065), hips_rot=(4, -24, 0), chest_rot=(2, -10, 0), head_rot=(-17, 30, 0),
             foot_l=(0.10, -0.12, 0.07), foot_r=(-0.11, 0.11, 0.07), foot_l_rot=(0, 8, 0), foot_r_rot=(0, -38, 0),
             hand_l=(0.17, -0.24, 0.91), hand_r=(-0.13, 0.02, 0.60))
BLOCK_HOLD = dict(BLOCK); BLOCK_HOLD["hips"] = (0, 0.0, -0.068); BLOCK_HOLD["hand_l"] = (0.17, -0.235, 0.905)
CPUNCH = pose(hips=(0, -0.05, -0.075), hips_rot=(6, 24, 0), chest_rot=(3, 12, 0), head_rot=(-17, -34, 0),
              foot_l=(0.10, -0.13, 0.07), foot_r=(-0.11, 0.12, 0.07), foot_l_rot=(0, 8, 0), foot_r_rot=(0, -40, 0),
              hand_l=(0.13, 0.02, 0.61), hand_r=(-0.01, -0.54, 0.80))
CHOLD = dict(CPUNCH); CHOLD["hand_r"] = (-0.01, -0.535, 0.795)
# Revision 1: the block is held 4 more frames (block phase 8 frames = 0.5 s at 16 fps, was 0.25 s) so it
# reads clearly; the counter punch keeps its speed (4 frames = 0.25 s).
def settle(p, dz, dh):
    q = dict(p); q["hips"] = (0, 0.0, p["hips"][2] + dz)
    q["hand_l"] = (p["hand_l"][0], p["hand_l"][1], p["hand_l"][2] + dh)
    return q
BLOCK_HOLDS = [settle(BLOCK_HOLD, dz, dh) for dz, dh in ((-0.002, -0.002), (-0.003, -0.003), (-0.003, -0.002), (-0.002, -0.001))]
counter = [STANCE, CHAMBER, BLOCK, BLOCK_HOLD, *BLOCK_HOLDS,
           CPUNCH, CHOLD, blend(CPUNCH, STANCE, 0.5), blend(CPUNCH, STANCE, 0.85)]

make_action("idle", idle, fps=8, loop=True)
w = make_action("walk", walk, fps=WALK_FPS, loop=True)
w["sprite_stride_tiles"] = STRIDE_TILES          # ground covered by one loop (render script converts to px)
w["sprite_design_speed"] = WALK_SPEED            # tiles per second this fps is synced to
make_action("strike", strike, fps=16, loop=False, tags="impact:4")
make_action("counter", counter, fps=16, loop=False, tags="block:0-7,block_hold:3-7,counter_hit:8")
import json as _json
scene["sprite_meta"] = _json.dumps({"tintGuidance": {
    "mode": "multiply (Phaser setTint); untinted layers are drawn as they are",
    "gi": "gi colour (current placeholder #f2e9d8)",
    "belt": "the profile's belt.color, except very dark colours (black, #1a1a1a): use charcoal #3c3c44 so the belt and its light top edge read against the dark outline",
    "belt-center": "the profile's belt.color2 (same charcoal rule for black)",
    "belt-tape1 / belt-tape2": "tape colour: #f4f1ea on dark belts, #1a1a1a on light belts (rule in apps/client/src/ui/belt.ts)",
    "belt-tape1-edge / belt-tape2-edge": "no tint; draw each with its stripe (stripes >= 1 / >= 2)",
}})
arm.animation_data.action = bpy.data.actions["idle"]
scene.frame_start, scene.frame_end = 1, 8

bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=bpy.path.abspath(args.out) if not args.out.startswith("/") else args.out)
print("saved", args.out)
