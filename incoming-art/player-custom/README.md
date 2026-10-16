# Customizable player (Batch 6): technical sheet

**Status: SAMPLES ONLY. Waiting for Jay's OK before the full render** (all 13 animations × 8 directions × every layer).

This is built on the **approved player model** (`player-character/source/player_character.blend`). The rig, poses, timings, frame counts, feet anchor, gi, belt layers and props are unchanged. `source/build_custom.py` only splits the old `body` layer and adds the options.

```bash
blender -b incoming-art/player-character/source/player_character.blend -P incoming-art/player-custom/source/build_custom.py -- \
    --out $PWD/incoming-art/player-custom/source/player_custom.blend
blender -b incoming-art/player-custom/source/player_custom.blend -P incoming-art/tools/render_sprites.py -- \
    --out incoming-art/player-custom/sprites --name player            # full set (after approval)
python3 incoming-art/player-custom/source/make_custom_preview.py --sheets <sprites> --out incoming-art/player-custom/preview
```

The sample sheets in `sprites/samples/` are not committed. They re-render in about 10 minutes, and only the previews are for review.

## Layers (drawing order)

| Order | Layer | Tint | Group | What |
| --- | --- | --- | --- | --- |
| 0 | `body` | no | | What's left of the base: the outlines and untinted parts |
| 1 | `skin` | **yes**, `palettes.skin` | | Head, ears, neck, chest V, forearms, hands, feet, in a light neutral `#f2f2f2` |
| 2 | `gi` | yes | | Unchanged |
| 3–12 | `belt` … `belt-tape2` | as before | | Unchanged (the belt is never customizable) |
| 13–14 | `prop-broom`, `prop-rag` | no | | Unchanged |
| 15–20 | `face-01` … `face-06` | no | `face` | Pick one: eyes, shine, brows, mouth, cheeks |
| 21–28 | `hair-01` … `hair-08` | **yes**, `palettes.hair` | `hair` | Pick one. Only hair, in neutral grey `#e6e6e6` |

**How the options work:**
- The face and hair options are collections with `sprite_group`. The shared renderer now supports this (see `tools/README.md`).
- Only the active option is drawn while it renders, with the base layers as holdouts.
- So any face plus any hair stacks correctly over the base. Hair behind the head or body is hidden, and hair in front of the gi is on top.
- The JSON lists `group` per layer, plus `groups`, `palettes`, `palettesDraftLabels` (placeholder ids only) and `optionNotes`.

## Options (placeholder ids; their names go to the Content Writer)

| Id | Look |
| --- | --- |
| face-01 | The approved Batch 1 face |
| face-02 | Big round eyes, soft high brows, a wider smile |
| face-03 | Calm almond eyes, straight brows |
| face-04 | Small lashes at the outer corners, a happy smile |
| face-05 | Bold, thick brows |
| face-06 | Freckles |
| hair-01 | Very short (close crop) |
| hair-02 | Short (the approved Batch 1 hair) |
| hair-03 | Curly |
| hair-04 | Afro |
| hair-05 | Two braids |
| hair-06 | Ponytail |
| hair-07 | Bun |
| hair-08 | Tied back (low knot) |

**Hairline:** every hairline sits at or above the approved one (z ≈ 1.25–1.27; the brows are at 1.19). The eyes are never covered, and the forehead stays free for a future headband.
