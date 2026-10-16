"""
Dojo Ascent - Tier 1 shadow creatures (Art Director bot), Batch 2.

Builds one enemy as a .blend for the shared renderer (incoming-art/tools/render_sprites.py): soft, rounded
shadow creatures in deep indigo with a soft glow and big friendly glowing eyes. No teeth, no claws, nothing
sharp; when beaten they dissolve into light and sparkles (they are set free, not hurt).

    blender -b -P incoming-art/enemies-tier1/source/build_enemy.py -- --enemy swarmer --out <file>.blend
        [--broken]      (shield only: the broken-shield variant, render only its shield-broken layer)

Enemies: swarmer, shield, brute, keeper. Sizes and timings follow content/enemies/*.json (see README).
Layers: body (always), glow (soft rim, always), telegraph (optional rim, neutral white: the game tints and
flashes it during the wind-up), and per enemy shield / shield-broken / light (defeat orb and sparkles).
"""
import bpy, bmesh, math, sys, os, argparse, json
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import srgb, toon_material, outline_material, hull_material, add_hull, ellipsoid, tube, box, OUTLINE_W

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--enemy", required=True, choices=["swarmer", "shield", "brute", "keeper"])
ap.add_argument("--out", required=True)
ap.add_argument("--broken", action="store_true")
A = ap.parse_args(argv)
E = A.enemy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "Enemy"

# ---------------------------------------------------------------- per-enemy shape
# W = body width in tiles (= the enemy's "radius" in content/enemies, the same ratio as the player: the
# player's radius is 0.42 and his body is about 0.36-0.45 wide). H = body height.
SPEC = {
    "swarmer": dict(W=0.30, H=0.40, arm=0.9, eye=1.15, ears=True, color="#3b2c72", belly="#5a4aa3"),
    "shield":  dict(W=0.42, H=0.62, arm=1.0, eye=1.0, ears=False, color="#33306e", belly="#4f4f9a"),
    "brute":   dict(W=0.48, H=0.88, arm=1.45, eye=0.9, ears=False, color="#3a2862", belly="#56408c"),
    "keeper":  dict(W=0.85, H=1.30, arm=1.6, eye=1.0, ears=False, color="#30225e", belly="#4a3790"),
}[E]
W, H = SPEC["W"], SPEC["H"]
R = W / 2

MAT = {k: toon_material(k.upper(), v) for k, v in {
    "body": SPEC["color"], "belly": SPEC["belly"], "foot": "#2a2056", "cheek": "#7a5fc4",
    "shield": "#8fa6c8", "shield_rim": "#5f7398", "emblem": "#eef3ff",
    "gem": "#ffd36b", "light": "#fff6c8", "spark": "#ffe48a",
}.items()}
MAT["eye"] = toon_material("EYE", "#bff6ff", shadow=1.0, highlight=1.0)
MAT["eye_hi"] = toon_material("EYEHI", "#ffffff", shadow=1.0, highlight=1.0)
MAT["light"] = toon_material("LIGHTFLAT", "#fff6c8", shadow=1.0, highlight=1.0)
MAT["spark"] = toon_material("SPARKFLAT", "#ffe48a", shadow=1.0, highlight=1.0)
MAT["gem"] = toon_material("GEMFLAT", "#ffd36b", shadow=0.85, highlight=1.15)
OUTLINE = outline_material()
GLOW = hull_material("GLOW", "#8f74ff")
TELE = hull_material("TELEGRAPH", "#ffffff")

LAYERS = ["body", "glow", "telegraph", "light"]
if E == "shield":
    LAYERS[1:1] = ["shield", "shield-broken"]
COLL = {}
for i, name in enumerate(LAYERS):
    c = bpy.data.collections.new("L_" + name); scene.collection.children.link(c)
    c["sprite_order"] = i
    c["sprite_tint"] = name == "telegraph"
    c["sprite_overlay"] = name in ("glow", "telegraph")
    c["sprite_optional"] = name in ("telegraph", "shield", "shield-broken")
    COLL[name] = c
rig_coll = bpy.data.collections.new("RIG"); scene.collection.children.link(rig_coll)

# ----------------------------------------------------------------- rig
root = bpy.data.objects.new("CHAR_ROOT", None); scene.collection.objects.link(root)
arm_data = bpy.data.armatures.new("EnemyRig")
arm = bpy.data.objects.new("EnemyRig", arm_data); rig_coll.objects.link(arm); arm.parent = root
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode="EDIT")
eb = arm_data.edit_bones
def bone(name, head, tail, parent=None):
    b = eb.new(name); b.head, b.tail = Vector(head), Vector(tail)
    b.align_roll(Vector((1, 0, 0)).cross((b.tail - b.head).normalized()))
    if parent: b.parent = eb[parent]
    b.use_deform = False
SH_Z = H * 0.55                       # shoulder height
EYE_Z = H * 0.68
bone("root", (0, 0, 0), (0, 0, 0.1))
bone("body", (0, 0, 0), (0, 0, H * 0.5), "root")
bone("eyes", (0, -R * 0.8, EYE_Z), (0, -R * 0.8, EYE_Z + 0.05), "body")
for s, x in (("L", 1), ("R", -1)):
    bone(f"arm.{s}", (x * R * 0.92, 0, SH_Z), (x * R * 0.92, 0, SH_Z - 0.1), "body")
    bone(f"foot.{s}", (x * R * 0.45, 0, 0), (x * R * 0.45, 0, 0.05), "root")
bone("light", (0, 0, H * 0.45), (0, 0, H * 0.45 + 0.05), "root")
bone("sparks", (0, 0, H * 0.45), (0, 0, H * 0.45 + 0.05), "root")
bone("shield", (R * 1.1, -R * 0.7, SH_Z - 0.06), (R * 1.1, -R * 0.7, SH_Z + 0.04), "arm.L")
bpy.ops.object.mode_set(mode="OBJECT")
for pb in arm.pose.bones: pb.rotation_mode = "XYZ"
PB = arm.pose.bones

def mesh(name, bm, mat, layer, bone_name, outline=True, glow=False):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = True
    bm.to_mesh(me); bm.free(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); COLL[layer].objects.link(ob)
    obs = [ob]
    if outline: obs.append(add_hull(ob, COLL[layer], OUTLINE, OUTLINE_W))
    if glow:
        obs.append(add_hull(ob, COLL["glow"], GLOW, OUTLINE_W + 0.018 * max(1, W / 0.4), name_suffix="_glow"))
        obs.append(add_hull(ob, COLL["telegraph"], TELE, OUTLINE_W + 0.05 * max(1, W / 0.4), name_suffix="_tele"))
    for o in obs:
        mw = o.matrix_world.copy(); o.parent = arm; o.parent_type = "BONE"; o.parent_bone = bone_name
        bpy.context.view_layer.update(); o.matrix_world = mw
    return ob

# ----------------------------------------------------------------- meshes (rest pose, facing -Y)
mesh("body", ellipsoid((0, 0, H * 0.48), (R, R * 0.9, H * 0.5), segs=24, rings=14), MAT["body"], "body", "body", glow=True)
mesh("belly", ellipsoid((0, -R * 0.42, H * 0.36), (R * 0.68, R * 0.55, H * 0.3), segs=20, rings=12), MAT["belly"], "body", "body", outline=False)
if SPEC["ears"]:   # two soft rounded ears (Swarmer)
    for x in (1, -1):
        mesh(f"ear{x}", ellipsoid((x * R * 0.55, 0.0, H * 0.95), (R * 0.28, R * 0.22, H * 0.2), rot=(0, x * 18, 0)),
             MAT["body"], "body", "body", glow=True)
if E == "keeper":  # a soft rounded crest with a warm glowing gem (no horns, nothing sharp)
    mesh("crest", ellipsoid((0, -R * 0.1, H * 0.97), (R * 0.42, R * 0.32, H * 0.13)), MAT["body"], "body", "body", glow=True)
    mesh("gem", ellipsoid((0, -R * 0.42, H * 0.93), (R * 0.12, R * 0.08, R * 0.12)), MAT["gem"], "body", "body")
# big friendly eyes: tall ovals with a white shine, on their own bone (they squint, widen, blink)
es = SPEC["eye"]
for x in (1, -1):
    mesh(f"eye{x}", ellipsoid((x * R * 0.34, -R * 0.84, EYE_Z), (R * 0.2 * es, R * 0.08, R * 0.27 * es), segs=16, rings=10),
         MAT["eye"], "body", "eyes")
    mesh(f"eyehi{x}", ellipsoid((x * R * 0.34 - R * 0.06, -R * 0.92, EYE_Z + R * 0.09 * es), (R * 0.06 * es, R * 0.03, R * 0.07 * es)),
         MAT["eye_hi"], "body", "eyes", outline=False)
    mesh(f"cheek{x}", ellipsoid((x * R * 0.6, -R * 0.74, EYE_Z - R * 0.32), (R * 0.12, R * 0.05, R * 0.07)), MAT["cheek"], "body", "body", outline=False)
# soft arms (rounded nubs; the Brute and Keeper get big round fists)
am = SPEC["arm"]
for s, x in (("L", 1), ("R", -1)):
    mesh(f"arm{s}", ellipsoid((x * R * 1.0, 0, SH_Z - 0.07 * am), (0.045 * am, 0.045 * am, 0.085 * am)), MAT["body"], "body", f"arm.{s}", glow=True)
    if am > 1.2:
        mesh(f"fist{s}", ellipsoid((x * R * 1.02, -0.01, SH_Z - 0.16 * am), (0.06 * am, 0.06 * am, 0.055 * am)), MAT["body"], "body", f"arm.{s}", glow=True)
    mesh(f"foot{s}", ellipsoid((x * R * 0.45, -R * 0.12, 0.028 * max(1, W / 0.4)), (R * 0.32, R * 0.4, 0.032 * max(1, W / 0.4))),
         MAT["foot"], "body", f"foot.{s}")
# defeat: a warm light orb and sparkles (layer "light"; scale 0 = hidden until the defeat)
mesh("orb", ellipsoid((0, 0, H * 0.45), (R * 0.55, R * 0.55, R * 0.55)), MAT["light"], "light", "light", outline=False)
def star(c, r):
    bm = bmesh.new()
    pts = [Vector((math.cos(a) * (r if k % 2 == 0 else r * 0.45), 0, math.sin(a) * (r if k % 2 == 0 else r * 0.45)))
           for k, a in enumerate([math.pi / 2 + i * math.pi / 4 for i in range(8)])]
    vs = [bm.verts.new(Vector(c) + p) for p in pts]; bm.faces.new(vs)
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=r * 0.3)
    return bm
for i in range(7):
    a = i * 2 * math.pi / 7
    rr = R * (0.13 if i % 2 else 0.09) + 0.012          # little diamond sparkles: read from every direction
    mesh(f"spark{i}", ellipsoid((math.cos(a) * R * 1.2, math.sin(a) * R * 1.2, H * 0.45 + (i % 3 - 1) * H * 0.2), (rr * 0.6, rr * 0.6, rr), segs=4, rings=2),
         MAT["spark"], "light", "sparks", outline=False)
if E == "shield":
    sz = R * 0.95       # a round shield with a star emblem, held on the left arm
    c = Vector((R * 1.1, -R * 0.75, SH_Z - 0.06))
    mesh("shield", tube(c + Vector((0, 0.02, 0)), c + Vector((0, -0.02, 0)), sz, sz * 0.96, segs=24), MAT["shield"], "shield", "shield")
    mesh("shield_rim", tube(c + Vector((0, -0.021, 0)), c + Vector((0, -0.025, 0)), sz * 0.98, sz * 0.98, segs=24), MAT["shield_rim"], "shield", "shield", outline=False)
    mesh("shield_face", tube(c + Vector((0, -0.026, 0)), c + Vector((0, -0.029, 0)), sz * 0.82, sz * 0.82, segs=24), MAT["shield"], "shield", "shield", outline=False)
    st = star((0, 0, 0), sz * 0.5); bmesh.ops.rotate(st, verts=st.verts, cent=(0, 0, 0), matrix=Matrix.Identity(3))
    bmesh.ops.translate(st, verts=st.verts, vec=c + Vector((0, -0.032, 0)))
    mesh("shield_star", st, MAT["emblem"], "shield", "shield", outline=False)
    # broken variant: the same shield in two cracked halves, a gap between them, slightly drooping
    for k, (dx, ang) in enumerate(((-0.025, 14), (0.03, -18))):
        bm = tube(c + Vector((0, 0.02, 0)), c + Vector((0, -0.024, 0)), sz, sz * 0.96, segs=24)
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        n = Vector((1 if k else -1, 0, 0.25))
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=c, plane_no=-n, clear_outer=True)
        bmesh.ops.contextual_create(bm, geom=[e for e in bm.edges if e.is_boundary])
        bmesh.ops.rotate(bm, verts=bm.verts, cent=c, matrix=Matrix.Rotation(math.radians(ang), 3, "Y"))
        bmesh.ops.translate(bm, verts=bm.verts, vec=Vector((dx, 0, -0.02 - 0.015 * k)))
        mesh(f"shield_half{k}", bm, MAT["shield_rim"], "shield-broken", "shield")

# ----------------------------------------------------------------- posing
def P(body=(0, 0, 0, 0, 0, 0, 1, 1, 1), eyes=(1, 1), arm_l=(0, 0), arm_r=(0, 0), foot_l=(0, 0, 0), foot_r=(0, 0, 0),
      light=(0, 0), sparks=(0, 0, 0)):
    """body: dx, dy, dz (tiles), pitch (lean forward +), yaw, roll, width, height, depth scale.
    arm: (swing forward +, raise out to the side +) degrees, optional stretch (1 = normal length).  light: (rise, scale). sparks: (rise, scale, spin)."""
    arm_l = tuple(arm_l) + (1.0,) * (3 - len(arm_l)); arm_r = tuple(arm_r) + (1.0,) * (3 - len(arm_r))
    return dict(body=body, eyes=eyes, arm_l=arm_l, arm_r=arm_r, foot_l=foot_l, foot_r=foot_r, light=light, sparks=sparks)

def mix(a, b, t):
    return {k: tuple(x + (y - x) * t for x, y in zip(a[k], b[k])) for k in a}

def B(dx=0, dy=0, dz=0, pitch=0, yaw=0, roll=0, sw=1, sh=1, sd=None):
    return (dx, dy, dz, pitch, yaw, roll, sw, sh, sw if sd is None else sd)

def apply(p, f):
    def key(pb, loc=None, rot=None, sc=None):
        if loc is not None: pb.location = loc; pb.keyframe_insert("location", frame=f)
        if rot is not None: pb.rotation_euler = Euler([math.radians(v) for v in rot], "XYZ"); pb.keyframe_insert("rotation_euler", frame=f)
        if sc is not None: pb.scale = sc; pb.keyframe_insert("scale", frame=f)
    b = p["body"]
    # vertical bones: local X = X, local Y = up, local Z = -Y (back to front)
    key(PB["body"], loc=(b[0], b[2], -b[1]), rot=(b[3], b[4], -b[5]), sc=(b[6], b[7], b[8]))
    key(PB["eyes"], sc=(p["eyes"][0], p["eyes"][1], 1))
    for s, x in (("L", 1), ("R", -1)):
        a = p[f"arm_{s.lower()}"]
        # arm bones point down: local X = X, local Y = down, local Z = +Y. Forward swing = -X rotation.
        key(PB[f"arm.{s}"], rot=(-a[0], 0, -x * a[1]), sc=(1, a[2], 1))
        fo = p[f"foot_{s.lower()}"]
        fs = min(1.0, b[6])            # feet vanish with the body in the defeat
        key(PB[f"foot.{s}"], loc=(fo[0], fo[2], -fo[1]), sc=(fs, fs, fs))
    key(PB["light"], loc=(0, p["light"][0], 0), sc=(max(p["light"][1], 0),) * 3)
    sp = p["sparks"]
    key(PB["sparks"], loc=(0, sp[0], 0), rot=(0, sp[2], 0), sc=(max(sp[1], 0),) * 3)
    key(PB["shield"], sc=(1, 1, 1))

def action(name, poses, fps, loop, tags="", info=None):
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

ease = lambda x: 0.5 - 0.5 * math.cos(math.pi * max(0, min(1, x)))
DATA = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "content", "enemies",
                                   {"swarmer": "swarmer", "shield": "shield", "brute": "brute", "keeper": "floor-keeper"}[E] + ".json")))
TICK = 1 / 20
FPS = 10
REST = P()
GUARD = P(body=B(pitch=6), arm_l=(30, 12), arm_r=(30, 12))      # ready, arms a little forward

# IDLE: soft breathing bob, one blink. 8 frames at 8 fps = 1 s loop.
idle = []
for i in range(8):
    b = math.sin(2 * math.pi * i / 8)
    q = P(body=B(dz=0.006 * (b + 1) * H, pitch=6, sw=1 - 0.025 * b, sh=1 + 0.035 * b),
          eyes=(1, 0.15 if i == 5 else 1), arm_l=(30 + 6 * b, 12), arm_r=(30 + 6 * b, 12))
    idle.append(q)
action("idle", idle, 8, True)

# MOVE: a bouncy waddle-hop toward the player (feet alternate, body leans in). 6 frames at 12 fps = 0.5 s loop.
move = []
for i in range(6):
    ph = 2 * math.pi * i / 6
    up = abs(math.sin(ph))
    q = P(body=B(dz=0.05 * H * up, pitch=14, roll=5 * math.sin(ph), sw=1 + 0.05 * (1 - up), sh=1 - 0.06 * (1 - up) + 0.04 * up),
          arm_l=(30 - 25 * math.sin(ph), 14), arm_r=(30 + 25 * math.sin(ph), 14),
          foot_l=(0, -0.10 * W * math.sin(ph), 0.04 * max(0, math.sin(ph))), foot_r=(0, 0.10 * W * math.sin(ph), 0.04 * max(0, -math.sin(ph))))
    move.append(q)
action("move", move, 12, True, info={"designSpeedTilesPerSecond": DATA["moveSpeedTilesPerSecond"],
                                       "note": "bouncy waddle; the feet don't need to stay planted, play at any move speed"})

def telegraph_action(name, wind, ticks, extra_tags=""):
    """Wind-up, as long as the attack's telegraph: eases into the big pose in 2-3 frames, then trembles."""
    n = max(3, round(ticks * TICK * FPS))
    fr = [mix(GUARD, wind, ease(k / 2.5)) for k in range(min(3, n))]
    while len(fr) < n:
        k = len(fr); q = dict(wind); b = list(wind["body"])
        b[0] += 0.006 * (1 if k % 2 else -1); b[7] *= 1 + 0.015 * (k % 2); q["body"] = tuple(b); fr.append(q)
    return action(name, fr, FPS, False, f"telegraph:0-{n - 1}{extra_tags}",
                  {"telegraphSeconds": round(ticks * TICK, 2), "telegraphTicks": ticks,
                   "note": f"lasts exactly the telegraph ({ticks} ticks). Flash the telegraph layer (tint it, e.g. #ff3b30) for the whole wind-up. In Guided mode the wind-up is slower: hold the last frame"})

def attack_action(name, hit, ticks_recover, extra=None):
    n_rec = max(3, round(ticks_recover * TICK * FPS))
    fr = [hit, hit] + [mix(hit, GUARD, ease((k + 1) / n_rec)) for k in range(n_rec)]
    return action(name, fr, FPS, False, "impact:0,recover:2-%d" % (len(fr) - 1),
                  dict({"keyFrames": {"impact": 0}, "recoverSeconds": round(ticks_recover * TICK, 2)}, **(extra or {})))

# WIND-UP (default single attack): the clearest pose on screen. The body rears up and stretches tall, leans
# back, the striking arm (right) pulls far back and up, the other arm out, eyes wide.
WIND = P(body=B(dy=0.06 * W, pitch=-20, yaw=-18, sw=0.88, sh=1.24), eyes=(1.15, 1.3), arm_l=(-10, 50), arm_r=(-150, 30))
HIT = P(body=B(dy=-0.2 * W, pitch=12, yaw=14, sw=1.1, sh=0.92), eyes=(1.1, 0.8), arm_l=(10, 20), arm_r=(92, 6, 1.9))
if E in ("swarmer", "brute"):
    at = DATA["attack"]
    if E == "swarmer":
        telegraph_action("windup", WIND, at["telegraphTicks"])   # the jab: a quick straight poke with the right nub
        attack_action("attack", HIT, at["recoverTicks"], {"note": "the Swarmer's jab"})
    else:                # Brute: a big overhead swing down in front
        BW = P(body=B(dy=0.08 * W, pitch=-22, sw=0.86, sh=1.26), eyes=(1.15, 1.3), arm_l=(-165, 20), arm_r=(-165, 20))
        telegraph_action("windup", BW, at["telegraphTicks"])
        BH = P(body=B(dy=-0.14 * W, pitch=30, sw=1.18, sh=0.86), eyes=(1.1, 0.7), arm_l=(70, 10), arm_r=(70, 10))
        attack_action("attack", BH, at["recoverTicks"], {"note": "the Brute's two-fist smash in front"})
if E == "shield":
    at = DATA["attack"]
    SW_ = P(body=B(dy=0.07 * W, pitch=-16, yaw=-30, sw=0.9, sh=1.18), eyes=(1.1, 1.25), arm_l=(-60, 40), arm_r=(-40, 30))
    telegraph_action("windup", SW_, at["telegraphTicks"])
    SB = P(body=B(dy=-0.2 * W, pitch=22, yaw=20, sw=1.1, sh=0.9), eyes=(1.1, 0.8), arm_l=(80, 0), arm_r=(20, 20))
    attack_action("attack", SB, at["recoverTicks"], {"note": "shield bash: the shield shoves forward"})
if E == "keeper":
    sl, sw = DATA["attacks"][0], DATA["attacks"][1]
    KS = P(body=B(dy=0.06 * W, pitch=-18, sw=0.9, sh=1.22), eyes=(1.15, 1.3), arm_l=(-170, 25), arm_r=(-170, 25))
    telegraph_action("windup_slam", KS, sl["telegraphTicks"])
    KH = P(body=B(dz=-0.02, pitch=32, sw=1.2, sh=0.82), eyes=(1.1, 0.6), arm_l=(85, 20), arm_r=(85, 20))
    attack_action("slam", KH, sl["recoverTicks"], {"note": "ground slam with both fists"})
    KW = P(body=B(pitch=-6, yaw=-70, sw=1.08, sh=0.96), eyes=(1.15, 1.3), arm_l=(-10, 85), arm_r=(-10, 85))
    telegraph_action("windup_sweep", KW, sw["telegraphTicks"])
    n_rec = max(3, round(sw["recoverTicks"] * TICK * FPS))
    spin = [P(body=B(pitch=4, yaw=-70 + 360 * k / 5, sw=1.08, sh=0.95), eyes=(1.1, 0.8), arm_l=(0, 88), arm_r=(0, 88)) for k in range(6)]
    spin += [mix(spin[-1], GUARD, ease((k + 1) / n_rec)) for k in range(n_rec)]
    action("sweep", spin, FPS, False, "spin:0-5,recover:6-%d" % (len(spin) - 1),
           {"keyFrames": {"spin": "0-5"}, "recoverSeconds": round(sw["recoverTicks"] * TICK, 2),
            "note": "wide sweep: one full turn with both arms out (the hit ring is all around him)"})
    call = []
    for i in range(8):   # calling for help: arms up waving, bouncing, eyes bright
        b = math.sin(2 * math.pi * i / 8)
        call.append(P(body=B(dz=0.02 * abs(b), pitch=-8, roll=6 * b, sh=1.06), eyes=(1.15, 1.2),
                      arm_l=(-15, 145 + 15 * b, 1.3), arm_r=(-15, 145 - 15 * b, 1.3)))   # out to the sides and up, waving (clear of the body)
    action("call", call, 8, True, info={"note": "calling for help (at half health the Keeper calls in 2 swarmers): loop while the swarmers arrive"})

# HIT FLINCH: a quick squash back, eyes shut tight for a moment. 3 frames at 12 fps = 0.25 s.
HF = P(body=B(dy=0.06 * W, pitch=-12, sw=1.12, sh=0.86), eyes=(1.05, 0.25), arm_l=(-30, 35), arm_r=(-30, 35))
action("hit", [HF, mix(HF, GUARD, 0.5), GUARD], 12, False, "recoil:0")
# STAGGER (after a Perfect Counter): a dizzy wobble in place, eyes squeezed, arms loose. 8 frames at 10 fps loop.
stag = []
for i in range(8):
    a = 2 * math.pi * i / 8
    stag.append(P(body=B(dx=0.03 * W * math.sin(a), pitch=-4 + 6 * math.cos(a), roll=12 * math.sin(a), sw=1.05, sh=0.93),
                  eyes=(1.0, 0.35), arm_l=(-10, 40 + 15 * math.sin(a)), arm_r=(-10, 40 - 15 * math.sin(a))))
action("stagger", stag, FPS, True, info={"note": "dizzy wobble; loop for as long as the stagger lasts"})
if E == "brute":   # WINDED: stopped, out of breath: bent over, arms hanging, big slow breaths. 8 frames at 8 fps loop.
    wd = []
    for i in range(8):
        b = math.sin(2 * math.pi * i / 8)
        wd.append(P(body=B(dz=-0.01, pitch=22 + 4 * b, sw=1.04 + 0.04 * b, sh=0.9 + 0.04 * b), eyes=(1.0, 0.45),
                    arm_l=(8 + 4 * b, 6), arm_r=(8 + 4 * b, 6)))
    action("winded", wd, 8, True, info={"note": "winded (stopped for 2.5 s, takes +50% damage): loop. The game adds the pale tint, sweat drops and 'huff... huff...'"})

# DEFEAT: not a death. He blinks happily, shrinks into a warm ball of light, and floats up in sparkles (set
# free). 14 frames at 12 fps = 1.17 s; the last frame is empty, so remove him after it.
d = [HF, P(body=B(sh=1.05), eyes=(1.0, 0.12)), P(body=B(sw=1.1, sh=0.9), eyes=(1.0, 0.12))]
for k in range(1, 6):
    t = k / 5
    d.append(P(body=B(dz=0.15 * H * t, sw=1 - 0.95 * t, sh=1 - 0.95 * t), eyes=(1.0, 0.12), light=(0.1 * H * t, 0.4 + 0.8 * t), sparks=(0, 0.3 + 0.7 * t, 40 * t)))
for k in range(1, 7):
    t = k / 6
    d.append(P(body=B(sw=0, sh=0), light=(0.1 * H + 0.5 * H * t, 1.2 * (1 - t) ** 1.5), sparks=(0.6 * H * t, (1 + 0.3 * t) * (1 - t ** 3), 40 + 60 * t)))
action("defeat", d, 12, False, "light:3,gone:13", {"keyFrames": {"light": 3, "gone": 13}, "removeAfter": True,
       "note": "dissolves into light and sparkles (a hopeful 'set free', not a death). The last frame is empty"})

scene["sprite_meta"] = json.dumps({"enemy": DATA["id"], "name": DATA["name"],
    "sizeTiles": {"bodyWidth": W, "bodyHeight": H, "radiusInData": DATA["radius"]},
    "tintGuidance": {"mode": "multiply (Phaser setTint)", "body": "no tint", "glow": "no tint, always drawn (soft rim)",
                     "telegraph": "optional: draw only during the wind-up, tinted (e.g. #ff3b30 red, or #ffd36b gold in Guided mode) and flashed / pulsed in alpha",
                     "light": "no tint, always drawn (only the defeat has anything in it)",
                     **({"shield / shield-broken": "draw exactly one: shield while it's up, shield-broken for a moment when it breaks (then neither until it grows back after 6 s)"} if E == "shield" else {})}})
if A.broken:   # broken-shield variant: hide the intact shield (it would hold out the broken one)
    for o in COLL["shield"].objects: o.hide_render = True
else:
    for o in (COLL["shield-broken"].objects if "shield-broken" in COLL else []): o.hide_render = True
arm.animation_data.action = bpy.data.actions["idle"]
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out)
