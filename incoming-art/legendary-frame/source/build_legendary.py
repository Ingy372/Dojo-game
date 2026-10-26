"""A-LEGENDARY: Legendary rarity frames in the P-MENU2 family (reuses incoming-art/menu2/source, read-only).
Rebuild: python3 incoming-art/legendary-frame/source/build_legendary.py
Writes sprites/{gear,found}/<name>.png + @2x and sprites/legendary.json, in the same sizes and layout as the menu2 epic frames."""
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(os.path.dirname(ROOT), 'menu2', 'source'))
import build_menu2 as bm
from mat import *

# v2 (Jay): golden ORANGE, not yellow. Every hue stays >= 0.06 (danger red is < 0.03).
OR = (242, 146, 34)        # deep golden-orange
OR_L = (255, 198, 104)     # light golden-orange
OR_D = (150, 74, 16)       # dark warm outline
OR_X = (110, 52, 14)       # darkest warm edge
WG_L = (255, 238, 200)     # warm radiant white
RAD = (255, 168, 60)       # orange radiant halo
GEM = (255, 186, 40); GEM_D = (196, 104, 12)
GOLD, GOLD_L, GOLD_D = OR, OR_L, OR_D   # local override: the shared menu2 palette is not touched
bm.OUT = os.path.join(ROOT, 'sprites')
bm.MAN = {"about": "A-LEGENDARY frames, P-MENU2 family. Made by source/build_legendary.py; do not edit by hand. Sizes are 1x px; every file has an @2x twin.", "sprites": {}}


def rays(img, cx, cy, r0, r1, k, col, alpha, width):
    """soft sunburst spikes behind/around a shape: the 'radiant edge'."""
    W, H = img.size
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    for i in range(k):
        a = -math.pi / 2 + i * 2 * math.pi / k
        aw = width / r1
        pts = [(cx + math.cos(a - aw) * r0, cy + math.sin(a - aw) * r0), (cx + math.cos(a) * r1, cy + math.sin(a) * r1),
               (cx + math.cos(a + aw) * r0, cy + math.sin(a + aw) * r0)]
        d.polygon(pts, fill=255)
    fill(img, col, blur(m, S(0.5)), alpha)


def crest(d, cx, ty, s):
    """top crest: an amber diamond gem with a dark warm setting and a white facet."""
    def dia(r, col): d.polygon([(cx, ty - r * 1.25), (cx + r, ty), (cx, ty + r * 1.25), (cx - r, ty)], fill=col)
    dia(s * 1.25, C(OR_X)); dia(s * 1.0, C(GEM_D)); dia(s * 0.78, C(GEM))
    d.polygon([(cx - s * 0.45, ty - s * 0.05), (cx, ty - s * 0.75), (cx + s * 0.05, ty - s * 0.2)], fill=C((255, 248, 220)))
    for sx in (-1, 1): bm.star4(d, cx + sx * s * 1.9, ty + s * 0.2, s * 0.55, C(WG_L), 0.3)


def tile_legendary(n=72, seed=42, tall=None, top=True):
    M = 6 if n >= 60 else 4
    w, h = n + 2 * M, (tall or n) + 2 * M
    r = 12 * n / 72
    # gilded frame: honey/gold wood + white-gold rim + a pale radiant halo in the glow margin
    img, m, inner = bm.framed(w, h, r, [M, M, M, M], seed, frame_w=4.5 * n / 72, face='paper', rim_col=(232, 118, 18),
                              glow_col=RAD, wood_cols=((214, 112, 22), OR_X, OR))
    bm.lacquer(img, m, 0.22, 0.35, 0.5)
    hl = msub(inner, inner.filter(ImageFilter.MinFilter(S(0.8) * 2 + 1)))
    fill(img, WG_L, hl, 0.95)
    outline(img, m, OR_X, 1.3)
    W, H = img.size
    bb = inner.getbbox()
    # inner glow: warm orange light along the inside of the frame
    ig = blur(msub(inner, inner.filter(ImageFilter.MinFilter(S(3) * 2 + 1))), S(1.6))
    fill(img, RAD, mmul(ig, inner), 0.55)
    # white-gold band at the bottom of the face (same place as other rarities' band), brighter + a sheen line
    band = Image.new('L', (W, H), 0)
    ImageDraw.Draw(band).rectangle([0, bb[3] - S(7 * n / 72), W, H], fill=255)
    fill(img, (240, 150, 44), mmul(band, inner), 0.7)
    line = Image.new('L', (W, H), 0)
    ImageDraw.Draw(line).rectangle([0, bb[3] - S(7 * n / 72), W, bb[3] - S(7 * n / 72) + S(1)], fill=255)
    fill(img, WG_L, mmul(line, inner), 0.9)
    # soft white-gold sunrise inside the face, top centre (light, so the icon stays readable)
    fill(img, WG_L, mmul(inner, rgrad(W, H, W / 2, bb[1], (bb[3] - bb[1]) * 0.9, (255,) * 3, (0,) * 3).convert('L')), 0.35)
    d = ImageDraw.Draw(img)
    # 4 corner stars (as epic) but larger and white-gold, plus a crown sparkle on the top rail
    for (x, y) in [(bb[0] + S(5), bb[1] + S(5)), (bb[2] - S(5), bb[1] + S(5)), (bb[0] + S(5), bb[3] - S(5)), (bb[2] - S(5), bb[3] - S(5))]:
        bm.star4(d, x, y, S(5.2 * min(1, n / 60)), C(OR_X))
        bm.star4(d, x, y, S(4.2 * min(1, n / 60)), C(OR))
        bm.star4(d, x, y, S(1.7 * min(1, n / 60)), C((255, 255, 255), 230))
    if top: top_crest(img, m, n)
    return img, m


def top_crest(img, m, n):
    d = ImageDraw.Draw(img)
    cx, ty = img.size[0] / 2, m.getbbox()[1] + S(2.6 * n / 72)
    s = S(5.2 * n / 72)
    rays(img, cx, ty, s * 0.3, s * 2.6, 12, OR, 0.85, s * 0.32)
    rays(img, cx, ty, s * 0.2, s * 1.7, 12, WG_L, 0.6, s * 0.18)
    crest(d, cx, ty, s * 0.85)


def ring_legendary(n=56, state='normal'):
    img = canvas(n, n)
    W = S(n); c = W / 2
    outer = ell(W, W, [S(3), S(3), W - S(3), W - S(3)])
    # radiant edge: short soft rays + pale halo in the 3 px margin (always on: that is the legendary tell)
    rays(img, c, c, W / 2 - S(4), W / 2 - S(0.1), 24, OR, 1.0, S(1.3))
    glow(img, outer, RAD if state != 'glow' else (255, 214, 120), 2.5, 0.75 if state != 'glow' else 0.95, grow=0.5)
    drop_shadow(img, outer, 1.6, 1.8, 0.4)
    hole = ell(W, W, [S(10), S(10), W - S(10), W - S(10)])
    band = msub(outer, hole)
    tex(img, rgrad(W, W, c * .7, c * .55, W * .7, OR_L, (206, 110, 24)), band)
    en = msub(ell(W, W, [S(5.5), S(5.5), W - S(5.5), W - S(5.5)]), ell(W, W, [S(8), S(8), W - S(8), W - S(8)]))
    fill(img, (255, 176, 66), en)
    fill(img, (255, 255, 255), mmul(en, rgrad(W, W, c * .7, c * .4, W * .5, (255,) * 3, (0,) * 3).convert('L')), 0.6)
    bevel(img, band, 1.0, 1.0, hi_a=0.85, lo_a=0.45)
    d = ImageDraw.Draw(img)
    for i in range(8):   # 8 studs like epic, but as white-gold 4-point stars
        a = -math.pi / 2 + i * 2 * math.pi / 8
        x, y = c + math.cos(a) * S(n / 2 - 6.75), c + math.sin(a) * S(n / 2 - 6.75)
        bm.star4(d, x, y, S(3.2), C(GOLD_D), 0.35)
        bm.star4(d, x, y, S(2.4), C(WG_L), 0.35)
    tex(img, rgrad(W, W, c, c * 1.15, S(20), PAPER_L, PAPER_D), hole)
    fill(img, WG_L, mmul(hole, rgrad(W, W, c, c * .7, S(14), (255,) * 3, (0,) * 3).convert('L')), 0.25)
    inner_shadow(img, hole, 2.2, 2.2, 0.45)
    outline(img, outer, OR_X, 1.0)
    crest(d, c, S(4.5), S(3.4))
    if state == 'pressed':
        fill(img, SHADOW, outer, 0.12)
    return img


def build():
    img, m = tile_legendary(72, 42, tall=88)
    bm.save('gear', 'bag-tile-legendary', img, 84, 100, drawRect=[6, 6, 72, 88], state='normal',
            note="A-LEGENDARY rarity frame, gear bag tile 72 x 88 (file 84 x 100), same layout as bag-tile-epic. Gilded frame, white-gold rim, radiant halo in the 6 px margin, 4 white-gold corner stars + crown sparkle. Icon 56 at top, centred x, centre y 40.")
    for i, fr in enumerate(bm.shine_frames(m, 6, alpha=0.6)):
        bm.save('gear', f'bag-tile-legendary-shine-{i}', fr, 84, 100, layer='optional overlay', fps=16,
                note="EXTRA/OPTIONAL (epic has no shine): sweep across the legendary bag tile when it is first found or shown. 6 frames, 16 fps, play once; skip under Reduced motion.")
    # 9-slice version: same frame with no top crest (corners fit inside 20 px insets), crest as its own overlay
    img9, m9 = tile_legendary(72, 42, tall=88, top=False)
    bm.save('gear', 'bag-tile-legendary-9slice', img9, 84, 100, drawRect=[6, 6, 72, 88], slice=[20, 20, 20, 20],
            note="9-slice-safe legendary bag tile: insets 20 px each side (1x). Stretch the middle; add bag-tile-legendary-crest on top, centred x, top-aligned.")
    cr = canvas(84, 100); top_crest(cr, m9, 72)
    bm.save('gear', 'bag-tile-legendary-crest', cr, 84, 100, layer='overlay', note="Crest + rays overlay for the 9-slice tile. Keep it centred x at the top edge; do not stretch.")
    img, m = tile_legendary(52, 43)
    bm.save('found', 'found-tile-legendary', img, 60, 60, drawRect=[4, 4, 52, 52], note="Last run found tile 52 (file 60), legendary. Icon 40.")
    for i, fr in enumerate(bm.shine_frames(m, 6, alpha=0.6)):
        bm.save('found', f'found-tile-legendary-shine-{i}', fr, 60, 60, layer='optional overlay', fps=16, note="EXTRA/OPTIONAL shine, as above.")
    for st in ('normal', 'glow', 'pressed'):
        bm.save('gear', f'gear-ring-legendary{"" if st == "normal" else "-" + st}', ring_legendary(56, st), 56, 56, state=st,
                note="A11 gear ring 56, legendary. Icon 36 centred. Radiant rays + white-gold studs. 'glow' = target slot (honey glow, as other rarities).")
    with open(os.path.join(bm.OUT, 'legendary.json'), 'w') as fh:
        json.dump(bm.MAN, fh, indent=1)
    print(len(bm.MAN['sprites']), 'sprites')


if __name__ == '__main__':
    build()
