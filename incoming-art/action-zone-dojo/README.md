# Action Zone dojo: 3 approved samples + the A4-DOJO game-ready batch

**Jay approved all three samples (outside, seating, inside at `d01b911`) with one change: the sofa in front of the handprint wall is removed (`8aed75d8`; it was the only sofa, a teal `#2bb3b3` one). The look is otherwise unchanged. The game-ready batch is described first; the sample notes follow it.**

Jump to: [Game-ready batch](#game-ready-batch-a4-dojo) | [The samples](#the-3-samples-approved)


## Game-ready batch (A4-DOJO)

Everything is in `sprites/` (art + JSON) and `previews/` (review pictures). Art is @2x (80 px per tile) like the town square, and the game import shrinks it like the other static art. Only the town-slot building also has a ready 1x copy (`sprites/1x/`). Camera, light and outline are the same as the samples: ortho, looking north 35 degrees down; a ground tile is exactly 80 x 80 px; a height of 1 tile shows as 80 x cos35 = 65.5 px.

**Pixel rule (every layer and sprite of one frame):** `px = tile00Px + (col*80, row*80 - z*65.5)`.

### 1. Inside: one wide scrolling room (`inside-main-floor`)
Frame **2272 x 1696** px (27 x 19 tiles of floor), tile (0,0) top-left at **(56, 168)**. All four layers are the full frame, so they stack with no offsets:

| File | Layer | What is on it | Draw |
|---|---|---|---|
| `sprites/inside-main-floor_floor.png` | floor | lobby tile, blue mats, the red square with the school logo, thresholds, door mat, the seating decks, the gear-box base | first |
| `sprites/inside-main-floor_walls.png` | walls | the north wall + its wall art, the side wall strips, the back drywall (nothing above it) | on the floor |
| `sprites/inside-main-floor_props.png` | props | fixed wall-hugging pieces: creed boards, flag, mural frames, shelf, crash mats | under every character |
| `sprites/inside-main-floor_foreground.png` | foreground | the front wall: curb, door posts, door header, open door leaves | **above characters** (a student walking in/out passes behind it) |

**Foreground sprites** (per-object foreground, in `static.json` with `place: "foreground-sprite"`, `drawLayer: "foreground"`, `basedOn`, `sortRow` and `foregroundRule`; also listed in `inside-room.json` under `foregroundSprites`): `seats-back` (the 24 seat backs of the parent seating), `bag-black-top`, `bag-blue-top`, `bag-red-top` (each bag from the band at 1.25 tiles up). Each one is an **exact copy of pixels that are already in its base sprite** (`seats`, `bag-*`), so placing it changes nothing on its own. **Rule:** draw the base sprite y-sorted as usual, then draw the foreground sprite **above a character only when that character's footprint (feet) row is less than the sprite's `sortRow`** (the character is north of / behind the object). A character in front of (south of) the seats or bags must not be covered, or the student would lose their head to the sprite. Same anchor tile as the base sprite, so use the same placement. The full-frame `foreground` layer (the front wall) stays always-above-characters.

**Prop sprites** (cropped, each with an anchor and a `sortRow`, in `sprites/static.json`): `pro-counter`, `gear-box`, `seats` (parent seating), `bag-black`, `bag-blue`, `bag-red`, `bench`, `plant`, `trash-can`, `whiteboard`, wings `wing-west`/`wing-east`, and the wall decals `target-wall`, `back-doors`, `cross-door-a`, `cross-door-b`, `handprint-wall`. Sprite files are named `<id>_<id>.png`. In `static.json`: `size`, `roomPx` (top-left in the room frame), `anchorPx` (the foot point inside the sprite), `anchorTile`, `footprintRect` [col0, col1, row0, row1], `sortRow`.
- Draw order: floor, walls, props, **wall decals** (sortRow = wall row + 0.01), then sprites and characters sorted by `sortRow` (the bottom row of the footprint), then the full-frame foreground layer, then the foreground sprites (seat backs, bag tops) above each character that is north of them (see above).
- The sprite sheet `previews/inside-sprite-sheet.png` shows all of them.
- **Scope notes:** `target-wall` is only the yellow targets (x 0.4 to 6.6); the mural, creed boards and flag are in the props layer. The wing sprites include the little door stubs, so their pixel box reaches row 12.38 while their `sortRow` is 9.95 (use `sortRow`, not the bottom of the box).

**Collision and walking (`sprites/inside-room.json`):** `tiles` is a 27 x 19 character grid (legend in `tileLegend`; `walkableChars` = `.Dgmr`), `blockers` are rects [col0, col1, row0, row1] for the walls, wings, counter, gear box, seats, bags, mats, bench, plant and trash can, `spawn` (13, 17), `exit` (the front-door cells, to the town square), `zones`, `interactables` (11, each with a `kind`, `approachTile`, `approachFacing`, `footprintRect` and a `tapRectPx` as [x0, y0, x1, y1] in room px), `seatSlots` (24 seats with tier, tile, height and facing), `doorLeaves` (the two open door leaves are thin and left walkable; use the rects for the exact squeeze), `drawOrder`, `scroll` (the camera clamps to the frame). Check it with `previews/inside-collision-overlay.png`.

**Check against the approved sample:** the layers stacked equal the approved inside picture (minus the sofa) except thin outline/anti-alias lines where layers meet: 10,259 of 3.85 M px differ by more than 40 (0.27 percent, mean 0.388), the biggest spots being the north-wall top strip and the front-wall curb. `previews/inside-game-composite@2x.png` is the stack.

### 2. Outside: full entrance view, day and dusk (`outside-entrance`)
Frame **1120 x 712** px @2x (14.0 x 8.9 tiles), tile (0,0) at **(0, -8)**. Every layer is the full frame (`sprites/outside-entrance.json`: frame, states, drawOrder, building, front-door, overlays, blockers, spawn, lightSources).

| File | What | Draw |
|---|---|---|
| `outside-entrance-<day or dusk>_ground.png` | the grass, walk, pad and kerb | 1 |
| `outside-entrance-dusk_pools.png` | dusk only: the warm light pools on the ground, one under each real source | 2 |
| `outside-entrance-<state>_building.png` | the tan metal building, roof, sign, doors, windows | 3 (after trees 1 and 2, which sit behind it) |
| `outside-entrance-<state>_phone.png` | the **blank** phone-number bar, swappable overlay | 4 |
| `outside-entrance-<state>_address.png` | the **blank** house-number plate, swappable overlay | 5 |
| `outside-<id>_<day or dusk>.png` | 12 cropped scenery sprites: `bin`, `bench-a`, `bench-b`, `chair-a`, `chair-b`, `bed-a`, `bed-b`, `shrub`, `palm`, `tree-1`, `tree-2`, `tree-3` (anchor, footprint and `sortRow` in `static.json`) | sorted by `sortRow` (tree-1 and tree-2 go behind the building; bin 6.7, bench-a 6.65 ... bed 7.9) |
| `outside-entrance-dusk_glow.png` | dusk only: the soft halo round the lit panes and the lamp lens | last |

- **Front door (tap to enter):** `tapRectPx` [500, 367, 620, 472] in frame px; the student walks to `approachTile` (7.0, 6.6) facing north; target `inside-main-floor`. Spawn when coming back out: (7.0, 8.6).
- **Phone and address:** `rectPx` [340, 331, 452, 344] and [606, 349, 638, 362] in the frame. The PNGs contain only a plain blank bar; the real phone and house number are NOT in the repo. Swap those two PNGs (or draw over the rects) from the git-ignored `source/local_overlay_values.json`.
- **Check against the approved sample:** the day layers stacked vs `samples/outside-face@2x.png`: 877 of 797,440 px differ by more than 40 (mean 0.234); only outline/anti-alias lines. `previews/outside-entrance-{day,dusk}@2x.png` (+ 1x) are the stacks.

### 3. Dusk: where every glow comes from
Dusk is the day art graded by the town-square dusk recipe (blue-violet multiply, darker ground). **The dojo building itself (entrance building + phone/address layers, and the town slot) uses a slightly lighter multiply, (138,129,176) instead of the town's (120,112,165), about 15 percent brighter, so it reads as the landmark;** the ground, pools, glow and scenery keep the town grade, and no new light was added (the Manager's call, see DECIDE), plus light only where a real source exists (listed in `lightSources`): the two windows and the door panes (warm lit panes + a halo + a pool on the ground below each), and the wall lamp. **The wall lamp is a plain box in the approved day picture, so a small lamp lens was added to the dusk render only** (day geometry stays identical to the sample); that lens is the source of the lamp's pool. No glow floats free.

### 4. Town-square dojo slot (`town-slot-dojo`, tap to enter)
The Action Zone building scaled down for the left dojo slot of the approved PR #301 town square (the old green-noren placeholder `dojo0`, at town tile (3.6, 4.4)).
- **Files:** `sprites/town-slot-dojo_day.png`, `sprites/town-slot-dojo_dusk.png` (**440 x 312** @2x; their pixels are 1:1 with the town's @2x art) and `sprites/1x/town-slot-dojo_{day,dusk}.png` (220 x 156, 40 px per town tile).
- **Scale 0.55:** the building is 8 of its own tiles wide, which becomes 4.4 town tiles, so it sits in the slot like `dojo0` did (same ground footprint, a little taller than the market). Line weight matches the town (1 px at 1x, 2 px at @2x).
- **Anchor:** `anchorPx` (220.0, 259.4) is the front-centre on the ground (under the door). Put it on **town tile (3.6, 4.4)**: in the concept picture that is px (3.6 x 80, 4.4 x 80 + 76) at @2x. `footprintRectTownTiles` [1.4, 5.8, 3.0, 4.4]; `sortRow` 4.4.
- **Tap:** `tapRectPx` [44, 104, 396, 259] (@2x; halve for 1x), target `outside-entrance-day` or `-dusk` (use the state that matches the town's time of day).
- **Dusk:** the glow and the ground pools are baked into the dusk sprite (they reach about 0.35 tile round the building and about 1 tile in front). Paste it AFTER the town's dusk grade, not before.
- No ground, scenery or phone/address overlays here (the overlays would be 3 px tall).
- **Preview:** `previews/town-slot-in-town-{day,dusk}.png` and `@2x`: the town square re-rendered without `dojo0` and the sprite placed on it. The town-square files in `town-square-concept/` are not changed (the new `--no-dojo0` flag is opt-in and the default output is byte-identical).

### 5. Phone and address (blank, swappable)
`outside-entrance-{day,dusk}_phone.png` and `_address.png` are the only places the two values go, and they are blank bars here. a grep of `incoming-art/` for the real phone number and the real house number finds nothing (checked at the tip). The earlier commit `af9fd2a` still holds the real values in history (no rewrite was done; the Manager decided a scrub is not needed).

### 6. Red check (branded red expected)
`python3 /workspace/redcheck.py 'sprites/*.png' 'sprites/1x/*.png'`: 63 files, 449,516 red px in total (the two foreground-sprite copies, seats-back 36,978 and bag-red-top 3,561, repeat pixels that are already in `seats` and `bag-red`, so about 408,977 are unique). All of it is the branded red: the red square (floor layer 238,966), gear-box 68,839, seats 52,062, door crosses ~1,590 each, handprint wall 6,338, bag-red 5,931, pro counter 2,323, building sign/roof trim (outside day 8,506), chairs (~2,650 each), the walls layer 4,167 (flag stripes, creed titles). The dusk building is graded a little lighter now, so its sign trim passes the limit too (entrance dusk building 7,547, slot dusk 2,037, slot day 2,615): the same branded red. No other red.

### 7. Rebuild
```
cd source
bash render_all.sh      # the 3 samples + 1x copies (as before)
bash render_game.sh     # the game batch: Blender group renders (one at a time), then make_game_inside.py and make_game_outside.py
# optional town preview:
cd ../../town-square-concept/source
blender -b -P build_town_square.py -- --part town --no-dojo0 --out /tmp/t/town@2x.png
blender -b -P build_town_square.py -- --part town --night --no-dojo0 --out /tmp/t/town_night@2x.png
blender -b -P build_town_square.py -- --part lights --night --no-dojo0 --samples 8 --out /tmp/t/lights_night@2x.png
python3 make_concept.py --far render_far@2x.png --town /tmp/t/town@2x.png --outdir /tmp/t/out --variant day --no-dojo0
python3 make_concept.py --far render_far@2x.png --town /tmp/t/town_night@2x.png --lights /tmp/t/lights_night@2x.png --outdir /tmp/t/out --variant dusk --no-dojo0
python3 ../../action-zone-dojo/source/make_town_preview.py /tmp/t/out
```
(`build_town_square.py` also writes `town-square_<part>.blend` next to itself: run `git checkout` on those files afterwards, and never run two builds of the same part at once.)

---

## The 3 samples (approved)

Samples only, in the Blender toon top-down style of the approved town square (PR #301): `toon_kit` cel shading, inverted-hull outline, ortho camera looking north 35° down, ground on the game grid. 80 px per tile at @2x (the town square scale), 40 px at 1x.

| Sample | File | Size @2x |
|---|---|---|
| 1. Outside face | `samples/outside-face@2x.png` (+ 1x) | 1120 x 712 |
| 2. Inside main floor (rebuilt to Jay's layout) | `samples/inside-main-floor@2x.png` (+ 1x) and `samples/inside-main-floor-layout-diagram.png` | 2272 x 1696 |
| 3. Parent seating | `samples/parent-seating@2x.png` (+ 1x) | 1008 x 736 |

## What is in each
1. **Outside:** tan ribbed metal building with a brown gable roof, red 3D "CMA / MARTIAL ARTS" letters, a small kick-figure badge above them, brown double doors with two glass panes and a push bar, two windows, banners, two blue accessibility plates, benches, two red metal chairs, two flower beds, shrubs, a palm and round trees, a gravel lot with yellow-on-black curb stops.
2. **Inside (rebuilt):** one wide room, top-down, entry at the bottom. Walls end at a flat drywall cap (nothing above it). Read it from the entry door up:
   - **Entry hall** (tan tile, welcome mat, open door leaves, plant, bin, bench).
   - **Left: the PRO SHOP** (blue cloud wall, "PRO SHOP" sign, grid wall with uniform bags and pads, belt rack, black tees, a stylised lion painting, glass counter with gloves, headgear and shoes; no weapons).
   - **Right: the TWO CROSS DOORS** (white doors, blue frames, red crosses; the right one has a blue restroom plate) with the **HANDPRINT WALL** between them (plain red and blue handprints, a wood plaque with the logo and a black belt, a red fire extinguisher).
   - **Straight ahead: the PARENT SEATING**, the approved stadium seats (3 tiers of 8, blue and red), now facing the mat.
   - **Beyond the seating: the RED BOX** that holds the students' gear bags, with a **GAP at EACH end** (left 2.6 tiles wide, right 2.6 tiles wide) where students walk onto the mat. The box is 7.2 tiles long, with 5 bag openings.
   - **On the mat, left (north wall):** the **YELLOW target wall** (12 plain yellow torsos on wood), grip ropes, then the **styles mural** with Jay's real logo and the styles named as on the wall (Karate, Kung Fu, Jiu Jitsu, Tae Kwon Do, Weapons). Beside them: the back double doors, the US flag with a gear shelf, the Class Creed and the belt creed boards (real wording).
   - **On the mat, right:** three **punching bags** (black, blue, red), a whiteboard on a stand, a stack of crash mats.
   - **Floor:** **blue mats** surrounding a big **red square** with **Jay's real school logo** in the centre.
   - `samples/inside-main-floor-layout-diagram.png` is a labelled top-down plan drawn from the same numbers (`source/layout_main_floor.py`), so Jay can check placement.
3. **Parent seating:** 3 stepped tiers of stadium seats alternating blue and red (shifted one seat each row), front rail, side steps, and a few props (bag, bottle, jacket, book, toy basket, four stylised paintings and a clock with no numbers).

## Separate swappable layers
Rendered with the same camera, so they drop straight onto the base picture. The base picture has a blank banner and a blank plate where they go.
- `overlays/outside-phone-layer@2x.png` (+ 1x): the phone number slot on the left banner.
- `overlays/outside-address-layer@2x.png` (+ 1x): the house number slot on the plate by the door.
They are objects tagged `layer=phone` and `layer=address` in the .blend and in `build_action_zone_dojo.py`.

**The committed layers are blank placeholders** (a faint grey bar and a faint brown bar). The real phone number and house number were **removed from the branch tip** in a follow-up commit. They **remain in the history of the earlier commit `af9fd2a`** (the PR's first commit). **The Manager decided a history scrub is not needed (resolved).** No rewrite or force-push was done.

To render the real values locally, make `source/local_overlay_values.json` (git-ignored, never commit it):
```
{"phone": "...", "house_number": "..."}
```
and run `source/render_all.sh`. Leave the file out, or the values empty, to get the blank placeholders.

## Rules followed
- No handprint names at all (Jay's decision): plain handprints only, no names layer.
- Text: sign letters, the style names, and the creed boards, whose words Jay's Manager asked for (read by eye from Jay's wall photos; `source/creed_text.json`; the full-size textures are in `source/textures/`). The two overlay layers stay blank.
- Jay's logo is his own file (`badges-trophies-a3c/source/jay-logo/logo-white.jpg`), cut out by `make_textures.py`. The old plain kick figure is gone from the main floor (the approved outside face is unchanged).
- Likeness reference photos were used for looking only. No photo or crop is in the repo.
- Daylight only. No glows. No weapons or blades in the pro shop. Mural silhouettes show poses only. The yellow men are plain torsos with no faces.
- Branded red (sign, chairs, the red square, red box, seats, banner stripe, flag stripes, door crosses, logo, creed titles, red bag) is Jay's real branding and an exception to the no-red-outside-danger rule. See DELIVERY_NOTE.

## Rebuild
```
cd incoming-art/action-zone-dojo/source
python3 make_textures.py # logo, Class Creed, belt creed and flag pictures into textures/ (needs Pillow, numpy, scipy)
python3 make_layout_diagram.py   # the labelled plan
./render_all.sh          # 3 scenes at 24 samples, writes ../samples, ../overlays, the .blend files, and the 1x copies
blender -b -P build_action_zone_dojo.py -- --scene outside|inside|seating [--samples 24] [--ppt 80]
```
Needs Blender 4.2 and `incoming-art/tools/toon_kit.py`. Letters use Be Vietnam Pro Black (OFL, system font); the script falls back to Blender's default font if it is missing.

## Photo versus description (what conflicted)
See the DELIVERY_NOTE ("Photo conflicts"). Short version: the photos put the yellow men and mural on the WEST side wall and the cubby is plain; I followed Jay's words and unfolded the side-wall art onto the north wall (a north-facing camera cannot see side walls).

## Restored version and the one change (PR #393, latest)
Jay pointed at a specific picture of the inside sample: pro shop on the left, handprint wall and crosses on the right, target wall top-left, bags top-right. That is the **12118dac** layout (checked element by element against the render of that commit). The later fold-out versions (`2ca1dd6`, `396e4ad`, `24b1eb6`) are superseded; they stay in history. Inside PNGs, diagram and `source/` were restored from 12118dac and exactly one thing was changed: **a gap at both ends of the red bag box**. 12118dac already had the left gap (x 7.0 to 9.6); the right gap (x 16.8 to 19.4, same 2.6 width, same threshold strip and arrow) is new. To make room the box was shortened from 9.6-19.4 to 9.6-16.8, its openings went from 7 to 5, and the yellow top bag moved from x 17.3 to 16.2 so it still sits on the box. The rest of the frame is pixel-identical to 12118dac (see the DELIVERY_NOTE). Outside and seating PNGs are byte-identical to before.
