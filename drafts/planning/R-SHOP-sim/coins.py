#!/usr/bin/env python3
"""R-SHOP coin model (local, not game code). The game sim has NO coins. This script applies the [PROPOSED] rules below to
rows measured by zz-coins.test.ts (rooms cleared and gear found, per run). Usage: python3 coins.py /tmp/coins.json > table.md"""
import json, sys, collections, statistics as st

RUN_BASE, FIGHT, BOSS, WIN = 60, 3, 10, 10                  # coins: any finished run (win or lose), per fight room cleared, boss room, run cleared
LADDER = {'common': 1, 'uncommon': 2, 'rare': 5, 'epic': 12}  # sell price at belt 1
TOP = 1.5                                                     # belt 10 pays x1.5
BANDS = [('S', 200), ('M', 400), ('L', 800), ('XL', 1600), ('Showpiece', 3200)]  # catalog price bands, each 2x the one before
DIFFS, BOTS = ['guided', 'standard', 'challenge'], ['kid', 'newer', 'careful']

def mult(t): return 1 + (TOP - 1) * (t - 1) / 9
def sell(r, t): return max(1, int(LADDER[r] * mult(t) + 0.5))
def play(x):
    return RUN_BASE + sum(BOSS if c.startswith('boss') else FIGHT if c.split(':')[0] in ('battle', 'challenge') else 0 for c in x['cleared']) + (WIN if x['won'] else 0)
def sold(x): return sum(sell(r, x['tier']) for r in x['loot'])

rows = json.load(open(sys.argv[1] if len(sys.argv) > 1 else '/tmp/coins.json'))
g = collections.defaultdict(list)
for x in rows: g[(x['diff'], x['bot'], x['tier'])].append(x)
cell = {k: (st.mean(map(play, v)), st.mean(map(sold, v)), st.mean(x['won'] for x in v), st.mean(len(x['loot']) for x in v)) for k, v in g.items()}
locked = lambda d, t: d == 'challenge' and t < 4   # Challenge opens at the 4th belt [CODE]

print('## Sell prices (coins)\n\n| Rarity | ' + ' | '.join(f'B{t}' for t in range(1, 11)) + ' |\n|---|' + '---|' * 10)
for r in LADDER: print(f'| {r} | ' + ' | '.join(str(sell(r, t)) for t in range(1, 11)) + ' |')

print('\n## Coins per run and runs to afford (mean of 100 seeds per cell; selling every item found; * = Challenge locked before belt 4, informational)\n')
print('| Belt | Diff | Bot | Win % | Items/run | Play coins | Sell coins | Total | Runs: S 200 | M 400 | L 800 | XL 1600 | Showpiece 3200 | Pass |')
print('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
fails = 0
for t in range(1, 11):
    for d in DIFFS:
        for b in BOTS:
            p, s, w, n = cell[(d, b, t)]
            tot = p + s
            ok = p >= 60 and tot <= 200 and 1 <= BANDS[0][1] / tot <= 3 and BANDS[4][1] / tot <= 40  # targets: always paid, S takes 1-3 runs, Showpiece at most 40 runs
            runs = ' | '.join(f'{v / tot:.1f}' for _, v in BANDS)
            star = '*' if locked(d, t) else ''
            print(f'| {t} | {d}{star} | {b} | {100 * w:.0f} | {n:.1f} | {p:.0f} | {s:.0f} | {tot:.0f} | {runs} | {"PASS" if ok else "FAIL"} |')
            fails += (not ok) and not locked(d, t)

live = {k: v for k, v in cell.items() if not locked(k[0], k[2])}
tot = {k: v[0] + v[1] for k, v in live.items()}
lo, hi = min(tot, key=tot.get), max(tot, key=tot.get)
nb = max((max(tot[(d, b, t)] / tot[(d, b, t + 1)], tot[(d, b, t + 1)] / tot[(d, b, t)]), d, b, t) for d in DIFFS for b in BOTS for t in range(1, 10) if (d, b, t) in tot and (d, b, t + 1) in tot)
print(f'\nLowest live cell: {lo} = {tot[lo]:.0f} coins/run. Highest: {hi} = {tot[hi]:.0f}. Ratio {tot[hi] / tot[lo]:.2f}.')
print(f'Biggest neighbour-belt jump: x{nb[0]:.2f} ({nb[1]}, {nb[2]}, belt {nb[3]} to {nb[3] + 1}).')
print(f'Biggest sell share of a cell: {100 * max(v[1] / (v[0] + v[1]) for v in live.values()):.0f}%. Play-only floor (sell nothing): {min(v[0] for v in live.values()):.0f} coins/run.')
print(f'Cells outside target (live): {fails}')
