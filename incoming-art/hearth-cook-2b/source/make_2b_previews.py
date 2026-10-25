"""B-T3-TUNE-2b previews: wind-up -> attack GIFs, lid-up GIFs, lid icon, phone-size sheet. Normal Python (Pillow).
    python3 incoming-art/hearth-cook-2b/source/make_2b_previews.py"""
import json, os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OLD = os.path.join(ROOT, "..", "tier3-orange-guardian", "hearth-cook")
PRE = os.path.join(ROOT, "preview"); ICO = os.path.join(ROOT, "icon")
DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]; SHOW = ["S", "SE", "E"]
CROP = (38, 60, 218, 240); SC = 2; BG = (58, 54, 74, 255)
TINT = {"pin": (160, 112, 255), "bonk": (255, 59, 48)}   # preview only: the game tints the telegraph layer
try: FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22); SMALL = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
except Exception: FONT = SMALL = ImageFont.load_default()

def load(d, meta):
    m = json.load(open(os.path.join(d, meta))); return m
def cell(sheet, f, di):
    return sheet.crop((f * 256, di * 256, f * 256 + 256, di * 256 + 256))
def tinted(im, rgb, a):
    r, g, b, al = im.split(); c = Image.new("RGBA", im.size, rgb + (0,)); c.putalpha(al.point(lambda v: int(v * a))); return c
def frame(layers, f, di, tint=None, inten=0.0):
    out = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    for name, sh in layers:
        c = cell(sh, f, di)
        if name == "telegraph":
            if tint is None or inten <= 0: continue
            c = tinted(c, tint, inten)
        out.alpha_composite(c)
    return out
ORDER = ["glow", "body", "telegraph", "light", "lid"]
def sheets_for(d, m, anim, extra=None):
    a = m["animations"][anim]; L = []
    for n in ORDER:
        if n in a["sheets"]: L.append((n, Image.open(os.path.join(d, a["sheets"][n])).convert("RGBA")))
        elif extra and n in extra: L.append((n, extra[n]))
    return a, L
def strip(frames_by_dir, label):
    w = (CROP[2] - CROP[0]) * SC; h = (CROP[3] - CROP[1]) * SC
    im = Image.new("RGBA", (w * len(frames_by_dir), h + 30), BG); dr = ImageDraw.Draw(im)
    for i, (dn, fr) in enumerate(frames_by_dir):
        im.alpha_composite(fr.crop(CROP).resize((w, h), Image.NEAREST), (i * w, 30)); dr.text((i * w + 8, 4), dn, fill=(240, 236, 255), font=SMALL)
    dr.text((im.width - dr.textlength(label, font=SMALL) - 8, 4), label, fill=(255, 214, 120), font=SMALL)
    return im
def gif(path, frames, durs):
    pal = [f.convert("RGB").quantize(colors=255, method=Image.MEDIANCUT) for f in frames]
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=durs, loop=0, disposal=2)

def windup_gif(sub, name, wind, hit, kind, label):
    d = os.path.join(ROOT, sub); m = json.load(open(os.path.join(d, name + ".json")))
    frames, durs = [], []
    seq = []
    a0, _ = sheets_for(d, m, wind); a1, _ = sheets_for(d, m, hit)
    for anim, a in ((wind, a0), (hit, a1)):
        _, L = sheets_for(d, m, anim)
        ti = a.get("telegraphIntensity", [0] * a["frames"])
        for f in range(a["frames"]):
            row = [(dn, frame(L, f, DIRS.index(dn), TINT[kind], ti[f])) for dn in SHOW]
            frames.append(strip(row, f"{label}  {'WIND-UP' if anim == wind else 'attack'} {f + 1}/{a['frames']}")); durs.append(int(1000 / a["fps"]))
            if anim == wind and f == a["frames"] - 1: raw = row[1][1]
    durs[a0["frames"] - 1] = 600   # hold the full wind-up pose a moment (Guided mode holds it)
    out = os.path.join(PRE, f"{name}_{wind}.gif"); gif(out, frames, durs); return out, raw

def lid_gif(phase, anims):
    od = os.path.join(OLD, f"p{phase}", "sprites"); om = json.load(open(os.path.join(od, f"hearth-cook-p{phase}.json")))
    ld = os.path.join(ROOT, "lid", f"p{phase}"); lm = json.load(open(os.path.join(ld, f"hearth-cook-p{phase}.json")))
    frames, durs = [], []
    for anim in anims:
        lid = Image.open(os.path.join(ld, lm["animations"][anim]["sheets"]["lid"])).convert("RGBA")
        a, L = sheets_for(od, om, anim, {"lid": lid})
        for rep in range(2 if a["frames"] < 6 else 1):
            for f in range(a["frames"]):
                row = [(dn, frame(L, f, DIRS.index(dn))) for dn in SHOW]
                frames.append(strip(row, f"P{phase} lid up: {anim}")); durs.append(int(1000 / a["fps"]))
                if anim == "idle" and f == 0 and rep == 0: raws = [r[1] for r in row]
    out = os.path.join(PRE, f"hearth-cook-p{phase}_lid-up.gif"); gif(out, frames, durs); return out, raws

def lid_icon(px):
    S = px * 8; im = Image.new("RGBA", (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    ol = (36, 30, 82, 255); w = max(4, S // 14)
    # dome
    d.chord((S * 0.08, S * 0.28, S * 0.92, S * 1.12), 180, 360, fill=(195, 200, 222, 255), outline=ol, width=w)
    # rim
    d.rounded_rectangle((S * 0.04, S * 0.64, S * 0.96, S * 0.8), radius=S * 0.08, fill=(141, 147, 184, 255), outline=ol, width=w)
    # knob
    d.ellipse((S * 0.38, S * 0.14, S * 0.62, S * 0.36), fill=(242, 184, 75, 255), outline=ol, width=w)
    # shine
    d.arc((S * 0.2, S * 0.38, S * 0.8, S * 0.98), 205, 250, fill=(246, 248, 255, 255), width=w)
    return im.resize((px, px), Image.LANCZOS)

if __name__ == "__main__":
    os.makedirs(PRE, exist_ok=True); os.makedirs(ICO, exist_ok=True)
    for px in (24, 32, 48, 64):
        lid_icon(px).save(os.path.join(ICO, f"icon-lid-{px}.png")); lid_icon(px * 2).save(os.path.join(ICO, f"icon-lid-{px}@2x.png"))
    stills = []
    for sub, name, w, h, k, lab in (("p1-pin/sprites", "hearth-cook-p1-pin", "windup_pin", "pin", "pin", "P1 rolling pin"),
                                    ("p2-pin/sprites", "hearth-cook-p2-pin", "windup_pin", "pin", "pin", "P2 rolling pin"),
                                    ("p3-bonk/sprites", "hearth-cook-p3-bonk", "windup_bonk", "bonk", "bonk", "P3 bonk")):
        p, st = windup_gif(sub, name, w, h, k, lab); stills.append(st); print(p)
    lids = []
    for ph, an in ((2, ["idle", "move", "hit", "call"]), (3, ["idle", "move", "hit"])):
        p, st = lid_gif(ph, an); lids.append(st); print(p)
    # phone-size sheet: 667x375 @2x
    W, H = 1334, 750; sh = Image.new("RGBA", (W, H), (34, 30, 52, 255)); dr = ImageDraw.Draw(sh)
    dr.text((24, 16), "Hearth Cook B-T3-TUNE-2b: phone size (667x375 @2x)", fill=(255, 236, 200), font=FONT)
    # boss bar mock with the lid icon at the end
    bx, by, bw = 300, 64, 700
    dr.rounded_rectangle((bx, by, bx + bw, by + 30), radius=12, fill=(70, 64, 96), outline=(20, 16, 40), width=3)
    dr.rounded_rectangle((bx + 4, by + 4, bx + int(bw * 0.6), by + 26), radius=10, fill=(233, 138, 60))
    dr.rounded_rectangle((bx + 4, by + 4, bx + bw - 4, by + 26), radius=10, fill=(150, 150, 170, 0))
    ov = Image.new("RGBA", (bw - 8, 22), (190, 196, 214, 110)); sh.alpha_composite(ov, (bx + 4, by + 4))
    sh.alpha_composite(lid_icon(64), (bx + bw - 20, by - 18))
    dr.text((bx, by + 36), "The Hearth Cook  (lid up: grey wash + lid icon, 32 pt @2x)", fill=(230, 226, 245), font=SMALL)
    labels = ["P1 pin wind-up (last frame)", "P2 pin wind-up (last frame, lid up)", "P3 bonk wind-up (last frame, lid up)"]
    for i, st in enumerate(stills):
        c = st.crop(CROP); x = 30 + i * 430; y = 130
        dr.rounded_rectangle((x - 6, y - 6, x + 366, y + 366), radius=14, fill=(52, 48, 72))
        sh.alpha_composite(c.resize((360, 360), Image.NEAREST), (x, y)); dr.text((x, y + 370), labels[i], fill=(240, 236, 255), font=SMALL)
    for i, st in enumerate([r for L_ in lids for r in L_]):   # 1x true size at @2x = 2x pixels, as on the phone
        c = st.crop(CROP); x = 20 + i * 72; y = 600
        sh.alpha_composite(c.resize((90, 90), Image.LANCZOS), (x, y))
    dr.text((20, 570), "Lid up, small (P2 then P3; S, SE, E)", fill=(240, 236, 255), font=SMALL)
    for i, px in enumerate((24, 32, 48, 64)):
        sh.alpha_composite(lid_icon(px * 2), (560 + i * 170, 600)); dr.text((560 + i * 170, 600 + px * 2 + 4), f"{px} pt", fill=(200, 196, 220), font=SMALL)
    sh.convert("RGB").save(os.path.join(PRE, "hearth-cook-2b-phone-667x375@2x.png")); print("sheet")
