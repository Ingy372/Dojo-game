# R-G2B: tower tiers 4 to 10 (Green to Black)

Written Nov 1, 2026 by the Researcher & Planner. Docs only, no game code. Plain words for Jay first, then the tables.

**Sources:** `drafts/content/enemies/bestiary-plan.json` (enemies and Guardians), `drafts/content/rooms/ember-kitchens-brief.md` (the room pattern), `content/elites/elites.json` (live elite rules), `power-and-progression-redesign.md` (Jay's "floors that need the new move"), `R-G2B-balance-check.md` (numbers) and the incoming-art READMEs (art). Nothing here is a number I made up. Where a number is missing, it says who sets it.

## In plain words

- Every tier from Green to Black gets the same floor shape as the Ember Kitchens: **8 rooms** (7 chosen through doors, then the Guardian). This is not "5 floors plus a Guardian" as R-G2B-07 says. The Ember brief says "8 to match a floor". Rooms 1-2 use the first group of enemies (F1-2), rooms 3-4 add the second group (F3-4), room 5 is the challenge room, then a treasure room, a rest room, and the Guardian. See "Batch 1 correction" at the bottom.
- Each tier has 4 enemies and 1 Guardian, all already written in the bestiary plan. **No enemy in Green to Black is built or has final art.** Only Pebble Pal has working art (waiting on Jay).
- Jay's redesign says each belt's floors should bring an enemy the **newest move** answers best. For Green to Brown I have named a room for each. For **Brown/Black and Black there is no new Seal or Strike in the plan** (Seals stop at #40 Brown, Black Strikes #8-12 are undefined). Those two tiers have nothing new to show off until Jay describes more. See "Gaps".
- The numbers all passed the balance check except 25 cells, and there is a one-number fix (see `R-G2B-balance-check.md`).

## The room pattern (copied from the Ember Kitchens)

| Room | Kind | Enemies | Rule it follows |
|---|---|---|---|
| 1 | battle | F1-2 enemies only | Gentle start. No elites (live rule: earliest room 3). |
| 2 | battle | F1-2 enemies, with 2 or 3 of one kind | |
| 3 | battle | one F3-4 enemy plus F1-2 enemies | Elites may start here. |
| 4 | battle | both F3-4 enemies, plus F1-2 helpers | |
| 5 | challenge | 3 waves with all four enemies | |
| 6 | treasure | none | |
| 7 | rest | none | |
| 8 | Guardian | the tier's Guardian | Big open arena, clear straight run for the dash-only lane. |

Rules that apply to every tier, all taken from the repo:

- **Elites** (live `elites.json`): from belt 4 (Green). Earliest room 3. 20% chance in a battle room, 35% in a challenge room. At most 1 per room and 2 per floor. At most 1 Guarding per floor. No Guarding on Guided. No Guarding on a tier's first floor. Guarding makes allies within 3 tiles take 33% less (x0.67). Reward: 15 Focus and a 15% chance of a decoration, never gear.
- **Dash-only** attacks use purple stripes with "!!", at least 20 ticks (bestiary: 20-24 by tier). Rooms 1-2 never overlap a red circle. From room 3 a stripe may overlap a red circle with at least 10 ticks between them. Never on Guided.
- Wind-up ticks never scale. Difficulty is tuned through content, not bigger numbers.
- **Gap found: elites only exist for Brute, Swarmer and Shield.** `elites.json` lists only those three live enemies, and none of the 28 new enemies are on the list. So from Green on, an elite can only show up when a room also holds one of those three. See item R-G2B-30.

## Per tier

"Art" says what exists today. "none" means nothing in `incoming-art`.

### Tier 4: Green, The Giant's Steps (belt 4)

New for the student: Strike #4 Side Kick Drive. Seals #16-20 (Low-High Strike, Arm Bar and Wrist Lock are the first **Lock**). 3 Seal slots.

| Group | Enemy | What it does | Tell | Art |
|---|---|---|---|---|
| F1-2 | Pebble Pal (small, swarm) | Hops after you | Hop, then red circle | Working art, not approved (`bestiary-set2`) |
| F1-2 | Cliff Goat (mid, charger) | Charges in a line | Stamps, long red circle at the line's end | none |
| F3-4 | Stack Golem (heavy) | Knocks stones off and shrinks | Wobbles, red circle | none |
| F3-4 | Boulder Roller (mid, dash-only) | Boulder down a stripe lane, 24 ticks | Purple stripes and "!!" | none |
| Guardian | The Stone Giant | Giant stomp, stone toss, Rock Slide (dash-only, two lanes) | | Concept sheets only (`guardian-concepts`), form shift Stone Giant to Pebble Heart |

**Newest-move room:** rooms 3-4 and the challenge room should hold **padded-staff enemies** so Arm Bar #17 and Wrist Lock #19 (Lock) have something to answer, as the redesign says. **The Green bestiary has no padded-staff enemy.** Planner's proposal: reuse the live **Bopper** (padded staff, already in `content/enemies`, Yellow). It passes the balance bands today (Tiers 1-3 test). Jay or the Content Designer could instead add a new Green enemy. Strike #4 Side Kick Drive shows off against Pebble Pal swarms (push them back).

### Tier 5: Blue, The Quiet River (belt 5)

New: Strike #5 Hook Kick. Seals #21-25 (Disarm, Guard and Escape ranks). 3 Seal slots.

| Group | Enemy | What it does | Tell | Art |
|---|---|---|---|---|
| F1-2 | Puddle Frog (mid, hopper) | Hops to you | Red circle where it lands | none |
| F1-2 | Mist Wisp (mid, sneak) | Fades in, then hits | Shimmer, then red circle | none |
| F3-4 | Side Crab (mid, guard) | Shielded claw | Claw snap, red circle | none |
| F3-4 | Splash Wave (mid, dash-only) | Striped wave lane, 24 ticks | Purple stripes and "!!" | none |
| Guardian | The River Watcher | Beak peck, muddy splash, River Wave (dash-only) | | Concept sheets only |

**Newest-move room:** a room with **Side Crab** (it guards) is where Hook Kick #5 (hits around a guard) is wanted. Padded-staff Boppers again in rooms 3-4 for Disarm, X-Block, Turn It Back and Wrist Kick (#21, #23, #24). One taste call lives here: what "around a guard" means (`R-G2B-strikes-4-7.md`, taste call 1).

### Tier 6: Red, The Forge of Courage (belt 6)

New: Strike #6 Lunge. Seals #26-30, including **Break Free** (#29, #30). 3 Seal slots.

| Group | Enemy | What it does | Tell | Art |
|---|---|---|---|---|
| F1-2 | Coal Cub (small, swarm) | Wiggles, then pounces | Red circle | none |
| F1-2 | Anvil Imp (heavy) | Hammer | Hammer up, red circle | none |
| F3-4 | Bellows Puff (mid, pusher) | Inflates and blows a gust (no damage) | Pale gust arrow | none |
| F3-4 | Forge Sweeper (mid, dash-only) | Striped arc, 22 ticks | Purple arc and "!!" | none |
| Guardian | The Ember Knight | Knight's swing, Spark Shield (Strike breaks it), Forge Sweep (dash-only arc) | | Concept sheets only |

**Newest-move room:** the **crowd** rooms (2-3 and the challenge room, 3 or more Coal Cubs at once with an Anvil Imp) are where Break Free is wanted: 2 or more enemies within 1 tile while you Block. Lunge #6 shows off against the Bellows Puff, which keeps its distance. Bellows Puff's gust and Break Free's push-back both move enemies: the Tester should check the two do not cancel in a confusing way. The Ember Knight's Spark Shield is the one place the redesign's "Strikes break shields" is a designed answer.

### Tier 7: Red/Black, The Hall of Echoes (belt 7)

New: Strike #7 Spinning Finisher. Seals #31-35 (mostly Lock). 3 Seal slots.

| Group | Enemy | What it does | Tell | Art |
|---|---|---|---|---|
| F1-2 | Masklet (small, swarm) | Spins | Red circle | none |
| F3-4 | Copycat Shade (mid, mirror) | Copies your last move's shape | Your shape in red, then it hits | none |
| F3-4 | Hush Guard (mid, guard) | Shield that turns | Red circle, shield turns | none |
| F3-4 | Echo Bell (mid, dash-only) | Striped ring with a gap, 22 ticks | Purple ring, gap glows | none |
| Guardian | The Echo Mask | Copy Strike, Echo crowd (Masklets join), Echo Ring (dash-only) | | Concept sheets only |

Only one F1-2 enemy (Masklet) in this tier, so rooms 1-2 are Masklet-only. Planner's proposal for variety: rooms 1-2 may repeat Masklets in different shapes (rows, ring, split sides) and the Content Designer can add a second F1-2 enemy later.

**Newest-move room:** a **Masklet crowd surrounding the student** is where Spinning Finisher #7 (a ring of hits) is wanted. **Catch the Hand #35** ("a Block locks a quick attacker, wind-up 12 or less") needs a quick attacker: Masklets are the only candidates. The bestiary does not give Masklet's wind-up ticks. **Question for the bot: what is the Masklet's wind-up?** If it is above 12, #35 never fires in this tier.

### Tier 8: Brown, The Root Library (belt 8)

New: Seals #36-40 (Wide Release, Steady Hold, Lock to Takedown, Release and Go, Master Hold). No new Strike. 4 Seal slots (Brown, 2-4 at the top).

| Group | Enemy | What it does | Tell | Art |
|---|---|---|---|---|
| F1-2 | Page Flutter (small, swarm) | Rustles in | Red circle | none |
| F1-2 | Bookworm (mid, burrower) | A dirt bump moves to you | Red circle | none |
| F3-4 | Ink Blot (mid, zoner) | Draws a puddle | Dark blue blot | none |
| F3-4 | Root Snapper (mid, dash-only) | Striped lane, 20 ticks | Purple stripes and "!!" | none |
| Guardian | The Root Keeper | Branch tap, Flying Pages (Page Flutters join), Root Line (dash-only) | | Concept sheets only |

**Newest-move room:** the Lock family (hold, release, takedown) shows off against the **Bookworm** (it pops out of the ground, so it can be held and thrown) and Page Flutter packs for Wide Release #36 (bumped enemies knock others). A room that gives the player a **held enemy next to a crowd** is the proposal. The slot count at Brown is "up to 4"; the redesign says 2-4 for belts above Orange, so the exact count per belt is not set (item R-G2B-22 asks).

### Tier 9: Brown/Black, The Storm Stair (belt 9)

No new Seal or Strike in the plan.

| Group | Enemy | What it does | Tell | Art |
|---|---|---|---|---|
| F1-2 | Cloud Puff (small, swarm) | Puffs up | Red circle | none |
| F1-2 | Gust Sprite (mid, pusher) | Spins, blows a gust (no damage) | Pale gust arrow | none |
| F3-4 | Thunder Drum (mid, turret) | Three red circles in a beat | Three circles | none |
| F3-4 | Zap Kite (mid, dash-only) | Zig-zag stripe, 20 ticks | Purple zig-zag and "!!" | none |
| Guardian | The Storm Herald | Thunder clap, Gust Push, Zig-Zag Bolt (dash-only) | | Concept sheets only, form shift Storm Herald to Quiet Thunderhead |

### Tier 10: Black, The Summit (belt 10)

No new Seal in the plan. Black Strikes #8-12 wait on Jay.

| Group | Enemy | What it does | Tell | Art |
|---|---|---|---|---|
| F1-2 | Storm Wisp (small, swarm) | Crackles in | Red circle | none |
| F1-2 | Rumble Brute (heavy) | Big swing | Red circle, 16 ticks | none |
| F3-4 | Echo Knight (mid, guard) | Shield shines | Red circle | none |
| F3-4 | Sky Sweeper (mid, dash-only) | Arc, then a lane, 20 ticks each | Purple stripes and "!!" | none |
| Guardian | The Lost Lightbearer | Storm swing, shadow echoes of earlier Guardians, Storm Sweep (dash-only) | | Concept sheets only, form shift Lost Lightbearer to Cloud Lantern |

Endless mode after the Summit scales at +3% per floor with no cap (bestiary plan). The balance check did not test endless floors. Item R-G2B-31.

## Numbers (from `R-G2B-balance-check.md`)

- 35 enemies and Guardians x belts 4-10 x 3 students x 3 difficulties = 1,260 checks. **25 fail.** All are the "trains more" student on Challenge: 6 Guardians and the Stack Golem.
- Fix proven to pass every check: Guardians' base Health **495**, Stack Golem **128**.
- No two neighbouring belts differ by more than 2x in hits to beat.
- Elites on Challenge: a Brute elite takes 22-25 hits against a top of 20, a Shield elite 11-12 against a top of 10. This is a question for the test bot (R-G2B-18). It matters more now because elites are only for Brute, Swarmer and Shield (see above).
- **I did not set any new numbers for enemy attack speed, wind-up or range.** Those stay in `bestiary-plan.json`. Where it has none, the Content Designer or bot sets them and runs `r-g2b-balance-check.py`.

## Gaps and questions

1. **No padded-staff enemy in Green.** Redesign says Green adds them. Proposal: reuse Bopper.
2. **Elites cover only 3 enemies.** Items needed to add Pebble Pal and others, or use the old three in mixed rooms.
3. **Tiers 9 and 10 have nothing new to teach.** The "newest move" test has no newest move there. Jay's black belt Strikes (#8-12) and Possi's seals (#41-45) wait on him.
4. **Masklet wind-up unknown** (needed for Catch the Hand #35).
5. **Endless mode** is untested.
6. **Room names and signs** for all seven tiers are not written. Brief item R-G2B-07 and the new R-G2B-26 to 29 cover them. Lore per tier is in `drafts/content/lore/`.

## Batch 1 correction

R-G2B-07 says "5 floors plus the Stone Giant Guardian room". The Ember Kitchens pattern, which that item says to copy, is 8 rooms for one floor set (7 rooms plus the Guardian). The bestiary bands F1-2, F3-4, F5 describe enemy groups, not room count. The corrected wording is in `R-GREEN-TO-BLACK.md`.
