"""
Dojo Ascent - Ember Kitchens (Tier 3) room kit previews (B-ART3 group C). From incoming-art/:
    python3 tier3-ember-kitchens/source/make_t3_rooms_preview.py
Builds every room in drafts/content/rooms/ember-kitchens.json (read only) from the kit, with suggested prop
placement (art only: solid props only on '#' cells, flat ones on '.'), the player at P, and on two rooms a red
danger circle and the purple/white lane stripes to check readability (those overlays are not part of the kit).
Writes tier3-ember-kitchens/preview/: room-<n>-<id>.png, rooms-all.png, kit-sheet-2x.png, compare-t2-t3.png, gifs.
"""
import json, os, math
from PIL import Image, ImageDraw
T = 80
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..", "..")
OUT = os.path.join(HERE, "..", "preview"); os.makedirs(OUT, exist_ok=True)
DATA = json.load(open(os.path.join(ROOT, "..", "drafts", "content", "rooms", "ember-kitchens.json")))
def kit(d): return d, json.load(open(os.path.join(d, "static.json")))["sprites"]
K3 = kit(os.path.join(HERE, "..", "sprites")); T2 = kit(os.path.join(ROOT, "tower-rooms-t2", "sprites"))
def frame(k, sid, f=0, layer=None):
    d, M = k; s = M[sid]; im = Image.open(os.path.join(d, s["files"][layer or s["layers"][0]])).convert("RGBA")
    w = s["size"][0]; return im.crop((f * w, 0, (f + 1) * w, im.height))
def stacked(k, sid, f=0):
    im = frame(k, sid, f).copy()
    for l in k[1][sid]["layers"][1:]: im.alpha_composite(frame(k, sid, f, l))
    return im
def put(c, k, sid, col, row, f=0, img=None):
    im = img or stacked(k, sid, f); ax, ay = k[1][sid]["anchorPx"]
    c.alpha_composite(im, (int(col * T + T / 2 - ax) if k[1][sid]["anchorPx"] != [0, 0] and not k[1][sid].get("anchorTL") else int(col * T - ax), int((row + 1) * T - ay)))
def put_tl(c, k, sid, col, row, f=0):   # pieces anchored at the top-left of their cell
    im = stacked(k, sid, f); ax, ay = k[1][sid]["anchorPx"]; c.alpha_composite(im, (int(col * T - ax), int(row * T - ay)))
def put_bc(c, k, sid, col, row, f=0, w=1):   # pieces anchored at the bottom-centre of their cell(s)
    im = stacked(k, sid, f); ax, ay = k[1][sid]["anchorPx"]; c.alpha_composite(im, (int(col * T + T / 2 - ax), int((row + 1) * T - ay)))
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
PL = actor_img("player-character/sprites", "player.json", ["body", "gi", "belt", "belt-rim"], {"gi": "#ffffff", "belt": "#f08a2a", "belt-rim": "#f08a2a"})
def actor(c, a, col, row): c.alpha_composite(a[0], (int(col * T + T / 2 - a[1][0]), int((row + 0.8) * T - a[1][1])))

# suggested art placement per room: top-wall variants (by column), the prop for interior '#', flat decor, sign column
PLAN = {
    "ember-pantry":    dict(wall={2: "wall-shelf", 7: "wall-garlic", 13: "wall-shelf", 18: "wall-shelf"}, block="block-flour-sacks", flat={(3, 6): "flour-dust", (15, 7): "flour-dust"}, sign=8),
    "oven-row":        dict(wall={2: "wall-oven", 7: "wall-oven", 13: "wall-oven"}, lit=7, block="wall-block", sign=9),
    "long-table-hall": dict(wall={2: "wall-pots", 7: "wall-pots", 13: "wall-pots"}, block=["block-table", "block-table-bowls"], sign=9),
    "pin-lanes":       dict(wall={2: "wall-shelf", 13: "wall-garlic"}, block=["block-counter", "block-counter-tools", "block-counter"], flat={(9, 7): "flour-dust"}, sign=8, checks=True),
    "supper-rush":     dict(wall={11: "wall-clock", 2: "wall-pots", 18: "wall-pots"}, block="block-cart", sign=8, checks=True),
    "spice-cupboard":  dict(wall={1: "wall-shelf", 9: "wall-shelf"}, block="block-spice", sign=5),
    "warm-hearth":     dict(wall={1: "wall-pots", 9: "wall-garlic"}, block="block-flour-sacks", flat={(5, 5): "rug"}, sign=5),
    "great-hearth":    dict(wall={2: "wall-pots", 15: "wall-pots", 17: "wall-pots"}, giant=6, pot=12, side="block-table", flat={(9, 10): "rug"}, sign=3, sign2=16),
}
DOORS = ["battle", "challenge", "treasure", "rest"]
def room(r, k=K3):
    tiles = r["tiles"]; H, W = len(tiles), len(tiles[0]); P = PLAN[r["id"]]; top = 2
    c = Image.new("RGBA", (W * T, (H + top) * T), (24, 22, 32, 255))
    top_px = 0
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            put_tl(c, k, "floor-worn" if (x * 7 + y * 3) % 11 == 0 else ("floor-quad" if (x + y) % 2 else "floor-big"), x, y + top)
    for (x, y), sid in P.get("flat", {}).items(): put_tl(c, k, sid, x, y + top)
    if P.get("checks"):
        ov = Image.new("RGBA", c.size); d = ImageDraw.Draw(ov)
        cx, cy = 6.5 * T, (top + 7.5) * T; d.ellipse((cx - 70, cy - 70, cx + 70, cy + 70), fill=(230, 40, 40, 70), outline=(240, 50, 50, 230), width=4)
        y0 = (top + 2) * T + 10
        for i in range(0, (W - 2) * T, 40):
            d.rectangle((T + i, y0, T + i + 20, y0 + T - 20), fill=(150, 90, 220, 150) if (i // 40) % 2 else (255, 255, 255, 150))
        c.alpha_composite(ov)
    y = 0; door_i = 0
    skip = set()
    for x in range(W):           # top wall row
        ch = tiles[0][x]
        if x in skip: continue
        if P.get("giant") == x:
            put_tl(c, k, "wall-giant-oven", x, top, f=0); skip |= {x + 1, x + 2}; continue
        if ch == "D": put_tl(c, k, "wall-face", x, top)
        else:
            sid = P["wall"].get(x, "wall-face"); put_tl(c, k, sid, x, top, f=1 if (sid == "wall-oven" and P.get("lit") == x) else 0)
        if P.get("sign") == x or P.get("sign2") == x: put_tl(c, k, "sign-board", x, top)
    for x in range(W):
        if tiles[0][x] == "D":
            kind = "boss" if r["kind"] == "boss" else DOORS[door_i % 4]; door_i += 1
            if kind == "boss":
                put_bc(c, BD, "door-boss", x, top)
            else: put_bc(c, k, "door-" + kind, x, top)
    if P.get("pot") is not None: put_bc(c, k, "soup-pot", P["pot"], top)
    for y in range(1, H):
        n = 0
        for x in range(W):
            ch = tiles[y][x]
            if ch == "#":
                inner = 0 < x < W - 1 and y < H - 1
                if inner:
                    b = P["block"]; sid = b[n % len(b)] if isinstance(b, list) else b; n += 1
                    if sid == "wall-block": put_tl(c, k, sid, x, y + top)
                    else: put_bc(c, k, sid, x, y + top)
                elif P.get("side") and y in range(3, H - 3) and x in (0, W - 1): put_bc(c, k, P["side"], x, y + top)
                else: put_tl(c, k, "wall-block", x, y + top)
            elif ch == "C": put_bc(c, k, "bread-board" if r["kind"] == "boss" else "chest-closed", x, y + top)
            elif ch == "S": put_bc(c, k, "shrine", x, y + top)
            elif ch == "P": actor(c, PL, x, y + top)
    d = ImageDraw.Draw(c); d.text((8, 6), f'{r["name"]} ({r["kind"]})  sign: "{" / ".join(r.get("signs", []))}"', fill=(255, 220, 120, 255))
    return c
BDD = os.path.join(HERE, "..", "sprites"); BD = K3
imgs = []
for i, r in enumerate(DATA["rooms"]):
    im = room(r); im.save(os.path.join(OUT, f"room-{i + 1}-{r['id']}.png")); imgs.append(im)
half = [i.resize((i.width // 2, i.height // 2), Image.LANCZOS) for i in imgs]
cols = 2; rows = math.ceil(len(half) / cols); cw = max(i.width for i in half) + 10; rh = max(i.height for i in half) + 10
allim = Image.new("RGBA", (cw * cols + 10, rh * rows + 10), (46, 42, 58, 255))
for i, im in enumerate(half): allim.alpha_composite(im, (10 + (i % cols) * cw, 10 + (i // cols) * rh))
allim.save(os.path.join(OUT, "rooms-all.png"))
def strip(cells, scale, path, title, maxw=2400):
    S = [(l, im.resize((im.width * scale, im.height * scale), Image.NEAREST)) for l, im in cells]
    lines, cur, w = [], [], 10
    for l, i in S:
        if w + i.width + 10 > maxw and cur: lines.append(cur); cur, w = [], 10
        cur.append((l, i)); w += i.width + 10
    lines.append(cur); hs = [max(i.height for _, i in L) + 30 for L in lines]
    out = Image.new("RGBA", (maxw, sum(hs) + 24), (46, 42, 58, 255)); d = ImageDraw.Draw(out); d.text((10, 4), title, fill=(255, 220, 120, 255)); y = 24
    for L, h in zip(lines, hs):
        x = 10
        for l, i in L: out.alpha_composite(i, (x, y + h - i.height - 4)); d.text((x, y + 2), l, fill=(255, 255, 255, 255)); x += i.width + 10
        y += h
    out.save(path)
M = K3[1]; cells = []
for sid, s in M.items():
    if s.get("frames", 1) == 2: cells += [(sid + " 0", stacked(K3, sid, 0)), (sid + " 1", stacked(K3, sid, 1))]
    elif sid in ("chest-open",): cells += [(f"chest-open {i}", stacked(K3, sid, i)) for i in (0, 12, 19)]
    else: cells.append((sid, stacked(K3, sid, 0)))
strip(cells, 2, os.path.join(OUT, "kit-sheet-2x.png"), "Ember Kitchens kit, every sprite at 2x (2-frame pieces: 0 = closed/cold, 1 = open/lit)")
a = room(DATA["rooms"][0], K3)
def gif(frames, path, ms, scale=2):
    H = max(f.height for f in frames); W = max(f.width for f in frames); out = []
    for f in frames:
        c = Image.new("RGBA", (W, H), (46, 42, 58, 255)); c.alpha_composite(f, (0, H - f.height)); out.append(c.resize((W * scale, H * scale), Image.NEAREST))
    out[0].save(path, save_all=True, append_images=out[1:], duration=ms, loop=0)
gif([stacked(K3, "chest-closed", i) for i in range(12)] + [stacked(K3, "chest-open", i) for i in range(30)] + [stacked(K3, "chest-opened", i) for i in range(12)] * 3, os.path.join(OUT, "breadbox_open.gif"), round(1000 / 12))
gif([stacked(K3, "shrine", i) for i in range(8)] * 2, os.path.join(OUT, "warm-hearth_glow.gif"), 125)
pot = [stacked(K3, "soup-pot", 0).copy() for _ in range(8)]
for i, p in enumerate(pot):
    st = frame(K3, "soup-pot-steam", i, "soup-pot-steam"); base = Image.new("RGBA", st.size); base.alpha_composite(p, (0, st.height - p.height)); base.alpha_composite(st); pot[i] = base
gif(pot * 2, os.path.join(OUT, "soup-pot_bubble.gif"), 125)
print("wrote", OUT)
