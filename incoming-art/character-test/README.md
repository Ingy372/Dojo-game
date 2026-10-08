# One-character test: martial artist (technical sheet)

A Blender-made martial artist rendered to 2D sprites. See `DELIVERY_NOTE.md` for the summary for Jay. This page is for whoever puts it in the game (Claude Code) or re-renders it.

## Sprite sheets (`sprites/`)

- One PNG per **layer** per **animation**: `martial-artist_<layer>_<animation>.png` (8 layers × 4 animations = 32 sheets).
- Each sheet has **8 rows = directions** in the order `N, NE, E, SE, S, SW, W, NW` (top to bottom) and **columns = frames** (left to right). No padding or spacing.
- **Frame size 128 × 128 px**, RGBA, straight (not premultiplied) alpha. Fully see-through pixels are pure 0,0,0,0.
- **Anchor / feet point: (64, 105)** in each frame (exact value in the JSON: 64.0, 104.96). Put this point on the character's position in the world.
- **Scale:** 1 tile = 80 px across in the render. The game currently uses 48 px tiles, so a 1:1 world scale is 0.6. At that scale the character is about 1.3 tiles tall and half a tile wide (about 22 × 63 px at the game's 48 px tiles; the current circle is 0.84 tiles across). Scale up (for example 0.8–0.9) if Jay wants it bigger.
- **Facing:** N = facing up the screen (away from the player), S = facing down the screen (towards the player), E = right. The facing vectors on screen (x right, y down) are in the JSON.

| Animation | Frames | FPS | Loop | Notes |
| --- | --- | --- | --- | --- |
| `idle` | 8 | 8 | yes | Fighting stance with breathing |
| `walk` | 10 | 30 | yes | A natural jog (Revision 2), in place, two steps per loop. Matched to the game's 4.5 tiles/s so planted feet don't slide (see below). The name stays `walk` so the game code doesn't change. |
| `strike` | 8 | 16 | no | Stepping reverse punch. Tag `impact: 4` (frame index 4, the 5th frame) is when the fist is fully out. The game's lunge movement stays in code. |
| `counter` | 12 | 16 | no | `block: 0-7` is the block (0.5 s), and `block_hold: 3-7` is the full guard held. For a plain Block, play 0–7 (or hold frame 7 while guarding). `counter_hit: 8` is the counter punch landing. For a Perfect Counter, play 8–11 (0.25 s). |

### Keeping the walk's feet planted

`animations.walk.groundMotion` in the JSON:

| Key | Value | Meaning |
| --- | --- | --- |
| `strideTilesPerLoop` | 1.5 | Ground covered by one 10-frame loop (2 steps of 0.75 tiles) |
| `stridePxPerLoop` | 120 | The same in render pixels (80 px per tile), so 12 px per frame |
| `designSpeedTilesPerSec` | 4.5 | The move speed the fps (30) is matched to |
| `fpsPerTilePerSec` | 6.6667 | Playback fps = move speed (tiles/s) × 6.6667. For example, Rooted Form's 15% slower walk (3.825 tiles/s) plays at 25.5 fps. |

A foot on the ground moves back exactly 0.15 tiles per frame (4.5 / 30), the distance the game moves the character in one frame at 30 fps. Each foot is planted for 3 frames (contact, down, push), then both feet are off the ground for 2 frames (a short jog float). I checked it on the model in Blender: the planted foot moves back 0.150 tiles (12 px) per frame, and the toe clears the ground as it lifts, so nothing drags. `preview/walk-compare.gif` plays the old and new walk over a floor grid that scrolls at 4.5 tiles/s, so you can see the feet stick.

### Layers (draw bottom to top)

| Order | Layer | Tint in code? | Always drawn? | What it is |
| --- | --- | --- | --- | --- |
| 0 | `body` | no | yes | Skin, face, hair (full colour) |
| 1 | `gi` | yes, gi colour | yes | Jacket and pants in neutral light grey. Tint with the gi colour (the current placeholder uses `#f2e9d8`). |
| 2 | `belt` | yes, `belt.color` | yes | The belt in neutral light grey |
| 3 | `belt-center` | yes, `belt.color2` | only for two-colour belts | The centre line of red/black and brown/black belts |
| 4 | `belt-tape1-edge` | **no** | if stripes ≥ 1 | Light rim (1 px) at both ends of stripe 1 |
| 5 | `belt-tape1` | yes, tape colour | if stripes ≥ 1 | 1st rank stripe on the belt tail (about 4 px long, 3–4 px across) |
| 6 | `belt-tape2-edge` | **no** | if stripes ≥ 2 | Light rim of stripe 2 |
| 7 | `belt-tape2` | yes, tape colour | if stripes ≥ 2 | 2nd rank stripe (up to 2 per belt, per core-design section 10) |

- **Tint = multiply** (Phaser's `setTint` does exactly this). The grey layers have their shading built in, so any colour keeps its light and shadow and the outline stays dark (about 20):
  - gi: lit ≈ 242, highlight ≈ 253, shadow ≈ 202, lapels a little darker
  - belt: face ≈ 222, with a lighter top edge ≈ 255
- **Tint guidance** (also in the JSON under `tintGuidance`):
  - gi: the gi colour.
  - belt: `belt.color`, except **black: use charcoal `#3c3c44`** (any belt colour darker than luminance 40). Pure black would disappear into the outline, while charcoal plus the light top edge still reads.
  - belt-center: `belt.color2`, with the same charcoal rule.
  - stripes: tape colour per `apps/client/src/ui/belt.ts` (white tape `#f4f1ea` on dark belts, `#1a1a1a` on light ones).
  - stripe edges: never tinted.
- All layers share the same frames, canvas and pixel grid, so draw them at the same position with the same frame index. Each base layer has holes only where another base layer is in front of it (for example the gi has a hole where the belt crosses it), so the three base layers must always be drawn together. The optional overlays (center and tapes) are switched off while the base layers render, so the base layers have no holes under them, and skipping an overlay is always safe.
- `preview/martial-artist_belts.png` shows all 10 belts made this way (2 stripes each on the coloured belts).

## Re-rendering

You need Blender 4.2 LTS. These commands are run from the repository root.

```bash
# 1. (optional) rebuild the .blend from the script after changing numbers in it
blender -b -P incoming-art/character-test/source/build_character.py -- \
    --out "$PWD/incoming-art/character-test/source/martial_artist.blend"

# 2. render all sheets + JSON (about 3 minutes on a CPU)
blender -b incoming-art/character-test/source/martial_artist.blend \
    -P incoming-art/tools/render_sprites.py -- \
    --out incoming-art/character-test/sprites --name martial-artist

# 3. previews (Python 3 + Pillow + numpy)
python3 incoming-art/tools/make_preview.py \
    --sheets incoming-art/character-test/sprites --out incoming-art/character-test/preview
```

Re-running gives the same sheets. In my check, rebuilding the `.blend` from the script and rendering again matched every pixel except one, which was off by 1 colour level (normal floating-point rounding). Options and the conventions a `.blend` must follow are in `incoming-art/tools/README.md`.

## How the model is built (`source/build_character.py`)

- About 1.4 tiles tall, low-poly, with chunky kid-friendly proportions. It faces -Y, with its feet at the origin under the `CHAR_ROOT` empty.
- The skeleton has a root, hips, chest and head. The arms and legs use IK (the hands and feet are placed and the elbows and knees follow), with knee and elbow aim bones. Each mesh part is attached to one bone (rigid parts, no skin weights).
- Flat cartoon shading is done with emission materials and a fixed light direction (upper left, from the camera side), so every direction is lit the same way. A thin dark outline (`#14121c`, the game's outline colour) uses the "inverted hull" method.
- Collections `L_body`, `L_gi`, `L_belt`, `L_belt-center`, `L_belt-tape1-edge`, `L_belt-tape1`, `L_belt-tape2-edge` and `L_belt-tape2` are the sprite layers.
- The actions `idle`, `walk`, `strike` and `counter` are keyed once per sprite frame. Their custom properties hold the fps, looping and tags, and for the walk the stride and design speed.
- The scene property `sprite_meta` holds the tint guidance; the render script copies it into the JSON.
- Revision 1 numbers live at the top of each section of the script: `HAIRLINE_FRONT`, `TAPE_LEN`/`TAPE_RIM`, and the extra `BLOCK_HOLDS` frames. Revision 2: the jog is `WALK_*`, `LEG_PATH` (one foot's path, 10 frames) and `HIP_BOB`.
- Revision 2 belt fix: `tube()` used to turn straight-down tubes sideways, which made the gi skirt deeper than the belt so it poked through at the back. Rule now: at every height the belt covers, the belt (0.171 × 0.131 tiles) is bigger than the gi skirt plus its outline (at most 0.157 × 0.123).
