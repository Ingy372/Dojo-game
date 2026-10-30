"""Previews the town-slot dojo sprite placed in the PR #301 town square.
Needs the town square rendered WITHOUT the old placeholder dojo (see README: build_town_square.py --no-dojo0,
make_concept.py --no-dojo0). Usage: make_town_preview.py <concept-dir-without-dojo0>
Writes previews/town-slot-in-town-{day,dusk}@2x.png (+1x). Nothing is written into town-square-concept/."""
import json, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.dirname(HERE)
src = sys.argv[1]
info = json.load(open(os.path.join(OUT, "sprites", "static.json")))["sprites"]["town-slot-dojo"]
PPT, SHIFT = 80, 0.95 * 80          # the town's @2x px per tile, and make_concept.py's SHIFT
ax, ay = info["anchorPx"]; tx, ty = info["anchorTownTile"]
for v, base in (("day", "town-square-concept-932x430@2x.png"), ("dusk", "town-square-concept-dusk-932x430@2x.png")):
    bg = Image.open(os.path.join(src, base)).convert("RGBA")
    sp = Image.open(os.path.join(OUT, "sprites", info["files"][v])).convert("RGBA")
    bg.alpha_composite(sp, (round(tx * PPT - ax), round(ty * PPT + SHIFT - ay)))
    bg.save(os.path.join(OUT, "previews", f"town-slot-in-town-{v}@2x.png"))
    bg.resize((bg.width // 2, bg.height // 2), Image.LANCZOS).save(os.path.join(OUT, "previews", f"town-slot-in-town-{v}.png"))
print("ok")
