# Delivery Note: A-MENU2 samples (mood A, warm dojo wood)

**ITEM:** A-MENU2 / P-MENU2-h, plan #259 (`drafts/planning/P-MENU2-training-board-redesign.md`). Jay picked mood A (D1). The 3 first samples only.

**WHAT:**
1. A2 trophy cubby, earned and not-yet (112 px, 1x + 2x), with a separate seal and lantern.
2. A6 Stance slot card, normal and selected (140 × 120).
3. A1 panel frame (9-slice, 48 px corners) with the A3 belt ribbon: neutral, recolourable knot layers (band / stripe / sheen / rim / outline) + a ribbon cord.
4. Phone landscape mocks at real size, 932 × 430 and 667 × 375 (+ 2x), with placeholder text only.
README with sizes, anchors, layers and draw order.

**WHY:** Plan §art list, "3 samples first" for Jay's approval before the other A-items.

**Checks (second pass):**
- Pass 1 fixes: the not-yet icon was only a ring (the icons are round badges), so it is now the whole icon as a warm sepia ghost at 30% alpha. The lantern glow was clipped into a square, now fixed. The belt knots read like stools, so they were redrawn with a round knot and angled tails. The cubby name moved inside the card, the seal and lantern moved to the top-right, and the slot card text lines were spaced at 12/17/14.
- Red check: 0 red pixels in sprites and previews. The first Stance sample icon (steady-breath) has a red heart, so it was swapped for wind-step.
- No baked text. Not-yet has no lock, grey or count. A lantern and warm paper keep it hopeful. Nothing is drawn above heads (no characters).

**v2 (Manager review, Oct 25):**
- The lantern is now shown only on the next cubby to learn. `cubby-notyet` has no lantern. `cubby-lantern` is a separate overlay, and `example-cubby-next` shows the two put together. The mocks show 1 lantern.
- The slot card is now 140 × 132 (files 156 × 148). The icon circle sits fully inside the frame and the effect line no longer touches the bottom. The small mock shows only the Stance card, because two cards don't fit in 375 px.
- Second pass: re-rendered all sprites and both mocks at 1x and 2x, and checked them at real size. Red check: 0 red pixels.

**DECIDED (Manager):**
1. Seal: gold check seal (not red).
2. Not-yet icon: faint sepia ghost at 30%.
3. Lantern: only on the next cubby to learn (separate overlay).
4. Slot card: taller, 140 × 132, the icon circle fully inside.
5. Ribbon cord: kept (`#d9b47a`).

**Still open (Jay):** final OK on the look. The icons and names in the mocks are stand-ins; the real names are game text.

**NEXT:** Manager review, then Jay's OK. After that, A1–A13 in this style (P-MENU2-h).
