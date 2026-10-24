## Delivery Note

**ITEM:** A3, badges and trophies (**3 samples**). Spec: S6 (`drafts/planning/S6-achievements.md`, PR #80), with text from C7 (`drafts/content/achievements/achievements.json`). Folder: `incoming-art/badges-trophies-a3/`. Everything is built by `source/make_a3.py`.

**Main preview:** [the 5 bow-question badges as a tier row, 2x](https://github.com/Ingy372/Dojo-game/blob/bot-art-a3/incoming-art/badges-trophies-a3/preview/review-1-bow-badges-tiers-2x.png). Also: [trophy wall, certified vs game, 2x](https://github.com/Ingy372/Dojo-game/blob/bot-art-a3/incoming-art/badges-trophies-a3/preview/review-2-trophy-wall-certified-vs-game-2x.png), [trophy wall at phone width, 390 px](https://github.com/Ingy372/Dojo-game/blob/bot-art-a3/incoming-art/badges-trophies-a3/preview/review-3-trophy-wall-phone-390px.png), [greyscale badges](https://github.com/Ingy372/Dojo-game/blob/bot-art-a3/incoming-art/badges-trophies-a3/preview/greyscale-1-bow-badges.png), [greyscale wall](https://github.com/Ingy372/Dojo-game/blob/bot-art-a3/incoming-art/badges-trophies-a3/preview/greyscale-2-trophy-wall.png).

**WHAT**
1. **Bow-question award badges** (`sprites/badges/badge-bow-{5,10,20,50,100}.png`, 128×128, centre anchor, ids in `sprites/static.json` linked to `ach.bow.correct.<n>`):
   - **Seals-family medallion:** round rim, cream face, one symbol. The symbol is the same on all five: an open scroll with a small gold sparkle, meaning "a technique remembered".
   - **Tiers read without numbers** in three ways:
     - the rim goes wood → bronze → silver → gold → gold with a sky-blue gem;
     - 1 to 5 star pips sit along the bottom of the rim;
     - extras build up: sky ribbons from 20, a soft sunburst from 50, and the longest sunburst plus the gem at 100.
   - **No text baked in.** The numbers aren't needed, because the Goals list already shows the C7 name and "how" line beside the badge. If you want a number anyway, the game should draw it in its UI font under the badge rather than bake it in (see DECIDE 2).
   - Checked at 128, 64 and 48 pt; the tiers still read at 48.
2. **Certified trophy** (`sprites/trophies/certified-trophy-sample.png`, 104×166, the same canvas and bottom anchor as the decor-tier1-a6 trophies). The sample is a belt promotion, with the cup band in the belt colour (orange shown). It has:
   - a gold cup on a dark wood plinth;
   - a **gold seal rosette with sky-blue ribbon tails**, which is the Certified mark;
   - a warm halo and a few sparkles;
   - a **blank cream date plate**, `datePlate` [26,134,62,148] in static.json, where the game writes the date in its UI font, colour #3a2a22.
3. **Game trophy on the same wall:** the existing GT look, the decor-tier1-a6 Journal trophy (plain wood stand and figure). It has no seal, no gold, no halo and no date. It's deliberately reused so that game trophies keep one look.
   - **At phone size**, the certified trophy is the only gold one, it glows and it carries the rosette. Even in greyscale it's the brightest and biggest shape on the shelf.

**Style:** drawn by script, using the house palette with a flat toon fill, one shade step, a highlight and the warm dark outline, matching icons/ (Seals) and decor-tier1-a6. Only gold, wood, cream, sky blue and silver are used. **No red.** The wall in the preview is just a stand-in: warm plaster with 80 px tiles and a wood shelf.

**Second pass**
- The 50 and 100 sunbursts looked like hard cogs, so they're now soft and pale.
- The 100 laurel was hidden behind the rays, so I removed it; the gem and the longest rays carry tier 5.
- The certified halo was being clipped into a box, so it's now smaller and stays inside the canvas.
- The seal was covering the date plate, so the seal moved to the plinth corner and the plate moved left.
- The trophies now sit on the shelf by the bottom of their art (they were floating), and the shelf shadow is a solid colour.
- In the preview, "12 Oct" on the plate and the "Earned 12 Oct 2026" caption are drawn by the preview script only, to show how the game writes them. They aren't in the art.

**DECIDE** (names and rules aren't mine to set)
1. **Badge vs reward:** S6 gives the bow tiers different rewards (5 D, 10 GT, 20 C, 50 D, 100 T+GT). Should these badges be the achievement icons shown on the Goals page and the award pop-up, alongside the item each tier gives? That's how I assumed they'd be used.
2. **Numbers on the badges:** none for now. Should the game draw "5", "10" and so on under the badge in its UI font?
3. **Date on the certified trophy:** the plate fits a short date (for example "12 Oct"). The full "Earned {date}" from C7 `trophyText` would go in the info pop-up. Is that OK, or should the plate be wider for the full line?
4. **Certified mark:** I made the gold rosette with sky-blue tails the single "Certified" seal look for every CT (S6 asks for a "Certified" seal look). Is that the mark, or do you want the school's own logo or colours?
5. **Names:** the ids (`badge-bow-*`, `certified-trophy-sample`) are working ids. All player-facing names and text come from C7.

**NEXT:** Once you've picked: the full CT set (promotions using the belt colour, stripes, classes, weeks, anniversary, sign-offs, accolades), all on the same seal and plate. Then the badge family for the other achievement groups, if wanted.

---
## Seal follow-up (branch `bot-art-a3-seal`, 2026-10-24)
- New: `source/make_a3_seal.py`, `SEAL_SPEC.md`, `sprites/trophies/certified-layers/` (base, 2 backings, 2 marks, a 128 px template), and a `certified-trophy-layered` entry in `static.json`. The existing #138 files are unchanged.
- Action Zone colours come from the website CSS (indigo #191a3e, paper-warm #efeadc, gold #c9a227). **No logo is in the repo or this PR**; the mark is a PLACEHOLDER layer.
- Previews: `review-4` wall (default / AZ + placeholder / AZ + star) at 1x and 2x, `review-5` phone 390 px, `review-6` layer breakdown, `review-7` seal close-up, `greyscale-4`.
- Second pass: shortened the preview labels (they overlapped). Checked that the indigo scallop still separates from the dark plinth thanks to the gold tails and ring, and that the stacked default layers match the #138 sample (the only differences are small anti-alias edges, because each layer is now outlined and downsampled on its own).
- Missing: the Action Zone logo file from Jay (128x128 transparent PNG per SEAL_SPEC.md).
