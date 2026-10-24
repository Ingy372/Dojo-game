"""Batch 8 icon previews: per-set sheets (gear / Insights / Seals) at 1x and 2x on the menu colour and on the rarity colours,
plus a phone-size mock.   python3 icons/source/make_icon_preview.py   (from incoming-art/)"""
import os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); SP = os.path.join(HERE, "..", "sprites"); OUT = os.path.join(HERE, "..", "preview"); os.makedirs(OUT, exist_ok=True)
SETS = {"gear": ["cloth-wraps", "leather-wraps", "tiger-wraps", "training-gi", "padded-gi", "mountain-gi", "jade-charm", "lotus-charm", "crane-charm"],
        "insights": ["ripple-counter", "iron-skin", "wind-step", "double-strike", "quick-hands", "press-the-advantage", "shield-breaker", "heavy-hands", "rally"],
        "seals": ["off-balance", "escape-step", "sweep", "steady-breath", "strong-block", "sharp-eyes", "create-distance", "disarm", "throw", "follow-through"]}
BG = [(46, 42, 58), (90, 90, 96), (46, 110, 70), (50, 80, 150), (110, 60, 150)]  # menu, common, uncommon, rare, epic (preview only)
ico = lambda i: Image.open(os.path.join(SP, f"icon-{i}.png")).convert("RGBA")
for name, ids in SETS.items():
    for sc, sz in (("1x", 64), ("2x", 128)):
        out = Image.new("RGBA", (len(ids) * (sz + 12) + 12, len(BG) * (sz + 12) + 12))
        for r, bg in enumerate(BG):
            ImageDraw.Draw(out).rectangle((0, r * (sz + 12), out.width, (r + 1) * (sz + 12) + 12), fill=bg + (255,))
            for c, i in enumerate(ids): out.alpha_composite(ico(i).resize((sz, sz), Image.LANCZOS), (12 + c * (sz + 12), 12 + r * (sz + 12)))
        out.save(os.path.join(OUT, f"sheet-{name}-{sc}.png"))
# phone mock: 390x844 screen, icons at 48 px in a reward row and a 3-column grid
ph = Image.new("RGBA", (390, 844), (46, 42, 58, 255)); d = ImageDraw.Draw(ph); allids = sum(SETS.values(), [])
for k, i in enumerate(allids):
    x, y = 24 + (k % 6) * 60, 120 + (k // 6) * 72; d.rounded_rectangle((x - 4, y - 4, x + 52, y + 52), 10, fill=(70, 64, 86, 255))
    ph.alpha_composite(ico(i).resize((48, 48), Image.LANCZOS), (x, y))
ph.save(os.path.join(OUT, "phone-mock.png"))
print("wrote", OUT)
