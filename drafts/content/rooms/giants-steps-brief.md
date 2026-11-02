# Room brief: The Giant's Steps (Tier 4, Green)

DRAFT for R-G2B-07 (plan: `drafts/planning/R-GREEN-TO-BLACK.md`, PR #401), updated after the Manager's calls. The data is `giants-steps.json`. It uses the `content/rooms/` format with the same legend and no new tile types, like `ember-kitchens.json`. Lore: `drafts/content/lore/04-green.md`. Enemies: `drafts/content/enemies/bestiary-plan.md`. Boss: `drafts/content/bosses/stone-giant.json`. **There are no enemy stats anywhere in this set.** Wave sizes are placeholders until balance work (Batch 2).

## The feel

A long mountain stair, with big old steps made for someone very tall. The stones have shaken loose and gone grumpy, not scary. As the player clears each room, the stones settle: the steps line up, moss greens, and a little water runs down the gutter. Everything is soft-edged and chunky.

**Palette:** moss green, river-stone grey and warm sand, with soft blue shadows in the corners the sun has not reached.

**Combat space rule:** every prop on a `.` tile is flat decoration you can walk through. Anything solid is already a `#` tile. The two middle columns of every battle room stay clear.

**Hazards come from enemies only:** the Pebble Pal's hop, the Cliff Goat's charge, the Stack Golem's topple, and the Boulder Roller's purple-stripe lane with "!!" (24 ticks, dash-only, can't be COUNTERed). The earlier Brute, Shield Guard and Swarmer keep their own tells.

## How the engine will use it (not built yet)

- **`minFloor`** is on every room: the first floor (1-5) it may appear on. The Programmer is making the engine change that reads it. Until then the field is ignored and only `earliestRoom` (room number inside a floor) applies.
- **`maxFloor` 4** is on the two Boulder Roller rooms only. This is my reading of "keep the Roller on floor 4 only". The Manager approved it, and `maxFloor` will be added to the Programmer's minFloor item.
- **Floors 1-4 end in the existing Floor Keeper boss.** Floor 5 ends in the Stone Giant (`great-stair`, `minFloor` 5).
- **Earlier-tier enemies are mixed in** by their existing ids (`brute`, `shield`, `swarmer`), so the floors do not feel thin, and their challenge patterns come along automatically (Swarmer, Shield Guard and Floor Keeper have `challenge.fromBelt` 4, Brute has 5, and the belt note for the Brute is: Programmer confirms Green's belt index; all from room 2). Each enemy keeps its own band: Swarmer and Brute from floor 1, Shield Guard from floor 3.
- **Column and row count from 1** in the `enemies` entries (like `content/rooms/`, so column 1 is the left wall tile). `tiles[]` is indexed from 0 in the file, as usual.

## The rooms (11)

| Room (id) | Kind | `minFloor` | Earliest room | Waves (enemy x count) | Layout and Boulder Roller |
| --- | --- | --- | --- | --- | --- |
| Pebble Path (`pebble-path`) | battle | 1 | 1 | W1 Pebble Pal x3. W2 Pebble Pal x2, Swarmer x2. | Four stair-shaped blocks in the side walls. No Boulder Roller. |
| Swarm Slope (`swarm-slope`) **new** | battle | 1 | 2 | W1 Swarmer x3, Pebble Pal x2. W2 Brute, Pebble Pal x2. W3 Swarmer x3, Pebble Pal. | A V of diagonal stone blocks, like a gravel hillside. No Boulder Roller. |
| Goat Ledge (`goat-ledge`) | battle | 2 | 2 | W1 Cliff Goat x2, Pebble Pal x2. W2 Cliff Goat, Brute, Pebble Pal x2. | Two long ledges with a wide gap, so goats charge down open columns. No Boulder Roller. |
| Golem Stairs (`golem-stairs`) | battle | 3 | 3 | W1 Stack Golem, Pebble Pal x2. W2 Stack Golem, Cliff Goat, Shield Guard. W3 Cliff Goat, Swarmer x2, Pebble Pal. | A staircase of walls in each upper corner. No Boulder Roller. |
| Shield Shelf (`shield-shelf`) **new** | battle | 3 | 3 | W1 Shield Guard, Cliff Goat, Pebble Pal x2. W2 Shield Guard, Stack Golem, Swarmer x2. W3 Brute, Cliff Goat, Pebble Pal x2. | One long shelf across the room with a wide middle gap, and two small posts. No Boulder Roller. |
| Roller Run (`roller-run`) | battle | **4** (`maxFloor` 4) | 3 | W1 Boulder Roller, Cliff Goat, Pebble Pal, Swarmer. W2 Boulder Roller, Shield Guard, Pebble Pal x2. W3 Boulder Roller, Brute, Pebble Pal x2. | Open road with two low ridges. **One Boulder Roller per wave** (lane columns 11, 6, 15), each starting at row 3 with 3 clear tiles below it and open floor beside it to DASH into. |
| Switchback Road (`switchback-road`) **new** | battle | **4** (`maxFloor` 4) | 4 | W1 Boulder Roller, Brute, Pebble Pal x2. W2 Boulder Roller, Stack Golem, Swarmer x2. W3 Boulder Roller, Shield Guard, Cliff Goat, Pebble Pal. | Two long ridges that switch sides, like a zigzag road. **One Boulder Roller per wave** (lane columns 5, 16, 11), same lane rule. |
| The Giant's Gate (`giants-gate`) | challenge | 3 | 4 | W1 Swarmer x3, Pebble Pal x2. W2 Stack Golem, Shield Guard, Cliff Goat, Pebble Pal. W3 Brute, Cliff Goat, Swarmer x2. | Two stair-shaped corner blocks top and bottom; chest at the top. No Boulder Roller. A Swarmer, Shield Guard and Brute all appear, so their challenge patterns do too. |
| Water Jar Landing (`water-jar-landing`) | treasure | 1 | - | none | Same 13 x 9 shape as Spice Cupboard, with stepping stones. |
| Resting Step (`resting-step`) | rest | 1 | - | none | Same 13 x 9 shape as Warm Hearth, with two blanket blocks. |
| The Great Stair (`great-stair`) | boss | 5 | - | W1 Stone Giant, Pebble Pal. W2 Pebble Pal x2. | Fully open 20 x 14 so the Giant's rock-slide lanes are always clear. Chest `C` is where the light piece and relic appear after the Giant is freed (overlay key `stone-giant`). |

## Floor by floor (5 floors and the Guardian room)

Each floor may use every room whose `minFloor` is at or below it (and, for the Roller rooms, whose `maxFloor` is at or above it). One new Green enemy arrives per floor; the earlier Brute, Shield Guard and Swarmer are mixed in. The same table is in `giants-steps.json` under `floors` and the checker keeps it in step with `minFloor` and `maxFloor`.

| Floor | New Green enemy | Earlier enemies mixed in | Rooms this floor may use | Where the Boulder Roller is |
| --- | --- | --- | --- | --- |
| 1 | Pebble Pal | Swarmer, Brute | Pebble Path, Swarm Slope, Water Jar Landing, Resting Step | Nowhere. No stripes yet. |
| 2 | Cliff Goat | Swarmer, Brute | floor 1 rooms + Goat Ledge | Nowhere. Floors 1-2 never show stripes and a red circle together. |
| 3 | Stack Golem | Swarmer, Brute, Shield Guard | floor 2 rooms + Golem Stairs, Shield Shelf, The Giant's Gate | Nowhere. The Boulder Roller waits until floor 4. |
| 4 | **Boulder Roller** | Swarmer, Brute, Shield Guard | floor 3 rooms + **Roller Run**, **Switchback Road** | **Roller Run and Switchback Road only**: one lane per wave in each. Stripes may overlap a red circle, 10 or more ticks apart, never on Guided. |
| 5 | none (everything but the Roller, then the Stone Giant) | Swarmer, Brute, Shield Guard | floor 3 rooms, then The Great Stair | Nowhere (the Roller rooms stop at floor 4). |

## What can't be read yet (not built)

- **`minFloor` and `maxFloor`.** The engine ignores both until the Programmer's change lands.
- **Floor Keeper rooms.** Floors 1-4 keep the existing Floor Keeper boss; no new room is drafted for it.
- **Enemies.** The four Green enemies are drafts in `drafts/content/enemies/` with no real stats, and art for three of them is not drawn (R-G2B-08). Brute, Shield Guard and Swarmer are the existing ones in `content/enemies/`.
- **Challenge numbers.** `giants-gate` uses the Supper Rush block (90 seconds) as a placeholder, with Green wording.

## Checks

- `python3 drafts/content/tools/check-rooms-giants-steps.py`: the format, tiles, doors, reachability, enemy lists and first floors, `minFloor`/`maxFloor`, the floor table, and the Boulder Roller lanes.
- `node --experimental-strip-types drafts/content/tools/check-rooms-load.mjs`: loads every room with the game's own `loadRoom` (read-only, needs Node 22.6+).
- All other tools in `drafts/content/tools/` still pass.
