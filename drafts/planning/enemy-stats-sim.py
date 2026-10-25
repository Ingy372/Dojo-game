#!/usr/bin/env python3
"""R-BAL-8: stats for the C13 tier 1-3 enemies (drafts/content/enemies/).
Plain Python 3, no packages, no game code. Uses Jay's calls (Oct 24):
D1 expected-Artist scaling, D2 bands, D5 Challenge x1.5, D4 Endless +3%/floor uncapped.
Run:          python3 drafts/planning/enemy-stats-sim.py          (check the files)
Fill TODOs:   python3 drafts/planning/enemy-stats-sim.py --write  (only replaces "TODO" stat values)
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ENEMY_DIR = os.path.join(HERE, "..", "content", "enemies")

def damage(power, strength, guard, bonus=0.0):   # combat.ts:10-13
    return max(1, round(power * strength * 100 / (100 + guard) * (1 + bonus)))

# --- expected Artist per tier (D1). Level = middle of the tier's 10 levels (guess).
# Gear = 90% of a per-tier cap; white caps (config.ts:193-195) times the tier (guess).
def expected_artist(t):
    lvl = 10 * (t - 1) + 5
    gear = 0.9 * t
    return {"level": lvl,
            "power": 10 + 0.4 * (lvl - 1) + gear * 4,
            "health": 100 + 3 * (lvl - 1) + gear * 30,
            "guard": gear * 8}
TIERS = {"white": 1, "yellow": 2, "orange": 3}
CHALLENGE = 1.5                                   # D5
# Bands (D2). "mid" is not in the research doc: placed between swarmer and brute (guess).
BANDS = {"small": {"hits": (2, 4), "ko_min": 12},     # = Swarmer band
         "mid":   {"hits": (5, 10), "ko_min": 8},     # (guess)
         "heavy": {"hits": (10, 20), "ko_min": 5}}    # = Brute band
ROLE_BAND = {"swarm": "small", "flier": "small", "heavy": "heavy"}  # everything else = mid

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
}
GUARD = {"swarm": 0, "flier": 0, "charger": 5, "ranged": 0, "turret": 10, "guard": 20,
         "splitter": 5, "bonker": 10, "dash-only": 10, "dash-teacher": 10}
# id: (role, target basic hits to beat on Standard, target enemy hits to KO the Artist on Standard)
SPEC = {
    "wick-wisp": ("flier", 2, 19), "dust-bunny": ("charger", 5, 12),
    "lantern-moth": ("ranged", 5, 14), "sleepy-sentry": ("dash-teacher", 5, 12),
    "buzz-bee": ("swarm", 2, 18), "thorn-sprout": ("turret", 5, 14),
    "shell-snail": ("guard", 6, 12), "vine-sweeper": ("dash-only", 6, 12),
    "bopper": ("bonker", 6, 12),
    "spark-sprite": ("swarm", 2, 18), "dough-blob": ("splitter", 5, 12),
    "ladle-lobber": ("ranged", 5, 14), "rolling-pin": ("dash-only", 6, 12),
}
HOME = {"wick-wisp": "white", "dust-bunny": "white", "lantern-moth": "white", "sleepy-sentry": "white",
        "buzz-bee": "yellow", "thorn-sprout": "yellow", "shell-snail": "yellow", "vine-sweeper": "yellow",
        "bopper": "yellow", "spark-sprite": "orange", "dough-blob": "orange", "ladle-lobber": "orange",
        "rolling-pin": "orange"}

def design(eid):
    role, hits, ko = SPEC[eid]
    a = expected_artist(TIERS[HOME[eid]])
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

def write_todos():
    for eid in SPEC:
        p = os.path.join(ENEMY_DIR, eid + ".json")
        s = open(p).read(); st = design(eid)
        for k, v in st.items():
            s = re.sub(r'("%s":\s*)"TODO"' % k, lambda m: m.group(1) + json.dumps(v), s)
        open(p, "w").write(s)
        json.loads(s)  # still valid JSON

def check():
    print("== Expected Artist per tier (D1; level = mid-tier, gear 90% of tier cap, guess) ==")
    for name, t in TIERS.items():
        a = expected_artist(t)
        print(f"{name:>7} (tier {t}): level {a['level']:>2}  Power {a['power']:.1f}  Health {a['health']:.0f}  Guard {a['guard']:.1f}")
    a1 = expected_artist(1)
    print("ENEMY_SCALE vs tier 1 (Health follows Artist Power, enemy Power follows Artist Health):")
    for name, t in TIERS.items():
        a = expected_artist(t)
        print(f"{name:>7}: Health x{a['power']/a1['power']:.2f}  Power x{a['health']/a1['health']:.2f}")
    print("\n== Hits to beat (Artist basic hit) and enemy hits to KO the Artist; Standard / Challenge x1.5 ==")
    print(f"{'enemy':>14} {'tier':>6} {'HP':>4} {'Pow':>4} {'Grd':>3}  {'beat S':>6} {'beat C':>6} {'band':>6}  {'KO S':>4} {'KO C':>4} {'min':>3}  {'Endless out@':>12}  result")
    bad = []
    for eid in list(SPEC) + ["swarmer", "shield", "brute", "floor-keeper"]:
        e = json.load(open(os.path.join(ENEMY_DIR, eid + ".json")))
        if eid in SPEC: tier, role = HOME[eid], SPEC[eid][0]
        else: tier, role = "white", {"swarmer": "swarm", "shield": "guard", "brute": "heavy", "floor-keeper": "boss"}[eid]
        a = expected_artist(TIERS[tier])
        if any(e.get(k) == "TODO" for k in ("maxHealth", "power", "guard")):
            print(f"{eid:>14}  still TODO"); bad.append(eid); continue
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
        tag = "" if eid in SPEC else " (existing, not scaled yet)"
        print(f"{eid:>14} {tier:>6} {H:>4} {P:>4} {G:>3}  {bs:>6} {bc:>6} {lo:>2}-{hi:<3}  {ks:>4} {kc:>4} {band['ko_min']:>3}  {'floor '+str(f):>12}  {'PASS' if ok else 'OUT'}{tag}")
    print("\nOut of band:", ", ".join(bad) if bad else "none")

if __name__ == "__main__":
    if "--write" in sys.argv: write_todos()
    check()
