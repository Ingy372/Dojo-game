"""Claude's run cycle draft (2026-11-18) for the hero, body A or B.

Replaces the 'walk' action in a COPY of the approved player_custom_<a|b>.blend with a real run:
forward lean, arm pump with bent elbows, longer knee drive, heel kick-up, a flight moment
between steps, a bigger hip bob and shoulder counter-twist. Same rig, model and camera, so it
matches the rest of the hero's art. 12 frames at 36 fps; stride 1.5 tiles per loop at the design
speed 4.5 tiles/s (same ground speed as before, so the game keeps the feet planted).

    blender -b incoming-art/player-custom/source/player_custom_a.blend \
        -P incoming-art/claude-run/source/make_run.py -- --save incoming-art/claude-run/source/player_run_a.blend

Bone axes (all control bones point up): location x = sideways, y = up, z = forward.
"""
import bpy, math, sys

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
save = argv[argv.index("--save") + 1]

N = 12          # frames per loop
FPS = 36
STRIDE = 1.5    # tiles per loop (two steps)
STANCE = 0.30   # share of the loop a foot is planted
A = STANCE * STRIDE / 2   # planted foot goes from +A to -A
LIFT = 0.23     # highest heel lift
TAU = 2 * math.pi

rig = bpy.data.objects["MartialArtistRig"]
old = bpy.data.actions["walk"]
props = {k: old[k] for k in old.keys()}
old.name = "walk_before_claude_run"
for k in list(old.keys()):
    del old[k]          # not rendered any more
new = bpy.data.actions.new("walk")
for k, v in props.items():
    new[k] = v
new["sprite_fps"] = FPS
new["sprite_stride_tiles"] = STRIDE
new["sprite_design_speed"] = 4.5
new.use_fake_user = True
rig.animation_data.action = new
pb = rig.pose.bones


def smooth(s):
    return s * s * (3 - 2 * s)


def foot(u):
    """(forward, up, pitch) of one foot at loop phase u (0 = touch-down, foot in front)."""
    u %= 1.0
    if u < STANCE:
        s = u / STANCE
        z = A - 2 * A * s
        return z, 0.0, -0.12 * (1 - s) + 0.25 * s * s
    s = (u - STANCE) / (1 - STANCE)
    # reach forward, with a small reach past the landing spot before it comes down
    z = -A + (2 * A + 0.05) * smooth(min(1.0, s / 0.85)) - 0.05 * max(0.0, (s - 0.85) / 0.15)
    y = LIFT * math.sin(math.pi * s) ** 1.3 * (1.0 + 0.25 * math.cos(math.pi * s))
    pitch = 0.95 * math.sin(math.pi * min(1.0, s * 1.3)) - 0.12 * max(0.0, (s - 0.8) / 0.2)
    return z, max(0.0, y), pitch


for f in range(N):
    u = f / N
    frame = f + 1
    # feet: right foot half a loop behind the left
    for side, off in (("L", 0.0), ("R", 0.5)):
        z, y, p = foot(u + off)
        b = pb["foot_ik." + side]
        b.location = (0.0, y, z)
        b.rotation_euler = (p, 0.0, 0.0)
        b.keyframe_insert("location", frame=frame)
        b.keyframe_insert("rotation_euler", frame=frame)
    # hips: low on each landing, high in the air between steps (two bobs per loop)
    bob = math.cos(TAU * 2 * (u - 0.15))   # +1 at mid-stance
    twist = math.cos(TAU * u)              # +1 when the left foot is in front
    h = pb["hips"]
    h.location = (0.0, -0.045 - 0.025 * bob, 0.03)
    h.rotation_euler = (0.24, -0.16 * twist, -0.04 * math.sin(TAU * u))
    h.keyframe_insert("location", frame=frame)
    h.keyframe_insert("rotation_euler", frame=frame)
    c = pb["chest"]
    c.rotation_euler = (0.16 + 0.03 * bob, 0.34 * twist, 0.04 * math.sin(TAU * u))
    c.keyframe_insert("rotation_euler", frame=frame)
    hd = pb["head"]
    hd.rotation_euler = (-0.46 - 0.03 * bob, -0.18 * twist, 0.0)
    hd.keyframe_insert("rotation_euler", frame=frame)
    # hands: pump opposite to the feet, elbows bent, fists from behind the hip to chest height
    for side, sgn, x_sign in (("L", -1.0, 1.0), ("R", 1.0, -1.0)):
        sw = sgn * math.cos(TAU * (u - 0.04))   # +1 = this hand forward (slight lag)
        b = pb["hand_ik." + side]
        b.location = (-x_sign * (0.035 + 0.025 * max(0.0, sw)),
                      0.18 + 0.12 * sw + 0.05 * max(0.0, sw),
                      0.10 + 0.23 * sw)
        b.keyframe_insert("location", frame=frame)
    # props stay hidden, as in every other animation
    for prop in ("broom", "rag"):
        b = pb[prop]
        b.scale = (0.0, 0.0, 0.0)
        b.keyframe_insert("scale", frame=frame)

new.frame_range = (1, N)
new.use_frame_range = True
bpy.ops.wm.save_as_mainfile(filepath=bpy.path.abspath("//") and save or save, copy=True)
print("SAVED", save)
