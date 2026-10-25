# A-MENU2: Delivery Note (full set, plan #259 A1–A13)

**What's here:** 103 sprites (1x + @2x) and a `sprites/menu2.json` manifest with sizes, 9-slice margins, states and notes. There are 8 phone mocks (Trophies, Style, Gear and Last run, each at 932×430 and 667×375, plus @2x), close-ups, and before/after images against v2. Everything is built by script (`source/`). Research notes are in `MENU-RESEARCH.md`. Usage is in `README.md`.

**Kept as decided:** mood A, gold seal, faint ghost not-yet icon, lantern only on the next cubby, taller slot card, belt cord, neutral belt layers.

**Set:** panel-frame / panel-inset / shelf-plank (A1); cubbies earned/notyet/pressed at 112 + 96, next-glow, seal, lantern ×2, shine ×6 (A2); belt knot layers + cord (A3); slot cards normal/selected/pressed + shine (A4–A6); tray tiles normal/selected/equipped/pressed + badge (A7); switch track + left/right on/off/pressed + trophy/swords glyphs (A8); stat icons ×4 + XP bar frame/fill/gloss (A9); found tiles ×4 (A10); gear rings ×4 + glow/pressed, bag tiles ×4 + selected/pressed, doll backing (A11); unlock sweep ×8 (A12); 9 seal icons at 64 (A13).

**Fixes after Manager review:**
- **Steady-breath:** the heart is now warm amber, and the icon is added to icons64. The source icon in incoming-art/icons is unchanged.
- **Last run:** the 'Throw' label on the New-for-you cubby is no longer clipped in either size. The 96 cubby label now sits higher, with a smaller icon.
- **Trophy detail sheet:** new mock `preview/mock-detail-{large,small}` showing an earned and a not-yet example, plus new sprites in `sprites/sheet/`: icon well, chip, kata arrows ×4, hint strip, close button, scrim.

## Decided
- **Rarity:** no Legendary frame; 4 rarities only.
- **Forms, Strikes and Virtues icons:** a separate follow-up.
- **Extras:** keep them all (title plaque, Wear button, stat tile, panel-inset).
- **Small phone gear:** one scrolling bag row is OK.
- **Shine frames:** used. The code turns them off with Reduced motion.
- **Trophy detail sheet contents:** icon, name, where it was learned, kata arrows when the trophy has them, and 'Ask Sensei about this one' for not-yet items. Text is a placeholder, drawn by the game.
- **Steady-breath heart:** recoloured to amber (done).

## Still open
- **Red and Red/Black belts** are tinted only in the game; the previews skip them to stay red-free. OK?
- **Placeholder text:** all names, numbers and text in the mocks are placeholders.
- **Leftovers:** a1, tf and a7 were left alone as asked.
