"""The store for the Street Smarts lesson "Lost in the store" (Jay, Nov 24: a Blender store, played as a cut scene).

Same look and camera as the Street Smarts House (toon_kit materials and outlines, orthographic, looking north 35 deg
down, 80 px per tile, ground on the game grid: G(col,row) = (col, -row*K, z), K = 1/sin35).
  16 x 10 tiles. Row 0 = the back wall, rows 1-8 the shop floor, row 9 the front wall with the glass door (cols 12.6-15.4).
  Back wall: the TOYS shelf (west), grocery shelves (east), the ceiling speaker in the middle.
  Two shelf islands (rows 3.8-4.5) with an aisle between them; the checkout counter and register (front east);
  a little display shelf where the worker stocks (front middle); a stack of boxes (the hiding spot, front west).
Game art: one full-frame PNG per group (floor, walls, props, foreground and one per y-sorted piece) into --game.

    blender -b -P build_store.py -- --game <dir> [--samples 16]
    python make_game_store.py <dir>
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


GOODS = ("#e8574a", "#f2a93b", "#f6d55c", "#5cb85c", "#4a90d9", "#8e6cc8", "#ef7fb0", "#46b8b0")


def goods_row(x0, x1, r_front, z, h, k0=0, step=0.36, depth=0.25, outline=False):
    """a row of boxes and cans standing on a shelf board, their fronts at r_front"""
    x = x0 + 0.04; k = k0
    while x + step * 0.8 < x1:
        w = step * (0.72 + 0.2 * ((k * 7) % 3) / 2)
        hh = h * (0.7 + 0.3 * ((k * 5) % 4) / 3)
        col = GOODS[k % len(GOODS)]
        if k % 3 == 2:
            Tb(x + w / 2, r_front - depth / 2, z, z + hh, w * 0.42, w * 0.42, col, outline=outline, segs=10, name="can")
        else:
            B(x, x + w, r_front - depth, r_front, z, z + hh, col, outline=outline, name="goods")
        x += w + 0.05; k += 1


def shelf_unit(x0, x1, r0, r1, height, levels, k0=0, back="#d8dde3", frame="#8a96a3", both=False):
    """a metal store shelf: back panel, side posts, boards, goods on each board (front side, and the back side too)"""
    B(x0, x1, r0 + (r1 - r0) * 0.42, r0 + (r1 - r0) * 0.58, 0.0, height, back, name="shelfBack")
    for x in (x0, x1 - 0.06):
        B(x, x + 0.06, r0, r1, 0.0, height, frame, name="shelfPost")
    B(x0, x1, r0, r1, 0.0, 0.12, frame, name="shelfBase")
    for i in range(levels):
        z = 0.12 + i * (height - 0.2) / levels
        B(x0, x1, r0, r1, z, z + 0.035, frame, outline=False, name="shelfBoard")
        goods_row(x0 + 0.08, x1 - 0.08, r1, z + 0.035, (height - 0.2) / levels * 0.72, k0 + i * 3)
        if both:
            goods_row(x0 + 0.08, x1 - 0.08, r0 + 0.25, z + 0.035, (height - 0.2) / levels * 0.72, k0 + i * 3 + 1)
    B(x0, x1, r0, r1, height - 0.04, height, frame, outline=False, name="shelfTop")


W, WALL_R, FRONT_R, WALL_H = 16.0, 1.0, 9.35, 2.6
DOOR0, DOOR1 = 12.6, 15.4

# ---------------------------------------------------------------- floor: store tiles and a doormat
GRP[0] = "floor"
B(-0.3, W + 0.3, 0.0, 10.0, -0.06, 0.0, "#ebe5d8", outline=False, name="floor")
for c in range(0, 16):
    for r in range(1, 10):
        if (c + r) % 2 == 0:
            B(c + 0.02, c + 0.98, r - 0.49, r + 0.49, 0.0, 0.003, "#ddd5c4", outline=False, name="tile")
B(DOOR0 + 0.2, DOOR1 - 0.2, 8.4, 9.3, 0.0, 0.012, "#4d5866", outline=False, name="doormat")

# ---------------------------------------------------------------- walls: back wall with a stripe, side walls
GRP[0] = "walls"
B(-0.3, W + 0.3, WALL_R - 0.25, WALL_R, 0.0, WALL_H, "#f4ead0", name="backwall")
B(-0.3, W + 0.3, WALL_R - 0.02, WALL_R + 0.02, 0.0, 0.32, "#5aa0c8", name="kick")
B(-0.3, W + 0.3, WALL_R - 0.26, WALL_R + 0.02, WALL_H - 0.1, WALL_H, "#5aa0c8", name="topTrim")
for x in (-0.3, W):
    B(x, x + 0.3, 0.0, 9.6, 0.0, WALL_H, "#e8dcbc", name="sidewall")

# ---------------------------------------------------------------- props on the back wall (drawn under everyone)
GRP[0] = "props"
# the TOYS shelf: wood, with balls, a teddy, blocks, a toy robot and boxed toys
B(0.5, 5.7, WALL_R, WALL_R + 0.1, 0.0, 1.55, "#b57a4a", name="toyShelfBack")
for x in (0.5, 5.6):
    B(x, x + 0.1, WALL_R, WALL_R + 0.6, 0.0, 1.55, "#8f5d36", name="toyShelfSide")
B(0.5, 5.7, WALL_R, WALL_R + 0.6, 1.5, 1.58, "#8f5d36", name="toyShelfTop")
for i, z in enumerate((0.1, 0.58, 1.06)):
    B(0.55, 5.65, WALL_R + 0.02, WALL_R + 0.6, z, z + 0.05, "#8f5d36", outline=False, name="toyBoard")
goods_row(0.65, 5.55, WALL_R + 0.55, 1.11, 0.32, 1, step=0.42)
for k, cx in enumerate((0.9, 1.5, 2.1)):
    E(cx, WALL_R + 0.35, 0.82, 0.19, 0.16, 0.19, ("#e8574a", "#4a90d9", "#f6d55c")[k], name="ball")
E(3.0, WALL_R + 0.35, 0.8, 0.2, 0.14, 0.2, "#9b6a3e", name="teddy")
E(3.0, WALL_R + 0.37, 1.02, 0.15, 0.12, 0.14, "#9b6a3e", name="teddyHead")
for dx in (-0.1, 0.1):
    E(3.0 + dx, WALL_R + 0.37, 1.13, 0.05, 0.04, 0.05, "#7d522d", name="teddyEar")
for k in range(4):
    B(3.6 + k * 0.28, 3.84 + k * 0.28, WALL_R + 0.2, WALL_R + 0.45, 0.63, 0.87, GOODS[(k + 3) % 8], name="block")
B(4.9, 5.35, WALL_R + 0.2, WALL_R + 0.5, 0.63, 0.98, "#b9c3cc", name="robotBody")
B(4.98, 5.27, WALL_R + 0.22, WALL_R + 0.48, 0.98, 1.06, "#8a96a3", outline=False, name="robotNeck")
goods_row(0.65, 5.55, WALL_R + 0.55, 0.15, 0.36, 4, step=0.5)
B(1.4, 4.8, WALL_R - 0.02, WALL_R + 0.05, 1.75, 2.2, "#e8574a", name="toySign")
text("toyText", "TOYS", 3.1, WALL_R + 0.06, 1.97, 0.3, 1.6, "#fff6e0")
# grocery shelves along the rest of the back wall
shelf_unit(6.4, 10.6, WALL_R, WALL_R + 0.6, 1.7, 3, k0=2)
shelf_unit(11.0, 15.6, WALL_R, WALL_R + 0.6, 1.7, 3, k0=5)
# the store speaker high on the back wall (the worker's call comes out of it)
E(8.5, WALL_R + 0.02, 2.15, 0.3, 0.05, 0.3, "#5d6670", name="speakerRim")
E(8.5, WALL_R + 0.05, 2.15, 0.23, 0.04, 0.23, "#3a4148", outline=False, name="speakerGrille")
for rr in (0.16, 0.09):
    E(8.5, WALL_R + 0.07, 2.15, rr, 0.03, rr, "#4c555e", outline=False, name="speakerRing")
B(13.0, 15.2, WALL_R - 0.02, WALL_R + 0.05, 1.86, 2.3, "#5cb85c", name="grocSign")
text("grocText", "GROCERY", 14.1, WALL_R + 0.06, 2.08, 0.26, 1.9, "#fff6e0")

# ---------------------------------------------------------------- the front wall with big windows and the door (drawn above everyone)
GRP[0] = "foreground"
for x0, x1 in ((-0.3, DOOR0), (DOOR1, W + 0.3)):
    B(x0, x1, FRONT_R - 0.15, FRONT_R + 0.15, 0.0, 0.45, "#e8dcbc", name="frontWall")
    B(x0, x1, FRONT_R - 0.17, FRONT_R + 0.17, 0.43, 0.5, "#5aa0c8", name="frontCap")
for x in (DOOR0, DOOR1):
    B(x - 0.1, x + 0.1, FRONT_R - 0.2, FRONT_R + 0.2, 0.0, 0.9, "#8a96a3", name="doorPost")

# ---------------------------------------------------------------- y-sorted pieces (each its own sprite)
GRP[0] = "island-a"
shelf_unit(1.0, 6.0, 3.8, 4.5, 1.35, 3, k0=1, both=True)
GRP[0] = "island-b"
shelf_unit(8.4, 12.2, 3.8, 4.5, 1.35, 3, k0=4, both=True)

GRP[0] = "display"
B(4.3, 5.7, 6.0, 6.6, 0.0, 0.9, "#f2a93b", name="display")
B(4.25, 5.75, 5.95, 6.65, 0.9, 0.96, "#c9822a", outline=False, name="displayTop")
goods_row(4.38, 5.62, 6.6, 0.96, 0.26, 2, step=0.3)
B(5.7, 6.3, 6.15, 6.55, 0.0, 0.35, "#c9a46a", name="stockBox")
B(5.68, 6.32, 6.13, 6.57, 0.35, 0.38, "#b38f55", outline=False, name="stockFlap")

GRP[0] = "counter"
B(9.6, 12.8, 6.0, 6.7, 0.0, 0.78, "#5aa0c8", name="counter")
B(9.55, 12.85, 5.95, 6.75, 0.78, 0.84, "#e8e8ea", outline=False, name="counterTop")
B(9.7, 11.2, 6.1, 6.6, 0.84, 0.86, "#3a4148", outline=False, name="belt")
B(11.6, 12.4, 6.1, 6.45, 0.84, 1.02, "#3a4148", name="register")
B(11.7, 12.3, 6.05, 6.2, 1.05, 1.35, "#2a3036", name="screen")
B(11.74, 12.26, 6.03, 6.06, 1.09, 1.31, "#7fd0f0", outline=False, name="screenGlow")
Tb(12.6, 6.35, 0.84, 1.7, 0.03, 0.03, "#8a96a3", name="lightPole")
E(12.6, 6.35, 1.78, 0.14, 0.1, 0.14, "#f6d55c", name="lightNumber")

GRP[0] = "boxes"
B(0.4, 1.4, 7.4, 8.2, 0.0, 0.55, "#c9a46a", name="box1")
B(1.3, 2.2, 7.6, 8.3, 0.0, 0.45, "#b9925a", name="box2")
B(0.55, 1.35, 7.5, 8.1, 0.55, 1.0, "#d6b27a", name="box3")
for x0, x1, r, z in ((0.4, 1.4, 8.2, 0.27), (1.3, 2.2, 8.3, 0.22), (0.55, 1.35, 8.1, 0.77)):
    B(x0 + 0.1, x1 - 0.1, r - 0.01, r + 0.01, z - 0.03, z + 0.03, "#a7834c", outline=False, name="tape")

GRP[0] = "carts"
for k in range(2):
    x = 14.2 + k * 0.25
    B(x, x + 0.9, 5.8 + k * 0.12, 6.5 + k * 0.12, 0.35, 0.85, "#c4ccd4", name="cartBasket")
    for wx in (x + 0.1, x + 0.75):
        E(wx, 6.45 + k * 0.12, 0.08, 0.07, 0.05, 0.07, "#3a4148", name="wheel")
    B(x + 0.85, x + 0.95, 5.9 + k * 0.12, 6.4 + k * 0.12, 0.85, 1.05, "#e8574a", name="cartHandle")

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
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "store.blend"), compress=True)
print("STORE_RENDERED", groups)
