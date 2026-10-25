"""Walk samples R1 / R2 built from Arms 1 plus WALK-RESEARCH.md. Run AFTER arms.py with ARMS=1:
    ARMS=1 SAMPLE=1|2 blender -b player_custom_a.blend -P arms.py -P research_samples.py -P ../../tools/render_sprites.py -- ...
R1 (arms only, legs identical): Arms 1 plus
   - drag: the swing eases out of each extreme, so the hand stays near the pose it just left a little longer (Williams/Lango, Polygon Treehouse);
   - arc: the hand rises a little at both ends of the swing and is lowest at the passing pose (Motion Design School: arcs);
   - extra lag: 0.65 rad instead of 0.50, about 1 frame behind the legs (Polygon Treehouse: 1-2 frames; MDS: 2-3).
R2 = R1 plus ONE labelled body change: a 1 px "bounce, not sine" hip dip on the two contact frames (Pixeli, Lifebe).
   This is the only sample that changes anything besides the hands. The feet stay planted (IK), so the knees bend slightly more."""
import bpy, math, os
from mathutils import Vector
S = int(os.environ.get("SAMPLE", "1"))
arm = bpy.data.objects["MartialArtistRig"]; act = bpy.data.actions["walk"]; sc = bpy.context.scene
REST = {"L": Vector((0.19, -0.01, 0.54)), "R": Vector((-0.19, -0.01, 0.54))}
def to_local(b, v): return arm.data.bones[b].matrix_local.to_3x3().inverted() @ v
bob = []
for f in range(10):
    sc.frame_set(f + 1); bob.append(arm.pose.bones["hips"].head.z)
m = sum(bob) / 10; bob = [b - m for b in bob]
P = dict(x=0.180, y=-0.015, sw=0.095, z=0.600, lift=0.035, lag=0.65, inw=0.016, arc=0.014, ease=0.70)
def hands(i):
    c = math.cos(2 * math.pi * i / 10 - P["lag"])
    ha = math.copysign(abs(c) ** P["ease"], c)            # <1: lingers near the extremes = drag
    out = {}
    for s, sx, k in (("L", 1, 1), ("R", -1, -1)):
        fwd = max(0.0, -k * ha)
        out[s] = Vector((sx * (P["x"] - P["inw"] * fwd), P["y"] + k * P["sw"] * ha,
                         P["z"] + P["lift"] * fwd + P["arc"] * ha * ha + 0.8 * bob[i]))
    return out
for fc in act.fcurves:
    for s in ("L", "R"):
        if fc.data_path == f'pose.bones["hand_ik.{s}"].location':
            for k in fc.keyframe_points:
                i = int(round(k.co[0])) - 1
                if 0 <= i < 10:
                    k.co[1] = to_local(f"hand_ik.{s}", hands(i)[s] - REST[s])[fc.array_index]; k.handle_left_type = k.handle_right_type = "AUTO_CLAMPED"
            fc.update()
if S == 2:
    # contact frames = where the two feet are furthest apart along y
    feet = []
    for f in range(10):
        sc.frame_set(f + 1)
        ys = [arm.pose.bones[b].head.y for b in arm.pose.bones.keys() if b.startswith("foot_ik")] or [0, 0]
        feet.append(abs(ys[0] - ys[-1]))
    order = sorted(range(10), key=lambda i: -feet[i]); c1 = order[0]; c2 = next(i for i in order if min(abs(i - c1), 10 - abs(i - c1)) >= 4)
    PX = 0.0085                                   # about 1 px at our render scale (160 px tall sprite)
    dip = [0.0] * 10
    for c in (c1, c2): dip[c] = PX; dip[(c + 1) % 10] = PX * 0.5      # drop fast, recover over a frame, then a hold: bounce, not sine
    pb = arm.pose.bones["hips"]; vals = []
    for f in range(10):
        sc.frame_set(f + 1); vals.append(pb.location.copy())
    for f in range(10):
        pb.location = vals[f] + to_local("hips", Vector((0, 0, -dip[f])))
        pb.keyframe_insert("location", frame=f + 1)
    print("SAMPLE2_DIP contact frames", c1 + 1, c2 + 1, dip)
print("RESEARCH_SAMPLE", S)
