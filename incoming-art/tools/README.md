# Art tools

Scripts the Art Director bot uses so every character, enemy and object renders exactly the same way.

| File | What it does |
| --- | --- |
| `render_sprites.py` | Renders a character `.blend` into transparent PNG sprite sheets (8 directions, one sheet per layer per animation) plus a JSON description. Runs inside Blender. |
| `make_preview.py` | Stacks the layer sheets the way the game will (with belt and gi colours) and makes review pictures: contact sheets, an animated GIF and a belt-colour chart. Runs with normal Python. |

Made with Blender 4.2 LTS (4.2.23). Previews need Python 3 with Pillow and numpy (`pip install pillow numpy`).

## Render a character

```bash
blender -b path/to/character.blend -P incoming-art/tools/render_sprites.py -- \
    --out path/to/sprites --name character-name
```

Takes about 2 minutes on a normal CPU for the test character (4 animations × 8 directions × 6 layers). The same `.blend` always gives exactly the same pixels.

Options (the defaults are the house standard, so leave them alone unless Jay changes the style guide):

| Option | Default | Meaning |
| --- | --- | --- |
| `--size` | `128` | Frame width and height in pixels |
| `--ortho` | `1.6` | Game tiles across one frame (so 1 tile = 80 px) |
| `--elevation` | `35` | Camera looks down this many degrees (top-down three-quarter view) |
| `--anchor-y` | `0.82` | Where the feet land in the frame (0 = top, 1 = bottom) |
| `--anims` | all | Comma list of action names to render |
| `--layers` | all | Comma list of layers to render |
| `--directions` | `N,NE,E,SE,S,SW,W,NW` | Sheet rows, top to bottom |
| `--samples` | `24` | Anti-aliasing quality |
| `--root` | `CHAR_ROOT` | The object that gets turned for each direction |
| `--keep-frames` | off | Also keep every single frame as its own PNG in `<out>/frames/` |

The script builds its own camera and render settings every time (orthographic camera, Cycles, transparent background, exact colours), so nothing in the `.blend` can make one character look different from another.

## What a `.blend` needs

1. **`CHAR_ROOT`**: an empty at the character's feet that everything hangs under. The character faces **-Y** (towards the camera, "S") when it isn't rotated. The script turns it 45° at a time for the 8 directions.
2. **One collection per layer**, named `L_<layer>` (for example `L_body`, `L_gi`, `L_belt`). Optional custom properties on the collection:
   - `sprite_order` (number): stacking order in the game, bottom to top
   - `sprite_tint` (true/false): the layer is neutral grey and the game recolours it
   - `sprite_overlay` (true/false): an optional extra drawn on top (like belt stripes). Base layers are rendered with overlays switched off, so they never have holes.
3. **One action per animation** on the rig, with custom properties `sprite_fps` (number), `sprite_loop` (true/false), `sprite_tags` (text like `impact:4`) and `sprite_order` (number). Every whole frame in the action's frame range becomes one sprite frame.
4. **Materials** should be the flat "toon" emission style used in `character-test/source/build_character.py`, so lighting matches everywhere. No lamps are needed.

## How layers stay lined up

All layers come from the same model, camera and frame, so they share the same canvas and pixel grid. When one layer renders, the other layers are still in the scene as "holdouts": they block what's behind them and leave a see-through hole. Stacking the layers in `sprite_order` rebuilds the whole character with the right parts in front (an arm in front of the belt hides the belt, and so on).

## Make previews

```bash
python3 incoming-art/tools/make_preview.py --sheets path/to/sprites --out path/to/preview
```
