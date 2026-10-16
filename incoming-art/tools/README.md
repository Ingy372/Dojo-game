# Art tools

Scripts the Art Director bot uses so every character, enemy and object renders exactly the same way.

| File | What it does |
| --- | --- |
| `render_sprites.py` | Renders a character `.blend` into transparent PNG sprite sheets (8 directions, one sheet per layer per animation) plus a JSON description. Runs inside Blender. |
| `make_preview.py` | Stacks the layer sheets the way the game will (with belt and gi colours, black belts as charcoal) and makes review pictures: contact sheets, an animated GIF (30 fps clock), a belt-colour chart, a 4× head close-up and a 4× waist close-up (`belt-back.png`, N/NE/E/NW, blue belt, to check the belt is one unbroken band). Runs with normal Python. |
| `make_belt_chart.py` | Belt chart: chosen belts (white, yellow, red/black, brown/black, black) on the white gi, at real size (1x) and 4x at the waist. One row for the old render, then one row per belt style option of the new render (`--options A,B,C`; the options are `BELT_OPTIONS` in `make_preview.py`, `chosen` is the default). Runs with normal Python. |
| `make_still.py` | Pose stills: chosen frames in chosen directions, old render above new (for example the bow's lowest point from the side and front). Runs with normal Python. |
| `make_compare.py` | Plays one animation from two renders side by side (for example an old and a new walk) over a floor grid that scrolls at the design speed, so you can check the feet stay planted. Runs with normal Python. |
| `toon_kit.py` | The shared house look for every build script (enemies, rooms, props): the toon material (one fixed light), the dark outline hull, coloured rim hulls (glow, telegraph) and mesh helpers. Imported inside Blender. |
| `make_creature_preview.py` | Enemy previews: stacks body, shield, glow, telegraph (tinted red during wind-ups) and light layers; writes a contact sheet and a GIF per animation (`--with shield` or `--with shield-broken` picks the shield layer). Runs with normal Python. |
| `make_anim_gif.py` | Animated enemy previews from the existing sheets (no re-render): every animation in order at its own fps, every frame, S/E/SE side by side with a label (`<enemy>_anim.gif`), or a side-by-side wind-up→attack comparison of all four on one scale (`--windups`). The telegraph rim follows each frame's `telegraphIntensity`. Runs with normal Python. |
| `make_enemy_lineup.py` | Enemy line-up: all Tier 1 enemies side by side (idle and wind-up, chosen directions) at 1x (true size) and 2x on the same world scale. Runs with normal Python. |
| `check_prop_clearance.py` | Prop clearance check: tests a prop (for example the broom) against the body's meshes in 3D on every frame of an animation and lists any intersection (the hands may touch). One check covers all 8 directions. Runs inside Blender. |
| `make_review_sheet.py` | "Review these first" pictures: chosen frames of chosen animations in chosen directions, labelled, at 2x (`--kind player` or `creature`). Runs with normal Python. |
| `render_static.py` | Renders static art (rooms, decorations, tiles, doors, chests) from the same 35° camera, with the floor grid at exactly 80 px per tile. One PNG per target and layer (multi-frame targets as horizontal strips) plus `static.json` with sizes, anchors and footprints. The targets come from the `.blend`'s `static_targets`. Runs inside Blender. |
| `make_static_preview.py` | Static art previews: a gallery of every sprite (`--gallery`) and a room with decorations placed on the grid (`--scene room --place "id@col,row;..."`, `--frame id=n`), with the front wall drawn on top. Runs with normal Python. |
| `make_tower_preview.py` | Tower kit previews: a mock room tiled from the kit (floors, wall, pillars, the 4 doors, chest, shrine), the doors closed and open at 2x, the chest and shrine frames, `chest_open.gif`, `shrine_glow.gif` and the open-chest still. Runs with normal Python. |

Made with Blender 4.2 LTS (4.2.23). Previews need Python 3 with Pillow and numpy (`pip install pillow numpy`).

## Render a character

```bash
blender -b path/to/character.blend -P incoming-art/tools/render_sprites.py -- \
    --out path/to/sprites --name character-name
```

Takes about 3 minutes on a normal CPU for the test character (4 animations × 8 directions × 8 layers). Re-rendering the same `.blend` gives the same pixels (apart from a rare 1-level rounding difference).

Options (the defaults are the house standard, so leave them alone unless Jay changes the style guide):

| Option | Default | Meaning |
| --- | --- | --- |
| `--size` | `128` | Frame width and height in pixels |
| `--ortho` | `1.6` | Game tiles across one frame (so 1 tile = 80 px) |
| `--elevation` | `35` | Camera looks down this many degrees (top-down three-quarter view) |
| `--anchor-y` | `0.82` | Where the feet land in the frame (0 = top, 1 = bottom) |
| `--anims` | all | Comma list of action names to render |
| `--layers` | all | Comma list of layers to write. The other layers still take part as holdouts, so a partial render matches a full one exactly (fixed in Batch 1: they used to show up in the partial renders) |
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
   - `sprite_optional` (true/false, default = `sprite_overlay`): set it false on an overlay that must always be drawn (like `belt-rim`). It becomes `optional` in the JSON.
3. **One action per animation** on the rig, with custom properties `sprite_fps` (number), `sprite_loop` (true/false), `sprite_tags` (text like `impact:4`) and `sprite_order` (number). Every whole frame in the action's frame range becomes one sprite frame. For walking or running, also set `sprite_stride_tiles` (ground covered per loop) and `sprite_design_speed` (tiles per second the fps is matched to). The JSON then gets a `groundMotion` block (stride in pixels, fps per tile/s) so the game can keep the feet planted. An optional `sprite_info` property (a JSON string) is merged into that animation's JSON entry, for timing notes such as `keyFrames`, `holdLastFrame` or `repeatEverySec`.
4. **Optional:** a scene property `sprite_meta` holding a JSON string. It's copied into the output JSON as-is, for character-specific notes such as tint guidance.
5. **Materials** should be the flat "toon" emission style used in `character-test/source/build_character.py`, so lighting matches everywhere. No lamps are needed.

## How layers stay lined up

All layers come from the same model, camera and frame, so they share the same canvas and pixel grid. When one layer renders, the other layers are still in the scene as "holdouts": they block what's behind them and leave a see-through hole. Stacking the layers in `sprite_order` rebuilds the whole character with the right parts in front (an arm in front of the belt hides the belt, and so on).

## Make previews

```bash
python3 incoming-art/tools/make_preview.py --sheets path/to/sprites --out path/to/preview
```

Compare two renders of one animation (an old render can be pulled out of git with `git show <commit>:<path> > file` into a folder, sheets plus JSON):

```bash
python3 incoming-art/tools/make_compare.py --old path/to/old-sprites --new path/to/sprites \
    --anim walk --dirs E,SE --old-label "old" --new-label "new" --out path/to/walk-compare.gif
```

`make_preview.py --anim-gifs jab,bow,defeat` also writes one GIF per animation (all 8 directions, real frame timing; one-shots hold their last frame, or wait for `repeatEverySec`, then replay). `--gif-anims none` skips the big combined GIF. `make_compare.py --strip file.png` also writes every frame of both renders side by side (first direction).

```bash
python3 incoming-art/tools/make_belt_chart.py --old path/to/old-sprites --new path/to/sprites --out belt-chart.png [--options A,B,C]
python3 incoming-art/tools/make_still.py --old path/to/old-sprites --new path/to/sprites --anim bow --frames 11 --dirs E,W,S --out still.png
```

GIF previews keep time with a 30 fps clock. GIF delays are stored in 1/100 s, so they play about 10% fast; the JSON timing is exact.

**Belt styles in the previews:** for sheets with a tinted `belt-rim` layer (the player character, belt revision), `make_preview.py` tints every belt layer per belt with the chosen style (`belt_style()`, the same table as `beltStyles` in `player.json`). Older sheets keep the old rule.

**Review sheets (Batch 1+):** `make_review_sheet.py --kind player|creature --sheets <folder> --cells "anim:frame:dir;..." --title "..." --out review.png` puts chosen frames side by side at 2x with labels. Each batch's `preview/review-N-*.png` ("review these first") is made with it.

**`render_sprites.py`: pick-one options (Batch 6).**
- A collection with the property `sprite_group` (for example `"hair"` on `L_hair-01` … `L_hair-08`) is an option.
- While rendering, only the active option is drawn, so options never punch holes in each other.
- Each option is rendered with the base layers as holdouts and drawn after them, so it is still hidden correctly behind the body.
- The group is written into the layer entry in the JSON. Files without groups render exactly as before.
