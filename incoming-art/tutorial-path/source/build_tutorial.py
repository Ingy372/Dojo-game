"""
Dojo Ascent - TUT-A1 tutorial art (Art Director bot): the Tower Path kit, the falling stone and its landing dust,
the straw practice dummies (small and big) and the stumble stars. Plan: drafts/planning/TUT-P1.md (#517).

Same camera, toon look, outline and 80 px tiles as every room kit (tools/render_static.py).
The red ground circle is NOT here: the game reuses its own enemy-warning circle for the stones.

    blender -b -P incoming-art/tutorial-path/source/build_tutorial.py -- --out incoming-art/tutorial-path/source/tutorial.blend
    blender -b incoming-art/tutorial-path/source/tutorial.blend -P incoming-art/tools/render_static.py -- --out incoming-art/tutorial-path/sprites
    python3 incoming-art/tutorial-path/source/make_tut_preview.py
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box, OUTLINE_W
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); A = ap.parse_args(argv)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene; scene.name = "Tutorial"; scene.render.fps = 12
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

def par(o, p):
    bpy.context.view_layer.update(); o.parent = p; o.matrix_parent_inverse = p.matrix_world.inverted()
def rock_bm(c, s, seed, jit=0.10, segs=9, rings=6):
    """A chunky, friendly cartoon stone: a squashed sphere with soft random facets (no cracks)."""
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    rnd = random.Random(seed)
    for v in bm.verts:
        k = 1 + rnd.uniform(-jit, jit)
        v.co = Vector((v.co.x * s[0] * k, v.co.y * s[1] * k, v.co.z * s[2] * k)) + c
    return bm
random.seed(7)
F_STATIC = 1

# ------------------------------------------------------------------ Tower Path ground tiles (80 x 80)
GRASS = ["#8fd16a", "#86c962", "#97d672"]; GDARK = "#6fb04f"
PATH = ["#e6d3a6", "#dcc796", "#ead9b2"]; PGROUT = "#b9a27a"
def grass_base(lay, flowers=False):
    gbox(lay, lay + "_soil", 0, 0, 1, 1, -0.04, 0.0, GRASS[0], outline=False, flat=True)
    rnd = random.Random(lay)
    for i in range(7):   # soft lighter and darker patches, kept inside the tile so it tiles
        x, y = rnd.uniform(0.15, 0.85), rnd.uniform(0.15, 0.85)
        put(f"{lay}_p{i}", ellipsoid(grid(x, y, 0.001), (rnd.uniform(.08, .14), rnd.uniform(.08, .14) * K, 0.002), segs=12, rings=3),
            M(GRASS[1 + i % 2], True), lay, outline=False)
    for i in range(6):   # little tufts
        x, y = rnd.uniform(0.12, 0.88), rnd.uniform(0.12, 0.88)
        for j, dx in enumerate((-0.025, 0, 0.025)):
            otube(lay, f"{lay}_t{i}{j}", grid(x + dx, y), grid(x + dx * 1.8, y, 0.07 + 0.02 * (j == 1)), 0.012, 0.002, GDARK, segs=5, outline=False, flat=True)
    if flowers:
        cols = ["#fff6d8", "#ffd34d", "#a9c8ff", "#ffffff"]
        for i in range(5):
            x, y = rnd.uniform(0.15, 0.85), rnd.uniform(0.15, 0.85)
            otube(lay, f"{lay}_fs{i}", grid(x, y), grid(x, y, 0.06), 0.008, 0.008, GDARK, segs=5, outline=False, flat=True)
            oell(lay, f"{lay}_f{i}", grid(x, y, 0.07), (0.035, 0.035, 0.02), cols[i % 4], segs=8, rings=4)
            oell(lay, f"{lay}_fc{i}", grid(x, y, 0.085), (0.012, 0.012, 0.008), "#f2a33a", segs=6, rings=3, outline=False, flat=True)
def path_tile(lay, edges=""):
    """Warm flagstone path. edges: 'w' and/or 'e' adds a grass verge on that side (so the path can be 1-3 tiles wide)."""
    gbox(lay, lay + "_grout", 0, 0, 1, 1, -0.04, -0.005, PGROUT, outline=False, flat=True)
    rnd = random.Random(lay)
    stones = [(0.02, 0.02, 0.56, 0.48), (0.58, 0.02, 0.98, 0.48), (0.02, 0.52, 0.40, 0.98), (0.42, 0.52, 0.98, 0.98)]
    for i, (a, b, c, d) in enumerate(stones):
        gbox(lay, f"{lay}_s{i}", a + .015, b + .015, c - .015, d - .015, -0.005, 0.012, PATH[i % 3], outline=False, bevel=0.01)
    for i in range(3):
        x, y = rnd.uniform(.15, .85), rnd.uniform(.15, .85)
        put(f"{lay}_pb{i}", ellipsoid(grid(x, y, 0.013), (0.03, 0.03 * K, 0.004), segs=8, rings=3), M("#cdb88a", True), lay, outline=False)
    for side in edges:
        x0, x1 = (0, 0.2) if side == "w" else (0.8, 1)
        gbox(lay, f"{lay}_v{side}", x0, 0, x1, 1, -0.004, 0.016, GRASS[0], outline=False, flat=True)
        ex = 0.2 if side == "w" else 0.8
        for k in range(5):
            y = 0.1 + k * 0.2
            oell(lay, f"{lay}_vt{side}{k}", grid(ex + (-0.01 if side == "w" else 0.01), y, 0.02), (0.05, 0.07, 0.03), GRASS[k % 3], segs=8, rings=4, outline=False)
for nm, fl in (("grass", False), ("grass-flowers", True)):
    grass_base(nm, fl); target(nm, [nm], [0, 0, 1, 1], 0, anchor=[0, 0], group="tiles", note=f"{nm} ground tile, exactly 80 x 80 px; anchorPx = top-left corner of the cell. Tiles seamlessly")
for nm, ed in (("path", ""), ("path-edge-w", "w"), ("path-edge-e", "e")):
    path_tile(nm, ed); target(nm, [nm], [0, 0, 1, 1], 0, anchor=[0, 0], group="tiles", note=f"{nm}: flagstone path tile, 80 x 80 px; anchorPx = top-left of the cell" + (f"; grass verge on the {ed} side" if ed else ""))

# ------------------------------------------------------------------ hedge edge (like wall-face / wall-block in the Tower kits)
def hedge(lay, face):
    h = 0.55
    gbox(lay, lay + "_foot", 0, 0.55 if face else 0.1, 1, 1 if face else 0.9, 0, 0.12, "#c8b48a", bevel=0.02)
    for i in range(3):
        x = 0.18 + i * 0.32
        oell(lay, f"{lay}_b{i}", grid(x, 0.75 if face else 0.5, 0.12 + h * 0.5), (0.24, 0.2 * K if face else 0.26 * K, h * 0.62), "#5fae55", segs=14, rings=9)
        oell(lay, f"{lay}_h{i}", grid(x - 0.06, 0.7 if face else 0.45, 0.12 + h * 0.8), (0.1, 0.08 * K, 0.1), "#7cc96a", segs=10, rings=6, outline=False)
for nm, face in (("hedge-face", True), ("hedge-block", False)):
    hedge(nm, face)
    target(nm, [nm], [0, 0, 1, 1], 0.6, anchor=[0, 1], group="tiles",
           note=("low hedge on a stone kerb for the room's top edge, one tile wide; repeat along the top row" if face else
                 "the same hedge seen from above, for the side and bottom edges") + "; anchorPx = bottom-left of its cell; blocks the cell")

# ------------------------------------------------------------------ the Tower's foot with its big door (the path leads here)
def tower_foot():
    lay = "tower-foot"; c0 = 0; W = 5
    gbox(lay, lay + "_step1", 1.2, 1.55, 3.8, 2.0, 0, 0.12, "#d9cba8", bevel=0.02)
    gbox(lay, lay + "_step2", 1.4, 1.2, 3.6, 1.6, 0, 0.24, "#e3d6b4", bevel=0.02)
    gbox(lay, lay + "_base", 0.0, 0.3, 5.0, 1.25, 0, 0.4, "#c4b598", bevel=0.03)
    gbox(lay, lay + "_wall", 0.15, 0.35, 4.85, 1.15, 0.4, 2.3, "#efe4c8", bevel=0.02)
    for x in (0.15, 4.45):  # corner posts
        gbox(lay, f"{lay}_post{x}", x, 0.3, x + 0.4, 1.22, 0.4, 2.45, "#a46e40", bevel=0.02)
    gbox(lay, lay + "_beam", 0.05, 0.3, 4.95, 1.22, 2.3, 2.5, "#a46e40", bevel=0.02)
    # roof: two sloped eaves (a prism each) in the tower's soft blue-slate with gold trim on the front edge
    def prism(name, c0, c1, rf, rb, ze, zr, col):
        bm = bmesh.new(); rm = (rf + rb) / 2
        v = [bm.verts.new(p) for p in (grid(c0, rf, ze), grid(c1, rf, ze), grid(c1, rm, zr), grid(c0, rm, zr), grid(c0, rb, ze), grid(c1, rb, ze))]
        for f in ((0, 1, 2, 3), (3, 2, 5, 4), (0, 3, 4), (1, 5, 2), (0, 4, 5, 1)):
            bm.faces.new([v[i] for i in f])
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        return put(name, bm, M(col), lay)
    prism(lay + "_roof0", -0.35, 5.35, 1.45, -0.1, 2.35, 3.05, "#5b74b8")
    a2, b2 = grid(-0.35, 1.47, 2.3), grid(5.35, 1.4, 2.4)
    put(lay + "_trim0", box((a2 + b2) / 2, Vector((abs(b2.x - a2.x), abs(b2.y - a2.y), 0.1))), M("#e0b04a"), lay, outline=False)
    gbox(lay, lay + "_upper", 0.9, 0.45, 4.1, 0.95, 2.6, 3.6, "#efe4c8", bevel=0.02)
    for x in (1.6, 2.5, 3.4):
        put(f"{lay}_uwin{x}", box(grid(x, 0.96, 3.15), Vector((0.22, 0.02, 0.36)), bevel=0.01), M("#ffd66e", True), lay)
    prism(lay + "_roof1", 0.55, 4.45, 1.15, 0.2, 3.55, 4.05, "#4f67aa")
    a3, b3 = grid(0.55, 1.17, 3.5), grid(4.45, 1.1, 3.6)
    put(lay + "_trim1", box((a3 + b3) / 2, Vector((abs(b3.x - a3.x), abs(b3.y - a3.y), 0.1))), M("#e0b04a"), lay, outline=False)
    # the door: big, round-topped, warm wood with gold studs, a little open so the light shows
    dc = grid(2.5, 1.16)
    gbox(lay, lay + "_frame", 1.75, 1.1, 3.25, 1.2, 0.4, 2.05, "#8a5a32", bevel=0.02)
    gbox(lay, lay + "_door", 1.9, 1.15, 3.1, 1.21, 0.4, 1.9, "#b57a45", bevel=0.01)
    gbox(lay, lay + "_gap", 2.47, 1.16, 2.53, 1.215, 0.42, 1.88, M("#ffe48a", True), outline=False)
    for x in (2.1, 2.9):
        for z in (0.7, 1.15, 1.6):
            oell(lay, f"{lay}_stud{x}{z}", grid(x, 1.215, z), (0.035, 0.02, 0.035), "#ffd36b", segs=8, rings=4, outline=False)
    oell(lay, lay + "_ring", grid(2.38, 1.22, 1.1), (0.05, 0.02, 0.05), "#ffd36b", segs=10, rings=4)
    # round gold sign medallion (no text: a blank disc the game can leave as is)
    put(lay + "_medal", tube(grid(2.5, 1.2, 2.22) + Vector((0, -0.02, 0)), grid(2.5, 1.2, 2.22) + Vector((0, -0.08, 0)), 0.16, 0.16, segs=20), M("#e0b04a"), lay, smooth=True)
    put(lay + "_medal2", star_bm(0.09, 0.45), M("#fff3c4", True), lay, outline=False).location = grid(2.5, 1.2, 2.22) + Vector((0, -0.1, 0))
    # lanterns either side of the steps
    for x in (0.9, 4.1):
        p = grid(x, 1.7)
        obox(lay, f"{lay}_lb{x}", p + Vector((0, 0, 0.1)), (0.22, 0.22, 0.2), "#bdb6a6", bevel=0.02)
        otube(lay, f"{lay}_lp{x}", p + Vector((0, 0, 0.2)), p + Vector((0, 0, 0.55)), 0.05, 0.05, "#bdb6a6", segs=8)
        obox(lay, f"{lay}_lh{x}", p + Vector((0, 0, 0.67)), (0.24, 0.24, 0.22), "#ffe7b0", bevel=0.02)
        obox(lay, f"{lay}_lr{x}", p + Vector((0, 0, 0.82)), (0.32, 0.32, 0.08), "#8e877a", bevel=0.03)
    # windows, warm and lit (the light is coming back)
    for x in (0.9, 4.1):
        put(f"{lay}_win{x}", box(grid(x, 1.16, 1.5), Vector((0.36, 0.02, 0.5)), bevel=0.01), M("#ffd66e", True), lay, outline=True)
    target(lay, [lay], [-0.4, 0, 5.4, 2], 3.6, anchor=[2.5, 2], group="tower",
           note="the foot of the Tower with its big door, 5 tiles wide and 2 deep (the steps are the bottom row); place across the top of the Tower Path room so the path ends at the steps. anchorPx = bottom-centre of the 5x2 footprint. The door is the 'D' spot; the bow happens on the steps")
tower_foot()

# ------------------------------------------------------------------ decor: bush, small rocks, a tree
def bush():
    lay = "decor-bush"; c = grid(0.5, 0.55)
    for i, (dx, dz, s) in enumerate(((-0.15, 0.2, 0.22), (0.15, 0.2, 0.22), (0, 0.32, 0.26))):
        oell(lay, f"{lay}_{i}", c + Vector((dx, 0, dz)), (s, s * 0.9, s * 0.9), "#62b45a", segs=14, rings=9)
    for i in range(3):
        oell(lay, f"{lay}_fl{i}", c + Vector((-0.15 + i * 0.15, -0.2, 0.32 + 0.08 * (i == 1))), (0.04, 0.02, 0.04), "#fff6d8", segs=8, rings=4)
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], 0.6, anchor=[0.5, 1], group="decor", note="round flowering bush (blocks 1 cell)")
def rocks():
    lay = "decor-rocks"; c = grid(0.5, 0.55)
    for i, (dx, dy, s) in enumerate(((-0.12, 0.05, (0.2, 0.17, 0.15)), (0.16, -0.04, (0.14, 0.12, 0.1)), (0.02, -0.18, (0.09, 0.08, 0.06)))):
        put(f"{lay}_{i}", rock_bm(c + Vector((dx, dy * K, s[2] * 0.7)), s, i), M("#a9b0bf"), lay)
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], 0.3, anchor=[0.5, 1], group="decor", note="a few small path-side rocks (blocks 1 cell)")
def tree():
    lay = "decor-tree"; c = grid(0.5, 0.6)
    otube(lay, lay + "_trunk", c, c + Vector((0, 0, 0.8)), 0.1, 0.07, "#a46e40", segs=10)
    for i, (dx, dz, s) in enumerate(((0, 1.0, 0.42), (-0.25, 0.85, 0.28), (0.26, 0.88, 0.3), (0, 1.3, 0.3))):
        oell(lay, f"{lay}_c{i}", c + Vector((dx, 0, dz)), (s, s * 0.9, s * 0.85), ["#5fae55", "#6cbb60", "#57a54e", "#78c76a"][i], segs=14, rings=9)
    for i in range(4):
        oell(lay, f"{lay}_bl{i}", c + Vector((-0.25 + i * 0.17, -0.3, 0.95 + 0.12 * (i % 2))), (0.05, 0.02, 0.05), "#ffd1e8", segs=8, rings=4)
    target(lay, [lay], [-0.25, 0, 1.25, 1.1], 2.0, anchor=[0.5, 1], group="decor", note="a round blossom tree for the path's sides (blocks 1 cell)")
bush(); rocks(); tree()

# ------------------------------------------------------------------ the falling stone + landing dust
STONE_C = "#9fa8bb"; STONE_TOP = "#c3cad8"
def stone():
    root_c = grid(20.5, 0.5)
    for lay, frames in (("stone", None), ("stone-land", (20, 31))):
        root = empty(lay + "_root", root_c if lay == "stone" else root_c + Vector((4, 0, 0)))
        c = root.location.copy()
        put(lay + "_rock", rock_bm(c + Vector((0, 0, 0.2)), (0.24, 0.22, 0.2), 11, jit=0.08), M(STONE_C), lay, parent=root)
        put(lay + "_cap", rock_bm(c + Vector((-0.04, 0.02, 0.33)), (0.14, 0.12, 0.07), 12, jit=0.06), M(STONE_TOP), lay, outline=False, parent=root)
        put(lay + "_moss", rock_bm(c + Vector((0.08, 0.06, 0.37)), (0.07, 0.06, 0.03), 13, jit=0.05), M("#7cc96a"), lay, outline=False, parent=root)
        if lay == "stone":
            target(lay, [lay], [20, 0, 21, 1], 0.2, anchor=[20.5, 0.5], group="stone",
                   note="the falling stone (1 frame). The game drops it from above onto the red circle's centre (anchorPx = its resting ground point), then swaps to stone-land on the landing tick. Its shadow is the red circle itself")
            continue
        # land: squash on impact, little bounce, settle, then a soft pop away (shrinks) while the dust rises
        kf(root, 20, sc=(1.25, 1.25, 0.7)); kf(root, 21, sc=(0.92, 0.92, 1.12)); kf(root, 22, sc=(1.05, 1.05, 0.95)); kf(root, 23, sc=1.0)
        kf(root, 27, sc=1.0); kf(root, 30, sc=0.35); kf(root, 31, sc=0.0)
        dust = "stone-dust"; dc = c
        for i in range(8):
            a = i * math.pi / 4 + 0.2
            d = Vector((math.cos(a), math.sin(a) * K * 0.9, 0))
            e = empty(f"{dust}_e{i}", dc + d * 0.18 + Vector((0, 0, 0.05)))
            oell(dust, f"{dust}_{i}", e.location.copy(), (0.1, 0.1, 0.08), "#f1e6cf", segs=10, rings=6, parent=e)
            kf(e, 19, loc=dc + d * 0.18 + Vector((0, 0, 0.05)), sc=0.0)
            kf(e, 20, sc=0.6)
            kf(e, 24, loc=dc + d * 0.42 + Vector((0, 0, 0.14)), sc=1.15)
            kf(e, 29, loc=dc + d * 0.55 + Vector((0, 0, 0.2)), sc=0.55)
            kf(e, 31, sc=0.0)
        target(lay, [lay, dust], [23.9, -0.4, 25.1, 1.4], 0.3, anchor=[24.5, 0.5], frames=[20, 31], fps=12, group="stone",
               keyFrames={"impact": 0, "settled": 3, "popAway": [7, 11]},
               note="12 frames at 12 fps (1 s), plays once on the landing tick: impact squash (0), bounce (1-2), sits (3-7), shrinks away (8-11). The stone-dust layer is the cartoon puff ring; draw it over the stone. Same anchor as 'stone'. Cue a soft thud on frame 0")
stone()

# ------------------------------------------------------------------ straw practice dummies
def dummy(lay, cx, big):
    s = 1.45 if big else 1.15
    c = grid(cx, 0.6)
    root = empty(lay + "_root", c)            # pivot at the foot: hits rock it back and forth
    # wooden stand: two crossed feet and a post (the post shows as 'legs' under the straw)
    for k, ang in enumerate((25, -25)):
        obox(lay, f"{lay}_foot{k}", c + Vector((0, 0, 0.035)), (0.46 * s, 0.07 * s, 0.07), "#8a5a32", rot=(0, 0, ang), bevel=0.015, parent=root)
    otube(lay, lay + "_post", c + Vector((0, 0, 0.05)), c + Vector((0, 0, 0.5 * s)), 0.04 * s, 0.04 * s, "#8a5a32", segs=10, parent=root)
    # straw body: a stout bundle with a rounded bottom fringe and two rope ties
    b0, b1 = 0.24 * s, 0.66 * s
    put(lay + "_body", tube(c + Vector((0, 0, b0)), c + Vector((0, 0, b1)), 0.17 * s, 0.155 * s, segs=18), M("#ecc65e"), lay, smooth=True, parent=root)
    oell(lay, lay + "_bodytop", c + Vector((0, 0, b1)), (0.155 * s, 0.155 * s, 0.045 * s), "#ecc65e", segs=16, rings=6, outline=False, parent=root)
    put(lay + "_skirt", tube(c + Vector((0, 0, b0 + 0.05 * s)), c + Vector((0, 0, b0 - 0.07 * s)), 0.17 * s, 0.2 * s, segs=18), M("#e2b84f"), lay, smooth=True, parent=root)
    for i in range(7):
        a = -math.pi * 0.95 + i * math.pi * 0.3
        p0 = c + Vector((math.cos(a) * 0.172 * s, math.sin(a) * 0.172 * s, b0 + 0.06 * s)); p1 = c + Vector((math.cos(a) * 0.157 * s, math.sin(a) * 0.157 * s, b1 - 0.02 * s))
        otube(lay, f"{lay}_sl{i}", p0, p1, 0.006 * s, 0.006 * s, "#d9a93c", segs=4, outline=False, parent=root, flat=True)
    for zz in (b0 + 0.1 * s, b1 - 0.05 * s):
        r = 0.168 * s
        put(f"{lay}_tie{zz:.2f}", tube(c + Vector((0, 0, zz - 0.016 * s)), c + Vector((0, 0, zz + 0.016 * s)), r, r, segs=16), M("#b8783f"), lay, outline=False, smooth=True, parent=root)
    body_c = c + Vector((0, 0, (b0 + b1) / 2))
    # target patch on the chest: blue and white rings (never red)
    tc = body_c + Vector((0, -0.163 * s, 0.03 * s))
    for k, (rr, col) in enumerate(((0.085, "#ffffff"), (0.062, "#4f7fd6"), (0.038, "#ffffff"), (0.017, "#4f7fd6"))):
        put(f"{lay}_tg{k}", tube(tc + Vector((0, 0.004 * k, 0)), tc + Vector((0, -0.006 - 0.004 * k, 0)), rr * s, rr * s, segs=20), M(col, True), lay,
            outline=(k == 0), smooth=True, parent=root)
    # arms: a cross-bar with padded straw ends tied with rope
    al = (0.34 if big else 0.29) * s
    otube(lay, lay + "_bar", c + Vector((-al, 0.02, 0.58 * s)), c + Vector((al, 0.02, 0.58 * s)), 0.03 * s, 0.03 * s, "#8a5a32", segs=8, parent=root)
    for sx in (-1, 1):
        oell(lay, f"{lay}_arm{sx}", c + Vector((sx * (al - 0.03 * s), 0, 0.58 * s)), ((0.1 if big else 0.08) * s, 0.065 * s, 0.065 * s), "#ecc65e", segs=12, rings=7, parent=root)
        put(f"{lay}_armtie{sx}", tube(c + Vector((sx * (al - 0.1 * s), 0, 0.58 * s)), c + Vector((sx * (al - 0.075 * s), 0, 0.58 * s)), 0.058 * s, 0.058 * s, segs=12), M("#b8783f"), lay, outline=False, smooth=True, parent=root).rotation_euler = (0, 0, 0)
    # neck tie and a big round straw head (no face), with a little top knot
    put(lay + "_neck", tube(c + Vector((0, 0, b1 + 0.02 * s)), c + Vector((0, 0, b1 + 0.06 * s)), 0.07 * s, 0.07 * s, segs=12), M("#b8783f"), lay, smooth=True, parent=root)
    hc = c + Vector((0, 0, b1 + 0.17 * s))
    oell(lay, lay + "_head", hc, (0.13 * s, 0.12 * s, 0.12 * s), "#efcd6a", segs=16, rings=10, parent=root)
    for i in range(5):
        a = -0.9 + i * 0.45
        p0 = hc + Vector((math.sin(a) * 0.12 * s, -math.cos(a) * 0.115 * s * 0.4 - 0.06 * s, -0.08 * s))
        p1 = hc + Vector((math.sin(a) * 0.1 * s, -math.cos(a) * 0.115 * s * 0.4 - 0.07 * s, 0.07 * s))
        otube(lay, f"{lay}_hl{i}", p0, p1, 0.005 * s, 0.005 * s, "#d9a93c", segs=4, outline=False, parent=root, flat=True)
    oell(lay, lay + "_topknot", hc + Vector((0, 0.02, 0.12 * s)), (0.05 * s, 0.05 * s, 0.045 * s), "#e2b84f", segs=10, rings=6, parent=root)
    if big:   # the big one wears a gold sash so it reads as 'the big one'
        put(lay + "_sash", tube(c + Vector((0, 0, b0 + 0.17 * s)), c + Vector((0, 0, b0 + 0.22 * s)), 0.172 * s, 0.172 * s, segs=18), M("#f2b43a"), lay, outline=False, smooth=True, parent=root)
    puff = lay + "-puff"   # straw bits that burst out when it's beaten
    bits = []
    for i in range(10):
        a = i * math.tau / 10
        e = empty(f"{puff}_e{i}", body_c)
        o = otube(puff, f"{puff}_{i}", body_c - Vector((0.04, 0, 0)), body_c + Vector((0.04, 0, 0)), 0.014 * s, 0.014 * s, "#ecc65e", segs=5, parent=e)
        bits.append((e, a))
    sp = []
    for i in range(5):
        e = empty(f"{puff}_se{i}", body_c)
        put(f"{puff}_star{i}", star_bm(0.06 * s, 0.4), M("#fff3c4", True), puff, outline=False, parent=e)
        sp.append((e, i * math.tau / 5 + 0.3))
    # timeline: idle 1 (still), hit 40-47, defeat 50-61
    o0 = 0 if not big else 100
    kf(root, 1, rot=(0, 0, 0), sc=1.0)
    for f, ang, sq in ((40, 0, 1.0), (41, 14, 0.94), (42, -9, 1.03), (43, 6, 1.0), (44, -3, 1.0), (45, 1.5, 1.0), (46, 0, 1.0), (47, 0, 1.0)):
        kf(root, f + o0, rot=(ang, 0, 0), sc=(1 / sq ** 0.5, 1 / sq ** 0.5, sq))
    for f, ang, sv in ((50, 0, 1.0), (51, 16, 1.0), (52, -12, 1.0), (53, 10, 1.05), (55, 0, 1.12), (57, 0, 0.5), (58, 0, 0.0)):
        kf(root, f + o0, rot=(ang, 0, 0), sc=max(sv, 0))
    for e, a in bits:
        d = Vector((math.cos(a), 0.3 * math.sin(a), math.sin(a) * 0.8 + 0.3))
        kf(e, 1, loc=body_c, sc=0.0); kf(e, 55 + o0, loc=body_c, sc=0.0)
        e.rotation_euler = (0, a, 0)
        kf(e, 56 + o0, loc=body_c + d * 0.1 * s, sc=1.0)
        kf(e, 59 + o0, loc=body_c + d * 0.42 * s, sc=1.0)
        kf(e, 61 + o0, loc=body_c + d * 0.5 * s - Vector((0, 0, 0.1)), sc=0.0)
    for e, a in sp:
        d = Vector((math.cos(a), 0, math.sin(a)))
        kf(e, 1, loc=body_c, sc=0.0); kf(e, 56 + o0, loc=body_c, sc=0.0)
        kf(e, 58 + o0, loc=body_c + d * 0.3 * s, sc=1.3); kf(e, 61 + o0, loc=body_c + d * 0.45 * s, sc=0.0)
    w = 1.0 if not big else 1.7
    rect = [cx - 0.5 * w - 0.1, -0.1, cx + 0.5 * w + 0.1, 1.0]
    top = 1.3 if not big else 1.75
    nm = "dummy-big" if big else "dummy-small"
    target(nm + "-idle", [lay], rect, top, anchor=[cx, 0.6], group="dummy",
           note=f"{nm}: still idle (it never moves or attacks). anchorPx = its foot point on the ground")
    target(nm + "-hit", [lay], rect, top, anchor=[cx, 0.6], frames=[40 + o0, 47 + o0], fps=16, group="dummy",
           note=f"{nm}: hit wobble, 8 frames at 16 fps (0.5 s), once per hit; restart on each new hit. Ends on the idle pose")
    target(nm + "-defeat", [lay, puff], rect, top + 0.2, anchor=[cx, 0.6], frames=[50 + o0, 61 + o0], fps=12, group="dummy",
           keyFrames={"lastWobble": 3, "pop": 7},
           note=f"{nm}: beaten, 12 frames at 12 fps (1 s), once: wobbles, puffs up, then pops into straw bits and little stars (no breaking or tearing). Layers: {lay} then {puff} on top. Cue a soft 'poof' on frame 7")
dummy("dummy-small", 30.5, False)
dummy("dummy-big", 34.5, True)

# ------------------------------------------------------------------ stumble stars (circle above the hero's head)
def stars():
    lay = "stumble-stars"; c = grid(40.5, 0.5, 0.0)
    ring = empty(lay + "_ring", c)
    cols = ["#ffd34d", "#fff3c4", "#ffd34d"]
    for i in range(3):
        a = i * math.tau / 3
        e = empty(f"{lay}_e{i}", c + Vector((math.cos(a) * 0.36, math.sin(a) * 0.36, 0))); par(e, ring)
        o = put(f"{lay}_s{i}", star_bm(0.17 if i != 1 else 0.14, 0.45), M(cols[i]), lay, outline=True, parent=e)
        o.location = e.location.copy()
        o.rotation_euler = (math.radians(-20), 0, 0)
    ring.rotation_euler = (0, 0, 0); ring.keyframe_insert("rotation_euler", frame=70)
    ring.rotation_euler = (0, 0, math.tau * 11 / 12); ring.keyframe_insert("rotation_euler", frame=81)
    for fc in ring.animation_data.action.fcurves:
        for k in fc.keyframe_points: k.interpolation = "LINEAR"
    target(lay, [lay], [39.7, -0.45, 41.3, 1.45], 0.5, anchor=[40.5, 0.5], frames=[70, 81], fps=12, loop=True, group="fx",
           note="3 little stars circling (12-frame loop at 12 fps = 1 s) for the stumble. anchorPx = the ring's centre: put it on the top of the hero's head. Plays only for the short stumble pause; gold and cream, never red")
stars()

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
