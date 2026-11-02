# Move Catalog (MENU-CATALOG-01 samples)

**Status: samples only, for Jay to OK.** Three preview images of the Abilities "Move Catalog": a collectible card for every move a student learns in class. No game files are touched and no sprites are exported yet.

The idea: browsing the catalog should feel like a Pokédex or a card library. Each card shows the **real dojo name big** (what the sensei says in class), the game name under it, a PB-07 medallion with the family rim colour, and an **"In the dojo:"** line in Jay's own words, so kids connect the game to what they practise at the dojo.

## The three samples (each is shown at 1x and @2x)

| # | File | Shows |
|---|---|---|
| a | `preview/01-move-card-large.png` | One large card, Self-Defense #3 (Spin Back Fist). Beside it: the three card states (collected, new, locked), a Kick Combo card and a Form card, and the family rim-colour key |
| b | `preview/02-catalog-grid-844x390.png` | The catalog grid on the Board's Abilities tab at 844 x 390: collected, new and locked cards, grouped by belt, with sub-tabs for Self-Defense, Kick Combos and Forms |
| c | `preview/03-card-detail-flip-844x390.png` | Tap a card: the front on the left, the back ("How it goes": the steps, then what happens) on the right, with a flip hint, previous/next and close |

## How a card is built
- **Frame:** the family rim colour is the card's frame (Counter blue, Escape green-teal, Guard leaf green, Disarm purple, Throw rose, Strike gold, Form wood). These are the PB-07 rim colours. No red anywhere.
- **Medallion:** the PB-07 picture for the family, on a pale stamp disc. Same look as the Seal slots, so a card and its slot match.
- **Names:** the big line is the dojo name ("Self-Defense #3", "Kick Combo 1", "Basic Form 1"). Under it is the game name ("Spin Back Fist", "Spin Kick", "Rooted Form"). In the grid the dojo name is short ("Defense #6"), like the Gate on the Board.
- **Kid line:** the PB-06 Seal text (for example "A Great Counter also knocks into enemies close by.").
- **In the dojo:** Jay's words from `docs/self-defense.md`, lightly joined, not rewritten.
- **States:** collected = full colour with the family frame. New = the same plus a gold NEW ribbon. Locked = dark wood, a wood lock, and the belt name where the move is learned (the PB-06 `sealLocked` wording, for example "Orange Belt"). Locked cards do not show the move name.
- **Look:** the warm Board from PR #412 (wood wall, cream paper, brass, Nunito). Orange is only on ENTER THE TOWER. No glow without a source: the only shine is the card's lacquer edge and the lit medallion.

## Where the words come from (no invented terms)
| Words | Source |
|---|---|
| "Self-Defense #n", the attack, what the student does, the result | `docs/self-defense.md` (Jay) |
| Belt for each move (#1-5 White, #6-10 Yellow, #11-15 Orange) | `docs/self-defense.md` |
| Game names (Arm Wrap, Palm Heel, Block and Strike, High Block Strike, Spin Back Fist) and the kid line | `drafts/content/abilities/seal-families-text.json` (PB-06) |
| Kick Combo 1 words | `docs/curriculum.md` (Jay, 2026-10-23) |
| Spin Kick (Kick Combo 1) | `seal-families-text.json` strikes |
| Basic Form 1 = "Rooted Form" | `drafts/content/abilities/technique-callouts.json` |
| "Defense #n" in the grid and "Self-Defense #n" elsewhere | how the Board already writes it |

Placeholders (clearly marked on the images where they show): the **Escape and Throw medallions** (a number on the cream face, because the pictures are not drawn yet) and the **Basic Form 1 "In the dojo" line** (Jay has not described the forms yet). See DECIDE in `DELIVERY_NOTE.md`.

## Rebuild
```
python3 incoming-art/menu-catalog/source/build_catalog.py
```
Needs Pillow and numpy. **It needs PR #412 merged**, because it imports `incoming-art/tools/board_ui_kit.py` (the Board look). This folder does not copy that file, so it cannot clash with #412.

`source/seal_icons.py` and `source/toon.py` are copies of the PB-07 drawing files from PR #419 (`incoming-art/icons-slots/source/`), so the sample builds without #419. When the PB-07 sprites are exported, the builder should load those sprites and the copies can go.

Files: `source/build_catalog.py` (the cards and the three screens), `source/seal_icons.py`, `source/toon.py`, `preview/` (the images).
