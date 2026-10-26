# Q-PREM-COLOR: pixel checks on the shots color-verify.mjs wrote (see boxes.json). Prints PASS/FAIL rows.
import json
from collections import Counter
from PIL import Image
def lum(c):
    v = [x / 255 for x in c]; v = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in v]
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
def con(a, b):
    x, y = sorted([lum(a), lum(b)], reverse=True); return (x + 0.05) / (y + 0.05)
GREEN = (0x27, 0x7a, 0x56); OLD = (0x3a, 0xa5, 0x7a)
rows = []
def check(w, what, ok, info=''): rows.append(f"{'PASS' if ok else 'FAIL'}  {w}  {what}" + (f"  ({info})" if info else ''))
for r in json.load(open('boxes.json')):
    w = r['where']; check(w, 'Reduced motion read back', r['rmNow'] == r['rm'], r['rmNow'])
    check(w, 'no page errors', not r['errs'], '; '.join(r['errs'])[:120])
    for f, fr in r['frames'].items():
        wf = f"{w} {f}"
        if not fr.get('label'): check(wf, 'green button label found', False); continue
        im = Image.open(fr['file']).convert('RGB'); s = im.width / r['W']; L = fr['label']; Z = fr['zone']
        box = [int(L['l'] * s), int(L['t'] * s), int(L['r'] * s), int(L['b'] * s)]
        px = [im.getpixel((x, y)) for x in range(box[0], box[2]) for y in range(box[1], box[3])]
        bg = Counter(px).most_common(1)[0][0]; fg = max(px, key=lambda p: con(p, bg)); c = con(fg, bg)
        near = lambda a, b, t=8: all(abs(i - j) <= t for i, j in zip(a, b))
        inside = 0 <= L['l'] and L['r'] <= r['W'] and 0 <= L['t'] and L['b'] <= r['H']
        check(wf, 'label on screen, not clipped', inside, f"{L['l']:.0f},{L['t']:.0f}-{L['r']:.0f},{L['b']:.0f}")
        check(wf, 'label text >= 12 px', fr['size'] >= 12, f"{fr['size']}px")
        if Z: check(wf, 'tap >= 44x44', Z['r'] - Z['l'] >= 44 and Z['b'] - Z['t'] >= 44, f"{Z['r'] - Z['l']:.0f}x{Z['b'] - Z['t']:.0f}")
        else: check(wf, 'tap zone found', False)
        if Z: check(wf, 'label >= 8 px inside its button', min(L['l'] - Z['l'], Z['r'] - L['r']) >= 8, f"{min(L['l'] - Z['l'], Z['r'] - L['r']):.0f}")
        if f == 'end':
            tol = 14 if r['name'] == 'dash' else 8  # DASH is drawn slightly see-through over the floor
            check(wf, 'button fill is GREEN #277a56 (pixel)', near(bg, GREEN, tol), '#%02x%02x%02x' % bg)
            check(wf, 'old #3aa57a not on the button', not near(bg, OLD, 4))
            check(wf, 'label contrast >= 4.5:1 (pixels)', c >= 4.5, f"{c:.2f}:1 #%02x%02x%02x on #%02x%02x%02x" % (fg + bg))
        else: check(wf, 'frame recorded (colour and contrast are checked on the settled end frame)', True, f"alpha {fr['alpha']:.2f}, {c:.2f}:1 #%02x%02x%02x on #%02x%02x%02x" % (fg + bg))
    if r['tap'] != 'n/a':
        ok = {'create': 'Create' not in r['tap'].split(','), 'rest': r['tap'] == '1', 'title': r['tap'] == 'note closed'}[r['name']]
        check(w, 'hands-on tap works', ok, r['tap'])
print('\n'.join(rows)); print(f"{sum(x.startswith('PASS') for x in rows)} PASS, {sum(x.startswith('FAIL') for x in rows)} FAIL")
