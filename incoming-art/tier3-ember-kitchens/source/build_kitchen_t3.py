"""
Dojo Ascent - Orange belt (Tier 3) Tower room kit: The Ember Kitchens (B-ART3 group C).

A copy of tower-rooms-t2/source/build_tower_t2.py: same helpers, camera, light, outline, tile sizes, door and
chest timelines and target format. Only the materials change, plus the kitchen pieces from
drafts/content/rooms/ember-kitchens-brief.md (props list). Plain light flagstone floor, deep brown brick walls,
warm orange / honey / copper, cool blue-grey shadow. No purple, no white stripes, no red rings in floor or props.

    blender -b -P tier3-ember-kitchens/source/build_kitchen_t3.py -- --out tier3-ember-kitchens/source/kitchen_t3.blend
    blender -b tier3-ember-kitchens/source/kitchen_t3.blend -P tools/render_static.py -- --out tier3-ember-kitchens/sprites
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box, OUTLINE_W
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); ap.add_argument("--theme", default="bamboo"); A = ap.parse_args(argv)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene; scene.name = "Tower"
K = 1 / math.sin(math.radians(35)); COS = math.cos(math.radians(35))
def grid(c, r, z=0.0): return Vector((c, -r * K, z))
_m = {}
def M(h, flat=False):
    if (h, flat) not in _m: _m[(h, flat)] = toon_material(("F" if flat else "M") + h, h, *((1.0, 1.0) if flat else ()))
    return _m[(h, flat)]
OUTLINE = outline_material()
COLL = {}
def layer(n):
    if n not in COLL:
        c = bpy.data.collections.new("L_" + n); scene.collection.children.link(c); COLL[n] = c
    return COLL[n]
def put(name, bm, color, lay, outline=True, flat=False, smooth=False, parent=None):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = smooth
    bm.to_mesh(me); bm.free(); me.materials.append(M(color, flat) if isinstance(color, str) else color)
    ob = bpy.data.objects.new(name, me); layer(lay).objects.link(ob)
    obs = [ob]
    if outline: obs.append(add_hull(ob, layer(lay), OUTLINE, OUTLINE_W))
    if parent is not None:
        bpy.context.view_layer.update()
        for o in obs: o.parent = parent; o.matrix_parent_inverse = parent.matrix_world.inverted()
    return ob
def gbox(lay, name, c0, r0, c1, r1, z0, z1, color, outline=True, bevel=0.0, flat=False, parent=None):
    a, b = grid(c0, r1, z0), grid(c1, r0, z1)
    return put(name, box((a + b) / 2, Vector((abs(b.x - a.x), abs(b.y - a.y), abs(b.z - a.z))), bevel=bevel), color, lay, outline, flat, parent=parent)
def obox(lay, name, c, size, color, rot=(0, 0, 0), outline=True, bevel=0.0, parent=None, flat=False):
    return put(name, box(c, size, rot=rot, bevel=bevel), color, lay, outline, flat=flat, parent=parent)
def otube(lay, name, p0, p1, r0, r1, color, segs=12, outline=True, sx=1, sy=1, parent=None, flat=False):
    return put(name, tube(p0, p1, r0, r1, segs=segs, sx=sx, sy=sy), color, lay, outline, flat=flat, smooth=True, parent=parent)
def oell(lay, name, c, s, color, rot=(0, 0, 0), outline=True, flat=False, segs=14, rings=8, parent=None):
    return put(name, ellipsoid(c, s, rot=rot, segs=segs, rings=rings), color, lay, outline, flat, smooth=True, parent=parent)
def empty(name, loc):
    e = bpy.data.objects.new(name, None); scene.collection.objects.link(e); e.location = loc; return e
TARGETS = []
def target(name, layers, rect, top, anchor="bottom-center", **kw):
    TARGETS.append(dict(name=name, layers=layers, rect=rect, top=top, anchor=anchor, **{k: v for k, v in kw.items() if v is not None}))
random.seed(3)


# ---------------------------------------------------------------- Ember Kitchens palette
STONE = ["#e6dcc6", "#ded3bb", "#eae1cd"]; GROUT = "#b3a68c"      # plain light flagstone
PATCH, PEB = "#f3ecdc", "#c9bb9e"                                   # flour dust, a pebble
WSTONE, WDARK, WCAP = "#7a4a34", "#5b3424", "#d9a35a"             # deep brown brick, dark mortar, honey wood cap
MORTAR, BRICK2 = "#9a6a4e", "#6e412d"
COPPER, COPPER_D, HONEY, AMBER = "#c9824a", "#9c5f36", "#f2c46a", "#f0a04b"
WOOD, WOOD_D, CREAM, SHADOW = "#c08a55", "#8a5a34", "#f3e6cc", "#5d6a7a"   # SHADOW = cool blue-grey
EMBER, EMBER_HI = "#f08a3c", "#ffd08a"
H_FACE = 1.3 / COS; H_BLOCK = 0.5
A.theme = "kitchen"

def floor_tile(lay, kind):
    gbox(lay, lay + "_grout", 0, 0, 1, 1, -0.04, -0.005, GROUT, outline=False)
    if kind == "big":
        gbox(lay, lay + "_slab", 0.025, 0.025, 0.975, 0.975, -0.005, 0.0, STONE[0], outline=False)
    elif kind == "quad":   # flagstones: one long and two short slabs, offset (not a checker)
        gbox(lay, lay + "_a", 0.02, 0.02, 0.98, 0.46, -0.005, 0.0, STONE[0], outline=False)
        gbox(lay, lay + "_b", 0.02, 0.5, 0.58, 0.98, -0.005, 0.0, STONE[1], outline=False)
        gbox(lay, lay + "_c", 0.62, 0.5, 0.98, 0.98, -0.005, 0.0, STONE[2], outline=False)
    else:                  # worn: a soft flour dusting and two pebbles
        gbox(lay, lay + "_slab", 0.025, 0.025, 0.975, 0.975, -0.005, 0.0, STONE[1], outline=False)
        put(lay + "_patch", ellipsoid(grid(0.42, 0.55, 0.0), (0.22, 0.14 * K, 0.002)), M(PATCH, True), lay, outline=False)
        for k, (c, r) in enumerate(((0.7, 0.3), (0.76, 0.36))):
            oell(lay, f"{lay}_peb{k}", grid(c, r, 0.004), (0.03, 0.025, 0.012), PEB, outline=False)
    target(lay, [lay], [0, 0, 1, 1], 0, anchor=[0, 0], group="tiles", note="floor tile, exactly 80 x 80 px; anchorPx = top-left corner of the cell")
for k in ("big", "quad", "worn"):
    floor_tile(f"floor-{k}", k)

def wall_dressing(lay, y, x0=0.0, x1=1.0):
    """Chunky brick courses: mortar lines and offset joints, a darker brick or two."""
    n = 6
    for i in range(1, n):
        z = i * H_FACE / n
        obox(lay, f"{lay}_m{i}_{x0}", Vector(((x0 + x1) / 2, y - 0.002, z)), (x1 - x0, 0.01, 0.02), M(MORTAR, True), outline=False)
    for i in range(n):
        z = (i + 0.5) * H_FACE / n
        for j, x in enumerate((0.25, 0.75) if i % 2 else (0.5,)):
            if x0 < x < x1:
                obox(lay, f"{lay}_j{i}{j}_{x0}", Vector((x, y - 0.002, z)), (0.02, 0.01, H_FACE / n), M(MORTAR, True), outline=False)
    if x1 - x0 > 0.5:
        obox(lay, f"{lay}_dk", Vector((0.37, y - 0.003, 2.5 * H_FACE / n)), (0.22, 0.01, H_FACE / n - 0.03), M(BRICK2, True), outline=False)

def wall_face(lay, dress=True):
    y = grid(0, 1).y
    obox(lay, lay + "_face", Vector((0.5, y + 0.1, H_FACE / 2)), (1.0, 0.2, H_FACE), WSTONE)
    if dress: wall_dressing(lay, y)
    obox(lay, lay + "_base", Vector((0.5, y - 0.01, 0.1)), (1.0, 0.04, 0.2), WDARK, outline=False)
    obox(lay, lay + "_cap", Vector((0.5, y + 0.05, H_FACE - 0.06)), (1.0, 0.3, 0.12), WCAP, outline=False)
    return y
def wall_target(lay, note, frames=None, **kw):
    target(lay, kw.pop("layers", [lay]), kw.pop("rect", [0, 0, 1, 1]), kw.pop("top", 0.3), anchor=[0, 0], group=kw.pop("group", "walls"), note=note,
           frames=frames, **kw)
wall_face("wall-face"); wall_target("wall-face", "the outer top wall (same rules as Tier 1)")
def wall_block(lay):
    gbox(lay, lay + "_block", 0, 0, 1, 1, 0, H_BLOCK, WSTONE)
    gbox(lay, lay + "_top", 0.06, 0.06, 0.94, 0.94, H_BLOCK, H_BLOCK + 0.01, "#a0684a", outline=False)
    y = grid(0, 1).y
    obox(lay, lay + "_line", Vector((0.5, y - 0.002, H_BLOCK * 0.5)), (1.0, 0.01, 0.02), M(MORTAR, True), outline=False)
    for x in (0.3, 0.7):
        obox(lay, f"{lay}_j{x}", Vector((x, y - 0.002, H_BLOCK * (0.25 if x < 0.5 else 0.75))), (0.02, 0.01, H_BLOCK / 2), M(MORTAR, True), outline=False)
    target(lay, [lay], [0, 0, 1, 1], H_BLOCK * COS + 0.02, anchor=[0, 0], group="walls", note="any other '#' cell (same rules as Tier 1)")
wall_block("wall-block")
def pillar(lay):   # a round brick chimney column with copper bands and a honey wood cap
    c = grid(0.5, 0.55)
    obox(lay, lay + "_base", c + Vector((0, 0, 0.08)), (0.72, 0.72, 0.16), WDARK, bevel=0.03)
    otube(lay, lay + "_shaft", c + Vector((0, 0, 0.16)), c + Vector((0, 0, 1.55)), 0.27, 0.25, WSTONE, segs=16)
    for z in (0.45, 0.8, 1.15):
        otube(lay, f"{lay}_mort{z}", c + Vector((0, 0, z)), c + Vector((0, 0, z + 0.02)), 0.272, 0.272, M(MORTAR, True), segs=16, outline=False)
    for z in (0.6, 1.3):
        otube(lay, f"{lay}_ring{z}", c + Vector((0, 0, z)), c + Vector((0, 0, z + 0.05)), 0.28, 0.28, COPPER, segs=16, outline=False)
    obox(lay, lay + "_cap", c + Vector((0, 0, 1.62)), (0.7, 0.7, 0.14), WCAP, bevel=0.03)
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], 1.75, anchor=[0.5, 1], group="walls", note="pillar (same rules as Tier 1)")
pillar("pillar")
# ------------------------------------------------------------------ the battle door, from the Tier 1 kit, in the theme's wall
DOORS = {
    "battle":    dict(trim="#c8553d", icon="fists",  label="Battle"),
    "challenge": dict(trim="#7b5cc4", icon="star",   label="Challenge"),
    "treasure":  dict(trim="#d9a441", icon="chest",  label="Treasure"),
    "rest":      dict(trim="#3f9a7a", icon="leaf",   label="Rest"),
}
def icon(lay, kind, c, s, parent=None):
    """Kid-readable icons on a round plaque: fists bump, a star, a little chest, a leaf."""
    y = c.y - 0.05
    if kind == "fists":   # two red sparring gloves, crossed, with white cuffs
        for sx in (-1, 1):
            p = Vector((c.x + sx * 0.07 * s, y - (0.01 if sx > 0 else 0), c.z + 0.03 * s))
            oell(lay, f"{lay}_glove{sx}", p, (0.085 * s, 0.05, 0.1 * s), "#d8352a", rot=(0, sx * 32, 0), parent=parent)
            oell(lay, f"{lay}_thumb{sx}", p + Vector((-sx * 0.06 * s, -0.03, -0.01 * s)), (0.03 * s, 0.03, 0.05 * s), "#e5503f", rot=(0, sx * 32, 0), parent=parent)
            q = p + Vector((sx * 0.07 * s, 0, -0.1 * s))
            obox(lay, f"{lay}_cuff{sx}", q, (0.1 * s, 0.05, 0.05 * s), "#f6efdc", rot=(0, sx * 32, 0), parent=parent)
        for k in (-1, 1):
            obox(lay, f"{lay}_spark{k}", Vector((c.x, y - 0.04, c.z + k * 0.14 * s)), (0.03 * s, 0.01, 0.06 * s), M("#ffe48a", True), outline=False, parent=parent)
    elif kind == "star":
        bm = bmesh.new()
        pts = [Vector((math.cos(a) * (0.2 if i % 2 == 0 else 0.085) * s, 0, math.sin(a) * (0.2 if i % 2 == 0 else 0.085) * s))
               for i, a in enumerate([math.pi / 2 + i * math.pi / 5 for i in range(10)])]
        vs = [bm.verts.new(Vector((c.x, y, c.z)) + p) for p in pts]; bm.faces.new(vs)
        bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.03)
        put(f"{lay}_star", bm, "#ffd36b", lay, parent=parent)
    elif kind == "chest":
        obox(lay, f"{lay}_cb", Vector((c.x, y, c.z - 0.04 * s)), (0.3 * s, 0.05, 0.16 * s), "#a46e40", parent=parent)
        oell(lay, f"{lay}_cl", Vector((c.x, y, c.z + 0.05 * s)), (0.155 * s, 0.05, 0.08 * s), "#b57a45", parent=parent)
        obox(lay, f"{lay}_cs", Vector((c.x, y - 0.04, c.z)), (0.05 * s, 0.01, 0.07 * s), M("#ffd36b", True), outline=False, parent=parent)
    else:   # leaf
        oell(lay, f"{lay}_leaf", Vector((c.x, y, c.z + 0.02 * s)), (0.075 * s, 0.03, 0.17 * s), "#6cc46f", rot=(0, 35, 0), parent=parent)
        obox(lay, f"{lay}_vein", Vector((c.x, y - 0.031, c.z + 0.02 * s)), (0.006 * s, 0.004, 0.24 * s), M("#3f8f4f", True), rot=(0, 35, 0), outline=False, parent=parent)
        obox(lay, f"{lay}_stem", Vector((c.x - 0.1 * s, y - 0.01, c.z - 0.14 * s)), (0.015 * s, 0.01, 0.08 * s), "#3f8f4f", rot=(0, 35, 0), parent=parent)
def medallion(lay, pc, d):
    """A full round medallion turned to face the camera (so it reads as a true circle, not an ellipse), with
    a cream face, the room colour as a ring, and the icon centred on it. Sits in front of the wall cap."""
    piv = empty(lay + "_medal", pc)
    otube(lay, lay + "_plaque", pc + Vector((0, 0.03, 0)), pc + Vector((0, -0.02, 0)), 0.22, 0.22, "#f6efdc", segs=32, parent=piv)
    otube(lay, lay + "_plaquerim", pc + Vector((0, -0.021, 0)), pc + Vector((0, -0.026, 0)), 0.205, 0.205, M(d["trim"], True), segs=32, outline=False, parent=piv)
    otube(lay, lay + "_plaquein", pc + Vector((0, -0.027, 0)), pc + Vector((0, -0.03, 0)), 0.175, 0.175, M("#f6efdc", True), segs=32, outline=False, parent=piv)
    icon(lay, d["icon"], pc + Vector((0, -0.02, 0)), 1.0, parent=piv)
    piv.rotation_euler = (math.radians(-35), 0, 0)    # face the 35-degree camera
    return piv

def door(kind):
    d = DOORS[kind]; lay = f"door-{kind}"; y = grid(0, 1).y
    # stone frame and wooden posts in the top wall cell, the room kind's colour on the trim
    obox(lay, lay + "_wall", Vector((0.5, y + 0.1, H_FACE / 2)), (1.0, 0.2, H_FACE), WSTONE)
    obox(lay, lay + "_cap", Vector((0.5, y + 0.05, H_FACE - 0.06)), (1.0, 0.3, 0.12), WCAP, outline=False)
    if A.theme == "bamboo": wall_dressing(lay, y)
    else: wall_dressing(lay, y, 0.0, 0.09); wall_dressing(lay, y, 0.91, 1.0)
    obox(lay, lay + "_opening", Vector((0.5, y - 0.004, 0.52)), (0.66, 0.01, 1.04), M("#2a2540", True), outline=False)
    for x in (0.13, 0.87):
        obox(lay, f"{lay}_post{x}", Vector((x, y - 0.03, 0.58)), (0.1, 0.08, 1.16), d["trim"])
    obox(lay, lay + "_lintel", Vector((0.5, y - 0.035, 1.16)), (0.9, 0.09, 0.1), d["trim"])
    # sliding doors: two wooden panels; they slide apart in frame 2 (open) and the doorway glows
    hinge = [empty(f"{lay}_slideL", Vector((0, 0, 0))), empty(f"{lay}_slideR", Vector((0, 0, 0)))]
    for k, x in enumerate((0.34, 0.66)):
        obox(lay, f"{lay}_panel{k}", Vector((x, y - 0.02, 0.52)), (0.32, 0.03, 1.02), "#c9a06a", parent=hinge[k])
        obox(lay, f"{lay}_paper{k}", Vector((x, y - 0.037, 0.58)), (0.24, 0.005, 0.72), M("#f6efdc", True), outline=False, parent=hinge[k])
        obox(lay, f"{lay}_bar{k}", Vector((x, y - 0.04, 0.58)), (0.24, 0.006, 0.02), M("#a07a4a", True), outline=False, parent=hinge[k])
    glow = empty(f"{lay}_glowpivot", Vector((0.5, y, 0.52)))
    obox(lay, lay + "_glow", Vector((0.5, y - 0.006, 0.52)), (0.64, 0.01, 1.02), M("#fff3c4", True), outline=False, parent=glow)
    # round medallion with the icon above the door (Jay's review: full circle, icon centred, fully visible)
    medallion(lay, Vector((0.5, y - 0.2, 1.42)), d)
    # frames: 1 = closed, 2 = open (panels slide into the wall, the doorway glows warm)
    for o in hinge + [glow]:
        o.keyframe_insert("location", frame=1); o.keyframe_insert("scale", frame=1)
    hinge[0].location = (-0.24, 0, 0); hinge[1].location = (0.24, 0, 0)
    for o in hinge: o.keyframe_insert("location", frame=2)
    glow.scale = (1, 1, 1); glow.keyframe_insert("scale", frame=2)
    glow.scale = (0.0001, 1, 0.0001); glow.keyframe_insert("scale", frame=1)
    for o in hinge + [glow]:
        for fc in o.animation_data.action.fcurves:
            for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"
    target(lay, [lay], [-0.1, 0, 1.1, 1], 0.95, anchor=[0.5, 1], frames=[1, 2], fps=1, group="doors",
           note=f"{d['label']} door for a 'D' slot in the top wall: frame 0 closed, frame 1 open (doors slide apart, the doorway glows). anchorPx = bottom-centre of the door cell. The icon plaque rises above the wall")
    # the icon on its own too (for door labels, the map, buttons)
    ic = f"icon-{kind}"
    pc2 = Vector((5.5 + list(DOORS).index(kind) * 1.0, -2.0, 0.6))
    medallion(ic, pc2, d)
    target(ic, [ic], [pc2.x - 0.3, -pc2.y / K - 0.1, pc2.x + 0.3, -pc2.y / K + 0.1], 0.6, anchor="bottom-center", group="doors",
           note="the door's icon on its round medallion, on its own (for labels, the floor map or buttons)")
for k in DOORS:
    door(k)

# ------------------------------------------------------------------ chest: closed idle, opening, open idle
# Jay's review: make opening it special. One timeline at 12 fps, three targets (three sheets):
#   chest-closed : frames 1-12  (1.0 s loop)  closed, a glint slides down a gold band
#   chest-open   : frames 13-42 (2.5 s, once) anticipation (wiggle, light building in the seams), the lid bursts
#                  open with a golden light beam, stars and sparkles rise, the glow pulses and settles
#   chest-opened : frames 43-54 (1.0 s loop)  open, a soft shimmering glow and a few twinkles
# Layers: chest (wood and gold), chest-glow (seam light, the light inside, the glints), chest-fx (beam, stars,
# sparkles), so the game can add sound or particles on the key frames listed in the json.
def glow_mat(name, hex_color, alpha):
    """See-through light (for the beam): emission mixed with transparency."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = srgb(hex_color)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs["Fac"].default_value = alpha
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs["Surface"])
    m.blend_method = "BLEND"; return m

def star_bm(r, inner=0.42):
    bm = bmesh.new()
    pts = [Vector((math.cos(a) * (r if i % 2 == 0 else r * inner), 0, math.sin(a) * (r if i % 2 == 0 else r * inner)))
           for i, a in enumerate([math.pi / 2 + i * math.pi / 5 for i in range(10)])]
    vs = [bm.verts.new(p) for p in pts]; bm.faces.new(vs)
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.01)
    return bm

def kf(o, f, loc=None, rot=None, sc=None):
    if loc is not None: o.location = loc; o.keyframe_insert("location", frame=f)
    if rot is not None: o.rotation_euler = [math.radians(v) for v in rot]; o.keyframe_insert("rotation_euler", frame=f)
    if sc is not None:
        o.scale = sc if isinstance(sc, (tuple, list)) else (max(sc, 1e-4),) * 3; o.keyframe_insert("scale", frame=f)

def chest():
    L, G, X = "chest", "chest-glow", "chest-fx"; c = grid(0.5, 0.6)
    root = empty("chest_root", c)
    def par(o, p):
        bpy.context.view_layer.update(); o.parent = p; o.matrix_parent_inverse = p.matrix_world.inverted()
    obox(L, "chest_body", c + Vector((0, 0, 0.18)), (0.6, 0.4, 0.34), "#c98f58", bevel=0.02, parent=root)
    for x in (-0.22, 0.22):
        obox(L, f"chest_band{x}", c + Vector((x, 0, 0.18)), (0.05, 0.415, 0.345), COPPER, outline=False, parent=root)
    obox(L, "chest_lock", c + Vector((0, -0.21, 0.33)), (0.1, 0.03, 0.12), HONEY, parent=root)
    hinge = empty("chest_hinge", c + Vector((0, 0.2, 0.35))); par(hinge, root)
    put("chest_lid", tube(c + Vector((-0.3, 0, 0.35)), c + Vector((0.3, 0, 0.35)), 0.2, 0.2, segs=16), "#d9a066", L, smooth=True, parent=hinge)
    for x in (-0.22, 0.22):
        put(f"chest_lidband{x}", tube(c + Vector((x - 0.025, 0, 0.35)), c + Vector((x + 0.025, 0, 0.35)), 0.205, 0.205, segs=16),
            COPPER, L, outline=False, smooth=True, parent=hinge)
    # glow layer: a thin line of light in the seam, the light inside, a glint on the bands
    seam = empty("chest_seam", c + Vector((0, -0.1, 0.35))); par(seam, root)
    obox(G, "chest_seamlight", c + Vector((0, -0.205, 0.352)), (0.6, 0.012, 0.022), M("#fff3c4", True), outline=False, parent=seam)
    inside = empty("chest_inside", c + Vector((0, 0, 0.36))); par(inside, root)
    oell(G, "chest_light", c + Vector((0, 0, 0.36)), (0.27, 0.17, 0.1), M("#fff6c8", True), outline=False, parent=inside)
    oell(G, "chest_aura", c + Vector((0, 0, 0.38)), (0.4, 0.27, 0.05), M("#ffe48a", True), outline=False, parent=inside)
    glint = empty("chest_glint", c + Vector((-0.22, -0.22, 0.2))); par(glint, root)
    put("chest_glintstar", star_bm(0.06, 0.3), M("#fffbe8", True), G, outline=False, parent=glint)
    # fx layer: the light beam, 5 stars and 6 sparkles
    beam = empty("chest_beam", c + Vector((0, 0, 0.36)))
    otube(X, "chest_beamcore", c + Vector((0, 0, 0.36)), c + Vector((0, 0, 1.9)), 0.1, 0.035, glow_mat("BEAMCORE", "#fffdf0", 0.85), segs=16, outline=False, parent=beam)
    otube(X, "chest_beamedge", c + Vector((0, 0.02, 0.36)), c + Vector((0, 0.02, 1.9)), 0.22, 0.07, glow_mat("BEAMEDGE", "#ffeaa0", 0.5), segs=16, outline=False, parent=beam)
    stars, sparks = [], []
    for k in range(5):
        e = empty(f"chest_starpiv{k}", c + Vector((0, -0.05, 0.4)))
        put(f"chest_star{k}", star_bm(0.12 if k % 2 else 0.095), "#ffd36b", X, parent=e)
        stars.append(e)
    for k in range(6):
        e = empty(f"chest_sparkpiv{k}", c + Vector((0, -0.05, 0.4)))
        put(f"chest_spark{k}", star_bm(0.055, 0.28), M("#fffbe8", True), X, outline=False, parent=e)
        sparks.append(e)
    # the star and glint meshes are built at the origin: let them follow their empty exactly
    for e in stars + sparks + [glint]:
        for ch in e.children: ch.matrix_parent_inverse = Matrix.Identity(4)
    CL = (-35, 0, 0)   # stars face the camera
    def lid(f, ang): kf(hinge, f, rot=(-ang, 0, 0))
    # --- closed idle 1-12: still, a glint slides down a band on frames 3-8
    for f in range(1, 13):
        kf(root, f, loc=c, rot=(0, 0, 0), sc=(1, 1, 1)); lid(f, 0)
        kf(seam, f, sc=0); kf(inside, f, sc=0); kf(beam, f, sc=0)
        t = (f - 3) / 5          # glint slides down the left gold band on frames 3-8 (world position: the parent inverse cancels the root)
        on = 0 <= t <= 1
        kf(glint, f, loc=c + Vector((-0.22, -0.23, 0.33 - 0.26 * (t if on else 0))), rot=CL, sc=(math.sin(math.pi * t) * 1.3 if on else 0))
        for e in stars + sparks: kf(e, f, sc=0)
    # --- opening 13-42
    F0 = 13
    for i in range(30):
        f = F0 + i
        wig = 0.0; hop = 0.0; ang = 0.0; sq = (1, 1, 1)
        if i < 12:                       # anticipation: wiggles growing, lid rattles, light leaks from the seam
            g = (i + 1) / 12
            wig = 5 * g * math.sin(i * 2.2); hop = 0.025 * g * abs(math.sin(i * 1.7)); ang = 3 * g * abs(math.sin(i * 2.9))
            kf(seam, f, sc=(1, 1, 0.3 + 1.7 * g)); kf(inside, f, sc=0); kf(beam, f, sc=0)
        else:
            j = i - 12                   # 0..17
            ang = [60, 112, 118, 108, 104, 106][j] if j < 6 else 105
            sq = [(1.08, 1.08, 0.88), (0.95, 0.95, 1.08), (1.02, 1.02, 0.98)][j] if j < 3 else (1, 1, 1)
            kf(seam, f, sc=0)
            pulse = 1 + 0.35 * math.exp(-((j - 4) / 3.0) ** 2)
            kf(inside, f, sc=min(1, (j + 1) / 2) * pulse)
            bw = [0.5, 1.0, 1.15, 1.1, 1.0, 0.9, 0.8, 0.68, 0.56, 0.45, 0.34, 0.24, 0.15, 0.08, 0.0, 0, 0, 0][j]
            bh = [0.45, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.98, 0.95, 0.9, 0.85, 0.8, 0.8, 0.8, 0.8][j]
            kf(beam, f, sc=(max(bw, 1e-4), max(bw, 1e-4), max(bh, 1e-4)))
        kf(root, f, loc=c + Vector((0, 0, hop)), rot=(0, wig, 0), sc=sq); lid(f, ang)
        kf(glint, f, sc=0, rot=CL)
        for k, e in enumerate(stars):       # stars burst up and out, spin, twinkle away
            j = i - 13 - k * 0.6
            if j < 0 or j > 14: kf(e, f, sc=0, rot=CL); continue
            u = j / 14; a = (k - 2) * 0.17
            kf(e, f, loc=c + Vector((a * (0.4 + 1.2 * u), -0.15, 0.55 + 1.5 * u - 0.4 * u * u)), rot=(-35, 0, 140 * u * (1 if k % 2 else -1)),
               sc=(1.0 - u ** 3) * min(1, j / 1.5))
        for k, e in enumerate(sparks):
            j = i - 14 - k
            if j < 0 or j > 10: kf(e, f, sc=0, rot=CL); continue
            u = j / 10; a = ((k * 37) % 11 - 5) / 5
            kf(e, f, loc=c + Vector((a * 0.35, -0.2, 0.5 + 1.0 * u)), rot=CL, sc=math.sin(math.pi * u) * (1.2 if k % 2 else 0.9))
    # --- open idle 43-54: soft glow breathing, two twinkles
    for i in range(12):
        f = 43 + i; ph = 2 * math.pi * i / 12
        kf(root, f, loc=c, rot=(0, 0, 0), sc=(1, 1, 1)); lid(f, 105); kf(seam, f, sc=0); kf(beam, f, sc=0)
        kf(inside, f, sc=1.0 + 0.08 * math.sin(ph)); kf(glint, f, sc=0, rot=CL)
        for e in stars: kf(e, f, sc=0)
        for k, e in enumerate(sparks):
            if k < 3:
                u = ((i + 4 * k) % 12) / 12
                kf(e, f, loc=c + Vector(((k - 1) * 0.18, -0.15, 0.5 + 0.35 * u)), rot=CL, sc=math.sin(math.pi * u) * 0.9)
            else: kf(e, f, sc=0)
    for o in bpy.data.objects:
        if o.animation_data and o.animation_data.action and o.name.startswith("chest_"):
            for fc in o.animation_data.action.fcurves:
                for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
    common = dict(group="chest", anchor=[0.5, 1])
    lays = [L, G, X]
    target("chest-closed", lays, [-0.3, 0, 1.3, 1.2], 0.8, frames=[1, 12], fps=12, loop=True,
           note="closed chest idle loop (1 s at 12 fps): a glint slides down the gold bands. Layers bottom to top: chest, chest-glow, chest-fx", **common)
    target("chest-open", lays, [-0.3, 0, 1.3, 1.2], 2.3, frames=[13, 42], fps=12,
           keyFrames={"anticipation": "0-11", "lidBurst": 12, "beamPeak": 14, "starsRise": "13-29", "glowPulse": 16, "settled": 29},
           note="opening, once (2.5 s at 12 fps), then play chest-opened. 0-11 wiggle and light in the seams (a rising sound), 12 the lid bursts open (pop / chime), 12-25 the light beam fades, 13-29 stars and sparkles rise", **common)
    target("chest-opened", lays, [-0.3, 0, 1.3, 1.2], 2.3, frames=[43, 54], fps=12, loop=True,
           note="open chest idle loop (1 s at 12 fps): soft shimmering light and twinkles. Same size and anchor as chest-open, so it follows seamlessly", **common)
chest()

def const(objs):
    for o in objs:
        if o.animation_data and o.animation_data.action:
            for fc in o.animation_data.action.fcurves:
                for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"
def onoff(piv, fon=2, foff=1):
    kf(piv, foff, sc=0); kf(piv, fon, sc=(1, 1, 1)); const([piv])

# ------------------------------------------------------------------ rest: the Warm Hearth (a small fire that never went out, a kettle, two cushions)
def shrine():
    lay, gl = "shrine", "shrine-glow"; c = grid(0.5, 0.55)
    otube(lay, "sh_ring", c, c + Vector((0, 0, 0.14)), 0.3, 0.28, WSTONE, segs=16)
    for k in range(8):
        a = k * math.pi / 4
        obox(lay, f"sh_mort{k}", c + Vector((math.cos(a) * 0.29, math.sin(a) * 0.29, 0.07)), (0.02, 0.02, 0.14), M(MORTAR, True), rot=(0, 0, math.degrees(a)), outline=False)
    otube(lay, "sh_ash", c + Vector((0, 0, 0.13)), c + Vector((0, 0, 0.135)), 0.24, 0.24, M(SHADOW, True), segs=16, outline=False)
    for k, r in enumerate((30, -30)):
        obox(lay, f"sh_log{k}", c + Vector((0, 0, 0.17)), (0.36, 0.07, 0.07), WOOD_D, rot=(0, 0, r), bevel=0.02)
    for x in (-0.2, 0.2):   # a small iron stand holding the kettle
        otube(lay, f"sh_leg{x}", c + Vector((x, 0, 0.14)), c + Vector((x * 0.8, 0, 0.42)), 0.015, 0.015, "#4a4650", segs=6)
    kc = c + Vector((0, 0, 0.5))
    oell(lay, "sh_kettle", kc, (0.13, 0.12, 0.1), COPPER)
    otube(lay, "sh_lid", kc + Vector((0, 0, 0.08)), kc + Vector((0, 0, 0.11)), 0.06, 0.04, COPPER_D, segs=12)
    oell(lay, "sh_knob", kc + Vector((0, 0, 0.13)), (0.025, 0.025, 0.02), HONEY)
    otube(lay, "sh_spout", kc + Vector((0.1, -0.02, 0.0)), kc + Vector((0.2, -0.04, 0.07)), 0.03, 0.015, COPPER, segs=8)
    for sx, col in ((-1, HONEY), (1, AMBER)):   # two cushions either side, low and round
        oell(lay, f"sh_cush{sx}", c + Vector((sx * 0.48, -0.08, 0.06)), (0.14, 0.12, 0.06), col)
        oell(lay, f"sh_btn{sx}", c + Vector((sx * 0.48, -0.08, 0.12)), (0.02, 0.02, 0.01), WOOD_D, outline=False)
    # glow layer: embers and a little flame on the logs, a warm halo on the floor; a gentle flicker (8 frames)
    piv = empty("sh_glowpiv", c + Vector((0, 0, 0.18)))
    oell(gl, "sh_flame", c + Vector((0, 0, 0.26)), (0.08, 0.06, 0.1), M(EMBER, True), outline=False, parent=piv)
    oell(gl, "sh_flamein", c + Vector((0, -0.03, 0.24)), (0.045, 0.03, 0.06), M(EMBER_HI, True), outline=False, parent=piv)
    ring = empty("sh_ringpiv", c + Vector((0, 0, 0.005)))
    put("sh_halo", ellipsoid(c + Vector((0, 0, 0.004)), (0.5, 0.38, 0.003), segs=24, rings=4), M("#ffd59a", True), gl, outline=False, parent=ring)
    for f in range(1, 9):
        b = 0.5 - 0.5 * math.cos(2 * math.pi * (f - 1) / 8); w = 0.5 + 0.5 * math.sin(4 * math.pi * (f - 1) / 8)
        piv.scale = (1 + 0.08 * w, 1, 1 + 0.25 * b); piv.keyframe_insert("scale", frame=f)
        ring.scale = (0.9 + 0.12 * b, 0.9 + 0.12 * b, 1); ring.keyframe_insert("scale", frame=f)
    target("shrine", [lay, gl], [-0.15, 0, 1.15, 1.1], 0.8, anchor=[0.5, 1], frames=[1, 8], fps=8, loop=True, group="shrine",
           note="the Warm Hearth rest spot for an 'S' tile: a small brick fire ring with a kettle and two cushions (shrine layer, still) + shrine-glow (8-frame flicker loop at 8 fps)")
shrine()

# ------------------------------------------------------------------ top-wall pieces (drawn in a top-wall cell instead of wall-face)
def oven_mouth(lay, gl, cx, w, h, y, z0=0.12):
    obox(lay, lay + "_hearth", Vector((cx, y - 0.05, z0 - 0.03)), (w + 0.16, 0.12, 0.06), WCAP)
    obox(lay, lay + "_arch", Vector((cx, y - 0.03, z0 + h / 2)), (w + 0.12, 0.05, h), BRICK2)
    oell(lay, lay + "_archtop", Vector((cx, y - 0.03, z0 + h)), ((w + 0.12) / 2, 0.025, h * 0.28), BRICK2)
    obox(lay, lay + "_hole", Vector((cx, y - 0.06, z0 + h * 0.42)), (w, 0.01, h * 0.84), M("#3a3a46", True), outline=False)
    oell(lay, lay + "_holetop", Vector((cx, y - 0.06, z0 + h * 0.84)), (w / 2, 0.005, h * 0.2), M("#3a3a46", True), outline=False)
    piv = empty(lay + "_glowpiv", Vector((cx, y - 0.07, z0)))
    obox(gl, lay + "_fire", Vector((cx, y - 0.07, z0 + h * 0.35)), (w * 0.94, 0.01, h * 0.7), M("#ffb35c", True), outline=False, parent=piv)
    oell(gl, lay + "_firetop", Vector((cx, y - 0.071, z0 + h * 0.7)), (w * 0.47, 0.005, h * 0.22), M("#ffb35c", True), outline=False, parent=piv)
    for k in range(3):
        oell(gl, f"{lay}_ember{k}", Vector((cx + (k - 1) * w * 0.28, y - 0.08, z0 + 0.06)), (w * 0.12, 0.01, 0.05), M(EMBER_HI, True), outline=False, parent=piv)
    return piv
def wall_oven():
    lay, gl = "wall-oven", "wall-oven-glow"; y = wall_face(lay, dress=False)
    wall_dressing(lay, y, 0.0, 0.1); wall_dressing(lay, y, 0.9, 1.0)
    piv = oven_mouth(lay, gl, 0.5, 0.56, 0.62, y)
    obox(lay, lay + "_door", Vector((0.5, y - 0.09, 0.82)), (0.3, 0.02, 0.05), COPPER)
    onoff(piv)
    wall_target(lay, "a cold brick oven set into the top wall: frame 0 cold (dark), frame 1 lit (embers glow). Layers: wall-oven, wall-oven-glow (the game can fade the glow in)",
                frames=[1, 2], fps=1, layers=[lay, gl])
wall_oven()
def giant_oven():
    lay, gl = "wall-giant-oven", "wall-giant-oven-glow"; y = grid(0, 1).y
    obox(lay, lay + "_face", Vector((1.5, y + 0.1, H_FACE / 2)), (3.0, 0.2, H_FACE), WSTONE)
    wall_dressing(lay, y, 0.0, 0.3); wall_dressing(lay, y, 2.7, 3.0)
    obox(lay, lay + "_base", Vector((1.5, y - 0.01, 0.1)), (3.0, 0.04, 0.2), WDARK, outline=False)
    obox(lay, lay + "_cap", Vector((1.5, y + 0.05, H_FACE - 0.06)), (3.0, 0.3, 0.12), WCAP, outline=False)
    obox(lay, lay + "_dome", Vector((1.5, y - 0.12, 0.6)), (2.4, 0.3, 1.2), WSTONE, bevel=0.06)
    oell(lay, lay + "_domeTop", Vector((1.5, y - 0.12, 1.2)), (1.2, 0.15, 0.32), WSTONE)
    for z in (0.35, 0.7):
        obox(lay, f"{lay}_m{z}", Vector((1.5, y - 0.275, z)), (2.4, 0.01, 0.02), M(MORTAR, True), outline=False)
    piv = oven_mouth(lay, gl, 1.5, 1.2, 0.85, y - 0.24, z0=0.14)
    obox(lay, lay + "_rail", Vector((1.5, y - 0.33, 1.08)), (1.5, 0.03, 0.06), COPPER)
    onoff(piv)
    target(lay, [lay, gl], [0, 0, 3, 1], 0.75, anchor=[0, 0], frames=[1, 2], fps=1, group="walls",
           note="the giant oven for the middle of the Great Hearth's top wall: 3 top-wall cells wide; anchorPx = top-left of the leftmost cell. Frame 0 cold, frame 1 lit warm gold (when the Hearth Cook is freed)")
giant_oven()
def soup_pot():
    lay, st = "soup-pot", "soup-pot-steam"; c = grid(1.0, 0.75)
    otube(lay, lay + "_body", c, c + Vector((0, 0, 0.62)), 0.58, 0.66, "#3f3c46", segs=24)
    otube(lay, lay + "_band", c + Vector((0, 0, 0.5)), c + Vector((0, 0, 0.56)), 0.665, 0.665, COPPER, segs=24, outline=False)
    otube(lay, lay + "_rim", c + Vector((0, 0, 0.62)), c + Vector((0, 0, 0.68)), 0.68, 0.68, "#55515e", segs=24)
    otube(lay, lay + "_soup", c + Vector((0, 0, 0.66)), c + Vector((0, 0, 0.665)), 0.62, 0.62, M("#e3a14f", True), segs=24, outline=False)
    for sx in (-1, 1):
        otube(lay, f"{lay}_ear{sx}", c + Vector((sx * 0.64, 0, 0.5)), c + Vector((sx * 0.76, 0, 0.5)), 0.05, 0.05, "#55515e", segs=8)
    for k in range(3):
        obox(lay, f"{lay}_brick{k}", c + Vector(((k - 1) * 0.5, -0.5, 0.06)), (0.42, 0.18, 0.12), WSTONE, bevel=0.02)
    piv = empty(lay + "_steampiv", c + Vector((0, 0, 0.7)))
    puffs = []
    for k in range(4):
        e = empty(f"{lay}_puff{k}", c + Vector(((k - 1.5) * 0.25, 0, 0.75)))
        oell(st, f"{lay}_puffm{k}", c + Vector(((k - 1.5) * 0.25, 0, 0.75)), (0.12, 0.08, 0.1), M("#f2ece4", True), outline=False, parent=e); puffs.append(e)
    bub = []
    for k in range(3):
        e = empty(f"{lay}_bub{k}", c + Vector(((k - 1) * 0.3, 0.05 * k, 0.67)))
        oell(st, f"{lay}_bubm{k}", c + Vector(((k - 1) * 0.3, 0.05 * k, 0.67)), (0.06, 0.06, 0.04), M("#f6c27a", True), outline=False, parent=e); bub.append(e)
    for f in range(1, 9):
        for k, e in enumerate(puffs):
            u = ((f - 1 + 2 * k) % 8) / 8
            kf(e, f, loc=Vector((0.05 * math.sin(6 * u + k), 0, 0.8 * u)), sc=math.sin(math.pi * u) + 1e-4)
        for k, e in enumerate(bub):
            u = ((f - 1 + 3 * k) % 8) / 8
            kf(e, f, sc=math.sin(math.pi * u) + 1e-4)
    target(lay, [lay], [-0.1, -0.3, 2.1, 1.3], 0.9, anchor=[0.5, 1], group="decor",
           note="the huge soup pot beside the giant oven (stands on the top wall row, 2 cells wide; anchorPx = bottom-centre of the 2 cells). Still, cold")
    target(st, [st], [-0.1, -0.3, 2.1, 1.3], 1.8, anchor=[0.5, 1], frames=[1, 8], fps=8, loop=True, group="decor",
           note="soup-pot overlay for phase 2 and when freed: bubbles and steam (8-frame loop at 8 fps); same size and anchor as soup-pot")
soup_pot()
def wall_shelf():
    lay = "wall-shelf"; y = wall_face(lay)
    for z in (0.45, 0.95):
        obox(lay, f"{lay}_plank{z}", Vector((0.5, y - 0.08, z)), (0.9, 0.16, 0.04), WOOD)
        for k, (col, lid, h) in enumerate(((HONEY, COPPER, 0.22), ("#e8c890", WOOD_D, 0.17), ("#f0b468", COPPER, 0.2), ("#d9c7a0", WOOD_D, 0.15))):
            x = 0.16 + k * 0.22; b = Vector((x, y - 0.09, z + 0.02))
            otube(lay, f"{lay}_jar{z}{k}", b, b + Vector((0, 0, h)), 0.07, 0.07, col, segs=12)
            otube(lay, f"{lay}_lid{z}{k}", b + Vector((0, 0, h)), b + Vector((0, 0, h + 0.03)), 0.075, 0.075, lid, segs=12, outline=False)
    wall_target(lay, "top-wall cell with a shelf of jars (use instead of wall-face)")
wall_shelf()
def wall_pots():
    lay = "wall-pots"; y = wall_face(lay)
    otube(lay, lay + "_rail", Vector((0.04, y - 0.05, 1.12)), Vector((0.96, y - 0.05, 1.12)), 0.02, 0.02, COPPER_D, segs=8)
    for k, (x, r, z) in enumerate(((0.2, 0.12, 0.8), (0.5, 0.15, 0.74), (0.8, 0.11, 0.84))):
        otube(lay, f"{lay}_hook{k}", Vector((x, y - 0.06, 1.12)), Vector((x, y - 0.06, z + r)), 0.008, 0.008, COPPER_D, segs=6, outline=False)
        put(f"{lay}_pan{k}", tube(Vector((x, y - 0.06, z + r * 0.2)), Vector((x, y - 0.1, z - r * 0.2)), r, r, segs=16), COPPER, lay, smooth=True)
        oell(lay, f"{lay}_shine{k}", Vector((x - r * 0.4, y - 0.105, z + r * 0.3)), (r * 0.25, 0.005, r * 0.15), M("#f3c08a", True), outline=False)
    otube(lay, lay + "_spoon", Vector((0.35, y - 0.08, 1.0)), Vector((0.35, y - 0.08, 0.5)), 0.015, 0.015, WOOD, segs=6)
    oell(lay, lay + "_spoonb", Vector((0.35, y - 0.08, 0.46)), (0.04, 0.02, 0.06), WOOD)
    otube(lay, lay + "_ladle", Vector((0.65, y - 0.08, 1.0)), Vector((0.65, y - 0.08, 0.48)), 0.015, 0.015, COPPER_D, segs=6)
    oell(lay, lay + "_ladleb", Vector((0.65, y - 0.09, 0.44)), (0.06, 0.04, 0.05), COPPER)
    wall_target(lay, "top-wall cell with copper pots, a wooden spoon and a ladle hanging still (use instead of wall-face)")
wall_pots()
def wall_garlic():
    lay = "wall-garlic"; y = wall_face(lay)
    oell(lay, lay + "_peg", Vector((0.5, y - 0.04, 1.1)), (0.03, 0.03, 0.03), WOOD_D)
    for k in range(6):
        z = 1.0 - k * 0.12; sx = (-1) ** k * 0.05
        oell(lay, f"{lay}_braid{k}", Vector((0.5, y - 0.05, z)), (0.04, 0.03, 0.07), "#d9b56a", rot=(0, sx * 300, 0))
        oell(lay, f"{lay}_bulb{k}", Vector((0.5 + sx * 2.2, y - 0.09, z - 0.02)), (0.07, 0.06, 0.065), CREAM)
        oell(lay, f"{lay}_tip{k}", Vector((0.5 + sx * 2.2, y - 0.09, z + 0.05)), (0.02, 0.02, 0.03), "#e6d4ac", outline=False)
    wall_target(lay, "top-wall cell with a hanging garlic braid (use instead of wall-face)")
wall_garlic()
def wall_clock():
    lay = "wall-clock"; y = wall_face(lay)
    piv = empty(lay + "_piv", Vector((0.5, y - 0.06, 0.8)))
    pc = Vector((0.5, y - 0.06, 0.8))
    otube(lay, lay + "_rim", pc + Vector((0, 0.03, 0)), pc + Vector((0, -0.03, 0)), 0.3, 0.3, WOOD, segs=32, parent=piv)
    otube(lay, lay + "_face", pc + Vector((0, -0.031, 0)), pc + Vector((0, -0.034, 0)), 0.25, 0.25, M(CREAM, True), segs=32, outline=False, parent=piv)
    for i in range(12):
        a = i * math.pi / 6
        obox(lay, f"{lay}_tick{i}", pc + Vector((math.cos(a) * 0.2, -0.036, math.sin(a) * 0.2)), (0.025, 0.004, 0.025), M(WOOD_D, True), outline=False, parent=piv)
    obox(lay, lay + "_hh", pc + Vector((0.05, -0.04, 0.03)), (0.12, 0.004, 0.025), M(WOOD_D, True), rot=(0, -30, 0), outline=False, parent=piv)
    obox(lay, lay + "_mh", pc + Vector((0, -0.042, 0.08)), (0.02, 0.004, 0.17), M(WOOD_D, True), outline=False, parent=piv)
    piv.rotation_euler = (math.radians(-35), 0, 0)
    wall_target(lay, "top-wall cell with the big kitchen clock (use instead of wall-face, next to a door: the space above the door holds the room medallion)")
wall_clock()
def sign_board():
    lay = "sign-board"; y = grid(0, 1).y
    piv = empty(lay + "_piv", Vector((0.5, y - 0.05, 0.7)))
    obox(lay, lay + "_board", Vector((0.5, y - 0.05, 0.7)), (0.92, 0.04, 0.34), WOOD, bevel=0.02, parent=piv)
    obox(lay, lay + "_inner", Vector((0.5, y - 0.072, 0.7)), (0.82, 0.004, 0.24), M("#d9a876", True), outline=False, parent=piv)
    for x in (0.12, 0.88):
        oell(lay, f"{lay}_nail{x}", Vector((x, y - 0.08, 0.82)), (0.02, 0.01, 0.02), COPPER_D, outline=False, parent=piv)
    piv.rotation_euler = (math.radians(-20), 0, 0)
    target(lay, [lay], [0, 0, 1, 1], 0.3, anchor=[0, 0], group="decor",
           note="a blank wooden sign board, drawn on top of a wall-face cell (same anchor as wall-face). The game writes the sign's words on the board (inner panel)")
sign_board()

# ------------------------------------------------------------------ solid props for '#' cells inside a room
def block_target(lay, top, note):
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], top, anchor=[0.5, 1], group="props", note=note + " (solid: for a '#' cell; anchorPx = bottom-centre of the cell)")
def shadow(lay, c, rx=0.42, ry=0.32):
    rx *= 0.85; ry *= 0.7
    put(lay + "_shadow", ellipsoid(c + Vector((0, 0, 0.002)), (rx, ry * K, 0.002), segs=20, rings=4), M("#bdbdb6", True), lay, outline=False)
def block_sacks():
    lay = "block-flour-sacks"; c = grid(0.5, 0.55); shadow(lay, c)
    for k, (dx, dy, dz, s) in enumerate(((-0.17, 0.08, 0, 1), (0.18, 0.1, 0, 0.95), (0.0, -0.12, 0, 1.05), (0.0, 0.08, 0.3, 0.9))):
        p = c + Vector((dx, dy, dz + 0.17 * s))
        oell(lay, f"{lay}_sack{k}", p, (0.18 * s, 0.15 * s, 0.19 * s), CREAM)
        oell(lay, f"{lay}_tie{k}", p + Vector((0, 0, 0.18 * s)), (0.05, 0.05, 0.04), "#b98c5a")
        oell(lay, f"{lay}_dust{k}", p + Vector((0.04, -0.13 * s, -0.05)), (0.06, 0.01, 0.05), M("#fbf6ea", True), outline=False)
    block_target(lay, 0.8, "a pile of flour sacks")
def table_seg(lay, bowls=False):
    c = grid(0.5, 0.5); shadow(lay, c, 0.48, 0.34)
    obox(lay, lay + "_top", c + Vector((0, 0, 0.42)), (1.0, 0.7, 0.07), WOOD, bevel=0.015)
    for x in (-0.4, 0.4):
        for yy in (-0.25, 0.25):
            obox(lay, f"{lay}_leg{x}{yy}", c + Vector((x, yy, 0.19)), (0.07, 0.07, 0.38), WOOD_D)
    obox(lay, lay + "_bench", c + Vector((0, -0.48, 0.2)), (0.96, 0.2, 0.05), WOOD)
    for x in (-0.38, 0.38):
        obox(lay, f"{lay}_bleg{x}", c + Vector((x, -0.48, 0.09)), (0.05, 0.14, 0.18), WOOD_D, outline=False)
    if bowls:
        for k, x in enumerate((-0.25, 0.25)):
            otube(lay, f"{lay}_bowl{k}", c + Vector((x, 0, 0.455)), c + Vector((x, 0, 0.53)), 0.08, 0.13, "#e9c993", segs=14)
            otube(lay, f"{lay}_in{k}", c + Vector((x, 0, 0.528)), c + Vector((x, 0, 0.53)), 0.11, 0.11, M("#b98c5a", True), segs=14, outline=False)
    block_target(lay, 0.65, "a segment of the long table with a bench in front" + (" and two empty bowls" if bowls else "") + "; tiles side by side")
def counter(lay, tools=False):
    c = grid(0.5, 0.5); shadow(lay, c, 0.48, 0.34)
    obox(lay, lay + "_body", c + Vector((0, 0, 0.22)), (1.0, 0.7, 0.44), WOOD_D, bevel=0.015)
    obox(lay, lay + "_door", c + Vector((0, -0.351, 0.22)), (0.7, 0.01, 0.3), M("#9c6a40", True), outline=False)
    obox(lay, lay + "_top", c + Vector((0, 0, 0.47)), (1.02, 0.74, 0.06), WCAP)
    put(lay + "_flour", ellipsoid(c + Vector((-0.12, 0.05, 0.501)), (0.3, 0.2, 0.004), segs=16, rings=4), M("#fbf4e4", True), lay, outline=False)
    if tools:
        obox(lay, lay + "_board", c + Vector((0.12, 0, 0.515)), (0.5, 0.36, 0.03), "#e2b47a", bevel=0.01)
        otube(lay, lay + "_pin", c + Vector((-0.12, -0.12, 0.56)), c + Vector((0.36, -0.12, 0.56)), 0.035, 0.035, "#d9a86c", segs=10)
        put(lay + "_cut1", star_bm(0.07), COPPER, lay)
        bpy.data.objects[lay + "_cut1"].location = c + Vector((-0.3, -0.08, 0.53)); bpy.data.objects[lay + "_cut1"].rotation_euler = (math.radians(90), 0, 0)
        otube(lay, lay + "_cut2", c + Vector((-0.32, 0.15, 0.5)), c + Vector((-0.32, 0.15, 0.54)), 0.06, 0.06, COPPER, segs=16)
    block_target(lay, 0.7, "a floured counter" + (" with a rolling board, a little rolling pin and cookie cutters" if tools else "") + "; tiles side by side")
def cart():
    lay = "block-cart"; c = grid(0.5, 0.55); shadow(lay, c)
    for z in (0.18, 0.5):
        obox(lay, f"{lay}_tray{z}", c + Vector((0, 0, z)), (0.7, 0.45, 0.04), COPPER, bevel=0.01)
    for x in (-0.32, 0.32):
        for yy in (-0.2, 0.2):
            otube(lay, f"{lay}_post{x}{yy}", c + Vector((x, yy, 0.08)), c + Vector((x, yy, 0.52)), 0.015, 0.015, COPPER_D, segs=6, outline=False)
            otube(lay, f"{lay}_wheel{x}{yy}", c + Vector((x - 0.02, yy, 0.05)), c + Vector((x + 0.02, yy, 0.05)), 0.05, 0.05, "#4a4650", segs=10)
    otube(lay, lay + "_handle", c + Vector((-0.38, -0.2, 0.62)), c + Vector((-0.38, 0.2, 0.62)), 0.02, 0.02, WOOD_D, segs=6)
    for k, x in enumerate((-0.15, 0.15)):
        otube(lay, f"{lay}_bowl{k}", c + Vector((x, 0, 0.52)), c + Vector((x, 0, 0.6)), 0.07, 0.11, "#e9c993", segs=12)
    block_target(lay, 0.75, "a serving cart with two bowls, parked at the edge")
def spice():
    lay = "block-spice"; c = grid(0.5, 0.55); shadow(lay, c)
    obox(lay, lay + "_shelf", c + Vector((0, 0.05, 0.2)), (0.8, 0.4, 0.4), WOOD, bevel=0.015)
    cols = [EMBER, HONEY, "#a9b46a", "#d98c4a", "#e8c890", AMBER]
    for k in range(6):
        b = c + Vector((-0.3 + (k % 3) * 0.3, -0.05 + (k // 3) * 0.16, 0.4 + (k // 3) * 0.0))
        otube(lay, f"{lay}_jar{k}", b, b + Vector((0, 0, 0.12)), 0.05, 0.05, cols[k], segs=10)
        otube(lay, f"{lay}_cap{k}", b + Vector((0, 0, 0.12)), b + Vector((0, 0, 0.15)), 0.052, 0.052, WOOD_D, segs=10, outline=False)
    block_target(lay, 0.65, "a low cupboard with tiny spice jars")
block_sacks(); table_seg("block-table"); table_seg("block-table-bowls", True); counter("block-counter"); counter("block-counter-tools", True); cart(); spice()

# ------------------------------------------------------------------ flat floor decoration (walk-through, for '.' cells)
def rug():   # rectangular on purpose: round floor shapes could be mistaken for danger circles
    lay = "rug"
    gbox(lay, lay + "_edge", 0.08, 0.1, 1.92, 1.9, 0.0, 0.003, "#c9824a", outline=False, flat=True)
    gbox(lay, lay + "_mid", 0.18, 0.2, 1.82, 1.8, 0.003, 0.005, "#e7a55a", outline=False, flat=True)
    for k in range(4):
        gbox(lay, f"{lay}_dot{k}", 0.4 + k * 0.4, 0.95, 0.5 + k * 0.4, 1.05, 0.005, 0.007, "#f2c46a", outline=False, flat=True)
    target(lay, [lay], [0, 0, 2, 2], 0, anchor=[0, 0], group="floor-decor", note="a warm rectangular rug, flat, 2 x 2 cells (walk-through); anchorPx = top-left of the 2x2 block")
def flour():
    lay = "flour-dust"; c = grid(0.5, 0.5)
    for k, (dx, dy, s) in enumerate(((0, 0, 1), (0.2, 0.12, 0.5), (-0.22, -0.1, 0.4))):
        put(f"{lay}_{k}", ellipsoid(c + Vector((dx, dy * K, 0.003)), (0.25 * s, 0.17 * s * K, 0.002), segs=16, rings=4), M("#f6efe0", True), lay, outline=False)
    target(lay, [lay], [0, 0, 1, 1], 0, anchor=[0, 0], group="floor-decor", note="soft flour dust, flat (walk-through), 1 cell")
def bread_board():
    lay = "bread-board"; c = grid(0.5, 0.55)
    put(lay + "_b", tube(c, c + Vector((0, 0, 0.04)), 0.3, 0.3, segs=24, sy=0.8), "#d9a066", lay, smooth=True)
    obox(lay, lay + "_handle", c + Vector((0.36, 0, 0.02)), (0.14, 0.08, 0.04), "#d9a066")
    oell(lay, lay + "_hole", c + Vector((0.39, 0, 0.041)), (0.02, 0.02, 0.002), M(WOOD_D, True), outline=False)
    put(lay + "_ring", tube(c + Vector((0, 0, 0.041)), c + Vector((0, 0, 0.042)), 0.24, 0.24, segs=24, sy=0.8), M("#c48a52", True), lay, outline=False)
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], 0.1, anchor=[0.5, 1], group="floor-decor",
           note="the relic spot: a small bread board on the floor at the Great Hearth's 'C' tile, shown after the Hearth Cook is freed (walk-through); the light piece rises from here")
rug(); flour(); bread_board()

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
