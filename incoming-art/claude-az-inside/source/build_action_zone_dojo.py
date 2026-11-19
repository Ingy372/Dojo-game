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
ap.add_argument("--ppt", type=int, default=80); ap.add_argument("--game", default=None, help="render the game-art groups (one full-frame PNG per group) into this folder instead of the sample"); ap.add_argument("--ow-mult", type=float, default=1.0, help="outline width multiplier (the town-slot building keeps the town square line weight)"); ap.add_argument("--dusk", action="store_true", help="outside, game mode: add the wall-lamp lens (the one light that is not drawn in the approved daylight sample)"); ap.add_argument("--slot", action="store_true", help="outside: only the building and what sits against it (town-square dojo slot)"); ap.add_argument("--outdir", default=os.path.join(HERE, ".."))
A = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
EL = 35.0; K = 1 / math.sin(math.radians(EL)); CZ = math.cos(math.radians(EL))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; coll = sc.collection
OUT_M = outline_material(); MATS = {}
def mat(h):
    if h not in MATS: MATS[h] = toon_material("M" + h, h)
    return MATS[h]
LAYER = [None]          # objects made while LAYER[0] is set belong to that overlay layer
GRP = [None]            # game-art group: grp("name") tags every object made since the last call with the PREVIOUS group name, then switches. Tags only, the sample render is unchanged.
def grp(name):
    for o in bpy.data.objects:
        if o.type == "MESH" and "grp" not in o: o["grp"] = GRP[0] or "floor"
    GRP[0] = name
FG = [None]            # foreground-sprite tag: objects made while FG[0] is set also get an extra render of just themselves (holdout = everything else), see render_game
def add(name, bm, hexc, outline=True, ow=1.6):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat(hexc))
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob)
    for p in me.polygons: p.use_smooth = False
    ob["layer"] = LAYER[0] or ""
    if FG[0]: ob["fg"] = FG[0]
    if outline:
        h = add_hull(ob, coll, OUT_M, OUTLINE_W * ow * A.ow_mult); h["layer"] = LAYER[0] or ""
        if FG[0]: h["fg"] = FG[0]
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
for p in ("C:/Windows/Fonts/ariblk.ttf", "/usr/share/fonts/truetype/sand-box/google/Be Vietnam Pro/BeVietnamPro-Black.ttf",
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
        h = add_hull(ob, coll, OUT_M, OUTLINE_W * 1.2 * A.ow_mult); h["layer"] = LAYER[0] or ""
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

def _camera(frame_cols, frame_rows, cx, rc):
    """render settings + the orthographic camera, centred on column cx and ground row rc (at z=0)"""
    r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = A.samples; sc.cycles.use_denoising = False
    r.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
    r.resolution_x, r.resolution_y = round(frame_cols * A.ppt), round(frame_rows * A.ppt); r.resolution_percentage = 100
    cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = frame_cols; cd.clip_end = 300
    cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
    cam.rotation_euler = (math.radians(90 - EL), 0, 0)
    d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
    cam.location = Vector((cx, -rc * K, 0)) - d * 60
    return r
def render_game(frame_cols, frame_rows, cx, rc, lit_names=()):
    """game-art mode: one full-frame transparent PNG per group (grp tag), each rendered ALONE (no holdouts, so every sprite is complete
    behind whatever is in front of it); then, for the groups that own lit parts, a white-on-alpha mask of just those parts
    (everything else is a holdout, so a lit pane that is half hidden is masked the same way). Overlay-layer objects get their own PNG."""
    r = _camera(frame_cols, frame_rows, cx, rc); os.makedirs(A.game, exist_ok=True)
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    grpname = lambda o: ("overlay-" + o["layer"]) if o.get("layer") else o.get("grp", "floor")
    names = sorted({grpname(o) for o in meshes}); base = lambda o: o.name[:-8] if o.name.endswith("_outline") else o.name
    islit = lambda o: base(o).split(".")[0] in lit_names and not o.name.endswith("_outline")
    for o in meshes: o.is_holdout = False
    GROUND = ("floor", "ground")                    # the ground group is a HOLDOUT for every other group: whatever sinks into the ground (wall feet, mat platform edge) is cut off exactly as in the one-piece picture
    for g in names:
        for o in meshes:
            if g not in GROUND and grpname(o) in GROUND: o.hide_render = False; o.is_holdout = True
            else: o.hide_render = grpname(o) != g; o.is_holdout = False
        r.filepath = os.path.join(A.game, g + ".png"); bpy.ops.render.render(write_still=True)
        for o in meshes: o.is_holdout = False
        if any(islit(o) for o in meshes if grpname(o) == g):
            for o in meshes: o.hide_render = False; o.is_holdout = not (grpname(o) == g and islit(o))
            r.filepath = os.path.join(A.game, g + ".lit.png"); bpy.ops.render.render(write_still=True)
            for o in meshes: o.is_holdout = False
    fgs = sorted({o["fg"] for o in meshes if o.get("fg")})
    for f in fgs:     # foreground sprites: only the tagged parts, EVERYTHING else a holdout, so they keep exactly the occlusion they have in the one-piece picture
        for o in meshes: o.hide_render = False; o.is_holdout = o.get("fg") != f
        r.filepath = os.path.join(A.game, "fg-" + f + ".png"); bpy.ops.render.render(write_still=True)
        for o in meshes: o.is_holdout = False
    print("game groups:", names, "fg:", fgs)
def finish_and_render(frame_cols, frame_rows, cx, rc, names_out, layers=()):
    """camera centred on column cx and ground row rc (at z=0); render the base picture and then each overlay layer"""
    r = _camera(frame_cols, frame_rows, cx, rc)
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
    SLOT = A.slot                               # town-slot mode: only the building (no ground, no scenery, no overlays)
    grp("ground")
    if not SLOT:
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
    grp("building")
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
    # little brown light fixture on the wall (the approved daylight sample draws it as a plain box)
    B(10.5, RF + 0.1, 2.0, 0.12, 0.14, 0.12, "#3b3430", True, name="wallLamp")
    if A.dusk: B(10.5, RF + 0.19, 1.99, 0.07, 0.02, 0.07, "#ffd98a", False, name="wallLampLens")    # dusk only: the lamp's lens, the source of its pool of light
    for x in (X0 + 0.08, X1 - 0.08): B(x, RF + 0.06, ZE / 2, 0.07, 0.07, ZE - 0.1, "#6b5545", False, name="downspout")           # downspouts
    # ---------------- overlay layers: PHONE and HOUSE NUMBER (own objects, own PNGs)
    # Real values come from a local, uncommitted file (source/local_overlay_values.json, git-ignored):
    #   {"phone": "...", "house_number": "..."}   If missing or empty, the layers hold blank placeholder bars.
    _vals = {}
    _lp = os.path.join(HERE, "local_overlay_values.json")
    if os.path.exists(_lp):
        import json as _json
        _vals = _json.load(open(_lp))
    _phone = str(_vals.get("phone", "")).strip(); _house = str(_vals.get("house_number", "")).strip()
    LAYER[0] = "phone" if not SLOT else None
    if SLOT: pass
    elif _phone: text("phoneNumber", _phone, 4.95, RF + 0.1, 2.05, 0.1, 1.2, "#25252e", 0.01, False, font=None)
    else: B(4.95, RF + 0.1, 2.05, 1.0, 0.02, 0.1, "#9a9aa8", False, name="phonePlaceholder")
    LAYER[0] = "address" if not SLOT else None
    if SLOT: pass
    elif _house: text("houseNumber", _house, CX + 0.78, RF + 0.07, 1.78, 0.11, 0.34, "#3b2417", 0.01, False)
    else: B(CX + 0.78, RF + 0.07, 1.78, 0.26, 0.02, 0.07, "#7a5a40", False, name="housePlaceholder")
    LAYER[0] = None
    B(CX + 0.78, RF + 0.05, 1.78, 0.4, 0.03, 0.2, "#b8662e", True, name="houseplate")             # blank plate, digits are on the layer
    # ---------------- benches, red chairs, flower beds, shrubs, trees (each its own game sprite; none of it in the town-slot building)
    if not SLOT:
        def bench(cx, rr, w, hexc, slat):
            B(cx, rr, 0.33, w, 0.4, 0.07, hexc, True, name="bseat")
            for x in (-w / 2 + 0.1, w / 2 - 0.1): B(cx + x, rr, 0.16, 0.08, 0.34, 0.32, "#2f2620", False, name="bleg"); B(cx + x, rr - 0.17, 0.46, 0.07, 0.07, 0.62, "#2f2620", False, name="bpost")
            B(cx, rr - 0.17, 0.56, w, 0.06, 0.4, hexc, True, name="bback")
            for k in range(slat): B(cx - w / 2 + 0.12 + k * (w - 0.24) / (slat - 1), rr - 0.14, 0.56, 0.035, 0.02, 0.38, "#2a211c", False, name="bslat")
        grp("bin"); B(11.9, 6.5, 0.28, 0.4, 0.4, 0.56, "#4f6f8a", True, name="bin"); B(11.9, 6.5, 0.6, 0.46, 0.46, 0.06, "#3b4f63", True, name="binLid")   # a small bin
        grp("bench-a"); bench(4.35, 6.45, 1.7, "#4d3a2f", 7)
        grp("bench-b"); bench(8.75, 6.4, 0.95, "#5a4338", 5)
        for chn, (cxr, rr, rot) in zip("ab", ((9.85, 6.4, 0), (10.55, 6.6, 8))):
            grp("chair-" + chn)                                   # two red metal chairs (branded red)
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
        grp("bed-a"); bed(5.7, 7.35, 0.8, FL); grp("bed-b"); bed(8.3, 7.35, 0.8, FL[::-1])
        grp("shrub"); E(7.0, 7.0, 0.28, 0.32, 0.22, 0.28, "#5f9e55", True, 10, 6, name="shrubC"); E(6.95, 7.05, 0.5, 0.18, 0.13, 0.15, "#7fbf6f", False, 8, 4, name="shrubC2")
        # trees: a palm on the right (soft green fronds) and two round trees behind (like the town square)
        grp("palm"); T(12.4, 6.4, 0, 1.5, 0.11, 0.07, "#8a5e38", True, 8, name="palm")
        for k in range(9):
            a = k * 40; E(12.4 + 0.5 * math.cos(math.radians(a)), 6.4 + 0.15 * math.sin(math.radians(a)), 1.6 + 0.12 * (k % 2), 0.55, 0.08, 0.1, "#5f9e55" if k % 2 else "#4f8a4a", True, 8, 4, rot=(0, -20 * math.cos(math.radians(a)), a), name=f"frond{k}")
        for tn, (x, rr, s) in enumerate(((1.2, 4.6, 1.0), (13.0, 4.4, 1.0), (0.6, 6.9, 0.8))):
            grp(f"tree-{tn + 1}")
            T(x, rr, 0, 0.9 * s, 0.12 * s, 0.09 * s, "#7a5232", True, 8, name="trunk"); E(x, rr, 1.35 * s, 0.75 * s, 0.6 * s, 0.7 * s, "#6fae5f", True, 14, 8, name="crown")
    if A.game:
        grp("end")
        LIT = ("wLglass", "wRglass", "wLlowglass", "wRlowglass", "paneL", "paneR", "panelowL", "panelowR", "wallLampLens")
        if SLOT: render_game(10.0, 7.2, 7.0, 3.7, LIT)         # the town-slot building: columns 2..12, rows 0.1..7.2
        else: render_game(14.0, 8.9, 7.0, 4.55, LIT)
    else: finish_and_render(14.0, 8.9, 7.0, 4.55, "outside-face@2x.png", ("phone", "address"))


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

# ============================ MAIN FLOOR (rebuilt to Jay's layout; numbers live in layout_main_floor.py) ====================
sys.path.insert(0, HERE)
import layout_main_floor as LM
IMGMATS = {}
def imgplane(path, name, cx, w, h, row=None, zc=None, rc=None, zf=None):
    """a flat picture (emission, alpha respected). Wall: stands on the wall plane at `row`, centre height zc. Floor: lies at height zf, centre row rc."""
    key = os.path.abspath(path)
    if key not in IMGMATS:
        m = bpy.data.materials.new("img" + name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
        tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = bpy.data.images.load(key); tex.image.colorspace_settings.name = "sRGB"; tex.interpolation = "Linear"; tex.extension = "CLIP"
        em = nt.nodes.new("ShaderNodeEmission"); tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); out = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(tex.outputs["Color"], em.inputs["Color"]); nt.links.new(tex.outputs["Alpha"], mx.inputs["Fac"])
        nt.links.new(tr.outputs["BSDF"], mx.inputs[1]); nt.links.new(em.outputs["Emission"], mx.inputs[2]); nt.links.new(mx.outputs["Shader"], out.inputs["Surface"])
        IMGMATS[key] = m
    if row is not None:
        P = [(cx - w / 2, -row * K, zc - h / 2), (cx + w / 2, -row * K, zc - h / 2), (cx + w / 2, -row * K, zc + h / 2), (cx - w / 2, -row * K, zc + h / 2)]
    else:
        P = [(cx - w / 2, -(rc + h / 2) * K, zf), (cx + w / 2, -(rc + h / 2) * K, zf), (cx + w / 2, -(rc - h / 2) * K, zf), (cx - w / 2, -(rc - h / 2) * K, zf)]
    bm = _BM.new(); vs = [bm.verts.new(p) for p in P]; f = bm.faces.new(vs); uv = bm.loops.layers.uv.new("UV")
    for lp, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uv].uv = (u, v)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(IMGMATS[key])
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob); ob["layer"] = ""; return ob

POSES["split"] = dict(head=(0.0, 0.42), neck=(0.0, 0.3), arms=[[(0.2, 0.28), (0.45, 0.4)], [(-0.2, 0.28), (-0.45, 0.4)]], legs=[[(0.4, -0.02), (0.85, 0.0)], [(-0.4, -0.02), (-0.85, 0.0)]])

# ============================ MAIN FLOOR v2 (Claude Code, Nov 19 2026) ====================================================
# Same layout, groups and footprints as the bot's version (so the game data and the import step stay the same); the detail
# follows Jay's photos of the real dojo: knotty-pine target wall with 12 yellow men, red/blue mat strips under it, the ninja
# rig, the big red square with the logo, Century-style bags, folded crash mats, the weapon rack, white cube shelf with cones,
# the sky-and-clouds pro shop with the lion picture, glass display case, white cross doors, the handprint wall, the teal
# couch with striped cushions, brown vinyl tile in the lobby. Contact shadows, wall-foot shading and soft ceiling-light pools
# are flat see-through shapes (no lighting change), so the look stays the house toon style.
import random as _rnd

AMATS = {}
def amat(h, a):
    key = f"A{h}{a}"
    if key in AMATS: return AMATS[key]
    m = bpy.data.materials.new(key); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = srgb(h)
    t = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs["Fac"].default_value = a
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(t.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], o.inputs["Surface"])
    AMATS[key] = m; return m
def add_a(name, bm, h, a):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(amat(h, a))
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob); ob["layer"] = ""
    if FG[0]: ob["fg"] = FG[0]
    return ob
def shadow(c, r, rx, ry, z, a=0.16, name="shadow"):
    """soft contact shadow on the floor (two stacked see-through ellipses)"""
    add_a(name, ellipsoid(G(c, r, z), (rx, D(ry), 0.003), segs=28, rings=4), "#1c1830", a * 0.6)
    add_a(name, ellipsoid(G(c, r, z + 0.001), (rx * 0.75, D(ry * 0.75), 0.003), segs=28, rings=4), "#1c1830", a * 0.6)
def fband(x0, x1, r0, r1, z, h, a, name="band"):
    add_a(name, box(G((x0 + x1) / 2, (r0 + r1) / 2, z), (x1 - x0, D(r1 - r0), 0.002)), h, a)
def torus(center, R, r, segs=18, rsegs=6, rot=(90, 0, 0)):
    from mathutils import Matrix
    bm = _BM.new(); rings = []
    for i in range(segs):
        a = 2 * math.pi * i / segs; ring = []
        for j in range(rsegs):
            b = 2 * math.pi * j / rsegs
            ring.append(bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))))
        rings.append(ring)
    for i in range(segs):
        for j in range(rsegs):
            a0, a1 = rings[i], rings[(i + 1) % segs]
            bm.faces.new((a0[j], a1[j], a1[(j + 1) % rsegs], a0[(j + 1) % rsegs]))
    _BM.ops.recalc_face_normals(bm, faces=bm.faces[:])
    m = Matrix.Translation(center) @ Euler([math.radians(v) for v in rot]).to_matrix().to_4x4()
    _BM.ops.transform(bm, matrix=m, verts=bm.verts)
    return bm


def scene_inside():
    global WF
    rnd = _rnd.Random(19)
    RED, RED_D, BLUE, BLUE_D = "#dd3029", "#a81f1b", "#2f5fc4", "#22489a"
    WALL, CAP, SLAB = "#f4f2ec", "#dcd8cc", "#8d8678"
    INK = "#14121c"
    TXD = os.path.join(HERE, "textures"); LOGO = os.path.join(TXD, "logo-mark.png"); LOGO_AR = 929 / 1000
    Wd_, Hh, RN, RW, RF = LM.W, LM.H, LM.R_N, LM.R_MAT_S, LM.R_FRONT; mid = Wd_ / 2
    ZM = 0.12          # top of the mat platform

    # ======================= FLOOR =======================
    grp("floor")
    B(mid, (RN + RF) / 2, -0.15, Wd_ + 0.5, RF - RN + 0.5, 0.3, SLAB, True, name="floorslab")
    # lobby: brown marbled vinyl tile, one tile per game tile, grout between
    B(mid, (RW + RF) / 2, 0.012, Wd_, RF - RW, 0.024, "#9c8566", False, name="grout")
    TONES = ("#c8b190", "#c2aa88", "#cdb797", "#bea582", "#c6ae8c")
    r = math.floor(RW)
    while r < RF:
        r0, r1 = max(r, RW), min(r + 1, RF)
        if r1 - r0 > 0.08:
            for c in range(int(Wd_)):
                B(c + 0.5, (r0 + r1) / 2, 0.026, 0.95, (r1 - r0) - 0.05, 0.006, rnd.choice(TONES), False, name="tile")
                for s in range(rnd.randint(0, 2)):      # faint marble veins
                    x0_ = c + 0.1 + rnd.random() * 0.5; y0_ = r0 + 0.1 + rnd.random() * max(0.05, (r1 - r0) - 0.35)
                    fpoly(rect((x0_, y0_), (x0_ + 0.15 + rnd.random() * 0.3, y0_ + 0.05 + rnd.random() * 0.2), 0.022), 0.0305, rnd.choice(("#b29a77", "#d3bfa0")), "vein")
        r += 1
    # mat platform, royal blue, panel seams every 2 tiles
    B(mid, (RN + RW) / 2, ZM / 2, Wd_, RW - RN, ZM, BLUE, True, name="matPlatform")
    B(mid, RW - 0.03, ZM - 0.01, Wd_, 0.06, 0.02, "#4d7bd9", False, name="matEdgeLight")
    for x in range(2, 27, 2): fpoly(rect((x, RN), (x, RW), 0.035), ZM + 0.005, BLUE_D, "seam")
    for rr in range(3, 10, 2): fpoly(rect((0, rr), (Wd_, rr), 0.035), ZM + 0.005, BLUE_D, "seam")
    # red and blue strips in front of the target wall (the raised training strip in the photos)
    for k in range(8):
        x0_ = 0.0 + k * 1.0; col = RED if k % 2 == 0 else BLUE
        B(x0_ + 0.5, 2.05, ZM + 0.012, 1.0, 2.1, 0.024, col, False, name="stripMat")
        fpoly(rect((x0_ + 1.0, 1.0), (x0_ + 1.0, 3.1), 0.03), ZM + 0.026, RED_D if col == RED else BLUE_D, "stripSeam")
    B(4.0, 3.1, ZM + 0.012, 8.0, 0.05, 0.03, "#e8e4da", False, name="stripEdge")
    # the big red square with the school logo
    x0, x1, r0, r1 = LM.REDSQ
    B((x0 + x1) / 2, (r0 + r1) / 2, ZM + 0.01, x1 - x0, r1 - r0, 0.02, RED, False, name="redSquare")
    for x in range(int(x0) + 1, int(x1), 2): fpoly(rect((x, r0), (x, r1), 0.035), ZM + 0.025, RED_D, "seam")
    for rr in range(int(r0) + 1, int(r1), 2): fpoly(rect((x0, rr), (x1, rr), 0.035), ZM + 0.025, RED_D, "seam")
    fpoly(rect((x0, r0), (x1, r0), 0.05), ZM + 0.026, "#f08a80", "sqEdge")
    lw = LM.LOGO_W; imgplane(LOGO, "floorLogo", LM.LOGO_C[0], lw, lw * LOGO_AR, rc=LM.LOGO_C[1], zf=ZM + 0.035)
    # wall-foot shading and soft pools of light from the ceiling lights
    fband(0, Wd_, RN, RN + 0.28, ZM + 0.04, "#1c1830", 0.16, "aoN"); fband(0, Wd_, RN + 0.28, RN + 0.6, ZM + 0.041, "#1c1830", 0.07, "aoN2")
    for xa, xb in ((0, 7.0), (19.4, Wd_)):
        fband(xa, xb, RW, RW + 0.25, 0.035, "#1c1830", 0.14, "aoW"); fband(xa, xb, RW + 0.25, RW + 0.5, 0.036, "#1c1830", 0.06, "aoW2")
    for (cx_, rc_) in ((4.5, 6.2), (22.5, 7.0), (4.0, 15.5), (23.0, 15.5)):
        z_ = ZM + 0.045 if rc_ < RW else 0.04
        add_a("lightPool", ellipsoid(G(cx_, rc_, z_), (3.0, D(1.8), 0.002), segs=36, rings=4), "#ffffff", 0.025)
        add_a("lightPool", ellipsoid(G(cx_, rc_, z_ + 0.001), (1.8, D(1.0), 0.002), segs=36, rings=4), "#ffffff", 0.025)

    # ======================= WALLS =======================
    grp("walls")
    B(mid, RN - 0.17, Hh / 2, Wd_ + 0.3, 0.34, Hh, WALL, True, name="northwall"); B(mid, RN - 0.17, Hh + 0.04, Wd_ + 0.34, 0.38, 0.1, CAP, True, name="northcap")
    grp("floor"); B(mid, RN + 0.03, ZM + 0.05, Wd_, 0.04, 0.1, "#8c8a84", False, name="baseboard")
    grp("walls")
    for x in (-0.12, Wd_ + 0.12):
        B(x, (RN + RF) / 2, Hh / 2, 0.24, RF - RN, Hh, WALL, True, name="sidewall"); B(x, (RN + RF) / 2, Hh + 0.04, 0.3, RF - RN + 0.04, 0.1, CAP, True, name="sidecap")
    PRO = "#9cc3ea"
    for (a, b, col, nm) in ((LM.WEST_WING[0], LM.WEST_WING[1], PRO, "westWing"), (LM.EAST_WING[0], LM.EAST_WING[1], WALL, "eastWing")):
        grp("wing-west" if nm == "westWing" else "wing-east"); cx = (a + b) / 2
        B(cx, RW - 0.17, Hh / 2, b - a, 0.34, Hh, col, True, name=nm); B(cx, RW - 0.17, Hh + 0.04, b - a + 0.04, 0.38, 0.1, CAP, True, name=nm + "Cap")
        B(cx, RW + 0.03, 0.06, b - a, 0.04, 0.12, "#8c8a84", False, name="baseboard")
    # front wall (foreground): low curb, brown door posts and header, open brown leaves with glass
    grp("foreground")
    for (a, b) in ((0, LM.DOOR[0]), (LM.DOOR[1], Wd_)):
        B((a + b) / 2, RF, 0.25, b - a, 0.34, 0.5, WALL, True, name="frontCurb"); B((a + b) / 2, RF - 0.18, 0.06, b - a, 0.03, 0.12, "#8c8a84", False, name="frontBase")
    for x in LM.DOOR: B(x, RF, 1.2, 0.16, 0.36, 2.4, "#4a3226", True, name="doorPost")
    B(sum(LM.DOOR) / 2, RF, 2.45, LM.DOOR[1] - LM.DOOR[0] + 0.16, 0.36, 0.12, "#4a3226", True, name="doorHead")
    for x in (LM.DOOR[0] + 0.1, LM.DOOR[1] - 0.1):
        B(x, RF - 0.6, 1.15, 0.08, 1.1, 2.3, "#5b3d2e", True, name="doorLeaf"); B(x, RF - 0.6, 1.55, 0.1, 0.62, 0.9, "#9fd0f0", False, name="doorGlass")
        B(x, RF - 0.6, 1.0, 0.11, 0.7, 0.06, "#c8ccd4", False, name="doorBar")
    grp("floor")
    B(sum(LM.DOOR) / 2, RF - 1.3, 0.04, 2.2, 0.9, 0.04, "#3d2a20", True, name="welcomeMat"); B(sum(LM.DOOR) / 2, RF - 1.3, 0.065, 1.95, 0.68, 0.02, "#5b4030", False, name="welcomeMatInner")
    wt = text("welcomeText", "WELCOME", sum(LM.DOOR) / 2, RF - 1.3, 0.08, 0.3 * K, 1.55, "#e3c98f", 0.005, False)
    wt.rotation_euler = (0, 0, 0); wt.location = G(sum(LM.DOOR) / 2, RF - 1.3, 0.08)

    # ======================= NORTH WALL =======================
    WF = RN
    # ---- target wall: knotty pine planks, 12 yellow men in two rows
    grp("target-wall")
    a, b = LM.TARGET; cx = (a + b) / 2
    Wd(cx, 1.62, b - a, 3.1, "#c48c52", 0.025, 0.04, True, name="targetWood")
    PL = ("#d9a86c", "#cf9b5e", "#e0b47c", "#c99456", "#d6a466")
    n = int((b - a) / 0.3)
    for k in range(n):
        x = a + 0.15 + k * 0.3; Wd(x, 1.62, 0.28, 3.06, PL[k % 5], 0.045, 0.01, False, name="plank")
        Wd(x + 0.145, 1.62, 0.012, 3.06, "#9a6a36", 0.05, 0.005, False, name="plankGap")
        for q in range(rnd.randint(1, 3)):      # knots and grain
            zq = 0.3 + rnd.random() * 2.7; xq = x - 0.08 + rnd.random() * 0.16
            wpoly(circ(xq, zq, 0.035 + rnd.random() * 0.025, 12, 1.0, 1.4), "#a8733c", 0, "knot")
            wpoly(circ(xq, zq, 0.015, 8), "#7a4f26", 1, "knotCore")
        for q in range(2):
            zq = 0.2 + rnd.random() * 2.8; wpoly(rect((x - 0.1, zq), (x + 0.1, zq + 0.02), 0.008), "#b98248", 0, "grain")
    Wd(cx, 3.2, b - a + 0.14, 0.1, "#8a5a2e", 0.06, 0.04, True, name="targetTrim"); Wd(cx, 0.06, b - a + 0.14, 0.12, "#8a5a2e", 0.06, 0.04, True, name="targetBase")
    for x in (a - 0.03, b + 0.03): Wd(x, 1.62, 0.08, 3.2, "#8a5a2e", 0.06, 0.04, True, name="targetSide")
    def yellow_man(x, z0, s=1.0):
        R = [(0.07, 0.66), (0.2, 0.635), (0.31, 0.6), (0.37, 0.52), (0.39, 0.4), (0.38, 0.27), (0.31, 0.25), (0.29, 0.36), (0.26, 0.2), (0.235, 0.05), (0.25, -0.22)]
        body = R + [(-px, py) for px, py in reversed(R)]
        zc = z0 + 0.2
        P = lambda pts, sc_=1.0, dz=0.0: [(x + s * sc_ * px, zc + s * (sc_ * py + dz)) for px, py in pts]
        wpoly(P(body, 1.09, -0.02), INK, 1, "manLine"); wpoly(circ(x, zc + s * 0.8, s * 0.15, 18), INK, 1, "headLine")
        wpoly(P(rect((0, 0.6), (0, 0.72), 0.17), 1.0), INK, 1, "neckLine")
        wpoly(P(body), "#f7cd2f", 2, "man"); wpoly(circ(x, zc + s * 0.8, s * 0.125, 18), "#f7cd2f", 2, "head"); wpoly(P(rect((0, 0.6), (0, 0.72), 0.13)), "#f7cd2f", 2, "neck")
        wpoly(P([(0.0, 0.62), (0.2, 0.62), (0.3, 0.58), (0.36, 0.5), (0.37, 0.4), (0.37, 0.28), (0.31, 0.26), (0.28, 0.36), (0.25, 0.18), (0.22, 0.0), (0.0, 0.0)]), "#e6b51f", 3, "manShade")
        wpoly(P([(-0.25, -0.22), (0.25, -0.22), (0.24, 0.03), (-0.24, 0.03)]), "#1d1b24", 4, "shorts")
        wpoly(P(rect((-0.24, 0.0), (0.24, 0.0), 0.04)), "#3a3844", 5, "waistband")
        for q in (rect((-0.17, 0.42), (-0.02, 0.38), 0.02), rect((0.17, 0.42), (0.02, 0.38), 0.02), rect((0, 0.5), (0, 0.1), 0.016),
                  rect((-0.09, 0.28), (0.09, 0.28), 0.014), rect((-0.08, 0.17), (0.08, 0.17), 0.014)): wpoly(P(q), "#c99a14", 5, "manDetail")
        wpoly(circ(x - s * 0.04, zc + s * 0.83, s * 0.02, 8), "#c99a14", 4, "face"); wpoly(circ(x + s * 0.04, zc + s * 0.83, s * 0.02, 8), "#c99a14", 4, "face")
    for row, z0 in enumerate((1.85, 0.5)):
        for k in range(6): yellow_man(a + 0.55 + k * 1.02, z0, 1.02)
    # ---- mural: the school mark with the five styles
    grp("walls")
    a, b = LM.MURAL; cx = (a + b) / 2
    Wd(cx, 1.65, b - a, 3.0, "#fbfaf6", 0.03, 0.04, True, name="muralWall")
    imgplane(LOGO, "muralLogo", cx, 1.75, 1.75 * LOGO_AR, row=WF + 0.1, zc=1.72)
    for s, x, z, w in (("Karate", cx, 2.85, 0.95), ("Kung Fu", a + 0.95, 2.62, 0.95), ("Jiu Jitsu", b - 0.95, 2.62, 1.0), ("Tae Kwon Do", a + 0.95, 0.88, 1.25), ("Weapons", b - 0.95, 0.88, 1.0)):
        text("t_" + s, s, x, WF + 0.1, z, 0.21, w, INK, 0.03, False)
    # silhouettes in the logo's own style (source/make_silhouettes.py): the kicker is the logo's figure; one scale for all three
    KS = 1.3 / 377
    imgplane(os.path.join(TXD, "sil-kick.png"), "silKick", a + 0.95, 394 * KS, 377 * KS, row=WF + 0.1, zc=1.07 + 377 * KS / 2)
    imgplane(os.path.join(TXD, "sil-stance.png"), "silStance", b - 0.95, 389 * KS, 348 * KS, row=WF + 0.1, zc=1.07 + 348 * KS / 2)
    imgplane(os.path.join(TXD, "sil-split.png"), "silSplit", cx, 490 * KS * 0.72, 189 * KS * 0.72, row=WF + 0.1, zc=0.56)
    # round clock
    wdisc(LM.FLAG[0] - 0.12, 3.0, 0.2, "#25252e", 0, "clockRim"); wdisc(LM.FLAG[0] - 0.12, 3.0, 0.16, "#f4f1e8", 1, "clockFace")
    for k in range(12): wdisc(LM.FLAG[0] - 0.12 + 0.12 * math.sin(k * math.pi / 6), 3.0 + 0.12 * math.cos(k * math.pi / 6), 0.012, "#25252e", 2, "tick")
    wpoly(rect((LM.FLAG[0] - 0.12, 3.0), (LM.FLAG[0] - 0.12, 3.11), 0.018), "#25252e", 3, "hand1"); wpoly(rect((LM.FLAG[0] - 0.12, 3.0), (LM.FLAG[0] - 0.04, 2.97), 0.018), "#25252e", 3, "hand2")
    # ---- back doors: dark brown double doors with tall glass, EXIT sign and framed posters above
    grp("back-doors")
    a, b = LM.BACK_DOOR; cx = (a + b) / 2
    Wd(cx, 1.25, b - a + 0.2, 2.55, "#3d2a20", 0.03, 0.05, True, name="backDoorFrame")
    for k in (-1, 1):
        x = cx + k * 0.52
        Wd(x, 1.2, 1.0, 2.35, "#5b3d2e", 0.07, 0.03, True, name="backDoorLeaf")
        Wd(x, 1.62, 0.52, 1.05, "#2b1d16", 0.095, 0.01, False, name="backDoorGlassRim"); Wd(x, 1.62, 0.46, 0.99, "#a9dcf5", 0.1, 0.02, False, name="backDoorGlass")
        wpoly([(x - 0.2, 1.3), (x - 0.05, 1.3), (x + 0.2, 1.9), (x + 0.2, 2.05)], "#d8f0fb", 6, "glassShine")
        Wd(x, 0.18, 0.96, 0.3, "#4a3226", 0.1, 0.01, False, name="kickPlate")
    Wd(cx, 1.05, 1.5, 0.06, "#c8ccd4", 0.11, 0.03, False, name="pushBar")
    Wd(cx, 2.72, 0.62, 0.22, "#2b2b33", 0.04, 0.05, True, name="exitBox"); text("exitText", "EXIT", cx, WF + 0.1, 2.72, 0.13, 0.42, "#ff3b30", 0.02, False)
    # ---- flag, black belts on hooks, white cube shelf with cones and bins
    grp("walls")
    a, b = LM.FLAG; cx = (a + b) / 2
    imgplane(os.path.join(TXD, "us-flag.png"), "flag", cx, 1.9, 1.0, row=WF + 0.09, zc=2.55)
    for k in range(3): Wd(cx - 0.95 + 0.02, 2.55 + (k - 1) * 0.42, 0.05, 0.05, "#c8ccd4", 0.07, 0.02, False, name="flagClip")
    Wd(15.72, 2.15, 0.22, 0.04, "#2b2b33", 0.06, 0.02, False, name="hookRail")
    for k, (dx, col) in enumerate(((-0.05, "#25252e"), (0.06, "#25252e"))):
        wpoly(rect((15.72 + dx, 2.12), (15.72 + dx - 0.03, 1.25 + 0.1 * k), 0.045), col, 2 + k, "hangBelt")
        wpoly(rect((15.72 + dx + 0.03, 2.12), (15.72 + dx + 0.05, 1.35 + 0.1 * k), 0.045), col, 2 + k, "hangBelt")
    grp("props")
    gx = cx; GR = WF + 0.25
    B(gx, GR, 0.62, 1.6, 0.5, 1.24, "#f7f6f2", True, name="cubeShelf")
    for k in range(2):
        for j in range(3):
            B(gx - 0.5 + j * 0.5, GR + 0.24, 0.32 + k * 0.58, 0.44, 0.03, 0.5, "#cfcbc2", False, name="cubeHole")
    for j, c in enumerate(("#d92b25", "#d92b25", "#f5c542")): B(gx - 0.5 + j * 0.5, GR + 0.2, 0.3, 0.4, 0.3, 0.38, c, True, bevel=0.02, name="cubeBin")
    for j, c in enumerate(("#2f6fd6", "#25252e", "#d92b25")): E(gx - 0.5 + j * 0.5, GR + 0.2, 0.83, 0.15, 0.13, 0.13, c, True, 10, 6, name="shelfGlove")
    for k, (dx, c) in enumerate(((-0.55, "#f08a24"), (-0.4, "#f08a24"), (0.15, "#f4f1e8"), (0.3, "#f5c542"))):
        T(gx + dx, GR, 1.24, 1.5 if c != "#f4f1e8" else 1.56, 0.08, 0.015, c, True, 12, name="cone")
        T(gx + dx, GR, 1.24, 1.27, 0.1, 0.1, c, False, 12, name="coneBase")
        if c == "#f4f1e8": T(gx + dx, GR, 1.36, 1.42, 0.045, 0.035, "#d92b25", False, 10, name="coneStripe")
    B(gx + 0.6, GR, 1.32, 0.3, 0.25, 0.16, "#f5c542", True, name="shelfBox")
    shadow(gx, GR + 0.3, 0.9, 0.15, ZM + 0.05, 0.18, "shelfShadow")
    # ---- the two creed boards (faith texts are the approved pictures, unchanged)
    grp("walls")
    a, b = LM.CREED; cx = (a + b) / 2
    Wd(cx, 1.75, 2.72, 2.88, INK, 0.04, 0.05, True, name="creedFrame"); imgplane(os.path.join(TXD, "class-creed.png"), "classCreed", cx, 2.6, 2.6 * 1060 / 1000, row=WF + 0.1, zc=1.75)
    a, b = LM.BELTS; cx = (a + b) / 2
    Wd(cx, 1.74, 2.62, 3.14, INK, 0.04, 0.05, True, name="beltFrame"); imgplane(os.path.join(TXD, "belt-creed.png"), "beltCreed", cx, 2.5, 2.5 * 1818 / 1500, row=WF + 0.1, zc=1.74)
    # ---- weapon rack behind the crash mats: bo staffs, sticks and wooden swords
    grp("props")
    Wd(25.55, 2.0, 2.1, 0.09, "#2b2b33", 0.05, 0.08, True, name="rackTop"); Wd(25.55, 0.9, 2.1, 0.09, "#2b2b33", 0.05, 0.08, True, name="rackLow")
    for x in (24.55, 26.55): Wd(x, 1.5, 0.08, 2.6, "#2b2b33", 0.04, 0.06, True, name="rackPost")
    WEAP = [(24.75, 0.3, 3.15, "#9a6a3a", 0.03), (24.95, 0.3, 3.1, "#7a5232", 0.03), (25.15, 0.6, 2.4, "#c9a66b", 0.022), (25.3, 0.6, 2.4, "#c9a66b", 0.022),
            (25.5, 0.3, 3.18, "#a8743e", 0.03), (25.7, 0.45, 2.6, "#5b3d2e", 0.026), (25.88, 0.3, 3.05, "#8a5a2e", 0.03), (26.05, 0.6, 2.35, "#25252e", 0.024), (26.25, 0.3, 3.12, "#9a6a3a", 0.03)]
    for (x, z0_, z1_, c, rr_) in WEAP: T(x, WF + 0.16, z0_, z1_, rr_, rr_, c, True, 8, name="staff")
    for (x, z) in ((25.7, 2.6), (26.05, 2.35)): B(x, WF + 0.16, z - 0.12, 0.12, 0.06, 0.03, "#2b2b33", False, name="tsuba")
    # crash-mat stack (folded blue pads with red and blue kick shields on top)
    a, b, ra, rb = LM.CRASH; cxm, rcm = (a + b) / 2, (ra + rb) / 2
    for k, c in enumerate((BLUE, "#7fa6e6", BLUE, "#7fa6e6")):
        B(cxm + 0.03 * (k % 2), rcm, ZM + 0.11 + 0.21 * k, b - a, rb - ra, 0.2, c, True, bevel=0.04, name=f"crashMat{k}")
        B(cxm + 0.03 * (k % 2), rb - 0.01, ZM + 0.11 + 0.21 * k, 0.5, 0.02, 0.05, "#1d1b24", False, name="crashHandle")
        B(cxm + 0.03 * (k % 2) - (b - a) / 2 + 0.06, rcm, ZM + 0.11 + 0.21 * k, 0.03, rb - ra, 0.2, "#1d4aa0", False, name="crashFold")
    shadow(cxm, rb, 1.4, 0.25, ZM + 0.05, 0.22, "crashShadow")
    # ---- heavy bags: freestanding, filled base, collar, tall bag, white band (no brand words)
    for (x, r, c) in LM.BAGS:
        col = {"black": "#34343f", "blue": "#2f6fd6", "red": "#d92b25"}[c]; hi = {"black": "#4a4a58", "blue": "#5a8fe6", "red": "#ef5a4f"}[c]
        grp("bag-" + c)
        shadow(x, r, 0.62, 0.45, ZM + 0.05, 0.26, "bagShadow")
        T(x, r, ZM, 0.58, 0.52, 0.46, "#25252e", True, 22, name="bagBase", round_ground=True)
        T(x, r, 0.58, 0.64, 0.46, 0.36, "#30303a", True, 22, name="bagBaseTop", round_ground=True)
        T(x, r, 0.64, 0.82, 0.2, 0.24, "#1d1b24", True, 16, name="bagNeck", round_ground=True)
        T(x, r, 0.82, 2.1, 0.3, 0.3, col, True, 20, name="bag", round_ground=True)
        E(x, r, 2.1, 0.3, 0.3, 0.13, col, True, 20, 8, name="bagTop")
        B(x - 0.15, r + 0.24, 1.45, 0.05, 0.02, 1.15, hi, False, name="bagShine")
        T(x, r, 1.3, 1.5, 0.305, 0.305, "#f4f1e8", False, 20, name="bagBand", round_ground=True)
        T(x, r, 1.38, 1.42, 0.307, 0.307, col, False, 20, name="bagBandLine", round_ground=True)
        T(x, r, 0.86, 0.9, 0.305, 0.305, "#1d1b24", False, 20, name="bagSeam", round_ground=True)
    # ---- whiteboard on a rolling stand
    grp("whiteboard")
    shadow(21.3, 6.4, 0.9, 0.2, ZM + 0.05, 0.16, "wbShadow")
    B(21.3, 6.3, 1.5, 1.5, 0.06, 1.0, "#b8bcc6", True, name="whiteboardFrame"); B(21.3, 6.33, 1.5, 1.38, 0.04, 0.88, "#fbfbf8", False, name="whiteboard")
    B(21.3, 6.36, 1.04, 1.2, 0.08, 0.04, "#9aa0aa", False, name="wbTray")
    for k, c in enumerate(("#2f6fd6", "#d92b25", "#25252e")): B(21.0 + k * 0.18, 6.38, 1.07, 0.13, 0.03, 0.03, c, False, name="marker")
    for dx in (-0.6, 0.6):
        T(21.3 + dx, 6.42, ZM + 0.08, 1.05, 0.03, 0.03, "#5b5f6e", False, 6, name="wbLeg")
        E(21.3 + dx, 6.42, ZM + 0.05, 0.05, 0.05, 0.05, "#25252e", False, 8, 4, name="wbWheel")
    B(21.3, 6.42, ZM + 0.1, 1.3, 0.25, 0.04, "#5b5f6e", False, name="wbFoot")
    # ======================= RED GEAR BOX (padded red platform with blue base and cubbies) =======================
    grp("gear-box")
    x0, x1, r0, r1 = LM.CUBBY; cx, rc = (x0 + x1) / 2, (r0 + r1) / 2
    shadow(cx, r1 + 0.05, (x1 - x0) / 2 + 0.3, 0.3, 0.045, 0.24, "boxShadow")
    B(cx, rc, 0.66, x1 - x0, r1 - r0, 0.96, RED, True, bevel=0.04, name="cubby")
    B(cx, r1 - 0.02, 0.17, x1 - x0 + 0.08, 0.1, 0.22, BLUE, True, name="cubbyBase")
    B(cx, rc, 1.15, x1 - x0 - 0.12, r1 - r0 - 0.12, 0.02, "#e8473e", False, name="cubbyLid")
    for k in range(1, 6): B(x0 + k * (x1 - x0) / 6, rc, 1.16, 0.03, r1 - r0 - 0.12, 0.012, RED_D, False, name="lidSeam")
    B(cx, r1 + 0.005, 1.08, x1 - x0, 0.02, 0.05, "#f06b62", False, name="boxEdgeLight")
    BAGC = ("#2f6fd6", "#f5c542", "#3f9c4a", "#25252e", "#ee7fb0")
    for k in range(5):
        x = x0 + 1.0 + k * 1.3
        B(x, r1 + 0.01, 0.74, 1.0, 0.02, 0.6, "#5a1c18", False, name="cubbyRim"); B(x, r1 + 0.015, 0.74, 0.92, 0.02, 0.52, "#2a0f0f", False, name="cubbyOpening")
    B(10.9, rc, 1.2, 0.6, 0.45, 0.07, "#25252e", True, name="binder"); B(10.95, rc, 1.27, 0.55, 0.4, 0.07, "#d92b25", True, name="binder2")
    B(11.7, rc, 1.19, 0.5, 0.38, 0.05, "#f4f1e8", True, name="papers"); B(15.0, rc, 1.19, 0.7, 0.45, 0.05, "#f4f1e8", False, name="papers2")
    T(16.3, rc, 1.16, 1.5, 0.07, 0.07, "#8ec6ff", True, 10, name="bottle"); T(16.3, rc, 1.5, 1.56, 0.04, 0.04, "#2f6fd6", False, 8, name="bottleCap")
    grp("floor")
    for g in (LM.GAP, LM.GAP_R): B(sum(g) / 2, RW + 0.14, 0.05, g[1] - g[0], 0.3, 0.1, "#c9a86a", True, name="gapThreshold")
    # ======================= PARENT SEATING: red and blue stadium bucket seats on carpeted tiers =======================
    grp("seats")
    X0, X1 = LM.SEATS; NS = 8; pitch = (X1 - X0 - 0.6) / NS; smid = (X0 + X1) / 2
    shadow(smid, LM.TIERS[2][0] + 0.05, (X1 - X0) / 2 + 0.9, 0.3, 0.045, 0.2, "seatShadow")
    for ti, (rf, dp, zt) in enumerate(LM.TIERS):
        B(smid, rf - dp / 2, zt / 2, X1 - X0, dp, zt, "#474d5e", True, name=f"deck{ti}"); B(smid, rf, zt - 0.05, X1 - X0, 0.03, 0.05, "#f4f1e8", False, name=f"riserStripe{ti}")
        B(smid, rf - dp / 2, zt + 0.01, X1 - X0, dp - 0.05, 0.03, "#5a6176", False, name=f"deckTop{ti}")
        for sx_ in (X1 + 0.55, X0 - 0.55):
            B(sx_, rf - dp / 2, zt / 2, 0.8, dp, zt, "#626a82", True, name=f"step{ti}"); B(sx_, rf, zt - 0.05, 0.8, 0.03, 0.05, "#f5c542", False, name=f"stepStripe{ti}")
        rs = rf - dp / 2 - 0.1
        B(smid, rs, zt + 0.05, X1 - X0 - 0.4, 0.1, 0.06, "#8a8f9c", False, name="seatRail")
        for k in range(NS):
            x = X0 + 0.3 + pitch * (k + 0.5); c = RED if (k + ti) % 2 == 0 else BLUE; dk = RED_D if c == RED else "#1d4aa0"; hi = "#f06b62" if c == RED else "#5a8fe6"
            T(x, rs, zt + 0.02, zt + 0.2, 0.035, 0.035, "#4a4f5c", False, 6, name="seatPost")
            B(x, rs - 0.02, zt + 0.25, pitch - 0.12, 0.46, 0.08, c, True, bevel=0.035, name="seat")
            B(x, rs - 0.23, zt + 0.28, pitch - 0.16, 0.05, 0.04, hi, False, name="seatLip")
            FG[0] = "seat-backs"
            B(x, rs + 0.2, zt + 0.55, pitch - 0.12, 0.09, 0.56, c, True, bevel=0.06, name="seatBack")
            B(x, rs + 0.25, zt + 0.55, pitch - 0.32, 0.02, 0.36, dk, False, name="seatBackInset")
            B(x - (pitch - 0.12) / 2 + 0.06, rs + 0.25, zt + 0.6, 0.03, 0.02, 0.36, hi, False, name="seatBackShine")
            FG[0] = None
        for k in range(NS + 1):
            x = X0 + 0.3 + pitch * k; B(x, rs, zt + 0.4, 0.05, 0.42, 0.035, "#2c2c33", True, name="armrest"); B(x, rs + 0.1, zt + 0.2, 0.035, 0.035, 0.4, "#2c2c33", False, name="armpost")
    sxk = lambda k: X0 + 0.3 + pitch * (k + 0.5); rsw = lambda ti: LM.TIERS[ti][0] - LM.TIERS[ti][1] / 2 - 0.1
    B(sxk(5), rsw(1), LM.TIERS[1][2] + 0.42, 0.42, 0.32, 0.24, "#f5c542", True, bevel=0.04, name="seatBag"); B(sxk(5), rsw(1) - 0.17, LM.TIERS[1][2] + 0.5, 0.3, 0.02, 0.04, "#27407a", False, name="seatBagStrap")
    T(sxk(7) + 0.2, rsw(0) - 0.2, LM.TIERS[0][2] + 0.03, LM.TIERS[0][2] + 0.3, 0.045, 0.045, "#8ec6ff", True, 8, name="seatBottle")
    # ======================= WEST WING: PRO SHOP =======================
    grp("wing-west")
    WF = RW; a, b = LM.WEST_WING
    CLEAR = ((0.55, 3.55, 0.55, 2.95), (3.45, 5.3, 1.45, 2.75), (5.3, 6.7, 0.85, 2.25), (3.3, 5.9, 2.8, 3.4))   # grid, shirts, window, sign
    for k in range(90):          # sponge-painted clouds on the sky-blue wall, kept off the shop fittings
        x = 0.25 + rnd.random() * 6.6; z = 0.25 + rnd.random() * 3.0; rd = 0.06 + rnd.random() * 0.14
        if any(x0 - rd * 1.4 < x < x1 + rd * 1.4 and z0 - rd < z < z1 + rd for x0, x1, z0, z1 in CLEAR): continue
        wpoly(circ(x, z, rd, 14, 1.4, 0.75), rnd.choice(("#e9f2fb", "#d7e7f8", "#f7fbff")), 0, "cloud")
    Wd(0.12, 1.7, 0.1, 3.4, "#e03a30", 0.02, 0.02, False, name="redStripe")
    # gear grid wall: uniform bags (top), pad bags (middle), gloves on hooks (bottom), roomy spacing
    GX = 2.05
    Wd(GX, 1.75, 2.7, 2.1, "#30333d", 0.03, 0.03, True, name="gridWall")
    for k in range(11): Wd(GX, 0.75 + k * 0.2, 2.7, 0.012, "#5a5f6e", 0.06, 0.01, False, name="gridH")
    for k in range(13): Wd(GX - 1.32 + k * 0.22, 1.75, 0.012, 2.1, "#5a5f6e", 0.06, 0.01, False, name="gridV")
    for k in range(4):
        x = GX - 0.96 + k * 0.64
        Wd(x, 2.4, 0.42, 0.52, "#fbfbf8", 0.08, 0.03, True, name="uniformBag"); imgplane(LOGO, "proLogo", x, 0.24, 0.24 * LOGO_AR, row=WF + 0.115, zc=2.38)
        Wd(x, 1.62, 0.42, 0.48, "#25252e" if k % 2 == 0 else "#3a3a45", 0.08, 0.03, True, name="padBag"); imgplane(LOGO, "proLogo2", x, 0.22, 0.22 * LOGO_AR, row=WF + 0.115, zc=1.62)
        E(x, WF + 0.12, 1.0, 0.13, 0.06, 0.11, ("#d92b25", "#2f6fd6", "#d92b25", "#d92b25")[k], True, 10, 6, name="hangGlove")
    # t-shirts on a rail
    Wd(4.37, 2.64, 1.75, 0.045, "#25252e", 0.07, 0.02, False, name="hangRail")
    TEE = [(0.1, 0), (0.26, -0.13), (0.2, -0.25), (0.13, -0.2), (0.13, -0.68)]
    for k, x in enumerate((3.95, 4.8)):
        S_ = 1.55; pts = [(x + S_ * dx, 2.6 + S_ * dz) for dx, dz in TEE]; pts = pts + [(2 * x - px, pz) for px, pz in reversed(pts)]
        wpoly([(x - 0.012, 2.67), (x + 0.012, 2.67), (x + 0.012, 2.6), (x - 0.012, 2.6)], "#8a8f9c", 1, "hanger")
        wpoly(pts, "#1d1b24", 2, "tee"); wpoly(circ(x, 2.6, 0.09, 14, 1.2, 0.6), "#3a3844", 3, "teeCollar")
        imgplane(LOGO, "teeLogo", x, 0.36, 0.36 * LOGO_AR, row=WF + 0.13, zc=2.12)
    # red-framed shop window
    Wd(6.0, 1.55, 1.05, 1.15, "#e03a30", 0.03, 0.05, True, name="shopWinFrame"); Wd(6.0, 1.55, 0.85, 0.95, "#cfe9f7", 0.08, 0.02, False, name="shopWinGlass")
    Wd(6.0, 1.55, 0.04, 0.95, "#f4f1e8", 0.1, 0.01, False, name="shopWinMull"); Wd(5.75, 1.65, 0.26, 0.32, "#fbfbf8", 0.1, 0.01, False, name="shopNote")
    text("proShopSign", "PRO SHOP", 4.6, WF + 0.1, 3.08, 0.38, 2.4, INK, 0.06, True)
    # pro counter: glass display case with sparring gear and weapons
    grp("pro-counter")
    shadow(3.6, 11.95, 1.9, 0.3, 0.045, 0.22, "counterShadow")
    B(3.6, 11.5, 0.08, 3.4, 0.9, 0.16, "#25252e", True, name="caseKick")
    B(3.6, 11.5, 0.17, 3.36, 0.86, 0.03, "#f4f1e8", False, name="caseFloor")
    B(3.6, 11.5, 0.6, 3.3, 0.8, 0.03, "#e8f6fb", False, name="caseShelf")
    for k, (x, c) in enumerate(((2.25, "#d92b25"), (2.6, "#d92b25"), (3.2, "#f4f1e8"), (3.55, "#25252e"), (4.1, "#d92b25"), (4.45, "#d92b25"), (4.9, "#2f6fd6"))):
        E(x, 11.55, 0.74, 0.15, 0.13, 0.12, c, True, 10, 6, name="caseGear")
    for k, x in enumerate((2.3, 2.9, 3.6, 4.3, 4.9)):
        B(x, 11.55, 0.24, 0.45, 0.08, 0.04, ("#8a5a2e", "#25252e", "#c9a66b", "#8a5a2e", "#9aa0aa")[k], True, rot=(0, 0, 12 * (k % 2 * 2 - 1)), name="caseWeapon")
    for x in (1.92, 5.28):
        for rr_ in (11.07, 11.93): B(x, rr_, 0.62, 0.05, 0.05, 1.08, "#c8ccd4", True, name="casePost")
    B(3.6, 11.5, 1.17, 3.42, 0.9, 0.04, "#c8ccd4", True, name="caseTopRim")
    add_a("caseGlassFront", box(G(3.6, 11.95, 0.64), (3.3, 0.01, 1.0)), "#bfe6f2", 0.35)
    add_a("caseGlassTop", box(G(3.6, 11.5, 1.19), (3.34, D(0.84), 0.01)), "#bfe6f2", 0.4)
    for k in range(3): add_a("caseShine", box(G(2.3 + k * 1.3, 11.96, 0.75), (0.08, 0.01, 0.7), rot=(0, -25, 0)), "#ffffff", 0.35)
    B(5.0, 11.3, 1.3, 0.4, 0.32, 0.18, "#2b2b33", True, name="register"); B(5.0, 11.3, 1.42, 0.3, 0.2, 0.04, "#5a8fe6", False, name="registerScreen")
    B(2.3, 11.4, 1.27, 0.32, 0.22, 0.16, "#f2d27a", True, name="tissueBox"); E(2.3, 11.4, 1.37, 0.08, 0.05, 0.06, "#ffffff", False, 8, 4, name="tissue")
    # ======================= EAST WING: TWO WHITE CROSS DOORS with the HANDPRINT WALL between =======================
    grp("wing-east")
    WF = RW
    for (a, b), isB in ((LM.DOOR_A, False), (LM.DOOR_B, True)):
        grp("cross-door-b" if isB else "cross-door-a"); c = (a + b) / 2
        Wd(c, 1.25, 1.62, 2.52, "#2f6fd6", 0.03, 0.04, True, name="doorFrameBlue"); Wd(c, 1.2, 1.4, 2.4, "#fbfaf6", 0.07, 0.03, True, name="doorLeaf")
        for dx in (-0.32, 0.32):
            for (zc_, hh) in ((1.95, 0.6), (1.2, 0.6), (0.45, 0.55)):
                Wd(c + dx, zc_, 0.5, hh, "#e6e2d8", 0.1, 0.01, False, name="doorPanel"); Wd(c + dx, zc_, 0.42, hh - 0.08, "#f6f4ee", 0.105, 0.01, False, name="doorPanelIn")
        Wd(c, 1.45, 0.2, 1.75, RED, 0.115, 0.02, False, name="crossV"); Wd(c, 1.95, 1.0, 0.2, RED, 0.115, 0.02, False, name="crossH")
        E(c + 0.55, WF + 0.14, 1.1, 0.05, 0.03, 0.05, "#c8ccd4", True, 8, 6, name="knob")
        if not isB:
            Wd(c, 2.95, 0.36, 0.46, INK, 0.04, 0.04, True, name="crossFrame"); Wd(c, 2.95, 0.3, 0.4, "#f4f1e8", 0.07, 0.01, False, name="crossFrameIn")
            Wd(c, 2.95, 0.035, 0.3, "#3a2a20", 0.08, 0.01, False, name="crossPicV"); Wd(c, 3.02, 0.18, 0.035, "#3a2a20", 0.08, 0.01, False, name="crossPicH")
    grp("handprint-wall")
    a, b = LM.PRINTS; pcx = (a + b) / 2
    # wooden shield plaque with the school mark and a black belt
    wpoly([(pcx - 0.36, 3.05), (pcx + 0.36, 3.05), (pcx + 0.38, 2.5), (pcx + 0.2, 2.2), (pcx, 2.1), (pcx - 0.2, 2.2), (pcx - 0.38, 2.5)], "#5a2e14", 1, "plaque")
    wpoly([(pcx - 0.3, 2.99), (pcx + 0.3, 2.99), (pcx + 0.32, 2.52), (pcx + 0.17, 2.26), (pcx, 2.17), (pcx - 0.17, 2.26), (pcx - 0.32, 2.52)], "#8a4f24", 2, "plaqueIn")
    imgplane(LOGO, "plaqueLogo", pcx, 0.42, 0.42 * LOGO_AR, row=WF + 0.11, zc=2.66)
    for p in (rect((pcx - 0.05, 2.18), (pcx - 0.24, 1.72), 0.1), rect((pcx + 0.05, 2.18), (pcx + 0.24, 1.72), 0.1), rect((pcx - 0.42, 2.2), (pcx + 0.42, 2.2), 0.1)): wpoly(p, "#1d1b24", 3, "blackBelt")
    wpoly(circ(pcx, 2.2, 0.07, 10), "#1d1b24", 4, "beltKnot")
    def ppoly(pts, hexc, lay): return _poly("hp", [(x, -(WF + 0.075 + 0.006 * lay) * K, z) for x, z in pts], hexc, (0, -1, 0))
    n = 0
    for zr in range(6):
        for xr in range(7):
            x = a + 0.22 + xr * 0.42 + (0.1 if zr % 2 else 0) + rnd.uniform(-0.05, 0.05); z = 0.4 + zr * 0.44 + rnd.uniform(-0.05, 0.05)
            if x > b - 0.1 or (abs(x - pcx) < 0.62 and 1.6 < z < 3.15) or (x > b - 0.45 and z < 1.75): continue
            n += 1
            for poly_ in hand(x, z, 0.95, rnd.uniform(-25, 25)): ppoly(poly_, ("#d92b25", "#2f6fd6")[n % 2], 1)
    T(b - 0.2, WF + 0.16, 0.45, 1.25, 0.1, 0.1, "#d92b25", True, 12, name="extinguisher"); T(b - 0.2, WF + 0.16, 1.25, 1.38, 0.045, 0.04, "#25252e", False, 8, name="extHead")
    B(b - 0.2, WF + 0.2, 1.3, 0.16, 0.04, 0.04, "#25252e", False, name="extHandle")
    Wd(b - 0.2, 1.75, 0.12, 0.42, "#d92b25", 0.06, 0.02, False, name="extSign"); wpoly([(b - 0.24, 1.68), (b - 0.16, 1.68), (b - 0.2, 1.6)], "#ffffff", 8, "extArrow")
    # ======================= LOBBY =======================
    grp("trash-can")
    shadow(17.3, 17.62, 0.32, 0.2, 0.035, 0.2, "binShadow")
    T(17.3, 17.5, 0, 0.78, 0.25, 0.27, "#2b2b33", True, 14, name="trashCan", round_ground=True)
    T(17.3, 17.5, 0.78, 0.86, 0.29, 0.29, "#1d1b24", True, 14, name="trashLid", round_ground=True)
    B(17.3, 17.75, 0.4, 0.05, 0.02, 0.5, "#3a3a45", False, name="binRib")
    grp("plant")
    shadow(10.6, 17.65, 0.3, 0.2, 0.035, 0.2, "plantShadow")
    T(10.6, 17.5, 0, 0.42, 0.2, 0.25, "#b5643a", True, 14, name="plantPot", round_ground=True); T(10.6, 17.5, 0.38, 0.46, 0.27, 0.27, "#9a4f2c", True, 14, name="potRim", round_ground=True)
    for k in range(9):
        ang = k * 40; E(10.6 + 0.16 * math.cos(math.radians(ang)), 17.5 + 0.06 * math.sin(math.radians(ang)), 0.72 + 0.1 * (k % 3), 0.17, 0.08, 0.28,
                        ("#4f8a4a", "#5f9e55", "#6fb25f")[k % 3], True, 8, 4, rot=(0, 30 * math.cos(math.radians(ang)), ang), name="leaf")
    grp(None)
    if A.game: render_game(28.4, 21.2, 13.5, 8.5)
    else: finish_and_render(28.4, 21.2, 13.5, 8.5, "inside-main-floor@2x.png")


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
    B(sx(6), rsw(0), tiers[0][2] + 0.35, 0.26, 0.2, 0.05, "#ee7fb0", True, name="book")
    # floor: a welcome mat and a toy basket by the steps
    B(CX, 8.9, 0.04, 2.4, 0.7, 0.04, "#4a5470", True, name="mat"); B(CX, 8.9, 0.07, 2.2, 0.5, 0.02, "#f4f1e8", False, name="matInner")
    T(X0 - 1.35, 8.3, 0, 0.5, 0.3, 0.38, "#c9a86a", True, 14, name="basket", round_ground=True)
    for k, c in enumerate(("#2f6fd6", "#f5c542", "#3f9c4a", "#ee7fb0")): E(X0 - 1.4 + 0.13 * k, 8.3, 0.55, 0.11, 0.1, 0.11, c, True, 8, 6, name="toyball")
    finish_and_render(12.6, 9.2, CX, 5.0, "parent-seating@2x.png")

if A.scene == "outside": scene_outside()
elif A.scene == "inside": scene_inside()
elif A.scene == "seating": scene_seating()
