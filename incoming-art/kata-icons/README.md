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

## Labels (game text under each icon)
Draw the name as **game text under the icon** (not baked into the art), so it can be changed or translated.
Names are taken from `drafts/content/katas/moves.json`. **All of them are placeholders pending the Content Designer.**
The same table is in `sprites/labels.json`.

| Icon file (no .png) | moves.json id | Label | Status |
|---|---|---|---|
| `kata-pivot` | `pivot` | Pivot | PLACEHOLDER |
| `kata-turn-180` | `turn.180` | Half turn | PLACEHOLDER |
| `kata-turn` | `turn` | Turn | PLACEHOLDER |
| `kata-turn-big-special` | `turn.big-special` | Big special turn | PLACEHOLDER |
| `kata-stance-cat` | `stance.cat` | Cat stance | PLACEHOLDER |
| `kata-stance-front` | `stance.front` | Front stance | PLACEHOLDER |
| `kata-stance-attention` | `stance.attention` | Attention | PLACEHOLDER |
| `kata-block-downward` | `block.downward` | Low block | PLACEHOLDER |
| `kata-block-reverse-inside` | `block.reverse-inside` | Inside block | PLACEHOLDER |
| `kata-block-overhead` | `block.overhead` | High block | PLACEHOLDER |
| `kata-block-double-knife-hand` | `block.double-knife-hand` | Double knife-hand block | PLACEHOLDER - long (23 chars) |
| `kata-punch-straight` | `punch.straight` | Straight punch | PLACEHOLDER |
| `kata-punch-reverse` | `punch.reverse` | Reverse punch | PLACEHOLDER |
| `kata-strike-backfist` | `strike.backfist` | Backfist | PLACEHOLDER |
| `kata-kick-reverse` | `kick.reverse` | Reverse kick | PLACEHOLDER |
| `kata-kick-straight` | `kick.straight` | Straight kick | PLACEHOLDER |
| `kata-kick-front` | `kick.front` | Front kick | PLACEHOLDER |
| `kata-chamber` | `chamber` | Chamber | PLACEHOLDER |
| `kata-catch` | `catch` | Catch | PLACEHOLDER |
| `kata-break-double-choke` | `break.double-choke` | Choke break | PLACEHOLDER |
| `kata-kiai` | `(none)` | Kiai! | PLACEHOLDER - missing from moves.json |

Optional: `sprites/labeled/kata-<move>-labeled.png` = icon + label in one PNG (168 x 182, DejaVu Sans Bold, preview font).
Only use these if drawing text is not possible; they must be re-made whenever a name changes.
`preview/sheet-labeled.png` shows every icon with its label; `preview/choke-break-closeup.png` shows the choke break at 512 / 128 / 40 px.

## Rebuild
    blender -b -P incoming-art/kata-icons/source/build_kata_icons.py -- --out incoming-art/kata-icons/source/kata_icons.blend
    blender -b incoming-art/kata-icons/source/kata_icons.blend -P incoming-art/tools/render_static.py -- --out incoming-art/kata-icons/sprites
    python3 incoming-art/kata-icons/source/finalize_kata_icons.py
    python3 incoming-art/kata-icons/source/make_kata_preview.py
    python3 incoming-art/kata-icons/source/make_kata_labels.py   # labels.json, sheet-labeled, labeled PNGs, choke close-up

The builder reuses the helpers in `incoming-art/icons/source/build_icons.py` (read only) and the house toon kit.
Everything here was made by us; no outside assets (nothing to add to SOURCES.md).
