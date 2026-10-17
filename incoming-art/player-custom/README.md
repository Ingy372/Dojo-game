# Customizable player (Batch 6): technical sheet

**Status: SAMPLES, round 2 (after Jay's feedback). Waiting for Jay's OK before the full render** (both bodies, all 13 animations × 8 directions × every layer).

This is built on the **approved player model** (`player-character/source/player_character.blend`). The rig, poses, timings, frame counts, feet anchor, gi, belt layers and props are unchanged. `source/build_custom.py` only splits the old `body` layer and adds the options.

```bash
for B in a b; do blender -b incoming-art/player-character/source/player_character.blend -P incoming-art/player-custom/source/build_custom.py -- \
    --body $B --out $PWD/incoming-art/player-custom/source/player_custom_$B.blend; done
blender -b incoming-art/player-custom/source/player_custom_a.blend -P incoming-art/tools/render_sprites.py -- \
    --out incoming-art/player-custom/sprites/body-a --name player     # full set (after approval); same for body b
python3 incoming-art/player-custom/source/make_samples2.py --a <body A idle> --b <body B idle> --bm <body B motion> --out incoming-art/player-custom/preview
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
| 21–32 | `hair-01` … `hair-12` | **yes**, `palettes.hair` | `hair` | Pick one. Only hair, in neutral grey `#e6e6e6` |

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
| hair-04 | Afro (**redesigned**): a round shape of soft coil clumps with light tops, and a natural hairline |
| hair-05 | Two braids |
| hair-06 | Ponytail |
| hair-07 | Bun |
| hair-08 | Tied back (low knot) |
| hair-09 | **New:** two puffs, high on the head |
| hair-10 | **New:** short twists |
| hair-11 | **New:** cornrows into braids at the back |
| hair-12 | **New:** a high-top fade |

**Hairline:** every hairline sits at or above the approved one (z ≈ 1.25–1.27; the brows are at 1.19). The eyes are never covered, and the forehead stays free for a future headband.

## Round 2 changes (Jay's feedback)

- **Textured hair:** the afro is redesigned and 4 textured styles are added (see `research-textured-hair.md`). The hair layer now uses two neutral greys (`#e6e6e6` base, `#f7f7f7` highlight on clump tops), still with one multiply tint.
- **Faces on deep skin:** every face has a faint light edge around the eyes (`#f3e6dc`, nearly invisible on light skin) and a lighter mouth (`#a8473f`).
- **Gi palette:** the black gi is now a softer charcoal `#4a4a55` (id `charcoal`).
- **Two bodies, same rig:** `--body a` (as before) and `--body b` (the girl). Both have the same 13 animations, timing, 128 px frame and feet anchor (64, 104.96), with the same gi, belt layers and tints.
- **Body B differences (only small, tasteful ones):**
  - a slightly rounder, softer head with soft cheeks;
  - slightly smaller ears;
  - three longer lash flicks at the outer eye corners, in her untinted `body` layer, so every face gets them.
- **Faces are shared:** the same 6 `face-*` layers work on both bodies. Her lashes come from her body layer, so there's no second set of 6 faces to download.
- **Hair is shared too:** the 12 hair layers fit both heads (rendered per body).

**Known issue:** big and tall styles touch the top edge of the 128 px frame during `celebrate`, on the hop with the arms up: the afro, puffs, bun, twists and high-top. Even the approved player's raised fists touch it in 4 frames. See DECIDE in the Delivery Note.
