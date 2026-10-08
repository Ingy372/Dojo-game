"""
Dojo Ascent - reusable sprite renderer (Art Director bot).

Renders every animation of a character .blend from THE standard camera
(orthographic, top-down three-quarter view) in 8 directions, one transparent PNG
sprite sheet per layer per animation, plus a JSON file describing the sheets.

    blender -b <character>.blend -P incoming-art/tools/render_sprites.py -- \
        --out <folder> --name <character> [options]

Options (defaults are the house standard - keep them the same for everything):
    --size 128            frame width/height in pixels
    --ortho 1.6           world units (= game tiles) across one frame
    --elevation 35        camera looks down this many degrees from horizontal
    --anchor-y 0.82       where the feet (CHAR_ROOT origin) land, 0 = top, 1 = bottom
    --anims a,b,c         default: every action that has a "sprite_fps" property
    --layers a,b,c        default: every collection named L_<layer>
    --directions N,NE,... default: N,NE,E,SE,S,SW,W,NW (rows of each sheet, top to bottom)
    --samples 24          render samples (anti-aliasing)
    --root CHAR_ROOT      the object turned for the directions (character faces -Y at 0)
    --keep-frames         also keep the single frame PNGs in <out>/frames/

What the .blend must contain (see README.md next to this script):
  * CHAR_ROOT: empty at the feet, parent of the rig. Character faces -Y when unrotated.
  * Collections L_<layer>. Optional custom props: sprite_order (int), sprite_tint (bool),
    sprite_overlay (bool: an optional extra drawn on top, e.g. belt stripes).
  * Actions with custom props sprite_fps (int), sprite_loop (bool), sprite_tags (str), sprite_order (int),
    and for locomotion sprite_stride_tiles + sprite_design_speed (ground covered per loop, and the speed
    the fps is synced to). Each integer frame in the action's frame range is one sprite frame.
  * Optional: scene["sprite_meta"], a JSON string merged into the output JSON (e.g. tint guidance).

How layers work: when a layer is rendered, every other layer is still there but acts
as a "holdout" (it hides what is behind it and leaves a transparent hole), so stacking
the layer sheets in sprite_order rebuilds the full character with correct overlaps.
Overlay layers are switched off while base layers render, so base layers never have
holes where an optional overlay would be.
"""
import bpy, sys, os, json, math, argparse, shutil, time
import numpy as np
from mathutils import Vector, Euler
from bpy_extras.object_utils import world_to_camera_view

ALL_DIRS = {  # name: (CHAR_ROOT z-rotation in degrees, facing vector on screen x right / y down)
    "N": (180, (0, -1)), "NE": (135, (0.7071, -0.7071)), "E": (90, (1, 0)), "SE": (45, (0.7071, 0.7071)),
    "S": (0, (0, 1)), "SW": (-45, (-0.7071, 0.7071)), "W": (-90, (-1, 0)), "NW": (-135, (-0.7071, -0.7071)),
}

def parse():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser(prog="render_sprites.py")
    ap.add_argument("--out", required=True)
    ap.add_argument("--name", default=None)
    ap.add_argument("--size", type=int, default=128)
    ap.add_argument("--ortho", type=float, default=1.6)
    ap.add_argument("--elevation", type=float, default=35.0)
    ap.add_argument("--anchor-y", type=float, default=0.82)
    ap.add_argument("--anims", default="")
    ap.add_argument("--layers", default="")
    ap.add_argument("--directions", default="N,NE,E,SE,S,SW,W,NW")
    ap.add_argument("--samples", type=int, default=24)
    ap.add_argument("--root", default="CHAR_ROOT")
    ap.add_argument("--keep-frames", action="store_true")
    return ap.parse_args(argv)

def setup_render(scene, a):
    r = scene.render
    r.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = a.samples
    scene.cycles.use_denoising = False
    scene.cycles.use_adaptive_sampling = False
    scene.cycles.max_bounces = 0
    scene.cycles.transparent_max_bounces = 16
    scene.cycles.pixel_filter_type = "BLACKMAN_HARRIS"
    scene.cycles.filter_width = 1.2
    r.film_transparent = True
    r.resolution_x = r.resolution_y = a.size
    r.resolution_percentage = 100
    r.pixel_aspect_x = r.pixel_aspect_y = 1
    r.use_border = False
    r.image_settings.file_format = "PNG"
    r.image_settings.color_mode = "RGBA"
    r.image_settings.color_depth = "8"
    r.image_settings.compression = 90
    scene.view_settings.view_transform = "Standard"   # exact colours, no filmic tone curve
    scene.view_settings.look = "None"
    scene.view_settings.exposure = 0
    scene.view_settings.gamma = 1
    scene.display_settings.display_device = "sRGB"
    scene.world = scene.world or bpy.data.worlds.new("World")
    scene.world.use_nodes = False
    scene.world.color = (0, 0, 0)

def setup_camera(scene, a):
    """The ONE house camera, rebuilt identically every time."""
    old = bpy.data.objects.get("SPRITE_CAM")
    if old:
        bpy.data.objects.remove(old, do_unlink=True)
    for ob in list(scene.objects):
        if ob.type == "LIGHT":
            ob.hide_render = True   # all shading is in the toon materials
    cd = bpy.data.cameras.new("SPRITE_CAM")
    cd.type = "ORTHO"
    cd.ortho_scale = a.ortho
    cd.clip_start, cd.clip_end = 0.1, 100
    cam = bpy.data.objects.new("SPRITE_CAM", cd)
    scene.collection.objects.link(cam)
    rx = math.radians(90 - a.elevation)
    cam.rotation_euler = Euler((rx, 0, 0), "XYZ")
    fwd = Vector((0, -math.sin(rx), -math.cos(rx)))  # R_x(rx) @ (0,0,-1)
    fwd = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 0, -1))
    up = Euler((rx, 0, 0)).to_matrix() @ Vector((0, 1, 0))
    zt = (a.anchor_y - 0.5) * a.ortho / up.z
    target = Vector((0, 0, zt))
    cam.location = target - fwd * 20
    scene.camera = cam
    bpy.context.view_layer.update()
    p = world_to_camera_view(scene, cam, Vector((0, 0, 0)))
    return cam, (p.x * a.size, (1 - p.y) * a.size)

def find_layers(scene, wanted):
    out = []
    for lc in bpy.context.view_layer.layer_collection.children:
        c = lc.collection
        if not c.name.startswith("L_"):
            continue
        name = c.name[2:]
        if wanted and name not in wanted:
            continue
        out.append(dict(name=name, lc=lc, order=int(c.get("sprite_order", len(out))),
                        tint=bool(c.get("sprite_tint", False)), overlay=bool(c.get("sprite_overlay", False))))
    out.sort(key=lambda l: l["order"])
    return out

def set_active_layer(all_layers, active):
    for l in all_layers:
        is_active = l is active
        l["lc"].holdout = not is_active
        # overlays are off while a base layer renders, so base layers have no holes
        l["lc"].collection.hide_render = (l["overlay"] and not active["overlay"] and not is_active)

def find_rig(root):
    for ob in root.children_recursive:
        if ob.type == "ARMATURE":
            return ob
    raise SystemExit("No armature under " + root.name)

def load_rgba(path):
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    return px.reshape(h, w, 4)[::-1]          # top row first

def save_rgba(arr, path):
    h, w, _ = arr.shape
    img = bpy.data.images.new(os.path.basename(path), w, h, alpha=True)
    img.alpha_mode = "STRAIGHT"
    img.pixels.foreach_set(np.ascontiguousarray(arr[::-1]).ravel())
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)

def main():
    a = parse()
    scene = bpy.context.scene
    name = a.name or os.path.splitext(os.path.basename(bpy.data.filepath))[0]
    out = os.path.abspath(a.out)
    tmp = os.path.join(out, "frames")
    os.makedirs(tmp, exist_ok=True)
    setup_render(scene, a)
    cam, anchor = setup_camera(scene, a)
    root = bpy.data.objects[a.root]
    rig = find_rig(root)
    dirs = [d.strip() for d in a.directions.split(",") if d.strip()]
    wanted_anims = [x for x in a.anims.split(",") if x]
    actions = [bpy.data.actions[n] for n in wanted_anims] if wanted_anims else \
        sorted([act for act in bpy.data.actions if "sprite_fps" in act], key=lambda x: (int(x.get("sprite_order", 99)), x.name))
    layers = find_layers(scene, [x for x in a.layers.split(",") if x])
    if not actions or not layers:
        raise SystemExit("Nothing to render (no sprite actions or L_ collections found)")
    rot0 = root.rotation_euler.copy()
    meta = dict(character=name, frameWidth=a.size, frameHeight=a.size,
                anchor=dict(x=round(anchor[0], 2), y=round(anchor[1], 2), note="feet / ground point of the character, in pixels from the frame's top-left"),
                pixelsPerTile=round(a.size / a.ortho, 3),
                camera=dict(projection="orthographic", elevationDeg=a.elevation, orthoScaleTiles=a.ortho,
                            note="one tile on the ground is pixelsPerTile wide and pixelsPerTile*sin(elevation) tall on screen"),
                directions=dirs, directionVectors={d: ALL_DIRS[d][1] for d in dirs},
                sheetLayout="rows = directions (in the order above), columns = frames, no padding",
                layers=[dict(name=l["name"], order=l["order"], tint=l["tint"], optional=l["overlay"]) for l in layers],
                animations={})
    t0 = time.time()
    n = 0
    for act in actions:
        rig.animation_data.action = act
        f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
        frames = list(range(f0, f1 + 1))
        for di, d in enumerate(dirs):
            root.rotation_euler = Euler((rot0.x, rot0.y, math.radians(ALL_DIRS[d][0])), "XYZ")
            for fi, f in enumerate(frames):
                scene.frame_set(f)
                for l in layers:
                    set_active_layer(layers, l)
                    scene.render.filepath = os.path.join(tmp, l["name"], act.name, f"{d}_{fi:02d}.png")
                    bpy.ops.render.render(write_still=True)
                    n += 1
            print(f"[render_sprites] {act.name} {d} done ({n} renders, {time.time() - t0:.0f}s)", flush=True)
        sheets = {}
        for l in layers:
            sheet = np.zeros((a.size * len(dirs), a.size * len(frames), 4), dtype=np.float32)
            for di, d in enumerate(dirs):
                for fi in range(len(frames)):
                    px = load_rgba(os.path.join(tmp, l["name"], act.name, f"{d}_{fi:02d}.png"))
                    px[px[..., 3] < 0.5 / 255] = 0     # clean see-through pixels (holdout leaves colour there)
                    sheet[di * a.size:(di + 1) * a.size, fi * a.size:(fi + 1) * a.size] = px
            fname = f"{name}_{l['name']}_{act.name}.png"
            save_rgba(sheet, os.path.join(out, fname))
            sheets[l["name"]] = fname
        tags = {}
        for part in str(act.get("sprite_tags", "")).split(","):
            if ":" in part:
                k, v = part.split(":", 1)
                tags[k.strip()] = v.strip()
        info = dict(frames=len(frames), fps=int(act["sprite_fps"]), durationSec=round(len(frames) / int(act["sprite_fps"]), 4),
                    loop=bool(act.get("sprite_loop", True)), tags=tags, sheets=sheets)
        if "sprite_stride_tiles" in act:   # locomotion: lets the game sync playback to movement speed
            st = float(act["sprite_stride_tiles"])
            info["groundMotion"] = dict(
                strideTilesPerLoop=st, stridePxPerLoop=round(st * a.size / a.ortho, 3),
                designSpeedTilesPerSec=float(act.get("sprite_design_speed", 0)),
                fpsPerTilePerSec=round(len(frames) / st, 4),
                note="planted feet stay still when fps = speed (tiles/s) * fpsPerTilePerSec; at the design speed that is the fps above")
        meta["animations"][act.name] = info
    root.rotation_euler = rot0
    for l in layers:
        l["lc"].holdout = False
        l["lc"].collection.hide_render = False
    if "sprite_meta" in scene:             # character-specific notes stored in the .blend
        meta.update(json.loads(scene["sprite_meta"]))
    with open(os.path.join(out, f"{name}.json"), "w") as fh:
        json.dump(meta, fh, indent=2)
    if not a.keep_frames:
        shutil.rmtree(tmp)
    print(f"[render_sprites] finished: {n} renders in {time.time() - t0:.0f}s -> {out}")

main()
