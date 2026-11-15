#!/usr/bin/env python3
"""LP-P1 coin model (local, not game code). Applies the [PROPOSED] first-stage rates to rows measured by
lp-p1-coins-sim.ts on today's sim. Usage: python3 lp-p1-coins.py /tmp/lp-coins.json > table.md"""
import json, sys, collections, statistics as st

# ---- Targets, fixed BEFORE any numbers were computed [PROPOSED] ----
FLOOR = 60            # T1 every live cell pays at least this a run (win or lose)
SPREAD = 2.0          # T1 highest live cell / lowest live cell <= 2x; neighbouring belts <= 2x
FIRST = (1, 3)        # T2 the cheapest Stage 1 item (200) takes 1-3 runs of play coins alone
DEAREST_MAX = 12      # T3 the dearest Stage 1 item (800) takes at most 12 runs of play coins alone
OWN_WEEKS = (12, 40)  # T4 owning all of Stage 1 takes 12-40 weeks at the planning pace (runs + classes)
CLASS_SHARE = (0.20, 0.40)  # T5 Class Chests are 20-40% of a week's coins for the Standard kid at the planning pace
STAR_MAX = 0.15       # T6 at the level cap, Star Chests add at most 15% to a run's coins

# ---- Planning pace (not measured from kids) ----
RUNS_WEEK = 8         # PROGRESSION.typicalRunsPerWeek (config.ts)
CLASSES_WEEK = 2      # decisions.md line 195 (Jay, 2026-10-07)
RUN_XP = 110          # PROGRESSION.typicalRunXp (config.ts)

# ---- Proposed rates ----
RUN_BASE, FIGHT, BOSS, WIN = 60, 3, 10, 10   # unchanged from R-SHOP: any finished run, per fight room, boss room, win
CLASS_CHEST = 150                            # coins in every Class Chest (L4), one per real class, no end
STAR_CHEST = 100                             # coins in every Star Chest (L2b), plus its sure looks item
STAR_XP = 10 * RUN_XP                        # one Star = about 10 typical runs of XP (matches "last level step <= 10 runs", R-BAL-5)

# ---- Stage 1 shelf (R-SHOP section 3.2 / 8.1; prices unchanged) ----
STAGE1 = [  # group, price, count, opens (belt: count)
    ('Gi dyes', 200, 12, {1: 6, 2: 6}), ('Fun hair dyes', 200, 8, {1: 4, 2: 4}), ('Dash puffs', 200, 4, {1: 4}),
    ('Wall paint', 400, 6, {1: 3, 2: 3}), ('Walk trails', 400, 10, {1: 3, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1}),
    ('Hit pops', 800, 8, {2: 1, 3: 2, 4: 2, 5: 2, 6: 1}), ('Victory bursts', 800, 6, {2: 1, 3: 1, 4: 1, 5: 1, 6: 2})]
TOTAL = sum(p * n for _, p, n, _ in STAGE1); COUNT = sum(n for _, _, n, _ in STAGE1)
assert all(sum(o.values()) == n for _, _, n, o in STAGE1)
CHEAP, DEAR = min(p for _, p, _, _ in STAGE1), max(p for _, p, _, _ in STAGE1)

DIFFS, BOTS, BELTS = ['guided', 'standard', 'challenge'], ['kid', 'newer', 'careful', 'masher'], range(1, 11)
locked = lambda d, t: d == 'challenge' and t < 4   # Challenge opens at the 4th belt [CODE]

def play(x):
    return RUN_BASE + sum(BOSS if c == 'boss' else FIGHT if c in ('battle', 'challenge') else 0 for c in x['cleared']) + (WIN if x['won'] else 0)
def xp(x):
    room = {'battle': 12, 'challenge': 16, 'treasure': 4, 'rest': 4, 'boss': 40, 'practice': 0}  # PROGRESSION.xpPerRoom
    return sum(room.get(c, 0) for c in x['cleared']) + (20 if x['won'] else 0)

rows = json.load(open(sys.argv[1] if len(sys.argv) > 1 else '/tmp/lp-coins.json'))
g = collections.defaultdict(list)
for x in rows: g[(x['diff'], x['bot'], x['tier'])].append(x)
cell = {k: dict(play=st.mean(map(play, v)), win=st.mean(x['won'] for x in v), xp=st.mean(map(xp, v)), n=len(v),
                mins=st.mean(x['ticks'] for x in v) / 20 / 60) for k, v in g.items()}
for c in cell.values():
    c['star'] = STAR_CHEST * c['xp'] / STAR_XP                 # Star coins per run, only once at the cap
    c['week'] = RUNS_WEEK * c['play'] + CLASSES_WEEK * CLASS_CHEST
    c['own'] = TOTAL / c['week']

print(f'## LP-P1 balance table\n\nStage 1: {COUNT} items, {TOTAL:,} coins. Planning pace: {RUNS_WEEK} runs and {CLASSES_WEEK} classes a week. '
      f'Rates: run {RUN_BASE} + {FIGHT}/fight room + {BOSS} boss + {WIN} win; Class Chest {CLASS_CHEST}; Star Chest {STAR_CHEST} per {STAR_XP} XP. '
      f'Mean of {cell[("standard","kid",1)]["n"]} seeds per cell. * = Challenge locked before belt 4 (information only).\n')
print('| Belt | Diff | Bot | Win % | Play coins/run | Runs: 200 item | Runs: 800 item | Star coins/run at cap | Week (8 runs + 2 classes) | Class share | Weeks to own Stage 1 | Pass |')
print('|---|---|---|---|---|---|---|---|---|---|---|---|')
fails = []
for t in BELTS:
    for d in DIFFS:
        for b in BOTS:
            c = cell[(d, b, t)]; p = c['play']
            checks = {'T1': p >= FLOOR, 'T2': FIRST[0] <= CHEAP / p <= FIRST[1], 'T3': DEAR / p <= DEAREST_MAX,
                      'T4': OWN_WEEKS[0] <= c['own'] <= OWN_WEEKS[1], 'T6': c['star'] / p <= STAR_MAX}
            bad = [k for k, ok in checks.items() if not ok]
            if bad and not locked(d, t): fails.append((t, d, b, bad))
            share = CLASSES_WEEK * CLASS_CHEST / c['week']
            print(f'| {t} | {d}{"*" if locked(d, t) else ""} | {b} | {100 * c["win"]:.0f} | {p:.0f} | {CHEAP / p:.1f} | {DEAR / p:.1f} | {c["star"]:.1f} | {c["week"]:.0f} | {100 * share:.0f}% | {c["own"]:.1f} | {"PASS" if not bad else "FAIL " + ",".join(bad)} |')

live = {k: v for k, v in cell.items() if not locked(k[0], k[2])}
pl = {k: v['play'] for k, v in live.items()}
lo, hi = min(pl, key=pl.get), max(pl, key=pl.get)
nb = max((max(pl[(d, b, t)] / pl[(d, b, t + 1)], pl[(d, b, t + 1)] / pl[(d, b, t)]), d, b, t)
         for d in DIFFS for b in BOTS for t in range(1, 10) if (d, b, t) in pl and (d, b, t + 1) in pl)
sk = cell[('standard', 'kid', 1)]
share_sk = [CLASSES_WEEK * CLASS_CHEST / cell[('standard', 'kid', t)]['week'] for t in BELTS]
t5 = all(CLASS_SHARE[0] <= s <= CLASS_SHARE[1] for s in share_sk)
print(f'\n**Summary.** Lowest live cell {lo} = {pl[lo]:.0f} coins a run; highest {hi} = {pl[hi]:.0f}; ratio {pl[hi] / pl[lo]:.2f} (T1 target <= {SPREAD}: {"PASS" if pl[hi] / pl[lo] <= SPREAD else "FAIL"}).')
print(f'Biggest neighbour-belt jump x{nb[0]:.2f} ({nb[1]}, {nb[2]}, belt {nb[3]} to {nb[3] + 1}) (target <= {SPREAD}: {"PASS" if nb[0] <= SPREAD else "FAIL"}).')
print(f'Class share for the Standard kid, belts 1-10: {100 * min(share_sk):.0f}% to {100 * max(share_sk):.0f}% (T5 target {int(100 * CLASS_SHARE[0])}-{int(100 * CLASS_SHARE[1])}%: {"PASS" if t5 else "FAIL"}).')
ow = {k: v['own'] for k, v in live.items()}
print(f'Weeks to own Stage 1: fastest {min(ow.values()):.1f}, slowest {max(ow.values()):.1f} (T4 target {OWN_WEEKS[0]}-{OWN_WEEKS[1]}).')
print(f'Live cells failing any check: {len(fails)}' + (''.join(f'\n- belt {t} {d} {b}: {",".join(bad)}' for t, d, b, bad in fails)))

print('\n## Pace check (how often kids play changes everything; Standard kid at belt 1)\n\n| Runs a week | Classes a week | Coins a week | Class share | Weeks to own Stage 1 |\n|---|---|---|---|---|')
for rw in (4, 8, 12):
    for cw in (1, 2, 3):
        wk = rw * sk['play'] + cw * CLASS_CHEST
        print(f'| {rw} | {cw} | {wk:.0f} | {100 * cw * CLASS_CHEST / wk:.0f}% | {TOTAL / wk:.1f} |')

print('\n## Stage 1 shelf by belt\n\n| Belt | Items that open | Coins that open | Cumulative coins |\n|---|---|---|---|')
cum = 0
for t in range(1, 7):
    n = sum(o.get(t, 0) for _, _, _, o in STAGE1); v = sum(p * o.get(t, 0) for _, p, _, o in STAGE1); cum += v
    print(f'| {t} | {n} | {v:,} | {cum:,} |')
