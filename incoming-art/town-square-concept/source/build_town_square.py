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
if A.part == "town":
    for k in range(16):   # a soft hedge along the back edge of the town
        add(f"hedge{k}", ellipsoid(G(k * 1.6 - 0.4, 3.35, 0.25), (0.95, D(0.35), 0.42), segs=12, rings=8), "#5f9e55")
add("plaza_base", box(G(COLS / 2, 7.9, -0.03), (COLS + 2, D(6.6), 0.06)), "#948b7c", False)
STONES = ["#cfc8ba", "#c9c1b2", "#d4cdbf", "#c6beaf"]
for i in range(-1, 25):
    for j in range(0, 7):
        r = 4.95 + j
        add(f"st{i}_{j}", box(G(i + 0.5 + (0.5 if j % 2 else 0), r + 0.5, 0), (0.94, D(0.94), 0.05)), STONES[(i * 3 + j * 5) % 4], False)
# a round paving ring around the statue
for k in range(28):
    a = 2 * math.pi * k / 28
    add(f"ring{k}", box(G(11.65 + 2.55 * math.cos(a), 8.0 + 1.35 * math.sin(a), 0.03), (0.5, D(0.26), 0.04), rot=(0, 0, 0)), "#e6dfcf", False)
add("path", box(G(11.65, 10.4, 0.01), (2.2, D(1.2), 0.04)), "#e6dfcf", False)

if A.part == "far":
    # ---------------------------------------------------------------- far hills + the Tower (hazy = far away)
    for c, r, sx, h, col in ((-20, 3.6, 9, 6.0, "#a9cdb8"), (-8, 3.4, 8, 4.6, "#b3d3c2"), (9, 3.5, 9, 5.6, "#a9cdb8"), (22, 3.8, 9, 5.0, "#b3d3c2")):
        add(f"hill{c}", ellipsoid(G(c, r, -0.4), (sx, D(1.0), h), segs=24, rings=12), col, False)
    TC, TR = 0.0, 3.0      # the Tower stands far behind the town, between the 2nd and 3rd dojo
    HZ = "#b9bfdc"; HZD = "#a3a9c9"
    z = 0.0
    for k, (r0, r1, hh) in enumerate(((1.3, 1.1, 6.6), (1.1, 0.95, 5.3), (0.95, 0.8, 4.4), (0.8, 0.62, 3.5))):
        add(f"tw{k}", tube(G(TC, TR, z), G(TC, TR, z + hh), r0, r1, segs=18), HZ if k % 2 == 0 else "#c3c8e2", True)
        add(f"twband{k}", tube(G(TC, TR, z + hh - 0.12), G(TC, TR, z + hh + 0.05), r1 + 0.08, r1 + 0.08, segs=18), HZD, False)
        for w in (-0.35, 0.35):   # little warm windows
            add(f"twin{k}{w}", box(G(TC + w * r1, TR + r1 * 0.95, z + hh * 0.55), (0.14, 0.05, 0.26)), "#ffe9a0", False)
        z += hh
    add("twroof", tube(G(TC, TR, z), G(TC, TR, z + 1.1), 0.78, 0.05, segs=18), "#9aa0c4")
    add("twlight", ellipsoid(G(TC, TR, z + 1.45), (0.3, 0.3, 0.42), segs=16, rings=10), "#ffe48a", False)   # one restored fragment of light
    add("twhalo", ellipsoid(G(TC, TR, z + 1.45), (0.55, 0.12, 0.55), segs=20, rings=8), "#fff6c8", False)


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
    for i, (cx, w, cur) in enumerate(((3.6, 4.4, "#3f9a7a"), (9.3, 4.0, "#7b5cc4"), (19.6, 4.4, "#3a6ea5"))):
        dojo(cx, w, cur, f"dojo{i}")
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
    for c, r, s in ((6.6, 6.0, 1.0), (16.7, 6.0, 1.0), (3.4, 10.4, 1.1), (19.9, 10.4, 1.1), (0.8, 7.4, 1.2), (22.5, 7.4, 1.2), (1.6, 5.6, 0.9), (21.8, 5.6, 0.9)):
        tree(c, r, s)
    def bench(c, r):
        add(f"bs{c}", box(G(c, r, 0.38), (1.3, D(0.35), 0.08)), "#c99a62")
        add(f"bb{c}", box(G(c, r - 0.2, 0.62), (1.3, 0.06, 0.3)), "#c19159")
        for x in (-0.55, 0.55): add(f"bl{c}{x}", box(G(c + x, r, 0.19), (0.08, D(0.3), 0.38)), "#6b4428")
    bench(7.6, 9.6); bench(15.7, 9.6)
    for c, r in ((9.4, 6.0), (13.9, 6.0)):   # flower beds: yellow, white and blue flowers
        add(f"bed{c}", box(G(c, r, 0.12), (1.4, D(0.55), 0.24), bevel=0.04), "#7a5232")
        add(f"soil{c}", box(G(c, r, 0.25), (1.25, D(0.45), 0.04)), "#4f8a4a", False)
        for k, fc in enumerate(("#ffd36b", "#f7f2e8", "#6f9fd2", "#ffd36b", "#f7f2e8", "#6f9fd2")):
            add(f"fl{c}{k}", ellipsoid(G(c - 0.5 + k * 0.2, r + (0.1 if k % 2 else -0.1), 0.34), (0.08, 0.08, 0.06), segs=8, rings=4), fc, False)
    for c in (5.0, 18.3):
        add(f"lamp{c}", tube(G(c, 9.0, 0), G(c, 9.0, 1.5), 0.05, 0.05), "#5f3f26")
        add(f"lampb{c}", box(G(c, 9.0, 1.62), (0.3, 0.3, 0.32)), "#fff6c8")
        add(f"lampc{c}", tube(G(c, 9.0, 1.78), G(c, 9.0, 1.95), 0.24, 0.02, segs=4), "#5f3f26")


if A.part == "far":   # the far layer keeps only the hills and the Tower
    for o in list(bpy.data.objects):
        if o.type == "MESH" and not (o.name.startswith("hill") or o.name.startswith("tw")):
            bpy.data.objects.remove(o, do_unlink=True)
# ---------------------------------------------------------------- camera + render (the house settings)
r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = A.samples; sc.cycles.use_denoising = False
r.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
r.resolution_x, r.resolution_y = round(COLS * A.ppt), round(ROWS * A.ppt); r.resolution_percentage = 100
cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = COLS * (2 if A.part == "far" else 1); cd.clip_end = 300
cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
cam.rotation_euler = (math.radians(90 - EL), 0, 0)
from mathutils import Vector, Euler
d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
cam.location = (Vector((0, 4.0 * K, 0)) if A.part == "far" else Vector((COLS / 2, -(ROWS / 2) * K, 0))) - d * 60
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, f"town-square_{A.part}.blend"))
r.filepath = A.out; bpy.ops.render.render(write_still=True)
