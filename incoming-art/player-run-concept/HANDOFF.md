# Programmer handoff — do not import

This folder is a motion concept. `sprites/player-a.json` sets `run.concept` and `run.notForImport` to true. Leave it out of the import list.

If Jay later approves the motion, the sheet contract already matches the walk:

- Frame 128 × 160. Feet anchor x 64, y 136.96. 80 px per tile in the file. The game still shrinks to 48 px per tile on import.
- 8 direction rows, top to bottom: N, NE, E, SE, S, SW, W, NW. 10 columns. No padding. Straight alpha.
- 10 frames at 30 fps (0.3333 s). Loop. Ground motion 1.5 tiles per loop, design speed 4.5 tiles/s, so a planted foot stays still when playback fps = speed in tiles/s × 6.6667. Same numbers as the walk.
- Draw order in the JSON: body, skin, gi, belt, belt-sheen, belt-rim, face-01, hair-01. Tints are the usual multiply tints. Belt-sheen is for a black belt only.
- Only those 8 layers exist for `run`. The walk has every face, every hair, the tape stripes, and the props. A run import would need those rendered before it could match a custom look.

Source model: `source/player_a_run.blend` (built from `incoming-art/player-custom/source/player_custom_a.blend`). The `walk` action inside it is still the kept walk.
