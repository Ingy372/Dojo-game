"""
Dojo Ascent - elite auras, FULL SET (Art Director bot), S1 #3 (approved by Jay) (Swift = gold, Guarding = blue).
    python3 elite-auras/source/make_auras.py      (from incoming-art/; Python 3 + Pillow)

Draws soft overlay layers (no Blender needed), 8 frames each, 256 x 256 per frame, ground point (128, 210)
= same frame size/anchor as the keeper; scale the sheet to the enemy's footprint (swarmer/shield 0.5, brute 0.8125).
  aura-<kind>_back.png  : behind the enemy (ground glow + back half of the motif)
  aura-<kind>_front.png : in front of the enemy (front half of the motif)
  (no head badges or floating sparkles: removed per Jay, they clutter a busy room)
Full set: also writes sprites/<enemy>/aura-<kind>_<layer>.png per tier-1 enemy (swarmer, shield, brute, keeper),
pre-scaled to that enemy's frame size with the ground point ON the enemy's anchor, so they stack 1:1 with the enemy frame.
Then writes the 3 sample previews into elite-auras/preview/.
"""
import os, math, json
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..", ".."); SP = os.path.join(HERE, "..", "sprites"); PV = os.path.join(HERE, "..", "preview")
N, F, AX, AY, SS = 8, 256, 128, 210, 4
GOLD, GOLD_D, BLUE, BLUE_D = (255, 211, 77), (214, 140, 20), (110, 190, 255), (40, 110, 210)
def layer(): return Image.new("RGBA", (F * SS, F * SS))
def down(im, blur=0):
    im = im.resize((F, F), Image.LANCZOS); return im.filter(ImageFilter.GaussianBlur(blur)) if blur else im
def ground(col, rx, ry, a):
    im = layer(); d = ImageDraw.Draw(im)
    for k in range(12, 0, -1):
        f = k / 12; d.ellipse(((AX - rx * f) * SS, (AY - ry * f) * SS, (AX + rx * f) * SS, (AY + ry * f) * SS), fill=col + (int(a * (1 - f) + 10),))
    return down(im, 2)
def swift(i):
    back, front = ground(GOLD, 92, 30, 120), layer(); bk = layer(); db, df = ImageDraw.Draw(bk), ImageDraw.Draw(front)
    for arc in range(3):  # 3 swooshes orbiting at three heights, tapering tails
        base = i / N * 2 * math.pi + arc * 2 * math.pi / 3; h = AY - 18 - arc * 34; rx, ry = 80 - arc * 6, 22 - arc * 3
        for s in range(26):
            t = base - s * 0.07; x, y = AX + math.cos(t) * rx, h + math.sin(t) * ry; w = (9 - s * 0.32) * SS
            if w <= 0: break
            col = (GOLD if s < 14 else GOLD_D) + (int(240 * (1 - s / 26)),)
            (df if math.sin(t) > 0 else db).ellipse((x * SS - w, y * SS - w, x * SS + w, y * SS + w), fill=col)
    # (no sparkles drifting above the head: they read as badges in a busy room; removed after Jay's review)
    back.alpha_composite(down(bk, 0.6)); return back, down(front, 0.6)
def guarding(i):
    pulse = 0.5 + 0.5 * math.sin(i / N * 2 * math.pi); back = ground(BLUE, 96, 32, 110 + int(50 * pulse))
    dome = layer(); d = ImageDraw.Draw(dome); R, H = 92 + 3 * pulse, 168
    for k in range(10, 0, -1):  # soft dome: filled half-ellipse fading toward the centre
        f = k / 10; d.ellipse(((AX - R * f) * SS, (AY - H * f) * SS, (AX + R * f) * SS, (AY + H * 0.36 * f) * SS), fill=BLUE + (int((18 + 24 * pulse) * f),))
    back.alpha_composite(down(dome, 3))
    fr = layer(); d = ImageDraw.Draw(fr); w = int((4 + 2 * pulse) * SS)
    box = ((AX - R) * SS, (AY - H) * SS, (AX + R) * SS, (AY + H * 0.36) * SS)
    d.arc(box, 180, 360, fill=(200, 230, 255, int(150 + 80 * pulse)), width=w)      # dome rim, top
    d.arc(((AX - R) * SS, (AY - 30) * SS, (AX + R) * SS, (AY + 30) * SS), 0, 180, fill=BLUE + (int(170 + 60 * pulse),), width=w)  # ground ring, front half
    bk = layer(); ImageDraw.Draw(bk).arc(((AX - R) * SS, (AY - 30) * SS, (AX + R) * SS, (AY + 30) * SS), 180, 360, fill=BLUE + (int(120 + 60 * pulse),), width=w)
    back.alpha_composite(down(bk, 0.6)); return back, down(fr, 0.8)
meta = {"note": "S1 #3 elite auras, full set (Jay approved). 8 frames, loop at 10 fps. Draw order: back -> enemy -> front. Use the per-enemy entries (same frame size + anchor as the enemy); the 256 masters are kept for reference.", "sprites": {}}
EN = ["swarmer", "shield", "brute", "keeper"]
SCALE = {"swarmer": 0.5, "shield": 0.5, "brute": 0.8125, "keeper": 1.0}
for kind, fn in (("swift", swift), ("guarding", guarding)):
    fr = [fn(i) for i in range(N)]
    for li, ln in ((0, "back"), (1, "front")):
        sh = Image.new("RGBA", (F * N, F))
        for i, f in enumerate(fr): sh.alpha_composite(f[li], (i * F, 0))
        sh.save(os.path.join(SP, f"aura-{kind}_{ln}.png"))
    meta["sprites"][f"aura-{kind}"] = {"files": {"back": f"aura-{kind}_back.png", "front": f"aura-{kind}_front.png"}, "layers": ["back", "front"], "size": [F, F], "anchorPx": [AX, AY], "frames": N, "fps": 10, "master": True}
    for e in EN:
        J = json.load(open(os.path.join(ROOT, "enemies-tier1", e, "sprites", f"{e}.json"))); fw, fh = J["frameWidth"], J["frameHeight"]; ax, ay = J["anchor"]["x"], J["anchor"]["y"]
        s = SCALE[e]; os.makedirs(os.path.join(SP, e), exist_ok=True); files = {}
        for li, ln in ((0, "back"), (1, "front")):
            sh = Image.new("RGBA", (fw * N, fh))
            for i, f in enumerate(fr):
                a = f[li].resize((round(F * s), round(F * s)), Image.LANCZOS); cell = Image.new("RGBA", (fw, fh))
                cell.alpha_composite(a, (round(ax - AX * s), round(ay - AY * s))); sh.alpha_composite(cell, (i * fw, 0))
            sh.save(os.path.join(SP, e, f"aura-{kind}_{ln}.png")); files[ln] = f"{e}/aura-{kind}_{ln}.png"
        meta["sprites"][f"aura-{kind}-{e}"] = {"enemy": e, "files": files, "layers": ["back", "front"], "size": [fw, fh], "anchorPx": [ax, ay], "frames": N, "fps": 10}
json.dump(meta, open(os.path.join(SP, "static.json"), "w"), indent=2)
# ---- previews ----
def enemy(e, f=0):
    J = json.load(open(os.path.join(ROOT, "enemies-tier1", e, "sprites", f"{e}.json"))); fw, fh = J["frameWidth"], J["frameHeight"]; row = J["directions"].index("S")
    im = Image.new("RGBA", (fw, fh))
    for l in ("body", "shield", "glow", "light"):
        p = os.path.join(ROOT, "enemies-tier1", e, "sprites", f"{e}_{l}_idle.png")
        if os.path.exists(p):
            s = Image.open(p).convert("RGBA"); n = s.width // fw; im.alpha_composite(s.crop(((f % n) * fw, row * fh, (f % n + 1) * fw, (row + 1) * fh)))
    return im, (J["anchor"]["x"], J["anchor"]["y"])
sheet = lambda k, l, i, size: Image.open(os.path.join(SP, f"{k}_{l}.png" if l else f"{k}.png")).convert("RGBA").crop((i * size, 0, (i + 1) * size, size))
TILE = Image.open(os.path.join(ROOT, "tower-rooms-t2", "sprites", "floor-big_floor-big.png")).convert("RGBA")
def floor(w, h):
    c = Image.new("RGBA", (w, h))
    for y in range(0, h, TILE.height):
        for x in range(0, w, TILE.width): c.alpha_composite(TILE, (x, y))
    return c
def draw(c, e, kind, x, y, i):
    im, (ax, ay) = enemy(e, i); s = SCALE[e]
    if kind:
        a = sheet(f"aura-{kind}", "back", i, F); a = a.resize((int(F * s), int(F * s)), Image.LANCZOS); c.alpha_composite(a, (int(x - AX * s), int(y - AY * s)))
    c.alpha_composite(im, (int(x - ax), int(y - ay)))
    if kind:
        a = sheet(f"aura-{kind}", "front", i, F).resize((int(F * s), int(F * s)), Image.LANCZOS); c.alpha_composite(a, (int(x - AX * s), int(y - AY * s)))
def grid(i):
    W, H = 4 * 240, 3 * 280; c = floor(W, H); d = ImageDraw.Draw(c)
    for r, kind in enumerate((None, "swift", "guarding")):
        for k, e in enumerate(EN): draw(c, e, kind, 120 + k * 240, 230 + r * 280, i)
        d.text((8, 8 + r * 280), ("normal", "Swift (gold)", "Guarding (blue)")[r], fill=(60, 40, 20, 255))
    return c
grid(0).save(os.path.join(PV, "sample-1-all-enemies.png"))
# sample 2: phone-size room (390 px wide screen, tiles at ~43 px): one Swift brute, one Guarding shield, normal swarmers
def room(i, scale=1.0):
    W, H = 720, 520; c = floor(W, H)
    for e, k, x, y in (("swarmer", None, 140, 200), ("swarmer", None, 560, 230), ("shield", "guarding", 230, 400), ("brute", "swift", 480, 430), ("swarmer", None, 380, 220)): draw(c, e, k, x, y, i)
    return c
r = room(0); ph = Image.new("RGBA", (390, 844), (24, 22, 32, 255)); ph.alpha_composite(r.resize((390, int(520 * 390 / 720)), Image.LANCZOS), (0, 300))
side = Image.new("RGBA", (390 * 2 + 30, 844), (46, 42, 58, 255)); side.alpha_composite(ph, (10, 0)); g = ph.convert("L").convert("RGBA"); side.alpha_composite(g, (420, 0))
ImageDraw.Draw(side).text((430, 10), "greyscale check", fill=(255, 255, 255, 255)); side.save(os.path.join(PV, "sample-2-phone-size.png"))
# sample 3: animated GIF of the room
fr = [room(i).resize((540, 390), Image.LANCZOS) for i in range(N)] * 2
fr[0].save(os.path.join(PV, "sample-3-room.gif"), save_all=True, append_images=fr[1:], duration=100, loop=0)
print("done")
