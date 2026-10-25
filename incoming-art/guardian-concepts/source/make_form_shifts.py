"""
Dojo Ascent - Guardian form shifts (C14), concept sheets and glow-then-reveal samples (Artist bot).

    python3 incoming-art/guardian-concepts/source/make_form_shifts.py --renders DIR
DIR holds the stills from build_guardian_concepts.py (phase renders + `--form2` renders).
Writes form-shifts/sheets/<id>_form2.png, form-shifts/preview/<id>_reveal.gif (+ a strip PNG), and
form-shifts/preview/overview_form_shifts.png (+ _grey). Brief: drafts/content/enemies/guardian-form-shifts.json (PR #217).

Reveal timing (sample, 20 fps): 0.4 s phase-3 form, 1.0 s white-gold glow that builds up (form 1 fades to a
soft white-gold glow shape with a halo), 0.15 s flash, the new form pops in (small squash-and-settle), 1.2 s hold.
No red, nothing above the head. Needs Python 3 with Pillow and numpy.
"""
import argparse, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ap = argparse.ArgumentParser(); ap.add_argument("--renders", required=True); A = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "form-shifts")
os.makedirs(os.path.join(OUT, "sheets"), exist_ok=True); os.makedirs(os.path.join(OUT, "preview"), exist_ok=True)
BG = (27, 25, 38, 255); INK = (236, 230, 246); DIM = (170, 164, 190); GOLD = (255, 244, 207)
SHIFTS = [  # working names (DECIDE), from the C14 brief
    ("stone-giant", "Stone Giant", "Pebble Heart", "The worry stones fall off: a smaller, round, mossy giant trying to be brave.", "Less worry. Same giant."),
    ("sun-gardener", "Sun Gardener", "Bloom Gardener", "Its roots find the sun: the thorns drop away, yellow flowers open.", "Look. It is reaching for the sun."),
    ("storm-herald", "Storm Herald", "Quiet Thunderhead", "The storm runs out of shouting: one round cloud, a patch of calm blue sky.", "Listen. The calm is getting louder."),
    ("lost-lightbearer", "Lost Lightbearer", "Cloud Lantern", "The clouds pull in tight round the last light; it shines through the cracks.", "The light is still there. Go to them."),
]
def font(sz, bold=False):
    return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf", sz)
def R(name): return Image.open(os.path.join(A.renders, name)).convert("RGBA")
def glowify(im, k):
    """k 0..1: tint the form toward white-gold and add a soft halo that grows."""
    a = np.asarray(im).astype(np.float32); g = np.array([255, 244, 207], np.float32)
    a[..., :3] = a[..., :3] * (1 - k) + g * k
    out = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    alpha = im.split()[3]; halo = Image.new("RGBA", im.size, (255, 236, 170, 0))
    halo.putalpha(alpha.filter(ImageFilter.GaussianBlur(6 + 18 * k)).point(lambda v: int(v * 0.85 * k)))
    return Image.alpha_composite(halo, out)
def on_bg(im, size):
    c = Image.new("RGBA", size, BG); c.alpha_composite(im, ((size[0] - im.width) // 2, (size[1] - im.height) // 2)); return c
def popscale(im, s):
    w, h = im.size; sm = im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)
    c = Image.new("RGBA", im.size, (0, 0, 0, 0)); c.alpha_composite(sm, ((w - sm.width) // 2, int(h * 0.85) - int(sm.height * 0.85))); return c

def reveal(gid):
    f1, f2 = R(f"{gid}_p3_S.png"), R(f"{gid}_f2_S.png"); fr = []
    fr += [f1] * 8                                                    # 0.4 s
    for i in range(20): fr.append(glowify(f1, ((i + 1) / 20) ** 1.4))  # 1.0 s glow
    full = glowify(f1, 1.0)
    for i in range(3):                                                # 0.15 s flash: soft white-gold burst
        fl = Image.new("RGBA", f1.size, (0, 0, 0, 0)); d = ImageDraw.Draw(fl); r = 120 + 50 * i
        d.ellipse((256 - r, 300 - r, 256 + r, 300 + r), fill=(255, 246, 214, 200 - 50 * i)); fl = fl.filter(ImageFilter.GaussianBlur(30))
        fr.append(Image.alpha_composite(full if i == 0 else glowify(f2, 1 - 0.3 * i), fl))
    for i, s in enumerate((0.85, 1.06, 0.97, 1.0)): fr.append(glowify(popscale(f2, s), max(0, 0.5 - 0.15 * i)))
    fr += [f2] * 24                                                   # 1.2 s hold
    frames = [on_bg(f.resize((320, 320), Image.LANCZOS), (320, 320)).convert("RGB") for f in fr]
    p = os.path.join(OUT, "preview", f"{gid}_reveal.gif")
    frames[0].save(p, save_all=True, append_images=frames[1:], duration=50, loop=0, optimize=True)
    picks = [0, 12, 20, 27, 28, 32, 40]                               # strip for review without a GIF player
    strip = Image.new("RGB", (len(picks) * 200, 230), BG[:3]); d = ImageDraw.Draw(strip)
    for i, k in enumerate(picks):
        strip.paste(frames[k].resize((200, 200)), (i * 200, 0)); d.text((i * 200 + 6, 206), f"{k * 0.05:.2f}s", font=font(16), fill=DIM)
    strip.save(os.path.join(OUT, "preview", f"{gid}_reveal_strip.png")); return strip

def silhouette(im):
    a = im.split()[3]; s = Image.new("RGBA", im.size, (0, 0, 0, 0)); s.paste((20, 18, 30, 255), mask=a.point(lambda v: 255 if v > 60 else 0)); return s
def palette(im, n=6):
    a = np.asarray(im); px = a[a[..., 3] > 200][:, :3]
    q = Image.fromarray(px.reshape(1, -1, 3).astype(np.uint8)).quantize(n); pal = q.getpalette()[:n * 3]
    cnt = sorted(((c, i) for c, i in q.getcolors()), reverse=True)
    return ["#%02x%02x%02x" % tuple(pal[i * 3:i * 3 + 3]) for _, i in cnt]

def sheet(gid, old, new, why, line, strip):
    W, H = 1800, 1250; im = Image.new("RGBA", (W, H), BG); d = ImageDraw.Draw(im)
    d.text((40, 28), f"{old}  ->  {new}  (working name, DECIDE)", font=font(40, True), fill=INK)
    d.text((40, 84), why, font=font(22), fill=DIM); d.text((40, 116), f'Sensei: "{line}"   |   shift at 33% (phase 3), glow 1 s, no attacks during the glow', font=font(20), fill=DIM)
    f1, f2s, f2se = R(f"{gid}_p3_S.png"), R(f"{gid}_f2_S.png"), R(f"{gid}_f2_SE.png")
    for x, img, lab in ((40, f1, "before: phase 3"), (480, f2s, "new form: S"), (920, f2se, "new form: SE"), (1360, silhouette(f2s), "new form: silhouette")):
        d.rounded_rectangle((x, 160, x + 400, 600), 18, fill=(36, 33, 52)); im.alpha_composite(img.resize((400, 400), Image.LANCZOS), (x, 180))
        d.text((x + 12, 606), lab, font=font(20), fill=INK)
    d.text((40, 650), "Palette (new form)", font=font(22, True), fill=INK)
    for i, h in enumerate(palette(f2s)):
        d.rounded_rectangle((40 + i * 140, 685, 160 + i * 140, 745), 10, fill=h); d.text((44 + i * 140, 750), h, font=font(16), fill=DIM)
    d.text((40, 800), "Glow-then-reveal sample (see the GIF)", font=font(22, True), fill=INK)
    im.alpha_composite(strip.convert("RGBA").resize((1400, 160)), (40, 840))
    d.text((40, 1020), "Kid-safe check: no red, no teeth or sharp points, nothing above the head, nothing human-like (no person, face or body).", font=font(20), fill=DIM)
    im.convert("RGB").save(os.path.join(OUT, "sheets", f"{gid}_form2.png"))

cells = []
for gid, old, new, why, line in SHIFTS:
    st = reveal(gid); sheet(gid, old, new, why, line, st); cells.append((old, new, R(f"{gid}_p3_S.png"), R(f"{gid}_f2_S.png")))
ov = Image.new("RGBA", (4 * 440, 560), BG); d = ImageDraw.Draw(ov)
for i, (old, new, a, b) in enumerate(cells):
    x = i * 440; ov.alpha_composite(a.resize((210, 210)), (x + 10, 80)); ov.alpha_composite(b.resize((210, 210)), (x + 220, 80))
    d.text((x + 14, 20), old, font=font(20, True), fill=INK); d.text((x + 14, 46), f"-> {new}", font=font(20), fill=GOLD)
    ov.alpha_composite(silhouette(b).resize((210, 210)), (x + 220, 320)); ov.alpha_composite(silhouette(a).resize((210, 210)), (x + 10, 320))
ov.convert("RGB").save(os.path.join(OUT, "preview", "overview_form_shifts.png"))
ov.convert("L").save(os.path.join(OUT, "preview", "overview_form_shifts_grey.png"))
print("ok")
