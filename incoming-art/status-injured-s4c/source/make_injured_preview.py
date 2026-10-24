"""Previews for S4c-A1. Run after make_injured.py."""
import json, os
from PIL import Image, ImageDraw, ImageFont, ImageOps
H = os.path.dirname(os.path.abspath(__file__)); IA = os.path.join(H, "..", ".."); S = os.path.join(H, "..", "sprites"); P = os.path.join(H, "..", "preview")
M = json.load(open(os.path.join(S, "injured.json"))); BG = (44, 40, 58, 255); FLOOR = (214, 186, 140, 255)
FONT = "/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf"
SRC = {"player": "player-character/sprites/player.json", "swarmer": "enemies-tier1/swarmer/sprites/swarmer.json", "shield": "enemies-tier1/shield/sprites/shield.json",
       "brute": "enemies-tier1/brute/sprites/brute.json", "keeper": "enemies-tier1/keeper/sprites/keeper.json", "padded": "enemy-padded-weapon/sprites/padded.json"}
def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def tint(im, h):
    r, g, b = hexrgb(h); c = im.split()
    return Image.merge("RGBA", (c[0].point(lambda v: v * r // 255), c[1].point(lambda v: v * g // 255), c[2].point(lambda v: v * b // 255), c[3]))
def fade(im, a): c = im.split(); return Image.merge("RGBA", c[:3] + (c[3].point(lambda v: int(v * a)),))
def frame(char, an, d, f, stars_a=1.0, injured=True):
    J = json.load(open(os.path.join(IA, SRC[char]))); base = os.path.dirname(os.path.join(IA, SRC[char])); fw, fh = J["frameWidth"], J["frameHeight"]
    ri = J["directions"].index(d); box = (f * fw, ri * fh, (f + 1) * fw, (ri + 1) * fh); A = J["animations"][an]["sheets"]
    def L(path): return Image.open(path).convert("RGBA").crop(box)
    O = M["characters"][char]["animations"].get(an, {}).get("sheets", {})
    out = Image.new("RGBA", (fw, fh))
    if injured: out.alpha_composite(fade(L(os.path.join(S, char, O["injured-stars-back"])), stars_a))
    if char == "player":
        for ln, t in (("body", None), ("gi", "#f2e9d8"), ("belt", "#f5d22e"), ("belt-rim", "#2e2a3a")):
            im = L(os.path.join(base, A[ln])); out.alpha_composite(tint(im, t) if t else im)
    else:
        for ln in [l["name"] for l in sorted(J["layers"], key=lambda l: l["order"])]:
            if ln == "telegraph" or ln not in A: continue
            out.alpha_composite(L(os.path.join(base, A[ln])))
    if injured:
        out.alpha_composite(L(os.path.join(S, char, O["injured-bandage"])))
        out.alpha_composite(fade(L(os.path.join(S, char, O["injured-stars-front"])), stars_a))
    return out
def sheet(cells, sc, path, bg=BG, pad=10):
    W = sum(c.width * sc + pad for c in cells) + pad; Hh = max(c.height for c in cells) * sc + 2 * pad
    o = Image.new("RGBA", (W, Hh), bg); x = pad
    for c in cells: c2 = c.resize((c.width * sc, c.height * sc), Image.NEAREST); o.alpha_composite(c2, (x, pad + Hh - 2 * pad - c2.height)); x += c2.width + pad
    return o
def stack(rows, path):
    W = max(r.width for r in rows); o = Image.new("RGBA", (W, sum(r.height for r in rows)), BG); y = 0
    for r in rows: o.alpha_composite(r, (0, y)); y += r.height
    o.save(os.path.join(P, path)); return o
def popup(word="Injured!", scale=1):
    pl = Image.open(os.path.join(S, "fx", "injured-popup_plate.png")).convert("RGBA"); W, Hh = pl.size; big = pl.resize((W * 4, Hh * 4), Image.LANCZOS)
    f = ImageFont.truetype(FONT, 30 * 4); f.set_variation_by_axes([900]); d = ImageDraw.Draw(big); x0, y0, x1, y1 = [v * 4 for v in M["fx"]["popup"]["textArea"]]
    bb = d.textbbox((0, 0), word, font=f); d.text(((x0 + x1 - bb[2]) / 2 - bb[0] / 2, (y0 + y1 - bb[3] - bb[1]) / 2), word, font=f, fill=M["fx"]["popup"]["textColour"])
    return big.resize((W * scale, Hh * scale), Image.LANCZOS)
dirs = ["S", "SE", "E", "NE", "N", "NW", "W", "SW"]
# 1: player all 8 directions, idle f0 + walk f3, before / after
r1 = [sheet([frame("player", "idle", d, 0, injured=False) for d in dirs[:3]] + [frame("player", "idle", d, 0) for d in dirs], 2, None),
      sheet([frame("player", "walk", d, 3) for d in dirs] + [frame("player", "hit", "S", 1)], 2, None)]
stack(r1, "review-1-player-8-directions-2x.png")
# 2: every enemy idle (S, E, N) + wind-up fade strip (stars 100 -> 50%)
rows = []
for c in ["swarmer", "shield", "brute", "keeper", "padded"]:
    wu = "windup_slam" if c == "keeper" else "windup"; nf = M["characters"][c]["animations"][wu]["frames"]
    cells = [frame(c, "idle", "S", 0, injured=False), frame(c, "idle", "S", 0), frame(c, "idle", "E", 2), frame(c, "move", "N", 1)]
    cells += [frame(c, wu, "SE", f, stars_a=max(0.5, 1 - 0.5 * min(1, f / 2))) for f in range(0, nf, max(1, nf // 5))]
    rows.append(sheet([x.crop(x.getbbox() and (0, 0, x.width, x.height)) for x in cells], 2, None))
stack(rows, "review-2-enemies-idle-then-windup-fade-2x.png")
# 3: pop-up (word sample + plate), puff strip
pf = Image.open(os.path.join(S, "fx", "injured-puff_shake-off.png")).convert("RGBA"); n = pf.width // 128
r3 = [sheet([popup(scale=2), Image.open(os.path.join(S, "fx", "injured-popup_plate.png")).convert("RGBA").resize((352, 112), Image.LANCZOS)], 1, None),
      sheet([pf.crop((i * 128, 0, (i + 1) * 128, 128)) for i in range(n)], 2, None)]
stack(r3, "review-3-popup-and-shake-off-puff-2x.png")
# 4: greyscale check of 1+2
for nm in ("review-1-player-8-directions-2x.png", "review-2-enemies-idle-then-windup-fade-2x.png"):
    ImageOps.grayscale(Image.open(os.path.join(P, nm)).convert("RGB")).save(os.path.join(P, nm.replace("review-", "greyscale-")))
# 5: phone-size scene: room floor, player injured with pop-up, Bopper injured in wind-up, a swarmer injured; at game 1x then scaled to 390 px wide
sc = Image.new("RGBA", (780, 460), FLOOR); d = ImageDraw.Draw(sc)
for y in range(0, 460, 46): d.line([(0, y), (780, y)], fill=(196, 166, 120, 255), width=2)
def put(im, gx, gy, anchor): sc.alpha_composite(im, (int(gx - anchor[0]), int(gy - anchor[1])))
put(frame("player", "idle", "SE", 0), 240, 300, (64, 136.96)); pu = popup(); put(pu, 240, 300 - 150, (pu.width / 2, pu.height))
put(frame("padded", "windup", "SW", 3, stars_a=0.5), 470, 280, (96, 142.08)); put(frame("swarmer", "idle", "W", 0), 620, 380, (64, 104.96))
put(frame("brute", "move", "S", 2), 120, 420, (json.load(open(os.path.join(IA, SRC["brute"])))["anchor"]["x"], json.load(open(os.path.join(IA, SRC["brute"])))["anchor"]["y"]))
sc.save(os.path.join(P, "review-4-scene-1x.png")); sc.resize((390, 230), Image.LANCZOS).save(os.path.join(P, "review-4-scene-phone-390px.png"))
print("ok")
