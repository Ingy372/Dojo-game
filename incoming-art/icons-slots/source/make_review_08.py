"""PB-07 review sheet 08 (pass 4): Counter only. Guard is NOT approved (it is redone in pass 5, sheet 09); Jumping Spins and Disarm are approved; Strike is not touched.
Old = the pass-3 Counter (superseded/v5-pass3-icons), new = the current one: LARGE full views, LARGE close-ups of the chambered hip fist and of the punching arm,
and 30 pt / grey 30 pt enlarged 4x.
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
S = 700
HIP = {'old': (180, 380, 640, 700), 'new': (130, 380, 590, 700)}
PUNCH = {'old': (280, 290, 880, 570), 'new': (330, 290, 930, 570)}
def fit(im, w, h):
    r = min(w / im.width, h / im.height); c = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    out = Image.new('RGBA', (w, h), (255, 252, 244, 255)); out.alpha_composite(c, ((w - c.width) // 2, (h - c.height) // 2)); return out
def px(im, s=60):
    inner = int(round(s * 112 / 128)); t = Image.new('RGBA', (s, s), PAPER); t.alpha_composite(im.resize((inner, inner), Image.LANCZOS), ((s - inner) // 2, (s - inner) // 2)); return t
old = Image.open(os.path.join(ROOT, 'superseded', 'v5-pass3-icons', 'counter.png')).convert('RGBA'); new = Image.open(os.path.join(ROOT, 'superseded', 'v5-pass4-icons', 'counter.png')).convert('RGBA')  # frozen: the edf4403 state; the live Counter moved on in pass 5
G = 20; W = 4 * S + 5 * G; H = 90 + 2 * (S + 70)
sheet = Image.new('RGBA', (W, H), PAPER); d = ImageDraw.Draw(sheet)
d.text((G, 14), 'Review 08 (pass 4): Counter, old v5 (left of each pair) vs new (right). Guard NOT approved (see sheet 09)', font=F(34), fill=INK)
col = lambda i: G + i * (S + G)
y1, y2 = 90, 90 + S + 70
for i, k in enumerate(('FULL: old', 'FULL: new', 'chambered hip fist: old', 'chambered hip fist: new')): d.text((col(i), 56), k, font=F(24), fill=SOFT)
sheet.alpha_composite(fit(old, S, S), (col(0), y1)); sheet.alpha_composite(fit(new, S, S), (col(1), y1))
sheet.alpha_composite(fit(old.crop(HIP['old']), S, S), (col(2), y1)); sheet.alpha_composite(fit(new.crop(HIP['new']), S, S), (col(3), y1))
for i, k in enumerate(('punching arm: old', 'punching arm: new', '30 pt, 4x: old, new', 'grey 30 pt, 4x: old, new')): d.text((col(i), y2 - 34), k, font=F(24), fill=SOFT)
sheet.alpha_composite(fit(old.crop(PUNCH['old']), S, S), (col(0), y2)); sheet.alpha_composite(fit(new.crop(PUNCH['new']), S, S), (col(1), y2))
for g, c in ((False, 2), (True, 3)):
    for j, im in enumerate((old, new)):
        t = px(im); t = t.convert('LA').convert('RGBA') if g else t
        sheet.alpha_composite(t.resize((330, 330), Image.NEAREST), (col(c) + j * 350, y2 + 100))
d.text((col(0), y2 + S + 6), 'Counter: chambered fist moved to the side of the hip (elbow behind the body), both fists the same size as Guard, shoulder forward so the arm grows from it', font=F(26), fill=INK)
os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
nm_ = '08-review-guard-counter'; out = sheet.convert('RGB'); out.save(os.path.join(ROOT, 'preview', nm_ + '@2x.png'))
out.resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(ROOT, 'preview', nm_ + '.png')); print('ok', out.size)
