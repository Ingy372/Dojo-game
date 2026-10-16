# Tier 1 shadow creatures (Batch 2): technical sheet

**Status: draft until Jay approves.** Four enemies built by one script (`source/build_enemy.py --enemy <id>`) and rendered with the shared `tools/render_sprites.py` (same camera, 8 directions N..NW, 80 px per tile, toon look via `tools/toon_kit.py`). Everything re-renders with:

```bash
bash incoming-art/enemies-tier1/source/render_all.sh            # all four (about 25 min)
bash incoming-art/enemies-tier1/source/render_all.sh swarmer    # one
```

Sizes and timings are read from `content/enemies/*.json` when the model is built (20 ticks per second).

## Folders

| Enemy | Folder | Frame | Body width × height (tiles) | Data `radius` |
| --- | --- | --- | --- | --- |
| Swarmer | `swarmer/` | 128 × 128 | 0.30 × 0.40 | 0.30 |
| Shield Guard | `shield/` | 128 × 128 | 0.42 × 0.62 | 0.42 |
| Brute | `brute/` | 128 × 128 | 0.48 × 0.88 (arms reach wider) | 0.48 |
| Floor Keeper | `keeper/` | **256 × 256** (3.2 tiles across, same 80 px per tile) | 0.85 × 1.30 | 0.85 |

Each has `sprites/<id>_<layer>_<animation>.png` and `sprites/<id>.json`: anchor (feet point), directions, fps, frames, key frames, telegraph seconds and notes. Previews are in `preview/`: one GIF and one contact sheet per animation.

Batch review pictures are in `preview/review-*.png`. The animated previews are `preview/<enemy>_anim.gif` (every animation in order at its real fps; loops play twice; S, E, SE) and `preview/windup_compare.gif` (all four wind-ups into their attacks, same scale), made with `tools/make_anim_gif.py`.

## Animations

| Animation | Frames @ fps | Length | Who | Notes |
| --- | --- | --- | --- | --- |
| `idle` | 8 @ 8 | 1.0 s, loop | all | Soft breathing bob, one blink |
| `move` | 6 @ 12 | 0.5 s, loop | all | Bouncy waddle-hop; feet aren't planted, so play at any speed |
| `windup` | telegraph × 10 fps | **= telegraph** | Swarmer 6 (0.6 s), Shield 7 (0.7 s), Brute 8 (0.8 s) | The clearest pose on screen (see below). Tag `telegraph: 0-N` |
| `windup_slam` / `windup_sweep` | 9 / 11 @ 10 | 0.9 s / 1.1 s | Floor Keeper | Slam: both fists high. Sweep: arms wide, twisted back |
| `attack` | 2 + recover @ 10 | Swarmer 1.0 s, Shield 1.1 s, Brute 1.1 s | all but Keeper | Impact on frame 0, then the recover time from the data (`recoverSeconds`) back to the guard. **Swarmer** = jab (a stretchy poke), **Shield Guard** = shield bash, **Brute** = two-fist smash |
| `slam` / `sweep` | 2 + 11 / 6 + 13 @ 10 | 1.3 s / 1.9 s | Floor Keeper | Slam: ground smash. Sweep: one full turn with both arms out |
| `hit` | 3 @ 12 | 0.25 s | all | Quick squash back, eyes shut |
| `stagger` | 8 @ 10 | loop | all | Dizzy wobble after a Perfect Counter; loop as long as the stagger lasts |
| `winded` | 8 @ 8 | loop | Brute | Stopped, bent over, big slow breaths. The game adds the pale tint, sweat drops and "huff" |
| `call` | 8 @ 8 | loop | Floor Keeper | Calling for help: arms up waving (at half health, when 2 swarmers come) |
| `defeat` | 14 @ 12 | 1.17 s | all | Happy blink, shrinks into a warm ball of light, floats up in sparkles. Last frame empty (`removeAfter`) |

**The wind-up:** the body rears up and stretches tall (about +24% height), leans back, and the striking arm pulls far back. The eyes go wide, and a tiny tremble holds the pose until the hit. This is the biggest silhouette change any of them makes.

## Layers (bottom to top)

| Layer | Tint | Draw | What |
| --- | --- | --- | --- |
| `body` | none | always | The creature |
| `shield` | none | Shield Guard, while the shield is up | Round shield with a star |
| `shield-broken` | none | Shield Guard, a moment after it breaks | The same shield cracked in two; then neither until it grows back (6 s) |
| `glow` | none | always | Soft lavender rim (`#8f74ff`) outside the outline |
| `telegraph` | **yes**, neutral white | **wind-ups only** | A wider rim the game tints (e.g. `#ff3b30`) and flashes or pulses during the telegraph |
| `light` | none | always (only the defeat has anything) | Defeat light orb and sparkles |

- `shield` and `shield-broken` are full layers rendered with the body as a holdout, so they pass correctly in front of or behind him. Draw exactly one of them.
- The broken one comes from a second build (`--broken`); `render_all.sh` merges it in.

## Kid-appropriateness

- Soft, rounded shapes with no teeth, claws or anything sharp.
- Big glowing eyes and little cheeks: a bit spooky in the dark, never frightening.
- Deep indigo/purple bodies with a soft glow.
- When beaten they are set free in light and sparkles, never hurt or killed.
