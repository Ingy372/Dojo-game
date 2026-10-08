# Delivery Note: one-character test

**WHAT:** One martial artist built in Blender with 4 animations: idle (fighting stance), walk (a natural jog matched to the game's speed), strike (a stepping reverse punch) and counter (a held block, then a counter punch). All 4 are rendered in 8 directions as see-through PNG sprite sheets. The belt is its own layer in plain grey so the game can colour it, with extra layers for the second colour on two-colour belts and up to 2 rank stripes. The gi is its own layer too. Everything also comes with the Blender file, the script that builds the character, the reusable render script and preview pictures.

**WHY:** This is the art style test from section 13 of the design. Claude Code will put this character in the game in place of the white circle, so you can see it moving on your phone and decide whether this is the look for the whole game.

**DECIDE:** Is Revision 2 ready to go into the game? Start with `preview/walk-compare.gif` (old walk next to the new jog) and `preview/belt-back.png` (the belt from behind). You'll judge the size on your phone.

**NEXT:** Once you're happy, Claude Code puts it in the game on a test branch for you to see on your phone. After your approval: the style guide draft (`incoming-art/style-guide-draft.md`), then the full customizable player character (skin tones, faces, hair styles and colours as their own layers).

---

## Revision 2 (belt gap and walk)

**1. The belt is now one unbroken band.**
- **What was wrong:** the bug was in the jacket, not the belt. A helper in my build script turned shapes that point straight down sideways. That made the jacket's lower half (the part under the belt) deeper front-to-back than the belt: 0.148 tiles against the belt's 0.131. So at the back, the jacket poked out through the belt and the belt looked cut in two.
- **The fix:** I fixed the helper. The jacket now sits fully inside the belt all the way round, outline included. The belt itself didn't change: same layer, same grey for tinting, same stripes and edge layers.
- **How I checked:** I traced lines from the camera to about 100 points around the belt in every frame of all 4 animations, in all 8 directions. The jacket never covers the belt now. Only things that should cover it still do: a swinging hand or arm, or a lifted knee brushing the bottom edge at the front.
- **Side effect:** the jacket below the belt is now a little slimmer front-to-back and wider side-to-side, which is the shape I first meant to give it.
- **See:** `preview/belt-back.png`, the waist at 4× in N, NE, E and NW for idle, the strike impact, the counter punch and a walk frame. It uses a blue belt so any gap would stand out.

**2. The walk is now a natural jog.**
- **What was wrong:**
  - It was a leaping run. Each step was 1.125 tiles, more than twice his leg length, at only 4 steps a second. So he bounded along instead of walking or running.
  - With only 8 frames, each foot sat still for 2 frames, then jumped up behind him in a single frame (a "pop").
  - The arms pumped up and down in front of the chest instead of swinging.
  - The body leaned forward a lot, and it bobbed out of step with the feet.
- **Why a jog:** 4.5 tiles/s is too fast for a walk at this size. His legs are only about half a tile long, so a real walk would either slide the feet or need impossibly fast legs. A jog is the natural gait at this speed, and it stays called `walk` so nothing changes in the game code.
- **The new cycle:** 10 frames at 30 fps, so one loop (2 steps) takes 1/3 s.
  - It covers 120 px (1.5 tiles) per loop, 12 px per frame. Each step is 0.75 tiles, a third shorter than before.
  - Each step has 5 poses: contact (heel lands), down (knee bends to take the weight, lowest point), push (heel peels off), up (a short float), and reach.
  - The hips twist toward the front leg and the shoulders twist the other way.
  - The arms are relaxed, with the elbows bent, swinging opposite the legs. I picked relaxed arms over a guard because a guard looks stiff at jogging speed. The guard stays in the stance.
  - The body bobs about 3 px.
- **Feet:** each foot stays planted for 3 frames. I measured it in Blender: the planted foot moves back exactly 0.15 tiles (12 px) per frame, the same distance the game moves him, so it doesn't slide. The toe lifts clear as the foot leaves the ground. The legs never fully straighten, so the knees don't pop.
- **In the JSON:** the stride is 120 px per loop and the design speed is 4.5 tiles/s. For other speeds, fps = speed × 6.667.
- **See:** `preview/walk-compare.gif`, the old walk (commit 3f86416) next to the new one in E and SE. The floor grid moves at 4.5 tiles/s, so you can see whether the feet stick.

**3. Previews are regenerated.** The main GIF now runs on a 30 fps clock so the jog plays every frame. The two new pictures are listed in the file table below.

## Revision 1 (after Jay's review of PR #1)

**Your answers:** the Strike stays a punch, and the Counter stays a block then a counter punch. The stance is confirmed: left foot forward, hands up in a guard. The camera stays at 35°. The size will be decided in the game.

**What changed and why:**

1. **Hairline raised** (your main note). The hair used to come down over the eyes. Now the hairline sits clearly above the eyebrows, the fringe is short and lies flat on the forehead, and short sideburns frame the face. In the side views, more of the cheek shows and the eyes sit a little wider apart, so an eye is still visible. The rest of the look is unchanged. See `preview/head-closeup.png` (S, SE, E, SW and W at 4× zoom).
2. **The block is slower and easier to read.** The block is now held for 4 extra frames:
   - The block part lasts 0.5 s (8 frames at 16 fps). It was 0.25 s, so it's 0.25 s longer.
   - The counter punch keeps its speed (4 frames, 0.25 s).
   - The whole counter is now 12 frames (0.75 s) instead of 8 (0.5 s).
3. **No more foot sliding** (this walk was replaced by the jog in Revision 2). The game moves the character 4.5 tiles a second, which is 360 render pixels a second.
   - The old walk only covered 48 px per loop, but in that time the game moved the character 240 px, so the feet slid about 190 px every loop.
   - The new walk is a light running step: 8 frames at 16 fps, covering 180 px (2.25 tiles) per loop, or 22.5 px a frame.
   - I measured the planted foot in the renders: it moves back 22.9 px between frames while the game moves the character forward 22.5 px. That's less than half a pixel of slip, so the feet stay put.
   - The JSON includes these numbers, so the game can speed up or slow down the animation if the move speed changes.
4. **Rank stripes are bigger and easier to see.** Each stripe is now 4 px long along the belt tail (it was 1–2 px) and about 3–4 px across. Each stripe also has a 1 px light edge at both ends, so it shows up on any belt colour. The edge is its own layer and is never recoloured. The belt tails are a little longer to fit both stripes.
5. **Black belts read better.** The JSON now tells the game to draw black belts in a very dark charcoal (`#3c3c44`) instead of pure black. The belt also has a slightly lighter top edge, built into its grey layer, so every belt colour (black included) shows an edge against the dark outline. The belt layer is still neutral grey and recolourable.
6. Previews are regenerated: GIF, contact sheets, belt chart, plus the new head close-up. The camera-angle comparison was removed now that 35° is settled.

## What's in this folder

| File | What it is |
| --- | --- |
| `README.md` | The technical sheet: frame size, frames per animation, frames per second, how the layers work, how to re-render. **Claude Code: start here.** |
| `DELIVERY_NOTE.md` | This note. |
| `sprites/martial-artist_<layer>_<animation>.png` | 32 sprite sheets: 8 layers × 4 animations. Each sheet has 8 rows (directions) and one column per frame. |
| `sprites/martial-artist.json` | A description of the sheets the import script can read: frame size, feet position, direction order, frames, fps, looping, special frames, walk speed sync, and how to colour each layer. |
| `source/martial_artist.blend` | The Blender file: model, skeleton, materials, layers and the 4 animations. |
| `source/build_character.py` | The script that builds the `.blend` from nothing. Change a number, run it again, and you get the same character with that change. |
| `preview/martial-artist_preview.gif` | Every animation in every direction, moving, with a yellow belt and 1 stripe. |
| `preview/martial-artist_contact_<animation>.png` | Every frame of each animation, shown at double size. |
| `preview/martial-artist_belts.png` | The character with all 10 Action Zone belts, coloured the way the game would do it (2 stripes on the coloured belts, black as charcoal). |
| `preview/head-closeup.png` | The face in S, SE, E, SW and W at 4× zoom, to check the hairline. |
| `preview/belt-back.png` | The waist at 4× in N, NE, E and NW (idle, strike impact, counter punch, walk), to check the belt is one unbroken band. |
| `preview/walk-compare.gif` | The old walk (3f86416) next to the new jog in E and SE, over a floor grid moving at 4.5 tiles/s. |

Shared files outside this folder (the docs ask for them): `incoming-art/tools/` (render script, preview maker, comparison GIF maker, README) and `incoming-art/SOURCES.md` (nothing from outside was used).

## Specs at a glance

| | |
| --- | --- |
| Frame size | 128 × 128 px, transparent PNG (RGBA) |
| Feet point (anchor) | x 64, y 105 (from the frame's top-left) |
| Scale | 1 game tile = 80 px across in the render |
| Camera | Orthographic, looking down 35°, fixed, the same for all art |
| Directions (rows, top to bottom) | N, NE, E, SE, S, SW, W, NW (N = facing up the screen, S = facing the player) |
| Idle | 8 frames, 8 fps, loops (1 s) |
| Walk (a jog) | 10 frames, 30 fps, loops (1/3 s). Covers 120 px = 1.5 tiles per loop, matched to 4.5 tiles/s. For other speeds, fps = speed in tiles/s × 6.667. |
| Strike | 8 frames, 16 fps, plays once (0.5 s). The hit lands on frame 5. |
| Counter | 12 frames, 16 fps, plays once (0.75 s). Frames 1–8 are the block, held from frame 4 to 8 (0.5 s). The counter punch lands on frame 9, and frames 9–12 are the punch (0.25 s). |
| Layers (bottom to top) | body · gi (recoloured) · belt (recoloured, with a light top edge) · belt-center (second colour on two-colour belts) · belt-tape1-edge (light, not recoloured) · belt-tape1 (recoloured) · belt-tape2-edge · belt-tape2 |

## Known issues and differences from the docs

- **No Mixamo.** The skeleton and animations were made by hand in a Python script, so nothing outside the project is used and every move can be adjusted by number.
- **The character is made of solid parts on a skeleton** (like an action figure) rather than one bendy skin. That's normal for low-poly game art. The joints are hidden by rounded gi pieces.
- **The walk is a jog.** At 4.5 tiles/s with these short legs, a walk can't keep the feet planted. Each foot is on the ground for 3 frames, and both feet are off the ground for 2 frames between steps (a short float). It runs at 30 fps, faster than the other animations (8 to 16 fps).
- **Stripes are hidden in some frames.** They're on the belt tail, so you can't see them when the character faces away (N, NE, NW), and an arm or leg sometimes covers them for a frame.
- **Side views (E and W):** the face is seen side-on, so only one eye shows, near the edge of the head. That's expected for a side view. Front and three-quarter views show both eyes clearly.
- **Only one skin tone and hair style so far.** Skin, face and hair are all in the "body" layer for this test. In the full character they become their own layers.
- **No ground shadow** is drawn into the sprites. The game can put a soft oval under the feet point.
- **Edges between layers:** where two layers meet, the soft edge pixels can let a hint of background through once stacked. The dark outlines sit on those edges, so I couldn't see it in any preview.

## Questions for Jay

- None right now. The size will be judged in the game.
