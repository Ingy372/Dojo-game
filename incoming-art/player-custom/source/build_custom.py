"""
Dojo Ascent - the customizable player (Art Director bot), Batch 6.

Starts from the APPROVED player model (player-character/source/player_character.blend: rig, 13 animations,
gi, belt layers and props untouched) and splits the old `body` layer:
  skin        : head, ears, neck, chest V, forearms, fists, feet ... in a light neutral tone, tinted by the game
  face-01..06 : eyes, brows, mouth, cheeks (pick one; real colours)
  hair-01..08 : hair only, neutral light grey, tinted by the game (pick one)
  body        : what's left (outlines and the untinted base), always drawn
The options are collections with sprite_group = "face" / "hair": tools/render_sprites.py draws only the
active option and renders it with the base layers as holdouts, so any one face + any one hair stack correctly.

    blender -b incoming-art/player-character/source/player_character.blend -P incoming-art/player-custom/source/build_custom.py -- \
        --out $PWD/incoming-art/player-custom/source/player_custom.blend
"""
import bpy, bmesh, math, sys, os, argparse, json
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); ap.add_argument("--body", default="a", choices=["a", "b"]); A = ap.parse_args(argv)
scene = bpy.context.scene
arm = bpy.data.objects["MartialArtistRig"]
OUTLINE = bpy.data.materials["OUTLINE"]; OUTLINE_W = 0.013
HEAD_C = Vector((0, 0, 1.12)); HA, HB, HC = 0.19, 0.18, 0.185

# rest pose while new parts are parented (meshes are built in rest-pose world space, like build_character.py)
saved_action = arm.animation_data.action; arm.animation_data.action = None
for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
arm.data.pose_position = "REST"; bpy.context.view_layer.update()

def coll(name, order, tint, group=None):
    c = bpy.data.collections.new("L_" + name); scene.collection.children.link(c)
    c["sprite_order"] = order; c["sprite_tint"] = tint; c["sprite_overlay"] = False
    if group: c["sprite_group"] = group
    return c
def mat(name, hex_color, flat=False):
    return toon_material(name, hex_color, *((1.0, 1.0) if flat else ()))
def parent(ob, bone="head"):
    mw = ob.matrix_world.copy(); ob.parent = arm; ob.parent_type = "BONE"; ob.parent_bone = bone
    bpy.context.view_layer.update(); ob.matrix_world = mw
def hull(src, c, bone):
    bm = bmesh.new(); bm.from_mesh(src.data); bm.normal_update()
    for v in bm.verts: v.co += v.normal * OUTLINE_W
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(src.name + "_outline"); bm.to_mesh(me); bm.free(); me.materials.append(OUTLINE)
    ob = bpy.data.objects.new(src.name + "_outline", me); c.objects.link(ob); parent(ob, bone)
def put(c, name, bm, m, outline=True, bone="head", smooth=True):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = smooth
    bm.to_mesh(me); bm.free(); me.materials.append(m)
    ob = bpy.data.objects.new(name, me); c.objects.link(ob); parent(ob, bone)
    if outline: hull(ob, c, bone)
    return ob
def ellipsoid(center, size, rot=(0, 0, 0), segs=16, rings=10):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm
def box(center, size, rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm
def bisect_keep(bm, co, no):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=[-v for v in no], clear_outer=True); return bm
def front(x, z, inset=0.004):
    """y on the front of the head at (x, z), and the pitch that lays a flat piece onto it."""
    k = max(0.0, 1 - (x / HA) ** 2 - ((z - HEAD_C.z) / HC) ** 2); y = -HB * math.sqrt(k)
    return y + inset

# ------------------------------------------------------------------ split the old body layer
body = bpy.data.collections["L_body"]
skin = coll("skin", 1, True)
for k in ("gi", "belt", "belt-sheen", "belt-center", "belt-center-edge", "belt-rim", "belt-tape1-edge", "belt-tape1",
          "belt-tape2-edge", "belt-tape2", "prop-broom", "prop-rag"):
    c = bpy.data.collections["L_" + k]; c["sprite_order"] = int(c["sprite_order"]) + 1      # make room for skin at 1
SKIN_N = mat("SKIN_NEUTRAL", "#f2f2f2")
for ob in list(body.objects):
    ms = [m.name for m in ob.data.materials if m] if ob.type == "MESH" else []
    if ob.name.startswith("hair_") or ob.name.split(".")[0] in ("eye", "eye_shine", "brow", "blush", "mouth"):
        bpy.data.objects.remove(ob, do_unlink=True); continue
    if "SKIN" in ms:
        body.objects.unlink(ob); skin.objects.link(ob); ob.data.materials[0] = SKIN_N

# ------------------------------------------------------------------ body B: same rig, gi, belt and animations
def remesh(name, bm):
    ob = bpy.data.objects[name]; old = ob.data; me = bpy.data.meshes.new(name + "_b")
    for f in bm.faces: f.smooth = True
    mw = ob.matrix_world.copy(); inv = mw.inverted(); bm.transform(inv); bm.to_mesh(me); bm.free()
    for m in old.materials: me.materials.append(m)
    ob.data = me
if A.body == "b":
    EYELASH = mat("B_LASH", "#1d1a24", True)
    for nm in ("head", "head_outline"):
        bm = ellipsoid(HEAD_C + Vector((0, 0, -0.004)), (0.193, 0.182, 0.18), segs=20, rings=14)
        if nm.endswith("outline"):
            bm.normal_update()
            for v in bm.verts: v.co += v.normal * OUTLINE_W
            bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
        remesh(nm, bm)
    for side in ("L", "R"):
        for nm in (f"ear.{side}", f"ear.{side}_outline"):
            ob = bpy.data.objects[nm]; ob.scale = (0.85, 0.85, 0.85)
    for x, sd in ((1, "L"), (-1, "R")):          # soft round cheeks (skin)
        put(skin, f"cheek.{sd}", ellipsoid((0.085 * x, -0.1, 1.06), (0.07, 0.03, 0.055), segs=12, rings=8), SKIN_N, outline=False)
        for k, (dx, dz, rz) in enumerate(((-0.006, 0.012, -15), (0.006, 0.0, -35), (0.014, -0.015, -60))):   # three longer lash flicks at the outer corner
            lx, lz = (0.103 + dx) * x, 1.142 + dz
            put(body, f"lash{k}.{sd}", box((lx, front(lx, lz, -0.008), lz), (0.036, 0.009, 0.011), rot=(-20, 0, rz * x)), EYELASH, outline=False)

# ------------------------------------------------------------------ faces (real colours; never mocking)
EYE = mat("F_EYE", "#1d1a24", True); SHINE = mat("F_SHINE", "#ffffff", True)
MOUTH = mat("F_MOUTH", "#a8473f", True); EYERIM = mat("F_EYERIM", "#f3e6dc", True); BLUSH = mat("F_BLUSH", "#e2786b", True); FRECK = mat("F_FRECK", "#9a5a3c", True)
FACES = {
 1: dict(eye=(0.031, 0.048), eye_rot=25, eye_z=1.112, brow=(0.05, 0.011), brow_rot=25, brow_z=1.19, mouth=(0.026, 0.011), blush=True,
         note="the approved face of Batch 1: oval eyes with a shine, friendly brows, a small smile"),
 2: dict(eye=(0.038, 0.045), eye_rot=0, eye_z=1.11, brow=(0.046, 0.01), brow_rot=8, brow_z=1.195, mouth=(0.034, 0.012), blush=True,
         note="big round eyes, soft high brows, a wider smile"),
 3: dict(eye=(0.034, 0.03), eye_rot=12, eye_z=1.108, brow=(0.052, 0.013), brow_rot=4, brow_z=1.175, mouth=(0.026, 0.01), blush=False,
         note="calm almond eyes, straight brows, a small smile"),
 4: dict(eye=(0.03, 0.044), eye_rot=18, eye_z=1.11, brow=(0.05, 0.012), brow_rot=18, brow_z=1.188, mouth=(0.03, 0.013), blush=True, lashes=True,
         note="oval eyes with small lashes at the outer corner, a happy smile"),
 5: dict(eye=(0.03, 0.04), eye_rot=20, eye_z=1.112, brow=(0.056, 0.017), brow_rot=12, brow_z=1.188, mouth=(0.03, 0.011), blush=False,
         note="bold thick brows, determined but friendly"),
 6: dict(eye=(0.033, 0.046), eye_rot=22, eye_z=1.112, brow=(0.048, 0.011), brow_rot=22, brow_z=1.192, mouth=(0.028, 0.012), blush=False, freckles=True,
         note="oval eyes and freckles across the cheeks"),
}
for i, f in FACES.items():
    c = coll(f"face-{i:02d}", 14 + i - 1, False, "face")
    for x, s in ((1, "L"), (-1, "R")):
        ex = 0.071 * x; ez = f["eye_z"]
        put(c, f"f{i}_eye.{s}", ellipsoid((ex, front(ex, ez, 0.005), ez), (f["eye"][0], 0.016, f["eye"][1]), rot=(0, 0, f["eye_rot"] * x), segs=12, rings=8), EYE, outline=False)
        # Eyes as approved before A7 (Jay, walk-arms PR: the A7 ring/shine change read as "crazy eyes", so it is undone)
        put(c, f"f{i}_eyerim.{s}", ellipsoid((ex, front(ex, ez, 0.009), ez), (f["eye"][0] + 0.007, 0.012, f["eye"][1] + 0.007), rot=(0, 0, f["eye_rot"] * x), segs=12, rings=8), EYERIM, outline=False)
        put(c, f"f{i}_shine.{s}", ellipsoid((ex + 0.009 * x, front(ex, ez + 0.02, 0.0) - 0.011, ez + 0.02), (0.012, 0.006, 0.014), segs=8, rings=6), SHINE, outline=False)
        bx = 0.073 * x; bz = f["brow_z"]
        put(c, f"f{i}_brow.{s}", box((bx, front(bx, bz, 0.0), bz), (f["brow"][0], 0.012, f["brow"][1]), rot=(-25, -9 * x, f["brow_rot"] * x)), EYE, outline=False)
        if f.get("lashes"):
            lx = 0.1 * x; lz = ez + 0.03
            put(c, f"f{i}_lash.{s}", box((lx, front(lx, lz, 0.0), lz), (0.022, 0.01, 0.008), rot=(-20, 0, -35 * x)), EYE, outline=False)
        if f.get("blush"):
            put(c, f"f{i}_blush.{s}", ellipsoid((0.112 * x, -0.137, 1.055), (0.024, 0.008, 0.014), rot=(0, 0, 38 * x), segs=10, rings=6), BLUSH, outline=False)
        if f.get("freckles"):
            for k, (fx, fz) in enumerate(((0.1, 1.07), (0.125, 1.06), (0.112, 1.045))):
                put(c, f"f{i}_freck{k}.{s}", ellipsoid((fx * x, front(fx * x, fz, -0.002), fz), (0.007, 0.005, 0.007), segs=8, rings=6), FRECK, outline=False)
    put(c, f"f{i}_mouth", ellipsoid((0, front(0, 1.035, -0.008), 1.035), (f["mouth"][0], 0.008, f["mouth"][1]), segs=10, rings=6), MOUTH, outline=False)

# ------------------------------------------------------------------ hair (neutral light grey, tinted by the game)
HAIR = mat("HAIR_NEUTRAL", "#e6e6e6")
HAIRLINE = 1.262        # the cap's front edge stays above the brows (eyes never covered; room for a headband)
def cap(c, n, lift=0.0, grow=0.0, front_z=HAIRLINE):
    bm = ellipsoid(HEAD_C + Vector((0, 0.008, 0.012 + lift)), (0.203 + grow, 0.195 + grow, 0.2 + grow), segs=24, rings=16)
    bisect_keep(bm, (0, -0.19, front_z), (0, 0.38, 1)); put(c, f"{n}_cap", bm, HAIR)
def back(c, n, grow=0.0, low=1.0):
    bm = ellipsoid(HEAD_C + Vector((0, 0.012, 0.005)), (0.2 + grow, 0.195 + grow, 0.197 + grow), segs=24, rings=16)
    bisect_keep(bm, (0, 0.04, 0), (0, 1, 0)); bisect_keep(bm, (0, 0, low), (0, 0, 1)); put(c, f"{n}_back", bm, HAIR)
def sides(c, n, h=0.075):
    for x, s in ((1, "L"), (-1, "R")):
        put(c, f"{n}_side.{s}", ellipsoid((0.172 * x, 0.0, 1.175), (0.036, 0.06, h), rot=(0, 0, -12 * x)), HAIR)
HAIRS = {}
def hair(fn): HAIRS[len(HAIRS) + 1] = fn; return fn

@hair
def very_short(c, n):
    """very short (close crop): a thin cap that follows the head"""
    bm = ellipsoid(HEAD_C + Vector((0, 0.006, 0.006)), (0.196, 0.187, 0.192), segs=24, rings=16)
    bisect_keep(bm, (0, -0.19, 1.25), (0, 0.5, 1)); put(c, f"{n}_cap", bm, HAIR)
@hair
def short(c, n):
    """short: the approved Batch 1 hair (cap, back, sideburns, a short fringe and a tuft)"""
    cap(c, n); back(c, n); sides(c, n)
    for i, (fx, rz) in enumerate(((-0.07, 18), (0.0, 0), (0.07, -18))):
        put(c, f"{n}_fringe{i}", ellipsoid((fx, front(fx, 1.27, 0.0) - 0.004, 1.27), (0.06, 0.022, 0.034), rot=(-30, 0, rz)), HAIR)
@hair
def curly(c, n):
    """curly: a rounder cap made of soft curls"""
    cap(c, n, lift=0.01, grow=0.01); back(c, n, grow=0.01)
    import random; rnd = random.Random(6)
    for i in range(26):
        a = rnd.uniform(0, 2 * math.pi); el = rnd.uniform(0.15, 1.35)
        d = Vector((math.cos(a) * math.cos(el), math.sin(a) * math.cos(el), math.sin(el)))
        p = HEAD_C + Vector((d.x * 0.2, d.y * 0.2 + 0.01, d.z * 0.2 + 0.02))
        if p.y < -0.12 and p.z < 1.26: continue          # keep the forehead and eyes clear
        put(c, f"{n}_curl{i}", ellipsoid(p, (0.05, 0.05, 0.045), segs=10, rings=6), HAIR)
import random
HAIR_HI = mat("HAIR_NEUTRAL_HI", "#f7f7f7")      # a lighter neutral for clump tops: texture by highlights, still one tint
def clumps(c, n, centre, radii, count, size, seed, keep=lambda p: True, hi_every=3):
    """Soft coil clumps spread over an ellipsoid: each clump is a round puff; every few gets a lighter top."""
    rnd = random.Random(seed); k = 0
    for i in range(count * 4):
        if k >= count: break
        u = rnd.uniform(-1, 1); a = rnd.uniform(0, 2 * math.pi); r = math.sqrt(1 - u * u)
        d = Vector((r * math.cos(a), r * math.sin(a), u))
        p = centre + Vector((d.x * radii[0], d.y * radii[1], d.z * radii[2]))
        if not keep(p): continue
        sz = size * rnd.uniform(0.8, 1.15)
        put(c, f"{n}_clump{k}", ellipsoid(p, (sz, sz, sz * 0.92), segs=10, rings=7), HAIR)
        if k % hi_every == 0:
            q = p + d * sz * 0.55 + Vector((-0.2, -0.25, 0.6)).normalized() * sz * 0.25
            put(c, f"{n}_hi{k}", ellipsoid(q, (sz * 0.42, sz * 0.42, sz * 0.3), segs=8, rings=5), HAIR_HI, outline=False)
        k += 1
def hairline_coils(c, n, z=1.255, span=150, count=11, size=0.028, y_in=0.0):
    """small coils along a natural, softly scalloped hairline (no hard flat edge across the forehead)"""
    for k in range(count):
        a = math.radians(-span / 2 + span * k / (count - 1)) - math.pi / 2
        x = math.cos(a) * 0.19; zz = z + 0.012 * math.cos(k * 1.7) + (0.02 if abs(k - (count - 1) / 2) > count / 3 else 0)
        y = front(x, zz, y_in) if abs(x) < 0.185 else math.sin(a) * 0.18
        put(c, f"{n}_line{k}", ellipsoid((x, y, zz), (size, size * 0.8, size), segs=8, rings=6), HAIR)
@hair
def afro(c, n):
    """afro: a rounded shape built from soft coil clumps with light tops, a natural hairline above the brows"""
    C = HEAD_C + Vector((0, 0.03, 0.065))
    bm = ellipsoid(C, (0.215, 0.205, 0.195), segs=24, rings=16); bisect_keep(bm, (0, -0.2, 1.255), (0, 0.42, 1)); put(c, f"{n}_core", bm, HAIR)
    back(c, n, grow=0.02, low=1.0)
    clumps(c, n, C, (0.225, 0.215, 0.205), 70, 0.052, 21, keep=lambda p: p.z > 1.0 and not (p.y < -0.1 and p.z < 1.29))
    hairline_coils(c, n)
@hair
def braids(c, n):
    """braids: a smooth cap with two braids hanging behind the ears to the shoulders"""
    cap(c, n); back(c, n)
    for x, s in ((1, "L"), (-1, "R")):
        for k in range(5):
            z = 1.08 - k * 0.055
            put(c, f"{n}_braid{s}{k}", ellipsoid((0.15 * x, 0.07, z), (0.035, 0.035, 0.034), segs=10, rings=6), HAIR)
        put(c, f"{n}_tie{s}", ellipsoid((0.15 * x, 0.07, 1.08 - 5 * 0.055 + 0.01), (0.022, 0.022, 0.018), segs=8, rings=6), HAIR)
@hair
def ponytail(c, n):
    """ponytail: cap pulled back to a tie at the back of the head, a short tail (above the belt)"""
    cap(c, n); back(c, n)
    put(c, f"{n}_tie", ellipsoid((0, 0.2, 1.2), (0.035, 0.03, 0.035), segs=10, rings=6), HAIR)
    put(c, f"{n}_tail", ellipsoid((0, 0.235, 1.07), (0.05, 0.04, 0.13), rot=(14, 0, 0), segs=12, rings=8), HAIR)
@hair
def bun(c, n):
    """bun: cap with a round bun on top towards the back"""
    cap(c, n); back(c, n); sides(c, n, h=0.06)
    put(c, f"{n}_bun", ellipsoid((0, 0.11, 1.32), (0.08, 0.075, 0.07), segs=14, rings=10), HAIR)
@hair
def tied_back(c, n):
    """tied back: smooth hair combed back to a low knot at the nape"""
    cap(c, n, front_z=1.27); back(c, n, low=1.02)
    put(c, f"{n}_knot", ellipsoid((0, 0.19, 1.04), (0.06, 0.045, 0.045), segs=12, rings=8), HAIR)
@hair
def two_puffs(c, n):
    """two puffs: hair parted down the middle and gathered into two round coil puffs high on the head"""
    cap(c, n); back(c, n)
    for x in (1, -1):
        C = Vector((0.15 * x, 0.06, 1.29))
        put(c, f"{n}_puffcore{x}", ellipsoid(C, (0.085, 0.08, 0.08), segs=14, rings=10), HAIR)
        clumps(c, n + f"p{x}", C, (0.088, 0.083, 0.083), 22, 0.032, 30 + x, keep=lambda p: True)
        put(c, f"{n}_band{x}", ellipsoid(C + Vector((-0.07 * x, 0, -0.065)), (0.03, 0.03, 0.02), segs=8, rings=6), HAIR)
    hairline_coils(c, n, size=0.022, count=9)
@hair
def short_twists(c, n):
    """short twists: a soft cap covered in short, rounded twists that point up and out (they never reach the eyes)"""
    cap(c, n, grow=0.004); back(c, n)
    rnd = random.Random(41); k = 0
    for i in range(300):
        if k >= 46: break
        u = rnd.uniform(0.05, 1); a = rnd.uniform(0, 2 * math.pi); r = math.sqrt(1 - u * u)
        d = Vector((r * math.cos(a), r * math.sin(a), u))
        p = HEAD_C + Vector((d.x * 0.2, d.y * 0.195 + 0.01, d.z * 0.2 + 0.01))
        if p.y < -0.08 and p.z < 1.27: continue
        for j in range(3):   # a twist = three stacked round segments, a little smaller each time
            q = p + d * (0.02 + j * 0.026); sz = 0.03 - j * 0.004
            put(c, f"{n}_tw{k}_{j}", ellipsoid(q, (sz, sz, sz * 0.9), segs=8, rings=6), HAIR_HI if (j == 2 and k % 3 == 0) else HAIR, outline=(j == 2))
        k += 1
@hair
def cornrows_braids(c, n):
    """cornrows into braids: neat raised rows from the hairline to the back, ending in braids that hang behind the shoulders"""
    bm = ellipsoid(HEAD_C + Vector((0, 0.006, 0.006)), (0.196, 0.187, 0.192), segs=24, rings=16)
    bisect_keep(bm, (0, -0.19, 1.25), (0, 0.5, 1)); put(c, f"{n}_scalp", bm, HAIR)
    for r, x0 in enumerate((-0.12, -0.06, 0.0, 0.06, 0.12)):
        for j in range(9):       # one row: a line of small round knots over the head, front to back
            t = j / 8; a = math.radians(40 + 128 * t)
            y = -math.cos(a) * 0.195 + 0.006; z = HEAD_C.z + 0.006 + math.sin(a) * 0.2 + 0.01
            xx = x0 * (1 - 0.35 * t) * (1.0 if j else 0.95)
            k2 = 1 - (xx / 0.2) ** 2
            put(c, f"{n}_row{r}_{j}", ellipsoid((xx, y * math.sqrt(max(k2, 0.3)), z * 1.0 - (1 - math.sqrt(max(k2, 0.3))) * 0.05), (0.024, 0.026, 0.02), segs=8, rings=6),
                HAIR_HI if j % 2 else HAIR, outline=(j % 2 == 0))
        for k in range(5):       # the braid down the back, behind the head and shoulders
            put(c, f"{n}_br{r}_{k}", ellipsoid((x0 * 0.8, 0.17 + 0.012 * k, 1.03 - k * 0.05), (0.022, 0.022, 0.03), segs=8, rings=6), HAIR)
@hair
def high_top(c, n):
    """high-top fade: short faded sides and a tall rounded flat-top of tight coils"""
    bm = ellipsoid(HEAD_C + Vector((0, 0.004, 0.004)), (0.194, 0.185, 0.19), segs=24, rings=16)
    bisect_keep(bm, (0, -0.19, 1.24), (0, 0.5, 1)); put(c, f"{n}_fade", bm, HAIR)
    C = HEAD_C + Vector((0, 0.02, 0.17))
    bm = ellipsoid(C, (0.17, 0.16, 0.13), segs=20, rings=12); bisect_keep(bm, (0, 0, 1.18), (0, 0, 1)); bisect_keep(bm, (0, 0, 1.36), (0, 0, -1))
    put(c, f"{n}_top", bm, HAIR)
    put(c, f"{n}_lid", ellipsoid(Vector((0, 0.02, 1.36)), (0.16, 0.15, 0.025), segs=20, rings=6), HAIR)
    clumps(c, n, C + Vector((0, 0, 0.02)), (0.165, 0.155, 0.13), 34, 0.034, 55, keep=lambda p: 1.2 < p.z < 1.4 and not (p.y < -0.12 and p.z < 1.27))

for i, fn in HAIRS.items():
    c = coll(f"hair-{i:02d}", 20 + i - 1, True, "hair")
    fn(c, f"h{i}")

# ------------------------------------------------------------------ restore the pose and write the meta
arm.data.pose_position = "POSE"; arm.animation_data.action = saved_action
meta = json.loads(scene.get("sprite_meta", "{}"))
SKINS = ["#f6d7c3", "#efc3a4", "#e0a984", "#c98e65", "#b07650", "#946042", "#7a4b32", "#603926", "#4a2c1f", "#38221a"]
HAIRC = {"black": "#34303f", "dark-brown": "#3a2519", "brown": "#5c3a22", "light-brown": "#8a5f3b", "blonde": "#d9b26a",
         "red": "#b5482a", "auburn": "#8a3a26", "grey": "#9a9aa2", "blue": "#3f6fd1", "purple": "#7d4cc2"}
GIC = {"white": "#f2f2f2", "charcoal": "#4a4a55", "navy": "#24345e", "blue": "#3a6ea5", "red": "#b8322a", "grey": "#8a8d99",
       "green": "#3f7a4a", "unbleached": "#e9dfc9", "sky": "#7fb2e0", "maroon": "#7a2a33"}
meta["palettes"] = dict(
    skin=SKINS, hair=list(HAIRC.values()), gi=list(GIC.values()),
    note="Recommended swatches (hex), shown by the game in this order. They are multiply tints for the tinted layers "
         "(skin, hair-*, gi). Skin runs from light to deep. The ids in palettesDraftLabels are placeholders for the "
         "Content Writer, not names")
meta["palettesDraftLabels"] = dict(skin=[f"skin-{k + 1:02d}" for k in range(10)], hair=list(HAIRC), gi=list(GIC))
meta["groups"] = dict(face=[f"face-{i:02d}" for i in FACES], hair=[f"hair-{i:02d}" for i in HAIRS],
                      note="draw exactly one layer of each group, after the base layers (face, then hair)")
meta["optionNotes"] = {**{f"face-{i:02d}": f["note"] for i, f in FACES.items()}, **{f"hair-{i:02d}": HAIRS[i].__doc__ for i in HAIRS}}
meta.setdefault("tintGuidance", {})
if isinstance(meta["tintGuidance"], dict):
    meta["tintGuidance"]["skin"] = "multiply by a palettes.skin colour (the layer is a light neutral grey)"
    meta["tintGuidance"]["hair"] = "multiply every hair-* layer by a palettes.hair colour (light neutral grey)"
scene["sprite_meta"] = json.dumps(meta)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out, "layers:", sorted(c.name for c in bpy.data.collections if c.name.startswith("L_")))
