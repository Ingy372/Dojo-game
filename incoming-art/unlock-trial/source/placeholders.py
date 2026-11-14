"""PB-15 code-drawn placeholders. Pillow only. No text in any picture.
Sizes are stand-ins until PB-13 sets the real ones.
"""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
INK = (58, 40, 34, 255)
CREAM = (250, 242, 222, 255)
CREAM_D = (226, 210, 176, 255)
WOOD = (196, 140, 80, 255)
WOOD_D = (150, 98, 52, 255)
WALL = (236, 226, 206, 255)
WALL_D = (210, 196, 172, 255)
RIM = (196, 168, 120, 255)  # one flat neutral colour, for the Programmer to tint
PAD = (74, 140, 150, 255)
PAD_D = (48, 96, 108, 255)
GOLD = (232, 196, 120, 255)


def card_frame(px=256):
    """A card with an empty round spot for the technique picture. No letters."""
    im = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    m = int(px * 0.06)
    d.rounded_rectangle([m, m, px - m, px - m], radius=int(px * 0.12), fill=CREAM, outline=INK, width=max(3, px // 40))
    # inner wash so the card has a little depth
    inset = int(px * 0.1)
    d.rounded_rectangle([inset, inset, px - inset, px - inset], radius=int(px * 0.1), outline=CREAM_D, width=max(2, px // 64))
    # empty spot: a hole the game fills with a PB-07 medallion
    r = int(px * 0.28)
    c = px // 2
    d.ellipse([c - r, c - r, c + r, c + r], fill=(0, 0, 0, 0), outline=RIM, width=max(4, px // 28))
    # punch the centre clear so a medallion can sit in it
    hole = Image.new('L', (px, px), 0)
    ImageDraw.Draw(hole).ellipse([c - r + 6, c - r + 6, c + r - 6, c + r - 6], fill=255)
    a = im.split()[-1]
    a.paste(0, mask=hole)
    im.putalpha(a)
    return im


def backdrop(w=640, h=360):
    """A short calm training room. Stand-in size until PB-13."""
    im = Image.new('RGBA', (w, h), WALL)
    d = ImageDraw.Draw(im)
    floor_y = int(h * 0.55)
    d.rectangle([0, floor_y, w, h], fill=WOOD)
    d.rectangle([0, floor_y, w, floor_y + max(3, h // 80)], fill=WOOD_D)
    # a soft light patch on the wall, not a window with words
    d.ellipse([int(w * 0.62), int(h * 0.08), int(w * 0.9), int(h * 0.42)], fill=(248, 240, 220, 255))
    # baseboard
    d.rectangle([0, floor_y - max(4, h // 50), w, floor_y], fill=INK)
    return im


def prop_mat(w=280, h=140):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([4, 4, w - 4, h - 4], radius=16, fill=(232, 214, 180, 255), outline=INK, width=4)
    d.rounded_rectangle([18, 16, w - 18, h - 16], radius=10, outline=WOOD_D, width=3)
    return im


def prop_pad(w=72, h=120):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([4, 4, w - 4, h - 4], radius=14, fill=PAD, outline=INK, width=4)
    d.ellipse([w // 2 - 14, h // 2 - 14, w // 2 + 14, h // 2 + 14], outline=GOLD, width=3)
    return im


def sheet():
    """Left column is empty (no older art). Right column is the new set. No words."""
    card = card_frame(200)
    room = backdrop(360, 200)
    mat = prop_mat(140, 70)
    pad = prop_pad(42, 70)
    # Tall enough that the mat and pad (pasted at y=460, 70 px tall) sit fully inside, with a margin.
    W, H = 860, 580
    im = Image.new('RGB', (W, H), (28, 26, 24))
    d = ImageDraw.Draw(im)
    # empty frames on the left stand for 'none'
    d.rounded_rectangle([30, 30, 250, 250], radius=16, outline=(90, 80, 70), width=2)
    d.rounded_rectangle([30, 280, 410, 490], radius=12, outline=(90, 80, 70), width=2)
    tile = Image.new('RGBA', (200, 200), (28, 26, 24, 255))
    tile.alpha_composite(card)
    im.paste(tile.convert('RGB'), (430, 30))
    im.paste(room.convert('RGB'), (430, 250))
    box = Image.new('RGBA', (140, 70), (28, 26, 24, 255))
    box.alpha_composite(mat)
    im.paste(box.convert('RGB'), (430, 460))
    box = Image.new('RGBA', (42, 70), (28, 26, 24, 255))
    box.alpha_composite(pad)
    im.paste(box.convert('RGB'), (590, 460))
    src = card_frame(128)
    x = 660
    for sz in (40, 36, 30):
        one = src.resize((sz, sz), Image.LANCZOS)
        cell = Image.new('RGBA', (sz, sz), (28, 26, 24, 255))
        cell.alpha_composite(one)
        im.paste(cell.convert('RGB'), (x, 40))
        x += sz + 10
    return im


def main():
    art = os.path.join(ROOT, 'sprites')
    prev = os.path.join(ROOT, 'preview')
    os.makedirs(art, exist_ok=True)
    os.makedirs(prev, exist_ok=True)
    card_frame(256).save(os.path.join(art, 'unlock-card-frame.png'))
    card_frame(512).save(os.path.join(art, 'unlock-card-frame@2x.png'))
    backdrop().save(os.path.join(art, 'trial-backdrop.png'))
    prop_mat().save(os.path.join(art, 'prop-mat.png'))
    prop_pad().save(os.path.join(art, 'prop-pad.png'))
    sheet().save(os.path.join(prev, 'before-after.png'))
    # a strip by itself, still with no words
    strip = Image.new('RGB', (160, 50), (28, 26, 24))
    src = card_frame(128)
    x = 8
    for sz in (40, 36, 30):
        one = src.resize((sz, sz), Image.LANCZOS)
        cell = Image.new('RGBA', (sz, sz), (28, 26, 24, 255))
        cell.alpha_composite(one)
        strip.paste(cell.convert('RGB'), (x, 6))
        x += sz + 8
    strip.save(os.path.join(prev, 'sizes-30-36-40.png'))
    print('wrote placeholders')


if __name__ == '__main__':
    main()
