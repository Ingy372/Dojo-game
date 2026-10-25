#!/usr/bin/env python3
"""R-BAL-9: per-tier gear caps (cost curve) + expected Artist per tier + enemy re-check.
Plain Python 3, no packages, no game code. Run: python3 drafts/planning/r-bal-9-sim.py
Labels: [CODE] copied from main, [DECIDED] Jay/Manager, [FITTED] chosen to match a target, [GUESS].
"""
import importlib.util, json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("ess", os.path.join(HERE, "enemy-stats-sim.py"))
ess = importlib.util.module_from_spec(spec); spec.loader.exec_module(ess)   # bands, roles, shapes, damage()
damage, ENEMY_DIR = ess.damage, ess.ENEMY_DIR

# ---------------- [CODE] numbers from main ----------------
BASE_P, BASE_H, BASE_G = 10, 100, 0            # config.ts:50 COMBAT.player
P_PER_LVL, H_PER_LVL = 0.4, 3                  # config.ts PROGRESSION.powerPerLevel / healthPerLevel
SHARE_GEAR, SHARE_LEVEL = 0.08, 0.18           # config.ts POWER.shares.gear / .level
WHITE_CAPS = {"power": 4, "maxHealth": 30, "guard": 8, "jade": 0.12}   # config.ts:194 + gear.json jade epic
RARITY = [("common", 70), ("uncommon", 22), ("rare", 7), ("epic", 1)]  # config.ts LOOT
RARE_PER_DRY, GUARANTEED_ON = 3, 5
RUNS_PER_WEEK, WEEKS_PER_MONTH, CAP_SHARE = 8, 4.35, 0.75
MONTHS = 3                                     # [DECIDED] typical months per belt
SOFTEN = 11                                    # [FITTED] (k+11) XP step weights (R-BAL-5)
CHALLENGE = 1.5                                # [DECIDED] D5

# ---------------- 1. cost curve: one shared unit ----------------
# Fight strength FS = Power x EHP, EHP = Health x (1 + Guard/100) (exact for combat.ts:10-13).
# Shared unit = ln(FS): a +x in ln(FS) makes every fight x% easier, whatever stat gave it.
# Conversions at an Artist with stats P, H, G (small changes):
#   +1 Power  = 1/P units, +1 Health = 1/H units, +1 Guard = 1/(100+G) units, +a powerScale = ln(1+a).
def lvl_stats(L): return BASE_P + P_PER_LVL * (L - 1), BASE_H + H_PER_LVL * (L - 1)
def level_value(L):  # ln-FS that levels give at level L
    p, h = lvl_stats(L); return math.log(p * h / (BASE_P * BASE_H))
# Budget: gear at cap is worth SHARE_GEAR/SHARE_LEVEL of what levels give at the tier cap.
GEAR_TO_LEVEL = SHARE_GEAR / SHARE_LEVEL       # 0.444 [CODE ratio of PR shares]
# Split of the budget across stats, [FITTED] to today's white gear mix (in ln-FS at level 10):
def white_split():
    p, h = lvl_stats(10)
    parts = {"power": math.log((p + 4) / p), "maxHealth": math.log((h + 30) / h),
             "guard": math.log(1.08), "jade": math.log(1.12)}
    tot = sum(parts.values()); return {k: v / tot for k, v in parts.items()}, tot
SPLIT, WHITE_NOW = white_split()

def caps(t):
    L = 10 * t; p, h = lvl_stats(L)
    B = GEAR_TO_LEVEL * level_value(L)
    c = {"power": round(p * (math.exp(SPLIT["power"] * B) - 1)),
         "maxHealth": round(h * (math.exp(SPLIT["maxHealth"] * B) - 1)),
         "guard": round(100 * (math.exp(SPLIT["guard"] * B) - 1)),
         "jade": round(math.exp(SPLIT["jade"] * B) - 1, 2)}
    return c, B

# ---------------- 2. expected Artist per tier ----------------
def level_timeline(t):
    """Level at each run of the belt (3 months), using (k+11) steps; starts at the last cap."""
    runs_total = round(MONTHS * WEEKS_PER_MONTH * RUNS_PER_WEEK)
    climb = MONTHS * WEEKS_PER_MONTH * CAP_SHARE * RUNS_PER_WEEK
    steps = 9 if t == 1 else 10
    start = 1 if t == 1 else 10 * (t - 1)
    w = [k + SOFTEN for k in range(1, steps + 1)]; tot = sum(w)
    edges, acc = [], 0
    for x in w: acc += climb * x / tot; edges.append(acc)
    out = []
    for r in range(runs_total):
        out.append(start + sum(1 for e in edges if r + 0.5 >= e))
    return out

FRAC = [0.25, 0.5, 0.75, 1.0]   # [GUESS] item stat = cap x this, by rarity (close to white table)
DROPS_PER_RUN = 2               # [GUESS] as in balance-sim section 4 (low end)
def gear_timeline(t, carry, rng):
    """Worn gear stats each run (Monte Carlo). 9 bases: 3 hands, 3 gi, 3 charms (1 is Jade)."""
    c, _ = caps(t)
    worn = dict(carry); best = {"hands": -1, "gi": -1, "jade": -1}; dry = 0; out = []
    for r in range(len(level_timeline(t))):
        got_rare = False
        for d in range(DROPS_PER_RUN):
            wts = [x[1] for x in RARITY]; wts[2] += RARE_PER_DRY * dry; wts[0] -= RARE_PER_DRY * dry
            i = rng.choices(range(4), weights=wts)[0]
            if dry + 1 >= GUARANTEED_ON and d == 0: i = max(i, 2)
            if i >= 2: got_rare = True
            slot = rng.choice(["hands"] * 3 + ["gi"] * 3 + ["jade", "other", "other"])
            if slot != "other" and i > best[slot]:
                best[slot] = i
                if slot == "hands": worn["power"] = max(worn["power"], c["power"] * FRAC[i])
                if slot == "gi":
                    worn["maxHealth"] = max(worn["maxHealth"], c["maxHealth"] * FRAC[i])
                    worn["guard"] = max(worn["guard"], c["guard"] * FRAC[i])
                if slot == "jade": worn["jade"] = max(worn["jade"], c["jade"] * FRAC[i])
        dry = 0 if got_rare else dry + 1
        out.append(dict(worn))
    return out

def expected_artists(trials=400, seed=9):
    rng = random.Random(seed); acc = {t: {"level": 0, "power": 0, "maxHealth": 0, "guard": 0, "jade": 0} for t in range(1, 11)}
    for _ in range(trials):
        carry = {"power": 0, "maxHealth": 0, "guard": 0, "jade": 0}
        for t in range(1, 11):
            lv = level_timeline(t); gt = gear_timeline(t, carry, rng); carry = gt[-1]
            for L, g in zip(lv, gt):
                acc[t]["level"] += L; [acc[t].__setitem__(k, acc[t][k] + g[k]) for k in g]
    n = trials * len(level_timeline(1)); res = {}
    for t, a in acc.items():
        L = a["level"] / n; p, h = lvl_stats(L)
        res[t] = {"level": L, "gearPower": a["power"] / n, "gearHealth": a["maxHealth"] / n,
                  "guard": a["guard"] / n, "powerScale": a["jade"] / n}
        res[t]["power"] = (p + res[t]["gearPower"]) * (1 + res[t]["powerScale"])   # world.ts:788
        res[t]["health"] = h + res[t]["gearHealth"]
    return res

# ---------------- 3/4. enemy checks ----------------
TIERS = ess.TIERS
def check(e_stats, artist, band, strength=1):
    H, P, G = e_stats
    d = damage(artist["power"], 1, G)
    bs, bc = math.ceil(H / d), math.ceil(H * CHALLENGE / d)
    ks = math.ceil(artist["health"] / damage(P, strength, artist["guard"]))
    kc = math.ceil(artist["health"] / damage(P * CHALLENGE, strength, artist["guard"]))
    lo, hi = band["hits"]
    ok = lo <= bs <= hi and lo <= bc <= hi and ks >= band["ko_min"] and kc >= band["ko_min"]
    return bs, bc, ks, kc, ok

def design(artist, guard, hits, ko):
    d = damage(artist["power"], 1, guard)
    return round(d * (hits - 0.5)), round(artist["health"] / (ko - 0.5) * (100 + artist["guard"]) / 100), guard

def main():
    print("== 1. Gear caps by tier (cost curve, shared unit = ln of fight strength) ==")
    print(f"today's white caps are worth {WHITE_NOW:.3f} units; levels 1-10 are worth {level_value(10):.3f}"
          f" -> gear/level = {WHITE_NOW/level_value(10):.2f} (PR shares say {GEAR_TO_LEVEL:.2f})")
    print("split of the gear budget [FITTED to today's white mix]: " + ", ".join(f"{k} {v:.0%}" for k, v in SPLIT.items()))
    print(f"{'tier':>11} {'lvl cap':>7} {'level units':>11} {'gear budget':>11}  {'Power':>5} {'Health':>6} {'Guard':>5} {'Jade %':>6}")
    for name, t in TIERS.items():
        c, B = caps(t)
        print(f"{name:>11} {10*t:>7} {level_value(10*t):>11.3f} {B:>11.3f}  {c['power']:>5} {c['maxHealth']:>6} {c['guard']:>5} {c['jade']*100:>5.0f}%")
    A = expected_artists()
    print("\n== 2. Expected Artist per tier (time-average over a 3-month belt, (k+11) steps, gear Monte Carlo) ==")
    print(f"{'tier':>11} {'level':>5} {'Power':>6} {'Health':>6} {'Guard':>5} {'powerScale':>10}  gear share of ln-FS growth")
    for name, t in TIERS.items():
        a = A[t]; p, h = lvl_stats(a["level"])
        lv = math.log(p * h / 1000); tot = math.log(a["power"] * a["health"] * (1 + a["guard"] / 100) / 1000)
        print(f"{name:>11} {a['level']:>5.1f} {a['power']:>6.1f} {a['health']:>6.0f} {a['guard']:>5.1f} {a['powerScale']:>10.3f}  {(tot-lv)/tot:>5.0%}")
    print("\n== 3. Existing enemies vs the white expected Artist (Standard / Challenge x1.5) ==")
    a1 = A[1]; fixes = {"swarmer": ("small", 0, 2, 19), "shield": ("mid", 15, 6, 12),
                        "brute": ("heavy", 25, 12, 8), "floor-keeper": ("boss", 30, 50, 8)}
    BOSS = {"hits": (40, 80), "ko_min": 5}
    for eid, (bk, g, hits, ko) in fixes.items():
        e = json.load(open(os.path.join(ENEMY_DIR, eid + ".json")))
        band = BOSS if bk == "boss" else ess.BANDS[bk]
        now = check((e["maxHealth"], e["power"], e["guard"]), a1, band)
        new = design(a1, g, hits, ko); chk = check(new, a1, band)
        tag = "keep" if now[4] else f"NEW H{new[0]} P{new[1]} G{new[2]} -> beat {chk[0]}/{chk[1]} KO {chk[2]}/{chk[3]} {'PASS' if chk[4] else 'OUT'}"
        print(f"{eid:>13} now H{e['maxHealth']} P{e['power']} G{e['guard']}: beat {now[0]}/{now[1]} KO {now[2]}/{now[3]} band {band['hits']} ko>={band['ko_min']}  {'PASS' if now[4] else 'OUT'}  {tag}")
    print("\n== 4. All 40 C13 enemies (+ bopper, Doughling) vs the new expected Artist ==")
    print(f"{'enemy':>20} {'tier':>11} {'H/P/G in file':>14}  {'beat S/C':>8} {'KO S/C':>7}  result  proposal if OUT")
    out = []; n = 0
    for eid, (tier, role) in ess.PLAN.items():
        if eid in ess.EXISTING: continue
        base, _, var = eid.partition("/")
        e = json.load(open(os.path.join(ENEMY_DIR, base + ".json")))
        if var: e = e["variants"][var]
        a = A[TIERS[tier]]; band = ess.BANDS[ess.ROLE_BAND.get(role, "mid")]
        bs, bc, ks, kc, ok = check((e["maxHealth"], e["power"], e["guard"]), a, band)
        n += 0 if var or eid == "bopper" else 1
        prop = ""
        if not ok:
            hits, ko = ess.ROLE_TARGET[role]
            new = design(a, e["guard"], hits, ko); c2 = check(new, a, band)
            prop = f"H{new[0]} P{new[1]} G{new[2]} -> {c2[0]}/{c2[1]} KO {c2[2]}/{c2[3]} {'PASS' if c2[4] else 'OUT'}"
            out.append(eid)
        hpg = f"{e['maxHealth']}/{e['power']}/{e['guard']}"
        print(f"{eid:>20} {tier:>11} {hpg:>14}  {bs:>3}/{bc:<4} {ks:>3}/{kc:<3}  {'PASS' if ok else 'OUT '}   {prop}")
    print(f"\nC13 files: {n}; out of band now: {len(out)}")
    return A

# ---------------- 5. Guardians (tiers 1-5) phase by phase, and the Cloudlet ----------------
BOSS_DIR = os.path.join(HERE, "..", "content", "bosses")
BOSS_BAND = {"hits": (40, 80), "ko_min": 5}          # Floor-keeper band [DECIDED]
BOSS_TARGET = (50, 8)                                # [FITTED] same as Floor-keeper fix (sec. 3)
BOSS_GUARD = 30                                      # [CODE] floor-keeper.json guard
# attack kind -> (strength, startRange, reach, areaRadius, recoverTicks)  all [GUESS], floor-keeper shapes
KIND = {"melee": (1.0, 1.9, 1.1, 1.3, 22), "circles": (0.8, 6.0, 5.0, 0.9, 26),
        "lane": (1.2, 6.0, 6.0, 0.6, 30), "arc": (1.2, 2.5, 0.0, 2.4, 30), "zone": (0.0, 5.0, 4.0, 1.0, 26)}
def kind(a):
    if a.get("shape") in ("lane", "arc"): return a["shape"]
    if "zone" in a: return "zone"
    return "melee" if a is a.get("_first") else "circles"
def boss_design(b, A):
    a = A[TIERS[b["tier"]]]; hits, ko = BOSS_TARGET
    smax = max(KIND[k][0] for k in b["_kinds"].values())
    H, P, G = design(a, BOSS_GUARD, hits, ko)
    return H, round(P / smax), G   # strongest attack lands exactly on the KO target
def phase_check(b, stats, a):
    H, P, G = stats; d = damage(a["power"], 1, G); rows = []; ok = True
    ph = sorted(b["phases"], key=lambda p: -p["atHealthFraction"]) + [{"atHealthFraction": 0}]
    for p, nxt in zip(ph, ph[1:]):
        sl = p["atHealthFraction"] - nxt["atHealthFraction"]
        lo, hi = BOSS_BAND["hits"]; plo, phi = math.floor(lo * sl), math.ceil(hi * sl)
        s = max(KIND[b["_kinds"][n]][0] for n in p["attacks"])
        r = []
        for m in (1, CHALLENGE):
            hb = math.ceil(H * m * sl / d); k = math.ceil(a["health"] / damage(P * m, s, a["guard"])) if s else 99
            r.append((hb, k)); ok &= plo <= hb <= phi and k >= BOSS_BAND["ko_min"]
        rows.append((p["id"], sl, s, r, (plo, phi)))
    return rows, ok
def load_bosses():
    out = []
    for fn in sorted(os.listdir(BOSS_DIR)):
        b = json.load(open(os.path.join(BOSS_DIR, fn))); b["_file"] = fn
        if TIERS[b["tier"]] > 5: continue
        b["attacks"][0]["_first"] = b["attacks"][0]
        b["_kinds"] = {x["name"]: kind(x) for x in b["attacks"]}
        out.append(b)
    return sorted(out, key=lambda b: TIERS[b["tier"]])
def section5(A):
    print("\n== 5. Guardians tiers 1-5, phase by phase (band 40-80 hits, KO >= 5; phase share of hits = band x phase slice) ==")
    res = {}
    for b in load_bosses():
        a = A[TIERS[b["tier"]]]
        st = (b["maxHealth"], b["power"], b["guard"]) if isinstance(b["maxHealth"], int) else boss_design(b, A)
        res[b["id"]] = st
        rows, ok = phase_check(b, st, a)
        print(f"{b['id']:>14} {b['tier']:>6}  H{st[0]} P{st[1]} G{st[2]}  {'PASS' if ok else 'OUT'}")
        for pid, sl, s, r, pb in rows:
            print(f"{'':>16}phase {pid:<7} slice {sl:.2f} strongest x{s:.1f}  beat S/C {r[0][0]}/{r[1][0]} (phase band {pb[0]}-{pb[1]})  KO S/C {r[0][1]}/{r[1][1]}")
        tot = [math.ceil(st[0] * m / damage(a["power"], 1, st[2])) for m in (1, CHALLENGE)]
        print(f"{'':>16}whole fight beat S/C {tot[0]}/{tot[1]}")
    a9 = A[9]; c = design(a9, 0, 1.6, 24); chk = check(c, a9, ess.BANDS["small"])  # [FITTED] smaller than parent, 2 hits; chk = check(c, a9, ess.BANDS["small"])
    print(f"\n   cloudlet (brown-black, small): H{c[0]} P{c[1]} G{c[2]} -> beat {chk[0]}/{chk[1]} KO {chk[2]}/{chk[3]} {'PASS' if chk[4] else 'OUT'}")
    return res, c

if __name__ == "__main__":
    section5(main())
