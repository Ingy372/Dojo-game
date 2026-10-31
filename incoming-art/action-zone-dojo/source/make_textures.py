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
def belt_bar(d, cx, cy, w, h, cols):
    """a belt: a bar (one or two colours) tied with a simple knot"""
    PAL = {"white": (244, 241, 232), "yellow": (245, 210, 46), "orange": (240, 138, 36), "green": (22, 110, 56), "blue": (36, 54, 150), "red": (190, 30, 36),
           "brown": (92, 56, 36), "black": (28, 28, 34)}
    def bar(x0, x1, c, edge=False):
        d.rectangle([x0, cy - h / 2, x1, cy + h / 2], fill=PAL[c], outline=(40, 40, 40) if edge or c == "white" else None, width=max(2, int(h * 0.12)))
    if cols == ["white"]: bar(cx - w / 2, cx + w / 2, "white", True)
    elif cols == ["yellow", "orange"]: bar(cx - w / 2, cx, "yellow"); bar(cx, cx + w / 2, "orange")
    elif cols == ["redblack"]: bar(cx - w / 2, cx + w / 2, "black"); bar(cx - w / 2 + w * 0.08, cx + w / 2 - w * 0.08, "red", False); d.rectangle([cx - w / 2, cy - h * 0.12, cx + w / 2, cy + h * 0.12], fill=PAL["black"])
    elif cols == ["brownblack"]: bar(cx - w / 2, cx + w / 2, "brown"); d.rectangle([cx - w / 2, cy - h * 0.12, cx + w / 2, cy + h * 0.12], fill=PAL["black"])
    else: bar(cx - w / 2, cx + w / 2, cols[0])
    k = INK if cols[0] in ("white", "yellow", "orange") else (20, 20, 24)
    d.polygon([(cx - h * 0.9, cy - h * 0.8), (cx, cy), (cx - h * 0.9, cy + h * 0.8)], fill=k); d.polygon([(cx + h * 0.9, cy - h * 0.8), (cx, cy), (cx + h * 0.9, cy + h * 0.8)], fill=k)

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
                need = 62 + len(vl) * (fs + 4) + 40 + (len(ul) * (fs + 4) + 8 if ul else 0) + (44 if b["letter"] else 4)
                if need <= h or fs <= 12: break
                fs -= 1
            yy = y + 62
            for ln in vl: cen(yy, ln, f, INK); yy += fs + 4
            by = yy + 20; belt_bar(d, x + w / 2, by, w * 0.5, 15, b["belt"]); yy = by + 22
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
