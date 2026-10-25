"""Material kit for the A-MENU2 set (mood A, warm dojo wood). PIL + numpy.
Everything is drawn at SS x the 1x size, then scaled down with LANCZOS for the 1x and 2x exports.
Layering order used by every piece (back to front):
  drop shadow -> body material (wood / paper / brass) -> grain/fibre -> bevel (top-left light, bottom-right shade)
  -> rim light (thin top edge) -> bounce light (warm bottom edge) -> lacquer gloss -> details."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

SS = 4

# ---- palette (mood A; no red: red means danger) ----
WOOD_DD = (66, 38, 20)      # deep wood / outline
WOOD_D = (98, 58, 30)
WOOD_M = (150, 96, 50)
WOOD_L = (196, 138, 76)
HONEY = (226, 170, 98)
HONEY_L = (244, 200, 132)
PAPER = (247, 235, 210)
PAPER_L = (253, 246, 230)
PAPER_D = (226, 204, 166)
GOLD = (238, 182, 58)
GOLD_L = (255, 228, 142)
GOLD_D = (168, 112, 30)
BRASS = (214, 164, 72)
INK = (70, 42, 22)
SHADOW = (40, 20, 8)        # warm, never pure black
LANTERN = (255, 190, 84)
BOUNCE = (255, 170, 90)     # warm bounce light


def C(c, a=255):
    return tuple(int(v) for v in c[:3]) + (int(a),)


def S(v):
    return int(round(v * SS))


# ---------- masks ----------
def rr(W, H, box, r):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).rounded_rectangle(box, r, fill=255)
    return m


def ell(W, H, box):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).ellipse(box, fill=255)
    return m


def mmul(a, b):
    return ImageChops.multiply(a, b)


def msub(a, b):
    return ImageChops.subtract(a, b)


def mscale(m, f):
    return m.point(lambda v: int(v * f))


def blur(m, r):
    return m.filter(ImageFilter.GaussianBlur(r)) if r > 0 else m


def shift(m, dx, dy):
    return ImageChops.offset(m, int(dx), int(dy))


# ---------- compositing ----------
def fill(img, col, mask, alpha=1.0):
    """composite a flat colour through a mask."""
    lay = Image.new('RGBA', img.size, C(col))
    lay.putalpha(mscale(mask, alpha) if alpha != 1 else mask)
    img.alpha_composite(lay)


def tex(img, rgb, mask, alpha=1.0):
    """composite an RGB(A) texture through a mask."""
    t = rgb.convert('RGBA') if rgb.mode != 'RGBA' else rgb.copy()
    a = mmul(t.getchannel('A'), mask)
    t.putalpha(mscale(a, alpha) if alpha != 1 else a)
    img.alpha_composite(t)


def drop_shadow(img, mask, dy=2, blur_px=3, alpha=0.45, col=SHADOW, spread=0):
    m = mask
    if spread:
        m = m.filter(ImageFilter.MaxFilter(S(spread) | 1))
    m = blur(shift(m, 0, S(dy)), S(blur_px))
    fill(img, col, msub(m, mask) if False else m, alpha)


def glow(img, mask, col, radius, alpha=0.8, grow=0):
    m = mask
    if grow:
        m = m.filter(ImageFilter.MaxFilter(S(grow) * 2 + 1))
    fill(img, col, blur(m, S(radius)), alpha)


def bevel(img, mask, d=1.5, soft=1.2, hi=(255, 240, 210), hi_a=0.55, lo=SHADOW, lo_a=0.45):
    """top-left highlight and bottom-right shade, inside the mask."""
    b = blur(mask, S(soft))
    h = mmul(msub(b, shift(b, S(d), S(d))), mask)
    l = mmul(msub(b, shift(b, -S(d), -S(d))), mask)
    fill(img, hi, h, hi_a)
    fill(img, lo, l, lo_a)


def inner_shadow(img, mask, dy=2.5, blur_px=2.5, alpha=0.5, col=SHADOW):
    """shadow cast onto a recessed face by the top edge."""
    inv = ImageChops.invert(mask)
    s = blur(shift(inv, 0, S(dy)), S(blur_px))
    fill(img, col, mmul(s, mask), alpha)


def rim_light(img, mask, col=(255, 236, 190), alpha=0.8, w=1.0):
    """a thin bright line just inside the top edge."""
    e = msub(mask, shift(mask, 0, S(w)))
    fill(img, col, blur(e, S(0.3)), alpha)


def bounce(img, mask, col=BOUNCE, alpha=0.35, h=8):
    """warm reflected light rising from the bottom edge, inside the mask."""
    e = msub(mask, shift(mask, 0, -S(h * 0.25)))
    fill(img, col, mmul(blur(e, S(h * 0.6)), mask), alpha)


def lacquer(img, mask, top_a=0.38, band=0.42, spec_a=0.55):
    """gloss: a soft sheen over the top part, plus a thin specular streak."""
    W, H = img.size
    bb = mask.getbbox()
    if not bb:
        return
    x0, y0, x1, y1 = bb
    g = np.zeros((H, W), np.float32)
    hh = (y1 - y0) * band
    ys = np.arange(H, dtype=np.float32)[:, None]
    g[:] = np.clip(1 - (ys - y0) / max(1, hh), 0, 1) ** 1.6
    gm = Image.fromarray((g * 255).astype(np.uint8))
    fill(img, (255, 248, 228), mmul(gm, mask), top_a)
    sp = Image.new('L', (W, H), 0)
    ImageDraw.Draw(sp).rounded_rectangle([x0 + (x1 - x0) * .08, y0 + (y1 - y0) * .07, x1 - (x1 - x0) * .08, y0 + (y1 - y0) * .07 + S(1.2)], S(1), fill=255)
    fill(img, (255, 255, 245), mmul(blur(sp, S(0.6)), mask), spec_a)


def outline(img, mask, col=WOOD_DD, w=1.0, alpha=1.0):
    e = msub(mask, mask.filter(ImageFilter.MinFilter(max(3, S(w) * 2 + 1))))
    fill(img, col, e, alpha)


# ---------- textures ----------
def noise(W, H, cx, cy, seed):
    """smooth value noise: cx, cy = cells across/down."""
    rng = np.random.default_rng(seed)
    a = rng.random((max(2, int(cy)), max(2, int(cx)))).astype(np.float32)
    im = Image.fromarray((a * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(im, np.float32) / 255.0


def lerp3(c0, c1, t):
    c0 = np.array(c0, np.float32)
    c1 = np.array(c1, np.float32)
    return c0 + (c1 - c0) * t[..., None]


def wood(W, H, seed, base=WOOD_M, dark=WOOD_D, light=WOOD_L, vertical=False, freq=1.0, contrast=1.0):
    """wood with grain lines along x (or y). Grain = warped stripes + fibre noise + soft colour drift."""
    if vertical:
        return wood(H, W, seed, base, dark, light, False, freq, contrast).transpose(Image.ROTATE_90)
    ys = np.arange(H, dtype=np.float32)[:, None]
    warp = noise(W, H, 3, 2, seed) * S(4.5) + noise(W, H, 9, 4, seed + 1) * S(1.5)
    period = S(5.5) / freq
    stripe = 0.5 + 0.5 * np.sin((ys + warp) / period * 2 * np.pi)
    stripe = stripe ** 3  # thin dark late-wood lines
    fib = noise(W, H, W / S(40), H / S(0.9), seed + 2)  # long thin fibres along x
    drift = noise(W, H, 2, 2, seed + 3)
    t = np.clip(0.5 + (drift - 0.5) * 0.7 + (fib - 0.5) * 0.35 * contrast, 0, 1)
    rgb = lerp3(base, light, t)
    rgb = rgb * (1 - 0.32 * contrast * stripe[..., None]) + np.array(dark, np.float32) * (0.32 * contrast * stripe[..., None])
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')


def paper(W, H, seed, base=PAPER, edge=PAPER_D, fibres=True, vignette=0.5):
    """washi-like paper: soft cloudy tone + fibres + a gentle edge tone."""
    cloud = noise(W, H, 5, 5, seed) * 0.6 + noise(W, H, 18, 18, seed + 1) * 0.4
    rgb = lerp3(base, edge, np.clip((cloud - 0.5) * 0.5 + 0.15, 0, 1))
    if vignette:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.maximum(np.abs(xx / W - .5), np.abs(yy / H - .5)) * 2
        rgb = rgb * (1 - vignette * 0.18 * d[..., None] ** 4) + np.array(edge, np.float32) * (vignette * 0.18 * d[..., None] ** 4)
    img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
    if fibres:
        rng = np.random.default_rng(seed + 9)
        d = ImageDraw.Draw(img)
        for _ in range(int(W * H / (S(22) ** 2))):
            x, y = rng.random() * W, rng.random() * H
            a = rng.random() * np.pi
            L = S(2 + rng.random() * 5)
            d.line([(x, y), (x + np.cos(a) * L, y + np.sin(a) * L)], fill=C(edge, 38), width=max(1, SS // 3))
    return img


def brass(W, H, top=GOLD_L, mid=BRASS, bot=GOLD_D):
    ys = np.linspace(0, 1, H, dtype=np.float32)
    t = np.where(ys < 0.45, ys / 0.45, (ys - 0.45) / 0.55)
    rgb = np.where((ys < 0.45)[:, None], lerp3(top, mid, t), lerp3(mid, bot, t))
    rgb = np.repeat(rgb[:, None, :], W, axis=1)
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')


def vgrad(W, H, top, bot):
    ys = np.linspace(0, 1, H, dtype=np.float32)
    rgb = np.repeat(lerp3(top, bot, ys)[:, None, :], W, axis=1)
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')


def rgrad(W, H, cx, cy, r, inner, outer):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    t = np.clip(np.hypot(xx - cx, yy - cy) / r, 0, 1)
    return Image.fromarray(np.clip(lerp3(inner, outer, t), 0, 255).astype(np.uint8), 'RGB')


def multiply(img, col):
    solid = Image.new('RGBA', img.size, C(col))
    out = ImageChops.multiply(img, solid)
    out.putalpha(img.getchannel('A'))
    return out


def canvas(w, h):
    return Image.new('RGBA', (S(w), S(h)), (0, 0, 0, 0))


def down(img, w, h):
    return img.resize((int(w), int(h)), Image.LANCZOS)
