"""Real-size phone mocks (landscape 932x430 large, 667x375 small) for the A-MENU2 set, built only from the
exported @2x sprites (so the mocks show exactly what ships). Text is placeholder, drawn here, never in sprites.
Run after build_menu2.py:  python3 incoming-art/menu2/source/make_mocks.py"""
import json, os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.path.insert(0, os.path.dirname(__file__))
import mat

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ART = os.path.dirname(ROOT)
SP = os.path.join(ROOT, 'sprites')
PV = os.path.join(ROOT, 'preview')
MAN = json.load(open(os.path.join(SP, 'menu2.json')))['sprites']
FONT = '/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf'
K = 2  # mocks are composed at 2x
INK = (70, 42, 22)
INK_SOFT = (120, 86, 56)
CREAM = (255, 244, 220)
GREEN = (60, 160, 70)
GREYUP = (150, 140, 130)
BELTS = json.load(open(os.path.join(ART, 'player-character', 'sprites', 'player.json')))['beltStyles']


def font(sz, w='Bold'):
    f = ImageFont.truetype(FONT, int(sz * K))
    try:
        f.set_variation_by_name(w)
    except Exception:
        pass
    return f


_cache = {}


def spr(name):
    if name not in _cache:
        f = MAN[name]['file'].replace('.png', '@2x.png')
        _cache[name] = Image.open(os.path.join(SP, f)).convert('RGBA')
    return _cache[name]


def nine(im, w, h, m):
    """m = [top, right, bottom, left] in 1x px; im is @2x."""
    t, r, b, l = [v * K for v in m]
    W, H = im.size
    w, h = int(w), int(h)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    xs = [(0, l, 0, l), (l, W - r, l, w - r), (W - r, W, w - r, w)]
    ys = [(0, t, 0, t), (t, H - b, t, h - b), (H - b, H, h - b, h)]
    for sx0, sx1, dx0, dx1 in xs:
        for sy0, sy1, dy0, dy1 in ys:
            if sx1 <= sx0 or sy1 <= sy0 or dx1 <= dx0 or dy1 <= dy0:
                continue
            out.alpha_composite(im.crop((sx0, sy0, sx1, sy1)).resize((dx1 - dx0, dy1 - dy0), Image.LANCZOS), (dx0, dy0))
    return out


def tint(im, col):
    return mat.multiply(im, col)


def hexc(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def icon(path, size):
    im = Image.open(path).convert('RGBA')
    return im.resize((int(size * K), int(size * K)), Image.LANCZOS)


def ghost(im):
    """decided not-yet look: the whole icon as a faint warm sepia ghost at 30%."""
    g = im.convert('L').convert('RGBA')
    g = mat.multiply(g, (226, 196, 150))
    a = g.getchannel('A').point(lambda v: int(v * .30))
    a = Image.fromarray(np.minimum(np.asarray(a), np.asarray(im.getchannel('A')) * 0.30).astype(np.uint8))
    g.putalpha(a)
    return g


def player_sprite():
    im = Image.open(os.path.join(ART, 'player-character', 'preview', 'player_contact_idle.png')).convert('RGBA')
    c = im.crop((80, 1064, 336, 1320))   # S row, idle 1 (contact sheet cell, 2x of 128)
    m = Image.new('L', c.size, 0)
    rgb = np.asarray(c)[..., :3].astype(int)
    bg = np.array([47, 42, 61])
    diff = np.abs(rgb - bg).max(-1)
    a = np.clip((diff - 6) * 12, 0, 255).astype(np.uint8)
    # keep only the figure region connected to the centre (keying the flat sheet background)
    c.putalpha(Image.fromarray(a))
    bb = c.getbbox()
    return c.crop(bb)


class Mock:
    def __init__(self, w, h):
        self.w, self.h = w, h
        W, H = w * K, h * K
        # dojo wall: vertical planks, warm light from the top, gentle vignette
        wall = mat.wood(W, H, 5, (122, 78, 44), (86, 52, 28), (146, 98, 58), vertical=True, freq=0.35, contrast=0.7).convert('RGBA')
        d = ImageDraw.Draw(wall)
        pw = 58 * K
        for x in range(pw, W, pw):
            d.line([(x, 0), (x, H)], fill=(60, 34, 18, 150), width=K)
            d.line([(x + K, 0), (x + K, H)], fill=(190, 140, 90, 60), width=K)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        light = np.clip(1 - np.hypot((xx - W / 2) / W, (yy + H * .2) / H * 1.1) * 1.05, 0, 1)
        lm = Image.fromarray((light * 255).astype(np.uint8))
        lay = Image.new('RGBA', (W, H), (255, 210, 150, 0))
        lay.putalpha(lm.point(lambda v: int(v * .35)))
        wall.alpha_composite(lay)
        vg = np.clip((np.maximum(np.abs(xx / W - .5), np.abs(yy / H - .5)) * 2 - .55) / .45, 0, 1) ** 2
        lay = Image.new('RGBA', (W, H), (30, 14, 6, 0))
        lay.putalpha(Image.fromarray((vg * 150).astype(np.uint8)))
        wall.alpha_composite(lay)
        self.img = wall

    def put(self, name_or_img, x, y, w=None, h=None, alpha=1.0):
        im = spr(name_or_img) if isinstance(name_or_img, str) else name_or_img
        if w is not None and isinstance(name_or_img, str):
            m = MAN[name_or_img].get('nineSlice')
            if m and any(m):
                im = nine(im, w * K, (h or MAN[name_or_img]['size'][1]) * K, m)
            else:
                im = im.resize((int(w * K), int((h or w) * K)), Image.LANCZOS)
        if alpha < 1:
            im = im.copy()
            im.putalpha(im.getchannel('A').point(lambda v: int(v * alpha)))
        self.img.alpha_composite(im, (int(x * K), int(y * K)))

    def text(self, x, y, s, sz=12, col=INK, anchor='mm', w='Bold', shadow=None):
        d = ImageDraw.Draw(self.img)
        f = font(sz, w)
        if shadow:
            d.text((x * K, y * K + K), s, font=f, fill=shadow, anchor=anchor)
        d.text((x * K, y * K), s, font=f, fill=col, anchor=anchor)

    def save(self, name):
        os.makedirs(PV, exist_ok=True)
        self.img.save(os.path.join(PV, name + '@2x.png'))
        self.img.resize((self.w, self.h), Image.LANCZOS).save(os.path.join(PV, name + '.png'))


ICON = lambda n: os.path.join(ART, 'icons', 'sprites', f'icon-{n}.png')
DROP = lambda n: os.path.join(ART, 'gear-drop-icons', 'sprites', f'drop-{n}.png')


def topbar(M, which, small):
    tw = 240 if not small else 220
    x = (M.w - tw) / 2
    y = 8
    M.put('switch-track', x - 2, y - 2, tw + 4, 52)
    for i, side in enumerate(('left', 'right')):
        on = (which == 0 and i == 0) or (which == 1 and i == 1)
        st = 'on' if on else 'off'
        sx = x + i * tw / 2
        M.put(f'switch-{side}-{st}', sx, y + 2, tw / 2, 44)
        g = 'glyph-trophy' if i == 0 else 'glyph-swords'
        M.put(g, sx + 12 if i == 0 else sx + 12, y + 2 + 6, alpha=1 if on else .7)
        M.text(sx + 46, y + 2 + 20, 'Trophies' if i == 0 else 'My Style', 13 if not small else 12,
               INK if on else CREAM, 'lm', 'ExtraBold')


def belt_ribbon(M, x, y, w, n_earned, small):
    M.put(tint(spr('belt-cord'), (217, 180, 122)), 0, 0, alpha=0) if False else None
    cord = nine(tint(spr('belt-cord'), (217, 180, 122)), w * K, 40 * K, [0, 20, 0, 20])
    M.put(cord, x, y)
    names = [k for k in BELTS if k != 'note' and k not in ('Red', 'Red/Black')]  # red belts left out of the preview: red is reserved for danger in our art
    step = (w - 40) / (len(names) - 1)
    for i, nm in enumerate(names):
        st = BELTS[nm]
        kx, ky = x + i * step, y
        earned = i < n_earned
        layers = [spr('belt-knot-shadow'), tint(spr('belt-knot-band'), hexc(st['belt']))]
        if 'belt-center' in st:
            layers.append(tint(spr('belt-knot-center'), hexc(st['belt-center'])))
        sh = spr('belt-knot-sheen')
        if 'belt-sheen' in st:
            layers.append(tint(sh, hexc(st['belt-sheen'])))
        else:
            s2 = sh.copy(); s2.putalpha(sh.getchannel('A').point(lambda v: v // 4)); layers.append(s2)
        layers.append(tint(spr('belt-knot-rim'), hexc(st['belt-rim'])))
        for L in layers:
            M.put(L, kx, ky, alpha=1 if earned else .28)
        if i == n_earned - 1:
            M.put('cubby-seal', kx + 26, ky - 2)


def cubby_at(M, x, y, n, state, ic, name, small, lamp=False):
    sfx = '' if n == 112 else '-96'
    M.put(f'cubby-{state}{sfx}', x, y)
    im = icon(ICON(ic), 56 if n == 112 else 46)
    if state == 'notyet':
        if lamp:
            M.put(f'cubby-next-glow{sfx}', x, y)
        im = ghost(im)
    isz = 56 if n == 112 else 46
    M.put(im, x + (n - isz) / 2, y + n * 0.36 - isz / 2)
    M.text(x + n / 2, y + n * 0.79, name, 11 if n == 112 else 10, INK if state == 'earned' else INK_SOFT, 'mm', 'ExtraBold')
    if state == 'earned':
        M.put('cubby-seal', x + n - 30, y + 4)
    if lamp:
        M.put('cubby-lantern-0', x + n - 28, y - 8)


def arrow(M, x, y, up):
    d = ImageDraw.Draw(M.img)
    col = GREEN if up else GREYUP
    s = 1 if up else -1
    d.polygon([(x * K, (y - 6 * s) * K), ((x - 5) * K, (y - 1 * s) * K), ((x + 5) * K, (y - 1 * s) * K)], fill=col)
    d.rectangle([(x - 1.6) * K, min(y - 1 * s, y + 6 * s) * K, (x + 1.6) * K, max(y - 1 * s, y + 6 * s) * K], fill=col)


def dots(M, cx, y, n, cur):
    d = ImageDraw.Draw(M.img)
    for i in range(n):
        x = (cx + (i - (n - 1) / 2) * 14) * K
        r = (4 if i == cur else 3) * K
        d.ellipse([x - r, y * K - r, x + r, y * K + r], fill=(238, 182, 58) if i == cur else (200, 170, 130))


def trophy(small):
    W, H = (667, 375) if small else (932, 430)
    M = Mock(W, H)
    topbar(M, 0, small)
    px, py = 10, 62
    M.put('panel-frame', px, py, W - 20, H - py - 4)
    n = 96 if small else 112
    gap = 10 if small else 14
    x0 = px + 30
    belt_ribbon(M, x0, py + 22, (W - 20) - 60 - (0 if small else 0), 5, small)
    rows = [('Seals', [('off-balance', 'Off-balance', 'earned'), ('sweep', 'Sweep', 'earned'), ('throw', 'Throw', 'next'), ('disarm', 'Disarm', 'notyet')]),
            ('Insights', [('wind-step', 'Wind Step', 'earned'), ('rally', 'Rally', 'earned'), ('iron-skin', 'Iron Skin', 'earned'), ('quick-hands', 'Quick Hands', 'notyet')])]
    sy = py + 68 if not small else py + 58
    for r, (label, items) in enumerate(rows):
        yy = sy + r * (n + 24 if not small else n + 18)
        M.text(x0 + 4, yy - 2 if not small else yy - 1, label, 12 if not small else 11, INK_SOFT, 'lm', 'ExtraBold')
        M.put('shelf-plank', x0 - 8, yy + 6 + n - 6, 4 * n + 3 * gap + 16, 20)
        for i, (ic, name, st) in enumerate(items):
            cubby_at(M, x0 + i * (n + gap), yy + 6, n, 'notyet' if st == 'next' else st, ic, name, small, lamp=st == 'next')
        dots(M, x0 + (4 * n + 3 * gap) / 2, yy + 6 + n + 16, 3, 0) if False else None
    dots(M, x0 + (4 * n + 3 * gap) / 2, H - 31 if not small else H - 30, 3, 0)
    # detail sheet on the right (half height): the selected cubby
    dx = x0 + 4 * n + 3 * gap + (26 if not small else 18)
    dw = W - 20 - dx - 22
    dyy = sy + 4
    dh = (n + 6) * 2 + (24 if not small else 18) - 8
    M.put('panel-inset', dx, dyy, dw, dh)
    M.put('slot-card-selected', dx + (dw - 156) / 2, dyy + 6) if False else None
    big = 72 if not small else 56
    M.put(icon(ICON('sweep'), big), dx + (dw - big) / 2, dyy + 12)
    M.put('cubby-seal', dx + (dw + big) / 2 - 18, dyy + 12)
    M.text(dx + dw / 2, dyy + 12 + big + 20, 'Sweep', 16 if not small else 14, INK, 'mm', 'ExtraBold')
    M.text(dx + dw / 2, dyy + 12 + big + 40, 'Learned on floor 3', 11 if not small else 10, INK_SOFT, 'mm', 'Bold')
    M.put('unlock-sweep-5', dx + dw / 2 - 64, dyy + 12 + big / 2 - 64, alpha=.9)
    M.save(f'mock-trophies-{"small-667x375" if small else "large-932x430"}')


def style(small):
    W, H = (667, 375) if small else (932, 430)
    M = Mock(W, H)
    topbar(M, 1, small)
    px, py = 10, 62
    M.put('panel-frame', px, py, W - 20, H - py - 4)
    cards = [('Stance', 'wind-step', 'Wind Step', 'Move a little faster', 'selected'),
             ('Strike', 'double-strike', 'Double Strike', 'Hit twice', 'normal'),
             ('Seal', 'sweep', 'Sweep', 'Knock them over', 'normal')]
    cw = 156
    gap = 6 if small else 18
    total = 3 * cw + 2 * gap
    x0 = (W - total) / 2 if small else 40
    y0 = py + 16
    for i, (slot, ic, item, eff, st) in enumerate(cards):
        x = x0 + i * (cw + gap)
        M.put(f'slot-card-{st}', x, y0)
        if st == 'selected':
            M.put('slot-card-shine-2', x, y0)
        M.put(icon(ICON(ic), 56), x + 78 - 28, y0 + 52 - 28)
        M.text(x + 78, y0 + 92, slot.upper(), 9, INK_SOFT, 'mm', 'ExtraBold')
        M.text(x + 78, y0 + 109, item, 13, INK, 'mm', 'ExtraBold')
        M.text(x + 78, y0 + 125, eff, 10, INK_SOFT, 'mm', 'SemiBold')
    # tray
    ty = y0 + 148 + (10 if small else 18)
    tn = 6
    tw = tn * 78 + 16
    tx = x0 + (total - tw) / 2 if small else x0
    M.put('panel-inset', tx, ty, tw, 96)
    tray = ['wind-step', 'escape-step', 'iron-skin', 'quick-hands', 'rally', 'heavy-hands']
    for i, ic in enumerate(tray):
        st = 'equipped' if i == 0 else ('selected' if i == 2 else 'normal')
        x = tx + 8 + i * 78
        M.put(f'tray-tile-{st}', x - 3, ty + 6)
        M.put(icon(ICON(ic), 52), x - 3 + 16, ty + 6 + 16)
        if st == 'equipped':
            M.put('tray-equipped-badge', x - 3 + 62, ty + 6 + 2)
    if not small:
        # side detail for the picked tray tile
        dx = x0 + total + 26
        dw = W - 20 - dx - 22
        M.put('panel-inset', dx, y0, dw, 148 + 18 + 96)
        M.put(icon(ICON('iron-skin'), 72), dx + (dw - 72) / 2, y0 + 14)
        M.text(dx + dw / 2, y0 + 104, 'Iron Skin', 16, INK, 'mm', 'ExtraBold')
        M.text(dx + dw / 2, y0 + 124, 'Take a little less', 11, INK_SOFT, 'mm', 'Bold')
        M.text(dx + dw / 2, y0 + 140, 'from each hit', 11, INK_SOFT, 'mm', 'Bold')
        M.put('button-primary-normal', dx + (dw - 140) / 2, y0 + 190, 140, 52)
        M.text(dx + dw / 2, y0 + 214, 'Use this', 14, INK, 'mm', 'ExtraBold')
    M.save(f'mock-style-{"small-667x375" if small else "large-932x430"}')


def gear(small):
    W, H = (667, 375) if small else (932, 430)
    M = Mock(W, H)
    M.put('title-plaque', (W - 180) / 2, 10, 180, 40)
    M.text(W / 2, 28, 'Gear', 16, INK, 'mm', 'ExtraBold')
    px, py = 10, 58
    M.put('panel-frame', px, py, W - 20, H - py - 4)
    # paper-doll in the middle of the left area with 3 rings
    lx = 40 if not small else 32
    dy0 = py + 34 if not small else py + 28
    M.put('doll-backing', lx + 64, dy0)
    p = player_sprite()
    s = 0.75 * 128 / 256  # contact cell is 2x of a 128 frame
    pw, ph = int(p.width * s * K), int(p.height * s * K)
    M.put(p.resize((pw, ph), Image.LANCZOS), lx + 64 + 48 - pw / K / 2, dy0 + 113 - ph / K)
    rings = [('hands', 'cloth-wraps', 'common', 'normal'), ('gi', 'padded-gi', 'rare', 'glow'), ('charm', 'jade-charm', 'uncommon', 'normal')]
    pos = [(lx, dy0 + 2), (lx, dy0 + 70), (lx + 172, dy0 + 36)]
    for (slot, ic, rar, st), (rx, ry) in zip(rings, pos):
        M.put(f'gear-ring-{rar}{"" if st == "normal" else "-" + st}', rx, ry)
        M.put(icon(ICON(ic), 36), rx + 10, ry + 10)
    # Always with you
    ay = dy0 + 150
    M.text(lx + 4, ay, 'Always with you', 11, INK_SOFT, 'lm', 'ExtraBold')
    for i, ic in enumerate(['rally', 'sharp-eyes', 'strong-block'] if True else []):
        M.put(icon(ICON(ic), 44), lx + i * 52, ay + 10)
    # bag grid
    gx = lx + 250 if not small else lx + 240
    gw = W - 20 - gx - 20
    M.put('panel-inset', gx, py + 22, gw, H - py - 4 - 44)
    # filters
    filt = ['cloth-wraps', 'training-gi', 'lotus-charm']
    for i, ic in enumerate(filt):
        fx = gx + 12 + i * 52
        M.put('tray-tile-selected' if i == 0 else 'tray-tile-normal', fx - 4, py + 30, 52, 52)
        M.put(icon(ICON(ic), 30), fx + 7, py + 41)
    items = [('gi-rare', 'rare'), ('hands-uncommon', 'uncommon'), ('charm-epic', 'epic'), ('gi-common', 'common'), ('hands-rare', 'rare'), ('charm-common', 'common'), ('hands-epic', 'epic'), ('gi-uncommon', 'uncommon'), ('charm-rare', 'rare'), ('hands-common', 'common'), ('gi-epic', 'epic'), ('charm-uncommon', 'uncommon'), ('gi-rare', 'rare'), ('hands-rare', 'rare')]
    cols = max(1, int((gw - 20) // 80))
    rows = 2 if small else 3
    k = 0
    for r in range(rows - 1 if small else 2):
        for c in range(cols):
            if k >= len(items):
                break
            it, rar = items[k]
            bx, by = gx + 10 + c * 80, py + 88 + r * 98
            st = f'bag-tile-{rar}' if k != 0 else 'bag-tile-selected'
            M.put(st, bx, by)
            M.put(icon(DROP(it), 56), bx + 14, by + 12)
            M.text(bx + 42, by + 82, rar.capitalize(), 9, INK_SOFT, 'mm', 'ExtraBold')
            k += 1
    # compare + wear
    by = H - 4 - 26 - 52 if not small else H - 4 - 20 - 52
    if not small:
        M.text(gx + 16, by + 26, 'Guard  4', 13, INK, 'lm', 'ExtraBold')
        arrow(M, gx + 86, by + 26, True); M.text(gx + 94, by + 26, '2', 13, GREEN, 'lm', 'ExtraBold')
        M.text(gx + 130, by + 26, 'Speed  3', 13, INK, 'lm', 'ExtraBold')
        arrow(M, gx + 200, by + 26, False); M.text(gx + 208, by + 26, '1', 13, GREYUP, 'lm', 'ExtraBold')
    M.put('button-primary-normal', gx + gw - 150, by, 140, 52)
    M.text(gx + gw - 80, by + 24, 'Wear', 15, INK, 'mm', 'ExtraBold')
    M.save(f'mock-gear-{"small-667x375" if small else "large-932x430"}')


def lastrun(small):
    W, H = (667, 375) if small else (932, 430)
    M = Mock(W, H)
    M.put('title-plaque', (W - 200) / 2, 10, 200, 40)
    M.text(W / 2, 28, 'Last run', 16, INK, 'mm', 'ExtraBold')
    px, py = 10, 58
    M.put('panel-frame', px, py, W - 20, H - py - 4)
    x0, x1 = 36, W - 36
    n = 4
    gap = 10
    tw = (x1 - x0 - (n - 1) * gap) / n
    stats = [('perfect', '7'), ('combo', '12'), ('clock', '4:20'), ('xp', '+180')]
    y = py + 28
    for i, (k, v) in enumerate(stats):
        x = x0 + i * (tw + gap)
        M.put('stat-tile', x, y, tw, 64)
        M.put(f'stat-{k}', x + 14, y + 14)
        M.text(x + 56, y + 30, v, 20 if not small else 17, INK, 'lm', 'ExtraBold')
    y += 80
    M.put('xp-bar-frame', x0, y, x1 - x0, 20)
    fw = (x1 - x0 - 8) * 0.68
    f = nine(tint(spr('xp-bar-fill'), (242, 193, 78)), int(fw * K), 11 * K, [0, 6, 0, 6])
    M.put(f, x0 + 4, y + 4)
    M.put(nine(spr('xp-bar-gloss'), int(fw * K), 11 * K, [0, 6, 0, 6]), x0 + 4, y + 4)
    M.put('cubby-seal', x0 + 4 + fw - 12, y - 2)
    y += 34
    M.text(x0 + 2, y, 'Found', 12, INK_SOFT, 'lm', 'ExtraBold')
    finds = [('gi-rare', 'rare'), ('charm-uncommon', 'uncommon'), ('hands-common', 'common'), ('charm-epic', 'epic')]
    for i, (it, rar) in enumerate(finds):
        fx = x0 + i * 64
        M.put(f'found-tile-{rar}', fx, y + 12)
        M.put(icon(DROP(it), 40), fx + 10, y + 22)
    M.text(x0 + 2, y + 92, 'Always with you', 12, INK_SOFT, 'lm', 'ExtraBold')
    for i, ic in enumerate(['rally', 'sharp-eyes', 'strong-block']):
        M.put(icon(ICON(ic), 44), x0 + i * 54, y + 104)
    ax = x0 + 300 if not small else x0 + 280
    M.text(ax, y, 'New for you', 12, INK_SOFT, 'lm', 'ExtraBold')
    M.put('cubby-earned' if not small else 'cubby-earned-96', ax, y + 10, alpha=1) if False else None
    cubby_at(M, ax, y + 12, 96, 'earned', 'throw', 'Throw', small)
    M.put('unlock-sweep-5', ax + 48 - 64, y + 12 + 35 - 64)
    M.put('cubby-earned-shine-3', ax, y + 12, alpha=1) if False else None
    bw = 160
    M.put('button-primary-normal', x1 - bw, H - 4 - 22 - 52, bw, 52)
    M.text(x1 - bw / 2, H - 4 - 22 - 28, 'Again!', 15, INK, 'mm', 'ExtraBold')
    M.save(f'mock-lastrun-{"small-667x375" if small else "large-932x430"}')


def board(name, items, scale=3, bg=(92, 66, 48), label=None, pad=14):
    """close-up sheet: items = list of (img@2x or sprite name, caption)"""
    ims = []
    for it, cap in items:
        im = spr(it) if isinstance(it, str) else it
        im = im.resize((int(im.width * scale / K), int(im.height * scale / K)), Image.LANCZOS)
        ims.append((im, cap))
    W = sum(i.width for i, _ in ims) + pad * (len(ims) + 1)
    H = max(i.height for i, _ in ims) + pad * 2 + 30 + (34 if label else 0)
    out = Image.new('RGBA', (W, H), bg + (255,))
    d = ImageDraw.Draw(out)
    y0 = pad + (34 if label else 0)
    if label:
        d.text((pad, pad), label, font=ImageFont.truetype(FONT, 22), fill=CREAM)
    x = pad
    f = ImageFont.truetype(FONT, 18)
    for im, cap in ims:
        out.alpha_composite(im, (x, y0))
        d.text((x + im.width / 2, y0 + im.height + 16), cap, font=f, fill=CREAM, anchor='mm')
        x += im.width + pad
    out.save(os.path.join(PV, 'closeups', name + '.png'))


def stack(*layers):
    out = Image.new('RGBA', layers[0].size, (0, 0, 0, 0))
    for L in layers:
        if L.size != out.size:
            c = Image.new('RGBA', out.size, (0, 0, 0, 0)); c.alpha_composite(L[0], L[1]); L = c
        out.alpha_composite(L)
    return out


def at(im, size, xy):
    c = Image.new('RGBA', size, (0, 0, 0, 0)); c.alpha_composite(im, (int(xy[0] * K), int(xy[1] * K))); return c


def closeups():
    os.makedirs(os.path.join(PV, 'closeups'), exist_ok=True)
    def filled_cubby(state, ic, lamp=False):
        base = spr(f'cubby-{state}')
        sz = base.size
        L = [base]
        im = icon(ICON(ic), 56)
        if state.startswith('notyet'):
            if lamp:
                L.append(spr('cubby-next-glow'))
            im = ghost(im)
        L.append(at(im, sz, (28, 112 * .36 - 28 + (2 if 'pressed' in state else 0))))
        if state.startswith('earned'):
            L.append(at(spr('cubby-seal'), sz, (82, 4)))
        out = stack(*L)
        if lamp:
            big = Image.new('RGBA', (sz[0], sz[1] + 8 * K), (0, 0, 0, 0)); big.alpha_composite(out, (0, 8 * K))
            big.alpha_composite(spr('cubby-lantern-0'), (84 * K, 0)); out = big
        return out
    board('cubby-states', [(filled_cubby('earned', 'sweep'), 'earned'), (filled_cubby('earned-pressed', 'sweep'), 'earned pressed'),
                           (filled_cubby('notyet', 'throw', True), 'next (glow + lantern)'), (filled_cubby('notyet', 'disarm'), 'not yet'),
                           (filled_cubby('notyet-pressed', 'disarm'), 'not yet pressed')], label='A2 cubby states (3x)')
    def card(st, ic='wind-step'):
        base = spr(f'slot-card-{st}')
        return stack(base, at(icon(ICON(ic), 56), base.size, (50, 24 + (1.5 if st == 'pressed' else 0))))
    board('slot-card-states', [(card('normal'), 'normal'), (card('selected'), 'selected'), (card('pressed'), 'pressed')], label='A6 slot card (3x)')
    def tt(st, ic='iron-skin'):
        base = spr(f'tray-tile-{st}')
        L = [base, at(icon(ICON(ic), 52), base.size, (16, 16))]
        if st == 'equipped':
            L.append(at(spr('tray-equipped-badge'), base.size, (62, 2)))
        return stack(*L)
    board('tray-tile-states', [(tt(s), s) for s in ('normal', 'selected', 'equipped', 'pressed')], label='A7 tray tile (3x)')
    board('switch-states', [('switch-left-on', 'left on'), ('switch-left-off', 'left off'), ('switch-left-pressed', 'left pressed'),
                            ('switch-right-on', 'right on'), ('glyph-trophy', 'trophy'), ('glyph-swords', 'swords')], scale=2.5, label='A8 switch + glyphs (2.5x)')
    rings = []
    for rar in ('common', 'uncommon', 'rare', 'epic'):
        rings.append((stack(spr(f'gear-ring-{rar}'), at(icon(ICON('padded-gi'), 36), spr(f'gear-ring-{rar}').size, (10, 10))), rar))
    rings.append((spr('gear-ring-rare-glow'), 'glow (target)'))
    rings.append((spr('gear-ring-rare-pressed'), 'pressed'))
    board('gear-rings', rings, scale=3, label='A11 gear rings 56 (3x)')
    bags = [(stack(spr(f'bag-tile-{r}'), at(icon(DROP('gi-' + r), 56), spr(f'bag-tile-{r}').size, (14, 12))), r) for r in ('common', 'uncommon', 'rare', 'epic')]
    bags.append((spr('bag-tile-selected'), 'selected'))
    board('bag-tiles', bags, scale=2.5, label='A11 bag tiles 72 x 88 (2.5x)')
    knots = []
    for nm, st in BELTS.items():
        if nm in ('note', 'Red', 'Red/Black'):
            continue
        L = [spr('belt-knot-shadow'), tint(spr('belt-knot-band'), hexc(st['belt']))]
        if 'belt-center' in st:
            L.append(tint(spr('belt-knot-center'), hexc(st['belt-center'])))
        sh = spr('belt-knot-sheen')
        if 'belt-sheen' in st:
            L.append(tint(sh, hexc(st['belt-sheen'])))
        else:
            s2 = sh.copy(); s2.putalpha(sh.getchannel('A').point(lambda v: v // 4)); L.append(s2)
        L.append(tint(spr('belt-knot-rim'), hexc(st['belt-rim'])))
        knots.append((stack(*L), nm))
    board('belt-knots', knots, scale=3, label='A3 belt knots, tinted from beltStyles (3x; red belts tinted in game)')
    board('stats-button', [('stat-perfect', 'perfect'), ('stat-combo', 'combo'), ('stat-clock', 'clock'), ('stat-xp', 'xp'),
                           ('button-primary-normal', 'button'), ('button-primary-pressed', 'pressed'), ('button-primary-disabled', 'disabled')], scale=2.5, label='A10 stat icons + Wear button (2.5x)')
    board('anim-lantern-shine', [('cubby-lantern-0', 'lantern 0'), ('cubby-lantern-1', 'lantern 1')] +
          [(stack(spr('slot-card-selected'), spr(f'slot-card-shine-{i}')), f'shine {i}') for i in (1, 2, 3, 4)], scale=2, label='A9 lantern + optional shine frames (2x)')
    board('anim-unlock-sweep', [(stack(at(icon(ICON('throw'), 64), (256, 256), (32, 32)), spr(f'unlock-sweep-{i}')), f'{i}') for i in range(8)], scale=1.5, label='A13 unlock sweep, 8 frames (1.5x)')
    board('panel-doll', [('panel-frame', 'A1 panel 9-slice'), ('panel-inset', 'inset'), ('doll-backing', 'A12 backing'), ('seal-24' if False else 'cubby-seal', 'A4 seal')], scale=2, label='A1 / A12 / A4 (2x)')
    # before (v2 samples) vs after
    old = os.path.join(ART, 'menu2-samples', 'preview')
    nb = os.path.join(PV, 'before-v2')
    for nm in ('cubby-earned-next-notyet-3x', 'slot-card-normal-vs-selected-3x', 'phone-mock-large-932x430'):
        p = os.path.join(nb, nm + '.png')
        if os.path.exists(p):
            a = Image.open(p).convert('RGBA')
            after = {'cubby-earned-next-notyet-3x': 'closeups/cubby-states.png', 'slot-card-normal-vs-selected-3x': 'closeups/slot-card-states.png', 'phone-mock-large-932x430': 'mock-trophies-large-932x430.png'}[nm]
            b = Image.open(os.path.join(PV, after)).convert('RGBA')
            s = a.height / b.height
            if s < 1:
                b = b.resize((int(b.width * s), a.height), Image.LANCZOS)
            else:
                a = a.resize((int(a.width / s), b.height), Image.LANCZOS)
            out = Image.new('RGBA', (a.width + b.width + 30, a.height + 40), (40, 26, 18, 255))
            out.alpha_composite(a, (10, 30)); out.alpha_composite(b, (a.width + 20, 30))
            d = ImageDraw.Draw(out); f = ImageFont.truetype(FONT, 20)
            d.text((12, 4), 'before (v2 sample)', font=f, fill=CREAM); d.text((a.width + 22, 4), 'after (full set)', font=f, fill=CREAM)
            out.save(os.path.join(PV, 'closeups', f'before-after-{nm}.png'))


if __name__ == '__main__':
    for sm in (False, True):
        trophy(sm); style(sm); gear(sm); lastrun(sm)
    closeups()
    print('ok')
