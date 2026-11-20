"""Builds the flat textures the main-floor scene lays on its walls and floor (Pillow + numpy + scipy). Run from anywhere:
    python3 make_textures.py
 - textures/logo-mark.png : Jay's own school logo (incoming-art/badges-trophies-a3c/source/jay-logo/logo-white.jpg), cropped, the white
   OUTSIDE the ring made transparent (the white inside the ring stays). Nothing is redrawn: it is his artwork.
 - textures/class-creed.png, textures/belt-creed.png : the wall boards, set from creed_text.json (words transcribed from his photos).
 - textures/us-flag.png : a plain US flag (13 stripes, 50 stars).
No photograph or crop of a photograph is used or written."""
import os, json, numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); TX = os.path.join(HERE, "textures"); os.makedirs(TX, exist_ok=True)
LOGO = os.path.join(HERE, "..", "..", "badges-trophies-a3c", "source", "jay-logo", "logo-white.jpg")
FB = "/usr/share/fonts/truetype/sand-box/google/Be Vietnam Pro/BeVietnamPro-Black.ttf"
FS = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"; FSB = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
RED, INK = (190, 30, 36), (24, 22, 28)
def font(p, s): return ImageFont.truetype(p, int(s))

def make_logo():
    a = np.asarray(Image.open(LOGO).convert("RGB")).astype(int); lum = a.min(axis=2)
    dark = lum < 200; ys, xs = np.nonzero(dark); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    pad = 6; a = a[y0 - pad:y1 + pad + 1, x0 - pad:x1 + pad + 1]; lum = a.min(axis=2)
    white = lum > 235; lab, n = ndimage.label(white)
    ext = np.isin(lab, np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) & white
    band = ndimage.binary_dilation(ext, iterations=2) & ~ext
    alpha = np.where(ext, 0, 255).astype(np.uint8); alpha[band] = np.clip(255 - lum[band] * 1.0, 0, 255)
    rgb = a.astype(np.uint8).copy(); rgb[band] = (rgb[band] * 0.3).astype(np.uint8)
    im = Image.fromarray(np.dstack([rgb, alpha]), "RGBA"); w = 1000; im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(os.path.join(TX, "logo-mark.png")); print("logo-mark", im.size)

def wrap(d, s, f, wmax):
    out, cur = [], ""
    for w in s.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= wmax: cur = t
        else: out.append(cur); cur = w
    if cur: out.append(cur)
    return out
def center(d, y, s, f, W, fill):
    d.text(((W - d.textlength(s, font=f)) / 2, y), s, font=f, fill=fill)
def fit(d, s, p, size, wmax):
    while d.textlength(s, font=font(p, size)) > wmax and size > 8: size -= 1
    return font(p, size)
def belt_bar(d, cx, cy, w, h, cols, tl=None):
    """a tied belt like the real wall (Jay's photo, Nov 20): one colour (a black stripe down the middle for the
    red/black and brown/black strip belts), a square knot in the middle and two tails hanging down in a V"""
    PAL = {"white": (244, 241, 232), "yellow": (245, 196, 30), "orange": (240, 118, 30), "green": (22, 96, 50), "blue": (30, 50, 150), "red": (196, 28, 34),
           "brown": (66, 38, 26), "black": (28, 28, 34)}
    base = {"redblack": "red", "brownblack": "brown"}.get(cols[0], cols[0]); col = PAL[base]
    stripe = cols[0] in ("redblack", "brownblack")
    ol = (40, 40, 40) if base in ("white", "yellow") else tuple(max(0, int(c * 0.55)) for c in col)
    lw = max(2, int(h * 0.14))
    def band(poly):
        d.polygon(poly, fill=col, outline=ol); d.line(poly + [poly[0]], fill=ol, width=lw)
    # the belt across
    band([(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w / 2, cy + h / 2), (cx - w / 2, cy + h / 2)])
    if stripe: d.rectangle([cx - w / 2 + lw, cy - h * 0.13, cx + w / 2 - lw, cy + h * 0.13], fill=PAL["black"])
    # two tails hanging down and out from the knot
    tl, tw = (tl if tl is not None else h * 2.0), h * 0.9
    for sgn in (-1, 1):
        x0, y0 = cx + sgn * h * 0.25, cy + h * 0.2; x1, y1 = cx + sgn * h * 1.35, cy + h * 0.2 + tl
        dx, dy = x1 - x0, y1 - y0; L = (dx * dx + dy * dy) ** 0.5; nx, ny = -dy / L * tw / 2, dx / L * tw / 2
        band([(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)])
        if stripe: d.line([(x0, y0), (x1, y1)], fill=PAL["black"], width=max(2, int(tw * 0.26)))
    # the knot
    k = h * 0.75
    band([(cx - k, cy - h * 0.72), (cx + k, cy - h * 0.72), (cx + k * 0.85, cy + h * 0.72), (cx - k * 0.85, cy + h * 0.72)])
    d.line([(cx - k * 0.7, cy - h * 0.5), (cx + k * 0.7, cy + h * 0.5)], fill=ol, width=lw)

def make_class_creed(T):
    W, H = 1000, 1060; im = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(im); d.rectangle([4, 4, W - 5, H - 5], outline=INK, width=10)
    center(d, 38, T["title"], fit(d, T["title"], FB, 112, W - 120), W, INK)
    d.rectangle([90, 188, W - 90, 214], fill=INK); belt_bar(d, W / 2, 201, W - 180, 26, ["black"])
    y = 262
    for s in T["lines"]: center(d, y, s, fit(d, s, FS, 44, W - 90), W, INK); y += 66
    y += 44
    for s in T["closing"]: center(d, y, s, fit(d, s, FB, 56, W - 80), W, INK); y += 84
    im.save(os.path.join(TX, "class-creed.png")); print("class-creed", im.size)

def make_belts(BB):
    W = 1500; pad = 14; bw = (W - 3 * pad) // 2; rows = [[0, 1], [2, 3], [4, 5], [6], [7, 8], [9]]; rh = [270, 270, 270, 280, 330, 300]
    H = sum(rh) + pad * (len(rows) + 1); im = Image.new("RGB", (W, H), (240, 238, 232)); d = ImageDraw.Draw(im); y = pad
    for ri, row in enumerate(rows):
        h = rh[ri]
        for ci, bi in enumerate(row):
            b = BB[bi]; w = bw if len(row) == 2 else int(bw * 1.1); x = pad + ci * (bw + pad) if len(row) == 2 else (W - w) // 2
            d.rectangle([x, y, x + w, y + h], fill="white", outline=INK, width=4)
            cen = lambda yy, s, f, fill: d.text((x + (w - d.textlength(s, font=f)) / 2, yy), s, font=f, fill=fill)
            cen(y + 10, b["title"], fit(d, b["title"], FB, 40, w - 40), RED)
            fs = 24
            while True:
                f = font(FS, fs); vl = wrap(d, b["verse"], f, w - 50); ul = wrap(d, b["virtue"], f, w - 50) if b["virtue"] else []
                need = 62 + len(vl) * (fs + 4) + 58 + (len(ul) * (fs + 4) + 8 if ul else 0) + (44 if b["letter"] else 4)
                if need <= h or fs <= 12: break
                fs -= 1
            yy = y + 62
            for ln in vl: cen(yy, ln, f, INK); yy += fs + 4
            by = yy + 20; belt_bar(d, x + w / 2, by, w * 0.5, 15, b["belt"]); yy = by + 40
            for ln in ul: cen(yy, ln, f, INK); yy += fs + 4
            if b["letter"]: cen(y + h - 42, b["letter"], font(FB, 26), RED)
        y += h + pad
    im.save(os.path.join(TX, "belt-creed.png")); print("belt-creed", im.size)

def make_flag():
    W, H = 950, 500; im = Image.new("RGB", (W, H), (255, 255, 255)); d = ImageDraw.Draw(im); sh = H / 13
    for i in range(13): d.rectangle([0, i * sh, W, (i + 1) * sh + 1], fill=(188, 30, 48) if i % 2 == 0 else (250, 248, 244))
    cw, ch = W * 0.4, sh * 7; d.rectangle([0, 0, cw, ch], fill=(46, 56, 120))
    import math
    def star(cx, cy, r):
        pts = [(cx + (r if k % 2 == 0 else r * 0.4) * math.sin(math.pi * k / 5), cy - (r if k % 2 == 0 else r * 0.4) * math.cos(math.pi * k / 5)) for k in range(10)]; d.polygon(pts, fill=(250, 250, 250))
    for row in range(9):
        for col in range(6 if row % 2 == 0 else 5):
            star(cw / 12 + col * cw / 6 + (0 if row % 2 == 0 else cw / 12), ch / 10 + row * ch / 10 * 1.0 * 1.0 * 1.0 * 0.999, 9)
    im.save(os.path.join(TX, "us-flag.png")); print("us-flag", im.size)

if __name__ == "__main__":
    T = json.load(open(os.path.join(HERE, "creed_text.json"))); make_logo(); make_class_creed(T["class_creed"]); make_belts(T["belt_boards"]); make_flag()
