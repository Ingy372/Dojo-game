"""
Dojo Ascent - Home Dojo room, decorations and mess (Art Director bot), Batch 3.

Builds one .blend with every Home Dojo piece on its own layer, for incoming-art/tools/render_static.py:
    blender -b -P incoming-art/home-dojo/source/build_home_dojo.py -- --out <file>.blend
    blender -b <file>.blend -P incoming-art/tools/render_static.py -- --out incoming-art/home-dojo/sprites

Room: content/dojo/home-dojo.json (15 x 10 tiles, notice board at column 8 of the top wall, door at the bottom
centre). Decorations and footprints: content/dojo/decorations.json. Mess: config DOJO (dust, leaves, scuffed
mats, crooked weapons, 3 crooked levels). Everything is placed on the game grid with grid(col, row) (see
render_static.py) so a floor tile is exactly 80 x 80 px.
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box, OUTLINE_W

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True)
ap.add_argument("--font", default="/usr/share/fonts/truetype/sand-box/google/BIZ UDPMincho/BIZUDPMincho-Bold.ttf")
A = ap.parse_args(argv)
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")
ROOM = json.load(open(os.path.join(REPO, "content", "dojo", "home-dojo.json")))
DECOR = {d["id"]: d for d in json.load(open(os.path.join(REPO, "content", "dojo", "decorations.json")))["decorations"]}

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

def text(lay, name, s, center, size, color, depth=0.01):
    cu = bpy.data.curves.new(name, "FONT"); cu.body = s
    if os.path.exists(A.font): cu.font = bpy.data.fonts.load(A.font)
    cu.size = size; cu.align_x = "CENTER"; cu.align_y = "CENTER"; cu.extrude = depth
    ob = bpy.data.objects.new(name, cu); layer(lay).objects.link(ob)
    ob.location = center; ob.rotation_euler = (math.radians(90), 0, 0)   # stands up, faces the camera (-Y)
    cu.materials.append(M(color, flat=True))
    return ob

TARGETS = []
def target(name, layers, rect, top, anchor="bottom-center", **kw):
    TARGETS.append(dict(name=name, layers=layers, rect=rect, top=top, anchor=anchor, **kw))

# ======================================================================= ROOM
WOOD = ["#c99a62", "#c19159", "#d2a56d", "#c7965d"]
H_WALL = 1.3 / math.cos(math.radians(35))       # the back wall fills the top wall row + 0.3 tile above it
cols, rows = len(ROOM["tiles"][0]), len(ROOM["tiles"])          # 15 x 10
# floor: a dark base, then planks running left-right (half-tile rows), random lengths
gbox("floor", "floor_base", 0, 0, cols, rows, -0.06, -0.01, "#7b5434", outline=False)
for j in range(2, 2 * (rows - 1)):
    c = 1.0 - random.random() * 2
    while c < cols - 1:
        L = random.choice([2.0, 2.5, 3.0, 3.5])
        c1 = min(c + L, cols - 1)
        gbox("floor", f"plank_{j}_{c:.1f}", max(c, 1) + 0.012, j / 2 + 0.012, c1 - 0.012, (j + 1) / 2 - 0.012, -0.01, 0.0,
             random.choice(WOOD), outline=False)
        c = c1
# back wall (top row): dark wainscot, plaster panels between posts, a top beam
WF = 1.0                                           # the wall's front face stands on the line between rows 0 and 1
def wall_part(name, c0, c1, z0, z1, color, dy=0.0, outline=False):
    a = grid(c0, WF, z0); b = grid(c1, WF, z1)
    ctr = Vector(((a.x + b.x) / 2, a.y + 0.08 + dy, (a.z + b.z) / 2))
    return put(name, box(ctr, (abs(b.x - a.x), 0.16, abs(b.z - a.z))), color, "floor", outline)
wall_part("wall_plaster", 0, cols, 0, H_WALL, "#efe3c6")
wall_part("wall_wainscot", 0, cols, 0, 0.55, "#7a5232", dy=-0.012)
wall_part("wall_rail", 0, cols, 0.55, 0.62, "#5f3f26", dy=-0.02)
wall_part("wall_beam", 0, cols, H_WALL - 0.16, H_WALL, "#5f3f26", dy=-0.03)
for c in range(0, cols + 1, 3):
    wall_part(f"wall_post{c}", c - 0.09, c + 0.09, 0, H_WALL, "#6b4428", dy=-0.04)
# side walls (left / right columns): seen from above, a dark wooden wall top with a light edge
for c0 in (0, cols - 1):
    gbox("floor", f"side{c0}", c0, 0.7, c0 + 1, rows, 0, 0.14, "#6b4428")
    gbox("floor", f"side{c0}_cap", c0 + 0.08, 0.75, c0 + 0.92, rows, 0.14, 0.17, "#8a5a35", outline=False)
# notice board (own layer): top wall, column 8 (1-based) = tiles 7..8
bc = ROOM["board"]["column"] - 1
def wall_obj(lay, name, c0, c1, z0, z1, color, dy, outline=True):
    a = grid(c0, WF, z0); b = grid(c1, WF, z1)
    return put(name, box(Vector(((a.x + b.x) / 2, a.y + dy, (a.z + b.z) / 2)), (abs(b.x - a.x), 0.04, abs(b.z - a.z))), color, lay, outline)
wall_obj("notice-board", "board_frame", bc + 0.06, bc + 0.94, 0.62, 1.30, "#6b4428", -0.03)
wall_obj("notice-board", "board_cork", bc + 0.12, bc + 0.88, 0.68, 1.24, "#c79257", -0.055, outline=False)
for k, (x0, z0, w, h, col) in enumerate(((0.18, 0.95, 0.26, 0.24, "#fffaf0"), (0.50, 1.00, 0.30, 0.20, "#bfe3ff"),
                                          (0.22, 0.73, 0.22, 0.18, "#ffe08a"), (0.52, 0.74, 0.28, 0.20, "#ffd0dc"))):
    wall_obj("notice-board", f"paper{k}", bc + x0, bc + x0 + w, z0, z0 + h, col, -0.075, outline=False)
    wall_obj("notice-board", f"pin{k}", bc + x0 + w / 2 - 0.025, bc + x0 + w / 2 + 0.025, z0 + h - 0.06, z0 + h - 0.02,
             "#d8352a", -0.09, outline=False)
# front wall (bottom row): a low wooden wall, drawn above the characters; the door gap at the bottom centre
dc = ROOM["tiles"][-1].index("D")
for c0, c1 in ((0, dc), (dc + 1, cols)):
    gbox("wall-front", f"front{c0}", c0, rows - 1 + 0.25, c1, rows, 0, 0.32, "#7a5232")
    gbox("wall-front", f"front{c0}_cap", c0, rows - 1 + 0.22, c1, rows - 1 + 0.5, 0.32, 0.38, "#5f3f26")
for x in (dc, dc + 1):   # door posts and a light threshold
    gbox("wall-front", f"doorpost{x}", x - 0.09, rows - 1 + 0.25, x + 0.09, rows - 1 + 0.55, 0, 0.75, "#5f3f26")
gbox("floor", "threshold", dc + 0.05, rows - 1 + 0.1, dc + 0.95, rows, -0.01, 0.015, "#e2c290", outline=False)
gbox("floor", "doormat", dc + 0.12, rows - 2 + 0.25, dc + 0.88, rows - 1 + 0.05, 0.0, 0.012, "#5a6b85", outline=False)
target("room", ["floor", "notice-board", "wall-front"], [0, 0, cols, rows], 0.3, anchor=[0, 0],
       note="the whole room: draw floor at depth 0 (under everything), notice-board on top of it, wall-front ABOVE the characters and decorations. anchorPx = the grid's top-left corner (tile 0,0)",
       info={"tiles": ROOM["tiles"], "board": ROOM["board"]})

# ================================================================= DECORATIONS
def deco(id_, top, build, place=None, extra_layers=(), frames=None, name=None, note=None):
    d = DECOR[id_]; w, h = d["width"], d["height"]
    lay = name or id_
    build(lay, w, h)
    if d["place"] == "wall":
        target(lay, [lay], [0, 0, w, 1], top, anchor=[w / 2, 1], footprint=[w, h], place="wall", frames=frames,
               note=note or "wall item: anchorPx = bottom-centre of its top-wall cell (where the wall meets the floor)")
    else:
        target(lay, [lay], [-0.15, 0, w + 0.15, h + 0.12], top, anchor=[w / 2, h], footprint=[w, h], place="floor",
               frames=frames, note=note or "anchorPx = bottom-centre of the footprint; sort by the footprint's bottom row")

def mat(color, rim):
    def b(lay, w, h):
        gbox(lay, lay + "_mat", 0.06, 0.06, w - 0.06, h - 0.06, 0, 0.05, color, bevel=0.0)
        for (c0, r0, c1, r1) in ((0.06, 0.06, w - 0.06, 0.16), (0.06, h - 0.16, w - 0.06, h - 0.06),
                                 (0.06, 0.06, 0.16, h - 0.06), (w - 0.16, 0.06, w - 0.06, h - 0.06)):
            gbox(lay, lay + f"_rim{c0}{r0}", c0, r0, c1, r1, 0.05, 0.056, rim, outline=False)
    return b
deco("training-mat", 0.2, mat("#3a6ea5", "#6f9fd2"))
deco("practice-mat", 0.2, mat("#4f8a4a", "#7fbf6f"))

def scuffs(lay, w, h, seed):
    rnd = random.Random(seed)
    for k in range(7):
        c, r = rnd.uniform(0.35, w - 0.35), rnd.uniform(0.35, h - 0.35)
        p = grid(c, r, 0.058)
        ang = rnd.uniform(-35, 35)        # scuffs: thin dusty streaks (shoe and foot marks), slightly see-through look
        for q in range(rnd.randint(2, 3)):
            pp = p + Vector((0, q * 0.035 * K, 0))
            put(f"{lay}_s{k}{q}", ellipsoid(pp, (rnd.uniform(0.12, 0.2), 0.012 * K, 0.003), rot=(0, 0, ang), segs=12, rings=4),
                rnd.choice(["#d8d2c4", "#cfc7b6"]), lay, outline=False, flat=True)
for mid in ("training-mat", "practice-mat"):
    lay = mid + "-scuffed"; scuffs(lay, 2, 2, len(mid))
    target(lay, [lay], [-0.15, 0, 2.15, 2.12], 0.2, anchor=[1, 2], footprint=[2, 2], place="floor", group="mess",
           note=f"mess overlay: draw on top of {mid} at the same anchor while the mat is scuffed (clean = don't draw it)")

def rack(lay, w, h):
    yb = grid(0, h * 0.5).y
    for x in (0.18, w - 0.18):
        obox(lay, f"{lay}_post{x}", Vector((x, yb, 0.5)), (0.08, 0.08, 1.0), "#8a5a35")
        obox(lay, f"{lay}_foot{x}", Vector((x, yb, 0.03)), (0.1, 0.42, 0.06), "#6b4428")
    for z in (0.35, 0.82):
        obox(lay, f"{lay}_bar{z}", Vector((w / 2, yb - 0.05, z)), (w - 0.2, 0.06, 0.07), "#a46e40")
    obox(lay, f"{lay}_shelf", Vector((w / 2, yb + 0.02, 0.1)), (w - 0.25, 0.25, 0.04), "#a46e40")
    # wooden practice weapons only (rounded, nothing sharp): 2 bokken and 2 jo staffs, standing in the rack
    W_ = []
    for k, (x, kind) in enumerate(((0.55, "bokken"), (0.85, "jo"), (1.15, "bokken"), (1.45, "jo"))):
        base = Vector((x, yb - 0.02, 0.12))
        L = 1.0 if kind == "bokken" else 1.15
        o = otube(lay, f"{lay}_{kind}{k}", base, base + Vector((0, 0, L)), 0.022, 0.018 if kind == "bokken" else 0.022, "#dcb47e", segs=8)
        objs = [o]
        if kind == "bokken":   # a dark handle wrap and a small round guard
            objs.append(otube(lay, f"{lay}_grip{k}", base, base + Vector((0, 0, 0.26)), 0.026, 0.026, "#3c3c44", segs=8, outline=False))
            objs.append(otube(lay, f"{lay}_tsuba{k}", base + Vector((0, 0, 0.26)), base + Vector((0, 0, 0.285)), 0.05, 0.05, "#5f3f26", segs=10))
        W_.append((objs, base))
    return W_
WEAP = {}
def rack_build(lay, w, h):
    WEAP[lay] = rack(lay, w, h)
deco("weapon-rack", 1.25, rack_build)
# crooked variants: frame 1 = straight, 2/3/4 = one/two/three weapons knocked crooked (config rackCrookedAt)
TILTS = [(1, 18), (3, -16), (0, -13)]
for objs, base in WEAP["weapon-rack"]:
    for o in objs:
        o.keyframe_insert("rotation_euler", frame=1); o.keyframe_insert("location", frame=1)
for lvl in range(1, 4):
    f = lvl + 1
    for k, (objs, base) in enumerate(WEAP["weapon-rack"]):
        ang = next((a for (i, a) in TILTS[:lvl] if i == k), 0)
        for o in objs:
            mw = Matrix.Translation(base) @ Matrix.Rotation(math.radians(ang), 4, "Y") @ Matrix.Translation(-base)
            o.matrix_world = mw
            o.keyframe_insert("rotation_euler", frame=f); o.keyframe_insert("location", frame=f)
            o.matrix_world = Matrix.Identity(4)
    for objs, base in WEAP["weapon-rack"]:
        for o in objs:
            for fc in (o.animation_data.action.fcurves if o.animation_data else []):
                for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"
# the outline hulls must follow the weapons too: parent each hull to its weapon
for ob in list(COLL["weapon-rack"].objects):
    if ob.name.endswith("_outline"):
        src = bpy.data.objects.get(ob.name[:-len("_outline")])
        if src and src.animation_data:
            ob.parent = src; ob.matrix_parent_inverse = src.matrix_world.inverted()
TARGETS[-1]["frames"] = [1, 1]
target("weapon-rack-crooked", ["weapon-rack"], [-0.15, 0, 2.15, 1.12], 1.25, anchor=[1, 1], footprint=[2, 1], place="floor",
       frames=[2, 4], group="mess", note="mess state of the weapon rack: a sheet of 3 frames = 1, 2 or 3 weapons knocked crooked (config DOJO.rackCrookedAt). The clean version is weapon-rack")

def bench(lay, w, h):
    yb = grid(0, h * 0.5).y
    obox(lay, lay + "_seat", Vector((w / 2, yb, 0.36)), (w - 0.3, 0.38, 0.07), "#9c6b3c", bevel=0.015)
    for x in (0.35, w - 0.35):
        obox(lay, f"{lay}_leg{x}", Vector((x, yb, 0.17)), (0.08, 0.3, 0.34), "#7a5232")
    obox(lay, lay + "_brace", Vector((w / 2, yb, 0.12)), (w - 0.7, 0.05, 0.05), "#7a5232")
deco("wooden-bench", 0.7, bench)

def bag(lay, w, h):
    c = grid(0.5, 0.55)
    otube(lay, lay + "_base", c, c + Vector((0, 0, 0.1)), 0.3, 0.27, "#3c3c44", segs=16)
    otube(lay, lay + "_bag", c + Vector((0, 0, 0.1)), c + Vector((0, 0, 1.05)), 0.19, 0.19, "#b04a3c", segs=16)
    oell(lay, lay + "_top", c + Vector((0, 0, 1.05)), (0.19, 0.19, 0.06), "#b04a3c")
    for z in (0.35, 0.8):
        otube(lay, f"{lay}_band{z}", c + Vector((0, 0, z)), c + Vector((0, 0, z + 0.06)), 0.196, 0.196, "#f2e9d8", segs=16, outline=False)
deco("punching-bag", 1.5, bag)

def lantern(lay, w, h):
    c = grid(0.5, 0.55); g = "#9a978f"; d = "#7d7a73"
    obox(lay, lay + "_base", c + Vector((0, 0, 0.06)), (0.42, 0.42, 0.12), d, bevel=0.02)
    otube(lay, lay + "_post", c + Vector((0, 0, 0.12)), c + Vector((0, 0, 0.55)), 0.08, 0.07, g, segs=10)
    obox(lay, lay + "_tray", c + Vector((0, 0, 0.58)), (0.36, 0.36, 0.06), d, bevel=0.015)
    obox(lay, lay + "_box", c + Vector((0, 0, 0.73)), (0.26, 0.26, 0.24), g, bevel=0.015)
    obox(lay, lay + "_light", c + Vector((0, -0.131, 0.73)), (0.13, 0.01, 0.13), M("#ffd36b", flat=True), outline=False)
    put(lay + "_roof", tube(c + Vector((0, 0, 0.85)), c + Vector((0, 0, 1.0)), 0.3, 0.06, segs=4), d, lay, smooth=False)
    oell(lay, lay + "_knob", c + Vector((0, 0, 1.04)), (0.05, 0.05, 0.06), g)
deco("stone-lantern", 1.5, lantern)

def bonsai(lay, w, h):
    c = grid(0.5, 0.55)
    obox(lay, lay + "_pot", c + Vector((0, 0, 0.1)), (0.5, 0.32, 0.2), "#5a6b85", bevel=0.03)
    obox(lay, lay + "_soil", c + Vector((0, 0, 0.205)), (0.44, 0.27, 0.02), "#5b4030", outline=False)
    pts = [c + Vector(v) for v in ((0, 0, 0.2), (0.06, 0, 0.36), (-0.04, 0, 0.5), (0.05, 0, 0.62))]
    for k in range(3):
        otube(lay, f"{lay}_trunk{k}", pts[k], pts[k + 1], 0.05 - 0.01 * k, 0.04 - 0.01 * k, "#6b4428", segs=8)
    for k, (v, s) in enumerate((((-0.17, 0, 0.5), 0.15), ((0.17, 0, 0.6), 0.14), ((0.03, 0, 0.74), 0.16))):
        oell(lay, f"{lay}_leaf{k}", c + Vector(v), (s * 1.3, s, s * 0.6), "#3f8f4f")
deco("bonsai-tree", 1.1, bonsai)

def bamboo(lay, w, h):
    c = grid(0.5, 0.55)
    otube(lay, lay + "_pot", c, c + Vector((0, 0, 0.28)), 0.2, 0.24, "#b8a07a", segs=16)
    otube(lay, lay + "_soil", c + Vector((0, 0, 0.27)), c + Vector((0, 0, 0.285)), 0.215, 0.215, "#5b4030", segs=16, outline=False)
    for k, (dx, dy, L, lean) in enumerate(((-0.08, 0, 1.15, -6), (0.05, -0.04, 1.3, 5), (0.1, 0.06, 0.95, 9), (-0.02, 0.07, 1.05, -2))):
        b0 = c + Vector((dx, dy, 0.28)); top = b0 + Vector((math.sin(math.radians(lean)) * L, 0, L))
        otube(lay, f"{lay}_stalk{k}", b0, top, 0.028, 0.024, "#7fbf5a", segs=8)
        for t in (0.3, 0.6, 0.85):
            p = b0.lerp(top, t)
            otube(lay, f"{lay}_node{k}{t}", p, p + Vector((0, 0, 0.02)), 0.032, 0.032, "#5f9a40", segs=8, outline=False)
        for s in (-1, 1):
            oell(lay, f"{lay}_lf{k}{s}", top + Vector((s * 0.1, -0.01, -0.08)), (0.12, 0.025, 0.035), "#6fb04a",
                 rot=(0, s * 25, 0))
deco("bamboo-pot", 1.75, bamboo)

def drum(lay, w, h):
    c = grid(0.5, 0.55)
    for x in (-0.22, 0.22):
        obox(lay, f"{lay}_leg{x}", c + Vector((x, 0, 0.12)), (0.06, 0.3, 0.24), "#5f3f26")
    otube(lay, lay + "_body", c + Vector((0, 0, 0.2)), c + Vector((0, 0, 0.58)), 0.27, 0.27, "#a0522d", segs=18)
    oell(lay, lay + "_belly", c + Vector((0, 0, 0.39)), (0.3, 0.3, 0.16), "#a0522d", segs=18)
    otube(lay, lay + "_head", c + Vector((0, 0, 0.58)), c + Vector((0, 0, 0.6)), 0.28, 0.28, "#efe3c8", segs=18)
    for z in (0.22, 0.56):
        for k in range(10):
            a = 2 * math.pi * k / 10
            oell(lay, f"{lay}_tack{z}{k}", c + Vector((math.cos(a) * 0.28, math.sin(a) * 0.28, z)), (0.014, 0.014, 0.014), "#2a2522", outline=False, segs=6, rings=4)
    for s in (-1, 1):   # two drumsticks (bachi) resting on the head
        otube(lay, f"{lay}_bachi{s}", c + Vector((s * 0.05, -0.12, 0.62)), c + Vector((s * 0.2, 0.1, 0.63)), 0.016, 0.016, "#e2c290", segs=6)
deco("taiko-drum", 1.0, drum)

def banner(lay, w, h):
    # hangs on the top wall: red cloth, gold rod, a white circle with 心 (kokoro: heart, spirit)
    x = w / 2; zc = 0.9
    a = grid(x, WF, 0)
    y = a.y - 0.03
    obox(lay, lay + "_rod", Vector((x, y - 0.03, zc + 0.36)), (0.62, 0.035, 0.035), "#d9a441")
    obox(lay, lay + "_cloth", Vector((x, y, zc)), (0.5, 0.02, 0.7), "#b8322a")
    for s in (-1, 1):
        obox(lay, f"{lay}_tail{s}", Vector((x + s * 0.15, y, zc - 0.4)), (0.16, 0.02, 0.14), "#b8322a", rot=(0, 0, 0))
    otube(lay, lay + "_circle", Vector((x, y - 0.012, zc + 0.05)), Vector((x, y - 0.02, zc + 0.05)), 0.2, 0.2, M("#fbf6ea", True), segs=24, outline=False)
    text(lay, lay + "_kanji", "心", Vector((x, y - 0.025, zc + 0.04)), 0.3, "#b8322a")
deco("dojo-banner", 0.35, banner)

def scroll(lay, w, h):
    # kakejiku: a hanging scroll with 道 (do: the way), blue-grey mount, wooden rods
    x = w / 2; zc = 0.82
    y = grid(x, WF, 0).y - 0.03
    obox(lay, lay + "_mount", Vector((x, y, zc)), (0.44, 0.02, 0.95), "#5a6b85")
    obox(lay, lay + "_paper", Vector((x, y - 0.012, zc - 0.02)), (0.32, 0.01, 0.7), M("#f6efdc", True), outline=False)
    obox(lay, lay + "_rodtop", Vector((x, y - 0.02, zc + 0.49)), (0.48, 0.035, 0.035), "#6b4428")
    obox(lay, lay + "_rodbot", Vector((x, y - 0.02, zc - 0.49)), (0.52, 0.045, 0.045), "#6b4428")
    obox(lay, lay + "_cord", Vector((x, y - 0.02, zc + 0.58)), (0.02, 0.01, 0.16), "#d9a441", outline=False)
    text(lay, lay + "_kanji", "道", Vector((x, y - 0.02, zc + 0.0)), 0.26, "#1d1a24")
    obox(lay, lay + "_seal", Vector((x + 0.09, y - 0.02, zc - 0.27)), (0.045, 0.004, 0.045), M("#c0392b", True), outline=False)
deco("calligraphy-scroll", 0.6, scroll)

# ======================================================================= MESS (floor spots, 1 x 1)
def dust(lay, seed):
    rnd = random.Random(seed)
    for k in range(rnd.randint(2, 3)):        # fluffy dust bunnies: soft clusters of little puffs, no hard outline
        c = Vector((rnd.uniform(0.3, 0.7), rnd.uniform(0.35, 0.7)))
        for q in range(7):
            p = grid(c.x + rnd.uniform(-0.12, 0.12), c.y + rnd.uniform(-0.08, 0.08), 0.0)
            s = rnd.uniform(0.04, 0.07)
            oell(lay, f"{lay}_{k}_{q}", p, (s, s, s * 0.7), rnd.choice(["#cfc8bb", "#bdb5a7", "#ddd7cb"]), outline=False)
def footprints(lay, seed):
    """Muddy footprints from outdoor shoes: a little trail of shoe prints (sole + heel) across the spot."""
    rnd = random.Random(seed); ang = rnd.uniform(-40, 40) + (0 if seed % 2 else 180)
    d = Vector((math.sin(math.radians(ang)), math.cos(math.radians(ang)))); side = Vector((d.y, -d.x))
    for k in range(4):
        t = -0.36 + 0.24 * k; sgn = 1 if k % 2 else -1
        c = Vector((0.5, 0.5)) + d * t + side * (0.085 * sgn)
        rot = (0, 0, -ang)
        for nm, off, sz in (("sole", 0.05, (0.065, 0.095, 0.004)), ("heel", -0.08, (0.055, 0.05, 0.004))):
            q = c + d * off
            oell(lay, f"{lay}_{k}{nm}", grid(q.x, q.y, 0.004), (sz[0], sz[1] * K, sz[2]), rnd.choice(["#7a5638", "#6e4c30"]),
                 rot=rot, outline=False, segs=12, rings=4)
    oell(lay, f"{lay}_smudge", grid(0.5 - d.x * 0.38, 0.5 - d.y * 0.38, 0.003), (0.05, 0.035 * K, 0.003), "#8a6644", outline=False, segs=10, rings=4)

def towel(lay, seed):
    """A dropped practice towel: soft blue, folded over and crumpled, with a white stripe."""
    rnd = random.Random(seed); c = grid(0.5, 0.55)
    r = rnd.uniform(-25, 25)
    obox(lay, lay + "_a", c + Vector((0, 0, 0.02)), (0.66, 0.4 * K * 0.8, 0.04), "#7fb3d9", rot=(0, 0, r), bevel=0.012)
    obox(lay, lay + "_b", c + Vector((0.07, -0.03, 0.055)), (0.42, 0.28 * K * 0.8, 0.035), "#8cbde0", rot=(4, -6, r + 12), bevel=0.012)
    obox(lay, lay + "_stripe", c + Vector((0.07, -0.03, 0.072)), (0.43, 0.045, 0.006), M("#f6efdc", True), rot=(4, -6, r + 12), outline=False)

def bottle(lay, seed):
    """A water bottle left on the floor, lying on its side: clear blue body, white cap, a little label."""
    c = grid(0.5, 0.55, 0.1); r = math.radians(20 if seed % 2 else -25)
    d = Vector((math.cos(r), math.sin(r) * K * 0.6, 0))
    otube(lay, lay + "_body", c - d * 0.24, c + d * 0.17, 0.1, 0.1, "#6fb6e0", segs=16)
    otube(lay, lay + "_neck", c + d * 0.17, c + d * 0.24, 0.1, 0.055, "#6fb6e0", segs=16)
    otube(lay, lay + "_cap", c + d * 0.24, c + d * 0.32, 0.058, 0.058, "#f6efdc", segs=16)
    otube(lay, lay + "_label", c - d * 0.08, c + d * 0.06, 0.103, 0.103, "#ffd36b", segs=16, outline=False)
    oell(lay, lay + "_shine", c + Vector((0, -0.045, 0.07)) - d * 0.07, (0.11, 0.02, 0.015), M("#d6eefa", True), rot=(0, 0, math.degrees(r)), outline=False)

for i in range(3):
    dust(f"dust-{i + 1}", 11 + i); target(f"dust-{i + 1}", [f"dust-{i + 1}"], [0, 0, 1, 1], 0.1, anchor=[0.5, 0.5], footprint=[1, 1],
                                           place="floor", group="mess", note="mess: a dust spot, centred on the spot (anchorPx = cell centre). Clean = not drawn")
# Jay's review: the fallen leaves looked out of place. The game's 'leaf' floor-spot kind now draws one of these
# (things that clearly belong in a dojo and need tidying): muddy footprints or dropped gear.
LITTER = [("footprints-1", footprints, 31, "muddy footprints from outdoor shoes"), ("footprints-2", footprints, 32, "muddy footprints from outdoor shoes"),
          ("towel", towel, 33, "a dropped towel"), ("water-bottle", bottle, 34, "a water bottle left on the floor")]
for nm, fn, sd, what in LITTER:
    fn(nm, sd); target(nm, [nm], [0, 0, 1, 1], 0.2, anchor=[0.5, 0.5], footprint=[1, 1], place="floor", group="mess",
                       info={"spotKind": "leaf", "what": what},
                       note=f"mess: {what}, centred on the spot (anchorPx = cell centre). Replaces the fallen leaves: draw for the game's 'leaf' floor spots (pick one of footprints-1, footprints-2, towel, water-bottle). Clean = not drawn")

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
