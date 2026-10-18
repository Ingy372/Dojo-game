"""Batch 7 FULL SET: portraits and previews.
    python3 incoming-art/dojo-people/source/make_people_full_preview.py [--raw /workspace/r7/full/portraits]
1) portraits/<id>/: from the raw portrait renders (make_full.sh), for each expression
   <id>_portrait_<expression>.png          flattened, transparent, with the default gi and belt (and no headband)
   layers/<id>_portrait_<expression>_<layer>.png   the layers, to tint in the game like the sprites
   <id>_portraits.json                     layer order, tints, defaults, belt styles, optional layers
2) preview/: lineup-8dir.png, lineup-S-3x.png, gif/<id>_<animation>.gif (every animation, all 8 directions),
   portrait-sheet.png (5 x 4), instructor-2-ponytail-3x.png, founder-headband.png."""
import argparse, json, os, shutil
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
DP = os.path.join(ROOT, "incoming-art", "dojo-people")
ap = argparse.ArgumentParser(); ap.add_argument("--raw", default="/workspace/r7/full/portraits"); ap.add_argument("--skip-gifs", action="store_true")
A = ap.parse_args()
BG = (0x2f, 0x2a, 0x3d); WHO = ["sensei", "instructor-2", "founder", "senpai", "kohai"]; EXPR = ["neutral", "happy", "proud", "thinking"]
def hexrgb(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)
class Char:
    def __init__(self, folder, name, gi, belt, headband=False):
        self.d = folder; self.J = json.load(open(os.path.join(folder, name + ".json"))); self.gi = gi; self.belt = belt; self.c = {}
        self.headband = headband; self.FW, self.FH = self.J["frameWidth"], self.J["frameHeight"]; self.DIRS = self.J["directions"]
    def sheet(self, layer, anim):
        k = (layer, anim)
        if k not in self.c:
            f = self.J["animations"][anim]["sheets"].get(layer)
            self.c[k] = np.asarray(Image.open(os.path.join(self.d, f)).convert("RGBA"), dtype=np.float32) / 255 if f else None
        return self.c[k]
    def compose(self, anim, d, f):
        B = self.J["beltStyles"][self.belt]; tints = {"gi": self.gi, **B}
        out = np.zeros((self.FH, self.FW, 4), dtype=np.float32); r = self.DIRS.index(d)
        for L in sorted(self.J["layers"], key=lambda l: l["order"]):
            n = L["name"]
            if n.startswith("belt") and n != "belt" and n not in B: continue
            if n.startswith("prop-") or (n == "headband" and not self.headband): continue
            s = self.sheet(n, anim)
            if s is None: continue
            px = s[r * self.FH:(r + 1) * self.FH, f * self.FW:(f + 1) * self.FW].copy()
            if L["tint"] and n in tints: px[..., :3] *= hexrgb(tints[n])
            a = px[..., 3:4]; out[..., :3] = px[..., :3] * a + out[..., :3] * (1 - a); out[..., 3:4] = a + out[..., 3:4] * (1 - a)
        return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), "RGBA")
def on_bg(im): b = Image.new("RGBA", im.size, BG + (255,)); b.alpha_composite(im); return b
def grid(cells, cols, pad=0):
    W = max(c.width for c in cells) + pad; H = max(c.height for c in cells) + pad; rows = (len(cells) + cols - 1) // cols
    sh = Image.new("RGBA", (cols * W, rows * H), BG + (255,))
    for k, c in enumerate(cells): sh.alpha_composite(c, ((k % cols) * W + pad // 2, (k // cols) * H + pad // 2))
    return sh
PV = os.path.join(DP, "preview"); os.makedirs(os.path.join(PV, "gif"), exist_ok=True)
chars = {}
for w in WHO:
    J = json.load(open(os.path.join(DP, "sprites", w, w + ".json")))
    chars[w] = Char(os.path.join(DP, "sprites", w), w, J["suggested"]["gi"], J["suggested"]["belt"])
# ---------------------------------------------------------------- 1) portraits
ports = {}
for w in WHO:
    od = os.path.join(DP, "portraits", w); os.makedirs(os.path.join(od, "layers"), exist_ok=True); meta = None
    for ex in EXPR:
        rd = os.path.join(A.raw, f"{w}-{ex}")
        if not os.path.exists(os.path.join(rd, f"{w}_portrait.json")): print("missing", rd); continue
        p = Char(rd, f"{w}_portrait", chars[w].gi, chars[w].belt); an = f"portrait_{ex}"
        im = p.compose(an, "S", 0); im.save(os.path.join(od, f"{w}_portrait_{ex}.png")); ports[(w, ex)] = im
        if w == "founder" and ex == "happy":
            p.headband = True; ports[("founder", "happy+headband")] = p.compose(an, "S", 0)
        files = {}
        for L, f in p.J["animations"][an]["sheets"].items():
            dst = f"{w}_portrait_{ex}_{L}.png"; shutil.copyfile(os.path.join(rd, f), os.path.join(od, "layers", dst)); files[L] = "layers/" + dst
        if meta is None:
            meta = {k: v for k, v in p.J.items() if k not in ("animations", "directions", "directionVectors", "anchor")}
            meta["expressions"] = {}
        meta["expressions"][ex] = dict(flattened=f"{w}_portrait_{ex}.png", layers=files)
    if meta:
        meta["note"] = ("512 x 512 transparent speech-card portraits. The flattened PNG uses the default gi and belt" +
                        (" (headband off)" if w == "founder" else "") + "; the layers stack and tint exactly like the sprites (multiply on the tinted layers).")
        json.dump(meta, open(os.path.join(od, f"{w}_portraits.json"), "w"), indent=1)
if ports:
    cells = []
    for w in WHO:
        for ex in EXPR:
            im = ports.get((w, ex)); cells.append(on_bg(im).resize((256, 256), Image.LANCZOS) if im else Image.new("RGBA", (256, 256), BG + (255,)))
    grid(cells, 4, 8).save(os.path.join(PV, "portrait-sheet.png"))
# ---------------------------------------------------------------- 2) line-ups
player = Char(os.path.join(ROOT, "incoming-art", "player-character", "sprites"), "player", "#f2f2f2", "Yellow")
order = [player] + [chars[w] for w in WHO]
D8 = ["S", "SE", "E", "NE", "N", "NW", "W", "SW"]
full = grid([on_bg(c.compose("idle", d, 0)) for d in D8 for c in order], len(order))
full.resize((round(full.width * 0.6), round(full.height * 0.6)), Image.LANCZOS).save(os.path.join(PV, "lineup-8dir.png"))
row = grid([on_bg(c.compose("idle", "S", 0)) for c in order], len(order)); g = row.resize((round(row.width * 0.6), round(row.height * 0.6)), Image.LANCZOS)
g.resize((g.width * 3, g.height * 3), Image.NEAREST).save(os.path.join(PV, "lineup-S-3x.png"))
# the ponytail: instructor-2 idle in 8 directions and the bow (bottom), at 3x game size
c = chars["instructor-2"]
pt = grid([on_bg(c.compose("idle", d, 0).crop((14, 10, 114, 150))) for d in D8] + [on_bg(c.compose("bow", d, 10).crop((14, 10, 114, 150))) for d in D8], 8)
pt = pt.resize((round(pt.width * 0.6), round(pt.height * 0.6)), Image.LANCZOS); pt.resize((pt.width * 3, pt.height * 3), Image.NEAREST).save(os.path.join(PV, "instructor-2-ponytail-3x.png"))
# the founder's optional headband (off by default): portrait + 4 directions
fc = chars["founder"]; fc.headband = True
spr = grid([on_bg(fc.compose("idle", d, 0)) for d in ["S", "SE", "E", "N"]], 4); fc.headband = False
spr = spr.resize((spr.width * 2, spr.height * 2), Image.NEAREST)
if ("founder", "happy+headband") in ports:
    card = Image.new("RGBA", (512 + 24 + spr.width, max(512, spr.height)), BG + (255,)); card.alpha_composite(on_bg(ports[("founder", "happy+headband")]), (0, 0))
    card.alpha_composite(spr, (536, (card.height - spr.height) // 2)); card.save(os.path.join(PV, "founder-headband.png"))
# ---------------------------------------------------------------- 3) a GIF of every animation, all 8 directions (1x, cropped)
if not A.skip_gifs:
    for w in WHO:
        c = chars[w]
        for anim, info in c.J["animations"].items():
            ms = max(int(round(1000 / info["fps"])), 20); fr = []
            reps = 2 if info.get("loop") else 1
            seq = list(range(info["frames"])) * reps
            if anim == "point": seq += [info["frames"] - 1] * 8               # show the hold
            for f in seq:
                ims = [on_bg(c.compose(anim, d, f).crop((6, 8, c.FW - 6, c.FH - 2))) for d in D8]
                fr.append((grid(ims, 8).convert("RGB").convert("P", palette=Image.ADAPTIVE, colors=255), ms))
            if not info.get("loop"): fr[-1] = (fr[-1][0], 700)              # a pause before the GIF repeats
            fr[0][0].save(os.path.join(PV, "gif", f"{w}_{anim}.gif"), save_all=True, append_images=[f for f, _ in fr[1:]],
                          duration=[m for _, m in fr], loop=0, disposal=2)
print("ok")
