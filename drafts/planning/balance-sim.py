#!/usr/bin/env python3
"""R-BAL balance check. Plain Python 3, no packages, no game code.
Numbers are copied from packages/sim/src/config.ts and content/ on main (Oct 24, 2026).
Run:  python3 drafts/planning/balance-sim.py
"""
import random, math

# --- copied from config.ts / content (see balance-research.md for file:line) ---
P_HEALTH, P_POWER, P_GUARD = 100, 10, 0          # COMBAT.player
HEALTH_PER_LVL, POWER_PER_LVL = 3, 0.4          # PROGRESSION
LEVELS_PER_TIER = 10
ENEMIES = {  # name: (maxHealth, power, guard, telegraphTicks)
    "swarmer": (40, 8, 0, 12), "shield": (90, 15, 15, 14), "bopper": (110, 16, 10, 16),
    "brute": (180, 25, 25, 16), "floor-keeper": (700, 26, 30, 18)}
RARITY = {"common": 70, "uncommon": 22, "rare": 7, "epic": 1}
RARE_PER_DRY_RUN, GUARANTEED_ON_RUN = 3, 5
RUNS_PER_WEEK, RUN_XP, WEEKS_PER_MONTH, CAP_SHARE = 8, 110, 4.35, 0.75

def damage(power, strength, guard, bonus=0.0):   # combat.ts:10-13
    return max(1, round(power * strength * 100 / (100 + guard) * (1 + bonus)))

def player_at(level):
    return P_HEALTH + HEALTH_PER_LVL * (level - 1), P_POWER + POWER_PER_LVL * (level - 1)

print("== 1. Hits for the player to beat each enemy (basic hit, strength 1, no gear) ==")
print("level  " + "  ".join(f"{n:>12}" for n in ENEMIES))
for lvl in (1, 10, 20, 50, 100):
    _, pw = player_at(lvl)
    print(f"{lvl:>5}  " + "  ".join(f"{math.ceil(h / damage(pw, 1, g)):>12}" for h, _, g, _ in ENEMIES.values()))

print("\n== 2. Enemy hits to knock out the player (no Block, no gear) ==")
for lvl in (1, 10, 50, 100):
    hp, _ = player_at(lvl)
    print(f"{lvl:>5}  " + "  ".join(f"{math.ceil(hp / damage(p, 1, P_GUARD)):>12}" for _, p, _, _ in ENEMIES.values()))

print("\n== 3. XP per belt tier (typical 3 months in rank) ==")
months = 3
tier_xp = max(100, round(months * WEEKS_PER_MONTH * CAP_SHARE * RUNS_PER_WEEK * RUN_XP))
weeks = tier_xp / (RUNS_PER_WEEK * RUN_XP)
print(f"tier XP {tier_xp}, about {weeks:.1f} weeks at {RUNS_PER_WEEK} runs/week to reach the cap")
steps = 10; tot = steps * (steps + 1) / 2
per = [round(tier_xp * s / tot) for s in range(1, steps + 1)]
print("XP per level step (tier 2+):", per, " runs per step:", [round(x / RUN_XP, 1) for x in per])
# D3 (decided): last step <= 10 runs. Soften weights k -> k+SOFTEN (guess); tier total unchanged.
SOFTEN = 11
tot2 = sum(s + SOFTEN for s in range(1, steps + 1))
per2 = [round(tier_xp * (s + SOFTEN) / tot2) for s in range(1, steps + 1)]
runs2 = [round(x / RUN_XP, 1) for x in per2]
print(f"softened (k+{SOFTEN}):", per2, " runs per step:", runs2)
print("D3 check (no step over 10 runs, total unchanged):",
      "PASS" if max(runs2) <= 10 and abs(sum(per2) - tier_xp) <= steps else "FAIL")

print("\n== 4. Bad-luck counter: runs until the first Rare-or-better ==")
def roll(dry):
    boost = min(RARITY["common"], dry * RARE_PER_DRY_RUN)
    w = {"common": RARITY["common"] - boost, "uncommon": RARITY["uncommon"],
         "rare": RARITY["rare"] + boost, "epic": RARITY["epic"]}
    r = random.uniform(0, sum(w.values()))
    for k, v in w.items():
        r -= v
        if r <= 0: return k
    return "epic"
def runs_to_rare(rolls_per_run, protect, rng_runs=20000):
    out = []
    for _ in range(rng_runs):
        dry, n = 0, 0
        while True:
            n += 1
            if protect and n >= GUARANTEED_ON_RUN: out.append(n); break
            if any(roll(dry if protect else 0) in ("rare", "epic") for _ in range(rolls_per_run)):
                out.append(n); break
            dry = min(dry + 1, GUARANTEED_ON_RUN - 1)
    out.sort()
    return sum(out) / len(out), out[int(0.9 * len(out))], out[-1]
random.seed(1)
for rolls in (2, 4, 6):   # rolls per run: a guess, the real number depends on the rooms picked
    a = runs_to_rare(rolls, False); b = runs_to_rare(rolls, True)
    print(f"{rolls} rolls/run  no counter: mean {a[0]:.2f}, 90% by {a[1]}, worst {a[2]}   "
          f"with counter: mean {b[0]:.2f}, 90% by {b[1]}, worst {b[2]}")

print("\n== 5. Endless Ascent: 3% stronger per floor, no cap (D4 decided) ==")
for f in (10, 25, 50, 100):
    print(f"floor {f:>3}: x{1.03 ** f:.1f}")
print("Challenge (D5): enemy Health and Power x1.5; Endless and Challenge multiply.")

print("\n== 6. Effective health (EHP = Health x (1 + Guard/100)), exact for our damage formula ==")
for n, (h, _, g, _) in ENEMIES.items():
    print(f"{n:>12}: {h * (1 + g / 100):.0f}")
