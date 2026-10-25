"""
Dojo Ascent - M7-N1 named monster: FINAL tells + finished stickers (Art Director bot). Run AFTER make_named.py and make_named_b2.py (from incoming-art/):
    python3 named-monster/source/make_tells.py
Production sheets at each creature's frame size and anchor (1 row, frames left to right; anchor = the enemy's ground point):
  brute/tell-stamp-dust.png      208 x 208 frames, 6 fr @ 15 fps (0.4 s), played twice in the wind-up (t = 0.0 s and 0.4 s).
  swarmer/tell-dash-trail.png    128 x 128 frames, 6 fr @ 10 fps (= the 0.6 s wind-up), drawn for dash direction E (+x); the game rotates it to the dash angle.
  swarmer/tell-dash-trail-tile.png 64 x 24 tileable segment, 6 fr @ 10 fps, for dashes longer than the frame.
  shield/tell-shield-tap.png     128 x 128 frames, 4 fr @ 20 fps (0.2 s), played 3 times in the wind-up (t = 0.0, 0.233, 0.467 s), offset per direction.
Kid-friendly: soft round shapes, warm cream/gold, dark ink rims so they read in greyscale. No red (red belongs to the danger circle).
"""
import os, math, json
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); IA = os.path.join(HERE, "..", ".."); SP = os.path.join(HERE, "..", "sprites"); PV = os.path.join(HERE, "..", "preview")
SS = 4; GOLD, GOLD_L, GOLD_D, CREAM, INK = (255, 211, 77), (255, 245, 190), (196, 118, 10), (250, 240, 214), (58, 42, 34)
F = lambda n: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", n)
def ej(e): return json.load(open(os.path.join(IA, "enemies-tier1", e, "sprites", f"{e}.json")))
def L(w, h): return Image.new("RGBA", (w * SS, h * SS))
def dn(im, w, h): return im.resize((w, h), Image.LANCZOS)
def star(d, x, y, r, col):
    d.polygon([(x, y - r), (x + r / 3, y), (x, y + r), (x - r / 3, y)], fill=col); d.polygon([(x - r, y), (x, y + r / 3), (x + r, y), (x, y - r / 3)], fill=col)
def sheet(fr):
    w, h = fr[0].size; s = Image.new("RGBA", (w * len(fr), h))
    for i, f in enumerate(fr): s.alpha_composite(f, (i * w, 0))
    return s
def ease(t): return 1 - (1 - t) ** 2
M = json.load(open(os.path.join(SP, "static.json"))); S = M["sprites"]
for k in ("tell-stamp-dust", "tell-dash-trail", "tell-shield-tap"): S.pop(k, None)
for k in ("tell-stamp-dust.png", "tell-dash-trail.png", "tell-shield-tap.png", "../preview/tells-rough.png"):
    p = os.path.join(SP, k)
    if os.path.exists(p): os.remove(p)
# ---- brute: stamp dust ----
J = ej("brute"); W, H, AX, AY = J["frameWidth"], J["frameHeight"], J["anchor"]["x"], J["anchor"]["y"]
DUST = []
for i in range(6):
    t = i / 5; c = L(W, H); d = ImageDraw.Draw(c); a = int(255 * (1 - t) ** 1.2)
    # ground ring (perspective ellipse)
    rx, ry = 40 + 46 * ease(t), 12 + 14 * ease(t)
    d.ellipse(((AX - rx) * SS, (AY - ry) * SS, (AX + rx) * SS, (AY + ry) * SS), outline=(120, 92, 66, int(a * .8)), width=int((5 - 3 * t) * SS))
    d.ellipse(((AX - rx + 3) * SS, (AY - ry + 2) * SS, (AX + rx - 3) * SS, (AY + ry - 2) * SS), outline=CREAM + (int(a * .9),), width=int((3 - 2 * t) * SS))
    for k in range(8):  # round puffs
        ang = k / 8 * 2 * math.pi + .2; rr = 34 + 44 * ease(t); x = AX + math.cos(ang) * rr; y = AY + math.sin(ang) * rr * .32 - 10 * ease(t) * (1 if k % 2 else .6)
        r = (9 + 3 * (k % 3)) * (1 - .35 * t)
        d.ellipse(((x - r - 1.5) * SS, (y - r - 1.5) * SS, (x + r + 1.5) * SS, (y + r + 1.5) * SS), fill=(120, 92, 66, int(a * .85)))
        d.ellipse(((x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS), fill=(244, 230, 200, a)); d.ellipse(((x - r * .5) * SS, (y - r * .7) * SS, (x + r * .2) * SS, (y - r * .1) * SS), fill=(255, 252, 240, a))
    DUST.append(dn(c, W, H))
os.makedirs(os.path.join(SP, "brute"), exist_ok=True); sheet(DUST).save(os.path.join(SP, "brute", "tell-stamp-dust.png"))
S["tell-stamp-dust"] = {"enemy": "brute", "files": {"fx": "brute/tell-stamp-dust.png"}, "frameSize": [W, H], "anchorPx": [AX, AY], "frames": 6, "fps": 15, "durationSec": 0.4, "loop": False, "layer": "under the enemy, over the floor and danger circle",
    "timing": {"during": "windup", "playAtSec": [0.0, 0.4], "screenShake": {"px": 2, "sec": 0.12, "atSec": [0.0, 0.4]}}, "note": "Old Thumper stamps twice. Same wind-up length (0.8 s); the tell only adds to the warning. Same for all 8 directions (ground effect)."}
# ---- swarmer: dash sparkle trail (direction E) ----
J = ej("swarmer"); W, H, AX, AY = J["frameWidth"], J["frameHeight"], J["anchor"]["x"], J["anchor"]["y"]
TR = []
SPK = [(k * 7.3 % 1, (k * 0.37 % 1 - .5) * 10, 3 + (k % 3) * 1.3) for k in range(14)]
for i in range(6):
    t = i / 5; c = L(W, H); d = ImageDraw.Draw(c); reach = AX + 8 + (W - 6 - AX - 8) * ease(min(1, t * 1.4))
    for k, (u, oy, r) in enumerate(SPK):
        x = AX + 8 + u * (W - 6 - AX - 8)
        if x > reach: continue
        tw = .75 + .25 * math.sin((i + k) * 1.9); y = AY - 4 + oy * .5
        star(d, x * SS, y * SS, r * 1.45 * tw * SS, INK + (200,)); star(d, x * SS, y * SS, r * 1.2 * tw * SS, GOLD_D + (255,)); star(d, x * SS, y * SS, r * .8 * tw * SS, GOLD_L + (255,))
    for k in range(0, int(reach - AX - 8), 6):  # dotted guide line
        x = AX + 8 + k; d.ellipse(((x - 1.6) * SS, (AY - 5.6) * SS, (x + 1.6) * SS, (AY - 2.4) * SS), fill=GOLD + (200,))
    TR.append(dn(c, W, H))
os.makedirs(os.path.join(SP, "swarmer"), exist_ok=True); sheet(TR).save(os.path.join(SP, "swarmer", "tell-dash-trail.png"))
TL = []
for i in range(6):
    c = L(64, 24); d = ImageDraw.Draw(c)
    for k in range(0, 64, 6): d.ellipse(((k + 1.4) * SS, 10.4 * SS, (k + 4.6) * SS, 13.6 * SS), fill=GOLD + (200,))
    for k, (x, oy, r) in enumerate(((8, -3, 4), (26, 3, 3), (42, -2, 4.5), (57, 2, 3))):
        tw = .75 + .25 * math.sin((i + k) * 1.9 * 6 / 6 * 1.0472 * 2); y = 12 + oy
        star(d, x * SS, y * SS, r * 1.45 * tw * SS, INK + (200,)); star(d, x * SS, y * SS, r * 1.2 * tw * SS, GOLD_D + (255,)); star(d, x * SS, y * SS, r * .8 * tw * SS, GOLD_L + (255,))
    TL.append(dn(c, 64, 24))
sheet(TL).save(os.path.join(SP, "swarmer", "tell-dash-trail-tile.png"))
S["tell-dash-trail"] = {"enemy": "swarmer", "files": {"fx": "swarmer/tell-dash-trail.png", "tile": "swarmer/tell-dash-trail-tile.png"}, "frameSize": [W, H], "anchorPx": [AX, AY], "frames": 6, "fps": 10, "durationSec": 0.6, "loop": False, "holdLastFrame": True,
    "drawnFor": "dash direction +x (E); rotate about anchorPx to the real dash angle (ground plane: also squash y by 0.5 for N/S dashes)", "tile": {"size": [64, 24], "frames": 6, "fps": 10, "loop": True, "lineY": 12, "note": "repeat along +x from the frame's right edge to the dash end"},
    "timing": {"during": "windup", "playAtSec": [0.0], "removeAtSec": "attack frame 2 (end of the dash)"}, "layer": "under enemies, over the danger circle", "note": "Zippy Zoom: shows the exact path it will dash along. Wind-up stays 0.6 s."}
# ---- shield: tap flash ----
J = ej("shield"); W, H, AX, AY = J["frameWidth"], J["frameHeight"], J["anchor"]["x"], J["anchor"]["y"]
sh = Image.open(os.path.join(IA, "enemies-tier1", "shield", "sprites", "shield_shield_windup.png")).convert("RGBA"); off = {}
for r, dname in enumerate(J["directions"]):
    b = sh.crop((0, r * H, W, (r + 1) * H)).getbbox()
    off[dname] = [round((b[0] + b[2]) / 2 - AX, 1), round((b[1] + b[3]) / 2 - AY, 1)] if b else [0, -30]
TAP = []
for i in range(4):
    t = i / 3; c = L(W, H); d = ImageDraw.Draw(c); a = int(255 * (1 - t * .85)); cx, cy = AX, AY - 40
    r = 10 + 16 * ease(t); d.ellipse(((cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS), outline=INK + (int(a * .7),), width=int(4 * SS))
    d.ellipse(((cx - r + 1) * SS, (cy - r + 1) * SS, (cx + r - 1) * SS, (cy + r - 1) * SS), outline=GOLD_L + (a,), width=int(2.4 * SS))
    for k in range(8):  # short rays
        ang = k / 8 * 2 * math.pi; r0, r1 = r + 3, r + 7 + 4 * (1 - t)
        d.line(((cx + math.cos(ang) * r0) * SS, (cy + math.sin(ang) * r0) * SS, (cx + math.cos(ang) * r1) * SS, (cy + math.sin(ang) * r1) * SS), fill=GOLD + (a,), width=int(2.4 * SS))
    if i < 2: star(d, cx * SS, cy * SS, (13 - 4 * i) * SS, INK + (180,)); star(d, cx * SS, cy * SS, (11 - 4 * i) * SS, (255, 255, 240, 255))
    TAP.append(dn(c, W, H))
os.makedirs(os.path.join(SP, "shield"), exist_ok=True); sheet(TAP).save(os.path.join(SP, "shield", "tell-shield-tap.png"))
S["tell-shield-tap"] = {"enemy": "shield", "files": {"fx": "shield/tell-shield-tap.png"}, "frameSize": [W, H], "anchorPx": [AX, AY], "flashCentreInFramePx": [AX, AY - 40], "frames": 4, "fps": 20, "durationSec": 0.2, "loop": False,
    "offsetPerDirectionPx": off, "timing": {"during": "windup", "playAtSec": [0.0, 0.233, 0.467], "sound": "clank x3 at the same times"}, "layer": "over the enemy",
    "note": "Captain Clank taps three times. The flash is drawn at (anchor.x, anchor.y-40); shift it by offsetPerDirectionPx[dir] minus (0,-40) to put it on the shield centre. Wind-up stays 0.7 s."}
for k in S:  # shift rule simplification: give final offsets directly
    pass
S["tell-shield-tap"]["offsetPerDirectionPx"] = {k: [v[0], round(v[1] + 40, 1)] for k, v in off.items()}
nwf = sh.width // W; opf = {}
for r, dname in enumerate(J["directions"]):
    opf[dname] = []
    for f in range(nwf):
        b = sh.crop((f * W, r * H, (f + 1) * W, (r + 1) * H)).getbbox()
        opf[dname].append([round((b[0] + b[2]) / 2 - AX, 1), round((b[1] + b[3]) / 2 - AY + 40, 1)] if b else S["tell-shield-tap"]["offsetPerDirectionPx"][dname])
S["tell-shield-tap"]["offsetPerFramePx"] = opf
S["tell-shield-tap"]["note"] = "Captain Clank taps three times. Draw the sheet at the enemy anchor shifted by offsetPerFramePx[dir][current wind-up frame] (the shield rises during the wind-up, so it must follow the frame). offsetPerDirectionPx = frame 0 only, kept for old code. Wind-up stays 0.7 s."
# ---- stickers: finished (die-cut, thick white border + gold keyline) ----
def enemy(e, f=0, anim="idle", dname="S"):
    J = ej(e); fw, fh = J["frameWidth"], J["frameHeight"]; row = J["directions"].index(dname); im = Image.new("RGBA", (fw, fh))
    for l in ("body", "shield", "glow", "light"):
        p = os.path.join(IA, "enemies-tier1", e, "sprites", f"{e}_{l}_{anim}.png")
        if os.path.exists(p):
            s = Image.open(p).convert("RGBA"); n = s.width // fw; im.alpha_composite(s.crop(((f % n) * fw, row * fh, (f % n + 1) * fw, (row + 1) * fh)))
    return im, (J["anchor"]["x"], J["anchor"]["y"])
def sticker(e):
    Z = 4; im, _ = enemy(e); im = im.crop(im.getbbox()); sc = min(60 * Z / im.width, 56 * Z / im.height); im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
    base = Image.new("RGBA", (80 * Z, 80 * Z)); base.alpha_composite(im, ((80 * Z - im.width) // 2, 70 * Z - im.height)); d = ImageDraw.Draw(base)
    for x, y, r in ((13, 16, 6), (67, 13, 7), (68, 44, 4.5), (12, 48, 4.5)):
        star(d, x * Z, y * Z, r * 1.3 * Z, INK + (255,)); star(d, x * Z, y * Z, r * Z, GOLD_D + (255,)); star(d, x * Z, y * Z, r * .62 * Z, GOLD_L + (255,))
    A = base.getchannel("A").point(lambda v: 255 if v > 40 else 0)
    big = A.filter(ImageFilter.MaxFilter(17)).filter(ImageFilter.GaussianBlur(6)).point(lambda v: 255 if v > 110 else 0).filter(ImageFilter.MaxFilter(9))
    key = big.filter(ImageFilter.MinFilter(9)); ring = Image.new("L", big.size); ring.paste(big); ring = Image.composite(Image.new("L", big.size, 0), big, key)
    out = Image.new("RGBA", big.size); sh = Image.new("RGBA", big.size, (0, 0, 0, 255)); sh.putalpha(big.point(lambda v: v // 4)); out.alpha_composite(sh, (Z, 2 * Z))
    out.alpha_composite(Image.composite(Image.new("RGBA", big.size, (255, 255, 255, 255)), Image.new("RGBA", big.size), big))
    keyline = key.filter(ImageFilter.MinFilter(13)); kl = Image.composite(Image.new("L", big.size, 255), Image.new("L", big.size, 0), Image.composite(Image.new("L", big.size, 0), key, keyline))
    g = Image.new("RGBA", big.size, GOLD + (255,)); g.putalpha(Image.composite(Image.new("L", big.size, 0), key, key.filter(ImageFilter.MinFilter(9)))); out.alpha_composite(g)
    rim = Image.new("RGBA", big.size, (176, 164, 146, 255)); rim.putalpha(Image.composite(Image.new("L", big.size, 0), big, big.filter(ImageFilter.MinFilter(5)))); out.alpha_composite(rim)
    out.alpha_composite(base); return out.resize((80, 80), Image.LANCZOS)
# name tag height during the wind-up (heads rise): highest point over all wind-up/attack frames, +10 px. The tag is NOT redrawn, only placed.
HOA = {}
for e in ("brute", "swarmer", "shield"):
    Je = ej(e); ay = Je["anchor"]["y"]; tops = []
    for an in ("idle", "windup", "attack"):
        for f in range(Je["animations"][an]["frames"]):
            b = enemy(e, f, an)[0].getbbox()
            if b: tops.append(b[1])
    HOA[e] = round(ay - min(tops) + 10)
S["name-tag"]["headOffsetPx"] = HOA; S["name-tag"]["note"] = S["name-tag"]["note"] + " headOffsetPx covers idle, wind-up and attack poses (highest head + 10 px), so the tag never moves or overlaps during a tell."
STK = {}
for e in ("brute", "swarmer", "shield"):
    STK[e] = sticker(e); STK[e].save(os.path.join(SP, "sticker", f"sticker-{e}.png"))
    S[f"sticker-{e}"].pop("sample", None); S[f"sticker-{e}"]["note"] = "Home Dojo wall sticker (final): die-cut, thick white border, gold keyline, gold sparkles. Given once, on the first win vs that named monster. Same wall-item rules as home-dojo/static.json."
M["note"] = "M7-N1 named monster. Final tells (per-enemy folders), name-tag, journal parts, finished stickers. Nothing above heads except name-tag."
json.dump(M, open(os.path.join(SP, "static.json"), "w"), indent=2)
# ---------------- previews ----------------
def floor(w, h):
    T = Image.open(os.path.join(IA, "tower-rooms-t2/sprites/floor-big_floor-big.png")).convert("RGBA"); c = Image.new("RGBA", (w, h))
    for y in range(0, h, T.height):
        for x in range(0, w, T.width): c.alpha_composite(T, (x, y))
    return c
SPK_ = {e: Image.open(os.path.join(SP, e, "named-sparkle_front.png")).convert("RGBA") for e in ("brute", "swarmer", "shield")}
TAG = Image.open(os.path.join(SP, "name-tag.png")).convert("RGBA"); HO = S["name-tag"]["headOffsetPx"]
def put(c, img, x, y, ax, ay): c.alpha_composite(img, (int(x - ax), int(y - ay)))
def fr(sheet_, i, w, h): return sheet_.crop((i * w, 0, (i + 1) * w, h))
def mon(c, e, x, y, f, anim="idle", spk_f=0):
    """f MUST be an int frame of that animation (a float here split frames in half: the PR #53 bug)."""
    J = ej(e); im, (ax, ay) = enemy(e, int(f), anim); put(c, im, x, y, ax, ay); put(c, fr(SPK_[e], int(spk_f) % 8, J["frameWidth"], J["frameHeight"]), x, y, ax, ay); put(c, TAG, x, y - HO[e], 32, 16)
POS = {"brute": (150, 300), "swarmer": (330, 210), "shield": (590, 320)}
A = {e: ej(e)["animations"] for e in POS}
def danger(c, x, y, rx, ry, a):
    if a <= 0: return
    o = Image.new("RGBA", c.size); d = ImageDraw.Draw(o); d.ellipse((x - rx, y - ry, x + rx, y + ry), fill=(230, 70, 70, int(60 * a)), outline=(230, 70, 70, int(200 * a)), width=3); c.alpha_composite(o)
START = {"brute": 0.4, "swarmer": 2.6, "shield": 4.8}   # each creature: idle -> wind-up (+ tell) -> attack -> idle; one at a time
CYCLE = 7.0
def state(e, sec):
    """returns (anim, int frame, seconds into that anim) from real time, using each animation's own fps"""
    a = A[e]; t0 = START[e]; wd, ad = a["windup"]["durationSec"], a["attack"]["durationSec"]
    if t0 <= sec < t0 + wd: lt = sec - t0; return "windup", min(a["windup"]["frames"] - 1, int(lt * a["windup"]["fps"])), lt
    if t0 + wd <= sec < t0 + wd + ad: lt = sec - t0 - wd; return "attack", min(a["attack"]["frames"] - 1, int(lt * a["attack"]["fps"])), lt
    return "idle", int(sec * a["idle"]["fps"]) % a["idle"]["frames"], sec
def frame(sec):
    c = floor(740, 440); spk = int(sec * 10)   # sparkles 10 fps
    for e, (x, y) in POS.items():
        an, f, lt = state(e, sec); J = ej(e); ti = (A[e][an].get("telegraphIntensity") or [0] * 99)[f] if an != "idle" else 0
        if e == "brute":
            danger(c, x, y + 30, 70, 30, ti)
            if an == "windup":
                s0 = 0.0 if lt < 0.4 else 0.4; put(c, fr(DS, min(5, int((lt - s0) * 15)), 208, 208), x, y, 104, 170.56)   # no body bounce: shake is the game's (off with reduced motion)
            mon(c, e, x, y, f, an, spk)
        elif e == "swarmer":
            dx = 0
            if an == "attack":   # dash out along the trail over frames 0-2, then hop back during the recover
                dx = 150 * min(1, (lt + 0.1) / 0.3) if f <= 2 else 150 * max(0, 1 - (lt - 0.3) / 0.7)
            danger(c, x + 90, y, 96, 22, ti)
            if an == "windup" or (an == "attack" and f <= 2):
                tf = min(5, int(lt * 10)) if an == "windup" else 5; put(c, fr(TS, tf, 128, 128), x, y, 64, 104.96)
                if an == "attack" or tf == 5:
                    for q in range(2): put(c, fr(TT, int(sec * 10) % 6, 64, 24), x + 58 + q * 64, y, 0, 16)   # tile line (y 12) on the trail line (anchor - 4)
            mon(c, e, x + dx, y, f, an, spk)
        else:
            danger(c, x, y + 30, 56, 24, ti); mon(c, e, x, y, f, an, spk)
            if an == "windup":
                for s0 in (0.0, 0.233, 0.467):
                    if s0 <= lt < s0 + 0.2:
                        o = S["tell-shield-tap"]["offsetPerFramePx"]["S"][f]; put(c, fr(TP, min(3, int((lt - s0) * 20)), 128, 128), x + o[0], y + o[1], 64, 104.96)
    return c
DS = Image.open(os.path.join(SP, "brute", "tell-stamp-dust.png")).convert("RGBA"); TS = Image.open(os.path.join(SP, "swarmer", "tell-dash-trail.png")).convert("RGBA")
TT = Image.open(os.path.join(SP, "swarmer", "tell-dash-trail-tile.png")).convert("RGBA"); TP = Image.open(os.path.join(SP, "shield", "tell-shield-tap.png")).convert("RGBA")
STEP = 0.05   # 20 fps GIF; every layer picks its own int frame from real time
FR = [frame(q * STEP).resize((555, 330), Image.LANCZOS) for q in range(int(CYCLE / STEP))]
FR[0].save(os.path.join(PV, "tells-room.gif"), save_all=True, append_images=FR[1:], duration=50, loop=0)
# key frames, colour + greyscale
keys = [2, 5, 15, 18, 26, 28]   # ticks: brute stamp 1/2, swarmer trail, shield tap 1/2
row = Image.new("RGBA", (740, 440 * 2 + 20), (46, 42, 58, 255)); a = frame(2.6 * 10 + 2.6); b = frame(.4 * 10 + 1)
strip = Image.new("RGBA", (3 * 300 + 40, 2 * 240 + 70), (46, 42, 58, 255)); d = ImageDraw.Draw(strip)
crops = [(frame(START["brute"] + 0.45), "brute", "stamp dust (2nd stamp)"), (frame(START["swarmer"] + 0.55), "swarmer", "dash sparkle trail"), (frame(START["shield"] + 0.5), "shield", "shield tap flash (3rd)")]
for k, (im, e, lab) in enumerate(crops):
    x, y = POS[e]; cr = im.crop((x - 150 + (60 if e == "swarmer" else 0), y - 170, x + 150 + (60 if e == "swarmer" else 0), y + 70))
    strip.alpha_composite(cr, (10 + k * 310, 30)); strip.alpha_composite(ImageOps.grayscale(cr.convert("RGB")).convert("RGBA"), (10 + k * 310, 300)); d.text((14 + k * 310, 8), lab, fill=(255, 255, 255), font=F(14))
d.text((14, 278), "greyscale", fill=(255, 255, 255), font=F(14)); strip.save(os.path.join(PV, "tells-keyframes-greyscale.png"))
# sheets overview
ov = Image.new("RGBA", (6 * 208 // 2 + 20, 104 + 64 + 64 + 60), (46, 42, 58, 255))
ov.alpha_composite(DS.resize((DS.width // 2, 104), Image.LANCZOS), (10, 10)); ov.alpha_composite(TS.resize((TS.width // 2, 64), Image.LANCZOS), (10, 120)); ov.alpha_composite(TP.resize((TP.width // 2, 64), Image.LANCZOS), (10, 190)); ov.save(os.path.join(PV, "tells-sheets.png"))
# stickers
sw = Image.new("RGBA", (560, 220), (226, 206, 170, 255)); ImageDraw.Draw(sw).rectangle((0, 180, 560, 220), fill=(150, 104, 66))
for k, e in enumerate(("brute", "swarmer", "shield")): sw.alpha_composite(STK[e].resize((140, 140), Image.LANCZOS), (30 + k * 175, 25))
sw.save(os.path.join(PV, "stickers-final.png"))
print("ok", off)
