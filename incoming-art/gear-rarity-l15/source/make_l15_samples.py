"""L15-A: three ways gear rarity could show on the player in a fight. Preview-only script (PIL + numpy).
Stacks the approved player (player-custom body A) with this folder's strike/idle layers (gi-trim, wraps, aura)
and draws game-size fight mocks (48 px tiles = 0.6 x art) for the Manager's art gate. Run from incoming-art/."""
import os, sys, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ART = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(ART, "cosmetics-a1", "source"))
import cosm_lib as C
L15 = os.path.join(ART, "gear-rarity-l15"); OUT = os.path.join(L15, "preview")
COS = C.Sheets(os.path.join(L15, "sprites", "body-a"))
AURA = C.Sheets(os.path.join(L15, "sprites", "body-a"), "aura.json")
TILE = 48; SC = TILE / 80
RAR = [("common", "Everyday", "#d8d2c4"), ("uncommon", "Special", "#5cd65c"), ("rare", "Rare", "#4ea3ff"),
       ("epic", "Epic", "#b46cff"), ("legendary", "Legendary", "#ffb02e")]
KID = dict(skin="#e3b08a", hair="#3a2a20", gi="#f6f6f4", face="face-01", hairStyle="hair-02", belt="Yellow")
D = "SE"; F = 4   # strike, facing south-east (front three-quarter, so the gi shows), impact frame
try: FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
except Exception: FONT = ImageFont.load_default()
def rgb(h): h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def neutral_wraps():
    """The cloth wraps are cream; make a light neutral copy so a multiply tint gives clean rarity colours."""
    px = COS.frame("wraps-cloth", "strike", D, F).copy()
    lum = (px[..., 0] * .3 + px[..., 1] * .59 + px[..., 2] * .11) / 0.82
    for i in range(3): px[..., i] = np.clip(lum, 0, 1)
    return px
def hero(sample, rk, col, anim="strike", d=D, f=F):
    extra = []
    if sample == "A" and rk != "common":
        extra = [("gi-trim", col)]
    im = C.compose(KID, anim, d, f, cos=COS, extra=extra)
    if sample == "A":   # wraps always on (gear in the hands slot); tinted by rarity, plain cloth for Everyday
        w = neutral_wraps() if (anim, d, f) == ("strike", D, F) else COS.frame("wraps-cloth", anim, d, f).copy()
        w[..., :3] *= C.hexrgb(col if rk != "common" else "#e6dcc6")
        base = np.asarray(im, dtype=np.float32) / 255; C.over(base, w)
        im = Image.fromarray((np.clip(base, 0, 1) * 255).astype(np.uint8), "RGBA")
    if sample == "B" and rk != "common":   # a coloured rim around the whole silhouette
        a = im.getchannel("A").point(lambda v: 255 if v > 90 else 0)
        n = {"uncommon": 3, "rare": 3, "epic": 4, "legendary": 4}[rk]
        rim = a.filter(ImageFilter.MaxFilter(2 * n + 1))
        layer = Image.new("RGBA", im.size, rgb(col) + (0,)); layer.putalpha(rim)
        if rk in ("epic", "legendary"):   # plus a soft outer glow so the top two read in greyscale too
            g = a.filter(ImageFilter.MaxFilter(2 * n + 3)).filter(ImageFilter.GaussianBlur(4))
            gl = Image.new("RGBA", im.size, rgb(col) + (0,)); gl.putalpha(g.point(lambda v: int(v * .7)))
            gl.alpha_composite(layer); layer = gl
        layer.alpha_composite(im); im = layer
        if rk == "legendary": sparkles(im, [(30, 40), (98, 60), (40, 110), (92, 120)], col, 5)
    return im
def star(draw, cx, cy, r, col, rays=4, inner=0.28, outline=(20, 18, 28, 255), w=1):
    pts = []
    for i in range(rays * 2):
        a = -math.pi / 2 + i * math.pi / rays; rr = r if i % 2 == 0 else r * inner
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    draw.polygon(pts, fill=col, outline=outline, width=w)
def sparkles(im, pts, col, r):
    d = ImageDraw.Draw(im)
    for x, y in pts: star(d, x, y, r, rgb(col) + (255,), outline=(255, 250, 230, 255))
def fist_point():
    """Where the striking fist is on the impact frame (the wraps pixel furthest along the strike)."""
    w = COS.frame("wraps-cloth", "strike", D, F)[..., 3] > 0.5
    ys, xs = np.nonzero(w); i = np.argmax(xs + ys); return xs[i] + 1, ys[i] + 1
def spark(rk, col):
    """Sample C: the hit spark at the fist, a bigger and brighter burst for higher rarities."""
    S = 4; im = Image.new("RGBA", ((128 + 2 * PAD) * S, (160 + 2 * PAD) * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    fx, fy = fist_point(); cx, cy = (fx + PAD) * S, (fy + PAD) * S
    r = {"common": 10, "uncommon": 13, "rare": 15, "epic": 17, "legendary": 20}[rk] * S
    rays = {"common": 4, "uncommon": 4, "rare": 6, "epic": 6, "legendary": 8}[rk]
    if rk in ("epic", "legendary"):
        halo = Image.new("RGBA", im.size, (0, 0, 0, 0)); hd = ImageDraw.Draw(halo)
        hd.ellipse((cx - r * 1.2, cy - r * 1.2, cx + r * 1.2, cy + r * 1.2), fill=rgb(col) + (120,))
        im.alpha_composite(halo.filter(ImageFilter.GaussianBlur(5 * S)))
    star(d, cx, cy, r, rgb(col) + (255,), rays=rays, inner=0.42, w=2 * S)
    star(d, cx, cy, r * 0.3, (255, 252, 240, 255), rays=rays, inner=0.5, outline=None)
    if rk == "legendary":
        for k, (dx, dy) in enumerate(((-16, -14), (6, -20), (14, 12), (-10, 16))):
            star(d, cx + dx * S, cy + dy * S, 4.5 * S, rgb(col) + (255,), outline=(255, 250, 230, 255), w=S)
    return im.resize((128 + 2 * PAD, 160 + 2 * PAD), Image.LANCZOS)
PAD = 32
def frame_with(sample, rk, col):
    im = hero(sample, rk, col)
    h = Image.new("RGBA", (128 + 2 * PAD, 160 + 2 * PAD), (0, 0, 0, 0)); h.alpha_composite(im, (PAD, PAD))
    if sample == "C": h.alpha_composite(spark(rk, col), (0, 0))
    return h   # padded: the anchor is (64 + PAD, 136.96 + PAD)

# ---- game-size scene pieces
TR = os.path.join(ART, "tower-rooms", "sprites"); TS = json.load(open(os.path.join(TR, "static.json")))["sprites"]
SW = os.path.join(ART, "enemies-tier1", "swarmer", "sprites"); SJ = json.load(open(os.path.join(SW, "swarmer.json")))
def scaled(im): return im.resize((max(1, round(im.width * SC)), max(1, round(im.height * SC))), Image.LANCZOS)
def put(cv, im, ax, ay, x, y): im = scaled(im); cv.alpha_composite(im, (round(x - ax * SC), round(y - ay * SC)))
def tile(name): return Image.open(os.path.join(TR, f"{name}_{name}.png")).convert("RGBA")
def swarmer(cv, x, y, anim, d, f):
    a = SJ["animations"][anim]; r = SJ["directions"].index(d)
    for ln in ("body", "glow", "light"):
        im = Image.open(os.path.join(SW, a["sheets"][ln])).convert("RGBA").crop((f * 128, r * 128, (f + 1) * 128, (r + 1) * 128))
        put(cv, im, 64, 104.96, x, y)
def room(w=667, h=375):
    cv = Image.new("RGBA", (w, h), (40, 36, 52, 255)); fl = tile("floor-big"); wf = tile("wall-face")
    for r in range(0, h // TILE + 2):
        for c in range(0, w // TILE + 2): put(cv, fl, 0, 0, c * TILE, r * TILE)
    for c in range(0, w // TILE + 2): put(cv, wf, 0, 104, c * TILE, TILE)
    return cv
def label(cv, text, x=8, y=6):
    d = ImageDraw.Draw(cv); tw = d.textlength(text, font=FONT)
    d.rounded_rectangle((x, y, x + tw + 12, y + 20), 8, fill=(20, 18, 28, 220)); d.text((x + 6, y + 3), text, font=FONT, fill=(255, 248, 230, 255))

TITLES = {"A": "Sample A: the gear itself changes colour (gi trim + hand wraps)",
          "B": "Sample B: a coloured outline around the student",
          "C": "Sample C: the hit spark takes the gear's colour"}
os.makedirs(OUT, exist_ok=True); scenes = {}
for s in "ABC":
    # 1) a fight at game size: Legendary hero hits a swarmer, a Rare classmate-looking second pose is NOT used; one hero only
    cv = room(); hx, hy = 290, 235
    swarmer(cv, 470, 320, "idle", "NW", 2); swarmer(cv, 336, 268, "hit", "NW", 1)
    rk, nm, col = RAR[4]
    put(cv, frame_with(s, rk, col), 64 + PAD, 136.96 + PAD, hx, hy)
    label(cv, TITLES[s]); label(cv, f"in a fight, wearing {nm} gear", 8, 348)
    cv.convert("RGB").save(os.path.join(OUT, f"sample-{s}-fight-667x375.png")); scenes[s] = cv
    # 2) the five rarities side by side at game size (1x) and 3x
    row = room(560, 160)
    for i, (rk, nm, col) in enumerate(RAR):
        x = 56 + i * 112
        put(row, frame_with(s, rk, col), 64 + PAD, 136.96 + PAD, x, 128)
        d = ImageDraw.Draw(row); tw = d.textlength(nm, font=FONT); d.text((x - tw / 2, 140), nm, font=FONT, fill=(255, 248, 230, 255))
    row.convert("RGB").save(os.path.join(OUT, f"sample-{s}-rarities-1x.png"))
    row.resize((row.width * 3, row.height * 3), Image.NEAREST).convert("RGB").save(os.path.join(OUT, f"sample-{s}-rarities-3x.png"))
    g = row.convert("L").convert("RGB"); g.save(os.path.join(OUT, f"sample-{s}-rarities-grey.png"))
# 3) one overview sheet: each sample's fight + its rarity row
W = 667; sheet = Image.new("RGB", (W * 3 + 40, 375 + 170 + 30), (232, 224, 206))
for i, s in enumerate("ABC"):
    sheet.paste(scenes[s].convert("RGB"), (10 + i * (W + 10), 10))
    r = Image.open(os.path.join(OUT, f"sample-{s}-rarities-1x.png")); sheet.paste(r, (10 + i * (W + 10) + (W - r.width) // 2, 395))
sheet.save(os.path.join(OUT, "overview-3-samples-1x.png")); print("ok")
