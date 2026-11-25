"""Dojo Ascent - the Bible that lies on the red gear-bag box in the Action Zone (Jay, Nov 25).
Same house look as the dojo: toon_kit materials + outlines, orthographic camera looking north 35 deg down.
One transparent PNG, 160 px per tile (2x the room art, so it stays sharp when the camera zooms in).
The picture's middle is the middle of the book's base, so the game puts it at the middle of the box top.
    blender -b -P make_bible.py -- [--out ../../../assets/props/bible.png] [--samples 32]"""
import bpy, sys, os, math, argparse
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from toon_kit import *
from mathutils import Vector, Euler

ap = argparse.ArgumentParser()
ap.add_argument("--out", default=os.path.join(HERE, "..", "..", "..", "assets", "props", "bible.png"))
ap.add_argument("--samples", type=int, default=32)
ap.add_argument("--ppt", type=int, default=160)
A = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
EL = 35.0; K = 1 / math.sin(math.radians(EL))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; coll = sc.collection
OUT_M = outline_material(); MATS = {}
def mat(h):
    if h not in MATS: MATS[h] = toon_material("M" + h, h)
    return MATS[h]
def B(cx, r, z, w, d, h, hexc, outline=True, bevel=0.0, name="b"):
    """a box centred at column cx, ground row r, height z (its middle); w across, d in ground rows, h tall"""
    bm = box((cx, -r * K, z), (w, d * K, h), bevel=bevel)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat(hexc))
    ob = bpy.data.objects.new(name, me); coll.objects.link(ob)
    for p in me.polygons: p.use_smooth = False
    if outline: add_hull(ob, coll, OUT_M, OUTLINE_W * 1.6)
    return ob

W, DEP, TH = 0.80, 1.04, 0.20           # the book: tiles across, ground rows deep, tiles thick
COVER, PAGES, GOLD, RIBBON = "5a2f1c", "f3e8c9", "f0bd3c", "c0392b"
CT = 0.035                                # cover thickness
B(0, 0, CT / 2, W, DEP, CT, COVER, name="back-cover")
B(0.02, 0, TH / 2, W - 0.10, DEP - 0.08, TH - 2 * CT, PAGES, outline=False, name="pages")
B(0, 0, TH - CT / 2, W, DEP, CT, COVER, name="front-cover")
B(-W / 2 + 0.02, 0, TH / 2, 0.04, DEP, TH, COVER, name="spine")
# The gold cross on the cover (a tall post and a shorter bar, a third of the way down from the top).
B(0.02, 0, TH + 0.008, 0.085, 0.60, 0.016, GOLD, outline=False, name="cross-post")
B(0.02, -0.12, TH + 0.008, 0.34, 0.11, 0.016, GOLD, outline=False, name="cross-bar")
# A red ribbon bookmark hanging out of the front edge.
B(0.14, DEP / 2 + 0.05, TH * 0.55, 0.06, 0.12, 0.012, RIBBON, outline=False, name="ribbon")

COLS, ROWS = 1.4, 1.8
r = sc.render; r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = A.samples; sc.cycles.use_denoising = False
r.film_transparent = True; sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
r.resolution_x, r.resolution_y = round(COLS * A.ppt), round(ROWS * A.ppt); r.resolution_percentage = 100
cd = bpy.data.cameras.new("Cam"); cd.type = "ORTHO"; cd.sensor_fit = "HORIZONTAL"; cd.ortho_scale = COLS; cd.clip_end = 300
cam = bpy.data.objects.new("Cam", cd); coll.objects.link(cam); sc.camera = cam
cam.rotation_euler = (math.radians(90 - EL), 0, 0)
d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
cam.location = Vector((0, 0, 0)) - d * 60
r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGBA"
r.filepath = os.path.abspath(A.out); os.makedirs(os.path.dirname(r.filepath), exist_ok=True)
bpy.ops.render.render(write_still=True)
print("wrote", r.filepath)
