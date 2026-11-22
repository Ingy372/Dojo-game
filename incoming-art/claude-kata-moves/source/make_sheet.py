"""Lays out quick_stills.py pictures, labelled, on a floor colour with a ground line. Plain Python (Pillow).

    python make_sheet.py <stills dir> <out.png> [anim,anim,...]

An action with one frame shows its directions side by side (a row per action); an action with several frames
gets a block: rows = directions, columns = frames.
"""
import sys, os, re
from collections import defaultdict
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
want = sys.argv[3].split(",") if len(sys.argv) > 3 else None
files = defaultdict(lambda: defaultdict(dict))
for fn in os.listdir(src):
    m = re.match(r"(.+)__(\w+)__(\d+)\.png$", fn)
    if m:
        files[m.group(1)][m.group(2)][int(m.group(3))] = os.path.join(src, fn)
anims = [a for a in (want or sorted(files)) if a in files]
try:
    font = ImageFont.truetype("arial.ttf", 18); small = ImageFont.truetype("arial.ttf", 13)
except OSError:
    font = small = ImageFont.load_default()
ORDER = ["S", "SE", "E", "NE", "N", "NW", "W", "SW"]
BG, INK = (226, 214, 190), (30, 20, 40)

def cell(path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    return im.crop((int(w * 0.08), int(h * 0.12), int(w * 0.92), h))   # trim empty margins

def block(a):
    dirs = [d for d in ORDER if d in files[a]]
    frames = sorted({f for d in dirs for f in files[a][d]})
    single = len(frames) == 1
    rows = [(d, frames[0]) for d in dirs] if single else None
    sample = cell(files[a][dirs[0]][frames[0]])
    w, h = sample.size
    gy = int(h - Image.open(files[a][dirs[0]][frames[0]]).size[1] * (1 - 0.856))
    if single:
        grid = [[(d, frames[0]) for d in dirs]]
        col_labels, row_labels = dirs, [""]
    else:
        grid = [[(d, f) for f in frames] for d in dirs]
        col_labels, row_labels = [str(f) for f in frames], dirs
    lw = 40
    blk = Image.new("RGB", (lw + len(grid[0]) * w, 44 + len(grid) * h), BG)
    dr = ImageDraw.Draw(blk)
    dr.text((6, 4), a, fill=INK, font=font)
    for i, lab in enumerate(col_labels):
        dr.text((lw + i * w + 6, 26), lab, fill=(90, 70, 60), font=small)
    for j, row in enumerate(grid):
        dr.text((6, 44 + j * h + h // 2), row_labels[j], fill=INK, font=font)
        for i, (d, f) in enumerate(row):
            x, y = lw + i * w, 44 + j * h
            dr.line([(x + 4, y + gy), (x + w - 4, y + gy)], fill=(190, 175, 150), width=1)
            if f in files[a][d]:
                im = cell(files[a][d][f])
                blk.paste(im, (x, y), im)
    return blk

blocks = [block(a) for a in anims]
W = max(b.width for b in blocks)
H = sum(b.height for b in blocks) + 8 * len(blocks)
sheet = Image.new("RGB", (W, H), (245, 240, 230))
y = 0
for b in blocks:
    sheet.paste(b, (0, y)); y += b.height + 8
sheet.save(out)
print("saved", out, sheet.size)
