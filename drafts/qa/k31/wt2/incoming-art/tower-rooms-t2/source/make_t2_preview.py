"""
Dojo Ascent - Yellow belt Tower kit (Bamboo Garden Hall) previews (Art Director bot), Batch 9.

    python3 tower-rooms-t2/source/make_t2_preview.py        (from incoming-art/)

Writes tower-rooms-t2/preview/:
- review-1-tiled-room.png : a 9 x 6 room tiled from the kit: the 4 doors (rest open), pillars, chest, shrine, decor,
                            with the Tier 1 player (yellow belt) and a swarmer, a red danger circle and a gold star on top
                            (those last four only check readability; they are not part of the kit).
- review-2-boss-room.png  : the boss door (closed, glowing) in the same room, next to the battle door.
- review-3-doors-2x.png   : every door closed / open, the icons, at 2x.
- review-4-chest-shrine-decor-2x.png : chest key frames, shrine glow, the 3 decor pieces, at 2x.
- compare-tier1-tier2.png : the same room in Tier 1 and Tier 2.
- chest_open.gif, shrine_glow.gif, door-boss_glow.gif, door-boss_open.gif
Needs Python 3 with Pillow.
"""
import json, os, math
from PIL import Image, ImageDraw
T = 80
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..", "..")
OUT = os.path.join(HERE, "..", "preview"); os.makedirs(OUT, exist_ok=True)
def kit(d): return d, json.load(open(os.path.join(d, "static.json")))["sprites"]
T1 = kit(os.path.join(ROOT, "tower-rooms", "sprites")); B1 = kit(os.path.join(ROOT, "boss-door", "sprites"))
T2 = kit(os.path.join(HERE, "..", "sprites"))
def frame(k, sid, f=0, layer=None):
    d, M = k; s = M[sid]; im = Image.open(os.path.join(d, s["files"][layer or list(s["files"])[0]])).convert("RGBA")
    w = s["size"][0]; return im.crop((f * w, 0, (f + 1) * w, im.height))
def stacked(k, sid, f=0):
    im = frame(k, sid, f, k[1][sid]["layers"][0]).copy()
    for l in k[1][sid]["layers"][1:]: im.alpha_composite(frame(k, sid, f, l))
    return im
def put(canvas, k, sid, col, row, f=0, layer=None, img=None):
    im = img or frame(k, sid, f, layer); ax, ay = k[1][sid]["anchorPx"]
    canvas.alpha_composite(im, (int(col * T + T / 2 - ax), int((row + 1) * T - ay)))
def tinted(im, hexc):
    r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5)); px = im.split()
    return Image.merge("RGBA", (px[0].point(lambda v: v * r // 255), px[1].point(lambda v: v * g // 255), px[2].point(lambda v: v * b // 255), px[3]))
def actor_img(folder, js, layers, tint={}):
    d = os.path.join(ROOT, folder); J = json.load(open(os.path.join(d, js)))
    fw, fh = J["frameWidth"], J["frameHeight"]; row = J["directions"].index("S"); im = Image.new("RGBA", (fw, fh)); pre = js.split(".")[0]
    for l in layers:
        p = os.path.join(d, f"{pre}_{l}_idle.png")
        if os.path.exists(p):
            fr = Image.open(p).convert("RGBA").crop((0, row * fh, fw, (row + 1) * fh)); im.alpha_composite(tinted(fr, tint[l]) if l in tint else fr)
    return im, (J["anchor"]["x"], J["anchor"]["y"])
PL = actor_img("player-character/sprites", "player.json", ["body", "gi", "belt", "belt-rim"], {"gi": "#ffffff", "belt": "#f2d23c", "belt-rim": "#f2d23c"})
SW = actor_img("enemies-tier1/swarmer/sprites", "swarmer.json", ["body", "glow", "light"])
def actor(c, a, x, y): c.alpha_composite(a[0], (int(x - a[1][0]), int(y - a[1][1])))
def checks(c, top):
    ov = Image.new("RGBA", c.size); d = ImageDraw.Draw(ov); cx, cy = 5.5 * T, (top + 2.6) * T
    d.ellipse((cx - 70, cy - 70, cx + 70, cy + 70), fill=(230, 40, 40, 70), outline=(240, 50, 50, 230), width=4)
    sx, sy = 2.5 * T, (top + 1.6) * T
    d.polygon([(sx + math.cos(math.radians(-90 + i * 36)) * (26 if i % 2 == 0 else 11), sy + math.sin(math.radians(-90 + i * 36)) * (26 if i % 2 == 0 else 11)) for i in range(10)],
              fill=(255, 200, 60, 255), outline=(150, 90, 20, 255))
    c.alpha_composite(ov); actor(c, PL, 4.5 * T, (top + 2.5) * T); actor(c, SW, 5.6 * T, (top + 2.7) * T)
def room(k, boss=None, label=""):
    W, H, top = 9, 6, 2
    c = Image.new("RGBA", (W * T, (H + top) * T), (24, 22, 32, 255))
    for r in range(H):
        for cc in range(W):
            put(c, k, "floor-worn" if (cc * 7 + r * 3) % 11 == 0 else ("floor-quad" if (cc + r) % 2 else "floor-big"), cc, r + top)
    for cc in range(W): put(c, k, "wall-face", cc, top - 1)
    if boss:
        put(c, k, "door-battle", 1, top); put(c, boss, "door-boss", 4, top); put(c, boss, "door-boss-glow", 4, top, f=3)
    else:
        for i, dname in enumerate(("battle", "challenge", "treasure", "rest")): put(c, k, "door-" + dname, 1 + i * 2, top, f=1 if dname == "rest" else 0)
    put(c, k, "pillar", 0, top + 1); put(c, k, "pillar", W - 1, top + 1)
    put(c, k, "chest-closed", 2, top + 4, img=stacked(k, "chest-closed")); put(c, k, "shrine", 7, top + 4, img=stacked(k, "shrine"))
    if "decor-lantern" in k[1]:
        put(c, k, "decor-lantern", 1, top + 2); put(c, k, "decor-bamboo-pot", 8, top + 3); put(c, k, "decor-basin", 6, top + 5)
    for cc in range(W): put(c, k, "wall-block", cc, top + H)
    checks(c, top)
    if label: ImageDraw.Draw(c).text((8, 8), label, fill=(255, 220, 120, 255))
    return c
room(T2).save(os.path.join(OUT, "review-1-tiled-room.png"))
room(T2, boss=T2).save(os.path.join(OUT, "review-2-boss-room.png"))
a, b = room(T1, label="Tier 1 (white belt)"), room(T2, label="Tier 2 (yellow belt): Bamboo Garden Hall")
cmp_ = Image.new("RGBA", (a.width * 2 + 30, a.height + 20), (46, 42, 58, 255)); cmp_.alpha_composite(a, (10, 10)); cmp_.alpha_composite(b, (a.width + 20, 10))
cmp_.save(os.path.join(OUT, "compare-tier1-tier2.png"))
def strip(cells, scale, path, title):
    S = [(l, im.resize((im.width * scale, im.height * scale), Image.NEAREST)) for l, im in cells]
    w = sum(i.width + 10 for _, i in S) + 10; h = max(i.height for _, i in S) + 40
    out = Image.new("RGBA", (w, h), (46, 42, 58, 255)); d = ImageDraw.Draw(out); x = 10; d.text((10, 4), title, fill=(255, 220, 120, 255))
    for l, i in S: out.alpha_composite(i, (x, 24 + h - 40 - i.height)); d.text((x, 14), l, fill=(255, 255, 255, 255)); x += i.width + 10
    out.save(path)
cells = []
for dname in ("battle", "challenge", "treasure", "rest"):
    cells += [(f"{dname} closed", frame(T2, "door-" + dname, 0)), (f"{dname} open", frame(T2, "door-" + dname, 1)), (f"icon-{dname}", frame(T2, "icon-" + dname))]
bc = frame(T2, "door-boss", 0).copy(); bc.alpha_composite(frame(T2, "door-boss-glow", 3))
cells += [("boss closed (+glow)", bc), ("boss open", frame(T2, "door-boss", 1)), ("icon-boss", frame(T2, "icon-boss"))]
strip(cells, 2, os.path.join(OUT, "review-3-doors-2x.png"), "Tier 2 doors (closed / open) and icons, 2x")
M = T2[1]; seq = {k: [stacked(T2, k, i) for i in range(M[k]["frames"])] for k in ("chest-closed", "chest-open", "chest-opened")}
sh = [stacked(T2, "shrine", i) for i in range(M["shrine"]["frames"])]
ch = [(f"open {i}", seq["chest-open"][i]) for i in (0, 11, 13, 19, 29)] + [("opened", seq["chest-opened"][0])]
strip(ch + [("shrine 0", sh[0]), ("shrine 4", sh[4])] + [(d, frame(T2, d)) for d in ("decor-lantern", "decor-bamboo-pot", "decor-basin")], 2,
      os.path.join(OUT, "review-4-chest-shrine-decor-2x.png"), "Tier 2 chest (key frames), shrine glow and decor, 2x")
def gif(frames, path, ms, scale=2):
    H = max(f.height for f in frames); W = max(f.width for f in frames); out = []
    for f in frames:
        c = Image.new("RGBA", (W, H), (46, 42, 58, 255)); c.alpha_composite(f, (0, H - f.height)); out.append(c.resize((W * scale, H * scale), Image.NEAREST))
    out[0].save(path, save_all=True, append_images=out[1:], duration=ms, loop=0)
gif(seq["chest-closed"] + seq["chest-open"] + seq["chest-opened"] * 3, os.path.join(OUT, "chest_open.gif"), round(1000 / 12))
gif(sh, os.path.join(OUT, "shrine_glow.gif"), 125)
bg = []
for i in range(M["door-boss-glow"]["frames"]):
    f = frame(T2, "door-boss", 0).copy(); f.alpha_composite(frame(T2, "door-boss-glow", i)); bg.append(f)
gif(bg, os.path.join(OUT, "door-boss_glow.gif"), 125)
gif(bg + [frame(T2, "door-boss", 1)] * 8, os.path.join(OUT, "door-boss_open.gif"), 125)
print("wrote", OUT)
