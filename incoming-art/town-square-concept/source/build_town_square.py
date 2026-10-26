"""Dojo Ascent - A4 town square concept (one picture for Jay). Same house look as the game: toon_kit materials and
outlines, orthographic camera looking north 35 deg down, ground laid out on the game grid (G(col,row): x = col,
y = -row*K, K = 1/sin35, so one ground tile is square on screen). Rendered at 80 px per tile at @2x (40 px per tile at
1x; the game itself shows art at 48 px per tile). Transparent beyond the far hills; make_concept.py adds the sky.
    blender -b -P incoming-art/town-square-concept/source/build_town_square.py -- --out <png> [--samples 24]"""
import bpy, sys, os, math, argparse
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from toon_kit import *

ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); ap.add_argument("--samples", type=int, default=24)
ap.add_argument("--ppt", type=int, default=80); ap.add_argument("--part", default="town")
A = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
EL = 35.0; K = 1 / math.sin(math.radians(EL))
COLS, ROWS = 23.3, 10.75                      # 1864 x 860 at 80 px per tile

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; coll = sc.collection
OUT_M = outline_material(); MATS = {}
def mat(h):
    if h not in MATS: MATS[h] = toon_material("M" + h, h)
    return MATS[h]
def add(name, bm, hexc, outline=True):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat(hexc))
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob)
    for p in me.polygons: p.use_smooth = False
    if outline: add_hull(ob, coll, OUT_M, OUTLINE_W * 1.6)
    return ob
def G(c, r, z=0.0): return (c, -r * K, z)
def D(rows): return rows * K                   # depth in world units for a span of ground rows

# ---------------------------------------------------------------- ground
add("grass_back", box(G(COLS / 2, 4.1, -0.06), (COLS + 4, D(1.6), 0.1)), "#7fbf6f", False)
if A.part in ("town", "lights"):
    for k in range(16):   # a soft hedge along the back edge of the town
        if k == 10: continue   # the river comes through here
        add(f"hedge{k}", ellipsoid(G(k * 1.6 - 0.4, 3.35, 0.25), (0.95, D(0.35), 0.42), segs=12, rings=8), "#5f9e55")
add("plaza_base", box(G(COLS / 2, 7.9, -0.03), (COLS + 2, D(6.6), 0.06)), "#948b7c", False)
STONES = ["#cfc8ba", "#c9c1b2", "#d4cdbf", "#c6beaf"]
for i in range(-1, 25):
    for j in range(0, 7):
        r = 4.95 + j
        if 14.4 < i + 0.5 + (0.5 if j % 2 else 0) < 16.8: continue   # the river
        add(f"st{i}_{j}", box(G(i + 0.5 + (0.5 if j % 2 else 0), r + 0.5, 0), (0.94, D(0.94), 0.05)), STONES[(i * 3 + j * 5) % 4], False)
# a round paving ring around the statue
for k in range(28):
    a = 2 * math.pi * k / 28
    add(f"ring{k}", box(G(11.65 + 2.55 * math.cos(a), 8.0 + 1.35 * math.sin(a), 0.03), (0.5, D(0.26), 0.04), rot=(0, 0, 0)), "#e6dfcf", False)
add("spath", box(G(11.65, 10.4, 0.01), (2.2, D(1.2), 0.04)), "#e6dfcf", False)

if A.part == "far":
    # ---------------------------------------------------------------- far hills + the Tower (hazy = far away)
    for c, r, sx, h, col in ((-20, 3.6, 9, 6.0, "#a9cdb8"), (-8, 3.4, 8, 4.6, "#b3d3c2"), (9, 3.5, 9, 5.6, "#a9cdb8"), (22, 3.8, 9, 5.0, "#b3d3c2")):
        add(f"hill{c}", ellipsoid(G(c, r, -0.4), (sx, D(1.0), h), segs=24, rings=12), col, False)
    # ---------------------------------------------------------------- A4-3: a world to explore, far behind the town
    # Placed many rows back, so it rises into the sky band above the hedge. No characters, no text.
    def hill(nm, c, r, sx, h, col, z0=0.0):
        add("hill" + nm, ellipsoid(G(c, r, z0), (sx, D(1.0), h), segs=32, rings=16), col, False)
        return (c, r, sx, h, z0)
    def front(Hh, x, z):   # the row on the camera-facing surface of hill Hh at (x, z)
        c, r, sx, h, z0 = Hh; q = 1 - ((x - c) / sx) ** 2 - ((z - z0) / h) ** 2
        return r + math.sqrt(max(q, 0.0)) + 0.05
    def top(Hh, x):
        c, r, sx, h, z0 = Hh; return z0 + h * math.sqrt(max(1 - ((x - c) / sx) ** 2, 0.0))
    # far mountains (soft blue-green) and nearer rolling hills (fresh greens)
    for k, (c, sx, h) in enumerate(((-34, 10, 8.0), (-19, 11, 8.8), (-3, 10, 7.6), (11, 11, 8.6), (24, 9, 7.8))):
        hill(f"m{k}", c, -10.2, sx, h, ("#a3c8c0", "#b0d1c8")[k % 2])
    snow = [(-19, -11, 11, 8.8), (11, -11, 11, 8.6)]
    for c, r, sx, h in []:   # (snow caps removed: read as clouds)
        add(f"cap{c}", ellipsoid(G(c, r + 0.15, h * 0.86), (sx * 0.22, D(0.55), h * 0.16), segs=16, rings=8), "#f4f7fb", False)
    HL = {}
    for nm, c, sx, h, col in (("a", -28, 7, 7.0, "#86c47e"), ("b", -17, 7, 8.4, "#93cf88"), ("c", -7, 6.5, 6.8, "#86c47e"),
                              ("d", 5, 6.5, 7.6, "#93cf88"), ("e", 15, 6.5, 8.2, "#86c47e")):
        HL[nm] = hill(nm, c, -8.1, sx, h, col)
    # winding paths up the hills (little light stepping stones)
    for nm, x0, x1, turns in (("b", -21, -14, 3), ("d", 2.5, 7.5, 3), ("e", 12.5, 17.5, 2)):
        Hh = HL[nm]; zt = top(Hh, (x0 + x1) / 2) * 0.82
        for i in range(44):
            t = i / 43; z = 0.3 + t * (zt - 0.3)
            x = x0 + (x1 - x0) * (0.5 + 0.5 * math.sin(t * math.pi * turns))
            add(f"path{nm}{i}", ellipsoid(G(x, front(Hh, x, z), z), (0.32, 0.05, 0.18), segs=8, rings=4), "#f1e3bd", False)
    # windmill on hill b
    Hb = HL["b"]; wx = -17; wz = top(Hb, wx) - 0.7; wr = front(Hb, wx, wz) - 0.6
    add("wm_body", tube(G(wx, wr, wz - 0.3), G(wx, wr, wz + 3.2), 0.85, 0.55, segs=14), "#f7f0e0")
    add("wm_roof", tube(G(wx, wr, wz + 3.2), G(wx, wr, wz + 4.2), 0.7, 0.05, segs=14), "#5f6f92")
    add("wm_door", box(G(wx, wr + 0.8, wz + 0.4), (0.4, 0.05, 0.7)), "#8a5e38", False)
    hub = G(wx, wr + 0.9, wz + 3.0)
    add("wm_hub", ellipsoid(hub, (0.2, 0.2, 0.2), segs=10, rings=6), "#6b4428")
    for k in range(4):
        a = 20 + k * 90
        ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
        add(f"wm_bl{k}", box((hub[0] + ca * 1.25, hub[1] - 0.1, hub[2] + sa * 1.25), (2.3, 0.06, 0.55), rot=(0, -a, 0)), "#fbf3df")
    # banners on poles along the path of hill b (blue, green, yellow)
    for k, x in enumerate((-22.0, -20.0, -13.5, -11.8)):
        z = top(Hb, x) if abs(x - Hb[0]) < Hb[2] else 0.0
        z = max(z - 0.4, 0.0); rr = front(Hb, x, z)
        add(f"bp{k}", tube(G(x, rr, z), G(x, rr, z + 2.0), 0.06, 0.06), "#6b4428")
        add(f"bn{k}", box(G(x + 0.45, rr, z + 1.65), (0.85, 0.05, 0.6)), ("#4f8fd6", "#57b26a", "#ffcf4a", "#8f7cd6")[k], False)
    # lighthouse on hill e (white and soft blue stripes, warm lamp)
    He = HL["e"]; lx = 15.5; lz = top(He, lx) - 1.0; lr = front(He, lx, lz) - 0.5
    for k in range(4):
        add(f"lh{k}", tube(G(lx, lr, lz + k * 0.85), G(lx, lr, lz + (k + 1) * 0.85), 0.75 - k * 0.07, 0.68 - k * 0.07, segs=14), ("#f7f2e8", "#6f9fd2")[k % 2])
    add("lh_lamp", tube(G(lx, lr, lz + 3.4), G(lx, lr, lz + 4.0), 0.42, 0.42, segs=12), "#ffe48a", False)
    add("lh_cap", tube(G(lx, lr, lz + 4.0), G(lx, lr, lz + 4.6), 0.55, 0.05, segs=12), "#5f6f92")
    # waterfall down hill d into a pool, with a little arched footbridge below it
    Hd = HL["d"]; fx = 4.6; fz = top(Hd, fx) * 0.8
    for k in range(3):
        add(f"fall{k}", box(G(fx + (k - 1) * 0.5, front(Hd, fx, fz * 0.5) + 0.05, fz / 2), (0.5, 0.05, fz), bevel=0.05), ("#cdeefa", "#ffffff", "#bfe6f6")[k], False)
    add("pool", ellipsoid(G(fx, front(Hd, fx, 0.2) + 0.3, 0.05), (1.6, D(0.4), 0.25), segs=16, rings=6), "#8fd0ec", False)
    for k in range(6):
        add(f"mist{k}", ellipsoid(G(fx - 1.1 + k * 0.45, front(Hd, fx, 0.2) + 0.35, 0.35 + (k % 2) * 0.2), (0.32, 0.1, 0.25), segs=8, rings=4), "#ffffff", False)
    br = front(Hd, fx, 0.2) + 0.9
    for k in range(9):
        t = k / 8; x = fx - 2.2 + 4.4 * t; z = 0.4 + 0.9 * math.sin(t * math.pi)
        add(f"fb{k}", box(G(x, br, z), (0.56, D(0.3), 0.12), rot=(0, -math.degrees(math.atan(0.9 * math.pi / 4.4 * math.cos(t * math.pi))), 0)), "#c99a62")
        add(f"fbr{k}", tube(G(x, br + 0.15, z), G(x, br + 0.15, z + 0.45), 0.04, 0.04), "#8a5e38", False)
    # cherry trees (soft pink, never red) dotted over the hills
    for k, (nm, x) in enumerate((("a", -30), ("a", -25), ("b", -13), ("c", -9.5), ("c", -3.5), ("d", 2.5), ("d", 9.5), ("e", 12.5), ("e", 19))):
        Hh = HL[nm]; z = top(Hh, x) * 0.78; rr = front(Hh, x, z)
        add(f"ct{k}", tube(G(x, rr, z), G(x, rr, z + 0.9), 0.12, 0.08), "#7a5232", False)
        add(f"cb{k}", ellipsoid(G(x, rr, z + 1.35), (0.85, 0.4, 0.7), segs=14, rings=8), "#f6c3d6", False)
        add(f"cb2{k}", ellipsoid(G(x - 0.3, rr + 0.2, z + 1.6), (0.45, 0.3, 0.38), segs=10, rings=6), "#fbdbe6", False)
    # a glimpse of a little village on hill c (other areas to visit)
    Hc = HL["c"]
    for k, (x, col) in enumerate(((-5.6, "#efe3c6"), (-4.2, "#f3e7cd"), (-2.9, "#e8dcc0"))):
        z = top(Hc, x) * 0.55; rr = front(Hc, x, z) - 0.2
        add(f"vh{k}", box(G(x, rr, z + 0.45), (1.1, 0.6, 0.9)), col)
        add(f"vr{k}", tube(G(x, rr, z + 0.9), G(x, rr, z + 1.5), 0.85, 0.05, segs=4), ("#5f6f92", "#6f8f6a", "#8f7cd6")[k])
        add(f"vw{k}", box(G(x, rr + 0.32, z + 0.5), (0.3, 0.04, 0.3)), "#ffe9a0", False)
    TC, TR = 0.0, 3.0      # the Tower stands far behind the town, between the 2nd and 3rd dojo
    HZ = "#a7afd6"; HZD = "#8f97c2"
    z = 0.0
    for k, (r0, r1, hh) in enumerate(((1.85, 1.6, 7.4), (1.6, 1.38, 6.0), (1.38, 1.15, 5.0), (1.15, 0.9, 4.0))):
        add(f"tw{k}", tube(G(TC, TR, z), G(TC, TR, z + hh), r0, r1, segs=18), HZ if k % 2 == 0 else "#b6bde0", True)
        add(f"twband{k}", tube(G(TC, TR, z + hh - 0.12), G(TC, TR, z + hh + 0.05), r1 + 0.08, r1 + 0.08, segs=18), HZD, False)
        for w in (-0.35, 0.35):   # little warm windows
            add(f"twin{k}{w}", box(G(TC + w * r1, TR + r1 * 0.95, z + hh * 0.55), (0.22, 0.05, 0.4)), "#ffe9a0", False)
        z += hh
    add("twroof", tube(G(TC, TR, z), G(TC, TR, z + 1.5), 1.12, 0.05, segs=18), "#9aa0c4")
    add("twlight", ellipsoid(G(TC, TR, z + 1.95), (0.42, 0.42, 0.58), segs=16, rings=10), "#ffe48a", False)   # one restored fragment of light
    add("twhalo", ellipsoid(G(TC, TR, z + 1.95), (0.8, 0.12, 0.8), segs=20, rings=8), "#fff6c8", False)


else:
  if True:
    # ---------------------------------------------------------------- classmates' dojos (back row, facing the square)
    def dojo(cx, w, cur, name):
        r = 4.65; h = 1.55
        add(name + "base", box(G(cx, r - 0.55, 0.08), (w + 0.3, D(1.2), 0.16)), "#a9adc4")
        add(name + "wall", box(G(cx, r - 0.75, 0.16 + h / 2), (w, D(1.0), h)), "#efe3c6")
        for x in (-w / 2 + 0.08, w / 2 - 0.08, -0.62, 0.62):
            add(name + f"post{x}", box(G(cx + x, r - 0.27, 0.16 + h / 2), (0.14, 0.12, h)), "#7a5232")
        add(name + "beam", box(G(cx, r - 0.27, 0.16 + h - 0.06), (w + 0.1, 0.14, 0.14)), "#6b4428")
        # roof: a soft hip roof of dark wood tiles with a gold ridge
        rf = bpy.data.meshes.new(name + "roof"); import bmesh as B
        bm = B.new(); y0, y1 = -(r - 0.1) * K, -(r - 1.45) * K; zb = 0.16 + h + 0.02; zt = zb + 0.85
        v = [bm.verts.new(p) for p in ((cx - w / 2 - 0.35, y0, zb), (cx + w / 2 + 0.35, y0, zb), (cx + w / 2 + 0.35, y1, zb), (cx - w / 2 - 0.35, y1, zb),
                                       (cx - w / 2 + 0.6, (y0 + y1) / 2, zt), (cx + w / 2 - 0.6, (y0 + y1) / 2, zt))]
        for f in ((0, 1, 5, 4), (1, 2, 5), (2, 3, 4, 5), (3, 0, 4), (0, 3, 2, 1)): bm.faces.new([v[i] for i in f])
        add(name + "roof", bm, "#5f6f92")
        add(name + "ridge", tube((cx - w / 2 + 0.55, (y0 + y1) / 2, zt + 0.02), (cx + w / 2 - 0.55, (y0 + y1) / 2, zt + 0.02), 0.07, 0.07), "#d9a441")
        # the door: a dark frame, sliding doors ajar and a coloured curtain (noren) in the classmate's colour
        add(name + "door", box(G(cx, r - 0.25, 0.16 + 0.62), (1.05, 0.06, 1.24)), "#4a3020")
        add(name + "shoji", box(G(cx - 0.27, r - 0.22, 0.16 + 0.6), (0.44, 0.04, 1.12)), "#fbf3df")
        add(name + "glow", box(G(cx + 0.24, r - 0.235, 0.16 + 0.6), (0.48, 0.03, 1.12)), "#ffe9a0", False)
        for k in range(3):
            add(name + f"noren{k}", box(G(cx - 0.34 + k * 0.34, r - 0.18, 0.16 + 1.07), (0.31, 0.04, 0.42)), cur)
        add(name + "step", box(G(cx, r - 0.02, 0.05), (1.3, D(0.3), 0.1)), "#cfc8ba")
        for x in (-0.85, 0.85):      # paper lanterns by the door
            add(name + f"lp{x}", tube(G(cx + x, r - 0.05, 0), G(cx + x, r - 0.05, 0.75), 0.04, 0.04), "#6b4428")
            add(name + f"ln{x}", ellipsoid(G(cx + x, r - 0.05, 0.92), (0.15, 0.15, 0.2), segs=12, rings=8), "#fff6c8")
    # A4-2: the left building stays the main dojo exactly as before (it will be remodelled on the real Action Zone
    # building once photos arrive); the middle one becomes a friendly shop; the right one is a neutral placeholder.
    dojo(3.6, 4.4, "#3f9a7a", "dojo0")
    def shop(cx, w, name):
        r = 4.65; h = 1.55
        add(name + "base", box(G(cx, r - 0.55, 0.08), (w + 0.3, D(1.2), 0.16)), "#a9adc4")
        add(name + "wall", box(G(cx, r - 0.75, 0.16 + h / 2), (w, D(1.0), h)), "#f3e7cd")
        for x in (-w / 2 + 0.08, w / 2 - 0.08):
            add(name + f"post{x}", box(G(cx + x, r - 0.27, 0.16 + h / 2), (0.14, 0.12, h)), "#7a5232")
        rf = bpy.data.meshes.new(name + "roof"); import bmesh as B
        bm = B.new(); y0, y1 = -(r - 0.1) * K, -(r - 1.45) * K; zb = 0.16 + h + 0.02; zt = zb + 0.75
        v = [bm.verts.new(p) for p in ((cx - w / 2 - 0.3, y0, zb), (cx + w / 2 + 0.3, y0, zb), (cx + w / 2 + 0.3, y1, zb), (cx - w / 2 - 0.3, y1, zb),
                                       (cx - w / 2 + 0.5, (y0 + y1) / 2, zt), (cx + w / 2 - 0.5, (y0 + y1) / 2, zt))]
        for f in ((0, 1, 5, 4), (1, 2, 5), (2, 3, 4, 5), (3, 0, 4), (0, 3, 2, 1)): bm.faces.new([v[i] for i in f])
        add(name + "roof", bm, "#6f8f6a")
        # a wide open shop front: warm-lit inside, a wooden counter, goods on shelves (no prices, no text)
        add(name + "inside", box(G(cx, r - 0.3, 0.16 + 0.78), (w - 0.7, 0.05, 1.05)), "#ffe9a0", False)
        add(name + "shelf", box(G(cx, r - 0.27, 0.16 + 1.0), (w - 0.8, 0.08, 0.06)), "#8a5e38")
        for k in range(7):
            gc = ("#6f9fd2", "#ffd36b", "#86c46c", "#b78ae0", "#f7f2e8", "#6f9fd2", "#ffd36b")[k]
            add(name + f"jar{k}", ellipsoid(G(cx - (w - 1.2) / 2 + k * (w - 1.2) / 6, r - 0.22, 0.16 + 1.13), (0.12, 0.08, 0.14), segs=10, rings=6), gc)
        add(name + "counter", box(G(cx, r - 0.12, 0.16 + 0.32), (w - 0.6, D(0.3), 0.64)), "#a8743f")
        add(name + "ctop", box(G(cx, r - 0.12, 0.16 + 0.66), (w - 0.45, D(0.34), 0.06)), "#c99a62")
        for k, gc in enumerate(("#86c46c", "#ffd36b", "#6f9fd2", "#f7f2e8", "#b78ae0")):   # fruit / goods baskets on the counter
            x = -1.1 + k * 0.55
            add(name + f"bk{k}", tube(G(cx + x, r - 0.1, 0.16 + 0.69), G(cx + x, r - 0.1, 0.16 + 0.84), 0.2, 0.22, segs=12), "#c19159")
            add(name + f"gd{k}", ellipsoid(G(cx + x, r - 0.1, 0.16 + 0.9), (0.17, 0.12, 0.1), segs=10, rings=6), gc, False)
        # striped awning (gold and cream; no red)
        n = 8; aw = (w + 0.2) / n
        for k in range(n):
            add(name + f"aw{k}", box(G(cx - (w + 0.2) / 2 + aw * (k + 0.5), r + 0.05, 0.16 + h - 0.05), (aw, D(0.55), 0.06), rot=(-22, 0, 0)), "#ffd36b" if k % 2 == 0 else "#fbf3df")
        add(name + "awedge", box(G(cx, r + 0.28, 0.16 + h - 0.2), (w + 0.2, 0.05, 0.12)), "#e8b84f")
        # crates and a round blank sign (a picture of a basket, not words)
        for x, s in ((-w / 2 - 0.1, 0.45), (-w / 2 + 0.35, 0.35), (w / 2 + 0.05, 0.42)):
            add(name + f"cr{x}", box(G(cx + x, r + 0.35, s / 2), (s, D(s), s)), "#b98a55")
        add(name + "sign", tube(G(cx, r - 0.2, 0.16 + h + 0.25), G(cx, r - 0.14, 0.16 + h + 0.25), 0.36, 0.36, segs=20, sy=1.0), "#fbf3df")
        add(name + "signbk", ellipsoid(G(cx, r - 0.1, 0.16 + h + 0.2), (0.17, 0.04, 0.1), segs=10, rings=6), "#c19159", False)
        for k, x in enumerate((-1.2, 0.0, 1.2)):   # little lanterns hanging from the awning edge
            add(name + f"ln{k}h", ellipsoid(G(cx + x, r + 0.3, 0.16 + h - 0.42), (0.13, 0.13, 0.16), segs=12, rings=8), "#fff6c8")
        for x in (-w / 2 - 0.3, w / 2 + 0.3):   # paper lanterns
            add(name + f"lp{x}", tube(G(cx + x, r + 0.1, 0), G(cx + x, r + 0.1, 0.75), 0.04, 0.04), "#6b4428")
            add(name + f"ln{x}", ellipsoid(G(cx + x, r + 0.1, 0.92), (0.15, 0.15, 0.2), segs=12, rings=8), "#fff6c8")
    shop(9.3, 4.0, "shop")
    def placeholder(cx, w, name):   # deliberately plain massing: a stand-in until the building is decided
        r = 4.65; h = 1.45
        add(name + "base", box(G(cx, r - 0.55, 0.08), (w + 0.3, D(1.2), 0.16)), "#a9adc4")
        add(name + "wall", box(G(cx, r - 0.75, 0.16 + h / 2), (w, D(1.0), h)), "#d8d4cc")
        add(name + "roof", box(G(cx, r - 0.75, 0.16 + h + 0.12), (w + 0.4, D(1.2), 0.24)), "#9aa0b0")
        add(name + "door", box(G(cx, r - 0.24, 0.16 + 0.55), (0.9, 0.05, 1.1)), "#a7a39b")
        for x in (-1.3, 1.3):
            add(name + f"win{x}", box(G(cx + x, r - 0.24, 0.16 + 0.85), (0.6, 0.05, 0.5)), "#ffe9a0", False)
    placeholder(19.6, 4.4, "plc")
    # ---------------------------------------------------------------- Student of the Month statue (generic, faceless)
    SC, SR = 11.65, 8.0
    add("pl0", tube(G(SC, SR, 0), G(SC, SR, 0.22), 1.25, 1.25, segs=28, sy=K), "#a9adc4")
    add("pl1", tube(G(SC, SR, 0.22), G(SC, SR, 0.85), 0.8, 0.72, segs=24, sy=K), "#cfc8ba")
    add("pl2", tube(G(SC, SR, 0.85), G(SC, SR, 0.98), 0.86, 0.86, segs=24, sy=K), "#e6dfcf")
    add("star", ellipsoid(G(SC, SR + 0.62, 0.55), (0.17, 0.04, 0.17), segs=5, rings=2, rot=(90, 0, 0)), "#ffd36b")
    BR = "#d9b864"   # a warm gold-stone statue: the same generic student for everyone
    zf = 0.98; S_ = 1.55
    def P(x, rr, zz): return G(SC + x * S_, SR + rr * S_, zf + zz * S_)
    add("s_legL", tube(P(-0.14, 0, 0.02), P(-0.13, 0, 0.62), 0.09 * S_, 0.1 * S_), BR)
    add("s_legR", tube(P(0.14, 0, 0.02), P(0.13, 0, 0.62), 0.09 * S_, 0.1 * S_), BR)
    add("s_feet", box(P(0, -0.04, 0.03), (0.6 * S_, 0.22 * S_ * K, 0.06 * S_)), BR)
    add("s_body", ellipsoid(P(0, 0, 0.92), (0.27 * S_, 0.18 * S_ * K, 0.36 * S_), segs=16, rings=10), BR)
    add("s_belt", tube(P(0, 0, 0.66), P(0, 0, 0.72), 0.25 * S_, 0.25 * S_, segs=16, sy=0.7 * K), "#f2e6b8")
    add("s_head", ellipsoid(P(0, 0, 1.42), (0.17 * S_, 0.15 * S_ * K, 0.18 * S_), segs=16, rings=10), BR)
    for sx in (-1, 1):   # fists closed in front of the belt: the ready stance (nothing raised above the head)
        add(f"s_arm{sx}", tube(P(sx * 0.27, 0, 1.12), P(sx * 0.2, -0.12, 0.72), 0.06 * S_, 0.06 * S_), BR)
        add(f"s_fist{sx}", ellipsoid(P(sx * 0.17, -0.16, 0.7), (0.07 * S_, 0.07 * S_, 0.07 * S_)), BR)
    add("s_shine", ellipsoid(P(-0.12, -0.14, 1.05), (0.05 * S_, 0.02, 0.12 * S_)), "#fff1c4", False)

    # ---------------------------------------------------------------- trees, benches, flowers, lamps
    def tree(c, r, s=1.0):
        add(f"trunk{c}{r}", tube(G(c, r, 0), G(c, r, 0.9 * s), 0.12, 0.09), "#7a5232")
        add(f"leaf{c}{r}", ellipsoid(G(c, r, 1.35 * s), (0.75 * s, 0.7 * s * K * 0.6, 0.62 * s), segs=16, rings=10), "#6fae5a")
        add(f"leaf2{c}{r}", ellipsoid(G(c - 0.25 * s, r + 0.1, 1.6 * s), (0.42 * s, 0.35 * s, 0.38 * s), segs=12, rings=8), "#86c46c", False)
    for c, r, s in ((6.6, 6.0, 1.0), (17.5, 6.0, 1.0), (3.4, 10.4, 1.1), (19.9, 10.4, 1.1), (0.8, 7.4, 1.2), (22.5, 7.4, 1.2), (1.6, 5.6, 0.9), (21.8, 5.6, 0.9)):
        tree(c, r, s)
    def bench(c, r):
        add(f"bs{c}", box(G(c, r, 0.38), (1.3, D(0.35), 0.08)), "#c99a62")
        add(f"bb{c}", box(G(c, r - 0.2, 0.62), (1.3, 0.06, 0.3)), "#c19159")
        for x in (-0.55, 0.55): add(f"bl{c}{x}", box(G(c + x, r, 0.19), (0.08, D(0.3), 0.38)), "#6b4428")
    bench(7.6, 9.6); bench(17.6, 9.7)
    for c, r in ((9.4, 6.0), (13.9, 6.0)):   # flower beds: yellow, white and blue flowers
        add(f"bed{c}", box(G(c, r, 0.12), (1.4, D(0.55), 0.24), bevel=0.04), "#7a5232")
        add(f"soil{c}", box(G(c, r, 0.25), (1.25, D(0.45), 0.04)), "#4f8a4a", False)
        for k, fc in enumerate(("#ffd36b", "#f7f2e8", "#6f9fd2", "#ffd36b", "#f7f2e8", "#6f9fd2")):
            add(f"fl{c}{k}", ellipsoid(G(c - 0.5 + k * 0.2, r + (0.1 if k % 2 else -0.1), 0.34), (0.08, 0.08, 0.06), segs=8, rings=4), fc, False)
    for c in (5.0, 19.0):
        add(f"lamp{c}", tube(G(c, 9.0, 0), G(c, 9.0, 1.5), 0.05, 0.05), "#5f3f26")
        add(f"lampb{c}", box(G(c, 9.0, 1.62), (0.3, 0.3, 0.32)), "#fff6c8")
        add(f"lampc{c}", tube(G(c, 9.0, 1.78), G(c, 9.0, 1.95), 0.24, 0.02, segs=4), "#5f3f26")
    # ---------------------------------------------------------------- A4-3: a little river through the square
    import random as _r; _r.seed(7)
    RV0, RV1 = 14.85, 16.35; RC = (RV0 + RV1) / 2
    add("riverbed", box(G(RC, 7.9, -0.02), (RV1 - RV0 + 0.4, D(9.6), 0.06)), "#5b9fc4", False)
    add("water", box(G(RC, 7.9, 0.015), (RV1 - RV0, D(9.6), 0.02)), "#7cc4e4", False)
    for side in (RV0 - 0.12, RV1 + 0.12):   # stone banks
        for k in range(20):
            add(f"bank{side}{k}", box(G(side, 3.3 + k * 0.45, 0.06), (0.26, D(0.42), 0.12), bevel=0.03), ("#cfc8ba", "#c6beaf")[k % 2])
    for k in range(26):   # ripples + sparkles
        x = RV0 + 0.2 + _r.random() * (RV1 - RV0 - 0.4); rr = 3.6 + _r.random() * 8.2
        add(f"rip{k}", box(G(x, rr, 0.03), (0.35 + _r.random() * 0.3, D(0.04), 0.01)), "#b5e3f5", False)
    for k in range(14):
        x = RV0 + 0.2 + _r.random() * (RV1 - RV0 - 0.4); rr = 3.6 + _r.random() * 8.2
        add(f"spk{k}", ellipsoid(G(x, rr, 0.04), (0.06, D(0.06), 0.02), segs=6, rings=3), "#ffffff", False)
    for k, (x, rr) in enumerate(((15.2, 5.3), (15.9, 6.2), (15.25, 9.6), (16.0, 10.3))):   # lily pads, white/yellow flowers
        add(f"lily{k}", ellipsoid(G(x, rr, 0.035), (0.24, D(0.2), 0.02), segs=14, rings=3), "#5fa65a", False)
        add(f"lilyf{k}", ellipsoid(G(x + 0.05, rr, 0.07), (0.07, D(0.07), 0.05), segs=8, rings=4), ("#fbf3df", "#ffd36b")[k % 2], False)
    for k, (x, rr, col) in enumerate(((15.7, 5.9, "#f59a3c"), (15.3, 6.6, "#fbf3df"), (15.9, 9.1, "#f59a3c"), (15.4, 10.0, "#ffd36b"))):   # koi: orange/white/gold, no red
        add(f"koi{k}", ellipsoid(G(x, rr, 0.035), (0.08, D(0.2), 0.015), segs=10, rings=3), col, False)
        add(f"koit{k}", ellipsoid(G(x, rr - 0.2, 0.035), (0.06, D(0.06), 0.01), segs=6, rings=3), col, False)
    # small arched wooden bridge at the statue row
    BL = RV1 - RV0 + 1.1
    for k in range(11):
        t = k / 10; x = RV0 - 0.55 + BL * t; z = 0.1 + 0.42 * math.sin(t * math.pi)
        ang = math.degrees(math.atan(0.42 * math.pi / BL * math.cos(t * math.pi)))
        add(f"brd{k}", box(G(x, 8.0, z), (0.26, D(0.95), 0.08), rot=(0, -ang, 0)), ("#c99a62", "#c19159")[k % 2])
        for side in (7.55, 8.45):
            add(f"brp{k}{side}", tube(G(x, side, z), G(x, side, z + 0.42), 0.035, 0.035), "#8a5e38", False)
    for side in (7.55, 8.45):
        pts = [G(RV0 - 0.55 + BL * t / 10, side, 0.52 + 0.42 * math.sin(t / 10 * math.pi)) for t in range(11)]
        for k in range(10):
            add(f"brr{side}{k}", tube(pts[k], pts[k + 1], 0.045, 0.045), "#a8743f", False)
    for x in (RV0 - 0.7, RV1 + 0.7):   # lanterns at the bridge ends
        add(f"brlp{x}", tube(G(x, 8.55, 0), G(x, 8.55, 0.7), 0.04, 0.04), "#6b4428")
        add(f"brln{x}", ellipsoid(G(x, 8.55, 0.85), (0.13, 0.13, 0.17), segs=12, rings=8), "#fff6c8")


if A.part == "lights":   # an emission mask: lit windows/lanterns white, everything else black (dusk glow pass)
    import re
    def em(c):
        m = bpy.data.materials.new("E" + str(c)); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
        e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (c, c, c, 1); o = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(e.outputs[0], o.inputs[0]); return m
    W_, B_ = em(1.0), em(0.0)
    LIT = re.compile(r"(glow|ln|lampb|inside|win|shoji)")
    for o in bpy.data.objects:
        if o.type == "MESH" and "_outline" in o.name: o.hide_render = True
        elif o.type == "MESH":
            lit = bool(LIT.search(o.name)) and "twin" not in o.name and "_outline" not in o.name
            for i in range(len(o.material_slots)): o.material_slots[i].material = W_ if lit else B_
FAR_KEEP = ("hill", "tw", "cap", "path", "wm_", "bp", "bn", "lh", "fall", "pool", "mist", "fb", "ct", "cb", "vh", "vr", "vw")
if A.part == "far":   # the far layer keeps only the hills and the Tower
    for o in list(bpy.data.objects):
        if o.type == "MESH" and not (o.name.startswith(FAR_KEEP)):
            bpy.data.objects.remove(o, do_unlink=True)
# ---------------------------------------------------------------- camera + render (the house settings)
r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = A.samples; sc.cycles.use_denoising = False
r.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
r.resolution_x, r.resolution_y = round(COLS * A.ppt * (1.4 if A.part == "far" else 1)), round(ROWS * A.ppt); r.resolution_percentage = 100
cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = COLS * (2.8 if A.part == "far" else 1); cd.clip_end = 300
cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
cam.rotation_euler = (math.radians(90 - EL), 0, 0)
from mathutils import Vector, Euler
d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
cam.location = (Vector((0, 4.0 * K, 4.0)) if A.part == "far" else Vector((COLS / 2, -(ROWS / 2) * K, 0))) - d * 60
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, f"town-square_{A.part}.blend"))
r.filepath = A.out; bpy.ops.render.render(write_still=True)
