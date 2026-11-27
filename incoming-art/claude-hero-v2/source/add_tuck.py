"""
Opening cutscene (Jay, Nov 27: "tuck into gi"): the light piece floats down, the hero catches it in cupped hands,
looks at it, then tucks it inside the front of the gi and pats it. Adds to a hero v2 model:

  - a `shard` bone (child of root, like the broom) and an `L_prop-shard` layer: a small glowing gold crystal
    with a dark-gold outline and a soft light rim, drawn without tint and only in this animation;
  - the `tuck` action (36 frames at 12 fps = 3.0 s, starts and ends on the guard so it flows from idle and into
    the walk);
  - a hidden (scale 0) shard key in every other action, so the new layer never shows (or cuts holes) elsewhere.

Re-runnable: an existing shard bone, layer or tuck action is replaced.

    blender -b player_hero2_a.blend -P add_tuck.py -- --save <path>.blend
"""
import bpy, bmesh, math, sys, json, os
from mathutils import Vector, Euler, Matrix

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material, hull_material, OUTLINE_W  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SAVE = argv[argv.index("--save") + 1] if "--save" in argv else None

arm = bpy.data.objects["MartialArtistRig"]
SHARD_REST = Vector((0, 0, 0.9))

# ------------------------------------------------------------------ bone
bpy.context.view_layer.objects.active = arm
for o in bpy.context.view_layer.objects:
    o.select_set(o == arm)
bpy.ops.object.mode_set(mode="EDIT")
eb = arm.data.edit_bones
if "shard" in eb:
    eb.remove(eb["shard"])
b = eb.new("shard")
b.head = SHARD_REST
b.tail = SHARD_REST + Vector((0, 0, 0.12))
b.parent = eb["root"]
b.use_deform = False
bpy.ops.object.mode_set(mode="OBJECT")
PB = arm.pose.bones
PB["shard"].rotation_mode = "XYZ"

# ------------------------------------------------------------------ layer + mesh
if "L_prop-shard" in bpy.data.collections:
    old = bpy.data.collections["L_prop-shard"]
    for o in list(old.all_objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.collections.remove(old)
coll = bpy.data.collections.new("L_prop-shard")
coll["sprite_order"] = 38          # on top: the shard is held in front of the body
coll["sprite_tint"] = False
coll["sprite_overlay"] = False
# link next to the other prop layers
parent_coll = next((c for c in bpy.data.collections if "L_prop-rag" in c.children.keys()), bpy.context.scene.collection)
parent_coll.children.link(coll)


def diamond(h_top, h_bot, r, n=6, z0=0.0):
    bm = bmesh.new()
    top = bm.verts.new((0, 0, z0 + h_top))
    bot = bm.verts.new((0, 0, z0 - h_bot))
    ring = [bm.verts.new((r * math.cos(2 * math.pi * i / n), r * 0.8 * math.sin(2 * math.pi * i / n), z0))
            for i in range(n)]
    for i in range(n):
        a, c = ring[i], ring[(i + 1) % n]
        bm.faces.new((a, c, top))
        bm.faces.new((c, a, bot))
    bm.normal_update()
    return bm


def mesh_obj(name, bm, mat):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    ob.location = SHARD_REST
    ob.parent = arm
    ob.parent_type = "BONE"
    ob.parent_bone = "shard"
    bpy.context.view_layer.update()
    ob.matrix_world = Matrix.Translation(SHARD_REST)
    return ob


def hull(src, mat, width, suffix):
    bm = bmesh.new()
    bm.from_mesh(src.data)
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * width
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    return mesh_obj(src.name + suffix, bm, mat)


gold = toon_material("SHARD_GOLD", "#ffd166", shadow=0.86, highlight=1.35)
core = toon_material("SHARD_CORE", "#fff6d0", shadow=0.95, highlight=1.2)
body = mesh_obj("shard_body", diamond(0.13, 0.09, 0.055), gold)
# a bright inner facet so it reads as glowing, not as a gold nugget
shine = mesh_obj("shard_shine", diamond(0.085, 0.05, 0.026, z0=0.012), core)
shine.data.transform(Matrix.Translation((0, -0.03, 0)))
hull(body, hull_material("SHARD_RIM", "#8a5a12"), OUTLINE_W, "_outline")
hull(body, hull_material("SHARD_GLOW", "#fff1b8"), OUTLINE_W + 0.03, "_glow")

# ------------------------------------------------------------------ helpers (same conventions as build_character.py)
REST = {n: arm.data.bones[n].head_local.copy() for n in ("foot_ik.L", "foot_ik.R", "hand_ik.L", "hand_ik.R")}


def to_local(name, offset):
    return arm.data.bones[name].matrix_local.to_3x3().inverted() @ Vector(offset)


def lerp(a, b, t):
    if isinstance(a, tuple):
        return tuple(x + (y - x) * t for x, y in zip(a, b))
    return a + (b - a) * t


def blend(p, q, t):
    return {k: lerp(p[k], q[k], t) for k in p}


def ease(t):
    return t * t * (3 - 2 * t)


def pose(hips=(0, 0, 0), hips_rot=(0, 0, 0), chest_rot=(0, 0, 0), head_rot=(0, 0, 0),
         foot_l=(0.085, 0, 0.07), foot_r=(-0.085, 0, 0.07), foot_l_rot=(0, 0, 0), foot_r_rot=(0, 0, 0),
         hand_l=(0.19, -0.01, 0.54), hand_r=(-0.19, -0.01, 0.54), shard=(0, 0, 0.9, 0, 0.0)):
    """shard: (x, y, z, spin degrees, scale) in root space; scale 0 = hidden."""
    return dict(hips=hips, hips_rot=hips_rot, chest_rot=chest_rot, head_rot=head_rot, foot_l=foot_l, foot_r=foot_r,
                foot_l_rot=foot_l_rot, foot_r_rot=foot_r_rot, hand_l=hand_l, hand_r=hand_r, shard=shard)


def key_shard(v, frame):
    pb = PB["shard"]
    pb.location = to_local("shard", Vector(v[:3]) - SHARD_REST)
    pb.keyframe_insert("location", frame=frame)
    pb.rotation_euler = Euler((0, math.radians(v[3]), 0), "XYZ")   # bone Y is up: a spin round the vertical
    pb.keyframe_insert("rotation_euler", frame=frame)
    pb.scale = (v[4],) * 3
    pb.keyframe_insert("scale", frame=frame)


def apply(p, frame):
    def rot(pb, r):
        pb.rotation_euler = Euler([math.radians(v) for v in r], "XYZ")
        pb.keyframe_insert("rotation_euler", frame=frame)

    def loc(pb, offset):
        pb.location = to_local(pb.name, offset)
        pb.keyframe_insert("location", frame=frame)

    loc(PB["hips"], p["hips"])
    rot(PB["hips"], p["hips_rot"]); rot(PB["chest"], p["chest_rot"]); rot(PB["head"], p["head_rot"])
    loc(PB["foot_ik.L"], Vector(p["foot_l"]) - REST["foot_ik.L"]); rot(PB["foot_ik.L"], p["foot_l_rot"])
    loc(PB["foot_ik.R"], Vector(p["foot_r"]) - REST["foot_ik.R"]); rot(PB["foot_ik.R"], p["foot_r_rot"])
    loc(PB["hand_ik.L"], Vector(p["hand_l"]) - REST["hand_ik.L"])
    loc(PB["hand_ik.R"], Vector(p["hand_r"]) - REST["hand_ik.R"])
    for nm in ("broom", "rag"):   # the other props stay hidden
        PB[nm].location = (0, 0, 0); PB[nm].keyframe_insert("location", frame=frame)
        PB[nm].rotation_euler = (0, 0, 0); PB[nm].keyframe_insert("rotation_euler", frame=frame)
        PB[nm].scale = (0, 0, 0); PB[nm].keyframe_insert("scale", frame=frame)
    key_shard(p["shard"], frame)


def all_fcurves(act):
    if hasattr(act, "layers") and len(act.layers):
        out = []
        for L in act.layers:
            for s in L.strips:
                for cb in s.channelbags:
                    out += list(cb.fcurves)
        return out
    return list(getattr(act, "fcurves", []))


# ------------------------------------------------------------------ hide the shard in every other action
arm.animation_data_create()
for act in list(bpy.data.actions):
    if act.name == "tuck" or "sprite_fps" not in act:
        continue
    arm.animation_data.action = act
    if hasattr(arm.animation_data, "action_slot") and act.slots:
        arm.animation_data.action_slot = act.slots[0]
    f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
    for f in range(f0, f1 + 1):
        key_shard((0, 0, 0.9, 0, 0.0), f)
    for fc in all_fcurves(act):
        if 'pose.bones["shard"]' in fc.data_path:
            for k in fc.keyframe_points:
                k.interpolation = "LINEAR"

# ------------------------------------------------------------------ the tuck action
if "tuck" in bpy.data.actions:
    bpy.data.actions.remove(bpy.data.actions["tuck"])

HIDDEN = (0, -0.25, 1.8, 0, 0.0)
# idle frame 0 (the guard), exactly as build_character.py's STANCE
STANCE = pose(hips=(0.0, 0.0, -0.035), hips_rot=(4, -14, 0), chest_rot=(2, -6, 0), head_rot=(-17, 18, 0),
              foot_l=(0.10, -0.11, 0.07), foot_r=(-0.11, 0.11, 0.07), foot_l_rot=(0, 8, 0), foot_r_rot=(0, -38, 0),
              hand_l=(0.085, -0.27, 0.87), hand_r=(-0.05, -0.20, 0.85), shard=HIDDEN)
# square to the front, feet under the hips, standing tall
SQUARE = dict(hips=(0, 0, -0.02), hips_rot=(2, 0, 0), chest_rot=(0, 0, 0),
              foot_l=(0.095, -0.01, 0.07), foot_r=(-0.095, 0.01, 0.07), foot_l_rot=(0, 8, 0), foot_r_rot=(0, -8, 0))


def sq(**kw):
    d = dict(SQUARE)
    d.update(kw)
    return pose(**d)


KEYS = [
    # frame, pose
    (1, STANCE),
    # squares up and looks up; the light appears high above
    (4, sq(head_rot=(-34, 0, 0), chest_rot=(-5, 0, 0),
           hand_l=(0.12, -0.20, 0.82), hand_r=(-0.12, -0.20, 0.82), shard=(0.34, -0.30, 1.80, 0, 1.0))),
    # hands come up together, cupped, at chin height
    (7, sq(head_rot=(-36, 0, 0), chest_rot=(-6, 0, 0), hips=(0, 0, -0.015),
           hand_l=(0.06, -0.27, 0.92), hand_r=(-0.06, -0.27, 0.92), shard=(0.22, -0.30, 1.40, 60, 1.0))),
    # the light settles into the hands
    (10, sq(head_rot=(-26, 0, 0), chest_rot=(-3, 0, 0), hips=(0, 0, -0.02),
            hand_l=(0.045, -0.27, 0.93), hand_r=(-0.045, -0.27, 0.93), shard=(0.06, -0.29, 1.03, 120, 1.0))),
    # caught: a small dip as it lands
    (11, sq(head_rot=(-20, 0, 0), hips=(0, 0, -0.05),
            hand_l=(0.045, -0.27, 0.87), hand_r=(-0.045, -0.27, 0.87), shard=(0, -0.28, 0.95, 135, 1.0))),
    # brings it in to look at it
    (14, sq(head_rot=(-15, 0, 0), chest_rot=(3, 0, 0), hips=(0, 0, -0.03),
            hand_l=(0.05, -0.25, 0.76), hand_r=(-0.05, -0.25, 0.76), shard=(0, -0.26, 0.83, 180, 1.0))),
    # holds it and looks, a little head tilt
    (18, sq(head_rot=(-14, 0, 7), chest_rot=(3, 0, 0), hips=(0, 0, -0.03),
            hand_l=(0.05, -0.25, 0.77), hand_r=(-0.05, -0.25, 0.77), shard=(0, -0.26, 0.84, 240, 1.0))),
    (21, sq(head_rot=(-16, 0, -4), chest_rot=(2, 0, 0), hips=(0, 0, -0.03),
            hand_l=(0.05, -0.25, 0.76), hand_r=(-0.05, -0.25, 0.76), shard=(0, -0.26, 0.83, 300, 1.0))),
    # the right hand carries it to the gi's lapel; the left hand lets go
    (24, sq(head_rot=(-12, 0, 0), chest_rot=(4, 0, 0), hips=(0, 0, -0.03),
            hand_l=(0.17, -0.08, 0.62), hand_r=(0.03, -0.17, 0.72), shard=(0.04, -0.18, 0.76, 330, 1.0))),
    # slips it inside the gi
    (26, sq(head_rot=(-11, 0, 0), chest_rot=(5, 0, 0), hips=(0, 0, -0.03),
            hand_l=(0.18, -0.04, 0.58), hand_r=(0.06, -0.12, 0.70), shard=(0.07, -0.11, 0.73, 345, 0.55))),
    (27, sq(head_rot=(-12, 0, 0), chest_rot=(4, 0, 0), hips=(0, 0, -0.03),
            hand_l=(0.18, -0.04, 0.58), hand_r=(0.06, -0.13, 0.70), shard=(0.07, -0.09, 0.72, 350, 0.0))),
    # pats it, nods, looks up with purpose
    (29, sq(head_rot=(-9, 0, 0), chest_rot=(2, 0, 0), hips=(0, 0, -0.025),
            hand_l=(0.18, -0.04, 0.58), hand_r=(0.06, -0.16, 0.71), shard=(0.07, -0.09, 0.72, 350, 0.0))),
    (30, sq(head_rot=(-16, 0, 0), chest_rot=(1, 0, 0), hips=(0, 0, -0.02),
            hand_l=(0.18, -0.04, 0.58), hand_r=(0.06, -0.13, 0.70), shard=(0.07, -0.09, 0.72, 350, 0.0))),
    (32, sq(head_rot=(-18, 0, 0), chest_rot=(0, 0, 0), hips=(0, 0, -0.02),
            hand_l=(0.17, -0.06, 0.62), hand_r=(-0.02, -0.14, 0.80), shard=(0.07, -0.09, 0.72, 350, 0.0))),
    # back to the guard
    (36, dict(STANCE, shard=(0.07, -0.09, 0.72, 350, 0.0))),
]

frames = []
for (fa, pa), (fb, pb_) in zip(KEYS, KEYS[1:]):
    for f in range(fa, fb):
        frames.append(blend(pa, pb_, ease((f - fa) / (fb - fa))))
frames.append(KEYS[-1][1])
# the light drifts down beside the hero (not across the face) and curves in to the cupped hands
DRIFT = [(0.34, -0.30, 1.80), (0.33, -0.30, 1.68), (0.30, -0.30, 1.55), (0.25, -0.30, 1.40),
         (0.18, -0.30, 1.25), (0.11, -0.29, 1.12), (0.05, -0.29, 1.02)]
for f in range(4, 11):
    frames[f - 1]["shard"] = (*DRIFT[f - 4], 20 * (f - 4), 1.0)
frames[0]["shard"] = (0.34, -0.30, 1.80, 0, 0.0)
frames[1]["shard"] = (0.34, -0.30, 1.80, 0, 0.45)
frames[2]["shard"] = (0.34, -0.30, 1.80, 0, 0.85)

act = bpy.data.actions.new("tuck")
act.use_fake_user = True
arm.animation_data.action = act
for i, p in enumerate(frames):
    apply(p, i + 1)
for fc in all_fcurves(act):
    for k in fc.keyframe_points:
        k.interpolation = "LINEAR"
act["sprite_fps"] = 12
act["sprite_loop"] = False
act["sprite_tags"] = "look_up:4,catch:11,admire:14-21,tuck:24-27,pat:29"
act["sprite_order"] = max(int(a.get("sprite_order", 0)) for a in bpy.data.actions if "sprite_fps" in a and a != act) + 1
act["sprite_info"] = json.dumps({
    "keyFrames": {"look_up": 4, "catch": 11, "admire": "14-21", "tuck": "24-27", "pat": 29},
    "props": ["prop-shard"],
    "note": "opening cutscene, 36 frames = 3.0 s at 12 fps: the light piece floats down (appears over frames 0-2), "
            "the hero catches it in cupped hands (frame 10), looks at it, tucks it inside the gi (gone from frame 26) "
            "and pats it, then returns to the guard. Draw prop-shard (no tint); play once, facing S.",
})
act.use_frame_range = True
act.frame_start, act.frame_end = 1, len(frames)

# leave the model on the walk, as it was
if "walk" in bpy.data.actions:
    arm.animation_data.action = bpy.data.actions["walk"]
print("TUCK_DONE", len(frames), "frames")
if SAVE:
    bpy.ops.wm.save_as_mainfile(filepath=SAVE)
