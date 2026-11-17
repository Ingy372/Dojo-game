"""L8-A1 previews: stages on several families (large and phone size), the new Lock medallion, the hold ring in a fight at game size."""
import os, json, math
from PIL import Image, ImageDraw, ImageFont, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); L8 = os.path.dirname(HERE); ART = os.path.dirname(L8)
SPR = os.path.join(L8, 'sprites'); PV = os.path.join(L8, 'preview'); IS = os.path.join(ART, 'icons-slots', 'sprites')
def font(sz, bold=True):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
F14, F11, F18 = font(14), font(11), font(18)
BG = (92, 58, 36); PAPER = (244, 234, 210); INKT = (58, 38, 24)
FAM = [('counter', 'Counter'), ('guard', 'Guard'), ('disarm', 'Disarm'), ('lock-wrist', 'Lock (wrist)')]
def med(n, px):
    p = os.path.join(SPR, 'medallions', 'lock-wrist@2x.png') if n == 'lock-wrist' else os.path.join(IS, f'{n}@2x.png')
    return Image.open(p).convert('RGBA').resize((px, px), Image.LANCZOS)
def ring(s, px): return Image.open(os.path.join(SPR, 'stage-rings', f'stage-{s}@2x.png')).convert('RGBA').resize((px, px), Image.LANCZOS)
def staged(n, s, px):
    im = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    if s > 1: im.alpha_composite(ring(s, px))
    im.alpha_composite(med(n, px)); return im
def ctext(d, x, y, t, f, col=INKT): d.text((x - d.textlength(t, font=f) / 2, y), t, font=f, fill=col)

# ---- sheet 1: every family at stages 1-4, large (96 px) and at phone size (48 and 32 px)
W, H = 980, 640
sh = Image.new('RGBA', (W, H), BG + (255,)); d = ImageDraw.Draw(sh)
d.text((20, 14), 'L8-A1  Seal stages: one shared ring behind every medallion', font=F18, fill=(255, 244, 220))
d.rounded_rectangle((16, 46, W - 16, 410), 14, fill=PAPER)
for j, s in enumerate((1, 2, 3, 4)):
    ctext(d, 200 + j * 195, 56, ['Stage 1 (rank 1)', 'Stage 2 (rank 3)', 'Stage 3 (rank 6)', 'Stage 4 (rank 9)'][j], F14)
for i, (n, lab) in enumerate(FAM):
    y = 78 + i * 82
    d.text((28, y + 30), lab, font=F14, fill=INKT)
    for j, s in enumerate((1, 2, 3, 4)):
        sh.alpha_composite(staged(n, s, 80), (160 + j * 195, y))
d.rounded_rectangle((16, 422, W - 16, H - 16), 14, fill=PAPER)
d.text((28, 430), 'PHONE SIZE (real pixels): 48 px and 32 px, as on the loadout and the Book', font=F11, fill=INKT)
for i, (n, lab) in enumerate(FAM):
    x0 = 30 + i * 238
    ctext(d, x0 + 100, 448, lab, F11)
    for j, s in enumerate((1, 2, 3, 4)):
        sh.alpha_composite(staged(n, s, 48), (x0 + j * 50, 466))
        sh.alpha_composite(staged(n, s, 32), (x0 + 8 + j * 50, 528))
    ctext(d, x0 + 100, 572, '1      2      3      4', F11)
g = ImageOps.grayscale(sh.convert('RGB')).convert('RGBA')
sh.save(os.path.join(PV, '01-stages-all-families-1x.png')); g.save(os.path.join(PV, '01-stages-all-families-grey.png'))
sh.resize((W * 2, H * 2), Image.NEAREST).save(os.path.join(PV, '01-stages-all-families-2x.png'))

# ---- sheet 2: the new Lock (wrist) medallion, large, next to the PB-07 set
sh = Image.new('RGBA', (980, 330), BG + (255,)); d = ImageDraw.Draw(sh)
d.text((20, 14), 'L8-A1  Lock group B (wrist locks) base medallion, with the existing set', font=F18, fill=(255, 244, 220))
d.rounded_rectangle((16, 46, 964, 314), 14, fill=PAPER)
for i, (n, lab) in enumerate(FAM):
    x = 40 + i * 230
    sh.alpha_composite(med(n, 200), (x, 56)); ctext(d, x + 100, 262, lab, F14)
ctext(d, 820, 284, 'new (indigo rim = Lock, placeholder)', F11)
sh.save(os.path.join(PV, '02-lock-wrist-medallion.png'))

# ---- sheet 3: the hold ring in a fight at game size (48 px tiles), plus a 3x close-up
TILE = 48; SC = TILE / 80
TR = os.path.join(ART, 'tower-rooms', 'sprites'); SW = os.path.join(ART, 'enemies-tier1', 'swarmer', 'sprites')
SJ = json.load(open(os.path.join(SW, 'swarmer.json')))
def scaled(im, k=SC): return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
def put(cv, im, ax, ay, x, y, k=SC): cv.alpha_composite(scaled(im, k), (round(x - ax * k), round(y - ay * k)))
def tile(n): return Image.open(os.path.join(TR, f'{n}_{n}.png')).convert('RGBA')
def swarmer(cv, x, y, anim, dr, f):
    a = SJ['animations'][anim]; r = SJ['directions'].index(dr)
    for ln in ('body', 'glow', 'light'):
        im = Image.open(os.path.join(SW, a['sheets'][ln])).convert('RGBA').crop((f * 128, r * 128, (f + 1) * 128, (r + 1) * 128))
        put(cv, im, 64, 104.96, x, y)
def hold(cv, half, x, y, frame, radius=0.3):
    sheet = Image.open(os.path.join(SPR, 'hold-ring', f'hold-ring-{half}@2x.png')).convert('RGBA')
    fr = sheet.crop((frame * 192, 0, (frame + 1) * 192, 96))
    want = 2.6 * radius * TILE; k = want / (0.8 * 192)       # ring is 0.8 of the frame width
    put(cv, fr, 96, 48, x, y, k)
def stars(cv, x, y, t):   # the game's dizzy stars (COLORS.gold circles), to check the ring against them
    d = ImageDraw.Draw(cv); r = 0.3 * TILE
    for i in range(3):
        a = t + i * 2 * math.pi / 3; sx, sy = x + math.cos(a) * r * .8, y - 30 - 4 + math.sin(a) * r * .25
        d.ellipse((sx - 3, sy - 3, sx + 3, sy + 3), fill=(255, 209, 102, 255))
def room(w=667, h=375):
    cv = Image.new('RGBA', (w, h), (40, 36, 52, 255)); fl = tile('floor-big'); wf = tile('wall-face')
    for r in range(h // TILE + 2):
        for c in range(w // TILE + 2): put(cv, fl, 0, 0, c * TILE, r * TILE)
    for c in range(w // TILE + 2): put(cv, wf, 0, 104, c * TILE, TILE)
    return cv
cv = room()
spots = [(250, 230, 'held'), (380, 250, 'stagger'), (470, 190, 'idle'), (330, 310, 'held2')]
for x, y, kind in spots:
    if kind.startswith('held'): hold(cv, 'back', x, y, 2 if kind == 'held' else 0)
    swarmer(cv, x, y, 'stagger' if kind != 'idle' else 'idle', 'SW', 3)
    if kind.startswith('held'): hold(cv, 'front', x, y, 2 if kind == 'held' else 0)
    if kind != 'idle': stars(cv, x, y, 0.6 + x)
d = ImageDraw.Draw(cv)
d.rounded_rectangle((8, 6, 470, 26), 8, fill=(20, 18, 28, 220))
d.text((14, 9), 'Game size (667 x 375, 48 px tiles). Held: left and bottom. Stagger only: middle.', font=F11, fill=(255, 248, 230))
cv.save(os.path.join(PV, '03-hold-ring-fight-667x375.png'))
crop = cv.crop((200, 170, 430, 345)).resize((690, 525), Image.NEAREST)
crop.save(os.path.join(PV, '03-hold-ring-fight-3x-closeup.png'))
ImageOps.grayscale(cv.convert('RGB')).save(os.path.join(PV, '03-hold-ring-fight-grey.png'))
# the six pulse frames, large, on a dark floor
fr = Image.new('RGBA', (6 * 200 + 20, 150), (58, 52, 70, 255)); d = ImageDraw.Draw(fr)
sheet = Image.open(os.path.join(SPR, 'hold-ring', 'hold-ring-back@2x.png')); sheetf = Image.open(os.path.join(SPR, 'hold-ring', 'hold-ring-front@2x.png'))
for i in range(6):
    fr.alpha_composite(sheet.crop((i * 192, 0, (i + 1) * 192, 96)), (14 + i * 200, 20)); fr.alpha_composite(sheetf.crop((i * 192, 0, (i + 1) * 192, 96)), (14 + i * 200, 20))
    ctext(d, 110 + i * 200, 124, f'frame {i + 1}' + (' = still (reduced motion)' if i == 0 else ''), F11, (240, 236, 250))
fr.save(os.path.join(PV, '04-hold-ring-frames-2x.png'))
# ---- sheet 5: the four stages large (@2x), so the ring detail can be checked
big = Image.new('RGBA', (4 * 270 + 20, 300), PAPER + (255,)); d = ImageDraw.Draw(big)
for j, st in enumerate((1, 2, 3, 4)):
    big.alpha_composite(staged('lock-wrist', st, 256), (14 + j * 270, 10)); ctext(d, 142 + j * 270, 272, f'Stage {st}', F14)
big.save(os.path.join(PV, '05-stages-large-2x.png'))
print('previews ok')
