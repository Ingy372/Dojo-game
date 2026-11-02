"""Dojo Ascent - A-TOWN-GROWTH v3: compose one FULL town picture per belt (day + dusk) from the Blender passes.
    python3 make_stages.py <passes-dir> [stage ...]    passes-dir holds <stage>-{day,night,lights,shade,height,hero}.png (build_town_stage.py)
Writes ../stages/<n>-<belt>-<day|dusk>@2x.png (1864x860) + the 1x copy (932x430) and ../stages/stages.json.
Needs Pillow, numpy, scipy. Town growth is CAPPED at Blue: Red and above reuse the Blue picture (see PLAN / stages.json).

The recipe (every step is one of the 'techniques' listed in README.md):
  sky + soft clouds + hazy far hills/Tower  ->  the Blender town (shifted down 0.95 tile)  ->  the dojo sprite (day)
  -> soft cool CAST SHADOWS + ambient occlusion (from the 'shade' pass)      [Archero / Survivor.io drop shadows]
  -> warm light on lit surfaces, cool shadows                                   [Slay the Spire painterly light]
  -> a thin warm RIM LINE on light-facing edges (from the 'height' pass)       [Slay the Spire rim light, Archero crisp edges]
  -> a little BLOOM on a few hero props (statue, stone lanterns)               [Pokemon / Club Penguin hero glow]
  -> one colour grade per stage (saturation, contrast, split tint)             [coherent stage palettes]
  -> scenery a touch darker/cooler than the play space + a soft vignette       [Archero / Survivor.io play-space contrast]
  -> faint painterly blotches; effects (sun shafts, motes, blossom petals)
  dusk: the same picture, then the (toned-down) dusk grade, soft glow only from real lit things, a few fireflies (Blue)."""
import json, os, sys, random, math
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..")
TS = os.path.join(HERE, "..", "..", "town-square-concept", "source"); AZ = os.path.join(HERE, "..", "..", "action-zone-dojo")
PPT = 80; SHIFT = int(0.95 * PPT); W, H = 1864, 860; FS = 0.92
STAGES = {"white": (1, "white"), "green": (4, "green"), "blue": (5, "blue")}   # order, belt
CFG = {
    "white": dict(shadow=0.38, scol=(0.80, 0.84, 0.92), rim=0.14, rimc=(236, 236, 226), warm=(1.0, 0.99, 0.96), sat=0.74, con=0.94, expo=1.0,
                  stint=(0.97, 0.97, 0.92), htint=(1.0, 0.99, 0.96), lift=0.08, vig=0.16, bloom=0.0, blot=0.05, glow=0.0),
    "green": dict(shadow=0.70, scol=(0.66, 0.75, 1.0), rim=0.36, rimc=(255, 244, 214), warm=(1.05, 1.02, 0.95), sat=1.18, con=1.11, expo=0.98,
                  stint=(0.92, 0.95, 1.04), htint=(1.04, 1.02, 0.97), lift=0.0, vig=0.07, bloom=0.10, blot=0.03, glow=0.0),
    "blue": dict(shadow=0.74, scol=(0.64, 0.68, 0.98), rim=0.52, rimc=(255, 226, 160), warm=(1.06, 1.01, 0.90), sat=1.26, con=1.15, expo=0.96,
                 stint=(0.90, 0.91, 1.05), htint=(1.07, 1.02, 0.92), lift=0.0, vig=0.11, bloom=0.30, blot=0.03, glow=0.09)}

# ------------------------------------------------------------------ sky
def sky_far(stage, variant):
    if variant == "day":
        SK = {"white": [(176, 192, 205), (224, 229, 231)], "green": [(112, 186, 246), (226, 245, 255)],
              "blue": [(112, 168, 236), (255, 228, 186)]}[stage]
        HAZE = {"white": (204, 212, 218), "green": (212, 236, 252), "blue": (255, 232, 200)}[stage]
    else:
        SK = [(38, 40, 92), (214, 132, 120)]; HAZE = (120, 100, 150)
    sky = Image.new("RGBA", (W, H)); top, bot = SK
    for y in range(H):
        t = min(1.0, y / (H * 0.32)); sky.paste(tuple(int(a + (b - a) * t) for a, b in zip(top, bot)) + (255,), (0, y, W, y + 1))
    if variant == "day":     # soft painted clouds (behind the far hills): grey bank in White, white puffs in Green, warm-lit puffs in Blue
        random.seed(3)
        for cx, cy, sc in ((300, 64, 1.0), (760, 104, 0.8), (1500, 70, 0.9), (1760, 112, 0.7)):
            for layer, col, dy in (("sh", {"white": (170, 180, 190), "green": (186, 210, 238), "blue": (255, 196, 160)}[stage], 7),
                                   ("hi", {"white": (206, 211, 216), "green": (255, 255, 255), "blue": (255, 246, 232)}[stage], 0)):
                cl = Image.new("RGBA", (W, H), (0, 0, 0, 0)); cd = ImageDraw.Draw(cl)
                for ox, oy, rx, ry in ((-70, 8, 60, 22), (-20, -6, 70, 34), (40, -2, 64, 30), (86, 10, 52, 20), (0, 14, 120, 16)):
                    x, y = cx + ox * sc, cy + oy * sc + dy
                    cd.ellipse((x - rx * sc, y - ry * sc, x + rx * sc, y + ry * sc), fill=col + (235 if stage != "white" else 170,))
                sky.alpha_composite(cl.filter(ImageFilter.GaussianBlur(2.2)))
    far = Image.open(os.path.join(TS, "render_far@2x.png")).convert("RGBA")
    far = far.resize((int(far.width * FS), int(far.height * FS)), Image.LANCZOS)
    r, g, b, a = far.split(); far = Image.merge("RGBA", (*Image.blend(Image.merge("RGB", (r, g, b)), Image.new("RGB", far.size, HAZE), 0.18).split(), a))
    dx = int(14.2 * PPT - far.width / 2)
    col = far.crop((far.width // 2 - 2, 0, far.width // 2 + 2, far.height)).getbbox(); dy = int(0.3 * PPT) - col[1]
    layer = Image.new("RGBA", (W, H)); layer.paste(far, (dx, dy), far); sky.alpha_composite(layer)
    if variant == "day" and stage != "white":
        kd = ImageDraw.Draw(sky)
        for (c, rr, sz) in ((17.0, 0.7, 0.16), (17.5, 0.95, 0.12), (17.9, 0.6, 0.14), (8.3, 1.5, 0.12), (8.7, 1.35, 0.1)):
            x, y, k = c * PPT, rr * PPT, sz * PPT
            kd.line([(x - k, y - 0.4 * k), (x - 0.45 * k, y - 0.55 * k), (x, y), (x + 0.45 * k, y - 0.55 * k), (x + k, y - 0.4 * k)], fill=(84, 92, 128, 255), width=max(2, int(PPT * 0.03)), joint="curve")
    return sky

def shifted(path):
    t = Image.open(path).convert("RGBA"); t2 = Image.new("RGBA", (W, H)); t2.paste(t, (0, SHIFT)); return t2
def shifted_mask(path):
    m = Image.open(path).convert("L"); mm = Image.new("L", (W, H)); mm.paste(m, (0, SHIFT)); return mm
def shifted_f(path, scale=1.0):
    """a pass as a float array (H, W[, C]) in 0..1, shifted like the town"""
    im = Image.open(path); a = np.asarray(im).astype(np.float32)
    a = a / (65535.0 if im.mode.startswith("I;16") else 255.0) * scale
    out = np.zeros((H, W) + a.shape[2:], np.float32); n = min(a.shape[0], H - SHIFT); out[SHIFT:SHIFT + n] = a[:n, :W]; return out
def fill(c): return Image.new("RGB", (W, H), c)
def lin(v): return ((v + 0.055) / 1.055) ** 2.4
def smooth(x, a, b): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

# ------------------------------------------------------------------ light, shadow, rim, bloom, grade
def lighting(rgb, stage, variant, passes, town_alpha, spmask=None):
    """rgb: float (H,W,3) 0..1. Adds the cast shadows, warm light, rim line, hero bloom, stage grade, vignette and painterly blotches."""
    c = CFG[stage]; dusk = variant == "dusk"; ks = 0.5 if dusk else 1.0
    a = town_alpha > 0.5
    sh = shifted_f(os.path.join(passes, f"{stage}-shade.png"))[..., :3]; z = shifted_f(os.path.join(passes, f"{stage}-height.png")) / 0.16 - 0.1
    L = lin(sh.mean(-1)); flat = a & (z < 0.1) & (L > 0.01)
    hi = np.percentile(L[flat], 92); lo = hi * 0.2 / 0.82
    s = np.clip((hi - L) / (hi - lo), 0, 1) * a
    s = gaussian_filter(s, 1.4)
    keep = 1 - (spmask if spmask is not None else 0)     # the dojo sprite is finished art: no cast shadow / rim from the hedge geometry hidden behind it
    s = s * keep
    wt = 1 - 0.65 * np.clip((z - 0.15) / 0.4, 0, 1)                 # full shadow on the ground, a lighter touch on props (they are toon-shaded already)
    k = (c["shadow"] * ks * s * wt)[..., None]
    scol = np.array(c["scol"], np.float32); rgb = rgb * (1 - k) + rgb * scol * k
    warm = np.array(c["warm"], np.float32); rgb = rgb * (1 + ((1 - s)[..., None] * (warm - 1)) * 0.9 * a[..., None])
    # rim line on edges that face the light (the neighbour up-left is lower): thin, warm, only where lit
    nb = np.roll(z, (2, 2), axis=(0, 1)); rim = np.clip((z - nb - 0.012) / 0.04, 0, 1) * a * (1 - s) * keep
    rim = gaussian_filter(rim, 0.5)
    rimc = np.array(c["rimc"], np.float32) / 255; r_ = (rim * c["rim"] * (0.35 if dusk else 1.0))[..., None]
    rgb = rgb * (1 - r_) + rimc * r_
    if c["bloom"] > 0 and not dusk:       # a little glow on the hero props only (statue + star, stone lanterns)
        hm = shifted_f(os.path.join(passes, f"{stage}-hero.png")).mean(-1) if os.path.exists(os.path.join(passes, f"{stage}-hero.png")) else None
        if hm is not None:
            hm = (hm > 0.5).astype(np.float32); core = gaussian_filter(hm, 0.8)[..., None]
            lum0 = (rgb @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]       # hero props: richer colour + a little contrast so the gold keeps its form
            rich = lum0 + (rgb - lum0) * 1.3; rich = 0.5 + (rich - 0.5) * 1.12; rgb = rgb * (1 - core) + rich * core
            bl = np.clip(gaussian_filter(hm, 12) * 1.6 + gaussian_filter(hm, 4) * 0.8, 0, 1)[..., None] * c["bloom"] * (1 - 0.7 * core)
            bc = np.array((1.0, 0.88, 0.55), np.float32); rgb = 1 - (1 - rgb) * (1 - bc * bl)
    # colour grade
    lum = (rgb @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
    rgb = lum + (rgb - lum) * c["sat"]; rgb = 0.5 + (rgb * c["expo"] - 0.5) * c["con"]
    t = smooth(lum, 0.25, 0.8); rgb = rgb * (np.array(c["stint"], np.float32) * (1 - t) + np.array(c["htint"], np.float32) * t)
    if c["lift"]: rgb = rgb * (1 - c["lift"]) + np.array((158, 148, 132), np.float32) / 255 * c["lift"]
    # play space vs scenery: scenery (hills, hedges, back lawn) a touch darker and cooler; a soft vignette around the plaza
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    play = smooth(yy, 360, 470)[..., None]
    rgb = rgb * (0.945 + 0.065 * play) * (np.array((0.985, 0.995, 1.01), np.float32) * (1 - play) + play)
    v = np.clip(((xx - 932) / 1100) ** 2 + ((yy - 560) / 620) ** 2, 0, 1.6)[..., None]; rgb = rgb * (1 - c["vig"] * v * 0.8)
    if c["glow"]:                              # golden-hour wash from the upper left (the sun's side)
        g = np.exp(-np.sqrt((xx / 1000) ** 2 + (yy / 700) ** 2) * 1.6)[..., None]; rgb = 1 - (1 - rgb) * (1 - np.array((1.0, 0.78, 0.48), np.float32) * g * c["glow"])
    rnd = np.random.RandomState(11); n1 = gaussian_filter(rnd.randn(H, W).astype(np.float32), 22); n1 /= n1.std() + 1e-6
    n2 = gaussian_filter(rnd.randn(H, W).astype(np.float32), 1.3); n2 /= n2.std() + 1e-6
    rgb = rgb * (1 + c["blot"] * 0.5 * n1[..., None] + 0.012 * n2[..., None])
    return np.clip(rgb, 0, 1)

def grade_sprite(im, stage):
    """the dojo sprite gets the stage's saturation / contrast / tint so it sits in the same picture"""
    c = CFG[stage]; a = np.asarray(im.getchannel("A")); x = np.asarray(im.convert("RGB")).astype(np.float32) / 255
    lum = (x @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]; x = lum + (x - lum) * c["sat"]; x = 0.5 + (x - 0.5) * c["con"]
    t = smooth(lum, 0.25, 0.8); x = x * (np.array(c["stint"], np.float32) * (1 - t) + np.array(c["htint"], np.float32) * t)
    if c["lift"]: x = x * (1 - c["lift"]) + np.array((158, 148, 132), np.float32) / 255 * c["lift"]
    o = Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8), "RGB"); o.putalpha(Image.fromarray(a)); return o

# ---- dusk light amounts (the approved dusk picture used glow 0.33, pools 0.8, 28 fireflies; these are the toned-down ones)
GLOW, POOL, POOL_R, REFL, TOWER = 0.09, 0.26, 0.8, 100, 70
POOLS = ((7.0, 4.85, 0.7), (11.6, 4.85, 0.7), (9.3, 5.05, 2.0), (18.3, 4.55, 0.6), (20.9, 4.55, 0.6), (5.0, 9.05, 1.0), (19.0, 9.05, 1.0), (14.6, 8.65, 0.6), (16.6, 8.65, 0.6))
TORO = {"green": ((10.2, 9.1, 0.55), (13.1, 9.1, 0.55)), "blue": ((10.2, 9.1, 0.55), (13.1, 9.1, 0.55), (10.2, 6.9, 0.55), (13.1, 6.9, 0.55))}
def pools_for(stage):
    if stage == "white":   # lamp posts + shop front + the one lit placeholder window only; lanterns are off
        return [(9.3, 5.05, 1.4), (20.9, 4.55, 0.6), (5.0, 9.05, 1.0), (19.0, 9.05, 1.0)]
    return list(POOLS) + list(TORO[stage])

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
    if stage == "blue":    # Blue: a few fireflies by the river and the hedges (nothing over the walking lanes)
        random.seed(5); ff = Image.new("L", (W, H)); fd = ImageDraw.Draw(ff); core = Image.new("L", (W, H)); cd = ImageDraw.Draw(core)
        for c, rr in ((14.4, 6.6), (17.0, 7.0), (15.5, 9.0), (16.9, 10.0), (13.6, 10.2), (18.2, 9.4)):
            x = c * PPT; y = rr * PPT + SHIFT - 0.4 * PPT; rad = 0.045 * PPT
            fd.ellipse((x - 3 * rad, y - 3 * rad, x + 3 * rad, y + 3 * rad), fill=70); cd.ellipse((x - rad, y - rad, x + rad, y + rad), fill=190)
        ff = ff.filter(ImageFilter.GaussianBlur(int(0.12 * PPT)))
        out = Image.composite(fill((236, 255, 160)), out, ff.point(lambda v: int(v * 0.6)))
        out = Image.composite(fill((250, 255, 215)), out, core.filter(ImageFilter.GaussianBlur(1)))
    return out

def petal_layer(seed=21):
    """Blue day: a soft carpet of blossom petals under each cherry tree and a few drifting ones. Kept out of the walking-lane band (y 444-540)."""
    rnd = random.Random(seed); lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    def petal(x, y, s, ang, col, al):
        p = Image.new("RGBA", (40, 40), (0, 0, 0, 0)); pd = ImageDraw.Draw(p); pd.ellipse((20 - s, 20 - s * 0.55, 20 + s, 20 + s * 0.55), fill=col + (al,))
        p = p.rotate(ang, resample=Image.BICUBIC); lay.alpha_composite(p, (int(x) - 20, int(y) - 20))
    trees = ((6.6, 6.35), (17.5, 6.0), (0.8, 7.4), (22.5, 7.4), (21.8, 5.6))
    for c, r in trees:
        for _ in range(11):
            x = c * PPT + rnd.uniform(-70, 70); y = r * PPT + SHIFT + rnd.uniform(6, 60)
            if 444 <= y <= 540: continue
            petal(x, y, rnd.uniform(4.5, 7), rnd.uniform(0, 180), rnd.choice(((250, 196, 214), (255, 226, 236), (240, 164, 196))), 235)
    for _ in range(9):                   # drifting: well above the lane band, in the lawn/hedge zone
        c, r = rnd.choice(trees); x = c * PPT + rnd.uniform(-110, 110); y = rnd.uniform(250, 425)
        petal(x, y, rnd.uniform(4, 6), rnd.uniform(0, 180), (255, 214, 228), 220)
    return lay

def day_effects(out, stage):
    if stage != "blue": return out
    # three soft sun shafts coming down from the upper left; they fade out well above the walking lanes
    beams = Image.new("L", (W, H)); bd = ImageDraw.Draw(beams)
    for x0, wd in ((2.4, 0.9), (8.0, 1.2), (17.2, 1.0)):
        bd.polygon([(x0 * PPT, 0), ((x0 + wd) * PPT, 0), ((x0 + wd + 2.2) * PPT, 4.6 * PPT), ((x0 + 2.2) * PPT, 4.6 * PPT)], fill=255)
    beams = beams.filter(ImageFilter.GaussianBlur(int(0.28 * PPT)))
    fade = Image.new("L", (W, H), 0); fd = ImageDraw.Draw(fade)
    for y in range(H): fd.line([(0, y), (W, y)], fill=int(max(0, 1 - y / 330.0) * 255))
    beams = ImageChops.multiply(beams, fade).point(lambda v: int(v * 0.26))
    out = Image.composite(fill((255, 240, 196)), out, beams)
    random.seed(9); mo = Image.new("L", (W, H)); md = ImageDraw.Draw(mo); core = Image.new("L", (W, H)); cd = ImageDraw.Draw(core)
    for i in range(12):
        x = random.uniform(1.0, 22.0) * PPT; y = random.uniform(1.9, 4.5) * PPT
        r = random.uniform(2.0, 3.2); md.ellipse((x - 3 * r, y - 3 * r, x + 3 * r, y + 3 * r), fill=80); cd.ellipse((x - r, y - r, x + r, y + r), fill=200)
    mo = mo.filter(ImageFilter.GaussianBlur(3))
    out = Image.composite(fill((255, 244, 200)), out, mo.point(lambda v: int(v * 0.8)))
    out = Image.composite(fill((255, 250, 225)), out, core.filter(ImageFilter.GaussianBlur(1)).point(lambda v: int(v * 0.8)))
    o = out.convert("RGBA"); o.alpha_composite(petal_layer()); return o.convert("RGB")

def sprite(stage, variant, graded=True):
    info = json.load(open(os.path.join(AZ, "sprites", "static.json")))["sprites"]["town-slot-dojo"]
    sp = Image.open(os.path.join(AZ, "sprites", info["files"][variant])).convert("RGBA")
    if variant == "dusk":    # the sprite's own warm ground pools under the door are turned down like the rest of the dusk light
        dayspr = Image.open(os.path.join(AZ, "sprites", info["files"]["day"])).convert("RGBA")
        g = ImageChops.multiply(dayspr.convert("RGB"), Image.new("RGB", dayspr.size, (120, 112, 165))); g.putalpha(dayspr.getchannel("A"))
        ramp = Image.new("L", sp.size, 0); rd = ImageDraw.Draw(ramp)
        for yy in range(sp.height): rd.line([(0, yy), (sp.width, yy)], fill=int(255 * 0.6 * min(1.0, max(0.0, (yy - 286) / 16.0))))
        sp = Image.composite(g, sp, ramp)
    ax, ay = info["anchorPx"]; tx, ty = info["anchorTownTile"]
    return (grade_sprite(sp, stage) if graded else sp), (round(tx * PPT - ax), round(ty * PPT + SHIFT - ay))

def make(stage, variant, passes):
    town = shifted(os.path.join(passes, f"{stage}-{'day' if variant == 'day' else 'night'}.png"))
    sky = sky_far(stage, variant); sky.alpha_composite(town); out = sky
    ta = np.asarray(town.getchannel("A")).astype(np.float32) / 255; spm = None
    if variant == "day":      # the dojo sprite goes in BEFORE the light pass so the whole picture is graded as one
        sp, pos = sprite(stage, "day", graded=False)
        spa = Image.new("RGBA", (W, H), (0, 0, 0, 0)); spa.alpha_composite(sp, pos)
        out.alpha_composite(spa); spm = np.asarray(spa.getchannel("A")).astype(np.float32) / 255; ta = np.maximum(ta, spm)
    rgb = np.asarray(out.convert("RGB")).astype(np.float32) / 255
    rgb = lighting(rgb, stage, variant, passes, ta, spm)
    im = Image.fromarray((rgb * 255 + 0.5).astype(np.uint8), "RGB")
    if variant == "dusk":
        im = dusk(stage, im, shifted_mask(os.path.join(passes, f"{stage}-lights.png")))
        sp, pos = sprite(stage, "dusk"); o = im.convert("RGBA"); o.alpha_composite(sp, pos); return o.convert("RGB")
    return day_effects(im, stage)

PLAN = [  # order, belt, status, one line of what the picture shows
    (1, "white", "built", "A little run down: faded, grey and overcast, a boarded window, a patched awning and bridge plank, weedy empty beds, murky water, EMPTY plinth. Still friendly."),
    (2, "yellow", "planned", "NOT BUILT: the clean-up step - boards come off, fresh paint, colour comes back, first blooms. Until it is built use the White picture."),
    (3, "orange", "planned", "NOT BUILT: the shop opens - chimney, warm lanterns, bread, a fuller town. Until it is built use the White picture."),
    (4, "green", "built", "Clearly upgraded: fresh paint and a vivid colour grade, the STATUE unveiled with two stone lanterns, lush flower beds, bunting across the river, a roof flag, window boxes, blossoming hedges, bridge garland, soft cast shadows."),
    (5, "blue", "built", "FULLY MAXED hero town (the last town picture): golden-hour grade, five cherry-blossom trees, four stone lanterns, two tall banners, two roof flags, golden paving ring, lotus and more koi, chimney smoke, sun shafts, petals, bloom on the statue and lanterns.")]
USE_BLUE = ["red", "redblack", "brown", "brownblack", "black"]
FALLBACK = {"yellow": "white", "orange": "white"}

def write_manifest():
    out = {"note": "Town growth is CAPPED at Blue. One FULL town background per belt, day + dusk, dojo sprite already in. Swap the whole picture by the student's highest earned belt. Nothing stacks. Red, Red/Black, Brown, Brown/Black and Black have NO town pictures of their own: they use the Blue picture.",
           "sizePx2x": [W, H], "sizePx1x": [W // 2, H // 2], "tilePx2x": PPT, "stages": []}
    for order, belt, status, notes in PLAN:
        e = {"order": order, "belt": belt, "built": status == "built", "statue": belt in ("green", "blue"), "notes": notes}
        if status == "built": e["files"] = {v: {"2x": f"{order}-{belt}-{v}@2x.png", "1x": f"{order}-{belt}-{v}.png"} for v in ("day", "dusk")}
        else: e["useUntilBuilt"] = FALLBACK[belt]
        out["stages"].append(e)
    for i, belt in enumerate(USE_BLUE):
        out["stages"].append({"order": 6 + i, "belt": belt, "built": False, "useStage": "blue", "statue": True,
                              "notes": "USE BLUE: no town picture of its own. Show the Blue picture (5-blue-*). No town art changes from Red up."})
    json.dump(out, open(os.path.join(OUT, "stages", "stages.json"), "w"), indent=2); open(os.path.join(OUT, "stages", "stages.json"), "a").write("\n")

if __name__ == "__main__":
    passes = sys.argv[1]; which = sys.argv[2:] or ["white", "green", "blue"]
    os.makedirs(os.path.join(OUT, "stages"), exist_ok=True)
    for st in which:
        order, belt = STAGES[st]
        for v in ("day", "dusk"):
            im = make(st, v, passes); name = f"{order}-{belt}-{v}"; d = os.path.join(OUT, "stages")
            im.save(os.path.join(d, name + "@2x.png")); im.resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(d, name + ".png")); print("ok", name)
    write_manifest()
