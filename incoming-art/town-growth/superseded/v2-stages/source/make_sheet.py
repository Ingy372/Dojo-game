"""One side-by-side sheet of the sample stages: columns White / Orange / Blue, rows day / dusk (932x430 each). Run after make_stages.py."""
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(HERE, "..", "stages"); OUT = os.path.join(HERE, "..", "previews")
COLS = (("1-white", "WHITE - a little run down, statue not here yet"), ("3-orange", "ORANGE - the approved town, plinth still empty"), ("5-blue", "BLUE - statue is here, first gentle light effects"))
try: f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 19)
except Exception: f = ImageFont.load_default()
CH = 34; sheet = Image.new("RGB", (932 * 3 + 20, (430 + CH) * 2 + 10), (36, 36, 44)); d = ImageDraw.Draw(sheet)
for ri, v in enumerate(("day", "dusk")):
    for ci, (k, label) in enumerate(COLS):
        x, y = ci * 942, ri * (430 + CH + 10)
        d.text((x + 8, y + 7), f"{label}  ({v})", fill=(255, 255, 255), font=f)
        sheet.paste(Image.open(os.path.join(S, f"{k}-{v}.png")).convert("RGB"), (x, y + CH))
os.makedirs(OUT, exist_ok=True); sheet.save(os.path.join(OUT, "samples-sheet.png")); print(sheet.size)
