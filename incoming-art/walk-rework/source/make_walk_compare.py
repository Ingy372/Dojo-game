"""
Dojo Ascent - walk rework comparison (Artist bot). Current walk vs a sample, side by side, over a floor
grid that scrolls at the design speed (planted feet must stick to the grid lines).
Composites body, skin (tinted), gi, belt (yellow, rim), one face and one hair, like the game.

    python3 make_walk_compare.py --old <sprites dir> --new <sprites dir> --label "A relaxed" \
        --dirs S,E,N,SE --gif out.gif --strip strip.png [--scale 2]
Strip: every frame of both, one row pair per direction. Needs Pillow + numpy.
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw

FLOOR, GRID = (52, 48, 66, 255), (82, 76, 104, 255)
LAYERS = [("body", None), ("skin", "#e0a984"), ("gi", "#f2e9d8"), ("belt", "#f5d22e"), ("belt-rim", "#2e2a3a"),
          ("face-01", None), ("hair-02", "#3a2519")]

def rgb(h): return np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)], np.float32)

def load(folder):
    meta = json.load(open(next(os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".json"))))
    info = meta["animations"]["walk"]; base = None
    for name, tint in LAYERS:
        img = np.asarray(Image.open(os.path.join(folder, info["sheets"][name])).convert("RGBA"), np.float32) / 255
        if tint: img = img.copy(); img[..., :3] *= rgb(tint)
        if base is None: base = img
        else:
            a = img[..., 3:]; out = base.copy()
            out[..., 3:] = a + base[..., 3:] * (1 - a)
            out[..., :3] = (img[..., :3] * a + base[..., :3] * base[..., 3:] * (1 - a)) / np.maximum(out[..., 3:], 1e-6)
            base = out
    return meta, info, base

def cell(meta, info, comp, dn, f, sec):
    W, H = meta["frameWidth"], meta["frameHeight"]; ppt = meta["pixelsPerTile"]
    tall = ppt * np.sin(np.radians(meta["camera"]["elevationDeg"])); ax, ay = meta["anchor"]["x"], meta["anchor"]["y"]
    fx, fy = meta["directionVectors"][dn]; dist = info["groundMotion"]["designSpeedTilesPerSec"] * sec
    c = Image.new("RGBA", (W, H), FLOOR); d = ImageDraw.Draw(c)
    ox, oy = (-fx * dist * ppt) % ppt, (-fy * dist * tall) % tall
    for k in range(-3, 4):
        d.line([(ax + ox + (k - 1) * ppt, 0), (ax + ox + (k - 1) * ppt, H)], fill=GRID)
        d.line([(0, ay + oy + (k - 1) * tall), (W, ay + oy + (k - 1) * tall)], fill=GRID)
    i = meta["directions"].index(dn)
    spr = comp[i * H:(i + 1) * H, f * W:(f + 1) * W]
    c.alpha_composite(Image.fromarray((np.clip(spr, 0, 1) * 255).astype(np.uint8), "RGBA"))
    return c

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--old", required=True); ap.add_argument("--new", required=True)
    ap.add_argument("--label", default="new"); ap.add_argument("--dirs", default="S,E,N,SE")
    ap.add_argument("--gif", required=True); ap.add_argument("--strip", default="")
    ap.add_argument("--scale", type=int, default=2); ap.add_argument("--seconds", type=float, default=2.0)
    a = ap.parse_args(); S = a.scale
    sides = [(*load(a.old), "current walk"), (*load(a.new), a.label)]
    dirs = a.dirs.split(","); W, H = sides[0][0]["frameWidth"], sides[0][0]["frameHeight"]
    LAB, TOP = 30, 18
    frames = []
    for t in range(int(a.seconds * 30)):
        sec = t / 30
        cv = Image.new("RGB", (LAB + len(dirs) * W * S, TOP + 2 * (H * S + 16)), (24, 22, 32)); d = ImageDraw.Draw(cv)
        for r, (meta, info, comp, lab) in enumerate(sides):
            f = int(sec * info["fps"]) % info["frames"]; y = TOP + r * (H * S + 16)
            d.text((LAB, y - 14), f"{lab}  (frame {f + 1}/{info['frames']})", fill=(255, 220, 120))
            for c, dn in enumerate(dirs):
                cv.paste(cell(meta, info, comp, dn, f, sec).resize((W * S, H * S), Image.NEAREST).convert("RGB"), (LAB + c * W * S, y))
                if r == 0: d.text((LAB + c * W * S + 4, 2), dn, fill=(255, 255, 255))
        frames.append(cv)
    frames[0].save(a.gif, save_all=True, append_images=frames[1:], duration=33, loop=0)
    if a.strip:
        n = sides[0][1]["frames"]
        img = Image.new("RGB", (LAB + n * W, len(dirs) * 2 * (H + 14)), (24, 22, 32)); d = ImageDraw.Draw(img)
        for k, dn in enumerate(dirs):
            for r, (meta, info, comp, lab) in enumerate(sides):
                y = (k * 2 + r) * (H + 14)
                d.text((4, y + 2), f"{dn}  {lab}", fill=(255, 220, 120))
                for f in range(info["frames"]):
                    img.paste(cell(meta, info, comp, dn, f, f / info["fps"]).convert("RGB"), (LAB + f * W, y + 14))
                    d.text((LAB + f * W + 3, y + 16), str(f + 1), fill=(255, 255, 255))
        img.save(a.strip)
    print("wrote", a.gif, a.strip)

main()
