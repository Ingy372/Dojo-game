"""Quick look-check stills of the hero (not the game render): one combined picture per frame with chosen face, hair
and colours standing in for the game's tints. Runs inside Blender:

    blender -b <hero>.blend -P hero_stills.py -- --out <dir> --anims idle --frames 1 --dirs S,SE --scale 3 \
        [--face 01 --hair 02 --skin #e0ac80 --hairc #3a2a20 --gi #f4f4f4 --belt #f2c230 --tag x]
"""
import bpy, sys, math, os, argparse
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True); ap.add_argument("--anims", default="idle")
ap.add_argument("--frames", default="1"); ap.add_argument("--dirs", default="S,SE")
ap.add_argument("--scale", type=int, default=3); ap.add_argument("--tag", default="")
ap.add_argument("--face", default="01"); ap.add_argument("--hair", default="02")
ap.add_argument("--skin", default="#e8b896"); ap.add_argument("--hairc", default="#3b2a22")
ap.add_argument("--gi", default="#f4f4f4"); ap.add_argument("--belt", default="#f2c230")
ap.add_argument("--extra", default="")   # extra collections to show, comma list (outfits, headgear ...)
ap.add_argument("--samples", type=int, default=16)
a = ap.parse_args(argv)
os.makedirs(a.out, exist_ok=True)
DIRS = {"N": 180, "NE": 135, "E": 90, "SE": 45, "S": 0, "SW": -45, "W": -90, "NW": -135}

def lin(h):
    h = h.lstrip("#"); o = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        o.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return o

sc = bpy.context.scene
extra = set(x for x in a.extra.split(",") if x)
for c in bpy.data.collections:
    n = c.name
    if not n.startswith("L_"):
        continue
    grp = c.get("sprite_group")
    if grp:
        c.hide_render = n not in (f"L_face-{a.face}", f"L_hair-{a.hair}") and n[2:] not in extra
    elif n.startswith("L_prop-") or n in ("L_belt-center", "L_belt-center-edge", "L_belt-sheen") or "tape" in n:
        c.hide_render = True
    elif c.get("sprite_optional") and n[2:] not in extra:
        c.hide_render = True

# stand-in tints: multiply the tinted layers' materials by the chosen colours (the game does this with a tint)
TINT = {"L_skin": a.skin, "L_gi": a.gi, "L_belt": a.belt}
def tint_material(m, hexc):
    nt = m.node_tree
    if not nt or m.get("_tinted"):
        return
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    src = out.inputs["Surface"].links[0].from_socket
    mix = nt.nodes.new("ShaderNodeMixShader")
    emit = nt.nodes.new("ShaderNodeEmission")
    # cheap: multiply via a separate emission is hard with shaders; use a Light Path trick instead:
    # wrap the existing emission colour input
    m["_tinted"] = True
for ob in bpy.data.objects:
    if ob.type != "MESH":
        continue
    lay = next((c.name for c in ob.users_collection if c.name.startswith("L_")), "")
    hexc = TINT.get(lay) or (a.hairc if lay.startswith("L_hair-") else None)
    if not hexc:
        continue
    for i, m in enumerate(ob.data.materials):
        if not m or m.name.startswith("OUTLINE") or not m.node_tree:
            continue
        key = f"{m.name}__{hexc}"
        nm = bpy.data.materials.get(key)
        if nm is None:
            nm = m.copy(); nm.name = key
            nt = nm.node_tree
            emit = next((n for n in nt.nodes if n.type == "EMISSION"), None)
            if emit and emit.inputs["Color"].links:
                srcs = emit.inputs["Color"].links[0].from_socket
                mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
                mul.inputs["Factor"].default_value = 1.0
                mul.inputs[7].default_value = (*lin(hexc), 1)
                nt.links.new(srcs, mul.inputs[6]); nt.links.new(mul.outputs[2], emit.inputs["Color"])
            elif emit:
                c0 = emit.inputs["Color"].default_value; t = lin(hexc)
                emit.inputs["Color"].default_value = (c0[0] * t[0], c0[1] * t[1], c0[2] * t[2], 1)
        ob.data.materials[i] = nm

r = sc.render
r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = a.samples; sc.cycles.use_denoising = False
sc.cycles.max_bounces = 0; sc.cycles.transparent_max_bounces = 16; r.film_transparent = True
r.resolution_x = 128 * a.scale; r.resolution_y = 160 * a.scale; r.resolution_percentage = 100
r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
for ob in sc.objects:
    if ob.type == "LIGHT":
        ob.hide_render = True
cd = bpy.data.cameras.new("Q"); cd.type = "ORTHO"; cd.ortho_scale = 1.6; cd.sensor_fit = "HORIZONTAL"
cam = bpy.data.objects.new("Q", cd); sc.collection.objects.link(cam)
rx = math.radians(55); cam.rotation_euler = Euler((rx, 0, 0))
fwd = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 0, -1)); up = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 1, 0))
zt = (0.856 - 0.5) * 1.6 * (160 / 128) / up.z
cam.location = Vector((0, 0, zt)) - fwd * 20; sc.camera = cam
root = bpy.data.objects["CHAR_ROOT"]; rig = bpy.data.objects["MartialArtistRig"]
for name in a.anims.split(","):
    act = bpy.data.actions[name]; rig.animation_data.action = act
    n = int(act.frame_range[1])
    frames = range(1, n + 1) if a.frames == "all" else [int(x) for x in a.frames.split(",") if int(x) <= n]
    for d in a.dirs.split(","):
        root.rotation_euler = (0, 0, math.radians(DIRS[d]))
        for f in frames:
            sc.frame_set(f)
            r.filepath = os.path.join(a.out, f"{a.tag}{name}__{d}__{f:02d}.png")
            bpy.ops.render.render(write_still=True)
print("DONE")
