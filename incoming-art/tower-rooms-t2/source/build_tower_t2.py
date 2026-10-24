"""
Dojo Ascent - Yellow belt (Tier 2) Tower room kit, full kit (Art Director bot), Batch 9. Jay's pick: bamboo (Bamboo Garden Hall).

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
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); ap.add_argument("--theme", default="bamboo"); A = ap.parse_args(argv)
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
    ic = f"icon-{kind}"
    pc2 = Vector((5.5 + list(DOORS).index(kind) * 1.0, -2.0, 0.6))
    medallion(ic, pc2, d)
    target(ic, [ic], [pc2.x - 0.3, -pc2.y / K - 0.1, pc2.x + 0.3, -pc2.y / K + 0.1], 0.6, anchor="bottom-center", group="doors",
           note="the door's icon on its round medallion, on its own (for labels, the floor map or buttons)")
for k in DOORS:
    door(k)

# ------------------------------------------------------------------ chest: closed idle, opening, open idle
# Jay's review: make opening it special. One timeline at 12 fps, three targets (three sheets):
#   chest-closed : frames 1-12  (1.0 s loop)  closed, a glint slides down a gold band
#   chest-open   : frames 13-42 (2.5 s, once) anticipation (wiggle, light building in the seams), the lid bursts
#                  open with a golden light beam, stars and sparkles rise, the glow pulses and settles
#   chest-opened : frames 43-54 (1.0 s loop)  open, a soft shimmering glow and a few twinkles
# Layers: chest (wood and gold), chest-glow (seam light, the light inside, the glints), chest-fx (beam, stars,
# sparkles), so the game can add sound or particles on the key frames listed in the json.
def glow_mat(name, hex_color, alpha):
    """See-through light (for the beam): emission mixed with transparency."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = srgb(hex_color)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs["Fac"].default_value = alpha
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs["Surface"])
    m.blend_method = "BLEND"; return m

def star_bm(r, inner=0.42):
    bm = bmesh.new()
    pts = [Vector((math.cos(a) * (r if i % 2 == 0 else r * inner), 0, math.sin(a) * (r if i % 2 == 0 else r * inner)))
           for i, a in enumerate([math.pi / 2 + i * math.pi / 5 for i in range(10)])]
    vs = [bm.verts.new(p) for p in pts]; bm.faces.new(vs)
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.01)
    return bm

def kf(o, f, loc=None, rot=None, sc=None):
    if loc is not None: o.location = loc; o.keyframe_insert("location", frame=f)
    if rot is not None: o.rotation_euler = [math.radians(v) for v in rot]; o.keyframe_insert("rotation_euler", frame=f)
    if sc is not None:
        o.scale = sc if isinstance(sc, (tuple, list)) else (max(sc, 1e-4),) * 3; o.keyframe_insert("scale", frame=f)

def chest():
    L, G, X = "chest", "chest-glow", "chest-fx"; c = grid(0.5, 0.6)
    root = empty("chest_root", c)
    def par(o, p):
        bpy.context.view_layer.update(); o.parent = p; o.matrix_parent_inverse = p.matrix_world.inverted()
    obox(L, "chest_body", c + Vector((0, 0, 0.18)), (0.6, 0.4, 0.34), "#a46e40", bevel=0.02, parent=root)
    for x in (-0.22, 0.22):
        obox(L, f"chest_band{x}", c + Vector((x, 0, 0.18)), (0.05, 0.415, 0.345), "#e0b04a", outline=False, parent=root)
    obox(L, "chest_lock", c + Vector((0, -0.21, 0.33)), (0.1, 0.03, 0.12), "#ffd36b", parent=root)
    hinge = empty("chest_hinge", c + Vector((0, 0.2, 0.35))); par(hinge, root)
    put("chest_lid", tube(c + Vector((-0.3, 0, 0.35)), c + Vector((0.3, 0, 0.35)), 0.2, 0.2, segs=16), "#b57a45", L, smooth=True, parent=hinge)
    for x in (-0.22, 0.22):
        put(f"chest_lidband{x}", tube(c + Vector((x - 0.025, 0, 0.35)), c + Vector((x + 0.025, 0, 0.35)), 0.205, 0.205, segs=16),
            "#e0b04a", L, outline=False, smooth=True, parent=hinge)
    # glow layer: a thin line of light in the seam, the light inside, a glint on the bands
    seam = empty("chest_seam", c + Vector((0, -0.1, 0.35))); par(seam, root)
    obox(G, "chest_seamlight", c + Vector((0, -0.205, 0.352)), (0.6, 0.012, 0.022), M("#fff3c4", True), outline=False, parent=seam)
    inside = empty("chest_inside", c + Vector((0, 0, 0.36))); par(inside, root)
    oell(G, "chest_light", c + Vector((0, 0, 0.36)), (0.27, 0.17, 0.1), M("#fff6c8", True), outline=False, parent=inside)
    oell(G, "chest_aura", c + Vector((0, 0, 0.38)), (0.4, 0.27, 0.05), M("#ffe48a", True), outline=False, parent=inside)
    glint = empty("chest_glint", c + Vector((-0.22, -0.22, 0.2))); par(glint, root)
    put("chest_glintstar", star_bm(0.06, 0.3), M("#fffbe8", True), G, outline=False, parent=glint)
    # fx layer: the light beam, 5 stars and 6 sparkles
    beam = empty("chest_beam", c + Vector((0, 0, 0.36)))
    otube(X, "chest_beamcore", c + Vector((0, 0, 0.36)), c + Vector((0, 0, 1.9)), 0.1, 0.035, glow_mat("BEAMCORE", "#fffdf0", 0.85), segs=16, outline=False, parent=beam)
    otube(X, "chest_beamedge", c + Vector((0, 0.02, 0.36)), c + Vector((0, 0.02, 1.9)), 0.22, 0.07, glow_mat("BEAMEDGE", "#ffeaa0", 0.5), segs=16, outline=False, parent=beam)
    stars, sparks = [], []
    for k in range(5):
        e = empty(f"chest_starpiv{k}", c + Vector((0, -0.05, 0.4)))
        put(f"chest_star{k}", star_bm(0.12 if k % 2 else 0.095), "#ffd36b", X, parent=e)
        stars.append(e)
    for k in range(6):
        e = empty(f"chest_sparkpiv{k}", c + Vector((0, -0.05, 0.4)))
        put(f"chest_spark{k}", star_bm(0.055, 0.28), M("#fffbe8", True), X, outline=False, parent=e)
        sparks.append(e)
    # the star and glint meshes are built at the origin: let them follow their empty exactly
    for e in stars + sparks + [glint]:
        for ch in e.children: ch.matrix_parent_inverse = Matrix.Identity(4)
    CL = (-35, 0, 0)   # stars face the camera
    def lid(f, ang): kf(hinge, f, rot=(-ang, 0, 0))
    # --- closed idle 1-12: still, a glint slides down a band on frames 3-8
    for f in range(1, 13):
        kf(root, f, loc=c, rot=(0, 0, 0), sc=(1, 1, 1)); lid(f, 0)
        kf(seam, f, sc=0); kf(inside, f, sc=0); kf(beam, f, sc=0)
        t = (f - 3) / 5          # glint slides down the left gold band on frames 3-8 (world position: the parent inverse cancels the root)
        on = 0 <= t <= 1
        kf(glint, f, loc=c + Vector((-0.22, -0.23, 0.33 - 0.26 * (t if on else 0))), rot=CL, sc=(math.sin(math.pi * t) * 1.3 if on else 0))
        for e in stars + sparks: kf(e, f, sc=0)
    # --- opening 13-42
    F0 = 13
    for i in range(30):
        f = F0 + i
        wig = 0.0; hop = 0.0; ang = 0.0; sq = (1, 1, 1)
        if i < 12:                       # anticipation: wiggles growing, lid rattles, light leaks from the seam
            g = (i + 1) / 12
            wig = 5 * g * math.sin(i * 2.2); hop = 0.025 * g * abs(math.sin(i * 1.7)); ang = 3 * g * abs(math.sin(i * 2.9))
            kf(seam, f, sc=(1, 1, 0.3 + 1.7 * g)); kf(inside, f, sc=0); kf(beam, f, sc=0)
        else:
            j = i - 12                   # 0..17
            ang = [60, 112, 118, 108, 104, 106][j] if j < 6 else 105
            sq = [(1.08, 1.08, 0.88), (0.95, 0.95, 1.08), (1.02, 1.02, 0.98)][j] if j < 3 else (1, 1, 1)
            kf(seam, f, sc=0)
            pulse = 1 + 0.35 * math.exp(-((j - 4) / 3.0) ** 2)
            kf(inside, f, sc=min(1, (j + 1) / 2) * pulse)
            bw = [0.5, 1.0, 1.15, 1.1, 1.0, 0.9, 0.8, 0.68, 0.56, 0.45, 0.34, 0.24, 0.15, 0.08, 0.0, 0, 0, 0][j]
            bh = [0.45, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.98, 0.95, 0.9, 0.85, 0.8, 0.8, 0.8, 0.8][j]
            kf(beam, f, sc=(max(bw, 1e-4), max(bw, 1e-4), max(bh, 1e-4)))
        kf(root, f, loc=c + Vector((0, 0, hop)), rot=(0, wig, 0), sc=sq); lid(f, ang)
        kf(glint, f, sc=0, rot=CL)
        for k, e in enumerate(stars):       # stars burst up and out, spin, twinkle away
            j = i - 13 - k * 0.6
            if j < 0 or j > 14: kf(e, f, sc=0, rot=CL); continue
            u = j / 14; a = (k - 2) * 0.17
            kf(e, f, loc=c + Vector((a * (0.4 + 1.2 * u), -0.15, 0.55 + 1.5 * u - 0.4 * u * u)), rot=(-35, 0, 140 * u * (1 if k % 2 else -1)),
               sc=(1.0 - u ** 3) * min(1, j / 1.5))
        for k, e in enumerate(sparks):
            j = i - 14 - k
            if j < 0 or j > 10: kf(e, f, sc=0, rot=CL); continue
            u = j / 10; a = ((k * 37) % 11 - 5) / 5
            kf(e, f, loc=c + Vector((a * 0.35, -0.2, 0.5 + 1.0 * u)), rot=CL, sc=math.sin(math.pi * u) * (1.2 if k % 2 else 0.9))
    # --- open idle 43-54: soft glow breathing, two twinkles
    for i in range(12):
        f = 43 + i; ph = 2 * math.pi * i / 12
        kf(root, f, loc=c, rot=(0, 0, 0), sc=(1, 1, 1)); lid(f, 105); kf(seam, f, sc=0); kf(beam, f, sc=0)
        kf(inside, f, sc=1.0 + 0.08 * math.sin(ph)); kf(glint, f, sc=0, rot=CL)
        for e in stars: kf(e, f, sc=0)
        for k, e in enumerate(sparks):
            if k < 3:
                u = ((i + 4 * k) % 12) / 12
                kf(e, f, loc=c + Vector(((k - 1) * 0.18, -0.15, 0.5 + 0.35 * u)), rot=CL, sc=math.sin(math.pi * u) * 0.9)
            else: kf(e, f, sc=0)
    for o in bpy.data.objects:
        if o.animation_data and o.animation_data.action and o.name.startswith("chest_"):
            for fc in o.animation_data.action.fcurves:
                for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
    common = dict(group="chest", anchor=[0.5, 1])
    lays = [L, G, X]
    target("chest-closed", lays, [-0.3, 0, 1.3, 1.2], 0.8, frames=[1, 12], fps=12, loop=True,
           note="closed chest idle loop (1 s at 12 fps): a glint slides down the gold bands. Layers bottom to top: chest, chest-glow, chest-fx", **common)
    target("chest-open", lays, [-0.3, 0, 1.3, 1.2], 2.3, frames=[13, 42], fps=12,
           keyFrames={"anticipation": "0-11", "lidBurst": 12, "beamPeak": 14, "starsRise": "13-29", "glowPulse": 16, "settled": 29},
           note="opening, once (2.5 s at 12 fps), then play chest-opened. 0-11 wiggle and light in the seams (a rising sound), 12 the lid bursts open (pop / chime), 12-25 the light beam fades, 13-29 stars and sparkles rise", **common)
    target("chest-opened", lays, [-0.3, 0, 1.3, 1.2], 2.3, frames=[43, 54], fps=12, loop=True,
           note="open chest idle loop (1 s at 12 fps): soft shimmering light and twinkles. Same size and anchor as chest-open, so it follows seamlessly", **common)
chest()

# ------------------------------------------------------------------ rest shrine with a gentle glow loop
def shrine():
    lay, gl = "shrine", "shrine-glow"; c = grid(0.5, 0.55)
    obox(lay, "sh_step", c + Vector((0, 0, 0.05)), (0.8, 0.6, 0.1), "#a8875a", bevel=0.02)
    obox(lay, "sh_base", c + Vector((0, 0, 0.17)), (0.6, 0.45, 0.14), "#c9a06a", bevel=0.02)
    for x in (-0.22, 0.22):
        obox(lay, f"sh_post{x}", c + Vector((x, -0.1, 0.45)), (0.06, 0.06, 0.42), "#b8322a")
        obox(lay, f"sh_postb{x}", c + Vector((x, 0.12, 0.45)), (0.06, 0.06, 0.42), "#b8322a")
    for k in range(4): otube(lay, f"sh_thatch{k}", c + Vector((-0.4 + k * 0.27, -0.05, 0.69)), c + Vector((-0.4 + k * 0.27, -0.05, 0.72)), 0.02, 0.02, M("#5a8a3c", True), outline=False)
    obox(lay, "sh_back", c + Vector((0, 0.13, 0.45)), (0.44, 0.03, 0.42), "#c9a06a")
    put("sh_roof", tube(c + Vector((0, 0, 0.66)), c + Vector((0, 0, 0.86)), 0.42, 0.08, segs=4), "#6f9e48", lay)
    oell(lay, "sh_top", c + Vector((0, 0, 0.88)), (0.05, 0.05, 0.05), "#d9a441")
    otube(lay, "sh_dish", c + Vector((0, -0.02, 0.24)), c + Vector((0, -0.02, 0.29)), 0.11, 0.14, "#d9a441", segs=14)
    # glow layer: a warm floating orb in the shrine and a soft ring on the step; it gently swells (loop)
    piv = empty("sh_glowpiv", c + Vector((0, -0.02, 0.42)))
    oell(gl, "sh_orb", c + Vector((0, -0.02, 0.42)), (0.09, 0.09, 0.09), M("#fff6c8", True), outline=False, parent=piv)
    oell(gl, "sh_halo", c + Vector((0, -0.02, 0.42)), (0.15, 0.03, 0.15), M("#ffe9a0", True), outline=False, parent=piv)
    ring = empty("sh_ringpiv", c + Vector((0, 0, 0.105)))
    put("sh_ring", ellipsoid(c + Vector((0, 0, 0.102)), (0.36, 0.27, 0.004), segs=24, rings=4), M("#ffe9a0", True), gl, outline=False, parent=ring)
    for f in range(1, 9):
        b = 0.5 - 0.5 * math.cos(2 * math.pi * (f - 1) / 8)
        piv.scale = (1 + 0.25 * b,) * 3; piv.location = c + Vector((0, -0.02, 0.42 + 0.025 * b))
        piv.keyframe_insert("scale", frame=f); piv.keyframe_insert("location", frame=f)
        ring.scale = (0.85 + 0.2 * b, 0.85 + 0.2 * b, 1); ring.keyframe_insert("scale", frame=f)
    target("shrine", [lay, gl], [-0.15, 0, 1.15, 1.1], 1.0, anchor=[0.5, 1], frames=[1, 8], fps=8, loop=True, group="shrine",
           note="the rest shrine for an 'S' spot: shrine layer (still; every frame is the same) + shrine-glow layer (8-frame loop at 8 fps = 1 s, a gentle swell). The game can also pulse shrine-glow's alpha")
shrine()

# ------------------------------------------------------------------ decor (Bamboo Garden Hall): paper lantern, potted bamboo, stone basin
def decor_lantern():
    lay = "decor-lantern"; c = grid(0.5, 0.55)
    obox(lay, lay + "_foot", c + Vector((0, 0, 0.04)), (0.36, 0.36, 0.08), "#a46e40", bevel=0.02)
    otube(lay, lay + "_pole", c + Vector((0, 0, 0.08)), c + Vector((0, 0, 0.55)), 0.04, 0.04, "#8cbf5e", segs=10)
    oell(lay, lay + "_paper", c + Vector((0, 0, 0.78)), (0.2, 0.2, 0.26), "#ffe7b0", segs=18, rings=12)
    for z in (0.62, 0.94):
        otube(lay, f"{lay}_rim{z}", c + Vector((0, 0, z - 0.02)), c + Vector((0, 0, z + 0.02)), 0.12, 0.12, "#a46e40", segs=14)
    for z in (0.7, 0.78, 0.86):
        put(f"{lay}_rib{z}", ellipsoid(c + Vector((0, 0, z)), (0.203, 0.203, 0.006), segs=18, rings=4), M("#e8b86a", True), lay, outline=False)
    oell(lay, lay + "_tassel", c + Vector((0, 0, 0.55)), (0.03, 0.03, 0.05), "#c8553d")
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], 1.1, anchor=[0.5, 1], group="decor", note="paper lantern on a bamboo stand (blocks 1 cell, like a pillar)")
def decor_bamboo_pot():
    lay = "decor-bamboo-pot"; c = grid(0.5, 0.55)
    otube(lay, lay + "_pot", c + Vector((0, 0, 0.0)), c + Vector((0, 0, 0.3)), 0.22, 0.28, "#5a8fb0", segs=18)
    otube(lay, lay + "_soil", c + Vector((0, 0, 0.3)), c + Vector((0, 0, 0.31)), 0.25, 0.25, M("#7a5232", True), segs=18, outline=False)
    for k, (dx, dy, h) in enumerate(((-0.08, 0.04, 1.2), (0.09, 0.02, 1.0), (0.0, -0.08, 0.8))):
        p = c + Vector((dx, dy, 0.3))
        otube(lay, f"{lay}_st{k}", p, p + Vector((dx * 0.4, 0, h)), 0.035, 0.03, "#8cbf5e", segs=8)
        for j in range(2):
            q = p + Vector((dx * 0.4, 0, h * (0.6 + 0.35 * j)))
            for sx in (-1, 1):
                oell(lay, f"{lay}_lf{k}{j}{sx}", q + Vector((sx * 0.1, -0.02, 0.0)), (0.11, 0.02, 0.03), "#6cc46f", rot=(0, sx * -25, 0))
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], 1.75, anchor=[0.5, 1], group="decor", note="potted bamboo (blocks 1 cell)")
def decor_basin():
    lay = "decor-basin"; c = grid(0.5, 0.55)
    otube(lay, lay + "_stone", c, c + Vector((0, 0, 0.26)), 0.3, 0.34, "#bdb6a6", segs=18)
    otube(lay, lay + "_water", c + Vector((0, 0, 0.26)), c + Vector((0, 0, 0.265)), 0.25, 0.25, M("#8fd0e8", True), segs=18, outline=False)
    oell(lay, lay + "_shine", c + Vector((-0.08, 0.05, 0.268)), (0.08, 0.04, 0.003), M("#d8f2fa", True), outline=False)
    otube(lay, lay + "_spout", c + Vector((0.42, 0.05, 0.42)), c + Vector((0.12, 0.0, 0.36)), 0.035, 0.035, "#8cbf5e", segs=8)
    otube(lay, lay + "_spoutpost", c + Vector((0.42, 0.06, 0.0)), c + Vector((0.42, 0.06, 0.46)), 0.04, 0.04, "#8cbf5e", segs=8)
    for k in range(3):
        oell(lay, f"{lay}_peb{k}", c + Vector((-0.3 + k * 0.12, -0.32, 0.02)), (0.05, 0.04, 0.025), "#9fb07a", outline=False)
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], 0.6, anchor=[0.5, 1], group="decor", note="stone water basin with a bamboo spout (blocks 1 cell)")
decor_lantern(); decor_bamboo_pot(); decor_basin()

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
