## Delivery Note

**ITEM:** A8, the Monster Journal silhouettes for the Floor Keeper and the Bouncy Bopper. Follows #135 DECIDE 2. Folder: `incoming-art/journal-silhouettes-a8/`.

**Main preview:** [all 5 kinds on the unmet card, 2x](https://github.com/Ingy372/Dojo-game/blob/bot-art-a8/incoming-art/journal-silhouettes-a8/preview/review-1-all-five-unmet-cards-2x.png) ([1x](https://github.com/Ingy372/Dojo-game/blob/bot-art-a8/incoming-art/journal-silhouettes-a8/preview/review-1-all-five-unmet-cards-1x.png), [greyscale](https://github.com/Ingy372/Dojo-game/blob/bot-art-a8/incoming-art/journal-silhouettes-a8/preview/greyscale-1-all-five.png))

**WHAT**
- `sprites/journal/silhouette-keeper.png` and `sprites/journal/silhouette-padded.png`: 116×120 each, with entries in `sprites/static.json` (`journal-silhouette-keeper`, `journal-silhouette-padded`).
- **Same style as the existing three** (`named-monster/sprites/journal/silhouette-{swarmer,shield,brute}.png`, made by `make_named_b2.py`):
  - the S-facing idle frame 0, fitted to 104×112 and centred in 116×120;
  - flat warm grey #786c5c with a soft inner light;
  - placed in the unmet card's picture well at (10,10).
- The ids match the enemy ids (`keeper`, `padded`), so #135 can swap its big "?" for these the same way it does for the other kinds.
- The script is `source/make_silhouettes_a8.py`. It reads the existing enemy sheets and doesn't change them.

**Second pass**
- The Keeper's gold glow and its loose sparkle-dot ring showed up as a dotted halo above the head, which looked like noise. I dropped the glow layer and any loose specks under 40 px. The crown, the hood and the arms stay, so the shape is still clearly the Keeper.
- The Bopper keeps its ears and its padded stick, so it reads differently from the Swarmer.
- I checked all five side by side on the unmet card, in colour and greyscale. Size, tone and placement match.

**DECIDE:** none.

**NEXT:** Programmer: in MonsterJournal, use `journal-silhouette-keeper` and `journal-silhouette-padded` for the unmet Floor Keeper and Bopper cards instead of the "?".
