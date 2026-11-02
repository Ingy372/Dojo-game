# Delivery Note: Town Growth v3, sample stages White / Green / Blue (A-TOWN-GROWTH)

**ITEM:** A-TOWN-GROWTH, third pass on PR #396 after Jay's direction (Nov 1): "the current changes aren't special enough." Samples only: White (run down), Green (clearly upgraded) and Blue (fully maxed hero town), each in day and dusk, plus a side-by-side sheet. The v2 White / Orange / Blue set is moved to `superseded/v2-stages/` (nothing deleted).

**WHAT:**
- **Arc capped at Blue.** White (a little run down), Yellow, Orange, Green, Blue (fully maxed). **Red, Red/Black, Brown, Brown/Black and Black have no town pictures: they use the Blue picture** (`stages.json`: `"useStage": "blue"`, no files). **The gold flame is dropped.** Yellow and Orange are planned, not built (they show White until built).
- **Bigger "wow" per step:**
  - White: grey overcast, desaturated, weak shadows, worn bits, empty plinth.
  - Green: bright sky, vivid grade, the statue unveiled between two stone lanterns, lush beds, window boxes, blossoming hedges, bunting across the river, a roof flag, bridge garland.
  - Blue: golden-hour grade with long violet shadows, five cherry-blossom trees with petals, four stone lanterns, two tall banners, two roof flags, bigger bunting, golden paving ring, lotus and koi, chimney smoke, sun shafts, bloom on the statue and lanterns.
- **Polish pass:** soft cast shadows and ambient occlusion (clay sun render), warm light and cool shadow, a thin warm rim line on light-facing edges, bloom on the hero props only, one colour grade per stage, scenery a little darker than the play space plus a vignette, a painterly grain, painted clouds and a per-stage sky. The techniques and the games they come from are listed in `README.md`.
- **Dusk stays subtle:** same toned-down dusk as v2 (small glows from lit things only). The stone lanterns have soft pools, Blue has a few fireflies and bridge reflections.
- Same structure as v2: one full picture per belt and time of day, swapped whole, no stacking.
- Files: `stages/` (6 pictures at @2x and 1x, plus `stages.json`), `previews/samples-sheet.png`, `source/`, `superseded/`.

**WHY:** Jay wants each belt to feel like a real reward, with the town reaching a proud, finished look at Blue, and no further town art after that. Per-stage grade and lighting is what makes each step read as a different place, not just a few more props.

**Checks (second pass):**
- Red check (1x, hue/saturation/value rule): White 612 day / 1 dusk, Green 848 / 580, Blue 825 / 595. Approved base is 1905 / 1389. A second check found **0 red pixels outside the CMA sign box** (x 76-194, y 147-180 at 1x, the same box scaled at @2x) in all 12 files. Pink petals and blossoms are not red.
- Lanes: the added-objects masks have 0 pixels in the lane strip (rows 4.6-5.8, y 444-540 at @2x) for all three stages. Petals are placed outside that strip, and the shafts fade out by y 330.
- Heads: nothing is drawn above the characters' heads. Backgrounds sit behind characters.
- Glow sources: every dusk glow comes from a lit window, a stone lantern, a lamp post, the shop interior or the Tower. The only lit things added are the stone lanterns (Green 2, Blue 4). White's tall lantern posts are off. Day bloom is only on the statue and the stone lanterns.
- Statue: the approved statue and plinth are unchanged. Absent (empty plinth, no star) in White, present in Green and Blue.
- Phone and house-number strings from the dojo sign: 0 hits in `town-growth` (derived and checked without printing them).
- Only `incoming-art/` changed. No game code, no `main`, no `.blend` files, no history rewrite.

**Honest second pass against the reference games:**
- *On par:* Club Penguin and Pokemon for warm, readable palettes and clean shapes. Blue reads as a proud, finished plaza and the White to Blue step is obvious at a glance on the sheet. Cast shadows, rim light and per-stage grade clearly lift it over v2.
- *Not quite there:* Archero and Slay the Spire have richer painted material (textured stone, hand-painted brush detail). Ours is still cel-shaded 3D with a light painterly grain, so the paving and the statue look flatter up close. The statue is a simple two-tone gold. Bunting reads small at 1x. Green's "wow" is the statue and the sky and grade; it is a clear step, but Blue is a bigger one.
- *Dusk:* subtle on purpose. White dusk is very quiet; Blue dusk is the warmest. If it should be more, the glow numbers are at the top of `make_stages.py`.

**Mismatches against `drafts/content/town/town-changes.md` (branch `bot-content-story-f`):**
1. **Cap at Blue.** Spec has changes for Red (gold-flame banners, a dummy and a brazier), Red/Black (wind chime and bell), Brown (reading tree and book box), Brown/Black (glowing Tower, rainbow, a dojo-window lantern) and Black (out of scope). New: **none of these are town art**. Those belts use the Blue picture. The gold flame is dropped. The Content Designer's mechanic replaces them, so the spec's art need for those rows goes away.
2. **Statue.** Spec: the statue "is not touched". New arc: absent until Green (the unveiling is the Green moment).
3. **White start.** Spec: "No shame ... a White-belt town looks complete" and the base is the start. New: White is run down, below the base.
4. **No empty plots, locks or signs.** The empty plinth, boarded window, patches and weedy beds break that rule on purpose.
5. **Structure.** Spec: "nine add-on overlay layers on top of the A4 base". New: full per-belt backgrounds (3 built, 2 more planned, Red to Black reuse Blue). Spec belt to a list of stacking changeIds, new is belt to one picture.
6. **Per-belt changes differ.** Spec: White lamps (wc-lantern-halls-lamps), Yellow beds bloom and a porch vine, Orange chimney, bread and a long table, Green stone path and bench, Blue clear river, koi and a dock. New: Green and Blue add the statue, stone lanterns, bunting, flags, banners, blossom trees and lotus. No porch vine, long table, stone path, bench or dock. Orange's chimney now arrives in Green (Orange itself is not built).
7. **Reward messages and changeIds.** Messages like "The town lamps are glowing", "Flowers are blooming everywhere", "The town has a table for everyone", "A new path is ready to explore" and "The river is calm and clear" no longer match what changes at each belt. The story tie-ins (Lamp Keeper and so on) point at old changes. Red to Black have no town reward message at all now.
8. **Scope.** The spec art need is nine overlays. New: 3 of the 5 built stages are delivered as samples; no overlays.

**DECIDE (Jay):**
1. Is the Blue picture the "fully maxed" level you want (blossom trees, four lanterns, banners and flags, golden hour)? Anything to add or take away?
2. Is Green a big enough step from White, or should Green get one more hero piece (for example banners like Blue)?
3. Is the White level right (grey overcast, boarded window, patches, empty plinth)?
4. OK to update the content spec (PR #344) to the capped arc, including the mismatches above?
5. OK to build Yellow and Orange as the in-between steps next?

**NEXT:** After Jay's decision, build Yellow (clean-up) and Orange (shop opens), in the same frame and pipeline, so the Programmer can swap by belt with no code change. Red to Black stay on the Blue picture. The old sets stay in `superseded/` until Jay says to delete them.
