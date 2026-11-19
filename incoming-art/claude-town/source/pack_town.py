"""Dojo Ascent - the town (Claude Code, Nov 18 2026): turns build_town.py's renders into game-ready sprites.

    python pack_town.py --src <render dir> [--walk content/dojo/action-zone/town-walk.json] [--preview <dir>] [--stages 1,5,10]

- ground.png is cut into 2 x 2 pieces (each fits a 2048 page after the importer's 0.6 shrink), pinned at their tile corner.
- every piece_<id>.png is cropped to what it draws; its pin (anchorPx) is its anchor tile's pixel inside the crop.
- writes ../sprites/<id>.png and ../sprites/static.json (the importer's static format, with stage/until/flat/sortRow).
- with --walk, writes the walk grid and the pieces' stages and blocked cells into that file (doors and notes are kept).
- with --preview, composites the whole town at each stage exactly as the game stacks it (for Jay)."""
import argparse, json, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("--src", required=True); ap.add_argument("--walk", default=""); ap.add_argument("--preview", default="")
ap.add_argument("--stages", default="1,5,10"); ap.add_argument("--sprites", default=os.path.join(HERE, "..", "sprites"))
ap.add_argument("--preview-width", type=int, default=1840)
A = ap.parse_args()

meta = json.load(open(os.path.join(A.src, "town_meta.json")))
ppt, COLS, ROWS = meta["ppt"], meta["cols"], meta["rows"]
os.makedirs(A.sprites, exist_ok=True)
sprites = {}
placed = []   # (layer order, sortRow, image, x, y, stage, until)

g = Image.open(os.path.join(A.src, "ground.png")).convert("RGBA")
assert g.size == (COLS * ppt, ROWS * ppt), g.size
for i, (c0, c1) in enumerate(((0, COLS // 2), (COLS // 2, COLS))):
    for j, (r0, r1) in enumerate(((0, ROWS // 2), (ROWS // 2, ROWS))):
        sid = f"town-ground-{j}{i}"
        # 4 px of overlap on the inside edges, so no seam shows where two pieces meet
        im = g.crop((c0 * ppt, r0 * ppt, min(g.width, c1 * ppt + 4), min(g.height, r1 * ppt + 4))); im.save(os.path.join(A.sprites, sid + ".png"))
        sprites[sid] = {"size": list(im.size), "layers": ["day"], "files": {"day": sid + ".png"}, "anchorPx": [0, 0],
                        "anchorTile": [c0, r0], "place": "ground", "stage": 1}
        placed.append((0, 0, im, c0 * ppt, r0 * ppt, 1, None))

for p in meta["pieces"]:
    pid = p["id"]; f = os.path.join(A.src, f"piece_{pid}.png")
    if not os.path.exists(f):
        print("missing render:", pid); continue
    im = Image.open(f).convert("RGBA"); bb = im.getbbox()
    if not bb:
        print("empty render:", pid); continue
    crop = im.crop(bb); sid = f"town-{pid}"
    crop.save(os.path.join(A.sprites, sid + ".png"))
    ax, ay = p["anchorTile"][0] * ppt - bb[0], p["anchorTile"][1] * ppt - bb[1]
    s = {"size": list(crop.size), "layers": ["day"], "files": {"day": sid + ".png"}, "anchorPx": [round(ax, 1), round(ay, 1)],
         "anchorTile": p["anchorTile"], "sortRow": p["sortRow"], "place": "flat" if p["flat"] else "stand", "stage": p["stage"]}
    if p["until"]: s["until"] = p["until"]
    sprites[sid] = s
    placed.append((1 if p["flat"] else 2, p["sortRow"], crop, bb[0], bb[1], p["stage"], p["until"]))

json.dump({"about": "The town (Claude Code, Nov 18 2026), made by incoming-art/claude-town/source/build_town.py and pack_town.py. "
                    "Rendered at %d px per tile. Ground pieces are pinned at their top-left tile; every other piece at its anchor tile. "
                    "A piece shows from belt stage `stage` and, with `until`, is replaced at that stage. `flat` pieces lie under the hero; "
                    "`stand` pieces sort against the hero by `sortRow`." % ppt,
           "ppt": ppt, "cols": COLS, "rows": ROWS, "sprites": sprites}, open(os.path.join(A.sprites, "static.json"), "w", newline="\n"), indent=1)
print(len(sprites), "sprites")

if A.walk:
    w = json.load(open(A.walk)) if os.path.exists(A.walk) else {}
    w["tiles"] = meta["tiles"]
    w["pieces"] = [{k: v for k, v in (("id", "town-" + p["id"]), ("stage", p["stage"]), ("until", p["until"]), ("block", p["block"])) if v not in (None, [])}
                   for p in meta["pieces"]]
    json.dump(w, open(A.walk, "w", newline="\n"), indent=2)
    with open(A.walk, "a", newline="\n") as fh: fh.write("\n")

if A.preview:
    os.makedirs(A.preview, exist_ok=True)
    for st in [int(s) for s in A.stages.split(",")]:
        canvas = Image.new("RGBA", (COLS * ppt, ROWS * ppt), (0, 0, 0, 0))
        for layer, sr, im, x, y, stage, until in sorted(placed, key=lambda t: (t[0], t[1])):
            if stage <= st and (until is None or st < until):
                canvas.alpha_composite(im, (x, y))
        sc = A.preview_width / canvas.width
        canvas.resize((A.preview_width, round(canvas.height * sc)), Image.LANCZOS).save(os.path.join(A.preview, f"town-stage-{st}.png"))
        canvas.save(os.path.join(A.preview, f"town-stage-{st}-full.png"))
    print("previews in", A.preview)
