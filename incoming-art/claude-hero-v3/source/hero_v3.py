"""Hero v3 SAMPLE (Claude, Nov 27; Jay: the hero looks pixelated next to the Brute, wants a smoother look, more detail on
the uniform and a run with more life). Runs on a copy of the v2 hero and keeps the rig, layers and camera:

  * a livelier run ('walk' action): more forward lean, a bigger up-and-down bounce, arms pumping further, a stronger
    shoulder twist, and the head bobbing a beat behind the body;
  * belt tails that flap with each step and sway against the hips (drivers, so every animation gets them);
  * uniform detail: darker cuffs at the sleeve ends and the trouser hems (in the gi layer, so the gi tint still works);
  * smoother shapes: a subdivision pass on the gi and skin parts (and their outlines).

Approved Nov 27 (Jay: "Yes, use it", after round 2: upright jog, calmer arms). The defaults are the approved values.
The game renders it at 1.5x (--size 192 --height 240), which matches the Brute's sharpness on screen.

    blender -b hero3_base_a.blend -P hero_v3.py -- --save hero3_sample_a.blend
"""
import bpy, bmesh, sys, math, argparse
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--save", required=True)
ap.add_argument("--bob", type=float, default=2.0)
ap.add_argument("--lean", type=float, default=-0.2)
ap.add_argument("--arms", type=float, default=0.85)
ap.add_argument("--twist", type=float, default=1.2)
ap.add_argument("--subsurf", type=int, default=0)
ap.add_argument("--hand-out", type=float, default=0.05)
ap.add_argument("--head-bob", type=float, default=0.05)
ap.add_argument("--head-keep", type=float, default=1.0)
a = ap.parse_args(argv)

rig = bpy.data.objects["MartialArtistRig"]
if bpy.context.scene.get("hero_v3"):
    raise SystemExit("hero_v3 already applied to this file")
bpy.context.scene["hero_v3"] = 1


# ---------------------------------------------------------------- the run
def curves_of(act):
    if hasattr(act, "fcurves") and len(getattr(act, "fcurves", [])):
        return list(act.fcurves)
    out = []
    for layer in act.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                out.extend(cb.fcurves)
    return out


def fc(curves, path, idx):
    for c in curves:
        if c.data_path == path and c.array_index == idx:
            return c
    return None


def remap(c, f):
    """Sets every key of curve c to f(frame, value)."""
    for k in c.keyframe_points:
        v = f(k.co[0], k.co[1])
        dv = v - k.co[1]
        k.co[1] = v
        k.handle_left[1] += dv
        k.handle_right[1] += dv
    c.update()


def amplify(c, s):
    vals = [k.co[1] for k in c.keyframe_points]
    m = sum(vals) / len(vals)
    remap(c, lambda fr, v: m + (v - m) * s)


walk = bpy.data.actions.get("walk")
if walk:
  cv = curves_of(walk)
  n = int(walk.frame_range[1] - walk.frame_range[0] + 1)
  B = 'pose.bones["%s"].%s'
  amplify(fc(cv, B % ("hips", "location"), 1), a.bob)                      # bounce
  remap(fc(cv, B % ("hips", "rotation_euler"), 0), lambda fr, v: v + a.lean)  # lean into the run
  amplify(fc(cv, B % ("chest", "rotation_euler"), 1), a.twist)            # shoulder twist
  remap(fc(cv, B % ("head", "rotation_euler"), 0),                        # keep the face up, bob a beat late
        lambda fr, v: v - a.lean * a.head_keep + a.head_bob * math.sin(2 * math.pi * 2 * (fr - 2) / n))
  for side in ("L", "R"):
      for i in (1, 2):
          amplify(fc(cv, B % ("hand_ik." + side, "location"), i), a.arms)  # arms pump further
      # hands out to the sides (not crossed over the chest), so the pumping arms read
      remap(fc(cv, B % ("hand_ik." + side, "location"), 0), lambda fr, v: v + (a.hand_out if v > 0 else -a.hand_out))

# ---------------------------------------------------------------- belt tails
def set_pivot(o, p):
    o.data.transform(Matrix.Translation(-p))
    o.matrix_basis = o.matrix_basis @ Matrix.Translation(p)


def drive(o, idx, expr, bone, ttype):
    d = o.driver_add("rotation_euler", idx).driver
    d.type = "SCRIPTED"
    for v in list(d.variables):
        d.variables.remove(v)
    var = d.variables.new()
    var.name = "v"
    var.type = "TRANSFORMS"
    t = var.targets[0]
    t.id = rig
    t.bone_target = bone
    t.transform_type = ttype
    t.transform_space = "LOCAL_SPACE"
    d.expression = expr


tails = [o for o in bpy.data.objects if o.type == "MESH" and ("belt_tail" in o.name or "beltc_tail" in o.name)]
groups = {}
for o in tails:
    key = o.name.replace("_outline", "").replace("beltc_", "belt_")
    groups.setdefault(key, []).append(o)
for key, objs in groups.items():
    base = next(o for o in objs if o.name == key) if any(o.name == key for o in objs) else objs[0]
    top = max(v.co.z for v in base.data.vertices)
    tv = [v.co for v in base.data.vertices if v.co.z > top - 0.02]
    p = sum(tv, Vector()) / len(tv)
    k = 1.0 if key.endswith("0") else 1.3  # the two tails out of step
    for o in objs:
        set_pivot(o, p)
        # flap: out and up as the body drops, back as it rises (hips Y bob ~ -0.02..-0.12 in the new run)
        drive(o, 0, "-%.2f*min(max((v+0.045)*6,-0.18),0.18)" % k, "hips", "LOC_Y")  # clamped: crouched moves (wipe, kata stances) stay calm
        # sway against the hip turn
        drive(o, 1, "-%.2f*min(max(v*0.8,-0.2),0.2)" % k, "hips", "ROT_Y")

# ---------------------------------------------------------------- cuffs and hems
def darken(mat, k):
    """Multiplies a toon material's final colour by k (keeps it in the tinted gi layer)."""
    nt = mat.node_tree
    em = next(nd for nd in nt.nodes if nd.type == "EMISSION")
    link = em.inputs["Color"].links[0] if em.inputs["Color"].links else None
    if not link:
        return
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    mul.inputs[7].default_value = (k, k, k * 1.03, 1)
    nt.links.new(link.from_socket, mul.inputs[6])
    nt.links.new(mul.outputs[2], em.inputs["Color"])


cuff_mat = bpy.data.materials["GI"].copy()
cuff_mat.name = "GI_CUFF"
darken(cuff_mat, 0.76)
# the crossed collar reads as a clear "V" on the chest
if "LAPEL" in bpy.data.materials:
    darken(bpy.data.materials["LAPEL"], 0.8)
outline_mat = bpy.data.materials.get("OUTLINE")


def boundary_loops(me):
    bm = bmesh.new()
    bm.from_mesh(me)
    edges = [e for e in bm.edges if e.is_boundary]
    loops, seen = [], set()
    for e in edges:
        if e.index in seen:
            continue
        loop, stack = set(), [e]
        while stack:
            x = stack.pop()
            if x.index in seen:
                continue
            seen.add(x.index)
            for v in x.verts:
                loop.add(v.index)
                for y in v.link_edges:
                    if y.is_boundary and y.index not in seen:
                        stack.append(y)
        loops.append(sorted(loop))
    cos = [v.co.copy() for v in bm.verts]
    bm.free()
    return [[cos[i] for i in l] for l in loops]


def ring(o, near, width=0.03, grow=1.07):
    """A band around the open end of tube o nearest to point `near` (rest coordinates)."""
    loops = boundary_loops(o.data)
    if not loops:
        return
    loop = min(loops, key=lambda L: ((sum(L, Vector()) / len(L)) - near).length)
    other = max(loops, key=lambda L: ((sum(L, Vector()) / len(L)) - near).length) if len(loops) > 1 else None
    c = sum(loop, Vector()) / len(loop)
    axis = ((sum(other, Vector()) / len(other)) - c).normalized() if other else Vector((0, 0, 1))
    # order the loop around its centre
    u = (loop[0] - c).normalized()
    w = axis.cross(u)
    loop = sorted(loop, key=lambda q: math.atan2((q - c).dot(w), (q - c).dot(u)))
    for name, g, mat in (("", grow, cuff_mat), ("_outline", grow + 0.08, outline_mat)):
        bm = bmesh.new()
        a0 = [bm.verts.new(c + (q - c) * g - axis * 0.004) for q in loop]
        a1 = [bm.verts.new(c + (q - c) * g + axis * width) for q in loop]
        for i in range(len(loop)):
            j = (i + 1) % len(loop)
            f = bm.faces.new((a0[i], a0[j], a1[j], a1[i]))
            f.smooth = True
        me = bpy.data.meshes.new(o.name + "_cuff" + name)
        bm.to_mesh(me)
        bm.free()
        if name == "_outline":
            me.flip_normals()
        ob = bpy.data.objects.new(o.name + "_cuff" + name, me)
        me.materials.append(mat)
        for coll in (o.users_collection if name == "" else bpy.data.objects[o.name + "_outline"].users_collection):
            coll.objects.link(ob)
        ob.parent = o.parent
        ob.parent_type = o.parent_type
        ob.parent_bone = o.parent_bone
        ob.matrix_parent_inverse = o.matrix_parent_inverse.copy()
        ob.matrix_basis = o.matrix_basis.copy()


rig.data.pose_position = "REST"
bpy.context.view_layer.update()
cent = lambda nm: sum((v.co for v in bpy.data.objects[nm].data.vertices), Vector()) / len(bpy.data.objects[nm].data.vertices)
for s in ("L", "R"):
    ring(bpy.data.objects["gi_sleeve." + s], cent("fist." + s), width=0.045, grow=1.1)
    ring(bpy.data.objects["gi_shin." + s], cent("foot." + s), width=0.028)
rig.data.pose_position = "POSE"

# ---------------------------------------------------------------- smoother shapes
if a.subsurf:
    smooth_colls = [bpy.data.collections[n] for n in ("L_gi", "L_skin")]
    names = {o.name for c in smooth_colls for o in c.objects}
    for o in bpy.data.objects:
        if o.type != "MESH" or "_cuff" in o.name:
            continue
        if o.name in names or o.name.replace("_outline", "") in names:
            if not any(m.type == "SUBSURF" for m in o.modifiers):
                m = o.modifiers.new("smooth", "SUBSURF")
                m.levels = a.subsurf
                m.render_levels = a.subsurf
                m.quality = 1

bpy.ops.wm.save_as_mainfile(filepath=a.save)
print("HERO_V3_SAVED", a.save)
