# LOOT-B3-01: drops for Belt 3 (Ember Kitchens) enemies

**Status:** draft for the Programmer to copy into `content/loot/drops.json`. The Content Writer only edits `drafts/content/` (see `drafts/content/README.md`), so the live file is not touched.

## What is missing
`content/loot/drops.json` has `enemyDropChance` for swarmer, shield, bopper and brute only. The sim treats a missing enemy as 0% (`enemyDropChance[id] ?? 0` in `packages/sim/src/run.ts`), so five Ember Kitchens enemies never drop gear. The brute is already covered. The two Guardians (Floor Keeper, Hearth Cook) have no entry on purpose: the boss chest is their prize.

## What to add
`drafts/content/loot/LOOT-B3-01.json` is the whole `drops.json` with these five keys added (only the `notes` text and these keys differ; `chests` is unchanged):

| Enemy id | Health / power | Chance | Matches |
| --- | --- | --- | --- |
| `spark-sprite` | 22 / 7 | 0.035 | Swarmer (20 / 7) |
| `doughling` | 22 / 7 | 0.02 | Lower than the swarmer, because a Dough Blob splits into 2 |
| `dough-blob` | 62 / 11 | 0.10 | Shield Guard and Bopper (66 / 11) |
| `ladle-lobber` | 65 / 11 | 0.10 | Shield Guard and Bopper |
| `rolling-pin` | 72 / 11 | 0.10 | Shield Guard and Bopper |

A Blob and its 2 Doughlings together give 0.10 + 2 x 0.02 = 0.14, close to the brute's 0.15.

## Balance
Expected enemy drops over one Ember floor (4 battle rooms, the challenge, the boss room): about 4.1, against about 3.5 for a belt 1 floor (ratio 1.16). The rooms are bigger at Belt 3, so a little more is fair. Chest sizes are unchanged. Gear is still white-tier items until the per-tier gear import (`docs/decisions.md`, R-BAL-10).
No loot boxes, no timers, no "bad luck" wording. Nothing here asks the kid to do anything.

## Check
`python3 drafts/content/tools/check-loot-b3.py`: every non-boss enemy in the Ember rooms (and the Dough Blob's split) has an entry, every key is a real enemy, the four live entries are unchanged, chances follow the health bands, and the floor total is within 25% of belt 1. The game's own loader only needs each key to be a real enemy and each chance from 0 to 1.
