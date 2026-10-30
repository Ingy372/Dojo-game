# Action Zone dojo: 3 samples (outside face, inside main floor, parent seating)

Samples only, in the Blender toon top-down style of the approved town square (PR #301): `toon_kit` cel shading, inverted-hull outline, ortho camera looking north 35° down, ground on the game grid. 80 px per tile at @2x (the town square scale), 40 px at 1x.

| Sample | File | Size @2x |
|---|---|---|
| 1. Outside face | `samples/outside-face@2x.png` (+ 1x) | 1120 x 712 |
| 2. Inside main floor | `samples/inside-main-floor@2x.png` (+ 1x) | 1840 x 832 |
| 3. Parent seating | `samples/parent-seating@2x.png` (+ 1x) | 1008 x 736 |

## What is in each
1. **Outside:** tan ribbed metal building with a brown gable roof, red 3D "CMA / MARTIAL ARTS" letters, a small kick-figure badge above them, brown double doors with two glass panes and a push bar, two windows, banners, two blue accessibility plates, benches, two red metal chairs, two flower beds, shrubs, a palm and round trees, a gravel lot with yellow-on-black curb stops.
2. **Inside:** a cutaway room. Back wall and two side walls end at a flat drywall cap (nothing above it: no ceiling, insulation, ducts or beams). Blue/red mats with white tape and a centre logo; the yellow target wall with a big target and two mitt targets; hanging grip ropes on a short wood rail at the top of the drywall; the pro shop (shelves, glove/pad/uniform/headgear shapes, glass counter, register); two belt-creed boards (8 belt colours, blank text lines); the Class Creed sign (blank lines); a US flag on a stand; two stylised paintings; the martial-styles mural (four plain silhouettes: kick, punch, block, bow); trophy shelf and four stylised photo frames (no faces); a freestanding handprint wall with plain handprints; shoe cubbies, a bench, a water cooler, three kicking-bag stands.
3. **Parent seating:** 3 stepped tiers of stadium seats alternating blue and red (shifted one seat each row), front rail, side steps, and a few props (bag, bottle, jacket, book, toy basket, four stylised paintings and a clock with no numbers).

## Separate swappable layers
Rendered with the same camera, so they drop straight onto the base picture. The base picture has a blank banner and a blank plate where they go.
- `overlays/outside-phone-layer@2x.png` (+ 1x): the phone number on the left banner.
- `overlays/outside-address-layer@2x.png` (+ 1x): the house number on the plate by the door.
They are objects tagged `layer=phone` and `layer=address` in the .blend and in `build_action_zone_dojo.py` (search `LAYER[0] = "phone"`). To drop them: delete those two lines and the two overlay PNGs.

## Rules followed
- No handprint names at all (Jay's decision): plain handprints only, no names layer.
- No readable text except the sign letters and the two overlay layers. Creed boards, the Class Creed sign and the pro shop sign are blank bars.
- Likeness reference photos were used for looking only. No photo or crop is in the repo.
- Daylight only. No glows. No weapons or blades in the pro shop. Mural silhouettes show poses only.
- Branded red (sign, chairs, red mat half, seats, banner stripe, flag stripes) is Jay's real branding and an exception to the no-red-outside-danger rule. See DELIVERY_NOTE.

## Rebuild
```
cd incoming-art/action-zone-dojo/source
./render_all.sh          # 3 scenes at 24 samples, writes ../samples, ../overlays, the .blend files, and the 1x copies
blender -b -P build_action_zone_dojo.py -- --scene outside|inside|seating [--samples 24] [--ppt 80]
```
Needs Blender 4.2 and `incoming-art/tools/toon_kit.py`. Letters use Be Vietnam Pro Black (OFL, system font); the script falls back to Blender's default font if it is missing.
