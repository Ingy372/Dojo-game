# Delivery Note: Town Growth v5, Blue sakura redone (A-TOWN-GROWTH)

**ITEM:** A-TOWN-GROWTH, fifth pass on PR #396 (same branch, `bot-art-town-growth`) after Jay found the v4 sakura awkward and not blended with the other trees. Deliverables: Blue day v5, Blue dusk v5 (`stages/5-blue-{day,dusk}[@2x].png`) and a v4 / v5 comparison sheet (`previews/compare-v4-v5-blue.png`). v4 Blue is moved to `superseded/v4-stages/` (with the v4 sheet and scripts). Green and White pictures are untouched.

**WHAT:**
- **Blended look.** The sakura use the same toon material ramp and the same outline weight and colour as the other trees. Trunks are thick and brown with outlines (no thin black trunks). Branches are brown. The blossom crowns are 7 soft clouds per tree, drawn as ONE material family (base pink, a lighter cap, a pale highlight), not separately outlined lumps.
- **Grounded.** Every tree has a soft ground shadow (falls to the lower right, like the town's sun), a stone tree ring (curb, rim, soil and pebbles), and a few fallen petals under it. A few petals are still falling.
- **Dusk.** The pink is graded to the dusk palette (cooler, deeper rose, never red). A thin warm rim appears only on the sides that face a real source, taken from the lights mask: the paper lanterns, the fire bowl and the lamp posts.
- **Five sakura, the two bench trees included.** The two round green bench trees are sakura now (bench corners, moved up to row 9.6 so the trunks and rings show). The other three stand left and right of the plaza. 5 trees now (v4 had 5 sakura plus 2 round green trees).
- **Out of the walking lane.** All trees stand below the lane strip. The crown tops are at y 568 (@2x) and the strip is y 444-540. `source/check_lanes.py` reads the tree mask, shifts it into the frame and fails if any pixel is in the strip. Result: 0 px. It runs inside `render_all.sh`.
- **Distant blossom trees.** Six small, hazy blossom trees on the hills, day and dusk, on the ridge of the far-hill layer (they are flat 2D, in the sky layer).
- **Smog fades out after the White floor boss.** `stages.json` now has `smogOverlay.fadeOut` (on boss defeat, 2.5 s ease-out, 1.0 to 0.0) and the `remove` text says fade, then stop drawing. The README says the same. The clear White picture (`1-white-*`) is the after-boss look. The White files did not change.
- Files: `stages/5-blue-*` (4), `stages/stages.json`, `previews/compare-v4-v5-blue.png`, `previews/samples-sheet.png` (regenerated), `source/` (`blue_extras.py`, `build_town_stage.py`, `make_stages.py`, `make_sheet.py`, `render_all.sh`, new `check_lanes.py`), `superseded/v4-stages/`.

**WHY:** In v4 the trees were different from the rest of the town: a different shading, thin black trunks, crowns in three separately outlined colours, and they sat in the walking lane with no shadow or ground, so they looked pasted on. v5 draws them like the other props, grounds them, and keeps the lane clear.

**Checks (second pass):**
- Red check (hue/saturation/value rule) on the new Blue files: 825 day / 595 dusk at 1x, the same counts as v4. **0 outside the CMA sign box** at 1x. At @2x there are 13 (day) and 5 (dusk) antialiased edge pixels on the column just right of the sign box, identical to v4 and Green. The blossoms are pink and the rose grade is violet-leaning, not red.
- Lanes: 0 tree pixels in y 444-540 (see above). Ground shadows, rings and petals are all below the strip too (the trees stand at rows 8 and below).
- Heads: nothing is drawn above the characters' heads. The hill trees are in the background.
- Glow sources: the warm rim is limited to the lights-mask sources (paper lanterns, fire bowl, lamp posts). No new glow. The fire bowl is cold in the day picture.
- Phone and house-number strings from the dojo sign: 0 hits in `town-growth` (derived and checked without printing them).
- Only `incoming-art/` changed. No game code, no `main`, no `.blend` files, no history rewrite. Old pictures are moved, not deleted.

**Honest second pass:**
- *Worked:* the trees now read as part of the same town. The rings and shadows ground them. At dusk the rose is clearly different from the day pink and the lantern rim sits on the right sides.
- *Not quite:* the rim is subtle at 1x on the trees farthest from the fire (the bench-corner tree at the bottom right gets it mostly from the bridge lanterns). The hill trees are tiny flat shapes. The crown is cel-shaded clouds, not fine blossom texture.

**DECIDE (Jay):**
1. Green and White still have the round trees in their old places. So when the kid reaches Blue, the trees change and move. OK, or should Green get the lane clean-up too?
2. Five sakura instead of seven trees. Is that enough, or do you want a sixth (for example one near the bridge, top right)?
3. The two bench-corner trees are moved up to row 9.6 so their trunks are not hidden by the bottom edge. They are close to the bottom of the frame. OK?
4. The smog fade-out time (2.5 s, ease-out) is a suggestion. Tune it in the game.
5. The distant hill trees are flat 2D and fixed. OK, or do you want them to sway or drift?
6. The deeper rose at dusk is cooler than the day pink. More, or less?

**Mismatches against `drafts/content/town/town-changes.md`:** unchanged since v4 (cap at Blue, statue from Green, run-down White, full per-belt backgrounds instead of overlays). They are in the v4 note in git history (commit 802821c2) and still apply.

**NEXT:** After Jay's OK: resume Yellow (clean-up) and Orange (shop opens) in the same pipeline. Red to Black stay on the Blue picture. The v3 and v4 sets stay in `superseded/` until Jay says to delete them.
