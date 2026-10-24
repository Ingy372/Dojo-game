"""A6 full Tier 1 decor previews + adds the placement rules to static.json. Run after render_static.py."""
import json, os
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", ".."); S = os.path.join(H, "..", "sprites")
P = os.path.join(H, "..", "preview"); os.makedirs(P, exist_ok=True)
WOOD_TAN = "#d2a878"
SJ = os.path.join(S, "static.json"); D = json.load(open(SJ))
D["placement"] = {"default": "any free cell (floor pieces on floor cells, wall pieces on top-wall cells)",
                  "mustTouchWall": "pieces with info.mustTouchWall = true (the 2x1 folding screen) only go where the footprint's top row is row 1, against the top wall",
                  "tint": "random pieces: draw <id>, then <id>-tint multiplied by info.colour1, or by colour 2 = the drop floor's belt colour (beltStyles[belt].belt)",
                  "whiteBeltFallback": {"rule": "on White-belt floors colour 2 is soft wood tan instead of the near-white belt colour", "hex": WOOD_TAN},
                  "bonusOnly": ["decor-a6-folding-screen"],
                  "parked": "Tier 2+ named-monster gold-plate trophies are parked until Tier 2 is planned"}
for k, e in D["sprites"].items():
    inf = e.get("info", {})
    if "colour2" in inf: inf["colour2"] = "belt colour of the floor where it drops (beltStyles[belt].belt); on White-belt floors use the soft wood tan " + WOOD_TAN + " instead"; inf["colour2WhiteFallback"] = WOOD_TAN
    if k == "decor-a6-folding-screen": inf["pool"] = "bonus only (not in the random pool)"; inf["bonusOnly"] = True
json.dump(D, open(SJ, "w"), indent=1); J = D["sprites"]
BG = (44, 40, 58, 255)
BELTS = {"White": "#f4f1ea", "Yellow": "#f5d22e", "Orange": "#f08a24"}
def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def tint(im, h):
    r, g, b = hexrgb(h); ch = im.split()
    return Image.merge("RGBA", (ch[0].point(lambda v: v * r // 255), ch[1].point(lambda v: v * g // 255), ch[2].point(lambda v: v * b // 255), ch[3]))
def comp(k, col=None):
    e = J[k]; out = None
    for ln in e["layers"]:
        im = Image.open(os.path.join(S, e["files"][ln])).convert("RGBA")
        if ln.endswith("-tint"): im = tint(im, col or e["info"]["colour1"])
        out = im if out is None else (out.alpha_composite(im) or out)
    return out
def row(items, sc=2, pad=16):
    ims = [i.resize((i.width * sc, i.height * sc), Image.NEAREST) for i in items]
    h = max(i.height for i in ims); W = sum(i.width + pad for i in ims) + pad
    r = Image.new("RGBA", (W, h + 2 * pad), BG); x = pad
    for i in ims: r.alpha_composite(i, (x, pad + h - i.height)); x += i.width + pad
    return r
def stack(rows, path):
    W = max(r.width for r in rows); out = Image.new("RGBA", (W, sum(r.height for r in rows)), BG); y = 0
    for r in rows: out.alpha_composite(r, (0, y)); y += r.height
    out.save(os.path.join(P, path))
ids = list(J)
scrolls = [k for k in ids if "class-scroll-" in k]; gear = [k for k in ids if J[k].get("info", {}).get("pool") == "class" and k not in scrolls]
rand = [k for k in ids if "tintLayer" in J[k].get("info", {})]
stat = [k for k in ids if "statue-floor" in k]; troph = [k for k in ids if "journal-trophy-" in k]
stack([row([comp(k) for k in scrolls]), row([comp(k) for k in gear])], "review-1-class-pieces-2x.png")
stack([row([comp(k, c) for k in rand]) for c in [None, BELTS["White"], WOOD_TAN, BELTS["Yellow"], BELTS["Orange"]]], "review-2-random-colour1-white-raw-white-fallback-tan-yellow-orange-2x.png")
stack([row([comp(k) for k in stat] + [comp("decor-a6-folding-screen")]), row([comp(k) for k in troph])], "review-3-statues-trophies-screen-2x.png")
# room shots: everything placed in the Home Dojo, 1x and phone width
HD = os.path.join(R, "home-dojo", "sprites"); HJ = json.load(open(os.path.join(HD, "static.json")))["sprites"]
def room_with(spots, name):
    room = Image.open(os.path.join(HD, "room_floor.png")).convert("RGBA"); room.alpha_composite(Image.open(os.path.join(HD, "room_notice-board.png")).convert("RGBA"))
    ax, ay = HJ["room"]["anchorPx"]
    for k, (c, r, col) in sorted(spots.items(), key=lambda kv: kv[1][1]):
        e = J[k]; a = e["anchorPx"]; fp = e["footprint"]
        px = ax + (c + fp[0] / 2) * 80; py = ay + 80 if e["place"] == "wall" else ay + (r + fp[1]) * 80
        room.alpha_composite(comp(k, col), (int(px - a[0]), int(py - a[1])))
    room.alpha_composite(Image.open(os.path.join(HD, "room_wall-front.png")).convert("RGBA"))
    room.save(os.path.join(P, name + "-1x.png"))
    room.resize((390, round(room.height * 390 / room.width)), Image.LANCZOS).save(os.path.join(P, name + "-phone-390px.png"))
spots = {"decor-a6-class-scroll-bow": (2, 0, None), "decor-a6-class-scroll-kicks": (4, 0, None), "decor-a6-banner-small": (10, 0, "#f5d22e"),
         "decor-a6-class-scroll-kindness": (12, 0, None), "decor-a6-folding-screen": (5, 1, None), "decor-a6-belt-rack": (1, 1, None),
         "decor-a6-kick-pad": (2, 4, None), "decor-a6-bow-mat": (7, 5, None), "decor-a6-water-bottle": (13, 6, None),
         "decor-a6-keeper-statue-floor1": (11, 1, None), "decor-a6-keeper-statue-floor2": (12, 1, None), "decor-a6-keeper-statue-floor3": (13, 1, None),
         "decor-a6-journal-trophy-bopper": (9, 3, None), "decor-a6-journal-trophy-shield": (10, 3, None), "decor-a6-fan-stand": (1, 6, None),
         "decor-a6-lantern-small": (3, 7, "#f08a24"), "decor-a6-bonsai-small": (12, 4, None), "decor-a6-cushion": (6, 7, None), "decor-a6-sparring-helmet": (4, 4, None)}
room_with(spots, "review-4-room")
print("ok", sorted(os.listdir(P)))
