"""S4c-A1 Injured status art (samples). Pure PIL, no outside assets.
Per character: overlay sheets the same size/layout as that character's body sheets (rows = 8 directions, cols = frames),
tracking the head found in the body alpha of each frame. Layers: injured-stars-back (under body), injured-bandage + injured-stars-front (over body).
Also: standalone puff ("shake it off") and the pop-up plate (no text)."""
import json, math, os
from PIL import Image, ImageDraw, ImageFilter
H = os.path.dirname(os.path.abspath(__file__)); IA = os.path.join(H, "..", ".."); OUT = os.path.join(H, "..", "sprites")
os.makedirs(OUT, exist_ok=True)
STAR, STAR2, STAR_OL = (255, 229, 138), (255, 250, 236), (150, 108, 40)          # soft yellow, warm white, gold-brown outline
BAND, BAND_PAD, BAND_OL, BAND_DOT = (243, 214, 170), (255, 246, 228), (138, 96, 62), (205, 168, 122)
SS = 4  # supersample
CHARS = {  # json, animations that can be Injured (idle/chase + wind-up for enemies; player: idle, walk, hit)
    "swarmer": ("enemies-tier1/swarmer/sprites/swarmer.json", ["idle", "move", "windup"]),
    "shield":  ("enemies-tier1/shield/sprites/shield.json", ["idle", "move", "windup"]),
    "brute":   ("enemies-tier1/brute/sprites/brute.json", ["idle", "move", "windup"]),
    "keeper":  ("enemies-tier1/keeper/sprites/keeper.json", ["idle", "move", "windup_slam", "windup_sweep"]),
    "padded":  ("enemy-padded-weapon/sprites/padded.json", ["idle", "move", "windup"]),
}
def star_pts(cx, cy, r, rot):
    return [(cx + (r if i % 2 == 0 else r * 0.48) * math.cos(rot + i * math.pi / 5 - math.pi / 2),
             cy + (r if i % 2 == 0 else r * 0.48) * math.sin(rot + i * math.pi / 5 - math.pi / 2)) for i in range(10)]
def draw_star(d, cx, cy, r, rot, col, a):
    ol = max(1.6, r * 0.28) * SS
    d.polygon(star_pts(cx * SS, cy * SS, r * SS + ol * 0.6, rot), fill=STAR_OL + (a,))
    d.polygon(star_pts(cx * SS, cy * SS, r * SS, rot), fill=col + (a,))
    d.ellipse([(cx - r * 0.18) * SS, (cy - r * 0.3) * SS, (cx + r * 0.05) * SS, (cy - r * 0.05) * SS], fill=(255, 255, 255, a))
def draw_bandage(d, cx, cy, s, ang):
    # two crossed rounded strips (a cartoon plaster cross), pad in the middle, little dots
    for k in (ang + 35, ang - 35):
        t = math.radians(k); ux, uy = math.cos(t), math.sin(t); vx, vy = -uy, ux
        L, W = s, s * 0.36
        for grow, col in ((0.9, BAND_OL), (0, BAND)):
            g = grow
            pts = [(cx + ux * (L + g) * sx + vx * (W + g) * sy, cy + uy * (L + g) * sx + vy * (W + g) * sy) for sx, sy in ((1, 1), (-1, 1), (-1, -1), (1, -1))]
            d.polygon([(x * SS, y * SS) for x, y in pts], fill=col + (255,))
            for e in (1, -1):
                ex, ey = cx + ux * (L + g) * e * 0.98, cy + uy * (L + g) * e * 0.98; rr = (W + g)
                d.ellipse([(ex - rr) * SS, (ey - rr) * SS, (ex + rr) * SS, (ey + rr) * SS], fill=col + (255,))
        for e in (0.62, -0.62):
            dx, dy = cx + ux * L * e, cy + uy * L * e
            d.ellipse([(dx - 0.55) * SS, (dy - 0.55) * SS, (dx + 0.55) * SS, (dy + 0.55) * SS], fill=BAND_DOT + (255,))
    p = s * 0.42
    d.rounded_rectangle([(cx - p) * SS, (cy - p) * SS, (cx + p) * SS, (cy + p) * SS], radius=p * 0.5 * SS, fill=BAND_PAD + (255,), outline=BAND_OL + (255,), width=int(0.7 * SS))
def head_of(im):
    """head box from the body alpha: top of the silhouette down 26% of its height; centre x from the top band."""
    a = im.split()[3].point(lambda v: 255 if v > 60 else 0); bb = a.getbbox()
    if not bb: return None
    top, bot = bb[1], bb[3]; hh = max(10, (bot - top) * 0.26)
    band = a.crop((0, top, im.width, int(top + hh))); bb2 = band.getbbox()
    return ((bb2[0] + bb2[2]) / 2, top + hh * 0.55, (bb2[2] - bb2[0]), hh, top)
def cen(im):
    a = im.split()[3].point(lambda v: 255 if v > 60 else 0); w, h = a.size; px = a.load(); sx = sy = n = 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if px[x, y]: sx += x; sy += y; n += 1
    return (sx / n, sy / n) if n else (w / 2, h / 2)
DIRX = {"N": 0, "NE": 1, "E": 1, "SE": 1, "S": 0, "SW": -1, "W": -1, "NW": -1}
FACING_AWAY = {"N", "NE", "NW"}
STARS = {"keeper": 2}   # bosses: Floor Keeper (and Guardians, by rule) use the 2-star variant
HEADLINE = {}           # (char, anim, dir, frame) -> head-top y, for the check
def overlay(char, jpath, anims, meta):
    J = json.load(open(os.path.join(IA, jpath))); fw, fh = J["frameWidth"], J["frameHeight"]; base = os.path.dirname(os.path.join(IA, jpath))
    info = {"frameWidth": fw, "frameHeight": fh, "anchor": J["anchor"], "directions": J["directions"], "animations": {}}
    for an in anims:
        A = J["animations"][an]; nf = A["frames"]; body = Image.open(os.path.join(base, A["sheets"]["body"])).convert("RGBA")
        idle = Image.open(os.path.join(base, J["animations"]["idle"]["sheets"]["body"])).convert("RGBA")
        sheets = {k: Image.new("RGBA", (fw * nf * SS, fh * 8 * SS)) for k in ("injured-stars-back", "injured-stars-front", "injured-bandage")}
        dr = {k: ImageDraw.Draw(v) for k, v in sheets.items()}
        for ri, dn in enumerate(J["directions"]):
            for f in range(nf):
                fr = body.crop((f * fw, ri * fh, (f + 1) * fw, (ri + 1) * fh))
                ref = idle.crop((0, ri * fh, fw, (ri + 1) * fh)); h = head_of(ref)
                if not h or not fr.getbbox(): continue
                # head from the idle pose (raised arms / weapons don't move it), shifted by how far the body's centre moved in this frame
                (cx0, cy0), (cx1, cy1) = cen(ref), cen(fr)
                hx, hy, hw, hh, top = h; hx += cx1 - cx0; hy += cy1 - cy0; top += cy1 - cy0; ox, oy = f * fw, ri * fh
                # stars: 3 on a flat orbit at the top of the head (centre a little below the silhouette top, so nothing floats above the head)
                rs = max(4.4, fw / 128 * 5.4); pad = rs * 1.45     # star radius + outline
                rx, ry = max(13, hw * 0.62), max(3, hw * 0.12); cy = top + pad + ry          # orbit at head height: highest star touches the head-top line, never above
                HEADLINE[(char, an, dn, f)] = top
                ph = 2 * math.pi * (f / nf) * (2 if an in ("walk", "move") else 1)  # one turn per loop (two for the short run loops)
                n = STARS.get(char, 3)
                for k in range(n):
                    t = ph + k * 2 * math.pi / n; x = hx + rx * math.cos(t); y = cy + ry * math.sin(t)
                    x = min(max(x, pad + 1), fw - pad - 1); y = max(y, top + pad)              # inside the frame, below the head-top line
                    front = math.sin(t) > 0; lay = "injured-stars-front" if front else "injured-stars-back"
                    sc = 1.0 if front else 0.8
                    draw_star(dr[lay], ox + x, oy + y, rs * sc, t * 0.5, STAR if k != 1 else STAR2, 255 if front else 215)
                # bandage sticker on the cheek/forehead, on the side facing the camera
                # forehead corner, on the side away from the face's centre so it never covers the eyes
                dx = DIRX[dn]; side = -dx if dx else 1
                bx = hx + side * 0.24 * hw; by = top + hh * (0.62 if char == "keeper" else 0.4)
                draw_bandage(dr["injured-bandage"], ox + bx, oy + by, max(3.4, fw / 128 * 4.0), -20 - side * 15)
        files = {}
        for k, im in sheets.items():
            im = im.resize((fw * nf, fh * 8), Image.LANCZOS); fn = f"{char}_{k}_{an}.png"; im.save(os.path.join(OUT, char, fn)); files[k] = fn
        info["animations"][an] = {"frames": nf, "fps": A["fps"], "sheets": files}
    info["stars"] = STARS.get(char, 3)
    return info
def puff():
    """'shake it off' puff: 8 frames, 128x128, soft cream cloud ring + 2 tiny stars popping away, ground point 64,104.96"""
    n, fw = 8, 128; im = Image.new("RGBA", (fw * n * SS, fw * SS)); d = ImageDraw.Draw(im)
    for f in range(n):
        t = f / (n - 1); ox = f * fw; a = int(255 * (1 - t) ** 1.2)
        for k in range(7):
            ang = k * 2 * math.pi / 7 + 0.3; R = 14 + 30 * t; r = 9 * (1 - 0.5 * t) + 3
            x, y = ox + 64 + R * math.cos(ang), 78 + R * 0.45 * math.sin(ang) - 10 * t
            d.ellipse([(x - r - 1) * SS, (y - r - 1) * SS, (x + r + 1) * SS, (y + r + 1) * SS], fill=(168, 150, 128, a))
            d.ellipse([(x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS], fill=(250, 244, 230, a))
        if f < 6:
            for s in (-1, 1): draw_star(d, ox + 64 + s * (10 + 34 * t), 60 - 26 * t + 6 * t * t, 4.5 * (1 - 0.4 * t), t * 3, STAR, a)
    im.resize((fw * n, fw), Image.LANCZOS).save(os.path.join(OUT, "fx", "injured-puff_shake-off.png"))
def plate():
    """pop-up plate for the 'Injured!' word: no text baked in. 176x56, soft cream pill, gold-brown outline, bandage icon at the left.
    The game writes the word in its UI font over the text area (x 46-166)."""
    W, Hh = 176, 56; im = Image.new("RGBA", (W * SS, Hh * SS)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([3 * SS, 5 * SS, (W - 3) * SS, (Hh - 3) * SS], radius=24 * SS, fill=(92, 70, 48, 90))
    d.rounded_rectangle([2 * SS, 2 * SS, (W - 4) * SS, (Hh - 6) * SS], radius=24 * SS, fill=(255, 248, 232, 255), outline=STAR_OL + (255,), width=3 * SS)
    draw_bandage(d, 25, 25, 10, -25)
    for x, y, r in ((40, 9, 3.4), (160, 41, 3.0)): draw_star(d, x, y, r, 0.4, STAR, 255)
    im.resize((W, Hh), Image.LANCZOS).save(os.path.join(OUT, "fx", "injured-popup_plate.png"))
    return {"size": [W, Hh], "textArea": [46, 8, 166, 44], "textColour": "#5a3e22", "anchor": [W // 2, Hh], "note": "draw centred at the top of the head + 6 px; no text baked in"}
if __name__ == "__main__":
    meta = {"item": "S4c-A1 Injured status (samples)", "colours": {"star": "#ffe58a", "star2": "#fffaec", "starOutline": "#966c28", "bandage": "#f3d6aa", "pad": "#fff6e4", "bandageOutline": "#8a603e"},
            "drawOrder": "injured-stars-back -> character layers -> injured-bandage -> injured-stars-front",
            "windupFade": {"rule": "during a wind-up the star layers fade to 50% alpha over the first 4 ticks and come back over 4 ticks after it ends; the bandage stays at 100%", "alpha": 0.5, "fadeTicks": 4},
            "wobble": {"rule": "idle and move/chase only: rotate the whole character draw +-3 deg around its ground point, 1.6 s period (sine); stops during a wind-up (eased over 4 ticks)", "deg": 3, "periodSec": 1.6},
            "starCount": {"default": 3, "bossVariant": 2, "rule": "Floor Keeper and Guardians (half-strength Injured) use the same art with 2 stars; the keeper sheets here are the 2-star variant, and future Guardians get their sheets from make_injured.py with STARS[<id>] = 2"},
            "starBounds": "stars orbit at head height: never above the head-top line (top of the idle silhouette, moved with the body each frame) and always inside the frame",
            "wording": "the word 'Injured!' is owned by S4c-C1 (Content); the plate has no baked text",
            "characters": {}}
    for c, (jp, an) in CHARS.items():
        os.makedirs(os.path.join(OUT, c), exist_ok=True); meta["characters"][c] = overlay(c, jp, an, meta)
    os.makedirs(os.path.join(OUT, "fx"), exist_ok=True); puff()
    meta["fx"] = {"puff": {"file": "fx/injured-puff_shake-off.png", "frames": 8, "fps": 16, "frameSize": [128, 128], "anchor": [64, 104.96], "when": "injuredEnd (or defeat while Injured uses the normal poof)"},
                  "popup": dict(plate(), file="fx/injured-popup_plate.png", word="Injured!", when="once when Injured starts; 0.9 s: pop in 0.12 s (scale 0.6 -> 1.05 -> 1), hold, float up 10 px and fade the last 0.3 s")}
    json.dump(meta, open(os.path.join(OUT, "injured.json"), "w"), indent=1)
    # check: every star pixel in every frame is at or below the head-top line and inside the frame
    bad = 0; tot = 0
    for c, ci in meta["characters"].items():
        for an, a in ci["animations"].items():
            for lay in ("injured-stars-back", "injured-stars-front"):
                im = Image.open(os.path.join(OUT, c, a["sheets"][lay])).split()[3]; fw, fh = ci["frameWidth"], ci["frameHeight"]
                for ri, dn in enumerate(ci["directions"]):
                    for f in range(a["frames"]):
                        bb = im.crop((f * fw, ri * fh, (f + 1) * fw, (ri + 1) * fh)).point(lambda v: 255 if v > 8 else 0).getbbox(); tot += 1
                        if bb and (bb[1] < HEADLINE[(c, an, dn, f)] - 0.5 or bb[0] < 1 or bb[2] > fw - 1): bad += 1; print("ABOVE/OUT", c, an, lay, dn, f, bb, HEADLINE[(c, an, dn, f)])
    print("star check:", tot, "frame-layers,", bad, "bad")
