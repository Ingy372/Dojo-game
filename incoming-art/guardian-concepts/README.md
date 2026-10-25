# Delivery Note - A-BEST 3: Guardian concept sheets (CONCEPT ONLY)

**These are concept sheets, not final sprites. Please don't import them.** The order is Manager review first, then Jay's final OK.

## What is here
- `sheets/<id>_concept.png`: one sheet for each of the 10 Guardians in `drafts/content/bosses/`. Each sheet has:
  - the silhouette (S and SE);
  - the palette with hex codes;
  - the size next to the player (body A idle, at the same scale, feet on one ground line, 1-tile grid);
  - three phase panels (S and SE renders), with the phase id, health %, attacks, tell and Sensei line copied from the json.
- `preview/overview_all10.png`: all 10, white to black tier, phase 1 and phase 3, next to the player. There are also `overview_all10_grey.png` (greyscale check) and `overview_phone.png` (phone size).
- `renders/`: the raw Blender stills, `<id>_p<1-3>_<S|SE>.png`, 512 px, 2.6 tiles across, ground anchor at 85% of the height.
- `source/build_guardian_concepts.py`: Blender, built on `tools/toon_kit.py`; no rig.
- `source/make_guardian_sheets.py`: PIL composer.

## Style rules followed
- Every Guardian is a shadow creature: deep indigo body, glowing oval eyes with a white shine, and a soft rim in its own colour.
- Ages 6+: rounded shapes only. Thorns are round nubs, the heron's beak is blunt, and the knight carries a blunt bar instead of a blade. There are no teeth and no frowning brows.
- **Nothing above any head.** Lamps, books, masklets, pages and sparks all sit at hand, chest or floor height. Caps and leaf "hair" are part of the head.
- **Hopeful phase arc (same for all 10):**
  - Phase 1: wrapped in shadow wisps.
  - Phase 2: its own colour wakes up and the phase prop appears.
  - Phase 3: the shadow thins and the colour shows most, the step before it is freed.
- **Lost Lightbearer:** a small hooded traveller hugging the last light, with storm clouds at the sides and back.
  - Tired, not angry: heavy eyelids that lift a little each phase, no brows, slumped.
  - The light glows bigger each phase.
- **No red in the art.** The red circles stay game-side.

## Second pass (fixed)
- Zoomed the camera in (ortho 3.6 to 2.6), because the Guardians read too small.
- The Lightbearer's clouds covered the light. They now sit at the sides and back only, in a softer storm grey-blue.
- The size-panel caption overlapped the Guardian's feet, and the overview names overlapped the floor wisps. Both moved down.
- Checked greyscale: every Guardian still reads on its outline and rim. The phone-size overview is still readable.
- Known concept roughness, left for the final-sprite pass:
  - The Root Keeper's phase-3 roots and the Lamp Keeper's floor lamps run near the frame edge.
  - The phase-1 silhouettes of the Lightbearer and Stone Giant are blobby.

## DECIDE
1. **Ember Knight colour.** The draft colour #d9532b reads as red next to the danger circles (0xff3b30). I used ember orange #e8772e. Keep my orange, or use the draft colour?
2. **The json phases differ from the phase outline in bestiary-plan.md.** One example: for the Lightbearer the json has swirl / glow / ring, while the plan has storm swing / echoes / arc-then-lane. The sheets follow the json. Which one is right?
3. **What is the Lightbearer under the clouds?** I drew a hooded traveller in the shadow-indigo palette, not a clearly human face. Should it look more like a person?
4. **Black belt form name** is still a PLACEHOLDER in the json. These sheets don't change it.
5. **Phase looks are my concept.** The phase props (floor lamps, seed pods, flower, spark sprites, rolling pin, masklets, pages, roots) come from the json attack names and the plan. The exact look of each still needs the Manager's and Jay's OK.
6. **Sizes.** All 10 use the draft radius of 0.85 tiles. Heights vary by character, from 1.15 tiles (Lightbearer) to 1.6 tiles (Stone Giant, River Watcher, Storm Herald). Are the different heights OK?
