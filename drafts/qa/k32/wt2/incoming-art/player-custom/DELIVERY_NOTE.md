# Delivery Note: Batch 6, customizable player, FULL SET, 2026-10-16

**WHAT:** the full Batch 6 render from the approved samples (round 2). Body B, all 12 hair styles, the shared faces and the palettes are as approved, with the deep-skin face fix and the charcoal gi.

- **Both bodies,** in `sprites/body-a/` (`player-a.json`) and `sprites/body-b/` (`player-b.json`):
  - all 13 animations × 8 directions;
  - 32 layers: body, skin, gi, 9 belt layers, 2 props, 6 faces, 12 hair styles;
  - every sheet is committed.
- **[CHANGE] Frames are now 128 × 160 px, feet anchor (64, 136.96).** This is option A, which Jay chose. It's still 80 px per tile, and the feet are in the same place relative to the bottom; the extra 32 px are headroom on top.
- **The approved `player-character/sprites/` sheets were re-rendered at 128 × 160 too,** so all player art matches. All 169 sheets plus `player.json` were redone.
  - The poses, timing and layers didn't change.
  - Checked by script: the bottom 128 rows match the old sheets (0.0001% of pixels differ, which is render noise). The JSON only changed `frameHeight` and `anchor`.
  - The fists that used to be cut off on the celebrate hop are now whole.
- **JSON:** `layers` with `order`, `tint` and `group`, plus `groups`, `palettes`, `palettesDraftLabels` (placeholders), `beltStyles` (option C) and `optionNotes`.
- **Previews,** in `preview/`:
  - `review-1-faces-x-skin.png`: all 6 faces on light, medium and deep skin, both bodies; heads at 3×, figures at 1× and 2×.
  - `review-2-hair-x-colour-body-a.png` and `-b.png`: all 12 hair styles × 3 hair colours, SE and N, at 1× and 2×.
  - `review-3-lineup-8.png`: 8 finished characters, each with a different belt.
  - `player-a1_combo.gif`, `player-a2_combo.gif`, `player-b1_combo.gif` and `player-b2_combo.gif`: full combos with walk, jab, strike, counter, dash, bow, sweep and celebrate, facing S, E, NW and N.
- **Integration notes** for all batches are now in one file: `incoming-art/NOTES-FOR-CLAUDE-CODE.md`.
- **Tool:** `tools/render_sprites.py` has a new `--height` option, documented in `tools/README.md`.

**Checks and size:**
- **Edge and clipping check (script, every layer × animation × direction × frame, both bodies and `player-character/`):**
  - Nothing touches the top edge. The closest is `hair-12` (high-top) at the celebrate hop, 27 px from the top. All the tall styles now fit.
  - The only pixels touching an edge are the broom's bristle tip at the bottom edge in `sweep`, SE, frames 5–7: 4–9 faint pixels. This was already in the approved Batch 1 sheets. It isn't visible in the game, so I left it as it is.
  - The left and right margins are at least 1 px (the strike lunge, as in Batch 1).
- **Alignment check (script):**
  - Stacking `body` + `skin` + `gi` + `belt` + `belt-rim` + `face-01` + `hair-02` gives the same outline as the approved player in every animation. The worst overlap is 99.3% for body A and 98.9% for body B; the small difference is body B's rounder head.
  - Both JSONs have 13 animations, and every listed sheet exists and is 8 × 160 px tall.
- **By eye:** I checked the faces on 3 skin tones, the 12 hair styles × 3 colours, the line-up, and frames from all 4 GIFs (strike, dash, the broom in sweep, the celebrate hop). All OK.
- **Size:**

| Folder | Size | What it is |
| --- | --- | --- |
| `sprites/body-a/` | 46 MB | 416 PNGs + json |
| `sprites/body-b/` | 46 MB | 416 PNGs + json |
| `player-character/sprites/` | 14 MB | re-rendered, about the same as before |
| `preview/` | 12 MB | |

  - Per body: about 14.7 MB of base layers, 0.65–0.8 MB per face, and 1.4–3.6 MB per hair style (the afro and twists are the biggest).
  - **One finished character is about 18 MB at 80 px per tile, before the 0.6× import shrink.**
  - The git repo grew by about **82 MB** for Batch 6 (`.git` went from 224 MB to 306 MB). That covers both bodies, the player-character re-render and the previews.

**WHY:** Jay approved the round-2 samples and asked for the full set, with option A for the celebrate clipping.

**DECIDE (Jay)**
1. **Body choice labels:** how the player picks the body (for example "Body A/B", "boy/girl", or just two pictures to tap) is a game-rules and words call. In the files they're the placeholders `body-a` and `body-b`.
2. **Option names come from the Content Writer:** all 6 faces, 12 hair styles, 10 skin tones, 10 hair colours, 10 gi colours and the two bodies. The files only use placeholder ids (`face-01`, `hair-09`, the `palettesDraftLabels`).
3. **Puff bounce, later:** a small bounce for the two puffs and the ponytail. The hair is rigid on the head today. It's a later add-on and doesn't change any files here.
4. **[CHANGE CLAUDE CODE MUST HANDLE] The 128 × 160 frame.** Every player sheet (`player-character/` and `player-custom/`) is now 128 × 160, with the anchor at (64, 136.96) (was 104.96).
   - The game must read `frameHeight` and `anchor` from the JSON and update:
     - its player sprite setup;
     - the `player-big` ceremony pack;
     - `tools/art-import/approved.json`, if it lists sizes.
   - It's listed first in `NOTES-FOR-CLAUDE-CODE.md`.

**NEXT:** Jay reviews the previews. Claude Code does the integration using the notes file, then I fix anything that comes up. Batch 7 isn't started; it waits for Jay.

---

# (Earlier) Delivery Note: Batch 6, SAMPLES ROUND 2 (approved), 2026-10-16

**WHAT:** after Jay's feedback on the first samples:

1. **Textured hair:**
   - The afro is redesigned: a round shape of soft coil clumps with lighter tops, and a natural hairline of small coils.
   - **4 new styles:** two puffs (`hair-09`), short twists (`hair-10`), cornrows into braids (`hair-11`) and a high-top fade (`hair-12`).
   - They're based on research into how well-regarded games and Black-community guides do it (`research-textured-hair.md`, sources linked; no art copied).
2. **The fixes I proposed:**
   - a faint light edge around the eyes and a lighter mouth, so faces read on the deepest skin tones;
   - a softer charcoal (`#4a4a55`) instead of the black gi.
3. **A second body, body B (the girl):**
   - the same rig, all 13 animations, the same timing, frame size and feet anchor;
   - the gi and belt layers are unchanged and still tinted, and the belt is still its own layer;
   - a kid-appropriate, softer look: a rounder face, soft cheeks, slightly smaller ears and longer lashes;
   - a proper martial-arts gi. All hair styles work on her.

**Samples, in `preview/`:**
- **(a) textured hair:**
  - `sample2-a-textured-hair-1x-2x.png`: 6 textured styles on deep, medium-deep and medium skin, both bodies, SE and N;
  - `sample2-a-textured-hair-heads-4x-body-a.png` and `-body-b.png`.
- **(b) the girl in motion:**
  - `sample2-b-girl-motion-1.gif` … `-4.gif`: walk, strike, bow and celebrate, facing S, E, NW and N, with a ponytail, two puffs, braids and a bun;
  - `sample2-b-girl-key-frames-2x.png`.
- **(c) both bodies side by side:**
  - `sample2-c-body-a-vs-b-3x.png`: the same options on both, including the charcoal gi on deep skin;
  - `sample2-c-deep-skin-faces-4x.png`: all 6 faces on the 3 deepest tones, both bodies.

The round-1 sample pictures were removed; they're still in git history (ce6e3b2).

**WHY:** Jay asked for better Black and textured hair, the two face and gi fixes, and a girl character so girls can identify with it.

**DECIDE (Jay)**
1. **How the body is chosen and labelled** in the game (for example "Body A/B", "boy/girl", or just two pictures to tap) is a game-rules and words call. In the files they are placeholders `body-a` and `body-b`.
2. **Hair count:** there are now **12** hair styles, more than the brief's 8. Jay asked for the extra ones. OK to keep all 12?
3. **Names:** names for all options and the new styles come from the Content Writer. The research shows names matter: for example, "afro puffs", not "space buns".
4. **Celebrate clipping:** tall hair (the afro, puffs, bun, twists and high-top) touches the top of the 128 px frame on the celebrate hop. The approved player's raised fists already touch it in 4 frames. The options:
   - **(A, my suggestion)** make all player frames 128 × 160 (still 80 px per tile, the feet in the same place, so the feet anchor becomes (64, 136.96)). This is a small change on the game side;
   - **(B)** make the tall styles smaller;
   - **(C)** accept a few cut pixels during the hop.
5. **Faces:** I chose **shared faces** (one set of 6 for both bodies), with her longer lashes in her body layer. That keeps the download small and gives every child the full choice. OK, or would you like a separate set for her?
6. **Body B's differences** are deliberately small (face shape, cheeks, ears, lashes). Should she differ more (for example, a slightly smaller build), or is this right?
7. **Bouncy puffs:** hair is rigid on the head for now. A small bounce, as Animal Crossing players loved, could be added later.
8. **Still open from round 1:** the palettes, and whether the 6 faces and the ponytail/braid length are right.

**NEXT:** after Jay's OK, the full render for both bodies:
- every layer, all 13 animations, all 8 directions;
- the JSON with groups, palettes and both bodies;
- the brief's previews (grids, a line-up of 8, walk and celebrate GIFs).

**Conflicts with the docs:** the brief lists 8 hair styles; there are now 12, because Jay asked for more. Nothing else conflicts.

---

# Earlier: Batch 6 samples round 1 (draft), 2026-10-16

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
