"""Tower Climb room icons (R-BENCH-B4): five rooms, each with its own SHAPE and its own COLOUR.
Slay the Spire map-icon rules: read at tiny size, shape first, colour second, no legend.
  fight    round disc          blue    crossed practice swords
  chest    domed box           gold    lock plate, straps
  shrine   diamond             green   stone lantern (the glow comes from the lantern flame)
  door     double arch         orchid  two doorways = pick one
  guardian 14-point mane burst purple  friendly stone lion-dog face (bigger than the rest)
States: cleared = filled + gold check seal; current = filled + cream-and-gold ring; ahead = outline ring only.
No red anywhere (red is for danger). Uses the A-MENU2 material kit (incoming-art/menu2/source/mat.py).
render(kind, state, px) -> RGBA image px x px (px is device pixels). The art box is 72 units; the shape is 64."""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'menu2', 'source'))
import mat
from mat import S, SS

U = 72          # art box, units
OFF = 4         # shape sits OFF units inside the box (room for shadow + current ring)
CREAM = (255, 245, 220)
INK = (70, 42, 22)

# colour: (light, dark, outline) -- one hue per room, spread round the wheel, none near red
HUE = {
    'fight':    ((112, 168, 245), (52, 98, 200), (28, 52, 120)),
    'chest':    ((255, 218, 112), (226, 160, 40), (122, 78, 18)),
    'shrine':   ((120, 214, 150), (46, 150, 92), (22, 84, 52)),
    'door':     ((238, 150, 206), (190, 84, 160), (112, 40, 96)),
    'guardian': ((160, 120, 235), (96, 62, 178), (52, 30, 110)),
}
KINDS = list(HUE)
STATES = ('cleared', 'current', 'ahead')
BIG = {'guardian'}   # drawn 1.15x on the strip


def u(v):
    return S(v + OFF)


def newmask():
    return Image.new('L', (S(U), S(U)), 0)


def soften(m, r):
    return mat.blur(m, S(r)).point(lambda v: 255 if v > 127 else int(v * 2) if v > 64 else 0)


# ---------- silhouettes ----------
def sil(kind):
    m = newmask()
    d = ImageDraw.Draw(m)
    if kind == 'fight':
        d.ellipse([u(6), u(6), u(58), u(58)], fill=255)
    elif kind == 'chest':
        d.rounded_rectangle([u(4), u(10), u(60), u(34)], S(16), fill=255, corners=(True, True, False, False))
        d.rounded_rectangle([u(4), u(30), u(60), u(55)], S(6), fill=255, corners=(False, False, True, True))
    elif kind == 'shrine':
        d.polygon([(u(32), u(1)), (u(63), u(32)), (u(32), u(63)), (u(1), u(32))], fill=255)
        m = soften(m, 3.2)
    elif kind == 'door':
        for x0 in (4, 34):
            d.rounded_rectangle([u(x0), u(7), u(x0 + 26), u(56)], S(13), fill=255, corners=(True, True, False, False))
        d.rounded_rectangle([u(4), u(46), u(60), u(58)], S(4), fill=255)
    elif kind == 'guardian':
        pts = []
        n = 14
        for i in range(n * 2):
            a = math.pi * i / n - math.pi / 2
            r = 32 if i % 2 == 0 else 25
            pts.append((u(32 + r * math.cos(a)), u(32 + r * math.sin(a))))
        d.polygon(pts, fill=255)
        m = soften(m, 1.6)
    return m


def grow(m, px):
    return m.filter(ImageFilter.MaxFilter(S(px) * 2 + 1))


# ---------- glyph helpers ----------
def stick(d, p0, p1, w, col, cap=True):
    d.line([(u(p0[0]), u(p0[1])), (u(p1[0]), u(p1[1]))], fill=col, width=S(w))
    if cap:
        for p in (p0, p1):
            r = w / 2
            d.ellipse([u(p[0] - r), u(p[1] - r), u(p[0] + r), u(p[1] + r)], fill=col)


def layer(draw_fn):
    im = Image.new('RGBA', (S(U), S(U)), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(im))
    return im


def paste_in(img, lay, mask, alpha=1.0):
    mat.tex(img, lay, mask, alpha)


def glyph(img, kind, m, ahead):
    """draw the glyph for `kind`. `ahead` = ring state: glyph is tinted in the room colour instead of full art."""
    lt, dk, ol = HUE[kind]
    if kind == 'fight':
        def sword(d, hilt, tip, w_out, w_blade, outline):
            hx, hy = hilt
            tx, ty = tip
            L = math.hypot(tx - hx, ty - hy)
            ux, uy = (tx - hx) / L, (ty - hy) / L
            nx, ny = -uy, ux
            gx, gy = hx + ux * L * .30, hy + uy * L * .30    # guard position
            if outline:
                stick(d, (hx, hy), tip, w_blade + 3.0, mat.C(INK))
                stick(d, (gx - nx * 6.4, gy - ny * 6.4), (gx + nx * 6.4, gy + ny * 6.4), 5.2, mat.C(INK))
            else:
                stick(d, (gx, gy), tip, w_blade, mat.C(mat.HONEY_L))
                stick(d, (gx + ux * 2, gy + uy * 2), (tx - ux * 2.5, ty - uy * 2.5), w_blade * .38, mat.C((255, 244, 214)))
                stick(d, (hx, hy), (gx, gy), w_blade * .85, mat.C(mat.WOOD_D))
                stick(d, (gx - nx * 6.0, gy - ny * 6.0), (gx + nx * 6.0, gy + ny * 6.0), 3.2, mat.C(mat.GOLD))
        def f(d):
            swords = (((16, 47), (47, 14)), ((48, 47), (17, 14)))
            for a, b in swords:
                sword(d, a, b, 8, 6.0, True)
            for a, b in swords:
                sword(d, a, b, 8, 6.0, False)
        lay = layer(f)
        paste_in(img, lay, m, 0.6 if ahead else 1.0)
    elif kind == 'chest':
        def f(d):
            band = mat.C((150, 96, 30))
            d.rectangle([u(4), u(31), u(60), u(35)], fill=band)
            for x in (13, 45):
                d.rectangle([u(x), u(10), u(x + 6), u(55)], fill=band)
            d.rounded_rectangle([u(25), u(28), u(39), u(43)], S(3), fill=mat.C(INK))
            d.rounded_rectangle([u(26.2), u(29.2), u(37.8), u(41.8)], S(2.4), fill=mat.C(CREAM))
            d.ellipse([u(30), u(31.5), u(34), u(35.5)], fill=mat.C(INK))
            d.polygon([(u(31), u(34.5)), (u(33), u(34.5)), (u(33.6), u(40)), (u(30.4), u(40))], fill=mat.C(INK))
        lay = layer(f)
        paste_in(img, lay, m, 0.55 if ahead else 1.0)
    elif kind == 'shrine':
        win = (32, 34)
        # flame glow: real light source = the lantern window, kept inside the diamond
        if not ahead:
            g = newmask()
            ImageDraw.Draw(g).ellipse([u(win[0] - 5), u(win[1] - 5), u(win[0] + 5), u(win[1] + 5)], fill=255)
            mat.fill(img, mat.LANTERN, mat.mmul(mat.blur(g, S(5)), m), .75)

        def f(d):
            stone = mat.C((236, 226, 204))
            edge = mat.C(INK)
            d.polygon([(u(22), u(27)), (u(42), u(27)), (u(32), u(17))], fill=mat.C((60, 92, 70)), outline=edge)
            d.rectangle([u(25), u(27), u(39), u(43)], fill=stone, outline=edge, width=S(1.1))
            d.rectangle([u(27.5), u(29.5), u(36.5), u(40.5)], fill=mat.C(mat.LANTERN) if not ahead else mat.C((250, 240, 215)), outline=edge, width=S(.8))
            d.rectangle([u(31.4), u(29.5), u(32.6), u(40.5)], fill=edge)
            d.polygon([(u(23), u(47)), (u(41), u(47)), (u(38), u(43)), (u(26), u(43))], fill=stone, outline=edge)
            d.ellipse([u(29), u(31.6), u(35), u(37.6)], fill=mat.C((255, 244, 176)) if not ahead else mat.C((250, 240, 215)))
        lay = layer(f)
        paste_in(img, lay, m, 0.6 if ahead else 1.0)
    elif kind == 'door':
        def f(d):
            for x0 in (9, 39):
                d.rounded_rectangle([u(x0), u(13), u(x0 + 16), u(48)], S(8), fill=mat.C(INK), corners=(True, True, False, False))
                d.rounded_rectangle([u(x0 + 1.4), u(14.4), u(x0 + 14.6), u(48)], S(6.8), fill=mat.C(CREAM), corners=(True, True, False, False))
                d.line([(u(x0 + 8), u(15)), (u(x0 + 8), u(48))], fill=mat.C(ol), width=S(1))
                d.line([(u(x0 + 1.4), u(31)), (u(x0 + 14.6), u(31))], fill=mat.C(ol), width=S(1))
                d.ellipse([u(x0 + 10.4), u(36), u(x0 + 12.8), u(38.4)], fill=mat.C(mat.GOLD_D))
        lay = layer(f)
        paste_in(img, lay, m, .6 if ahead else 1.0)
    elif kind == 'guardian':
        def f(d):
            d.ellipse([u(13.5), u(14.5), u(50.5), u(51.5)], fill=mat.C(ol))
            d.ellipse([u(15), u(16), u(49), u(50)], fill=mat.C((255, 226, 152)))
            d.ellipse([u(19), u(22), u(45), u(46)], fill=mat.C((255, 238, 190)))
            # eyes: big, friendly
            for ex in (24.5, 39.5):
                d.ellipse([u(ex - 3.3), u(27.5), u(ex + 3.3), u(35.5)], fill=mat.C(INK))
                d.ellipse([u(ex - 1.4), u(28.7), u(ex + .8), u(31.4)], fill=mat.C((255, 255, 255)))
            # nose + smile
            d.rounded_rectangle([u(29.2), u(35.6), u(34.8), u(39.4)], S(2), fill=mat.C(INK))
            d.arc([u(25), u(36), u(39), u(46)], 20, 160, fill=mat.C(INK), width=S(1.7))
            # cheeks (warm peach, not red)
            for cx in (20.5, 43.5):
                d.ellipse([u(cx - 2.6), u(37), u(cx + 2.6), u(41.4)], fill=mat.C((255, 190, 140), 150))
        lay = layer(f)
        paste_in(img, lay, m, .75 if ahead else 1.0)


def seal(img):
    """gold check seal, bottom right (same idea as menu2 cubby-seal)."""
    c = (53, 53)
    r = 9.2
    m = newmask()
    ImageDraw.Draw(m).ellipse([u(c[0] - r), u(c[1] - r), u(c[0] + r), u(c[1] + r)], fill=255)
    mat.drop_shadow(img, m, 1, 1.2, .5)
    mat.tex(img, mat.brass(S(U), S(U), mat.GOLD_L, mat.GOLD, mat.GOLD_D), m)
    mat.bevel(img, m, 1, .8)
    mat.outline(img, m, mat.WOOD_DD, 1.0)
    d = ImageDraw.Draw(img)
    d.line([(u(c[0] - 4.4), u(c[1] + .2)), (u(c[0] - 1.2), u(c[1] + 3.4)), (u(c[0] + 4.6), u(c[1] - 3.4))], fill=(255, 255, 255, 255), width=S(2.8), joint='curve')


def build(kind, state):
    lt, dk, ol = HUE[kind]
    img = Image.new('RGBA', (S(U), S(U)), (0, 0, 0, 0))
    m = sil(kind)
    ahead = state == 'ahead'
    if state == 'current':
        ring = mat.msub(grow(m, 3.4), m)
        # a gold halo ring with a dark edge so it reads on paper: a UI marker, not a light
        outer = grow(m, 4.2)
        mat.fill(img, mat.WOOD_DD, outer, 1)
        mat.fill(img, (255, 252, 240), mat.msub(grow(m, 3.4), m), 1)
        mat.fill(img, mat.GOLD, mat.msub(grow(m, 3.4), grow(m, 2.2)), 1)
    mat.drop_shadow(img, m, 2.0, 2.0, .42)
    if ahead:
        # ring only: paper inside, room colour outline
        mat.tex(img, mat.vgrad(S(U), S(U), (250, 240, 218), (232, 214, 178)), m)
        mat.inner_shadow(img, m, 1.6, 1.6, .28)
        mat.outline(img, m, tuple(int(v * .75 + 30) for v in dk), 2.2)
        mat.outline(img, mat.msub(m, m.filter(ImageFilter.MinFilter(S(2.2) * 2 + 1))), (255, 255, 255), .6, .0)
    else:
        mat.tex(img, mat.vgrad(S(U), S(U), lt, dk), m)
        mat.bevel(img, m, 1.6, 1.2, hi_a=.5, lo_a=.4)
        mat.rim_light(img, m, alpha=.7)
        mat.bounce(img, m, alpha=.25, h=7)
        mat.outline(img, m, ol, 1.9)
    glyph(img, kind, m, ahead)
    if not ahead:
        mat.lacquer(img, mat.msub(m, m.filter(ImageFilter.MinFilter(S(2) * 2 + 1))), top_a=.12, band=.4, spec_a=.0)
    if state == 'cleared':
        seal(img)
    return img


_cache = {}


def render(kind, state, px):
    """RGBA px x px. px = device pixels for the whole 72-unit box."""
    key = (kind, state)
    if key not in _cache:
        _cache[key] = build(kind, state)
    return _cache[key].resize((int(px), int(px)), Image.LANCZOS)
