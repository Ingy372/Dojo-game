"""PB-07 v4 before/after sheet for Guard and Disarm (Jay: 'Disarm's ankle looks broken. Guard's hands look really weird'):
the v3 icons (superseded/v3-icons) next to the v4 icons, large, zoomed on the hand and the foot, and at 40 / 30 pt (80 / 60 px at @2x), grey 30 pt, wall 30 pt.
  python3 incoming-art/icons-slots/source/make_before_after_v4.py     (Pillow + numpy only)"""
import os, sys, textwrap
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
# (name, label, note, zoom box on the 1024 px icon for the hand / foot close-up)
ROWS = [('guard', 'Guard', 'forearm block: clear wrist, one closed mitten fist', (230, 400, 520, 750)),
        ('disarm', 'Disarm', 'front kick: straight shin, natural ankle, clear heel', (230, 330, 770, 870))]
def pad(im, px):
    inner = int(round(px * 112 / 128)); out = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    out.alpha_composite(im.resize((inner, inner), Image.LANCZOS), ((px - inner) // 2, (px - inner) // 2)); return out
def grey(im):
    g = im.convert('LA').convert('RGBA'); g.putalpha(im.getchannel('A')); return g
def zoom(im, box, side=270):
    c = im.crop(box); r = side / max(c.size); c = c.resize((max(1, int(c.width * r)), max(1, int(c.height * r))), Image.LANCZOS)
    out = Image.new('RGBA', (side, side), (255, 252, 244, 255)); out.alpha_composite(c, ((side - c.width) // 2, (side - c.height) // 2)); return out
BIG, RH, W = 270, 320, 2040
sheet = Image.new('RGBA', (W, 110 + RH * len(ROWS)), PAPER); d = ImageDraw.Draw(sheet)
d.text((24, 16), 'Guard and Disarm: v3 (old) vs v4 (new). Clean wrist and closed mitten fist; straight shin into a natural ankle with a clear heel', font=F(30), fill=INK)
for x, k in ((280, 'LARGE: old'), (570, 'LARGE: new'), (880, 'close-up: old'), (1170, 'close-up: new'), (1470, '30 pt: old / new'), (1690, '40 pt: old / new'), (1900, 'grey 30 pt')):
    d.text((x, 64), k, font=F(22), fill=SOFT)
for i, (n, nm, note, box) in enumerate(ROWS):
    y = 110 + i * RH
    if i % 2: d.rectangle([0, y, W, y + RH], fill=(244, 234, 208))
    d.text((24, y + 100), nm, font=F(30), fill=INK)
    for li, ln in enumerate(textwrap.wrap(note, 26)):
        d.text((24, y + 142 + li * 24), ln, font=F(18), fill=SOFT)
    old = Image.open(os.path.join(ROOT, 'superseded', 'v3-icons', n + '.png')).convert('RGBA'); new = si.ALL[n]()
    sheet.alpha_composite(pad(old, BIG), (280, y + 14)); sheet.alpha_composite(pad(new, BIG), (570, y + 14))
    sheet.alpha_composite(zoom(old, box), (880, y + 14)); sheet.alpha_composite(zoom(new, box), (1170, y + 14))
    cy = y + RH // 2 - 40
    for x0, sz, g in ((1470, 60, False), (1690, 80, False)):
        for j, im in enumerate((old, new)):
            sheet.alpha_composite(pad(im, sz), (x0 + j * (sz + 16), cy + (80 - sz) // 2))
    for j, im in enumerate((old, new)):
        sheet.alpha_composite(pad(grey(im), 60), (1900 + j * 76 - 0, cy + 10))
    d.rectangle([1470, cy + 100, 1690, cy + 190], fill=WALL)
    for j, im in enumerate((old, new)):
        sheet.alpha_composite(pad(im, 60), (1490 + j * 76, cy + 112))
os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
out = sheet.convert('RGB'); out.save(os.path.join(ROOT, 'preview', '05-before-after-v3-v4@2x.png'))
out.resize((W // 2, sheet.height // 2), Image.LANCZOS).save(os.path.join(ROOT, 'preview', '05-before-after-v3-v4.png'))
print('ok', out.size)
