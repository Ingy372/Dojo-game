# L8-A1: Seal stage rings, Lock (wrist) medallion, hold ring

From `drafts/planning/L8-SPEC.md`, section 6 (board 3da65e0a). **Not imported.** This is a draft for the Manager's art gate.

## What's here
| File | What it is | How the game uses it |
|---|---|---|
| `sprites/stage-rings/stage-{2,3,4}.png` (+ `@2x`) | One shared ring per stage, for every family. Stage 2 is a silver band, stage 3 adds 4 pearls, and stage 4 has 8 pearls plus 8 small points. Stage 1 has no ring. | 128 x 128 (256 at @2x), the same size and centre as the family medallions. **Draw it BEHIND the medallion** (ring first, then the medallion), so it never covers a fist or a foot. Stage from rank: 1 / 3 / 6 / 9. |
| `sprites/medallions/lock-wrist.png` (+ `@2x`) | Base medallion for Lock group B (wrist locks): the student's two hands fold a shadow creature's paw down at the wrist, with a curved arrow for the fold | Same kit, size and 8 px margin as `icons-slots/` (PB-07). Rim indigo `#6870cc`, a placeholder Lock colour |
| `sprites/hold-ring/hold-ring-{back,front}.png` (+ `@2x`) | The hold ring on a held enemy: a pale periwinkle ground ring with 4 clasps that close a little on the pulse | 6 frames in one row, 96 x 48 per frame (80 px per tile), 8 fps, looping. Anchor (48, 24) = the enemy's feet. Draw order: back, enemy, front. Scale it to about 2.6 x the enemy radius. |
| `sprites/hold-ring/hold-ring-{back,front}-static.png` | The same ring with no pulse | For reduced motion |
| `sprites/l8.json` | Sizes, anchors, draw order and frame timing | |

**Colours:** there's no gold or yellow in the rings or the hold ring, because Jay found yellow confusing next to the yellow ! (Nov 16). Yellow is also used for GREAT! and the dizzy stars. The rings are pearl silver. The hold ring is periwinkle `#94a0ff` with a dark indigo outline `#1e205a`, so it reads on both the light floor and the dark shadow creatures. There's no red anywhere (checked).

## Previews (`preview/`)
- `01-stages-all-families-1x.png` (plus `-2x` and `-grey`): Counter, Guard, Disarm and Lock (wrist) at stages 1 to 4, large and at phone size (48 and 32 px).
- `02-lock-wrist-medallion.png`: the new medallion next to the existing set.
- `03-hold-ring-fight-667x375.png` (plus `-3x-closeup` and `-grey`): a game-size fight. Two swarmers are held, one is only staggered (gold dizzy stars), and one is idle.
- `04-hold-ring-frames-2x.png`: the 6 pulse frames.
- `05-stages-large-2x.png`: the four stages, large.

## Rebuild
```
python3 incoming-art/lock-stages-l8/source/build_l8.py      # sprites + l8.json
python3 incoming-art/lock-stages-l8/source/make_previews.py # previews
```
Needs `incoming-art/icons-slots/` (the medallion kit), plus `tower-rooms/` and `enemies-tier1/swarmer/` for the fight preview. Everything is my own work, with no outside assets.
