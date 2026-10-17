# Delivery Note: Batch 7, Sensei, Senpai and Kohai, SAMPLES, 2026-10-17

**WHAT:** three samples for the three dojo characters, built by script on the approved player models. They share the same rig, 35° camera, light, outline, and the belt as its own tinted layer set. Frames are 128 × 160 px with feet anchor (64, 136.96).

1. **The line-up:**
   - `preview/sample-1-lineup.png`: the three next to the player, facing S, SE, E and N, at game size (48 px per tile) and at 3× game size.
   - `preview/sample-1-lineup-S-3x.png`: the "at a glance" check, the four of them facing the camera.
2. **One GIF per character,** facing S, SE and E:
   - `preview/sample-2-sensei.gif`: idle, bow, then a slow demonstration (a block, then a punch);
   - `preview/sample-2-senpai.gif` and `preview/sample-2-kohai.gif`: idle and bow.
3. **Portrait drafts,** 512 × 512 px, head and shoulders facing you, with the belt at the bottom edge:
   - `preview/sensei_portrait_neutral.png`, `senpai_portrait_neutral.png`, `kohai_portrait_neutral.png`;
   - all three together: `preview/sample-3-portraits.png`.

**How you tell them apart:**
- **Sensei:** the tallest, with a short grey beard and a dark navy gi.
- **Senpai:** about the player's height, a little taller, with a high ponytail.
- **Kohai:** the smallest, with a bigger head of curly red hair and hands held together in front.
- **Skin tones:** deep (Sensei), medium (Senpai) and light (Kohai).

**The technique:**
- **The bow** follows your rules: heels together, legs straight, the bend only from the hips with a straight back, head up and eyes forward.
- **Sensei's demonstration,** in order:
  1. He steps out to a natural parallel stance, fists ready in front of the belt.
  2. A left inside-to-outside middle block, with the right fist at the hip.
  3. A right middle punch to the centre line at chest height, while the left fist pulls back to the hip. The elbow stays soft and the shoulders stay level, with a short hold.
  4. Back to ready.

The full sheets aren't rendered yet.

**WHY:** this is the samples-first rule from the brief, so you can approve the looks, sizes and technique before the full set (6 animations × 8 directions, and 4 expressions each for the portraits).

**DECIDE (Jay)**
1. **Names:** the three characters (Content Writer). Files use only the ids `sensei`, `senpai` and `kohai`.
2. **Who looks like what (my placeholders, change any of them):**
   - **Sensei:** an adult man, deep brown skin, grey hair and beard, navy gi.
   - **Senpai:** a teen girl (built on body B), medium skin, a dark brown high ponytail, white gi.
   - **Kohai:** a small child, light skin, curly red hair, white gi. I left it open whether Kohai is a boy or a girl.

   Do you want different genders, ages, skin tones or hair?
3. **Real or made up?** Reward messages say "Sensei Jay signed off…", so the in-game Sensei could be read as the real instructor. Is the in-game Sensei a made-up teacher (that's what I drew, not based on any real person), or a stand-in for each student's real instructor? If it's a stand-in, a more neutral look may suit better.
4. **Belt colours:**
   - Senpai is a black belt now; the brief allows brown/black or black. Which one?
   - Sensei is black, Kohai white, as the brief says.
5. **Gi colours:** navy for Sensei, and white for Senpai and Kohai. The gi is tinted by the game, so these are just suggestions. OK, or does your dojo's instructor wear something else?
6. **Idle poses:** they suggest each character a little (Sensei standing tall and calm, Senpai relaxed with a hand by the belt knot, Kohai shy with hands together). Keep them, or make all three the same neutral stance? Personality is your and the Content Writer's call.
7. **The demonstration technique:** dojos name and do blocks differently. Is a left inside-to-outside middle block, then a right middle punch, the "basic punch and block" your students learn? If not, which block (rising, outside, low) and which stance?
8. **Portrait style:** the portraits use a thinner outline (about 3–4 px at 512 px) and smoother curves than the sprites. The gi still looks a little puffy at this size. OK as a direction? For the full set I'd make the 4 expressions: `neutral`, `happy`, `proud`, `thinking`.
9. **Found in Batch 6 (already approved), body B's ears:** the build script moved them down to the jaw by mistake (the ear shrink scaled about the wrong point).
   - At game size it's a tiny bump at the jaw line, and the hair often hides it.
   - It's fixed for Senpai here.
   - Should I fix it in Batch 6 too? That's a one-line fix, then re-render body B, about 80 minutes.

**NEXT:** once you approve or change the looks, I'll render the full set:
- `idle`, `walk` (calm, about 2 tiles/s), `bow`, `talk`, `nod`, `point`, plus `demonstrate` for Sensei and Senpai, all in 8 directions;
- 4 portraits each;
- the line-up next to the player, a GIF of every animation, and the sheet of all 12 portraits.

Then I'll stop for your review again.
