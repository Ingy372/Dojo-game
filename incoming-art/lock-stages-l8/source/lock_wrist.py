"""L8-A1: base medallion for Lock group B (wrist locks). Same kit and medallion as the PB-07 Seal families
(icons-slots/source). Picture: the student's two hands fold a shadow creature's paw down at the wrist.
Mitten hands (0 fingers to count), a soft rounded paw, one curved arrow for the fold."""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'icons-slots', 'source'))
from seal_icons import *          # noqa: F401,F403  (medallion, sleeve, mitten_fist, arrow, LINE, wide_clip, place ...)

LOCK_RIM = (104, 112, 204)        # indigo. Lock family colour (placeholder; both Lock groups would share it)
SHADOW, SHADOW_S, SHADOW_H = (66, 76, 128), (44, 50, 92), (112, 122, 176)


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


def lock_wrist(rim=LOCK_RIM, arrow_on=True, wrist=(122, 98), paw_ang=-0.38):
    a = Art(); ow = LINE['now']
    # the shadow creature's forearm comes in from the right; its soft rounded paw is folded DOWN at the wrist
    a.shape(cap((236, 92), wrist, 20, 17), SHADOW, SHADOW_S, SHADOW_H, ow=ow, band=5)
    px, py = wrist[0] + 8, wrist[1] + 32
    a.shape(poly(rrect_pts(px, py, 44, 50, 20, paw_ang)), SHADOW, SHADOW_S, SHADOW_H, ow=ow, band=5)
    for k in (-1, 0, 1):   # three soft knuckle bumps on the paw's tip, so it reads as a paw and not a knee
        bx, by = rot([(k * 12, 26)], 0, 0, paw_ang)[0]
        a.shape(circ(px + bx, py + by - 2, 7.5), SHADOW, SHADOW_S, None, ow=3.0, band=2)
    # student hand B (from the lower right) grips the forearm from below, holding it still
    fx, fy, ang = kid_arm(a, (222, 226), (174, 140), 30, 1, ow)
    mitten_fist(a, fx, fy, 31, ang, 1)
    # student hand A (from the lower left) presses the paw, folding it in toward the forearm
    fx, fy, ang = kid_arm(a, (44, 228), (80, 160), 30, -1, ow)
    mitten_fist(a, fx, fy, 31, ang, -1)
    if arrow_on:   # the fold: a curved arrow round the outside of the bend
        arrow(a, [(150, 54), (120, 48), (98, 60), (90, 86)], darken(rim, .05), 11, 21, outline=INKC, ink_ow=4.0, spread=0.85, head_mul=1.0)
    med = medallion(rim)
    s = 1.0
    place(med, a, s, 0, 0, disc_clip(97))
    return med.result()


if __name__ == '__main__':
    lock_wrist().resize((256, 256), Image.LANCZOS).save('/tmp/lw.png')
