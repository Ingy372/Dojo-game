"""Batch 6 previews: stacks the layer sheets the way the game will (multiply tint on tinted layers, one face and
one hair option), to check that the layers line up.
    python3 incoming-art/player-custom/source/make_custom_preview.py --sheets <sprites folder> --out <preview folder> [--what samples]"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw
ap = argparse.ArgumentParser(); ap.add_argument("--sheets", required=True); ap.add_argument("--out", required=True)
A = ap.parse_args(); os.makedirs(A.out, exist_ok=True)
J = json.load(open(os.path.join(A.sheets, "player.json"))); FW = J["frameWidth"]; DIRS = J["directions"]
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
    r = DIRS.index(d); return s[r * FW:(r + 1) * FW, f * FW:(f + 1) * FW]
def compose(ch, anim, d, f):
    """ch: dict(skin=hex, hair=hex, gi=hex, face='face-02', hairStyle='hair-04', belt='Blue')"""
    out = np.zeros((FW, FW, 4), dtype=np.float32)
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
def crop(im, top=6, bottom=110): return im.crop((14, top, FW - 14, bottom))

# ------------------------------------------------------------------ the sample pictures
def grid(cells, cols, path, label_rows=None):
    W = max(c.width for c in cells); H = max(c.height for c in cells); rows = (len(cells) + cols - 1) // cols
    sh = Image.new("RGBA", (cols * W, rows * H), BG + (255,))
    for k, c in enumerate(cells): sh.alpha_composite(c, ((k % cols) * W, (k // cols) * H))
    sh.save(path); return sh
def both_scales(img_1x, path):
    """the same sheet at 1x (game render size) and 2x, one above the other"""
    two = img_1x.resize((img_1x.width * 2, img_1x.height * 2), Image.NEAREST)
    out = Image.new("RGBA", (two.width, img_1x.height + two.height + 16), BG + (255,))
    out.alpha_composite(img_1x, (0, 0)); out.alpha_composite(two, (0, img_1x.height + 16)); out.save(path)
FACES = [l["name"] for l in J["layers"] if l.get("group") == "face"]
HAIRS = [l["name"] for l in J["layers"] if l.get("group") == "hair"]
def sample_options():
    """Sample 1: every face x 3 skin tones, every hair x 3 hair colours (S and SE, idle), 1x and 2x."""
    sk = [PAL["skin"][1], PAL["skin"][5], PAL["skin"][9]]; hc = [PAL["hair"][0], PAL["hair"][4], PAL["hair"][5]]
    cells = []
    for s in sk:
        for fc in FACES:
            for d in ("S", "SE"):
                cells.append(on_bg(crop(compose(dict(skin=s, hair=PAL["hair"][1], gi=PAL["gi"][0], face=fc, hairStyle="hair-02", belt="White"), "idle", d, 0))))
    both_scales(grid(cells, 12, "/tmp/_g.png"), os.path.join(A.out, "sample-1a-faces-x-skin.png"))
    cells = []
    for h in hc:
        for hs in HAIRS:
            for d in ("SE", "N"):
                cells.append(on_bg(crop(compose(dict(skin=PAL["skin"][3], hair=h, gi=PAL["gi"][0], face="face-01", hairStyle=hs, belt="White"), "idle", d, 0))))
    both_scales(grid(cells, 16, "/tmp/_g.png"), os.path.join(A.out, "sample-1b-hair-x-colour.png"))
    # close-up at 4x of every face on light, middle and deep skin (S), to judge expressions
    cells = [on_bg(compose(dict(skin=s, hair=PAL["hair"][0], gi=PAL["gi"][0], face=fc, hairStyle="hair-01", belt="White"), "idle", "S", 0).crop((34, 4, 94, 56)), 4)
             for s in sk for fc in FACES]
    grid(cells, 6, os.path.join(A.out, "sample-1c-faces-closeup-4x.png"))
def sample_palettes():
    """Sample 3: the three palettes as swatches, each skin tone on a character (multiply tint check), gi colours."""
    sw = 34; pad = 10
    def strip(cols):
        im = Image.new("RGBA", (len(cols) * (sw + 6) + pad, sw + pad * 2), BG + (255,)); d = ImageDraw.Draw(im)
        for k, c in enumerate(cols):
            x = pad + k * (sw + 6); d.rectangle((x, pad, x + sw, pad + sw), fill=c, outline=(20, 18, 28))
        return im
    rows = [strip(PAL["skin"]), strip(PAL["hair"]), strip(PAL["gi"])]
    styles = ["hair-02", "hair-03", "hair-04", "hair-05", "hair-06", "hair-07", "hair-08", "hair-01", "hair-03", "hair-04"]
    belts = list(k for k in BELTS if k != "note")
    chars = [on_bg(crop(compose(dict(skin=PAL["skin"][k], hair=PAL["hair"][k], gi=PAL["gi"][k], face=FACES[k % 6], hairStyle=styles[k], belt=belts[k]), "idle", "SE", 0)), 2)
             for k in range(10)]
    W = max(max(r.width for r in rows), sum(c.width for c in chars[:5]))
    H = sum(r.height for r in rows) + 2 * chars[0].height + 20
    out = Image.new("RGBA", (W + 20, H + 20), BG + (255,)); y = 10
    for r in rows: out.alpha_composite(r, (10, y)); y += r.height
    for k, c in enumerate(chars): out.alpha_composite(c, (10 + (k % 5) * c.width, y + 10 + (k // 5) * c.height))
    out.save(os.path.join(A.out, "sample-3-palettes.png"))
    # every skin tone with the same hair/face, S at 3x, to check the multiply tint on deep tones
    cells = [on_bg(crop(compose(dict(skin=s, hair=PAL["hair"][0], gi=PAL["gi"][0], face="face-01", hairStyle="hair-02", belt="White"), "idle", "S", 0)), 3) for s in PAL["skin"]]
    grid(cells, 10, os.path.join(A.out, "sample-3b-skin-tones-3x.png"))
def gif(frames, path, ms):
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=ms, loop=0, disposal=2)
def sample_motion():
    """Sample 2: two finished characters animated (walk, bow, celebrate, strike) in 4 directions, plus a 3x still of tricky frames."""
    chars = [dict(skin=PAL["skin"][6], hair=PAL["hair"][1], gi=PAL["gi"][0], face="face-04", hairStyle="hair-06", belt="Blue"),
             dict(skin=PAL["skin"][2], hair=PAL["hair"][5], gi=PAL["gi"][2], face="face-02", hairStyle="hair-04", belt="Black"),
             dict(skin=PAL["skin"][9], hair=PAL["hair"][0], gi=PAL["gi"][1], face="face-02", hairStyle="hair-05", belt="Brown/Black")]
    dirs = ["S", "E", "NW", "N"]
    for ci, ch in enumerate(chars):
        frames = []
        for anim, reps in (("walk", 3), ("strike", 1), ("bow", 1), ("celebrate", 1)):
            info = J["animations"][anim]; n = info["frames"]; ms = int(1000 / info["fps"])
            for r in range(reps):
                for f in range(n):
                    row = Image.new("RGBA", ((FW - 28) * 2 * len(dirs), 104 * 2), BG + (255,))
                    for k, d in enumerate(dirs): row.alpha_composite(on_bg(crop(compose(ch, anim, d, f), 6, 110), 2), (k * (FW - 28) * 2, 0))
                    frames.append((row, max(ms, 40)))
        frames[0][0].save(os.path.join(A.out, f"sample-2-motion-{ci + 1}.gif"), save_all=True, append_images=[f for f, _ in frames[1:]],
                          duration=[m for _, m in frames], loop=0, disposal=2)
    # a still of the riskiest frames (hair against the gi collar and back; belt knot) at 3x
    picks = [("bow", 9), ("celebrate", 6), ("celebrate", 20), ("strike", 4), ("walk", 3)]
    cells = [on_bg(crop(compose(ch, a, d, f)), 3) for ch in chars for a, f in picks for d in ("S", "N")]
    grid(cells, 10, os.path.join(A.out, "sample-2-key-frames-3x.png"))
import sys
what = os.environ.get("WHAT", "options,palettes,motion").split(",")
if "options" in what: sample_options()
if "palettes" in what: sample_palettes()
if "motion" in what: sample_motion()
print("ok")
