"""Batch 7 sample previews: stacks each character's layer sheets the way the game will (multiply tint on gi and belt layers).
    python3 incoming-art/dojo-people/source/make_people_preview.py --sheets incoming-art/dojo-people/sprites/samples \
        --player incoming-art/player-character/sprites --out incoming-art/dojo-people/preview
Writes: sample-1-lineup.png (everyone next to the player, S/SE/E/N, at game size 0.6x and 3x game size),
        sample-2-<who>.gif (idle + bow, Sensei also demonstrate; S, SE and E at 2x), sample-3-portraits.png (neutral row and
        happy row), <who>_portrait_<neutral|happy>.png, and for the founder sample-4-founder-headband.png (the optional headband)."""
import argparse, json, os
import numpy as np
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument("--sheets", required=True); ap.add_argument("--player", required=True)
ap.add_argument("--out", required=True); A = ap.parse_args(); os.makedirs(A.out, exist_ok=True)
BG = (0x2f, 0x2a, 0x3d); WHO = ["sensei", "instructor-2", "founder", "senpai", "kohai"]
def hexrgb(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)
class Char:
    def __init__(self, folder, name, gi, belt, headband=False):
        self.d = folder; self.J = json.load(open(os.path.join(folder, name + ".json"))); self.gi = gi; self.belt = belt; self.c = {}
        self.headband = headband
        self.FW, self.FH = self.J["frameWidth"], self.J["frameHeight"]; self.DIRS = self.J["directions"]
    def sheet(self, layer, anim):
        k = (layer, anim)
        if k not in self.c:
            f = self.J["animations"][anim]["sheets"].get(layer)
            self.c[k] = np.asarray(Image.open(os.path.join(self.d, f)).convert("RGBA"), dtype=np.float32) / 255 if f else None
        return self.c[k]
    def frames(self, anim): return self.J["animations"][anim]["frames"]
    def compose(self, anim, d, f):
        B = self.J["beltStyles"][self.belt]; tints = {"gi": self.gi, **B}
        out = np.zeros((self.FH, self.FW, 4), dtype=np.float32); r = self.DIRS.index(d)
        for L in sorted(self.J["layers"], key=lambda l: l["order"]):
            n = L["name"]
            if n.startswith("belt") and n != "belt" and n not in B: continue
            if n.startswith("prop-"): continue
            if n == "headband" and not self.headband: continue    # the founder's optional headband: off unless asked for
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
chars = {}
WHO = [w for w in WHO if os.path.exists(os.path.join(A.sheets, w, w + ".json"))]
for w in WHO:
    J = json.load(open(os.path.join(A.sheets, w, w + ".json")))
    chars[w] = Char(os.path.join(A.sheets, w), w, J["suggested"]["gi"], J["suggested"]["belt"])
player = Char(A.player, "player", "#f2f2f2", "Yellow")       # the approved player, for size (needs the 128x160 sheets)
# 1) line-up: the player then the dojo people; directions S, SE, E, N. Game size = 0.6x (48 px per tile), and 3x of that
order = [("player", player)] + [(w, chars[w]) for w in WHO]
dirs = ["S", "SE", "E", "N"]
cells = [on_bg(c.compose("idle", d, 0)) for d in dirs for _, c in order]
full = grid(cells, len(order) * 1)     # rows = directions, columns = characters
game = full.resize((round(full.width * 0.6), round(full.height * 0.6)), Image.LANCZOS)
x3 = game.resize((game.width * 3, game.height * 3), Image.NEAREST)
out = Image.new("RGBA", (x3.width + game.width + 24, x3.height), BG + (255,)); out.alpha_composite(game, (0, 0)); out.alpha_composite(x3, (game.width + 24, 0))
out.save(os.path.join(A.out, "sample-1-lineup.png"))
# a one-row version (S only) at 3x game size, the "at a glance" check
row = grid([on_bg(c.compose("idle", "S", 0)) for _, c in order], len(order))
g = row.resize((round(row.width * 0.6), round(row.height * 0.6)), Image.LANCZOS)
g.resize((g.width * 3, g.height * 3), Image.NEAREST).save(os.path.join(A.out, "sample-1-lineup-S-3x.png"))
# 2) one GIF per character: idle x2, bow, (Sensei) demonstrate, then idle; facing S, SE, E (2x)
for w in WHO:
    c = chars[w]; seq = [("idle", 2), ("bow", 1)] + ([("demonstrate", 1)] if "demonstrate" in c.J["animations"] else []) + [("idle", 1)]
    gd = ["S", "SE", "E"]; fr = []
    for anim, reps in seq:
        info = c.J["animations"][anim]; ms = max(int(round(1000 / info["fps"])), 40)
        for _ in range(reps):
            for f in range(info["frames"]):
                ims = [on_bg(c.compose(anim, d, f).crop((8, 4, c.FW - 8, c.FH - 2))) for d in gd]
                rowim = grid(ims, len(gd)); rowim = rowim.resize((rowim.width * 2, rowim.height * 2), Image.NEAREST)
                fr.append((rowim.convert("RGB").convert("P", palette=Image.ADAPTIVE, colors=255), ms))
    fr[0][0].save(os.path.join(A.out, f"sample-2-{w}.gif"), save_all=True, append_images=[f for f, _ in fr[1:]],
                  duration=[m for _, m in fr], loop=0, disposal=2)
# 3) portraits: neutral (soft smile) and happy (big smile) where the character has both; gi + belt tinted
rows = {"neutral": [], "happy": []}
for w in WHO:
    both = os.path.exists(os.path.join(A.sheets, f"{w}-portrait-neutral"))    # Senpai and Kohai have one portrait (their own face)
    for ex, sub in ((("happy" if both else "neutral"), f"{w}-portrait"), ("neutral", f"{w}-portrait-neutral") if both else ("", "-")):
        pd = os.path.join(A.sheets, sub)
        if not os.path.exists(pd): continue
        p = Char(pd, f"{w}_portrait", chars[w].gi, chars[w].belt)
        im = p.compose("portrait", "S", 0); im.save(os.path.join(A.out, f"{w}_portrait_{ex}.png")); rows[ex].append(on_bg(im))
        if w == "founder" and ex == "happy":
            p.headband = True; hb = p.compose("portrait", "S", 0); hb.save(os.path.join(A.out, "founder_portrait_happy_headband.png"))
            fc = chars["founder"]; fc.headband = True
            spr = grid([on_bg(fc.compose("idle", d, 0)) for d in ["S", "SE", "E", "N"]], 4); fc.headband = False
            spr = spr.resize((spr.width * 2, spr.height * 2), Image.NEAREST)
            card = Image.new("RGBA", (512 + 24 + spr.width, max(512, spr.height)), BG + (255,)); card.alpha_composite(on_bg(hb), (0, 0))
            card.alpha_composite(spr, (536, (card.height - spr.height) // 2)); card.save(os.path.join(A.out, "sample-4-founder-headband.png"))
cells = [c for r in ("neutral", "happy") for c in rows[r]]
if cells:
    n = max(len(rows["neutral"]), len(rows["happy"]))
    top = grid(rows["neutral"], len(rows["neutral"]), 24) if rows["neutral"] else None; bot = grid(rows["happy"], len(rows["happy"]), 24)
    W = max(t.width for t in (top, bot) if t); sh = Image.new("RGBA", (W, (top.height if top else 0) + bot.height), BG + (255,))
    if top: sh.alpha_composite(top, (0, 0))
    sh.alpha_composite(bot, (0, top.height if top else 0)); sh.save(os.path.join(A.out, "sample-3-portraits.png"))
print("ok")
