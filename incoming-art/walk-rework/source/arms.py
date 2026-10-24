"""Arm-only walk samples (Jay: keep the current legs, rework only the arms).
    ARMS=1|2|3 blender -b player_custom_a.blend -P arms.py -P ../../tools/render_sprites.py -- --out DIR --name player-a --anims walk ...
Only the hand_ik.L / hand_ik.R LOCATION keys of the 'walk' action are rewritten. Every other curve (feet, hips, chest,
head, toe roll, timing) is left exactly as it is, and the script checks that before rendering (LEGS_IDENTICAL).
Positions are in rig space (metres; -y = forward). Opposite-arm swing: the right hand is forward as the left foot lands."""
import bpy, math, os, hashlib
from mathutils import Vector
V = int(os.environ.get("ARMS", "1"))
arm = bpy.data.objects["MartialArtistRig"]; act = bpy.data.actions["walk"]
REST = {"L": Vector((0.19, -0.01, 0.54)), "R": Vector((-0.19, -0.01, 0.54))}
def to_local(b, v): return arm.data.bones[b].matrix_local.to_3x3().inverted() @ v
def sig(skip_hands):
    h = hashlib.sha1()
    for fc in act.fcurves:
        if skip_hands and fc.data_path.startswith('pose.bones["hand_ik.') and fc.data_path.endswith("location"): continue
        h.update(f"{fc.data_path}{fc.array_index}".encode())
        for k in fc.keyframe_points: h.update(f"{k.co[0]:.6f},{k.co[1]:.6f},{k.interpolation}".encode())
    return h.hexdigest()
before = sig(True)
# body bob per frame, read from the hips curve that is already there (so the hands ride with the body)
hz = [None] * 10
for fc in act.fcurves:
    if fc.data_path == 'pose.bones["hips"].location':
        w = [fc.evaluate(f + 1) for f in range(10)]
        idx = fc.array_index
        hz_axis = idx
        hz = hz if False else hz
bpy.context.scene.frame_set(1)
arm.animation_data.action = act
bob = []
for f in range(10):
    bpy.context.scene.frame_set(f + 1); bpy.context.view_layer.update()
    bob.append((arm.pose.bones["hips"].head).z)
m = sum(bob) / 10; bob = [b - m for b in bob]
#           x(out)  y mid  swing  z     lift  lag   inward-on-forward
P = {1: dict(x=0.180, y=-0.015, sw=0.095, z=0.605, lift=0.040, lag=0.50, inw=0.020),   # relaxed, soft elbows, hands by the hips
     2: dict(x=0.150, y=-0.025, sw=0.050, z=0.640, lift=0.020, lag=0.40, inw=0.015),   # small and tidy, hands close to the body
     3: dict(x=0.170, y=-0.010, sw=0.040, z=0.570, lift=0.012, lag=0.45, inw=0.010)}[V] # loose fists carried low, small swing
def hands(i):
    ha = math.cos(2 * math.pi * i / 10 - P["lag"])     # +1: left hand back, right hand forward
    out = {}
    for s, sx, k in (("L", 1, 1), ("R", -1, -1)):
        fwd = max(0.0, -k * ha)                          # 0..1, how far forward this hand is
        out[s] = Vector((sx * (P["x"] - P["inw"] * fwd), P["y"] + k * P["sw"] * ha, P["z"] + P["lift"] * fwd + 0.8 * bob[i]))
    return out
for fc in act.fcurves:
    for s in ("L", "R"):
        if fc.data_path == f'pose.bones["hand_ik.{s}"].location':
            for k in fc.keyframe_points:
                i = int(round(k.co[0])) - 1
                if 0 <= i < 10:
                    k.co[1] = to_local(f"hand_ik.{s}", hands(i)[s] - REST[s])[fc.array_index]; k.handle_left_type = k.handle_right_type = "AUTO_CLAMPED"
            fc.update()
print("LEGS_IDENTICAL", before == sig(True), "ARMS", V)
assert before == sig(True)
