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
if A.variant == "day":   # A4-3: kites and a few birds in the sky (behind the town, in front of the far layer)
    kd = ImageDraw.Draw(sky)
    for (c, rr, sz, col) in ((2.4, 0.9, 0.42, (79, 143, 214)), (10.4, 0.6, 0.36, (255, 207, 74)), (20.6, 1.4, 0.4, (87, 178, 106))):
        x, y, k = c * PPT, rr * PPT, sz * PPT
        tail = [(x + 0.1 * k, y + 1.3 * k)]
        for i in range(1, 7): tail.append((x + 0.1 * k + (0.35 * k if i % 2 else -0.35 * k), y + 1.3 * k + i * 0.55 * k))
        kd.line(tail, fill=(110, 90, 70, 255), width=max(2, int(PPT * 0.03)))
        for (tx, ty) in tail[2::2]:
            kd.polygon([(tx - 0.22 * k, ty - 0.12 * k), (tx + 0.22 * k, ty + 0.12 * k), (tx + 0.22 * k, ty - 0.12 * k), (tx - 0.22 * k, ty + 0.12 * k)], fill=(251, 243, 223, 255))
        kd.polygon([(x, y - k), (x + 0.72 * k, y), (x + 0.1 * k, y + 1.3 * k), (x - 0.72 * k, y)], fill=col + (255,), outline=(70, 42, 22, 255), width=max(2, int(PPT * 0.035)))
        kd.line([(x, y - k), (x + 0.1 * k, y + 1.3 * k)], fill=(255, 255, 255, 170), width=max(1, int(PPT * 0.025)))
        kd.line([(x - 0.72 * k, y), (x + 0.72 * k, y)], fill=(255, 255, 255, 170), width=max(1, int(PPT * 0.025)))
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
        for c, rr, sx in ((2.75, 4.7, 1.0), (4.45, 4.7, 1.0), (3.6, 4.6, 1.2), (7.0, 4.9, 1.0), (11.6, 4.9, 1.0), (9.3, 5.0, 2.2),
                          (5.0, 9.05, 1.3), (19.0, 9.05, 1.3), (14.15, 8.65, 1.2), (17.05, 8.65, 1.2), (15.6, 9.2, 0.8), (19.6, 4.7, 1.8)):
            x, y = c * PPT, rr * PPT + SHIFT
            pd.ellipse((x - sx * PPT, y - 0.42 * PPT, x + sx * PPT, y + 0.42 * PPT), fill=255)
        pool = pool.filter(ImageFilter.GaussianBlur(int(0.3 * PPT)))
        out = Image.composite(Image.blend(out, Image.new("RGB", out.size, (255, 186, 104)), 0.8), out, pool)
        rf = Image.new("L", (W, H)); rd = ImageDraw.Draw(rf)   # warm lantern reflections on the river
        for k in range(9):
            y = (8.9 + k * 0.17) * PPT + SHIFT; hw = (0.5 - k * 0.04) * PPT
            rd.rectangle((15.6 * PPT - hw, y, 15.6 * PPT + hw, y + 0.05 * PPT), fill=230)
        out = Image.composite(Image.new("RGB", out.size, (255, 214, 140)), out, rf.filter(ImageFilter.GaussianBlur(2)))
        out.paste(warm, (0, 0), m)
    # fireflies / soft floating lights
    import random; random.seed(11)
    ff = Image.new("L", (W, H)); fd = ImageDraw.Draw(ff); core = Image.new("L", (W, H)); cdd = ImageDraw.Draw(core)
    for i in range(34):
        x = random.uniform(0.3, 23.0) * PPT; y = random.uniform(2.2, 9.6) * PPT + (SHIFT if i % 3 else 0)
        rad = random.uniform(0.045, 0.07) * PPT
        fd.ellipse((x - 4 * rad, y - 4 * rad, x + 4 * rad, y + 4 * rad), fill=120); cdd.ellipse((x - rad, y - rad, x + rad, y + rad), fill=255)
    ff = ff.filter(ImageFilter.GaussianBlur(int(0.12 * PPT)))
    out = Image.composite(Image.new("RGB", out.size, (236, 255, 160)), out, ff.point(lambda v: v * 0.7))
    out = Image.composite(Image.new("RGB", out.size, (250, 255, 215)), out, core.filter(ImageFilter.GaussianBlur(1)))
    # the Tower's light glows too
    tl = Image.new("L", (W, H)); from PIL import ImageDraw; ImageDraw.Draw(tl).ellipse((14.2 * PPT - 0.9 * PPT, 0.1 * PPT, 14.2 * PPT + 0.9 * PPT, 1.6 * PPT), fill=150)
    ImageDraw.Draw(tl).ellipse((21.3 * PPT - 0.45 * PPT, 0.3 * PPT, 21.3 * PPT + 0.45 * PPT, 1.1 * PPT), fill=130)   # the lighthouse lamp
    tl = tl.filter(ImageFilter.GaussianBlur(int(0.4 * PPT)))
    out = Image.composite(Image.new("RGB", out.size, (255, 220, 140)), out, tl)
suf = "" if A.variant == "day" else "-dusk"
os.makedirs(A.outdir, exist_ok=True)
out.save(os.path.join(A.outdir, f"town-square-concept{suf}-932x430@2x.png"))
out.resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(A.outdir, f"town-square-concept{suf}-932x430.png"))
print("ok", out.size, "far bbox", bb, "offset", dx, dy)
