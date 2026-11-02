"""Dojo Ascent - A-TOWN-GROWTH v5: one FULL town picture per belt (the approved town square, changed per belt).
Town growth is CAPPED at Blue: White -> Yellow -> Orange -> Green -> Blue. Red and above reuse the Blue picture.
Runs the town-square build (same scene, camera and toon look as the approved concept: PR #301 + the #393 dojo slot,
dojo slot left empty because the dojo sprite is pasted on top later), changes it for this belt and renders one pass:
    blender -b -P incoming-art/town-growth/source/build_town_stage.py -- --stage white|green|blue|base --pass <pass> --out <png>
  day / night  the town in house colours (night = the dusk picture's town: no sourceless water sparkles)
  lights       a mask: this belt's lit windows and lanterns white, the rest black (the dusk glow source)
  props        a mask: ONLY the objects this belt ADDS white (the exempt beds / river items black) - for the lanes check
  shade        the whole town as plain white clay lit by ONE sun + a soft sky: cast shadows and ambient occlusion (soft drop shadows)
  height       world height of every surface, 16 bit: used for the light-facing rim line and the contact shading
  hero         a mask of the few hero props that get a little bloom (statue + star, stone lanterns)
  trees        Blue only: a mask of every part of every sakura (crown, trunk, tree ring): lane check, ground shadows, rim light
  bloom        Blue only: a mask of the blossom crowns only (the dusk rose grade)
make_stages.py then adds sky, far hills, light and shadow, colour grade, effects and the dojo sprite.
Stages: white = a little run down, no statue (empty plinth); green = clearly upgraded, statue unveiled, festive;
blue = fully maxed hero town; base = no changes at all (proves the pipeline reproduces the approved picture)."""
import bpy, sys, os, math, argparse, random, re, bmesh
from mathutils import Vector, Euler
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import blue_extras as BX
BASE = os.path.join(HERE, "..", "..", "town-square-concept", "source", "build_town_square.py")
ap = argparse.ArgumentParser(); ap.add_argument("--stage", required=True); ap.add_argument("--pass", dest="ps", required=True)
ap.add_argument("--out", required=True); ap.add_argument("--samples", type=int, default=24)
AA = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
ST, PASS = AA.stage, AA.ps
NIGHT = PASS in ("night", "lights")

src = open(BASE).read(); src = src[:src.index("# ---------------------------------------------------------------- camera + render")]
sys.argv = [sys.argv[0], "--", "--out", "x.png", "--no-dojo0", "--clear-dojo-trees", "--samples", str(AA.samples)] + (["--night"] if NIGHT else [])
NS = {"__file__": os.path.abspath(BASE), "__name__": "town_base"}
exec(compile(src, BASE, "exec"), NS)
bpy.context.view_layer.update()
sc, coll, K, EL, COLS, ROWS, G, D = (NS[k] for k in ("sc", "coll", "K", "EL", "COLS", "ROWS", "G", "D"))
base_add, mat = NS["add"], NS["mat"]
box, tube, ellipsoid = NS["box"], NS["tube"], NS["ellipsoid"]
BASE_OBJECTS = set(bpy.data.objects)
def add(n, bm, col, outline=True): return base_add(n, bm, col, outline)
def rm(name):
    for n in (name, name + "_outline"):
        o = bpy.data.objects.get(n)
        if o: bpy.data.objects.remove(o, do_unlink=True)
def rm_prefix(p):
    for o in [o for o in bpy.data.objects if o.name.startswith(p)]: bpy.data.objects.remove(o, do_unlink=True)
def paint(name, hexc):
    o = bpy.data.objects.get(name)
    if o: o.data.materials[0] = mat(hexc)
def tuft(n, c, r, z=0.0, cols=("#8fa65a", "#a7b266", "#7f9a55")):
    for k in range(3):
        dx = (k - 1) * 0.07
        add(f"{n}{k}", tube(G(c + dx * 0.4, r, z), G(c + dx * 1.6, r + 0.01, z + 0.17 + 0.03 * (k % 2)), 0.018, 0.006, segs=5), cols[k], False)
def tri(name, a, b, c, col, thick=0.025, outline=True):
    """a thin triangular flag / pennant (world-space corners)."""
    a, b, c = Vector(a), Vector(b), Vector(c); n = (b - a).cross(c - a).normalized() * thick / 2
    bm = bmesh.new(); vs = [bm.verts.new(p - n) for p in (a, b, c)] + [bm.verts.new(p + n) for p in (a, b, c)]
    bm.faces.new(vs[:3]); bm.faces.new(vs[3:][::-1])
    for i in range(3): j = (i + 1) % 3; bm.faces.new([vs[i], vs[j], vs[3 + j], vs[3 + i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:]); return add(name, bm, col, outline)

TREES = [(6.6, 6.35), (17.5, 6.0), (3.4, 10.4), (19.9, 10.4), (0.8, 7.4), (22.5, 7.4), (21.8, 5.6)]      # the round trees of the base scene (Green keeps them; Blue replaces ALL of them)
FLOWER_PAL = ("#fbf3df", "#ffd36b", "#f6a8c4", "#b78ae0", "#6f9fd2")      # cream, gold, pink, violet, blue - never red
SUN_UP = {"white": 0.95, "green": 0.72, "blue": 0.46, "base": 0.72}[ST]      # sun height: Blue is golden hour (longer shadows)

# ---- statue: it arrives at Green. In White the plinth stands empty (no star plate either).
if ST == "white":
    for n in ("s_legL", "s_legR", "s_feet", "s_body", "s_belt", "s_head", "s_arm-1", "s_arm1", "s_fist-1", "s_fist1", "s_shine", "star"): rm(n)

# ---- water sparkles (day only): fewer when run down
sp = sorted((o.name for o in bpy.data.objects if o.name.startswith("spk")), key=lambda s: int(s[3:]))
keep = {"white": 0, "green": 10, "blue": 14, "base": 14}[ST]
for n in sp[keep:]: rm(n)

SHOP_C, SHOP_R = 9.3, 4.65
def chimney_and_basket():
    add("ob_chim", box(G(10.45, 3.6, 2.62), (0.5, 0.5, 1.05), bevel=0.02), "#c9bfae")
    for k, zz in enumerate((2.3, 2.62, 2.94)): add(f"ob_chb{k}", box(G(10.45, 3.6, zz), (0.54, 0.54, 0.07)), "#a89b86", False)
    add("ob_chcap", box(G(10.45, 3.6, 3.19), (0.62, 0.62, 0.1)), "#8b8070")
    bcx, bry = SHOP_C + 1.5, 4.46
    add("ob_bk", tube(G(bcx, bry, 0.69), G(bcx, bry, 0.9), 0.24, 0.28, segs=14), "#c19159")
    add("ob_bkrim", tube(G(bcx, bry, 0.9), G(bcx, bry, 0.94), 0.3, 0.3, segs=14), "#a8743f", False)
    for k, dx in enumerate((-0.12, 0.0, 0.12)):
        add(f"ob_bag{k}", tube(G(bcx + dx - 0.05, bry, 0.92), G(bcx + dx + 0.1 + 0.05 * k, bry - 0.05, 1.28), 0.055, 0.055, segs=8), "#e0aa5c")
        add(f"ob_bagc{k}", ellipsoid(G(bcx + dx + 0.1 + 0.05 * k, bry - 0.05, 1.29), (0.06, 0.06, 0.05), segs=8, rings=4), "#e0aa5c", False)
    for k, dx in enumerate((-0.14, 0.14)): add(f"ob_loaf{k}", ellipsoid(G(bcx + dx, bry + 0.06, 0.98), (0.12, 0.09, 0.08), segs=10, rings=6), "#d9a35a")

# ---- the upgraded-town pieces (Green and Blue share them; Blue adds more on top) -------------------------------------
def retint(stage):
    """fresh paint and richer colours: paving, grass, hedges, water, roofs. Same objects, new colours (adds nothing)."""
    pal = {"green": ["#e6d5b0", "#dfcba4", "#ebdcbc", "#d9c59c", "#e3d1ae", "#e8d9b8", "#dccaa8"],
           "blue": ["#ecdcb6", "#e4d1a8", "#f1e4c4", "#dec99d", "#eed9bd", "#e9d8b0", "#f0e0bd"]}[stage]
    for o in list(bpy.data.objects):
        m = re.match(r"st(-?\d+)_(\d+)$", o.name)
        if m:
            i, j = int(m.group(1)), int(m.group(2)); paint(o.name, pal[(i * 3 + j * 5 + (i * j) % 3) % len(pal)])
    paint("plaza_base", "#a8977a")
    for k in range(28): paint(f"ring{k}", "#f7f0dc" if stage == "green" else "#f3d27a")
    paint("spath", "#f7f0dc" if stage == "green" else "#f3d27a")
    paint("grass_back", "#78c45e" if stage == "green" else "#72c862")
    for k in range(16): paint(f"hedge{k}", "#54a456" if stage == "green" else "#47a05c")
    paint("water", "#74cdf0" if stage == "green" else "#6ad2f2"); paint("riverbed", "#4f9fcb" if stage == "green" else "#4a9ccf")
    paint("shoproof", "#4f9a78" if stage == "green" else "#3c9482")
    paint("plcwall", "#efe3c8" if stage == "green" else "#f5e8c8"); paint("plcroof", "#8fa8c4" if stage == "green" else "#6f98c0")
    paint("plcbase", "#b8bcd2")
    for c in (9.4, 13.9): paint(f"soil{c}", "#4a9a48")

def lush_beds(n_extra, seed):
    rnd = random.Random(seed)
    for c in (9.4, 13.9):
        for k in range(5):      # leafy mounds behind the blooms
            add(f"ob_bedleaf{c}{k}", ellipsoid(G(c - 0.5 + k * 0.25, 6.0 + (0.12 if k % 2 else -0.1), 0.3), (0.2, D(0.11), 0.12), segs=10, rings=6), ("#4f9f4f", "#62b058")[k % 2], False)
        for k in range(n_extra):
            x = c - 0.55 + 1.1 * (k + rnd.random() * 0.6) / n_extra; rr = 6.0 + rnd.uniform(-0.15, 0.15); zz = 0.4 + rnd.uniform(0, 0.1)
            add(f"ob_bedfl{c}{k}", ellipsoid(G(x, rr, zz), (0.075, D(0.06), 0.065), segs=8, rings=4), FLOWER_PAL[(k + int(c * 3)) % 5], False)

def window_boxes():
    for x in (-1.3, 1.3):
        cx = 19.6 + x
        add(f"ob_pbox{x}", box(G(cx, 4.5, 0.16 + 0.5), (0.74, 0.14, 0.14)), "#a8743f")
        for k in range(6): add(f"ob_pbfl{x}{k}", ellipsoid(G(cx - 0.28 + k * 0.112, 4.5, 0.16 + 0.62), (0.06, 0.06, 0.07), segs=8, rings=4), FLOWER_PAL[(k + int(x * 3)) % 5], False)

def hedge_blossoms(per, pal, seed):
    rnd = random.Random(seed)
    for k in range(16):
        if k == 10: continue
        hx = k * 1.6 - 0.4
        for q in range(per):
            dx = rnd.uniform(-0.7, 0.7); dz = rnd.uniform(-0.05, 0.22)
            dy = 0.35 * math.sqrt(max(0.02, 1 - (dx / 0.95) ** 2 - (dz / 0.42) ** 2)) * 1.0
            add(f"ob_hb{k}_{q}", ellipsoid(G(hx + dx, 3.35 + dy - 0.01, 0.25 + dz), (0.055, 0.04, 0.05), segs=6, rings=4), pal[(k + q) % len(pal)], False)

def bridge_garland(pal):
    BLn = 1.5 + 1.1
    for side in (7.55, 8.45):
        for t in range(0, 21):
            u = t / 20; x = 14.85 - 0.55 + BLn * u; z = 0.52 + 0.42 * math.sin(u * math.pi) + 0.045
            add(f"ob_rvgl{side}{t}", ellipsoid(G(x, side, z), (0.05, 0.04, 0.045), segs=6, rings=4), pal[t % len(pal)], False)

def toro(idx, c, r):
    """a little stone garden lantern: a REAL light source (the lamp box is lit at dusk)."""
    add(f"ob_tr{idx}foot", tube(G(c, r, 0), G(c, r, 0.1), 0.2, 0.17, segs=8), "#b9b3a6")
    add(f"ob_tr{idx}post", tube(G(c, r, 0.1), G(c, r, 0.46), 0.075, 0.075, segs=8), "#cfc8ba")
    add(f"ob_tr{idx}plate", box(G(c, r, 0.5), (0.36, D(0.36), 0.06)), "#b9b3a6")
    add(f"ob_ln_toro{idx}", box(G(c, r, 0.66), (0.24, D(0.24), 0.26)), "#ffe9a0", False)
    add(f"ob_tr{idx}roof", tube(G(c, r, 0.79), G(c, r, 0.97), 0.3, 0.04, segs=4), "#8f897d")
    add(f"ob_tr{idx}top", ellipsoid(G(c, r, 1.0), (0.06, 0.06, 0.06), segs=8, rings=4), "#cfc8ba", False)

def bunting(cols, n=14):
    """one string of small pennants from the shop's right roof edge across the river to the placeholder's left roof edge."""
    a = Vector(G(11.6, 4.52, 1.74)); b = Vector(G(17.2, 4.52, 1.86)); sag = 0.55
    def pt(u): p = a.lerp(b, u); p.z -= sag * 4 * u * (1 - u); return p
    for k in range(26): add(f"ob_bt{k}", tube(pt(k / 26), pt((k + 1) / 26), 0.012, 0.012, segs=5), "#6b4428", False)
    for k in range(n):
        u0, u1 = (k + 0.25) / n, (k + 0.75) / n; p0, p1 = pt(u0), pt(u1); mid = (p0 + p1) / 2
        tri(f"ob_bp{k}", p0, p1, mid - Vector((0, 0, 0.36)), cols[k % len(cols)])

def roof_flag(name, x, row, z0, h, c1, c2):
    add(f"ob_{name}pole", tube(G(x, row, z0), G(x, row, z0 + h), 0.03, 0.025, segs=6), "#6b4428")
    add(f"ob_{name}ball", ellipsoid(G(x, row, z0 + h + 0.03), (0.05, 0.05, 0.05), segs=8, rings=4), "#ffd36b", False)
    top, bot = z0 + h - 0.05, z0 + h - 0.5
    tri(f"ob_{name}a", G(x + 0.02, row, top), G(x + 0.02, row, bot), G(x + 0.78, row, (top + bot) / 2 + 0.06), c1)
    tri(f"ob_{name}b", G(x + 0.02, row, (top + bot) / 2 + 0.17), G(x + 0.02, row, (top + bot) / 2 - 0.09), G(x + 0.42, row, (top + bot) / 2 + 0.04), c2, 0.03, False)

def banner_pole(idx, x, row, col):
    add(f"ob_bn{idx}pole", tube(G(x, row, 0), G(x, row, 2.6), 0.045, 0.04, segs=8), "#6b4428")
    add(f"ob_bn{idx}ball", ellipsoid(G(x, row, 2.66), (0.07, 0.07, 0.07), segs=8, rings=4), "#ffd36b", False)
    add(f"ob_bn{idx}bar", tube(G(x - 0.02, row, 2.42), G(x + 0.56, row, 2.42), 0.03, 0.03, segs=6), "#6b4428", False)
    add(f"ob_bn{idx}cloth", box(G(x + 0.28, row + 0.02, 1.8), (0.48, 0.03, 1.26)), col)
    add(f"ob_bn{idx}tip", box(G(x + 0.28, row + 0.02, 1.13), (0.48, 0.03, 0.05)), "#ffd36b", False)
    add(f"ob_bn{idx}emb", ellipsoid(G(x + 0.28, row + 0.045, 1.95), (0.15, 0.02, 0.15), segs=14, rings=6), "#ffd36b", False)
    add(f"ob_bn{idx}emc", ellipsoid(G(x + 0.28, row + 0.05, 1.95), (0.07, 0.02, 0.07), segs=10, rings=4), "#fbf3df", False)

# ---- v5 Blue: real sakura (same toon kit as every other tree), each in a stone tree ring, all of them OUT of the walking lane ------------
TREE_OBJS = []
def sakura(c, r, s, lean, seed):
    """A sakura tree built like the town's other trees: ONE toon material ramp (mat()), the same outline weight/colour (add(..., outline=True)),
    a thick warm-brown trunk (the same brown as the round trees' trunks), a few spreading branches and cloud-like blossom clumps made of a few big pink lumps
    (outlined, one body colour - the toon ramp does the shading) with lighter highlight caps (no outline, like the round trees' 'leaf2').
    Stands in a low round stone tree ring (a planter with dark soil)."""
    rnd = random.Random(seed)
    P = lambda dx, dr, z: G(c + dx * s, r + dr * s, z * s); tag = f"ob_sk{c}_{r}_"; L = lean
    TR, BR = "#7a5232", "#6b4428"          # TR = the round trees' trunk brown (build_town_square: tree()); BR = the same family, a touch deeper, for the branches
    # --- the stone tree ring: a low round curb with dark soil inside, a few pebbles on the curb
    add(tag + "ring", tube(G(c, r, 0), G(c, r, 0.17), 0.54 * s, 0.52 * s, segs=20), "#c4b9a6")
    add(tag + "rrim", tube(G(c, r, 0.17), G(c, r, 0.19), 0.54 * s, 0.54 * s, segs=20), "#dcd2c0", False)
    add(tag + "soil", tube(G(c, r, 0.17), G(c, r, 0.2), 0.42 * s, 0.42 * s, segs=20), "#6a4a34", False)
    for k in range(5):
        a = k * 2 * math.pi / 5 + seed; add(tag + f"pb{k}", ellipsoid(G(c + math.cos(a) * 0.62 * s, r + math.sin(a) * 0.62 * s / K * 0.9, 0.04), (0.07 * s, 0.06 * s, 0.045 * s), segs=8, rings=4), ("#b3a995", "#cfc5b2")[k % 2], False)
    z0 = 0.17
    pts = [(0, 0, z0), (0.11 * L, 0.0, 0.34 + z0), (-0.05 * L, 0.03, 0.66 + z0), (0.14 * L, -0.02, 0.96 + z0)]; rad = [0.25, 0.19, 0.145, 0.105]
    add(tag + "flare", ellipsoid(P(0, 0, z0 + 0.03), (0.30 * s, 0.24 * s, 0.11 * s), segs=10, rings=4), TR, False)
    for i in range(3): add(tag + f"t{i}", tube(P(*pts[i]), P(*pts[i + 1]), rad[i] * s, rad[i + 1] * s, segs=10), TR)
    jit = lambda: rnd.uniform(-0.05, 0.05)
    top = pts[3]
    # (start, bend, end) per branch, in tile units relative to the trunk foot; x*L so the crown spreads toward the town AND away from it
    BRANCHES = [(top, (0.52 * L, -0.06, 1.12 + z0), (0.98 * L + jit(), 0.04, 1.42 + z0), (0.095, 0.060, 0.030)),
                (top, (-0.30 * L, 0.05, 1.22 + z0), (-0.88 * L + jit(), -0.05, 1.30 + z0), (0.095, 0.060, 0.030)),
                (top, (0.06 * L, 0.0, 1.38 + z0), (0.30 * L + jit(), 0.02, 1.76 + z0), (0.085, 0.052, 0.028)),
                (pts[2], (-0.52 * L, 0.10, 0.80 + z0), (-1.02 * L + jit(), 0.12, 1.04 + z0), (0.080, 0.050, 0.026)),
                (pts[2], (0.44 * L, 0.08, 0.84 + z0), (0.86 * L + jit(), 0.10, 1.00 + z0), (0.075, 0.046, 0.024))]
    for i, (a, b, e, (r0, r1, r2)) in enumerate(BRANCHES):
        add(tag + f"b{i}a", tube(P(*a), P(*b), r0 * s, r1 * s, segs=8), BR); add(tag + f"b{i}b", tube(P(*b), P(*e), r1 * s, r2 * s, segs=8), BR, False)
    BODY, LIGHT, TOP = "#f4a9c6", "#fac6da", "#ffe3ee"
    def cloud(name, dx, dr, z, w):
        """one blossom clump: four big overlapping body lumps (one colour, outlined like the round trees' leaves) + two lighter highlight caps (no outline)"""
        LUMPS = ((-0.46, 0.00, -0.06, 0.58), (0.12, 0.06, -0.10, 0.66), (0.56, 0.00, -0.02, 0.52), (0.04, -0.04, 0.26, 0.56))
        for k, (ox, oy, oz, f) in enumerate(LUMPS):
            add(f"{name}_l{k}", ellipsoid(P(dx + ox * w, dr + oy * w, z + oz * w), (w * f * 1.08, w * f * 0.85, w * f * 0.74), segs=14, rings=8), BODY)
        add(f"{name}_h0", ellipsoid(P(dx - 0.22 * w, dr - 0.12 * w, z + 0.40 * w), (w * 0.34, w * 0.24, w * 0.22), segs=10, rings=6), LIGHT, False)
        add(f"{name}_h1", ellipsoid(P(dx + 0.40 * w, dr - 0.10 * w, z + 0.34 * w), (w * 0.22, w * 0.16, w * 0.14), segs=8, rings=5), TOP, False)
    CLOUDS = [(0.98 * L, 0.05, 1.44 + z0, 0.46), (-0.88 * L, -0.04, 1.32 + z0, 0.44), (0.30 * L, 0.02, 1.74 + z0, 0.42), (-0.12 * L, 0.16, 1.50 + z0, 0.50),
              (0.52 * L, -0.12, 1.46 + z0, 0.38), (-1.02 * L, 0.12, 1.08 + z0, 0.36), (0.86 * L, 0.10, 1.04 + z0, 0.34)]
    for k, (dx, dr, z, w) in enumerate(CLOUDS):
        cloud(tag + f"c{k}", dx + jit(), dr, z, w * rnd.uniform(0.94, 1.06))

def fire_bowl():
    """a small stone fire bowl (a ring of stones, a short pedestal, a wide bowl, two logs, glowing coals and three flames): the REAL source of the warm light"""
    c, r = BX.FIRE
    for k in range(6):
        a = k * math.pi / 3 + 0.3; add(f"ob_fbst{k}", ellipsoid(G(c + math.cos(a) * 0.42, r + math.sin(a) * 0.42 / K * 0.9, 0.05), (0.09, 0.08, 0.06), segs=8, rings=4), ("#b9b3a6", "#a39c8f")[k % 2], False)
    add("ob_fbfoot", tube(G(c, r, 0), G(c, r, 0.2), 0.20, 0.13, segs=10), "#a39c8f")
    add("ob_fbbowl", tube(G(c, r, 0.2), G(c, r, 0.42), 0.17, 0.31, segs=12), "#8d867a")
    add("ob_fbrim", tube(G(c, r, 0.42), G(c, r, 0.46), 0.325, 0.325, segs=12), "#c9c3b6", False)
    add("ob_fbin", tube(G(c, r, 0.455), G(c, r, 0.47), 0.26, 0.26, segs=12), "#33281f", False)
    add("ob_fblog0", tube(G(c - 0.2, r - 0.04, 0.52), G(c + 0.2, r + 0.05, 0.6), 0.05, 0.05, segs=6), "#5a3a24", False)
    add("ob_fblog1", tube(G(c - 0.18, r + 0.06, 0.6), G(c + 0.2, r - 0.05, 0.52), 0.05, 0.05, segs=6), "#6b4428", False)
    if PASS == "day":      # by day the bowl is cold: grey ash, no flames (the fire is lit at dusk)
        add("ob_ln_coal", ellipsoid(G(c, r, 0.52), (0.18, 0.15, 0.04), segs=10, rings=4), "#4a4440", False)
        return
    add("ob_ln_coal", ellipsoid(G(c, r, 0.55), (0.18, 0.15, 0.05), segs=10, rings=4), "#ffb347", False)
    add("ob_ln_fl0", tube(G(c, r, 0.56), G(c + 0.01, r, 0.56 + 0.40), 0.13, 0.0, segs=8), "#ffa63a", False)
    add("ob_ln_fl1", tube(G(c - 0.12, r, 0.56), G(c - 0.18, r, 0.56 + 0.26), 0.08, 0.0, segs=7), "#ffb94a", False)
    add("ob_ln_fl2", tube(G(c + 0.12, r, 0.56), G(c + 0.19, r, 0.56 + 0.28), 0.085, 0.0, segs=7), "#ffb94a", False)
    add("ob_ln_fl3", tube(G(c, r, 0.57), G(c + 0.0, r, 0.57 + 0.24), 0.065, 0.0, segs=7), "#fff0a0", False)

def lantern_post():
    """a wooden crook post with a short arm; two paper lanterns hang from it (cream paper, golden ribs, dark caps): REAL sources, lit at dusk"""
    c, r = BX.POST; H = BX.POST_H; A = BX.ARM; W = "#6b4428"
    add("ob_lpfoot", tube(G(c, r, 0), G(c, r, 0.14), 0.13, 0.09, segs=8), "#a39c8f")
    add("ob_lppole", tube(G(c, r, 0.12), G(c, r, H), 0.05, 0.04, segs=8), W)
    add("ob_lparm0", tube(G(c, r, H), G(c + A * 0.55, r, H + 0.06), 0.04, 0.032, segs=6), W, False)
    add("ob_lparm1", tube(G(c + A * 0.55, r, H + 0.06), G(c + A, r, H - 0.02), 0.032, 0.026, segs=6), W, False)
    add("ob_lpball", ellipsoid(G(c, r, H + 0.04), (0.065, 0.065, 0.065), segs=8, rings=4), "#ffd36b", False)
    for i, ((lc, lr, lz), R) in enumerate(zip(BX.LANTERNS, BX.LANTERN_R)):
        top = lz + R * 1.28 + 0.03
        hook = H - 0.02 if i == 0 else H + 0.0
        add(f"ob_lpcord{i}", tube(G(lc, lr, top + 0.03), G(lc, lr, max(hook, top + 0.1) if i == 0 else H + 0.04), 0.008, 0.008, segs=4), "#3d2a1c", False)
        add(f"ob_ln_pl{i}", ellipsoid(G(lc, lr, lz), (R, R, R * 1.25), segs=14, rings=8), "#ffd98a")
        for q, f in enumerate((-0.55, 0.0, 0.55)): add(f"ob_lprib{i}{q}", tube(G(lc, lr, lz + f * R * 1.1), G(lc, lr, lz + f * R * 1.1 + 0.012), R * math.sqrt(max(0.02, 1 - f * f * 0.65)) * 1.01, R * math.sqrt(max(0.02, 1 - f * f * 0.65)) * 1.01, segs=14), "#d99a32", False)
        add(f"ob_lptop{i}", tube(G(lc, lr, lz + R * 1.2), G(lc, lr, lz + R * 1.2 + 0.035), R * 0.55, R * 0.45, segs=10), "#5a3a24", False)
        add(f"ob_lpbot{i}", tube(G(lc, lr, lz - R * 1.2 - 0.035), G(lc, lr, lz - R * 1.2), R * 0.45, R * 0.55, segs=10), "#5a3a24", False)
        add(f"ob_lptas{i}", tube(G(lc, lr, lz - R * 1.2 - 0.035), G(lc, lr, lz - R * 1.2 - 0.17), 0.012, 0.03, segs=5), "#d99a32", False)


OFF_LIGHTS = set()          # lit things switched OFF for this belt (dusk only)
if ST == "white":
    # --- run down, but friendly: tired colours, a few boarded and patched spots, bare beds, fewer fish, murky water
    paint("water", "#8cb6b8"); paint("riverbed", "#6d9ba2")
    for n in ("lily2", "lily3", "lilyf0", "lilyf1", "lilyf2", "lilyf3", "koi1", "koi2", "koi3", "koit1", "koit2", "koit3"): rm(n)
    rm_prefix("fl")                                     # the flower beds are bare
    for c in (9.4, 13.9):
        paint(f"soil{c}", "#86714a")
        for k, dx in enumerate((-0.45, -0.1, 0.3, 0.55)): tuft(f"ob_bedw{c}{k}", c + dx, 6.0 + (0.08 if k % 2 else -0.08), 0.26)
    add("ob_bedflower", ellipsoid(G(9.4 + 0.1, 6.02, 0.36), (0.07, 0.07, 0.05), segs=8, rings=4), "#f7f2e8", False)   # one brave little flower
    # the placeholder building: the left window is boarded up (the right one stays lit)
    rm("plcwin-1.3")
    add("ob_dark", box(G(18.3, 4.43, 1.01), (0.6, 0.05, 0.5)), "#4a4238", False)
    for k, (zz, tilt, col) in enumerate(((0.86, 5, "#a8743f"), (1.03, -4, "#8a5e38"), (1.19, 3, "#a8743f"))):
        add(f"ob_board{k}", box(G(18.3, 4.48, zz), (0.8, 0.045, 0.11), rot=(0, tilt, 0)), col)
    # the shop: one patched awning stripe, faded paper lanterns (off), a patched bridge plank
    add("ob_awpatch", box(G(10.09, 4.72, 1.74), (0.46, D(0.34), 0.075), rot=(-22, 0, 0)), "#8fa6c4")
    for k, hx in enumerate((-0.14, 0.14)): add(f"ob_awst{k}", box(G(10.09 + hx, 4.72, 1.745), (0.022, D(0.28), 0.08), rot=(-22, 0, 0)), "#5f6f92", False)
    paint("brd4", "#e3c88e"); paint("brd8", "#8d6a44")
    for n in ["shopln-2.3", "shopln2.3", "shopln0h", "shopln1h", "shopln2h", "brln14.6", "brln16.6"]: OFF_LIGHTS.add(n); paint(n, "#d8cfb2")
    # the paving: a few worn stones, a few cracks and tufts (all around the empty plinth, nothing in the walking lanes)
    for i, j in ((6, 2), (7, 3), (11, 4), (12, 5), (18, 2), (19, 5), (3, 4), (9, 6), (10, 5)): paint(f"st{i}_{j}", "#a79f90")
    for k, (c, r) in enumerate(((10.1, 9.55), (13.3, 9.7), (8.3, 8.6))):
        for q in range(3): add(f"ob_crk{k}{q}", box(G(c + q * 0.3, r + (0.07 if q % 2 else -0.05), 0.065), (0.34, D(0.025), 0.012)), "#80756a", False)
    for k, (c, r) in enumerate(((10.4, 8.45), (12.95, 8.4), (11.0, 9.25), (12.4, 9.25))): tuft(f"ob_pw{k}", c, r, 0.06)
elif ST == "green":
    # --- GREEN: fresh paint, the statue unveiled, a festive little town. Clearly upgraded, still airy.
    retint("green"); chimney_and_basket(); lush_beds(10, 3); window_boxes(); hedge_blossoms(1, ("#fbf3df", "#ffd36b"), 4)
    toro(0, 10.2, 9.1); toro(1, 13.1, 9.1)
    bunting(("#ffd36b", "#fbf3df", "#3f9a7a", "#6f9fd2"), 12)
    roof_flag("fs", 7.8, 3.875, 2.48, 1.25, "#ffd36b", "#fbf3df")
    bridge_garland(("#fbf3df", "#ffd36b"))
    add("ob_rvkoi", ellipsoid(G(15.55, 7.2, 0.035), (0.08, D(0.2), 0.015), segs=10, rings=3), "#fbf3df", False)
    add("ob_rvkoit", ellipsoid(G(15.55, 7.0, 0.035), (0.06, D(0.06), 0.01), segs=6, rings=3), "#fbf3df", False)

elif ST == "blue":
    # --- BLUE: FULLY MAXED. Everything Green has, then: blossom trees, four stone lanterns, banners on tall poles,
    #     two roof flags, a golden paving ring, lotus + more koi, a curl of chimney smoke.
    retint("blue"); chimney_and_basket(); lush_beds(14, 5); window_boxes(); hedge_blossoms(2, ("#ffe4ee", "#f6a8c4", "#fbf3df", "#ffd36b"), 6)
    for c, r in TREES:                                          # v5: EVERY round tree goes (the two green bench trees included) ...
        for n in (f"trunk{c}{r}", f"leaf{c}{r}", f"leaf2{c}{r}"): rm(n)
    for (c, r), (sc_, lean, seed) in BX.SAKURA.items(): sakura(c, r, sc_, lean, seed)      # ... and the sakura stand where they never touch the walking lane
    fire_bowl(); lantern_post()
    toro(0, 10.2, 9.1); toro(1, 13.1, 9.1); toro(2, 10.2, 6.9); toro(3, 13.1, 6.9)
    bunting(("#ffd36b", "#fbf3df", "#3f9a7a", "#6f9fd2", "#f6a8c4", "#86c46c"), 14)
    roof_flag("fs", 7.8, 3.875, 2.48, 1.25, "#ffd36b", "#fbf3df"); roof_flag("fp", 18.0, 4.0, 1.85, 1.3, "#3f9a7a", "#fbf3df")
    banner_pole(0, 1.9, 9.3, "#3f9a7a"); banner_pole(1, 21.0, 9.3, "#4f6fa6")
    bridge_garland(("#fbf3df", "#f6a8c4", "#ffd36b"))
    paint("pl0", "#a9b8d8"); paint("pl2", "#f1e8cf")
    for k, dx in enumerate((0.0, 0.1, -0.05)):      # a thin curl of smoke from the shop chimney
        rr = (0.13, 0.17, 0.2)[k]; add(f"ob_sm{k}", ellipsoid(G(10.45 + dx, 3.6, 3.5 + 0.36 * k), (rr, rr * 0.7, rr * 0.85), segs=12, rings=8), ("#f3f1ec", "#e8e6e2")[k % 2])
    for k, (x, rr, col) in enumerate(((15.45, 6.9, "#fbf3df"), (15.75, 9.35, "#ffd36b"), (15.25, 8.6, "#f59a3c"), (15.8, 5.1, "#fbf3df"))):      # more koi
        add(f"ob_rvkoi{k}", ellipsoid(G(x, rr, 0.035), (0.08, D(0.2), 0.015), segs=10, rings=3), col, False)
        add(f"ob_rvkoit{k}", ellipsoid(G(x, rr - 0.2, 0.035), (0.06, D(0.06), 0.01), segs=6, rings=3), col, False)
    for k, (x, rr) in enumerate(((15.35, 7.3), (15.95, 9.9), (15.3, 4.4), (15.95, 4.6))):      # more lily pads, three with pink lotus
        add(f"ob_rvlily{k}", ellipsoid(G(x, rr, 0.035), (0.24, D(0.2), 0.02), segs=14, rings=3), "#5fa65a", False)
        if k < 3:
            for q, (dx, dz) in enumerate(((-0.05, 0.1), (0.05, 0.1), (0.0, 0.14))): add(f"ob_rvlot{k}{q}", ellipsoid(G(x + dx, rr, 0.07 + dz * 0.5), (0.06, D(0.05), 0.09), segs=8, rings=4), ("#f6a8c4", "#ffe4ee", "#f6a8c4")[q], False)
        else: add(f"ob_rvlilyf{k}", ellipsoid(G(x + 0.05, rr, 0.07), (0.07, D(0.07), 0.05), segs=8, rings=4), "#fbf3df", False)
PROPS = set(bpy.data.objects) - BASE_OBJECTS
EXEMPT = ("ob_bed", "ob_rv")            # beds and the river are allowed in the walking-lane band (as in the approved concept)
PNAMES = {o.name for o in PROPS if not o.name.startswith(EXEMPT)}

def emis(c):
    m = bpy.data.materials.new("E%s" % c); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (c, c, c, 1); o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(e.outputs[0], o.inputs[0]); return m
def holdout():
    hold = bpy.data.materials.new("HOLD"); hold.use_nodes = True; nt = hold.node_tree; nt.nodes.clear()
    h = nt.nodes.new("ShaderNodeHoldout"); o_ = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(h.outputs[0], o_.inputs[0]); return hold
def recolour(pred, a, b):
    for o in bpy.data.objects:
        if o.type != "MESH": continue
        base = o.name[:-len("_outline")] if o.name.endswith("_outline") else o.name
        o.data.materials.clear(); o.data.materials.append(a if pred(base) else b)
RAW = False
if PASS == "lights":
    W_, B_ = emis(1.0), emis(0.0); LIT = re.compile(r"(glow|ln|lampb|inside|win|shoji)")
    for o in bpy.data.objects:
        if o.type != "MESH": continue
        if "_outline" in o.name: o.hide_render = True; continue
        lit = bool(LIT.search(o.name)) and "twin" not in o.name and o.name not in OFF_LIGHTS and (not o.name.startswith("ob_") or o.name.startswith("ob_ln"))
        o.data.materials.clear(); o.data.materials.append(W_ if lit else B_)
if PASS == "props": recolour(lambda b: b in PNAMES, emis(1.0), holdout())
if PASS == "trees": recolour(lambda b: b.startswith("ob_sk"), emis(1.0), holdout())                            # every part of every sakura incl. ring (lane check, ground shadow hold-out, rim light)
if PASS == "bloom": recolour(lambda b: b.startswith("ob_sk") and re.search(r"_c\d+_", b) is not None, emis(1.0), holdout())   # the blossom crowns only (dusk rose grade)
if PASS == "hero":
    HERO = re.compile(r"^(s_|star$|ob_ln_toro)"); HERO_X = re.compile(r"^s_shine")
    for o in bpy.data.objects:
        if o.type == "MESH" and "_outline" in o.name: o.hide_render = True
    recolour(lambda b: bool(HERO.search(b)) and b in {x.name for x in bpy.data.objects}, emis(1.0), emis(0.0))
if PASS == "height":
    RAW = True
    m = bpy.data.materials.new("HGT"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    g = nt.nodes.new("ShaderNodeNewGeometry"); sp_ = nt.nodes.new("ShaderNodeSeparateXYZ"); a_ = nt.nodes.new("ShaderNodeMath"); b_ = nt.nodes.new("ShaderNodeMath")
    a_.operation, b_.operation = "ADD", "MULTIPLY"; a_.inputs[1].default_value = 0.1; b_.inputs[1].default_value = 0.16
    cmb = nt.nodes.new("ShaderNodeCombineXYZ"); e = nt.nodes.new("ShaderNodeEmission"); o_ = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(g.outputs["Position"], sp_.inputs[0]); nt.links.new(sp_.outputs["Z"], a_.inputs[0]); nt.links.new(a_.outputs[0], b_.inputs[0])
    for i in range(3): nt.links.new(b_.outputs[0], cmb.inputs[i])
    nt.links.new(cmb.outputs[0], e.inputs[0]); nt.links.new(e.outputs[0], o_.inputs[0])
    for o in bpy.data.objects:
        if o.type != "MESH": continue
        if "_outline" in o.name: o.hide_render = True; continue
        o.data.materials.clear(); o.data.materials.append(m)
if PASS == "shade":
    m = bpy.data.materials.new("CLAY"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    d_ = nt.nodes.new("ShaderNodeBsdfDiffuse"); d_.inputs["Color"].default_value = (0.8, 0.8, 0.8, 1); o_ = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(d_.outputs[0], o_.inputs[0])
    for o in bpy.data.objects:
        if o.type != "MESH": continue
        if "_outline" in o.name: o.hide_render = True; continue
        o.data.materials.clear(); o.data.materials.append(m)
    w = bpy.data.worlds.new("W"); w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.25
    sc.world = w
    ld = bpy.data.lights.new("Sun", "SUN"); ld.energy = 3.5; ld.angle = math.radians(2.5)
    lo = bpy.data.objects.new("Sun", ld); coll.objects.link(lo)
    to_light = Vector((-0.45, -0.55, SUN_UP)).normalized()          # the toon kit's light direction (camera side, upper left)
    lo.rotation_euler = to_light.to_track_quat("Z", "Y").to_euler()
    AA.samples = max(AA.samples, 64)

# ---- camera + render (the house settings, identical to build_town_square.py)
r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = AA.samples; sc.cycles.use_denoising = False
r.film_transparent = True; sc.view_settings.view_transform = "Raw" if RAW else "Standard"; sc.view_settings.look = "None"
if RAW: r.image_settings.color_depth = "16"; r.image_settings.color_mode = "BW"
r.resolution_x, r.resolution_y = round(COLS * 80), round(ROWS * 80); r.resolution_percentage = 100
cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = COLS; cd.clip_end = 300
cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
cam.rotation_euler = (math.radians(90 - EL), 0, 0)
d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
cam.location = Vector((COLS / 2, -(ROWS / 2) * K, 0)) - d * 60
r.filepath = AA.out; bpy.ops.render.render(write_still=True)
