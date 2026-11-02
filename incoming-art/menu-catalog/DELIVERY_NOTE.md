# Delivery Note: MENU-CATALOG-01 (Move Catalog samples)

**ITEM**
MENU-CATALOG-01. Three samples of the Abilities "Move Catalog" for Jay to OK: (a) one large move card, (b) the 844 x 390 catalog grid, (c) the card detail and flip view. Folder `incoming-art/menu-catalog/`, branch `bot-art-menu-catalog`.

**WHAT**
- `preview/01-move-card-large` (+ `@2x`): Self-Defense #3 as a collectible card, plus card states, other card kinds and the rim-colour key.
- `preview/02-catalog-grid-844x390` (+ `@2x`): the Board's Abilities tab as a catalog. Moves #6-15 shown: three collected, one new, six locked. The header says "8 of 40 moves collected".
- `preview/03-card-detail-flip-844x390` (+ `@2x`): front and back of the card, with previous, next, close and a "Tap to flip" hint.
- `source/build_catalog.py` draws all three. No game files, no sprites, no changes outside this folder.

**WHY**
Jay asked for the Abilities menu to feel special, like a catalog of the moves kids learned in class, and to help them remember the real terms. The big name on each card is what the sensei says. The "In the dojo:" line is Jay's own wording. The look is the warm Board (#412) with the PB-07 medallions (#419).

**DECIDE**
1. **Big name.** I made the dojo name the big line ("Self-Defense #3") and the game name the second line ("Spin Back Fist"). That teaches the dojo term first. The other way round puts the game name first and the number small. Which one?
2. **One picture per family.** The medallion shows the family, not the move. In the grid, Defense #6 and #7 both show the Counter fist, and #8 and #9 both show the Guard cross-block. The rim colour, the name and the number tell them apart. Per-move pictures would be about 40 small drawings (Self-Defense alone is 40). Keep family pictures, or draw one per move for the first belts?
3. **Escape and Throw pictures are not drawn yet.** Their cards use a placeholder (the rim plus the move number). I can draw them after #419 is OK'd, as already planned.
4. **Words that are missing from the docs.** Jay has not described the forms (katas), so the Basic Form 1 "In the dojo" line is a marked placeholder and "Rooted Form" comes from the draft callouts file. Self-Defense #36-40 are "(not stated)" in `docs/self-defense.md`, so those cards cannot be written yet. Please supply the form lines and #36-40.
5. **Long "In the dojo" lines.** #3 fits in three lines. Some of Jay's words are much longer (Self-Defense #6 is about 35 words, and Kick Combo 6 is a paragraph). The back of the card ("How it goes") has room for the steps. For the front, use a short line plus "Flip for the steps", or a trimmed version you write?
6. **What "locked" says.** A locked card shows the belt where the move is learned, for example Defense #10 shows "Yellow Belt" while the student is wearing Yellow and has not been taught it yet. Is that the right meaning, or should it say the belt you must earn?
7. **How the grid is grouped.** The sample groups by belt, like the Gate (Yellow Belt #6-10, Orange Belt #11-15). The alternative is by family colour. Belt matches class.
8. **Steps on the back.** I split Jay's comma list into numbered steps ("Step across the center line with an inside block." / "Spin." / "Back fist!"). Fine for kids, or should the back keep his exact sentence?
9. **Names.** The grid uses "Defense #n" (like the Gate) and the card says "Self-Defense #n" (like the next-step line). The sub-tabs say Self-Defense, Kick Combos and Forms. The Strikes 4-7 game names are still an open taste call in R-G2B-strikes-4-7, so I did not draw those cards.
10. **Dependencies.** The builder needs #412 merged (Board kit). The PB-07 drawing files are copied here until the PB-07 sprites are exported after #419.

**NEXT**
After Jay OKs the direction: write the missing form lines and #36-40, draw Escape and Throw, build the full card set (Self-Defense 1-40, Kick Combos 1-7 now and 8-12 when Jay writes them, nine Forms), then hand sprites and card layout numbers to the Programmer. A second sample page (Kick Combos tab, and a Forms tab) can be drawn first if Jay wants to see them.

**Second pass.** Checked: no red (the 7 pixels the red check finds in the grid image are the hero's mouth, the same as in the #412 samples); no word about breaking or injury; the real phone and house number strings appear nowhere; nothing drawn above characters' heads; every shine has a source. What I would still improve: the lock on the dark wood cards is low contrast, and the family medallions repeat inside a family (see DECIDE 2).
