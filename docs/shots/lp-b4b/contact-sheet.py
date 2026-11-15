# Builds contact-sheet.png from the cells fx-verify.mjs (PARTS=sheet) writes. Usage: python3 contact-sheet.py CELLS_DIR OUT.png
import glob, os, sys
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
groups = [('Walk trails (real emitter, last 3 tiles of a walk)', 'trail-', 5), ('Dash puffs (at the feet, 35% into their life)', 'puff-', 4),
          ('Hit pops (one tile in front, 35% into their life)', 'hit-', 4), ('Wall paints (Home Dojo)', 'wall-', 4), ('Win bursts (Home, 40% into their life; half size)', 'win-', 3)]
pad, lab, head = 10, 22, 30
rows, maxw = [], 0
for title, pre, per in groups:
    fs = sorted(glob.glob(f'{src}/{pre}*.png'), key=lambda f: (not f.endswith('plain-wood.png'), f))
    ims = [Image.open(f).convert('RGB') for f in fs]
    if pre == 'win-': ims = [i.resize((i.width // 2, i.height // 2), Image.LANCZOS) for i in ims]
    lines = [list(zip(fs, ims))[k:k + per] for k in range(0, len(fs), per)]
    rows.append((title, pre, lines))
    for l in lines: maxw = max(maxw, sum(i.width + pad for _, i in l) + pad)
H = 40 + sum(head + sum(max(i.height for _, i in l) + lab + pad for l in lines) for _, _, lines in rows)
sheet = Image.new('RGB', (maxw, H), (24, 24, 30)); d = ImageDraw.Draw(sheet)
d.text((pad, 12), 'LP-B4b contact sheet: every effect and wall paint at game size (844x390), next to the hero', fill=(255, 255, 255))
y = 40
for title, pre, lines in rows:
    d.text((pad, y + 10), title, fill=(255, 220, 120)); y += head
    for l in lines:
        x, h = pad, max(i.height for _, i in l)
        for f, i in l:
            sheet.paste(i, (x, y)); d.text((x, y + h + 5), os.path.basename(f)[len(pre):-4], fill=(220, 220, 220)); x += i.width + pad
        y += h + lab + pad
sheet.save(out, optimize=True); print(sheet.size, os.path.getsize(out))
