"""Skins for the v2 hero (Claude, Nov 22; Jay: "create different skins that players could purchase with in game currency").

Adds three new pick-one layer groups to a v2 hero model (player_hero2_a|b.blend), built on the same rig so they move
with every animation:

  * outfit  (L_outfit-<id>): a full costume over the gi (the gi underneath is still there, and the BELT IS ALWAYS IN
             FRONT: the belt is a base layer, so it cuts its own hole through every outfit);
  * hat     (L_hat-<id>): headbands, hoods, helmets, crowns, masks;
  * back    (L_back-<id>): capes, wings, a tail, a scroll, a bo staff.

Every piece is full colour (no tint) in the glossy v2 shading with the v2 outline. Positions come from the model's own
parts, so the same script fits body A and body B.

    blender -b player_hero2_a.blend -P build_skins.py -- --save player_hero2_skins_a.blend
"""
import bpy, bmesh, sys, os, math, argparse, json
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from hero_shading import glossy  # noqa: E402
from toon_kit import ellipsoid, tube, box, strip  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--save", default="")
ap.add_argument("--only", default="")
a = ap.parse_args(argv)
ONLY = set(x for x in a.only.split(",") if x)

OUTLINE_W = 0.019
rig = bpy.data.objects["MartialArtistRig"]
rig.data.pose_position = "REST"
bpy.context.view_layer.update()
OUTLINE = bpy.data.materials["OUTLINE"]
ORDER = {"outfit": 40, "hat": 60, "back": 80}
counter = {"outfit": 0, "hat": 0, "back": 0}


def W(name):
    return bpy.data.objects[name]


def bbox(ob):
    pts = [ob.matrix_world @ v.co for v in ob.data.vertices]
    return (Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))),
            Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts))))


def centre(ob):
    lo, hi = bbox(ob)
    return (lo + hi) / 2, (hi - lo) / 2


HEAD_C, HEAD_R = centre(W("head"))
NECK_C, NECK_R = centre(W("neck"))
TORSO_C, TORSO_R = centre(W("gi_torso"))


def layer(group, sid):
    name = f"L_{group}-{sid}"
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    c["sprite_order"] = ORDER[group] + counter[group]
    counter[group] += 1
    c["sprite_tint"] = False
    c["sprite_overlay"] = False
    c["sprite_group"] = group
    return c


def hull(ob, coll, width=OUTLINE_W):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * width
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(ob.name + "_outline")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(OUTLINE)
    h = bpy.data.objects.new(ob.name + "_outline", me)
    coll.objects.link(h)
    h.parent = ob.parent
    h.parent_type = ob.parent_type
    h.parent_bone = ob.parent_bone
    h.matrix_parent_inverse = ob.matrix_parent_inverse.copy()
    h.matrix_basis = ob.matrix_basis.copy()
    return h


def piece(name, bm, mat, coll, bone, outline=True, smooth=True):
    """A mesh built in world (rest pose) coordinates, attached to a bone where it stands."""
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = smooth
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    ob.parent = rig
    ob.parent_type = "BONE"
    ob.parent_bone = bone
    pb = rig.pose.bones[bone]
    # bone parenting: world = rig @ bone(tail-based) @ parent_inverse @ basis; keep the mesh where it was built
    bone_world = rig.matrix_world @ pb.matrix @ Matrix.Translation((0, pb.bone.length, 0))
    ob.matrix_parent_inverse = bone_world.inverted()
    if outline:
        hull(ob, coll)
    return ob


def garment(coll, sid, mats, inflate=0.007, pick=None, scale_xy=None):
    """Copies every gi piece (sleeves, torso, skirt, legs, lapels) a little bigger, in the outfit's colours.
    mats: {'main': m, 'lapel': m, <gi piece name>: m}; scale_xy: {piece: factor} widens a piece around its axis."""
    for src in [o for o in bpy.data.collections["L_gi"].objects if not o.name.endswith("_outline")]:
        if pick and not pick(src.name):
            continue
        ob = src.copy()
        ob.data = src.data.copy()
        ob.name = f"o_{sid}_{src.name}"
        coll.objects.link(ob)
        mat = mats.get(src.name) or (mats["lapel"] if "lapel" in src.name or "collar" in src.name else mats["main"])
        ob.data.materials.clear()
        ob.data.materials.append(mat)
        bm = bmesh.new()
        bm.from_mesh(ob.data)
        bm.normal_update()
        f = (scale_xy or {}).get(src.name.split(".")[0])
        if f:
            cx = sum((v.co for v in bm.verts), Vector()) / len(bm.verts)
            for v in bm.verts:
                v.co.x = cx.x + (v.co.x - cx.x) * f
                v.co.y = cx.y + (v.co.y - cx.y) * f
        for v in bm.verts:
            v.co += v.normal * inflate
        bm.to_mesh(ob.data)
        bm.free()
        for p in ob.data.polygons:
            p.use_smooth = True
        if "lapel" not in src.name and "collar" not in src.name:
            hull(ob, coll)


def band_ring(name, src_name, coll, mat, at=0.0, height=0.035, grow=0.018, outline=True):
    """A ring around a gi piece (cuff, hem, armband): at = 0 bottom end .. 1 top end of the piece."""
    src = W(src_name)
    lo, hi = bbox(src)
    c = (lo + hi) / 2
    r = max(hi.x - lo.x, hi.y - lo.y) / 2 + grow
    z = lo.z + (hi.z - lo.z) * at
    bm = tube((c.x, c.y, z), (c.x, c.y, z + height), r, r, segs=16)
    return piece(name, bm, mat, coll, src.parent_bone, outline)


def head_shell(scale=(1.13, 1.13, 1.12), lift=0.02, open_face=True, cut_below=-0.5, front_cut=-0.25, top_open=0.45):
    """A hood/helmet shell around the head with the face left open."""
    bm = ellipsoid(HEAD_C + Vector((0, 0, lift)), (HEAD_R.x * scale[0], HEAD_R.y * scale[1], HEAD_R.z * scale[2]), segs=24, rings=16)
    kill = []
    for v in bm.verts:
        d = v.co - HEAD_C
        ny, nz = d.y / HEAD_R.y, d.z / HEAD_R.z
        if nz < cut_below or (open_face and ny < front_cut and nz < top_open):
            kill.append(v)
    bmesh.ops.delete(bm, geom=kill, context="VERTS")
    # give the shell some thickness so its rim reads
    ret = bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.012)
    return bm


def on(sid):
    return not ONLY or sid in ONLY


# ================================================================ OUTFITS
SPEC = {}


def outfit(sid, name, main, trim, extra=None, pick=None, piece_mats=None, scale_xy=None):
    SPEC[sid] = {"group": "outfit", "name": name}
    if not on(sid):
        return
    coll = layer("outfit", sid)
    mats = {"main": glossy(f"{sid}_main", main), "lapel": glossy(f"{sid}_trim", trim, rim=0.12)}
    for k, col in (piece_mats or {}).items():
        mats[k] = glossy(f"{sid}_{k}", col)
    garment(coll, sid, mats, pick=pick, scale_xy=scale_xy)
    trimm = mats["lapel"]
    for side in "LR":
        band_ring(f"o_{sid}_cuff.{side}", f"gi_sleeve.{side}", coll, trimm, at=0.0, height=0.032)
        band_ring(f"o_{sid}_hem.{side}", f"gi_shin.{side}", coll, trimm, at=0.0, height=0.03)
    if extra:
        extra(coll, sid, mats)


def shoulder_scales(coll, sid, mat, n=3, size=0.06):
    for side, sx in (("L", 1), ("R", -1)):
        lo, hi = bbox(W(f"gi_shoulder.{side}"))
        c = (lo + hi) / 2
        for i in range(n):
            p = Vector((c.x + sx * 0.03, c.y - 0.0, hi.z - 0.012 - i * size * 0.6))
            bm = ellipsoid(p, (size * 1.05, size * 1.0, size * 0.5), rot=(0, sx * 25, 0), segs=14, rings=8)
            piece(f"o_{sid}_scale{i}.{side}", bm, mat, coll, f"upper_arm.{side}")


def x_dragon(coll, sid, m):
    gold = glossy("gold", "#f2c14e", rim=0.25)
    shoulder_scales(coll, sid, gold)
    for i, z in enumerate((0.93, 0.85, 0.77)):   # little gold back spikes
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.028, radius2=0.0, depth=0.07)
        bmesh.ops.transform(bm, matrix=Matrix.Translation((0, TORSO_C.y + TORSO_R.y + 0.02, z)) @ Euler((math.radians(-70), 0, 0)).to_matrix().to_4x4(), verts=bm.verts)
        piece(f"o_{sid}_spike{i}", bm, gold, coll, "chest")


def x_ninja(coll, sid, m):
    purple = m["lapel"]
    for side in "LR":
        band_ring(f"o_{sid}_wrap1.{side}", f"gi_sleeve.{side}", coll, purple, at=0.35, height=0.022)
        band_ring(f"o_{sid}_wrap2.{side}", f"gi_shin.{side}", coll, purple, at=0.45, height=0.022)
    for i, sx in enumerate((0.03, -0.03)):   # sash tails at the back of the belt line
        p0 = Vector((sx, TORSO_C.y + TORSO_R.y + 0.02, 0.66))
        bm = strip(p0, p0 + Vector((sx * 2.5, 0.06, -0.24)), 0.05, 0.01, normal_hint=(0, 1, 0))
        piece(f"o_{sid}_sash{i}", bm, purple, coll, "hips")


def x_frost(coll, sid, m):
    fur = glossy("fur", "#f6f8ff", rim=0.1)
    ice = glossy("ice", "#9fe8ff", rim=0.35, glow=0.55)
    n = 12
    for i in range(n):   # chunky fur collar round the neck
        t = i / n * math.tau
        p = Vector((NECK_C.x + math.cos(t) * (NECK_R.x + 0.06), NECK_C.y + math.sin(t) * (NECK_R.y + 0.06), NECK_C.z - NECK_R.z * 0.6))
        piece(f"o_{sid}_fur{i}", ellipsoid(p, (0.045, 0.045, 0.035), segs=10, rings=6), fur, coll, "chest", outline=(i % 2 == 0))
    for side, sx in (("L", 1), ("R", -1)):
        lo, hi = bbox(W(f"gi_shoulder.{side}"))
        c = (lo + hi) / 2
        for k, (ang, ln) in enumerate(((20, 0.11), (45, 0.08), (-5, 0.07))):
            bm = bmesh.new()
            bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.026, radius2=0.0, depth=ln)
            rot = Euler((math.radians(-10 + k * 15), math.radians(sx * ang), 0)).to_matrix().to_4x4()
            bmesh.ops.transform(bm, matrix=Matrix.Translation((c.x + sx * 0.02, c.y + 0.01 * k, hi.z + ln * 0.35)) @ rot, verts=bm.verts)
            piece(f"o_{sid}_crystal{k}.{side}", bm, ice, coll, f"upper_arm.{side}", smooth=False)
        band_ring(f"o_{sid}_furcuff.{side}", f"gi_sleeve.{side}", coll, fur, at=0.0, height=0.045, grow=0.03)


def x_samurai(coll, sid, m):
    red = glossy("lacquer", "#b8322a", rim=0.28)
    gold = glossy("gold", "#f2c14e", rim=0.25)
    for side, sx in (("L", 1), ("R", -1)):
        lo, hi = bbox(W(f"gi_upper_arm.{side}"))
        for i in range(3):   # sode shoulder plates, three stacked lames
            z = hi.z + 0.03 - i * 0.05
            bm = box((hi.x if sx > 0 else lo.x, (lo.y + hi.y) / 2, z), (0.03, 0.15, 0.05), rot=(0, sx * 20, 0), bevel=0.008)
            piece(f"o_{sid}_sode{i}.{side}", bm, red if i < 2 else gold, coll, f"upper_arm.{side}")
    bm = box((TORSO_C.x, TORSO_C.y - TORSO_R.y - 0.01, TORSO_C.z + 0.02), (0.26, 0.04, 0.2), bevel=0.01)   # chest plate
    piece(f"o_{sid}_do", bm, red, coll, "chest")
    for i in range(2):
        bm = box((TORSO_C.x, TORSO_C.y - TORSO_R.y - 0.035, TORSO_C.z - 0.03 + i * 0.07), (0.27, 0.012, 0.012))
        piece(f"o_{sid}_dolace{i}", bm, gold, coll, "chest", outline=False)


def x_monk(coll, sid, m):
    bead = glossy("bead", "#6b3a22", rim=0.25)
    n = 16
    for i in range(n):   # prayer-bead necklace
        t = i / n * math.tau
        p = Vector((NECK_C.x + math.cos(t) * (NECK_R.x + 0.075), NECK_C.y + math.sin(t) * (NECK_R.y + 0.07) - 0.01,
                    NECK_C.z - 0.07 - (0.06 if math.sin(t) < 0 else 0) * abs(math.sin(t))))
        piece(f"o_{sid}_bead{i}", ellipsoid(p, (0.022, 0.022, 0.022), segs=8, rings=6), bead, coll, "chest", outline=(i % 2 == 0))
    p0 = Vector((TORSO_R.x * 0.8, TORSO_C.y - TORSO_R.y - 0.015, TORSO_C.z + TORSO_R.z * 0.85))
    p1 = Vector((-TORSO_R.x * 0.85, TORSO_C.y - TORSO_R.y - 0.015, TORSO_C.z - TORSO_R.z * 0.7))
    piece(f"o_{sid}_drape", strip(p0, p1, 0.09, 0.012), m["lapel"], coll, "chest")


def x_tiger(coll, sid, m):
    dark = glossy("tigerstripe", "#2a2230", rim=0.1)
    for side in "LR":
        for k, at in enumerate((0.55, 0.85)):
            band_ring(f"o_{sid}_sl{k}.{side}", f"gi_upper_arm.{side}", coll, dark, at=at, height=0.02, grow=0.012, outline=False)
            band_ring(f"o_{sid}_th{k}.{side}", f"gi_thigh.{side}", coll, dark, at=at - 0.3, height=0.022, grow=0.012, outline=False)
    for k in range(3):
        z = TORSO_C.z + TORSO_R.z * (0.5 - k * 0.35)
        for sx in (1, -1):
            p0 = Vector((sx * TORSO_R.x * 1.02, TORSO_C.y - 0.02, z))
            piece(f"o_{sid}_ts{k}{sx}", strip(p0, p0 + Vector((-sx * 0.07, -0.05, -0.03)), 0.022, 0.01), dark, coll, "chest", outline=False)


def x_phoenix(coll, sid, m):
    flame = glossy("flame", "#ff5a1f", rim=0.3, glow=0.6)
    yellow = glossy("flamecore", "#ffd23f", rim=0.3, glow=0.7)
    for side, sx in (("L", 1), ("R", -1)):
        lo, hi = bbox(W(f"gi_shoulder.{side}"))
        c = (lo + hi) / 2
        for k, (ang, ln, mat) in enumerate(((35, 0.15, flame), (60, 0.11, yellow), (10, 0.09, flame))):
            p = Vector((c.x + sx * 0.04, c.y + 0.02, hi.z))
            bm = ellipsoid(p + Vector((sx * math.sin(math.radians(ang)) * ln * 0.5, 0, math.cos(math.radians(ang)) * ln * 0.5)),
                           (0.03, 0.02, ln * 0.55), rot=(0, sx * ang, 0), segs=10, rings=8)
            piece(f"o_{sid}_flare{k}.{side}", bm, mat, coll, f"upper_arm.{side}")
    for k, ang in enumerate((-30, 0, 30)):   # tail feathers from the back of the belt
        p = Vector((math.sin(math.radians(ang)) * 0.12, TORSO_C.y + TORSO_R.y + 0.09, 0.42))
        bm = ellipsoid(p, (0.035, 0.03, 0.17), rot=(math.radians(-35), math.radians(ang), 0), segs=10, rings=8)
        piece(f"o_{sid}_tail{k}", bm, flame if k != 1 else yellow, coll, "hips")


def x_starlight(coll, sid, m):
    gold = glossy("stargold", "#ffd166", rim=0.3, glow=0.5)
    import random
    rnd = random.Random(7)
    for i in range(10):
        t = rnd.uniform(-1.0, 1.0)
        z = TORSO_C.z + rnd.uniform(-0.8, 0.8) * TORSO_R.z
        p = Vector((t * TORSO_R.x * 0.85, TORSO_C.y - TORSO_R.y - 0.012 if i % 2 else TORSO_C.y + TORSO_R.y + 0.012, z))
        piece(f"o_{sid}_star{i}", ellipsoid(p, (0.016, 0.006, 0.016), segs=8, rings=4), gold, coll, "chest", outline=False, smooth=False)


def x_jade(coll, sid, m):
    jade = glossy("jade", "#7fe0b0", rim=0.35, glow=0.35)
    gold = glossy("gold", "#f2c14e", rim=0.25)
    shoulder_scales(coll, sid, jade, n=2, size=0.07)
    for side in "LR":
        lo, hi = bbox(W(f"gi_shin.{side}"))
        bm = box(((lo.x + hi.x) / 2, lo.y - 0.012, (lo.z + hi.z) / 2 + 0.01), (0.09, 0.025, 0.15), bevel=0.01)
        piece(f"o_{sid}_shin.{side}", bm, jade, coll, f"shin.{side}")
    bm = ellipsoid((TORSO_C.x, TORSO_C.y - TORSO_R.y - 0.012, TORSO_C.z + 0.04), (0.05, 0.012, 0.05), segs=12, rings=6)
    piece(f"o_{sid}_medal", bm, gold, coll, "chest")


outfit("crimson-dragon", "Crimson Dragon", "#c8202c", "#f2c14e", x_dragon)
outfit("shadow-ninja", "Shadow Ninja", "#2b2838", "#7b4fd6", x_ninja)
outfit("frost-guardian", "Frost Guardian", "#3f86d6", "#ffffff", x_frost)
outfit("iron-samurai", "Iron Samurai", "#2e3f78", "#d8b04a", x_samurai, scale_xy={"gi_thigh": 1.25, "gi_shin": 1.3, "gi_knee": 1.2})
outfit("temple-monk", "Temple Monk", "#f2a024", "#a8402a", x_monk)
outfit("thunder-tiger", "Thunder Tiger", "#f5b52a", "#2a2230", x_tiger)
outfit("panda-pal", "Panda Pal", "#f4f4f4", "#2a2a33", None,
       piece_mats={f"gi_{p}.{s}": "#2a2a33" for p in ("sleeve", "upper_arm", "shoulder", "elbow", "thigh", "shin", "knee") for s in "LR"})
outfit("phoenix-flame", "Phoenix Flame", "#ff7a1f", "#ffd23f", x_phoenix)
outfit("starlight", "Starlight", "#1f2a5c", "#ffd166", x_starlight)
outfit("jade-guardian", "Jade Guardian", "#2f8f5b", "#e8d9a0", x_jade)


# ================================================================ HATS (drawn over the hair; hoods hide it)
def hat(sid, name, build, hides_hair=False):
    SPEC[sid] = {"group": "hat", "name": name, "hidesHair": hides_hair}
    if on(sid):
        build(layer("hat", sid), sid)


def forehead_band(coll, sid, mat, height=0.05, at=0.42, grow=0.012):
    z = HEAD_C.z + HEAD_R.z * at
    k = math.sqrt(max(0.0, 1 - at * at))
    bm = tube((HEAD_C.x, HEAD_C.y, z - height / 2), (HEAD_C.x, HEAD_C.y, z + height / 2), 1, 1, segs=24,
              sx=HEAD_R.x * k + grow, sy=HEAD_R.y * k + grow)
    return piece(f"h_{sid}_band", bm, mat, coll, "head"), z


def h_headband(coll, sid):
    red = glossy("hb_red", "#e0302c", rim=0.25)
    _, z = forehead_band(coll, sid, red)
    for i, sx in enumerate((0.03, -0.03)):
        p0 = Vector((sx, HEAD_C.y + HEAD_R.y * 0.85, z))
        piece(f"h_{sid}_tail{i}", strip(p0, p0 + Vector((sx * 3, 0.12, -0.16)), 0.035, 0.008, normal_hint=(0, 1, 0)), red, coll, "head")


def h_hood(coll, sid, col, ear_col=None, ears="tiger"):
    mat = glossy(f"{sid}_hood", col, rim=0.22)
    piece(f"h_{sid}_hood", head_shell(), mat, coll, "head")
    ear_mat = glossy(f"{sid}_ear", ear_col or col, rim=0.2)
    inner = glossy("ear_inner", "#f3a6b6", rim=0.1)
    for side, sx in (("L", 1), ("R", -1)):
        p = HEAD_C + Vector((sx * HEAD_R.x * 0.68, 0.01, HEAD_R.z * 1.0))
        if ears == "tiger":
            piece(f"h_{sid}_ear.{side}", ellipsoid(p, (0.07, 0.03, 0.08), rot=(0, sx * -20, 0)), ear_mat, coll, "head")
            piece(f"h_{sid}_inner.{side}", ellipsoid(p + Vector((0, -0.022, -0.005)), (0.04, 0.012, 0.05), rot=(0, sx * -20, 0)), inner, coll, "head", outline=False)
        else:
            piece(f"h_{sid}_ear.{side}", ellipsoid(p, (0.075, 0.04, 0.075)), ear_mat, coll, "head")


def h_tiger(coll, sid):
    h_hood(coll, sid, "#f5b52a", "#f5b52a", "tiger")
    dark = glossy("tigerstripe", "#2a2230", rim=0.1)
    for k, ang in enumerate((-25, 0, 25)):   # three forehead stripes
        t = math.radians(ang)
        p0 = HEAD_C + Vector((math.sin(t) * HEAD_R.x * 0.5, -HEAD_R.y * 1.02, HEAD_R.z * 0.95))
        piece(f"h_{sid}_st{k}", strip(p0, p0 + Vector((0, -0.01, -0.07)), 0.02, 0.008), dark, coll, "head", outline=False)


def h_panda(coll, sid):
    h_hood(coll, sid, "#f4f4f4", "#2a2a33", "round")


def h_ninja(coll, sid):
    dark = glossy("ninja_hood", "#2b2838", rim=0.2)
    piece(f"h_{sid}_hood", head_shell(top_open=0.42), dark, coll, "head")
    # lower-face mask (eyes always free)
    bm = ellipsoid(HEAD_C, (HEAD_R.x * 1.07, HEAD_R.y * 1.1, HEAD_R.z * 1.05), segs=24, rings=16)
    eye_bottom = min(bbox(o)[0].z for o in bpy.data.objects if o.name.startswith("f") and "_eye" in o.name and o.type == "MESH")
    top = (eye_bottom - 0.012 - HEAD_C.z) / HEAD_R.z     # always below the eyes
    kill = [v for v in bm.verts if not ((v.co - HEAD_C).y < -HEAD_R.y * 0.05 and -0.78 < (v.co - HEAD_C).z / HEAD_R.z < top)]
    bmesh.ops.delete(bm, geom=kill, context="VERTS")
    piece(f"h_{sid}_mask", bm, dark, coll, "head")
    purple = glossy("shadow-ninja_trim", "#7b4fd6", rim=0.12)
    forehead_band(coll, sid, purple, height=0.03, at=0.5, grow=0.03)


def h_kabuto(coll, sid):
    navy = glossy("kabuto", "#2e3f78", rim=0.3)
    gold = glossy("gold", "#f2c14e", rim=0.25)
    piece(f"h_{sid}_bowl", head_shell(scale=(1.12, 1.12, 1.1), cut_below=0.3, open_face=False, lift=0.0), navy, coll, "head")
    for side, sx in (("L", 1), ("R", -1)):   # crescent crest, a gold V on the brow
        p = HEAD_C + Vector((sx * 0.06, -HEAD_R.y * 1.1, HEAD_R.z * 0.82))
        piece(f"h_{sid}_crest.{side}", ellipsoid(p + Vector((sx * 0.04, 0, 0.06)), (0.022, 0.01, 0.1), rot=(0, sx * 35, 0)), gold, coll, "head")
        p = HEAD_C + Vector((sx * HEAD_R.x * 1.02, 0.02, HEAD_R.z * 0.15))
        piece(f"h_{sid}_flap.{side}", box(p, (0.03, 0.17, 0.09), rot=(0, sx * 20, 0), bevel=0.008), navy, coll, "head")
    forehead_band(coll, sid, gold, height=0.025, at=0.36, grow=0.03)


def h_strawhat(coll, sid):
    straw = glossy("straw", "#e2b862", rim=0.2)
    red = glossy("hb_red", "#e0302c", rim=0.25)
    top = HEAD_C.z + HEAD_R.z * 0.85
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=28, radius1=HEAD_R.x * 1.75, radius2=0.03, depth=0.17)
    bmesh.ops.translate(bm, vec=(HEAD_C.x, HEAD_C.y, top + 0.06), verts=bm.verts)
    piece(f"h_{sid}_kasa", bm, straw, coll, "head")
    bm = tube((HEAD_C.x, HEAD_C.y, top - 0.01), (HEAD_C.x, HEAD_C.y, top + 0.015), HEAD_R.x * 0.95, HEAD_R.x * 0.95, segs=24)
    piece(f"h_{sid}_ribbon", bm, red, coll, "head", outline=False)


def h_dragonhorns(coll, sid):
    gold = glossy("gold", "#f2c14e", rim=0.25)
    red = glossy("crimson-dragon_main", "#c8202c")
    forehead_band(coll, sid, red, height=0.04)
    for side, sx in (("L", 1), ("R", -1)):
        p0 = HEAD_C + Vector((sx * HEAD_R.x * 0.55, -HEAD_R.y * 0.2, HEAD_R.z * 0.7))
        p1 = p0 + Vector((sx * 0.05, 0.04, 0.1))
        p2 = p1 + Vector((sx * 0.01, 0.07, 0.06))
        piece(f"h_{sid}_horn0.{side}", tube(p0, p1, 0.035, 0.024, segs=10), gold, coll, "head")
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=0.024, radius2=0.0, depth=(p2 - p1).length)
        d = (p2 - p1).normalized()
        rot = Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
        bmesh.ops.transform(bm, matrix=Matrix.Translation((p1 + p2) / 2) @ rot, verts=bm.verts)
        piece(f"h_{sid}_horn1.{side}", bm, gold, coll, "head")


def h_frostcrown(coll, sid):
    ice = glossy("ice", "#9fe8ff", rim=0.35, glow=0.55)
    silver = glossy("silver", "#dfe7f2", rim=0.25)
    _, z = forehead_band(coll, sid, silver, height=0.03, at=0.55, grow=0.02)
    k = math.sqrt(1 - 0.55 ** 2)
    for i, (ang, ln) in enumerate(((0, 0.14), (-28, 0.09), (28, 0.09), (-55, 0.06), (55, 0.06))):
        t = math.radians(ang - 90)
        base = Vector((HEAD_C.x + math.cos(t) * HEAD_R.x * k, HEAD_C.y + math.sin(t) * HEAD_R.y * k - 0.01, z + 0.01))
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.028, radius2=0.0, depth=ln)
        bmesh.ops.translate(bm, vec=base + Vector((0, 0, ln / 2)), verts=bm.verts)
        piece(f"h_{sid}_spike{i}", bm, ice, coll, "head", smooth=False)


def h_foxmask(coll, sid):
    white = glossy("foxmask", "#fbf6ee", rim=0.2)
    red = glossy("hb_red", "#e0302c", rim=0.25)
    side = 1   # worn on the side of the head, festival style
    p = HEAD_C + Vector((HEAD_R.x * 0.98, 0.02, HEAD_R.z * 0.35))
    piece(f"h_{sid}_face", ellipsoid(p, (0.025, 0.1, 0.11), rot=(0, 0, 0)), white, coll, "head")
    for k, dz in enumerate((0.09,)):
        for sy in (-0.05, 0.05):
            piece(f"h_{sid}_ear{sy}", ellipsoid(p + Vector((0.005, sy, dz + 0.02)), (0.018, 0.03, 0.05)), white, coll, "head")
    piece(f"h_{sid}_mark", ellipsoid(p + Vector((0.025, 0, 0.02)), (0.006, 0.05, 0.012)), red, coll, "head", outline=False)
    forehead_band(coll, sid, red, height=0.018, at=0.45, grow=0.01)


hat("red-headband", "Red Headband", h_headband)
hat("tiger-hood", "Tiger Hood", h_tiger, hides_hair=True)
hat("panda-hood", "Panda Hood", h_panda, hides_hair=True)
hat("ninja-hood", "Ninja Hood", h_ninja, hides_hair=True)
hat("samurai-helmet", "Samurai Helmet", h_kabuto, hides_hair=True)
hat("straw-hat", "Straw Hat", h_strawhat)
hat("dragon-horns", "Dragon Horns", h_dragonhorns)
hat("frost-crown", "Frost Crown", h_frostcrown)
hat("fox-mask", "Fox Mask", h_foxmask)


# ================================================================ BACK ITEMS
def back(sid, name, build):
    SPEC[sid] = {"group": "back", "name": name}
    if on(sid):
        build(layer("back", sid), sid)


BACK_Y = TORSO_C.y + TORSO_R.y


def b_cape(coll, sid, col="#c8202c", lining="#f2c14e"):
    mat = glossy(f"{sid}_cape", col, rim=0.22)
    bm = bmesh.new()
    rows, cols = 8, 10
    top, bottom = TORSO_C.z + TORSO_R.z * 0.95, 0.24
    grid = []
    for r in range(rows + 1):
        t = r / rows
        z = top + (bottom - top) * t
        half = TORSO_R.x * (0.9 + 0.75 * t)
        row = []
        for c in range(cols + 1):
            u = c / cols * 2 - 1
            y = BACK_Y + 0.03 + 0.06 * t + (1 - u * u) * 0.04 + 0.015 * math.sin(u * 5 + t * 3)
            row.append(bm.verts.new((u * half, y, z)))
        grid.append(row)
    for r in range(rows):
        for c in range(cols):
            bm.faces.new((grid[r][c], grid[r][c + 1], grid[r + 1][c + 1], grid[r + 1][c]))
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.012)
    piece(f"b_{sid}", bm, mat, coll, "chest")
    gold = glossy("gold", "#f2c14e", rim=0.25)
    for sx in (1, -1):
        piece(f"b_{sid}_clasp{sx}", ellipsoid((sx * TORSO_R.x * 0.7, TORSO_C.y - TORSO_R.y * 0.6, top - 0.01), (0.03, 0.02, 0.03)), gold, coll, "chest")


def b_wings(coll, sid):
    flame = glossy("flame", "#ff5a1f", rim=0.3, glow=0.6)
    yellow = glossy("flamecore", "#ffd23f", rim=0.3, glow=0.7)
    for sx in (1, -1):
        for k, (ang, ln, mat) in enumerate(((30, 0.26, flame), (55, 0.22, yellow), (75, 0.17, flame))):
            t = math.radians(ang)
            p = Vector((sx * (0.06 + math.sin(t) * ln * 0.5), BACK_Y + 0.06, TORSO_C.z + 0.1 + math.cos(t) * ln * 0.35))
            bm = ellipsoid(p, (0.035, 0.015, ln * 0.55), rot=(0, sx * ang, 0), segs=10, rings=8)
            piece(f"b_{sid}_f{k}{sx}", bm, mat, coll, "chest")


def b_tail(coll, sid):
    red = glossy("crimson-dragon_main", "#c8202c")
    gold = glossy("gold", "#f2c14e", rim=0.25)
    pts = [Vector((0, BACK_Y + 0.02, 0.58)), Vector((0.03, BACK_Y + 0.14, 0.42)), Vector((0.08, BACK_Y + 0.26, 0.22)), Vector((0.16, BACK_Y + 0.33, 0.08))]
    rs = [0.06, 0.05, 0.035, 0.02]
    for i in range(3):
        piece(f"b_{sid}_seg{i}", tube(pts[i], pts[i + 1], rs[i], rs[i + 1], segs=12), red, coll, "hips")
        piece(f"b_{sid}_ball{i}", ellipsoid(pts[i + 1], (rs[i + 1],) * 3, segs=12, rings=8), red, coll, "hips", outline=False)
    for i in range(3):
        p = (pts[i] + pts[i + 1]) / 2 + Vector((0, 0.02, 0.04))
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.02, radius2=0.0, depth=0.05)
        bmesh.ops.translate(bm, vec=p, verts=bm.verts)
        piece(f"b_{sid}_spk{i}", bm, gold, coll, "hips")


def b_scroll(coll, sid):
    paper = glossy("paper", "#f3e6c4", rim=0.15)
    wood = glossy("scrollwood", "#8a4b2a", rim=0.2)
    p0 = Vector((-0.17, BACK_Y + 0.05, TORSO_C.z - 0.13))
    p1 = Vector((0.17, BACK_Y + 0.05, TORSO_C.z + 0.17))
    piece(f"b_{sid}_roll", tube(p0, p1, 0.05, 0.05, segs=14), paper, coll, "chest")
    d = (p1 - p0).normalized()
    for k, p in enumerate((p0 - d * 0.03, p1 + d * 0.03)):
        piece(f"b_{sid}_end{k}", tube(p - d * 0.03, p + d * 0.03, 0.062, 0.062, segs=14), wood, coll, "chest")
    red = glossy("hb_red", "#e0302c", rim=0.25)
    piece(f"b_{sid}_strap", strip(Vector((TORSO_R.x * 0.9, TORSO_C.y - TORSO_R.y - 0.015, TORSO_C.z + TORSO_R.z * 0.9)),
                                   Vector((-TORSO_R.x * 0.9, TORSO_C.y - TORSO_R.y - 0.015, TORSO_C.z - TORSO_R.z * 0.6)), 0.03, 0.01), red, coll, "chest")


def b_staff(coll, sid):
    wood = glossy("bo", "#9a5b32", rim=0.22)
    gold = glossy("gold", "#f2c14e", rim=0.25)
    p0 = Vector((-0.25, BACK_Y + 0.05, TORSO_C.z - 0.35))
    p1 = Vector((0.25, BACK_Y + 0.05, TORSO_C.z + 0.42))
    piece(f"b_{sid}_pole", tube(p0, p1, 0.022, 0.022, segs=10), wood, coll, "chest")
    d = (p1 - p0).normalized()
    for k, p in enumerate((p0 + d * 0.04, p1 - d * 0.04)):
        piece(f"b_{sid}_cap{k}", tube(p - d * 0.03, p + d * 0.03, 0.027, 0.027, segs=10), gold, coll, "chest")


back("hero-cape", "Hero Cape", b_cape)
back("phoenix-wings", "Phoenix Wings", b_wings)
back("dragon-tail", "Dragon Tail", b_tail)
back("master-scroll", "Master's Scroll", b_scroll)
back("bo-staff", "Bo Staff", b_staff)

rig.data.pose_position = "POSE"
bpy.context.scene["skins_spec"] = json.dumps(SPEC)
if a.save:
    bpy.ops.wm.save_as_mainfile(filepath=a.save)
print("SKINS", len(SPEC))
