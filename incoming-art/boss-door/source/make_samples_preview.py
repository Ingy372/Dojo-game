"""Batch 5 samples preview: each closed boss door look in a small tiled Tier 1 room, next to the battle door,
at 1x and 2x.   python3 incoming-art/boss-door/source/make_samples_preview.py"""
import json, os
from PIL import Image, ImageDraw
H = os.path.dirname(os.path.abspath(__file__)); ART = os.path.join(H, "..", "..")
T = os.path.join(ART, "tower-rooms", "sprites"); S = os.path.join(H, "..", "sprites", "samples"); OUT = os.path.join(H, "..", "preview")
tj = json.load(open(os.path.join(T, "static.json"))); tj = tj.get("sprites", tj)
sj = json.load(open(os.path.join(S, "static.json"))); sj = sj.get("sprites", sj)
P = 80; BG = (0x2f, 0x2a, 0x3d, 255)
def img(d, base, sid, f=0):
    e = d[sid]; im = Image.open(os.path.join(base, e["files"][e["layers"][0]])).convert("RGBA")
    w = e.get("frameWidth", im.width); return im.crop((f * w, 0, f * w + w, im.height)), e["anchorPx"]
def room(look):
    cols, rows = 7, 3; top = 140
    cv = Image.new("RGBA", (cols * P, rows * P + top + P), BG)
    oy = top                               # y of the wall's foot line (row 0 of the floor)
    kinds = ["floor-big", "floor-quad", "floor-big", "floor-worn", "floor-quad", "floor-big", "floor-quad"]
    for r in range(rows):
        for c in range(cols):
            t, _ = img(tj, T, kinds[(c + 2 * r) % 7]); cv.alpha_composite(t, (c * P, oy + r * P))
    wf, wa = img(tj, T, "wall-face")
    for c in range(cols): cv.alpha_composite(wf, (c * P, oy - P - int(wa[1])))   # the wall row's cell top-left = anchorPx
    def door(im, a, c): cv.alpha_composite(im, (int(c * P + P / 2 - a[0]), int(oy - a[1])))
    b, ba = img(tj, T, "door-battle"); door(b, ba, 1)
    k, ka = img(sj, S, f"door-boss-{look}"); door(k, ka, 4)
    return cv
for lk in "abc":
    r1 = room(lk); r2 = r1.resize((r1.width * 2, r1.height * 2), Image.NEAREST)
    out = Image.new("RGBA", (r1.width + r2.width + 30, r2.height + 20), BG)
    out.alpha_composite(r1, (10, 10 + r2.height - r1.height)); out.alpha_composite(r2, (r1.width + 20, 10))
    out.save(os.path.join(OUT, f"sample-{lk}-room.png"))
# one review sheet: the three closed doors side by side at 3x on the game floor colour
ims = [img(sj, S, f"door-boss-{lk}")[0] for lk in "abc"]
h = max(i.height for i in ims) * 3; sheet = Image.new("RGBA", (sum(i.width * 3 + 30 for i in ims) + 30, h + 40), BG)
x = 30
for i in ims:
    j = i.resize((i.width * 3, i.height * 3), Image.NEAREST); sheet.alpha_composite(j, (x, 20 + h - j.height)); x += j.width + 30
sheet.save(os.path.join(OUT, "review-1-samples-3x.png"))
print("ok")
