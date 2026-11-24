"""More hairstyles (Jay, Nov 23: "a lot of the hairstyles look like they would be for darker skin tones ... balanced").

The 12 hairs from Batch 6 lean textured (curly, afro, braids, puffs, twists, cornrows, high top). This adds six
straight and wavy styles, built the same way (soft ellipsoids and cones, the neutral hair material the game tints,
an inverted-hull outline) and placed on the hero v2 head (the head group is 1.3x around the neck, like upgrade_hero).
It also removes the round skin patch on the chest (Jay, Nov 23: "an open circle on the chest ... looks weird").

    blender -b player_hero2_<a|b>[_kata].blend -P add_hairs.py -- --save <same file>

Hairs keep the house rules: the hairline stays above the brows (eyes never covered), long hair ends above the belt.
"""
import bpy, bmesh, math, sys, argparse
from mathutils import Vector, Matrix, Euler

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--save", required=True)
ap.add_argument("--head", type=float, default=1.3)
ap.add_argument("--outline", type=float, default=0.019)
A = ap.parse_args(argv)

scene = bpy.context.scene
arm = bpy.data.objects["MartialArtistRig"]
saved = arm.animation_data.action if arm.animation_data else None
if arm.animation_data:
    arm.animation_data.action = None
for pb in arm.pose.bones:
    pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
arm.data.pose_position = "REST"
bpy.context.view_layer.update()

# ---- 1. the chest patch goes (the gi's collar now meets cleanly)
for n in ("chest_v", "chest_v_outline"):
    o = bpy.data.objects.get(n)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

OUTLINE = bpy.data.materials["OUTLINE"]
HAIR = bpy.data.materials["HAIR_NEUTRAL"]
HAIR_HI = bpy.data.materials.get("HAIR_NEUTRAL_HI") or HAIR
HEAD_C = Vector((0, 0, 1.12)); HA, HB, HC = 0.19, 0.18, 0.185
HAIRLINE = 1.262
PIVOT = arm.matrix_world @ arm.data.bones["head"].head_local
TEMPLATE = bpy.data.collections["L_hair-01"]


def to_hero(bm):
    """Batch 6 head space -> the hero v2 head (1.3x around the neck pivot)."""
    m = Matrix.Translation(PIVOT) @ Matrix.Diagonal((A.head, A.head, A.head, 1)) @ Matrix.Translation(-PIVOT)
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts)


def parent(ob, bone="head"):
    mw = ob.matrix_world.copy(); ob.parent = arm; ob.parent_type = "BONE"; ob.parent_bone = bone
    bpy.context.view_layer.update(); ob.matrix_world = mw


def put(c, name, bm, m=HAIR, outline=True):
    to_hero(bm)
    for f in bm.faces:
        f.smooth = True
    bm.normal_update()
    me = bpy.data.meshes.new(name); bm.to_mesh(me); me.materials.append(m)
    ob = bpy.data.objects.new(name, me); c.objects.link(ob); parent(ob)
    if outline:
        bo = bm.copy(); bo.normal_update()
        for v in bo.verts:
            v.co += v.normal * A.outline
        bmesh.ops.reverse_faces(bo, faces=bo.faces[:])
        mo = bpy.data.meshes.new(name + "_outline"); bo.to_mesh(mo); bo.free(); mo.materials.append(OUTLINE)
        oo = bpy.data.objects.new(name + "_outline", mo); c.objects.link(oo); parent(oo)
    bm.free()
    return ob


def ellipsoid(center, size, rot=(0, 0, 0), segs=16, rings=10):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm


def cone(base, direction, radius, length, segs=10):
    """A soft spike: a cone from `base` along `direction` (round-ish: the base sinks into the hair)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=radius, radius2=radius * 0.12, depth=length)
    d = Vector(direction).normalized()
    rot = d.to_track_quat("Z", "Y").to_matrix().to_4x4()
    m = Matrix.Translation(Vector(base) + d * (length / 2 - radius * 0.6)) @ rot
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm


def bisect_keep(bm, co, no):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=[-v for v in no], clear_outer=True); return bm


def front(x, z, inset=0.004):
    k = max(0.0, 1 - (x / HA) ** 2 - ((z - HEAD_C.z) / HC) ** 2)
    return -HB * math.sqrt(k) + inset


def cap(c, n, lift=0.0, grow=0.0, front_z=HAIRLINE):
    bm = ellipsoid(HEAD_C + Vector((0, 0.008, 0.012 + lift)), (0.203 + grow, 0.195 + grow, 0.2 + grow), segs=24, rings=16)
    bisect_keep(bm, (0, -0.19, front_z), (0, 0.38, 1)); put(c, f"{n}_cap", bm)


def back(c, n, grow=0.0, low=1.0):
    bm = ellipsoid(HEAD_C + Vector((0, 0.012, 0.005)), (0.2 + grow, 0.195 + grow, 0.197 + grow), segs=24, rings=16)
    bisect_keep(bm, (0, 0.04, 0), (0, 1, 0)); bisect_keep(bm, (0, 0, low), (0, 0, 1)); put(c, f"{n}_back", bm)


def sides(c, n, h=0.075, y=0.0, z=1.175):
    for x, s in ((1, "L"), (-1, "R")):
        put(c, f"{n}_side.{s}", ellipsoid((0.172 * x, y, z), (0.036, 0.06, h), rot=(0, 0, -12 * x)))


def bangs(c, n, count=5, z=1.272, width=0.15, size=(0.042, 0.02, 0.03), tilt=-30):
    """A straight fringe across the forehead, kept above the brows."""
    for i in range(count):
        t = i / (count - 1) * 2 - 1
        fx = t * width / 2
        put(c, f"{n}_bang{i}", ellipsoid((fx, front(fx, z, 0.0) - 0.004, z - abs(t) * 0.004), size, rot=(tilt, 0, -t * 14)))


STYLES = {}


def style(fn):
    STYLES[13 + len(STYLES)] = fn
    return fn


@style
def spiky(c, n):
    """spiky: short hair pulled up into soft spikes, the classic action-hero look"""
    cap(c, n, grow=0.004); back(c, n)
    spikes = [((0.0, 0.03), 0.06, 0.13), ((-0.09, 0.0), 0.055, 0.11), ((0.09, 0.0), 0.055, 0.11), ((-0.05, 0.09), 0.055, 0.12),
              ((0.05, 0.09), 0.055, 0.12), ((0.0, 0.14), 0.055, 0.11), ((-0.13, 0.08), 0.05, 0.09), ((0.13, 0.08), 0.05, 0.09),
              ((-0.06, -0.08), 0.045, 0.09), ((0.06, -0.08), 0.045, 0.09), ((0.0, -0.1), 0.05, 0.1)]
    for k, ((x, y), r, ln) in enumerate(spikes):
        zz = HEAD_C.z + math.sqrt(max(0.0, 0.2 ** 2 - x * x - y * y)) + 0.005
        base = Vector((x, y, zz))
        d = (base - HEAD_C).normalized() + Vector((0, 0.25 if y > 0 else -0.05, 0.6))
        put(c, f"{n}_spike{k}", cone(base, d, r, ln))


@style
def side_swept(c, n):
    """side-swept: short back and sides with a long fringe swept over to one side (above the brows)"""
    cap(c, n); back(c, n); sides(c, n, h=0.065)
    put(c, f"{n}_swoop", ellipsoid((0.02, front(0.02, 1.3, 0.0) - 0.006, 1.298), (0.14, 0.045, 0.05), rot=(-28, 0, -16), segs=18, rings=10))
    put(c, f"{n}_swoop2", ellipsoid((0.11, front(0.11, 1.27, 0.0) - 0.002, 1.268), (0.07, 0.035, 0.04), rot=(-25, 0, -40), segs=14, rings=8))
    put(c, f"{n}_top", ellipsoid(HEAD_C + Vector((-0.04, -0.02, 0.19)), (0.14, 0.12, 0.06), rot=(0, 0, -10), segs=16, rings=8))


@style
def long_straight(c, n):
    """long straight: hair to the shoulders with straight bangs, framing the face"""
    cap(c, n); back(c, n, grow=0.01, low=0.9)
    bm = ellipsoid((0, 0.075, 1.0), (0.215, 0.12, 0.24), segs=20, rings=12)
    bisect_keep(bm, (0, 0.0, 0), (0, 1, 0)); bisect_keep(bm, (0, 0, 0.82), (0, 0, 1)); put(c, f"{n}_curtain", bm)
    for x, s in ((1, "L"), (-1, "R")):
        put(c, f"{n}_panel.{s}", ellipsoid((0.182 * x, -0.02, 1.0), (0.034, 0.05, 0.2), rot=(4, 0, 4 * x), segs=14, rings=10))
    bangs(c, n)


@style
def high_ponytail(c, n):
    """high ponytail: hair pulled up into a long swinging ponytail, with side bangs"""
    cap(c, n); back(c, n)
    put(c, f"{n}_tie", ellipsoid((0, 0.16, 1.3), (0.04, 0.035, 0.04), segs=10, rings=6))
    put(c, f"{n}_tail1", ellipsoid((0, 0.235, 1.25), (0.06, 0.055, 0.09), rot=(38, 0, 0), segs=14, rings=8))
    put(c, f"{n}_tail2", ellipsoid((0, 0.27, 1.11), (0.055, 0.05, 0.1), rot=(12, 0, 0), segs=14, rings=8))
    put(c, f"{n}_tail3", ellipsoid((0, 0.275, 0.99), (0.04, 0.04, 0.07), rot=(-6, 0, 0), segs=12, rings=8))
    for x, s in ((1, "L"), (-1, "R")):
        put(c, f"{n}_bang.{s}", ellipsoid((0.11 * x, front(0.11 * x, 1.265, 0.0) - 0.002, 1.262), (0.06, 0.03, 0.05), rot=(-20, 0, 30 * x), segs=12, rings=8))


@style
def pigtails(c, n):
    """pigtails: hair parted in the middle and tied into two straight tails by the ears, with bangs"""
    cap(c, n); back(c, n)
    for x, s in ((1, "L"), (-1, "R")):
        put(c, f"{n}_tie.{s}", ellipsoid((0.185 * x, 0.06, 1.13), (0.028, 0.028, 0.03), segs=10, rings=6))
        put(c, f"{n}_tail.{s}", ellipsoid((0.215 * x, 0.07, 1.0), (0.05, 0.048, 0.12), rot=(0, 14 * x, 0), segs=14, rings=8))
        put(c, f"{n}_tip.{s}", ellipsoid((0.225 * x, 0.07, 0.89), (0.035, 0.035, 0.045), segs=10, rings=6))
    bangs(c, n, count=4, width=0.12)


@style
def bob(c, n):
    """bob: a rounded chin-length bob with straight bangs"""
    cap(c, n, grow=0.006)
    bm = ellipsoid(HEAD_C + Vector((0, 0.02, -0.005)), (0.222, 0.21, 0.215), segs=24, rings=16)
    bisect_keep(bm, (0, 0.0, 0), (0, 1, 0)); bisect_keep(bm, (0, 0, 0.98), (0, 0, 1)); put(c, f"{n}_shell", bm)
    for x, s in ((1, "L"), (-1, "R")):
        put(c, f"{n}_side.{s}", ellipsoid((0.185 * x, -0.03, 1.07), (0.038, 0.075, 0.1), rot=(0, 0, 4 * x), segs=14, rings=10))
    bangs(c, n, count=5, width=0.16)


# ---- 2. the new hair collections, set up like the existing ones
order0 = max(int(c.get("sprite_order", 0)) for c in bpy.data.collections if c.name.startswith("L_hair-"))
parent_coll = next((p for p in [scene.collection, *bpy.data.collections] if TEMPLATE.name in p.children), scene.collection)
for i, fn in STYLES.items():
    name = f"L_hair-{i:02d}"
    old = bpy.data.collections.get(name)
    if old:
        for ob in list(old.objects):
            bpy.data.objects.remove(ob, do_unlink=True)
        bpy.data.collections.remove(old)
    c = bpy.data.collections.new(name)
    parent_coll.children.link(c)
    for k, v in TEMPLATE.items():
        c[k] = v
    c["sprite_order"] = order0 + (i - 12)
    fn(c, f"h{i}")
    print("HAIR", i, fn.__name__, len(c.objects))

# the meta's option list and notes (for the art JSON)
import json
meta = json.loads(scene.get("sprite_meta", "{}"))
groups = meta.get("groups", {})
if "hair" in groups:
    groups["hair"] = sorted(set(groups["hair"]) | {f"hair-{i:02d}" for i in STYLES})
notes = meta.get("optionNotes", {})
for i, fn in STYLES.items():
    notes[f"hair-{i:02d}"] = fn.__doc__
if meta:
    meta["groups"] = groups; meta["optionNotes"] = notes
    scene["sprite_meta"] = json.dumps(meta)

arm.data.pose_position = "POSE"
if arm.animation_data:
    arm.animation_data.action = saved
bpy.ops.wm.save_as_mainfile(filepath=A.save)
print("HAIRS_ADDED")
