"""MENU-CATALOG-01 samples: the Abilities "Move Catalog" (collectible cards for the moves kids learn in class).
Three images, all drawn by script (Pillow + numpy):
  python3 incoming-art/menu-catalog/source/build_catalog.py
Needs PR #412 merged (it imports incoming-art/tools/board_ui_kit.py, the warm Board look).
The Seal medallions are PB-07 (PR #419, final v3): seal_icons.py and toon.py are copied next to this file so the
sample builds without #419. make_tab_icons.py is the #412 final tab icons, copied for the same reason. Real names and dojo words come from the repo docs (see README, "Where the words come from").
Words marked PLACEHOLDER are not in the docs yet; they are listed under DECIDE in DELIVERY_NOTE.md."""
import os, sys, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                       # incoming-art/menu-catalog
ART = os.path.dirname(ROOT)                        # incoming-art
REPO = os.path.dirname(ART)
sys.path.insert(0, os.path.join(ART, 'tools'))
sys.path.insert(0, HERE)
import board_ui_kit as ku
from board_ui_kit import K, M, Screen, font, spr, sized, tint, INK, INK_SOFT, CREAM
import mat
from mat import S
import seal_icons as si
import moves_text as mt

PV = os.path.join(ROOT, 'preview')
os.makedirs(PV, exist_ok=True)
SHADOW_TXT = (60, 32, 14)
TEXTS = json.load(open(os.path.join(REPO, 'drafts', 'content', 'abilities', 'seal-families-text.json')))

# ------------------------------------------------------------------ the words (all from the repo docs)
RANK = {}                                           # self-defense number -> (family id, game name, kid effect line)
for fam in TEXTS['families']:
    for r in fam['ranks']:
        RANK[r['technique']] = (fam['id'], r['name'], r['text'])
BELTS5 = ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Red', 'Red/Black', 'Brown']   # 5 moves per belt, #1-40 (docs/self-defense.md)
BELT_OF = {n: BELTS5[(n - 1) // 5] for n in range(1, 41)}
MOVES = mt.parse()                                   # Jay's table, docs/self-defense.md
PLACEHOLDER_TXT = 'Not written yet'                  # PLACEHOLDER wording for a move whose words Jay has not given


def dojo_of(n):
    """Jay's exact words for move n: short line (= the attack), numbered steps, result. Nothing is reworded."""
    m = MOVES[n]
    steps, review = mt.split_steps(m['does'])
    if not m['stated']:
        return dict(short=None, attack=None, steps=[], result=m['result'], review=False)
    return dict(short=m['attack'], attack=m['attack'], steps=steps, result=m['result'], review=review)


RIM = dict(si.RIMS)
RIM_NAME = {'counter': 'COUNTER', 'escape': 'ESCAPE', 'guard': 'GUARD', 'disarm': 'DISARM', 'throw': 'THROW',
            'strike': 'STRIKE', 'kata': 'KATA'}
DRAWN = {'counter', 'guard', 'disarm', 'strike', 'kata'}      # PB-07 pictures that exist; Escape and Throw are not drawn yet


def lighten(c, t):
    return tuple(int(v + (255 - v) * t) for v in c)


def darken(c, t):
    return tuple(int(v * (1 - t)) for v in c)


def lum(c):
    return .3 * c[0] + .59 * c[1] + .11 * c[2]


# ------------------------------------------------------------------ small helpers
def put_piece(sc, im, x, y):
    sc.put(im, x - M, y - M)


def label(sc, x, y, s, sz, col=INK, anchor='mm', w='ExtraBold', shadow=None):
    sc.text(x, y, s, sz, col, anchor, w, shadow)


def fit_label(sc, x, y, s, sz, maxw, col=INK, w='ExtraBold', min_sz=7):
    """one centred line, shrunk until it fits maxw points."""
    while sz > min_sz and font(sz, w).getlength(s) > maxw * K:
        sz -= .5
    label(sc, x, y, s, sz, col, 'mm', w)


def wrap(s, sz, w, maxw):
    f = font(sz, w)
    lines, cur = [], ''
    for word in s.split(' '):
        t = (cur + ' ' + word).strip()
        if f.getlength(t) <= maxw * K or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


def tri(sc, cx, cy, size, col, left=False):
    d = ImageDraw.Draw(sc.img)
    s = size * K
    x, y = cx * K, cy * K
    pts = [(x + s * .5, y - s * .6), (x + s * .5, y + s * .6), (x - s * .6, y)] if left else \
          [(x - s * .5, y - s * .6), (x - s * .5, y + s * .6), (x + s * .6, y)]
    d.polygon(pts, fill=col)


def tri_down(sc, cx, cy, size, col):
    d = ImageDraw.Draw(sc.img)
    q = size * K
    x, y = cx * K, cy * K
    d.polygon([(x - q, y - q * .5), (x + q, y - q * .5), (x, y + q * .7)], fill=col)


def levelbar(sc, bx, y, bw, frac):
    sc.put(sized('xp-bar-frame', bw, 20), bx, y)
    fw = (bw - 8) * frac
    if fw > 2:
        sc.put(ku.nine(tint(spr('xp-bar-fill'), (242, 193, 78)), int(fw * K), 11 * K, [0, 6, 0, 6]), bx + 4, y + 4)
        sc.put(ku.nine(spr('xp-bar-gloss'), int(fw * K), 11 * K, [0, 6, 0, 6]), bx + 4, y + 4)


# ------------------------------------------------------------------ medallions (PB-07) and the card frame
_med = {}


def medallion_img(fam, num=None):
    """the PB-07 picture for a family, 1024 px. Escape and Throw are not drawn yet: a PLACEHOLDER medallion
    (same rim, same cream face) carries the move number instead of a picture."""
    key = (fam, num)
    if key in _med:
        return _med[key]
    if fam == 'strike':
        im = si.ALL['strike']()
    elif fam == 'kata':
        im = si.ALL['kata']()
    elif fam in DRAWN:
        im = si.ALL[fam]()
    else:
        im = si.medallion(RIM[fam]).result()
        d = ImageDraw.Draw(im)
        f = ku.ImageFont.truetype(ku.FONT, 430)
        try:
            f.set_variation_by_name('ExtraBold')
        except Exception:
            pass
        d.text((512, 520), str(num), font=f, fill=darken(RIM[fam], .25) + (255,), anchor='mm')
    _med[key] = im
    return im


def put_medallion(sc, im, cx, cy, d, shadow=True):
    px = int(d * K)
    ic = im.resize((px, px), Image.LANCZOS)
    if shadow:
        a = ic.getchannel('A').filter(ImageFilter.GaussianBlur(d * K * .035))
        sh = Image.new('RGBA', ic.size, (*mat.SHADOW, 0))
        sh.putalpha(a.point(lambda v: int(v * .42)))
        sc.img.alpha_composite(sh, (int(cx * K - px / 2 + 1.5 * K), int(cy * K - px / 2 + 3 * K)))
    sc.img.alpha_composite(ic, (int(cx * K - px / 2), int(cy * K - px / 2)))


def frame_piece(w, h, rim, bw=6, r=14, seed=21):
    """a collectible card: family-colour frame, cream paper inside."""
    img = ku.cv(w, h)
    m = ku.box(w, h, r)
    mat.drop_shadow(img, m, 2.2, 2.6, .45)
    mat.tex(img, mat.vgrad(*img.size, lighten(rim, .28), darken(rim, .12)), m)
    mat.bevel(img, m, 1.4, 1.1, hi_a=.5, lo_a=.35)
    mat.rim_light(img, m, alpha=.6)
    mat.outline(img, m, darken(rim, .6), 1.5)
    mi = Image.new('L', img.size, 0)
    ImageDraw.Draw(mi).rounded_rectangle([S(M + bw), S(M + bw), S(M + w - bw), S(M + h - bw)], S(max(r - bw + 2, 3)), fill=255)
    mat.tex(img, mat.paper(*img.size, seed, fibres=False), mi)
    mat.inner_shadow(img, mi, 1.4, 1.6, .3)
    mat.outline(img, mi, darken(rim, .5), 1.1)
    return ku.out(img, w, h)


def stage_disc(sc, cx, cy, r, rim):
    """a pale family-colour disc behind the medallion (paper stamp), lit from the upper left."""
    d = ImageDraw.Draw(sc.img, 'RGBA')
    d.ellipse([(cx - r) * K, (cy - r) * K, (cx + r) * K, (cy + r) * K], fill=lighten(rim, .78) + (150,))
    d.ellipse([(cx - r) * K, (cy - r) * K, (cx + r) * K, (cy + r) * K], outline=lighten(rim, .35) + (200,), width=int(1.6 * K))
    for i in range(24):                              # tick ring, like a stamp
        a = 2 * math.pi * i / 24
        d.line([((cx + (r - 1) * math.cos(a)) * K, (cy + (r - 1) * math.sin(a)) * K),
                ((cx + (r - 5) * math.cos(a)) * K, (cy + (r - 5) * math.sin(a)) * K)], fill=lighten(rim, .35) + (190,), width=K)


def locked_piece(w, h, r=9, seed=43):
    """a locked card: dark wood, pressed in. The words on it stay readable."""
    img = ku.cv(w, h)
    m = ku.box(w, h, r)
    mat.drop_shadow(img, m, 2, 2.4, .45)
    tex = mat.wood(*img.size, seed, (112, 70, 38), (70, 40, 20), (140, 92, 52), contrast=.8).convert('RGBA')
    mat.tex(img, tex, m)
    mat.inner_shadow(img, m, 1.8, 2, .4)
    mat.bevel(img, m, 1.3, 1, hi_a=.28, lo_a=.4)
    mat.outline(img, m, mat.WOOD_DD, 1.6)
    return ku.out(img, w, h)


def ink_on(col):
    return INK if lum(col) > 150 else CREAM


# ------------------------------------------------------------------ the big card (front and back)
# LAYOUT: every number the game needs to draw the text itself, in card points (card = 250 x 396, origin = top-left of the
# visible card, not of the file). export_catalog.py writes this into the manifest.
CW, CH = 250, 396
BWD = 6                                              # frame width
LAYOUT = dict(
    card=[CW, CH],
    front=dict(
        ribbonRect=[10, 14, 124, 24], ribbonText=dict(at=[20, 26], anchor='lm', size=12.5, weight='ExtraBold'),
        beltText=dict(at=[232, 26], anchor='rm', size=12, weight='ExtraBold', color='#6e4a2e'),
        medallion=dict(center=[125, 112], size=124), stageDisc=dict(center=[125, 112], radius=74),
        bigName=dict(at=[125, 204], anchor='mm', size=27, weight='ExtraBold', maxWidth=218, color='#462a16'),
        gameName=dict(at=[125, 229], anchor='mm', size=16.5, weight='ExtraBold', maxWidth=218, colorRule='family rim darkened 42%'),
        effect=dict(at=[125, 252], anchor='mm', size=12.5, weight='SemiBold', lineHeight=16, maxLines=2, maxWidth=224, color='#6e4a2e'),
        inset=dict(rect=[14, 288, 222, 92], sprite='menu2 panel-inset (9-slice), or card/inset-placeholder when the words are not written'),
        insetLabel=dict(at=[26, 304], anchor='lm', size=12.5, weight='ExtraBold', colorRule='family rim darkened 45%'),
        shortLine=dict(at=[26, 330], anchor='lm', size=14, weight='Bold', lineHeight=17, maxLines=3, maxWidth=198, color='#462a16'),
        flipChip=dict(rect=[124, 293, 104, 22], text=dict(at=[166, 305], anchor='mm', size=11.5, weight='ExtraBold', color='#462a16'))),
    back=dict(
        ribbonRect=[10, 14, 124, 24], ribbonText=dict(at=[20, 26], anchor='lm', size=12.5, weight='ExtraBold'),
        medallion=dict(center=[44, 80], size=56),
        bigName=dict(at=[80, 70], anchor='lm', size=19, weight='ExtraBold', maxWidth=152, color='#462a16'),
        gameName=dict(at=[80, 92], anchor='lm', size=13.5, weight='ExtraBold', maxWidth=152, colorRule='family rim darkened 42%'),
        startsLabel=dict(at=[22, 124], anchor='lm', size=11, weight='ExtraBold', color='#6e4a2e'),
        attack=dict(at=[22, 142], anchor='lm', size=15, weight='ExtraBold', maxWidth=206, color='#462a16'),
        stepsArea=dict(rect=[16, 154, 218, 136], badge=dict(size=[20, 20], center_x=32), placeholderRect=[14, 158, 222, 126], rowRule='row height = lines x (size x 1.16) + 5, at least 22', text=dict(x=50, anchor='lm', maxWidth=184, weight='Bold', color='#462a16',
                       sizeMax=13, sizeMin=12, note='shrink from 13 to 12 pt to fit; if it still does not fit, scroll this area (moves with 5+ long steps)')),
        inset=dict(rect=[14, 296, 222, 84]),
        insetLabel=dict(at=[26, 311], anchor='lm', size=12.5, weight='ExtraBold', colorRule='family rim darkened 45%'),
        resultLines=dict(at=[26, 331], anchor='lm', size=12.5, weight='Bold', lineHeight=15.5, maxLines=3, maxWidth=198, color='#462a16')))


def placeholder_inset(w, h):
    """the paper inset with a dashed tan outline: the words for this move are not written yet. w x h points, at K."""
    im = sized('panel-inset', w, h).copy()
    d = ImageDraw.Draw(im)
    col = (150, 112, 70, 255)
    x0, y0, x1, y1 = 5 * K, 5 * K, im.width - 5 * K, im.height - 5 * K
    dash, gap = 7 * K, 5 * K
    for (ax, ay, bx_, by_) in ((x0, y0, x1, y0), (x0, y1, x1, y1)):
        t = ax
        while t < bx_:
            d.line([(t, ay), (min(t + dash, bx_), by_)], fill=col, width=int(1.6 * K))
            t += dash + gap
    for (ax, ay, bx_, by_) in ((x0, y0, x0, y1), (x1, y0, x1, y1)):
        t = ay
        while t < by_:
            d.line([(ax, t), (bx_, min(t + dash, by_))], fill=col, width=int(1.6 * K))
            t += dash + gap
    return im


def dashed_inset(sc, x, y, w, h, rim):
    """PLACEHOLDER panel: the paper inset with a dashed outline (the words are not written yet)."""
    sc.put(placeholder_inset(int(w), int(h)), x, y)


def card_front(sc, x, y, w, d):
    """d: fam, ribbon, belt, big, game, effect, short (Jay's short line, or None = not written yet), num."""
    s = w / 250.0
    h = 396 * s
    L = LAYOUT['front']
    rim = RIM[d['fam']]
    bw = 6 * s
    put_piece(sc, frame_piece(int(w), int(h), rim, bw, 16 * s), x, y)
    rx, ry, rw, rh = [v * s for v in L['ribbonRect']]
    put_piece(sc, ku.ribbon(int(rw), int(rh), rim), x + rx, y + ry)
    rc = ink_on(rim)
    label(sc, x + rx + 10 * s, y + ry + rh / 2, d['ribbon'], 12.5 * s, rc, 'lm', 'ExtraBold', None if rc == INK else darken(rim, .55))
    label(sc, x + w - bw - 12 * s, y + ry + rh / 2, d['belt'], 12 * s, INK_SOFT, 'rm', 'ExtraBold')
    cx, cy, r = x + w / 2, y + 112 * s, 66 * s
    stage_disc(sc, cx, cy, r + 8 * s, rim)
    put_medallion(sc, medallion_img(d['fam'], d.get('num')), cx, cy, 2 * r - 8 * s)
    fit_label(sc, cx, y + 204 * s, d['big'], 27 * s, w - 2 * bw - 20 * s, INK)
    fit_label(sc, cx, y + 229 * s, d['game'], 16.5 * s, w - 2 * bw - 20 * s, darken(rim, .42))
    ey = y + 252 * s
    for i, ln in enumerate(wrap(d['effect'], 12.5 * s, 'SemiBold', w - 2 * bw - 26 * s)[:2]):
        label(sc, cx, ey + i * 16 * s, ln, 12.5 * s, INK_SOFT, 'mm', 'SemiBold')
    bx, by, bwid, bh = [v * s for v in L['inset']['rect']]
    bx, by = x + bx, y + by
    if d.get('short'):
        sc.put(sized('panel-inset', int(bwid), int(bh)), bx, by)
        label(sc, bx + 12 * s, by + 16 * s, 'In the dojo:', 12.5 * s, darken(rim, .45), 'lm', 'ExtraBold')
        for i, ln in enumerate(wrap(d['short'], 14 * s, 'Bold', 198 * s)[:3]):
            label(sc, bx + 12 * s, by + 42 * s + i * 17 * s, ln, 14 * s, INK, 'lm', 'Bold')
        fx, fy, fw, fh = [v * s for v in L['flipChip']['rect']]
        put_piece(sc, flip_chip(int(fw), int(fh)), x + fx, y + fy)
        label(sc, x + fx + fw * .40, y + fy + fh / 2 + 1 * s, 'Flip for steps', 11.5 * s, INK, 'mm', 'ExtraBold')
    else:
        dashed_inset(sc, bx, by, bwid, bh, rim)
        label(sc, bx + 12 * s, by + 16 * s, 'In the dojo:', 12.5 * s, darken(rim, .45), 'lm', 'ExtraBold')
        label(sc, bx + bwid / 2, by + 52 * s, '[PLACEHOLDER]', 11 * s, INK_SOFT, 'mm', 'ExtraBold')
        label(sc, bx + bwid / 2, by + 70 * s, PLACEHOLDER_TXT, 14 * s, INK_SOFT, 'mm', 'Bold')
    return h


def fit_steps(steps, area_w, area_h, smax=13, smin=12):
    """size and layout for the numbered steps: shrink smax -> smin until they fit. Returns (size, [(lines, pitch)], fits)."""
    for sz in [smax - i * .5 for i in range(int((smax - smin) / .5) + 1)]:
        rows, tot = [], 0
        lh = sz * 1.16
        for st in steps:
            lines = wrap(st, sz, 'Bold', area_w)
            hh = max(22, len(lines) * lh + 5)
            rows.append((lines, hh))
            tot += hh
        if tot <= area_h:
            return sz, rows, True
    return smin, rows, False


def card_back(sc, x, y, w, d, steps, attack, result):
    s = w / 250.0
    h = 396 * s
    L = LAYOUT['back']
    rim = RIM[d['fam']]
    bw = 6 * s
    put_piece(sc, frame_piece(int(w), int(h), rim, bw, 16 * s, seed=27), x, y)
    rx, ry, rw, rh = [v * s for v in L['ribbonRect']]
    put_piece(sc, ku.ribbon(int(rw), int(rh), rim), x + rx, y + ry)
    rc = ink_on(rim)
    label(sc, x + rx + 10 * s, y + ry + rh / 2, 'HOW IT GOES', 12.5 * s, rc, 'lm', 'ExtraBold', None if rc == INK else darken(rim, .55))
    put_medallion(sc, medallion_img(d['fam'], d.get('num')), x + 44 * s, y + 80 * s, 56 * s)
    fit_label_l(sc, x + 80 * s, y + 70 * s, d['big'], 19 * s, 152 * s, INK)
    fit_label_l(sc, x + 80 * s, y + 92 * s, d['game'], 13.5 * s, 152 * s, darken(rim, .42))
    if attack:
        label(sc, x + 22 * s, y + 124 * s, 'IT STARTS WITH', 11 * s, INK_SOFT, 'lm', 'ExtraBold')
        label(sc, x + 22 * s, y + 142 * s, attack[0].upper() + attack[1:], 15 * s, INK, 'lm', 'ExtraBold')
    ax, ay, aw, ah = [v * s for v in L['stepsArea']['rect']]
    fits = True
    if steps:
        sz, rows, fits = fit_steps(steps, 184 * s, ah, 13 * s, 12 * s)
        yy = y + ay
        used = 0
        for i, (lines, hh) in enumerate(rows):
            if used + hh > ah:                       # does not fit: the game scrolls this area. Sample shows a 'more' chevron.
                tri_down(sc, x + 125 * s, yy - 3 * s, 5 * s, INK_SOFT)
                break
            used += hh
            put_piece(sc, ku.new_dot(10), x + 22 * s, yy + 1 * s)
            label(sc, x + 32 * s, yy + 11 * s, str(i + 1), 12 * s, INK, 'mm', 'ExtraBold')
            lh = sz * 1.16
            oy = yy + 11 * s
            for j, ln in enumerate(lines):
                label(sc, x + 50 * s, oy + j * lh, ln, sz, INK, 'lm', 'Bold')
            yy += hh
    else:
        px_, py_, pw_, ph_ = x + 14 * s, y + 158 * s, 222 * s, 126 * s
        dashed_inset(sc, px_, py_, pw_, ph_, rim)
        label(sc, px_ + pw_ / 2, py_ + ph_ / 2 - 10 * s, '[PLACEHOLDER]', 11 * s, INK_SOFT, 'mm', 'ExtraBold')
        label(sc, px_ + pw_ / 2, py_ + ph_ / 2 + 10 * s, PLACEHOLDER_TXT, 14 * s, INK_SOFT, 'mm', 'Bold')
    bx, by, bwid, bh = [v * s for v in L['inset']['rect']]
    sc.put(sized('panel-inset', int(bwid), int(bh)), x + bx, y + by)
    label(sc, x + bx + 12 * s, y + by + 15 * s, 'What happens:', 12.5 * s, darken(rim, .45), 'lm', 'ExtraBold')
    for i, ln in enumerate(wrap(result, 12.5 * s, 'Bold', 198 * s)[:3]):
        label(sc, x + bx + 12 * s, y + by + 35 * s + i * 15.5 * s, ln, 12.5 * s, INK, 'lm', 'Bold')
    return h if fits else -h


def fit_label_l(sc, x, y, s_, sz, maxw, col):
    while sz > 8 and font(sz, 'ExtraBold').getlength(s_) > maxw * K:
        sz -= .5
    label(sc, x, y, s_, sz, col, 'lm', 'ExtraBold')


def flip_chip(w, h):
    """a small gold chip for 'Flip for steps' (blank; text drawn by the game) with a play-arrow at the right end."""
    img = ku.cv(w, h)
    m = ku.box(w, h, h / 2)
    mat.drop_shadow(img, m, 1.2, 1.6, .4)
    mat.tex(img, mat.vgrad(*img.size, mat.GOLD_L, mat.GOLD), m)
    mat.bevel(img, m, 1, .8, hi_a=.5, lo_a=.3)
    mat.outline(img, m, mat.GOLD_D, 1.2)
    d = ImageDraw.Draw(img)
    cx, cy = S(M + w - 13), S(M + h / 2)
    d.polygon([(cx - S(3), cy - S(4.2)), (cx - S(3), cy + S(4.2)), (cx + S(4), cy)], fill=(70, 42, 22, 255))
    return ku.out(img, w, h)


# ------------------------------------------------------------------ grid cards: collected / new / locked
def mini(sc, x, y, w, h, d, state='collected'):
    s = w / 87.0
    if state == 'locked':
        put_piece(sc, locked_piece(int(w), int(h), 9 * s, 43 + d.get('n', 0)), x, y)
        cx = x + w / 2
        sc.put(ku.medallion(int(20 * s), 'locked', seed=41 + d.get('n', 0)), cx - 20 * s - M, y + 9 * s + 0 - M + 0)
        fit_label(sc, cx, y + h - 31 * s, d['big'], 11.5 * s, w - 10 * s, (240, 222, 186))
        fit_label(sc, cx, y + h - 15 * s, d['belt'], 10.5 * s, w - 10 * s, (206, 172, 124), 'Bold')
        return
    rim = RIM[d['fam']]
    put_piece(sc, frame_piece(int(w), int(h), rim, 3.2 * s, 9 * s, seed=21 + d.get('n', 0)), x, y)
    cx = x + w / 2
    put_medallion(sc, medallion_img(d['fam'], d.get('num')), cx, y + 8 * s + 26 * s, 52 * s)
    fit_label(sc, cx, y + h - 31 * s, d['big'], 11.5 * s, w - 12 * s, INK)
    fit_label(sc, cx, y + h - 15 * s, d['game'], 10.5 * s, w - 12 * s, darken(rim, .42), 'Bold')
    if state == 'new':
        rib = ku.ribbon(int(36 * s), int(15 * s), (244, 190, 66))
        put_piece(sc, rib, x - 5 * s, y + 7 * s)
        label(sc, x - 5 * s + 17 * s, y + 7 * s + 7.5 * s, 'NEW', 9.5 * s, INK, 'mm', 'ExtraBold')


def sd_card(n, **kw):
    fam, name, eff = RANK[n]
    belt = BELT_OF[n] + ' Belt'
    dj = dojo_of(n)
    return dict(fam=fam, game=name, effect=eff, belt=belt, big='Defense #%d' % n, n=n, num=n, short=dj['short'], **kw)


# ------------------------------------------------------------------ the Board chrome (same as the B2 samples, #412)
TABS = [('climb', 'Climb'), ('gear', 'Gear'), ('abilities', 'Abilities'), ('gate', 'Gate')]


def chrome(sc, active, new_on=('gear',), level=(3, 18, 40), belt=('Yellow Belt', '#f2c230')):
    label(sc, 16, 28, 'Training Board', 16, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    put_piece(sc, ku.wood_button(86, 44), 202, 8)
    tri(sc, 221, 30, 6, CREAM, left=True)
    label(sc, 254, 30, 'Dojo', 15, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    cx = 151
    sc.put(ku.mat_tatami(190, 22), cx - 95 - M, 139 - M)
    sh = ku.shadow_oval(64, 9, .5)
    sc.img.alpha_composite(sh, (int(cx * K - sh.width / 2), int(150 * K - sh.height / 2)))
    hp = ku.hero(100, belt=belt[1])
    sc.img.alpha_composite(hp, (int(cx * K - hp.width / 2), int(152 * K - hp.height)))
    sc.put(sized('title-plaque', 212, 34), cx - 106, 161)
    label(sc, cx, 178, 'Kai M. \u00b7 ' + belt[0], 15, INK, 'mm', 'ExtraBold')
    lv, cur, tot = level
    label(sc, 45, 204, f'Level {lv}', 12, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    label(sc, 257, 204, f'{cur} of {tot}', 12, CREAM, 'rm', 'ExtraBold', SHADOW_TXT)
    levelbar(sc, 45, 210, 212, cur / tot)
    put_piece(sc, ku.lacquer_button(274, 44, ku.ENTER_TOP, ku.ENTER_BOT, ku.ENTER_OL), 14, 236)
    label(sc, 151, 258, 'ENTER THE TOWER', 17, CREAM, 'mm', 'ExtraBold', ku.ENTER_OL)
    put_piece(sc, ku.wood_button(274, 40), 14, 286)
    label(sc, 151, 306, 'Practice room', 15, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    put_piece(sc, ku.paper_card(274, 46), 14, 332)
    label(sc, 30, 347, 'YOUR NEXT STEP', 12, mat.GOLD_D, 'lm', 'ExtraBold')
    label(sc, 30, 364, 'Self-Defense #10', 16, INK, 'lm', 'ExtraBold')
    label(sc, 276, 364, 'Video soon', 12, INK_SOFT, 'rm', 'Bold')
    tri(sc, 211, 364, 3.6, INK_SOFT)
    x0, tw, gap = 306, 126, 6
    for i, (key, name) in enumerate(TABS):
        x = x0 + i * (tw + gap)
        on = key == active
        if on:
            put_piece(sc, ku.tab(tw, 48, 'active'), x, 4)
        else:
            put_piece(sc, ku.tab(tw, 44, 'normal', seed=11 + i), x, 8)
        ic = ku.tab_icon(key, 26)
        sc.img.alpha_composite(ic, (int((x + 14) * K), int((7 + 22 - 13 + (0 if not on else -2)) * K)))
        label(sc, x + 48, 30 - (2 if on else 0), name, 14, INK if on else CREAM, 'lm', 'ExtraBold', None if on else SHADOW_TXT)
        if key in new_on and not on:
            put_piece(sc, ku.new_dot(6), x + tw - 20, 8)
    sc.put(sized('panel-frame', 536, 340), 300, 46)


# ------------------------------------------------------------------ sample b: the catalog grid, 844 x 390
GRID = [(6, 'collected'), (7, 'collected'), (8, 'collected'), (9, 'new'), (10, 'locked'),
        (11, 'locked'), (12, 'locked'), (13, 'locked'), (14, 'locked'), (15, 'locked')]


def catalog_tab(sc):
    X0 = 326
    sc.put(ku.progress_ring(16, 8 / 40.0, 6), X0 + 8 - M, 74 - M)
    label(sc, X0 + 52, 87, 'Move Catalog', 20, INK, 'lm', 'ExtraBold')
    label(sc, X0 + 52, 108, '8 of 40 moves collected', 13, INK_SOFT, 'lm', 'SemiBold')
    chips = [('Self-Defense', 100, True), ('Kick Combos', 94, False), ('Forms', 66, False)]
    cx = 810 - sum(c[1] for c in chips) - 6 * (len(chips) - 1)
    for i, (nm, cw, on) in enumerate(chips):
        if on:
            put_piece(sc, ku.tab(cw, 32, 'active'), cx, 70)
            label(sc, cx + cw / 2, 87, nm, 12, INK, 'mm', 'ExtraBold')
        else:
            put_piece(sc, ku.tab(cw, 28, 'normal', seed=19 + i), cx, 74)
            label(sc, cx + cw / 2, 89, nm, 12, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
        cx += cw + 6
    cw_, chh, gap = 87, 94, 9
    gx = X0 + 10
    rows = [(124, 'YELLOW BELT  \u00b7  #6\u201310', 132), (240, 'ORANGE BELT  \u00b7  #11\u201315', 248)]
    for (ly, txt, cy_), r in zip(rows, range(2)):
        label(sc, gx, ly, txt, 11, INK_SOFT, 'lm', 'ExtraBold')
        tw_ = font(11, 'ExtraBold').getlength(txt) / K
        ImageDraw.Draw(sc.img).line([((gx + tw_ + 8) * K, ly * K), ((gx + 5 * cw_ + 4 * gap) * K, ly * K)], fill=(196, 156, 106), width=int(1.6 * K))
    for i, (n, st) in enumerate(GRID):
        r, c = divmod(i, 5)
        mini(sc, gx + c * (cw_ + gap), rows[r][2], cw_, chh, sd_card(n), st)


def screen_catalog():
    sc = Screen(844, 390)
    chrome(sc, 'abilities')
    catalog_tab(sc)
    return sc


# ------------------------------------------------------------------ sample a: one card, large (+ the other card kinds)
def kind_cards():
    strike = dict(fam='strike', game='Spin Kick', big='Kick Combo 1', belt='White Belt',
                  effect=[s for s in TEXTS['strikes'] if s['combo'] == 1][0]['text'], n=101,
                  short='Front kick, front kick, inside kick, outside kick, spinning outside kick.')
    kata = dict(fam='kata', game='Rooted Form', big='Basic Form 1', belt='White Belt', n=102,
                effect='Your first form.', short=None)
    return strike, kata


def sample_card():
    W, H = 844, 428
    sc = Screen(W, H)
    d3 = sd_card(3)
    d3['ribbon'] = 'COUNTER'
    d3['big'] = 'Self-Defense #3'
    card_front(sc, 42, 16, 250, d3)
    X = 330
    label(sc, X, 30, 'One card for every move you learn in class', 17, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    label(sc, X, 52, 'The dojo name is the big name. The game name sits under it.', 13, (232, 208, 168), 'lm', 'SemiBold', SHADOW_TXT)
    # states
    cw, ch = 100, 108
    states = [('Collected', 'collected', 6), ('New', 'new', 9), ('Locked', 'locked', 10)]
    for i, (cap, st, n) in enumerate(states):
        x = X + i * 124
        mini(sc, x, 78, cw, ch, sd_card(n), st)
        label(sc, x + cw / 2, 202, cap, 12.5, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    label(sc, X + 3 * 124 + 4, 126, 'Locked cards show the', 12, (232, 208, 168), 'lm', 'SemiBold', SHADOW_TXT)
    label(sc, X + 3 * 124 + 4, 143, 'belt you learn it at.', 12, (232, 208, 168), 'lm', 'SemiBold', SHADOW_TXT)
    # other kinds
    strike, kata = kind_cards()
    label(sc, X, 232, 'Kick Combos and Forms use the same card', 13.5, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    mini(sc, X, 248, cw, ch, strike, 'collected')
    mini(sc, X + 124, 248, cw, ch, kata, 'collected')
    label(sc, X + cw / 2, 372, 'Strike (gold rim)', 11.5, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    label(sc, X + 124 + cw / 2, 372, 'Form (wood rim)', 11.5, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    # rim colours
    rx = X + 3 * 124 + 4
    label(sc, rx, 262, 'Rim colour = family', 13.5, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    fams = ['counter', 'escape', 'guard', 'disarm', 'throw']
    for i, f in enumerate(fams):
        yy = 288 + i * 25
        put_medallion(sc, medallion_img(f, {'escape': 1, 'throw': 11}.get(f)), rx + 11, yy, 22, shadow=False)
        label(sc, rx + 30, yy, f.capitalize() + ('  (art soon)' if f not in DRAWN else ''), 12, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    return sc


# ------------------------------------------------------------------ sample c: card detail / flip, 844 x 390
def flip_arrow(sc, cx, cy):
    d = ImageDraw.Draw(sc.img, 'RGBA')
    r = 34
    for off, col in ((2, (50, 24, 8, 150)), (0, (255, 236, 190, 255))):
        bb = [(cx - r) * K, (cy - r * .8 + off) * K, (cx + r) * K, (cy + r * .8 + off) * K]
        d.arc(bb, 200, 335, fill=col, width=int(4 * K))
        ax, ay = cx + r * math.cos(math.radians(335)), cy + off + r * .8 * math.sin(math.radians(335))
        d.polygon([((ax - 9) * K, (ay - 5) * K), ((ax + 8) * K, (ay - 7) * K), ((ax + 3) * K, (ay + 9) * K)], fill=col)
    label(sc, cx, cy + 30, 'Tap to flip', 13, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)


def screen_detail():
    sc = screen_catalog()
    ov = Image.new('RGBA', sc.img.size, (28, 14, 6, 205))
    sc.img.alpha_composite(ov)
    d3 = sd_card(3)
    d3['ribbon'] = 'COUNTER'
    d3['big'] = 'Self-Defense #3'
    w = 214
    x0 = (844 - (2 * w + 96)) / 2
    card_front(sc, x0, 24, w, d3)
    dj3 = dojo_of(3)
    card_back(sc, x0 + w + 96, 24, w, d3, dj3['steps'], dj3['attack'], dj3['result'])
    flip_arrow(sc, x0 + w + 48, 168)
    # browse buttons + close
    for bx, left in ((48, True), (844 - 48 - 52, False)):
        put_piece(sc, ku.wood_button(52, 52), bx, 169)
        tri(sc, bx + 26, 195, 8, CREAM, left=left)
    label(sc, 74, 238, 'Defense #2', 12, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    label(sc, 844 - 74, 238, 'Defense #4', 12, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    sc.put(sized('sheet-close', 32, 32), 844 - 44, 10)
    return sc


# ------------------------------------------------------------------ sample d: long words and a not-written-yet card
def screen_text_test():
    sc = Screen(844, 390)
    label(sc, 22, 20, 'The game draws these words. Long moves, and a move that is not written yet', 15, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    w = 196
    s = w / 250.0
    y = 38
    gap = 20
    x0 = (844 - (4 * w + 3 * gap)) / 2
    strike, kata = kind_cards()
    strike['ribbon'], kata['ribbon'] = 'STRIKE', 'KATA'
    strike['big'], kata['big'] = 'Kick Combo 1', 'Basic Form 1'
    card_front(sc, x0, y, w, strike)
    card_front(sc, x0 + (w + gap), y, w, kata)
    for i, n in enumerate((6, 20)):
        d = sd_card(n) if n in RANK else dict(sd_card(6), game='(game name not set yet)', big='Defense #%d' % n, n=n, num=n)
        d['ribbon'] = RIM_NAME[d['fam']]
        d['big'] = 'Self-Defense #%d' % n
        dj = dojo_of(n)
        card_back(sc, x0 + (2 + i) * (w + gap), y, w, d, dj['steps'], dj['attack'], dj['result'])
    cap = ['Kick Combo: the list is the line', 'Form: PLACEHOLDER', '#6: five steps, the list scrolls', '#20: six steps, the list scrolls']
    for i, c in enumerate(cap):
        fit_label(sc, x0 + i * (w + gap) + w / 2, 372, c, 12, w + 10, CREAM, 'ExtraBold')
    return sc


if __name__ == '__main__':
    screen_card = sample_card()
    screen_card.save(os.path.join(PV, '01-move-card-large'))
    screen_catalog().save(os.path.join(PV, '02-catalog-grid-844x390'))
    screen_detail().save(os.path.join(PV, '03-card-detail-flip-844x390'))
    screen_text_test().save(os.path.join(PV, '04-long-words-and-placeholder-844x390'))
    print('ok')
