"""Dojo Ascent - A-TOWN-GROWTH v2: compose one FULL town picture per belt (day + dusk) from the Blender passes.
    python3 make_stages.py <passes-dir> [stage ...]      passes-dir holds <stage>-{day,night,lights}.png from build_town_stage.py
Writes ../stages/<n>-<belt>-<day|dusk>@2x.png (1864x860) and the 1x copy (932x430) and ../stages/stages.json.
Same recipe as the approved town picture (town-square-concept/source/make_concept.py: sky, hazy far hills + Tower, town
shifted down 0.95 tile, dusk grade) with these differences, all on purpose:
  * the dusk light is turned WAY down (glow ~1/4, ground pools ~1/3, no sparkle swarm, a fainter Tower light);
  * White gets a gentle 'worn' grade (tired colours); Blue gets the first light effects (soft sun shafts, a few floating
    motes by day; a few fireflies by the river at dusk);
  * the Action Zone dojo sprite is pasted on top, exactly as action-zone-dojo/source/make_town_preview.py does."""
import json, os, sys, random
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageEnhance
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..")
TS = os.path.join(HERE, "..", "..", "town-square-concept", "source"); AZ = os.path.join(HERE, "..", "..", "action-zone-dojo")
PPT = 80; SHIFT = int(0.95 * PPT); W, H = 1864, 860; FS = 0.92
STAGES = {  # order, belt, worn strength, statue?
    "white": (1, "white", 1.0), "orange": (3, "orange", 0.0), "blue": (5, "blue", 0.0), "base": (0, "base", 0.0)}

def wear(im, k):
    """a gentle worn look: less colour, a little dull warm-grey fade, a hair less contrast. k = 1 is White."""
    if k <= 0: return im
    a = im.getchannel("A") if im.mode == "RGBA" else None
    rgb = im.convert("RGB")
    rgb = ImageEnhance.Color(rgb).enhance(1 - 0.30 * k)
    rgb = Image.blend(rgb, Image.new("RGB", rgb.size, (158, 148, 132)), 0.11 * k)
    rgb = ImageEnhance.Contrast(rgb).enhance(1 - 0.06 * k)
    if a is not None: rgb.putalpha(a)
    return rgb

def sky_far(variant):
    SKY = {"day": ((150, 205, 245), (238, 247, 255)), "dusk": ((38, 40, 92), (214, 132, 120))}[variant]
    HAZE = {"day": (214, 233, 250), "dusk": (120, 100, 150)}[variant]
    sky = Image.new("RGBA", (W, H)); top, bot = SKY
    for y in range(H):
        t = min(1.0, y / (H * 0.32)); sky.paste(tuple(int(a + (b - a) * t) for a, b in zip(top, bot)) + (255,), (0, y, W, y + 1))
    far = Image.open(os.path.join(TS, "render_far@2x.png")).convert("RGBA")
    far = far.resize((int(far.width * FS), int(far.height * FS)), Image.LANCZOS)
    r, g, b, a = far.split(); far = Image.merge("RGBA", (*Image.blend(Image.merge("RGB", (r, g, b)), Image.new("RGB", far.size, HAZE), 0.18).split(), a))
    dx = int(14.2 * PPT - far.width / 2)
    col = far.crop((far.width // 2 - 2, 0, far.width // 2 + 2, far.height)).getbbox(); dy = int(0.3 * PPT) - col[1]
    layer = Image.new("RGBA", (W, H)); layer.paste(far, (dx, dy), far); sky.alpha_composite(layer)
    if variant == "day":
        kd = ImageDraw.Draw(sky)
        for (c, rr, sz) in ((17.0, 0.7, 0.16), (17.5, 0.95, 0.12), (17.9, 0.6, 0.14), (8.3, 1.5, 0.12), (8.7, 1.35, 0.1)):
            x, y, k = c * PPT, rr * PPT, sz * PPT
            kd.line([(x - k, y - 0.4 * k), (x - 0.45 * k, y - 0.55 * k), (x, y), (x + 0.45 * k, y - 0.55 * k), (x + k, y - 0.4 * k)], fill=(84, 92, 128, 255), width=max(2, int(PPT * 0.03)), joint="curve")
    return sky

def shifted(path):
    t = Image.open(path).convert("RGBA"); t2 = Image.new("RGBA", (W, H)); t2.paste(t, (0, SHIFT)); return t2
def shifted_mask(path):
    m = Image.open(path).convert("L"); mm = Image.new("L", (W, H)); mm.paste(m, (0, SHIFT)); return mm
def fill(c): return Image.new("RGB", (W, H), c)

# ---- dusk light amounts (the approved dusk picture used glow 0.33, pools 0.8, 28 fireflies; these are the toned-down ones)
GLOW, POOL, POOL_R, REFL, TOWER = 0.09, 0.26, 0.8, 100, 70
POOLS = {"always": ((7.0, 4.85, 0.7), (11.6, 4.85, 0.7), (9.3, 5.05, 2.0), (18.3, 4.55, 0.6), (20.9, 4.55, 0.6), (5.0, 9.05, 1.0), (19.0, 9.05, 1.0), (14.6, 8.65, 0.6), (16.6, 8.65, 0.6))}
def pools_for(stage):
    P = list(POOLS["always"])
    if stage == "white":   # lamp posts + shop front + the one lit placeholder window only; lanterns are off
        return [(9.3, 5.05, 1.4), (20.9, 4.55, 0.6), (5.0, 9.05, 1.0), (19.0, 9.05, 1.0)]
    return P

def dusk(stage, bg_lit, lights):
    out = ImageChops.multiply(bg_lit, fill((120, 112, 165))); out = Image.blend(out, fill((60, 45, 70)), 0.1)
    m = lights
    warm = ImageChops.multiply(bg_lit, fill((255, 226, 170))); out.paste(warm, (0, 0), m)          # the lit windows/lanterns themselves stay bright
    glow = m.filter(ImageFilter.GaussianBlur(int(0.30 * PPT))).point(lambda v: min(255, v * 3))
    out = Image.composite(Image.blend(out, fill((255, 196, 110)), 0.55), out, glow.point(lambda v: int(v * GLOW / 0.55)))
    pool = Image.new("L", (W, H)); pd = ImageDraw.Draw(pool)
    for c, rr, sx in pools_for(stage):
        sx *= POOL_R; x, y = c * PPT, rr * PPT + SHIFT; pd.ellipse((x - sx * PPT, y - 0.34 * PPT, x + sx * PPT, y + 0.34 * PPT), fill=255)
    pool = pool.filter(ImageFilter.GaussianBlur(int(0.3 * PPT)))
    out = Image.composite(Image.blend(out, fill((255, 186, 104)), POOL), out, pool)
    if stage != "white":   # bridge lantern reflections on the river (the lanterns are on)
        rf = Image.new("L", (W, H)); rd = ImageDraw.Draw(rf)
        for lx in (14.6, 16.6):
            wx = min(max(lx, 14.95), 16.25)
            for k in range(6):
                y = (8.75 + k * 0.16) * PPT + SHIFT; hw = (0.16 - k * 0.02) * PPT
                rd.rectangle((wx * PPT - hw, y, wx * PPT + hw, y + 0.045 * PPT), fill=REFL)
        out = Image.composite(fill((255, 214, 140)), out, rf.filter(ImageFilter.GaussianBlur(2)))
    tl = Image.new("L", (W, H)); ImageDraw.Draw(tl).ellipse((14.2 * PPT - 0.9 * PPT, 0.1 * PPT, 14.2 * PPT + 0.9 * PPT, 1.6 * PPT), fill=TOWER)
    out = Image.composite(fill((255, 220, 140)), out, tl.filter(ImageFilter.GaussianBlur(int(0.4 * PPT))))
    if stage == "blue":    # Blue: the first soft effects - a few fireflies by the river and the hedges (nothing over the walking lanes)
        random.seed(5); ff = Image.new("L", (W, H)); fd = ImageDraw.Draw(ff); core = Image.new("L", (W, H)); cd = ImageDraw.Draw(core)
        for c, rr in ((14.4, 6.6), (17.0, 7.0), (15.5, 9.0), (16.9, 10.0), (13.6, 10.2), (18.2, 9.4)):
            x = c * PPT; y = rr * PPT + SHIFT - 0.4 * PPT; rad = 0.045 * PPT
            fd.ellipse((x - 3 * rad, y - 3 * rad, x + 3 * rad, y + 3 * rad), fill=70); cd.ellipse((x - rad, y - rad, x + rad, y + rad), fill=190)
        ff = ff.filter(ImageFilter.GaussianBlur(int(0.12 * PPT)))
        out = Image.composite(fill((236, 255, 160)), out, ff.point(lambda v: int(v * 0.6)))
        out = Image.composite(fill((250, 255, 215)), out, core.filter(ImageFilter.GaussianBlur(1)))
    return out

def day_effects(out, stage):
    if stage != "blue": return out
    out = Image.blend(out, fill((255, 236, 196)), 0.05)       # a touch of warm, homely light
    # three soft sun shafts coming down from the upper left; they fade out well above the walking lanes
    beams = Image.new("L", (W, H)); bd = ImageDraw.Draw(beams)
    for x0, wd in ((2.4, 0.9), (8.0, 1.2), (17.2, 1.0)):
        bd.polygon([(x0 * PPT, 0), ((x0 + wd) * PPT, 0), ((x0 + wd + 2.2) * PPT, 4.6 * PPT), ((x0 + 2.2) * PPT, 4.6 * PPT)], fill=255)
    beams = beams.filter(ImageFilter.GaussianBlur(int(0.28 * PPT)))
    fade = Image.linear_gradient("L").resize((W, H)).point(lambda v: 255 - v)    # 255 at top -> 0 at bottom
    fade = Image.new("L", (W, H), 0); fd = ImageDraw.Draw(fade)
    for y in range(H): fd.line([(0, y), (W, y)], fill=int(max(0, 1 - y / 330.0) * 255))
    beams = ImageChops.multiply(beams, fade).point(lambda v: int(v * 0.22))
    out = Image.composite(fill((255, 246, 208)), out, beams)
    # a handful of floating golden motes (small, soft, high above the lanes)
    random.seed(9); mo = Image.new("L", (W, H)); md = ImageDraw.Draw(mo); core = Image.new("L", (W, H)); cd = ImageDraw.Draw(core)
    for i in range(12):
        x = random.uniform(1.0, 22.0) * PPT; y = random.uniform(1.9, 4.5) * PPT
        r = random.uniform(2.0, 3.2); md.ellipse((x - 3 * r, y - 3 * r, x + 3 * r, y + 3 * r), fill=80); cd.ellipse((x - r, y - r, x + r, y + r), fill=200)
    mo = mo.filter(ImageFilter.GaussianBlur(3))
    out = Image.composite(fill((255, 244, 200)), out, mo.point(lambda v: int(v * 0.8)))
    return Image.composite(fill((255, 250, 225)), out, core.filter(ImageFilter.GaussianBlur(1)).point(lambda v: int(v * 0.8)))

def make(stage, variant, passes):
    order, belt, k = STAGES[stage]
    town = shifted(os.path.join(passes, f"{stage}-{'day' if variant == 'day' else 'night'}.png"))
    sky = sky_far(variant); sky.alpha_composite(town); out = sky.convert("RGB")
    out = wear(out, k)
    if variant == "dusk":
        lit = out.copy()
        out = dusk(stage, lit, shifted_mask(os.path.join(passes, f"{stage}-lights.png")))
    else:
        out = day_effects(out, stage)
    out = out.convert("RGBA")
    info = json.load(open(os.path.join(AZ, "sprites", "static.json")))["sprites"]["town-slot-dojo"]
    sp = Image.open(os.path.join(AZ, "sprites", info["files"][variant])).convert("RGBA")
    if variant == "dusk":    # the sprite's own warm ground pools under the door are turned down like the rest of the dusk light
        dayspr = Image.open(os.path.join(AZ, "sprites", info["files"]["day"])).convert("RGBA")
        g = ImageChops.multiply(dayspr.convert("RGB"), Image.new("RGB", dayspr.size, (120, 112, 165))); g.putalpha(dayspr.getchannel("A"))
        ramp = Image.new("L", sp.size, 0); rd = ImageDraw.Draw(ramp)
        for yy in range(sp.height): rd.line([(0, yy), (sp.width, yy)], fill=int(255 * 0.6 * min(1.0, max(0.0, (yy - 286) / 16.0))))
        sp = Image.composite(g, sp, ramp)
    sp = wear(sp, k * 0.5)
    ax, ay = info["anchorPx"]; tx, ty = info["anchorTownTile"]
    out.alpha_composite(sp, (round(tx * PPT - ax), round(ty * PPT + SHIFT - ay)))
    return out.convert("RGB")

PLAN = [  # order, belt, built?, statue, one line of what the picture shows
    (1, "white", True, False, "A little run down: faded and worn, a boarded window, a patched awning and bridge plank, weedy empty beds, murky water, empty plinth. Still friendly."),
    (2, "yellow", False, False, "PLANNED, not built: cleaner and more normal than White."),
    (3, "orange", True, False, "About the approved town concept art (the base). Empty plinth. A shop chimney and a bread basket."),
    (4, "green", False, True, "PLANNED, not built: the statue arrives."),
    (5, "blue", True, True, "Statue in place. First gentle light effects: thin chimney smoke, extra koi and lilies, faint sun shafts and motes by day, a few fireflies at dusk."),
    (6, "red", False, True, "PLANNED, not built: one gentle upgrade on Blue (gold flame, never red)."),
    (7, "redblack", False, True, "PLANNED, not built: one gentle upgrade."),
    (8, "brown", False, True, "PLANNED, not built: one gentle upgrade."),
    (9, "brownblack", False, True, "PLANNED, not built: one gentle upgrade."),
    (10, "black", False, True, "PLANNED, not built: out of scope in the content spec so far; keep it gentle too.")]

def write_manifest():
    out = {"note": "One FULL town background per belt, day + dusk, dojo sprite already in. Swap the whole picture by the student's belt. Nothing stacks.",
           "sizePx2x": [W, H], "sizePx1x": [W // 2, H // 2], "tilePx2x": PPT, "stages": []}
    for order, belt, built, statue, notes in PLAN:
        e = {"order": order, "belt": belt, "built": built, "statue": statue, "notes": notes}
        if built:
            e["files"] = {v: {"2x": f"{order}-{belt}-{v}@2x.png", "1x": f"{order}-{belt}-{v}.png"} for v in ("day", "dusk")}
        out["stages"].append(e)
    json.dump(out, open(os.path.join(OUT, "stages", "stages.json"), "w"), indent=2); open(os.path.join(OUT, "stages", "stages.json"), "a").write("\n")

if __name__ == "__main__":
    passes = sys.argv[1]; which = sys.argv[2:] or ["white", "orange", "blue"]
    os.makedirs(os.path.join(OUT, "stages"), exist_ok=True)
    for st in which:
        order, belt, k = STAGES[st]
        for v in ("day", "dusk"):
            im = make(st, v, passes); name = f"{order}-{belt}-{v}"
            d = os.path.join(OUT, "stages") if st != "base" else passes
            im.save(os.path.join(d, name + "@2x.png")); im.resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(d, name + ".png")); print("ok", name)

    if "base" not in which:
        write_manifest()
