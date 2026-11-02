# Move Catalog (MENU-CATALOG-01): final sprites

**Status: Jay OK'd the samples (Nov 1, 11:21 PM Eastern). This folder now holds the FINAL sprites and a manifest for the Programmer.** No game files are touched. The game draws every word itself: no move text is baked into any sprite.

A collectible card for every move a student learns in class. The big name is the dojo name ("Self-Defense #3"), the game name sits under it ("Spin Back Fist"), then one picture for the family, a short "In the dojo" line and a "Flip for steps" chip. The back shows the numbered steps in Jay's own words.

## What the Manager decided (all done here)
1. Dojo name big on top, game name under it.
2. One picture per family (rim colour = family).
3. Front: a short "In the dojo" line plus a **Flip for steps** chip.
4. A **locked** card shows the belt where the move is learned ("Yellow Belt").
5. The grid is grouped by belt, five moves per belt.
6. Steps are Jay's exact sentence split at his commas. No rewording (see "The words").
7. A move with no words yet shows a clear **PLACEHOLDER** panel.

## Export (the Programmer's part): `sprites/`
Every sprite is a PNG at 1x (`name.png`) and @2x (`name@2x.png`). Sizes in the manifest are 1x points. Every frame has a 6 pt shadow margin (`shadowMargin`; `visibleRect` says where the card starts).

| Folder | Files | What |
|---|---|---|
| `card/` | `front-{family}`, `back-{family}` (7 families each) | The big card frame, 250 x 396 pt: family rim, cream paper, blank ribbon. Front also has the stage disc for the picture |
| `card/` | `inset-placeholder-front` (222 x 92), `inset-placeholder-steps` (222 x 126) | Dashed PLACEHOLDER panels |
| `card/` | `flip-chip` (104 x 22), `step-badge` (20 x 20), `flip-arrow` (84 x 56) | "Flip for steps" chip, step number badge, curved flip arrow for the detail view |
| `mini/` | `collected-{family}` (87 x 94), `locked`, `new-ribbon` | The grid card, its states and the gold NEW ribbon |
| `family-art/` | `counter`, `guard`, `disarm`, `strike`, `kata`, `escape-placeholder`, `throw-placeholder` (128 x 128) | The PB-07 picture per family (from #419 v3). Escape and Throw are blank rims until they are drawn |
| (root) | `catalog-ui.json` | Manifest: sizes, files, visibleRect, shadow margin, family rim colours, **layout** (every text position, size, weight, colour rule for the front, back, grid card and grid) and the state recipes |
| (root) | `moves-text.json` | Jay's words per move (see below), for reference |

States: **collected** = `mini/collected-{family}` + family art + dojo name + game name. **new** = collected + `mini/new-ribbon`. **locked** = `mini/locked` + dojo name + belt (no picture, no game name). **placeholder** = `card/inset-placeholder-*` instead of the cream inset.

`preview/05-composed-from-sprites-844x390` is built only from the exported PNGs and the manifest's layout numbers, so it proves the manifest is enough to draw the cards. `preview/06-export-contact-sheet` shows every sprite.

## Previews
| File | Shows |
|---|---|
| `01-move-card-large` | One large card (Self-Defense #3), the card states, a Kick Combo and a Form card, the rim-colour key |
| `02-catalog-grid-844x390` | The Abilities tab as a catalog, grouped by belt |
| `03-card-detail-flip-844x390` | Front and back of a card with flip, previous/next, close |
| `04-long-words-and-placeholder-844x390` | Long words (Self-Defense #6 and #20, the list scrolls), a Kick Combo, and a Form with the PLACEHOLDER panel |
| `05-composed-from-sprites-844x390` | Cards drawn from the exported sprites |
| `06-export-contact-sheet` | All 35 sprites |

## The words (no invented terms, no rewording)
| Words | Source |
|---|---|
| "Self-Defense #n", attack, steps, result, belt for each move | `docs/self-defense.md` (Jay). Five moves per belt: White, Yellow, Orange, Green, Blue, Red, Red/Black, Brown |
| Kick Combos 1-7 | `docs/curriculum.md` (Jay, 2026-10-23) |
| Game names and the kid line (#1-15, Strikes) | `drafts/content/abilities/seal-families-text.json` (PB-06) |
| Basic Form 1 = "Rooted Form" | `drafts/content/abilities/technique-callouts.json` |
| Locked belt wording | `ui.sealLocked` = "{belt}" with the full belt name, e.g. "Orange Belt" |

**Steps rule.** Jay's "what the student does" cell is split only at his commas. The only edits: a capital first letter and a full stop at the end; "(Jay, date)" notes are dropped. The back's result is his result cell, unchanged. A sentence that points at another move ("Same as #1...", "As #21...", "Self defense 22: ...") stays ONE step and is flagged `stepsNeedReview` in `moves-text.json` (moves 2, 5, 22, 27, 31-35), because splitting it would be a guess. **Short front line = Jay's "attack" cell** (for a Kick Combo, the list of kicks).

**Placeholders.** Self-Defense #36-40 are "(not stated)" in the doc, and Jay has not described the forms. Those cards show the dashed panel with "[PLACEHOLDER]" and "Not written yet" (the player-facing wording is open). Escape and Throw pictures are blank rims.

**Long moves.** The steps area (218 x 136 pt) shrinks the text from 13 to 12 pt. Five of the 35 written moves (#6, 17, 20, 26, 29) still do not fit, so the game scrolls that area (the sample shows a small down chevron). Everything else fits.

## Rebuild
```
python3 incoming-art/menu-catalog/source/build_catalog.py     # the four preview screens
python3 incoming-art/menu-catalog/source/export_catalog.py    # sprites/, manifests, previews 05 and 06
```
Needs Pillow and numpy and PR #412's `incoming-art/tools/board_ui_kit.py` (Board look). `source/seal_icons.py` and `source/toon.py` are copies of the #419 v3 drawing files; `source/make_tab_icons.py` is a copy of the #412 file; `source/moves_text.py` reads the docs.

Look: warm Board (#412: wood wall, cream paper, brass, Nunito). No red, orange only on ENTER THE TOWER, every shine has a source (the card lacquer edge and the lit picture). Nothing is drawn above a character's head.
