# Delivery note: UI benchmark, FINAL export (B2 + B3 + B4)

**ITEM**
R-BENCHMARK: the Board paper-and-wood kit (B2), the final tab icons (B3) and the Tower Climb room icons (B4), exported as sprites for the Programmer. Jay approved the samples on Nov 1, 11:21 PM.

**WHAT**
- `sprites/`: 65 sprites at 1x and @2x with 9-slice margins, plus `sprites/board-ui.json` (the manifest: size, nineSlice, visibleRect, shadowMargin, state, notes, tab layout, room mapping).
  - Kit: 3 button families (ENTER orange, gold, wood) with pressed and disabled, 3 tabs (normal, pressed, active gold), paper card, 2 ribbons, 2 gate seals, 2 Sensei's Seal states (師), new dot, level fill, floor mat, 25 progress-ring steps, wall.
  - Tab icons: Climb (tower), Gear (bag), Abilities (fist and spark), Gate (blue gate with a lock).
  - Climb: 5 rooms x 3 states. Door pick is the `challenge` room. Guardian (`boss`) is purple.
- `preview/04-export-contact-sheet`, `05-b3-tab-icons`, `06-nine-slice-proof` (new); `01` to `03` redrawn with the final tab icons (old ones in `superseded/v1-samples/`).
- `source/export_sprites.py`, `source/make_tab_icons.py`, `source/toon.py` (copy of the #419 toon kit). Kit `tab_icon()` now draws the final icons.

**WHY**
- The Programmer needs real files with margins, not a picture of a kit.
- The tab icons were placeholders; four small readable shapes with a thick outline work on both tab colours.

**CHECKS**
- Red check on every sprite and preview: 0 red pixels. Orange appears only on the ENTER button. No text baked in (only the 師 glyph).
- 9-slice proof (`preview/06`) re-stretches buttons, tabs, ribbon and card from the exported files at three sizes each.
- Phone and house number strings: no hits. Only `incoming-art/` differs from main.

**DECIDE**
1. **Practice rooms.** The game has a `practice` room kind and no practice icon (only five were approved). Use the battle icon for now, or should I draw a sixth (a training post)?
2. **Ring steps.** The ring is 25 pre-drawn steps (x of 24). If the Programmer wants any value, a gold-arc mask can be added instead. OK as is?
3. **Pressed text.** On pressed buttons the label moves down 2 pt (in the manifest notes). OK?

**NEXT**
After merge: the Programmer wires the sprites from `board-ui.json`. Then the G2 Insight picker re-skin (not started).
