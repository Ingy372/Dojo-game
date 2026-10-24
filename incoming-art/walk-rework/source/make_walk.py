"""
Dojo Ascent - walk rework samples A/B/C (Artist bot). Replaces the 'walk' action of the player rig
with a reworked cycle, then render_sprites.py renders it (same 10 frames @ 30 fps, 1.5 tiles per loop,
so groundMotion and the game's playback rule are unchanged = drop-in).

    WALK_VARIANT=A blender -b incoming-art/player-custom/source/player_custom_a.blend \
        -P incoming-art/walk-rework/source/make_walk.py -P incoming-art/tools/render_sprites.py -- \
        --out <dir> --name player-a --anims walk --height 160 --anchor-y 0.856

Planted feet move back exactly 0.15 tiles per frame (4.5 tiles/s / 30 fps). The script checks every
frame that each IK foot is actually reached (no knee pop = no sliding) and prints the worst gap.
"""
import bpy, math, os
from mathutils import Vector, Euler

V = os.environ.get("WALK_VARIANT", "A")
FR, S = 10, 4.5 / 30          # frames per loop, travel per frame (tiles)
P = {
 # N planted frames per foot, swing lift, toe-off pitch, hip base, per-step bob (5 values, frame 0 = contact),
 # side shift, hip yaw, chest yaw, arm swing, arm lag, forward lean, knee drive
 "A": dict(N=5, lift=0.085, toe=24, hip=-0.060, bob=[-0.078, -0.062, -0.048, -0.060, -0.094],
           side=0.016, hyaw=10, cyaw=14, arm=0.13, lag=0.30, lean=5, hands="relaxed"),
 "B": dict(N=4, lift=0.075, toe=18, hip=-0.072, bob=[-0.068, -0.080, -0.070, -0.060, -0.064],
           side=0.012, hyaw=7, cyaw=8, arm=0.035, lag=0.25, lean=7, hands="ready"),
 "C": dict(N=4, lift=0.150, toe=34, hip=-0.040, bob=[-0.060, -0.074, -0.046, -0.052, -0.006],
           side=0.010, hyaw=9, cyaw=16, arm=0.15, lag=0.45, lean=3, hands="kid"),
}[V]

arm = [o for o in bpy.data.objects if o.type == "ARMATURE"][0]
PB = arm.pose.bones
REST = {"foot.L": Vector((0.085, 0, 0.07)), "foot.R": Vector((-0.085, 0, 0.07)),
        "hand.L": Vector((0.19, -0.01, 0.54)), "hand.R": Vector((-0.19, -0.01, 0.54))}
def to_local(b, v): return arm.data.bones[b].matrix_local.to_3x3().inverted() @ Vector(v)

def foot_path(i):
    """(y, z, toe pitch) for the LEFT foot at frame i. Lands at frame 0, planted frames 0..N-1."""
    N = P["N"]; y0 = -(N - 1) / 2 * S
    if i < N:
        z, pit = 0.07, 0
        if i == 0: pit = -8                            # heel strike
        if i == N - 1: z, pit = 0.094, 15              # heel peels, ankle rises about the toe (toe stays put)
        return (y0 + i * S, z, pit)
    k = FR - N + 1; u = (i - N + 1) / k                # swing 0..1 (exclusive)
    ya, yb = y0 + (N - 1) * S, y0 + FR * S - 1.5 * 1   # from back of stance to next contact (one loop ahead)
    e = 0.5 - 0.5 * math.cos(math.pi * u)              # ease in/out: foot slows to meet the ground
    y = ya + (yb - ya) * e
    z = 0.07 + P["lift"] * math.sin(math.pi * u) ** 1.3 + 0.03 * (1 - u) * (u < 0.4)
    pit = P["toe"] * (1 - u) ** 1.5 - 10 * u ** 2
    return (y, z, pit)

act = bpy.data.actions.get("walk")
old = dict(act.items()); act.name = "walk_old"; act["sprite_fps"] = 0; del act["sprite_fps"]
new = bpy.data.actions.new("walk"); new.use_fake_user = True
for k, v in old.items(): new[k] = v
arm.animation_data.action = new

def key(pb, path, val, f):
    setattr(pb, path, val); pb.keyframe_insert(path, frame=f)
def rot(pb, r, f): key(pb, "rotation_euler", Euler([math.radians(x) for x in r], "XYZ"), f)

N = P["N"]; mid = (N - 1) / 2
for i in range(FR):
    f = i + 1
    l, r = foot_path(i), foot_path((i + 5) % FR)
    ph = 2 * math.pi * i / FR
    sw = math.cos(ph)
    ha = math.cos(ph - P["lag"])
    hz = P["bob"][i % 5]
    side = P["side"] * math.cos(2 * math.pi * (i - mid) / FR)     # over the supporting foot
    key(PB["hips"], "location", to_local("hips", (side, -0.025, hz)), f)
    rot(PB["hips"], (P["lean"] + 2, -P["hyaw"] * sw, -3.0 * math.cos(2 * math.pi * (i - mid) / FR)), f)
    rot(PB["chest"], (P["lean"] - 2, P["cyaw"] * sw, 2.0 * math.cos(2 * math.pi * (i - mid) / FR)), f)
    rot(PB["head"], (-18 - 0.6 * P["lean"] + 4 * (hz - P["hip"]), -0.6 * P["cyaw"] * sw, 0), f)
    for s, x, (fy, fz, fp) in (("L", 0.085, l), ("R", -0.085, r)):
        key(PB[f"foot_ik.{s}"], "location", to_local(f"foot_ik.{s}", Vector((x, fy, fz)) - REST[f"foot.{s}"]), f)
        rot(PB[f"foot_ik.{s}"], (fp, 0, 0), f)
    lift = hz - P["hip"]
    if P["hands"] == "ready":     # loose fists in front of the belt-chest, small counter swing
        hl = (0.115, -0.20 + P["arm"] * ha, 0.79 + lift)
        hr = (-0.115, -0.17 - P["arm"] * ha, 0.77 + lift)
    else:
        a = P["arm"]; up = 0.035 if P["hands"] == "relaxed" else 0.06
        hl = (0.155 - 0.04 * (1 - ha) / 2, -0.035 + a * ha, 0.66 - up * ha + lift + 0.04)
        hr = (-0.155 + 0.04 * (1 + ha) / 2, -0.035 - a * ha, 0.66 + up * ha + lift + 0.04)
    key(PB["hand_ik.L"], "location", to_local("hand_ik.L", Vector(hl) - REST["hand.L"]), f)
    key(PB["hand_ik.R"], "location", to_local("hand_ik.R", Vector(hr) - REST["hand.R"]), f)
    for nm, rest in (("broom", (0, 0, 0.5)), ("rag", (0, 0, 0.03))):
        key(PB[nm], "location", Vector((0, 0, 0)), f); key(PB[nm], "scale", Vector((0, 0, 0)), f)
for fc in new.fcurves:
    for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
new.use_frame_range = True; new.frame_start, new.frame_end = 1, FR

# contact check: is every IK foot reached? (gap > 3 mm = knee locked straight, foot would slide)
import sys
if os.environ.get("WALK_CHECK_OLD"): arm.animation_data.action = act
worst = 0; per = []
for i in range(FR):
    bpy.context.scene.frame_set(i + 1)
    for s in "LR":
        tip = arm.matrix_world @ PB[f"shin.{s}"].tail
        tgt = arm.matrix_world @ PB[f"foot_ik.{s}"].head
        worst = max(worst, (tip - tgt).length); per.append(round((tip - tgt).length * 1000))
print("WALKCHECK per frame/foot (mm):", per)
arm.animation_data.action = new
print(f"WALKCHECK variant {V}: worst IK gap {worst*1000:.1f} mm (tiles*1000)")
