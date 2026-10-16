# Player character, Batch 1 + revision (belts, bow): technical sheet

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
| `bow` | 22 | 16 | 1.375 s | no | `feet_together: 3`, `bow_down: 5-9`, `bow_hold: 9-13`, `rise: 14-18`, `upright: 18` | **New.** Rei: the feet come together, a 30° bow from the hips, a 0.3 s hold, rise, then back to the guard (frames 19–21). **Revision:** the head stays up, eyes on the partner. |
| `defeat` | 16 | 12 | 1.333 s | no | `ouch: 1`, `sink: 5-10`, `kneel: 11`, `hold: 15` | **New.** A soft "Ouch!", then he sinks to one knee. **Hold the last frame** (`holdLastFrame: true`) during the fade. |

**Bow and the game's timing:** the game's placeholder bow takes 0.9 s (`BOW.ms` in `packages/sim/src/config.ts`, looks only). To keep the full bow, set it to 1375. To stay near 0.9 s, play frames 3–18 (1.0 s) or play all 22 frames at 24 fps (0.92 s).

## Layers (draw bottom to top)

Every belt layer is neutral (light grey or white) and gets a multiply tint chosen per belt. **The ready-made table is `beltStyles` in `sprites/player.json`:** one entry per Action Zone belt, with the tint for each layer. A layer that isn't listed for a belt is not drawn.

| Order | Layer | Tint | When to draw it | What it is |
| --- | --- | --- | --- | --- |
| 0 | `body` | none | always | Skin, face, hair |
| 1 | `gi` | gi colour | always | Jacket and pants |
| 2 | `belt` | `belt.color`; a black `belt.color` becomes `#26272f` | always | The belt, 0.08 tiles tall (was 0.072) |
| 3 | `belt-sheen` | `#a2a6b6` | black belt (`belt.color` black) only | Bright top edge, so a black belt reads as a belt |
| 4 | `belt-center` | `belt.color2`; a black `color2` becomes deep black `#111116` | two-colour belts only | Centre stripe, 0.036 tall (45% of the belt) |
| 5 | `belt-center-edge` | (`#ece6d8`) | **not used** in the chosen style | Thin separator around the centre stripe (option B; kept in case it's wanted later) |
| 6 | `belt-rim` | `#2e2a3a` (dark), or `#c9ccd6` (light) when `belt.color` is black | **always** | Rim just above and below the belt and the knot |
| 7–10 | `belt-tape1-edge`, `belt-tape1`, `belt-tape2-edge`, `belt-tape2` | as in the test | by stripe count | Rank stripes, unchanged |

- "Black" means luminance below 40, where luminance = 0.3 R + 0.59 G + 0.11 B (0–255). Fixtures black is `#1a1a1a`.
- Overlays (orders 3–10) are drawn over a complete belt; there are no holes under them. `belt-rim` is not optional (`optional: false`).
- Why these tints: the dark rim makes light belts (white especially) stand out on a light gi. A black belt next to the dark outline needs the opposite: a light rim, a slightly lighter black and a sheen. The black centre stripe sits between two coloured bands, so it can be truly black. The options compared are in `preview/belt-chart.png`.
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
    --new incoming-art/player-character/sprites --options A,B,C --old-label current --new-label option \
    --out incoming-art/player-character/preview/belt-chart.png      # --old: the Batch 1 sheets (git a47718a)
python3 incoming-art/tools/make_still.py --old <Batch 1 sheets> --new incoming-art/player-character/sprites \
    --anim bow --frames 11 --dirs E,W,S,SE --scale 2 --old-label "before (eyes down)" --new-label "after (eyes up)" \
    --out incoming-art/player-character/preview/bow-side-before-after.png
```

- The full render takes about 9 min (every layer of every frame in 8 directions).
- Without `--profile player`, the build script still makes the approved test exactly. I re-rendered it and it matched pixel for pixel.
- The new pose numbers are in the `if PLAYER:` block of the build script: `S_*` (strike), `jab_pose`, `ATTN`/`bowed` (bow; `head_rot` keeps the face forward), and `OUCH`/`SAG`/`KNEEL` (defeat).
