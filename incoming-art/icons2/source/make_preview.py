"""Preview for the icons2 samples: a 667x375 phone frame (@2x = 1334x750) showing the icons at their real 64 pt size
on menu2 tray tiles and cubbies, with a 3x close-up strip. Labels here are placeholders; the game draws them."""
import os, json
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..')
M2 = os.path.join(ROOT, 'menu2', 'sprites')
SP = os.path.join(HERE, '..', 'sprites')
PV = os.path.join(HERE, '..', 'preview')
FONT = '/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf'
K = 2
MAN = json.load(open(os.path.join(M2, 'menu2.json')))['sprites']
INK, SOFT, CREAM = (70, 42, 22), (120, 86, 58), (247, 235, 210)


def f(sz):
    ft = ImageFont.truetype(FONT, int(sz * K)); ft.set_variation_by_name('ExtraBold'); return ft


def spr(n):
    return Image.open(os.path.join(M2, MAN[n]['file'].replace('.png', '@2x.png'))).convert('RGBA')


def nine(im, w, h, m):
    t, r, b, l = [v * K for v in m]
    W, H = im.size
    out = Image.new('RGBA', (w, h))
    xs = [(0, l, 0, l), (l, W - r, l, w - r), (W - r, W, w - r, w)]
    ys = [(0, t, 0, t), (t, H - b, t, h - b), (H - b, H, h - b, h)]
    for sx0, sx1, dx0, dx1 in xs:
        for sy0, sy1, dy0, dy1 in ys:
            if sx1 > sx0 and sy1 > sy0 and dx1 > dx0 and dy1 > dy0:
                out.alpha_composite(im.crop((sx0, sy0, sx1, sy1)).resize((dx1 - dx0, dy1 - dy0), Image.LANCZOS), (dx0, dy0))
    return out


def icon(iid):
    return Image.open(os.path.join(SP, f'icon-{iid}-64@2x.png')).convert('RGBA')


ITEMS = [('beginners-stance', 'Forms', "Beginner's Stance"), ('rooted-form', 'Forms', 'Rooted Form'), ('flowing-form', 'Forms', 'Flowing Form'),
         ('follow-up-kick', 'Strikes', 'Follow-up Kick'), ('quick-combo', 'Strikes', 'Quick Combo'),
         ('shield-of-respect', 'Virtues', 'Shield of Respect'), ('second-wind', 'Virtues', 'Second Wind'), ('perfect-discipline', 'Virtues', 'Perfect Discipline')]


def main():
    os.makedirs(PV, exist_ok=True)
    W, H = 667, 375
    img = Image.new('RGBA', (W * K, H * K), (92, 62, 40, 255))
    d = ImageDraw.Draw(img)
    for x in range(0, W * K, 58 * K):
        d.line([(x, 0), (x, H * K)], fill=(66, 42, 24, 255), width=K)
    img.alpha_composite(nine(spr('panel-frame'), (W - 20) * K, (H - 20) * K, MAN['panel-frame']['nineSlice']), (10 * K, 10 * K))
    d.text((W / 2 * K, 36 * K), 'icons2 at phone size (667×375): 64 pt icons, with a 32 pt strip', font=f(13), fill=INK, anchor='mm')
    for i, (iid, grp, nm) in enumerate(ITEMS):
        cx = 60 + (i % 4) * 150 if i < 4 else 60 + (i - 4) * 150 + (0 if i < 8 else 0)
        y = 52 if i < 4 else 160
        img.alpha_composite(icon(iid), (int((cx + 11) * K), int(y * K)))
        d.text(((cx + 43) * K, (y + 74) * K), nm, font=f(10.5), fill=INK, anchor='mm')
        d.text(((cx + 43) * K, (y + 88) * K), grp, font=f(8.5), fill=SOFT, anchor='mm')
    for i, (iid, grp, nm) in enumerate(ITEMS):
        x = 116 + i * 56
        img.alpha_composite(icon(iid).resize((32 * K, 32 * K), Image.LANCZOS), (x * K, 270 * K))
    d.text((W / 2 * K, 314 * K), '32 pt', font=f(9), fill=SOFT, anchor='mm')
    d.text((W / 2 * K, 330 * K), 'Labels are placeholders drawn here for the preview; the game draws them as text.', font=f(9.5), fill=SOFT, anchor='mm')
    img.save(os.path.join(PV, 'icons2-preview-667x375@2x.png'))
    img.resize((W, H), Image.LANCZOS).save(os.path.join(PV, 'icons2-preview-667x375.png'))
    print('ok')


if __name__ == '__main__':
    main()
