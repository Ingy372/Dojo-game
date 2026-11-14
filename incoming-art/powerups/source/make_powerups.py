"""
Dojo Ascent - OV-A1: icons for the 4 new Power-ups in drafts/planning/R-POWERUPS-15.md (Art Director bot).
Same approved Power-up (Insight) icon style as incoming-art/icons/source/make_insights_v2.py:
glowing scroll (two wooden rods, cream paper, accent edge, accent rod caps) + one big symbol, own accent colour, no red, no text.
Run from incoming-art/:  python3 powerups/source/make_powerups.py   [OLD_ICONS=<dir with the 9 existing icon-*.png> for context rows]
Writes sprites/icon-<id>.png (128 x 128) and icon-<id>@2x.png (256 x 256), anchor = centre; preview/*.png.
"""
import os, json
from PIL import Image, ImageDraw, ImageFilter, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); SP = os.path.join(HERE, "..", "sprites"); PV = os.path.join(HERE, "..", "preview")
SS = 8                                   # supersample from the 128 design grid
INK, PAPER, WOOD = (58, 42, 34), (252, 244, 224), (150, 98, 52)
def s(v): return int(round(v * SS))
# id: (accent, symbol, what it shows). Accents differ in hue/brightness from the 9 existing Power-ups.
KEY = [
    ("calm-breath",   (226, 96, 196),  "breath",  "three calm breath swirls (Quiet Mind: Focus fills faster)"),
    ("steady-start",  (88, 100, 214),  "orb",     "a Focus orb already glowing (Warm Up: start every room with some Focus)"),
    ("lighter-strike",(120, 196, 250), "feather", "a light feather (Swift Strikes: Strikes use less Focus)"),
    ("softer-block",  (226, 180, 104), "pad",     "a firm dojo blocking pad with hits bouncing off (Firm Guard: Blocks stop more of the hit)"),
]
def mix(c, k, t=(255, 255, 255)): return tuple(int(a + (b - a) * k) for a, b in zip(c, t))
def poly(d, pts, fill, ow=3.2):
    P = [(s(x), s(y)) for x, y in pts]; d.polygon(P, fill=fill); d.line(P + [P[0]], fill=INK, width=s(ow), joint="curve")
def ell(d, b, fill=None, ow=3.2, outline=INK):
    d.ellipse([s(v) for v in b], fill=fill, outline=outline, width=s(ow) if outline else 0)
def stroke(d, pts, col, w):
    P = [(s(x), s(y)) for x, y in pts]
    d.line(P, fill=INK, width=s(w + 3), joint="curve")
    for x, y in (P[0], P[-1]): r = s(w + 3) / 2; d.ellipse((x - r, y - r, x + r, y + r), fill=INK)
    d.line(P, fill=col, width=s(w), joint="curve")
    for x, y in (P[0], P[-1]): r = s(w) / 2; d.ellipse((x - r, y - r, x + r, y + r), fill=col)
def curl(x0, y, length, amp, r, turns_pts=14):
    import math
    pts = [(x0 + t * length / 20, y + amp * math.sin(t / 20 * math.pi * 1.5)) for t in range(21)]
    ex, ey = pts[-1]; cx, cy = ex, ey - r
    for k in range(1, turns_pts + 1):
        a = math.pi / 2 - k / turns_pts * 1.5 * math.pi; rr = r * (1 - 0.35 * k / turns_pts)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return pts
def sparkle(d, x, y, r, col):
    poly(d, [(x, y - r), (x + r * .28, y - r * .28), (x + r, y), (x + r * .28, y + r * .28), (x, y + r), (x - r * .28, y + r * .28), (x - r, y), (x - r * .28, y - r * .28)], col, 1.6)
def symbol(d, kind, c):
    dk = mix(c, .35, (30, 20, 30)); lt = mix(c, .5); cx, cy = 64, 64
    if kind == "breath":
        stroke(d, curl(cx - 30, cy - 16, 40, -2, 6), c, 4.2)
        stroke(d, curl(cx - 34, cy + 2, 50, -2, 8), lt, 4.2)
        stroke(d, curl(cx - 28, cy + 20, 36, -2, 5), c, 4.2)
        sparkle(d, cx + 22, cy - 26, 6, (255, 246, 200))
    elif kind == "orb":
        import math
        for k in range(8):                                   # short glow rays: the orb is already full
            a = k * math.pi / 4 + math.pi / 8; r0, r1 = 27, 35
            stroke(d, [(cx + r0 * math.cos(a), cy + r0 * math.sin(a)), (cx + r1 * math.cos(a), cy + r1 * math.sin(a))], lt, 2.6)
        ell(d, (cx - 22, cy - 22, cx + 22, cy + 22), c)
        ell(d, (cx - 14, cy - 14, cx + 14, cy + 14), lt, 0, None)
        ell(d, (cx - 9, cy - 9, cx + 9, cy + 9), (250, 248, 255), 0, None)
        ell(d, (cx - 15, cy - 17, cx - 7, cy - 9), (255, 255, 255), 0, None)
        sparkle(d, cx + 22, cy - 22, 7, (255, 236, 150))
    elif kind == "feather":
        P = [(cx - 22, cy + 26), (cx - 18, cy + 8), (cx - 10, cy - 8), (cx + 2, cy - 20), (cx + 16, cy - 28), (cx + 26, cy - 30),
             (cx + 22, cy - 18), (cx + 14, cy - 4), (cx + 4, cy + 8), (cx - 8, cy + 16)]
        poly(d, P, c, 3.2)
        for (x0, y0), (x1, y1) in (((cx + 22, cy - 18), (cx + 12, cy - 14)), ((cx + 14, cy - 4), (cx + 4, cy - 2)), ((cx - 10, cy - 8), (cx - 2, cy - 4))):
            d.line((s(x0), s(y0), s(x1), s(y1)), fill=INK, width=s(2.4))
        d.line((s(cx - 26), s(cy + 30), s(cx + 20), s(cy - 24)), fill=INK, width=s(4.5))
        d.line((s(cx - 25), s(cy + 29), s(cx + 20), s(cy - 24)), fill=mix(c, .8), width=s(2))
        for y, x0 in ((cy - 8, cx - 38), (cy + 4, cx - 40)):
            d.line((s(x0), s(y), s(x0 + 12), s(y)), fill=INK, width=s(5)); d.line((s(x0), s(y), s(x0 + 12), s(y)), fill=lt, width=s(2.5))
    elif kind == "pad":                                       # a dojo blocking pad (kick shield) held up firm, impact arcs bounce off
        d.rounded_rectangle((s(cx - 17), s(cy - 29), s(cx + 17), s(cy + 29)), s(11), fill=c, outline=INK, width=s(3.4))
        d.rounded_rectangle((s(cx - 11), s(cy - 23), s(cx - 3), s(cy + 6)), s(4), fill=lt)
        for y in (cy - 12, cy + 12):
            d.rectangle((s(cx - 17), s(y - 3), s(cx + 17), s(y + 3)), fill=dk, outline=INK, width=s(1.8))
        for r in (8, 15):
            d.arc((s(cx + 18 - r), s(cy - r * 1.6), s(cx + 18 + r * 1.2), s(cy + r * 1.6)), -60, 60, fill=INK, width=s(4.4))
            d.arc((s(cx + 18 - r), s(cy - r * 1.6), s(cx + 18 + r * 1.2), s(cy + r * 1.6)), -58, 58, fill=lt, width=s(2))
def icon(c, kind, W=128):
    im = Image.new("RGBA", (s(128), s(128))); 
    g = Image.new("RGBA", im.size); gd = ImageDraw.Draw(g); gd.ellipse((s(16), s(16), s(112), s(112)), fill=c + (170,)); g = g.filter(ImageFilter.GaussianBlur(s(3)))
    im.alpha_composite(g); d = ImageDraw.Draw(im)
    d.rounded_rectangle((s(22), s(22), s(106), s(106)), s(6), fill=PAPER, outline=INK, width=s(3))
    d.rounded_rectangle((s(26), s(26), s(102), s(102)), s(4), outline=mix(c, .55), width=s(2.5))
    for y in (16, 104):
        d.rounded_rectangle((s(14), s(y), s(114), s(y + 9)), s(4.5), fill=WOOD, outline=INK, width=s(2.6))
        d.line((s(19), s(y + 3), s(109), s(y + 3)), fill=mix(WOOD, .35), width=s(1.6))
        for x in (13, 107): d.ellipse((s(x), s(y - 1), s(x + 9), s(y + 10)), fill=c, outline=INK, width=s(2.4))
    symbol(d, kind, c)
    return im.resize((W, W), Image.LANCZOS)
os.makedirs(SP, exist_ok=True); os.makedirs(PV, exist_ok=True)
NEW, static = {}, {"note": "OV-A1 Power-up icons. Same frame/size/anchor rules as incoming-art/icons/sprites/static.json. No text baked in.", "sprites": {}}
for i, c, k, what in KEY:
    NEW[i] = icon(c, k); NEW[i].save(os.path.join(SP, f"icon-{i}.png")); icon(c, k, 256).save(os.path.join(SP, f"icon-{i}@2x.png"))
    static["sprites"][f"icon-{i}"] = {"size": [128, 128], "files": {"1x": f"icon-{i}.png", "2x": f"icon-{i}@2x.png"}, "anchorPx": [64.0, 64.0],
        "frames": 1, "accentRGB": list(c), "note": f"Power-up {i}: {what}. 128 x 128 (+ @2x 256), anchor = centre"}
json.dump(static, open(os.path.join(SP, "static.json"), "w"), indent=1)
# ---- previews ----
OLD_IDS = ["ripple-counter", "iron-skin", "wind-step", "double-strike", "quick-hands", "press-the-advantage", "shield-breaker", "heavy-hands", "rally"]
od = os.environ.get("OLD_ICONS", "")
OLD = [Image.open(os.path.join(od, f"icon-{i}.png")).convert("RGBA") for i in OLD_IDS if od and os.path.exists(os.path.join(od, f"icon-{i}.png"))]
ids = [k[0] for k in KEY]
BG, CREAM = (33, 29, 46), (250, 240, 214)
def grey(t): return Image.merge("RGBA", (*[ImageOps.grayscale(t.convert("RGB"))] * 3, t.getchannel("A")))
# 1) sizes strip: new 4 at 40/36/30 px, colour and greyscale, on menu colour and on cream card (true size, no scaling up)
st = Image.new("RGBA", (40 + 3 * (4 * 52 + 30), 2 * 2 * 56 + 30), BG); d = ImageDraw.Draw(st)
d.rectangle((0, st.height // 2, st.width, st.height), fill=CREAM)
for half, y0 in ((0, 14), (1, st.height // 2 + 8)):
    for g, yy in ((False, 0), (True, 50)):
        x = 20
        for sz in (40, 36, 30):
            for i in ids:
                t = NEW[i].resize((sz, sz), Image.LANCZOS); st.alpha_composite(grey(t) if g else t, (x, y0 + yy + (40 - sz) // 2)); x += 52
            x += 30
st.save(os.path.join(PV, "sizes-30-36-40.png"))
# 2) the new 4 among the existing 9 at 36 px (does each one stand apart?), colour + greyscale
fam = OLD + [NEW[i] for i in ids]
fs = Image.new("RGBA", (20 + len(fam) * 48, 120), BG)
for k, t in enumerate(fam):
    t = t.resize((36, 36), Image.LANCZOS); fs.alpha_composite(t, (20 + k * 48, 16)); fs.alpha_composite(grey(t), (20 + k * 48, 66))
d = ImageDraw.Draw(fs)
if OLD: d.line((20 + len(OLD) * 48 - 7, 8, 20 + len(OLD) * 48 - 7, 112), fill=(255, 255, 255), width=2)
fs.save(os.path.join(PV, "family-36px.png"))
# 3) large close-up (256 px each)
cl = Image.new("RGBA", (20 + 4 * 276, 296), BG)
for k, i in enumerate(ids): cl.alpha_composite(Image.open(os.path.join(SP, f"icon-{i}@2x.png")), (20 + k * 276, 20))
cl.save(os.path.join(PV, "closeup-256.png"))
print("ok")
