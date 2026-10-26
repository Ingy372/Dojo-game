"""Composite the town-square concept: sky gradient -> hazy far layer (hills + Tower) -> town.
Usage: python3 make_concept.py --far far.png --town town.png --outdir ../concept [--variant day|dusk]
Inputs are the @2x (80 ppt) renders from build_town_square.py --part far / --part town."""
import argparse, os
from PIL import Image
ap = argparse.ArgumentParser()
ap.add_argument("--far"); ap.add_argument("--town"); ap.add_argument("--outdir"); ap.add_argument("--variant", default="day")
A = ap.parse_args()
SKY = {"day": ((150, 205, 245), (238, 247, 255)), "dusk": ((122, 128, 196), (255, 214, 160))}[A.variant]
HAZE = {"day": (214, 233, 250), "dusk": (236, 200, 190)}[A.variant]
town = Image.open(A.town).convert("RGBA"); W, H = town.size; PPT = W / 23.3
SHIFT = int(0.95 * PPT)   # slide the town down to open up sky; only the plain front paving row is cropped
FS = 0.68                 # far layer shrinks to half: the Tower reads as distant
t2 = Image.new("RGBA", (W, H)); t2.paste(town, (0, SHIFT)); town = t2
sky = Image.new("RGBA", (W, H))
top, bot = SKY
for y in range(H):
    t = min(1.0, y / (H * 0.32))
    sky.paste(tuple(int(a + (b - a) * t) for a, b in zip(top, bot)) + (255,), (0, y, W, y + 1))
far = Image.open(A.far).convert("RGBA")
far = far.resize((int(far.width * FS), int(far.height * FS)), Image.LANCZOS)
# atmospheric haze: pull the far layer 30% toward the sky colour, keep its alpha
r, g, b, a = far.split(); far = Image.merge("RGBA", (*Image.blend(Image.merge("RGB", (r, g, b)), Image.new("RGB", far.size, HAZE), 0.3).split(), a))
bb = far.getbbox()
# Tower (centre of far frame) goes over col 14.2; the bottom of the far layer hides behind the town's back hedge (~row 2.9)
dx = int(14.2 * PPT - far.width / 2)
col = far.crop((far.width // 2 - 2, 0, far.width // 2 + 2, far.height)).getbbox()   # the Tower's top (its light) in the far frame
dy = int(0.3 * PPT) - col[1]   # its light sits just under the top edge; its base hides behind the town
layer = Image.new("RGBA", (W, H)); layer.paste(far, (dx, dy), far); sky.alpha_composite(layer)
sky.alpha_composite(town)
out = sky.convert("RGB")
if A.variant == "dusk":   # warm the whole scene a little, lamps and windows stay bright
    out = Image.blend(out, Image.new("RGB", out.size, (255, 190, 140)), 0.12)
suf = "" if A.variant == "day" else "-dusk"
os.makedirs(A.outdir, exist_ok=True)
out.save(os.path.join(A.outdir, f"town-square-concept{suf}-932x430@2x.png"))
out.resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(A.outdir, f"town-square-concept{suf}-932x430.png"))
print("ok", out.size, "far bbox", bb, "offset", dx, dy)
