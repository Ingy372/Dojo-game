# Hearth Cook guardian art (B-T3-TUNE-2b)

These sprites replace the borrowed stand-ins from #285 (`hearth-cook-p1 pin`, `hearth-cook-p2 pin`, `hearth-cook-p3 bonk`). They also add a "lid up" look for when sparks are alive (`lidWhileHelpers`). The pipeline, scale and style are the same as #247 (`tier3-orange-guardian`).

## Contents
| Folder | Contents | Frames @ fps |
|---|---|---|
| `p1-pin/sprites/` | `hearth-cook-p1-pin_windup_pin`, `_pin` (layers: body, glow, telegraph, light) | windup_pin 13f @10 (1.3 s = 26 ticks), pin 17f @10 |
| `p2-pin/sprites/` | the same set for phase 2, plus a `lid` layer | the same |
| `p3-bonk/sprites/` | `hearth-cook-p3-bonk_windup_bonk`, `_bonk`, plus a `lid` layer | windup_bonk 10f @10 (1.0 s = 20 ticks), bonk 13f @10 |
| `lid/p2/`, `lid/p3/` | Lid-only overlay sheets that match every #247 p2 or p3 sheet frame for frame (idle, move, windup_*, rush, pin/bonk, call, hit, stagger) | the same as the base sheet |
| `icon/` | `icon-lid-{24,32,48,64}.png` and `@2x`, the boss-bar lid icon | static |
| `preview/` | wind-up GIFs, lid-up GIFs, phone sheet | |

Each sheet is 256 px per frame and has 8 rows (N, NE, E, SE, S, SW, W, NW). Each column is one frame. Each folder has a JSON with the same format as #247, and wind-up JSONs include `telegraphIntensity`.

## Import notes
- **Pin stand-ins (P1/P2):** draw the `*-pin` sheets only during `windup_pin` and `pin`. In these sheets the ladle is put away and the rolling pin is in both mitts. All other states keep the #247 sheets.
- **Bonk (P3):** draw `p3-bonk` during `windup_bonk` and `bonk`. The pin is swung from the side at head height, never above the head. In these sheets the lid is edge-on at the left hip, so it stays off the face in every direction.
- **Lid up:** while `lidWhileHelpers` is active, draw the matching `lid/pN` sheet (same anim, direction and frame) on top of the body. For pin and bonk, use the `lid` layer inside those sheets. Then show the `icon-lid` icon at the end of the boss bar, replacing the code lid. Keep the grey wash.
- **Telegraph:** the game tints it. In the previews the pin is shown purple and the bonk red. Red is for danger only.

## Red check
I counted pixels with hue ≤0.03 or ≥0.97, saturation >0.6 and value >0.4 across the body, glow, lid and light layers and the icons. Telegraph layers were skipped. Result: **0 px** in every set.

## Rebuild
```
blender -b -P source/build_hearth_cook_2b.py -- --enemy hearth-cook --phase 1 --set pin --out source/hearth-cook-2b_p1-pin.blend
blender -b source/hearth-cook-2b_p1-pin.blend -P ../tools/render_sprites.py -- --out p1-pin/sprites --name hearth-cook-p1-pin --size 256 --ortho 3.2
python3 source/make_2b_previews.py
```
To build the other sets, change `--phase` and `--set`. Use `--set ""` for the lid-only p2 and p3 builds.
