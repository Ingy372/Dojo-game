"""Game-look previews for the kata moves: stacks the rendered layer sheets the way the game does (one face, one
hair, tinted skin, gi and belt) using the stacker from player-custom/source/make_custom_preview.py.
For each animation: <out>/<anim>.gif (S, SE, E, W side by side at 2x, real timing; one-shots hold the last frame)
and one sheet <out>/all-moves-final-pose.png (the finished pose of every animation in S, SE, E, W).

    python incoming-art/claude-kata-moves/source/make_kata_gifs.py --sheets incoming-art/claude-kata-moves/sprites/body-a --out incoming-art/claude-kata-moves/preview/game
"""
import argparse, os, sys
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(); ap.add_argument("--sheets", required=True); ap.add_argument("--out", required=True)
A = ap.parse_args()
os.makedirs(A.out, exist_ok=True)
lib_path = os.path.join(os.path.dirname(__file__), "..", "..", "player-custom", "source", "make_custom_preview.py")
g = {"__name__": "lib"}
sys.argv = ["x", "--sheets", A.sheets, "--out", A.out]
exec(open(lib_path, encoding="utf-8").read().split("# ------------------------------------------------------------------ the full-set review pictures")[0], g)
J, compose, PAL = g["J"], g["compose"], g["PAL"]
CH = dict(skin=PAL["skin"][3], hair=PAL["hair"][1], gi=PAL["gi"][0], face="face-01", hairStyle="hair-02", belt="Yellow")
DIRS = ["S", "SE", "E", "W"]
BG = (0x2f, 0x2a, 0x3d, 255)
SC = 2

def cellimg(anim, d, f):
    im = compose(CH, anim, d, f)
    im = im.crop((14, 24, im.width - 14, im.height - 8))
    return im.resize((im.width * SC, im.height * SC), Image.NEAREST)

finals = []
for anim, info in J["animations"].items():
    n, fps = info["frames"], info["fps"]
    loop = info.get("loop", False)
    frames, durs = [], []
    seq = list(range(n)) * (2 if loop else 1)
    for k, f in enumerate(seq):
        cells = [cellimg(anim, d, f) for d in DIRS]
        w, h = cells[0].size
        canvas = Image.new("RGBA", (w * len(DIRS), h + 22), BG)
        dr = ImageDraw.Draw(canvas)
        dr.text((6, 4), f"{anim}  frame {f + 1}/{n}", fill=(255, 220, 120, 255))
        for i, c in enumerate(cells):
            canvas.alpha_composite(c, (i * w, 22))
            dr.text((i * w + 6, 24), DIRS[i], fill=(255, 255, 255, 255))
        frames.append(canvas.convert("RGB"))
        ms = 1000 / fps
        if not loop and k == len(seq) - 1:
            ms += 900          # hold the finished pose before it replays
        durs.append(int(round(ms / 10.0)) * 10)
    frames[0].save(os.path.join(A.out, f"{anim}.gif"), save_all=True, append_images=frames[1:], duration=durs, loop=0)
    finals.append((anim, [cellimg(anim, d, n - 1) for d in DIRS]))
    print("gif", anim)

w, h = finals[0][1][0].size
sheet = Image.new("RGBA", (180 + w * len(DIRS), len(finals) * h), BG)
dr = ImageDraw.Draw(sheet)
for r, (anim, cells) in enumerate(finals):
    dr.text((8, r * h + h // 2), anim, fill=(255, 220, 120, 255))
    for i, c in enumerate(cells):
        sheet.alpha_composite(c, (180 + i * w, r * h))
sheet.save(os.path.join(A.out, "all-moves-final-pose.png"))
print("saved", os.path.join(A.out, "all-moves-final-pose.png"))
