"""
Dojo Ascent - menu icons (Art Director bot), Batch 8 SAMPLES: one gear, one Insight, one Seal.

Built from simple 3D models with the house toon kit (incoming-art/tools/toon_kit.py: the same fixed light,
toon ramp and dark outline as every character and room), then rendered by incoming-art/tools/render_static.py
with the same 35-degree orthographic camera at 80 px per tile. Each icon is a 1.6 x 1.6 tile target, so it is
128 x 128 px; the model is turned to face the camera and kept inside a 112 px circle (8 px margin).
Icons use a thicker outline than world sprites (ICON_OUTLINE, about 2 px at 128 px) so they still read when the
menu shows them at 48-64 points on a phone.

Family looks (from the brief): Gear = the object itself; Insights = a glowing scroll; Seals = a round seal
medallion with one simple symbol (Forms = the character in the stance, Virtues = gold: not in the samples).

    blender -b -P incoming-art/icons/source/build_icons.py -- --out incoming-art/icons/source/icons.blend
    blender -b incoming-art/icons/source/icons.blend -P incoming-art/tools/render_static.py -- --out incoming-art/icons/sprites
"""
import bpy, bmesh, math, sys, os, argparse, json
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); A = ap.parse_args(argv)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene; scene.name = "Icons"
K = 1 / math.sin(math.radians(35))
ICON_OUTLINE = 0.024
_m = {}
def M(h, flat=False):
    if (h, flat) not in _m: _m[(h, flat)] = toon_material(("F" if flat else "M") + h, h, *((1.0, 1.0) if flat else ()))
    return _m[(h, flat)]
OUTLINE = outline_material()
COLL = {}
def layer(n):
    if n not in COLL:
        c = bpy.data.collections.new("L_" + n); scene.collection.children.link(c); COLL[n] = c
    return COLL[n]
def empty(name, loc):
    e = bpy.data.objects.new(name, None); scene.collection.objects.link(e); e.location = loc; return e

class Icon:
    """Model in a local frame: x right, z up, -y toward the viewer; the pivot then turns it to face the camera."""
    def __init__(self, name, idx):
        self.name = name; self.lay = name
        self.c = Vector((0.8 + idx * 3.0, -0.8 * K, 0.0))
        self.piv = empty(name + "_pivot", self.c)
        self.objs = []
    def put(self, part, bm, color, outline=True, smooth=True, flat=False):
        me = bpy.data.meshes.new(f"{self.name}_{part}")
        for f in bm.faces: f.smooth = smooth
        bm.to_mesh(me); bm.free()
        me.materials.append(color if not isinstance(color, str) else M(color, flat))
        ob = bpy.data.objects.new(me.name, me); layer(self.lay).objects.link(ob)
        ob.location = self.c
        obs = [ob] + ([add_hull(ob, layer(self.lay), OUTLINE, ICON_OUTLINE)] if outline else [])
        for o in obs[1:]: o.matrix_world = Matrix.Identity(4); o.location = self.c
        self.objs += obs
        return ob
    def finish(self, tilt=-35):
        bpy.context.view_layer.update()
        for o in self.objs: o.parent = self.piv; o.matrix_parent_inverse = self.piv.matrix_world.inverted()
        self.piv.rotation_euler = (math.radians(tilt), 0, 0)
        TARGETS.append(dict(name=self.name, layers=[self.lay], rect=[self.c.x - 0.8, 0.0, self.c.x + 0.8, 1.6], top=0,
                            anchor=[self.c.x, 0.8], group="icons", note=NOTES[self.name]))
TARGETS = []
NOTES = {
    "icon-cloth-wraps": "gear (hands): Cloth Hand Wraps, a rolled cream cloth wrap with its loose end. 128 x 128, anchor = centre",
    "icon-ripple-counter": "Insight: Ripple Counter, the Insight scroll family (a glowing open scroll) showing ripples spreading from one point. 128 x 128, anchor = centre",
    "icon-strong-block": "Seal (technique seal): Strong Block, the seal medallion family showing a raised forearm block. 128 x 128, anchor = centre",
}

def disc(r, depth, segs=40):     # a disc in the xz plane, facing -y
    return tube((0, depth / 2, 0), (0, -depth / 2, 0), r, r, segs=segs)
def capsule(p0, p1, r):
    bm = tube(p0, p1, r, r, segs=16)
    for p in (p0, p1):
        b2 = ellipsoid(Vector(p), (r, r, r), segs=16, rings=10); me = bpy.data.meshes.new("tmp"); b2.to_mesh(me); b2.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
    return bm

# ------------------------------------------------------------------ gear: cloth hand wraps (the object itself)
ic = Icon("icon-cloth-wraps", 0)
CLOTH, CLOTH_D, CLOTH_HEM = "#f1e7cf", "#d9ccae", "#c9a06a"
# the roll: a fat cylinder with its end toward the viewer (turned a little so the side shows), rolled layers on the end
endc = Vector((-0.12, -0.12, 0.1)); back = Vector((0.06, 0.2, 0.1))
axis = (back - endc).normalized()
ic.put("roll", tube(back, endc, 0.36, 0.36, segs=40), CLOTH)
for k, r in enumerate((0.28, 0.19, 0.1)):     # spiral-like rings of the rolled layers on the end face
    ring = tube(endc - axis * 0.004, endc - axis * 0.008, r, r, segs=40)
    ob = ic.put(f"ring{k}", ring, M(CLOTH_D, True), outline=False)
    hole = tube(endc - axis * 0.0, endc - axis * 0.02, r - 0.025, r - 0.025, segs=40)
    hm = bpy.data.meshes.new(f"wh{k}"); hole.to_mesh(hm); hole.free()
    ho = bpy.data.objects.new(f"wh{k}", hm); scene.collection.objects.link(ho); ho.location = ic.c
    bo = ob.modifiers.new("cut", "BOOLEAN"); bo.object = ho; bo.operation = "DIFFERENCE"
    bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier="cut"); bpy.data.objects.remove(ho)
ic.put("core", tube(endc - axis * 0.004, endc - axis * 0.009, 0.035, 0.035, segs=20), M(CLOTH_D, True), outline=False)
# the loose end: a flat strip unrolling from under the roll, down and to the right, with a tan hem
from toon_kit import strip
pts = [Vector((0.14, -0.02, -0.22)), Vector((0.3, -0.1, -0.36)), Vector((0.44, -0.14, -0.42)), Vector((0.56, -0.16, -0.38))]
for k in range(len(pts) - 1):
    ic.put(f"tail{k}", strip(pts[k], pts[k + 1], 0.2, 0.03, normal_hint=(0, -1, 0.3)), CLOTH)
ic.put("hem", strip(pts[3] + Vector((-0.012, -0.02, -0.01)), pts[3] + Vector((0.0, -0.02, 0.0)), 0.2, 0.012, normal_hint=(0, -1, 0.3)), M(CLOTH_HEM, True), outline=False)
ic.finish()

# ------------------------------------------------------------------ Insight: ripple counter (glowing scroll family)
ic = Icon("icon-ripple-counter", 1)
PAPER, ROD, ROD_END, GLOW, INK = "#f7eed6", "#a46e40", "#e0b04a", "#ffe9a0", "#3f7fd0"
ic.put("halo", disc(0.58, 0.01, 48) if False else ellipsoid(Vector((0, 0.12, 0)), (0.6, 0.01, 0.52), segs=40, rings=8), M(GLOW, True), outline=False)
ic.put("halo2", ellipsoid(Vector((0, 0.1, 0)), (0.5, 0.01, 0.44), segs=40, rings=8), M("#fff6cf", True), outline=False)
ic.put("paper", box(Vector((0, 0, 0)), (0.72, 0.03, 0.62)), PAPER, smooth=False)
for z in (0.33, -0.33):     # the two rollers, with gold ends
    ic.put(f"rod{z}", tube((-0.44, 0, z), (0.44, 0, z), 0.055, 0.055, segs=16), ROD)
    for x in (-0.47, 0.47):
        ic.put(f"rodend{z}{x}", ellipsoid(Vector((x, 0, z)), (0.05, 0.065, 0.065), segs=14, rings=8), ROD_END)
# the picture on the scroll: a dot with three ripple rings spreading out (flat ink, no letters)
ic.put("dot", tube((0, -0.016, 0), (0, -0.022, 0), 0.045, 0.045, segs=24), M(INK, True), outline=False)
for k, r in enumerate((0.1, 0.17, 0.24)):
    ring = tube((0, -0.017, 0), (0, -0.021, 0), r + 0.016, r + 0.016, segs=40)
    me = bpy.data.meshes.new("t")
    hole = tube((0, -0.01, 0), (0, -0.03, 0), r - 0.016, r - 0.016, segs=40)
    # simple ring: outer disc minus inner via boolean
    ob = ic.put(f"ripple{k}", ring, M("#5aa0e6" if k else INK, True), outline=False)
    hm = bpy.data.meshes.new(f"hole{k}"); hole.to_mesh(hm); hole.free()
    ho = bpy.data.objects.new(f"hole{k}", hm); scene.collection.objects.link(ho); ho.location = ic.c; ho.hide_render = True
    bo = ob.modifiers.new("cut", "BOOLEAN"); bo.object = ho; bo.operation = "DIFFERENCE"
    bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier="cut")
    bpy.data.objects.remove(ho)
for k, a in enumerate((35, 155, 270)):   # three small sparkles: it's a special, glowing scroll
    r = 0.5; p = Vector((math.cos(math.radians(a)) * r, -0.05, math.sin(math.radians(a)) * r * 0.85))
    bm = bmesh.new()
    pts4 = [Vector((math.cos(t) * (0.06 if i % 2 == 0 else 0.02), 0, math.sin(t) * (0.06 if i % 2 == 0 else 0.02))) + p for i, t in enumerate([i * math.pi / 4 + math.pi / 2 for i in range(8)])]
    bm.faces.new([bm.verts.new(q) for q in pts4]); bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.01)
    ic.put(f"spark{k}", bm, M("#fffbe8", True), outline=False, smooth=False)
ic.finish()

# ------------------------------------------------------------------ Seal: strong block (seal medallion family)
ic = Icon("icon-strong-block", 2)
FACE, RING, SEAL = "#f6efdc", "#3f9ad0", "#2e6f9e"
ic.put("medal", disc(0.54, 0.08, 48), "#e8dcbc")
ic.put("rim", tube((0, -0.041, 0), (0, -0.047, 0), 0.5, 0.5, segs=48), M(RING, True), outline=False)
ic.put("face", tube((0, -0.048, 0), (0, -0.052, 0), 0.43, 0.43, segs=48), M(FACE, True), outline=False)
# the symbol: a forearm raised in a rising block (white gi sleeve, fist up), with two impact arcs above it
SKIN, SLEEVE = "#e7b48c", "#ffffff"
ic.put("sleeve", tube((0.28, -0.1, -0.24), (-0.05, -0.1, 0.06), 0.11, 0.1, segs=16), SLEEVE)
ic.put("forearm", tube((-0.02, -0.1, 0.04), (-0.17, -0.1, 0.17), 0.08, 0.075, segs=16), SKIN)
ic.put("fist", ellipsoid(Vector((-0.21, -0.1, 0.21)), (0.1, 0.09, 0.09), rot=(0, 40, 0), segs=16, rings=10), SKIN)
for k, (r, a0, a1) in enumerate(((0.33, 50, 130), (0.27, 60, 120))):
    for j, a in enumerate(range(a0, a1, 14)):
        aa = math.radians(a + 25)
        p = Vector((math.cos(aa) * r - 0.1, -0.12, math.sin(aa) * r + 0.05))
        ic.put(f"arc{k}{j}", box(p, (0.07, 0.02, 0.035), rot=(0, -(a + 25) + 90, 0)), M(SEAL, True), outline=False, smooth=False)
ic.finish()

scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
