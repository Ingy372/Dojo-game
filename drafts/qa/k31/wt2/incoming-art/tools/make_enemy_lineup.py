"""
Dojo Ascent - enemy line-up (Art Director bot): all Tier 1 enemies side by side, idle and wind-up, in chosen
directions, at 1x (true phone size) and 2x, on the same world scale (80 px per tile at 1x).

    python3 make_enemy_lineup.py --root incoming-art/enemies-tier1 --out lineup.png [--dirs S,E]
        [--sheets swarmer=<folder>,...]   (default: <root>/<enemy>/sprites)
Needs Python 3 with Pillow and numpy.
"""
import argparse, json, os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
g = {}; exec(open(os.path.join(HERE, "make_creature_preview.py")).read().rsplit("if __name__", 1)[0], g)
ap = argparse.ArgumentParser(); ap.add_argument("--root", required=True); ap.add_argument("--out", required=True)
ap.add_argument("--dirs", default="S,E"); ap.add_argument("--sheets", default="")
a = ap.parse_args()
ENEMIES = [("swarmer", "Swarmer", "windup", ["shield"]), ("shield", "Shield Guard", "windup", ["shield"]),
           ("brute", "Brute", "windup", []), ("keeper", "Floor Keeper", "windup_slam", [])]
over = dict(x.split("=") for x in a.sheets.split(",") if x)
dirs = a.dirs.split(",")
cells = []   # (label, image at 1x)
for e, name, wu, lay in ENEMIES:
    f = over.get(e, os.path.join(a.root, e, "sprites"))
    m = json.load(open([os.path.join(f, x) for x in os.listdir(f) if x.endswith(".json")][0]))
    W, H = m["frameWidth"], m["frameHeight"]
    for an in ("idle", wu):
        c = g["composite"](f, m, an, lay)
        fr = 0 if an == "idle" else m["animations"][an]["frames"] - 1
        for d in dirs:
            i = m["directions"].index(d)
            cells.append((f"{name} {'idle' if an == 'idle' else 'wind-up'} {d}", g["to_img"](c[i * H:(i + 1) * H, fr * W:(fr + 1) * W])))
def row(scale):
    ims = [(l, im.resize((im.width * scale, im.height * scale), Image.NEAREST)) for l, im in cells]
    hh = max(i.height for _, i in ims)
    out = Image.new("RGBA", (sum(i.width + 6 for _, i in ims) + 6, hh + 20), (24, 22, 32, 255)); d = ImageDraw.Draw(out); x = 6
    for l, i in ims:
        out.paste(i, (x, 16 + hh - i.height)); d.text((x + 2, 3), l if scale > 1 else l.split(" ")[0][:7], fill=(255, 255, 255, 255)); x += i.width + 6
    return out
r1, r2 = row(1), row(2)
img = Image.new("RGBA", (max(r1.width, r2.width), r1.height + r2.height + 40), (24, 22, 32, 255)); d = ImageDraw.Draw(img)
d.text((6, 4), "1x (true size on screen)", fill=(255, 220, 120, 255)); img.paste(r1, (0, 18))
d.text((6, r1.height + 22), "2x", fill=(255, 220, 120, 255)); img.paste(r2, (0, r1.height + 38))
img.save(a.out); print("wrote", a.out, img.size)
