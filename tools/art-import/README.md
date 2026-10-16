# Art import step

Turns approved renders from the Art Director bot (`incoming-art/`) into packed art the game loads (`assets/art/`).

## Run it

From the repository root (needs Python 3 and Pillow: `pip install pillow`):

```bash
python3 tools/art-import/import_art.py            # every pack
python3 tools/art-import/import_art.py dojo       # just one pack
```

## Add newly approved art

1. Jay approves the art (never before).
2. Add it to `approved.json`, in an existing pack or a new one. A **character** source points at the bot's character JSON (`<name>.json`, 8 directions, layers, animations). A **static** source points at a `static.json` (rooms, props, doors).
3. Run the script and commit `assets/art/`.

## What it does

- Cuts each sheet into frames and shrinks them by `scale` (0.6: the renders are 80 px per tile and the game draws 48 px per tile, so sprites are drawn at scale 1).
- Trims empty borders and drops empty and repeated frames. The red warning glow (`telegraph` layer) is kept only in wind-ups and attacks, the only times it's shown.
- Packs the frames into 2048 × 2048 lossless WebP pages (exact pixels, every current phone supports them).
- Writes `assets/art/<pack>.json`: where each frame is (`[page, x, y, w, h, trimX, trimY, fullW, fullH]`) and, for each character or sprite, its frame size, feet point (`anchor`), frame rates, loops, key frames and layer tints, copied from the bot's JSON. Frame ids of `-1` mean "nothing to draw in this frame".

The game reads these files in `apps/client/src/art/`. It never changes `incoming-art/`.
