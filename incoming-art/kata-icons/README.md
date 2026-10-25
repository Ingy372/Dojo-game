# Kata move icons + direction picture (S3-A1) — for the Programmer

Not imported yet: Manager review first, then Jay's OK.

## Files
- `sprites/kata-<move>.png` — 21 move icons, 128 x 128, transparent, anchor = centre. Show at 40–64 pt.
  File name = the id in `drafts/content/katas/moves.json` with `.` replaced by `-` (e.g. `block.downward` -> `kata-block-downward.png`),
  plus `kata-kiai.png` (kiai is in the kata texts but not in moves.json yet — see DECIDE).
- `sprites/kata-dir-map.png` + `kata-dir-front|back|left|right.png` — direction picture, 192 x 192, Front at the top,
  Back at the bottom, Left/Right at the sides (school-map layout from the spec). The 4 round markers on the edges
  are empty on purpose: draw the F/B/L/R letters (or words) in game text so they can be translated/changed.
  Use `kata-dir-<facing>.png` for a step's `facing` value (F/B/L/R).
- `sprites/static.json` — size/anchor/notes for every file.
- `preview/` — sheets at 2x/1x, greyscale checks, phone mock (practice-view rows: direction + 3 icons).

## Rebuild
    blender -b -P incoming-art/kata-icons/source/build_kata_icons.py -- --out incoming-art/kata-icons/source/kata_icons.blend
    blender -b incoming-art/kata-icons/source/kata_icons.blend -P incoming-art/tools/render_static.py -- --out incoming-art/kata-icons/sprites
    python3 incoming-art/kata-icons/source/finalize_kata_icons.py
    python3 incoming-art/kata-icons/source/make_kata_preview.py

The builder reuses the helpers in `incoming-art/icons/source/build_icons.py` (read only) and the house toon kit.
Everything here was made by us; no outside assets (nothing to add to SOURCES.md).
