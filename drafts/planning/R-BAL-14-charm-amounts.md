# R-BAL-14: Charm amounts

Status: proposal. Only drafts changed (gear.json amounts + this note + a sim). No game code, no work board.
Proof: `python3 drafts/planning/r-bal-14-sim.py`.
Labels: **[CODE]** from main, **[GUESS]** needs a playtest.

## Rule
- Each charm, at epic, is worth about the same as its tier's Jade cap from #188 (`GEAR_CAPS.powerScale`) **[CODE]**.
- Then it is capped by the matching one-run Insight, so Insights stay special.
- Rarity = 25 / 50 / 75 / 100% of the epic amount (R-BAL-9 rule).
- Behaviour shares are guesses: 70% of damage from basic hits, 40% of hits blocked, 25% of damage on staggered enemies, 25% of fight time below half health **[GUESS]**.

## Amounts [common, uncommon, rare, epic]

| Charm | Tier | Effect | Amounts | Why |
|---|---|---|---|---|
| Seed | yellow | focusGain | 5 / 10 / 15 / 20% | equal value 27%, capped at Calm Mind's 20% |
| Kettle | orange | blockCut | 5 / 10 / 15 / 20% | equal value; epic Block takes 30% instead of 50% |
| Water Jar | green | attackSpeed | 4 / 8 / 12 / 17% | equal value (Insight is 25%) |
| Clear Drop | blue | staggerBonus | 8 / 15 / 22 / 30% | equal value 64%, capped at Insight 30% |
| Forge Song | red | comboSpeed | 8 / 15 / 22 / 30% (every 10 hits, 3 s) | walking speed, no fight-strength value; 75% of Insight's 40% **[GUESS]** |
| Kind Stone | red-black | lowHealthFocus | +25 / 50 / 75 / 100% below half health | capped at Insight (x2) |
| Root Ring | brown | strikeCost | 3 / 5 / 8 / 10 Focus | equal value ~13, capped at 10 (a third of 30) **[GUESS]** |
| Feather | brown-black | counterWindow | +1 tick at every rarity | code counts ticks; 1 tick = +17% Standard, +10% Guided, +25% Challenge |
| Great Lamp | black | dashOnBlock | 100% at every rarity | code is on/off = full recharge |

Sim check: every charm is at or under its tier's Jade cap in fight strength (output in the sim).

## Things to know
- **Kind Stone:** stored as the extra share. The game multiplier is 1 + amount (the Insight stores 2 = x2).
- **Feather:** text changed to "COUNTER window lasts a little longer", because a {pct} would differ by difficulty.
- **Great Lamp / Feather** don't grow with rarity, because the code can't do part-charges or part-ticks.
- **Jade Charm** (white) still has [0.04, 0.06, 0.09, 0.12], above the #188 white cap of 0.04. Still open as R-BAL-9 DECIDE-1. Not changed here.
