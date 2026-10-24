"""
Dojo Ascent - A5 SAMPLE: the padded-weapon shadow creature (working id "padded"), for the S4 weapon seals.
A copy of enemies-tier1/source/build_enemy.py (same rig, toon look, camera, layers and timing helpers) with one new
enemy added. It carries a soft PADDED TRAINING STAFF (fat foam pads on both ends, like a dojo pool-noodle staff) on its
own `weapon` layer, so the game can simply stop drawing it when the enemy is "disarmed".

    blender -b -P incoming-art/enemy-padded-weapon/source/build_padded.py -- --enemy padded --out <file>.blend

--- original header ---
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
ap.add_argument("--enemy", required=True, choices=["swarmer", "shield", "brute", "keeper", "padded"])
ap.add_argument("--out", required=True)
ap.add_argument("--broken", action="store_true")
A = ap.parse_args(argv)
E = A.enemy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "Enemy"

# ---------------------------------------------------------------- per-enemy shape (review redesign)
# Jay's review: tell them apart at a glance by silhouette and colour, not just size. One shadow family (deep
# indigo bodies, glowing eyes, dissolve into light), but each type has its own shape, features, accent colour
# and way of moving:
#   swarmer = a quick bouncing wisp with a soft flame tuft, teal
#   shield  = an upright beetle sentinel with a domed shell, antennae and a big round shield, amber
#   brute   = a wide, low, heavy ox-like hulk with big fists and rounded horn stubs, crimson-magenta
#   keeper  = a tall regal masked guardian with a crown, a halo and a flowing cape, gold
# W = body width in tiles (= the enemy's "radius" in content/enemies). H = body height.
SPEC = {
    "swarmer": dict(W=0.30, H=0.42, arm=0.8, eye=1.2, color="#2b2a72", belly="#3d48a0", accent="#3fe6d2", glow="#5fe8ff",
                    eye_c="#aefcf2", eye_z=0.54, eye_y=0.97, eye_dx=0.36, sh=0.5, arm_x=0.95),
    "shield":  dict(W=0.42, H=0.64, arm=1.0, eye=0.95, color="#28305e", belly="#3b4a82", accent="#ffaa33", glow="#ffc266",
                    eye_c="#ffe0a0", eye_z=0.72, eye_y=0.84, eye_dx=0.3, sh=0.56, arm_x=0.95),
    "brute":   dict(W=0.48, H=0.72, arm=1.7, eye=0.78, color="#36204f", belly="#523a7a", accent="#e8337a", glow="#ff5c9d",
                    eye_c="#ffb3d6", eye_z=0.6, eye_y=0.95, eye_dx=0.3, sh=0.6, arm_x=1.12),
    "keeper":  dict(W=0.85, H=1.30, arm=1.5, eye=0.82, color="#241e52", belly="#3a3278", accent="#ffc83d", glow="#ffd86b",
                    eye_c="#fff0b0", eye_z=0.71, eye_y=0.8, eye_dx=0.2, sh=0.58, arm_x=0.85),
    # padded: a round little sparring sprite with two soft leaf-ear tufts, lime accent (unused by the other four)
    "padded":  dict(W=0.41, H=0.62, arm=1.05, eye=1.12, color="#323b86", belly="#4d5db8", accent="#a6e34a", glow="#c4f27a",
                    eye_c="#e6ffc0", eye_z=0.66, eye_y=0.9, eye_dx=0.33, sh=0.52, arm_x=0.98),
}[E]
W, H = SPEC["W"], SPEC["H"]
R = W / 2

MAT = {k: toon_material(k.upper(), v) for k, v in {
    "body": SPEC["color"], "belly": SPEC["belly"], "foot": "#1d1847", "cheek": "#7a5fc4",
    "shield": "#7f8fb8", "shield_rim": "#e8962e", "emblem": "#ffd27a",
    "shell": "#33427a", "staff": "#c3cdea", "pad": "#c9f07e", "padband": "#5f7f2a", "horn": "#4a2f66", "snout": "#5e4a90", "cape": "#18133c", "mask": "#ddd6f3",
}.items()}
MAT["accent"] = toon_material("ACCENT", SPEC["accent"], shadow=0.8, highlight=1.12)
MAT["eye"] = toon_material("EYE", SPEC["eye_c"], shadow=1.0, highlight=1.0)
MAT["eye_hi"] = toon_material("EYEHI", "#ffffff", shadow=1.0, highlight=1.0)
MAT["dark"] = toon_material("DARK", "#120e2a", shadow=1.0, highlight=1.0)
MAT["light"] = toon_material("LIGHTFLAT", "#fff6c8", shadow=1.0, highlight=1.0)
MAT["spark"] = toon_material("SPARKFLAT", "#ffe48a", shadow=1.0, highlight=1.0)
MAT["gem"] = toon_material("GEMFLAT", "#ffd36b", shadow=0.85, highlight=1.15)
OUTLINE = outline_material()
GLOW = hull_material("GLOW", SPEC["glow"])
TELE = hull_material("TELEGRAPH", "#ffffff")

LAYERS = ["body", "glow", "telegraph", "light"]
if E == "shield":
    LAYERS[1:1] = ["shield", "shield-broken"]
if E == "padded":
    LAYERS[1:1] = ["weapon"]
COLL = {}
for i, name in enumerate(LAYERS):
    c = bpy.data.collections.new("L_" + name); scene.collection.children.link(c)
    c["sprite_order"] = i
    c["sprite_tint"] = name == "telegraph"
    c["sprite_overlay"] = name in ("glow", "telegraph")
    c["sprite_optional"] = name in ("telegraph", "shield", "shield-broken", "weapon")
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
SH_Z = H * SPEC["sh"]                 # shoulder height
EYE_Z = H * SPEC["eye_z"]
bone("root", (0, 0, 0), (0, 0, 0.1))
bone("body", (0, 0, 0), (0, 0, H * 0.5), "root")
bone("eyes", (0, -R * 0.8, EYE_Z), (0, -R * 0.8, EYE_Z + 0.05), "body")
for s, x in (("L", 1), ("R", -1)):
    bone(f"arm.{s}", (x * R * SPEC["arm_x"], 0, SH_Z), (x * R * SPEC["arm_x"], 0, SH_Z - 0.1), "body")
    bone(f"foot.{s}", (x * R * 0.45, 0, 0), (x * R * 0.45, 0, 0.05), "root")
bone("light", (0, 0, H * 0.45), (0, 0, H * 0.45 + 0.05), "root")
bone("sparks", (0, 0, H * 0.45), (0, 0, H * 0.45 + 0.05), "root")
bone("staff", (-R * SPEC["arm_x"], -0.02, SH_Z - 0.12), (-R * SPEC["arm_x"], -0.02, SH_Z - 0.02), "arm.R")
bone("shield", (R * 1.15, -R * 0.75, SH_Z - 0.06), (R * 1.15, -R * 0.75, SH_Z + 0.04), "arm.L")
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
def M_(n, bm, mat, bone_name="body", outline=True, glow=False, layer="body"):
    return mesh(n, bm, mat, layer, bone_name, outline=outline, glow=glow)
FS = max(1, W / 0.4)
if E == "swarmer":      # wisp: a round body tapering to a little tail, a soft three-lick flame tuft with teal tips
    M_("body", ellipsoid((0, 0, H * 0.46), (R, R * 0.9, H * 0.4), segs=24, rings=14), MAT["body"], glow=True)
    M_("tail", ellipsoid((0, R * 0.1, H * 0.12), (R * 0.45, R * 0.42, H * 0.16)), MAT["body"], glow=True)
    for k, (x, ang, sz) in enumerate(((0, -10, 1.0), (R * 0.42, 28, 0.7), (-R * 0.42, -28, 0.7))):
        M_(f"tuft{k}", ellipsoid((x, R * 0.05, H * 0.86 + 0.02 * sz), (R * 0.28 * sz, R * 0.24 * sz, H * 0.3 * sz), rot=(-12, ang, 0)), MAT["body"], glow=True)
        M_(f"tip{k}", ellipsoid((x * 1.25, R * 0.0, H * 0.99 + 0.03 * sz), (R * 0.15 * sz, R * 0.13 * sz, H * 0.14 * sz), rot=(-12, ang, 0)), MAT["accent"], outline=False)
    M_("mark", ellipsoid((0, -R * 0.82, H * 0.3), (R * 0.2, R * 0.08, H * 0.12)), MAT["accent"], outline=False)
elif E == "shield":     # beetle sentinel: upright body, a domed shell on the back, a helmet ridge, two antennae
    M_("body", ellipsoid((0, 0, H * 0.5), (R * 0.95, R * 0.85, H * 0.48), segs=24, rings=14), MAT["body"], glow=True)
    M_("belly", ellipsoid((0, -R * 0.45, H * 0.36), (R * 0.62, R * 0.5, H * 0.28)), MAT["belly"], outline=False)
    M_("shell", ellipsoid((0, R * 0.38, H * 0.52), (R * 1.05, R * 0.7, H * 0.47), segs=24, rings=14), MAT["shell"], glow=True)
    M_("shellstripe", ellipsoid((0, R * 1.0, H * 0.55), (R * 0.12, R * 0.12, H * 0.4)), MAT["accent"], outline=False)
    M_("helmet", ellipsoid((0, R * 0.05, H * 0.9), (R * 0.75, R * 0.72, H * 0.16)), MAT["shell"], glow=True)
    M_("visor", ellipsoid((0, -R * 0.62, H * 0.86), (R * 0.55, R * 0.1, H * 0.04)), MAT["accent"], outline=False)
    for x in (1, -1):
        M_(f"ant{x}", tube((x * R * 0.3, 0, H * 0.98), (x * R * 0.55, -R * 0.1, H * 1.16), 0.02, 0.016, segs=8), MAT["shell"])
        M_(f"antball{x}", ellipsoid((x * R * 0.57, -R * 0.1, H * 1.18), (0.035, 0.035, 0.035)), MAT["accent"])
elif E == "brute":      # hulk: wide and low, a shoulder hump, a brow, a soft ox snout, rounded horn stubs
    M_("body", ellipsoid((0, 0, H * 0.44), (R * 1.12, R * 0.95, H * 0.46), segs=24, rings=14), MAT["body"], glow=True)
    M_("belly", ellipsoid((0, -R * 0.5, H * 0.32), (R * 0.75, R * 0.5, H * 0.26)), MAT["belly"], outline=False)
    M_("hump", ellipsoid((0, R * 0.3, H * 0.74), (R * 0.95, R * 0.7, H * 0.24)), MAT["body"], glow=True)
    M_("brow", ellipsoid((0, -R * 0.72, H * 0.72), (R * 0.62, R * 0.22, H * 0.07)), MAT["horn"], outline=False)
    M_("snout", ellipsoid((0, -R * 0.9, H * 0.48), (R * 0.36, R * 0.2, H * 0.11)), MAT["snout"])
    for x in (1, -1):
        M_(f"nostril{x}", ellipsoid((x * R * 0.13, -R * 1.08, H * 0.49), (R * 0.05, R * 0.03, R * 0.04)), MAT["dark"], outline=False)
        M_(f"horn{x}", tube((x * R * 0.5, -R * 0.2, H * 0.78), (x * R * 1.02, -R * 0.3, H * 1.06), R * 0.2, R * 0.11, segs=12), MAT["horn"], glow=True)
        M_(f"horntip{x}", ellipsoid((x * R * 1.04, -R * 0.3, H * 1.08), (R * 0.13, R * 0.13, R * 0.13)), MAT["accent"])
elif E == "padded":     # round sparring sprite: a soft round body, a belly patch, two floppy leaf-ear tufts
    M_("body", ellipsoid((0, 0, H * 0.48), (R, R * 0.9, H * 0.47), segs=24, rings=14), MAT["body"], glow=True)
    M_("belly", ellipsoid((0, -R * 0.5, H * 0.34), (R * 0.6, R * 0.45, H * 0.24)), MAT["belly"], outline=False)
    M_("bellymark", ellipsoid((0, -R * 0.9, H * 0.3), (R * 0.22, R * 0.06, H * 0.08)), MAT["accent"], outline=False)
    for x in (1, -1):
        M_(f"ear{x}", ellipsoid((x * R * 0.5, R * 0.1, H * 0.98), (R * 0.2, R * 0.16, H * 0.24), rot=(-10, x * 30, 0)), MAT["body"], glow=True)
        M_(f"eartip{x}", ellipsoid((x * R * 0.66, R * 0.06, H * 1.14), (R * 0.12, R * 0.1, H * 0.09), rot=(-10, x * 30, 0)), MAT["accent"], outline=False)
    M_("brow", ellipsoid((0, -R * 0.83, H * 0.8), (R * 0.42, R * 0.08, H * 0.03)), MAT["accent"], outline=False)
else:                   # keeper: tall body, a flowing cape, a pale mask, a gold crown and a dotted halo
    M_("cape", tube((0, R * 0.25, H * 0.02), (0, R * 0.25, H * 0.78), R * 1.08, R * 0.62, segs=24, sy=0.62), MAT["cape"], glow=True)
    M_("body", ellipsoid((0, 0, H * 0.5), (R * 0.78, R * 0.68, H * 0.48), segs=24, rings=14), MAT["body"], glow=True)
    M_("sash", ellipsoid((0, -R * 0.55, H * 0.4), (R * 0.5, R * 0.18, H * 0.05)), MAT["accent"], outline=False)
    M_("mask", ellipsoid((0, -R * 0.58, H * 0.7), (R * 0.4, R * 0.15, H * 0.17)), MAT["mask"])
    M_("crownband", tube((0, 0, H * 0.93), (0, 0, H * 0.98), R * 0.36, R * 0.36, segs=24), MAT["accent"])
    for k in range(5):
        a = math.pi / 2 + (k - 2) * 0.55
        M_(f"crownpt{k}", ellipsoid((math.cos(a) * R * 0.33, -math.sin(a) * R * 0.33, H * 1.03), (R * 0.07, R * 0.07, R * 0.13)), MAT["accent"])
    for k in range(18):
        a = 2 * math.pi * k / 18
        M_(f"halo{k}", ellipsoid((math.cos(a) * R * 0.62, R * 0.3, H * 0.9 + math.sin(a) * R * 0.62), (0.022, 0.022, 0.022), segs=6, rings=4),
           MAT["gem"], outline=False)
# glowing eyes on their own bone (they squint, widen, blink)
es = SPEC["eye"]; ey = SPEC["eye_y"]; ex = SPEC["eye_dx"]
for x in (1, -1):
    M_(f"eye{x}", ellipsoid((x * R * ex * 1.0, -R * ey, EYE_Z), (R * 0.2 * es, R * 0.08, R * 0.27 * es), segs=16, rings=10), MAT["eye"], "eyes")
    M_(f"eyehi{x}", ellipsoid((x * R * ex - R * 0.06, -R * (ey + 0.08), EYE_Z + R * 0.09 * es), (R * 0.06 * es, R * 0.03, R * 0.07 * es)),
       MAT["eye_hi"], "eyes", outline=False)
    if E in ("swarmer", "shield", "padded"):
        M_(f"cheek{x}", ellipsoid((x * R * 0.6, -R * (ey - 0.1), EYE_Z - R * 0.32), (R * 0.12, R * 0.05, R * 0.07)), MAT["cheek"], outline=False)
# arms: little nubs (swarmer), stubby arms (shield), huge fists with magenta bands (brute), long arms with gold cuffs (keeper)
am = SPEC["arm"]; ax = SPEC["arm_x"]
for s_, x in (("L", 1), ("R", -1)):
    M_(f"arm{s_}", ellipsoid((x * R * ax, 0, SH_Z - 0.07 * am), (0.045 * am, 0.045 * am, 0.085 * am)), MAT["body"], f"arm.{s_}", glow=True)
    if E == "brute":
        M_(f"fist{s_}", ellipsoid((x * R * ax * 1.02, -0.01, SH_Z - 0.16 * am), (0.075 * am, 0.075 * am, 0.065 * am)), MAT["body"], f"arm.{s_}", glow=True)
        M_(f"band{s_}", tube((x * R * ax, -0.005, SH_Z - 0.105 * am), (x * R * ax, -0.005, SH_Z - 0.12 * am), 0.052 * am, 0.055 * am, segs=12), MAT["accent"], f"arm.{s_}", outline=False)
    if E == "padded":    # round mitts that hold the staff
        M_(f"fist{s_}", ellipsoid((x * R * ax * 1.02, -0.02, SH_Z - 0.12 * am), (0.05 * am, 0.05 * am, 0.05 * am)), MAT["body"], f"arm.{s_}", glow=True)
    if E == "keeper":
        M_(f"fist{s_}", ellipsoid((x * R * ax * 1.02, -0.01, SH_Z - 0.16 * am), (0.055 * am, 0.055 * am, 0.05 * am)), MAT["body"], f"arm.{s_}", glow=True)
        M_(f"cuff{s_}", tube((x * R * ax, -0.005, SH_Z - 0.11 * am), (x * R * ax, -0.005, SH_Z - 0.125 * am), 0.04 * am, 0.042 * am, segs=12), MAT["accent"], f"arm.{s_}", outline=False)
    if E != "swarmer":   # the wisp floats: no feet
        fw = {"shield": 0.3, "brute": 0.4, "keeper": 0.3, "padded": 0.32}[E]
        M_(f"foot{s_}", ellipsoid((x * R * 0.45, -R * 0.12, 0.028 * FS), (R * fw, R * 0.4, 0.032 * FS)), MAT["foot"], f"foot.{s_}")
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
if E == "padded":       # the padded training staff: a soft grey-blue shaft, a big lime foam pad on each end
    hx = -R * SPEC["arm_x"] * 1.02; hz = SH_Z - 0.12 * SPEC["arm"]; c = Vector((hx, -0.02, hz))
    top, bot = c + Vector((0, 0, 0.1)), c + Vector((0, 0, -0.36))   # held near one end: the long end points along the arm
    mesh("staff", tube(bot, top, 0.034, 0.034, segs=12), MAT["staff"], "weapon", "staff")
    for k, (p, ln) in enumerate(((bot, 0.13), (top, 0.06))):
        mesh(f"pad{k}", ellipsoid(p + Vector((0, 0, (ln * 0.4) * (-1 if k == 0 else 1))), (0.088 if k == 0 else 0.058,) * 2 + (ln * 0.62,), segs=16, rings=10), MAT["pad"], "weapon", "staff")
        mesh(f"padband{k}", tube(p - Vector((0, 0, 0.007)), p + Vector((0, 0, 0.007)), 0.045 if k else 0.07, 0.045 if k else 0.07, segs=14), MAT["padband"], "weapon", "staff", outline=False)
if E == "shield":
    sz = R * 1.05       # a big round shield with an amber rim and a sun emblem, held on the left arm
    c = Vector((R * 1.15, -R * 0.8, SH_Z - 0.06))
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
        mesh(f"shield_half{k}", bm, MAT["shield"], "shield-broken", "shield")   # the same blue-grey shield, cracked

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
    if "shield" in PB: key(PB["shield"], sc=(1, 1, 1))

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
if E == "padded":   # no content/enemies file yet: PLACEHOLDER numbers for the samples only (the game decides the real ones)
    DATA = {"id": "padded", "name": "Bouncy Bopper", "radius": 0.38, "moveSpeedTilesPerSecond": 2.2,   # numbers: PR #102, name: PR #97
            "attack": {"name": "padded staff bonk", "telegraphTicks": 16, "recoverTicks": 18}}
else:
    DATA = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "content", "enemies",
                                   {"swarmer": "swarmer", "shield": "shield", "brute": "brute", "keeper": "floor-keeper"}[E] + ".json")))
TICK = 1 / 20
FPS = 10
REST = P()
# Each type has its own guard pose and way of moving (review redesign).
GUARD = {"swarmer": P(body=B(pitch=10), arm_l=(30, 12), arm_r=(30, 12)),
         "shield":  P(body=B(pitch=0), arm_l=(40, 10), arm_r=(20, 16)),
         "brute":   P(body=B(pitch=12), arm_l=(10, 16), arm_r=(10, 16)),
         "keeper":  P(body=B(pitch=0), arm_l=(10, 14), arm_r=(10, 14)),
         "padded":  P(body=B(pitch=4), arm_l=(35, 14), arm_r=(38, 22))}[E]
def g(**kw):
    """GUARD with changes."""
    q = dict(GUARD); q.update(kw)
    for k in ("arm_l", "arm_r"): q[k] = tuple(q[k]) + (1.0,) * (3 - len(q[k]))
    return q
def gb(**kw):
    b = list(GUARD["body"]); names = ["dx", "dy", "dz", "pitch", "yaw", "roll", "sw", "sh", "sd"]
    for k, v in kw.items(): b[names.index(k)] = v
    if "sw" in kw and "sd" not in kw: b[8] = kw["sw"]
    return tuple(b)
gp = GUARD["body"][3]
ga_l, ga_r = GUARD["arm_l"], GUARD["arm_r"]

idle = []
if E == "swarmer":      # a restless flicker: quick little bobs, the tuft sways
    for i in range(8):
        b = math.sin(2 * math.pi * i / 8); c2 = math.sin(4 * math.pi * i / 8)
        idle.append(g(body=gb(dz=0.03 * H * (c2 + 1), roll=6 * b, sw=1 - 0.04 * c2, sh=1 + 0.06 * c2, pitch=gp),
                      eyes=(1, 0.15 if i == 5 else 1), arm_l=(30 + 15 * c2, 14), arm_r=(30 - 15 * c2, 14)))
    action("idle", idle, 10, True, info={"note": "restless flicker, 0.8 s loop"})
elif E == "shield":     # stands at attention, stiff and watchful: tiny breaths, one blink
    for i in range(8):
        b = math.sin(2 * math.pi * i / 8)
        idle.append(g(body=gb(dz=0.003 * H * (b + 1), sw=1 - 0.01 * b, sh=1 + 0.015 * b), eyes=(1, 0.15 if i == 5 else 1)))
    action("idle", idle, 8, True, info={"note": "stiff, watchful sentinel, 1 s loop"})
elif E == "brute":      # big heavy breaths, shoulders rolling, fists swinging a little
    for i in range(8):
        b = math.sin(2 * math.pi * i / 8)
        idle.append(g(body=gb(dz=0.008 * H * (b + 1), roll=3 * b, sw=1 + 0.04 * b, sh=1 - 0.035 * b, pitch=gp),
                      eyes=(1, 0.15 if i == 5 else 1), arm_l=(10 + 8 * b, 16), arm_r=(10 - 8 * b, 16)))
    action("idle", idle, 8, True, info={"note": "heavy breathing, 1 s loop"})
elif E == "padded":    # a bouncy sparring stance: little springy bounces, the staff tapping in time
    for i in range(8):
        b = math.sin(2 * math.pi * i / 8); c2 = abs(math.sin(2 * math.pi * i / 8))
        idle.append(g(body=gb(dz=0.012 * H * c2, roll=2 * b, sw=1 + 0.02 * (1 - c2), sh=1 - 0.025 * (1 - c2), pitch=gp),
                      eyes=(1, 0.15 if i == 5 else 1), arm_l=(35 + 4 * b, 14), arm_r=(38 + 5 * b, 22)))
    action("idle", idle, 8, True, info={"note": "bouncy sparring stance, staff upright, 1 s loop"})
else:                   # floats slowly up and down, a regal sway
    for i in range(8):
        b = math.sin(2 * math.pi * i / 8)
        idle.append(g(body=gb(dz=0.02 * H * (b + 1), roll=2 * b, sh=1 + 0.012 * b), eyes=(1, 0.15 if i == 5 else 1),
                      arm_l=(10 + 4 * b, 14), arm_r=(10 + 4 * b, 14), foot_l=(0, 0, 0.02 * H * (b + 1)), foot_r=(0, 0, 0.02 * H * (b + 1))))
    action("idle", idle, 8, True, info={"note": "slow regal float, 1 s loop"})

move = []
for i in range(6):
    ph = 2 * math.pi * i / 6; up = abs(math.sin(ph)); sn = math.sin(ph)
    if E == "swarmer":  # quick, high bouncing hops: stretch in the air, squash on landing
        move.append(g(body=gb(dz=0.22 * H * up, pitch=18, roll=4 * sn, sw=1 + 0.12 * (1 - up) - 0.06 * up, sh=1 - 0.14 * (1 - up) + 0.12 * up),
                      arm_l=(40 - 30 * up, 30), arm_r=(40 - 30 * up, 30)))
    elif E == "padded":  # springy little hops (it is a Bouncy Bopper): squash on landing, the staff held steady in guard
        move.append(g(body=gb(dz=0.1 * H * up, pitch=8, roll=3 * sn, sw=1 + 0.08 * (1 - up) - 0.03 * up, sh=1 - 0.09 * (1 - up) + 0.07 * up),
                      foot_l=(0, 0, 0.06 * H * up), foot_r=(0, 0, 0.06 * H * up)))
    elif E == "shield": # a steady march: upright, small even steps, a little side-to-side
        move.append(g(body=gb(dz=0.015 * H * up, roll=4 * sn, pitch=2),
                      foot_l=(0, -0.12 * W * sn, 0.03 * max(0, sn)), foot_r=(0, 0.12 * W * sn, 0.03 * max(0, -sn))))
    elif E == "brute":  # heavy stomps: big sway, squash on each step
        move.append(g(body=gb(dz=0.03 * H * up, pitch=16, roll=8 * sn, sw=1 + 0.07 * (1 - up), sh=1 - 0.07 * (1 - up)),
                      arm_l=(10 - 30 * sn, 18), arm_r=(10 + 30 * sn, 18),
                      foot_l=(0, -0.1 * W * sn, 0.05 * max(0, sn)), foot_r=(0, 0.1 * W * sn, 0.05 * max(0, -sn))))
    else:               # a smooth glide, the cape trailing (no steps)
        move.append(g(body=gb(dz=0.025 * H * (1 + math.sin(ph)) / 2, pitch=6, roll=2 * sn), arm_l=(-10, 18), arm_r=(-10, 18),
                      foot_l=(0, 0, 0.012 * H * (1 + math.sin(ph))), foot_r=(0, 0, 0.012 * H * (1 + math.sin(ph)))))
mfps = {"swarmer": 12, "shield": 10, "brute": 10, "keeper": 8, "padded": 10}[E]
action("move", move, mfps, True, info={"designSpeedTilesPerSecond": DATA["moveSpeedTilesPerSecond"],
       "note": {"swarmer": "quick bouncing hops", "shield": "steady march", "brute": "heavy stomps", "keeper": "smooth glide", "padded": "springy hops"}[E] + "; play at any move speed"})

def ramp(n):
    """Telegraph intensity through a wind-up: starts soft and builds to full on the last frame."""
    return [round(0.25 + 0.75 * ease(k / max(1, n - 1)), 3) for k in range(n)]
def fade(n_total):
    """Telegraph intensity through an attack: full at the impact, dims smoothly over the first half, then 0."""
    h = max(2, math.ceil(n_total / 2))
    return [round(1 - ease(k / h), 3) if k < h else 0.0 for k in range(n_total)]
TELE_NOTE = ("telegraphIntensity: per-frame alpha (0..1) for the telegraph layer. It ramps up through the wind-up "
             "and fades smoothly through the first half of the attack (no hard cut). Multiply it into the tinted layer's alpha")

def telegraph_action(name, wind, ticks, extra_tags=""):
    """Wind-up, as long as the attack's telegraph: eases into the big pose in 3 frames, then trembles."""
    n = max(3, round(ticks * TICK * FPS))
    fr = [mix(GUARD, wind, ease(k / 2.5)) for k in range(min(3, n))]
    while len(fr) < n:
        k = len(fr); q = dict(wind); b = list(wind["body"])
        b[0] += 0.006 * (1 if k % 2 else -1); b[7] *= 1 + 0.015 * (k % 2); q["body"] = tuple(b); fr.append(q)
    return action(name, fr, FPS, False, f"telegraph:0-{n - 1}{extra_tags}",
                  {"telegraphSeconds": round(ticks * TICK, 2), "telegraphTicks": ticks, "telegraphIntensity": ramp(n),
                   "note": f"lasts exactly the telegraph ({ticks} ticks). In Guided mode the wind-up holds: hold the last frame (intensity 1). " + TELE_NOTE})

def attack_action(name, hit, ticks_recover, extra=None):
    n_rec = max(3, round(ticks_recover * TICK * FPS))
    fr = [hit, hit] + [mix(hit, GUARD, ease((k + 1) / n_rec)) for k in range(n_rec)]
    return action(name, fr, FPS, False, "impact:0,recover:2-%d" % (len(fr) - 1),
                  dict({"keyFrames": {"impact": 0}, "recoverSeconds": round(ticks_recover * TICK, 2), "telegraphIntensity": fade(len(fr))}, **(extra or {})))

# WIND-UPS: the clearest pose on screen, different for each type.
if E == "swarmer":      # rears up tall, tuft flaring, leans back, the jabbing nub pulled far back
    at = DATA["attack"]
    WIND = P(body=B(dy=0.06 * W, pitch=-22, yaw=-18, sw=0.86, sh=1.3), eyes=(1.15, 1.3), arm_l=(-10, 55), arm_r=(-150, 30))
    HIT = P(body=B(dy=-0.22 * W, pitch=16, yaw=14, sw=1.1, sh=0.92), eyes=(1.1, 0.8), arm_l=(10, 20), arm_r=(92, 6, 1.9))
    telegraph_action("windup", WIND, at["telegraphTicks"])
    attack_action("attack", HIT, at["recoverTicks"], {"note": "the Swarmer's jab: a quick stretchy poke"})
if E == "brute":        # rears up, both huge fists high overhead
    at = DATA["attack"]
    BW = P(body=B(dy=0.08 * W, pitch=-22, sw=0.9, sh=1.28), eyes=(1.15, 1.3), arm_l=(-165, 20), arm_r=(-165, 20))
    telegraph_action("windup", BW, at["telegraphTicks"])
    BH = P(body=B(dy=-0.08 * W, pitch=22, sw=1.18, sh=0.86), eyes=(1.1, 0.7), arm_l=(48, 12), arm_r=(48, 12))
    attack_action("attack", BH, at["recoverTicks"], {"note": "the Brute's two-fist smash in front"})
if E == "shield":       # lifts the big shield high and leans back, ready to bash
    at = DATA["attack"]
    SW_ = P(body=B(dy=0.08 * W, pitch=-18, yaw=-20, sw=0.9, sh=1.2), eyes=(1.1, 1.25), arm_l=(-140, 25), arm_r=(-40, 35))
    telegraph_action("windup", SW_, at["telegraphTicks"])
    SB = P(body=B(dy=-0.22 * W, pitch=24, yaw=16, sw=1.1, sh=0.9), eyes=(1.1, 0.8), arm_l=(85, 0), arm_r=(20, 20))
    attack_action("attack", SB, at["recoverTicks"], {"note": "shield bash: the shield shoves forward"})
if E == "padded":       # swings the staff up and back over its shoulder, leaning back, then a big soft overhead BONK
    at = DATA["attack"]
    PW = P(body=B(dy=0.08 * W, pitch=-20, yaw=-24, sw=0.9, sh=1.2), eyes=(1.15, 1.3), arm_l=(30, 30), arm_r=(-165, 10))
    telegraph_action("windup", PW, at["telegraphTicks"])
    PH = P(body=B(dy=-0.2 * W, pitch=22, yaw=24, roll=-10, sw=1.12, sh=0.88), eyes=(1.1, 0.75), arm_l=(20, 40), arm_r=(80, 58))   # full set: a diagonal bonk, so it reads from the front (S) too
    attack_action("attack", PH, at["recoverTicks"], {"note": "padded staff bonk: a big overhead swing down in front (soft foam pad lands first)"})
if E == "keeper":
    sl, sw = DATA["attacks"][0], DATA["attacks"][1]
    KS = P(body=B(dy=0.06 * W, pitch=-16, sw=0.92, sh=1.2), eyes=(1.15, 1.3), arm_l=(-30, 150, 1.25), arm_r=(-30, 150, 1.25))
    telegraph_action("windup_slam", KS, sl["telegraphTicks"])
    KH = P(body=B(dz=-0.02, pitch=32, sw=1.2, sh=0.82), eyes=(1.1, 0.6), arm_l=(85, 20), arm_r=(85, 20))
    attack_action("slam", KH, sl["recoverTicks"], {"note": "ground slam with both fists"})
    KW = P(body=B(pitch=-6, yaw=-70, sw=1.08, sh=0.96), eyes=(1.15, 1.3), arm_l=(-10, 85), arm_r=(-10, 85))
    telegraph_action("windup_sweep", KW, sw["telegraphTicks"])
    n_rec = max(3, round(sw["recoverTicks"] * TICK * FPS))
    spin = [P(body=B(pitch=4, yaw=-70 + 360 * k / 5, sw=1.08, sh=0.95), eyes=(1.1, 0.8), arm_l=(0, 88), arm_r=(0, 88)) for k in range(6)]
    spin += [mix(spin[-1], GUARD, ease((k + 1) / n_rec)) for k in range(n_rec)]
    action("sweep", spin, FPS, False, "spin:0-5,recover:6-%d" % (len(spin) - 1),
           {"keyFrames": {"spin": "0-5"}, "recoverSeconds": round(sw["recoverTicks"] * TICK, 2), "telegraphIntensity": fade(len(spin)),
            "note": "wide sweep: one full turn with both arms out (the hit ring is all around him)"})
    call = []
    for i in range(8):   # calling for help: arms up waving, bouncing, eyes bright
        b = math.sin(2 * math.pi * i / 8)
        call.append(P(body=B(dz=0.02 * abs(b), pitch=-8, roll=6 * b, sh=1.06), eyes=(1.15, 1.2),
                      arm_l=(-15, 145 + 15 * b, 1.3), arm_r=(-15, 145 - 15 * b, 1.3)))
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
                     **({"shield / shield-broken": "draw exactly one: shield while it's up, shield-broken for a moment when it breaks (then neither until it grows back after 6 s)"} if E == "shield" else {}),
                     **({"weapon": "the padded staff, no tint. Draw it normally; stop drawing it while the enemy is disarmed (it can't attack with it)"} if E == "padded" else {})}})
if A.broken:   # broken-shield variant: hide the intact shield (it would hold out the broken one)
    for o in COLL["shield"].objects: o.hide_render = True
else:
    for o in (COLL["shield-broken"].objects if "shield-broken" in COLL else []): o.hide_render = True
arm.animation_data.action = bpy.data.actions["idle"]
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out)
