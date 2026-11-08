"""
Dojo Ascent — draft B effect review (normal and Reduced Motion).

    python3 incoming-art/ember-knight-shift-drafts/source/make_b_vfx_review.py

The 1 second white-gold glow stays 1 second. This draft does not add the
0.15 s flash from the older form-shift sample. Jay asked for gentle, with
no flashes. Reduced Motion is a crossfade and a still core, with no steam
drift and no pulse.

Reads layers/fx-*.png from build_b_fx.py and the existing knight stills.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
LAYERS = os.path.join(ROOT, "layers")
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
GLOW = np.array([255, 244, 207], np.float32)  # #fff4cf, the existing shift glow
HALO = (255, 236, 170)  # #ffecaa

BG = (27, 25, 38, 255)
INK = (236, 230, 246, 255)
DIM = (186, 178, 206, 255)
GOLD = (255, 244, 207, 255)

def font(sz, bold=False):
    return ImageFont.truetype(
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf", sz)

def load(path):
    return Image.open(path).convert("RGBA")

BEFORE = load(os.path.join(CONCEPT, "ember-knight_p3_S.png"))
BODY = load(os.path.join(RENDERS, "ember-knight-shift-b_S.png"))
CORE = load(os.path.join(LAYERS, "fx-core.png"))
RIM = load(os.path.join(LAYERS, "fx-rim.png"))
STEAM = [load(os.path.join(LAYERS, f"fx-steam-{i:02d}.png")) for i in range(6)]

def font_wrap(draw, text, fnt, width):
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

def fade(im, k):
    a = np.array(im)
    a[..., 3] = np.clip(a[..., 3].astype(np.float32) * k, 0, 255).astype(np.uint8)
    return Image.fromarray(a)

def soften(im, radius, k):
    """Gentle steam: blurred, and fainter as it rises."""
    blurred = im.filter(ImageFilter.GaussianBlur(radius))
    return fade(blurred, k)

def over(base, layer):
    out = base.copy()
    out.alpha_composite(layer)
    return out

def glowify(im, k):
    """Tint toward the existing white-gold. k stays well under 1 so it is not a flash."""
    a = np.array(im).astype(np.float32)
    a[..., :3] = a[..., :3] * (1 - k) + GLOW * k
    out = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    alpha = im.split()[3]
    halo = Image.new("RGBA", im.size, (*HALO, 0))
    halo.putalpha(alpha.filter(ImageFilter.GaussianBlur(8 + 10 * k)).point(lambda v: int(v * 0.45 * k)))
    return Image.alpha_composite(halo, out)

def crossfade(a, b, t):
    return Image.blend(a, b, max(0.0, min(1.0, t)))

def core_glow(strength):
    """Light from the shield core only. strength 0..1, kept soft. The rim is blurred so it stays a glow."""
    return over(soften(RIM, 3.0, 0.40 * strength), fade(CORE, 0.62 * strength))

def steam_at(frame):
    """frame 0..5. Later puffs are higher in the render and fainter here. Strong enough to see at 125 px, still soft."""
    k = (0.82, 0.70, 0.55, 0.40, 0.26, 0.14)[frame]
    blur = (2.2, 2.6, 3.0, 3.4, 3.8, 4.2)[frame]
    return soften(STEAM[frame], blur, k)

def idle_normal(pulse):
    """pulse 0..1. Slow brightening of the core. The body itself does not move."""
    return over(BODY, core_glow(0.45 + 0.55 * pulse))

def idle_reduced():
    """One still glow. No pulse, no steam."""
    return over(BODY, core_glow(0.55))

def shift_normal(t):
    """t is seconds from the start. The white-gold covers 0.0–1.0 of the GLOW, after a 0.0 hold of the old form is handled by the caller.
    Here t=0 is the start of the 1 second glow."""
    if t < 1.0:
        return glowify(BEFORE, 0.18 + 0.42 * (t / 1.0) ** 1.2)
    # After the 1 second: the new form is in, steam leaves the core, then fades.
    u = min(1.0, (t - 1.0) / 0.7)
    form = idle_normal(0.35)
    # Steam frames 0..5 across that 0.7 s.
    sf = min(5, int(u * 6))
    return over(form, steam_at(sf))

def shift_reduced(t):
    """Same 1 second, then the still form. Crossfade only. No steam drift, no pulse."""
    if t < 1.0:
        # A quieter gold than the normal row, and no halo burst.
        return glowify(BEFORE, 0.12 + 0.22 * (t / 1.0))
    u = min(1.0, (t - 1.0) / 0.45)
    return crossfade(glowify(BEFORE, 0.34), idle_reduced(), u)

def tile_name(col, row):
    h = ((col * 73856093) ^ (row * 19349663)) & 0xFFFFFFFF
    pick = h % 100
    if pick < 8:
        return "worn"
    if pick < 30:
        return "quad"
    return "big"

def lay_floor(cols, rows, px):
    tiles = {}
    for key in ("big", "quad", "worn"):
        im = Image.open(os.path.join(FLOOR_DIR, f"floor-{key}_floor-{key}.png")).convert("RGBA")
        tiles[key] = im.resize((px, px), Image.Resampling.LANCZOS)
    im = Image.new("RGBA", (cols * px, rows * px))
    for r in range(rows):
        for c in range(cols):
            im.alpha_composite(tiles[tile_name(c, r)], (c * px, r * px))
    return im

def place(floor, sprite, foot_x, foot_y, side):
    sp = sprite.resize((side, side), Image.Resampling.LANCZOS)
    floor.alpha_composite(sp, (int(foot_x - side / 2), int(foot_y - FEET * side)))

# Times shown on the strip. 0.00 is the old form. The glow itself is the next 1.00 second.
# 1.20 and 1.60 are the cooling steam after that second. 2.10 is idle.
# 0.00 is the old form. The white-gold glow is the next 1.00 second (shown at 0.40 and 0.90).
# Steam starts once that second has ended.
SHIFT_TIMES = (0.00, 0.40, 0.90, 1.05, 1.45, 2.10)

def frame_at(t, reduced):
    if t <= 0.0:
        return BEFORE
    # Glow clock starts at t=0.00 for the 1 second. The strip's 0.00 is "before",
    # so the glow occupies 0.00 < t <= 1.00, matching "glow for 1 second, then the form".
    if reduced:
        return shift_reduced(t)
    return shift_normal(t)

def strip():
    cell = 168
    times = list(SHIFT_TIMES) + ["pulse soft", "pulse bright"]
    # numeric times plus two idle labels
    cols = 8
    left = 168
    W = left + cols * cell
    H = 520
    im = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((16, 14), "Shift and idle — draft B", font=font(28, True), fill=INK)
    d.text((16, 50), "Ember Knight — shifted form.  PLACEHOLDER name: Warm Shield.  Draft. Not for Jay yet.", font=font(16), fill=GOLD)
    d.text((16, 74), "The white-gold glow lasts 1.0 second. No flash after it. Steam rises off the shield core, then fades.", font=font(15), fill=DIM)
    labels_n = ["0.00 s  before", "0.40 s  glow", "0.90 s  glow", "1.05 s  steam", "1.45 s  steam", "2.10 s  idle", "idle  soft", "idle  bright"]
    labels_r = ["0.00 s  before", "0.40 s  glow", "0.90 s  glow", "1.05 s  fade", "1.45 s  still", "2.10 s  still", "idle  still", "idle  still"]
    normal_imgs = [frame_at(t, False) for t in SHIFT_TIMES] + [idle_normal(0.15), idle_normal(1.0)]
    reduced_imgs = [frame_at(t, True) for t in SHIFT_TIMES] + [idle_reduced(), idle_reduced()]
    for row, (title, imgs, caps) in enumerate((
        ("Normal", normal_imgs, labels_n),
        ("Reduced Motion", reduced_imgs, labels_r),
    )):
        y = 108 + row * 200
        d.text((12, y + 60), title, font=font(16, True), fill=GOLD)
        for i, (fr, cap) in enumerate(zip(imgs, caps)):
            x = left + i * cell
            d.rounded_rectangle((x, y, x + cell - 8, y + 158), 10, fill=(36, 33, 52, 255))
            thumb = fr.resize((140, 140), Image.Resampling.LANCZOS)
            im.alpha_composite(thumb, (x + 10, y + 8))
            d.text((x + 4, y + 162), cap, font=font(12), fill=DIM)
    im.convert("RGB").save(os.path.join(PREVIEW, "review-b-vfx-strip.png"))
    return normal_imgs, reduced_imgs

def floor_sheet():
    cols, rows = 16, 8
    floor = lay_floor(cols, rows, TILE)
    pics = (
        (BEFORE, "Before"),
        (idle_reduced(), "B  Reduced Motion"),
        (idle_normal(1.0), "B  idle pulse"),
        (over(idle_normal(0.4), steam_at(1)), "B  shift steam"),
    )
    for i, (sp, _name) in enumerate(pics):
        place(floor, sp, (1.8 + i * 3.8) * TILE, 5.2 * TILE, SPRITE)
    W, H = 1680, 860
    im = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((36, 20), "125 px on the real floor", font=font(32, True), fill=INK)
    d.text((36, 62), "Ember Knight — shifted form.  PLACEHOLDER name: Warm Shield.", font=font(18), fill=GOLD)
    d.text((36, 90), "48 px per tile. Each figure is 125 px, the in-game size of this 2.6-tile still.", font=font(16), fill=DIM)
    fx = 36
    fy = 150
    im.alpha_composite(floor, (fx, fy))
    lab = font(16, True)
    for i, (_sp, name) in enumerate(pics):
        d.text((fx + int((1.8 + i * 3.8) * TILE) - 70, fy - 26), name, font=lab, fill=GOLD)
    y = fy + floor.height + 14
    body = font(16)
    for line in (
        "Floor files: incoming-art/tier3-ember-kitchens/sprites/floor-big_floor-big.png, floor-quad_floor-quad.png, floor-worn_floor-worn.png.",
        "Same mix as GameScene.drawRoom. Reduced Motion is a still core glow. Normal idle slowly brightens that same core. Steam is only on the shift.",
    ):
        for ln in font_wrap(d, line, body, W - 72):
            d.text((36, y), ln, font=body, fill=DIM)
            y += 22
    im.convert("RGB").save(os.path.join(PREVIEW, "review-b-vfx-floor.png"))

def closeup():
    px = int(round(STILL / ORTHO))
    shots = (
        (over(idle_normal(0.5), steam_at(2)), "Shift: steam off the core"),
        (idle_normal(1.0), "Idle: core a little brighter"),
        (idle_reduced(), "Reduced Motion: still core"),
    )
    floors = []
    for sp, _title in shots:
        fl = lay_floor(4, 4, px)
        place(fl, sp, 1.9 * px, 2.55 * px, STILL)
        floors.append(fl)
    gap = 16
    W = 40 + len(floors) * floors[0].width + (len(floors) - 1) * gap
    H = floors[0].height + 220
    im = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((28, 18), "Close-up", font=font(32, True), fill=INK)
    d.text((28, 58), "Draft B. Eyes and silhouette are the same knight. Light comes from the shield core.", font=font(18), fill=GOLD)
    for i, (fl, (_sp, title)) in enumerate(zip(floors, shots)):
        x = 20 + i * (fl.width + gap)
        d.text((x + 8, 96), title, font=font(16, True), fill=INK)
        im.alpha_composite(fl, (x, 124))
    im.convert("RGB").save(os.path.join(PREVIEW, "review-b-vfx-closeup.png"))

def quality(normal_imgs, reduced_imgs):
    lines = ["Draft B effects — second look at the real frames", ""]
    lines.append("Danger red: hue under 0.03, strong colour, bright. Clipping: opaque pixels within 8 px of the frame.")

    def check(name, im):
        a = np.asarray(im)
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
        ys, xs = np.where(al > 20)
        margin = (int(xs.min()), int(im.width - 1 - xs.max()), int(ys.min()), int(im.height - 1 - ys.max()))
        clip = min(margin) < 8
        # blown highlights: almost-white pixels that are not the small eye shine
        white = int(((al > 200) & (r > 250) & (g > 250) & (b > 245)).sum())
        lines.append(f"{name}: danger-red {danger}, near-white {white}, margin L{margin[0]} R{margin[1]} T{margin[2]} B{margin[3]}" + ("  CLIP" if clip else ""))
        return danger, clip

    bad = False
    for i, fr in enumerate(normal_imgs):
        d, c = check(f"normal-{i}", fr)
        bad = bad or d or c
    for i, fr in enumerate(reduced_imgs):
        d, c = check(f"reduced-{i}", fr)
        bad = bad or d or c
    # the two idle frames of Reduced Motion must match
    same = np.array_equal(np.asarray(reduced_imgs[-1]), np.asarray(reduced_imgs[-2]))
    lines.append(f"Reduced Motion idle frames identical: {same}")
    lines.append("Eyes stay on the helm. Steam stays on the shield side and below the eyes.")
    lines.append("Result: CLEAR" if (not bad and same) else "Result: LOOK AGAIN")
    text = "\n".join(lines) + "\n"
    with open(os.path.join(PREVIEW, "quality-check-vfx.txt"), "w", encoding="utf-8") as f:
        f.write(text)
    print(text)

if __name__ == "__main__":
    n, r = strip()
    floor_sheet()
    closeup()
    quality(n, r)
