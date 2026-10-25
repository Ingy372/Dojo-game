"""
Dojo Ascent - dash telegraph previews (A-BEST 2). Run after build_dash_telegraph.py, from the repo root.
Floor of tower-rooms floor tiles at the game's TILE = 48 px (phone size), the player (body-a, default look),
a Tier 1 enemy with the red attack circle drawn the way GameScene draws it, and the three stripe shapes + '!!'.
Writes preview/scene_phone.png, scene_phone_grey.png, scene_2x.png, dash_anim.gif, shapes_sheet.png.
"""
import os, json, math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, os.path.dirname(__file__)); import build_dash_telegraph as B
R = "incoming-art"; SP, PV = B.SP, B.PV; T = 48; K = T / B.PX
def L(n): return Image.open(os.path.join(SP, n)).convert("RGBA")
def sc(im, k): return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)

def tint(im, hexc):
    a = np.array(im).astype(float); c = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]; a[..., :3] *= c
    return Image.fromarray(a.astype(np.uint8))

def player():
    f = os.path.join(R, "player-custom", "sprites", "body-a"); m = json.load(open(os.path.join(f, "player-a.json")))
    W, H = m["frameWidth"], m["frameHeight"]; i = m["directions"].index("S"); out = Image.new("RGBA", (W, H))
    tints = {"skin": "#e0a984", "gi": "#f2e9d8", "belt": "#f4f1ea", "belt-rim": "#2e2a3a", "hair-02": "#34303f"}
    for l in ["body", "skin", "gi", "belt", "belt-rim", "face-01", "hair-02"]:
        im = Image.open(os.path.join(f, f"player-a_{l}_idle.png")).convert("RGBA").crop((0, i * H, W, (i + 1) * H))
        out.alpha_composite(tint(im, tints[l]) if l in tints else im)
    return out, m["anchor"]

def enemy(e="brute"):
    f = os.path.join(R, "enemies-tier1", e, "sprites"); m = json.load(open([os.path.join(f, x) for x in os.listdir(f) if x.endswith(".json")][0]))
    W, H = m["frameWidth"], m["frameHeight"]; i = m["directions"].index("S"); out = Image.new("RGBA", (W, H))
    for l in ("body", "glow", "light"):
        out.alpha_composite(Image.open(os.path.join(f, f"{e}_{l}_idle.png")).convert("RGBA").crop((0, i * H, W, (i + 1) * H)))
    return out, m["anchor"]

def place(img, spr, anchor, tx, ty, k=K * B.PX / 80):   # sprites are 80 px per tile
    s = sc(spr, k); img.alpha_composite(s, (round(tx * T - anchor["x"] * k), round(ty * T - anchor["y"] * k)))

def red_circle(img, tx, ty, area, progress=0.7, inwin=False):
    o = Image.new("RGBA", img.size); d = ImageDraw.Draw(o, "RGBA"); cx, cy, a = tx * T, ty * T, area * T
    d.ellipse([cx - a, cy - a, cx + a, cy + a], fill=(255, 59, 48, 41), outline=(255, 59, 48, 230), width=3)
    p = a * progress; d.ellipse([cx - p, cy - p, cx + p, cy + p], fill=(255, 59, 48, 102))
    img.alpha_composite(o)
    od = ImageDraw.Draw(img); od.text((cx - 4, cy - a - 26), "!", fill=(255, 59, 48, 255), font=B.ImageFont.truetype(B.FONT, 20))

def stripe_layers(name, phase=0.0, alpha=1.0, k=K):
    ls = {n: L(f"dash-{name}_{n}.png") for n in ("glow", "fill", "edge", "gap") if os.path.exists(os.path.join(SP, f"dash-{name}_{n}.png"))}
    if phase:
        f = ls["fill"]; st = B.stripes(f.width, f.height, phase); st.putalpha(f.getchannel("A")); ls["fill"] = st
    out = Image.new("RGBA", ls["fill"].size)
    for n in ("glow", "fill", "gap", "edge"):
        if n in ls: out.alpha_composite(ls[n])
    if alpha < 1: out.putalpha(out.getchannel("A").point(lambda v: int(v * alpha)))
    return sc(out, k)

def decal(img, name, tx, ty, **kw):
    s = stripe_layers(name, **kw); img.alpha_composite(s, (round(tx * T - s.width / 2), round(ty * T - s.height / 2)))

def scene(phase=0.0, alpha=1.0, progress=0.7):
    cols, rows = 20, 12; img = Image.new("RGBA", (cols * T, rows * T)); fl = sc(L(os.path.join("..", "..", "tower-rooms", "sprites", "floor-big_floor-big.png")), T / 80)
    for y in range(rows):
        for x in range(cols): img.alpha_composite(fl, (x * T, y * T))
    pl, pa = player(); br, ba = enemy("brute"); sw, sa = enemy("swarmer"); bg = sc(L("dash-bang.png"), K * 1.2)
    # left: red circle (Brute) next to the player
    red_circle(img, 3.0, 4.6, 0.9, progress); place(img, br, ba, 3.0, 3.4); place(img, pl, pa, 3.2, 6.2)
    # lane (Sleepy Sentry style) from an enemy at its end
    decal(img, "lane", 9.5, 2.2, phase=phase, alpha=alpha); place(img, sw, sa, 6.4, 2.4); img.alpha_composite(bg, (round(6.4 * T - bg.width / 2), round(1.0 * T - bg.height)))
    # arc (sweep) in front of an enemy
    decal(img, "arc", 9.5, 9.2, phase=phase, alpha=alpha); place(img, sw, sa, 9.5, 9.4); img.alpha_composite(bg, (round(9.5 * T - bg.width / 2), round(8.0 * T - bg.height)))
    # ring with a gap around an enemy, player next to the gap
    decal(img, "ring", 16.0, 6.0, phase=phase, alpha=alpha); place(img, sw, sa, 16.0, 6.1); img.alpha_composite(bg, (round(16 * T - bg.width / 2), round(4.7 * T - bg.height)))
    place(img, pl, pa, 16.0, 10.6)
    d = ImageDraw.Draw(img); f = B.ImageFont.truetype(B.FONT, 12)
    for t, x, y in (("red circle = COUNTER", 1.0, 0.3), ("lane", 9.0, 0.3), ("arc", 7.0, 6.4), ("ring + gap", 15.0, 0.3)):
        d.text((x * T, y * T), t, fill=(255, 255, 255, 255), font=f)
    return img

def main():
    B.main(); s = scene()
    s.save(os.path.join(PV, "scene_phone.png"))
    ImageOps.grayscale(s.convert("RGB")).save(os.path.join(PV, "scene_phone_grey.png"))
    s.resize((s.width * 2, s.height * 2), Image.NEAREST).save(os.path.join(PV, "scene_2x.png"))
    fr = []
    for i in range(20):        # suggested animation: fade in 0.2 s, stripes scroll 1 period / 0.5 s, pulse
        t = i / 20; fr.append(scene(phase=-2 * t, alpha=min(1, 0.4 + t * 3) * (0.85 + 0.15 * math.sin(t * 4 * math.pi)), progress=0.3 + 0.7 * t).convert("RGB"))
    fr[0].save(os.path.join(PV, "dash_anim.gif"), save_all=True, append_images=fr[1:], duration=50, loop=0)
    # sheet of every layer on dark and on floor, 1x sprite size
    names = [n for n in sorted(os.listdir(SP)) if n.endswith(".png")]; ims = [L(n) for n in names]
    cw = max(i.width for i in ims) // 2 + 10; ch = max(i.height for i in ims) // 2 + 24; cols = 5
    sh = Image.new("RGBA", (cw * cols, ch * math.ceil(len(ims) / cols)), (24, 22, 32, 255)); d = ImageDraw.Draw(sh)
    for j, (n, im) in enumerate(zip(names, ims)):
        x, y = (j % cols) * cw, (j // cols) * ch; sh.alpha_composite(sc(im, 0.5), (x + 5, y + 18)); d.text((x + 5, y + 3), n, fill=(255, 220, 120, 255))
    sh.save(os.path.join(PV, "layers_sheet.png")); print("previews written to", PV)

if __name__ == "__main__":
    main()
