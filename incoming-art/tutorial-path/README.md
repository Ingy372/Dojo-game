# Tutorial Path art (TUT-A1)

Plan: drafts/planning/TUT-P1.md (#517). Built in Blender (`source/build_tutorial.py` makes `source/tutorial.blend`),
rendered with the shared `incoming-art/tools/render_static.py` (same 35-degree north camera, 80 px per tile, toon outlines
as every room kit). All sizes, anchors, frames and fps are in `sprites/static.json`. In game the tile is 48 px, so draw at 0.6x.

The red ground circle is NOT here: the game already draws it in code (decisions.md telegraph rule). Reuse it as-is.
No sprite has danger-red in it (checked: 0 pixels).

| Sprite | Files | Frames / fps | Use |
|---|---|---|---|
| grass, grass-flowers | `grass_grass.png`, `grass-flowers_grass-flowers.png` | 1 | 80x80 ground tiles, seamless, anchor top-left |
| path, path-edge-w, path-edge-e | `path_*.png` | 1 | flagstone path, edge tiles have a grass verge on that side |
| hedge-face, hedge-block | `hedge-*.png` | 1 | 1-tile hedge wall (face = the front row, block = inner), anchor bottom-left |
| tower-foot | `tower-foot_tower-foot.png` | 1 | the round stone base of the Tower with its arched door, at the top of the path, 5 tiles wide; anchor = bottom centre of its door step. The tower is meant to run off the top edge of the screen, so place it at the top of the room (its flat top cut must stay off-screen). Gold medallion is blank (no text) |
| decor-bush, decor-rocks, decor-tree | `decor-*.png` | 1 | scatter on the grass; anchor = foot |
| stone | `stone_stone.png` | 1 | the falling stone. Move it down onto the red circle in code (a short fall, about 0.3 s); anchor = its ground point |
| stone-land | `stone-land_stone-land.png` + `stone-land_stone-dust.png` | 12 @ 12 fps, once | play on landing. keyFrames: impact 0, settled 3, pops away 7-11. Dust is its own layer with a darker tan edge so it shows on the path (draw under or over the hero as you like) |
| dummy-small, dummy-big | `dummy-*-idle_*.png` | 1 | straw training dummies: wooden cross-foot stand, a crossbar for arms, straw strands and rope ties, thick dark outline. About 58 px (small) and 74 px (big, gold sash) tall in game; the hero is about 62 px. No face |
| dummy-*-hit | `dummy-*-hit_*.png` | 8 @ 16 fps, once | rocks back and settles; play on every hit |
| dummy-*-defeat | `dummy-*-defeat_<dummy>.png` + `_<dummy>-puff.png` | 12 @ 12 fps, once | wobble, then pops into straw bits on frame 7 |
| stumble-stars | `stumble-stars_stumble-stars.png` | 12 @ 12 fps, loop | 3 gold stars circling, each about 8-10 px in game with a dark outline; anchor = ring centre, put it on top of the hero's head while stumbled |

Previews (game size, 667x375 landscape, hero drawn from the real player sprites): `preview/`.
