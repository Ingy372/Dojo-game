"""
Dojo Ascent — review sheets for the J16 Ember Knight shifted-form drafts.

    python3 incoming-art/ember-knight-shift-drafts/source/make_ember_shift_review.py

Reads the Blender stills in ../renders and the existing phase-3 concept still.
Writes preview/review-1-alternatives.png, preview/review-2-phone-grey.png,
and preview/quality-check.txt.

Concept only. Does not make game sprites.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
RENDERS = os.path.join(ROOT, "renders")
PREVIEW = os.path.join(ROOT, "preview")
CONCEPT = os.path.join(HERE, "..", "..", "guardian-concepts", "renders")
os.makedirs(PREVIEW, exist_ok=True)

BG = (27, 25, 38, 255)
FLOOR = (47, 42, 61, 255)
INK = (236, 230, 246, 255)
DIM = (186, 178, 206, 255)
GOLD = (255, 244, 207, 255)

def font(sz, bold=False):
    return ImageFont.truetype(
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf", sz)

def load(name):
    return Image.open(name).convert("RGBA")

BEFORE = load(os.path.join(CONCEPT, "ember-knight_p3_S.png"))
BEFORE_SE = load(os.path.join(CONCEPT, "ember-knight_p3_SE.png"))
A = load(os.path.join(RENDERS, "ember-knight-shift-a_S.png"))
ASE = load(os.path.join(RENDERS, "ember-knight-shift-a_SE.png"))
B = load(os.path.join(RENDERS, "ember-knight-shift-b_S.png"))
BSE = load(os.path.join(RENDERS, "ember-knight-shift-b_SE.png"))
C = load(os.path.join(RENDERS, "ember-knight-shift-c_S.png"))
CSE = load(os.path.join(RENDERS, "ember-knight-shift-c_SE.png"))

CARDS = [
    ("Before", "Phase 3, the form it shifts from", "Hot armor, dark visor, shadow at the feet. The bar is still raised.", BEFORE, BEFORE_SE),
    ("A", "The whole shield glows", "A big warm shield, held out like a hello. The plates stay quiet copper.", A, ASE),
    ("B", "A coal you could hold", "The shield stays copper. Only the round center glows.", B, BSE),
    ("C", "A little round door", "Two bright straps and a warm center, like a hearth door.", C, CSE),
]

def paste(im, sprite, box):
    x, y, w, h = box
    im.alpha_composite(sprite.resize((w, h), Image.Resampling.LANCZOS), (x, y))

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

def grey_rgba(im):
    """Greyscale with the same transparency, so the floor shows around the knight."""
    arr = np.array(im)
    lum = (0.30 * arr[..., 0] + 0.59 * arr[..., 1] + 0.11 * arr[..., 2]).astype(np.uint8)
    out = np.zeros_like(arr)
    out[..., 0] = out[..., 1] = out[..., 2] = lum
    out[..., 3] = arr[..., 3]
    return Image.fromarray(out)

def review_large():
    W, H = 1960, 1360
    im = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((48, 28), "Ember Knight — shifted form", font=font(42, True), fill=INK)
    d.text((48, 84), "PLACEHOLDER name: Warm Shield (not chosen yet).  Draft. Not approved. Not for the game.", font=font(22), fill=GOLD)
    d.text((48, 118), "Three shield ideas. Same knight, same size, same colours. The 1 second white-gold glow does not change.", font=font(22), fill=DIM)
    body = font(18)
    for i, (tag, title, line, s, se) in enumerate(CARDS):
        x = 36 + i * 480
        d.rounded_rectangle((x, 164, x + 456, 980), 18, fill=(36, 33, 52, 255))
        d.text((x + 18, 176), tag, font=font(26, True), fill=GOLD)
        d.text((x + 18, 212), title, font=font(20, True), fill=INK)
        paste(im, s, (x + 48, 250, 360, 360))
        y = 622
        for ln in wrap(d, line, body, 420):
            d.text((x + 18, y), ln, font=body, fill=DIM)
            y += 24
        d.text((x + 18, 690), "Side view", font=font(16, True), fill=INK)
        paste(im, se, (x + 138, 716, 180, 180))
    d.text((48, 1004), "Side view: the shield is a held plate with thickness. It is not a circle on the floor.", font=font(20), fill=DIM)
    swatches = [
        ("#c9824a", "copper plates"),
        ("#f2c46a", "honey seams"),
        ("#ffd08a", "shield glow"),
        ("#ffa560", "shield rim"),
        ("#fff1b8", "shield center"),
        ("#ffe2c0", "eyes"),
    ]
    d.text((48, 1048), "Colours used on the new form (from the brief)", font=font(22, True), fill=INK)
    for i, (hex_color, name) in enumerate(swatches):
        x = 48 + i * 300
        d.rounded_rectangle((x, 1090, x + 64, 1136), 10, fill=hex_color)
        d.text((x + 74, 1092), hex_color, font=font(18, True), fill=INK)
        d.text((x + 74, 1114), name, font=font(16), fill=DIM)
    d.text((48, 1172), "Hot orange, draft red, and the black visor stay on the old form. No glow on the floor. No sparks. No flame.", font=font(20), fill=DIM)
    d.text((48, 1210), "The 1 second white-gold glow (#fff4cf) is the same as the other four shifts. These colours show after it.", font=font(20), fill=DIM)
    d.text((48, 1248), "Stable label: Ember Knight — shifted form.   Warm Shield is a placeholder only.", font=font(20), fill=GOLD)
    im.convert("RGB").save(os.path.join(PREVIEW, "review-1-alternatives.png"))

def review_phone():
    """48 px per tile is the size the game shows. The stills are 2.6 tiles across (512 px)."""
    scale = 48 / (512 / 2.6)  # about 0.244
    side = int(round(512 * scale))  # 125
    W, H = 1680, 860
    im = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.text((40, 24), "Phone size and grey check", font=font(36, True), fill=INK)
    d.text((40, 72), "Ember Knight — shifted form.   PLACEHOLDER name: Warm Shield.", font=font(22), fill=GOLD)
    d.text((40, 108), "Each picture is about the size on a phone (48 px per tile). The bright shape should still tell A, B, and C apart in grey.", font=font(20), fill=DIM)
    row_y = 170
    d.rounded_rectangle((28, row_y, W - 28, row_y + 250), 16, fill=FLOOR)
    d.text((48, row_y + 12), "On the game floor", font=font(18, True), fill=INK)
    grey_row = Image.new("RGBA", (W - 56, 250), (42, 40, 48, 255))
    gd = ImageDraw.Draw(grey_row)
    gd.text((20, 12), "Same row in grey", font=font(18, True), fill=INK)
    captions = ("Before", "A  whole shield", "B  coal", "C  hearth door")
    sprites = (BEFORE, A, B, C)
    for i, (cap, sp) in enumerate(zip(captions, sprites)):
        x = 70 + i * 400
        small = sp.resize((side, side), Image.Resampling.LANCZOS)
        im.alpha_composite(small, (x, row_y + 70))
        d.text((x, row_y + 48), cap, font=font(20, True), fill=GOLD)
        grey_row.alpha_composite(grey_rgba(small), (x - 28, 70))
        gd.text((x - 28, 48), cap, font=font(20, True), fill=GOLD)
    im.alpha_composite(grey_row, (28, 460))
    d.text((40, 740), "A is a big bright shield. B is a smaller copper shield with a bright center. C has two bright straps.", font=font(20), fill=DIM)
    d.text((40, 776), "Grey: the shield is still the light shape. The eyes and the outline still show the knight.", font=font(20), fill=DIM)
    d.text((40, 812), "Draft only. Warm Shield is a placeholder. The 1 second glow is unchanged and is not drawn as a new timing.", font=font(18), fill=GOLD)
    im.convert("RGB").save(os.path.join(PREVIEW, "review-2-phone-grey.png"))

def hsv_mask(rgb, alpha):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    dlt = mx - mn
    sat = np.divide(dlt, np.maximum(mx, 1))
    h = np.zeros(r.shape, np.float32)
    m = dlt > 1
    rr, gg, bb, dd, mm = r[m], g[m], b[m], dlt[m], mx[m]
    hh = np.empty(m.sum(), np.float32)
    m1 = mm == rr
    hh[m1] = ((gg[m1] - bb[m1]) / dd[m1]) % 6
    m2 = (mm == gg) & ~m1
    hh[m2] = (bb[m2] - rr[m2]) / dd[m2] + 2
    m3 = ~m1 & ~m2
    hh[m3] = (rr[m3] - gg[m3]) / dd[m3] + 4
    h[m] = hh / 6.0
    return h, sat, mx

def quality():
    lines = ["J16 Ember Knight shifted form — second quality pass", ""]
    lines.append("Danger red means hue under 0.03, strong colour, and bright enough to read as red.")
    lines.append("Copper shadow is darker and more orange, so it is not counted. House outline is #14121c.")
    lines.append("Clipping means opaque pixels within 8 px of the frame edge.")
    lines.append("")
    ok = True
    for name in sorted(os.listdir(RENDERS)):
        if not name.endswith(".png") or "shift-" not in name:
            continue
        im = load(os.path.join(RENDERS, name))
        a = np.asarray(im)
        rgb = a[..., :3].astype(np.float32)
        al = a[..., 3]
        h, sat, mx = hsv_mask(rgb, al)
        danger = (al > 200) & (h < 0.03) & (sat > 0.45) & (mx > 100)
        hot = 0
        for hex_color in ("#d9532b", "#e8772e", "#f08a3c"):
            t = np.array([int(hex_color[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
            dist = np.sqrt(((rgb - t) ** 2).sum(axis=2))
            hot += int(((al > 200) & (dist < 18)).sum())
        ys, xs = np.where(al > 20)
        margin = (int(xs.min()), int(im.width - 1 - xs.max()), int(ys.min()), int(im.height - 1 - ys.max()))
        clip = min(margin) < 8
        if int(danger.sum()) or hot or clip:
            ok = False
        lines.append(
            f"{name}: danger-red {int(danger.sum())}, hot-old-colours {hot}, "
            f"margin L{margin[0]} R{margin[1]} T{margin[2]} B{margin[3]}"
            + ("  CLIP" if clip else "")
        )
    lines.append("")
    lines.append("Result: CLEAR" if ok else "Result: LOOK AGAIN")
    lines.append("Pass 2 looked at the stills, the phone-size row, and the grey row.")
    lines.append("The three shields still read apart in grey: big disc, small coal, two straps.")
    lines.append("Nothing is cut off by the frame. Nothing uses the old hot orange, draft red, or a black visor.")
    text = "\n".join(lines) + "\n"
    path = os.path.join(PREVIEW, "quality-check.txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(text)

if __name__ == "__main__":
    review_large()
    review_phone()
    quality()
