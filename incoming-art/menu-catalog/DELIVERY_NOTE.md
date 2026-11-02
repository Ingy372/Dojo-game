# Delivery Note: MENU-CATALOG-01 (Move Catalog, final sprites)

**ITEM**
MENU-CATALOG-01. The Abilities "Move Catalog": final card frames, grid states and family art as sprites, with a manifest. Folder `incoming-art/menu-catalog/`, branch `bot-art-menu-catalog`, PR #422.

**WHAT**
- `sprites/`: 35 text-free sprites at 1x and @2x (card fronts and backs for 7 families, PLACEHOLDER panels, flip chip, step badge, flip arrow, 7 grid cards, locked card, NEW ribbon, 7 family pictures), `catalog-ui.json` (manifest and text layout) and `moves-text.json` (Jay's exact words per move).
- The Manager's calls are in: dojo name big with the game name under it; one picture per family; a short "In the dojo" line plus "Flip for steps"; locked cards show the belt where the move is learned; the grid is grouped by belt; numbered steps are Jay's exact sentence split at his commas; a clear PLACEHOLDER for a move with no words.
- `preview/01-03` re-drawn with those calls; `04` shows long words and the placeholder; `05` is drawn only from the exported sprites; `06` is the contact sheet.
- No game files, no changes outside this folder. Main is merged into the branch.

**WHY**
Jay asked for the Abilities menu to feel like a catalog of the moves kids learn in class. The game draws all text itself, so words can change without new art.

**DECIDE**
1. **Short front line = Jay's "attack" cell** (for example "Hook punch"), word for word. The Manager did not give a line; it is the shortest real wording. Fine, or should Jay write a short line per move?
2. **Long moves scroll.** Five moves (#6, 17, 20, 26, 29) have more steps than fit at 12 pt. The game scrolls that area, with a down chevron. Or I can make the back card taller or split into a second page.
3. **Moves with no words yet** show "[PLACEHOLDER] Not written yet": Self-Defense #36-40 and the Forms. What should a player see? Jay's words are needed.
4. **Steps that point at another move** (#2, 5, 22, 27, 31-35, and Kick Combos 2-7) stay as one sentence, flagged `stepsNeedReview`. I did not guess a split. Jay can write them out in full.
5. **Escape and Throw pictures** are still blank rims (`*-placeholder`), as in #419. Draw them next?
6. **Game names exist only for #1-15** (PB-06). Cards for #16-40 need names before the game can show a second line (the manifest and `moves-text.json` give `gameName: null`).
7. **Kit dependency.** Rebuilding needs #412's `board_ui_kit.py`. The PNGs do not.
8. **Locked meaning.** A locked card shows the belt where the move is learned (e.g. "Yellow Belt"), not the belt to earn. Still right?

**NEXT**
Programmer: load `sprites/catalog-ui.json`, draw text from `layout`, use `moves-text.json` as the words reference, scroll the steps area when it overflows. Art: Escape and Throw pictures; per-move cards for #16-40 when names exist.

**Second pass.** Checked: no red in previews or sprites; orange not used; no phone or house number strings in the folder; nothing above characters' heads; every shine has a source; steps are exact (capital letter and full stop only); text in previews fits (long words shrink, then scroll; mini names shrink to 75 pt). Still weak: the locked padlock is a little low in contrast on the dark wood.
