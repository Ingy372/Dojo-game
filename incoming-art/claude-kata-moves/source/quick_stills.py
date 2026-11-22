"""Fast pose check (not the game render): renders chosen frames of chosen actions as single combined pictures
(face-01, hair-02, everything else visible) from the house camera, at 2x, into a folder. Then
`make_sheet.py` lays them out. Runs inside Blender:

    blender -b player_kata_a.blend -P quick_stills.py -- --out <dir> --anims a,b --frames 1,4,7 --dirs S,SE,E,N
    (--frames all = every frame)
"""
import bpy, sys, math, os, argparse
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--out", required=True); ap.add_argument("--anims", required=True)
ap.add_argument("--frames", default="all"); ap.add_argument("--dirs", default="S,SE,E,N")
ap.add_argument("--scale", type=int, default=2)
a = ap.parse_args(argv)
os.makedirs(a.out, exist_ok=True)
DIRS = {"N": 180, "NE": 135, "E": 90, "SE": 45, "S": 0, "SW": -45, "W": -90, "NW": -135}

sc = bpy.context.scene
for c in bpy.data.collections:
    if c.name.startswith("L_face-") or c.name.startswith("L_hair-") or c.name.startswith("L_prop-") or c.name in ("L_belt-center", "L_belt-center-edge", "L_belt-sheen") or "tape" in c.name:
        keep = c.name in ("L_face-01", "L_hair-02")
        c.hide_render = not keep
r = sc.render
r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 8; sc.cycles.use_denoising = False
sc.cycles.max_bounces = 0; r.film_transparent = True
r.resolution_x = 128 * a.scale; r.resolution_y = 160 * a.scale; r.resolution_percentage = 100
r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "Standard"
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
    if a.frames == "all":
        frames = range(1, n + 1)
    elif a.frames == "last":
        frames = [n]
    else:
        frames = [int(x) for x in a.frames.split(",") if int(x) <= n]
    for d in a.dirs.split(","):
        root.rotation_euler = (0, 0, math.radians(DIRS[d]))
        for f in frames:
            sc.frame_set(f)
            r.filepath = os.path.join(a.out, f"{name}__{d}__{f:02d}.png")
            bpy.ops.render.render(write_still=True)
print("DONE")
