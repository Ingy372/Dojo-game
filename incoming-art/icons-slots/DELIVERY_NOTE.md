# Delivery Note: Seal families (PB-07 samples, v2)

- **ITEM:** PB-07 slot art, samples only: family medallions (Counter, Guard, Disarm shown), Lock, Strike and Kata glyphs, empty slot, Jumping Spins.
- **WHAT:** 3 preview sheets (large and real size, paper, wall and grey) in `preview/`, plus the build scripts. No sprites or game files yet (no export until Jay approves). Escape and Throw pictures are not drawn yet; their rim colours are shown in the key on sheet 1.
  Manager answers applied in v2:
  1. Each family keeps its own rim colour. Escape moved from teal to **green-teal** (hue 186 to 164 degrees) so it is clearly apart from Counter's blue (207). To keep Escape apart from Guard too, Guard moved from green (142) to a leaf green (100).
  2. Folder moved to the spec's `incoming-art/icons-slots/` with `git mv`.
  3. Disarm: the knife is now a **padded training stick** (foam pad, gold tape bands, wood grip, rounded ends). No blade shape anywhere.
  4. Kept as they were: the Counter back fist, the Strike and Kata glyphs, the Jumping Spins ripples, the Lock and empty-slot look.
- **WHY:** The manager OK'd the family look with these changes. A padded stick is safe for ages 6+ and still reads as "a weapon kicked away".
- **DECIDE:**
  1. Guard's rim moved to leaf green (not asked for). It was needed to keep Escape and Guard apart. OK, or keep the old green and nudge Escape bluer?
  2. Text in the mock now says "Kick the stick away". The game text in `drafts/content/abilities/seal-families-text.json` still says "Kick the Weapon" (fine). Any other words that say "knife"?
  3. The builder needs #412 merged (it imports the Board kit). OK to wait?
  4. After OK: export the 128 px sprites (and `static.json`), then draw Escape and Throw. Throw needs a full-figure technique (outside reap), so it takes longest.
- **NEXT:** On OK, draw Escape and Throw, export the 128 px sprites, and open the full PB-07 PR.
