"""Composite the town-square concept: sky gradient -> hazy far layer (hills + Tower) -> town.
Usage: python3 make_concept.py --far far.png --town town.png --outdir ../concept [--variant day|dusk]
Inputs are the @2x (80 ppt) renders from build_town_square.py --part far / --part town."""
import argparse, os
from PIL import Image
ap = argparse.ArgumentParser()
ap.add_argument("--far"); ap.add_argument("--town"); ap.add_argument("--outdir"); ap.add_argument("--variant", default="day"); ap.add_argument("--lights", default=None)
A = ap.parse_args()
SKY = {"day": ((150, 205, 245), (238, 247, 255)), "dusk": ((38, 40, 92), (214, 132, 120))}[A.variant]
HAZE = {"day": (214, 233, 250), "dusk": (120, 100, 150)}[A.variant]
town = Image.open(A.town).convert("RGBA"); W, H = town.size; PPT = W / 23.3
SHIFT = int(0.95 * PPT)   # slide the town down to open up sky; only the plain front paving row is cropped
FS = 0.92                 # A4-2: the Tower is bigger and easier to read (was 0.68)
t2 = Image.new("RGBA", (W, H)); t2.paste(town, (0, SHIFT)); town = t2
sky = Image.new("RGBA", (W, H))
top, bot = SKY
for y in range(H):
    t = min(1.0, y / (H * 0.32))
    sky.paste(tuple(int(a + (b - a) * t) for a, b in zip(top, bot)) + (255,), (0, y, W, y + 1))
far = Image.open(A.far).convert("RGBA")
far = far.resize((int(far.width * FS), int(far.height * FS)), Image.LANCZOS)
# atmospheric haze: pull the far layer 30% toward the sky colour, keep its alpha
r, g, b, a = far.split(); far = Image.merge("RGBA", (*Image.blend(Image.merge("RGB", (r, g, b)), Image.new("RGB", far.size, HAZE), 0.18).split(), a))
bb = far.getbbox()
# Tower (centre of far frame) goes over col 14.2; the bottom of the far layer hides behind the town's back hedge (~row 2.9)
dx = int(14.2 * PPT - far.width / 2)
col = far.crop((far.width // 2 - 2, 0, far.width // 2 + 2, far.height)).getbbox()   # the Tower's top (its light) in the far frame
dy = int(0.3 * PPT) - col[1]   # its light sits just under the top edge; its base hides behind the town
layer = Image.new("RGBA", (W, H)); layer.paste(far, (dx, dy), far); sky.alpha_composite(layer)
from PIL import ImageDraw, ImageFilter
if A.variant == "day":   # A4-4: just a few birds (kites removed) in the sky (behind the town, in front of the far layer)
    kd = ImageDraw.Draw(sky)
    for (c, rr, sz) in ((17.0, 0.7, 0.16), (17.5, 0.95, 0.12), (17.9, 0.6, 0.14), (8.3, 1.5, 0.12), (8.7, 1.35, 0.1)):
        x, y, k = c * PPT, rr * PPT, sz * PPT
        kd.line([(x - k, y - 0.4 * k), (x - 0.45 * k, y - 0.55 * k), (x, y), (x + 0.45 * k, y - 0.55 * k), (x + k, y - 0.4 * k)], fill=(84, 92, 128, 255), width=max(2, int(PPT * 0.03)), joint="curve")
sky.alpha_composite(town)
out = sky.convert("RGB")
if A.variant == "dusk":   # A4-2: darker and cozier - scene dimmed toward blue-violet, windows and lanterns glow warm
    from PIL import ImageChops, ImageFilter
    lit = out.copy()
    out = ImageChops.multiply(out, Image.new("RGB", out.size, (120, 112, 165)))
    out = Image.blend(out, Image.new("RGB", out.size, (60, 45, 70)), 0.1)
    if A.lights:
        m = Image.open(A.lights).convert("L"); mm = Image.new("L", (W, H)); mm.paste(m, (0, SHIFT)); m = mm
        warm = ImageChops.multiply(lit, Image.new("RGB", out.size, (255, 226, 170)))
        out.paste(warm, (0, 0), m)                                   # the lights themselves stay bright
        glow = m.filter(ImageFilter.GaussianBlur(int(0.35 * PPT))).point(lambda v: min(255, v * 3))
        out = Image.composite(Image.blend(out, Image.new("RGB", out.size, (255, 196, 110)), 0.55), out, glow.point(lambda v: v * 0.6))
        # A4-3: warm pools of light on the ground (and on the river) under every lantern, lamp and lit window
        pool = Image.new("L", (W, H)); pd = ImageDraw.Draw(pool)
        # A4-4: every pool sits on the ground right under its source (lantern posts, lamp posts, door, shop front, windows)
        for c, rr, sx in ((2.75, 4.7, 0.7), (4.45, 4.7, 0.7), (3.84, 4.75, 0.8),            # main dojo: two lanterns + lit door
                          (7.0, 4.85, 0.7), (11.6, 4.85, 0.7), (9.3, 5.05, 2.0),            # shop: two lanterns + lit front/awning lanterns
                          (18.3, 4.55, 0.6), (20.9, 4.55, 0.6),                             # placeholder windows
                          (5.0, 9.05, 1.0), (19.0, 9.05, 1.0),                              # lamp posts
                          (14.6, 8.65, 0.6), (16.6, 8.65, 0.6)):                            # bridge lanterns
            x, y = c * PPT, rr * PPT + SHIFT
            pd.ellipse((x - sx * PPT, y - 0.42 * PPT, x + sx * PPT, y + 0.42 * PPT), fill=255)
        pool = pool.filter(ImageFilter.GaussianBlur(int(0.3 * PPT)))
        out = Image.composite(Image.blend(out, Image.new("RGB", out.size, (255, 186, 104)), 0.8), out, pool)
        rf = Image.new("L", (W, H)); rd = ImageDraw.Draw(rf)   # warm lantern reflections on the river
        for lx in (14.6, 16.6):   # each bridge lantern's reflection, straight below it at the water's edge
            wx = min(max(lx, 14.95), 16.25)
            for k in range(6):
                y = (8.75 + k * 0.16) * PPT + SHIFT; hw = (0.16 - k * 0.02) * PPT
                rd.rectangle((wx * PPT - hw, y, wx * PPT + hw, y + 0.045 * PPT), fill=220)
        out = Image.composite(Image.new("RGB", out.size, (255, 214, 140)), out, rf.filter(ImageFilter.GaussianBlur(2)))
        out.paste(warm, (0, 0), m)
    # fireflies: only near the water (A4-4)
    import random; random.seed(11)
    ff = Image.new("L", (W, H)); fd = ImageDraw.Draw(ff); core = Image.new("L", (W, H)); cdd = ImageDraw.Draw(core)
    for i in range(16):
        x = random.uniform(14.0, 17.3) * PPT; y = random.uniform(4.2, 10.6) * PPT + SHIFT - random.uniform(0.2, 0.9) * PPT
        rad = random.uniform(0.045, 0.07) * PPT
        fd.ellipse((x - 4 * rad, y - 4 * rad, x + 4 * rad, y + 4 * rad), fill=120); cdd.ellipse((x - rad, y - rad, x + rad, y + rad), fill=255)
    # A4-5: a few more, scattered and subtle (hedges, trees, practice yard, bridge)
    for c, rr in ((1.2, 3.9), (6.2, 3.8), (12.8, 3.9), (21.4, 4.0), (6.9, 5.4), (17.9, 5.5), (1.3, 6.8), (22.0, 6.9),
                  (2.9, 7.1), (5.0, 7.6), (14.3, 7.6), (17.0, 7.8)):
        x = c * PPT; y = rr * PPT + SHIFT; rad = 0.045 * PPT
        fd.ellipse((x - 3 * rad, y - 3 * rad, x + 3 * rad, y + 3 * rad), fill=90); cdd.ellipse((x - rad, y - rad, x + rad, y + rad), fill=200)
    ff = ff.filter(ImageFilter.GaussianBlur(int(0.12 * PPT)))
    out = Image.composite(Image.new("RGB", out.size, (236, 255, 160)), out, ff.point(lambda v: v * 0.7))
    out = Image.composite(Image.new("RGB", out.size, (250, 255, 215)), out, core.filter(ImageFilter.GaussianBlur(1)))
    # the Tower's light glows too
    tl = Image.new("L", (W, H)); from PIL import ImageDraw; ImageDraw.Draw(tl).ellipse((14.2 * PPT - 0.9 * PPT, 0.1 * PPT, 14.2 * PPT + 0.9 * PPT, 1.6 * PPT), fill=150)
    tl = tl.filter(ImageFilter.GaussianBlur(int(0.4 * PPT)))
    out = Image.composite(Image.new("RGB", out.size, (255, 220, 140)), out, tl)
suf = "" if A.variant == "day" else "-dusk"
os.makedirs(A.outdir, exist_ok=True)
out.save(os.path.join(A.outdir, f"town-square-concept{suf}-932x430@2x.png"))
out.resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(A.outdir, f"town-square-concept{suf}-932x430.png"))
print("ok", out.size, "far bbox", bb, "offset", dx, dy)
