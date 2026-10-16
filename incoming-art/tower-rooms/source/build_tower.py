"""
Dojo Ascent - Tower room kit (Art Director bot), Batch 4.

A tileable set for the hand-made Tower rooms (content/rooms/*.json: '#' wall, '.' floor, 'D' door slot in the
outer (top) wall, 'C' chest, 'S' rest shrine): floor tiles, wall pieces and a pillar, a door for each room
kind (battle, challenge, treasure, rest) with a clear icon, a chest (closed, opening, open) and the rest
shrine with a gentle glow loop. Tier 1 look: calm, light stone with warm wood; nothing scary.

    blender -b -P incoming-art/tower-rooms/source/build_tower.py -- --out <file>.blend
    blender -b <file>.blend -P incoming-art/tools/render_static.py -- --out incoming-art/tower-rooms/sprites
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box, OUTLINE_W

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); A = ap.parse_args(argv)
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

STONE = ["#c9c1b2", "#c2baab", "#cfc8ba"]; GROUT = "#948b7c"
# ------------------------------------------------------------------ floor tiles (1 x 1, tileable)
def floor_tile(lay, kind):
    gbox(lay, lay + "_grout", 0, 0, 1, 1, -0.04, -0.005, GROUT, outline=False)
    if kind == "big":            # one big slab
        gbox(lay, lay + "_slab", 0.025, 0.025, 0.975, 0.975, -0.005, 0.0, STONE[0], outline=False)
    elif kind == "quad":         # four small slabs
        for i in range(2):
            for j in range(2):
                gbox(lay, f"{lay}_{i}{j}", i * 0.5 + 0.02, j * 0.5 + 0.02, i * 0.5 + 0.48, j * 0.5 + 0.48, -0.005, 0.0, STONE[(i + j) % 3], outline=False)
    else:                        # "worn": a slab with a soft lighter patch and two pebbles (calm, not broken)
        gbox(lay, lay + "_slab", 0.025, 0.025, 0.975, 0.975, -0.005, 0.0, STONE[1], outline=False)
        put(lay + "_patch", ellipsoid(grid(0.42, 0.55, 0.0), (0.22, 0.14 * K, 0.002)), M("#d8d1c3", True), lay, outline=False)
        for k, (c, r) in enumerate(((0.7, 0.3), (0.76, 0.36))):
            oell(lay, f"{lay}_peb{k}", grid(c, r, 0.004), (0.03, 0.025, 0.012), "#a8a092", outline=False)
    target(lay, [lay], [0, 0, 1, 1], 0, anchor=[0, 0], group="tiles", note="floor tile, exactly 80 x 80 px; anchorPx = top-left corner of the cell")
for k in ("big", "quad", "worn"):
    floor_tile(f"floor-{k}", k)

# ------------------------------------------------------------------ walls and pillar
WSTONE, WDARK, WCAP = "#8e92ab", "#71758f", "#a9adc4"
H_FACE = 1.3 / COS                 # north wall face: fills its row + 0.3 tile above (like the Home Dojo)
def wall_face(lay):
    y = grid(0, 1).y
    obox(lay, lay + "_face", Vector((0.5, y + 0.1, H_FACE / 2)), (1.0, 0.2, H_FACE), WSTONE)
    for z in (0.33, 0.66, 0.99, 1.32):          # stone courses, offset bricks
        obox(lay, f"{lay}_c{z}", Vector((0.5, y - 0.002, z * H_FACE / 1.6)), (1.0, 0.01, 0.025), M(WDARK, True), outline=False)
    obox(lay, lay + "_base", Vector((0.5, y - 0.01, 0.1)), (1.0, 0.04, 0.2), WDARK, outline=False)
    obox(lay, lay + "_cap", Vector((0.5, y + 0.05, H_FACE - 0.06)), (1.0, 0.3, 0.12), WCAP, outline=False)
    target(lay, [lay], [0, 0, 1, 1], 0.3, anchor=[0, 0], group="walls",
           note="the outer top wall: one per '#' cell in the top row (tiles left to right); anchorPx = the cell's top-left corner")
wall_face("wall-face")
H_BLOCK = 0.5
def wall_block(lay):
    gbox(lay, lay + "_block", 0, 0, 1, 1, 0, H_BLOCK, WSTONE)
    gbox(lay, lay + "_top", 0.06, 0.06, 0.94, 0.94, H_BLOCK, H_BLOCK + 0.01, WCAP, outline=False)
    y = grid(0, 1).y
    obox(lay, lay + "_line", Vector((0.5, y - 0.002, H_BLOCK * 0.5)), (1.0, 0.01, 0.025), M(WDARK, True), outline=False)
    target(lay, [lay], [0, 0, 1, 1], H_BLOCK * COS + 0.02, anchor=[0, 0], group="walls",
           note="any other '#' cell (side and bottom walls, inner walls): a low stone block seen from above; tiles side by side; anchorPx = top-left of its cell; sort by the cell's bottom row")
wall_block("wall-block")
def pillar(lay):
    c = grid(0.5, 0.55)
    obox(lay, lay + "_base", c + Vector((0, 0, 0.08)), (0.72, 0.72, 0.16), WDARK, bevel=0.03)
    otube(lay, lay + "_shaft", c + Vector((0, 0, 0.16)), c + Vector((0, 0, 1.55)), 0.27, 0.25, WSTONE, segs=16)
    for z in (0.6, 1.1):
        otube(lay, f"{lay}_ring{z}", c + Vector((0, 0, z)), c + Vector((0, 0, z + 0.05)), 0.275, 0.275, WDARK, segs=16, outline=False)
    obox(lay, lay + "_cap", c + Vector((0, 0, 1.62)), (0.7, 0.7, 0.14), WCAP, bevel=0.03)
    target(lay, [lay], [-0.05, 0, 1.05, 1.05], 1.75, anchor=[0.5, 1], group="walls",
           note="a round stone pillar for a single '#' cell inside a room (draw instead of wall-block if you like); anchorPx = bottom-centre of its cell")
pillar("pillar")

# ------------------------------------------------------------------ doors (one per room kind) + icons
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
def door(kind):
    d = DOORS[kind]; lay = f"door-{kind}"; y = grid(0, 1).y
    # stone frame and wooden posts in the top wall cell, the room kind's colour on the trim
    obox(lay, lay + "_wall", Vector((0.5, y + 0.1, H_FACE / 2)), (1.0, 0.2, H_FACE), WSTONE)
    obox(lay, lay + "_cap", Vector((0.5, y + 0.05, H_FACE - 0.06)), (1.0, 0.3, 0.12), WCAP, outline=False)
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
    # plaque with the icon above the door
    pc = Vector((0.5, y - 0.06, 1.42))
    otube(lay, lay + "_plaque", pc + Vector((0, 0.03, 0)), pc + Vector((0, -0.02, 0)), 0.22, 0.22, "#f6efdc", segs=24)
    otube(lay, lay + "_plaquerim", pc + Vector((0, -0.021, 0)), pc + Vector((0, -0.026, 0)), 0.205, 0.205, M(d["trim"], True), segs=24, outline=False)
    otube(lay, lay + "_plaquein", pc + Vector((0, -0.027, 0)), pc + Vector((0, -0.03, 0)), 0.18, 0.18, M("#f6efdc", True), segs=24, outline=False)
    icon(lay, d["icon"], pc + Vector((0, -0.02, 0)), 1.0)
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
    target(lay, [lay], [-0.1, 0, 1.1, 1], 0.75, anchor=[0.5, 1], frames=[1, 2], fps=1, group="doors",
           note=f"{d['label']} door for a 'D' slot in the top wall: frame 0 closed, frame 1 open (doors slide apart, the doorway glows). anchorPx = bottom-centre of the door cell. The icon plaque rises above the wall")
    # the icon on its own too (for door labels, the map, buttons)
    ic = f"icon-{kind}"
    pc2 = Vector((5.5 + list(DOORS).index(kind) * 1.0, -2.0, 0.6))
    otube(ic, ic + "_plaque", pc2 + Vector((0, 0.03, 0)), pc2 + Vector((0, -0.02, 0)), 0.22, 0.22, "#f6efdc", segs=24)
    otube(ic, ic + "_rim", pc2 + Vector((0, -0.021, 0)), pc2 + Vector((0, -0.026, 0)), 0.205, 0.205, M(d["trim"], True), segs=24, outline=False)
    otube(ic, ic + "_in", pc2 + Vector((0, -0.027, 0)), pc2 + Vector((0, -0.03, 0)), 0.18, 0.18, M("#f6efdc", True), segs=24, outline=False)
    icon(ic, d["icon"], pc2 + Vector((0, -0.02, 0)), 1.0)
    target(ic, [ic], [pc2.x - 0.3, -pc2.y / K - 0.1, pc2.x + 0.3, -pc2.y / K + 0.1], 0.5, anchor="bottom-center", group="doors",
           note="the door's icon on its plaque, on its own (for labels, the floor map or buttons)")
for k in DOORS:
    door(k)

# ------------------------------------------------------------------ chest: closed, opening, open
def chest():
    lay = "chest"; c = grid(0.5, 0.55)
    obox(lay, "chest_body", c + Vector((0, 0, 0.18)), (0.6, 0.4, 0.34), "#a46e40", bevel=0.02)
    for x in (-0.22, 0.22):
        obox(lay, f"chest_band{x}", c + Vector((x, 0, 0.18)), (0.05, 0.415, 0.345), "#d9a441", outline=False)
    hinge = empty("chest_hinge", c + Vector((0, 0.2, 0.35)))
    put("chest_lid", tube(c + Vector((-0.3, 0, 0.35)), c + Vector((0.3, 0, 0.35)), 0.2, 0.2, segs=16, sy=1.0), "#b57a45", lay, smooth=True, parent=hinge)
    bm = bpy.data.objects["chest_lid"]
    obox(lay, "chest_lock", c + Vector((0, -0.205, 0.33)), (0.1, 0.03, 0.12), "#ffd36b", parent=None)
    for x in (-0.22, 0.22):
        put(f"chest_lidband{x}", tube(c + Vector((x - 0.025, 0, 0.35)), c + Vector((x + 0.025, 0, 0.35)), 0.205, 0.205, segs=16),
            "#d9a441", lay, outline=False, smooth=True, parent=hinge)
    # treasure glow inside (scales up as the lid opens): soft warm light and a few sparkles, nothing to read
    glow = empty("chest_glow", c + Vector((0, 0, 0.36)))
    oell(lay, "chest_light", c + Vector((0, 0, 0.36)), (0.26, 0.16, 0.12), M("#fff3c4", True), outline=False, parent=glow)
    for k in range(5):
        a = k * 2 * math.pi / 5
        oell(lay, f"chest_spark{k}", c + Vector((math.cos(a) * 0.2, math.sin(a) * 0.08, 0.5 + 0.08 * (k % 2))), (0.03, 0.03, 0.05),
             M("#ffe48a", True), outline=False, segs=4, rings=2, parent=glow)
    N = 7
    for f in range(1, N + 1):
        t = (f - 1) / (N - 1); e = 0.5 - 0.5 * math.cos(math.pi * t)
        hinge.rotation_euler = (math.radians(-105 * e), 0, 0); hinge.keyframe_insert("rotation_euler", frame=f)
        glow.scale = (max(0.0001, e),) * 3; glow.location = c + Vector((0, 0, 0.36 + 0.1 * e)); glow.keyframe_insert("scale", frame=f); glow.keyframe_insert("location", frame=f)
    target("chest", [lay], [-0.15, 0, 1.15, 1.1], 1.0, anchor=[0.5, 1], frames=[1, N], fps=12, group="chest",
           note="the chest for a 'C' spot: a sheet of 7 frames: frame 0 = closed (still), 1-5 the lid opens, 6 = open (still). Play 0 -> 6 once at 12 fps (0.5 s), then hold the last frame")
chest()

# ------------------------------------------------------------------ rest shrine with a gentle glow loop
def shrine():
    lay, gl = "shrine", "shrine-glow"; c = grid(0.5, 0.55)
    obox(lay, "sh_step", c + Vector((0, 0, 0.05)), (0.8, 0.6, 0.1), "#a9a294", bevel=0.02)
    obox(lay, "sh_base", c + Vector((0, 0, 0.17)), (0.6, 0.45, 0.14), "#bdb6a6", bevel=0.02)
    for x in (-0.22, 0.22):
        obox(lay, f"sh_post{x}", c + Vector((x, -0.1, 0.45)), (0.06, 0.06, 0.42), "#b8322a")
        obox(lay, f"sh_postb{x}", c + Vector((x, 0.12, 0.45)), (0.06, 0.06, 0.42), "#b8322a")
    obox(lay, "sh_back", c + Vector((0, 0.13, 0.45)), (0.44, 0.03, 0.42), "#c9a06a")
    put("sh_roof", tube(c + Vector((0, 0, 0.66)), c + Vector((0, 0, 0.86)), 0.42, 0.08, segs=4), "#4a5d7a", lay)
    oell(lay, "sh_top", c + Vector((0, 0, 0.88)), (0.05, 0.05, 0.05), "#d9a441")
    otube(lay, "sh_dish", c + Vector((0, -0.02, 0.24)), c + Vector((0, -0.02, 0.29)), 0.11, 0.14, "#d9a441", segs=14)
    # glow layer: a warm floating orb in the shrine and a soft ring on the step; it gently swells (loop)
    piv = empty("sh_glowpiv", c + Vector((0, -0.02, 0.42)))
    oell(gl, "sh_orb", c + Vector((0, -0.02, 0.42)), (0.09, 0.09, 0.09), M("#fff6c8", True), outline=False, parent=piv)
    oell(gl, "sh_halo", c + Vector((0, -0.02, 0.42)), (0.15, 0.03, 0.15), M("#ffe9a0", True), outline=False, parent=piv)
    ring = empty("sh_ringpiv", c + Vector((0, 0, 0.105)))
    put("sh_ring", ellipsoid(c + Vector((0, 0, 0.102)), (0.36, 0.27, 0.004), segs=24, rings=4), M("#ffe9a0", True), gl, outline=False, parent=ring)
    for f in range(1, 9):
        b = 0.5 - 0.5 * math.cos(2 * math.pi * (f - 1) / 8)
        piv.scale = (1 + 0.25 * b,) * 3; piv.location = c + Vector((0, -0.02, 0.42 + 0.025 * b))
        piv.keyframe_insert("scale", frame=f); piv.keyframe_insert("location", frame=f)
        ring.scale = (0.85 + 0.2 * b, 0.85 + 0.2 * b, 1); ring.keyframe_insert("scale", frame=f)
    target("shrine", [lay, gl], [-0.15, 0, 1.15, 1.1], 1.0, anchor=[0.5, 1], frames=[1, 8], fps=8, loop=True, group="shrine",
           note="the rest shrine for an 'S' spot: shrine layer (still; every frame is the same) + shrine-glow layer (8-frame loop at 8 fps = 1 s, a gentle swell). The game can also pulse shrine-glow's alpha")
shrine()

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
