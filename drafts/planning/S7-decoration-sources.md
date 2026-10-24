# S7: Where decorations come from

Work board S7: "Earning decorations in play… so a student finds something new every few runs."
Author: Dojo-Ascent Researcher & Planner, 2026-10-24. A plan only; no game code or work-board edits.

**Numbers marked (guess) are my own starting guesses.** Everything else is read from the repo (file and line given).

## Rules every source follows

- **Cosmetic only.** A decoration changes how the dojo looks. The only power link is the set bonus that `docs/core-design.md` §5 already allows (for example Calm Mind lasting longer); no new power from decorations.
- **Earned, never bought** (`docs/core-design.md` line 485). No shop, no paid currency, no ads.
- **No loot-box feel.**
  - The Dojo screen shows the odds in plain words: "Boss chests: 1 in 10 hold a decoration."
  - Bad-luck protection: after **6 runs in a row with no new decoration**, the next chest is sure to hold one (guess). This works like the gear rule (`LOOT.guaranteedRareOnRun` 5).
  - **Nothing is lost on a loss.** Decorations found before falling are kept. The run summary already carries `decorations` for both results (`packages/sim/src/run.ts` line 351).
- **No FOMO, no timers, no streaks.** Nothing can be missed for good. Event decorations come back (see Open House).
- **New before repeat.** `dropDecoration` already picks the kinds you own fewest of (`run.ts`). So every drop is new until the pool runs out.

## Sources

| # | Source | Rate | What it can drop | Launch? |
| --- | --- | --- | --- | --- |
| 1 | Boss chest | **0.10** (now 1.0) (guess) | Any decoration from the tier pool | Yes |
| 2 | Treasure chest | **0.20** (now 0.25) (guess) | Tier pool | Yes |
| 3 | Challenge chest | **0.05**, **0.10** if cleared in time (now 0.25) (guess) | Tier pool | Yes |
| 4 | Elite defeated (4th belt +) | **0.25** (PR #54 said 0.5) (guess) | Tier pool, dropped where the elite falls (`decisions.md` line 427) | Yes, with elites |
| 5 | First clear of each floor | **1 sure**, once per floor | That floor's own themed piece (for example a Floor Keeper statue) | Yes |
| 6 | Bestiary / Monster Journal | **1 sure** each time 5 new entries fill in (guess); named monster gives its own trophy | Monster trophies (a small statue or banner) | Yes (`decisions.md` line 374) |
| 7 | Decoration sets | Not a drop. Owning all pieces turns on the set bonus and gives a small set plaque | Set plaque | Yes, if sets ship (scope risk) |
| 8 | Challenge mode (4th belt +) | **1 sure** the first time a floor's challenge rooms are all cleared in time | Challenge medal for that floor | Yes |
| 9 | Open House events | **1 sure** for everyone who visits during the event; no task list | Event banner (one per event) | Post-launch (needs multiplayer) |
| 10 | Real achievements | Given by the real event (promotion, stripe, anniversary) | Certified trophy with a seal (`decisions.md` line 262) | Yes, as planned in milestone 12 |
| 11 | Crafting | n/a | Chosen piece from materials | **Post-launch** (`decisions.md` line 85) |

Rows 1–4 are random and come from one **tier pool**. Rows 5–10 are sure things, and the player can always see how to get them.

### Why lower the chest rates?

Today: the boss chest always drops a decoration (`content/dojo/decorations.json` `dropChance.boss 1`), and there are only 8 tower decorations. I ran a Monte Carlo over the floor door rules (`FLOOR` in `config.ts`; random door choice, 200,000 floors). A cleared floor has about **0.65 treasure rooms** and **1.91 challenge rooms**.

- Today's expected drops per cleared run: 1 + 0.65×0.25 + 1.91×0.25 = **1.64**.
- So a new White belt owns all 8 tower decorations after about **5 runs**, and gets only repeats for the rest of the belt (about 104 runs).

That's the opposite of "something new every few runs." The fix is a slower random rate plus a bigger pool for each tier.

## Maths: runs between new decorations

Runs per tier = months in rank × 4.35 weeks × 8 runs a week (`PROGRESSION.typicalRunsPerWeek` 8). Months in rank come from the sample fixture (`fixtures/3-yellow-belt.json`, `typicalMonthsInRank`). They're samples, so Jay's real times may differ.

Random new decorations per cleared run with the proposed rates (D):

- Belts 1–3: 0.10 + 0.65×0.20 + 1.91×0.075 (half in time, guess) ≈ **0.37**
- 4th belt and up (adds elites, about 0.6 a floor from the PR #52 sim × 0.25): ≈ **0.52**
- A lost run counts only the chests opened before the loss, so it gives less. Bad-luck protection caps the dry spell at 6 runs.

| Belt tier | Months (sample) | Runs in tier | Random D | Runs per new (random) | Sure pieces (guess) | Pool needed to last the tier |
| --- | --- | --- | --- | --- | --- | --- |
| 1–5 | 3 | ~104 | 0.37 (0.52 from 4th) | **~2.7** (~1.9) | 3 floors + ~2 Bestiary + medals from 4th = 5–8 | ~38 (~54 from 4th) |
| 6–7 | 6 | ~209 | 0.52 | ~1.9 | 5–8 | ~110 |
| 8 | 9 | ~313 | 0.52 | ~1.9 | 5–8 | ~165 |
| 9 | 12 | ~418 | 0.52 | ~1.9 | 5–8 | ~220 |

**Pool plan (guess):** each tier gets **10 new kinds × 3 colours = 30 pieces**. A colour is a cheap recolour, but it counts as new and shows "New!".

- Belts 1–3: 30 random + about 5 sure ≈ 35, so new about every **3 runs** for the whole belt. ✔
- Long belts (6+): 30 pieces last about 60 runs out of 200–400. After that, new comes only from the sure sources, about every **25–50 runs**. ✘ This is the main scope risk (see below).
- Option for long belts: lower the random rate to D ≈ 0.15 once the tier is 6 months or longer, so 30 pieces last about 200 runs (**new every ~7 runs**). I recommend this; it's one number per tier.

Unowned pieces from lower tiers stay in the pool, so a student who joins a run above their usual belt never loses anything.

## Duplicates

- No duplicates drop while any piece in the tier pool is unowned (fewest-first, already built).
- After that, a duplicate is a real extra copy you can place (two lanterns are fine), **up to 3 of each**.
- After 3, the decoration roll is simply skipped, with no "you got nothing" message. Chests still give their normal gear.
- No selling, trading or converting duplicates at launch. A later crafting system could turn spares into materials (post-launch, `decisions.md` line 85).

## Open House events (post-launch, rules now)

- A few times a year (`core-design.md` line 491). The event lasts at least **2 weeks** (guess).
- Visiting any dojo during the event gives that event's banner. **No tasks, no counts, no daily logins.**
- **Catch-up:** a student who misses it gets the banner the next time they visit any Open House, and old banners also go into the next year's pool. Nothing is ever gone for good.
- Words are hopeful: "The dojos are open! Come see." Never "Only 2 days left!".

## Scope risks

1. **Art volume.** 30 pieces per tier × 9+ tiers is about 270 pieces. Colour variants keep it to about 10 new models per tier. The Tier 2 kit (lantern, bamboo pot, basin, `progress.md` line 325) is a start. Art Director should size this.
2. **Long belts** run out of new pieces. Use the lower rate (above), or accept slower "new" at high belts.
3. **Sets** need set rules and a bonus check; they could slip to post-launch without breaking anything else.
4. **Floors per tier** isn't fixed until milestone 10; I assumed 3 for the first-clear count.
5. **Elite rate change** from 0.5 (PR #54) to 0.25 needs the Manager's OK.
6. **Odds screen** is new UI and needs words reviewed for ages 6+.

## Done-when, by source

1. **Boss chest:** `dropChance.boss` is 0.10 in `content/dojo/decorations.json`; a test with a fixed seed shows about 1 in 10 boss chests over 10,000 opens (±1%).
2. **Treasure chest:** `dropChance.treasure` 0.20; same kind of test.
3. **Challenge chest:** 0.05, or 0.10 when cleared in time (new `inTimeDropChance` field); a test covers both.
4. **Elite:** elite decoration chance is 0.25 in `content/elites/elites.json`; it drops where the elite falls; test.
5. **First floor clear:** each floor names its piece in data; clearing a floor the first time always gives it, and never again; test.
6. **Bestiary:** each 5 new entries gives one trophy; a named monster's first defeat gives its trophy; test.
7. **Sets:** owning all pieces turns the bonus on and gives the plaque; removing a piece from the room never takes the plaque away.
8. **Challenge medal:** first all-in-time clear of a floor's challenge rooms gives the medal once; test.
9. **Open House:** visiting during the event gives the banner; a student who missed it gets it at the next event; test with fake dates.
10. **Real achievements:** promotion and stripe give a certified trophy with the date (milestone 12).
11. **Crafting:** not built at launch; no crafting button appears.
- **Bad-luck protection:** a test shows no more than 6 runs in a row without a new decoration while the pool has unowned pieces.
- **Loss:** a test loses a run after a decoration drops and checks it's saved.
- **Duplicates:** none while unowned pieces remain; at most 3 of a kind; after that, no message and normal gear.
- **Pacing:** the balance player (typical profile, 104 runs at Tier 1) gets a new piece on average every 2.5–3.5 runs, and the longest dry spell is ≤ 6.
- **Odds shown:** the Dojo screen lists each chest's chance in words a 6-year-old can read.
