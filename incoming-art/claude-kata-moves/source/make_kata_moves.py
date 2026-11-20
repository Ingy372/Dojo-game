"""Claude's kata moves and stances draft (2026-11-20) for the hero, body A or B. NOT in the game yet.

Adds the kata techniques and the three stances to a COPY of the approved player_custom_<a|b>.blend.
Nothing already in the rig changes: same model, layers and camera, so the moves match the rest of the
hero's art. One new thing: a small `hand.L` / `hand.R` bone at each wrist (the fist meshes now hang
from it), so a hand can open into a knife hand or spear hand (stretched and flattened) and turn palm
up or down. Every action here keys the hand bones on every frame; the older actions never touch them.

    blender -b incoming-art/player-custom/source/player_custom_a.blend \
        -P incoming-art/claude-kata-moves/source/make_kata_moves.py -- --save incoming-art/claude-kata-moves/source/player_kata_a.blend

The moves are shown with the LEFT foot forward. The other side is the same picture mirrored (the game can
flip the sprite and use the mirrored direction row), so one render covers both sides of a kata.

Rig (pose space; every control bone points up): location x = the character's left(+)/right(-),
y = up, z = forward. Hand and foot targets below are written in world terms (metres, the hero is about
1.3 tall, shoulders at 0.895, hips at 0.55, rest hand targets at x +-0.19, height 0.54) and converted.
"""
import bpy, math, sys, json

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SAVE = argv[argv.index("--save") + 1]
ONLY = argv[argv.index("--only") + 1].split(",") if "--only" in argv else None

D = math.radians
rig = bpy.data.objects["MartialArtistRig"]
SIGN = {"L": 1.0, "R": -1.0}

# ------------------------------------------------------------------ the new wrist bones
def add_hand_bones():
    if "hand.L" in rig.data.bones:
        return
    bpy.context.view_layer.objects.active = rig
    for o in bpy.context.selected_objects:
        o.select_set(False)
    rig.select_set(True)
    rig.data.pose_position = "REST"
    bpy.context.view_layer.update()
    saved = {}
    for o in bpy.data.objects:
        if o.parent == rig and o.parent_type == "BONE" and o.parent_bone in ("forearm.L", "forearm.R") and o.name.startswith("fist"):
            saved[o.name] = o.matrix_world.copy()
    bpy.ops.object.mode_set(mode="EDIT")
    eb = rig.data.edit_bones
    for s in ("L", "R"):
        fa = eb["forearm." + s]
        d = (fa.tail - fa.head).normalized()
        h = eb.new("hand." + s)
        h.head = fa.tail.copy()
        h.tail = fa.tail + d * 0.06
        h.roll = fa.roll
        h.parent = fa
        h.use_connect = False
        h.use_deform = False
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.context.view_layer.update()
    for name, mw in saved.items():
        o = bpy.data.objects[name]
        o.parent_bone = "hand." + name.split(".")[1][0]
        bpy.context.view_layer.update()
        o.matrix_world = mw
    rig.data.pose_position = "POSE"
    bpy.context.view_layer.update()
    print("hand bones added; reparented", sorted(saved))

add_hand_bones()

# ------------------------------------------------------------------ pose helpers
REST_HAND = {"L": (0.19, -0.01, 0.54), "R": (-0.19, -0.01, 0.54)}
REST_FOOT = {"L": 0.085, "R": -0.085}

def hand(side, out, z, fwd):
    """A hand target: `out` = sideways away from the body's middle on that hand's side (negative = across
    the body), `z` = height above the floor, `fwd` = in front of the feet."""
    wx = SIGN[side] * out
    return {("hand_ik." + side, "location"): (wx - REST_HAND[side][0], z - REST_HAND[side][2], fwd + REST_HAND[side][1] * -1)}

def foot(side, out, fwd, up=0.0, turn_out=0.0, pitch=0.0):
    """A foot: `turn_out` in degrees (toes outward), `pitch` in radians (+ = heel up)."""
    s = SIGN[side]
    return {("foot_ik." + side, "location"): (s * out - REST_FOOT[side], up, fwd),
            ("foot_ik." + side, "rotation_euler"): (pitch, s * D(turn_out), 0.0)}

def body(drop, fwd=0.0, twist=0.0, lean=0.0, chest_twist=None, look=0.0, side_tilt=0.0):
    """Hips lowered by `drop`, moved forward by `fwd`, turned `twist` degrees (+ = right shoulder forward),
    leaning forward `lean` degrees. The chest adds a little more turn; the head turns back to look ahead."""
    ct = twist * 0.45 if chest_twist is None else chest_twist
    return {("hips", "location"): (0.0, -drop, fwd),
            ("hips", "rotation_euler"): (0.07 + D(lean), D(twist), D(side_tilt)),
            ("chest", "rotation_euler"): (0.035, D(ct), 0.0),
            ("head", "rotation_euler"): (-0.297 - D(lean) * 0.6, -D(twist + ct) + D(look), 0.0)}

FIST = (1.0, 1.0, 1.0)
OPEN = (0.55, 1.75, 0.95)          # stretched along the forearm and flattened: an open hand, fingers together
def hands(l_shape=FIST, r_shape=FIST, l_roll=0.0, r_roll=0.0):
    """Hand shape (scale) and roll in degrees around the forearm (palm turning)."""
    return {("hand.L", "scale"): l_shape, ("hand.R", "scale"): r_shape,
            ("hand.L", "rotation_euler"): (0.0, D(l_roll), 0.0), ("hand.R", "rotation_euler"): (0.0, D(r_roll), 0.0)}

def elbows(l=(0.0, 0.0, 0.0), r=(0.0, 0.0, 0.0)):
    """Moves the elbow pole targets (where each elbow points) in the chest's space: (out, up, forward)."""
    return {("elbow_pole.L", "location"): (l[0], l[1], l[2]), ("elbow_pole.R", "location"): (-r[0], r[1], r[2])}

def P(*parts):
    out = {}
    for p in parts:
        out.update(p)
    return out

# Front stance (zenkutsu): left foot forward with the knee over the ankle, back leg nearly straight,
# back foot turned out about 35 degrees, feet about hip width apart side to side.
def front_stance(twist=-20.0, drop=0.11, fwd=0.05):
    return P(body(drop, fwd, twist), foot("L", 0.10, 0.30, turn_out=5), foot("R", 0.10, -0.26, turn_out=35))

HIP_R = hand("R", 0.15, 0.585, -0.06)        # right fist pulled back to the hip (hikite)
HIP_L = hand("L", 0.15, 0.585, -0.06)

# ------------------------------------------------------------------ action builder
CHANNELS = [("hips", "location"), ("hips", "rotation_euler"), ("chest", "rotation_euler"), ("head", "rotation_euler"),
            ("hand_ik.L", "location"), ("hand_ik.R", "location"), ("foot_ik.L", "location"), ("foot_ik.L", "rotation_euler"),
            ("foot_ik.R", "location"), ("foot_ik.R", "rotation_euler"), ("elbow_pole.L", "location"), ("elbow_pole.R", "location"), ("knee_pole.L", "location"), ("knee_pole.R", "location"),
            ("hand.L", "scale"), ("hand.R", "scale"), ("hand.L", "rotation_euler"), ("hand.R", "rotation_euler")]
def knees(out=0.0):
    """Pushes both knees outward (moves the knee pole targets sideways, in each foot's space)."""
    return {("knee_pole.L", "location"): (out, 0.0, 0.0), ("knee_pole.R", "location"): (-out, 0.0, 0.0)}

NEUTRAL = P(hands(), elbows(), knees())

def ease(t, kind):
    if kind == "snap":                      # fast out, soft landing: strikes and blocks
        return 1 - (1 - t) ** 3
    if kind == "lin":
        return t
    return t * t * (3 - 2 * t)              # smooth

def lerp(a, b, t):
    return tuple(x + (y - x) * t for x, y in zip(a, b))

def make(name, keys, fps, order, loop=False, tags="", info=None, breathe=None):
    """keys: [(frame, pose, ease into this key)], frames from 1. Every frame of every channel is keyed.
    breathe(frame, channel, value) may add a small loop motion (stances)."""
    if ONLY and name not in ONLY:
        return
    old = bpy.data.actions.get(name)
    if old:
        bpy.data.actions.remove(old)
    act = bpy.data.actions.new(name)
    act.use_fake_user = True
    rig.animation_data.action = act
    n = keys[-1][0]
    full = []
    prev = P(NEUTRAL, keys[0][1])
    for f, pose, _ in keys:
        prev = P(prev, pose)
        full.append((f, dict(prev)))
    for frame in range(1, n + 1):
        i = max(k for k in range(len(full)) if full[k][0] <= frame)
        f0, p0 = full[i]
        if frame == f0 or i == len(full) - 1:
            pose = p0
            t = 0.0
        else:
            f1, p1 = full[i + 1]
            t = ease((frame - f0) / (f1 - f0), keys[i + 1][2])
            pose = {c: lerp(p0[c], p1[c], t) for c in p0}
        for (bone, prop) in CHANNELS:
            v = pose.get((bone, prop))
            if v is None:
                continue
            if breathe:
                v = breathe(frame, (bone, prop), v)
            pb = rig.pose.bones[bone]
            setattr(pb, prop, v)
            pb.keyframe_insert(prop, frame=frame)
        for prop in ("broom", "rag"):             # props stay hidden, as in every other animation
            b = rig.pose.bones[prop]
            b.scale = (0.0, 0.0, 0.0)
            b.keyframe_insert("scale", frame=frame)
    act.frame_range = (1, n)
    act.use_frame_range = True
    act["sprite_fps"] = fps
    act["sprite_loop"] = loop
    act["sprite_tags"] = tags
    act["sprite_order"] = order
    act["sprite_info"] = json.dumps(info or {})
    print("made", name, n, "frames")

def breathing(amount=1.0, frames=12):
    def fn(frame, ch, v):
        s = math.sin(2 * math.pi * (frame - 1) / frames)
        if ch == ("hips", "location"):
            return (v[0], v[1] - 0.004 * amount * (0.5 + 0.5 * s), v[2])
        if ch == ("chest", "rotation_euler"):
            return (v[0] - 0.02 * amount * s, v[1], v[2])
        if ch[0].startswith("hand_ik") and ch[1] == "location":
            return (v[0], v[1] + 0.005 * amount * s, v[2])
        return v
    return fn

ORDER = 40
def nxt():
    global ORDER
    ORDER += 1
    return ORDER

# ================================================================== stances (loops)
# Open Leg Stance (the kata ready stance): feet about shoulder width, toes turned out a little, knees soft,
# fists closed in front of the belt about a fist apart, eyes ahead.
OPEN_LEG = P(body(0.015, 0.0, 0.0), foot("L", 0.16, 0.0, turn_out=15), foot("R", 0.16, 0.0, turn_out=15),
             hand("L", 0.075, 0.50, 0.13), hand("R", 0.075, 0.50, 0.13))
make("kata_open_leg", [(1, OPEN_LEG, "smooth"), (12, OPEN_LEG, "smooth")], 8, nxt(), loop=True, breathe=breathing(1.0, 12),
     info={"stance": "open-leg", "note": "Open Leg Stance (the kata ready stance) loop, 1.5 s: feet about shoulder width, toes turned out a little, knees soft, fists in front of the belt. Slow breathing; feet never move"})

# Front stance, held with the hands in a forward guard (lead fist out at chest height, rear fist at the hip).
FRONT = P(front_stance(-20), hand("L", 0.06, 0.70, 0.36), HIP_R)
make("stance_front", [(1, FRONT, "smooth"), (12, FRONT, "smooth")], 8, nxt(), loop=True, breathe=breathing(1.0, 12),
     info={"stance": "front", "note": "Front stance loop, 1.5 s: left foot forward, front knee over the ankle, back leg nearly straight with the back foot turned out, hips low. Lead fist forward, rear fist at the hip"})

# Horse stance (kiba dachi): feet wide and parallel (about two shoulder widths), knees bent and pushed out,
# hips sunk straight down, back upright, both fists chambered at the hips.
HORSE = P(body(0.13, 0.0, 0.0), foot("L", 0.23, 0.0, turn_out=2), foot("R", 0.23, 0.0, turn_out=2),
          hand("L", 0.15, 0.555, -0.05), hand("R", 0.15, 0.555, -0.05), elbows((0.06, 0.0, 0.0), (0.06, 0.0, 0.0)), knees(0.45))
make("stance_horse", [(1, HORSE, "smooth"), (12, HORSE, "smooth")], 8, nxt(), loop=True, breathe=breathing(1.0, 12),
     info={"stance": "horse", "note": "Horse stance loop, 1.5 s: feet wide and parallel, knees bent and pushed out, hips sunk, back upright, fists chambered at the hips"})

# Cat stance (neko ashi dachi): nearly all the weight on the bent back leg (back foot turned out under the hips),
# the front foot only touching with the ball, heel up; hips set back, a forward guard.
CAT = P(body(0.10, -0.035, -28.0), foot("L", 0.04, 0.17, up=0.02, turn_out=0, pitch=0.55), foot("R", 0.07, -0.05, turn_out=40),
        hand("L", 0.05, 0.74, 0.30), hand("R", 0.02, 0.66, 0.12))
make("stance_cat", [(1, CAT, "smooth"), (12, CAT, "smooth")], 8, nxt(), loop=True, breathe=breathing(1.0, 12),
     info={"stance": "cat", "note": "Cat stance loop, 1.5 s: left foot forward resting on its ball with the heel up, nearly all the weight on the bent back leg, hips set back, forward guard"})

# ================================================================== kata techniques (one-shots, held at the end)
HOLD = {"holdLastFrame": True}
START_GUARD = P(front_stance(-15), hand("L", 0.10, 0.55, 0.30), HIP_R)   # where most moves begin: the end of a low block

def tech(name, frames, tags, note, impact):
    info = dict(HOLD, keyFrames={"impact": impact}, note=note, side="left foot forward; mirror for the right side")
    make(name, frames, 20, nxt(), tags=f"impact:{impact - 1}", info=info)

# Low block (downward block, gedan barai): the blocking fist starts up by the opposite ear, the other arm
# reaches down across the body; the fist sweeps down and out to stop a fist's width above the front knee
# while the other fist pulls back to the hip.
LB_CHAMBER = P(front_stance(-5), hand("L", -0.10, 0.82, 0.05), hand("R", 0.04, 0.52, 0.27))
LB_DONE = P(front_stance(-30), hand("L", 0.18, 0.45, 0.31), HIP_R)
tech("kata_low_block", [(1, START_GUARD, "smooth"), (4, LB_CHAMBER, "smooth"), (7, LB_DONE, "snap"), (10, LB_DONE, "smooth")],
     "impact:6", "Low Block: the left fist starts by the right ear, sweeps down and out to stop above the front knee; the right fist pulls to the hip", 7)

# Inside block (uchi uke, shown inside to outside): the fist starts under the opposite armpit, the forearm
# swings out until it stands upright in front of the shoulder, elbow bent about 90 degrees, a fist's width
# in front of the body; the other fist to the hip.
IB_CHAMBER = P(front_stance(-2), hand("L", -0.08, 0.64, 0.07), hand("R", 0.03, 0.72, 0.30))
IB_DONE = P(front_stance(-28), hand("L", 0.17, 0.82, 0.24), HIP_R, elbows((0.0, -0.25, -0.3)))
tech("kata_inside_block", [(1, START_GUARD, "smooth"), (4, IB_CHAMBER, "smooth"), (7, IB_DONE, "snap"), (10, IB_DONE, "smooth")],
     "impact:6", "Inside Block (inside to outside): the left fist starts under the right armpit and the forearm swings out to stand upright in front of the left shoulder; the right fist pulls to the hip", 7)

# Reverse inside block: the same block with the REAR hand (right hand while the left foot is forward), hips turned square.
RIB_CHAMBER = P(front_stance(-25), hand("R", -0.08, 0.64, 0.07), hand("L", 0.03, 0.72, 0.32))
RIB_DONE = P(front_stance(18), hand("R", 0.17, 0.82, 0.26), HIP_L, elbows(r=(0.0, -0.25, -0.3)))
tech("kata_reverse_inside_block", [(1, START_GUARD, "smooth"), (4, RIB_CHAMBER, "smooth"), (7, RIB_DONE, "snap"), (10, RIB_DONE, "smooth")],
     "impact:6", "Reverse Inside Block: the inside block with the rear (right) hand while the left foot is forward; the hips turn square, the left fist pulls to the hip", 7)

# High block (rising block, age uke): the blocking fist starts low by the opposite hip while the other arm
# rises in front; the blocking forearm rises across the face to stop angled above the forehead, a fist or so
# in front of it, elbow out; the other fist to the hip.
HB_CHAMBER = P(front_stance(-5), hand("L", -0.04, 0.56, 0.14), hand("R", 0.02, 0.92, 0.26))
HB_DONE = P(front_stance(-25), hand("L", 0.11, 1.20, 0.14), HIP_R, elbows((0.35, 0.55, 0.1)))
tech("kata_high_block", [(1, START_GUARD, "smooth"), (4, HB_CHAMBER, "smooth"), (7, HB_DONE, "snap"), (10, HB_DONE, "smooth")],
     "impact:6", "High Block (rising block): the left forearm rises across the face to stop angled above the forehead, elbow out; the right fist pulls to the hip", 7)

# Knife Hand Blocks (double, palms forward), from David and Goliath: from attention, both open hands rise up the
# middle of the body, cross in front of the chest, and open out to the sides at head height, palms forward
# (breaking a choke or shoulder hold).
ATTN = P(body(0.0, 0.0, 0.0), foot("L", 0.05, 0.0, turn_out=22), foot("R", 0.05, 0.0, turn_out=22))
KH_START = P(ATTN, hand("L", 0.20, 0.52, 0.02), hand("R", 0.20, 0.52, 0.02))
KH_CROSS = P(ATTN, hand("L", -0.03, 0.86, 0.16), hand("R", -0.03, 0.88, 0.14), hands(OPEN, OPEN, -90, -90))
KH_DONE = P(body(0.02, 0.0, 0.0), foot("L", 0.05, 0.0, turn_out=22), foot("R", 0.05, 0.0, turn_out=22),
            hand("L", 0.25, 1.10, 0.14), hand("R", 0.25, 1.10, 0.14), hands(OPEN, OPEN, 0, 0),
            elbows((0.05, -0.45, 0.1), (0.05, -0.45, 0.1)))
tech("kata_knife_hand_blocks", [(1, KH_START, "smooth"), (5, KH_CROSS, "smooth"), (8, KH_DONE, "snap"), (11, KH_DONE, "smooth")],
     "impact:7", "Knife Hand Blocks (double, palms forward): from attention both open hands rise up the middle, cross in front of the chest and open out to the sides at head height, palms forward", 8)

# Punch (straight punch, the front-leg side): the fist drives from the hip to the middle of the chest, turning
# palm down at the end, while the other fist (which was out front) pulls back to the hip.
PU_START = P(front_stance(10), HIP_L, hand("R", 0.02, 0.70, 0.36))
PU_DONE = P(front_stance(-14), hand("L", 0.02, 0.69, 0.42), HIP_R)
tech("kata_punch", [(1, P(START_GUARD, HIP_L, hand("R", 0.05, 0.62, 0.30)), "smooth"), (3, PU_START, "smooth"), (6, PU_DONE, "snap"), (9, PU_DONE, "smooth")],
     "impact:5", "Punch: the left (front-side) fist drives from the hip to the middle of the chest while the right fist pulls back to the hip", 6)

# Reverse punch: the rear fist (right, with the left foot forward) drives to the middle; the hips turn square
# behind it and the front fist pulls back to the hip.
RP_START = P(front_stance(-25), hand("L", 0.06, 0.66, 0.36), HIP_R)
RP_DONE = P(front_stance(22, fwd=0.06), hand("R", 0.02, 0.69, 0.44), HIP_L)
tech("kata_reverse_punch", [(1, START_GUARD, "smooth"), (3, RP_START, "smooth"), (6, RP_DONE, "snap"), (9, RP_DONE, "smooth")],
     "impact:5", "Reverse Punch: the right (rear) fist drives to the middle while the hips turn square and the left fist pulls back to the hip", 6)

# Backfist (uraken): the fist starts by the opposite shoulder, elbow up, then the forearm snaps out like a whip
# to the opponent's face, knuckles leading, and comes back a little.
BF_CHAMBER = P(front_stance(-5), hand("L", -0.07, 0.83, 0.10), hand("R", 0.04, 0.62, 0.28), elbows((0.2, 0.3, -0.2)))
BF_HIT = P(front_stance(-32), hand("L", 0.10, 0.93, 0.38), HIP_R, elbows((0.2, 0.3, -0.2)), hands(l_roll=90))
BF_DONE = P(front_stance(-30), hand("L", 0.08, 0.90, 0.33), HIP_R, elbows((0.2, 0.3, -0.2)), hands(l_roll=90))
tech("kata_backfist", [(1, START_GUARD, "smooth"), (4, BF_CHAMBER, "smooth"), (6, BF_HIT, "snap"), (8, BF_DONE, "smooth"), (10, BF_DONE, "smooth")],
     "impact:5", "Backfist: the left fist starts by the right shoulder with the elbow up and snaps out to face height, knuckles leading, then comes back a little", 6)

# Palm Down / Spear Hand (nukite), for Pinon 1: the rear open hand presses down palm down to under the front elbow
# while the front open hand thrusts straight out at the solar plexus, palm down, fingers together.
SH_CHAMBER = P(front_stance(-5), hand("L", 0.10, 0.60, 0.00), hand("R", 0.02, 0.70, 0.34), hands(OPEN, OPEN, 0, 0))
SH_DONE = P(front_stance(-18, fwd=0.06), hand("L", 0.01, 0.71, 0.46), hand("R", -0.01, 0.62, 0.22), hands(OPEN, OPEN, 0, 0))
tech("kata_spear_hand", [(1, START_GUARD, "smooth"), (4, SH_CHAMBER, "smooth"), (7, SH_DONE, "snap"), (10, SH_DONE, "smooth")],
     "impact:6", "Palm Down / Spear Hand: the right open hand presses down palm down to under the left elbow while the left open hand thrusts out at the solar plexus, palm down, fingers together", 7)

# Rear Leg Front Kick: from the left front stance both fists "catch" at the right hip, the right knee lifts high
# in front (chamber), the leg snaps out (ball of the foot, toes pulled back) to the middle, the knee comes back,
# and the foot lands in front: the hero ends in a right front stance (the hand technique that follows starts there).
KK_CATCH = P(front_stance(-10), hand("L", -0.08, 0.62, 0.06), hand("R", 0.15, 0.60, 0.00))
KK_CHAMBER = P(body(0.04, 0.03, 0.0, lean=-4), foot("L", 0.08, 0.20, turn_out=10), foot("R", 0.07, 0.10, up=0.34, pitch=-0.2),
               hand("L", -0.08, 0.66, 0.08), hand("R", 0.15, 0.64, 0.02))
KK_KICK = P(body(0.03, 0.02, 4.0, lean=-9), foot("L", 0.08, 0.20, turn_out=12), foot("R", 0.06, 0.44, up=0.42, pitch=-0.75),
            hand("L", -0.08, 0.66, 0.06), hand("R", 0.15, 0.64, 0.00))
KK_LAND = P(body(0.11, 0.05, 20.0), foot("R", 0.10, 0.30, turn_out=5), foot("L", 0.10, -0.26, turn_out=35),
            hand("L", 0.15, 0.585, -0.06), hand("R", 0.06, 0.62, 0.30))
tech("kata_rear_leg_front_kick", [(1, START_GUARD, "smooth"), (3, KK_CATCH, "smooth"), (6, KK_CHAMBER, "smooth"), (8, KK_KICK, "snap"),
                                  (10, KK_CHAMBER, "smooth"), (13, KK_LAND, "smooth"), (15, KK_LAND, "smooth")],
     "impact:7", "Rear Leg Front Kick: hands catch at the right hip, the right knee lifts high, the leg snaps out to the middle and back, then lands in front (ends in a right front stance)", 8)

# Break the Hold (David and Goliath, last step): the left foot draws in to the right (heels together, toes out),
# both arms rise palms up in a half circle out to the sides, then come down sharply, palms down, ending just
# outside the hips.
BH_START = P(body(0.08, 0.03, 10.0), foot("R", 0.10, 0.20, turn_out=5), foot("L", 0.10, -0.20, turn_out=30),
             hand("L", 0.15, 0.585, -0.04), hand("R", 0.06, 0.62, 0.30))
BH_UP = P(body(0.0, 0.0, 0.0), foot("L", 0.05, 0.0, turn_out=22), foot("R", 0.05, 0.0, turn_out=22),
          hand("L", 0.30, 0.98, 0.14), hand("R", 0.30, 0.98, 0.14), hands(OPEN, OPEN, 180, 180), elbows((0.15, -0.2, 0.0), (0.15, -0.2, 0.0)))
BH_DOWN = P(body(0.02, 0.0, 0.0), foot("L", 0.05, 0.0, turn_out=22), foot("R", 0.05, 0.0, turn_out=22),
            hand("L", 0.24, 0.52, 0.06), hand("R", 0.24, 0.52, 0.06), hands(OPEN, OPEN, 0, 0))
tech("kata_break_hold", [(1, BH_START, "smooth"), (6, BH_UP, "smooth"), (9, BH_DOWN, "snap"), (12, BH_DOWN, "smooth")],
     "impact:8", "Break the Hold: the left foot draws in to the right (heels together), both arms rise palms up in a half circle, then come down sharply palms down to just outside the hips", 9)

rig.animation_data.action = bpy.data.actions["idle"]
bpy.ops.wm.save_as_mainfile(filepath=SAVE, copy=True)
print("SAVED", SAVE)
