# SHOP-BAL-01: belt 3 drops against belt 2 (R-SHOP-sim re-run)

## SHOP-BAL-01b: re-run on live main (the Ember drops are live)

**ITEM:** SHOP-BAL-01 follow-up (Content Designer). **Date:** Nov 2, 2026 (America/New_York). **Main:** a04f3f8 (#439 merged, so `content/loot/drops.json` has the six Ember entries).

### Result on live main
**PASS in every cell.** Belt 3 items per run ÷ belt 2 and ÷ belt 4 are inside 0.5 to 2.0 for the `kid`, `newer` and `careful` bots on Guided and Standard (the cells that count), and on Challenge (information only). I ran four seed sets of 100 seeds each (bases 1000, 5000, 9000 and 20000; 400 runs per cell).

| Difficulty | Bot | B3 ÷ B2, lowest to highest over the 4 seed sets | B3 ÷ B4, lowest to highest | 2x rule |
|---|---|---|---|---|
| guided | kid | 0.92 to 1.01 | 0.94 to 1.01 | PASS |
| guided | newer | 0.75 to 0.82 | 0.76 to 0.80 | PASS |
| guided | careful | 0.79 to 0.82 | 0.78 to 0.83 | PASS |
| standard | kid | 1.03 to 1.17 | 1.09 to 1.45 | PASS |
| standard | newer | 0.73 to 0.78 | 0.74 to 0.78 | PASS |
| standard | careful | 0.73 to 0.78 | 0.72 to 0.77 | PASS |
| challenge | kid | 1.09 to 1.32 | 1.05 to 1.23 | PASS (info) |
| challenge | newer | 0.75 to 0.82 | 0.75 to 0.79 | PASS (info) |
| challenge | careful | 0.77 to 0.80 | 0.75 to 0.81 | PASS (info) |

**The range across seed sets is 0.72 to 1.45** for the cells that count (belt 3 ÷ belt 2 alone: 0.73 to 1.17). That replaces the single-seed-set "0.75 to 1.04" in the first write-up below. The Tester's 0.73 to 1.14 sits inside it. The skilled bots (`newer`, `careful`) always land at 0.72 to 0.83, a little under the neighbours. The `kid` bot on Standard is the high end (1.03 to 1.17 against belt 2, up to 1.45 against belt 4); it finishes fewer runs, so its numbers move more from one seed set to the next. Both edges are far from the 0.5 and 2.0 limits.

- The first seed set (base 1000) gives the same numbers as the table with LOOT-B3-01 applied in the first run, so putting the table in `drops.json` changed nothing else.
- Every cell, every seed set, is in `SHOP-BAL-01-items.json` under `liveMain_a04f3f8`; the tool is `shop-bal-01-ratios.py live=a.json,b.json,...` (it prints each set, then the range, and exits with an error if any cell is outside 0.5 to 2.0).

**Tester's #442 note (added Nov 8, 2026, America/New_York):**
- The 0.73 to 1.17 range (belt 3 ÷ belt 2) covers **Guided and Standard only**. The Challenge `kid` cell is information only and reaches about **1.33** (1.32 in my four seed sets).
- The data hashes in `check-loot-b3.py` cover the belt 1 and belt 3 rooms and enemies only. They **do not cover bot or student stats** (the tier stats in `LOOT-B3-01-per-run.json`, or the sim bots). If those change, the check will not notice. Re-run the sim by hand.

### The regenerated R-SHOP table
`python3 drafts/planning/R-SHOP-sim/coins.py` on the base 1000 run (`/tmp/coins-live2.json`) is saved as **`drafts/content/loot/SHOP-BAL-01b-table.md`**. The committed `drafts/planning/R-SHOP-sim/table.md` is in the Researcher & Planner's folder (`drafts/planning/`), not `drafts/content/`, and the Content Writer may only edit `drafts/content/` (docs/GROK_BOTS.md), so I left it alone. Only the belt 3 rows change ("own everything" weeks on belt 3 go from 100 to 123 down to 94 to 117 for Guided and Standard) plus the numbers that use them. **DECIDE:** the Planner or Manager copies `SHOP-BAL-01b-table.md` over `table.md` (without the first comment block).

### Dusty Entry, idle student (Tester follow-up, accepted for now)
In the Tester's browser run (932x430) a student who sends no input in Dusty Entry lost at worst **78%** of health, with a **27% average** over the runs. The Manager accepted that for now, so I changed nothing more in the room. My sim idle-student numbers (below) are lower than the browser ones, as before. I could not reproduce the browser figure in the sim.

### Checker changes (`check-loot-b3.py`)
- It now reads the **live** `content/loot/drops.json` and works the per-run ratio out from it. It **fails if `drafts/content/loot/LOOT-B3-01.json` and the live file differ** in any enemy chance, in the chests, or in the top-level keys, and says which enemies differ. It also fails if one of the four original entries (swarmer, shield, bopper, brute) changes.
- The data hash now covers **both belts the ratio depends on**: all White Dojo rooms (belt 1) and Ember Kitchens rooms (belt 3), plus every enemy they use or split into. Each is stored in `LOOT-B3-01-per-run.json` (`belt1.dataSha256`, `belt3.dataSha256`). If a room or enemy changes, it fails and says to re-run the sim.
- Tested: moving one enemy in `w-training-yard` one column (fails, names belt 1), changing the swarmer's health (fails, names belt 1), changing the live `rolling-pin` chance (fails, says the draft and live differ on rolling-pin), changing the draft `brute` chance (fails, same message). Each was restored and the check passes again.
- Re-measured the enemies per run on main a04f3f8: belt 1 counts are identical; belt 3 counts moved by under 1.5% (spark-sprite 54.4 to 53.9 per run), most likely from sim changes in #439. Expected enemy drops per run: belt 3 4.62, belt 1 4.43, ratio 1.04 (limit 0.75 to 1.25).

---

## First write-up (#434, main 56a079f, before the drops were live)

**ITEM:** SHOP-BAL-01 (Content Designer). **Date:** Nov 2, 2026 (America/New_York). **Main:** 56a079f (#430 and #431 merged).
**Rule from the board (origin/bot-manager 3e18bbf):** "Re-run of `R-SHOP-sim` shows belt 3 items per run within 2x of belt 2 and 4 for every bot." I read that as: belt 3 items per run ÷ belt 2 and ÷ belt 4 are both from 0.5 to 2.0, for the `kid`, `newer` and `careful` bots.

### Result

| Drop table | Result | Lowest belt 3 ÷ belt 2 | Highest |
|---|---|---|---|
| **Main today** (`content/loot/drops.json`: the four live enemies only) | **FAIL** (3 of 6 cells on Guided and Standard) | 0.47 (Standard, newer) | 0.59 (kid) |
| **With LOOT-B3-01.json** (the drop-in table from #424/#431) | **PASS** (6 of 6 cells) | 0.75 (Standard, newer) | 1.04 (Standard, kid) |

So the fix for SHOP-BAL-01 is the table that is already drafted. It is **not live yet**: someone with game-file access must copy the six new keys from `drafts/content/loot/LOOT-B3-01.json` into `content/loot/drops.json`. Nothing was changed in game code or content for this run.

### How it was run (as specified)
- Spec: `drafts/planning/R-SHOP.md` section 1.1 and section 11. Script: `drafts/planning/R-SHOP-sim/zz-coins.test.ts.txt`.
- In a throwaway worktree of main 56a079f, copied to `packages/sim/test/balance/zz-coins.test.ts`, then `COINS=1 SEEDS=100 OUT=... npx vitest run test/balance/zz-coins.test.ts` in `packages/sim` (seeds 1000 to 1099, belts 1-10, Guided / Standard / Challenge, three bots: `kid` = kid style, novice; `newer` = smart, typical; `careful` = smart, sharp). 9,000 runs per drop table. The copy was deleted afterward.
- Run 1: main's own `content/loot/drops.json`. Run 2: the same, with the drop table replaced by `drafts/content/loot/LOOT-B3-01.json` (in the throwaway worktree only).
- Check on the run: `python3 drafts/planning/R-SHOP-sim/coins.py` on run 1 gives a table identical to the committed `drafts/planning/R-SHOP-sim/table.md`, so the re-run reproduces the board's numbers.
- "Items per run" is every piece of gear a run drops (enemy drops plus chests), as in `table.md`.
- Challenge is locked before belt 4, so Challenge rows are information only and left out of pass or fail.
- Tools saved here: `drafts/content/tools/shop-bal-01-ratios.py` (makes the tables below), `drafts/content/loot/SHOP-BAL-01-items.json` (every cell).

### Items per run by belt: main today

| Difficulty | Bot | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | B10 | B3 ÷ B2 | B3 ÷ B4 | 2x rule |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| guided | kid | 9.5 | 9.4 | 5.5 | 9.1 | 9.3 | 9.3 | 9.1 | 9.1 | 9.0 | 8.9 | 0.59 | 0.61 | PASS |
| guided | newer | 14.1 | 13.3 | 6.6 | 13.7 | 13.6 | 13.6 | 13.8 | 13.7 | 13.7 | 13.5 | 0.50 | 0.48 | FAIL |
| guided | careful | 13.9 | 13.1 | 6.6 | 13.1 | 13.1 | 13.1 | 13.3 | 13.4 | 13.4 | 13.3 | 0.51 | 0.51 | PASS |
| standard | kid | 6.4 | 6.1 | 3.6 | 5.5 | 5.8 | 5.7 | 5.4 | 5.6 | 5.8 | 5.6 | 0.59 | 0.66 | PASS |
| standard | newer | 14.2 | 14.2 | 6.7 | 13.9 | 13.7 | 13.6 | 14.0 | 13.9 | 14.0 | 13.9 | 0.47 | 0.48 | FAIL |
| standard | careful | 13.9 | 14.6 | 7.1 | 14.2 | 14.5 | 14.5 | 14.5 | 14.5 | 14.5 | 14.4 | 0.49 | 0.50 | FAIL |
| challenge | kid | 4.2 | 3.4 | 2.7 | 4.0 | 4.5 | 4.5 | 3.9 | 4.1 | 4.2 | 4.1 | 0.79 | 0.66 | PASS (info) |
| challenge | newer | 14.4 | 13.6 | 6.7 | 13.6 | 13.7 | 13.5 | 13.3 | 13.4 | 13.4 | 13.6 | 0.49 | 0.50 | FAIL (info) |
| challenge | careful | 13.6 | 13.4 | 6.8 | 13.2 | 13.4 | 13.4 | 13.3 | 13.3 | 13.4 | 13.6 | 0.51 | 0.52 | PASS (info) |

### Items per run by belt: with LOOT-B3-01.json

| Difficulty | Bot | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | B10 | B3 ÷ B2 | B3 ÷ B4 | 2x rule |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| guided | kid | 9.5 | 9.4 | 9.2 | 9.1 | 9.3 | 9.3 | 9.1 | 9.1 | 9.0 | 8.9 | 0.98 | 1.01 | PASS |
| guided | newer | 14.1 | 13.3 | 10.9 | 13.7 | 13.6 | 13.6 | 13.8 | 13.7 | 13.7 | 13.5 | 0.82 | 0.80 | PASS |
| guided | careful | 13.9 | 13.1 | 10.6 | 13.1 | 13.1 | 13.1 | 13.3 | 13.4 | 13.4 | 13.3 | 0.81 | 0.81 | PASS |
| standard | kid | 6.4 | 6.1 | 6.4 | 5.5 | 5.8 | 5.7 | 5.4 | 5.6 | 5.8 | 5.6 | 1.04 | 1.16 | PASS |
| standard | newer | 14.2 | 14.2 | 10.6 | 13.9 | 13.7 | 13.6 | 14.0 | 13.9 | 14.0 | 13.9 | 0.75 | 0.77 | PASS |
| standard | careful | 13.9 | 14.6 | 11.0 | 14.2 | 14.5 | 14.5 | 14.5 | 14.5 | 14.5 | 14.4 | 0.76 | 0.77 | PASS |
| challenge | kid | 4.2 | 3.4 | 4.2 | 4.0 | 4.5 | 4.5 | 3.9 | 4.1 | 4.2 | 4.1 | 1.25 | 1.05 | PASS (info) |
| challenge | newer | 14.4 | 13.6 | 10.8 | 13.6 | 13.7 | 13.5 | 13.3 | 13.4 | 13.4 | 13.6 | 0.79 | 0.79 | PASS (info) |
| challenge | careful | 13.6 | 13.4 | 10.7 | 13.2 | 13.4 | 13.4 | 13.3 | 13.3 | 13.4 | 13.6 | 0.80 | 0.81 | PASS (info) |

### Reading the numbers
- Belts 1, 2 and 4 to 10 are the same in both runs (about 14 items per run for `newer` and `careful`, about 9 on Guided and 6 on Standard for `kid`). Only belt 3 moves.
- Today belt 3 drops about half as much as its neighbours, because the Ember Kitchens enemies have no drop chance. The `newer` and `careful` bots sit right on the 0.5 line: Standard `newer` 0.47 and `careful` 0.49, Guided `newer` 0.498 (shown as 0.50).
- With the drafted table, belt 3 is 10.6 to 11.0 items per run for `newer` and `careful` (0.75 to 0.82 of belt 2) and 6.4 to 9.2 for `kid` (about the same as belt 2). Every cell is inside the 2x rule with room to spare.
- Belt 3 stays a little under belt 2 for the two skilled bots (0.75 to 0.82). That is fine for the rule. If the Manager wants belt 3 closer to belt 2, raise `brute` and `rolling-pin` a little; I did not, because the earlier per-run check put enemy drops on belt 3 at 1.04x belt 1 (`LOOT-B3-01.md`) and I would not move numbers the Manager just approved.
- Coin effect (R-SHOP.md): with the drafted table, belt 3 sell coins go up by about 5 to 8 coins a run and "own everything" weeks on belt 3 move from 100-123 to 94-117, in line with belt 2 (90-122). `table.md` should be regenerated after the Programmer copies the keys.

### Other things I checked
- The per-run drop check (`check-loot-b3.py`, belt 3 vs belt 1, 1.04x) is unchanged and still passes. I re-measured the enemies per run on main 56a079f: the counts are identical to the stored file.
- `check-loot-b3.py` now stores and checks a SHA-256 of the Ember Kitchens rooms and the enemies they use. If a room or enemy changes, it fails and says to re-run the sim. I tested it by moving one spark-sprite one column (fails with the message) and by changing one enemy's health (fails), then restoring both (passes).

### Dusty Entry (Tester follow-up b)
Change: wave 1 is now the two Page Flutters, placed far from the start (top right and top left); wave 2 is the two Bookworms and one Page Flutter. Same five enemies, same count of each. `drafts/content/rooms/root-library.json` and the Dusty Entry row of `root-library-brief.md`.

I could not copy the Tester's browser setup (932x430), so I measured with the sim: a student who sends no input at all, in Dusty Entry on belt 8 (100 seeds):

| Student | Before: lost after 10 s | After | Before: worst, 20 s or more | After |
|---|---|---|---|---|
| Belt 8 student stats | 16% | 10% | 20% | 18% |
| Belt 4 (Green) student stats, in the belt 8 room | 46% | 30% | 100% | 100% |

- The sim's idle belt 8 student never gets close to 77%, so the Tester's 77% most likely came from a weaker student than belt 8 stats (the browser harness uses a belt 4 student). With belt 4 stats, a student who never moves or hits is knocked out in 20 s both before and after; that is a mismatch between student and belt, not a room problem.
- The gain is real but small: the first 10 seconds are gentler (16% to 10% for a belt 8 student, 46% to 30% for a belt 4 one). Moving Bookworms to wave 1 was worse (28%), and cutting wave 1 to one enemy is not an option, because the next wave arrives when one enemy is left, so it would start at once.
- Kid bot, belts 8 / 9 / 10, 40 seeds: **room-1 KOs 0, 0, 0**, wins 40/40, 38/40, 17/40. Identical to main before the change (belt 10's 17/40 is not new and is not Dusty Entry).
