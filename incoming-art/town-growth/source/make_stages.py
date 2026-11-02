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
sys.path.insert(0, HERE); import blue_extras as BX
PPT = 80; SHIFT = int(0.95 * PPT); W, H = 1864, 860; FS = 0.92
STAGES = {"white": (1, "white"), "green": (4, "green"), "blue": (5, "blue")}   # order, belt
CFG = {
    "whitesmog": dict(shadow=0.38, scol=(0.80, 0.84, 0.92), rim=0.14, rimc=(236, 236, 226), warm=(1.0, 0.99, 0.96), sat=0.74, con=0.94, expo=1.0,
                  stint=(0.97, 0.97, 0.92), htint=(1.0, 0.99, 0.96), lift=0.08, vig=0.16, bloom=0.0, blot=0.05, glow=0.0),
    "white": dict(shadow=0.52, scol=(0.74, 0.80, 0.95), rim=0.22, rimc=(240, 238, 226), warm=(1.02, 1.0, 0.96), sat=0.94, con=1.02, expo=1.0,
                  stint=(0.96, 0.96, 0.98), htint=(1.02, 1.0, 0.97), lift=0.0, vig=0.08, bloom=0.0, blot=0.04, glow=0.0),
    "green": dict(shadow=0.70, scol=(0.66, 0.75, 1.0), rim=0.36, rimc=(255, 244, 214), warm=(1.05, 1.02, 0.95), sat=1.18, con=1.11, expo=0.98,
                  stint=(0.92, 0.95, 1.04), htint=(1.04, 1.02, 0.97), lift=0.0, vig=0.07, bloom=0.10, blot=0.03, glow=0.0),
    "blue": dict(shadow=0.74, scol=(0.64, 0.68, 0.98), rim=0.52, rimc=(255, 226, 160), warm=(1.06, 1.01, 0.90), sat=1.26, con=1.15, expo=0.96,
                 stint=(0.90, 0.91, 1.05), htint=(1.07, 1.02, 0.92), lift=0.0, vig=0.11, bloom=0.30, blot=0.03, glow=0.09)}

# ------------------------------------------------------------------ sky
HILL_BLOSSOMS = ((330, 0.62), (640, 0.55), (790, 0.66), (1290, 0.6), (1400, 0.54), (1600, 0.6))      # (x at @2x, size) - the ridge height is read from the far-hill layer
def blossom_far(sky, x, y, sz, variant, haze):
    """one tiny distant blossom tree: thin brown trunk, three soft pink lumps, no outline, mixed toward the haze so it recedes"""
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay); u = sz * 40
    tr, pk, hi = ((140, 100, 84), (246, 190, 212), (252, 218, 232)) if variant == "day" else ((92, 66, 70), (214, 134, 170), (232, 168, 196))
    d.line([(x, y), (x, y - 0.9 * u)], fill=tr + (255,), width=max(3, int(0.17 * u)))
    for ox, oy, rx, ry, c in ((-0.55, -1.15, 0.62, 0.5, pk), (0.5, -1.2, 0.58, 0.48, pk), (0.0, -1.6, 0.7, 0.58, pk), (-0.1, -1.75, 0.38, 0.3, hi)):
        d.ellipse((x + (ox - rx) * u, y + (oy - ry) * u, x + (ox + rx) * u, y + (oy + ry) * u), fill=c + (255,))
    r_, g_, b_, a_ = lay.split(); rgb = Image.blend(Image.merge("RGB", (r_, g_, b_)), Image.new("RGB", (W, H), haze), 0.22)
    lay = Image.merge("RGBA", (*rgb.split(), a_)); sky.alpha_composite(lay)

def sky_far(stage, variant):     # 'stage' here is the STYLE: white (clear air), whitesmog (the smoggy look that the smog layer is fitted to), green, blue
    if variant == "day":
        SK = {"whitesmog": [(176, 192, 205), (224, 229, 231)], "white": [(124, 178, 232), (226, 242, 252)], "green": [(112, 186, 246), (226, 245, 255)],
              "blue": [(112, 168, 236), (255, 228, 186)]}[stage]
        HAZE = {"whitesmog": (204, 212, 218), "white": (214, 230, 242), "green": (212, 236, 252), "blue": (255, 232, 200)}[stage]
    else:
        SK = [(38, 40, 92), (214, 132, 120)]; HAZE = (120, 100, 150)
    sky = Image.new("RGBA", (W, H)); top, bot = SK
    for y in range(H):
        t = min(1.0, y / (H * 0.32)); sky.paste(tuple(int(a + (b - a) * t) for a, b in zip(top, bot)) + (255,), (0, y, W, y + 1))
    if variant == "day":     # soft painted clouds (behind the far hills): grey bank in White, white puffs in Green, warm-lit puffs in Blue
        random.seed(3)
        for cx, cy, sc in ((300, 64, 1.0), (760, 104, 0.8), (1500, 70, 0.9), (1760, 112, 0.7)):
            for layer, col, dy in (("sh", {"whitesmog": (170, 180, 190), "white": (196, 214, 236), "green": (186, 210, 238), "blue": (255, 196, 160)}[stage], 7),
                                   ("hi", {"whitesmog": (206, 211, 216), "white": (250, 252, 255), "green": (255, 255, 255), "blue": (255, 246, 232)}[stage], 0)):
                cl = Image.new("RGBA", (W, H), (0, 0, 0, 0)); cd = ImageDraw.Draw(cl)
                for ox, oy, rx, ry in ((-70, 8, 60, 22), (-20, -6, 70, 34), (40, -2, 64, 30), (86, 10, 52, 20), (0, 14, 120, 16)):
                    x, y = cx + ox * sc, cy + oy * sc + dy
                    cd.ellipse((x - rx * sc, y - ry * sc, x + rx * sc, y + ry * sc), fill=col + (235 if stage != "whitesmog" else 170,))
                sky.alpha_composite(cl.filter(ImageFilter.GaussianBlur(2.2)))
    far = Image.open(os.path.join(TS, "render_far@2x.png")).convert("RGBA")
    far = far.resize((int(far.width * FS), int(far.height * FS)), Image.LANCZOS)
    r, g, b, a = far.split(); far = Image.merge("RGBA", (*Image.blend(Image.merge("RGB", (r, g, b)), Image.new("RGB", far.size, HAZE), 0.18).split(), a))
    dx = int(14.2 * PPT - far.width / 2)
    col = far.crop((far.width // 2 - 2, 0, far.width // 2 + 2, far.height)).getbbox(); dy = int(0.3 * PPT) - col[1]
    layer = Image.new("RGBA", (W, H)); layer.paste(far, (dx, dy), far); sky.alpha_composite(layer)
    if stage == "blue":       # v5: a few more small blossom trees far away on the hills (hazy, so they sit far behind the sakura in the town)
        al = np.asarray(layer.getchannel("A"))
        for hx, sz in HILL_BLOSSOMS:
            col = np.where(al[:, hx] > 200)[0]; hy = int(col[0]) + int(0.42 * PPT)
            blossom_far(sky, hx, hy, sz, variant, HAZE)
    if variant == "day" and not stage.startswith("white"):
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
def tree_shadows(tmask, ground):
    """soft contact + canopy shadow for each sakura: an oval on the paving, pushed a little to the lower right (the sun is upper left), held out of the tree itself"""
    m = Image.new("L", (W, H)); d = ImageDraw.Draw(m)
    for (c, r), sc in SAKURA_TREES:
        x, y = c * PPT + 0.30 * sc * PPT, r * PPT + SHIFT + 0.02 * PPT
        d.ellipse((x - 1.15 * sc * PPT, y - 0.34 * sc * PPT, x + 1.15 * sc * PPT, y + 0.36 * sc * PPT), fill=255)
        d.ellipse((x - 0.62 * sc * PPT, y - 0.22 * sc * PPT, x + 0.62 * sc * PPT, y + 0.26 * sc * PPT), fill=255)
    sh = gaussian_filter(np.asarray(m).astype(np.float32) / 255, 0.24 * PPT) * 0.62
    return np.clip(sh * (1 - np.clip(gaussian_filter(tmask, 1.0) * 1.6, 0, 1)) * ground, 0, 1)

def lighting(rgb, stage, variant, passes, town_alpha, spmask=None, style=None):
    """rgb: float (H,W,3) 0..1. Adds the cast shadows, warm light, rim line, hero bloom, stage grade, vignette and painterly blotches."""
    c = CFG[style or stage]; dusk = variant == "dusk"; ks = 0.5 if dusk else 1.0
    a = town_alpha > 0.5
    sh = shifted_f(os.path.join(passes, f"{stage}-shade.png"))[..., :3]; z = shifted_f(os.path.join(passes, f"{stage}-height.png")) / 0.16 - 0.1
    L = lin(sh.mean(-1)); flat = a & (z < 0.1) & (L > 0.01)
    hi = np.percentile(L[flat], 92); lo = hi * 0.2 / 0.82
    s = np.clip((hi - L) / (hi - lo), 0, 1) * a
    s = gaussian_filter(s, 1.4)
    keep = 1 - (spmask if spmask is not None else 0)     # the dojo sprite is finished art: no cast shadow / rim from the hedge geometry hidden behind it
    s = s * keep
    tpath = os.path.join(passes, f"{stage}-trees.png")
    if stage == "blue" and os.path.exists(tpath):      # v5: a soft ground shadow under EVERY sakura (on top of the cast shadow), so each tree sits on the paving
        s = np.maximum(s, tree_shadows(shifted_f(tpath)[..., 3], a))
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

def grade_sprite(im, stage):      # stage = the STYLE key of CFG
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

def soft_light(out, x, y, rx, ry, col, strength, blur):
    """a warm pool / halo: a soft ellipse of colour blended over the picture"""
    m = Image.new("L", (W, H)); ImageDraw.Draw(m).ellipse((x - rx, y - ry, x + rx, y + ry), fill=255)
    return Image.composite(fill(col), out, m.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * strength)))

def blue_warm_sources(out):
    """warm light that comes ONLY from the fire bowl's flames/coals and from the two paper lanterns (their bodies are in the 'lights' pass)"""
    fx, fy = BX.scr(*BX.FIRE, 0.0); fz = BX.scr(*BX.FIRE, BX.FIRE_FLAME_Z)
    out = soft_light(out, fx, fy + 6, 1.45 * PPT, 0.62 * PPT, (255, 170, 80), 0.46, 0.35 * PPT)       # warm pool on the paving round the bowl
    out = soft_light(out, fz[0], fz[1], 0.62 * PPT, 0.62 * PPT, (255, 196, 110), 0.40, 0.30 * PPT)     # halo round the flames
    out = soft_light(out, fz[0], fz[1] + 8, 0.2 * PPT, 0.3 * PPT, (255, 226, 150), 0.55, 0.12 * PPT)   # the bright heart of the fire
    for (lc, lr, lz), R in zip(BX.LANTERNS, BX.LANTERN_R):
        lx, ly = BX.scr(lc, lr, lz)
        out = soft_light(out, lx, ly, 1.0 * R * PPT * 2.6, 1.0 * R * PPT * 2.6, (255, 200, 120), 0.50, R * PPT * 1.2)       # paper-lantern halo
    random.seed(17); sp = Image.new("L", (W, H)); sd = ImageDraw.Draw(sp)           # a few tiny embers rising from the fire (stay close to the bowl)
    for k in range(5):
        x = fz[0] + random.uniform(-0.22, 0.22) * PPT; y = fz[1] - random.uniform(0.35, 0.75) * PPT
        sd.ellipse((x - 2, y - 2, x + 2, y + 2), fill=255)
    out = Image.composite(fill((255, 206, 120)), out, sp.filter(ImageFilter.GaussianBlur(0.8)))
    return out

def sakura_dusk(out, lights, passes):
    """v5 dusk look of the sakura: the pink is graded to the dusk palette (cooler, deeper rose) and the sides that FACE a real warm source
    (the paper lanterns, the fire bowl, the lamp posts - taken from the 'lights' pass) get a thin warm rim."""
    from scipy.ndimage import map_coordinates
    T = shifted_f(os.path.join(passes, "blue-trees.png"))[..., 3]; Bm = shifted_f(os.path.join(passes, "blue-bloom.png"))[..., 3]
    x = np.asarray(out).astype(np.float32) / 255
    bm = gaussian_filter(Bm, 0.8)[..., None]
    lum = (x @ np.array([0.299, 0.587, 0.114], np.float32))[..., None]
    rose = lum * 1.18 + (x - lum * 1.0) * 1.08                                           # a little more colour ...
    rose = rose * np.array((1.08, 0.86, 1.10), np.float32)                  # ... pushed cooler and deeper: less red/yellow, a touch more blue (rose-violet, never red)
    x = x * (1 - bm * 0.85) + rose * bm * 0.85
    # warm rim: light field = the blurred 'lights' mask; its gradient points to the nearest source
    Lm = np.asarray(lights).astype(np.float32) / 255
    Lf = gaussian_filter(Lm, 1.1 * PPT) * 40.0
    gy, gx = np.gradient(gaussian_filter(Lm, 1.3 * PPT)); nrm = np.hypot(gx, gy) + 1e-9; dx_, dy_ = gx / nrm, gy / nrm
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    T1 = gaussian_filter(T, 0.7); step = 6.0
    Tn = map_coordinates(T1, [yy + dy_ * step, xx + dx_ * step], order=1, mode="nearest")      # the neighbour toward the light
    edge = np.clip(T1 - Tn, 0, 1) * (T1 > 0.5)
    rim = gaussian_filter(edge, 1.0) * np.clip(Lf, 0, 1) * (lum[..., 0] > 0.10)
    rim = np.clip(rim * 2.2, 0, 1)[..., None]
    x = x * (1 - rim * 0.8) + np.array((1.0, 0.72, 0.42), np.float32) * rim * 0.8
    return Image.fromarray((np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8), "RGB")

def dusk(stage, bg_lit, lights, passes=None):
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
    if stage == "blue":    # Blue: the cosy corner (fire bowl + two paper lanterns, each lit by a real source), then the fireflies
        out = blue_warm_sources(out)
        if passes: out = sakura_dusk(out, lights, passes)
        random.seed(5); ff = Image.new("L", (W, H)); fd = ImageDraw.Draw(ff); core = Image.new("L", (W, H)); cd = ImageDraw.Draw(core)
        for c, rr in BX.FIREFLIES:      # 12 (v3 had 6); rows keep clear of the walking-lane band
            x = c * PPT + random.uniform(-10, 10); y = rr * PPT + SHIFT - 0.4 * PPT; rad = random.uniform(0.038, 0.05) * PPT
            assert not 444 <= y <= 540, (c, rr, y)
            fd.ellipse((x - 3 * rad, y - 3 * rad, x + 3 * rad, y + 3 * rad), fill=70); cd.ellipse((x - rad, y - rad, x + rad, y + rad), fill=190)
        ff = ff.filter(ImageFilter.GaussianBlur(int(0.12 * PPT)))
        out = Image.composite(fill((236, 255, 160)), out, ff.point(lambda v: int(v * 0.6)))
        out = Image.composite(fill((250, 255, 215)), out, core.filter(ImageFilter.GaussianBlur(1)))
    return out

SAKURA_TREES = tuple((cr, v[0]) for cr, v in BX.SAKURA.items())       # (col, row), scale: ONE list shared with the Blender build
def petal_layer(seed=21):
    """Blue: sakura petals. A soft carpet under each tree, petals FALLING from each crown (slanting, a few with a faint motion streak) and a few
    drifting ones. Everything is kept out of the walking-lane band (y 444-540); the falling ones start from the crown's underside."""
    rnd = random.Random(seed); lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    PINK = ((250, 196, 214), (255, 226, 236), (240, 164, 196), (255, 240, 246))
    def petal(x, y, s, ang, col, al, stretch=1.0):
        p = Image.new("RGBA", (56, 56), (0, 0, 0, 0)); pd = ImageDraw.Draw(p); pd.ellipse((28 - s * stretch, 28 - s * 0.55, 28 + s * stretch, 28 + s * 0.55), fill=col + (al,))
        p = p.rotate(ang, resample=Image.BICUBIC); lay.alpha_composite(p, (int(x) - 28, int(y) - 28))
    for (c, r), sc in SAKURA_TREES:
        gy = r * PPT + SHIFT
        for _ in range(12):                       # fallen petals on the ground round the tree ring (and a couple on the soil inside it)
            ang = rnd.uniform(0, 2 * math.pi); rad = rnd.choice((rnd.uniform(0.2, 0.42), rnd.uniform(0.62, 1.25), rnd.uniform(0.62, 1.25))) * sc
            x = c * PPT + math.cos(ang) * rad * PPT; y = gy + 4 + math.sin(ang) * rad * PPT * 0.42
            if 444 <= y <= 540: continue
            petal(x, y, rnd.uniform(4.5, 7), rnd.uniform(0, 180), rnd.choice(PINK), 235)
        for k in range(5):                        # falling from the crown: x drifts to the right as they fall (a light breeze)
            y0 = gy - rnd.uniform(0.1, 0.9) * PPT * 0.82 * sc; y = y0 + rnd.uniform(0.15, 0.75) * PPT * sc
            x = c * PPT + rnd.uniform(-95, 95) * sc + (y - y0) * 0.35
            if 430 <= y <= 552: continue
            petal(x, y, rnd.uniform(4, 6.2), rnd.uniform(0, 180), rnd.choice(PINK), 235, stretch=rnd.choice((1.0, 1.0, 1.9)))
    for _ in range(9):                            # drifting: well above the lane band, in the lawn/hedge zone
        (c, r), sc = rnd.choice(SAKURA_TREES); x = c * PPT + rnd.uniform(-110, 110); y = rnd.uniform(250, 425)
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

def sprite(stage, variant, graded=True, style=None):
    info = json.load(open(os.path.join(AZ, "sprites", "static.json")))["sprites"]["town-slot-dojo"]
    sp = Image.open(os.path.join(AZ, "sprites", info["files"][variant])).convert("RGBA")
    if variant == "dusk":    # the sprite's own warm ground pools under the door are turned down like the rest of the dusk light
        dayspr = Image.open(os.path.join(AZ, "sprites", info["files"]["day"])).convert("RGBA")
        g = ImageChops.multiply(dayspr.convert("RGB"), Image.new("RGB", dayspr.size, (120, 112, 165))); g.putalpha(dayspr.getchannel("A"))
        ramp = Image.new("L", sp.size, 0); rd = ImageDraw.Draw(ramp)
        for yy in range(sp.height): rd.line([(0, yy), (sp.width, yy)], fill=int(255 * 0.6 * min(1.0, max(0.0, (yy - 286) / 16.0))))
        sp = Image.composite(g, sp, ramp)
    ax, ay = info["anchorPx"]; tx, ty = info["anchorTownTile"]
    return (grade_sprite(sp, style or stage) if graded else sp), (round(tx * PPT - ax), round(ty * PPT + SHIFT - ay))

def make(stage, variant, passes, style=None):
    style = style or stage        # style 'whitesmog' = the v3 smoggy White look (only used to fit the smog layer)
    town = shifted(os.path.join(passes, f"{stage}-{'day' if variant == 'day' else 'night'}.png"))
    sky = sky_far(style, variant); sky.alpha_composite(town); out = sky
    ta = np.asarray(town.getchannel("A")).astype(np.float32) / 255; spm = None
    if variant == "day":      # the dojo sprite goes in BEFORE the light pass so the whole picture is graded as one
        sp, pos = sprite(stage, "day", graded=False)
        spa = Image.new("RGBA", (W, H), (0, 0, 0, 0)); spa.alpha_composite(sp, pos)
        out.alpha_composite(spa); spm = np.asarray(spa.getchannel("A")).astype(np.float32) / 255; ta = np.maximum(ta, spm)
    rgb = np.asarray(out.convert("RGB")).astype(np.float32) / 255
    rgb = lighting(rgb, stage, variant, passes, ta, spm, style)
    im = Image.fromarray((rgb * 255 + 0.5).astype(np.uint8), "RGB")
    if variant == "dusk":
        if stage == "blue": o_ = im.convert("RGBA"); o_.alpha_composite(petal_layer()); im = o_.convert("RGB")      # petals fall at dusk too (they get the dusk grade)
        im = dusk(stage, im, shifted_mask(os.path.join(passes, f"{stage}-lights.png")), passes)
        sp, pos = sprite(stage, "dusk", style=style); o = im.convert("RGBA"); o.alpha_composite(sp, pos); return o.convert("RGB")
    return day_effects(im, stage)

# ------------------------------------------------------------------ the White SMOG layer (v4)
def fit_smog(B, T, small=75, big=301, lam=0.02, sigma=14.0):
    """Fit a soft translucent layer (colour C, alpha a) so that  B*(1-a) + a*C  ~ T  (T = the smoggy v3 White look, B = the same town with clear air).
    D = T - B = a*(C - B): per pixel a is the (negative) slope of D against B inside a local window; k = a*C is the intercept. Both fields are then smoothed,
    so the layer is a pure soft haze (no town detail baked in)."""
    from scipy.ndimage import uniform_filter
    D = T - B
    def stats(size):
        mB = np.stack([uniform_filter(B[..., c], size, mode="reflect") for c in range(3)], -1); mD = np.stack([uniform_filter(D[..., c], size, mode="reflect") for c in range(3)], -1)
        vB = sum(uniform_filter(B[..., c] ** 2, size, mode="reflect") - mB[..., c] ** 2 for c in range(3))
        cv = sum(uniform_filter(D[..., c] * B[..., c], size, mode="reflect") - mD[..., c] * mB[..., c] for c in range(3))
        return mB, mD, vB, cv
    _, _, vb, cb = stats(big); a_big = np.clip(-cb / (vb + 1e-6), 0, 0.9)
    mB, mD, vB, cv = stats(small); a = np.clip((-cv + lam * a_big) / (vB + lam), 0, 0.9)
    k = mD + a[..., None] * mB
    a_s = gaussian_filter(a, sigma); k_s = np.stack([gaussian_filter(k[..., c], sigma) for c in range(3)], -1)
    return np.clip(a_s, 0, 0.9), np.clip(k_s, 0, None)

def smog_layers(passes):
    """returns {variant: (alpha (H,W), premultiplied colour k (H,W,3), clear-base rgb, smoggy-look rgb)} for White day and dusk"""
    out = {}
    for v in ("day", "dusk"):
        B = np.asarray(make("white", v, passes)).astype(np.float32) / 255; T = np.asarray(make("white", v, passes, style="whitesmog")).astype(np.float32) / 255
        a, k = fit_smog(B, T); out[v] = (a, k, B, T)
    return out

def smog_png(a, k):
    """straight-alpha RGBA: colour = k / a, alpha = a (so  base*(1-a) + a*colour  is the smoggy picture)"""
    col = np.clip(k / np.maximum(a, 1e-3)[..., None], 0, 1); return Image.fromarray((np.dstack([col, a[..., None]]) * 255 + 0.5).astype(np.uint8), "RGBA")

PLAN = [  # order, belt, status, one line of what the picture shows
    (1, "white", "built", "A little run down: a boarded window, a patched awning and bridge plank, weedy empty beds, murky water, EMPTY plinth. This picture is the CLEAR-AIR base (blue sky, bright); the grey smog is the SEPARATE overlay 1-white-smog-* drawn on top while the White floor boss is unbeaten. After the boss the smog FADES OUT and this clear White picture is the town from then on. Still friendly."),
    (2, "yellow", "planned", "NOT BUILT: the clean-up step - boards come off, fresh paint, colour comes back, first blooms. Until it is built use the White picture."),
    (3, "orange", "planned", "NOT BUILT: the shop opens - chimney, warm lanterns, bread, a fuller town. Until it is built use the White picture."),
    (4, "green", "built", "Clearly upgraded: fresh paint and a vivid colour grade, the STATUE unveiled with two stone lanterns, lush flower beds, bunting across the river, a roof flag, window boxes, blossoming hedges, bridge garland, soft cast shadows."),
    (5, "blue", "built", "FULLY MAXED hero town (the last town picture): golden-hour grade, five SAKURA trees drawn with the SAME toon ramp and outline as the other trees (thick brown trunks, soft pink clumps), each in a stone tree ring with a soft ground shadow and fallen petals, all clear of the walking lane; the two bench corners are sakura too; a few distant blossom trees on the hills; four stone lanterns, two tall banners, two roof flags, golden paving ring, lotus and koi, chimney smoke, sun shafts, bloom on the statue and lanterns. Dusk grades the pink to deeper cooler rose with a warm rim on the sides facing the paper lanterns, fire bowl and lamp posts, plus 12 fireflies and falling petals.")]
USE_BLUE = ["red", "redblack", "brown", "brownblack", "black"]
FALLBACK = {"yellow": "white", "orange": "white"}

def write_manifest():
    out = {"note": "White is TWO layers: the clear background plus the separate smog overlay (it FADES OUT after the White floor boss is beaten; clear White is the after-boss look). All other belts are one picture, no overlay. Town growth is CAPPED at Blue. One FULL town background per belt, day + dusk, dojo sprite already in. Swap the whole picture by the student's highest earned belt. Nothing stacks. Red, Red/Black, Brown, Brown/Black and Black have NO town pictures of their own: they use the Blue picture.",
           "sizePx2x": [W, H], "sizePx1x": [W // 2, H // 2], "tilePx2x": PPT, "stages": []}
    for order, belt, status, notes in PLAN:
        e = {"order": order, "belt": belt, "built": status == "built", "statue": belt in ("green", "blue"), "notes": notes}
        if status == "built": e["files"] = {v: {"2x": f"{order}-{belt}-{v}@2x.png", "1x": f"{order}-{belt}-{v}.png"} for v in ("day", "dusk")}
        else: e["useUntilBuilt"] = FALLBACK[belt]
        if belt == "white":
            e["smogOverlay"] = {"files": {v: {"2x": f"1-white-smog-{v}@2x.png", "1x": f"1-white-smog-{v}.png"} for v in ("day", "dusk")}, "sizePx2x": [W, H],
                                "draw": "full-frame transparent PNG, same size as the background; draw it OVER the White background (same day/dusk variant) and UNDER characters, effects and UI",
                                "fadeOut": {"on": "White-belt floor boss defeated", "durationMs": 2500, "curve": "ease-out", "from": "overlay alpha 1.0", "to": "overlay alpha 0.0 (suggested duration - tune in game)"},
                                "remove": "after the White-belt floor boss the smog FADES OUT (see fadeOut), then stop drawing it: the clear White picture underneath (1-white-*) is the after-boss look and the town from then on. Never draw it on any other belt."}
        out["stages"].append(e)
    for i, belt in enumerate(USE_BLUE):
        out["stages"].append({"order": 6 + i, "belt": belt, "built": False, "useStage": "blue", "statue": True,
                              "notes": "USE BLUE: no town picture of its own. Show the Blue picture (5-blue-*). No town art changes from Red up."})
    json.dump(out, open(os.path.join(OUT, "stages", "stages.json"), "w"), indent=2); open(os.path.join(OUT, "stages", "stages.json"), "a").write("\n")

if __name__ == "__main__":
    passes = sys.argv[1]; which = sys.argv[2:] or ["white", "green", "blue"]
    d = os.path.join(OUT, "stages"); os.makedirs(d, exist_ok=True); pv = os.path.join(OUT, "previews"); os.makedirs(pv, exist_ok=True)
    def save2(im, name, folder=d):
        im.save(os.path.join(folder, name + "@2x.png")); im.resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(folder, name + ".png"))
    for st in which:
        order, belt = STAGES[st]
        if st == "white":      # clear base + the separate smog layer (fitted so base + layer ~ the v3 smoggy White)
            L = smog_layers(passes)
            for v, (a, k, B, T) in L.items():
                save2(Image.fromarray((B * 255 + 0.5).astype(np.uint8)), f"{order}-{belt}-{v}")
                lay = smog_png(a, k); lay.save(os.path.join(d, f"{order}-{belt}-smog-{v}@2x.png"))
                # 1x: downsample the PREMULTIPLIED colour (no dark fringes), then divide
                k1 = np.asarray(Image.fromarray(k.astype(np.float32)[..., 0]).resize((W // 2, H // 2), Image.BOX)); k1 = np.dstack([np.asarray(Image.fromarray(k[..., c].astype(np.float32)).resize((W // 2, H // 2), Image.BOX)) for c in range(3)])
                a1 = np.asarray(Image.fromarray(a.astype(np.float32)).resize((W // 2, H // 2), Image.BOX)); smog_png(a1, k1).save(os.path.join(d, f"{order}-{belt}-smog-{v}.png"))
                P = B * (1 - a[..., None]) + k; err = np.abs(P - T).mean() * 255
                Image.fromarray((P * 255 + 0.5).astype(np.uint8)).save(os.path.join(pv, f"{order}-{belt}-with-smog-{v}@2x.png"))
                Image.fromarray((P * 255 + 0.5).astype(np.uint8)).resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(pv, f"{order}-{belt}-with-smog-{v}.png"))
                print("ok", f"{order}-{belt}-{v} + smog layer; composite vs v3 look: mean abs err {err:.2f}/255")
            continue
        for v in ("day", "dusk"):
            im = make(st, v, passes); name = f"{order}-{belt}-{v}"; save2(im, name); print("ok", name)
    write_manifest()
