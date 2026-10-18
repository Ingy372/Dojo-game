"""
Dojo Ascent - Sensei, Senpai and Kohai (Art Director bot), Batch 7 SAMPLES.

Built on the approved Batch 6 player models (player-custom/source/player_custom_a.blend / _b.blend): the same rig,
camera, toon light, outline and belt layer set. Each character keeps:
  body  (untinted: skin, face, hair, beard in real colours - these characters don't change their look)
  gi    (tinted by the game, neutral light grey; a suggested colour is in the JSON)
  belt, belt-sheen, belt-center, belt-center-edge, belt-rim, belt-tape1(-edge), belt-tape2(-edge)  (exactly as the player)
Proportions: the whole rig is scaled (Sensei taller, Kohai smaller) and the head bone is scaled back the other way,
so the adult has a smaller head for his height and the small child a bigger one. Every outline is rebuilt so it stays
the house width (0.013 tiles) at the new size.
New actions for the samples: idle (relaxed standing), bow (Jay's rules: legs straight, the bend only from the hips,
head up, eyes forward), walk (calm, about 2 tiles/s), talk, nod, point, demonstrate (Sensei and Senpai: a slow, clean block and
punch), and one portrait pose per expression (portrait_neutral / _happy / _proud / _thinking).

    blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/dojo-people/source/build_people.py -- \
        --who sensei --out $PWD/incoming-art/dojo-people/source/sensei.blend
    (senpai: from player_custom_b.blend; kohai: from player_custom_a.blend)

Sensei is a friendly cartoon likeness of Jay, instructor-2 of Jay's wife and founder of the school's founder, all based on
reference photos provided by Jay (not stored in the repo). (instructor-2 from player_custom_b.blend, founder from _a.)
Senpai and Kohai are made-up characters; their looks are placeholders for Jay (see the Delivery Note).
"""
import bpy, bmesh, math, sys, os, argparse, json, random
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
from toon_kit import toon_material

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser(); ap.add_argument("--who", required=True, choices=["sensei", "senpai", "kohai", "instructor-2", "founder"]); ap.add_argument("--out", required=True)
A = ap.parse_args(argv)

# ------------------------------------------------------------------ the three looks (placeholders, flagged in DECIDE)
LOOKS = {
    "sensei": dict(base="a", scale=1.28, head=0.80, skin="#f2cdb6", hair="#6e4b2f", hair_hi="#8f6a48", face="custom", hair_style="sensei_top",
                   beard=False, glasses=True, gi="#4a4a55", belt="Black",
                   note="adult (young), the tallest; a friendly cartoon likeness of Jay, based on reference photos provided by Jay (not stored in the repo): "
                        "light skin, short brown hair (short sides, longer tousled top swept up at the front), bold black rectangular glasses, "
                        "a light brown moustache and short chin beard, a big warm smile; charcoal gi (samples 3); black belt"),
    "senpai": dict(base="b", scale=1.10, head=0.88, skin="#c98e65", hair="#3a2519", hair_hi="#5a3f2e", face="face-01", hair_style="high_ponytail",
                   beard=False, gi="#f2f2f2", belt="Brown/Black",
                   note="teen; a little taller than the player; high ponytail; white gi; brown/black belt (Jay, 2026-10-17)"),
    "kohai":  dict(base="a", scale=0.84, head=1.06, skin="#efc3a4", hair="#b5482a", hair_hi="#d86a45", face="face-02", hair_style="hair-03",
                   beard=False, gi="#f2f2f2", belt="White",
                   note="small child; smallest, with a bigger head; big round eyes; curly red hair; white gi; white belt"),
    "instructor-2": dict(base="b", scale=1.20, head=0.84, skin="#f6d7c3", hair="#3a2519", hair_hi="#5a3f2e", face="custom", hair_style="low_ponytail",
                   beard=False, glasses=False, eye="#33405a", freckles=True, gi="#3f7fd0", belt="Black",
                   note="adult (young), between Senpai and Sensei in height; a friendly cartoon likeness of Jay's wife, based on reference photos provided by Jay "
                        "(not stored in the repo): fair skin with light freckles, dark brown hair in a low ponytail at the back of the head, the ponytail purple (her request, Batch 7 full set), "
                        "blue-grey eyes, a big warm smile; medium blue gi (samples 3); black belt (Jay confirmed)"),
    "founder": dict(base="a", scale=1.26, head=0.81, skin="#d5a27c", hair="#524c48", hair_hi="#8e8882", face="custom", hair_style="founder_wavy",
                   beard=False, glasses=False, eye="#2a1f1a", gi="#f2f2f2", belt="Black", headband=True,
                   note="older adult (about 60), about Sensei's height; a friendly cartoon likeness of the school's founder, based on reference photos "
                        "provided by Jay (not stored in the repo): tanned olive skin, short wavy dark hair going grey (grey at the temples), a grey-and-dark "
                        "moustache with light stubble, a broad warm toothy smile with crinkly eyes and smile lines; white gi; black belt; "
                        "optional red headband as its own overlay layer (headband)"),
}
L = LOOKS[A.who]
scene = bpy.context.scene
arm = bpy.data.objects["MartialArtistRig"]
OUTLINE = bpy.data.materials["OUTLINE"]; OUTLINE_W = 0.013
HEAD_C = Vector((0, 0, 1.12)); HA, HB, HC = 0.19, 0.18, 0.185

arm.animation_data.action = None
for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
arm.data.pose_position = "REST"; bpy.context.view_layer.update()

def C(name): return bpy.data.collections["L_" + name]
body = C("body")
def kill_coll(c):
    for ob in list(c.objects): bpy.data.objects.remove(ob, do_unlink=True)
    bpy.data.collections.remove(c)
def move_to_body(c):
    for ob in list(c.objects): c.objects.unlink(ob); body.objects.link(ob)
    bpy.data.collections.remove(c)

# ------------------------------------------------------------------ fixed looks: skin, face and hair go into body (real colours)
SKIN = toon_material(f"{A.who.upper().replace('-', '_')}_SKIN", L["skin"])
for ob in C("skin").objects:
    if ob.type == "MESH" and ob.data.materials and ob.data.materials[0] and ob.data.materials[0].name.startswith("SKIN_NEUTRAL"):
        ob.data.materials[0] = SKIN
for ob in body.objects:   # the hidden base skin pieces left in body (if any) take the same tone
    if ob.type == "MESH" and ob.data.materials and ob.data.materials[0] and ob.data.materials[0].name in ("SKIN", "SKIN_NEUTRAL"):
        ob.data.materials[0] = SKIN
move_to_body(C("skin"))
for c in [c for c in bpy.data.collections if c.name.startswith("L_face-")]:
    (move_to_body if c.name == "L_" + L["face"] else kill_coll)(c)
keep_hair = L["hair_style"] if L["hair_style"].startswith("hair-") else ("hair-02" if L["hair_style"] == "short" else None)
for c in [c for c in bpy.data.collections if c.name.startswith("L_hair-")]:
    (move_to_body if c.name == "L_" + str(keep_hair) else kill_coll)(c)
for p in ("prop-broom", "prop-rag"): kill_coll(C(p))

HAIR = toon_material(f"{A.who.upper().replace('-', '_')}_HAIR", L["hair"]); HAIR_HI = toon_material(f"{A.who.upper().replace('-', '_')}_HAIR_HI", L["hair_hi"])
for ob in body.objects:
    if ob.type == "MESH" and ob.data.materials and ob.data.materials[0]:
        n = ob.data.materials[0].name
        if n.startswith("HAIR_NEUTRAL_HI"): ob.data.materials[0] = HAIR_HI
        elif n.startswith("HAIR_NEUTRAL"): ob.data.materials[0] = HAIR

# helpers for new pieces (same as build_custom.py)
def parent(ob, bone="head"):
    mw = ob.matrix_world.copy(); ob.parent = arm; ob.parent_type = "BONE"; ob.parent_bone = bone
    bpy.context.view_layer.update(); ob.matrix_world = mw
def put(name, bm, m, outline=True, bone="head"):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = True
    bm.to_mesh(me); bm.free(); me.materials.append(m)
    ob = bpy.data.objects.new(name, me); body.objects.link(ob); parent(ob, bone)
    if outline:
        o = bpy.data.objects.new(name + "_outline", me.copy()); o.data.materials[0] = OUTLINE; body.objects.link(o); parent(o, bone)
    return ob
def ellipsoid(center, size, rot=(0, 0, 0), segs=16, rings=10):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm
def box_(center, size, rot=(0, 0, 0)):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    m = Matrix.Translation(center) @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4() @ Matrix.Diagonal((*size, 1))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm
def bisect_keep(bm, co, no):
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=[-v for v in no], clear_outer=True); return bm

if L["hair_style"] == "high_ponytail":
    # high ponytail: smooth hair pulled back to a tie high on the back of the head; the tail falls behind the head.
    # A clear side silhouette (it swings out behind), and the hairline stays above the brows like every player style.
    bm = ellipsoid(HEAD_C + Vector((0, 0.008, 0.012)), (0.203, 0.195, 0.2), segs=24, rings=16); bisect_keep(bm, (0, -0.19, 1.262), (0, 0.38, 1)); put("hp_cap", bm, HAIR)
    bm = ellipsoid(HEAD_C + Vector((0, 0.012, 0.005)), (0.2, 0.195, 0.197), segs=24, rings=16); bisect_keep(bm, (0, 0.04, 0), (0, 1, 0)); bisect_keep(bm, (0, 0, 1.0), (0, 0, 1)); put("hp_back", bm, HAIR)
    for x, s in ((1, "L"), (-1, "R")):
        put(f"hp_side.{s}", ellipsoid((0.172 * x, 0.0, 1.175), (0.036, 0.06, 0.07), rot=(0, 0, -12 * x)), HAIR)
    put("hp_tie", ellipsoid((0, 0.17, 1.30), (0.04, 0.035, 0.04), segs=10, rings=6), HAIR_HI)
    for k, (y, z, sx, sz) in enumerate(((0.235, 1.29, 0.06, 0.06), (0.275, 1.21, 0.058, 0.07), (0.285, 1.12, 0.05, 0.065), (0.27, 1.04, 0.038, 0.05))):
        put(f"hp_tail{k}", ellipsoid((0, y, z), (sx, sx * 0.85, sz), rot=(18 - 12 * k, 0, 0), segs=12, rings=8), HAIR)
if L["beard"]:
    # a short, neat beard along the jaw and chin, with the mouth kept clear (kid-friendly, kind)
    # a thin shell over the lower jaw, from ear to ear, cut by a plane that rises towards the ears and passes under the mouth
    bm = ellipsoid(HEAD_C + Vector((0, 0, -0.004)), (0.199, 0.19, 0.192), segs=24, rings=16)
    bisect_keep(bm, (0, -0.17, 1.012), (0, 0.5, -1)); bisect_keep(bm, (0, 0.04, 0), (0, -1, 0)); bisect_keep(bm, (0, 0, 0.935), (0, 0, 1))
    put("beard_jaw", bm, HAIR)
    put("beard_chin", ellipsoid((0, -0.155, 0.978), (0.065, 0.04, 0.042), segs=12, rings=8), HAIR)
    for x, s in ((1, "L"), (-1, "R")):   # a short moustache that stops above the smile
        put(f"moustache.{s}", ellipsoid((0.03 * x, -0.172, 1.055), (0.034, 0.012, 0.011), rot=(0, 0, -10 * x), segs=10, rings=6), HAIR, outline=False)

def front(x, z, inset=0.004):
    """y on the front of the head at (x, z) (the head ellipsoid, as in build_custom.py)."""
    k = max(0.0, 1 - (x / HA) ** 2 - ((z - HEAD_C.z) / HC) ** 2); return -HB * math.sqrt(k) + inset
def bar(name, p0, p1, w, t, m, normal=(0, -1, 0)):
    """a flat bar from p0 to p1, w wide and t thick (glasses frame pieces)"""
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0; y = d.normalized(); n = Vector(normal).normalized()
    x = y.cross(n).normalized(); n = x.cross(y).normalized()
    M = Matrix((x, y, n)).transposed().to_4x4()
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.transform(bm, matrix=Matrix.Translation((p0 + p1) / 2) @ M @ Matrix.Diagonal((w, d.length + w, t, 1)), verts=bm.verts)
    return put(name, bm, m, outline=False)
if L["face"] == "custom":
    # a likeness face: smiling eyes with the light edge, brows, a big warm smile (the Sensei and instructor-2 likenesses)
    EYE = toon_material("S_EYE", L.get("eye", "#1d1a24"), 1.0, 1.0); SHINE = toon_material("S_SHINE", "#ffffff", 1.0, 1.0)
    RIM = toon_material("S_EYERIM", "#f3e6dc", 1.0, 1.0); BROW = toon_material("S_BROW", {"sensei": "#4a3020", "founder": "#4a4440"}.get(A.who, "#2e1d14"), 1.0, 1.0)
    EYE_SZ = {"sensei": ((0.028, 0.016, 0.034), (0.035, 0.012, 0.041)), "founder": ((0.029, 0.016, 0.024), (0.035, 0.012, 0.03))}.get(A.who, ((0.031, 0.016, 0.04), (0.038, 0.012, 0.047)))
    MOUTH = toon_material("S_MOUTH", "#7a2e30", 1.0, 1.0); TEETH = toon_material("S_TEETH", "#fbf7f0", 1.0, 1.0)
    LIP = toon_material("S_LIP", "#a8473f", 1.0, 1.0); STACHE = toon_material("S_STACHE", "#9a7350", 1.0, 1.0)
    for x, sd in ((1, "L"), (-1, "R")):
        ex, ez = 0.071 * x, 1.112
        put(f"s_eye.{sd}", ellipsoid((ex, front(ex, ez, 0.005), ez), EYE_SZ[0], rot=(0, 0, 12 * x), segs=12, rings=8), EYE, outline=False)
        put(f"s_eyerim.{sd}", ellipsoid((ex, front(ex, ez, 0.009), ez), EYE_SZ[1], rot=(0, 0, 12 * x), segs=12, rings=8), RIM, outline=False)
        put(f"s_shine.{sd}", ellipsoid((ex + 0.009 * x, front(ex, ez + 0.014, 0.0) - 0.011, ez + 0.014), (0.011, 0.006, 0.012), segs=8, rings=6), SHINE, outline=False)
        bx, bz = 0.073 * x, 1.198      # brows sit just above the frame, so they still show
        put(f"s_brow.{sd}", box_((bx, front(bx, bz, 0.0), bz), (0.056, 0.012, 0.014), rot=(-25, -9 * x, 6 * x)), BROW, outline=False)
    # the big warm smile: an open "D" smile with the top teeth showing (portrait "happy" and the sprites);
    # a soft closed smile is kept hidden for the "neutral" portrait (portrait_prep.py switches them)
    bm = ellipsoid((0, front(0, 1.03, -0.008), 1.03), (0.044, 0.009, 0.024), segs=14, rings=8); bisect_keep(bm, (0, 0, 1.036), (0, 0, -1))
    put("expr_toothy_mouth", bm, MOUTH, outline=False)
    bm = ellipsoid((0, front(0, 1.03, -0.011), 1.031), (0.036, 0.007, 0.009), segs=12, rings=6); bisect_keep(bm, (0, 0, 1.036), (0, 0, -1))
    put("expr_toothy_teeth", bm, TEETH, outline=False)
    put("expr_soft_mouth", ellipsoid((0, front(0, 1.033, -0.008), 1.033), (0.034, 0.008, 0.009), segs=10, rings=6), LIP, outline=False)
    bpy.data.objects["expr_soft_mouth"].hide_render = True
    if L.get("freckles"):
        FRECK = toon_material("S_FRECK", "#c88a68", 1.0, 1.0)
        for x in (1, -1):
            for k, (fx, fz) in enumerate(((0.098, 1.07), (0.122, 1.062), (0.11, 1.047), (0.135, 1.078))):
                put(f"s_freck{k}.{x}", ellipsoid((fx * x, front(fx * x, fz, -0.002), fz), (0.007, 0.005, 0.007), segs=8, rings=6), FRECK, outline=False)
        for k, fx in enumerate((-0.012, 0.012)):     # a few across the nose
            put(f"s_freckn{k}", ellipsoid((fx, front(fx, 1.075, -0.003), 1.075), (0.006, 0.005, 0.006), segs=8, rings=6), FRECK, outline=False)
if L["face"] == "custom" and A.who == "sensei":
    # light brown moustache and a short chin beard (kept small and neat)
    for x, sd in ((1, "L"), (-1, "R")):
        put(f"s_stache.{sd}", ellipsoid((0.027 * x, front(0.027 * x, 1.047, -0.01), 1.047), (0.032, 0.009, 0.0085), rot=(0, 0, -14 * x), segs=10, rings=6), STACHE, outline=False)
    put("s_goatee", ellipsoid((0, front(0, 0.985, -0.012), 0.985), (0.04, 0.01, 0.024), segs=12, rings=6), STACHE, outline=False)
    put("s_soulpatch", ellipsoid((0, front(0, 1.008, -0.01), 1.008), (0.01, 0.007, 0.01), segs=8, rings=6), STACHE, outline=False)
if A.who == "founder":
    # older and kind: crinkly smiling eyes (shorter eye shapes, set above), smile creases at the outer eye corners and beside the
    # mouth, thicker grey-dark brows, a full grey-and-dark moustache over the smile, and light stubble (a soft tone on the lower face)
    CREASE = toon_material("F_CREASE", "#a9705a", 1.0, 1.0); STACHE_F = toon_material("F_STACHE", "#6a635e", 1.0, 1.0)
    STACHE_D = toon_material("F_STACHE_DARK", "#3e3835", 1.0, 1.0); STUBBLE = toon_material("F_STUBBLE", "#c99d7e", 1.0, 1.0)
    for x, sd in ((1, "L"), (-1, "R")):
        for k, (dz, rz) in enumerate(((0.012, -22), (-0.012, 22))):        # crow's feet: two short lines fanning out
            cx, cz = 0.118 * x, 1.112 + dz
            put(f"f_crow{k}.{sd}", box_((cx, front(cx, cz, 0.0), cz), (0.022, 0.006, 0.004), rot=(0, rz * x, -28 * x)), CREASE, outline=False)
        put(f"f_undereye.{sd}", box_((0.071 * x, front(0.071 * x, 1.086, 0.0), 1.086), (0.034, 0.006, 0.004), rot=(-20, 0, 0)), CREASE, outline=False)
        mx, mz = 0.062 * x, 1.035                                         # smile lines beside the mouth
        put(f"f_smile.{sd}", box_((mx, front(mx, mz, 0.0), mz), (0.005, 0.006, 0.04), rot=(-15, -10 * x, -14 * x)), CREASE, outline=False)
        bx, bz = 0.073 * x, 1.162
        put(f"f_brow.{sd}", box_((bx, front(bx, bz, 0.0), bz), (0.06, 0.012, 0.018), rot=(-25, -9 * x, -7 * x)), BROW, outline=False)
        put(f"f_stache.{sd}", ellipsoid((0.034 * x, front(0.034 * x, 1.053, -0.012), 1.053), (0.05, 0.013, 0.02), rot=(0, 0, -14 * x), segs=12, rings=8), STACHE_F, outline=False)
    for ob in [o for o in bpy.data.objects if o.name.startswith("s_brow.")]: bpy.data.objects.remove(ob, do_unlink=True)   # the founder's own brows above
    bm = ellipsoid(HEAD_C + Vector((0, 0, -0.004)), (0.1915, 0.1825, 0.1885), segs=24, rings=16)       # stubble: a thin shell over the lower jaw
    bisect_keep(bm, (0, -0.17, 0.995), (0, 0.6, -1)); bisect_keep(bm, (0, 0.03, 0), (0, -1, 0)); put("f_stubble", bm, STUBBLE, outline=False)
    for n in ("s_eye", "s_eyerim"):     # crinkly smiling eyes: the bottom of each eye is cut flat, a happy half-moon
        for sd in ("L", "R"):
            ob = bpy.data.objects[f"{n}.{sd}"]; bm = bmesh.new(); bm.from_mesh(ob.data)
            bisect_keep(bm, (0, 0, 1.104 if n == "s_eye" else 1.1), (0, 0, 1)); bm.to_mesh(ob.data); bm.free()
    for n in ("expr_toothy_mouth", "expr_toothy_teeth", "expr_soft_mouth"):   # a broader smile
        me = bpy.data.objects[n].data; cen = sum((v.co for v in me.vertices), Vector()) / len(me.vertices)
        for v in me.vertices: v.co = Vector((cen.x + (v.co.x - cen.x) * 1.35, v.co.y, cen.z + (v.co.z - cen.z) * 1.15))
if L.get("headband"):
    # the optional red headband (DECIDE): a band around the head above the brows, a knot and two short tails at the back.
    # Its own overlay layer "headband" (optional, untinted), so the game can switch it on or off.
    hbc = bpy.data.collections.new("L_headband"); scene.collection.children.link(hbc)
    hbc["sprite_order"] = 99; hbc["sprite_tint"] = False; hbc["sprite_overlay"] = True; hbc["sprite_optional"] = True
    RED = toon_material("F_HEADBAND", "#c8282c"); RED_D = toon_material("F_HEADBAND_DARK", "#9a1c22")
    bm = ellipsoid(HEAD_C + Vector((0, 0.004, 0.0)), (0.214, 0.205, 0.21), segs=28, rings=20)
    bisect_keep(bm, (0, 0, 1.236), (0, -0.18, -1)); bisect_keep(bm, (0, 0, 1.186), (0, 0.18, 1))
    hb = put("headband", bm, RED); kn = put("headband_knot", ellipsoid((0, 0.212, 1.215), (0.03, 0.022, 0.026), segs=10, rings=6), RED_D)
    tails = [put(f"headband_tail{k}", ellipsoid((0.03 * x, 0.24, 1.15), (0.022, 0.012, 0.06), rot=(25, 0, 22 * x), segs=10, rings=6), RED)
             for k, x in enumerate((1, -1))]
    for ob in [hb, kn] + tails:
        for o in (ob, bpy.data.objects.get(ob.name + "_outline")):
            if o is None: continue
            for c in list(o.users_collection): c.objects.unlink(o)
            hbc.objects.link(o)
if L["hair_style"] == "founder_wavy":
    # short, wavy dark hair going grey: grey at the temples and over the ears, darker waves on top, the hairline a little higher
    # at the temples (older), never over the brows
    bm = ellipsoid(HEAD_C + Vector((0, 0.008, 0.004)), (0.196, 0.187, 0.191), segs=24, rings=16)
    bisect_keep(bm, (0, -0.19, 1.262), (0, 0.42, 1)); put("fw_cap", bm, HAIR)
    for x, sd in ((1, "L"), (-1, "R")):
        bm = ellipsoid((0.168 * x, 0.04, 1.16), (0.03, 0.075, 0.055), rot=(0, 0, -6 * x), segs=12, rings=8); put(f"fw_temple.{sd}", bm, HAIR_HI)
    rnd = random.Random(11)
    for k in range(18):               # small waves all over the top, a few grey
        a = rnd.uniform(0, 2 * math.pi); r = rnd.uniform(0.0, 0.14)
        px, py = r * math.cos(a), r * math.sin(a) * 0.95 + 0.03
        pz = HEAD_C.z + 0.19 * math.sqrt(max(0.0, 1 - (px / 0.2) ** 2 - ((py - 0.008) / 0.19) ** 2)) - 0.004
        put(f"fw_wave{k}", ellipsoid((px, py, pz), (0.042, 0.036, 0.022), rot=(rnd.uniform(-20, 20), rnd.uniform(-20, 20), rnd.uniform(0, 90)), segs=10, rings=6),
            HAIR_HI if k in (4, 13) else HAIR, outline=False)
    for k, fx in enumerate((-0.05, 0.02, 0.07)):   # a soft wave at the front
        put(f"fw_front{k}", ellipsoid((fx, front(fx, 1.262, 0.0) + 0.018, 1.275), (0.045, 0.03, 0.03), rot=(-30, 0, 10 - 10 * k), segs=10, rings=6),
            HAIR)
if L.get("glasses"):
    FRAME = toon_material("S_GLASSES", "#16141c", 1.0, 1.0)
    # bold black rectangular glasses: two lens frames that follow the face, a bridge, arms back to the ears.
    # Bars are 0.022 (rig) = about 2 px in the sprites, so they read at game size and from every direction.
    BW, BT = 0.022, 0.014
    for x, sd in ((1, "L"), (-1, "R")):
        cx, cz = 0.071 * x, 1.112; yaw = 20 * x
        R = Euler((0, 0, math.radians(yaw))).to_matrix()
        c = Vector((cx, front(cx, cz, 0.0) - 0.028, cz))
        hw, hh = 0.05, 0.045           # half width / height to the bar centre lines
        P = lambda u, v: tuple(c + R @ Vector((u, 0, v)))
        bar(f"gl_top.{sd}", P(-hw, hh), P(hw, hh), BW, BT, FRAME)
        bar(f"gl_bot.{sd}", P(-hw, -hh), P(hw, -hh), BW, BT, FRAME)
        bar(f"gl_in.{sd}", P(-hw * x, -hh), P(-hw * x, hh), BW, BT, FRAME)
        bar(f"gl_out.{sd}", P(hw * x, -hh), P(hw * x, hh), BW, BT, FRAME)
        oc = Vector(P(hw * x, hh * 0.55))
        # temple arms (samples 3): from the lens corner out to a hinge just off the cheek, straight back along the side of
        # the head, over the top of the ear, and a short drop behind it, so they read as real glasses from the side and 3/4
        hinge = Vector((0.152 * x, oc.y + 0.045, oc.z)); over = Vector((0.212 * x, 0.0, 1.142)); behind = Vector((0.203 * x, 0.04, 1.108))
        bar(f"gl_hinge.{sd}", tuple(oc), tuple(hinge), 0.018, 0.014, FRAME)
        bar(f"gl_arm.{sd}", tuple(hinge), tuple(over), 0.02, 0.012, FRAME, normal=(x, 0, 0))
        bar(f"gl_armtip.{sd}", tuple(over), tuple(behind), 0.018, 0.012, FRAME, normal=(x, 0, 0))
    bar("gl_bridge", (0.024, front(0.024, 1.13, 0.0) - 0.03, 1.13), (-0.024, front(-0.024, 1.13, 0.0) - 0.03, 1.13), 0.016, BT, FRAME)
if L["hair_style"] == "sensei_top":
    # short on the sides, longer and tousled on top, swept up at the front (hairline stays above the brows and the frame)
    bm = ellipsoid(HEAD_C + Vector((0, 0.006, 0.006)), (0.197, 0.188, 0.193), segs=24, rings=16)
    bisect_keep(bm, (0, -0.19, 1.25), (0, 0.5, 1)); put("st_sides", bm, HAIR)
    bm = ellipsoid(HEAD_C + Vector((0, 0.015, 0.085)), (0.178, 0.172, 0.15), segs=22, rings=14)
    bisect_keep(bm, (0, 0, 1.22), (0, 0, 1)); bisect_keep(bm, (0, -0.16, 1.26), (0, 0.6, 1)); put("st_top", bm, HAIR)
    rnd = random.Random(7)
    for k in range(16):               # tousled tufts on top, a few with lighter tips
        a = rnd.uniform(0, 2 * math.pi); r = rnd.uniform(0.02, 0.13)
        px, py = r * math.cos(a), r * math.sin(a) * 0.9 + 0.02
        pz = HEAD_C.z + 0.085 + 0.15 * math.sqrt(max(0.0, 1 - (px / 0.178) ** 2 - ((py - 0.015) / 0.172) ** 2)) - 0.012
        put(f"st_tuft{k}", ellipsoid((px, py, pz), (0.045, 0.04, 0.03), rot=(rnd.uniform(-25, 25), rnd.uniform(-25, 25), rnd.uniform(0, 90)), segs=10, rings=6),
            HAIR_HI if k % 4 == 0 else HAIR)
    for k, (fx, rz) in enumerate(((-0.06, 14), (0.0, 0), (0.06, -14))):   # the front, swept up and back
        fz = 1.305; fy = front(fx, 1.27, 0.0) + 0.01
        put(f"st_quiff{k}", ellipsoid((fx, fy, fz), (0.05, 0.034, 0.06), rot=(-40, 0, rz), segs=12, rings=8), HAIR_HI if k == 1 else HAIR)

if L["hair_style"] == "low_ponytail":
    # a low ponytail (Batch 7 full set, her request): smooth dark brown hair with a middle part, short side pieces framing the
    # face, pulled back to a dark tie low at the back of the head; the tail is PURPLE (baked in) and falls behind the shoulders,
    # sweeping round her left side and forward over her LEFT shoulder, so a purple length lies on the front of her chest. Clearly unlike Senpai's high ponytail (tie on the
    # crown, tail swinging out behind the head). The tail below the tie hangs from the CHEST bone so it follows her in the bow.
    PURP = toon_material("I2_PURPLE", "#7d4cc2"); PURP_HI = toon_material("I2_PURPLE_HI", "#a07ae0"); TIE = toon_material("I2_TIE", "#26202a")
    hs = L["head"]
    def H(p): return Vector((p[0] * hs, p[1] * hs, 0.95 + (p[2] - 0.95) * hs))
    bm = ellipsoid(HEAD_C + Vector((0, 0.008, 0.012)), (0.204, 0.196, 0.2), segs=24, rings=16); bisect_keep(bm, (0, -0.19, 1.262), (0, 0.38, 1)); put("lp_cap", bm, HAIR)
    put("lp_part", ellipsoid((0, front(0, 1.3, 0.0) + 0.02, 1.30), (0.006, 0.05, 0.012), rot=(-40, 0, 0), segs=8, rings=6), HAIR_HI, outline=False)
    bm = ellipsoid(HEAD_C + Vector((0, 0.02, -0.01)), (0.207, 0.195, 0.205), segs=24, rings=16); bisect_keep(bm, (0, 0.03, 0), (0, 1, 0)); bisect_keep(bm, (0, 0, 1.0), (0, 0, 1)); put("lp_back", bm, HAIR)
    for x, sd in ((1, "L"), (-1, "R")):
        put(f"lp_side.{sd}", ellipsoid((0.176 * x, -0.03, 1.12), (0.04, 0.06, 0.1), rot=(8, 0, -8 * x), segs=12, rings=8), HAIR)
        put(f"lp_sweep.{sd}", ellipsoid((0.13 * x, 0.13, 1.1), (0.06, 0.08, 0.05), rot=(0, 0, 30 * x), segs=12, rings=8), HAIR)   # pulled back to the tie
    put("lp_tie", ellipsoid((0.025, 0.2, 1.03), (0.045, 0.03, 0.035), segs=12, rings=8), TIE)
    put("lp_root", ellipsoid((0.035, 0.21, 0.99), (0.05, 0.04, 0.045), segs=12, rings=8), PURP)
    t0 = H((0.035, 0.21, 0.99))
    # the tail sweeps from the tie round the LEFT side of the neck, over the top of her left shoulder and down the front of
    # her chest (her signature look, so it reads from the front and in the portraits as well as from the side and back).
    # Chest bone, so it follows the bow; it stays clear of the gi, the collar, the head and the left arm.
    path = [Vector(t0), Vector((0.07, 0.15, 0.985)), Vector((0.125, 0.09, 0.99)), Vector((0.16, 0.02, 0.985)), Vector((0.158, -0.055, 0.955)),
            Vector((0.138, -0.112, 0.89)), Vector((0.122, -0.136, 0.82)), Vector((0.11, -0.142, 0.755))]
    def along(t):                                   # a point on the path, t in 0..1 (linear between the points)
        u = t * (len(path) - 1); i = min(int(u), len(path) - 2); f = u - i
        return path[i].lerp(path[i + 1], f), (path[i + 1] - path[i]).normalized()
    N = 14
    for k in range(N):
        t = (k + 0.5) / N; pos, d = along(t); w = 0.046 - 0.016 * t
        q = Vector((0, 0, 1)).rotation_difference(d)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=1.0)
        bmesh.ops.transform(bm, matrix=Matrix.Translation(pos) @ q.to_matrix().to_4x4() @ Matrix.Diagonal((w, w * 0.8, 0.05, 1)), verts=bm.verts)
        put(f"lp_tail{k}", bm, PURP, bone="chest")
        if k % 3 == 1:
            hp = pos + Vector((0.012, -0.022, 0.0)) if t > 0.4 else pos + Vector((0.016, 0.0, 0.02))
            put(f"lp_tailhi{k}", ellipsoid(hp, (0.014, 0.012, 0.026)), PURP_HI, outline=False, bone="chest")
# ------------------------------------------------------------------ portrait expressions (Batch 7 full set), every character
# Mouth pieces named expr_<expr>_*: portrait_prep.py shows the set for PORTRAIT_EXPR (neutral / happy / proud / thinking).
# The likeness faces have soft + toothy already; the player faces (Senpai, Kohai) keep their own mouth as the neutral one.
EM = toon_material("X_MOUTH", "#7a2e30", 1.0, 1.0); ET = toon_material("X_TEETH", "#fbf7f0", 1.0, 1.0)
for ob in [o for o in bpy.data.objects if o.parent_bone == "head" and o.name.endswith("_mouth") and not o.name.startswith("expr_")]:
    ob.name = "expr_soft_" + ob.name                 # the player face's mouth is the neutral one
if not bpy.data.objects.get("expr_toothy_mouth"):
    bm = ellipsoid((0, front(0, 1.03, -0.008), 1.03), (0.04, 0.009, 0.022), segs=14, rings=8); bisect_keep(bm, (0, 0, 1.036), (0, 0, -1)); put("expr_toothy_mouth", bm, EM, outline=False)
    bm = ellipsoid((0, front(0, 1.03, -0.011), 1.031), (0.032, 0.007, 0.008), segs=12, rings=6); bisect_keep(bm, (0, 0, 1.036), (0, 0, -1)); put("expr_toothy_teeth", bm, ET, outline=False)
    for n in ("expr_toothy_mouth", "expr_toothy_teeth"): bpy.data.objects[n].hide_render = True    # sprites keep the face's own mouth
mw = 1.3 if A.who == "founder" else 1.0
bm = ellipsoid((0, front(0, 1.034, -0.008), 1.034), (0.044 * mw, 0.008, 0.014), segs=14, rings=8); bisect_keep(bm, (0, 0, 1.037), (0, 0, -1))
put("expr_proud_mouth", bm, EM, outline=False)        # a wide, closed, confident smile
put("expr_thinking_mouth", ellipsoid((0.016, front(0.016, 1.03, -0.008), 1.03), (0.018 * mw, 0.007, 0.006), rot=(0, 0, -12), segs=10, rings=6), EM, outline=False)
for n in ("expr_proud_mouth", "expr_thinking_mouth"): bpy.data.objects[n].hide_render = True

# body B fix: build_custom.py shrank body B's ears with ob.scale, which scales about the world origin and so also moved them
# down to the jaw. Here the ears get their real size (0.85) about their own centre, in their place beside the eyes.
for side in ("L", "R"):
    ob = bpy.data.objects.get(f"ear.{side}")
    if ob is not None and abs(ob.scale[0] - 1.0) > 1e-6:
        f = ob.scale[0]; ob.scale = (1, 1, 1); bpy.context.view_layer.update()
        me = ob.data; cen = sum((v.co for v in me.vertices), Vector()) / len(me.vertices)
        for v in me.vertices: v.co = cen + (v.co - cen) * f
        o = bpy.data.objects.get(f"ear.{side}_outline")
        if o is not None: o.scale = (1, 1, 1)

# ------------------------------------------------------------------ closed gi collar (samples 3, Jay: a shirt is worn under the gi,
# so no skin shows except the face, hands and feet). The skin oval in the neck opening (chest_v, from the Batch 1 model) is removed,
# and the opening is filled with gi cloth on the tinted gi layer, so the whole chest and collar recolour with the gi. The lapels
# are re-laid to cross high on the chest, left over right as a gi is worn; they stay a lighter tone of the gi, as a subtle line.
GI_M = bpy.data.objects["gi_torso"].data.materials[0]; LAPEL_M = bpy.data.objects["gi_lapel.L"].data.materials[0]
for n in ("chest_v", "chest_v_outline"):
    ob = bpy.data.objects.get(n)
    if ob is not None: bpy.data.objects.remove(ob, do_unlink=True)
def gi_piece(name, bm, m):
    me = bpy.data.meshes.new(name)
    for f in bm.faces: f.smooth = True
    bm.to_mesh(me); bm.free(); me.materials.append(m)
    ob = bpy.data.objects.new(name, me); C("gi").objects.link(ob); parent(ob, "chest"); return ob
def strip_(p0, p1, width, thick, normal_hint=(0, -1, 0.25)):
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0; y = d.normalized(); n = Vector(normal_hint).normalized()
    x = y.cross(n).normalized(); n = x.cross(y).normalized(); M = Matrix((x, y, n)).transposed().to_4x4()
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.transform(bm, matrix=Matrix.Translation((p0 + p1) / 2) @ M @ Matrix.Diagonal((width, d.length, thick, 1)), verts=bm.verts); return bm
# the fill: a rounded piece of gi in front of the neck and upper chest, between the lapels and up under the chin
gi_piece("gi_collar_fill", ellipsoid((0, -0.052, 0.925), (0.075, 0.05, 0.062), segs=16, rings=10), GI_M)
for n in ("gi_lapel.L", "gi_lapel.R"):
    ob = bpy.data.objects[n]; bpy.data.objects.remove(ob, do_unlink=True)
gi_piece("gi_lapel.R", strip_((-0.07, -0.098, 0.962), (0.016, -0.108, 0.84), 0.033, 0.010), LAPEL_M)      # under: it ends where the left lapel covers it
gi_piece("gi_lapel.L", strip_((0.07, -0.1, 0.962), (-0.07, -0.13, 0.64), 0.035, 0.012), LAPEL_M)          # over (wearer's left)

# ------------------------------------------------------------------ layer order: body 0, gi 1, belt layers as the player
order = ["body", "gi", "belt", "belt-sheen", "belt-center", "belt-center-edge", "belt-rim", "belt-tape1-edge", "belt-tape1", "belt-tape2-edge", "belt-tape2"]
if L.get("headband"): order.append("headband")      # the founder's optional headband overlay, drawn last
for i, n in enumerate(order): C(n)["sprite_order"] = i
assert sorted(c.name[2:] for c in bpy.data.collections if c.name.startswith("L_")) == sorted(order)

# ------------------------------------------------------------------ proportions + outlines at the house width
arm.scale = (L["scale"],) * 3
arm.pose.bones["head"].scale = (L["head"],) * 3
def under_head(ob): return ob.parent_type == "BONE" and ob.parent_bone == "head"
n_out = 0
for ob in [o for o in bpy.data.objects if o.name.endswith("_outline") and o.type == "MESH"]:
    src = bpy.data.objects.get(ob.name[:-len("_outline")])
    if src is None or src.type != "MESH": continue
    k = L["scale"] * (L["head"] if under_head(src) else 1.0)
    bm = bmesh.new(); bm.from_mesh(src.data); bm.normal_update()
    w = OUTLINE_W / k
    for v in bm.verts: v.co += v.normal * w
    bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(ob.name); bm.to_mesh(me); bm.free(); me.materials.append(OUTLINE)
    old = ob.data; ob.data = me
    if old.users == 0: bpy.data.meshes.remove(old)
    ob.matrix_parent_inverse = src.matrix_parent_inverse.copy(); ob.matrix_basis = src.matrix_basis.copy()
    n_out += 1
print("outlines rebuilt:", n_out)

# ------------------------------------------------------------------ actions (rig space, like build_character.py)
for act in list(bpy.data.actions): bpy.data.actions.remove(act)
PB = arm.pose.bones
REST = {"foot.L": Vector((0.085, 0, 0.07)), "foot.R": Vector((-0.085, 0, 0.07)), "hand.L": Vector((0.19, -0.01, 0.54)), "hand.R": Vector((-0.19, -0.01, 0.54))}
def to_local(bn, v): return arm.data.bones[bn].matrix_local.to_3x3().inverted() @ Vector(v)
def lerp(a, b, t): return a + (b - a) * t if isinstance(a, (int, float)) else tuple(x + (y - x) * t for x, y in zip(a, b))
def blend(p, q, t): return {k: lerp(p[k], q[k], t) for k in p}
ease = lambda x: 0.5 - 0.5 * math.cos(math.pi * x)
def pose(hips=(0, 0, 0), hips_rot=(0, 0, 0), chest_rot=(0, 0, 0), head_rot=(0, 0, 0), foot_l=(0.085, 0, 0.07), foot_r=(-0.085, 0, 0.07),
         foot_l_rot=(0, 0, 0), foot_r_rot=(0, 0, 0), hand_l=(0.19, -0.01, 0.54), hand_r=(-0.19, -0.01, 0.54)):
    return dict(hips=hips, hips_rot=hips_rot, chest_rot=chest_rot, head_rot=head_rot, foot_l=foot_l, foot_r=foot_r,
                foot_l_rot=foot_l_rot, foot_r_rot=foot_r_rot, hand_l=hand_l, hand_r=hand_r)
def apply(p, frame):
    def rot(pb, r): pb.rotation_euler = Euler([math.radians(v) for v in r], "XYZ"); pb.keyframe_insert("rotation_euler", frame=frame)
    def loc(pb, o): pb.location = to_local(pb.name, o); pb.keyframe_insert("location", frame=frame)
    loc(PB["hips"], p["hips"]); rot(PB["hips"], p["hips_rot"]); rot(PB["chest"], p["chest_rot"]); rot(PB["head"], p["head_rot"])
    loc(PB["foot_ik.L"], Vector(p["foot_l"]) - REST["foot.L"]); rot(PB["foot_ik.L"], p["foot_l_rot"])
    loc(PB["foot_ik.R"], Vector(p["foot_r"]) - REST["foot.R"]); rot(PB["foot_ik.R"], p["foot_r_rot"])
    loc(PB["hand_ik.L"], Vector(p["hand_l"]) - REST["hand.L"]); loc(PB["hand_ik.R"], Vector(p["hand_r"]) - REST["hand.R"])
def make_action(name, poses, fps, loop, info=None, tags=""):
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

# IDLE: relaxed, natural standing (not a fighting stance). Head pitch -16 is the rig's "looking straight ahead" for the 35° camera.
if A.who == "sensei":      # standing tall and calm: feet a little apart, hands relaxed at the sides
    REL = pose(head_rot=(-16, 0, 0), foot_l=(0.09, 0.0, 0.07), foot_r=(-0.09, 0.0, 0.07), foot_l_rot=(0, 12, 0), foot_r_rot=(0, -12, 0),
               hand_l=(0.19, -0.015, 0.55), hand_r=(-0.19, -0.015, 0.55), hips=(0, 0, -0.002))
    SWAY = dict(chest=1.2, hips=0.004, side=0.0, hands=0.006)
elif A.who == "senpai":    # confident and friendly: weight a touch on one leg, one hand resting on the belt knot
    REL = pose(head_rot=(-16, 4, 2), hips=(0.012, 0, -0.006), hips_rot=(0, -4, -3), chest_rot=(0, 3, 2),
               foot_l=(0.10, -0.01, 0.07), foot_r=(-0.085, 0.02, 0.07), foot_l_rot=(0, 14, 0), foot_r_rot=(0, -18, 0),
               hand_l=(0.19, -0.02, 0.55), hand_r=(-0.08, -0.15, 0.60))
    SWAY = dict(chest=1.5, hips=0.005, side=0.004, hands=0.006)
elif A.who == "instructor-2":   # friendly and calm: feet a little apart, one hand relaxed at the side, the other resting by the belt
    REL = pose(head_rot=(-16, -3, -2), hips=(-0.008, 0, -0.004), hips_rot=(0, 3, 2), chest_rot=(0, -2, -1),
               foot_l=(0.085, 0.01, 0.07), foot_r=(-0.095, -0.01, 0.07), foot_l_rot=(0, 16, 0), foot_r_rot=(0, -12, 0),
               hand_l=(0.19, -0.02, 0.55), hand_r=(-0.17, -0.06, 0.57))
    SWAY = dict(chest=1.3, hips=0.004, side=0.003, hands=0.006)
elif A.who == "founder":   # lively and warm: a solid stance, feet a little wider, hands loose, a slightly bigger sway
    REL = pose(head_rot=(-15, 2, 1), hips=(0, 0, -0.005), foot_l=(0.10, 0.0, 0.07), foot_r=(-0.10, 0.0, 0.07), foot_l_rot=(0, 16, 0), foot_r_rot=(0, -16, 0),
               hand_l=(0.20, -0.02, 0.55), hand_r=(-0.20, -0.02, 0.55))
    SWAY = dict(chest=1.6, hips=0.005, side=0.003, hands=0.007)
else:                      # eager and a little shy: feet close, hands held together in front, a small bounce
    REL = pose(head_rot=(-14, 0, 0), hips=(0, 0, -0.004), chest_rot=(2, 0, 0),
               foot_l=(0.065, -0.01, 0.07), foot_r=(-0.065, -0.01, 0.07), foot_l_rot=(0, 6, 0), foot_r_rot=(0, -6, 0),
               hand_l=(0.025, -0.15, 0.56), hand_r=(-0.025, -0.155, 0.56))
    SWAY = dict(chest=2.0, hips=0.008, side=0.0, hands=0.01)
idle = []
for i in range(8):
    ph = 2 * math.pi * i / 8; b = math.sin(ph); c = (1 - math.cos(ph)) / 2
    p = dict(REL)
    p["hips"] = (REL["hips"][0] + SWAY["side"] * b, REL["hips"][1], REL["hips"][2] - SWAY["hips"] * c)
    p["chest_rot"] = (REL["chest_rot"][0] + SWAY["chest"] * b, REL["chest_rot"][1], REL["chest_rot"][2])
    p["head_rot"] = (REL["head_rot"][0] - 0.8 * b, REL["head_rot"][1], REL["head_rot"][2])
    p["hand_l"] = (REL["hand_l"][0], REL["hand_l"][1], REL["hand_l"][2] - SWAY["hands"] * c)
    p["hand_r"] = (REL["hand_r"][0], REL["hand_r"][1], REL["hand_r"][2] - SWAY["hands"] * (1 - math.cos(ph + 0.5)) / 2)
    idle.append(p)
make_action("idle", idle, 8, True, {"note": "relaxed natural standing, loop (sample)"})

# BOW (rei), the approved player bow and Jay's rules: heels together, legs straight (knee about 172°, not locked),
# a 30° bend only from the hips with a straight back, head up and eyes forward, hands at the sides of the thighs.
ATTN = pose(hips=(0, 0.0, -0.001), head_rot=(-16, 0, 0), foot_l=(0.05, 0.0, 0.07), foot_r=(-0.05, 0.0, 0.07),
            foot_l_rot=(0, 20, 0), foot_r_rot=(0, -20, 0), hand_l=(0.185, 0.0, 0.55), hand_r=(-0.185, 0.0, 0.55))
def bowed(t):
    p = dict(ATTN)
    p["hips"] = (0, 0.045 * t, -0.001 - 0.002 * t); p["hips_rot"] = (30 * t, 0, 0); p["head_rot"] = (-16 - 27 * t, 0, 0)
    p["hand_l"] = (0.185, -0.045 * t, 0.55 - 0.035 * t); p["hand_r"] = (-0.185, -0.045 * t, 0.55 - 0.035 * t)
    return p
bow = [REL, blend(REL, ATTN, 0.5), ATTN, ATTN]
bow += [bowed(ease(k / 5)) for k in range(1, 6)] + [bowed(1.0)] * 4 + [bowed(ease(1 - k / 5)) for k in range(1, 6)]
bow += [blend(ATTN, REL, 0.5), REL]
make_action("bow", bow, 16, False, {"keyFrames": {"feet_together": 2, "bow_down": "4-8", "bow_hold": "8-12", "rise": "13-17", "upright": 17},
            "note": "standing bow from the relaxed idle, 20 frames = 1.25 s; legs straight once the heels are together, the bend only from the hips, head up, eyes forward"},
            tags="feet_together:2,bow_hold:8-12,upright:17")

# WALK: a calm walk (not the player's jog). 12 frames = one loop (2 steps). The step scales with the character's size (0.42 rig
# units = about the player's leg length x 0.9), and the fps is chosen so the loop moves at about 2 tiles/s; a planted foot
# moves back exactly one frame of travel per frame, so the feet don't slide when the game moves the character at that speed.
WF = 12; STEP_RIG = 0.42; D = STEP_RIG / 6                      # rig units per frame (6 frames per step)
WALK_FPS = round(2.0 * WF / (2 * STEP_RIG * L["scale"]))
STRIDE = 2 * STEP_RIG * L["scale"]; WALK_SPEED = STRIDE * WALK_FPS / WF
def foot_path(i):                                              # one foot over 12 frames: 7 frames planted, 5 in the swing
    if i <= 6: return (-3 * D + D * i, 0.07, -4 + 14 * i / 6)    # contact in front -> push off behind
    k = i - 6; t = ease(k / 6)
    return (3 * D - 6 * D * t, 0.07 + 0.055 * math.sin(math.pi * k / 6), 10 - 16 * t)
walk = []
for i in range(WF):
    l, r = foot_path(i), foot_path((i + 6) % WF); ph = 2 * math.pi * i / WF; sw = math.cos(ph)
    bob = -0.004 - 0.006 * (0.5 + 0.5 * math.cos(2 * ph))      # lowest at the contacts, highest as the legs pass
    p = pose(hips=(0.006 * math.cos(ph), 0, bob), hips_rot=(2, -5 * sw, 0), chest_rot=(1, 7 * sw, 0), head_rot=(-16, -3 * sw, 0),
             foot_l=(0.08, l[0], l[1]), foot_r=(-0.08, r[0], r[1]), foot_l_rot=(l[2], 0, 0), foot_r_rot=(r[2], 0, 0),
             hand_l=(0.19, -0.01 + 0.07 * sw, 0.55 + 0.012 * abs(sw)), hand_r=(-0.19, -0.01 - 0.07 * sw, 0.55 + 0.012 * abs(sw)))
    walk.append(p)
wa = make_action("walk", walk, WALK_FPS, True, {"note": f"calm walk, loop of 2 steps; about {WALK_SPEED:.2f} tiles/s at {WALK_FPS} fps"})
wa["sprite_stride_tiles"] = round(STRIDE, 4); wa["sprite_design_speed"] = round(WALK_SPEED, 4)

# TALK: a gentle speaking gesture, loop (played while a speech card is open): one open hand rises a little in front of the
# body and makes a small, calm beat; the head nods softly with the words. 16 frames at 10 fps.
TALK = []
for i in range(16):
    ph = 2 * math.pi * i / 16; b = math.sin(ph); b2 = math.sin(2 * ph)
    p = dict(REL)
    p["hand_r"] = (-0.15, -0.12 - 0.02 * b, 0.66 + 0.035 * (0.5 + 0.5 * b))
    p["head_rot"] = (REL["head_rot"][0] + 2.2 * b2, REL["head_rot"][1] + 3 * b, REL["head_rot"][2])
    p["chest_rot"] = (REL["chest_rot"][0] + 1.0 * b, REL["chest_rot"][1] - 2 * b, REL["chest_rot"][2])
    TALK.append(p)
make_action("talk", TALK, 10, True, {"note": "gentle speaking gesture, loop"})

# NOD: an approving nod, once: two small nods, the second smaller, then back. 12 frames at 12 fps.
def head(dp): p = dict(REL); p["head_rot"] = (REL["head_rot"][0] + dp, REL["head_rot"][1], REL["head_rot"][2]); return p
NOD = [head(v) for v in (0, 6, 13, 15, 8, 1, 7, 10, 5, 1, 0, 0)]
make_action("nod", NOD, 12, False, {"keyFrames": {"down": 4, "second_down": 8}, "note": "approving nod, once"}, tags="down:4")

# POINT: points / gestures toward something ("over there"), once, holds the last frame: the right arm rises and extends
# forward and to the right, the head and chest turn a little that way. 14 frames at 12 fps; frames 10-14 are the hold.
PT = dict(REL); PT["hand_r"] = (-0.29, -0.30, 0.93); PT["head_rot"] = (REL["head_rot"][0] - 2, -14, 0); PT["chest_rot"] = (0, -10, 0); PT["hips_rot"] = (0, -3, 0)
PT_UP = dict(REL); PT_UP["hand_r"] = (-0.2, -0.16, 0.76); PT_UP["head_rot"] = (REL["head_rot"][0], -8, 0)
POINT = [REL, blend(REL, PT_UP, 0.4), blend(REL, PT_UP, 0.8), PT_UP, blend(PT_UP, PT, 0.35), blend(PT_UP, PT, 0.7), blend(PT_UP, PT, 0.92), PT, PT, PT, PT, PT, PT, PT]
make_action("point", POINT, 12, False, {"keyFrames": {"pointing": 8, "hold": "8-14"}, "holdLastFrame": True,
            "note": "points forward-right (his/her right), once; hold the last frame"}, tags="pointing:8")

if A.who in ("sensei", "senpai"):
    # DEMONSTRATE (approved in the samples): slow and clean, so a kid can copy it. From the relaxed stance he steps the left foot out to a
    # natural parallel stance (heiko-dachi, feet shoulder width), fists ready in front of the belt (yoi). Then:
    #   inside-to-outside middle block (uchi-uke) with the LEFT forearm, the right fist chambered at the right hip, palm up;
    #   a middle punch (chudan-zuki) with the RIGHT fist to the centre line at chest height, the left fist pulled back to
    #   the left hip (hikite) at the same time; elbow soft, never locked; shoulders level and down; a short hold (kime);
    # then back to yoi and the relaxed stance. 12 fps, 28 frames = 2.33 s.
    YOI = pose(head_rot=(-16, 0, 0), hips=(0, 0, -0.012), foot_l=(0.12, 0.0, 0.07), foot_r=(-0.12, 0.0, 0.07), foot_l_rot=(0, 4, 0), foot_r_rot=(0, -4, 0),
               hand_l=(0.085, -0.13, 0.60), hand_r=(-0.085, -0.13, 0.60))
    STEP = dict(YOI); STEP["foot_l"] = (0.105, 0.0, 0.10); STEP["hips"] = (-0.012, 0, -0.008)
    CHAMB = dict(YOI); CHAMB["hand_r"] = (-0.135, 0.035, 0.63); CHAMB["hand_l"] = (-0.09, -0.15, 0.66); CHAMB["chest_rot"] = (0, 6, 0)   # left fist crosses low to the right side
    BLOCK = dict(YOI); BLOCK["hand_r"] = (-0.135, 0.035, 0.63); BLOCK["hand_l"] = (0.17, -0.24, 0.90); BLOCK["chest_rot"] = (0, -8, 0)
    BLOCK["hips_rot"] = (0, -5, 0)
    PUNCH = dict(YOI); PUNCH["hand_l"] = (0.135, 0.035, 0.63); PUNCH["hand_r"] = (-0.01, -0.50, 0.80); PUNCH["chest_rot"] = (2, 8, 0); PUNCH["hips_rot"] = (0, 6, 0)
    PHOLD = dict(PUNCH); PHOLD["hand_r"] = (-0.01, -0.495, 0.797)
    demo = [REL, blend(REL, STEP, 0.6), STEP, blend(STEP, YOI, 0.6), YOI, YOI,
            blend(YOI, CHAMB, 0.5), CHAMB, blend(CHAMB, BLOCK, 0.5), BLOCK, BLOCK, BLOCK, BLOCK,
            blend(BLOCK, PUNCH, 0.35), blend(BLOCK, PUNCH, 0.75), PUNCH, PHOLD, PHOLD, PHOLD, PHOLD,
            blend(PUNCH, YOI, 0.4), blend(PUNCH, YOI, 0.8), YOI, YOI, blend(YOI, STEP, 0.5), STEP, blend(STEP, REL, 0.6), REL]
    make_action("demonstrate", demo, 12, False,
                {"keyFrames": {"ready": "4-5", "block": "9-12", "punch": 15, "kime_hold": "15-19", "ready_again": "22-23"},
                 "note": "slow demonstration (sample): parallel stance, left inside-to-outside middle block, then right middle punch with hikite; once"},
                tags="block:9-12,punch:15")

# PORTRAITS: one still pose per expression (facing the viewer, head level for the front camera). portrait_prep.py also
# switches the mouth (and moves the brows) for the expression.
PORT = dict(REL); PORT["head_rot"] = (-2, 0, 0); PORT["hips_rot"] = (0, 0, 0); PORT["chest_rot"] = (0, 0, 0); PORT["hips"] = (0, 0, REL["hips"][2])
if A.who == "senpai": PORT["head_rot"] = (-2, 0, 3)
make_action("portrait", [PORT], 1, False, {"note": "portrait still (samples)"})
PH = dict(PORT); PH["head_rot"] = (PORT["head_rot"][0] - 1, 0, 4)                               # happy: a small warm tilt
PP = dict(PORT); PP["head_rot"] = (-8, 0, 0); PP["chest_rot"] = (-3, 0, 0)                        # proud: chin up, chest up
PTK = dict(PORT); PTK["head_rot"] = (-5, 8, 7); PTK["hand_r"] = (-0.06, -0.2, 0.87)               # thinking: head tilted, hand to the chin
for ex, pp in (("neutral", PORT), ("happy", PH), ("proud", PP), ("thinking", PTK)):
    make_action(f"portrait_{ex}", [pp], 1, False, {"note": f"portrait still, {ex} (rendered with the portrait camera, see README)"})

# ------------------------------------------------------------------ restore and write the meta
arm.data.pose_position = "POSE"; arm.animation_data.action = bpy.data.actions["idle"]
meta = json.loads(scene.get("sprite_meta", "{}"))
for k in ("palettes", "palettesDraftLabels", "groups", "optionNotes"): meta.pop(k, None)
tg = meta.get("tintGuidance", {}); tg.pop("skin", None); tg.pop("hair", None)
tg["gi"] = f"multiply by this character's gi colour; suggested placeholder {L['gi']}"
meta["character"] = A.who
meta["suggested"] = dict(gi=L["gi"], belt=L["belt"], note="default look (approved by Jay); the game can set another belt (beltStyles) and gi colour")
meta["lookNote"] = L["note"]
if L.get("headband"):
    meta["optionalLayers"] = {"headband": {"default": False, "note": "the founder's red headband; OFF by default (Jay, samples 3). Draw it only when the game switches it on"}}
meta["proportions"] = dict(rigScale=L["scale"], headScale=L["head"], note="the whole rig is scaled; the head bone is scaled back so heads stay a similar size")
scene["sprite_meta"] = json.dumps(meta)
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(A.out))
print("saved", A.out)
