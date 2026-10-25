"""
Dojo Ascent - belt chart before/after (Art Director bot).

Shows chosen belts on the white gi, from two renders (before / after), at real size (1x, the whole
character facing S) and at 4x (the waist), so belt readability fixes can be judged at phone size.

    python3 make_belt_chart.py --old <sprites folder> --new <sprites folder> --out belt-chart.png
        [--old-label before] [--new-label after] [--anim idle] [--frame 0] [--dir S]
        [--options A,B,C]   # belt revision: one "after" row per belt style option (BELT_OPTIONS in make_preview.py)
Needs Python 3 with Pillow and numpy. Uses the same layer stacking as make_preview.py.
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw

src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "make_preview.py")).read().rsplit("main()", 1)[0]
_g = {}; exec(src, _g)
composite, to_img, BELTS = _g["composite"], _g["to_img"], _g["BELTS"]
PICK = os.environ.get("BELT_PICK", "White,Yellow,Red/Black,Brown/Black,Black").split(",")
NOTES = {"batch1": "Batch 1 tints", "A": "light rim on black", "B": "A + light separator", "C": "CHOSEN: light rim,\nblack #26272f + sheen,\ndeep-black centre"}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--old", required=True); ap.add_argument("--new", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--old-label", default="before"); ap.add_argument("--new-label", default="after")
    ap.add_argument("--options", default="chosen")
    ap.add_argument("--anim", default="idle"); ap.add_argument("--frame", type=int, default=0); ap.add_argument("--dir", default="S")
    a = ap.parse_args()
    belts = [b for b in BELTS if b[0] in PICK]
    CW, CH, Z = 40, 26, 4                      # waist crop size (px) and zoom
    colw = max(128, CW * Z) + 10
    opts = a.options.split(",")
    rows = [(a.old, a.old_label, "chosen")] + [(a.new, (a.new_label + " " + o) if len(opts) > 1 else a.new_label, o) for o in opts]
    img = Image.new("RGBA", (110 + len(belts) * colw, 20 + len(rows) * (128 + CH * Z + 30)), (24, 22, 32, 255))
    d = ImageDraw.Draw(img)
    for k, b in enumerate(belts):
        d.text((110 + k * colw + 4, 4), b[0], fill=(255, 255, 255, 255))
    for r, (folder, label, style) in enumerate(rows):
        meta = json.load(open([os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".json")][0]))
        W = H = meta["frameWidth"]; i = meta["directions"].index(a.dir); f = a.frame
        belt_alpha = np.asarray(Image.open(os.path.join(folder, meta["animations"][a.anim]["sheets"]["belt"])).convert("RGBA"))[..., 3]
        ys, xs = np.nonzero(belt_alpha[i * H:(i + 1) * H, f * W:(f + 1) * W] > 128)
        cy, cx = int(np.median(ys)), int(np.median(xs))
        y0 = 20 + r * (128 + CH * Z + 30)
        d.text((4, y0 + 40), f"{label}\n1x (real size)\n{NOTES.get(style, '')}", fill=(255, 220, 120, 255))
        d.text((4, y0 + 128 + 40), f"{label}\n4x waist", fill=(255, 220, 120, 255))
        for k, b in enumerate(belts):
            c = composite(folder, meta, a.anim, belt=b, stripes=0 if b[0] == "White" else 2, style=style)
            cell = c[i * H:(i + 1) * H, f * W:(f + 1) * W]
            x = 110 + k * colw
            img.paste(to_img(cell), (x, y0))                                       # 1x
            crop = cell[max(0, cy - CH // 2):max(0, cy - CH // 2) + CH, max(0, cx - CW // 2):max(0, cx - CW // 2) + CW]
            img.paste(to_img(crop).resize((CW * Z, CH * Z), Image.NEAREST), (x, y0 + 128 + 6))
    img.save(a.out)
    print("wrote", a.out)

main()
