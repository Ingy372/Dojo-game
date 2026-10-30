"""Dojo Ascent - Action Zone dojo, 3 SAMPLES (outside face, inside main floor, parent seating).
Same house look as the town square: toon_kit materials + outlines, orthographic camera looking north 35 deg down, ground on
the game grid (G(col,row): x = col, y = -row*K, K = 1/sin35, so one ground tile is square on screen). 80 px per tile = @2x.
Likeness references (real photos) are NOT in the repo. Nothing is drawn above the drywall (no ceiling, ducts, beams).
Separate swappable overlay layers (own PNGs, same camera): phone number and house number on the outside face.
    blender -b -P build_action_zone_dojo.py -- --scene outside|inside|seating [--samples 24] [--ppt 80]"""
import bpy, sys, os, math, argparse, glob
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from toon_kit import *
from mathutils import Vector, Euler

ap = argparse.ArgumentParser(); ap.add_argument("--scene", required=True); ap.add_argument("--samples", type=int, default=24)
ap.add_argument("--ppt", type=int, default=80); ap.add_argument("--outdir", default=os.path.join(HERE, ".."))
A = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
EL = 35.0; K = 1 / math.sin(math.radians(EL)); CZ = math.cos(math.radians(EL))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; coll = sc.collection
OUT_M = outline_material(); MATS = {}
def mat(h):
    if h not in MATS: MATS[h] = toon_material("M" + h, h)
    return MATS[h]
LAYER = [None]          # objects made while LAYER[0] is set belong to that overlay layer
def add(name, bm, hexc, outline=True, ow=1.6):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat(hexc))
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob)
    for p in me.polygons: p.use_smooth = False
    ob["layer"] = LAYER[0] or ""
    if outline:
        h = add_hull(ob, coll, OUT_M, OUTLINE_W * ow); h["layer"] = LAYER[0] or ""
    return ob
def G(c, r, z=0.0): return (c, -r * K, z)
def D(rows): return rows * K
def B(cx, r, z, w, d, h, hexc, outline=True, rot=(0, 0, 0), bevel=0.0, name="b"):
    """a box centred at column cx, ground row r, height z; w across, d in ground rows, h tall"""
    return add(name, box(G(cx, r, z), (w, D(d), h), rot=rot, bevel=bevel), hexc, outline)
def E(cx, r, z, sx, sr, sz, hexc, outline=True, segs=12, rings=8, rot=(0, 0, 0), name="e"):
    return add(name, ellipsoid(G(cx, r, z), (sx, D(sr), sz), rot=rot, segs=segs, rings=rings), hexc, outline)
def T(cx, r, z0, z1, r0, r1, hexc, outline=True, segs=12, name="t", round_ground=False):
    return add(name, tube(G(cx, r, z0), G(cx, r, z1), r0, r1, segs=segs, sy=K if round_ground else 1.0), hexc, outline)

FONT_BLACK = None
for p in ("/usr/share/fonts/truetype/sand-box/google/Be Vietnam Pro/BeVietnamPro-Black.ttf",
          "/usr/share/fonts/truetype/sand-box/google/Blinker/Blinker-ExtraBold.ttf"):
    if os.path.exists(p): FONT_BLACK = bpy.data.fonts.load(p); break      # (OFL fonts; falls back to Blender's default)
def text(name, s, cx, r, z, height, width, hexc, extr=0.04, outline=True, font=None, bevel=0.0):
    """3D sign letters standing on a wall that faces the camera. height/width = target size in tiles."""
    cu = bpy.data.curves.new(name, "FONT"); cu.body = s; cu.size = 1.0; cu.extrude = extr; cu.align_x = "CENTER"; cu.align_y = "CENTER"
    if font or FONT_BLACK: cu.font = font or FONT_BLACK
    ob = bpy.data.objects.new(name, cu); coll.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    bpy.ops.object.convert(target="MESH")
    ob = bpy.context.view_layer.objects.active
    xs = [v.co.x for v in ob.data.vertices]; zs = [v.co.y for v in ob.data.vertices]
    sx = width / max(max(xs) - min(xs), 1e-6); sz = height / max(max(zs) - min(zs), 1e-6)
    for v in ob.data.vertices: v.co.x = (v.co.x - (max(xs) + min(xs)) / 2) * sx; v.co.y = (v.co.y - (max(zs) + min(zs)) / 2) * sz
    ob.rotation_euler = (math.radians(90), 0, 0); ob.location = G(cx, r, z)
    ob.data.materials.clear(); ob.data.materials.append(mat(hexc))
    ob["layer"] = LAYER[0] or ""; ob.select_set(False); bpy.context.view_layer.update()
    if outline:
        h = add_hull(ob, coll, OUT_M, OUTLINE_W * 1.2); h["layer"] = LAYER[0] or ""
    return ob

def gable_prism(name, x0, x1, rf, rb, ze, zr, hexc):
    """the building body: a pentagon (front gable) extruded back from row rf to row rb"""
    import bmesh as BM
    bm = BM.new(); xm = (x0 + x1) / 2
    pts = [(x0, 0.0), (x1, 0.0), (x1, ze), (xm, zr), (x0, ze)]
    f = [bm.verts.new((x, -rf * K, z)) for x, z in pts]; b = [bm.verts.new((x, -rb * K, z)) for x, z in pts]
    bm.faces.new(f[::-1]); bm.faces.new(b)
    for i in range(5): bm.faces.new((f[i], f[(i + 1) % 5], b[(i + 1) % 5], b[i])[::-1] if False else (f[i], b[i], b[(i + 1) % 5], f[(i + 1) % 5]))
    BM.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return add(name, bm, hexc)

def finish_and_render(frame_cols, frame_rows, cx, rc, names_out, layers=()):
    """camera centred on column cx and ground row rc (at z=0); render the base picture and then each overlay layer"""
    r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = A.samples; sc.cycles.use_denoising = False
    r.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
    r.resolution_x, r.resolution_y = round(frame_cols * A.ppt), round(frame_rows * A.ppt); r.resolution_percentage = 100
    cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = frame_cols; cd.clip_end = 300
    cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
    cam.rotation_euler = (math.radians(90 - EL), 0, 0)
    d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
    cam.location = Vector((cx, -rc * K, 0)) - d * 60
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, f"action-zone-{A.scene}.blend"), compress=True)
    def show(pred):
        for o in bpy.data.objects:
            if o.type == "MESH": o.hide_render = not pred(o.get("layer", ""))
    show(lambda l: l == "")
    r.filepath = os.path.join(A.outdir, "samples", names_out); bpy.ops.render.render(write_still=True)
    for L in layers:
        show(lambda l, L=L: l == L)
        r.filepath = os.path.join(A.outdir, "overlays", f"{A.scene}-{L}-layer@2x.png"); bpy.ops.render.render(write_still=True)
    show(lambda l: True)

# =====================================================================================================================
def scene_outside():
    CX = 7.0                                    # door centre column
    X0, X1, RF, RB, ZE, ZR = 3.0, 11.0, 6.0, 4.3, 2.4, 4.3      # building: columns, front row, back row, eave, ridge
    TAN, TANR, BROWN, DOOR = "#cdb088", "#b9966b", "#5b4234", "#6a4a3c"
    # ---------------- ground
    B(CX, 5.2, -0.06, 18, 5.4, 0.1, "#7fbf6f", False, name="grass")
    B(CX, 8.9, -0.07, 18, 2.0, 0.1, "#c4bfb3", False, name="gravel")
    import random; rnd = random.Random(7)
    for k in range(220):
        E(rnd.uniform(-1.8, 15.8), rnd.uniform(8.0, 9.6), 0.0, 0.07, 0.04, 0.025, rnd.choice(("#a9a498", "#d9d4c8", "#b9b4a8", "#8f8a80")), False, 6, 4, name=f"pb{k}")
    B(CX, 6.45, 0.02, 7.6, 0.9, 0.06, "#d9d4c8", False, name="pad")                 # concrete pad along the front
    B(CX, 7.45, 0.02, 1.5, 1.2, 0.06, "#d9d4c8", False, name="walk")
    B(CX, 8.0, 0.015, 1.9, 0.14, 0.05, "#c9c3b6", False, name="walkend")
    for k, (x0, x1) in enumerate(((0.2, 5.4), (8.6, 13.8))):                       # parking curb stops, yellow ends on black
        B((x0 + x1) / 2, 8.4, 0.08, x1 - x0, 0.22, 0.16, "#2f2f35", True, name=f"curb{k}")
        for j in range(4): B(x0 + 0.3 + j * (x1 - x0 - 0.6) / 3, 8.4, 0.17, 0.34, 0.2, 0.03, "#f5d22e", False, name=f"cy{k}{j}")
    # ---------------- the building: tan ribbed metal, brown roof, gable facing us
    gable_prism("body", X0, X1, RF, RB, ZE, ZR, TAN)
    xm = (X0 + X1) / 2; half = (X1 - X0) / 2; slope = math.degrees(math.atan((ZR - ZE) / half)); Ls = math.hypot(half, ZR - ZE) + 0.35
    for sgn, nm in ((-1, "roofL"), (1, "roofR")):
        cxr = xm + sgn * half / 2; czr = (ZE + ZR) / 2 + 0.07
        add(nm, box(G(cxr + sgn * 0.1, (RF + RB) / 2 + 0.02, czr), (Ls, D(RF - RB + 0.35), 0.11), rot=(0, sgn * slope, 0)), BROWN)
        add(nm + "fascia", box(G(cxr + sgn * 0.1, RF + 0.2, czr - 0.02), (Ls, 0.07, 0.17), rot=(0, sgn * slope, 0)), "#46332a")
    for x in (X0, X1): B(x, RF + 0.02, ZE / 2, 0.16, 0.12, ZE, "#46332a", name="corner")        # dark brown corner trim
    for k in range(int((X1 - X0) / 0.3)):                                                        # ribs on the gable end
        x = X0 + 0.2 + k * 0.3; top = ZE + (ZR - ZE) * (1 - abs(x - xm) / half) - 0.12
        B(x, RF + 0.012, top / 2, 0.035, 0.01, top, TANR, False, name=f"rib{k}")
    B(CX, RF + 0.02, 0.06, 8.0, 0.1, 0.12, "#8e8574", True, name="footing")
    # ---------------- doors: brown double doors, two glass panes, silver push bar
    B(CX, RF + 0.04, 0.78, 1.5, 0.08, 1.56, "#46332a", name="doorframe")
    for s, nm in ((-1, "L"), (1, "R")):
        B(CX + s * 0.34, RF + 0.1, 0.74, 0.64, 0.05, 1.46, DOOR, True, name="leaf" + nm)
        B(CX + s * 0.34, RF + 0.13, 1.0, 0.4, 0.03, 0.62, "#8fb4c9", False, name="pane" + nm)
        B(CX + s * 0.34, RF + 0.135, 0.9, 0.4, 0.03, 0.2, "#7ea3b8", False, name="panelow" + nm)
        B(CX + s * 0.34, RF + 0.14, 1.12, 0.17, 0.02, 0.22, "#f6f3ec", False, name="paper" + nm)     # blank paper notices
    B(CX, RF + 0.16, 0.7, 0.55, 0.03, 0.05, "#c8ccd4", False, name="pushbar")
    B(CX, RF + 0.12, 0.05, 1.5, 0.3, 0.04, "#4b4038", True, name="mat")
    # ---------------- two windows (white frames) + small blue accessibility signs and blank notice papers
    for x, nm in ((4.95, "wL"), (9.05, "wR")):
        B(x, RF + 0.05, 1.18, 1.0, 0.07, 0.95, "#f1efe8", name=nm + "frame")
        B(x, RF + 0.1, 1.18, 0.82, 0.04, 0.77, "#6f93ad", False, name=nm + "glass")
        B(x, RF + 0.12, 1.0, 0.82, 0.03, 0.22, "#5b7f99", False, name=nm + "lowglass")
        B(x, RF + 0.13, 1.18, 0.05, 0.03, 0.77, "#f1efe8", False, name=nm + "mull")
        B(x, RF + 0.13, 1.18, 0.82, 0.03, 0.05, "#f1efe8", False, name=nm + "mullh")
        B(x, RF + 0.08, 0.7, 1.08, 0.12, 0.07, "#e7e4dc", True, name=nm + "sill")
    for x, nm in ((3.75, "acL"), (10.25, "acR")):
        B(x, RF + 0.04, 1.15, 0.24, 0.03, 0.3, "#2f6fd6", True, name=nm); E(x, RF + 0.065, 1.2, 0.05, 0.01, 0.05, "#ffffff", False, 8, 4, name=nm + "dot")
    B(3.4, RF + 0.04, 1.35, 0.18, 0.02, 0.22, "#f6f3ec", False, name="notice"); B(10.55, RF + 0.04, 1.3, 0.14, 0.02, 0.2, "#f6f3ec", False, name="notice2")
    B(CX + 1.2, RF + 0.05, 1.05, 0.16, 0.03, 0.2, "#7b8a5a", True, name="boxlight")
    # ---------------- the sign: red 3D letters + the small kick logo (Jay's real branding)
    RED = "#d92b25"
    text("signCMA", "CMA", CX, RF + 0.07, 3.1, 0.46, 1.55, RED, 0.05)
    text("signMA", "MARTIAL ARTS", CX, RF + 0.07, 2.58, 0.30, 4.1, RED, 0.04)
    # kick logo: a small navy badge with a white flying-kick figure (plain shapes, no face)
    lz = 3.74; lr = RF + 0.05
    E(CX, lr, lz, 0.2, 0.03, 0.2, "#27407a", True, 16, 8, name="logo_badge")
    E(CX - 0.01, lr + 0.04, lz - 0.01, 0.1, 0.02, 0.035, "#ffffff", False, 8, 4, rot=(0, -18, 0), name="logo_body")
    E(CX - 0.1, lr + 0.04, lz - 0.05, 0.06, 0.02, 0.022, "#ffffff", False, 8, 4, rot=(0, 25, 0), name="logo_leg")
    E(CX + 0.1, lr + 0.04, lz + 0.05, 0.035, 0.02, 0.035, "#ffffff", False, 8, 6, name="logo_head")
    E(CX + 0.12, lr + 0.04, lz - 0.05, 0.05, 0.02, 0.018, "#ffffff", False, 8, 4, rot=(0, -30, 0), name="logo_arm")
    # banners: a white one (left, the PHONE overlay goes on it) and a blank notice sign (right)
    B(4.95, RF + 0.06, 1.95, 1.4, 0.04, 0.4, "#f6f3ec", True, name="bannerL")
    B(4.95, RF + 0.085, 1.82, 1.34, 0.02, 0.13, "#d92b25", False, name="bannerLred")
    B(9.05, RF + 0.06, 1.95, 1.2, 0.04, 0.4, "#f6f3ec", True, name="bannerR")
    for k in range(3): B(9.0 + 0.1, RF + 0.085, 2.05 - k * 0.1, 0.65, 0.02, 0.035, "#8c8ea0", False, name=f"bannerRbar{k}")
    B(8.62, RF + 0.085, 1.95, 0.26, 0.02, 0.2, "#a8adc2", False, name="bannerRlogo")
    # little brown light fixture on the wall (daylight only; nothing glows)
    B(10.5, RF + 0.1, 2.0, 0.12, 0.14, 0.12, "#3b3430", True, name="wallLamp")
    for x in (X0 + 0.08, X1 - 0.08): B(x, RF + 0.06, ZE / 2, 0.07, 0.07, ZE - 0.1, "#6b5545", False, name="downspout")           # downspouts
    B(11.9, 6.5, 0.28, 0.4, 0.4, 0.56, "#4f6f8a", True, name="bin"); B(11.9, 6.5, 0.6, 0.46, 0.46, 0.06, "#3b4f63", True, name="binLid")   # a small bin
    # ---------------- overlay layers: PHONE and HOUSE NUMBER (own objects, own PNGs)
    LAYER[0] = "phone";   text("phoneNumber", "910-429-2467", 4.95, RF + 0.1, 2.05, 0.1, 1.2, "#25252e", 0.01, False, font=None)
    LAYER[0] = "address"; text("houseNumber", "6105", CX + 0.78, RF + 0.07, 1.78, 0.11, 0.34, "#3b2417", 0.01, False)
    LAYER[0] = None
    B(CX + 0.78, RF + 0.05, 1.78, 0.4, 0.03, 0.2, "#b8662e", True, name="houseplate")             # blank plate, digits are on the layer
    # ---------------- benches, red chairs, flower beds, shrubs, trees
    def bench(cx, rr, w, hexc, slat):
        B(cx, rr, 0.33, w, 0.4, 0.07, hexc, True, name="bseat")
        for x in (-w / 2 + 0.1, w / 2 - 0.1): B(cx + x, rr, 0.16, 0.08, 0.34, 0.32, "#2f2620", False, name="bleg"); B(cx + x, rr - 0.17, 0.46, 0.07, 0.07, 0.62, "#2f2620", False, name="bpost")
        B(cx, rr - 0.17, 0.56, w, 0.06, 0.4, hexc, True, name="bback")
        for k in range(slat): B(cx - w / 2 + 0.12 + k * (w - 0.24) / (slat - 1), rr - 0.14, 0.56, 0.035, 0.02, 0.38, "#2a211c", False, name="bslat")
    bench(4.35, 6.45, 1.7, "#4d3a2f", 7)
    bench(8.75, 6.4, 0.95, "#5a4338", 5)
    for cxr, rr, rot in ((9.85, 6.4, 0), (10.55, 6.6, 8)):                                   # two red metal chairs (branded red)
        for dx, dr in ((-0.17, -0.15), (0.17, -0.15), (-0.17, 0.15), (0.17, 0.15)): T(cxr + dx, rr + dr, 0, 0.36, 0.02, 0.02, RED, False, 6, name="chleg")
        B(cxr, rr, 0.37, 0.46, 0.4, 0.05, RED, True, rot=(0, 0, rot), name="chseat")
        B(cxr, rr - 0.2, 0.62, 0.46, 0.05, 0.42, RED, True, rot=(0, 0, rot), name="chback")
        for k in range(4): B(cxr - 0.15 + k * 0.1, rr - 0.17, 0.62, 0.02, 0.02, 0.34, "#a81f1b", False, rot=(0, 0, rot), name="chbar")
    def bed(cx, rr, w, flowers):
        E(cx, rr, 0.01, w, 0.55, 0.05, "#3a3a40", True, 20, 4, name="bedrim")
        E(cx, rr, 0.04, w - 0.08, 0.5, 0.04, "#7a4a30", False, 20, 4, name="mulch")
        for k in range(5):
            x = cx - w * 0.6 + k * w * 0.3; E(x, rr - 0.05 + 0.1 * (k % 2), 0.2, 0.19, 0.15, 0.19, ("#4f8a4a", "#5f9e55")[k % 2], True, 10, 6, name=f"shr{k}")
        for k, c in enumerate(flowers):
            a = k * 2.399; E(cx + 0.55 * w * math.cos(a) * ((k % 5) / 5 + 0.3), rr + 0.2 * math.sin(a) * ((k % 4) / 4 + 0.4), 0.33 + 0.02 * (k % 3), 0.06, 0.05, 0.06, c, False, 6, 4, name=f"fl{k}")
    FL = ["#ffd36b", "#f0a030", "#ffe48a", "#f5c542", "#f0a030", "#fff0b0", "#ffd36b", "#f5c542", "#f0a030", "#ffe48a", "#ffd36b", "#f5c542", "#fff0b0", "#f0a030"]
    bed(5.7, 7.35, 0.8, FL); bed(8.3, 7.35, 0.8, FL[::-1])
    E(7.0, 7.0, 0.28, 0.32, 0.22, 0.28, "#5f9e55", True, 10, 6, name="shrubC"); E(6.95, 7.05, 0.5, 0.18, 0.13, 0.15, "#7fbf6f", False, 8, 4, name="shrubC2")
    # trees: a palm on the right (soft green fronds) and two round trees behind (like the town square)
    T(12.4, 6.4, 0, 1.5, 0.11, 0.07, "#8a5e38", True, 8, name="palm")
    for k in range(9):
        a = k * 40; E(12.4 + 0.5 * math.cos(math.radians(a)), 6.4 + 0.15 * math.sin(math.radians(a)), 1.6 + 0.12 * (k % 2), 0.55, 0.08, 0.1, "#5f9e55" if k % 2 else "#4f8a4a", True, 8, 4, rot=(0, -20 * math.cos(math.radians(a)), a), name=f"frond{k}")
    for x, rr, s in ((1.2, 4.6, 1.0), (13.0, 4.4, 1.0), (0.6, 6.9, 0.8)):
        T(x, rr, 0, 0.9 * s, 0.12 * s, 0.09 * s, "#7a5232", True, 8, name="trunk"); E(x, rr, 1.35 * s, 0.75 * s, 0.6 * s, 0.7 * s, "#6fae5f", True, 14, 8, name="crown")
    finish_and_render(14.0, 8.9, 7.0, 4.55, "outside-face@2x.png", ("phone", "address"))


# ============================ flat-shape helpers (wall art, floor logo, handprints, silhouettes) ====================
import bmesh as _BM
def _poly(name, pts3, hexc, up):
    bm = _BM.new(); vs = [bm.verts.new(p) for p in pts3]; f = bm.faces.new(vs)
    if f.normal.dot(Vector(up)) < 0: f.normal_flip()
    return add(name, bm, hexc, False)
WF = 3.2                                                  # row of the back wall's face
def wpoly(pts, hexc, lay=0, name="wp"): return _poly(name, [(x, -(WF + 0.06 + 0.02 * lay) * K, z) for x, z in pts], hexc, (0, -1, 0))
def fpoly(pts, z, hexc, name="fp"): return _poly(name, [(x, -r * K, z) for x, r in pts], hexc, (0, 0, 1))
def circ(cx, cy, rad, n=28, sx=1.0, sy=1.0): return [(cx + rad * sx * math.cos(2 * math.pi * i / n), cy + rad * sy * math.sin(2 * math.pi * i / n)) for i in range(n)]
def rect(p0, p1, w):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]; L = math.hypot(dx, dy) or 1e-6; nx, ny = -dy / L * w / 2, dx / L * w / 2
    return [(p0[0] + nx, p0[1] + ny), (p1[0] + nx, p1[1] + ny), (p1[0] - nx, p1[1] - ny), (p0[0] - nx, p0[1] - ny)]
def hand(cx, cy, s, rot=0.0):
    """a plain handprint: palm, four fingers, a thumb. Returns the polygons (list of point lists)."""
    c, sn = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    def T2(p): return (cx + s * (p[0] * c - p[1] * sn), cy + s * (p[0] * sn + p[1] * c))
    parts = [circ(0, 0, 0.11, 16)]
    for fx, fl in ((-0.08, 0.17), (-0.027, 0.21), (0.027, 0.2), (0.08, 0.15)): parts.append(rect((fx, 0.05), (fx, 0.05 + fl), 0.047))
    parts.append(rect((0.08, -0.04), (0.21, 0.07), 0.05))
    return [[T2(p) for p in poly] for poly in parts]
POSES = {   # (u,v) joints, hip at 0,0, head up ~0.65: head, neck, [arm: shoulder->elbow->hand], [leg: hip->knee->foot]
 "kick":  dict(head=(-0.1, 0.66), neck=(-0.08, 0.5), arms=[[(0.2, 0.55), (0.46, 0.62)], [(-0.25, 0.42), (-0.36, 0.2)]], legs=[[(0.34, 0.1), (0.72, 0.32)], [(-0.1, -0.35), (-0.16, -0.72)]]),
 "punch": dict(head=(0.0, 0.66), neck=(0.0, 0.5), arms=[[(0.28, 0.46), (0.56, 0.46)], [(-0.18, 0.36), (-0.1, 0.2)]], legs=[[(0.3, -0.2), (0.38, -0.7)], [(-0.3, -0.2), (-0.38, -0.7)]]),
 "block": dict(head=(0.0, 0.66), neck=(0.0, 0.5), arms=[[(0.22, 0.62), (0.2, 0.88)], [(-0.22, 0.4), (-0.14, 0.22)]], legs=[[(0.28, -0.1), (0.3, -0.7)], [(-0.25, -0.3), (-0.5, -0.7)]]),
 "bow":   dict(head=(0.12, 0.55), neck=(0.06, 0.45), arms=[[(0.12, 0.3), (0.2, 0.15)], [(-0.1, 0.3), (-0.2, 0.15)]], legs=[[(0.05, -0.35), (0.06, -0.72)], [(-0.06, -0.35), (-0.07, -0.72)]]),
}
def figure(pose, ox, oy, s):
    """flat silhouette polygons for a pose, placed with hip at (ox, oy) and scaled by s"""
    P = POSES[pose]; m = lambda p: (ox + s * p[0], oy + s * p[1]); out = [circ(*m(P["head"]), 0.1 * s, 14), rect(m((0, 0)), m(P["neck"]), 0.2 * s)]
    for chain, w in [(([P["neck"]] + a), 0.08) for a in P["arms"]] + [(([(0, 0)] + l), 0.1) for l in P["legs"]]:
        for i in range(len(chain) - 1): out.append(rect(m(chain[i]), m(chain[i + 1]), w * s))
        out.append(circ(*m(chain[-1]), 0.055 * s, 8))
    return out
def Wd(cx, z, w, h, hexc, off=0.04, th=0.05, outline=True, name="wd"): return B(cx, WF + off, z, w, th, h, hexc, outline, name=name)
def wdisc(cx, z, rad, hexc, lay, name="disc"): return wpoly(circ(cx, z, rad, 32), hexc, lay, name)

BELT = {"white": "#f4f1e8", "yellow": "#f5d22e", "orange": "#f08a24", "green": "#3f9c4a", "blue": "#2f6fd6", "purple": "#8a5bd0", "brown": "#7a4a30", "black": "#25252e"}

def scene_inside():
    RED, BLUE, NAVY = "#d92b25", "#2a5db0", "#27407a"
    WALL, WALL2, CAP, FLOORC, SLAB = "#efe9d6", "#35569a", "#d8d2c0", "#cfc9bd", "#8d8678"
    XR = 22.0; H = 3.3; RB, RFT = 3.05, 10.0                    # room is 22 wide; back wall base row; front floor row
    # ---------- the room: a floor slab and drywall only (back wall + two side walls, flat top, nothing above) ----------
    B(XR / 2, (RB + RFT) / 2, -0.15, XR + 0.5, RFT - RB + 0.1, 0.3, SLAB, True, name="floorslab")
    B(XR / 2, (RB + RFT) / 2, 0.01, XR, RFT - RB, 0.04, FLOORC, False, name="floor")
    B(XR / 2, WF - 0.17, H / 2, XR + 0.3, 0.34, H, WALL, True, name="backwall")
    B(XR / 2, WF + 0.015, 0.25, XR, 0.03, 0.5, WALL2, False, name="wainscot")                  # blue wall band
    B(XR / 2, WF + 0.03, 0.51, XR, 0.04, 0.05, "#f4f1e8", False, name="wainscotcap")
    B(XR / 2, WF + 0.03, 0.06, XR, 0.04, 0.12, "#6d6a63", False, name="baseboard")
    for x in (-0.12, XR + 0.12): B(x, (RB + RFT) / 2 - 0.1, H / 2, 0.24, RFT - RB - 0.2, H, WALL, True, name="sidewall")
    B(XR / 2, WF - 0.17, H + 0.04, XR + 0.34, 0.38, 0.1, CAP, True, name="drywallcap")        # the flat top edge of the drywall
    # ---------- floor: mats (blue | red) with a centre logo, white tape, and seams ----------
    MX0, MX1, MR0, MR1 = 5.0, 16.0, 4.4, 9.4; MXM = (MX0 + MX1) / 2
    B((MX0 + MXM) / 2, (MR0 + MR1) / 2, 0.06, MXM - MX0, MR1 - MR0, 0.07, "#2f6fd6", True, name="matB")
    B((MXM + MX1) / 2, (MR0 + MR1) / 2, 0.06, MX1 - MXM, MR1 - MR0, 0.07, RED, True, name="matR")
    for i in range(int(MX0) + 1, int(MX1)):
        fpoly(rect((i, MR0), (i, MR1), 0.03), 0.1, "#1d4aa0" if i < MXM else "#a81f1b", "seam")
    for j in range(int(MR0) + 1, int(MR1) + 1):
        if j < MR1: fpoly(rect((MX0, j), (MXM, j), 0.03), 0.1, "#1d4aa0", "seam"); fpoly(rect((MXM, j), (MX1, j), 0.03), 0.1, "#a81f1b", "seam")
    fpoly(rect((MX0, MR1 - 0.12), (MX1, MR1 - 0.12), 0.07), 0.105, "#f4f1e8", "tape")
    fpoly(rect((MXM, MR0), (MXM, MR1), 0.07), 0.105, "#f4f1e8", "tape")
    LX, LR = MXM, (MR0 + MR1) / 2 - 0.1                                                      # centre logo
    fpoly(circ(LX, LR, 1.85, 40), 0.115, "#f4f1e8", "logoRing"); fpoly(circ(LX, LR, 1.65, 40), 0.12, NAVY, "logoDisc")
    fpoly(circ(LX, LR, 1.38, 40), 0.125, "#f4f1e8", "logoRing2"); fpoly(circ(LX, LR, 1.3, 40), 0.13, NAVY, "logoDisc2")
    for poly_ in figure("kick", LX, LR + 0.05, 1.05): fpoly([(u, LR + 0.05 - (v - (LR + 0.05))) if False else (u, 2 * (LR + 0.05) - v) for u, v in poly_], 0.14, "#f4f1e8", "logoFig")
    for i in range(1, 22):
        fpoly(rect((i, MR0 - 1.35), (i, RFT - 0.05), 0.02), 0.045, "#bdb7aa", "tileSeam")
    for j in range(4, 10):
        fpoly(rect((0.05, j), (XR - 0.05, j), 0.02), 0.045, "#bdb7aa", "tileSeam")
    # ---------- back wall, left to right ----------
    # PRO SHOP: wall shelves with gear, a glass counter, a blank sign bar (items are plain shapes)
    Wd(2.55, 3.0, 4.0, 0.32, "#27407a", name="proSign"); Wd(0.95, 3.0, 0.5, 0.2, "#f4f1e8", 0.07, 0.03, False, name="proSignGlove")
    for z in (1.15, 1.85, 2.5): B(2.55, WF + 0.17, z, 3.9, 0.32, 0.07, "#7a4a30", True, name="shelf")
    for x in (0.7, 4.4): B(x, WF + 0.1, 1.85, 0.08, 0.18, 1.9, "#5b4234", True, name="shelfpost")
    GLV = ["#2f6fd6", "#f5c542", "#3f9c4a", "#f08a24", "#8a5bd0", "#2bb3b3", "#ee7fb0"]
    for k in range(7):                                                            # gloves on the top shelf
        x = 0.95 + k * 0.5; E(x, WF + 0.22, 2.7, 0.15, 0.1, 0.17, GLV[k], True, 10, 6, name="glove"); E(x + 0.14, WF + 0.22, 2.64, 0.07, 0.07, 0.07, GLV[k], False, 8, 4, name="gloveThumb")
    for k in range(5):                                                            # kick pads and folded uniforms on the middle shelf
        x = 1.0 + k * 0.72; B(x, WF + 0.22, 2.0, 0.45, 0.14, 0.34, GLV[(k + 2) % 7], True, name="pad"); B(x, WF + 0.3, 2.0, 0.2, 0.02, 0.2, "#ffffff", False, name="padTarget")
    for k in range(5):
        x = 1.0 + k * 0.7; B(x, WF + 0.22, 1.37, 0.5, 0.18, 0.2, "#f4f1e8", True, name="gi"); B(x, WF + 0.33, 1.37, 0.52, 0.02, 0.05, list(BELT.values())[(k + 1) % 7], False, name="giBelt")
    for k in range(6): E(0.95 + k * 0.62, WF + 0.22, 0.97, 0.12, 0.1, 0.1, "#2c2c33", True, 8, 6, name="head"); 
    # counter: a white cabinet with a glass-top case showing belts, and a small register
    B(2.6, 4.45, 0.42, 3.6, 0.9, 0.84, "#f4f1e8", True, name="counter"); B(2.6, 4.9, 0.42, 3.4, 0.03, 0.7, "#c9d3e0", False, name="counterFront")
    B(2.6, 4.45, 1.0, 3.6, 0.9, 0.46, "#b8dcee", True, name="glassCase"); B(2.6, 4.45, 1.28, 3.7, 0.95, 0.07, "#f4f1e8", True, name="caseTop")
    for k, c in enumerate(list(BELT.values())[:7]): B(1.35 + k * 0.35, 4.85, 1.03, 0.28, 0.03, 0.2, c, False, name="beltInCase")
    B(3.8, 4.35, 1.5, 0.45, 0.35, 0.22, "#3a3a45", True, name="register"); B(3.8, 4.35, 1.74, 0.4, 0.12, 0.2, "#8c8ea0", True, rot=(-20, 0, 0), name="registerScreen")
    for k, (x, c) in enumerate(((1.4, "#ffd36b"), (1.95, "#ffd36b"))):               # two small trophies on the counter
        T(x, 4.45, 1.32, 1.5, 0.07, 0.03, c, True, 8, name="trophyStem"); E(x, 4.45, 1.65, 0.11, 0.07, 0.14, c, True, 10, 6, name="trophyCup"); B(x, 4.45, 1.31, 0.2, 0.15, 0.05, "#7a4a30", True, name="trophyBase")
    # BELT-CREED BOARDS: two navy boards of belt-colour bars with blank text lines
    for bi, (x, belts) in enumerate(((5.35, ("white", "yellow", "orange", "green")), (6.35, ("blue", "purple", "brown", "black")))):
        Wd(x, 1.8, 0.85, 1.9, "#23304f", 0.04, 0.05, True, name=f"beltBoard{bi}"); Wd(x, 2.72, 0.7, 0.07, "#ffd36b", 0.08, 0.02, False, name="beltBoardHead")
        for k, b in enumerate(belts):
            z = 2.35 - k * 0.43; Wd(x, z, 0.7, 0.1, BELT[b], 0.08, 0.02, False, name="beltBar")
            for j in range(2): Wd(x + 0.04, z - 0.13 - j * 0.07, 0.56 - 0.1 * j, 0.03, "#8c93b0", 0.08, 0.02, False, name="beltLine")
    # CLASS CREED SIGN: wood frame, blue board, gold header, blank lines
    Wd(7.9, 1.85, 1.95, 2.1, "#7a4a30", 0.04, 0.07, True, name="creedFrame"); Wd(7.9, 1.85, 1.75, 1.9, "#2a4a8a", 0.09, 0.03, False, name="creedBoard")
    Wd(7.9, 2.6, 1.3, 0.2, "#ffd36b", 0.11, 0.02, False, name="creedHeader")
    for k in range(7): Wd(7.9, 2.28 - k * 0.2, 1.45 - 0.2 * (k % 3), 0.045, "#e9ecf8", 0.11, 0.02, False, name="creedLine")
    for x in (7.05, 8.75): E(x, WF + 0.12, 2.82, 0.05, 0.02, 0.05, "#ffd36b", False, 6, 4, name="creedStar")
    # HANGING GRIP ROPES: a short wood rail at the top of the drywall, ropes with knots hanging in front of the wall
    B(10.65, WF + 0.3, 3.1, 3.0, 0.18, 0.14, "#7a4a30", True, name="ropeRail")
    for x in (9.4, 11.9): B(x, WF + 0.12, 3.1, 0.1, 0.22, 0.2, "#5b4234", False, name="ropeBracket")
    for k in range(8):
        x = 9.4 + 0.33 + k * 0.33; zb = 1.1 + 0.15 * (k % 3); T(x, WF + 0.32, zb, 3.03, 0.035, 0.035, "#d9c08a", False, 6, name="rope")
        for q in range(4): E(x, WF + 0.32, zb + 0.18 + q * 0.5, 0.06, 0.05, 0.06, "#c9a86a", False, 6, 4, name="knot")
        E(x, WF + 0.32, zb, 0.07, 0.06, 0.07, "#7a4a30", False, 8, 4, name="ropeEnd")
    # TARGET WALL: a yellow painted section with a big round target and two blue mitt targets
    TX = 14.0; Wd(TX, H / 2 - 0.05, 3.1, H - 0.1, "#f5c542", 0.025, 0.04, True, name="targetWall")
    for rad, c, l in ((1.12, "#25252e", 0), (0.92, "#f4f1e8", 1), (0.72, "#25252e", 2), (0.5, "#f4f1e8", 3), (0.3, "#f08a24", 4)): wdisc(TX, 1.85, rad, c, l, "target")
    for x in (TX - 1.18, TX + 1.18): wdisc(x, 0.95, 0.27, "#2f6fd6", 1, "mitt"); wdisc(x, 0.95, 0.15, "#f4f1e8", 2, "mittRing")
    Wd(TX, 3.12, 3.1, 0.12, "#25252e", 0.05, 0.03, False, name="targetStripe")
    # MARTIAL-STYLES MURAL: four coloured panels with plain navy silhouettes (poses only, no faces)
    MXC = 17.75; Wd(MXC, 1.65, 3.7, 1.85, "#7a4a30", 0.035, 0.06, True, name="muralFrame")
    for k, (c, pose) in enumerate((("#ffd36b", "kick"), ("#8ec6ff", "punch"), ("#f2a65a", "block"), ("#7fd1b9", "bow"))):
        x = MXC - 1.38 + k * 0.92; Wd(x, 1.65, 0.86, 1.72, c, 0.075, 0.02, False, name="muralPanel")
        for poly_ in figure(pose, x, 1.45, 0.95): wpoly(poly_, "#1f2a4a", 4, "muralFig")
    # PAINTINGS above the mural (stylised landscapes): sky, hills, sun
    for k, (x, w) in enumerate(((16.6, 1.25), (18.95, 1.0))):
        Wd(x, 2.98, w, 0.5, "#5b4234", 0.035, 0.05, True, name="paintFrame"); Wd(x, 2.98, w - 0.1, 0.4, "#8ec6ff", 0.075, 0.02, False, name="paintSky")
        wpoly(circ(x - 0.1 * w + 0.3, 3.05, 0.1, 14), "#ffd36b", 6, "paintSun"); wpoly([(x - w / 2 + 0.05, 2.78), (x, 3.08), (x + w / 2 - 0.05, 2.78)], "#6fae5f", 6, "paintHill")
    # TROPHY SHELF + PHOTO FRAMES (stylised, no faces) + FLAG
    B(20.9, WF + 0.2, 1.3, 1.5, 0.28, 0.07, "#7a4a30", True, name="trophyShelf")
    for k, x in enumerate((20.35, 20.75, 21.15, 21.5)):
        h = 0.3 + 0.07 * (k % 2); T(x, WF + 0.2, 1.34, 1.34 + h * 0.5, 0.05, 0.025, "#ffd36b", True, 8, name="troStem"); E(x, WF + 0.2, 1.38 + h, 0.1, 0.07, 0.1 + 0.02 * (k % 2), "#ffd36b", True, 10, 6, name="troCup")
    for k, (x, z) in enumerate(((20.4, 2.15), (21.2, 2.15), (20.4, 2.85), (21.2, 2.85))):
        Wd(x, z, 0.6, 0.55, "#5b4234", 0.035, 0.05, True, name="photoFrame"); Wd(x, z, 0.5, 0.45, ("#8ec6ff", "#ffd36b", "#7fd1b9", "#f2a65a")[k], 0.075, 0.02, False, name="photoPic")
        wpoly(circ(x - 0.05, z + 0.02, 0.07, 10), "#ffe3c4", 5, "photoHead"); wpoly([(x - 0.17, z - 0.2), (x - 0.05, z - 0.04), (x + 0.07, z - 0.2)], "#27407a", 5, "photoBody")
    # flag on a floor stand beside the target wall, stripes + blue canton with plain star dots
    FX = 15.72; T(FX, WF + 0.5, 0, 3.15, 0.045, 0.035, "#c8ccd4", True, 8, name="flagPole"); T(FX, WF + 0.5, 0, 0.08, 0.26, 0.26, "#3a3a45", True, 12, name="flagBase", round_ground=True)
    E(FX, WF + 0.5, 3.17, 0.06, 0.04, 0.06, "#ffd36b", True, 8, 6, name="flagFinial")
    for k in range(7): B(FX - 0.55, WF + 0.5, 3.0 - k * 0.1, 1.05, 0.02, 0.1, "#d92b25" if k % 2 == 0 else "#f6f3ec", k % 2 == 0, name="flagStripe")
    B(FX - 0.28, WF + 0.52, 2.8, 0.5, 0.025, 0.4, "#27407a", True, name="flagCanton")
    for a in range(3):
        for b in range(2): E(FX - 0.4 + a * 0.12, WF + 0.54, 2.72 + b * 0.16, 0.022, 0.01, 0.022, "#ffffff", False, 5, 3, name="flagStar")
    # ---------- HANDPRINT WALL: a freestanding painted partition with plain colourful handprints (no names) ----------
    PX, PR, PW, PH = 18.9, 6.0, 4.2, 2.2
    for x in (PX - PW / 2 - 0.05, PX + PW / 2 + 0.05): B(x, PR, PH / 2, 0.14, 0.3, PH, "#5b4234", True, name="panelPost")
    B(PX, PR, PH / 2, PW, 0.12, PH, "#f4f1e8", True, name="panel"); B(PX, PR + 0.07, PH + 0.04, PW + 0.3, 0.3, 0.1, "#7a4a30", True, name="panelCap")
    B(PX, PR + 0.07, 0.07, PW + 0.2, 0.3, 0.14, "#7a4a30", True, name="panelBase")
    def ppoly(pts, hexc, lay): return _poly("hp", [(x, -(PR + 0.075 + 0.006 * lay) * K, z) for x, z in pts], hexc, (0, -1, 0))
    HC = ["#2f6fd6", "#f5c542", "#3f9c4a", "#f08a24", "#8a5bd0", "#2bb3b3", "#ee7fb0"]
    for rw in range(3):
        for cl in range(7):
            x = PX - PW / 2 + 0.38 + cl * ((PW - 0.76) / 6) + (0.12 if rw == 1 else 0); z = 0.62 + rw * 0.58
            if rw == 1 and cl == 6: continue
            for poly_ in hand(x, z, 1.25, ((cl * 37 + rw * 23) % 30) - 15): ppoly(poly_, HC[(cl + rw * 3) % 7], 1)
    # ---------- floor props: shoe cubbies + a low bench by the door side, a water cooler, a mat bag ----------
    B(1.1, 8.2, 0.3, 1.9, 0.6, 0.6, "#7a4a30", True, name="cubbies"); 
    for k in range(4): B(0.5 + k * 0.4, 8.52, 0.3, 0.3, 0.03, 0.4, "#4a3226", False, name="cubbyHole"); E(0.5 + k * 0.4, 8.5, 0.12, 0.1, 0.05, 0.05, GLV[k], False, 6, 4, name="shoe")
    B(2.6, 9.2, 0.25, 1.8, 0.5, 0.1, "#9aa0b0", True, name="bench"); 
    for x in (1.85, 3.35): B(x, 9.2, 0.12, 0.12, 0.4, 0.24, "#5b5f6e", False, name="benchLeg")
    B(4.1, 4.15, 0.45, 0.5, 0.45, 0.9, "#c8ccd4", True, name="cooler"); B(4.1, 4.15, 1.05, 0.38, 0.38, 0.35, "#8ec6ff", True, name="coolerJug"); E(4.1, 4.15, 1.3, 0.19, 0.19, 0.08, "#8ec6ff", False, 10, 4, name="coolerJugTop")
    for k, (x, r, c) in enumerate(((17.4, 8.4, "#2f6fd6"), (18.9, 8.8, "#f5c542"), (20.3, 8.4, "#3f9c4a"))):      # three kicking-bag stands (soft, no scary faces)
        T(x, r, 0, 0.1, 0.4, 0.4, "#3a3a45", True, 14, name="bagBase", round_ground=True); T(x, r, 0.1, 1.5, 0.3, 0.3, c, True, 14, name="bag"); E(x, r, 1.5, 0.3, 0.3 / 1.0, 0.16, c, True, 14, 6, name="bagTop"); B(x, r - 0.02, 1.0, 0.4, 0.02, 0.18, "#f4f1e8", False, name="bagStripe")
    # sky/lighting: daylight only (no glows)
    finish_and_render(23.0, 10.4, 11.0, 5.15, "inside-main-floor@2x.png")


def scene_seating():
    RED, BLUE = "#d92b25", "#2a5db0"
    XR, H = 12.0, 3.1; WALL, WALL2, CAP, SLAB = "#efe9d6", "#35569a", "#d8d2c0", "#8d8678"
    CX = XR / 2
    B(CX, 6.1, -0.15, XR + 0.5, 6.6, 0.3, SLAB, True, name="floorslab"); B(CX, 6.1, 0.01, XR, 6.5, 0.04, "#9aa0b0", False, name="carpet")
    B(CX, WF - 0.17, H / 2, XR + 0.3, 0.34, H, WALL, True, name="backwall"); B(CX, WF + 0.015, 0.3, XR, 0.03, 0.6, WALL2, False, name="wainscot")
    B(CX, WF + 0.03, 0.62, XR, 0.04, 0.05, "#f4f1e8", False, name="wainscotcap"); B(CX, WF + 0.03, 0.06, XR, 0.04, 0.12, "#6d6a63", False, name="baseboard")
    for x in (-0.12, XR + 0.12): B(x, 6.0, H / 2, 0.24, 6.4, H, WALL, True, name="sidewall")
    B(CX, WF - 0.17, H + 0.04, XR + 0.34, 0.38, 0.1, CAP, True, name="drywallcap")
    # wall decor above the seats: stylised paintings, a plain round clock (no numbers) and a photo shelf
    for k, (x, c) in enumerate(((2.3, "#8ec6ff"), (3.7, "#ffd36b"), (8.3, "#7fd1b9"), (9.7, "#f2a65a"))):
        Wd(x, 2.55, 1.0, 0.8, "#5b4234", 0.035, 0.05, True, name="frame"); Wd(x, 2.55, 0.86, 0.66, c, 0.075, 0.02, False, name="pic")
        wpoly([(x - 0.4, 2.3), (x - 0.05, 2.65), (x + 0.4, 2.3)], "#6fae5f", 2, "hill"); wpoly(circ(x + 0.22, 2.75, 0.09, 12), "#ffffff", 3, "cloud")
    wdisc(CX, 2.55, 0.42, "#5b4234", 0, "clockRim"); wdisc(CX, 2.55, 0.35, "#f4f1e8", 1, "clockFace")
    for a in range(12): wdisc(CX + 0.29 * math.sin(a * math.pi / 6), 2.55 + 0.29 * math.cos(a * math.pi / 6), 0.025, "#25252e", 2, "tick")
    wpoly(rect((CX, 2.55), (CX, 2.8), 0.04), "#25252e", 3, "hand1"); wpoly(rect((CX, 2.55), (CX + 0.17, 2.5), 0.04), "#25252e", 3, "hand2")
    # three stadium tiers (back is highest): carpeted steps with white riser stripes
    X0, X1 = 2.0, 10.0; tiers = [(4.7, 1.5, 1.35), (6.2, 1.5, 0.9), (7.7, 1.5, 0.45)]      # (front row, depth, top z)
    for ti, (rf, dp, zt) in enumerate(tiers):
        B((X0 + X1) / 2, rf - dp / 2 + 0.0, zt / 2, X1 - X0, dp, zt, "#4a5470", True, name=f"deck{ti}")
        B((X0 + X1) / 2, rf + 0.0, zt - 0.1, X1 - X0, 0.03, 0.05, "#f4f1e8", False, name=f"riserStripe{ti}")
        B((X0 + X1) / 2, rf - dp / 2, zt + 0.01, X1 - X0, dp - 0.05, 0.03, "#5a6685", False, name=f"deckTop{ti}")
    NS = 8; pitch = (X1 - X0 - 0.6) / NS
    for ti, (rf, dp, zt) in enumerate(tiers):
        rs = rf - dp / 2 + 0.05                                                         # the seat row sits mid-tier
        for k in range(NS):
            x = X0 + 0.3 + pitch * (k + 0.5); c = RED if (k + ti) % 2 == 0 else BLUE
            dk = "#a81f1b" if c == RED else "#1d4aa0"
            B(x, rs, zt + 0.17, pitch - 0.08, 0.5, 0.32, c, True, bevel=0.03, name="seat")                 # the cushion block
            B(x, rs + 0.23, zt + 0.37, pitch - 0.1, 0.07, 0.07, dk, False, name="seatEdge")
            B(x, rs - 0.2, zt + 0.55, pitch - 0.08, 0.1, 0.62, c, True, bevel=0.03, name="seatBack")        # the back rest
            B(x, rs - 0.14, zt + 0.5, pitch - 0.3, 0.02, 0.38, dk, False, name="seatBackInset")
            B(x, rs, zt + 0.02, 0.1, 0.3, 0.05, "#2c2c33", False, name="seatFoot")
        for k in range(NS + 1):
            x = X0 + 0.3 + pitch * k; B(x, rs, zt + 0.42, 0.045, 0.45, 0.04, "#2c2c33", True, name="armrest"); B(x, rs, zt + 0.22, 0.04, 0.04, 0.4, "#2c2c33", False, name="armpost")
    # front handrail along the lowest tier (stairs/rail like the real stands) and side steps
    for x in [X0 + 0.15 + k * (X1 - X0 - 0.3) / 6 for k in range(7)]: B(x, 8.1, 0.35, 0.06, 0.06, 0.7, "#c8ccd4", True, name="railPost")
    B(CX, 8.1, 0.72, X1 - X0, 0.07, 0.07, "#c8ccd4", True, name="railTop"); B(CX, 8.1, 0.42, X1 - X0, 0.04, 0.04, "#c8ccd4", False, name="railMid")
    for k, (rf, dp, zt) in enumerate(tiers): B(X1 + 0.55, rf - dp / 2, zt / 2, 0.8, dp, zt, "#6a7694", True, name=f"step{k}"); B(X1 + 0.55, rf, zt - 0.08, 0.8, 0.03, 0.05, "#f4f1e8", False, name=f"stepStripe{k}")
    for k, (rf, dp, zt) in enumerate(tiers): B(X0 - 0.55, rf - dp / 2, zt / 2, 0.8, dp, zt, "#6a7694", True, name=f"stepL{k}"); B(X0 - 0.55, rf, zt - 0.08, 0.8, 0.03, 0.05, "#f4f1e8", False, name=f"stepLStripe{k}")
    # little life: a sports bag on a seat, a water bottle on the step, a jacket over a seat back, a book (plain shapes)
    sx = lambda k: X0 + 0.3 + pitch * (k + 0.5); rsw = lambda ti: tiers[ti][0] - tiers[ti][1] / 2 + 0.05
    B(sx(1), rsw(2), tiers[2][2] + 0.33 + 0.12, 0.42, 0.32, 0.24, "#f5c542", True, bevel=0.04, name="bag"); B(sx(1), rsw(2), tiers[2][2] + 0.47, 0.3, 0.05, 0.03, "#27407a", False, name="bagStrap")
    T(X0 - 0.55, rsw(2), tiers[2][2], tiers[2][2] + 0.3, 0.05, 0.05, "#8ec6ff", True, 8, name="bottle"); T(X0 - 0.55, rsw(2), tiers[2][2] + 0.3, tiers[2][2] + 0.36, 0.025, 0.025, "#f4f1e8", False, 6, name="bottleCap")
    E(sx(3), rsw(1) - 0.2, tiers[1][2] + 0.95, 0.3, 0.14, 0.14, "#7fd1b9", True, 10, 6, name="jacket")
    B(sx(6), rsw(0), tiers[0][2] + 0.35, 0.26, 0.2, 0.05, "#ee7fb0", True, name="book")
    # floor: a welcome mat and a toy basket by the steps
    B(CX, 8.9, 0.04, 2.4, 0.7, 0.04, "#4a5470", True, name="mat"); B(CX, 8.9, 0.07, 2.2, 0.5, 0.02, "#f4f1e8", False, name="matInner")
    T(X0 - 1.35, 8.3, 0, 0.5, 0.3, 0.38, "#c9a86a", True, 14, name="basket", round_ground=True)
    for k, c in enumerate(("#2f6fd6", "#f5c542", "#3f9c4a", "#ee7fb0")): E(X0 - 1.4 + 0.13 * k, 8.3, 0.55, 0.11, 0.1, 0.11, c, True, 8, 6, name="toyball")
    finish_and_render(12.6, 9.2, CX, 5.0, "parent-seating@2x.png")

if A.scene == "outside": scene_outside()
elif A.scene == "inside": scene_inside()
elif A.scene == "seating": scene_seating()
