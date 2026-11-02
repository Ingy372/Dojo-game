"""(Copy of incoming-art/icons-slots/source/toon.py from PR #419 so this folder builds on its own.) Tiny toon drawing kit for the Seal family icons (Pillow + numpy only).
Draw in a 256 x 256 space (U units); everything renders at 4x and is scaled down by the caller.
One light: upper left. Every shape = dark outline, flat fill, a lower-right shade band, an upper-left highlight band."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageChops, ImageFilter

U = 256
SC = 4
INKC = (58, 40, 34)

# ---- palette (no red anywhere; red is for danger only) ----
GI, GI_S = (250, 246, 236), (205, 204, 222)
SKIN, SKIN_S = (242, 190, 146), (212, 148, 108)
HAIR, HAIR_S = (70, 50, 46), (44, 30, 30)
BELT, BELT_S = (58, 82, 138), (38, 54, 98)
WOOD, WOOD_S = (196, 140, 80), (150, 98, 52)
CREAM, CREAM_S = (250, 242, 222), (226, 210, 176)
PAPER_RIM = (232, 222, 190)
BLUE, BLUE_S = (70, 150, 215), (44, 108, 170)
GOLD, GOLD_S = (246, 186, 58), (200, 134, 30)
PADB, PADB_S = (74, 98, 150), (48, 66, 108)


def P(x):
    return x * SC


def rot(pts, cx, cy, ang):
    c, s = math.cos(ang), math.sin(ang)
    return [(cx + (x * c - y * s), cy + (x * s + y * c)) for x, y in pts]


def arc_pts(cx, cy, r, a0, a1, n=8):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


def rrect_pts(cx, cy, w, h, r, ang=0.0):
    """rounded rectangle polygon centred on (cx, cy), rotated by ang (radians, y down)."""
    r = min(r, w / 2, h / 2)
    pts = []
    for (ox, oy, a0) in ((w / 2 - r, -h / 2 + r, -math.pi / 2), (w / 2 - r, h / 2 - r, 0),
                         (-w / 2 + r, h / 2 - r, math.pi / 2), (-w / 2 + r, -h / 2 + r, math.pi)):
        pts += arc_pts(ox, oy, r, a0, a0 + math.pi / 2, 6)
    return rot(pts, cx, cy, ang)


def ell_pts(cx, cy, rx, ry, ang=0.0, n=48):
    pts = [(rx * math.cos(2 * math.pi * i / n), ry * math.sin(2 * math.pi * i / n)) for i in range(n)]
    return rot(pts, cx, cy, ang)


def cap(p0, p1, r0, r1=None):
    """tapered limb: a list of primitives (a polygon plus end circles)."""
    r1 = r0 if r1 is None else r1
    (x0, y0), (x1, y1) = p0, p1
    a = math.atan2(y1 - y0, x1 - x0) + math.pi / 2
    nx, ny = math.cos(a), math.sin(a)
    poly = [(x0 + nx * r0, y0 + ny * r0), (x1 + nx * r1, y1 + ny * r1), (x1 - nx * r1, y1 - ny * r1), (x0 - nx * r0, y0 - ny * r0)]
    return [('poly', poly), ('circ', x0, y0, r0), ('circ', x1, y1, r1)]


def poly(pts):
    return [('poly', pts)]


def circ(cx, cy, r):
    return [('circ', cx, cy, r)]


def paint(d, prims, grow=0.0, val=255):
    for pr in prims:
        if pr[0] == 'poly':
            pts = [(P(x), P(y)) for x, y in pr[1]]
            d.polygon(pts, fill=val)
            if grow:
                w = int(round(2 * P(grow)))
                d.line(pts + [pts[0]], fill=val, width=w, joint='curve')
                rr = P(grow)
                for x, y in pts:
                    d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=val)
        else:
            _, x, y, r = pr
            rr = P(r + grow)
            d.ellipse([P(x) - rr, P(y) - rr, P(x) + rr, P(y) + rr], fill=val)


def mask_of(prims, grow=0.0):
    m = Image.new('L', (P(U), P(U)), 0)
    paint(ImageDraw.Draw(m), prims, grow)
    return m


def shift(m, dx, dy):
    return ImageChops.offset(m, int(round(P(dx))), int(round(P(dy))))


class Art:
    def __init__(self):
        self.im = Image.new('RGBA', (P(U), P(U)), (0, 0, 0, 0))

    def fill_mask(self, m, col, a=1.0):
        lay = Image.new('RGBA', self.im.size, (*col, 0))
        lay.putalpha(m.point(lambda v: int(v * a)))
        self.im.alpha_composite(lay)

    def shape(self, prims, fill, shade=None, hi=None, ow=3.2, band=5.0, clip=None, outline=INKC):
        m = mask_of(prims)
        if clip is not None:
            m = ImageChops.multiply(m, clip)
        if ow:
            o = mask_of(prims, ow)
            if clip is not None:
                o = ImageChops.multiply(o, clip)
            self.fill_mask(o, outline)
        self.fill_mask(m, fill)
        if shade is not None:
            band_m = ImageChops.subtract(m, shift(m, -band, -band * .9))
            self.fill_mask(band_m, shade)
        if hi is not None:
            hb = ImageChops.subtract(m, shift(m, band * .7, band * .7))
            self.fill_mask(ImageChops.multiply(hb, m), hi, .9)
        return m

    def line(self, pts, col, w, clip=None, closed=False, a=1.0):
        m = Image.new('L', self.im.size, 0)
        d = ImageDraw.Draw(m)
        q = [(P(x), P(y)) for x, y in pts]
        if closed:
            q.append(q[0])
        d.line(q, fill=255, width=int(P(w)), joint='curve')
        rr = P(w) / 2
        for x, y in (q[0], q[-1]):
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=255)
        if clip is not None:
            m = ImageChops.multiply(m, clip)
        self.fill_mask(m, col, a)

    def blur_glow(self, prims, col, rad, a):
        m = mask_of(prims).filter(ImageFilter.GaussianBlur(P(rad)))
        self.fill_mask(m, col, a)

    def result(self, size=U * SC):
        return self.im.resize((size, size), Image.LANCZOS)


def lighten(c, k=.35):
    return tuple(int(v + (255 - v) * k) for v in c)


def darken(c, k=.25):
    return tuple(int(v * (1 - k)) for v in c)


def arrow_head(tip, ang, size):
    """a triangle at tip pointing along ang."""
    x, y = tip
    a = [(0, 0), (-size, -size * .62), (-size * .62, 0), (-size, size * .62)]
    return rot(a, x, y, ang)


def star_pts(cx, cy, r0, r1, n=8, ang=0.0):
    pts = []
    for i in range(2 * n):
        r = r1 if i % 2 == 0 else r0
        a = ang + math.pi * i / n
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts
