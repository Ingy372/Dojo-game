# Customizable player (Batch 6): technical sheet

**Status: FULL SET** (approved samples, round 2). Both bodies, all 13 animations × 8 directions × 32 layers.

- **Frames: 128 × 160 px, feet anchor (64, 136.96)**, still 80 px per tile. This is a change from 128 × 128 / (64, 104.96), and it's for all player art: the approved `player-character/` sheets were re-rendered the same way. See `../NOTES-FOR-CLAUDE-CODE.md`.
- `sprites/body-a/`: `player-a.json` + `player-a_<layer>_<animation>.png`.
- `sprites/body-b/`: `player-b.json` + `player-b_<layer>_<animation>.png`.
- The animations, frame counts, fps, key frames, `groundMotion`, `props` and `holdLastFrame` are the same as Batch 1.
- Sizes: see "Download size" below.

This is built on the **approved player model** (`player-character/source/player_character.blend`). The rig, poses, timings, gi, belt layers and props are unchanged. `source/build_custom.py` only splits the old `body` layer and adds the options.

```bash
for B in a b; do blender -b incoming-art/player-character/source/player_character.blend -P incoming-art/player-custom/source/build_custom.py -- \
    --body $B --out $PWD/incoming-art/player-custom/source/player_custom_$B.blend; done
for B in a b; do blender -b incoming-art/player-custom/source/player_custom_$B.blend -P incoming-art/tools/render_sprites.py -- \
    --out incoming-art/player-custom/sprites/body-$B --name player-$B --height 160 --anchor-y 0.856; done
python3 incoming-art/player-custom/source/make_custom_preview.py --sheets incoming-art/player-custom/sprites/body-a \
    --sheets-b incoming-art/player-custom/sprites/body-b --out incoming-art/player-custom/preview
```

A full body takes about 80 minutes on 8 CPU cores (about 38,000 layer renders). `--anims` renders part of the set; I rendered it in 7 chunks and merged the JSONs, which gives the same files.

## Layers (drawing order)

| Order | Layer | Tint | Group | What |
| --- | --- | --- | --- | --- |
| 0 | `body` | no | | What's left of the base: the outlines and untinted parts |
| 1 | `skin` | **yes**, `palettes.skin` | | Head, ears, neck, chest V, forearms, hands, feet, in a light neutral `#f2f2f2` |
| 2 | `gi` | yes | | Unchanged |
| 3–11 | `belt` … `belt-tape2` | as before | | Unchanged (the belt is never customizable) |
| 12–13 | `prop-broom`, `prop-rag` | no | | Unchanged |
| 14–19 | `face-01` … `face-06` | no | `face` | Pick one: eyes, shine, brows, mouth, cheeks |
| 20–31 | `hair-01` … `hair-12` | **yes**, `palettes.hair` | `hair` | Pick one. Only hair, in neutral grey `#e6e6e6` |

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
- **Two bodies, same rig:** `--body a` (as before) and `--body b` (the girl). Both have the same 13 animations, timing, frame and feet anchor, with the same gi, belt layers and tints.
- **Body B differences (only small, tasteful ones):**
  - a slightly rounder, softer head with soft cheeks;
  - slightly smaller ears;
  - three longer lash flicks at the outer eye corners, in her untinted `body` layer, so every face gets them.
- **Faces are shared:** the same 6 `face-*` layers work on both bodies. Her lashes come from her body layer, so there's no second set of 6 faces to download.
- **Hair is shared too:** the 12 hair layers fit both heads (rendered per body).

**Celebrate clipping: fixed** by the taller 128 × 160 frame (Jay chose option A). The checks are below.

## Checks (full set)

- **Edge and clipping check (script, every layer × animation × direction × frame, both bodies and `player-character/`):**
  - Nothing touches the top edge. The closest is `hair-12` (high-top) at the celebrate hop, 27 px from the top. All the tall styles now fit.
  - The only pixels touching an edge are the broom's bristle tip at the bottom edge in `sweep`, SE, frames 5–7: 4–9 faint pixels. This was already in the approved Batch 1 sheets. It isn't visible in the game, so I left it as it is.
  - The left and right margins are at least 1 px (the strike lunge, as in Batch 1).
- **Alignment check (script):**
  - Stacking `body` + `skin` + `gi` + `belt` + `belt-rim` + `face-01` + `hair-02` gives the same outline as the approved player in every animation. The worst overlap is 99.3% for body A and 98.9% for body B; the small difference is body B's rounder head.
  - Both JSONs have 13 animations, and every listed sheet exists and is 8 × 160 px tall.
- **By eye:** I checked the faces on 3 skin tones, the 12 hair styles × 3 colours, the line-up, and frames from all 4 GIFs (strike, dash, the broom in sweep, the celebrate hop). All OK.
- **Size:**

| Folder | Size | What it is |
| --- | --- | --- |
| `sprites/body-a/` | 46 MB | 416 PNGs + json |
| `sprites/body-b/` | 46 MB | 416 PNGs + json |
| `player-character/sprites/` | 14 MB | re-rendered, about the same as before |
| `preview/` | 12 MB | |

  - Per body: about 14.7 MB of base layers, 0.65–0.8 MB per face, and 1.4–3.6 MB per hair style (the afro and twists are the biggest).
  - **One finished character is about 18 MB at 80 px per tile, before the 0.6× import shrink.**
  - The git repo grew by about **82 MB** for Batch 6 (`.git` went from 224 MB to 306 MB). That covers both bodies, the player-character re-render and the previews.
