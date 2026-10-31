"""Dojo Ascent - A-TOWN-GROWTH: one belt's add-on layer for the approved town square (PR #301 + the #393 dojo slot).
Runs the town-square build (the SAME scene, camera and house toon look), turns every existing object into a holdout
(so the add-ons are hidden wherever the town stands in front of them), adds only this belt's new objects, and renders
two transparent frames the size of the town picture (1864 x 860 at 80 px per tile, already shifted like make_concept.py):
  <out>/<id>-<day|dusk>-color.png   the add-on, in house colours
  <out>/<id>-<day|dusk>-lit.png     a mask: the add-on's own lit parts (lanterns, oven window, flame ...) white, the rest black
make_growth.py then grades the dusk frame, adds the glows and pools, and writes the final overlays.
    blender -b -P incoming-art/town-growth/source/build_town_growth.py -- --id white --out <dir> [--night] [--samples 24]
Add-on ids: white yellow orange green blue red redblack brown brownblack
Positions are tile columns/rows of the town grid (z up). Wall and hill items use SC()/GP(), which take the pixel on the
final 1864x860 picture (the town frame is already shifted down 0.95 tile)."""
import bpy, sys, os, math, argparse, random
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, "..", "..", "..", "town-square-concept", "source", "build_town_square.py")
ap = argparse.ArgumentParser(); ap.add_argument("--id", required=True); ap.add_argument("--out", required=True)
ap.add_argument("--night", action="store_true"); ap.add_argument("--samples", type=int, default=24)
AA = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
NIGHT = AA.night

# ---- build the approved base scene exactly as the town picture was built (no old dojo slot, tree cleared), minus the camera
src = open(BASE).read()
src = src[:src.index("# ---------------------------------------------------------------- camera + render")]
sys.argv = [sys.argv[0], "--", "--out", "x.png", "--no-dojo0", "--clear-dojo-trees", "--samples", str(AA.samples)] + (["--night"] if NIGHT else [])
NS = {"__file__": os.path.abspath(BASE), "__name__": "town_base"}
exec(compile(src, BASE, "exec"), NS)
bpy.context.view_layer.update()
sc, coll, K, EL, COLS, ROWS, G, D = (NS[k] for k in ("sc", "coll", "K", "EL", "COLS", "ROWS", "G", "D"))
base_add, mat = NS["add"], NS["mat"]
box, tube, ellipsoid = NS["box"], NS["tube"], NS["ellipsoid"]
PPT, SHIFT_ROWS = 80, 0.95
hold = bpy.data.materials.new("HOLD"); hold.use_nodes = True; nt = hold.node_tree; nt.nodes.clear()
h = nt.nodes.new("ShaderNodeHoldout"); o_ = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(h.outputs[0], o_.inputs[0])
for ob in list(bpy.data.objects):
    if ob.type == "MESH":
        ob.data.materials.clear(); ob.data.materials.append(hold)
BASE_OBJECTS = set(bpy.data.objects)

def add(name, bm, col, outline=True, lit=False):
    return base_add(("lit_" if lit else "") + name, bm, col, outline)
def GP(X, Y, z=0.0):
    """a point ON THE GROUND at final-picture pixel (X, Y)."""
    return G(X / PPT, (Y - SHIFT_ROWS * PPT) / PPT, z)
ZPX = PPT * math.cos(math.radians(EL))      # one world unit of height is this many pixels on screen (65.5)
def SC(X, Y, r=2.0):
    """a point on the final picture (pixel X, Y) drawn as a standing object at ground row r (far / hill / wall items)."""
    return G(X / PPT, r, (r * PPT + SHIFT_ROWS * PPT - Y) / ZPX)

GOLD, GOLD2, CREAM = "#ffcf4a", "#fff2a8", "#fbf3df"
WOOD, WOOD2, WOOD3, WOOD4 = "#a8743f", "#7a5232", "#c99a62", "#6b4428"
STONE, STONE2 = "#cfc8ba", "#c6beaf"
GREEN, GREEN2, GREEN3 = "#5fa65a", "#86c46c", "#6fae5a"

def bloom(n, c, r, z, col, s=0.09, centre="#ffd36b"):
    add(n, ellipsoid(G(c, r, z), (s, s * 0.8, s * 0.7), segs=8, rings=5), col, False)
    add(n + "c", ellipsoid(G(c, r + 0.01, z + 0.02), (s * 0.45, s * 0.35, s * 0.4), segs=6, rings=4), centre, False)
def bud(n, c, r, z, col, s=0.06):
    add(n, ellipsoid(G(c, r, z), (s * 0.7, s * 0.6, s * 1.25), segs=8, rings=5), col, False)
def lantern(n, c, r, z, s=1.0, lit=True, cord=0.0):
    add(n + "cap", tube(G(c, r, z + 0.17 * s), G(c, r, z + 0.24 * s), 0.12 * s, 0.05 * s, segs=10), "#e8b84f", False)
    add(n + "body", ellipsoid(G(c, r, z), (0.13 * s, 0.13 * s, 0.17 * s), segs=12, rings=8), "#fff6c8", True, lit)
    add(n + "base", tube(G(c, r, z - 0.2 * s), G(c, r, z - 0.14 * s), 0.05 * s, 0.1 * s, segs=10), "#e8b84f", False)
    if cord: add(n + "cord", tube(G(c, r, z + 0.24 * s), G(c, r, z + 0.24 * s + cord), 0.012, 0.012, segs=4), WOOD4, False)
def sparkle(n, p, s=0.14, col="#fff6c8"):
    c, y, z = p
    add(n + "a", ellipsoid((c, y, z), (s, 0.03, s * 0.22), segs=6, rings=3), col, False, True)
    add(n + "b", ellipsoid((c, y, z), (s * 0.22, 0.03, s), segs=6, rings=3), col, False, True)

ID = AA.id

# ================================================================= WHITE: lamps (lantern-halls)
if ID == "white":
    for c in (5.0, 19.0):                                   # the two lamp posts get a bigger gold glass lantern
        add(f"wl_ring{c}", tube(G(c, 9.0, 1.42), G(c, 9.0, 1.5), 0.13, 0.12, segs=14), "#e8b84f")
        add(f"wl_glass{c}", box(G(c, 9.0, 1.7), (0.4, 0.4, 0.42)), "#ffe9a0", True, True)
        for sx in (-1, 1):
            for sy in (-1, 1):
                add(f"wl_rib{c}{sx}{sy}", tube(G(c + sx * 0.2, 9.0 + sy * 0.2, 1.5), G(c + sx * 0.2, 9.0 + sy * 0.2, 1.92), 0.025, 0.025, segs=6), "#e8b84f", False)
        add(f"wl_cap{c}", tube(G(c, 9.0, 1.92), G(c, 9.0, 2.16), 0.32, 0.03, segs=4), "#e8b84f")
        add(f"wl_fin{c}", ellipsoid(G(c, 9.0, 2.2), (0.06, 0.06, 0.07), segs=8, rings=5), "#ffd36b", False)
    bx = 15.6                                                # a new little lamp on the bridge's back rail
    add("wl_bpost", tube(G(bx, 7.55, 0.92), G(bx, 7.55, 1.42), 0.045, 0.045, segs=8), WOOD2)
    add("wl_bglass", box(G(bx, 7.55, 1.62), (0.3, 0.3, 0.32)), "#ffe9a0", True, True)
    add("wl_bcap", tube(G(bx, 7.55, 1.78), G(bx, 7.55, 1.97), 0.24, 0.03, segs=4), "#e8b84f")
    add("wl_bring", tube(G(bx, 7.55, 1.42), G(bx, 7.55, 1.47), 0.1, 0.09, segs=12), "#e8b84f", False)
    if not NIGHT:                                            # sunshine sparkles on the glass + one gold spark drifting to the Tower
        for k, (c, y, z) in enumerate(((5.18, 8.85, 1.86), (18.84, 8.85, 1.62), (15.72, 7.4, 1.8))):
            sparkle(f"wl_sp{k}", G(c, y, z), 0.16, "#ffffff")
        sparkle("wl_rise", G(14.9, 6.2, 3.5), 0.12, "#ffe48a")

# ================================================================= YELLOW: flower beds burst into bloom + porch vine
if ID == "yellow":
    random.seed(5)
    PAL = ["#ffd36b", "#f7f2e8", "#f6c3d6", "#ffd36b", "#fbdbe6", "#f7f2e8"]       # gold, white, soft pink
    for bc, br in ((9.4, 6.0), (13.9, 6.0)):
        for k in range(5):
            add(f"yb_bush{bc}{k}", ellipsoid(G(bc - 0.55 + k * 0.275, br + 0.02, 0.3), (0.22, 0.17, 0.14), segs=10, rings=6), GREEN2 if k % 2 else GREEN, False)
        for k in range(22):
            x = bc - 0.62 + random.random() * 1.24; y = br - 0.2 + random.random() * 0.4
            z = 0.4 + (0.3 if (k % 5 == 0) else random.random() * 0.12)
            if NIGHT: bud(f"yb_f{bc}{k}", x, y, z - 0.05, ("#e9dcc0", "#e6cfa0", "#eed3de")[k % 3])
            else:
                bloom(f"yb_f{bc}{k}", x, y, z, PAL[k % 6], 0.1 if k % 5 else 0.13)
        if not NIGHT:
            for k, x in enumerate((-0.42, 0.05, 0.5)):       # three tall sunflowers at the back
                add(f"yb_sst{bc}{k}", tube(G(bc + x, br - 0.16, 0.2), G(bc + x, br - 0.16, 0.95 + 0.06 * k), 0.025, 0.025, segs=6), GREEN, False)
                add(f"yb_sf{bc}{k}", ellipsoid(G(bc + x, br - 0.19, 1.0 + 0.06 * k), (0.15, 0.04, 0.15), segs=14, rings=4), "#ffcf4a")
                add(f"yb_sfc{bc}{k}", ellipsoid(G(bc + x, br - 0.215, 1.0 + 0.06 * k), (0.07, 0.03, 0.07), segs=10, rings=4), WOOD4, False)
    for k, c in enumerate((0.65, 6.65, 12.1)):               # little flower tufts along the lawn edge
        for j in range(5):
            x = c - 0.25 + j * 0.125; y = 4.5 + (0.04 if j % 2 else -0.03)
            add(f"yb_t{k}{j}", ellipsoid(G(x, y, 0.07), (0.07, 0.05, 0.1), segs=6, rings=4), GREEN2, False)
            if NIGHT: bud(f"yb_tf{k}{j}", x, y, 0.2, "#e9dcc0", 0.05)
            else: bloom(f"yb_tf{k}{j}", x, y, 0.2, PAL[(k + j) % 6], 0.065)
    # the vine up the main dojo's left porch post (wall corner at about pixel x 90, ground at pixel y 430)
    pts = [(98, 432), (93, 410), (101, 392), (92, 374), (99, 356), (92, 340), (97, 330)]
    for k in range(len(pts) - 1):
        add(f"yb_vine{k}", tube(SC(*pts[k], r=4.5), SC(*pts[k + 1], r=4.5), 0.03, 0.025, segs=6), "#4f8a4a", False)
    for k, (px, py) in enumerate(pts[1:]):
        for sgn in (-1, 1):
            add(f"yb_leaf{k}{sgn}", ellipsoid(SC(px + sgn * 7, py - 3, r=4.5), (0.1, 0.03, 0.055), rot=(0, sgn * 28, 0), segs=8, rings=4), GREEN2 if k % 2 else GREEN, False)
    for k, (px, py, col) in enumerate(((84, 404, "#ffd36b"), (106, 396, "#f7f2e8"), (86, 378, "#f6c3d6"), (104, 366, "#ffd36b"), (88, 350, "#f7f2e8"), (101, 342, "#f6c3d6"), (95, 424, "#f6c3d6"))):
        if NIGHT: bud(f"yb_vf{k}", *SC(px, py, r=4.46)[:1], 4.46, SC(px, py, r=4.46)[2], "#e9dcc0", 0.045)
        else: bloom(f"yb_vf{k}", px / PPT, 4.46, SC(px, py, r=4.46)[2], col, 0.07)
    if not NIGHT:                                            # three butterflies low over the flowers (flower height, never over a walking lane)
        for k, (c, y, z, col) in enumerate(((9.1, 5.7, 0.95, "#ffd36b"), (13.6, 5.7, 0.9, "#cfe7ff"), (14.3, 5.8, 1.05, "#fbdbe6"))):
            for sx in (-1, 1):
                add(f"yb_bw{k}{sx}", ellipsoid(G(c + sx * 0.07, y, z), (0.07, 0.015, 0.06), rot=(0, sx * 30, 0), segs=6, rings=3), col, False)
            add(f"yb_bwb{k}", ellipsoid(G(c, y, z), (0.015, 0.015, 0.05), segs=5, rings=3), WOOD4, False)

# ================================================================= ORANGE: bakery oven, chimney with smoke, bread, long table
if ID == "orange":
    cx = 9.3
    # chimney on the shop roof (stone, with a cap) and a curl of smoke
    add("ob_chim", box(G(10.45, 3.6, 2.62), (0.5, 0.5, 1.05), bevel=0.02), "#c9bfae")
    for k, zz in enumerate((2.3, 2.62, 2.94)):
        add(f"ob_chb{k}", box(G(10.45, 3.6, zz), (0.54, 0.54, 0.07)), "#a89b86", False)
    add("ob_chcap", box(G(10.45, 3.6, 3.19), (0.62, 0.62, 0.1)), "#8b8070")
    if True:
        for k, (dx, zz, rr) in enumerate(((0.0, 3.45, 0.17), (0.08, 3.78, 0.22), (-0.06, 4.15, 0.27), (0.1, 4.55, 0.3))):
            add(f"ob_sm{k}", ellipsoid(G(10.45 + dx, 3.6, zz), (rr, rr * 0.7, rr * 0.85), segs=12, rings=8), "#f3f1ec" if k % 2 == 0 else "#e8e6e2")
    # bread basket on the counter (right end), with baguettes and loaves
    bcx, bry = cx + 1.5, 4.46
    add("ob_bk", tube(G(bcx, bry, 0.69), G(bcx, bry, 0.9), 0.24, 0.28, segs=14), "#c19159")
    add("ob_bkrim", tube(G(bcx, bry, 0.9), G(bcx, bry, 0.94), 0.3, 0.3, segs=14), "#a8743f", False)
    for k, dx in enumerate((-0.12, 0.0, 0.12)):
        add(f"ob_bag{k}", tube(G(bcx + dx - 0.05, bry, 0.92), G(bcx + dx + 0.1 + 0.05 * k, bry - 0.05, 1.28), 0.055, 0.055, segs=8), "#e0aa5c")
        add(f"ob_bagc{k}", ellipsoid(G(bcx + dx + 0.1 + 0.05 * k, bry - 0.05, 1.29), (0.06, 0.06, 0.05), segs=8, rings=4), "#e0aa5c", False)
    for k, dx in enumerate((-0.14, 0.14)):
        add(f"ob_loaf{k}", ellipsoid(G(bcx + dx, bry + 0.06, 0.98), (0.12, 0.09, 0.08), segs=10, rings=6), "#d9a35a")
    # the little bakery oven beside the shop (on the lawn) with its glowing window
    oc, orr = 12.2, 3.9
    add("ob_oven", box(G(oc, orr, 0.5), (0.92, D(0.62), 1.0), bevel=0.04), "#c89a6a")
    add("ob_dome", ellipsoid(G(oc, orr, 1.02), (0.5, D(0.34), 0.34), segs=16, rings=8), "#b88a5c")
    add("ob_base", box(G(oc, orr, 0.09), (1.02, D(0.72), 0.18)), "#a9adc4")
    add("ob_win", ellipsoid(G(oc, orr + 0.35, 0.55), (0.24, 0.03, 0.2), segs=14, rings=8), "#ffb347", False, True)
    add("ob_wint", box(G(oc, orr + 0.345, 0.5), (0.48, 0.03, 0.24)), "#ffb347", False, True)
    add("ob_winr", tube(G(oc - 0.27, orr + 0.37, 0.4), G(oc + 0.27, orr + 0.37, 0.4), 0.03, 0.03, segs=8), "#6b4428", False)
    add("ob_flue", tube(G(oc + 0.25, orr - 0.1, 1.2), G(oc + 0.25, orr - 0.1, 1.62), 0.07, 0.07, segs=10), "#8b8070")
    add("ob_fluec", tube(G(oc + 0.25, orr - 0.1, 1.62), G(oc + 0.25, orr - 0.1, 1.7), 0.1, 0.1, segs=10), "#6b6256", False)
    # the long wooden table with two benches, set with plates and bread
    tc, tr = 13.85, 4.1
    add("ob_tb", box(G(tc, tr, 0.6), (1.5, D(0.46), 0.07), bevel=0.02), WOOD3)
    for sx in (-0.62, 0.62):
        add(f"ob_tl{sx}", box(G(tc + sx, tr, 0.3), (0.1, D(0.36), 0.6)), WOOD2)
    for yy in (tr - 0.46, tr + 0.4):
        add(f"ob_bn{yy}", box(G(tc, yy, 0.34), (1.4, D(0.2), 0.07), bevel=0.02), WOOD)
        for sx in (-0.58, 0.58): add(f"ob_bl{yy}{sx}", box(G(tc + sx, yy, 0.17), (0.08, D(0.14), 0.34)), WOOD4)
    for k, dx in enumerate((-0.55, -0.2, 0.15, 0.5)):
        add(f"ob_pl{k}", tube(G(tc + dx, tr + 0.04, 0.64), G(tc + dx, tr + 0.04, 0.66), 0.1, 0.1, segs=12), CREAM, False)
    for k, dx in enumerate((-0.2, 0.15)):
        add(f"ob_tbr{k}", ellipsoid(G(tc + dx, tr - 0.06, 0.72), (0.11, 0.08, 0.07), segs=10, rings=6), "#d9a35a", False)
    add("ob_jug", tube(G(tc + 0.55, tr - 0.08, 0.64), G(tc + 0.55, tr - 0.08, 0.9), 0.07, 0.06, segs=10), "#6f9fd2", False)
    # lantern post over the table
    add("ob_lp", tube(G(12.95, 3.75, 0), G(12.95, 3.75, 1.95), 0.045, 0.045, segs=8), WOOD4)
    add("ob_la", tube(G(12.95, 3.75, 1.95), G(13.55, 3.75, 1.95), 0.03, 0.03, segs=6), WOOD4, False)
    lantern("ob_lan", 13.55, 3.8, 1.58, 1.15, True, 0.14)

# ================================================================= GREEN: giants' steps path up the hill + stone giant bench
if ID == "green":
    path = [(1848, 313), (1829, 296), (1811, 280), (1822, 262), (1806, 247), (1788, 236), (1796, 224)]
    sizes = [0.62, 0.58, 0.56, 0.54, 0.5, 0.46, 0.42]
    for k, ((px, py), w) in enumerate(zip(path, sizes)):
        x, y, _ = GP(px, py)
        add(f"gp_s{k}", box((x, y, 0.07), (w, D(0.2), 0.14), bevel=0.04), ("#e0d9c8", "#d6cebd")[k % 2])
        add(f"gp_st{k}", box((x, y + 0.0, 0.15), (w * 0.8, D(0.16), 0.02)), "#efe9db", False)
    # the stone giant bench on the lawn gap between the dojo and the shop, at the hedge line
    bc, brow = 6.65, 4.15
    add("gb_seat", box(G(bc, brow, 0.36), (0.78, D(0.3), 0.12), bevel=0.04), "#d9d1c2")
    for sx in (-1, 1):
        add(f"gb_foot{sx}", box(G(bc + sx * 0.28, brow, 0.15), (0.2, D(0.26), 0.3), bevel=0.04), "#c4bba9")
    add("gb_back", box(G(bc, brow - 0.1, 0.62), (0.78, D(0.07), 0.34), bevel=0.04), "#d2cabb")
    if not NIGHT: add("gb_worry", ellipsoid(G(bc + 0.12, brow + 0.02, 0.46), (0.06, 0.05, 0.04), segs=10, rings=6), "#9fa3b5")
    else:
        for k, ((px, py), dx) in enumerate(zip(path[:6], (-0.0, 0, 0, 0, 0, 0))):
            if k % 2 == 1 or k == 0:
                x, y, _ = GP(px + (-20 if k % 2 == 0 else 20), py + 6)
                add(f"gp_ln{k}", box((x, y, 0.2), (0.17, D(0.15), 0.4), bevel=0.03), "#bdb4a3")
                add(f"gp_lnc{k}", box((x, y, 0.45), (0.23, D(0.2), 0.07)), "#a89f8f", False)
                add(f"gp_lng{k}", box((x, y + 0.075, 0.22), (0.1, 0.03, 0.14)), "#ffe9a0", False, True)

# ================================================================= BLUE: clear river, koi, lilies, dock
if ID == "blue":
    random.seed(21)
    RV0, RV1 = 14.85, 16.35
    wash = bpy.data.materials.new("WASH"); wash.use_nodes = True; nt = wash.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (0.55, 0.92, 0.98, 1)
    t_ = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs[0].default_value = 0.34
    ou = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(t_.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], ou.inputs[0])
    w = base_add("wash", box(G((RV0 + RV1) / 2, 7.4, 0.03), (RV1 - RV0, D(8.4), 0.005)), "#ffffff", False)
    w.data.materials.clear(); w.data.materials.append(wash)
    for k in range(16):                                      # clean pebbles on the riverbed, seen through the clear water
        x = RV0 + 0.18 + random.random() * (RV1 - RV0 - 0.36); y = 3.9 + random.random() * 7.2
        if 7.4 < y < 8.6: continue
        add(f"bu_peb{k}", ellipsoid(G(x, y, 0.045), (0.07 + random.random() * 0.04, D(0.05), 0.02), segs=8, rings=3), ("#efe2bd", "#e2cf9d", "#f7f2e8")[k % 3], False)
    for k, (x, y, col) in enumerate(((15.45, 5.0, "#f59a3c"), (15.3, 4.2, "#fbf3df"), (16.05, 7.0, "#ffd36b"), (15.55, 9.3, "#fbf3df"), (15.85, 9.6, "#f59a3c"), (15.2, 11.1, "#ffd36b"))):
        add(f"bu_koi{k}", ellipsoid(G(x, y, 0.045), (0.08, D(0.2), 0.02), segs=10, rings=3), col, False)
        add(f"bu_koit{k}", ellipsoid(G(x - 0.02, y - 0.21, 0.045), (0.06, D(0.07), 0.012), segs=6, rings=3), col, False)
    for k, (x, y) in enumerate(((15.1, 4.6), (16.0, 5.6), (15.9, 7.1), (15.35, 9.2), (16.1, 11.0))):
        add(f"bu_lily{k}", ellipsoid(G(x, y, 0.04), (0.23, D(0.19), 0.02), segs=14, rings=3), "#5fa65a", False)
        for j in range(5):
            a = j * 2 * math.pi / 5
            add(f"bu_pet{k}{j}", ellipsoid(G(x + 0.05 + 0.055 * math.cos(a), y + 0.055 * math.sin(a) * 0.8, 0.09), (0.045, D(0.04), 0.06), rot=(0, 0, math.degrees(a)), segs=6, rings=4), ("#f6c3d6", "#fbf3df")[k % 2], False)
        add(f"bu_lc{k}", ellipsoid(G(x + 0.05, y, 0.1), (0.03, D(0.03), 0.03), segs=6, rings=3), "#ffd36b", False)
    # small wooden sitting dock off the left bank, upstream of the bridge
    dx0, dr = 14.74, 5.7
    for k in range(6):
        add(f"bu_pl{k}", box(G(dx0 + 0.07 + k * 0.13, dr, 0.15), (0.12, D(0.5), 0.05), bevel=0.012), ("#c99a62", "#b98a55")[k % 2])
    for sy in (-0.2, 0.2):
        add(f"bu_rail{sy}", box(G(dx0 + 0.43, dr + sy, 0.12), (0.8, D(0.04), 0.04)), WOOD2, False)
    for sx, sy in ((0.85, -0.2), (0.85, 0.2), (0.2, -0.2), (0.2, 0.2)):
        add(f"bu_pil{sx}{sy}", tube(G(dx0 + sx, dr + sy, -0.05), G(dx0 + sx, dr + sy, 0.34 if sx > 0.5 else 0.2), 0.035, 0.035, segs=8), WOOD4, sx > 0.5)
    add("bu_seat", box(G(dx0 + 0.43, dr + 0.05, 0.3), (0.5, D(0.12), 0.05), bevel=0.01), WOOD, False)
    add("bu_lpost", tube(G(dx0 + 0.85, dr - 0.2, 0.34), G(dx0 + 0.85, dr - 0.2, 0.95), 0.03, 0.03, segs=8), WOOD4, False)
    lantern("bu_ln", dx0 + 0.85, dr - 0.2, 1.1, 0.85, True)
    if not NIGHT:
        for k in range(16):
            x = RV0 + 0.2 + random.random() * (RV1 - RV0 - 0.4); y = 3.7 + random.random() * 7.6
            if 7.45 < y < 8.65: continue
            add(f"bu_spk{k}", ellipsoid(G(x, y, 0.06), (0.06, D(0.06), 0.02), segs=6, rings=3), "#ffffff", False)
        for k in range(7):
            x = RV0 + 0.2 + random.random() * (RV1 - RV0 - 0.5); y = 3.8 + random.random() * 7.4
            if 7.45 < y < 8.65: continue
            add(f"bu_rp{k}", box(G(x, y, 0.06), (0.4 + random.random() * 0.25, D(0.04), 0.01)), "#e9fbff", False)

# ================================================================= RED: gold flame banners, training dummy, brazier (NO red anywhere)
def flame(n, p, s, lit=False):
    c, y, z = p
    add(n + "o", tube((c, y, z - 0.38 * s), (c, y, z + 0.62 * s), 0.30 * s, 0.0, segs=14, sy=0.25), GOLD, True, lit)
    add(n + "l", tube((c - 0.17 * s, y, z - 0.05 * s), (c - 0.27 * s, y, z + 0.34 * s), 0.12 * s, 0.0, segs=10, sy=0.25), GOLD, True, lit)
    add(n + "r", tube((c + 0.17 * s, y, z - 0.05 * s), (c + 0.22 * s, y, z + 0.28 * s), 0.1 * s, 0.0, segs=10, sy=0.25), GOLD, True, lit)
    add(n + "b", ellipsoid((c, y, z - 0.18 * s), (0.34 * s, 0.1 * s, 0.34 * s), segs=14, rings=8), GOLD, False, lit)
    add(n + "i", tube((c, y - 0.01, z - 0.3 * s), (c, y - 0.01, z + 0.22 * s), 0.16 * s, 0.0, segs=12, sy=0.2), GOLD2, False, lit)
if ID == "red":
    for k, (px, py) in enumerate(((417, 122), (719, 180), (657, 131), (344, 170))):      # the four plain hill banners
        flame(f"rd_hf{k}", SC(px, py + 0.5, r=1.6), 0.27)
        if NIGHT:                                    # dusk: a small lantern sitting on a little bracket at the top of each hill banner pole is the light for its flame
            add(f"rd_hla{k}", tube(SC(px - 17, py - 12, r=1.6), SC(px + 27, py - 12, r=1.6), 0.016, 0.016, segs=5), WOOD4, False)
            lantern(f"rd_hln{k}", (px + 22) / PPT, 1.6, (1.6 * PPT + SHIFT_ROWS * PPT - (py - 19)) / ZPX, 0.55, True)
    for k, bxx in enumerate((2.4, 5.8)):                                                  # the two practice-yard nobori
        flame(f"rd_nf{k}", G(bxx, 6.99, 1.3), 0.5)
        if NIGHT:                                    # dusk: a small lantern hangs from an arm on the pole, beside the banner (up in the air, nothing on the ground)
            add(f"rd_nla{k}", tube(G(bxx, 6.99, 1.8), G(bxx + 0.62, 6.99, 1.8), 0.02, 0.02, segs=5), WOOD4, False)
            lantern(f"rd_nln{k}", bxx + 0.62, 6.99, 1.45, 0.62, True, 0.17)
    # a padded wooden training dummy in the yard's left-front corner
    dc, dr_ = 3.0, 8.05
    add("rd_dbase", box(G(dc, dr_, 0.14), (0.55, D(0.34), 0.08), bevel=0.02), WOOD2)
    add("rd_dpost", tube(G(dc, dr_, 0.1), G(dc, dr_, 1.2), 0.075, 0.075, segs=10), WOOD)
    add("rd_dtorso", tube(G(dc, dr_, 0.52), G(dc, dr_, 1.02), 0.2, 0.2, segs=14, sy=0.8), "#e4cf8f")
    add("rd_dbelt", tube(G(dc, dr_, 0.7), G(dc, dr_, 0.78), 0.21, 0.21, segs=14, sy=0.8), "#4f6fa6", False)
    add("rd_dhead", ellipsoid(G(dc, dr_, 1.2), (0.13, 0.12, 0.13), segs=12, rings=8), "#e4cf8f")
    for sx in (-1, 1):
        add(f"rd_darm{sx}", tube(G(dc + sx * 0.18, dr_ - 0.02, 0.92), G(dc + sx * 0.46, dr_ - 0.1, 0.84), 0.06, 0.06, segs=8), WOOD)
        add(f"rd_dpad{sx}", ellipsoid(G(dc + sx * 0.5, dr_ - 0.11, 0.83), (0.1, 0.09, 0.1), segs=10, rings=6), "#e4cf8f")
    # a small brazier behind a stone ring, with a gold flame
    bx_, br_ = 5.3, 7.65
    add("rd_bring", tube(G(bx_, br_, 0.0), G(bx_, br_, 0.34), 0.36, 0.3, segs=18, sy=0.82), "#bdb4a3")
    add("rd_brim", tube(G(bx_, br_, 0.34), G(bx_, br_, 0.4), 0.38, 0.38, segs=18, sy=0.82), "#a89f8f", False)
    add("rd_bfill", tube(G(bx_, br_, 0.4), G(bx_, br_, 0.43), 0.29, 0.29, segs=16, sy=0.82), "#3d3548", False)
    add("rd_embers", ellipsoid(G(bx_, br_, 0.46), (0.22, 0.17, 0.07), segs=12, rings=5), "#ffb43a", False, True)
    flame("rd_bfl", G(bx_, br_, 0.78), 0.62, True)

# ================================================================= RED/BLACK: wind chime + welcome bell at the dojo door
if ID == "redblack":
    BRASS, BRASS2 = "#e8b84f", "#f4d37c"
    cxp, top = 232, 357
    add("rb_arm", tube(SC(cxp - 14, top, r=4.5), SC(cxp + 2, top, r=4.5), 0.03, 0.03, segs=6), WOOD4, False)
    add("rb_cord", tube(SC(cxp, top, r=4.5), SC(cxp, top + 14, r=4.5), 0.012, 0.012, segs=4), WOOD4, False)
    add("rb_disc", tube(SC(cxp, top + 14, r=4.5), SC(cxp, top + 18, r=4.5), 0.16, 0.16, segs=14), WOOD3)
    for k, (dxp, ln) in enumerate(((-11, 22), (-5.5, 30), (0, 38), (5.5, 28), (11, 20))):
        p0 = SC(cxp + dxp, top + 18, r=4.52); p1 = SC(cxp + dxp, top + 18 + ln, r=4.52)
        add(f"rb_t{k}", tube(p0, p1, 0.04, 0.04, segs=8), BRASS if k % 2 == 0 else BRASS2, True, False)
    add("rb_sail", tube(SC(cxp, top + 18, r=4.5), SC(cxp, top + 44, r=4.5), 0.012, 0.012, segs=4), WOOD4, False)
    add("rb_sailc", ellipsoid(SC(cxp, top + 48, r=4.5), (0.07, 0.015, 0.09), segs=8, rings=4), "#fbf3df", False)
    # the welcome bell on a bracket by the door's right frame
    bxp, byp = 345, 378
    add("rb_barm", tube(SC(bxp - 18, byp - 14, r=4.5), SC(bxp + 2, byp - 14, r=4.5), 0.03, 0.03, segs=6), WOOD4, False)
    add("rb_bcord", tube(SC(bxp, byp - 14, r=4.5), SC(bxp, byp - 8, r=4.5), 0.012, 0.012, segs=4), WOOD4, False)
    add("rb_bell", tube(SC(bxp, byp - 8, r=4.52), SC(bxp, byp + 10, r=4.52), 0.09, 0.2, segs=14), BRASS)
    add("rb_bellr", tube(SC(bxp, byp + 10, r=4.52), SC(bxp, byp + 13, r=4.52), 0.22, 0.22, segs=14), BRASS2, False)
    add("rb_bellc", ellipsoid(SC(bxp, byp + 16, r=4.52), (0.05, 0.05, 0.05), segs=8, rings=5), WOOD4, False)
    if NIGHT:                                                                              # the chime tubes glimmer faintly (a tiny lit trim)
        for k in range(5):
            add(f"rb_g{k}", ellipsoid(SC(cxp + (-11, -5.5, 0, 5.5, 11)[k], top + 22, r=4.55), (0.03, 0.02, 0.05), segs=6, rings=3), "#fff2a8", False, True)

# ================================================================= BROWN: reading tree with a root bench and a book-swap box
if ID == "brown":
    tx, ty = 22.45, 4.05
    add("bt_trunk", tube(G(tx, ty, 0), G(tx - 0.04, ty, 1.3), 0.2, 0.14, segs=14), WOOD2)
    for k, (a, ln) in enumerate(((200, 0.55), (250, 0.5), (300, 0.5), (340, 0.45), (160, 0.4))):
        ar = math.radians(a)
        add(f"bt_root{k}", tube(G(tx, ty, 0.3), G(tx + math.cos(ar) * ln, ty - math.sin(ar) * ln * 0.7, 0.04), 0.08, 0.045, segs=8), WOOD2, False)
    for k, (c, z, s) in enumerate(((22.45, 1.85, 0.72), (22.13, 1.62, 0.5), (22.75, 1.67, 0.48), (22.45, 2.25, 0.52), (21.95, 1.95, 0.3))):    # crown kept inside the frame (right edge 23.3)
        add(f"bt_leaf{k}", ellipsoid(G(c, ty - 0.1, z), (s, s * 0.62, s * 0.72), segs=16, rings=10), ("#6fae5a", "#86c46c", "#5f9e55", "#86c46c", "#6fae5a")[k])
    add("bt_hi", ellipsoid(G(22.2, ty - 0.55, 2.15), (0.32, 0.15, 0.2), segs=10, rings=6), "#9dd486", False)
    # root bench: a plank seat with its roots curling up into the ends
    bx_, by_ = 22.5, 4.42
    add("bt_seat", box(G(bx_, by_, 0.36), (0.95, D(0.24), 0.07), bevel=0.02), WOOD3)
    for sx in (-1, 1):
        add(f"bt_bl{sx}", tube(G(bx_ + sx * 0.4, by_, 0.0), G(bx_ + sx * 0.36, by_, 0.36), 0.07, 0.05, segs=8), WOOD2)
        add(f"bt_curl{sx}", tube(G(bx_ + sx * 0.5, by_ + 0.02, 0.1), G(bx_ + sx * 0.42, by_ + 0.02, 0.42), 0.05, 0.035, segs=8), WOOD2, False)
    # book-swap box: a post with a little house-shaped cupboard of colourful books
    sx_, sy_ = 22.85, 4.18
    add("bt_post", tube(G(sx_, sy_, 0), G(sx_, sy_, 0.78), 0.045, 0.045, segs=8), WOOD4)
    add("bt_box", box(G(sx_, sy_, 1.0), (0.52, D(0.26), 0.44), bevel=0.02), WOOD)
    add("bt_inner", box(G(sx_, sy_ + 0.17, 1.0), (0.4, 0.03, 0.32)), "#ffe9a0", False, True)
    for k, bc in enumerate(("#6f9fd2", "#ffd36b", "#86c46c", "#b78ae0", "#f7f2e8", "#6f9fd2")):
        add(f"bt_book{k}", box(G(sx_ - 0.14 + k * 0.055, sy_ + 0.19, 0.96 + (0.02 if k % 2 else 0)), (0.045, 0.03, 0.22 + 0.04 * (k % 2))), bc, False)
    add("bt_roof", tube(G(sx_, sy_, 1.22), G(sx_, sy_, 1.42), 0.42, 0.02, segs=4), "#6f8f6a")
    if NIGHT:
        for k, (c, z) in enumerate(((22.12, 1.15), (22.78, 1.1), (22.45, 0.98), (22.9, 1.25))):
            lantern(f"bt_ln{k}", c, ty + 0.3, z, 0.62, True, 0.25)
    else:
        for k, (c, z) in enumerate(((22.25, 1.95), (22.7, 2.1))):          # two little birds in the branches
            add(f"bt_bird{k}", ellipsoid(G(c, ty - 0.45, z), (0.08, 0.06, 0.07), segs=8, rings=5), "#6f9fd2" if k == 0 else "#ffd36b")
            add(f"bt_birdb{k}", ellipsoid(G(c - 0.1, ty - 0.45, z + 0.01), (0.03, 0.02, 0.02), segs=5, rings=3), "#f59a3c", False)

# ================================================================= BROWN/BLACK: dojo window lantern (the Tower glow, rainbow and puddles are 2D layers in make_growth.py)
if ID == "brownblack":
    lx, ly = 187, 352
    add("bb_cord", tube(SC(lx, ly - 18, r=4.5), SC(lx, ly, r=4.5), 0.012, 0.012, segs=4), WOOD4, False)
    add("bb_cap", tube(SC(lx, ly, r=4.5), SC(lx, ly + 6, r=4.5), 0.05, 0.15, segs=10), "#e8b84f", False)
    add("bb_body", ellipsoid(SC(lx, ly + 20, r=4.52), (0.19, 0.19, 0.24), segs=14, rings=8), "#fff2c8", True, NIGHT)
    for k in (-1, 0, 1):
        add(f"bb_rib{k}", tube(SC(lx + k * 6, ly + 8, r=4.55), SC(lx + k * 5, ly + 31, r=4.55), 0.012, 0.012, segs=4), "#e8b84f", False)
    add("bb_base", tube(SC(lx, ly + 34, r=4.5), SC(lx, ly + 38, r=4.5), 0.1, 0.07, segs=10), "#e8b84f", False)
    add("bb_tassel", tube(SC(lx, ly + 38, r=4.5), SC(lx, ly + 48, r=4.5), 0.02, 0.01, segs=4), "#ffcf4a", False)

# ---------------------------------------------------------------- camera (same as the town camera, moved up 0.95 tile = the make_concept SHIFT)
r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = AA.samples; sc.cycles.use_denoising = False
r.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
r.resolution_x, r.resolution_y = round(COLS * PPT), round(ROWS * PPT); r.resolution_percentage = 100
cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = COLS; cd.clip_end = 300
cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
cam.rotation_euler = (math.radians(90 - EL), 0, 0)
from mathutils import Vector, Euler
d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
cam.location = Vector((COLS / 2, -(ROWS / 2 - SHIFT_ROWS) * K, 0)) - d * 60
os.makedirs(AA.out, exist_ok=True)
tag = f"{ID}-{'dusk' if NIGHT else 'day'}"
r.filepath = os.path.join(AA.out, tag + "-color.png"); bpy.ops.render.render(write_still=True)
# ---- the lit mask: this add-on's own lit parts white, everything else black (the holdout town stays transparent)
def em(c):
    m = bpy.data.materials.new("E" + str(c)); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (c, c, c, 1); o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(e.outputs[0], o.inputs[0]); return m
W_, B_ = em(1.0), em(0.0)
for ob in bpy.data.objects:
    if ob.type != "MESH" or ob in BASE_OBJECTS: continue
    if "_outline" in ob.name: ob.hide_render = True; continue
    lit = ob.name.startswith("lit_")
    ob.data.materials.clear(); ob.data.materials.append(W_ if lit else B_)
    for i in range(len(ob.material_slots)): ob.material_slots[i].material = W_ if lit else B_
r.filepath = os.path.join(AA.out, tag + "-lit.png"); bpy.ops.render.render(write_still=True)
print("rendered", tag)
