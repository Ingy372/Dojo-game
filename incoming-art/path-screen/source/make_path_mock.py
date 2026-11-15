"""LP-A1: one Path screen layout mock (replaces Gate tab, Path card, goals card and Tower map).
Real-size phone mocks at 667x375 and 932x430 (plus @2x), built with the approved menu2 sprites and helpers.
Words are placeholders drawn here, never in sprites. Fixture = the Green-belt test student from the live
Gate tab (Gate to Blue: 3 of 7 locks lit, 15 of 24 classes, Sensei's Seal not lit).
Run from the repo root:  python3 incoming-art/path-screen/source/make_path_mock.py"""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ART = os.path.dirname(ROOT)
sys.path.insert(0, os.path.join(ART, 'menu2', 'source'))
import make_mocks as mm   # approved A-MENU2 helpers: Mock wall, nine-slice sprites, fonts, belt colours
import mat

mm.PV = os.path.join(ROOT, 'preview')
K = mm.K
INK, INK_SOFT, CREAM = mm.INK, mm.INK_SOFT, mm.CREAM
GOLD = (238, 182, 58)
LOCKED_INK = (92, 62, 38)   # locked labels: darker than INK_SOFT so they read on tan at 1x
GOLD_D = (176, 120, 30)
NIGHT = (58, 52, 84)
SEAL_FONT = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'
BELTS = mm.BELTS

FIX = dict(
    name='Kai M.', belt='Green', stripes=1, level=12, cap=40,
    next_belt='Blue', letters_lit=3,
    locks=[('David and Goliath', 'lit'), ('Defense #16', 'lit'), ('Defense #17', 'lit'), ('Defense #18', 'next'),
           ('Defense #19', 'locked'), ('Defense #20', 'locked'), ('Kick 4', 'locked')],
    classes=(15, 24), seal=False,
    real_step=('Show Sensei', 'Self-Defense #18', 'in class'), real_when='Next class: Monday',
    game_step='Reach level 13 in the Tower',
)
SHOW_FAITH = os.environ.get('SHOW_FAITH') == '1'   # LP-L1: FAITH DOES stays off the Path until L5 is approved
TIERS = ['White', 'Yellow', 'Orange', 'Green', 'Blue']  # coloured tiers drawn; higher tiers are plain grey shapes in the mist (no red in view)
FUTURE = 3


_PLAYER = None


def player():
    """menu2's player cut-out, with its belt layer recoloured to the fixture's rank (the game recolours the belt layer the same way)."""
    global _PLAYER
    if _PLAYER is None:
        im = mm.player_sprite()
        a = np.asarray(im).astype(np.float32) / 255
        rgb = a[..., :3]
        mx, mn = rgb.max(-1), rgb.min(-1)
        sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        hue = (np.degrees(np.arctan2(np.sqrt(3) * (g - b), 2 * r - g - b)) + 360) % 360
        belt = (hue > 36) & (hue < 64) & (sat > .45) & (a[..., 3] > .1)
        tgt = np.array(mm.hexc(BELTS[FIX['belt']]['belt'])) / 255
        shade = (mx / max(1e-6, np.percentile(mx[belt], 90)))[..., None] if belt.any() else 1
        new = np.clip(tgt * shade, 0, 1)
        rgb[belt] = new[belt]
        out = np.dstack([rgb, a[..., 3]])
        _PLAYER = Image.fromarray((out * 255).astype(np.uint8), 'RGBA')
    return _PLAYER


def S(v):
    return int(round(v * K))


def draw(M):
    return ImageDraw.Draw(M.img)


def soft_shadow(M, box, r, a=90, blur=6, dy=3):
    W, H = M.img.size
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).rounded_rectangle([S(box[0]), S(box[1] + dy), S(box[2]), S(box[3] + dy)], S(r), fill=(30, 14, 4, a))
    M.img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(S(blur))))


def glow(M, cx, cy, rad, col, a=160):
    W, H = M.img.size
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).ellipse([S(cx - rad), S(cy - rad), S(cx + rad), S(cy + rad)], fill=col + (a,))
    M.img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(S(rad * .45))))


# ---------------------------------------------------------------- top bar
def back_button(M, x, y):
    M.put('title-plaque', x, y, 92, 36)
    d = draw(M)
    d.polygon([(S(x + 22), S(y + 18)), (S(x + 31), S(y + 12.5)), (S(x + 31), S(y + 23.5))], fill=INK)
    M.text(x + 56, y + 18, 'Dojo', 13, INK, 'mm', 'ExtraBold')


def faith_banner(M, cx, y, small):
    """FAITH DOES across the top: nine places, one lit per promotion (L5 pieces; words wait on Jay's LP-C1 OK)."""
    t = 22 if small else 26
    gap = 3
    word_gap = 12
    letters = 'FAITHDOES'
    w = 9 * t + 7 * gap + word_gap + 28
    x = cx - w / 2
    M.put('title-plaque', x, y, w, t + 14)
    d = draw(M)
    xx = x + 14
    for i, ch in enumerate(letters):
        if i == 5:
            xx += word_gap - gap
        lit = i < FIX['letters_lit']
        box = [S(xx), S(y + 7), S(xx + t), S(y + 7 + t)]
        if lit:
            glow(M, xx + t / 2, y + 7 + t / 2, t * .55, (255, 214, 120), 120)
            d = draw(M)
            d.rounded_rectangle(box, S(5), fill=(255, 236, 186), outline=GOLD_D, width=S(1.5))
            M.text(xx + t / 2, y + 7 + t / 2 + .5, ch, t * .62, (150, 92, 18), 'mm', 'Black')
        else:
            d.rounded_rectangle(box, S(5), fill=(214, 184, 140), outline=(170, 128, 84), width=S(1))
            d.line([S(xx + t * .3), S(y + 7 + t * .72), S(xx + t * .7), S(y + 7 + t * .72)], fill=(170, 128, 84), width=S(1.5))
        xx += t + gap
    d = draw(M)


def player_chip(M, x, y, w, small):
    M.put('panel-inset', x, y, w, 40)
    p = player()
    s = 34 / p.height
    M.put(p.resize((S(p.width * s), S(34)), Image.LANCZOS), x + 6, y + 3)
    M.text(x + 34, y + 13, FIX['name'], 12 if small else 13, INK, 'lm', 'ExtraBold')
    st = BELTS[FIX['belt']]
    M.text(x + 34, y + 28, f"{FIX['belt']} Belt · {FIX['stripes']} stripe", 10 if small else 11, (40, 120, 60), 'lm', 'ExtraBold')


# ---------------------------------------------------------------- the Tower picture
def roof(d, cx, y, w, col, rim, lit):
    """one pagoda roof in the tier's belt colour, with an outline so it reads small."""
    h = 13
    pts = [(cx - w / 2 - 10, y + h), (cx - w / 2 + 4, y + 2), (cx + w / 2 - 4, y + 2), (cx + w / 2 + 10, y + h)]
    d.polygon([(S(a), S(b)) for a, b in pts], fill=col, outline=rim)
    d.line([(S(a), S(b)) for a, b in pts], fill=rim, width=S(1.6), joint='curve')
    # upturned eaves
    d.line([S(cx - w / 2 - 10), S(y + h), S(cx - w / 2 - 14), S(y + h - 4)], fill=rim, width=S(2))
    d.line([S(cx + w / 2 + 10), S(y + h), S(cx + w / 2 + 14), S(y + h - 4)], fill=rim, width=S(2))
    # ridge sheen
    d.line([S(cx - w / 2 + 6), S(y + 4), S(cx + w / 2 - 6), S(y + 4)], fill=tuple(min(255, c + 60) for c in col[:3]), width=S(1.2))


def tower(M, x, y, w, h, small):
    """A window onto the scrolling Tower: past tiers lit, current tier glowing with the student on it,
    next tier dim and waiting. Returns the anchor point (right edge of the current tier) for the Gate link."""
    W2, H2 = S(w), S(h)
    sky = Image.new('RGBA', (W2, H2))
    yy = np.linspace(0, 1, H2)[:, None]
    top, bot = np.array([132, 176, 226]), np.array([255, 224, 178])
    arr = (top * (1 - yy) + bot * yy)
    arr = np.repeat(arr[:, None, :], W2, 1).reshape(H2, W2, 3)
    sky = Image.fromarray(np.dstack([arr, np.full((H2, W2), 255)]).astype(np.uint8), 'RGBA')
    d = ImageDraw.Draw(sky)
    # soft clouds and far hills
    for cx, cy, r in [(.18, .16, .09), (.28, .14, .07), (.80, .30, .08), (.88, .28, .06)]:
        d.ellipse([S(w * cx - w * r * 1.6), S(h * cy - w * r * .55), S(w * cx + w * r * 1.6), S(h * cy + w * r * .55)], fill=(255, 255, 255, 170))
    if FIX['belt'] in ('White', 'Yellow'):
      d.polygon([(0, H2), (0, S(h * .86)), (S(w * .25), S(h * .80)), (S(w * .55), S(h * .88)), (S(w * .8), S(h * .82)), (W2, S(h * .87)), (W2, H2)], fill=(118, 170, 110, 255))
      d.rectangle([0, S(h * .93), W2, H2], fill=(96, 150, 92, 255))

    cur = TIERS.index(FIX['belt'])
    th = (h - 30) / 4.15          # tier height so ~4 tiers show
    bw = w * .54                  # tower body width
    cx = w * .5
    cur_i = TIERS.index(FIX['belt'])
    base = h * .95
    if cur_i >= 2:   # scrolled: keep the student's tier a little below the middle, the next tier above it
        base = h * .62 + (cur_i + .5) * th
    anchor = None
    for i, nm in enumerate(TIERS + ['?'] * FUTURE):
        ty = base - (i + 1) * th
        if ty + th < -th:
            break
        st = BELTS.get(nm, {'belt': '#b4aec4', 'belt-rim': '#6e6884'})
        col = mm.hexc(st['belt'])
        rim = mm.hexc(st['belt-rim'])
        if nm == 'White':
            col = (236, 236, 232)
        state = 'done' if i < cur else ('cur' if i == cur else ('next' if i == cur + 1 else 'far'))
        taper = 1 - i * .035
        bwi = bw * taper
        wall = (236, 214, 176) if state in ('done', 'cur') else (196, 186, 176)
        wall_d = (190, 158, 116) if state in ('done', 'cur') else (158, 150, 144)
        # body
        d.rectangle([S(cx - bwi / 2), S(ty + 10), S(cx + bwi / 2), S(ty + th)], fill=wall + (255,), outline=wall_d + (255,), width=S(1.5))
        for k in range(1, 4):
            d.line([S(cx - bwi / 2), S(ty + 10 + (th - 10) * k / 4), S(cx + bwi / 2), S(ty + 10 + (th - 10) * k / 4)], fill=wall_d + (90,), width=S(.8))
        # windows: lit warm where the light has come back, dark where it hasn't yet
        nwin = 3
        for k in range(nwin):
            wx = cx - bwi / 2 + bwi * (k + 1) / (nwin + 1)
            wy = ty + 10 + (th - 10) * .38
            ww, wh = bwi * .11, (th - 10) * .36
            wc = (255, 214, 110) if state in ('done', 'cur') else (92, 88, 110)
            d.rounded_rectangle([S(wx - ww / 2), S(wy), S(wx + ww / 2), S(wy + wh)], S(ww / 2), fill=wc + (255,), outline=(120, 80, 40, 255), width=S(1))
        # each tier wears its belt: a wash on the wall, a sash under the roof and a coloured floor band
        if state in ('cur', 'next'):
            wash = col if state == 'cur' else tuple(int(c * .8 + 190 * .2) for c in col)
            d.rectangle([S(cx - bwi / 2 + 1), S(ty + 11), S(cx + bwi / 2 - 1), S(ty + th - 1)], fill=wash + (52 if state == 'cur' else 105,))
        bc = col if state in ('done', 'cur') else (tuple(int(c * .8 + 190 * .2) for c in col) if state == 'next' else (176, 170, 186))
        rimc = rim if state != 'far' else (130, 124, 142)
        d.rectangle([S(cx - bwi / 2), S(ty + 11), S(cx + bwi / 2), S(ty + 17)], fill=bc + (255,), outline=rimc + (255,), width=S(1))
        d.rectangle([S(cx - bwi / 2 - 7), S(ty + th - 7), S(cx + bwi / 2 + 7), S(ty + th)], fill=bc + (255,), outline=rimc + (255,), width=S(1.2))
        rc = col if state in ('done', 'cur') else (tuple(int(c * .8 + 190 * .2) for c in col) if state == 'next' else tuple(int(c * .45 + 150 * .55) for c in col))
        roof(d, cx, ty - 3, bwi, rc + (255,), rim + (255,), state != 'next')
        if state == 'cur':
            anchor = (x + cx + bwi / 2 + 8, y + ty + th * .55)
            cur_y = ty
        if state == 'next':
            # the next tier waits in a soft mist with a little lock on its door
            d.rounded_rectangle([S(cx - 7), S(ty + th - 20), S(cx + 7), S(ty + th - 4)], S(3), fill=(110, 100, 130, 255))
    # gentle mist over the next tier and above
    mist = Image.new('RGBA', (W2, H2), (0, 0, 0, 0))
    md = ImageDraw.Draw(mist)
    ny = base - (cur + 2) * th
    md.rectangle([0, 0, W2, S(ny - th * .15)], fill=(236, 232, 248, 120))
    md.rectangle([0, S(ny - th * .15), W2, S(ny + th * .8)], fill=(236, 232, 248, 45))
    sky.alpha_composite(mist.filter(ImageFilter.GaussianBlur(S(10))))
    # glow behind the current tier
    g = Image.new('RGBA', (W2, H2), (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse([S(cx - bw * .9), S(cur_y - 6), S(cx + bw * .9), S(cur_y + th + 10)], fill=(255, 226, 140, 120))
    sky = Image.alpha_composite(g.filter(ImageFilter.GaussianBlur(S(12))), sky) if False else sky
    sky.alpha_composite(g.filter(ImageFilter.GaussianBlur(S(14))))
    # rounded window mask
    mask = Image.new('L', (W2, H2), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W2 - 1, H2 - 1], S(12), fill=255)
    sky.putalpha(Image.fromarray(np.minimum(np.asarray(sky.getchannel('A')), np.asarray(mask))))
    soft_shadow(M, (x, y, x + w, y + h), 12, 80, 5, 2)
    M.img.alpha_composite(sky, (S(x), S(y)))
    d2 = draw(M)
    d2.rounded_rectangle([S(x), S(y), S(x + w), S(y + h)], S(12), outline=(120, 78, 40), width=S(3))
    d2.rounded_rectangle([S(x + 3), S(y + 3), S(x + w - 3), S(y + h - 3)], S(10), outline=(236, 200, 140), width=S(1))
    # the student on the current tier's balcony
    p = player()
    ph = th * .78
    s = ph / p.height
    pw = p.width * s
    px = x + cx + bw * .30 - pw / 2
    py = y + cur_y + th - ph - 2
    glow(M, px + pw / 2, py + ph * .9, pw * .7, (255, 236, 160), 120)
    M.put(p.resize((S(pw), S(ph)), Image.LANCZOS), px, py)
    # "you are here" pin
    d2 = draw(M)
    pcx, pcy = px + pw / 2, py - 9
    d2.ellipse([S(pcx - 7), S(pcy - 7), S(pcx + 7), S(pcy + 7)], fill=GOLD, outline=(120, 70, 10), width=S(1.5))
    d2.polygon([(S(pcx - 4), S(pcy + 5)), (S(pcx + 4), S(pcy + 5)), (S(pcx), S(pcy + 11))], fill=(120, 70, 10))
    d2.ellipse([S(pcx - 3), S(pcy - 3), S(pcx + 3), S(pcy + 3)], fill=(255, 248, 220))
    # scroll hints: up for later tiers, down for cleared ones
    for up, yy_ in ((True, y + 12), (False, y + h - 12)):
        sgn = -1 if up else 1
        cx2 = x + w - 16
        d2.ellipse([S(cx2 - 9), S(yy_ - 9), S(cx2 + 9), S(yy_ + 9)], fill=(255, 244, 220, 230), outline=(140, 96, 52), width=S(1.2))
        d2.polygon([(S(cx2 - 4.5), S(yy_ - 2 * sgn)), (S(cx2 + 4.5), S(yy_ - 2 * sgn)), (S(cx2), S(yy_ + 3.5 * sgn))][::1], fill=INK) if not up else \
            d2.polygon([(S(cx2 - 4.5), S(yy_ + 2)), (S(cx2 + 4.5), S(yy_ + 2)), (S(cx2), S(yy_ - 3.5))], fill=INK)
    return anchor


# ---------------------------------------------------------------- the Gate (moved onto the Path)
def padlock(d, cx, cy, s, col):
    d.rounded_rectangle([S(cx - s * .45), S(cy - s * .05), S(cx + s * .45), S(cy + s * .55)], S(s * .12), fill=col)
    d.arc([S(cx - s * .3), S(cy - s * .5), S(cx + s * .3), S(cy + s * .15)], 180, 360, fill=col, width=S(s * .14))
    d.ellipse([S(cx - s * .08), S(cy + s * .14), S(cx + s * .08), S(cy + s * .30)], fill=(58, 52, 84))


def check(d, cx, cy, s, col):
    d.line([S(cx - s * .42), S(cy + s * .02), S(cx - s * .12), S(cy + s * .32), S(cx + s * .45), S(cy - s * .32)], fill=col, width=S(s * .2), joint='curve')


def lock_medallion(M, cx, cy, r, state):
    if state == 'lit':
        glow(M, cx, cy, r * 1.25, (255, 214, 110), 120)
        d = draw(M)
        d.ellipse([S(cx - r), S(cy - r), S(cx + r), S(cy + r)], fill=(255, 220, 120), outline=GOLD_D, width=S(2))
        d.ellipse([S(cx - r + 3), S(cy - r + 3), S(cx + r - 3), S(cy + r - 3)], outline=(255, 244, 200), width=S(1.2))
        check(d, cx, cy, r * .85, (110, 66, 14))
    elif state == 'next':
        glow(M, cx, cy, r * 1.45, (255, 236, 170), 150)
        d = draw(M)
        d.ellipse([S(cx - r), S(cy - r), S(cx + r), S(cy + r)], fill=(255, 246, 226), outline=GOLD, width=S(2.6))
        padlock(d, cx, cy, r * .85, (176, 128, 66))
    else:
        d = draw(M)
        d.ellipse([S(cx - r), S(cy - r), S(cx + r), S(cy + r)], fill=(226, 206, 172), outline=(170, 132, 90), width=S(1.6))
        padlock(d, cx, cy, r * .8, (160, 128, 96))


def wrap2(label, maxw=None, f=None):
    parts = label.split(' ')
    if maxw and f:   # greedy by real width: as many lines as needed (David / and / Goliath)
        lines, cur = [], ''
        for w_ in parts:
            t = (cur + ' ' + w_).strip()
            if cur and f.getlength(t) > maxw:
                lines.append(cur); cur = w_
            else:
                cur = t
        return lines + [cur]
    if len(parts) == 1 or len(label) <= 7:
        return [label]
    best = min(range(1, len(parts)), key=lambda i: abs(len(' '.join(parts[:i])) - len(' '.join(parts[i:]))))
    return [' '.join(parts[:best]), ' '.join(parts[best:])]


def gate(M, x, y, w, h, small):
    M.put('panel-inset', x, y, w, h)
    lit = sum(1 for _, s in FIX['locks'] if s == 'lit')
    M.text(x + 14, y + 16, f"The Gate to {FIX['next_belt']} Belt", 14 if small else 16, INK, 'lm', 'ExtraBold')
    M.text(x + w - 14, y + 16, f"{lit} of {len(FIX['locks'])} lit", 12 if small else 13, INK, 'rm', 'ExtraBold')
    n = len(FIX['locks'])
    side = 100 if small else 124   # room on the right for the sundial and Sensei's Seal
    lw = w - 24 - side
    step = lw / n
    r = min(15 if small else 18, step * .36)
    cy = y + 44 if small else y + 52
    fs = 11 if small else 12
    lf = ImageFont.truetype(mm.FONT, fs); lf.set_variation_by_name('ExtraBold')
    # runs of numbered locks from one set ("Defense #16".."#20") show just the number,
    # with the set's name once on a bracket underneath, so labels never touch at 1x
    import re
    groups, cur = [], None
    for i, (label, _) in enumerate(FIX['locks']):
        m_ = re.match(r'^(.*) (#\d+)$', label)
        key = m_.group(1) if m_ else None
        if key and cur and cur[0] == key:
            cur[2] = i
        else:
            cur = [key, i, i]; groups.append(cur)
    grp_of = {}
    for key, a, b in groups:
        for i in range(a, b + 1):
            grp_of[i] = (key, a, b) if key and b > a else None
    for i, (label, st) in enumerate(FIX['locks']):
        cx = x + 12 + step * (i + .5)
        lock_medallion(M, cx, cy, r, st)
        g_ = grp_of.get(i)
        lines = [label.rsplit(' ', 1)[1]] if g_ else wrap2(label, step - 3, lf)
        for j, line in enumerate(lines):
            M.text(cx, cy + r + 10 + j * 12.5, line, fs, INK if st != 'locked' else LOCKED_INK, 'mm', 'ExtraBold')
    d0 = draw(M)
    for key, a, b in groups:
        if not key or b == a:
            continue
        x0 = x + 12 + step * (a + .5) - step * .38
        x1 = x + 12 + step * (b + .5) + step * .38
        by_ = cy + r + 21
        d0.line([S(x0), S(by_ - 3), S(x0), S(by_), S(x1), S(by_), S(x1), S(by_ - 3)], fill=(176, 136, 88), width=S(1.2))
        tw_ = lf.getlength(key) + 12
        xm = (x0 + x1) / 2
        M.text(xm, by_ + 9, key, fs, INK, 'mm', 'ExtraBold')
    for i, (label, st) in enumerate(FIX['locks']):
        cx = x + 12 + step * (i + .5)
        if st == 'next':
            M.put('cubby-lantern-0', cx + r - 6, cy - r - 14)
    # divider
    d = draw(M)
    dx = x + 12 + lw + 4
    d.line([S(dx), S(y + 32), S(dx), S(y + h - 10)], fill=(200, 168, 124), width=S(1))
    # sundial (classes) and Sensei's Seal, side by side
    sx = dx + side / 4 + 2
    rr = r
    done, need = FIX['classes']
    d.ellipse([S(sx - rr), S(cy - rr), S(sx + rr), S(cy + rr)], fill=(244, 230, 204), outline=(150, 112, 70), width=S(1.6))
    d.pieslice([S(sx - rr + 2), S(cy - rr + 2), S(sx + rr - 2), S(cy + rr - 2)], -90, -90 + 360 * done / need, fill=GOLD)
    d.ellipse([S(sx - 2), S(cy - 2), S(sx + 2), S(cy + 2)], fill=(120, 80, 40))
    M.text(sx, cy + rr + 10, 'Classes', 11 if small else 12, INK, 'mm', 'ExtraBold')
    M.text(sx, cy + rr + 22.5, f'{done} of {need}', 11 if small else 12, INK, 'mm', 'ExtraBold')
    ex = dx + side * 3 / 4 - 2
    d.ellipse([S(ex - rr), S(cy - rr), S(ex + rr), S(cy + rr)], fill=(226, 206, 172), outline=(170, 132, 90), width=S(1.6))
    f = ImageFont.truetype(SEAL_FONT, S(rr * 1.05))
    d.text((S(ex), S(cy + .5)), '師', font=f, fill=(170, 132, 96), anchor='mm')
    M.text(ex, cy + rr + 10, "Sensei's", 11 if small else 12, LOCKED_INK, 'mm', 'ExtraBold')
    M.text(ex, cy + rr + 22.5, 'Seal', 11 if small else 12, LOCKED_INK, 'mm', 'ExtraBold')
    return (x, cy)


# ---------------------------------------------------------------- next steps
def real_step(M, x, y, w, h, small):
    """the next REAL step: the biggest, warmest card on the screen. Its icon is the same glowing lock as on the Gate."""
    glow(M, x + w / 2, y + h / 2, max(w, h) * .42, (255, 210, 120), 80)
    M.put('cubby-earned', x, y, w, h)
    pad = 26
    M.text(x + pad, y + pad + 4, 'YOUR NEXT CLASS STEP', 10 if small else 11, (164, 104, 16), 'lm', 'Black')
    a, b, c = FIX['real_step']
    r = 15 if small else 21
    ix, iy = x + pad + r, y + h / 2 + (2 if small else 4)
    lock_medallion(M, ix, iy, r, 'next')
    tx = ix + r + (12 if small else 16)
    M.text(tx, iy - (17 if small else 21), a, 12 if small else 13, INK_SOFT, 'lm', 'ExtraBold')
    M.text(tx, iy + 1, b, 16 if small else 22, INK, 'lm', 'Black')
    M.text(tx, iy + (19 if small else 23), c, 12 if small else 13, INK_SOFT, 'lm', 'ExtraBold')
    M.text(x + pad, y + h - pad - 2, FIX['real_when'], 11 if small else 12, (52, 124, 64), 'lm', 'ExtraBold')


def game_step(M, x, y, w, h, small):
    M.put('panel-inset', x, y, w, h)
    M.text(x + 14, y + 18, 'NEXT IN THE GAME', 9.5 if small else 10.5, INK_SOFT, 'lm', 'Black')
    isz = 26 if small else 30
    mini_tower(M, x + 12, y + (30 if small else 28), isz)
    tx = x + 12 + isz + 8
    g = FIX['game_step'].split(' in the ')
    if small:   # two short lines on the small phone
        M.text(tx, y + 36, g[0], 12, INK, 'lm', 'ExtraBold')
        M.text(tx, y + 51, 'in the ' + g[1], 12, INK, 'lm', 'ExtraBold')
    else:
        M.text(tx, y + 36, g[0], 13, INK, 'lm', 'ExtraBold')
        M.text(tx, y + 52, 'in the ' + g[1], 13, INK, 'lm', 'ExtraBold')
    # level bar (menu2 xp bar)
    bw = w - 28
    by = y + 62 if small else y + 68
    M.put('xp-bar-frame', x + 14, by, bw, 20)
    frac = .62
    fw = max(16, (bw - 8) * frac)
    M.put(mm.nine(mm.tint(mm.spr('xp-bar-fill'), (242, 193, 78)), S(fw), S(11), [0, 6, 0, 6]), x + 18, by + 4)
    M.put(mm.nine(mm.spr('xp-bar-gloss'), S(fw), S(11), [0, 6, 0, 6]), x + 18, by + 4)
    M.text(x + 14, by + 30, f"Level {FIX['level']}", 11 if small else 12, INK, 'lm', 'ExtraBold')
    bh = 40 if small else 46
    bwid = w - 28
    M.put('button-primary-normal', x + 14, y + h - bh - 10, bwid, bh)
    M.text(x + 14 + bwid / 2, y + h - bh / 2 - 10 - 1, 'Enter the Tower', 14 if small else 16, INK, 'mm', 'Black')


def link(M, a, b):
    """dotted gold path from the student's tier to the Gate: the Gate sits beside the current tier."""
    d = draw(M)
    (x0, y0), (x1, y1) = a, b
    n = int(math.hypot(x1 - x0, y1 - y0) / 7)
    for i in range(n + 1):
        t = i / max(1, n)
        xx = x0 + (x1 - x0) * t
        yy = y0 + (y1 - y0) * t - math.sin(t * math.pi) * 8
        d.ellipse([S(xx - 1.8), S(yy - 1.8), S(xx + 1.8), S(yy + 1.8)], fill=GOLD, outline=(140, 90, 20), width=S(.6))


def mini_tower(M, x, y, s):
    """picture before text: a tiny Tower glyph for the game step."""
    d = draw(M)
    for i, col in enumerate([(236, 236, 232), (240, 196, 60), (238, 140, 50)]):
        ty = y + s - (i + 1) * s / 3.2
        bw = s * (.62 - i * .08)
        cx = x + s / 2
        d.rectangle([S(cx - bw / 2), S(ty + 3), S(cx + bw / 2), S(ty + s / 3.2)], fill=(236, 214, 176), outline=(150, 110, 70), width=S(1))
        d.polygon([(S(cx - bw / 2 - 4), S(ty + 5)), (S(cx), S(ty - 1)), (S(cx + bw / 2 + 4), S(ty + 5))], fill=col, outline=(110, 74, 40))


def intro_card(M, W, H, card, small):
    """LP-L1: one intro card, existing players only, first visit. Dims everything but the next class step."""
    x0, y0, x1, y1 = card
    Wd, Hd = M.img.size
    scrim = Image.new('RGBA', (Wd, Hd), (24, 14, 8, 165))
    hole = Image.new('L', (Wd, Hd), 255)
    ImageDraw.Draw(hole).rounded_rectangle([S(x0 - 6), S(y0 - 6), S(x1 + 6), S(y1 + 6)], S(16), fill=0)
    hole = hole.filter(ImageFilter.GaussianBlur(S(4)))
    scrim.putalpha(Image.fromarray((np.asarray(hole).astype(np.float32) / 255 * 165).astype(np.uint8)))
    M.img.alpha_composite(scrim)
    d = draw(M)
    d.rounded_rectangle([S(x0 - 5), S(y0 - 5), S(x1 + 5), S(y1 + 5)], S(15), outline=(255, 226, 140), width=S(3))
    # the card sits just above the class step (over the dimmed Gate), pointing down at it
    cw, chh = (230, 96) if small else (260, 104)
    cx, cyy = (x0 + x1) / 2 - cw / 2, y0 - chh - 18
    soft_shadow(M, (cx, cyy, cx + cw, cyy + chh), 14, 120, 8, 4)
    M.put('panel-inset', cx, cyy, cw, chh)
    d = draw(M)
    ax = cx + cw / 2
    d.polygon([(S(ax - 11), S(cyy + chh - 2)), (S(ax), S(cyy + chh + 14)), (S(ax + 11), S(cyy + chh - 2))], fill=(250, 236, 208), outline=(170, 128, 84))
    M.text(cx + 18, cyy + 30, 'This is your Path.', 15 if small else 16, INK, 'lm', 'Black')
    M.text(cx + 18, cyy + 54, 'Your next step is here.', 12 if small else 13, INK_SOFT, 'lm', 'ExtraBold')
    M.put('button-primary-normal', cx + cw - 76, cyy + chh - 42, 62, 32)
    M.text(cx + cw - 45, cyy + chh - 26.5, 'OK', 14, INK, 'mm', 'Black')


def path_screen(small, intro=False):
    W, H = (667, 375) if small else (932, 430)
    M = mm.Mock(W, H)
    back_button(M, 12, 10)
    if SHOW_FAITH:
        faith_banner(M, W / 2, 6 if small else 7, small)
    else:
        M.put('title-plaque', W / 2 - 70, 8, 140, 38)
        M.text(W / 2, 27, 'My Path', 16, INK, 'mm', 'Black')
    chip_w = 150 if small else 170
    player_chip(M, W - chip_w - 12, 8, chip_w, small)
    px, py = 8, 54
    M.put('panel-frame', px, py, W - 16, H - py - 4)
    ix, iy = px + 22, py + 20
    iw, ih = W - 16 - 44, H - py - 4 - 40
    tw = int(iw * (.23 if small else .28))
    a = tower(M, ix, iy, tw, ih, small)
    rx = ix + tw + (16 if small else 24)
    rw = ix + iw - rx
    gh = 120 if small else 134
    b = gate(M, rx, iy, rw, gh, small)
    link(M, a, (b[0] + 4, iy + gh * .55))
    cy = iy + gh + (10 if small else 12)
    ch = iy + ih - cy
    rsw = int(rw * (.58 if small else .56))
    real_step(M, rx, cy, rsw, ch, small)
    game_step(M, rx + rsw + 10, cy, rw - rsw - 10, ch, small)
    if intro:
        intro_card(M, W, H, (rx, cy, rx + rsw, cy + ch), small)
    name = f'path-screen-{"intro-" if intro else ""}{"small-667x375" if small else "large-932x430"}'
    M.save(name)
    return name


if __name__ == '__main__':
    for sm in (True, False):
        print(path_screen(sm))
        print(path_screen(sm, intro=True))


def key_and_compare():
    """review sheets: a numbered key over the large mock, and the old Gate tab beside the new Path screen."""
    big = Image.open(os.path.join(mm.PV, 'path-screen-large-932x430@2x.png')).convert('RGBA')
    k = big.copy()
    d = ImageDraw.Draw(k)
    f = ImageFont.truetype(mm.FONT, 30)
    f.set_variation_by_name('Black')
    for n, (x, y) in enumerate([(768, 54), (50, 135), (630, 150), (630, 430), (1298, 430)], 1):
        d.ellipse([x - 22, y - 22, x + 22, y + 22], fill=(58, 52, 84), outline=(255, 236, 186), width=4)
        d.text((x, y), str(n), font=f, fill=(255, 236, 186), anchor='mm')
    k.save(os.path.join(mm.PV, 'key-numbered-932x430@2x.png'))
    old = os.environ.get('OLD_GATE')
    if old and os.path.exists(old):
        o = Image.open(old).convert('RGBA')
        o = o.resize((int(o.width * big.height / o.height), big.height), Image.LANCZOS)
        sheet = Image.new('RGBA', (o.width + big.width + 60, big.height + 70), (40, 30, 24, 255))
        sd = ImageDraw.Draw(sheet)
        f2 = ImageFont.truetype(mm.FONT, 28); f2.set_variation_by_name('ExtraBold')
        sd.text((20, 35), 'Before: Training Board, Gate tab (live game)', font=f2, fill=(255, 236, 186), anchor='lm')
        sd.text((o.width + 40, 35), 'After: one Path screen (mock)', font=f2, fill=(255, 236, 186), anchor='lm')
        sheet.alpha_composite(o, (20, 60)); sheet.alpha_composite(big, (o.width + 40, 60))
        sheet.save(os.path.join(mm.PV, 'before-after-gate-tab.png'))


if __name__ == '__main__':
    key_and_compare()
