"""Dojo Ascent - A6 decoration samples for the S7-rev pool (PR #73). 6 samples, Home Dojo decor style.
Helpers copied from home-dojo/source/build_home_dojo.py; same camera, 80 px tiles, footprint/place metadata.
    blender -b -P incoming-art/decor-pool-a6/source/build_decor_a6.py -- --out /tmp/a6.blend
    blender -b /tmp/a6.blend -P incoming-art/tools/render_static.py -- --out incoming-art/decor-pool-a6/sprites
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box, OUTLINE_W

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True)
A = ap.parse_args(argv)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene; scene.name = "HomeDojo"
K = 1 / math.sin(math.radians(35))
random.seed(7)

def grid(c, r, z=0.0):
    return Vector((c, -r * K, z))

_mats = {}
def M(hex_color, flat=False):
    key = (hex_color, flat)
    if key not in _mats:
        _mats[key] = toon_material(("F" if flat else "M") + hex_color, hex_color, *((1.0, 1.0) if flat else ()))
    return _mats[key]
OUTLINE = outline_material()

COLL = {}
def layer(name):
    if name not in COLL:
        c = bpy.data.collections.new("L_" + name); scene.collection.children.link(c); COLL[name] = c
    return COLL[name]

def put(name, bm, color, lay, outline=True, flat=False, smooth=False):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = smooth
    bm.to_mesh(me); bm.free(); me.materials.append(M(color, flat) if isinstance(color, str) else color)
    ob = bpy.data.objects.new(name, me); layer(lay).objects.link(ob)
    if outline: add_hull(ob, layer(lay), OUTLINE, OUTLINE_W)
    return ob

def gbox(lay, name, c0, r0, c1, r1, z0, z1, color, outline=True, bevel=0.0, flat=False):
    """Box on the grid: columns c0..c1, rows r0..r1 (stretched depth), heights z0..z1 (tiles)."""
    a, b = grid(c0, r1, z0), grid(c1, r0, z1)
    ctr = (a + b) / 2; sz = Vector((abs(b.x - a.x), abs(b.y - a.y), abs(b.z - a.z)))
    return put(name, box(ctr, sz, bevel=bevel), color, lay, outline, flat)

def obox(lay, name, center, size, color, rot=(0, 0, 0), outline=True, bevel=0.0, smooth=False):
    """Box with true (unstretched) size, centred on a world point."""
    return put(name, box(center, size, rot=rot, bevel=bevel), color, lay, outline, smooth=smooth)

def otube(lay, name, p0, p1, r0, r1, color, segs=12, outline=True, sx=1, sy=1):
    return put(name, tube(p0, p1, r0, r1, segs=segs, sx=sx, sy=sy), color, lay, outline, smooth=True)

def oell(lay, name, c, s, color, rot=(0, 0, 0), outline=True, flat=False, segs=14, rings=8):
    return put(name, ellipsoid(c, s, rot=rot, segs=segs, rings=rings), color, lay, outline, flat, smooth=True)

TARGETS = []
def target(name, layers, rect, top, anchor="bottom-center", **kw):
    TARGETS.append(dict(name=name, layers=layers, rect=rect, top=top, anchor=anchor, **kw))

# ======================================================================= ROOM

# ================================================================= A6 decoration samples (S7-rev pool)
WF = 1.0
def deco(lay, w, h, place, top, build, info):
    build(lay, w, h)
    if place == "wall":
        target(lay, [lay], [0, 0, w, 1], top, anchor=[w / 2, 1], footprint=[w, h], place="wall", group="decor-a6", info=info,
               note="wall item: anchorPx = bottom-centre of its top-wall cell (where the wall meets the floor)")
    else:
        target(lay, [lay], [-0.15, 0, w + 0.15, h + 0.12], top, anchor=[w / 2, h], footprint=[w, h], place="floor", group="decor-a6",
               info=info, note="anchorPx = bottom-centre of the footprint; sort by the footprint's bottom row")

WOOD_D, WOOD, WOOD_L, GREEN, LEAF, STONE = "#6b4428", "#a46e40", "#c99a62", "#8cbf5e", "#6cc46f", "#bdb6a6"

# 1. class piece, wall: shared class-scroll design (mount colour = the swap slot), a painted sun over two hills; no writing
def class_scroll(mount):
    def b(lay, w, h):
        x = w / 2; zc = 0.82; y = grid(x, WF, 0).y - 0.03
        obox(lay, lay + "_mount", Vector((x, y, zc)), (0.44, 0.02, 0.95), mount)
        obox(lay, lay + "_paper", Vector((x, y - 0.012, zc - 0.02)), (0.32, 0.01, 0.7), M("#f6efdc", True), outline=False)
        obox(lay, lay + "_rodtop", Vector((x, y - 0.02, zc + 0.49)), (0.48, 0.035, 0.035), WOOD_D)
        obox(lay, lay + "_rodbot", Vector((x, y - 0.02, zc - 0.49)), (0.52, 0.045, 0.045), WOOD_D)
        obox(lay, lay + "_cord", Vector((x, y - 0.02, zc + 0.58)), (0.02, 0.01, 0.16), "#d9a441", outline=False)
        put(lay + "_sun", ellipsoid(Vector((x + 0.05, y - 0.02, zc + 0.14)), (0.075, 0.004, 0.075), segs=20, rings=6), M("#f2a93b", True), lay, outline=False)
        for k, (dx, s) in enumerate(((-0.06, 0.13), (0.07, 0.10))):
            put(f"{lay}_hill{k}", ellipsoid(Vector((x + dx, y - 0.021 - k * 0.001, zc - 0.2)), (s, 0.004, s * 0.9), segs=20, rings=6),
                M(["#4f8a4a", "#7fbf6f"][k], True), lay, outline=False)
        obox(lay, lay + "_mask", Vector((x, y - 0.025, zc - 0.31)), (0.32, 0.006, 0.2), M("#f6efdc", True), outline=False)
    return b

# 2. class piece, floor: kid-size kick target pad on a wooden stand
def kick_pad(lay, w, h):
    c = grid(0.5, 0.5)
    obox(lay, lay + "_base", c + Vector((0, 0, 0.04)), (0.5, 0.36, 0.08), WOOD, bevel=0.02)
    otube(lay, lay + "_post", c + Vector((0, 0, 0.08)), c + Vector((0, 0, 0.62)), 0.045, 0.045, WOOD_D, segs=10)
    obox(lay, lay + "_pad", c + Vector((0, -0.05, 0.78)), (0.42, 0.14, 0.5), "#3a6ea5", bevel=0.06)
    put(lay + "_ring", ellipsoid(c + Vector((0, -0.125, 0.8)), (0.13, 0.004, 0.13), segs=20, rings=6), M("#f6efdc", True), lay, outline=False)
    put(lay + "_dot", ellipsoid(c + Vector((0, -0.127, 0.8)), (0.06, 0.004, 0.06), segs=16, rings=6), M("#fad628", True), lay, outline=False)
    for z in (0.6, 0.96):
        obox(lay, f"{lay}_strap{z}", c + Vector((0, -0.12, z)), (0.44, 0.012, 0.035), M("#2b4f7a", True), outline=False)

# 3. first floor clear: a round stone keeper statue on a plinth (friendly, eyes closed in a smile)
def keeper_statue(lay, w, h):
    c = grid(0.5, 0.5)
    obox(lay, lay + "_plinth", c + Vector((0, 0, 0.12)), (0.56, 0.5, 0.24), "#9e978a", bevel=0.03)
    obox(lay, lay + "_plinthtop", c + Vector((0, 0, 0.26)), (0.6, 0.54, 0.05), "#b1aa9c", bevel=0.01)
    oell(lay, lay + "_body", c + Vector((0, 0.02, 0.5)), (0.2, 0.17, 0.22), STONE)
    oell(lay, lay + "_head", c + Vector((0, -0.03, 0.82)), (0.19, 0.16, 0.16), STONE)
    for sx in (-1, 1):
        oell(lay, f"{lay}_ear{sx}", c + Vector((sx * 0.14, -0.01, 0.95)), (0.06, 0.04, 0.06), STONE)
        oell(lay, f"{lay}_paw{sx}", c + Vector((sx * 0.1, -0.15, 0.32)), (0.06, 0.06, 0.04), STONE)
        obox(lay, f"{lay}_eye{sx}", c + Vector((sx * 0.065, -0.19, 0.85)), (0.05, 0.005, 0.012), M("#4a4652", True), outline=False)
    oell(lay, lay + "_scarf", c + Vector((0, -0.04, 0.68)), (0.19, 0.14, 0.05), "#1ebace")
    obox(lay, lay + "_scarftail", c + Vector((0.08, -0.17, 0.6)), (0.07, 0.02, 0.12), "#1ebace", rot=(0, -12, 0))
    oell(lay, lay + "_moss", c + Vector((-0.18, -0.2, 0.27)), (0.08, 0.05, 0.02), "#9fb07a", outline=False)

# 4. Monster Journal trophy: a little round monster figurine on a wooden trophy stand
def journal_trophy(lay, w, h):
    c = grid(0.5, 0.5)
    obox(lay, lay + "_base", c + Vector((0, 0, 0.07)), (0.46, 0.4, 0.14), WOOD_D, bevel=0.02)
    obox(lay, lay + "_base2", c + Vector((0, 0, 0.18)), (0.36, 0.3, 0.08), WOOD, bevel=0.015)
    obox(lay, lay + "_plate", c + Vector((0, -0.206, 0.075)), (0.22, 0.01, 0.07), M("#d9a441", True), outline=False)
    oell(lay, lay + "_blob", c + Vector((0, 0, 0.47)), (0.27, 0.22, 0.26), "#3cc896")
    oell(lay, lay + "_belly", c + Vector((0, -0.14, 0.42)), (0.16, 0.09, 0.14), "#a7ecc9", outline=False)
    for sx in (-1, 1):
        oell(lay, f"{lay}_eyew{sx}", c + Vector((sx * 0.09, -0.19, 0.57)), (0.06, 0.02, 0.065), M("#ffffff", True), outline=False)
        oell(lay, f"{lay}_eyep{sx}", c + Vector((sx * 0.09, -0.205, 0.565)), (0.03, 0.01, 0.036), M("#1d1a24", True), outline=False)
        oell(lay, f"{lay}_horn{sx}", c + Vector((sx * 0.13, 0, 0.74)), (0.045, 0.045, 0.08), "#fad628", rot=(0, sx * -20, 0))

# 5. random bonus piece: a paper fan on a stand (one of 2 colours; this is colour 1)
def fan_stand(lay, w, h):
    c = grid(0.5, 0.5)
    obox(lay, lay + "_foot", c + Vector((0, 0, 0.04)), (0.4, 0.22, 0.08), WOOD, bevel=0.02)
    otube(lay, lay + "_post", c + Vector((0, 0, 0.08)), c + Vector((0, 0, 0.32)), 0.03, 0.03, WOOD_D, segs=8)
    piv = c + Vector((0, -0.02, 0.34))
    for k in range(9):
        a = math.radians(-70 + k * 17.5)
        d = Vector((math.sin(a), 0, math.cos(a)))
        otube(lay, f"{lay}_rib{k}", piv, piv + d * 0.46, 0.008, 0.008, WOOD_D, segs=6, outline=False)
    for k in range(8):
        a = math.radians(-61.25 + k * 17.5); d = Vector((math.sin(a), 0, math.cos(a)))
        col = ["#5ab4e6", "#9fd6f2"][k % 2]
        obox(lay, f"{lay}_leaf{k}", piv + d * 0.32 + Vector((0, -0.01, 0)), (0.13, 0.008, 0.28), M(col, True),
             rot=(0, math.degrees(a), 0), outline=False)
    oell(lay, lay + "_pin", piv + Vector((0, -0.02, 0)), (0.03, 0.02, 0.03), "#d9a441")

# 6. random bonus piece, 2 x 1: a folding screen with a pine-and-cloud picture (shows the bigger size)
def folding_screen(lay, w, h):
    for k in range(4):
        x0 = 0.15 + k * 0.425; ang = 12 if k % 2 == 0 else -12
        cx = x0 + 0.21; c = grid(cx, 0.55 + (0.04 if k % 2 else -0.04))
        obox(lay, f"{lay}_frame{k}", c + Vector((0, 0, 0.6)), (0.42, 0.05, 1.12), WOOD_D, rot=(0, 0, ang))
        obox(lay, f"{lay}_panel{k}", c + Vector((0, -0.03, 0.62)), (0.34, 0.01, 0.98), M("#f3e6c4", True), rot=(0, 0, ang), outline=False)
    # picture: a soft green hill line and a cloud across the panels
    for k in range(4):
        x0 = 0.15 + k * 0.425; ang = 12 if k % 2 == 0 else -12
        c = grid(x0 + 0.21, 0.55 + (0.04 if k % 2 else -0.04))
        obox(lay, f"{lay}_hill{k}", c + Vector((0, -0.037, 0.3 + 0.06 * math.sin(k * 1.4))), (0.34, 0.004, 0.3), M("#7fbf6f", True), rot=(0, 0, ang), outline=False)
        if k in (1, 2):
            oell(lay, f"{lay}_cloud{k}", c + Vector((0, -0.04, 0.88)), (0.13, 0.004, 0.05), M("#ffffff", True), rot=(0, 0, ang), outline=False)
        if k == 0:
            put(f"{lay}_sun", ellipsoid(c + Vector((0, -0.04, 0.85)), (0.07, 0.004, 0.07), segs=18, rings=6), M("#f2a93b", True), lay, outline=False)

deco("decor-a6-class-scroll", 1, 1, "wall", 0.6, class_scroll("#4f8a4a"), {"source": "class piece (S7-rev A)", "swap": "scroll mount colour"})
deco("decor-a6-kick-pad", 1, 1, "floor", 1.2, kick_pad, {"source": "class piece, dojo gear (S7-rev A)"})
deco("decor-a6-keeper-statue", 1, 1, "floor", 1.15, keeper_statue, {"source": "first floor clear (S7-rev B)"})
deco("decor-a6-journal-trophy", 1, 1, "floor", 1.0, journal_trophy, {"source": "Monster Journal trophy (S7-rev C)"})
deco("decor-a6-fan-stand", 1, 1, "floor", 0.9, fan_stand, {"source": "random bonus pool, colour 1 of 2"})
deco("decor-a6-folding-screen", 2, 1, "floor", 1.3, folding_screen, {"source": "random bonus pool, colour 1 of 2"})

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
