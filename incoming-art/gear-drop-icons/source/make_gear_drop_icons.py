"""Gear drop icons for the loot screen: one per gear slot x rarity (A-BEST 4, Art Director bot).
Slots and rarities are read from content/loot/gear.json (slot values of items + rarityNames keys).
Badge = A3 badge family (thick rim, cream-lit inner disc, dark outline, pips) holding the slot's existing
A6/Batch-8 gear icon (incoming-art/icons/sprites). Rarity reads three ways: rim COLOUR (ui/theme.ts RARITY_COLOR),
FRAME SHAPE, and PIP COUNT (1-5).
    python3 incoming-art/gear-drop-icons/source/make_gear_drop_icons.py      (run from repo root)"""
import json, math, os, colorsys
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..", "..", ".."); OUT = os.path.join(HERE, "..")
gear = json.load(open(os.path.join(ROOT, "content/loot/gear.json")))
RAR = list(gear["rarityNames"].keys())                          # common uncommon rare epic legendary
SLOTS = list(dict.fromkeys(i["slot"] for i in gear["items"]))   # hands gi charm
COLOR = {"common": "#d8d2c4", "uncommon": "#5cd65c", "rare": "#4ea3ff", "epic": "#b46cff", "legendary": "#ffb02e"}  # apps/client/src/ui/theme.ts
GLYPH = {"hands": "cloth-wraps", "gi": "training-gi", "charm": "jade-charm"}   # first item of each slot in gear.json
SHAPE = {"common": "circle", "uncommon": "rounded-square", "rare": "hexagon", "epic": "scalloped", "legendary": "sunburst"}
SS = 4; N = 128 * SS; C = N / 2; INK = (20, 17, 32, 255)
def hx(h, a=255): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (a,)
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c[:3]) + (c[3],)
def poly(n, r, rot=0, cx=C, cy=C): return [(cx + r * math.cos(rot + 2 * math.pi * i / n), cy + r * math.sin(rot + 2 * math.pi * i / n)) for i in range(n)]
def shape_mask(kind, r):
    m = Image.new("L", (N, N)); d = ImageDraw.Draw(m)
    if kind == "circle": d.ellipse((C - r, C - r, C + r, C + r), fill=255)
    elif kind == "rounded-square": q = r * 0.9; d.rounded_rectangle((C - q, C - q, C + q, C + q), r * 0.3, fill=255)
    elif kind == "hexagon":
        d.polygon(poly(6, r * 0.98, math.pi / 6), fill=255); m = m.filter(ImageFilter.GaussianBlur(SS * 2)).point(lambda v: 255 if v > 128 else 0)
    elif kind == "scalloped":
        d.ellipse((C - r * 0.86, C - r * 0.86, C + r * 0.86, C + r * 0.86), fill=255)
        for x, y in poly(10, r * 0.82, -math.pi / 2): d.ellipse((x - r * 0.2, y - r * 0.2, x + r * 0.2, y + r * 0.2), fill=255)
    elif kind == "sunburst":
        pts = []   # 8-point star with soft (blurred-then-thresholded) points: very different from the scalloped epic
        for i in range(16):
            a = math.pi * i / 8 - math.pi / 2; rr = r * (1.08 if i % 2 == 0 else 0.84); pts.append((C + rr * math.cos(a), C + rr * math.sin(a)))
        d.polygon(pts, fill=255); m = m.filter(ImageFilter.GaussianBlur(SS * 2.5)).point(lambda v: 255 if v > 128 else 0)
    return m
def no_red(im):
    """the existing charm has a red cord/tassel; shift red pixels to gold (red = danger in this game)."""
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if (h < 0.06 or h > 0.93) and s > 0.45:
                nr, ng, nb = colorsys.hsv_to_rgb(0.12, s * 0.9, min(1, v * 1.1)); px[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
    return im
def badge(slot, rar):
    col = hx(COLOR[rar]); kind = SHAPE[rar]; R = 50 * SS
    img = Image.new("RGBA", (N, N))
    outer = shape_mask(kind, R + 3 * SS); rim = shape_mask(kind, R)
    img.paste(Image.new("RGBA", (N, N), INK), (0, 0), outer)                    # dark outline
    img.paste(Image.new("RGBA", (N, N), shade(col, 0.72)), (0, 0), rim)         # rim shadow
    hi = shape_mask(kind, R - 2 * SS).transform((N, N), Image.AFFINE, (1, 0, 2 * SS, 0, 1, 3 * SS))
    img.paste(Image.new("RGBA", (N, N), col), (0, 0), hi)                       # rim lit (light from top-left)
    ir = 37 * SS; d = ImageDraw.Draw(img)
    d.ellipse((C - ir - 2 * SS, C - ir - 2 * SS, C + ir + 2 * SS, C + ir + 2 * SS), fill=INK)
    d.ellipse((C - ir, C - ir, C + ir, C + ir), fill=(58, 50, 82, 255))         # inner disc (menu indigo, lifted)
    d.ellipse((C - ir * 0.92, C - ir * 0.98, C + ir * 0.86, C + ir * 0.8), fill=(70, 61, 98, 255))
    g = Image.open(os.path.join(ROOT, "incoming-art/icons/sprites", f"icon-{GLYPH[slot]}.png")).convert("RGBA")
    if slot == "charm": g = no_red(g)
    g = g.crop(g.getbbox()); k = (56 * SS) / max(g.size); g = g.resize((int(g.width * k), int(g.height * k)), Image.LANCZOS)
    img.alpha_composite(g, (int(C - g.width / 2), int(C - g.height / 2 - 6 * SS)))
    n = RAR.index(rar) + 1; sp = 9 * SS; y = C + 34 * SS                     # pips: 1-5 cream dots on a dark pill
    w = (n - 1) * sp; d = ImageDraw.Draw(img)
    d.rounded_rectangle((C - w / 2 - 7 * SS, y - 7 * SS, C + w / 2 + 7 * SS, y + 7 * SS), 7 * SS, fill=INK)
    for i in range(n):
        x = C - w / 2 + i * sp; d.ellipse((x - 3.5 * SS, y - 3.5 * SS, x + 3.5 * SS, y + 3.5 * SS), fill=(255, 246, 220, 255))
    out = Image.new("RGBA", (128, 128)); out.alpha_composite(img.resize((110, 110), Image.LANCZOS), (9, 9))   # keeps >= 8 px margin
    return out
manifest = {"notes": "Gear drop icons for the loot screen, one per slot x rarity. 128x128, transparent, anchor centre (64,64). Rarity reads by colour + frame shape + pip count. Slots/rarities from content/loot/gear.json; colours from apps/client/src/ui/theme.ts RARITY_COLOR.",
            "size": [128, 128], "anchor": [64, 64], "rarityShape": SHAPE, "rarityPips": {r: i + 1 for i, r in enumerate(RAR)}, "icons": {}}
icons = {}
for s in SLOTS:
    for r in RAR:
        f = f"drop-{s}-{r}.png"; im = badge(s, r); im.save(os.path.join(OUT, "sprites", f)); icons[(s, r)] = im
        manifest["icons"][f"{s}:{r}"] = {"slot": s, "rarity": r, "rarityName": gear["rarityNames"][r], "file": f"sprites/{f}", "glyphFrom": f"incoming-art/icons/sprites/icon-{GLYPH[s]}.png"}
json.dump(manifest, open(os.path.join(OUT, "sprites", "manifest.json"), "w"), indent=2)
# previews
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
def grid(scale, bg=(34, 29, 46)):
    c = int(128 * scale) + 16; W = 140 + c * len(RAR); H = 40 + c * len(SLOTS)
    o = Image.new("RGBA", (W, H), bg + (255,)); d = ImageDraw.Draw(o)
    for j, r in enumerate(RAR): d.text((140 + j * c, 8), gear["rarityNames"][r], font=F, fill=(236, 232, 248))
    for i, s in enumerate(SLOTS):
        d.text((10, 40 + i * c + c // 2 - 10), s, font=F, fill=(236, 232, 248))
        for j, r in enumerate(RAR): o.alpha_composite(icons[(s, r)].resize((int(128 * scale),) * 2, Image.LANCZOS), (140 + j * c, 40 + i * c))
    return o
P = os.path.join(OUT, "preview"); g = grid(1); g.convert("RGB").save(f"{P}/sheet_1x.png")
ImageOps.grayscale(g.convert("RGB")).save(f"{P}/sheet_grey.png")
# phone size: loot screen mock at 1x phone points (390 wide), 48 pt and 64 pt icons in rows with a text bar
ph = Image.new("RGBA", (390, 520), (34, 29, 46, 255)); d = ImageDraw.Draw(ph); FS = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
d.text((16, 12), "Loot (boss chest)", font=F, fill=(236, 232, 248))
for k, (s, r) in enumerate([("hands", "common"), ("gi", "uncommon"), ("charm", "rare"), ("hands", "epic"), ("gi", "legendary")]):
    y = 48 + k * 72; d.rounded_rectangle((12, y, 378, y + 64), 10, fill=(44, 38, 62), outline=hx(COLOR[r]), width=2)
    ph.alpha_composite(icons[(s, r)].resize((56, 56), Image.LANCZOS), (18, y + 4))
    d.text((84, y + 12), f"{gear['rarityNames'][r]}: {s}", font=FS, fill=hx(COLOR[r])); d.rounded_rectangle((84, y + 36, 300, y + 46), 5, fill=(80, 72, 104))
for j, r in enumerate(RAR): ph.alpha_composite(icons[("charm", r)].resize((48, 48), Image.LANCZOS), (20 + j * 72, 420))
d.text((16, 478), "48 pt grid slots", font=FS, fill=(170, 164, 200))
ph.convert("RGB").save(f"{P}/phone_1x.png"); ph.convert("RGB").resize((780, 1040), Image.LANCZOS).save(f"{P}/phone_2x.png")
ImageOps.grayscale(ph.convert("RGB")).save(f"{P}/phone_grey.png")
print("ok", len(icons))
