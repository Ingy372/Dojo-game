"""G2B-44 sample Strike icons. Pillow only, same toon kit as the approved PB-07 medallions.
No outside art pack. No Blender: these are the 2D medallion family, not 3D world sprites.
The kit lives in incoming-art/icons-slots/source (project code, already on main).

Ids and sources (nothing invented):
  butterfly-flow  Strike #3, Orange, beta. content/abilities/strikes.json.
                  docs/curriculum.md combo 3: same as 2, plus a round kick and a tornado kick
                  (the school calls it a butterfly kick). Game shape: spins the other way from
                  Jumping Spins (drafts/planning/R-G2B-strikes-4-7.md).
  side-kick-drive Strike #4, Green. Redesign name. Jay, curriculum combo 4: step-behind side kicks.
                  Game shape: steps in and drives the other person back.
  hook-kick       Strike #5, Blue. Jay, Nov 8 (J20): the name is Hook Kick. Curriculum combo 5
                  includes a step-behind hook kick. J19: it reaches around a guard.

#1 spin-kick is not drawn here. The merged strike.png is the slot picture (a front kick on a pad).
jumping-spins.png is Strike #2. Neither is the spinning outside kick that ends combo 1.
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SLOTS = os.path.normpath(os.path.join(HERE, '..', '..', 'icons-slots', 'source'))
sys.path.insert(0, SLOTS)

from seal_icons import (  # noqa: E402
    BELT_OPTIONS, BLUE_S, CREAM, GOLD, GOLD_S, GSH, INKC, PAD, PAD_S, PANT, RIMS,
    SKIN, SKIN_S, arrow, burst, chaikin, head_front, hip_high_kick, kick_leg,
    lighten, medallion, place, sleeve, wide_clip,
)
from toon import Art  # noqa: E402

PINE, PINE_S = BELT_OPTIONS['pine']
# Same growth as the approved Jumping Spins figure, so these sit at the same size in the slot.
SCALE = 1.24


def _finish(art):
    med = medallion(RIMS['strike'])
    s = SCALE
    place(med, art, s, 128 * (1 - s), 128 * (1 - s), wide_clip())
    return med.result()


def _support(a, hx=118):
    """the same standing leg as Jumping Spins: a small knee bend, shoe, no toes."""
    stand = ((-8, 154), (6, 174), (-6, 200))
    (h0, k0, a0) = [(hx + dx, y) for dx, y in stand]
    sleeve(a, h0, k0, 13, 11.5, ow=4.6, shade=GSH, band=6)
    sleeve(a, k0, (a0[0], a0[1] - 10), 11.5, 10.5, ow=4.6, shade=GSH, band=6)
    kick_leg(a, a0, 90, 0, .55, 14, None, r0=21, r1=18, gow=4.6, gshade=GSH)


def _torso(a, hx=118, ttop=86, belt_y=132, hip=160, sw=46, ww=38, hr=22, lean=0):
    jack = chaikin([
        (hx - sw / 2 - lean, ttop + 12), (hx - sw / 2 + 5 - lean, ttop),
        (hx + sw / 2 - 5 - lean, ttop), (hx + sw / 2 - lean, ttop + 12),
        (hx + ww / 2, belt_y), (hx - ww / 2, belt_y),
    ], 2)
    pants = chaikin([
        (hx - ww / 2 - 1, belt_y - 4), (hx + ww / 2 + 1, belt_y - 4),
        (hx + ww / 2 + 3, hip - 6), (hx + ww / 2 - 4, hip),
        (hx - ww / 2 + 4, hip), (hx - ww / 2 - 3, hip - 6),
    ], 2)
    a.shape(poly_of(pants), PANT, GSH, (255, 255, 250), ow=4.6, band=6)
    a.shape(poly_of(jack), CREAM_GI, GSH, (255, 255, 250), ow=4.6, band=6)
    a.shape(poly_of_rect(hx, belt_y, ww + 6, 14, 5), PINE, PINE_S, lighten(PINE, .3), ow=3.0, band=3)
    from seal_icons import limb
    limb(a, (hx - lean * .5, ttop - 4), (hx - lean * .2, ttop + 8), 8, 8)
    head_front(a, hx - lean, ttop - 26, hr)
    from seal_icons import forearm_block
    forearm_block(a, (hx - sw / 2 - 10 - lean, belt_y), (hx - sw / 2 - 6 - lean, ttop + 8), 22, -math.pi / 2, 1, r_el=10, r_cuff=9, gband=6, gow=4.6, gshade=GSH)


def poly_of(pts):
    from toon import poly
    return poly(pts)


def poly_of_rect(cx, cy, w, h, r):
    from toon import poly, rrect_pts
    return poly(rrect_pts(cx, cy, w, h, r))


CREAM_GI = (250, 246, 236)


def butterfly_flow():
    """#3. A tornado kick (the school's butterfly kick): one leg swings in a round arc,
    and the spin arrow runs the other way from Jumping Spins (head on the right)."""
    a = Art()
    hx = 108
    _support(a, hx)
    # round / tornado sweep: one straight leg out at chest height. Not Jumping Spins' 45-degree line.
    hip_pt = (hx + 4, 148)
    ankle = (hip_pt[0] + 58, hip_pt[1] - 36)
    knee = ((hip_pt[0] + ankle[0]) / 2, (hip_pt[1] + ankle[1]) / 2)
    sole = hip_high_kick(a, hip_pt, knee, ankle, flex=18)
    burst(a, sole[0], sole[1], 6, 13, 7, .15)
    _torso(a, hx, lean=6)
    # spin the other way from Jumping Spins: head on the right, in the cream under the kick, not through the legs
    pts = [(hx - 10, 176), (hx + 24, 188), (hx + 58, 176)]
    arrow(a, pts, BLUE_S, 14, 28, outline=INKC, ink_ow=4.6, spread=0.9)
    return _finish(a)


def side_kick_drive():
    """#4. The step-behind side kick that drives forward. Heel toward the target, a short straight arrow."""
    a = Art()
    hx = 108
    _support(a, hx)
    hip_pt = (hx + 8, 150)
    # nearly level side kick, a few degrees up so the heel is at hip height
    reach, deg = 68.0, 8.0
    ankle = (hip_pt[0] + reach * math.cos(math.radians(deg)), hip_pt[1] - reach * math.sin(math.radians(deg)))
    knee = ((hip_pt[0] + ankle[0]) / 2, (hip_pt[1] + ankle[1]) / 2)
    sole = hip_high_kick(a, hip_pt, knee, ankle, flex=8)
    burst(a, sole[0], sole[1], 6, 12, 6, .1)
    # drive arrow sits ABOVE the shin, head past the heel, so it does not replace the leg
    arrow(a, [(hip_pt[0] + 18, hip_pt[1] - 22), (sole[0] - 4, sole[1] - 20), (sole[0] + 14, sole[1] - 18)],
          BLUE_S, 12, 22, outline=INKC, ink_ow=4.6, spread=0.85)
    _torso(a, hx, lean=0)
    return _finish(a)


def hook_kick():
    """#5. Hook kick: the leg reaches around. Heel comes back. Curved arrow shows the hook.
    A pad stands in for the guard it reaches around. No person is drawn as the target."""
    a = Art()
    hx = 104
    _support(a, hx)
    # thigh lifts forward, shin folds back, heel returns. The bend is the hook.
    hip_pt = (hx + 10, 156)
    knee = (hip_pt[0] + 52, hip_pt[1] - 48)
    # the heel comes all the way back, past the hip, so the hook reads as a hook and not a straight kick
    ankle = (hip_pt[0] - 28, hip_pt[1] - 36)
    from toon import poly, rrect_pts
    a.shape(poly(rrect_pts(knee[0] + 16, knee[1] + 4, 18, 40, 8)), PAD, PAD_S, lighten(PAD, .35), ow=3.2, band=4)
    sole = hip_high_kick(a, hip_pt, knee, ankle, flex=50)
    # arrow in the cream above the hook, head pointing back with the heel. It does not cover the shoe.
    arrow(a, [(hip_pt[0] + 18, hip_pt[1] - 34), (knee[0] + 4, knee[1] - 22), (ankle[0] + 8, ankle[1] - 22)],
          BLUE_S, 11, 22, outline=INKC, ink_ow=4.6, spread=0.88)
    burst(a, ankle[0], ankle[1], 6, 12, 6, .15)
    _torso(a, hx, lean=4)
    return _finish(a)


ALL = {
    'butterfly-flow': butterfly_flow,
    'side-kick-drive': side_kick_drive,
    'hook-kick': hook_kick,
}

def sheet():
    from PIL import Image, ImageDraw, ImageFont, ImageOps
    out = os.path.join(HERE, '..', 'preview')
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    cells = [
        ('Jumping Spins #2, approved', os.path.join(SLOTS, '..', 'sprites', 'jumping-spins@2x.png')),
        ('Strike slot, approved', os.path.join(SLOTS, '..', 'sprites', 'strike@2x.png')),
        ('#3 Butterfly Flow', os.path.join(out, 'butterfly-flow-full.png')),
        ('#4 Side Kick Drive', os.path.join(out, 'side-kick-drive-full.png')),
        ('#5 Hook Kick', os.path.join(out, 'hook-kick-full.png')),
    ]
    big = 300
    sizes = (128, 96, 64, 40, 30)
    col = 420
    pad = 20
    # each column: label, large, then colour sizes, then grey sizes
    size_block = 20 + 128 + 8
    H = pad + 28 + big + 16 + size_block + 8 + size_block + pad
    W = pad + len(cells) * col
    img = Image.new('RGB', (W, H), (28, 26, 24))
    d = ImageDraw.Draw(img)
    d.text((pad, 6), 'G2B-44 drafts beside the approved Strike family. Under each: colour, then grey, at 128, 96, 64, 40, 30.', fill=(250, 246, 236), font=small)
    for i, (label, path) in enumerate(cells):
        x = pad + i * col
        y = 36
        d.text((x, y), label, fill=(250, 246, 236), font=small)
        im = Image.open(path).convert('RGBA')
        big_im = im.resize((big, big), Image.LANCZOS)
        tile = Image.new('RGBA', (big, big), (28, 26, 24, 255))
        tile.alpha_composite(big_im)
        img.paste(tile.convert('RGB'), (x, y + 24))
        y2 = y + 24 + big + 8
        for grey, word in ((False, 'colour'), (True, 'grey')):
            d.text((x, y2), word, fill=(250, 246, 236), font=small)
            sx = x
            sy = y2 + 22
            for sz in sizes:
                one = im.resize((sz, sz), Image.LANCZOS)
                if grey:
                    g = ImageOps.grayscale(one)
                    one = Image.merge('RGBA', (g, g, g, one.split()[-1]))
                box = Image.new('RGBA', (sz, sz + 16), (28, 26, 24, 255))
                ImageDraw.Draw(box).text((0, 0), str(sz), fill=(200, 190, 170), font=small)
                box.alpha_composite(one, (0, 16))
                img.paste(box.convert('RGB'), (sx, sy))
                sx += sz + 6
            y2 = sy + 128 + 10
    img.save(os.path.join(out, 'sheet-g2b44-samples.png'))
    print('sheet', img.size)


if __name__ == '__main__':
    out = os.path.join(HERE, '..', 'preview')
    os.makedirs(out, exist_ok=True)
    for n, fn in ALL.items():
        fn().save(os.path.join(out, n + '-full.png'))
        print(n)
    sheet()
