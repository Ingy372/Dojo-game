# Player character, Batch 1 (samples): technical sheet

**Status: draft until Jay approves.** This is the approved one-character test (`../character-test/`, kept as the reference) with the Batch 1 fixes, plus 3 sample animations: jab, bow and defeat. **Claude Code: start here.**

Everything is built by script:
- `../character-test/source/build_character.py --profile player`
- `../tools/render_sprites.py`, the same house camera and settings as the test.

## Frames and timing (all in `sprites/player.json`)

- **Frame:** 128 × 128 px, transparent PNG.
- **Feet point:** x 64, y 104.96.
- **Scale:** 80 px per tile.
- **Sheets:** rows are N, NE, E, SE, S, SW, W, NW; columns are frames (counting from 0).

| Animation | Frames | fps | Length | Loops? | Key frames (from 0) | How to play it |
| --- | --- | --- | --- | --- | --- | --- |
| `idle` | 8 | 8 | 1.0 s | yes | | Same as the test |
| `walk` | 10 | 30 | 0.333 s | yes | | Same as the test (jog, `groundMotion` in the JSON) |
| `strike` | 8 | 16 | 0.5 s | no | `impact: 4` | **Fixed:** reads from the front (see below) |
| `counter` | 12 | 16 | 0.75 s | no | `block: 0-7`, `block_hold: 3-7`, `counter_hit: 8` | Same as the test |
| `jab` | 6 | 20 | 0.3 s | no | `impact: 2` | **New.** The automatic basic attack. Play once per attack. It starts and ends on the guard (frame 0 = idle frame 0), so after 0.3 s it hands back to idle until the next attack 0.6 s later (`repeatEverySec: 0.6`). |
| `bow` | 22 | 16 | 1.375 s | no | `feet_together: 3`, `bow_down: 5-9`, `bow_hold: 9-13`, `rise: 14-18`, `upright: 18` | **New.** Rei: the feet come together, a 30° bow from the hips, a 0.3 s hold, rise, then back to the guard (frames 19–21). |
| `defeat` | 16 | 12 | 1.333 s | no | `ouch: 1`, `sink: 5-10`, `kneel: 11`, `hold: 15` | **New.** A soft "Ouch!", then he sinks to one knee. **Hold the last frame** (`holdLastFrame: true`) during the fade. |

**Bow and the game's timing:** the game's placeholder bow takes 0.9 s (`BOW.ms` in `packages/sim/src/config.ts`, looks only). To keep the full bow, set it to 1375. To stay near 0.9 s, play frames 3–18 (1.0 s) or play all 22 frames at 24 fps (0.92 s).

## Layers (draw bottom to top)

| Order | Layer | Tint? | Always drawn? | What it is |
| --- | --- | --- | --- | --- |
| 0 | `body` | no | yes | Skin, face, hair |
| 1 | `gi` | gi colour | yes | Jacket and pants (neutral grey) |
| 2 | `belt` | `belt.color` (black as charcoal `#3c3c44`) | yes | The belt (neutral grey), now 0.072 tiles tall (was 0.05) |
| 3 | `belt-center` | `belt.color2` | two-colour belts only | Centre stripe, **now 0.032 tiles tall, 44% of the belt (was 0.013, 26%)** |
| 4 | `belt-rim` | **no** | **yes, always** | **New:** dark `#2e2a3a` rim just above and below the belt, and above and below the knot, so a white belt reads on a white gi |
| 5–8 | `belt-tape1-edge`, `belt-tape1`, `belt-tape2-edge`, `belt-tape2` | as in the test | by stripe count | Rank stripes, unchanged |

- `belt-rim` is an overlay, so the belt has no hole under it, but it is **not optional** (`optional: false` in the JSON). Draw it after the belt and the belt-center, every time.
- Everything else works as in `../character-test/README.md`: multiply tint, a shared pixel grid, and tint guidance in the JSON.

## Re-render (from the repository root, Blender 4.2 LTS)

```bash
blender -b -P incoming-art/character-test/source/build_character.py -- \
    --profile player --out $PWD/incoming-art/player-character/source/player_character.blend
blender -b incoming-art/player-character/source/player_character.blend \
    -P incoming-art/tools/render_sprites.py -- --out incoming-art/player-character/sprites --name player
python3 incoming-art/tools/make_preview.py --sheets incoming-art/player-character/sprites \
    --out incoming-art/player-character/preview --gif-anims none --anim-gifs jab,bow,defeat,strike
python3 incoming-art/tools/make_compare.py --old incoming-art/character-test/sprites \
    --new incoming-art/player-character/sprites --anim strike --dirs S,SE,SW --seconds 3 \
    --old-label "before (approved test)" --new-label "after (Batch 1)" \
    --out incoming-art/player-character/preview/strike-before-after.gif \
    --strip incoming-art/player-character/preview/strike-S-before-after.png
python3 incoming-art/tools/make_belt_chart.py --old incoming-art/character-test/sprites \
    --new incoming-art/player-character/sprites --out incoming-art/player-character/preview/belt-chart.png
```

- The full render takes about 6.5 min (5,904 renders).
- Without `--profile player`, the build script still makes the approved test exactly. I re-rendered it and it matched pixel for pixel.
- The new pose numbers are in the `if PLAYER:` block of the build script: `S_*` (strike), `jab_pose`, `ATTN`/`bowed` (bow), and `OUCH`/`SAG`/`KNEEL` (defeat).
