"""Preview boards for the A1 cosmetics samples (composited exactly like the game: aura-back, player layers, cosmetics, aura-front).
    python3 incoming-art/cosmetics-a1/source/make_cosmetics_preview.py"""
import os
from PIL import Image, ImageOps
from cosm_lib import BASE, Sheets, compose, on_bg, ART
SP = os.path.join(ART, "cosmetics-a1", "sprites", "body-a"); OUT = os.path.join(ART, "cosmetics-a1", "previews")
os.makedirs(OUT, exist_ok=True)
COS = Sheets(SP, "player-a.json"); AURA = Sheets(SP, "aura.json")
SK, HR = BASE.J["palettes"]["skin"], BASE.J["palettes"]["hair"]
N = BASE.J["animations"]["idle"]["frames"]; MS = int(1000 / BASE.J["animations"]["idle"]["fps"])
WRAPS = ["wraps-cloth", "wraps-leather", "wraps-tiger"]
KIDS = [dict(skin=SK[1], hair=HR[1], gi="#f2f2f2", face="face-01", hairStyle="hair-01", belt="Yellow"),
        dict(skin=SK[6], hair=HR[0], gi="#24345e", face="face-03", hairStyle="hair-04", belt="Green"),
        dict(skin=SK[3], hair=HR[4], gi="#3a6ea5", face="face-05", hairStyle="hair-06", belt="Orange")]
HB = "#ffd36b"
def grid(ims, cols, pad=0):
    w, h = ims[0].size; g = Image.new("RGBA", (cols * w, ((len(ims) + cols - 1) // cols) * h))
    for i, im in enumerate(ims): g.paste(im, ((i % cols) * w, (i // cols) * h))
    return g
def gif(name, frames): frames[0].save(os.path.join(OUT, name), save_all=True, append_images=frames[1:], duration=MS, loop=0, disposal=2)
DIRS = ["S", "SE", "E", "NE", "N", "NW", "W", "SW"]
# 1. headband + the three wraps on idle
kit = lambda i: [("headband", HB), (WRAPS[i], None)]
grid([on_bg(compose(KIDS[i], "idle", d, 0, COS, kit(i)), 3) for i in range(3) for d in DIRS], 8).save(os.path.join(OUT, "sample-1-headband-wraps.png"))
gif("sample-1-headband-wraps.gif", [grid([on_bg(compose(KIDS[i], "idle", d, f, COS, kit(i)), 3) for i in range(3) for d in ("S", "SE")], 6) for f in range(N)])
# 2. gi trim on several gi colours (trim tint is a game choice; these are suggestions only)
TRIMS = [("#f2f2f2", "#3a6ea5"), ("#24345e", "#ffd36b"), ("#3a6ea5", "#f2f2f2"), ("#3f7a4a", "#ffd36b"), ("#4a4a55", "#7fb2e0")]
BELTS = ["White", "Blue", "Brown", "Green", "Black"]
kid = lambda gi, b, j: dict(skin=SK[(j * 2) % 10], hair=HR[j % 5], gi=gi, face=f"face-0{j % 6 + 1}", hairStyle=f"hair-0{j % 9 + 1}", belt=b)
grid([on_bg(compose(kid(g, BELTS[j], j), "idle", d, 0, COS, [("gi-trim", t)]), 3) for d in ("S", "SE", "N") for j, (g, t) in enumerate(TRIMS)], 5).save(os.path.join(OUT, "sample-2-gi-trim.png"))
grid([on_bg(compose(kid(g, BELTS[j], j), "idle", "SE", 0, COS, x), 3) for x in ([], [("gi-trim", None)]) for j, (g, t) in enumerate(TRIMS) for _ in [0] if True][:5] +
     [on_bg(compose(kid(g, BELTS[j], j), "idle", "SE", 0, COS, [("gi-trim", t)]), 3) for j, (g, t) in enumerate(TRIMS)], 5).save(os.path.join(OUT, "sample-2-gi-trim-before-after.png"))
gif("sample-2-gi-trim.gif", [grid([on_bg(compose(kid(g, BELTS[j], j), "idle", "SE", f, COS, [("gi-trim", t)]), 3) for j, (g, t) in enumerate(TRIMS)], 5) for f in range(N)])
# 3. soft aura (tints are suggestions; picked away from the elite-enemy aura colours, and never red)
AT = ["#fff6c8", "#7fe0c0", "#c7b8ff"]
gif("sample-3-aura.gif", [grid([on_bg(compose(KIDS[i], "idle", "S", f, aura=(AURA, AT[i], f)), 3) for i in range(3)], 3) for f in range(N)])
grid([on_bg(compose(KIDS[0], "idle", d, 0, aura=(AURA, AT[0], 0)), 3) for d in DIRS], 8).save(os.path.join(OUT, "sample-3-aura-directions.png"))
# checks: phone size (1x and 2x), greyscale, headband on every hairstyle
full = lambda i, d, f=0: compose(KIDS[i], "idle", d, f, COS, [("gi-trim", ["#3a6ea5", "#ffd36b", "#f2f2f2"][i])] + kit(i), aura=(AURA, AT[i], f))
one = grid([on_bg(full(i, d)) for i in range(3) for d in ("S", "SE", "N")], 9)
one.save(os.path.join(OUT, "check-phone-1x.png")); one.resize((one.width * 2, one.height * 2), Image.NEAREST).save(os.path.join(OUT, "check-phone-2x.png"))
ImageOps.grayscale(grid([on_bg(compose(KIDS[i], "idle", "SE", 0, COS, kit(i)), 3) for i in range(3)], 3)).save(os.path.join(OUT, "check-greyscale-wraps.png"))
grid([on_bg(compose(dict(KIDS[0], hairStyle=f"hair-{h:02d}", hair=HR[h % 10]), "idle", d, 0, COS, [("headband", HB)]), 2)
      for d in ("S", "N") for h in range(1, 13)], 12).save(os.path.join(OUT, "check-headband-all-hair.png"))
print("previews ->", OUT)
