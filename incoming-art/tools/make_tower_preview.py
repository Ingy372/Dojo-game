"""
Dojo Ascent - Tower kit previews (Art Director bot).

    python3 make_tower_preview.py --sprites tower-rooms/sprites --out tower-rooms/preview

Writes:
- review-1-tiled-room.png: a mock 9x6 room tiled from the kit, with the 4 doors (rest shown open), a chest and the shrine.
- review-2-doors-2x.png: the 4 doors (closed and open) plus the separate icon sprites, at 2x.
- review-3-chest-and-shrine-2x.png: the chest frames and the shrine glow frames, at 2x.
- chest_open.gif, shrine_glow.gif and the still chest-open.png (the last chest frame).
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
put(room, "chest", 2, top + 3, f=6); put(room, "shrine", 6, top + 3); put(room, "shrine", 6, top + 3, layer="shrine-glow")
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
strip(cells, 2, os.path.join(a.out, "review-2-doors-2x.png"), "Tower doors (closed / open) with icons, 2x")

ch = [(f"chest {i}", frame("chest", i)) for i in range(M["chest"]["frames"])]
sh = []
for i in range(M["shrine"]["frames"]):
    im = frame("shrine", i); im.alpha_composite(frame("shrine", i, "shrine-glow")); sh.append((f"shrine {i}", im))
strip(ch + sh[::2], 2, os.path.join(a.out, "review-3-chest-and-shrine-2x.png"), "Chest opening (frames 0-6) and shrine glow (every 2nd frame), 2x")
frame("chest", 6).save(os.path.join(a.out, "chest-open.png"))
def gif(frames, path, ms):
    bg = [Image.alpha_composite(Image.new("RGBA", f.size, (46, 42, 58, 255)), f).resize((f.width * 3, f.height * 3), Image.NEAREST) for f in frames]
    bg[0].save(path, save_all=True, append_images=bg[1:], duration=ms, loop=0)
gif([f for _, f in ch] + [ch[-1][1]] * 6, os.path.join(a.out, "chest_open.gif"), 100)
gif([f for _, f in sh], os.path.join(a.out, "shrine_glow.gif"), 125)
print("wrote previews to", a.out)
