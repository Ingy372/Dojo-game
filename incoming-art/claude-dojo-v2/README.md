# Home Dojo v2 (Claude Code, Nov 18) — draft, waiting on Jay

**Status (Nov 18): the training station is approved and in the game (top-right corner). The tatami floor was turned down and removed from this script.**

The Home Dojo became the main hub on Nov 18, and it was the weakest-looking piece: a big plain plank floor, and a
training station drawn in code. This draft keeps the Art Director bot's exact style, camera and grid (its Batch 3
script, copied and changed; the original is untouched) and adds:

- **A tatami training floor** in the middle of the room (columns 5-12, rows 3-8, counting from 1) in the classic
  pattern, with dark green cloth edges, a dark wooden frame and a red bow-in line at the front. Planks stay around it.
- **The training station** as a real model (2 x 2 tiles at columns 2-3, rows 5-6): posts, a red-tiled roof, a scroll
  board with a gold emblem, hand wraps on a peg, a folded gi with a black belt on a shelf, and a small gear chest.

Preview: `preview/dojo-v2-before-after.png`, `preview/dojo-v2-room.png`, `preview/training-station-2x.png`.

Rebuild (Blender 5.3 on Jay's PC):

```bash
"C:/Program Files/Blender Foundation/Blender 5.3/blender.exe" -b -P incoming-art/claude-dojo-v2/source/build_dojo_v2.py -- --out incoming-art/claude-dojo-v2/source/dojo_v2.blend
"C:/Program Files/Blender Foundation/Blender 5.3/blender.exe" -b incoming-art/claude-dojo-v2/source/dojo_v2.blend -P incoming-art/tools/render_static.py -- --out incoming-art/claude-dojo-v2/sprites --only room,training-station
python incoming-art/claude-dojo-v2/source/make_preview.py
```

When Jay approves: add the room layers and `training-station` to `tools/art-import/approved.json`, run the import,
and swap the code-drawn station (`apps/client/src/ui/trainingStation.ts`) for the sprite.
