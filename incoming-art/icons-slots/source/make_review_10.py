"""PB-07 review sheet 10 (pass 6): all five kid icons (Guard, Counter, Strike, Disarm, Jumping Spins) in one row at 1:1 (1024 px each, nothing scaled), a 30 pt row in colour
and grey (true 60 px, then 4x NEAREST), and old (748cf7c, superseded/v5-pass5-icons) against new for Guard and Counter, plus the proportion table.
  python3 incoming-art/icons-slots/source/make_review_10.py     (Pillow only)"""
import os, sys, subprocess
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, HERE)
import seal_icons as si
FONT = next((p for p in ("/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf") if os.path.exists(p)), None)
MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
def F(sz, mono=False):
    if mono: return ImageFont.truetype(MONO, sz)
    f = ImageFont.truetype(FONT, sz)
    try: f.set_variation_by_name('ExtraBold')
    except Exception: pass
    return f
INK, SOFT, PAPER, TILE = (70, 42, 22), (120, 86, 56), (250, 242, 222), (255, 252, 244, 255)
NAMES = ('guard', 'counter', 'strike', 'disarm', 'jumping-spins'); LAB = ('Guard (new)', 'Counter (new)', 'Strike (untouched)', 'Disarm (approved)', 'Jumping Spins (approved)')
def px(im, s=60):
    inner = int(round(s * 112 / 128)); t = Image.new('RGBA', (s, s), PAPER); t.alpha_composite(im.resize((inner, inner), Image.LANCZOS), ((s - inner) // 2, (s - inner) // 2)); return t
grey = lambda t: t.convert('LA').convert('RGBA')
new = {n: si.ALL[n]() for n in NAMES}
old = {n: Image.open(os.path.join(ROOT, 'superseded', 'v5-pass5-icons', n + '.png')).convert('RGBA') for n in ('guard', 'counter')}
prop = subprocess.check_output([sys.executable, os.path.join(HERE, 'measure_proportions.py')], text=True).split('\n')
S, G = 1024, 24; W = 5 * S + 6 * G
y1 = 120; y2 = y1 + 44 + S + 30; y3 = y2 + 40 + 330; y4 = y3 + 44 + S + 30; H = y4 + 30 + 28 * len(prop) + 30
sheet = Image.new('RGBA', (W, H), PAPER); d = ImageDraw.Draw(sheet)
d.text((G, 14), 'Review 10 (pass 6): the five kid icons side by side at 1:1 (1024 px), 30 pt, and Guard / Counter old (748cf7c) vs new', font=F(44), fill=INK)
d.text((G, 70), 'Guard is NOT approved yet. Jumping Spins and Disarm are approved and untouched; Strike is untouched.', font=F(30), fill=SOFT)
col = lambda i: G + i * (S + G)
for i, n in enumerate(NAMES):
    d.text((col(i), y1), LAB[i], font=F(30), fill=SOFT); sheet.alpha_composite(Image.new('RGBA', (S, S), TILE), (col(i), y1 + 44)); sheet.alpha_composite(new[n], (col(i), y1 + 44))
    t = px(new[n]); tg = grey(t)
    d.text((col(i), y2), '30 pt colour | grey (true 60 px, then 4x)', font=F(22), fill=SOFT)
    for j, tt in enumerate((t, tg)):
        x0 = col(i) + j * 500; sheet.alpha_composite(tt, (x0, y2 + 36)); sheet.alpha_composite(tt.resize((240, 240), Image.NEAREST), (x0 + 80, y2 + 36))
for i, (k, lab) in enumerate((('guard', 'Guard OLD (748cf7c)'), ('guard', 'Guard NEW'), ('counter', 'Counter OLD (748cf7c)'), ('counter', 'Counter NEW'))):
    im = old[k] if 'OLD' in lab else new[k]
    d.text((col(i), y3), lab, font=F(30), fill=SOFT); sheet.alpha_composite(Image.new('RGBA', (S, S), TILE), (col(i), y3 + 44)); sheet.alpha_composite(im, (col(i), y3 + 44))
# old / new 30 pt next to the text column
x0 = col(4); d.text((x0, y3), '30 pt: old | new (true, 4x), colour and grey', font=F(26), fill=SOFT)
yy = y3 + 50
for k in ('guard', 'counter'):
    for g in (False, True):
        for j, im in enumerate((old[k], new[k])):
            t = px(im); t = grey(t) if g else t; xx = x0 + j * 250
            sheet.alpha_composite(t.resize((240, 240), Image.NEAREST), (xx, yy))
        yy += 250
        if yy > y3 + 44 + S: break
yy = y4 + 10
d.text((G, yy), 'Proportion check (Spins = reference; brackets = difference to Spins; from measure_proportions.py, the same parameters the icons are drawn with)', font=F(26), fill=INK)
for i, ln in enumerate(prop): d.text((G, yy + 40 + 28 * i), ln, font=F(22, True), fill=INK)
os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
nm_ = '10-review-five-icons-proportions'; out = sheet.convert('RGB'); out.save(os.path.join(ROOT, 'preview', nm_ + '@2x.png'))
out.resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(ROOT, 'preview', nm_ + '.png')); print('ok', out.size)
