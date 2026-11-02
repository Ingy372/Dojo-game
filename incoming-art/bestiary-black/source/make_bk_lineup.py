"""
Dojo Ascent - bestiary BLACK previews (Art Director bot): Storm Wisp, Rumble Brute, Sky Sweeper (R-G2B-38).
Writes into incoming-art/bestiary-black/preview/:
  lineup.png          the new three next to the player and existing enemies (same ground line, 80 px per tile): in-game size (x0.6, TILE 48), 1x, 2x
  <enemy>_moves.png   per enemy: player | Brute | idle | wind-up (last frame, telegraph tinted) | attack in S, SE, E and N (Sky Sweeper: the sweep and the thrust)
  sky-sweeper_arc_lane.png / .gif   the Sky Sweeper wind-up (purple tell), then the sweep with the purple arc, then the thrust with the purple lane + '!!'
                      (the game draws the arc, the lane and the '!!'; the art is from incoming-art/dash-telegraph), at the game's TILE = 48
Run from the repo root. Needs Python 3 with Pillow and numpy.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
ROOT = "incoming-art"; BG = os.path.join(ROOT, "bestiary-black"); PV = os.path.join(BG, "preview"); os.makedirs(PV, exist_ok=True)
g = {}; exec(open(os.path.join(ROOT, "tools", "make_creature_preview.py")).read().rsplit("if __name__", 1)[0], g)
sys.path.insert(0, os.path.join(ROOT, "dash-telegraph", "source")); import make_dash_preview as D
FLOOR = (47, 42, 61, 255); PURPLE = "#8a4fe6"
NEW = [("storm-wisp", "Storm Wisp+"), ("rumble-brute", "Rumble Brute+"), ("sky-sweeper", "Sky Sweeper+")]
RED = "#ff3b30"

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
    d.text((8, 4), "+ = new (G2B-38)   idle, facing S, feet on one ground line, same world scale", fill=(255, 220, 120, 255)); y = 22
    for t, r in zip(titles, rows):
        d.text((8, y), t, fill=(150, 230, 255, 255)); img.paste(r, (0, y + 14)); y += r.height + 18
    img.save(os.path.join(PV, "lineup.png")); print("lineup", img.size)

# ---------- moves ----------
def moves(e, name, tint, atk=(("attack (impact)", 0),)):
    f = sprdir(e); m = meta(f); S = 2; dirs = ["S", "SE", "E", "N"]; has_leap = "leap" in m["animations"]
    cols = ["player", "Brute", "idle", "wind-up (last frame)"] + (["leap (apex)"] if has_leap else []) + [a[0] for a in atk]
    cw, ch = m["frameWidth"] * S, m["frameHeight"] * S
    img = Image.new("RGBA", (cw * len(cols), ch * len(dirs) + 22), FLOOR); d = ImageDraw.Draw(img)
    for j, c in enumerate(cols): label(d, (j * cw + 6, 5), c)
    for r, dr in enumerate(dirs):
        pl, pa = player(dr); br, ba = existing("brute", dr); mm = m["anchor"]
        ims = [(pl, pa), (br, ba), (frame(f, m, "idle", dr), mm), (frame(f, m, "windup", dr, -1, tint), mm)]
        if has_leap:
            nl = g["composite"](f, m, "leap", [], tele_tint=tint).shape[1] // m["frameWidth"]; ims.append((frame(f, m, "leap", dr, nl // 2, tint), mm))
        for _, fi_ in atk: ims.append((frame(f, m, "attack", dr, fi_, tint), mm))
        gy = 22 + r * ch + int(mm["y"] * S)                       # one ground line for the whole row, same world scale in every column
        for j, (im, a) in enumerate(ims):
            cell = Image.new("RGBA", (cw, ch)); cell.alpha_composite(im.resize((im.width * S, im.height * S), Image.NEAREST), (int(cw / 2 - a["x"] * S), int(mm["y"] * S - a["y"] * S)))
            img.alpha_composite(cell, (j * cw, 22 + r * ch)); label(d, (j * cw + 6, 24 + r * ch), dr, (150, 230, 255, 255))
        d.line([(0, gy), (img.width, gy)], fill=(70, 66, 90, 255))
    img.save(os.path.join(PV, f"{e}_moves.png")); print(e, img.size)

# ---------- arc, then lane ----------
def rot(im, deg): return im.rotate(deg, resample=Image.BICUBIC, expand=True)
def put_centre(img, s, tx, ty): img.alpha_composite(s, (round(tx * D.T - s.width / 2), round(ty * D.T - s.height / 2)))

def al_scene(anim, fi, arc_a=0.0, lane_a=0.0, phase=0.0, caption=""):
    f = sprdir("sky-sweeper"); m = meta(f); T = D.T; cols, rows = 16, 8
    img = Image.new("RGBA", (cols * T, rows * T)); fl = D.sc(D.L(os.path.join("..", "..", "tower-rooms", "sprites", "floor-big_floor-big.png")), T / 80)
    for y in range(rows):
        for x in range(cols): img.alpha_composite(fl, (x * T, y * T))
    pl_e, pa = player("W"); bang = D.sc(D.L("dash-bang.png"), D.K * 1.2); ex, ey = 3.2, 4.4
    if arc_a > 0: put_centre(img, rot(D.stripe_layers("arc", phase=phase, alpha=arc_a), -90), ex, ey)        # the arc opens toward the east (the attack direction), centred on the enemy
    if lane_a > 0: put_centre(img, D.stripe_layers("lane", phase=phase, alpha=lane_a), ex + 0.5 + 2.5, ey)    # the lane runs east from the enemy
    D.place(img, frame(f, m, anim, "E", fi, PURPLE), m["anchor"], ex, ey)
    if arc_a > 0 or lane_a > 0 or anim == "windup": img.alpha_composite(bang, (round(ex * T - bang.width / 2), round((ey - 1.6) * T - bang.height * 0.2)))
    D.place(img, pl_e, pa, 12.6, ey + 1.1)
    d = ImageDraw.Draw(img); f12 = D.B.ImageFont.truetype(D.B.FONT, 12)
    d.text((0.2 * T, 0.1 * T), "Sky Sweeper: purple tell, then the sweep (arc), then the thrust (lane), in-game size", fill=(255, 255, 255, 255), font=f12)
    d.text((0.2 * T, 7.45 * T), caption, fill=(255, 220, 120, 255), font=f12)
    return img

def arc_lane():
    f = sprdir("sky-sweeper"); m = meta(f)
    nw = g["composite"](f, m, "windup", [], tele_tint=PURPLE).shape[1] // m["frameWidth"]; na = g["composite"](f, m, "attack", [], tele_tint=PURPLE).shape[1] // m["frameWidth"]
    sheet = [("windup", nw - 1, 1.0, 0, "1. wind-up: the purple arc + '!!' show (drawn by the game)"), ("attack", 2, 1.0, 0, "2. the sweep: the broom swings through the arc"),
             ("attack", 8, 0, 1.0, "3. the thrust: the purple lane + '!!' (the arc has gone)")]
    tiles = [al_scene(a, fi, arc_a=aa, lane_a=la, caption=c) for a, fi, aa, la, c in sheet]
    img = Image.new("RGB", (tiles[0].width, tiles[0].height * 3))
    for i, t in enumerate(tiles): img.paste(t.convert("RGB"), (0, i * t.height))
    img.save(os.path.join(PV, "sky-sweeper_arc_lane.png"))
    fr = []
    for i in range(nw):          # wind-up: the arc fades in and the stripes scroll
        t = i / max(1, nw - 1); fr.append(al_scene("windup", i, arc_a=min(1, 0.3 + t * 2) * (0.88 + 0.12 * np.sin(t * 4 * np.pi)), phase=-2 * t, caption="1. wind-up: the purple arc + '!!'").convert("RGB"))
    for i in range(na):
        if i < 5: fr.append(al_scene("attack", i, arc_a=1.0, phase=-2 - i * 0.3, caption="2. the sweep through the arc").convert("RGB"))
        elif i < 7: fr.append(al_scene("attack", i, arc_a=max(0, 1 - (i - 4) / 2.5), lane_a=min(1, (i - 4) / 2.5), caption="the lane shows").convert("RGB"))
        elif i < 10: fr.append(al_scene("attack", i, lane_a=1.0, phase=-2 - i * 0.3, caption="3. the thrust along the lane").convert("RGB"))
        else: fr.append(al_scene("attack", i, lane_a=max(0, 1 - (i - 9) / 4), caption="recover").convert("RGB"))
    fr += [fr[-1]] * 3
    fr[0].save(os.path.join(PV, "sky-sweeper_arc_lane.gif"), save_all=True, append_images=fr[1:], duration=100, loop=0); print("arc_lane", len(fr))

if __name__ == "__main__":
    what = sys.argv[1:] or ["lineup", "moves", "lane"]
    if "lineup" in what: lineup()
    if "moves" in what:
        moves("storm-wisp", "Storm Wisp", RED); moves("rumble-brute", "Rumble Brute", RED)
        moves("sky-sweeper", "Sky Sweeper", PURPLE, (("sweep (arc)", 2), ("thrust (lane)", 8)))
    if "lane" in what: arc_lane()
