#!/usr/bin/env python3
"""J16: measure the Lost Lightbearer draft against the live formulas.

Reads the numbers from the repo. Prints them. Does not write game files.
Run: python3 drafts/planning/j16-boss-sim.py

Sources:
  packages/sim/src/combat.ts damage()
  packages/sim/src/world.ts telegraphTicks() and the belt scale in createWorld()
  packages/sim/src/config.ts DIFFICULTY, ENEMY_TRAINING_SCALE, TEMPO, COMBAT.strike
  packages/sim/src/world.ts PHASE_HOLD_TICKS = realSecondsToTicks(1)
  packages/sim/test/r-bal-12-bands.test.ts  (Guardian band, Challenge x1.5 gate)
  packages/sim/test/r-bal-12-artists.ts
  packages/sim/test/r-challenge-p5.test.ts  (kid / newer / careful all use the typical Artist)
  drafts/content/bosses/lost-lightbearer.json
  drafts/content/enemies/storm-wisp.json
  content/enemies/hearth-cook.json  (live comparison only)
"""
import json, math, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def rd(rel):
    return open(os.path.join(ROOT, rel), encoding="utf-8").read()

def js_round(x):
    """JavaScript Math.round for positive numbers (half rounds away from 0)."""
    return int(math.floor(x + 0.5))

def damage(power, strength, guard, bonus=0.0):
    raw = power * strength * 100 / (100 + guard)
    return max(1, js_round(raw * (1 + bonus)))

cfg = rd("packages/sim/src/config.ts")
TICKS = int(re.search(r"TICKS_PER_SECOND = (\d+)", cfg).group(1))
TEMPO = float(re.search(r"speed: ([\d.]+)", cfg[cfg.index("export const TEMPO"):]).group(1))
MIN_WINDUP = int(re.search(r"MIN_WINDUP_TICKS = (\d+)", cfg).group(1))
CHALLENGE_FROM = int(re.search(r"CHALLENGE_FROM_TIER = (\d+)", cfg).group(1))
STD_WINDOW = int(re.search(r"standard: \{[^}]*counterWindowTicks: (\d+)", cfg).group(1))
STRIKE = float(re.search(r"strike: \{[^}]*strength: ([\d.]+)", cfg, re.S).group(1))

def block(name):
    m = re.search(name + r": \{([^}]*)\}", cfg)
    body = m.group(1)
    return {
        "window": int(re.search(r"counterWindowTicks: (\d+)", body).group(1)),
        "fill": float(re.search(r"fillScale: ([\d.]+)", body).group(1)),
        "power": float(re.search(r"enemyPowerScale: ([\d.]+)", body).group(1)),
    }

DIFF = {k: block(k) for k in ("guided", "standard", "challenge")}
SCALE = [(float(h), float(p)) for h, p in re.findall(
    r"maxHealth: ([\d.]+), power: ([\d.]+)",
    cfg[cfg.index("export const ENEMY_TRAINING_SCALE"):cfg.index("export function byTier")])]
assert len(SCALE) == 10, len(SCALE)

art = rd("packages/sim/test/r-bal-12-artists.ts")
ARTISTS = {}
for name, body in re.findall(r"(\w+): \[(.*?)\n  \],", art, re.S):
    ARTISTS[name] = [{"power": float(p), "health": float(h), "guard": float(g)}
                     for p, h, g in re.findall(r"power: ([\d.]+), health: ([\d.]+), guard: ([\d.]+)", body)]
assert set(ARTISTS) == {"typical", "trainsMore", "playsOnly"}

# r-challenge-p5.test.ts: every named bot is given ARTISTS.typical for that belt.
BOTS = ("kid", "newer", "careful")
BAND_HITS = (40, 80)
KO_MIN = 5
# The live band test multiplies Health and the already-scaled Power by this on its Challenge column.
# Live DIFFICULTY.challenge.enemyPowerScale is separate (read above). Both are reported.
BAND_CHALLENGE = 1.5

def real_seconds_to_ticks(seconds):
    ms = 1000 / TICKS / TEMPO
    return js_round(seconds * (1000 / ms))

PHASE_HOLD = real_seconds_to_ticks(1)

def telegraph(file_ticks, diff):
    d = DIFF[diff]
    fill = file_ticks - STD_WINDOW
    ticks = js_round(fill * d["fill"]) + d["window"]
    if diff == "challenge":
        ticks = max(MIN_WINDUP, ticks)
    return ticks

def scaled(base_h, base_p, belt, power_scale):
    h, p = SCALE[belt - 1]
    H = max(1, js_round(base_h * h))
    P = max(1, js_round(base_p * p * power_scale)) if base_p > 0 else 0
    return H, P

def load_boss():
    b = json.loads(rd("drafts/content/bosses/lost-lightbearer.json"))
    attacks = []
    for a in b["attacks"]:
        attacks.append({
            "name": a["name"],
            "strength": a["strength"],
            "telegraphTicks": a["telegraphTicks"],
            "recoverTicks": a["recoverTicks"],
            "dashOnly": bool(a.get("dashOnly")),
            "counterable": a.get("counterable", not a.get("dashOnly", False)),
        })
    return b, attacks

def load_simple(path):
    e = json.loads(rd(path))
    atk = e.get("attack") or e["attacks"][0]
    return e, atk

BOSS, ATTACKS = load_boss()
WISP, WISP_ATK = load_simple("drafts/content/enemies/storm-wisp.json")
COOK, COOK_ATK = None, None
cook = json.loads(rd("content/enemies/hearth-cook.json"))
COOK = cook
COOK_PIN = next(a for a in cook["attacks"] if a["name"] == "rolling pin lane")

BELTS = ["White", "Yellow", "Orange", "Green", "Blue", "Red", "Red/Black", "Brown", "Brown/Black", "Black"]
# Summit rooms set minBeltTier 10, and a belt uses only its own floor set. Black belt degrees are not a tier yet.
BOSS_BELTS = [10]

def artist_row(student, belt):
    return ARTISTS[student][belt - 1]

def hits_to_beat(health, artist, guard, strength=1):
    return math.ceil(health / damage(artist["power"], strength, guard))

def ko_hits(artist, enemy_power, strength):
    return math.ceil(artist["health"] / damage(enemy_power, strength, artist["guard"]))

def main():
    print(f"PHASE_HOLD_TICKS {PHASE_HOLD}  (realSecondsToTicks(1); tempo {TEMPO}, {TICKS} ticks/s)")
    print(f"DIFFICULTY {DIFF}")
    print(f"MIN_WINDUP {MIN_WINDUP}  Challenge unlocks at belt {CHALLENGE_FROM}")
    print(f"Strike strength {STRIKE}  Guardian band {BAND_HITS} basic hits, KO at least {KO_MIN}")
    print(f"Boss base H/P/G {BOSS['maxHealth']}/{BOSS['power']}/{BOSS['guard']}")
    print(f"Black scale row {SCALE[9]}")
    print()
    print("== Wind-up ticks from telegraphTicks() ==")
    print(f"{'attack':<16} {'file':>4} {'guided':>7} {'standard':>8} {'challenge':>9}")
    for a in ATTACKS:
        cells = [telegraph(a["telegraphTicks"], d) for d in ("guided", "standard", "challenge")]
        print(f"{a['name']:<16} {a['telegraphTicks']:>4} {cells[0]:>7} {cells[1]:>8} {cells[2]:>9}")
    print(f"{'wisp crackle':<16} {WISP_ATK['telegraphTicks']:>4} " +
          " ".join(f"{telegraph(WISP_ATK['telegraphTicks'], d):>7}" for d in ("guided", "standard", "challenge")))
    print()

    print("== Bots (kid, newer, careful) use the typical Artist. Belt 10 only. ==")
    print("Live fight: Guided Power x0.75, Standard x1, Challenge x1 (Health never scaled by the setting).")
    print("Band gate: the R-BAL-12 test also checks a Challenge column at x1.5 Health and Power. Shown as 'band x1.5'.")
    header = f"{'bot':<10} {'diff':<12} {'beat':>5} {'KO 0.8':>6} {'KO 1.0':>6} {'KO 1.2':>6} {'band':>8}"
    print(header)
    fails = []
    for bot in BOTS:
        a = artist_row("typical", 10)
        for diff, pscale, hscale, label in (
            ("guided", DIFF["guided"]["power"], 1, "guided"),
            ("standard", DIFF["standard"]["power"], 1, "standard"),
            ("challenge", DIFF["challenge"]["power"], 1, "challenge"),
            ("band", 1, BAND_CHALLENGE, "band x1.5"),
        ):
            H, P = scaled(BOSS["maxHealth"], BOSS["power"], 10, pscale)
            H_beat = H * hscale
            beat = hits_to_beat(H_beat, a, BOSS["guard"])
            kos = {s: ko_hits(a, P if label != "band x1.5" else scaled(BOSS["maxHealth"], BOSS["power"], 10, 1)[1] * BAND_CHALLENGE, s)
                   for s in (0.8, 1.0, 1.2)}
            # For the band column, Power is the unscaled-by-difficulty value times 1.5, matching bandCheck().
            if label == "band x1.5":
                P_band = scaled(BOSS["maxHealth"], BOSS["power"], 10, 1)[1] * BAND_CHALLENGE
                kos = {s: ko_hits(a, P_band, s) for s in (0.8, 1.0, 1.2)}
            ok_beat = BAND_HITS[0] <= beat <= BAND_HITS[1]
            ok_ko = all(v >= KO_MIN for v in kos.values())
            flag = "ok" if ok_beat and ok_ko else "OUT"
            if flag != "ok":
                fails.append((bot, label, beat, kos))
            print(f"{bot:<10} {label:<12} {beat:>5} {kos[0.8]:>6} {kos[1.0]:>6} {kos[1.2]:>6} {flag:>8}")
    print()

    print("== R-BAL-12 model students, belt 10 (the band test's three kids) ==")
    print(f"{'student':<12} {'diff':<12} {'beat':>5} {'KO 0.8':>6} {'KO 1.0':>6} {'KO 1.2':>6} {'band':>8}  scaled H / P")
    for student in ("typical", "trainsMore", "playsOnly"):
        a = artist_row(student, 10)
        for label, pscale, hmult, use_band_p in (
            ("guided", DIFF["guided"]["power"], 1, False),
            ("standard", 1, 1, False),
            ("challenge", DIFF["challenge"]["power"], 1, False),
            ("band x1.5", 1, BAND_CHALLENGE, True),
        ):
            H, P = scaled(BOSS["maxHealth"], BOSS["power"], 10, pscale)
            beat = hits_to_beat(H * hmult, a, BOSS["guard"])
            p_for_ko = (scaled(BOSS["maxHealth"], BOSS["power"], 10, 1)[1] * BAND_CHALLENGE) if use_band_p else P
            kos = {s: ko_hits(a, p_for_ko, s) for s in (0.8, 1.0, 1.2)}
            ok = BAND_HITS[0] <= beat <= BAND_HITS[1] and all(v >= KO_MIN for v in kos.values())
            print(f"{student:<12} {label:<12} {beat:>5} {kos[0.8]:>6} {kos[1.0]:>6} {kos[1.2]:>6} {'ok' if ok else 'OUT':>8}  {H} / {P if not use_band_p else js_round(p_for_ko) if False else p_for_ko}")
            if not ok:
                fails.append((student, label, beat, kos))
    print()

    print("== Helper: Storm Wisp at belt 10, same students, strength from its file ==")
    print(f"base H/P/G {WISP['maxHealth']}/{WISP['power']}/{WISP['guard']} strength {WISP_ATK['strength']}")
    for student in ("typical", "trainsMore", "playsOnly"):
        a = artist_row(student, 10)
        for label, pscale, hmult in (("guided", DIFF["guided"]["power"], 1), ("standard", 1, 1), ("challenge", 1, 1), ("band x1.5", 1, BAND_CHALLENGE)):
            H, P = scaled(WISP["maxHealth"], WISP["power"], 10, pscale)
            p_ko = scaled(WISP["maxHealth"], WISP["power"], 10, 1)[1] * BAND_CHALLENGE if label == "band x1.5" else P
            beat = hits_to_beat(H * hmult, a, WISP["guard"])
            ko = ko_hits(a, p_ko, WISP_ATK["strength"])
            print(f"  {student:<12} {label:<12} beat {beat:>3}  KO {ko:>3}")
    print()

    print("== Live Hearth Cook rolling pin (strength from the live file), Orange belt 3, for comparison ==")
    print(f"pin strength {COOK_PIN['strength']}  cook base H/P/G {cook['maxHealth']}/{cook['power']}/{cook['guard']}")
    for student in ("typical", "trainsMore", "playsOnly"):
        a = artist_row(student, 3)
        H, P = scaled(cook["maxHealth"], cook["power"], 3, 1)
        beat = hits_to_beat(H, a, cook["guard"])
        ko1 = ko_hits(a, P, 1)
        ko_pin = ko_hits(a, P, COOK_PIN["strength"])
        P15 = scaled(cook["maxHealth"], cook["power"], 3, 1)[1] * BAND_CHALLENGE
        ko_pin_b = ko_hits(a, P15, COOK_PIN["strength"])
        beat_b = hits_to_beat(H * BAND_CHALLENGE, a, cook["guard"])
        print(f"  {student:<12} standard beat {beat} KO@1 {ko1} KO@pin {ko_pin}   band x1.5 beat {beat_b} KO@pin {ko_pin_b}")

    print()
    print(f"FAILS {len(fails)}")
    for f in fails:
        print(" ", f)

if __name__ == "__main__":
    main()
