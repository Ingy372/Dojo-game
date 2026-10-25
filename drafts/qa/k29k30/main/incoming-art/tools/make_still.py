"""
Dojo Ascent - pose stills, before/after (Art Director bot).

One row per render (before / after), one cell per direction x frame, so a pose can be checked from
the side and the front, e.g. the bow at its lowest point:

    python3 make_still.py --old <sprites> --new <sprites> --anim bow --frames 3,11 --dirs E,W,S \
        --out bow-side.png [--old-label before] [--new-label after] [--scale 3]
Needs Python 3 with Pillow and numpy. Uses the same layer stacking as make_preview.py (yellow belt).
"""
import argparse, json, os
from PIL import Image, ImageDraw

src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "make_preview.py")).read().rsplit("main()", 1)[0]
_g = {}; exec(src, _g)
composite, to_img, BELTS = _g["composite"], _g["to_img"], _g["BELTS"]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--old", default=""); ap.add_argument("--new", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--old-label", default="before"); ap.add_argument("--new-label", default="after")
    ap.add_argument("--anim", default="bow"); ap.add_argument("--frames", default="11"); ap.add_argument("--dirs", default="E,W,S")
    ap.add_argument("--scale", type=int, default=3)
    a = ap.parse_args()
    frames = [int(f) for f in a.frames.split(",")]; dirs = a.dirs.split(",")
    rows = [(f, l) for f, l in ((a.old, a.old_label), (a.new, a.new_label)) if f]
    S = 128 * a.scale
    img = Image.new("RGBA", (120 + len(dirs) * len(frames) * (S + 6), len(rows) * (S + 24) + 4), (24, 22, 32, 255))
    d = ImageDraw.Draw(img)
    for r, (folder, label) in enumerate(rows):
        meta = json.load(open([os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".json")][0]))
        W = meta["frameWidth"]
        c = composite(folder, meta, a.anim, belt=BELTS[1], stripes=1)
        y = 4 + r * (S + 24)
        d.text((4, y + S // 2), label, fill=(255, 220, 120, 255))
        k = 0
        for di in dirs:
            i = meta["directions"].index(di)
            for f in frames:
                x = 120 + k * (S + 6); k += 1
                cell = to_img(c[i * W:(i + 1) * W, f * W:(f + 1) * W]).resize((S, S), Image.NEAREST)
                img.paste(cell, (x, y + 16))
                d.text((x + 4, y + 2), f"{a.anim} {di} frame {f}", fill=(255, 255, 255, 255))
    img.save(a.out); print("wrote", a.out)

main()
