# Home Dojo (Batch 3): technical sheet

**Status: draft until Jay approves.** The room, all 11 decorations and the mess pieces, built by `source/build_home_dojo.py` and rendered with the shared `tools/render_static.py`. Same toon look and the same 35° camera as the characters.

```bash
blender -b -P incoming-art/home-dojo/source/build_home_dojo.py -- --out $PWD/incoming-art/home-dojo/source/home_dojo.blend
blender -b incoming-art/home-dojo/source/home_dojo.blend -P incoming-art/tools/render_static.py -- --out incoming-art/home-dojo/sprites
python3 incoming-art/tools/make_static_preview.py --sprites incoming-art/home-dojo/sprites --out incoming-art/home-dojo/preview --gallery gallery-1x.png
```

## The grid rule (important for Claude Code)

- The game's world is a top-down grid, so every piece is built so that **a floor tile is exactly 80 × 80 px** in the pictures. Heights show at about 65.5 px per tile.
- Everything lines up with `content/dojo/home-dojo.json` and the decoration footprints in `content/dojo/decorations.json`.
- All sizes, anchors and footprints are in `sprites/static.json`:
  - `size`: the image size.
  - `anchorPx`: the point of the image that sits on the anchor spot.
  - `footprint`: in tiles.
  - `place`: floor or wall.
  - `groundRect`: the image's ground area in tiles.

## The room: `room_*.png` (1200 × 824 px)

- **Size:** 15 × 10 tiles plus 0.3 tile of wall above the top row. `anchorPx` (0, 24) = the grid's top-left corner (tile 0, 0).
- **Layers:**
  - `room_floor.png`: drawn first, under everything. Wooden plank floor, the back wall (dark wainscot, plaster panels between posts, a beam), the side walls seen from above, and the threshold and door mat at the door.
  - `room_notice-board.png`: on top of the floor. Cork board with pinned notes on the top wall at column 8 (`board` in home-dojo.json). On its own layer so the game can highlight it.
  - `room_wall-front.png`: **drawn above the characters and decorations.** The low front wall and the door posts. The door gap is at the bottom centre (column 8).

## Decorations: one picture each, footprints from decorations.json

**Anchors:**
- **Floor items:** `anchorPx` = the bottom-centre of the footprint. Sort them with the characters by the footprint's bottom row.
- **Wall items:** `anchorPx` = the bottom-centre of their top-wall cell (where the wall meets the floor).

| id | Footprint | Picture | Notes |
| --- | --- | --- | --- |
| `training-mat` | 2×2 floor | 184 × 186 | Blue mat with a light rim |
| `practice-mat` | 2×2 floor | 184 × 186 | Green mat |
| `weapon-rack` | 2×1 floor | 184 × 190 | Wooden rack with **wooden practice weapons only**: 2 bokken (rounded wooden swords) and 2 jo staffs. Nothing sharp |
| `wooden-bench` | 2×1 floor | 184 × 146 | |
| `punching-bag` | 1×1 | | Standing bag on a round base, soft red with cream bands |
| `stone-lantern` | 1×1 | | Tōrō with a warm glowing window |
| `bonsai-tree` | 1×1 | | Blue pot, curved trunk, 3 leaf pads |
| `bamboo-pot` | 1×1 | | Potted Bamboo: 4 stalks with nodes and leaves |
| `taiko-drum` | 1×1 | | Drum on a stand with two sticks |
| `dojo-banner` | wall | | Red banner with **心** (*kokoro*: heart, spirit, as in "a calm, strong heart") in a white circle |
| `calligraphy-scroll` | wall | | Hanging scroll with **道** (*dō*: "the way", the path of practice, as in karate-dō) and a small red seal |

- The kanji are set in BIZ UDPMincho Bold (SIL Open Font License; see `../SOURCES.md`), rendered into the picture.
- Picture sizes are in `static.json`.

## Mess (config `DOJO`): each with its clean version

| Sprite | Draw | Clean version |
| --- | --- | --- |
| `dust-1`, `dust-2`, `dust-3` | Centred on a dust spot (`anchorPx` = cell centre): fluffy dust bunnies | Nothing (the floor) |
| `leaves-1`, `leaves-2`, `leaves-3` | Centred on a leaf spot: 3–5 fallen leaves | Nothing |
| `training-mat-scuffed`, `practice-mat-scuffed` | Over the mat, same anchor and size: light scuff streaks | The mat without the overlay |
| `weapon-rack-crooked` | A sheet of 3 frames: 1, 2 or 3 weapons knocked crooked (`rackCrookedAt` has 3 levels) | `weapon-rack` |

## Previews

- `preview/review-1-room-all-decorations.png`: start here.
- `preview/review-2-decorations-2x.png`: start here.
- `preview/review-3-room-messy.png`: start here.
- `preview/room-starter.png`: the starter gifts placed as in a new dojo.
- `preview/gallery-1x.png`: every sprite at real size.
