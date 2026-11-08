"""B3: the four FINAL Board tab icons (Climb, Gear, Abilities, Gate). Pillow + numpy only (toon kit).
Each is drawn in a 256 unit box with a thick dark outline so it reads at 26 pt on a wood tab AND on the raised gold tab.
No red. No text. Climb = pagoda tower, Gear = dojo duffel bag, Abilities = mitten fist with a gold spark, Gate = blue gate with a gold lock.
  render(kind, px) -> RGBA px x px   (px = device pixels for the 26 pt box: 26 at 1x, 52 at @2x)"""
import math
from PIL import Image
import toon as T
from toon import Art, poly, circ, rrect_pts, ell_pts, arc_pts, star_pts, lighten, darken, CREAM, CREAM_S, GOLD, GOLD_S, BLUE, BLUE_S, SKIN, SKIN_S, WOOD, WOOD_S, INKC

OW = 8.5            # outline weight in U: about 0.9 pt at 26 pt
HONEY, HONEY_S = (232, 176, 98), (190, 128, 62)
DARK = (74, 52, 60)
KINDS = ('climb', 'gear', 'abilities', 'gate')


def rr(cx, cy, w, h, r):
    return poly(rrect_pts(cx, cy, w, h, r))


def climb():
    a = Art()
    a.shape(rr(128, 205, 104, 42, 8), CREAM, CREAM_S, lighten(CREAM, .5), OW, 7)            # tier 1 body
    a.shape(poly(rrect_pts(128, 212, 28, 34, 14)), DARK, None, None, 5, 4)                   # door
    a.shape(poly([(30, 190), (226, 190), (194, 154), (62, 154)]), HONEY, HONEY_S, lighten(HONEY, .5), OW, 7)   # roof 1
    a.shape(rr(128, 142, 76, 38, 7), CREAM, CREAM_S, lighten(CREAM, .5), OW, 6)             # tier 2 body
    a.shape(rr(104, 146, 12, 15, 3), DARK, None, None, 3, 3)
    a.shape(rr(152, 146, 12, 15, 3), DARK, None, None, 3, 3)
    a.shape(poly([(52, 132), (204, 132), (174, 98), (82, 98)]), HONEY, HONEY_S, lighten(HONEY, .5), OW, 7)     # roof 2
    a.shape(rr(128, 92, 46, 30, 6), CREAM, CREAM_S, lighten(CREAM, .5), OW, 5)              # tier 3 body
    a.shape(rr(128, 96, 11, 14, 3), DARK, None, None, 3, 3)
    a.shape(poly([(76, 84), (180, 84), (128, 34)]), HONEY, HONEY_S, lighten(HONEY, .5), OW, 7)                  # roof 3
    a.shape(circ(128, 26, 12), GOLD, GOLD_S, lighten(GOLD, .5), 6, 4)                       # finial
    return a.result(1024)


def gear():
    a = Art()
    # handle: a thick loop on top (outline first, then the strap colour)
    arc = arc_pts(128, 100, 52, math.pi * 1.05, math.pi * 1.95, 14)
    a.line(arc, INKC, 28)
    a.line(arc, CREAM_S, 15)
    a.shape(rr(128, 156, 176, 112, 38), BLUE, BLUE_S, lighten(BLUE, .45), OW, 9)         # bag body
    a.shape(rr(128, 126, 176, 50, 24), lighten(BLUE, .18), BLUE_S, lighten(BLUE, .6), OW, 7)    # flap
    a.shape(rr(128, 168, 20, 70, 6), CREAM, CREAM_S, lighten(CREAM, .5), 6, 4)               # strap band
    a.shape(rr(128, 148, 44, 32, 9), GOLD, GOLD_S, lighten(GOLD, .55), 7, 5)                 # buckle
    a.shape(circ(128, 148, 6), DARK, None, None, 2, 2)
    return a.result(1024)


def abilities():
    a = Art()
    a.shape(poly(star_pts(128, 120, 66, 108, 8, math.pi / 8)), GOLD, GOLD_S, lighten(GOLD, .55), OW, 7)     # gold spark behind
    a.shape(rr(128, 214, 88, 36, 10), CREAM, CREAM_S, lighten(CREAM, .5), OW, 6)               # sleeve cuff
    a.shape(rr(128, 144, 106, 94, 36), SKIN, SKIN_S, lighten(SKIN, .45), OW, 8)               # mitten fist
    a.shape(rr(104, 150, 58, 38, 17, ), SKIN, SKIN_S, lighten(SKIN, .5), 6.5, 5)               # thumb across the front
    return a.result(1024)


def gate():
    a = Art()
    a.shape(rr(128, 156, 150, 112, 4), (126, 108, 176), (98, 82, 148), None, 5, 6)             # dusk-lit opening
    a.shape(rr(64, 150, 28, 134, 8), CREAM, CREAM_S, lighten(CREAM, .5), OW, 6)               # posts
    a.shape(rr(192, 150, 28, 134, 8), CREAM, CREAM_S, lighten(CREAM, .5), OW, 6)
    a.shape(rr(128, 100, 204, 24, 10), BLUE, BLUE_S, lighten(BLUE, .45), OW, 6)               # lower beam
    a.shape(poly([(20, 80), (236, 80), (214, 48), (42, 48)]), BLUE, BLUE_S, lighten(BLUE, .45), OW, 7)    # roof beam
    arc = arc_pts(128, 158, 17, math.pi, 2 * math.pi, 10)                                     # gold padlock
    a.line(arc, INKC, 17)
    a.line(arc, GOLD_S, 8)
    a.shape(rr(128, 182, 50, 42, 11), GOLD, GOLD_S, lighten(GOLD, .55), 6.5, 5)
    a.shape(circ(128, 180, 6), DARK, None, None, 2, 2)
    return a.result(1024)


DRAW = {'climb': climb, 'gear': gear, 'abilities': abilities, 'gate': gate}
_cache = {}


def render(kind, px):
    if kind not in _cache:
        _cache[kind] = DRAW[kind]()
    return _cache[kind].resize((int(px), int(px)), Image.LANCZOS)


if __name__ == '__main__':
    import sys
    for k in KINDS:
        render(k, 256).save(f'/tmp/tabicon_{k}.png')
