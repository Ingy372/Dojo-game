# L3-S: Five chapters per tier, opened by Gate lights

**Board item:** L3-S (launch plan row L3, `R-OVERHAUL-LAUNCH.md`). **Done when (launch plan):** passing a Gate requirement opens a new chapter in that tier.
**Source:** `docs/reviews/fable-progression-overhaul.md` sections 5.7 and 5.9. **Waits on:** L11 (merged as #528) for the tier 4–10 room tags.
**No new art, no new enemies, no combat numbers.** Chapters only decide which existing rooms and twists a run can use.

## 1. The rule

- A **Gate light** comes from a real sign-off or from each fifth of the belt's classes, whichever comes first (review 5.7):
  `lights = min(4, max(gate.lit, floor(5 × classesInRank ÷ classesBeforeTest)))`
- **Chapter = 1 + lights.** Chapter 1 opens with the belt. Chapter 5 is the last.
- Uses only what the Gate already has (`GateState` in `packages/sim/src/training.ts`): `lit` (catch-up and counted items never light a lock), `classesInRank`, `classesBeforeTest`. If `classesBeforeTest` is 0 or missing, classes give no lights.
- **Chapters never close.** The save keeps the highest chapter seen for the current tier, so a feed correction never takes a room away.
- A promotion starts the new tier at chapter 1 (the new belt's locks and classes start at 0). Runs always use the student's own tier, so older tiers don't matter.
- A student who installs mid-belt opens several chapters at once and sees one card for all of them.

## 2. What each chapter opens

Every chapter opens something you can see in the Tower. The Guardian room, treasure and rest rooms are open from chapter 1, so every run still has a full floor and a Guardian.

| Chapter | Opens |
|---|---|
| 1 | The tier's easiest battle rooms (lowest `earliestRoom`), treasure, rest, the Guardian |
| 2 | One or more new battle rooms + the Bell Room twist |
| 3 | Lantern Dark twist (+ new battle rooms where the tier has many) |
| 4 | Challenge rooms (Challenge doors start showing) + the Slippery Floor twist |
| 5 | The tier's hardest battle room(s) |

Built on two data fields, both default 1 (open from the start):
- `chapter` on each room file.
- `chapter` on each twist in `content/twists/twists.json` (Bell Room 2, Lantern Dark 3, Slippery Floor 4).

How rooms are tagged: sort the tier's battle rooms by `earliestRoom` (file order breaks ties). With 4 battle rooms: first two are chapter 1, the third chapter 2, the fourth chapter 5. With more (tiers 1 and 2): first four chapter 1, the last two chapter 5, the rest split between 2 and 3. Challenge rooms are chapter 4. Generated from today's room files by `L3-sim/chapters.py`:

| Tier | Chapter 1 | Chapter 2 | Chapter 3 | Chapter 4 | Chapter 5 | Ch1 has a room-1 battle |
|---|---|---|---|---|---|---|
| 1 | `w-bamboo-hall`, `w-brute-and-swarm`, `w-lantern-room`, `w-narrow-bridge` + treasure, rest, Guardian | `w-pillar-court`, `w-training-yard`, Bell Room twist | `w-stone-garden`, `w-guarded-swarm`, Lantern Dark twist | `w-gauntlet`, `w-shield-wall`, Slippery Floor twist | `w-shield-escort`, `w-twin-shields` | yes |
| 2 | `bamboo-hall`, `bopper-yard`, `brute-and-swarm`, `lantern-room` + treasure, rest, Guardian | `narrow-bridge`, `pillar-court`, `training-yard`, Bell Room twist | `stone-garden`, `guarded-swarm`, `staff-and-shield`, Lantern Dark twist | `gauntlet`, `shield-wall`, Slippery Floor twist | `shield-escort`, `twin-shields` | yes |
| 3 | `ember-pantry`, `oven-row` + treasure, rest, Guardian | `long-table-hall`, Bell Room twist | Lantern Dark twist | `supper-rush`, Slippery Floor twist | `pin-lanes` | yes |

Tiers 4–10 (L11 rooms, from the L11-SPEC starting list; copies keep their original's `earliestRoom`). Until a tier's L11 rooms land it uses the shared set, which carries the tier 2 tags.

| Tier | Chapter 1 | Chapter 2 | Chapter 5 | Chapter 4 |
|---|---|---|---|---|
| 4 | pillar-court, bopper-yard copies | oven-row copy | staff-and-shield copy | shield-wall copy |
| 5 | bopper-yard, lantern-room copies | long-table-hall copy | pin-lanes copy | supper-rush copy |
| 6 | brute-and-swarm, training-yard copies | bamboo-hall copy | ember-pantry copy | gauntlet copy |
| 7 | narrow-bridge, guarded-swarm copies | pin-lanes copy | twin-shields copy | shield-wall copy |
| 8 | narrow-bridge, oven-row copies | staff-and-shield copy | long-table-hall copy | gauntlet copy |
| 9 | bopper-yard, pillar-court copies | training-yard copy | pin-lanes copy | supper-rush copy |
| 10 | brute-and-swarm, ember-pantry copies | long-table-hall copy | twin-shields copy | gauntlet copy |

Chapter 3 on tiers 3–10 is the Lantern Dark twist only. The Content Designer owns the tags and may swap rooms, as long as chapter 1 always has a battle room with `earliestRoom` 1 and every chapter opens something.

**Known trade-off:** in chapter 1 a tier with only two open battle rooms repeats rooms in one floor (the built picker already falls back to repeats). Short belts reach chapter 2 within about 2.5 weeks of classes, sooner with a sign-off.

## 3. Code changes (small)

- `RunOptions.chapter` (1–5, **default 5** so tests and test links see everything, as today).
- `floorRooms` / `pickRoom`: drop rooms whose `chapter` is above the run's chapter.
- `pickTwist`: drop twists whose `chapter` is above the run's chapter.
- `offerDoors`: no Challenge door when the tier has no open challenge room (today the built fallback turns it into a fight behind a Challenge door, which would look wrong).
- `chapterOf(gate)` in the sim, next to `GateState`, with the rule in section 1.
- Client: save `chapters[tier]` (highest seen), pass it to `startRun`, and a `?chapter=N` test link.

## 4. What the student sees (kid lines, 8 words or fewer)

- Path / Gate screen: "Chapter 2 of 5".
- Under it: "Next chapter: a sign-off or 5 classes" (the class number is the classes left to the next fifth).
- At chapter 5: "Every chapter is open!" There's still the Guardian, Sensei's Seal, evolutions and the Class Chest to earn (review 5.7, "always something to earn after it").
- The chapter card at home after a sync: "Chapter 3 is open!" then one line per new thing, e.g. "New room: Pin Lanes" or "New twist: Lantern Dark". Several chapters at once show on one card.
- Hopeful only. No "locked" wording; doors that aren't open yet just don't show.

## 5. Balance check (every belt, classes only)

Run with the balance-check skill on the real school data (`fixtures/1-white-belt-new.json` belts; 2 classes a week from `decisions.md`, Jay 2026-10-07). Targets from the review: something opens at least every 3–4 weeks (5.9), and the last chapter at about 75% of the rank (5.7). I used a 70–85% band for "about 75%". Sign-offs only make lights come sooner, so these are the slowest case.

| Tier | Belt | Classes before test | Classes per light (classes only) | Weeks per light | Chapter 5 opens at (classes only) | Target | Pass |
|---|---|---|---|---|---|---|---|
| 1 | White Belt | 24 | 5, 10, 15, 20 | 2.5 | 83% | gap 4 weeks or less; ch5 70-85% | pass |
| 2 | Yellow Belt | 24 | 5, 10, 15, 20 | 2.5 | 83% | gap 4 weeks or less; ch5 70-85% | pass |
| 3 | Orange Belt | 24 | 5, 10, 15, 20 | 2.5 | 83% | gap 4 weeks or less; ch5 70-85% | pass |
| 4 | Green Belt | 24 | 5, 10, 15, 20 | 2.5 | 83% | gap 4 weeks or less; ch5 70-85% | pass |
| 5 | Blue Belt | 24 | 5, 10, 15, 20 | 2.5 | 83% | gap 4 weeks or less; ch5 70-85% | pass |
| 6 | Red Belt | 50 | 10, 20, 30, 40 | 5 | 80% | gap 4 weeks or less; ch5 70-85% | FAIL gap |
| 7 | Red/Black Belt | 50 | 10, 20, 30, 40 | 5 | 80% | gap 4 weeks or less; ch5 70-85% | FAIL gap |
| 8 | Brown Belt | 76 | 16, 31, 46, 61 | 8 | 80% | gap 4 weeks or less; ch5 70-85% | FAIL gap |
| 9 | Brown/Black Belt | 102 | 21, 41, 62, 82 | 10.5 | 80% | gap 4 weeks or less; ch5 70-85% | FAIL gap |
| 10 | Black Belt | 102 | 21, 41, 62, 82 | 10.5 | 80% | gap 4 weeks or less; ch5 70-85% | FAIL gap |

**Result: belts 1–5 pass. Belts 6–10 fail the 4-week gap from classes alone** (5 weeks at Red and Red/Black, 8 at Brown, 10.5 at Brown/Black and Black). The review already says this for Red ("about every five weeks from classes alone, sooner with sign-offs").

I also checked a flat "a light every 8 classes" rule. It fixes the gap but fails the 75% target on every belt (chapter 5 never opens from classes on 3-month belts, and opens at 31–64% on long belts):

| Tier | Belt | Classes before test | Lights at (every 8 classes) | Weeks per light | Chapter 5 opens at | Pass (ch5 70-85%) |
|---|---|---|---|---|---|---|
| 1 | White Belt | 24 | 8, 16, 24 | 4 | never from classes | FAIL |
| 2 | Yellow Belt | 24 | 8, 16, 24 | 4 | never from classes | FAIL |
| 3 | Orange Belt | 24 | 8, 16, 24 | 4 | never from classes | FAIL |
| 4 | Green Belt | 24 | 8, 16, 24 | 4 | never from classes | FAIL |
| 5 | Blue Belt | 24 | 8, 16, 24 | 4 | never from classes | FAIL |
| 6 | Red Belt | 50 | 8, 16, 24, 32 | 4 | 64% | FAIL |
| 7 | Red/Black Belt | 50 | 8, 16, 24, 32 | 4 | 64% | FAIL |
| 8 | Brown Belt | 76 | 8, 16, 24, 32 | 4 | 42% | FAIL |
| 9 | Brown/Black Belt | 102 | 8, 16, 24, 32 | 4 | 31% | FAIL |
| 10 | Black Belt | 102 | 8, 16, 24, 32 | 4 | 31% | FAIL |

No five-chapter class rule passes both targets on belts 6–10, so this is a decision (DECIDE 2), not a number I'm proposing as passing. Section 5.7 expects the gaps to be filled by Class Chests, Stars, Sensei's Trials, the weekly remix, Street Smarts and the dojo, plus Review Trials (L9) on the long belts.

No R-BAL-12 run is needed: no enemy Health, Power or Guard changes. Chapter 1 pools are the rooms the built floor already allows earliest. L3-Q1 still runs the floor win-rate check at chapter 1 and chapter 5 on every tier and difficulty.

## 6. Not in L3

- **Locking the Guardian until Sensei's Seal or every lock is lit** (review 5.7, bullet 2). Today every run ends at the Guardian. Locking it needs a different last room for every run before the Seal, so it's a new system and a taste call (DECIDE 1). This spec keeps the Guardian open in every chapter.
- More than five chapters on long belts, or new rooms for chapter 3 on tiers 3–10. Proposal only, not launch scope.

## 7. Work items

| ID | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| L3-C1 | Content Designer | `chapter` tags on room files (section 2 tables) and twists; the kid lines in section 4 | Every tier 1–3 room and every twist has its tag; chapter 1 on every tier has a battle room with `earliestRoom` 1; every chapter 2–5 opens at least one room or twist per tier; lines are 8 words or fewer | none |
| L3-C2 | Content Designer | Same tags on the tier 4–10 L11 rooms | Same checks on tiers 4–10 | L11-C1 |
| L3-B1 | Programmer | Sim: `chapterOf`, `RunOptions.chapter` (default 5), room and twist filters, no Challenge door without an open challenge room, data test for the C1 checks | Unit tests: lights come from sign-offs or class fifths, whichever is more, capped at 4; a chapter-1 run never shows a chapter-2+ room or twist; default runs are unchanged; the data test passes | L3-C1 |
| L3-B2 | Programmer | Client: save the highest chapter per tier, pass it to runs, chapter card, Path lines, `?chapter=N` | Signing off a requirement in a test profile opens the next chapter that night and shows the card; a feed correction never lowers the chapter; promotion starts chapter 1 | L3-B1 |
| L3-Q1 | Tester | Check B1 and B2, and the floor win-rate check at chapters 1 and 5 on every tier and difficulty | The launch plan Done-when passes on a test profile; no tier/difficulty win rate moves outside its current gate | L3-B2 |

## 8. Decisions needed

1. **Guardian lock (Jay, taste and new system):** A. Keep the Guardian open every run (this spec, recommended for launch). B. Lock it until the Seal or every lock, which needs a different last room.
2. **Long-belt gaps (Manager or Jay):** A. Accept classes-every-fifth (recommended: matches the review, keeps 75%; gaps on belts 6–10 are filled by sign-offs and the other between-light items). B. Ask for more chapters on long belts after launch (proposal only).
