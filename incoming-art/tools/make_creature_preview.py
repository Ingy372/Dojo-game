"""
Dojo Ascent - previews for enemies and other non-belt sprite sets (Art Director bot).

Stacks the layer sheets the way the game will, then writes per-animation GIFs (8 directions, real timing),
contact sheets (every frame, every direction) and a size line-up. Layers marked optional are left out unless
listed in --with; the "telegraph" layer is drawn only in wind-up animations (tinted, like the game will).

    python3 make_creature_preview.py --sheets <folder> --out <folder> [--with shield] [--tele-tint #ff3b30]
        [--gifs all|a,b] [--scale 2]
Needs Python 3 with Pillow and numpy.
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw

FLOOR = (47, 42, 61, 255)

def rgb(h):
    h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255

def over(dst, src):
    a = src[..., 3:4]; out_a = a + dst[..., 3:4] * (1 - a)
    out = (src[..., :3] * a + dst[..., :3] * dst[..., 3:4] * (1 - a)) / np.maximum(out_a, 1e-6)
    return np.concatenate([out, out_a], -1)

def load(folder):
    meta = json.load(open([os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".json")][0]))
    return meta

def composite(folder, meta, anim, with_layers=(), tele_tint="#ff3b30", tele=None):
    base = None
    tele = anim.startswith("windup") if tele is None else tele
    for l in sorted(meta["layers"], key=lambda l: l["order"]):
        n = l["name"]
        if n == "telegraph":
            if not tele: continue
        elif l["optional"] and n not in with_layers:
            continue
        f = meta["animations"][anim]["sheets"].get(n)
        if not f: continue
        img = np.asarray(Image.open(os.path.join(folder, f)).convert("RGBA"), dtype=np.float32) / 255
        if n == "telegraph":
            img = img.copy(); img[..., :3] *= rgb(tele_tint); img[..., 3] *= 0.85
        base = img if base is None else over(base, img)
    return base

def to_img(arr, bg=FLOOR):
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), "RGBA")
    b = Image.new("RGBA", im.size, bg); b.alpha_composite(im); return b

def cell(c, meta, d, f):
    W, H = meta["frameWidth"], meta["frameHeight"]; i = meta["directions"].index(d)
    return c[i * H:(i + 1) * H, f * W:(f + 1) * W]

def nframes(meta, anim):
    return meta["animations"][anim]["frames"]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheets", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--with", dest="with_", default=""); ap.add_argument("--tele-tint", default="#ff3b30")
    ap.add_argument("--gifs", default="all"); ap.add_argument("--scale", type=int, default=2)
    ap.add_argument("--prefix", default="")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    meta = load(a.sheets); W, H = meta["frameWidth"], meta["frameHeight"]
    wl = [x for x in a.with_.split(",") if x]
    name = a.prefix or meta.get("character", "sprite")
    anims = list(meta["animations"])
    for an in anims:
        c = composite(a.sheets, meta, an, wl, a.tele_tint); n = nframes(meta, an); dirs = meta["directions"]
        sheet = Image.new("RGBA", (40 + n * W, 16 + len(dirs) * H), (24, 22, 32, 255)); d = ImageDraw.Draw(sheet)
        for r, di in enumerate(dirs):
            d.text((4, 16 + r * H + H // 2), di, fill=(255, 255, 255, 255))
            for f in range(n):
                sheet.paste(to_img(cell(c, meta, di, f)), (40 + f * W, 16 + r * H))
        for f in range(n):
            d.text((40 + f * W + 4, 2), f"{an} {f}", fill=(255, 220, 120, 255))
        sheet.save(os.path.join(a.out, f"{name}_contact_{an}.png"))
        if a.gifs == "all" or an in a.gifs.split(","):
            info = meta["animations"][an]; fps = info["fps"]
            frames = []
            for f in range(n):
                fr = Image.new("RGBA", (4 * W, 2 * H + 14), FLOOR); dd = ImageDraw.Draw(fr)
                dd.text((4, 2), f"{name} {an}: frame {f + 1}/{n} @ {fps} fps", fill=(255, 220, 120, 255))
                for k, di in enumerate(dirs):
                    fr.paste(to_img(cell(c, meta, di, f)), ((k % 4) * W, 14 + (k // 4) * H))
                    dd.text(((k % 4) * W + 3, 14 + (k // 4) * H + 2), di, fill=(255, 255, 255, 200))
                frames.append(fr.convert("RGB").resize((fr.width * a.scale // 2, fr.height * a.scale // 2), Image.NEAREST))
            dur = [int(1000 / fps)] * n
            if not info.get("loop"): dur[-1] = 900
            frames[0].save(os.path.join(a.out, f"{name}_{an}.gif"), save_all=True, append_images=frames[1:], duration=dur, loop=0)
    print("previews written to", a.out)

if __name__ == "__main__":
    main()
