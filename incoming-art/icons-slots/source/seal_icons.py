"""PB-07 sample icons: Seal family medallions, Lock, slot glyphs, Jumping Spins. Pillow + numpy only.
Every function returns a 256 x 256 RGBA image (the @2x file; the 128 x 128 file is a downscale of it).
Medallion shape and ring order match the existing Seal icons (incoming-art/icons): cream face, coloured rim,
pale outer ring, dark outline. What changes per family is the rim colour and the picture."""
import math
from PIL import Image, ImageDraw, ImageChops
from toon import *

RIMS = {  # rim colours: family colour cue. No red. Orange belongs to ENTER THE TOWER only.
    'counter': (70, 150, 215),   # blue (the colour every Seal rim has today)
    'guard': (104, 180, 72),     # leaf green (moved toward yellow-green so Escape can sit next to it)
    'escape': (36, 172, 140),    # green-teal (Manager answer: clearly apart from Counter's blue)
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
    """a clean MITTEN fist (v3): one chunky rounded blob with a thumb lying across the front. No finger lines.
    Knuckles face along ang (radians, 0 = right). s is the fist's height in U units."""
    def L(pts):
        return rot(pts, cx, cy, ang)
    a.shape(poly(L(rrect_pts(0, 0, .98 * s, .92 * s, .36 * s))), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.8, band=3.4, clip=clip)
    a.shape(poly(L(rrect_pts(.2 * s, .2 * s, .56 * s, .3 * s, .15 * s, .18))), SKIN, SKIN_S, lighten(SKIN, .45), ow=2.4, band=2.2, clip=clip)


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
def mitten_fist(a, cx, cy, s, ang, side=1, clip=None):
    """v4 closed mitten fist seen from the back of the hand: ONE soft rounded square, knuckles leading along ang. The thumb is a single short crease
    INSIDE the outline (no separate thumb shape, no bump on the edge, no finger lines), so there is nothing to count or misread: 0 fingers, 1 thumb crease."""
    def L(pts):
        return rot(pts, cx, cy, ang)
    a.shape(poly(L(rrect_pts(0, 0, s, .9 * s, .36 * s))), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.8, band=3.4, clip=clip)
    a.line(L([(-.30 * s, side * .22 * s), (-.12 * s, side * .30 * s), (.12 * s, side * .30 * s), (.28 * s, side * .22 * s)]), SKIN_S, 2.6, clip=clip)


def forearm_block(a, el, wr, fist_s, fist_ang, side, clip=None, r_el=14.5, r_cuff=12.5):
    """v4 forearm: sleeve from the elbow to a cuff band, then a CLEAR skin wrist (narrower than both the cuff and the fist), then the mitten fist."""
    ex, ey = el
    wx, wy = wr
    ang = math.atan2(wy - ey, wx - ex)
    ux, uy = math.cos(ang), math.sin(ang)
    sleeve(a, (ex, ey), (wx - ux * 8, wy - uy * 8), r_el, r_cuff, clip=clip)
    a.shape(poly(rrect_pts(wx - ux * 8, wy - uy * 8, 9, 2 * r_cuff + 3, 3.5, ang)), GI, GI_S, (255, 255, 250), ow=2.4, band=2.4, clip=clip)   # cuff band
    limb(a, (wx - ux * 5, wy - uy * 5), (wx + ux * 8, wy + uy * 8), 7.2, 7.6, clip=clip)                                                     # wrist
    mitten_fist(a, wx + ux * (8 + fist_s * .42), wy + uy * (8 + fist_s * .42), fist_s, ang, side, clip=clip)


def guard(rim=RIMS['guard'], fx=46, tilt=.12):
    """v4 (premium pass): front view 'high guard' block. Smiling kid, gi torso, BOTH forearms raised beside the head: sleeve, cuff band, a clear wrist, then a
    simple closed mitten fist (one soft rounded square, one thumb crease). A soft blue shield sits behind. No crossed arms, no separate fingers."""
    a = medallion(rim)
    c = face_clip()
    a.shape(poly(chaikin([(60, 118), (196, 118), (192, 172), (128, 228), (64, 172)], 3)), lighten(BLUE, .3), BLUE, lighten(BLUE, .6), ow=3.0, band=5, clip=c)   # soft shield behind
    gi_torso(a, 128, 126, 78, 110, clip=c, belt_y=198)
    limb(a, (128, 108), (128, 126), 10, 10, clip=c)
    a.shape(circ(128, 86, 28), SKIN, SKIN_S, lighten(SKIN, .4), ow=3, band=4, clip=c)
    hair = [(99, 90)] + arc_pts(128, 86, 30, math.pi, 2 * math.pi, 16) + [(157, 90), (148, 74), (128, 68), (108, 74)]
    a.shape(poly(hair), HAIR, HAIR_S, lighten(HAIR, .25), ow=2.6, band=3.5, clip=c)
    for dx in (-11, 11):
        a.shape(circ(128 + dx, 91, 3.4), INKC, None, None, ow=0, clip=c)
        a.shape(circ(128 + dx * 1.9, 99, 4.6), (246, 170, 150), None, None, ow=0, clip=c)
    a.line([(120, 102), (128, 107), (136, 102)], INKC, 2.4, clip=c)
    for sgn in (-1, 1):
        forearm_block(a, (128 + 54 * sgn, 214), (128 + fx * sgn, 150), 34, -math.pi / 2 + tilt * sgn, sgn, clip=c)
    return a.result()


SOCK, SOCK_S = (126, 174, 226), (84, 128, 190)


def chaikin(pts, n=3):
    for _ in range(n):
        out = []
        for i in range(len(pts)):
            (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % len(pts)]
            out += [(.75 * x0 + .25 * x1, .75 * y0 + .25 * y1), (.25 * x0 + .75 * x1, .25 * y0 + .75 * y1)]
        pts = out
    return pts


def foot(a, ax, ay, ang, clip=None, s=1.0, flip=False):
    """a chunky training SHOE (v3), side view: soft blue upper, cream sole strip, cream ankle collar. One rounded shape, NO separate toes.
    Local frame: heel corner at (ax, ay), toe leads along ang, the sole is on the local +y side (flip mirrors it), the ankle collar rises on the -y side."""
    f = -1 if flip else 1
    def L(pts):
        return rot([(x * s, y * f * s) for x, y in pts], ax, ay, ang)
    upper = chaikin([(0, -26), (22, -26), (27, -10), (40, -12), (52, -8), (59, 2), (58, 11), (0, 11)], 3)
    a.shape(poly(L(upper)), SOCK, SOCK_S, lighten(SOCK, .4), ow=3.0, band=4.2, clip=clip)
    a.shape(poly(L(rrect_pts(11, -22, 24, 7, 3))), CREAM, CREAM_S, None, ow=2.2, band=2, clip=clip)       # ankle collar
    a.shape(poly(L(rrect_pts(30, 12, 64, 12, 6))), CREAM, CREAM_S, (255, 252, 240), ow=2.8, band=3, clip=clip)   # sole strip


# ------------------------------------------------------------------ DISARM: kick the training stick away
def stick(a, cx, cy, ang, clip=None, k=1.0):
    """a padded training stick (foam-wrapped, like a dojo escrima stick): wood grip at the tail, a thick blue foam pad
    over the rest with a gold tape band at each end. Rounded ends, nothing sharp. Pad end points along ang."""
    def L(pts):
        return rot([(x * k, y * k) for x, y in pts], cx, cy, ang)
    a.shape(poly(L(rrect_pts(-26, 0, 28, 10, 5))), WOOD, WOOD_S, lighten(WOOD, .35), ow=2.6, band=3, clip=clip)   # grip
    a.shape(poly(L(rrect_pts(14, 0, 64, 25, 12))), PADB, PADB_S, lighten(PADB, .35), ow=3.0, band=4.5, clip=clip)   # foam pad
    for bx in (-12, 40):
        a.shape(poly(L(rrect_pts(bx, 0, 6, 27, 2.5))), GOLD, GOLD_S, None, ow=2.0, band=2, clip=clip)              # tape bands
    a.line(L([(-4, -6), (34, -6)]), lighten(PADB, .5), 2.6, clip=clip)                                           # soft sheen


def disarm(rim=RIMS['disarm'], ang_deg=-24, ankle=(92, 166), flex=-14, stickang=-.8, k=.56, sc=1.1, sdy=-4, sd=92):
    """v4 (premium pass): a front snap kick that knocks a padded training stick away. Shin, ankle and shoe are drawn ONCE in a standing frame (shin straight up
    from the ankle, toes right) and rotated as one rigid group, so the shin-to-foot line cannot kink. The gi cuff meets a short, natural strip of ankle, then the
    shoe (blue foam upper with a gold collar, pale sole with a clear rounded heel). The foot is flexed about 90 degrees, as in a real front kick, with the SOLE
    facing the stick. The burst on the sole is the hit, which is also the source of the glow. Nothing above the head. 0 toes (a toeless shoe)."""
    a = medallion(rim)
    c = face_clip()
    phi = math.radians(ang_deg - 90)

    def G(pts, extra=0.0):
        p = rot(pts, 0, 0, extra) if extra else pts
        return rot([(x * sc, y * sc) for x, y in p], ankle[0], ankle[1], phi)
    fl = math.radians(flex)
    r0, r1, L_ = 21, 13.5, 120
    a.shape(poly(G(rrect_pts(0, -4, 18.4, 18, 3))), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.6, band=3.0, clip=c)   # ankle, tucked under cuff and collar
    p0 = G([(0, -L_)])[0]
    p1 = G([(0, -12)])[0]
    a.shape(cap(p0, p1, r0 * sc, r1 * sc), GI, GI_S, (255, 255, 250), ow=3.0, band=4.8, clip=c)                     # gi shin
    a.shape(poly(G(rrect_pts(0, -12, 2 * r1 + 3.5, 7, 3.2))), GI, GI_S, (255, 255, 250), ow=2.4, band=2.4, clip=c)  # cuff
    upper = chaikin([(-16, 0), (14, 0), (17, 9), (27, 15), (45, 20), (56, 26), (56, 33), (-21, 33), (-23, 14)], 2)
    a.shape(poly(G(upper, fl)), PADB, PADB_S, lighten(PADB, .35), ow=3.0, band=4.5, clip=c)
    sole = chaikin([(-23, 31), (57, 31), (60, 38), (52, 44), (-16, 44), (-25, 39)], 2)
    a.shape(poly(G(sole, fl)), CREAM, (206, 192, 168), (255, 255, 250), ow=3.0, band=3.2, clip=c)
    a.shape(poly(G(rrect_pts(0, 2, 36, 8, 3), fl)), GOLD, GOLD_S, None, ow=2.2, band=2, clip=c)                      # tape collar
    a.line(G([(30, 21), (46, 25)], fl), lighten(PADB, .55), 2.6, clip=c)                                              # sheen
    bx, by = G([(16, 56)], fl)[0]
    sx, sy = G([(16, sd)], fl)[0]
    stick(a, sx, sy + sdy, stickang, clip=c, k=k)
    burst(a, bx, by, 7, 15, 8, .2, clip=c)
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
    a.shape(cap((22, 152), (82, 144), 23, 16), GI, GI_S, (255, 255, 250), ow=3.2, band=5, clip=c)
    foot(a, 108, 156, -math.pi / 2, clip=c, s=1.0)
    return a.result()


# ------------------------------------------------------------------ KATA slot glyph
def foot_print(a, x, y, ang, s=1.0, col=BLUE_S, clip=None):
    """a footprint, heel to toe along ang: one sole oval plus a round heel. No toes."""
    a.shape(poly(rot(ell_pts(0, -2 * s, 7 * s, 11 * s, 0), x, y, ang + math.pi / 2)), col, None, None, ow=2.0, clip=clip)
    a.shape(poly(rot(ell_pts(0, 11 * s, 5.2 * s, 5.2 * s, 0), x, y, ang + math.pi / 2)), col, None, None, ow=2.0, clip=clip)


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
    foot(a, 94, 166, math.pi, s=.46, flip=True)
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
    burst(a, 214, 92, 7, 15, 7, .2)
    foot(a, 188, 122, -math.pi / 2 - .15, s=.62)
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
