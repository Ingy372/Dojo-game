# Belt rooms — full Green-to-Black kit (G2B-40, G2B-41, G2B-42)

Not imported. Jay said the belt rooms look good and to build the full set. The Manager relayed that on Nov 10.

The empty kit pass is in `superseded/pass-63fb0263/`. The next pass is in `superseded/pass-a7324da8/`. This pass joins the walls, puts real stepping stones on the Pebble Path, builds the seven boss backdrops, and makes the named props big enough to read at 48 px per tile.

The three approved sample pictures stay in `sprites/`.

## Delivery Note

**ITEM:** G2B-40, G2B-41, and G2B-42. Every room from Green through Black.

**WHAT:** 59 rooms. Green is all 11 rooms in `giants-steps.json` (a run still picks 8). Then Blue, Red, Red-Black, Brown, Brown-Black, and Black, 8 rooms each. Layouts are the `# . D P C S` maps in `drafts/content/rooms/`. Props are only the ones named in that room's art line, kept off the middle. Green floors are one soft moss, with river stones, ferns, and a stream at the sides. Red floors are one quiet brick, with bright ember pools. Brown floors are one even plank, and roots sit only on the wall edges. Same 35° camera and 80 px tiles as the samples. The contact sheets are at 48 px per tile with the approved kitchen fighter standing on P.

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

**WHY:** The sample trio was approved, so the rest of the belt rooms can be built for review.

**DECIDE:** Review the full set. It is not imported. A few art calls, already made so the build could finish:

- The guardians themselves (Stone Giant, heron, Ember Knight, mask, Root Keeper, Storm Herald, Lightbearer) are not drawn in these rooms. They are character art, not floor tiles.
- "Deep red" and the smith chest's "red lid" are lacquer brown. Danger-red stays for attack warnings only. Checked pixels: 0.
- Storm lightning is a short post with a soft gold tip, not a bolt and not a stripe.
- Sign words are not painted into the pictures. They stay in the room data for the game to draw.

**NEXT:** After a yes, a Programmer can import the kit. Until then it stays in `incoming-art/`.

## Look here

- `preview/closeup-green.png`, `closeup-red.png`, `closeup-brown.png`, and the other four tiers — the whole room at 80 px per tile, the failed pass at the same scale, and the approved sample where there is one.
- `preview/*-48.png` — all 59 rooms at 48 px per tile. The fighter is the kitchen sprite, scaled only because the whole picture is.

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
