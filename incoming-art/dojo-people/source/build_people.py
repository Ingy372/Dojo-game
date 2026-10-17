"""
Dojo Ascent - Sensei, Senpai and Kohai (Art Director bot), Batch 7 SAMPLES.

Built on the approved Batch 6 player models (player-custom/source/player_custom_a.blend / _b.blend): the same rig,
camera, toon light, outline and belt layer set. Each character keeps:
  body  (untinted: skin, face, hair, beard in real colours - these characters don't change their look)
  gi    (tinted by the game, neutral light grey; a suggested colour is in the JSON)
  belt, belt-sheen, belt-center, belt-center-edge, belt-rim, belt-tape1(-edge), belt-tape2(-edge)  (exactly as the player)
Proportions: the whole rig is scaled (Sensei taller, Kohai smaller) and the head bone is scaled back the other way,
so the adult has a smaller head for his height and the small child a bigger one. Every outline is rebuilt so it stays
the house width (0.013 tiles) at the new size.
New actions for the samples: idle (relaxed standing), bow (Jay's rules: legs straight, the bend only from the hips,
head up, eyes forward), demonstrate (Sensei: a slow, clean block and punch), portrait (one still pose, facing the viewer).

    blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/dojo-people/source/build_people.py -- \
        --who sensei --out $PWD/incoming-art/dojo-people/source/sensei.blend
    (senpai: from player_custom_b.blend; kohai: from player_custom_a.blend)

All looks are PLACEHOLDERS for Jay (see the Delivery Note): skin, hair, gi colour and who looks like what.
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--who", required=True, choices=["sensei", "senpai", "kohai"]); ap.add_argument("--out", required=True)
A = ap.parse_args(argv)

# ------------------------------------------------------------------ the three looks (placeholders, flagged in DECIDE)
LOOKS = {
    "sensei": dict(base="a", scale=1.28, head=0.80, skin="#603926", hair="#8d8d96", hair_hi="#b4b4bc", face="face-03", hair_style="hair-01",
                   beard=True, gi="#24345e", belt="Black",
                   note="adult; tallest; calm almond eyes; close-cropped grey hair and a short, neat grey chin beard; dark navy gi; black belt"),
    "senpai": dict(base="b", scale=1.10, head=0.88, skin="#c98e65", hair="#3a2519", hair_hi="#5a3f2e", face="face-01", hair_style="high_ponytail",
                   beard=False, gi="#f2f2f2", belt="Black",
                   note="teen; a little taller than the player; high ponytail; white gi; black belt (brief: brown/black or black)"),
    "kohai":  dict(base="a", scale=0.84, head=1.06, skin="#efc3a4", hair="#b5482a", hair_hi="#d86a45", face="face-02", hair_style="hair-03",
                   beard=False, gi="#f2f2f2", belt="White",
                   note="small child; smallest, with a bigger head; big round eyes; curly red hair; white gi; white belt"),
}
L = LOOKS[A.who]
scene = bpy.context.scene
arm = bpy.data.objects["MartialArtistRig"]
OUTLINE = bpy.data.materials["OUTLINE"]; OUTLINE_W = 0.013
HEAD_C = Vector((0, 0, 1.12)); HA, HB, HC = 0.19, 0.18, 0.185

arm.animation_data.action = None
for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
arm.data.pose_position = "REST"; bpy.context.view_layer.update()

def C(name): return bpy.data.collections["L_" + name]
body = C("body")
def kill_coll(c):
    for ob in list(c.objects): bpy.data.objects.remove(ob, do_unlink=True)
    bpy.data.collections.remove(c)
def move_to_body(c):
    for ob in list(c.objects): c.objects.unlink(ob); body.objects.link(ob)
    bpy.data.collections.remove(c)

# ------------------------------------------------------------------ fixed looks: skin, face and hair go into body (real colours)
SKIN = toon_material(f"{A.who.upper()}_SKIN", L["skin"])
for ob in C("skin").objects:
    if ob.type == "MESH" and ob.data.materials and ob.data.materials[0] and ob.data.materials[0].name.startswith("SKIN_NEUTRAL"):
        ob.data.materials[0] = SKIN
for ob in body.objects:   # the hidden base skin pieces left in body (if any) take the same tone
    if ob.type == "MESH" and ob.data.materials and ob.data.materials[0] and ob.data.materials[0].name in ("SKIN", "SKIN_NEUTRAL"):
        ob.data.materials[0] = SKIN
move_to_body(C("skin"))
for c in [c for c in bpy.data.collections if c.name.startswith("L_face-")]:
    (move_to_body if c.name == "L_" + L["face"] else kill_coll)(c)
keep_hair = L["hair_style"] if L["hair_style"].startswith("hair-") else ("hair-02" if L["hair_style"] == "short" else None)
for c in [c for c in bpy.data.collections if c.name.startswith("L_hair-")]:
    (move_to_body if c.name == "L_" + str(keep_hair) else kill_coll)(c)
for p in ("prop-broom", "prop-rag"): kill_coll(C(p))

HAIR = toon_material(f"{A.who.upper()}_HAIR", L["hair"]); HAIR_HI = toon_material(f"{A.who.upper()}_HAIR_HI", L["hair_hi"])
for ob in body.objects:
    if ob.type == "MESH" and ob.data.materials and ob.data.materials[0]:
        n = ob.data.materials[0].name
        if n.startswith("HAIR_NEUTRAL_HI"): ob.data.materials[0] = HAIR_HI
        elif n.startswith("HAIR_NEUTRAL"): ob.data.materials[0] = HAIR

# helpers for new pieces (same as build_custom.py)
def parent(ob, bone="head"):
    mw = ob.matrix_world.copy(); ob.parent = arm; ob.parent_type = "BONE"; ob.parent_bone = bone
    bpy.context.view_layer.update(); ob.matrix_world = mw
def put(name, bm, m, outline=True, bone="head"):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = True
    bm.to_mesh(me); bm.free(); me.materials.append(m)
    ob = bpy.data.objects.new(name, me); body.objects.link(ob); parent(ob, bone)
    if outline:
        o = bpy.data.objects.new(name + "_outline", me.copy()); o.data.materials[0] = OUTLINE; body.objects.link(o); parent(o, bone)
    return ob
def ellipsoid(center, size, rot=(0, 0, 0), segs=16, rings=10):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm
def bisect_keep(bm, co, no):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=[-v for v in no], clear_outer=True); return bm

if L["hair_style"] == "high_ponytail":
    # high ponytail: smooth hair pulled back to a tie high on the back of the head; the tail falls behind the head.
    # A clear side silhouette (it swings out behind), and the hairline stays above the brows like every player style.
    bm = ellipsoid(HEAD_C + Vector((0, 0.008, 0.012)), (0.203, 0.195, 0.2), segs=24, rings=16); bisect_keep(bm, (0, -0.19, 1.262), (0, 0.38, 1)); put("hp_cap", bm, HAIR)
    bm = ellipsoid(HEAD_C + Vector((0, 0.012, 0.005)), (0.2, 0.195, 0.197), segs=24, rings=16); bisect_keep(bm, (0, 0.04, 0), (0, 1, 0)); bisect_keep(bm, (0, 0, 1.0), (0, 0, 1)); put("hp_back", bm, HAIR)
    for x, s in ((1, "L"), (-1, "R")):
        put(f"hp_side.{s}", ellipsoid((0.172 * x, 0.0, 1.175), (0.036, 0.06, 0.07), rot=(0, 0, -12 * x)), HAIR)
    put("hp_tie", ellipsoid((0, 0.17, 1.30), (0.04, 0.035, 0.04), segs=10, rings=6), HAIR_HI)
    for k, (y, z, sx, sz) in enumerate(((0.235, 1.29, 0.06, 0.06), (0.275, 1.21, 0.058, 0.07), (0.285, 1.12, 0.05, 0.065), (0.27, 1.04, 0.038, 0.05))):
        put(f"hp_tail{k}", ellipsoid((0, y, z), (sx, sx * 0.85, sz), rot=(18 - 12 * k, 0, 0), segs=12, rings=8), HAIR)
if L["beard"]:
    # a short, neat beard along the jaw and chin, with the mouth kept clear (kid-friendly, kind)
    # a thin shell over the lower jaw, from ear to ear, cut by a plane that rises towards the ears and passes under the mouth
    bm = ellipsoid(HEAD_C + Vector((0, 0, -0.004)), (0.199, 0.19, 0.192), segs=24, rings=16)
    bisect_keep(bm, (0, -0.17, 1.012), (0, 0.5, -1)); bisect_keep(bm, (0, 0.04, 0), (0, -1, 0)); bisect_keep(bm, (0, 0, 0.935), (0, 0, 1))
    put("beard_jaw", bm, HAIR)
    put("beard_chin", ellipsoid((0, -0.155, 0.978), (0.065, 0.04, 0.042), segs=12, rings=8), HAIR)
    for x, s in ((1, "L"), (-1, "R")):   # a short moustache that stops above the smile
        put(f"moustache.{s}", ellipsoid((0.03 * x, -0.172, 1.055), (0.034, 0.012, 0.011), rot=(0, 0, -10 * x), segs=10, rings=6), HAIR, outline=False)

# body B fix: build_custom.py shrank body B's ears with ob.scale, which scales about the world origin and so also moved them
# down to the jaw. Here the ears get their real size (0.85) about their own centre, in their place beside the eyes.
for side in ("L", "R"):
    ob = bpy.data.objects.get(f"ear.{side}")
    if ob is not None and abs(ob.scale[0] - 1.0) > 1e-6:
        f = ob.scale[0]; ob.scale = (1, 1, 1); bpy.context.view_layer.update()
        me = ob.data; cen = sum((v.co for v in me.vertices), Vector()) / len(me.vertices)
        for v in me.vertices: v.co = cen + (v.co - cen) * f
        o = bpy.data.objects.get(f"ear.{side}_outline")
        if o is not None: o.scale = (1, 1, 1)

# ------------------------------------------------------------------ layer order: body 0, gi 1, belt layers as the player
order = ["body", "gi", "belt", "belt-sheen", "belt-center", "belt-center-edge", "belt-rim", "belt-tape1-edge", "belt-tape1", "belt-tape2-edge", "belt-tape2"]
for i, n in enumerate(order): C(n)["sprite_order"] = i
assert sorted(c.name[2:] for c in bpy.data.collections if c.name.startswith("L_")) == sorted(order)

# ------------------------------------------------------------------ proportions + outlines at the house width
arm.scale = (L["scale"],) * 3
arm.pose.bones["head"].scale = (L["head"],) * 3
def under_head(ob): return ob.parent_type == "BONE" and ob.parent_bone == "head"
n_out = 0
for ob in [o for o in bpy.data.objects if o.name.endswith("_outline") and o.type == "MESH"]:
    src = bpy.data.objects.get(ob.name[:-len("_outline")])
    if src is None or src.type != "MESH": continue
    k = L["scale"] * (L["head"] if under_head(src) else 1.0)
    bm = bmesh.new(); bm.from_mesh(src.data); bm.normal_update()
    w = OUTLINE_W / k
    for v in bm.verts: v.co += v.normal * w
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(ob.name); bm.to_mesh(me); bm.free(); me.materials.append(OUTLINE)
    old = ob.data; ob.data = me
    if old.users == 0: bpy.data.meshes.remove(old)
    ob.matrix_parent_inverse = src.matrix_parent_inverse.copy(); ob.matrix_basis = src.matrix_basis.copy()
    n_out += 1
print("outlines rebuilt:", n_out)

# ------------------------------------------------------------------ actions (rig space, like build_character.py)
for act in list(bpy.data.actions): bpy.data.actions.remove(act)
PB = arm.pose.bones
REST = {"foot.L": Vector((0.085, 0, 0.07)), "foot.R": Vector((-0.085, 0, 0.07)), "hand.L": Vector((0.19, -0.01, 0.54)), "hand.R": Vector((-0.19, -0.01, 0.54))}
def to_local(bn, v): return arm.data.bones[bn].matrix_local.to_3x3().inverted() @ Vector(v)
def lerp(a, b, t): return a + (b - a) * t if isinstance(a, (int, float)) else tuple(x + (y - x) * t for x, y in zip(a, b))
def blend(p, q, t): return {k: lerp(p[k], q[k], t) for k in p}
ease = lambda x: 0.5 - 0.5 * math.cos(math.pi * x)
def pose(hips=(0, 0, 0), hips_rot=(0, 0, 0), chest_rot=(0, 0, 0), head_rot=(0, 0, 0), foot_l=(0.085, 0, 0.07), foot_r=(-0.085, 0, 0.07),
         foot_l_rot=(0, 0, 0), foot_r_rot=(0, 0, 0), hand_l=(0.19, -0.01, 0.54), hand_r=(-0.19, -0.01, 0.54)):
    return dict(hips=hips, hips_rot=hips_rot, chest_rot=chest_rot, head_rot=head_rot, foot_l=foot_l, foot_r=foot_r,
                foot_l_rot=foot_l_rot, foot_r_rot=foot_r_rot, hand_l=hand_l, hand_r=hand_r)
def apply(p, frame):
    def rot(pb, r): pb.rotation_euler = Euler([math.radians(v) for v in r], "XYZ"); pb.keyframe_insert("rotation_euler", frame=frame)
    def loc(pb, o): pb.location = to_local(pb.name, o); pb.keyframe_insert("location", frame=frame)
    loc(PB["hips"], p["hips"]); rot(PB["hips"], p["hips_rot"]); rot(PB["chest"], p["chest_rot"]); rot(PB["head"], p["head_rot"])
    loc(PB["foot_ik.L"], Vector(p["foot_l"]) - REST["foot.L"]); rot(PB["foot_ik.L"], p["foot_l_rot"])
    loc(PB["foot_ik.R"], Vector(p["foot_r"]) - REST["foot.R"]); rot(PB["foot_ik.R"], p["foot_r_rot"])
    loc(PB["hand_ik.L"], Vector(p["hand_l"]) - REST["hand.L"]); loc(PB["hand_ik.R"], Vector(p["hand_r"]) - REST["hand.R"])
def make_action(name, poses, fps, loop, info=None, tags=""):
    act = bpy.data.actions.new(name); act.use_fake_user = True
    arm.animation_data_create(); arm.animation_data.action = act
    for i, p in enumerate(poses): apply(p, i + 1)
    for fc in act.fcurves:
        for k in fc.keyframe_points: k.interpolation = "LINEAR"
    act["sprite_fps"] = fps; act["sprite_loop"] = loop; act["sprite_tags"] = tags
    act["sprite_order"] = len([a for a in bpy.data.actions if "sprite_fps" in a]) - 1
    if info: act["sprite_info"] = json.dumps(info)
    act.use_frame_range = True; act.frame_start, act.frame_end = 1, len(poses)
    return act

# IDLE: relaxed, natural standing (not a fighting stance). Head pitch -16 is the rig's "looking straight ahead" for the 35° camera.
if A.who == "sensei":      # standing tall and calm: feet a little apart, hands relaxed at the sides
    REL = pose(head_rot=(-16, 0, 0), foot_l=(0.09, 0.0, 0.07), foot_r=(-0.09, 0.0, 0.07), foot_l_rot=(0, 12, 0), foot_r_rot=(0, -12, 0),
               hand_l=(0.19, -0.015, 0.55), hand_r=(-0.19, -0.015, 0.55), hips=(0, 0, -0.002))
    SWAY = dict(chest=1.2, hips=0.004, side=0.0, hands=0.006)
elif A.who == "senpai":    # confident and friendly: weight a touch on one leg, one hand resting on the belt knot
    REL = pose(head_rot=(-16, 4, 2), hips=(0.012, 0, -0.006), hips_rot=(0, -4, -3), chest_rot=(0, 3, 2),
               foot_l=(0.10, -0.01, 0.07), foot_r=(-0.085, 0.02, 0.07), foot_l_rot=(0, 14, 0), foot_r_rot=(0, -18, 0),
               hand_l=(0.19, -0.02, 0.55), hand_r=(-0.08, -0.15, 0.60))
    SWAY = dict(chest=1.5, hips=0.005, side=0.004, hands=0.006)
else:                      # eager and a little shy: feet close, hands held together in front, a small bounce
    REL = pose(head_rot=(-14, 0, 0), hips=(0, 0, -0.004), chest_rot=(2, 0, 0),
               foot_l=(0.065, -0.01, 0.07), foot_r=(-0.065, -0.01, 0.07), foot_l_rot=(0, 6, 0), foot_r_rot=(0, -6, 0),
               hand_l=(0.025, -0.15, 0.56), hand_r=(-0.025, -0.155, 0.56))
    SWAY = dict(chest=2.0, hips=0.008, side=0.0, hands=0.01)
idle = []
for i in range(8):
    ph = 2 * math.pi * i / 8; b = math.sin(ph); c = (1 - math.cos(ph)) / 2
    p = dict(REL)
    p["hips"] = (REL["hips"][0] + SWAY["side"] * b, REL["hips"][1], REL["hips"][2] - SWAY["hips"] * c)
    p["chest_rot"] = (REL["chest_rot"][0] + SWAY["chest"] * b, REL["chest_rot"][1], REL["chest_rot"][2])
    p["head_rot"] = (REL["head_rot"][0] - 0.8 * b, REL["head_rot"][1], REL["head_rot"][2])
    p["hand_l"] = (REL["hand_l"][0], REL["hand_l"][1], REL["hand_l"][2] - SWAY["hands"] * c)
    p["hand_r"] = (REL["hand_r"][0], REL["hand_r"][1], REL["hand_r"][2] - SWAY["hands"] * (1 - math.cos(ph + 0.5)) / 2)
    idle.append(p)
make_action("idle", idle, 8, True, {"note": "relaxed natural standing, loop (sample)"})

# BOW (rei), the approved player bow and Jay's rules: heels together, legs straight (knee about 172°, not locked),
# a 30° bend only from the hips with a straight back, head up and eyes forward, hands at the sides of the thighs.
ATTN = pose(hips=(0, 0.0, -0.001), head_rot=(-16, 0, 0), foot_l=(0.05, 0.0, 0.07), foot_r=(-0.05, 0.0, 0.07),
            foot_l_rot=(0, 20, 0), foot_r_rot=(0, -20, 0), hand_l=(0.185, 0.0, 0.55), hand_r=(-0.185, 0.0, 0.55))
def bowed(t):
    p = dict(ATTN)
    p["hips"] = (0, 0.045 * t, -0.001 - 0.002 * t); p["hips_rot"] = (30 * t, 0, 0); p["head_rot"] = (-16 - 27 * t, 0, 0)
    p["hand_l"] = (0.185, -0.045 * t, 0.55 - 0.035 * t); p["hand_r"] = (-0.185, -0.045 * t, 0.55 - 0.035 * t)
    return p
bow = [REL, blend(REL, ATTN, 0.5), ATTN, ATTN]
bow += [bowed(ease(k / 5)) for k in range(1, 6)] + [bowed(1.0)] * 4 + [bowed(ease(1 - k / 5)) for k in range(1, 6)]
bow += [blend(ATTN, REL, 0.5), REL]
make_action("bow", bow, 16, False, {"keyFrames": {"feet_together": 2, "bow_down": "4-8", "bow_hold": "8-12", "rise": "13-17", "upright": 17},
            "note": "standing bow from the relaxed idle, 20 frames = 1.25 s; legs straight once the heels are together, the bend only from the hips, head up, eyes forward"},
            tags="feet_together:2,bow_hold:8-12,upright:17")

if A.who == "sensei":
    # DEMONSTRATE (sample): slow and clean, so a kid can copy it. From the relaxed stance he steps the left foot out to a
    # natural parallel stance (heiko-dachi, feet shoulder width), fists ready in front of the belt (yoi). Then:
    #   inside-to-outside middle block (uchi-uke) with the LEFT forearm, the right fist chambered at the right hip, palm up;
    #   a middle punch (chudan-zuki) with the RIGHT fist to the centre line at chest height, the left fist pulled back to
    #   the left hip (hikite) at the same time; elbow soft, never locked; shoulders level and down; a short hold (kime);
    # then back to yoi and the relaxed stance. 12 fps, 28 frames = 2.33 s.
    YOI = pose(head_rot=(-16, 0, 0), hips=(0, 0, -0.012), foot_l=(0.12, 0.0, 0.07), foot_r=(-0.12, 0.0, 0.07), foot_l_rot=(0, 4, 0), foot_r_rot=(0, -4, 0),
               hand_l=(0.085, -0.13, 0.60), hand_r=(-0.085, -0.13, 0.60))
    STEP = dict(YOI); STEP["foot_l"] = (0.105, 0.0, 0.10); STEP["hips"] = (-0.012, 0, -0.008)
    CHAMB = dict(YOI); CHAMB["hand_r"] = (-0.135, 0.035, 0.63); CHAMB["hand_l"] = (-0.09, -0.15, 0.66); CHAMB["chest_rot"] = (0, 6, 0)   # left fist crosses low to the right side
    BLOCK = dict(YOI); BLOCK["hand_r"] = (-0.135, 0.035, 0.63); BLOCK["hand_l"] = (0.17, -0.24, 0.90); BLOCK["chest_rot"] = (0, -8, 0)
    BLOCK["hips_rot"] = (0, -5, 0)
    PUNCH = dict(YOI); PUNCH["hand_l"] = (0.135, 0.035, 0.63); PUNCH["hand_r"] = (-0.01, -0.50, 0.80); PUNCH["chest_rot"] = (2, 8, 0); PUNCH["hips_rot"] = (0, 6, 0)
    PHOLD = dict(PUNCH); PHOLD["hand_r"] = (-0.01, -0.495, 0.797)
    demo = [REL, blend(REL, STEP, 0.6), STEP, blend(STEP, YOI, 0.6), YOI, YOI,
            blend(YOI, CHAMB, 0.5), CHAMB, blend(CHAMB, BLOCK, 0.5), BLOCK, BLOCK, BLOCK, BLOCK,
            blend(BLOCK, PUNCH, 0.35), blend(BLOCK, PUNCH, 0.75), PUNCH, PHOLD, PHOLD, PHOLD, PHOLD,
            blend(PUNCH, YOI, 0.4), blend(PUNCH, YOI, 0.8), YOI, YOI, blend(YOI, STEP, 0.5), STEP, blend(STEP, REL, 0.6), REL]
    make_action("demonstrate", demo, 12, False,
                {"keyFrames": {"ready": "4-5", "block": "9-12", "punch": 15, "kime_hold": "15-19", "ready_again": "22-23"},
                 "note": "slow demonstration (sample): parallel stance, left inside-to-outside middle block, then right middle punch with hikite; once"},
                tags="block:9-12,punch:15")

# PORTRAIT: one still pose for the speech-card portrait (facing the viewer, head level for a front camera)
PORT = dict(REL); PORT["head_rot"] = (-2, 0, 0); PORT["hips_rot"] = (0, 0, 0); PORT["chest_rot"] = (0, 0, 0); PORT["hips"] = (0, 0, REL["hips"][2])
if A.who == "senpai": PORT["head_rot"] = (-2, 0, 3)
make_action("portrait", [PORT], 1, False, {"note": "portrait still (rendered with the portrait camera, see README)"})

# ------------------------------------------------------------------ restore and write the meta
arm.data.pose_position = "POSE"; arm.animation_data.action = bpy.data.actions["idle"]
meta = json.loads(scene.get("sprite_meta", "{}"))
for k in ("palettes", "palettesDraftLabels", "groups", "optionNotes"): meta.pop(k, None)
tg = meta.get("tintGuidance", {}); tg.pop("skin", None); tg.pop("hair", None)
tg["gi"] = f"multiply by this character's gi colour; suggested placeholder {L['gi']}"
meta["character"] = A.who
meta["suggested"] = dict(gi=L["gi"], belt=L["belt"], note="PLACEHOLDER look for the samples; the game sets the real belt (beltStyles) and gi colour")
meta["lookNote"] = L["note"]
meta["proportions"] = dict(rigScale=L["scale"], headScale=L["head"], note="the whole rig is scaled; the head bone is scaled back so heads stay a similar size")
scene["sprite_meta"] = json.dumps(meta)
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out)
