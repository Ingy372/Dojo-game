"""Dojo Ascent - A-TOWN-GROWTH v2: one FULL town picture per belt (the approved town square, changed per belt).
Runs the town-square build (same scene, camera and toon look as the approved concept: PR #301 + the #393 dojo slot,
dojo slot left empty because the dojo sprite is pasted on top later), then changes it for this belt and renders one pass:
    blender -b -P incoming-art/town-growth/source/build_town_stage.py -- --stage white|orange|blue|base --pass day|night|lights|props --out <png>
  day / night  the town in house colours (night = the dusk picture's town: no sourceless water sparkles)
  lights       a mask: this belt's lit windows and lanterns white, the rest black (the dusk glow pass)
  props        a mask: ONLY the objects this belt ADDS white, everything else black (for the lanes check)
make_stages.py then adds sky, far hills, the dusk grade, soft light, effects and the dojo sprite.
Stages: white = a little run down; orange = the approved town, no statue yet (empty plinth); blue = statue + gentle extras;
base = no changes at all (used only to prove the pipeline reproduces the approved picture)."""
import bpy, sys, os, math, argparse, random, re
HERE = os.path.dirname(os.path.abspath(__file__))
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

# ---- statue: it arrives at Green. Before that the plinth stands empty (no star plate either).
if ST in ("white", "orange"):
    for n in ("s_legL", "s_legR", "s_feet", "s_body", "s_belt", "s_head", "s_arm-1", "s_arm1", "s_fist-1", "s_fist1", "s_shine", "star"): rm(n)


# ---- water sparkles (day only): fewer than the approved picture, never at dusk
sp = sorted((o.name for o in bpy.data.objects if o.name.startswith("spk")), key=lambda s: int(s[3:]))
keep = {"white": 0, "orange": 6, "blue": 14, "base": 14}[ST]
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

OFF_LIGHTS = set()          # lit things switched OFF for this belt (dusk only)
if ST == "white":
    # --- run down, but friendly: tired colours, a few boarded and patched spots, bare beds, fewer fish, murky water
    paint("water", "#8cb6b8"); paint("riverbed", "#6d9ba2")
    for n in ("lily2", "lily3", "lilyf0", "lilyf1", "lilyf2", "lilyf3", "koi1", "koi2", "koi3", "koit1", "koit2", "koit3"): rm(n)
    rm_prefix("fl")                                     # the flower beds are bare
    for c in (9.4, 13.9):
        paint(f"soil{c}", "#86714a")
        for k, dx in enumerate((-0.45, -0.1, 0.3, 0.55)): tuft(f"ob_bw{c}{k}", c + dx, 6.0 + (0.08 if k % 2 else -0.08), 0.26)
    add("ob_bflower", ellipsoid(G(9.4 + 0.1, 6.02, 0.36), (0.07, 0.07, 0.05), segs=8, rings=4), "#f7f2e8", False)   # one brave little flower
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
elif ST == "orange":
    chimney_and_basket()
elif ST == "blue":
    chimney_and_basket()
    for k, dx in enumerate((0.0, 0.1, -0.05)):      # a thin curl of smoke from the shop chimney
        rr = (0.13, 0.17, 0.2)[k]; add(f"ob_sm{k}", ellipsoid(G(10.45 + dx, 3.6, 3.5 + 0.36 * k), (rr, rr * 0.7, rr * 0.85), segs=12, rings=8), ("#f3f1ec", "#e8e6e2")[k % 2])
    for k, (x, rr, col) in enumerate(((15.45, 6.9, "#fbf3df"), (15.75, 9.35, "#ffd36b"))):      # two more koi and two more lilies
        add(f"ob_koi{k}", ellipsoid(G(x, rr, 0.035), (0.08, D(0.2), 0.015), segs=10, rings=3), col, False)
        add(f"ob_koit{k}", ellipsoid(G(x, rr - 0.2, 0.035), (0.06, D(0.06), 0.01), segs=6, rings=3), col, False)
    for k, (x, rr) in enumerate(((15.35, 7.3), (15.95, 9.9))):
        add(f"ob_lily{k}", ellipsoid(G(x, rr, 0.035), (0.24, D(0.2), 0.02), segs=14, rings=3), "#5fa65a", False)
        add(f"ob_lilyf{k}", ellipsoid(G(x + 0.05, rr, 0.07), (0.07, D(0.07), 0.05), segs=8, rings=4), ("#fbf3df", "#ffd36b")[k % 2], False)
PROPS = set(bpy.data.objects) - BASE_OBJECTS
PNAMES = {o.name for o in PROPS}

def emis(c):
    m = bpy.data.materials.new("E%s" % c); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (c, c, c, 1); o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(e.outputs[0], o.inputs[0]); return m
if PASS == "lights":
    W_, B_ = emis(1.0), emis(0.0); LIT = re.compile(r"(glow|ln|lampb|inside|win|shoji)")
    for o in bpy.data.objects:
        if o.type != "MESH": continue
        if "_outline" in o.name: o.hide_render = True; continue
        lit = bool(LIT.search(o.name)) and "twin" not in o.name and o.name not in OFF_LIGHTS and not o.name.startswith("ob_")
        o.data.materials.clear(); o.data.materials.append(W_ if lit else B_)
if PASS == "props":
    W_ = emis(1.0)
    hold = bpy.data.materials.new("HOLD"); hold.use_nodes = True; nt = hold.node_tree; nt.nodes.clear()
    h = nt.nodes.new("ShaderNodeHoldout"); o_ = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(h.outputs[0], o_.inputs[0])
    for o in bpy.data.objects:
        if o.type != "MESH": continue
        base = o.name[:-len("_outline")] if o.name.endswith("_outline") else o.name
        o.data.materials.clear(); o.data.materials.append(W_ if base in PNAMES else hold)

# ---- camera + render (the house settings, identical to build_town_square.py)
r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = AA.samples; sc.cycles.use_denoising = False
r.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
r.resolution_x, r.resolution_y = round(COLS * 80), round(ROWS * 80); r.resolution_percentage = 100
cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = COLS; cd.clip_end = 300
cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
cam.rotation_euler = (math.radians(90 - EL), 0, 0)
from mathutils import Vector, Euler
d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
cam.location = Vector((COLS / 2, -(ROWS / 2) * K, 0)) - d * 60
r.filepath = AA.out; bpy.ops.render.render(write_still=True)
