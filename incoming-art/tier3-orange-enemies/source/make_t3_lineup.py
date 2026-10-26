"""
Dojo Ascent - tier 3 (Orange) sample line-up (Artist bot): the 3 tier 3 sample enemies, the bestiary sample next to the Tier 1 enemies and
the player (body-a, default look), idle S frame 0, feet on one ground line, same world scale (80 px per tile).

    python3 incoming-art/tier3-orange-sample/source/make_t3_lineup.py --out lineup.png
Run from the repo root. Needs Python 3 with Pillow and numpy.
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw
ROOT = "incoming-art"
g = {}; exec(open(os.path.join(ROOT, "tools", "make_creature_preview.py")).read().rsplit("if __name__", 1)[0], g)
ap = argparse.ArgumentParser(); ap.add_argument("--out", required=True); a = ap.parse_args()

def meta(f): return json.load(open([os.path.join(f, x) for x in os.listdir(f) if x.endswith(".json")][0]))
def frame(f, m, d="S"):
    c = g["composite"](f, m, "idle", []); W, H = m["frameWidth"], m["frameHeight"]; i = m["directions"].index(d)
    return g["to_img"](c[i * H:(i + 1) * H, 0:W], (0, 0, 0, 0)), m["anchor"]["y"]

def player():
    f = os.path.join(ROOT, "player-custom", "sprites", "body-a"); m = meta(f); W, H = m["frameWidth"], m["frameHeight"]
    i = m["directions"].index("S"); out = Image.new("RGBA", (W, H))
    tint = {"skin": "#e0a984", "gi": "#f2e9d8", "belt": "#f4f1ea", "belt-rim": "#2e2a3a", "hair-02": "#34303f"}
    for l in ["body", "skin", "gi", "belt", "belt-rim", "face-01", "hair-02"]:
        im = Image.open(os.path.join(f, f"player-a_{l}_idle.png")).convert("RGBA").crop((0, i * H, W, (i + 1) * H))
        if l in tint:
            arr = np.array(im).astype(float); h = tint[l].lstrip("#"); c = [int(h[k:k + 2], 16) / 255 for k in (0, 2, 4)]
            arr[..., :3] *= c; im = Image.fromarray(arr.astype("uint8"))
        out.alpha_composite(im)
    return out, m["anchor"]["y"]

cells = [("Player", *player())]
for e, n in [("swarmer", "Swarmer"), ("shield", "Shield Guard"), ("brute", "Brute"), ("keeper", "Floor Keeper")]:
    f = os.path.join(ROOT, "enemies-tier1", e, "sprites"); cells.append((n, *frame(f, meta(f))))
for e, n in [("wick", "Wick Wisp*"), ("dust", "Dust Bunny*"), ("sentry", "Sleepy Sentry*")]:
    f = os.path.join(ROOT, "bestiary-sample", e, "sprites"); cells.append((n, *frame(f, meta(f))))
for e, n in [("spark-sprite", "Spark Sprite+"), ("dough-blob", "Dough Blob+"), ("ladle-lobber", "Ladle Lobber+")]:
    f = os.path.join(ROOT, "tier3-orange-sample", e, "sprites"); cells.append((n, *frame(f, meta(f))))
for e, n in [("rolling-pin", "Rolling Pin+"), ("doughling", "Doughling+")]:
    f = os.path.join(ROOT, "tier3-orange-enemies", e, "sprites"); cells.append((n, *frame(f, meta(f))))

def row(s):
    up = max(ay for _, _, ay in cells) * s; dn = max(im.height - ay for _, im, ay in cells) * s
    out = Image.new("RGBA", (sum(im.width * s + 8 for _, im, _ in cells) + 8, int(up + dn) + 24), (24, 22, 32, 255))
    d = ImageDraw.Draw(out); x = 8; gy = 18 + up
    d.line([(0, gy), (out.width, gy)], fill=(70, 66, 90, 255))
    for l, im, ay in cells:
        out.alpha_composite(im.resize((im.width * s, im.height * s), Image.NEAREST), (x, int(gy - ay * s)))
        d.text((x + 2, 3), l, fill=(255, 220, 120, 255) if l.endswith("*") else (255, 180, 110, 255) if l.endswith("+") else (255, 255, 255, 255)); x += im.width * s + 8
    return out
r1, r2 = row(1), row(2)
img = Image.new("RGBA", (max(r1.width, r2.width), r1.height + r2.height + 44), (24, 22, 32, 255)); d = ImageDraw.Draw(img)
d.text((8, 4), "1x (true size on screen)   * = bestiary sample (#207)   + = tier 3 enemy   line = ground under the feet", fill=(255, 220, 120, 255))
img.paste(r1, (0, 18)); d.text((8, r1.height + 24), "2x", fill=(255, 220, 120, 255)); img.paste(r2, (0, r1.height + 40))
img.save(a.out); print("wrote", a.out, img.size)
