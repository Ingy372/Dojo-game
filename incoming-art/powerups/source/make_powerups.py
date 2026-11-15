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
    ("steady-start",  (252, 172, 58),  "orb",     "a warm sun-like Focus orb already glowing (Warm Up: start every room with some Focus)"),
    ("lighter-strike",(120, 196, 250), "feather", "a light feather (Swift Strikes: Strikes use less Focus)"),
    ("softer-block",  (226, 180, 104), "pad",     "Iron Block: a rising forearm block with a steel arm and fist (white gi sleeve), the hit bouncing off (Blocks stop more of the hit)"),
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
    elif kind == "pad":                                       # Firm Guard: a rising forearm block (gi sleeve, closed fist), the hit bounces off the top of the forearm
        import math
        SKIN, SKD, GI = (176, 186, 200), (112, 122, 140), (250, 250, 246)   # Iron Block: steel arm and fist
        ang = math.radians(-24); ux, uy = math.cos(ang), math.sin(ang); nx, ny = -uy, ux
        def seg(t0, t1, w0, w1, ox=cx - 30, oy=cy + 21):
            return [(ox + ux * t0 + nx * w0, oy + uy * t0 + ny * w0), (ox + ux * t1 + nx * w1, oy + uy * t1 + ny * w1),
                    (ox + ux * t1 - nx * w1, oy + uy * t1 - ny * w1), (ox + ux * t0 - nx * w0, oy + uy * t0 - ny * w0)]
        poly(d, seg(3, 24, 10.5, 10), GI, 3.2)                 # gi sleeve (white)
        poly(d, seg(22, 29, 9.5, 9.5), c, 2.6)                  # sand cuff band
        poly(d, seg(28, 46, 7.5, 7), SKIN, 3.2)                 # forearm (steel)
        ox_, oy_ = cx - 30, cy + 21
        for w, col, wd in ((-3.4, (236, 242, 250), 2.2), (3.6, SKD, 1.8)):   # top sheen line, lower shade line
            d.line((s(ox_ + ux * 31 + nx * w), s(oy_ + uy * 31 + ny * w), s(ox_ + ux * 44 + nx * w), s(oy_ + uy * 44 + ny * w)), fill=col, width=s(wd))
        fx, fy = cx - 30 + ux * 54, cy + 21 + uy * 54         # fist centre
        F = Image.new("RGBA", (s(30), s(30))); fd = ImageDraw.Draw(F)
        fd.rounded_rectangle((s(3), s(3), s(27), s(27)), s(8), fill=SKIN, outline=INK, width=s(3.2))
        for x in (11, 17, 23): fd.line((s(x), s(5), s(x), s(15)), fill=SKD, width=s(2))
        fd.rounded_rectangle((s(3), s(15), s(19), s(25)), s(5), fill=SKIN, outline=INK, width=s(2.4))   # thumb wrapped across the front
        F = F.rotate(24, resample=Image.BICUBIC, expand=True)
        d._image.alpha_composite(F, (int(s(fx) - F.width / 2), int(s(fy) - F.height / 2)))
        d.line((s(fx - 6), s(fy - 9), s(fx + 3), s(fy - 12)), fill=(236, 242, 250), width=s(2))   # sheen on the fist
        sparkle(d, fx + 8, fy - 16, 5, (255, 255, 255))
        mx, my = cx - 30 + ux * 34 + nx * -14, cy + 21 + uy * 34 + ny * -14   # just above the forearm
        for r in (9, 16):
            box = (s(mx - r * 1.5), s(my - r * 1.4), s(mx + r * 1.5), s(my + r * 0.6))
            d.arc(box, 205, 335, fill=INK, width=s(5.2)); d.arc(box, 207, 333, fill=c, width=s(2.6))
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
# 4) Firm Guard before/after at 36 px (and 128 px) for the art-gate redraw; needs OLD_FIRMGUARD=<old icon-softer-block.png>
ofg = os.environ.get("OLD_FIRMGUARD", "")
if ofg and os.path.exists(ofg):
    old = Image.open(ofg).convert("RGBA"); new = NEW["softer-block"]
    ctx = Image.open(os.path.join(od, "icon-heavy-hands.png")).convert("RGBA") if od and os.path.exists(os.path.join(od, "icon-heavy-hands.png")) else None
    ctx2 = Image.open(os.path.join(od, "icon-iron-skin.png")).convert("RGBA") if od and os.path.exists(os.path.join(od, "icon-iron-skin.png")) else None
    ba = Image.new("RGBA", (20 + 2 * 150 + 40 + 4 * 52, 2 * 150 + 20), BG); d = ImageDraw.Draw(ba)
    for k, (im, near) in enumerate(((old, [ctx2, ctx]), (new, [ctx2, ctx]))):
        y = 10 + k * 150
        ba.alpha_composite(im, (20, y)); ba.alpha_composite(im.resize((36, 36), Image.LANCZOS), (170, y + 46))
        ba.alpha_composite(grey(im.resize((36, 36), Image.LANCZOS)), (214, y + 46))
        x = 280
        for n in near:
            if n is not None: ba.alpha_composite(n.resize((36, 36), Image.LANCZOS), (x, y + 46)); x += 52
        ba.alpha_composite(im.resize((36, 36), Image.LANCZOS), (x, y + 46))
    d.line((10, 160, ba.width - 10, 160), fill=(255, 255, 255), width=2)
    ba.save(os.path.join(PV, "firm-guard-before-after.png"))
print("ok2")
# 5) Warm Up before/after (indigo -> warm amber) at 128 and 36 px, next to Quick Hands and Double Strike; needs OLD_WARMUP=<old icon-steady-start.png>
owu = os.environ.get("OLD_WARMUP", "")
if owu and os.path.exists(owu):
    old = Image.open(owu).convert("RGBA"); new = NEW["steady-start"]
    near = [Image.open(os.path.join(od, f"icon-{n}.png")).convert("RGBA") for n in ("quick-hands", "double-strike") if od and os.path.exists(os.path.join(od, f"icon-{n}.png"))]
    ba = Image.new("RGBA", (20 + 2 * 150 + 40 + 4 * 52, 2 * 150 + 20), BG); d = ImageDraw.Draw(ba)
    for k, im in enumerate((old, new)):
        y = 10 + k * 150
        ba.alpha_composite(im, (20, y)); ba.alpha_composite(im.resize((36, 36), Image.LANCZOS), (170, y + 46))
        ba.alpha_composite(grey(im.resize((36, 36), Image.LANCZOS)), (214, y + 46))
        x = 280
        for n in near: ba.alpha_composite(n.resize((36, 36), Image.LANCZOS), (x, y + 46)); x += 52
        ba.alpha_composite(im.resize((36, 36), Image.LANCZOS), (x, y + 46))
    d.line((10, 160, ba.width - 10, 160), fill=(255, 255, 255), width=2)
    ba.save(os.path.join(PV, "warm-up-before-after.png"))
print("ok3")
