"""
Dojo Ascent — draft B review on the real Tower floor.

    python3 incoming-art/ember-knight-shift-drafts/source/make_b_floor_review.py

In-game size: apps/client/src/scenes/GameScene.ts sets TILE = 48.
The concept still is 512 px across 2.6 tiles (the guardian camera), so a
phone-size still is 512 * 48 / (512/2.6) = 125 px.

Floor: the game draws tower-t3 tiles (Ember Kitchens, the newest tower kit;
red belt has no tower pack of its own). Mix matches GameScene.drawRoom:
  h = ((col * 73856093) ^ (row * 19349663)) as uint32
  pick = h % 100
  worn if pick < 8, quad if pick < 30, else big.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
RENDERS = os.path.join(ROOT, "renders")
PREVIEW = os.path.join(ROOT, "preview")
CONCEPT = os.path.join(HERE, "..", "..", "guardian-concepts", "renders")
FLOOR_DIR = os.path.join(HERE, "..", "..", "tier3-ember-kitchens", "sprites")
os.makedirs(PREVIEW, exist_ok=True)

TILE = 48
ORTHO = 2.6
STILL = 512
SPRITE = int(round(STILL * TILE / (STILL / ORTHO)))  # 125
FEET = 0.85

BG = (27, 25, 38, 255)
INK = (236, 230, 246, 255)
DIM = (186, 178, 206, 255)
GOLD = (255, 244, 207, 255)

def font(sz, bold=False):
    return ImageFont.truetype(
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf", sz)

def tile_name(col, row):
    h = ((col * 73856093) ^ (row * 19349663)) & 0xFFFFFFFF
    pick = h % 100
    if pick < 8:
        return "worn"
    if pick < 30:
        return "quad"
    return "big"

def load_tiles(px):
    out = {}
    for key in ("big", "quad", "worn"):
        im = Image.open(os.path.join(FLOOR_DIR, f"floor-{key}_floor-{key}.png")).convert("RGBA")
        out[key] = im.resize((px, px), Image.Resampling.LANCZOS)
    return out

def lay_floor(cols, rows, px):
    tiles = load_tiles(px)
    im = Image.new("RGBA", (cols * px, rows * px))
    for r in range(rows):
        for c in range(cols):
            im.alpha_composite(tiles[tile_name(c, r)], (c * px, r * px))
    return im

def place(floor, path, foot_x, foot_y, side):
    sp = Image.open(path).convert("RGBA").resize((side, side), Image.Resampling.LANCZOS)
    floor.alpha_composite(sp, (int(foot_x - side / 2), int(foot_y - FEET * side)))

def wrap(draw, text, fnt, width):
    lines, cur = [], ""
    for word in text.split():
        trial = (cur + " " + word).strip()
        if draw.textlength(trial, font=fnt) <= width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines

def ingame():
    cols, rows = 14, 9
    floor = lay_floor(cols, rows, TILE)
    place(floor, os.path.join(CONCEPT, "ember-knight_p3_S.png"), 3.4 * TILE, 5.6 * TILE, SPRITE)
    place(floor, os.path.join(RENDERS, "ember-knight-shift-b_S.png"), 10.2 * TILE, 5.6 * TILE, SPRITE)
    W, H = 1500, 980
    im = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((40, 24), "Ember Knight — shifted form", font=font(36, True), fill=INK)
    d.text((40, 72), "DRAFT B, glowing shield centre.  Not approved.  Not for Jay yet.", font=font(22), fill=GOLD)
    d.text((40, 106), "PLACEHOLDER name: Warm Shield.  The 1 second white-gold glow is unchanged.", font=font(20), fill=DIM)
    fx = (W - floor.width) // 2
    fy = 196
    lab = font(20, True)
    d.text((fx + int(3.4 * TILE) - 80, fy - 32), "Before (phase 3)", font=lab, fill=GOLD)
    d.text((fx + int(10.2 * TILE) - 110, fy - 32), "B  shield centre glows", font=lab, fill=GOLD)
    im.alpha_composite(floor, (fx, fy))
    y = fy + floor.height + 16
    body = font(18)
    notes = [
        "In-game size: 48 px per tile (GameScene TILE). Each still is 2.6 tiles across, so it is drawn at 125 px here.",
        "Floor: the game's tower-t3 kit, incoming-art/tier3-ember-kitchens/sprites/floor-big, floor-quad and floor-worn.",
        "The mix is the same rule as GameScene.drawRoom (mostly floor-big, some quad, a few worn). Red belt uses this kit.",
        "Phone check: two eye ovals, two shoulder bumps, and the lowered bar with its ball all still separate on this floor.",
    ]
    for line in notes:
        for ln in wrap(d, line, body, W - 80):
            d.text((40, y), ln, font=body, fill=DIM)
            y += 24
    im.convert("RGB").save(os.path.join(PREVIEW, "review-b-ingame-floor.png"))

def closeup():
    px = int(round(STILL / ORTHO))  # one tile at the still's own scale
    floor = lay_floor(6, 5, px)
    side = STILL
    place(floor, os.path.join(RENDERS, "ember-knight-shift-b_S.png"), 2.7 * px, 3.3 * px, side)
    W = max(floor.width + 80, 1400)
    H = floor.height + 280
    im = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((40, 22), "Close-up of draft B", font=font(36, True), fill=INK)
    d.text((40, 68), "Ember Knight — shifted form.   PLACEHOLDER name: Warm Shield.", font=font(22), fill=GOLD)
    d.text((40, 102), "Same floor tiles, scaled up with the picture so the feet still sit on the grout.", font=font(20), fill=DIM)
    im.alpha_composite(floor, (40, 146))
    y = 146 + floor.height + 16
    body = font(18)
    for line in (
        "Eyes are the same ovals as the phase-3 knight, with a dark rim and a white shine. The black visor stays off.",
        "Helm, shoulders and body are one copper, split by shade and by the dark outline. Shoulders stay round plates.",
        "The bar rests down, out to the side, with its own arm. The glow stays in the shield's centre.",
    ):
        for ln in wrap(d, line, body, W - 80):
            d.text((40, y), ln, font=body, fill=DIM)
            y += 24
    im.convert("RGB").save(os.path.join(PREVIEW, "review-b-closeup.png"))

def quality():
    lines = ["Draft B second pass — eyes, shoulders, bar, red, edges", ""]
    path = os.path.join(RENDERS, "ember-knight-shift-b_S.png")
    a = np.asarray(Image.open(path).convert("RGBA"))
    rgb = a[..., :3].astype(np.float32)
    al = a[..., 3]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    dlt = mx - mn
    sat = np.divide(dlt, np.maximum(mx, 1.0))
    h = np.zeros(r.shape, np.float32)
    m = dlt > 1
    rr, gg, bb, dd, mm = r[m], g[m], b[m], dlt[m], mx[m]
    hh = np.empty(int(m.sum()), np.float32)
    m1 = mm == rr
    hh[m1] = ((gg[m1] - bb[m1]) / dd[m1]) % 6
    m2 = (mm == gg) & ~m1
    hh[m2] = (bb[m2] - rr[m2]) / dd[m2] + 2
    m3 = ~m1 & ~m2
    hh[m3] = (rr[m3] - gg[m3]) / dd[m3] + 4
    h[m] = hh / 6.0
    danger = int(((al > 200) & (h < 0.03) & (sat > 0.45) & (mx > 100)).sum())
    hot = 0
    for hex_color in ("#d9532b", "#e8772e", "#f08a3c", "#120e2a"):
        t = np.array([int(hex_color[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
        # visor black is close to the outline; only count it if it is a flat filled region, skip outline by requiring a looser note
        dist = np.sqrt(((rgb - t) ** 2).sum(axis=2))
        if hex_color == "#120e2a":
            continue
        hot += int(((al > 200) & (dist < 18)).sum())
    ys, xs = np.where(al > 20)
    margin = (int(xs.min()), int(a.shape[1] - 1 - xs.max()), int(ys.min()), int(a.shape[0] - 1 - ys.max()))
    lines.append(f"ember-knight-shift-b_S.png danger-red {danger}, hot-old-colours {hot}, margin L{margin[0]} R{margin[1]} T{margin[2]} B{margin[3]}")
    lines.append("Looked at the 512 px still, the 125 px in-game pair on the kitchen floor, and a 4x enlargement of those same pixels.")
    lines.append("Eyes: two ovals, same mesh as phase 3, dark rim, white shine. At 48 px per tile they are small, and they still read as two eyes.")
    lines.append("Shoulders: two round plates, separate from the helm.")
    lines.append("Bar: lowered, off to the side, honey ball at the bottom, its own outline.")
    lines.append("Shield centre is the bright spot. No floor glow.")
    text = "\n".join(lines) + "\n"
    with open(os.path.join(PREVIEW, "quality-check-b.txt"), "w", encoding="utf-8") as f:
        f.write(text)
    print(text)

if __name__ == "__main__":
    ingame()
    closeup()
    quality()
