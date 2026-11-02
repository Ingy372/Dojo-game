"""The v5 review sheet: columns day / dusk, rows White WITH the smog layer on top (what the kid sees until the floor boss falls), White CLEARED (smog layer removed),
Blue (sakura; dusk has the fire bowl, paper lanterns, 12 fireflies). 932x430 each. Run after make_stages.py."""
import os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, ".."); S = os.path.join(G, "stages"); P = os.path.join(G, "previews")
ROWS = (("White + SMOG layer (before the White floor boss)", P, "1-white-with-smog-{v}.png"),
        ("White CLEAR (smog fades out after the boss = after-boss look)", S, "1-white-{v}.png"),
        ("Blue v5 - sakura (Red and up reuse this)", S, "5-blue-{v}.png"))
try: f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 19)
except Exception: f = ImageFont.load_default()
CH = 34; sheet = Image.new("RGB", (932 * 2 + 10, (430 + CH) * 3 + 20), (36, 36, 44)); d = ImageDraw.Draw(sheet)
for ri, (label, folder, pat) in enumerate(ROWS):
    for ci, v in enumerate(("day", "dusk")):
        x, y = ci * 942, ri * (430 + CH + 10)
        d.text((x + 8, y + 7), f"{label}  ({v})", fill=(255, 255, 255), font=f)
        sheet.paste(Image.open(os.path.join(folder, pat.format(v=v))).convert("RGB"), (x, y + CH))
os.makedirs(P, exist_ok=True); sheet.save(os.path.join(P, "samples-sheet.png")); print(sheet.size)

# ---- v4 vs v5 Blue comparison (v4 lives in superseded/v4-stages/) ----
V4 = os.path.join(G, "superseded", "v4-stages")
def im(folder, name): return Image.open(os.path.join(folder, name)).convert("RGB")
CW, CHT = 932, 430; DET = (0, 560, 900, 860)       # detail crop @2x: the left-hand corner with the bench tree
cmp_ = Image.new("RGB", (CW * 2 + 10, (CHT + CH) * 2 + 10 + 330 * 2 + 20 + 2 * CH), (36, 36, 44)); d = ImageDraw.Draw(cmp_)
y = 0
for v in ("day", "dusk"):
    for ci, (lab, fol) in enumerate((("v4 (before)", V4), ("v5 (now)", S))):
        d.text((ci * (CW + 10) + 8, y + 7), f"Blue {v} - {lab}", fill=(255, 255, 255), font=f)
        cmp_.paste(im(fol, f"5-blue-{v}.png"), (ci * (CW + 10), y + CH))
    y += CHT + CH + 5
for v in ("day", "dusk"):
    for ci, (lab, fol) in enumerate((("v4", V4), ("v5", S))):
        c = im(fol, f"5-blue-{v}@2x.png").crop((0, 520, 1000, 860)).resize((CW, int(340 * CW / 1000)))
        d.text((ci * (CW + 10) + 8, y + 7), f"detail, Blue {v} - {lab}", fill=(255, 255, 255), font=f)
        cmp_.paste(c, (ci * (CW + 10), y + CH))
    y += int(340 * CW / 1000) + CH + 5
cmp_ = cmp_.crop((0, 0, cmp_.width, y)); cmp_.save(os.path.join(P, "compare-v4-v5-blue.png")); print(cmp_.size)
