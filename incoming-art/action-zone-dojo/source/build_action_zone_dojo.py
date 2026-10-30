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

def scene_inside():
    global WF
    RED, BLUE = "#d92b25", "#2a5db0"
    WALL, CAP, SLAB, TILE, PRO = "#efe9d6", "#d8d2c0", "#8d8678", "#cdb89a", "#9ec3ee"
    TXD = os.path.join(HERE, "textures"); LOGO = os.path.join(TXD, "logo-mark.png"); LOGO_AR = 929 / 1000
    Wd_, Hh, RN, RW, RF = LM.W, LM.H, LM.R_N, LM.R_MAT_S, LM.R_FRONT; mid = Wd_ / 2
    grp("floor")
    # ---------- slab, lobby tile floor, mat platform (blue) ----------
    B(mid, (RN + RF) / 2, -0.15, Wd_ + 0.5, RF - RN + 0.5, 0.3, SLAB, True, name="floorslab")
    B(mid, (RW + RF) / 2, 0.015, Wd_, RF - RW, 0.03, TILE, False, name="lobbyTile")
    for x in range(2, 27, 2): B(x, (RW + RF) / 2, 0.032, 0.03, RF - RW, 0.004, "#bda98a", False, name="tileSeam")
    for r in (12.0, 14.0, 16.0): B(mid, r, 0.032, Wd_, 0.03, 0.004, "#bda98a", False, name="tileSeam")
    B(mid, (RN + RW) / 2, 0.06, Wd_, RW - RN, 0.12, BLUE, True, name="matPlatform")
    for x in range(2, 27, 2): fpoly(rect((x, RN), (x, RW), 0.04), 0.125, "#1f4a92", "seam")
    for r in range(3, 10, 2): fpoly(rect((0, r), (Wd_, r), 0.04), 0.125, "#1f4a92", "seam")
    x0, x1, r0, r1 = LM.REDSQ
    B((x0 + x1) / 2, (r0 + r1) / 2, 0.13, x1 - x0, r1 - r0, 0.02, RED, False, name="redSquare")
    for x in range(int(x0) + 1, int(x1), 2): fpoly(rect((x, r0), (x, r1), 0.04), 0.145, "#a81f1b", "seam")
    for r in range(int(r0) + 1, int(r1), 2): fpoly(rect((x0, r), (x1, r), 0.04), 0.145, "#a81f1b", "seam")
    lw = LM.LOGO_W; imgplane(LOGO, "floorLogo", LM.LOGO_C[0], lw, lw * LOGO_AR, rc=LM.LOGO_C[1], zf=0.155)
    # ---------- walls: north wall (the mat room's back), outer side walls, the two entry wings, low front curb (nothing above the drywall) ----------
    grp("walls")
    B(mid, RN - 0.17, Hh / 2, Wd_ + 0.3, 0.34, Hh, WALL, True, name="northwall"); B(mid, RN - 0.17, Hh + 0.04, Wd_ + 0.34, 0.38, 0.1, CAP, True, name="northcap")
    grp("floor"); B(mid, RN + 0.03, 0.06, Wd_, 0.04, 0.12, "#6d6a63", False, name="baseboard")   # sunk into the mat platform (hidden), so it goes with the floor
    grp("walls")
    for x in (-0.12, Wd_ + 0.12):
        B(x, (RN + RF) / 2, Hh / 2, 0.24, RF - RN, Hh, WALL, True, name="sidewall"); B(x, (RN + RF) / 2, Hh + 0.04, 0.3, RF - RN + 0.04, 0.1, CAP, True, name="sidecap")
    for (a, b, col, nm) in ((LM.WEST_WING[0], LM.WEST_WING[1], PRO, "westWing"), (LM.EAST_WING[0], LM.EAST_WING[1], "#f6f3ec", "eastWing")):
        grp("wing-west" if nm == "westWing" else "wing-east"); cx = (a + b) / 2; B(cx, RW - 0.17, Hh / 2, b - a, 0.34, Hh, col, True, name=nm); B(cx, RW - 0.17, Hh + 0.04, b - a + 0.04, 0.38, 0.1, CAP, True, name=nm + "Cap")
        B(cx, RW + 0.03, 0.06, b - a, 0.04, 0.12, "#6d6a63", False, name="baseboard")
    grp("wing-west"); B(LM.WEST_WING[1] - 0.1, RW + 1.2, Hh / 2, 0.2, 2.4, Hh, PRO, True, name="westStub"); grp("wing-east"); B(LM.EAST_WING[0] + 0.1, RW + 1.2, Hh / 2, 0.2, 2.4, Hh, "#f6f3ec", True, name="eastStub")
    grp("foreground")
    for (a, b) in ((0, LM.DOOR[0]), (LM.DOOR[1], Wd_)): B((a + b) / 2, RF, 0.25, b - a, 0.34, 0.5, WALL, True, name="frontCurb")
    for x in LM.DOOR: B(x, RF, 1.2, 0.14, 0.34, 2.4, "#6b4a3a", True, name="doorPost")
    B(sum(LM.DOOR) / 2, RF, 2.45, LM.DOOR[1] - LM.DOOR[0] + 0.14, 0.34, 0.1, "#6b4a3a", True, name="doorHead")
    for x in (LM.DOOR[0] + 0.1, LM.DOOR[1] - 0.1): B(x, RF - 0.6, 1.15, 0.08, 1.1, 2.3, "#6b4a3a", True, name="doorLeaf"); B(x, RF - 0.6, 1.5, 0.1, 0.5, 0.7, "#8ec6ff", False, name="doorGlass")
    grp("floor"); B(sum(LM.DOOR) / 2, RF - 1.3, 0.04, 2.2, 0.9, 0.04, "#4a3226", True, name="welcomeMat"); B(sum(LM.DOOR) / 2, RF - 1.3, 0.065, 2.0, 0.7, 0.02, "#c9a86a", False, name="welcomeMatInner")
    # ======================= NORTH WALL (mat room): left to right = target wall, styles + logo mural, back doors, flag, Class Creed, belt creed =======================
    WF = RN
    grp("target-wall")
    a, b = LM.TARGET; cx = (a + b) / 2
    Wd(cx, 1.7, b - a, 2.95, "#c8924f", 0.025, 0.04, True, name="targetWood")
    for k in range(int((b - a) / 0.36)): Wd(a + 0.2 + k * 0.36, 1.7, 0.02, 2.9, "#a9763a" if k % 2 else "#b6823f", 0.04, 0.01, False, name="plank")
    Wd(cx, 3.22, b - a + 0.1, 0.09, "#f4f1e8", 0.05, 0.03, False, name="targetTrim")
    def yellow_man(x, z0):
        body = [(-0.15, 0.62), (0.15, 0.62), (0.30, 0.52), (0.34, 0.38), (0.28, 0.0), (0.2, -0.2), (-0.2, -0.2), (-0.28, 0.0), (-0.34, 0.38), (-0.30, 0.52)]
        zc = z0 + 0.2; P = lambda pts, sc_=1.0, dz=0.0: [(x + sc_ * px, zc + sc_ * py + dz) for px, py in pts]
        wpoly(P(body, 1.12, -0.04), "#14121c", 1, "manLine"); wpoly(circ(x, zc + 0.78, 0.155, 16), "#14121c", 1, "headLine")
        wpoly(P(body), "#f5c82e", 2, "man"); wpoly(circ(x, zc + 0.78, 0.13, 16), "#f5c82e", 2, "head"); wpoly(P(rect((0, 0.6), (0, 0.7), 0.16)), "#f5c82e", 2, "neck")
        wpoly(P(((-0.2, -0.2), (0.2, -0.2), (0.28, 0.02), (-0.28, 0.02))), "#25252e", 3, "shorts")
        for q in (rect((-0.16, 0.3), (-0.02, 0.27), 0.025), rect((0.16, 0.3), (0.02, 0.27), 0.025), rect((0, 0.45), (0, 0.06), 0.02)): wpoly(P(q), "#d9a820", 3, "manDetail")
    for row, z0 in enumerate((1.9, 0.62)):
        for k in range(6): yellow_man(a + 0.55 + k * 1.0 + 0.08 * row, z0)
    grp("walls")
    B(7.3, WF + 0.3, 3.25, 1.5, 0.18, 0.14, "#7a4a30", True, name="ropeRail")
    for x in (6.62, 7.98): B(x, WF + 0.12, 3.25, 0.1, 0.22, 0.2, "#5b4234", False, name="ropeBracket")
    for k in range(4):
        x = 6.9 + k * 0.28; zb = 2.1 + 0.12 * (k % 2); T(x, WF + 0.32, zb, 3.2, 0.03, 0.03, "#d9c08a", False, 6, name="rope")
        for q in range(3): E(x, WF + 0.32, zb + 0.25 + q * 0.3, 0.05, 0.04, 0.05, "#c9a86a", False, 6, 4, name="knot")
        E(x, WF + 0.32, zb, 0.06, 0.05, 0.06, "#7a4a30", False, 8, 4, name="ropeEnd")
    a, b = LM.MURAL; cx = (a + b) / 2
    Wd(cx, 1.7, b - a, 2.95, "#faf8f2", 0.03, 0.04, True, name="muralWall")
    imgplane(LOGO, "muralLogo", cx, 1.7, 1.7 * LOGO_AR, row=WF + 0.1, zc=1.72)
    for s, x, z, w in (("Karate", cx, 3.0, 1.0), ("Kung Fu", a + 0.95, 2.72, 0.95), ("Jiu Jitsu", b - 0.95, 2.72, 1.0), ("Tae Kwon Do", a + 0.95, 0.98, 1.3), ("Weapons", b - 0.95, 0.98, 1.0)): text("t_" + s, s, x, WF + 0.1, z, 0.22, w, "#14121c", 0.03, False)
    for poly_ in figure("kick", a + 0.95, 1.88, 0.85): wpoly(poly_, "#14121c", 4, "silKick")
    for poly_ in figure("block", b - 0.95, 1.88, 0.85): wpoly(poly_, "#14121c", 4, "silStance")
    for poly_ in figure("split", cx, 0.46, 0.5): wpoly(poly_, "#14121c", 4, "silSplit")
    grp("back-doors")
    a, b = LM.BACK_DOOR; cx = (a + b) / 2
    Wd(cx, 1.25, b - a + 0.2, 2.55, "#4a3226", 0.03, 0.05, True, name="backDoorFrame")
    for k in (-1, 1):
        x = cx + k * 0.52; Wd(x, 1.2, 1.0, 2.35, "#6b4a3a", 0.07, 0.03, True, name="backDoorLeaf"); Wd(x, 1.7, 0.6, 0.85, "#8ec6ff", 0.1, 0.02, False, name="backDoorGlass"); Wd(x - k * 0.38, 1.0, 0.05, 0.4, "#c8ccd4", 0.1, 0.02, False, name="doorBar")
    for k, x in enumerate((cx - 0.75, cx, cx + 0.75)):
        Wd(x, 3.0, 0.5, 0.38, "#5b4234", 0.035, 0.05, True, name="doorFrameArt"); Wd(x, 3.0, 0.4, 0.28, ("#8ec6ff", "#ffd36b", "#7fd1b9")[k], 0.075, 0.02, False, name="doorArt")
    grp("walls")
    a, b = LM.FLAG; cx = (a + b) / 2
    imgplane(os.path.join(TXD, "us-flag.png"), "flag", cx, 1.9, 1.0, row=WF + 0.09, zc=2.55)
    Wd(cx, 3.1, 2.0, 0.05, "#c8ccd4", 0.07, 0.02, False, name="flagBar")
    grp("props")
    B(cx, WF + 0.25, 0.65, 1.6, 0.5, 1.3, "#f4f1e8", True, name="gearShelf")
    for k in range(2):
        for j in range(3): B(cx - 0.5 + j * 0.5, WF + 0.52, 0.3 + k * 0.6, 0.4, 0.02, 0.4, "#3b3f4c", False, name="shelfHole")
    for k, c in enumerate(("#2f6fd6", "#f5c542", "#d92b25")): E(cx - 0.5 + k * 0.5, WF + 0.4, 0.3, 0.17, 0.12, 0.14, c, True, 8, 6, name="shelfGlove")
    grp("walls")
    a, b = LM.CREED; cx = (a + b) / 2
    Wd(cx, 1.75, 2.68, 2.84, "#14121c", 0.04, 0.05, True, name="creedFrame"); imgplane(os.path.join(TXD, "class-creed.png"), "classCreed", cx, 2.6, 2.6 * 1060 / 1000, row=WF + 0.1, zc=1.75)
    a, b = LM.BELTS; cx = (a + b) / 2
    Wd(cx, 1.74, 2.58, 3.1, "#14121c", 0.04, 0.05, True, name="beltFrame"); imgplane(os.path.join(TXD, "belt-creed.png"), "beltCreed", cx, 2.5, 2.5 * 1818 / 1500, row=WF + 0.1, zc=1.74)
    # crash-mat stack + punching bags (right) + a whiteboard on a stand
    grp("props")
    a, b, ra, rb = LM.CRASH; cxm, rcm = (a + b) / 2, (ra + rb) / 2
    for k, c in enumerate((BLUE, "#6f9be0", BLUE)): B(cxm + 0.04 * (k % 2), rcm, 0.18 + 0.3 * k, b - a, rb - ra, 0.28, c, True, bevel=0.03, name=f"crashMat{k}")
    B(cxm, rb - 0.02, 0.5, 0.4, 0.03, 0.08, "#f4f1e8", False, name="crashHandle")
    for (x, r, c) in LM.BAGS:
        col = {"black": "#3a3a45", "blue": "#2f6fd6", "red": "#d92b25"}[c]; grp("bag-" + c)
        T(x, r, 0.12, 0.7, 0.5, 0.45, "#25252e", True, 18, name="bagBase", round_ground=True); T(x, r, 0.7, 2.1, 0.29, 0.29, col, True, 16, name="bag", round_ground=True)
        E(x, r, 2.1, 0.29, 0.29, 0.2, col, True, 16, 8, name="bagTop"); B(x, r + 0.01, 1.3, 0.5, 0.45, 0.1, "#f4f1e8", False, name="bagBand")
    grp("whiteboard")
    B(21.3, 6.3, 1.45, 1.4, 0.08, 0.9, "#f4f1e8", True, name="whiteboard"); B(21.3, 6.3, 1.45, 1.5, 0.06, 1.0, "#7a4a30", True, name="whiteboardFrame")
    for dx in (-0.6, 0.6): T(21.3 + dx, 6.45, 0.12, 1.0, 0.04, 0.04, "#3a3a45", False, 6, name="wbLeg")
    # ======================= RED GEAR-BAG BOX (cubby) + the GAP =======================
    grp("gear-box")
    x0, x1, r0, r1 = LM.CUBBY; cx, rc = (x0 + x1) / 2, (r0 + r1) / 2
    B(cx, rc, 0.62, x1 - x0, r1 - r0, 1.0, RED, True, bevel=0.02, name="cubby"); B(cx, r1 - 0.02, 0.2, x1 - x0 + 0.06, 0.08, 0.16, BLUE, True, name="cubbyBase"); B(cx, rc, 1.125, x1 - x0 - 0.2, r1 - r0 - 0.2, 0.02, "#b3201c", False, name="cubbyLid")
    BAGC = ("#2f6fd6", "#f5c542", "#3f9c4a", "#25252e", "#ee7fb0", "#f08a24", "#8a5bd0")
    for k in range(5):
        x = x0 + 1.0 + k * 1.3; B(x, r1 + 0.01, 0.78, 0.95, 0.02, 0.62, "#3b1a1a", False, name="cubbyOpening"); E(x, r1 + 0.04, 0.6, 0.33, 0.2, 0.2, BAGC[k], True, 10, 6, name="gearBag")
    B(11.3, rc, 1.2, 0.55, 0.4, 0.08, "#2f6fd6", True, name="book"); B(11.35, rc, 1.28, 0.5, 0.35, 0.07, "#f4f1e8", True, name="book"); B(15.0, rc, 1.17, 0.7, 0.45, 0.05, "#f4f1e8", False, name="papers"); E(16.2, rc, 1.3, 0.4, 0.3, 0.22, "#f5c542", True, 10, 6, name="topBag")
    grp("floor")
    for g in (LM.GAP, LM.GAP_R): B(sum(g) / 2, RW + 0.14, 0.05, g[1] - g[0], 0.3, 0.1, "#c9a86a", True, name="gapThreshold")
    # ======================= PARENT SEATING (the approved stadium seats, now facing the mat) =======================
    grp("seats")
    X0, X1 = LM.SEATS; NS = 8; pitch = (X1 - X0 - 0.6) / NS; smid = (X0 + X1) / 2
    for ti, (rf, dp, zt) in enumerate(LM.TIERS):
        B(smid, rf - dp / 2, zt / 2, X1 - X0, dp, zt, "#4a5470", True, name=f"deck{ti}"); B(smid, rf, zt - 0.1, X1 - X0, 0.03, 0.05, "#f4f1e8", False, name=f"riserStripe{ti}")
        B(smid, rf - dp / 2, zt + 0.01, X1 - X0, dp - 0.05, 0.03, "#5a6685", False, name=f"deckTop{ti}")
        for sx_ in (X1 + 0.55, X0 - 0.55): B(sx_, rf - dp / 2, zt / 2, 0.8, dp, zt, "#6a7694", True, name=f"step{ti}"); B(sx_, rf, zt - 0.08, 0.8, 0.03, 0.05, "#f4f1e8", False, name=f"stepStripe{ti}")
        rs = rf - dp / 2 - 0.1
        for k in range(NS):
            x = X0 + 0.3 + pitch * (k + 0.5); c = RED if (k + ti) % 2 == 0 else BLUE; dk = "#a81f1b" if c == RED else "#1d4aa0"
            B(x, rs, zt + 0.17, pitch - 0.08, 0.5, 0.32, c, True, bevel=0.03, name="seat"); B(x, rs - 0.23, zt + 0.37, pitch - 0.1, 0.07, 0.07, dk, False, name="seatEdge")
            FG[0] = "seat-backs"; B(x, rs + 0.2, zt + 0.55, pitch - 0.08, 0.1, 0.62, c, True, bevel=0.03, name="seatBack"); B(x, rs + 0.26, zt + 0.5, pitch - 0.3, 0.02, 0.38, dk, False, name="seatBackInset"); FG[0] = None
            B(x, rs, zt + 0.02, 0.1, 0.3, 0.05, "#2c2c33", False, name="seatFoot")
        for k in range(NS + 1):
            x = X0 + 0.3 + pitch * k; B(x, rs, zt + 0.42, 0.045, 0.45, 0.04, "#2c2c33", True, name="armrest"); B(x, rs, zt + 0.22, 0.04, 0.04, 0.4, "#2c2c33", False, name="armpost")
    sxk = lambda k: X0 + 0.3 + pitch * (k + 0.5); rsw = lambda ti: LM.TIERS[ti][0] - LM.TIERS[ti][1] / 2 - 0.1
    B(sxk(5), rsw(1), LM.TIERS[1][2] + 0.45, 0.42, 0.32, 0.24, "#f5c542", True, bevel=0.04, name="seatBag"); E(sxk(2), rsw(2) + 0.2, LM.TIERS[2][2] + 0.95, 0.3, 0.14, 0.14, "#7fd1b9", True, 10, 6, name="jacket")
    # ======================= WEST WING: PRO SHOP (on your left as you enter) =======================
    grp("wing-west")
    WF = RW; a, b = LM.WEST_WING
    for k, (x, z, rd) in enumerate(((0.9, 0.9, 0.5), (2.2, 2.7, 0.35), (3.5, 3.1, 0.45), (5.0, 2.4, 0.3), (6.3, 1.2, 0.5), (1.6, 3.0, 0.3), (4.4, 0.8, 0.4), (5.9, 3.0, 0.35), (0.5, 2.6, 0.3), (6.7, 2.2, 0.28))):
        wpoly(circ(x, z, rd, 18, 1.5, 0.8), "#cfe1f7", 0, "cloud")
    Wd(0.8, 2.0, 0.92, 1.18, "#6b4a2a", 0.03, 0.05, True, name="lionFrame"); Wd(0.8, 2.0, 0.76, 1.02, "#c98a3a", 0.075, 0.02, False, name="lionPic")
    wpoly(circ(0.8, 2.1, 0.27, 20), "#8a4b1e", 2, "mane"); wpoly(circ(0.8, 2.1, 0.16, 16), "#e0a95a", 3, "lionFace"); wpoly([(0.5, 1.6), (0.8, 1.9), (1.1, 1.6)], "#6b4a2a", 2, "lionBody")
    Wd(3.4, 1.85, 2.4, 1.9, "#2b2e38", 0.03, 0.03, True, name="gridWall")
    for k in range(9): Wd(3.4, 0.98 + k * 0.2, 2.4, 0.012, "#4a4f5e", 0.06, 0.01, False, name="gridH")
    for k in range(9): Wd(2.3 + k * 0.3, 1.85, 0.012, 1.9, "#4a4f5e", 0.06, 0.01, False, name="gridV")
    for k in range(5):
        x = 2.45 + k * 0.46; Wd(x, 2.35, 0.38, 0.5, "#f4f1e8", 0.08, 0.02, True, name="uniformBag"); imgplane(LOGO, "proLogo", x, 0.24, 0.24 * LOGO_AR, row=WF + 0.11, zc=2.3)
        Wd(x, 1.55, 0.38, 0.45, "#3a3a45", 0.08, 0.02, True, name="padBag"); imgplane(LOGO, "proLogo2", x, 0.24, 0.24 * LOGO_AR, row=WF + 0.11, zc=1.55)
    Wd(1.7, 1.35, 0.8, 1.2, "#2b2e38", 0.03, 0.03, True, name="beltRack")
    for k, c in enumerate(list(BELT.values())[:6]): Wd(1.7, 1.75 - k * 0.19, 0.64, 0.1, c, 0.08, 0.02, False, name="beltRackBar")
    Wd(5.9, 2.75, 1.6, 0.05, "#25252e", 0.07, 0.02, False, name="hangRail")
    for k, x in enumerate((5.4, 5.9, 6.4)): wpoly([(x - 0.12, 2.7), (x + 0.12, 2.7), (x + 0.32, 2.55), (x + 0.24, 2.4), (x + 0.15, 2.45), (x + 0.15, 1.9), (x - 0.15, 1.9), (x - 0.15, 2.45), (x - 0.24, 2.4), (x - 0.32, 2.55)], "#25252e" if k != 1 else "#2f6fd6", 2, "tee")
    text("proShopSign", "PRO SHOP", 4.9, WF + 0.1, 3.05, 0.4, 2.3, "#14121c", 0.05, False)
    grp("pro-counter")
    B(3.6, 11.5, 0.45, 3.4, 0.9, 0.9, "#f4f1e8", True, name="proCounter"); B(3.6, 11.5, 1.1, 3.4, 0.9, 0.5, "#b8dcee", True, name="glassCase"); B(3.6, 11.5, 1.37, 3.5, 0.95, 0.06, "#f4f1e8", True, name="caseTop")
    for k, c in enumerate(list(BELT.values())[:7]): B(2.3 + k * 0.38, 11.97, 1.05, 0.3, 0.03, 0.22, c, False, name="beltInCase")
    for x, c in ((2.3, "#d92b25"), (2.7, "#d92b25"), (3.6, "#2f6fd6"), (4.3, "#d92b25"), (4.6, "#d92b25")): E(x, 11.5, 1.55, 0.17, 0.14, 0.14, c, True, 8, 6, name="proGear")
    B(5.0, 11.3, 1.55, 0.45, 0.35, 0.2, "#3a3a45", True, name="register")
    # ======================= EAST WING: TWO CROSS DOORS with the HANDPRINT WALL between =======================
    grp("wing-east")
    WF = RW
    for (a, b), isB in ((LM.DOOR_A, False), (LM.DOOR_B, True)):
        grp("cross-door-b" if isB else "cross-door-a"); c = (a + b) / 2; Wd(c, 1.25, 1.62, 2.5, "#2f6fd6", 0.03, 0.04, True, name="doorFrameBlue"); Wd(c, 1.2, 1.4, 2.4, "#f4f1e8", 0.07, 0.03, True, name="doorLeaf")
        for dx in (-0.3, 0.3): Wd(c + dx, 1.8, 0.5, 0.75, "#e6e2d8", 0.1, 0.01, False, name="doorPanel"); Wd(c + dx, 0.55, 0.5, 0.6, "#e6e2d8", 0.1, 0.01, False, name="doorPanel")
        Wd(c, 1.55, 0.17, 1.3, RED, 0.11, 0.02, False, name="crossV"); Wd(c, 1.85, 0.8, 0.17, RED, 0.11, 0.02, False, name="crossH"); Wd(c + 0.55, 1.1, 0.09, 0.09, "#c8ccd4", 0.11, 0.03, False, name="knob")
        if isB: Wd(c - 0.5, 1.25, 0.26, 0.34, "#2f6fd6", 0.11, 0.02, False, name="doorPlate")
    grp("handprint-wall")
    a, b = LM.PRINTS; pcx = (a + b) / 2
    wpoly(circ(pcx, 2.6, 0.44, 24, 0.82, 1.0), "#7a3f22", 1, "plaque"); wpoly(circ(pcx, 2.6, 0.36, 24, 0.82, 1.0), "#9a5a30", 2, "plaqueIn"); imgplane(LOGO, "plaqueLogo", pcx, 0.5, 0.5 * LOGO_AR, row=WF + 0.11, zc=2.62)
    for p in (rect((pcx, 2.14), (pcx - 0.22, 1.7), 0.1), rect((pcx, 2.14), (pcx + 0.22, 1.7), 0.1), rect((pcx - 0.55, 2.14), (pcx + 0.55, 2.14), 0.09)): wpoly(p, "#25252e", 3, "blackBelt")
    def ppoly(pts, hexc, lay): return _poly("hp", [(x, -(WF + 0.075 + 0.006 * lay) * K, z) for x, z in pts], hexc, (0, -1, 0))
    n = 0
    for zr in range(5):
        for xr in range(6):
            x = a + 0.28 + xr * 0.5 + (0.12 if zr % 2 else 0); z = 0.45 + zr * 0.5
            if x > b - 0.1 or (abs(x - pcx) < 0.75 and 1.75 < z < 3.0) or (x > b - 0.5 and z < 1.6): continue
            n += 1
            for poly_ in hand(x, z, 1.1, ((n * 37) % 40) - 20): ppoly(poly_, "#d92b25" if n % 2 else "#2f6fd6", 1)
    T(b - 0.2, WF + 0.16, 0.45, 1.3, 0.1, 0.1, "#d92b25", True, 10, name="extinguisher"); T(b - 0.2, WF + 0.16, 1.3, 1.4, 0.04, 0.04, "#25252e", False, 6, name="extHead")
    # ======================= LOBBY LITTLE THINGS =======================
    grp("bench")
    B(2.4, 15.9, 0.25, 1.8, 0.5, 0.1, "#9aa0b0", True, name="bench")
    for x in (1.65, 3.15): B(x, 15.9, 0.12, 0.12, 0.4, 0.24, "#5b5f6e", False, name="benchLeg")
    grp("trash-can")
    T(17.3, 17.5, 0, 0.8, 0.27, 0.24, "#7a7f8c", True, 12, name="trashCan", round_ground=True)
    grp("plant")
    T(10.6, 17.5, 0, 0.45, 0.25, 0.2, "#a05a38", True, 12, name="plantPot", round_ground=True)
    for k in range(5): E(10.6 + 0.12 * math.cos(k * 1.3), 17.5, 0.75 + 0.07 * (k % 2), 0.2, 0.12, 0.3, "#5f9e55", True, 8, 4, rot=(0, 15 * (k - 2), 0), name="leaf")
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
