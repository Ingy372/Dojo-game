# R-BAL-12: Real training feeds Power, Health and Guard

Status: proposal for Jay and the Programmer. No game code, content or work board changed.
Proof: `python3 drafts/planning/r-bal-12-sim.py` (imports `r-bal-9-sim.py`). Output pasted at the end.
Labels: **[CODE]** from main, **[DECIDED]** Jay/Manager, **[FITTED]** chosen to hit a target, **[GUESS]** needs a playtest.

## Decisions (recorded)

- **Decision A [DECIDED, Jay]:** training is 40-60% of a typical student's power at every belt, aiming for about 50-55%. Result: **51-54%** at every belt (table in section 3).
- **Decision B [DECIDED, Manager]:** one runtime multiplier per belt (`ENEMY_TRAINING_SCALE`), and every stat a kid sees is a whole number. Training values are whole numbers. The multiplier itself is internal (2 decimals); the final enemy stat is `Math.round(base × multiplier)`.
- **Decision C [DECIDED, Jay]:** a class-only kid being a bit weaker is OK. There are no nag or guilt messages, only a positive pull.
- **Rule: no nag or guilt messages [DECIDED].** The game never says "you didn't practice", never shows what a kid "missed" or "lost", never compares kids, and never sends reminders about home practice. It may only show what a kid **gained** (for example "+1 Power, +4 Health" on a signed item). Training only adds, never takes away. No timers, streaks or decay.
- **Enemy files hold BASE numbers [DECIDED here, follows B].** Files (42 drafts, Guardians, Cloudlet) stay designed against the #188 Artist. The runtime multiplies them. No file needs a second edit when training values change.

## Read this first

- **Today, real training gives no combat stats.** `characterSetup` (`packages/sim/src/progression.ts:118-130`) builds Health and Power from gear plus level, and Guard from gear only. Training Points are counted (`training.ts:259`) but used only in the hidden Power Rating (`power.ts:66-67`).
- **Plan:** every piece of real training adds a small whole-number stat, for good. Nothing is ever taken away.

  | Real training | Adds |
  |---|---|
  | **Sign-off** (one requirement) | Power + Health |
  | **Training Point** (15 approved home minutes) | Health only (the Power part rounded to 0, so it was moved to Health) |
  | **Character stripe** (Virtue) | Guard |

## 1. Method (tune)

- **Shape:** the K = 1.0 per-unit values from the first R-BAL-12 PR, times `SCALE × belt^-ALPHA`, then rounded to whole numbers. Two numbers for all belts, so values grow smoothly and never jump around.
  - SCALE 1.1 and ALPHA 0.6 **[FITTED]**: the pair whose worst belt is nearest 52.5% training for the typical student.
  - A per-belt K fitted one belt at a time was tried first. It hit the shares too, but gave zig-zag values (brown-black gave 0), so it was dropped.
- **Split** sign-offs 60% / TP 25% / virtues 15% **[CODE ratio]** (`config.ts:248-250`). **Stat mix** sign-offs P .6 / H .4; TP Health 1.0; stripes Guard 1.0 **[GUESS, flavour]**.
- **Units per belt:** 7 requirements, 28 TP (`power.ts:66`), 2 stripes (`config.ts:257`) **[CODE]**. A unit keeps the value of the belt it was earned at.
- **Students [GUESS]:** typical 8 runs/week + 20 min/week; trains more 4 runs/week + 45 min/week; plays only 8 runs/week + 0. All sign off 7 items and earn 2 stripes per belt in class.
- **Enemy multiplier per belt [FITTED]:** Health × = typical Artist Power ÷ #188 Artist Power. Power × = the **least tough** of the three students (Health × (1+Guard/100)) ÷ #188 Artist. So the class-only kid still gets knocked out no faster than the band allows.

## 2. Values (whole numbers)

| Belt | Sign-off: Power | Sign-off: Health | 1 TP: Power | 1 TP: Health | Stripe: Guard | Full belt adds P / H / G |
|---|---|---|---|---|---|---|
| white | 1 | 4 | 0 | 1 | 7 | 7.0/56/14.0 |
| yellow | 1 | 5 | 0 | 1 | 5 | 7.0/63/10.0 |
| orange | 1 | 5 | 0 | 1 | 3 | 7.0/63/6.0 |
| green | 2 | 6 | 0 | 2 | 3 | 14.0/98/6.0 |
| blue | 2 | 6 | 0 | 2 | 2 | 14.0/98/4.0 |
| red | 2 | 6 | 0 | 2 | 2 | 14.0/98/4.0 |
| red-black | 2 | 7 | 0 | 2 | 2 | 14.0/105/4.0 |
| brown | 3 | 7 | 0 | 2 | 1 | 21.0/105/2.0 |
| brown-black | 3 | 7 | 0 | 2 | 1 | 21.0/105/2.0 |
| black | 3 | 7 | 0 | 2 | 1 | 21.0/105/2.0 |

All **[FITTED]**. Full belt = 7 sign-offs + 28 TP + 2 stripes.

## 3. Shares by belt (training / levels / gear, %)

| Belt | Typical | Trains more, plays less | Plays only (class) |
|---|---|---|---|


- Typical: 51-54% at every belt (Decision A met).
- Plays only is still 47-51% training, because class sign-offs and stripes are real training.
- Trains more is 59-70%.

## 4. Programmer-ready

1. **`packages/sim/src/config.ts`** (after `TRAINING_POINTS`, line 233):
```ts
export const TRAINING_STATS = {
  'white': { signOff: { power: 1, maxHealth: 4 }, trainingPoint: { maxHealth: 1 }, stripe: { guard: 7 } },
  'yellow': { signOff: { power: 1, maxHealth: 5 }, trainingPoint: { maxHealth: 1 }, stripe: { guard: 5 } },
  'orange': { signOff: { power: 1, maxHealth: 5 }, trainingPoint: { maxHealth: 1 }, stripe: { guard: 3 } },
  'green': { signOff: { power: 2, maxHealth: 6 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 3 } },
  'blue': { signOff: { power: 2, maxHealth: 6 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 2 } },
  'red': { signOff: { power: 2, maxHealth: 6 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 2 } },
  'red-black': { signOff: { power: 2, maxHealth: 7 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 2 } },
  'brown': { signOff: { power: 3, maxHealth: 7 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 1 } },
  'brown-black': { signOff: { power: 3, maxHealth: 7 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 1 } },
  'black': { signOff: { power: 3, maxHealth: 7 }, trainingPoint: { maxHealth: 2 }, stripe: { guard: 1 } },
} as const;
// internal only; final enemy stats = Math.round(base * scale)
export const ENEMY_TRAINING_SCALE = {
  'white': { maxHealth: 1.27, power: 1.19 },
  'yellow': { maxHealth: 1.57, power: 1.51 },
  'orange': { maxHealth: 1.71, power: 1.74 },
  'green': { maxHealth: 1.90, power: 1.92 },
  'blue': { maxHealth: 2.11, power: 2.07 },
  'red': { maxHealth: 2.24, power: 2.18 },
  'red-black': { maxHealth: 2.33, power: 2.28 },
  'brown': { maxHealth: 2.45, power: 2.36 },
  'brown-black': { maxHealth: 2.59, power: 2.43 },
  'black': { maxHealth: 2.68, power: 2.47 },
} as const;
```
2. **New `trainingStats(training)` in `packages/sim/src/training.ts`** (pure), returning `{ power, maxHealth, guard }`:
   - **Sign-offs:** each `requirements` entry with `signedOff` true (legacy counts, `training.ts:163`) adds `TRAINING_STATS[r.belt].signOff`.
   - **Stripes:** add `TRAINING_STATS[belt].stripe` per stripe, at most `POWER.stripesPerBelt` per belt.
   - **Training Points:** the n-th point belongs to belt `ceil(n / 28)`; count only up to `28 × tier` (`power.ts:66`).
3. **`TrainingState` must store stripes per belt, not just a count.** Today it has only `totalStripes` (`training.ts:251`), but feed stripes carry `s.belt` (`training.ts:232`). Add `stripesByBelt: Record<Belt, number>`.
   - **Save migration that never lowers anything:** rebuild `stripesByBelt` from the feed. If the feed is missing or gives fewer than `totalStripes`, put the extra stripes on the oldest belts that have room (at most 2 each), then on the current belt. After migration, `trainingStats` and `totalStripes` must be `>=` what the old save showed. Never remove a stripe, sign-off or point. Test it.
4. **`progression.ts:122-126` `characterSetup`:** add `trainingStats` to `maxHealth`, `power` and `guard`. All training values are whole numbers.
5. **Enemy spawn** (where `e.def.maxHealth` / `power` are read in `world.ts`): `Math.round(def.maxHealth × scale.maxHealth)` and `Math.round(def.power × scale.power)` for the run's belt. Guard and wind-ups never scale. Content files stay BASE numbers.
6. **UI:** show only gains: "+1 Power, +4 Health" on a signed item, "+7 Guard" on a stripe. No meters that drain, no "missed" counts, no reminders (no-nag rule).
7. **Tests:** stats never go down when the feed adds an item; migration never lowers; a legacy belt gives full values; TP above the cap adds nothing; all spawned enemy stats are integers.

## 5. Board items (for the Manager; work board not edited)

| ID | Owner | Task | Done when | Waits on |
|---|---|---|---|---|
| R-BAL-12b | Programmer | Section 4 items 1-4, 7 | Tests pass; a white fixture with 7 sign-offs + 2 stripes shows +7 Power, +28 Health, +14 Guard over none | this PR |
| R-BAL-12c | Programmer | Enemy scale (item 5) | `npm run balance` in band for typical and plays-only fixtures | R-BAL-12b |
| R-BAL-12d | Artist/UI | Item 6 words | Every signed item shows its gift, nothing shows a loss | R-BAL-12b |
| R-BAL-7 | Tester | Kid playtest with training stats | Clear rates in target | R-BAL-12c |

## Flags

- **Trains more, Challenge, Guardians:** 85-89 hits on Challenge, over the 80 top (Standard is fine). They have fewer runs, so less Power. Fix options: Guardian hit target 50 → 45, or accept it (Challenge is optional). Same kid: Stack Golem is 21 hits on Challenge (top 20).
- **4 live enemies** (swarmer, shield, brute, floor-keeper) are out of band with or without the multiplier. They are not C13 files and were not touched; they need their own refill.
- Levels still give +0.4 Power each (code). Power on screen should be rounded.
- The mid enemy check (section 4 of the output) sizes a fresh enemy for the typical kid only; section 5 is the real check.
- **[GUESS]:** practice minutes, run counts, sign-offs spread evenly, stripes at months 1 and 2.

## Sim output

```
K=1 shape, SCALE 1.1 x belt^-0.6 [FITTED], rounded to whole numbers
== 1. Value of one piece of real training, by the belt it is earned at (flat stats, adds only) ==
split sign-offs/TP/virtues = 60%/25%/15% [CODE ratio]
       belt  sign-off: Power Health   1 TP: Power Health  stripe: Guard   full belt adds P/H/G
      white           1          4         0         1              7   7.0/56/14.0
     yellow           1          5         0         1              5   7.0/63/10.0
     orange           1          5         0         1              3   7.0/63/6.0
      green           2          6         0         2              3   14.0/98/6.0
       blue           2          6         0         2              2   14.0/98/4.0
        red           2          6         0         2              2   14.0/98/4.0
  red-black           2          7         0         2              2   14.0/105/4.0
      brown           3          7         0         2              1   21.0/105/2.0
brown-black           3          7         0         2              1   21.0/105/2.0
      black           3          7         0         2              1   21.0/105/2.0

== 2. typical: runs x1.0, 20 approved min/week [GUESS] — belt-average Artist and share of strength ==
       belt  Power Health Guard   training  levels  gear
      white   17.0    147   9.3       51%     31%   18%
     yellow   30.7    237  23.1       54%     29%   17%
     orange   45.9    333  33.5       53%     29%   18%
      green   65.6    434  40.9       54%     27%   19%
       blue   89.9    541  47.3       54%     26%   19%
        red  116.2    661  52.6       54%     26%   20%
  red-black  143.8    792  58.0       54%     25%   21%
      brown  175.2    928  62.4       54%     24%   22%
brown-black  212.6   1067  65.5       54%     24%   22%
      black  251.3   1206  68.5       54%     23%   23%

== 2. trains more, plays less: runs x0.5, 45 approved min/week [GUESS] — belt-average Artist and share of strength ==
       belt  Power Health Guard   training  levels  gear
      white   15.9    148   9.2       63%     18%   18%
     yellow   26.0    234  21.7       70%     20%   10%
     orange   38.8    334  31.2       66%     22%   12%
      green   56.7    466  39.4       65%     21%   14%
       blue   79.8    605  45.7       64%     21%   15%
        red  103.8    748  51.0       63%     21%   16%
  red-black  129.7    897  56.3       61%     22%   17%
      brown  161.5   1052  60.7       60%     21%   18%
brown-black  197.5   1210  64.1       59%     21%   19%
      black  234.6   1368  67.2       59%     21%   20%

== 2. plays only (class, no home practice): runs x1.0, 0 approved min/week [GUESS] — belt-average Artist and share of strength ==
       belt  Power Health Guard   training  levels  gear
      white   17.0    139   9.3       47%     33%   19%
     yellow   30.7    212  23.1       50%     32%   18%
     orange   45.9    290  33.5       50%     31%   19%
      green   65.6    374  40.9       50%     30%   20%
       blue   89.9    463  47.3       51%     28%   21%
        red  116.2    555  52.6       51%     27%   22%
  red-black  143.8    651  58.0       51%     27%   22%
      brown  175.2    753  62.4       51%     26%   23%
brown-black  212.6    857  65.5       51%     26%   24%
      black  251.3    962  68.5       51%     25%   24%

== 3. Enemy multiplier per belt vs the #188 Artist: Health x follows the typical student, Power x the least-tough student ==
      white  Health x1.27  Power x1.19
     yellow  Health x1.57  Power x1.51
     orange  Health x1.71  Power x1.74
      green  Health x1.90  Power x1.92
       blue  Health x2.11  Power x2.07
        red  Health x2.24  Power x2.18
  red-black  Health x2.33  Power x2.28
      brown  Health x2.45  Power x2.36
brown-black  Health x2.59  Power x2.43
      black  Health x2.68  Power x2.47

== 4. A mid enemy built for the typical student (5 hits, KO 12), faced by each student, Standard ==
       belt                   typical   trains more, plays less  plays only (class, no ho
      white          beat  5 KO 12 in          beat  5 KO 12 in          beat  5 KO 11 in
     yellow          beat  5 KO 12 in          beat  6 KO 12 in          beat  5 KO 11 in
     orange          beat  5 KO 12 in          beat  6 KO 12 in          beat  5 KO 10 in
      green          beat  5 KO 12 in          beat  6 KO 13 in          beat  5 KO 10 in
       blue          beat  5 KO 12 in          beat  6 KO 13 in          beat  5 KO 10 in
        red          beat  5 KO 12 in          beat  6 KO 13 in          beat  5 KO 10 in
  red-black          beat  5 KO 12 in          beat  5 KO 13 in          beat  5 KO 10 in
      brown          beat  5 KO 12 in          beat  5 KO 13 in          beat  5 KO 10 in
brown-black          beat  5 KO 12 in          beat  5 KO 14 in          beat  5 KO 10 in
      black          beat  5 KO 12 in          beat  5 KO 13 in          beat  5 KO 10 in

== 5. All enemies and Guardians with the belt multiplier (whole-number final stats), Standard + Challenge x1.5 ==
   result per student: typical / trains more / plays only.  'beat' = Artist hits S/C, 'KO' = enemy hits S/C
           wick-wisp       white H   25 P   8 G  0  2/3 KO 21/14 ok      | 2/3 KO 22/14 ok      | 2/3 KO 20/13 ok     
          dust-bunny       white H   74 P  13 G  5  5/7 KO 13/9 ok       | 5/8 KO 13/9 ok       | 5/7 KO 12/8 ok      
        lantern-moth       white H   86 P  13 G  0  6/8 KO 13/9 ok       | 6/9 KO 13/9 ok       | 6/8 KO 12/8 ok      
       sleepy-sentry       white H   69 P  13 G 10  5/7 KO 13/9 ok       | 5/8 KO 13/9 ok       | 5/7 KO 12/8 ok      
              bopper      yellow H  155 P  23 G 10  6/9 KO 13/9 ok       | 7/10 KO 13/9 ok      | 6/9 KO 12/8 ok      
            buzz-bee      yellow H   47 P  14 G  0  2/3 KO 22/14 ok      | 2/3 KO 20/14 ok      | 2/3 KO 20/13 ok     
        thorn-sprout      yellow H  127 P  20 G 10  5/7 KO 15/10 ok      | 6/8 KO 15/10 ok      | 5/7 KO 14/9 ok      
         shell-snail      yellow H  138 P  23 G 20  6/8 KO 13/9 ok       | 7/10 KO 13/9 ok      | 6/8 KO 12/8 ok      
        vine-sweeper      yellow H  155 P  23 G 10  6/9 KO 13/9 ok       | 7/10 KO 13/9 ok      | 6/9 KO 12/8 ok      
        spark-sprite      orange H   68 P  21 G  0  2/3 KO 21/14 ok      | 2/3 KO 21/14 ok      | 2/3 KO 19/13 ok     
          dough-blob      orange H  200 P  33 G  5  5/7 KO 14/9 ok       | 6/9 KO 14/9 ok       | 5/7 KO 12/8 ok      
        ladle-lobber      orange H  209 P  28 G  0  5/7 KO 16/11 ok      | 6/9 KO 16/11 ok      | 5/7 KO 14/10 ok     
         rolling-pin      orange H  226 P  33 G 10  6/9 KO 14/9 ok       | 7/10 KO 14/9 ok      | 6/9 KO 12/8 ok      
          pebble-pal       green H   99 P  29 G  0  2/3 KO 21/15 ok      | 2/3 KO 23/16 ok      | 2/3 KO 18/13 ok     
          cliff-goat       green H  281 P  46 G  5  5/7 KO 14/9 ok       | 6/8 KO 15/10 ok      | 5/7 KO 12/8 ok      
         stack-golem       green H  612 P  71 G 25  12/18 KO 9/6 ok      | 14/21 KO 10/7 OUT    | 12/18 KO 8/5 ok     
      boulder-roller       green H  323 P  46 G 10  6/9 KO 14/9 ok       | 7/10 KO 15/10 ok     | 6/9 KO 12/8 ok      
         puddle-frog        blue H  380 P  60 G  5  5/7 KO 14/9 ok       | 5/8 KO 15/10 ok      | 5/7 KO 12/8 ok      
           mist-wisp        blue H  409 P  60 G  0  5/7 KO 14/9 ok       | 6/8 KO 15/10 ok      | 5/7 KO 12/8 ok      
           side-crab        blue H  405 P  60 G 20  6/9 KO 14/9 ok       | 7/10 KO 15/10 ok     | 6/9 KO 12/8 ok      
         splash-wave        blue H  452 P  60 G 10  6/9 KO 14/9 ok       | 7/10 KO 15/10 ok     | 6/9 KO 12/8 ok      
            coal-cub         red H  175 P  46 G  0  2/3 KO 23/15 ok      | 2/3 KO 25/17 ok      | 2/3 KO 19/13 ok     
           anvil-imp         red H 1057 P 113 G 25  12/18 KO 9/6 ok      | 13/20 KO 10/7 ok     | 12/18 KO 8/5 ok     
        bellows-puff         red H  556 P  74 G 15  6/9 KO 14/10 ok      | 7/10 KO 16/11 ok     | 6/9 KO 12/8 ok      
         forge-sweep         red H  578 P  74 G 10  6/9 KO 14/10 ok      | 7/10 KO 16/11 ok     | 6/9 KO 12/8 ok      
             masklet   red-black H  217 P  55 G  0  2/3 KO 23/16 ok      | 2/3 KO 26/17 ok      | 2/3 KO 19/13 ok     
       copycat-shade   red-black H  718 P  89 G 10  6/9 KO 15/10 ok      | 7/10 KO 16/11 ok     | 6/9 KO 12/8 ok      
          hush-guard   red-black H  666 P  89 G 20  6/9 KO 15/10 ok      | 7/10 KO 16/11 ok     | 6/9 KO 12/8 ok      
           echo-bell   red-black H  718 P  89 G 10  6/9 KO 15/10 ok      | 7/10 KO 16/11 ok     | 6/9 KO 12/8 ok      
        page-flutter       brown H  265 P  66 G  0  2/3 KO 23/16 ok      | 2/3 KO 26/17 ok      | 2/3 KO 19/13 ok     
            bookworm       brown H  684 P 106 G 15  5/7 KO 15/10 ok      | 5/8 KO 16/11 ok      | 5/7 KO 12/8 ok      
            ink-blot       brown H  750 P  90 G  5  5/7 KO 17/12 ok      | 5/8 KO 19/13 ok      | 5/7 KO 14/10 ok     
        root-snapper       brown H  877 P 106 G 10  6/9 KO 15/10 ok      | 6/9 KO 16/11 ok      | 6/9 KO 12/8 ok      
          cloud-puff brown-black H  319 P  78 G  0  2/3 KO 23/16 ok      | 2/3 KO 26/18 ok      | 2/3 KO 19/13 ok     
         gust-sprite brown-black H 1026 P 124 G 15  6/9 KO 15/10 ok      | 6/9 KO 16/11 ok      | 6/9 KO 12/8 ok      
        thunder-drum brown-black H  875 P 104 G 10  5/7 KO 17/12 ok      | 5/8 KO 20/13 ok      | 5/7 KO 14/10 ok     
            zap-kite brown-black H 1067 P 124 G 10  6/9 KO 15/10 ok      | 6/9 KO 16/11 ok      | 6/9 KO 12/8 ok      
          storm-wisp       black H  378 P  86 G  0  2/3 KO 24/16 ok      | 2/3 KO 27/18 ok      | 2/3 KO 19/13 ok     
        rumble-brute       black H 2310 P 215 G 25  12/18 KO 10/7 ok     | 13/19 KO 11/8 ok     | 12/18 KO 8/6 ok     
         echo-knight       black H 1150 P 141 G 20  6/9 KO 15/10 ok      | 6/9 KO 17/11 ok      | 6/9 KO 12/8 ok      
         sky-sweeper       black H 1254 P 141 G 10  6/9 KO 15/10 ok      | 6/9 KO 17/11 ok      | 6/9 KO 12/8 ok      
dough-blob/doughling      orange H   68 P  21 G  0  2/3 KO 21/14 ok      | 2/3 KO 21/14 ok      | 2/3 KO 19/13 ok     
               brute       white H  229 P  30 G 25  17/25 KO 6/4 OUT     | 18/27 KO 6/4 OUT     | 17/25 KO 6/4 OUT    
        floor-keeper       white H  889 P  31 G 30  69/103 KO 6/4 OUT    | 75/112 KO 6/4 OUT    | 69/103 KO 5/4 OUT   
              shield       white H  114 P  18 G 15  8/12 KO 10/6 OUT     | 9/13 KO 10/6 OUT     | 8/12 KO 9/6 OUT     
             swarmer       white H   51 P  10 G  0  3/5 KO 17/11 OUT     | 4/5 KO 17/11 OUT     | 3/5 KO 16/10 OUT    
         lamp-keeper       white H  629 P  17 G 30  49/73 minKO 6 ok     | 53/79 minKO 6 ok     | 49/73 minKO 5 ok    
        sun-gardener      yellow H 1165 P  29 G 30  49/73 minKO 6 ok     | 59/88 minKO 6 OUT    | 49/73 minKO 6 ok    
         hearth-cook      orange H 1778 P  44 G 30  51/77 minKO 6 ok     | 60/89 minKO 6 OUT    | 51/77 minKO 5 ok    
         stone-giant       green H 2538 P  60 G 30  51/77 minKO 6 ok     | 58/87 minKO 7 OUT    | 51/77 minKO 5 ok    
       river-watcher        blue H 3448 P  77 G 30  50/75 minKO 6 ok     | 57/85 minKO 7 OUT    | 50/75 minKO 5 ok    

checked 51 enemies/Guardians
   out of band, typical: brute, floor-keeper, shield, swarmer
   out of band, trains more, plays less: stack-golem, brute, floor-keeper, shield, swarmer, sun-gardener, hearth-cook, stone-giant, river-watcher
   out of band, plays only (class, no home practice): brute, floor-keeper, shield, swarmer
```
