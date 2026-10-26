# Delivery Note - A-BEST 3: Guardian concept sheets (CONCEPT ONLY)

**These are concept sheets, not final sprites. Please don't import them.** The order is Manager review first, then Jay's final OK.

## v2 - Jay's feedback (24 Oct 2026)
**1. Distinct silhouettes** (`source/build_guardian_concepts.py`):
- Lamp Keeper: a wide bell robe with a hem, and the lamp now hangs from a lamp-lighter's staff at its side (top of the staff stays below the head).
- Stone Giant: squared-off, blocky stones (bevelled boxes), block fists and a wide two-leg stance. No longer a round blob.
- Storm Herald: tall and thin, a narrow column on a wide flared hem, small cloud puffs on the shoulders only, smaller head.

**2. Brighter phase 3** (all 10): the body takes 46% of its own colour (was ~21%), the belly 58%, the shadow wisps go pale
lilac and drop to 2. Orange Guardians (Ember Knight, Hearth Cook) lean amber so the brighter body never reads red.

**3. Form shifts** (brief: Content Designer's `drafts/content/enemies/guardian-form-shifts.*`, PR #217; read only).
The four shifting Guardians are fixed by the brief, so I didn't choose them:

| Guardian | New form (working name) | Why (brief) | Concept |
|---|---|---|---|
| Stone Giant | Pebble Heart | the worry stones fall off; a smaller, round, mossy giant trying to be brave | shorter round pile of smooth grey-green stones, moss tufts, a warm glowing heart crack, big eyes, no mouth, bouncing pebbles |
| Sun Gardener | Bloom Gardener | its roots find the sun; the thorns drop away and flowers open | the same vine shape, no thorn nubs, big yellow sun-flowers, a sunny glow at the centre, two flower eyes |
| Storm Herald | Quiet Thunderhead | the storm runs out of shouting; one round cloud with calm blue sky | one round puffy cloud (smaller), a blue-sky patch with a star off to one side, soft yellow crackles at the edges, two eyes, no arms or body, floats over a soft shadow |
| Lost Lightbearer | Cloud Lantern | the clouds pull in tight round the last light; it shines through the cracks | a tall swirling cloud shaped like a lantern, warm gold light through cracks, two small light-eyes. No person, face or body |

Not shifting (per the brief): Lamp Keeper, Hearth Cook, River Watcher, Ember Knight, Echo Mask, Root Keeper.

Files: `form-shifts/sheets/<id>_form2.png` (before / new form S + SE / silhouette / palette / reveal strip),
`form-shifts/preview/<id>_reveal.gif` (glow-then-reveal sample) + `_reveal_strip.png`, `form-shifts/preview/overview_form_shifts.png` (+ `_grey`).
Reveal sample timing (20 fps): 0.4 s phase-3 form, **1.0 s white-gold glow** that builds up with a soft halo, a 0.15 s soft flash,
then the new form pops in (small squash and settle) and holds 1.2 s. Rebuild:
`blender -b -P source/build_guardian_concepts.py -- --form2 --ids stone-giant,sun-gardener,storm-herald,lost-lightbearer --out DIR`, then
`python3 source/make_form_shifts.py --renders DIR`.

**Second pass (v2):** all stills, sheets and reveal frames checked. Red-pixel check: 0 on every new form, sheet and reveal strip.
The only hits are the orange-brown shading on Ember Knight and Hearth Cook (hue around 18 degrees; it reads orange, see DECIDE 1).
Nothing above the head, no teeth or sharp points, nothing person-like. The Cloud Lantern shows no traveller. Fixed during the pass:
the Thunderhead's blue sky first sat under the eyes and read like a mouth, so it moved to one side. The Lantern's inner light was
hidden behind the cloud, so it came forward, and the light-eyes moved above it.

### DECIDE (v2, new)
- D-F1. **Form names are working names** from the brief, waiting on Jay: Pebble Heart, Bloom Gardener, Quiet Thunderhead, Cloud Lantern.
- D-F2. Should Ember Knight be a fifth shift? The brief lists it as an easy add ("armor cools to a warm glow"). Not drawn.
- D-F3. Reveal sample: a 0.15 s flash plus a pop after the 1 s glow. Is that OK, or should it be a plain cut?
- D-F4. Second forms use the phase-3 (brightest) colours, because the shift happens at the 33% phase change.

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
