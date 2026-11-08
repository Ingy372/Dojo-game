# R-G2B: Strikes #1-7 under the Power & Progression Redesign

Written Nov 1, 2026 by the Researcher & Planner. Docs only, no game code. Source of truth: `power-and-progression-redesign.md` (Jay's answers inline). Older drafts: `S4-kick-combos.md`.

**In plain words.** Jay's redesign changed what a Strike is. You now bring **one** Strike into the tower, and every Strike costs 30 Focus and has the same strength budget as Spin Kick. They differ in **shape**, not power. That makes the old S4 effect list (extra hit, ripple, "break guards") out of date. This note rewrites Strikes #4-7 the new way, and tells you what the engine can already do.

## What the redesign settles (assumption marks removed)

| Old S4 / batch-1 mark | Settled by | Now |
|---|---|---|
| "Strikes stack as unlocks" | Redesign: Strike slot, 1 equipped | One Strike at a time. |
| "Butterfly Flow = Strikes cost 8 less Focus" | Redesign: Strike shapes | Butterfly Flow is a shape: spins the opposite way, hits harder, slower to land. All Strikes cost 30. |
| "Jumping Spins = `strikeRipple` 40% nearby" (R-G2B-01) | Redesign: three spins that build momentum | Three spins, each stronger than the last. See below. |
| "Strike #7 needs a Strike-only guard break" | Redesign: #7 is the Spinning Finisher | No guard break on #7. The "goes around guards" idea moved to #5 Hook Kick. See taste calls. |
| "Strike amounts are guesses" | Rule 5: the test bot sets the numbers | Still true. No Strike number in this note is final. |

## The seven Strikes (redesign shapes)

| # | Belt | Strike (shape) | Real combo ends with (`S4-kick-combos.md`, Jay's words) | Needs in the engine |
|---|---|---|---|---|
| 1 | White | **Spin Kick**: one heavy hit, long reach | spinning outside kick | Built (strength 2.5, reach 1.4, lunge 0.7). The baseline. |
| 2 | Yellow | **Jumping Spins**: three spins, each stronger (example ramp 5, 7, 12) | 3 jumping spin kicks | A Strike with a list of hits and a strength for each. See "gap 1". |
| 3 | Orange | **Butterfly Flow**: spins the other way, hits a good bit harder, slower to land | round kick and butterfly kick | A wind-up on a Strike. See "gap 2". |
| 4 | Green | **Side Kick Drive**: steps forward and pushes the enemy back | spin kicks, left and right | A push on a Strike. See "gap 3". |
| 5 | Blue | **Hook Kick** (Jay, Nov 8, J20: the combo's name, not a shape name. The old game name Low-High Kicks is retired) | front kick left, right, left (after step-behind hook kicks). The curriculum steps are unchanged. | J19: it reaches around the guard and is a guard break. No new number. |
| 6 | Red | **Lunge**: closes distance fast, then strikes | stepping back twice, lunging in with a jumping front kick | A longer lunge (a setting that exists). |
| 7 | Red/Black | **Spinning Finisher**: multi-hit spin around you | spinning hook kick | Hits all enemies in a ring. See "gap 5". |
| 8-12 | Black | Not defined | Jay's black belt combos | Waits on Jay. |

Names: the table still shows the redesign's words, except combo #5. Jay (Nov 8, J20) named that combo **Hook Kick**, not "Low-High Kicks", and said it has no shape name. Kids see Hook Kick. There is not a second "in the dojo" name. The Oct 24 S4 names were Spin Kick Finish, Jumping Spins, Butterfly Flow, **Both Sides**, **Low-High Kicks** (retired), **Block, Punch, Lunge**, **Axe and Hook**. The other names were not renamed. See taste call 2.

## What the engine already has (checked in `packages/sim/src/config.ts` and `world.ts` `tryStrike`)

Strike today: Focus cost 30, strength 2.5, reach 1.4 tiles, lunge up to 0.7 tiles, recovery 8 ticks. It hits **one** target, then an optional second "chain" hit (`strikeExtraHit`, a seal-style modifier).

The redesign says combos 3-7 need "no new effect types", built from reach, hits, area and movement. That is **mostly true, with five small gaps**. All five are one change: give each Strike its own shape settings instead of one shared set.

| Gap | What is missing | Needed by |
|---|---|---|
| 1 | A list of hits with their own strengths. Today there is one hit plus an optional chain hit at a fraction. | #2 (three spins), #7 (multi-hit) |
| 2 | A wind-up before the hit lands. Strikes land instantly today. Wind-up ticks for Strikes are not the enemy rule (that is for enemies). | #3 (slower to land) |
| 3 | A push (knock-back) on a Strike. A push exists only for Perfect Counters (`counterPush` was a new S4 effect, not built). | #4 |
| 4 | Targeting that can pick "the enemy behind". Today `nearestEnemy` picks the closest. | #5 |
| 5 | An area hit around the player. Only Perfect Counters have a ring (`rippleCounter`). | #7 (and #2 if ripple is wanted) |

So **Gaps 1 and 2 are needed in the beta** (Jumping Spins and Butterfly Flow). The beta item R-G2B-01 said "from existing settings"; that is true for reach and lunge only. This is the new item R-G2B-13.

## Rules that stay true for every Strike

- All cost 30 Focus. Strike cost never goes below 10 for any modifier (kept from S4).
- Strikes and Perfect Counters already break shields (`landHit`). Basic attacks bounce. Do **not** reuse the global `shieldBreaker` switch for a Strike: it also lets basic hits through shields and changes how block-reflect works (`world.ts` around line 1359).
- The elite Guarding aura cuts hits by a third (`damageScale 0.67`) on the two enemies it protects. Hook Kick is the exception: J19 says it is a guard break, so that existing cut does not apply to this Strike. The 0.67 stays for every other hit. No new number.
- Callout and unlock words follow `docs/self-defense.md` and Jay's real combo words, shown under "In the dojo:" on the info page.

## Balance: what the test bot must hold (no numbers invented)

The redesign gives the rules. Nothing here sets a Strike number.

| Rule | Source | What it means for each Strike |
|---|---|---|
| Baseline = Spin Kick | Redesign, power budget | Every other Strike's total damage when **all hits land** is within 15% PE of Spin Kick's. |
| Jumping Spins | Redesign | First spin is lighter than Spin Kick's hit. All three landed beat Spin Kick in total. |
| Butterfly Flow | Redesign | Above 2.5 strength, with a longer wind-up. |
| Spread | Test 2 | Win rate with each Strike within 5 points of the Strike average. |
| Newest move | Test 3 | On its own belt's rooms, the newest Strike ranks in the bot's top 2. |

The "example ramp 5, 7, 12" in the redesign cannot be strengths: Spin Kick is 2.5 and the ramp adds to 24. It reads as a ratio of how the spins grow (about 1 : 1.4 : 2.4). **Question for the bot run, not Jay:** what unit is the ramp in. The numbers come from the bot.

The balance table for the **enemies** each Strike faces is in `R-G2B-balance-check.md`. It shows how many Spin Kicks (strength 2.5) a typical student needs per enemy class at each belt, so the bot has a baseline.

## Which rooms could show off each new Strike (planner's proposal; enemies are from `bestiary-plan.json`)

| Strike | Belt | Enemies that make it the easy answer | Where |
|---|---|---|---|
| #4 Side Kick Drive | Green | Pebble Pal swarms (push a group), Cliff Goat charge | rooms 2-4 |
| #5 Hook Kick | Blue | Side Crab (guard) and any shield enemy | rooms 3-5 |
| #6 Lunge | Red | Bellows Puff (pusher keeps distance), Forge Sweep (dash-only) | rooms 3-5 |
| #7 Spinning Finisher | Red/Black | Masklet crowds, Echo Crowd phase of the Echo Mask | rooms 1-2, 5, boss |

## Taste calls for Jay (both are plain words)

1. **What does Hook Kick do to a guard?** **Answered (J19).** It reaches around the guard and it is a guard break. The kick gets to the hit instead of being stopped by the guard, and the Guarding aura's existing one-third cut (`damageScale 0.67`) does not apply to this Strike. The cut stays 0.67 for every other hit. No new number. This is not still open. Strike #7 is not the guard break.
2. **Which names do kids see?** **Answered for #5 (Jay, Nov 8, J20).** The Blue combo is **Hook Kick**, not a shape name, and not Low-High Kicks. Other real names are the Content Designer's list in `drafts/content/abilities/J27-audit.md`. This note does not repeat that list.

## Board items from this note (full rows in `R-GREEN-TO-BLACK.md`)

R-G2B-13 (Strike shape settings, beta), R-G2B-14 (bot run for Strikes 1-3, beta), R-G2B-15 (build Strikes #4-7; #5 is Hook Kick, and J19 says it reaches around the guard and is a guard break), R-G2B-16 (names and unlock text; #5 is Hook Kick), R-G2B-17 (bot run for Strikes #4-7).

Real technique names are the Content Designer's list in `drafts/content/abilities/J27-audit.md`. This note does not keep its own name list.
