"""Side-by-side moving picture: today's hero (as the game shows it) next to the v3 sample. python make_compare.py"""
import os
from PIL import Image, ImageDraw, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..", "..")
TINT = {"skin": (246, 205, 172), "gi": (250, 250, 252), "belt": (245, 160, 40), "hair-01": (70, 45, 30), "body": None, "face-01": None}
ORDER = ["body", "skin", "gi", "belt", "face-01", "hair-01"]

def sheet(folder, anim, fw, fh):
    comp = None
    for l in ORDER:
        p = os.path.join(folder, f"player-a_{l}_{anim}.png")
        if not os.path.exists(p): continue
        im = Image.open(p).convert("RGBA")
        if TINT[l]:
            r, g, b, al = im.split()
            col = Image.new("RGB", im.size, TINT[l])
            rgb = ImageChops.multiply(Image.merge("RGB", (r, g, b)), col)
            im = Image.merge("RGBA", (*rgb.split(), al))
        comp = im if comp is None else Image.alpha_composite(comp, im)
    return comp

def frames(comp, row, fw, fh, n):
    return [comp.crop((i * fw, row * fh, (i + 1) * fw, (row + 1) * fh)) for i in range(n)]

old = sheet(os.path.join(ROOT, "claude-hero-v2", "sprites", "body-a"), "walk", 128, 160)
new = sheet(os.path.join(HERE, "..", "sample", "new-2x"), "walk", 256, 320)
SHOW = 3  # display size multiplier vs the game's 1x (each frame shown at 2.4x the game's packed size)
out = []
dirs_old = {"E": 2, "SE": 3}
for f in range(12):
    canvas = Image.new("RGBA", (4 * 230 + 40, 330), (38, 36, 48, 255))
    d = ImageDraw.Draw(canvas)
    x = 20
    for name, r_new in (("E", 0), ("SE", 1)):
        o = frames(old, dirs_old[name], 128, 160, 12)[f]
        o = o.resize((77, 96), Image.LANCZOS).resize((230, 288), Image.BILINEAR)  # as packed in the game, then zoomed
        nn = frames(new, r_new, 256, 320, 12)[f].resize((230, 288), Image.LANCZOS)
        canvas.alpha_composite(o, (x, 30)); d.text((x + 70, 8), "today", fill=(220, 220, 220)); x += 230
        canvas.alpha_composite(nn, (x, 30)); d.text((x + 60, 8), "new sample", fill=(255, 220, 120)); x += 240
    out.append(canvas.convert("P", palette=Image.ADAPTIVE))
dst = os.path.join(HERE, "..", "sample", "hero_run_compare.gif")
out[0].save(dst, save_all=True, append_images=out[1:], duration=1000 // 18, loop=0, disposal=2)
out[3].convert("RGB").save(dst.replace(".gif", "_still.png"))
print(dst)
