## Delivery Note

**ITEM:** A6, decoration art for the S7-rev pool (PR #73). **6 SAMPLES only**, picked to show the range. Folder: `incoming-art/decor-pool-a6/`.

**WHAT:**
| Working id | Pool slot (S7-rev) | Place / footprint |
| --- | --- | --- |
| `decor-a6-class-scroll` | Class piece (A): the shared class-scroll design, a painted sun over hills, no writing. The mount colour is the swap slot | wall, 1x1 |
| `decor-a6-kick-pad` | Class piece (A): dojo gear, a kick target pad on a stand | floor, 1x1 |
| `decor-a6-keeper-statue` | First floor clear (B): a friendly stone keeper statue | floor, 1x1 |
| `decor-a6-journal-trophy` | Monster Journal trophy (C): a round monster figurine on a trophy stand | floor, 1x1 |
| `decor-a6-fan-stand` | Random bonus pool: a paper fan on a stand (colour 1 of 2) | floor, 1x1 |
| `decor-a6-folding-screen` | Random bonus pool, the bigger size: a folding screen | floor, 2x1 |

- Same camera, 80 px tiles, outline and toon light as the Home Dojo. `sprites/static.json` uses the Home Dojo `footprint` / `place` / `anchorPx` rules, and each piece has an `info.source` naming its pool slot.
- Style matched to the approved lantern, bamboo pot and water basin: the same wood, stone and bamboo colours and simple rounded shapes. No text, nothing red, kid-friendly.
- Previews: [samples vs approved 2x](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6/incoming-art/decor-pool-a6/preview/review-1-samples-vs-approved-2x.png), [in the Home Dojo 1x](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6/incoming-art/decor-pool-a6/preview/review-2-in-home-dojo-1x.png), [phone size 390 px](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6/incoming-art/decor-pool-a6/preview/review-3-phone-390px.png), [pieces 1x strip](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6/incoming-art/decor-pool-a6/preview/review-4-pieces-1x-phone-strip.png).
- Second pass: made the journal figurine bigger (it was too small at phone size), added a teal scarf to the statue so it doesn't read as a grey block, and removed a hidden helper mesh from the fan.

**SIZING (from PR #73):** the Tier 1 pool is about 30: ~13 class pieces, 3 floor pieces, ~4 journal trophies and 10 random (5 kinds x 2 colours). The cheap way: the class scroll is one model with a mount colour and picture swap, plus a few gear pieces; random kinds get their second colour by recolouring.

**DECIDE:**
1. Is the class-piece set mostly the shared scroll (recoloured, with a different picture each time), or a mix of scrolls and dojo gear like the kick pad? And how many of each in Tier 1's ~13?
2. Names: the ids are working ids only, not names. Real names and the "3 classes trained!" style story lines are for the Content Writer.
3. The 5 random kinds for Tier 1 (the fan and screen are suggestions), and what the second colour of each is.
4. Floor-clear pieces: is a keeper statue right for the Floor Keeper idea, and should each floor's statue differ (colour or pose)?
5. Journal trophies: a figurine of the real monster for each entry (more art), or one shared trophy stand with a swap figurine?
6. Can pieces be placed on any free cell, and does the 2x1 screen need the wall row (like the weapon rack)?

**NEXT:** after the picks, the full Tier 1 set (~30) with the colour swaps, then the content entries in `content/dojo/decorations.json` (Programmer).
