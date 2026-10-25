# R-BAL-12: Real training feeds Power, Health and Guard

Status: proposal for Jay and the Programmer. No game code, content or work board changed.
Proof: `python3 drafts/planning/r-bal-12-sim.py` (imports `r-bal-9-sim.py`). Output pasted at the end.
Labels: **[CODE]** from main, **[DECIDED]** Jay/Manager, **[FITTED]** chosen to hit a target, **[GUESS]** needs a playtest.

## Read this first

- **Today, real training gives no combat stats.** `characterSetup` (`packages/sim/src/progression.ts:118-130`) builds Health and Power from gear plus level, and Guard from gear only. Training reaches combat only through:
  - perks from sign-offs (`training.ts:181-190`)
  - Forms (no Power or Health; `content/abilities/abilities.json` forms have powerScale 0)
  - the Virtue button (`world.ts:711-730`).

  Training Points are counted (`training.ts:259`) but used only in the hidden Power Rating (`power.ts:66-67`). So in combat, levels are about 70% of strength today.
- **Plan:** every piece of real training adds a small flat stat, for good. Nothing is ever taken away. No timers, no streaks, no decay.

  | Real training | Adds |
  |---|---|
  | **Sign-off** (one requirement: kata, self-defense, kick combo) | Power + Health |
  | **Training Point** (15 approved home minutes) | Health + a little Power |
  | **Character stripe** (Virtue) | Guard |

- **Result (typical student):** training is the biggest source at every belt. It is 47% of combat strength at white (levels 34%, gear 20%), 55% at yellow, and 65% at black.
  - **Trains more, plays less** (half the runs, 45 min/week): 60-72% training. They are as strong as the typical student, with more Health.
  - **Plays only** (class sign-offs, no home practice): still 43-64% training, because class sign-offs are real training. They stay in band (a mid enemy takes 5 hits; they get knocked out in 10-11 hits, against a floor of 8).
- **Cost:** the expected Artist gets stronger, so enemies must scale up by one multiplier per belt (Health ×1.22 to ×5.70, Power ×1.24 to ×6.11). That can be a runtime multiplier, so the 42 draft files from #191 don't need editing again.

## 1. Method

- **Budget:** full training at belt t is worth `K × (levels at the belt cap + gear budget)`, in the same shared unit as #188 (ln of Power × Health × (1 + Guard/100)).
  - K = 1.0 **[FITTED]**. It is the smallest round value where training beats levels and gear at white and is over 50% from yellow on.
  - K = 0.8 gives 41% at white, which ties with levels.
- **Split between sources:** sign-offs 60%, Training Points 25%, virtues 15%. These are the Power Rating shares .40/.17/.10 (`config.ts:248-250`) **[CODE ratio]**.
- **Stat mix** **[GUESS, flavour]**:

  | Source | Power | Health | Guard |
  |---|---|---|---|
  | Sign-offs | 60% | 40% | |
  | Training Points | 30% | 70% | |
  | Stripes | | | 100% |

- **Turned into flat stats** on the level-plus-full-gear Artist at the belt cap. The value of one unit = (cumulative total at belt t − at belt t−1) ÷ units per belt.
- **Units per belt:**
  - 7 requirements (fixtures) **[CODE]**
  - 28 Training Points, the cap from `power.ts:66` (`requirements × upgradesPerAbility 4`) **[CODE]**
  - 2 stripes (`config.ts:257`) **[CODE]**
- **Earlier belts count as signed:** legacy requirements of earlier belts count as signed (`training.ts:163`). A transfer student starting at green gets white-to-yellow training stats at once (no catch-up punishment).
- **Shares** are fair shares (average over all orders of adding levels, gear and training), averaged over the belt.
- **Student guesses:**

  | Student | Home practice | Runs |
  |---|---|---|
  | Typical | 20 min/week | 8 a week |
  | Trains more, plays less | 45 min/week | 4 a week |
  | Plays only | 0 | 8 a week |

  Everyone signs off 7 requirements across the belt and earns 2 stripes **[GUESS]**. Catch-up XP ×2 below the expected level (`config.ts:220`) **[CODE]**.

## 2. Values

| Belt | Sign-off: Power | Sign-off: Health | 1 TP: Power | 1 TP: Health | Stripe: Guard | Full belt adds P / H / G |
|---|---|---|---|---|---|---|
| white | 0.71 | 4.1 | 0.03 | 0.74 | 6.4 | 5.9 / 49 / 12.9 |
| yellow | 1.49 | 6.9 | 0.06 | 1.20 | 6.4 | 12.1 / 82 / 12.8 |
| orange | 2.44 | 9.2 | 0.09 | 1.57 | 6.1 | 19.5 / 109 / 12.2 |
| green | 3.41 | 11.8 | 0.11 | 1.96 | 5.4 | 27.0 / 137 / 10.8 |
| blue | 4.35 | 14.3 | 0.13 | 2.33 | 5.3 | 34.1 / 165 / 10.7 |
| red | 5.91 | 16.9 | 0.16 | 2.71 | 4.9 | 46.0 / 194 / 9.7 |
| red-black | 7.03 | 19.3 | 0.18 | 3.05 | 5.0 | 54.3 / 220 / 10.0 |
| brown | 8.05 | 21.9 | 0.19 | 3.43 | 4.5 | 61.8 / 249 / 9.0 |
| brown-black | 10.17 | 24.6 | 0.24 | 3.80 | 4.4 | 77.9 / 279 / 8.7 |
| black | 11.72 | 27.1 | 0.26 | 4.14 | 4.3 | 89.3 / 306 / 8.5 |

All values are **[FITTED]** (K, split, mix). A unit keeps the value of the belt it was earned at.

## 3. Shares by belt (sim)

| Belt | Typical (training / levels / gear) | Trains more, plays less | Plays only |
|---|---|---|---|
| white | 47 / 34 / 20 | 60 / 20 / 20 | 43 / 36 / 21 |
| yellow | 55 / 29 / 17 | 72 / 19 / 9 | 51 / 31 / 18 |
| green | 61 / 23 / 16 | 72 / 17 / 11 | 59 / 24 / 17 |
| red | 64 / 20 / 16 | 71 / 17 / 13 | 62 / 21 / 17 |
| black | 65 / 17 / 17 | 69 / 16 / 15 | 64 / 18 / 18 |

## 4. Programmer-ready

1. **`packages/sim/src/config.ts`** (after `TRAINING_POINTS`, line 233): add `TRAINING_STATS` and `ENEMY_TRAINING_SCALE`:
```ts
export const TRAINING_STATS = {
  'white': { signOff: { power: 0.71, maxHealth: 4.1 }, trainingPoint: { power: 0.03, maxHealth: 0.74 }, stripe: { guard: 6.4 } },
  'yellow': { signOff: { power: 1.49, maxHealth: 6.9 }, trainingPoint: { power: 0.06, maxHealth: 1.20 }, stripe: { guard: 6.4 } },
  'orange': { signOff: { power: 2.44, maxHealth: 9.2 }, trainingPoint: { power: 0.09, maxHealth: 1.57 }, stripe: { guard: 6.1 } },
  'green': { signOff: { power: 3.41, maxHealth: 11.8 }, trainingPoint: { power: 0.11, maxHealth: 1.96 }, stripe: { guard: 5.4 } },
  'blue': { signOff: { power: 4.35, maxHealth: 14.3 }, trainingPoint: { power: 0.13, maxHealth: 2.33 }, stripe: { guard: 5.3 } },
  'red': { signOff: { power: 5.91, maxHealth: 16.9 }, trainingPoint: { power: 0.16, maxHealth: 2.71 }, stripe: { guard: 4.9 } },
  'red-black': { signOff: { power: 7.03, maxHealth: 19.3 }, trainingPoint: { power: 0.18, maxHealth: 3.05 }, stripe: { guard: 5.0 } },
  'brown': { signOff: { power: 8.05, maxHealth: 21.9 }, trainingPoint: { power: 0.19, maxHealth: 3.43 }, stripe: { guard: 4.5 } },
  'brown-black': { signOff: { power: 10.17, maxHealth: 24.6 }, trainingPoint: { power: 0.24, maxHealth: 3.80 }, stripe: { guard: 4.4 } },
  'black': { signOff: { power: 11.72, maxHealth: 27.1 }, trainingPoint: { power: 0.26, maxHealth: 4.14 }, stripe: { guard: 4.3 } },
} as const;
export const ENEMY_TRAINING_SCALE = {
  white: { maxHealth: 1.22, power: 1.24 },
  yellow: { maxHealth: 1.60, power: 1.70 },
  orange: { maxHealth: 2.04, power: 2.22 },
  green: { maxHealth: 2.52, power: 2.74 },
  blue: { maxHealth: 3.02, power: 3.29 },
  red: { maxHealth: 3.52, power: 3.85 },
  'red-black': { maxHealth: 4.05, power: 4.40 },
  brown: { maxHealth: 4.58, power: 4.96 },
  'brown-black': { maxHealth: 5.12, power: 5.54 },
  black: { maxHealth: 5.70, power: 6.11 },
} as const;
```
2. **New `trainingStats(training)` in `packages/sim/src/training.ts`** (pure function), returning `{ power, maxHealth, guard }`:
   - **Sign-offs:** for each `training.requirements` entry with `signedOff` true (legacy counts), add `TRAINING_STATS[r.belt].signOff`.
   - **Stripes:** for each feed stripe, add `TRAINING_STATS[s.belt].stripe`, at most `POWER.stripesPerBelt` per belt (the same limit as `training.ts:232`). Store the stripe list or the per-belt counts on `TrainingState` (today only `totalStripes`, line 251).
   - **Training Points:** the n-th point (1-based) belongs to belt `ceil(n / 28)`. Count only points up to `28 × tier` (the same cap as `power.ts:66`).
3. **`progression.ts:122-126` `characterSetup`:** add `trainingStats` to `maxHealth`, `power` and `guard`. Keep the existing `Math.round(…×10)/10` on power, and round health and guard the same way.
4. **Enemy spawn** (where `e.def.maxHealth` / `power` are read in `world.ts`): multiply by `ENEMY_TRAINING_SCALE[tier]` for the run's belt tier. Wind-ups never scale. Or, instead, multiply the draft and live enemy files (DECIDE-B).
5. **Power Rating:** no change. `power.ts:63-71` already counts the same three sources.
6. **UI:** the Training screen shows "+0.7 Power, +4 Health" on each signed requirement, "+6 Guard" on each stripe, and the Training Point total. Words only, no meters that drain.
7. **Tests:**
   - Training stats never go down when the feed adds an item.
   - A legacy belt gives the full belt values.
   - TP above the cap adds nothing.
   - The plays-only fixture still clears a mid enemy in 5 hits on Standard.

## 5. Board items (for the Manager; work board not edited)

| ID | Owner | Task | Done when | Waits on |
|---|---|---|---|---|
| R-BAL-12a | Jay | Pick DECIDE-A/B/C | Answers in decisions.md | this PR |
| R-BAL-12b | Programmer | Section 4 items 1-3, 5, 7 | Tests pass; a white fixture with 7 sign-offs + 2 stripes shows +5 Power, +29 Health, +13 Guard over none | R-BAL-12a |
| R-BAL-12c | Programmer | Enemy scale (item 4) | `npm run balance` in band for the typical fixture at every belt | R-BAL-12b |
| R-BAL-12d | Artist/UI | Item 6 words on the Training screen | Every signed item shows its gift | R-BAL-12b |
| R-BAL-7 | Tester | Kid playtest, now with training stats | Clear rates in the targets for typical and plays-only kids | R-BAL-12c |

## 6. Decisions for Jay

- **DECIDE-A, how big is training?**
  - K = 1.0 (recommended): training is the top source at every belt.
  - K = 0.8: training ties levels at white and leads from yellow on.
  - K = 1.6: about 60-73% training, but enemy numbers grow about 16× by black.
- **DECIDE-B, how enemies keep up:** a runtime `ENEMY_TRAINING_SCALE` (recommended, one place to tune), or multiply the 42 draft and 4 live files.
- **DECIDE-C, kids with no home practice:** they stay in band (knocked out in 10 hits against a floor of 8, mid enemy). Do we want that gap at all? Guided difficulty (`config.ts:33`) is there for any kid who needs it. Nothing is taken from anyone.

## Flags

- Training stat values have decimals at white (+0.71 Power). Show rounded numbers to kids.
- Gear's share rises to about 16-20% here (from about 30% in #188), because training is added in. Levels drop from about 70% to about 20-35%.
- These are **[GUESS]**: 20 min/week typical practice, sign-offs spread evenly across the belt, stripes at months 1 and 2.
- The "plays less" gear model reuses the typical drop timeline at half speed.
- Feed stripes have a `belt` field (`training.ts:232`), but `TrainingState` keeps only the count. The Programmer must keep the per-belt counts.

## Sim output

```
== 1. Value of one piece of real training, by the belt it is earned at (flat stats, adds only) ==
K_TRAIN = 1.0 [FITTED]; split sign-offs/TP/virtues = 60%/25%/15% [CODE ratio]
       belt  sign-off: Power Health   1 TP: Power Health  stripe: Guard   full belt adds P/H/G
      white        0.71        4.1      0.03      0.74            6.4   5.9/49/12.9
     yellow        1.49        6.9      0.06      1.20            6.4   12.1/82/12.8
     orange        2.44        9.2      0.09      1.57            6.1   19.5/109/12.2
      green        3.41       11.8      0.11      1.96            5.4   27.0/137/10.8
       blue        4.35       14.3      0.13      2.33            5.3   34.1/165/10.7
        red        5.91       16.9      0.16      2.71            4.9   46.0/194/9.7
  red-black        7.03       19.3      0.18      3.05            5.0   54.3/220/10.0
      brown        8.05       21.9      0.19      3.43            4.5   61.8/249/9.0
brown-black       10.17       24.6      0.24      3.80            4.4   77.9/279/8.7
      black       11.72       27.1      0.26      4.14            4.3   89.3/306/8.5

== 2. typical: runs x1.0, 20 approved min/week [GUESS] — belt-average Artist and share of strength ==
       belt  Power Health Guard   training  levels  gear
      white   16.3    145   8.8       47%     34%   20%
     yellow   31.3    238  23.4       55%     29%   17%
     orange   54.8    357  38.4       59%     25%   16%
      green   87.1    499  51.2       61%     23%   16%
       blue  128.3    664  63.4       63%     21%   16%
        red  182.7    854  74.9       64%     20%   16%
  red-black  250.4   1066  86.2       64%     19%   17%
      brown  327.6   1303  97.1       65%     18%   17%
brown-black  421.3   1564 107.0       65%     18%   17%
      black  533.7   1847 116.7       65%     17%   17%

== 2. trains more, plays less: runs x0.5, 45 approved min/week [GUESS] — belt-average Artist and share of strength ==
       belt  Power Health Guard   training  levels  gear
      white   15.4    144   8.6       60%     20%   20%
     yellow   28.1    238  22.0       72%     19%    9%
     orange   51.0    377  36.0       72%     18%   10%
      green   83.3    542  49.7       72%     17%   11%
       blue  125.4    740  61.8       71%     17%   12%
        red  180.1    970  73.3       71%     17%   13%
  red-black  249.0   1229  84.5       70%     16%   13%
      brown  330.6   1519  95.3       70%     16%   14%
brown-black  427.4   1842 105.7       69%     16%   15%
      black  542.6   2192 115.4       69%     16%   15%

== 2. plays only (class, no home practice): runs x1.0, 0 approved min/week [GUESS] — belt-average Artist and share of strength ==
       belt  Power Health Guard   training  levels  gear
      white   16.0    139   8.8       43%     36%   21%
     yellow   30.4    219  23.4       51%     31%   18%
     orange   52.8    318  38.4       56%     27%   17%
      green   83.8    438  51.2       59%     24%   17%
       blue  123.2    576  63.4       61%     23%   17%
        red  175.5    735  74.9       62%     21%   17%
  red-black  240.8    912  86.2       62%     20%   17%
      brown  315.2   1109  97.1       63%     19%   18%
brown-black  405.8   1327 107.0       63%     19%   18%
      black  514.5   1563 116.7       64%     18%   18%

== 3. Enemy re-scale vs the #188 expected Artist (typical student), Health x and Power x ==
      white  Health x1.22  Power x1.24
     yellow  Health x1.60  Power x1.70
     orange  Health x2.04  Power x2.22
      green  Health x2.52  Power x2.74
       blue  Health x3.02  Power x3.29
        red  Health x3.52  Power x3.85
  red-black  Health x4.05  Power x4.40
      brown  Health x4.58  Power x4.96
brown-black  Health x5.12  Power x5.54
      black  Health x5.70  Power x6.11

== 4. A mid enemy built for the typical student (5 hits, KO 12), faced by each student, Standard ==
       belt                   typical   trains more, plays less  plays only (class, no ho
      white          beat  5 KO 12 in          beat  5 KO 12 in          beat  5 KO 11 in
     yellow          beat  5 KO 12 in          beat  5 KO 12 in          beat  5 KO 11 in
     orange          beat  5 KO 12 in          beat  5 KO 12 in          beat  5 KO 11 in
      green          beat  5 KO 12 in          beat  5 KO 13 in          beat  5 KO 10 in
       blue          beat  5 KO 12 in          beat  5 KO 13 in          beat  5 KO 10 in
        red          beat  5 KO 12 in          beat  5 KO 13 in          beat  5 KO 10 in
  red-black          beat  5 KO 12 in          beat  5 KO 14 in          beat  5 KO 10 in
      brown          beat  5 KO 12 in          beat  5 KO 14 in          beat  5 KO 10 in
brown-black          beat  5 KO 12 in          beat  5 KO 14 in          beat  5 KO 10 in
      black          beat  5 KO 12 in          beat  5 KO 14 in          beat  5 KO 10 in
```
