"""Action Zone staff NPCs (Nov 23, Jay: "rework if needed"): Jay, Hannah and Michael, built on the approved hero v2
model so they match the player. Grown-up proportions (taller body, the head scaled back), their own hair, faces and
colours from Jay's photos, plus glasses, beards, freckles and purple hair ends made here. Everything is flattened into
one layer (these characters keep their own look: no tints in the game). Adds two actions: npc_idle (relaxed, breathing)
and npc_wave; the hero's bow is kept.

    blender -b incoming-art/claude-hero-v2/source/player_hero2_<a|b>.blend -P build_staff.py -- --who jay --save <out.blend>
"""
import bpy, bmesh, sys, math, argparse, json
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--who", required=True)
ap.add_argument("--save", required=True)
a = ap.parse_args(argv)

STAFF = {
    "jay": dict(face="03", grin=0.090, hair="02", skin="#f0c4a4", hairc="#8a6440", gi="#2b2b33", lapel="#2b2b33", belt="#1b1b1f",
                iris="#6d8aa3", glasses=True, beard="#9a6a42", mustache=True, goatee=True, quiff=True),
    "hannah": dict(face="06", grin=0.060, hair="15", skin="#f2cdb6", hairc="#3a2a26", gi="#2f6fc4", lapel="#2f6fc4", belt="#1b1b1f",
                   iris="#7f98ab", tips="#7b4fc2"),
    "michael": dict(face="05", grin=0.100, buff=True, hair="03", skin="#c98c62", hairc="#4a403b", gi="#f4f4f4", lapel="#e8e8e8", belt="#1b1b1f",
                    iris="#4a3020", beard="#a59e96", mustache=True, smile=True),
}
# Everyday people for the Street Smarts store (Jay, Nov 24): no gi and no belt, a shirt, trousers and shoes. The store
# staff (worker, cashier) wear the store's blue vest with a white name tag, so kids can spot who works there.
CIV = dict(
    mom=dict(body="b", face="02", hair="05", skin="#e9b48f", hairc="#5a3a22", shirt="#d9577a", pants="#3d5a8a", shoes="#f4f4f4", iris="#5a7a4a", grin=0.07),
    dad=dict(body="a", face="04", hair="14", skin="#d9a27a", hairc="#2e2420", shirt="#3f8f6a", pants="#4a4a55", shoes="#2a2a2a", iris="#4a3020", grin=0.08),
    worker=dict(body="a", face="01", hair="07", skin="#8d5a3c", hairc="#1e1a18", shirt="#f2f2f2", pants="#2e3440", shoes="#202020", iris="#3a2418", grin=0.09, vest="#2f74c8"),
    cashier=dict(body="b", face="05", hair="11", skin="#f0c8a8", hairc="#c8823a", shirt="#f6d55c", pants="#2e3440", shoes="#202020", iris="#4a6a8a", grin=0.07, vest="#2f74c8"),
    shopper=dict(body="a", face="03", hair="09", skin="#e0b090", hairc="#6a4a30", shirt="#8a7a9a", pants="#7a6a52", shoes="#4a3a2a", iris="#4a3020"),
    stranger=dict(body="b", face="06", hair="16", skin="#c08060", hairc="#2a2020", shirt="#e8a040", pants="#3d5a8a", shoes="#e8e8e8", iris="#3a2418"),
)
for k, v in CIV.items():
    v.update(civ=True, gi=v["shirt"], lapel=v["shirt"], belt=v["shirt"])
    STAFF[k] = v
P = STAFF[a.who]
CIVIL = bool(P.get("civ"))
sc = bpy.context.scene
rig = bpy.data.objects["MartialArtistRig"]
root = bpy.data.objects["CHAR_ROOT"]


def lin(h):
    h = h.lstrip("#"); o = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        o.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return o


# ---- rest pose for building (no action), so new pieces are placed on the head as modelled
rig.animation_data.action = None
for pb in rig.pose.bones:
    pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
sc.frame_set(1)
bpy.context.view_layer.update()

# ---- keep only the chosen face and hair; drop props, belt stripes and tape
keep = {f"L_face-{P['face']}", f"L_hair-{P['hair']}"}
drop = []
for c in list(bpy.data.collections):
    n = c.name
    if not n.startswith("L_"):
        continue
    if (c.get("sprite_group") and n not in keep) or n.startswith("L_prop-") or n in ("L_belt-center", "L_belt-center-edge", "L_belt-sheen") or "tape" in n             or (CIVIL and n.startswith("L_belt")):
        drop.append(c)
for c in drop:
    for ob in list(c.objects):
        if all(u in drop for u in ob.users_collection):
            bpy.data.objects.remove(ob, do_unlink=True)
    bpy.data.collections.remove(c)


# ---- tints baked into copies of the materials (multiply, as the game's tint does)
def tinted(m, hexc):
    key = f"{m.name}__{hexc}"
    nm = bpy.data.materials.get(key)
    if nm:
        return nm
    nm = m.copy(); nm.name = key
    nt = nm.node_tree
    emit = next((n for n in nt.nodes if n.type == "EMISSION"), None)
    if emit and emit.inputs["Color"].links:
        src = emit.inputs["Color"].links[0].from_socket
        mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
        mul.inputs["Factor"].default_value = 1.0
        mul.inputs[7].default_value = (*lin(hexc), 1)
        nt.links.new(src, mul.inputs[6]); nt.links.new(mul.outputs[2], emit.inputs["Color"])
    elif emit:
        c0 = emit.inputs["Color"].default_value; t = lin(hexc)
        emit.inputs["Color"].default_value = (c0[0] * t[0], c0[1] * t[1], c0[2] * t[2], 1)
    return nm


LAYER_TINT = {"L_skin": P["skin"], "L_gi": P["gi"], "L_belt": P["belt"], "L_belt-rim": P["belt"]}
for ob in list(bpy.data.objects):
    if ob.type != "MESH":
        continue
    lay = next((c.name for c in ob.users_collection if c.name.startswith("L_")), "")
    for i, m in enumerate(ob.data.materials):
        if not m or m.name.startswith("OUTLINE") or not m.node_tree:
            continue
        hexc = None
        base_name = ob.name.split(".")[0]
        if CIVIL and m.name.startswith("SKIN") and base_name in ("foot", "ankle"):
            hexc = P["shoes"]
        elif CIVIL and m.name.startswith("GI") and base_name in ("gi_thigh", "gi_knee", "gi_shin"):
            hexc = P["pants"]
        elif m.name.startswith("SKIN"):
            hexc = P["skin"]
        elif m.name.startswith("HAIR"):
            hexc = P["hairc"]
        elif m.name.startswith("LAPEL"):
            hexc = P["lapel"]
        elif m.name.startswith("GI"):
            hexc = P["gi"]
        elif m.name.startswith("BELT"):
            hexc = P["belt"]
        elif m.name.startswith("F_IRIS"):
            hexc = P["iris"]
        else:
            hexc = LAYER_TINT.get(lay)
        if hexc:
            ob.data.materials[i] = tinted(m, hexc)


def flat_mat(name, hexc, strength=1.0):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*lin(hexc), 1); e.inputs["Strength"].default_value = strength
    o = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(e.outputs[0], o.inputs[0])
    return m


body_coll = bpy.data.collections.get("L_body") or bpy.data.collections.get("L_skin")
head_bone = rig.data.bones["head"]


def attach(ob, bone="head"):
    """Links a new piece into the character, parented to the head bone, keeping where it was modelled."""
    body_coll.objects.link(ob)
    bpy.context.view_layer.update()
    mw = ob.matrix_world.copy()
    ob.parent = rig; ob.parent_type = "BONE"; ob.parent_bone = bone
    bpy.context.view_layer.update()
    ob.matrix_world = mw


def mesh_from(name, verts, faces, mat):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    ob = bpy.data.objects.new(name, me); me.materials.append(mat)
    attach(ob)
    return ob


def slab(name, outline_xz, y_front, depth, mat, curve=0.0, cx=0.0):
    """A thin plate in the face's plane from a polygon in (x, z); bends back with distance from cx (head curvature)."""
    bm = bmesh.new()
    vf = [bm.verts.new((x, y_front + curve * (x - cx) ** 2, z)) for x, z in outline_xz]
    vb = [bm.verts.new((x, y_front + depth + curve * (x - cx) ** 2, z)) for x, z in outline_xz]
    bm.faces.new(vf)
    bm.faces.new(list(reversed(vb)))
    n = len(outline_xz)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((vf[i], vf[j], vb[j], vb[i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); me.materials.append(mat)
    attach(ob)
    return ob


def ring(name, cx, cz, w, h, t, y, mat, curve, r=0.025, segs=6):
    """A rounded-rectangle frame (one lens of the glasses)."""
    def rr(w2, h2, rad):
        pts = []
        for k, (sx, sz) in enumerate(((1, 1), (-1, 1), (-1, -1), (1, -1))):
            ccx, ccz = cx + sx * (w2 / 2 - rad), cz + sz * (h2 / 2 - rad)
            a0 = (k * 90) * math.pi / 180
            for s in range(segs + 1):
                ang = a0 + (s / segs) * math.pi / 2
                pts.append((ccx + rad * math.cos(ang), ccz + rad * math.sin(ang)))
        return pts
    outer = rr(w, h, r); inner = rr(w - 2 * t, h - 2 * t, max(0.004, r - t))
    bm = bmesh.new()
    d = 0.012
    def V(x, z, back):
        return bm.verts.new((x, y + back + curve * (x) ** 2, z))
    of = [V(x, z, 0) for x, z in outer]; inf = [V(x, z, 0) for x, z in inner]
    ob_ = [V(x, z, d) for x, z in outer]; ib = [V(x, z, d) for x, z in inner]
    n = len(outer)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((of[i], of[j], inf[j], inf[i]))
        bm.faces.new((ob_[j], ob_[i], ib[i], ib[j]))
        bm.faces.new((of[j], of[i], ob_[i], ob_[j]))
        bm.faces.new((inf[i], inf[j], ib[j], ib[i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); me.materials.append(mat)
    attach(ob)


def bar(name, p0, p1, thick, mat):
    """A thin box between two points (bridge and temple arms of the glasses)."""
    p0 = Vector(p0); p1 = Vector(p1)
    me = bpy.data.meshes.new(name)
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); me.materials.append(mat)
    d = p1 - p0
    ob.location = (p0 + p1) / 2
    ob.rotation_mode = "QUATERNION"; ob.rotation_quaternion = d.to_track_quat("X", "Z")
    ob.scale = (d.length, thick, thick)
    attach(ob)


# face geometry reference (rest pose, from the face objects)
def bounds(names):
    ws = []
    for n in names:
        o = bpy.data.objects.get(n)
        if o:
            ws += [o.matrix_world @ v.co for v in o.data.vertices]
    return [min(w[i] for w in ws) for i in range(3)], [max(w[i] for w in ws) for i in range(3)]


f = P["face"]
emin, emax = bounds([f"f{int(f)}_eye.L", f"f{int(f)}_eye.R"])
mmin, mmax = bounds([f"f{int(f)}_mouth"])
hmin, hmax = bounds(["head"])
front = hmin[1]
eye_cz = (emin[2] + emax[2]) / 2
eye_l = bounds([f"f{int(f)}_eye.L"]); eye_r = bounds([f"f{int(f)}_eye.R"])
mouth_cx = (mmin[0] + mmax[0]) / 2
CURVE = 2.2   # how fast the face falls away from the middle (1 / (2 * head radius))

if P.get("glasses"):
    black = flat_mat("GLASSES", "#16161b")
    for side, (lo, hi) in (("L", eye_l), ("R", eye_r)):
        cx = (lo[0] + hi[0]) / 2
        w = (hi[0] - lo[0]) + 0.05
        h = (hi[2] - lo[2]) * 0.80
        ring(f"glasses_{side}", cx, eye_cz - 0.005, w, h, 0.022, front - 0.03, black, CURVE, r=0.022)
    lx = (eye_l[0][0] + eye_l[1][0]) / 2 - ((eye_l[1][0] - eye_l[0][0]) + 0.05) / 2
    rx = (eye_r[0][0] + eye_r[1][0]) / 2 + ((eye_r[1][0] - eye_r[0][0]) + 0.05) / 2
    bar("glasses_bridge", (rx, front - 0.03, eye_cz + 0.03), (lx, front - 0.03, eye_cz + 0.03), 0.014, black)
    for side, x_edge in (("L", (eye_l[1][0] + 0.025)), ("R", (eye_r[0][0] - 0.025))):
        s = 1 if side == "L" else -1
        y_edge = front - 0.03 + CURVE * x_edge ** 2
        bar(f"glasses_arm_{side}", (x_edge, y_edge, eye_cz + 0.04), (s * (hmax[0] - 0.01), -0.12, eye_cz + 0.0), 0.014, black)

# ---- painted details on the head itself (beards, freckles): the head is cut finer, then faces in each region take a
# colour. Painting keeps them on the skin, in the outline, and turning with the head.
head_ob = bpy.data.objects["head"]
_bm = bmesh.new(); _bm.from_mesh(head_ob.data)
bmesh.ops.subdivide_edges(_bm, edges=_bm.edges[:], cuts=3, use_grid_fill=True, smooth=0.0)
_bm.to_mesh(head_ob.data); _bm.free()
head_skin = head_ob.data.materials[0]
HMW = head_ob.matrix_world
NMW = HMW.to_3x3().inverted().transposed()


def paint(name, hexc, inside):
    """Gives the head's front-facing faces where inside(x, z) is true the colour hexc (shaded like the skin)."""
    m = tinted(bpy.data.materials["SKIN_NEUTRAL"], hexc)
    m = m.copy(); m.name = f"PAINT_{name}"
    head_ob.data.materials.append(m)
    idx = len(head_ob.data.materials) - 1
    n = 0
    for poly in head_ob.data.polygons:
        c = HMW @ poly.center
        nrm = (NMW @ poly.normal).normalized()
        if nrm.y < -0.35 and inside(c.x - mouth_cx, c.z):
            poly.material_index = idx; n += 1
    print("PAINT", name, n)


mz_top = mmax[2]; mz_bot = mmin[2]
if P.get("mustache"):
    thick = 0.034 if P.get("smile") else 0.026
    half = 0.075 if P.get("smile") else 0.062
    def must(dx, z):
        if abs(dx) > half:
            return False
        droop = 0.020 * (abs(dx) / half) ** 2          # the ends come down toward the corners of the mouth
        return mz_top - 0.004 - droop < z < mz_top + thick - droop * 0.4
    paint("mustache", P["beard"], must)
if P.get("goatee"):
    def goat(dx, z):
        top = mz_bot - 0.006
        bot = hmin[2] + 0.012
        if not (bot < z < top):
            return False
        k = (top - z) / (top - bot)                    # 0 under the lip, 1 at the chin
        return abs(dx) < 0.026 + 0.030 * k
    paint("goatee", P["beard"], goat)
if P.get("freckles"):
    import random
    rnd = random.Random(7)
    spots = [(side * (0.085 + rnd.uniform(-0.03, 0.03)), emin[2] - 0.012 + rnd.uniform(-0.02, 0.012)) for side in (1, -1) for _ in range(5)]
    paint("freckles", "#c07a5e", lambda dx, z: any((dx - sx) ** 2 + (z - sz) ** 2 < 0.0085 ** 2 for sx, sz in spots))

if P.get("quiff"):
    # Jay's hair is swept up at the front: lift the front of the hair (and its outline) off the forehead
    for o in [o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith(f"h{int(P['hair'])}_")]:
        mw = o.matrix_world; inv = mw.inverted()
        for v in o.data.vertices:
            w = mw @ v.co
            k = max(0.0, min(1.0, (-0.20 - w.y) / 0.16))
            if k > 0 and w.z > eye_cz + 0.06:
                w.z += 0.055 * k
                w.y += 0.030 * k
                v.co = inv @ w

# ---- a real smile (Jay and Michael smile wide in the photos): the face's small mouth is swapped for an open grin
if P.get("grin"):
    for o in [o for o in bpy.data.objects if o.name.startswith(f"f{int(f)}_mouth")]:
        bpy.data.objects.remove(o, do_unlink=True)
    gw = P["grin"]; gh = gw * 0.48
    mcz = (mmin[2] + mmax[2]) / 2 + 0.004
    dark = flat_mat("GRIN", "#6e2430"); teeth = flat_mat("TEETH", "#fbf6ee")
    top = [(mouth_cx - gw / 2 + gw * k / 10, mcz + 0.006 * math.sin(math.pi * k / 10) * 0) for k in range(11)]
    bot = [(mouth_cx + gw / 2 - gw * k / 10, mcz - gh * math.sin(math.pi * (k / 10)) ** 0.8) for k in range(11)]
    slab("grin", top + bot, front - 0.010, 0.006, dark, CURVE, 0.0)
    tb = [(mouth_cx + gw * 0.40 - gw * 0.80 * k / 10, mcz - gh * 0.30 * math.sin(math.pi * k / 10) ** 0.6 - 0.002) for k in range(11)]
    tt = [(mouth_cx - gw * 0.40 + gw * 0.80 * k / 10, mcz - 0.001) for k in range(11)]
    slab("grin_teeth", tt + tb, front - 0.014, 0.004, teeth, CURVE, 0.0)

# ---- long hair over the shoulders (Hannah): two soft locks in front, dark brown fading to purple at the ends
if P.get("long"):
    hair_m = next(m for m in bpy.data.materials if m.name.startswith("HAIR_NEUTRAL__"))
    purple = hair_m.copy(); purple.name = "HAIR_TIPS"
    for n in purple.node_tree.nodes:
        if n.type == "MIX" and n.blend_type == "MULTIPLY":
            n.inputs[7].default_value = (*lin(P["tips"]), 1)
    midm = hair_m.copy(); midm.name = "HAIR_TIPSMID"
    for n in midm.node_tree.nodes:
        if n.type == "MIX" and n.blend_type == "MULTIPLY":
            n.inputs[7].default_value = (*lin("#5b3c7c"), 1)
    outline_m = bpy.data.materials["OUTLINE"]
    for side in (1, -1):
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=12, radius=1.0)
        ztop, zbot = 1.06, 0.62
        for v in bm.verts:
            t = (v.co.z + 1) / 2                     # 0 bottom, 1 top
            z = zbot + (ztop - zbot) * t
            w = 0.034 + 0.016 * math.sin(math.pi * min(1.0, t * 1.2))
            d = 0.030
            x = side * (0.215 - 0.045 * (1 - t)) + v.co.x * w
            y = -0.20 - 0.03 * (1 - t) + v.co.y * d
            v.co = Vector((x, y, z))
        me = bpy.data.meshes.new(f"lock_{side}"); bm.to_mesh(me); bm.free()
        me.materials.append(hair_m); me.materials.append(midm); me.materials.append(purple)
        for poly in me.polygons:
            z = poly.center.z
            poly.material_index = 2 if z < 0.75 else (1 if z < 0.81 else 0)
        for poly in me.polygons:
            poly.use_smooth = True
        ob = bpy.data.objects.new(f"lock_{side}", me)
        attach(ob, "chest")
        # its outline: the same shape pushed out a little, faces turned inside out (like the other outlines)
        bm = bmesh.new(); bm.from_mesh(me)
        bm.normal_update()
        for v in bm.verts:
            v.co += v.normal * 0.012
        bmesh.ops.reverse_faces(bm, faces=bm.faces[:])
        ome = bpy.data.meshes.new(f"lock_{side}_outline"); bm.to_mesh(ome); bm.free()
        ome.materials.clear(); ome.materials.append(outline_m)
        oo = bpy.data.objects.new(f"lock_{side}_outline", ome)
        attach(oo, "chest")

if P.get("tips"):
    # purple ends on the lower part of the hair (ombre in a few bands)
    hair_obs = [o for o in bpy.data.objects if o.type == "MESH" and any(c.name == f"L_hair-{P['hair']}" for c in o.users_collection)]
    zs = [(o.matrix_world @ v.co).z for o in hair_obs for v in o.data.vertices]
    zlo = min(zs)
    cut = hmin[2] + 0.02            # from about chin level down
    for o in hair_obs:
        mats = list(o.data.materials)
        base = next((m for m in mats if m and not m.name.startswith("OUTLINE")), None)
        if base is None:
            continue
        purple = base.copy(); purple.name = base.name.split("__")[0] + "__tips"
        nt = purple.node_tree
        for n in nt.nodes:
            if n.type == "MIX" and n.blend_type == "MULTIPLY":
                n.inputs[7].default_value = (*lin(P["tips"]), 1)
        mid = base.copy(); mid.name = base.name.split("__")[0] + "__tipsmid"
        for n in mid.node_tree.nodes:
            if n.type == "MIX" and n.blend_type == "MULTIPLY":
                n.inputs[7].default_value = (*lin("#5a3a7a"), 1)
        o.data.materials.append(mid); o.data.materials.append(purple)
        imid = len(o.data.materials) - 2; ipur = len(o.data.materials) - 1
        mw = o.matrix_world
        for poly in o.data.polygons:
            if o.data.materials[poly.material_index].name.startswith("OUTLINE"):
                continue
            z = (mw @ poly.center).z
            if z < cut - 0.07:
                poly.material_index = ipur
            elif z < cut:
                poly.material_index = imid

# ---- Michael (Jay, Nov 23): "a bit more muscley, but don't overdo it": fuller chest, shoulders and arms
if P.get("buff"):
    BUFF = {"gi_torso": (1.10, 1.0, 1.0), "gi_shoulder": (1.16, 1.16, 1.12), "gi_upper_arm": (1.14, 1.14, 1.0), "gi_elbow": (1.1, 1.1, 1.0),
            "gi_sleeve": (1.1, 1.1, 1.0), "forearm": (1.12, 1.12, 1.0), "fist": (1.06, 1.06, 1.06), "neck": (1.12, 1.12, 1.0)}
    for ob in [o for o in bpy.data.objects if o.type == "MESH" and not o.name.endswith("_outline")]:
        key = ob.name.split(".")[0]
        if key not in BUFF:
            continue
        sx, sy, sz = BUFF[key]
        pts = [ob.matrix_world @ v.co for v in ob.data.vertices]
        c = sum(pts, Vector()) / len(pts)
        for o2 in (ob, bpy.data.objects.get(ob.name + "_outline")):
            if not o2:
                continue
            mw = o2.matrix_world; inv = mw.inverted()
            for v in o2.data.vertices:
                w = mw @ v.co
                v.co = inv @ Vector((c.x + (w.x - c.x) * sx, c.y + (w.y - c.y) * sy, c.z + (w.z - c.z) * sz))

# ---- everyday clothes: no lapels (a plain shirt); the store staff's vest and name tag
if CIVIL:
    for o in [o for o in bpy.data.objects if o.name.startswith("gi_lapel")]:
        bpy.data.objects.remove(o, do_unlink=True)
if P.get("vest"):
    vest_m = flat_mat("VEST_EDGE", P["vest"])
    gi_src = next(m for m in bpy.data.materials if m.name.startswith("GI__"))
    vest_body = tinted(bpy.data.materials[gi_src.name.split("__")[0]], P["vest"])
    for part in ("gi_torso", "gi_skirt"):
        src = bpy.data.objects[part]
        # the outline shell's faces are turned inside out, so it grows along -normal
        for name, push in ((part, 0.014), (part + "_outline", -0.014)):
            o = bpy.data.objects.get(name)
            if not o:
                continue
            v = o.copy(); v.data = o.data.copy(); v.name = name.replace(part, "vest_" + part)
            for c in o.users_collection:
                c.objects.link(v)
            for vert in v.data.vertices:
                vert.co += vert.normal * push
            if not name.endswith("_outline"):
                v.data.materials.clear(); v.data.materials.append(vest_body)
    tor = bpy.data.objects["gi_torso"]
    pts = [tor.matrix_world @ vv.co for vv in tor.data.vertices]
    ymin = min(p.y for p in pts); zlo = min(p.z for p in pts); zhi = max(p.z for p in pts)
    xs = [p.x for p in pts]; cx = (min(xs) + max(xs)) / 2; half = (max(xs) - min(xs)) / 2
    tag_m = flat_mat("NAME_TAG", "#ffffff"); stripe_m = flat_mat("NAME_TAG_STRIPE", "#e8574a")
    tz = zlo + (zhi - zlo) * 0.66; tx = cx + half * 0.38
    for name, (w, h, dy), m_ in (("name_tag", (0.11, 0.075, 0.0), tag_m), ("name_tag_stripe", (0.11, 0.022, -0.004), stripe_m)):
        me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free()
        ob = bpy.data.objects.new(name, me); me.materials.append(m_)
        zc = tz if name == "name_tag" else tz + 0.075 / 2 - 0.011
        ob.location = (tx, ymin - 0.03 + dy, zc); ob.scale = (w, 0.012, h)
        attach(ob, "chest")

# ---- one flattened layer: every L_ collection merged into L_staff
staff = bpy.data.collections.new("L_staff"); sc.collection.children.link(staff)
staff["sprite_order"] = 0; staff["sprite_tint"] = False
for c in [c for c in bpy.data.collections if c.name.startswith("L_") and c.name != "L_staff"]:
    for ob in list(c.objects):
        if staff not in ob.users_collection:
            staff.objects.link(ob)
        c.objects.unlink(ob)
    bpy.data.collections.remove(c)

# ---- grown-up proportions: taller body, the head scaled back so it stays about the hero's size
root.scale = (1.22, 1.22, 1.22)
rig.pose.bones["head"].scale = (0.84, 0.84, 0.84)

# ---- actions: npc_idle (relaxed, breathing) and npc_wave, from the bow's upright frame
bow = bpy.data.actions["bow"]
rig.animation_data.action = bow
sc.frame_set(6)
BASE = {}
for pb in rig.pose.bones:
    BASE[pb.name] = (pb.location.copy(), pb.rotation_euler.copy())
KEYED = ("hips", "chest", "head", "hand_ik.L", "hand_ik.R", "foot_ik.L", "foot_ik.R")


def make_action(name, frames, fps, pose_at):
    act = bpy.data.actions.new(name)
    rig.animation_data.action = act
    for fr in range(1, frames + 1):
        t = (fr - 1) / frames
        for bn in KEYED:
            pb = rig.pose.bones[bn]
            loc, rot = BASE[bn]
            dl, dr = pose_at(bn, t)
            pb.location = loc + Vector(dl)
            pb.rotation_euler = (rot[0] + dr[0], rot[1] + dr[1], rot[2] + dr[2])
            pb.keyframe_insert("location", frame=fr)
            pb.keyframe_insert("rotation_euler", frame=fr)
    act.use_frame_range = True; act.frame_start = 1; act.frame_end = frames
    act["sprite_fps"] = fps; act["sprite_loop"] = True; act.use_fake_user = True
    return act


def idle_pose(bn, t):
    s = math.sin(2 * math.pi * t)
    if bn == "chest":
        return (0, 0, 0), (0.025 * s, 0, 0)
    if bn == "hips":
        return (0, 0.004 * s, 0), (0, 0, 0)
    if bn == "head":
        return (0, 0, 0), (-0.02 * s, 0, 0.0)
    return (0, 0, 0), (0, 0, 0)


def wave_pose(bn, t):
    s = math.sin(2 * math.pi * t)
    if bn == "hand_ik.R":
        # up beside the head, swinging side to side
        return (-0.12 + 0.07 * s, 0.56, 0.10), (0, 0, 0)
    if bn == "chest":
        return (0, 0, 0), (0, 0.05, 0.04 * s)
    if bn == "head":
        return (0, 0, 0), (0, -0.06, 0.05)
    return idle_pose(bn, t)


make_action("npc_idle", 12, 6, idle_pose)
make_action("npc_wave", 8, 10, wave_pose)
if CIVIL:
    # an easy walk (the hero's old walk, before it became a run), for walking round the store
    wk = bpy.data.actions["walk_before_claude_run"]
    wk.name = "npc_walk"; wk["sprite_fps"] = 12; wk["sprite_loop"] = True; wk.use_fake_user = True
bow["sprite_loop"] = False; bow.use_fake_user = True
for act in list(bpy.data.actions):
    if act.name not in ("npc_idle", "npc_wave", "bow", "npc_walk"):
        if "sprite_fps" in act:
            del act["sprite_fps"]
rig.animation_data.action = bpy.data.actions["npc_idle"]
sc["sprite_meta"] = json.dumps({"staff": a.who, "note": "Action Zone staff NPC (Claude, Nov 23). One flattened layer, no tints."})
bpy.ops.wm.save_as_mainfile(filepath=a.save)
print("STAFF_SAVED", a.who)
