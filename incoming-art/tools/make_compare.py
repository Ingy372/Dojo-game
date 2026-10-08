"""
Dojo Ascent - side-by-side animation comparison GIF (Art Director bot).

Plays the same animation from two renders next to each other (e.g. an old and a new walk),
over a floor grid that scrolls at the animation's design speed, so you can see whether planted
feet stay put. Uses the groundMotion block of each render's JSON (no grid scroll without it).

    python3 make_compare.py --old <folder> --new <folder> --anim walk --dirs E,SE --out compare.gif
        [--old-label "old"] [--new-label "new"] [--scale 2] [--seconds 2]

Each folder holds the layer sheets + JSON written by render_sprites.py (an old render can be
pulled out of git with `git show <commit>:<path> > file`). Needs Python 3 with Pillow and numpy.
Timing: 30 fps master clock (GIF stores 1/100 s delays, so viewers play it ~10% fast).
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw

src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "make_preview.py")).read().rsplit("main()", 1)[0]
_g = {}; exec(src, _g)   # reuse composite() and the floor colour from make_preview.py
composite, FLOOR = _g["composite"], _g["FLOOR"]
CLK = 30

def load(folder):
    meta = json.load(open([os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".json")][0]))
    return meta

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--old", required=True); ap.add_argument("--new", required=True)
    ap.add_argument("--old-label", default="old"); ap.add_argument("--new-label", default="new")
    ap.add_argument("--anim", default="walk"); ap.add_argument("--dirs", default="E,SE")
    ap.add_argument("--out", required=True); ap.add_argument("--scale", type=int, default=2)
    ap.add_argument("--seconds", type=float, default=2.0)
    a = ap.parse_args()
    sides = []
    for folder, label in ((a.old, a.old_label), (a.new, a.new_label)):
        meta = load(folder)
        info = meta["animations"][a.anim]
        comp = composite(folder, meta, a.anim)
        gm = info.get("groundMotion") or {}
        speed_px = gm.get("designSpeedTilesPerSec", 0) * meta["pixelsPerTile"]
        sides.append(dict(meta=meta, info=info, comp=comp, speed=speed_px, label=label,
                          text=f"{label}: {info['frames']} frames @ {info['fps']} fps, {gm.get('stridePxPerLoop', '?')} px/loop"))
    dirs = a.dirs.split(",")
    W = H = sides[0]["meta"]["frameWidth"]; S = a.scale
    LAB, TOP = 34, 30
    frames = []
    for t in range(int(a.seconds * CLK)):
        sec = t / CLK
        canvas = Image.new("RGBA", (LAB + 2 * W * S + 8, TOP + len(dirs) * H * S + 4 * len(dirs)), (24, 22, 32, 255))
        d = ImageDraw.Draw(canvas)
        for c, sd in enumerate(sides):
            meta, info = sd["meta"], sd["info"]
            f = int(sec * info["fps"]) % info["frames"]
            d.text((LAB + c * (W * S + 8) + 4, 3), sd["text"], fill=(255, 220, 120, 255))
            ppt = meta["pixelsPerTile"]; tall = ppt * np.sin(np.radians(meta["camera"]["elevationDeg"]))
            ax, ay = meta["anchor"]["x"], meta["anchor"]["y"]
            for r, dn in enumerate(dirs):
                i = meta["directions"].index(dn)
                fx, fy = meta["directionVectors"][dn]
                # floor grid scrolls backwards at the design speed (feet should stick to it)
                cell = Image.new("RGBA", (W, H), FLOOR); cd = ImageDraw.Draw(cell)
                dist = sd["speed"] * sec / ppt                                 # tiles travelled
                ox, oy = -fx * dist * ppt, -fy * dist * tall
                for k in range(-3, 4):
                    x = ax + ox % ppt + (k - 1) * ppt
                    cd.line([(x, 0), (x, H)], fill=(70, 64, 90, 255))
                    y = ay + oy % tall + (k - 1) * tall
                    cd.line([(0, y), (W, y)], fill=(70, 64, 90, 255))
                spr = sd["comp"][i * H:(i + 1) * H, f * W:(f + 1) * W]
                cell.alpha_composite(Image.fromarray((np.clip(spr, 0, 1) * 255).astype(np.uint8), "RGBA"))
                cell = cell.resize((W * S, H * S), Image.NEAREST)
                canvas.paste(cell, (LAB + c * (W * S + 8), TOP + r * (H * S + 4)))
                if c == 0:
                    d.text((6, TOP + r * (H * S + 4) + H * S // 2 - 6), dn, fill=(255, 255, 255, 255))
        d.text((LAB + 4, 16), f"{a.anim}, floor scrolls at the design speed", fill=(180, 180, 200, 255))
        frames.append(canvas.convert("RGB"))
    frames[0].save(a.out, save_all=True, append_images=frames[1:], duration=int(1000 / CLK), loop=0)
    print("wrote", a.out)

main()
