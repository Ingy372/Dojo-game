# R-BAL-9: Gear caps per tier and expected-Artist targets

Status: proposal for Jay and the Programmer. No game code or content files are changed here.
Proof: `python3 drafts/planning/r-bal-9-sim.py` (Python 3, no packages). Its output is pasted at the end.

Labels: **[CODE]** = copied from main, **[DECIDED]** = Jay/Manager call, **[FITTED]** = chosen to hit a target, **[GUESS]** = needs a playtest.

## Read this first

- **Today's white gear is too strong for the 8% share.** At level 10, full white gear (4 Power, 30 Health, 8 Guard, 12% Jade) makes fights about 1.2× as much easier as levels 1-10 do. The Power Rating shares say gear should be worth 0.44× what levels are worth (8% ÷ 18%). So the cost curve cuts white caps to **1 / 10 / 3 / 4%**. This nerf is visible to kids, so it is decision **DECIDE-1**.
- **Later tiers:** each tier's caps grow with what levels give. Black belt caps are **34 / 211 / 17 / 26%**.
- **Gear's share:** with these caps, gear gives about 29-33% of the Artist's combat growth at every tier and levels give the rest. The PR shares give 8/(8+18) = 31%, so they match.
- **Training is not in the combat stats yet:** sign-offs, Training Points and virtues add nothing to Power, Health or Guard today. They add perks, forms and virtues, which are not measured here (see FLAG-1). So in combat, **levels are the main source of power** and gear is second.
- **The new expected Artist is weaker than the old straight-line guess** (white: Health 125 vs 139; black: Health 567 vs 652).
  - That makes nearly every enemy hit too hard. 41 of 42 drafts fail the "hits to knock out the Artist" floor on Challenge, and a few are also 1 hit over on hits to beat.
  - New numbers for every enemy are in section 4. All of them pass. The content files are **not** edited in this PR.
- **The four live enemies:** Brute, Floor-keeper and Shield get fixed numbers, and all pass. **The Swarmer also falls out** against the new Artist (4 hits to beat on Standard, 5 on Challenge), so it gets a fix too (FLAG-2).

## 1. Gear caps per tier (cost curve)

**Method** (Schreiber, "Transitive Mechanics and Cost Curves", S2 in `balance-research.md`): put every stat on one shared yardstick, then spend a fixed budget.

- **Shared unit:** `ln(FS)`, where fight strength `FS = Power × EHP` and `EHP = Health × (1 + Guard/100)`. This is exact for our damage formula (`combat.ts:10-13`). Adding +0.1 units makes every fight about 10% easier, whatever stat it came from.
- **How each stat converts** (for an Artist at P, H, G; small changes):

  | Stat | Units |
  |---|---|
  | +1 Power | 1/P |
  | +1 Health | 1/H |
  | +1 Guard | 1/(100+G) |
  | +a powerScale (Jade charm) | ln(1+a) |

  Example at level 10 (P 13.6, H 127, G 0): 1 Power = 0.074, 1 Health = 0.0079, 1 Guard = 0.01, so **1 Power ≈ 9.3 Health ≈ 7.4 Guard**. The old `gearScore` weights (`loot.ts:211`: Power 3, Health 0.5, Guard 1.5) value Guard 3× Health, but in combat the two are worth about the same. That only matters for the better/worse arrows (FLAG-4).
- **Budget per tier** = (8% ÷ 18%) × what levels give at the tier's level cap: `0.444 × ln(P_L × H_L / 1000)`, with L = 10 × tier. **[CODE ratio]**
- **Split of the budget:** Power 39%, Health 32%, Guard 12%, Jade 17%. **[FITTED]** This keeps today's white mix, so items feel the same, just smaller.
- **Cap for each stat:** Power = P_L × (e^(0.39 B) − 1), Health = H_L × (e^(0.32 B) − 1), Guard = 100 × (e^(0.12 B) − 1), Jade = e^(0.17 B) − 1, where B is the budget.

| Tier | Level cap | Budget (units) | Power | Health | Guard | Jade powerScale |
|---|---|---|---|---|---|---|
| white | 10 | 0.243 | 1 | 10 | 3 | 0.04 |
| yellow | 20 | 0.452 | 3 | 25 | 5 | 0.08 |
| orange | 30 | 0.620 | 6 | 41 | 8 | 0.11 |
| green | 40 | 0.762 | 9 | 60 | 9 | 0.14 |
| blue | 50 | 0.884 | 12 | 81 | 11 | 0.16 |
| red | 60 | 0.991 | 16 | 104 | 12 | 0.19 |
| red-black | 70 | 1.087 | 20 | 128 | 14 | 0.21 |
| brown | 80 | 1.174 | 24 | 154 | 15 | 0.22 |
| brown-black | 90 | 1.252 | 29 | 182 | 16 | 0.24 |
| black | 100 | 1.325 | 34 | 211 | 17 | 0.26 |

All caps are **[FITTED]** to the 8% share and today's white mix.

## 2. Expected Artist per tier (replaces the straight-line guess)

**Built from:**
- Level curve: +3 Health and +0.4 Power per level **[CODE]**.
- 3 months per belt **[DECIDED]**, reaching the cap at 75% of that time **[CODE]**, with (k+11) XP steps **[FITTED, R-BAL-5]**. Each tier starts at the previous tier's cap.
- Gear from a Monte Carlo of drops:
  - 2 drops per run **[GUESS]** and 8 runs a week **[CODE]**.
  - Today's rarity weights and bad-luck counter **[CODE]**.
  - 9 item bases (3 hands, 3 gi, 3 charms; the Jade charm is 1 of the 3) **[CODE]**.
  - Item = cap × 25 / 50 / 75 / 100% by rarity **[GUESS]**. Gear carries over between belts.
- Values are time-averaged over the whole belt, because that is who meets the tier's enemies.
- `power` below already includes the Jade powerScale, as in `world.ts:788`.
- Not included: training perks, forms, virtues, Strike and Counter (FLAG-1).

| Tier | Level (avg) | Power | Health | Guard | Jade powerScale |
|---|---|---|---|---|---|
| white | 6.6 | 13.4 | 125 | 2.4 | 0.027 |
| yellow | 16.2 | 19.5 | 166 | 4.1 | 0.056 |
| orange | 26.2 | 26.8 | 209 | 6.5 | 0.080 |
| green | 36.2 | 34.5 | 255 | 7.9 | 0.104 |
| blue | 46.2 | 42.5 | 301 | 9.3 | 0.124 |
| red | 56.2 | 51.8 | 351 | 10.5 | 0.149 |
| red-black | 66.2 | 61.8 | 403 | 12.1 | 0.170 |
| brown | 76.2 | 71.6 | 456 | 13.5 | 0.184 |
| brown-black | 86.2 | 82.2 | 510 | 14.5 | 0.198 |
| black | 96.2 | 93.7 | 567 | 15.6 | 0.214 |

**ENEMY_SCALE**, for an enemy that shows up later than its home tier: enemy Health × (Artist Power ratio), enemy Power × (Artist EHP ratio), both measured against white.

| Tier | white | yellow | orange | green | blue | red | red-black | brown | brown-black | black |
|---|---|---|---|---|---|---|---|---|---|---|
| Health × | 1.00 | 1.46 | 2.01 | 2.58 | 3.18 | 3.88 | 4.63 | 5.36 | 6.15 | 7.01 |
| Power × | 1.00 | 1.35 | 1.75 | 2.16 | 2.58 | 3.04 | 3.54 | 4.06 | 4.58 | 5.14 |

All **[FITTED]** from the table above.

## 3. Live enemies: fixed numbers (white tier; wind-ups unchanged)

Targets: hits to beat on Standard are 2 / 6 / 12 / 50, so that Challenge ×1.5 still lands inside each band. **[FITTED]**

| Enemy | File | Now H / P / G | New H / P / G | Beat S / C | KO S / C | Band |
|---|---|---|---|---|---|---|
| Swarmer | `content/enemies/swarmer.json:6-8` | 40 / 8 / 0 | **20 / 7 / 0** | 2 / 3 | 18 / 13 | 2-4, KO ≥ 12 |
| Shield | `content/enemies/shield.json:6-8` | 90 / 15 / 15 | **66 / 11 / 15** | 6 / 9 | 12 / 8 | 5-10, KO ≥ 8 |
| Brute | `content/enemies/brute.json:5-7` | 180 / 25 / 25 | **126 / 17 / 25** | 12 / 18 | 8 / 5 | 10-20, KO ≥ 5 |
| Floor-keeper | `content/enemies/floor-keeper.json:7-9` | 700 / 26 / 30 | **495 / 17 / 30** | 50 / 75 | 8 / 5 | 40-80, KO ≥ 5 |

## 4. C13 re-check and proposed numbers (content files not edited)

Against the new expected Artist, every draft except lantern-moth fails. Mostly it's the knock-out floor (they hit too hard), and a few are also 1 hit over on hits to beat. Below are new numbers using the same targets as before (`enemy-stats-sim.py` ROLE_TARGET). Guard is kept. All of them pass on Standard and Challenge (full table in the sim output).

| Enemy | New H / P (current values: see sim output) |
|---|---|
| wick-wisp | 20 / 7 |
| dust-bunny | 58 / 11 |
| lantern-moth | keep |
| sleepy-sentry | 54 / 11 |
| bopper | 99 / 15 |
| buzz-bee | 30 / 9 |
| thorn-sprout | 81 / 13 |
| shell-snail | 88 / 15 |
| vine-sweeper | 99 / 15 |
| spark-sprite | 40 / 12 |
| dough-blob | 117 / 19 |
| Doughling | 40 / 12 |
| ladle-lobber | 122 / 16 |
| rolling-pin | 132 / 19 |
| pebble-pal | 52 / 15 |
| cliff-goat | 148 / 24 |
| stack-golem | 322 / 37 |
| boulder-roller | 170 / 24 |
| puddle-frog | 180 / 29 |
| mist-wisp | 194 / 29 |
| side-crab | 192 / 29 |
| splash-wave | 214 / 29 |
| coal-cub | 78 / 21 |
| anvil-imp | 472 / 52 |
| bellows-puff | 248 / 34 |
| forge-sweep | 258 / 34 |
| masklet | 93 / 24 |
| copycat-shade | 308 / 39 |
| hush-guard | 286 / 39 |
| echo-bell | 308 / 39 |
| page-flutter | 108 / 28 |
| bookworm | 279 / 45 |
| ink-blot | 306 / 38 |
| root-snapper | 358 / 45 |
| cloud-puff | 123 / 32 |
| gust-sprite | 396 / 51 |
| thunder-drum | 338 / 43 |
| zap-kite | 412 / 51 |
| storm-wisp | 141 / 35 |
| rumble-brute | 862 / 87 |
| echo-knight | 429 / 57 |
| sky-sweeper | 468 / 57 |

To apply them, run `enemy-stats-sim.py` with the new expected Artist (R-BAL-11 below).

## 5. Programmer-ready section (exact values)

1. **`packages/sim/src/config.ts:193-195` `GEAR_CAPS`:** add one key per tier id (the same ids as `bestiary-plan.json`), each `{ power, maxHealth, guard }`, using the section 1 table:
   ```ts
   white: { power: 1, maxHealth: 10, guard: 3 },   yellow: { power: 3, maxHealth: 25, guard: 5 },
   orange: { power: 6, maxHealth: 41, guard: 8 },  green: { power: 9, maxHealth: 60, guard: 9 },
   blue: { power: 12, maxHealth: 81, guard: 11 },  red: { power: 16, maxHealth: 104, guard: 12 },
   'red-black': { power: 20, maxHealth: 128, guard: 14 }, brown: { power: 24, maxHealth: 154, guard: 15 },
   'brown-black': { power: 29, maxHealth: 182, guard: 16 }, black: { power: 34, maxHealth: 211, guard: 17 },
   ```
   - `loot.ts:53` and `loot.ts:82` already accept any key of `GEAR_CAPS`.
   - `loot.ts:192` clamps each stat to the cap, so lowering white also lowers new drops from today's table.
2. **`packages/sim/src/power.ts:33` and `:50` `maxGearScore`:** today it uses `GEAR_CAPS.white` × tier. Change it to use `GEAR_CAPS[tierId]` with no × tier. Also cap the Jade amount by tier (below).
3. **`content/loot/gear.json:5-8` `slotStats` (white):**
   - hands power `[1, 1, 1, 1]` (rounded with a floor of 1 so no item says "+0") **[GUESS]**
   - gi maxHealth `[3, 5, 8, 10]`
   - gi guard `[1, 2, 2, 3]`
   - Jade `amounts` at line 22: `[0.01, 0.02, 0.03, 0.04]`
   - Lotus and Crane charms are not stats, so they stay as they are.
4. **New per-tier loot tables** (milestone 10, `content/loot/gear-<tier>.json`, same shape): stat = cap × [0.25, 0.5, 0.75, 1.0], rounded, with a minimum of 1 for Power and Guard **[GUESS]**. Jade amounts = Jade cap × the same fractions.
5. **`packages/sim/src/config.ts` (new) `ENEMY_SCALE`:** Health and Power multipliers per tier from section 2. Use them only when an enemy appears outside its home tier. Wind-up ticks never scale.
6. **Live enemy files:** the values in section 3, for `maxHealth`, `power` and `guard` only (Swarmer only after DECIDE-2).
7. **`packages/sim/src/progression.ts:31-33` (R-BAL-5):** step weight `step + 11`, total `steps*(steps+1)/2 + 11*steps`.
8. **Check:** `python3 drafts/planning/r-bal-9-sim.py` should still print all PASS after the values are copied in.

## 6. Board items (for the Manager; work board not edited)

| ID | Owner | Task | Done when | Waits on |
|---|---|---|---|---|
| R-BAL-9a | Jay | Approve the cost-curve caps, including the white nerf (DECIDE-1) | Yes / no / "keep old white" recorded in decisions.md | this PR |
| R-BAL-9b | Programmer | Section 5 items 1-3, 5 and 7 | `npm run balance` and the sim show every tier in band; tests pass | R-BAL-9a |
| R-BAL-9c | Programmer | Live enemy numbers (section 3) | Swarmer, Shield, Brute and Floor-keeper JSON match; balance bot in band | R-BAL-9a, DECIDE-2 |
| R-BAL-10 | Content/Programmer | Per-tier loot tables (section 5 item 4) | 10 tables exist and every item ≤ its cap | R-BAL-9b |
| R-BAL-11 | Researcher | Re-fill the 42 draft enemy numbers with the new expected Artist (section 4) | `enemy-stats-sim.py` uses the section 2 table and prints 0 out of band | R-BAL-9a |
| R-BAL-12 | Researcher | Measure the combat value of training (perks, forms, virtues) in the same ln-FS unit | Table per tier; check that training ≥ levels + gear, or flag it | none |
| R-BAL-7 | Tester | Kid playtest (already on the board) | Clear rates against the targets | R-BAL-9b |

## Decisions and flags

- **DECIDE-1:** White caps drop from 4 / 30 / 8 / 12% to 1 / 10 / 3 / 4%. Items kids already own get weaker. Options: (a) take the nerf; (b) leave white alone and start the curve at yellow (white gear stays at 1.2× levels); (c) raise the 8% gear share.
- **DECIDE-2:** The Swarmer goes from 40 / 8 to 20 / 7. It was in band against the old guess but not against the new Artist.
- **FLAG-1:** Training adds nothing to Power, Health or Guard in code. In combat, levels (18% of the Power Rating) carry most of the strength, and the 67% training share shows up only as perks, forms and virtues. That supports "training stays main" only through skills, not stats. R-BAL-12 measures it.
- **FLAG-2:** These items are **[GUESS]**: 2 drops per run, item = cap × 25-100%, and kids always wearing a Jade charm if they find one. The sim also uses unrounded caps × fraction.
- **FLAG-3:** The tier-1 Power cap of 1 is coarse. Whole numbers make white hands all +1. Allowing one decimal would give [0.3, 0.7, 1.0, 1.4].
- **FLAG-4:** The `gearScore` weights (`loot.ts:211`) don't match the combat value (Guard is overvalued). It is cosmetic (the better/worse arrows) but should use section 1's conversion later.

## Sim output

```
== 1. Gear caps by tier (cost curve, shared unit = ln of fight strength) ==
today's white caps are worth 0.660 units; levels 1-10 are worth 0.547 -> gear/level = 1.21 (PR shares say 0.44)
split of the gear budget [FITTED to today's white mix]: power 39%, maxHealth 32%, guard 12%, jade 17%
       tier lvl cap level units gear budget  Power Health Guard Jade %
      white      10       0.547       0.243      1     10     3     4%
     yellow      20       1.016       0.452      3     25     5     8%
     orange      30       1.396       0.620      6     41     8    11%
      green      40       1.715       0.762      9     60     9    14%
       blue      50       1.989       0.884     12     81    11    16%
        red      60       2.231       0.991     16    104    12    19%
  red-black      70       2.446       1.087     20    128    14    21%
      brown      80       2.640       1.174     24    154    15    22%
brown-black      90       2.818       1.252     29    182    16    24%
      black     100       2.980       1.325     34    211    17    26%

== 2. Expected Artist per tier (time-average over a 3-month belt, (k+11) steps, gear Monte Carlo) ==
       tier level  Power Health Guard powerScale  gear share of ln-FS growth
      white   6.6   13.4    125   2.4      0.027    33%
     yellow  16.2   19.5    166   4.1      0.056    30%
     orange  26.2   26.8    209   6.5      0.080    29%
      green  36.2   34.5    255   7.9      0.104    29%
       blue  46.2   42.5    301   9.3      0.124    28%
        red  56.2   51.8    351  10.5      0.149    29%
  red-black  66.2   61.8    403  12.1      0.170    29%
      brown  76.2   71.6    456  13.5      0.184    29%
brown-black  86.2   82.2    510  14.5      0.198    29%
      black  96.2   93.7    567  15.6      0.214    29%

== 3. Existing enemies vs the white expected Artist (Standard / Challenge x1.5) ==
      swarmer now H40 P8 G0: beat 4/5 KO 16/11 band (2, 4) ko>=12  OUT  NEW H20 P7 G0 -> beat 2/3 KO 18/13 PASS
       shield now H90 P15 G15: beat 8/12 KO 9/6 band (5, 10) ko>=8  OUT  NEW H66 P11 G15 -> beat 6/9 KO 12/8 PASS
        brute now H180 P25 G25: beat 17/25 KO 6/4 band (10, 20) ko>=5  OUT  NEW H126 P17 G25 -> beat 12/18 KO 8/5 PASS
 floor-keeper now H700 P26 G30: beat 70/105 KO 5/4 band (40, 80) ko>=5  OUT  NEW H495 P17 G30 -> beat 50/75 KO 8/5 PASS

== 4. All 40 C13 enemies (+ bopper, Doughling) vs the new expected Artist ==
               enemy        tier  H/P/G in file  beat S/C  KO S/C  result  proposal if OUT
           wick-wisp       white         22/8/0    2/3     16/11   OUT    H20 P7 G0 -> 2/3 KO 18/13 PASS
          dust-bunny       white        63/13/5    5/8     10/7    OUT    H58 P11 G5 -> 5/7 KO 12/8 PASS
        lantern-moth       white        68/11/0    6/8     12/8    PASS   
       sleepy-sentry       white       63/13/10    6/8     10/7    OUT    H54 P11 G10 -> 5/7 KO 12/8 PASS
              bopper      yellow      116/19/10    7/10    10/7    OUT    H99 P15 G10 -> 6/9 KO 12/8 PASS
            buzz-bee      yellow        34/13/0    2/3     14/9    OUT    H30 P9 G0 -> 2/3 KO 19/13 PASS
        thorn-sprout      yellow       94/17/10    6/8     11/7    OUT    H81 P13 G10 -> 5/7 KO 14/9 PASS
         shell-snail      yellow      104/19/20    7/10    10/7    OUT    H88 P15 G20 -> 6/9 KO 12/8 PASS
        vine-sweeper      yellow      116/19/10    7/10    10/7    OUT    H99 P15 G10 -> 6/9 KO 12/8 PASS
        spark-sprite      orange        45/18/0    2/3     13/9    OUT    H40 P12 G0 -> 2/3 KO 20/13 PASS
          dough-blob      orange       130/27/5    5/8      9/6    OUT    H117 P19 G5 -> 5/7 KO 12/8 PASS
        ladle-lobber      orange       135/23/0    5/8     10/7    OUT    H122 P16 G0 -> 5/7 KO 14/10 PASS
         rolling-pin      orange      154/27/10    7/10     9/6    OUT    H132 P19 G10 -> 6/9 KO 12/8 PASS
          pebble-pal       green        57/22/0    2/3     13/9    OUT    H52 P15 G0 -> 2/3 KO 19/13 PASS
          cliff-goat       green       162/35/5    5/8      8/6    OUT    H148 P24 G5 -> 5/7 KO 12/8 PASS
         stack-golem       green      345/53/25   13/19     6/4    OUT    H322 P37 G25 -> 12/18 KO 8/5 PASS
      boulder-roller       green      192/35/10    7/10     8/6    OUT    H170 P24 G10 -> 6/9 KO 12/8 PASS
         puddle-frog        blue       194/43/5    5/8      8/6    OUT    H180 P29 G5 -> 5/7 KO 12/8 PASS
           mist-wisp        blue       207/43/0    5/8      8/6    OUT    H194 P29 G0 -> 5/7 KO 12/8 PASS
           side-crab        blue      209/43/20    6/9      8/6    OUT    H192 P29 G20 -> 6/9 KO 12/8 PASS
         splash-wave        blue      226/43/10    6/9      8/6    OUT    H214 P29 G10 -> 6/9 KO 12/8 PASS
            coal-cub         red        80/33/0    2/3     12/8    OUT    H78 P21 G0 -> 2/3 KO 19/13 PASS
           anvil-imp         red      494/81/25   13/19     5/4    OUT    H472 P52 G25 -> 12/18 KO 8/5 PASS
        bellows-puff         red      253/53/15    6/9      8/5    OUT    H248 P34 G15 -> 6/9 KO 12/8 PASS
         forge-sweep         red      264/53/10    6/9      8/5    OUT    H258 P34 G10 -> 6/9 KO 12/8 PASS
             masklet   red-black        92/39/0    2/3     12/8    OUT    H93 P24 G0 -> 2/3 KO 20/13 PASS
       copycat-shade   red-black      302/63/10    6/9      8/5    OUT    H308 P39 G10 -> 6/9 KO 12/8 PASS
          hush-guard   red-black      280/63/20    6/9      8/5    OUT    H286 P39 G20 -> 6/9 KO 12/8 PASS
           echo-bell   red-black      302/63/10    6/9      8/5    OUT    H308 P39 G10 -> 6/9 KO 12/8 PASS
        page-flutter       brown       102/46/0    2/3     12/8    OUT    H108 P28 G0 -> 2/3 KO 19/13 PASS
            bookworm       brown      266/74/15    5/7      8/5    OUT    H279 P45 G15 -> 5/7 KO 12/8 PASS
            ink-blot       brown       292/63/5    5/7      9/6    OUT    H306 P38 G5 -> 5/7 KO 14/10 PASS
        root-snapper       brown      341/74/10    6/8      8/5    OUT    H358 P45 G10 -> 6/9 KO 12/8 PASS
          cloud-puff brown-black       114/53/0    2/3     12/8    OUT    H123 P32 G0 -> 2/3 KO 19/13 PASS
         gust-sprite brown-black      363/85/15    6/8      7/5    OUT    H396 P51 G15 -> 6/9 KO 12/8 PASS
        thunder-drum brown-black      310/73/10    5/7      8/6    OUT    H338 P43 G10 -> 5/7 KO 14/10 PASS
            zap-kite brown-black      380/85/10    6/8      7/5    OUT    H412 P51 G10 -> 6/9 KO 12/8 PASS
          storm-wisp       black       126/61/0    2/3     11/8    OUT    H141 P35 G0 -> 2/3 KO 19/13 PASS
        rumble-brute       black     770/150/25   11/16     5/3    OUT    H862 P87 G25 -> 12/18 KO 8/6 PASS
         echo-knight       black      385/98/20    5/8      7/5    OUT    H429 P57 G20 -> 6/9 KO 12/8 PASS
         sky-sweeper       black      418/98/10    5/8      7/5    OUT    H468 P57 G10 -> 6/9 KO 12/8 PASS
dough-blob/doughling      orange        45/17/0    2/3     14/9    OUT    H40 P12 G0 -> 2/3 KO 20/13 PASS

C13 files: 40; out of band now: 41
```
