"""PB-07 v3 before/after sheet: the v2 icons (superseded/v2-icons) next to the v3 icons, large and at 30 pt (60 px at @2x) and 40 pt.
  python3 incoming-art/icons-slots/source/make_before_after.py     (Pillow + numpy only)"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, HERE)
import seal_icons as si
FONT = next((p for p in ("/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf") if os.path.exists(p)), None)
def F(sz):
    f = ImageFont.truetype(FONT, sz)
    try: f.set_variation_by_name('ExtraBold')
    except Exception: pass
    return f
INK, SOFT, PAPER, WALL = (70, 42, 22), (120, 86, 56), (250, 242, 222), (110, 74, 46)
ROWS = [('counter', 'Counter', 'mitten fist with a thumb'), ('guard', 'Guard', 'redrawn: guard up, mitten fists, soft shield'),
        ('disarm', 'Disarm', 'shoe with no toes'), ('strike', 'Strike slot', 'shoe, no toes'),
        ('jumping-spins', 'Jumping Spins', 'shoes + mitten fists'), ('kata', 'Kata slot', 'footprints without toes'),
        ('lock', 'Lock', 'unchanged'), ('empty-slot', 'Empty slot', 'unchanged')]
def pad(im, px):
    inner = int(round(px * 112 / 128)); out = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    out.alpha_composite(im.resize((inner, inner), Image.LANCZOS), ((px - inner) // 2, (px - inner) // 2)); return out
def grey(im):
    g = im.convert('LA').convert('RGBA'); g.putalpha(im.getchannel('A')); return g
BIG, RH, W = 270, 300, 1700
sheet = Image.new('RGBA', (W, 110 + RH * len(ROWS)), PAPER); d = ImageDraw.Draw(sheet)
d.text((24, 16), 'Seal icons: v2 (old) vs v3 (new). Clean mitten fists, shoe feet with no toes, Guard redrawn', font=F(30), fill=INK)
for x, k in ((280, 'LARGE: old'), (570, 'LARGE: new'), (880, '30 pt: old / new'), (1090, '40 pt: old / new'), (1330, 'grey 30 pt'), (1545, 'wall 30 pt')):
    d.text((x, 64), k, font=F(22), fill=SOFT)
for i, (n, nm, note) in enumerate(ROWS):
    y = 110 + i * RH
    if i % 2: d.rectangle([0, y, W, y + RH], fill=(244, 234, 208))
    d.text((24, y + 100), nm, font=F(30), fill=INK)
    for li, ln in enumerate((note[:26], note[26:52])):
        d.text((24, y + 142 + li * 24), ln, font=F(18), fill=SOFT)
    old = Image.open(os.path.join(ROOT, 'superseded', 'v2-icons', n + '.png')).convert('RGBA'); new = (Image.open(os.path.join(ROOT, 'superseded', 'v3-icons', n + '.png')).convert('RGBA') if n in ('guard', 'disarm', 'counter', 'strike', 'jumping-spins') else si.ALL[n]())   # these five moved on to v4 (sheets 05 and 06)
    sheet.alpha_composite(pad(old, BIG), (280, y + 14)); sheet.alpha_composite(pad(new, BIG), (570, y + 14))
    cy = y + RH // 2 - 30
    for x0, sz, g in ((880, 60, False), (1090, 80, False), (1330, 60, True)):
        for j, im in enumerate((old, new)):
            sheet.alpha_composite(pad(grey(im) if g else im, sz), (x0 + j * (sz + 16), cy + (80 - sz) // 2))
    d.rectangle([1530, cy - 10, 1690, cy + 90], fill=WALL)
    for j, im in enumerate((old, new)):
        sheet.alpha_composite(pad(im, 60), (1545 + j * 76, cy + 10))
os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
out = sheet.convert('RGB'); out.save(os.path.join(ROOT, 'preview', '04-before-after-v2-v3@2x.png'))
out.resize((W // 2, sheet.height // 2), Image.LANCZOS).save(os.path.join(ROOT, 'preview', '04-before-after-v2-v3.png'))
print('ok', out.size)
