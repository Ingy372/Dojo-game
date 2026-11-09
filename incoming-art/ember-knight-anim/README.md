# Ember Knight — idle, walk, attack, and the shift (all 8 directions)

Stable label: **Ember Knight — shifted form**.

**Warm Shield** is a **PLACEHOLDER** name. It is not an id.

These sheets are **not for import** until the Manager approves them. No game code was changed.

## Delivery Note

**ITEM:** J16-EMBER-ANIM. The Ember Knight in all 8 directions, with idle, walk, attack, and the existing form-shift timing.

**WHAT:** Pass 3, after the Manager's review of `e166dd1c`. Earlier previews are in `superseded/sample-1/` and `superseded/sample-2/`. Same camera and 512 px frames. The walk now has two stubby boots stepping under the hem and a bigger bob, and it is marked 1.6 tiles a second for the Programmer to tune. The weapon is a blade with a crossguard. The hit keeps the blade visible and adds a bold warm-gold arc. No shield bash or shield rush sheets.

| Animation | Frames | fps | Length | Sheet |
| --- | --- | --- | --- | --- |
| Idle | 8 | 8 | 1.0 s, loops | `sprites/ember-knight_idle.png` |
| Walk | 10 | 30 | 0.3333 s, loops | `sprites/ember-knight_walk.png` |
| Attack (ember slash) | 20 | 10 | 2.0 s, once. Hit on frame 9 (0.9 s) | `sprites/ember-knight_attack.png` |
| Shift | 5 sample times | not a film | 1.5 s (1.0 s glow, then 0.5 s settle) | `sprites/ember-knight_shift.png` |
| Shift, Reduced Motion | 5 sample times | not a film | same 1.5 s, no ring or steam | `sprites/ember-knight_shift-reduced.png` |

Every sheet is 512 × 512 per frame. Rows are N, NE, E, SE, S, SW, W, NW. Columns are frames. Straight alpha. Feet at x 256, y 435.2.

**WHY:** Jay approved the full animation scope. The old pack only faced the camera and had no walk or attack.

**DECIDE:** See the open questions at the bottom. Nothing here should be imported yet.

**NEXT:** The Manager looks at the preview, then says if this can be imported. Pause after this delivery.

## Look here

- `preview/sheet.png` — all 8 directions, one idle frame, one walk frame, and the slash.
- `preview/idle-S.gif` — facing the camera, 8 fps.
- `preview/walk-S.gif` — facing the camera. A GIF can only step in hundredths of a second, so this is 3/100 s per frame (a little faster than the 30 fps sheet).
- `preview/attack-S.gif` — ember slash, 10 fps.
- `preview/shift-S.gif` — the 1.5 s shift, with the holds at 0.00, 0.50, 1.00, 1.25 and 1.50.
- `preview/attack-closeup.png` — all 20 attack frames, large, facing the camera.

## How it was checked

`preview/check-40.png` is the walk, the hit, and the back view at 40 px tall. The boots and the bob are visible at that size, and the walk does not match the idle. The hit keeps the blade, with a warm-gold arc beside it. From behind, the hilt is a crossguard, not a stick. Danger-red pixels on every sheet: 0.

## Rebuild

```
blender -b incoming-art/ember-knight-shift-drafts/source/ember-knight-shift-b.blend \
    -P incoming-art/ember-knight-anim/source/render_ember_anim.py -- \
    --out incoming-art/ember-knight-anim

blender -b incoming-art/ember-knight-shift-drafts/source/ember-knight-phase3.blend \
    -P incoming-art/ember-knight-anim/source/render_ember_anim.py -- \
    --out incoming-art/ember-knight-anim --only before

python3 incoming-art/ember-knight-anim/source/make_preview.py
```

`source/ember-knight-anim.blend` is that scene after the pivots and the shift pieces (ring, steam, embers) were added. The poses live in `render_ember_anim.py`, which is the reusable script.

## Decided by the Manager

- Walk speed is 1.6 tiles a second. It is in the manifest. The Programmer tunes playback.
- No shield bash or shield rush sheets.
