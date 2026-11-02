"""
Dojo Ascent - bestiary RED previews (Art Director bot): Anvil Imp, Bellows Puff, Forge Sweeper (R-G2B-34).
Writes into incoming-art/bestiary-red/preview/:
  lineup.png          the new three next to the player and existing enemies (same ground line, 80 px per tile): in-game size (x0.6, TILE 48), 1x, 2x
  <enemy>_moves.png   per enemy: player | Brute | idle | wind-up (last frame, telegraph tinted) | attack (impact) in S, SE, E and N
  forge-sweeper_arc.png / .gif   the wind-up beside the purple-and-white dash ARC + '!!' (art from incoming-art/dash-telegraph), at the game's TILE = 48
Run from the repo root. Needs Python 3 with Pillow and numpy.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
ROOT = "incoming-art"; BG = os.path.join(ROOT, "bestiary-red"); PV = os.path.join(BG, "preview"); os.makedirs(PV, exist_ok=True)
g = {}; exec(open(os.path.join(ROOT, "tools", "make_creature_preview.py")).read().rsplit("if __name__", 1)[0], g)
sys.path.insert(0, os.path.join(ROOT, "dash-telegraph", "source")); import make_dash_preview as D
FLOOR = (47, 42, 61, 255); PURPLE = "#8a4fe6"
NEW = [("anvil-imp", "Anvil Imp+"), ("bellows-puff", "Bellows Puff+"), ("forge-sweeper", "Forge Sweeper+")]

def sprdir(e): return os.path.join(BG, e, "sprites")
def meta(f): return json.load(open([os.path.join(f, x) for x in os.listdir(f) if x.endswith(".json")][0]))
def frame(f, m, anim="idle", d="S", fi=0, tint="#ff3b30"):
    c = g["composite"](f, m, anim, [], tele_tint=tint); W, H = m["frameWidth"], m["frameHeight"]; i = m["directions"].index(d)
    if fi < 0: fi = c.shape[1] // W - 1
    return g["to_img"](c[i * H:(i + 1) * H, fi * W:(fi + 1) * W], (0, 0, 0, 0))

def player(d="S"):
    f = os.path.join(ROOT, "player-custom", "sprites", "body-a"); m = meta(f); W, H = m["frameWidth"], m["frameHeight"]
    i = m["directions"].index(d); out = Image.new("RGBA", (W, H))
    tint = {"skin": "#e0a984", "gi": "#f2e9d8", "belt": "#f4f1ea", "belt-rim": "#2e2a3a", "hair-02": "#34303f"}
    for l in ["body", "skin", "gi", "belt", "belt-rim", "face-01", "hair-02"]:
        im = Image.open(os.path.join(f, f"player-a_{l}_idle.png")).convert("RGBA").crop((0, i * H, W, (i + 1) * H))
        if l in tint:
            arr = np.array(im).astype(float); h = tint[l].lstrip("#"); c = [int(h[k:k + 2], 16) / 255 for k in (0, 2, 4)]
            arr[..., :3] *= c; im = Image.fromarray(arr.astype("uint8"))
        out.alpha_composite(im)
    return out, m["anchor"]

def existing(e, d="S"):
    sub = {"swarmer": "enemies-tier1", "shield": "enemies-tier1", "brute": "enemies-tier1", "keeper": "enemies-tier1", "pebble-pal": "bestiary-set2"}[e]
    f = os.path.join(ROOT, sub, e, "sprites"); m = meta(f); return frame(f, m, "idle", d), m["anchor"]

def label(d, xy, t, col=(255, 255, 255, 255)): d.text(xy, t, fill=col)

# ---------- lineup ----------
def lineup():
    cells = [("Player", *player())]
    for e, n in [("swarmer", "Swarmer"), ("shield", "Shield Guard"), ("brute", "Brute"), ("keeper", "Floor Keeper"), ("pebble-pal", "Pebble Pal")]:
        im, a = existing(e); cells.append((n, im, a))
    for e, n in NEW:
        f = sprdir(e); m = meta(f); cells.append((n, frame(f, m), m["anchor"]))
    def crop_x(im):   # trim empty columns so the line-up stays compact
        bb = im.getchannel("A").getbbox(); x0, x1 = (max(0, bb[0] - 4), min(im.width, bb[2] + 4)) if bb else (0, im.width)
        return im.crop((x0, 0, x1, im.height))
    cells[:] = [(l, crop_x(im), a) for l, im, a in cells]
    def row(s, name):
        def _top(im):
            ys = np.where(np.array(im)[..., 3].max(axis=1) > 8)[0]; return int(ys[0]) if len(ys) else 0
        up = max(a["y"] - _top(im) for _, im, a in cells) * s + 4; dn = max(max(0, im.height - a["y"] - (im.height - 1 - (np.where(np.array(im)[..., 3].max(axis=1) > 8)[0][-1] if im.getbbox() else 0))) for _, im, a in cells) * s + 4
        cwid = [max(im.width * s, len(l) * 6 + 6) for l, im, _ in cells]
        out = Image.new("RGBA", (int(sum(w + 8 for w in cwid) + 8), int(up + dn) + 24), (24, 22, 32, 255))
        d = ImageDraw.Draw(out); x = 8; gy = 18 + up; d.line([(0, gy), (out.width, gy)], fill=(70, 66, 90, 255))
        for (l, im, a), w in zip(cells, cwid):
            r = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS if s < 1 else Image.NEAREST)
            out.alpha_composite(r, (int(x + (w - r.width) / 2), int(gy - a["y"] * s))); label(d, (x + 2, 3), l, (255, 220, 120, 255) if l.endswith("+") else (255, 255, 255, 255)); x += w + 8
        return out
    rows = [row(0.6, "in-game"), row(1, "1x"), row(2, "2x")]
    titles = ["in-game size on a phone (TILE = 48, sprites x0.6)", "1x sprite size (80 px per tile)", "2x"]
    h = sum(r.height + 18 for r in rows) + 24; img = Image.new("RGBA", (max(r.width for r in rows), h), (24, 22, 32, 255)); d = ImageDraw.Draw(img)
    d.text((8, 4), "+ = new (G2B-34)   idle, facing S, feet on one ground line, same world scale", fill=(255, 220, 120, 255)); y = 22
    for t, r in zip(titles, rows):
        d.text((8, y), t, fill=(150, 230, 255, 255)); img.paste(r, (0, y + 14)); y += r.height + 18
    img.save(os.path.join(PV, "lineup.png")); print("lineup", img.size)

# ---------- moves ----------
def moves(e, name, tint):
    f = sprdir(e); m = meta(f); S = 2; dirs = ["S", "SE", "E", "N"]; has_leap = "leap" in m["animations"]
    cols = ["player", "Brute", "idle", "wind-up (last frame)"] + (["leap (apex)"] if has_leap else []) + ["attack (impact)"]
    cw, ch = m["frameWidth"] * S, m["frameHeight"] * S
    img = Image.new("RGBA", (cw * len(cols), ch * len(dirs) + 22), FLOOR); d = ImageDraw.Draw(img)
    for j, c in enumerate(cols): label(d, (j * cw + 6, 5), c)
    for r, dr in enumerate(dirs):
        pl, pa = player(dr); br, ba = existing("brute", dr); mm = m["anchor"]
        ims = [(pl, pa), (br, ba), (frame(f, m, "idle", dr), mm), (frame(f, m, "windup", dr, -1, tint), mm)]
        if has_leap:
            nl = g["composite"](f, m, "leap", [], tele_tint=tint).shape[1] // m["frameWidth"]; ims.append((frame(f, m, "leap", dr, nl // 2, tint), mm))
        ims.append((frame(f, m, "attack", dr, 0, tint), mm))
        gy = 22 + r * ch + int(mm["y"] * S)                       # one ground line for the whole row, same world scale in every column
        for j, (im, a) in enumerate(ims):
            cell = Image.new("RGBA", (cw, ch)); cell.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), (int(cw / 2 - a["x"] * S), int(mm["y"] * S - a["y"] * S)))
            img.alpha_composite(cell, (j * cw, 22 + r * ch)); label(d, (j * cw + 6, 24 + r * ch), dr, (150, 230, 255, 255))
        d.line([(0, gy), (img.width, gy)], fill=(70, 66, 90, 255))
    img.save(os.path.join(PV, f"{e}_moves.png")); print(e, img.size)

# ---------- arc ----------
def arc_scene(wi, phase=0.0, alpha=1.0):
    f = sprdir("forge-sweeper"); m = meta(f); T = D.T; cols, rows = 13, 7
    img = Image.new("RGBA", (cols * T, rows * T)); fl = D.sc(D.L(os.path.join("..", "..", "tower-rooms", "sprites", "floor-big_floor-big.png")), T / 80)
    for y in range(rows):
        for x in range(cols): img.alpha_composite(fl, (x * T, y * T))
    pl_s, pa = player("N"); pl_e, _ = player("W")
    bang = D.sc(D.L("dash-bang.png"), D.K * 1.2)
    # facing south: the arc sweeps the ground in front of the sweeper (the sweeper stands at the arc's centre, like the Vine Sweeper)
    D.decal(img, "arc", 3.2, 3.55, phase=phase, alpha=alpha); D.place(img, frame(f, m, "windup", "S", wi, PURPLE), m["anchor"], 3.2, 3.2)
    img.alpha_composite(bang, (round(3.2 * T - bang.width / 2), round(1.3 * T - bang.height * 0.2)))
    D.place(img, pl_s, pa, 3.2, 5.6); D.place(img, pl_s, pa, 5.6, 4.3)
    # facing east: the same arc, the sweeper turned to the right
    D.decal(img, "arc", 9.6, 3.55, phase=phase, alpha=alpha); D.place(img, frame(f, m, "windup", "E", wi, PURPLE), m["anchor"], 9.6, 3.2)
    img.alpha_composite(bang, (round(9.6 * T - bang.width / 2), round(1.3 * T - bang.height * 0.2)))
    D.place(img, pl_e, pa, 11.8, 4.3)
    d = ImageDraw.Draw(img); f12 = D.B.ImageFont.truetype(D.B.FONT, 12)
    d.text((0.2 * T, 0.1 * T), "Forge Sweeper wind-up (purple tell) + the house dash arc, in-game size", fill=(255, 255, 255, 255), font=f12)
    d.text((0.2 * T, 6.5 * T), "the arc and '!!' are drawn by the game; the sprite only supplies the wind-up pose", fill=(255, 220, 120, 255), font=f12)
    return img

def arc():
    m = meta(sprdir("forge-sweeper"))
    c = g["composite"](sprdir("forge-sweeper"), m, "windup", [], tele_tint=PURPLE); n = c.shape[1] // m["frameWidth"]
    arc_scene(-1).save(os.path.join(PV, "forge-sweeper_arc.png"))
    fr = []
    for i in range(n):
        t = i / max(1, n - 1); fr.append(arc_scene(i, phase=-2 * t, alpha=min(1, 0.4 + t * 3) * (0.85 + 0.15 * np.sin(t * 4 * np.pi))).convert("RGB"))
    fr += [fr[-1]] * 3
    fr[0].save(os.path.join(PV, "forge-sweeper_arc.gif"), save_all=True, append_images=fr[1:], duration=100, loop=0); print("arc", len(fr))

if __name__ == "__main__":
    what = sys.argv[1:] or ["lineup", "moves", "arc"]
    if "lineup" in what: lineup()
    if "moves" in what:
        moves("anvil-imp", "Anvil Imp", "#ff3b30"); moves("bellows-puff", "Bellows Puff", "#ff3b30"); moves("forge-sweeper", "Forge Sweeper", PURPLE)
    if "arc" in what: arc()
