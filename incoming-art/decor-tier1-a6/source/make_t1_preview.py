"""A6 full Tier 1 decor previews + adds the placement rules to static.json. Run after render_static.py."""
import json, os
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); R = os.path.join(H, "..", ".."); S = os.path.join(H, "..", "sprites")
P = os.path.join(H, "..", "preview"); os.makedirs(P, exist_ok=True)
SJ = os.path.join(S, "static.json"); D = json.load(open(SJ))
D["placement"] = {"default": "any free cell (floor pieces on floor cells, wall pieces on top-wall cells)",
                  "mustTouchWall": "pieces with info.mustTouchWall = true (the 2x1 folding screen) only go where the footprint's top row is row 1, against the top wall",
                  "tint": "random pieces: draw <id>, then <id>-tint multiplied by info.colour1, or by the drop floor's belt colour (beltStyles[belt].belt)"}
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
scrolls = [k for k in ids if "-scroll-" in k]; gear = [k for k in ids if "-gear-" in k]
rand = [k for k in ids if "tintLayer" in J[k].get("info", {})]
stat = [k for k in ids if "statue-floor" in k]; troph = [k for k in ids if k.startswith("decor-t1-trophy-")]
stack([row([comp(k) for k in scrolls]), row([comp(k) for k in gear])], "review-1-class-pieces-2x.png")
stack([row([comp(k, c) for k in rand]) for c in [None] + list(BELTS.values())], "review-2-random-colour1-then-white-yellow-orange-2x.png")
stack([row([comp(k) for k in stat] + [comp("decor-t1-folding-screen")]), row([comp(k) for k in troph])], "review-3-statues-trophies-screen-2x.png")
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
spots = {"decor-t1-scroll-sun-hills": (2, 0, None), "decor-t1-scroll-waves": (4, 0, None), "decor-t1-banner": (10, 0, "#f5d22e"),
         "decor-t1-scroll-koi": (12, 0, None), "decor-t1-folding-screen": (5, 1, None), "decor-t1-gear-belt-rack": (1, 1, None),
         "decor-t1-gear-kick-pad": (2, 4, None), "decor-t1-gear-bow-mat": (7, 5, None), "decor-t1-gear-water-bottle": (13, 6, None),
         "decor-t1-statue-floor1": (11, 1, None), "decor-t1-statue-floor2": (12, 1, None), "decor-t1-statue-floor3": (13, 1, None),
         "decor-t1-trophy-bopper": (9, 3, None), "decor-t1-trophy-shield": (10, 3, None), "decor-t1-fan": (1, 6, None),
         "decor-t1-lantern": (3, 7, "#f08a24"), "decor-t1-bonsai": (12, 4, None), "decor-t1-cushion": (6, 7, None), "decor-t1-gear-helmet": (4, 4, None)}
room_with(spots, "review-4-room")
print("ok", sorted(os.listdir(P)))
