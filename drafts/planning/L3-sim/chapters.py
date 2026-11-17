# L3-S check: (1) classes needed for each Gate light on every belt, (2) the chapter tags each tier's rooms get.
import json, glob, math, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
belts = json.load(open(f'{ROOT}/fixtures/1-white-belt-new.json'))['school']['belts']
PER_WEEK = 2  # decisions.md, Jay 2026-10-07: 2 classes a week
out = ['| Tier | Belt | Classes before test | Classes per light (classes only) | Weeks per light | Chapter 5 opens at (classes only) | Target | Pass |', '|---|---|---|---|---|---|---|---|']
for i, b in enumerate(belts[:10]):
    cbt = b['classesBeforeTest']
    lights = [math.ceil(k * cbt / 5) for k in range(1, 5)]
    gaps = [lights[0]] + [lights[k] - lights[k - 1] for k in range(1, 4)]
    wk = max(gaps) / PER_WEEK
    pct = lights[3] / cbt
    gap_ok = wk <= 4
    pct_ok = 0.70 <= pct <= 0.85
    out.append(f"| {i+1} | {b['name']} | {cbt} | {', '.join(map(str, lights))} | {wk:g} | {pct:.0%} | gap 4 weeks or less; ch5 70-85% | {'pass' if gap_ok and pct_ok else ('FAIL gap' if not gap_ok else 'FAIL %')} |")
open('lights.md', 'w').write('\n'.join(out) + '\n')

rooms = [json.load(open(p)) for p in sorted(glob.glob(f'{ROOT}/content/rooms/*.json'))]
rooms = [r for r in rooms if 'kind' in r and not r.get('tutorial')]  # training-room.json is not a Tower room
def er(r): return r.get('earliestRoom') or 1
def pool(tier):
    open_ = [r for r in rooms if (r.get('minBeltTier') or 1) <= tier]
    own = [r for r in open_ if r.get('floorSet') and (r.get('minBeltTier') or 1) == tier]
    return own if own else [r for r in open_ if not r.get('floorSet')]
def tag(battles):
    b = sorted(battles, key=lambda r: er(r))  # stable: file order breaks ties
    n = len(b)
    if n == 4: groups = [2, 1, 0, 0, 1]
    else:
        last = 2; c1 = 4; c2 = (n - c1 - last + 1) // 2; c3 = n - c1 - last - c2
        groups = [c1, c2, c3, 0, last]
    t, i = {}, 0
    for ch, g in enumerate(groups, 1):
        for r in b[i:i + g]: t[r['id']] = ch
        i += g
    return t
rows = ['| Tier | Chapter 1 | Chapter 2 | Chapter 3 | Chapter 4 | Chapter 5 | Ch1 has a room-1 battle |', '|---|---|---|---|---|---|---|']
for tier in (1, 2, 3):
    p = pool(tier)
    t = tag([r for r in p if r['kind'] == 'battle'])
    for r in p:
        if r['kind'] == 'challenge': t[r['id']] = 4
    cols = {c: [k for k, v in t.items() if v == c] for c in range(1, 6)}
    extra = {2: ['Bell Room twist'], 3: ['Lantern Dark twist'], 4: ['Slippery Floor twist']}
    ok = any(er(r) <= 1 for r in p if r['kind'] == 'battle' and t.get(r['id']) == 1)
    cell = lambda c: ', '.join([f'`{x}`' for x in cols[c]] + extra.get(c, []))
    rows.append(f"| {tier} | {cell(1)} + treasure, rest, Guardian | {cell(2)} | {cell(3)} | {cell(4)} | {cell(5)} | {'yes' if ok else 'NO'} |")
open('tags.md', 'w').write('\n'.join(rows) + '\n')
print(open('lights.md').read()); print(open('tags.md').read())

# Option B (checked, not proposed): a light every 8 classes (4 weeks), capped at 4 lights.
alt = ['| Tier | Belt | Classes before test | Lights at (every 8 classes) | Weeks per light | Chapter 5 opens at | Pass (ch5 70-85%) |', '|---|---|---|---|---|---|---|']
for i, b in enumerate(belts[:10]):
    cbt = b['classesBeforeTest']
    lights = [8 * k for k in range(1, 5) if 8 * k <= cbt]
    pct = (lights[3] / cbt) if len(lights) == 4 else None
    alt.append(f"| {i+1} | {b['name']} | {cbt} | {', '.join(map(str, lights))} | 4 | {f'{pct:.0%}' if pct else 'never from classes'} | {'pass' if pct and 0.70 <= pct <= 0.85 else 'FAIL'} |")
open('lights-every-8.md', 'w').write('\n'.join(alt) + '\n')
print(open('lights-every-8.md').read())
