# Delivery Note: M7-N1 named monster, final tells + stickers, 2026-10-24

**ITEM:** M7-N1 named monster, per `drafts/planning/named-monster-proposal.md`: final tells (production), finished stickers. The name tag is unchanged.

**WHAT** (`incoming-art/named-monster/`, everything listed in `sprites/static.json`)
1. **Final tells.** Each sheet uses that creature's frame size and anchor (the ground point), in one row, played during the normal wind-up. **Wind-up lengths are unchanged.**
   - **Old Thumper stamp dust** `sprites/brute/tell-stamp-dust.png`: 208 frames, 6 at 15 fps (0.4 s). Plays twice, at 0.0 s and 0.4 s of the 0.8 s wind-up, each with a 2 px / 0.12 s shake. A soft ground ring plus round cream puffs with a brown rim.
   - **Zippy Zoom dash sparkle trail** `sprites/swarmer/tell-dash-trail.png`: 128 frames, 6 at 10 fps (exactly the 0.6 s wind-up), holds its last frame until the dash ends. Gold stars and a dotted line grow along the dash path. It is drawn facing E; the game rotates it. `tell-dash-trail-tile.png` (64 x 24, loops) extends longer dashes.
   - **Captain Clank shield-tap flash** `sprites/shield/tell-shield-tap.png`: 128 frames, 4 at 20 fps (0.2 s). Plays 3 times, at 0.0, 0.233 and 0.467 s of the 0.7 s wind-up (the "clank" sound plays at the same times). It has an `offsetPerDirectionPx` so the flash sits on the shield in all 8 directions.
   - Every tell has an ink rim, uses no red (red stays the danger circle's colour) and has no sharp or scary shapes. They read in greyscale: see `preview/tells-keyframes-greyscale.png`.
   - The rough sheets from PR #48 are removed.
2. **Stickers (final):** `sprites/sticker/sticker-{brute,swarmer,shield}.png`, 80 x 80 Home Dojo wall items, in the **die-cut style**: the creature on a thick white border with a thin gold keyline and 4 gold sparkles. `preview/stickers-final.png`.
3. **Name tag:** the art is unchanged. Only `headOffsetPx` was raised (brute 98, swarmer 66, shield 88), so that the tag clears the head in the wind-up and attack poses too and never overlaps or jumps during a tell.
- Previews:
  - `preview/tells-room.gif` (4 s loop; the brute, swarmer and shield each tell in turn, over the red danger circle)
  - `preview/tells-keyframes-greyscale.png`
  - `preview/tells-sheets.png`
- `source/make_tells.py` (run after `make_named.py` and `make_named_b2.py`).

**WHY**
- The tells only add to the normal warning, as the proposal asks: same timing, same danger circle, so a 6-year-old can still counter on the normal warning.
- **Why the die-cut sticker style:**
  - The white border separates the sticker from any wall colour or tier theme, and it looks like a real sticker kids already know.
  - The gold sparkles and keyline repeat the named-monster sparkles, so it is clearly "from that special monster".
  - It stays clear at 80 px and in greyscale.
  - It needs no text or name, so it works before the Content Designer has the names.

**DECIDE (Jay)**
1. OK the three tells as final?
2. OK the die-cut sticker style?
3. The shake on the brute stamp is small (2 px). Keep it, or turn it off in reduced-motion settings? (I suggest off when reduced motion is on.)

**NEXT:** after OK, the per-tier sets (Tier 3) when those creatures exist.
