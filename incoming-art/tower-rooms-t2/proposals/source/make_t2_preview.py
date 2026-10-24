"""
Dojo Ascent - Yellow belt Tower (Tier 2) theme proposals: previews (Art Director bot). SAMPLES.

    python3 tower-rooms-t2/source/make_t2_preview.py      (run from incoming-art/)

For each theme: a small tiled room corner using that theme's floor, wall, pillar and battle door, with the
existing Tier 1 doors, chest and shrine, plus a player (yellow belt), a swarmer, a red danger circle and a gold
defeat star dropped on top - only to check that they still stand out (those are not part of the kit).
Also a side-by-side of the three themes next to Tier 1. Needs Python 3 with Pillow.
"""
import json, os
from PIL import Image, ImageDraw
T = 80
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..", "..")
OUT = os.path.join(HERE, "..", "preview"); os.makedirs(OUT, exist_ok=True)
def kit(d):
    return d, json.load(open(os.path.join(d, "static.json")))["sprites"]
T1 = kit(os.path.join(ROOT, "tower-rooms", "sprites"))
def frame(k, sid, f=0, layer=None):
    d, M = k; s = M[sid]; im = Image.open(os.path.join(d, s["files"][layer or list(s["files"])[0]])).convert("RGBA")
    w = s["size"][0]; return im.crop((f * w, 0, (f + 1) * w, im.height))
def put(canvas, k, sid, col, row, f=0, layer=None):
    im = frame(k, sid, f, layer); ax, ay = k[1][sid]["anchorPx"]
    canvas.alpha_composite(im, (int(col * T + T / 2 - ax), int((row + 1) * T - ay)))
def tinted(im, hexc):
    r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5)); px = im.split()
    return Image.merge("RGBA", (px[0].point(lambda v: v * r // 255), px[1].point(lambda v: v * g // 255), px[2].point(lambda v: v * b // 255), px[3]))
def player():
    d = os.path.join(ROOT, "player-character", "sprites"); J = json.load(open(os.path.join(d, "player.json")))
    fw, fh = J["frameWidth"], J["frameHeight"]; row = J["directions"].index("S"); im = Image.new("RGBA", (fw, fh))
    tint = {"gi": "#ffffff", "belt": "#f2d23c", "belt-rim": "#f2d23c"}
    for L in sorted(J["layers"], key=lambda l: l["order"]):
        p = os.path.join(d, f"player_{L['name']}_idle.png")
        if L["optional"] or L["name"].startswith("prop") or not os.path.exists(p): continue
        fr = Image.open(p).convert("RGBA").crop((0, row * fh, fw, (row + 1) * fh))
        im.alpha_composite(tinted(fr, tint[L["name"]]) if L["name"] in tint else fr)
    return im, J["anchor"]
def swarmer():
    d = os.path.join(ROOT, "enemies-tier1", "swarmer", "sprites"); J = json.load(open(os.path.join(d, "swarmer.json")))
    fw, fh = J["frameWidth"], J["frameHeight"]; row = J["directions"].index("S"); im = Image.new("RGBA", (fw, fh))
    for l in ("body", "glow", "light"):
        im.alpha_composite(Image.open(os.path.join(d, f"swarmer_{l}_idle.png")).convert("RGBA").crop((0, row * fh, fw, (row + 1) * fh)))
    return im, J["anchor"]
PL, SW = player(), swarmer()
def actor(canvas, a, x, y):
    im, an = a; ax, ay = an["x"], an["y"]
    canvas.alpha_composite(im, (int(x - ax), int(y - ay)))
def room(k, label):
    W, H, top = 7, 4, 2
    c = Image.new("RGBA", (W * T, (H + top) * T + 20), (24, 22, 32, 255))
    for r in range(H):
        for cc in range(W):
            s = "floor-worn" if (cc * 7 + r * 3) % 11 == 0 else ("floor-quad" if (cc + r) % 2 else "floor-big")
            put(c, k, s, cc, r + top)
    for cc in range(W): put(c, k, "wall-face", cc, top - 1)
    put(c, k, "door-battle", 1, top)
    put(c, T1, "door-treasure", 3, top); put(c, T1, "door-rest", 5, top, f=1)
    put(c, k, "pillar", 0, top + 1); put(c, k, "pillar", W - 1, top + 1)
    for l in T1[1]["chest-closed"]["layers"]: put(c, T1, "chest-closed", 1, top + 3, layer=l)
    put(c, T1, "shrine", 5, top + 3); put(c, T1, "shrine", 5, top + 3, layer="shrine-glow")
    ov = Image.new("RGBA", c.size); d = ImageDraw.Draw(ov)   # mock danger circle + gold defeat star (check only)
    cx, cy = 4.5 * T, (top + 2.6) * T
    d.ellipse((cx - 70, cy - 70, cx + 70, cy + 70), fill=(230, 40, 40, 70), outline=(240, 50, 50, 230), width=4)
    sx, sy = 2.5 * T, (top + 1.5) * T; import math
    pts = [(sx + math.cos(math.radians(-90 + i * 36)) * (26 if i % 2 == 0 else 11), sy + math.sin(math.radians(-90 + i * 36)) * (26 if i % 2 == 0 else 11)) for i in range(10)]
    d.polygon(pts, fill=(255, 200, 60, 255), outline=(150, 90, 20, 255))
    c.alpha_composite(ov)
    actor(c, PL, 3.5 * T, (top + 2.5) * T); actor(c, SW, 4.6 * T, (top + 2.7) * T)
    ImageDraw.Draw(c).text((6, c.height - 16), label, fill=(255, 220, 120, 255))
    return c
THEMES = [("sandstone", "A  Sunlit Sandstone"), ("bamboo", "B  Bamboo Garden Hall"), ("sunrise", "C  Sunrise Lacquer")]
rooms = [room(T1, "Tier 1 (white belt) - for comparison")]
for t, lab in THEMES:
    r = room(kit(os.path.join(HERE, "..", "sprites", t)), lab); r.save(os.path.join(OUT, f"theme-{t}-room.png")); rooms.append(r)
w, h = rooms[0].size
sheet = Image.new("RGBA", (w * 2 + 30, h * 2 + 30), (46, 42, 58, 255))
for i, r in enumerate(rooms): sheet.alpha_composite(r, (10 + (i % 2) * (w + 10), 10 + (i // 2) * (h + 10)))
sheet.save(os.path.join(OUT, "themes-side-by-side.png"))
print("wrote", OUT)
