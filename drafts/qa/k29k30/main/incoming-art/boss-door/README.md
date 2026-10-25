# Boss door (Batch 5): technical sheet

**Status: draft until Jay approves.** This is look A, the stone gate, which Jay picked from the samples. Samples B and C were removed and are still in git history (commit b89845a).

```bash
blender -b -P incoming-art/boss-door/source/build_boss_door.py -- --out $PWD/incoming-art/boss-door/source/boss_door.blend
blender -b incoming-art/boss-door/source/boss_door.blend -P incoming-art/tools/render_static.py -- --out incoming-art/boss-door/sprites
python3 incoming-art/boss-door/source/make_preview.py
```

- **Same as the other doors:** the same helpers, 35° camera, toon look and 80 px per tile as `tower-rooms/`.
- **Colours:** Tier 1 wall stone and the Floor Keeper's gold `#ffd36b`.
- **JSON:** `sprites/static.json`, in the same format as `tower-rooms/sprites/static.json`.

| Sprite | Size | Frames | Use |
| --- | --- | --- | --- |
| `door-boss` | 160 × 172 per frame | 2 (fps 1, no loop) | Frame 0 closed, frame 1 open (the wooden doors slide apart behind the posts and the doorway glows warm) |
| `door-boss-glow` | 160 × 172 per frame | 8 (8 fps, loop, 1 s) | Draw on top of `door-boss` frame 0 while the door is closed and the room is being fought. A gold halo swells around the crown medallion and light breathes along the gold frame. See-through, straight alpha |
| `icon-boss` | 48 × 64 | 1 | The crown medallion on its own, like `icon-battle` |

**Placement:**
- The door goes in the `D` slot in the top wall.
- `anchorPx` (80, 172) = the bottom-centre of the door cell, where the wall meets the floor. `door-boss-glow` uses the same anchor.
- The opening is 1 tile wide, in the middle.
- The stone frame is 2 tiles wide: it overlaps half a wall tile on each side, so draw it over those `wall-face` tiles.
- `topExtraTiles` = 1.15 (the crest and medallion rise above the wall).

**Look:**
- Light carved stone posts with gold edging and gold caps.
- A stone lintel and a stepped crest.
- Heavy wooden doors with gold bands, studs and ring handles.
- A round medallion with a cream face, a gold ring and a friendly crown (three ball tips and a small amber gem).

**Checks:**
- Looked at by eye at 1×, 2× and 3×, closed and open, in a tiled room next to the battle door.
- Nothing is clipped at the top.
- The left and right edges are wall that continues into the next wall tiles.

**Previews:**
- `preview/review-1-room.png`: the room, closed with the glow and open, at 1× and 2×.
- `preview/review-2-pieces-3x.png`: closed, open, the glow on its own, and the icon next to `icon-battle`.
- `preview/door-boss_glow.gif`: the glow loop.
- `preview/door-boss_open.gif`: two glow loops, then the door opens.
