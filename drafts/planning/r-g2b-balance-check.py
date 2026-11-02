#!/usr/bin/env python3
"""R-G2B balance check (balance-check skill) for the Green-to-Black enemies and Guardians.

Reads the REAL numbers, never copies them by hand:
  - ENEMY_TRAINING_SCALE and DIFFICULTY from packages/sim/src/config.ts
  - the pinned model-student Artists from packages/sim/test/r-bal-12-artists.ts
  - draft enemy/Guardian base stats from drafts/content/enemies and drafts/content/bosses
  - bands from drafts/planning/enemy-stats-sim.py (small 2-4 hits, mid 5-10, heavy 10-20, boss 40-80)
Same formula as r-bal-12-bands.test.ts: hits-to-beat = ceil(H / damage(artist power, 1, enemy guard)),
knock-out hits = ceil(artist health / damage(enemy power, 1, artist guard)).
Difficulties: Guided (Power x0.75, Health same), Standard, Challenge (x1.5 Health and Power, belt 4 and up only).
Run: python3 drafts/planning/r-g2b-balance-check.py  (add --md for markdown tables)
"""
import json, math, os, re, sys, glob
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
def rd(p): return open(os.path.join(ROOT, p)).read()

cfg = rd("packages/sim/src/config.ts")
blk = cfg[cfg.index("export const ENEMY_TRAINING_SCALE"):]
SCALE = [(float(a), float(b)) for a, b in re.findall(r"maxHealth: ([\d.]+), power: ([\d.]+)", blk[:blk.index("];")])]
assert len(SCALE) == 10
GUIDED_POWER = float(re.search(r"guided: \{[^}]*enemyPowerScale: ([\d.]+)", cfg).group(1))
CHALLENGE = 1.5   # decided D5 (balance-research.md); the bands test uses the same value
CHALLENGE_FROM = int(re.search(r"CHALLENGE_FROM_TIER = (\d+)", cfg).group(1))

art = rd("packages/sim/test/r-bal-12-artists.ts")
ARTISTS = {}
for name, body in re.findall(r"(\w+): \[(.*?)\n  \],", art, re.S):
    ARTISTS[name] = [dict(power=float(p), health=float(h), guard=float(g))
                     for p, h, g in re.findall(r"power: ([\d.]+), health: ([\d.]+), guard: ([\d.]+)", body)]
assert len(ARTISTS) == 3 and all(len(v) == 10 for v in ARTISTS.values())

BANDS = {"small": ((2, 4), 12), "mid": ((5, 10), 8), "heavy": ((10, 20), 5), "boss": ((40, 80), 5)}
ROLE_BAND = {"swarm": "small", "flier": "small", "heavy": "heavy"}   # everything else = mid (enemy-stats-sim.py)
BELTS = ["White", "Yellow", "Orange", "Green", "Blue", "Red", "Red/Black", "Brown", "Brown/Black", "Black"]

def damage(power, strength, guard, bonus=0):
    return max(1, round(power * strength * 100 / (100 + guard) * (1 + bonus)))

def scaled(base, belt):
    h, p = SCALE[belt - 1]
    return max(1, round(base["maxHealth"] * h)), round(base["power"] * p)

def check(base, belt, student, band, health_mult=1.0, elite_health=1.0):
    """Returns beat hits, KO hits, per difficulty."""
    H, P = scaled(base, belt)
    H = H * elite_health
    a = ARTISTS[student][belt - 1]
    d = damage(a["power"], 1, base["guard"])
    out = {}
    for diff, (hm, pm) in {"guided": (1, GUIDED_POWER), "standard": (1, 1), "challenge": (CHALLENGE, CHALLENGE)}.items():
        if diff == "challenge" and belt < CHALLENGE_FROM: continue
        beat = math.ceil(H * hm / d)
        ko = math.ceil(a["health"] / damage(P * pm, 1, a["guard"]))
        out[diff] = (beat, ko)
    return out

def load():
    plan = json.load(open(os.path.join(ROOT, "drafts/content/enemies/bestiary-plan.json")))
    rows = []
    for ti, t in enumerate(plan["tiers"], 1):
        if ti < 4: continue   # tiers 1-3 are live and covered by r-bal-12-bands.test.ts
        for e in t["enemies"]:
            base = json.load(open(os.path.join(ROOT, "drafts/content/enemies", e["id"] + ".json")))
            rows.append((ti, e["id"], e["role"], ROLE_BAND.get(e["role"], "mid"), base))
        g = t["guardian"]; gid = g.get("id")
        base = json.load(open(os.path.join(ROOT, "drafts/content/bosses", gid + ".json")))
        rows.append((ti, gid, "guardian", "boss", base))
    return rows

def evaluate(rows):
    res = []
    for ti, eid, role, bk, base in rows:
        band, komin = BANDS[bk]
        worst = dict(beat_lo=99999, beat_hi=0, ko_lo=99999, fails=[], cells=0)
        per_belt = {}
        for belt in range(ti, 11):
            for st in ARTISTS:
                r = check(base, belt, st, band)
                for diff, (beat, ko) in r.items():
                    worst["cells"] += 1
                    ok_beat = band[0] <= beat <= band[1] if diff != "guided" else True
                    if diff == "guided": ok_beat = beat >= band[0] and beat <= band[1]
                    ok_ko = ko >= komin
                    worst["beat_lo"] = min(worst["beat_lo"], beat); worst["beat_hi"] = max(worst["beat_hi"], beat)
                    worst["ko_lo"] = min(worst["ko_lo"], ko)
                    if not (ok_beat and ok_ko): worst["fails"].append((belt, st, diff, beat, ko))
                    per_belt.setdefault(belt, []).append((st, diff, beat, ko))
        res.append((ti, eid, role, bk, base, worst, per_belt))
    return res

def main():
    md = "--md" in sys.argv
    rows = load(); res = evaluate(rows)
    print(f"Scale rows {len(SCALE)}; Guided power x{GUIDED_POWER}; Challenge x{CHALLENGE} from belt {CHALLENGE_FROM}; students {list(ARTISTS)}")
    print("\n== A. Every new enemy and Guardian, every belt it can appear at, 3 students, Guided/Standard/Challenge ==")
    print("| Tier | Enemy | Class | Base H/P/G | Beat hits (all cells) | Band | Lowest KO hits | Min KO | Cells | Fails |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    for ti, eid, role, bk, base, w, pb in res:
        band, komin = BANDS[bk]
        print(f"| {BELTS[ti-1]} | {eid} | {bk} | {base['maxHealth']}/{base['power']}/{base['guard']} | {w['beat_lo']}-{w['beat_hi']} | {band[0]}-{band[1]} | {w['ko_lo']} | {komin} | {w['cells']} | {len(w['fails'])} |")
    print("\n== B. Failing cells (belt, student, difficulty, beat hits, KO hits) ==")
    n = 0
    for ti, eid, role, bk, base, w, pb in res:
        if w["fails"]:
            n += len(w["fails"])
            by = {}
            for f in w["fails"]: by.setdefault((f[1], f[2]), []).append(f)
            print(f"- {eid} ({bk}): {len(w['fails'])} fails; e.g. " + "; ".join(f"belt {f[0]} {f[1]} {f[2]} beat {f[3]} KO {f[4]}" for f in w["fails"][:4]))
    print(f"TOTAL failing cells: {n}")
    print("\n== C. Hits-to-beat by belt, one representative per class (typical student, Standard) and neighbour jump ==")
    reps = {"small": "pebble-pal", "mid": "cliff-goat", "heavy": "stack-golem", "boss": "stone-giant"}
    print("| Belt | " + " | ".join(f"{k} ({v})" for k, v in reps.items()) + " |")
    print("|---|---|---|---|---|")
    series = {}
    for k, eid in reps.items():
        base = [r for r in rows if r[1] == eid][0][4]
        band, _ = BANDS[k]
        series[k] = [check(base, b, "typical", band)["standard"][0] for b in range(1, 11)]
    for b in range(10):
        print(f"| {BELTS[b]} | " + " | ".join(str(series[k][b]) for k in reps) + " |")
    for k in reps:
        s = series[k]
        jumps = [(BELTS[i], round(s[i] / s[i-1], 2)) for i in range(1, 10) if max(s[i], s[i-1]) / min(s[i], s[i-1]) > 2]
        print(f"jumps over 2x between neighbouring belts for {k}: {jumps or 'none'}")
    print("\n== D. Elites on belts 4-10 (existing swift/guarding x1.25 Health; brute, swarmer, shield) ==")
    for eid, bk in (("brute", "heavy"), ("swarmer", "small"), ("shield", "mid")):
        base = json.load(open(os.path.join(ROOT, "content/enemies", eid + ".json")))
        band, komin = BANDS[bk]; bad = []
        for belt in range(4, 11):
            for st in ARTISTS:
                for diff, (beat, ko) in check(base, belt, st, band, elite_health=1.25).items():
                    if beat > band[1] or beat < band[0] or ko < komin: bad.append((belt, st, diff, beat, ko))
        print(f"{eid} elite: {len(bad)} cells outside band" + (f"; e.g. {bad[:3]}" if bad else ""))
    section_e(res)
    section_f(rows)
    section_g(rows)
    return res

def window(row):
    """Section E: for an enemy with failing cells, the base maxHealth values (power and guard kept) that pass every cell."""
    ti, eid, role, bk, base, w, pb = row
    ok = []
    for h in range(max(1, int(base["maxHealth"] * 0.5)), int(base["maxHealth"] * 1.5)):
        b = dict(base, maxHealth=h); r = evaluate([(ti, eid, role, bk, b)])[0]
        if not r[5]["fails"]: ok.append(h)
    return ok

def section_e(res):
    print("\n== E. Base maxHealth that passes every cell, for each enemy with a failing cell (power and guard kept) ==")
    for row in res:
        if row[5]["fails"]:
            ok = window(row)
            only = all(f[1] == "trainsMore" and f[2] == "challenge" for f in row[5]["fails"])
            print(f"{row[1]}: now {row[4]['maxHealth']}; fails are all trainsMore+Challenge: {only}; passing base maxHealth: " + (f"{min(ok)}-{max(ok)}" if ok else "NONE"))

BASIC_COOLDOWN = 12; PC_STRENGTH = 2.0; PC_STAGGER = 20   # config.ts: basicAttack.cooldownTicks, counter.perfectStrength, perfectStaggerTicks
SPIN_KICK = 2.5                                            # config.ts: strike.strength

def section_f(rows):
    """Spin Kick baseline: Strikes (strength 2.5) needed to beat each class, typical student."""
    print("\n== F. Spin Kick baseline: Spin Kicks to beat (typical student; Standard / Challenge) ==")
    reps = {"small": "pebble-pal", "mid": "cliff-goat", "heavy": "stack-golem", "boss": "stone-giant"}
    print("| Belt | " + " | ".join(f"{k} ({v})" for k, v in reps.items()) + " |")
    print("|---|---|---|---|---|")
    for belt in range(4, 11):
        cells = []
        for k, eid in reps.items():
            base = [r for r in rows if r[1] == eid][0][4]
            H, _ = scaled(base, belt); a = ARTISTS["typical"][belt - 1]
            d = damage(a["power"], SPIN_KICK, base["guard"])
            cells.append(f"{math.ceil(H / d)} / {math.ceil(H * CHALLENGE / d)}")
        print(f"| {BELTS[belt-1]} | " + " | ".join(cells) + " |")

def package(stagger_ticks, bonus=0.0, strength_bonus=0.0):
    """Basic-hit equivalents from ONE Perfect Counter: its own hit plus the free basic hits in the window."""
    free = stagger_ticks // BASIC_COOLDOWN
    return PC_STRENGTH * (1 + strength_bonus) + free * (1 + bonus), free

def section_g(rows):
    """Control windows (Throw, Lock) vs the built Perfect Counter. Durations are the S4 GUESSES, not decided numbers."""
    print("\n== G. One Perfect Counter, in basic-hit equivalents (S4 guess durations; the test bot sets the real ones) ==")
    stages = [
        ("Built today: stagger 20", package(20)),
        ("Lock #17 (20 ticks)", package(20)),
        ("+ #28 Four-Corner Lock (30)", package(30)),
        ("+ #31 Arm Bar Release (40)", package(40)),
        ("+ #40 Master Hold (50)", package(50)),
        ("+ #32 locked take +15% (50)", package(50, 0.15)),
        ("+ Counter #10 staggerBonus +15% too", package(50, 0.30)),
        ("Throw #11 (down 30)", package(30)),
        ("+ #12 downBonus +25% (30)", package(30, 0.25)),
    ]
    base = stages[0][1][0]
    print("| Stage | Free basic hits | Package | x baseline | step jump |")
    print("|---|---|---|---|---|")
    prev = None
    for name, (pk, free) in stages:
        jump = "" if prev is None or name.startswith("Throw") else f"{pk/prev:.2f}"
        print(f"| {name} | {free} | {pk:.2f} | {pk/base:.2f} | {jump} |")
        prev = pk
    full = package(50, 0.30)[0]
    print(f"\nShare of one enemy's health taken by the full-stack Lock package ({full:.1f} basic hits) vs hits-to-beat, Standard, every belt 4-10, all students:")
    full = package(50, 0.30)[0]
    for eid, bk in (("cliff-goat", "mid"), ("stack-golem", "heavy"), ("pebble-pal", "small")):
        base_e = [r for r in rows if r[1] == eid][0][4]; band, _ = BANDS[bk]
        lo, hi = 99, 0
        for belt in range(4, 11):
            for st in ARTISTS:
                beat = check(base_e, belt, st, band)["standard"][0]
                lo = min(lo, full / beat); hi = max(hi, full / beat)
        print(f"  {eid} ({bk}, beats in {band[0]}-{band[1]} hits): {lo*100:.0f}%-{hi*100:.0f}% of its health from one Perfect Counter")

if __name__ == "__main__":
    main()
