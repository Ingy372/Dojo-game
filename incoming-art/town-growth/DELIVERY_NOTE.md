# Delivery Note: Town Growth v4, sample stages White (+ smog layer) / Blue (A-TOWN-GROWTH)

**ITEM:** A-TOWN-GROWTH, fourth pass on PR #396 (same branch, `bot-art-town-growth`) after Jay's feedback on the v3 town. Samples: White (day, dusk and the smog layer), Blue day, Blue dusk, plus a sheet. Green is unchanged from v3. The v3 White / Blue pictures, sheet, scripts and docs are moved to `superseded/v3-stages/` (nothing deleted).

**WHAT:**
- **White smog is now a separate layer (Jay likes the smog).** `stages/1-white-smog-day[@2x].png` and `1-white-smog-dusk[@2x].png` are full-frame transparent PNGs. The White background itself is now the clear-air town. Background + layer reproduces the v3 smoggy White (mean error 1.7/255 day, 0.9/255 dusk against the v3 look; the exact composites are in `previews/1-white-with-smog-*`). The Programmer draws the layer over White until the White floor boss is beaten, then stops drawing it. The README has a "White smog layer" section for the Programmer, and `stages.json` has a `smogOverlay` entry with the same rule.
- **Real sakura in Blue.** The five round pink trees are replaced by sakura: a dark, thick, crooked, leaning trunk, spreading crooked branches with twig forks, **layered cloud-like blossom clumps** (darker underside, mid pink, light top, white highlights) with gaps that show the branches, a petal carpet, and **falling petals** (in day and, new, in dusk). Two trees are on the left, three on the right; the two round green trees near the benches stay as green trees.
- **Blue dusk, livelier but not busy:**
  - **12 fireflies** (v3 had 6), varied in size, kept off the lanes.
  - **A fire bowl** (stone ring, bowl, logs, coals, three small flames) by the training platform, with a warm pool on the paving and a halo. Cold and unlit by day.
  - **Two paper lanterns** on a wooden hook post beside it, with soft halos.
  - A few tiny embers rise from the bowl. That is all that was added.
- Same structure as before for Green and Blue (one full picture per belt and time of day, swapped whole). White is the one belt with a second layer (the smog).
- Files: `stages/` (8 new/changed pictures at @2x and 1x, plus `stages.json`), `previews/samples-sheet.png`, `source/`, `superseded/v3-stages/`.

**WHY:** Jay likes the White smog and wants the kid to be able to clear it by beating the White floor boss, so it has to be its own layer. The old Blue trees were the same shape as the green ones with a pink colour; sakura needs its own form to read as a different, special tree. The Blue dusk was a bit sparse: a fire and lanterns give it a cosy centre, and more fireflies add life without crowding.

**Checks (second pass):**
- Red check (1x, hue/saturation/value rule): White 831 day / 304 dusk, Green 848 / 580, Blue 825 / 595. **0 red pixels outside the CMA sign box** (x 76-194, y 147-180 at 1x, the same box scaled at @2x, 4 dark-brown antialiased sign-edge pixels just below the box at @2x in the day files, identical to Green). The flames and lanterns are orange and gold, the blossoms are pink; the smog layer is grey.
- Lanes (rows 4.6-5.8, y 444-540 at @2x): White props mask 0 pixels in the strip. **Blue: the sakura trees stand where the old round trees stood and their trunks and crowns still reach into that strip, as the old trees did.** The sakura cover 33,690 px of the strip against 31,581 px for the old round trees (+7%), but they spread wider: 43% of the frame's columns touch the strip against 30% before. I dropped the low outer clumps and raised the crowns on the three trees beside the lane to keep this down. Nothing else new is in the strip: the fire bowl, lantern post, fireflies, petals (0 px in the strip), embers and the smog layer (which is a haze) are all outside it. See DECIDE 5.
- Heads: nothing is drawn above the characters' heads. The lantern post top is at y about 560, below the lane strip. Backgrounds sit behind characters.
- Glow sources: every glow comes from a lit thing in the `lights` mask: windows, stone lanterns, lamp posts, shop, Tower, and the new **fire bowl flames/coals** and **two paper lanterns** (checked that the mask is lit at their screen positions). Fireflies are the usual exception. The fire bowl is cold in the day picture.
- Smog layer: fit error is in the numbers above; it holds no town detail (soft haze only). It is drawn over the picture, so it also dims glows under it (as in v3).
- Phone and house-number strings from the dojo sign: 0 hits in `town-growth` (derived and checked without printing them).
- Only `incoming-art/` changed. No game code, no `main`, no `.blend` files, no history rewrite.

**Honest second pass:**
- *Worked:* the sakura now read clearly as a different tree from the green ones, with the dark crooked branches showing between the pink clouds. The clear White is a nice "reward" reveal against the smog version. The Blue dusk fire corner is warm and readable.
- *Not quite:* the sakura crowns are chunky cel-shaded clouds rather than a fine blossom texture. The paper lanterns are small at 1x. The fire is a simple cartoon flame with no flicker (it is a still picture; the Programmer could animate the flame).
- *Dusk:* the clear White dusk is still quiet on purpose. If the Blue dusk should be less or more lively, the firefly list is in `source/blue_extras.py`.

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
1. Fire: is the **outdoor fire bowl** right, or would you prefer a **warm hearth visible through a window** (for example the shop)? I chose the bowl because it is a real, visible source in the plaza.
2. Smog layer: should the Programmer **fade it out** when the White floor boss is beaten (my suggestion) or remove it at once? Should characters draw above it (my assumption: yes, the smog is over the background only)?
3. Is the clear White (blue sky, brighter) the "after the boss" look you want under the smog? It is a bit brighter than the old Green was meant to feel, so tell me if it steals Green's thunder.
4. Blue dusk: right amount of life with 12 fireflies, the fire bowl and two lanterns, or still too much or too little?
5. Sakura sit where the old trees were, so they still overlap the walking lane slightly more than the old trees did. OK as it is, or should I move the three lane-side trees back a little?
6. Should the two green round trees near the benches become sakura too, or stay green for variety?
7. OK to update the content spec (PR #344) to the capped arc, including the mismatches above, and build Yellow and Orange next?

**NEXT:** After Jay's decision, build Yellow (clean-up) and Orange (shop opens) in the same frame and pipeline. If the smog should also clear in steps, it is already a plain alpha layer, so the Programmer can fade it. Red to Black stay on the Blue picture. The old sets stay in `superseded/` until Jay says to delete them.
