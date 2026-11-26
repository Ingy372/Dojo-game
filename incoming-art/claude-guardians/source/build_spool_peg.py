"""The Spool Peg (Claude, Nov 25; Jay asked for its real art): the Loom Keeper's three glowing spools that appear around the
Weaving Loft at half health. A short wooden stake on a round foot with a big spool on top, wound with glowing gold thread,
a loose gold thread curling down and a few sparkles. Passive: idle (a slow bob and spin), hit (a wobble), defeat (it
bursts into light and sparkles, like every monster). Rendered at the house standard (80 px per tile, 128 px, 1.6 tiles).

    blender -b -P incoming-art/claude-guardians/source/build_spool_peg.py -- --out <file>.blend
"""
import bpy, math, sys, os, argparse, json
from mathutils import Vector, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material, outline_material, hull_material, add_hull, ellipsoid, tube, OUTLINE_W

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True)
A = ap.parse_args(argv)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "SpoolPeg"

MAT = {
    "wood": toon_material("WOOD", "#c08a52"),
    "wood_dark": toon_material("WOODDARK", "#7e5533"),
    "gold": toon_material("GOLD", "#ffd36b", shadow=0.85, highlight=1.15),
    "goldflat": toon_material("GOLDFLAT", "#ffe9a8", shadow=1.0, highlight=1.0),
    "light": toon_material("LIGHTFLAT", "#fff6c8", shadow=1.0, highlight=1.0),
    "spark": toon_material("SPARKFLAT", "#ffe48a", shadow=1.0, highlight=1.0),
}
OUTLINE = outline_material()
GLOW = hull_material("GLOW", "#ffd86b")
TELE = hull_material("TELEGRAPH", "#ffffff")

LAYERS = ["body", "glow", "telegraph", "light"]
COLL = {}
for i, name in enumerate(LAYERS):
    c = bpy.data.collections.new("L_" + name); scene.collection.children.link(c)
    c["sprite_order"] = i
    c["sprite_tint"] = name == "telegraph"
    c["sprite_overlay"] = name in ("glow", "telegraph")
    c["sprite_optional"] = name == "telegraph"
    COLL[name] = c
rig_coll = bpy.data.collections.new("RIG"); scene.collection.children.link(rig_coll)

# ---- rig: root, body (the whole peg), spool (spins), light and sparks (defeat)
root = bpy.data.objects.new("CHAR_ROOT", None); scene.collection.objects.link(root)
arm_data = bpy.data.armatures.new("PegRig")
arm = bpy.data.objects.new("PegRig", arm_data); rig_coll.objects.link(arm); arm.parent = root
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode="EDIT")
eb = arm_data.edit_bones
def bone(name, head, tail, parent=None):
    b = eb.new(name); b.head, b.tail = Vector(head), Vector(tail)
    b.align_roll(Vector((1, 0, 0)).cross((b.tail - b.head).normalized()))
    if parent: b.parent = eb[parent]
    b.use_deform = False
H = 0.62     # top of the spool, in tiles
SZ = 0.5     # spool centre height
bone("root", (0, 0, 0), (0, 0, 0.1))
bone("body", (0, 0, 0), (0, 0, H * 0.5), "root")
bone("spool", (0, 0, SZ), (0, 0, SZ + 0.05), "body")
bone("light", (0, 0, SZ), (0, 0, SZ + 0.05), "root")
bone("sparks", (0, 0, SZ), (0, 0, SZ + 0.05), "root")
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
        obs.append(add_hull(ob, COLL["glow"], GLOW, OUTLINE_W + 0.04, name_suffix="_glow"))
        obs.append(add_hull(ob, COLL["telegraph"], TELE, OUTLINE_W + 0.05, name_suffix="_tele"))
    for o in obs:
        mw = o.matrix_world.copy(); o.parent = arm; o.parent_type = "BONE"; o.parent_bone = bone_name
        bpy.context.view_layer.update(); o.matrix_world = mw
    return ob

# ---- the peg: a round wooden foot, a short stake, a big spool wound with glowing gold thread
mesh("foot", tube((0, 0, 0.0), (0, 0, 0.05), 0.22, 0.2, segs=20), MAT["wood_dark"], "body", "body")
mesh("footrim", tube((0, 0, 0.045), (0, 0, 0.06), 0.2, 0.18, segs=20), MAT["wood"], "body", "body", outline=False)
mesh("stake", tube((0, 0, 0.05), (0, 0, SZ - 0.1), 0.06, 0.05, segs=12), MAT["wood_dark"], "body", "body")
mesh("core", tube((0, 0, SZ - 0.12), (0, 0, SZ + 0.12), 0.07, 0.07, segs=16), MAT["wood_dark"], "body", "spool")
mesh("thread", tube((0, 0, SZ - 0.085), (0, 0, SZ + 0.085), 0.17, 0.17, segs=24), MAT["goldflat"], "body", "spool", glow=True)
for k, z in enumerate((SZ - 0.06, SZ - 0.02, SZ + 0.02, SZ + 0.06)):   # wound rows of thread
    mesh(f"wind{k}", tube((0, 0, z - 0.004), (0, 0, z + 0.004), 0.175, 0.175, segs=24), MAT["gold"], "body", "spool", outline=False)
for e, z0, z1 in (("bot", SZ - 0.12, SZ - 0.085), ("top", SZ + 0.085, SZ + 0.12)):
    mesh(f"rim{e}", tube((0, 0, z0), (0, 0, z1), 0.21, 0.21, segs=24), MAT["wood"], "body", "spool", glow=True)
mesh("cap", tube((0, 0, SZ + 0.12), (0, 0, SZ + 0.15), 0.05, 0.035, segs=12), MAT["wood_dark"], "body", "spool")
# a loose gold thread curling down from the spool to the floor
pts = [(0.15, -0.02, SZ), (0.22, -0.08, SZ - 0.12), (0.2, -0.16, SZ - 0.26), (0.26, -0.2, 0.08), (0.34, -0.18, 0.015)]
for k in range(len(pts) - 1):
    mesh(f"loose{k}", tube(pts[k], pts[k + 1], 0.016, 0.014, segs=6), MAT["gold"], "body", "body", outline=False)
# three little sparkles around the spool
for k in range(3):
    a = 2 * math.pi * k / 3 + 0.5
    mesh(f"glint{k}", ellipsoid((math.cos(a) * 0.3, math.sin(a) * 0.3, SZ + 0.08 + 0.05 * (k - 1)), (0.025, 0.025, 0.045), segs=4, rings=2),
         MAT["spark"], "body", "spool", outline=False)

# ---- defeat: a warm light orb and sparkles (scale 0 = hidden until the defeat)
mesh("orb", ellipsoid((0, 0, SZ), (0.17, 0.17, 0.17)), MAT["light"], "light", "light", outline=False)
for i in range(7):
    a = i * 2 * math.pi / 7
    rr = (0.07 if i % 2 else 0.05) + 0.01
    mesh(f"spark{i}", ellipsoid((math.cos(a) * 0.28, math.sin(a) * 0.28, SZ + (i % 3 - 1) * 0.12), (rr * 0.6, rr * 0.6, rr), segs=4, rings=2),
         MAT["spark"], "light", "sparks", outline=False)

# ---- posing
def apply(f, body=(0, 0, 0, 0, 0, 1, 1), spin=0.0, light=(0, 0), sparks=(0, 0, 0)):
    """body: dz, pitch, roll, yaw (degrees), squash width, height, (unused). spin: spool turn (degrees)."""
    def key(pb, loc=None, rot=None, sc=None):
        if loc is not None: pb.location = loc; pb.keyframe_insert("location", frame=f)
        if rot is not None: pb.rotation_euler = Euler([math.radians(v) for v in rot], "XYZ"); pb.keyframe_insert("rotation_euler", frame=f)
        if sc is not None: pb.scale = sc; pb.keyframe_insert("scale", frame=f)
    dz, pitch, roll, yaw, sw, sh, _ = body
    key(PB["body"], loc=(0, dz, 0), rot=(pitch, yaw, -roll), sc=(sw, sh, sw))
    key(PB["spool"], rot=(0, spin, 0))
    key(PB["light"], loc=(0, light[0], 0), sc=(max(light[1], 0),) * 3)
    key(PB["sparks"], loc=(0, sparks[0], 0), rot=(0, sparks[2], 0), sc=(max(sparks[1], 0),) * 3)

def action(name, frames, fps, loop, tags="", info=None):
    act = bpy.data.actions.new(name); act.use_fake_user = True
    arm.animation_data_create(); arm.animation_data.action = act
    for i, kw in enumerate(frames): apply(i + 1, **kw)
    curves = getattr(act, "fcurves", None)
    if curves is None:
        curves = [fc for lay in act.layers for st in lay.strips for cb in st.channelbags for fc in cb.fcurves]
    for fc in curves:
        for k in fc.keyframe_points: k.interpolation = "LINEAR"
    act["sprite_fps"] = fps; act["sprite_loop"] = loop; act["sprite_tags"] = tags
    act["sprite_order"] = len([a for a in bpy.data.actions if "sprite_fps" in a]) - 1
    if info: act["sprite_info"] = json.dumps(info)
    act.use_frame_range = True; act.frame_start, act.frame_end = 1, len(frames)
    return act

# IDLE: a slow bob, the spool turning, 1 s loop
idle = [dict(body=(0.015 * (1 + math.sin(2 * math.pi * i / 8)), 0, 2 * math.sin(2 * math.pi * i / 8), 0, 1, 1, 1), spin=i * 45) for i in range(8)]
action("idle", idle, 8, True, info={"note": "a slow bob, the spool turning: 1 s loop"})
action("move", idle, 8, True, info={"note": "it never moves; same as idle"})
# HIT: a quick wobble, 3 frames at 12 fps
action("hit", [dict(body=(0, -14, 10, 0, 1.1, 0.88, 1), spin=20), dict(body=(0, 8, -6, 0, 0.96, 1.05, 1), spin=35), dict(body=(0, 0, 0, 0, 1, 1, 1), spin=40)], 12, False, "recoil:0")
action("stagger", [dict(body=(0, 0, 4 * math.sin(i), 0, 1, 1, 1), spin=i * 30) for i in range(4)], 10, True, info={"note": "never staggered; a small wobble"})
# DEFEAT: the thread flares, the spool shrinks into a warm ball of light that floats up in sparkles (set free)
d = [dict(body=(0, -10, 8, 0, 1.12, 0.88, 1), spin=30), dict(body=(0.02, 0, 0, 0, 1.08, 1.08, 1), spin=60)]
for k in range(1, 5):
    t = k / 4
    d.append(dict(body=(0.12 * t, 0, 0, 0, 1 - 0.95 * t, 1 - 0.95 * t, 1), spin=60 + 90 * t, light=(0.05 * t, 0.4 + 0.8 * t), sparks=(0, 0.3 + 0.7 * t, 40 * t)))
for k in range(1, 6):
    t = k / 5
    d.append(dict(body=(0, 0, 0, 0, 0, 0, 1), light=(0.05 + 0.4 * t, 1.2 * (1 - t) ** 1.5), sparks=(0.5 * t, (1 + 0.3 * t) * (1 - t ** 3), 40 + 60 * t)))
action("defeat", d, 12, False, "light:2,gone:10", {"keyFrames": {"light": 2, "gone": 10}, "removeAfter": True,
       "note": "bursts into light and sparkles (set free). The last frame is empty"})

scene["sprite_meta"] = json.dumps({"enemy": "spool-peg", "name": "Spool Peg",
    "sizeTiles": {"bodyWidth": 0.42, "bodyHeight": H, "radiusInData": 0.35},
    "tintGuidance": {"mode": "multiply (Phaser setTint)", "body": "no tint", "glow": "no tint, always drawn (soft gold rim)",
                     "telegraph": "optional, never used (it never attacks)", "light": "no tint, always drawn (only the defeat has anything in it)"}})
arm.animation_data.action = bpy.data.actions["idle"]
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out)
