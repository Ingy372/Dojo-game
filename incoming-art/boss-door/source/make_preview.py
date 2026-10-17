"""Batch 5 previews: the boss door in a tiled Tier 1 room next to the battle door (closed and open, 1x and 2x),
a GIF of the glow loop, a GIF of the opening, and a sheet of the pieces.
    python3 incoming-art/boss-door/source/make_preview.py"""
import json, os
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); ART = os.path.join(H, "..", "..")
T = os.path.join(ART, "tower-rooms", "sprites"); S = os.path.join(H, "..", "sprites"); OUT = os.path.join(H, "..", "preview")
def load(base):
    d = json.load(open(os.path.join(base, "static.json"))); return d.get("sprites", d)
tj, sj = load(T), load(S); P = 80; BG = (0x2f, 0x2a, 0x3d, 255)
def img(d, base, sid, f=0):
    e = d[sid]; im = Image.open(os.path.join(base, e["files"][e["layers"][0]])).convert("RGBA")
    w = e.get("frameWidth", im.width); return im.crop((f * w, 0, f * w + w, im.height)), e["anchorPx"]
def room(open_=False, glow=None, cols=7, rows=3):
    top = 190; cv = Image.new("RGBA", (cols * P, rows * P + top + 20), BG); oy = top
    kinds = ["floor-big", "floor-quad", "floor-big", "floor-worn", "floor-quad", "floor-big", "floor-quad"]
    for r in range(rows):
        for c in range(cols): cv.alpha_composite(img(tj, T, kinds[(c + 2 * r) % 7])[0], (c * P, oy + r * P))
    wf, wa = img(tj, T, "wall-face")
    for c in range(cols): cv.alpha_composite(wf, (c * P, oy - P - int(wa[1])))
    def at(im, a, c): cv.alpha_composite(im, (int(c * P + P / 2 - a[0]), int(oy - a[1])))
    b, ba = img(tj, T, "door-battle", 1 if open_ else 0); at(b, ba, 1)
    k, ka = img(sj, S, "door-boss", 1 if open_ else 0); at(k, ka, 4)
    if glow is not None and not open_: at(img(sj, S, "door-boss-glow", glow)[0], ka, 4)
    return cv
def x2(im): return im.resize((im.width * 2, im.height * 2), Image.NEAREST)
# room still: closed (with glow at its peak) and open, 1x and 2x
a, b = room(False, 4), room(True)
w = a.width + P * 10 + 40; st = Image.new("RGBA", (w, a.height * 4 + 50), BG)
st.alpha_composite(a, (10, 10)); st.alpha_composite(b, (10, a.height + 20))
st.alpha_composite(x2(a).crop((P, 0, P * 11, a.height * 2)), (a.width + 30, 10))
st.alpha_composite(x2(b).crop((P, 0, P * 11, a.height * 2)), (a.width + 30, a.height * 2 + 30))
st.save(os.path.join(OUT, "review-1-room.png"))
# GIFs (2x, cropped round the doors)
def crop(im): return x2(im.crop((0, 0, 6 * P, 190 + P + 20)))
fr = [crop(room(False, i)) for i in range(8)]
fr[0].save(os.path.join(OUT, "door-boss_glow.gif"), save_all=True, append_images=fr[1:], duration=125, loop=0, disposal=2)
seq = [crop(room(False, i % 8)) for i in range(16)] + [crop(room(True))] * 1
dur = [125] * 16 + [1500]
seq[0].save(os.path.join(OUT, "door-boss_open.gif"), save_all=True, append_images=seq[1:], duration=dur, loop=0, disposal=2)
# pieces sheet at 3x: closed, open, glow frames 0 and 4 alone, the icon next to icon-battle
ps = [img(sj, S, "door-boss", 0)[0], img(sj, S, "door-boss", 1)[0], img(sj, S, "door-boss-glow", 0)[0], img(sj, S, "door-boss-glow", 4)[0],
      img(tj, T, "icon-battle")[0], img(sj, S, "icon-boss")[0]]
hh = max(p.height for p in ps) * 3; sh = Image.new("RGBA", (sum(p.width * 3 + 24 for p in ps) + 24, hh + 40), BG); x = 24
for p in ps:
    q = p.resize((p.width * 3, p.height * 3), Image.NEAREST); sh.alpha_composite(q, (x, 20 + hh - q.height)); x += q.width + 24
sh.save(os.path.join(OUT, "review-2-pieces-3x.png")); print("ok")
