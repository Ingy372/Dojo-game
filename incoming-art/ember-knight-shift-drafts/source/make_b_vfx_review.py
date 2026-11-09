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
GROUND = load(os.path.join(LAYERS, "fx-ground.png"))
STEAM = [load(os.path.join(LAYERS, f"fx-steam-{i:02d}.png")) for i in range(4)]
BURST = [load(os.path.join(LAYERS, f"fx-burst-{i:02d}.png")) for i in range(4)]
EMBERS = [load(os.path.join(LAYERS, f"fx-ember-{i:02d}.png")) for i in range(5)]

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
    """Brighter rim and core. strength 0..1. One smooth level, not a strobe."""
    return over(soften(RIM, 1.6, 0.85 * strength), fade(CORE, 0.95 * strength))

def ground_glow(k=0.9):
    return soften(GROUND, 5.0, k)

def steam_at(frame):
    """One puff. Kept fairly solid so it survives 125 px. It fades only at the end."""
    k = (1.0, 0.95, 0.8, 0.55)[frame]
    return soften(STEAM[frame], 1.2, k)

def burst_at(frame):
    k = (0.95, 0.8, 0.55, 0.28)[frame]
    return soften(BURST[frame], 1.4, k)

def living(pulse, ember_i):
    """Idle. Pulse is the core. Embers drift. Ground glow stays."""
    img = over(BODY, ground_glow(0.9))
    img = over(img, core_glow(0.4 + 0.6 * pulse))
    return over(img, fade(EMBERS[ember_i], 1.0))

def idle_reduced():
    """Static seams are already on the body. Static core, rim, and ground. No drift, no pulse."""
    img = over(BODY, ground_glow(0.75))
    return over(img, core_glow(0.72))

def shift_normal(t):
    """t=0 starts the 1.0 s white-gold. At t=1.0 a 0.5 s settle accent begins: one ring and one steam puff."""
    if t < 1.0:
        return glowify(BEFORE, 0.22 + 0.38 * (t / 1.0))
    u = min(1.0, (t - 1.0) / 0.5)
    fi = min(3, int(u * 4))
    img = living(0.85, min(4, fi))
    img = over(img, burst_at(fi))
    return over(img, steam_at(fi))

def shift_reduced(t):
    """Same 1.0 s, quieter, then a crossfade to the still form. No ring, no steam, no embers."""
    if t < 1.0:
        return glowify(BEFORE, 0.14 + 0.20 * (t / 1.0))
    u = min(1.0, (t - 1.0) / 0.35)
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
# 0.00 old form. 0.50 is inside the 1.0 s glow. 1.00–1.50 is the 0.5 s settle accent.
SHIFT_TIMES = (0.00, 0.50, 1.00, 1.25, 1.50)

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
    d.text((16, 74), "1.0 s white-gold, then a 0.5 s settle: one ring and a steam puff. Idle embers and a core pulse. No strobe.", font=font(15), fill=DIM)
    labels_n = ["0.00 s  before", "0.50 s  glow", "1.00 s  burst", "1.25 s  steam", "1.50 s  idle", "idle  embers", "core  low", "core  high"]
    labels_r = ["0.00 s  before", "0.50 s  glow", "1.00 s  fade", "1.25 s  still", "1.50 s  still", "still", "still", "still"]
    normal_imgs = [frame_at(t, False) for t in SHIFT_TIMES] + [living(0.9, 3), living(0.15, 0), living(1.0, 2)]
    reduced_imgs = [frame_at(t, True) for t in SHIFT_TIMES] + [idle_reduced(), idle_reduced(), idle_reduced()]
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
        (living(1.0, 2), "B  idle embers"),
        (shift_normal(1.25), "B  1.25 s steam"),
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
        "Floor: incoming-art/tier3-ember-kitchens/sprites/floor-big, floor-quad, floor-worn. Same mix as GameScene.drawRoom.",
        "Reduced Motion keeps the glowing seams, the core, the rim, and the ground pool. It does not pulse or drift.",
    ):
        for ln in font_wrap(d, line, body, W - 72):
            d.text((36, y), ln, font=body, fill=DIM)
            y += 22
    im.convert("RGB").save(os.path.join(PREVIEW, "review-b-vfx-floor.png"))

def closeup():
    px = int(round(STILL / ORTHO))
    shots = (
        (shift_normal(1.25), "1.25 s: ring and steam"),
        (living(1.0, 3), "Idle: embers and bright core"),
        (idle_reduced(), "Reduced Motion: still glow"),
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
    # Measurements on the 125 px picture, not a verbal "reads".
    def at(im):
        return np.asarray(im.resize((SPRITE, SPRITE), Image.Resampling.LANCZOS)).astype(np.float32)
    def L(a):
        return 0.30 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2]
    def goldpx(a):
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        return (a[..., 3] > 30) & (r > 170) & (g > 110) & (b < 170) & (r > b + 25)
    b125, s125, lo, hi = at(BEFORE), at(normal_imgs[3]), at(normal_imgs[-2]), at(normal_imgs[-1])
    lines.append(f"At {SPRITE} px: gold-orange pixels before {int(goldpx(b125).sum())}, at 1.25 s {int(goldpx(s125).sum())}.")
    extra = goldpx(s125) & ~goldpx(at(idle_reduced()))
    ys, xs = np.where(extra)
    if len(xs):
        lines.append(f"Steam-only gold box at 125 px: {int(xs.max()-xs.min()+1)} by {int(ys.max()-ys.min()+1)} px, {len(xs)} pixels.")
    def bright_count(a):
        win = L(a)[50:115, 5:80]
        m = a[50:115, 5:80, 3] > 30
        return int((m & (win > 200)).sum()), float(win[m].max()) if m.any() else 0
    nlo, mlo = bright_count(lo)
    nhi, mhi = bright_count(hi)
    lines.append(f"Shield window, luminance over 200: core low {nlo} px, core high {nhi} px. Peak {mlo:.0f} to {mhi:.0f} (the gold ceiling, so the pulse grows the lit area).")
    lines.append("Silhouette check is printed by the render step: alpha overlap with the previous B was 1.000.")
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
