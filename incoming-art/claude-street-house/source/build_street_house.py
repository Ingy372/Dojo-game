"""The Street Smarts House (Jay, Nov 23: the town's market building becomes the Street Smarts House, run by Michael).

One cozy room in the house look (toon_kit materials and outlines, the standard camera: orthographic, looking north 35 deg
down, 80 px per tile, ground on the game grid: G(col,row) = (col, -row*K, z), K = 1/sin35).
  13 x 10 tiles. Row 0 = the back wall, rows 1-8 the room, row 9 the front wall with the door (cells 5-7).
  Back wall: the big STREET SMARTS story board (left, Michael's desk in front of it), the Safety Tips poster (middle),
  the badge wall (right). Two benches facing the board, a bookshelf on the east side, plants in the front corners.
Game art: one full-frame PNG per group (floor, walls, props, foreground and one per y-sorted piece) into --game.

    blender -b -P build_street_house.py -- --game <dir> [--samples 16]
    python make_game_house.py <dir>
"""
import bpy, sys, os, math, argparse
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from toon_kit import *
from mathutils import Vector, Euler

ap = argparse.ArgumentParser()
ap.add_argument("--game", required=True)
ap.add_argument("--samples", type=int, default=16)
ap.add_argument("--ppt", type=int, default=80)
A = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
EL = 35.0; K = 1 / math.sin(math.radians(EL))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; coll = sc.collection
OUT_M = outline_material(); MATS = {}


def mat(h):
    if h not in MATS:
        MATS[h] = toon_material("M" + h, h)
    return MATS[h]


GRP = ["floor"]


def add(name, bm, hexc, outline=True, ow=1.4):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat(hexc))
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob)
    ob["grp"] = GRP[0]
    if outline:
        h = add_hull(ob, coll, OUT_M, OUTLINE_W * ow); h["grp"] = GRP[0]
    return ob


def G(c, r, z=0.0):
    return (c, -r * K, z)


def D(rows):
    return rows * K


def B(x0, x1, r0, r1, z0, z1, hexc, outline=True, bevel=0.0, name="b"):
    """a box from column x0 to x1, ground row r0 to r1, height z0 to z1"""
    return add(name, box(G((x0 + x1) / 2, (r0 + r1) / 2, (z0 + z1) / 2), (x1 - x0, D(r1 - r0), z1 - z0), bevel=bevel), hexc, outline)


def E(cx, r, z, sx, sr, sz, hexc, outline=True, segs=14, rings=8, name="e"):
    return add(name, ellipsoid(G(cx, r, z), (sx, D(sr), sz), segs=segs, rings=rings), hexc, outline)


def Tb(cx, r, z0, z1, r0, r1, hexc, outline=True, segs=12, name="t"):
    return add(name, tube(G(cx, r, z0), G(cx, r, z1), r0, r1, segs=segs, sy=K), hexc, outline)


FONT = None
for p in ("C:/Windows/Fonts/ariblk.ttf", "C:/Windows/Fonts/arialbd.ttf"):
    if os.path.exists(p):
        FONT = bpy.data.fonts.load(p); break


def text(name, s, cx, r, z, height, width, hexc, extr=0.02):
    """flat 3D letters on a wall that faces the camera (height/width in tiles)"""
    cu = bpy.data.curves.new(name, "FONT"); cu.body = s; cu.size = 1.0; cu.extrude = extr; cu.align_x = "CENTER"; cu.align_y = "CENTER"
    if FONT:
        cu.font = FONT
    ob = bpy.data.objects.new(name, cu); coll.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    bpy.ops.object.convert(target="MESH"); ob = bpy.context.view_layer.objects.active
    xs = [v.co.x for v in ob.data.vertices]; zs = [v.co.y for v in ob.data.vertices]
    sx = width / max(max(xs) - min(xs), 1e-6); sz = height / max(max(zs) - min(zs), 1e-6); s_ = min(sx, sz)
    for v in ob.data.vertices:
        v.co.x = (v.co.x - (max(xs) + min(xs)) / 2) * s_; v.co.y = (v.co.y - (max(zs) + min(zs)) / 2) * s_
    ob.rotation_euler = (math.radians(90), 0, 0); ob.location = G(cx, r, z)
    ob.data.materials.clear(); ob.data.materials.append(mat(hexc)); ob["grp"] = GRP[0]; ob.select_set(False)
    return ob


W, WALL_R, FRONT_R, WALL_H = 13.0, 1.0, 9.35, 2.5

# ---------------------------------------------------------------- floor: warm planks and a round blue rug
GRP[0] = "floor"
B(-0.3, W + 0.3, 0.0, 10.0, -0.06, 0.0, "#c99a62", outline=False, name="floor")
for k in range(1, 26):
    B(-0.3, W + 0.3, k * 0.4 - 0.012, k * 0.4 + 0.012, 0.0, 0.003, "#b0834f", outline=False, name="plank")
E(6.5, 5.6, 0.004, 3.2, 1.55, 0.004, "#3f6fb8", outline=False, segs=40, name="rug")
E(6.5, 5.6, 0.007, 2.85, 1.3, 0.004, "#5b8fd6", outline=False, segs=40, name="rug2")
E(6.5, 5.6, 0.010, 0.9, 0.42, 0.004, "#f2c94c", outline=False, segs=24, name="rugstar")
B(5.0, 8.0, 9.1, 9.9, 0.0, 0.01, "#7a5a3a", outline=False, name="doormat")

# ---------------------------------------------------------------- walls: back wall with wainscot, thin side walls
GRP[0] = "walls"
B(-0.3, W + 0.3, WALL_R - 0.25, WALL_R, 0.0, WALL_H, "#cfe6dd", name="backwall")
B(-0.3, W + 0.3, WALL_R - 0.02, WALL_R + 0.02, 0.0, 0.7, "#9c6b43", name="wainscot")
B(-0.3, W + 0.3, WALL_R - 0.03, WALL_R + 0.04, 0.68, 0.76, "#7a5232", name="rail")
B(-0.3, W + 0.3, WALL_R - 0.26, WALL_R + 0.02, WALL_H - 0.08, WALL_H, "#7a5232", name="topTrim")
for x in (-0.3, W):
    B(x, x + 0.3, 0.0, 9.6, 0.0, WALL_H, "#b9d6cc", name="sidewall")

# ---------------------------------------------------------------- props on the back wall (drawn under everyone)
GRP[0] = "props"
# the STREET SMARTS story board (cork in a wood frame) with three picture cards
B(1.0, 5.4, WALL_R - 0.02, WALL_R + 0.05, 0.85, 2.25, "#7a5232", name="boardFrame")
B(1.12, 5.28, WALL_R + 0.04, WALL_R + 0.07, 0.95, 2.15, "#d4a868", outline=False, name="cork")
B(1.4, 5.0, WALL_R + 0.06, WALL_R + 0.1, 1.82, 2.08, "#c8432f", name="titleStrip")
text("titleText", "STREET SMARTS", 3.2, WALL_R + 0.11, 1.95, 0.16, 3.3, "#fff6e0")
for i, (cx, col) in enumerate(((1.85, "#6cc070"), (3.2, "#5aa0e0"), (4.55, "#f0a040"))):
    B(cx - 0.5, cx + 0.5, WALL_R + 0.06, WALL_R + 0.1, 1.02, 1.68, "#fffaf0", name=f"card{i}")
    B(cx - 0.42, cx + 0.42, WALL_R + 0.09, WALL_R + 0.12, 1.18, 1.6, col, outline=False, name=f"pic{i}")
    E(cx, WALL_R + 0.12, 1.66, 0.05, 0.02, 0.05, "#d63a3a", name=f"pin{i}")
# Safety Tips poster: a blue shield with a check mark
B(5.95, 7.35, WALL_R - 0.02, WALL_R + 0.05, 0.95, 2.2, "#fffaf0", name="poster")
text("posterTitle", "SAFETY TIPS", 6.65, WALL_R + 0.06, 2.0, 0.13, 1.15, "#2f5aa0")
E(6.65, WALL_R + 0.07, 1.45, 0.36, 0.02, 0.4, "#3f78d0", name="shield")
B(6.48, 6.6, WALL_R + 0.09, WALL_R + 0.11, 1.33, 1.43, "#ffffff", outline=False, name="tick1")
B(6.58, 6.9, WALL_R + 0.09, WALL_R + 0.11, 1.38, 1.62, "#ffffff", outline=False, name="tick2")
for k in range(3):
    B(6.15, 7.15, WALL_R + 0.06, WALL_R + 0.08, 1.02 - k * 0.0, 1.06, "#9bb3d6", outline=False, name="line")
# the badge wall: a dark wood panel with two rows of round gold frames
B(7.9, 12.1, WALL_R - 0.02, WALL_R + 0.05, 0.85, 2.25, "#5a3d27", name="badgePanel")
text("badgeTitle", "BADGES", 10.0, WALL_R + 0.06, 2.05, 0.15, 1.4, "#f2c94c")
for row, z in enumerate((1.68, 1.08)):
    for k in range(4):
        cx = 8.55 + k * 0.97
        E(cx, WALL_R + 0.07, z, 0.25, 0.025, 0.25, "#d9a93a", name="badgeRim")
        E(cx, WALL_R + 0.1, z, 0.18, 0.02, 0.18, "#f6e3a8" if (row + k) % 2 else "#e8d5a0", outline=False, name="badgeFace")

# ---------------------------------------------------------------- the front wall (drawn above everyone)
GRP[0] = "foreground"
B(-0.3, 5.0, FRONT_R - 0.15, FRONT_R + 0.15, 0.0, 0.62, "#b9d6cc", name="frontL")
B(8.0, W + 0.3, FRONT_R - 0.15, FRONT_R + 0.15, 0.0, 0.62, "#b9d6cc", name="frontR")
B(-0.3, 5.0, FRONT_R - 0.17, FRONT_R + 0.17, 0.6, 0.68, "#7a5232", name="frontCapL")
B(8.0, W + 0.3, FRONT_R - 0.17, FRONT_R + 0.17, 0.6, 0.68, "#7a5232", name="frontCapR")
for x in (4.9, 8.0):
    B(x - 0.1, x + 0.1, FRONT_R - 0.2, FRONT_R + 0.2, 0.0, 0.85, "#7a5232", name="doorPost")

# ---------------------------------------------------------------- y-sorted pieces (each its own sprite)
GRP[0] = "desk"
B(2.0, 4.6, 2.35, 2.95, 0.0, 0.72, "#a8754a", name="desk")
B(1.95, 4.65, 2.3, 3.0, 0.72, 0.8, "#7a5232", name="deskTop")
B(2.1, 4.5, 2.92, 2.96, 0.1, 0.6, "#8f6040", outline=False, name="deskFront")
B(2.25, 2.75, 2.45, 2.75, 0.8, 0.95, "#3f6fb8", name="book1")
B(2.3, 2.7, 2.45, 2.75, 0.95, 1.06, "#d65a4a", name="book2")
Tb(4.15, 2.6, 0.8, 1.15, 0.03, 0.03, "#3a3a44", name="lampPole")
E(4.15, 2.6, 1.2, 0.17, 0.1, 0.1, "#f2c94c", name="lampShade")

for name, x0, x1 in (("bench-a", 3.6, 6.1), ("bench-b", 6.9, 9.4)):
    GRP[0] = name
    B(x0, x1, 6.75, 7.2, 0.32, 0.42, "#a8754a", name="seat")
    for lx in (x0 + 0.15, x1 - 0.25):
        B(lx, lx + 0.1, 6.8, 7.15, 0.0, 0.32, "#7a5232", name="leg")

GRP[0] = "bookshelf"
B(11.6, 12.85, 3.0, 4.6, 0.0, 1.9, "#8f6040", name="shelf")
for k, z in enumerate((0.25, 0.75, 1.25)):
    B(11.62, 11.7, 3.05, 4.55, z, z + 0.05, "#7a5232", outline=False, name="board")
    for j in range(5):
        col = ("#3f6fb8", "#d65a4a", "#6cc070", "#f0a040", "#8a5ac8")[(j + k) % 5]
        B(11.55, 11.62, 3.12 + j * 0.28, 3.34 + j * 0.28, z + 0.05, z + 0.42 - (j % 2) * 0.06, col, outline=False, name="spine")

for name, cx, r in (("plant-a", 0.7, 8.3), ("plant-b", 12.3, 8.3)):
    GRP[0] = name
    Tb(cx, r, 0.0, 0.42, 0.26, 0.2, "#c46a3a", name="pot")
    for k, (dx, dz, s) in enumerate(((0, 0.75, 0.32), (-0.18, 0.62, 0.24), (0.2, 0.6, 0.24), (0.05, 1.0, 0.22))):
        E(cx + dx, r, dz, s, s * 0.8, s, "#4f9a54" if k % 2 else "#5fb064", name="leaf")

# ---------------------------------------------------------------- camera and per-group renders
COLS, ROW_TOP, ROW_BOT = W + 0.8, -1.6, 10.3
FRAME_ROWS = ROW_BOT - ROW_TOP
RC = (ROW_TOP + ROW_BOT) / 2
r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = A.samples; sc.cycles.use_denoising = False
r.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
r.resolution_x, r.resolution_y = round(COLS * A.ppt), round(FRAME_ROWS * A.ppt); r.resolution_percentage = 100
cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = COLS; cd.clip_end = 300
cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
cam.rotation_euler = (math.radians(90 - EL), 0, 0)
d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
cam.location = Vector((W / 2, -RC * K, 0)) - d * 60
os.makedirs(A.game, exist_ok=True)
meshes = [o for o in bpy.data.objects if o.type == "MESH"]
groups = sorted({o["grp"] for o in meshes})
for g in groups:
    for o in meshes:
        o.hide_render = o["grp"] != g
        o.is_holdout = False
    r.filepath = os.path.join(A.game, g + ".png")
    bpy.ops.render.render(write_still=True)
import json
json.dump({"ppt": A.ppt, "cols": COLS, "rowTop": ROW_TOP, "rowBottom": ROW_BOT, "originX": 0.4 * A.ppt, "originY": -ROW_TOP * A.ppt, "groups": groups},
          open(os.path.join(A.game, "frame.json"), "w"), indent=1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "street-house.blend"), compress=True)
print("STREET_HOUSE_RENDERED", groups)
