# Ember Knight — shifted form (draft B)

**Draft only. Not approved. Not for Jay yet. Do not import these into the game.**

Stable label: **Ember Knight — shifted form**.

**Warm Shield** is a placeholder name. It is not chosen yet.

The picture under review is **draft B**: the shield stays copper, and only the centre glows. The 1 second white-gold glow is unchanged. A and C, the other two early ideas, are kept in `superseded/pass-2-three-way/` and their stills are still in `renders/`.

## What to look at

1. `preview/review-b-ingame-floor.png` — Before and B at the size the game draws (48 px per tile), on the real tower floor.
2. `preview/review-b-closeup.png` — B large, on the same floor tiles.
3. `preview/quality-check-b.txt` — the red-pixel check and the phone-size read of the eyes, shoulders and bar.
4. `DELIVERY_NOTE.md` — what is still open.

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
```

Blender files in `source/`:

- `ember-knight-phase3.blend` — the phase-3 knight, rebuilt from the concept script
- `ember-knight-shift-b.blend` — the draft under review
- `ember-knight-shift-a.blend` and `ember-knight-shift-c.blend` — the earlier ideas, kept

The build uses `incoming-art/tools/toon_kit.py` and the same camera as the Guardian concepts (35° down, orthographic, 2.6 tiles across). Needs Blender 4 and Python 3 with Pillow and numpy. No new libraries.
