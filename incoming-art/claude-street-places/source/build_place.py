"""The places for Street Smarts lessons 2-5 (Jay, Nov 24: "plan the next 4 street smart lessons ... you will do all the
blender work"): the park, the bus stop, the school playground and a living room with a kitchen corner.

Same look, camera and grid as the store (incoming-art/claude-store/source/build_store.py): toon_kit materials and
outlines, orthographic, looking north 35 deg down, 80 px per tile, ground on the game grid G(col,row) = (col, -row*K, z),
K = 1/sin35. Each place is 16 x 10 tiles. Renders one full-frame PNG per group (floor, walls, props, foreground and one
per y-sorted piece, plus any cast "actors" made of props, like the car) and writes place.json next to them: the pieces,
the named marks the scripts use, who plays whom and where the camera starts.

    blender -b -P build_place.py -- --place park --game <dir> [--samples 16]
    python make_game_place.py <dir>
"""
import bpy, sys, os, math, argparse, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from toon_kit import *
from mathutils import Vector, Euler

ap = argparse.ArgumentParser()
ap.add_argument("--place", required=True, choices=["park", "busstop", "playground", "home"])
ap.add_argument("--game", required=True)
ap.add_argument("--samples", type=int, default=16)
ap.add_argument("--ppt", type=int, default=80)
A = ap.parse_args(sys.argv[sys.argv.index("--") + 1:])
EL = 35.0; K = 1 / math.sin(math.radians(EL))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; coll = sc.collection
OUT_M = outline_material(); MATS = {}
W = 16.0


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


def Rod(p0, p1, rad, hexc, outline=True, name="rod"):
    """a thin bar between two points given as (col, row, z)"""
    return add(name, tube(G(*p0), G(*p1), rad, rad, segs=8), hexc, outline)


def Ramp(cx, w, r_top, z_top, r_bot, z_bot, thick, hexc, name="ramp"):
    """a straight sloped plank running toward the camera (top at r_top, bottom at r_bot)"""
    dy = D(r_bot - r_top); dz = z_top - z_bot
    ang = math.degrees(math.atan2(dz, dy))
    ctr = G(cx, (r_top + r_bot) / 2, (z_top + z_bot) / 2)
    return add(name, box(ctr, (w, math.hypot(dy, dz), thick), rot=(ang, 0, 0)), hexc)


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


def tree(cx, r, s=1.0, leaf="#4f9a4a", leaf2="#62b35a"):
    Tb(cx, r, 0.0, 1.1 * s, 0.13 * s, 0.1 * s, "#7a5232", name="trunk")
    E(cx, r, 1.55 * s, 0.85 * s, 0.6 * s, 0.7 * s, leaf, name="leaves")
    E(cx - 0.35 * s, r + 0.1, 1.25 * s, 0.55 * s, 0.45 * s, 0.5 * s, leaf2, name="leaves2")
    E(cx + 0.4 * s, r + 0.05, 1.3 * s, 0.5 * s, 0.4 * s, 0.45 * s, leaf2, name="leaves3")


def bush(cx, r, s=1.0, c="#4f9a4a"):
    E(cx, r, 0.25 * s, 0.5 * s, 0.35 * s, 0.32 * s, c, name="bush")
    E(cx + 0.3 * s, r + 0.05, 0.2 * s, 0.35 * s, 0.28 * s, 0.25 * s, "#62b35a", name="bush2")


def sky():
    """a sky and far hills behind the outdoor places"""
    B(-0.6, W + 0.6, -0.9, -0.8, -0.2, 4.5, "#a9dcf4", outline=False, name="sky")
    for k, cx in enumerate((1.5, 5.5, 9.5, 13.5)):
        E(cx, -0.7, 0.0, 2.6, 0.1, 1.1 + 0.25 * (k % 2), "#8cc6a0", outline=False, name="hill")


def bench(x0, x1, r, facing_south=True):
    """a park bench: two legs, a seat and a back"""
    for x in (x0 + 0.1, x1 - 0.2):
        B(x, x + 0.1, r, r + 0.45, 0.0, 0.42, "#4a4d55", name="benchLeg")
    B(x0, x1, r, r + 0.5, 0.42, 0.5, "#b57a4a", name="benchSeat")
    rb = r if facing_south else r + 0.42
    B(x0, x1, rb, rb + 0.08, 0.5, 0.95, "#a86d40", name="benchBack")


PIECES = {}   # id -> anchor tile, footprint, sortRow, note (actors: anchor only)


def piece(gid, anchor, fp, note, actor=False):
    GRP[0] = gid
    PIECES[gid] = dict(anchorTile=list(anchor), footprintRect=list(fp), sortRow=None if actor else fp[3], note=note, actor=actor)


# =========================================================================================== the park
def park():
    GRP[0] = "walls"; sky()
    GRP[0] = "floor"
    B(-0.6, W + 0.6, -0.8, 10.2, -0.06, 0.0, "#86c873", outline=False, name="grass")
    for c in range(-1, 17):
        for r in range(0, 10):
            if (c * 3 + r * 5) % 7 == 0:
                B(c + 0.3, c + 0.42, r + 0.2, r + 0.26, 0.0, 0.004, "#74b862", outline=False, name="grassTuft")
    # the path from the east gate, past the bench, to the play area
    B(9.0, W + 0.6, 6.9, 7.9, 0.0, 0.01, "#e3cf9a", outline=False, name="path")
    B(5.5, 9.4, 5.6, 6.6, 0.0, 0.01, "#e3cf9a", outline=False, name="path2")
    B(8.6, 9.8, 5.6, 7.9, 0.0, 0.01, "#e3cf9a", outline=False, name="pathBend")
    # the sand under the slide and swings
    B(0.8, 9.6, 2.3, 5.4, 0.0, 0.012, "#efdcae", outline=False, name="sand")
    GRP[0] = "walls"
    # a wooden fence and trees along the back
    B(-0.6, W + 0.6, 0.55, 0.65, 0.45, 0.55, "#b98a5a", name="fenceRail")
    B(-0.6, W + 0.6, 0.55, 0.65, 0.15, 0.25, "#b98a5a", name="fenceRail2")
    for x in [i * 0.8 for i in range(-1, 22)]:
        B(x, x + 0.12, 0.5, 0.7, 0.0, 0.7, "#a87a4a", name="fencePost")
    for k, cx in enumerate((0.6, 3.0, 6.8, 10.4, 13.2, 15.6)):
        tree(cx, 0.1, 1.1 + 0.15 * (k % 2))
    GRP[0] = "props"
    for cx, r, col in ((10.2, 8.9, "#ef7fb0"), (10.6, 9.1, "#f6d55c"), (7.4, 8.8, "#e8574a"), (12.8, 5.0, "#f6d55c"), (14.6, 4.6, "#ef7fb0")):
        E(cx, r, 0.06, 0.08, 0.06, 0.06, col, name="flower")
    # the slide: ladder at the back, platform, slide down toward the camera
    piece("slide", (2.6, 4.6), (1.7, 3.5, 2.4, 4.6), "the slide (the player plays here; 'back to the slide' tap spot).")
    for x in (1.8, 3.3):
        for r in (2.5, 3.2):
            Tb(x, r, 0.0, 1.55, 0.05, 0.05, "#e8574a", name="slidePost")
    B(1.75, 3.4, 2.45, 3.25, 1.45, 1.55, "#f2a93b", name="platform")
    Rod((1.8, 2.5, 1.55), (1.8, 2.5, 2.2), 0.04, "#e8574a"); Rod((3.3, 2.5, 1.55), (3.3, 2.5, 2.2), 0.04, "#e8574a")
    B(1.8, 3.35, 2.47, 2.53, 1.95, 2.05, "#e8574a", name="rail")
    for z in (0.35, 0.75, 1.15):
        B(1.9, 3.2, 2.45, 2.52, z, z + 0.05, "#f6d55c", name="rung")
    Ramp(2.55, 0.7, 3.25, 1.5, 4.55, 0.12, 0.07, "#4a90d9", name="slideRamp")
    B(2.15, 2.22, 3.25, 4.5, 0.12, 0.3, "#3a78c0", outline=False, name="lip")
    piece("swings", (7.0, 3.6), (5.3, 8.7, 3.3, 3.7), "the swings.")
    for x in (5.4, 8.6):
        Rod((x, 3.0, 0.0), (x, 3.5, 2.1), 0.05, "#5a6a7a"); Rod((x, 4.0, 0.0), (x, 3.5, 2.1), 0.05, "#5a6a7a")
    Rod((5.4, 3.5, 2.1), (8.6, 3.5, 2.1), 0.06, "#5a6a7a")
    for cx, col in ((6.3, "#e8574a"), (7.7, "#4a90d9")):
        for dx in (-0.22, 0.22):
            Rod((cx + dx, 3.5, 2.08), (cx + dx, 3.5, 0.5), 0.012, "#3a4148", outline=False)
        B(cx - 0.28, cx + 0.28, 3.38, 3.62, 0.44, 0.52, col, name="seat")
    piece("bench", (12.2, 6.2), (11.1, 13.3, 5.7, 6.2), "the bench by the path (the grown-up waits here).")
    bench(11.1, 13.3, 5.7)
    piece("trees", (1.6, 8.4), (0.2, 3.2, 7.3, 8.4), "a clump of trees and bushes at the front corner ('over by the trees').")
    tree(1.0, 8.0, 1.25); tree(2.5, 8.3, 1.05, leaf="#5aa050"); bush(3.3, 8.5, 1.0); bush(0.2, 7.2, 0.9)
    piece("lamp", (14.0, 6.5), (13.85, 14.15, 6.35, 6.5), "a park lamp.")
    Tb(14.0, 6.45, 0.0, 2.2, 0.06, 0.05, "#3a4148", name="lampPole")
    E(14.0, 6.45, 2.3, 0.18, 0.13, 0.16, "#fff1b8", name="lampGlobe")
    piece("bin", (9.9, 6.0), (9.6, 10.2, 5.7, 6.0), "a trash can.")
    Tb(9.9, 5.85, 0.0, 0.7, 0.24, 0.27, "#3f8f6a", name="bin")
    return dict(
        size=[16, 10], start=["enter-player", "slide-player", "bench-grownup"],
        cast={"grownup": {"Mom": "people-mom", "Dad": "people-dad"}, "stranger": "people-shopper"},
        marks={"enter-player": [15.6, 7.3], "enter-grownup": [16.2, 7.5], "bench-grownup": [12.3, 6.55], "slide-player": [3.2, 4.85],
               "stranger-start": [16.4, 8.6], "stranger-mid": [8.4, 7.4], "stranger-talk": [4.6, 5.3], "stranger-away": [-1.6, 7.0],
               "trees": [1.8, 8.6], "slide": [2.5, 4.2], "player-bench": [11.2, 6.75], "path-bend": [9.0, 6.4]})


# =========================================================================================== the bus stop
def busstop():
    GRP[0] = "walls"; sky()
    GRP[0] = "floor"
    B(-0.6, W + 0.6, -0.8, 1.2, -0.06, 0.0, "#86c873", outline=False, name="lawn")
    B(-0.6, W + 0.6, 1.2, 6.2, -0.06, 0.0, "#cfcac0", outline=False, name="sidewalk")
    for x in range(-1, 17):
        B(x - 0.01, x + 0.01, 1.2, 6.2, 0.0, 0.004, "#b5b0a6", outline=False, name="crack")
    B(-0.6, W + 0.6, 6.2, 6.5, -0.06, 0.12, "#e0dcd4", name="curb")
    B(-0.6, W + 0.6, 6.5, 10.3, -0.06, 0.0, "#4a4d55", outline=False, name="road")
    for x in range(-1, 17, 2):
        B(x + 0.2, x + 1.2, 8.35, 8.5, 0.0, 0.006, "#f6d55c", outline=False, name="lane")
    for k in range(5):
        B(1.4, 4.6, 6.7 + k * 0.7, 6.7 + k * 0.7 + 0.4, 0.0, 0.008, "#f4f4f4", outline=False, name="crosswalk")
    GRP[0] = "walls"
    # the school across the lawn
    B(0.0, 11.5, -0.2, 0.3, 0.0, 2.6, "#b5654a", name="school")
    B(0.0, 11.5, -0.25, 0.32, 2.5, 2.7, "#8a4a36", name="schoolTrim")
    for x in (0.8, 2.6, 7.6, 9.6):
        B(x, x + 1.2, 0.3, 0.33, 0.9, 1.9, "#a9dcf4", name="window")
    B(4.6, 6.6, 0.3, 0.34, 0.0, 1.8, "#5a3a2a", name="door")
    B(3.9, 7.3, 0.3, 0.36, 2.0, 2.45, "#f4f4f4", name="sign")
    text("schoolText", "SCHOOL", 5.6, 0.37, 2.22, 0.3, 3.0, "#2f74c8")
    for k, cx in enumerate((12.6, 14.4, 16.0)):
        tree(cx, 0.3, 1.1 + 0.1 * k)
    GRP[0] = "props"
    for x in (12.4, 13.6):
        bush(x, 1.0, 0.9)
    piece("shelter", (10.8, 3.4), (9.0, 12.6, 2.2, 3.4), "the bus shelter (glass sides, a roof and a seat); 'behind the shelter' is the tap spot north of it.")
    for x in (9.05, 12.45):
        B(x, x + 0.1, 2.2, 3.4, 0.0, 2.1, "#5a6a7a", name="post")
    B(9.1, 12.5, 2.2, 2.32, 0.05, 1.95, "#c8e8f4", name="glassBack")
    B(9.0, 12.6, 2.1, 3.5, 2.05, 2.2, "#2f74c8", name="roof")
    B(9.4, 12.2, 2.35, 2.75, 0.45, 0.52, "#8a96a3", name="seatBoard")
    text("busText", "BUS", 10.8, 2.36, 1.55, 0.32, 1.2, "#2f74c8")
    piece("busSign", (8.2, 5.8), (8.1, 8.3, 5.7, 5.8), "the bus stop sign by the curb.")
    Tb(8.2, 5.75, 0.0, 2.0, 0.04, 0.04, "#8a96a3", name="signPole")
    B(7.85, 8.55, 5.72, 5.78, 1.65, 2.25, "#2f74c8", name="busSign")
    text("busSignText", "BUS", 8.2, 5.79, 1.95, 0.3, 0.6, "#ffffff")
    piece("trees", (14.8, 3.3), (13.8, 15.8, 2.6, 3.3), "trees at the east end ('by the trees').")
    tree(14.4, 3.1, 1.15); tree(15.5, 3.3, 1.0, leaf="#5aa050"); bush(13.8, 3.4, 0.8)
    piece("bench", (5.0, 2.6), (4.0, 6.0, 2.1, 2.6), "a bench where the kids wait.")
    bench(4.0, 6.0, 2.1)
    piece("hydrant", (13.0, 5.8), (12.85, 13.15, 5.65, 5.8), "a fire hydrant.")
    Tb(13.0, 5.75, 0.0, 0.5, 0.14, 0.13, "#e8574a", name="hydrant"); E(13.0, 5.75, 0.52, 0.14, 0.1, 0.1, "#c8402a", name="hydrantTop")
    # the car: a cast actor that drives in along the road (not part of the room)
    piece("car", (8.0, 7.6), (6.6, 9.4, 6.9, 7.9), "the car that pulls up (a cast actor: its own sprite, moved by the script).", actor=True)
    body = "#4a78c8"
    B(6.6, 9.4, 6.95, 7.85, 0.18, 0.72, body, bevel=0.06, name="carBody")
    B(7.15, 8.75, 7.0, 7.8, 0.72, 1.2, body, bevel=0.05, name="carCab")
    B(7.25, 7.9, 7.82, 7.84, 0.78, 1.12, "#a9dcf4", outline=False, name="winFront")
    B(8.0, 8.65, 7.82, 7.84, 0.78, 1.12, "#a9dcf4", outline=False, name="winBack")
    E(7.6, 7.5, 0.98, 0.13, 0.1, 0.14, "#d9a27a", name="driverHead")
    E(7.6, 7.48, 1.08, 0.14, 0.1, 0.07, "#2e2420", outline=False, name="driverHair")
    for wx in (7.1, 8.9):
        E(wx, 7.88, 0.2, 0.22, 0.06, 0.22, "#2a2a2a", name="wheel"); E(wx, 7.9, 0.2, 0.1, 0.04, 0.1, "#b9c3cc", outline=False, name="hub")
    E(6.62, 7.6, 0.45, 0.05, 0.12, 0.08, "#fff1b8", outline=False, name="headlight")
    return dict(
        size=[16, 10], start=["player-start", "safe-wait", "trees"],
        cast={"guard": "people-guard", "kid1": "people-friend1", "kid2": "people-friend2", "car": "static:car"},
        marks={"player-start": [11.0, 4.6], "safe-wait": [4.4, 5.1], "shelter-back": [10.6, 1.75], "trees": [14.8, 3.7],
               "guard": [2.6, 5.75], "kid1": [5.1, 4.1], "kid2": [5.9, 4.7], "step-back": [4.6, 4.2], "by-guard": [3.4, 5.1],
               "car-in": [21.0, 7.6], "car-stop": [6.6, 7.6], "car-out": [-5.0, 7.6], "curb": [6.6, 6.6]})


# =========================================================================================== the school playground
def playground():
    GRP[0] = "walls"; sky()
    GRP[0] = "floor"
    B(-0.6, W + 0.6, -0.8, 10.2, -0.06, 0.0, "#7a7e88", outline=False, name="blacktop")
    # painted games: four square and hopscotch
    for (x0, r0) in ((1.2, 5.0), (2.4, 5.0), (1.2, 6.2), (2.4, 6.2)):
        for x, xx, r, rr in ((x0, x0 + 1.2, r0, r0 + 0.05), (x0, x0 + 1.2, r0 + 1.15, r0 + 1.2), (x0, x0 + 0.05, r0, r0 + 1.2), (x0 + 1.15, x0 + 1.2, r0, r0 + 1.2)):
            B(x, xx, r, rr, 0.0, 0.006, "#f4f4f4", outline=False, name="line")
    for k, (x, r) in enumerate(((6.0, 8.6), (6.0, 8.0), (5.7, 7.4), (6.3, 7.4), (6.0, 6.8))):
        B(x - 0.28, x + 0.28, r - 0.28, r + 0.28, 0.0, 0.006, ("#f6d55c", "#5cb85c", "#4a90d9", "#e8574a", "#8e6cc8")[k], outline=False, name="hop")
    # wood chips under the slide
    B(10.2, 15.6, 2.0, 5.2, 0.0, 0.012, "#c79a62", outline=False, name="chips")
    GRP[0] = "walls"
    B(-0.6, W + 0.6, -0.2, 0.4, 0.0, 2.7, "#c87456", name="school")
    B(-0.6, W + 0.6, -0.25, 0.45, 2.6, 2.8, "#8a4a36", name="schoolTrim")
    for x in (0.4, 2.4, 10.8, 12.8, 14.8):
        B(x, x + 1.2, 0.4, 0.43, 1.0, 2.0, "#a9dcf4", name="window")
    B(6.6, 8.6, 0.4, 0.44, 0.0, 1.9, "#2f74c8", name="doors")
    B(7.58, 7.62, 0.44, 0.46, 0.0, 1.9, "#1e4f8c", outline=False, name="doorGap")
    B(5.6, 9.6, 0.4, 0.46, 2.05, 2.5, "#f4f4f4", name="sign")
    text("schoolText", "SCHOOL", 7.6, 0.47, 2.27, 0.3, 3.4, "#c8402a")
    # a fence along each side
    GRP[0] = "props"
    for x in (-0.3, W + 0.1):
        B(x, x + 0.12, 0.5, 9.8, 0.0, 1.0, "#9aa4ae", name="sideFence")
    piece("slide", (12.6, 4.6), (11.7, 13.6, 2.4, 4.6), "the school slide (friends wait by it; 'hide behind the slide' is north of it).")
    for x in (11.8, 13.3):
        for r in (2.5, 3.2):
            Tb(x, r, 0.0, 1.55, 0.05, 0.05, "#4a90d9", name="slidePost")
    B(11.75, 13.4, 2.45, 3.25, 1.45, 1.55, "#f6d55c", name="platform")
    B(11.8, 13.35, 2.47, 2.53, 1.95, 2.05, "#4a90d9", name="rail")
    for z in (0.35, 0.75, 1.15):
        B(11.9, 13.2, 2.45, 2.52, z, z + 0.05, "#f2a93b", name="rung")
    Rod((11.8, 2.5, 1.55), (11.8, 2.5, 2.2), 0.04, "#4a90d9"); Rod((13.3, 2.5, 1.55), (13.3, 2.5, 2.2), 0.04, "#4a90d9")
    Ramp(12.55, 0.7, 3.25, 1.5, 4.55, 0.12, 0.07, "#e8574a", name="slideRamp")
    piece("hoop", (4.6, 1.6), (4.4, 4.8, 1.4, 1.6), "a basketball hoop against the wall.")
    Tb(4.6, 1.5, 0.0, 2.6, 0.06, 0.06, "#5a6a7a", name="hoopPole")
    B(4.0, 5.2, 1.48, 1.54, 2.4, 3.1, "#f4f4f4", name="board")
    B(4.4, 4.8, 1.55, 1.57, 2.5, 2.75, "#e8574a", outline=False, name="boardBox")
    Tb(4.6, 1.75, 2.45, 2.5, 0.22, 0.22, "#f2a93b", segs=16, name="rim")
    piece("bench", (9.6, 2.5), (8.6, 10.6, 2.0, 2.5), "a bench by the school door.")
    bench(8.6, 10.6, 2.0)
    piece("tree", (15.0, 7.6), (14.4, 15.6, 7.0, 7.6), "a shady tree.")
    tree(15.0, 7.4, 1.2)
    return dict(
        size=[16, 10], start=["player-ball", "kid-talk", "friends"],
        cast={"kid": "people-kid", "friend1": "people-friend1", "friend2": "people-friend2", "teacher": "people-teacher"},
        marks={"player-ball": [5.2, 5.6], "kid-start": [-1.0, 8.2], "kid-talk": [3.8, 6.2], "friend1": [10.6, 5.1], "friend2": [11.4, 5.7],
               "friends": [10.9, 5.4], "player-friends": [9.7, 5.6], "teacher": [7.6, 2.6], "slide-hide": [12.6, 2.1],
               "player-teacher": [8.4, 3.3], "teacher-kid": [4.6, 5.6], "player-kid": [5.8, 6.1], "kid-away": [-1.2, 8.6]})


# =========================================================================================== the living room and kitchen
def home():
    GRP[0] = "floor"
    B(-0.3, W + 0.3, 0.0, 10.0, -0.06, 0.0, "#c89a64", outline=False, name="floor")
    for r in range(1, 10):
        B(-0.3, W + 0.3, r - 0.01, r + 0.01, 0.0, 0.003, "#b4874f", outline=False, name="plank")
    B(10.0, W, 1.0, 9.4, 0.0, 0.004, "#e6e0d4", outline=False, name="kitchenFloor")
    for c in range(10, 16):
        for r in range(1, 10):
            if (c + r) % 2 == 0:
                B(c + 0.02, c + 0.98, r - 0.49, r + 0.49, 0.004, 0.006, "#d6cebe", outline=False, name="tile")
    B(1.0, 7.4, 3.6, 7.2, 0.0, 0.012, "#6a8fc0", outline=False, name="rug")
    B(1.3, 7.1, 3.9, 6.9, 0.012, 0.016, "#8aa8d0", outline=False, name="rugInner")
    GRP[0] = "walls"
    B(-0.3, 10.0, 0.75, 1.0, 0.0, 2.6, "#efe2c8", name="backwall")
    B(10.0, W + 0.3, 0.75, 1.0, 0.0, 2.6, "#d8ecf0", name="kitchenWall")
    B(-0.3, W + 0.3, 0.98, 1.02, 0.0, 0.2, "#a87a4a", name="kick")
    for x in (-0.3, W):
        B(x, x + 0.3, 0.0, 9.6, 0.0, 2.6, "#e8dcbc", name="sidewall")
    # window with curtains, a picture
    B(6.6, 8.8, 1.0, 1.03, 1.0, 2.1, "#a9dcf4", name="window")
    B(6.6, 8.8, 1.0, 1.05, 1.52, 1.58, "#f4f4f4", outline=False, name="windowBar")
    for x in (6.3, 8.8):
        B(x, x + 0.32, 1.02, 1.1, 0.8, 2.25, "#e8574a", name="curtain")
    B(1.2, 2.4, 1.0, 1.04, 1.5, 2.2, "#8f5d36", name="frame")
    B(1.3, 2.3, 1.04, 1.06, 1.6, 2.1, "#8cc6a0", outline=False, name="picture")
    GRP[0] = "props"
    # the couch against the back wall, facing the room
    B(1.8, 5.6, 1.05, 1.7, 0.0, 0.95, "#5a7ab0", name="couchBack")
    B(1.8, 5.6, 1.5, 2.6, 0.0, 0.45, "#6a8ac0", name="couchSeat")
    for x in (1.6, 5.4):
        B(x, x + 0.35, 1.3, 2.6, 0.0, 0.65, "#5a7ab0", name="couchArm")
    for x in (2.3, 3.8):
        B(x, x + 1.2, 1.55, 2.45, 0.45, 0.6, "#7a9acc", outline=False, name="cushion")
    E(2.4, 1.6, 0.8, 0.28, 0.12, 0.22, "#f6d55c", name="pillow")
    # the kitchen along the back wall: counters, stove, fridge
    B(10.2, 13.8, 1.0, 1.8, 0.0, 0.92, "#f4f4f4", name="counter")
    B(10.15, 13.85, 0.95, 1.85, 0.92, 0.98, "#8a96a3", outline=False, name="counterTop")
    B(11.4, 12.4, 1.1, 1.75, 0.98, 1.0, "#3a4148", outline=False, name="stoveTop")
    for cx in (11.65, 12.15):
        E(cx, 1.42, 1.01, 0.15, 0.1, 0.01, "#2a2a2a", outline=False, name="burner")
    Tb(11.65, 1.42, 1.0, 1.22, 0.16, 0.16, "#8a96a3", name="pot")
    B(10.2, 13.8, 1.0, 1.06, 1.5, 2.2, "#f2a93b", name="cabinets")
    B(14.2, 15.6, 1.0, 1.9, 0.0, 2.3, "#e8eef2", name="fridge")
    B(14.25, 15.55, 1.88, 1.92, 1.3, 1.34, "#b9c3cc", outline=False, name="fridgeLine")
    piece("table", (4.0, 4.0), (2.6, 5.4, 3.3, 4.0), "the coffee table with the tablet on it.")
    for x, r in ((2.7, 3.4), (5.2, 3.4), (2.7, 3.85), (5.2, 3.85)):
        B(x, x + 0.1, r, r + 0.1, 0.0, 0.42, "#7d522d", name="tableLeg")
    B(2.6, 5.4, 3.3, 4.0, 0.42, 0.5, "#a86d40", name="tableTop")
    B(3.75, 4.45, 3.45, 3.85, 0.5, 0.53, "#2a3036", name="tablet")
    B(3.8, 4.4, 3.48, 3.82, 0.53, 0.535, "#7fd0f0", outline=False, name="tabletScreen")
    piece("island", (12.2, 5.0), (10.8, 13.6, 4.2, 5.0), "the kitchen island.")
    B(10.8, 13.6, 4.2, 5.0, 0.0, 0.9, "#5aa0c8", name="island")
    B(10.75, 13.65, 4.15, 5.05, 0.9, 0.96, "#f4f4f4", outline=False, name="islandTop")
    E(11.4, 4.6, 1.02, 0.22, 0.16, 0.08, "#e8574a", name="bowl")
    for cx in (11.3, 11.5):
        E(cx, 4.55, 1.08, 0.08, 0.06, 0.08, "#f6d55c", outline=False, name="fruit")
    piece("lamp", (7.2, 2.0), (6.9, 7.5, 1.6, 2.0), "a floor lamp.")
    Tb(7.2, 1.8, 0.0, 1.8, 0.04, 0.04, "#3a4148", name="lampPole")
    Tb(7.2, 1.8, 1.7, 2.1, 0.3, 0.2, "#f6d55c", name="lampShade")
    piece("plant", (9.3, 8.6), (8.9, 9.7, 8.2, 8.6), "a big house plant.")
    Tb(9.3, 8.4, 0.0, 0.4, 0.22, 0.28, "#c8623a", name="pot2")
    E(9.3, 8.4, 0.8, 0.4, 0.3, 0.5, "#4f9a4a", name="plant")
    GRP[0] = "foreground"
    B(-0.3, W + 0.3, 9.3, 9.6, 0.0, 0.4, "#e8dcbc", name="frontWall")
    B(-0.3, W + 0.3, 9.28, 9.62, 0.38, 0.45, "#a87a4a", name="frontCap")
    return dict(
        size=[16, 10], start=["player-tablet", "kitchen-grownup", "tablet"],
        cast={"grownup": {"Mom": "people-mom", "Dad": "people-dad"}},
        marks={"player-tablet": [4.1, 4.75], "tablet": [4.1, 3.65, 0.55], "couch": [3.7, 2.7], "kitchen-grownup": [12.2, 2.5],
               "player-kitchen": [10.3, 3.3], "grownup-table": [5.3, 4.6], "player-table": [3.9, 4.75], "door-in": [8.5, 8.8]})


PLACE = dict(park=park, busstop=busstop, playground=playground, home=home)[A.place]()

# ---------------------------------------------------------------- camera and per-group renders (as the store)
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
    r.filepath = os.path.join(A.game, g + ".png")
    bpy.ops.render.render(write_still=True)
json.dump({"ppt": A.ppt, "cols": COLS, "rowTop": ROW_TOP, "rowBottom": ROW_BOT, "originX": 0.4 * A.ppt, "originY": -ROW_TOP * A.ppt, "groups": groups},
          open(os.path.join(A.game, "frame.json"), "w"), indent=1)
json.dump(dict(PLACE, id=A.place, pieces=PIECES), open(os.path.join(A.game, "place.json"), "w"), indent=1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, A.place + ".blend"), compress=True)
print("PLACE_RENDERED", A.place, groups)
