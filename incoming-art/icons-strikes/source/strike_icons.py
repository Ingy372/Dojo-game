"""G2B-44 sample Strike icons. Pillow only, same toon kit as the approved PB-07 medallions.
No outside art pack. No Blender: these are the 2D medallion family, not 3D world sprites.
The kit lives in incoming-art/icons-slots/source (project code, already on main).

Ids and sources. Line numbers are in the Delivery Note. Nothing here is a pose the docs did not name.
  spin-kick       Strike #1. docs/curriculum.md:46 spinning outside kick (spin kick). Not a jump.
  butterfly-flow  Strike #3. docs/curriculum.md:48 names a round kick and a tornado kick
                  (butterfly kick). The pose is not described. Confirmation required.
  side-kick-drive Strike #4. docs/curriculum.md:49 step-behind side kick.
  hook-kick       Strike #5. docs/curriculum.md:50 step-behind hook kick. The returning heel is drawn larger.
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


def spin_kick():
    """#1. The finishing kick of combo 1: a spinning outside kick. Not a jump.
    docs/curriculum.md line 46 names it. The line does not give the angle or the height."""
    a = Art()
    hx = 114
    _support(a, hx)
    hip_pt = (hx + 2, 152)
    # across at chest height, so it is not the steep kick on Jumping Spins and not the front kick on the slot picture.
    # That height is a reading of "outside", which the curriculum lists apart from "front". The number is not in the docs.
    reach, deg = 66.0, 22.0
    ankle = (hip_pt[0] + reach * math.cos(math.radians(deg)), hip_pt[1] - reach * math.sin(math.radians(deg)))
    knee = ((hip_pt[0] + ankle[0]) / 2, (hip_pt[1] + ankle[1]) / 2)
    sole = hip_high_kick(a, hip_pt, knee, ankle, flex=14)
    burst(a, sole[0], sole[1], 6, 12, 6, .12)
    _torso(a, hx, lean=8)
    # one spin. The arrow sits in the cream. Combo 2 is the one with three jumping spins.
    arrow(a, [(hx - 40, 170), (hx - 6, 190), (hx + 30, 172)], BLUE_S, 14, 28, outline=INKC, ink_ow=4.6, spread=0.9)
    return _finish(a)


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
    """#5. Hook kick. The curriculum names a step-behind hook kick and does not give the angle.
    The heel is drawn large and in open space so the return reads at 30 px. A pad stands in for the guard."""
    a = Art()
    hx = 98
    _support(a, hx)
    hip_pt = (hx + 2, 164)
    knee = (hip_pt[0] + 48, hip_pt[1] - 18)
    # shin folds back and up. The shoe is large and sits in the cream, clear of the head and the fist.
    ankle = (knee[0] - 4, knee[1] - 34)
    from toon import poly, rrect_pts
    a.shape(poly(rrect_pts(knee[0] + 26, knee[1] + 4, 16, 32, 7)), PAD, PAD_S, lighten(PAD, .35), ow=3.2, band=4)
    # arrow first, so the returning shoe is drawn on top of it
    arrow(a, [(hip_pt[0] - 6, hip_pt[1] - 36), (knee[0] - 16, knee[1] - 40), (ankle[0] - 18, ankle[1] - 8)],
          BLUE_S, 12, 26, outline=INKC, ink_ow=4.6, spread=0.92)
    dx, dy = knee[0] - ankle[0], knee[1] - ankle[1]
    dist = math.hypot(dx, dy)
    ang = math.degrees(math.atan2(-dy / dist, -dx / dist))
    # bigger shoe than the other icons, so the returning heel is still a shape at 30 px
    kick_leg(a, ankle, ang, 0, 1.0, dist / 1.0, None, r0=15, r1=11, gow=4.6, gshade=GSH)
    sleeve(a, hip_pt, knee, 15, 12.5, ow=4.6, shade=GSH, band=6)
    _torso(a, hx, lean=0)
    return _finish(a)


ALL = {
    'spin-kick': spin_kick,
    'butterfly-flow': butterfly_flow,
    'side-kick-drive': side_kick_drive,
    'hook-kick': hook_kick,
}

def sheet():
    from PIL import Image, ImageDraw, ImageFont, ImageOps
    out = os.path.join(HERE, '..', 'preview')
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
    tiny = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    cells = [
        ('#2 Jumping Spins, approved',
         os.path.join(SLOTS, '..', 'sprites', 'jumping-spins@2x.png'),
         ['Reference, already on main.', 'docs/curriculum.md:47', '3 jumping spin kicks']),
        ('Strike slot, approved',
         os.path.join(SLOTS, '..', 'sprites', 'strike@2x.png'),
         ['Reference, already on main.', 'Front kick on a pad.', 'This is not combo 1.']),
        ('#1 Spin Kick',
         os.path.join(out, 'spin-kick-full.png'),
         ['docs/curriculum.md:46', 'spinning outside kick (spin kick)', 'Not a jump. Angle not in the doc.']),
        ('#3 Butterfly Flow',
         os.path.join(out, 'butterfly-flow-full.png'),
         ['docs/curriculum.md:48', 'round kick and butterfly kick', 'POSE NOT IN THE DOCS. Confirm.']),
        ('#4 Side Kick Drive',
         os.path.join(out, 'side-kick-drive-full.png'),
         ['docs/curriculum.md:49', 'step-behind side kick', 'Unchanged from the first draft.']),
        ('#5 Hook Kick',
         os.path.join(out, 'hook-kick-full.png'),
         ['docs/curriculum.md:50', 'step-behind hook kick', 'Returning heel drawn larger.']),
    ]
    big = 260
    col = 390
    pad = 14
    H = 1180
    W = pad + len(cells) * col
    img = Image.new('RGB', (W, H), (28, 26, 24))
    d = ImageDraw.Draw(img)
    d.text((pad, 8), 'G2B-44. Two approved references, then samples #1 #3 #4 #5. True 40 and 30, colour then grey. The x4 boxes are the same pixels, enlarged.', fill=(250, 246, 236), font=tiny)
    for i, (label, path, cite) in enumerate(cells):
        x = pad + i * col
        y = 32
        d.text((x, y), label, fill=(250, 246, 236), font=font)
        im = Image.open(path).convert('RGBA')
        big_im = im.resize((big, big), Image.LANCZOS)
        tile = Image.new('RGBA', (big, big), (28, 26, 24, 255))
        tile.alpha_composite(big_im)
        img.paste(tile.convert('RGB'), (x, y + 22))
        for n, line in enumerate(cite):
            d.text((x, y + 24 + big + 2 + n * 15), line, fill=(232, 196, 120), font=tiny)
        y2 = y + 24 + big + 50
        for grey, word in ((False, 'colour'), (True, 'grey')):
            for sz in (40, 30):
                one = im.resize((sz, sz), Image.LANCZOS)
                if grey:
                    g = ImageOps.grayscale(one)
                    one = Image.merge('RGBA', (g, g, g, one.split()[-1]))
                d.text((x, y2), f'{word} {sz} true, then the same pixels x4', fill=(200, 190, 170), font=tiny)
                true = Image.new('RGBA', (sz, sz), (28, 26, 24, 255))
                true.alpha_composite(one)
                img.paste(true.convert('RGB'), (x, y2 + 18))
                zoom = one.resize((sz * 4, sz * 4), Image.NEAREST)
                box = Image.new('RGBA', (sz * 4, sz * 4), (28, 26, 24, 255))
                box.alpha_composite(zoom)
                img.paste(box.convert('RGB'), (x + sz + 8, y2 + 18))
                y2 += 18 + sz * 4 + 12
    img.save(os.path.join(out, 'sheet-g2b44-samples.png'))
    print('sheet', img.size)


if __name__ == '__main__':
    out = os.path.join(HERE, '..', 'preview')
    os.makedirs(out, exist_ok=True)
    for n, fn in ALL.items():
        fn().save(os.path.join(out, n + '-full.png'))
        print(n)
    sheet()
