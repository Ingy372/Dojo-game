#!/usr/bin/env python3
"""SHOP-BAL-01: items per run by belt for each bot, and belt 3 against belts 2 and 4 (the 2x rule).
Input: the rows written by R-SHOP-sim (drafts/planning/R-SHOP-sim/zz-coins.test.ts.txt), one file per drop table.
Usage: python3 drafts/content/tools/shop-bal-01-ratios.py live=/tmp/coins-live.json draft=/tmp/coins-b3.json [--json out.json]
Several seed sets for one table: name=a.json,b.json,c.json. Each file is printed as name@file, then a range block gives the lowest and
highest b3/b2 and b3/b4 per cell across the files, and a PASS or FAIL for the lowest and highest.
Rule: belt 3 items per run within 2x of belt 2 and of belt 4 (ratio from 0.5 to 2.0), for every bot, on Guided and Standard.
Challenge is locked before belt 4, so it is shown for information and left out of pass or fail."""
import json, sys, collections, statistics as st
args = [a for a in sys.argv[1:] if not a.startswith('--')]
out = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
if out: args = [a for a in args if a != out]
res = {}; fails = {}
groups = {}
exp = []
for a in args:
    name, paths = a.split('=', 1)
    ps = paths.split(',')
    for path in ps:
        full = name if len(ps) == 1 else f'{name}@{path.rsplit("/", 1)[-1]}'
        exp.append((full, path))
        if len(ps) > 1: groups.setdefault(name, []).append(full)
for name, path in exp:
    g = collections.defaultdict(list)
    for r in json.load(open(path)): g[(r['diff'], r['bot'], r['tier'])].append(len(r['loot']))
    res[name] = {}; fails[name] = []
    print(f'== {name}  (items per run, mean of {len(next(iter(g.values())))} seeds)')
    print(f'{"diff":9} {"bot":8} ' + ' '.join(f'B{t:<4}' for t in range(1, 11)) + '  b3/b2  b3/b4  rule')
    for d in ('guided', 'standard', 'challenge'):
        for b in ('kid', 'newer', 'careful'):
            row = [st.mean(g[(d, b, t)]) for t in range(1, 11)]
            r2, r4 = row[2] / row[1], row[2] / row[3]
            ok = all(0.5 <= x <= 2.0 for x in (r2, r4))
            info = d == 'challenge'
            if not ok and not info: fails[name].append(f'{d}/{b}: b3/b2 {r2:.2f}, b3/b4 {r4:.2f}')
            res[name][f'{d}/{b}'] = {'itemsPerRun': [round(x, 2) for x in row], 'b3_over_b2': round(r2, 3), 'b3_over_b4': round(r4, 3), 'pass': ok, 'informationOnly': info}
            print(f'{d:9} {b:8} ' + ' '.join(f'{x:5.1f}' for x in row) + f'  {r2:5.2f}  {r4:5.2f}  ' + ('PASS' if ok else 'FAIL') + (' (info)' if info else ''))
    print('RESULT:', 'PASS' if not fails[name] else 'FAIL ' + '; '.join(fails[name]))
for name, members in groups.items():
    print(f'== {name}  range over {len(members)} seed sets: lowest to highest')
    print(f'{"diff":9} {"bot":8}  b3/b2 range     b3/b4 range     rule')
    bad = []
    for cell in res[members[0]]:
        r2 = [res[m][cell]['b3_over_b2'] for m in members]; r4 = [res[m][cell]['b3_over_b4'] for m in members]
        ok = min(r2 + r4) >= 0.5 and max(r2 + r4) <= 2.0; info = res[members[0]][cell]['informationOnly']
        if not ok and not info: bad.append(cell)
        d, b = cell.split('/')
        print(f'{d:9} {b:8}  {min(r2):.2f} to {max(r2):.2f}    {min(r4):.2f} to {max(r4):.2f}    ' + ('PASS' if ok else 'FAIL') + (' (info)' if info else ''))
        res.setdefault(name + '@range', {})[cell] = {'b3_over_b2': [min(r2), max(r2)], 'b3_over_b4': [min(r4), max(r4)], 'pass': ok, 'informationOnly': info}
    print('RANGE RESULT:', 'PASS' if not bad else 'FAIL ' + ', '.join(bad))
    if bad: fails[name + '@range'] = bad
if out: json.dump(res, open(out, 'w'), indent=1)
if any(fails.values()): raise SystemExit(1)
