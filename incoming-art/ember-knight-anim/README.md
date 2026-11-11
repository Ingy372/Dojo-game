# Ember Knight — approved-design exports

**READY FOR MANAGER REVIEW, NOT IMPORTED.**

Stable label: **Ember Knight — shifted form**.

**Warm Shield** is a **PLACEHOLDER** name. It is not an id.

The Manager relayed Jay's words from Nov 10: "Both the strike icons and the Ember Knight look good." This note records that relay. It is not a personal witness of Jay saying it. It does not authorize import or merge.

No game code was changed. No shield bash or shield rush sheets.

## Delivery Note

**ITEM:** J16-EMBER-ANIM. Approved-design exports of the Ember Knight, all 8 directions. READY FOR MANAGER REVIEW, NOT IMPORTED.

**WHAT:** The approved poses and timing are unchanged. Sheets are straight-alpha PNG, 512 × 640 a frame, feet at x 256, y 435.2. Rows are N, NE, E, SE, S, SW, W, NW. Columns are frames. Camera is orthographic, 35° down, 3.15 tiles across. Draw a frame at 151 × 189 px in the game (48 px per tile). The older 512-tall reduced-motion shift is in `superseded/sample-6/`; the export pads that same picture to 640 px, with the extra space below the feet. Nothing was redrawn.

| Animation | Frames | fps | Length | Hit or mark | Sheet |
| --- | --- | --- | --- | --- | --- |
| Idle | 8 | 8 | 1.0 s, loops | — | `sprites/ember-knight_idle.png` |
| Walk | 10 | 30 | 0.333 s, loops | — | `sprites/ember-knight_walk.png` |
| Attack (ember slash) | 20 | 10 | 2.0 s, once | hit frame 9 (0.9 s) | `sprites/ember-knight_attack.png` |
| Spark Shield | 16 | 10 | 1.6 s, once | shield forward at frame 8 | `sprites/ember-knight_spark-shield.png` |
| Forge Sweep | 16 | 10 | 1.6 s, once | hit frame 8 | `sprites/ember-knight_forge-sweep.png` |
| Shift | 5 sample times | not a film | 1.5 s (1.0 s glow, then 0.5 s settle) | — | `sprites/ember-knight_shift.png` |
| Shift, Reduced Motion | 5 sample times | not a film | same 1.5 s, no ring or steam | — | `sprites/ember-knight_shift-reduced.png` |

The walk sheet is marked 1.6 tiles a second so it can be played back. That number is a **placeholder**, not final gameplay tuning.

**WHY:** The Manager relayed Jay's Nov 10 words: "Both the strike icons and the Ember Knight look good." The relay is the record. It was not personally witnessed. The exports are the approved design, ready for the Manager to review, and not imported.

**DECIDE:** These approved-design exports are READY FOR MANAGER REVIEW, NOT IMPORTED. Warm Shield is still only a placeholder name. 1.6 tiles a second is not a final speed. This note does not authorize import or merge.

**NEXT:** The sheets stay in `incoming-art/` for the Manager's review. Import or merge would need a separate go-ahead. This delivery does not include room art.

## Handoff

Status: approved-design exports, READY FOR MANAGER REVIEW, NOT IMPORTED.

The Manager relayed Jay's Nov 10 words: "Both the strike icons and the Ember Knight look good." Not personally witnessed. No authorization here to import or merge.

- Delivery note: this file.
- Manifest: `sprites/ember-knight.json` (`notForImport` is true).
- Pictures and the Blender scene are unchanged by this text refresh.

## Look here

- `preview/approved-40.png` — idle, a walk step, the slash, Spark Shield, Forge Sweep, the shift, and the back view, each 40 px tall.
- `preview/idle-S.gif`, `preview/walk-S.gif`, `preview/attack-S.gif`, `preview/spark-shield-S.gif`, `preview/forge-sweep-S.gif` — facing the camera. The shift is the shift frame on `preview/approved-40.png` and `sprites/ember-knight_shift.png`.
- `preview/attack-closeup.png`, `preview/spark-shield-closeup.png`, `preview/forge-sweep-closeup.png`.
- `sprites/ember-knight.json` — frame size, anchor, camera, frame counts, fps, and hit frames.

## How it was checked

Checked the sheets in `sprites/`, not a stand-in. Every move is 8 directions and the frame count in the table. Every frame is 512 × 640, RGBA, with clear corners. Danger-red pixels (red over 180, green and blue under 70): 0 on every sheet. The tightest opaque edge is 23 px (Forge Sweep, facing east, frame 7). Every other move is farther in. The reduced-motion shift, after the 640 pad, is 81 px in at the tightest. Feet stay at y 435.2. The round body, stubby boots, shield, and blade match the approved pass. At 40 px the boots, the slash, the shield sparks, and the floor arc still read. No stray specks off the body.

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

`source/ember-knight-anim.blend` is the scene after the pivots and the shift pieces were added. The poses live in `render_ember_anim.py`. Do not rerun this over the approved sheets unless the frames folder is a fresh render of this same script.

## Decided already

- No shield bash or shield rush sheets.
- Warm Shield stays a placeholder.
- The shift clock is unchanged: 1.5 s, with a quieter reduced-motion version.
