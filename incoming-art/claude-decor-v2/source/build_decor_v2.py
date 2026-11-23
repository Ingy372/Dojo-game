"""Home Dojo decorations v2 (Claude, Nov 22; Jay: "add items for players to buy or unlock with achievements to decorate
their dojo"). Same game camera, grid and static renderer as the A6 set, in the v2 glossy look with the bold outline.

    blender -b -P build_decor_v2.py -- --out decor_v2.blend
    blender -b decor_v2.blend -P ../../tools/render_static.py -- --out ../sprites
"""
import bpy, bmesh, math, sys, os, argparse, json
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
sys.path.insert(0, os.path.join(HERE, "..", "..", "claude-hero-v2", "source"))
from toon_kit import outline_material, add_hull, ellipsoid, tube, box  # noqa: E402
from hero_shading import glossy  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
A = ap.parse_args(argv)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
K = 1 / math.sin(math.radians(35))
OUTLINE = outline_material()
OW = 0.02
WF = 1.0


def grid(c, r, z=0.0):
    return Vector((c, -r * K, z))


def M(hex_color, rim=0.2, glow=0.0, flat=False):
    return glossy(f"d_{hex_color}_{rim}_{glow}_{flat}", hex_color, rim=rim, glow=glow, flat=flat)


COLL = {}


def layer(name):
    if name not in COLL:
        c = bpy.data.collections.new("L_" + name)
        scene.collection.children.link(c)
        COLL[name] = c
    return COLL[name]


def put(lay, name, bm, mat, outline=True, smooth=True):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = smooth
    me.materials.append(mat if not isinstance(mat, str) else M(mat))
    ob = bpy.data.objects.new(name, me)
    layer(lay).objects.link(ob)
    if outline:
        add_hull(ob, layer(lay), OUTLINE, OW)
    return ob


n = [0]


def nm(lay):
    n[0] += 1
    return f"{lay}_{n[0]}"


def B(lay, c, s, mat, rot=(0, 0, 0), bevel=0.0, outline=True):
    return put(lay, nm(lay), box(c, s, rot=rot, bevel=bevel), mat, outline, smooth=bevel > 0)


def E(lay, c, s, mat, rot=(0, 0, 0), outline=True, segs=18, rings=12):
    return put(lay, nm(lay), ellipsoid(c, s, rot=rot, segs=segs, rings=rings), mat, outline)


def T(lay, p0, p1, r0, r1, mat, segs=16, outline=True, sx=1, sy=1):
    return put(lay, nm(lay), tube(p0, p1, r0, r1, segs=segs, sx=sx, sy=sy), mat, outline)


def cone(lay, base, h, r, mat, segs=8, rot=None, outline=True, r2=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r2, depth=h)
    m = Matrix.Translation(base + Vector((0, 0, h / 2)))
    if rot:
        m = Matrix.Translation(base) @ Euler([math.radians(x) for x in rot]).to_matrix().to_4x4() @ Matrix.Translation((0, 0, h / 2))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)
    return put(lay, nm(lay), bm, mat, outline, smooth=False)


def ring(lay, c, R, r, mat, segs=24, outline=False, scale_y=1.0):
    bm = bmesh.new()
    for i in range(segs):
        t = i / segs * math.tau
        p = c + Vector((math.cos(t) * R, math.sin(t) * R * scale_y, 0))
        e = ellipsoid(p, (r, r, r), segs=8, rings=6)
        me = bpy.data.meshes.new("tmp")
        e.to_mesh(me)
        e.free()
        bm.from_mesh(me)
        bpy.data.meshes.remove(me)
    return put(lay, nm(lay), bm, mat, outline)


TARGETS = []


def emit(name, w, h, place, top, info):
    if place == "wall":
        TARGETS.append(dict(name=name, layers=[name], rect=[0, 0, w, 1], top=top, anchor=[w / 2, 1], footprint=[w, h], place="wall",
                            group="decor-v2", info=info, note="wall item: anchorPx = bottom-centre of its top-wall cell"))
    else:
        TARGETS.append(dict(name=name, layers=[name], rect=[-0.15, 0, w + 0.15, h + 0.12], top=top, anchor=[w / 2, h], footprint=[w, h],
                            place="floor", group="decor-v2", info=info, note="anchorPx = bottom-centre of the footprint"))


WOOD_D, WOOD, WOOD_L = "#6b4428", "#a46e40", "#d0a06a"
GOLD, RED, JADE, STONE, STONE_D = "#f2c14e", "#d23a32", "#56c48e", "#c9c2b2", "#98917f"


def base_plinth(lay, c, w=0.62, d=0.5, h=0.12, col=STONE_D):
    B(lay, c + Vector((0, 0, h / 2)), (w, d, h), col, bevel=0.02)
    return c + Vector((0, 0, h))


# =============================================================== SHOP PIECES
def lucky_cat(lay):
    c = grid(0.5, 0.5)
    t = base_plinth(lay, c, 0.5, 0.42, 0.08, RED)
    E(lay, t + Vector((0, 0, 0.2)), (0.17, 0.15, 0.2), "#fbf6ee")
    hd = t + Vector((0, -0.02, 0.48))
    E(lay, hd, (0.17, 0.15, 0.14), "#fbf6ee")
    for sx in (1, -1):
        cone(lay, hd + Vector((sx * 0.1, 0, 0.08)), 0.1, 0.05, "#fbf6ee", rot=(0, sx * -20, 0))
        E(lay, hd + Vector((sx * 0.06, -0.135, 0.02)), (0.022, 0.006, 0.03), "#2a2230", outline=False)
    E(lay, t + Vector((0.14, -0.04, 0.5)), (0.05, 0.05, 0.1), "#fbf6ee", rot=(0, -10, 0))    # raised paw
    E(lay, t + Vector((0, -0.14, 0.32)), (0.06, 0.02, 0.06), GOLD)                           # coin
    T(lay, t + Vector((-0.12, -0.12, 0.36)), t + Vector((0.12, -0.12, 0.36)), 0.02, 0.02, RED, outline=False)


def glow_lantern(lay):
    c = grid(0.5, 0.5)
    t = base_plinth(lay, c, 0.42, 0.42, 0.08)
    T(lay, t, t + Vector((0, 0, 0.4)), 0.07, 0.06, STONE)
    B(lay, t + Vector((0, 0, 0.46)), (0.3, 0.3, 0.1), STONE, bevel=0.02)
    B(lay, t + Vector((0, 0, 0.62)), (0.24, 0.24, 0.22), STONE_D, bevel=0.02)
    B(lay, t + Vector((0, -0.121, 0.62)), (0.12, 0.01, 0.12), M("#ffd77a", glow=0.95), outline=False)
    cone(lay, t + Vector((0, 0, 0.73)), 0.2, 0.25, STONE, segs=4, rot=(0, 0, 45))
    E(lay, t + Vector((0, 0, 0.96)), (0.04, 0.04, 0.04), STONE)


def koi_pond(lay):
    c = grid(1.0, 1.0)
    for i in range(14):
        t = i / 14 * math.tau
        E(lay, c + Vector((math.cos(t) * 0.78, math.sin(t) * 0.78 * K * 0.55, 0.06)), (0.15, 0.13, 0.08), STONE if i % 2 else STONE_D)
    E(lay, c + Vector((0, 0, 0.03)), (0.72, 0.72 * K * 0.5, 0.02), M("#3f9fc8", rim=0.3, glow=0.2), outline=False, segs=32)
    for k, (x, y, rot, col) in enumerate(((-0.25, 0.1, 30, "#ff8a3d"), (0.2, -0.15, -140, "#f4f1ea"), (0.1, 0.25, 100, "#ff8a3d"))):
        p = c + Vector((x, y, 0.06))
        E(lay, p, (0.11, 0.045, 0.02), col, rot=(0, 0, rot), outline=False)
        d = Vector((math.cos(math.radians(rot)), math.sin(math.radians(rot)), 0))
        E(lay, p - d * 0.12, (0.05, 0.035, 0.01), col, rot=(0, 0, rot), outline=False)
    for k, (x, y) in enumerate(((0.4, 0.2), (-0.35, -0.25))):
        E(lay, c + Vector((x, y, 0.055)), (0.1, 0.08, 0.01), "#5fbf5a", outline=False)
        E(lay, c + Vector((x + 0.02, y, 0.08)), (0.03, 0.03, 0.03), "#f6a7c8", outline=False)


def cherry_tree(lay):
    c = grid(0.5, 0.5)
    t = base_plinth(lay, c, 0.5, 0.44, 0.14, "#8c5a3a")
    T(lay, t, t + Vector((0.04, 0, 0.55)), 0.06, 0.045, WOOD_D)
    T(lay, t + Vector((0.04, 0, 0.45)), t + Vector((-0.2, 0, 0.75)), 0.035, 0.02, WOOD_D)
    T(lay, t + Vector((0.04, 0, 0.5)), t + Vector((0.25, 0, 0.8)), 0.035, 0.02, WOOD_D)
    for (x, z, s) in ((0, 0.95, 0.28), (-0.24, 0.82, 0.2), (0.26, 0.86, 0.21), (0.08, 1.12, 0.18), (-0.12, 1.05, 0.17)):
        E(lay, t + Vector((x, 0, z)), (s, s * 0.9, s * 0.8), "#f6a7c8")
    for (x, z) in ((0.2, 0.7), (-0.1, 0.78), (0.3, 1.0), (-0.3, 0.95)):
        E(lay, t + Vector((x, -0.2, z)), (0.03, 0.01, 0.03), "#ffd6e6", outline=False)


def bamboo(lay):
    c = grid(0.5, 0.5)
    E(lay, c + Vector((0, 0, 0.04)), (0.3, 0.26, 0.06), "#7a5a3a")
    for k, (x, y, h) in enumerate(((-0.12, 0.05, 1.3), (0.06, -0.06, 1.55), (0.15, 0.08, 1.1), (-0.02, 0.12, 0.95))):
        p = c + Vector((x, y, 0.04))
        for j in range(int(h / 0.25)):
            T(lay, p + Vector((0, 0, j * 0.25)), p + Vector((0, 0, j * 0.25 + 0.23)), 0.035, 0.035, "#6fbf55")
            T(lay, p + Vector((0, 0, j * 0.25 + 0.225)), p + Vector((0, 0, j * 0.25 + 0.25)), 0.042, 0.042, "#4f9a3e", outline=False)
        for j in range(3):
            E(lay, p + Vector((0.09 * (1 if j % 2 else -1), 0, h * (0.5 + j * 0.18))), (0.1, 0.02, 0.025), "#5fb44a", rot=(0, (1 if j % 2 else -1) * -25, 0))


def gong(lay):
    c = grid(0.5, 0.5)
    for sx in (1, -1):
        T(lay, c + Vector((sx * 0.32, 0, 0)), c + Vector((sx * 0.32, 0, 1.2)), 0.04, 0.04, RED)
    T(lay, c + Vector((-0.4, 0, 1.18)), c + Vector((0.4, 0, 1.18)), 0.05, 0.05, RED)
    for sx in (1, -1):
        cone(lay, c + Vector((sx * 0.42, 0, 1.13)), 0.1, 0.06, RED, rot=(0, sx * -60, 0))
    E(lay, c + Vector((0, -0.02, 0.62)), (0.27, 0.04, 0.27), GOLD, segs=28)
    E(lay, c + Vector((0, -0.05, 0.62)), (0.12, 0.015, 0.12), M("#ffe08a", glow=0.4), outline=False)
    for sx in (1, -1):
        T(lay, c + Vector((sx * 0.18, -0.01, 0.84)), c + Vector((sx * 0.1, -0.01, 1.16)), 0.008, 0.008, "#3a2a20", outline=False)


def taiko(lay):
    c = grid(0.5, 0.5)
    for sx in (1, -1):
        T(lay, c + Vector((sx * 0.2, 0.08, 0)), c + Vector((sx * 0.14, 0, 0.38)), 0.03, 0.03, WOOD_D)
    p0, p1 = c + Vector((0, -0.24, 0.55)), c + Vector((0, 0.24, 0.55))
    T(lay, p0, p1, 0.3, 0.3, "#b8452a", segs=28)
    E(lay, p0 + Vector((0, -0.005, 0)), (0.27, 0.01, 0.27), "#f2e3c2", segs=28, outline=False)
    for k in range(10):
        t = k / 10 * math.tau
        E(lay, p0 + Vector((math.cos(t) * 0.28, -0.01, math.sin(t) * 0.28)), (0.018, 0.012, 0.018), GOLD, outline=False)
    E(lay, p0 + Vector((0, -0.012, 0)), (0.09, 0.004, 0.09), RED, outline=False)


def paper_lantern(lay):   # wall
    x = 0.5
    y = grid(x, WF).y - 0.12
    T(lay, Vector((x, y + 0.08, 1.45)), Vector((x, y, 1.33)), 0.01, 0.01, "#3a2a20", outline=False)
    E(lay, Vector((x, y, 1.05)), (0.2, 0.2, 0.26), M("#e8453a", glow=0.5))
    for z in (0.92, 1.05, 1.18):
        T(lay, Vector((x, y, z - 0.006)), Vector((x, y, z + 0.006)), 0.205 * math.sqrt(1 - ((z - 1.05) / 0.27) ** 2), 0.205 * math.sqrt(1 - ((z - 1.05) / 0.27) ** 2), "#8a2a22", outline=False, segs=24)
    for z in (0.78, 1.32):
        T(lay, Vector((x, y, z - 0.03)), Vector((x, y, z + 0.03)), 0.09, 0.09, "#2a2230")
    T(lay, Vector((x, y, 0.75)), Vector((x, y, 0.6)), 0.03, 0.0, GOLD, outline=False)


def jade_dragon(lay):
    c = grid(0.5, 0.5)
    t = base_plinth(lay, c, 0.56, 0.46, 0.16, "#3a3448")
    pts = [t + Vector((-0.18, 0, 0.08)), t + Vector((0.05, 0.05, 0.3)), t + Vector((-0.1, 0, 0.55)), t + Vector((0.1, -0.05, 0.8))]
    rs = [0.08, 0.085, 0.075, 0.07]
    for i in range(3):
        T(lay, pts[i], pts[i + 1], rs[i], rs[i + 1], M(JADE, rim=0.35, glow=0.25))
        E(lay, pts[i + 1], (rs[i + 1],) * 3, M(JADE, rim=0.35, glow=0.25), outline=False)
    hd = pts[3] + Vector((0.05, -0.08, 0.08))
    E(lay, hd, (0.12, 0.14, 0.09), M(JADE, rim=0.35, glow=0.25))
    for sx in (1, -1):
        cone(lay, hd + Vector((sx * 0.06, 0.05, 0.06)), 0.14, 0.025, GOLD, rot=(-35, sx * 20, 0))
        E(lay, hd + Vector((sx * 0.05, -0.11, 0.03)), (0.02, 0.01, 0.02), "#ffe08a", outline=False)
    E(lay, hd + Vector((0, -0.16, -0.02)), (0.05, 0.04, 0.035), M(JADE, rim=0.35, glow=0.25))
    E(lay, t + Vector((0.2, -0.12, 0.08)), (0.06, 0.06, 0.06), M("#ffd77a", glow=0.8))    # pearl


def wing_dummy(lay):
    c = grid(0.5, 0.5)
    B(lay, c + Vector((0, 0.05, 0.03)), (0.55, 0.3, 0.06), WOOD_D, bevel=0.01)
    T(lay, c + Vector((0, 0.05, 0.06)), c + Vector((0, 0.05, 1.15)), 0.11, 0.1, WOOD)
    E(lay, c + Vector((0, 0.05, 1.15)), (0.1, 0.1, 0.05), WOOD)
    for z, sx in ((0.85, 1), (0.85, -1)):
        T(lay, c + Vector((sx * 0.05, -0.05, z)), c + Vector((sx * 0.12, -0.32, z + 0.03)), 0.025, 0.022, WOOD_L)
    T(lay, c + Vector((0, -0.05, 0.62)), c + Vector((0, -0.34, 0.58)), 0.03, 0.025, WOOD_L)
    T(lay, c + Vector((0, -0.05, 0.3)), c + Vector((0.1, -0.3, 0.12)), 0.03, 0.025, WOOD_L)
    for z in (0.4, 0.98):
        T(lay, c + Vector((0, 0.05, z)), c + Vector((0, 0.05, z + 0.03)), 0.115, 0.115, RED, outline=False)


def zen_garden(lay):
    c = grid(1.0, 0.5)
    B(lay, c + Vector((0, 0, 0.05)), (1.8, 0.85 * K * 0.6, 0.1), WOOD_D, bevel=0.02)
    B(lay, c + Vector((0, 0, 0.1)), (1.68, 0.75 * K * 0.6, 0.02), "#efe2c0", outline=False)
    for k in range(5):
        B(lay, c + Vector((0, -0.3 + k * 0.14, 0.112)), (1.6, 0.012, 0.004), "#d8c69c", outline=False)
    for (x, y, s) in ((-0.45, 0.05, 0.13), (-0.3, -0.1, 0.08), (0.4, 0.0, 0.11)):
        E(lay, c + Vector((x, y, 0.14)), (s, s * 0.9, s * 0.7), "#8a8478")
        ring(lay, c + Vector((x, y, 0.112)), s * 1.5, 0.008, M("#c9b78f"), segs=20)
    E(lay, c + Vector((0.65, 0.12, 0.16)), (0.12, 0.1, 0.06), "#5fb44a")


def tea_set(lay):
    c = grid(1.0, 0.5)
    B(lay, c + Vector((0, 0, 0.22)), (1.2, 0.6, 0.06), "#7a3a2a", bevel=0.02)
    for sx in (1, -1):
        for sy in (1, -1):
            B(lay, c + Vector((sx * 0.5, sy * 0.22, 0.1)), (0.06, 0.06, 0.2), "#5a2a1e")
    E(lay, c + Vector((-0.15, 0, 0.36)), (0.12, 0.12, 0.1), "#f4f1ea")
    T(lay, c + Vector((-0.04, 0, 0.36)), c + Vector((0.06, -0.02, 0.42)), 0.02, 0.012, "#f4f1ea")
    E(lay, c + Vector((-0.15, 0, 0.47)), (0.04, 0.04, 0.03), "#3a7a9a")
    for k, x in enumerate((0.18, 0.32)):
        T(lay, c + Vector((x, -0.05, 0.25)), c + Vector((x, -0.05, 0.33)), 0.045, 0.05, "#f4f1ea")
        E(lay, c + Vector((x, -0.05, 0.33)), (0.04, 0.04, 0.005), "#8cbf5e", outline=False)
    for sx in (1, -1):
        E(lay, c + Vector((sx * 0.85, 0.05, 0.04)), (0.22, 0.2, 0.05), "#3a6ea5")


def grand_bonsai(lay):
    c = grid(0.5, 0.5)
    B(lay, c + Vector((0, 0, 0.09)), (0.62, 0.42, 0.18), "#3a5a8a", bevel=0.03)
    T(lay, c + Vector((0, 0, 0.18)), c + Vector((0.08, 0, 0.42)), 0.05, 0.04, WOOD_D)
    T(lay, c + Vector((0.08, 0, 0.42)), c + Vector((-0.12, 0, 0.6)), 0.04, 0.03, WOOD_D)
    for (x, z, s) in ((-0.15, 0.66, 0.2), (0.15, 0.55, 0.16), (0.0, 0.8, 0.16), (-0.3, 0.55, 0.12)):
        E(lay, c + Vector((x, 0, z)), (s, s * 0.85, s * 0.55), "#4faa52")


def bamboo_fountain(lay):
    c = grid(0.5, 0.5)
    for i in range(9):
        t = i / 9 * math.tau
        E(lay, c + Vector((math.cos(t) * 0.3, math.sin(t) * 0.24, 0.06)), (0.09, 0.08, 0.07), STONE if i % 2 else STONE_D)
    E(lay, c + Vector((0, 0, 0.06)), (0.26, 0.2, 0.02), M("#3f9fc8", glow=0.2), outline=False)
    T(lay, c + Vector((0.2, 0.1, 0.0)), c + Vector((0.2, 0.1, 0.55)), 0.04, 0.04, "#6fbf55")
    T(lay, c + Vector((0.2, 0.1, 0.5)), c + Vector((-0.08, -0.02, 0.38)), 0.032, 0.03, "#6fbf55")
    T(lay, c + Vector((-0.1, -0.03, 0.37)), c + Vector((-0.1, -0.03, 0.12)), 0.012, 0.02, M("#9fe0ff", glow=0.6), outline=False)


def mountain_painting(lay):   # wall
    x = 0.5
    y = grid(x, WF).y - 0.03
    B(lay, Vector((x, y, 0.85)), (0.8, 0.03, 0.62), WOOD_D, bevel=0.01)
    B(lay, Vector((x, y - 0.016, 0.85)), (0.7, 0.01, 0.52), M("#fbf2dc", flat=True), outline=False)
    for (dx, h, col) in ((-0.15, 0.36, "#6b6aa8"), (0.1, 0.44, "#4d4c8a"), (0.25, 0.26, "#8a89c0")):
        put(lay, nm(lay), tube(Vector((x + dx, y - 0.02, 0.61)), Vector((x + dx, y - 0.02, 0.61 + h)), 0.18, 0.0, segs=3, sy=0.03), M(col, flat=True), outline=False)
    E(lay, Vector((x - 0.22, y - 0.025, 1.0)), (0.06, 0.004, 0.06), M("#f2a93b", flat=True), outline=False)
    for k in range(2):
        E(lay, Vector((x + 0.05 - k * 0.2, y - 0.03, 0.78 + k * 0.06)), (0.16, 0.004, 0.03), M("#ffffff", flat=True), outline=False)


def torii_mini(lay):
    c = grid(0.5, 0.5)
    for sx in (1, -1):
        T(lay, c + Vector((sx * 0.3, 0, 0)), c + Vector((sx * 0.28, 0, 0.95)), 0.045, 0.04, RED)
        B(lay, c + Vector((sx * 0.3, 0, 0.04)), (0.1, 0.1, 0.08), "#2a2230")
    B(lay, c + Vector((0, 0, 0.78)), (0.72, 0.07, 0.05), RED)
    B(lay, c + Vector((0, 0, 0.98)), (0.92, 0.1, 0.07), "#2a2230", bevel=0.01)
    B(lay, c + Vector((0, 0, 0.92)), (0.84, 0.08, 0.05), RED)


# =============================================================== ACHIEVEMENT PIECES (gold, trophy-like)
def trophy_cup(lay, col=GOLD, gem="#e8453a"):
    c = grid(0.5, 0.5)
    t = base_plinth(lay, c, 0.4, 0.36, 0.12, "#2a2230")
    B(lay, t + Vector((0, 0, 0.04)), (0.28, 0.24, 0.08), "#3a3448", bevel=0.01)
    T(lay, t + Vector((0, 0, 0.08)), t + Vector((0, 0, 0.3)), 0.05, 0.03, M(col, rim=0.35))
    T(lay, t + Vector((0, 0, 0.3)), t + Vector((0, 0, 0.62)), 0.08, 0.2, M(col, rim=0.35), segs=24)
    for sx in (1, -1):
        T(lay, t + Vector((sx * 0.17, 0, 0.56)), t + Vector((sx * 0.25, 0, 0.42)), 0.025, 0.025, M(col, rim=0.35))
    E(lay, t + Vector((0, -0.17, 0.47)), (0.05, 0.02, 0.05), M(gem, glow=0.5))
    return t


def golden_fist(lay):
    c = grid(0.5, 0.5)
    t = base_plinth(lay, c, 0.44, 0.38, 0.16, "#2a2230")
    T(lay, t, t + Vector((0, 0, 0.22)), 0.07, 0.07, M(GOLD, rim=0.35))
    B(lay, t + Vector((0, 0, 0.36)), (0.26, 0.2, 0.2), M(GOLD, rim=0.35), bevel=0.05)
    for k in range(4):
        E(lay, t + Vector((-0.09 + k * 0.06, -0.1, 0.42)), (0.035, 0.03, 0.04), M(GOLD, rim=0.35), outline=False)
    E(lay, t + Vector((0.14, -0.04, 0.33)), (0.05, 0.08, 0.05), M(GOLD, rim=0.35))
    for k in range(6):
        a = k / 6 * math.tau
        cone(lay, t + Vector((math.cos(a) * 0.2, 0.05, 0.36 + math.sin(a) * 0.2)), 0.1, 0.02, M("#ffe08a", glow=0.8), rot=(0, 90 - math.degrees(a), 0), outline=False)


def counter_medal(lay):   # wall
    x = 0.5
    y = grid(x, WF).y - 0.03
    B(lay, Vector((x, y, 0.85)), (0.6, 0.03, 0.6), "#2a2a48", bevel=0.02)
    for sx in (1, -1):
        B(lay, Vector((x + sx * 0.07, y - 0.02, 1.0)), (0.08, 0.01, 0.28), RED, rot=(0, sx * 18, 0), outline=False)
    E(lay, Vector((x, y - 0.04, 0.78)), (0.16, 0.03, 0.16), M(GOLD, rim=0.35), segs=24)
    E(lay, Vector((x, y - 0.065, 0.78)), (0.09, 0.01, 0.09), M("#ffe9a8", glow=0.6), outline=False)


def climber_banner(lay):   # wall
    x = 0.5
    y = grid(x, WF).y - 0.04
    T(lay, Vector((x - 0.3, y, 1.3)), Vector((x + 0.3, y, 1.3)), 0.025, 0.025, WOOD_D)
    B(lay, Vector((x, y - 0.01, 0.95)), (0.46, 0.015, 0.66), "#3a3a8a", outline=True)
    for k in range(3):
        cone(lay, Vector((x - 0.12 + k * 0.12, y - 0.025, 0.72 + k * 0.12)), 0.18 - k * 0.02, 0.07, M(GOLD, rim=0.3), segs=4, rot=(0, 0, 45), outline=False)
    E(lay, Vector((x, y - 0.03, 1.15)), (0.05, 0.005, 0.05), M("#ffe08a", glow=0.6), outline=False)
    for sx in (1, -1):
        cone(lay, Vector((x + sx * 0.12, y - 0.01, 0.62)), 0.1, 0.11, "#3a3a8a", rot=(180, 0, 0), segs=3, outline=False)


def kata_plaque(lay):   # wall
    x = 0.5
    y = grid(x, WF).y - 0.03
    B(lay, Vector((x, y, 0.85)), (0.66, 0.04, 0.48), WOOD, bevel=0.02)
    B(lay, Vector((x, y - 0.022, 0.85)), (0.56, 0.01, 0.38), "#2a2230", outline=False)
    for k, dx in enumerate((-0.17, 0, 0.17)):
        put(lay, nm(lay), _star(Vector((x + dx, y - 0.03, 0.85 + (0.04 if k == 1 else 0))), 0.08 if k == 1 else 0.06), M(GOLD, rim=0.3, glow=0.3), outline=False, smooth=False)


def _star(c, r, depth=0.02):
    bm = bmesh.new()
    pts = []
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((c.x + math.cos(a) * rr, c.z + math.sin(a) * rr))
    front = [bm.verts.new((px, c.y - depth / 2, pz)) for px, pz in pts]
    back = [bm.verts.new((px, c.y + depth / 2, pz)) for px, pz in pts]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    for i in range(10):
        j = (i + 1) % 10
        bm.faces.new((front[i], front[j], back[j], back[i]))
    return bm


def star_champion(lay):
    t = trophy_cup(lay, "#c9d6e8", "#5cc8d6")
    put(lay, nm(lay), _star(t + Vector((0, -0.05, 0.82)), 0.13, 0.05), M(GOLD, rim=0.3, glow=0.3), outline=True, smooth=False)


def collector_cabinet(lay):
    c = grid(0.5, 0.5)
    B(lay, c + Vector((0, 0.05, 0.6)), (0.72, 0.36, 1.2), "#5a3a2a", bevel=0.02)
    for k in range(3):
        z = 0.3 + k * 0.33
        B(lay, c + Vector((0, -0.12, z)), (0.62, 0.02, 0.27), "#2a2230", outline=False)
        for j, col in enumerate(("#f5b52a", "#5cc8d6", "#e8453a")):
            E(lay, c + Vector((-0.18 + j * 0.18, -0.15, z - 0.05)), (0.05, 0.04, 0.07), M([col, "#7fe0b0", "#b9a2dc"][(j + k) % 3] if k else col, glow=0.3), outline=False)
    B(lay, c + Vector((0, 0.05, 1.23)), (0.8, 0.42, 0.06), "#3a2418", bevel=0.01)


def hundred_bell(lay):
    c = grid(0.5, 0.5)
    for sx in (1, -1):
        T(lay, c + Vector((sx * 0.3, 0, 0)), c + Vector((sx * 0.3, 0, 1.1)), 0.04, 0.04, WOOD_D)
    B(lay, c + Vector((0, 0, 1.12)), (0.76, 0.12, 0.08), WOOD_D, bevel=0.01)
    cone(lay, c + Vector((0, 0, 1.1)), 0.04, 0.03, "#3a2a20", rot=(180, 0, 0))
    T(lay, c + Vector((0, 0, 0.55)), c + Vector((0, 0, 1.02)), 0.21, 0.13, M("#c88a3a", rim=0.35), segs=24)
    E(lay, c + Vector((0, 0, 1.02)), (0.13, 0.13, 0.06), M("#c88a3a", rim=0.35))
    T(lay, c + Vector((0, 0, 0.55)), c + Vector((0, 0, 0.6)), 0.23, 0.23, M(GOLD, rim=0.35), segs=24)
    E(lay, c + Vector((0, -0.19, 0.8)), (0.07, 0.02, 0.07), M(GOLD, rim=0.35))


def guardian_seal(lay):
    c = grid(0.5, 0.5)
    t = base_plinth(lay, c, 0.6, 0.48, 0.14, "#3a3448")
    T(lay, t + Vector((0, 0, 0.42)), t + Vector((0, 0, 0.42)) + Vector((0, 0.001, 0)), 0.3, 0.3, M(GOLD), segs=28)
    E(lay, t + Vector((0, 0, 0.42)), (0.3, 0.06, 0.3), M(GOLD, rim=0.35), segs=32)
    E(lay, t + Vector((0, -0.05, 0.42)), (0.22, 0.02, 0.22), M("#fff1b8", glow=0.9), outline=False, segs=28)
    for k in range(8):
        a = k / 8 * math.tau
        cone(lay, t + Vector((math.cos(a) * 0.33, 0, 0.42 + math.sin(a) * 0.33)), 0.1, 0.035, M(GOLD, rim=0.35), rot=(0, 90 - math.degrees(a), 0))
    put(lay, nm(lay), _star(t + Vector((0, -0.08, 0.42)), 0.1, 0.02), M("#ffb020", glow=0.4), outline=False, smooth=False)


def level_statue(lay):
    c = grid(0.5, 0.5)
    t = base_plinth(lay, c, 0.5, 0.44, 0.2, "#2a2230")
    g = M(GOLD, rim=0.35)
    E(lay, t + Vector((0, 0, 0.3)), (0.13, 0.1, 0.16), g)                # body
    E(lay, t + Vector((0, 0, 0.6)), (0.15, 0.13, 0.14), g)               # big head
    for sx in (1, -1):
        T(lay, t + Vector((sx * 0.1, 0, 0.4)), t + Vector((sx * 0.22, -0.02, 0.62)), 0.035, 0.03, g)
        E(lay, t + Vector((sx * 0.23, -0.02, 0.66)), (0.05, 0.05, 0.05), g)
        T(lay, t + Vector((sx * 0.06, 0, 0.18)), t + Vector((sx * 0.09, 0, 0.02)), 0.04, 0.035, g)
    T(lay, t + Vector((0, 0, 0.25)), t + Vector((0, 0, 0.28)), 0.14, 0.14, "#2a2230", outline=False)


SHOP = [
    ("decor-v2-lucky-cat", lucky_cat, 1, 1, "floor", 0.4), ("decor-v2-glow-lantern", glow_lantern, 1, 1, "floor", 0.6),
    ("decor-v2-koi-pond", koi_pond, 2, 2, "floor", 0.1), ("decor-v2-cherry-tree", cherry_tree, 1, 1, "floor", 1.0),
    ("decor-v2-bamboo", bamboo, 1, 1, "floor", 1.2), ("decor-v2-gong", gong, 1, 1, "floor", 0.9),
    ("decor-v2-taiko", taiko, 1, 1, "floor", 0.5), ("decor-v2-paper-lantern", paper_lantern, 1, 1, "wall", 0.9),
    ("decor-v2-jade-dragon", jade_dragon, 1, 1, "floor", 0.7), ("decor-v2-wing-dummy", wing_dummy, 1, 1, "floor", 0.9),
    ("decor-v2-zen-garden", zen_garden, 2, 1, "floor", 0.1), ("decor-v2-tea-set", tea_set, 2, 1, "floor", 0.2),
    ("decor-v2-grand-bonsai", grand_bonsai, 1, 1, "floor", 0.5), ("decor-v2-bamboo-fountain", bamboo_fountain, 1, 1, "floor", 0.4),
    ("decor-v2-mountain-painting", mountain_painting, 1, 1, "wall", 0.6), ("decor-v2-torii", torii_mini, 1, 1, "floor", 0.7),
]
ACH = [
    ("decor-v2-golden-fist", golden_fist, 1, 1, "floor", 0.5), ("decor-v2-counter-medal", counter_medal, 1, 1, "wall", 0.6),
    ("decor-v2-climber-banner", climber_banner, 1, 1, "wall", 0.9), ("decor-v2-kata-plaque", kata_plaque, 1, 1, "wall", 0.5),
    ("decor-v2-star-champion", star_champion, 1, 1, "floor", 0.7), ("decor-v2-collector-cabinet", collector_cabinet, 1, 1, "floor", 0.9),
    ("decor-v2-hundred-bell", hundred_bell, 1, 1, "floor", 0.9), ("decor-v2-guardian-seal", guardian_seal, 1, 1, "floor", 0.6),
    ("decor-v2-level-statue", level_statue, 1, 1, "floor", 0.6), ("decor-v2-champion-cup", lambda l: trophy_cup(l), 1, 1, "floor", 0.5),
]
for name, fn, w, h, place, top in SHOP + ACH:
    fn(name)
    emit(name, w, h, place, top, {"set": "decor-v2"})

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
