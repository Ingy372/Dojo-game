# LOOT-B3-01: drops for Belt 3 (Ember Kitchens) enemies

**Status:** draft for the Programmer to copy into `content/loot/drops.json`. The Content Writer only edits `drafts/content/` (see `drafts/content/README.md`), so the live file is not touched.

## What is missing
`content/loot/drops.json` has `enemyDropChance` for swarmer, shield, bopper and brute only. The sim treats a missing enemy as 0% (`enemyDropChance[id] ?? 0` in `packages/sim/src/run.ts`), so five Ember Kitchens enemies never drop gear. The brute is already covered. The two Guardians (Floor Keeper, Hearth Cook) have no entry on purpose: the boss chest is their prize.

## What to add
`drafts/content/loot/LOOT-B3-01.json` is the whole `drops.json` with these five keys added (only the `notes` text and these keys differ; `chests` is unchanged):

| Enemy id | Health / power | Chance | Matches |
| --- | --- | --- | --- |
| `spark-sprite` | 22 / 7 | 0.025 | A bit under the Swarmer (0.035), because a run meets about 54 of them |
| `doughling` | 22 / 7 | 0.02 | Lower than the swarmer, because a Dough Blob splits into 2 |
| `dough-blob` | 62 / 11 | 0.07 | Under the Shield Guard and Bopper (0.10) (66 / 11) |
| `ladle-lobber` | 65 / 11 | 0.07 | Under the Shield Guard and Bopper (0.10) |
| `rolling-pin` | 72 / 11 | 0.07 | Under the Shield Guard and Bopper (0.10) |

A Blob and its 2 Doughlings together give 0.07 + 2 x 0.02 = 0.11, under the brute's 0.15.

## Balance
The measure is expected enemy drops **per run**: how many of each enemy a run really meets, times its chance. The first version counted rooms on one floor and said 1.16x. A run is 8 rooms, so it meets many more enemies, and the real number was higher. The first values (0.035 / 0.10) gave 5.98 drops per Ember run against 4.43 on belt 1, which is **1.35x**.

How it is measured: `drafts/content/tools/loot-per-run-sim.test.ts.keep` plays 200 runs (seeds 1 to 200) with the smart bot at typical skill, tier 1 stats on belt 1 and tier 3 stats on belt 3, and counts the enemies in the rooms each run plays (a Dough Blob's two Doughlings included). The counts are saved in `LOOT-B3-01-per-run.json`.

| Belt 3 enemy | Met per run | Chance | Drops per run |
| --- | --- | --- | --- |
| `spark-sprite` | 54.4 | 0.025 | 1.36 |
| `dough-blob` | 8.5 | 0.07 | 0.60 |
| `doughling` | 17.1 | 0.02 | 0.34 |
| `brute` | 6.6 | 0.15 | 1.00 |
| `rolling-pin` | 10.3 | 0.07 | 0.72 |
| `ladle-lobber` | 8.6 | 0.07 | 0.60 |
| **Total** | | | **4.61** |

Belt 1 (69.1 Swarmers at 0.035, 20.2 Shield Guards at 0.10) gives 4.43. The ratio is **1.04x** (was 1.35x). The Doughling stays at 0.02: with the Blob at 0.07 the Blob and its pair give 0.11, and the total is already within 4% of belt 1.
Chest sizes are unchanged. Gear is still white-tier items until the per-tier gear import (`docs/decisions.md`, R-BAL-10).
No loot boxes, no timers, no "bad luck" wording. Nothing here asks the kid to do anything.

## Check
`python3 drafts/content/tools/check-loot-b3.py`: every non-boss enemy in the Ember rooms (and the Dough Blob's split) has an entry, every key is a real enemy, the four live entries are unchanged, chances follow the health bands, and the per-run total on belt 3 is within 25% of belt 1 (it fails at the first values, 1.35x). The game's own loader only needs each key to be a real enemy and each chance from 0 to 1.
