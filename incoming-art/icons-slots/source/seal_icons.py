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


def sleeve(a, p0, p1, r0, r1, clip=None, ow=3.0, shade=GI_S, band=4.5):
    a.shape(cap(p0, p1, r0, r1), GI, shade, (255, 255, 250), ow=ow, band=band, clip=clip)


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


def gi_torso(a, cx, top, w, h, clip=None, belt_y=None, r=26, ow=3.2, shade=GI_S, band=5):
    a.shape(poly(rrect_pts(cx, top + h / 2, w, h, r)), GI, shade, (255, 255, 250), ow=ow, band=band, clip=clip)
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


# ------------------------------------------------------------------ COUNTER: straight punch with a turn
GSH = (150, 156, 196)          # a darker gi shade for Counter and Jumping Spins so the white parts read in grey at 30 pt
GK = dict(gow=4.6, gshade=GSH)  # the thicker ink outline + darker shade for sleeves and legs
PANT = (238, 240, 248)


def place_fit(med, art, wmax, hmax, cx=128, cy=128, bg=None, fmax=1.0):
    """scale `art` to fit wmax x hmax U (its own bounding box), centre it at (cx, cy) on the medallion inside the face clip; `bg` (floor) uses the same transform."""
    bb = art.im.getchannel('A').getbbox(); k = P(1)
    w, h = (bb[2] - bb[0]) / k, (bb[3] - bb[1]) / k
    f = min(wmax / w, hmax / h, fmax)
    mx, my = (bb[0] + bb[2]) / 2 / k, (bb[1] + bb[3]) / 2 / k
    for layer in ([bg] if bg is not None else []) + [art]:
        place(med, layer, f, cx - f * mx, cy - f * my, face_clip())
    return f


def counter(rim=RIMS['counter'], hx=104, hr=22, ty=90, tw=52, th=76, belt=136, sh=(118, 106), wr=(158, 104), r_sh=10.5, r_wr=9, fs=24, wrist_len=8,
            gel=(-34, -2), gwr=(-30, -34), gfs=24, ar=(42, 12), arrow_y=152, arrow_dx=26, stance=(-28, 40), ank=200, W=158, H=158, cx=132, cy=126, burst_gap=10):
    """v5 pass 6 (sheet 10), drawn in Jumping Spins' own proportions (head r 22, jacket about 50 wide, forearm sleeve r 10 to 9, mitten fist 24).
    PUNCHING ARM (viewer's right): ONE smooth tapered sleeve (shoulder r 11 to wrist r 9, no cuff band, no seams) then a short skin wrist and a mitten fist knuckles out; the arm
    reaches 57 U past the jacket edge (Spins' raised forearm and fist is 64 U). BACK HAND (viewer's left): no hip chamber; it is raised as a guard exactly like Spins' arm, a sleeve
    with a cuff, a skin wrist and a fist by the cheek, the elbow down at the belt. 2 fists, 0 fingers, 0 toes."""
    med = medallion(rim); a = Art()
    for k, dx in enumerate(stance):
        hip = (hx + (-12 if k == 0 else 12), ty + th - 8)
        an = (hx + dx, ank)
        sleeve(a, hip, (an[0], an[1] - 12), 13, 11, ow=4.6, shade=GSH, band=6)
        kick_leg(a, an, 90, 0, .55, 14, None, r0=21, r1=18, **GK)
    gi_torso(a, hx, ty, tw, th, belt_y=belt, ow=4.6, shade=GSH, band=6)
    limb(a, (hx, ty - 8), (hx, ty + 6), 8, 8)
    head_front(a, hx, ty - 24, hr)
    forearm_block(a, (hx + gel[0], belt + gel[1]), (hx + gwr[0], belt + gwr[1]), gfs, -math.pi / 2 + .1, 1, r_el=10, r_cuff=9, gband=6, **GK)
    sleeve(a, sh, wr, r_sh, r_wr, ow=3.0, shade=GSH, band=6)                                                    # ONE sleeve, shoulder to wrist
    limb(a, (wr[0] - 2, wr[1]), (wr[0] + wrist_len, wr[1]), 6.6, 7.0)
    mitten_fist(a, wr[0] + wrist_len + fs * .38, wr[1], fs, 0, 1)
    burst(a, wr[0] + wrist_len + fs * .88 + burst_gap, wr[1] - 4, 6.5, 14, 7, .3)
    pts = [(hx + arrow_dx + ar[0] * math.cos(math.radians(t)), arrow_y + ar[1] * math.sin(math.radians(t))) for t in range(165, 36, -8)]
    arrow(a, pts, BLUE_S, 7, 16, outline=(255, 252, 240))
    place_fit(med, a, W, H, cx, cy)
    return med.result()


# ------------------------------------------------------------------ GUARD: cross block
def mitten_fist(a, cx, cy, s, ang, side=1, clip=None):
    """v4 closed mitten fist seen from the back of the hand: ONE soft rounded square, knuckles leading along ang. The thumb is a single short crease
    INSIDE the outline (no separate thumb shape, no bump on the edge, no finger lines), so there is nothing to count or misread: 0 fingers, 1 thumb crease."""
    def L(pts):
        return rot(pts, cx, cy, ang)
    a.shape(poly(L(rrect_pts(0, 0, s, .9 * s, .36 * s))), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.8, band=3.4, clip=clip)
    a.line(L([(-.30 * s, side * .22 * s), (-.12 * s, side * .30 * s), (.12 * s, side * .30 * s), (.28 * s, side * .22 * s)]), SKIN_S, 2.6, clip=clip)


def forearm_block(a, el, wr, fist_s, fist_ang, side, clip=None, r_el=14.5, r_cuff=12.5, gow=3.0, gshade=GI_S, gband=4.5):
    """v4 forearm: sleeve from the elbow to a cuff band, then a CLEAR skin wrist (narrower than both the cuff and the fist), then the mitten fist."""
    ex, ey = el
    wx, wy = wr
    ang = math.atan2(wy - ey, wx - ex)
    ux, uy = math.cos(ang), math.sin(ang)
    sleeve(a, (ex, ey), (wx - ux * 8, wy - uy * 8), r_el, r_cuff, clip=clip, ow=gow, shade=gshade, band=gband)
    a.shape(poly(rrect_pts(wx - ux * 8, wy - uy * 8, 9, 2 * r_cuff + 3, 3.5, ang)), GI, gshade, (255, 255, 250), ow=gow - .6, band=2.4, clip=clip)   # cuff band
    limb(a, (wx - ux * 5, wy - uy * 5), (wx + ux * 8, wy + uy * 8), 7.2, 7.6, clip=clip)                                                     # wrist
    mitten_fist(a, wx + ux * (8 + fist_s * .42), wy + uy * (8 + fist_s * .42), fist_s, ang, side, clip=clip)


def guard(rim=RIMS['guard'], eo=26.5, ey=185, wx=10, wy=148, fs=30, front=1, shield=True, hy=94, f=1.0, cy=146, th=100, belt=188, r_el=12.5, r_cuff=11):
    """v5: a real crossed-forearm X-block. Smiling kid, gi torso, a soft blue shield behind. Both forearms come up from low elbows and cross in front of the chest:
    one sleeve is clearly drawn OVER the other (the outline and the cuff band make the overlap plain). Each forearm ends in the same cuff band, clear skin wrist and
    one closed mitten fist (one soft rounded square, one thumb crease) as before, the fists up by the cheeks. Pass 6: the elbow outer edge sits right at the torso edge (torso x 85.8..170.5 U,
    elbow 86.0..170.2 U; measure_guard.py) and the arms and jacket are shortened to Jumping Spins' proportions (measure_proportions.py). 2 fists, 0 fingers."""
    med = medallion(rim); a = Art(); c = None
    if shield:
        a.shape(poly(chaikin([(60, 118), (196, 118), (192, 172), (128, 228), (64, 172)], 3)), lighten(BLUE, .3), BLUE, lighten(BLUE, .6), ow=3.0, band=5, clip=c)
    gi_torso(a, 128, 126, 78, th, clip=c, belt_y=belt)
    limb(a, (128, 108), (128, 126), 10, 10, clip=c)
    a.shape(circ(128, hy, 28), SKIN, SKIN_S, lighten(SKIN, .4), ow=3, band=4, clip=c)
    hair = [(99, hy+4)] + arc_pts(128, hy, 30, math.pi, 2 * math.pi, 16) + [(157, hy+4), (148, hy-12), (128, hy-18), (108, hy-12)]
    a.shape(poly(hair), HAIR, HAIR_S, lighten(HAIR, .25), ow=2.6, band=3.5, clip=c)
    for dx in (-11, 11):
        a.shape(circ(128 + dx, hy+5, 3.4), INKC, None, None, ow=0, clip=c)
        a.shape(circ(128 + dx * 1.9, hy+13, 4.6), (246, 170, 150), None, None, ow=0, clip=c)
    a.line([(120, hy+16), (128, hy+21), (136, hy+16)], INKC, 2.4, clip=c)
    # the screen-left elbow arm goes up-right, the screen-right elbow arm goes up-left; front=1 puts the second (up-left) arm on top
    A = ((128 - eo, ey), (128 + wx, wy), -1)     # screen-left elbow -> wrist right of centre
    B = ((128 + eo, ey), (128 - wx, wy), 1)
    back, fr = (B, A) if front == -1 else (A, B)
    for el, wr, sd in (back, fr):
        forearm_block(a, el, wr, fs, 0, sd, clip=c, r_el=r_el, r_cuff=r_cuff)
    place(med, a, f, 128 - f * 128, 128 - f * cy, face_clip())
    return med.result()


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


def kick_leg(a, ankle, ang_deg, flex=-14, sc=1.1, L_=120, clip=None, r0=21, r1=13.5, gow=3.0, gshade=GI_S):
    """v4 kicking leg (shared by Disarm, Strike and Jumping Spins). Shin, ankle and shoe are drawn ONCE in a standing frame (shin straight up from the ankle,
    toes right, sole down) and rotated as one rigid group by ang_deg - 90, so the shin-to-foot line cannot kink. Gi cuff, a short natural strip of ankle, then
    the shoe (blue foam upper with a gold collar, pale sole with a clear rounded heel). The foot is flexed about 90 degrees, as in a real front kick, so the SOLE
    faces away from the body. 0 toes (a toeless shoe). Returns G(pts, extra) (standing frame to canvas) and the flex in radians."""
    phi = math.radians(ang_deg - 90)

    def G(pts, extra=0.0):
        p = rot(pts, 0, 0, extra) if extra else pts
        return rot([(x * sc, y * sc) for x, y in p], ankle[0], ankle[1], phi)
    fl = math.radians(flex)
    a.shape(poly(G(rrect_pts(0, -4, 18.4, 18, 3))), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.6, band=3.0, clip=clip)   # ankle, tucked under cuff and collar
    p0 = G([(0, -L_)])[0]
    p1 = G([(0, -12)])[0]
    a.shape(cap(p0, p1, r0 * sc, r1 * sc), GI, gshade, (255, 255, 250), ow=gow, band=4.8, clip=clip)                  # gi shin
    a.shape(poly(G(rrect_pts(0, -12, 2 * r1 + 3.5, 7, 3.2))), GI, gshade, (255, 255, 250), ow=gow - .6, band=2.4, clip=clip)  # cuff
    upper = chaikin([(-16, 0), (14, 0), (17, 9), (27, 15), (45, 20), (56, 26), (56, 33), (-21, 33), (-23, 14)], 2)
    a.shape(poly(G(upper, fl)), PADB, PADB_S, lighten(PADB, .35), ow=3.0, band=4.5, clip=clip)
    sole = chaikin([(-23, 31), (57, 31), (60, 38), (52, 44), (-16, 44), (-25, 39)], 2)
    a.shape(poly(G(sole, fl)), CREAM, (206, 192, 168), (255, 255, 250), ow=3.0, band=3.2, clip=clip)
    a.shape(poly(G(rrect_pts(0, 2, 36, 8, 3), fl)), GOLD, GOLD_S, None, ow=2.2, band=2, clip=clip)                      # tape collar
    a.line(G([(30, 21), (46, 25)], fl), lighten(PADB, .55), 2.6, clip=clip)                                              # sheen
    return G, fl


def disarm(rim=RIMS['disarm'], ang_deg=-24, ankle=(92, 166), flex=-14, stickang=-.8, k=.56, sc=1.1, sdy=-4, sd=92):
    """v4 (premium pass): a front snap kick that knocks a padded training stick away. Shin, ankle and shoe are drawn ONCE in a standing frame (shin straight up
    from the ankle, toes right) and rotated as one rigid group, so the shin-to-foot line cannot kink. The gi cuff meets a short, natural strip of ankle, then the
    shoe (blue foam upper with a gold collar, pale sole with a clear rounded heel). The foot is flexed about 90 degrees, as in a real front kick, with the SOLE
    facing the stick. The burst on the sole is the hit, which is also the source of the glow. Nothing above the head. 0 toes (a toeless shoe)."""
    a = medallion(rim)
    c = face_clip()
    G, fl = kick_leg(a, ankle, ang_deg, flex, sc, 120, c)
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
PAD, PAD_S = (64, 174, 160), (36, 126, 122)   # kick-pad teal (not the shoe blue, so the sole and the pad stay two shapes)


def strike(rim=RIMS['strike'], ax=92, ay=138, ang=0, sc=1.1):
    """v4 (premium pass): a front kick landing on a kick pad. The same rigid shin, ankle and flexed shoe as Disarm (sole to the pad), a gold burst where they meet,
    and a teal pad with a gold target. 0 toes."""
    a = medallion(rim)
    c = face_clip()
    a.shape(poly(rrect_pts(180, 128, 40, 92, 14)), PAD, PAD_S, lighten(PAD, .35), ow=3.2, band=5, clip=c)
    a.shape(circ(180, 128, 15), GOLD, GOLD_S, (255, 232, 140), ow=2.4, band=3, clip=c)
    a.shape(circ(180, 128, 6), PAD_S, None, None, ow=0, clip=c)
    G, fl = kick_leg(a, (ax, ay), ang, -14, sc, 120, c)
    bx, by = G([(16, 56)], fl)[0]
    burst(a, bx + 4, by, 7, 15, 8, .2, clip=c)
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


def jumping_spins(rim=RIMS['strike'], kx=186, ky=98, kang=-20, hx=114, ttop=84, belt=130, hip=160, sw=48, ww=40, hr=22,
           sl=((-9, 152), (-4, 176), (-12, 196)), arw=70, arrow_y=152, ary=15, head=27, W=152, H=152, cx=128, cy=121):
    """v5 pass 2: slim kid, slightly tapered jacket over pants with a belt break (belt, knot, tails), a natural standing leg (thigh, bent knee, shin, flat shoe),
    the spin kick, a big spin arrowhead, ink-dark outlines for grey legibility. 1 fist, 0 fingers, 0 toes."""
    med = medallion(rim); a = Art(); bg = Art()
    fy = sl[2][1] + 19
    bg.shape(poly(rrect_pts(128, fy + 19, 230, 44, 10)), (214, 198, 134), (186, 168, 104), None, ow=0, band=4)
    for rx, ry, al in ((66, 11, .65), (44, 7, .85)):
        bg.line(ell_pts(120, fy, rx, ry, 0, 40), (70, 150, 215), 3, closed=True, a=al)
    bg.fill_mask(mask_of(poly(ell_pts(114, fy, 30, 6))), (60, 44, 30), .4)
    # spin arrow first: it wraps behind the body so the leg, belt and arrow never pile up
    front = [(hx + 8 + arw * math.cos(math.radians(t)), arrow_y + ary * math.sin(math.radians(t))) for t in range(10, 150, 7)]
    arrow(a, front, BLUE_S, 8, head, outline=(255, 252, 240))
    (h0, k0, a0) = [(hx + dx, y) for dx, y in sl]
    sleeve(a, h0, k0, 13, 11.5, ow=4.6, shade=GSH, band=6)
    sleeve(a, k0, (a0[0], a0[1] - 10), 11.5, 10.5, ow=4.6, shade=GSH, band=6)
    kick_leg(a, a0, 90, 0, .55, 14, None, r0=21, r1=18, **GK)
    kick_leg(a, (kx, ky), kang, -14, .62, 120, **GK)
    burst(a, kx + 30, ky - 2, 7, 15, 7, .2)
    jack = chaikin([(hx - sw / 2, ttop + 12), (hx - sw / 2 + 5, ttop), (hx + sw / 2 - 5, ttop), (hx + sw / 2, ttop + 12), (hx + ww / 2, belt), (hx - ww / 2, belt)], 2)
    pants = chaikin([(hx - ww / 2 - 1, belt - 4), (hx + ww / 2 + 1, belt - 4), (hx + ww / 2 + 3, hip - 6), (hx + ww / 2 - 4, hip), (hx - ww / 2 + 4, hip), (hx - ww / 2 - 3, hip - 6)], 2)
    a.shape(poly(pants), PANT, GSH, (255, 255, 250), ow=4.6, band=6)
    a.shape(poly(jack), GI, GSH, (255, 255, 250), ow=4.6, band=6)
    a.shape(poly(rrect_pts(hx, belt, ww + 6, 14, 5)), BELT, BELT_S, lighten(BELT, .3), ow=3.0, band=3)
    limb(a, (hx, ttop - 6), (hx, ttop + 6), 8, 8)
    head_front(a, hx, ttop - 26, hr)
    forearm_block(a, (hx - sw / 2 - 12, belt - 2), (hx - sw / 2 - 8, 96), 24, -math.pi / 2 + .1, 1, r_el=10, r_cuff=9, gband=6, **GK)
    place_fit(med, a, W, H, cx, cy, bg=bg)
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
