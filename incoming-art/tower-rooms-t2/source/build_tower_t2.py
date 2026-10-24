"""
Dojo Ascent - Yellow belt (Tier 2) Tower room kit, THEME SAMPLES (Art Director bot), Batch 9 samples.

Three proposed looks for the Yellow belt floors, built on the Tier 1 kit (tower-rooms/source/build_tower.py):
same pieces, sizes, camera, light and outline; only materials and a few shape accents change.
  sandstone : warm honey sandstone, terracotta caps, gold-banded pillars
  bamboo    : a bamboo garden temple: pale bamboo-mat floor, cream plaster walls with bamboo posts, green bamboo pillar
  sunrise   : sunrise clay: peach clay tiles, rose-clay walls with a soft sunrise band, a sun-disc pillar
Samples only: floor tiles (3), wall-face, wall-block, pillar and the battle door per theme. The chest, shrine and
other doors stay Tier 1 for now (they get the chosen theme in the full batch).

    blender -b -P incoming-art/tower-rooms-t2/source/build_tower_t2.py -- --theme sandstone --out <file>.blend
    blender -b <file>.blend -P incoming-art/tools/render_static.py -- --out <sprites folder>
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box, OUTLINE_W
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); ap.add_argument("--theme", required=True); A = ap.parse_args(argv)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene; scene.name = "Tower"
K = 1 / math.sin(math.radians(35)); COS = math.cos(math.radians(35))
def grid(c, r, z=0.0): return Vector((c, -r * K, z))
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
def put(name, bm, color, lay, outline=True, flat=False, smooth=False, parent=None):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = smooth
    bm.to_mesh(me); bm.free(); me.materials.append(M(color, flat) if isinstance(color, str) else color)
    ob = bpy.data.objects.new(name, me); layer(lay).objects.link(ob)
    obs = [ob]
    if outline: obs.append(add_hull(ob, layer(lay), OUTLINE, OUTLINE_W))
    if parent is not None:
        bpy.context.view_layer.update()
        for o in obs: o.parent = parent; o.matrix_parent_inverse = parent.matrix_world.inverted()
    return ob
def gbox(lay, name, c0, r0, c1, r1, z0, z1, color, outline=True, bevel=0.0, flat=False, parent=None):
    a, b = grid(c0, r1, z0), grid(c1, r0, z1)
    return put(name, box((a + b) / 2, Vector((abs(b.x - a.x), abs(b.y - a.y), abs(b.z - a.z))), bevel=bevel), color, lay, outline, flat, parent=parent)
def obox(lay, name, c, size, color, rot=(0, 0, 0), outline=True, bevel=0.0, parent=None, flat=False):
    return put(name, box(c, size, rot=rot, bevel=bevel), color, lay, outline, flat=flat, parent=parent)
def otube(lay, name, p0, p1, r0, r1, color, segs=12, outline=True, sx=1, sy=1, parent=None, flat=False):
    return put(name, tube(p0, p1, r0, r1, segs=segs, sx=sx, sy=sy), color, lay, outline, flat=flat, smooth=True, parent=parent)
def oell(lay, name, c, s, color, rot=(0, 0, 0), outline=True, flat=False, segs=14, rings=8, parent=None):
    return put(name, ellipsoid(c, s, rot=rot, segs=segs, rings=rings), color, lay, outline, flat, smooth=True, parent=parent)
def empty(name, loc):
    e = bpy.data.objects.new(name, None); scene.collection.objects.link(e); e.location = loc; return e
TARGETS = []
def target(name, layers, rect, top, anchor="bottom-center", **kw):
    TARGETS.append(dict(name=name, layers=layers, rect=rect, top=top, anchor=anchor, **{k: v for k, v in kw.items() if v is not None}))
random.seed(3)

THEMES = {
    "sandstone": dict(floor=["#d6c09a", "#cfb892", "#dac6a2"], grout="#a88f68", patch="#e1cfae", peb="#b49a72",
                      wall="#d9a96a", wdark="#b9844c", wcap="#e8c48c", pring="#e0b04a"),
    "bamboo":    dict(floor=["#d8cc9e", "#d0c494", "#ddd2a8"], grout="#a59a6c", patch="#e3d9b4", peb="#9fb07a",
                      wall="#efe4c8", wdark="#7fa65a", wcap="#c9a06a", pring="#5f8f45"),
    "sunrise":   dict(floor=["#e2bfa0", "#dbb798", "#e6c6a9"], grout="#b48d70", patch="#ecd0b8", peb="#c79b7c",
                      wall="#e39a85", wdark="#c47662", wcap="#f4c27a", pring="#ffb347"),
}
TH = THEMES[A.theme]
STONE = TH["floor"]; GROUT = TH["grout"]
WSTONE, WDARK, WCAP = TH["wall"], TH["wdark"], TH["wcap"]
H_FACE = 1.3 / COS; H_BLOCK = 0.5

def floor_tile(lay, kind):
    gbox(lay, lay + "_grout", 0, 0, 1, 1, -0.04, -0.005, GROUT, outline=False)
    if A.theme == "bamboo" and kind != "worn":   # woven bamboo mat: long strips (big = across, quad = 2x2 checker weave)
        if kind == "big":
            for i in range(4):
                gbox(lay, f"{lay}_s{i}", 0.02, i * 0.25 + 0.015, 0.98, i * 0.25 + 0.235, -0.005, 0.0, STONE[i % 2], outline=False)
        else:
            for i in range(2):
                for j in range(2):
                    for k in range(3):
                        if (i + j) % 2:
                            gbox(lay, f"{lay}_{i}{j}{k}", i * .5 + .02 + k * .155, j * .5 + .02, i * .5 + .16 + k * .155, j * .5 + .48, -0.005, 0.0, STONE[k % 2], outline=False)
                        else:
                            gbox(lay, f"{lay}_{i}{j}{k}", i * .5 + .02, j * .5 + .02 + k * .155, i * .5 + .48, j * .5 + .16 + k * .155, -0.005, 0.0, STONE[(k + 1) % 2], outline=False)
    elif kind == "big":
        gbox(lay, lay + "_slab", 0.025, 0.025, 0.975, 0.975, -0.005, 0.0, STONE[0], outline=False)
    elif kind == "quad":
        for i in range(2):
            for j in range(2):
                gbox(lay, f"{lay}_{i}{j}", i * 0.5 + 0.02, j * 0.5 + 0.02, i * 0.5 + 0.48, j * 0.5 + 0.48, -0.005, 0.0, STONE[(i + j) % 3], outline=False)
    else:
        gbox(lay, lay + "_slab", 0.025, 0.025, 0.975, 0.975, -0.005, 0.0, STONE[1], outline=False)
        put(lay + "_patch", ellipsoid(grid(0.42, 0.55, 0.0), (0.22, 0.14 * K, 0.002)), M(TH["patch"], True), lay, outline=False)
        for k, (c, r) in enumerate(((0.7, 0.3), (0.76, 0.36))):
            oell(lay, f"{lay}_peb{k}", grid(c, r, 0.004), (0.03, 0.025, 0.012), TH["peb"], outline=False)
    target(lay, [lay], [0, 0, 1, 1], 0, anchor=[0, 0], group="tiles", note="floor tile, exactly 80 x 80 px; anchorPx = top-left corner of the cell")
for k in ("big", "quad", "worn"):
    floor_tile(f"floor-{k}", k)

def wall_dressing(lay, y, x0=0.0, x1=1.0):
    """The theme's accent on a wall face (between x0 and x1)."""
    if A.theme == "sandstone":      # big sandstone courses
        for z in (0.4, 0.8, 1.2):
            obox(lay, f"{lay}_c{z}", Vector(((x0 + x1) / 2, y - 0.002, z)), (x1 - x0, 0.01, 0.025), M(WDARK, True), outline=False)
    elif A.theme == "bamboo":       # cream plaster between two green bamboo posts, a bamboo rail
        for x in (x0 + 0.06, x1 - 0.06):
            otube(lay, f"{lay}_bp{x}", Vector((x, y - 0.03, 0.0)), Vector((x, y - 0.03, H_FACE - 0.1)), 0.05, 0.05, "#8cbf5e", segs=10)
            for z in (0.45, 0.95):
                otube(lay, f"{lay}_bn{x}{z}", Vector((x, y - 0.03, z)), Vector((x, y - 0.03, z + 0.03)), 0.056, 0.056, "#6f9e48", segs=10, outline=False)
        otube(lay, f"{lay}_rail", Vector((x0, y - 0.03, 0.7)), Vector((x1, y - 0.03, 0.7)), 0.03, 0.03, "#a9cf7c", segs=8)
    else:                           # rose clay with a warm sunrise band
        obox(lay, f"{lay}_band", Vector(((x0 + x1) / 2, y - 0.004, 0.95)), (x1 - x0, 0.01, 0.16), M("#f7b267", True), outline=False)
        obox(lay, f"{lay}_band2", Vector(((x0 + x1) / 2, y - 0.006, 1.08)), (x1 - x0, 0.01, 0.06), M("#ffd59a", True), outline=False)

def wall_face(lay):
    y = grid(0, 1).y
    obox(lay, lay + "_face", Vector((0.5, y + 0.1, H_FACE / 2)), (1.0, 0.2, H_FACE), WSTONE)
    wall_dressing(lay, y)
    obox(lay, lay + "_base", Vector((0.5, y - 0.01, 0.1)), (1.0, 0.04, 0.2), WDARK, outline=False)
    obox(lay, lay + "_cap", Vector((0.5, y + 0.05, H_FACE - 0.06)), (1.0, 0.3, 0.12), WCAP, outline=False)
    target(lay, [lay], [0, 0, 1, 1], 0.3, anchor=[0, 0], group="walls", note="the outer top wall (same rules as Tier 1)")
wall_face("wall-face")
def wall_block(lay):
    gbox(lay, lay + "_block", 0, 0, 1, 1, 0, H_BLOCK, WSTONE)
    gbox(lay, lay + "_top", 0.06, 0.06, 0.94, 0.94, H_BLOCK, H_BLOCK + 0.01, WCAP, outline=False)
    y = grid(0, 1).y
    obox(lay, lay + "_line", Vector((0.5, y - 0.002, H_BLOCK * 0.5)), (1.0, 0.01, 0.025), M(WDARK, True), outline=False)
    target(lay, [lay], [0, 0, 1, 1], H_BLOCK * COS + 0.02, anchor=[0, 0], group="walls", note="any other '#' cell (same rules as Tier 1)")
wall_block("wall-block")
def pillar(lay):
    c = grid(0.5, 0.55)
    obox(lay, lay + "_base", c + Vector((0, 0, 0.08)), (0.72, 0.72, 0.16), WDARK, bevel=0.03)
    if A.theme == "bamboo":     # a cluster of three green bamboo stalks with nodes, a wooden cap
        for k, (dx, dy, r) in enumerate(((-0.12, 0.05, 0.13), (0.13, 0.06, 0.12), (0.0, -0.1, 0.14))):
            p = c + Vector((dx, dy, 0.16))
            otube(lay, f"{lay}_st{k}", p, p + Vector((0, 0, 1.4)), r, r * 0.95, "#8cbf5e", segs=12)
            for z in (0.45, 0.85, 1.2):
                otube(lay, f"{lay}_n{k}{z}", p + Vector((0, 0, z)), p + Vector((0, 0, z + 0.04)), r * 1.06, r * 1.06, "#6f9e48", segs=12, outline=False)
    else:
        otube(lay, lay + "_shaft", c + Vector((0, 0, 0.16)), c + Vector((0, 0, 1.55)), 0.27, 0.25, WSTONE, segs=16)
        for z in (0.6, 1.1):
            otube(lay, f"{lay}_ring{z}", c + Vector((0, 0, z)), c + Vector((0, 0, z + 0.05)), 0.275, 0.275, TH["pring"], segs=16, outline=False)
        if A.theme == "sunrise":   # a small sun disc with rays on the front of the shaft, facing the camera
            piv = empty(lay + "_sunpiv", c + Vector((0, -0.27, 0.85)))
            otube(lay, lay + "_sun", c + Vector((0, -0.25, 0.85)), c + Vector((0, -0.29, 0.85)), 0.11, 0.11, "#ffc857", segs=20, parent=piv)
            for i in range(8):
                a = i * math.pi / 4
                obox(lay, f"{lay}_ray{i}", c + Vector((math.cos(a) * 0.17, -0.285, 0.85 + math.sin(a) * 0.17)), (0.035, 0.01, 0.06), M("#ffd98a", True),
                     rot=(0, -math.degrees(a) + 90, 0), outline=False, parent=piv)
            piv.rotation_euler = (math.radians(-35), 0, 0)
    obox(lay, lay + "_cap", c + Vector((0, 0, 1.62)), (0.7, 0.7, 0.14), WCAP, bevel=0.03)
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], 1.75, anchor=[0.5, 1], group="walls", note="pillar (same rules as Tier 1)")
pillar("pillar")

# ------------------------------------------------------------------ the battle door, from the Tier 1 kit, in the theme's wall
DOORS = {
    "battle":    dict(trim="#c8553d", icon="fists",  label="Battle"),
    "challenge": dict(trim="#7b5cc4", icon="star",   label="Challenge"),
    "treasure":  dict(trim="#d9a441", icon="chest",  label="Treasure"),
    "rest":      dict(trim="#3f9a7a", icon="leaf",   label="Rest"),
}
def icon(lay, kind, c, s, parent=None):
    """Kid-readable icons on a round plaque: fists bump, a star, a little chest, a leaf."""
    y = c.y - 0.05
    if kind == "fists":   # two red sparring gloves, crossed, with white cuffs
        for sx in (-1, 1):
            p = Vector((c.x + sx * 0.07 * s, y - (0.01 if sx > 0 else 0), c.z + 0.03 * s))
            oell(lay, f"{lay}_glove{sx}", p, (0.085 * s, 0.05, 0.1 * s), "#d8352a", rot=(0, sx * 32, 0), parent=parent)
            oell(lay, f"{lay}_thumb{sx}", p + Vector((-sx * 0.06 * s, -0.03, -0.01 * s)), (0.03 * s, 0.03, 0.05 * s), "#e5503f", rot=(0, sx * 32, 0), parent=parent)
            q = p + Vector((sx * 0.07 * s, 0, -0.1 * s))
            obox(lay, f"{lay}_cuff{sx}", q, (0.1 * s, 0.05, 0.05 * s), "#f6efdc", rot=(0, sx * 32, 0), parent=parent)
        for k in (-1, 1):
            obox(lay, f"{lay}_spark{k}", Vector((c.x, y - 0.04, c.z + k * 0.14 * s)), (0.03 * s, 0.01, 0.06 * s), M("#ffe48a", True), outline=False, parent=parent)
    elif kind == "star":
        bm = bmesh.new()
        pts = [Vector((math.cos(a) * (0.2 if i % 2 == 0 else 0.085) * s, 0, math.sin(a) * (0.2 if i % 2 == 0 else 0.085) * s))
               for i, a in enumerate([math.pi / 2 + i * math.pi / 5 for i in range(10)])]
        vs = [bm.verts.new(Vector((c.x, y, c.z)) + p) for p in pts]; bm.faces.new(vs)
        bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.03)
        put(f"{lay}_star", bm, "#ffd36b", lay, parent=parent)
    elif kind == "chest":
        obox(lay, f"{lay}_cb", Vector((c.x, y, c.z - 0.04 * s)), (0.3 * s, 0.05, 0.16 * s), "#a46e40", parent=parent)
        oell(lay, f"{lay}_cl", Vector((c.x, y, c.z + 0.05 * s)), (0.155 * s, 0.05, 0.08 * s), "#b57a45", parent=parent)
        obox(lay, f"{lay}_cs", Vector((c.x, y - 0.04, c.z)), (0.05 * s, 0.01, 0.07 * s), M("#ffd36b", True), outline=False, parent=parent)
    else:   # leaf
        oell(lay, f"{lay}_leaf", Vector((c.x, y, c.z + 0.02 * s)), (0.075 * s, 0.03, 0.17 * s), "#6cc46f", rot=(0, 35, 0), parent=parent)
        obox(lay, f"{lay}_vein", Vector((c.x, y - 0.031, c.z + 0.02 * s)), (0.006 * s, 0.004, 0.24 * s), M("#3f8f4f", True), rot=(0, 35, 0), outline=False, parent=parent)
        obox(lay, f"{lay}_stem", Vector((c.x - 0.1 * s, y - 0.01, c.z - 0.14 * s)), (0.015 * s, 0.01, 0.08 * s), "#3f8f4f", rot=(0, 35, 0), parent=parent)
def medallion(lay, pc, d):
    """A full round medallion turned to face the camera (so it reads as a true circle, not an ellipse), with
    a cream face, the room colour as a ring, and the icon centred on it. Sits in front of the wall cap."""
    piv = empty(lay + "_medal", pc)
    otube(lay, lay + "_plaque", pc + Vector((0, 0.03, 0)), pc + Vector((0, -0.02, 0)), 0.22, 0.22, "#f6efdc", segs=32, parent=piv)
    otube(lay, lay + "_plaquerim", pc + Vector((0, -0.021, 0)), pc + Vector((0, -0.026, 0)), 0.205, 0.205, M(d["trim"], True), segs=32, outline=False, parent=piv)
    otube(lay, lay + "_plaquein", pc + Vector((0, -0.027, 0)), pc + Vector((0, -0.03, 0)), 0.175, 0.175, M("#f6efdc", True), segs=32, outline=False, parent=piv)
    icon(lay, d["icon"], pc + Vector((0, -0.02, 0)), 1.0, parent=piv)
    piv.rotation_euler = (math.radians(-35), 0, 0)    # face the 35-degree camera
    return piv

def door(kind):
    d = DOORS[kind]; lay = f"door-{kind}"; y = grid(0, 1).y
    # stone frame and wooden posts in the top wall cell, the room kind's colour on the trim
    obox(lay, lay + "_wall", Vector((0.5, y + 0.1, H_FACE / 2)), (1.0, 0.2, H_FACE), WSTONE)
    obox(lay, lay + "_cap", Vector((0.5, y + 0.05, H_FACE - 0.06)), (1.0, 0.3, 0.12), WCAP, outline=False)
    if A.theme == "bamboo": wall_dressing(lay, y)
    else: wall_dressing(lay, y, 0.0, 0.09); wall_dressing(lay, y, 0.91, 1.0)
    obox(lay, lay + "_opening", Vector((0.5, y - 0.004, 0.52)), (0.66, 0.01, 1.04), M("#2a2540", True), outline=False)
    for x in (0.13, 0.87):
        obox(lay, f"{lay}_post{x}", Vector((x, y - 0.03, 0.58)), (0.1, 0.08, 1.16), d["trim"])
    obox(lay, lay + "_lintel", Vector((0.5, y - 0.035, 1.16)), (0.9, 0.09, 0.1), d["trim"])
    # sliding doors: two wooden panels; they slide apart in frame 2 (open) and the doorway glows
    hinge = [empty(f"{lay}_slideL", Vector((0, 0, 0))), empty(f"{lay}_slideR", Vector((0, 0, 0)))]
    for k, x in enumerate((0.34, 0.66)):
        obox(lay, f"{lay}_panel{k}", Vector((x, y - 0.02, 0.52)), (0.32, 0.03, 1.02), "#c9a06a", parent=hinge[k])
        obox(lay, f"{lay}_paper{k}", Vector((x, y - 0.037, 0.58)), (0.24, 0.005, 0.72), M("#f6efdc", True), outline=False, parent=hinge[k])
        obox(lay, f"{lay}_bar{k}", Vector((x, y - 0.04, 0.58)), (0.24, 0.006, 0.02), M("#a07a4a", True), outline=False, parent=hinge[k])
    glow = empty(f"{lay}_glowpivot", Vector((0.5, y, 0.52)))
    obox(lay, lay + "_glow", Vector((0.5, y - 0.006, 0.52)), (0.64, 0.01, 1.02), M("#fff3c4", True), outline=False, parent=glow)
    # round medallion with the icon above the door (Jay's review: full circle, icon centred, fully visible)
    medallion(lay, Vector((0.5, y - 0.2, 1.42)), d)
    # frames: 1 = closed, 2 = open (panels slide into the wall, the doorway glows warm)
    for o in hinge + [glow]:
        o.keyframe_insert("location", frame=1); o.keyframe_insert("scale", frame=1)
    hinge[0].location = (-0.24, 0, 0); hinge[1].location = (0.24, 0, 0)
    for o in hinge: o.keyframe_insert("location", frame=2)
    glow.scale = (1, 1, 1); glow.keyframe_insert("scale", frame=2)
    glow.scale = (0.0001, 1, 0.0001); glow.keyframe_insert("scale", frame=1)
    for o in hinge + [glow]:
        for fc in o.animation_data.action.fcurves:
            for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"
    target(lay, [lay], [-0.1, 0, 1.1, 1], 0.95, anchor=[0.5, 1], frames=[1, 2], fps=1, group="doors",
           note=f"{d['label']} door for a 'D' slot in the top wall: frame 0 closed, frame 1 open (doors slide apart, the doorway glows). anchorPx = bottom-centre of the door cell. The icon plaque rises above the wall")
    # the icon on its own too (for door labels, the map, buttons)
door("battle")

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
