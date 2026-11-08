"""PB-07 review sheet 12. Draft for the Manager, not an approval.

Five icons at true 30 px and 40 px, colour and grey, plus large old/new close-ups.
Old is dac4663 (the L-shaped kick, figures kept inside the ring). New is the straight hip kick and the larger figures.

  python3 incoming-art/icons-slots/source/make_review_12.py
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, HERE)
import seal_icons as si
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def F(sz):
    return ImageFont.truetype(FONT, sz)
INK, SOFT, PAPER, TILE = (70, 42, 22), (120, 86, 56), (250, 242, 222), (255, 252, 244, 255)
NAMES = ('guard', 'counter', 'strike', 'disarm', 'jumping-spins')
LAB = ('Guard x1.28', 'Counter x1.28', 'Strike x1.14', 'Disarm x1.16', 'Spin Kick x1.24')
OLD = os.path.join(ROOT, 'superseded', 'v5-pass7-dac4663')

def at(im, s):
    return im.resize((s, s), Image.LANCZOS)
def grey(im):
    g = im.convert('LA').convert('RGBA'); g.putalpha(im.getchannel('A')); return g

new = {n: si.ALL[n]() for n in NAMES}
old = {n: Image.open(os.path.join(OLD, n + '.png')).convert('RGBA') for n in NAMES}
G = 24
# 1:1 pair is two 1024 icons. Size rows sit above.
W = 1024 * 2 + G * 3
col = (W - 2 * G) // 5
sheet_h = 520 + 80 + 1024 + 40 + 2 * (480 + 50)
sheet = Image.new('RGBA', (W, sheet_h), PAPER)
d = ImageDraw.Draw(sheet)
y = 12
d.text((G, y), 'Review 12, draft for the Manager. Not approved. Old is dac4663. New leg is straight from the hip, and the figures are larger.', font=F(28), fill=INK)
y += 40
d.text((G, y), 'The coloured ring is unchanged. Figures may cover it. Fists and feet are kept inside the canvas. True 30 px and 40 px, then the same pixels blown up x6.', font=F(20), fill=SOFT)
y += 36

def cell(i):
    return G + i * col

for i, lab in enumerate(LAB):
    d.text((cell(i), y), lab, font=F(22), fill=INK)
y += 30
for s, blow in ((30, 180), (40, 200)):
    d.text((G, y), 'true %d px, colour then grey. Below: those same pixels x6' % s, font=F(18), fill=SOFT)
    y += 22
    for i, n in enumerate(NAMES):
        x = cell(i)
        c, g = at(new[n], s), grey(at(new[n], s))
        sheet.alpha_composite(c, (x, y))
        sheet.alpha_composite(g, (x + s + 8, y))
        sheet.alpha_composite(c.resize((blow, blow), Image.NEAREST), (x, y + s + 8))
        sheet.alpha_composite(g.resize((blow, blow), Image.NEAREST), (x + blow + 8, y + s + 8))
    y += s + 8 + blow + 16

d.text((G, y), 'Spin Kick at 1:1 (1024 px). Left: dac4663, the bent knee. Right: straight leg from the hip, about 45 degrees, foot near the shoulder.', font=F(24), fill=INK)
y += 34
for i, im in enumerate((old['jumping-spins'], new['jumping-spins'])):
    x = G + i * (1024 + G)
    d.text((x, y), 'OLD dac4663' if i == 0 else 'NEW', font=F(22), fill=SOFT)
    sheet.alpha_composite(Image.new('RGBA', (1024, 1024), TILE), (x, y + 28))
    sheet.alpha_composite(im, (x, y + 28))
y += 28 + 1024 + 20

# other four, old beside new, at 480 (large, not tiny)
d.text((G, y), 'The other four, old (dac4663) beside new, at 480 px. Same poses, drawn larger. They may cover the ring.', font=F(24), fill=INK)
y += 34
big = 480
for row in (NAMES[:2], NAMES[2:4]):
    for i, n in enumerate(row):
        x = G + i * (big * 2 + G + 20)
        d.text((x, y), n + ' old', font=F(18), fill=SOFT)
        d.text((x + big + 8, y), n + ' new', font=F(18), fill=SOFT)
        sheet.alpha_composite(old[n].resize((big, big), Image.LANCZOS), (x, y + 24))
        sheet.alpha_composite(new[n].resize((big, big), Image.LANCZOS), (x + big + 8, y + 24))
    y += 24 + big + 16
sheet = sheet.crop((0, 0, W, min(y, sheet_h)))
os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
out = sheet.convert('RGB')
out.save(os.path.join(ROOT, 'preview', '12-review-straight-kick-larger@2x.png'))
out.resize((out.width // 2, out.height // 2), Image.LANCZOS).save(os.path.join(ROOT, 'preview', '12-review-straight-kick-larger.png'))
print('ok', out.size)
