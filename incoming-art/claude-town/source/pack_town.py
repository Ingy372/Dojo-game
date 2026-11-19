"""Dojo Ascent - the town (Claude Code, Nov 18-19 2026): turns build_town.py's renders into game-ready sprites.

    python pack_town.py --src <render dir> [--hires-src <dir>] [--walk content/dojo/action-zone/town-walk.json]
                        [--preview <dir>] [--stages 1,5,10]

- ground.png is cut into 2 x 2 pieces (each fits a 2048 page after the importer's 0.6 shrink), pinned at their tile corner.
  The picture starts `top` rows above the town's row 0 (the hills, the sky and the Tower).
- every piece_<id>.png is cropped to what it draws; its pin (anchorPx) is its anchor tile's pixel inside the crop.
  With --hires-src, pieces found there (rendered at twice the px per tile) are used instead and drawn at half size.
- every *.lit.png (the night pass: only the lit windows and lanterns) becomes a "<id>-lit" sprite with the same pin, plus
  "glows": the centre and size of each light, in tiles, for the game's warm night glow.
- writes ../sprites/<id>.png and ../sprites/static.json (the importer's static format, with stage/until/place/sortRow).
- with --walk, writes the walk grid and the pieces' stages and blocked cells into that file (doors and notes are kept).
- with --preview, composites the whole town at each stage, by day and by night, as the game stacks it (for Jay)."""
import argparse, json, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("--src", required=True); ap.add_argument("--walk", default=""); ap.add_argument("--preview", default="")
ap.add_argument("--stages", default="1,5,10"); ap.add_argument("--sprites", default=os.path.join(HERE, "..", "sprites"))
ap.add_argument("--preview-width", type=int, default=1840)
ap.add_argument("--hires-src", default="", help="a folder of the same pieces rendered at twice the px per tile; those are used instead, drawn at half size")
A = ap.parse_args()

meta = json.load(open(os.path.join(A.src, "town_meta.json")))
ppt, COLS, ROWS, TOP = meta["ppt"], meta["cols"], meta["rows"], meta.get("top", 0)
os.makedirs(A.sprites, exist_ok=True)
sprites = {}
placed = []   # (layer order, sortRow, image, x, y, stage, until, lit)


def glows_of(im, x0, y0, k):
    """Each separate light in a lit image: [tile x, tile y, radius in tiles]. x0, y0 = the crop's corner in picture px."""
    step = max(2, round(ppt * k / 10))
    small = im.split()[3].resize((max(1, im.width // step), max(1, im.height // step)), Image.BOX).point(lambda v: 255 if v > 40 else 0)
    w, h = small.size; px = small.load(); seen = set(); out = []
    for y in range(h):
        for x in range(w):
            if px[x, y] and (x, y) not in seen:
                stack = [(x, y)]; seen.add((x, y)); xs = []; ys = []
                while stack:
                    cx, cy = stack.pop(); xs.append(cx); ys.append(cy)
                    for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1), (cx + 1, cy + 1), (cx - 1, cy - 1), (cx + 1, cy - 1), (cx - 1, cy + 1)):
                        if 0 <= nx < w and 0 <= ny < h and px[nx, ny] and (nx, ny) not in seen:
                            seen.add((nx, ny)); stack.append((nx, ny))
                if len(xs) < 2: continue
                # a long light (a shop counter, a row of windows) becomes a row of small glows, about one a tile
                t = ppt * k
                wx0, wx1 = x0 + min(xs) * step, x0 + (max(xs) + 1) * step
                cyp = y0 + (min(ys) + max(ys) + 1) / 2 * step
                hgt = (max(ys) - min(ys) + 1) * step / t
                n = max(1, round((wx1 - wx0) / t / 1.1))
                for q in range(n):
                    cxp = wx0 + (wx1 - wx0) * (q + 0.5) / n
                    rad = min(1.0, max((wx1 - wx0) / n / t, hgt) / 2 + 0.3)
                    out.append([round(cxp / t, 2), round(cyp / t - TOP, 2), round(rad, 2)])
    return out


def add_piece(sid, f, k, anchor, extra, layer, stage, until, sort, lit=False):
    im = Image.open(f).convert("RGBA"); bb = im.getbbox()
    if not bb:
        print("empty render:", sid); return None
    crop = im.crop(bb)
    crop.save(os.path.join(A.sprites, sid + ".png"))
    ax, ay = anchor[0] * ppt * k - bb[0], (anchor[1] + TOP) * ppt * k - bb[1]
    s = {"size": list(crop.size), "layers": ["day"], "files": {"day": sid + ".png"}, "anchorPx": [round(ax, 1), round(ay, 1)],
         "anchorTile": anchor, "stage": stage, **extra}
    if sort is not None: s["sortRow"] = sort
    if until: s["until"] = until
    if k != 1: s["drawScale"] = 1 / k
    if lit: s["glows"] = glows_of(crop, bb[0], bb[1], k)
    sprites[sid] = s
    if k != 1: crop = crop.resize((round(crop.width / k), round(crop.height / k)), Image.LANCZOS); bb = (round(bb[0] / k), round(bb[1] / k))
    placed.append((layer, sort or 0, crop, bb[0], bb[1], stage, until, lit, s.get("glows", [])))
    return s


g = Image.open(os.path.join(A.src, "ground.png")).convert("RGBA")
assert g.size == (COLS * ppt, (ROWS + TOP) * ppt), g.size
R = ROWS + TOP
for i, (c0, c1) in enumerate(((0, COLS // 2), (COLS // 2, COLS))):
    for j, (r0, r1) in enumerate(((0, R // 2), (R // 2, R))):
        sid = f"town-ground-{j}{i}"
        # 4 px of overlap on the inside edges, so no seam shows where two pieces meet
        im = g.crop((c0 * ppt, r0 * ppt, min(g.width, c1 * ppt + 4), min(g.height, r1 * ppt + 4))); im.save(os.path.join(A.sprites, sid + ".png"))
        sprites[sid] = {"size": list(im.size), "layers": ["day"], "files": {"day": sid + ".png"}, "anchorPx": [0, 0],
                        "anchorTile": [c0, r0 - TOP], "place": "ground", "stage": 1}
        placed.append((0, 0, im, c0 * ppt, r0 * ppt, 1, None, False, []))
if os.path.exists(os.path.join(A.src, "ground.lit.png")):
    add_piece("town-ground-lit", os.path.join(A.src, "ground.lit.png"), 1, [0, 0], {"place": "lit-ground"}, 0.5, 1, None, None, lit=True)

for p in meta["pieces"]:
    pid = p["id"]
    for suffix, lit in (("", False), (".lit", True)):
        f = os.path.join(A.src, f"piece_{pid}{suffix}.png"); k = 1
        if A.hires_src and os.path.exists(os.path.join(A.hires_src, f"piece_{pid}{suffix}.png")):
            f = os.path.join(A.hires_src, f"piece_{pid}{suffix}.png"); k = 2
        if not os.path.exists(f):
            if not lit: print("missing render:", pid)
            continue
        place = ("lit" if lit else ("flat" if p["flat"] else "stand"))
        add_piece(f"town-{pid}" + ("-lit" if lit else ""), f, k, p["anchorTile"], {"place": place}, (1 if p["flat"] else 2), p["stage"], p["until"],
                  p["sortRow"] + (0.001 if lit else 0), lit=lit)

json.dump({"about": "The town (Claude Code, Nov 18-19 2026), made by incoming-art/claude-town/source/build_town.py and pack_town.py. "
                    "Rendered at %d px per tile; the picture starts %d rows above the town's row 0. Ground pieces are pinned at their "
                    "top-left tile; every other piece at its anchor tile. A piece shows from belt stage `stage` and, with `until`, is "
                    "replaced at that stage. `flat` pieces lie under the hero; `stand` pieces sort against the hero by `sortRow`; `lit` "
                    "pieces are the night lights, laid over the night-tinted town, with `glows` [x, y, radius] in tiles." % (ppt, TOP),
           "ppt": ppt, "cols": COLS, "rows": ROWS, "top": TOP, "sprites": sprites}, open(os.path.join(A.sprites, "static.json"), "w", newline="\n"), indent=1)
print(len(sprites), "sprites")

if A.walk:
    w = json.load(open(A.walk)) if os.path.exists(A.walk) else {}
    w["tiles"] = meta["tiles"]
    w["pieces"] = [{k: v for k, v in (("id", "town-" + p["id"]), ("stage", p["stage"]), ("until", p["until"]), ("block", p["block"])) if v not in (None, [])}
                   for p in meta["pieces"]]
    json.dump(w, open(A.walk, "w", newline="\n"), indent=2)
    with open(A.walk, "a", newline="\n") as fh: fh.write("\n")

NIGHT = (133, 120, 174)        # the town-square dusk recipe's blue-violet, a touch lighter so it stays friendly
GLOW = (255, 196, 110)


def compose(st, night):
    canvas = Image.new("RGBA", (COLS * ppt, (ROWS + TOP) * ppt), (0, 0, 0, 0))
    lights = []
    for layer, sr, im, x, y, stage, until, lit, glows in sorted(placed, key=lambda t: (t[0] if t[0] != 0.5 else 0.6, t[1], t[7])):
        if not (stage <= st and (until is None or st < until)): continue
        if lit:
            if night: canvas.alpha_composite(im, (x, y)); lights += glows
            continue
        if night:
            r, gch, b, a = im.split()
            im = Image.merge("RGBA", (r.point(lambda v: v * NIGHT[0] // 255), gch.point(lambda v: v * NIGHT[1] // 255), b.point(lambda v: v * NIGHT[2] // 255), a))
        canvas.alpha_composite(im, (x, y))
    sky = Image.new("RGBA", canvas.size, (40, 38, 92, 255) if night else (168, 214, 240, 255))
    sky.alpha_composite(canvas); canvas = sky
    if night and lights:
        glow = Image.new("RGB", canvas.size, (0, 0, 0)); d = ImageDraw.Draw(glow)
        for gx, gy, gr in lights:
            cx, cy, rr = gx * ppt, (gy + TOP) * ppt, gr * ppt * 1.4
            d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=(80, 54, 22))
        glow = glow.filter(ImageFilter.GaussianBlur(ppt * 0.45))
        canvas = Image.merge("RGBA", (*ImageChops.add(canvas.convert("RGB"), glow).split(), canvas.split()[3]))
    return canvas


if A.preview:
    os.makedirs(A.preview, exist_ok=True)
    for st in [int(s) for s in A.stages.split(",")]:
        for night in (False, True):
            c = compose(st, night); sc = A.preview_width / c.width
            name = f"town-stage-{st}" + ("-night" if night else "")
            c.resize((A.preview_width, round(c.height * sc)), Image.LANCZOS).convert("RGB").save(os.path.join(A.preview, name + ".png"))
            c.save(os.path.join(A.preview, name + "-full.png"))
    print("previews in", A.preview)
