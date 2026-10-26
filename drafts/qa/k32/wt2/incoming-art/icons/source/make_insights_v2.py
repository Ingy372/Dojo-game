"""
Dojo Ascent - K7-art2: the 9 Insight icons, redrawn to be instantly distinct (Art Director bot).
Run from incoming-art/:  python3 icons/source/make_insights_v2.py
Family cue kept: a glowing scroll (two wooden rods + cream paper + soft glow). New: the symbol is big (about 60 px of the 128),
and each Insight has its own glow/accent colour (no red). Overwrites sprites/icon-<id>.png only; size 128 x 128, anchor (64,64)
and static.json unchanged. Also writes preview/insights-v2-*.png (before/after, greyscale, 48 px).
"""
import os, math
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); SP = os.path.join(HERE, "..", "sprites"); PV = os.path.join(HERE, "..", "preview")
SS, W = 4, 128
INK, PAPER, WOOD, WOOD_D = (58, 42, 34), (252, 244, 224), (150, 98, 52), (98, 62, 34)
def s(v): return int(round(v * SS))
# id: (accent colour, symbol)  -- accents chosen to differ in hue AND brightness
KEY = [
    ("ripple-counter", (64, 150, 235), "ripples"),
    ("iron-skin", (110, 124, 150), "shield"),
    ("wind-step", (60, 200, 150), "foot"),
    ("double-strike", (255, 146, 30), "bolts"),
    ("quick-hands", (250, 214, 40), "hand"),
    ("press-the-advantage", (150, 96, 230), "chevrons"),
    ("shield-breaker", (30, 186, 206), "cracked"),
    ("heavy-hands", (150, 92, 50), "weight"),
    ("rally", (130, 205, 50), "flag"),
]
def mix(c, k, t=(255, 255, 255)): return tuple(int(a + (b - a) * k) for a, b in zip(c, t))
def poly(d, pts, fill, ow=3.2):
    P = [(s(x), s(y)) for x, y in pts]; d.polygon(P, fill=fill); d.line(P + [P[0]], fill=INK, width=int(s(ow)), joint="curve")
def ell(d, b, fill=None, ow=3.2, outline=INK):
    d.ellipse([s(v) for v in b], fill=fill, outline=outline, width=int(s(ow)))
def symbol(d, kind, c):
    dk = mix(c, .35, (30, 20, 30)); lt = mix(c, .45)
    cx, cy = 64, 64
    if kind == "ripples":   # a drop falling into rings of water
        for r, w in ((30, 4), (19, 4)):
            b = (cx - r, cy + 12 - r * .45, cx + r, cy + 12 + r * .45); ell(d, b, None, w + 3); ell(d, b, None, w, c)
        poly(d, [(cx, cy - 30), (cx + 9, cy - 13), (cx + 9, cy - 7), (cx + 5, cy - 2), (cx, cy), (cx - 5, cy - 2), (cx - 9, cy - 7), (cx - 9, cy - 13)], c)
        ell(d, (cx - 4.5, cy - 15, cx - 0.5, cy - 9), lt, 0, None)
    elif kind == "shield":
        P = [(cx - 24, cy - 24), (cx + 24, cy - 24), (cx + 23, cy + 2), (cx, cy + 27), (cx - 23, cy + 2)]; poly(d, P, c)
        poly(d, [(cx - 15, cy - 16), (cx + 15, cy - 16), (cx + 14, cy + 1), (cx, cy + 17), (cx - 14, cy + 1)], lt, 2)
        for x, y in ((cx - 18, cy - 18), (cx + 18, cy - 18)): ell(d, (x - 3, y - 3, x + 3, y + 3), dk, 1.5)
    elif kind == "foot":
        ell(d, (cx - 12, cy - 12, cx + 12, cy + 26), c)
        for k, (x, y, r) in enumerate(((cx - 14, cy - 20, 5), (cx - 4, cy - 25, 5.5), (cx + 7, cy - 24, 5), (cx + 15, cy - 17, 4.5))): ell(d, (x - r, y - r, x + r, y + r), c, 2.5)
        for y, x0 in ((cy - 6, cx - 33), (cy + 6, cx - 36), (cy + 18, cx - 31)):
            d.line((s(x0), s(y), s(x0 + 14), s(y)), fill=INK, width=s(6)); d.line((s(x0), s(y), s(x0 + 14), s(y)), fill=lt, width=s(3))
    elif kind == "bolts":
        B = [(0, -26), (10, -26), (4, -6), (13, -6), (-4, 26), (0, 2), (-9, 2)]
        for dx in (-11, 11): poly(d, [(cx + dx + x, cy + y) for x, y in B], c if dx < 0 else lt)
    elif kind == "hand":
        poly(d, [(cx - 14, cy + 26), (cx - 18, cy), (cx - 18, cy - 8), (cx - 10, cy - 8), (cx - 10, cy - 24), (cx - 3, cy - 24), (cx - 3, cy - 28), (cx + 4, cy - 28), (cx + 4, cy - 24), (cx + 11, cy - 22), (cx + 11, cy - 14), (cx + 18, cy - 12), (cx + 18, cy + 8), (cx + 12, cy + 26)], c)
        for x in (-3, 4): d.line((s(cx + x + 0.5), s(cy - 22), s(cx + x + .5), s(cy - 6)), fill=dk, width=s(2))
        for y in (cy - 14, cy - 2, cy + 10):
            d.line((s(cx - 36), s(y), s(cx - 24), s(y)), fill=INK, width=s(5)); d.line((s(cx - 36), s(y), s(cx - 24), s(y)), fill=c, width=s(2.5))
    elif kind == "chevrons":
        for dx, col in ((-14, lt), (6, c)): poly(d, [(cx + dx - 10, cy - 26), (cx + dx + 4, cy - 26), (cx + dx + 22, cy), (cx + dx + 4, cy + 26), (cx + dx - 10, cy + 26), (cx + dx + 8, cy)], col)
    elif kind == "cracked":
        L = [(cx - 25, cy - 24), (cx - 2, cy - 24), (cx + 4, cy - 12), (cx - 4, cy - 2), (cx + 3, cy + 8), (cx - 4, cy + 25), (cx - 23, cy + 2)]
        R = [(cx + 4, cy - 24), (cx + 25, cy - 24), (cx + 24, cy + 2), (cx + 3, cy + 27), (cx + 9, cy + 9), (cx + 3, cy - 1), (cx + 10, cy - 12)]
        poly(d, [(x - 3, y + 1) for x, y in L], c); poly(d, [(x + 3, y - 1) for x, y in R], lt)
        for a in (-1, 1): star_ = (cx + a * 0, cy); d.line((s(cx - 2), s(cy - 30), s(cx + 2), s(cy - 36)), fill=INK, width=s(3))
    elif kind == "weight":
        ell(d, (cx - 14, cy - 28, cx + 14, cy - 4), None, 9); ell(d, (cx - 14, cy - 28, cx + 14, cy - 4), None, 5, c)
        ell(d, (cx - 25, cy - 14, cx + 25, cy + 27), c)
        ell(d, (cx - 15, cy - 6, cx - 3, cy + 6), lt, 0, None)
        d.rectangle((s(cx - 25), s(cy + 20), s(cx + 25), s(cy + 27)), fill=None)
    elif kind == "flag":
        d.line((s(cx - 18), s(cy - 30), s(cx - 18), s(cy + 28)), fill=INK, width=s(8)); d.line((s(cx - 18), s(cy - 30), s(cx - 18), s(cy + 28)), fill=WOOD, width=s(4))
        poly(d, [(cx - 16, cy - 26), (cx + 26, cy - 20), (cx + 18, cy - 9), (cx + 28, cy + 2), (cx - 16, cy + 2)], c)
        ell(d, (cx - 22, cy - 35, cx - 14, cy - 27), (255, 211, 77), 2)
        poly(d, [(cx + 2, cy - 18), (cx + 4, cy - 13), (cx + 9, cy - 13), (cx + 5, cy - 10), (cx + 7, cy - 5), (cx + 2, cy - 8), (cx - 3, cy - 5), (cx - 1, cy - 10), (cx - 5, cy - 13), (cx, cy - 13)], (255, 245, 190), 1.4)
def icon(c, kind):
    im = Image.new("RGBA", (s(W), s(W))); d = ImageDraw.Draw(im)
    g = Image.new("RGBA", im.size); gd = ImageDraw.Draw(g); gd.ellipse((s(16), s(16), s(112), s(112)), fill=c + (170,)); g = g.filter(ImageFilter.GaussianBlur(s(3)))
    im.alpha_composite(g); d = ImageDraw.Draw(im)
    d.rounded_rectangle((s(22), s(22), s(106), s(106)), s(6), fill=PAPER, outline=INK, width=s(3))                    # paper
    d.rounded_rectangle((s(26), s(26), s(102), s(102)), s(4), outline=mix(c, .55) , width=s(2.5))                     # accent edge
    for y in (16, 104):                                                                                               # rods
        d.rounded_rectangle((s(14), s(y), s(114), s(y + 9)), s(4.5), fill=WOOD, outline=INK, width=s(2.6))
        d.line((s(19), s(y + 3), s(109), s(y + 3)), fill=mix(WOOD, .35), width=s(1.6))
        for x in (13, 107): d.ellipse((s(x), s(y - 1), s(x + 9), s(y + 10)), fill=c, outline=INK, width=s(2.4))   # caps in accent colour
    symbol(d, kind, c)
    return im.resize((W, W), Image.LANCZOS)
NEW = {}
for i, c, k in KEY:
    NEW[i] = icon(c, k); NEW[i].save(os.path.join(SP, f"icon-{i}.png"))
# ---- previews ----
OLD = {}
od = os.environ.get("OLD_DIR", "/tmp/ins_old")
for i, _, _ in KEY:
    p = os.path.join(od, f"icon-{i}.png"); OLD[i] = Image.open(p).convert("RGBA") if os.path.exists(p) else None
Fn = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
BG = (33, 29, 46)
def row(icons, sz, gap, y, c, grey=False):
    for k, im in enumerate(icons):
        if im is None: continue
        t = im.resize((sz, sz), Image.LANCZOS)
        if grey: t = Image.merge("RGBA", (*[ImageOps.grayscale(t.convert("RGB"))] * 3, t.getchannel("A")))
        c.alpha_composite(t, (20 + k * gap, y))
ids = [k[0] for k in KEY]
# before / after (128 px), colour + greyscale
ba = Image.new("RGBA", (20 + 9 * 140, 4 * 150 + 40), BG); d = ImageDraw.Draw(ba)
for y, lab, src, g in ((24, "BEFORE", OLD, False), (174, "AFTER", NEW, False), (324, "BEFORE greyscale", OLD, True), (474, "AFTER greyscale", NEW, True)):
    d.text((20, y - 18), lab, fill=(255, 255, 255), font=Fn); row([src[i] for i in ids], 128, 140, y, ba, g)
ba.save(os.path.join(PV, "insights-v2-before-after.png"))
# 48 px check: 1x and 3x-phone (48 pt = 144 px), on menu colour + card cream, plus greyscale; with the colour key
ch = Image.new("RGBA", (20 + 9 * 112, 470), BG); d = ImageDraw.Draw(ch)
d.text((20, 6), "48 px (1x), colour / greyscale", fill=(255, 255, 255), font=Fn)
row([NEW[i] for i in ids], 48, 112, 24, ch); row([NEW[i] for i in ids], 48, 112, 80, ch, True)
d.rectangle((0, 140, ch.width, 260), fill=(250, 240, 214)); d.text((20, 146), "48 px on a cream card, colour / greyscale", fill=(58, 42, 34), font=Fn)
row([NEW[i] for i in ids], 48, 112, 162, ch); row([NEW[i] for i in ids], 48, 112, 210, ch, True)
d.text((20, 270), "48 px BEFORE (for comparison)", fill=(255, 255, 255), font=Fn); row([OLD[i] for i in ids], 48, 112, 288, ch)
d.text((20, 350), "colour key", fill=(255, 255, 255), font=Fn)
for k, (i, c, kind) in enumerate(KEY):
    x = 20 + k * 112; d.rounded_rectangle((x, 370, x + 48, 390), 5, fill=c, outline=(255, 255, 255)); d.text((x, 396), i.replace("-", "-\n"), fill=(255, 255, 255), font=Fn)
ch.save(os.path.join(PV, "insights-v2-48px-greyscale-check.png"))
print("ok")
