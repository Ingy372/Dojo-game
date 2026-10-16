"""
Dojo Ascent - the boss door (Art Director bot), Batch 5 SAMPLES: three looks of the closed door.

The door for the 'D' slot in the top wall of the room before the Floor Keeper: a 1-tile opening, a bigger
frame (about 2 tiles wide, rising above the wall), Tier 1 stone and the Keeper's gold #ffd36b, and a crown
medallion. Special and a little exciting, never scary. Same helpers and camera as tower-rooms/build_tower.py.

    blender -b -P incoming-art/boss-door/source/build_boss_door.py -- --out $PWD/incoming-art/boss-door/source/boss_samples.blend
    blender -b incoming-art/boss-door/source/boss_samples.blend -P incoming-art/tools/render_static.py -- --out incoming-art/boss-door/sprites/samples
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, add_hull, ellipsoid, tube, box, OUTLINE_W

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); ap.add_argument("--looks", default="a,b,c"); A = ap.parse_args(argv)
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

# ------------------------------------------------------------------ Tier 1 stone and the Keeper's gold (style guide)
WSTONE, WDARK, WCAP = "#8e92ab", "#71758f", "#a9adc4"
GOLD, GOLD_D, CREAM, WOOD, WOOD_D = "#ffd36b", "#d9a441", "#f6efdc", "#c9a06a", "#7a5232"
H_FACE = 1.3 / COS
Y = grid(0, 1).y          # the wall's foot line (front face of the top wall)

def star_bm(r, inner=0.42, th=0.02):
    bm = bmesh.new()
    pts = [Vector((math.cos(a) * (r if i % 2 == 0 else r * inner), 0, math.sin(a) * (r if i % 2 == 0 else r * inner)))
           for i, a in enumerate([math.pi / 2 + i * math.pi / 5 for i in range(10)])]
    vs = [bm.verts.new(p) for p in pts]; bm.faces.new(vs)
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=th); return bm

def crown(lay, c, s, parent=None):
    """A friendly round crown: a gold band, three rounded points with balls on top, a small amber gem."""
    y = c.y - 0.05
    bm = bmesh.new()   # the crown's outline as one flat solid shape (band + 3 points), seen from the front
    w, hb = 0.2 * s, 0.07 * s
    pts = [(-w, -0.1 * s), (w, -0.1 * s), (w, 0.0), (w * 1.02, 0.13 * s), (w * 0.5, 0.03 * s), (0, 0.16 * s),
           (-w * 0.5, 0.03 * s), (-w * 1.02, 0.13 * s), (-w, 0.0)]
    vs = [bm.verts.new(Vector((c.x + x, y, c.z + z))) for x, z in pts]; bm.faces.new(vs)
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.03)
    put(f"{lay}_crown", bm, "#f2b230", lay, parent=parent)
    obox(lay, f"{lay}_band", Vector((c.x, y - 0.035, c.z - 0.06 * s)), (0.4 * s, 0.01, 0.05 * s), M(GOLD_D, True), outline=False, parent=parent)
    for x, z in ((-w * 1.02, 0.13 * s), (0, 0.16 * s), (w * 1.02, 0.13 * s)):
        oell(lay, f"{lay}_ball{x:.2f}", Vector((c.x + x, y - 0.01, c.z + z + 0.02 * s)), (0.04 * s, 0.03, 0.04 * s), "#f2b230", parent=parent)
    oell(lay, f"{lay}_gem", Vector((c.x, y - 0.045, c.z - 0.06 * s)), (0.035 * s, 0.015, 0.03 * s), "#e8844a", parent=parent)

def medallion(lay, pc, r=0.22, ring=GOLD, face=CREAM, parent_rot=True):
    piv = empty(lay + "_medal", pc); s = r / 0.22
    otube(lay, lay + "_plaque", pc + Vector((0, 0.03, 0)), pc + Vector((0, -0.02, 0)), r, r, face, segs=36, parent=piv)
    otube(lay, lay + "_plaquerim", pc + Vector((0, -0.021, 0)), pc + Vector((0, -0.026, 0)), r * 0.93, r * 0.93, M(ring, True), segs=36, outline=False, parent=piv)
    otube(lay, lay + "_plaquein", pc + Vector((0, -0.027, 0)), pc + Vector((0, -0.03, 0)), r * 0.8, r * 0.8, M(face, True), segs=36, outline=False, parent=piv)
    crown(lay, pc + Vector((0, -0.02, 0.012 * s)), s * 0.68, parent=piv)
    piv.rotation_euler = (math.radians(-35), 0, 0)
    return piv

def wall_and_opening(lay, xs=(-0.5, 1.5)):
    """The top wall behind the frame (2 tiles: the door cell and half a cell each side), the dark opening."""
    w = xs[1] - xs[0]
    obox(lay, lay + "_wall", Vector((0.5, Y + 0.1, H_FACE / 2)), (w, 0.2, H_FACE), WSTONE)
    for z in (0.33, 0.66, 0.99, 1.32):
        obox(lay, f"{lay}_c{z}", Vector((0.5, Y - 0.002, z * H_FACE / 1.6)), (w, 0.01, 0.025), M(WDARK, True), outline=False)
    obox(lay, lay + "_wbase", Vector((0.5, Y - 0.01, 0.1)), (w, 0.04, 0.2), WDARK, outline=False)
    obox(lay, lay + "_wcap", Vector((0.5, Y + 0.05, H_FACE - 0.06)), (w, 0.3, 0.12), WCAP, outline=False)
    obox(lay, lay + "_opening", Vector((0.5, Y - 0.004, 0.55)), (0.72, 0.01, 1.1), M("#2a2540", True), outline=False)

def heavy_doors(lay, kind="wood"):
    """Two big closed door leaves filling the 1-tile opening (they slide apart in the open frame)."""
    for k, x in enumerate((0.32, 0.68)):
        if kind == "wood":     # warm wood leaves with gold bands and round studs
            obox(lay, f"{lay}_leaf{k}", Vector((x, Y - 0.025, 0.55)), (0.36, 0.035, 1.1), WOOD)
            for z in (0.22, 0.88):
                obox(lay, f"{lay}_gb{k}{z}", Vector((x, Y - 0.045, z)), (0.36, 0.008, 0.07), M(GOLD_D, True), outline=False)
            for z in (0.22, 0.88):
                for dx in (-0.1, 0.1):
                    oell(lay, f"{lay}_stud{k}{z}{dx}", Vector((x + dx, Y - 0.05, z)), (0.022, 0.015, 0.022), GOLD, outline=False)
            obox(lay, f"{lay}_ring{k}", Vector((0.5 + (k * 2 - 1) * 0.05, Y - 0.06, 0.55)), (0.025, 0.02, 0.12), GOLD)
        else:                  # paper sliding panels like the other doors, but with gold frames
            obox(lay, f"{lay}_leaf{k}", Vector((x, Y - 0.025, 0.55)), (0.36, 0.035, 1.1), GOLD_D)
            obox(lay, f"{lay}_paper{k}", Vector((x, Y - 0.045, 0.6)), (0.27, 0.005, 0.82), M("#fff3c4", True), outline=False)
            for z in (0.36, 0.6, 0.84):
                obox(lay, f"{lay}_bar{k}{z}", Vector((x, Y - 0.048, z)), (0.27, 0.006, 0.02), M(GOLD_D, True), outline=False)
            obox(lay, f"{lay}_vbar{k}", Vector((x, Y - 0.048, 0.6)), (0.02, 0.006, 0.82), M(GOLD_D, True), outline=False)

LOOKS = {}
def look(fn): LOOKS[fn.__name__[-1]] = fn; return fn

@look
def look_a():
    """A: 'stone gate'. A big carved stone frame in two shades with gold edging, wide square posts with
    gold caps, a stepped crest above the wall with the crown medallion; warm wooden doors with gold bands."""
    lay = "door-boss-a"; wall_and_opening(lay)
    for sx in (-1, 1):
        x = 0.5 + sx * 0.5
        obox(lay, f"{lay}_post{sx}", Vector((x, Y - 0.06, 0.72)), (0.24, 0.16, 1.44), WCAP, bevel=0.02)
        obox(lay, f"{lay}_pedge{sx}", Vector((x - sx * 0.125, Y - 0.141, 0.72)), (0.025, 0.01, 1.4), M(GOLD, True), outline=False)
        obox(lay, f"{lay}_pbase{sx}", Vector((x, Y - 0.06, 0.08)), (0.3, 0.2, 0.16), WDARK, bevel=0.02)
        obox(lay, f"{lay}_pcap{sx}", Vector((x, Y - 0.06, 1.5)), (0.3, 0.2, 0.12), GOLD, bevel=0.02)
    obox(lay, f"{lay}_lintel", Vector((0.5, Y - 0.07, 1.28)), (1.3, 0.16, 0.2), WCAP, bevel=0.02)
    obox(lay, f"{lay}_lgold", Vector((0.5, Y - 0.152, 1.2)), (1.0, 0.01, 0.03), M(GOLD, True), outline=False)
    obox(lay, f"{lay}_crest1", Vector((0.5, Y - 0.06, 1.48)), (0.9, 0.14, 0.2), WCAP, bevel=0.02)
    obox(lay, f"{lay}_crest2", Vector((0.5, Y - 0.06, 1.66)), (0.6, 0.12, 0.18), WSTONE, bevel=0.02)
    heavy_doors(lay, "wood")
    medallion(lay, Vector((0.5, Y - 0.25, 1.7)), r=0.27)
    return lay, 1.15

@look
def look_b():
    """B: 'Keeper's torii'. A tall gate of dark wood and gold over the opening: two round posts, a curved
    top beam whose ends turn up, a straight lower beam, the crown medallion hanging between them; gold-framed
    glowing paper doors (the family look of the other doors, made grander)."""
    lay = "door-boss-b"; wall_and_opening(lay)
    for sx in (-1, 1):
        x = 0.5 + sx * 0.56
        otube(lay, f"{lay}_post{sx}", Vector((x, Y - 0.12, 0.0)), Vector((x, Y - 0.12, 1.62)), 0.075, 0.065, "#b8322a", segs=14)
        otube(lay, f"{lay}_foot{sx}", Vector((x, Y - 0.12, 0.0)), Vector((x, Y - 0.12, 0.14)), 0.1, 0.1, "#3a3248", segs=14)
    obox(lay, f"{lay}_tie", Vector((0.5, Y - 0.12, 1.3)), (1.3, 0.1, 0.1), "#b8322a")
    # kasagi: one long dark top beam with gently raised ends, a gold edge under it
    obox(lay, f"{lay}_kasa", Vector((0.5, Y - 0.12, 1.64)), (1.5, 0.17, 0.11), "#3a3248")
    obox(lay, f"{lay}_kgold", Vector((0.5, Y - 0.21, 1.6)), (1.5, 0.01, 0.025), M(GOLD, True), outline=False)
    for sx in (-1, 1):
        obox(lay, f"{lay}_kend{sx}", Vector((0.5 + sx * 0.83, Y - 0.12, 1.69)), (0.24, 0.17, 0.11), "#3a3248", rot=(0, -sx * 14, 0))
    obox(lay, f"{lay}_kasaR", Vector((0.5, Y - 0.12, 1.53)), (1.4, 0.13, 0.08), "#b8322a")
    obox(lay, f"{lay}_strut", Vector((0.5, Y - 0.12, 1.42)), (0.08, 0.08, 0.2), "#b8322a")
    heavy_doors(lay, "paper")
    medallion(lay, Vector((0.5, Y - 0.25, 1.42)), r=0.23)
    return lay, 1.15

@look
def look_c():
    """C: 'sunrise arch'. A round-topped stone arch in pale cap stone with a gold keystone band, a fan of gold
    rays rising behind a big crown medallion, low gold lanterns on each side; wooden doors with gold bands."""
    lay = "door-boss-c"; wall_and_opening(lay)
    # rays: a half fan of tapered gold rays behind the medallion (flat light, no outline, soft)
    cpos = Vector((0.5, Y - 0.05, 1.42)); piv = empty(lay + "_raypiv", cpos)
    for i in range(7):
        a = math.radians(-72 + i * 24); L = 0.5 if i % 2 == 0 else 0.42
        d = Vector((math.sin(a), 0, math.cos(a)))
        oell(lay, f"{lay}_ray{i}", cpos + d * (0.16 + L / 2), (0.07 if i % 2 == 0 else 0.055, 0.008, L / 2), M(GOLD if i % 2 == 0 else "#ffe9a0", True),
             rot=(0, math.degrees(a), 0), outline=False, parent=piv)
    piv.rotation_euler = (math.radians(-35), 0, 0)
    # the arch: posts + a ring of stone blocks
    for sx in (-1, 1):
        x = 0.5 + sx * 0.47
        obox(lay, f"{lay}_post{sx}", Vector((x, Y - 0.06, 0.55)), (0.22, 0.14, 1.1), WCAP, bevel=0.02)
        obox(lay, f"{lay}_pbase{sx}", Vector((x, Y - 0.06, 0.07)), (0.28, 0.18, 0.14), WDARK, bevel=0.02)
        # little round lantern on a stone foot, outside the posts
        lx = 0.5 + sx * 0.78
        obox(lay, f"{lay}_lfoot{sx}", Vector((lx, Y - 0.15, 0.12)), (0.12, 0.12, 0.24), WDARK, bevel=0.02)
        oell(lay, f"{lay}_lamp{sx}", Vector((lx, Y - 0.15, 0.33)), (0.08, 0.08, 0.09), M("#fff3c4", True))
        obox(lay, f"{lay}_lroof{sx}", Vector((lx, Y - 0.15, 0.44)), (0.17, 0.17, 0.04), GOLD_D)
    n = 11
    for i in range(n):
        a = math.pi * i / (n - 1)
        x = 0.5 - math.cos(a) * 0.47; z = 1.1 + math.sin(a) * 0.3
        obox(lay, f"{lay}_arch{i}", Vector((x, Y - 0.06, z)), (0.17, 0.14, 0.2), WCAP if i != 5 else GOLD, rot=(0, math.degrees(a) - 90, 0), bevel=0.01)
    heavy_doors(lay, "wood")
    medallion(lay, Vector((0.5, Y - 0.25, 1.5)), r=0.26)
    return lay, 1.25

for k in A.looks.split(","):
    lay, top = LOOKS[k]()
    target(lay, [lay], [-0.5, 0, 1.5, 1], top, anchor=[0.5, 1], group="boss-door-samples",
           note=f"SAMPLE look {k.upper()} (closed door only). 160 px wide: the door cell plus half a tile of wall each side; anchorPx = bottom-centre of the door cell")

scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
