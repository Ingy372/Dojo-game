"""Eyes before/after (Jay: undo the A7 "crazy eyes"). Top = the A7 eyes (what main had), bottom = the earlier eyes put back.
    python3 incoming-art/walk-rework/source/make_eyes_before_after.py [--ref origin/main]
Writes walk-rework/preview/eyes-before-after-player.png (both bodies, all 6 faces, light and deep skin, 1x and 3x heads)
and eyes-before-after-kohai.png (sprite heads in 4 directions + the neutral portrait)."""
import argparse, io, json, os, subprocess
import numpy as np
from PIL import Image, ImageDraw
ROOT = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip(); IA = os.path.join(ROOT, "incoming-art")
ap = argparse.ArgumentParser(); ap.add_argument("--ref", default="origin/main"); A = ap.parse_args()
BG = (36, 33, 48)
def img(rel, before):
    if before: return Image.open(io.BytesIO(subprocess.check_output(["git", "-C", ROOT, "show", f"{A.ref}:incoming-art/{rel}"]))).convert("RGBA")
    return Image.open(os.path.join(IA, rel)).convert("RGBA")
def rgb(h): return np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)], np.float32)
def comp(parts):
    base = None
    for im, tint in parts:
        a = np.asarray(im, np.float32) / 255
        if tint: a = a.copy(); a[..., :3] *= rgb(tint)
        if base is None: base = a; continue
        al = a[..., 3:]; o = base.copy(); o[..., 3:] = al + base[..., 3:] * (1 - al)
        o[..., :3] = (a[..., :3] * al + base[..., :3] * base[..., 3:] * (1 - al)) / np.maximum(o[..., 3:], 1e-6); base = o
    return Image.fromarray((np.clip(base, 0, 1) * 255).astype(np.uint8), "RGBA")
def frame(sheet, row, col, W=128, H=160): return sheet.crop((col * W, row * H, (col + 1) * W, (row + 1) * H))
def label(im, t):
    d = ImageDraw.Draw(im); d.text((4, 2), t, fill=(255, 220, 120)); return im
out = os.path.join(IA, "walk-rework", "preview"); os.makedirs(out, exist_ok=True)
# ---- player: idle, S (row 4), frame 0; head crop
SK = {"light": "#efc3a4", "deep": "#38221a"}; HEAD = (32, 42, 92, 102)   # 60 x 60 around the head
rows = []
for body in "ab":
    d = f"player-custom/sprites/body-{body}/player-{body}"
    for before in (True, False):
        cells = []
        for skin in ("light", "deep"):
            for f in range(1, 7):
                p = [(frame(img(f"{d}_body_idle.png", False), 4, 0), None), (frame(img(f"{d}_skin_idle.png", False), 4, 0), SK[skin]),
                     (frame(img(f"{d}_gi_idle.png", False), 4, 0), "#f2e9d8"), (frame(img(f"{d}_face-0{f}_idle.png", before), 4, 0), None),
                     (frame(img(f"{d}_hair-02_idle.png", False), 4, 0), "#3a2519")]
                h = comp(p).crop(HEAD); c = Image.new("RGBA", (60 * 4 + 6, 60 * 3 + 16), BG + (255,))
                c.alpha_composite(Image.alpha_composite(Image.new("RGBA", h.size, BG + (255,)), h), (2, 16))
                c.alpha_composite(Image.alpha_composite(Image.new("RGBA", h.size, BG + (255,)), h).resize((180, 180), Image.NEAREST), (64, 16))
                cells.append(label(c, f"body-{body} face-0{f} {skin}"))
        row = Image.new("RGBA", (len(cells) * 246, 196 + 16), (24, 22, 32, 255)); label(row, ("BEFORE (A7, main)" if before else "AFTER (earlier eyes back)") + f"  body-{body}")
        for k, c in enumerate(cells): row.alpha_composite(c, (k * 246, 16))
        rows.append(row)
sheet = Image.new("RGBA", (rows[0].width, sum(r.height for r in rows)), (24, 22, 32, 255)); y = 0
for r in rows: sheet.alpha_composite(r, (0, y)); y += r.height
sheet.convert("RGB").save(os.path.join(out, "eyes-before-after-player.png"))
# ---- kohai: body layer has the face baked in; S, SE, E, SW heads at 1x and 3x, plus the neutral portrait
J = json.load(open(os.path.join(IA, "dojo-people/sprites/kohai/kohai.json")))
cells = []
for before in (True, False):
    row = []
    for dn in ("S", "SE", "SW", "E"):
        r = J["directions"].index(dn)
        p = [(frame(img("dojo-people/sprites/kohai/kohai_body_idle.png", before), r, 0), None), (frame(img("dojo-people/sprites/kohai/kohai_gi_idle.png", before), r, 0), "#f2e9d8")]
        h = comp(p).crop((30, 44, 98, 112)); b = Image.alpha_composite(Image.new("RGBA", h.size, BG + (255,)), h)
        c = Image.new("RGBA", (68 + 204 + 8, 220), BG + (255,)); c.alpha_composite(b, (2, 16)); c.alpha_composite(b.resize((204, 204), Image.NEAREST), (74, 16))
        row.append(label(c, f"{'BEFORE' if before else 'AFTER'} kohai {dn}"))
    pt = img("dojo-people/portraits/kohai/kohai_portrait_neutral.png", before).resize((220, 220), Image.LANCZOS)
    pc = Image.new("RGBA", (220, 220), BG + (255,)); pc.alpha_composite(pt); row.append(label(pc, "portrait"))
    cells.append(row)
W = sum(c.width for c in cells[0]); k = Image.new("RGBA", (W, 440), (24, 22, 32, 255))
for i, row in enumerate(cells):
    x = 0
    for c in row: k.alpha_composite(c, (x, i * 220)); x += c.width
k.convert("RGB").save(os.path.join(out, "eyes-before-after-kohai.png"))
print("wrote eyes-before-after-player.png, eyes-before-after-kohai.png")
