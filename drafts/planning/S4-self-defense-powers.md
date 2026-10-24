# S4: Self-defense techniques as in-game powers

Work board S4: give each of #1–30 in `docs/self-defense.md` an in-game effect that matches what the real technique does, use its game category, follow the rules at the bottom of that file, make techniques in a category build on each other, and replace the placeholder powers.
Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only; no game code or work-board edits.

**Numbers marked (guess) are my own starting guesses** for the balance player to tune.

## Ground rules (from `docs/self-defense.md` and `docs/decisions.md`)

- **Outcomes, never injuries.** The game only shows these words: off-balance, trapped, thrown, pinned, disarmed, escaped (plus stunned). Enemies are shadow creatures. They fade or tumble; nothing is hurt or broken.
- **Callout uses the real number:** "Self-Defense #17!" with a kid-safe subtitle (below). No body-part words (no throat, eyes, groin, nose).
- **Real training is the main source of power.**
  - A seal unlocks **only** when Sensei signs off that technique in DojoForge. A catch-up item shows as a locked seal ("Sign off Self-Defense #4 to unlock") (`docs/framework.md` lines 77–78).
  - Upgrades come **only** from Training Points: 15 approved minutes = 1 point, 4 upgrades per ability (`decisions.md` line 228).
- **Defensive and hopeful.** Every seal powers up the **Counter, Block or Dash**: the player reacts to an attack and never starts the fight. Street Smarts still teaches getting away first.
- **Same category builds on itself.** A later technique in a category makes the earlier effect bigger or wider instead of adding something unrelated.

## Cost: Training Point upgrades (guess)

- 4 upgrades per seal, costing **1, 1, 2, 2 points**. That's 6 points (90 approved minutes) to max a seal.
- Each upgrade adds **+25% of the seal's base amount**, so a maxed seal is ×2.
- "Cost size" in the table: **S** means the effect is small, so upgrades follow the normal table. **M** means a strong effect, so each upgrade adds only +15% (guess).
- Spending points isn't built yet (points are counted only). This is a scope flag.

## The 30 seals

Effect types in `code` already exist in `packages/sim/src/effects.ts`. **New:** marks a new effect type (scope flag: Programmer work).

| # | Belt | Category | Seal name (subtitle) | In-game effect | Effect type | Cost | Builds on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | White | Avoid | Off the Line | A Perfect Counter adds 2 quick punches (each 30% of a Strike) | **New:** `counterHits` 2 × 0.3 | S | Starts Avoid |
| 2 | White | Avoid | Other Side | A Block instantly recharges Dash so you can step away | `dashOnBlock` (current #2, kept) | S | Avoid |
| 3 | White | Spin strike | Spin Back Fist | A Perfect Counter also hits enemies within 1.2 tiles (60%) | `rippleCounter` 0.6 / 1.2 (current "Sweep", renamed) | S | Starts Spin |
| 4 | White | Advancing combo | Drive Back | A Perfect Counter pushes the attacker back 1.5 tiles, off-balance | **New:** `counterPush` 1.5 | S | Starts Advancing |
| 5 | White | Spin strike | Spin Elbow | Spin Back Fist reaches +0.4 tiles and hits +20% harder | `rippleCounter` +0.2 / +0.4 | S | #3 |
| 6 | Yellow | Trap and combo | Arm Wrap | A Perfect Counter traps the attacker 10 ticks longer | `staggerTicks` 10 (current #1 effect, moved) | S | Starts Trap |
| 7 | Yellow | Trap | Palm Heel | Perfect Counter hits are 25% stronger | `counterStrength` 0.25 | M | #6 |
| 8 | Yellow | Block-and-strike | Block and Strike | Blocks bounce 20% of the hit back | `blockReflect` 0.2 (current #7 effect) | S | Starts Block-strike |
| 9 | Yellow | Block-and-strike | High Block Strike | Bounce back +15%, and a bounced hit makes the attacker off-balance | `blockReflect` +0.15, **new** flag `reflectStaggers` | S | #8 |
| 10 | Yellow | Grab and strike | Grab and Strike | Off-balance or trapped enemies take 15% more damage | `staggerBonus` 0.15 (current #10, kept) | S | Starts Grab |
| 11 | Orange | Takedown | Outside Reap (Osoto Gari) | A Perfect Counter on a brute or swarmer **throws** it: it tumbles 1 tile and is down for 30 ticks | **New:** `counterThrow` 30 | M | Starts Takedown |
| 12 | Orange | Takedown | Reap and Finish | Thrown enemies take 25% more damage while down | `counterThrow` + **new** `downBonus` 0.25 | S | #11 |
| 13 | Orange | Kick away the weapon | Kick the Weapon | After a Perfect Counter, that attacker is **disarmed**: next attack does half damage | `disarm` 0.5 (current #8, moved here) | S | Starts Kick-away |
| 14 | Orange | Kick away the weapon | Kick and Spin | Disarm lasts 2 attacks instead of 1 | `disarm` + **new** `disarmAttacks` 2 | S | #13 |
| 15 | Orange | Avoid | Slip and Double | Off the Line adds a 3rd punch, and the Counter window is 1 tick longer | `counterHits` +1, `counterWindow` 1 | S | #1, #2 |
| 16 | Green | Grab and strike | Low-High Strike | Strikes add a second hit (30%) | `strikeExtraHit` 0.3 | M | #10 |
| 17 | Green | Joint lock | Arm Bar | A Perfect Counter **locks** the attacker for 20 ticks; locked enemies can't block or shield | **New:** `counterLock` 20 (uses shield-break rules while locked) | M | Starts Lock |
| 18 | Green | Avoid the weapon | Slide Away | Dashing through a padded-staff attack gives +10 Focus | **New:** `dashDodgeFocus` 10 | S | Avoid (#1, #2, #15) |
| 19 | Green | Weapon control | Wrist Lock | Disarm on a padded-staff enemy is full for 1 attack (no damage) | `disarm` 1.0 vs weapon enemies | M | #13, #14, #17 |
| 20 | Green | Grab and combo | Hold and Combo | Every 4 combo hits gives a short speed burst | `comboSpeed` 4 hits / +20% / 40 ticks | S | #10, #16 |
| 21 | Blue | Weapon control | X-Block Lock | Perfect Counters are +20% stronger against disarmed enemies | `counterStrength` +0.2 (disarmed only, **new** condition) | S | #19 |
| 22 | Blue | Weapon control and pin | Lock and Pin | A disarmed enemy that is thrown or locked is **pinned** 15 ticks longer | `counterThrow` / `counterLock` +15 | S | #11, #17, #19 |
| 23 | Blue | Redirect the weapon | Turn It Back | Blocking a padded-staff attack bounces 50% of it back | `blockReflect` 0.5 vs weapon enemies (**new** condition) | M | #8, #9 |
| 24 | Blue | Kick away the weapon | Wrist Kick | A Strike (not only a Counter) can disarm | `disarm` + **new** `disarmOnStrike` | M | #13, #14 |
| 25 | Blue | Escape | Escape from Behind | You can Perfect Counter an attack from behind, and you turn to face it | **New:** `rearCounter` | M | Starts Escape |
| 26 | Red | Control hold | Shoulder Control | While an enemy is locked, your Blocks take 15% less damage | `blockCut` 0.15 (while locking, **new** condition) | S | #17 |
| 27 | Red | Takedown | Sweep | Throws now work on shields and Guarding elites too | `counterThrow` + **new** `throwAll` | M | #11, #12 |
| 28 | Red | Weapon control | Four-Corner Lock | Locks last +10 ticks, and disarms work on heavy overhead attacks | `counterLock` +10, `disarm` heavy | S | #17, #19, #21 |
| 29 | Red | Choke escape | Break Free | When 2+ enemies are within 1 tile, a Block pushes them all back 1.5 tiles | **New:** `breakFree` 1.5 | M | #25 |
| 30 | Red | Choke escape | Break Free and Go | Break Free also makes them off-balance and refills Dash | `breakFree` + stagger + `dashOnBlock` | S | #29, #2 |

## Seals #31–40 (S4b, from Jay's answers on 2026-10-24)

Jay's results: #31–33 joint control/break; #34 joint control/break and takedown; #35 wrist control/break ("party flex", #33, is a type of wrist lock); #36, #37 and #39 joint manipulation/break; #38 joint manipulation/break into takedown; #40 joint manipulation/break and takedown.

**Kid-safe rule for "break":** in the game, "break" only ever means **control and escape** (Break Free style). The enemy is let go, pushed away or off-balance, and you get space. Nothing is hurt or broken, and the word "break" never shows on screen except in "Break Free".

All 10 build on the Joint lock line (#17 Arm Bar `counterLock` 20, #26, #28) and the Takedown line (#11, #12, #27), plus Break Free (#29–30).

**One new idea, "Release":** when a lock ends, something good happens for the player (a push, a throw, space). It's a new effect type, `lockRelease`, and it's the kid-safe stand-in for "break".

| # | Belt | Category | Seal name (subtitle) | In-game effect | Effect type | Cost | Builds on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | Red/Black | Joint control | Arm Bar Release | Locks last +10 ticks. When a lock ends, the enemy is pushed back 1 tile and off-balance | `counterLock` +10, **new** `lockRelease` push 1.0 | S | #17, #28 |
| 32 | Red/Black | Joint control | Slide to the Wrist | Locked enemies take 15% more damage | `staggerBonus` 0.15 (while locked, **new** condition) | S | #31, #19 |
| 33 | Red/Black | Joint control (wrist lock) | Party Flex | Each lock you set gives +5 Focus | **new** `lockFocus` 5 | S | #32 |
| 34 | Red/Black | Joint control and takedown | Lock and Slam | When a lock ends, the enemy is **thrown** instead (down 30 ticks) | `lockRelease` → `counterThrow` 30 | M | #33, #11, #27 |
| 35 | Red/Black | Wrist control | Catch the Hand | A **Block** (not only a Perfect Counter) locks a quick attacker (wind-up 12 ticks or less) for 10 ticks | **new** `blockLock` 10 (quick attacks only) | M | #17, #31 |
| 36 | Brown | Joint control | Wide Release | Release pushes +0.5 tiles further, and the pushed enemy knocks back anyone it bumps | `lockRelease` +0.5, **new** flag `releaseBumps` | S | #31 |
| 37 | Brown | Joint control | Steady Hold | While you hold a lock, the Counter window is 1 tick longer | `counterWindow` 1 (while locking, condition from #26) | S | #26 |
| 38 | Brown | Joint control and takedown | Lock to Takedown | A thrown enemy stays down +15 ticks. Lock and Slam works on shields and Guarding elites | `counterThrow` +15, `throwAll` on lock throws | S | #34, #27, #22 |
| 39 | Brown | Joint control | Release and Go | Release also makes every enemy within 1.5 tiles off-balance, and refills Dash | `lockRelease` + `breakFree` 1.5 + `dashOnBlock` | M | #36, #29, #30 |
| 40 | Brown | Joint control and takedown | Master Hold | Locks last +10 ticks, and enemies thrown from a lock take 25% more damage while down | `counterLock` +10, `downBonus` +0.25 on lock throws | S | #34, #38, #12 |

These seals cost Training Points the same way as #1–30 (1, 1, 2, 2; S +25%, M +15%). Each unlocks only when Sensei signs off that technique.

**Callout subtitles** must be kid-safe. All 10 names above avoid body-part and injury words; "Party Flex" is the school's own term.

**Cap:** Jay (2026-10-24) says the student curriculum before black belt stops at kata **Possi**, self-defense **#40** and kick combo **7**. Black-belt degree techniques (#41+) and kick combos 8–12 stay empty slots, **not in launch scope**.

### Placeholder powers that go away

The current 10 seals in `content/abilities/abilities.json` are replaced as listed above. Two effects no longer have a seal:

- **Steady Breath** (`healOnPerfect`)
- **Strong Block** (`blockCut` 0.1; it comes back at #26 under a condition)

I suggest moving them to Virtues or Forms (decision for Jay). Saves keep working because seals are unlocked by technique number, not by id.

### New effect types needed (scope)

`counterHits`, `counterPush`, `reflectStaggers`, (#31–40:) `lockRelease` / `releaseBumps` / `lockFocus` / `blockLock`, `counterThrow` / `downBonus` / `throwAll`, `disarmAttacks` / `disarmOnStrike`, `counterLock`, `dashDodgeFocus`, `rearCounter`, `breakFree`, plus conditions (vs weapon enemies, vs disarmed, while locking).

- That's about 10 new types. The biggest are **throw**, **lock** and **rear counter**, because each needs new enemy states and art (tumble, held, turn).
- A **weapon enemy** carries a **padded staff**: a kid-safe padded foam training weapon, nothing sharp or realistic (art: PR #95; numbers: `drafts/planning/A5-padded-staff-enemy.md`). #13–14, #18–19, #21–24 and #28 face it. The Artist and Jay confirm the look. Until it exists, those seals work against every enemy's attack (safe fallback).

## Kick combos and katas

- **Kick combos (after J2):** each belt's kick combo already unlocks the next Strike. The two current Strikes stay until J2 says what each real combo does. Rule: a combo's Strike should copy the real kick order (for example, front-then-round gives a two-hit Strike). Template below.
- **Katas (after S3):** each kata unlocks the next Form (`forms`). Only 3 Forms exist. Rule: a kata's Form should reflect its real feel (rooted, flowing, and so on). Template below.
- **Note for S3 Forms:** the forms list **ends at Possi**, the highest kata before black belt (Jay, 2026-10-24). The kata details are still coming from Jay, so don't design Forms past Possi or guess any kata's feel.
- **Kick combos:** 1–7 are covered in `S4-kick-combos.md`. Combos 8–12 are empty slots for later belts, **not in launch scope**.

| Real item | Belt | What it really does (Jay / J2 / S3) | Game Strike or Form | Effect | Cost | Done-when |
| --- | --- | --- | --- | --- | --- | --- |
| Kick combo 1 | White | (to come) | | | | |
| Kata 1 | White | (to come) | | | | |

## Milestone 4 open questions: recommendations

1. **Powers:** use the 30 seals above, 5 per belt in technique order, with category build-ups.
2. **Numbers:** keep each seal small (+10–25%). Upgrades: 4 at 1/1/2/2 Training Points (+25% each, +15% for M seals). Retune after the balance player runs a 30-seal profile.
3. **Training Points share** of Power Rating stays 0.17 (`POWER.shares`). Spending should be built at the same time as the seals.
4. **Black belt degrees:** each degree's techniques (#31+) get a seal on the same rules. Degrees add +500 Power max (already in `POWER.perDegree`). Nothing new is needed until Jay supplies those techniques.

## What Jay must supply

1. ~~Results for #31–35 and "party flex"~~: answered 2026-10-24 (party flex = a type of wrist lock).
2. #36–40: results answered 2026-10-24. The attack and the steps for each are still to come (callout art only; the seals don't depend on them).
3. ~~The attack for #3, #4, #5 and #15~~: answered 2026-10-24. #3 and #5: hook punch. #4: a straight reach (shown in the game as a **"grab reach"**: an open hand reaching to grab, never aimed at the neck). #15: straight jab. The seals don't change; the callout art and enemy pose should match.
4. Kick combo and kata descriptions (J2, S3).
5. Approval of the kid-safe subtitles, especially #29–30 ("Break Free" instead of choke words).
6. How weapon enemies look: answered, a padded staff (PR #95, with the Artist).

## Scope flags

- About 10 new effect types and 3 new enemy states (thrown, locked, pinned).
- A weapon enemy for 8 seals.
- Training Point spending UI.
- Callout art for 30 seals (one icon each).
- #31–40 add 4 new effect types or flags, plus conditions on existing ones (while locked, quick attacks only, lock throws).
- Kick combos 8–12 and #41+ are empty slots, not in launch scope.

## Done-when

- **Each seal #1–40:** sign-off of that real technique (fake profile) unlocks exactly that seal with the "Self-Defense #N!" callout and its subtitle. A sim test shows the effect in the table (for example, #11: a Perfect Counter on a brute leaves it down for 30 ticks). With the seal off, the test fails.
- **Builds on:** for each category, a test with both seals shows the later one changing the earlier effect (for example, #13 + #14 gives a disarm lasting 2 attacks).
- **Catch-up:** an unsigned technique shows a locked seal with "Sign off Self-Defense #N to unlock"; signing it unlocks it on next open.
- **Upgrades:** spending 1, 1, 2, 2 Training Points raises a seal's amount by 25% each time (15% for M seals); you can't spend points you don't have; nothing is bought.
- **Safety:** a word check finds no injury or body-part words in seal names, text or callouts. Enemies only show the outcome states.
- **Old saves:** a profile with old seals loads and shows the new seals for the same technique numbers.
- **Balance:** the balance player with all 40 seals at 4th-belt-plus floors stays within the S1 clear-rate bands (typical ≥ 90%).
- **Padded staff wording:** a word check finds no "blade", "sword" or "knife" in this spec, the seal text or the callouts. Every weapon enemy is called a "padded staff" (kid-safe padded training weapon).
- **Weapon seals:** #13–14, #18–19, #21–24 and #28 have a sim test against the padded-staff enemy (`weapon: "padded-staff"`). The vs-weapon conditions (#19, #23) do nothing against enemies without a weapon. Until the enemy ships, the fallback rule above applies.
- **Disarmed look:** a disarmed padded-staff enemy draws without its weapon layer, and the staff comes back when the disarm ends (client test).
- **#31–40 Release:** a sim test shows a lock ending pushes the enemy 1 tile and off-balance (#31). With #34, it throws instead (down 30 ticks). With #39, every enemy within 1.5 tiles is off-balance and Dash refills.
- **#35 Catch the Hand:** a Block locks a Swarmer (wind-up 12) but never a Brute (16) (test).
- **"Break" wording:** a word check finds "break" only in "Break Free". No #31–40 name, text or callout implies injury. #4's attack is shown as a "grab reach" with no neck or throat words.
- **Builds on (31–40):** for each new seal, a test with its "Builds on" seal shows the combined effect (for example, #36 + #31 gives a 1.5-tile push).
- **Cap:** no seal, Strike or Form exists past #40, kick combo 7 or Possi in launch content. Slots 8–12 and #41+ load as empty without errors.

## Programmer note (guard-break on Strikes, Strike #7)

- **Strikes already break shields** without `shieldBreaker`: `packages/sim/src/world.ts` line 744 only bounces `basic` and `ripple` hits, so a Strike or Perfect Counter always breaks the shield. Strike #7 doesn't need `shieldBreaker` for shields.
- What #7 still needs is to **hit through the Guarding elite damage cut**. That cut is applied to every player hit in `hurtEnemy` (`world.ts` line 776, `guarding.damageScale`). Letting Strike #7 ignore it needs a new Strike check there (for example, skip the cut when `move === 'strike'` and the #7 flag is on). This is a small code change and needs a test.
