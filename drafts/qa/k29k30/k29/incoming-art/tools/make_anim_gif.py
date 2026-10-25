"""
Dojo Ascent - animated enemy previews (Art Director bot). Uses the existing sheets (no re-render).

    python3 make_anim_gif.py --sheets enemies-tier1/swarmer/sprites --out swarmer_anim.gif \
        [--with shield] [--extra "idle@shield-broken"] [--dirs S,E,SE] [--scale 2]
    python3 make_anim_gif.py --windups enemies-tier1 --out windup_compare.gif

Each animation plays at its own fps (from the json) with every frame. Loops play twice, one-shots once, and
the last frame is held for 0.4 s. S, E and SE are shown side by side under a label. The wind-up comparison
plays all four enemies' wind-up into the attack, side by side (S view, same world scale: 160 px per tile).
Needs Python 3 with Pillow and numpy.
"""
import argparse, json, os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
g = {}; exec(open(os.path.join(HERE, "make_creature_preview.py")).read().rsplit("if __name__", 1)[0], g)
ORDER = ["idle", "move", "windup", "attack", "windup_slam", "slam", "windup_sweep", "sweep", "hit", "stagger", "winded", "call", "defeat"]
BG = (24, 22, 32, 255)

def meta_of(folder):
    return json.load(open([os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".json")][0]))

def frames_of(folder, meta, an, layers, dirs, scale):
    c = g["composite"](folder, meta, an, layers); W, H = meta["frameWidth"], meta["frameHeight"]
    out = []
    for f in range(meta["animations"][an]["frames"]):
        row = []
        for d in dirs:
            i = meta["directions"].index(d)
            row.append(g["to_img"](c[i * H:(i + 1) * H, f * W:(f + 1) * W]).resize((W * scale, H * scale), Image.NEAREST))
        out.append(row)
    return out

def save(frames, durs, path):
    pal = [f.convert("RGB").quantize(colors=128, method=Image.Quantize.MEDIANCUT) for f in frames]
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=durs, loop=0, optimize=True, disposal=1)
    print("wrote", path, len(frames), "frames", round(os.path.getsize(path) / 1e6, 2), "MB")

def enemy(a):
    meta = meta_of(a.sheets); dirs = a.dirs.split(","); layers = [x for x in a.with_.split(",") if x]
    W = meta["frameWidth"] * a.scale; H = meta["frameHeight"] * a.scale
    jobs = [(an, layers, an) for an in ORDER if an in meta["animations"]]
    for e in [x for x in a.extra.split(";") if x]:
        an, lay = e.split("@"); jobs.append((an, [lay], f"{an} ({lay})"))
    frames, durs = [], []
    for an, lay, label in jobs:
        m = meta["animations"][an]; fps = m["fps"]; loop = m.get("loop", False)
        seq = frames_of(a.sheets, meta, an, lay, dirs, a.scale)
        reps = 2 if loop else 1
        for r in range(reps):
            for k, row in enumerate(seq):
                img = Image.new("RGBA", (len(dirs) * (W + 6) + 6, H + 30), BG); d = ImageDraw.Draw(img)
                d.text((8, 6), f"{meta.get('name', '')} {label}  {fps} fps  frame {k + 1}/{len(seq)}" + ("  (loop)" if loop else ""), fill=(255, 220, 120, 255))
                for j, cell in enumerate(row):
                    img.paste(cell, (6 + j * (W + 6), 26)); d.text((10 + j * (W + 6), 28), dirs[j], fill=(255, 255, 255, 255))
                frames.append(img); durs.append(round(1000 / fps))
        durs[-1] += 400
    save(frames, durs, a.out)

def windups(a):
    ids = [("swarmer", "windup", "attack", []), ("shield", "windup", "attack", ["shield"]), ("brute", "windup", "attack", []),
           ("keeper", "windup_slam", "slam", [])]
    cols = []
    for e, w, at, lay in ids:
        f = os.path.join(a.windups, e, "sprites"); m = meta_of(f); sc = 2                      # same scale for all, so sizes compare (the Keeper frame is 2x bigger)
        seq = [r[0] for r in frames_of(f, m, w, lay, ["S"], sc)] + [r[0] for r in frames_of(f, m, at, lay, ["S"], sc)]
        cols.append((e, seq, len(frames_of(f, m, w, lay, ["S"], sc)), m["animations"][w]))
    n = max(len(s) for _, s, _, _ in cols); xs = [6]
    for _, s, _, _ in cols: xs.append(xs[-1] + s[0].width + 6)
    Hh = max(s[0].height for _, s, _, _ in cols)
    frames, durs = [], []
    for k in range(n):
        img = Image.new("RGBA", (xs[-1], Hh + 30), BG); d = ImageDraw.Draw(img)
        for j, (e, seq, nw, mw) in enumerate(cols):
            i = min(k, len(seq) - 1); x = xs[j]
            img.paste(seq[i], (x, 26 + Hh - seq[i].height))
            tele = mw.get("telegraphSeconds", round(nw / mw["fps"], 2))
            d.text((x + 2, 6), f"{e}: " + (f"WIND-UP {tele}s" if i < nw else "ATTACK"), fill=(255, 120, 100, 255) if i < nw else (255, 255, 255, 255))
        frames.append(img); durs.append(100)          # all wind-ups/attacks are 10 fps
    durs[-1] += 600
    save(frames, durs, a.out)

ap = argparse.ArgumentParser()
ap.add_argument("--sheets"); ap.add_argument("--windups"); ap.add_argument("--out", required=True)
ap.add_argument("--with", dest="with_", default=""); ap.add_argument("--extra", default="")
ap.add_argument("--dirs", default="S,E,SE"); ap.add_argument("--scale", type=int, default=2)
a = ap.parse_args()
windups(a) if a.windups else enemy(a)
