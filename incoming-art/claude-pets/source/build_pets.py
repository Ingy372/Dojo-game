"""Pets (Claude, Nov 22; Jay asked for shop cosmetics "get creative"): little companions that follow the hero. Looks only.

One .blend per pet with a tiny rig (body, head, tail, two ears or wings, four feet) and two loops, idle and walk, in the
v2 glossy look; rendered with the house sprite renderer in 8 directions at 80 px per tile.

    blender -b -P build_pets.py -- --pet red-panda --out red-panda.blend
    blender -b red-panda.blend -P ../../tools/render_sprites.py -- --out ../sprites/red-panda --name pet-red-panda --size 96 --ortho 1.2 --anchor-y 0.8
"""
import bpy, bmesh, math, sys, os, argparse
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
sys.path.insert(0, os.path.join(HERE, "..", "..", "claude-hero-v2", "source"))
from toon_kit import outline_material, add_hull, ellipsoid, tube  # noqa: E402
from hero_shading import glossy  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--pet", required=True)
ap.add_argument("--out", required=True)
A = ap.parse_args(argv)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
OUTLINE = outline_material()
OW = 0.014
coll = bpy.data.collections.new("L_pet")
scene.collection.children.link(coll)
coll["sprite_order"] = 0
coll["sprite_tint"] = False

root = bpy.data.objects.new("CHAR_ROOT", None)
scene.collection.objects.link(root)
arm = bpy.data.armatures.new("PetRig")
rig = bpy.data.objects.new("PetRig", arm)
scene.collection.objects.link(rig)
rig.parent = root
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode="EDIT")
BONES = {"body": ((0, 0, 0.12), (0, 0, 0.22), None), "head": ((0, -0.05, 0.25), (0, -0.05, 0.35), "body"),
         "tail": ((0, 0.1, 0.15), (0, 0.2, 0.15), "body"), "ear.L": ((0.06, -0.05, 0.33), (0.06, -0.05, 0.4), "head"),
         "ear.R": ((-0.06, -0.05, 0.33), (-0.06, -0.05, 0.4), "head"), "wing.L": ((0.08, 0, 0.2), (0.16, 0, 0.2), "body"),
         "wing.R": ((-0.08, 0, 0.2), (-0.16, 0, 0.2), "body"), "foot.FL": ((0.05, -0.06, 0.04), (0.05, -0.06, 0.08), None),
         "foot.FR": ((-0.05, -0.06, 0.04), (-0.05, -0.06, 0.08), None), "foot.BL": ((0.05, 0.06, 0.04), (0.05, 0.06, 0.08), None),
         "foot.BR": ((-0.05, 0.06, 0.04), (-0.05, 0.06, 0.08), None)}
for name, (h, t, par) in BONES.items():
    b = arm.edit_bones.new(name)
    b.head, b.tail = h, t
    if par:
        b.parent = arm.edit_bones[par]
bpy.ops.object.mode_set(mode="OBJECT")
rig.data.pose_position = "REST"
bpy.context.view_layer.update()


def piece(bm, color, bone, outline=True, rim=0.25, glow=0.0, flat=False):
    me = bpy.data.meshes.new(f"{bone}_{len(coll.objects)}")
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    me.materials.append(glossy(f"pet_{color}_{glow}_{flat}", color, rim=rim, glow=glow, flat=flat))
    ob = bpy.data.objects.new(me.name, me)
    coll.objects.link(ob)
    ob.parent = rig
    ob.parent_type = "BONE"
    ob.parent_bone = bone
    pb = rig.pose.bones[bone]
    ob.matrix_parent_inverse = (rig.matrix_world @ pb.matrix @ Matrix.Translation((0, pb.bone.length, 0))).inverted()
    if outline:
        h = add_hull(ob, coll, OUTLINE, OW)
        h.parent, h.parent_type, h.parent_bone = rig, "BONE", bone
        h.matrix_parent_inverse = ob.matrix_parent_inverse.copy()
        h.matrix_basis = ob.matrix_basis.copy()
    return ob


def E(c, s, color, bone, rot=(0, 0, 0), **kw):
    return piece(ellipsoid(Vector(c), s, rot=rot, segs=18, rings=12), color, bone, **kw)


def T(p0, p1, r0, r1, color, bone, **kw):
    return piece(tube(Vector(p0), Vector(p1), r0, r1, segs=14), color, bone, **kw)


def cone(base, h, r, color, bone, rot=(0, 0, 0), **kw):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=r, radius2=0.0, depth=h)
    bmesh.ops.transform(bm, matrix=Matrix.Translation(Vector(base)) @ Euler([math.radians(x) for x in rot]).to_matrix().to_4x4() @ Matrix.Translation((0, 0, h / 2)), verts=bm.verts)
    return piece(bm, color, bone, **kw)


def eyes(z, y, dx=0.042, size=0.03, iris="#2a1e22"):
    for sx in (1, -1):
        E((sx * dx, y, z), (size, 0.012, size * 1.25), iris, "head", outline=False, flat=True)
        E((sx * dx - 0.008, y - 0.008, z + size * 0.45), (size * 0.38, 0.006, size * 0.38), "#ffffff", "head", outline=False, flat=True)
        E((sx * dx + 0.01, y - 0.008, z - size * 0.45), (size * 0.18, 0.006, size * 0.18), "#ffffff", "head", outline=False, flat=True)


def feet(color, z=0.035, r=0.032):
    for n, (x, y) in (("FL", (0.055, -0.06)), ("FR", (-0.055, -0.06)), ("BL", (0.055, 0.06)), ("BR", (-0.055, 0.06))):
        E((x, y, z), (r, r * 1.1, r * 0.9), color, f"foot.{n}")


HOVER = False


def red_panda():
    O, W, D = "#d8642a", "#fbf3e6", "#3a2622"
    E((0, 0.02, 0.15), (0.11, 0.14, 0.1), O, "body")
    E((0, -0.07, 0.29), (0.115, 0.1, 0.095), O, "head")
    E((0, -0.15, 0.27), (0.07, 0.04, 0.05), W, "head", outline=False)
    E((0, -0.185, 0.29), (0.016, 0.012, 0.012), D, "head", outline=False)
    for sx in (1, -1):
        E((sx * 0.065, -0.155, 0.32), (0.03, 0.015, 0.022), W, "head", outline=False)
        E((sx * 0.085, -0.06, 0.37), (0.04, 0.02, 0.045), O, f"ear.{'L' if sx > 0 else 'R'}")
        E((sx * 0.085, -0.075, 0.365), (0.022, 0.006, 0.028), W, f"ear.{'L' if sx > 0 else 'R'}", outline=False)
    eyes(0.3, -0.165)
    for i in range(4):
        E((0, 0.14 + i * 0.045, 0.16 + i * 0.02), (0.045, 0.03, 0.045), O if i % 2 == 0 else D, "tail", outline=(i == 3))
    feet(D)


def baby_dragon():
    global HOVER
    G, B, Y = "#3fae6a", "#f3e2a8", "#f2c14e"
    E((0, 0.02, 0.16), (0.1, 0.11, 0.11), G, "body")
    E((0, -0.07, 0.15), (0.065, 0.03, 0.08), B, "body", outline=False)
    E((0, -0.05, 0.31), (0.11, 0.1, 0.095), G, "head")
    E((0, -0.14, 0.28), (0.06, 0.04, 0.04), G, "head")
    for sx in (1, -1):
        cone((sx * 0.05, -0.02, 0.38), 0.07, 0.022, Y, f"ear.{'L' if sx > 0 else 'R'}", rot=(-20, sx * 20, 0))
        E((sx * 0.13, 0.03, 0.22), (0.07, 0.015, 0.045), "#2f8f5b", f"wing.{'L' if sx > 0 else 'R'}", rot=(0, sx * -25, 0))
    eyes(0.32, -0.145, dx=0.045)
    T((0, 0.1, 0.12), (0, 0.22, 0.08), 0.045, 0.012, G, "tail")
    cone((0, 0.22, 0.08), 0.05, 0.02, Y, "tail", rot=(-90, 0, 0))
    feet(G)


def spirit_fox():
    global HOVER
    HOVER = True
    Wt, L, Bl = "#f4f1ff", "#c9b8ff", "#7fd8ff"
    E((0, 0.02, 0.16), (0.09, 0.12, 0.085), Wt, "body", glow=0.4)
    E((0, -0.06, 0.29), (0.1, 0.09, 0.085), Wt, "head", glow=0.4)
    E((0, -0.14, 0.27), (0.045, 0.05, 0.035), Wt, "head", glow=0.4)
    E((0, -0.19, 0.275), (0.013, 0.01, 0.01), "#3a2a4a", "head", outline=False)
    for sx in (1, -1):
        cone((sx * 0.055, -0.05, 0.34), 0.1, 0.035, Wt, f"ear.{'L' if sx > 0 else 'R'}", rot=(0, sx * 15, 0), glow=0.4)
        E((sx * 0.07, -0.13, 0.34), (0.02, 0.005, 0.01), L, "head", outline=False, flat=True)
    eyes(0.3, -0.145, iris="#5a3aa8")
    E((0, 0.18, 0.21), (0.06, 0.11, 0.06), Wt, "tail", rot=(30, 0, 0), glow=0.4)
    E((0, 0.27, 0.27), (0.045, 0.05, 0.045), Bl, "tail", glow=0.7)
    feet(L, r=0.026)


def lucky_koi():
    global HOVER
    HOVER = True
    Or, Wt = "#ff8a3d", "#fbf6ee"
    E((0, 0.0, 0.22), (0.075, 0.15, 0.08), Wt, "body")
    E((0.02, -0.02, 0.27), (0.05, 0.08, 0.04), Or, "body", outline=False)
    E((-0.03, 0.06, 0.25), (0.04, 0.05, 0.03), Or, "body", outline=False)
    E((0, -0.12, 0.23), (0.07, 0.07, 0.07), Wt, "head")
    E((0, -0.15, 0.27), (0.05, 0.04, 0.03), Or, "head", outline=False)
    eyes(0.25, -0.175, dx=0.04, size=0.022)
    for sx in (1, -1):
        E((sx * 0.08, -0.04, 0.2), (0.05, 0.03, 0.012), Or, f"wing.{'L' if sx > 0 else 'R'}", rot=(0, sx * 30, 0))
        E((sx * 0.04, 0.24, 0.24), (0.05, 0.06, 0.012), Or, "tail", rot=(0, sx * 35, 0))
    E((0, 0.0, 0.31), (0.012, 0.07, 0.03), Or, "body")


def wise_owl():
    Br, Cr, Y = "#9a7a5a", "#efe0c4", "#ffb020"
    E((0, 0.0, 0.18), (0.11, 0.1, 0.13), Br, "body")
    E((0, -0.07, 0.16), (0.07, 0.03, 0.09), Cr, "body", outline=False)
    E((0, -0.02, 0.33), (0.11, 0.095, 0.09), Br, "head")
    for sx in (1, -1):
        E((sx * 0.045, -0.095, 0.33), (0.042, 0.01, 0.042), Cr, "head", outline=False, flat=True)
        cone((sx * 0.07, -0.02, 0.39), 0.06, 0.025, Br, f"ear.{'L' if sx > 0 else 'R'}", rot=(0, sx * 25, 0))
        E((sx * 0.12, 0.01, 0.18), (0.035, 0.06, 0.1), "#7a5a3a", f"wing.{'L' if sx > 0 else 'R'}")
    eyes(0.335, -0.11, dx=0.045, size=0.028, iris="#2a1e22")
    cone((0, -0.115, 0.31), 0.03, 0.014, Y, "head", rot=(180, 0, 0))
    for sx in (1, -1):
        E((sx * 0.04, -0.04, 0.04), (0.03, 0.035, 0.015), Y, f"foot.{'FL' if sx > 0 else 'FR'}")


def little_turtle():
    S, Sk, D = "#5aa860", "#c8d98a", "#3f7a44"
    E((0, 0.02, 0.13), (0.13, 0.15, 0.085), S, "body")
    T((0, 0.02, 0.05), (0, 0.02, 0.08), 0.135, 0.14, "#e8d9a0", "body")
    for (x, y) in ((0, 0.02), (0.06, -0.05), (-0.06, -0.05), (0.06, 0.09), (-0.06, 0.09)):
        E((x, y, 0.2), (0.035, 0.035, 0.012), D, "body", outline=False)
    E((0, -0.17, 0.15), (0.065, 0.06, 0.06), Sk, "head")
    eyes(0.165, -0.225, dx=0.03, size=0.02)
    E((0, 0.18, 0.08), (0.02, 0.04, 0.015), Sk, "tail")
    feet(Sk, z=0.04, r=0.035)


BUILD = {"red-panda": red_panda, "baby-dragon": baby_dragon, "spirit-fox": spirit_fox, "lucky-koi": lucky_koi,
         "wise-owl": wise_owl, "little-turtle": little_turtle}
BUILD[A.pet]()
rig.data.pose_position = "POSE"
if A.pet == "baby-dragon":
    HOVER = True
if A.pet == "lucky-koi":
    for b in ("foot.FL", "foot.FR", "foot.BL", "foot.BR"):
        pass
pb = rig.pose.bones


def key(frame):
    for b in pb:
        b.keyframe_insert("location", frame=frame)
        b.keyframe_insert("rotation_euler", frame=frame)
        b.keyframe_insert("scale", frame=frame)


for b in pb:
    b.rotation_mode = "XYZ"


def make_action(name, n, fps, fn):
    act = bpy.data.actions.new(name)
    act["sprite_fps"] = fps
    act["sprite_loop"] = True
    act.use_fake_user = True
    rig.animation_data_create()
    rig.animation_data.action = act
    for f in range(1, n + 1):
        u = (f - 1) / n
        for b in pb:
            b.location = (0, 0, 0)
            b.rotation_euler = (0, 0, 0)
            b.scale = (1, 1, 1)
        fn(u)
        key(f)
    act.frame_range = (1, n)
    act.use_frame_range = True
    return act


TAU = math.tau
hover = 0.12 if HOVER else 0.0


def idle(u):
    s = math.sin(u * TAU)
    pb["body"].location = (0, 0.012 * s + hover * (1 + 0.15 * s), 0)          # bone Y is up the bone (world Z)
    pb["body"].scale = (1 + 0.02 * s, 1 - 0.02 * s, 1 + 0.02 * s)
    pb["head"].rotation_euler = (0, 0, 0.12 * math.sin(u * TAU + 1))
    pb["tail"].rotation_euler = (0, 0, 0.35 * math.sin(u * TAU * 2))
    for side, sx in (("L", 1), ("R", -1)):
        pb[f"ear.{side}"].rotation_euler = (0.1 * max(0, math.sin(u * TAU * 2 + 0.5)) * sx, 0, 0)
        pb[f"wing.{side}"].rotation_euler = (0.5 * math.sin(u * TAU * (3 if HOVER else 1)), 0, 0)
    if HOVER:
        for n in ("FL", "FR", "BL", "BR"):
            pb[f"foot.{n}"].location = (0, hover * (1 + 0.15 * s), 0)


def walk(u):
    hop = abs(math.sin(u * TAU))
    pb["body"].location = (0, 0.05 * hop + hover, 0)
    pb["body"].rotation_euler = (0.12 * math.cos(u * TAU), 0, 0)
    pb["head"].rotation_euler = (-0.08 * math.cos(u * TAU), 0, 0)
    pb["tail"].rotation_euler = (0, 0, 0.5 * math.sin(u * TAU * 2))
    for side, sx in (("L", 1), ("R", -1)):
        pb[f"wing.{side}"].rotation_euler = (0.8 * math.sin(u * TAU * 2), 0, 0)
    for n, ph in (("FL", 0), ("BR", 0), ("FR", 0.5), ("BL", 0.5)):
        lift = max(0.0, math.sin((u + ph) * TAU)) * 0.04
        pb[f"foot.{n}"].location = (0, lift + (hover + 0.05 * hop if HOVER else 0), 0)


make_action("idle", 12, 10, idle)
a = make_action("walk", 8, 12, walk)
a["sprite_stride_tiles"] = 0.5
a["sprite_design_speed"] = 3.0
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("PET", A.pet)
