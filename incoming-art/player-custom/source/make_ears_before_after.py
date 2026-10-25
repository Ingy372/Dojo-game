"""Before/after preview for the body-B ear fix. For every animation it composites body + skin (skin tint) + gi, BEFORE (the
committed sheets at a git ref) on the left and AFTER (the sheets in the folder) on the right, all 8 directions x all frames.
    python3 make_ears_before_after.py --ref origin/main --dir incoming-art/player-custom/sprites/body-b --name player-b --out preview/"""
import argparse, io, json, os, subprocess
from PIL import Image, ImageDraw
ap = argparse.ArgumentParser(); ap.add_argument("--ref", default="origin/main"); ap.add_argument("--dir"); ap.add_argument("--name")
ap.add_argument("--out"); ap.add_argument("--anims", default=""); a = ap.parse_args()
J = json.load(open(os.path.join(a.dir, a.name + ".json"))) if os.path.exists(os.path.join(a.dir, a.name + ".json")) else None
SKIN = (232, 190, 160)
def load(path, ref):
    if ref: return Image.open(io.BytesIO(subprocess.run(["git", "show", f"{ref}:{path}"], capture_output=True, check=True).stdout)).convert("RGBA")
    return Image.open(path).convert("RGBA")
def tint(im, rgb):
    r, g, b, al = im.split(); l = im.convert("L")
    return Image.merge("RGBA", [l.point(lambda v, c=c: v * c // 255) for c in rgb] + [al])
def comp(anim, ref):
    out = None
    for layer, t in (("body", None), ("skin", SKIN), ("gi", (235, 235, 240))):
        im = load(os.path.join(a.dir, f"{a.name}_{layer}_{anim}.png"), ref)
        if t: im = tint(im, t)
        out = im if out is None else Image.alpha_composite(out, im)
    bg = Image.new("RGBA", out.size, (120, 150, 170, 255)); return Image.alpha_composite(bg, out)
anims = a.anims.split(",") if a.anims else sorted({f.split("_")[-1][:-4] for f in os.listdir(a.dir) if f.startswith(a.name + "_skin_")})
os.makedirs(a.out, exist_ok=True)
for an in anims:
    b, n = comp(an, a.ref), comp(an, None)
    W = Image.new("RGBA", (b.width * 2 + 16, b.height + 24), (255, 255, 255, 255)); W.paste(b, (0, 24)); W.paste(n, (b.width + 16, 24))
    d = ImageDraw.Draw(W); d.text((4, 4), f"{an}  BEFORE (ears on shoulders)", fill=(0, 0, 0)); d.text((b.width + 20, 4), f"{an}  AFTER (ears on the head)", fill=(0, 0, 0))
    W.convert("RGB").save(os.path.join(a.out, f"ears-before-after-{an}.png")); print("wrote", an)
