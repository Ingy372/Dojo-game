"""L8-A1 build: stage ring overlays (stages 2-4), the Lock group B base medallion, the hold ring, and the previews.
Run from anywhere: python3 incoming-art/lock-stages-l8/source/build_l8.py   (Pillow + numpy only)."""
import os, sys, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); L8 = os.path.dirname(HERE); ART = os.path.dirname(L8)
sys.path.insert(0, HERE)
from lock_wrist import lock_wrist, LOCK_RIM

SPR = os.path.join(L8, 'sprites'); PV = os.path.join(L8, 'preview')
for d in (SPR, os.path.join(SPR, 'stage-rings'), os.path.join(SPR, 'medallions'), os.path.join(SPR, 'hold-ring'), PV):
    os.makedirs(d, exist_ok=True)
INK = (58, 40, 34, 255)
# stage rings: pearl silver, never gold or yellow (gold/yellow is GREAT!, the dizzy stars and the warning cue)
SILVER, SILVER_S, SILVER_H = (172, 184, 208), (118, 130, 160), (246, 249, 255)
PEARL, PEARL_S = (252, 253, 255), (196, 204, 228)
# hold ring: a pale tint of the Lock indigo, with a dark indigo outline so it reads on the dark shadow creatures
HOLD, HOLD_H, HOLD_INK = (148, 160, 255), (228, 232, 255), (30, 32, 90)
SS = 4   # supersample


def ring(d, cx, cy, r0, r1, col):
    """an annulus drawn as a thick circle line, so it never erases what is already under it"""
    d.ellipse([cx - r1, cy - r1, cx + r1, cy + r1], outline=col, width=max(1, int(round(r1 - r0))))   # PIL draws the width inward


def stage_ring(stage, px=256):
    """drawn BEHIND the family medallion (same canvas, same centre). The medallion covers r < ~101.6 px at @2x,
    so only the outer band shows, and nothing on the medallion (fists, feet) is ever covered."""
    S = px * SS / 256; c = px * SS / 2
    im = Image.new('RGBA', (px * SS, px * SS), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    R0, R1 = 92 * S, 117 * S
    ring(d, c, c, R0 - 3 * S, R1 + 3 * S, INK)                                       # ink outline
    ring(d, c, c, R0, R1, SILVER + (255,))
    ring(d, c, c, R1 - 2.5 * S, R1, SILVER_H + (255,))                                  # thin outer shine
    ring(d, c, c, 102 * S, 106 * S, SILVER_S + (255,))                                  # shade just outside the medallion
    if stage >= 4:   # 8 short pearl points between the pearls, outside the band
        for i in range(8):
            a = math.pi / 8 + i * math.pi / 4 - math.pi / 2
            def pt(r, da): return (c + r * S * math.cos(a + da), c + r * S * math.sin(a + da))
            d.polygon([pt(127.5, 0), pt(114, -.17), pt(114, .17)], fill=INK)
            d.polygon([pt(124, 0), pt(116, -.12), pt(116, .12)], fill=PEARL + (255,))
    if stage >= 3:   # pearls on the band: 4 at stage 3, 8 at stage 4
        n = 4 if stage == 3 else 8
        for i in range(n):
            a = -math.pi / 2 + i * 2 * math.pi / n
            x, y = c + 109 * S * math.cos(a), c + 109 * S * math.sin(a); r = 9.5 * S
            d.ellipse([x - r - 2.5 * S, y - r - 2.5 * S, x + r + 2.5 * S, y + r + 2.5 * S], fill=INK)
            d.ellipse([x - r, y - r, x + r, y + r], fill=PEARL_S + (255,))
            d.ellipse([x - r, y - r, x + r * .55, y + r * .55], fill=PEARL + (255,))
            d.ellipse([x - r * .55, y - r * .6, x - r * .05, y - r * .1], fill=(255, 255, 255, 255))
    return im.resize((px, px), Image.LANCZOS)


def ellipse_pts(cx, cy, rx, ry, n=96):
    return [(cx + rx * math.cos(2 * math.pi * i / n), cy + ry * math.sin(2 * math.pi * i / n)) for i in range(n)]


def hold_ring(t, w=192, h=96):
    """@2x master, 80 px per tile at 1x. Centre = the enemy's feet point. t in [0,1): pulse phase (0 = the static frame).
    Returns (back, front): back is the far half (drawn behind the enemy), front the near half."""
    k = 0.5 - 0.5 * math.cos(2 * math.pi * t)        # 0 -> 1 -> 0
    W, H = w * SS, h * SS; cx, cy = W / 2, H / 2
    rx, ry = 0.40 * W, 0.40 * W * 0.42                  # ground ellipse (35 degree camera)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    th = 9 * SS
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(glow)
    gd.line(ellipse_pts(cx, cy, rx, ry) + [ellipse_pts(cx, cy, rx, ry)[0]], fill=HOLD_H + (int(90 + 80 * k),), width=int(th * 2.6))
    im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(4 * SS)))
    pts = ellipse_pts(cx, cy, rx, ry); pts.append(pts[0])
    d.line(pts, fill=HOLD_INK + (255,), width=int(th + 7 * SS), joint='curve')
    d.line(pts, fill=HOLD + (255,), width=int(th), joint='curve')
    hp = ellipse_pts(cx - 1.2 * SS, cy - 1.2 * SS, rx, ry); hp.append(hp[0])
    d.line(hp, fill=HOLD_H + (255,), width=int(th * .35), joint='curve')
    # four clasps on the ring, pointing in: they close a little on the pulse
    inset = 6 * SS * k
    for ang in (0, math.pi / 2, math.pi, 3 * math.pi / 2):
        ex, ey = cx + rx * math.cos(ang), cy + ry * math.sin(ang)
        ux, uy = -math.cos(ang), -math.sin(ang) * (ry / rx)
        n = math.hypot(ux, uy); ux, uy = ux / n, uy / n; vx, vy = -uy, ux
        L, Wd = 22 * SS, 16 * SS
        bx, by = ex - ux * 6 * SS + ux * inset, ey - uy * 6 * SS + uy * inset
        tip = (bx + ux * L, by + uy * L); a = (bx + vx * Wd, by + vy * Wd); b = (bx - vx * Wd, by - vy * Wd)
        notch = (bx + ux * L * .38, by + uy * L * .38)
        o = 3 * SS
        d.polygon([(tip[0] + ux * o, tip[1] + uy * o), (a[0] + vx * o - ux * o, a[1] + vy * o - uy * o), notch,
                   (b[0] - vx * o - ux * o, b[1] - vy * o - uy * o)], fill=HOLD_INK + (255,))
        d.polygon([tip, a, notch, b], fill=HOLD + (255,))
        d.polygon([tip, a, notch], fill=HOLD_H + (255,))
    im = im.resize((w, h), Image.LANCZOS)
    a = np.array(im); back = a.copy(); front = a.copy()
    back[h // 2:, :, 3] = 0; front[:h // 2, :, 3] = 0
    return Image.fromarray(back), Image.fromarray(front)


# ------------------------------------------------------------------ export
STAGES = {2: 'stage-2', 3: 'stage-3', 4: 'stage-4'}
for s, n in STAGES.items():
    big = stage_ring(s, 256); big.save(os.path.join(SPR, 'stage-rings', f'{n}@2x.png'))
    stage_ring(s, 128).save(os.path.join(SPR, 'stage-rings', f'{n}.png'))
lw = lock_wrist().resize((256, 256), Image.LANCZOS)
# match the PB-07 export: the 256 file has a 16 px margin, the 128 file 8 px
def pb07(img, px):
    inner = img.resize((px - 2 * (px // 16), px - 2 * (px // 16)), Image.LANCZOS)
    out = Image.new('RGBA', (px, px), (0, 0, 0, 0)); out.alpha_composite(inner, (px // 16, px // 16)); return out
# check the PB-07 medallion edge first so the new one sits exactly like the others
ref = np.array(Image.open(os.path.join(ART, 'icons-slots', 'sprites', 'counter@2x.png')))
pb07(lw, 256).save(os.path.join(SPR, 'medallions', 'lock-wrist@2x.png')); pb07(lw, 128).save(os.path.join(SPR, 'medallions', 'lock-wrist.png'))
N = 6; FPS = 8
for half in ('back', 'front'):
    for sc, suf in ((1, ''), (2, '@2x')):
        sheet = Image.new('RGBA', (96 * sc * N, 48 * sc), (0, 0, 0, 0))
        for i in range(N):
            b, f = hold_ring(i / N, 192, 96)
            fr = (b if half == 'back' else f).resize((96 * sc, 48 * sc), Image.LANCZOS)
            sheet.alpha_composite(fr, (i * 96 * sc, 0))
            if i == 0: fr.save(os.path.join(SPR, 'hold-ring', f'hold-ring-{half}-static{suf}.png'))
        sheet.save(os.path.join(SPR, 'hold-ring', f'hold-ring-{half}{suf}.png'))
json.dump({
    'kind': 'L8-A1 art (not imported)',
    'stageRings': {'files': {f'stage{s}': f'stage-rings/{n}.png' for s, n in STAGES.items()}, 'size': [128, 128], 'at2x': '<name>@2x.png 256 x 256',
                   'anchorPx': [64, 64], 'drawOrder': 'BEHIND the family medallion: stage ring first, then the medallion on top, same centre and size',
                   'stage1': 'no ring (the plain medallion)', 'stageFromRank': {'1': 1, '3': 2, '6': 3, '9': 4},
                   'usedBy': 'every family; the ring is shared, not tinted'},
    'medallions': {'lock-wrist': {'file': 'medallions/lock-wrist.png', 'size': [128, 128], 'at2x': 'lock-wrist@2x.png', 'anchorPx': [64, 64],
                                  'family': 'lock-wrist (Lock group B, placeholder name)', 'rim': '#%02x%02x%02x' % LOCK_RIM,
                                  'note': 'Same medallion kit, size and margin as icons-slots (PB-07).'}},
    'holdRing': {'frame': [96, 48], 'at2x': '<name>@2x.png, frames 192 x 48*2', 'frames': N, 'fps': FPS, 'loop': True,
                 'layout': 'one row, frames left to right, no padding', 'anchorPx': [48, 24], 'anchorNote': "the enemy's feet point",
                 'pixelsPerTile': 80, 'ringWidthTiles': 0.8 * 96 / 80,
                 'scaleNote': 'scale so the ring is about 2.6 x the enemy radius wide (radiusInData), e.g. swarmer 0.3 -> 0.78 tiles',
                 'drawOrder': 'hold-ring-back, then the enemy, then hold-ring-front',
                 'reducedMotion': 'hold-ring-back-static.png + hold-ring-front-static.png (no pulse)',
                 'colours': {'fill': '#b0baff', 'outline': '#242860', 'not': 'no gold or yellow: GREAT!, the dizzy stars and the warning cue use those'}},
}, open(os.path.join(SPR, 'l8.json'), 'w'), indent=2)
print('exported')
