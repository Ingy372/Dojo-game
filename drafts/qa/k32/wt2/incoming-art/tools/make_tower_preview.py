"""
Dojo Ascent - Tower kit previews (Art Director bot).

    python3 make_tower_preview.py --sprites tower-rooms/sprites --out tower-rooms/preview

Writes:
- review-1-tiled-room.png: a mock 9x6 room tiled from the kit, with the 4 doors (rest shown open), a chest and the shrine.
- review-2-doors-2x.png: the 4 doors (closed and open) plus the separate icon sprites, at 2x.
- review-3-chest-and-shrine-2x.png: the chest's key frames and the shrine glow, at 2x.
- chest_closed_idle.gif, chest_open.gif (closed idle, the opening, then the open idle), shrine_glow.gif,
  and the still chest-open.png (open idle frame 0).
- door-closeup-3x.png: the four doors, closed, at 3x, to check the medallions.
Needs Python 3 with Pillow.
"""
import argparse, json, os
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(); ap.add_argument("--sprites", required=True); ap.add_argument("--out", required=True)
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
M = json.load(open(os.path.join(a.sprites, "static.json")))["sprites"]
T = 80
def sheet(sid, layer=None):
    s = M[sid]; return Image.open(os.path.join(a.sprites, s["files"][layer or list(s["files"])[0]])).convert("RGBA")
def frame(sid, f=0, layer=None):
    im = sheet(sid, layer); w = M[sid]["size"][0]; return im.crop((f * w, 0, (f + 1) * w, im.height))
def put(canvas, sid, col, row, f=0, layer=None):
    """col,row = the tile whose bottom-centre the anchor sits on (0-based, room space)."""
    im = frame(sid, f, layer); ax, ay = M[sid]["anchorPx"]
    canvas.alpha_composite(im, (int(col * T + T / 2 - ax), int((row + 1) * T - ay)))

# 1. tiled room
W, H = 9, 6; top = 2
room = Image.new("RGBA", (W * T, (H + top) * T), (24, 22, 32, 255))
for r in range(H):
    for c in range(W):
        k = "floor-worn" if (c * 7 + r * 3) % 11 == 0 else ("floor-quad" if (c + r) % 2 else "floor-big")
        put(room, k, c, r + top)
for c in range(W):
    put(room, "wall-face", c, top - 1)
for i, d in enumerate(("battle", "challenge", "treasure", "rest")):
    c = 1 + i * 2
    put(room, "door-" + d, c, top, f=1 if d == "rest" else 0)   # bottom on the wall's foot line
put(room, "pillar", 0, top + 1); put(room, "pillar", W - 1, top + 1)
[put(room, "chest-opened", 2, top + 3, f=0, layer=l) for l in M["chest-opened"]["layers"]]; put(room, "shrine", 6, top + 3); put(room, "shrine", 6, top + 3, layer="shrine-glow")
for c in range(W):
    put(room, "wall-block", c, top + H)
room.save(os.path.join(a.out, "review-1-tiled-room.png"))

def strip(cells, scale, path, title):
    S = [(l, im.resize((im.width * scale, im.height * scale), Image.NEAREST)) for l, im in cells]
    w = sum(i.width + 10 for _, i in S) + 10; h = max(i.height for _, i in S) + 40
    out = Image.new("RGBA", (w, h), (46, 42, 58, 255)); d = ImageDraw.Draw(out); x = 10
    d.text((10, 4), title, fill=(255, 220, 120, 255))
    for l, i in S:
        out.alpha_composite(i, (x, 24)); d.text((x, 14), l, fill=(255, 255, 255, 255)); x += i.width + 10
    out.save(path)

cells = []
for d in ("battle", "challenge", "treasure", "rest"):
    for f in (0, 1):
        cells.append((f"{d} {'open' if f else 'closed'}", frame("door-" + d, f)))
    cells.append((f"icon-{d} (separate)", frame("icon-" + d)))
strip([(l, frame("door-" + d, 0)) for d in ("battle", "challenge", "treasure", "rest") for l in [d]], 3, os.path.join(a.out, "door-closeup-3x.png"), "Door medallions, closed, 3x")
strip(cells, 2, os.path.join(a.out, "review-2-doors-2x.png"), "Tower doors (closed / open) with icons, 2x")

def stacked(sid, f):
    im = frame(sid, f, M[sid]["layers"][0]).copy()
    for l in M[sid]["layers"][1:]: im.alpha_composite(frame(sid, f, l))
    return im
seq = {k: [stacked(k, i) for i in range(M[k]["frames"])] for k in ("chest-closed", "chest-open", "chest-opened")}
ch = [(f"open {i}", seq["chest-open"][i]) for i in (0, 6, 11, 12, 13, 14, 16, 19, 23, 29)] + [("opened idle", seq["chest-opened"][0])]
sh = []
for i in range(M["shrine"]["frames"]):
    im = frame("shrine", i); im.alpha_composite(frame("shrine", i, "shrine-glow")); sh.append((f"shrine {i}", im))
strip(ch + sh[::4], 2, os.path.join(a.out, "review-3-chest-and-shrine-2x.png"), "Chest opening (key frames: wiggle, burst, beam, stars, settled) and shrine glow, 2x")
seq["chest-opened"][0].save(os.path.join(a.out, "chest-open.png"))
def gif(frames, path, ms, scale=2):
    bg = [Image.alpha_composite(Image.new("RGBA", f.size, (46, 42, 58, 255)), f).resize((f.width * scale, f.height * scale), Image.NEAREST) for f in frames]
    bg[0].save(path, save_all=True, append_images=bg[1:], duration=ms, loop=0)
H = seq["chest-open"][0].height
def pad(im):     # closed sheets are shorter: pad on top so the chest stays in place
    c = Image.new("RGBA", (im.width, H)); c.alpha_composite(im, (0, H - im.height)); return c
ms = round(1000 / 12)
gif([pad(f) for f in seq["chest-closed"]] * 3, os.path.join(a.out, "chest_closed_idle.gif"), ms)
gif([pad(f) for f in seq["chest-closed"]] + seq["chest-open"] + seq["chest-opened"] * 3, os.path.join(a.out, "chest_open.gif"), ms)
gif([f for _, f in sh], os.path.join(a.out, "shrine_glow.gif"), 125)
print("wrote previews to", a.out)
