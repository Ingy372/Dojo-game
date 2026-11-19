"""Dojo Ascent - the town, redesigned (Claude Code, Nov 18 2026; Jay: "bigger, very martial artsy, sakura trees, and it
gets nicer and nicer as you play").

Same house look as every other piece of art: toon_kit materials and outlines, an orthographic camera looking north
35 deg down, ground laid out on the game grid (G(col,row): x = col, y = -row*K, K = 1/sin35, so one ground tile is
square on screen). Ground tile (c, r) lands on picture pixel (c*ppt, r*ppt).

The town is 46 x 30 tiles. Everything that stands up (buildings, trees, lanterns, the statue, the gate) is its own
piece, so the hero can walk behind it, and every piece has the belt (stage 1-10) it first appears at, and optionally
the stage it is replaced at ("until"). The game shows the pieces for the student's real belt.

    blender -b -P build_town.py -- --mode ground --out <dir>      the ground picture (no standing pieces)
    blender -b -P build_town.py -- --mode props  --out <dir>      one full-frame PNG per piece (only its box rendered)
    blender -b -P build_town.py -- --mode meta   --out <dir>      just town_meta.json (pieces, stages, blocked cells)
Then pack_town.py crops, writes the sprites, the walk file and the stage previews."""
import bpy, sys, os, math, json, argparse, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from toon_kit import *
from mathutils import Vector, Euler

ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True); ap.add_argument("--mode", default="meta")
ap.add_argument("--samples", type=int, default=16); ap.add_argument("--ppt", type=int, default=80)
ap.add_argument("--only", default="", help="comma list of piece ids to render (props mode)")
ap.add_argument("--gpu", action="store_true")
A = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
os.makedirs(A.out, exist_ok=True)

EL = 35.0; K = 1 / math.sin(math.radians(EL))
COLS, ROWS = 46, 30
random.seed(11)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; coll = sc.collection
OUT_M = outline_material(); MATS = {}

def mat(h):
    if h not in MATS: MATS[h] = toon_material("M" + h, h)
    return MATS[h]

def alpha_mat(h, a):
    """Flat colour at a given opacity (contact shadows, lantern glow)."""
    key = f"A{h}{a}"
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new(key); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = srgb(h)
    t = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs["Fac"].default_value = a
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(t.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], o.inputs["Surface"])
    MATS[key] = m; return m

GRP = ["ground"]
META = {}
GROUND_BLOCK = set()

def piece(pid, anchor, stage=1, until=None, sort=None, flat=False, block=()):
    """Starts a standing piece. anchor = the tile point on the ground the picture is pinned to; sort = the row it sorts
    by against the hero (default the anchor row); block = the walk cells (col, row) it fills while shown."""
    GRP[0] = pid
    META[pid] = dict(id=pid, anchorTile=[round(anchor[0], 3), round(anchor[1], 3)],
                     sortRow=round(anchor[1] if sort is None else sort, 3), stage=stage, until=until, flat=flat,
                     block=sorted({(int(c), int(r)) for c, r in block}))

def ground():
    GRP[0] = "ground"

def tag(ob):
    ob["grp"] = GRP[0]; return ob

def add(name, bm, hexc, outline=True, w=1.6):
    name = f"{GRP[0]}:{name}"
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat(hexc))
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob); tag(ob)
    for p in me.polygons: p.use_smooth = False
    if outline: tag(add_hull(ob, coll, OUT_M, OUTLINE_W * w))
    return ob

def add_a(name, bm, hexc, a):
    name = f"{GRP[0]}:{name}"
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(alpha_mat(hexc, a))
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob); tag(ob)
    return ob

def G(c, r, z=0.0): return (c, -r * K, z)
def D(rows): return rows * K

def shadow(c, r, rx, ry, a=0.1):
    add_a(f"shadow{c:.2f}{r:.2f}", ellipsoid(G(c, r, 0.012), (rx * 0.75, D(ry * 0.75), 0.004), segs=24, rings=4), "#2a2438", a)

def cells(c0, c1, r0, r1):
    return [(c, r) for c in range(c0, c1 + 1) for r in range(r0, r1 + 1)]

import bmesh as B

def hip_roof(name, cx, rf, rb, zb, w, h, col, ox=0.35, oy=0.3, inset=0.6, flick=True, ridge="#d9a441"):
    """A tiled hip roof over a building whose front wall is at row rf and back wall at row rb (rf > rb)."""
    bm = B.new(); y0, y1 = -(rf + oy) * K, -(rb - oy) * K; zt = zb + h
    v = [bm.verts.new(p) for p in ((cx - w / 2 - ox, y0, zb), (cx + w / 2 + ox, y0, zb), (cx + w / 2 + ox, y1, zb), (cx - w / 2 - ox, y1, zb),
                                   (cx - w / 2 + inset, (y0 + y1) / 2, zt), (cx + w / 2 - inset, (y0 + y1) / 2, zt))]
    for f in ((0, 1, 5, 4), (1, 2, 5), (2, 3, 4, 5), (3, 0, 4), (0, 3, 2, 1)): bm.faces.new([v[i] for i in f])
    add(name, bm, col)
    # tile lines down the front slope (thin darker strips)
    n = max(3, int(w * 1.6))
    for k in range(1, n):
        t = k / n; xa = cx - w / 2 - ox + (w + 2 * ox) * t
        xb = (cx - w / 2 + inset) + (w - 2 * inset) * t
        p0 = Vector((xa, y0 + 0.02, zb + 0.02)); p1 = Vector((xb, (y0 + y1) / 2 + 0.02, zt - 0.02))
        mid = (p0 + p1) / 2; d = p1 - p0
        bm2 = B.new(); B.ops.create_cube(bm2, size=1.0)
        from mathutils import Matrix
        rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
        B.ops.transform(bm2, matrix=Matrix.Translation(mid) @ rot @ Matrix.Diagonal((0.035, 0.035, d.length, 1)), verts=bm2.verts)
        add(f"{name}tl{k}", bm2, shade(col, 0.8), False)
    if ridge:
        add(name + "ridge", tube((cx - w / 2 + inset - 0.05, (y0 + y1) / 2, zt + 0.03), (cx + w / 2 - inset + 0.05, (y0 + y1) / 2, zt + 0.03), 0.08, 0.08), ridge)
        for sx in (-1, 1):   # ridge-end ornaments
            add(f"{name}orn{sx}", ellipsoid((cx + sx * (w / 2 - inset + 0.05), (y0 + y1) / 2, zt + 0.16), (0.12, 0.08, 0.16), segs=10, rings=6), ridge)
    if flick:   # upturned eave corners
        for sx in (-1, 1):
            for yy in (y0, y1):
                add(f"{name}fl{sx}{yy:.1f}", box((cx + sx * (w / 2 + ox - 0.05), yy, zb + 0.08), (0.42, 0.18, 0.08), rot=(0, sx * -24, 0)), shade(col, 0.85))
        add(name + "eave", box((cx, y0 - 0.02, zb + 0.02), (w + 2 * ox - 0.3, 0.08, 0.07)), shade(col, 0.7), False)

def shade(h, f):
    h = h.lstrip("#"); return "#" + "".join(f"{max(0, min(255, round(int(h[i:i + 2], 16) * f))):02x}" for i in (0, 2, 4))

def walls(name, cx, rf, depth, w, h, base=0.16, plaster="#efe3c6", wood="#7a5232", posts=None):
    add(name + "base", box(G(cx, rf - depth / 2 + 0.1, base / 2), (w + 0.3, D(depth + 0.25), base)), "#a9adc4")
    add(name + "wall", box(G(cx, rf - depth / 2, base + h / 2), (w, D(depth), h)), plaster)
    for x in (posts if posts is not None else [-w / 2 + 0.08, w / 2 - 0.08]):
        add(name + f"post{x:.2f}", box(G(cx + x, rf, base + h / 2), (0.14, 0.12, h)), wood)
    add(name + "beam", box(G(cx, rf, base + h - 0.06), (w + 0.1, 0.14, 0.14)), shade(wood, 0.88))
    add(name + "rail", box(G(cx, rf, base + 0.18), (w + 0.05, 0.1, 0.1)), shade(wood, 0.88), False)

def shoji(name, cx, rf, z0, w, h, n=2):
    """Paper sliding panels with a wood lattice, set into the front wall."""
    add(name + "pap", box(G(cx, rf + 0.01, z0 + h / 2), (w, 0.04, h)), "#fbf3df", False)
    for k in range(n + 1):
        add(name + f"v{k}", box(G(cx - w / 2 + w * k / n, rf + 0.03, z0 + h / 2), (0.05, 0.03, h)), "#8a5e38", False)
    for k in range(1, 4):
        add(name + f"h{k}", box(G(cx, rf + 0.03, z0 + h * k / 4), (w, 0.03, 0.035)), "#8a5e38", False)

def noren(name, cx, rf, z, w, col, n=3, emblem="#fbf3df"):
    add(name + "rod", tube(G(cx - w / 2 - 0.05, rf + 0.12, z + 0.02), G(cx + w / 2 + 0.05, rf + 0.12, z + 0.02), 0.03, 0.03), "#6b4428", False)
    for k in range(n):
        add(name + f"c{k}", box(G(cx - w / 2 + w * (k + 0.5) / n, rf + 0.12, z - 0.22), (w / n - 0.04, 0.04, 0.44)), col)
    add(name + "em", ellipsoid(G(cx, rf + 0.15, z - 0.2), (0.11, 0.02, 0.11), segs=12, rings=4), emblem, False)

# ===================================================================================== GROUND (never stands up)
ground()
add("grass", box(G(COLS / 2, ROWS / 2, -0.06), (COLS + 2, D(ROWS + 2), 0.1)), "#86c46c", False)
for k in range(220):   # tufts and tiny flowers in the grass
    c, r = random.uniform(0, COLS), random.uniform(0, ROWS)
    add(f"tuft{k}", ellipsoid(G(c, r, 0.0), (0.16, D(0.06), 0.03), segs=6, rings=3), random.choice(("#78b860", "#94cf78", "#7fbf6f")), False)
for k in range(70):
    c, r = random.uniform(1, COLS - 1), random.uniform(15, ROWS - 1)
    add(f"flw{k}", ellipsoid(G(c, r, 0.02), (0.05, D(0.05), 0.02), segs=6, rings=3), random.choice(("#fbf3df", "#ffd36b", "#f6c3d6")), False)

# --- the back of town: tree canopy beyond a long plaster wall with a dark tiled cap (rows 0-4.5)
for k in range(30):
    c = -0.5 + k * 1.65 + random.uniform(-0.3, 0.3); r = random.uniform(1.3, 3.2)
    col = random.choice(("#5f9e55", "#4f8a4a", "#6fae5a"))
    add(f"bk{k}", ellipsoid(G(c, r, 0.9), (1.25, D(0.8), 1.0), segs=14, rings=8), col)
for k in range(9):   # a few sakura in the back canopy
    c = 2 + k * 5.3 + random.uniform(-0.6, 0.6)
    add(f"bks{k}", ellipsoid(G(c, 3.3, 1.3), (1.0, D(0.6), 0.75), segs=14, rings=8), "#f6c3d6")
    add(f"bks2{k}", ellipsoid(G(c - 0.3, 3.4, 1.65), (0.5, D(0.35), 0.4), segs=10, rings=6), "#fbdbe6", False)
add("nwall", box(G(COLS / 2, 4.35, 0.45), (COLS + 1, D(0.3), 0.9)), "#efe3c6")
add("nwallcap", box(G(COLS / 2, 4.35, 0.95), (COLS + 1.2, D(0.55), 0.12)), "#4a4f66")
add("nwallbase", box(G(COLS / 2, 4.4, 0.08), (COLS + 1, D(0.36), 0.16)), "#a9adc4", False)
add("backgrass", box(G(COLS / 2, 6.8, -0.04), (COLS + 1, D(4.6), 0.05)), "#7fbf6f", False)

# --- side walls (low; the hero never stands behind them)
for c in (0.35, COLS - 0.35):
    add(f"swall{c}", box(G(c, (4.5 + ROWS) / 2, 0.35), (0.3, D(ROWS - 4.5), 0.7)), "#efe3c6")
    add(f"swallcap{c}", box(G(c, (4.5 + ROWS) / 2, 0.75), (0.5, D(ROWS - 4.4), 0.1)), "#4a4f66")

STONES = ["#d6cfc1", "#cfc8ba", "#dad3c6", "#c9c1b2"]
def paving(nm, c0, c1, r0, r1, base="#948b7c", stones=STONES, size=1.0, offset=True):
    add(nm + "base", box(G((c0 + c1) / 2, (r0 + r1) / 2, -0.025), (c1 - c0, D(r1 - r0), 0.05)), base, False)
    j = 0; r = r0
    while r < r1 - 0.01:
        c = c0 - (size / 2 if (offset and j % 2) else 0)
        while c < c1 - 0.01:
            a, b = max(c, c0), min(c + size, c1)
            if b - a > 0.05:
                add(f"{nm}{j}_{c:.1f}", box(G((a + b) / 2, r + size / 2, 0), (b - a - 0.06, D(size - 0.06), 0.05)), stones[(int(c * 3) + j * 5) % len(stones)], False)
            c += size
        r += size; j += 1

# main street (rows 9-14) across the whole town
paving("street", 0.7, COLS - 0.7, 9.0, 14.0)
# the plaza (big, light stone) and its round centre
paving("plaza", 15.0, 31.0, 14.0, 25.0, stones=["#e6dfcf", "#e0d8c6", "#ebe4d5", "#ddd5c3"])
for k in range(36):
    a = 2 * math.pi * k / 36
    add(f"ring{k}", box(G(23 + 3.4 * math.cos(a), 19.0 + 3.4 * math.sin(a), 0.035), (0.55, D(0.3), 0.04), rot=(0, 0, -math.degrees(a) + 90)), "#bfb59f", False)
for k in range(24):
    a = 2 * math.pi * k / 24
    add(f"ring2{k}", box(G(23 + 2.3 * math.cos(a), 19.0 + 2.3 * math.sin(a), 0.035), (0.5, D(0.26), 0.04), rot=(0, 0, -math.degrees(a) + 90)), "#cfc8ba", False)
# the way to My Dojo (east) and the west lawn path
paving("east", 31.0, COLS - 0.7, 14.0, 24.0)
paving("west", 0.7, 15.0, 14.0, 15.0)
for k, (c, r) in enumerate(((13.3, 16.2), (12.6, 17.4), (13.4, 24.3), (12.8, 25.6), (2.2, 24.6), (3.4, 25.4))):
    add(f"step{k}", ellipsoid(G(c, r, 0.02), (0.42, D(0.3), 0.05), segs=12, rings=4), "#d6cfc1", False)
# the garden path south through the gate (gravel) and the garden lawn
add("gravel", box(G(23, 27.2, -0.02), (5.6, D(4.4), 0.04)), "#e9e0c8", False)
for k in range(40):
    add(f"grv{k}", ellipsoid(G(random.uniform(20.5, 25.5), random.uniform(25.3, 29), 0.0), (0.06, D(0.04), 0.02), segs=6, rings=3), "#cfc3a5", False)
# zen sand bed with raked lines and three rocks (west of the garden path), blocked
add("zen", box(G(17.5, 27.3, 0.0), (3.6, D(2.2), 0.06)), "#efe6cf", False)
add("zenrim", box(G(17.5, 27.3, -0.01), (3.9, D(2.5), 0.05)), "#a9adc4", False)
for k in range(7):
    add(f"rake{k}", box(G(17.5, 26.4 + k * 0.3, 0.035), (3.4, D(0.03), 0.01)), "#d9ceb0", False)
for k, (c, r, s) in enumerate(((16.6, 27.0, 0.38), (18.4, 27.8, 0.3), (17.9, 26.7, 0.22))):
    add(f"zrock{k}", ellipsoid(G(c, r, 0.1), (s, D(s * 0.7), s * 0.7), segs=10, rings=6), "#8e92ab")
GROUND_BLOCK.update(cells(16, 18, 26, 28))
# a moss garden east of the path
add("moss", box(G(28.5, 27.3, 0.0), (3.6, D(2.2), 0.05)), "#6fae5a", False)
for k in range(9):
    add(f"mossb{k}", ellipsoid(G(random.uniform(27, 30), random.uniform(26.5, 28.2), 0.06), (0.35, D(0.25), 0.15), segs=10, rings=5), random.choice(("#5f9e55", "#78b860")), False)
GROUND_BLOCK.update(cells(27, 29, 26, 28))

# the practice yard: a raised wooden floor with a sand border (walkable)
YC, YR = 7.5, 20.0
add("yd_sand", box(G(YC, YR, 0.0), (10.2, D(7.8), 0.04)), "#e9d7a8", False)
add("yd_floor", box(G(YC, YR, 0.05), (9.4, D(7.0), 0.08), bevel=0.03), "#c99a62", True, 1.2)
for k in range(1, 19):
    add(f"yd_pl{k}", box(G(YC - 4.7 + k * 0.5, YR, 0.095), (0.03, D(6.95), 0.01)), "#a8743f", False)
add("yd_mat", box(G(YC, YR + 0.6, 0.1), (4.2, D(3.0), 0.03)), "#3a6ea5", False)
add("yd_matrim", box(G(YC, YR + 0.6, 0.095), (4.5, D(3.3), 0.03)), "#6f9fd2", False)

# the koi pond (south-east), blocked
PC, PR, PRX, PRY = 39.5, 26.2, 4.2, 2.0
add("pondbed", ellipsoid(G(PC, PR, -0.03), (PRX + 0.2, D(PRY + 0.2), 0.04), segs=40, rings=6), "#5b9fc4", False)
add("water", ellipsoid(G(PC, PR, 0.0), (PRX, D(PRY), 0.02), segs=40, rings=6), "#7cc4e4", False)
for k in range(38):
    a = 2 * math.pi * k / 38
    add(f"prim{k}", ellipsoid(G(PC + (PRX + 0.1) * math.cos(a), PR + (PRY + 0.1) * math.sin(a), 0.05), (0.3, D(0.2), 0.1), segs=10, rings=5), random.choice(("#cfc8ba", "#c6beaf", "#d6cfc1")))
for k in range(18):
    a = random.uniform(0, 2 * math.pi); q = random.uniform(0, 0.8)
    add(f"prip{k}", box(G(PC + PRX * q * math.cos(a), PR + PRY * q * math.sin(a), 0.03), (random.uniform(0.3, 0.6), D(0.04), 0.01)), "#b5e3f5", False)
for c in range(COLS):
    for r in range(ROWS):
        if ((c + 0.5 - PC) / (PRX + 0.45)) ** 2 + ((r + 0.5 - PR) / (PRY + 0.45)) ** 2 <= 1.0: GROUND_BLOCK.add((c, r))

# the Action Zone's wide stone steps (flat)
add("az_steps", box(G(23, 9.45, 0.03), (4.6, D(0.9), 0.06)), "#cfc8ba", False)
add("az_steps2", box(G(23, 9.15, 0.08), (3.8, D(0.4), 0.06)), "#d6cfc1", False)
# My Dojo's doorstep
add("md_step", box(G(38.5, 20.35, 0.03), (1.8, D(0.5), 0.06)), "#cfc8ba", False)

# ===================================================================================== STANDING PIECES
def lantern_pole(pid, c, r, stage=2):
    piece(pid, (c, r), stage=stage, block=[(c, r)])
    shadow(c, r, 0.3, 0.15)
    add("pole", tube(G(c, r, 0), G(c, r, 2.1), 0.05, 0.045), "#5f3f26")
    add("arm", box(G(c, r, 2.05), (0.5, 0.06, 0.06)), "#5f3f26")
    add("lan", ellipsoid(G(c + 0.2, r + 0.02, 1.7), (0.2, 0.2, 0.28), segs=14, rings=8), "#b8322a")
    for zz in (1.45, 1.95): add(f"cap{zz}", tube(G(c + 0.2, r + 0.02, zz - 0.03), G(c + 0.2, r + 0.02, zz + 0.03), 0.12, 0.12), "#2c2a33", False)
    add("band", tube(G(c + 0.2, r + 0.02, 1.68), G(c + 0.2, r + 0.02, 1.74), 0.205, 0.205, segs=14), "#ffd36b", False)

def stone_lantern(pid, c, r, lit, stage=1, until=None, s=1.0):
    piece(pid, (c, r), stage=stage, until=until, block=[(c, r)])
    shadow(c, r, 0.45 * s, 0.22 * s)
    add("base", tube(G(c, r, 0), G(c, r, 0.14 * s), 0.34 * s, 0.3 * s, segs=6), "#a9adc4")
    add("post", tube(G(c, r, 0.14 * s), G(c, r, 0.75 * s), 0.12 * s, 0.1 * s, segs=8), "#b7bacd")
    add("plat", tube(G(c, r, 0.75 * s), G(c, r, 0.86 * s), 0.3 * s, 0.3 * s, segs=6), "#a9adc4")
    add("box", box(G(c, r, 1.08 * s), (0.36 * s, 0.36 * s, 0.42 * s)), "#b7bacd")
    add("win", box(G(c, r + 0.19 * s, 1.08 * s), (0.2 * s, 0.02, 0.22 * s)), "#ffe9a0" if lit else "#5d6177", False)
    add("roof", tube(G(c, r, 1.3 * s), G(c, r, 1.62 * s), 0.46 * s, 0.05 * s, segs=6), "#8e92ab")
    add("tip", ellipsoid(G(c, r, 1.7 * s), (0.08 * s, 0.08 * s, 0.1 * s), segs=8, rings=6), "#8e92ab")
    if lit:
        add_a("glow", ellipsoid(G(c, r + 0.25 * s, 1.08 * s), (0.45 * s, 0.05, 0.4 * s), segs=16, rings=8), "#fff6c8", 0.35)

def tree(pid, c, r, s=1.0, stage=1, until=None):
    piece(pid, (c, r), stage=stage, until=until, block=[(c, r)])
    shadow(c, r, 0.9 * s, 0.45 * s)
    add("trunk", tube(G(c, r, 0), G(c, r, 1.0 * s), 0.14 * s, 0.1 * s), "#7a5232")
    add("leaf", ellipsoid(G(c, r, 1.55 * s), (0.95 * s, 0.65 * s, 0.8 * s), segs=16, rings=10), "#6fae5a")
    add("leaf2", ellipsoid(G(c + 0.35 * s, r + 0.15, 1.35 * s), (0.55 * s, 0.4 * s, 0.45 * s), segs=12, rings=8), "#5f9e55")
    add("leaf3", ellipsoid(G(c - 0.3 * s, r + 0.1, 1.95 * s), (0.5 * s, 0.38 * s, 0.42 * s), segs=12, rings=8), "#86c46c", False)

def sakura(pid, c, r, s=1.0, stage=1, until=None, planter=False, block=None):
    piece(pid, (c, r), stage=stage, until=until, block=block if block is not None else [(c, r)])
    shadow(c, r, 1.25 * s, 0.6 * s)
    if planter:
        add("planter", tube(G(c, r, 0), G(c, r, 0.32), 0.62, 0.66, segs=16, sy=1.0), "#b7bacd")
        add("soil", tube(G(c, r, 0.3), G(c, r, 0.34), 0.56, 0.56, segs=16), "#6b4a32", False)
    z0 = 0.3 if planter else 0.0
    add("trunk", tube(G(c, r, z0), G(c - 0.12 * s, r, z0 + 0.8 * s), 0.15 * s, 0.11 * s), "#6b4428")
    add("br1", tube(G(c - 0.12 * s, r, z0 + 0.75 * s), G(c - 0.6 * s, r, z0 + 1.35 * s), 0.08 * s, 0.05 * s), "#6b4428")
    add("br2", tube(G(c - 0.12 * s, r, z0 + 0.75 * s), G(c + 0.55 * s, r, z0 + 1.3 * s), 0.08 * s, 0.05 * s), "#6b4428")
    blobs = ((0, 0, 1.6, 1.15, 0.85, "#f6c3d6"), (-0.65, 0.12, 1.4, 0.65, 0.55, "#f2b0c8"), (0.7, 0.12, 1.45, 0.65, 0.55, "#f2b0c8"),
             (-0.25, 0.2, 2.05, 0.6, 0.45, "#fbdbe6"), (0.35, 0.25, 1.95, 0.5, 0.4, "#fde7ef"), (0.05, 0.35, 1.25, 0.55, 0.35, "#eea3bf"))
    for k, (dx, dr, z, sx, sz, col) in enumerate(blobs):
        add(f"bl{k}", ellipsoid(G(c + dx * s, r + dr, z0 + z * s), (sx * s, 0.55 * s, sz * s), segs=16, rings=10), col, k < 3)
    for k in range(10):   # little blossom dots on the canopy edge
        a = random.uniform(0, 2 * math.pi)
        add(f"dot{k}", ellipsoid(G(c + math.cos(a) * 0.95 * s, r + 0.4, z0 + (1.6 + math.sin(a) * 0.6) * s), (0.07, 0.04, 0.07), segs=6, rings=4), "#fff3f7", False)

def pine(pid, c, r, s=1.0, stage=1, until=None):
    piece(pid, (c, r), stage=stage, until=until, block=[(c, r)])
    shadow(c, r, 1.0 * s, 0.5 * s)
    add("trunk", tube(G(c, r, 0), G(c + 0.2 * s, r, 1.6 * s), 0.16 * s, 0.1 * s), "#6b4428")
    for k, (dx, z, sx) in enumerate(((0.0, 0.9, 1.05), (0.35, 1.45, 0.85), (-0.2, 1.95, 0.7), (0.25, 2.35, 0.45))):
        add(f"pad{k}", ellipsoid(G(c + dx * s, r + 0.05, z * s), (sx * s, 0.55 * s, 0.26 * s), segs=16, rings=6), ("#4f8a4a", "#5f9e55")[k % 2])

def bamboo(pid, c0, r0, n, stage=6, block=()):
    piece(pid, (c0, r0), stage=stage, block=block)
    for k in range(n):
        c = c0 + random.uniform(-1.4, 1.4); r = r0 - random.uniform(0, 1.2); h = random.uniform(2.3, 3.2)
        add(f"st{k}", tube(G(c, r, 0), G(c + random.uniform(-0.1, 0.1), r, h), 0.06, 0.05, segs=8), random.choice(("#7fae4f", "#8cbc5a", "#6f9e45")))
        for j in range(1, 5):
            add(f"nd{k}{j}", tube(G(c, r, h * j / 5 - 0.02), G(c, r, h * j / 5 + 0.02), 0.07, 0.07, segs=8), "#5f8a3a", False)
        add(f"lf{k}", ellipsoid(G(c, r + 0.05, h), (0.42, 0.2, 0.32), segs=10, rings=6), random.choice(("#6fae5a", "#86c46c")))

def bench(pid, c, r, stage=1):
    piece(pid, (c, r), stage=stage, block=[(x, r) for x in range(int(c - 0.7), int(c + 0.7) + 1)])
    shadow(c, r, 0.85, 0.25)
    add("seat", box(G(c, r, 0.38), (1.4, D(0.35), 0.08)), "#c99a62")
    add("back", box(G(c, r - 0.2, 0.62), (1.4, 0.06, 0.3)), "#c19159")
    for x in (-0.6, 0.6): add(f"leg{x}", box(G(c + x, r, 0.19), (0.08, D(0.3), 0.38)), "#6b4428")

def makiwara(pid, c, r, stage=1):
    piece(pid, (c, r), stage=stage, block=[(c, r)])
    shadow(c, r, 0.3, 0.14)
    add("post", box(G(c, r, 0.62), (0.16, D(0.12), 1.24)), "#8a5e38")
    add("pad", box(G(c, r + 0.07, 0.98), (0.24, D(0.1), 0.38)), "#e4cf8f")
    for zz in (0.86, 1.1): add(f"rope{zz}", box(G(c, r + 0.1, zz), (0.26, D(0.04), 0.04)), "#7a5232", False)

def nobori(pid, c, r, col, stage=3):
    piece(pid, (c, r), stage=stage, block=[(c, r)])
    shadow(c, r, 0.25, 0.12)
    add("pole", tube(G(c, r, 0), G(c, r, 2.4), 0.04, 0.04), "#6b4428")
    add("bar", box(G(c + 0.22, r, 2.3), (0.5, 0.04, 0.04)), "#6b4428", False)
    add("cloth", box(G(c + 0.22, r, 1.55), (0.38, 0.04, 1.4)), col)
    add("edge", box(G(c + 0.22, r + 0.025, 2.2), (0.38, 0.02, 0.1)), "#fbf3df", False)
    add("mark", ellipsoid(G(c + 0.22, r + 0.03, 1.75), (0.11, 0.02, 0.11), segs=12, rings=4), "#fbf3df", False)

# ---------------------------------------------------------------- the Action Zone (centre of the north side)
AZC, AZF, AZD, AZW = 23.0, 9.0, 4.2, 12.0
piece("az", (AZC, AZF), sort=AZF)
shadow(AZC, AZF + 0.1, 6.6, 0.4, 0.18)
walls("az", AZC, AZF, AZD, AZW, 1.7, posts=[-5.92, -3.6, -1.3, 1.3, 3.6, 5.92])
for x in (-4.75, -2.45, 2.45, 4.75): shoji(f"azs{x}", AZC + x, AZF, 0.45, 1.9, 1.1, n=3)
add("azdoorfr", box(G(AZC, AZF + 0.02, 0.16 + 0.75), (2.5, 0.08, 1.5)), "#4a3020")
add("azdoorL", box(G(AZC - 0.62, AZF + 0.05, 0.16 + 0.7), (1.1, 0.06, 1.38)), "#a8743f")
add("azdoorR", box(G(AZC + 0.62, AZF + 0.05, 0.16 + 0.7), (1.1, 0.06, 1.38)), "#a8743f")
for x in (-0.62, 0.62):
    for zz in (0.5, 1.1): add(f"azstud{x}{zz}", box(G(AZC + x, AZF + 0.09, zz), (0.9, 0.02, 0.05)), "#7a5232", False)
noren("aznoren", AZC, AZF, 1.62, 2.3, "#3a6ea5", n=4)
hip_roof("azroof1", AZC, AZF + 0.05, AZF - AZD, 1.88, AZW + 0.4, 0.55, "#566690", ox=0.55, oy=0.45, inset=0.2, ridge=None)
add("azupper", box(G(AZC, AZF - AZD / 2, 2.6), (AZW - 3.2, D(AZD - 1.2), 0.9)), "#efe3c6")
for x in (-4.3, -1.5, 1.5, 4.3): add(f"azupost{x}", box(G(AZC + x, AZF - 0.6, 2.6), (0.12, 0.1, 0.9)), "#7a5232")
for x in (-2.9, 0, 2.9): add(f"azuwin{x}", box(G(AZC + x, AZF - 0.58, 2.6), (1.0, 0.03, 0.4)), "#ffe9a0", False)
hip_roof("azroof2", AZC, AZF - 0.55, AZF - AZD + 0.6, 3.05, AZW - 2.4, 1.2, "#566690", ox=0.55, oy=0.35, inset=1.6)
add("azplaque", box(G(AZC, AZF - 0.5, 3.35), (1.6, 0.06, 0.55)), "#2c2a33")
add("azplaquerim", box(G(AZC, AZF - 0.53, 3.35), (1.75, 0.04, 0.68)), "#d9a441", False)
add("azemblem", ellipsoid(G(AZC, AZF - 0.45, 3.35), (0.18, 0.02, 0.18), segs=16, rings=4), "#ffd36b", False)
META["az"]["block"] = []

# extra gold for the Action Zone at stage 9: long banners on the front and gold roof tips
piece("az-gold", (AZC, AZF), stage=9, sort=AZF + 0.01)
for x in (-6.25, 6.25):
    add(f"tare{x}", box(G(AZC + x, AZF + 0.12, 1.15), (0.42, 0.04, 1.5)), "#3a6ea5")
    add(f"tareg{x}", box(G(AZC + x, AZF + 0.15, 1.15), (0.3, 0.02, 1.35)), "#ffd36b", False)
    add(f"tarem{x}", ellipsoid(G(AZC + x, AZF + 0.17, 1.5), (0.1, 0.02, 0.1), segs=10, rings=4), "#3a6ea5", False)
for sx in (-1, 1):
    add(f"tip{sx}", ellipsoid(G(AZC + sx * (AZW / 2 - 0.4), AZF - AZD / 2, 4.42), (0.22, 0.12, 0.3), segs=12, rings=8), "#ffd36b")

# ---------------------------------------------------------------- the market (west of the Action Zone)
MC, MF, MW = 7.6, 9.0, 8.4
piece("market", (MC, MF))
shadow(MC, MF + 0.1, 4.6, 0.35, 0.18)
walls("mk", MC, MF, 3.6, MW, 1.55, plaster="#f3e7cd")
add("mkinside", box(G(MC, MF + 0.02, 0.16 + 0.75), (MW - 0.9, 0.05, 1.05)), "#ffe9a0", False)
add("mkshelf", box(G(MC, MF + 0.05, 0.16 + 1.0), (MW - 1.0, 0.08, 0.06)), "#8a5e38")
for k in range(9):
    add(f"jar{k}", ellipsoid(G(MC - (MW - 1.6) / 2 + k * (MW - 1.6) / 8, MF + 0.08, 0.16 + 1.13), (0.12, 0.08, 0.14), segs=10, rings=6),
        ("#6f9fd2", "#ffd36b", "#86c46c", "#b78ae0", "#f7f2e8")[k % 5])
add("mkcounter", box(G(MC, MF + 0.25, 0.16 + 0.32), (MW - 0.8, D(0.35), 0.64)), "#a8743f")
add("mkctop", box(G(MC, MF + 0.25, 0.16 + 0.66), (MW - 0.6, D(0.4), 0.06)), "#c99a62")
for k, gc in enumerate(("#86c46c", "#ffd36b", "#6f9fd2", "#f7f2e8", "#b78ae0", "#f59a3c", "#86c46c")):
    x = -2.7 + k * 0.9
    add(f"bk{k}", tube(G(MC + x, MF + 0.25, 0.16 + 0.69), G(MC + x, MF + 0.25, 0.16 + 0.84), 0.22, 0.25, segs=12), "#c19159")
    add(f"gd{k}", ellipsoid(G(MC + x, MF + 0.25, 0.16 + 0.9), (0.19, 0.13, 0.11), segs=10, rings=6), gc, False)
n = 10; aw = (MW + 0.2) / n
for k in range(n):
    add(f"aw{k}", box(G(MC - (MW + 0.2) / 2 + aw * (k + 0.5), MF + 0.35, 0.16 + 1.55 - 0.05), (aw, D(0.6), 0.06), rot=(-22, 0, 0)), "#3f9a7a" if k % 2 == 0 else "#fbf3df")
add("awedge", box(G(MC, MF + 0.6, 0.16 + 1.35), (MW + 0.2, 0.05, 0.12)), "#2f7a60")
hip_roof("mkroof", MC, MF, MF - 3.6, 1.73, MW, 0.85, "#6f8f6a", ox=0.35, oy=0.3, inset=0.7)
for x, s in ((-MW / 2 - 0.15, 0.45), (-MW / 2 + 0.35, 0.35), (MW / 2 + 0.1, 0.42)):
    add(f"cr{x}", box(G(MC + x, MF + 0.55, s / 2), (s, D(s), s)), "#b98a55")
noren("mknoren", MC, MF - 0.05, 1.5, 1.6, "#3f9a7a", n=3)
META["market"]["block"] = sorted({(int(MC + x), 9) for x in (-MW / 2 - 0.15, -MW / 2 + 0.35, MW / 2 + 0.1)})

# ---------------------------------------------------------------- the empty lot (stages 1-4) and the Hall of Masters (stage 5+)
LC, LF = 38.0, 8.85
piece("lot", (LC, LF), until=5)
for k in range(37):
    x = LC - 4.5 + k * 0.25
    add(f"fen{k}", tube(G(x, LF, 0), G(x, LF, 0.75), 0.05, 0.05, segs=8), ("#a8b86a", "#97a85c")[k % 2], k % 3 == 0)
for zz in (0.25, 0.6): add(f"fenr{zz}", box(G(LC, LF + 0.04, zz), (9.2, 0.05, 0.06)), "#6b4428")
for k in range(5):   # stacked lumber
    add(f"lum{k}", box(G(LC - 2.5, LF - 1.5, 0.12 + k * 0.2), (2.0 - k * 0.15, D(0.8), 0.18)), ("#c99a62", "#b98a55")[k % 2])
for k in range(3):
    add(f"stn{k}", box(G(LC + 1.5 + k * 0.7, LF - 1.8, 0.2), (0.6, D(0.5), 0.4), bevel=0.05), "#b7bacd")
add("signp", tube(G(LC + 3.0, LF + 0.15, 0), G(LC + 3.0, LF + 0.15, 1.1), 0.05, 0.05), "#6b4428")
add("signb", box(G(LC + 3.0, LF + 0.2, 1.05), (0.9, 0.05, 0.5)), "#e8d3a6")
add("signmark", ellipsoid(G(LC + 3.0, LF + 0.24, 1.05), (0.12, 0.02, 0.12), segs=10, rings=4), "#d9a441", False)

piece("hall", (LC, 9.0), stage=5)
shadow(LC, 9.1, 5.0, 0.35, 0.18)
add("hbase", box(G(LC, 7.0, 0.2), (9.0, D(4.2), 0.4)), "#a9adc4")
add("hstep", box(G(LC, 9.0, 0.1), (3.0, D(0.5), 0.2)), "#cfc8ba", False)
add("hwall", box(G(LC, 6.8, 0.4 + 0.85), (7.4, D(3.2), 1.7)), "#f3ead6")
for x in (-3.5, -2.1, -0.7, 0.7, 2.1, 3.5):
    add(f"hpil{x}", tube(G(LC + x, 8.6, 0.4), G(LC + x, 8.6, 2.15), 0.11, 0.11), "#b8322a")
add("hdoor", box(G(LC, 8.32, 0.4 + 0.65), (1.4, 0.05, 1.3)), "#4a3020")
for x in (-2.8, -1.4, 1.4, 2.8): add(f"hwin{x}", box(G(LC + x, 8.32, 1.2), (0.7, 0.04, 0.6)), "#ffe9a0", False)
add("hbeam", box(G(LC, 8.6, 2.15), (7.8, 0.16, 0.16)), "#2c2a33")
hip_roof("hroof", LC, 8.9, 4.9, 2.2, 8.6, 1.3, "#3d4766", ox=0.6, oy=0.3, inset=1.2, ridge="#ffd36b")
add("hplaque", box(G(LC, 8.75, 1.9), (1.3, 0.06, 0.32)), "#2c2a33")
add("hplaquerim", box(G(LC, 8.72, 1.9), (1.45, 0.04, 0.44)), "#ffd36b", False)

# ---------------------------------------------------------------- the pagoda beyond the back wall (stage 8)
piece("pagoda", (14.3, 3.6), stage=8, sort=3.6)
z = 0.0
for k, (w, h) in enumerate(((2.4, 1.0), (2.0, 0.85), (1.7, 0.75), (1.4, 0.65), (1.1, 0.6))):
    add(f"pw{k}", box(G(14.3, 3.0, z + h / 2), (w * 0.62, D(w * 0.5), h)), "#b8322a" if k == 0 else "#efe3c6")
    hip_roof(f"pr{k}", 14.3, 3.0 + w * 0.32, 3.0 - w * 0.32, z + h - 0.05, w * 0.7, 0.32, "#3a4057", ox=0.35, oy=0.25, inset=0.2, ridge=None)
    z += h + 0.1
add("spire", tube(G(14.3, 3.0, z), G(14.3, 3.0, z + 1.1), 0.06, 0.03), "#d9a441")
for k in range(4): add(f"ring{k}", tube(G(14.3, 3.0, z + 0.2 + k * 0.22), G(14.3, 3.0, z + 0.25 + k * 0.22), 0.14, 0.14), "#d9a441", False)

# ---------------------------------------------------------------- My Dojo (the student's own home dojo, east side)
HC, HF, HW = 38.5, 20.0, 7.0
piece("my-dojo", (HC, HF))
shadow(HC, HF + 0.1, 3.9, 0.35, 0.18)
walls("md", HC, HF, 4.4, HW, 1.6, posts=[-3.42, -1.75, -0.62, 0.62, 1.75, 3.42])
for x in (-2.6, 2.6): shoji(f"mds{x}", HC + x, HF, 0.45, 1.3, 1.05, n=2)
add("mddoor", box(G(HC, HF + 0.02, 0.16 + 0.62), (1.15, 0.06, 1.24)), "#4a3020")
add("mdshoji", box(G(HC - 0.28, HF + 0.05, 0.16 + 0.6), (0.48, 0.04, 1.12)), "#fbf3df")
add("mdglow", box(G(HC + 0.26, HF + 0.04, 0.16 + 0.6), (0.52, 0.03, 1.12)), "#ffe9a0", False)
noren("mdnoren", HC, HF, 1.3, 1.25, "#3f9a7a", n=3)
hip_roof("mdroof", HC, HF + 0.05, HF - 4.4, 1.78, HW, 1.0, "#5f6f92", ox=0.45, oy=0.4, inset=0.9)
for x in (-0.95, 0.95):
    add(f"mdlp{x}", tube(G(HC + x, HF + 0.3, 0), G(HC + x, HF + 0.3, 0.8), 0.04, 0.04), "#6b4428")
    add(f"mdln{x}", ellipsoid(G(HC + x, HF + 0.3, 0.98), (0.16, 0.16, 0.21), segs=12, rings=8), "#fff6c8")
META["my-dojo"]["block"] = cells(35, 41, 15, 19)

# shrubs by the door (stage 1) that become flower planters (stage 2)
for k, c in enumerate((35.8, 41.2)):
    piece(f"shrub-{k}", (c, 20.7), until=2, block=[(c, 20.7)])
    shadow(c, 20.7, 0.55, 0.25)
    add("sh", ellipsoid(G(c, 20.7, 0.35), (0.55, 0.4, 0.4), segs=14, rings=8), "#5f9e55")
    piece(f"flowers-{k}", (c, 20.7), stage=2, block=[(c, 20.7)])
    shadow(c, 20.7, 0.7, 0.3)
    add("box", box(G(c, 20.7, 0.17), (1.3, D(0.55), 0.34), bevel=0.04), "#7a5232")
    add("soil", box(G(c, 20.7, 0.35), (1.15, D(0.45), 0.04)), "#4f8a4a", False)
    for j, fc in enumerate(("#ffd36b", "#f6c3d6", "#6f9fd2", "#fbf3df", "#ffd36b", "#f6c3d6")):
        add(f"fl{j}", ellipsoid(G(c - 0.45 + j * 0.18, 20.7 + (0.1 if j % 2 else -0.1), 0.45), (0.09, 0.09, 0.07), segs=8, rings=4), fc, False)

# ---------------------------------------------------------------- the plaza: statue, sakura in stone planters, benches, gate
SC, SR = 23.0, 19.0
def statue(pid, gold, stage=1, until=None):
    piece(pid, (SC, SR + 1.2), stage=stage, until=until, sort=SR + 1.0, block=cells(22, 23, 18, 19))
    shadow(SC, SR, 1.5, 0.75, 0.2)
    add("pl0", tube(G(SC, SR, 0), G(SC, SR, 0.22), 1.25, 1.25, segs=28, sy=K * 0.85), "#a9adc4")
    add("pl1", tube(G(SC, SR, 0.22), G(SC, SR, 0.85), 0.8, 0.72, segs=24, sy=K * 0.85), "#cfc8ba")
    add("pl2", tube(G(SC, SR, 0.85), G(SC, SR, 0.98), 0.86, 0.86, segs=24, sy=K * 0.85), "#ffd36b" if gold else "#e6dfcf")
    add("star", ellipsoid(G(SC, SR + 0.66, 0.55), (0.17, 0.04, 0.17), segs=5, rings=2, rot=(90, 0, 0)), "#ffd36b")
    BR = "#f2c94c" if gold else "#d9b864"; zf = 0.98; S_ = 1.55
    def P(x, rr, zz): return G(SC + x * S_, SR + rr * S_, zf + zz * S_)
    add("s_legL", tube(P(-0.14, 0, 0.02), P(-0.13, 0, 0.62), 0.09 * S_, 0.1 * S_), BR)
    add("s_legR", tube(P(0.14, 0, 0.02), P(0.13, 0, 0.62), 0.09 * S_, 0.1 * S_), BR)
    add("s_feet", box(P(0, -0.04, 0.03), (0.6 * S_, 0.22 * S_ * K, 0.06 * S_)), BR)
    add("s_body", ellipsoid(P(0, 0, 0.92), (0.27 * S_, 0.18 * S_ * K, 0.36 * S_), segs=16, rings=10), BR)
    add("s_belt", tube(P(0, 0, 0.66), P(0, 0, 0.72), 0.25 * S_, 0.25 * S_, segs=16, sy=0.7 * K), "#2c2a33" if gold else "#f2e6b8")
    add("s_head", ellipsoid(P(0, 0, 1.42), (0.17 * S_, 0.15 * S_ * K, 0.18 * S_), segs=16, rings=10), BR)
    for sx in (-1, 1):
        add(f"s_arm{sx}", tube(P(sx * 0.27, 0, 1.12), P(sx * 0.2, -0.12, 0.72), 0.06 * S_, 0.06 * S_), BR)
        add(f"s_fist{sx}", ellipsoid(P(sx * 0.17, -0.16, 0.7), (0.07 * S_, 0.07 * S_, 0.07 * S_)), BR)
    add("s_shine", ellipsoid(P(-0.12, -0.14, 1.05), (0.05 * S_, 0.02, 0.12 * S_)), "#fff1c4", False)
    if gold:
        add_a("halo", ellipsoid(P(0, 0.2, 1.0), (0.62 * S_, 0.05, 0.8 * S_), segs=24, rings=10), "#fff6c8", 0.18)
        for k in range(8):
            a = 2 * math.pi * k / 8
            add(f"spk{k}", ellipsoid(P(math.cos(a) * 0.75, 0.3, 1.0 + math.sin(a) * 0.85), (0.06, 0.02, 0.06), segs=6, rings=4), "#fff6c8", False)
statue("statue", False, until=10)
statue("statue-gold", True, stage=10)

for k, (c, r) in enumerate(((17.5, 16.5), (28.5, 16.5), (17.5, 22.5), (28.5, 22.5))):
    sakura(f"plaza-sakura-{k}", c, r, s=1.25, planter=True)
for k, (c, r) in enumerate(((17.5, 24.4), (28.5, 24.4))):
    bench(f"plaza-bench-{k}", c, r)

def torii(pid, red, stage=1, until=None):
    TC, TR = 23.0, 25.5
    piece(pid, (TC, TR), stage=stage, until=until, block=[(20, 25), (25, 25)])
    post = "#c8553d" if red else "#9a6a40"; top = "#2c2a33" if red else "#6b4428"
    for x in (-2.45, 2.45):
        shadow(TC + x, TR, 0.35, 0.18)
        add(f"post{x}", tube(G(TC + x, TR, 0), G(TC + x * 0.96, TR, 2.6), 0.16, 0.13, segs=14), post)
        add(f"foot{x}", tube(G(TC + x, TR, 0), G(TC + x, TR, 0.3), 0.21, 0.21, segs=14), top)
    add("nuki", box(G(TC, TR, 2.05), (5.6, 0.18, 0.18)), post)
    add("shimaki", box(G(TC, TR, 2.62), (6.0, 0.22, 0.2)), post)
    for k in range(9):   # the top beam curves up at both ends
        t = (k - 4) / 4
        add(f"kasa{k}", box(G(TC + t * 3.3, TR, 2.84 + 0.18 * t * t), (0.78, 0.3, 0.16), rot=(0, -math.degrees(math.atan(0.36 * t / 3.3 * 4)) * 0.6, 0)), top)
    add("gaku", box(G(TC, TR + 0.1, 2.33), (0.42, 0.06, 0.5)), top)
    add("gakurim", box(G(TC, TR + 0.08, 2.33), (0.52, 0.04, 0.6)), "#ffd36b" if red else "#c99a62", False)
torii("torii", False, until=4)
torii("torii-red", True, stage=4)

# stone lanterns: the garden path and the street gaps; unlit until stage 7, then lit
for k, (c, r) in enumerate(((20.5, 27.6), (25.5, 27.6), (14.3, 9.5), (31.3, 9.5), (44.2, 9.5))):
    stone_lantern(f"toro-{k}", c, r, False, until=7)
    stone_lantern(f"toro-lit-{k}", c, r, True, stage=7)
stone_lantern("pond-lantern", 34.6, 25.4, True, stage=7, s=0.85)

# paper lanterns in front of the buildings (stage 2)
for k, c in enumerate((3.0, 12.2, 17.6, 28.4, 33.4, 42.6)):
    lantern_pole(f"lantern-{k}", c, 9.4)

# the practice yard: makiwara (1, then 3 at stage 3), banners and a rack
makiwara("makiwara-0", 7.5, 17.0)
makiwara("makiwara-1", 5.0, 17.0, stage=3)
makiwara("makiwara-2", 10.0, 17.0, stage=3)
nobori("yard-banner-0", 3.0, 16.6, "#3a6ea5")
nobori("yard-banner-1", 12.0, 16.6, "#3f9a7a")
piece("rack", (1.9, 20.0), block=[(1, 19), (2, 19), (1, 20), (2, 20)])
shadow(1.9, 20.0, 0.95, 0.25)
add("base", box(G(1.9, 20.0, 0.06), (1.7, D(0.35), 0.12)), "#7a5232")
for x in (-0.75, 0.75): add(f"post{x}", box(G(1.9 + x, 20.0, 0.65), (0.12, D(0.12), 1.2)), "#6b4428")
add("bar", box(G(1.9, 19.95, 1.15), (1.65, D(0.08), 0.08)), "#8a5e38")
for k in range(5): add(f"bo{k}", tube(G(1.4 + k * 0.25, 19.9, 0.12), G(1.4 + k * 0.25, 19.9, 1.5), 0.035, 0.035), ("#c99a62", "#b98a55")[k % 2])
# a wooden dummy (stage 9) on the west lawn
piece("mook-jong", (5.5, 25.6), stage=9, block=[(5, 25)])
shadow(5.5, 25.6, 0.5, 0.22)
for x in (-0.55, 0.55): add(f"frame{x}", tube(G(5.5 + x, 25.6, 0), G(5.5 + x, 25.6, 1.4), 0.05, 0.05), "#6b4428")
add("rail", box(G(5.5, 25.6, 1.15), (1.2, 0.07, 0.07)), "#6b4428")
add("body", tube(G(5.5, 25.5, 0.2), G(5.5, 25.5, 1.55), 0.17, 0.17, segs=14), "#a8743f")
for k, (zz, ang) in enumerate(((1.25, 20), (1.25, -20), (0.85, 0))):
    add(f"arm{k}", box(G(5.5 + math.sin(math.radians(ang)) * 0.2, 25.75, zz), (0.07, D(0.45), 0.07), rot=(0, 0, ang)), "#8a5e38")
add("leg", box(G(5.5, 25.75, 0.4), (0.08, D(0.5), 0.08), rot=(25, 0, 0)), "#8a5e38")

# plaza banners (stage 4)
for k, (c, r) in enumerate(((15.4, 18.0), (15.4, 21.0), (30.6, 18.0), (30.6, 21.0))):
    nobori(f"plaza-banner-{k}", c, r, ("#3a6ea5", "#3f9a7a", "#7b5cc4", "#d9a441")[k], stage=4)

# trees: green at first; most become sakura at stage 6
GREEN = [(1.6, 15.6, 1.1), (13.6, 23.6, 1.0), (31.6, 27.4, 1.1), (14.4, 27.6, 1.0), (44.0, 23.4, 1.0), (32.6, 15.4, 0.9)]
for k, (c, r, s) in enumerate(GREEN):
    tree(f"tree-{k}", c, r, s, until=6)
    sakura(f"tree-sakura-{k}", c, r, s * 1.2, stage=6)
pine("pine-0", 2.4, 27.2, 1.15)
pine("pine-1", 44.0, 28.2, 1.0)
pine("pine-2", 11.6, 28.0, 0.9)
bamboo("bamboo-sw", 8.6, 28.4, 14, block=cells(7, 10, 27, 28))
bamboo("bamboo-md", 43.7, 19.6, 8, block=[(43, 18), (43, 19), (44, 18), (44, 19)])

# the garden's taiko drum pavilion at the end of the path (stage 8)
piece("taiko", (23.0, 28.6), stage=8, block=cells(22, 24, 28, 28))
shadow(23.0, 28.6, 1.6, 0.4)
add("deck", box(G(23.0, 28.3, 0.1), (2.8, D(0.9), 0.2)), "#c99a62")
for x in (-1.25, 1.25): add(f"post{x}", box(G(23 + x, 28.55, 1.1), (0.14, 0.14, 2.0)), "#b8322a")
hip_roof("troof", 23.0, 28.75, 27.9, 2.05, 2.7, 0.55, "#2f3447", ox=0.35, oy=0.2, inset=0.4, ridge="#d9a441")
add("stand", box(G(23.0, 28.4, 0.45), (0.9, D(0.4), 0.5)), "#6b4428")
add("drum", tube(G(23.0, 28.45, 0.7), G(23.0, 28.45, 1.5), 0.48, 0.48, segs=24, sy=0.75), "#a8743f")
add("skin", tube(G(23.0, 28.62, 0.7), G(23.0, 28.62, 1.5), 0.42, 0.42, segs=24, sy=0.05), "#f3e7cd", False)
add("tomoe", ellipsoid(G(23.0, 28.66, 1.1), (0.16, 0.02, 0.16), segs=12, rings=4), "#b8322a", False)

# koi and lily pads (stage 3, flat on the water)
piece("koi", (PC, PR), stage=3, flat=True)
for k, (x, rr) in enumerate(((-2.6, -0.6), (-1.0, 0.7), (1.4, -0.9), (2.7, 0.4), (0.2, 1.1))):
    add(f"lily{k}", ellipsoid(G(PC + x, PR + rr, 0.035), (0.32, D(0.24), 0.02), segs=14, rings=3), "#5fa65a", False)
    add(f"lilyf{k}", ellipsoid(G(PC + x + 0.06, PR + rr, 0.07), (0.09, D(0.09), 0.05), segs=8, rings=4), ("#fbf3df", "#f6c3d6")[k % 2], False)
for k, (x, rr, col) in enumerate(((-1.8, 0.2, "#f59a3c"), (-0.6, -0.5, "#fbf3df"), (0.9, 0.3, "#f59a3c"), (2.0, -0.2, "#ffd36b"), (-0.2, 0.8, "#f59a3c"))):
    add(f"koi{k}", ellipsoid(G(PC + x, PR + rr, 0.035), (0.22, D(0.08), 0.015), segs=10, rings=3), col, False)
    add(f"koit{k}", ellipsoid(G(PC + x - 0.24, PR + rr, 0.035), (0.07, D(0.06), 0.01), segs=6, rings=3), col, False)

# fallen petals (stage 6, flat) on the plaza and the garden
piece("petals", (23.0, 20.0), stage=6, flat=True)
for k in range(160):
    c, r = random.choice(((random.uniform(15.5, 30.5), random.uniform(14.3, 25)), (random.uniform(20.3, 25.7), random.uniform(25.5, 29))))
    add(f"p{k}", ellipsoid(G(c, r, 0.04), (0.07, D(0.045), 0.01), segs=6, rings=3), random.choice(("#f6c3d6", "#fbdbe6", "#f2b0c8")), False)

# the plaza's gold inlay ring (stage 10, flat)
piece("gold-ring", (23.0, 19.0), stage=10, flat=True)
for k in range(48):
    a = 2 * math.pi * k / 48
    add(f"g{k}", box(G(23 + 2.85 * math.cos(a), 19.0 + 2.85 * math.sin(a), 0.045), (0.36, D(0.14), 0.02), rot=(0, 0, -math.degrees(a) + 90)), "#ffd36b", False)

# the south wall, in three pieces so the hero walks behind it
for k in range(3):
    c0 = k * COLS / 3; c1 = (k + 1) * COLS / 3
    piece(f"swall-{k}", ((c0 + c1) / 2, 29.6), sort=29.2)
    add("wall", box(G((c0 + c1) / 2, 29.65, 0.4), (c1 - c0 + 0.02, D(0.3), 0.8)), "#efe3c6", True, 1.2)
    add("cap", box(G((c0 + c1) / 2, 29.65, 0.85), (c1 - c0 + 0.1, D(0.5), 0.12)), "#4a4f66", True, 1.2)

# ===================================================================================== the walk grid
base = [["#" if (r <= 8 or r >= 29 or c == 0 or c == COLS - 1 or (c, r) in GROUND_BLOCK) else "." for c in range(COLS)] for r in range(ROWS)]
meta = {
    "cols": COLS, "rows": ROWS, "ppt": A.ppt,
    "tiles": ["".join(row) for row in base],
    "pieces": [META[k] for k in META],
}
json.dump(meta, open(os.path.join(A.out, "town_meta.json"), "w"), indent=1)
if A.mode == "meta":
    sys.exit(0)

# ===================================================================================== camera + render (the house settings)
r_ = sc.render; r_.engine = "CYCLES"; sc.cycles.samples = A.samples; sc.cycles.use_denoising = False
sc.cycles.device = "CPU"
if A.gpu:
    try:
        pr = bpy.context.preferences.addons["cycles"].preferences
        for t in ("OPTIX", "CUDA"):
            try:
                pr.compute_device_type = t; pr.get_devices()
                if any(d.type == t for d in pr.devices):
                    for d in pr.devices: d.use = d.type == t
                    sc.cycles.device = "GPU"; break
            except Exception: pass
    except Exception as e: print("GPU setup failed", e)
print("DEVICE", sc.cycles.device)
r_.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
W, H = COLS * A.ppt, ROWS * A.ppt
r_.resolution_x, r_.resolution_y = W, H; r_.resolution_percentage = 100
r_.image_settings.file_format = "PNG"; r_.image_settings.color_mode = "RGBA"
cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = COLS; cd.clip_end = 300
cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
cam.rotation_euler = (math.radians(90 - EL), 0, 0)
d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
cam.location = Vector((COLS / 2, -(ROWS / 2) * K, 0)) - d * 60
bpy.context.view_layer.update()

from bpy_extras.object_utils import world_to_camera_view
def show_only(grp):
    for o in bpy.data.objects:
        if o.type == "MESH": o.hide_render = o.get("grp") != grp

if A.mode == "ground":
    show_only("ground"); r_.use_border = False
    r_.filepath = os.path.join(A.out, "ground.png"); bpy.ops.render.render(write_still=True)
elif A.mode == "props":
    only = [s for s in A.only.split(",") if s]
    boxes = {}
    for pid in META:
        if only and pid not in only: continue
        obs = [o for o in bpy.data.objects if o.type == "MESH" and o.get("grp") == pid]
        xs, ys = [], []
        for o in obs:
            for v in o.data.vertices:
                p = world_to_camera_view(sc, cam, o.matrix_world @ v.co); xs.append(p.x); ys.append(p.y)
        pad = 8 / W
        x0, x1 = max(0, min(xs) - pad), min(1, max(xs) + pad); y0, y1 = max(0, min(ys) - 8 / H), min(1, max(ys) + 8 / H)
        show_only(pid)
        r_.use_border = True; r_.use_crop_to_border = False
        r_.border_min_x, r_.border_max_x, r_.border_min_y, r_.border_max_y = x0, x1, y0, y1
        r_.filepath = os.path.join(A.out, f"piece_{pid}.png"); bpy.ops.render.render(write_still=True)
        boxes[pid] = [x0, x1, y0, y1]
    json.dump(boxes, open(os.path.join(A.out, "boxes.json"), "w"))
elif A.mode == "blend":
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "town.blend"))
