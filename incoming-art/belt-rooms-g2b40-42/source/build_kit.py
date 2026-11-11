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

def add_target(name, top, note, group):
    TARGETS.append(dict(name=name, layers=[name], rect=[0, 0, 1, 1], top=top, anchor=[0, 0], note=note, group=group))

def floor_tile(name, color, group, note):
    gbox(name, name + "_f", 0.0, 0.0, 1.0, 1.0, -0.04, 0.0, color, outline=False)
    add_target(name, 0.0, note, group)

def wall_tile(name, stone, cap, group):
    y = grid(0, 0.28, 0).y
    obox(name, name + "_w", Vector((0.5, y + 0.08, 0.55)), (0.96, 0.28, 1.05), stone, bevel=0.02)
    obox(name, name + "_c", Vector((0.5, y - 0.02, 1.12)), (1.02, 0.34, 0.16), cap, bevel=0.02)
    obox(name, name + "_b", Vector((0.5, y + 0.02, 0.08)), (1.0, 0.16, 0.16), "#3e342c", outline=False)
    add_target(name, 1.2, "top-wall cell", group)

def block_tile(name, stone, cap, group, h=0.55):
    gbox(name, name + "_k", 0.08, 0.08, 0.92, 0.92, 0.0, h, stone, bevel=0.02)
    gbox(name, name + "_c", 0.04, 0.04, 0.96, 0.96, h - 0.02, h + 0.08, cap, outline=False)
    add_target(name, h + 0.15, "solid layout block", group)

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
    oell(name, name + "_c1", grid(0.32, 0.62, 0.08), (0.22, 0.16, 0.08), cloth)
    oell(name, name + "_c2", grid(0.68, 0.66, 0.08), (0.2, 0.14, 0.07), cloth)
    p = grid(0.5, 0.38, 0)
    otube(name, name + "_p", p, p + Vector((0, 0, 0.55)), 0.04, 0.03, post)
    oell(name, name + "_g", p + Vector((0, -0.02, 0.66)), (0.12, 0.09, 0.1), glow, outline=False)
    add_target(name, 0.75, "rest shrine", group)

def flat_ell(name, color, sx, sy, group, note, z=0.03):
    oell(name, name + "_e", grid(0.5, 0.5, z), (sx, sy, 0.03), color, outline=False)
    add_target(name, 0.05, note, group)

def prop_stone(name, color, moss, group):
    oell(name, name + "_s", grid(0.5, 0.55, 0.08), (0.42, 0.28, 0.08), color)
    oell(name, name + "_m", grid(0.42, 0.5, 0.13), (0.16, 0.1, 0.03), moss, outline=False)
    add_target(name, 0.2, "flat stepping stone", group)

def prop_fern(name, leaf, group):
    base = grid(0.5, 0.6, 0)
    otube(name, name + "_t", base, base + Vector((0, 0, 0.16)), 0.03, 0.02, "#2f5a28", outline=False)
    for i, ang in enumerate((-0.7, 0.05, 0.7)):
        oell(name, name + f"l{i}", base + Vector((math.sin(ang) * 0.16, -0.02, 0.24)),
             (0.26, 0.09, 0.05), leaf, rot=(68, 0, math.degrees(ang)))
    add_target(name, 0.4, "fern", group)

def prop_jar(name, clay, group):
    p = grid(0.5, 0.55, 0)
    otube(name, name + "_j", p, p + Vector((0, 0, 0.45)), 0.18, 0.12, clay)
    otube(name, name + "_n", p + Vector((0, 0, 0.45)), p + Vector((0, 0, 0.58)), 0.08, 0.07, "#c4a06a")
    add_target(name, 0.7, "water jar", group)

def prop_blanket(name, cloth, group):
    gbox(name, name + "_b", 0.15, 0.25, 0.85, 0.8, 0.0, 0.08, cloth, bevel=0.02)
    add_target(name, 0.15, "blanket", group)

def prop_lantern(name, post, glow, group):
    p = grid(0.5, 0.55, 0)
    otube(name, name + "_p", p, p + Vector((0, 0, 0.5)), 0.035, 0.03, post)
    oell(name, name + "_g", p + Vector((0, -0.02, 0.6)), (0.12, 0.09, 0.1), glow, outline=False)
    add_target(name, 0.75, "lantern", group)

def prop_reed(name, green, group):
    for i, dx in enumerate((-0.12, 0.0, 0.12)):
        a = grid(0.5 + dx, 0.6, 0)
        otube(name, name + f"r{i}", a, a + Vector((0.02, -0.02, 0.55)), 0.03, 0.015, green)
    add_target(name, 0.65, "reeds", group)

def prop_boat(name, wood, group):
    oell(name, name + "_h", grid(0.5, 0.55, 0.1), (0.46, 0.22, 0.1), wood)
    add_target(name, 0.25, "rowboat", group)

def prop_oar(name, wood, group):
    a, b = grid(0.25, 0.7, 0.15), grid(0.75, 0.35, 0.35)
    otube(name, name + "_o", a, b, 0.035, 0.02, wood)
    add_target(name, 0.45, "oar", group)

def prop_bellows(name, leather, iron, group):
    q = grid(0.45, 0.55, 0)
    obox(name, name + "_g", q + Vector((0, 0, 0.22)), (0.55, 0.32, 0.28), leather, bevel=0.04)
    obox(name, name + "_n", q + Vector((0.32, 0, 0.2)), (0.18, 0.16, 0.12), iron, bevel=0.02)
    add_target(name, 0.45, "bellows", group)

def prop_anvil(name, iron, group):
    p = grid(0.42, 0.55, 0)
    obox(name, name + "_b", p + Vector((0, 0, 0.12)), (0.28, 0.22, 0.22), "#3a3e46", bevel=0.02)
    obox(name, name + "_t", p + Vector((0.04, -0.02, 0.28)), (0.5, 0.24, 0.12), iron, bevel=0.02)
    add_target(name, 0.45, "anvil", group)

def prop_barrel(name, wood, band, water, group):
    p = grid(0.5, 0.55, 0)
    otube(name, name + "_b", p, p + Vector((0, 0, 0.42)), 0.18, 0.16, wood)
    obox(name, name + "_n", p + Vector((0, 0, 0.22)), (0.4, 0.28, 0.05), band, outline=False)
    if water:
        oell(name, name + "_w", p + Vector((0, -0.02, 0.44)), (0.12, 0.08, 0.04), water, outline=False)
    add_target(name, 0.55, "barrel", group)

def prop_shelf(name, wood, books, group):
    sy = grid(0, 0.4, 0).y
    obox(name, name + "_s", Vector((0.5, sy, 0.4)), (0.8, 0.18, 0.7), wood, bevel=0.02)
    for i, col in enumerate(books):
        obox(name, name + f"k{i}", Vector((0.28 + i * 0.16, sy - 0.1, 0.55)), (0.12, 0.08, 0.22), col)
    add_target(name, 0.85, "bookshelf", group)

def prop_root(name, bark, group):
    a, b = grid(0.15, 0.7, 0.05), grid(0.85, 0.55, 0.06)
    otube(name, name + "_r", a, b, 0.06, 0.035, bark)
    add_target(name, 0.15, "short root along a wall edge", group)

def prop_lamp(name, post, glow, group):
    prop_lantern(name, post, glow, group)

def prop_cushion(name, cloth, group):
    oell(name, name + "_c", grid(0.5, 0.55, 0.08), (0.28, 0.2, 0.08), cloth)
    add_target(name, 0.2, "cushion", group)

def prop_rug(name, cloth, group):
    gbox(name, name + "_g", 0.08, 0.2, 0.92, 0.85, 0.0, 0.025, cloth, outline=False)
    add_target(name, 0.05, "rug", group)

def prop_drum(name, hide, band, group):
    p = grid(0.5, 0.55, 0)
    otube(name, name + "_d", p, p + Vector((0, 0, 0.28)), 0.22, 0.22, hide)
    obox(name, name + "_b", p + Vector((0, 0, 0.16)), (0.48, 0.32, 0.05), band, outline=False)
    add_target(name, 0.4, "storm drum", group)

def prop_bell(name, metal, group):
    p = grid(0.5, 0.45, 0.15)
    otube(name, name + "_b", p + Vector((0, 0, 0.35)), p, 0.06, 0.16, metal)
    add_target(name, 0.6, "bell", group)

def prop_mirror(name, frame, glass, group):
    obox(name, name + "_f", grid(0.5, 0.4, 0.45), (0.55, 0.08, 0.7), frame, bevel=0.02)
    obox(name, name + "_g", grid(0.5, 0.36, 0.45), (0.4, 0.04, 0.5), glass, outline=False)
    add_target(name, 0.85, "mirror frame", group)

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
    p = grid(0.55, 0.6, 0)
    otube(name, name + "_p", p, p + Vector((0.15, -0.05, 0.4)), 0.025, 0.02, "#6b4428")
    oell(name, name + "_u", p + Vector((0.12, -0.04, 0.28)), (0.28, 0.16, 0.08), cloth, rot=(70, 0, 40))
    add_target(name, 0.5, "tipped umbrella", group)

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

def build_theme(key, pal):
    g = key
    floor_tile(f"{g}-floor", pal["floor"], g, "even floor tile")
    if pal["floor2"] != pal["floor"]:
        floor_tile(f"{g}-floor-b", pal["floor2"], g, "a second floor tile, only a little lighter")
    wall_tile(f"{g}-wall", pal["wall"], pal["cap"], g)
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
flat_ell("green-stream", "#7eb4c8", 0.7, 0.36, "green", "narrow sparkling stream", z=0.02)

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
gbox("red-trough", "red-trough_b", 0.1, 0.3, 0.9, 0.75, 0.0, 0.16, "#4e555e", bevel=0.02)
gbox("red-trough", "red-trough_w", 0.18, 0.38, 0.82, 0.68, 0.12, 0.2, "#7eb4c8", outline=False)
add_target("red-trough", 0.3, "water trough", "red")
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
flat_ell("black-wisp", "#e2b15a", 0.16, 0.1, "black", "tiny warm light", z=0.2)
prop_blanket("black-sash", "#e6d7b0", "black")

scene["static_targets"] = json.dumps(TARGETS)
os.makedirs(os.path.dirname(os.path.abspath(A.out)), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("TARGETS", len(TARGETS))
print("SAVED", A.out)
