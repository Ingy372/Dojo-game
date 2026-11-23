"""Shop card icons for the skins: the v2 hero (body A, default look) wearing each skin, cut from the rendered sheets.
Outfits show the whole hero, hats the head, back pieces the hero from behind. Writes a static.json the art importer
packs as "shop-icons".

    python incoming-art/claude-hero-v2/source/make_shop_icons.py
"""
import json, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
BASE = os.path.join(ROOT, "sprites", "body-a")
SKINS = os.path.join(ROOT, "sprites-skins", "body-a")
OUT = os.path.join(ROOT, "shop-icons")
os.makedirs(OUT, exist_ok=True)
base = json.load(open(os.path.join(BASE, "player-a.json")))
skins = json.load(open(os.path.join(SKINS, "player-a.json")))
FW, FH = base["frameWidth"], base["frameHeight"]
DIRS = base["directions"]
TINT = {"skin": "#e8b896", "gi": "#f2f2f2", "belt": "#f5d22e", "belt-rim": "#2e2a3a", "hair-02": "#3a2519"}
catalog = json.load(open(os.path.join(ROOT, "..", "..", "content", "shop", "catalog.json"), encoding="utf8"))
hides = {i["layer"] for i in catalog["items"] if i.get("hidesHair")}


def frame(folder, meta, layer, d, f=0):
    sheet = meta["animations"]["idle"]["sheets"].get(layer)
    if not sheet:
        return None
    im = Image.open(os.path.join(folder, sheet)).convert("RGBA")
    r = DIRS.index(d)
    return im.crop((f * FW, r * FH, f * FW + FW, r * FH + FH))


def tint(im, hexc):
    r, g, b = (int(hexc[i:i + 2], 16) for i in (1, 3, 5))
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            p = px[x, y]
            if p[3]:
                px[x, y] = (p[0] * r // 255, p[1] * g // 255, p[2] * b // 255, p[3])
    return im


sprites = {}
for layer in [l["name"] for l in skins["layers"]]:
    group = layer.split("-")[0]
    d = "NW" if group == "back" else "S"
    pic = Image.new("RGBA", (FW, FH))
    stack = ["body", "skin", "gi", "belt", "belt-rim"]
    if group == "outfit":
        stack += [layer]
    elif group == "back":
        stack += [layer]
    stack += ["face-01"] + ([] if layer in hides else ["hair-02"])
    if group == "hat":
        stack += [layer]
    for name in stack:
        src = (SKINS, skins) if name == layer else (BASE, base)
        im = frame(src[0], src[1], name, d)
        if im is None:
            continue
        if name in TINT:
            im = tint(im, TINT[name])
        pic.alpha_composite(im)
    box = pic.getbbox()
    if group == "hat":   # the head: the top 55% of the figure
        box = (box[0], box[1], box[2], box[1] + int((box[3] - box[1]) * 0.55))
    icon = pic.crop(box)
    fn = f"{layer}.png"
    icon.save(os.path.join(OUT, fn))
    sprites[layer] = {"size": list(icon.size), "files": {layer: fn}, "anchorPx": [icon.size[0] / 2, icon.size[1]]}
json.dump({"sprites": sprites}, open(os.path.join(OUT, "static.json"), "w"), indent=1)
print("icons", len(sprites))
