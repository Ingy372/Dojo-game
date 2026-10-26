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

# ================================================================= A6 full Tier 1 decor set
WF = 1.0
WOOD_D, WOOD, WOOD_L, GREEN, LEAF, STONE, STONE_D = "#6b4428", "#a46e40", "#c99a62", "#8cbf5e", "#6cc46f", "#bdb6a6", "#9e978a"
TINT = "#f0f0f0"           # neutral light grey: the game multiplies the -tint layer by a colour
BELTS = {"White": "#f4f1ea", "Yellow": "#f5d22e", "Orange": "#f08a24"}

def emit(name, layers, w, h, place, top, info, wall_rule=False):
    if place == "wall":
        target(name, layers, [0, 0, w, 1], top, anchor=[w / 2, 1], footprint=[w, h], place="wall", group="decor-t1", info=info,
               note="wall item: anchorPx = bottom-centre of its top-wall cell (where the wall meets the floor)")
    else:
        kw = dict(mustTouchWall=True) if wall_rule else {}
        target(name, layers, [-0.15, 0, w + 0.15, h + 0.12], top, anchor=[w / 2, h], footprint=[w, h], place="floor", group="decor-t1",
               info=info, note=("must sit against a wall: the footprint's top row is the row just below the top wall (row 1). " if wall_rule else "")
               + "anchorPx = bottom-centre of the footprint; sort by the footprint's bottom row", **kw)

def disc(lay, name, c, r, color, y=0.004):   # flat round shape facing the camera
    put(name, ellipsoid(c, (r[0], y, r[1]) if isinstance(r, tuple) else (r, y, r), segs=20, rings=6), M(color, True), lay, outline=False)

# ---------------------------------------------------------------- CLASS PIECES: 7 scrolls (one model; mount colour + picture swap, no writing)
def scroll_base(lay, mount):
    x = 0.5; zc = 0.82; y = grid(x, WF, 0).y - 0.03
    obox(lay, lay + "_mount", Vector((x, y, zc)), (0.44, 0.02, 0.95), mount)
    obox(lay, lay + "_paper", Vector((x, y - 0.012, zc - 0.02)), (0.32, 0.01, 0.7), M("#f6efdc", True), outline=False)
    obox(lay, lay + "_rodtop", Vector((x, y - 0.02, zc + 0.49)), (0.48, 0.035, 0.035), WOOD_D)
    obox(lay, lay + "_rodbot", Vector((x, y - 0.02, zc - 0.49)), (0.52, 0.045, 0.045), WOOD_D)
    obox(lay, lay + "_cord", Vector((x, y - 0.02, zc + 0.58)), (0.02, 0.01, 0.16), "#d9a441", outline=False)
    return Vector((x, y - 0.02, zc))
def pic_sun_hills(lay, p):
    disc(lay, lay + "_sun", p + Vector((0.05, 0, 0.14)), 0.075, "#f2a93b")
    disc(lay, lay + "_h0", p + Vector((-0.06, -0.001, -0.2)), (0.13, 0.12), "#4f8a4a"); disc(lay, lay + "_h1", p + Vector((0.07, -0.002, -0.2)), (0.1, 0.09), "#7fbf6f")
def pic_moon_clouds(lay, p):
    disc(lay, lay + "_moon", p + Vector((-0.04, 0, 0.12)), 0.08, "#f5d86a"); disc(lay, lay + "_bite", p + Vector((-0.0, -0.001, 0.14)), 0.07, "#f6efdc")
    for k, (dx, dz, s) in enumerate(((0.04, -0.1, 0.07), (-0.05, -0.14, 0.06), (0.0, -0.16, 0.08))):
        disc(lay, f"{lay}_cl{k}", p + Vector((dx, -0.002, dz)), (s * 1.4, s * 0.6), "#a9c6e0")
def pic_bamboo(lay, p):
    for k, dx in enumerate((-0.07, 0.0, 0.07)):
        for j in range(4):
            obox(lay, f"{lay}_seg{k}{j}", p + Vector((dx, -0.002, -0.26 + j * 0.13 + k * 0.02)), (0.025, 0.004, 0.11), M("#5fa65a", True), outline=False)
        disc(lay, f"{lay}_lf{k}", p + Vector((dx + 0.04, -0.003, 0.15 - k * 0.05)), (0.05, 0.015), "#7fbf6f")
def pic_blossom(lay, p):
    obox(lay, lay + "_branch", p + Vector((-0.01, -0.001, -0.02)), (0.022, 0.004, 0.5), M("#6b4428", True), rot=(0, 25, 0), outline=False)
    for k, (dx, dz) in enumerate(((0.06, 0.15), (-0.06, -0.12), (0.02, 0.0), (0.09, 0.05), (-0.04, 0.1))):
        disc(lay, f"{lay}_fl{k}", p + Vector((dx, -0.003, dz)), 0.035, "#f6a7c8"); disc(lay, f"{lay}_c{k}", p + Vector((dx, -0.004, dz)), 0.012, "#f5d86a")
def pic_waves(lay, p):
    for k in range(3):
        for j in range(3):
            disc(lay, f"{lay}_w{k}{j}", p + Vector((-0.1 + j * 0.1, -0.001 - k * 0.001, -0.2 + k * 0.11)), (0.05, 0.035), ["#3a6ea5", "#5ab4e6", "#9fd6f2"][k])
            disc(lay, f"{lay}_f{k}{j}", p + Vector((-0.1 + j * 0.1, -0.002 - k * 0.001, -0.21 + k * 0.11)), (0.035, 0.022), "#f6efdc")
    disc(lay, lay + "_sun", p + Vector((0.06, 0, 0.16)), 0.05, "#f2a93b")
def pic_peak(lay, p):
    put(lay + "_peak", tube(p + Vector((0, -0.001, -0.25)), p + Vector((0, -0.001, 0.12)), 0.16, 0.0, segs=3, sy=0.03), M("#7d7aa8", True), lay, outline=False)
    put(lay + "_snow", tube(p + Vector((0, -0.006, 0.0)), p + Vector((0, -0.006, 0.12)), 0.055, 0.0, segs=3, sy=0.03), M("#ffffff", True), lay, outline=False)
    disc(lay, lay + "_cloud", p + Vector((0.07, -0.01, -0.06)), (0.08, 0.025), "#ffffff")
def pic_koi(lay, p):
    for k, (dx, dz, col) in enumerate(((-0.04, 0.08, "#f08a24"), (0.05, -0.12, "#f5d22e"))):
        disc(lay, f"{lay}_body{k}", p + Vector((dx, -0.002, dz)), (0.05, 0.09), col)
        put(f"{lay}_tail{k}", tube(p + Vector((dx, -0.002, dz - 0.07)), p + Vector((dx, -0.002, dz - 0.14)), 0.0, 0.045, segs=3, sy=0.03), M(col, True), lay, outline=False)
        disc(lay, f"{lay}_eye{k}", p + Vector((dx - 0.02, -0.003, dz + 0.05)), 0.01, "#1d1a24")
    for k in range(3): disc(lay, f"{lay}_rip{k}", p + Vector((0.08 - k * 0.06, -0.001, 0.2 - k * 0.04)), (0.03, 0.006), "#9fd6f2")
SCROLLS = [("sun-hills", "#4f8a4a", pic_sun_hills), ("moon-clouds", "#34406e", pic_moon_clouds), ("bamboo", "#2f8f87", pic_bamboo),
           ("blossom", "#b3678f", pic_blossom), ("waves", "#3a6ea5", pic_waves), ("peak", "#6b5a9e", pic_peak), ("koi", "#c77a2e", pic_koi)]
for k, (nm, mount, pic) in enumerate(SCROLLS):
    lay = f"decor-t1-scroll-{nm}"; p = scroll_base(lay, mount); pic(lay, p)
    emit(lay, [lay], 1, 1, "wall", 0.6, {"pool": "class", "set": "class scroll", "order": k + 1, "mount": mount})

# ---------------------------------------------------------------- CLASS PIECES: 6 gear pieces
C = grid(0.5, 0.5)
def kick_pad(lay):
    c = C
    obox(lay, lay + "_base", c + Vector((0, 0, 0.04)), (0.5, 0.36, 0.08), WOOD, bevel=0.02)
    otube(lay, lay + "_post", c + Vector((0, 0, 0.08)), c + Vector((0, 0, 0.62)), 0.045, 0.045, WOOD_D, segs=10)
    obox(lay, lay + "_pad", c + Vector((0, -0.05, 0.78)), (0.42, 0.14, 0.5), "#3a6ea5", bevel=0.06)
    disc(lay, lay + "_ring", c + Vector((0, -0.125, 0.8)), 0.13, "#f6efdc"); disc(lay, lay + "_dot", c + Vector((0, -0.127, 0.8)), 0.06, "#fad628")
    for z in (0.6, 0.96): obox(lay, f"{lay}_strap{z}", c + Vector((0, -0.12, z)), (0.44, 0.012, 0.035), M("#2b4f7a", True), outline=False)
def focus_mitts(lay):           # two round focus mitts resting on a low wooden shelf
    c = C
    obox(lay, lay + "_shelf", c + Vector((0, 0, 0.22)), (0.62, 0.34, 0.06), WOOD, bevel=0.015)
    for sx in (-1, 1): obox(lay, f"{lay}_leg{sx}", c + Vector((sx * 0.26, 0, 0.1)), (0.06, 0.3, 0.2), WOOD_D)
    for k, sx in enumerate((-1, 1)):
        q = c + Vector((sx * 0.15, -0.02, 0.42))
        oell(lay, f"{lay}_mitt{k}", q, (0.15, 0.08, 0.17), "#2f8f87", rot=(0, sx * 12, 0))
        disc(lay, f"{lay}_ring{k}", q + Vector((0, -0.082, 0.01)), 0.09, "#f6efdc"); disc(lay, f"{lay}_dot{k}", q + Vector((0, -0.085, 0.01)), 0.04, "#fad628")
def belt_rack(lay):              # a wooden rack with folded belts in a row (no red)
    c = C
    for sx in (-1, 1): otube(lay, f"{lay}_post{sx}", c + Vector((sx * 0.3, 0, 0)), c + Vector((sx * 0.3, 0, 0.95)), 0.035, 0.035, WOOD_D, segs=8)
    obox(lay, lay + "_foot", c + Vector((0, 0, 0.03)), (0.7, 0.3, 0.06), WOOD, bevel=0.015)
    otube(lay, lay + "_bar", c + Vector((-0.33, 0, 0.88)), c + Vector((0.33, 0, 0.88)), 0.025, 0.025, WOOD, segs=8)
    for k, col in enumerate(("#f4f1ea", "#f5d22e", "#f08a24", "#3aa655", "#2f6fd6")):
        x = -0.22 + k * 0.11
        obox(lay, f"{lay}_belt{k}", c + Vector((x, -0.03, 0.68)), (0.07, 0.03, 0.42), col, bevel=0.01)
        obox(lay, f"{lay}_loop{k}", c + Vector((x, -0.03, 0.89)), (0.08, 0.06, 0.05), col, bevel=0.015)
def helmet(lay):                 # a padded sparring helmet on a wooden head stand
    c = C
    obox(lay, lay + "_base", c + Vector((0, 0, 0.04)), (0.36, 0.32, 0.08), WOOD, bevel=0.02)
    otube(lay, lay + "_post", c + Vector((0, 0, 0.08)), c + Vector((0, 0, 0.42)), 0.04, 0.04, WOOD_D, segs=10)
    oell(lay, lay + "_dome", c + Vector((0, 0, 0.62)), (0.22, 0.21, 0.22), "#3a6ea5")
    oell(lay, lay + "_face", c + Vector((0, -0.17, 0.57)), (0.13, 0.05, 0.12), M("#2b2733", True), outline=False)
    for sx in (-1, 1): oell(lay, f"{lay}_cheek{sx}", c + Vector((sx * 0.17, -0.1, 0.5)), (0.07, 0.07, 0.11), "#3a6ea5")
    obox(lay, lay + "_brow", c + Vector((0, -0.19, 0.71)), (0.24, 0.04, 0.05), "#2b4f7a", bevel=0.02)
    oell(lay, lay + "_strap", c + Vector((0, -0.12, 0.4)), (0.1, 0.03, 0.025), "#2b4f7a", outline=False)
def bottle(lay):                 # a big water bottle and a folded towel on a little crate
    c = C
    obox(lay, lay + "_crate", c + Vector((0, 0, 0.12)), (0.5, 0.38, 0.24), WOOD, bevel=0.02)
    for z in (0.06, 0.18): obox(lay, f"{lay}_slat{z}", c + Vector((0, -0.192, z)), (0.46, 0.01, 0.03), M(WOOD_D, True), outline=False)
    otube(lay, lay + "_bottle", c + Vector((0.1, 0, 0.24)), c + Vector((0.1, 0, 0.62)), 0.09, 0.09, "#5ab4e6", segs=16)
    otube(lay, lay + "_label", c + Vector((0.1, 0, 0.36)), c + Vector((0.1, 0, 0.46)), 0.093, 0.093, M("#f6efdc", True), segs=16, outline=False)
    otube(lay, lay + "_cap", c + Vector((0.1, 0, 0.62)), c + Vector((0.1, 0, 0.7)), 0.055, 0.05, "#2f8f87", segs=12)
    obox(lay, lay + "_towel", c + Vector((-0.12, -0.02, 0.29)), (0.22, 0.26, 0.1), "#f6efdc", bevel=0.03)
    obox(lay, lay + "_stripe", c + Vector((-0.12, -0.152, 0.29)), (0.22, 0.004, 0.025), M("#5ab4e6", True), outline=False)
def bow_mat(lay):                # a small square mat for bowing in, with a soft border
    gbox(lay, lay + "_mat", 0.12, 0.12, 0.88, 0.88, 0, 0.05, "#d9c48f")
    for (c0, r0, c1, r1) in ((0.12, 0.12, 0.88, 0.2), (0.12, 0.8, 0.88, 0.88), (0.12, 0.12, 0.2, 0.88), (0.8, 0.12, 0.88, 0.88)):
        gbox(lay, lay + f"_rim{c0}{r0}", c0, r0, c1, r1, 0.05, 0.056, "#2f8f87", outline=False)
    for k in range(4): gbox(lay, f"{lay}_weave{k}", 0.24, 0.3 + k * 0.12, 0.76, 0.31 + k * 0.12, 0.05, 0.053, "#c4ad74", outline=False)
GEAR = [("kick-pad", kick_pad, 1.2), ("focus-mitts", focus_mitts, 0.75), ("belt-rack", belt_rack, 1.25), ("helmet", helmet, 1.0),
        ("water-bottle", bottle, 0.85), ("bow-mat", bow_mat, 0.15)]
for k, (nm, fn, top) in enumerate(GEAR):
    lay = f"decor-t1-gear-{nm}"; fn(lay)
    emit(lay, [lay], 1, 1, "floor", top, {"pool": "class", "set": "dojo gear", "order": k + 1})

# ---------------------------------------------------------------- RANDOM PIECES: 5 kinds; the -tint layer is neutral, the game colours it
def fan(lay, tl):
    c = C
    obox(lay, lay + "_foot", c + Vector((0, 0, 0.04)), (0.4, 0.22, 0.08), WOOD, bevel=0.02)
    otube(lay, lay + "_post", c + Vector((0, 0, 0.08)), c + Vector((0, 0, 0.32)), 0.03, 0.03, WOOD_D, segs=8)
    piv = c + Vector((0, -0.02, 0.34))
    for k in range(8):
        a = math.radians(-61.25 + k * 17.5); d = Vector((math.sin(a), 0, math.cos(a)))
        obox(tl, f"{tl}_leaf{k}", piv + d * 0.32 + Vector((0, -0.01, 0)), (0.13, 0.008, 0.28), M(TINT if k % 2 else "#d6d6d6", True), rot=(0, math.degrees(a), 0), outline=False)
    for k in range(9):
        a = math.radians(-70 + k * 17.5); d = Vector((math.sin(a), 0, math.cos(a)))
        otube(lay, f"{lay}_rib{k}", piv + Vector((0, -0.02, 0)), piv + Vector((0, -0.02, 0)) + d * 0.46, 0.008, 0.008, WOOD_D, segs=6, outline=False)
    oell(lay, lay + "_pin", piv + Vector((0, -0.03, 0)), (0.03, 0.02, 0.03), "#d9a441")
def lantern(lay, tl):            # paper lantern like the approved one; the coloured part is the cap, rims and tassel
    c = C
    obox(lay, lay + "_foot", c + Vector((0, 0, 0.04)), (0.36, 0.36, 0.08), WOOD, bevel=0.02)
    otube(lay, lay + "_pole", c + Vector((0, 0, 0.08)), c + Vector((0, 0, 0.55)), 0.04, 0.04, GREEN, segs=10)
    oell(lay, lay + "_paper", c + Vector((0, 0, 0.78)), (0.2, 0.2, 0.26), "#ffe7b0", segs=18, rings=12)
    for z in (0.7, 0.78, 0.86):
        put(f"{lay}_rib{z}", ellipsoid(c + Vector((0, 0, z)), (0.203, 0.203, 0.006), segs=18, rings=4), M("#e8b86a", True), lay, outline=False)
    for z, r in ((0.58, 0.15), (0.98, 0.15)): otube(tl, f"{tl}_rim{z}", c + Vector((0, 0, z - 0.05)), c + Vector((0, 0, z + 0.05)), r, r, TINT, segs=16)
    oell(tl, tl + "_cap", c + Vector((0, 0, 1.06)), (0.1, 0.1, 0.05), TINT)
    obox(tl, tl + "_band", c + Vector((0, -0.19, 0.78)), (0.24, 0.02, 0.07), TINT, bevel=0.01)
    oell(tl, tl + "_tassel", c + Vector((0, -0.08, 0.46)), (0.045, 0.045, 0.08), TINT)
def bonsai(lay, tl):             # small bonsai; the coloured part is the glazed pot
    c = C
    otube(tl, tl + "_pot", c, c + Vector((0, 0, 0.18)), 0.26, 0.3, TINT, segs=18, sy=0.75)
    otube(lay, lay + "_soil", c + Vector((0, 0, 0.18)), c + Vector((0, 0, 0.19)), 0.27, 0.27, M("#7a5232", True), segs=18, outline=False, sy=0.75)
    otube(lay, lay + "_trunk", c + Vector((0, 0, 0.18)), c + Vector((0.06, 0, 0.5)), 0.05, 0.035, "#7a5232", segs=8)
    otube(lay, lay + "_branch", c + Vector((0.04, 0, 0.4)), c + Vector((-0.16, 0, 0.5)), 0.03, 0.02, "#7a5232", segs=8)
    for k, (dx, dz, s) in enumerate(((0.08, 0.6, 0.17), (-0.17, 0.53, 0.12), (0.2, 0.48, 0.1))):
        oell(lay, f"{lay}_cloud{k}", c + Vector((dx, -0.02, dz)), (s, s * 0.8, s * 0.6), ["#4f8a4a", LEAF, "#5fa65a"][k])
def cushion(lay, tl):            # a plump floor cushion; the cover is coloured, the tufts and piping stay neutral cream
    c = C
    obox(tl, tl + "_cover", c + Vector((0, 0, 0.08)), (0.66, 0.56, 0.14), TINT, bevel=0.06)
    obox(lay, lay + "_pipe", c + Vector((0, 0, 0.08)), (0.68, 0.58, 0.03), "#f6efdc", bevel=0.01)
    oell(lay, lay + "_tuft", c + Vector((0, 0, 0.155)), (0.04, 0.04, 0.02), "#f6efdc")
    for sx in (-1, 1):
        for sy in (-1, 1): oell(lay, f"{lay}_tassel{sx}{sy}", c + Vector((sx * 0.34, sy * 0.29, 0.08)), (0.03, 0.03, 0.03), "#d9a441", outline=False)
def banner(lay, tl):             # a hanging cloth banner on a pole (wall); cloth coloured, a cream crest of three circles stays
    x = 0.5; zc = 0.85; y = grid(x, WF, 0).y - 0.03
    otube(lay, lay + "_pole", Vector((x - 0.3, y - 0.03, zc + 0.43)), Vector((x + 0.3, y - 0.03, zc + 0.43)), 0.025, 0.025, WOOD_D, segs=8)
    for sx in (-1, 1): oell(lay, f"{lay}_knob{sx}", Vector((x + sx * 0.31, y - 0.03, zc + 0.43)), (0.035, 0.035, 0.035), "#d9a441")
    obox(tl, tl + "_cloth", Vector((x, y - 0.01, zc)), (0.42, 0.02, 0.8), TINT)
    for sx in (-1, 0, 1):
        obox(tl, f"{tl}_tail{sx}", Vector((x + sx * 0.14, y - 0.01, zc - 0.45)), (0.12, 0.02, 0.12), TINT, rot=(0, 45, 0))
    for k, (dx, dz) in enumerate(((0, 0.1), (-0.07, -0.02), (0.07, -0.02))):
        disc(lay, f"{lay}_crest{k}", Vector((x + dx, y - 0.025, zc + dz)), 0.055, "#f6efdc")
RANDOM = [("fan", fan, "floor", 0.9, "#5ab4e6"), ("lantern", lantern, "floor", 1.1, "#2f8f87"), ("bonsai", bonsai, "floor", 0.75, "#3a6ea5"),
          ("cushion", cushion, "floor", 0.2, "#9660e6"), ("banner", banner, "wall", 0.4, "#3aa655")]
for k, (nm, fn, place, top, col1) in enumerate(RANDOM):
    lay = f"decor-t1-{nm}"; tl = lay + "-tint"; fn(lay, tl)
    emit(lay, [lay, tl], 1, 1, place, top, {"pool": "random", "colours": 2, "tintLayer": tl, "colour1": col1,
         "colour2": "belt colour of the floor where it drops (beltStyles[belt].belt)",
         "howToTint": "draw the base layer, then the -tint layer multiplied by the colour (rgb * colour / 255, alpha unchanged). The -tint art is neutral light grey so its shading survives"})

# ---------------------------------------------------------------- FIRST-CLEAR STATUES: one shared stone base + a keeper figure per floor
def statue_base(lay):
    c = C
    obox(lay, lay + "_plinth", c + Vector((0, 0, 0.12)), (0.56, 0.5, 0.24), STONE_D, bevel=0.03)
    obox(lay, lay + "_top", c + Vector((0, 0, 0.26)), (0.6, 0.54, 0.05), "#b1aa9c", bevel=0.01)
    oell(lay, lay + "_moss", c + Vector((-0.18, -0.2, 0.27)), (0.08, 0.05, 0.02), "#9fb07a", outline=False)
statue_base("decor-t1-statue-base")
def eyes_closed(lay, c, z, dx=0.065, y=-0.19):
    for sx in (-1, 1): obox(lay, f"{lay}_eye{sx}", c + Vector((sx * dx, y, z)), (0.05, 0.005, 0.012), M("#4a4652", True), outline=False)
def fig_lion(lay):               # floor 1: a round lion-dog with a teal scarf
    c = C
    oell(lay, lay + "_body", c + Vector((0, 0.02, 0.5)), (0.2, 0.17, 0.22), STONE)
    oell(lay, lay + "_head", c + Vector((0, -0.03, 0.82)), (0.19, 0.16, 0.16), STONE)
    for sx in (-1, 1):
        oell(lay, f"{lay}_ear{sx}", c + Vector((sx * 0.14, -0.01, 0.95)), (0.06, 0.04, 0.06), STONE)
        oell(lay, f"{lay}_paw{sx}", c + Vector((sx * 0.1, -0.15, 0.32)), (0.06, 0.06, 0.04), STONE)
    eyes_closed(lay, c, 0.85)
    oell(lay, lay + "_scarf", c + Vector((0, -0.04, 0.68)), (0.19, 0.14, 0.05), "#1ebace")
    obox(lay, lay + "_scarftail", c + Vector((0.08, -0.17, 0.6)), (0.07, 0.02, 0.12), "#1ebace", rot=(0, -12, 0))
def fig_turtle(lay):             # floor 2: a wise turtle with a domed patterned shell
    c = C
    oell(lay, lay + "_shell", c + Vector((0, 0.03, 0.42)), (0.25, 0.22, 0.16), STONE)
    for k, (dx, dz) in enumerate(((0, 0.5), (-0.12, 0.43), (0.12, 0.43))):
        disc(lay, f"{lay}_hex{k}", c + Vector((dx, -0.19, dz)), (0.06, 0.04), "#a9a294")
    oell(lay, lay + "_head", c + Vector((0, -0.2, 0.5)), (0.11, 0.1, 0.1), STONE)
    for sx in (-1, 1): oell(lay, f"{lay}_leg{sx}", c + Vector((sx * 0.2, -0.12, 0.31)), (0.06, 0.06, 0.04), STONE)
    eyes_closed(lay, c, 0.53, dx=0.04, y=-0.295)
    oell(lay, lay + "_moss", c + Vector((0.08, -0.02, 0.57)), (0.08, 0.05, 0.03), "#9fb07a", outline=False)
def fig_crane(lay):              # floor 3: a crane seen side-on, standing on one leg, long neck up, wings folded
    c = C
    otube(lay, lay + "_leg", c + Vector((0.02, -0.02, 0.28)), c + Vector((0.02, -0.02, 0.48)), 0.025, 0.025, STONE_D, segs=8)
    oell(lay, lay + "_body", c + Vector((0.04, 0, 0.58)), (0.21, 0.13, 0.12), STONE, rot=(0, -12, 0))
    oell(lay, lay + "_wing", c + Vector((0.09, -0.06, 0.6)), (0.16, 0.08, 0.08), "#cfc8ba", rot=(0, -12, 0))
    oell(lay, lay + "_tail", c + Vector((0.24, 0, 0.62)), (0.07, 0.07, 0.05), "#a9a294", rot=(0, -30, 0))
    otube(lay, lay + "_neck", c + Vector((-0.12, -0.02, 0.62)), c + Vector((-0.16, -0.04, 0.92)), 0.045, 0.035, STONE, segs=10)
    oell(lay, lay + "_head", c + Vector((-0.16, -0.05, 0.97)), (0.075, 0.07, 0.065), STONE)
    oell(lay, lay + "_beak", c + Vector((-0.27, -0.06, 0.95)), (0.08, 0.02, 0.02), STONE_D, rot=(0, 10, 0))
    oell(lay, lay + "_crown", c + Vector((-0.16, -0.05, 1.035)), (0.035, 0.035, 0.018), "#a9a294", outline=False)
    obox(lay, lay + "_eye", c + Vector((-0.19, -0.12, 0.985)), (0.03, 0.005, 0.01), M("#4a4652", True), outline=False)
for k, (nm, fn, top) in enumerate((("lion-dog", fig_lion, 1.15), ("turtle", fig_turtle, 0.75), ("crane", fig_crane, 1.2))):
    lay = f"decor-t1-statue-fig-{nm}"; fn(lay)
    emit(f"decor-t1-statue-floor{k + 1}", ["decor-t1-statue-base", lay], 1, 1, "floor", top,
         {"pool": "first floor clear", "floor": k + 1, "sharedLayer": "decor-t1-statue-base"})

# ---------------------------------------------------------------- JOURNAL TROPHIES: one shared stand + a figure per Tier 1 monster
def trophy_stand(lay):
    c = C
    obox(lay, lay + "_base", c + Vector((0, 0, 0.07)), (0.46, 0.4, 0.14), WOOD_D, bevel=0.02)
    obox(lay, lay + "_base2", c + Vector((0, 0, 0.18)), (0.36, 0.3, 0.08), WOOD, bevel=0.015)
    obox(lay, lay + "_plate", c + Vector((0, -0.206, 0.075)), (0.22, 0.01, 0.07), M("#d9a441", True), outline=False)
trophy_stand("decor-t1-trophy-stand")
Z0 = 0.22
def critter(lay, W, Hh, body, belly, eye, y0=0.0):
    c = C + Vector((0, y0, 0)); zc = Z0 + Hh
    oell(lay, lay + "_body", c + Vector((0, 0, zc)), (W, W * 0.85, Hh), body)
    oell(lay, lay + "_belly", c + Vector((0, -W * 0.55, zc - Hh * 0.2)), (W * 0.6, W * 0.35, Hh * 0.55), belly, outline=False)
    for sx in (-1, 1):
        oell(lay, f"{lay}_eye{sx}", c + Vector((sx * W * 0.38, -W * 0.8, zc + Hh * 0.25)), (W * 0.18, 0.015, W * 0.22), M(eye, True), outline=False)
        oell(lay, f"{lay}_foot{sx}", c + Vector((sx * W * 0.45, -W * 0.3, Z0 + 0.02)), (W * 0.3, W * 0.3, 0.03), "#1d1847")
    return c, zc
def f_swarmer(lay):
    c, zc = critter(lay, 0.15, 0.13, "#2b2a72", "#3d48a0", "#5fe8ff")
    for k, dx in enumerate((-0.05, 0, 0.05)): oell(lay, f"{lay}_tuft{k}", c + Vector((dx, 0, zc + 0.14 + (0.02 if k == 1 else 0))), (0.03, 0.03, 0.06), "#3fe6d2", rot=(0, dx * 300, 0))
def f_shield(lay):
    c, zc = critter(lay, 0.17, 0.2, "#28305e", "#3b4a82", "#ffc266")
    for sx in (-1, 1):
        otube(lay, f"{lay}_ant{sx}", c + Vector((sx * 0.06, 0, zc + 0.17)), c + Vector((sx * 0.08, 0, zc + 0.26)), 0.01, 0.01, "#28305e", segs=6, outline=False)
        oell(lay, f"{lay}_antball{sx}", c + Vector((sx * 0.08, 0, zc + 0.27)), (0.03, 0.03, 0.03), "#ffaa33")
    oell(lay, lay + "_shield", c + Vector((0.19, -0.1, zc - 0.02)), (0.13, 0.03, 0.13), "#7f8fb8")
    oell(lay, lay + "_rim", c + Vector((0.19, -0.095, zc - 0.02)), (0.145, 0.025, 0.145), "#e8962e", outline=False)
    disc(lay, lay + "_emb", c + Vector((0.19, -0.135, zc - 0.02)), 0.045, "#ffd27a")
def f_brute(lay):
    c, zc = critter(lay, 0.21, 0.19, "#36204f", "#523a7a", "#ff9cc4")
    for sx in (-1, 1):
        oell(lay, f"{lay}_arm{sx}", c + Vector((sx * 0.22, -0.04, zc - 0.06)), (0.08, 0.08, 0.12), "#36204f")
        oell(lay, f"{lay}_ear{sx}", c + Vector((sx * 0.12, 0, zc + 0.18)), (0.04, 0.03, 0.06), "#e8337a", rot=(0, sx * -25, 0))
def f_keeper(lay):
    c, zc = critter(lay, 0.17, 0.26, "#241e52", "#3a3278", "#ffd86b")
    otube(lay, lay + "_crown", c + Vector((0, 0, zc + 0.22)), c + Vector((0, 0, zc + 0.29)), 0.08, 0.09, "#ffc83d", segs=12)
    for k in range(5):
        a = k * 2 * math.pi / 5; oell(lay, f"{lay}_pt{k}", c + Vector((0.085 * math.sin(a), -0.085 * math.cos(a), zc + 0.31)), (0.02, 0.02, 0.03), "#ffc83d", outline=False)
def f_bopper(lay):
    c, zc = critter(lay, 0.17, 0.18, "#2b2f6e", "#3d48a0", "#d8f56a")
    for sx in (-1, 1):
        oell(lay, f"{lay}_ear{sx}", c + Vector((sx * 0.08, 0, zc + 0.24)), (0.035, 0.03, 0.1), "#2b2f6e", rot=(0, sx * -15, 0))
        oell(lay, f"{lay}_earin{sx}", c + Vector((sx * 0.08, -0.025, zc + 0.24)), (0.018, 0.01, 0.07), "#b6e03c", rot=(0, sx * -15, 0), outline=False)
    otube(lay, lay + "_staff", c + Vector((0.2, -0.08, Z0 + 0.03)), c + Vector((0.2, -0.08, zc + 0.2)), 0.015, 0.015, "#c9ccd6", segs=6)
    oell(lay, lay + "_pad", c + Vector((0.2, -0.08, zc + 0.22)), (0.045, 0.045, 0.045), "#b6e03c")
MONSTERS = [("swarmer", f_swarmer, 0.6), ("shield", f_shield, 0.85), ("brute", f_brute, 0.8), ("keeper", f_keeper, 0.95), ("bopper", f_bopper, 0.9)]
for nm, fn, top in MONSTERS:
    lay = f"decor-t1-trophy-fig-{nm}"; fn(lay)
    emit(f"decor-t1-trophy-{nm}", ["decor-t1-trophy-stand", lay], 1, 1, "floor", top,
         {"pool": "Monster Journal", "monster": {"bopper": "padded"}.get(nm, nm), "sharedLayer": "decor-t1-trophy-stand"})

# ---------------------------------------------------------------- 2 x 1 folding screen (must touch the top wall)
def folding_screen(lay):
    for k in range(4):
        x0 = 0.15 + k * 0.425; ang = 12 if k % 2 == 0 else -12; c = grid(x0 + 0.21, 0.5 + (0.04 if k % 2 else -0.04))
        obox(lay, f"{lay}_frame{k}", c + Vector((0, 0, 0.6)), (0.42, 0.05, 1.12), WOOD_D, rot=(0, 0, ang))
        obox(lay, f"{lay}_panel{k}", c + Vector((0, -0.03, 0.62)), (0.34, 0.01, 0.98), M("#f3e6c4", True), rot=(0, 0, ang), outline=False)
        obox(lay, f"{lay}_hill{k}", c + Vector((0, -0.037, 0.3 + 0.06 * math.sin(k * 1.4))), (0.34, 0.004, 0.3), M("#7fbf6f", True), rot=(0, 0, ang), outline=False)
        if k in (1, 2): oell(lay, f"{lay}_cloud{k}", c + Vector((0, -0.04, 0.88)), (0.13, 0.004, 0.05), M("#ffffff", True), rot=(0, 0, ang), outline=False)
        if k == 0: disc(lay, f"{lay}_sun", c + Vector((0, -0.04, 0.85)), 0.07, "#f2a93b")
folding_screen("decor-t1-folding-screen")
emit("decor-t1-folding-screen", ["decor-t1-folding-screen"], 2, 1, "floor", 1.3, {"pool": "random (A6 sample kept; see DECIDE)", "mustTouchWall": True, "placeRule": "the footprint touches the top wall: its top row is row 1"}, wall_rule=True)

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
