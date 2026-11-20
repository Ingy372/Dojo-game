"""Nov 20 (Jay's photo of the real wall): repaints only the belts on textures/belt-creed.png, keeping every word pixel
for pixel (the board's fonts are not on this computer, so the text is not re-set). For each card it whites out the old
bar-and-bowtie, moves the words under the belt down a little where there is room, and draws a tied belt (make_textures.belt_bar)
in the card's own colour: one colour per belt, black stripe for the strip belts, knot and two hanging tails.
Run once on the original board:  python repaint_belts.py <in.png> <out.png>"""
import sys, json, os
import numpy as np
from PIL import Image, ImageDraw
import make_textures as M
HERE = os.path.dirname(os.path.abspath(__file__))
BB = json.load(open(os.path.join(HERE, "creed_text.json")))["belt_boards"]
src = Image.open(sys.argv[1]).convert("RGB"); a = np.array(src).astype(int); out = np.array(src)
W = 1500; pad = 14; bw = (W - 3 * pad) // 2; rows = [[0, 1], [2, 3], [4, 5], [6], [7, 8], [9]]; rh = [270, 270, 270, 280, 330, 300]
cards = []; y = pad
for ri, row in enumerate(rows):
    h = rh[ri]
    for ci, bi in enumerate(row):
        w = bw if len(row) == 2 else int(bw * 1.1); x = pad + ci * (bw + pad) if len(row) == 2 else (W - w) // 2
        cards.append((bi, x, y, w, h))
    y += h + pad
SS = 4; draws = []
for bi, x, y, w, h in cards:
    ink = (np.abs(a[y + 6:y + h - 6, x + 8:x + w - 8] - 255).sum(2) > 150).any(1)
    runs = []; s = None
    for i, on in enumerate(ink):
        r = y + 6 + i
        if on and s is None: s = r
        if not on and s is not None: runs.append((s, r - 1)); s = None
    if s is not None: runs.append((s, y + h - 7))
    sub = a[y + 5:y + h - 5, int(x + w * 0.28):int(x + w * 0.45)]
    full = [i + y + 5 for i, v in enumerate((np.abs(sub - 255).sum(2) > 60).mean(1)) if v > 0.97]
    cy = (full[0] + full[-1]) / 2
    k = next(i for i, (r0, r1) in enumerate(runs) if r0 <= cy <= r1)
    b0, b1 = runs[k]
    out[b0:b1 + 1, x + 8:x + w - 8] = 255                       # old bar and bowtie gone
    has_letter = bool(BB[bi]["letter"]); below = runs[k + 1:]
    letter = below[-1] if has_letter and below else None
    block = [r for r in below if r is not letter]
    limit = (letter[0] if letter else y + h - 8)
    shift = 0
    if block:
        shift = max(0, min(14, limit - block[-1][1] - 6))
        t0, t1 = block[0][0], block[-1][1]
        seg = np.array(src)[t0:t1 + 1, x + 8:x + w - 8].copy()
        out[t0:t1 + 1, x + 8:x + w - 8] = 255
        out[t0 + shift:t1 + 1 + shift, x + 8:x + w - 8] = seg
        nxt = t0 + shift
    else:
        nxt = limit
    tl = max(8, min(30, nxt - cy - 9))
    draws.append((x + w / 2, cy, w * 0.5, 15, BB[bi]["belt"], tl))
img = Image.fromarray(out)
lay = Image.new("RGBA", (W * SS, img.height * SS), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
for cx, cy, w, h, cols, tl in draws:
    M.belt_bar(d, cx * SS, cy * SS, w * SS, h * SS, cols, tl * SS)
lay = lay.resize(img.size, Image.LANCZOS)
img = img.convert("RGBA"); img.alpha_composite(lay); img.convert("RGB").save(sys.argv[2]); print("belt-creed repainted", img.size)
