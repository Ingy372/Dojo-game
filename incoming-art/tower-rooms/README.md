# Tower rooms (Batch 4): technical sheet

**Status: draft until Jay approves.** A tileable stone kit, the 4 room doors with icons, a chest and the rest shrine. Built by `source/build_tower.py` and rendered with the shared `tools/render_static.py`: same 35° camera, toon look and 80 px tiles as the Home Dojo.

```bash
blender -b -P incoming-art/tower-rooms/source/build_tower.py -- --out $PWD/incoming-art/tower-rooms/source/tower.blend
blender -b incoming-art/tower-rooms/source/tower.blend -P incoming-art/tools/render_static.py -- --out incoming-art/tower-rooms/sprites
python3 incoming-art/tools/make_tower_preview.py --sprites incoming-art/tower-rooms/sprites --out incoming-art/tower-rooms/preview
```

All sizes, anchors and frame counts are in `sprites/static.json`. Multi-frame pieces are horizontal strips, one frame per `size[0]` px.

## Tiles

| Sprite | Size | Use |
| --- | --- | --- |
| `floor-big` | 80 × 80 | One big flagstone. Tiles seamlessly |
| `floor-quad` | 80 × 80 | 4 small flagstones; mix it with `floor-big` |
| `floor-worn` | 80 × 80 | Worn variant with a pale patch; use sparingly (about 1 in 10) |
| `wall-face` | 80 × 104 | The top wall seen from the front, one tile wide, repeat along the top row. `anchorPx` (0, 24): its bottom edge sits on the top of the first floor row |
| `wall-block` | 80 × 114 | A wall tile seen from above (side and bottom walls, inner walls) |
| `pillar` | 88 × 224 | Round stone pillar on a 1×1 base; anchor = bottom-centre of its tile. Sort with the characters |

## Doors (`door-battle`, `door-challenge`, `door-treasure`, `door-rest`)

- **Size:** 96 × 140. Frame 0 = closed sliding panels, frame 1 = open (warm light in the doorway). Anchor = the bottom-centre on the wall's foot line.
- **Icon:** each door has its icon on a round plaque above the lintel. The same icon is also a separate 48 × 56 sprite (`icon-<type>`) for the map or a hover hint.

| Type | Colour | Icon |
| --- | --- | --- |
| battle | red `#c8553d` | A pair of red sparring gloves |
| challenge | purple `#7b5cc4` | A gold star |
| treasure | gold `#d9a441` | A little chest |
| rest | green `#3f9a7a` | A green leaf |

## Chest: `chest` (104 × 168, 7 frames)

- **Frames:** 0 closed; 1–5 the lid opens with a warm glow and sparkles; 6 open.
- `preview/chest-open.png` is the open still (frame 6). Play frames 0→6 at 12 fps once, then hold 6.

## Rest shrine: `shrine` + `shrine-glow` (104 × 168, 8 frames)

- A little roofed stone shrine with a lantern orb.
- `shrine-glow` is an additive-style layer drawn on top: the orb's soft glow breathes in and out over the 8 frames. Loop at 8 fps, or just pulse the layer's alpha.

## Previews

- `review-1-tiled-room.png`: start here.
- `review-2-doors-2x.png`: start here.
- `review-3-chest-and-shrine-2x.png`: start here.
- `chest_open.gif`, `shrine_glow.gif`, `gallery-1x.png`.
