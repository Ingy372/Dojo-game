# Delivery Note: Batch 7, dojo people, SAMPLES 2, 2026-10-17

**WHAT:** the second sample round, after your feedback on samples 1. All characters are built by script on the approved player models: the same rig, 35° camera, light and outline, with the belt as its own tinted layer set. Frames are 128 × 160 px with feet anchor (64, 136.96).

**What changed since samples 1:**
- **Sensei** is now a friendly cartoon likeness of you, based on reference photos you provided (not stored in the repo). He has light skin, short brown hair (short sides, a tousled top swept up at the front), your bold black rectangular glasses (on in class), a light brown moustache and short chin beard, and a big warm smile. He's still the tallest, calm, with a black belt and a dark navy gi.
- **Senpai** now has a **brown/black** belt. The game tints the belt, so only the previews changed; her sprites weren't re-rendered.
- **New: `instructor-2`** (your wife; the name comes from the Content Writer). She's a friendly cartoon likeness, based on reference photos you provided (not stored in the repo), built on body B. She's an adult, between Senpai and Sensei in height, with fair skin and light freckles and blue-grey eyes. Her long straight dark brown hair goes past the chest, and the purple ends are baked in as a key feature, mostly on her left. She has a big warm smile, a charcoal gi and a **black belt** (you confirmed). The long hair hangs from the chest bone, so it follows her in the bow.
- **New: `founder`** (the school's founder; the name comes from the Content Writer). He's a friendly cartoon likeness, based on reference photos you provided (not stored in the repo), built on body A, about Sensei's height and visibly the elder:
  - tanned olive skin and short wavy dark hair going grey at the temples;
  - a full grey-and-dark moustache with light stubble;
  - a broad toothy smile, with crinkly smiling eyes and smile lines;
  - a white gi and a black belt.
  - His **red headband** is an optional overlay layer (`headband`), so the game can switch it on or off. It's off in the line-up and GIF, and shown on its own in `sample-4-founder-headband.png`.
- **Kohai** is unchanged.
- **Not changed, as you asked:** Sensei's demonstration, body B's ears in Batch 6, and all file ids.

**Previews** (in `preview/`):
1. `sample-1-lineup.png`: everyone next to the player, facing S, SE, E and N, at game size (48 px per tile) and at 3× game size. `sample-1-lineup-S-3x.png` is the "at a glance" row, all facing you.
2. GIFs facing S, SE and E:
   - `sample-2-sensei.gif`: idle, bow, then the demonstration;
   - `sample-2-instructor-2.gif` and `sample-2-founder.gif`: idle and bow;
   - `sample-2-senpai.gif`: idle and bow, now with the brown/black belt;
   - `sample-2-kohai.gif`: unchanged.
3. Portrait drafts, 512 × 512 px:
   - `sample-3-portraits.png` puts them all on one sheet: the top row is neutral (Senpai and Kohai have one portrait each, in that row) and the bottom row is happy;
   - singles: `<id>_portrait_neutral.png`, plus `<id>_portrait_happy.png` for Sensei, instructor-2 and the founder.
4. `sample-4-founder-headband.png`: the founder with the optional red headband, as a portrait and in 4 directions.

**WHY:** your feedback on samples 1. These are still samples; the full sheets come after your OK.

**DECIDE (Jay)**
1. **Names and introductions** for all five come from the Content Writer. Files keep the ids `sensei`, `senpai`, `kohai`, `instructor-2` and `founder`.
2. **The founder's red headband:** keep it as an optional extra (for example for special events, or the beach training), make it always on, or drop it?
3. **The founder's gi:** plain white, as in the photos. The game tints the gi, so a different colour is easy.
4. **instructor-2's gi:** charcoal is a placeholder so she reads apart from Sensei's navy and the white gis. What does she wear?
5. **The likenesses:** do the three faces read as the right people? Tell me what to push (hair, smile, glasses, moustache, freckles, the purple ends).
6. **Kohai:** still the samples-1 placeholder (a small child, light skin, curly red hair, white belt). Any change?
7. **Body build:** the rig is shared, so the founder isn't broader than Sensei, only older in the face and hair. Is that OK for now, or should I make a sturdier body variant? That's more work, and it touches every animation.
8. **Portrait style:** as in samples 1, the gi still looks a little puffy at 512 px. For the full set I'd make the 4 expressions `neutral`, `happy`, `proud` and `thinking`.

The open questions from samples 1 (idle poses, the demonstration technique) still stand.

**NEXT:** once you approve or change the looks, I'll render the full set for all five:
- `idle`, `walk`, `bow`, `talk`, `nod`, `point`, plus `demonstrate` for Sensei and Senpai, all in 8 directions;
- 4 portraits each;
- the line-up, the GIFs and the portrait sheet.

Then I'll stop for your review again.
