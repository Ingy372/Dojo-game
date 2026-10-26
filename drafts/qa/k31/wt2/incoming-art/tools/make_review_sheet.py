"""
Dojo Ascent - "review these first" picture (Art Director bot): chosen frames of chosen animations, in chosen
directions, side by side with labels, at 2x, so Jay can approve a batch quickly.

    python3 make_review_sheet.py --kind player|creature --sheets <sprites folder> --out review.png \
        --title "Dash and hit flinch" --cells "dash:2:E;dash:2:S;hit:1:S" [--with shield] [--scale 2]
Needs Python 3 with Pillow and numpy. Player sheets use make_preview.py's stacking (yellow belt unless
--belt), creature sheets use make_creature_preview.py's (telegraph shown in wind-ups).
"""
import argparse, json, os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kind", required=True); ap.add_argument("--sheets", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--title", default=""); ap.add_argument("--cells", required=True); ap.add_argument("--with", dest="with_", default="")
    ap.add_argument("--scale", type=int, default=2); ap.add_argument("--belt", default="Yellow"); ap.add_argument("--per-row", type=int, default=6)
    a = ap.parse_args()
    meta = json.load(open([os.path.join(a.sheets, f) for f in os.listdir(a.sheets) if f.endswith(".json")][0]))
    W, H = meta["frameWidth"], meta["frameHeight"]
    g = {}
    if a.kind == "player":
        exec(open(os.path.join(HERE, "make_preview.py")).read().rsplit("main()", 1)[0], g)
        belt = next(b for b in g["BELTS"] if b[0] == a.belt)
        comp = lambda an: g["composite"](a.sheets, meta, an, belt=belt, stripes=1)
    else:
        exec(open(os.path.join(HERE, "make_creature_preview.py")).read().rsplit("if __name__", 1)[0], g)
        comp = lambda an: g["composite"](a.sheets, meta, an, [x for x in a.with_.split(",") if x])
    cache = {}
    cells = [c.split(":") for c in a.cells.split(";") if c]
    per = min(a.per_row, len(cells)); rows = (len(cells) + per - 1) // per
    S = a.scale
    img = Image.new("RGBA", (per * (W * S + 8) + 8, 30 + rows * (H * S + 26)), (24, 22, 32, 255)); d = ImageDraw.Draw(img)
    d.text((8, 8), a.title, fill=(255, 220, 120, 255))
    for k, (an, f, di) in enumerate(cells):
        if an not in cache: cache[an] = comp(an)
        c = cache[an]; i = meta["directions"].index(di); f = int(f)
        cell = g["to_img"](c[i * H:(i + 1) * H, f * W:(f + 1) * W]).resize((W * S, H * S), Image.NEAREST)
        x, y = 8 + (k % per) * (W * S + 8), 30 + (k // per) * (H * S + 26)
        img.paste(cell, (x, y + 16)); d.text((x + 2, y + 2), f"{an} {di} frame {f}", fill=(255, 255, 255, 255))
    img.save(a.out); print("wrote", a.out)

main()
