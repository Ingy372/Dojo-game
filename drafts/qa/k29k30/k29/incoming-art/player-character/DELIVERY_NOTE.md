# Delivery Note: Batch 1 review fix (sweep grip), 2026-10-16

**WHAT**
- The sweep has a new grip: both hands hold the handle in front of the body.
  - The right (top) hand is near the end, at chest height.
  - The left hand is partway down.
  - The handle angles down and forward to the bristles.
- The broom is a little shorter (kid-sized), so the bristles stay inside the frame in every direction.
- Re-rendered the sweep (8 directions, all layers). New `preview/player_sweep.gif`, `player_contact_sweep.png` and `sweep-grip-still.png`.

**WHY**
- Jay's review: the rear hand held the back end of the broom, and the handle went through his back.
- The new `tools/check_prop_clearance.py` tests the broom against the body in 3D on every frame, so all 8 directions at once. It finds 0 intersections; the old sweep failed on frame 8.

**DECIDE (Jay):** approve the new sweep grip. Everything else in Batch 1 is already approved.

**NEXT:** nothing more for Batch 1.

**Note:** in SE, on one frame, the bristle tip touches the frame's bottom edge (about 1 px).

# Delivery Note: Batch 1 (complete): the rest of the player animations + style guide draft

**WHAT:** The rest of the player character's animations, in all 8 directions, with every layer:
- **Dash:** a quick burst. He sinks, pushes off the back foot, leans low with the guard tucked, stretches long, lands and comes back to the guard.
- **Hit flinch:** small and quick, never painful-looking. His head and shoulders bob back a little, the guard stays up, and he's ready again in 0.25 s.
- **Cleaning ×3:**
  - **Sweep** (loop) with a broom.
  - **Kneel and wipe** a mat (loop) with a cloth.
  - **Straighten** (once): he reaches out and sets the weapon rack level, with a small nod.
  - The broom and cloth are separate prop layers.
- **Celebrate** (promotion ceremony): a happy jump with both arms up, then a proud, respectful stance with his fists at his hips, so the new belt is in full view.
- **Style guide draft:** `incoming-art/style-guide-draft.md`. It covers the camera, sizes, frame rates, directions, palette, lighting, outlines, layers and tinting, belt rules (option C), naming, and recommended fonts.

Timings are in `sprites/player.json` (and in the README table). Everything is a draft until you approve it.

**WHY:** These are the rest of the player animations on your list: the Dash button, getting hit, the Home Dojo cleaning routine, and the promotion ceremony.

**DECIDE:**
1. Approve (or correct) dash, hit flinch, the 3 cleaning moves and celebrate. **Start with the 3 "review first" pictures:**
   - `preview/review-1-dash-and-hit.png`
   - `preview/review-2-cleaning.png`
   - `preview/review-3-celebrate.png`

   Then `preview/player_<animation>.gif` for each one, all 8 directions at real speed.
2. Approve the style guide draft, and **pick the fonts** (it recommends Fredoka for titles and Nunito for text, both free under the SIL Open Font License).

**NEXT:** Batches 2–4 follow on this branch: Tier 1 enemies, the Home Dojo room and decorations, and the Tower room kit. After approval: customisation parts, icons, portraits.

## Timings

| Animation | Frames @ fps | Length | Key frames (from 0) | Notes |
| --- | --- | --- | --- | --- |
| `dash` | 8 @ 20 | 0.4 s | push 1, travel 1–5, land 5, recover 6–7 | The game moves him 2.5 tiles in 0.25 s (frames 1–5), as in the docs. Played in place. |
| `hit` | 5 @ 20 | 0.25 s | recoil 1, back 4 | Ends on the guard. |
| `sweep` | 8 @ 10 | 0.8 s, loop | | `prop-broom` |
| `wipe` | 8 @ 8 | 1.0 s, loop | | `prop-rag`. One circle per loop; play while the player taps Wipe (4 taps per mat in the game). |
| `straighten` | 14 @ 12 | 1.17 s | reach 3–4, adjust 4–7, nod 10 | Ends on the guard. |
| `celebrate` | 24 @ 16 | 1.5 s, hold the last frame | arms up 4–12, top of the hop 5, proud 18 | |

## Things to know

- **Props:** `prop-broom` and `prop-rag` are their own layers (no tint). They pass correctly in front of or behind him in every direction. In the other animations their sheets are empty.
- **Dash and the docs:** the docs say there's no protection while dashing, so the dash has no "invincible" look (no blur or flash). The game can add a speed trail.
- **Cleaning in the game:** sweeping happens by walking over dust. The sweep loop can play while walking (the feet shuffle in place), or only while standing on a dusty spot. Claude Code's choice.
- **Re-render:** everything is still script-built (`build_character.py --profile player`, `tools/render_sprites.py`). The approved animations were not changed. Only the two prop layers were added to their sheets (empty).

---

# Earlier: bow fix (legs straight) + belt option C confirmed (approved: "looks great")

**WHAT:**
- **Bow:** once the feet come together, the legs go straight: natural, not locked, knee about 172°. Before, it was about 154°. The 30° bow now comes only from the hips, with the head up and the eyes forward as before.
  - The pelvis shifts back 0.045 tiles as he bows, so his hips stay over his feet and the balance looks right.
  - The return to the fighting stance is eased (frames 19–21).
  - Timing is unchanged: 22 frames at 16 fps, 1.375 s, same key frames.
  - The bow's note in `sprites/player.json` now says "legs straight" and "head stays up".
- **Belts:** option C is confirmed (your choice). Nothing about the belts changed in this step.

Only the bow sheets were re-rendered (11 layers). This is a draft until you approve it.

**WHY:** You said bowing with bent knees looks awkward. A proper rei keeps the legs straight and bends only at the hips.

**DECIDE:** Please approve (or correct) the bow:
- `preview/player_bow.gif`: all 8 directions.
- `preview/bow-side-before-after.png`: the feet-together frame (3) and the lowest point (11), from E, W and S, before (knees bent) vs now (legs straight).

**NEXT:** Once you approve, I'll make the remaining player animations: dash, hit flinch, cleaning ×3 (sweep, kneel and wipe, straighten) and celebrate. Then `style-guide-draft.md`.

---

# Earlier: Batch 1 revision (belts and bow); belt option C confirmed by Jay

**WHAT:** Your two Batch 1 notes are fixed. Everything is re-rendered in all 8 directions:
- **Black belts pop.** On red/black, brown/black and solid black, the black now shows instantly at real size. The belt layer is still neutral and recolourable; the game picks the tints per belt (table in `sprites/player.json`, `beltStyles`).
- **Bow with eyes up.** He bows 30° from the hips like before, but his head stays up and his eyes stay on the partner, the way a martial arts rei is done.

Jab, defeat and the new strike are approved and unchanged. Only the belt (a bit taller) and the bow head are different. This is a draft until you approve it.

**WHY:** You said the black was still hard to see on the two-colour belts and the black belt, and that a rei keeps the eyes on the partner, not on the floor.

**DECIDE:** Please approve (or correct) the belt look and the bow:
1. `preview/belt-chart.png`: the current belts and 3 options (A, B, C) at real size and 4×, with white and yellow for reference. **I picked C.**
2. `preview/player_bow.gif`: the bow in all 8 directions.
3. `preview/bow-side-before-after.png`: the lowest point of the bow from the side (E, W) and the front (S, SE), old (eyes down) and new (eyes up).

**NEXT:** Once you approve, I'll make the remaining player animations: dash, hit flinch, cleaning ×3 (sweep, kneel and wipe, straighten) and celebrate. Then `style-guide-draft.md`.

---

## Belts: the options and my pick

All three options use the slightly taller belt: 0.08 tiles instead of 0.072 (about 6 px instead of 5). The centre stripe is now 0.036 tall, 45% of the belt.

| Option | What changes | How it looks |
| --- | --- | --- |
| **A** | The rim around a black belt is light grey (`#c9ccd6`) instead of dark. | The black belt finally has an edge against the dark outline. Red/black and brown/black don't change. |
| **B** | A, plus a thin light line between the colour and the black on two-colour belts. | The lines are only about 1 px. At real size they wash the red and brown out into pink/beige stripes, so the belt reads as "striped", not as "red and black". |
| **C (picked)** | A, plus: the black on a black belt is a slightly lighter, neutral black (`#26272f`) with a bright top sheen (`#a2a6b6`). The black centre stripe on two-colour belts is a deep black (`#111116`). No separator line. | Best at real size. The black belt has a light edge and a shine, so it reads as a black belt instead of a dark blob. On red/black and brown/black, the deep-black centre contrasts strongly with the colour on both sides. |

- **Why C:** the black centre stripe never touches the dark outline (it sits between two coloured bands), so it can be truly black. Only the black next to the outline needs to be lighter, plus a light edge and a sheen.
- **Not blue:** I tried a blue-black too (`#262c40`). Next to the blue belt it looked navy, so C keeps the black neutral.
- **Light belts:** white, yellow and the other light belts keep the dark rim (`#2e2a3a`), so the white belt still stands out on the white gi.

## Bow: eyes on the partner

- The body is the same as before: feet together, hands at the sides, a 30° bow from the hips, back straight.
- The head now tilts back up as the body bows (27° against the 30° bow), so the face stays forward and the eyes stay on the partner. The neck stays in line with the back.
- Facing the camera (S), you see his face during the whole bow (before, you saw the top of his head).
- Timing is unchanged: 22 frames at 16 fps (1.375 s); key frames are in `sprites/player.json`.

## Other notes

- **PR #1 was merged.** I brought `bot-art` up to date with `main` (a normal fast-forward, no force push), and this revision is in a new pull request.
- **Layers:** there are 2 new belt layers, `belt-sheen` and `belt-center-edge` (the separator, only used by option B; skip it), and `belt-rim` is now tinted per belt. All 11 layers × 7 animations (77 sheets) are re-rendered. See `README.md`.
- **New preview tool:** `tools/make_still.py` makes pose stills (used for the bow side view). The belt chart can now show several style options.
- **Nothing from outside** was used (`incoming-art/SOURCES.md`).

# Earlier: Batch 1 (samples), delivered 2026-10-16 (jab, defeat and strike approved)

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
- PR #1 was still open at the time, so Batch 1 went into PR #1, which has since been merged.
- **Script fixes:**
  - `render_sprites.py --layers` used to let the other layers show up in a partial render. Fixed, and it can't change a full render.
  - The tools gained per-animation GIFs, a before/after strip and a belt chart maker.
- **Nothing from outside** was used (`incoming-art/SOURCES.md`).

## Files

| File | What it is |
| --- | --- |
| `README.md` | Technical sheet: frames, fps, key frames, layers, re-render commands. |
| `sprites/player_<layer>_<animation>.png` | Now 77 sheets: 11 layers × 7 animations (idle, walk, strike, counter, jab, bow, defeat). |
| `sprites/player.json` | Frame size, feet point, directions, timing, key frames, hold/repeat notes, tint guidance. |
| `source/player_character.blend` | The Blender file (built by `../character-test/source/build_character.py --profile player`). |
| `preview/player_jab.gif`, `player_bow.gif`, `player_defeat.gif`, `player_strike.gif` | One GIF per animation, all 8 directions, real timing. |
| `preview/strike-before-after.gif`, `strike-S-before-after.png` | The Strike, approved test vs Batch 1 (S, SE, SW; the strip shows S). |
| `preview/belt-chart.png` | Belts: current vs options A, B, C, at 1× and 4×. |
| `preview/bow-side-before-after.png` | The bow's lowest point from E, W, S and SE, eyes down (before) vs eyes up (now). |
| `preview/player_belts.png`, `belt-back.png`, `head-closeup.png`, `player_contact_<animation>.png` | The usual previews: all 10 belts, the belt from behind, the face, every frame. |
