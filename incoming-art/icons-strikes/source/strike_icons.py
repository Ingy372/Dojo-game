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
    """#3. Jay: body near horizontal, in the air, legs scissoring. The arm starts on the shoulder.
    Both thighs start inside the hip."""
    a = Art()
    from seal_icons import forearm_block, limb
    hip = (150, 128)
    # scissor from one hip. Shoes stop inside the cream.
    sleeve(a, hip, (168, 112), 11, 9, ow=4.2, shade=GSH, band=5)
    _shin_shoe(a, (168, 112), (182, 102), 0, 0.4)
    sleeve(a, hip, (168, 146), 11, 9, ow=4.2, shade=GSH, band=5)
    _shin_shoe(a, (168, 146), (182, 156), 0, 0.4)
    body = chaikin([(86, 116), (158, 108), (168, 126), (158, 146), (86, 138)], 2)
    a.shape(poly_of(body), CREAM_GI, GSH, (255, 255, 250), ow=4.4, band=5)
    a.shape(poly_of_rect(122, 128, 14, 28, 5), PINE, PINE_S, lighten(PINE, .3), ow=2.8, band=3)
    limb(a, (96, 120), (82, 114), 6, 6)
    head_front(a, 74, 112, 16)
    sleeve(a, (112, 114), (128, 104), 8, 7, ow=4.0, shade=GSH, band=4)
    limb(a, (128, 104), (136, 98), 5.5, 5.5)
    from seal_icons import fist
    fist(a, 142, 94, 13, -0.3)
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
    # sleeves start on the shoulder edge so the arms read as attached
    from seal_icons import fist
    sleeve(a, (108, 104), (98, 90), 8, 7, ow=4.0, shade=GSH, band=4)
    limb(a, (98, 90), (92, 82), 5.5, 5.5)
    fist(a, 88, 76, 13, -1.1)
    sleeve(a, (136, 106), (148, 94), 8, 7, ow=4.0, shade=GSH, band=4)
    limb(a, (148, 94), (154, 86), 5.5, 5.5)
    fist(a, 158, 78, 13, -0.4)
    limb(a, (120, 96), (118, 84), 6, 6)
    head_front(a, 114, 72, 15)
    return _finish_in(a)


def spinning_finisher():
    """#7. Spinning hook kick. Standing leg straight and planted. Hooking leg at head height,
    heel leading. Torso turned. Ring drawn first so it sits behind the figure."""
    a = Art()
    from seal_icons import forearm_block, limb
    ring = []
    for deg in range(40, 40 - 330, -22):
        ring.append((128 + 66 * math.cos(math.radians(deg)), 132 + 62 * math.sin(math.radians(deg))))
    arrow(a, ring, BLUE_S, 10, 18, outline=INKC, ink_ow=4.0, spread=0.8)
    hip = (126, 138)
    # one straight standing leg, foot planted
    foot_s = (122, 178)
    sleeve(a, hip, foot_s, 11, 9, ow=4.2, shade=GSH, band=5)
    _shin_shoe(a, (124, 160), foot_s, -8, 0.46)
    # hook: shin drawn first, thigh overlaps the knee, heel at head height
    knee_h = (156, 108)
    foot_h = (146, 88)
    _shin_shoe(a, knee_h, foot_h, 40, 0.46)
    sleeve(a, hip, knee_h, 12, 10, ow=4.2, shade=GSH, band=5)
    # back of the gi, turned, shoulders not square to the camera
    # shoulders twisted: the far shoulder is high, the head looks back over the near shoulder
    body = chaikin([(100, 118), (152, 90), (156, 122), (134, 150), (110, 146), (94, 126)], 2)
    a.shape(poly_of(body), CREAM_GI, GSH, (255, 255, 250), ow=4.4, band=5)
    a.shape(poly_of_rect(126, 128, 24, 11, 4), PINE, PINE_S, lighten(PINE, .3), ow=2.8, band=3)
    from seal_icons import fist
    sleeve(a, (108, 116), (96, 100), 8, 7, ow=4.0, shade=GSH, band=4)
    limb(a, (96, 100), (90, 90), 5.5, 5.5)
    fist(a, 86, 82, 12, -1.2)
    sleeve(a, (146, 96), (158, 86), 8, 7, ow=4.0, shade=GSH, band=4)
    limb(a, (158, 86), (162, 78), 5.5, 5.5)
    fist(a, 166, 72, 12, -0.2)
    limb(a, (112, 108), (100, 92), 6, 6)
    head_front(a, 96, 80, 14)
    return _finish_in(a)


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


if __name__ == '__main__':
    out = os.path.join(HERE, '..', 'preview')
    os.makedirs(out, exist_ok=True)
    for n, fn in ALL.items():
        fn().save(os.path.join(out, n + '-full.png'))
        print(n)
    sheet()
