"""PB-07 review sheet 09 (pass 5): Guard and Counter, old (the edf4403 state, superseded/v5-pass4-icons) next to new, each at its real 1024 px size (1:1, nothing scaled),
then 30 pt (60 px) and grey 30 pt, true size and enlarged 4x. Guard is NOT approved. Jumping Spins and Disarm are approved and untouched.
  python3 incoming-art/icons-slots/source/make_review_09.py     (Pillow only)"""
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
def px(im, s=60):
    inner = int(round(s * 112 / 128)); t = Image.new('RGBA', (s, s), PAPER); t.alpha_composite(im.resize((inner, inner), Image.LANCZOS), ((s - inner) // 2, (s - inner) // 2)); return t
def grey(t): return t.convert('LA').convert('RGBA')
def old_new(n): return Image.open(os.path.join(ROOT, 'superseded', 'v5-pass4-icons', n + '.png')).convert('RGBA'), si.ALL[n]()
S, G = 1024, 24
W = 2 * S + 3 * G
ROW = S + 90
H = 130 + 2 * ROW + 2 * 330 + 220
sheet = Image.new('RGBA', (W, H), PAPER); d = ImageDraw.Draw(sheet)
d.text((G, 14), 'Review 09 (pass 5): Guard and Counter, old (edf4403) left, new right, 1:1 (1024 px)', font=F(40), fill=INK)
d.text((G, 66), 'Guard is NOT approved yet. Jumping Spins and Disarm are approved and untouched.', font=F(30), fill=SOFT)
y = 130
notes = {'guard': 'Guard: forearms folded, elbows tight against the ribs INSIDE the body outline (elbow outer edge 4.8 U inside the torso edge, both sides); X at chest height, fists by the chin.',
         'counter': 'Counter: ONE smooth sleeve shoulder to wrist then a natural fist; the hip fist is small (60%), mostly behind the body, palm up (curl line on top), beside the belt.'}
small = {}
for n in ('guard', 'counter'):
    o, nw = old_new(n); small[n] = (o, nw)
    d.text((G, y), n.upper() + ': old (edf4403)', font=F(30), fill=SOFT); d.text((2 * G + S, y), n.upper() + ': new', font=F(30), fill=SOFT)
    sheet.alpha_composite(Image.new('RGBA', (S, S), (255, 252, 244, 255)), (G, y + 44)); sheet.alpha_composite(Image.new('RGBA', (S, S), (255, 252, 244, 255)), (2 * G + S, y + 44))
    sheet.alpha_composite(o, (G, y + 44)); sheet.alpha_composite(nw, (2 * G + S, y + 44)); y += ROW
    d.text((G, y - 40), notes[n], font=F(24), fill=INK)
# 30 pt strip: per icon one row of 4 cells (old colour, new colour, old grey, new grey); each cell = true size 60 px, then the same enlarged 4x with NEAREST
CW = (W - 2 * G) // 4
for n in ('guard', 'counter'):
    o, nw = small[n]
    for c, (g, im, lab) in enumerate(((False, o, 'old'), (False, nw, 'new'), (True, o, 'old'), (True, nw, 'new'))):
        x0 = G + c * CW; t = px(im); t = grey(t) if g else t
        d.text((x0, y), '%s %s 30 pt: %s' % (n, 'grey' if g else 'colour', lab), font=F(24), fill=SOFT)
        sheet.alpha_composite(t, (x0, y + 40)); sheet.alpha_composite(t.resize((240, 240), Image.NEAREST), (x0 + 90, y + 40))
    y += 310
sheet = sheet.crop((0, 0, W, y))
os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
nm_ = '09-review-guard-counter-1to1'; out = sheet.convert('RGB'); out.save(os.path.join(ROOT, 'preview', nm_ + '@2x.png'))
out.resize((W // 2, sheet.height // 2), Image.LANCZOS).save(os.path.join(ROOT, 'preview', nm_ + '.png')); print('ok', out.size)
