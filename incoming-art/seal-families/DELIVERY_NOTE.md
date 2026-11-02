# Delivery Note: Seal families (PB-07 samples)

- **ITEM:** PB-07 slot art, samples only: family medallions (Counter, Guard, Disarm shown), Lock, Strike and Kata glyphs, empty slot, Jumping Spins.
- **WHAT:** 3 preview sheets (large and real size, paper, wall and grey) in `preview/`, plus the build scripts. No sprites or game files yet. Escape and Throw are not drawn yet.
- **WHY:** Jay needs to OK the look before the full set. Limbs now read clearly, fists point the right way, and the look matches the new warm Board.
- **DECIDE:**
  1. Rim colour per family (blue, green, teal, purple, rose, grey) versus the all-blue seals we have today. Counter blue and Escape teal are close.
  2. Folder: Jay said `incoming-art/seal-families/`. The spec says `incoming-art/icons-slots/`. Keep Jay's name?
  3. Disarm shows a rubber training knife (blue pad blade). Fine for ages 6+, or use a plain stick or rope instead?
  4. Counter shows only the spinning back fist. OK as the family face, or pick another Counter technique?
  5. Strike glyph (sole-on kick on a kick pad) and Kata glyph (tatami with footprints). OK?
  6. Jumping Spins: gold rim like Strike, blue ripples and spin ring. Keep the ripples (they mean "hits enemies close by")?
  7. Lock and empty-slot look (stone-grey padlock, dashed socket with a plus).
  8. After OK: export the 128 px sprites (and `static.json`), then Escape and Throw. Throw needs a full-figure technique (outside reap), so it takes longest.
  9. The builder needs #412 merged (it imports the Board kit). OK to wait?
- **NEXT:** On OK, draw Escape and Throw, export the 128 px sprites, and open the full PB-07 PR.
