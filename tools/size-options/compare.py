"""Side-by-side look for the download size options (Nov 26).

Usage:  python tools/size-options/compare.py <folder measure.py wrote> <output png>
Takes one hero frame and one monster frame, and shows each option enlarged 3x with smooth scaling,
about how a phone draws them in a fight (half-size pages are enlarged 6x, since they have half the pixels).
"""
import json, os, sys
from PIL import Image, ImageDraw

ART = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'art')
SHOW = [('staff-hannah', None), ('player-a-outfit-crimson-dragon', None), ('enemies-t1', 0)]
OPTS = [('now', 'Today'), ('q90', 'Option A (q90)'), ('q80', 'Option B (q80)'), ('half', 'Option C (half size)')]
ZOOM = 3


def page_path(folder, opt, name):
    if opt == 'now':
        return os.path.join(ART, name)
    return os.path.join(folder, opt, os.path.splitext(name)[0] + '.webp')


def main():
    folder, out = sys.argv[1], sys.argv[2]
    rows = []
    for pack, fid in SHOW:
        data = json.load(open(os.path.join(ART, pack + '.json')))
        if fid is None:
            # The frame with the most visible pixels among the first 40 (a whole, front-facing picture).
            def filled(i):
                pg, fx, fy, fw, fh = data['frames'][i][:5]
                im = Image.open(os.path.join(ART, data['pages'][pg])).convert('RGBA').crop((fx, fy, fx + fw, fy + fh))
                return sum(1 for a in im.getchannel('A').tobytes() if a > 128)
            fid = max(range(min(40, len(data['frames']))), key=filled)
        page, x, y, w, h = data['frames'][fid][:5]
        name = data['pages'][page]
        cells = []
        for opt, _ in OPTS:
            im = Image.open(page_path(folder, opt, name)).convert('RGBA')
            k = 0.5 if opt == 'half' else 1
            crop = im.crop((int(x * k), int(y * k), int((x + w) * k), int((y + h) * k)))
            crop = crop.resize((w * ZOOM, h * ZOOM), Image.BILINEAR)
            bg = Image.new('RGBA', crop.size, (201, 184, 143, 255))
            bg.alpha_composite(crop)
            cells.append(bg)
        rows.append(cells)
    pad, label = 12, 22
    cw = max(c.width for r in rows for c in r)
    rh = [max(c.height for c in r) for r in rows]
    sheet = Image.new('RGB', (len(OPTS) * (cw + pad) + pad, label + sum(rh) + pad * (len(rows) + 1)), (20, 18, 28))
    d = ImageDraw.Draw(sheet)
    for i, (_, title) in enumerate(OPTS):
        d.text((pad + i * (cw + pad), 6), title, fill=(255, 246, 224))
    yy = label + pad
    for r, h in zip(rows, rh):
        for i, c in enumerate(r):
            sheet.paste(c, (pad + i * (cw + pad), yy))
        yy += h + pad
    sheet.save(out, optimize=True)


if __name__ == '__main__':
    main()
