"""Old walk vs new run, side by side, with the game's tints (Claude, 2026-11-18).

    python incoming-art/claude-run/source/make_run_compare.py

Writes preview/run-compare.gif (both playing at the design speed 4.5 tiles/s over a floor that
scrolls at the same speed, so planted feet should look still) and preview/run-compare-frames.png.
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD = os.path.join(ROOT, "..", "player-custom", "sprites", "body-a")
NEW = os.path.join(ROOT, "sprites", "body-a")
TINT = {"skin": "#e0a984", "hair-02": "#3a2519", "gi": "#f2f2f2", "belt": "#f5d22e", "belt-rim": "#2e2a3a"}
LAYERS = ["body", "skin", "gi", "belt", "belt-rim", "face-01", "hair-02"]
DIRS = ["E", "SE", "S", "NE"]
SCALE = 2
CLOCK = 36  # the run plays at 36 fps
BG = (46, 42, 58)

def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255

def load(folder):
    meta = json.load(open(os.path.join(folder, "player-a.json")))
    an = meta["animations"]["walk"]
    W, H = meta["frameWidth"], meta["frameHeight"]
    sheets = {}
    for l in LAYERS:
        a = np.asarray(Image.open(os.path.join(folder, an["sheets"][l])).convert("RGBA")).astype(np.float32) / 255
        if l in TINT:
            a[..., :3] *= hexrgb(TINT[l])
        sheets[l] = a
    return meta, an, W, H, sheets

def frame(src, d, f):
    meta, an, W, H, sheets = src
    r = meta["directions"].index(d)
    out = np.zeros((H, W, 4), np.float32)
    for l in LAYERS:
        p = sheets[l][r * H:(r + 1) * H, f * W:(f + 1) * W]
        a = p[..., 3:4]
        out[..., :3] = p[..., :3] * a + out[..., :3] * (1 - a)
        out[..., 3:4] = a + out[..., 3:4] * (1 - a)
    return Image.fromarray((out * 255).astype(np.uint8), "RGBA").resize((W * SCALE, H * SCALE), Image.NEAREST)

old, new = load(OLD), load(NEW)
W, H = new[2] * SCALE, new[3] * SCALE
font = ImageFont.load_default(size=22) if hasattr(ImageFont, "load_default") else None
small = ImageFont.load_default(size=16)
PAD = 40
sheet_w = len(DIRS) * W
canvas_w, canvas_h = sheet_w + 20, 2 * (H + PAD) + 10
px_tile = 80 * SCALE
speed = 4.5  # tiles per second

def draw_floor(img, y0, t, d):
    dr = ImageDraw.Draw(img)
    vec = {"E": (1, 0), "SE": (0.707, 0.707), "S": (0, 1), "NE": (0.707, -0.707)}
    for i, dd in enumerate(DIRS):
        vx, vy = vec[dd]
        x0 = 10 + i * W
        off_x = -(t * speed * px_tile * vx) % (px_tile / 2)
        off_y = -(t * speed * px_tile * vy * 0.574) % (px_tile * 0.574 / 2)
        for k in range(-1, int(W / (px_tile / 2)) + 2):
            x = x0 + off_x + k * px_tile / 2
            if x0 <= x < x0 + W:
                dr.line([(x, y0 + H * 0.70), (x, y0 + H)], fill=(60, 55, 76))
        for k in range(-1, 8):
            y = y0 + H * 0.70 + off_y + k * px_tile * 0.574 / 2
            if y0 + H * 0.70 <= y < y0 + H:
                dr.line([(x0, y), (x0 + W - 4, y)], fill=(60, 55, 76))

frames = []
seconds = 2.0
for n in range(int(seconds * CLOCK)):
    t = n / CLOCK
    img = Image.new("RGB", (canvas_w, canvas_h), BG)
    dr = ImageDraw.Draw(img)
    for row, (src, label) in enumerate(((old, "NOW IN THE GAME  (stiff jog, fists at the hips)"), (new, "NEW RUN DRAFT  (lean, arm pump, knee drive, flight)"))):
        y0 = row * (H + PAD) + PAD
        dr.text((12, y0 - 30), label, fill=(245, 210, 110), font=font)
        draw_floor(img, y0, t, None)
        an = src[1]
        f = int(t * an["fps"]) % an["frames"]
        for i, d in enumerate(DIRS):
            fr = frame(src, d, f)
            img.paste(fr, (10 + i * W, y0), fr)
            dr.text((14 + i * W, y0 + 4), d, fill=(170, 165, 190), font=small)
    frames.append(img)
out = os.path.join(ROOT, "preview")
os.makedirs(out, exist_ok=True)
frames[0].save(os.path.join(out, "run-compare.gif"), save_all=True, append_images=frames[1:],
               duration=int(1000 / CLOCK * 1.0) or 17, loop=0, optimize=True)

# every frame, E and SE, both renders
fw = max(old[1]["frames"], new[1]["frames"])
strip = Image.new("RGB", (fw * W + 20, 4 * (H + 30) + 10), BG)
ds = ImageDraw.Draw(strip)
y = 30
for src, label in ((old, "now (10 frames)"), (new, "new (12 frames)")):
    for d in ("E", "SE"):
        ds.text((12, y - 26), f"{label}  {d}", fill=(245, 210, 110), font=small)
        for f in range(src[1]["frames"]):
            fr = frame(src, d, f)
            strip.paste(fr, (10 + f * W, y), fr)
        y += H + 30
strip.save(os.path.join(out, "run-compare-frames.png"))
print("wrote", out)
