"""L8-A1: base medallion for Lock group B (wrist locks). Same kit and medallion as the PB-07 Seal families
(icons-slots/source). Picture: the student's two hands fold a shadow creature's paw down at the wrist.
Mitten hands (0 fingers to count), a soft rounded paw, one curved arrow for the fold."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'icons-slots', 'source'))
from seal_icons import *          # noqa: F401,F403  (medallion, sleeve, mitten_fist, arrow, LINE, wide_clip, place ...)

LOCK_RIM = (104, 112, 204)        # indigo. Lock family colour (placeholder; both Lock groups would share it)
SHADOW, SHADOW_S, SHADOW_H = (66, 76, 128), (44, 50, 92), (112, 122, 176)
# v2: the creature's arm and paw in a lighter dusk lilac, so they stand clear of the indigo rim and the cream face
PAW, PAW_S, PAW_H = (150, 138, 196), (104, 92, 152), (196, 188, 232)
CLAW, CLAW_S = (255, 252, 242), (214, 206, 190)


def claws(a, px, py, ang, n=3, spread=13, reach=30, size=8):
    """short rounded claws poking out of a paw tip (kid-friendly: blunt, cream, ink outlined)"""
    ca, sa = math.cos(ang), math.sin(ang)
    for k in range(n):
        off = (k - (n - 1) / 2) * spread
        bx, by = px + (-sa) * off * -1 + ca * 0, py
        # in paw space: x across, y along (down = toward the tip)
        lx, ly = off, reach
        tx, ty = off * 1.05, reach + size * 1.5
        pts = [(lx - size * .55, ly), (lx + size * .55, ly), (tx, ty)]
        pts = [(px + x * ca - y * sa, py + x * sa + y * ca) for x, y in pts]
        a.shape(poly(pts), CLAW, CLAW_S, None, ow=2.8, band=1.5)


def paw(a, px, py, ang, w=46, h=48, ow=4.6):
    """a clear cartoon paw: rounded palm block with 3 toe lobes at the tip and 3 blunt claws"""
    ca, sa = math.cos(ang), math.sin(ang)
    T = lambda x, y: (px + x * ca - y * sa, py + x * sa + y * ca)
    claws(a, px, py, ang, reach=h * .5 + 6, spread=w * .3, size=7.5)
    a.shape(poly(rrect_pts(px, py, w, h, 18, ang)), PAW, PAW_S, PAW_H, ow=ow, band=4)
    for k in (-1, 0, 1):
        x, y = T(k * w * .3, h * .5 - 2)
        a.shape(circ(x, y, 9.5), PAW, PAW_S, PAW_H, ow=3.4, band=2.5)



def kid_arm(a, el, wr, fs, side, ow):
    ex, ey = el; wx, wy = wr
    ang = math.atan2(wy - ey, wx - ex); ux, uy = math.cos(ang), math.sin(ang)
    sleeve(a, (ex, ey), (wx - ux * 8, wy - uy * 8), 17, 14, ow=ow, shade=GSH, band=5)
    a.shape(poly(rrect_pts(wx - ux * 8, wy - uy * 8, 9, 2 * 14 + 3, 3.5, ang)), GI, GSH, (255, 255, 250), ow=ow - .6, band=2.4)
    limb(a, (wx - ux * 5, wy - uy * 5), (wx + ux * 8, wy + uy * 8), 7.6, 8, )
    return wx + ux * (8 + fs * .42), wy + uy * (8 + fs * .42), ang


def disc_clip(r):
    m = Image.new('L', (P(U), P(U)), 0)
    ImageDraw.Draw(m).ellipse([P(128 - r), P(128 - r), P(128 + r), P(128 + r)], fill=255)
    return m


def lock_wrist(rim=LOCK_RIM, arrow_on=True, wrist=(130, 94), paw_ang=0.42):
    """v2: lighter lilac paw with toes and claws, so the fold at the wrist reads at a glance"""
    a = Art(); ow = LINE['now']
    # the creature's forearm comes in from the right; its paw is folded DOWN at the wrist
    a.shape(cap((236, 92), wrist, 20, 17), PAW, PAW_S, PAW_H, ow=ow, band=5)
    paw(a, wrist[0] - 10, wrist[1] + 32, paw_ang, w=50, h=48, ow=ow)
    # student hand B (lower right) grips the forearm from below, holding it still
    fx, fy, ang = kid_arm(a, (232, 214), (200, 136), 30, 1, ow)
    mitten_fist(a, fx, fy, 31, ang, 1)
    # student hand A (lower left) presses the back of the paw, folding it in toward the forearm
    fx, fy, ang = kid_arm(a, (30, 222), (60, 168), 30, -1, ow)
    mitten_fist(a, fx, fy, 31, ang, -1)
    if arrow_on:
        arrow(a, [(150, 54), (118, 46), (94, 58), (84, 84)], darken(rim, .05), 11, 21, outline=INKC, ink_ow=4.0, spread=0.85, head_mul=1.0)
    med = medallion(rim)
    place(med, a, 1.0, 0, 0, disc_clip(97))
    return med.result()


def lock_arm(rim=LOCK_RIM, arrow_on=True):
    """Lock group A (arm bar): the creature's arm lies straight across; one kid hand holds its wrist,
    the other presses down just above the elbow. A short down arrow shows the press."""
    a = Art(); ow = LINE['now']
    el = (150, 118)
    a.shape(cap((240, 112), el, 21, 19), PAW, PAW_S, PAW_H, ow=ow, band=5)        # upper arm (from the right edge)
    a.shape(cap(el, (96, 118), 19, 16), PAW, PAW_S, PAW_H, ow=ow, band=5)           # forearm, straight
    paw(a, 76, 120, 1.5, w=40, h=38, ow=ow)                                          # paw at the left, pointing left
    # kid hand A (lower left) grips the creature's wrist from below
    fx, fy, ang = kid_arm(a, (60, 232), (96, 166), 30, -1, ow)
    mitten_fist(a, fx, fy, 31, ang, -1)
    # kid hand B (upper right) presses down on top of the arm just above the elbow
    fx, fy, ang = kid_arm(a, (226, 30), (178, 72), 30, 1, ow)
    mitten_fist(a, fx, fy, 31, ang, 1)
    if arrow_on:   # the press: a short arrow down, beside hand B
        arrow(a, [(132, 36), (132, 58), (134, 82)], darken(rim, .05), 11, 21, outline=INKC, ink_ow=4.0, spread=0.85, head_mul=1.0)
    med = medallion(rim)
    place(med, a, 1.0, 0, 0, disc_clip(97))
    return med.result()


if __name__ == '__main__':
    im = Image.new('RGBA', (528, 256), (244, 232, 210, 255))
    im.alpha_composite(lock_wrist().resize((256, 256), Image.LANCZOS), (0, 0))
    im.alpha_composite(lock_arm().resize((256, 256), Image.LANCZOS), (272, 0))
    im.save('/tmp/lw3.png')
