"""
Dojo Ascent — belt room samples for G2B-40, G2B-41 and G2B-42.

Same camera and tile size as the approved Tower rooms (tier3-ember-kitchens /
render_static.py): orthographic, 35 degrees down, 80 px per tile.
grid() uses world y = -row / sin(35), so a floor tile lands on an 80 x 80 square.

One sample room from each kit. Not the full batch. Not for import.

    blender -b -P incoming-art/belt-rooms-g2b40-42/source/build_samples.py -- \
        --out incoming-art/belt-rooms-g2b40-42/source/belt-room-samples.blend
    blender -b incoming-art/belt-rooms-g2b40-42/source/belt-room-samples.blend \
        -P incoming-art/tools/render_static.py -- \
        --out incoming-art/belt-rooms-g2b40-42/sprites --samples 16
"""
import bpy, bmesh, math, sys, os, json
from mathutils import Vector
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material, outline_material, add_hull, ellipsoid, box

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
import argparse
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
A = ap.parse_args(argv)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "Tower"
K = 1 / math.sin(math.radians(35))
COS = math.cos(math.radians(35))
H_FACE = 1.3 / COS
H_BLOCK = 0.5

def grid(c, r, z=0.0):
    return Vector((c, -r * K, z))

_m = {}
def M(h, flat=False):
    if (h, flat) not in _m:
        _m[(h, flat)] = toon_material(("F" if flat else "M") + h, h, *((1.0, 1.0) if flat else ()))
    return _m[(h, flat)]

OUTLINE = outline_material()
COLL = {}
def layer(n):
    if n not in COLL:
        c = bpy.data.collections.new("L_" + n)
        scene.collection.children.link(c)
        COLL[n] = c
    return COLL[n]

def put(name, bm, color, lay, outline=True, flat=False, smooth=False):
    me = bpy.data.meshes.new(name)
    for f in bm.faces:
        f.smooth = smooth
    bm.to_mesh(me)
    bm.free()
    me.materials.append(M(color, flat) if isinstance(color, str) else color)
    ob = bpy.data.objects.new(name, me)
    layer(lay).objects.link(ob)
    if outline:
        add_hull(ob, layer(lay), OUTLINE, 0.013)
    return ob

def gbox(lay, name, c0, r0, c1, r1, z0, z1, color, outline=True, bevel=0.0, flat=False):
    a, b = grid(c0, r1, z0), grid(c1, r0, z1)
    return put(name, box((a + b) / 2, Vector((abs(b.x - a.x), abs(b.y - a.y), abs(b.z - a.z))), bevel=bevel),
               color, lay, outline, flat)

def obox(lay, name, c, size, color, rot=(0, 0, 0), outline=True, bevel=0.0, flat=False):
    return put(name, box(c, size, rot=rot, bevel=bevel), color, lay, outline, flat=flat)

def oell(lay, name, c, s, color, rot=(0, 0, 0), outline=True):
    return put(name, ellipsoid(c, s, rot=rot, segs=12, rings=8), color, lay, outline, smooth=True)

TARGETS = []
def target(name, note):
    # 7 tiles wide, 5 deep, plus wall height so the back wall is in frame.
    TARGETS.append(dict(name=name, layers=[name], rect=[0, 0, 7, 5], top=1.3, anchor=[0, 0], note=note))

def floor_span(lay, stone, grout, moss=None):
    for col in range(7):
        for row in range(5):
            c0, r0 = col, row
            gbox(lay, f"{lay}_g{col}_{row}", c0, r0, c0 + 1, r0 + 1, -0.04, -0.004, grout, outline=False)
            shade = stone[(col + row) % len(stone)]
            gbox(lay, f"{lay}_s{col}_{row}", c0 + 0.04, r0 + 0.04, c0 + 0.96, r0 + 0.96, -0.004, 0.0, shade, outline=False)
            if moss and (col + row) % 3 == 0:
                gbox(lay, f"{lay}_m{col}_{row}", c0 + 0.15, r0 + 0.62, c0 + 0.42, r0 + 0.9, 0.0, 0.012, moss, outline=False)

def wall_run(lay, cols, row, stone, cap):
    y = grid(0, row, 0).y
    for col in cols:
        x = col + 0.5
        obox(lay, f"{lay}_w{col}", Vector((x, y + 0.08, H_FACE / 2)), (1.0, 0.22, H_FACE), stone)
        obox(lay, f"{lay}_c{col}", Vector((x, y + 0.02, H_FACE - 0.07)), (1.02, 0.28, 0.14), cap, outline=False)

def block(lay, name, c, r, color, top):
    gbox(lay, name, c, r, c + 1, r + 1, 0, top, color)

# ---------------------------------------------------------------- Green: Giant's Steps, Pebble Path
# Moss, river stone, warm sand. Soft and chunky. Not scary.
G = "room-green"
SAND = ["#e6d3ae", "#dcc59a", "#efe0c2"]
MOSS, STONE, MOSS_CAP = "#6e8f55", "#8d8a84", "#7ea06a"
floor_span(G, SAND, "#cbb892", MOSS)
wall_run(G, range(7), 0.15, STONE, MOSS_CAP)
# Stair-shaped blocks along the sides, middle stays open.
for i, h in enumerate((0.55, 0.38, 0.22)):
    block(G, f"{G}_stairL{i}", 0.15, 1.2 + i * 0.95, STONE, h)
    gbox(G, f"{G}_mossL{i}", 0.25, 1.35 + i * 0.95, 0.85, 1.7 + i * 0.95, h, h + 0.03, MOSS, outline=False)
# A few round pebbles and a thin friendly trickle.
for i, (c, r) in enumerate(((2.2, 3.4), (4.6, 2.6), (3.4, 4.1))):
    oell(G, f"{G}_peb{i}", grid(c, r, 0.06), (0.16, 0.12, 0.07), "#b7aa96")
# Gutter of water along the right, pale blue, not a hazard mark.
gbox(G, f"{G}_gutter", 5.55, 1.1, 6.55, 4.6, 0.0, 0.02, "#9eb8c4", outline=False)
target(G, "G2B-40 sample. Green, Giant's Steps, Pebble Path. Moss, river stone, warm sand.")

# ---------------------------------------------------------------- Red kit sample: Forge of Courage, Bellows Door
# Warm brick, iron, lacquer banners and gold. No alarm red, no danger-red.
R = "room-red"
BRICK = ["#c4a07a", "#b8926a", "#d2b48c"]  # light enough that a red circle would still show
IRON, LACQUER, GOLD = "#5e646c", "#a86b45", "#e2b15a"
floor_span(R, BRICK, "#a88868")
wall_run(R, range(7), 0.15, IRON, "#6e563f")
# Two lacquer banners with gold hems. The cloth is brown-lacquer, not danger red.
for i, col in enumerate((1.15, 4.55)):
    y = grid(0, 0.35, 0).y
    obox(R, f"{R}_ban{i}", Vector((col, y - 0.02, H_FACE * 0.62)), (0.55, 0.06, 0.7), LACQUER, outline=True)
    obox(R, f"{R}_hem{i}", Vector((col, y - 0.05, H_FACE * 0.30)), (0.58, 0.05, 0.08), GOLD, outline=False)
# A leather bellows and a copper band. Friendly, not a warning.
y = grid(0, 1.5, 0).y
obox(R, f"{R}_bellows", Vector((0.7, y, 0.28)), (0.7, 0.45, 0.32), "#8a5a38", bevel=0.04)
oell(R, f"{R}_copper", grid(6.1, 3.3, 0.16), (0.22, 0.22, 0.16), "#c9824a")
target(R, "G2B-41 sample. Red belt forge, Bellows Door. Brick, iron, lacquer and gold. No danger red.")

# ---------------------------------------------------------------- Brown: Root Library, Reading Nook
B = "room-brown"
WOOD = ["#c4a574", "#b89568", "#d2b48a"]
BARK, LEAF, PAGE, LAMP = "#6b4a30", "#6e8f55", "#f0e2c4", "#e2b15a"
floor_span(B, WOOD, "#a8845c")
wall_run(B, range(7), 0.15, BARK, "#8a6844")
# A root seat, a book, and a warm lamp. Cozy, not dusty-scary.
oell(B, f"{B}_root", grid(1.1, 2.4, 0.22), (0.55, 0.4, 0.28), BARK)
gbox(B, f"{B}_book", 3.3, 2.2, 4.15, 2.85, 0.0, 0.08, PAGE, outline=True)
oell(B, f"{B}_lamp", grid(5.4, 1.3, 0.55), (0.16, 0.16, 0.22), LAMP, outline=False)
# A few leaves in the roots.
for i, (c, r) in enumerate(((1.6, 2.9), (0.7, 3.2))):
    oell(B, f"{B}_leaf{i}", grid(c, r, 0.08), (0.18, 0.1, 0.03), LEAF, rot=(0, 0, 0.4 * i))
target(B, "G2B-42 sample. Brown, Root Library, Reading Nook. Wood, bark, parchment, a warm lamp.")

scene["static_targets"] = json.dumps(TARGETS)
os.makedirs(os.path.dirname(os.path.abspath(A.out)), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("SAVED", A.out, "targets", [t["name"] for t in TARGETS])
