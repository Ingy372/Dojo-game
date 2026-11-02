# G2B-18: Challenge elite hit bands, plus the Lock 30-tick ceiling check

Checked Sunday Nov 1, 2026, about 11:00 to 11:25 PM ET. Code: origin/main 5d168db8, my own worktree (not committed, nothing posted). Item text read at origin/bot-manager 5f383dc (G2B-18 and G2B-20 lines are unchanged on bot-manager 0b70db8f).

## Delivery Note

- **ITEM:** G2B-18 (elite Brute and elite Shield on Challenge, 22-25 and 11-12 hits against tops of 20 and 10: "say if this is OK, or give a number that passes every belt and difficulty"), plus the Lock 30-tick ceiling from G2B-20.
- **WHAT (elites): FAIL on the written target, PASS on the live game today.**
  - On the recorded target (D5: Challenge is x1.5 enemy Health and Power, the model the bands test and the planner use) elite Brute is **22-25** hits on every belt 4-10 and elite Shield is **11-12**, against tops of 20 and 10. I reproduced the planner's numbers exactly. All 14 Brute rows (swift and guarding, belts 4-10) and all 14 Shield rows fail. Swift Swarmer passes (3-4, top 4).
  - In the live code **Challenge does not multiply Health or Power** (`DIFFICULTY.challenge` = counter window, fill scale, power scale 1; decisions.md R-T3-TUNE-3: "Enemy Health is never scaled by the setting"). Live elite Brute is **15-17** hits and elite Shield **7-8** on Guided, Standard and Challenge, every belt. All pass. Enemy hits to KO the player never drop below 7 (Brute), 11 (Shield), 17 (Swarmer) live, and 5 / 8 / 12 on the D5 model, which meets every minimum.
  - Elites only add Health (x1.25), so the knock-out numbers equal the base enemy's.
- **WHAT (Lock): cannot be run. Design check says the 30-tick ceiling is not enough to meet "under 5".**
  - No Lock code exists on main or any branch (G2B-09 and G2B-20 are not built; `counterLockout` is a different thing). So "4 stacked ranks never exceed 30 ticks" has no runtime to test yet.
  - I did measure the real sim (a real Perfect Counter, then a button-mashing player, stagger set to 20/30/40/50 ticks, bonuses 0/+15%/+30%). Two things differ from the planner's section G: (1) the staggerBonus also boosts the Perfect Counter hit itself (144 -> 165 at +15%), and (2) a player already mashing gets 2 free hits in the built 20-tick stagger, not 1 (hits at +4 and +16). At 30 ticks with both +15% bonuses the package is **5.21 to 6.51 basic hits**, not 4.6.
- **WHY it matters:** the Content Designer must not change `elites.json` before G2B-18 (item rule), and G2B-20's Done-when bar ("under 5 basic-hit equivalents") will fail if the Programmer builds exactly what section G proposes.
- **DECIDE (Jay or Manager):**
  1. Is D5 (Challenge x1.5) still the plan? If it is never built, elites need no change and the band test should be told so. If it will be built, set elite Health to a number below.
  2. Which package method counts for the Lock bar: the planner's (worst phase, bonus on free hits only) or the sim's (mashing player, bonus on the Perfect Counter hit too)?
- **NEXT:** pick answers to the two questions, then the Content Designer can edit `content/elites/elites.json` (numbers only) and the G2B-20 Programmer gets the test method below. Re-run this check after Lock lands.

## Verdict

**FAIL** overall (elites fail the D5 target; Lock cannot meet the bar as designed). Elites alone are **PASS on live code** and **FAIL on the D5 model**. Severity below.

## Test checklist

- [x] Read G2B-18 and G2B-20 text (work-board, 5f383dc) and R-GREEN-TO-BLACK.md (PR #401).
- [x] Read the band rules (`r-bal-12-bands.test.ts`): Small 2-4 hits and 12 KO hits, Mid 5-10 and 8, Heavy 10-20 and 5. Brute = Heavy, Shield = Mid, Swarmer = Small.
- [x] Built real worlds with `createWorld` (Challenge difficulty, belt scale `byTier(ENEMY_TRAINING_SCALE, belt)`, elite spawns from the real `content/elites/elites.json`) and read each elite's real `maxHealth`, `power`, `guard`.
- [x] Compared with the formula `ceil(H / damage(power, 1, guard))` for 3 model students (typical, trains more, plays only) x belts 4-10 x Guided, Standard, Challenge (live) and Challenge D5 x1.5 x 5 elite types.
- [x] Ran real fights: elite held still, the student's basic hit landed until the elite died, Challenge difficulty, belts 4/7/10 x 3 students x brute and swarmer (plain, swift, guarding): **45 of 45 fights match the formula hit-for-hit.** (Shield is formula only: basic hits bounce off its shield, so the sim cannot count them.)
- [x] Searched every elite Health multiplier from 1.00 to 1.50 in 0.01 steps for the largest one that passes every belt, student and difficulty.
- [x] Checked neighbouring belts for jumps over 2x: none (elite hits are flat across belts 4-10, for example 22-25 to 23-24).
- [x] Lock: looked for Lock code (none). Measured the real Perfect Counter, stagger and basic-hit cadence in the sim and redid the section G package with those numbers.
- [ ] Lock ceiling at runtime (stacked ranks <= 30 ticks): BLOCKED, nothing built.

## Results: elites (hits to beat, over the 3 student types; band = Standard target)

| Elite | Belt | Guided beat | Standard beat | Challenge live beat | Challenge D5 (x1.5) beat | Band | Fewest enemy hits to KO (worst of 3 diffs, D5) | D5 result |
|---|---|---|---|---|---|---|---|---|
| swift brute | 4 | 15-17 | 15-17 | 15-17 | 22-25 | 10-20 | 5 (min 5) | **FAIL** |
| swift brute | 5 | 15-17 | 15-17 | 15-17 | 22-25 | 10-20 | 5 (min 5) | **FAIL** |
| swift brute | 6 | 15-17 | 15-17 | 15-17 | 22-25 | 10-20 | 5 (min 5) | **FAIL** |
| swift brute | 7 | 15-17 | 15-17 | 15-17 | 23-25 | 10-20 | 5 (min 5) | **FAIL** |
| swift brute | 8 | 15-16 | 15-16 | 15-16 | 23-24 | 10-20 | 5 (min 5) | **FAIL** |
| swift brute | 9 | 15-16 | 15-16 | 15-16 | 23-24 | 10-20 | 5 (min 5) | **FAIL** |
| swift brute | 10 | 15-16 | 15-16 | 15-16 | 23-24 | 10-20 | 5 (min 5) | **FAIL** |
| guarding brute | 4 | 15-17 | 15-17 | 15-17 | 22-25 | 10-20 | 5 (min 5) | **FAIL** |
| guarding brute | 5 | 15-17 | 15-17 | 15-17 | 22-25 | 10-20 | 5 (min 5) | **FAIL** |
| guarding brute | 6 | 15-17 | 15-17 | 15-17 | 22-25 | 10-20 | 5 (min 5) | **FAIL** |
| guarding brute | 7 | 15-17 | 15-17 | 15-17 | 23-25 | 10-20 | 5 (min 5) | **FAIL** |
| guarding brute | 8 | 15-16 | 15-16 | 15-16 | 23-24 | 10-20 | 5 (min 5) | **FAIL** |
| guarding brute | 9 | 15-16 | 15-16 | 15-16 | 23-24 | 10-20 | 5 (min 5) | **FAIL** |
| guarding brute | 10 | 15-16 | 15-16 | 15-16 | 23-24 | 10-20 | 5 (min 5) | **FAIL** |
| swift shield | 4 | 7-8 | 7-8 | 7-8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| swift shield | 5 | 7-8 | 7-8 | 7-8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| swift shield | 6 | 7-8 | 7-8 | 7-8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| swift shield | 7 | 8 | 8 | 8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| swift shield | 8 | 8 | 8 | 8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| swift shield | 9 | 8 | 8 | 8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| swift shield | 10 | 8 | 8 | 8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| guarding shield | 4 | 7-8 | 7-8 | 7-8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| guarding shield | 5 | 7-8 | 7-8 | 7-8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| guarding shield | 6 | 7-8 | 7-8 | 7-8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| guarding shield | 7 | 8 | 8 | 8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| guarding shield | 8 | 8 | 8 | 8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| guarding shield | 9 | 8 | 8 | 8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| guarding shield | 10 | 8 | 8 | 8 | 11-12 | 5-10 | 8 (min 8) | **FAIL** |
| swift swarmer | 4 | 2-3 | 2-3 | 2-3 | 3-4 | 2-4 | 12 (min 12) | pass |
| swift swarmer | 5 | 2-3 | 2-3 | 2-3 | 3-4 | 2-4 | 12 (min 12) | pass |
| swift swarmer | 6 | 2-3 | 2-3 | 2-3 | 3-4 | 2-4 | 12 (min 12) | pass |
| swift swarmer | 7 | 2-3 | 2-3 | 2-3 | 3-4 | 2-4 | 12 (min 12) | pass |
| swift swarmer | 8 | 2-3 | 2-3 | 2-3 | 3-4 | 2-4 | 12 (min 12) | pass |
| swift swarmer | 9 | 2-3 | 2-3 | 2-3 | 3-4 | 2-4 | 12 (min 12) | pass |
| swift swarmer | 10 | 2 | 2 | 2 | 3 | 2-4 | 12 (min 12) | pass |

Notes: `Challenge live` is what the game does now. `D5` column is the same Health and Power times 1.5. Guided and Standard are the same under both models. The non-elite Challenge D5 numbers for comparison: Brute 17-20, Shield 9-10, Swarmer 3. So a Brute already sits at the top of its band on D5 without being an elite.

### Largest elite Health multiplier that passes every cell

| Enemy | Live code (no x1.5) | D5 model (x1.5) | Today's `elites.json` |
|---|---|---|---|
| Brute | 1.50 or more (1.25 gives 15-17) | **1.02** (1.03 gives 21) | 1.25: fails D5 |
| Shield | 1.50 or more (1.25 gives 7-8) | **1.05** (1.10 gives 11) | 1.25: fails D5 |
| Swarmer | 1.50 or more | 1.50 or more (1.25 gives 3-4) | passes |

Because `kinds.swift.health` and `kinds.guarding.health` are shared by every enemy in the kind, one number must pass Brute, Shield and Swarmer together: **1.02**.

## Results: Lock 30-tick ceiling

Real constants from the code: basic hit every 12 ticks (`basicAttack.cooldownTicks`), Perfect Counter strength 2, built stagger 20 ticks, `staggerTicks` effect adds ticks directly, `staggerBonus` adds to every hit on a staggered, winded or recovering enemy. Measured with a real Perfect Counter, belt 5 typical student, basic hit 72, Perfect Counter 144.

Measured in the sim: bonus 0 / 15% / 30% gives Perfect Counter 144 / 165 / 187 and free basic hits 72 / 83 / 94. Free hit times at +4, +16, +28, +40 after the counter.

Package = (Perfect Counter hit + free hits) in basic hits. "Worst" = floor(ticks/12) free hits (the planner's count), "mashing" = what the sim gave, "best" = ceil(ticks/12).

| Window | Bonus | Free hits worst / mashing / best | Package worst | Package mashing | Package best | Under 5? |
|---|---|---|---|---|---|---|
| 20 (built today) | 0 | 1 / 2 / 2 | 3.00 | 4.00 | 4.00 | yes |
| 20 | +30% | 1 / 2 / 2 | 3.90 | 5.21 | 5.21 | **no (mashing)** |
| 30 (ceiling) | 0 | 2 / 3 / 3 | 4.00 | 5.00 | 5.00 | **no (mashing)** |
| 30 (ceiling) | +15% | 2 / 3 / 3 | 4.60 | 5.75 | 5.75 | **no (mashing)** |
| 30 (ceiling) | +30% | 2 / 3 / 3 | 5.21 | 6.51 | 6.51 | **no, even worst** |
| 40 | +30% | 3 / 4 / 4 | 6.51 | 7.82 | 7.82 | no |
| 50 (S4 uncapped) | +30% | 4 / 4 / 5 | 7.82 | 7.82 | 9.12 | no |

The planner's 4.6 at 30 ticks is the "worst" column with the bonus on free hits only. Once the Perfect Counter hit takes the bonus (which the live sim does), the same cell is 5.21.

Also: Counter #6 Off-Balance (`staggerTicks` +10) already lengthens the built stagger to 30 ticks on its own (confirmed: sim stagger 20 -> 30 with the +10 mod). If Lock reuses the stagger state, a 30-tick cap must cover Lock ranks plus `staggerTicks`, not Lock ranks alone, or the window is 40.

## Failures

| # | Severity | What | Where |
|---|---|---|---|
| F1 | **Medium (launch, only if D5 is built)** | Elite Brute 22-25 hits (top 20) and elite Shield 11-12 (top 10) on Challenge D5, every belt 4-10, all three students. Not a bug today: the game does not apply x1.5. | `content/elites/elites.json` `kinds.*.health` 1.25 |
| F2 | **Medium (docs/test gap)** | The band test and decisions D5 assume Challenge x1.5, the live code does not. Whoever builds or drops that has to settle it; elites are the first thing that breaks. | `r-bal-12-bands.test.ts` vs `config.ts` DIFFICULTY |
| F3 | **High (blocks G2B-20 Done-when)** | A 30-tick Lock with both +15% bonuses gives 5.21 to 6.51 basic hits, not 4.6. The bar "under 5" is not reached. | R-G2B-balance-check.md section G |
| F4 | **Medium** | The 30-tick ceiling must include Counter `staggerTicks` (#6), else Lock gets 40. | G2B-20 design |
| F5 | Info | Lock is not built, so ceiling at runtime is untested. | G2B-09, G2B-20 |

No crashes or sim errors. The formula and real fights agree (45 of 45).

## Suggested fix (numbers or config only, no code)

**Elites (answer to G2B-18: "a number").**
- If D5 stays the plan: set `kinds.swift.health` and `kinds.guarding.health` to **1.02**. This passes every belt 4-10, all three students, Guided/Standard/Challenge D5/live, with knock-out hits unchanged (5 / 8 / 12 minimums). The cost: elites are no longer meaningfully tougher in Health than plain enemies (Brute D5 is already 17-20 on its own); their difference must come from Swift/Guarding behaviour.
- If D5 is dropped, or the elite band may be wider than the plain band: leave **1.25** (live passes with 15-17 and 7-8). Widening the elite top to 25 (Brute) and 12 (Shield) would also pass D5 at 1.25, but that is a band change for the Manager to decide.
- Do not edit `elites.json` before the decision above (item rule).

**Lock (proposal, to be confirmed by the G2B-20 test).**
- Keep 20 ticks base, cap the whole window (Lock ranks + `staggerTicks`) at **24 ticks** (not 30), and keep total stagger bonuses (#10 + #32) at **+20% or less** (for example #32 at +5% instead of +15%). Real-sim package: 4 x 1.2 = about 4.8, under 5, even for a mashing player (24 ticks gives 2 free hits at any phase).
- Or keep 30 ticks and change the G2B-20 bar to "under 6.5 by the sim method". Pick one; both are numbers.
- G2B-20 test should measure the package with a real Perfect Counter, a mashing player and both bonuses, as in this report, not by arithmetic.

## How it was measured (for repeat)

Temp vitest files in a throwaway worktree (not committed, removed): built the world with `createWorld` and the real content, read `enemies[0].def`, ran `stepWorld` fights. Files: `zz-g2b18.test.ts` (tables and search), `zz-g2b18b.test.ts` (45 fights), `zz-g2b18c.test.ts` (Perfect Counter / stagger package). Raw numbers: `/workspace/qa/g2b18/*.json`.
