"""
Dojo Ascent - bestiary GREEN A previews (Art Director bot): Cliff Goat, Stack Golem, Boulder Roller.
Writes into incoming-art/bestiary-green-a/preview/:
  lineup.png          the new three next to the player and existing enemies (same ground line, 80 px per tile): in-game size (x0.6, TILE 48), 1x, 2x
  <enemy>_moves.png   per enemy: player | Brute | idle | wind-up (last frame, telegraph tinted) | attack (impact) in S, SE, E and N
  stack-golem_stones.png  the Stack Golem with 5, 4 and 3 stones (each hit knocks one off; the game swaps the sprite)
  boulder-roller_lane.png / .gif   the wind-up beside the purple-and-white dash lane + '!!' (art from incoming-art/dash-telegraph), at the game's TILE = 48
Run from the repo root. Needs Python 3 with Pillow and numpy.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
ROOT = "incoming-art"; BG = os.path.join(ROOT, "bestiary-green-a"); PV = os.path.join(BG, "preview"); os.makedirs(PV, exist_ok=True)
g = {}; exec(open(os.path.join(ROOT, "tools", "make_creature_preview.py")).read().rsplit("if __name__", 1)[0], g)
sys.path.insert(0, os.path.join(ROOT, "dash-telegraph", "source")); import make_dash_preview as D
FLOOR = (47, 42, 61, 255); PURPLE = "#8a4fe6"
NEW = [("cliff-goat", "Cliff Goat+"), ("stack-golem", "Stack Golem+"), ("boulder-roller", "Boulder Roller+")]

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
    d.text((8, 4), "+ = new (G2B-08)   idle, facing S, feet on one ground line, same world scale", fill=(255, 220, 120, 255)); y = 22
    for t, r in zip(titles, rows):
        d.text((8, y), t, fill=(150, 230, 255, 255)); img.paste(r, (0, y + 14)); y += r.height + 18
    img.save(os.path.join(PV, "lineup.png")); print("lineup", img.size)

# ---------- moves ----------
def moves(e, name, tint):
    f = sprdir(e); m = meta(f); S = 2; dirs = ["S", "SE", "E", "N"]; cols = ["player", "Brute", "idle", "wind-up (last frame)", "attack (impact)"]
    cw, ch = m["frameWidth"] * S, m["frameHeight"] * S
    img = Image.new("RGBA", (cw * 5, ch * len(dirs) + 22), FLOOR); d = ImageDraw.Draw(img)
    for j, c in enumerate(cols): label(d, (j * cw + 6, 5), c)
    for r, dr in enumerate(dirs):
        pl, pa = player(dr); br, ba = existing("brute", dr); mm = m["anchor"]
        ims = [(pl, pa), (br, ba), (frame(f, m, "idle", dr), mm), (frame(f, m, "windup", dr, -1, tint), mm), (frame(f, m, "attack", dr, 0, tint), mm)]
        gy = 22 + r * ch + int(mm["y"] * S)                       # one ground line for the whole row, same world scale in every column
        for j, (im, a) in enumerate(ims):
            cell = Image.new("RGBA", (cw, ch)); cell.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), (int(cw / 2 - a["x"] * S), int(mm["y"] * S - a["y"] * S)))
            img.alpha_composite(cell, (j * cw, 22 + r * ch)); label(d, (j * cw + 6, 24 + r * ch), dr, (150, 230, 255, 255))
        d.line([(0, gy), (img.width, gy)], fill=(70, 66, 90, 255))
    img.save(os.path.join(PV, f"{e}_moves.png")); print(e, img.size)

# ---------- golem stones ----------
def stones():
    """5, 4 and 3 stones (rows) x idle, wind-up (last frame) and attack (impact) (columns), facing S and SE, at 2x on one ground line."""
    rows = []
    for n in (5, 4, 3):
        f = sprdir("stack-golem") if n == 4 else os.path.join(BG, "stack-golem", f"stones-{n}", "sprites")
        if os.path.isdir(f): rows.append((n, f, meta(f)))
    if not rows: return
    S = 2; m0 = rows[0][2]; w = m0["frameWidth"] * S; h = m0["frameHeight"] * S
    cols = [("idle", 0, "idle"), ("windup", -1, "wind-up (last frame)"), ("attack", 0, "attack (impact)")]; dirs = ["S", "SE"]
    img = Image.new("RGBA", (w * len(cols) * len(dirs), h * len(rows) + 22), FLOOR); d = ImageDraw.Draw(img)
    for r, (n, f, m) in enumerate(rows):
        gy = 22 + r * h + int(m["anchor"]["y"] * S); d.line([(0, gy), (img.width, gy)], fill=(70, 66, 90, 255))
        for k, dr in enumerate(dirs):
            for j, (an, fi, nm) in enumerate(cols):
                im = frame(f, m, an, dr, fi, "#ff3b30"); x0 = (k * len(cols) + j) * w
                img.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), (x0, 22 + r * h))
                if r == 0: label(d, (x0 + 6, 5), f"{dr}: {nm}")
        label(d, (6, 24 + r * h), f"{n} stones" + (" (full)" if n == 5 else ""), (255, 220, 120, 255))
    img.save(os.path.join(PV, "stack-golem_stones.png")); print("stones", img.size)

# ---------- roller + lane ----------
def lane_scene(wi, phase=0.0, alpha=1.0, dr_e="E", dr_s="S"):
    f = sprdir("boulder-roller"); m = meta(f); T = D.T; cols, rows = 13, 7
    img = Image.new("RGBA", (cols * T, rows * T)); fl = D.sc(D.L(os.path.join("..", "..", "tower-rooms", "sprites", "floor-big_floor-big.png")), T / 80)
    for y in range(rows):
        for x in range(cols): img.alpha_composite(fl, (x * T, y * T))
    pl_e, pa = player("W"); pl_s, _ = player("N")
    k = D.K * D.B.PX / 80
    bang = D.sc(D.L("dash-bang.png"), D.K * 1.2)
    # east-facing: the lane runs right from the boulder
    re_ = frame(f, m, "windup", dr_e, wi, PURPLE)
    D.decal(img, "lane", 2.0 + 0.45 + 2.5, 2.0, phase=phase, alpha=alpha); D.place(img, re_, m["anchor"], 2.0, 2.2)
    img.alpha_composite(bang, (round(2.0 * T - bang.width / 2), round(0.75 * T - bang.height * 0.2)))
    D.place(img, pl_e, pa, 9.6, 2.2); D.place(img, pl_e, pa, 5.2, 4.1)
    # south-facing: the lane runs down the screen
    rs = frame(f, m, "windup", dr_s, wi, PURPLE)
    lane = D.stripe_layers("lane", phase=phase, alpha=alpha).rotate(90, expand=True)
    cy = 1.9 + 0.5 + 2.5
    img.alpha_composite(lane, (round(11.0 * T - lane.width / 2), round(cy * T - lane.height / 2)))
    D.place(img, rs, m["anchor"], 11.0, 1.9); img.alpha_composite(bang, (round(11.0 * T + 0.6 * T - bang.width / 2), round(1.1 * T - bang.height * 0.2)))
    D.place(img, pl_s, pa, 8.4, 4.4)
    d = ImageDraw.Draw(img); f12 = D.B.ImageFont.truetype(D.B.FONT, 12)
    d.text((0.2 * T, 0.1 * T), "Boulder Roller wind-up (purple tell) + the house dash lane, in-game size", fill=(255, 255, 255, 255), font=f12)
    d.text((0.2 * T, 6.5 * T), "the lane and '!!' are drawn by the game; the sprite only supplies the wind-up pose", fill=(255, 220, 120, 255), font=f12)
    return img

def lane():
    m = meta(sprdir("boulder-roller")); n = m["animations"]["windup"]["frames"] if isinstance(m["animations"]["windup"].get("frames"), int) else None
    c = g["composite"](sprdir("boulder-roller"), m, "windup", [], tele_tint=PURPLE); n = c.shape[1] // m["frameWidth"]
    lane_scene(-1).save(os.path.join(PV, "boulder-roller_lane.png"))
    fr = []
    for i in range(n):
        t = i / max(1, n - 1); fr.append(lane_scene(i, phase=-2 * t, alpha=min(1, 0.4 + t * 3) * (0.85 + 0.15 * np.sin(t * 4 * np.pi))).convert("RGB"))
    fr += [fr[-1]] * 3
    fr[0].save(os.path.join(PV, "boulder-roller_lane.gif"), save_all=True, append_images=fr[1:], duration=100, loop=0); print("lane", len(fr))

if __name__ == "__main__":
    what = sys.argv[1:] or ["lineup", "moves", "stones", "lane"]
    if "lineup" in what: lineup()
    if "moves" in what:
        moves("cliff-goat", "Cliff Goat", "#ff3b30"); moves("stack-golem", "Stack Golem", "#ff3b30"); moves("boulder-roller", "Boulder Roller", PURPLE)
    if "stones" in what: stones()
    if "lane" in what: lane()
