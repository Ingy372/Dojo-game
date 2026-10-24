# Delivery Note: A7 art fixes from QA PR #83

**ITEM:** A7. Three art fixes from the Q2 QA report (PR #83): faces on the darkest skin, the black hair swatch, and the kohai looking like a red-haired player.

**WHAT:**
1. **Faces on deep skin** (`player-custom`, all 6 faces, both bodies): the light ring around each eye is bigger, brighter and sits closer to the surface, so it shows clearly. The eye shine is bigger, there is a second small shine, and the mouth is lighter. On light skin the change is barely visible. Only the 6 `face-*` layers were re-rendered: 13 animations × 8 directions × 2 bodies.
2. **Black hair** (`player-custom`): the black colour in the palette is now a cool soft black, `#34303f` instead of `#1f1a1c`. On the dark panel the hair keeps its shape and highlights instead of turning into a black blob. This only changes the palette in the JSON and the build script; no sheets needed re-rendering.
3. **Kohai** (`dojo-people`): a curly top-knot tied with a soft teal band is added on top of the approved curly red hair. No player hairstyle has a top-knot, so the kohai's shape is now different from the player from every direction. The face, colours, size, gi and belt are the same as the approved look. All 6 kohai sheets (8 directions) and the 4 portraits were re-rendered.

**Before and after previews, at phone size (1x) and zoomed (3x):**
- `player-custom/preview/a7-deep-skin-faces-before-after-body-a.png` and `-body-b.png`: the top row of each pair is before, the bottom row is after.
- `player-custom/preview/a7-black-hair-before-after.png`: the swatches, then the figures before and after.
- `dojo-people/preview/a7-kohai-vs-player-before-after.png`: a red-haired custom player on the left and the kohai on the right, before (top) and after (bottom).

**WHY:** Every kid's character should have a readable face, whatever skin they pick. Kids pick black hair a lot, so it should look like hair on the dark panel. And a child shouldn't mistake the kohai for their own player.

**DECIDE:**
1. Is the top-knot OK for the kohai? The other option is a different hair colour, but that would change the approved red.
2. Is a teal hair tie OK? It's kid-friendly and not red, so it doesn't clash with the danger colour.
3. Is the softer black `#34303f` dark enough to still read as "black"?
4. Should the Programmer add the light swatch border QA suggested? That is a UI change and isn't in this PR.

**NEXT:**
- Claude Code: re-import the files listed in NOTES-FOR-CLAUDE-CODE.md.
- Programmer: add a light border to the dark swatches.
- Tester: check again on a real phone.
