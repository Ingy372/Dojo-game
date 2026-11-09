"""
Dojo Ascent — belt room samples, second pass.

Same camera, toon shader, dark outlines and 80 px tiles as the approved
Tower rooms (tier3-ember-kitchens / tools/render_static.py). Walls are
modelled with brick or plank courses. Props are solid shapes with a
contact shadow on the floor. The cel light is the house light direction.

    blender -b -P incoming-art/belt-rooms-g2b40-42/source/build_samples.py -- \
        --out incoming-art/belt-rooms-g2b40-42/source/belt-room-samples.blend
    blender -b incoming-art/belt-rooms-g2b40-42/source/belt-room-samples.blend \
        -P incoming-art/tools/render_static.py -- \
        --out incoming-art/belt-rooms-g2b40-42/sprites --samples 16
"""
import bpy, math, sys, os, json
from mathutils import Vector
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material, outline_material, add_hull, ellipsoid, tube, box

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

def grid(c, r, z=0.0):
    return Vector((c, -r * K, z))

_m = {}
def M(h, flat=False):
    key = (h, flat)
    if key not in _m:
        _m[key] = toon_material(("F" if flat else "T") + h, h, *((1.0, 1.0) if flat else (0.62, 1.18)))
    return _m[key]

OUT = outline_material()
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
        add_hull(ob, layer(lay), OUT, 0.016)
    return ob

def gbox(lay, name, c0, r0, c1, r1, z0, z1, color, outline=True, bevel=0.0, flat=False):
    a, b = grid(c0, r1, z0), grid(c1, r0, z1)
    return put(name, box((a + b) / 2, Vector((abs(b.x - a.x), abs(b.y - a.y), abs(b.z - a.z))), bevel=bevel),
               color, lay, outline, flat)

def obox(lay, name, c, size, color, rot=(0, 0, 0), outline=True, bevel=0.0, flat=False):
    return put(name, box(c, size, rot=rot, bevel=bevel), color, lay, outline, flat=flat)

def oell(lay, name, c, s, color, rot=(0, 0, 0), outline=True):
    return put(name, ellipsoid(c, s, rot=rot, segs=14, rings=8), color, lay, outline, smooth=True)

def otube(lay, name, p0, p1, r0, r1, color, segs=10, outline=True):
    return put(name, tube(p0, p1, r0, r1, segs=segs), color, lay, outline, smooth=True)

def shadow(lay, name, c, r, rx, ry):
    """Soft contact shadow, the same idea as the shadows under the kitchen sacks."""
    oell(lay, name, grid(c, r, 0.01), (rx, ry * 0.72, 0.015), "#2c2824", outline=False)

def courses(lay, x, y, z0, z1, width, mortar, brick=None):
    """Horizontal mortar lines and a couple of darker bricks, on a wall face."""
    n = 5
    for i in range(1, n):
        z = z0 + (z1 - z0) * i / n
        obox(lay, f"{lay}_hm{x:.1f}_{i}", Vector((x, y - 0.01, z)), (width, 0.012, 0.025), mortar, outline=False)
    if brick:
        obox(lay, f"{lay}_dk{x:.1f}", Vector((x - width * 0.18, y - 0.015, (z0 + z1) * 0.45)),
             (width * 0.28, 0.012, (z1 - z0) / n * 0.8), brick, outline=False)

def back_wall(lay, stone, cap, mortar, brick=None, n=7):
    y = grid(0, 0.35, 0).y
    for col in range(n):
        x = col + 0.5
        obox(lay, f"{lay}_wf{col}", Vector((x, y + 0.12, H_FACE * 0.48)), (0.98, 0.28, H_FACE * 0.92), stone, bevel=0.02)
        obox(lay, f"{lay}_wb{col}", Vector((x, y + 0.02, 0.12)), (1.0, 0.16, 0.24), "#3e342c", outline=False)
        obox(lay, f"{lay}_wc{col}", Vector((x, y - 0.02, H_FACE - 0.08)), (1.04, 0.36, 0.16), cap, bevel=0.02)
        courses(lay, x, y, 0.22, H_FACE - 0.2, 0.9, mortar, brick)
    # Side returns so the room has corners.
    for side, col in (("L", 0.15), ("R", 6.85)):
        p = grid(col, 2.2, 0)
        obox(lay, f"{lay}_side{side}", p + Vector((0, 0, 0.55)), (0.28, 0.9, 1.1), stone, bevel=0.02)
        obox(lay, f"{lay}_sidecap{side}", p + Vector((0, 0, 1.12)), (0.34, 0.95, 0.12), cap, outline=False)

def floor_stones(lay, colors, grout):
    for col in range(7):
        for row in range(5):
            shade = colors[(col * 3 + row) % len(colors)]
            gbox(lay, f"{lay}_g{col}_{row}", col, row, col + 1, row + 1, -0.05, -0.012, grout, outline=False)
            inset = 0.06 + ((col + row) % 2) * 0.02
            gbox(lay, f"{lay}_s{col}_{row}", col + inset, row + inset, col + 1 - inset * 0.8, row + 1 - inset,
                 -0.012, 0.0, shade, outline=False, bevel=0.01)

def floor_planks(lay, colors, gap):
    for row in range(5):
        shade = colors[row % len(colors)]
        gbox(lay, f"{lay}_pl{row}", 0, row + 0.04, 7, row + 0.96, -0.02, 0.0, shade, outline=False)
        gbox(lay, f"{lay}_gap{row}", 0, row, 7, row + 0.045, -0.03, -0.005, gap, outline=False)
    for col in (2.2, 4.7):
        gbox(lay, f"{lay}_seam{col}", col, 0, col + 0.04, 5, -0.01, 0.004, gap, outline=False)

def floor_bricks(lay, colors, mortar):
    for row in range(5):
        shift = 0.35 if row % 2 else 0.0
        x = -0.2 + shift
        i = 0
        while x < 7:
            shade = colors[(row + i) % len(colors)]
            x1 = min(7, x + 0.72)
            if x1 - max(0, x) > 0.2:
                gbox(lay, f"{lay}_b{row}_{i}", max(0, x), row + 0.06, x1, row + 0.94, -0.015, 0.0, shade, outline=False)
            x += 0.78
            i += 1
        gbox(lay, f"{lay}_bm{row}", 0, row, 7, row + 0.06, -0.02, -0.004, mortar, outline=False)

# ------------------------------------------------------------------ Green
G = "room-green"
SAND = ["#e7d2a4", "#f0e0b8", "#d8c08a", "#cbb07a"]
MOSS, STONE, CAP = "#5f8f45", "#7d7a74", "#6e9a62"
floor_stones(G, SAND, "#b7a27a")
back_wall(G, STONE, CAP, "#5c5a56", "#6a8a58")
# Big stepping stones.
for i, (c, r, sx) in enumerate(((2.3, 3.5, 0.7), (4.0, 2.3, 0.85), (3.1, 1.35, 0.6))):
    shadow(G, f"{G}_shs{i}", c, r + 0.15, sx * 0.7, 0.38)
    oell(G, f"{G}_step{i}", grid(c, r, 0.1), (sx, 0.42, 0.12), "#9a968e")
    oell(G, f"{G}_stepm{i}", grid(c - 0.1, r - 0.05, 0.16), (sx * 0.45, 0.16, 0.04), MOSS, outline=False)
# Ferns: a fan of leaves on a short stem.
for i, (c, r) in enumerate(((0.7, 3.6), (1.2, 2.2), (6.1, 3.3), (5.6, 1.6))):
    shadow(G, f"{G}_shf{i}", c, r + 0.1, 0.28, 0.18)
    base = grid(c, r, 0)
    otube(G, f"{G}_stem{i}", base, base + Vector((0, 0, 0.18)), 0.03, 0.025, "#3f6a32", outline=False)
    for k, ang in enumerate((-0.8, -0.3, 0.25, 0.7)):
        oell(G, f"{G}_fern{i}_{k}", base + Vector((math.sin(ang) * 0.16, -0.02, 0.28 + k * 0.02)),
             (0.22, 0.08, 0.05), "#4f8a3e" if k % 2 == 0 else "#6aa85a", rot=(70, 0, math.degrees(ang)))
# Sparkling stream along the right.
gbox(G, f"{G}_stream", 5.7, 1.15, 6.7, 4.55, -0.03, 0.015, "#7eb4c8", outline=False)
gbox(G, f"{G}_bank", 5.55, 1.1, 5.75, 4.6, 0.0, 0.04, "#6d8a55", outline=False)
for i, (c, r) in enumerate(((6.05, 1.6), (6.3, 2.5), (5.95, 3.5), (6.25, 4.2))):
    oell(G, f"{G}_spark{i}", grid(c, r, 0.05), (0.06, 0.04, 0.03), "#f4f7f2", outline=False)
target_note_g = "G2B-40 sample. Green, Giant's Steps, Pebble Path."

# ------------------------------------------------------------------ Red forge
R = "room-red"
BRICKS = ["#c4956e", "#b5835c", "#d0a67c", "#a87450"]
IRON, LACQUER, MAROON, GOLD = "#4e555e", "#8d4038", "#6e2e38", "#e2b15a"
floor_bricks(R, BRICKS, "#7a5a42")
back_wall(R, "#5a4038", "#3e3532", "#c4a07a", "#8d4038")
# Banners: deep lacquer and maroon, gold hem. Not alarm red.
y = grid(0, 0.42, 0).y
for i, (col, cloth) in enumerate(((1.3, LACQUER), (3.5, MAROON), (5.6, LACQUER))):
    obox(R, f"{R}_pole{i}", Vector((col, y, H_FACE * 0.78)), (0.08, 0.08, 0.5), "#c4a06a", outline=False)
    obox(R, f"{R}_ban{i}", Vector((col, y - 0.04, H_FACE * 0.48)), (0.62, 0.05, 0.85), cloth, bevel=0.02)
    obox(R, f"{R}_hem{i}", Vector((col, y - 0.06, H_FACE * 0.1)), (0.66, 0.04, 0.1), GOLD, outline=False)
# Anvil.
shadow(R, f"{R}_sha", 1.15, 3.3, 0.55, 0.32)
p = grid(1.15, 3.1, 0)
obox(R, f"{R}_anbase", p + Vector((0, 0, 0.16)), (0.55, 0.4, 0.32), "#3a3e46", bevel=0.03)
obox(R, f"{R}_antop", p + Vector((0.05, -0.02, 0.4)), (0.85, 0.38, 0.18), "#5c636e", bevel=0.04)
oell(R, f"{R}_horn", p + Vector((0.5, 0, 0.42)), (0.28, 0.12, 0.1), "#6a727c")
# Bellows.
shadow(R, f"{R}_shb", 5.8, 2.4, 0.45, 0.28)
q = grid(5.8, 2.2, 0)
obox(R, f"{R}_bag", q + Vector((0, 0, 0.28)), (0.7, 0.42, 0.36), "#7a4a30", bevel=0.06)
otube(R, f"{R}_handle", q + Vector((-0.2, 0, 0.15)), q + Vector((0.35, -0.05, 0.55)), 0.04, 0.035, "#c4a06a")
# Ember light in a small forge mouth on the back wall. Warm, not red.
mouth = Vector((3.5, y - 0.05, 0.55))
obox(R, f"{R}_mouth", mouth, (0.7, 0.2, 0.45), "#2a2428")
oell(R, f"{R}_ember", mouth + Vector((0, -0.08, 0)), (0.28, 0.1, 0.16), "#ffb25a", outline=False)
target_note_r = "G2B-41 sample. Red belt forge, Bellows Door. Brick, lacquer, maroon, gold. No danger red."

# ------------------------------------------------------------------ Brown library
B = "room-brown"
PLANKS = ["#c49a62", "#b5884e", "#d2ae78", "#a87848"]
BARK, PAGE, LEAF = "#5c3d28", "#f3e6c8", "#5f8a48"
floor_planks(B, PLANKS, "#6b4428")
back_wall(B, "#6a4a32", "#8a6844", "#a08060", "#5c3d28")
# Bookshelf.
shadow(B, f"{B}_shsh", 1.3, 1.15, 0.7, 0.25)
sy = grid(0, 1.05, 0).y
obox(B, f"{B}_shelf", Vector((1.3, sy, 0.7)), (1.3, 0.28, 1.35), "#6b4a2c", bevel=0.02)
for zi, z in enumerate((0.38, 0.72, 1.05)):
    for k, (dx, col) in enumerate(((-0.42, "#c4a06a"), (-0.18, "#3f6a38"), (0.06, "#8a5a3c"), (0.30, "#efe0c0"), (0.5, "#6e8f55"))):
        obox(B, f"{B}_bk{zi}_{k}", Vector((1.3 + dx, sy - 0.16, z)), (0.18, 0.12, 0.32), col)
# Roots through the right wall.
for i, z in enumerate((0.35, 0.7, 1.0)):
    a = grid(6.2, 0.5, z)
    b = grid(4.6 - i * 0.3, 1.4, z - 0.15)
    otube(B, f"{B}_root{i}", a, b, 0.09 - i * 0.015, 0.05, BARK, segs=8)
shadow(B, f"{B}_shr", 5.2, 1.5, 0.5, 0.25)
# Reading seat and lamp.
shadow(B, f"{B}_shseat", 2.4, 3.4, 0.5, 0.3)
seat = grid(2.4, 3.2, 0)
oell(B, f"{B}_seat", seat + Vector((0, 0, 0.22)), (0.55, 0.4, 0.28), BARK)
oell(B, f"{B}_cushion", seat + Vector((0, -0.05, 0.4)), (0.4, 0.28, 0.12), "#c4a06a")
shadow(B, f"{B}_shlamp", 4.8, 2.5, 0.2, 0.14)
lamp = grid(4.8, 2.3, 0)
otube(B, f"{B}_post", lamp, lamp + Vector((0, 0, 0.7)), 0.04, 0.035, "#c4a06a")
oell(B, f"{B}_glow", lamp + Vector((0, -0.02, 0.82)), (0.16, 0.12, 0.14), "#ffd36a", outline=False)
oell(B, f"{B}_leaf", grid(5.5, 3.6, 0.06), (0.2, 0.1, 0.03), LEAF, rot=(0, 0, 30))
oell(B, f"{B}_leaf2", grid(1.8, 3.8, 0.05), (0.16, 0.08, 0.025), LEAF)
target_note_b = "G2B-42 sample. Brown, Root Library, Reading Nook."

scene["static_targets"] = json.dumps([
    dict(name=G, layers=[G], rect=[0, 0, 7, 5], top=1.35, anchor=[0, 0], note=target_note_g),
    dict(name=R, layers=[R], rect=[0, 0, 7, 5], top=1.35, anchor=[0, 0], note=target_note_r),
    dict(name=B, layers=[B], rect=[0, 0, 7, 5], top=1.35, anchor=[0, 0], note=target_note_b),
])
os.makedirs(os.path.dirname(os.path.abspath(A.out)), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("SAVED", A.out)
