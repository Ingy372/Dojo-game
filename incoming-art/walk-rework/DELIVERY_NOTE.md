# Delivery Note: player walk rework, samples A / B / C

**Pick one.** Each sample is a full drop-in replacement for the Batch 6 body-A `walk` (all 33 layer sheets + `player-a.json`). Nothing outside `incoming-art/` changed.

## Drop-in
- Same frame size (128 × 160), feet anchor (64, 136.96), 8 rows N, NE, E, SE, S, SW, W, NW, 10 columns.
- Same timing contract: 10 frames @ 30 fps, `groundMotion` 1.5 tiles (120 px) per loop at 4.5 tiles/s. The game's rule in `apps/client/src/art/player.ts` (`speed = tilesPerSecond / 4.5`) needs no change.
- Same layer names, tints and pick-one groups. Props are hidden (empty sheets, as before).
- To use a sample: copy `sample-X/sprites/player-a_*_walk.png` over `player-custom/sprites/body-a/` and take its `walk` entry from the JSON. Body B is rendered on pick (same script; see README).

## What changed (vs the current jog)
| | Current | A natural, relaxed | B martial-arts, hands ready | C kid, bouncy |
| --- | --- | --- | --- | --- |
| Foot planted per loop | 3 of 10 frames (2 flight frames per step) | **5 of 10** (always one foot down, no flight) | 4 of 10 | 4 of 10, higher lift |
| Pelvis bob | small | lowest at the two-foot moments, highest over the planted foot | low, level, steady | big: dips on landing, pops up after push-off |
| Side shift over the planted foot | 0.008 tiles | 0.016 | 0.012 | 0.010 |
| Arms | relaxed swing | wider opposite swing, a touch late | loose fists in front of the chest, small counter swing | big, loose swing |
| Hip/shoulder twist | 9° / 18° | 10° / 14° | 7° / 8° (square, centred) | 9° / 16° |

- **Contact:** planted feet move back exactly 12 px per frame (= the game's travel), heel strike on landing, the heel peels on the last planted frame with the toe staying on the floor. `make_walk.py` checks every frame that the IK foot is reached: **0 mm gap on every frame for all three** (a gap means the knee locks and the foot slides).
- 4.5 tiles/s is fast for legs 0.48 tiles long, so a pure walk isn't possible at this speed. A is as close as it gets: no flight, but long steps and a lower pelvis. If Jay wants a calmer walk, the fix is a slower move speed (DECIDE below), not more frames.

## Previews (`preview/`)
- `compare-A.gif`, `compare-B.gif`, `compare-C.gif`: top row is the current walk, bottom row the sample, S, E, N and SE, over a floor grid scrolling at the design speed (feet should stick to it). 2×.
- `strip-A.png`, `strip-B.png`, `strip-C.png`: every frame, current vs sample, for S, E, N, SE (1×).
- Composite: skin `#e0a984`, gi `#f2e9d8`, yellow belt, face-01, hair-02.

## Second pass (frame by frame, phone size)
- Stepped through all 10 frames of each GIF at half size (about phone size). All three read clearly in all four directions. Nothing pops, the props stay hidden, the feet stay on the grid.
- Clearances on all 80 frames (body layer): top ≥ 47 px (nothing near the head-top line), bottom ≥ 3 px (A's long step, E/W), sides ≥ 27 px.
- No red anywhere in the walk.

## DECIDE
- Which sample (Jay). Mixing is possible, e.g. A's legs with B's hands.
- Body B: rendered after the pick (about 6 min).
- Move speed: if Jay wants an unhurried walk, the walk speed (`MOVEMENT.speedTilesPerSecond`, 4.5) would need to drop. That is the Programmer's and Jay's call, not an art change.
