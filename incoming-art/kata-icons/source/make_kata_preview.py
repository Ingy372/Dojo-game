"""S3-A1 previews: icon sheet at 2x/1x on the floor colour, greyscale check, phone mock (48 px icons + 96 px direction picture).
    python3 incoming-art/kata-icons/source/make_kata_preview.py"""
import os, json
from PIL import Image, ImageDraw, ImageOps
H = os.path.dirname(os.path.abspath(__file__)); SP = os.path.join(H, "..", "sprites"); OUT = os.path.join(H, "..", "preview"); os.makedirs(OUT, exist_ok=True)
J = json.load(open(os.path.join(SP, "static.json")))["sprites"]
icons = [k for k in J if "-dir-" not in k]; dirs = [k for k in J if "-dir-" in k]
BG = (47, 42, 61, 255)
im = lambda k: Image.open(os.path.join(SP, k + ".png")).convert("RGBA")
def sheet(ids, sz, cols, name, grey=False):
    rows = (len(ids) + cols - 1) // cols; o = Image.new("RGBA", (cols * (sz + 10) + 10, rows * (sz + 10) + 10), BG)
    for i, k in enumerate(ids): o.alpha_composite(im(k).resize((sz, sz), Image.LANCZOS), (10 + i % cols * (sz + 10), 10 + i // cols * (sz + 10)))
    if grey: o = ImageOps.grayscale(o).convert("RGBA")
    o.save(os.path.join(OUT, name)); return o
sheet(icons, 128, 7, "sheet-moves-2x.png"); sheet(icons, 64, 7, "sheet-moves-1x.png"); sheet(icons, 128, 7, "sheet-moves-grey.png", True)
sheet(dirs, 192, 5, "sheet-directions.png"); sheet(dirs, 192, 5, "sheet-directions-grey.png", True)
# phone mock: practice view = direction picture + a row of move icons for Basic Form 1 style steps
ph = Image.new("RGBA", (390, 844), BG); d = ImageDraw.Draw(ph)
for r, (dk, mv) in enumerate([("kata-dir-left", ["kata-turn", "kata-stance-front", "kata-block-downward"]), ("kata-dir-right", ["kata-turn-180", "kata-block-downward", "kata-punch-straight"]),
                             ("kata-dir-front", ["kata-chamber", "kata-kick-front", "kata-kiai"]), ("kata-dir-back", ["kata-turn-big-special", "kata-stance-cat", "kata-catch"])]):
    y = 60 + r * 120; d.rounded_rectangle((16, y - 8, 374, y + 104), 14, fill=(60, 54, 78, 255))
    ph.alpha_composite(im(dk).resize((96, 96), Image.LANCZOS), (24, y))
    for c, k in enumerate(mv): ph.alpha_composite(im(k).resize((48, 48), Image.LANCZOS), (140 + c * 74, y + 24))
y = 560
for i, k in enumerate(icons): ph.alpha_composite(im(k).resize((40, 40), Image.LANCZOS), (20 + i % 7 * 52, y + i // 7 * 52))
ph.save(os.path.join(OUT, "phone-mock.png")); print(sorted(os.listdir(OUT)))
# v2: 40 px check (the smallest size the Manager asked to read), hand icons first, plus a 3x zoom of that so reviewers can see the pixels
hands = [k for k in icons if any(t in k for t in ("block", "punch", "backfist", "chamber", "catch", "choke"))]
o = sheet(hands + [k for k in icons if k not in hands], 40, 7, "check-40px.png")
o.resize((o.width * 3, o.height * 3), Image.NEAREST).save(os.path.join(OUT, "check-40px-zoom3x.png"))
