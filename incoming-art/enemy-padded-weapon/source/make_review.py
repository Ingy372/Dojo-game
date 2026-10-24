"""A5 review boards: the 3 samples, the padded enemy next to the Tier 1 family (same 80 px per tile, aligned on the
feet), the disarmed look (weapon layer off), and a true phone-size check.
    python3 incoming-art/enemy-padded-weapon/source/make_review.py"""
import os, sys
from PIL import Image, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); ART = os.path.join(HERE, "..", "..")
sys.path.insert(0, os.path.join(ART, "tools"))
from make_creature_preview import load, composite, to_img, cell
PD = os.path.join(ART, "enemy-padded-weapon", "sprites"); OUT = os.path.join(ART, "enemy-padded-weapon", "preview")
M = load(PD)
def frame(folder, meta, anim, d, f, w=("weapon",)):
    return to_img(cell(composite(folder, meta, anim, w), meta, d, f))
def place(im, meta, cw=200, ch=170, foot=150):   # centre on the feet
    c = Image.new("RGBA", (cw, ch), (0, 0, 0, 0)); ax, ay = meta["anchor"]["x"], meta["anchor"]["y"]
    c.paste(im, (int(cw / 2 - ax), int(foot - ay))); return c
def grid(ims, cols, bg=(47, 42, 61, 255)):
    w, h = ims[0].size; g = Image.new("RGBA", (cols * w, -(-len(ims) // cols) * h), bg)
    for i, im in enumerate(ims): g.alpha_composite(im, ((i % cols) * w, (i // cols) * h))
    return g
DIRS = ["S", "SE", "E", "NE", "N", "NW", "W", "SW"]
nw = M["animations"]["windup"]["frames"]
S = [("idle", 0), ("windup", nw - 1), ("attack", 0)]
b = grid([frame(PD, M, a, d, f) for a, f in S for d in DIRS], 8)
b.resize((b.width * 2, b.height * 2), Image.NEAREST).save(os.path.join(OUT, "review-1-three-samples.png"))
# disarmed: same frames, weapon layer simply not drawn
b = grid([frame(PD, M, a, d, f, w) for w in (("weapon",), ()) for a, f in S for d in ("S", "E")], 6)
b.resize((b.width * 2, b.height * 2), Image.NEAREST).save(os.path.join(OUT, "review-2-with-and-disarmed.png"))
# family lineup: feet aligned, same scale (S and E, idle and wind-up)
fam = []
for e in ("swarmer", "shield", "brute"):
    f_ = os.path.join(ART, "enemies-tier1", e, "sprites"); m = load(f_)
    fam.append((f_, m, ("shield",) if e == "shield" else ()))
fam.append((PD, M, ("weapon",)))
ims = []
for a, d in (("idle", "S"), ("idle", "E"), ("windup", "SE")):
    for f_, m, w in fam:
        fr = 0 if a == "idle" else m["animations"][a]["frames"] - 1
        im = Image.fromarray((cell(composite(f_, m, a, w), m, d, fr).clip(0, 1) * 255).astype("uint8"), "RGBA")
        ims.append(place(im, m, 230, 200, 175))
b = grid(ims, 4); b.resize((b.width * 2, b.height * 2), Image.NEAREST).save(os.path.join(OUT, "review-3-family-lineup.png"))
b.save(os.path.join(OUT, "check-phone-1x.png"))
ImageOps.grayscale(b).save(os.path.join(OUT, "check-greyscale.png"))
print("review boards ->", OUT)
