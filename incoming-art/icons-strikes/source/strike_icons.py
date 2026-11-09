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


def _leg(a, hip, knee, ankle, flex=0, sc=0.40, thick=11):
    """thigh from the hip, shin and one toeless shoe. The thigh is drawn over the knee."""
    _shin_shoe(a, knee, ankle, flex, sc)
    sleeve(a, hip, knee, thick, max(8, thick - 1.5), ow=4.2, shade=GSH, band=5)


def _arm(a, shoulder, elbow, hand, ang, thick=8, fist_s=12):
    """sleeve from the shoulder, skin forearm, one mitten fist. Nothing else."""
    sleeve(a, shoulder, elbow, thick, max(6, thick - 1), ow=4.0, shade=GSH, band=4)
    limb(a, elbow, hand, thick * (5.5 / 8), thick * (5.2 / 8))
    fist(a, hand[0], hand[1], fist_s, ang)


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
    """back of the head: all hair, one small ear on the side. No skin on the crown."""
    a.shape(circ(cx, cy, r), HAIR, HAIR_S, lighten(HAIR, .08), ow=3.6, band=2)
    a.shape(circ(cx + r * 1.02, cy + r * 0.35, r * 0.16), SKIN, SKIN_S, lighten(SKIN, .35), ow=1.8, band=1.5)


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
    """#1. Back to the viewer. The kicking leg sweeps, and a curved arc goes around that leg."""
    a = Art()
    hip = (118, 142)
    _leg(a, hip, (108, 164), (102, 182), flex=-8, sc=0.5, thick=14)
    # the sweeping leg, up and around, not a level side kick
    _leg(a, hip, (150, 118), (172, 96), flex=8, sc=0.5, thick=14)
    arc = []
    for deg in range(150, 20, -16):
        arc.append((128 + 58 * math.cos(math.radians(deg)), 118 + 46 * math.sin(math.radians(deg))))
    arrow(a, arc, BLUE_S, 10, 18, outline=INKC, ink_ow=3.8, spread=0.85)
    _gi(a, [(96, 108), (104, 92), (142, 96), (148, 112), (136, 150), (108, 152)])
    _belt(a, 120, 128, 32)
    _arm(a, (108, 108), (96, 116), (100, 104), -1.2, thick=10, fist_s=14)
    _arm(a, (138, 104), (152, 112), (148, 100), -0.3, thick=10, fist_s=14)
    _neck(a, (120, 98), (118, 88))
    _head_back(a, 116, 74, 16)
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
    """#4. Hip turned, body side-on. Kicking leg straight and level at chest height. Blade leads."""
    a = Art()
    hip = (108, 118)
    _leg(a, (102, 140), (96, 162), (92, 180), flex=-8, sc=0.5, thick=14)
    # straight and level: hip, knee and foot share one height. Foot cocked so the edge leads.
    _leg(a, hip, (142, 118), (176, 118), flex=78, sc=0.48, thick=14)
    _gi(a, [(88, 96), (124, 90), (128, 118), (116, 148), (94, 150), (84, 118)])
    _belt(a, 106, 124, 28)
    _arm(a, (112, 102), (126, 108), (132, 98), -0.2, thick=10, fist_s=14)
    _arm(a, (108, 112), (120, 120), (126, 110), -0.15, thick=10, fist_s=14)
    # neck as short as #6: the head sits on the shoulders
    _neck(a, (104, 100), (102, 94))
    _head_back(a, 100, 82, 14)
    return _finish_in(a)


def hook_kick():
    """#5. Standing leg and hooking leg stay apart. Heel snaps back."""
    a = Art()
    # standing leg on the left, hook on the right, no shared pixels
    _leg(a, (92, 150), (88, 168), (86, 184), flex=-8, sc=0.48, thick=12)
    _leg(a, (128, 128), (170, 122), (156, 100), flex=42, sc=0.46, thick=12)
    arrow(a, [(180, 112), (168, 94), (154, 90)], BLUE_S, 8, 14, outline=INKC, ink_ow=3.4, spread=0.82)
    _gi(a, [(84, 102), (136, 96), (140, 124), (124, 152), (96, 156), (80, 124)])
    _belt(a, 110, 128, 32)
    _arm(a, (112, 108), (124, 112), (130, 100), -0.3, thick=10, fist_s=14)
    _arm(a, (100, 116), (112, 124), (118, 114), -0.2, thick=10, fist_s=14)
    _neck(a, (104, 104), (102, 98))
    _head_back(a, 100, 86, 14)
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


def compare_sheet_2():
    """before sample-5 beside after, for #1 #4 #5 only. Large, plus 40, 36 and 30."""
    from PIL import Image, ImageDraw, ImageFont
    out = os.path.join(HERE, '..', 'preview')
    old = os.path.join(HERE, '..', 'superseded', 'sample-5')
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
    tiny = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    names = [
        ('#1 Spin Kick', 'spin-kick-full.png'),
        ('#4 Side Kick', 'side-kick-drive-full.png'),
        ('#5 Hook Kick', 'hook-kick-full.png'),
    ]
    big = 220
    row = 310
    pad = 12
    img = Image.new('RGB', (16 + 2 * 250, 36 + len(names) * row), (28, 26, 24))
    d = ImageDraw.Draw(img)
    d.text((pad, 8), 'G2B-44 #1 #4 #5. Before sample-5 (left), after (right). Large, then 40, 36, 30.', fill=(250, 246, 236), font=tiny)
    for i, (label, fn) in enumerate(names):
        y = 32 + i * row
        d.text((pad, y), label, fill=(250, 246, 236), font=font)
        for j, folder in enumerate((old, out)):
            im = Image.open(os.path.join(folder, fn)).convert('RGBA')
            x = pad + j * 250
            d.text((x, y + 18), 'before' if j == 0 else 'after', fill=(232, 196, 120), font=tiny)
            tile = Image.new('RGBA', (big, big), (28, 26, 24, 255))
            tile.alpha_composite(im.resize((big, big), Image.LANCZOS))
            img.paste(tile.convert('RGB'), (x, y + 34))
            sx = x
            sy = y + 34 + big + 4
            for sz in (40, 36, 30):
                one = im.resize((sz, sz), Image.LANCZOS)
                d.text((sx, sy), str(sz), fill=(200, 190, 170), font=tiny)
                box = Image.new('RGBA', (sz, sz), (28, 26, 24, 255))
                box.alpha_composite(one)
                img.paste(box.convert('RGB'), (sx, sy + 14))
                sx += max(sz, 28) + 6
    path = os.path.join(out, 'sheet-g2b44-compare-2.png')
    img.save(path)
    print('compare2', img.size)


def final_sheet():
    """all six Strike icons, large, plus true 40, 36 and 30."""
    from PIL import Image, ImageDraw, ImageFont
    out = os.path.join(HERE, '..', 'preview')
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
    tiny = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    names = [
        ('#1 Spin', 'spin-kick-full.png'),
        ('#3 Butterfly', 'butterfly-flow-full.png'),
        ('#4 Side', 'side-kick-drive-full.png'),
        ('#5 Hook', 'hook-kick-full.png'),
        ('#6 Lunge', 'lunge-full.png'),
        ('#7 Spinning', 'spinning-finisher-full.png'),
    ]
    big = 200
    col = 220
    pad = 10
    img = Image.new('RGB', (pad + len(names) * col, 300), (28, 26, 24))
    d = ImageDraw.Draw(img)
    for i, (label, fn) in enumerate(names):
        x = pad + i * col
        im = Image.open(os.path.join(out, fn)).convert('RGBA')
        d.text((x, 6), label, fill=(250, 246, 236), font=font)
        tile = Image.new('RGBA', (big, big), (28, 26, 24, 255))
        tile.alpha_composite(im.resize((big, big), Image.LANCZOS))
        img.paste(tile.convert('RGB'), (x, 26))
        sx = x
        for sz in (40, 36, 30):
            one = im.resize((sz, sz), Image.LANCZOS)
            d.text((sx, 230), str(sz), fill=(200, 190, 170), font=tiny)
            box = Image.new('RGBA', (sz, sz), (28, 26, 24, 255))
            box.alpha_composite(one)
            img.paste(box.convert('RGB'), (sx, 246))
            sx += sz + 8
    path = os.path.join(out, 'sheet-g2b44-final.png')
    img.save(path)
    print('final', img.size)


if __name__ == '__main__':
    out = os.path.join(HERE, '..', 'preview')
    os.makedirs(out, exist_ok=True)
    for n, fn in ALL.items():
        fn().save(os.path.join(out, n + '-full.png'))
        print(n)
    sheet()
    compare_sheet()
    compare_sheet_2()
    final_sheet()
