# G2B-18: elite hit bands on current main (D5 dropped)

## Delivery Note

- **ITEM:** G2B-18 (Tester). Elite Brute and elite Shield hit bands, every belt elites can appear, every live difficulty. Board on `bot-manager` already records that D5 (Challenge ×1.5) was dropped, and that live elite numbers (Brute 15–17, Shield 7–8) pass. This is a fresh re-run of that check on current main, not a retune.
- **WHAT:** Re-ran the elite sim on `origin/main` `4302658f` (OV-B7 #498). Live elite Brute is **15–17** hits (15–16 from belt 8) and elite Shield is **7–8** (8 from belt 7), on Guided, Steady, and Challenge, every belt 4–10, all three model students. Every cell is inside its band. Knock-out minimums all pass. No neighboring-belt jump is over 2×. Existing `elites.test.ts` and `r-bal-12-bands.test.ts` also passed (316 tests with the throwaway file included).
- **WHY:** G2B-18 was still an open Tester row. The Nov 1 note measured `5d168db8`. The board said not to change `elites.json` before this check. D5 is no longer the pass bar.
- **DECIDE:** nothing. The current numbers are fine. Do not change `elites.json`.
- **NEXT:** Manager can mark G2B-18 done if this note is enough. G2B-28 can stop waiting on a number change from this item. No game-code edit follows from this run.

**Measured:** 2026-11-14, about 10:21 PM America/New_York. One disposable shallow clone of `origin/main` `4302658f4c4fc7ac8ccd3be5da8359552da60d4c`, deleted after the run. No game code was edited. A throwaway vitest file lived in `/workspace/qa/g2b18-2026-11-14/g2b18-rerun.test.ts` and was only copied into the clone to run.

## Method

Balance-check approach: every belt the numbers affect (elites start at the 4th belt; belts 1–3 have no elites), all three model students (`typical`, `trainsMore`, `playsOnly` from `r-bal-12-artists.ts`), and all three live difficulties (Guided, Standard/Steady, Challenge).

- Real worlds via `createWorld`, with `enemyScale = byTier(ENEMY_TRAINING_SCALE, belt)`, the real `content/elites/elites.json` (`kinds.*.health` **1.25**, power and guard **1.0**), and a single elite spawn. Hits to beat = `ceil(H / damage(student.power, 1, guard))` from the elite's real `def` in that world.
- Challenge still does **not** multiply Health or Power (`DIFFICULTY.challenge.enemyPowerScale` is 1; Health is never scaled by the setting). D5 (×1.5) was not used as a pass bar.
- Bands are the Standard #188 targets already in `r-bal-12-bands.test.ts`: Brute Heavy **10–20** hits, KO min 5; Shield Mid **5–10**, KO min 8; Swarmer Small **2–4**, KO min 12.
- 27 real basic-hit fights (swift Brute, belts 4/7/10 × 3 students × 3 difficulties) matched the formula hit-for-hit. Shield stays formula-only: basic hits bounce off its shield.
- Neighboring belts were checked for jumps over about 2×. None.

Existing tests run on the same clone, not edited: `packages/sim/test/elites.test.ts` and `packages/sim/test/r-bal-12-bands.test.ts`. All passed. (`r-bal-12-bands` still encodes a Challenge ×1.5 column for *plain* live enemies; that file was not changed here. It is not the G2B-18 pass bar.)

## Results (hits to beat, range over the 3 students)

Guided, Standard, and Challenge are the same on every row, because elite Health does not change with the setting.

| Elite | Belt | Guided | Standard | Challenge | Band | Enemy hits to KO (range) | KO min | Result |
|---|---|---|---|---|---|---|---|---|
| swift brute | 4 | 15-17 | 15-17 | 15-17 | 10-20 | 8-12 | 5 | PASS |
| swift brute | 5 | 15-17 | 15-17 | 15-17 | 10-20 | 8-13 | 5 | PASS |
| swift brute | 6 | 15-17 | 15-17 | 15-17 | 10-20 | 8-13 | 5 | PASS |
| swift brute | 7 | 15-17 | 15-17 | 15-17 | 10-20 | 7-13 | 5 | PASS |
| swift brute | 8 | 15-16 | 15-16 | 15-16 | 10-20 | 7-13 | 5 | PASS |
| swift brute | 9 | 15-16 | 15-16 | 15-16 | 10-20 | 7-14 | 5 | PASS |
| swift brute | 10 | 15-16 | 15-16 | 15-16 | 10-20 | 7-14 | 5 | PASS |
| guarding brute | 4 | 15-17 | 15-17 | 15-17 | 10-20 | 8-12 | 5 | PASS |
| guarding brute | 5 | 15-17 | 15-17 | 15-17 | 10-20 | 8-13 | 5 | PASS |
| guarding brute | 6 | 15-17 | 15-17 | 15-17 | 10-20 | 8-13 | 5 | PASS |
| guarding brute | 7 | 15-17 | 15-17 | 15-17 | 10-20 | 7-13 | 5 | PASS |
| guarding brute | 8 | 15-16 | 15-16 | 15-16 | 10-20 | 7-13 | 5 | PASS |
| guarding brute | 9 | 15-16 | 15-16 | 15-16 | 10-20 | 7-14 | 5 | PASS |
| guarding brute | 10 | 15-16 | 15-16 | 15-16 | 10-20 | 7-14 | 5 | PASS |
| swift shield | 4 | 7-8 | 7-8 | 7-8 | 5-10 | 12-18 | 8 | PASS |
| swift shield | 5 | 7-8 | 7-8 | 7-8 | 5-10 | 12-19 | 8 | PASS |
| swift shield | 6 | 7-8 | 7-8 | 7-8 | 5-10 | 11-20 | 8 | PASS |
| swift shield | 7 | 8 | 8 | 8 | 5-10 | 11-20 | 8 | PASS |
| swift shield | 8 | 8 | 8 | 8 | 5-10 | 11-20 | 8 | PASS |
| swift shield | 9 | 8 | 8 | 8 | 5-10 | 11-21 | 8 | PASS |
| swift shield | 10 | 8 | 8 | 8 | 5-10 | 11-21 | 8 | PASS |
| guarding shield | 4 | 7-8 | 7-8 | 7-8 | 5-10 | 12-18 | 8 | PASS |
| guarding shield | 5 | 7-8 | 7-8 | 7-8 | 5-10 | 12-19 | 8 | PASS |
| guarding shield | 6 | 7-8 | 7-8 | 7-8 | 5-10 | 11-20 | 8 | PASS |
| guarding shield | 7 | 8 | 8 | 8 | 5-10 | 11-20 | 8 | PASS |
| guarding shield | 8 | 8 | 8 | 8 | 5-10 | 11-20 | 8 | PASS |
| guarding shield | 9 | 8 | 8 | 8 | 5-10 | 11-21 | 8 | PASS |
| guarding shield | 10 | 8 | 8 | 8 | 5-10 | 11-21 | 8 | PASS |
| swift swarmer | 4 | 2-3 | 2-3 | 2-3 | 2-4 | 18-28 | 12 | PASS |
| swift swarmer | 5 | 2-3 | 2-3 | 2-3 | 2-4 | 18-31 | 12 | PASS |
| swift swarmer | 6 | 2-3 | 2-3 | 2-3 | 2-4 | 18-30 | 12 | PASS |
| swift swarmer | 7 | 2-3 | 2-3 | 2-3 | 2-4 | 17-31 | 12 | PASS |
| swift swarmer | 8 | 2-3 | 2-3 | 2-3 | 2-4 | 17-31 | 12 | PASS |
| swift swarmer | 9 | 2-3 | 2-3 | 2-3 | 2-4 | 17-32 | 12 | PASS |
| swift swarmer | 10 | 2 | 2 | 2 | 2-4 | 17-32 | 12 | PASS |

315 formula cells (5 elite types × 7 belts × 3 students × 3 difficulties). 0 failures. 27/27 swift-Brute fights matched the formula. No neighboring-belt jump was over 2× (Brute only moves 15–17 to 15–16; Shield 7–8 to 8; Swarmer 2–3 to 2).

These are the same live figures the board already recorded (Brute 15–17, Shield 7–8) and the same live column as the Nov 1 note on `5d168db8`. Elite Health in `elites.json` is still **1.25**.

## Bottom line

**Yes: the current numbers are fine.** Do not change `elites.json`. No new Health multiplier is proposed.
