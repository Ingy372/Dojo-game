# One-character test: martial artist (technical sheet)

A Blender-made martial artist rendered to 2D sprites. See `DELIVERY_NOTE.md` for the summary for Jay. This page is for whoever puts it in the game (Claude Code) or re-renders it.

## Sprite sheets (`sprites/`)

- One PNG per **layer** per **animation**: `martial-artist_<layer>_<animation>.png`.
- Each sheet has **8 rows = directions** in the order `N, NE, E, SE, S, SW, W, NW` (top to bottom) and **columns = frames** (left to right). No padding or spacing.
- **Frame size 128 × 128 px**, RGBA, straight (not premultiplied) alpha. Fully see-through pixels are pure 0,0,0,0.
- **Anchor / feet point: (64, 105)** in each frame (exact value in the JSON: 64.0, 104.96). Put this point on the character's position in the world.
- **Scale:** 1 tile = 80 px across in the render. The game currently uses 48 px tiles, so a 1:1 world scale is 0.6. At that scale the character is about 1.3 tiles tall and half a tile wide (about 22 × 63 px at the game's 48 px tiles; the current circle is 0.84 tiles across). Scale up (for example 0.8–0.9) if Jay wants it bigger.
- **Facing:** N = facing up the screen (away from the player), S = facing down the screen (towards the player), E = right. The facing vectors on screen (x right, y down) are in the JSON.

| Animation | Frames | FPS | Loop | Notes |
| --- | --- | --- | --- | --- |
| `idle` | 8 | 8 | yes | Fighting stance with breathing |
| `walk` | 8 | 12 | yes | In place, two steps per loop. Speed up the playback for the 4.5 tiles/s move speed if the feet slide. |
| `strike` | 8 | 16 | no | Stepping reverse punch. Tag `impact: 4` (frame index 4, the 5th frame) is when the fist is fully out. The game's lunge movement stays in code. |
| `counter` | 8 | 16 | no | Tag `block: 0-3` and `block_hold: 3` cover a plain Block (play 0–3 and hold 3 while guarding). Tag `counter_hit: 4` is the counter punch landing, for a Perfect Counter (play 4–7). |

### Layers (draw bottom to top)

| Order | Layer | Tint in code? | Always drawn? | What it is |
| --- | --- | --- | --- | --- |
| 0 | `body` | no | yes | Skin, face, hair (full colour) |
| 1 | `gi` | yes, gi colour | yes | Jacket and pants in neutral light grey. Tint with the gi colour (the current placeholder uses `#f2e9d8`). |
| 2 | `belt` | yes, `belt.color` | yes | The belt in neutral light grey |
| 3 | `belt-center` | yes, `belt.color2` | only for two-colour belts | The centre line of red/black and brown/black belts |
| 4 | `belt-tape1` | yes, tape colour | if stripes ≥ 1 | 1st rank stripe on the belt tail |
| 5 | `belt-tape2` | yes, tape colour | if stripes ≥ 2 | 2nd rank stripe (up to 2 per belt, per core-design section 10) |

- **Tint = multiply** (Phaser's `setTint` does exactly this). The grey layers have their shading built in (lit ≈ 242, highlight ≈ 253, shadow ≈ 202, lapels a little darker, outline ≈ 20), so any colour keeps its light and shadow and the outline stays dark. The tape colour rule can stay as in `apps/client/src/ui/belt.ts` (white tape on dark belts, black on light ones).
- All layers share the same frames, canvas and pixel grid, so draw them at the same position with the same frame index. Each base layer has holes only where another base layer is in front of it (for example the gi has a hole where the belt crosses it), so the three base layers must always be drawn together. The optional overlays (center and tapes) are switched off while the base layers render, so the base layers have no holes under them, and skipping an overlay is always safe.
- `preview/martial-artist_belts.png` shows all 10 belts made this way.

## Re-rendering

You need Blender 4.2 LTS. These commands are run from the repository root.

```bash
# 1. (optional) rebuild the .blend from the script after changing numbers in it
blender -b -P incoming-art/character-test/source/build_character.py -- \
    --out "$PWD/incoming-art/character-test/source/martial_artist.blend"

# 2. render all sheets + JSON (about 2 minutes on a CPU)
blender -b incoming-art/character-test/source/martial_artist.blend \
    -P incoming-art/tools/render_sprites.py -- \
    --out incoming-art/character-test/sprites --name martial-artist

# 3. previews (Python 3 + Pillow + numpy)
python3 incoming-art/tools/make_preview.py \
    --sheets incoming-art/character-test/sprites --out incoming-art/character-test/preview
```

Rendering is deterministic: the same `.blend` gives byte-identical sheets (checked). Options and the conventions a `.blend` must follow are in `incoming-art/tools/README.md`.

## How the model is built (`source/build_character.py`)

- About 1.4 tiles tall, low-poly, with chunky kid-friendly proportions. It faces -Y, with its feet at the origin under the `CHAR_ROOT` empty.
- The skeleton has a root, hips, chest and head. The arms and legs use IK (the hands and feet are placed and the elbows and knees follow), with knee and elbow aim bones. Each mesh part is attached to one bone (rigid parts, no skin weights).
- Flat cartoon shading is done with emission materials and a fixed light direction (upper left, from the camera side), so every direction is lit the same way. A thin dark outline (`#14121c`, the game's outline colour) uses the "inverted hull" method.
- Collections `L_body`, `L_gi`, `L_belt`, `L_belt-center`, `L_belt-tape1` and `L_belt-tape2` are the sprite layers.
- The actions `idle`, `walk`, `strike` and `counter` are keyed once per sprite frame. Their custom properties hold the fps, looping and tags.
