"""A6 previews: pieces 3x next to the approved decor, and a phone-size room shot (390 px wide, like a phone screen)."""
import json, os
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", "..")
S = os.path.join(H, "..", "sprites"); P = os.path.join(H, "..", "preview"); os.makedirs(P, exist_ok=True)
J = json.load(open(os.path.join(S, "static.json")))["sprites"]
HD = os.path.join(R, "home-dojo", "sprites"); HJ = json.load(open(os.path.join(HD, "static.json")))["sprites"]
T2 = os.path.join(R, "tower-rooms-t2", "sprites")
BG = (44, 40, 58, 255)
def img(d, k, js): return Image.open(os.path.join(d, js[k]["files"][js[k]["layers"][0]])).convert("RGBA")
new = list(J); app = [Image.open(os.path.join(HD, HJ[k]["files"][k])).convert("RGBA") for k in ("stone-lantern", "bamboo-pot")] + \
      [Image.open(os.path.join(T2, "decor-basin_decor-basin.png")).convert("RGBA")]
# review-1: approved decor (left) + the 6 samples, all at 2x on one shared floor line
items = app + [img(S, k, J) for k in new]
sc = 2; hmax = max(i.height for i in items) * sc; W = sum(i.width * sc + 24 for i in items) + 24
sh = Image.new("RGBA", (W, hmax + 48), BG); x = 24
for n, i in enumerate(items):
    i2 = i.resize((i.width * sc, i.height * sc), Image.NEAREST)
    sh.alpha_composite(i2, (x, hmax + 24 - i2.height)); x += i2.width + 24
    if n == 2: x += 24
sh.save(os.path.join(P, "review-1-samples-vs-approved-2x.png"))
# review-2: placed in the Home Dojo room, then scaled to phone width (390 px)
room = Image.open(os.path.join(HD, "room_floor.png")).convert("RGBA")
for lay in ("room_wall-front.png",): pass
ax, ay = HJ["room"]["anchorPx"]
def place(im, js, k, col, row):
    a = js[k]["anchorPx"]; fp = js[k]["footprint"]
    if js[k]["place"] == "wall": px, py = ax + (col + fp[0] / 2) * 80, ay + 80
    else: px, py = ax + (col + fp[0] / 2) * 80, ay + (row + fp[1]) * 80
    room.alpha_composite(im, (int(px - a[0]), int(py - a[1])))
nb = Image.open(os.path.join(HD, "room_notice-board.png")).convert("RGBA"); room.alpha_composite(nb)
spots = {"decor-a6-class-scroll": (3, 0), "decor-a6-kick-pad": (2, 3), "decor-a6-keeper-statue": (11, 2),
         "decor-a6-journal-trophy": (5, 2), "decor-a6-fan-stand": (12, 5), "decor-a6-folding-screen": (9, 1)}
place(Image.open(os.path.join(HD, HJ["stone-lantern"]["files"]["stone-lantern"])).convert("RGBA"), HJ, "stone-lantern", 1, 1)
for k, (c, r) in sorted(spots.items(), key=lambda kv: kv[1][1]): place(img(S, k, J), J, k, c, r)
room.alpha_composite(Image.open(os.path.join(HD, "room_wall-front.png")).convert("RGBA"))
room.save(os.path.join(P, "review-2-in-home-dojo-1x.png"))
w = 390; room.resize((w, round(room.height * w / room.width)), Image.LANCZOS).save(os.path.join(P, "review-3-phone-390px.png"))
# review-4: each sample at true phone size (1x on a 390-wide strip)
strip = Image.new("RGBA", (390, max(img(S, k, J).height for k in new) + 16), BG); x = 6
for k in new:
    i = img(S, k, J); s = min(1, 60 / i.width) if x + i.width > 384 else 1
    strip.alpha_composite(i, (x, strip.height - 8 - i.height)); x += i.width - 10
strip.save(os.path.join(P, "review-4-pieces-1x-phone-strip.png"))
print("ok", os.listdir(P))
