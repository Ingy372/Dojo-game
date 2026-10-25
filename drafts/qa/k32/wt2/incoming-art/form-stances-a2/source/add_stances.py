"""Dojo Ascent - A2 SAMPLES: Form stance idles for the player (Rooted Form, Flowing Form).

Adds stance-idle actions to a player_custom_<a|b>.blend (the approved player rig). Nothing else changes:
same rig, frames, layers, gi (tinted) and belt (its own neutral layers).

    blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/form-stances-a2/source/add_stances.py -- --out /tmp/stances_a.blend
    blender -b /tmp/stances_a.blend -P incoming-art/tools/render_sprites.py -- --out <dir> --name player-a --height 160 --anchor-y 0.856 \
        --anims stance_rooted,stance_rooted_back,stance_flowing

Rig axes (pose space, every IK/hips bone points up): x = the character's left(+)/right(-), y = up, z = forward.
The guard idle is: left foot forward 0.11, right foot back 0.11 (turned out 38 deg), hips turned 14 deg, fists up.
"""
import bpy, sys, math, json, argparse

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); args = ap.parse_args(argv)

arm = bpy.data.objects["MartialArtistRig"]
idle = bpy.data.actions["idle"]
BASE = {}                                   # idle frame-1 value of every channel (props stay hidden, etc.)
for fc in idle.fcurves: BASE[(fc.data_path, fc.array_index)] = fc.evaluate(1)

def pb_path(bone, prop): return f'pose.bones["{bone}"].{prop}'

def make(name, nframes, fps, pose_fn, order, info):
    act = bpy.data.actions.new(name); act.use_fake_user = True
    for (path, idx), v0 in BASE.items():
        fc = act.fcurves.new(path, index=idx, action_group=path.split('"')[1])
        for f in range(nframes):
            ph = 2 * math.pi * f / nframes
            v = pose_fn(path, idx, ph, v0)
            fc.keyframe_points.insert(f + 1, v).interpolation = "LINEAR"
    act["sprite_fps"] = fps; act["sprite_loop"] = True; act["sprite_tags"] = ""
    act["sprite_order"] = order; act["sprite_info"] = json.dumps(info)
    act.use_frame_range = True; act.frame_start, act.frame_end = 1, nframes
    return act

def table(T, breath):
    """T maps (bone, prop, axis) -> value (absolute pose value). breath(path, idx, ph) -> additive."""
    def fn(path, idx, ph, v0):
        bone = path.split('"')[1]; prop = path.split(".")[-1]
        v = T.get((bone, prop, idx), v0)
        return v + breath(bone, prop, idx, ph)
    return fn

D = math.radians
# ---------------------------------------------------------------- 1. Rooted Form: low, wide fighting stance
# Feet about 2 shoulder-widths apart and one long step front to back, knees bent out over the toes,
# hips sunk, back upright (no lean), weight 50/50, chin tucked behind a firm, compact guard.
ROOT = {
    ("hips", "location", 1): -0.105, ("hips", "location", 2): 0.0,
    ("hips", "rotation_euler", 0): 0.02, ("hips", "rotation_euler", 1): D(-24),
    ("chest", "rotation_euler", 0): 0.0, ("chest", "rotation_euler", 1): D(-6),
    ("head", "rotation_euler", 1): D(28),
    ("foot_ik.L", "location", 0): 0.125, ("foot_ik.L", "location", 2): 0.15, ("foot_ik.L", "rotation_euler", 1): D(4),
    ("foot_ik.R", "location", 0): -0.125, ("foot_ik.R", "location", 2): -0.14, ("foot_ik.R", "rotation_euler", 1): D(-35),
    ("hand_ik.L", "location", 0): -0.11, ("hand_ik.L", "location", 1): 0.30, ("hand_ik.L", "location", 2): 0.27,   # lead fist: chin height, out front
    ("hand_ik.R", "location", 0): 0.15, ("hand_ik.R", "location", 1): 0.33, ("hand_ik.R", "location", 2): 0.13,    # rear fist: guarding the chin
}
def root_breath(bone, prop, idx, ph):
    s = math.sin(ph)
    if (bone, prop, idx) == ("hips", "location", 1): return -0.006 * (0.5 + 0.5 * s)    # settles a little on the out-breath
    if (bone, prop, idx) == ("chest", "rotation_euler", 0): return -0.025 * s          # chest rises on the in-breath
    if (bone, prop, idx) == ("head", "rotation_euler", 0): return 0.02 * s
    if bone.startswith("hand_ik") and (prop, idx) == ("location", 1): return 0.006 * s
    return 0.0
make("stance_rooted", 12, 8, table(ROOT, root_breath), 13,
     {"form": "rooted-form", "note": "Rooted Form stance idle, loop 1.5 s: a low, wide fighting stance (feet about two shoulder-widths, knees bent out over the toes, hips sunk, back upright, weight even), slow steady breathing. Feet never move"})

# ---------------------------------------------------------------- 2. Rooted Form, option B: back stance (kokutsu-dachi)
# Front foot points at the opponent, back foot turned out 90 deg, heels about hip-width apart (a narrow line reads as crossed legs from the front camera). About 70% of the weight
# on the bent back leg, front knee soft. Hips side-on (hanmi), head facing forward, knife-hand guard.
BACK = {
    ("hips", "location", 1): -0.09, ("hips", "location", 2): -0.055,
    ("hips", "rotation_euler", 0): 0.0, ("hips", "rotation_euler", 1): D(-34),
    ("chest", "rotation_euler", 0): -0.02, ("chest", "rotation_euler", 1): D(-8),
    ("head", "rotation_euler", 1): D(38),
    ("foot_ik.L", "location", 0): 0.0, ("foot_ik.L", "location", 2): 0.17, ("foot_ik.L", "rotation_euler", 1): D(0),
    ("foot_ik.R", "location", 0): 0.0, ("foot_ik.R", "location", 2): -0.15, ("foot_ik.R", "rotation_euler", 1): D(-85),
    ("hand_ik.L", "location", 0): -0.10, ("hand_ik.L", "location", 1): 0.36, ("hand_ik.L", "location", 2): 0.31,   # lead hand out at shoulder height
    ("hand_ik.R", "location", 0): 0.20, ("hand_ik.R", "location", 1): 0.24, ("hand_ik.R", "location", 2): 0.15,    # rear hand at the solar plexus
}
make("stance_rooted_back", 12, 8, table(BACK, root_breath), 14,
     {"form": "rooted-form", "option": "B", "note": "Rooted Form option B, loop 1.5 s: back stance (kokutsu-dachi), about 70% of the weight on the bent back leg, front foot pointing forward, back foot turned out, side-on hips, hands in a forward guard. Slow breathing; feet never move"})

# ---------------------------------------------------------------- 3. Flowing Form: light, mobile stance
# Shorter, narrower stance (about shoulder width), weight on the balls of the feet, knees springy.
# Two small bounces per loop with a gentle rock front-to-back, shoulders loose, an open, relaxed guard.
FLOW = {
    ("hips", "location", 1): -0.03, ("hips", "location", 2): 0.0,
    ("hips", "rotation_euler", 0): 0.1, ("hips", "rotation_euler", 1): D(-32),
    ("chest", "rotation_euler", 0): 0.05, ("chest", "rotation_euler", 1): D(-6),
    ("head", "rotation_euler", 1): D(36),
    ("foot_ik.L", "location", 0): 0.0, ("foot_ik.L", "location", 2): 0.10, ("foot_ik.L", "rotation_euler", 1): D(10),
    ("foot_ik.R", "location", 0): -0.01, ("foot_ik.R", "location", 2): -0.09, ("foot_ik.R", "rotation_euler", 1): D(-30),
    ("hand_ik.L", "location", 0): -0.07, ("hand_ik.L", "location", 1): 0.25, ("hand_ik.L", "location", 2): 0.30,
    ("hand_ik.R", "location", 0): 0.12, ("hand_ik.R", "location", 1): 0.27, ("hand_ik.R", "location", 2): 0.19,
}
def flow_move(bone, prop, idx, ph):
    b = abs(math.sin(ph))                    # two bounces per loop
    rock = math.sin(ph)                      # one rock forward/back per loop
    k = (bone, prop, idx)
    if k == ("hips", "location", 1): return 0.024 * b
    if k == ("hips", "location", 2): return 0.018 * rock
    if k == ("hips", "rotation_euler", 1): return D(4) * rock
    if k == ("chest", "rotation_euler", 1): return D(3) * rock
    if k == ("head", "rotation_euler", 1): return -D(6) * rock        # eyes stay on the opponent
    if bone.startswith("hand_ik") and (prop, idx) == ("location", 1): return 0.012 * b
    if bone.startswith("hand_ik") and (prop, idx) == ("location", 2): return 0.01 * rock * (1 if bone.endswith("L") else -1)
    return 0.0
make("stance_flowing", 8, 10, table(FLOW, flow_move), 15,
     {"form": "flowing-form", "note": "Flowing Form stance idle, loop 0.8 s: a light, shorter stance on the balls of the feet, two small springy bounces and a gentle rock forward and back, loose relaxed guard. Feet stay planted"})

bpy.ops.wm.save_as_mainfile(filepath=args.out, compress=True)
print("saved", args.out)
