"""
Dojo Ascent - M7-N1 named monster SAMPLES (Art Director bot). Spec: drafts/planning/named-monster-proposal.md.
    python3 named-monster/source/make_named.py      (from incoming-art/; Python 3 + Pillow)
Sprites (named-monster/sprites/, see static.json):
  named-sparkle_front.png         256 master, ground (128, 210), 8 frames @ 10 fps: drifting gold sparkles ONLY (no swooshes, no glow, no dome).
  <enemy>/named-sparkle_front.png same, pre-scaled to brute / swarmer / shield frame + anchor (Floor Keeper is never named).
  name-plate.png                  BLANK cream plate for under the feet (the game renders the name text). 9-slice: stretch the middle.
  tell-stamp-dust.png             rough: Old Thumper stamp dust puff, 128 x 64, 4 frames @ 12 fps, once per stamp, at the feet.
  tell-dash-trail.png             rough: Zippy Zoom dash sparkle trail, 64 x 24 tileable segment, 8 frames @ 10 fps.
  tell-shield-tap.png             rough: Captain Clank shield-tap flash, 48 x 48, 3 frames @ 12 fps, once per tap, on the shield.
No text in the art. Previews (with labels / marked placeholders) go to named-monster/preview/.
"""
import os, math, json, random
from PIL import Image, ImageDraw, ImageFilter, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); IA = os.path.join(HERE, "..", ".."); SP = os.path.join(HERE, "..", "sprites"); PV = os.path.join(HERE, "..", "preview")
N, SS = 8, 4
GOLD, GOLD_L, CREAM, INK = (255, 211, 77), (255, 245, 190), (250, 240, 214), (58, 42, 34)
def L(w, h): return Image.new("RGBA", (w * SS, h * SS))
def dn(im, w, h, b=0):
    im = im.resize((w, h), Image.LANCZOS); return im.filter(ImageFilter.GaussianBlur(b)) if b else im
def sheet(fr):
    w, h = fr[0].size; s = Image.new("RGBA", (w * len(fr), h))
    for i, f in enumerate(fr): s.alpha_composite(f, (i * w, 0))
    return s
def star(d, x, y, r, col):
    d.polygon([(x, y - r), (x + r / 3, y), (x, y + r), (x - r / 3, y)], fill=col); d.polygon([(x - r, y), (x, y + r / 3), (x + r, y), (x, y - r / 3)], fill=col)
# sparkles: 6 fireflies, slow drift, sway, fade in AND out (soft), staying around the body, never stacking above the head as a badge
FLIES = [(-58, 0.0, 5.5), (-20, 0.33, 4.5), (24, 0.66, 6.0), (60, 0.17, 5.0), (-40, 0.5, 4.0), (44, 0.83, 4.5)]
def sparkle(i):
    im = L(256, 256); halo = L(256, 256); d, h = ImageDraw.Draw(im), ImageDraw.Draw(halo)
    for x0, ph, r0 in FLIES:
        p = (i / N / 2 + ph) % 1   # half a rise per loop -> slow
        x = 128 + x0 + 6 * math.sin(2 * math.pi * (p * 2 + ph)); y = 200 - p * 110; a = math.sin(math.pi * p)
        r = r0 * (0.7 + 0.3 * a) * SS
        h.ellipse((x * SS - r * 2, y * SS - r * 2, x * SS + r * 2, y * SS + r * 2), fill=GOLD + (int(140 * a),))
        star(d, x * SS, y * SS, r, GOLD_L + (int(255 * a),)); d.ellipse((x * SS - r / 3, y * SS - r / 3, x * SS + r / 3, y * SS + r / 3), fill=(255, 255, 255, int(255 * a)))
    out = dn(halo, 256, 256, 3); out.alpha_composite(dn(im, 256, 256, 0.4)); return out
SPK = [sparkle(i) for i in range(N)]; sheet(SPK).save(os.path.join(SP, "named-sparkle_front.png"))
meta = {"note": "M7-N1 named monster SAMPLES. Not wired until Jay OKs. Nothing above heads; plate goes under the feet.", "sprites": {
    "named-sparkle": {"files": {"front": "named-sparkle_front.png"}, "size": [256, 256], "anchorPx": [128, 210], "frames": N, "fps": 10, "master": True}}}
SCALE = {"swarmer": 0.5, "shield": 0.5, "brute": 0.8125}
def ej(e): return json.load(open(os.path.join(IA, "enemies-tier1", e, "sprites", f"{e}.json")))
for e, s in SCALE.items():
    J = ej(e); fw, fh, ax, ay = J["frameWidth"], J["frameHeight"], J["anchor"]["x"], J["anchor"]["y"]; cells = []
    for f in SPK:
        a = f.resize((round(256 * s), round(256 * s)), Image.LANCZOS); c = Image.new("RGBA", (fw, fh)); c.alpha_composite(a, (round(ax - 128 * s), round(ay - 210 * s))); cells.append(c)
    os.makedirs(os.path.join(SP, e), exist_ok=True); sheet(cells).save(os.path.join(SP, e, "named-sparkle_front.png"))
    meta["sprites"][f"named-sparkle-{e}"] = {"enemy": e, "files": {"front": f"{e}/named-sparkle_front.png"}, "size": [fw, fh], "anchorPx": [ax, ay], "frames": N, "fps": 10, "draw": "after the enemy"}
# name plate: 120 x 30, cream, dark ink outline, tiny gold corner dots; blank
PW, PH = 120, 30
pl = L(PW, PH); d = ImageDraw.Draw(pl)
d.rounded_rectangle((SS, 2 * SS, (PW - 1) * SS, (PH - 1) * SS), 11 * SS, fill=(0, 0, 0, 60))
d.rounded_rectangle((SS, SS, (PW - 1) * SS, (PH - 3) * SS), 11 * SS, fill=CREAM, outline=INK, width=int(2.2 * SS))
d.rounded_rectangle((5 * SS, 4 * SS, (PW - 5) * SS, (PH - 6) * SS), 8 * SS, outline=GOLD + (200,), width=SS)
for x in (10, PW - 10): star(d, x * SS, (PH / 2 - 1) * SS, 3.5 * SS, (230, 170, 40, 255))
PLATE = dn(pl, PW, PH); PLATE.save(os.path.join(SP, "name-plate.png"))
meta["sprites"]["name-plate"] = {"files": {"plate": "name-plate.png"}, "size": [PW, PH], "anchorPx": [PW / 2, 0], "nineSlice": {"left": 18, "right": 18, "top": 8, "bottom": 10},
    "textArea": [18, 6, PW - 36, PH - 14], "textColor": "#3a2a22", "note": "BLANK. The game renders the name (Fredoka/Andika). Top-centre sits ~6 px under the enemy's feet. Fades out after 3 s (rule from the proposal)."}
# tells (rough first passes)
def dust(i):
    im = L(128, 64); d = ImageDraw.Draw(im); t = (i + 1) / 4
    for k in range(7):
        a = math.pi * (k / 6); dist = 14 + 40 * t; x = 64 + math.cos(a) * dist * (1 if k % 2 else -1) * (0.6 + 0.4 * (k % 3) / 2); y = 50 - math.sin(a) * 10 * t - 6 * t; r = (7 + 5 * t) * (1 - 0.3 * (k % 2))
        d.ellipse(((x - r) * SS, (y - r * 0.7) * SS, (x + r) * SS, (y + r * 0.7) * SS), fill=(176, 140, 96, int(230 * (1 - t) + 25)), outline=(120, 90, 60, int(200 * (1 - t) + 20)), width=SS)
    d.arc(((64 - 30 - 25 * t) * SS, (50 - 8 - 4 * t) * SS, (64 + 30 + 25 * t) * SS, (50 + 8 + 4 * t) * SS), 0, 360, fill=(255, 250, 235, int(200 * (1 - t))), width=2 * SS)
    return dn(im, 128, 64, 0.8)
def trail(i):  # tileable 64 x 24: little gold dots marching +x (the dash direction)
    im = L(64, 24); d = ImageDraw.Draw(im)
    for k in range(4):
        x = (k * 16 + i * 2) % 64; a = 0.55 + 0.45 * math.sin(2 * math.pi * (x / 64)); 
        for xx in (x, x - 64, x + 64): (star(d, xx * SS, 12 * SS, 7 * SS * a, (200, 130, 20, int(240 * a))), star(d, xx * SS, 12 * SS, 5 * SS * a, GOLD_L + (255,)))
    d.line((0, 12 * SS, 64 * SS, 12 * SS), fill=(230, 160, 30, 150), width=2 * SS)
    return dn(im, 64, 24, 0.4)
def tap(i):
    im = L(48, 48); d = ImageDraw.Draw(im); t = (i + 1) / 3; c = 24 * SS
    (star(d, c, c, (12 + 10 * t) * SS, (200, 130, 20, int(255 * (1 - t) + 30))), star(d, c, c, (9 + 10 * t) * SS, (255, 255, 255, int(255 * (1 - t) + 40))))
    r = (6 + 16 * t) * SS; d.ellipse((c - r, c - r, c + r, c + r), outline=GOLD_L + (int(220 * (1 - t) + 20),), width=int(2.5 * SS))
    return dn(im, 48, 48, 0.4)
DUST, TRAIL, TAP = [dust(i) for i in range(4)], [trail(i) for i in range(N)], [tap(i) for i in range(3)]
sheet(DUST).save(os.path.join(SP, "tell-stamp-dust.png")); sheet(TRAIL).save(os.path.join(SP, "tell-dash-trail.png")); sheet(TAP).save(os.path.join(SP, "tell-shield-tap.png"))
meta["sprites"]["tell-stamp-dust"] = {"files": {"fx": "tell-stamp-dust.png"}, "size": [128, 64], "anchorPx": [64, 50], "frames": 4, "fps": 12, "loop": False, "rough": True, "note": "brute tell: once per stamp at the feet (+ small screen shake by the game)"}
meta["sprites"]["tell-dash-trail"] = {"files": {"fx": "tell-dash-trail.png"}, "size": [64, 24], "frames": N, "fps": 10, "tile": "repeat along x, line centre y = 12, +x = dash direction", "rough": True, "note": "swarmer tell: along the path it will dash, under enemies and under the red danger circle"}
meta["sprites"]["tell-shield-tap"] = {"files": {"fx": "tell-shield-tap.png"}, "size": [48, 48], "anchorPx": [24, 24], "frames": 3, "fps": 12, "loop": False, "rough": True, "note": "shield tell: once per tap, on the shield (3 taps)"}
json.dump(meta, open(os.path.join(SP, "static.json"), "w"), indent=2)
# ---------------- previews ----------------
def floor(path, w, h):
    T = Image.open(os.path.join(IA, path)).convert("RGBA"); c = Image.new("RGBA", (w, h))
    for y in range(0, h, T.height):
        for x in range(0, w, T.width): c.alpha_composite(T, (x, y))
    return c
def enemy(e, f=0, anim="idle"):
    J = ej(e); fw, fh = J["frameWidth"], J["frameHeight"]; row = J["directions"].index("S"); im = Image.new("RGBA", (fw, fh))
    for l in ("body", "shield", "glow", "light"):
        p = os.path.join(IA, "enemies-tier1", e, "sprites", f"{e}_{l}_{anim}.png")
        if os.path.exists(p):
            s = Image.open(p).convert("RGBA"); n = s.width // fw; im.alpha_composite(s.crop(((f % n) * fw, row * fh, (f % n + 1) * fw, (row + 1) * fh)))
    return im, (J["anchor"]["x"], J["anchor"]["y"])
def lay(c, path, i, e, x, y):
    J = ej(e); fw, fh = J["frameWidth"], J["frameHeight"]; im = Image.open(path).convert("RGBA").crop((i * fw, 0, (i + 1) * fw, fh)); c.alpha_composite(im, (int(x - J["anchor"]["x"]), int(y - J["anchor"]["y"])))
EA = os.path.join(IA, "elite-auras", "sprites")
def put(c, e, x, y, i, kind=None, plate_a=1.0):
    if kind == "swift": lay(c, os.path.join(EA, e, "aura-swift_back.png"), i % N, e, x, y)
    if kind == "named" and plate_a > 0:
        p = PLATE.copy(); p.putalpha(p.getchannel("A").point(lambda v: int(v * plate_a))); c.alpha_composite(p, (int(x - PW / 2), int(y + 6)))
    im, (ax, ay) = enemy(e, i); c.alpha_composite(im, (int(x - ax), int(y - ay)))
    if kind == "swift": lay(c, os.path.join(EA, e, "aura-swift_front.png"), i % N, e, x, y)
    if kind == "named": lay(c, os.path.join(SP, e, "named-sparkle_front.png"), i % N, e, x, y)
T2 = "tower-rooms-t2/sprites/floor-big_floor-big.png"
def room(i, plate_a=1.0):
    c = floor(T2, 720, 480)
    for e, x, y, k in (("swarmer", 150, 170, None), ("shield", 590, 190, None), ("swarmer", 560, 400, None), ("brute", 330, 330, "named")): put(c, e, x, y, i, k, plate_a)
    return c
fr = [room(i) for i in range(24)] + [room(24 + k, 1 - (k + 1) / 4) for k in range(4)] + [room(28 + k, 0) for k in range(8)]
fr = [f.resize((540, 360), Image.LANCZOS) for f in fr]; fr[0].save(os.path.join(PV, "sample-1-named-room.gif"), save_all=True, append_images=fr[1:], duration=100, loop=0)
# greyscale check: Swift elite brute vs named brute, colour row + greyscale row
cmp_ = floor(T2, 520, 300); put(cmp_, "brute", 140, 230, 2, "swift"); put(cmp_, "brute", 390, 230, 2, "named")
g = Image.new("RGBA", (540, 640), (46, 42, 58, 255)); g.alpha_composite(cmp_, (10, 10)); g.alpha_composite(ImageOps.grayscale(cmp_.convert("RGB")).convert("RGBA"), (10, 330))
dd = ImageDraw.Draw(g)
for t, x, y in (("Swift elite", 20, 14), ("named (sparkles only)", 280, 14), ("greyscale", 20, 334)): dd.text((x, y), t, fill=(30, 20, 10, 255) if y < 300 else (255, 255, 255, 255))
g.save(os.path.join(PV, "sample-1-greyscale-check.png"))
# sample 2: plate 1x / 3x on cream + grey floors, under a brute, at phone scale (390 px wide)
s2 = Image.new("RGBA", (760, 300), (46, 42, 58, 255)); s2.alpha_composite(PLATE.resize((PW * 3, PH * 3), Image.LANCZOS), (20, 20))
for k, fl in enumerate((T2, "tower-rooms/sprites/floor-big_floor-big.png")):
    c = floor(fl, 180, 180); put(c, "brute", 90, 120, 0, "named"); s2.alpha_composite(c, (400 + k * 185, 20))
ph = room(3).resize((390, 260), Image.LANCZOS); s2.alpha_composite(ph.crop((15, 100, 375, 260)), (20, 130))
ImageDraw.Draw(s2).text((20, 4), "name plate (blank, game renders the name) - 3x | under the feet on cream/grey | phone scale", fill=(255, 255, 255, 255))
s2.save(os.path.join(PV, "sample-2-name-plate.png"))
from PIL import ImageFont
FP = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
BIG, MID = (ImageFont.truetype(FP, 56), ImageFont.truetype(FP, 26)) if os.path.exists(FP) else (None, None)
# sample 3: Monster Journal page mock (390 x 600 phone page), placeholders marked
J3 = Image.new("RGBA", (390, 600), (0, 0, 0, 0)); d = ImageDraw.Draw(J3)
d.rounded_rectangle((6, 10, 384, 594), 22, fill=(0, 0, 0, 70)); d.rounded_rectangle((4, 4, 382, 588), 22, fill=CREAM, outline=INK, width=4)
d.rounded_rectangle((16, 16, 370, 576), 16, outline=(214, 140, 20, 255), width=2)
d.line((195, 30, 195, 560), fill=(220, 205, 175, 255), width=2)  # book spine hint
d.rounded_rectangle((40, 30, 350, 70), 12, fill=(255, 250, 235), outline=INK, width=2); d.text((60, 44), "[PLACEHOLDER: page title, set by the game]", fill=(170, 60, 60))
cards = [("met", "brute"), ("unmet", "swarmer"), ("unmet", "shield")]
for k, (st, e) in enumerate(cards):
    y = 86 + k * 160; d.rounded_rectangle((32, y, 358, y + 148), 14, fill=(255, 252, 242), outline=INK, width=2)
    d.rounded_rectangle((42, y + 10, 162, y + 138), 10, fill=(236, 226, 200))
    im, (ax, ay) = enemy(e, 0); bb = im.getbbox(); im = im.crop(bb); sc = min(100 / im.width, 110 / im.height); im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
    if st == "unmet":
        sil = Image.new("RGBA", im.size, (120, 108, 92, 255)); sil.putalpha(im.getchannel("A")); im = sil
    J3.alpha_composite(im, (102 - im.width // 2, y + 74 - im.height // 2))
    if st == "unmet":
        d.text((102, y + 74), "?", fill=(255, 255, 255), font=BIG, anchor="mm")
        d.text((176, y + 22), "?", fill=INK, font=MID); d.text((176, y + 60), "Keep exploring!", fill=INK)
    else:
        d.rounded_rectangle((176, y + 18, 346, y + 42), 8, fill=CREAM, outline=INK, width=2); d.text((184, y + 24), "[PLACEHOLDER name]", fill=(170, 60, 60))
        d.text((176, y + 54), "[PLACEHOLDER: one friendly", fill=(170, 60, 60)); d.text((176, y + 68), " fact, from Content Designer]", fill=(170, 60, 60))
        # stamp graphic: round gold seal with a star, slightly tilted
        st_ = L(56, 56); sd = ImageDraw.Draw(st_); c = 28 * SS
        sd.ellipse((2 * SS, 2 * SS, 54 * SS, 54 * SS), fill=(214, 140, 20, 230)); sd.ellipse((7 * SS, 7 * SS, 49 * SS, 49 * SS), outline=(255, 235, 170, 255), width=2 * SS)
        star(sd, c, c, 16 * SS, (255, 245, 190, 255)); st_ = dn(st_, 56, 56).rotate(-14, resample=Image.BICUBIC); J3.alpha_composite(st_, (284, y + 84))
        d.text((178, y + 120), "stamp (first win)", fill=(120, 100, 80))
J3.save(os.path.join(PV, "sample-3-journal-page-mock.png"))
# tells sheet
ts = Image.new("RGBA", (760, 260), (46, 42, 58, 255)); bg = floor(T2, 740, 200); ts.alpha_composite(bg, (10, 40))
for i, f in enumerate(DUST): ts.alpha_composite(f.resize((128, 64)), (20 + i * 0 + (i % 2) * 130, 50 + (i // 2) * 75))
for x in range(290, 470, 64): ts.alpha_composite(TRAIL[0].resize((64, 24)), (x, 120))
for i, f in enumerate(TAP): ts.alpha_composite(f.resize((72, 72)), (500 + i * 80, 100))
ImageDraw.Draw(ts).text((14, 12), "ROUGH tells:  stamp dust (4 fr)      |   dash sparkle trail (tiles)   |   shield-tap flash (3 fr)", fill=(255, 255, 255))
ts.save(os.path.join(PV, "tells-rough.png"))
print("done")
