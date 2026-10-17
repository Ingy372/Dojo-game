"""Batch 6 previews: stacks the layer sheets the way the game will (multiply tint on tinted layers, one face and
one hair option), to check that the layers line up.
    python3 incoming-art/player-custom/source/make_custom_preview.py --sheets incoming-art/player-custom/sprites/body-a \
        --sheets-b incoming-art/player-custom/sprites/body-b --out incoming-art/player-custom/preview"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw
ap = argparse.ArgumentParser(); ap.add_argument("--sheets", required=True); ap.add_argument("--sheets-b", default=""); ap.add_argument("--out", required=True)
A, _unknown = ap.parse_known_args(); os.makedirs(A.out, exist_ok=True)
import glob
_js = sorted(glob.glob(os.path.join(A.sheets, "player*.json")))
J = json.load(open(_js[0])); FW = J["frameWidth"]; FH = J.get("frameHeight", FW); DIRS = J["directions"]
TOP = FH - FW            # extra rows on top of a taller frame (128 x 160: 32)
PAL = J["palettes"]; BELTS = J["beltStyles"]; BG = (0x2f, 0x2a, 0x3d)
_cache = {}
def sheet(layer, anim):
    k = (layer, anim)
    if k not in _cache:
        f = J["animations"][anim]["sheets"].get(layer)
        _cache[k] = np.asarray(Image.open(os.path.join(A.sheets, f)).convert("RGBA"), dtype=np.float32) / 255 if f else None
    return _cache[k]
def hexrgb(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)
def frame(layer, anim, d, f):
    s = sheet(layer, anim)
    if s is None: return None
    r = DIRS.index(d); return s[r * FH:(r + 1) * FH, f * FW:(f + 1) * FW]
def compose(ch, anim, d, f):
    """ch: dict(skin=hex, hair=hex, gi=hex, face='face-02', hairStyle='hair-04', belt='Blue')"""
    out = np.zeros((FH, FW, 4), dtype=np.float32)
    belt = BELTS[ch.get("belt", "White")]
    tints = {"skin": ch["skin"], "gi": ch["gi"], ch["hairStyle"]: ch["hair"], **{k: v for k, v in belt.items()}}
    props = J["animations"][anim].get("props", [])
    for L in sorted(J["layers"], key=lambda l: l["order"]):
        n = L["name"]
        if L.get("group") and n not in (ch["face"], ch["hairStyle"]): continue
        if n.startswith("belt") and n != "belt" and n not in belt: continue
        if n.startswith("prop-") and n not in props: continue
        px = frame(n, anim, d, f)
        if px is None: continue
        px = px.copy()
        if L["tint"] and n in tints: px[..., :3] *= hexrgb(tints[n])
        a = px[..., 3:4]; out[..., :3] = px[..., :3] * a + out[..., :3] * (1 - a); out[..., 3:4] = a + out[..., 3:4] * (1 - a)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), "RGBA")
def on_bg(im, scale=1):
    b = Image.new("RGBA", im.size, BG + (255,)); b.alpha_composite(im)
    return b.resize((im.width * scale, im.height * scale), Image.NEAREST) if scale != 1 else b
def crop(im, top=6, bottom=110): return im.crop((14, top, FW - 14, bottom + TOP))

# ------------------------------------------------------------------ the full-set review pictures
def head(im): return im.crop((30, TOP, 98, TOP + 62))
def grid(cells, cols):
    W = max(c.width for c in cells); Hh = max(c.height for c in cells); rows = (len(cells) + cols - 1) // cols
    sh = Image.new("RGBA", (cols * W, rows * Hh), BG + (255,))
    for k, c in enumerate(cells): sh.alpha_composite(c, ((k % cols) * W, (k // cols) * Hh))
    return sh
def stack(ims, path, gap=12):
    w = max(i.width for i in ims); h = sum(i.height + gap for i in ims)
    out = Image.new("RGBA", (w, h), BG + (255,)); y = 0
    for i in ims: out.alpha_composite(i, (0, y)); y += i.height + gap
    out.save(path)
def x2(im): return im.resize((im.width * 2, im.height * 2), Image.NEAREST)
if __name__ == "__main__" and A.sheets_b:
    import sys
    def other(sheets):       # the same helpers bound to the other body's sheets
        g = {"__name__": "lib"}; sys.argv = ["x", "--sheets", sheets, "--out", A.out]
        exec(open(__file__).read().split("# ------------------------------------------------------------------ the full-set review pictures")[0], g); return g
    BA = dict(compose=compose, J=J); gB = other(A.sheets_b); BB = dict(compose=gB["compose"], J=gB["J"])
    FACES = [l["name"] for l in J["layers"] if l.get("group") == "face"]
    HAIRS = [l["name"] for l in J["layers"] if l.get("group") == "hair"]
    BELTS_ALL = [k for k in BELTS if k != "note"]
    sk3 = [PAL["skin"][1], PAL["skin"][5], PAL["skin"][9]]; hc3 = [PAL["hair"][0], PAL["hair"][4], PAL["hair"][5]]
    # review-1: every face x 3 skin tones, both bodies (heads 3x) + full figures 1x and 2x
    heads = [on_bg(head(B["compose"](dict(skin=s, hair=PAL["hair"][1], gi=PAL["gi"][0], face=f, hairStyle="hair-01", belt="White"), "idle", "S", 0)), 3)
             for B in (BA, BB) for s in sk3 for f in FACES]
    figs = grid([on_bg(crop(B["compose"](dict(skin=s, hair=PAL["hair"][1], gi=PAL["gi"][0], face=f, hairStyle="hair-02", belt="White"), "idle", "S", 0)))
                  for B in (BA, BB) for s in sk3 for f in FACES], 18)
    stack([grid(heads, 6), figs, x2(figs)], os.path.join(A.out, "review-1-faces-x-skin.png"))
    # review-2: every hair x 3 colours, SE and N, per body, 1x and 2x
    for tag, B in (("a", BA), ("b", BB)):
        cells = [on_bg(crop(B["compose"](dict(skin=PAL["skin"][4 if tag == "a" else 7], hair=h, gi=PAL["gi"][0], face="face-02", hairStyle=hs, belt="White"), "idle", d, 0)))
                 for h in hc3 for hs in HAIRS for d in ("SE", "N")]
        one = grid(cells, 24); stack([one, x2(one)], os.path.join(A.out, f"review-2-hair-x-colour-body-{tag}.png"))
    # review-3: line-up of 8 varied finished characters, each with a different real belt (S and SE, 2x)
    LINE = [(BA, 0, 0, 0, 0, "hair-02"), (BB, 9, 1, 3, 3, "hair-09"), (BA, 7, 2, 1, 1, "hair-12"), (BB, 3, 4, 4, 5, "hair-06"),
            (BA, 5, 6, 2, 4, "hair-10"), (BB, 8, 0, 6, 1, "hair-11"), (BA, 2, 5, 7, 2, "hair-03"), (BB, 6, 3, 5, 0, "hair-07")]
    cells = []
    for k, (B, si, hi, gi, fi, hs) in enumerate(LINE):
        ch = dict(skin=PAL["skin"][si], hair=PAL["hair"][hi], gi=PAL["gi"][gi], face=FACES[fi], hairStyle=hs, belt=BELTS_ALL[[0, 1, 2, 3, 4, 5, 7, 9][k]])
        for d in ("S", "SE"): cells.append(on_bg(crop(B["compose"](ch, "idle", d, 0)), 2))
    grid(cells, 8).save(os.path.join(A.out, "review-3-lineup-8.png"))
    # GIFs: full combos on each body (walk, jab, strike, counter, dash, bow, sweep, celebrate), S / E / NW / N
    COMBOS = [("a1", BA, dict(skin=PAL["skin"][7], hair=PAL["hair"][0], gi=PAL["gi"][0], face="face-05", hairStyle="hair-12", belt="Green")),
              ("a2", BA, dict(skin=PAL["skin"][1], hair=PAL["hair"][5], gi=PAL["gi"][2], face="face-06", hairStyle="hair-03", belt="Brown/Black")),
              ("b1", BB, dict(skin=PAL["skin"][9], hair=PAL["hair"][1], gi=PAL["gi"][1], face="face-02", hairStyle="hair-09", belt="Black")),
              ("b2", BB, dict(skin=PAL["skin"][4], hair=PAL["hair"][6], gi=PAL["gi"][4], face="face-04", hairStyle="hair-06", belt="Yellow"))]
    dirs = ["S", "E", "NW", "N"]; cw = FW - 28
    for tag, B, ch in COMBOS:
        frames = []
        for anim, reps in (("walk", 3), ("jab", 2), ("strike", 1), ("counter", 1), ("dash", 1), ("bow", 1), ("sweep", 1), ("celebrate", 1)):
            info = B["J"]["animations"][anim]; ms = max(int(1000 / info["fps"]), 40)
            for r in range(reps):
                for f in range(info["frames"]):
                    row = Image.new("RGBA", (cw * 2 * len(dirs), (104 + TOP) * 2), BG + (255,))
                    for k, d in enumerate(dirs): row.alpha_composite(on_bg(crop(B["compose"](ch, anim, d, f)), 2), (k * cw * 2, 0))
                    frames.append((row.convert("P", palette=Image.ADAPTIVE, colors=255), ms))
            if info.get("holdLastFrame"): frames[-1] = (frames[-1][0], 800)
        frames[0][0].save(os.path.join(A.out, f"player-{tag}_combo.gif"), save_all=True, append_images=[f for f, _ in frames[1:]],
                          duration=[m for _, m in frames], loop=0, disposal=2)
    print("ok")
