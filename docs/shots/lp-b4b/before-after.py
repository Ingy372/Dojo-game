# Before/after cells for the effects bolded after the art gate. Usage: python3 before-after.py BEFORE_DIR AFTER_DIR GREEN_DIR OUT.png
import os, sys
from PIL import Image, ImageDraw

def cell(path):
    im = Image.open(path).convert('RGB')
    return im.resize((im.width * 3 // 10, im.height * 3 // 10), Image.LANCZOS) if im.width > 400 else im  # wins: the whole Home screen, shrunk

before, after, green, out = sys.argv[1:5]
ids = ['puff-dust-cloud', 'puff-snow-puffs', 'puff-star-puffs', 'puff-leaf-puffs', 'hit-bubble-pop', 'hit-firework-pop', 'hit-leaf-burst', 'hit-paper-bits-burst',
       'hit-petal-burst', 'hit-star-pop', 'trail-snow-sparkle', 'trail-paper-confetti', 'win-fireworks']
cols = [('Before (white belt floor)', before), ('After (white belt floor)', after), ('After (green belt floor)', green)]
pad, lab = 10, 20
cw = max(cell(f'{after}/{i}.png').width for i in ids)
W, rowh = pad + (cw + pad) * len(cols) + 170, 200 + pad
img = Image.new('RGB', (W, 60 + rowh * len(ids)), (24, 24, 30)); d = ImageDraw.Draw(img)
d.text((pad, 10), 'LP-B4b art-gate fix: darker edge, full strength for 40% of life, bigger pale effects', fill=(255, 255, 255))
for c, (t, _) in enumerate(cols): d.text((170 + pad + c * (cw + pad), 36), t, fill=(255, 220, 120))
for r, i in enumerate(ids):
    y = 60 + r * rowh
    d.text((pad, y + 90), i, fill=(220, 220, 220))
    for c, (_, src) in enumerate(cols): img.paste(cell(f'{src}/{i}.png'), (170 + pad + c * (cw + pad), y))
img.save(out, optimize=True); print(img.size, os.path.getsize(out))
