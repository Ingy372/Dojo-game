"""Dojo Ascent - icons2 samples: one Forms, one Strikes and one Virtues icon (follow-up to the menu2 seal icons).
Flat 2D, drawn with PIL at 4x, in the same medallion style as incoming-art/icons seal icons: dark edge, cream rim,
coloured family ring, cream face and flat ink symbols. Coordinates are on the 128 px (@2x) grid.
    python3 incoming-art/icons2/source/build_icons2.py
Writes sprites/icon-<id>-64.png and @2x (128), plus sprites/icons2.json."""
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
    'strike': ((63, 154, 208), (122, 171, 207), (46, 111, 158), (127, 184, 224)),   # same blue as the seal icons
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


def rooted_form():
    """Rooted Form = the wide fighting stance (A2 option A), side view facing right.
    Technique: feet about two shoulder-widths apart, both knees bent, front knee over the front foot, back straight,
    weight low and centred, guard up (lead fist forward at chin height, rear fist by the chin)."""
    fam = 'form'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, -1.0, 0.5))
    g = I.layer()  # ground + root marks (soft ink)
    I.limb(g, [(38, 89), (90, 89)], 2.2)
    for x in (43, 47.5, 77, 81.5):
        I.limb(g, [(x, 92), (x - 1 if x < 60 else x + 1, 95.5)], 2.2)
    I.put(g, soft)
    m = I.layer()
    hip, sh = (63, 65), (64, 47)
    I.limb(m, [hip, sh], 9.5)                                  # torso, upright
    I.disc(m, 66.5, 37.5, 6.2)                                 # head
    I.limb(m, [hip, (75, 74), (78, 86.5)], 6.4)                 # front leg: knee over foot
    I.limb(m, [(78, 86.5), (85.5, 86.5)], 4.6)                  # front foot, toes forward
    I.limb(m, [hip, (52, 75), (45, 86.5)], 6.4)                 # back leg, bent
    I.limb(m, [(45, 86.5), (50.5, 86.5)], 4.6)                  # back foot, flat
    I.put(m, ink)
    I.arm([(63, 49.5), (60, 57), (70, 50)], (70.5, 49.5), 4.4, ink, FACE, 3.2)        # rear arm, fist by the chin
    I.arm([(65, 48.5), (75, 55.5), (81, 46)], (81.5, 45.5), 4.6, ink, FACE, 3.5)      # lead arm, fist forward at chin height
    b = I.layer()                                              # belt knot accent
    I.limb(b, [(58.6, 63), (67.6, 63)], 2.6)
    I.limb(b, [(63, 63.5), (60.5, 68.5)], 1.8)
    I.put(b, ring_hi)
    return fam, I


def follow_up_kick():
    """Follow-up Kick = Strike adds a second kick. Side view facing right.
    Technique (front kick): support leg slightly bent with the foot flat, hips forward, kicking leg extended at
    chest height striking with the ball of the foot (toes pulled back), guard kept up. The first, lower kick is a
    soft ghost; a curved arrow shows the follow-up rising to the second."""
    fam = 'strike'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 3.0, 0.5))
    g = I.layer()
    I.limb(g, [(38, 89), (90, 89)], 2.2)
    I.put(g, soft, 140)
    gh = I.layer()                                              # first kick (ghost)
    I.limb(gh, [(57, 64), (69, 70), (81, 74)], 6.0)
    I.limb(gh, [(81, 74), (83.5, 68.5)], 4.4)
    I.put(gh, soft, 200)
    a = I.layer()                                               # follow-up arrow
    pts = [(86.5 + 6 * math.cos(t), 66 - 9 * math.sin(t)) for t in [math.pi * (-0.35 + i * 0.05) for i in range(13)]]
    I.limb(a, pts[:10], 3.0)
    tip = pts[10]
    I.poly(a, [(tip[0] - 1, tip[1] - 6.5), (tip[0] - 5.8, tip[1] + 1.6), (tip[0] + 4.2, tip[1] + 2.2)])
    I.put(a, soft)
    m = I.layer()
    hip, sh = (56, 64), (51.5, 46.5)
    I.limb(m, [hip, sh], 9.5)                                   # torso, slight lean back for balance
    I.disc(m, 50.5, 37, 6.2)                                    # head, eyes forward
    I.limb(m, [hip, (54.5, 75.5), (55, 86.5)], 6.4)             # support leg, slightly bent
    I.limb(m, [(51, 86.5), (60.5, 86.5)], 4.6)                  # support foot flat
    I.limb(m, [hip, (70, 59), (83, 55.5)], 6.4)                 # kicking leg extended
    I.limb(m, [(82, 55.8), (84.5, 51.5)], 5.2)                  # foot: toes pulled back, ball of foot leads
    I.limb(m, [(84.5, 51.5), (83.6, 48.6)], 3.0)                # toes
    I.put(m, ink)
    I.arm([(50.5, 48.5), (46, 55.5), (55.5, 50)], (56, 49.8), 4.4, ink, FACE, 3.1)    # rear guard by the chin
    I.arm([(53, 48), (61.5, 54.5), (65.5, 45)], (65.8, 44.6), 4.6, ink, FACE, 3.4)    # lead guard forward
    b = I.layer()
    I.limb(b, [(51.8, 62.2), (60.4, 63.6)], 2.6)
    I.put(b, ring_hi)
    return fam, I


def shield_of_respect():
    """Shield of Respect = a gold shield with a student bowing (rei).
    Technique (standing bow): heels together, legs straight, bend about 30 degrees at the waist with a straight back,
    hands flat at the sides of the thighs, eyes down."""
    fam = 'virtue'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 0, 0))
    s = I.layer()
    cx, top, r = 64, 33, 27
    pts = [(cx - r * 0.86, top), (cx, top - 3), (cx + r * 0.86, top)]
    pts += [(cx + r * 0.86 * math.cos(a), top + 22 - 0 + 22 * math.sin(a) * 1.15 if a > 0 else top + 22 * (1 - 0) ) for a in []]
    # shield: flat top, straight sides, rounded point at the bottom
    pts = [(cx - 24, 34), (cx, 30.5), (cx + 24, 34), (cx + 24, 56)]
    pts += [(cx + 24 * math.cos(a), 56 + 36 * math.sin(a)) for a in [i * math.pi / 20 for i in range(1, 20)]]
    pts += [(cx - 24, 56)]
    pts = [(x, min(y, 94)) for x, y in pts]
    pts = [(cx + (x - cx) * 0.9, 64 + (y - 64) * 0.86) for x, y in pts]   # keep the shield inside the face
    I.poly(s, [(cx + (x - cx) * 1.1, 62 + (y - 62) * 1.08) for x, y in pts])
    I.put(s, (176, 120, 30))
    s2 = I.layer(); I.poly(s2, pts); I.put(s2, (250, 220, 130))
    s3 = I.layer(); I.poly(s3, [(cx + (x - cx) * 0.86, 62 + (y - 62) * 0.88) for x, y in pts]); I.put(s3, (255, 240, 196))
    m = I.layer()
    ank, hip = (57, 84), (57, 65)
    ang = math.radians(32)
    sh = (hip[0] + 18 * math.sin(ang), hip[1] - 18 * math.cos(ang))
    I.limb(m, [ank, (hip[0] + 0.5, hip[1] - 2)], 7.4)                                   # legs straight, together
    I.limb(m, [(54, 84.5), (65, 84.5)], 4.8)                     # feet
    I.limb(m, [hip, sh], 10.5)                                   # straight back, ~30 degree bow
    I.disc(m, sh[0] + 9.2 * math.sin(ang) + 1.5, sh[1] - 9.2 * math.cos(ang) + 1.5, 6.6)   # head in line with the back, eyes down
    I.put(m, ink)
    I.arm([(sh[0] - 0.5, sh[1] + 2), (62.5, 66), (62.8, 72)], (62.8, 72.5), 4.2, ink, (255, 240, 196), 2.4)  # arm, hand flat at the thigh
    b = I.layer()
    I.limb(b, [(53.6, 64.8), (62.4, 63.4)], 2.6)
    I.put(b, (250, 214, 120))
    return fam, I


ICONS = [('rooted-form', 'Forms', rooted_form), ('follow-up-kick', 'Strikes', follow_up_kick), ('shield-of-respect', 'Virtues', shield_of_respect)]


def build():
    os.makedirs(OUT, exist_ok=True)
    man = {'about': 'icons2 samples (Forms / Strikes / Virtues). Medallion icons; labels are drawn by the game.', 'sprites': {}}
    for iid, group, fn in ICONS:
        fam, I = fn()
        im = medallion(fam)
        clip = Image.new('L', (N, N), 0)
        ImageDraw.Draw(clip).ellipse([P(CX - 34.4), P(CY - 34.4), P(CX + 34.4), P(CY + 34.4)], fill=255)
        ink = I.img.copy(); ink.putalpha(Image.fromarray(__import__('numpy').minimum(__import__('numpy').array(ink.getchannel('A')), __import__('numpy').array(clip))))
        im.alpha_composite(ink)
        im.resize((128, 128), Image.LANCZOS).save(os.path.join(OUT, f'icon-{iid}-64@2x.png'))
        im.resize((64, 64), Image.LANCZOS).save(os.path.join(OUT, f'icon-{iid}-64.png'))
        man['sprites'][f'icon-{iid}-64'] = {'size': [64, 64], 'file': f'icon-{iid}-64.png', 'group': group, 'ring': fam,
                                            'note': (fn.__doc__ or '').strip().replace('\n', ' ')}
    json.dump(man, open(os.path.join(OUT, 'icons2.json'), 'w'), indent=1)
    print('ok', len(man['sprites']))


if __name__ == '__main__':
    build()
