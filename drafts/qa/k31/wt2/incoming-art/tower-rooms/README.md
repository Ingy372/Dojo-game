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
- **Icon:** each door has its icon on a full round medallion above the lintel (review fix: it used to be cut off by the wall cap). The medallion is turned to face the camera, so it reads as a true circle, with the icon centred on it. The same icon is also a separate 48 × 56 sprite (`icon-<type>`) for the map or a hover hint.

| Type | Colour | Icon |
| --- | --- | --- |
| battle | red `#c8553d` | A pair of red sparring gloves |
| challenge | purple `#7b5cc4` | A gold star |
| treasure | gold `#d9a441` | A little chest |
| rest | green `#3f9a7a` | A green leaf |

## Chest (review fix: made special): 3 sheets, 12 fps, all 104 px wide, layers `chest`, `chest-glow`, `chest-fx`

The layers stack bottom to top: wood and gold, then the light in the seams, inside and the glints, then the beam, stars and sparkles. With the FX on their own layers, the game can add sound or particles on the key frames.

| Sheet | Frames | Plays | What |
| --- | --- | --- | --- |
| `chest-closed` | 12 (1.0 s) | loop | Closed idle: a glint slides down a gold band |
| `chest-open` | 30 (2.5 s) | once | **0–11 anticipation:** wiggles and little hops, the lid rattles, light grows in the seam. **12 the lid bursts open:** squash and overshoot, a bright golden light beam. **13–29:** stars and sparkles rise and spin, the inside glow pulses (peak on frame 16), the beam fades by frame 26 |
| `chest-opened` | 12 (1.0 s) | loop | Open idle: the light inside gently breathes, small twinkles rise |

- **Key frames** are in `static.json` (`keyFrames`): anticipation 0–11, lidBurst 12, beamPeak 14, glowPulse 16, starsRise 13–29, settled 29.
- **Sound cues:** a rising shimmer on 0–11, a pop and chime on 12.
- `chest-open` and `chest-opened` are the same size and anchor, so they follow on seamlessly. `chest-closed` is shorter: it has no beam room above it. All three anchor on the bottom-centre of the C tile.
- **Previews:** `preview/chest-open.png` is the open still. `chest_closed_idle.gif` shows the closed idle; `chest_open.gif` plays closed idle → opening → open idle.

## Rest shrine: `shrine` + `shrine-glow` (104 × 168, 8 frames)

- A little roofed stone shrine with a lantern orb.
- `shrine-glow` is an additive-style layer drawn on top: the orb's soft glow breathes in and out over the 8 frames. Loop at 8 fps, or just pulse the layer's alpha.

## Previews

- `review-1-tiled-room.png`: start here.
- `review-2-doors-2x.png`: start here.
- `review-3-chest-and-shrine-2x.png`: start here.
- `door-closeup-3x.png`, `chest_closed_idle.gif`, `chest_open.gif`, `shrine_glow.gif`, `gallery-1x.png`.
