"""
Dojo Ascent - static sprite renderer (Art Director bot): rooms, decorations, doors, chests, tiles.

Same house look as render_sprites.py (Cycles, toon materials, the 35-degree orthographic camera looking
north, 80 px per tile), for things that don't turn: they are drawn from the one game view only.

The game's world is a top-down grid (a tile is 80 x 80 px on screen) and the sprites stand on it in a 3/4
view. To make the rendered floor line up with that grid exactly, build scripts place everything on the
ground with grid(col, row): world x = col, world y = -row * K, K = 1 / sin(35 deg). A ground square of one
tile then lands on exactly 80 x 80 px, and heights show at 80 * cos(35 deg) = 65.5 px per tile.

    blender -b <scene>.blend -P incoming-art/tools/render_static.py -- --out <folder> [--only a,b] [--samples 24]
        [--frames]   (also render the frame range of actions listed by a target, see below)

What the .blend must contain: collections L_<layer> and scene["static_targets"], a JSON list of
    {"name": "training-mat", "layers": ["training-mat"], "rect": [c0, r0, c1, r1], "top": 1.5,
     "anchor": "bottom-center" | [col, row], "frames": optional [start, end] of the scene timeline,
     "fps": optional, "group": optional}
rect is the ground rectangle in tiles (columns c0..c1, rows r0..r1); "top" adds room above it (in tiles of
screen height) for tall things. Each layer of a target is rendered with the target's other layers as
holdouts (so stacking them in order rebuilds the picture); every other collection is hidden.
Output: <name>_<layer>.png (or <name>_<layer>_<frame>.png sheets, frames left to right) and static.json.
"""
import bpy, sys, os, json, math, argparse
import numpy as np

EL = 35.0
K = 1 / math.sin(math.radians(EL))

def parse():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True); ap.add_argument("--only", default="")
    ap.add_argument("--samples", type=int, default=24); ap.add_argument("--ppt", type=int, default=80)
    return ap.parse_args(argv)

def setup(scene, a):
    r = scene.render
    r.engine = "CYCLES"; scene.cycles.device = "CPU"; scene.cycles.samples = a.samples
    scene.cycles.use_denoising = False; r.film_transparent = True
    r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "None"
    r.resolution_percentage = 100
    cam_d = bpy.data.cameras.new("StaticCam"); cam_d.type = "ORTHO"; cam_d.sensor_fit = "HORIZONTAL"
    cam = bpy.data.objects.new("StaticCam", cam_d); scene.collection.objects.link(cam); scene.camera = cam
    cam.rotation_euler = (math.radians(90 - EL), 0, 0)
    return cam

def place(cam, scene, rect, top, ppt):
    c0, r0, c1, r1 = rect
    wpx = round((c1 - c0) * ppt); hpx = round((r1 - r0 + top) * ppt)
    scene.render.resolution_x, scene.render.resolution_y = wpx, hpx
    cam.data.ortho_scale = (c1 - c0) if wpx >= hpx else (r1 - r0 + top)
    cam.data.sensor_fit = "HORIZONTAL" if wpx >= hpx else "VERTICAL"
    # screen centre = ground point (cx, rc) where rows are in screen-tile units
    cx = (c0 + c1) / 2; rc = (r0 - top + r1) / 2
    from mathutils import Vector, Euler
    d = Euler(cam.rotation_euler).to_matrix() @ Vector((0, 0, -1))
    ground = Vector((cx, -rc * K, 0))
    cam.location = ground - d * 40
    cam.data.clip_end = 200
    return wpx, hpx

def main():
    a = parse(); scene = bpy.context.scene
    targets = json.loads(scene["static_targets"])
    if a.only: targets = [t for t in targets if t["name"] in a.only.split(",") or t.get("group") in a.only.split(",")]
    cam = setup(scene, a)
    vl = scene.view_layers[0]
    lcs = {lc.name[2:]: lc for lc in vl.layer_collection.children if lc.name.startswith("L_")}
    os.makedirs(a.out, exist_ok=True)
    out_json = os.path.join(a.out, "static.json")
    meta = json.load(open(out_json)) if os.path.exists(out_json) else {
        "pixelsPerTile": a.ppt, "camera": {"projection": "orthographic", "elevationDeg": EL, "facing": "north (the one game view)"},
        "groundRule": "a ground tile is exactly ppt x ppt px (the scene's depth is stretched by 1/sin(35)); heights show at ppt*cos(35) px per tile",
        "sprites": {}}
    for t in targets:
        wpx, hpx = place(cam, scene, t["rect"], t.get("top", 0), a.ppt)
        frames = t.get("frames")
        files = {}
        for ln in t["layers"]:
            for n, lc in lcs.items():
                lc.exclude = False
                lc.collection.hide_render = n not in t["layers"]
                lc.holdout = n != ln
            rng = range(frames[0], frames[1] + 1) if frames else [scene.frame_current]
            imgs = []
            for f in rng:
                scene.frame_set(f)
                p = os.path.join(a.out, "_tmp.png"); scene.render.filepath = p
                bpy.ops.render.render(write_still=True)
                im = bpy.data.images.load(p); px = np.array(im.pixels[:], dtype=np.float32).reshape(hpx, wpx, 4)[::-1]
                bpy.data.images.remove(im); px[px[..., 3] < 0.5 / 255] = 0
                imgs.append(px)
            sheet = np.concatenate(imgs, axis=1)
            img = bpy.data.images.new("out", sheet.shape[1], sheet.shape[0], alpha=True)
            img.pixels = sheet[::-1].ravel(); img.alpha_mode = "STRAIGHT"
            fn = f"{t['name']}_{ln}.png"; img.filepath_raw = os.path.join(a.out, fn); img.file_format = "PNG"; img.save()
            bpy.data.images.remove(img); files[ln] = fn
        c0, r0, c1, r1 = t["rect"]; top = t.get("top", 0)
        anc = t.get("anchor", "bottom-center")
        if anc == "bottom-center":
            ax, ay = wpx / 2, hpx
        else:
            ax, ay = (anc[0] - c0) * a.ppt, (anc[1] - r0 + top) * a.ppt
        e = {"size": [wpx, hpx], "layers": t["layers"], "files": files,
             "groundRect": {"col0": c0, "row0": r0, "col1": c1, "row1": r1, "note": "the image's ground area in tiles"},
             "topExtraTiles": top, "anchorPx": [round(ax, 1), round(ay, 1)],
             "anchorNote": "the point of the image that sits on the anchor spot (default: bottom-centre of the footprint)"}
        if frames:
            e.update(frames=frames[1] - frames[0] + 1, frameWidth=wpx, fps=t.get("fps", 12), loop=t.get("loop", False))
        for k in ("footprint", "place", "note", "info"):
            if k in t: e[k] = t[k]
        meta["sprites"][t["name"]] = e
    for lc in lcs.values():
        lc.holdout = False; lc.collection.hide_render = False
    if os.path.exists(os.path.join(a.out, "_tmp.png")): os.remove(os.path.join(a.out, "_tmp.png"))
    json.dump(meta, open(out_json, "w"), indent=2)
    print("wrote", out_json)

main()
