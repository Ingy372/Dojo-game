# Delivery Note: one-character test

**WHAT:** One martial artist built in Blender with 4 animations: idle (fighting stance), walk, strike (a stepping reverse punch) and counter (a block, then a counter punch). All 4 are rendered in 8 directions as see-through PNG sprite sheets. The belt is its own layer in plain grey so the game can colour it, and the gi is its own layer too. Everything also comes with the Blender file, the script that builds the character, the reusable render script and preview pictures.

**WHY:** This is the art style test from section 13 of the design. Claude Code will put this character in the game in place of the white circle, so you can see it moving on your phone and decide whether this is the look for the whole game.

**DECIDE:**
1. **Does the look work?** Bright, chunky "chibi" proportions (big head, short body), flat cartoon shading and a thin dark outline. Start with `preview/martial-artist_preview.gif`.
2. **Camera angle.** The design says "top-down three-quarter view" but doesn't give a number. I used **35°** (looking down 35° from level) because the face is still easy to see. 45° shows more of the top of the head, and 30° looks more from the side. Compare them in `preview/camera-angle-options.png`. Whatever you pick applies to every piece of art from now on.
3. **Technique check.** Please judge the moves like a student's:
   - Strike: from a left-forward fighting stance, the right fist loads at the hip, the front foot steps in, the hips turn, the right fist drives straight out on the centre line, and the left hand pulls back to the hip.
   - Counter: the lead (left) arm does an outside middle block while the right fist goes to the hip, then a right counter punch.

   Tell me what to change (stance width, guard height, chambering, which block) and I'll fix it.
4. **Strike as a punch or a kick?** I made the Strike a punch because the game's Strike is "one heavy hit with a short lunge". If you'd rather it be a kick (for example a chambered front kick), I can swap it.
5. **Size on screen.** Drawn at the game's true scale, the character is about 1.3 tiles tall and half a tile wide. It's taller than the current circle but narrower. You asked for a slightly bigger character in milestone 1, so Claude Code can draw it larger if you like. The sprites have room for that.

**NEXT:** I'll wait for your approval and any changes. After that, as `docs/GROK_BOTS.md` says: the style guide draft (`incoming-art/style-guide-draft.md`), then the full customizable player character (skin tones, faces, hair styles and colours as their own layers).

---

## What's in this folder

| File | What it is |
| --- | --- |
| `README.md` | The technical sheet: frame size, frames per animation, frames per second, how the layers work, how to re-render. **Claude Code: start here.** |
| `DELIVERY_NOTE.md` | This note. |
| `sprites/martial-artist_<layer>_<animation>.png` | 24 sprite sheets: 6 layers × 4 animations. Each sheet has 8 rows (directions) and 8 columns (frames). |
| `sprites/martial-artist.json` | A description of the sheets the import script can read: frame size, feet position, direction order, frames, fps, looping, and the special frames (impact, block). |
| `source/martial_artist.blend` | The Blender file: model, skeleton, materials, layers and the 4 animations. |
| `source/build_character.py` | The script that builds the `.blend` from nothing. Change a number, run it again, and you get the same character with that change. |
| `preview/martial-artist_preview.gif` | Every animation in every direction, moving, with a yellow belt. |
| `preview/martial-artist_contact_<animation>.png` | Every frame of each animation, shown at double size. |
| `preview/martial-artist_belts.png` | The same character with all 10 Action Zone belts, coloured the way the game would do it (with stripes on the coloured belts). |
| `preview/camera-angle-options.png` | The 45° / 35° / 30° camera comparison. |

Shared files outside this folder (the docs ask for them):
- `incoming-art/tools/render_sprites.py`: the reusable render script (`docs/GROK_BOTS.md`: "saved in incoming-art/tools/").
- `incoming-art/tools/make_preview.py` and `incoming-art/tools/README.md`: the preview maker and how to use both tools.
- `incoming-art/SOURCES.md`: the list of outside material. It's empty because everything was made from scratch.

## Specs at a glance

| | |
| --- | --- |
| Frame size | 128 × 128 px, transparent PNG (RGBA) |
| Feet point (anchor) | x 64, y 105 (from the frame's top-left) |
| Scale | 1 game tile = 80 px across in the render |
| Camera | Orthographic, looking down 35°, fixed, the same for all art |
| Directions (rows, top to bottom) | N, NE, E, SE, S, SW, W, NW (N = facing up the screen, S = facing the player) |
| Idle | 8 frames, 8 fps, loops (1 s) |
| Walk | 8 frames, 12 fps, loops (two steps in 0.67 s), walks in place |
| Strike | 8 frames, 16 fps, plays once (0.5 s). The hit lands on frame 5. |
| Counter | 8 frames, 16 fps, plays once (0.5 s, the same as the guard pose). Frames 1–4 are the block (hold frame 4 for a plain Block), and frames 5–8 are the counter punch (for a Perfect Counter). |
| Layers (bottom to top) | body (skin, face, hair), gi (grey, recoloured), belt (grey, recoloured), belt-center (grey, the second colour on red/black and brown/black belts), belt-tape1 and belt-tape2 (grey, rank stripes, up to 2 per belt) |

## Known issues and differences from the docs

- **No Mixamo.** The skeleton and animations were made by hand in a Python script, so nothing outside the project is used and every move can be adjusted by number. Mixamo is still an option later.
- **The character is made of solid parts on a skeleton** (like an action figure) rather than one bendy skin. That's normal for low-poly game art and keeps every frame clean. The joints are hidden by rounded gi pieces.
- **Walk speed:** the game moves the character 4.5 tiles a second, which is closer to a jog. At 12 fps the feet will slide a little. Claude Code can play the walk faster while running.
- **Stripes are small.** At phone size, rank stripes on the belt tail are only 1–2 pixels wide and are hidden when the character faces away. They're there, and they show up properly at larger sizes (for example in the promotion ceremony).
- **Black belts** come out very dark against the dark outline. Claude Code may want to colour black belts a touch lighter (dark grey) in the game.
- **Only one skin tone and hair style so far.** Skin, face and hair are all in the "body" layer for this test. In the full character they become their own layers, as the design asks.
- **No ground shadow** is drawn into the sprites. The game can put a soft oval under the feet point.
- **Edges between layers:** where two layers meet (for example belt on gi), the soft edge pixels can let a hint of background through once stacked. The dark outlines sit right on those edges, so I couldn't see it in any preview.

## Questions for Jay

1. Which camera angle: 35° (used), 45° or 30°?
2. Is the Strike a punch (as made) or should it be a kick?
3. Should the Counter be the block plus a counter punch (as made), or a block only?
4. Is the fighting stance right for Action Zone (left foot forward, hands up in a guard)?
5. Should the character be drawn bigger on screen than the current circle?
