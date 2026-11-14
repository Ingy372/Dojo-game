# Belt rooms — full Green-to-Black kit (G2B-40, G2B-41, G2B-42)

Not imported. Jay said the belt rooms look good and to build the full set. The Manager relayed that on Nov 10.

Earlier passes are in `superseded/`. The pass the Manager sent back (`271a138a`) is in `superseded/pass-271a138a/`. The three approved sample pictures stay in `sprites/`.

This pass puts those approved groupings into the real Pebble Path, Bellows Door, and Reading Nook. Green steps are grey stone with a thick moss tread, not a bare slab. Boss pieces sit on the top wall. The floors they stand over stay open.

## Delivery Note

**ITEM:** One shared stair block. The same mesh was the green stair, the blue stair, and every other belt's `#` block.

**WHAT:** The block is now one low stone slab with a full cap. The high back, the arms, and the seat recess are gone from the shared model, not painted over. Maps, placements, and the other corrections are unchanged. The old chair-shaped art is in `superseded/pass-cde096d6-chair-block/`.

Failed premise, written down before the mesh change and checked with an isolated silhouette against the approved `a58b7637` platform: adding moss to the high-backed stair does not make it that platform. Green and Blue were the same shape. See `preview/silhouette-before-shared-block.png`.

Shared assets rebuilt from that one mesh: `green-block`, `blue-block`, `red-block`, `redblack-block`, `brown-block`, `brownblack-block`, `black-block`, `green-stair`.

Rooms whose pictures changed, because they contain that block: pebble-path, swarm-slope, goat-ledge, golem-stairs, shield-shelf, roller-run, switchback-road, giants-gate, water-jar-landing, resting-step, ferry-landing, reed-bank, crab-shallows, wave-lanes, lantern-barge, oar-locker, still-pool, bellows-door, cub-crowd, anvil-alley, sweeping-hall, smiths-rush, shield-rack, cool-embers, whisper-gate, split-mirrors, shade-gallery, echo-chamber, kind-word-nook, quiet-corner, dusty-entry, reading-roots, inkwell-aisle, root-stacks, great-reading-room, story-shelf, reading-nook, rainy-landing, breezy-bend, drum-landing, zigzag-steps, storm-gate, feather-nook, dry-alcove, summit-steps, wisp-walk, knight-terrace, sweeper-ridge, last-climb, bell-nook, lamp-stand.

Unchanged room pictures: great-stair, watching-pool, knights-forge, mask-hall, root-hall, heralds-landing, summit-lamp, masklet-circle. The boss sheet is unchanged. 59 room ids. 0 danger-red pixels.

**WHY:** On the real rooms the shared block read as a chair: a high back and a seat. That showed on Green (Pebble Path, golem-stairs, swarm-slope) and on Blue (ferry-landing, reed-bank).

**DECIDE:** Review the low tread. It is not imported.

**NEXT:** After a yes, a Programmer can import the kit. Until then it stays in `incoming-art/`.

Look here:

- `preview/compare-treads-48.png` — Pebble Path, golem-stairs, swarm-slope, ferry-landing, and reed-bank, before and now, at 48 px per tile.
- `preview/compare-treads-closeup.png` — large before and now, with the approved platform beside them.
- `preview/silhouette-before-shared-block.png` — the failed premise, the old shape, the approved platform, and the new slab.

## Earlier pass

**ITEM:** G2B-40, G2B-41, and G2B-42. Every room from Green through Black.

**WHAT:** The same 59 rooms, same maps, same 35° camera, 80 px tiles. Nothing was added to the collision. Every placed picture is listed in `art-placements.json` with `collision: false`.

- Pebble Path now has the approved grouping on the real room: thick mossy stepping stones and ferns beside the path, a stream against the right wall, and stair blocks with a moss tread.
- Bellows Door has the bellows by the doors, anvil, tools, bin, trough, barrel, and ember pools on the sides, and three lanterns hanging on the top wall.
- Reading Nook has shelves, the ladder, the lamp, rugs, cushions, the seat, and short roots at the sides. The middle lane stays clear.
- The forge, the mirrors, and the lamp stand are on the top wall. The Root Hall tree and its roots are on the wall only. The Great Stair and the Herald's landing stay open, with the stair and the clouds up on the wall. The Watching Pool is a shallow floor with flat stones at the sides.
- Blue, Red-Black, Brown-Black, Black, and the boss floors no longer have the repeated light ovals.

| Set | Rooms | Sheet |
| --- | --- | --- |
| Giant's Steps (Green) | 11 | `preview/giants-steps-48.png` |
| Quiet River (Blue) | 8 | `preview/quiet-river-48.png` |
| Forge of Courage (Red) | 8 | `preview/forge-of-courage-48.png` |
| Hall of Echoes (Red-Black) | 8 | `preview/hall-of-echoes-48.png` |
| Root Library (Brown) | 8 | `preview/root-library-48.png` |
| Storm Stair (Brown-Black) | 8 | `preview/storm-stair-48.png` |
| The Summit (Black) | 8 | `preview/summit-48.png` |

Each room picture is `rooms/<id>.png`. The piece list, sizes, and anchors are `kit/static.json`. The room list is `manifest.json`.

**WHY:** The Manager sent back `271a138a` because the real Pebble Path, Bellows Door, and Reading Nook did not match the approved samples, and the green steps looked like raw grey slabs.

**DECIDE:** Review the corrected rooms. They are not imported. A few art calls, already made so the build could finish:

- The guardians themselves (Stone Giant, heron, Ember Knight, mask, Root Keeper, Storm Herald, Lightbearer) are not drawn in these rooms. They are character art, not floor tiles.
- "Deep red" and the smith chest's "red lid" are lacquer brown. Danger-red stays for attack warnings only. Checked pixels: 0.
- Storm lightning is a short post with a soft gold tip, not a bolt and not a stripe.
- Sign words are not painted into the pictures. They stay in the room data for the game to draw.

**NEXT:** After a yes, a Programmer can import the kit. Until then it stays in `incoming-art/`.

## Look here

- `preview/compare-samples-48.png` — Pebble Path, Bellows Door, and Reading Nook. Each row is the rejected export, this export, and the approved sample, all at 48 px per tile.
- `preview/*-48.png` — all 59 rooms at 48 px per tile, plus `boss-setpieces-48.png`. The fighter is the kitchen sprite.
- `art-placements.json` — where each picture sits, which layer (top wall or flat floor), and that it adds no collision.

## Rebuild

```
blender -b -P incoming-art/belt-rooms-g2b40-42/source/build_kit.py -- \
    --out incoming-art/belt-rooms-g2b40-42/source/belt-room-kit.blend
blender -b incoming-art/belt-rooms-g2b40-42/source/belt-room-kit.blend \
    -P incoming-art/tools/render_static.py -- \
    --out incoming-art/belt-rooms-g2b40-42/kit --samples 8
python3 incoming-art/belt-rooms-g2b40-42/source/compose_rooms.py
```

Scene: `source/belt-room-kit.blend`. Script: `source/build_kit.py`.
