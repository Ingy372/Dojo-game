# Room brief: The Giant's Steps (Tier 4, Green)

DRAFT for R-G2B-07 (plan: `drafts/planning/R-GREEN-TO-BLACK.md`, PR #401). The data is in `giants-steps.json`. It uses the `content/rooms/` format with the same legend and no new tile types, like `ember-kitchens.json`. Lore: `drafts/content/lore/04-green.md`. Enemies: Pebble Pal, Cliff Goat, Stack Golem and Boulder Roller (`drafts/content/enemies/bestiary-plan.md`), and the Stone Giant in `drafts/content/bosses/stone-giant.json`. **There are no enemy stats anywhere in this set.** Wave sizes are placeholders until balance work (Batch 2).

## The feel

A long mountain stair, with big old steps made for someone very tall. The stones have shaken loose and gone grumpy, not scary. As the player clears each room, the stones settle: the steps line up, moss greens, and a little water runs down the gutter. Everything is soft-edged and chunky.

**Palette:** moss green, river-stone grey and warm sand, with soft blue shadows in the corners the sun has not reached.

**Combat space rule:** every prop on a `.` tile is flat decoration you can walk through. Anything solid is already a `#` tile. The two middle columns of every battle room stay clear.

**Hazards come from enemies only:** the Pebble Pal's hop and the Cliff Goat's charge, the Stack Golem's topple, and the Boulder Roller's purple-stripe lane with "!!" (24 ticks, dash-only, can't be COUNTERed).

## The rooms (8, like the Orange set)

| Room (id) | Kind | Earliest room | Waves (enemy x count) | Layout and Boulder Roller |
| --- | --- | --- | --- | --- |
| Pebble Path (`pebble-path`) | battle | 1 | W1 Pebble Pal x3. W2 Pebble Pal x4. | Four small stair-shaped blocks in the side walls. No Boulder Roller. |
| Goat Ledge (`goat-ledge`) | battle | 2 | W1 Cliff Goat x2, Pebble Pal x2. W2 Cliff Goat x1, Pebble Pal x3. | Two long ledges with a wide gap, so goats charge down open columns. No Boulder Roller. |
| Golem Stairs (`golem-stairs`) | battle | 3 | W1 Stack Golem x1, Pebble Pal x2. W2 Stack Golem x1, Cliff Goat x1, Pebble Pal x1. W3 Cliff Goat x1, Pebble Pal x2. | A staircase of walls in each upper corner. No Boulder Roller. |
| Roller Run (`roller-run`) | battle | 3 | W1 Boulder Roller, Cliff Goat, Pebble Pal. W2 Boulder Roller, Cliff Goat, Pebble Pal x2. W3 Boulder Roller, Pebble Pal x3. | Open road with two low ridges. **One Boulder Roller per wave**, start at row 2: wave 1 column 10, wave 2 column 5, wave 3 column 14. Each lane is 3 clear floor tiles straight down with open floor on at least one side to DASH into. |
| The Giant's Gate (`giants-gate`) | challenge | 4 | W1 Pebble Pal x4, Cliff Goat. W2 Stack Golem, Cliff Goat, Pebble Pal x2. W3 Boulder Roller, Cliff Goat, Pebble Pal x2. | Two stair-shaped corner blocks top and bottom; chest at the top. One Boulder Roller, in wave 3 only, column 5. |
| Water Jar Landing (`water-jar-landing`) | treasure | - | none | Same 13 x 9 shape as Spice Cupboard, with stepping stones. |
| Resting Step (`resting-step`) | rest | - | none | Same 13 x 9 shape as Warm Hearth, with two blanket blocks. |
| The Great Stair (`great-stair`) | boss | - | W1 Stone Giant, Pebble Pal. W2 Pebble Pal x2. | Fully open 20 x 14 so the Giant's rock-slide lanes are always clear. Chest `C` is where the light piece and relic appear after the Giant is freed (overlay key `stone-giant`). |

## Floor by floor (the plan: 5 floors and the Guardian room)

"New" follows the bands in `bestiary-plan.md`: floors 1-2 add one enemy at a time, floors 3-4 are mixed rooms and the tier's dash-only enemy, floor 5 is the Guardian floor. Each floor ends in the Floor Keeper (floors 1-4) or the Stone Giant (floor 5).

| Floor | New enemy | Enemies on this floor | Rooms this floor may use | Where the Boulder Roller is |
| --- | --- | --- | --- | --- |
| 1 | Pebble Pal | Pebble Pal | Pebble Path, Water Jar Landing, Resting Step | Nowhere. No stripes yet. |
| 2 | Cliff Goat | Pebble Pal, Cliff Goat | Pebble Path, Goat Ledge, Water Jar Landing, Resting Step | Nowhere. Floors 1-2 never show stripes and a red circle together. |
| 3 | Stack Golem | Pebble Pal, Cliff Goat, Stack Golem | Pebble Path, Goat Ledge, Golem Stairs, Water Jar Landing, Resting Step | Nowhere. The Boulder Roller waits until floor 4 so there is one new idea per floor. |
| 4 | **Boulder Roller** | all four | Goat Ledge, Golem Stairs, **Roller Run**, Water Jar Landing, Resting Step | **Roller Run only**: one lane per wave (columns 10, 5, 14). Stripes may now overlap a red circle, 10 or more ticks apart, never on Guided. |
| 5 | none (everything together) | all four, then the Stone Giant | Goat Ledge, Golem Stairs, Roller Run, **The Giant's Gate**, Water Jar Landing, Resting Step, then The Great Stair | **Roller Run** as floor 4, and **The Giant's Gate** wave 3 (column 5). Never two lanes in the same wave. |

The same table is in `giants-steps.json` under `floors`, so a checker can read it.

## What can't be read yet (not built)

- **Floors.** The Orange set only used `earliestRoom` (the number of the room in a floor) to keep later enemies out of early rooms. The engine has no way to say "only on floor 4 and later". With `earliestRoom` alone, Roller Run could show up in room 3 of floor 1. The `floors` table needs a code change, or a `minFloor` field on each room.
- **Floor Keeper rooms.** The Orange set only carries the Guardian room. I did not add a Floor Keeper room; the table assumes floors 1-4 keep today's Floor Keeper boss.
- **Enemies.** All four Green enemies are drafts in `drafts/content/enemies/` with no real stats, and art for three of them is not drawn (R-G2B-08).
- **Challenge numbers.** `giants-gate` uses the Supper Rush block (90 seconds) as a placeholder, with Green wording.

## Checks

`python3 drafts/content/tools/check-rooms-giants-steps.py` checks the format, the tiles, doors, reachability, the enemy lists, the floor table and the Boulder Roller lanes. All other tools in `drafts/content/tools/` still pass.
