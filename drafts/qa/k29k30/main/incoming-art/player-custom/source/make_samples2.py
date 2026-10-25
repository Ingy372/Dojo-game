"""Batch 6, samples round 2 (after Jay's feedback): textured hair line-up on both bodies, the girl (body B) in
motion, and both bodies side by side with the same palette.
    python3 incoming-art/player-custom/source/make_samples2.py --a <body A idle sheets> --b <body B idle sheets> --bm <body B motion sheets> --out <preview>"""
import argparse, os
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument("--a"); ap.add_argument("--b"); ap.add_argument("--bm"); ap.add_argument("--out", required=True)
A = ap.parse_args()
LIB = open(os.path.join(H, "make_custom_preview.py")).read().split("# ------------------------------------------------------------------ the sample pictures")[0]
def lib(sheets):
    import sys; sys.argv = ["x", "--sheets", sheets, "--out", A.out]; g = {}; exec(LIB, g); return g
BG = (0x2f, 0x2a, 0x3d, 255)
def sheet(cells, cols, gap=0):
    W = max(c.width for c in cells); Hh = max(c.height for c in cells); rows = (len(cells) + cols - 1) // cols
    s = Image.new("RGBA", (cols * W, rows * Hh), BG)
    for k, c in enumerate(cells): s.alpha_composite(c, ((k % cols) * W, (k // cols) * Hh))
    return s
def scale(im, k): return im.resize((im.width * k, im.height * k), Image.NEAREST)
def stack(ims, path):
    w = max(i.width for i in ims); h = sum(i.height + 12 for i in ims)
    out = Image.new("RGBA", (w, h), BG); y = 0
    for i in ims: out.alpha_composite(i, (0, y)); y += i.height + 12
    out.save(path)
TEXTURED = ["hair-04", "hair-09", "hair-10", "hair-11", "hair-12", "hair-05"]
def textured():
    """(a) textured styles on deep and medium skin, both bodies, S / SE / N: 1x and 2x full figures, 4x heads"""
    la, lb = lib(A.a), lib(A.b); P = la["PAL"]
    combos = [(P["skin"][9], P["hair"][0]), (P["skin"][7], P["hair"][1]), (P["skin"][4], P["hair"][2])]
    cells, heads = [], []
    for L, face in ((la, "face-02"), (lb, "face-04")):
        for sk, hc in combos:
            for h in TEXTURED:
                for d in ("SE", "N"):
                    im = L["compose"](dict(skin=sk, hair=hc, gi=P["gi"][0], face=face, hairStyle=h, belt="White"), "idle", d, 0)
                    cells.append(L["on_bg"](L["crop"](im)))
            for h in TEXTURED:
                im = L["compose"](dict(skin=sk, hair=hc, gi=P["gi"][0], face=face, hairStyle=h, belt="White"), "idle", "S", 0)
                heads.append(L["on_bg"](im.crop((30, 0, 98, 62)), 4))
    one = sheet(cells, 12)
    stack([one, scale(one, 2)], os.path.join(A.out, "sample2-a-textured-hair-1x-2x.png"))
    sheet(heads[:18], 6).save(os.path.join(A.out, "sample2-a-textured-hair-heads-4x-body-a.png"))
    sheet(heads[18:], 6).save(os.path.join(A.out, "sample2-a-textured-hair-heads-4x-body-b.png"))
def motion():
    """(b) body B walking, striking, bowing and celebrating, S / E / NW / N, with different hair styles"""
    L = lib(A.bm); P = L["PAL"]; FW = L["FW"]
    chars = [dict(skin=P["skin"][2], hair=P["hair"][5], gi=P["gi"][0], face="face-04", hairStyle="hair-06", belt="Yellow"),
             dict(skin=P["skin"][8], hair=P["hair"][0], gi=P["gi"][3], face="face-02", hairStyle="hair-09", belt="Green"),
             dict(skin=P["skin"][5], hair=P["hair"][1], gi=P["gi"][1], face="face-04", hairStyle="hair-05", belt="Black"),
             dict(skin=P["skin"][0], hair=P["hair"][4], gi=P["gi"][4], face="face-02", hairStyle="hair-07", belt="Brown/Black")]
    dirs = ["S", "E", "NW", "N"]
    for ci, ch in enumerate(chars):
        frames = []
        for anim, reps in (("walk", 3), ("strike", 1), ("bow", 1), ("celebrate", 1)):
            info = L["J"]["animations"][anim]; ms = max(int(1000 / info["fps"]), 40)
            for r in range(reps):
                for f in range(info["frames"]):
                    row = Image.new("RGBA", ((FW - 28) * 2 * len(dirs), 104 * 2), BG)
                    for k, d in enumerate(dirs): row.alpha_composite(L["on_bg"](L["crop"](L["compose"](ch, anim, d, f), 6, 110), 2), (k * (FW - 28) * 2, 0))
                    frames.append((row, ms))
        frames[0][0].save(os.path.join(A.out, f"sample2-b-girl-motion-{ci + 1}.gif"), save_all=True, append_images=[f for f, _ in frames[1:]],
                          duration=[m for _, m in frames], loop=0, disposal=2)
    picks = [("walk", 3), ("strike", 4), ("bow", 9), ("celebrate", 6), ("celebrate", 20)]
    cells = [L["on_bg"](L["crop"](L["compose"](ch, a, d, f)), 2) for ch in chars for a, f in picks for d in ("S", "N")]
    sheet(cells, 10).save(os.path.join(A.out, "sample2-b-girl-key-frames-2x.png"))
def side_by_side():
    """(c) body A and body B with exactly the same options: deep skin (face fix), charcoal gi, and two more palettes"""
    la, lb = lib(A.a), lib(A.b); P = la["PAL"]
    sets = [dict(skin=P["skin"][9], hair=P["hair"][0], gi=P["gi"][1], face="face-01", hairStyle="hair-04", belt="Blue"),
            dict(skin=P["skin"][8], hair=P["hair"][1], gi=P["gi"][1], face="face-03", hairStyle="hair-10", belt="Black"),
            dict(skin=P["skin"][5], hair=P["hair"][6], gi=P["gi"][0], face="face-05", hairStyle="hair-06", belt="Orange"),
            dict(skin=P["skin"][1], hair=P["hair"][4], gi=P["gi"][2], face="face-06", hairStyle="hair-07", belt="Red/Black")]
    cells = []
    for s in sets:
        for L in (la, lb):
            for d in ("S", "SE"):
                cells.append(L["on_bg"](L["crop"](L["compose"](s, "idle", d, 0)), 3))
    sheet(cells, 4).save(os.path.join(A.out, "sample2-c-body-a-vs-b-3x.png"))
    # the deep-skin face fix close up: the deepest 3 tones, both bodies, 4x
    heads = [L["on_bg"](L["compose"](dict(skin=P["skin"][k], hair=P["hair"][0], gi=P["gi"][1], face=f"face-0{i}", hairStyle="hair-01", belt="White"), "idle", "S", 0).crop((34, 4, 94, 56)), 4)
             for L in (la, lb) for k in (7, 8, 9) for i in (1, 2, 3, 4, 5, 6)]
    sheet(heads, 6).save(os.path.join(A.out, "sample2-c-deep-skin-faces-4x.png"))
import sys
w = os.environ.get("WHAT", "textured,motion,side").split(",")
if "textured" in w: textured()
if "side" in w: side_by_side()
if "motion" in w: motion()
print("ok")
