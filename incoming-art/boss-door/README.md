# Boss door (Batch 5): technical sheet

**Status: SAMPLES ONLY (3 looks of the closed door). Waiting for Jay to pick one.** Nothing here is ready for the game yet.

```bash
blender -b -P incoming-art/boss-door/source/build_boss_door.py -- --out $PWD/incoming-art/boss-door/source/boss_samples.blend
blender -b incoming-art/boss-door/source/boss_samples.blend -P incoming-art/tools/render_static.py -- --out incoming-art/boss-door/sprites/samples
python3 incoming-art/boss-door/source/make_samples_preview.py
```

- **Build:** `source/build_boss_door.py`. It uses the same helpers, camera (35°) and toon look as `tower-rooms/source/build_tower.py`, at 80 px per tile.
- **Colours:** Tier 1 wall stone (`#8e92ab`, `#71758f`, `#a9adc4`) and the Floor Keeper's gold `#ffd36b`.
- **Opening:** 1 tile wide, the same dark opening as the other doors.
- **Frame:** 2 tiles wide (160 px: the door cell plus half a tile of wall on each side). It rises 1.15–1.25 tiles above the floor line.
- **Anchor:** `anchorPx` = bottom-centre of the door cell, (80, image height). Exact values are in `sprites/samples/static.json`.
- **Crown medallion:** the same round medallion as the other four door icons (cream face, coloured ring), with a gold ring and a friendly round crown with three ball tips and a small amber gem.

| Sample | Look |
| --- | --- |
| A, stone gate | Light carved stone posts with gold caps and gold edging, a stepped crest and the crown medallion, heavy wooden doors with gold bands and studs |
| B, gate with curved top beam | Red round posts, a dark top beam with raised ends and a gold edge, the medallion on the tie beam, gold-framed glowing paper doors (the other doors' family look, made grander) |
| C, sunrise arch | A pale stone round arch with a gold keystone, soft rounded gold rays rising behind the medallion, two small glowing lanterns, wooden doors |

**After Jay picks a look, the full batch will add:**
- `door-boss`: 2 frames, closed and open (the doors slide apart and the doorway glows);
- `door-boss-glow`: an 8-frame loop at 8 fps;
- `icon-boss`;
- the full `static.json` entry;
- the room previews at 1× and 2×;
- the glow GIF.

**Checks:** the samples were looked at by eye at 1×, 2× and 3×. Nothing is clipped at the top. The left and right edges are wall that continues into the next wall tiles.

Previews: `preview/review-1-samples-3x.png` (start here) and `preview/sample-{a,b,c}-room.png` (each look in a tiled room next to the battle door, at 1× and 2×).
