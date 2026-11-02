# R-G2B: art plan for Green to Black

Written Nov 1, 2026 by the Researcher & Planner. Docs only. Every "exists" below was checked in `incoming-art/` on main (91dd4bb).

## In plain words

- **Almost nothing exists yet for tiers 4-10.** One Green monster (Pebble Pal) has working art that Jay has not approved. All 10 Guardians have concept pictures only, waiting on Jay's final OK. There are no room kits above Orange. There are no Strike icons at all.
- **Seal icons: I recommend 6 family medallions plus rank pips**, not 35 separate drawings. The old 10 Seal icons are samples for the old placeholder Seals.
- This plan lists what each artist item must deliver. The items are R-G2B-33 to 45 on the board.

## What exists today

| Thing | What is in the repo | State |
|---|---|---|
| Seal icons | 10 samples in `incoming-art/icons` (Off-Balance, Escape Step, Sweep, Steady Breath, Strong Block, Sharp Eyes, Create Distance, Disarm, Throw, Follow Through). 128 x 128. "Seals = round medallion plus one simple symbol." | Samples only, for the old placeholder Seals. Not for #11-40. |
| Strike icons | none | Spin Kick Finish and Butterfly Flow have no icon in `incoming-art`. |
| Green to Black enemies | `bestiary-set2/pebble-pal` (Pebble Pal, working, "waiting for the Manager, then Jay"). The other Green-and-above bestiary art is for other monsters (Lantern Moth, Buzzy Bee, Thorn Sprout, Shellback Snail, Vine Sweeper). | 1 of 28 enemies has art, and it is not approved. |
| Guardians | `guardian-concepts`: concept sheets for all 10, phases 1-3, plus 4 form shifts (Stone Giant to Pebble Heart, Sun Gardener to Bloom Gardener, Storm Herald to Quiet Thunderhead, Lost Lightbearer to Cloud Lantern). | Concept only. "Please don't import them." Waits on Jay's final OK. |
| Room kits | `tower-rooms` (tier 1), `tower-rooms-t2`, `tier3-ember-kitchens` (40 sprites, 8 rooms, floor, walls, props, boss door, shrine, chest). | Tiers 1-3 only. None for tiers 4-10. |
| Elite auras | `elite-auras` | Done (elites already live). |
| Dash-only warning | `dash-telegraph` (purple stripes with "!!") | Done. New tier shapes (wave lane, arc, ring, zig-zag) are not drawn. See item R-G2B-33 to 38. |
| Padded-staff weapon | `enemy-padded-weapon` | Done. Needed for Bopper in Green and Blue. |
| Kata icons | `kata-icons` (21 moves) | Not imported, waits on Jay. Katas are out of scope here. |
| Unlock screen and Sensei's Trial art | none | The redesign puts both in the beta (Dec 15). |

## Seal icons (#1-10 and #16-40)

**Count:** 35 techniques need an icon (10 + 25), plus #11-15 which R-G2B-03 already covers.

**Proposal: 6 family medallions plus rank pips.** The redesign's rule is "every self-defense sign-off shows on a Seal by its real name". The name does the job of telling techniques apart. The icon only needs to say which family it is and what rank it is.

- 6 medallions: Counter, Guard, Escape, Disarm, Throw, Lock. Each has its own rim colour and one simple symbol, in the existing Seal style (round medallion plus one symbol, 128 x 128, thick 2 px outline, no text).
- A small row of rank pips under the symbol, drawn as game art (not baked into the medallion), so one medallion works for every rank. Ranks per family: Counter 1-9 (#1 is rank 1, #16 rank 8, #20 rank 9), Guard 1-4, Escape 1-6, Disarm 1-5, Throw 1-6, Lock 1-10 (counts from `R-G2B-seal-families-16-40.md`).
- Phone check: the family must be readable at 48 pt, with a grey-scale check (colour is never the only cue).
- The 10 existing sample icons stay as spare art until the family list is decided (Jay decides each family, R-G2B-22).

**Why not 35 drawings:** about 10 times the work for something a kid reads through the name. It also stops a family rebalance (Jay may move #37 or #19, see the seal doc) from forcing redraws.

**If Jay prefers one drawing per technique**, the count is 35 (plus 5 for #11-15), each in the same medallion style. That is a taste call. It does not block the beta: the beta needs only #1-15.

## Strike icons

7 icons (Strikes #1-7), 128 x 128, in the Seals' medallion family or the Insight scroll family. R-G2B-03 already draws #2 Jumping Spins. The new item R-G2B-44 covers #1, #3, #4, #5, #6, #7. Strike #1 and #3 are beta. #4-7 are launch.

## Enemies (28) and Guardians (7)

All art follows the house toon style and the repo's sprite delivery format (sprites, preview, README, Delivery Note), like `bestiary-set1/2`. Each enemy needs a body, a walk, an attack tell (red circle or purple stripes) and a hit. The tell wording is in `drafts/content/enemies/bestiary-plan.json`.

| Item | Tier | Enemies to draw |
|---|---|---|
| R-G2B-08 (Batch 1) | Green | Cliff Goat, Stack Golem, Boulder Roller (Pebble Pal exists, working) |
| R-G2B-33 | Blue | Puddle Frog, Mist Wisp, Side Crab, Splash Wave |
| R-G2B-34 | Red | Coal Cub, Anvil Imp, Bellows Puff, Forge Sweeper |
| R-G2B-35 | Red/Black | Masklet, Copycat Shade, Hush Guard, Echo Bell |
| R-G2B-36 | Brown | Page Flutter, Bookworm, Ink Blot, Root Snapper |
| R-G2B-37 | Brown/Black | Cloud Puff, Gust Sprite, Thunder Drum, Zap Kite |
| R-G2B-38 | Black | Storm Wisp, Rumble Brute, Echo Knight, Sky Sweeper |
| R-G2B-39 | Guardians (7) | Final sprites for Stone Giant, River Watcher, Ember Knight, Echo Mask, Root Keeper, Storm Herald, Lost Lightbearer, phases 1-3 and the form shifts for Stone Giant, Storm Herald and Lost Lightbearer. Waits on **Jay's final OK of the concept sheets**. |

Notes for the artist items:

- Dash-only shapes by tier: Boulder Roller lane (24 ticks), Splash Wave wave lane (24), Forge Sweeper arc (22), Echo Bell ring with a glowing gap (22), Root Snapper lane (20), Zap Kite zig-zag (20), Sky Sweeper arc then lane (20). Same purple stripes and "!!". Never a circle, never red.
- Elites reuse the existing aura art. Check each new enemy shape with the aura on (item R-G2B-28 decides which enemies can be elites).
- Masklet, Copycat Shade and Echo Bell fit the Red/Black "echoes" lore. The Copycat Shade must be clearly not the player. This is a lore point for the Content Writer, not a number.
- Mood per tier is in `drafts/content/lore/04-green.md` to `10-black.md`.

## Rooms

One kit per two or three tiers, built like `tier3-ember-kitchens`: floor, walls, wall pieces, solid props, flat pieces, boss door, chest, rest shrine, 8 previews with the player for scale. The floor stays plain and light so red circles and purple stripes stand out. Never put purple, white stripes or red rings in the floor or prop art (Ember brief rule).

| Item | Tiers |
|---|---|
| R-G2B-40 | Green and Blue |
| R-G2B-41 | Red and Red/Black |
| R-G2B-42 | Brown, Brown/Black and Black |

Each kit waits on the matching room item (R-G2B-25 to 27) for the room list and props.

## Unlock screen and Sensei's Trial

R-G2B-45 (Artist): the unlock screen (real technique name, new Strike or Seal rank, kid words) and the Sensei's Trial room look. The redesign says one room template and one screen, in the beta. The unlock text comes from the Content Writer. The build is R-G2B-46 (Programmer).

## Order I would do it in

1. Beta first: Strike icons #1 and #3, family medallions, unlock screen and Trial art (R-G2B-43, 44, 45).
2. Launch: Green enemy art (R-G2B-08), Guardian final art after Jay's OK, then tiers in belt order.
3. Because there are 28 enemies and 7 Guardians with only one working picture, **art is the longest launch job**. If the dates are tight, the Manager might build tiers 4-6 first and keep 7-10 for after launch. That is Jay's call, not mine.
