"""PB-07 review sheet 08: the two icons changed in the last round, Guard (elbows in line with the body) and Counter (clean straight punching arm), each with a LARGE full
view and a LARGE close-up, old (superseded/v5-final-icons) next to new. Jumping Spins (approved), Disarm (approved) and Strike are not touched.
  python3 incoming-art/icons-slots/source/make_review_08.py     (Pillow only)"""
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
INK, SOFT, PAPER = (70, 42, 22), (120, 86, 56), (250, 242, 222)
ROWS = [('guard', 'Guard', 'elbows now line up with the sides of the body, not flared out', (170, 300, 860, 860)),
        ('counter', 'Counter', 'one straight line shoulder to sleeve to cuff to fist; chambered hip fist kept', (110, 260, 910, 820))]
S = 700
def fit(im, w, h):
    r = min(w / im.width, h / im.height); c = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    out = Image.new('RGBA', (w, h), (255, 252, 244, 255)); out.alpha_composite(c, ((w - c.width) // 2, (h - c.height) // 2)); return out
def px(im, s):
    inner = int(round(s * 112 / 128)); t = Image.new('RGBA', (s, s), PAPER); t.alpha_composite(im.resize((inner, inner), Image.LANCZOS), ((s - inner) // 2, (s - inner) // 2)); return t
W, RH = 4 * S + 5 * 20, S + 90
sheet = Image.new('RGBA', (W, 90 + RH * len(ROWS)), PAPER); d = ImageDraw.Draw(sheet)
d.text((20, 16), 'Review 08: Guard and Counter, v5 before (old) vs after (new). Jumping Spins and Disarm approved; Strike untouched', font=F(34), fill=INK)
for x, k in ((20, 'LARGE: old'), (20 + S + 20, 'LARGE: new'), (20 + 2 * (S + 20), 'close-up: old'), (20 + 3 * (S + 20), 'close-up: new')):
    d.text((x, 58), k, font=F(26), fill=SOFT)
for i, (n, nm, note, box) in enumerate(ROWS):
    y = 100 + i * RH
    old = Image.open(os.path.join(ROOT, 'superseded', 'v5-final-icons', n + '.png')).convert('RGBA'); new = si.ALL[n]()
    for j, im in enumerate((old, new)):
        sheet.alpha_composite(fit(im, S, S), (20 + j * (S + 20), y))
        sheet.alpha_composite(fit(im.crop(box), S, S), (20 + (2 + j) * (S + 20), y))
    d.text((20, y + S + 10), nm + ': ' + note, font=F(28), fill=INK)
    d.text((20 + 2 * (S + 20), y + S + 10), '30 pt, then grey (old, new):', font=F(22), fill=SOFT)
    for j, im in enumerate((old, new)):
        sheet.alpha_composite(px(im, 60), (20 + 2 * (S + 20) + 360 + j * 66, y + S + 6))
        g = px(im, 60).convert('LA').convert('RGBA'); sheet.alpha_composite(g, (20 + 2 * (S + 20) + 520 + j * 66, y + S + 6))
os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
nm_ = '08-review-guard-counter'; out = sheet.convert('RGB'); out.save(os.path.join(ROOT, 'preview', nm_ + '@2x.png'))
out.resize((W // 2, sheet.height // 2), Image.LANCZOS).save(os.path.join(ROOT, 'preview', nm_ + '.png')); print('ok', out.size)
