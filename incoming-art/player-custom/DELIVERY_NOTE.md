# Delivery Note: Batch 6, customizable player, SAMPLES (draft), 2026-10-16

**WHAT:** 3 samples, made from the approved player model. Nothing approved was changed.

1. **All options** (`preview/sample-1a-faces-x-skin.png`, `sample-1b-hair-x-colour.png`, `sample-1c-faces-closeup-4x.png`)
   - all 6 faces × 3 skin tones, and all 8 hair styles × 3 hair colours;
   - facing S/SE and SE/N, at 1× and 2×;
   - plus a 4× close-up of the faces.
2. **Motion and layer alignment** (`preview/sample-2-motion-1.gif`, `-2.gif`, `-3.gif`, `sample-2-key-frames-3x.png`)
   - three finished characters (ponytail, afro and braids) doing walk, strike, bow and celebrate;
   - shown facing S, E, NW and N;
   - this proves the layers line up and the hair sorts correctly against the head, the gi collar and the back.
3. **Suggested palettes** (`preview/sample-3-palettes.png`, `sample-3b-skin-tones-3x.png`)
   - 10 skin tones from light to deep, 10 hair colours, 10 gi colours;
   - 10 finished characters, each with a different real belt;
   - every skin tone at 3×, to check the multiply tint.

**WHY:** this batch is for the character creation screen (brief, Batch 6). These samples cover the riskiest parts before the long full render:
- the split into tinted skin, pick-one faces and tinted hair;
- depth sorting of the hair;
- tinting deep skin tones.

**DECIDE (Jay)**
1. **Names:** the options and swatches have placeholder ids only (`face-01`…`06`, `hair-01`…`08`, `skin-01`…`10`, and plain colour ids for hair and gi). Their names should come from the Content Writer bot.
2. **Multiply tint on the deepest skin tones:** it works, and the colours stay clean (not muddy). But on the 2–3 deepest tones the dark eyes, brows and mouth lose contrast at game size. I propose giving the face a little more contrast on deep skin, for example:
   - a faint light eye rim;
   - a lighter mouth colour;
   - or a lighter shadow step on the skin layer only.
   
   Which do you prefer, or keep it as is?
3. **The black gi on deep skin with black hair** is very dark on the game's dark floor colour. Keep the black gi in the palette as it is, or make it a softer charcoal?
4. **Palette choices:**
   - skin tones: 10 tones evenly from light to deep;
   - hair: black, dark brown, brown, light brown, blonde, red, auburn, grey, plus blue and purple;
   - gi: white, black, navy, blue, red, grey, green, unbleached, sky blue and maroon.
   
   Add, remove or reorder any?
5. **Face options:** are the 6 faces varied enough? Any to swap (for example, glasses later)?
6. **Hair options:** are these 8 the right set, and is the length of the ponytail and braids OK? They stay above the belt.

**NEXT:** after Jay's OK, render the full set:
- every layer for all 13 animations in 8 directions;
- the JSON with the palettes;
- the brief's previews: the faces × 3 skins and hair × 3 colours grids, a line-up of 8 characters with different belts, and walk and celebrate GIFs for 2 of them.

**Conflicts with the docs:** none. The belt and gi stay as approved, and the 13 animations and anchor are unchanged.

**Tool change:** `tools/render_sprites.py` now supports pick-one options (`sprite_group`). It's backwards compatible; earlier batches render the same.
