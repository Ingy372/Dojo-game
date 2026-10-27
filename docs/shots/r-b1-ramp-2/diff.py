# R-B1-RAMP-2: pixel-diff each copy's room art against its original's; writes results.txt and one contact sheet per size.
import json, glob, os
from PIL import Image, ImageChops, ImageDraw
D = os.path.dirname(os.path.abspath(__file__)); out = []; fails = 0; sheets = {}
for f in sorted(glob.glob(f'{D}/pairs-*.jsonl')):
    for line in open(f):
        p = json.loads(line); a = Image.open(p['a']).convert('RGB'); b = Image.open(p['b']).convert('RGB')
        bbox = ImageChops.difference(a, b).getbbox(); n = 0 if bbox is None else sum(1 for px in ImageChops.difference(a, b).getdata() if max(px) > 0)
        ok = p['gotCopy'] == p['copy'] and p['gotOrig'] == p['orig'] and n == 0 and not p['errs']
        fails += not ok; out.append(f"{'PASS' if ok else 'FAIL'} {p['tag']} {p['copy']} vs {p['orig']} diffPixels={n} rooms={p['gotCopy']}/{p['gotOrig']} errs={len(p['errs'])}")
        sheets.setdefault(p['tag'].split('-')[0], []).append((p['tag'], p['copy'], a, b))
for size, rows in sheets.items():
    rows = [r for r in rows if r[0].endswith('rmoff')] or rows; w = 240; h = int(rows[0][2].height * w / rows[0][2].width)
    s = Image.new('RGB', (2 * w + 10, len(rows) * (h + 18)), 'white'); d = ImageDraw.Draw(s)
    for i, (t, c, a, b) in enumerate(rows):
        y = i * (h + 18); d.text((2, y), f'{c} | {c[2:]}', fill='black'); s.paste(a.resize((w, h)), (0, y + 14)); s.paste(b.resize((w, h)), (w + 10, y + 14))
    s.save(f'{D}/sheet-{size}.png')
out.append(f'TOTAL {len(out)} pairs, {len(out) - fails} pass, {fails} fail'); open(f'{D}/results.txt', 'w').write('\n'.join(out) + '\n'); print(out[-1])
