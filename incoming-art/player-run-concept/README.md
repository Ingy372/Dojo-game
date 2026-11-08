# Player run — motion concept (body A)

This is a **preview of how a run could move**. It is not art to put in the game.

It uses the existing player (body A), the same camera, the same 8 directions, and the same timing as the walk Jay kept. Only the motion changes: a forward lean, the opposite arm and leg, a light bounce, and a little extra swing in the belt and sleeves.

## What is here

| Path | What it is |
| --- | --- |
| `source/player_a_run.blend` | The player model with a new `run` action. The `walk` action is still in the file, unchanged. |
| `source/build_run.py` | Rebuilds that `run` action from the walk. |
| `source/make_preview.py` | Stacks the layers and writes the preview pictures and `preview/CHECK.txt`. |
| `sprites/` | 8 layer sheets plus `player-a.json` (the manifest). |
| `preview/` | The pictures to look at. |

## How to look

- `preview/run-front-side-back.mp4` — front, side, and back, **exactly 30 frames a second**, for 2 seconds. Top row is the current walk. Bottom row is this run. The floor grid scrolls at the walk speed (4.5 tiles a second) so a planted foot can be judged against the lines.
- `preview/run-front-side-back.gif` — the same picture. A GIF can only step in hundredths of a second, so each frame is 3/100 s (about 33 pictures a second), a little faster than the sheets.
- `preview/phone-front-side-back.gif` — the same loop at about the size the game draws (the game uses 48 px per tile; these sheets are 80).
- `preview/phone-s-e-n.png` — all 10 frames, front / side / back, at that same phone size.
- `preview/sheet-all-8.png` — every direction and every frame, stacked.
- `preview/strip-walk-vs-run.png` — walk above, run below, one row pair per direction.
- `preview/before-after-closeup.png` — three poses, larger.
- `preview/inspect-8dir.png` — all 8 directions at five points in the loop.
- `preview/CHECK.txt` — the measurements.

## Rebuild

```
blender -b incoming-art/player-custom/source/player_custom_a.blend \
    -P incoming-art/player-run-concept/source/build_run.py -- \
    --out incoming-art/player-run-concept/source/player_a_run.blend

blender -b incoming-art/player-run-concept/source/player_a_run.blend \
    -P incoming-art/tools/render_sprites.py -- \
    --out incoming-art/player-run-concept/sprites --name player-a \
    --anims run --height 160 --anchor-y 0.856 \
    --layers body,skin,gi,belt,belt-sheen,belt-rim,face-01,hair-01

python3 incoming-art/player-run-concept/source/make_preview.py
```

The render line is the house sprite tool (`incoming-art/tools/render_sprites.py`). Frame size, anchor, and directions match the walk sheets already in `incoming-art/player-custom/sprites/body-a/`.
