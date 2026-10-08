"""
Dojo Ascent - preview maker for rendered sprite sheets (Art Director bot).

Stacks the layer sheets the way the game will (multiply tint on recolourable layers),
then writes review images:
  <out>/<name>_contact_<anim>.png   every frame, every direction, on a floor colour
  <out>/<name>_preview.gif          all animations, 8 directions side by side, animated
  <out>/<name>_belts.png            the same frame with every belt colour of the school
  <out>/head-closeup.png            the face (idle, first frame) in S, SE, E, SW, W at 4x, for checking faces

    python3 make_preview.py --sheets <folder with sheets + json> --out <folder> [--scale 2] [--gif-scale 1]
Needs Python 3 with Pillow and numpy (pip install pillow numpy).
"""
import argparse, json, os, re
import numpy as np
from PIL import Image, ImageDraw

BELTS = [  # Action Zone belt colours from fixtures/ (color, color2)
    ("White", "#f4f1ea", None), ("Yellow", "#f5d22e", None), ("Orange", "#f08a24", None),
    ("Green", "#3aa655", None), ("Blue", "#2f6fd6", None), ("Red", "#d8352a", None),
    ("Red/Black", "#d8352a", "#1a1a1a"), ("Brown", "#7a4a26", None), ("Brown/Black", "#7a4a26", "#1a1a1a"),
    ("Black", "#1a1a1a", None),
]
FLOOR = (47, 42, 61, 255)      # the game's floor colour (0x2f2a3d)

def rgb(h):
    h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255

CHARCOAL = "#3c3c44"   # stands in for pure black so black belts read against the dark outline

def belt_tint(color):
    """Very dark belt colours (black) are drawn as charcoal, per the tint guidance in the JSON."""
    if not color:
        return color
    c = rgb(color) * 255
    return CHARCOAL if c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11 < 40 else color

def tape_for(color):  # same rule as apps/client/src/ui/belt.ts
    c = rgb(color) * 255
    return "#f4f1ea" if c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11 < 90 else "#1a1a1a"

def over(dst, src):
    a = src[..., 3:4]
    out_a = a + dst[..., 3:4] * (1 - a)
    out = (src[..., :3] * a + dst[..., :3] * dst[..., 3:4] * (1 - a)) / np.maximum(out_a, 1e-6)
    return np.concatenate([out, out_a], -1)

def composite(sheets, meta, anim, gi="#f2e9d8", belt=("Yellow", "#f5d22e", None), stripes=1):
    layers = sorted(meta["layers"], key=lambda l: l["order"])
    base = None
    for l in layers:
        name = l["name"]
        if name == "belt-center" and not belt[2]:
            continue
        m = re.search(r"tape(\d+)", name)
        if m and int(m.group(1)) > stripes:
            continue
        img = np.asarray(Image.open(os.path.join(sheets, meta["animations"][anim]["sheets"][name])).convert("RGBA"),
                         dtype=np.float32) / 255
        tint = {"gi": gi, "belt": belt_tint(belt[1]), "belt-center": belt_tint(belt[2])}.get(name)
        if m:
            tint = tape_for(belt[1])
        if l["tint"] and tint:
            img = img.copy(); img[..., :3] *= rgb(tint)
        base = img if base is None else over(base, img)
    return base

def to_img(arr, bg=FLOOR):
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), "RGBA")
    b = Image.new("RGBA", im.size, bg); b.alpha_composite(im); return b

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheets", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--scale", type=int, default=2, help="zoom for the contact sheets")
    ap.add_argument("--gif-scale", type=int, default=1, help="zoom for the animated GIF")
    a = ap.parse_args()
    meta = json.load(open([os.path.join(a.sheets, f) for f in os.listdir(a.sheets) if f.endswith(".json")][0]))
    os.makedirs(a.out, exist_ok=True)
    W, H, dirs, name = meta["frameWidth"], meta["frameHeight"], meta["directions"], meta["character"]
    comps = {an: composite(a.sheets, meta, an) for an in meta["animations"]}
    for an, c in comps.items():
        im = to_img(c)
        lab = Image.new("RGBA", (im.width + 40, im.height + 20), (24, 22, 32, 255))
        lab.paste(im, (40, 20)); d = ImageDraw.Draw(lab)
        for i, dn in enumerate(dirs):
            d.text((6, 20 + i * H + H // 2 - 6), dn, fill=(255, 255, 255, 255))
        for f in range(meta["animations"][an]["frames"]):
            d.text((40 + f * W + 4, 4), f"{an} {f + 1}", fill=(255, 220, 120, 255))
        if a.scale > 1:
            lab = lab.resize((lab.width * a.scale, lab.height * a.scale), Image.NEAREST)
        lab.save(os.path.join(a.out, f"{name}_contact_{an}.png"))
    # animated GIF: one row per animation, every direction across, 12 fps master clock.
    # Looping animations loop; one-shot animations play, hold, and restart every 2 seconds.
    anims = list(meta["animations"])
    gif_frames = []
    LABEL = 64
    for t in range(48):
        canvas = Image.new("RGBA", (LABEL + len(dirs) * W, len(anims) * H), FLOOR)
        d = ImageDraw.Draw(canvas)
        for r, an in enumerate(anims):
            info = meta["animations"][an]
            n = info["frames"]
            if info["loop"]:
                f = int(t * info["fps"] / 12) % n
            else:
                f = min(int((t % 24) * info["fps"] / 12), n - 1)
            d.text((6, r * H + H // 2 - 6), an, fill=(255, 220, 120, 255))
            for i in range(len(dirs)):
                cell = comps[an][i * H:(i + 1) * H, f * W:(f + 1) * W]
                canvas.alpha_composite(Image.fromarray((cell * 255).astype(np.uint8), "RGBA"), (LABEL + i * W, r * H))
                if r == 0:
                    d.text((LABEL + i * W + 4, 2), dirs[i], fill=(255, 255, 255, 255))
        if a.gif_scale > 1:
            canvas = canvas.resize((canvas.width * a.gif_scale, canvas.height * a.gif_scale), Image.NEAREST)
        gif_frames.append(canvas.convert("RGB"))
    gif_frames[0].save(os.path.join(a.out, f"{name}_preview.gif"), save_all=True, append_images=gif_frames[1:],
                       duration=int(1000 / 12), loop=0, optimize=False)
    # belt colours (idle frame 0, S and SE directions)
    an = "idle" if "idle" in meta["animations"] else anims[0]
    row = []
    for b in BELTS:
        c = composite(a.sheets, meta, an, belt=b, stripes=2 if b[0] != "White" else 0)
        si = dirs.index("S")
        row.append(to_img(c[si * H:(si + 1) * H, 0:W]))
    strip = Image.new("RGBA", (len(row) * W, H + 16), (24, 22, 32, 255))
    d = ImageDraw.Draw(strip)
    for i, (im, b) in enumerate(zip(row, BELTS)):
        strip.paste(im, (i * W, 16)); d.text((i * W + 4, 2), b[0], fill=(255, 255, 255, 255))
    strip = strip.resize((strip.width * 2, strip.height * 2), Image.NEAREST)
    strip.save(os.path.join(a.out, f"{name}_belts.png"))
    # head close-up: idle frame 1, 48 x 44 px around the head, 4x nearest-neighbour
    HEAD_DIRS = [d for d in ("S", "SE", "E", "SW", "W") if d in dirs]
    an = "idle" if "idle" in meta["animations"] else anims[0]
    c = composite(a.sheets, meta, an, belt=BELTS[1], stripes=1)
    tiles = []
    for dn in HEAD_DIRS:
        i = dirs.index(dn)
        cell = c[i * H:(i + 1) * H, 0:W]
        ys, xs = np.nonzero(cell[..., 3] > 0.5)
        top = max(0, ys.min() - 3)
        rows = cell[top:top + 30, :, 3] > 0.5
        cx = int(np.nonzero(rows.any(0))[0].mean())
        x0 = min(max(0, cx - 24), W - 48)
        tiles.append((dn, to_img(cell[top:top + 44, x0:x0 + 48])))
    sheet = Image.new("RGBA", (len(tiles) * 48 * 4 + (len(tiles) - 1) * 8, 44 * 4 + 20), (24, 22, 32, 255))
    d = ImageDraw.Draw(sheet)
    for k, (dn, im) in enumerate(tiles):
        x = k * (48 * 4 + 8)
        sheet.paste(im.resize((48 * 4, 44 * 4), Image.NEAREST), (x, 20))
        d.text((x + 4, 4), f"{dn} (4x)", fill=(255, 255, 255, 255))
    sheet.save(os.path.join(a.out, "head-closeup.png"))
    print("previews written to", a.out)

main()
