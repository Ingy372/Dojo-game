"""A-MENU2 samples (mood A, warm dojo wood). PIL, drawn at 4x and scaled down.
Run from the repo root: python3 incoming-art/menu2-samples/source/make_menu2_samples.py
No baked text in the sprites. The phone mock uses placeholder text only."""
import json, math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageFont

ROOT = 'incoming-art/menu2-samples'
SP, PV = f'{ROOT}/sprites', f'{ROOT}/preview'
ICONS = 'incoming-art/icons/sprites'
SS = 4  # draw at 4x of the 1x size

# mood A palette (no red)
WOOD_D, WOOD_M, WOOD_L = (92, 56, 30), (150, 98, 52), (196, 140, 80)
HONEY = (222, 168, 96)
PAPER, PAPER_D = (246, 232, 204), (226, 204, 164)
GOLD, GOLD_L = (240, 186, 64), (255, 226, 140)
INK = (74, 46, 26)
LANTERN = (255, 196, 92)

def C(c, a=255): return tuple(c[:3]) + (a,)

def rr_mask(w, h, r, inset=0):
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle([inset, inset, w - 1 - inset, h - 1 - inset], r, fill=255)
    return m

def vgrad(w, h, top, bot):
    g = Image.new('RGBA', (w, h))
    d = ImageDraw.Draw(g)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)) + (255,))
    return g

def grain(img, seed, col, n=40, alpha=40, horiz=True):
    random.seed(seed)
    w, h = img.size
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for _ in range(n):
        y0 = random.uniform(0, h); amp = random.uniform(2, 8) * SS / 4; ph = random.uniform(0, 6)
        pts = [(x, y0 + amp * math.sin(x / (w / random.uniform(1, 3)) + ph)) for x in range(0, w + 8, 8)]
        d.line(pts, fill=C(col, random.randint(alpha // 2, alpha)), width=max(1, SS // 2))
    if not horiz: lay = lay.rotate(90, expand=True).resize(img.size)
    return Image.alpha_composite(img, lay)

def paste_masked(dst, src, mask, xy=(0, 0)):
    s = src.copy(); a = ImageChops.multiply(s.getchannel('A'), mask); s.putalpha(a)
    dst.alpha_composite(s, xy)

def glow(size, box, r, col, blur, alpha=200, width=None):
    lay = Image.new('RGBA', size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    if width: d.rounded_rectangle(box, r, outline=C(col, alpha), width=width)
    else: d.rounded_rectangle(box, r, fill=C(col, alpha))
    return lay.filter(ImageFilter.GaussianBlur(blur))

def down(img, w, h): return img.resize((w, h), Image.LANCZOS)

def save12(img, name, w, h):
    down(img, w, h).save(f'{SP}/{name}.png')
    down(img, w * 2, h * 2).save(f'{SP}/{name}@2x.png')

def wood_card(w, h, r, seed, lit=True):
    """wood frame + inner panel. Returns RGBA at SS scale."""
    W, H, R = w * SS, h * SS, r * SS
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    frame = grain(vgrad(W, H, WOOD_L, WOOD_M), seed, WOOD_D, 30, 60)
    paste_masked(img, frame, rr_mask(W, H, R))
    b = 6 * SS
    inner = grain(vgrad(W, H, HONEY if lit else PAPER, WOOD_L if lit else PAPER_D), seed + 1, WOOD_M if lit else PAPER_D, 22, 50 if lit else 30)
    paste_masked(img, inner, rr_mask(W, H, R - b // 2, b))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([b, b, W - 1 - b, H - 1 - b], R - b // 2, outline=C(WOOD_D, 160), width=SS)  # inner bevel line
    d.rounded_rectangle([SS // 2, SS // 2, W - 1 - SS // 2, H - 1 - SS // 2], R, outline=C(WOOD_D), width=SS)  # outer line
    d.line([(R, 2 * SS), (W - R, 2 * SS)], fill=C(GOLD_L, 110), width=SS)  # top highlight
    return img

def seal(sz):
    """gold 'done' seal, a disc with a check and a rim (no text). Non-red; see DECIDE."""
    S = sz * SS
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.ellipse([SS, SS, S - SS, S - SS], fill=C(GOLD), outline=C(INK), width=SS)
    d.ellipse([3 * SS, 3 * SS, S - 3 * SS, S - 3 * SS], outline=C(GOLD_L), width=SS)
    d.line([(S * .3, S * .52), (S * .45, S * .67), (S * .72, S * .36)], fill=C(INK), width=int(2.2 * SS), joint='curve')
    return img

def lantern(w, h):
    W, H = w * SS, h * SS  # glow stays inside: body drawn in the middle 70%
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(gl).ellipse([W * .18, H * .3, W * .82, H * .85], fill=C(LANTERN, 150))
    img.alpha_composite(gl.filter(ImageFilter.GaussianBlur(W / 10)))
    d = ImageDraw.Draw(img)
    cx = W / 2
    d.line([(cx, 0), (cx, H * .16)], fill=C(INK), width=SS)
    d.rounded_rectangle([W * .3, H * .14, W * .7, H * .24], SS, fill=C(WOOD_D))
    d.rounded_rectangle([W * .24, H * .24, W * .76, H * .80], 4 * SS, fill=C((255, 220, 140)), outline=C(WOOD_D), width=SS)
    d.ellipse([W * .38, H * .40, W * .62, H * .68], fill=C((255, 248, 210)))
    for x in (W * .42, W * .58): d.line([(x, H * .26), (x, H * .78)], fill=C(WOOD_M, 150), width=max(1, SS // 2))
    d.rounded_rectangle([W * .3, H * .80, W * .7, H * .90], SS, fill=C(WOOD_D))
    return img

def soft_outline(icon, size):
    """not-yet icon: the same icon as a warm sepia ghost, 30% alpha, with a soft warm edge (not grey)."""
    ic = icon.resize((size * SS, size * SS), Image.LANCZOS)
    a = ic.getchannel('A')
    lum = ic.convert('L')
    sep = Image.merge('RGB', [lum.point(lambda v: int(90 + v * .55)), lum.point(lambda v: int(55 + v * .45)), lum.point(lambda v: int(25 + v * .3))]).convert('RGBA')
    sep.putalpha(a.point(lambda v: int(v * 0.30)))
    return sep

def icon_at(path, size):
    return Image.open(path).convert('RGBA').resize((size * SS, size * SS), Image.LANCZOS)

# ---------- A2 cubby ----------
def cubby(state, icon_path=None, w=112, h=112):
    W, H = w * SS, h * SS
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    if state == 'earned':
        img.alpha_composite(glow((W, H), [3 * SS, 3 * SS, W - 3 * SS, H - 3 * SS], 12 * SS, GOLD, 3 * SS, 170))
        img.alpha_composite(wood_card(w - 4, h - 4, 12, 7, True), (2 * SS, 2 * SS))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([9 * SS, 9 * SS, W - 9 * SS, H - 9 * SS], 8 * SS, outline=C(GOLD_L, 200), width=SS)
    else:
        W2 = (w - 4) * SS
        card = Image.new('RGBA', (W2, W2), (0, 0, 0, 0))
        paste_masked(card, grain(vgrad(W2, W2, (250, 240, 216), PAPER), 3, PAPER_D, 20, 40), rr_mask(W2, W2, 12 * SS))
        d = ImageDraw.Draw(card)
        d.rounded_rectangle([SS, SS, W2 - SS, W2 - SS], 12 * SS, outline=C(WOOD_L), width=2 * SS)
        # dashed inner 'waiting' line, warm
        inset, r = 8 * SS, 8 * SS
        for i in range(8 * SS + inset, W2 - inset - r, 7 * SS):
            for (a, b) in [((i, inset), (i + 3 * SS, inset)), ((i, W2 - inset), (i + 3 * SS, W2 - inset)),
                           ((inset, i), (inset, i + 3 * SS)), ((W2 - inset, i), (W2 - inset, i + 3 * SS))]:
                d.line([a, b], fill=C(WOOD_L, 170), width=SS)
        img.alpha_composite(card, (2 * SS, 2 * SS))
    return img

def cubby_example(state, icon_path, lamp=False):
    img = cubby(state)
    W = img.size[0]
    if state == 'earned':
        ic = icon_at(icon_path, 64); img.alpha_composite(ic, ((W - ic.size[0]) // 2, 9 * SS))
        img.alpha_composite(seal(24), (W - 31 * SS, 7 * SS))
    else:
        ic = soft_outline(Image.open(icon_path).convert('RGBA'), 64); img.alpha_composite(ic, ((W - ic.size[0]) // 2, 9 * SS))
        if lamp: img.alpha_composite(lantern(24, 32), (W - 31 * SS, 5 * SS))
    return img

# ---------- A6 slot card ----------
def slot_card(selected, w=140, h=132):
    pad = 8
    W, H = (w + 2 * pad) * SS, (h + 2 * pad) * SS
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    box = [pad * SS, pad * SS, W - pad * SS, H - pad * SS]
    if selected:
        img.alpha_composite(glow((W, H), box, 14 * SS, GOLD, 4 * SS, 230))
    card = wood_card(w, h, 14, 11, selected)
    if not selected:  # normal: paper face inside the wood frame
        b = 6 * SS
        face = grain(vgrad(w * SS, h * SS, (250, 240, 216), PAPER_D), 12, PAPER_D, 18, 30)
        paste_masked(card, face, rr_mask(w * SS, h * SS, 11 * SS, b))
        ImageDraw.Draw(card).rounded_rectangle([b, b, w * SS - 1 - b, h * SS - 1 - b], 11 * SS, outline=C(WOOD_D, 160), width=SS)
    img.alpha_composite(card, (pad * SS, pad * SS))
    d = ImageDraw.Draw(img)
    # icon well (round, 72) at top centre; the icon (64) sits on top in game
    cx, cy, r = W / 2, (pad + 44) * SS, 33 * SS
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=C(PAPER if selected else (255, 248, 230)), outline=C(GOLD if selected else WOOD_L), width=2 * SS)
    if selected:
        d.rounded_rectangle([box[0] + 2 * SS, box[1] + 2 * SS, box[2] - 2 * SS, box[3] - 2 * SS], 13 * SS, outline=C(GOLD_L), width=2 * SS)
    return img, pad

# ---------- A1 panel frame ----------
def panel_frame(w=192, h=192, corner=48):
    W, H = w * SS, h * SS
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    paste_masked(img, grain(vgrad(W, H, WOOD_L, WOOD_M), 21, WOOD_D, 60, 70), rr_mask(W, H, 18 * SS))
    b = 14 * SS
    inner = grain(vgrad(W, H, (248, 236, 210), PAPER), 22, PAPER_D, 30, 35)
    paste_masked(img, inner, rr_mask(W, H, 10 * SS, b))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([SS, SS, W - SS, H - SS], 18 * SS, outline=C(WOOD_D), width=2 * SS)
    d.rounded_rectangle([b, b, W - b, H - b], 10 * SS, outline=C(WOOD_D, 200), width=SS)
    d.rounded_rectangle([5 * SS, 5 * SS, W - 5 * SS, H - 5 * SS], 14 * SS, outline=C(GOLD_L, 90), width=SS)
    # corner pegs (brass), inside the 48 px corners only
    for (x, y) in [(9, 9), (w - 9, 9), (9, h - 9), (w - 9, h - 9)]:
        d.ellipse([(x - 3.5) * SS, (y - 3.5) * SS, (x + 3.5) * SS, (y + 3.5) * SS], fill=C(GOLD), outline=C(INK), width=SS)
    return img

# ---------- A3 belt ribbon (neutral layers) ----------
NEUTRAL = (236, 236, 236)
def knot_layers(sz=40):
    """returns dict of neutral layers at SS scale: band (tint), rim (dark, fixed), sheen (white),
    stripe (neutral, tint = stripe colour), outline (not-yet paper outline, warm)."""
    S = sz * SS
    L = {k: Image.new('RGBA', (S, S), (0, 0, 0, 0)) for k in ('band', 'rim', 'sheen', 'stripe', 'outline')}
    def shape(d, fill=None, outline=None, wd=0):
        d.rounded_rectangle([S * .02, S * .30, S * .98, S * .52], S * .1, fill=fill, outline=outline, width=wd)  # belt band
        d.polygon([(S * .42, S * .50), (S * .14, S * .86), (S * .30, S * .94), (S * .52, S * .60)], fill=fill, outline=outline, width=wd)  # tail L
        d.polygon([(S * .58, S * .50), (S * .86, S * .86), (S * .70, S * .94), (S * .48, S * .60)], fill=fill, outline=outline, width=wd)  # tail R
        d.ellipse([S * .32, S * .20, S * .68, S * .62], fill=fill, outline=outline, width=wd)  # knot
    shape(ImageDraw.Draw(L['band']), fill=C(NEUTRAL))
    shape(ImageDraw.Draw(L['rim']), outline=C((46, 42, 58)), wd=int(1.5 * SS))
    shape(ImageDraw.Draw(L['outline']), fill=C(PAPER, 200), outline=C(WOOD_L), wd=int(1.5 * SS))
    ds = ImageDraw.Draw(L['sheen'])
    ds.line([(S * .08, S * .35), (S * .30, S * .35)], fill=(255, 255, 255, 150), width=SS)
    ds.line([(S * .70, S * .35), (S * .92, S * .35)], fill=(255, 255, 255, 150), width=SS)
    ds.arc([S * .38, S * .25, S * .62, S * .50], 200, 300, fill=(255, 255, 255, 170), width=SS)
    dt = ImageDraw.Draw(L['stripe'])  # stripe mark on the tails
    dt.polygon([(S * .24, S * .73), (S * .19, S * .80), (S * .29, S * .86), (S * .34, S * .78)], fill=C(NEUTRAL))
    dt.polygon([(S * .76, S * .73), (S * .81, S * .80), (S * .71, S * .86), (S * .66, S * .78)], fill=C(NEUTRAL))
    return L

def ribbon_band(w=320, h=40):
    """neutral rope/ribbon behind the knots (tint optional; default = plain wood-paper)."""
    W, H = w * SS, h * SS
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, H * .42, W, H * .58], H * .08, fill=C(NEUTRAL), outline=C((46, 42, 58)), width=SS)
    return img

def tint(layer, hexcol):
    col = tuple(int(hexcol[i:i + 2], 16) for i in (1, 3, 5))
    solid = Image.new('RGBA', layer.size, col + (255,))
    out = ImageChops.multiply(layer, solid); out.putalpha(layer.getchannel('A')); return out

def knot_composite(L, style, current=False):
    S = L['band'].size[0]
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    if style is None:
        img.alpha_composite(L['outline']); return img
    if current:
        g = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        ImageDraw.Draw(g).ellipse([S * .1, S * .15, S * .9, S * .95], fill=C(GOLD_L, 200))
        img.alpha_composite(g.filter(ImageFilter.GaussianBlur(S / 10)))
    img.alpha_composite(tint(L['band'], style['belt']))
    img.alpha_composite(L['sheen']); img.alpha_composite(L['rim'])
    return img

def main():
    os.makedirs(SP, exist_ok=True); os.makedirs(PV, exist_ok=True)
    styles = json.load(open('incoming-art/player-character/sprites/player.json'))['beltStyles']
    ic_earned, ic_not, ic_stance = f'{ICONS}/icon-strong-block.png', f'{ICONS}/icon-sweep.png', f'{ICONS}/icon-wind-step.png'
    # A2
    save12(cubby('earned'), 'cubby-earned', 112, 112)
    save12(cubby('notyet'), 'cubby-notyet', 112, 112)
    save12(seal(24), 'cubby-seal', 24, 24)
    save12(lantern(24, 32), 'cubby-lantern', 24, 32)
    ex_e, ex_n, ex_x = cubby_example('earned', ic_earned), cubby_example('notyet', ic_not), cubby_example('notyet', ic_not, True)
    save12(ex_e, 'example-cubby-earned', 112, 112); save12(ex_n, 'example-cubby-notyet', 112, 112); save12(ex_x, 'example-cubby-next', 112, 112)
    # A6
    sel, pad = slot_card(True); nor, _ = slot_card(False)
    save12(sel, 'slot-card-selected', 156, 148); save12(nor, 'slot-card-normal', 156, 148)
    # A1
    pf = panel_frame(); save12(pf, 'panel-frame-9slice', 192, 192)
    # A3
    L = knot_layers()
    for k, v in L.items(): save12(v, f'belt-knot-{k}', 40, 40)
    rb = ribbon_band(); save12(rb, 'belt-ribbon-band', 320, 40)
    # previews
    big = 3
    for n, im, w, h in [('cubby-pair', None, 0, 0)]:
        pass
    pair = Image.new('RGBA', (3 * 112 * big + 4 * 24, 112 * big + 48), C(WOOD_D))
    for i, im in enumerate([ex_e, ex_x, ex_n]): pair.alpha_composite(down(im, 112 * big, 112 * big), (24 + i * (112 * big + 24), 24))
    pair.convert('RGB').save(f'{PV}/cubby-earned-next-notyet-3x.png')
    cards = Image.new('RGBA', (2 * 156 * big + 72, 148 * big + 48), C(WOOD_D))
    for i, im in enumerate([nor, sel]):
        c = im.copy(); ic = icon_at(ic_stance, 64); c.alpha_composite(ic, ((c.size[0] - ic.size[0]) // 2, (pad + 12) * SS))
        cards.alpha_composite(down(c, 156 * big, 148 * big), (24 + i * (156 * big + 24), 24))
    cards.convert('RGB').save(f'{PV}/slot-card-normal-vs-selected-3x.png')
    mock(styles, L, pf, ex_e, (ex_n, ex_x), sel, nor, pad, ic_stance)

def nine(src, w, h, c=48):
    """9-slice the SS-scale frame to w x h (1x) at SS scale."""
    s = src; S = s.size[0]; cc = c * SS; W, H = w * SS, h * SS
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    xs = [(0, cc, 0, cc), (cc, S - cc, cc, W - cc), (S - cc, S, W - cc, W)]
    for sx0, sx1, dx0, dx1 in xs:
        for sy0, sy1, dy0, dy1 in [(0, cc, 0, cc), (cc, S - cc, cc, H - cc), (S - cc, S, H - cc, H)]:
            out.alpha_composite(s.crop((sx0, sy0, sx1, sy1)).resize((dx1 - dx0, dy1 - dy0), Image.LANCZOS), (dx0, dy0))
    return out

def font(sz, bold=True):
    for p in ['/usr/share/fonts/truetype/sand-box/google/Nunito[wght].ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(p):
            f = ImageFont.truetype(p, sz)
            try: f.set_variation_by_name('Bold' if bold else 'Regular')
            except Exception: pass
            return f
    return ImageFont.load_default()

def mock(styles, L, pf, ex_e, ex_n, sel, nor, pad, ic_stance):
    """phone landscape mock at real size (1x = CSS px). Placeholder text only."""
    for (PW, PH, tag) in [(932, 430, 'large-932x430'), (667, 375, 'small-667x375')]:
        for scale in (1, 2):
            s = scale
            img = Image.new('RGBA', (PW * s, PH * s), C((58, 38, 24)))
            img = grain(img, 5, (40, 26, 16), 50, 60)
            d = ImageDraw.Draw(img)
            # left column (shell, kept from P-MENU) - placeholder block
            lw = min(300, int(PW * .38))
            d.rounded_rectangle([8 * s, 8 * s, (lw - 8) * s, (PH - 8) * s], 12 * s, fill=C((40, 27, 18)), outline=C(WOOD_M, 120), width=s)
            d.text((20 * s, 20 * s), 'Left column (unchanged)', font=font(12 * s, False), fill=C(PAPER_D))
            # tabs 34 tall
            x0 = lw + 4; tx = x0
            for i, t in enumerate(['Last run', 'Abilities', 'Gear', 'Gate']):
                tw = 92 if PW > 800 else 74
                on = i == 1
                d.rounded_rectangle([tx * s, 8 * s, (tx + tw) * s, 42 * s], 9 * s, fill=C(HONEY if on else WOOD_M), outline=C(WOOD_D), width=s)
                d.text(((tx + tw / 2) * s, 25 * s), t, font=font(14 * s), fill=C(INK if on else PAPER), anchor='mm')
                tx += tw + 4
            # panel
            px, py, pw, ph = x0, 48, PW - x0 - 8, PH - 48 - 8
            frame = down(nine(pf, pw, ph), pw * s, ph * s); img.alpha_composite(frame, (px * s, py * s))
            # belt ribbon across the top inside the frame
            order = ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Red', 'Red/Black', 'Brown', 'Brown/Black', 'Black']
            n = len(order); kz = 40
            avail = pw - 40
            step = min(kz + 6, avail / n)
            ksz = int(min(kz, step))
            rx0 = px + (pw - step * (n - 1) - ksz) / 2
            ry = py + 16
            band = down(ribbon_band(int(step * (n - 1) + ksz), ksz), int((step * (n - 1) + ksz) * s), ksz * s)
            img.alpha_composite(tint(band, '#d9b47a'), (int(rx0 * s), int(ry * s)))
            for i, name in enumerate(order):
                st = styles[name] if i < 3 else None
                k = knot_composite(L, st, current=(i == 2))
                img.alpha_composite(down(k, ksz * s, ksz * s), (int((rx0 + i * step) * s), int(ry * s)))
            # cubbies: 112 on large, 96 on small; 2 shelf rows; names are game text (placeholder here)
            cz = 112 if PW > 800 else 96
            k = cz / 112
            cy = ry + ksz + 8
            card_w, card_h = 140, 132
            sx = px + pw - 18 - card_w
            ncol = int((sx - 14 - (px + 18)) // (cz + 8))
            gx = px + 18
            rows = [[('e', 'Strong Block'), ('e', 'Name'), ('n', None)][:ncol], [('e', 'Name'), ('n', None), ('n', None)][:ncol]]
            lamp_used = False  # lantern only on the next cubby to learn
            for r, row in enumerate(rows):
                yy = cy + r * (cz + 8)
                d.line([(gx - 4) * s, (yy + cz + 3) * s, (gx + ncol * (cz + 8) - 4) * s, (yy + cz + 3) * s], fill=C(WOOD_M), width=3 * s)  # shelf
                for i, (st, label) in enumerate(row):
                    first_n = st == 'n' and not lamp_used
                    if first_n: lamp_used = True
                    im = ex_e if st == 'e' else (ex_n[1] if first_n else ex_n[0])
                    xx = gx + i * (cz + 8)
                    img.alpha_composite(down(im, cz * s, cz * s), (int(xx * s), int(yy * s)))
                    if st == 'e':
                        d.text(((xx + cz / 2) * s, (yy + 94 * k) * s), label, font=font(12 * s), fill=C(INK), anchor='mm')
                    else:
                        d.multiline_text(((xx + cz / 2) * s, (yy + 92 * k) * s), 'Learn this\nat the dojo', font=font(12 * s), fill=C(WOOD_D), anchor='mm', align='center', spacing=0)
            # slot cards: Stance (selected) + Virtue (normal)
            for j, (im, slot) in enumerate([(sel, 'Stance'), (nor, 'Virtue')][:2 if PW > 800 else 1]):
                sy = cy + j * (card_h + 12)
                c = im.copy(); ic = icon_at(ic_stance, 64); c.alpha_composite(ic, ((c.size[0] - ic.size[0]) // 2, (pad + 12) * SS))
                img.alpha_composite(down(c, (card_w + 2 * pad) * s, (card_h + 2 * pad) * s), (int((sx - pad) * s), int((sy - pad) * s)))
                cx2 = (sx + card_w / 2) * s
                d.text((cx2, (sy + 84) * s), slot, font=font(12 * s, False), fill=C(INK), anchor='mm')
                d.text((cx2, (sy + 101) * s), "Item name", font=font(17 * s), fill=C(INK), anchor='mm')
                d.text((cx2, (sy + 117) * s), "Effect line", font=font(14 * s, False), fill=C(INK), anchor='mm')
            img.convert('RGB').save(f'{PV}/phone-mock-{tag}' + ('@2x' if s == 2 else '') + '.png')

if __name__ == '__main__':
    main()
