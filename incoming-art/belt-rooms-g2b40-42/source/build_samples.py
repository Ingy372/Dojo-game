"""
Dojo Ascent — belt room samples, fourth pass.

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

def back_wall(lay, stone, cap, mortar, brick=None, n=7, gap=(2.2, 4.8)):
    """Back wall with an open doorway in the middle. The lintel stays; the floor shows through."""
    y = grid(0, 0.35, 0).y
    for col in range(n):
        x = col + 0.5
        if gap[0] < x < gap[1]:
            obox(lay, f"{lay}_lint{col}", Vector((x, y + 0.02, H_FACE - 0.08)), (1.04, 0.36, 0.16), cap, bevel=0.02)
            continue
        obox(lay, f"{lay}_wf{col}", Vector((x, y + 0.12, H_FACE * 0.48)), (0.98, 0.28, H_FACE * 0.92), stone, bevel=0.02)
        obox(lay, f"{lay}_wb{col}", Vector((x, y + 0.02, 0.12)), (1.0, 0.16, 0.24), "#3e342c", outline=False)
        obox(lay, f"{lay}_wc{col}", Vector((x, y - 0.02, H_FACE - 0.08)), (1.04, 0.36, 0.16), cap, bevel=0.02)
        courses(lay, x, y, 0.22, H_FACE - 0.2, 0.9, mortar, brick)
    for tag, x in (("a", gap[0]), ("b", gap[1])):
        obox(lay, f"{lay}_jamb{tag}", Vector((x, y + 0.06, H_FACE * 0.42)), (0.16, 0.32, H_FACE * 0.82), stone, bevel=0.02)
    # Side returns so the room has corners.
    for side, col in (("L", 0.15), ("R", 6.85)):
        p = grid(col, 2.2, 0)
        obox(lay, f"{lay}_side{side}", p + Vector((0, 0, 0.55)), (0.28, 0.9, 1.1), stone, bevel=0.02)
        obox(lay, f"{lay}_sidecap{side}", p + Vector((0, 0, 1.12)), (0.34, 0.95, 0.12), cap, outline=False)

def floor_stones(lay, colors, grout, soft=False):
    for col in range(7):
        for row in range(5):
            shade = colors[(col + row) % len(colors)]
            gbox(lay, f"{lay}_g{col}_{row}", col, row, col + 1, row + 1, -0.05, -0.012, grout, outline=False)
            # Soft moss uses a thin joint and no checker of wide and narrow stones.
            inset = 0.035 if soft else 0.06 + ((col + row) % 2) * 0.02
            gbox(lay, f"{lay}_s{col}_{row}", col + inset, row + inset, col + 1 - inset, row + 1 - inset,
                 -0.012, 0.0, shade, outline=False, bevel=0.008 if soft else 0.01)

def floor_planks(lay, colors, gap=None):
    for row in range(5):
        shade = colors[row % len(colors)]
        gbox(lay, f"{lay}_pl{row}", 0, row, 7, row + 1, -0.02, 0.0, shade, outline=False)
        if gap:
            gbox(lay, f"{lay}_gap{row}", 0, row, 7, row + 0.045, -0.01, 0.004, gap, outline=False)

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

def stair_block(lay, name, x0, r0, x1, r1, stone, moss):
    """A short stair in the side wall: three chunky steps, moss on the treads."""
    w = x1 - x0
    for i, h in enumerate((0.16, 0.32, 0.48)):
        inset = i * w * 0.12
        gbox(lay, f"{lay}_{name}{i}", x0 + inset, r0, x1 - inset * 0.4, r1, 0.02, h, stone, bevel=0.015)
        gbox(lay, f"{lay}_{name}m{i}", x0 + inset + 0.04, r0 + 0.05, x1 - inset * 0.4 - 0.04, r1 - 0.05,
             h, h + 0.035, moss, outline=False)

def fern(lay, name, c, r):
    shadow(lay, f"{lay}_{name}sh", c, r + 0.12, 0.32, 0.2)
    base = grid(c, r, 0)
    otube(lay, f"{lay}_{name}st", base, base + Vector((0, 0, 0.16)), 0.035, 0.028, "#2f5a28", outline=False)
    for k, ang in enumerate((-0.7, 0.05, 0.75)):
        oell(lay, f"{lay}_{name}{k}", base + Vector((math.sin(ang) * 0.18, -0.02, 0.26)),
             (0.32, 0.1, 0.06), "#3f7a34" if k != 1 else "#6aaa52", rot=(68, 0, math.degrees(ang)))

def banner(lay, name, col, cloth, gold):
    y = grid(0, 0.42, 0).y
    obox(lay, f"{lay}_{name}p", Vector((col, y, H_FACE * 0.78)), (0.08, 0.08, 0.46), gold, outline=False)
    obox(lay, f"{lay}_{name}b", Vector((col, y - 0.05, H_FACE * 0.5)), (0.55, 0.05, 0.72), cloth, bevel=0.02)
    obox(lay, f"{lay}_{name}h", Vector((col, y - 0.07, H_FACE * 0.16)), (0.6, 0.04, 0.1), gold, outline=False)

def bellows(lay, name, c, r):
    shadow(lay, f"{lay}_{name}sh", c, r + 0.22, 0.55, 0.32)
    q = grid(c, r, 0)
    obox(lay, f"{lay}_{name}bag", q + Vector((0, 0, 0.32)), (0.85, 0.48, 0.42), "#7a4a30", bevel=0.06)
    obox(lay, f"{lay}_{name}noz", q + Vector((0.42, -0.02, 0.3)), (0.28, 0.22, 0.18), "#4e555e", bevel=0.02)
    otube(lay, f"{lay}_{name}h", q + Vector((-0.28, 0.02, 0.12)), q + Vector((0.15, -0.04, 0.62)), 0.045, 0.035, "#c4a06a")

def shelf_of_books(lay, name, x, row, book_colors):
    shadow(lay, f"{lay}_{name}sh", x, row + 0.18, 0.7, 0.22)
    sy = grid(0, row, 0).y
    obox(lay, f"{lay}_{name}", Vector((x, sy, 0.62)), (1.15, 0.26, 1.15), "#6b4a2c", bevel=0.02)
    for zi, z in enumerate((0.32, 0.62, 0.9)):
        for k, (dx, col) in enumerate(book_colors):
            obox(lay, f"{lay}_{name}b{zi}_{k}", Vector((x + dx, sy - 0.14, z)), (0.2, 0.1, 0.26), col)

def floor_root(lay, name, c0, r0, c1, r1):
    """A short root against the wall. Low, and close to the plank colour, so it is not a barrier."""
    a, b = grid(c0, r0, 0.04), grid(c1, r1, 0.045)
    otube(lay, name, a, b, 0.055, 0.035, "#a08060", segs=8)
    oell(lay, name + "k", (a + b) / 2 + Vector((0, 0, 0.012)), (0.08, 0.06, 0.04), "#8a6844")

# ------------------------------------------------------------------ Green: Pebble Path
# Palette from giants-steps-brief: moss green, river-stone grey, warm sand, soft blue shade.
# The floor itself is moss. Sand is only a few pebbles. The middle stays a clear path.
G = "room-green"
MOSS, STONE, CAP, RIVER = "#5f8f45", "#6e726c", "#6e9a62", "#8a8780"
# Close moss shades only. The joint is moss too, so the floor is not a light/dark board.
floor_stones(G, ["#568448", "#5e8c50", "#5a884c", "#628e54"], "#527e46", soft=True)
back_wall(G, STONE, CAP, "#4a4e48", "#3f6a32")
stair_block(G, "sl1", 0.28, 0.55, 1.35, 1.35, RIVER, MOSS)
stair_block(G, "sl2", 0.28, 3.55, 1.28, 4.45, RIVER, MOSS)
stair_block(G, "sr1", 5.55, 0.55, 6.55, 1.3, RIVER, MOSS)
stair_block(G, "sr2", 5.6, 3.6, 6.6, 4.5, RIVER, MOSS)
# Big stepping stones beside the path, not in it. Columns 2.5-4.6 stay open.
for i, (c, r, sx) in enumerate(((1.85, 2.15, 0.72), (4.85, 2.55, 0.66), (1.75, 3.15, 0.58))):
    shadow(G, f"{G}_shs{i}", c, r + 0.16, sx * 0.7, 0.36)
    oell(G, f"{G}_step{i}", grid(c, r, 0.1), (sx, 0.4, 0.12), RIVER)
    oell(G, f"{G}_stepm{i}", grid(c - 0.08, r - 0.04, 0.16), (sx * 0.4, 0.14, 0.035), "#6aaa52", outline=False)
# River pebbles and moss clumps along the edges. Warm sand is only the pebbles.
for i, (c, r, col, s) in enumerate((
        (1.15, 2.55, RIVER, 0.22), (5.15, 1.7, RIVER, 0.2), (5.05, 3.2, "#d4c09a", 0.16),
        (1.35, 4.15, "#d4c09a", 0.15), (4.7, 4.15, RIVER, 0.18), (2.0, 4.35, RIVER, 0.16))):
    oell(G, f"{G}_peb{i}", grid(c, r, 0.05), (s, s * 0.65, 0.045), col, outline=False)
for i, (c, r) in enumerate(((1.05, 1.7), (5.2, 2.05), (4.55, 3.85), (1.2, 4.55))):
    oell(G, f"{G}_moss{i}", grid(c, r, 0.03), (0.38, 0.22, 0.03), "#3f7a34", outline=False)
fern(G, "f0", 0.7, 2.15)
fern(G, "f1", 5.15, 1.85)
fern(G, "f2", 0.65, 2.95)
# Soft blue shade in the two corners the sun has not reached.
oell(G, f"{G}_blue0", grid(0.7, 0.7, 0.02), (0.55, 0.28, 0.02), "#7f97a8", outline=False)
oell(G, f"{G}_blue1", grid(6.2, 0.72, 0.02), (0.5, 0.26, 0.02), "#7f97a8", outline=False)
# A narrow sparkling gutter, kept against the right wall so the path stays open.
gbox(G, f"{G}_stream", 6.35, 1.4, 6.9, 3.5, -0.03, 0.02, "#7eb4c8", outline=False)
gbox(G, f"{G}_bank", 6.22, 1.35, 6.4, 3.55, 0.0, 0.045, "#4e7a3a", outline=False)
for i, (c, r) in enumerate(((6.55, 1.7), (6.7, 2.4), (6.5, 3.15))):
    oell(G, f"{G}_spark{i}", grid(c, r, 0.05), (0.08, 0.05, 0.03), "#f4f7f2", outline=False)
target_note_g = "G2B-40 sample. Green, Giant's Steps, Pebble Path. Moss floor, river stones, side stairs."

# ------------------------------------------------------------------ Red forge: Bellows Door
# Deep warm brick and iron. Lacquer and maroon stay brown-red so they are not danger red.
# Props sit on the sides. The middle columns and the back doorway stay clear.
R = "room-red"
# Brick shades pulled halfway toward their average, so the floor contrast is about half. Ember pools stay bright.
BRICKS = ["#ad6c4a", "#b77954", "#9d6244", "#a9714e"]
IRON, LACQUER, MAROON, GOLD = "#4e555e", "#8d5238", "#7a4a3c", "#e2b15a"
floor_bricks(R, BRICKS, "#8a5a40")
back_wall(R, "#5c4338", "#3e3532", "#c4a07a", "#8d5238")
banner(R, "bl", 1.05, LACQUER, GOLD)
banner(R, "br", 5.95, MAROON, GOLD)
# Two huge leather bellows by the door, one each side of the opening.
bellows(R, "belL", 1.35, 1.05)
bellows(R, "belR", 5.65, 1.05)
# Anvil on the left, off the path.
shadow(R, f"{R}_sha", 1.05, 2.85, 0.55, 0.32)
p = grid(1.05, 2.65, 0)
obox(R, f"{R}_anbase", p + Vector((0, 0, 0.16)), (0.5, 0.38, 0.3), "#3a3e46", bevel=0.03)
obox(R, f"{R}_antop", p + Vector((0.04, -0.02, 0.38)), (0.78, 0.36, 0.16), "#5c636e", bevel=0.04)
oell(R, f"{R}_horn", p + Vector((0.46, 0, 0.4)), (0.26, 0.12, 0.09), "#6a727c")
# Tool rack on the left wall: a board and three chunky tools.
rack = grid(0.48, 3.55, 0)
obox(R, f"{R}_rack", rack + Vector((0, 0, 0.55)), (0.12, 0.62, 0.85), "#6b4428", bevel=0.02)
for i, z in enumerate((0.35, 0.55, 0.75)):
    obox(R, f"{R}_tool{i}", rack + Vector((-0.02, -0.08, z)), (0.28, 0.08, 0.08), IRON if i != 1 else GOLD, bevel=0.01)
# Coal bin with cool coals, and a warm ember pool in front of it.
shadow(R, f"{R}_shbin", 6.15, 2.55, 0.4, 0.26)
binp = grid(6.15, 2.35, 0)
obox(R, f"{R}_bin", binp + Vector((0, 0, 0.22)), (0.62, 0.42, 0.4), "#3a3e46", bevel=0.02)
for i, (dx, dy) in enumerate(((-0.1, 0.02), (0.12, -0.04), (0.0, -0.08))):
    oell(R, f"{R}_coal{i}", binp + Vector((dx, dy, 0.42)), (0.14, 0.1, 0.1), "#2a2428")
oell(R, f"{R}_pool1", grid(5.35, 2.15, 0.03), (0.55, 0.28, 0.03), "#ffb25a", outline=False)
# Water trough and quench barrel on the right, with cool blue water.
shadow(R, f"{R}_sht", 5.55, 3.85, 0.7, 0.28)
tr = grid(5.5, 3.6, 0)
obox(R, f"{R}_trough", tr + Vector((0, 0, 0.16)), (1.15, 0.42, 0.28), IRON, bevel=0.02)
obox(R, f"{R}_water", tr + Vector((0, -0.02, 0.28)), (0.95, 0.28, 0.08), "#7eb4c8", outline=False)
shadow(R, f"{R}_shbar", 6.35, 3.15, 0.28, 0.2)
bar = grid(6.35, 2.95, 0)
otube(R, f"{R}_barrel", bar + Vector((0, 0, 0.08)), bar + Vector((0, 0, 0.55)), 0.24, 0.22, "#8a5a32", segs=10)
obox(R, f"{R}_band", bar + Vector((0, 0, 0.32)), (0.52, 0.36, 0.06), IRON, outline=False)
oell(R, f"{R}_quench", bar + Vector((0, -0.02, 0.56)), (0.16, 0.12, 0.05), "#9ec4d4", outline=False)
# A second glow by the anvil, and a pale steam puff in the front corner.
oell(R, f"{R}_pool2", grid(1.15, 3.35, 0.03), (0.42, 0.22, 0.025), "#ffc878", outline=False)
oell(R, f"{R}_steam", grid(0.7, 4.35, 0.2), (0.22, 0.14, 0.16), "#d5e4ee", outline=False)
# Short side steps, the layout blocks, kept at the edges.
gbox(R, f"{R}_stL", 0.25, 4.15, 1.15, 4.75, 0.02, 0.22, "#6a4634", bevel=0.015)
gbox(R, f"{R}_stR", 4.55, 4.2, 5.35, 4.8, 0.02, 0.2, "#5c4338", bevel=0.015)
target_note_r = "G2B-41 sample. Red belt forge, Bellows Door. Bellows, rack, bin, trough, barrel, ember pools. No danger red."

# ------------------------------------------------------------------ Brown library: Reading Nook
# Warm planks, shelves both sides, a cart, rugs, cushions, floor roots and a ladder.
# The middle, from the open door to the front, stays clear.
B = "room-brown"
BARK, PAGE, LEAF, LEATHER = "#5c3d28", "#f3e6c8", "#5f8a48", "#8a5a38"
# One slab. Separate plank rows left a dark seam on every joint.
gbox(B, f"{B}_floor", 0, 0, 7, 5, -0.02, 0.0, "#c49a62", outline=False)
back_wall(B, "#6a4a32", "#8a6844", "#a08060", "#5c3d28")
BOOKS = ((-0.38, "#c4a06a"), (-0.12, "#3f6a38"), (0.14, "#8a5a3c"), (0.38, "#efe0c0"))
shelf_of_books(B, "shL", 1.15, 0.95, BOOKS)
shelf_of_books(B, "shR", 5.75, 1.05, tuple(reversed(BOOKS)))
# A ladder against the right shelf: two rails and three rungs, so it cannot be mistaken for a plank.
lad = grid(4.95, 1.45, 0)
otube(B, f"{B}_ladL", lad + Vector((-0.16, 0, 0.08)), lad + Vector((-0.16, 0, 0.95)), 0.035, 0.03, "#c4a06a")
otube(B, f"{B}_ladR", lad + Vector((0.16, 0, 0.08)), lad + Vector((0.16, 0, 0.95)), 0.035, 0.03, "#c4a06a")
for i, z in enumerate((0.28, 0.5, 0.72)):
    otube(B, f"{B}_rung{i}", lad + Vector((-0.16, 0, z)), lad + Vector((0.16, 0, z)), 0.028, 0.028, "#a08060")
# Short roots tucked on the wall edges, not lying across the floor.
floor_root(B, f"{B}_root0", 0.22, 1.55, 0.48, 2.05)
floor_root(B, f"{B}_root1", 6.5, 1.55, 6.78, 2.1)
floor_root(B, f"{B}_root2", 0.22, 3.45, 0.42, 3.9)
# Armchair-shaped root and two cushions, on the left of the path.
shadow(B, f"{B}_shseat", 1.35, 4.15, 0.5, 0.28)
seat = grid(1.35, 3.9, 0)
oell(B, f"{B}_seat", seat + Vector((0, 0, 0.22)), (0.5, 0.38, 0.26), BARK)
obox(B, f"{B}_back", seat + Vector((-0.18, 0.08, 0.48)), (0.16, 0.32, 0.32), BARK, bevel=0.02)
oell(B, f"{B}_cushion", seat + Vector((0.05, -0.04, 0.4)), (0.32, 0.22, 0.1), "#c4a06a")
oell(B, f"{B}_cush2", grid(1.15, 2.55, 0.08), (0.28, 0.2, 0.1), LEAF)
oell(B, f"{B}_cush3", grid(5.35, 3.15, 0.08), (0.26, 0.18, 0.09), "#c4a06a")
# Rugs, flat, off the center path.
gbox(B, f"{B}_rug1", 0.4, 2.35, 1.7, 3.05, 0.005, 0.03, PAGE, outline=False)
gbox(B, f"{B}_rug2", 5.15, 3.45, 6.55, 4.35, 0.005, 0.03, LEATHER, outline=False)
# Book cart: a low bed, two wheels, a few books.
shadow(B, f"{B}_shcart", 5.7, 4.15, 0.45, 0.24)
cart = grid(5.7, 3.95, 0)
obox(B, f"{B}_cart", cart + Vector((0, 0, 0.22)), (0.7, 0.4, 0.1), "#6b4a2c", bevel=0.02)
oell(B, f"{B}_w0", cart + Vector((-0.22, 0.02, 0.1)), (0.1, 0.08, 0.1), "#3a2a22")
oell(B, f"{B}_w1", cart + Vector((0.22, 0.02, 0.1)), (0.1, 0.08, 0.1), "#3a2a22")
for i, (dx, col) in enumerate(((-0.18, "#3f6a38"), (0.02, PAGE), (0.2, "#8a5a3c"))):
    obox(B, f"{B}_cb{i}", cart + Vector((dx, -0.02, 0.4)), (0.14, 0.16, 0.22), col)
# Warm lamp on the right, and a few leaves in the roots.
shadow(B, f"{B}_shlamp", 5.15, 2.55, 0.18, 0.12)
lamp = grid(5.15, 2.35, 0)
otube(B, f"{B}_post", lamp, lamp + Vector((0, 0, 0.62)), 0.04, 0.032, "#c4a06a")
oell(B, f"{B}_glow", lamp + Vector((0, -0.02, 0.74)), (0.16, 0.12, 0.14), "#ffd36a", outline=False)
oell(B, f"{B}_leaf", grid(1.9, 1.9, 0.12), (0.18, 0.1, 0.03), LEAF, rot=(0, 0, 25))
oell(B, f"{B}_leaf2", grid(5.0, 1.9, 0.12), (0.16, 0.09, 0.03), LEAF)
target_note_b = "G2B-42 sample. Brown, Root Library, Reading Nook. Shelves, cart, rugs, cushions, floor roots, ladder."

scene["static_targets"] = json.dumps([
    dict(name=G, layers=[G], rect=[0, 0, 7, 5], top=1.35, anchor=[0, 0], note=target_note_g),
    dict(name=R, layers=[R], rect=[0, 0, 7, 5], top=1.35, anchor=[0, 0], note=target_note_r),
    dict(name=B, layers=[B], rect=[0, 0, 7, 5], top=1.35, anchor=[0, 0], note=target_note_b),
])
os.makedirs(os.path.dirname(os.path.abspath(A.out)), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("SAVED", A.out)
