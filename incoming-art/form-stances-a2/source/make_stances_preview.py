"""A2 previews: stacks the stance sheets the way the game will (player-custom lib: multiply tint, one face, one hair).
    python3 incoming-art/form-stances-a2/source/make_stances_preview.py
Reads sprites/body-a, sprites/body-b (stances) and ../player-custom/sprites/body-a (the guard idle, for comparison)."""
import os, sys, json, shutil, tempfile
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "preview"); os.makedirs(OUT, exist_ok=True)
STANCES = ["stance_rooted", "stance_rooted_back", "stance_flowing"]

def combined(body):
    """temp folder: the stance sheets plus the approved guard idle, one JSON"""
    t = tempfile.mkdtemp(); src = os.path.join(ROOT, "sprites", f"body-{body}"); old = os.path.join(ROOT, "..", "player-custom", "sprites", f"body-{body}")
    J = json.load(open(os.path.join(src, f"player-{body}.json"))); O = json.load(open(os.path.join(old, f"player-{body}.json")))
    J["animations"] = {"idle": O["animations"]["idle"], **J["animations"]}
    for d in (src, old):
        for f in os.listdir(d):
            if f.endswith(".png") and (d == src or "_idle." in f): os.symlink(os.path.join(d, f), os.path.join(t, f))
    json.dump(J, open(os.path.join(t, f"player-{body}.json"), "w")); return t

def lib(folder):
    sys.argv = ["x", "--sheets", folder, "--out", OUT]
    import importlib.util
    spec = importlib.util.spec_from_file_location(f"lib{folder[-6:]}", os.path.join(ROOT, "..", "player-custom", "source", "make_custom_preview.py"))
    # the lib only defines helpers at import time (its main block writes previews), so load the helper part only
    src = open(spec.origin).read(); cut = src.index("def x2(im)"); cut = src.index("\n", cut) + 1
    m = type(sys)("lib"); m.__dict__["__file__"] = spec.origin; exec(compile(src[:cut], spec.origin, "exec"), m.__dict__); return m

A = lib(combined("a")); Bm = lib(combined("b"))
PAL = A.PAL
CH_A = dict(skin=PAL["skin"][2], hair=PAL["hair"][1], gi=PAL["gi"][0], face="face-01", hairStyle="hair-02", belt="Yellow")
CH_B = dict(skin=PAL["skin"][5], hair=PAL["hair"][0], gi=PAL["gi"][3], face="face-03", hairStyle="hair-07", belt="Orange")
BG = (0x2f, 0x2a, 0x3d); LAB = (235, 230, 220)

def img(m, ch, anim, d, f): return m.on_bg(m.compose(ch, anim, d, f))

def board(m, ch, anims, dirs, scale, path, frame_of=lambda a: 0, ground=False):
    fw, fh = m.FW, m.FH
    W = fw * scale * len(dirs); H = fh * scale * len(anims)
    out = Image.new("RGB", (W, H), BG)
    for r, a in enumerate(anims):
        for c, d in enumerate(dirs):
            im = img(m, ch, a, d, frame_of(a)).resize((fw * scale, fh * scale), Image.NEAREST)
            out.paste(im, (c * fw * scale, r * fh * scale))
            if ground:
                y = int((fh * 0.856) * scale) + r * fh * scale; dr = ImageDraw.Draw(out)
                dr.line([(c * fw * scale + 8, y), ((c + 1) * fw * scale - 8, y)], fill=(90, 84, 110), width=1)
    out.save(path); return path

DIRS = A.DIRS
# 1. guard idle vs the 3 stance samples, all 8 directions (rows: idle, rooted A, rooted B back stance, flowing)
board(A, CH_A, ["idle"] + STANCES, DIRS, 1, os.path.join(OUT, "review-1-guard-vs-stances-8dir.png"))
# 2. technique check at 3x: front (S) and side (E, W) with a ground line, for judging the stance like a student's
board(A, CH_A, ["idle"] + STANCES, ["S", "SE", "E", "W"], 3, os.path.join(OUT, "review-2-technique-3x.png"), ground=True)
# 3. body B, a blue gi (tinted) and orange belt (its own neutral layer), to show the layers still work
board(Bm, CH_B, STANCES, DIRS, 1, os.path.join(OUT, "review-3-body-b-blue-gi.png"))
# GIFs: S, SE, E side by side, 2x, at each animation's own fps
for m, ch, tag in ((A, CH_A, "a"), (Bm, CH_B, "b")):
    for a in STANCES:
        n = m.J["animations"][a]["frames"]; fps = m.J["animations"][a]["fps"]; frames = []
        for f in range(n):
            row = Image.new("RGB", (m.FW * 3, m.FH), BG)
            for c, d in enumerate(["S", "SE", "E"]): row.paste(img(m, ch, a, d, f), (c * m.FW, 0))
            frames.append(row.resize((row.width * 2, row.height * 2), Image.NEAREST))
        frames[0].save(os.path.join(OUT, f"{a}_body-{tag}.gif"), save_all=True, append_images=frames[1:], duration=round(1000 / fps), loop=0)
print("previews ->", OUT)
