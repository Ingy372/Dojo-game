"""PB-07 review sheet 11 (pass 7).

The five kid icons at the documented phone sizes, plus actual 30 px and 40 px, in colour and grey.
Spin Kick old (pass 6) next to new at 1:1, and a 1:1 crop of the hip so the thigh's origin is obvious.
Kata's direction arrow is on its own row.

Phone sizes, from the docs already in the repo (nothing new was invented):
  128 px file = 64 pt at @2x. incoming-art/icons-slots/source/build_seal_families.py
  48 pt is the phone check in drafts/planning/R-G2B-art-plan.md (96 px at @2x)
  32 pt is the small size named in that same preview script (64 px at @2x)
  Jay also asked to see the real 30 px and 40 px pixels.

  python3 incoming-art/icons-slots/source/make_review_11.py
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, HERE)
import seal_icons as si
FONT = next((p for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",) if os.path.exists(p)), None)
def F(sz):
    return ImageFont.truetype(FONT, sz)
INK, SOFT, PAPER, TILE = (70, 42, 22), (120, 86, 56), (250, 242, 222), (255, 252, 244, 255)
NAMES = ('guard', 'counter', 'strike', 'disarm', 'jumping-spins')
LAB = ('Guard', 'Counter', 'Strike', 'Disarm', 'Spin Kick')
# (label, pixel size). pt sizes are @2x pixels = pt * 2, which is how this folder's previews are built.
SIZES = (('64 pt / 128 px', 128), ('48 pt / 96 px', 96), ('32 pt / 64 px', 64), ('40 px', 40), ('30 px', 30))

def at(im, s):
    return im.resize((s, s), Image.LANCZOS)
def grey(im):
    g = im.convert('LA').convert('RGBA'); g.putalpha(im.getchannel('A')); return g

new = {n: si.ALL[n]() for n in NAMES}
new['kata'] = si.kata()
old = {n: Image.open(os.path.join(ROOT, 'superseded', 'v5-pass6-icons', n + '.png')).convert('RGBA') for n in NAMES + ('kata',)}

S, G = 1024, 28
W = 2 * S + 3 * G
# size block: 5 columns
col_w = (W - 2 * G) // 5
y = 16
# rough height: header + size rows + 1:1 pair + hip crops + kata crops
size_h = 36 + sum(max(s, 8) + 28 for _, s in SIZES) + 200  # 30 px also gets a x6 nearest blow-up
H = 150 + size_h + 70 + S + 80 + 900 + 80 + 500
sheet = Image.new('RGBA', (W, H), PAPER); d = ImageDraw.Draw(sheet)
d.text((G, y), 'Review 11 (pass 7). Spin Kick: the thigh now leaves the hip. Lines and arrows are heavier. Not approved.', font=F(34), fill=INK)
y += 46
d.text((G, y), 'Sizes: 64 pt = the 128 px file, 48 pt = the art-plan phone check, 32 pt = the small preview size, plus real 30 px and 40 px. Grey is beside each.', font=F(22), fill=SOFT)
y += 36
d.text((G, y), 'Scale is still the pass-6 fit (x1.00). The figures already meet the ring, so a bigger scale would clip. Stroke weights are in the Delivery Note.', font=F(22), fill=SOFT)
y += 40

def cell(i):
    return G + i * col_w

for i, n in enumerate(NAMES):
    d.text((cell(i), y), LAB[i], font=F(26), fill=INK)
yy = y + 36
for lab, s in SIZES:
    d.text((G, yy), lab, font=F(18), fill=SOFT)
    yy += 22
    for i, n in enumerate(NAMES):
        x = cell(i)
        c, g = at(new[n], s), grey(at(new[n], s))
        sheet.alpha_composite(c, (x, yy)); sheet.alpha_composite(g, (x + s + 8, yy))
        if s == 30:
            sheet.alpha_composite(c.resize((180, 180), Image.NEAREST), (x, yy + 36))
            sheet.alpha_composite(g.resize((180, 180), Image.NEAREST), (x + 188, yy + 36))
    yy += s + (200 if s == 30 else 12)
yy += 10
d.text((G, yy), 'The 30 px row is also blown up with hard pixels (x6) so the line weight can be judged. That blow-up is not the on-screen size.', font=F(20), fill=SOFT)
yy += 36

# 1:1 Spin Kick
d.text((G, yy), 'Spin Kick, 1:1 (1024 px). Old pass 6 on the left (leg left the shoulder). New on the right (thigh leaves the hip, shin rises).', font=F(26), fill=INK)
yy += 40
for i, im in enumerate((old['jumping-spins'], new['jumping-spins'])):
    x = G + i * (S + G)
    d.text((x, yy), 'OLD pass 6' if i == 0 else 'NEW pass 7', font=F(24), fill=SOFT)
    sheet.alpha_composite(Image.new('RGBA', (S, S), TILE), (x, yy + 32))
    sheet.alpha_composite(im, (x, yy + 32))
yy += 32 + S + 24

# hip crop, same rectangle on both because the fit is locked
HIP = (260, 140, 1000, 980)
d.text((G, yy), 'Same icons, 1:1 crop of the hip. The new thigh comes out under the belt, then the shin goes up. Nothing is scaled.', font=F(26), fill=INK)
yy += 40
cw, ch = HIP[2] - HIP[0], HIP[3] - HIP[1]
for i, im in enumerate((old['jumping-spins'], new['jumping-spins'])):
    x = G + i * (cw + G)
    d.text((x, yy), 'OLD hip' if i == 0 else 'NEW hip', font=F(24), fill=SOFT)
    sheet.alpha_composite(im.crop(HIP), (x, yy + 32))
yy += 32 + ch + 24

d.text((G, yy), 'Kata direction arrow, 1:1 crop. Old on the left, new on the right. Footprints stay on top of the arrow.', font=F(26), fill=INK)
yy += 40
KATA = (520, 500, 920, 820)
kw, kh = KATA[2] - KATA[0], KATA[3] - KATA[1]
for i, im in enumerate((old['kata'], new['kata'])):
    x = G + i * (kw + G)
    d.text((x, yy), 'OLD kata arrow' if i == 0 else 'NEW kata arrow', font=F(24), fill=SOFT)
    sheet.alpha_composite(im.crop(KATA), (x, yy + 32))
yy += 32 + kh + 20
sheet = sheet.crop((0, 0, W, yy))
os.makedirs(os.path.join(ROOT, 'preview'), exist_ok=True)
out = sheet.convert('RGB')
out.save(os.path.join(ROOT, 'preview', '11-review-spin-kick-and-sizes@2x.png'))
out.resize((W // 2, sheet.height // 2), Image.LANCZOS).save(os.path.join(ROOT, 'preview', '11-review-spin-kick-and-sizes.png'))
print('ok', out.size)
