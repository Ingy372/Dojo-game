# Delivery Note: Batch 7, dojo people, SAMPLES 3, 2026-10-17

**WHAT:** the fixes from your review of samples 2 (likenesses approved). These are still samples; there are no full sheets yet.

1. **Sensei's glasses:** the temple arms now run from the frame, back along the side of the head, over the ear, and a little down behind it. They read as real glasses in side and three-quarter views and in the portrait.
2. **The founder's red headband** is still its own optional layer (`headband`), but it's **off by default**: in the JSON (`optionalLayers.headband.default: false`) and in every preview except `sample-4-founder-headband.png`.
3. **New default gi colours** (tints; `suggested.gi` in each JSON):
   - Sensei: charcoal `#4a4a55`, the player palette's charcoal. It reads better than black against the black belt, and the belt keeps its option C rim and centre stripe contrast.
   - instructor-2: medium blue `#3f7fd0`, clearly lighter than the old navy.
   - The founder: white `#f2f2f2`.
4. **Kohai:** no changes to the look. Kohai gets only the collar fix from item 5, because it's in the shared build.
5. **The "open circle below the head" is fixed on all five.** Your school wears a shirt under the gi, so no skin shows except the face, hands and feet.
   - The skin oval in the neck opening (from the Batch 1 model) is removed.
   - The opening is closed with gi cloth on the tinted gi layer, so the whole chest and collar recolour with the gi.
   - The lapels now cross high on the chest, left over right, as a gi is worn, as a subtle lighter line in the gi colour.
   - The sprites and the portraits use the same geometry.

**Previews** (in `preview/`, everything re-rendered for all five):
- `sample-1-lineup.png` and `sample-1-lineup-S-3x.png`;
- `sample-2-<id>.gif`;
- `sample-3-portraits.png` (top row neutral, bottom row happy) and the single `<id>_portrait_<neutral|happy>.png` files;
- `sample-4-founder-headband.png` (the optional headband, switched on).

**The player (Batch 6, already in main) has the same skin oval.** I haven't re-rendered it. It's on the tinted skin layer, so it shows in the player's skin tone. Measured on body A against the committed sheets:
- **At game size (48 px per tile):** a patch of about 4 × 4 px (up to about 19 game pixels) in `walk` and `bow` facing S and SE. It's about half that in `idle`, where the guard fists cover most of it, and it's small facing E.
- **How it reads:** it shows most on dark gis and light skin, and least on a white gi.
- **Re-render cost:** first rebuild the models with the same collar fix (`build_character.py` → `player_character.blend` → `build_custom.py`). Then:
  - re-render `player-character`: about 9 min;
  - re-render bodies A and B: about 80 min each on 8 cores;
  - previews and checks: about 15 min.
  - **Total:** about 3 hours, plus a new set of committed sheets (repo growth similar to Batch 6).

**DECIDE (Jay)**
1. **The player:** fix the collar on the Batch 6 player too (about 3 hours, see above), or leave it?
2. **Names and introductions** for all five come from the Content Writer. Files keep the ids `sensei`, `senpai`, `kohai`, `instructor-2` and `founder`.
3. **The collar:** is the closed gi collar with the crossed lapels what your students' gis look like? Or should the lapels be stronger (a darker line) or subtler?
4. **Body build:** the rig is shared, so the founder isn't broader than Sensei, only older in the face and hair. Is that OK for now, or should I make a sturdier body variant? That's more work, and it touches every animation.
5. **Portrait style:** the gi still looks a little puffy at 512 px. For the full set I'd make the 4 expressions `neutral`, `happy`, `proud` and `thinking`.

The open questions from samples 1 (idle poses, the demonstration technique) still stand.

**NEXT:** once you approve, I'll render the full set for all five:
- `idle`, `walk`, `bow`, `talk`, `nod`, `point`, plus `demonstrate` for Sensei and Senpai, all in 8 directions;
- 4 portraits each;
- the line-up, the GIFs and the portrait sheet.

Then I'll stop for your review again.
