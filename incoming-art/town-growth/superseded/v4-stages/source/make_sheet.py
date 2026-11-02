"""The v4 review sheet: columns day / dusk, rows White WITH the smog layer on top (what the kid sees until the floor boss falls), White CLEARED (smog layer removed),
Blue (sakura; dusk has the fire bowl, paper lanterns, 12 fireflies). 932x430 each. Run after make_stages.py."""
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, ".."); S = os.path.join(G, "stages"); P = os.path.join(G, "previews")
ROWS = (("White + SMOG layer (before the White floor boss)", P, "1-white-with-smog-{v}.png"),
        ("White CLEARED (smog layer removed after the boss)", S, "1-white-{v}.png"),
        ("Blue - sakura trees (Red and up reuse this)", S, "5-blue-{v}.png"))
try: f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 19)
except Exception: f = ImageFont.load_default()
CH = 34; sheet = Image.new("RGB", (932 * 2 + 10, (430 + CH) * 3 + 20), (36, 36, 44)); d = ImageDraw.Draw(sheet)
for ri, (label, folder, pat) in enumerate(ROWS):
    for ci, v in enumerate(("day", "dusk")):
        x, y = ci * 942, ri * (430 + CH + 10)
        d.text((x + 8, y + 7), f"{label}  ({v})", fill=(255, 255, 255), font=f)
        sheet.paste(Image.open(os.path.join(folder, pat.format(v=v))).convert("RGB"), (x, y + CH))
os.makedirs(P, exist_ok=True); sheet.save(os.path.join(P, "samples-sheet.png")); print(sheet.size)
