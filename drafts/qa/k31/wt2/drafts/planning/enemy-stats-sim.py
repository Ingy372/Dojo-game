#!/usr/bin/env python3
"""R-BAL-8: stats for the C13 tier 1-3 enemies (drafts/content/enemies/).
Plain Python 3, no packages, no game code. Uses Jay's calls (Oct 24):
D1 expected-Artist scaling, D2 bands, D5 Challenge x1.5, D4 Endless +3%/floor uncapped.
Run:          python3 drafts/planning/enemy-stats-sim.py          (check the files)
Fill TODOs:   python3 drafts/planning/enemy-stats-sim.py --write [--tiers 4-6]  (only replaces "TODO" stat values)
Related: XP step weights (k+11) in balance-sim.py are FITTED (chosen to make the last step <= 10 runs; Manager OK Oct 24).
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ENEMY_DIR = os.path.join(HERE, "..", "content", "enemies")

def damage(power, strength, guard, bonus=0.0):   # combat.ts:10-13
    return max(1, round(power * strength * 100 / (100 + guard) * (1 + bonus)))

# --- expected Artist per tier (D1). Level = middle of the tier's 10 levels (guess).
# Tiers 4-10 continue the same straight line (guess; real gear caps per tier are not in config yet).
# Gear = 90% of a per-tier cap; white caps (config.ts:193-195) times the tier (guess).
def expected_artist(t):
    lvl = 10 * (t - 1) + 5
    gear = 0.9 * t
    return {"level": lvl,
            "power": 10 + 0.4 * (lvl - 1) + gear * 4,
            "health": 100 + 3 * (lvl - 1) + gear * 30,
            "guard": gear * 8}
TIERS = {"white": 1, "yellow": 2, "orange": 3, "green": 4, "blue": 5, "red": 6,
         "red-black": 7, "brown": 8, "brown-black": 9, "black": 10}   # bestiary-plan.json order
CHALLENGE = 1.5                                   # D5
# Bands (D2). "mid" = approved playtest target (Manager, Oct 24); R-BAL-7 checks it with kids.
BANDS = {"small": {"hits": (2, 4), "ko_min": 12},     # = Swarmer band
         "mid":   {"hits": (5, 10), "ko_min": 8},     # approved playtest target
         "heavy": {"hits": (10, 20), "ko_min": 5}}    # = Brute band
ROLE_BAND = {"swarm": "small", "flier": "small", "doughling": "small", "heavy": "heavy"}  # everything else = mid

# Non-combat fields copied from the closest existing enemy by role (all guesses).
# radius, speed, sight, startRange, reach, areaRadius, recoverTicks
SHAPE = {
    "swarm":   (0.30, 4.0, 12, 0.95, 0.5, 0.55, 16),  # swarmer
    "flier":   (0.30, 3.6, 12, 0.95, 0.5, 0.55, 16),  # swarmer, a bit slower (floats)
    "charger": (0.35, 3.0, 12, 1.20, 0.8, 0.60, 18),  # between swarmer and bopper
    "ranged":  (0.36, 1.8, 12, 4.00, 4.0, 0.70, 20),  # keeps distance (guess)
    "turret":  (0.40, 0.0, 10, 3.00, 3.0, 0.70, 20),  # does not move
    "guard":   (0.42, 1.4, 10, 1.15, 0.75, 0.80, 18), # shield, slower (snail)
    "splitter":(0.45, 1.6, 10, 1.20, 0.8, 0.85, 18),  # brute-ish body, mid speed
    "bonker":  (0.38, 2.2, 10, 1.50, 1.0, 0.70, 18),  # content/enemies/bopper
    "dash-only":(0.45, 1.0, 10, 2.50, 3.0, 0.60, 24), # lane attack, long recover
    "dash-teacher":(0.45, 0.0, 10, 2.50, 3.0, 0.60, 24),
    "heavy":   (0.48, 1.2, 10, 1.30, 0.9, 0.95, 18),  # brute
    "hopper":  (0.34, 3.0, 12, 1.30, 0.8, 0.65, 18),  # charger-like, lands then hits
    "sneak":   (0.32, 3.2, 8, 0.90, 0.6, 0.55, 18),   # swarmer body, short sight
    "pusher":  (0.42, 1.8, 10, 1.60, 1.0, 0.90, 20),  # wide shove
    "mirror":  (0.38, 2.6, 12, 1.20, 0.8, 0.70, 18),  # player-sized copy
    "burrower":(0.38, 2.0, 10, 1.00, 0.7, 0.80, 20),  # pops up close
    "zoner":   (0.40, 1.2, 12, 3.00, 3.0, 1.10, 22),  # puts areas down at range
    "doughling":(0.32, 3.4, 12, 0.95, 0.5, 0.55, 16), # smaller, quicker Dough Blob
}
GUARD = {"swarm": 0, "flier": 0, "charger": 5, "ranged": 0, "turret": 10, "guard": 20,
         "splitter": 5, "bonker": 10, "dash-only": 10, "dash-teacher": 10, "heavy": 25,
         "hopper": 5, "sneak": 0, "pusher": 15, "mirror": 10, "burrower": 15, "zoner": 5, "doughling": 0}
# Per-role targets: (basic hits to beat on Standard, enemy hits to KO the Artist on Standard).
# Chosen so Challenge x1.5 still lands inside the band.
ROLE_TARGET = {"swarm": (2, 19), "flier": (2, 19), "doughling": (2, 19), "charger": (5, 12),
               "ranged": (5, 14), "turret": (5, 14), "zoner": (5, 14), "guard": (6, 12),
               "dash-only": (6, 12), "bonker": (6, 12), "splitter": (5, 12), "dash-teacher": (5, 12),
               "hopper": (5, 12), "sneak": (5, 12), "pusher": (6, 12), "mirror": (6, 12),
               "burrower": (5, 12), "heavy": (12, 8)}
EXISTING = {"swarmer", "shield", "brute", "floor-keeper"}   # live enemies: checked, never written

def load_plan():
    """id -> (tier, role) from bestiary-plan.json, plus the bopper draft and variants."""
    plan = json.load(open(os.path.join(ENEMY_DIR, "bestiary-plan.json")))
    out = {}
    def walk(o, t=None):
        if isinstance(o, dict):
            t = o.get("tier", t)
            if "id" in o and "role" in o: out[o["id"]] = (t, o["role"])
            for v in o.values(): walk(v, t)
        elif isinstance(o, list):
            for v in o: walk(v, t)
    walk(plan)
    out["dough-blob/doughling"] = ("orange", "doughling")
    return out
PLAN = load_plan()

def design(eid):
    tier, role = PLAN[eid]
    hits, ko = ROLE_TARGET[role]
    a = expected_artist(TIERS[tier])
    g = GUARD[role]
    d = damage(a["power"], 1, g)
    health = round(d * (hits - 0.5))                     # ceil(health/d) == hits
    hit_on_artist = a["health"] / (ko - 0.5)             # ceil(artistHealth/hit) == ko
    power = round(hit_on_artist * (100 + a["guard"]) / 100)
    r, spd, sight, start, reach, area, rec = SHAPE[role]
    return {"maxHealth": health, "power": power, "guard": g, "radius": r,
            "moveSpeedTilesPerSecond": spd, "sightRange": sight, "strength": 1,
            "startRange": start, "reach": reach, "areaRadius": area, "recoverTicks": rec,
            "parSeconds": round(1 + 0.5 * hits, 1), "telegraphTicks": 16}  # telegraph only for bopper draft

def fill(text, st):
    for k, v in st.items():
        text = re.sub(r'("%s":\s*)"TODO"' % k, lambda m: m.group(1) + json.dumps(v), text)
    return text

def write_todos(lo, hi):
    for eid, (tier, role) in PLAN.items():
        if eid in EXISTING or "/" in eid or not lo <= TIERS[tier] <= hi: continue
        p = os.path.join(ENEMY_DIR, eid + ".json")
        s = open(p).read()
        cut = s.find('"variants"')
        head, tail = (s, "") if cut < 0 else (s[:cut], s[cut:])
        head = fill(head, design(eid))
        for vid in re.findall(r'"([a-z-]+)":\s*\{\s*"name"', tail):   # variant blocks
            key = eid + "/" + vid
            if key in PLAN:
                a = tail.find('"%s"' % vid); b = tail.find('"%s"' % vid, a + 1)
                b = len(tail) if b < 0 else b
                tail = tail[:a] + fill(tail[a:b], design(key)) + tail[b:]
        open(p, "w").write(head + tail)
        json.loads(head + tail)  # still valid JSON

def check():
    print("== Expected Artist per tier (D1; level = mid-tier, gear 90% of tier cap, guess) ==")
    for name, t in TIERS.items():
        a = expected_artist(t)
        print(f"{name:>11} (tier {t:>2}): level {a['level']:>2}  Power {a['power']:.1f}  Health {a['health']:.0f}  Guard {a['guard']:.1f}")
    a1 = expected_artist(1)
    print("ENEMY_SCALE vs tier 1 (Health follows Artist Power, enemy Power follows Artist Health):")
    for name, t in TIERS.items():
        a = expected_artist(t)
        print(f"{name:>11}: Health x{a['power']/a1['power']:.2f}  Power x{a['health']/a1['health']:.2f}")
    print("\n== Hits to beat (Artist basic hit) and enemy hits to KO the Artist; Standard / Challenge x1.5 ==")
    print(f"{'enemy':>20} {'tier':>11} {'HP':>4} {'Pow':>4} {'Grd':>3}  {'beat S':>6} {'beat C':>6} {'band':>6}  {'KO S':>4} {'KO C':>4} {'min':>3}  {'Endless out@':>12}  result")
    bad = []
    ids = [i for i in PLAN if i not in EXISTING] + sorted(EXISTING)
    ids.sort(key=lambda i: (i in EXISTING, TIERS[PLAN.get(i, ("white",))[0]]))
    n_c13 = 0
    for eid in ids:
        base, _, var = eid.partition("/")
        e = json.load(open(os.path.join(ENEMY_DIR, base + ".json")))
        if var: e = e["variants"][var]
        if eid in EXISTING: tier, role = "white", {"swarmer": "swarm", "shield": "guard", "brute": "heavy", "floor-keeper": "boss"}[eid]
        else: tier, role = PLAN[eid]; n_c13 += 0 if var or eid == "bopper" else 1
        a = expected_artist(TIERS[tier])
        if any(e.get(k) == "TODO" for k in ("maxHealth", "power", "guard")):
            print(f"{eid:>20}  still TODO"); bad.append(eid); continue
        H, P, G = e["maxHealth"], e["power"], e["guard"]
        strength = e.get("attack", {}).get("strength", 1); strength = strength if isinstance(strength, (int, float)) else 1
        band = {"hits": (40, 80), "ko_min": 5} if role == "boss" else BANDS[ROLE_BAND.get(role, "mid")]
        d = damage(a["power"], 1, G)
        bs, bc = math.ceil(H / d), math.ceil(H * CHALLENGE / d)
        ks = math.ceil(a["health"] / damage(P, strength, a["guard"]))
        kc = math.ceil(a["health"] / damage(P * CHALLENGE, strength, a["guard"]))
        lo, hi = band["hits"]
        # first Endless floor (Standard, x1.03^f on Health) where hits-to-beat leaves the band (D4: no cap)
        f = 0
        while math.ceil(H * 1.03 ** f / d) <= hi and f < 500: f += 1
        ok = lo <= bs <= hi and lo <= bc <= hi and ks >= band["ko_min"] and kc >= band["ko_min"]
        if not ok: bad.append(eid)
        tag = " (existing, not scaled yet)" if eid in EXISTING else ""
        print(f"{eid:>20} {tier:>11} {H:>4} {P:>4} {G:>3}  {bs:>6} {bc:>6} {lo:>2}-{hi:<3}  {ks:>4} {kc:>4} {band['ko_min']:>3}  {'floor '+str(f):>12}  {'PASS' if ok else 'OUT'}{tag}")
    print(f"\nC13 enemy files checked: {n_c13} (+ bopper draft, Doughling variant, 4 existing for reference)")
    print("Out of band:", ", ".join(bad) if bad else "none")

if __name__ == "__main__":
    if "--write" in sys.argv:
        lo, hi = 1, 10
        if "--tiers" in sys.argv:
            lo, hi = map(int, sys.argv[sys.argv.index("--tiers") + 1].split("-"))
        write_todos(lo, hi)
    check()
