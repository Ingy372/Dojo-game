"""A-MENU2 full set builder (plan #259, mood A). Rebuild:  python3 incoming-art/menu2/source/build_menu2.py
Writes incoming-art/menu2/sprites/<group>/<name>.png + @2x and sprites/menu2.json (sizes, 9-slice, states, layers)."""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops
sys.path.insert(0, os.path.dirname(__file__))
from mat import *

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)              # incoming-art/menu2
ART = os.path.dirname(ROOT)               # incoming-art
OUT = os.path.join(ROOT, 'sprites')
MAN = {"about": "A-MENU2 full set, mood A. Made by source/build_menu2.py; do not edit by hand. Sizes are 1x px; every file has an @2x twin.",
       "sprites": {}}

RARITY = {"common": (216, 210, 196), "uncommon": (92, 214, 92), "rare": (78, 163, 255), "epic": (180, 108, 255)}


def save(group, name, img, w, h, **meta):
    d = os.path.join(OUT, group)
    os.makedirs(d, exist_ok=True)
    down(img, w, h).save(os.path.join(d, name + '.png'))
    down(img, w * 2, h * 2).save(os.path.join(d, name + '@2x.png'))
    meta = dict(size=[w, h], file=f"{group}/{name}.png", **meta)
    MAN["sprites"][name] = meta


# ======================= shared plates =======================
def plate_mask(w, h, m, r, dy=0):
    return rr(S(w), S(h), [S(m[0]), S(m[1] + dy), S(w - m[2]) - 1, S(h - m[3] + dy) - 1], S(r))


def wood_plate(img, mask, seed, base=WOOD_M, dark=WOOD_D, light=WOOD_L, gloss=1.0, vertical=False, shade=1.0):
    W, H = img.size
    tex(img, wood(W, H, seed, base, dark, light, vertical), mask)
    bevel(img, mask, d=1.6, soft=1.4, hi_a=0.5 * shade, lo_a=0.5 * shade)
    rim_light(img, mask, alpha=0.7 * gloss)
    bounce(img, mask, alpha=0.25)
    if gloss:
        lacquer(img, mask, top_a=0.22 * gloss, spec_a=0.35 * gloss)
    outline(img, mask, WOOD_DD, 0.9, 0.9)


def paper_face(img, mask, seed, base=PAPER, edge=PAPER_D, depth=1.0):
    W, H = img.size
    tex(img, paper(W, H, seed, base, edge), mask)
    inner_shadow(img, mask, dy=2.2, blur_px=2.2, alpha=0.38 * depth)
    bounce(img, mask, col=(255, 214, 150), alpha=0.18, h=6)


def framed(w, h, r, margin, seed, frame_w=6, state='normal', face='paper', rim_col=None, press=0, glow_col=None, wood_cols=None):
    """generic card: drop shadow + lacquered wood frame + recessed face."""
    img = canvas(w, h)
    dy = press
    m = plate_mask(w, h, margin, r, dy)
    if glow_col:
        glow(img, m, glow_col, min(4.0, margin[0] * 0.42), 0.95, grow=min(2, margin[0] * 0.2))
    drop_shadow(img, m, dy=2.2 - press * 0.8, blur_px=2.6 - press * 0.8, alpha=0.5 - press * 0.12)
    wc = wood_cols or (WOOD_M, WOOD_D, WOOD_L)
    wood_plate(img, m, seed, *wc)
    fm = margin
    inner = plate_mask(w, h, [fm[0] + frame_w, fm[1] + frame_w, fm[2] + frame_w, fm[3] + frame_w], max(2, r - frame_w * 0.6), dy)
    if face == 'paper':
        paper_face(img, inner, seed + 5)
    elif face == 'honey':
        W, H = img.size
        tex(img, rgrad(W, H, W / 2, H * 0.85, H * 0.9, HONEY_L, (212, 150, 80)), inner)
        tex(img, paper(W, H, seed + 5, (255, 255, 255), (230, 220, 200), vignette=0), inner, 0.18)
        inner_shadow(img, inner, 2.4, 2.4, 0.42)
        bounce(img, inner, col=(255, 236, 170), alpha=0.35, h=10)
    elif face == 'dim':
        paper_face(img, inner, seed + 5, (236, 224, 202), (214, 196, 164), depth=0.8)
    if rim_col:
        ring = msub(inner.filter(ImageFilter.MaxFilter(S(1.6) * 2 + 1)), inner)
        fill(img, rim_col, ring, 1.0)
        rim_light(img, ring, (255, 250, 220), 0.9, 0.6)
    if press:
        fill(img, SHADOW, m, 0.08)
    return img, m, inner


def shine_frames(mask, n=6, width=0.18, alpha=0.55):
    """diagonal light sweep masked to a plate, n frames, frame 0 = off left."""
    W, H = mask.size
    out = []
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    diag = (xx + yy * 0.55) / (W + H * 0.55)
    for i in range(n):
        c = -0.2 + 1.4 * i / (n - 1)
        band = np.clip(1 - np.abs(diag - c) / width, 0, 1) ** 2
        m = Image.fromarray((band * 255).astype(np.uint8))
        img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        fill(img, (255, 250, 225), mmul(m, mask), alpha)
        out.append(img)
    return out


def star4(d, cx, cy, r, col, thin=0.22):
    pts = []
    for k in range(8):
        a = k * math.pi / 4 - math.pi / 2
        rr_ = r if k % 2 == 0 else r * thin
        pts.append((cx + math.cos(a) * rr_, cy + math.sin(a) * rr_))
    d.polygon(pts, fill=col)


# ======================= A1 panel frame =======================
def panel_frame(seed=11):
    N, CR, M = 192, 48, 6
    W = H = S(N)
    img = canvas(N, N)
    outer = rr(W, H, [S(M), S(M), W - S(M) - 1, H - S(M) - 1], S(16))
    drop_shadow(img, outer, dy=3, blur_px=4, alpha=0.5)
    T = 14  # rail thickness
    inner_box = [S(M + T), S(M + T), W - S(M + T) - 1, H - S(M + T) - 1]
    face = rr(W, H, inner_box, S(6))
    railm = msub(outer, face)
    # mitred rails: top/bottom horizontal grain, sides vertical grain
    hz = wood(W, H, seed, WOOD_M, WOOD_D, WOOD_L)
    vt = wood(W, H, seed + 1, WOOD_M, WOOD_D, WOOD_L, vertical=True)
    tri = Image.new('L', (W, H), 0)
    dd = ImageDraw.Draw(tri)
    dd.polygon([(0, 0), (W, 0), (W / 2, H / 2)], fill=255)
    dd.polygon([(0, H), (W, H), (W / 2, H / 2)], fill=255)
    # true mitre at the corners: horizontal where |dy| > |dx| from the nearest corner diagonal
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dx = np.minimum(xx, W - 1 - xx)
    dy_ = np.minimum(yy, H - 1 - yy)
    hmask = Image.fromarray(((dy_ <= dx) * 255).astype(np.uint8))
    tex(img, hz, mmul(railm, hmask))
    tex(img, vt, mmul(railm, ImageChops.invert(hmask)))
    # mitre joint lines
    jl = Image.new('L', (W, H), 0)
    dj = ImageDraw.Draw(jl)
    for (ax, ay, bx, by) in [(M, M, M + T, M + T), (N - M, M, N - M - T, M + T), (M, N - M, M + T, N - M - T), (N - M, N - M, N - M - T, N - M - T)]:
        dj.line([(S(ax), S(ay)), (S(bx), S(by))], fill=255, width=S(0.6))
    fill(img, WOOD_DD, mmul(jl, railm), 0.55)
    bevel(img, railm, d=2.0, soft=1.8, hi_a=0.55, lo_a=0.55)
    rim_light(img, outer, alpha=0.75)
    lacquer(img, outer, top_a=0.16, band=0.12, spec_a=0.3)
    outline(img, outer, WOOD_DD, 1.0)
    # inner lip (thin honey bead between rail and paper)
    lip = msub(face.filter(ImageFilter.MaxFilter(S(2) * 2 + 1)), face)
    fill(img, HONEY, lip, 1.0)
    bevel(img, lip, d=0.6, soft=0.5, hi_a=0.6, lo_a=0.4)
    # paper face (low-frequency only so it stretches cleanly)
    tex(img, paper(W, H, seed + 3, PAPER, PAPER_D, fibres=False, vignette=0), face)
    inner_shadow(img, face, dy=3, blur_px=3.2, alpha=0.42)
    # brass corner brackets (inside the 48 px corners)
    br = Image.new('L', (W, H), 0)
    db = ImageDraw.Draw(br)
    L, t = 30, 9
    for sx, sy in [(1, 1), (-1, 1), (1, -1), (-1, -1)]:
        ox = S(M - 1) if sx > 0 else W - S(M - 1)
        oy = S(M - 1) if sy > 0 else H - S(M - 1)
        xa, xb = sorted([ox, ox + sx * S(L)])
        ya, yb = sorted([oy, oy + sy * S(t)])
        db.rounded_rectangle([xa, ya, xb, yb], S(3), fill=255)
        xa, xb = sorted([ox, ox + sx * S(t)])
        ya, yb = sorted([oy, oy + sy * S(L)])
        db.rounded_rectangle([xa, ya, xb, yb], S(3), fill=255)
    drop_shadow(img, br, dy=1, blur_px=1.2, alpha=0.5)
    tex(img, brass(W, H), br)
    # per-corner brass gradient so every corner gets a highlight
    for sx, sy in [(1, 1), (-1, 1), (1, -1), (-1, -1)]:
        cx = S(M + 6) if sx > 0 else W - S(M + 6)
        cy = S(M + 6) if sy > 0 else H - S(M + 6)
        g = rgrad(W, H, cx - S(3), cy - S(3), S(26), GOLD_L, GOLD_D)
        q = Image.new('L', (W, H), 0)
        ImageDraw.Draw(q).rectangle([min(cx, cx + sx * S(40)) - S(8), min(cy, cy + sy * S(40)) - S(8), max(cx, cx + sx * S(40)) + S(8), max(cy, cy + sy * S(40)) + S(8)], fill=255)
        tex(img, g, mmul(br, q), 0.8)
    bevel(img, br, d=0.9, soft=0.8, hi=(255, 250, 220), hi_a=0.85, lo_a=0.5)
    outline(img, br, GOLD_D, 0.7, 0.9)
    # rivets
    d = ImageDraw.Draw(img)
    for sx, sy in [(1, 1), (-1, 1), (1, -1), (-1, -1)]:
        for (px, py) in [(M + 4.5, M + 4.5), (M + 24, M + 4.5), (M + 4.5, M + 24)]:
            x = S(px) if sx > 0 else W - S(px)
            y = S(py) if sy > 0 else H - S(py)
            d.ellipse([x - S(2.2), y - S(2.2), x + S(2.2), y + S(2.2)], fill=C(GOLD_D))
            d.ellipse([x - S(1.7), y - S(1.9), x + S(1.5), y + S(1.3)], fill=C(GOLD))
            d.ellipse([x - S(1.0), y - S(1.3), x + S(0.1), y - S(0.2)], fill=C(GOLD_L))
    save('panel', 'panel-frame', img, N, N, nineSlice=[CR, CR, CR, CR], shadowMargin=M,
         note="A1. 9-slice, 48 px corners on all sides (brass brackets live in the corners). Top/bottom rails stretch along x; side rails stretch along y (their grain runs that way). Content area starts 22 px in (6 shadow + 14 rail + 2 lip).")
    # inset panel (sub-sections like the tray or the stat strip): paper well, no brass
    N2, M2 = 96, 2
    img = canvas(N2, N2)
    o = rr(S(N2), S(N2), [S(M2), S(M2), S(N2 - M2) - 1, S(N2 - M2) - 1], S(12))
    tex(img, paper(S(N2), S(N2), seed + 7, PAPER_D, (206, 178, 136), fibres=False, vignette=0), o)
    fill(img, (180, 130, 80), o, 0.18)
    inner_shadow(img, o, 2.5, 2.5, 0.5)
    lo = msub(o, shift(o, 0, -S(1)))
    fill(img, (255, 245, 220), lo, 0.8)
    save('panel', 'panel-inset', img, N2, N2, nineSlice=[24, 24, 24, 24],
         note="Recessed paper well for sub-areas (tray, stat strip, found strip). 9-slice 24.")
    # title plaque (extra): wood plaque, text by the game
    PW, PH = 160, 40
    img = canvas(PW, PH)
    pm = plate_mask(PW, PH, [3, 2, 3, 5], 12)
    drop_shadow(img, pm, 2, 2.5, 0.5)
    wood_plate(img, pm, seed + 9, HONEY, WOOD_M, HONEY_L, gloss=1.2)
    save('panel', 'title-plaque', img, PW, PH, nineSlice=[0, 22, 0, 22], state='single',
         note="EXTRA (not in A1-A13): lacquered honey plaque for screen titles; 3-slice along x (22 px caps). Text drawn by the game in dark ink #462a16.")
    # shelf plank (cubbies sit on it)
    SW, SH = 192, 20
    img = canvas(SW, SH)
    pm = plate_mask(SW, SH, [0, 2, 0, 6], 3)
    drop_shadow(img, pm, 3, 2.5, 0.55)
    wood_plate(img, pm, seed + 12, WOOD_L, WOOD_M, HONEY)
    save('panel', 'shelf-plank', img, SW, SH, nineSlice=[0, 12, 0, 12],
         note="Shelf the cubbies stand on; 3-slice along x. The cubby bottoms sit at y = 4.")


# ======================= A4 seal / A9 lantern =======================
def seal_img(n=24):
    img = canvas(n, n)
    W = S(n)
    c = W / 2
    sc = Image.new('L', (W, W), 0)
    d = ImageDraw.Draw(sc)
    pts = []
    for k in range(48):
        a = k / 48 * 2 * math.pi
        r = S(n * 0.44) * (1 if k % 2 == 0 else 0.93)
        pts.append((c + math.cos(a) * r, c + math.sin(a) * r))
    d.polygon(pts, fill=255)
    drop_shadow(img, sc, dy=1, blur_px=1, alpha=0.55)
    tex(img, rgrad(W, W, c * 0.75, c * 0.65, W * 0.6, GOLD_L, GOLD_D), sc)
    inner = ell(W, W, [c - S(n * .32), c - S(n * .32), c + S(n * .32), c + S(n * .32)])
    fill(img, GOLD_D, msub(inner.filter(ImageFilter.MaxFilter(SS * 2 + 1)), inner), 0.5)
    bevel(img, sc, 0.8, 0.6, hi_a=0.8, lo_a=0.45)
    # embossed check (the decided gold check seal)
    ck = Image.new('L', (W, W), 0)
    ImageDraw.Draw(ck).line([(c - S(n * .17), c + S(n * .01)), (c - S(n * .04), c + S(n * .14)), (c + S(n * .19), c - S(n * .13))], fill=255, width=S(n * .1), joint='curve')
    fill(img, (255, 252, 236), ck)
    fill(img, GOLD_D, msub(shift(ck, S(.5), S(.6)), ck), 0.7)
    lacquer(img, sc, 0.25, 0.4, 0.4)
    return img


def lantern_img(frame, w=24, h=32):
    img = canvas(w, h)
    W, H = S(w), S(h)
    k = [1.0, 0.82][frame]
    body = ell(W, H, [S(4), S(7), S(20), S(27)])
    glow(img, body, LANTERN, 3.0, 0.55 * k, grow=0.5)
    fill(img, (255, 150, 60), body)
    tex(img, rgrad(W, H, W / 2, S(18.5 - frame * 0.6), S(10), (255, 246, 190), (236, 140, 54)), body, 0.95)
    d = ImageDraw.Draw(img)
    # ribs
    for yy in [11, 15, 19, 23]:
        hw = 8 * math.sqrt(max(0, 1 - ((yy - 17) / 10) ** 2))
        d.line([(W / 2 - S(hw), S(yy)), (W / 2 + S(hw), S(yy))], fill=C((196, 104, 40), 110), width=S(.5))
    flame = ell(W, H, [W / 2 - S(2.2), S(15.5 - frame * .8), W / 2 + S(2.2), S(21.5)])
    fill(img, (255, 252, 220), blur(flame, S(1.2)), 0.9 * k)
    for (y0, y1, ww) in [(4.5, 8, 12), (26, 29.5, 12)]:
        cap = rr(W, H, [W / 2 - S(ww / 2), S(y0), W / 2 + S(ww / 2), S(y1)], S(1.2))
        tex(img, wood(W, H, 3, WOOD_D, WOOD_DD, WOOD_M), cap)
        rim_light(img, cap, alpha=0.6, w=.6)
    d.line([(W / 2, S(1)), (W / 2, S(4.5))], fill=C(WOOD_DD), width=S(1))
    d.ellipse([W / 2 - S(1.6), 0, W / 2 + S(1.6), S(2.6)], outline=C(WOOD_DD), width=S(.8))
    outline(img, body, (170, 88, 30), 0.6, 0.8)
    return img


# ======================= A2 cubby =======================
def cubby(state, n=112, press=False, seed=21):
    """state: earned | notyet. press shifts down 2 px and darkens."""
    f = n / 112
    dy = 2 * f if press else 0
    img = canvas(n, n)
    W = S(n)
    outer = rr(W, W, [S(3 * f), S(2 * f + dy), W - S(3 * f) - 1, W - S(6 * f) + S(dy) - 1], S(14 * f))
    drop_shadow(img, outer, dy=(3 if not press else 1.2) * f, blur_px=(3 if not press else 1.6) * f, alpha=0.5)
    T = 9 * f
    inner = rr(W, W, [S(3 * f + T), S(2 * f + T + dy), W - S(3 * f + T) - 1, W - S(6 * f + T) + S(dy) - 1], S(8 * f))
    rim = msub(outer, inner)
    if state == 'earned':
        tex(img, wood(W, W, seed, WOOD_M, WOOD_D, WOOD_L), rim)
        bevel(img, rim, 1.8 * f, 1.6 * f, hi_a=0.55, lo_a=0.55)
        rim_light(img, outer, alpha=0.8)
        lacquer(img, outer, 0.2, 0.3, 0.35)
        # warm lit back wall
        tex(img, rgrad(W, W, W / 2, W * 0.78, W * 0.62, (255, 222, 150), (196, 128, 64)), inner)
        tex(img, wood(W, W, seed + 4, (255, 255, 255), (214, 200, 180), (255, 255, 255), vertical=True), inner, 0.16)
        inner_shadow(img, inner, 3.2 * f, 3 * f, 0.55)
        # side walls (depth): darker strips inside left/right
        sw = Image.new('L', (W, W), 0)
        bb = inner.getbbox()
        ImageDraw.Draw(sw).rectangle([bb[0], bb[1], bb[0] + S(5 * f), bb[3]], fill=255)
        ImageDraw.Draw(sw).rectangle([bb[2] - S(5 * f), bb[1], bb[2], bb[3]], fill=255)
        fill(img, SHADOW, mmul(blur(sw, S(3 * f)), inner), 0.28)
        bounce(img, inner, (255, 236, 170), 0.4, 12 * f)
        # gold bead round the opening
        bead = msub(inner.filter(ImageFilter.MaxFilter(S(1.5 * f) * 2 + 1)), inner)
        fill(img, GOLD, bead)
        rim_light(img, bead, (255, 250, 220), 0.9, 0.5)
    else:
        # not-yet: matte pale wood, calm paper back; hopeful, never greyed or locked
        tex(img, wood(W, W, seed, (190, 150, 108), (150, 112, 76), (214, 180, 138), contrast=0.6), rim)
        bevel(img, rim, 1.4 * f, 1.4 * f, hi_a=0.4, lo_a=0.35)
        rim_light(img, outer, alpha=0.5)
        tex(img, paper(W, W, seed + 2, (244, 232, 210), (222, 204, 172)), inner)
        inner_shadow(img, inner, 2.2 * f, 2.4 * f, 0.35)
        # soft dashed guide inside
        d = ImageDraw.Draw(img)
        bb = inner.getbbox()
        pad = S(7 * f)
        x0, y0, x1, y1 = bb[0] + pad, bb[1] + pad, bb[2] - pad, bb[3] - pad
        seg = S(5 * f)
        col = C((196, 164, 120), 150)
        for x in range(int(x0 + S(6 * f)), int(x1 - S(6 * f)), int(seg * 2)):
            d.line([(x, y0), (x + seg, y0)], fill=col, width=S(1 * f))
            d.line([(x, y1), (x + seg, y1)], fill=col, width=S(1 * f))
        for y in range(int(y0 + S(6 * f)), int(y1 - S(6 * f)), int(seg * 2)):
            d.line([(x0, y), (x0, y + seg)], fill=col, width=S(1 * f))
            d.line([(x1, y), (x1, y + seg)], fill=col, width=S(1 * f))
    outline(img, outer, WOOD_DD if state == 'earned' else (120, 84, 54), 0.9 * f, 0.9)
    if press:
        fill(img, SHADOW, outer, 0.1)
    return img, outer, inner


def cubby_next_glow(n=112):
    """warm lantern light that spills into the next cubby (overlay on cubby-notyet)."""
    img = canvas(n, n)
    _, outer, inner = cubby('notyet', n)
    W = S(n)
    g = rgrad(W, W, W * 0.8, W * 0.2, W * 0.75, (255, 214, 130), (255, 214, 130))
    a = rgrad(W, W, W * 0.8, W * 0.2, W * 0.75, (255, 255, 255), (0, 0, 0)).convert('L')
    tex(img, g, mmul(a, inner), 0.75)
    rim = msub(outer, inner)
    fill(img, (255, 214, 130), mmul(a, rim), 0.35)
    return img


# ======================= A6 slot card =======================
def slot_card(state, w=140, h=132, seed=31):
    M = 8
    cw, ch = w + 2 * M, h + 2 * M
    press = 1.5 if state == 'pressed' else 0
    sel = state == 'selected'
    img, m, inner = framed(cw, ch, 14, [M, M, M, M], seed, frame_w=6, face='honey' if sel else 'paper',
                           rim_col=GOLD if sel else None, press=press, glow_col=(255, 206, 110) if sel else None,
                           wood_cols=(WOOD_L, WOOD_M, HONEY) if sel else None)
    W, H = img.size
    cx, cy, r = W / 2, S(M + 44 + press), S(33)
    well = ell(W, H, [cx - r, cy - r, cx + r, cy + r])
    ring = msub(well.filter(ImageFilter.MaxFilter(S(3) * 2 + 1)), well)
    drop_shadow(img, ring, 1.2, 1.2, 0.45)
    tex(img, rgrad(W, H, cx - r * .4, cy - r * .9, r * 2.2, GOLD_L, GOLD_D), ring)
    bevel(img, ring, 0.8, 0.6, hi_a=0.8, lo_a=0.4)
    tex(img, rgrad(W, H, cx, cy + r * .3, r * 1.2, (255, 244, 220) if not sel else (255, 250, 230), (226, 200, 160)), well)
    inner_shadow(img, well, 3, 3, 0.5)
    if sel:
        lacquer(img, m, 0.12, 0.25, 0.25)
    return img, m


# ======================= A7 tray tile / bag tiles / found tiles =======================
def tile(state, n=72, seed=41, rarity=None, tall=None):
    M = 6 if n >= 60 else 4
    w, h = n + 2 * M, (tall or n) + 2 * M
    press = 1.5 if state == 'pressed' else 0
    sel = state == 'selected'
    eq = state == 'equipped'
    r = 12 * n / 72
    face = 'honey' if eq else 'paper'
    rim = GOLD if (sel or eq) else (RARITY[rarity] if rarity else None)
    img, m, inner = framed(w, h, r, [M, M, M, M], seed, frame_w=4.5 * n / 72, face=face, rim_col=rim, press=press,
                           glow_col=(255, 206, 110) if sel else None,
                           wood_cols=(WOOD_L, WOOD_M, HONEY) if (sel or eq) else None)
    if rarity and not (sel or eq):
        # rarity enamel: colour band at the bottom of the face + coloured rim (no red anywhere)
        W, H = img.size
        bb = inner.getbbox()
        band = Image.new('L', (W, H), 0)
        ImageDraw.Draw(band).rectangle([0, bb[3] - S(7 * n / 72), W, H], fill=255)
        fill(img, RARITY[rarity], mmul(band, inner), 0.38)
        if rarity in ('rare', 'epic'):
            d = ImageDraw.Draw(img)
            k = 2 if rarity == 'rare' else 4
            corners = [(bb[0] + S(5), bb[1] + S(5)), (bb[2] - S(5), bb[1] + S(5)), (bb[0] + S(5), bb[3] - S(5)), (bb[2] - S(5), bb[3] - S(5))][:k]
            for (x, y) in corners:
                star4(d, x, y, S(3.2), C(RARITY[rarity]))
                star4(d, x, y, S(1.6), C((255, 255, 255), 200))
    return img, m


def eq_badge(n=20):
    """small gold 'equipped' tab for tray tiles (the gold check seal)."""
    return seal_img(n)


# ======================= A8 switch + glyphs =======================
def switch_seg(side, state, w=120, h=44, seed=51):
    img = canvas(w, h)
    W, H = S(w), S(h)
    press = 1.2 if state == 'pressed' else 0
    on = state in ('on', 'pressed')
    R = S(18)
    full = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(full)
    # rounded on the outer side only
    box = [S(2), S(3 + press), W - S(2), H - S(5) + S(press)]
    if side == 'left':
        d.rounded_rectangle([box[0], box[1], box[2] + R, box[3]], R, fill=255)
        full = mmul(full, rr(W, H, [0, 0, W - S(1), H], 0))
    else:
        d.rounded_rectangle([box[0] - R, box[1], box[2], box[3]], R, fill=255)
        full = mmul(full, rr(W, H, [S(1), 0, W, H], 0))
    if on:
        drop_shadow(img, full, 2 - press, 2.2 - press * .8, 0.5)
        tex(img, wood(W, H, seed, HONEY, WOOD_M, HONEY_L), full)
        bevel(img, full, 1.6, 1.4, hi_a=0.6, lo_a=0.5)
        rim_light(img, full, alpha=0.9)
        bounce(img, full, alpha=0.3)
        lacquer(img, full, 0.32, 0.45, 0.55)
        outline(img, full, WOOD_DD, 0.9)
        if press:
            fill(img, SHADOW, full, 0.1)
    else:
        # recessed into the track: darker wood, inner shadow, no drop shadow
        tex(img, wood(W, H, seed, WOOD_D, WOOD_DD, WOOD_M), full)
        inner_shadow(img, full, 2.4, 2.4, 0.6)
        lo = msub(full, shift(full, 0, -S(1)))
        fill(img, (255, 220, 170), lo, 0.35)
        outline(img, full, WOOD_DD, 0.8, 0.8)
    return img


def switch_track(w=240, h=52, seed=55):
    img = canvas(w, h)
    m = plate_mask(w, h, [1, 1, 1, 3], 22)
    drop_shadow(img, m, 1.5, 2, 0.35)
    tex(img, wood(S(w), S(h), seed, WOOD_D, WOOD_DD, WOOD_M), m)
    inner_shadow(img, m, 2.5, 2.5, 0.55)
    lo = msub(m, shift(m, 0, -S(1)))
    fill(img, (255, 220, 170), lo, 0.45)
    return img


def glyph_trophy(n=32):
    img = canvas(n, n)
    W = S(n)
    m = Image.new('L', (W, W), 0)
    d = ImageDraw.Draw(m)
    d.pieslice([S(7), S(-6), S(25), S(19)], 0, 180, fill=255)       # cup
    d.rectangle([S(7), S(3), S(25), S(6.5)], fill=255)
    for sx in (1, -1):                                               # handles
        cx = S(7) if sx > 0 else S(25)
        hm = Image.new('L', (W, W), 0)
        ImageDraw.Draw(hm).ellipse([cx - S(5), S(5), cx + S(5), S(14)], outline=255, width=S(2.2))
        cut = rr(W, W, [S(7), 0, S(25), W], 0)
        m = ImageChops.lighter(m, msub(hm, cut))
    d = ImageDraw.Draw(m)
    d.rectangle([S(14.5), S(17), S(17.5), S(22)], fill=255)          # stem
    d.rounded_rectangle([S(10), S(22), S(22), S(25.5)], S(1), fill=255)
    d.rounded_rectangle([S(8), S(25), S(24), S(29)], S(1.5), fill=255)
    drop_shadow(img, m, 1, 1, 0.5)
    tex(img, rgrad(W, W, W * .38, W * .25, W * .8, GOLD_L, GOLD_D), m)
    bevel(img, m, 0.8, 0.7, hi_a=0.85, lo_a=0.45)
    sd = ImageDraw.Draw(img)
    star4(sd, S(16), S(10.5), S(4.2), C((255, 252, 230)))
    outline(img, m, (130, 80, 20), 0.7, 0.9)
    return img


def glyph_swords(n=32):
    """two crossed wooden practice swords (bokken): rounded, no edges or points."""
    img = canvas(n, n)
    W = S(n)
    m_all = Image.new('L', (W, W), 0)
    parts = []
    for sx in (1, -1):
        m = Image.new('L', (W, W), 0)
        d = ImageDraw.Draw(m)
        a = (S(4), S(28)) if sx > 0 else (S(28), S(28))
        b = (S(27), S(4)) if sx > 0 else (S(5), S(4))
        d.line([a, b], fill=255, width=S(4.6))
        d.ellipse([b[0] - S(1.8), b[1] - S(1.8), b[0] + S(1.8), b[1] + S(1.8)], fill=255)
        parts.append(m)
        m_all = ImageChops.lighter(m_all, m)
    drop_shadow(img, m_all, 1, 1, 0.5)
    for i, m in enumerate(parts):
        tex(img, wood(W, W, 60 + i, WOOD_L, WOOD_M, HONEY_L), m)
        bevel(img, m, 0.7, 0.6, hi_a=0.7, lo_a=0.5)
        outline(img, m, WOOD_DD, 0.7)
        # dark grip + round brass guard
        g = Image.new('L', (W, W), 0)
        dg = ImageDraw.Draw(g)
        a = (S(4), S(28)) if i == 0 else (S(28), S(28))
        t = 0.3
        gx = a[0] + ((S(27) if i == 0 else S(5)) - a[0]) * t
        gy = a[1] + (S(4) - a[1]) * t
        dg.line([a, (gx, gy)], fill=255, width=S(5.2))
        fill(img, (74, 50, 40), mmul(g, m.filter(ImageFilter.MaxFilter(5))))
        # flat guard (tsuba) across the blade
        ux, uy = (S(27) if i == 0 else S(5)) - a[0], S(4) - a[1]
        ln = math.hypot(ux, uy); px_, py_ = -uy / ln, ux / ln
        gm = Image.new('L', (W, W), 0)
        ImageDraw.Draw(gm).line([(gx - px_ * S(4), gy - py_ * S(4)), (gx + px_ * S(4), gy + py_ * S(4))], fill=255, width=S(2.2))
        tex(img, rgrad(W, W, gx - S(1), gy - S(1), S(5), GOLD_L, GOLD_D), gm)
        outline(img, gm, GOLD_D, 0.5)
    return img


# ======================= A10 stat icons + tiles + XP bar =======================
def stat_icon(kind, n=32):
    img = canvas(n, n)
    W = S(n)
    c = W / 2
    d = ImageDraw.Draw(img)
    if kind == 'perfect':          # gold star
        m = Image.new('L', (W, W), 0)
        pts = []
        for k in range(10):
            a = -math.pi / 2 + k * math.pi / 5
            r = S(13) if k % 2 == 0 else S(6)
            pts.append((c + math.cos(a) * r, c + S(1) + math.sin(a) * r))
        ImageDraw.Draw(m).polygon(pts, fill=255)
        m = blur(m, S(.8)).point(lambda v: 255 if v > 110 else 0)
        drop_shadow(img, m, 1, 1, 0.5)
        tex(img, rgrad(W, W, c * .8, c * .6, W * .6, GOLD_L, GOLD_D), m)
        bevel(img, m, 0.8, 0.8, hi_a=0.8, lo_a=0.45)
        outline(img, m, (140, 86, 20), 0.6)
    elif kind == 'combo':          # three linked rings, warm orange to gold (not red)
        cols = [(255, 160, 60), (255, 190, 70), (255, 220, 110)]
        ms = []
        for i, x in enumerate([9.5, 16, 22.5]):
            m = ell(W, W, [S(x - 6.5), S(16 - 6.5 - (i % 2) * 2), S(x + 6.5), S(16 + 6.5 - (i % 2) * 2)])
            hole = ell(W, W, [S(x - 3.3), S(16 - 3.3 - (i % 2) * 2), S(x + 3.3), S(16 + 3.3 - (i % 2) * 2)])
            ms.append((msub(m, hole), cols[i]))
        allm = ms[0][0]
        for m, _ in ms[1:]:
            allm = ImageChops.lighter(allm, m)
        drop_shadow(img, allm, 1, 1, 0.5)
        for m, col in ms:
            fill(img, col, m)
            bevel(img, m, 0.7, 0.6, hi_a=0.7, lo_a=0.4)
            outline(img, m, (150, 80, 24), 0.55)
    elif kind == 'clock':
        m = ell(W, W, [S(3.5), S(3.5), S(28.5), S(28.5)])
        drop_shadow(img, m, 1, 1, 0.5)
        tex(img, wood(W, W, 71, WOOD_M, WOOD_D, WOOD_L), m)
        f = ell(W, W, [S(7), S(7), S(25), S(25)])
        tex(img, rgrad(W, W, c, c * .8, S(12), PAPER_L, PAPER_D), f)
        inner_shadow(img, f, 1.2, 1.2, 0.45)
        for k in range(4):
            a = k * math.pi / 2
            d.ellipse([c + math.cos(a) * S(6.5) - S(.9), c + math.sin(a) * S(6.5) - S(.9), c + math.cos(a) * S(6.5) + S(.9), c + math.sin(a) * S(6.5) + S(.9)], fill=C(WOOD_M))
        d.line([(c, c), (c, c - S(5.5))], fill=C(INK), width=S(1.6))
        d.line([(c, c), (c + S(4), c + S(1.5))], fill=C(INK), width=S(1.6))
        d.ellipse([c - S(1.5), c - S(1.5), c + S(1.5), c + S(1.5)], fill=C(GOLD))
        bevel(img, m, 0.8, 0.7, hi_a=0.6, lo_a=0.4)
        lacquer(img, m, 0.25, 0.35, 0.4)
        outline(img, m, WOOD_DD, 0.6)
    elif kind == 'xp':             # glowing teal orb with a spark (growth, calm)
        m = ell(W, W, [S(5), S(5), S(27), S(27)])
        glow(img, m, (120, 230, 210), 2.0, 0.5)
        tex(img, rgrad(W, W, c * .8, c * .7, S(15), (200, 255, 240), (30, 150, 150)), m)
        bevel(img, m, 0.8, 0.8, hi_a=0.7, lo_a=0.45)
        star4(d, c, c + S(.5), S(7.5), C((255, 255, 240)))
        sp = ell(W, W, [S(9), S(8), S(15), S(12)])
        fill(img, (255, 255, 255), blur(sp, S(.6)), 0.7)
        outline(img, m, (20, 100, 104), 0.6)
    return img


def stat_tile(w=96, h=64, seed=81):
    img, m, inner = framed(w, h, 12, [2, 2, 2, 4], seed, frame_w=4, face='paper')
    return img


def xp_frame(w=200, h=20, seed=91):
    img = canvas(w, h)
    m = plate_mask(w, h, [1, 1, 1, 2], 8)
    drop_shadow(img, m, 1.2, 1.4, 0.45)
    tex(img, wood(S(w), S(h), seed, WOOD_M, WOOD_D, WOOD_L), m)
    bevel(img, m, 1, 1, hi_a=0.5, lo_a=0.5)
    inner = plate_mask(w, h, [4, 4, 4, 5], 5)
    tex(img, wood(S(w), S(h), seed + 1, (80, 48, 26), WOOD_DD, (100, 62, 34)), inner)
    inner_shadow(img, inner, 1.5, 1.5, 0.7)
    outline(img, m, WOOD_DD, 0.8)
    return img


def xp_fill(w=192, h=11):
    """neutral fill, tinted by the game (mock tint: gold). Gloss is a separate layer so the tint stays clean."""
    img = canvas(w, h)
    m = rr(S(w), S(h), [0, 0, S(w) - 1, S(h) - 1], S(5))
    tex(img, vgrad(S(w), S(h), (255, 255, 255), (196, 196, 196)), m)
    gl = canvas(w, h)
    top = rr(S(w), S(h), [S(3), S(1.2), S(w - 3), S(4.2)], S(2))
    fill(gl, (255, 255, 255), blur(top, S(.6)), 0.6)
    return img, gl


# ======================= A11 gear rings =======================
def gear_ring(rarity, n=56, state='normal'):
    img = canvas(n, n)
    W = S(n)
    c = W / 2
    col = RARITY[rarity]
    outer = ell(W, W, [S(3), S(3), W - S(3), W - S(3)])
    if state == 'glow':
        glow(img, outer, (255, 214, 120), 2.5, 0.8, grow=0.5)
    drop_shadow(img, outer, 1.6, 1.8, 0.5)
    hole = ell(W, W, [S(10), S(10), W - S(10), W - S(10)])
    band = msub(outer, hole)
    if rarity == 'common':
        tex(img, wood(W, W, 101, WOOD_L, WOOD_M, HONEY), band)
    else:
        tex(img, rgrad(W, W, c * .7, c * .55, W * .7, GOLD_L, GOLD_D), band)
        en = msub(ell(W, W, [S(5.5), S(5.5), W - S(5.5), W - S(5.5)]), ell(W, W, [S(8), S(8), W - S(8), W - S(8)]))
        fill(img, col, en)
        fill(img, (255, 255, 255), mmul(en, rgrad(W, W, c * .7, c * .4, W * .5, (255,) * 3, (0,) * 3).convert('L')), 0.45)
    bevel(img, band, 1.0, 1.0, hi_a=0.75, lo_a=0.5)
    # studs grow with rarity (more ornament = rarer), like a crown of light
    d = ImageDraw.Draw(img)
    k = {'common': 0, 'uncommon': 2, 'rare': 4, 'epic': 8}[rarity]
    for i in range(k):
        a = -math.pi / 2 + i * 2 * math.pi / max(1, k)
        x, y = c + math.cos(a) * S(n / 2 - 6.75), c + math.sin(a) * S(n / 2 - 6.75)
        rr_ = S(2.2)
        d.ellipse([x - rr_, y - rr_, x + rr_, y + rr_], fill=C(GOLD_D if rarity == 'uncommon' else tuple(int(v * .55) for v in col)))
        d.ellipse([x - rr_ * .8, y - rr_ * .85, x + rr_ * .7, y + rr_ * .6], fill=C(col if rarity != 'uncommon' else GOLD_L))
        d.ellipse([x - rr_ * .5, y - rr_ * .6, x - rr_ * .05, y - rr_ * .15], fill=C((255, 255, 255), 220))
    # paper well inside
    tex(img, rgrad(W, W, c, c * 1.15, S(20), PAPER_L, PAPER_D), hole)
    inner_shadow(img, hole, 2.2, 2.2, 0.5)
    outline(img, outer, (110, 70, 30), 0.7)
    if state == 'pressed':
        fill(img, SHADOW, outer, 0.12)
    return img


# ======================= A12 paper-doll backing =======================
def doll_backing(w=96, h=128, seed=111):
    img = canvas(w, h)
    W, H = S(w), S(h)
    arch = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(arch)
    d.rounded_rectangle([S(4), S(16), W - S(4), H - S(14)], S(10), fill=255)
    d.ellipse([S(4), S(2), W - S(4), S(62)], fill=255)
    tex(img, rgrad(W, H, W / 2, H * .45, H * .6, (255, 238, 200), (214, 170, 116)), arch)
    tex(img, paper(W, H, seed, (255, 255, 255), (220, 210, 190), vignette=0), arch, 0.2)
    inner_shadow(img, arch, 3, 3.5, 0.45)
    ring = msub(arch.filter(ImageFilter.MaxFilter(S(2.5) * 2 + 1)), arch)
    tex(img, wood(W, H, seed + 1, WOOD_M, WOOD_D, WOOD_L, vertical=True), ring)
    bevel(img, ring, 0.8, 0.8)
    # tatami dais
    dais = Image.new('L', (W, H), 0)
    ImageDraw.Draw(dais).ellipse([S(10), H - S(26), W - S(10), H - S(6)], fill=255)
    drop_shadow(img, dais, 2, 2, 0.5)
    tex(img, wood(W, H, seed + 2, (196, 186, 120), (150, 140, 80), (220, 212, 150), freq=2.2, contrast=0.6), dais)
    top = ell(W, H, [S(13), H - S(25), W - S(13), H - S(11)])
    fill(img, (240, 232, 170), top, 0.35)
    fill(img, (60, 90, 50), msub(dais, dais.filter(ImageFilter.MinFilter(S(1.2) * 2 + 1))), 0.6)
    bevel(img, dais, 1, 1, hi_a=0.5, lo_a=0.4)
    # soft warm spotlight on the dais
    sp = ell(W, H, [S(20), H - S(24), W - S(20), H - S(12)])
    fill(img, (255, 244, 200), blur(sp, S(4)), 0.5)
    return img


# ======================= A13 unlock sweep =======================
def sweep_frames(n=128, frames=8):
    out = []
    W = S(n)
    rng = np.random.default_rng(7)
    sparks = [(rng.random() * .7 + .15, rng.random() * .7 + .15, rng.random() * .5 + .5) for _ in range(7)]
    for i in range(frames):
        img = canvas(n, n)
        t = i / (frames - 1)
        # gold light band crossing diagonally, inside a soft round mask
        circ = blur(ell(W, W, [S(8), S(8), W - S(8), W - S(8)]), S(8))
        yy, xx = np.mgrid[0:W, 0:W].astype(np.float32) / W
        c = -0.3 + 1.6 * t
        band = np.clip(1 - np.abs(xx + yy * .6 - c * 1.6) / .28, 0, 1) ** 2
        bm = Image.fromarray((band * 255).astype(np.uint8))
        fill(img, (255, 226, 140), mmul(bm, circ), 0.75 * math.sin(math.pi * min(1, t * 1.15)) ** .5 if t < 1 else 0)
        # a few sparkles that pop after the band passes (not too few, not too many)
        d = ImageDraw.Draw(img)
        for k, (sx, sy, sz) in enumerate(sparks):
            pass_t = ((sx + sy * .6) / 1.6 + 0.3) / 1.6 + 0.04
            life = (t - pass_t) / 0.35
            if 0 <= life <= 1:
                s = math.sin(math.pi * life) * sz
                gl = ell(W, W, [sx * W - S(6 * s), sy * W - S(6 * s), sx * W + S(6 * s), sy * W + S(6 * s)])
                fill(img, (255, 214, 120), blur(gl, S(3)), 0.6)
                star4(d, sx * W, sy * W, S(9 * s), C((255, 250, 225)), .18)
        out.append(img)
    return out


# ======================= A3 belt knot + cord =======================
def knot_layers(n=40):
    """neutral layers, multiplied by beltStyles tints. Same names as the player belt layers."""
    W = S(n)
    band = Image.new('L', (W, W), 0)
    d = ImageDraw.Draw(band)
    # two tails angling down-out
    d.polygon([(S(16), S(19)), (S(21), S(20)), (S(12), S(31)), (S(6), S(28))], fill=255)
    d.polygon([(S(19), S(20)), (S(24), S(19)), (S(34), S(28)), (S(28), S(31))], fill=255)
    # the wrapped band across + the knot
    d.rounded_rectangle([0, S(13), W, S(21)], S(2), fill=255)
    d.rounded_rectangle([S(14), S(10.5), S(26), S(23.5)], S(3.5), fill=255)
    tails_shade = Image.new('L', (W, W), 0)
    ds = ImageDraw.Draw(tails_shade)
    ds.polygon([(S(16), S(22)), (S(21), S(22)), (S(12), S(31)), (S(6), S(28))], fill=255)
    ds.polygon([(S(19), S(22)), (S(24), S(22)), (S(34), S(28)), (S(28), S(31))], fill=255)
    knot = rr(W, W, [S(14), S(10.5), S(26), S(23.5)], S(3.5))
    layers = {}
    # band: neutral light grey with cloth weave + folds baked in grey (multiply keeps the shading)
    img = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    fill(img, (232, 232, 232), band)
    weave = (noise(W, W, W / S(1.5), 3, 5) * 0.5 + noise(W, W, 3, W / S(1.5), 6) * 0.5)
    wv = Image.fromarray((np.clip((weave - .5) * 3 + .5, 0, 1) * 255).astype(np.uint8))
    fill(img, (180, 180, 180), mmul(mscale(wv, .35), band))
    fill(img, (150, 150, 150), mmul(tails_shade, band), 0.35)       # tails sit behind, slightly darker
    fold = Image.new('L', (W, W), 0)
    ImageDraw.Draw(fold).line([(S(14), S(17)), (S(26), S(17))], fill=255, width=S(1))
    fill(img, (150, 150, 150), mmul(blur(fold, S(.8)), knot), 0.6)
    inner_shadow(img, knot, 1.2, 1.2, 0.0)
    b2 = blur(band, S(1.2))
    lo = mmul(msub(b2, shift(b2, -S(1.4), -S(1.4))), band)
    fill(img, (120, 120, 120), lo, 0.6)
    layers['belt'] = img
    # center stripe (two-colour belts: Red/Black, Brown/Black)
    st = Image.new('L', (W, W), 0)
    ImageDraw.Draw(st).rectangle([0, S(16), W, S(18.5)], fill=255)
    stripe = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    fill(stripe, (235, 235, 235), mmul(st, msub(band, knot)))
    layers['belt-center'] = stripe
    # sheen (Black belt gets a cool sheen tint; others leave it off or white at low alpha)
    sh = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    hi = mmul(msub(b2, shift(b2, S(1.4), S(1.4))), band)
    fill(sh, (255, 255, 255), hi, 0.8)
    top = rr(W, W, [S(1), S(13.5), W - S(1), S(14.8)], S(1))
    fill(sh, (255, 255, 255), mmul(blur(top, S(.5)), band), 0.6)
    layers['belt-sheen'] = sh
    # rim: the dark edge line, tinted by belt-rim
    rim = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    e = msub(band, band.filter(ImageFilter.MinFilter(S(1.1) * 2 + 1)))
    ke = msub(knot.filter(ImageFilter.MaxFilter(S(.8) * 2 + 1)), knot)
    fill(rim, (255, 255, 255), ImageChops.lighter(e, mmul(ke, band)))
    layers['belt-rim'] = rim
    # soft contact shadow (fixed, not tinted)
    shd = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    drop_shadow(shd, band, 1.2, 1.4, 0.45)
    layers['belt-shadow'] = shd
    return layers


def cord(w=320, h=40, seed=131):
    """the decided ribbon cord: neutral twisted cord, 3-slice along x; mock tint #d9b47a."""
    img = canvas(w, h)
    W, H = S(w), S(h)
    m = rr(W, H, [0, S(15), W, S(25)], S(5))
    drop_shadow(img, m, 2, 1.6, 0.4)
    fill(img, (236, 236, 236), m)
    d = ImageDraw.Draw(img)
    for x in range(-S(10), W + S(10), S(6)):        # twist strands
        d.line([(x, S(25)), (x + S(6), S(15))], fill=(190, 190, 190, 200), width=S(1.4))
        d.line([(x + S(1.2), S(24.5)), (x + S(5.6), S(16))], fill=(255, 255, 255, 140), width=S(.6))
    img.putalpha(ImageChops.multiply(img.getchannel('A'), ImageChops.lighter(m, blur(shift(m, 0, S(2)), S(1.6)).point(lambda v: int(v * .45)))))
    bevel(img, m, 1, 1, hi=(255, 255, 255), hi_a=0.5, lo=(90, 90, 90), lo_a=0.5)
    return img


# ======================= A14 extras: primary button =======================
def button(state, w=160, h=52, seed=141):
    img = canvas(w, h)
    press = 2 if state == 'pressed' else 0
    m = plate_mask(w, h, [3, 2 + press, 3, 6 - press], 18)
    if state == 'disabled':
        drop_shadow(img, m, 2, 2.4, 0.3)
        tex(img, wood(S(w), S(h), seed, (206, 184, 150), (176, 150, 116), (222, 204, 176), contrast=.5), m)
        bevel(img, m, 1.4, 1.4, hi_a=0.4, lo_a=0.3)
        outline(img, m, (150, 120, 88), 0.9)
        return img
    # thick lip under the face (the "pressable" depth): shows less when pressed
    lip = plate_mask(w, h, [3, 2 + 4, 3, 2], 18)
    drop_shadow(img, lip, 2 - press * .5, 2.4, 0.5)
    fill(img, GOLD_D, lip)
    fill(img, WOOD_D, lip, 0.35)
    tex(img, brass(S(w), S(h), (255, 226, 120), (246, 190, 70), (222, 150, 40)), m)
    tex(img, wood(S(w), S(h), seed, (255, 255, 255), (200, 200, 200), (255, 255, 255)), m, 0.12)
    bevel(img, m, 1.6, 1.6, hi_a=0.6, lo_a=0.35)
    rim_light(img, m, (255, 252, 230), 0.95, 1.2)
    lacquer(img, m, 0.35, 0.45, 0.6)
    outline(img, ImageChops.lighter(m, lip), (130, 80, 20), 0.9)
    if press:
        fill(img, SHADOW, m, 0.08)
    return img


# ======================= build =======================
def build():
    panel_frame()

    # A2 cubby (112 and 96), states + overlays
    for n in (112, 96):
        sfx = '' if n == 112 else '-96'
        for st in ('earned', 'notyet'):
            for pr in (False, True):
                img, outer, inner = cubby(st, n, pr)
                save('cubby', f'cubby-{st}{"-pressed" if pr else ""}{sfx}', img, n, n,
                     nineSlice=[24, 24, 24, 24] if n == 112 else [20, 20, 20, 20], anchor="item icon centred in the opening, centre y = 52/112 of the height",
                     state=('pressed' if pr else 'normal'), note=f"A2 {st}. Shadow inside the file (3 px sides, 6 px bottom). Pressed = 2 px lower, darker, short shadow.")
        save('cubby', f'cubby-next-glow{sfx}', cubby_next_glow(n), n, n, layer='overlay on cubby-notyet', note="A2/A9: warm lantern spill for the next cubby only. Draw over cubby-notyet, then the lantern.")
        if n == 112:
            _, outer, _ = cubby('earned', n)
            for i, fr in enumerate(shine_frames(outer, 6)):
                save('cubby', f'cubby-earned-shine-{i}', fr, n, n, layer='optional overlay', fps=16, note="OPTIONAL: one shine sweep across an earned cubby when it is first earned or tapped. 6 frames, 16 fps, play once; frame 0 is empty.")
    save('cubby', 'cubby-seal', seal_img(24), 24, 24, anchor="top-right of the cubby, centre at (n-18, 16)", note="A4 gold check seal (decided). Embossed check, no text.")
    for i in (0, 1):
        save('cubby', f'cubby-lantern-{i}', lantern_img(i), 24, 32, fps=3, anchor="hangs from the cubby top-right, top of file at y=-6", note="A9 lantern, 2-frame flicker (ping-pong, ~3 fps). Only on the next cubby to learn (decided).")

    # A6 slot card
    for st in ('normal', 'selected', 'pressed'):
        img, m = slot_card(st)
        save('slot', f'slot-card-{st}', img, 156, 148, nineSlice=[0, 0, 0, 0], drawRect=[8, 8, 140, 132],
             iconWell={"centre": [78, 52], "radius": 33, "iconSize": 64},
             textLines={"slot": 92, "item": 109, "effect": 125, "note": "baseline-centre y in the 156 x 148 file (8 px glow margin)"},
             state=st, note="A6 slot card 140 x 132 (decided), drawn in a 156 x 148 file with 8 px for the glow. Not stretched.")
    _, m = slot_card('selected')
    for i, fr in enumerate(shine_frames(m, 6)):
        save('slot', f'slot-card-shine-{i}', fr, 156, 148, layer='optional overlay', fps=16, note="OPTIONAL: shine across the selected card when it becomes selected. 6 frames, play once.")

    # A7 tray tile + badge; bag tiles (72 x 88) x rarity; found tiles 52 x rarity
    for st in ('normal', 'selected', 'equipped', 'pressed'):
        img, m = tile(st)
        save('tray', f'tray-tile-{st}', img, 84, 84, drawRect=[6, 6, 72, 72], state=st, note="A7 tray tile 72 (file 84 with 6 px glow margin). Icon 52-56 centred.")
    save('tray', 'tray-equipped-badge', eq_badge(20), 20, 20, anchor="top-right corner of the tile, centre at (72, 12) in the 84 file", note="Gold check seal for equipped tiles (same seal as A4).")
    for rar in RARITY:
        img, m = tile('normal', 72, 42, rar, tall=88)
        save('gear', f'bag-tile-{rar}', img, 84, 100, drawRect=[6, 6, 72, 88], state='normal', note="A11 rarity frame, gear bag tile 72 x 88 (file 84 x 100). Rare gets 2 stars, epic 4. Icon 56 at top, centred x, centre y 40.")
        img, m = tile('normal', 52, 43, rar)
        save('found', f'found-tile-{rar}', img, 60, 60, drawRect=[4, 4, 52, 52], note="Last run found tile 52 (file 60). Icon 40.")
    for st in ('selected', 'pressed'):
        img, m = tile(st, 72, 42, None, tall=88)
        save('gear', f'bag-tile-{st}', img, 84, 100, drawRect=[6, 6, 72, 88], state=st, note="Bag tile selected/pressed (replaces the rarity frame while selected; draw the rarity stars on top if wanted).")

    # A8 switch
    save('switch', 'switch-track', switch_track(), 240, 52, nineSlice=[0, 24, 0, 24], note="Track behind the two segments; 3-slice along x. Segments sit at x=0 and x=120, y=4.")
    for side in ('left', 'right'):
        for st in ('on', 'off', 'pressed'):
            save('switch', f'switch-{side}-{st}', switch_seg(side, st), 120, 44, state=st, note="A8 segmented switch, 120 x 44. on = raised honey lacquer; off = sunk into the track; pressed = on, 1 px lower.")
    save('switch', 'glyph-trophy', glyph_trophy(), 32, 32, note="A8 Trophy Case glyph. On 'off' segments draw at 70% alpha.")
    save('switch', 'glyph-swords', glyph_swords(), 32, 32, note="A8 Fighting Style glyph: crossed wooden practice swords (round, no edges).")

    # A10 stats
    for k in ('perfect', 'combo', 'clock', 'xp'):
        save('stats', f'stat-{k}', stat_icon(k), 32, 32, note=f"A10 stat icon: {k}.")
    save('stats', 'stat-tile', stat_tile(), 96, 64, nineSlice=[16, 16, 16, 16], note="EXTRA: stat tile 64 tall, 9-slice 16. Icon at left (x 12), number by the game.")
    save('stats', 'xp-bar-frame', xp_frame(), 200, 20, nineSlice=[0, 10, 0, 10], note="XP bar frame, full width x 20, 3-slice along x (10 px caps). Fill area x 4..w-4, y 4..15.")
    f, g = xp_fill()
    save('stats', 'xp-bar-fill', f, 192, 11, nineSlice=[0, 6, 0, 6], layer='tint (multiply); mock uses #f2c14e', note="Neutral fill, tint in game. 3-slice; clip to the progress width.")
    save('stats', 'xp-bar-gloss', g, 192, 11, nineSlice=[0, 6, 0, 6], layer='over the fill, untinted', note="Gloss over the fill.")

    # A11 rings
    for rar in RARITY:
        for st in ('normal', 'glow', 'pressed'):
            save('gear', f'gear-ring-{rar}{"" if st == "normal" else "-" + st}', gear_ring(rar, 56, st), 56, 56, state=st,
                 note="A11 gear ring 56. Icon 36 centred. 'glow' = the slot that a picked bag item would go into.")

    # A12 / A13
    save('gear', 'doll-backing', doll_backing(), 96, 128, anchor="player-a-big S idle at scale 0.75, feet on the dais centre (48, 113)", note="A12: backing niche + tatami dais. Reuse player-a-big (128 x 160 frames) at 0.75 on top; it fits (body ~38 x 99 -> ~29 x 74).")
    for i, fr in enumerate(sweep_frames()):
        save('fx', f'unlock-sweep-{i}', fr, 128, 128, fps=16, note="A13 gold sweep + a few sparkles, 8 frames, 16 fps, play once, additive or normal blend; centre over the earned item.")

    # A3 knots + cord
    for k, im in knot_layers().items():
        save('belt', f'belt-knot-{k.replace("belt-", "") if k != "belt" else "band"}', im, 40, 40,
             layer=k, note="A3 knot layer, neutral. Tint with multiply from player.json beltStyles (same layer names). Draw: shadow, band, center (only if listed), sheen (if listed, else white @25%), rim.")
    save('belt', 'belt-cord', cord(), 320, 40, nineSlice=[0, 20, 0, 20], layer='tint #d9b47a (decided)', note="The decided ribbon cord, neutral, 3-slice along x.")

    # extras: Wear button
    for st in ('normal', 'pressed', 'disabled'):
        save('button', f'button-primary-{st}', button(st), 160, 52, nineSlice=[0, 24, 0, 24], state=st,
             note="EXTRA (plan's Wear button, 52 tall): honey-gold lacquer button, 3-slice along x. Label by the game in #462a16. Disabled = matte pale wood (not grey, not red).")

    # A5: 64 px seal icons (existing art downscaled)
    seals = ['off-balance', 'escape-step', 'sweep', 'strong-block', 'sharp-eyes', 'create-distance', 'disarm', 'throw', 'follow-through']
    for s in seals:
        im = Image.open(os.path.join(ART, 'icons', 'sprites', f'icon-{s}.png')).convert('RGBA')
        d = os.path.join(OUT, 'icons64')
        os.makedirs(d, exist_ok=True)
        im.resize((64, 64), Image.LANCZOS).save(os.path.join(d, f'icon-{s}-64.png'))
        im.save(os.path.join(d, f'icon-{s}-64@2x.png'))
        MAN["sprites"][f'icon-{s}-64'] = {"size": [64, 64], "file": f"icons64/icon-{s}-64.png", "note": "A5 seal icon at 64 (from incoming-art/icons)."}

    with open(os.path.join(OUT, 'menu2.json'), 'w') as fh:
        json.dump(MAN, fh, indent=1)
    print(len(MAN['sprites']), 'sprites')


if __name__ == '__main__':
    build()
