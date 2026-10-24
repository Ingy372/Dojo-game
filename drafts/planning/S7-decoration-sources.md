# S7: Where decorations come from (revised)

Work board S7: "Earning decorations in play… so a student finds something new every few runs."
Author: Dojo-Ascent Researcher & Planner. First version was PR #67, 2026-10-24. Revised the same day after the Learning Designer's review (PR #71, `drafts/learning/l4-review-s7-decorations.md`) and the Manager's three fixes. Plan only; no game code or work-board edits.

**Numbers marked (guess) are my own starting guesses.** Everything else is read from the repo (file and line given).

## What changed in this revision

1. **Class pieces:** a new sure path tied to real class, through the after-class Dojo Blessing.
2. **Sure sources are the main path:** first clears, Monster Journal and class pieces now drive the pacing. A **"next piece" meter** fills on the run summary. Random chest and elite drops are now a small bonus.
3. **Odds screen moved:** it's gone from the kid's view. Odds now live in a parent or teacher info view only.

## Rules every source follows

- **Cosmetic only.** The only power link is the set bonus `docs/core-design.md` §5 already allows. Decorations add no new power.
- **Earned, never bought** (`core-design.md` line 485). No shop, no paid currency, no ads.
- **Not a loot box.**
  - The main path is sure and visible. Chance is a small extra.
  - Kids never see odds, "1 in 10", "rare" labels or the word "duplicate".
- **Nothing is lost on a loss.** Pieces found before falling are kept; the run summary already carries `decorations` for both results (`packages/sim/src/run.ts` line 351).
- **No FOMO, timers or streaks.**
  - Class pieces never need days or weeks in a row, and are never taken away.
  - Event pieces come back later.
- **New before repeat.** `dropDecoration` already picks the kinds you own fewest of.

## The main path: sure pieces + the "next piece" meter

Each sure source has its own short meter. The run summary shows **one** of them, whichever is closest to full. This is the same pick as the S9 "closest goal" line, so it shows one line and not three.

| # | Sure source | How it fills | Piece | Launch? |
| --- | --- | --- | --- | --- |
| A | **Class pieces** | +1 for each real class attended. A piece every **3 classes** (guess). | Class scroll / dojo gear set, one per 3 classes, with a story line ("3 classes trained!") | Yes |
| B | **First floor clear** | Clearing a floor for the first time | That floor's themed piece (for example a Floor Keeper statue) | Yes |
| C | **Monster Journal** (Bestiary) | +1 for each new entry. A trophy every **2 entries** (guess); a named monster gives its own trophy at once | Monster trophy | Yes (`decisions.md` line 374) |
| D | **Challenge medal** (4th belt +) | First time all of a floor's challenge rooms are cleared in time | Floor medal | Yes |
| E | **Real achievements** | Promotion, stripe, anniversary | Certified trophy with a seal (`decisions.md` line 262) | Milestone 12 |
| F | **Open House** | Visiting during the event; missed events are given at the next one | Event banner | Post-launch |

### Class pieces: how they hook into the Blessing

- **What already exists:**
  - `buildTraining` in `packages/sim/src/training.ts` already turns the feed's `attendance.recentClasses` into `blessed` and `lastClass` (`BLESSING.hours` 48, `config.ts` line 224).
  - `packages/sim/src/rewards.ts` line 102 already emits `{ kind: 'blessing' }` once for each new `lastClass`.
- **New:** a saved counter `classesCounted` in the profile, plus the last class date counted.
  - Each new class date in `recentClasses` adds 1, **including dates that arrive late**. A kid who opens the game a week after class still gets credit, because it counts class dates and not game opens.
  - The counter only goes up. It never resets, never needs days in a row, and has no deadline.
  - At every 3rd class (**every 2nd class at white belt**, Manager decision Oct 24), the Blessing reward moment also shows "A new class piece for your dojo!"
- **Feed total (when present):** if the feed has `attendance.classesTotal` (lifetime certified classes, see `classes-total-feed-field.md`), the counter takes `classesCounted = max(classesCounted, classesTotal)` on every sync. It never goes lower. Class pieces still come only from **new** class dates after install. A first sync that raises the total from, say, 9 to 200 does not dump 60 pieces; it gives at most 1 "welcome" class piece (guess). The big total feeds S6 milestones and S10 looks instead.
- **No real student data is needed to build it.** Fake profiles in `fixtures/` already carry `attendance`, so the testing screen can add a class.
- A student who can't attend for a while loses nothing; the meter just waits.

## The bonus: random drops (small)

| Source | Rate now | Proposed (guess) | Note |
| --- | --- | --- | --- |
| Boss chest | 1.0 | **0.05** | |
| Treasure chest | 0.25 | **0.04** (S7-rev2, was 0.10) | |
| Challenge chest | 0.25 | **0.03** | |
| Elite (4th belt +) | 0.5 (PR #54) | **0.15** | Dropped where the elite falls (`decisions.md` line 427) |
| Crafting | n/a | Post-launch (`decisions.md` line 85) | |

- **Random drops per cleared run (D):**
  - Belts 1–3: 0.05 + 0.65×0.04 + 1.91×0.03 ≈ **0.13**.
  - 4th belt and up adds about 0.6 elites × 0.15, so D ≈ **0.22**.
  - Room counts come from my Monte Carlo of the `FLOOR` door rules (200,000 floors): 0.65 treasure rooms and 1.91 challenge rooms per floor.
- Random drops come from a small per-tier pool: **5 kinds × 2 colours = 10** (guess; S7-rev2, was 16). They show to the kid as "A surprise!"
- **No bad-luck counter is needed.** The sure meters guarantee steady progress.
- **Odds live in a parent or teacher info view** (Parent Zone or teacher dashboard), along with every source and rate. They're kept in data in `content/dojo/decorations.json`.

## Maths: runs between new pieces (sure path first)

Assumptions:

- Runs per tier = months in rank × 4.35 × 8 runs a week (`PROGRESSION.typicalRunsPerWeek` 8). Months come from the sample fixture `fixtures/3-yellow-belt.json` (`typicalMonthsInRank`).
- Classes = 2 a week (guess, from the fixture's two `classDays`).
- 3 floors per tier (guess, fixed at milestone 10).
- About 6 new Monster Journal entries per tier, including one named monster (guess).

| Belt tier | Months | Runs | Classes | Class pieces | First clears | Journal trophies | Medals (4th +) | **Sure total** | Random (D × runs, max pool 10) | **All new** | **Runs per new (all)** | **Runs per new (sure only)** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 (white, every 2 classes) | 3 | ~104 | ~26 | ~13 | 3 | ~4 | 0 | **~20** | ~10 (pool cap) | ~30 | **~3.5** | ~5.2 |
| 2–3 | 3 | ~104 | ~26 | ~9 | 3 | ~4 | 0 | **~16** | ~10 (D 0.13 → 13.8, pool caps at 10) | ~26 | **~4.0** | ~6.5 |
| 4–5 | 3 | ~104 | ~26 | ~9 | 3 | ~4 | 3 | **~19** | ~10 (pool cap) | ~29 | **~3.6** | ~5.5 |
| 6–7 | 6 | ~209 | ~52 | ~17 | 3 | ~4 | 3 | **~27** | ~10 | ~37 | **~5.6** | ~7.7 |
| 8 | 9 | ~313 | ~78 | ~26 | 3 | ~4 | 3 | **~36** | ~10 | ~46 | **~6.8** | ~8.7 |
| 9 | 12 | ~418 | ~104 | ~35 | 3 | ~4 | 3 | **~45** | ~10 | ~55 | **~7.6** | ~9.3 |

What the table shows:

- **Sure sources are 67% at white belt, 62% (belts 2–3) and 66% (belts 4–5) of all new pieces, and 73–82% at long belts** (S7-rev2: treasure rate and random pool cut). They're also the only part that grows with real training.
- Belts 1–5 get something new about every **3.5–4 runs**. That's slightly slower than before; the trade is chosen so chance stays a small bonus.
- Long belts get something new about every **5–7 runs**, mostly from class. Going faster would need more art (scope risk 1).
- A kid who trains more in class gets more pieces. Playing more only speeds up the small random pool, which then stops.
- The meter always has something to fill, because class keeps adding to it.

## Duplicates

- No repeats while any piece in the tier pool is unowned (fewest-first, already built).
- After that, a random repeat is an extra copy you can place, **up to 3 of each**. After 3, the roll is skipped quietly. Chests still give normal gear.
- The interface never says "duplicate". Sure pieces are always unique, so they never repeat.
- No selling, trading or converting at launch (crafting is post-launch).

## Kid-facing words (ages 6+)

- **Dojo screen:** "How to get new things for your dojo: clear floors, fill your Monster Journal, train in class." Nothing else, no numbers.
- **Teach a little at a time:**
  - White belt hears about first clears and the Monster Journal.
  - Class pieces are introduced at the first Blessing. If that session already teaches another new system (Mission, Form), the class-piece lesson waits for the next session (one new system per session, L4 S7-S2).
  - Medals and elites come in at 4th belt (§13 pacing).
- **Meter line examples:**
  - "1 more class for a new class piece!"
  - "2 more monsters for a new trophy!"
- **Visiting dojos:** no counts, no "rarest" labels. Showing the owner's favourite piece is fine.

## Scope risks

1. **Art:** class pieces (about 9–35 per tier), 10 random pieces per tier, plus floor pieces and trophies. Colours and a shared class-scroll design keep the cost down. The Artist should size this (white belt now needs ~13 class pieces).
2. **`classesCounted`** is a new saved field. When the feed has `classesTotal`, that wins (take the max); `classesInRank` seeding is only the fallback. It needs a migration for old saves: start at 0, or seed it from `classesInRank` (Manager to choose; I suggest seeding so current students aren't behind).
3. **Parent or teacher view:** this is new UI. If the Parent Zone isn't in launch, the odds stay in data and docs until it is.
4. **Floors per tier and the number of Journal entries** are guesses until milestone 10.
5. **Elite rate** goes from 0.5 (PR #54) to 0.15. This needs the Manager's OK.
6. **Sets** may slip to post-launch without breaking anything else.

## Done-when

- **Class pieces:**
  - In a test, a fake profile gains 3 new `recentClasses` dates and gets exactly one class piece; a white-belt profile gets one every 2 classes.
  - A class date that arrives late still counts.
  - Opening the game twice for the same class adds nothing.
  - `classesCounted` never goes down, even if the feed's list gets shorter.
  - With `classesTotal` 200 and a saved 9, after sync `classesCounted` is 200 and at most 1 class piece is given; with `classesTotal` missing, counting falls back to class dates; a later lower `classesTotal` (e.g. 150) changes nothing.
  - There's no rule about days or weeks in a row anywhere in the code.
- **First clear:** each floor names its piece in data; the first clear always gives it, and never again; test.
- **Monster Journal:** every 2 new entries gives one trophy, and a named monster gives its trophy on its first defeat; test.
- **Challenge medal:** given once, the first time a floor's challenge rooms are all cleared in time; test.
- **Meter:**
  - The run summary shows exactly one meter line, the one closest to full, using the S9 pick.
  - The meter fills only. A loss never lowers it; test.
- **Random bonus:** the `dropChance` values match the table in `content/dojo/decorations.json` and `content/elites/elites.json`. A 10,000-open seeded test lands within ±1%.
- **Odds hidden from kids:** no kid-facing screen shows odds, percentages, "rare" or "duplicate" (word check). The parent or teacher view lists every source and rate.
- **Loss:** a test loses a run after a piece drops and checks it's saved.
- **Duplicates:** none while unowned pieces remain, at most 3 of a kind, no message after that.
- **Pacing:**
  - The balance player (typical profile with 2 classes a week, 104 runs at Tier 1) gets something new on average about every 3.5 runs; belts 2–5 every 3.5–4.5 runs.
  - At least 60% of the new pieces at belts 1–5 come from sure sources (S7-rev2, from L4 review PR #77).
- **Open House (post-launch):** visiting gives the banner, and a student who missed it gets it at the next event.

The Learning Designer reviews this revision.
