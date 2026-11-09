"""Sheet 13. Draft for the Manager. Not approved.

Guard is unchanged: it has no motion arrow. Strike and Disarm have a gold impact burst, not a motion arrow, so no arrow was added.
Counter's arrowhead is bigger and sits in the cream, clear of the legs. Spin Kick keeps the cf534ce pose, shifts right so the arrow tail shows, and is drawn twice with picture-only belt colours (pine and bronze).

  python3 incoming-art/icons-slots/source/make_review_13.py
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, HERE)
import seal_icons as si
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def F(sz):
    return ImageFont.truetype(FONT, sz)
INK, SOFT, PAPER = (70, 42, 22), (120, 86, 56), (250, 242, 222)
OLD = os.path.join(ROOT, 'superseded', 'v5-pass7b-cf534ce')
G = 20

def at(im, s):
    return im.resize((s, s), Image.LANCZOS)
def grey(im):
    g = im.convert('LA').convert('RGBA'); g.putalpha(im.getchannel('A')); return g

items = [
    ('Guard', Image.open(os.path.join(OLD, 'guard.png')).convert('RGBA')),
    ('Counter', si.counter()),
    ('Strike', Image.open(os.path.join(OLD, 'strike.png')).convert('RGBA')),
    ('Disarm', Image.open(os.path.join(OLD, 'disarm.png')).convert('RGBA')),
    ('Spin Kick pine', si.jumping_spins('pine')),
    ('Spin Kick bronze', si.jumping_spins('bronze')),
]
W = 1680
H = 1680
sheet = Image.new('RGBA', (W, H), PAPER)
d = ImageDraw.Draw(sheet)
y = 12
d.text((G, y), 'Review 13, draft. Not approved. Guard has no arrow and is unchanged. Strike and Disarm have impact bursts, not arrows.', font=F(24), fill=INK)
y += 34
d.text((G, y), 'Counter arrowhead is bigger, in the cream past the legs. Spin Kick pose is the cf534ce pose, shifted right. Belts are picture colours only, not ranks.', font=F(18), fill=SOFT)
y += 28
d.text((G, y), 'Pine belt #20705A / #124A3A. Bronze belt #A86A3A / #764622. Blue arrow stays (44, 108, 170). Yellow ring stays (240, 178, 56).', font=F(18), fill=SOFT)
y += 32
col = (W - 2 * G) // len(items)
for i, (lab, im) in enumerate(items):
    d.text((G + i * col, y), lab, font=F(18), fill=INK)
y += 26
for s, blow in ((30, 150), (40, 160)):
    d.text((G, y), 'true %d px, colour then grey, then those pixels x%d' % (s, blow // s), font=F(16), fill=SOFT)
    y += 20
    for i, (lab, im) in enumerate(items):
        x = G + i * col
        c, g = at(im, s), grey(at(im, s))
        sheet.alpha_composite(c, (x, y))
        sheet.alpha_composite(g, (x + s + 6, y))
        sheet.alpha_composite(c.resize((blow, blow), Image.NEAREST), (x, y + s + 6))
        sheet.alpha_composite(g.resize((blow, blow), Image.NEAREST), (x + blow + 6, y + s + 6))
    y += s + 6 + blow + 14

# large old/new
d.text((G, y), 'Large: Counter old (cf534ce) beside new. Then Spin Kick old beside pine and bronze. Pose of the kicker is unchanged; he is shifted right.', font=F(18), fill=INK)
y += 28
big = 460
old_c = Image.open(os.path.join(OLD, 'counter.png')).convert('RGBA')
old_s = Image.open(os.path.join(OLD, 'jumping-spins.png')).convert('RGBA')
row = [('Counter old', old_c), ('Counter new', items[1][1]), ('Spin Kick old', old_s), ('Pine', items[4][1])]
for i, (lab, im) in enumerate(row):
    x = G + (i % 4) * (big + 12)
    d.text((x, y), lab, font=F(16), fill=SOFT)
    sheet.alpha_composite(im.resize((big, big), Image.LANCZOS), (x, y + 22))
y += 22 + big + 8
d.text((G, y), 'Bronze', font=F(16), fill=SOFT)
sheet.alpha_composite(items[5][1].resize((big, big), Image.LANCZOS), (G, y + 22))
y += 22 + big + 8
sheet = sheet.crop((0, 0, W, min(y, H)))
os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
out = sheet.convert('RGB')
out.save(os.path.join(ROOT, 'preview', '13-review-belts-and-arrowheads@2x.png'))
out.resize((out.width // 2, out.height // 2), Image.LANCZOS).save(os.path.join(ROOT, 'preview', '13-review-belts-and-arrowheads.png'))
print('ok', out.size)
