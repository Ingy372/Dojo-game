"""
Dojo Ascent — run concept on the existing player (body A).

Copies the walk action to "run" and changes the motion only:
forward lean, a higher knee, the opposite arm, a light bounce, and a
little extra hip roll so the belt moves. The foot's forward/back path
stays the walk's path, so the planted step is still 0.15 m per frame
(1.5 tiles per loop at 30 fps = 4.5 tiles/s).

Does not touch the meshes, the eyes, the collar, or the walk action.

    blender -b incoming-art/player-custom/source/player_custom_a.blend \
        -P incoming-art/player-run-concept/source/build_run.py -- \
        --out incoming-art/player-run-concept/source/player_a_run.blend
"""
import bpy, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
import argparse
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
A = ap.parse_args(argv)

arm = bpy.data.objects["MartialArtistRig"]
walk = bpy.data.actions["walk"]
if "run" in bpy.data.actions:
    bpy.data.actions.remove(bpy.data.actions["run"])
run = walk.copy()
run.name = "run"
for key in ("sprite_fps", "sprite_loop", "sprite_tags", "sprite_order", "sprite_stride_tiles", "sprite_design_speed"):
    if key in walk:
        run[key] = walk[key]
run["sprite_info"] = (
    '{"concept": true, "notForImport": true, "note": '
    '"Run motion concept. Same 10 frames, 30 fps, 1.5 tiles per loop, 4.5 tiles/s as the walk."}'
)
arm.animation_data.action = run
sc = bpy.context.scene

def fcurve(path, index):
    for fc in run.fcurves:
        if fc.data_path == path and fc.array_index == index:
            return fc
    raise SystemExit("missing " + path + " " + str(index))

def keys(path, index):
    fc = fcurve(path, index)
    return [k.co[1] for k in fc.keyframe_points]

def set_keys(path, index, values):
    fc = fcurve(path, index)
    pts = list(fc.keyframe_points)
    if len(pts) != 10 or len(values) != 10:
        raise SystemExit(f"{path} {index} has {len(pts)} keys")
    for k, v in zip(pts, values):
        k.co[1] = v
        k.handle_left_type = k.handle_right_type = "AUTO_CLAMPED"
    fc.update()

def add_keys(path, index, delta):
    vals = keys(path, index)
    if isinstance(delta, (int, float)):
        delta = [delta] * 10
    set_keys(path, index, [v + d for v, d in zip(vals, delta)])

def world(name):
    return arm.matrix_world @ arm.pose.bones[name].head

def to_local(bone, delta_world):
    return arm.data.bones[bone].matrix_local.to_3x3().inverted() @ Vector(delta_world)

# Record the walk pose first (the copy still has the walk keys).
walk_feet = {"L": [], "R": []}
walk_hands = {"L": [], "R": []}
walk_hips = []
for f in range(1, 11):
    sc.frame_set(f)
    bpy.context.view_layer.update()
    walk_hips.append(world("hips").copy())
    for s in ("L", "R"):
        walk_feet[s].append(world(f"foot_ik.{s}").copy())
        walk_hands[s].append(world(f"hand_ik.{s}").copy())

# Lean. The head counters it so the face stays the angle it already has.
add_keys('pose.bones["hips"].rotation_euler', 0, 0.09)
add_keys('pose.bones["chest"].rotation_euler', 0, 0.035)
add_keys('pose.bones["head"].rotation_euler', 0, -0.09)
# A little more hip roll, so the belt swings. Same sign as the walk.
roll = keys('pose.bones["hips"].rotation_euler', 2)
add_keys('pose.bones["hips"].rotation_euler', 2, [v * 0.45 for v in roll])

# Light bounce, applied in world Z after the other edits (the hips' local Z is not world Z).
bounce = [0.0, -0.014, -0.004, 0.006, 0.016, 0.006, -0.014, -0.004, 0.006, 0.016]

def new_foot_z(old):
    """Keep a planted foot on the ground. Lift the swinging foot higher."""
    base = 0.07
    lift = old.z - base
    if lift <= 0.012:
        return base
    return base + min(0.34, lift * 1.65)

# Write foot and hand keys from the recorded walk, so the Y path cannot drift.
for s in ("L", "R"):
    loc = [fcurve(f'pose.bones["foot_ik.{s}"].location', i) for i in range(3)]
    for i in range(10):
        old = walk_feet[s][i]
        new = old.copy()
        new.z = new_foot_z(old)
        delta = to_local(f"foot_ik.{s}", new - old)
        for axis in range(3):
            loc[axis].keyframe_points[i].co[1] += delta[axis]
            loc[axis].keyframe_points[i].handle_left_type = "AUTO_CLAMPED"
            loc[axis].keyframe_points[i].handle_right_type = "AUTO_CLAMPED"
    for fc in loc:
        fc.update()
    # More toe-up while the foot is in the air. Planted frames stay as they are.
    rot = fcurve(f'pose.bones["foot_ik.{s}"].rotation_euler', 0)
    for i, k in enumerate(rot.keyframe_points):
        if walk_feet[s][i].z > 0.10 and k.co[1] > 0:
            k.co[1] = min(0.95, k.co[1] * 1.2)
            k.handle_left_type = k.handle_right_type = "AUTO_CLAMPED"
    rot.update()

for s, sign in (("L", -1), ("R", 1)):
    loc = [fcurve(f'pose.bones["hand_ik.{s}"].location', i) for i in range(3)]
    for i in range(10):
        phase = math.cos(2 * math.pi * i / 10) * sign   # +1 = this hand is forward
        old = walk_hands[s][i]
        new = old.copy()
        new.x = 0.155 * (1 if s == "L" else -1)
        new.y = -0.02 - 0.17 * phase
        new.z = 0.62 + 0.14 * max(phase, 0.0) - 0.05 * max(-phase, 0.0)
        delta = to_local(f"hand_ik.{s}", new - old)
        for axis in range(3):
            loc[axis].keyframe_points[i].co[1] += delta[axis]
            loc[axis].keyframe_points[i].handle_left_type = "AUTO_CLAMPED"
            loc[axis].keyframe_points[i].handle_right_type = "AUTO_CLAMPED"
    for fc in loc:
        fc.update()

# Bounce: lower on the plant, a small rise on the up frames. Feet stay where they were set.
current = []
for f in range(1, 11):
    sc.frame_set(f)
    bpy.context.view_layer.update()
    current.append(world("hips").copy())
hloc = [fcurve('pose.bones["hips"].location', i) for i in range(3)]
for i in range(10):
    new = current[i].copy()
    new.z = walk_hips[i].z + bounce[i]
    delta = to_local("hips", new - current[i])
    for axis in range(3):
        hloc[axis].keyframe_points[i].co[1] += delta[axis]
        hloc[axis].keyframe_points[i].handle_left_type = "AUTO_CLAMPED"
        hloc[axis].keyframe_points[i].handle_right_type = "AUTO_CLAMPED"
for fc in hloc:
    fc.update()

# Check the plant and the opposite arm, then save.
print("RUN CHECK")
ok = True
for f in range(1, 11):
    sc.frame_set(f)
    bpy.context.view_layer.update()
    fl, frt = world("foot_ik.L"), world("foot_ik.R")
    hl, hr = world("hand_ik.L"), world("hand_ik.R")
    print(f"f{f} Lz {fl.z:.3f} Rz {frt.z:.3f} Ly {fl.y:.3f} Ry {frt.y:.3f} hLy {hl.y:.3f} hRy {hr.y:.3f} hipsZ {world('hips').z:.3f}")
for s, a, b in (("L", 0, 1), ("R", 5, 6)):
    dy = world_delta = None
sc.frame_set(2); bpy.context.view_layer.update(); y2 = world("foot_ik.L").y
sc.frame_set(1); bpy.context.view_layer.update(); y1 = world("foot_ik.L").y
sc.frame_set(7); bpy.context.view_layer.update(); y7 = world("foot_ik.R").y
sc.frame_set(6); bpy.context.view_layer.update(); y6 = world("foot_ik.R").y
plant_l, plant_r = y2 - y1, y7 - y6
print(f"PLANT_DELTA L {plant_l:.4f} R {plant_r:.4f}")
if abs(plant_l - 0.15) > 0.004 or abs(plant_r - 0.15) > 0.004:
    raise SystemExit("planted foot skates")
# Frame 1: left foot forward (more negative Y than the right), right hand forward.
sc.frame_set(1); bpy.context.view_layer.update()
if not (world("foot_ik.L").y < world("foot_ik.R").y and world("hand_ik.R").y < world("hand_ik.L").y):
    raise SystemExit("frame 1 is not opposite arm and leg")
sc.frame_set(6); bpy.context.view_layer.update()
if not (world("foot_ik.R").y < world("foot_ik.L").y and world("hand_ik.L").y < world("hand_ik.R").y):
    raise SystemExit("frame 6 is not opposite arm and leg")

bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("SAVED", A.out)
