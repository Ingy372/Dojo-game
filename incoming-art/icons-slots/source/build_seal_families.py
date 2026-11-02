"""PB-07 samples (Seal family medallions, Lock, slot glyphs, Jumping Spins). Three images, all drawn by script:
  python3 incoming-art/icons-slots/source/build_seal_families.py
Needs only Pillow + numpy, plus incoming-art/tools/board_ui_kit.py (the warm Board look, PR #412).
Icons are drawn in seal_icons.py (a small toon kit in toon.py). No text lives inside the art pieces.
All words in the mocks are placeholders."""
import os, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(os.path.dirname(ROOT), 'tools'))
import board_ui_kit as ku
from board_ui_kit import K, M, Screen, font, INK, INK_SOFT, CREAM
import mat
import seal_icons as si

PV = os.path.join(ROOT, 'preview')
os.makedirs(PV, exist_ok=True)
SHADOW_TXT = (60, 32, 14)
_cache = {}


def padded(name, px):
    """the icon in a px x px transparent square with the spec's 8 px (at 128) margin kept clear."""
    inner = int(round(px * 112 / 128))
    im = si.ALL[name]().resize((inner, inner), Image.LANCZOS)
    out = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    out.alpha_composite(im, ((px - inner) // 2, (px - inner) // 2))
    return out


def icon(name, pts):
    """the icon at pts phone points (@2x pixels = pts * 2); same padding as the 128 px sprite files."""
    key = (name, pts)
    if key not in _cache:
        _cache[key] = padded(name, int(round(pts * K)))
    return _cache[key]


def label(sc, x, y, s, sz, col=INK, anchor='mm', w='ExtraBold', shadow=None):
    sc.text(x, y, s, sz, col, anchor, w, shadow)


def put_icon(sc, name, cx, cy, pts, grey=False):
    im = icon(name, pts)
    if grey:
        g = im.convert('LA').convert('RGBA')
        g.putalpha(im.getchannel('A'))
        im = g
    sc.img.alpha_composite(im, (int(round((cx - pts / 2) * K)), int(round((cy - pts / 2) * K))))


def card(sc, x, y, w, h):
    sc.put(ku.paper_card(w, h), x - M, y - M)


def shadow(sc, cx, cy, w):
    sh = ku.shadow_oval(w, w * .12, .35)
    sc.img.alpha_composite(sh, (int(cx * K - sh.width / 2), int(cy * K - sh.height / 2)))


def real_size_row(sc, names, x0, y, on_wall_x=None, sizes=(64, 48, 32), gap=14):
    """each icon at 64 pt (= the 128 px file at @2x), 48 pt and 32 pt: the sizes the phone will really show."""
    x = x0
    for n in names:
        for s in sizes:
            put_icon(sc, n, x + s / 2, y, s)
            x += s + gap
        x += 14
    return x


# ============ sample 1: three family medallions ============
def sample_families():
    W, H = 844, 560
    sc = Screen(W, H)
    label(sc, 24, 26, 'Seal families', 18, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    label(sc, W - 24, 26, 'Counter \u00b7 Guard \u00b7 Disarm (Escape and Throw pictures come next)', 12, CREAM, 'rm', 'Bold', SHADOW_TXT)
    card(sc, 20, 46, W - 40, 262)
    label(sc, 36, 66, 'LARGE', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    fam = [('counter', 'Counter', 'Turn their move against them'),
           ('guard', 'Guard', 'Block and stay safe'),
           ('disarm', 'Disarm', 'Kick the stick away')]
    cw = (W - 40) / 3
    for i, (k, nm, kid) in enumerate(fam):
        cx = 20 + cw * (i + .5)
        shadow(sc, cx, 246, 150)
        put_icon(sc, k, cx, 160, 184)
        label(sc, cx, 268, nm, 17, INK, 'mm', 'ExtraBold')
        label(sc, cx, 288, kid, 12, INK_SOFT, 'mm', 'SemiBold')
    # real size
    card(sc, 20, 322, 420, 106)
    label(sc, 36, 340, 'REAL SIZE ON PAPER  (64 and 40 pt)', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    x = 40
    for k, _, _ in fam:
        for s in (64, 40):
            put_icon(sc, k, x + s / 2, 392, s)
            x += s + 8
        x += 12

    # on wall
    label(sc, 456, 340, 'ON THE WALL', 11, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    x = 456
    for k, _, _ in fam:
        for s in (64, 40):
            put_icon(sc, k, x + s / 2, 392, s)
            x += s + 8
        x += 12
    # greyscale and phone-size check
    card(sc, 20, 442, 420, 106)
    label(sc, 36, 460, 'IN GREY: the symbol alone still reads', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    x = 40
    for k, _, _ in fam:
        for s in (64, 40):
            put_icon(sc, k, x + s / 2, 508, s, grey=True)
            x += s + 8
        x += 18
    label(sc, 456, 460, 'RIM COLOUR = FAMILY', 11, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    rims = [('counter', 'blue'), ('guard', 'green'), ('escape', 'green-teal'), ('disarm', 'purple'), ('throw', 'rose'), ('lock', 'grey')]
    for i, (k, nm) in enumerate(rims):
        col = si.RIMS[k]
        cx = 478 + (i // 3) * 190
        cy = 486 + (i % 3) * 28
        d = ImageDraw.Draw(sc.img)
        d.ellipse([(cx - 11) * K, (cy - 11) * K, (cx + 11) * K, (cy + 11) * K], fill=(*col, 255), outline=(*INK, 255), width=2 * K)
        d.ellipse([(cx - 5) * K, (cy - 5) * K, (cx + 5) * K, (cy + 5) * K], fill=(*CREAM, 255), outline=(*INK, 255), width=1 * K)
        label(sc, cx + 20, cy, '%s: %s%s' % (k.capitalize(), nm, ' (art next)' if k in ('escape', 'throw') else ''), 12, CREAM, 'lm', 'Bold', SHADOW_TXT)
    sc.save(os.path.join(PV, '01-family-medallions'))


# ============ sample 2: the Lock and the slot glyphs ============
def sample_slots():
    W, H = 844, 590
    sc = Screen(W, H)
    label(sc, 24, 26, 'Lock silhouette and slot glyphs', 18, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    label(sc, W - 24, 26, 'Strike \u00b7 Kata \u00b7 empty Seal slot \u00b7 locked family', 12, CREAM, 'rm', 'Bold', SHADOW_TXT)
    card(sc, 20, 46, W - 40, 236)
    label(sc, 36, 66, 'LARGE', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    items = [('lock', 'Lock', 'Coming later'), ('strike', 'Strike slot', 'Your kick'), ('kata', 'Kata slot', 'Your form'), ('empty-slot', 'Empty Seal slot', 'Tap to pick')]
    cw = (W - 40) / 4
    for i, (k, nm, kid) in enumerate(items):
        cx = 20 + cw * (i + .5)
        shadow(sc, cx, 222, 110)
        put_icon(sc, k, cx, 140, 146)
        label(sc, cx, 240, nm, 16, INK, 'mm', 'ExtraBold')
        label(sc, cx, 260, kid, 12, INK_SOFT, 'mm', 'SemiBold')
    # the slot row, as the Fighting Style screen would show it
    card(sc, 20, 296, W - 40, 176)
    label(sc, 36, 316, 'IN A SLOT ROW  (Stance and Virtue keep their current icons)', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    slots = [('jumping-spins', 'Strike', 1.0), ('kata', 'Kata', 1.0), ('counter', 'Seal 1', 1.0), ('empty-slot', 'Seal 2', 1.0), ('lock', 'Seal 3', .8)]
    sw = (W - 80) / 5
    for i, (k, nm, al) in enumerate(slots):
        cx = 40 + sw * (i + .5)
        sc.put(ku.paper_card(int(sw - 14), 126, r=10, border=True, seed=40 + i), cx - (sw - 14) / 2 - M, 336 - M)
        put_icon(sc, k, cx, 382, 64)
        label(sc, cx, 428, nm, 14, INK, 'mm', 'ExtraBold')
        sub = {'jumping-spins': 'Jumping Spins', 'kata': 'Power coming soon', 'counter': 'Counter', 'empty-slot': 'Pick a Seal', 'lock': 'Orange belt'}[k]
        label(sc, cx, 448, sub, 12, INK_SOFT, 'mm', 'SemiBold')
    # real size + grey
    card(sc, 20, 486, W - 40, 84)
    label(sc, 36, 506, 'REAL SIZE  (48, 32 pt)', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    x = 36
    for k, _, _ in items:
        for s in (48, 32):
            put_icon(sc, k, x + s / 2, 540, s)
            x += s + 8
        x += 10
    label(sc, 470, 506, 'IN GREY', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    x = 470
    for k, _, _ in items:
        put_icon(sc, k, x + 20, 540, 40, grey=True)
        x += 52
    sc.save(os.path.join(PV, '02-lock-and-slot-glyphs'))


# ============ sample 3: Jumping Spins ============
def sample_spins():
    W, H = 844, 440
    sc = Screen(W, H)
    label(sc, 24, 26, 'Jumping Spins (Strike #2, Yellow belt)', 18, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    label(sc, W - 24, 26, 'Jump and spin: your last kick hits enemies close by.', 12, CREAM, 'rm', 'Bold', SHADOW_TXT)
    card(sc, 20, 46, 420, 374)
    label(sc, 36, 66, 'LARGE', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    shadow(sc, 230, 380, 190)
    put_icon(sc, 'jumping-spins', 230, 224, 316)
    label(sc, 230, 404, 'Spin kick, kicking foot out, fists up', 12, INK_SOFT, 'mm', 'SemiBold')
    # the same icon next to the plain Strike glyph
    card(sc, 456, 46, 368, 168)
    label(sc, 472, 66, 'NEXT TO THE PLAIN STRIKE GLYPH', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    put_icon(sc, 'strike', 540, 140, 104)
    put_icon(sc, 'jumping-spins', 700, 140, 104)
    label(sc, 540, 198, 'Strike slot', 12, INK, 'mm', 'ExtraBold')
    label(sc, 700, 198, 'Jumping Spins', 12, INK, 'mm', 'ExtraBold')
    card(sc, 456, 228, 368, 192)
    label(sc, 472, 248, 'REAL SIZE  (64, 48, 32 pt)  PAPER, GREY, WALL', 11, mat.GOLD_D, 'lm', 'ExtraBold')
    x = 476
    for s in (64, 48, 32):
        put_icon(sc, 'jumping-spins', x + s / 2, 300, s)
        x += s + 14
    x += 16
    for s in (48, 32):
        put_icon(sc, 'jumping-spins', x + s / 2, 300, s, grey=True)
        x += s + 8
    # wall strip
    wall = ku.wall(344, 80, seed=9)
    sc.img.alpha_composite(wall, (468 * K, 332 * K))
    x = 484
    for s in (64, 48, 32):
        put_icon(sc, 'jumping-spins', x + s / 2, 372, s)
        x += s + 14
    label(sc, 740, 372, 'on the Board wall', 11, CREAM, 'mm', 'Bold', SHADOW_TXT)
    sc.save(os.path.join(PV, '03-jumping-spins'))


# ============ the 128 px sprites (only with --export, after Jay OKs the look) ============
def export():
    out = os.path.join(ROOT, 'sprites')
    os.makedirs(out, exist_ok=True)
    for n in si.ALL:
        padded(n, 128).save(os.path.join(out, n + '.png'))
        padded(n, 256).save(os.path.join(out, n + '@2x.png'))


if __name__ == '__main__':
    if '--export' in sys.argv:
        export()
    else:
        sample_families()
        sample_slots()
        sample_spins()
