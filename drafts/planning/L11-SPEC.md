# L11-S: Tiers 4–10 as remixes, one Guardian each

Written Nov 16, 2026 by the Researcher & Planner. Board 928325d6. Docs only. This replaces my Nov 1 plan (`R-G2B-tower-tiers-4-10.md`) for launch. That plan's Guardian names, moves and "freed" lines stay as the source for later.

**In plain words.** Right now every belt from Green to Black plays the same shared White-belt rooms, just stronger. For launch, each of the 7 tiers gets **its own floor of 8 rooms** made from rooms and enemies the game already has, mixed in new ways, plus **one new Guardian** at the end. Each floor leans on the enemies that the newest self-defense moves for that belt answer best. Every Guardian uses the same base numbers, which pass the R-BAL-12 check on every belt (4–10) for all three model students. Only the 7 Guardians need new art.

## What decides this

- Fable review, section 8.7: ship tiers 4–10 as remixes "with scaling, elites and twists, plus one new Guardian". Jay picked April with remixes (Nov 14, Q4 a).
- Launch plan L11 Done-when: every tier 4–10 has rooms and a Guardian, and R-BAL-12 passes on every tier (Guardian 40–80 hits, never knocked out in under 5 enemy hits).
- The built floor rule (`floorRooms` in `run.ts`): a tier that has rooms with its own `floorSet` and `minBeltTier` equal to that tier plays only those. Ember Kitchens at Orange works this way. So **new floors are data, not new code**.
- Guardians come from `drafts/content/enemies/bestiary-plan.json`, which has a name, 3 moves and a "freed" line for each.
- Jay's redesign: each belt's floor should feature the enemy its newest move answers best.

## 1. The floor shape (same as Ember Kitchens)

Each tier has 8 rooms: **4 battle rooms, 1 challenge room, 1 treasure room, 1 rest room and the Guardian room**. Room ids start with the tier number (`t4-` up to `t10-`), so they can never clash with `w-` or shared ids. Each room is a copy of an existing room's layout with some enemies swapped. Elites (live from tier 4), named monsters and twists already work on every tier and need nothing new.

## 2. The floors

The newest moves come from `docs/curriculum.md` (5 self-defense techniques per belt) and the Seal families in `R-G2B-seal-families-16-40.md` and `L8-SPEC.md`. Only Swarmers and Brutes can be thrown (`throwable`), and only the Bopper carries a weapon to disarm.

| Tier | Place (bestiary) | Newest moves | What the floor features |
|---|---|---|---|
| 4 Green | The Giant's Steps | #16–20: Lock opens, Disarm #19 | Shields (a hold stops a shield) and Boppers |
| 5 Blue | The Quiet River | #21–25: Disarm ×3, Guard, Escape | Boppers, Ladle Lobbers and Rolling Pins |
| 6 Red | The Forge of Courage | #26–30: Throw opens, Lock, Escape ×2 | Brutes and crowds (things to throw and escape) |
| 7 Red/Black | The Hall of Echoes | #31–35: Lock ×4, Throw | Shields and Brutes together |
| 8 Brown | The Root Library | #36–40: Lock, Counter, Throw | A mix of every family |
| 9 Brown/Black | The Storm Stair | none (Review Trials, L9) | Best-of mix |
| 10 Black | The Summit | none | The hardest mixes |

**Starting room list.** The Content Designer owns the rooms and may change these, as long as the feature column holds.

| Tier | Battle 1 | Battle 2 | Battle 3 | Battle 4 | Challenge | Guardian room |
|---|---|---|---|---|---|---|
| 4 | `pillar-court`, Swarmers become Spark Sprites | `staff-and-shield` | `bopper-yard`, Swarmers become Doughlings | `oven-row`, the Brute becomes a Shield | `shield-wall`, Swarmers become Spark Sprites | Stone Giant + 4 Swarmers |
| 5 | `long-table-hall` | `bopper-yard` | `lantern-room`, the Shield becomes a Ladle Lobber | `pin-lanes` | `supper-rush`, the Rolling Pin becomes a Bopper | River Watcher + 4 Spark Sprites |
| 6 | `brute-and-swarm` | `training-yard` | `bamboo-hall` | `ember-pantry` | `gauntlet` | Ember Knight + 4 Swarmers |
| 7 | `twin-shields`, one Shield becomes a Brute | `guarded-swarm` | `narrow-bridge` | `pin-lanes` | `shield-wall`, one Shield becomes a Brute | Echo Mask + 4 Swarmers |
| 8 | `staff-and-shield` | `long-table-hall` | `narrow-bridge` | `oven-row` | `gauntlet`, Swarmers become Spark Sprites | Root Keeper + 4 Spark Sprites |
| 9 | `bopper-yard` | `pillar-court` | `pin-lanes` | `training-yard` | `supper-rush` | Storm Herald + 4 Swarmers |
| 10 | `brute-and-swarm` | `twin-shields` | `long-table-hall` | `ember-pantry` | `gauntlet` | Lost Lightbearer + 4 Spark Sprites |

Every tier also gets a copy of `treasure-vault` and `quiet-shrine` with its own id. The Guardian room copies `keepers-hall`'s layout.

## 3. The Guardians (built parts only)

Each Guardian is built from parts the Hearth Cook already uses, so no new fight code is needed:
- A close red circle you can counter (like `ladle bonk`).
- A second move you can counter (a reach circle, like `hot pot rush`).
- One dash-only lane (copy of `rolling pin lane`: `counterable: false`, `dashOnly`, striped tell).
- It calls 2 small helpers at two-thirds health (`summon`, like the Hearth Cook's).
- `boss` and `guardian` are true, so throws and holds never work on it.

| Tier | Guardian | Counter move 1 | Counter move 2 | Dash-only lane | Helpers |
|---|---|---|---|---|---|
| 4 | The Stone Giant | Giant stomp | Stone toss | Rock slide | Swarmers |
| 5 | The River Watcher | Beak peck | Muddy splash (as a reach circle) | River wave | Spark Sprites |
| 6 | The Ember Knight | Knight's swing | Forge strike (reach circle) | Forge sweep (as a lane) | Swarmers |
| 7 | The Echo Mask | Copy strike (as a plain circle) | Echo crowd (helpers stand in for Masklets) | Echo line (as a lane) | Swarmers |
| 8 | The Root Keeper | Branch tap | Flying pages (helpers stand in for Page Flutters) | Root line | Spark Sprites |
| 9 | The Storm Herald | Thunder clap | Gust (reach circle) | Bolt (as a lane) | Swarmers |
| 10 | The Lost Lightbearer | Storm swing | Shadow strike (reach circle) | Storm sweep (as a lane) | Spark Sprites |

- **Numbers:** every Guardian has a base of **Health 495, Power 17 and Guard 30** (the same as the Floor Keeper). The belt scale makes it tougher at each tier. Wind-ups use the Hearth Cook's ticks, which are never under `MIN_WINDUP_TICKS`.
- **Size:** `guardian-scale.json` already lists `stone-giant` and `lost-lightbearer` at 1.75. The rest use 1.5.
- **Saved for after launch:** arcs, rings with a gap, zig-zags, puddles, the Spark Shield, copying the player, gust push, "shadow echoes" and form shifts. The briefs in PR #449 (Ember Knight's shifted form) and PR #450 (Lost Lightbearer's forms) stay post-launch, so the names in them don't hold up launch.
- **Words:** "freed" lines are already written in the bestiary plan. The life-word "restored" beat is L5's.
- **Fallback if art is late:** build Guardians in order from Green to Black. A tier whose Guardian isn't ready keeps today's shared rooms (the built rule: no own set, no change), so nothing breaks.

## 4. Balance check

The harness is `drafts/planning/L11-sim/l11-bands.ts`, which uses the same math as `packages/sim/test/r-bal-12-bands.test.ts`: base numbers × `ENEMY_TRAINING_SCALE`, against the three pinned model students in `r-bal-12-artists.ts`.
- Live Challenge changes wind-ups, not Health or Power, so its hits equal Standard's.
- The ×1.5 row is the stricter row the test still checks.
- Guided multiplies enemy Power by 0.75.
- Raw rows are in `drafts/planning/L11-sim/results/bands.json`.

**Guardian, base 495 / 17 / 30, belts 4–10:**

| Belt | Student | Health | Power | Hits, Standard and Challenge | Hits, x1.5 row | Hits to knock you out (x1.5 / Standard / Guided) | Pass |
|---|---|---|---|---|---|---|---|
| 4 | typical | 2302 | 73 | 47 | 70 | 6 / 9 / 12 | yes |
| 4 | trains more | 2302 | 73 | 53 | 79 | 6 / 9 / 12 | yes |
| 4 | plays only | 2302 | 73 | 47 | 70 | 5 / 8 / 10 | yes |
| 5 | typical | 3247 | 95 | 48 | 71 | 6 / 9 / 12 | yes |
| 5 | trains more | 3247 | 95 | 54 | 80 | 7 / 10 / 13 | yes |
| 5 | plays only | 3247 | 95 | 48 | 71 | 5 / 8 / 10 | yes |
| 6 | typical | 4188 | 120 | 48 | 71 | 6 / 9 / 12 | yes |
| 6 | trains more | 4188 | 120 | 53 | 79 | 7 / 10 / 13 | yes |
| 6 | plays only | 4188 | 120 | 48 | 71 | 5 / 8 / 10 | yes |
| 7 | typical | 5331 | 148 | 49 | 73 | 6 / 9 / 12 | yes |
| 7 | trains more | 5331 | 148 | 54 | 80 | 7 / 10 / 13 | yes |
| 7 | plays only | 5331 | 148 | 49 | 73 | 5 / 7 / 10 | yes |
| 8 | typical | 6485 | 176 | 49 | 73 | 6 / 9 / 12 | yes |
| 8 | trains more | 6485 | 176 | 53 | 79 | 7 / 10 / 13 | yes |
| 8 | plays only | 6485 | 176 | 49 | 73 | 5 / 7 / 10 | yes |
| 9 | typical | 7875 | 203 | 49 | 73 | 6 / 9 / 12 | yes |
| 9 | trains more | 7875 | 203 | 52 | 78 | 7 / 10 / 14 | yes |
| 9 | plays only | 7875 | 203 | 49 | 73 | 5 / 7 / 10 | yes |
| 10 | typical | 9266 | 235 | 49 | 73 | 6 / 9 / 12 | yes |
| 10 | trains more | 9266 | 235 | 52 | 78 | 7 / 10 / 14 | yes |
| 10 | plays only | 9266 | 235 | 49 | 73 | 5 / 7 / 10 | yes |

- Every row passes. Standard hits stay between 47 and 54 across belts 4–10, so there's no jump between tiers. The fewest hits to knock a student out is 5, on the ×1.5 row.
- **Measured and rejected:** base 549 (the Hearth Cook's) goes over 80 for the "trains more" student on the ×1.5 row on every belt (86–89). Base 470 also passes (44–51 Standard), but it's softer than the 495 the Floor Keeper already uses.

**Every existing enemy the remix rooms use, belts 4–10:**

| Enemy | Band (hits / fewest hits to knock you out) | Hits, belts 4-10 | As an elite (x1.25 Health) | Fewest hits to knock you out | Pass |
|---|---|---|---|---|---|
| swarmer | 2-4 / 12 | 2-2 | 2-3 | 17 | yes |
| spark-sprite | 2-4 / 12 | 2-2 | 2-3 | 17 | yes |
| doughling | 2-4 / 12 | 2-2 | 2-3 | 17 | yes |
| shield | 5-10 / 8 | 6-7 | 7-8 | 11 | yes |
| bopper | 5-10 / 8 | 6-7 | 7-8 | 11 | yes |
| dough-blob | 5-10 / 8 | 5-6 | 6-7 | 11 | yes |
| ladle-lobber | 5-10 / 8 | 5-6 | 6-7 | 11 | yes |
| rolling-pin | 5-10 / 8 | 6-7 | 7-9 | 11 | yes |
| brute | 10-20 / 5 | 12-14 | 15-17 | 7 | yes |

- All of them pass, plain and as elites.
- **Not measured here:** whole runs on the new floors (rooms, helpers, twists and elites together). That needs the room files, so it's L11-Q1.

## 5. Work items

| Item | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| L11-C1 | Content Designer | Room files for tiers 4–10 from section 2: 8 per tier (56 in total), with ids `t4-` to `t10-`, `floorSet` set and `minBeltTier` equal to the tier | Each tier has 4 battle, 1 challenge, 1 treasure, 1 rest and 1 boss room; uses only live enemies; the room loader test passes | none |
| L11-C2 | Content Designer | Guardian text: tells and banners (8 words or fewer, no body targets); "freed" lines checked against the bestiary plan | The check script passes | none |
| L11-B1 | Programmer | 7 Guardian enemy files from section 3 (base 495/17/30, 3 built attacks, summon), each added to the R-BAL-12 bands list at its own belt | The bands test passes at belts 4–10; each Guardian appears only in its tier's Guardian room | L11-C2 (placeholder text OK) |
| L11-B2 | Programmer | Turn the floor sets on, one tier at a time as its Guardian art lands | Tests: a tier 4–10 floor uses only its own rooms and Guardian; tiers 1–3 are unchanged; a tier without its own rooms still uses the shared rooms | L11-C1, L11-B1, L11-A1 for that tier |
| L11-A1 | Artist | 7 Guardians from the concept sheets, Green first: idle, walk, 3 tells, hit and freed pose | Each one passes the art gate at game size | none |
| L11-Q1 | Tester | Rerun the whole-run balance bot on tiers 4–10, all difficulties, with the built floors | The R-BAL-12 bands and the Insight-budget gates (B5 at belt 4 within 15 of 61) still pass; any fail goes to the Manager | L11-B2 |

**Scope:** Large, as the review sized it. The cost is almost all art: 7 Guardians. Rooms are data, and the fight needs no new code. No Jay decisions are needed. The Guardian names come from the bestiary plan that's already in the repo.
