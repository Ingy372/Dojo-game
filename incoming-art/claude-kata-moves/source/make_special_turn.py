"""The special turn of Basic Forms 1 and 2 (Jay, Nov 21), added to a kata blend made by make_kata_moves.py.

After the kiai (step 3, and again after step 6) the hero faces the way the kiai went, right foot forward. The back
(left) leg reaches to the rear right, the hero spins a three-quarter turn to its LEFT on the balls of the feet
(seen from behind: left, then toward the camera, then right), and lands in a left front stance doing the Low Block
that opens the next step. So this one animation is the first beat of steps 4 and 7.

    blender -b incoming-art/claude-kata-moves/source/player_kata_a.blend \
        -P incoming-art/claude-kata-moves/source/make_special_turn.py -- --save incoming-art/claude-kata-moves/source/player_kata_a.blend

Unlike every other kata move it turns the whole character (the `root` bone), so it is a real render, never mirrored.
Each direction row starts facing that direction and ends facing 90 degrees to its right (row N ends facing E).
The move is drawn centred: the hero moves a little during the turn (`turn` in the JSON says how far,
so the game can move the hero's spot to match, the same way the front kicks do).

This is the only action that keys the `root` bone; the script leaves `root` at rest when it saves.
"""
import bpy, math, sys, os

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SAVE = argv[argv.index("--save") + 1]

# Load the helpers and poses from make_kata_moves.py without rebuilding its actions (--only matches none of them).
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "make_kata_moves.py")
code = open(src).read()
code = code[:code.index('rig.animation_data.action = bpy.data.actions["idle"]')]   # stop before it saves
saved_argv = sys.argv
sys.argv = ["x", "--", "--save", "/dev/null", "--only", "__none__"]
ns = {"__name__": "kata_helpers"}
exec(compile(code, src, "exec"), ns)
sys.argv = saved_argv

P, body, hand, hands, foot, mirror = ns["P"], ns["body"], ns["hand"], ns["hands"], ns["foot"], ns["mirror"]
front_stance, NEUTRAL, REST_FOOT, D = ns["front_stance"], ns["NEUTRAL"], ns["REST_FOOT"], ns["D"]
PU_DONE, LB_CHAMBER, LB_DONE, HIP_R = ns["PU_DONE"], ns["LB_CHAMBER"], ns["LB_DONE"], ns["HIP_R"]
rig = ns["rig"]
ns["CHANNELS"].extend([("root", "location"), ("root", "rotation_euler")])

# ------------------------------------------------------------------ ground plan
# Coordinates on the floor in the starting frame: x = the hero's left at the start, z = the way it faced at the start.
def fwd_vec(th):   # the way the hero faces after turning th degrees to its left
    r = math.radians(th); return (math.sin(r), math.cos(r))
def left_vec(th):
    r = math.radians(th); return (math.cos(r), -math.sin(r))
def to_world(root, th, lx, lz):
    f, l = fwd_vec(th), left_vec(th)
    return (root[0] + lx * l[0] + lz * f[0], root[1] + lx * l[1] + lz * f[1])
def to_local(root, th, w):
    f, l = fwd_vec(th), left_vec(th)
    d = (w[0] - root[0], w[1] - root[1])
    return (d[0] * l[0] + d[1] * l[1], d[0] * f[0] + d[1] * f[1])

TURN = 270.0
# Front stance feet (local): the front foot 0.10 out and 0.30 ahead, the back foot 0.10 out and 0.26 behind.
# Jay (Nov 21): the leg reaches first, then the rest turns.
#  1. The reach: the body still faces the kiai; the left (back) foot reaches behind, to the rear right.
#  2. The turn: the body spins three-quarters to the left on the balls of the feet; the left foot stays where it
#     reached (it becomes the front foot) and the right foot swings round behind it to become the back foot.
R0 = (-0.10, 0.30)
L0 = (0.10, -0.26)
L_REACH = (-0.28, -0.15)                            # behind the hero, to the right
L_END = L_REACH
R_END = (L_END[0] + 0.56, L_END[1] - 0.20)          # one stance length behind the left foot in the new direction
def mid_root(lw, rw, th):
    f = fwd_vec(th)
    m = ((lw[0] + rw[0]) / 2, (lw[1] + rw[1]) / 2)
    return (m[0] - 0.02 * f[0], m[1] - 0.02 * f[1])   # the hips sit over the middle of the feet
S0 = mid_root(L0, R0, 0)
E0 = mid_root(L_END, R_END, TURN)
W_CENTRE = float(os.environ.get("TURN_W", "0.15"))     # where between the start and end spots the frame is centred
C = (S0[0] + (E0[0] - S0[0]) * W_CENTRE, S0[1] + (E0[1] - S0[1]) * W_CENTRE)   # everything shifted by -C
S = (S0[0] - C[0], S0[1] - C[1])
E = (E0[0] - C[0], E0[1] - C[1])
def centred(w):
    return (w[0] - C[0], w[1] - C[1])

N = 30
def smooth(t):
    t = min(1.0, max(0.0, t)); return t * t * (3 - 2 * t)
def phase(f, a, b):
    return smooth((f - a) / (b - a))
def lerp(a, b, t):
    return tuple(x + (y - x) * t for x, y in zip(a, b))

# Upper body keys (local to the hero): the kiai, loading during the reach (left fist up by the right ear, right
# fist to the hip, eyes over the left shoulder), the spin, the low block chamber, the low block.
KIAI = mirror(P(NEUTRAL, PU_DONE))
REACH = P(NEUTRAL, body(0.10, 0.0, 12.0, look=40.0), hand("L", -0.10, 0.82, 0.05), HIP_R)
SPIN = P(NEUTRAL, body(0.09, 0.02, 6.0, look=20.0), hand("L", -0.10, 0.82, 0.05), HIP_R)
CHAMBER = P(NEUTRAL, LB_CHAMBER)
BLOCK = P(NEUTRAL, LB_DONE)
UPPER = [(1, KIAI, None), (3, KIAI, "smooth"), (10, REACH, "smooth"), (17, SPIN, "smooth"), (23, CHAMBER, "smooth"), (26, BLOCK, "snap"), (N, BLOCK, "smooth")]
EASE = ns["ease"]

def upper(f):
    for i in range(len(UPPER) - 1):
        f0, p0, _ = UPPER[i]; f1, p1, e = UPPER[i + 1]
        if f0 <= f <= f1:
            t = EASE((f - f0) / (f1 - f0), e)
            return {k: lerp(p0[k], p1[k], t) for k in p0 if k in p1}
    return dict(UPPER[-1][1])

def theta(f):
    return TURN * phase(f, 10, 22)

def foot_channels(side, w, th, root, up, turn_out):
    lx, lz = to_local(root, th, w)
    s = 1.0 if side == "L" else -1.0
    return {("foot_ik." + side, "location"): (lx - REST_FOOT[side], up, lz),
            ("foot_ik." + side, "rotation_euler"): (0.0, s * D(turn_out), 0.0)}

keys = []
for f in range(1, N + 1):
    th = theta(f)
    pose = upper(f)
    # 1. the reach (frames 3-10): the left foot lifts a little and reaches behind to the rear right
    t = phase(f, 3, 10)
    lw = lerp(L0, L_REACH, t)
    l_up = 0.05 * math.sin(math.pi * t) if 0 < t < 1 else 0.0
    # 2. the turn (frames 10-22): both feet turn on their balls; from frame 15 the right foot swings round the left
    #    foot (the same distance from it all the way) to become the back foot
    tr = phase(f, 15, 22)
    a0 = math.atan2(R0[1] - L_END[1], R0[0] - L_END[0]); a1 = math.atan2(R_END[1] - L_END[1], R_END[0] - L_END[0])
    if a1 > a0:
        a1 -= 2 * math.pi                               # round the same way the body turns
    r0 = math.hypot(R0[0] - L_END[0], R0[1] - L_END[1]); r1 = math.hypot(R_END[0] - L_END[0], R_END[1] - L_END[1])
    ang = a0 + (a1 - a0) * tr; rad = r0 + (r1 - r0) * tr
    rw = (L_END[0] + rad * math.cos(ang), L_END[1] + rad * math.sin(ang))
    r_up = 0.04 * math.sin(math.pi * tr) if 0 < tr < 1 else 0.0
    l_turn = 35 + (5 - 35) * phase(f, 10, 22)
    r_turn = 5 + (35 - 5) * phase(f, 10, 22)
    root = centred(mid_root(lw, rw, th))
    pose.update(foot_channels("L", centred(lw), th, root, l_up, l_turn))
    pose.update(foot_channels("R", centred(rw), th, root, r_up, r_turn))
    pose[("root", "location")] = (root[0], 0.0, root[1])
    pose[("root", "rotation_euler")] = (0.0, math.radians(th), 0.0)
    keys.append((f, pose, "lin"))

ns["ORDER"] = 60
ns["ONLY"] = None
ns["make"]("kata_special_turn", keys, 20, 60, tags="impact:25",
           info={"holdLastFrame": True, "keyFrames": {"impact": 26},
                 "side": "a real render, never mirrored: starts right foot forward (the kiai), ends left foot forward",
                 "turn": {"degrees": -TURN, "endFacing": "90 degrees clockwise on screen from the row's direction (row N ends facing E)",
                          "startOffset": {"right": round(-S[0], 3), "forward": round(S[1], 3)},
                          "endOffset": {"right": round(-E[0], 3), "forward": round(E[1], 3)},
                          "note": "offsets are tiles in the row's starting frame (right of and ahead of the way it faces at the start): the picture starts and ends that far from the hero's spot"},
                 "note": "Special turn (Basic Forms 1 and 2, after the kiai of steps 3 and 6): first the left (back) leg reaches behind to the rear right while the body still faces the kiai and the eyes look over the left shoulder; then the body spins a three-quarter turn to its left on the balls of the feet, the right foot swinging round to become the back foot, and the hero lands in a left front stance doing the Low Block"})

# leave the root at rest for every other animation
rb = rig.pose.bones["root"]
rb.location = (0.0, 0.0, 0.0)
rb.rotation_euler = (0.0, 0.0, 0.0)
rig.animation_data.action = bpy.data.actions["idle"]
bpy.ops.wm.save_as_mainfile(filepath=SAVE, copy=True)
print("SAVED", SAVE)
