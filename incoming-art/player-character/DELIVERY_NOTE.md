# Delivery Note: Batch 1 (samples): player character fixes + jab, bow, defeat

**WHAT:** The approved martial artist, with your 3 fixes and 3 sample animations, all rendered in 8 directions with every layer:
- **Fixes:**
  - The white belt now stands out on the white gi.
  - Two-colour belts have a much wider centre stripe.
  - The Strike now reads when he faces the camera.
- **New samples:**
  - **Jab:** the quick automatic attack.
  - **Bow:** a proper standing rei.
  - **Defeat:** a soft "Ouch!", then he kneels down to rest.

Everything is built and rendered by the same scripts as the test, so changes re-render cheaply. This is a draft until you approve it.

**WHY:** You asked to see 3 samples before any big batch. These are the animations the game already needs: the auto-attack every 0.6 s, the bow at the dojo and each Tower floor, and the defeat moment. The fixes make the belt rank and the Strike readable on a phone.

**DECIDE:** Please approve (or correct) the 3 samples (jab, bow, defeat) and the 3 fixes before I do the rest of the player character's animations:
- Dash
- Hit flinch
- Cleaning: sweep, kneel and wipe, straighten
- Celebrate

and the style guide draft. Look at these pictures:

1. `preview/belt-chart.png`: before and after, at real size and 4× (white, yellow, red/black, brown/black and black belts).
2. `preview/strike-before-after.gif` and `preview/strike-S-before-after.png`: the Strike facing the camera, old and new.
3. `preview/player_jab.gif`, `preview/player_bow.gif`, `preview/player_defeat.gif`: one GIF per sample, all 8 directions.

**NEXT:** Once you approve, I'll make the rest of the animations listed above, then the style guide draft and the customisation parts (skin tones, faces, hair). Claude Code can put the samples in the game whenever you like. The timings are in `sprites/player.json`.

---

## The fixes

1. **White belt on a white gi.**
   - A new dark rim (`#2e2a3a`) runs just above and just below the belt, and above and below the knot. It's like a bold border, so the edge shows even when the belt and the gi are both white.
   - The rim is its own layer and is never recoloured, so it works on every belt and gi colour. The belt layer itself is still neutral grey and recolourable.
   - The belt is a little taller (0.072 tiles instead of 0.05, about 5 px instead of 3–4), so the colour, the stripe and the edges all fit. I checked it at real size in `belt-chart.png`.
2. **Two-colour belts.** The centre stripe is 2½ times as tall: 0.032 tiles (about 2 px) instead of 0.013 (about 1 px). It now covers 44% of the belt's height (it was 26%), so red/black and brown/black read as colour, black, colour. The stripe on the belt tails is wider too.
3. **Strike from the front.** Same reverse punch, with better body mechanics so it reads from S, SE and SW:
   - **Lunge:** the front foot steps further forward (0.31 tiles ahead, was 0.25), and the hips travel forward 0.18 tiles (was 0.09) and drop 0.135 (was 0.09). Facing the camera, his head now drops 19 px at the hit (it was 10).
   - **Turn:** the hips turn 50° from the wind-up to the hit and finish square to the target, and the shoulders turn with them, so the punching shoulder comes forward (44°, was 38°).
   - **Good technique:**
     - The rear foot stays planted, so the base is stable.
     - The front knee is bent and stays over the foot.
     - The other hand pulls back to the hip (hikite).
     - The punch stops at 95% of arm reach, so the elbow isn't locked. The old one was at 98%.
   - The game's own lunge movement stays in code, as before.

## The 3 samples

| Sample | Frames / fps | Length | What it does |
| --- | --- | --- | --- |
| **Jab** (basic attack) | 6 @ 20 fps | 0.3 s | A quick lead-hand jab from the guard. A small hip and shoulder turn, no step. The rear hand stays up by the chin. The hit lands on frame 3 (index 2). It's clearly smaller and lighter than the Strike: no lunge, a short reach, half the time. It ends exactly on the guard, so it repeats every 0.6 s, or hands back to idle, without a jump. |
| **Bow** (rei) | 22 @ 16 fps | 1.375 s | The feet come together (heels together, toes slightly apart) with the hands at the sides. Then a 30° bow from the hips with the back and neck straight and the eyes down, a short hold (0.3 s), and he rises. The last 3 frames return to the fighting stance. |
| **Defeat** | 16 @ 12 fps | 1.33 s, then hold | A small surprised "ouch" (he leans back a little), the shoulders sag, then he sinks gently onto one knee. One hand rests on his knee, head down, catching his breath. It ends on a still pose to hold during the fade and "Ouch! Back to the start." Tired, never hurt; nothing violent. |

## Things to know (differences from the docs and the game)

- **Bow length:** the game's bow takes 0.9 s (code). Mine is 1.375 s, because a real rei with a hold looks rushed in 0.9 s. Claude Code can set the bow to 1.375 s, or play only the bow itself (frames 3–18, 1.0 s), or play all of it faster (24 fps = 0.92 s).
- **Auto-attack while walking:** the docs say basic attacks fire every 0.6 s even while walking. The jab is a whole-body sprite, so playing it mid-walk would freeze his legs for 0.3 s. Two options for Claude Code: play the jab only when standing still, or keep the walk running while moving (and show the hit with an effect). Upper-body-only sprites are possible later if you want them.
- **PR #1 is still open,** so this batch is committed to the same `bot-art` branch. GitHub allows only one open pull request from `bot-art` to `main`, so it shows up in PR #1 instead of a new PR. Merging PR #1 now would bring these drafts with it, but they are only files in `incoming-art/`.
- **Script fixes:**
  - `render_sprites.py --layers` used to let the other layers show up in a partial render. Fixed, and it can't change a full render.
  - The tools gained per-animation GIFs, a before/after strip and a belt chart maker.
- **Nothing from outside** was used (`incoming-art/SOURCES.md`).

## Files

| File | What it is |
| --- | --- |
| `README.md` | Technical sheet: frames, fps, key frames, layers, re-render commands. |
| `sprites/player_<layer>_<animation>.png` | 63 sheets: 9 layers × 7 animations (idle, walk, strike, counter, jab, bow, defeat). |
| `sprites/player.json` | Frame size, feet point, directions, timing, key frames, hold/repeat notes, tint guidance. |
| `source/player_character.blend` | The Blender file (built by `../character-test/source/build_character.py --profile player`). |
| `preview/player_jab.gif`, `player_bow.gif`, `player_defeat.gif`, `player_strike.gif` | One GIF per animation, all 8 directions, real timing. |
| `preview/strike-before-after.gif`, `strike-S-before-after.png` | The Strike, approved test vs Batch 1 (S, SE, SW; the strip shows S). |
| `preview/belt-chart.png` | Belts before vs after, at 1× and 4×. |
| `preview/player_belts.png`, `belt-back.png`, `head-closeup.png`, `player_contact_<animation>.png` | The usual previews: all 10 belts, the belt from behind, the face, every frame. |
