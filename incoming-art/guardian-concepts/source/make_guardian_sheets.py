"""Compose one concept sheet per Guardian + an overview of all 10 + greyscale check (PIL).
    python3 incoming-art/guardian-concepts/source/make_guardian_sheets.py --renders DIR
Text on the sheets (names, phases, attacks, tells) is copied from drafts/content/bosses/*.json, not invented."""
import json, os, argparse, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..", "..", "..")
OUT = os.path.join(HERE, ".."); ap = argparse.ArgumentParser(); ap.add_argument("--renders", required=True); A = ap.parse_args()
IDS = "lamp-keeper sun-gardener hearth-cook stone-giant river-watcher ember-knight echo-mask root-keeper storm-herald lost-lightbearer".split()
import importlib.util, sys
LOOK = {"lamp-keeper": ("#f4c95d", "#ffe08a", "#fff3c4"), "sun-gardener": ("#7fbf4d", "#a8e07a", "#e9ffd0"), "hearth-cook": ("#e98a3c", "#ffb36b", "#ffe6c4"),
        "stone-giant": ("#8a8178", "#b9d88a", "#eaf6c8"), "river-watcher": ("#5aa0d6", "#8cc8ff", "#dff2ff"), "ember-knight": ("#e8772e", "#ffa560", "#ffe2c0"),
        "echo-mask": ("#b05a8a", "#e08cbc", "#ffe0f0"), "root-keeper": ("#7a5a3a", "#c9a06a", "#fff0cc"), "storm-herald": ("#6c7fb8", "#9fb2f0", "#e6ecff"),
        "lost-lightbearer": ("#f2e6b8", "#fff4cf", "#fff8e0")}
SIZE, ORTHO, ANCHOR = 512, 2.6, 0.85; PX_TILE = SIZE / ORTHO
BG = (40, 36, 62, 255); PANEL = (52, 47, 80, 255); INK = (236, 232, 248); DIM = (170, 164, 200)
def font(sz, bold=False):
    for f in (f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf",):
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()
F1, F2, F3 = font(34, True), font(20, True), font(16)
def R(gid, p, d): return Image.open(os.path.join(A.renders, f"{gid}_p{p}_{d}.png")).convert("RGBA")
def player():
    B = os.path.join(ROOT, "incoming-art/player-custom/sprites/body-a"); fw, fh = 128, 160
    lay = [("body", None), ("skin", "#e0a984"), ("gi", "#f2e9d8"), ("belt", "#f4f1ea"), ("belt-rim", "#2e2a3a"), ("face-01", None), ("hair-02", "#34303f")]
    out = Image.new("RGBA", (fw, fh))
    for n, tint in lay:
        f = Image.open(f"{B}/player-a_{n}_idle.png").convert("RGBA").crop((0, 4 * fh, fw, 5 * fh))
        if tint:
            c = Image.new("RGBA", f.size, tuple(int(tint[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
            rgb = Image.composite(Image.blend(f, f, 0), f, f)
            from PIL import ImageChops
            m = ImageChops.multiply(f.convert("RGB"), c.convert("RGB")).convert("RGBA"); m.putalpha(f.getchannel("A")); f = m
        out.alpha_composite(f)
    return out, 136.96
PL, PLA = player()
def tex(d, xy, s, f, fill=INK, w=None):
    x, y = xy
    for line in (textwrap.wrap(s, w) if w else [s]):
        d.text((x, y), line, font=f, fill=fill); y += f.size + 4
    return y
def silhouette(im):
    a = im.getchannel("A").point(lambda v: 255 if v > 40 else 0); s = Image.new("RGBA", im.size, (14, 11, 30, 255)); s.putalpha(a); return s
def sheet(gid):
    j = json.load(open(os.path.join(ROOT, "drafts/content/bosses", f"{gid}.json"))); acc, glow, eye = LOOK[gid]
    W, H = 1800, 1250; im = Image.new("RGBA", (W, H), BG); d = ImageDraw.Draw(im)
    d.text((40, 26), j["name"], font=F1, fill=INK)
    d.text((40, 70), f"Guardian concept sheet  |  {j['tier']} tier, {j.get('band','')}  |  CONCEPT ONLY - not a final sprite, not for import", font=F3, fill=DIM)
    # silhouette (S + SE)
    d.rounded_rectangle((30, 110, 560, 560), 14, fill=PANEL); d.text((48, 120), "Silhouette (S, SE)", font=F2, fill=INK)
    for i, dname in enumerate(("S", "SE")):
        s = silhouette(R(gid, 1, dname)).resize((300, 300)); im.alpha_composite(s, (20 + i * 250, 200))
    # palette
    d.rounded_rectangle((580, 110, 1000, 560), 14, fill=PANEL); d.text((598, 120), "Palette", font=F2, fill=INK)
    pal = [("shadow body", "#241e52"), ("belly / hood", "#3a3278"), ("deep shadow", "#120e2a"), ("Guardian colour", acc), ("rim / glow", glow), ("eyes", eye)]
    if gid == "ember-knight": pal.append(("draft colour (DECIDE)", j["color"]))
    for k, (n, h) in enumerate(pal):
        y = 160 + k * 54; d.rounded_rectangle((600, y, 660, y + 44), 8, fill=h, outline=(10, 8, 20), width=2)
        d.text((675, y + 2), n, font=F3, fill=INK); d.text((675, y + 22), h, font=F3, fill=DIM)
    # size vs player at game scale x2 (80 px per tile -> shown at 2x for readability)
    d.rounded_rectangle((1020, 110, 1770, 560), 14, fill=PANEL); d.text((1038, 120), "Size next to the player (same scale, feet on one line)", font=F2, fill=INK)
    k = 2.0; gl = 490; tile = 80 * k
    for x in range(1040, 1760, int(tile)): d.line((x, 160, x, gl), fill=(66, 60, 98))
    d.line((1040, gl, 1755, gl), fill=(120, 112, 160), width=2)
    p = PL.resize((int(128 * k), int(160 * k)), Image.NEAREST); im.alpha_composite(p, (1100, int(gl - PLA * k)))
    g = R(gid, 1, "S"); sc = tile / PX_TILE; g = g.resize((int(SIZE * sc), int(SIZE * sc)), Image.LANCZOS)
    im.alpha_composite(g, (1450 - g.width // 2, int(gl - SIZE * ANCHOR * sc)))
    d.text((1040, gl + 40), f"grid = 1 tile.  Guardian radius {j['radius']} tiles (draft).  Player = body A idle.", font=F3, fill=DIM)
    # phases
    d.text((40, 580), "How each phase changes (phase data from the draft json)", font=F2, fill=INK)
    arc = ["Wrapped in shadow: wisps all round, colour mostly hidden.", "Colour wakes up, the phase prop appears, fewer wisps.", "Shadow thins, colour shows most: nearly freed."]
    for i, ph in enumerate(j.get("phases", [])[:3]):
        x = 30 + i * 590; d.rounded_rectangle((x, 615, x + 570, 1230), 14, fill=PANEL)
        im.alpha_composite(R(gid, i + 1, "S").resize((300, 300)), (x - 20, 640)); im.alpha_composite(R(gid, i + 1, "SE").resize((300, 300)), (x + 260, 640))
        y = tex(d, (x + 18, 950), f"Phase {i+1}: {ph.get('id','')}  (from {int(round(ph.get('atHealthFraction',1)*100))}% health)", F2)
        y = tex(d, (x + 18, y + 2), "Look: " + arc[i], F3, DIM, 62)
        y = tex(d, (x + 18, y + 2), "Attacks: " + ", ".join(ph.get("attacks", [])), F3, INK, 62)
        if ph.get("tell"): y = tex(d, (x + 18, y + 2), "Tell: " + ph["tell"], F3, INK, 62)
        if ph.get("senseiLine"): tex(d, (x + 18, y + 2), "Sensei: \"" + ph["senseiLine"] + "\"", F3, DIM, 62)
    return im
os.makedirs(os.path.join(OUT, "sheets"), exist_ok=True); os.makedirs(os.path.join(OUT, "preview"), exist_ok=True)
for gid in IDS:
    s = sheet(gid); s.convert("RGB").save(os.path.join(OUT, "sheets", f"{gid}_concept.png"))
# overview: all 10, phase 1 S, on one ground line with the player, plus phase 3 row
W = 2400; ov = Image.new("RGBA", (W, 980), BG); d = ImageDraw.Draw(ov)
d.text((40, 24), "The 10 Guardians - concept overview (white to black tier, same scale, player at left)", font=F1, fill=INK)
for row, ph in enumerate((1, 3)):
    gl = 400 + row * 450; d.text((40, gl - 330), f"Phase {ph}", font=F2, fill=DIM); d.line((30, gl, W - 30, gl), fill=(120, 112, 160), width=2)
    k = 1.5; p = PL.resize((int(128 * k), int(160 * k)), Image.NEAREST); ov.alpha_composite(p, (40, int(gl - PLA * k)))
    for i, gid in enumerate(IDS):
        g = R(gid, ph, "S"); sc = 80 * k / PX_TILE; g = g.resize((int(SIZE * sc), int(SIZE * sc)), Image.LANCZOS)
        cx = 330 + i * 205; ov.alpha_composite(g, (cx - g.width // 2, int(gl - SIZE * ANCHOR * sc)))
        name = json.load(open(os.path.join(ROOT, "drafts/content/bosses", f"{gid}.json")))["name"].replace("The ", "")
        d.text((cx - 90, gl + 30), name[:20], font=F3, fill=INK)
ov.convert("RGB").save(os.path.join(OUT, "preview", "overview_all10.png"))
ImageOps.grayscale(ov.convert("RGB")).save(os.path.join(OUT, "preview", "overview_all10_grey.png"))
# phone-size check of the overview
ov.convert("RGB").resize((W // 3, 980 // 3), Image.LANCZOS).save(os.path.join(OUT, "preview", "overview_phone.png"))
print("ok")
