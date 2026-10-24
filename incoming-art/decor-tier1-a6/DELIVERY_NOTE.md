## Delivery Note

**ITEM:** A6 full, the Tier 1 decoration set for the S7-rev pool (PR #73), following Jay's calls on PR #122. Folder: `incoming-art/decor-tier1-a6/`. All ids are **working ids only**; the names come from the Content Designer.

**WHAT (27 sprites in `sprites/static.json`; 32 pieces counting both colours of the random pieces):**
- **Class pieces, 7 scrolls** (`decor-t1-scroll-*`, wall): one shared scroll model. Each has its own picture and mount colour, with no writing: sun and hills (green), moon and clouds (navy), bamboo (teal), blossom (plum), waves (blue), mountain peak (purple), koi (amber). `info.order` 1–7 is a suggested order.
- **Class pieces, 6 gear** (`decor-t1-gear-*`, floor): kick pad, focus mitts, belt rack (white to blue belts, no red), sparring helmet, water bottle (with a towel on a crate), small bow mat.
- **Random pieces, 5 kinds × 2 colours** (`decor-t1-fan`, `-lantern`, `-bonsai`, `-cushion`, `-banner`). Each has two layers: `<id>` (the fixed parts) and `<id>-tint` (neutral light grey). The game draws `<id>`, then `<id>-tint` multiplied by a colour (rgb × colour / 255, alpha unchanged).
  - **Colour 1** = `info.colour1`: fan sky blue, lantern teal, bonsai blue, cushion violet, banner green.
  - **Colour 2** = the belt colour of the floor where it drops: `beltStyles[belt].belt` from the player sheet (White `#f4f1ea`, Yellow `#f5d22e`, Orange `#f08a24`, …).
  - The tinted parts are the fan leaves, the lantern's cap, rims, band and tassel (the paper stays cream), the bonsai pot, the cushion cover (the piping stays cream) and the banner cloth (the crest stays cream).
- **First-clear statues** (`decor-t1-statue-floor1..3`): one shared stone base layer, `decor-t1-statue-base`, identical in every statue, plus a keeper figure for each floor. Floor 1: a lion-dog with a teal scarf. Floor 2: a turtle. Floor 3: a crane on one leg. This assumes 3 Tier 1 floors (as in the S7 maths).
- **Journal trophies** (`decor-t1-trophy-*`): one shared stand layer, `decor-t1-trophy-stand`, plus a figure for each Tier 1 monster: swarmer, shield, brute, keeper and the Bouncy Bopper. The Bopper's file is `trophy-bopper`, and `info.monster` is `padded` to match the asset names. The figures use each creature's own body, eye and accent colours.
- **2×1 folding screen** (`decor-t1-folding-screen`): `info.mustTouchWall = true`, and its note says it only goes where its top row is row 1, against the top wall.
- **Placement:** a new top-level `placement` block in `static.json` says that pieces go on any free cell, with the screen as the one exception, and explains the tint rule.
- Same camera, 80 px tiles, outline and light as the Home Dojo, and the same `footprint`, `place` and `anchorPx` fields. No text, no red, nothing above heads.

**Previews:** [class pieces 2x](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-full/incoming-art/decor-tier1-a6/preview/review-1-class-pieces-2x.png), [random pieces: colour 1, then White, Yellow, Orange](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-full/incoming-art/decor-tier1-a6/preview/review-2-random-colour1-then-white-yellow-orange-2x.png), [statues, trophies, screen](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-full/incoming-art/decor-tier1-a6/preview/review-3-statues-trophies-screen-2x.png), [in the Home Dojo 1x](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-full/incoming-art/decor-tier1-a6/preview/review-4-room-1x.png), [phone 390 px](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-full/incoming-art/decor-tier1-a6/preview/review-4-room-phone-390px.png).

**Second pass:**
- The lantern's colour barely showed, so the rims and cap are thicker and a band was added to the paper.
- The crane read as a blob from the front. It's now side-on, with a long neck, a beak and a tail.
- Checked every belt colour on the tinted parts. On White floors the colour-2 piece is nearly white (see DECIDE 3).

**DECIDE:**
1. Is the scroll order (`info.order`) and the mix right, with ~13 class pieces = 7 scrolls + 6 gear? White belt gets a piece every 2 classes.
2. Names for every piece: Content Designer.
3. White-belt floors make colour 2 almost white. Keep it, or use a fallback colour (e.g. a soft cream with a darker outline) when the floor belt is White?
4. Are the keeper figures (lion-dog, turtle, crane) right for floors 1–3? If Tier 1 ends up with a different number of floors, more figures go on the same base.
5. Which pool is the folding screen in (random, or a floor or class piece)? It's not in the 5 random kinds.
6. Trophies for named monsters (Tier 2+): the same stand with a gold plate, or none?

**NEXT:** the Programmer adds the entries to `content/dojo/decorations.json`, handles the tint (multiply) and the `mustTouchWall` placement check, and checks `info.colour1`.
