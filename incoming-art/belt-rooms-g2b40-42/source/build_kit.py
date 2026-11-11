"""
Dojo Ascent — Green-to-Black room kit (G2B-40, G2B-41, G2B-42).

Same camera as the approved belt-room samples and the Ember Kitchens:
orthographic, 35 degrees down, 80 px per tile, toon shader, dark outlines.

    blender -b -P incoming-art/belt-rooms-g2b40-42/source/build_kit.py -- \
        --out incoming-art/belt-rooms-g2b40-42/source/belt-room-kit.blend
    blender -b incoming-art/belt-rooms-g2b40-42/source/belt-room-kit.blend \
        -P incoming-art/tools/render_static.py -- \
        --out incoming-art/belt-rooms-g2b40-42/kit --samples 8
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
TARGETS = []

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
        add_hull(ob, layer(lay), OUT, 0.014)
    return ob

def gbox(lay, name, c0, r0, c1, r1, z0, z1, color, outline=True, bevel=0.0, flat=False):
    a, b = grid(c0, r1, z0), grid(c1, r0, z1)
    return put(name, box((a + b) / 2, Vector((abs(b.x - a.x), abs(b.y - a.y), abs(b.z - a.z))), bevel=bevel),
               color, lay, outline, flat)

def obox(lay, name, c, size, color, outline=True, bevel=0.0, flat=False):
    return put(name, box(c, size, bevel=bevel), color, lay, outline, flat=flat)

def oell(lay, name, c, s, color, rot=(0, 0, 0), outline=True):
    return put(name, ellipsoid(c, s, rot=rot, segs=12, rings=8), color, lay, outline, smooth=True)

def otube(lay, name, p0, p1, r0, r1, color, outline=True):
    return put(name, tube(p0, p1, r0, r1, segs=8), color, lay, outline, smooth=True)

def add_target(name, top, note, group, w=1.0, h=1.0):
    TARGETS.append(dict(name=name, layers=[name], rect=[0, 0, w, h], top=top, anchor=[0, 0], note=note, group=group))

def shadow(lay, name, c, r, rx, ry):
    oell(lay, name, grid(c, r, 0.012), (rx, ry * 0.7, 0.015), "#2c2824", outline=False)

def floor_tile(name, color, group, note, kind="plain"):
    """Quiet floor with a little texture, not a blank fill and not a hard checker."""
    gbox(name, name + "_f", 0.0, 0.0, 1.0, 1.0, -0.04, 0.0, color, outline=False)
    if kind == "moss":
        # One soft patch and one pebble. Two tile versions shift them so the floor is not a stamp.
        shift = 0.35 if name.endswith("-b") else 0.0
        oell(name, name + "_m", grid(0.28 + shift, 0.4, 0.012), (0.34, 0.18, 0.012), "#5e8c50", outline=False)
    elif kind == "brick":
        gbox(name, name + "_a", 0.04, 0.08, 0.96, 0.48, -0.01, 0.0, "#b07954", outline=False)
        gbox(name, name + "_b", 0.0, 0.52, 0.62, 0.94, -0.01, 0.0, "#9d6244", outline=False)
        gbox(name, name + "_c", 0.66, 0.52, 1.0, 0.94, -0.01, 0.0, "#a9714e", outline=False)
    elif kind == "plank":
        gbox(name, name + "_s", 0.0, 0.48, 1.0, 0.52, -0.01, 0.005, "#c9a06a", outline=False)
    elif kind == "river":
        oell(name, name + "_r", grid(0.4, 0.55, 0.02), (0.3, 0.16, 0.02), "#9ec4d4", outline=False)
    elif kind == "slate":
        oell(name, name + "_s", grid(0.6, 0.4, 0.02), (0.22, 0.12, 0.02), "#7a7268", outline=False)
    elif kind == "night":
        oell(name, name + "_g", grid(0.3, 0.3, 0.02), (0.16, 0.1, 0.02), "#4a5670", outline=False)
    add_target(name, 0.0, note, group)

def wall_tile(name, stone, cap, group):
    """Full-bleed so neighbouring wall cells meet. The camera crops to the tile."""
    y = grid(0, 0.28, 0).y
    obox(name, name + "_w", Vector((0.5, y + 0.08, 0.55)), (1.12, 0.34, 1.05), stone)
    obox(name, name + "_c", Vector((0.5, y - 0.02, 1.12)), (1.16, 0.4, 0.18), cap)
    obox(name, name + "_b", Vector((0.5, y + 0.02, 0.08)), (1.12, 0.2, 0.16), "#3e342c", outline=False)
    add_target(name, 1.2, "top-wall cell, joins the next cell", group)

def south_tile(name, stone, cap, group):
    """One parapet cell. Edge to edge, so a row of them is one wall, not a palisade."""
    gbox(name, name + "_w", -0.04, -0.02, 1.04, 1.02, 0.0, 0.42, stone)
    gbox(name, name + "_c", -0.06, -0.04, 1.06, 1.04, 0.38, 0.52, cap, outline=False)
    add_target(name, 0.6, "south wall cell, joins its neighbours", group)

def block_tile(name, stone, cap, group, h=0.55):
    """Stacked steps. The lowest tread fills the tile so neighbours join. Moss on top."""
    gbox(name, name + "_a", -0.03, -0.02, 1.03, 1.02, 0.0, h * 0.38, stone)
    gbox(name, name + "_b", 0.06, 0.08, 0.94, 0.78, 0.0, h * 0.7, stone)
    gbox(name, name + "_c", 0.16, 0.16, 0.84, 0.52, 0.0, h, stone)
    gbox(name, name + "_m", 0.18, 0.18, 0.8, 0.48, h - 0.01, h + 0.045, cap, outline=False)
    add_target(name, h + 0.12, "joined stair block with a moss or cap top", group)

def side_tile(name, stone, cap, group):
    """A rim that runs the full depth of the cell, so stacked side cells join."""
    gbox(name, name + "_s", 0.0, -0.04, 0.46, 1.04, 0.0, 0.9, stone)
    gbox(name, name + "_c", 0.0, -0.06, 0.52, 1.06, 0.84, 1.0, cap, outline=False)
    add_target(name, 1.08, "side wall", group)

def door_tile(name, stone, cap, group):
    y = grid(0, 0.28, 0).y
    for tag, x in (("a", 0.12), ("b", 0.88)):
        obox(name, name + tag, Vector((x, y + 0.06, 0.5)), (0.16, 0.28, 1.0), stone, bevel=0.02)
    obox(name, name + "_l", Vector((0.5, y - 0.02, 1.12)), (1.02, 0.34, 0.16), cap, bevel=0.02)
    add_target(name, 1.2, "open doorway in the top wall", group)

def chest_tile(name, body, lid, band, group):
    gbox(name, name + "_b", 0.18, 0.22, 0.82, 0.78, 0.0, 0.32, body, bevel=0.03)
    gbox(name, name + "_l", 0.14, 0.18, 0.86, 0.74, 0.32, 0.44, lid, bevel=0.02)
    gbox(name, name + "_d", 0.42, 0.16, 0.58, 0.32, 0.34, 0.42, band, outline=False)
    add_target(name, 0.55, "chest", group)

def shrine_tile(name, cloth, post, glow, group):
    shadow(name, name + "_sh", 0.5, 0.82, 0.3, 0.18)
    oell(name, name + "_c1", grid(0.28, 0.7, 0.08), (0.24, 0.16, 0.08), cloth)
    oell(name, name + "_c2", grid(0.72, 0.72, 0.08), (0.22, 0.15, 0.07), cloth)
    p = grid(0.5, 0.42, 0)
    otube(name, name + "_p", p, p + Vector((0, 0, 0.28)), 0.045, 0.04, post)
    obox(name, name + "_h", p + Vector((0, -0.02, 0.52)), (0.4, 0.3, 0.36), post, bevel=0.03)
    oell(name, name + "_g", p + Vector((0, -0.08, 0.52)), (0.22, 0.14, 0.2), glow, outline=False)
    add_target(name, 0.85, "rest shrine with a lamp body", group)

def flat_ell(name, color, sx, sy, group, note, z=0.03):
    oell(name, name + "_e", grid(0.5, 0.5, z), (sx, sy, 0.03), color, outline=False)
    add_target(name, 0.05, note, group)

def prop_stone(name, color, moss, group):
    shadow(name, name + "_sh", 0.5, 0.72, 0.5, 0.28)
    oell(name, name + "_s", grid(0.5, 0.55, 0.1), (0.72, 0.42, 0.12), color)
    oell(name, name + "_m", grid(0.38, 0.48, 0.16), (0.28, 0.14, 0.035), moss, outline=False)
    add_target(name, 0.25, "big stepping stone", group)

def prop_fern(name, leaf, group):
    shadow(name, name + "_sh", 0.5, 0.72, 0.36, 0.22)
    base = grid(0.5, 0.55, 0)
    otube(name, name + "_t", base, base + Vector((0, 0, 0.18)), 0.035, 0.028, "#2f5a28", outline=False)
    for i, ang in enumerate((-0.7, 0.05, 0.75)):
        oell(name, name + f"l{i}", base + Vector((math.sin(ang) * 0.18, -0.02, 0.28)),
             (0.32, 0.1, 0.06), leaf if i != 1 else "#6aaa52", rot=(68, 0, math.degrees(ang)))
    add_target(name, 0.45, "fern", group)

def prop_jar(name, clay, group):
    shadow(name, name + "_sh", 0.5, 0.78, 0.35, 0.22)
    p = grid(0.5, 0.5, 0)
    otube(name, name + "_j", p, p + Vector((0, 0, 1.05)), 0.42, 0.28, clay)
    otube(name, name + "_n", p + Vector((0, 0, 1.05)), p + Vector((0, 0, 1.35)), 0.16, 0.12, "#c4a06a")
    add_target(name, 1.45, "jar or giant inkwell", group)

def prop_blanket(name, cloth, group):
    gbox(name, name + "_b", 0.15, 0.25, 0.85, 0.8, 0.0, 0.08, cloth, bevel=0.02)
    add_target(name, 0.15, "blanket", group)

def prop_lantern(name, post, glow, group):
    shadow(name, name + "_sh", 0.5, 0.78, 0.28, 0.18)
    p = grid(0.5, 0.5, 0)
    otube(name, name + "_p", p, p + Vector((0, 0, 0.35)), 0.045, 0.04, post)
    obox(name, name + "_h", p + Vector((0, -0.02, 0.62)), (0.62, 0.42, 0.48), post, bevel=0.04)
    oell(name, name + "_g", p + Vector((0, -0.1, 0.62)), (0.32, 0.2, 0.26), glow, outline=False)
    obox(name, name + "_c", p + Vector((0, -0.02, 0.74)), (0.4, 0.3, 0.08), "#5c4634")
    add_target(name, 0.9, "lantern with a real body", group)

def prop_reed(name, green, group):
    for i, dx in enumerate((-0.22, -0.05, 0.12, 0.26)):
        a = grid(0.5 + dx, 0.7, 0)
        otube(name, name + f"r{i}", a, a + Vector((0.04, -0.04, 1.35)), 0.055, 0.02, green)
    add_target(name, 1.5, "tall reeds", group)

def prop_boat(name, wood, group):
    shadow(name, name + "_sh", 1.0, 0.85, 0.9, 0.35)
    oell(name, name + "_h", grid(1.0, 0.5, 0.16), (1.55, 0.48, 0.22), wood)
    obox(name, name + "_s", grid(0.7, 0.45, 0.32), (0.08, 0.4, 0.28), "#6b4428")
    add_target(name, 0.5, "rowboat", group, w=2.0)

def prop_oar(name, wood, group):
    a, b = grid(0.25, 0.7, 0.15), grid(0.75, 0.35, 0.35)
    otube(name, name + "_o", a, b, 0.035, 0.02, wood)
    add_target(name, 0.45, "oar", group)

def prop_bellows(name, leather, iron, group):
    shadow(name, name + "_sh", 0.5, 0.78, 0.55, 0.32)
    q = grid(0.48, 0.5, 0)
    obox(name, name + "_g", q + Vector((0, 0, 0.32)), (0.85, 0.48, 0.42), leather, bevel=0.06)
    obox(name, name + "_n", q + Vector((0.42, -0.02, 0.3)), (0.22, 0.2, 0.16), iron, bevel=0.02)
    otube(name, name + "_h", q + Vector((-0.28, 0.02, 0.12)), q + Vector((0.12, -0.04, 0.58)), 0.045, 0.035, "#c4a06a")
    add_target(name, 0.7, "leather bellows", group)

def prop_anvil(name, iron, group):
    shadow(name, name + "_sh", 0.48, 0.78, 0.5, 0.3)
    p = grid(0.4, 0.5, 0)
    obox(name, name + "_b", p + Vector((0, 0, 0.16)), (0.5, 0.38, 0.3), "#3a3e46", bevel=0.03)
    obox(name, name + "_t", p + Vector((0.06, -0.02, 0.38)), (0.78, 0.36, 0.16), iron, bevel=0.04)
    oell(name, name + "_n", p + Vector((0.48, 0, 0.4)), (0.26, 0.12, 0.09), "#6a727c")
    add_target(name, 0.55, "anvil", group)

def prop_barrel(name, wood, band, water, group):
    shadow(name, name + "_sh", 0.5, 0.75, 0.32, 0.22)
    p = grid(0.5, 0.5, 0)
    otube(name, name + "_b", p + Vector((0, 0, 0.08)), p + Vector((0, 0, 0.55)), 0.24, 0.22, wood)
    obox(name, name + "_n", p + Vector((0, 0, 0.32)), (0.52, 0.36, 0.06), band, outline=False)
    if water:
        oell(name, name + "_w", p + Vector((0, -0.02, 0.56)), (0.16, 0.12, 0.05), water, outline=False)
    add_target(name, 0.7, "barrel", group)

def prop_shelf(name, wood, books, group):
    shadow(name, name + "_sh", 1.0, 0.85, 0.7, 0.22)
    sy = grid(0, 0.35, 0).y
    obox(name, name + "_s", Vector((1.0, sy, 0.62)), (1.15, 0.26, 1.15), wood, bevel=0.02)
    for zi, z in enumerate((0.32, 0.62, 0.9)):
        for i, col in enumerate(books):
            obox(name, name + f"k{zi}_{i}", Vector((0.62 + i * 0.24, sy - 0.14, z)), (0.18, 0.1, 0.26), col)
    add_target(name, 1.05, "bookshelf of coloured books", group, w=2.0)

def prop_root(name, bark, group):
    a, b = grid(0.12, 0.62, 0.06), grid(0.88, 0.48, 0.07)
    otube(name, name + "_r", a, b, 0.09, 0.05, bark)
    oell(name, name + "_k", grid(0.5, 0.55, 0.1), (0.14, 0.1, 0.08), "#8a6844")
    add_target(name, 0.2, "short root along a wall edge", group)

def prop_lamp(name, post, glow, group):
    prop_lantern(name, post, glow, group)

def prop_cushion(name, cloth, group):
    oell(name, name + "_c", grid(0.5, 0.55, 0.08), (0.28, 0.2, 0.08), cloth)
    add_target(name, 0.2, "cushion", group)

def prop_rug(name, cloth, group):
    gbox(name, name + "_g", 0.05, 0.15, 1.9, 0.9, 0.0, 0.03, cloth, outline=False)
    add_target(name, 0.05, "rug", group, w=2.0)

def prop_drum(name, hide, band, group):
    shadow(name, name + "_sh", 0.5, 0.82, 0.48, 0.3)
    p = grid(0.5, 0.48, 0)
    otube(name, name + "_d", p, p + Vector((0, 0, 0.62)), 0.4, 0.4, hide)
    obox(name, name + "_b", p + Vector((0, 0, 0.32)), (0.86, 0.58, 0.08), band, outline=False)
    add_target(name, 0.75, "storm drum", group)

def prop_bell(name, metal, group):
    shadow(name, name + "_sh", 0.5, 0.85, 0.28, 0.16)
    p = grid(0.5, 0.45, 0.2)
    otube(name, name + "_b", p + Vector((0, 0, 0.7)), p, 0.1, 0.28, metal)
    otube(name, name + "_p", p + Vector((0, 0, 0.7)), p + Vector((0, 0, 1.05)), 0.03, 0.03, "#6b4428")
    add_target(name, 1.2, "bell", group)

def prop_mirror(name, frame, glass, group):
    shadow(name, name + "_sh", 0.5, 0.9, 0.4, 0.16)
    obox(name, name + "_f", grid(0.5, 0.35, 0.85), (0.78, 0.1, 1.45), frame, bevel=0.03)
    obox(name, name + "_g", grid(0.5, 0.3, 0.85), (0.55, 0.05, 1.15), glass, outline=False)
    add_target(name, 1.7, "tall mirror frame", group)

def prop_statue(name, stone, glow, group):
    p = grid(0.5, 0.55, 0)
    otube(name, name + "_b", p, p + Vector((0, 0, 0.5)), 0.12, 0.1, stone)
    oell(name, name + "_h", p + Vector((0, -0.02, 0.62)), (0.12, 0.1, 0.12), stone)
    oell(name, name + "_l", p + Vector((0.1, -0.04, 0.4)), (0.06, 0.04, 0.05), glow, outline=False)
    add_target(name, 0.8, "helper statue with a lantern", group)

def prop_arch(name, stone, group):
    y = grid(0, 0.3, 0).y
    obox(name, name + "_l", Vector((0.5, y, 1.05)), (0.9, 0.2, 0.16), stone, bevel=0.02)
    add_target(name, 1.15, "arch lintel", group)

def prop_feather(name, color, group):
    oell(name, name + "_f", grid(0.5, 0.5, 0.35), (0.08, 0.05, 0.28), color, rot=(20, 0, 15))
    add_target(name, 0.6, "hanging feather", group)

def prop_umbrella(name, cloth, group):
    shadow(name, name + "_sh", 0.55, 0.85, 0.45, 0.24)
    p = grid(0.4, 0.55, 0)
    otube(name, name + "_p", p, p + Vector((0.22, -0.08, 0.85)), 0.045, 0.03, "#6b4428")
    oell(name, name + "_u", p + Vector((0.2, -0.06, 0.55)), (0.62, 0.36, 0.18), cloth, rot=(70, 0, 35))
    add_target(name, 1.0, "tipped umbrella", group)

# Palettes. Reds stay brown enough that they are not danger-red.
THEMES = {
    "green": dict(floor="#5a884c", floor2="#628e54", wall="#6e726c", cap="#6e9a62", block="#7d7a74",
                  cloth="#6aaa52", wood="#8a6844", metal="#8a8780", glow="#e6d7a4", water="#7eb4c8", accent="#d4c09a"),
    "blue": dict(floor="#7f9aa8", floor2="#89a4b0", wall="#5e727c", cap="#8eb4c4", block="#6a7e88",
                 cloth="#3f8a78", wood="#a08460", metal="#c5ccd0", glow="#f0d78a", water="#6aa4b8", accent="#d8e4ea"),
    "red": dict(floor="#a9714e", floor2="#b07954", wall="#5c4338", cap="#8d5238", block="#6a4634",
                cloth="#7a4a30", wood="#8a5a32", metal="#5c636e", glow="#ffb25a", water="#7eb4c8", accent="#e2b15a"),
    "redblack": dict(floor="#4a4e56", floor2="#525860", wall="#2e3238", cap="#8a6848", block="#3a3e46",
                     cloth="#6a5348", wood="#5c4638", metal="#c5ccd4", glow="#e2b15a", water="#8aa0b0", accent="#d9c7a4"),
    "brown": dict(floor="#c49a62", floor2="#c49a62", wall="#6a4a32", cap="#8a6844", block="#6b4a2c",
                  cloth="#c4a06a", wood="#6b4a2c", metal="#8a5a38", glow="#ffd36a", water="#7f97a8", accent="#f3e6c8"),
    "brownblack": dict(floor="#6a645c", floor2="#726c64", wall="#3e4450", cap="#2f6a62", block="#4a463e",
                       cloth="#3f6a62", wood="#5c4634", metal="#8a8478", glow="#e6c878", water="#4a6a68", accent="#d8c090"),
    "black": dict(floor="#3a4254", floor2="#424a5c", wall="#2a3140", cap="#8a93a4", block="#323846",
                  cloth="#6a6248", wood="#5a5348", metal="#c8cdd4", glow="#e2b15a", water="#6a7890", accent="#d5dbe4"),
}

FLOOR_KIND = {
    "green": "moss", "blue": "river", "red": "brick", "redblack": "slate",
    "brown": "plank", "brownblack": "slate", "black": "night",
}

def build_theme(key, pal):
    g = key
    kind = FLOOR_KIND[key]
    floor_tile(f"{g}-floor", pal["floor"], g, "quiet floor tile", kind)
    if pal["floor2"] != pal["floor"]:
        floor_tile(f"{g}-floor-b", pal["floor2"], g, "a second floor tile, only a little lighter", kind)
    wall_tile(f"{g}-wall", pal["wall"], pal["cap"], g)
    south_tile(f"{g}-south", pal["wall"], pal["cap"], g)
    side_tile(f"{g}-side", pal["wall"], pal["cap"], g)
    block_tile(f"{g}-block", pal["block"], pal["cap"], g)
    door_tile(f"{g}-door", pal["wall"], pal["cap"], g)
    chest_tile(f"{g}-chest", pal["wood"], pal["cap"], pal["accent"], g)
    shrine_tile(f"{g}-shrine", pal["cloth"], pal["accent"], pal["glow"], g)
    prop_lantern(f"{g}-lantern", pal["accent"], pal["glow"], g)
    prop_cushion(f"{g}-cushion", pal["cloth"], g)
    prop_rug(f"{g}-rug", pal["accent"], g)

for key, pal in THEMES.items():
    build_theme(key, pal)

# Green set pieces named in the Giant's Steps brief.
prop_stone("green-stone", "#8a8780", "#6aaa52", "green")
prop_fern("green-fern", "#4f8a3e", "green")
prop_jar("green-jar", "#b5835c", "green")
prop_blanket("green-blanket", "#c4a06a", "green")
block_tile("green-stair", "#7d7a74", "#6e9a62", "green", h=0.42)
flat_ell("green-shade", "#7f97a8", 0.7, 0.4, "green", "soft blue corner shade")
gbox("green-stream", "green-stream_w", 0.15, 0.0, 0.85, 1.0, -0.02, 0.02, "#7eb4c8", outline=False)
gbox("green-stream", "green-stream_b", 0.05, 0.0, 0.2, 1.0, 0.0, 0.05, "#4e7a3a", outline=False)
oell("green-stream", "green-stream_s", grid(0.55, 0.3, 0.04), (0.08, 0.05, 0.02), "#f4f7f2", outline=False)
oell("green-stream", "green-stream_s2", grid(0.48, 0.7, 0.04), (0.07, 0.04, 0.02), "#f4f7f2", outline=False)
add_target("green-stream", 0.08, "one tile of the sparkling stream", "green")

# Blue, Quiet River.
prop_reed("blue-reed", "#3f8a62", "blue")
prop_boat("blue-boat", "#a08460", "blue")
prop_oar("blue-oar", "#c4a06a", "blue")
flat_ell("blue-lily", "#6aaa72", 0.36, 0.22, "blue", "lily pad")
flat_ell("blue-ripple", "#9ec4d4", 0.5, 0.28, "blue", "shallow ripple")
prop_stone("blue-stone", "#9aa4aa", "#6aaa72", "blue")

# Red, Forge of Courage. Ember pools stay bright. The floor stays quiet.
prop_bellows("red-bellows", "#7a4a30", "#4e555e", "red")
prop_anvil("red-anvil", "#5c636e", "red")
prop_barrel("red-barrel", "#8a5a32", "#4e555e", "#9ec4d4", "red")
prop_barrel("red-bin", "#3a3e46", "#5c636e", None, "red")
flat_ell("red-ember", "#ffb25a", 0.55, 0.32, "red", "warm ember pool", z=0.02)
obox("red-tool", "red-tool_b", grid(0.5, 0.45, 0.4), (0.16, 0.1, 0.55), "#6b4428", bevel=0.02)
obox("red-tool", "red-tool_h", grid(0.5, 0.4, 0.62), (0.32, 0.1, 0.1), "#5c636e", bevel=0.01)
add_target("red-tool", 0.75, "tool rack", "red")
shadow("red-trough", "red-trough_sh", 1.0, 0.8, 0.7, 0.28)
obox("red-trough", "red-trough_b", grid(1.0, 0.5, 0.16), (1.15, 0.42, 0.28), "#4e555e", bevel=0.02)
obox("red-trough", "red-trough_w", grid(1.0, 0.48, 0.28), (0.95, 0.28, 0.08), "#7eb4c8", outline=False)
add_target("red-trough", 0.4, "water trough", "red", w=2.0)
prop_blanket("red-bench", "#6b4428", "red")

# Red-Black, Hall of Echoes. Charcoal and silver. No danger-red, no purple stripes.
prop_mirror("redblack-mirror", "#c5ccd4", "#9aa8b4", "redblack")
prop_bell("redblack-bell", "#c5ccd4", "redblack")
prop_arch("redblack-arch", "#3a3e46", "redblack")
flat_ell("redblack-ring", "#8a9098", 0.46, 0.26, "redblack", "soft sound ring, not a warning stripe")

# Brown, Root Library. One floor colour. Roots are a short wall-edge piece.
prop_shelf("brown-shelf", "#6b4a2c", ("#c4a06a", "#3f6a38", "#8a5a3c", "#efe0c0"), "brown")
prop_root("brown-root", "#a08060", "brown")
prop_lamp("brown-lamp", "#c4a06a", "#ffd36a", "brown")
oell("brown-seat", "brown-seat_s", grid(0.48, 0.58, 0.18), (0.36, 0.26, 0.2), "#5c3d28")
obox("brown-seat", "brown-seat_b", grid(0.32, 0.5, 0.32), (0.12, 0.2, 0.22), "#5c3d28", bevel=0.02)
add_target("brown-seat", 0.5, "armchair-shaped root", "brown")
prop_jar("brown-ink", "#2a3a48", "brown")

# Brown-Black, Storm Stair. Lightning is a soft gold tip, not a bolt.
prop_drum("brownblack-drum", "#5c4634", "#e6c878", "brownblack")
prop_umbrella("brownblack-umbrella", "#2f6a62", "brownblack")
prop_feather("brownblack-feather", "#e6d7b0", "brownblack")
flat_ell("brownblack-puddle", "#4a6a68", 0.46, 0.26, "brownblack", "puddle")
otube("brownblack-rod", "brownblack-rod_p", grid(0.5, 0.6, 0), grid(0.5, 0.55, 0.7), 0.04, 0.025, "#5c5348")
oell("brownblack-rod", "brownblack-rod_g", grid(0.5, 0.52, 0.78), (0.08, 0.06, 0.08), "#e6c878", outline=False)
add_target("brownblack-rod", 0.9, "lightning rod with a soft gold tip", "brownblack")

# Black, the Summit.
prop_statue("black-statue", "#8a93a4", "#e2b15a", "black")
prop_bell("black-bell", "#c8a45a", "black")
prop_arch("black-arch", "#d5dbe4", "black")
prop_blanket("black-sash", "#e6d7b0", "black")

# A worn stepping stone, two tiles wide, with a real shadow. Not a floor speck.
def path_stone(name, color, moss, group):
    shadow(name, name + "_sh", 1.0, 0.85, 0.85, 0.4)
    oell(name, name + "_s", grid(1.0, 0.5, 0.12), (1.45, 0.62, 0.18), color)
    oell(name, name + "_m", grid(0.7, 0.42, 0.2), (0.4, 0.18, 0.04), moss, outline=False)
    add_target(name, 0.3, "thick river stepping stone", group, w=2.0)
path_stone("green-pathstone", "#8a8780", "#6aaa52", "green")

def prop_ladder(name, wood, group):
    shadow(name, name + "_sh", 0.5, 0.85, 0.28, 0.14)
    a = grid(0.32, 0.5, 0.05)
    b = grid(0.68, 0.5, 0.05)
    otube(name, name + "_l", a, a + Vector((0, 0, 1.15)), 0.04, 0.035, wood)
    otube(name, name + "_r", b, b + Vector((0, 0, 1.15)), 0.04, 0.035, wood)
    for i, z in enumerate((0.25, 0.5, 0.75, 1.0)):
        otube(name, name + f"u{i}", a + Vector((0, 0, z)), b + Vector((0, 0, z)), 0.03, 0.03, "#a08060")
    add_target(name, 1.25, "library ladder", group)
prop_ladder("brown-ladder", "#c4a06a", "brown")

def hanging_lantern(name, cloth, glow, group):
    y = grid(0, 0.3, 0).y
    obox(name, name + "_p", Vector((0.5, y, 1.15)), (0.08, 0.08, 0.35), "#c4a06a", outline=False)
    obox(name, name + "_h", Vector((0.5, y - 0.04, 0.82)), (0.32, 0.22, 0.36), cloth, bevel=0.03)
    oell(name, name + "_g", Vector((0.5, y - 0.1, 0.82)), (0.16, 0.1, 0.16), glow, outline=False)
    add_target(name, 1.35, "hanging lantern", group)
hanging_lantern("red-hang", "#8d5238", "#ffb25a", "red")

def prop_flag(name, cloth, group):
    otube(name, name + "_p", grid(0.35, 0.6, 0), grid(0.35, 0.55, 1.3), 0.04, 0.03, "#5c5348")
    gbox(name, name + "_f", 0.4, 0.35, 0.95, 0.55, 0.85, 1.15, cloth)
    add_target(name, 1.4, "flag", group)
prop_flag("brownblack-flag", "#2f6a62", "brownblack")

def cloud_gate(name, stone, cloud, group):
    y = grid(0, 0.35, 0).y
    for tag, x in (("a", 0.35), ("b", 1.65)):
        obox(name, name + tag, Vector((x, y, 0.7)), (0.28, 0.28, 1.3), stone, bevel=0.02)
    obox(name, name + "_l", Vector((1.0, y, 1.4)), (1.7, 0.3, 0.22), stone)
    oell(name, name + "_c", Vector((1.0, y - 0.1, 1.55)), (0.7, 0.3, 0.28), cloud, outline=False)
    add_target(name, 1.7, "cloud gate", group, w=2.0)
cloud_gate("brownblack-gate", "#3e4450", "#d5dbe4", "brownblack")

# Boss architecture. Backdrop and perimeter only. No guardian body.
def giant_stair(name, stone, moss, group):
    # High step at the back, lower steps toward the camera, so the treads show.
    for i, h in enumerate((1.35, 1.0, 0.65, 0.32)):
        r0 = 0.05 + i * 0.28
        gbox(name, name + f"s{i}", 0.05, r0, 5.95, r0 + 0.32, 0.0, h, stone)
        gbox(name, name + f"m{i}", 0.1, r0 + 0.02, 5.9, r0 + 0.28, h - 0.02, h + 0.05, moss, outline=False)
    add_target(name, 1.55, "giant staircase on the top wall", group, w=6.0, h=1.3)
giant_stair("green-giant-stair", "#7d7a74", "#6e9a62", "green")

def round_forge(name, group):
    shadow(name, name + "_sh", 2.0, 1.1, 1.6, 0.5)
    p = grid(2.0, 0.45, 0)
    otube(name, name + "_m", p, p + Vector((0, 0, 1.3)), 1.15, 1.15, "#5c4338")
    oell(name, name + "_g", p + Vector((0, -0.7, 0.7)), (0.7, 0.25, 0.55), "#2a2428")
    oell(name, name + "_e", p + Vector((0, -0.85, 0.7)), (0.4, 0.12, 0.28), "#ffb25a", outline=False)
    add_target(name, 1.5, "huge round forge", group, w=4.0, h=1.2)
round_forge("red-forge", "red")

def shallow_pool(name, group):
    gbox(name, name + "_w", 0.0, 0.0, 4.0, 2.0, -0.03, 0.02, "#6aa4b8", outline=False)
    oell(name, name + "_s", grid(0.8, 1.3, 0.06), (0.7, 0.35, 0.08), "#9aa4aa")
    oell(name, name + "_s2", grid(3.1, 0.6, 0.06), (0.6, 0.3, 0.08), "#9aa4aa")
    add_target(name, 0.15, "wide shallow pool, flat, with side stones", group, w=4.0, h=2.0)
shallow_pool("blue-pool", "blue")

def grand_mirror(name, group):
    for i, x in enumerate((0.6, 1.8, 3.0)):
        obox(name, name + f"f{i}", grid(x, 0.35, 0.9), (0.7, 0.1, 1.5), "#c5ccd4", bevel=0.02)
        obox(name, name + f"g{i}", grid(x, 0.3, 0.9), (0.48, 0.04, 1.15), "#9aa8b4", outline=False)
    otube(name, name + "_b", grid(3.8, 0.4, 0.2), grid(3.8, 0.35, 1.3), 0.08, 0.22, "#c5ccd4")
    add_target(name, 1.7, "grand mirrors and a bell", group, w=4.5, h=1.0)
grand_mirror("redblack-grand", "redblack")

def giant_tree(name, group):
    p = grid(1.2, 0.4, 0)
    otube(name, name + "_t", p, p + Vector((0, 0, 2.2)), 0.45, 0.28, "#5c3d28")
    oell(name, name + "_c", p + Vector((0, -0.05, 2.0)), (1.3, 0.7, 0.7), "#3f6a38")
    otube(name, name + "_r", grid(0.2, 0.8, 0.08), grid(2.2, 0.55, 0.1), 0.12, 0.06, "#5c3d28")
    add_target(name, 2.3, "giant tree on the back wall", group, w=2.6, h=1.2)
giant_tree("brown-tree", "brown")

def wind_platform(name, group):
    for i, (c, r) in enumerate(((0.4, 0.3), (1.5, 0.6), (2.8, 0.25), (3.6, 0.7))):
        oell(name, name + f"c{i}", grid(c, r, 0.9), (0.7, 0.35, 0.28), "#d5dbe4", outline=False)
    gbox(name, name + "_p", 0.2, 0.8, 3.6, 1.5, 0.0, 0.12, "#8a8478", outline=False)
    add_target(name, 1.2, "cloudy wind platform along the edge", group, w=4.0, h=1.6)
wind_platform("brownblack-clouds", "brownblack")

def summit_stand(name, group):
    p = grid(0.8, 0.55, 0)
    otube(name, name + "_p", p, p + Vector((0, 0, 1.5)), 0.08, 0.06, "#c8cdd4")
    obox(name, name + "_h", p + Vector((0, -0.02, 1.15)), (0.45, 0.32, 0.4), "#8a93a4", bevel=0.03)
    oell(name, name + "_g", p + Vector((0, -0.08, 1.15)), (0.22, 0.14, 0.2), "#e2b15a", outline=False)
    for i, (c, r) in enumerate(((1.8, 0.3), (2.6, 0.55), (3.3, 0.25))):
        oell(name, name + f"c{i}", grid(c, r, 1.3), (0.55, 0.28, 0.22), "#d5dbe4", outline=False)
    add_target(name, 1.8, "lamp stand under swirling clouds", group, w=4.0, h=1.2)
summit_stand("black-stand", "black")

flat_ell("black-wisp", "#e2b15a", 0.42, 0.28, "black", "warm wisp", z=0.35)

scene["static_targets"] = json.dumps(TARGETS)
os.makedirs(os.path.dirname(os.path.abspath(A.out)), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("TARGETS", len(TARGETS))
print("SAVED", A.out)
