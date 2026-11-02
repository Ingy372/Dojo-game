#!/usr/bin/env python3
"""R-SHOP coin model (local, not game code). The game sim has NO coins. This script applies the [PROPOSED] rules below to
rows measured by zz-coins.test.ts (rooms cleared and gear found, per run). Usage: python3 coins.py /tmp/coins.json > table.md"""
import json, sys, collections, statistics as st
from catalog import TOTAL, COUNT, shelf, RUNS_PER_MONTH
from contrast import BELT_MONTHS

RUNS_WEEK = 8                                               # PROGRESSION.typicalRunsPerWeek (config.ts), a planning number, not measured from kids
OWN_MIN_WEEKS, OWN_MAX_WEEKS = 52, 156                      # [PROPOSED] targets fixed before the numbers: owning all takes at least a year and at most 3 years, in every live cell

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
print('| Belt | Diff | Bot | Win % | Items/run | Play coins | Sell coins | Total | Runs: S 200 | M 400 | L 800 | XL 1600 | Showpiece 3200 | Own all: runs | Own all: weeks | Pass |')
print('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
fails = 0
for t in range(1, 11):
    for d in DIFFS:
        for b in BOTS:
            p, s, w, n = cell[(d, b, t)]
            tot = p + s
            ok = p >= 60 and tot <= 200 and 1 <= BANDS[0][1] / tot <= 3 and BANDS[4][1] / tot <= 40  # targets: always paid, S takes 1-3 runs, Showpiece at most 40 runs
            own = TOTAL / tot
            ok = ok and (locked(d, t) or OWN_MIN_WEEKS <= own / RUNS_WEEK <= OWN_MAX_WEEKS)
            runs = ' | '.join(f'{v / tot:.1f}' for _, v in BANDS)
            star = '*' if locked(d, t) else ''
            print(f'| {t} | {d}{star} | {b} | {100 * w:.0f} | {n:.1f} | {p:.0f} | {s:.0f} | {tot:.0f} | {runs} | {own:.0f} | {own / RUNS_WEEK:.0f} | {"PASS" if ok else "FAIL"} |')
            fails += (not ok) and not locked(d, t)

live = {k: v for k, v in cell.items() if not locked(k[0], k[2])}
tot = {k: v[0] + v[1] for k, v in live.items()}
lo, hi = min(tot, key=tot.get), max(tot, key=tot.get)
nb = max((max(tot[(d, b, t)] / tot[(d, b, t + 1)], tot[(d, b, t + 1)] / tot[(d, b, t)]), d, b, t) for d in DIFFS for b in BOTS for t in range(1, 10) if (d, b, t) in tot and (d, b, t + 1) in tot)
print(f'\nLowest live cell: {lo} = {tot[lo]:.0f} coins/run. Highest: {hi} = {tot[hi]:.0f}. Ratio {tot[hi] / tot[lo]:.2f}.')
print(f'Biggest neighbour-belt jump: x{nb[0]:.2f} ({nb[1]}, {nb[2]}, belt {nb[3]} to {nb[3] + 1}).')
print(f'Biggest sell share of a cell: {100 * max(v[1] / (v[0] + v[1]) for v in live.values()):.0f}%. Play-only floor (sell nothing): {min(v[0] for v in live.values()):.0f} coins/run.')
print(f'Cells outside target (live): {fails}')

own = {k: TOTAL / v for k, v in tot.items()}
f, sl = max(tot, key=tot.get), min(tot, key=tot.get)
print(f'\n## Own everything ({COUNT} items, {TOTAL:,} coins)\n')
print(f'At {RUNS_WEEK} runs a week (planning figure): fastest live cell {f} = {own[f]:.0f} runs = {own[f] / RUNS_WEEK:.0f} weeks. Slowest live cell {sl} = {own[sl]:.0f} runs = {own[sl] / RUNS_WEEK:.0f} weeks ({own[sl] / RUNS_WEEK / 52:.1f} years).')
print(f'Targets (fixed before the numbers): at least {OWN_MIN_WEEKS} weeks and at most {OWN_MAX_WEEKS} weeks in every live cell.')
print('\n| Runs a week | Fastest cell (weeks) | Standard / kid mean over belts (weeks) | Slowest cell (weeks) |\n|---|---|---|---|')
sk = st.mean(tot[('standard', 'kid', t)] for t in range(1, 11))
for rw in (4, 8, 12): print(f'| {rw} | {own[f] / rw:.0f} | {TOTAL / sk / rw:.0f} | {own[sl] / rw:.0f} |')

print('\n## The journey belt by belt (coins earned in each belt at the planning pace, versus what the shelves hold)\n')
print(f'Runs a month = {RUNS_PER_MONTH:.1f}. Coins in a belt = runs a month x months in rank x coins per run in that belt. Owned = the smaller of coins earned so far and shelf value open so far (spending as soon as something is affordable, ignoring single-item rounding). Fast = best live cell of that belt. Slow = worst live cell. Std kid = Standard difficulty, kid bot.\n')
sh = shelf()
print('| Belt | Months | Std kid coins/run | Fast / slow coins/run | Earned in belt (std kid) | Cumulative earned: std kid | fast | slow | Shelf open (cum) | Owned share: std kid | fast | slow |\n|---|---|---|---|---|---|---|---|---|---|---|---|')
ce = {'std': 0, 'fast': 0, 'slow': 0}; so = 0
for t in range(1, 11):
    live_t = [v for k, v in tot.items() if k[2] == t]
    cpr = {'std': tot[('standard', 'kid', t)], 'fast': max(live_t), 'slow': min(live_t)}
    for k in ce: ce[k] += cpr[k] * RUNS_PER_MONTH * BELT_MONTHS[t - 1]
    so += sh[t][1]
    own_s = {k: min(ce[k], so) / TOTAL for k in ce}
    print(f'| {t} | {BELT_MONTHS[t - 1]} | {cpr["std"]:.0f} | {max(live_t):.0f} / {min(live_t):.0f} | {cpr["std"] * RUNS_PER_MONTH * BELT_MONTHS[t - 1]:,.0f} | {ce["std"]:,.0f} | {ce["fast"]:,.0f} | {ce["slow"]:,.0f} | {so:,} | {100 * own_s["std"]:.0f}% | {100 * own_s["fast"]:.0f}% | {100 * own_s["slow"]:.0f}% |')
months = 0
for k, nm in (('std', 'Standard / kid'), ('fast', 'fastest cell'), ('slow', 'slowest cell')):
    c, m = 0, 0
    for t in range(1, 11):
        live_t = [v for kk, v in tot.items() if kk[2] == t]
        cpr = {'std': tot[('standard', 'kid', t)], 'fast': max(live_t), 'slow': min(live_t)}[k]
        for _ in range(BELT_MONTHS[t - 1]):
            c += cpr * RUNS_PER_MONTH; m += 1
            if c >= TOTAL: break
        if c >= TOTAL: break
    print(f'\n- {nm}: owns everything in month {m} of the 72-month journey (belt {t}) at {RUNS_WEEK} runs a week.', end='')
print()
