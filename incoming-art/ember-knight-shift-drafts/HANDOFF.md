# Programmer handoff — Ember Knight shifted form

**Ready for the Manager to merge this art folder. Not imported. Do not copy it into the game until the Manager says to.**

Stable label: **Ember Knight — shifted form**.

**Warm Shield** is a **PLACEHOLDER** name. Do not use it as an id, a file name in the game, or a final name.

Approved look: commit `8acf72fdd8f76ed3fc7c956dd89041118e4e8fa0`. Jay said the effects were "much better". The export does not change that picture.

## What to use

| File | What it is |
| --- | --- |
| `sprites/ember-knight-shift.json` | Sizes, anchor, timing, colours, layer order |
| `sprites/ember-knight-shift_normal.png` | 8 frames, one row, Normal |
| `sprites/ember-knight-shift_reduced.png` | 8 frames, one row, Reduced Motion |
| `sprites/EXPORT_CHECK.txt` | Proof these frames match the approved preview |
| `layers/fx-*.png` | The transparent effect pieces, same camera |
| `renders/ember-knight-shift-b_S.png` | The knight body, no extra effect on top |
| `source/*.blend` and `source/*.py` | The models and the rebuild scripts. Keep them. |

The sheets are straight-alpha PNG. Columns are frames. There is no gap between frames. Each frame is **512 × 512**.

## How to draw it

- Anchor (feet): **x 256, y 435.2**, from the top-left of the frame. The ground line is 85% of the way down.
- The file is **196.9231 px per tile** (512 / 2.6).
- The game draws **48 px per tile**. Draw this frame at **125 px** (512 × 48 / (512 / 2.6) = 124.8, rounded to 125).
- Do not draw the 512 frame as if it were 80 px per tile. It would be far too big.
- Draw order, if you stack the loose layers instead of the sheet: ground, body, rim, core, then (Normal only) burst, steam, embers.
- The sheets already have that stack baked in. Prefer the sheets. They are the pictures Jay approved.

## Timing (do not retune)

- **0.00–1.00 s:** white-gold glow, `#fff4cf`, halo `#ffecaa`. The knight cannot be hit and does not attack. That rule is already in the draft data. This art does not change it.
- **1.00–1.50 s:** one ring and one steam puff. Half a second. It plays once. It does not strobe.
- **After that:** forge-phase attacks stay ember slash and shield rush. No new attack.
- **Idle, Normal:** the core's lit area grows and shrinks, and embers drift. The sample frames are columns 5, 6 and 7.
- **Reduced Motion:** columns 4–7 are the same still. No embers, no pulse, no drifting steam, no ring. Seams, core, rim and the ground pool stay.

These eight frames are the approved samples. They are not a 20-frame-per-second film. Playing them back to back will jump. Do not draw the missing frames yourself.

## Do not

- Do not import this in this pass. It is not in `tools/art-import/approved.json`.
- Do not add an enemy, an attack, or a tuning number.
- Do not rename the knight to Warm Shield.
- The id stays `ember-knight`. This is the same knight after the 33% shift, not a second boss.

## What is not in this export

- Only the facing-camera view (S). The other seven directions were not drawn.
- No walk, hit, or attack sheets.
- The phase-3 "before" picture in column 0 is `incoming-art/guardian-concepts/renders/ember-knight_p3_S.png`.
- The final boss's three forms are a separate plan.
