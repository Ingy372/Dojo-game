"""Hero visual overhaul v2 (Claude, Nov 22; Jay asked for a visual overhaul of the hero, benchmarks in Art Samples/).

Runs on the approved hero model (player_custom_a|b.blend) and keeps the rig, every animation, every layer and the
camera, so every existing animation (idle, walk, run, strikes, kata ...) re-renders in the new look with the same scripts:

  * chibi proportions: the whole head group (head, ears, face, hair) bigger around the neck, bigger hands and feet;
  * big glossy eyes: taller and wider, a warm iris glow in the lower half and a second small shine;
  * soft "glossy toy" shading: a smooth light-to-shadow band instead of a hard step, coloured shadows (cool on the gi
    and hair, warm on the skin, so the game's tints still multiply cleanly), a bright top highlight and a rim light;
  * smooth surfaces and a thicker, bolder outline, like the mobile games Jay picked.

    blender -b player_custom_a.blend -P upgrade_hero.py -- --save player_hero2_a.blend
"""
import bpy, bmesh, sys, re, argparse
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--save", default="")
ap.add_argument("--head", type=float, default=1.2)
ap.add_argument("--outline", type=float, default=0.019)
a = ap.parse_args(argv)


def lin(h):
    h = h.lstrip("#")
    o = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        o.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*o, 1.0)


rig = bpy.data.objects["MartialArtistRig"]
rig.data.pose_position = "REST"
bpy.context.view_layer.update()


def scale_about(ob, pivot, s):
    """Scales a mesh's vertices around a world point (s = number or (sx, sy, sz)), keeping its object transform."""
    if isinstance(s, (int, float)):
        s = (s, s, s)
    mw = ob.matrix_world.copy()
    inv = mw.inverted()
    for v in ob.data.vertices:
        d = (mw @ v.co) - pivot
        v.co = inv @ (pivot + Vector((d.x * s[0], d.y * s[1], d.z * s[2])))
    ob.data.update()


def move(ob, delta):
    mw = ob.matrix_world.copy()
    inv = mw.inverted()
    for v in ob.data.vertices:
        v.co = inv @ ((mw @ v.co) + delta)
    ob.data.update()


def centroid(ob):
    pts = [ob.matrix_world @ v.co for v in ob.data.vertices]
    return sum(pts, Vector()) / len(pts)


def bbox(ob):
    pts = [ob.matrix_world @ v.co for v in ob.data.vertices]
    return (Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))),
            Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts))))


meshes = [o for o in bpy.data.objects if o.type == "MESH"]
outlines = {o.name[:-8]: o for o in meshes if o.name.endswith("_outline")}

# ---------------------------------------------------------------- 1. chibi head
pivot = rig.matrix_world @ rig.data.bones["head"].head_local
for ob in meshes:
    if ob.parent == rig and ob.parent_bone == "head":
        scale_about(ob, pivot, a.head)

# ---------------------------------------------------------------- 2. hands and feet
for side in "LR":
    for part, s in (("fist", 1.16), ("foot", 1.08)):
        src = bpy.data.objects.get(f"{part}.{side}")
        if not src:
            continue
        c = centroid(src)
        for ob in (src, outlines.get(src.name)):
            if ob:
                scale_about(ob, c, s)

# ---------------------------------------------------------------- 3. big glossy eyes
iris_mat = bpy.data.materials["F_EYE"].copy()
iris_mat.name = "F_IRIS"
for n in iris_mat.node_tree.nodes:
    if n.type == "MIX":
        n.inputs[6].default_value = lin("#6e4430")
for eye in [o for o in meshes if re.match(r"f\d_eye\.[LR]$", o.name)]:
    pre, side = eye.name.split("_eye.")
    lo, hi = bbox(eye)
    c = (lo + hi) / 2
    h = hi.z - lo.z
    grow = (1.22, 1.0, 1.42)
    for nm in (f"{pre}_eye.{side}", f"{pre}_eyerim.{side}", f"{pre}_shine.{side}", f"{pre}_lash.{side}"):
        ob = bpy.data.objects.get(nm)
        if ob:
            scale_about(ob, c, grow)
    brow = bpy.data.objects.get(f"{pre}_brow.{side}")
    if brow:
        move(brow, Vector((0, 0, h * (grow[2] - 1) * 0.5 + 0.004)))
    coll = eye.users_collection[0]
    lo2, hi2 = bbox(eye)
    c2 = (lo2 + hi2) / 2
    h2 = hi2.z - lo2.z
    # warm iris glow in the lower half of the eye
    iris = eye.copy()
    iris.data = eye.data.copy()
    iris.name = f"{pre}_iris.{side}"
    coll.objects.link(iris)
    iris.data.materials.clear()
    iris.data.materials.append(iris_mat)
    scale_about(iris, c2, (0.72, 1.0, 0.55))
    move(iris, Vector((0, -0.0012, -h2 * 0.2)))
    # shines in front of everything, plus a second small shine low on the other side
    shine = bpy.data.objects.get(f"{pre}_shine.{side}")
    if shine:
        move(shine, Vector((0, -0.0024, 0)))
        s2 = shine.copy()
        s2.data = shine.data.copy()
        s2.name = f"{pre}_shine2.{side}"
        coll.objects.link(s2)
        sc = centroid(shine)
        scale_about(s2, sc, 0.5)
        move(s2, Vector(((c2.x - sc.x) * 1.7, -0.0004, -(h2 * 0.42))))

# ---------------------------------------------------------------- 4. glossy soft shading
SHADOWS = {
    "SKIN_NEUTRAL": "#d49a92", "GI": "#a9afcf", "LAPEL": "#a9afcf", "HAIR_NEUTRAL": "#8e8eb0", "HAIR_NEUTRAL_HI": "#8e8eb0",
    "BELT": "#a3a3ad", "BELT_EDGE": "#a3a3ad", "BELT_RIM_W": "#b3b3bb", "TAPE": "#a3a3ad", "TAPE_EDGE": "#a3a3ad",
}
DEFAULT_SHADOW = "#a8a8b8"
RIM = {"SKIN_NEUTRAL": 0.22, "GI": 0.20, "LAPEL": 0.12, "HAIR_NEUTRAL": 0.30, "HAIR_NEUTRAL_HI": 0.30}


def upgrade(m):
    nt = m.node_tree
    ramp = next((n for n in nt.nodes if n.type == "VALTORGB"), None)
    mix = next((n for n in nt.nodes if n.type == "MIX"), None)
    if not ramp or not mix or m.get("hero_v2"):
        return
    if all(abs(e.color[0] - 1.0) < 1e-3 for e in ramp.color_ramp.elements):
        return   # flat face parts stay flat
    m["hero_v2"] = True
    cr = ramp.color_ramp
    cr.interpolation = "EASE"
    while len(cr.elements) > 1:
        cr.elements.remove(cr.elements[-1])
    sh = lin(SHADOWS.get(m.name, DEFAULT_SHADOW))
    cr.elements[0].position = 0.0
    cr.elements[0].color = tuple(x * 0.92 for x in sh[:3]) + (1,)
    for pos, col in ((0.34, sh), (0.47, (1, 1, 1, 1)), (0.80, (1.02, 1.02, 1.02, 1)), (0.93, (1.16, 1.16, 1.14, 1))):
        e = cr.elements.new(pos)
        e.color = col
    # rim light: a bright edge where the surface turns away from the camera, strongest on top
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    rm = nt.nodes.new("ShaderNodeMapRange")
    rm.inputs["From Min"].default_value = 0.55
    rm.inputs["From Max"].default_value = 0.95
    rm.inputs["To Min"].default_value = 0.0
    rm.inputs["To Max"].default_value = RIM.get(m.name, 0.16)
    geo = next(n for n in nt.nodes if n.type == "NEW_GEOMETRY")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    up = nt.nodes.new("ShaderNodeMapRange")
    up.inputs["From Min"].default_value = -0.2
    up.inputs["From Max"].default_value = 0.7
    nt.links.new(geo.outputs["Normal"], sep.inputs[0])
    nt.links.new(sep.outputs[2], up.inputs["Value"])
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(lw.outputs["Facing"], rm.inputs["Value"])
    nt.links.new(rm.outputs["Result"], mul.inputs[0])
    nt.links.new(up.outputs["Result"], mul.inputs[1])
    add = nt.nodes.new("ShaderNodeMix")
    add.data_type = "RGBA"
    add.blend_type = "ADD"
    old = mix.inputs[7].links[0].from_socket          # ramp colour, multiplied with the base colour
    nt.links.new(mul.outputs[0], add.inputs["Factor"])
    nt.links.new(old, add.inputs[6])
    add.inputs[7].default_value = (1, 1, 1, 1)
    nt.links.new(add.outputs[2], mix.inputs[7])


for m in bpy.data.materials:
    if m.node_tree and not m.name.startswith("OUTLINE"):
        upgrade(m)

# ---------------------------------------------------------------- 5. smooth surfaces, bolder outline
for ob in meshes:
    for p in ob.data.polygons:
        p.use_smooth = True
for base, hull in outlines.items():
    src = bpy.data.objects.get(base)
    if not src or len(src.data.vertices) != len(hull.data.vertices):
        print("outline skipped", hull.name)
        continue
    bm = bmesh.new()
    bm.from_mesh(src.data)
    bm.normal_update()
    ms, mh = src.matrix_world, hull.matrix_world.inverted()
    nrm = ms.to_3x3().inverted().transposed()
    for v, hv in zip(bm.verts, hull.data.vertices):
        n = (nrm @ v.normal).normalized()
        hv.co = mh @ ((ms @ v.co) + n * a.outline)
    bm.free()
    hull.data.update()

rig.data.pose_position = "POSE"
bpy.context.scene["hero_version"] = "v2"
if a.save:
    bpy.ops.wm.save_as_mainfile(filepath=a.save)
print("UPGRADED")
