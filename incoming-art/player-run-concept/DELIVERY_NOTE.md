# Delivery Note: player run motion (concept)

**ITEM:** A preview of a run on the existing player (body A). Jay asked for the motion only: forward lean, the opposite arm and leg, a light bounce, and the belt and sleeves moving. Same camera, 8 directions, separate layers, and the walk's timing. Then stop. This is not art to import.

**WHAT:**

- The model is the existing body A blend, `incoming-art/player-custom/source/player_custom_a.blend`. The script copies its `walk` action to `run` and edits only the pose. Meshes, eyes, collar, and the walk action are not changed (`source/build_run.py` lines 1–15 and 85–91).
- Timing is the walk's timing, not a new one.
  - Style guide: walk is 30 frames a second, synced to 4.5 tiles a second (`docs/style-guide.md` line 25). Camera is orthographic, 35° down, 80 px per tile, 8 directions N, NE, E, SE, S, SW, W, NW (`docs/style-guide.md` lines 13–19).
  - The walk sheet already in the game art is 10 frames, 30 fps, 0.3333 seconds, 1.5 tiles per loop, 4.5 tiles a second (`incoming-art/player-custom/sprites/body-a/player-a.json` lines 316–321 and 356–362).
  - Player frames are 128 × 160, and the feet point is read from the art (`docs/decisions.md` line 343). This run uses that size. The feet point is x 64, y 136.96, which is the walk's `--anchor-y 0.856` (`incoming-art/walk-rework/README.md` line 11). The style guide's 128 × 128 / 82% line is the older house default; the player has used 128 × 160 since that decision.
- The foot's forward/back path is still the walk's path, so a planted step is still 0.15 m per frame (1.5 tiles over 10 frames). Re-opened the saved blend and measured it again: left plant 0.1500, right plant 0.1500. Frame 1 has the left foot forward and the right hand forward. Frame 6 is the other way around. Hip height runs from 0.478 m to 0.540 m.
- Sheets: 8 layers, each 1280 × 1280 (8 directions × 160, 10 frames × 128), straight alpha. Layers, in draw order: body, skin, gi, belt, belt-sheen, belt-rim, face-01, hair-01. Gi, belt, belt-rim, skin, and hair-01 are the neutral recolourable layers. Belt-sheen is the black-belt shine only. Manifest: `sprites/player-a.json`, animation `run`, `concept: true`, `notForImport: true`.
- Jay kept the original walk (work board J14, walk rework note). The arm samples in `incoming-art/walk-rework/` (Arms 1, 2, 3) are still unchosen samples. This run starts from the kept walk, not from those samples.

**WHY:** So Jay can watch the motion on his character before anyone treats it as game art. The running-boy picture was not in the files, so nothing here copies that drawing. The motion follows the written description and the walk's foot path.

**CHECKS** (measured on the real sheets, `preview/CHECK.txt`):

- All 8 sheets are 1280 × 1280 RGBA and match the manifest.
- Stacking them leaves no registration errors. The gi stops above the bare feet; that is the foot, not a slipped layer.
- No danger-red pixels on the stacked character.
- No frame has a hole trapped inside the body (nothing over 40 enclosed transparent pixels).
- Nearest opaque pixel to a frame edge is 9 px (body, facing SE, frame 6, bottom). Nothing is cut off.
- The loop step from the last frame back to the first is in line with the other steps on every direction (the wrap is not a pop).
- Every run frame differs from the same walk frame. The side view changes the most.
- Facing the camera, the head sits a few pixels lower than the walk (top of the head y 53–57, walk 51–53), which is the lean toward the camera. From the side, the head sits 5.4 px ahead of the feet, against 1.8 px on the walk.
- The head's up-and-down travel is 5 px from the side (walk is 3 px). At phone size (×0.6) that is about 2 px. It is a light bounce.
- Belt centre moves 7.4 px across the front cycle (walk 4.6 px) and 6.5 px from the side (walk 5.3 px). The sleeve width changes 11 px from the side (walk 9 px) and 5 px from the front (walk 2 px).
- Facing away, face-01 is empty on 9 of 10 frames (1 pixel on frame 2). The kept walk's face is also only 0–5 pixels on that row, because the face is on the front of the head.

**HONEST LIMITS:**

- This is quieter than a big cartoon run. The higher knee is only a few pixels above the walk, and from the front it can still read as a brisk walk. The side view shows the lean and the arm swing more clearly. The feet-passing frames tuck both legs close together for a moment.
- The preview hair is hair-01 (the close crop). The game's default look is hair-02 (`docs/decisions.md` line 344). Hair-02 was not rendered. Face is face-01, which is the default face. Other faces, other hairs, belt tapes, and the broom and rag were not rendered. The collar and undershirt are the existing meshes, untouched.
- A GIF cannot hold exactly 30 fps. The mp4 is the one at the real speed. The GIF is one step faster (3/100 s per frame).

**DECIDE:** Is this the run motion to develop, or does the knee need to come up higher before it reads as a run on a phone? Nothing here should be imported either way.

**NEXT:** Pause. Do not import. Do not merge into the game. The walk stays the walk.
