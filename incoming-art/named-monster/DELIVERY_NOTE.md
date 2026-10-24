# Delivery Note: [SAMPLES] M7-N1 named monster, 2026-10-24

**ITEM:** M7-N1 named monster (approved), art per `drafts/planning/named-monster-proposal.md` (PR #33). Sample step (Jay's rule of 3 samples before a big batch). Stopped here for Jay's OK.

**WHAT** (`incoming-art/named-monster/`, `sprites/static.json`)
1. **Sparkles on a tier-1 enemy:** `named-sparkle_front` (only the gold drifting sparkles, no Swift swooshes, no ground glow, no dome). 256 master at (128, 210), plus pre-scaled sheets for brute, swarmer, shield (same frame + anchor as the enemy; the Floor Keeper is never named). 8 frames @ 10 fps, slow firefly drift that fades in and out.
   - `preview/sample-1-named-room.gif`: named brute in a Sunrise Garden room (the plate fades out at the end, as in the proposal's 3 s rule).
   - `preview/sample-1-greyscale-check.png`: Swift elite vs named, colour + greyscale.
2. **Name plate:** `name-plate.png`, BLANK cream plate with dark outline, goes under the feet. Nine-slice + text area in static.json; the game renders the name. `preview/sample-2-name-plate.png` (3x, cream + grey floors, phone scale).
3. **Monster Journal page mock:** `preview/sample-3-journal-page-mock.png`: frame and layout only: one met card (drawing + stamp graphic), two unmet "?" silhouettes with "Keep exploring!" (wording from the proposal). All other text is marked **[PLACEHOLDER]** in red. Preview only, not a sprite yet.
4. **Rough tells:** `tell-stamp-dust` (brute stamp), `tell-dash-trail` (swarmer dash path, tileable), `tell-shield-tap` (shield taps). See `preview/tells-rough.png`. First passes only.
- No names in the art, nothing above heads, soft and friendly shapes. Preview labels use DejaVu/Pillow fonts for review only.

**WHY**
- Gold swooshes already mean Swift; sparkles + a plate under the feet read as "special" instead of "fast", also in greyscale (the plate and the swoosh-free shape do most of the work there).

**DECIDE (Jay)**
1. Sparkle density/brightness: OK, or brighter so the sparkles alone (without the plate, after it fades) read more in greyscale?
2. Plate: proposal says "fades after 3 s". Should anything stay visible after that besides the sparkles? (Nothing drawn above heads.)
3. Journal: page title text, card layout (3 per tier on one screen), and the stamp design (gold star seal) - final words come from the Content Designer.
4. Monster names (proposal's Tier 2 examples) are not used anywhere in the art; the Content Designer writes the final names.
5. The Home Dojo decoration sticker from the proposal is not drawn yet.

**NEXT:** after OK: final tells, full sparkle set per tier, journal frame + "?" silhouettes + stamp as game sprites, and notes for Claude Code.
