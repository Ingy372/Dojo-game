"""R-STANCE-b stance icons (Cat, Front, Fighting, Horse) in the #277 icons2 medallion style.
The style helpers are copied from incoming-art/icons2/source/build_icons2.py (#277); Horse is #277 Rooted Form unchanged.
    python3 incoming-art/stances/source/build_stances.py"""
import os, json, math
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'sprites')
SS = 4
N = 128 * SS
CX, CY = 64, 63.5

EDGE = (24, 20, 28)
RIM = (240, 228, 195)
FACE = (247, 240, 221)
FAMILY = {  # ring colour, ring highlight, ink, soft ink
    'form':   ((76, 170, 120), (150, 210, 170), (34, 102, 72), (140, 200, 160)),
    'strike': ((134, 96, 196), (186, 162, 228), (78, 50, 134), (182, 160, 222)),    # violet (Jay): distinct from Seal blue, Forms green, Virtue gold
    'virtue': ((226, 172, 52), (250, 214, 120), (122, 78, 16), (232, 196, 110)),
}


def P(v):
    return v * SS


class Ink:
    """flat ink shapes; xf = (scale, dx, dy) about the face centre, so a figure can be sized/centred as one."""
    def __init__(self, xf=(1.0, 0, 0)):
        self.img = Image.new('RGBA', (N, N), (0, 0, 0, 0))
        self.s, self.dx, self.dy = xf

    def T(self, x, y):
        return (CX + (x - CX) * self.s + self.dx, CY + (y - CY) * self.s + self.dy)

    def layer(self):
        return Image.new('L', (N, N), 0)

    def limb(self, m, pts, w):
        d = ImageDraw.Draw(m)
        pp = [tuple(map(P, self.T(x, y))) for x, y in pts]
        d.line(pp, fill=255, width=int(P(w * self.s)), joint='curve')
        for x, y in pp:
            r = P(w * self.s) / 2
            d.ellipse([x - r, y - r, x + r, y + r], fill=255)

    def disc(self, m, x, y, r):
        x, y = self.T(x, y); r *= self.s
        ImageDraw.Draw(m).ellipse([P(x - r), P(y - r), P(x + r), P(y + r)], fill=255)

    def poly(self, m, pts):
        ImageDraw.Draw(m).polygon([tuple(map(P, self.T(x, y))) for x, y in pts], fill=255)

    def arm(self, pts, fist, w, ink, halo, fr=3.4):
        """limb drawn over the body with a thin halo so it reads as separate at 64 px."""
        h = self.layer(); self.limb(h, pts, w + 2.6); self.disc(h, fist[0], fist[1], fr + 1.3); self.put(h, halo)
        m = self.layer(); self.limb(m, pts, w); self.disc(m, fist[0], fist[1], fr); self.put(m, ink)

    def put(self, m, col, a=255):
        lay = Image.new('RGBA', (N, N), col + (0,))
        lay.putalpha(m.point(lambda v: v * a // 255))
        self.img.alpha_composite(lay)


def medallion(fam):
    ring, ring_hi, ink, soft = FAMILY[fam]
    im = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    def circ(r, col):
        d.ellipse([P(CX - r), P(CY - r), P(CX + r), P(CY + r)], fill=col + (255,))
    circ(45.2, EDGE)
    circ(43.6, RIM)
    circ(40.6, ring_hi)
    circ(40.0, ring)
    circ(35.6, ring_hi)
    circ(35.0, FACE)
    if fam == 'virtue':   # virtues are gold: a soft warm wash on the face
        g = Image.new('L', (N, N), 0)
        ImageDraw.Draw(g).ellipse([P(CX - 35), P(CY - 35), P(CX + 35), P(CY + 35)], fill=60)
        lay = Image.new('RGBA', (N, N), (250, 214, 120, 0)); lay.putalpha(g.filter(ImageFilter.GaussianBlur(P(6))))
        im.alpha_composite(lay)
    return im
def horse():
    """Horse (= #277 Rooted Form, reused unchanged) = a wide, even, symmetric horse-style stance, front view.
    Technique: feet about two shoulder-widths apart and parallel, both knees bent equally and pushed out over the
    toes, hips low and level, back straight and upright, guard up (both fists in front at chin height, elbows down)."""
    fam = 'form'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 0, 0.5))
    g = I.layer()  # ground + root marks (soft ink), symmetric
    I.limb(g, [(38, 89), (90, 89)], 2.2)
    for x in (41.5, 46.5):
        I.limb(g, [(x, 92), (x - 1, 95.5)], 2.4)
        I.limb(g, [(128 - x, 92), (128 - x + 1, 95.5)], 2.2)
    I.put(g, soft)
    m = I.layer()
    I.limb(m, [(64, 64), (64, 47)], 11.5)                       # torso, upright
    I.disc(m, 64, 37, 6.2)                                     # head
    for sgn in (-1, 1):
        X = lambda x: 64 + sgn * (x - 64)
        I.limb(m, [(X(59.5), 64), (X(46), 69), (X(44.5), 86.5)], 6.6)   # thigh near level, shin vertical
        I.limb(m, [(X(41), 86.8), (X(48.5), 86.8)], 4.6)                 # foot flat, pointing forward
    I.put(m, ink)
    for sgn in (-1, 1):
        X = lambda x: 64 + sgn * (x - 64)
        I.arm([(X(58.5), 48.5), (X(50.5), 56), (X(53), 47.5)], (X(53), 47.2), 4.4, ink, FACE, 3.4)  # guard, fist at chin height
    b = I.layer()                                              # belt + knot
    I.limb(b, [(58.6, 62.6), (69.4, 62.6)], 2.6)
    I.limb(b, [(64, 63), (62, 68)], 1.8)
    I.limb(b, [(64, 63), (66, 68)], 1.8)
    I.put(b, ring_hi)
    return fam, I


def front():
    """Front stance, side view facing right. Technique: long forward stance; front knee bent over the ankle, back leg
    straight with the back foot flat, hips low, back upright. Rear fist punches straight forward at chest height,
    lead fist pulled back to the hip."""
    fam = 'form'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 0, 0.5))
    g = I.layer(); I.limb(g, [(32, 89), (92, 89)], 2.2); I.put(g, soft)
    m = I.layer(); hip = (57, 66)
    I.limb(m, [hip, (57, 48)], 9.5)
    I.disc(m, 57.5, 38, 6.2)
    I.limb(m, [hip, (73, 70.5), (76, 86)], 6.6)          # front knee bent, over the ankle
    I.limb(m, [(74, 86.7), (83, 86.7)], 4.6)
    I.limb(m, [hip, (37.5, 85.5)], 6.6)                  # back leg straight
    I.limb(m, [(34, 86.8), (41.5, 86.8)], 4.6)           # back foot flat
    I.put(m, ink)
    I.arm([(56, 50), (51, 58), (54.5, 63)], (55, 63.2), 4.4, ink, FACE, 3.1)     # lead fist chambered at the hip
    I.arm([(58, 49.5), (70, 51), (82, 51)], (82.5, 51), 4.6, ink, FACE, 3.4)      # punch at chest height
    b = I.layer(); I.limb(b, [(52.6, 64.2), (61.4, 64.6)], 2.6); I.put(b, ring_hi)
    return fam, I


def cat():
    """Cat stance, side view facing right. Technique: short stance, almost all the weight on the bent back leg (hips
    straight over the back foot, back foot flat), front foot resting lightly on its ball with the heel up, knees
    bent, back upright, open hands up in front. A dark ground mark under the back foot shows where the weight is."""
    fam = 'form'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 0, 0.5))
    g = I.layer(); I.limb(g, [(38, 89), (88, 89)], 2.2); I.put(g, soft)
    w = I.layer(); I.limb(w, [(44, 89.6), (60, 89.6)], 4.0); I.put(w, soft)       # weight mark under the back foot
    m = I.layer(); hip = (51, 67)
    I.limb(m, [hip, (52.5, 49)], 9.5)
    I.disc(m, 53, 39, 6.2)
    I.limb(m, [hip, (57.5, 77), (51.5, 86)], 6.6)          # back leg: deep bend, carries the weight
    I.limb(m, [(46.5, 86.7), (56.5, 86.7)], 4.6)           # back foot flat
    I.put(m, ink)
    I.arm([(53, 68), (64.5, 75.5), (71, 82.5)], (71, 82.5), 5.4, ink, FACE, 2.7)   # front leg light, out in front
    f = I.layer(); I.limb(f, [(71, 82.5), (75.5, 86.6)], 4.0); I.put(f, ink)       # on the ball of the foot, heel up
    I.arm([(51.5, 51), (57, 59), (63, 56)], (63.3, 55.8), 4.4, ink, FACE, 3.0)      # rear hand guarding the middle
    I.arm([(54, 50.5), (64, 52.5), (70.5, 45.5)], (70.8, 45.2), 4.6, ink, FACE, 3.3)   # lead hand up at chin height
    b = I.layer(); I.limb(b, [(46.6, 65.2), (55.4, 65.8)], 2.6); I.put(b, ring_hi)
    return fam, I


def fighting():
    """Fighting stance, side view facing right (side-on). Technique: medium stance, knees bent, weight even and
    light, back heel raised, lead side toward the opponent, both fists up at chin height with elbows down. Small
    soft ticks by the feet show it is light and bouncy (no motion arcs, so it does not clash with Flowing)."""
    fam = 'form'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 1, 0.5))
    g = I.layer(); I.limb(g, [(38, 89), (88, 89)], 2.2)
    for x in (38.5, 42.5, 81.5, 85.5):
        I.limb(g, [(x, 80.5), (x + (1 if x > 60 else -1) * 1.5, 84.5)], 2.2)
    I.put(g, soft)
    m = I.layer(); hip = (60, 64)
    I.limb(m, [hip, (62.5, 47.5)], 9.5)                    # slight forward lean
    I.disc(m, 63.5, 37.5, 6.2)
    I.limb(m, [hip, (68.5, 74.5), (71.5, 86)], 6.4)
    I.limb(m, [(69.5, 86.7), (77, 86.7)], 4.6)
    I.limb(m, [hip, (53, 75), (48.5, 83.5)], 6.4)
    I.limb(m, [(48.5, 83.5), (45, 87)], 4.4)               # back heel up
    I.put(m, ink)
    I.arm([(61.5, 49.5), (61, 57), (68, 47)], (68.3, 46.7), 4.4, ink, FACE, 3.1)      # rear fist by the chin
    I.arm([(63.5, 49), (74, 55.5), (77, 45)], (77.3, 44.6), 4.6, ink, FACE, 3.4)      # lead fist up, chin height
    b = I.layer(); I.limb(b, [(55.6, 62.4), (64.4, 63.2)], 2.6); I.put(b, ring_hi)
    return fam, I


ICONS = [('stance-cat', cat), ('stance-front', front), ('stance-fighting', fighting), ('stance-horse', horse)]


def build():
    import numpy as np
    os.makedirs(OUT, exist_ok=True)
    man = {'about': 'R-STANCE-b stance icons, #277 icons2 Forms style. Ids follow drafts/content/katas/stances.json. Labels are drawn by the game.', 'sprites': {}}
    for iid, fn in ICONS:
        fam, I = fn(); im = medallion(fam)
        clip = Image.new('L', (N, N), 0); ImageDraw.Draw(clip).ellipse([P(CX - 34.4), P(CY - 34.4), P(CX + 34.4), P(CY + 34.4)], fill=255)
        ink = I.img.copy(); ink.putalpha(Image.fromarray(np.minimum(np.array(ink.getchannel('A')), np.array(clip))))
        im.alpha_composite(ink)
        im.resize((128, 128), Image.LANCZOS).save(os.path.join(OUT, f'icon-{iid}-64@2x.png'))
        im.resize((64, 64), Image.LANCZOS).save(os.path.join(OUT, f'icon-{iid}-64.png'))
        man['sprites'][f'icon-{iid}-64'] = {'size': [64, 64], 'file': f'icon-{iid}-64.png', 'stanceId': 'stance.' + iid.split('-')[1], 'ring': fam,
                                            'note': ' '.join((fn.__doc__ or '').split())}
    json.dump(man, open(os.path.join(OUT, 'stances.json'), 'w'), indent=1); print('ok')


if __name__ == '__main__':
    build()
