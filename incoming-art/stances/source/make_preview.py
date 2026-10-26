"""Phone-size preview (667x375 pt, @2x): the four stance icons at 64 pt and at 32 pt. Labels here are preview only."""
import os
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, '..', 'sprites')
F = lambda n: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', n)
im = Image.new('RGBA', (1334, 750), (36, 32, 54, 255)); d = ImageDraw.Draw(im)
d.text((40, 30), 'R-STANCE-b stance icons: phone size (667x375 @2x)', font=F(30), fill=(255, 230, 190))
for i, (n, lab) in enumerate((('cat', 'Cat'), ('front', 'Front'), ('fighting', 'Fighting'), ('horse', 'Horse'))):
    x = 120 + i * 300
    im.alpha_composite(Image.open(f'{S}/icon-stance-{n}-64@2x.png'), (x, 140))
    d.text((x + 64, 290), lab, font=F(28), fill=(240, 240, 240), anchor='mt')
    im.alpha_composite(Image.open(f'{S}/icon-stance-{n}-64.png'), (x + 32, 420))
d.text((40, 360), 'At 64 pt (top) and 32 pt (below)', font=F(24), fill=(200, 200, 220))
d.text((40, 560), 'Medallions only; the game draws labels.', font=F(24), fill=(200, 200, 220))
im.save(os.path.join(H, '..', 'preview', 'stances-preview-667x375@2x.png'))
im.resize((667, 375), Image.LANCZOS).save(os.path.join(H, '..', 'preview', 'stances-preview-667x375.png'))
