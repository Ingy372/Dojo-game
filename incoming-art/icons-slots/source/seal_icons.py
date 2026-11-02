"""PB-07 sample icons: Seal family medallions, Lock, slot glyphs, Jumping Spins. Pillow + numpy only.
Every function returns a 256 x 256 RGBA image (the @2x file; the 128 x 128 file is a downscale of it).
Medallion shape and ring order match the existing Seal icons (incoming-art/icons): cream face, coloured rim,
pale outer ring, dark outline. What changes per family is the rim colour and the picture."""
import math
from PIL import Image, ImageDraw, ImageChops
from toon import *

RIMS = {  # rim colours: family colour cue. No red. Orange belongs to ENTER THE TOWER only.
    'counter': (70, 150, 215),   # blue (the colour every Seal rim has today)
    'guard': (74, 176, 112),     # green
    'escape': (44, 178, 192),    # teal
    'disarm': (146, 104, 214),   # purple
    'throw': (224, 112, 172),    # rose pink
    'lock': (150, 140, 130),     # stone grey: not open yet
    'strike': (240, 178, 56),    # honey gold: Strike slot + Strike icons
    'kata': (160, 104, 60),      # wood brown: Kata slot
}
FACE_R = 82


def face_clip():
    m = Image.new('L', (P(U), P(U)), 0)
    ImageDraw.Draw(m).ellipse([P(128 - FACE_R), P(128 - FACE_R), P(128 + FACE_R), P(128 + FACE_R)], fill=255)
    return m


def medallion(rim, face=CREAM, face_dish=CREAM_S):
    a = Art()
    a.shape(circ(128, 128, 112), PAPER_RIM, (204, 190, 152), (255, 250, 232), ow=3.4, band=5)
    a.shape(circ(128, 128, 100), rim, darken(rim, .22), lighten(rim, .35), ow=0, band=6)
    a.shape(circ(128, 128, 85), lighten(rim, .55), None, None, ow=0)
    a.shape(circ(128, 128, FACE_R), face, None, None, ow=2.2)
    m = mask_of(circ(128, 128, FACE_R))
    a.fill_mask(ImageChops.subtract(m, shift(m, 7, 7)), face_dish, .85)
    return a


def fist(a, cx, cy, s, ang, clip=None):
    """a clenched fist seen from the back / side. Knuckles face along ang (radians, 0 = right).
    Four stacked finger bands at the front, thumb across them, flat back of the hand behind."""
    def L(pts):
        return rot(pts, cx, cy, ang)
    a.shape(poly(L(rrect_pts(-.22 * s, 0, .62 * s, .98 * s, .2 * s))), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.6, band=3.2, clip=clip)
    for i in range(4):
        y = -.37 * s + i * .245 * s
        a.shape(poly(L(rrect_pts(.2 * s, y + .02 * s, .5 * s, .26 * s, .12 * s))), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.0, band=2.2, clip=clip)
    a.shape(poly(L(rrect_pts(.05 * s, .4 * s, .6 * s, .2 * s, .1 * s))), SKIN, SKIN_S, lighten(SKIN, .45), ow=2.2, band=2.2, clip=clip)


def sleeve(a, p0, p1, r0, r1, clip=None):
    a.shape(cap(p0, p1, r0, r1), GI, GI_S, (255, 255, 250), ow=3.0, band=4.5, clip=clip)


def limb(a, p0, p1, r0, r1, clip=None):
    a.shape(cap(p0, p1, r0, r1), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.8, band=3.5, clip=clip)


def head_front(a, cx, cy, r, clip=None):
    a.shape(circ(cx, cy, r), SKIN, SKIN_S, lighten(SKIN, .4), ow=3, band=4, clip=clip)
    hair = [(cx - r - 1.5, cy + 2)] + arc_pts(cx, cy, r + 2, math.pi, 2 * math.pi, 14) + [(cx + r + 1.5, cy + 2),
            (cx + r * .55, cy - r * .12), (cx + r * .1, cy - r * .02), (cx - r * .45, cy - r * .22), (cx - r * .8, cy - r * .02)]
    a.shape(poly(hair), HAIR, HAIR_S, lighten(HAIR, .25), ow=2.6, band=3.5, clip=clip)
    for dx in (-.36, .36):
        a.shape(circ(cx + dx * r, cy + r * .22, r * .1), INKC, None, None, ow=0, clip=clip)
    a.line([(cx - r * .22, cy + r * .55), (cx, cy + r * .66), (cx + r * .22, cy + r * .55)], INKC, 2.2, clip=clip)


def gi_torso(a, cx, top, w, h, clip=None, belt_y=None):
    a.shape(poly(rrect_pts(cx, top + h / 2, w, h, 26)), GI, GI_S, (255, 255, 250), ow=3.2, band=5, clip=clip)
    by = belt_y if belt_y is not None else top + h * .62
    a.shape(poly(rrect_pts(cx, by, w - 2, 15, 5)), BELT, BELT_S, lighten(BELT, .3), ow=2.6, band=3, clip=clip)


def burst(a, cx, cy, r0, r1, n=7, ang=0.0, clip=None):
    a.shape(poly(star_pts(cx, cy, r0, r1, n, ang)), GOLD, GOLD_S, (255, 232, 140), ow=2.6, band=3, clip=clip)


def arrow(a, pts, col, w, head, clip=None, outline=None):
    """a curved arrow along pts; arrowhead at the last point."""
    (x0, y0), (x1, y1) = pts[-2], pts[-1]
    ang = math.atan2(y1 - y0, x1 - x0)
    if outline:
        a.line(pts, outline, w + 4, clip=clip)
    a.line(pts, col, w, clip=clip)
    hp = arrow_head((x1, y1), ang, head * 1.25)
    if outline:
        a.shape(poly(hp), col, None, None, ow=2.0, outline=outline, clip=clip)
    else:
        a.shape(poly(hp), col, None, None, ow=0, clip=clip)


# ------------------------------------------------------------------ COUNTER: spinning back fist
def counter(rim=RIMS['counter']):
    a = medallion(rim)
    c = face_clip()
    # rear arm: elbow back, fist chambered at the hip
    limb(a, (52, 168), (70, 184), 8, 7, clip=c)
    fist(a, 78, 188, 24, -math.pi / 2 + .5, clip=c)
    sleeve(a, (66, 126), (46, 162), 15, 13, clip=c)
    gi_torso(a, 88, 114, 78, 110, clip=c, belt_y=176)
    # head turned over the shoulder toward the target
    limb(a, (88, 112), (88, 124), 9, 9, clip=c)
    a.shape(circ(86, 88, 23), SKIN, SKIN_S, lighten(SKIN, .4), ow=3, band=4, clip=c)
    a.shape(circ(80, 85, 24), HAIR, HAIR_S, lighten(HAIR, .25), ow=0, band=4, clip=c)
    a.shape(circ(102, 92, 2.8), INKC, None, None, ow=0, clip=c)
    a.shape(circ(89, 75, 10), HAIR, None, None, ow=0, clip=c)  # top knot
    a.shape(circ(64, 90, 4), HAIR, None, None, ow=0, clip=c)
    # striking arm: sleeve, forearm, wrist, fist with knuckles to the right
    burst(a, 198, 112, 8, 17, 7, .3, clip=c)
    limb(a, (130, 124), (160, 118), 9, 7.5, clip=c)
    sleeve(a, (110, 128), (136, 125), 18, 13.5, clip=c)
    fist(a, 172, 116, 31, -.07, clip=c)
    # spin arc around the body, in front of the belt
    pts = [(118 + 66 * math.cos(math.radians(t)), 124 + 62 * math.sin(math.radians(t))) for t in range(140, 14, -8)]
    arrow(a, pts, BLUE_S, 7, 15, clip=c, outline=(255, 252, 240))
    return a.result()


# ------------------------------------------------------------------ GUARD: cross block
def guard(rim=RIMS['guard']):
    a = medallion(rim)
    c = face_clip()
    gi_torso(a, 128, 120, 104, 110, clip=c, belt_y=196)
    # gi collar V
    a.shape(poly([(110, 118), (146, 118), (128, 154)]), SKIN, SKIN_S, None, ow=2.4, band=3, clip=c)
    a.line([(110, 118), (128, 154), (146, 118)], (210, 208, 226), 4, clip=c)
    limb(a, (128, 104), (128, 124), 10, 10, clip=c)
    head_front(a, 128, 84, 25, clip=c)
    # two forearms crossed in front of the chest, fists up beside the face, backs of the wrists out
    for sgn in (1, -1):
        ex, ey = 128 - 50 * sgn, 184      # elbow
        wx, wy = 128 + 34 * sgn, 112      # wrist
        limb(a, (ex, ey), (wx, wy), 11, 8.5, clip=c)
        sleeve(a, (128 - 40 * sgn, 134), (ex, ey), 15, 14, clip=c)
        sleeve(a, (ex, ey), (128 - 26 * sgn, 166), 14, 13, clip=c)
        ang = math.atan2(wy - ey, wx - ex)
        fist(a, wx + 13 * math.cos(ang), wy + 13 * math.sin(ang), 30, ang, clip=c)
    return a.result()


def foot(a, ax, ay, ang, clip=None, s=1.0):
    """a bare foot seen sole-on (like a kicking foot at the moment of impact): heel at (ax, ay), toes lead along ang.
    Heel pad, arch, ball and five toes, so it cannot be mistaken for a hand."""
    def L(pts):
        return rot([(x * s, y * s) for x, y in pts], ax, ay, ang)
    sole = [(-4, -9), (10, -10), (24, -14), (33, -13), (38, -7), (39, 6), (34, 13), (24, 14), (10, 10), (-4, 9), (-9, 4), (-9, -4)]
    a.shape(poly(L(sole)), SKIN, SKIN_S, lighten(SKIN, .45), ow=2.8, band=3.4, clip=clip)
    toes = [(45, -8.5, 5.2), (46, -1.2, 4.3), (44, 5.2, 3.8), (41, 10.4, 3.3), (37, 14.6, 2.8)]
    for tx, ty, tr in toes:
        p = L([(tx, ty)])[0]
        a.shape(circ(p[0], p[1], tr * s), SKIN, SKIN_S, lighten(SKIN, .45), ow=2.2, band=1.6, clip=clip)
    # arch: a soft shade on the inner side
    a.line(L([(6, 7), (18, 4), (26, 7)]), SKIN_S, 2.4 * s, clip=clip)
    # the sole hides the toe-joins, so repaint the joins
    a.shape(poly(L([(33, -10), (40, -6), (40, 5), (34, 10)])), SKIN, None, None, ow=0, clip=clip)


# ------------------------------------------------------------------ DISARM: kick the weapon
def knife(a, cx, cy, ang, clip=None, k=1.0):
    """a rubber training knife (blue pad blade, wood handle). Blade points along ang."""
    def L(pts):
        return rot([(x * k, y * k) for x, y in pts], cx, cy, ang)
    a.shape(poly(L(rrect_pts(-15, 0, 26, 11, 4))), WOOD, WOOD_S, lighten(WOOD, .35), ow=2.6, band=3, clip=clip)
    a.shape(poly(L(rrect_pts(-1, 0, 5, 18, 2))), GOLD, GOLD_S, None, ow=2.2, band=2, clip=clip)
    blade = [(2, -8), (30, -8), (40, 0), (30, 8), (2, 8)]
    a.shape(poly(L(blade)), PADB, PADB_S, lighten(PADB, .35), ow=2.8, band=3.5, clip=clip)


def disarm(rim=RIMS['disarm']):
    a = medallion(rim)
    c = face_clip()
    # a rubber training knife tumbling away, kicked out of play
    a.line([(104, 58), (118, 44), (138, 40)], BLUE_S, 4.5, clip=c)
    a.line([(196, 134), (206, 118), (206, 100)], BLUE_S, 4.5, clip=c)
    knife(a, 152, 102, -.9, clip=c, k=1.15)
    burst(a, 130, 128, 7, 15, 7, .2, clip=c)
    limb(a, (66, 164), (88, 158), 10, 9, clip=c)
    a.shape(cap((20, 176), (68, 165), 26, 18), GI, GI_S, (255, 255, 250), ow=3.2, band=5, clip=c)
    foot(a, 92, 158, -math.pi / 2 + .62, clip=c, s=1.2)
    return a.result()


# ------------------------------------------------------------------ LOCK (Seal family, not open yet)
def lock(rim=RIMS['lock']):
    a = medallion(rim, face=(224, 214, 196), face_dish=(196, 182, 160))
    c = face_clip()
    col, sh, hi = (116, 100, 90), (86, 72, 66), (160, 146, 134)
    ring = arc_pts(128, 108, 28, math.pi, 2 * math.pi, 18)
    outer = [(128 + 36 * math.cos(math.pi + math.pi * i / 18), 108 + 36 * math.sin(math.pi + math.pi * i / 18)) for i in range(19)]
    inner = [(128 + 20 * math.cos(2 * math.pi - math.pi * i / 18), 108 + 20 * math.sin(2 * math.pi - math.pi * i / 18)) for i in range(19)]
    a.shape(poly(outer + [(148, 122), (164, 122)] + [(108, 122)] * 0 + inner[::-1][::-1] if False else outer + [(164, 126), (92, 126)]) if False else
            poly(outer + [(164, 126), (148, 126)] + inner + [(108, 126), (92, 126)]), col, sh, hi, ow=3, band=4.5, clip=c)
    a.shape(poly(rrect_pts(128, 148, 84, 66, 15)), col, sh, hi, ow=3.2, band=6, clip=c)
    a.shape(circ(128, 142, 9), (52, 40, 36), None, None, ow=0, clip=c)
    a.shape(poly([(123, 146), (133, 146), (136, 166), (120, 166)]), (52, 40, 36), None, None, ow=0, clip=c)
    return a.result()


# ------------------------------------------------------------------ STRIKE slot glyph
def strike(rim=RIMS['strike']):
    a = medallion(rim)
    c = face_clip()
    # a kick pad (blue, honey target) and a leg: cuff, ankle, bare foot with the sole to the pad
    a.shape(poly(rrect_pts(178, 124, 42, 88, 14)), PADB, PADB_S, lighten(PADB, .35), ow=3.2, band=5, clip=c)
    a.shape(circ(178, 124, 15), GOLD, GOLD_S, (255, 232, 140), ow=2.4, band=3, clip=c)
    a.shape(circ(178, 124, 6), PADB_S, None, None, ow=0, clip=c)
    burst(a, 154, 112, 7, 15, 7, 0, clip=c)
    limb(a, (82, 144), (98, 142), 8.5, 8, clip=c)
    a.shape(cap((22, 152), (82, 144), 23, 16), GI, GI_S, (255, 255, 250), ow=3.2, band=5, clip=c)
    foot(a, 100, 142, -math.pi / 2 + .38, clip=c, s=1.05)
    return a.result()


# ------------------------------------------------------------------ KATA slot glyph
def foot_print(a, x, y, ang, s=1.0, col=BLUE_S, clip=None):
    """a footprint, toes along ang."""
    a.shape(poly(rot(ell_pts(0, 3 * s, 6.2 * s, 10 * s, 0), x, y, ang + math.pi / 2)), col, None, None, ow=2.0, clip=clip)
    for i, ox in enumerate((-4.6, -1.6, 1.4, 4.2)):
        tp = rot([(ox * s, -11.5 * s + abs(ox) * .5 * s)], x, y, ang + math.pi / 2)[0]
        a.shape(circ(tp[0], tp[1], 2.2 * s), col, None, None, ow=1.4, clip=clip)


def kata(rim=RIMS['kata']):
    a = medallion(rim)
    c = face_clip()
    mat_col, mat_sh = (214, 198, 134), (186, 168, 104)
    a.shape(poly(rrect_pts(128, 132, 128, 112, 12)), (90, 118, 84), (66, 90, 62), None, ow=3.2, band=4, clip=c)
    a.shape(poly(rrect_pts(128, 132, 112, 96, 8)), mat_col, mat_sh, (240, 228, 170), ow=2.0, band=4, clip=c)
    for yy in (116, 132, 148):
        a.line([(78, yy), (178, yy)], (196, 180, 116), 2, clip=c)
    path = [(84, 168), (84, 102), (172, 102), (172, 154)]
    # dotted floor path (the pattern a kata walks)
    for (x0, y0), (x1, y1) in zip(path, path[1:]):
        n = int(math.hypot(x1 - x0, y1 - y0) / 13)
        for i in range(n):
            t = (i + .5) / n
            a.shape(circ(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 2.6), (120, 86, 56), None, None, ow=0, clip=c)
    foot_print(a, 77, 150, -math.pi / 2, .9, clip=c)
    foot_print(a, 91, 126, -math.pi / 2, .9, clip=c)
    foot_print(a, 113, 95, 0, .9, clip=c)
    foot_print(a, 143, 109, 0, .9, clip=c)
    foot_print(a, 179, 128, math.pi / 2, .9, clip=c)
    a.shape(poly(arrow_head((172, 168), math.pi / 2, 15)), BLUE_S, None, None, ow=2.0, clip=c)
    return a.result()


# ------------------------------------------------------------------ JUMPING SPINS (Strike icon)
def place(med, art, f, dx, dy, clip):
    """scale a free-standing drawing by f, move it by (dx, dy) in U units, and lay it on the medallion inside the face."""
    big = art.im.resize((int(P(U) * f), int(P(U) * f)), Image.LANCZOS)
    lay = Image.new('RGBA', med.im.size, (0, 0, 0, 0))
    lay.alpha_composite(big, (int(P(dx)), int(P(dy))))
    lay.putalpha(ImageChops.multiply(lay.getchannel('A'), clip))
    med.im.alpha_composite(lay)


def jumping_spins(rim=RIMS['strike']):
    med = medallion(rim)
    fc = face_clip()
    a = Art()
    c = None
    # floor strip, shadow and two ripples (the "hits enemies close by" part)
    a.shape(poly(rrect_pts(128, 216, 200, 44, 10)), (214, 198, 134), (186, 168, 104), None, ow=0, band=4)
    for rx, ry, al in ((66, 11, .65), (44, 7, .85)):
        a.line(ell_pts(120, 194, rx, ry, 0, 40), (70, 150, 215), 3, closed=True, a=al)
    a.fill_mask(mask_of(poly(ell_pts(114, 194, 30, 6))), (60, 44, 30), .4)
    cx, cy = 112, 146
    back = [(cx + 72 * math.cos(math.radians(t)), cy + 17 * math.sin(math.radians(t))) for t in range(195, 346, 8)]
    a.line(back, lighten(BLUE, .3), 6)
    # tucked leg: thigh forward and down, shin folded back, foot under
    a.shape(cap((106, 132), (126, 156), 15, 12), GI, GI_S, (255, 255, 250), ow=3, band=4)
    a.shape(cap((126, 156), (96, 168), 12, 10), GI, GI_S, (255, 255, 250), ow=3, band=4)
    limb(a, (98, 167), (90, 169), 6, 5.5)
    foot(a, 90, 170, math.pi + .5, s=.55)
    # torso leaning away from the kick, belt, then the head (profile, eyes on the target)
    a.shape(cap((88, 82), (106, 128), 20, 18), GI, GI_S, (255, 255, 250), ow=3.2, band=5)
    a.shape(poly(rot(rrect_pts(0, 0, 42, 13, 5), 104, 122, -.38)), BELT, BELT_S, lighten(BELT, .3), ow=2.4, band=3)
    limb(a, (84, 70), (86, 82), 7, 7)
    a.shape(circ(88, 56, 20), SKIN, SKIN_S, lighten(SKIN, .4), ow=3, band=4)
    a.shape(circ(81, 53, 21), HAIR, HAIR_S, lighten(HAIR, .25), ow=0, band=4)
    a.shape(circ(105, 61, 2.8), INKC, None, None, ow=0)
    # trailing arm swung back (elbow bent, fist up and away), near arm guards the chin (elbow down, fist up)
    limb(a, (58, 110), (40, 93), 7, 6.2)
    sleeve(a, (82, 98), (58, 110), 11, 9.5)
    fist(a, 34, 87, 21, math.pi + .85)
    limb(a, (104, 124), (122, 100), 7, 6.2)
    sleeve(a, (92, 100), (104, 124), 11, 9.5)
    fist(a, 128, 92, 21, -.95)
    # kicking leg: thigh, shin, cuff, ankle, foot (spin kick, out and a little up)
    a.shape(cap((106, 130), (140, 124), 17, 14), GI, GI_S, (255, 255, 250), ow=3.2, band=5)
    a.shape(cap((138, 124), (168, 112), 14, 14), GI, GI_S, (255, 255, 250), ow=3.2, band=4.5)
    limb(a, (166, 113), (178, 107), 7.5, 7)
    burst(a, 214, 92, 7, 15, 7, .2)
    foot(a, 178, 107, -.35, s=.78)
    front = [(cx + 72 * math.cos(math.radians(t)), cy + 17 * math.sin(math.radians(t))) for t in range(10, 192, 8)]
    arrow(a, front, BLUE_S, 7, 15, outline=(255, 252, 240))
    place(med, a, .78, 128 - .78 * 124 + 1, 128 - .78 * 118, fc)
    return med.result()


# ------------------------------------------------------------------ EMPTY SLOT
def empty_slot():
    a = Art()
    a.shape(circ(128, 128, 112), (230, 210, 172), None, None, ow=3.0)
    m = mask_of(circ(128, 128, 112))
    a.fill_mask(ImageChops.subtract(m, shift(m, 9, 9)), (170, 134, 92), .55)       # a socket: shadow top-left
    a.fill_mask(ImageChops.subtract(m, shift(m, -6, -6)), (255, 246, 226), .8)     # lit lip bottom-right
    for i in range(14):
        t0 = 2 * math.pi * i / 14
        a.line(arc_pts(128, 128, 92, t0, t0 + .24, 6), (176, 136, 92), 6)
    a.line([(98, 128), (158, 128)], (176, 136, 92), 12)
    a.line([(128, 98), (128, 158)], (176, 136, 92), 12)
    return a.result()


ALL = {'counter': counter, 'guard': guard, 'disarm': disarm, 'lock': lock, 'strike': strike, 'kata': kata,
       'jumping-spins': jumping_spins, 'empty-slot': empty_slot}

if __name__ == '__main__':
    import sys
    names = sys.argv[1:] or list(ALL)
    for n in names:
        ALL[n]().resize((256, 256)).save('/workspace/ub/si_%s.png' % n)
