"""Phone mock (932x430 + @2x) and a 3x close-up: Epic vs Legendary frames side by side, on the menu2 panel.
Run after build_legendary.py.  python3 incoming-art/legendary-frame/source/make_preview.py"""
import os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); ART = os.path.dirname(ROOT)
M2 = os.path.join(ART, 'menu2', 'sprites'); LG = os.path.join(ROOT, 'sprites'); DR = os.path.join(ART, 'gear-drop-icons', 'sprites')
OUT = os.path.join(ROOT, 'preview'); os.makedirs(OUT, exist_ok=True)

def sp(path, k):   # load at scale k (2 = use @2x)
    p = path.replace('.png', '@2x.png') if k == 2 else path
    return Image.open(p).convert('RGBA')

def nine(img, w, h, c):
    W, H = img.size; out = Image.new('RGBA', (w, h))
    xs = [(0, c, 0, c), (c, W - c, c, w - c), (W - c, W, w - c, w)]
    for sx0, sx1, dx0, dx1 in xs:
        for sy0, sy1, dy0, dy1 in [(0, c, 0, c), (c, H - c, c, h - c), (H - c, H, h - c, h)]:
            out.paste(img.crop((sx0, sy0, sx1, sy1)).resize((dx1 - dx0, dy1 - dy0), Image.LANCZOS), (dx0, dy0))
    return out

def icon(name, size, k):
    im = Image.open(os.path.join(DR, name)).convert('RGBA')
    return im.resize((size * k, size * k), Image.LANCZOS)

def mock(k):
    W, H = 932 * k, 430 * k
    bg = Image.new('RGBA', (W, H), (47, 42, 61, 255))
    panel = nine(sp(os.path.join(M2, 'panel', 'panel-frame.png'), k), W - 24 * k, H - 24 * k, 48 * k)
    bg.alpha_composite(panel, (12 * k, 12 * k))
    def put(img, x, y): bg.alpha_composite(img, (x * k, y * k))
    cols = [('epic', 210), ('legendary', 560)]
    for rar, x0 in cols:
        src = M2 if rar == 'epic' else LG
        for j, it in enumerate(('gi', 'hands', 'charm')):
            put(sp(os.path.join(src, 'gear', f'bag-tile-{rar}.png'), k), x0 + j * 92, 60)
            put(icon(f'drop-{it}-{rar}.png', 56, k), x0 + j * 92 + 14, 72)
        for j, st in enumerate(('', '-glow', '-pressed')):
            put(sp(os.path.join(src, 'gear', f'gear-ring-{rar}{st}.png'), k), x0 + 14 + j * 92, 186)
            put(icon(f'drop-{("gi", "hands", "charm")[j]}-{rar}.png', 36, k), x0 + 24 + j * 92, 196)
        for j, it in enumerate(('gi', 'hands', 'charm', 'gi')):
            put(sp(os.path.join(src, 'found', f'found-tile-{rar}.png'), k), x0 + j * 68, 280)
            put(icon(f'drop-{it}-{rar}.png', 40, k), x0 + j * 68 + 10, 290)
    # spacer only - no baked text (labels belong to the game)
    return bg.convert('RGB')

for k in (1, 2):
    mock(k).save(os.path.join(OUT, f'mock-epic-vs-legendary-932x430{"@2x" if k == 2 else ""}.png'))
# 3x close-up of the bag tiles: epic | legendary
a = sp(os.path.join(M2, 'gear', 'bag-tile-epic.png'), 2); b = sp(os.path.join(LG, 'gear', 'bag-tile-legendary.png'), 2)
r1 = sp(os.path.join(M2, 'gear', 'gear-ring-epic.png'), 2); r2 = sp(os.path.join(LG, 'gear', 'gear-ring-legendary.png'), 2)
cl = Image.new('RGBA', (2 * 84 * 3 + 2 * 56 * 3 + 100, 100 * 3 + 40), (47, 42, 61, 255))
x = 20
for im, w in ((a, 84), (b, 84), (r1, 56), (r2, 56)):
    big = im.resize((w * 3, im.height * 3 // 2), Image.LANCZOS); cl.alpha_composite(big, (x, 20)); x += w * 3 + 20
cl.convert('RGB').save(os.path.join(OUT, 'closeup-epic-vs-legendary-3x.png'))
print('ok')
