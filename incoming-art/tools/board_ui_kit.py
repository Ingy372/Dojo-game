"""Training Board UI kit (R-BENCH-B2): one warm paper-and-wood look for every Board tab.
Built on the A-MENU2 material kit (incoming-art/menu2/source/mat.py) and re-uses its sprites
(panel-frame, panel-inset, title-plaque, button-primary, xp-bar, stat-tile, cubby-seal) so the Board,
the Trophy Case and the later Insight picker (G2) all share the same wood, paper, brass and honey.

Everything here draws at 4x and is scaled to K=2 ("@2x"). Positions are in phone points (1x).
New pieces (not in menu2): tab (wood / gold / pressed), buttons (enter = the only orange, wood, gold),
wood sign, paper card, family ribbon, new dot, gate medallion (lit / locked), progress ring, tatami mat."""
import os, sys, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ART, 'menu2', 'source'))
import mat
from mat import S, SS

K = 2
SP = os.path.join(ART, 'menu2', 'sprites')
MAN = json.load(open(os.path.join(SP, 'menu2.json')))['sprites']
FONT = '/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf'
CJK = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'

# ---- tokens (what the Programmer would put in ui/tokens.ts; colours also in tokens.json) ----
INK = (70, 42, 22)
INK_SOFT = (120, 86, 56)
CREAM = (255, 244, 220)
ENTER_TOP, ENTER_BOT, ENTER_OL = (255, 184, 92), (236, 118, 32), (124, 58, 16)   # orange: ENTER THE TOWER only
ROOTED = (86, 150, 232)     # family ribbons: small ribbons only
FLOWING = (64, 184, 138)
TOKENS = {
    'wall': '#7a4e2c', 'wallDark': '#563420', 'frame': '#96603a', 'frameDark': '#42261a',
    'paper': '#f7ebd2', 'paperLight': '#fdf6e6', 'paperDark': '#e2cca6', 'ink': '#462a16', 'inkSoft': '#785638',
    'honey': '#e2aa62', 'gold': '#eeb63a', 'goldLight': '#ffe48e', 'goldDark': '#a8701e',
    'enterOrange': '#ec7620 (button gradient #ffb85c to #ec7620, outline #7c3a10), the only orange on the Board',
    'rooted': '#5696e8', 'flowing': '#40b88a', 'danger': 'red, danger only, none used on the Board',
}


def font(sz, w='Bold'):
    f = ImageFont.truetype(FONT, int(round(sz * K)))
    try:
        f.set_variation_by_name(w)
    except Exception:
        pass
    return f


_cache = {}


def spr(name):
    if name not in _cache:
        f = MAN[name]['file'].replace('.png', '@2x.png')
        _cache[name] = Image.open(os.path.join(SP, f)).convert('RGBA')
    return _cache[name]


def nine(im, w, h, m):
    """m = [top, right, bottom, left] in 1x px; im is @2x; w, h in output px."""
    t, r, b, l = [v * K for v in m]
    W, H = im.size
    w, h = int(w), int(h)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    xs = [(0, l, 0, l), (l, W - r, l, w - r), (W - r, W, w - r, w)]
    ys = [(0, t, 0, t), (t, H - b, t, h - b), (H - b, H, h - b, h)]
    for sx0, sx1, dx0, dx1 in xs:
        for sy0, sy1, dy0, dy1 in ys:
            if sx1 <= sx0 or sy1 <= sy0 or dx1 <= dx0 or dy1 <= dy0:
                continue
            out.alpha_composite(im.crop((sx0, sy0, sx1, sy1)).resize((dx1 - dx0, dy1 - dy0), Image.LANCZOS), (dx0, dy0))
    return out


def sized(name, w, h=None):
    """a menu2 sprite at w x h points (9-slice when it has margins)."""
    im = spr(name)
    h = h or MAN[name]['size'][1]
    m = MAN[name].get('nineSlice')
    if m and any(m):
        return nine(im, w * K, h * K, m)
    return im.resize((int(w * K), int(h * K)), Image.LANCZOS)


def tint(im, col):
    return mat.multiply(im, col)


# ---------- the wall (one wood material behind every tab) ----------
def wall(w, h, seed=5):
    W, H = w * K, h * K
    im = mat.wood(W, H, seed, (122, 78, 44), (86, 52, 28), (146, 98, 58), vertical=True, freq=0.35, contrast=0.7).convert('RGBA')
    d = ImageDraw.Draw(im)
    pw = 58 * K
    for x in range(pw, W, pw):
        d.line([(x, 0), (x, H)], fill=(60, 34, 18, 150), width=K)
        d.line([(x + K, 0), (x + K, H)], fill=(190, 140, 90, 60), width=K)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    light = np.clip(1 - np.hypot((xx - W / 2) / W, (yy + H * .2) / H * 1.1) * 1.05, 0, 1)
    lay = Image.new('RGBA', (W, H), (255, 210, 150, 0))
    lay.putalpha(Image.fromarray((light * 255).astype(np.uint8)).point(lambda v: int(v * .35)))
    im.alpha_composite(lay)
    vg = np.clip((np.maximum(np.abs(xx / W - .5), np.abs(yy / H - .5)) * 2 - .55) / .45, 0, 1) ** 2
    lay = Image.new('RGBA', (W, H), (30, 14, 6, 0))
    lay.putalpha(Image.fromarray((vg * 150).astype(np.uint8)))
    im.alpha_composite(lay)
    return im


class Screen:
    """a phone-sized page, composed at 2x from points."""
    def __init__(self, w, h, bg=None):
        self.w, self.h = w, h
        self.img = bg if bg is not None else wall(w, h)

    def put(self, im, x, y, alpha=1.0):
        if isinstance(im, str):
            im = spr(im)
        if alpha < 1:
            im = im.copy()
            im.putalpha(im.getchannel('A').point(lambda v: int(v * alpha)))
        self.img.alpha_composite(im, (int(round(x * K)), int(round(y * K))))

    def text(self, x, y, s, sz=14, col=INK, anchor='mm', w='Bold', shadow=None, ff=None):
        d = ImageDraw.Draw(self.img)
        f = ff or font(sz, w)
        if shadow:
            d.text((x * K, y * K + K), s, font=f, fill=shadow, anchor=anchor)
        d.text((x * K, y * K), s, font=f, fill=col, anchor=anchor)

    def save(self, path1x_stem):
        self.img.save(path1x_stem + '@2x.png')
        self.img.resize((self.w, self.h), Image.LANCZOS).save(path1x_stem + '.png')


# ---------- small drawing helpers ----------
M = 6   # margin (points) every piece gets for its shadow


def cv(w, h):
    return mat.canvas(w + 2 * M, h + 2 * M)


def box(w, h, r, corners=(True, True, True, True)):
    m = Image.new('L', (S(w + 2 * M), S(h + 2 * M)), 0)
    ImageDraw.Draw(m).rounded_rectangle([S(M), S(M), S(M + w), S(M + h)], S(r), fill=255, corners=corners)
    return m


def out(img, w, h):
    return mat.down(img, (w + 2 * M) * K, (h + 2 * M) * K)


def lacquer_button(w, h, top, bot, ol, r=None, pressed=False, label_dark=True):
    r = r or h / 2.4
    img = cv(w, h)
    m = box(w, h, r)
    if not pressed:
        mat.drop_shadow(img, m, 2.4, 2.2, .5)
    else:
        mat.drop_shadow(img, m, .8, 1.2, .4)
    body = Image.new('RGBA', img.size)
    g = mat.vgrad(*img.size, tuple(int(v * (.9 if pressed else 1)) for v in top), tuple(int(v * (.9 if pressed else 1)) for v in bot))
    mat.tex(img, g, m)
    mat.bevel(img, m, 1.6, 1.2, hi_a=.5, lo_a=.38)
    mat.rim_light(img, m, alpha=.75)
    mat.bounce(img, m, alpha=.3, h=9)
    mat.lacquer(img, m, top_a=.28, band=.5, spec_a=.45)
    mat.outline(img, m, ol, 1.6)
    return out(img, w, h)


def wood_button(w, h, pressed=False, disabled=False, r=None, seed=3):
    r = r or h / 2.8
    img = cv(w, h)
    m = box(w, h, r)
    mat.drop_shadow(img, m, 2 if not pressed else .8, 2, .5)
    base, dark, light = ((150, 96, 50), (98, 58, 30), (196, 138, 76))
    if disabled:
        base, dark, light = (196, 170, 130), (160, 134, 96), (222, 198, 158)
    if pressed:
        base, dark, light = (128, 80, 42), (84, 48, 24), (170, 116, 64)
    tex = mat.wood(img.size[0], img.size[1], seed, base, dark, light, contrast=.8).convert('RGBA')
    mat.tex(img, tex, m)
    mat.bevel(img, m, 1.6, 1.2, hi_a=.45 if not disabled else .25, lo_a=.4)
    mat.rim_light(img, m, alpha=.55 if not disabled else .3)
    mat.bounce(img, m, alpha=.2, h=7)
    mat.outline(img, m, mat.WOOD_DD if not disabled else (140, 110, 74), 1.6)
    return out(img, w, h)


def tab(w, h, state='normal', seed=11):
    """state: normal (wood), active (honey lacquer, raised), pressed. Tab grows 4 pt up when active."""
    img = cv(w, h)
    m = box(w, h, 12, (True, True, False, False))
    mat.drop_shadow(img, m, 1.6, 2, .4)
    if state == 'active':
        mat.tex(img, mat.vgrad(*img.size, mat.GOLD_L, mat.GOLD), m)
        mat.bevel(img, m, 1.6, 1.2, hi_a=.55, lo_a=.35)
        mat.rim_light(img, m, alpha=.8)
        mat.lacquer(img, m, top_a=.3, band=.5, spec_a=.4)
    else:
        base, dark, light = ((150, 96, 50), (98, 58, 30), (196, 138, 76)) if state == 'normal' else ((120, 74, 38), (80, 46, 22), (160, 108, 60))
        tex = mat.wood(img.size[0], img.size[1], seed, base, dark, light, contrast=.8).convert('RGBA')
        mat.tex(img, tex, m)
        mat.bevel(img, m, 1.5, 1.1, hi_a=.4, lo_a=.4)
        mat.rim_light(img, m, alpha=.5)
    mat.outline(img, m, mat.WOOD_DD, 1.6)
    return out(img, w, h)


def new_dot(r=6):
    """a small gold dot: something new for you. No number, no red."""
    img = cv(r * 2, r * 2)
    m = mat.ell(*img.size, [S(M), S(M), S(M + 2 * r), S(M + 2 * r)])
    mat.drop_shadow(img, m, 1, 1.2, .5)
    mat.tex(img, mat.brass(*img.size, mat.GOLD_L, mat.GOLD, mat.GOLD_D), m)
    mat.bevel(img, m, 1, .8)
    mat.outline(img, m, mat.WOOD_DD, 1.1)
    mat.fill(img, (255, 255, 240), mat.mmul(mat.ell(*img.size, [S(M + r * .45), S(M + r * .3), S(M + r * .95), S(M + r * .8)]), m), .75)
    return out(img, r * 2, r * 2)


def paper_card(w, h, r=10, border=True, seed=21, shade=True):
    """cream paper card with a wood-brown edge: the one paper tone used inside every Board panel."""
    img = cv(w, h)
    m = box(w, h, r)
    mat.drop_shadow(img, m, 2, 2, .4)
    p = mat.paper(*img.size, seed, fibres=False)
    mat.tex(img, p, m)
    if shade:
        mat.inner_shadow(img, m, 1.6, 1.8, .22)
    mat.bevel(img, m, 1.2, 1, hi_a=.5, lo_a=.18)
    mat.outline(img, m, (150, 100, 58) if border else mat.PAPER_D, 2.2 if border else 1.2)
    return out(img, w, h)


def ribbon(w, h, col):
    """a family ribbon: a small bookmark flag with a notched tail."""
    img = cv(w, h)
    m = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(m)
    n = h * .32
    d.polygon([(S(M), S(M)), (S(M + w), S(M)), (S(M + w - n), S(M + h / 2)), (S(M + w), S(M + h)), (S(M), S(M + h))], fill=255)
    mat.drop_shadow(img, m, 1.4, 1.4, .42)
    lt = tuple(min(255, int(v * 1.2 + 20)) for v in col)
    dk = tuple(int(v * .78) for v in col)
    mat.tex(img, mat.vgrad(*img.size, lt, dk), m)
    mat.bevel(img, m, 1.1, .9, hi_a=.45, lo_a=.35)
    mat.rim_light(img, m, alpha=.6)
    mat.outline(img, m, tuple(int(v * .38) for v in col), 1.3)
    return out(img, w, h)


def medallion(r, state='lit', seed=31):
    """gate lock seal. lit = gold with a check; locked = wood with a paper lock. both read without colour."""
    d_ = r * 2
    img = cv(d_, d_)
    m = mat.ell(*img.size, [S(M), S(M), S(M + d_), S(M + d_)])
    mat.drop_shadow(img, m, 1.8, 2, .5)
    if state == 'lit':
        mat.tex(img, mat.brass(*img.size, mat.GOLD_L, mat.GOLD, mat.GOLD_D), m)
        mat.bevel(img, m, 1.5, 1.1, hi_a=.6, lo_a=.35)
        mat.rim_light(img, m, alpha=.8)
        mat.lacquer(img, m, top_a=.3, band=.5, spec_a=.4)
    else:
        tex = mat.wood(*img.size, seed, (130, 84, 44), (84, 50, 26), (168, 116, 66), contrast=.8).convert('RGBA')
        mat.tex(img, tex, m)
        mat.inner_shadow(img, m, 1.6, 1.6, .35)
        mat.bevel(img, m, 1.4, 1.1, hi_a=.3, lo_a=.4)
    mat.outline(img, m, mat.WOOD_DD, 1.6)
    # inner ring
    ring = mat.msub(mat.ell(*img.size, [S(M + 3), S(M + 3), S(M + d_ - 3), S(M + d_ - 3)]), mat.ell(*img.size, [S(M + 4.4), S(M + 4.4), S(M + d_ - 4.4), S(M + d_ - 4.4)]))
    mat.fill(img, mat.WOOD_DD if state == 'lit' else (230, 200, 150), ring, .4 if state == 'lit' else .35)
    dr = ImageDraw.Draw(img)
    cx = cy = M + r
    if state == 'lit':
        dr.line([(S(cx - r * .38), S(cy + r * .02)), (S(cx - r * .1), S(cy + r * .3)), (S(cx + r * .42), S(cy - r * .28))], fill=(*INK, 255), width=S(r * .28), joint='curve')
    else:
        pc = (240, 222, 186, 255)
        bw, bh = r * .62, r * .46
        dr.rounded_rectangle([S(cx - bw / 2), S(cy - bh * .05), S(cx + bw / 2), S(cy + bh * 1.05)], S(2), fill=pc)
        dr.arc([S(cx - bw * .36), S(cy - bh * .85), S(cx + bw * .36), S(cy + bh * .35)], 180, 360, fill=pc, width=S(r * .14))
        dr.line([(S(cx - bw * .36), S(cy - bh * .25)), (S(cx - bw * .36), S(cy + bh * .05))], fill=pc, width=S(r * .14))
        dr.line([(S(cx + bw * .36), S(cy - bh * .25)), (S(cx + bw * .36), S(cy + bh * .05))], fill=pc, width=S(r * .14))
        dr.ellipse([S(cx - r * .05), S(cy + bh * .3), S(cx + r * .05), S(cy + bh * .5)], fill=(*INK, 255))
    return out(img, d_, d_)


def progress_ring(r, frac, thick=7):
    """a gold arc on a wood track, starting at the top and going round clockwise."""
    d_ = r * 2
    img = cv(d_, d_)
    dr = ImageDraw.Draw(img)
    bb = [S(M), S(M), S(M + d_), S(M + d_)]
    m = mat.ell(*img.size, bb)
    mat.drop_shadow(img, m, 1.6, 1.8, .4)
    mat.tex(img, mat.paper(*img.size, 7, mat.PAPER_D, (200, 170, 126), vignette=0), m)
    mat.outline(img, m, mat.WOOD_DD, 1.4)
    tr = S(thick)
    track = Image.new('L', img.size, 0)
    ImageDraw.Draw(track).arc([S(M + thick / 2), S(M + thick / 2), S(M + d_ - thick / 2), S(M + d_ - thick / 2)], 0, 360, fill=255, width=tr)
    mat.fill(img, (130, 88, 52), track, .9)
    fillm = Image.new('L', img.size, 0)
    ImageDraw.Draw(fillm).arc([S(M + thick / 2), S(M + thick / 2), S(M + d_ - thick / 2), S(M + d_ - thick / 2)], -90, -90 + 360 * frac, fill=255, width=tr)
    mat.tex(img, mat.brass(*img.size, mat.GOLD_L, mat.GOLD, mat.GOLD_D), fillm)
    mat.rim_light(img, fillm, alpha=.5)
    return out(img, d_, d_)


def mat_tatami(w, h):
    """a floor mat the hero stands on (flat oval, rice-straw tatami with a dark edge band)."""
    img = cv(w, h)
    m = mat.ell(*img.size, [S(M), S(M), S(M + w), S(M + h)])
    mat.drop_shadow(img, m, 2.6, 3, .45)
    rng = np.random.default_rng(4)
    base = np.zeros((img.size[1], img.size[0], 3), np.float32)
    base[:] = (206, 190, 128)
    yy = np.arange(img.size[1])[:, None]
    base += (np.sin(yy / S(1.3)) * 5)[..., None]
    tex = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')
    mat.tex(img, tex, m)
    mat.inner_shadow(img, m, 2.2, 2.4, .25)
    mat.bevel(img, m, 1.6, 1.2, hi_a=.35, lo_a=.35)
    edge = mat.msub(m, m.filter(ImageFilter.MinFilter(S(3.2) * 2 + 1)))
    mat.fill(img, (88, 70, 40), edge, .75)
    mat.outline(img, m, mat.WOOD_DD, 1.5)
    return out(img, w, h)


# ---------- tab icons ----------
def tab_icon(kind, px=26):
    """the FINAL B3 tab icons (ui-benchmark/source/make_tab_icons.py). Returns px*K device pixels."""
    sys.path.insert(0, os.path.join(ART, 'ui-benchmark', 'source'))
    import make_tab_icons
    return make_tab_icons.render(kind, int(px * K))


def tab_icon_placeholder(kind, px=26):
    """simple outlined glyphs, 26 pt box: climb scroll / bag / belt star / gate. Placeholders for B3."""
    n = 26
    img = Image.new('RGBA', (S(n), S(n)), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    dk = (*mat.WOOD_DD, 255)
    cr = (*CREAM, 255)
    P = lambda v: S(v)
    if kind == 'climb':   # scroll
        d.rounded_rectangle([P(5), P(4), P(21), P(22)], P(2.5), fill=cr, outline=dk, width=P(1.6))
        for yy in (9, 13, 17):
            d.line([(P(8.5), P(yy)), (P(17.5), P(yy))], fill=(150, 100, 58, 255), width=P(1.5))
        for yy in (3.2, 21.2):
            d.rounded_rectangle([P(3), P(yy), P(23), P(yy + 2.8)], P(1.4), fill=(*mat.HONEY, 255), outline=dk, width=P(1.3))
    elif kind == 'gear':  # bag
        d.ellipse([P(4), P(8), P(22), P(25)], fill=(*mat.WOOD_L, 255), outline=dk, width=P(1.6))
        d.rounded_rectangle([P(8.5), P(3.4), P(17.5), P(9.5)], P(2), fill=(*mat.WOOD_L, 255), outline=dk, width=P(1.4))
        d.line([(P(8), P(10)), (P(18), P(10))], fill=(*mat.GOLD, 255), width=P(2.2))
        d.ellipse([P(11.3), P(14), P(14.7), P(17.4)], fill=dk)
    elif kind == 'abilities':  # belt with a star
        d.rounded_rectangle([P(2.5), P(9), P(23.5), P(17), ], P(1.5), fill=(70, 160, 90, 255), outline=dk, width=P(1.5))
        pts = []
        for i in range(10):
            a = -math.pi / 2 + i * math.pi / 5
            r = 6.4 if i % 2 == 0 else 2.7
            pts.append((P(13 + r * math.cos(a)), P(13 + r * math.sin(a))))
        d.polygon(pts, fill=(*mat.GOLD_L, 255), outline=dk)
    elif kind == 'gate':  # gate
        d.rounded_rectangle([P(3), P(3), P(23), P(7)], P(1.5), fill=(*mat.HONEY, 255), outline=dk, width=P(1.4))
        for x in (6, 17):
            d.rectangle([P(x), P(7), P(x + 3), P(23)], fill=(*mat.WOOD_L, 255), outline=dk, width=P(1.3))
        d.rectangle([P(9), P(13), P(17), P(23)], fill=(60, 36, 20, 255))
    return img.resize((int(px * K), int(px * K)), Image.LANCZOS)


def hero(height_pts, belt='#3aa655', tape=(26, 26, 26)):
    """the player (south idle frame 0) from its layer sheets, tinted like the game, sized to height_pts."""
    pc = os.path.join(ART, 'player-character', 'sprites')
    fw, fh = 128, 160
    row = 4

    def cell(layer):
        im = Image.open(os.path.join(pc, f'player_{layer}_idle.png')).convert('RGBA')
        return im.crop((0, row * fh, fw, (row + 1) * fh))

    def hx(h):
        h = h.lstrip('#')
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    out_ = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    out_.alpha_composite(cell('body'))
    out_.alpha_composite(tint(cell('gi'), hx('#f2e9d8')))
    out_.alpha_composite(tint(cell('belt'), hx(belt)))
    out_.alpha_composite(tint(cell('belt-rim'), hx('#2e2a3a')))
    out_.alpha_composite(cell('belt-tape1-edge'))
    out_.alpha_composite(tint(cell('belt-tape1'), tape))
    bb = out_.getbbox()
    out_ = out_.crop(bb)
    s = height_pts * K / out_.height
    big = out_.resize((int(out_.width * s), int(height_pts * K)), Image.LANCZOS)
    return big.filter(ImageFilter.UnsharpMask(radius=1.4, percent=60, threshold=2))


def shadow_oval(w, h, alpha=.45):
    img = Image.new('RGBA', (int(w * K * 1.6), int(h * K * 2.4)), (0, 0, 0, 0))
    m = Image.new('L', img.size, 0)
    ImageDraw.Draw(m).ellipse([int(w * K * .3), int(h * K * .7), int(w * K * 1.3), int(h * K * 1.7)], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(h * K * .35))
    lay = Image.new('RGBA', img.size, (*mat.SHADOW, 0))
    lay.putalpha(m.point(lambda v: int(v * alpha)))
    return lay
