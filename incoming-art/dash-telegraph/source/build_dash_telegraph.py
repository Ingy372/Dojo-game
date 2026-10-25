"""
Dojo Ascent - dash-only telegraph art (A-BEST 2, Art Director bot).
Purple-and-white diagonal floor stripes in three shapes (lane, arc, ring with a gap) + the '!!' mark.
Rules (drafts/content/enemies/bestiary-plan.md, 'Dash-only attacks'): stripes on the floor, lane / arc / ring
with a gap, never a circle, never red, '!!' above the enemy; Echo Bell's ring gap glows.

    python3 incoming-art/dash-telegraph/source/build_dash_telegraph.py      (from the repo root)
Writes sprites/ and preview/. Needs Python 3 with Pillow and numpy. Everything is drawn top-down (the game
draws the red circles as true circles, so the floor is not squashed).
"""
import math, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
ROOT = "incoming-art"; OUT = os.path.join(ROOT, "dash-telegraph")
SP, PV = os.path.join(OUT, "sprites"), os.path.join(OUT, "preview")
PX = 96                    # sprite px per tile (2x the game's TILE = 48); scale 0.5 for TILE 48
SS = 4                     # supersampling
PURPLE, WHITE, DEEP = (138, 79, 230), (246, 242, 255), (74, 36, 150)
PERIOD = 0.5               # one purple + one white band, in tiles, along the diagonal
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def stripes(w, h, phase=0.0, ss=1):
    """purple/white 45-degree stripes, RGBA, seamless: period in px divides the tile so it tiles."""
    y, x = np.mgrid[0:h, 0:w].astype(float) / (PX * ss)
    t = ((x + y) / (PERIOD * math.sqrt(2)) * math.sqrt(2) / 2 + phase) % 1.0   # 0..1 across one period
    # soft-edged bands (anti-aliased by supersampling)
    white = (t >= 0.5)
    a = np.zeros((h, w, 4), np.uint8)
    a[..., :3] = np.where(white[..., None], WHITE, PURPLE); a[..., 3] = 255
    return Image.fromarray(a, "RGBA")

def shape_mask(kind, size, ss, **k):
    W, H = int(size[0] * PX), int(size[1] * PX); m = Image.new("L", (W * ss, H * ss), 0); d = ImageDraw.Draw(m); s = PX * ss
    if kind == "lane":          # k: length, width (tiles); rounded ends
        L, Wd = k["length"], k["width"]; pad = (W * ss - L * s) / 2, (H * ss - Wd * s) / 2
        d.rounded_rectangle([pad[0], pad[1], pad[0] + L * s, pad[1] + Wd * s], radius=Wd * s * 0.25, fill=255)
    else:                       # arc / ring: annulus sector. k: r (outer), band (thickness), sweep or gap (deg)
        cx, cy = W * ss / 2, H * ss / 2; R, r = k["r"] * s, (k["r"] - k["band"]) * s
        if kind == "arc":
            a0, a1 = -90 - k["sweep"] / 2, -90 + k["sweep"] / 2       # opens toward screen-up (enemy faces N)
        else:
            a0, a1 = 90 + k["gap"] / 2, 90 - k["gap"] / 2 + 360        # gap at the bottom (S)
        d.pieslice([cx - R, cy - R, cx + R, cy + R], a0, a1, fill=255)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=0)
        if True:   # round the ends a little so nothing looks sharp
            m = m.filter(ImageFilter.GaussianBlur(PX * ss * 0.07)).point(lambda v: 255 if v > 128 else 0)
    return m

def build(kind, size, **k):
    """returns dict of layers at 1x (PX px/tile): fill (stripes), edge (white rim + deep-purple outline), glow."""
    ss = SS; m = shape_mask(kind, size, ss, **k); Wb, Hb = m.size
    fill = stripes(Wb, Hb, ss=ss); fa = np.array(m) / 255.0
    f = np.array(fill).astype(float); f[..., 3] = 255 * fa * 0.85
    # edge: a white inner rim and a deep purple outline, ~0.05 tile
    e_px = int(0.05 * PX * ss)
    grow = m.filter(ImageFilter.MaxFilter(2 * (e_px // 2) + 1)); shrink = m.filter(ImageFilter.MinFilter(2 * e_px + 1))
    outer = (np.array(grow) - np.array(m)).clip(0, 255) / 255.0
    inner = (np.array(m).astype(int) - np.array(shrink)).clip(0, 255) / 255.0
    e = np.zeros((Hb, Wb, 4)); e[..., :3] = DEEP; e[..., 3] = 255 * outer
    wi = inner > 0; e[wi, :3] = WHITE; e[..., 3] = np.maximum(e[..., 3], 255 * inner)
    # glow: soft purple halo outside the shape (always under fill)
    gl = np.array(grow.filter(ImageFilter.GaussianBlur(PX * ss * 0.08))) / 255.0
    g = np.zeros((Hb, Wb, 4)); g[..., :3] = PURPLE; g[..., 3] = 160 * gl * (1 - fa)
    layers = {"glow": g, "fill": f, "edge": e}
    if kind == "ring":          # the gap glows white so you can see where to dash through
        cx, cy = Wb / 2, Hb / 2; R = k["r"] * PX * ss; band = k["band"] * PX * ss
        gm = Image.new("L", (Wb, Hb), 0); d = ImageDraw.Draw(gm); gx, gy = cx, cy + R - band / 2
        d.ellipse([gx - band, gy - band * 0.8, gx + band, gy + band * 0.8], fill=255)
        gm = gm.filter(ImageFilter.GaussianBlur(band * 0.45))
        ga = np.array(gm) / 255.0 * (1 - fa)
        h = np.zeros((Hb, Wb, 4)); h[..., :3] = WHITE; h[..., 3] = 230 * ga; layers["gap"] = h
    out = {}
    for n, a in layers.items():
        im = Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGBA")
        out[n] = im.resize((Wb // ss, Hb // ss), Image.LANCZOS)
    return out

def bang(h_px):
    """'!!' mark: two rounded purple bars + dots, white outline (the red circle uses one '!')."""
    ss = SS; H = h_px * ss; W = int(H * 0.9); im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    bw = H * 0.2; ol = H * 0.06
    for cx in (W * 0.3, W * 0.7):
        for c, grow in ((WHITE, ol), (PURPLE, 0)):
            d.rounded_rectangle([cx - bw / 2 - grow, H * 0.06 - grow, cx + bw / 2 + grow, H * 0.66 + grow], radius=bw / 2 + grow, fill=c + (255,))
            d.ellipse([cx - bw / 2 - grow, H * 0.76 - grow, cx + bw / 2 + grow, H * 0.76 + bw + grow], fill=c + (255,))
    return im.resize((W // ss, H // ss), Image.LANCZOS)

SHAPES = {   # default pre-baked sizes (tiles); used by the plan's enemies
    "lane":  dict(kind="lane", size=(6, 2), length=5, width=1.0),                  # Sleepy Sentry / Rolling Pin / Boulder Roller
    "arc":   dict(kind="arc", size=(6, 6), r=2.6, band=1.0, sweep=120),            # Vine Sweeper / Forge Sweeper 120
    "arc180": dict(kind="arc", size=(6, 6), r=2.6, band=1.0, sweep=180),           # Forge Sweeper at F5
    "ring":  dict(kind="ring", size=(8, 8), r=3.0, band=0.8, gap=40),              # Echo Bell
}

def main():
    os.makedirs(SP, exist_ok=True); os.makedirs(PV, exist_ok=True)
    built = {}
    for name, p in SHAPES.items():
        p = dict(p); kind = p.pop("kind"); size = p.pop("size")
        built[name] = build(kind, size, **p)
        for ln, im in built[name].items(): im.save(os.path.join(SP, f"dash-{name}_{ln}.png"))
    # tileable stripe swatch: exactly 1 tile, 2 periods -> seamless both ways and when scrolled
    stripes(PX, PX).save(os.path.join(SP, "dash-stripe-tile.png"))
    bang(64).save(os.path.join(SP, "dash-bang.png"))
    return built

if __name__ == "__main__":
    main(); print("sprites written to", SP)
