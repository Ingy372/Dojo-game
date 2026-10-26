#!/usr/bin/env python3
"""R-BAL-14: charm amounts. Each charm at its tier is worth about the same as that tier's
Jade (powerScale) cap from #188 (GEAR_CAPS in packages/sim/src/config.ts), then capped by the
matching one-run Insight so run boosts stay special. Rarity = cap x 25/50/75/100% (R-BAL-9 guess).
Labels: [CODE] from main, [GUESS] needs a playtest. Run: python3 drafts/planning/r-bal-14-sim.py"""
import math

JADE = {'white': .04, 'yellow': .08, 'orange': .11, 'green': .14, 'blue': .16, 'red': .19,
        'red-black': .21, 'brown': .22, 'brown-black': .24, 'black': .26}  # [CODE] GEAR_CAPS
RARITY = [.25, .50, .75, 1.0]                                            # [GUESS] R-BAL-9

# [CODE] config.ts: Focus 5 per hit, Strike 2.5x for 30 Focus, basic 1x; Block x0.5; COUNTER 6 ticks (Standard)
HITS_PER_STRIKE = 30 / 5
STRIKE, BASIC = 2.5, 1.0
# [GUESS] expected-player behaviour (no measured numbers exist yet)
BASIC_SHARE = 0.7      # share of damage from basic attacks
BLOCKED = 0.4          # share of enemy hits the kid blocks
STAGGER_SHARE = 0.25   # share of damage dealt to staggered enemies
LOW_HP_TIME = 0.25     # share of fight time below half health

def focus_gain(j):   # more Focus -> more Strikes; damage per cycle (6 basics + 1 strike) grows
    cyc = HITS_PER_STRIKE * BASIC + STRIKE
    return cyc * j / STRIKE
def block_cut(j):    # damage taken per enemy hit = (1-b) + b(0.5-c); want it 1/(1+j) as big
    t0 = (1 - BLOCKED) + BLOCKED * 0.5
    return t0 * (j / (1 + j)) / BLOCKED
def attack_speed(j): # basic DPS x 1/(1-a) on BASIC_SHARE of damage
    return 1 - 1 / (1 + j / BASIC_SHARE)
def stagger(j):
    return j / STAGGER_SHARE
def low_hp_focus(j):
    return focus_gain(j) / LOW_HP_TIME

# id: (tier, equal-value fn or None, Insight/limit cap [CODE insights.json unless noted])
CHARMS = {
    'yellow-charm-1 Seed (focusGain)':        ('yellow', focus_gain, 0.20),   # cap = Calm Mind 0.2 [CODE]
    'orange-charm-1 Kettle (blockCut)':       ('orange', block_cut, 0.25),    # [GUESS] cap: half of Block's 0.5
    'green-charm-1 Water Jar (attackSpeed)':  ('green', attack_speed, 0.25),
    'blue-charm-1 Clear Drop (staggerBonus)': ('blue', stagger, 0.30),
    'red-charm-1 Forge Song (comboSpeed)':    ('red', None, 0.30),            # [GUESS] 75% of Insight 0.4 (walk speed, no FS value)
    'red-black-charm-1 Kind Stone (lowHealthFocus, +share)': ('red-black', low_hp_focus, 1.00),  # Insight = x2
}

def rnd(x):  # whole percent
    return round(x * 100) / 100

if __name__ == '__main__':
    print(f"{'charm':48} {'Jade cap':>8} {'equal':>7} {'cap':>5} {'epic':>5}  amounts (c/u/r/e)")
    for name, (tier, fn, cap) in CHARMS.items():
        j = JADE[tier]
        eq = fn(j) if fn else cap
        epic = min(eq, cap)
        am = [rnd(epic * r) for r in RARITY]
        print(f"{name:48} {j:8.2f} {eq:7.2f} {cap:5.2f} {epic:5.2f}  {am}")
    print("\nfeather (counterWindow): ticks, not a share [CODE effects.ts]. +1 tick = +17% on Standard (6), +10% Guided (10), +25% Challenge (4).")
    print("great lamp (dashOnBlock): boolean in code = full recharge, so 100% at every rarity.")
    # check: no charm beats its tier's Jade cap in fight-strength units
    for name, (tier, fn, cap) in CHARMS.items():
        if fn:
            epic = min(fn(JADE[tier]), cap)
            inv = {focus_gain: lambda a: a * STRIKE / (HITS_PER_STRIKE + STRIKE),
                   block_cut: lambda c: 1 / (1 - c * BLOCKED / ((1 - BLOCKED) + BLOCKED * .5)) - 1,
                   attack_speed: lambda a: BASIC_SHARE * (1 / (1 - a) - 1),
                   stagger: lambda s: s * STAGGER_SHARE,
                   low_hp_focus: lambda p: p * LOW_HP_TIME * STRIKE / (HITS_PER_STRIKE + STRIKE)}[fn](epic)
            ok = math.log(1 + inv) <= math.log(1 + JADE[tier]) + 1e-9
            print(f"check {name:48} worth {inv:5.3f} vs Jade {JADE[tier]:.2f}: {'OK' if ok else 'TOO STRONG'}")
