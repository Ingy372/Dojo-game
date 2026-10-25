#!/usr/bin/env python3
"""R-BAL-12: real training (sign-offs, Training Points, virtue stripes) feeds Power, Health, Guard.
Shows each source's share of combat strength by tier for three students, and the enemy re-scale.
Plain Python 3, no packages, no game code. Run: python3 drafts/planning/r-bal-12-sim.py
Labels: [CODE] from main, [DECIDED] Jay/Manager, [FITTED] chosen to hit a target, [GUESS] needs playtest.
"""
import importlib.util, itertools, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("r9", os.path.join(HERE, "r-bal-9-sim.py"))
r9 = importlib.util.module_from_spec(spec); spec.loader.exec_module(r9)

REQS_PER_BELT = 7          # [CODE] fixtures/*.json requirements (1 kata, 5 self-defense, 1 kick combo)
TP_MIN = 15                # [CODE] config.ts:234 minutesPerPoint
TP_PER_REQ = 4             # [CODE] config.ts:236 upgradesPerAbility -> TP cap = 28 per belt (power.ts:66)
STRIPES_PER_BELT = 2       # [CODE] config.ts:257 stripesPerBelt
# Split of the training budget, from the Power Rating shares .40/.17/.10 (config.ts:248-250) [CODE ratio]
TRAIN_SPLIT = {"signOffs": 0.40 / 0.67, "trainingPoints": 0.17 / 0.67, "virtues": 0.10 / 0.67}
# Each source's stat mix in ln-FS units [GUESS, flavour]: technique -> Power+Health, practice -> Health+Power, character -> Guard
STAT_MIX = {"signOffs": {"power": 0.6, "maxHealth": 0.4}, "trainingPoints": {"power": 0.3, "maxHealth": 0.7},
            "virtues": {"guard": 1.0}}
K_TRAIN = 1.0              # [FITTED] full training at a tier is worth K x (levels + gear at the tier cap)
TIERS = range(1, 11)
RUNS = len(r9.level_timeline(1))   # runs in a 3-month belt for the typical student

# Students [GUESS]: playShare = runs vs typical (8/week); practice = approved home minutes per week.
STUDENTS = {"typical": {"play": 1.0, "practice": 20},
            "trains more, plays less": {"play": 0.5, "practice": 45},
            "plays only (class, no home practice)": {"play": 1.0, "practice": 0}}

def typical_series(trials=200, seed=9):
    """Per-run level and gear for the typical student, all 10 belts back to back."""
    rng = random.Random(seed); lv = []; gear = None
    for t in TIERS: lv += r9.level_timeline(t)
    for _ in range(trials):
        carry = {"power": 0, "maxHealth": 0, "guard": 0, "jade": 0}; g = []
        for t in TIERS:
            s = r9.gear_timeline(t, carry, rng); carry = s[-1]; g += s
        gear = g if gear is None else [{k: a[k] + b[k] for k in a} for a, b in zip(gear, g)]
    return lv, [{k: v / trials for k, v in x.items()} for x in gear]

def budget(t):  # ln-FS that full training at belt t is worth
    return K_TRAIN * (r9.level_value(10 * t) + r9.caps(t)[1])

def ref_stats(t):  # level + full gear at the tier cap: the base the training budget is turned into stats on
    c, _ = r9.caps(t); p, h = r9.lvl_stats(10 * t)
    return (p + c["power"]) * (1 + c["jade"]), h + c["maxHealth"], c["guard"]

def totals(t):
    """Cumulative flat stats from FULL training through belt t, per source."""
    P, H, G = ref_stats(t); B = budget(t); out = {}
    for src, share in TRAIN_SPLIT.items():
        m = STAT_MIX[src]; b = B * share
        out[src] = {"power": P * (math.exp(b * m.get("power", 0)) - 1),
                    "maxHealth": H * (math.exp(b * m.get("maxHealth", 0)) - 1),
                    "guard": (100 + G) * (math.exp(b * m.get("guard", 0)) - 1)}
    return out

def per_unit():
    """Value of ONE sign-off / TP / stripe earned at belt t (difference of cumulative totals)."""
    units = {"signOffs": REQS_PER_BELT, "trainingPoints": REQS_PER_BELT * TP_PER_REQ, "virtues": STRIPES_PER_BELT}
    res = {}
    for t in TIERS:
        now, prev = totals(t), (totals(t - 1) if t > 1 else None)
        res[t] = {s: {k: (now[s][k] - (prev[s][k] if prev else 0)) / units[s] for k in now[s]} for s in now}
    return res
PU = per_unit()

def student_runs(lv_typ, gear_typ, st):
    """Per typical-run time step: level, gear, and training stats for one student."""
    f = st["play"]; e = 0.0; out = []
    for i in range(len(lv_typ)):
        t = i // RUNS + 1; frac = (i % RUNS + 0.5) / RUNS
        prev_cap = 1 if t == 1 else 10 * (t - 1)
        cur = lv_typ[min(int(e), len(lv_typ) - 1)]
        boost = 2 if cur < prev_cap else 1                       # [CODE] catch-up x2 below expected level
        e = min(e + f * boost, i + 1)                            # can't run ahead of the typical student
        L = min(lv_typ[min(int(e), len(lv_typ) - 1)], 10 * t)
        g = gear_typ[min(int(i * f + (i // RUNS) * RUNS * (1 - f) * 0), len(gear_typ) - 1)] if f == 1 else \
            gear_typ[min(int(e), len(gear_typ) - 1)]
        weeks = (i + 0.5) / r9.RUNS_PER_WEEK
        tp = min(int(weeks * st["practice"] / TP_MIN), REQS_PER_BELT * TP_PER_REQ * t)
        tr = {"power": 0.0, "maxHealth": 0.0, "guard": 0.0}
        for b in range(1, t + 1):                                 # earlier belts: all signed (training.ts:163)
            so = REQS_PER_BELT if b < t else min(REQS_PER_BELT, int(frac * REQS_PER_BELT * 1.15))  # [GUESS] all by ~87% of belt
            sp = STRIPES_PER_BELT if b < t else int(frac * 3)     # [GUESS] stripes at months 1 and 2
            tpb = max(0, min(tp - (b - 1) * REQS_PER_BELT * TP_PER_REQ, REQS_PER_BELT * TP_PER_REQ))
            for k in tr:
                tr[k] += so * PU[b]["signOffs"][k] + sp * PU[b]["virtues"][k] + tpb * PU[b]["trainingPoints"][k]
        out.append((t, L, g, tr))
    return out

def lnfs(P, H, G): return math.log(P * H * (1 + G / 100) / (r9.BASE_P * r9.BASE_H))
def shapley(L, g, tr):
    """Fair share of ln-FS growth for levels, gear, training (average over all 6 orders)."""
    def stats(on):
        p, h = r9.lvl_stats(L) if "level" in on else (r9.BASE_P, r9.BASE_H); G = 0; js = 0
        if "gear" in on: p += g["power"]; h += g["maxHealth"]; G += g["guard"]; js = g["jade"]
        if "training" in on: p += tr["power"]; h += tr["maxHealth"]; G += tr["guard"]
        return lnfs(p * (1 + js), h, G)
    names = ["level", "gear", "training"]; sh = dict.fromkeys(names, 0.0)
    for order in itertools.permutations(names):
        on = set()
        for n in order:
            before = stats(on); on.add(n); sh[n] += (stats(on) - before) / 6
    return sh, stats(set(names))

def avg_artist(rows, t):
    rs = [r for r in rows if r[0] == t]; n = len(rs); P = H = G = 0; S = dict.fromkeys(["level", "gear", "training"], 0.0)
    for _, L, g, tr in rs:
        p, h = r9.lvl_stats(L)
        P += (p + g["power"] + tr["power"]) * (1 + g["jade"]) / n; H += (h + g["maxHealth"] + tr["maxHealth"]) / n
        G += (g["guard"] + tr["guard"]) / n
        sh, _ = shapley(L, g, tr); [S.__setitem__(k, S[k] + v / n) for k, v in sh.items()]
    tot = sum(S.values())
    return {"power": P, "health": H, "guard": G}, {k: v / tot for k, v in S.items()}

def main():
    lv, gear = typical_series()
    print("== 1. Value of one piece of real training, by the belt it is earned at (flat stats, adds only) ==")
    print(f"K_TRAIN = {K_TRAIN} [FITTED]; split sign-offs/TP/virtues = " + "/".join(f"{v:.0%}" for v in TRAIN_SPLIT.values()) + " [CODE ratio]")
    print(f"{'belt':>11}  {'sign-off: Power Health':>22}  {'1 TP: Power Health':>19}  {'stripe: Guard':>13}   full belt adds P/H/G")
    for name, t in r9.TIERS.items():
        u = PU[t]; s, p, v = u["signOffs"], u["trainingPoints"], u["virtues"]
        fb = [7 * s[k] + 28 * p[k] + 2 * v[k] for k in ("power", "maxHealth", "guard")]
        print(f"{name:>11}  {s['power']:>10.2f} {s['maxHealth']:>10.1f}  {p['power']:>8.2f} {p['maxHealth']:>9.2f}  {v['guard']:>13.1f}   {fb[0]:.1f}/{fb[1]:.0f}/{fb[2]:.1f}")
    res = {}
    for sname, st in STUDENTS.items():
        rows = student_runs(lv, gear, st); res[sname] = {t: avg_artist(rows, t) for t in TIERS}
    for sname, st in STUDENTS.items():
        print(f"\n== 2. {sname}: runs x{st['play']}, {st['practice']} approved min/week [GUESS] — belt-average Artist and share of strength ==")
        print(f"{'belt':>11} {'Power':>6} {'Health':>6} {'Guard':>5}   training  levels  gear")
        for name, t in r9.TIERS.items():
            a, s = res[sname][t]
            print(f"{name:>11} {a['power']:>6.1f} {a['health']:>6.0f} {a['guard']:>5.1f}   {s['training']:>7.0%} {s['level']:>7.0%} {s['gear']:>5.0%}")
    A9 = r9.expected_artists()
    print("\n== 3. Enemy re-scale vs the #188 expected Artist (typical student), Health x and Power x ==")
    scale = {}
    for name, t in r9.TIERS.items():
        a = res["typical"][t][0]; o = A9[t]
        hx = a["power"] / o["power"]; px = a["health"] * (1 + a["guard"] / 100) / (o["health"] * (1 + o["guard"] / 100))
        scale[t] = (hx, px); print(f"{name:>11}  Health x{hx:.2f}  Power x{px:.2f}")
    print("\n== 4. A mid enemy built for the typical student (5 hits, KO 12), faced by each student, Standard ==")
    print(f"{'belt':>11}  " + "  ".join(f"{s[:24]:>24}" for s in STUDENTS))
    for name, t in r9.TIERS.items():
        typ = res["typical"][t][0]; E = r9.design(typ, 10, 5, 12); cells = []
        for sname in STUDENTS:
            a = res[sname][t][0]; b = r9.check(E, a, r9.ess.BANDS["mid"])
            cells.append(f"beat {b[0]:>2} KO {b[2]:>2} {'in' if r9.ess.BANDS['mid']['hits'][0] <= b[0] <= r9.ess.BANDS['mid']['hits'][1] and b[2] >= 8 else 'OUT'}")
        print(f"{name:>11}  " + "  ".join(f"{c:>24}" for c in cells))

if __name__ == "__main__":
    main()
