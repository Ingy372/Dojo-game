# Ember Knight — shifted form (draft alternatives)

**Draft only. Not approved. Do not import these into the game.**

Stable label: **Ember Knight — shifted form**.

**Warm Shield** is a placeholder name from the brief. It is not chosen yet.

This folder holds three shield ideas for the Ember Knight's fifth form shift (J16). They are three designs, not three angles of one design. The 1 second white-gold glow is unchanged.

## What to look at

1. `preview/review-1-alternatives.png` — the three ideas, large, with the phase-3 knight beside them.
2. `preview/review-2-phone-grey.png` — the same ideas at phone size, in colour and in grey.
3. `preview/quality-check.txt` — the red-pixel and edge check.
4. `renders/` — the Blender stills, plain, with no labels.
5. `DELIVERY_NOTE.md` — what to decide.

`superseded/pass-1/` is an earlier try. The honey lines were dots. Review the pictures in `preview/`, not that folder.

There is no `sprites/` folder. These are concepts, not game art.

## The three ideas

| | Look | What a child should see |
| --- | --- | --- |
| A | The whole shield glows | A big warm shield, held out like a hello |
| B | A coal you could hold | A copper shield with one bright round center |
| C | A little round door | Two bright straps and a warm center |

Same knight in all three: copper plates, honey seams, round shoulders, two oval eyes, blunt bar resting down, no shadow wisps, no glow on the floor.

## Rebuild

From the repo folder:

```
blender -b -P incoming-art/ember-knight-shift-drafts/source/build_ember_shift.py -- \
  --out incoming-art/ember-knight-shift-drafts/renders --samples 24
python3 incoming-art/ember-knight-shift-drafts/source/make_ember_shift_review.py
```

The build script uses the shared toon kit at `incoming-art/tools/toon_kit.py` and the same camera as the Guardian concepts (35° down, orthographic, 2.6 tiles across). It saves four Blender files in `source/`:

- `ember-knight-phase3.blend` — the phase-3 knight, rebuilt from the concept script
- `ember-knight-shift-a.blend`
- `ember-knight-shift-b.blend`
- `ember-knight-shift-c.blend`

Needs Blender 4 and Python 3 with Pillow and numpy. No new libraries.
