"""
Dojo Ascent - icon SAMPLES preview (Art Director bot).   python3 icons/source/make_icon_preview.py  (from incoming-art/)

Writes icons/preview/:
- icons-on-backgrounds.png: each icon at 1x (128 px) and 2x on the dark menu colour and the five rarity colours
  (common, uncommon, rare, epic, legendary) - the colours are just plain tiles here, not a frame design.
- icons-phone-size.png: a mock menu list at true phone size (icons drawn at 48 and 64 px, as on a ~390 pt wide phone),
  shown at 1x so it looks like the phone screen, plus a 2x zoom of the same.
- margin-check.png: each icon with its 8 px safe margin marked.
Needs Python 3 with Pillow.
"""
import json, os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); SP = os.path.join(HERE, "..", "sprites"); OUT = os.path.join(HERE, "..", "preview")
os.makedirs(OUT, exist_ok=True)
M = json.load(open(os.path.join(SP, "static.json")))["sprites"]
IDS = ["icon-cloth-wraps", "icon-ripple-counter", "icon-strong-block"]
IC = {i: Image.open(os.path.join(SP, i + '.png')).convert("RGBA") for i in IDS}
BG = [("menu", "#221d2e"), ("common", "#d8d2c4"), ("uncommon", "#5cd65c"), ("rare", "#4ea3ff"), ("epic", "#b46cff"), ("legendary", "#ffb02e")]
def rs(im, s): return im.resize((im.width * s // 1 if isinstance(s, int) else s[0], im.height * s if isinstance(s, int) else s[1]), Image.LANCZOS if not isinstance(s, int) else Image.NEAREST)
# 1. backgrounds, 1x and 2x
for scale, name in ((1, "1x"), (2, "2x")):
    cell = 128 * scale + 16
    out = Image.new("RGBA", (len(BG) * cell + 10, len(IDS) * cell + 30), (46, 42, 58, 255)); d = ImageDraw.Draw(out)
    for j, (n, h) in enumerate(BG):
        d.text((10 + j * cell, 6), n + " " + h, fill=(255, 255, 255, 255))
        for i, k in enumerate(IDS):
            x, y = 10 + j * cell, 24 + i * cell
            d.rectangle((x, y, x + 128 * scale - 1, y + 128 * scale - 1), fill=h)
            out.alpha_composite(rs(IC[k], scale), (x, y))
    out.save(os.path.join(OUT, f"icons-on-backgrounds-{name}.png"))
# 2. phone-size mock (one 390 x 360 slice of a menu), 1x and 2x
ph = Image.new("RGBA", (390, 360), "#221d2e"); d = ImageDraw.Draw(ph)
y = 14
for k, (rn, rh) in zip(IDS, BG[2:5]):
    d.rounded_rectangle((12, y, 378, y + 76), 10, fill="#2e2740")
    d.rounded_rectangle((20, y + 6, 84, y + 70), 8, fill=rh)
    ph.alpha_composite(IC[k].resize((64, 64), Image.LANCZOS), (20, y + 6))
    d.rectangle((96, y + 22, 300, y + 32), fill="#5a5070"); d.rectangle((96, y + 44, 240, y + 52), fill="#3f3852")   # placeholder bars, not text
    y += 88
for i, k in enumerate(IDS):     # a row of small 48 px slots (inventory grid)
    d.rounded_rectangle((20 + i * 60, 352 - 8 - 48, 20 + i * 60 + 48, 352 - 8), 6, fill=BG[1][1])
    ph.alpha_composite(IC[k].resize((48, 48), Image.LANCZOS), (20 + i * 60, 352 - 8 - 48))
ph.save(os.path.join(OUT, "icons-phone-size-1x.png")); ph.resize((780, 720), Image.NEAREST).save(os.path.join(OUT, "icons-phone-size-2x.png"))
# 3. margin check
mc = Image.new("RGBA", (3 * 148 + 10, 158), (46, 42, 58, 255)); d = ImageDraw.Draw(mc)
for i, k in enumerate(IDS):
    x = 10 + i * 148; d.rectangle((x, 10, x + 127, 137), fill="#d8d2c4"); mc.alpha_composite(IC[k], (x, 10))
    d.rectangle((x + 8, 18, x + 119, 129), outline=(255, 0, 0, 255)); bb = IC[k].getbbox()
    d.text((x, 142), f"bbox {bb}", fill=(255, 255, 255, 255))
mc.save(os.path.join(OUT, "margin-check.png"))
print("wrote", OUT)
