# Delivery Note: M7-N1 named monster, batch 2, 2026-10-24

**ITEM:** M7-N1 follow-up after the samples (PR #48): denser sparkles, a name tag above the head, final Monster Journal parts, Home Dojo stickers.

**WHAT** (`incoming-art/named-monster/`, all in `sprites/static.json`)
1. **Denser sparkles:** 12 instead of 6, a little bigger, each with a thin amber rim so it holds up in greyscale on light floors. Same files (`named-sparkle_front`, master + brute/swarmer/shield). `preview/b2-greyscale-before-after.png`: normal / Swift / named before / named after, colour + greyscale, with the plate faded.
2. **Name tag:** `name-tag.png`, a slim 64 x 14 cream plate with a gold edge (not a circle badge), BLANK. It fades in once the under-feet plate has faded. static.json gives the nine-slice, text area and `headOffsetPx` per enemy. `preview/b2-named-room-tag.gif` (plate -> fades -> tag), `preview/b2-name-tag-closeup.png`.
3. **Monster Journal (final art):** `sprites/journal/`: `page-frame` (390 x 600 phone page), `title-banner` (blank; the game writes "Monster Journal"), `card-met`, `card-unmet` (with the "?"), `stamp` (gold scalloped star seal), `silhouette-<enemy>` (unmet look: flat warm grey + soft inner light). The layout slots are in static.json. `preview/b2-journal-page.png` shows the title and marks every other text as [PLACEHOLDER]; `preview/b2-journal-parts.png`.
4. **Home Dojo stickers (SAMPLES):** `sprites/sticker/sticker-{brute,swarmer,shield}.png`. 80 x 80 die-cut wall stickers (one wall tile, same rules as home-dojo wall items): the creature with gold sparkles. `preview/b2-stickers.png`.
- `source/make_named_b2.py` (run after `make_named.py`) rebuilds batch 2.

**WHY**
- The proposal says the plate fades after 3 s; with denser sparkles plus a small tag the monster stays clearly "special" afterwards, without a big badge.

**DECIDE (Jay)**
1. The name tag is the **only thing drawn above any head** in the game. OK, given the no-badges rule? (Slim and low-profile on purpose.)
2. Stickers: one per named enemy type, the creature with sparkles. Pick a style, or ask for different designs.
3. Journal wording (fact text, page text) comes from the Content Designer; only "Monster Journal", "?" and "Keep exploring!" are used.

**NEXT:** after OK: the final tells and the per-tier set, plus wiring notes for Claude Code.
