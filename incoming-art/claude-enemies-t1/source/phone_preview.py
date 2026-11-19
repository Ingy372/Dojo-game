"""What a phone actually shows: one Tower tile is about 173 screen pixels (390 pt tall, 6.75 rows, 3x screen).
Today's sprites live at 48 px per tile in the game (80 px renders x 0.6); v2 is rendered at 160 px per tile and
would ship at 96. Both are scaled to the same screen size here, on the real White belt floor tile."""
import json, os
from PIL import Image, ImageDraw, ImageFont
S = 'C:/Users/Muth3/AppData/Local/Temp/claude/c9b08081b9d2ed9a/83a007e6-59b8-4f2a-b4d6-a81c5bef2fd9/scratchpad'
REPO = 'C:/Users/Muth3/Desktop/Dojo-game'
OLD = f'{REPO}/incoming-art/enemies-tier1'
TILE = 173

def frame(folder, name, anim, row, col, layers):
    meta = json.load(open(f'{folder}/{name}.json'))
    fw, fh = meta['frameWidth'], meta.get('frameHeight', meta['frameWidth'])
    out = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    for l in layers:
        p = f'{folder}/{name}_{l}_{anim}.png'
        if os.path.exists(p):
            out.alpha_composite(Image.open(p).convert('RGBA').crop((col * fw, row * fh, col * fw + fw, row * fh + fh)))
    return out, meta

# The real floor tile from the packed White belt kit.
j = json.load(open(f'{REPO}/assets/art/tower-t1.json'))
pages = [Image.open(f'{REPO}/assets/art/{p}').convert('RGBA') for p in j['pages']]
sp = j['entries']['tower']['sprites']['floor-big'] if 'tower' in j['entries'] else None
if sp is None:
    for e in j['entries'].values():
        if e.get('kind') == 'static' and 'floor-big' in e['sprites']:
            sp = e['sprites']['floor-big']
idx = sp.get('frame', 0) if isinstance(sp.get('frame', 0), int) else 0
if 'layers' in sp:
    v = list(sp['layers'].values())[0]
    while isinstance(v, list): v = v[0]
    idx = v
pg, x, y, w, h, tx, ty, fw, fh = j['frames'][idx]
floor = Image.new('RGBA', (fw, fh), (0, 0, 0, 0)); floor.paste(pages[pg].crop((x, y, x + w, y + h)), (tx, ty))
tiles_px = fw  # one tile picture = 48 px; scale up like the phone does
floor = floor.resize((TILE * 2, TILE * 2) if fw > 60 else (TILE, TILE), Image.BILINEAR)

def stage(cols_w, rows_h):
    bg = Image.new('RGBA', (cols_w, rows_h))
    for yy in range(0, rows_h, floor.height):
        for xx in range(0, cols_w, floor.width):
            bg.alpha_composite(floor, (xx, yy))
    return bg

MONS = [('swarmer', 'Inkling'), ('shield', 'Sentinel'), ('brute', 'Rumbler'), ('keeper', 'Warden')]
COLW = [TILE * 1.4, TILE * 1.8, TILE * 2.4, TILE * 3.2]
ROWS = [('TODAY (as in the game now)', 'old', 1.0), ('NEW, same size, twice as sharp', 'new', 1.0), ('NEW, 25% bigger on screen', 'new', 1.25)]
W = int(sum(COLW)) + 40
RH = int(TILE * 2.9)
sheet = Image.new('RGB', (W, len(ROWS) * (RH + 40) + 10), (28, 24, 36))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('arial.ttf', 26)
except Exception:
    font = ImageFont.load_default()
for r, (label, kind, k) in enumerate(ROWS):
    y0 = r * (RH + 40) + 34
    d.text((14, y0 - 30), label, fill=(255, 220, 140), font=font)
    bg = stage(W - 20, RH)
    x = 10
    for (n, nice), cw in zip(MONS, COLW):
        lay = ['glow', 'body'] + (['shield'] if n == 'shield' else [])
        if kind == 'old':
            im, meta = frame(f'{OLD}/{n}/sprites', n, 'idle', 4, 0, lay)
            ppt = 80 * 0.6  # px per tile in the game today
            im = im.resize((int(im.width * 0.6), int(im.height * 0.6)), Image.LANCZOS)  # what the game stores
        else:
            im, meta = frame(f'{S}/v_{n}', n, 'idle', 0, 0, lay)
            ppt = 160 * 0.6
            im = im.resize((int(im.width * 0.6), int(im.height * 0.6)), Image.LANCZOS)
        scale = TILE / ppt * k
        big = im.resize((int(im.width * scale), int(im.height * scale)), Image.BILINEAR)
        anchor = meta['anchor']; ay = anchor['y'] if isinstance(anchor, dict) else anchor[1]
        ax = anchor['x'] if isinstance(anchor, dict) else anchor[0]
        fy = int(RH * 0.86)
        # soft ground shadow like the game's
        sh = Image.new('RGBA', bg.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse((x + cw / 2 - big.width * 0.3, fy - 12, x + cw / 2 + big.width * 0.3, fy + 12), fill=(0, 0, 0, 60))
        bg.alpha_composite(sh)
        bg.alpha_composite(big, (int(x + cw / 2 - ax * 0.6 * scale), int(fy - ay * 0.6 * scale)))
        if r == 2:
            ImageDraw.Draw(bg).text((int(x + 8), RH - 32), nice, fill=(40, 30, 20), font=font)
        x += cw
    sheet.paste(bg.convert('RGB'), (10, y0))
sheet.save(f'{REPO}/incoming-art/claude-enemies-t1/preview/phone-size-on-floor.png')
print(sheet.size)
