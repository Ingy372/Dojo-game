#!/usr/bin/env python3
"""SHOP-BAL-01: items per run by belt for each bot, and belt 3 against belts 2 and 4 (the 2x rule).
Input: the rows written by R-SHOP-sim (drafts/planning/R-SHOP-sim/zz-coins.test.ts.txt), one file per drop table.
Usage: python3 drafts/content/tools/shop-bal-01-ratios.py live=/tmp/coins-live.json draft=/tmp/coins-b3.json [--json out.json]
Rule: belt 3 items per run within 2x of belt 2 and of belt 4 (ratio from 0.5 to 2.0), for every bot, on Guided and Standard.
Challenge is locked before belt 4, so it is shown for information and left out of pass or fail."""
import json, sys, collections, statistics as st
args = [a for a in sys.argv[1:] if not a.startswith('--')]
out = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
if out: args = [a for a in args if a != out]
res = {}; fails = {}
for a in args:
    name, path = a.split('=', 1)
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
if out: json.dump(res, open(out, 'w'), indent=1)
