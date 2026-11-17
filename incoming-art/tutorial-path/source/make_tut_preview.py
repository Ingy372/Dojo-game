"""TUT-A1 previews at game size (48 px tiles, so the hero is about 35-40 px tall), plus 3x zooms.
    python3 incoming-art/tutorial-path/source/make_tut_preview.py
The red circle in these mocks is drawn here only to show where the game's own warning circle goes; it is not an asset."""
import json, os
from PIL import Image, ImageDraw, ImageFont, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__)); ART = os.path.join(HERE, "..", "..")
SP = os.path.join(HERE, "..", "sprites"); OUT = os.path.join(HERE, "..", "preview")
T1 = os.path.join(ART, "tower-rooms", "sprites"); PL = os.path.join(ART, "player-character", "sprites")
TILE = 48; SC = TILE / 80
m = json.load(open(os.path.join(SP, "static.json")))["sprites"]
t1 = json.load(open(os.path.join(T1, "static.json")))["sprites"]
pj = json.load(open(os.path.join(PL, "player.json")))
FONT = "/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf"
def font(n):
    f = ImageFont.truetype(FONT, n); f.set_variation_by_name("ExtraBold"); return f
def frame(meta, root, name, layer, f=0):
    e = meta[name]; im = Image.open(os.path.join(root, e["files"][layer])).convert("RGBA")
    fw = e.get("frameWidth", e["size"][0]); return im.crop((f * fw, 0, (f + 1) * fw, im.height)), e
def scaled(im): return im.resize((max(1, round(im.width * SC)), max(1, round(im.height * SC))), Image.LANCZOS)
def put(canvas, im, ax, ay, x, y):
    im = scaled(im); canvas.alpha_composite(im, (round(x - ax * SC), round(y - ay * SC)))
def sprite(canvas, name, x, y, f=0, layers=None, meta=m, root=SP):
    e = meta[name]
    for ln in (layers or e["layers"]):
        im, _ = frame(meta, root, name, ln, f); put(canvas, im, e["anchorPx"][0], e["anchorPx"][1], x, y)
def tint(im, rgb):
    r, g, b = [Image.new("L", im.size, c) for c in rgb]
    t = ImageChops.multiply(im.convert("RGB"), Image.merge("RGB", (r, g, b))).convert("RGBA"); t.putalpha(im.getchannel("A")); return t
GI = (250, 250, 250); BELT = (250, 250, 248)
def hero(canvas, x, y, anim="idle", d="S", f=0):
    a = pj["animations"][anim]; row = pj["directions"].index(d)
    for ln in ("body", "gi", "belt", "belt-rim"):
        im = Image.open(os.path.join(PL, a["sheets"][ln])).convert("RGBA")
        cell = im.crop((f * 128, row * 160, (f + 1) * 128, (row + 1) * 160))
        if ln == "gi": cell = tint(cell, GI)
        if ln == "belt": cell = tint(cell, BELT)
        put(canvas, cell, pj["anchor"]["x"], pj["anchor"]["y"], x, y)
def red_circle(canvas, x, y, r, fill):
    """Approximation of the game's own warning circle (fills from the middle). Mock only."""
    lay = Image.new("RGBA", canvas.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    ry = r * 0.82
    d.ellipse([x - r, y - ry, x + r, y + ry], fill=(255, 59, 48, 60), outline=(255, 59, 48, 230), width=2)
    d.ellipse([x - r * fill, y - ry * fill, x + r * fill, y + ry * fill], fill=(255, 59, 48, 120))
    canvas.alpha_composite(lay)
def tiles(canvas, cols, rows, pick, ox=0, oy=0):
    for r in range(rows):
        for c in range(cols):
            nm, meta, root = pick(c, r)
            im, e = frame(meta, root, nm, e_layer(meta, nm)); canvas.alpha_composite(scaled(im), (ox + c * TILE, oy + r * TILE))
def e_layer(meta, nm): return meta[nm]["layers"][0]
W, H = 667, 375

def label(canvas, text):
    d = ImageDraw.Draw(canvas); f = font(13); w = d.textlength(text, font=f)
    d.rounded_rectangle([8, 8, 20 + w, 30], 8, fill=(40, 30, 20, 190)); d.text((14, 11), text, font=f, fill=(255, 246, 220))

# ---- BEFORE: today the tutorial opens in the First Steps Hall (Tier 1 stone room) and there are no stones or dummies yet
def before():
    cv = Image.new("RGBA", (W, H), (30, 30, 36, 255)); cols, rows = W // TILE + 1, H // TILE + 1
    tiles(cv, cols, rows, lambda c, r: (("floor-quad" if (c * 7 + r * 3) % 5 == 0 else "floor-big"), t1, T1), 0, TILE)
    for c in range(cols):
        im, e = frame(t1, T1, "wall-face", "wall-face"); cv.alpha_composite(scaled(im), (c * TILE, round(TILE - e["anchorPx"][1] * SC + 0)))
    hero(cv, W // 2, H // 2 + 60, "idle", "N")
    label(cv, "BEFORE: today the tutorial starts in this hall. No path, stones or dummies yet")
    return cv

# ---- AFTER 1: the Tower Path with a falling-stone wave
def path_room(stage):
    cv = Image.new("RGBA", (W, H), (0, 0, 0, 255)); cols, rows = W // TILE + 1, H // TILE + 2
    pc = cols // 2
    def pick(c, r):
        if c == pc - 1: return "path-edge-w", m, SP
        if c == pc: return "path", m, SP
        if c == pc + 1: return "path-edge-e", m, SP
        return ("grass-flowers" if (c * 5 + r * 7) % 6 == 0 else "grass"), m, SP
    tiles(cv, cols, rows, pick)
    cx = pc * TILE + TILE // 2
    for c in list(range(0, pc - 3)) + list(range(pc + 4, cols)):
        sprite(cv, "hedge-face", c * TILE, 2 * TILE)
    sprite(cv, "tower-foot", cx, 3 * TILE)
    for (c, r, nm) in ((1, 4, "decor-tree"), (12, 4, "decor-tree"), (3, 5, "decor-bush"), (10, 6, "decor-rocks"), (1, 7, "decor-bush"), (12, 7, "decor-rocks"), (13, 5, "decor-bush")):
        sprite(cv, nm, c * TILE + TILE / 2, r * TILE + TILE * 0.6)
    if stage == "wave":
        # wave 2: two circles filling, one stone mid-fall, one just landed with dust; the hero steps out
        red_circle(cv, cx - 30, 4.9 * TILE, 26, 0.75)
        sprite(cv, "stone", cx - 30, 4.9 * TILE - 70)
        sprite(cv, "stone-land", cx + 40, 6.3 * TILE, f=3)
        hero(cv, cx + 30, 5.2 * TILE, "walk", "E", 3)
        label(cv, "AFTER: Tower Path. Stones fall into the red circle; step out")
    else:
        sprite(cv, "stone-land", cx + 26, 5.8 * TILE, f=3)
        hero(cv, cx, 5.75 * TILE, "hit", "S", 2)
        sprite(cv, "stumble-stars", cx, 5.75 * TILE - 46)
        label(cv, "AFTER: stayed in the circle: a short stumble with stars, no harm")
    return cv

# ---- AFTER 2: Training Hall dummies (on the Tier 1 floor the hall uses)
def hall():
    cv = Image.new("RGBA", (W, H), (30, 30, 36, 255)); cols, rows = W // TILE + 1, H // TILE + 1
    tiles(cv, cols, rows, lambda c, r: (("floor-quad" if (c * 7 + r * 3) % 5 == 0 else "floor-big"), t1, T1), 0, TILE)
    for c in range(cols):
        im, e = frame(t1, T1, "wall-face", "wall-face"); cv.alpha_composite(scaled(im), (c * TILE, round(TILE - e["anchorPx"][1] * SC)))
    sprite(cv, "dummy-small-idle", 3.5 * TILE, 4.6 * TILE)
    sprite(cv, "dummy-small-hit", 6.5 * TILE, 3.8 * TILE, f=1)
    sprite(cv, "dummy-small-defeat", 9.5 * TILE, 4.6 * TILE, f=8)
    sprite(cv, "dummy-big-idle", 11.6 * TILE, 3.6 * TILE)
    hero(cv, 6.5 * TILE, 4.9 * TILE, "strike", "N", 3)
    label(cv, "AFTER: Training Hall. Small dummies, then the big one for STRIKE")
    return cv

def zoom(im, k=3): return im.resize((im.width * k, im.height * k), Image.NEAREST)
shots = {"before-first-hall-667x375.png": before(), "after-tower-path-wave-667x375.png": path_room("wave"),
         "after-tower-path-stumble-667x375.png": path_room("stumble"), "after-training-hall-667x375.png": hall()}
for n, im in shots.items(): im.convert("RGB").save(os.path.join(OUT, n))

# ---- game-size strip: every new piece at 48 px tiles, next to the hero for scale, then 3x
strip = Image.new("RGBA", (560, 130), (0, 0, 0, 255))
tiles(strip, 12, 3, lambda c, r: ("grass", m, SP))
hero(strip, 40, 100)
for x, nm, f in ((100, "stone", 0), (150, "stone-land", 2), (215, "dummy-small-idle", 0), (290, "dummy-big-idle", 0), (380, "dummy-small-defeat", 8)):
    sprite(strip, nm, x, 100, f=f)
hero(strip, 460, 100, "hit", "S", 2); sprite(strip, "stumble-stars", 460, 100 - 46)
strip.convert("RGB").save(os.path.join(OUT, "game-size-strip-1x.png")); zoom(strip).convert("RGB").save(os.path.join(OUT, "game-size-strip-3x.png"))

# ---- before/after sheet at 1x (the Manager's art gate)
sheet = Image.new("RGB", (W * 2 + 30, H * 2 + 30), (250, 246, 238))
for i, n in enumerate(shots):
    sheet.paste(shots[n].convert("RGB"), (10 + (i % 2) * (W + 10), 10 + (i // 2) * (H + 10)))
sheet.save(os.path.join(OUT, "before-after-1x.png"))

# ---- animation strips (each frame at 1x art size, on grass) for the stone, dummies and stars
def anim_strip(name, layers=None, bg="grass"):
    e = m[name]; n = e.get("frames", 1); fw, fh = e["size"]
    im = Image.new("RGBA", (fw * n, fh), (0, 0, 0, 0))
    for f in range(n):
        g = Image.new("RGBA", (fw, fh), (126, 196, 96, 255))
        for ln in (layers or e["layers"]):
            fr, _ = frame(m, SP, name, ln, f); g.alpha_composite(fr)
        im.paste(g, (f * fw, 0))
    return im
for nm in ("stone-land", "dummy-small-hit", "dummy-small-defeat", "dummy-big-hit", "dummy-big-defeat", "stumble-stars"):
    anim_strip(nm).convert("RGB").save(os.path.join(OUT, f"anim-{nm}.png"))
print("ok")
