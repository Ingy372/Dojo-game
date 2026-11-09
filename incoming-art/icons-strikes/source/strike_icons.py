"""G2B-44 sample Strike icons. Pillow only, same toon kit as the approved PB-07 medallions.
No outside art pack. No Blender: these are the 2D medallion family, not 3D world sprites.
The kit lives in incoming-art/icons-slots/source (project code, already on main).

Ids and sources. Line numbers are in the Delivery Note. Nothing here is a pose the docs did not name.
  spin-kick       Strike #1. docs/curriculum.md:46 spinning outside kick (spin kick). Not a jump.
  butterfly-flow  Strike #3. Jay, via the Manager: body horizontal, legs scissoring.
                  docs/curriculum.md:48 names the butterfly kick.
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
    BELT_OPTIONS, BLUE_S, CREAM, GOLD, GOLD_S, GSH, HAIR, HAIR_S, INKC, PANT, RIMS,
    SKIN, SKIN_S, arrow, chaikin, fist, head_front, kick_leg, lighten, limb,
    medallion, place, sleeve, wide_clip,
)
from toon import Art, circ  # noqa: E402

PINE, PINE_S = BELT_OPTIONS['pine']
# Same growth as the approved Jumping Spins figure, so these sit at the same size in the slot.
SCALE = 1.24


def _finish(art):
    med = medallion(RIMS['strike'])
    s = SCALE
    place(med, art, s, 128 * (1 - s), 128 * (1 - s), wide_clip())
    return med.result()


def _finish_in(art):
    """place at 1:1 so the figure can be drawn inside the cream, not over the rim."""
    med = medallion(RIMS['strike'])
    place(med, art, 1.0, 0, 0, wide_clip())
    return med.result()


def _shin_shoe(a, knee, ankle, flex, sc=0.52):
    """gi shin from the knee to the ankle, then the toeless shoe. Returns the ball-of-foot point."""
    dx, dy = knee[0] - ankle[0], knee[1] - ankle[1]
    dist = math.hypot(dx, dy) or 1
    ang = math.degrees(math.atan2(-dy / dist, -dx / dist))
    G, fl = kick_leg(a, ankle, ang, flex, sc, dist / sc, None, r0=15, r1=11, gow=4.2, gshade=GSH)
    return G([(52, 40)], fl)[0]


def _leg(a, hip, knee, ankle, flex=0, sc=0.40):
    """thigh from the hip, shin and one toeless shoe. The thigh is drawn over the knee."""
    _shin_shoe(a, knee, ankle, flex, sc)
    sleeve(a, hip, knee, 11, 9.5, ow=4.2, shade=GSH, band=5)


def _arm(a, shoulder, elbow, hand, ang):
    """sleeve from the shoulder, skin forearm, one mitten fist. Nothing else."""
    sleeve(a, shoulder, elbow, 8, 7, ow=4.0, shade=GSH, band=4)
    limb(a, elbow, hand, 5.5, 5.2)
    fist(a, hand[0], hand[1], 12, ang)


def _neck(a, top, head):
    limb(a, top, head, 6, 6)


def _belt(a, cx, cy, w=26):
    a.shape(poly_of_rect(cx, cy, w, 10, 4), PINE, PINE_S, lighten(PINE, .3), ow=2.6, band=3)


def _head_profile(a, cx, cy, r, face=1):
    """side view. face=1 looks to the right. One eye, no second face."""
    a.shape(circ(cx, cy, r), SKIN, SKIN_S, lighten(SKIN, .4), ow=3.6, band=3)
    a.shape(circ(cx - face * r * 0.35, cy - r * 0.2, r * 0.55), HAIR, HAIR_S, lighten(HAIR, .25), ow=2.2, band=2.5)
    a.shape(circ(cx + face * r * 0.32, cy - r * 0.02, r * 0.11), INKC, None, None, ow=0)
    a.shape(circ(cx + face * r * 0.78, cy + r * 0.08, r * 0.16), SKIN, SKIN_S, lighten(SKIN, .35), ow=2.0, band=2)


def _head_back(a, cx, cy, r):
    """back of the head: hair, two ears, no face."""
    a.shape(circ(cx, cy, r), HAIR, HAIR_S, lighten(HAIR, .25), ow=3.6, band=3)
    for s in (-1, 1):
        a.shape(circ(cx + s * r * 0.92, cy + r * 0.12, r * 0.2), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.0, band=2)


def _gi(a, pts):
    a.shape(poly_of(chaikin(pts, 2)), CREAM_GI, GSH, (255, 255, 250), ow=4.2, band=5)


def poly_of(pts):
    from toon import poly
    return poly(pts)


def poly_of_rect(cx, cy, w, h, r):
    from toon import poly, rrect_pts
    return poly(rrect_pts(cx, cy, w, h, r))


CREAM_GI = (250, 246, 236)


def spin_kick():
    """#1. Mid-spin. Back and one shoulder are turning. One standing leg, one outside kick."""
    a = Art()
    arrow(a, [(78, 158), (96, 174), (78, 186)], BLUE_S, 9, 16, outline=INKC, ink_ow=3.6, spread=0.8)
    hip = (124, 136)
    _leg(a, hip, (114, 156), (108, 172), flex=-8)
    _leg(a, hip, (148, 122), (168, 112), flex=0)
    # back of the gi, right shoulder coming around
    _gi(a, [(108, 112), (146, 96), (150, 124), (132, 146), (110, 144), (100, 124)])
    _belt(a, 124, 128)
    _arm(a, (112, 110), (100, 118), (96, 108), -1.2)
    _arm(a, (142, 104), (154, 112), (150, 100), -0.4)
    _neck(a, (122, 104), (116, 92))
    _head_back(a, 114, 80, 13)
    # the turning cheek, so the spin reads
    a.shape(circ(126, 84, 6), SKIN, SKIN_S, lighten(SKIN, .4), ow=2.0, band=2)
    return _finish_in(a)


def butterfly_flow():
    """#3. Horizontal butterfly, drawn larger. Two arms from the shoulders, two legs from one hip."""
    a = Art()
    hip = (158, 126)
    _leg(a, hip, (174, 106), (186, 96), flex=0, sc=0.44)
    _leg(a, hip, (174, 148), (186, 160), flex=0, sc=0.44)
    _gi(a, [(72, 110), (166, 100), (176, 124), (166, 150), (72, 142)])
    _belt(a, 116, 126, 18)
    _arm(a, (100, 112), (118, 100), (130, 94), -0.4)
    _arm(a, (100, 140), (118, 152), (130, 158), 0.6)
    _neck(a, (84, 122), (74, 116))
    head_front(a, 62, 112, 17)
    return _finish_in(a)


def lunge():
    """#6. Side-view jumping front kick. Torso slightly back, kicking leg straight at chest
    height, other knee tucked high, both feet off the ground. Arrow stays behind the body."""
    a = Art()
    from seal_icons import forearm_block, limb
    # arrow in the cream under the jump, pointing the same way as the kick
    arrow(a, [(72, 178), (130, 178), (188, 168)], BLUE_S, 10, 18, outline=INKC, ink_ow=4.2, spread=0.82)
    hip = (122, 140)
    knee_t = (104, 104)
    foot_t = (92, 126)
    sleeve(a, hip, knee_t, 11, 9, ow=4.2, shade=GSH, band=5)
    _shin_shoe(a, knee_t, foot_t, 18, 0.48)
    ankle = (172, 114)
    knee_k = ((hip[0] + ankle[0]) / 2, (hip[1] + ankle[1]) / 2)
    sleeve(a, hip, knee_k, 12, 10, ow=4.2, shade=GSH, band=5)
    _shin_shoe(a, knee_k, ankle, 0, 0.48)
    body = chaikin([(104, 96), (140, 102), (138, 132), (128, 152), (112, 150), (100, 122)], 2)
    a.shape(poly_of(body), CREAM_GI, GSH, (255, 255, 250), ow=4.4, band=5)
    a.shape(poly_of_rect(122, 130, 30, 12, 4), PINE, PINE_S, lighten(PINE, .3), ow=2.8, band=3)
    # guard held in front of the chest, under the chin
    _arm(a, (112, 116), (104, 124), (112, 112), -1.1)
    _arm(a, (132, 118), (140, 126), (132, 114), -0.3)
    _neck(a, (120, 98), (116, 86))
    head_front(a, 114, 74, 14)
    return _finish_in(a)


def spinning_finisher():
    """#7. Back to the viewer. One straight planted leg. One high hook, heel leading. Guard from the shoulders."""
    a = Art()
    ring = []
    for deg in range(30, 30 - 320, -20):
        ring.append((128 + 64 * math.cos(math.radians(deg)), 130 + 60 * math.sin(math.radians(deg))))
    arrow(a, ring, BLUE_S, 9, 16, outline=INKC, ink_ow=3.6, spread=0.8)
    hip = (128, 138)
    _leg(a, hip, (128, 158), (128, 174), flex=-10)
    _leg(a, hip, (150, 112), (168, 84), flex=50, sc=0.38)
    _gi(a, [(108, 108), (112, 98), (144, 98), (148, 108), (140, 146), (116, 146)])
    _belt(a, 128, 124, 28)
    _arm(a, (116, 112), (104, 120), (108, 110), -1.2)
    _arm(a, (140, 112), (150, 122), (146, 112), -0.4)
    _neck(a, (128, 100), (128, 90))
    _head_back(a, 128, 78, 13)
    return _finish_in(a)


def side_kick_drive():
    """#4. Side-on. Standing leg down, side kick straight out, heel leading, guard in front."""
    a = Art()
    arrow(a, [(72, 150), (88, 164)], BLUE_S, 8, 14, outline=INKC, ink_ow=3.4, spread=0.8)
    hip = (112, 138)
    _leg(a, hip, (104, 158), (100, 172), flex=-8)
    _leg(a, hip, (142, 126), (168, 116), flex=0)
    _gi(a, [(96, 104), (126, 100), (128, 128), (118, 148), (98, 146), (92, 120)])
    _belt(a, 110, 126, 22)
    _arm(a, (114, 108), (128, 112), (134, 100), -0.3)
    _arm(a, (110, 116), (122, 122), (128, 112), -0.2)
    _neck(a, (108, 102), (106, 92))
    _head_profile(a, 104, 80, 13, face=1)
    return _finish_in(a)


def hook_kick():
    """#5. One standing leg, one hook with the heel pulling back. No pad. Guard up."""
    a = Art()
    hip = (118, 140)
    _leg(a, hip, (110, 158), (106, 172), flex=-8)
    # thigh forward, shin folds back so the heel returns
    _leg(a, hip, (150, 112), (136, 96), flex=36, sc=0.42)
    _gi(a, [(100, 106), (132, 102), (134, 130), (122, 150), (102, 148), (96, 122)])
    _belt(a, 114, 128, 22)
    _arm(a, (116, 110), (130, 108), (136, 98), -0.4)
    _arm(a, (110, 118), (122, 120), (128, 110), -0.3)
    _neck(a, (112, 104), (110, 94))
    _head_profile(a, 108, 82, 13, face=1)
    return _finish_in(a)


ALL = {
    'spin-kick': spin_kick,
    'butterfly-flow': butterfly_flow,
    'side-kick-drive': side_kick_drive,
    'hook-kick': hook_kick,
    'lunge': lunge,
    'spinning-finisher': spinning_finisher,
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
         ['Jay: show the butterfly kick (via Manager)', 'docs/curriculum.md:48', 'Body horizontal. Arm on the shoulder.']),
        ('#4 Side Kick Drive',
         os.path.join(out, 'side-kick-drive-full.png'),
         ['docs/curriculum.md:49', 'step-behind side kick', 'Unchanged.']),
        ('#5 Hook Kick',
         os.path.join(out, 'hook-kick-full.png'),
         ['docs/curriculum.md:50', 'step-behind hook kick', 'Returning heel drawn larger.']),
        ('#6 Lunge',
         os.path.join(out, 'lunge-full.png'),
         ['docs/curriculum.md:51', 'Jumping front kick, knee tucked.', 'Arrow behind. Inside the rim.']),
        ('#7 Spinning Finisher',
         os.path.join(out, 'spinning-finisher-full.png'),
         ['docs/curriculum.md:52 spinning hook kick', 'R-G2B-strikes-4-7.md:27 ring behind', 'Heel at head height. Inside the rim.']),
    ]
    big = 220
    col = 430
    pad = 12
    H = 760
    W = pad + len(cells) * col
    img = Image.new('RGB', (W, H), (28, 26, 24))
    d = ImageDraw.Draw(img)
    d.text((pad, 6), 'G2B-44. Approved Jumping Spins and Strike slot, then #1 #3 #4 #5 #6 #7. Under each: colour, then grey, at 128, 96, 64, 40, 30.', fill=(250, 246, 236), font=tiny)
    sizes = (128, 96, 64, 40, 30)
    for i, (label, path, cite) in enumerate(cells):
        x = pad + i * col
        y = 26
        d.text((x, y), label, fill=(250, 246, 236), font=font)
        im = Image.open(path).convert('RGBA')
        big_im = im.resize((big, big), Image.LANCZOS)
        tile = Image.new('RGBA', (big, big), (28, 26, 24, 255))
        tile.alpha_composite(big_im)
        img.paste(tile.convert('RGB'), (x, y + 20))
        for n, line in enumerate(cite):
            d.text((x, y + 22 + big + n * 14), line, fill=(232, 196, 120), font=tiny)
        y2 = y + 22 + big + 46
        for grey, word in ((False, 'colour'), (True, 'grey')):
            d.text((x, y2), word, fill=(200, 190, 170), font=tiny)
            sx = x
            for sz in sizes:
                one = im.resize((sz, sz), Image.LANCZOS)
                if grey:
                    g = ImageOps.grayscale(one)
                    one = Image.merge('RGBA', (g, g, g, one.split()[-1]))
                box = Image.new('RGBA', (sz, sz + 14), (28, 26, 24, 255))
                ImageDraw.Draw(box).text((0, 0), str(sz), fill=(200, 190, 170), font=tiny)
                box.alpha_composite(one, (0, 14))
                img.paste(box.convert('RGB'), (sx, y2 + 16))
                sx += sz + 6
            y2 += 16 + 128 + 8
    img.save(os.path.join(out, 'sheet-g2b44-samples.png'))
    print('sheet', img.size)


def compare_sheet():
    """before (sample-4, commit d4faa2ba) beside after, large, plus true 40 and 30."""
    from PIL import Image, ImageDraw, ImageFont
    out = os.path.join(HERE, '..', 'preview')
    old = os.path.join(HERE, '..', 'superseded', 'sample-4')
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
    tiny = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    names = [
        ('#1 Spin Kick', 'spin-kick-full.png'),
        ('#3 Butterfly', 'butterfly-flow-full.png'),
        ('#4 Side Kick', 'side-kick-drive-full.png'),
        ('#5 Hook Kick', 'hook-kick-full.png'),
        ('#6 Lunge', 'lunge-full.png'),
        ('#7 Spinning Finisher', 'spinning-finisher-full.png'),
    ]
    big = 200
    row = 280
    pad = 12
    H = 36 + len(names) * row
    W = 16 + 2 * 230
    img = Image.new('RGB', (W, H), (28, 26, 24))
    d = ImageDraw.Draw(img)
    d.text((pad, 8), 'G2B-44 before d4faa2ba (left) and after (right). Large, then 40 and 30.', fill=(250, 246, 236), font=tiny)
    for i, (label, fn) in enumerate(names):
        y = 32 + i * row
        d.text((pad, y), label, fill=(250, 246, 236), font=font)
        for j, folder in enumerate((old, out)):
            im = Image.open(os.path.join(folder, fn)).convert('RGBA')
            x = pad + j * 230
            d.text((x, y + 18), 'before' if j == 0 else 'after', fill=(232, 196, 120), font=tiny)
            tile = Image.new('RGBA', (big, big), (28, 26, 24, 255))
            tile.alpha_composite(im.resize((big, big), Image.LANCZOS))
            img.paste(tile.convert('RGB'), (x, y + 34))
            sx = x
            sy = y + 34 + big + 4
            for sz in (40, 30):
                one = im.resize((sz, sz), Image.LANCZOS)
                d.text((sx, sy), str(sz), fill=(200, 190, 170), font=tiny)
                box = Image.new('RGBA', (sz, sz), (28, 26, 24, 255))
                box.alpha_composite(one)
                img.paste(box.convert('RGB'), (sx, sy + 14))
                sx += sz + 8
    path = os.path.join(out, 'sheet-g2b44-compare.png')
    img.save(path)
    print('compare', img.size, path)


if __name__ == '__main__':
    out = os.path.join(HERE, '..', 'preview')
    os.makedirs(out, exist_ok=True)
    for n, fn in ALL.items():
        fn().save(os.path.join(out, n + '-full.png'))
        print(n)
    sheet()
    compare_sheet()
