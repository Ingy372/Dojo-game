#!/usr/bin/env python3
"""R-BAL-13: restate every C13 enemy and Guardian as WHITE-BELT BASE numbers.
PR #208 builds enemies from base numbers and multiplies Health and Power by ENEMY_TRAINING_SCALE[belt]
(packages/sim/src/config.ts), then rounds. Guard and timings (wind-ups) never scale.
The old C13 files were set for each belt's own player, so at runtime they would count strength twice.
Method: design the FINAL stats for the typical trained Artist at the enemy's belt (same role targets as before),
divide by the belt multiplier, round to a whole base, then search nearby whole bases until the final stats pass
#188's bands for all three model students (Standard and Challenge x1.5).
Run: python3 drafts/planning/r-bal-13-sim.py          (check only; exit 1 if anything is out)
     python3 drafts/planning/r-bal-13-sim.py --write  (fill the files, then check)
Labels: [CODE] from main, [DECIDED] Manager, [FITTED] chosen by the search."""
import importlib.util, json, math, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("s12", os.path.join(HERE, "r-bal-12-sim.py"))
s12 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s12)
r9 = s12.r9; ess = r9.ess
CONFIG = os.path.join(HERE, "..", "..", "packages", "sim", "src", "config.ts")
src = open(CONFIG).read().split("ENEMY_TRAINING_SCALE")[1].split("];")[0]
SCALE = {i + 1: (float(h), float(p)) for i, (h, p) in enumerate(re.findall(r"maxHealth: ([\d.]+), power: ([\d.]+)", src))}  # [CODE] #208
assert len(SCALE) == 10
BOSS = {"hits": (40, 80), "ko_min": 5}
ACCEPTED = "trains more, plays less"   # [DECIDED] Manager: this kid may go a bit over the boss band on Challenge

def final(base, t):
    hx, px = SCALE[t]; return (max(1, round(base[0] * hx)), round(base[1] * px), base[2])   # world.ts:397

def artists():
    lv, gear = s12.typical_series(); s12.fit_k(lv, gear); res = {}
    for sn, st in s12.STUDENTS.items():
        rows = s12.student_runs(lv, gear, st); res[sn] = {t: s12.avg_artist(rows, t)[0] for t in s12.TIERS}
    return res

def enemy_ok(F, t, band, strength, res):
    return all(r9.check(F, res[sn][t], band, strength)[4] for sn in s12.STUDENTS)

def boss_ok(b, F, t, res):
    for sn in s12.STUDENTS:
        rows, ok = r9.phase_check(b, F, res[sn][t])
        if ok: continue
        if sn != ACCEPTED: return False
        # accepted: only the Challenge hits-to-beat may run over; Standard and every KO must pass
        for pid, sl, s_, r, (plo, phi) in rows:
            (hs, ks), (hc, kc) = r
            if not (plo <= hs <= phi and hc >= plo and ks >= 5 and kc >= 5): return False
    return True

def search(start, ok, span=0.25):
    """Nearest whole base (H, P) to start whose final stats pass."""
    H0, P0, G = start; best = None
    for dh in range(-int(H0 * span) - 2, int(H0 * span) + 3):
        for dp in range(-int(P0 * span) - 2, int(P0 * span) + 3):
            H, P = H0 + dh, P0 + dp
            if H < 1 or P < 1: continue
            cost = abs(dh) / H0 + abs(dp) / P0
            if best and cost >= best[0]: continue
            if ok((H, P, G)): best = (cost, (H, P, G))
    return best[1] if best else None

def items():
    """(label, path, keypath, tier, band, strength, design-target-final) for every C13 enemy, variant, Guardian."""
    out = []
    for eid, (tier, role) in ess.PLAN.items():
        if eid in ess.EXISTING: continue
        base, _, var = eid.partition("/")
        p = os.path.join(ess.ENEMY_DIR, base + ".json"); e = json.load(open(p)); k = ("variants", var) if var else ()
        if var: e = e["variants"][var]
        t = r9.TIERS[tier]; hits, ko = ess.ROLE_TARGET[role]
        band = BOSS if role == "boss" else ess.BANDS[ess.ROLE_BAND.get(role, "mid")]
        st = e.get("attack", {}).get("strength", 1); st = st if isinstance(st, (int, float)) else 1
        out.append(("enemy", eid, p, k, t, band, st, (hits, ko, e["guard"])))
    p = os.path.join(ess.ENEMY_DIR, "cloud-puff.json")   # Cloudlet (#190): small, 2 hits
    out.append(("enemy", "cloud-puff/cloudlet", p, ("variants", "cloudlet"), 9, ess.BANDS["small"],
                json.load(open(p))["variants"]["cloudlet"].get("attack", {}).get("strength", 1), (1.6, 24, 0)))
    for b in r9.load_bosses():
        out.append(("boss", b["id"], os.path.join(r9.BOSS_DIR, b["_file"]), (), r9.TIERS[b["tier"]], BOSS, b, None))
    return out

def solve(res):
    rows = []
    for kind, eid, p, k, t, band, st, tgt in items():
        a = res["typical"][t]
        if kind == "enemy":
            hits, ko, g = tgt; Ff = r9.design(a, g, hits, ko)
            ok = lambda B, t=t, band=band, st=st: enemy_ok(final(B, t), t, band, st, res)
        else:
            b = st; smax = max(r9.KIND[x][0] for x in b["_kinds"].values())
            H, P, g = r9.design(a, r9.BOSS_GUARD, *r9.BOSS_TARGET); Ff = (H, P / smax, g)
            ok = lambda B, t=t, b=b: boss_ok(b, final(B, t), t, res)
        hx, px = SCALE[t]; start = (max(1, round(Ff[0] / hx)), max(1, round(Ff[1] / px)), Ff[2])
        B = start if ok(start) else search(start, ok)
        rows.append((kind, eid, p, k, t, band, st, B))
    return rows

def write(rows):
    files = {}
    for kind, eid, p, k, t, band, st, B in rows:
        if B is None: continue
        d = files.setdefault(p, json.load(open(p))); tgt = d
        for x in k: tgt = tgt[x]
        tgt["maxHealth"], tgt["power"] = B[0], B[1]          # Guard and wind-ups untouched
    for p, d in files.items(): open(p, "w").write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")

def report(rows, res):
    names = list(s12.STUDENTS); bad = []
    print("Belt multipliers from #208 config.ts [CODE]: " + ", ".join(f"{t}:{h}/{p}" for t, (h, p) in SCALE.items()))
    print(f"\n{'enemy':>22} {'belt':>3} {'BASE H/P/G':>15} {'FINAL H/P':>11}   " + " | ".join(n[:14] for n in names))
    for kind, eid, p, k, t, band, st, B in rows:
        if B is None: print(f"{eid:>22} {t:>3}  NO PASSING BASE"); bad.append(eid); continue
        d = json.load(open(p))
        for x in k: d = d[x]
        filed = (d["maxHealth"], d["power"], d["guard"])
        if filed != tuple(B): pass
        F = final(filed, t); cells = []; good = True
        for sn in names:
            if kind == "enemy":
                c = r9.check(F, res[sn][t], band, st); cells.append(f"{c[0]}/{c[1]} KO{c[2]}/{c[3]}")
            else:
                rr, _ = r9.phase_check(st, F, res[sn][t])
                tot = [math.ceil(F[0] * m / r9.damage(res[sn][t]["power"], 1, F[2])) for m in (1, 1.5)]
                cells.append(f"{tot[0]}/{tot[1]} minKO{min(min(x[3][0][1], x[3][1][1]) for x in rr)}")
        good = enemy_ok(F, t, band, st, res) if kind == "enemy" else boss_ok(st, F, t, res)
        if not good: bad.append(eid)
        print(f"{eid:>22} {t:>3} {str(filed[0])+'/'+str(filed[1])+'/'+str(filed[2]):>15} {str(F[0])+'/'+str(F[1]):>11}   " + " | ".join(f"{c:<14}" for c in cells) + ("" if good else "  OUT"))
    print(f"\nchecked {len(rows)} (C13 enemies, variants, Cloudlet, 10 Guardians); out of band: {', '.join(bad) or 'none'}")
    print("trains-more Challenge hits over 80 on Guardians are ACCEPTED (Manager); everything else must pass")
    return not bad

if __name__ == "__main__":
    res = artists(); rows = solve(res)
    if "--write" in sys.argv: write(rows)
    sys.exit(0 if report(rows, res) else 1)
