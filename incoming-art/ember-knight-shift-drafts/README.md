# Ember Knight — shifted form (draft B)

**Jay approved the effects. Ready for the Manager to merge. Not imported.**

Stable label: **Ember Knight — shifted form**.

**Warm Shield** is a placeholder name. It is not chosen yet.

Jay approved this effects look. The shape and the eyes are the same as the last B. The armour is dark cool metal with copper accents and orange-gold seams. The 1 second white-gold glow is unchanged. A half-second settle (one ring and a steam puff) comes after it. **Warm Shield** is still only a placeholder name. A and C stay in `superseded/pass-2-three-way/`.

## Approved export

The game-ready sheets are in `sprites/`. They are the same frames as the approved preview. `sprites/EXPORT_CHECK.txt` says the sheet splits back with a difference of 0, and the approved strip matches with a difference of 0.

1. `sprites/ember-knight-shift_normal.png` — Normal, 8 frames.
2. `sprites/ember-knight-shift_reduced.png` — Reduced Motion, 8 frames. The last four are the same still.
3. `sprites/ember-knight-shift.json` — size, anchor, 125 px scale, timing, colours.
4. `HANDOFF.md` — what the Programmer should do, and what is missing.

## What to look at

1. `preview/review-b-vfx-strip.png` — the approved still frames. Start here.
2. `preview/review-b-vfx-floor.png` — the same ideas at 125 px on the real tower floor.
3. `preview/review-b-vfx-closeup.png` — steam, a brighter core, and the still Reduced Motion core.
4. `preview/quality-check-vfx.txt` — red-pixel and edge check on those frames.
5. `DELIVERY_NOTE.md` — what is still open.

The earlier still comparison is `preview/review-b-ingame-floor.png` and `preview/review-b-closeup.png`.

There is no `sprites/` folder. These are concepts, not game art.

## Floor

The floor in those two pictures is the game's own tower art, not a flat stand-in.

- Files: `incoming-art/tier3-ember-kitchens/sprites/floor-big_floor-big.png`, `floor-quad_floor-quad.png`, `floor-worn_floor-worn.png`
- The game loads them as the `tower-t3` pack (Ember Kitchens).
- `apps/client/src/art/tiers.ts` gives that pack to any belt that does not have its own tower art yet. The Ember Knight is the red guardian, and red has no tower pack of its own, so this is the floor the game draws.
- `GameScene.ts` uses `TILE = 48` and mixes the three tiles from the tile's position. The review uses that same mix.

## Rebuild

From the repo folder:

```
blender -b -P incoming-art/ember-knight-shift-drafts/source/build_ember_shift.py -- \
  --out incoming-art/ember-knight-shift-drafts/renders --kinds b --samples 24
python3 incoming-art/ember-knight-shift-drafts/source/make_b_floor_review.py
blender -b -P incoming-art/ember-knight-shift-drafts/source/build_b_fx.py -- \
  --out incoming-art/ember-knight-shift-drafts/layers --samples 12
python3 incoming-art/ember-knight-shift-drafts/source/make_b_vfx_review.py
```

Effect layers (transparent, not the knight): `layers/fx-core.png`, `layers/fx-rim.png`, `layers/fx-steam-00.png` to `fx-steam-05.png`. Model: `source/ember-knight-shift-b-fx.blend`.

Blender files in `source/`:

- `ember-knight-phase3.blend` — the phase-3 knight, rebuilt from the concept script
- `ember-knight-shift-b.blend` — the knight under review
- `ember-knight-shift-b-fx.blend` — steam, core, and rim only
- `ember-knight-shift-a.blend` and `ember-knight-shift-c.blend` — the earlier ideas, kept

The build uses `incoming-art/tools/toon_kit.py` and the same camera as the Guardian concepts (35° down, orthographic, 2.6 tiles across). Needs Blender 4 and Python 3 with Pillow and numpy. No new libraries.
