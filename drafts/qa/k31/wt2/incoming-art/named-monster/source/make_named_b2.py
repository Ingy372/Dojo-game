"""
Dojo Ascent - M7-N1 named monster, batch 2 (Art Director bot). Run AFTER make_named.py (from incoming-art/):
    python3 named-monster/source/make_named_b2.py
Adds to named-monster/sprites/ (+ static.json):
  name-tag.png                 slim gold-edged plate ABOVE the head, shown after the under-feet plate fades. BLANK (game draws the name).
  journal/page-frame.png       390 x 600 Monster Journal page; journal/title-banner.png (blank; game writes "Monster Journal");
  journal/card-met.png, journal/card-unmet.png (with the "?" from the proposal), journal/stamp.png,
  journal/silhouette-<enemy>.png  the unmet treatment (flat warm grey + soft inner light), per brute / swarmer / shield.
  sticker/sticker-<enemy>.png  Home Dojo wall stickers (80 x 80, 1 wall tile), one per named enemy type: SAMPLES.
"""
import os, math, json
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); IA = os.path.join(HERE, "..", ".."); SP = os.path.join(HERE, "..", "sprites"); PV = os.path.join(HERE, "..", "preview")
SS, N = 4, 8
GOLD, GOLD_L, GOLD_D, CREAM, INK, RED = (255, 211, 77), (255, 245, 190), (196, 118, 10), (250, 240, 214), (58, 42, 34), (170, 60, 60)
FP = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"; F = lambda n: ImageFont.truetype(FP, n)
def L(w, h): return Image.new("RGBA", (w * SS, h * SS))
def dn(im, w, h, b=0):
    im = im.resize((w, h), Image.LANCZOS); return im.filter(ImageFilter.GaussianBlur(b)) if b else im
def star(d, x, y, r, col):
    d.polygon([(x, y - r), (x + r / 3, y), (x, y + r), (x - r / 3, y)], fill=col); d.polygon([(x - r, y), (x, y + r / 3), (x + r, y), (x, y - r / 3)], fill=col)
def ej(e): return json.load(open(os.path.join(IA, "enemies-tier1", e, "sprites", f"{e}.json")))
def enemy(e, f=0):
    J = ej(e); fw, fh = J["frameWidth"], J["frameHeight"]; row = J["directions"].index("S"); im = Image.new("RGBA", (fw, fh))
    for l in ("body", "shield", "glow", "light"):
        p = os.path.join(IA, "enemies-tier1", e, "sprites", f"{e}_{l}_idle.png")
        if os.path.exists(p):
            s = Image.open(p).convert("RGBA"); n = s.width // fw; im.alpha_composite(s.crop(((f % n) * fw, row * fh, (f % n + 1) * fw, (row + 1) * fh)))
    return im, (J["anchor"]["x"], J["anchor"]["y"])
P = os.path.join(SP, "static.json"); M = json.load(open(P)); EN = ["brute", "swarmer", "shield"]
os.makedirs(os.path.join(SP, "journal"), exist_ok=True); os.makedirs(os.path.join(SP, "sticker"), exist_ok=True)
# ---- 2. name tag (slim, low profile: 64 x 14) ----
TW, TH = 64, 14
t = L(TW, TH); d = ImageDraw.Draw(t)
d.rounded_rectangle((SS, SS, (TW - 1) * SS, (TH - 1) * SS), 6 * SS, fill=CREAM, outline=GOLD_D, width=int(1.6 * SS))
for x in (6, TW - 6): star(d, x * SS, TH / 2 * SS, 2.6 * SS, GOLD_D + (255,))
TAG = dn(t, TW, TH); TAG.save(os.path.join(SP, "name-tag.png"))
offs = {}
for e in EN:
    im, (ax, ay) = enemy(e); top = min(enemy(e, f)[0].getbbox()[1] for f in range(4)); offs[e] = round(ay - top + 10)
M["sprites"]["name-tag"] = {"files": {"tag": "name-tag.png"}, "size": [TW, TH], "anchorPx": [TW / 2, TH], "nineSlice": {"left": 11, "right": 11, "top": 4, "bottom": 4}, "textArea": [11, 2, TW - 22, TH - 4], "textColor": "#3a2a22",
    "headOffsetPx": offs, "note": "BLANK. Appears (fade in ~0.3 s) when the under-feet name-plate has faded. Bottom-centre sits headOffsetPx[enemy] above the enemy's ground point. The ONLY thing drawn above any head. Small font (Fredoka/Andika)."}
# ---- 3. journal ----
JW, JH = 390, 600
pg = L(JW, JH); d = ImageDraw.Draw(pg)
d.rounded_rectangle((3 * SS, 8 * SS, (JW - 2) * SS, (JH - 1) * SS), 24 * SS, fill=(0, 0, 0, 70))
d.rounded_rectangle((2 * SS, 2 * SS, (JW - 4) * SS, (JH - 7) * SS), 24 * SS, fill=(196, 132, 74), outline=INK, width=4 * SS)      # leather cover
d.rounded_rectangle((14 * SS, 14 * SS, (JW - 16) * SS, (JH - 19) * SS), 16 * SS, fill=CREAM, outline=INK, width=2 * SS)           # paper
d.rounded_rectangle((22 * SS, 22 * SS, (JW - 24) * SS, (JH - 27) * SS), 12 * SS, outline=GOLD + (220,), width=2 * SS)
for (x, y) in ((30, 30), (JW - 32, 30), (30, JH - 35), (JW - 32, JH - 35)): star(d, x * SS, y * SS, 6 * SS, GOLD_D + (255,))
for y in (120, 300, 480): d.ellipse(((5) * SS, (y - 7) * SS, 19 * SS, (y + 7) * SS), fill=(230, 210, 160), outline=INK, width=SS)  # binding rings
PAGE = dn(pg, JW, JH); PAGE.save(os.path.join(SP, "journal", "page-frame.png"))
BW_, BH_ = 260, 46
b = L(BW_, BH_); d = ImageDraw.Draw(b)
d.polygon([(0, 10 * SS), (24 * SS, 10 * SS), (24 * SS, 40 * SS), (0, 40 * SS), (10 * SS, 25 * SS)], fill=(214, 140, 20), outline=INK)
d.polygon([(BW_ * SS, 10 * SS), ((BW_ - 24) * SS, 10 * SS), ((BW_ - 24) * SS, 40 * SS), (BW_ * SS, 40 * SS), ((BW_ - 10) * SS, 25 * SS)], fill=(214, 140, 20), outline=INK)
d.rounded_rectangle((16 * SS, 2 * SS, (BW_ - 16) * SS, 38 * SS), 10 * SS, fill=GOLD, outline=INK, width=2 * SS)
d.rounded_rectangle((22 * SS, 6 * SS, (BW_ - 22) * SS, 34 * SS), 7 * SS, outline=GOLD_L, width=SS)
BAN = dn(b, BW_, BH_); BAN.save(os.path.join(SP, "journal", "title-banner.png"))
CW, CH = 318, 140
def card(met):
    c = L(CW, CH); d = ImageDraw.Draw(c)
    d.rounded_rectangle((2 * SS, 5 * SS, (CW - 1) * SS, (CH - 1) * SS), 14 * SS, fill=(0, 0, 0, 40))
    d.rounded_rectangle((SS, SS, (CW - 3) * SS, (CH - 5) * SS), 14 * SS, fill=(255, 252, 242) if met else (240, 232, 214), outline=INK, width=2 * SS)
    d.rounded_rectangle((10 * SS, 10 * SS, 126 * SS, (CH - 14) * SS), 10 * SS, fill=(236, 226, 200) if met else (222, 210, 186))   # picture well
    d.rounded_rectangle((138 * SS, 14 * SS, (CW - 14) * SS, 40 * SS), 8 * SS, fill=CREAM if met else (230, 220, 200), outline=INK if met else (150, 130, 110), width=2 * SS)  # name slot
    if met:
        for k in range(3): d.line((140 * SS, (58 + k * 16) * SS, (CW - 70 if k == 2 else CW - 16) * SS, (58 + k * 16) * SS), fill=(225, 212, 185), width=SS)  # fact lines
        d.ellipse(((CW - 68) * SS, (CH - 66) * SS, (CW - 14) * SS, (CH - 12) * SS), outline=(225, 212, 185), width=2 * SS)  # stamp spot
    im = dn(c, CW, CH)
    if not met:
        dd = ImageDraw.Draw(im); dd.text((158, 27), "?", fill=(150, 130, 110), font=F(20), anchor="mm")
    return im
CMET, CUN = card(True), card(False); CMET.save(os.path.join(SP, "journal", "card-met.png")); CUN.save(os.path.join(SP, "journal", "card-unmet.png"))
STW = 60
s = L(STW, STW); d = ImageDraw.Draw(s); c = STW / 2 * SS
for k in range(16):  # scalloped gold seal
    a = k / 16 * 2 * math.pi; d.ellipse((c + math.cos(a) * 24 * SS - 6 * SS, c + math.sin(a) * 24 * SS - 6 * SS, c + math.cos(a) * 24 * SS + 6 * SS, c + math.sin(a) * 24 * SS + 6 * SS), fill=(214, 140, 20))
d.ellipse((c - 25 * SS, c - 25 * SS, c + 25 * SS, c + 25 * SS), fill=(214, 140, 20)); d.ellipse((c - 20 * SS, c - 20 * SS, c + 20 * SS, c + 20 * SS), fill=GOLD, outline=GOLD_L, width=2 * SS)
star(d, c, c, 15 * SS, GOLD_D + (255,)); star(d, c, c, 11 * SS, GOLD_L + (255,))
STAMP = dn(s, STW, STW).rotate(-12, resample=Image.BICUBIC); STAMP.save(os.path.join(SP, "journal", "stamp.png"))
SIL = {}
for e in EN:
    im, _ = enemy(e); im = im.crop(im.getbbox()); sc = min(104 / im.width, 112 / im.height); im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
    a = im.getchannel("A"); fill = Image.new("RGBA", im.size, (120, 108, 92, 255)); fill.putalpha(a)
    inner = Image.new("RGBA", im.size, (150, 138, 120, 255)); inner.putalpha(a.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(4)).point(lambda v: v // 2)); fill.alpha_composite(inner)
    out = Image.new("RGBA", (116, 120)); out.alpha_composite(fill, ((116 - im.width) // 2, (120 - im.height) // 2)); SIL[e] = out; out.save(os.path.join(SP, "journal", f"silhouette-{e}.png"))
    M["sprites"][f"journal-silhouette-{e}"] = {"files": {"img": f"journal/silhouette-{e}.png"}, "size": list(out.size), "note": "unmet treatment: flat warm grey #786c5c + soft inner light; place in the card's picture well (10,10)-(126,126)"}
M["sprites"]["journal-page-frame"] = {"files": {"img": "journal/page-frame.png"}, "size": [JW, JH], "note": "phone page; paper area (22,22)-(366,573); title banner centred at y 30; 3 cards at x 36, y 92 / 252 / 412"}
M["sprites"]["journal-title-banner"] = {"files": {"img": "journal/title-banner.png"}, "size": [BW_, BH_], "textArea": [30, 6, 200, 28], "textColor": "#3a2a22", "note": "BLANK; the game writes the title \"Monster Journal\""}
M["sprites"]["journal-card-met"] = {"files": {"img": "journal/card-met.png"}, "size": [CW, CH], "pictureWell": [10, 10, 126, 126], "nameSlot": [138, 14, 304, 40], "factArea": [140, 50, 304, 100], "stampSpot": [250, 74, 304, 128], "note": "game renders name + fact"}
M["sprites"]["journal-card-unmet"] = {"files": {"img": "journal/card-unmet.png"}, "size": [CW, CH], "pictureWell": [10, 10, 126, 126], "textArea": [140, 50, 304, 100], "note": "\"?\" baked in the name slot (from the proposal); the game may write \"Keep exploring!\" in textArea"}
M["sprites"]["journal-stamp"] = {"files": {"img": "journal/stamp.png"}, "size": list(STAMP.size), "note": "cosmetic stamp (first win); centre it on the card's stampSpot"}
# ---- 4. stickers (80 x 80, wall items) ----
def sticker(e):
    im, _ = enemy(e); im = im.crop(im.getbbox()); sc = min(56 / im.width, 54 / im.height); im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
    base = Image.new("RGBA", (80, 80)); base.alpha_composite(im, ((80 - im.width) // 2, 74 - im.height - 6))
    d = ImageDraw.Draw(base)
    for x, y, r in ((12, 18, 5), (68, 14, 6), (66, 44, 4), (14, 50, 4)): star(d, x, y, r, GOLD_D + (255,)); star(d, x, y, r * 0.65, GOLD_L + (255,))
    a = base.getchannel("A").filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(1)).point(lambda v: 255 if v > 60 else 0)
    white = Image.new("RGBA", (80, 80), (255, 255, 255, 255)); white.putalpha(a)
    sh = Image.new("RGBA", (80, 80), (0, 0, 0, 255)); sh.putalpha(a.point(lambda v: v // 4))
    out = Image.new("RGBA", (80, 80)); out.alpha_composite(sh, (1, 2)); out.alpha_composite(white); ol = a.filter(ImageFilter.FIND_EDGES)
    edge = Image.new("RGBA", (80, 80), (200, 190, 170, 255)); edge.putalpha(ol); out.alpha_composite(edge); out.alpha_composite(base); return out
STK = {}
for e in EN:
    STK[e] = sticker(e); STK[e].save(os.path.join(SP, "sticker", f"sticker-{e}.png"))
    M["sprites"][f"sticker-{e}"] = {"files": {"img": f"sticker/sticker-{e}.png"}, "size": [80, 80], "anchorPx": [40, 80], "footprint": [1, 1], "place": "wall", "sample": True, "note": "Home Dojo wall sticker, earned on the first win vs that named monster (proposal). Same wall-item rules as home-dojo/static.json."}
M["note"] = "M7-N1 named monster. Batch 2: denser sparkles, name-tag, journal parts, stickers (samples). Nothing above heads except name-tag."
json.dump(M, open(P, "w"), indent=2)
# ---------------- previews ----------------
def floor(path, w, h):
    T = Image.open(os.path.join(IA, path)).convert("RGBA"); c = Image.new("RGBA", (w, h))
    for y in range(0, h, T.height):
        for x in range(0, w, T.width): c.alpha_composite(T, (x, y))
    return c
T2 = "tower-rooms-t2/sprites/floor-big_floor-big.png"
def lay(c, img, i, e, x, y):
    J = ej(e); fw = J["frameWidth"]; c.alpha_composite(img.crop((i * fw, 0, (i + 1) * fw, J["frameHeight"])), (int(x - J["anchor"]["x"]), int(y - J["anchor"]["y"])))
def fa(im, a):
    im = im.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * a))); return im
PLATE = Image.open(os.path.join(SP, "name-plate.png")).convert("RGBA")
def named(c, e, x, y, i, spk, plate=0.0, tag=0.0):
    if plate > 0: c.alpha_composite(fa(PLATE, plate), (int(x - PLATE.width / 2), int(y + 6)))
    im, (ax, ay) = enemy(e, i); c.alpha_composite(im, (int(x - ax), int(y - ay))); lay(c, spk, i % N, e, x, y)
    if tag > 0: c.alpha_composite(fa(TAG, tag), (int(x - TW / 2), int(y - offs[e] - TH)))
NEW = Image.open(os.path.join(SP, "brute", "named-sparkle_front.png")).convert("RGBA"); OLD = Image.open("/tmp/before_brute_spk.png").convert("RGBA") if os.path.exists("/tmp/before_brute_spk.png") else NEW
EA = os.path.join(IA, "elite-auras", "sprites", "brute")
def swift(c, x, y, i):
    lay(c, Image.open(os.path.join(EA, "aura-swift_back.png")).convert("RGBA"), i, "brute", x, y); im, (ax, ay) = enemy("brute", i); c.alpha_composite(im, (int(x - ax), int(y - ay))); lay(c, Image.open(os.path.join(EA, "aura-swift_front.png")).convert("RGBA"), i, "brute", x, y)
def plain(c, e, x, y, i):
    im, (ax, ay) = enemy(e, i); c.alpha_composite(im, (int(x - ax), int(y - ay)))
# before/after greyscale (plate faded, no tag, to judge sparkles alone): normal | Swift | named before | named after
c = floor(T2, 760, 230)
plain(c, "brute", 95, 190, 2); swift(c, 285, 190, 2); named(c, "brute", 475, 190, 2, OLD); named(c, "brute", 665, 190, 2, NEW)
g = Image.new("RGBA", (780, 520), (46, 42, 58, 255)); g.alpha_composite(c, (10, 30)); g.alpha_composite(ImageOps.grayscale(c.convert("RGB")).convert("RGBA"), (10, 280)); d = ImageDraw.Draw(g)
for k, tx in enumerate(("normal", "Swift elite", "named BEFORE", "named AFTER (denser)")): d.text((20 + k * 190, 8), tx, fill=(255, 255, 255), font=F(13))
d.text((20, 262), "greyscale (plate faded, tag hidden: sparkles only)", fill=(255, 255, 255), font=F(13)); g.save(os.path.join(PV, "b2-greyscale-before-after.png"))
# room GIF: plate visible -> fades -> tag fades in
def room(i, plate, tag):
    c = floor(T2, 720, 480)
    for e, x, y in (("swarmer", 150, 170), ("shield", 590, 190), ("swarmer", 560, 400)): plain(c, e, x, y, i)
    named(c, "brute", 330, 330, i, NEW, plate, tag); return c
seq = [(1, 0)] * 16 + [(1 - k / 4, 0) for k in range(1, 5)] + [(0, k / 3) for k in range(1, 4)] + [(0, 1)] * 17
fr = [room(i, p, t).resize((540, 360), Image.LANCZOS) for i, (p, t) in enumerate(seq)]
fr[0].save(os.path.join(PV, "b2-named-room-tag.gif"), save_all=True, append_images=fr[1:], duration=100, loop=0)
z = room(30, 0, 1).crop((200, 160, 460, 400)).resize((520, 480), Image.LANCZOS); z.save(os.path.join(PV, "b2-name-tag-closeup.png"))
# journal mock (title + placeholders shown; the art itself has no words except the "?" from the proposal)
J3 = PAGE.copy(); J3.alpha_composite(BAN, ((JW - BW_) // 2, 30)); d = ImageDraw.Draw(J3); d.text((JW // 2, 51), "Monster Journal", fill=INK, font=F(19), anchor="mm")
for k, (e, met) in enumerate((("brute", True), ("swarmer", False), ("shield", False))):
    x, y = 36, 92 + k * 160; J3.alpha_composite(CMET if met else CUN, (x, y))
    if met:
        im, _ = enemy(e); im = im.crop(im.getbbox()); sc = min(104 / im.width, 112 / im.height); im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
        J3.alpha_composite(im, (x + 68 - im.width // 2, y + 68 - im.height // 2)); d.text((x + 146, y + 21), "[PLACEHOLDER name]", fill=RED, font=F(11))
        d.text((x + 142, y + 50), "[PLACEHOLDER: one", fill=RED, font=F(11)); d.text((x + 142, y + 66), "friendly fact]", fill=RED, font=F(11)); J3.alpha_composite(STAMP, (x + 248, y + 70))
    else:
        J3.alpha_composite(SIL[e], (x + 10, y + 10)); d.text((x + 142, y + 60), "Keep exploring!", fill=INK, font=F(13))
J3.save(os.path.join(PV, "b2-journal-page.png"))
parts = Image.new("RGBA", (760, 420), (46, 42, 58, 255)); parts.alpha_composite(BAN, (10, 10)); parts.alpha_composite(CMET, (10, 70)); parts.alpha_composite(CUN, (10, 220)); parts.alpha_composite(STAMP, (350, 70))
for k, e in enumerate(EN): parts.alpha_composite(SIL[e], (340 + k * 125, 220))
parts.alpha_composite(TAG.resize((TW * 3, TH * 3), Image.LANCZOS), (440, 90)); parts.save(os.path.join(PV, "b2-journal-parts.png"))
# stickers on the home dojo wall
wall = Image.open(os.path.join(IA, "home-dojo", "sprites", "room_wall-front.png")).convert("RGBA")
sw = Image.new("RGBA", (560, 220), (226, 206, 170, 255)); ImageDraw.Draw(sw).rectangle((0, 180, 560, 220), fill=(150, 104, 66))
for k, e in enumerate(EN): sw.alpha_composite(STK[e].resize((120, 120), Image.LANCZOS), (30 + k * 175, 40))
sw.save(os.path.join(PV, "b2-stickers.png"))
print("done", offs)
