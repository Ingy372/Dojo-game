"""Tier 2 (Bamboo Garden Hall) version of the boss door: a copy of boss-door/source/build_boss_door.py with the
bamboo-hall wall colours (cream plaster, bamboo-green lines, warm wood caps and posts). Same shapes, sizes, frames and icon."""
"""
Dojo Ascent - the boss door (Art Director bot), Batch 5: door-boss (look A, the stone gate), door-boss-glow and icon-boss.

The door for the 'D' slot in the top wall of the room before the Floor Keeper: a 1-tile opening, a bigger
frame (about 2 tiles wide, rising above the wall), Tier 1 stone and the Keeper's gold #ffd36b, and a crown
medallion. Special and a little exciting, never scary. Same helpers and camera as tower-rooms/build_tower.py.

    blender -b -P incoming-art/boss-door/source/build_boss_door.py -- --out $PWD/incoming-art/boss-door/source/boss_door.blend
    blender -b incoming-art/boss-door/source/boss_door.blend -P incoming-art/tools/render_static.py -- --out incoming-art/boss-door/sprites
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

# ------------------------------------------------------------------ Tier 1 stone and the Keeper's gold (style guide)
WSTONE, WDARK, WCAP = "#efe4c8", "#7fa65a", "#c9a06a"   # Tier 2 Bamboo Garden Hall (was Tier 1 stone)
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

def glow_mat(name, hex_color, alpha):
    """See-through light: emission mixed with transparency; returns (material, the mix node) so Fac can be keyed."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = srgb(hex_color)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs["Fac"].default_value = alpha
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs["Surface"])
    m.blend_method = "BLEND"; return m, mx

MED_C, MED_R = Vector((0.5, Y - 0.25, 1.7)), 0.27
POSTS = [(0.5 + sx * 0.5, sx) for sx in (-1, 1)]

def door_boss():
    """Look A, the stone gate (Jay picked it): light carved stone posts with gold caps and gold edging, a stepped
    crest with the crown medallion, heavy wooden doors with gold bands. Frame 1 closed, frame 2 open."""
    lay = "door-boss"; wall_and_opening(lay)
    for x, sx in POSTS:
        obox(lay, f"{lay}_post{sx}", Vector((x, Y - 0.06, 0.72)), (0.24, 0.16, 1.44), WCAP, bevel=0.02)
        obox(lay, f"{lay}_pedge{sx}", Vector((x - sx * 0.125, Y - 0.141, 0.72)), (0.025, 0.01, 1.4), M(GOLD, True), outline=False)
        obox(lay, f"{lay}_pbase{sx}", Vector((x, Y - 0.06, 0.08)), (0.3, 0.2, 0.16), WDARK, bevel=0.02)
        obox(lay, f"{lay}_pcap{sx}", Vector((x, Y - 0.06, 1.5)), (0.3, 0.2, 0.12), GOLD, bevel=0.02)
    obox(lay, f"{lay}_lintel", Vector((0.5, Y - 0.07, 1.28)), (1.3, 0.16, 0.2), WCAP, bevel=0.02)
    obox(lay, f"{lay}_lgold", Vector((0.5, Y - 0.152, 1.2)), (1.0, 0.01, 0.03), M(GOLD, True), outline=False)
    obox(lay, f"{lay}_crest1", Vector((0.5, Y - 0.06, 1.48)), (0.9, 0.14, 0.2), WCAP, bevel=0.02)
    obox(lay, f"{lay}_crest2", Vector((0.5, Y - 0.06, 1.66)), (0.6, 0.12, 0.18), WSTONE, bevel=0.02)
    # the two door leaves on sliding pivots (they slide behind the posts when open)
    hinge = [empty(f"{lay}_slideL", Vector((0, 0, 0))), empty(f"{lay}_slideR", Vector((0, 0, 0)))]
    for k, x in enumerate((0.32, 0.68)):
        par = hinge[k]
        obox(lay, f"{lay}_leaf{k}", Vector((x, Y - 0.025, 0.55)), (0.36, 0.035, 1.1), WOOD, parent=par)
        for z in (0.22, 0.88):
            obox(lay, f"{lay}_gb{k}{z}", Vector((x, Y - 0.045, z)), (0.36, 0.008, 0.07), M(GOLD_D, True), outline=False, parent=par)
            for dx in (-0.1, 0.1):
                oell(lay, f"{lay}_stud{k}{z}{dx}", Vector((x + dx, Y - 0.05, z)), (0.022, 0.015, 0.022), GOLD, outline=False, parent=par)
        obox(lay, f"{lay}_ring{k}", Vector((0.5 + (k * 2 - 1) * 0.05, Y - 0.06, 0.55)), (0.025, 0.02, 0.12), GOLD, parent=par)
    # the warm light in the open doorway (hidden when closed)
    glow = empty(f"{lay}_lightpiv", Vector((0.5, Y, 0.55)))
    obox(lay, lay + "_light", Vector((0.5, Y - 0.006, 0.55)), (0.7, 0.01, 1.08), M("#fff3c4", True), outline=False, parent=glow)
    obox(lay, lay + "_lightcore", Vector((0.5, Y - 0.008, 0.5)), (0.36, 0.01, 0.9), M("#fffbe8", True), outline=False, parent=glow)
    medallion(lay, MED_C, r=MED_R)
    for o in hinge + [glow]:
        o.keyframe_insert("location", frame=1); o.keyframe_insert("scale", frame=1)
    hinge[0].location = (-0.3, 0, 0); hinge[1].location = (0.3, 0, 0)
    for o in hinge: o.keyframe_insert("location", frame=2)
    glow.scale = (1, 1, 1); glow.keyframe_insert("scale", frame=2)
    glow.scale = (0.0001, 1, 0.0001); glow.keyframe_insert("scale", frame=1)
    for o in hinge + [glow]:
        for fc in o.animation_data.action.fcurves:
            for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"
    target(lay, [lay], [-0.5, 0, 1.5, 1], 1.15, anchor=[0.5, 1], frames=[1, 2], fps=1, group="doors",
           note="Boss door (the Floor Keeper's door) for the 'D' slot of the room before the boss: frame 0 closed, frame 1 open (the doors slide apart behind the posts, the doorway glows warm). 160 px wide: the 1-tile opening in the middle and the stone frame overlapping half a wall tile on each side (draw it over those wall tiles). anchorPx = bottom-centre of the door cell. Add door-boss-glow on top while it's closed and the room is being fought")

def door_boss_glow():
    """8-frame loop (8 fps): a soft gold halo swelling around the medallion and light breathing along the gold
    frame (post edges, caps, lintel line). Only the medallion and gold frame, per the default for Jay's question."""
    lay = "door-boss-glow"
    halo_m, halo_mx = glow_mat("BOSSHALO", "#ffe9a0", 0.6)
    edge_m, edge_mx = glow_mat("BOSSEDGE", "#ffd36b", 0.6)
    hp = empty(lay + "_halopiv", MED_C + Vector((0, 0.02, 0)))
    bm = bmesh.new()   # a flat ring (annulus) just outside the medallion
    n = 40
    outer = [bm.verts.new(MED_C + Vector((math.cos(2 * math.pi * i / n) * (MED_R + 0.07), 0.02, math.sin(2 * math.pi * i / n) * (MED_R + 0.07)))) for i in range(n)]
    inner = [bm.verts.new(MED_C + Vector((math.cos(2 * math.pi * i / n) * (MED_R - 0.005), 0.02, math.sin(2 * math.pi * i / n) * (MED_R - 0.005)))) for i in range(n)]
    for i in range(n): bm.faces.new([outer[i], outer[(i + 1) % n], inner[(i + 1) % n], inner[i]])
    put(lay + "_halo", bm, halo_m, lay, outline=False, parent=hp)
    hp.rotation_euler = (math.radians(-35), 0, 0)
    for x, sx in POSTS:   # light over the gold edging and caps, just in front of them
        obox(lay, f"{lay}_edge{sx}", Vector((x - sx * 0.125, Y - 0.15, 0.72)), (0.045, 0.01, 1.42), edge_m, outline=False)
        obox(lay, f"{lay}_cap{sx}", Vector((x, Y - 0.17, 1.5)), (0.34, 0.01, 0.16), edge_m, outline=False)
    obox(lay, f"{lay}_line", Vector((0.5, Y - 0.16, 1.2)), (1.02, 0.01, 0.05), edge_m, outline=False)
    for f in range(1, 9):
        b = 0.5 - 0.5 * math.cos(2 * math.pi * (f - 1) / 8)       # 0 -> 1 -> 0, smooth
        hp.scale = (1 + 0.12 * b,) * 3; hp.keyframe_insert("scale", frame=f)
        halo_mx.inputs["Fac"].default_value = 0.25 + 0.55 * b; halo_mx.inputs["Fac"].keyframe_insert("default_value", frame=f)
        edge_mx.inputs["Fac"].default_value = 0.15 + 0.5 * b; edge_mx.inputs["Fac"].keyframe_insert("default_value", frame=f)
    target(lay, [lay], [-0.5, 0, 1.5, 1], 1.15, anchor=[0.5, 1], frames=[1, 8], fps=8, loop=True, group="doors",
           note="The boss door's glow loop (8 frames at 8 fps = 1 s): a gold halo swells around the crown medallion and light breathes along the gold frame. Same size and anchor as door-boss; draw it on top of door-boss frame 0 while the door is closed and the room is being fought. Straight alpha, see-through")

def icon_boss():
    ic = "icon-boss"; pc = Vector((5.5, -2.0, 0.6))
    medallion(ic, pc, r=0.22)
    target(ic, [ic], [pc.x - 0.3, -pc.y / K - 0.1, pc.x + 0.3, -pc.y / K + 0.1], 0.6, anchor="bottom-center", group="doors",
           note="the boss door's crown icon on its round medallion, on its own (like icon-battle: for labels, the floor map or buttons)")

door_boss(); door_boss_glow(); icon_boss()
scene.frame_set(1)
scene["static_targets"] = json.dumps(TARGETS)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, len(TARGETS), "targets")
