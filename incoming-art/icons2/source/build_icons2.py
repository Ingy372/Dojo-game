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


def rooted_form():
    """Rooted Form = a wide, even, symmetric horse-style stance, front view.
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


def follow_up_kick():
    """Follow-up Kick = Strike adds a second kick (Kick Combo 1: front kick, front kick, inside kick, outside kick, spin kick; the icon shows the front kick). Side view facing right.
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


def sym(I, m, pts, w):
    for sgn in (-1, 1):
        I.limb(m, [(64 + sgn * (x - 64), y) for x, y in pts], w)


def beginners_stance():
    """Beginner's Stance = the ready stance, front view: steady and even.
    Technique: feet shoulder-width apart and parallel, knees soft, back straight, both fists closed in front of the
    belt, eyes forward."""
    fam = 'form'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 0, 0))
    g = I.layer(); I.limb(g, [(40, 89), (88, 89)], 2.2); I.put(g, soft)
    m = I.layer()
    I.limb(m, [(64, 64), (64, 46)], 11.5)
    I.disc(m, 64, 36, 6.2)
    sym(I, m, [(60.5, 64), (57.5, 75.5), (56.5, 86.5)], 6.6)
    sym(I, m, [(52.5, 86.8), (59, 86.8)], 4.6)
    I.put(m, ink)
    for sgn in (-1, 1):
        X = lambda x: 64 + sgn * (x - 64)
        I.arm([(X(58.5), 48), (X(53), 57), (X(59.5), 67)], (X(59.8), 67.5), 4.4, ink, FACE, 3.4)
    b = I.layer(); I.limb(b, [(58.6, 62.4), (69.4, 62.4)], 2.6); I.put(b, ring_hi)
    return fam, I


def flowing_form():
    """Flowing Form = light on your feet. Side view facing right, a light fighting stance.
    Technique: weight on the balls of the feet with the back heel raised, knees bent, lead hand forward, rear hand
    by the chin. Soft motion arcs behind show the movement."""
    fam = 'form'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 2, 0.5))
    a = I.layer()
    for y0, x1, ln in ((55, 47, 10), (66, 45, 13), (77, 45, 9)):
        pts = [(x1 - ln * t, y0 + 1.6 * math.sin(t * math.pi * 2)) for t in [i / 10 for i in range(11)]]
        I.limb(a, pts, 2.6)
    I.limb(a, [(40, 89), (86, 89)], 2.2)
    I.put(a, soft)
    m = I.layer()
    hip = (60, 64)
    I.limb(m, [hip, (61.5, 47)], 9.5)
    I.disc(m, 62.5, 37, 6.2)
    I.limb(m, [hip, (68, 75), (72, 86)], 6.4)
    I.limb(m, [(70, 86.6), (77, 86.6)], 4.6)
    I.limb(m, [hip, (54, 75), (49.5, 84)], 6.4)
    I.limb(m, [(49.5, 84), (46, 87)], 4.4)
    I.put(m, ink)
    I.arm([(60, 49), (56.5, 56), (65, 51)], (65.5, 50.8), 4.4, ink, FACE, 3.1)
    I.arm([(63, 48.5), (71, 55), (74.5, 46)], (74.8, 45.6), 4.6, ink, FACE, 3.4)
    b = I.layer(); I.limb(b, [(55.6, 62.4), (64.4, 63.2)], 2.6); I.put(b, ring_hi)
    return fam, I


def quick_combo():
    """Quick Combo = practiced combos flow smoothly (Kick Combo 2: Kick Combo 1 plus 3 jumping spin kicks).
    Side view facing right: a round kick at middle height striking with the instep, support foot turned, body
    leaning back for balance, guard up. A sweeping arc shows the kick's path and soft chevrons show speed."""
    fam = 'strike'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 1, 0.5))
    a = I.layer()
    pts = [(60 + 25 * math.cos(t), 62 + 25 * math.sin(t)) for t in [math.radians(80 - i * 7) for i in range(10)]]
    I.limb(a, pts, 3.4)
    for cx in (33.5, 40):
        I.limb(a, [(cx, 58.5), (cx + 4.5, 64), (cx, 69.5)], 3.2)
    I.limb(a, [(40, 89), (86, 89)], 2.2)
    I.put(a, (150, 124, 200))
    m = I.layer()
    hip = (58, 64)
    I.limb(m, [hip, (50.5, 48)], 9.5)
    I.disc(m, 48.5, 38.5, 6.2)
    I.limb(m, [hip, (58.5, 76), (58, 86.5)], 6.4)
    I.limb(m, [(53.5, 86.5), (62.5, 86.5)], 4.6)
    I.limb(m, [hip, (72, 58.5), (84, 58)], 6.4)
    I.limb(m, [(84, 58), (89, 59.5)], 4.4)
    I.put(m, ink)
    I.arm([(50, 50), (45, 56.5), (53.5, 51)], (54, 50.8), 4.4, ink, FACE, 3.1)
    I.arm([(52, 49.5), (60.5, 55), (63.5, 46.5)], (63.8, 46), 4.6, ink, FACE, 3.4)
    b = I.layer(); I.limb(b, [(53.6, 61.4), (61.6, 63.6)], 2.6); I.put(b, ring_hi)
    return fam, I


def second_wind():
    """Second Wind (Great Effort) = pushing on when you're tired. Side view facing right: the student rises from
    one knee. Technique: back knee on the floor, front foot flat with the knee over the ankle, back straight, one
    hand pressing on the front knee to stand. Soft rising swirls show the energy coming back."""
    fam = 'virtue'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, -2, 0))
    a = I.layer()
    for x0, h in ((82, 26), (89, 18)):
        pts = [(x0 + 3 * math.sin(t * 5), 80 - h * t) for t in [i / 10 for i in range(11)]]
        I.limb(a, pts, 2.6)
        tp = pts[-1]
        I.poly(a, [(tp[0] - 3.6, tp[1] + 2), (tp[0], tp[1] - 4), (tp[0] + 3.6, tp[1] + 2)])
    I.limb(a, [(36, 89), (86, 89)], 2.2)
    I.put(a, (200, 140, 40))
    m = I.layer()
    hip = (57, 71)
    I.limb(m, [hip, (58.5, 52)], 10)
    I.disc(m, 59.5, 42, 6.4)
    I.limb(m, [hip, (71, 71.5), (72, 86)], 6.6)
    I.limb(m, [(70, 86.6), (78, 86.6)], 4.6)
    I.limb(m, [hip, (52, 86)], 6.6)
    I.limb(m, [(52, 86.2), (41, 86.6)], 5.4)
    I.put(m, ink)
    I.arm([(59.5, 55), (64.5, 63.5), (70, 69)], (70.2, 69.4), 4.2, ink, (255, 240, 196), 2.8)
    b = I.layer(); I.limb(b, [(52.6, 68.4), (61.4, 68.8)], 2.6); I.put(b, (250, 214, 120))
    return fam, I


def perfect_discipline():
    """Perfect Discipline (Self-Discipline) = control and precision. Side view facing right: the student kneels
    in seiza, calm and still. Technique: kneeling with the shins on the floor and sitting on the heels, back
    straight, hands flat on the thighs, eyes forward. Soft still-water ripples on the floor show calm control."""
    fam = 'virtue'; ring, ring_hi, ink, soft = FAMILY[fam]
    I = Ink((1.0, 0, 0))
    a = I.layer()
    I.limb(a, [(38, 90), (86, 90)], 2.2)
    for x, y in ((78, 56), (84, 66), (77, 74)):     # small calm sparkles beside the figure
        I.poly(a, [(x, y - 3.6), (x + 1.4, y), (x, y + 3.6), (x - 1.4, y)])
        I.poly(a, [(x - 3.6, y), (x, y + 1.4), (x + 3.6, y), (x, y - 1.4)])
    I.put(a, (200, 140, 40))
    m = I.layer()
    I.limb(m, [(45, 86), (69, 86)], 6.4)
    I.limb(m, [(49, 80), (70, 80.5)], 7.6)
    I.limb(m, [(50.5, 79), (52.5, 54)], 10.5)
    I.disc(m, 54, 43.5, 6.6)
    I.put(m, ink)
    I.arm([(53.5, 57), (58, 67), (66.5, 76.5)], (67, 77), 4.2, ink, (255, 240, 196), 2.6)
    b = I.layer(); I.limb(b, [(46.6, 72.6), (56.6, 73.6)], 2.6); I.put(b, (250, 214, 120))
    return fam, I


ICONS = [('rooted-form', 'Forms', rooted_form), ('follow-up-kick', 'Strikes', follow_up_kick), ('shield-of-respect', 'Virtues', shield_of_respect),
         ('beginners-stance', 'Forms', beginners_stance), ('flowing-form', 'Forms', flowing_form), ('quick-combo', 'Strikes', quick_combo),
         ('second-wind', 'Virtues', second_wind), ('perfect-discipline', 'Virtues', perfect_discipline)]


def build():
    os.makedirs(OUT, exist_ok=True)
    man = {'about': 'icons2 (Forms / Strikes / Virtues). Medallion icons; labels are drawn by the game.', 'sprites': {}}
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
