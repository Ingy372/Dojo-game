"""
Dojo Ascent - Guarding links (Art Director bot), S1 follow-up (drafts/planning/S1-tier2-name-and-guarding-aura.md).
    python3 elite-auras/source/make_guard_links.py      (from incoming-art/; Python 3 + Pillow; run after make_auras.py)

Same blues as the approved Guarding aura. Writes into elite-auras/sprites/:
  guard-tether_beam.png       64 x 24 per frame, 8 frames @ 10 fps. Tiles seamlessly along x (repeat, or stretch);
                              the line runs along y = 12. A soft light pulse travels guarder -> protected (+x).
  guard-tether_cap.png        24 x 24, 8 frames: round end cap, centre (12, 12) on each end point.
  guard-tether_snap.png       64 x 64, 4 frames @ 12 fps, play once: the line breaks into a small puff of blue chips + soft ring.
  <enemy>/guard-protected_glow.png  per tier-1 enemy, 8 frames @ 10 fps, same frame size + anchor as the enemy: soft blue foot glow.
  aura-sparkle-gold_front.png PROPOSAL: the gold drifting sparkles taken out of Swift, 256 x 256 master @ (128, 210), 8 frames.
Nothing is drawn above a head. Previews go to elite-auras/preview/guard-*.png/gif.
"""
import os, math, json
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..", ".."); SP = os.path.join(HERE, "..", "sprites"); PV = os.path.join(HERE, "..", "preview")
N, SS = 8, 4
BLUE, BLUE_D, BLUE_L = (110, 190, 255), (40, 110, 210), (200, 230, 255)
GOLD = (255, 245, 190)
def L(w, h): return Image.new("RGBA", (w * SS, h * SS))
def dn(im, w, h, blur=0):
    im = im.resize((w, h), Image.LANCZOS); return im.filter(ImageFilter.GaussianBlur(blur)) if blur else im
meta = {"note": "Guarding links (S1 follow-up). Lines and glows sit UNDER the enemy and UNDER the red danger circle. Nothing above heads.", "sprites": {}}
def sheet(frames):
    w, h = frames[0].size; s = Image.new("RGBA", (w * len(frames), h))
    for i, f in enumerate(frames): s.alpha_composite(f, (i * w, 0))
    return s
# ---- beam: 64 x 24, tileable (everything is periodic in x with period 64) ----
BW, BH = 64, 24
def beam(i):
    im = L(BW, BH); d = ImageDraw.Draw(im); y = BH / 2 * SS
    for x in range(BW * SS):
        u = x / SS; p = 0.5 + 0.5 * math.cos(2 * math.pi * (u / BW - i / N))   # pulse travels +x, one per tile
        a_soft = int(40 + 50 * p); a_core = int(150 + 90 * p)
        d.line([(x, y - 5 * SS), (x, y + 5 * SS)], fill=BLUE + (a_soft,))
        d.line([(x, y - 1.6 * SS), (x, y + 1.6 * SS)], fill=(BLUE_L if p > 0.6 else BLUE) + (a_core,))
    return dn(im, BW, BH, 0.7)
def cap(i):
    p = 0.5 + 0.5 * math.sin(i / N * 2 * math.pi); im = L(24, 24); d = ImageDraw.Draw(im); c = 12 * SS
    for r, col in ((7 + p, BLUE + (90,)), (4.5, BLUE + (220,)), (2.2, BLUE_L + (255,))):
        d.ellipse((c - r * SS, c - r * SS, c + r * SS, c + r * SS), fill=col)
    return dn(im, 24, 24, 0.6)
def snap(i):  # 4 frames: flash -> chips fly -> chips fade -> gone-ish
    im = L(64, 64); d = ImageDraw.Draw(im); c = 32 * SS; t = (i + 1) / 4
    r = (6 + 22 * t) * SS; d.ellipse((c - r, c - r * 0.6, c + r, c + r * 0.6), outline=BLUE_L + (int(230 * (1 - t) + 20),), width=int((3 - 2 * t) * SS))
    if i == 0: d.ellipse((c - 9 * SS, c - 9 * SS, c + 9 * SS, c + 9 * SS), fill=BLUE_L + (230,))
    for k in range(6):
        a = k / 6 * 2 * math.pi + 0.4; dist = (6 + 20 * t) * SS; x, y = c + math.cos(a) * dist, c + math.sin(a) * dist * 0.7; s = (4 - 2.5 * t) * SS
        d.polygon([(x, y - s), (x + s * 0.7, y), (x, y + s), (x - s * 0.7, y)], fill=(BLUE if k % 2 else BLUE_L) + (int(255 * (1 - t * 0.8)),))
    return dn(im, 64, 64, 0.5)
def foot(i):  # 256 master, ground (128, 210): smaller and quieter than the elite's own aura (no dome)
    p = 0.5 + 0.5 * math.sin(i / N * 2 * math.pi); im = L(256, 256); d = ImageDraw.Draw(im); AX, AY = 128, 210
    for k in range(12, 0, -1):
        f = k / 12; rx, ry = 70 * f, 23 * f; d.ellipse(((AX - rx) * SS, (AY - ry) * SS, (AX + rx) * SS, (AY + ry) * SS), fill=BLUE + (int((70 + 50 * p) * (1 - f) + 8),))
    d.ellipse(((AX - 70) * SS, (AY - 23) * SS, (AX + 70) * SS, (AY + 23) * SS), outline=BLUE + (int(110 + 70 * p),), width=3 * SS)
    return dn(im, 256, 256, 1.2)
def sparkle(i):  # exactly the sparkles removed from Swift
    im = L(256, 256); df = ImageDraw.Draw(im); AX, AY = 128, 210
    for k in range(3):
        p = ((i / N) + k / 3) % 1; x = AX + (-50, 10, 55)[k]; y = AY - 30 - p * 120; r = (1 - p) * 7 * SS; a = int(255 * (1 - p))
        df.polygon([(x * SS, y * SS - r), (x * SS + r / 3, y * SS), (x * SS, y * SS + r), (x * SS - r / 3, y * SS)], fill=GOLD + (a,))
        df.polygon([(x * SS - r, y * SS), (x * SS, y * SS + r / 3), (x * SS + r, y * SS), (x * SS, y * SS - r / 3)], fill=GOLD + (a,))
    return dn(im, 256, 256, 0.6)
BEAM = [beam(i) for i in range(N)]; CAP = [cap(i) for i in range(N)]; SNAP = [snap(i) for i in range(4)]; FOOT = [foot(i) for i in range(N)]; SPK = [sparkle(i) for i in range(N)]
sheet(BEAM).save(os.path.join(SP, "guard-tether_beam.png")); sheet(CAP).save(os.path.join(SP, "guard-tether_cap.png")); sheet(SNAP).save(os.path.join(SP, "guard-tether_snap.png"))
sheet(SPK).save(os.path.join(SP, "aura-sparkle-gold_front.png"))
meta["sprites"]["guard-tether-beam"] = {"files": {"beam": "guard-tether_beam.png"}, "size": [BW, BH], "frames": N, "fps": 10, "tile": "repeat along x (or stretch); line centre y = 12; +x points guarder -> protected", "drawUnder": "enemies, red danger circle"}
meta["sprites"]["guard-tether-cap"] = {"files": {"cap": "guard-tether_cap.png"}, "size": [24, 24], "anchorPx": [12, 12], "frames": N, "fps": 10, "note": "one on each end point"}
meta["sprites"]["guard-tether-snap"] = {"files": {"snap": "guard-tether_snap.png"}, "size": [64, 64], "anchorPx": [32, 32], "frames": 4, "fps": 12, "loop": False, "note": "play once at each line's midpoint when the guarder is defeated, while the line and foot glow fade out"}
meta["sprites"]["aura-sparkle-gold"] = {"files": {"front": "aura-sparkle-gold_front.png"}, "size": [256, 256], "anchorPx": [128, 210], "frames": N, "fps": 10, "proposal": True, "note": "PROPOSAL ONLY (possible future rare named monster). Not wired. Scale like the aura masters."}
SCALE = {"swarmer": 0.5, "shield": 0.5, "brute": 0.8125, "keeper": 1.0}; EN = list(SCALE)
for e in EN:
    J = json.load(open(os.path.join(ROOT, "enemies-tier1", e, "sprites", f"{e}.json"))); fw, fh = J["frameWidth"], J["frameHeight"]; ax, ay = J["anchor"]["x"], J["anchor"]["y"]; s = SCALE[e]
    cells = []
    for f in FOOT:
        a = f.resize((round(256 * s), round(256 * s)), Image.LANCZOS); c = Image.new("RGBA", (fw, fh)); c.alpha_composite(a, (round(ax - 128 * s), round(ay - 210 * s))); cells.append(c)
    os.makedirs(os.path.join(SP, e), exist_ok=True); sheet(cells).save(os.path.join(SP, e, "guard-protected_glow.png"))
    meta["sprites"][f"guard-protected-{e}"] = {"enemy": e, "files": {"glow": f"{e}/guard-protected_glow.png"}, "size": [fw, fh], "anchorPx": [ax, ay], "frames": N, "fps": 10, "drawUnder": "enemy"}
# merge into static.json
P = os.path.join(SP, "static.json"); M = json.load(open(P)); M["sprites"].update(meta["sprites"]); M["guardNote"] = meta["note"]; json.dump(M, open(P, "w"), indent=2)
# ---- previews ----
def floorimg(path, w, h):
    T = Image.open(os.path.join(ROOT, path)).convert("RGBA"); c = Image.new("RGBA", (w, h))
    for y in range(0, h, T.height):
        for x in range(0, w, T.width): c.alpha_composite(T, (x, y))
    return c
def enemy(e, f=0):
    J = json.load(open(os.path.join(ROOT, "enemies-tier1", e, "sprites", f"{e}.json"))); fw, fh = J["frameWidth"], J["frameHeight"]; row = J["directions"].index("S"); im = Image.new("RGBA", (fw, fh))
    for l in ("body", "shield", "glow", "light"):
        p = os.path.join(ROOT, "enemies-tier1", e, "sprites", f"{e}_{l}_idle.png")
        if os.path.exists(p):
            s = Image.open(p).convert("RGBA"); n = s.width // fw; im.alpha_composite(s.crop(((f % n) * fw, row * fh, (f % n + 1) * fw, (row + 1) * fh)))
    return im, (J["anchor"]["x"], J["anchor"]["y"])
def cell(path, i, w, h): return Image.open(os.path.join(SP, path)).convert("RGBA").crop((i * w, 0, (i + 1) * w, h))
def with_alpha(im, a):
    im = im.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * a))); return im
def tether(c, p0, p1, i, a=1.0):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]; Ln = int(math.hypot(dx, dy)); strip = Image.new("RGBA", (Ln, BH))
    for x in range(0, Ln, BW): strip.alpha_composite(BEAM[i % N], (x, 0)) if x + BW <= Ln else strip.alpha_composite(BEAM[i % N].crop((0, 0, Ln - x, BH)), (x, 0))
    r = strip.rotate(-math.degrees(math.atan2(dy, dx)), resample=Image.BICUBIC, expand=True); r = with_alpha(r, a)
    c.alpha_composite(r, (int((p0[0] + p1[0]) / 2 - r.width / 2), int((p0[1] + p1[1]) / 2 - r.height / 2)))
    for p in (p0, p1): c.alpha_composite(with_alpha(CAP[i % N], a), (int(p[0] - 12), int(p[1] - 12)))
def aura(c, e, layer, x, y, i):
    J = json.load(open(os.path.join(ROOT, "enemies-tier1", e, "sprites", f"{e}.json"))); fw, fh = J["frameWidth"], J["frameHeight"]; ax, ay = J["anchor"]["x"], J["anchor"]["y"]
    c.alpha_composite(cell(f"{e}/{layer}.png", i % N, fw, fh), (int(x - ax), int(y - ay)))
def danger(c, x, y):  # MOCK of the game's red danger circle, only to check layering
    o = Image.new("RGBA", c.size); d = ImageDraw.Draw(o); d.ellipse((x - 70, y - 26, x + 70, y + 26), fill=(230, 50, 50, 70), outline=(230, 40, 40, 230), width=4); c.alpha_composite(o)
GUARD = ("shield", 360, 300); PROT = [("swarmer", 200, 250), ("brute", 520, 380)]; FREE = [("swarmer", 610, 170)]
def room(floor, i, phase="on", k=0):
    c = floorimg(floor, 720, 480); ga = 1.0 if phase == "on" else max(0, 1 - k / 3)
    if ga > 0:
        for e, x, y in PROT: tether(c, (GUARD[1], GUARD[2]), (x, y), i, ga)
        for e, x, y in PROT: c.alpha_composite(with_alpha(cell(f"{e}/guard-protected_glow.png", i % N, *enemy(e)[0].size), ga), (int(x - enemy(e)[1][0]), int(y - enemy(e)[1][1])))
    danger(c, 520, 380)  # brute winding up: red sits ON TOP of blue
    if phase == "on" or k < 1:
        aura(c, "shield", "aura-guarding_back", GUARD[1], GUARD[2], i)
        im, (ax, ay) = enemy("shield", i); c.alpha_composite(im, (GUARD[1] - int(ax), GUARD[2] - int(ay))); aura(c, "shield", "aura-guarding_front", GUARD[1], GUARD[2], i)
    for e, x, y in PROT + FREE:
        im, (ax, ay) = enemy(e, i); c.alpha_composite(im, (int(x - ax), int(y - ay)))
    if phase == "snap" and k < 4:
        for e, x, y in PROT: c.alpha_composite(SNAP[k], (int((GUARD[1] + x) / 2 - 32), int((GUARD[2] + y) / 2 - 32)))
    return c
T1, T2 = "tower-rooms/sprites/floor-big_floor-big.png", "tower-rooms-t2/sprites/floor-big_floor-big.png"
for name, fl in (("tier1-grey", T1), ("tier2-cream", T2)):
    frames = [room(fl, i) for i in range(16)] + [room(fl, 16 + k, "snap", k) for k in range(6)] + [room(fl, 0, "snap", 9)] * 4
    frames = [f.resize((540, 360), Image.LANCZOS) for f in frames]
    frames[0].save(os.path.join(PV, f"guard-room-{name}.gif"), save_all=True, append_images=frames[1:], duration=[100] * 16 + [83] * 6 + [250] * 4, loop=0)
    room(fl, 2).save(os.path.join(PV, f"guard-room-{name}.png"))
# parts sheet (2x on dark + cream)
ps = Image.new("RGBA", (900, 260), (46, 42, 58, 255)); d = ImageDraw.Draw(ps)
for i in range(N):
    b = BEAM[i].resize((128, 48), Image.NEAREST); ps.alpha_composite(b, (10 + (i % 4) * 135, 10 + (i // 4) * 55))
for i in range(4): ps.alpha_composite(SNAP[i].resize((128, 128)), (560 + (i % 2) * 165, 0 + (i // 2) * 130))
ps.alpha_composite(CAP[0].resize((48, 48)), (10, 130)); ps.alpha_composite(FOOT[2].crop((40, 150, 216, 240)).resize((264, 135)), (70, 120))
spk = Image.new("RGBA", (256, 256), (46, 42, 58, 255))
for i in range(N): spk.alpha_composite(SPK[i])
ps.alpha_composite(spk.crop((60, 40, 200, 190)).resize((112, 120)), (380, 130)); ps.save(os.path.join(PV, "guard-parts-2x.png"))
print("done")
