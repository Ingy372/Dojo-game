# Delivery Note: A-LEGENDARY

**ITEM:** A-LEGENDARY. Legendary gear frame in the P-MENU2 style, clearly above Epic.

**WHAT:**
- `bag-tile-legendary`, `found-tile-legendary`, and `gear-ring-legendary` in normal, glow and pressed, all with @2x.
- An optional 6-frame shine for the bag tile and the found tile.
- `legendary.json`.
- A phone mock (932x430 and @2x) of Epic next to Legendary, and a 3x close-up.

**WHY:**
- Same sizes, draw rects, code and materials as the menu2 rarity family, so the game can swap it in directly.
- The gold and white-gold, the radiant edge and the extra ornament (crown sparkle, ray ring, star studs) make it read as a step above Epic's violet.
- Second pass: the first version was pale white-gold and looked washed out on the cream panel, weaker than Epic at a glance. I moved it to a richer gold with a darker gold outline, a stronger gold band and gold stars, and kept white-gold only for the hairline and highlights.
- Red check: 0 px.

**DECIDE:**
1. **Gold vs. selected and equipped:** the selected and equipped tiles also use a honey-gold rim and glow. Legendary is a different gold (full gilded frame, stars, crown sparkle), but the two sit close together. Should selected or equipped draw differently on top of a Legendary tile?
2. **Shine:** Epic has no shine, so I added Legendary's shine as an optional extra. Use it, or leave it out to match the family?
3. **9-slice:** the brief asked for 9-slice, but the menu2 rarity frames are fixed-size, so I kept them fixed-size. Does Legendary need a 9-slice version for other uses?
4. **Uncommon tier:** menu2 has four tiers (Common, Uncommon, Rare, Epic). Legendary assumes it is a fifth tier above Epic. Please confirm the tier list and name.
5. **Drop icons:** the `drop-*-legendary` icons from gear-drop-icons used in the mock already have their own gold styling. Is that OK inside a gold frame, or should the icons drop their own frames?

**NEXT:** Once Jay approves, the game adds `legendary` to its rarity table, using `bag-tile-legendary`, `found-tile-legendary` and `gear-ring-legendary*`.

---
## UPDATE v2 (Jay's notes)
ITEM: A-LEGENDARY v2.
WHAT: Recoloured to golden orange with a dark warm outline. Stronger radiance (rays, stars, inner glow), an amber gem crest, and a 9-slice variant plus a crest overlay. Mock and close-up rebuilt. Red check: 0 px.
WHY: Yellow was hard to see on the cream panel and did not feel special.
DECIDE: Whether the gem crest also goes on the found tiles and rings (it is on all of them now). Whether the game uses the 9-slice tile or the fixed tile. How orange is too orange.
NEXT: Jay reviews the mock at phone size.
