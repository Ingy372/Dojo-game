# Action Zone dojo: 3 samples (outside face, inside main floor, parent seating)

Samples only, in the Blender toon top-down style of the approved town square (PR #301): `toon_kit` cel shading, inverted-hull outline, ortho camera looking north 35° down, ground on the game grid. 80 px per tile at @2x (the town square scale), 40 px at 1x.

| Sample | File | Size @2x |
|---|---|---|
| 1. Outside face | `samples/outside-face@2x.png` (+ 1x) | 1120 x 712 |
| 2. Inside main floor (rebuilt to Jay's layout) | `samples/inside-main-floor@2x.png` (+ 1x) and `samples/inside-main-floor-layout-diagram.png` | 2272 x 1696 |
| 3. Parent seating | `samples/parent-seating@2x.png` (+ 1x) | 1008 x 736 |

## What is in each
1. **Outside:** tan ribbed metal building with a brown gable roof, red 3D "CMA / MARTIAL ARTS" letters, a small kick-figure badge above them, brown double doors with two glass panes and a push bar, two windows, banners, two blue accessibility plates, benches, two red metal chairs, two flower beds, shrubs, a palm and round trees, a gravel lot with yellow-on-black curb stops.
2. **Inside (rebuilt):** one wide room, top-down, entry at the bottom. Walls end at a flat drywall cap (nothing above it). Read it from the entry door up:
   - **Entry hall** (tan tile, welcome mat, open door leaves, plant, bin, bench, turquoise sofa).
   - **Left: the PRO SHOP** (blue cloud wall, "PRO SHOP" sign, grid wall with uniform bags and pads, belt rack, black tees, a stylised lion painting, glass counter with gloves, headgear and shoes; no weapons).
   - **Right: the TWO CROSS DOORS** (white doors, blue frames, red crosses; the right one has a blue restroom plate) with the **HANDPRINT WALL** between them (plain red and blue handprints, a wood plaque with the logo and a black belt, a red fire extinguisher).
   - **Straight ahead: the PARENT SEATING**, the approved stadium seats (3 tiers of 8, blue and red), now facing the mat.
   - **Beyond the seating: the RED BOX** that holds the students' gear bags, with a **GAP at EACH end** (left 2.6 tiles wide, right 2.6 tiles wide) where students walk onto the mat. The box is 7.2 tiles long, with 5 bag openings.
   - **On the mat, left (north wall):** the **YELLOW target wall** (12 plain yellow torsos on wood), grip ropes, then the **styles mural** with Jay's real logo and the styles named as on the wall (Karate, Kung Fu, Jiu Jitsu, Tae Kwon Do, Weapons). Beside them: the back double doors, the US flag with a gear shelf, the Class Creed and the belt creed boards (real wording).
   - **On the mat, right:** three **punching bags** (black, blue, red), a whiteboard on a stand, a stack of crash mats.
   - **Floor:** **blue mats** surrounding a big **red square** with **Jay's real school logo** in the centre.
   - `samples/inside-main-floor-layout-diagram.png` is a labelled top-down plan drawn from the same numbers (`source/layout_main_floor.py`), so Jay can check placement.
3. **Parent seating:** 3 stepped tiers of stadium seats alternating blue and red (shifted one seat each row), front rail, side steps, and a few props (bag, bottle, jacket, book, toy basket, four stylised paintings and a clock with no numbers).

## Separate swappable layers
Rendered with the same camera, so they drop straight onto the base picture. The base picture has a blank banner and a blank plate where they go.
- `overlays/outside-phone-layer@2x.png` (+ 1x): the phone number slot on the left banner.
- `overlays/outside-address-layer@2x.png` (+ 1x): the house number slot on the plate by the door.
They are objects tagged `layer=phone` and `layer=address` in the .blend and in `build_action_zone_dojo.py`.

**The committed layers are blank placeholders** (a faint grey bar and a faint brown bar). The real phone number and house number were **removed from the branch tip** in a follow-up commit. They **remain in the history of the earlier commit `af9fd2a`** (the PR's first commit): its overlay PNGs, .blend files and script hold them. Jay decides whether to scrub that history (it needs a history rewrite and a force-push, which has not been done).

To render the real values locally, make `source/local_overlay_values.json` (git-ignored, never commit it):
```
{"phone": "...", "house_number": "..."}
```
and run `source/render_all.sh`. Leave the file out, or the values empty, to get the blank placeholders.

## Rules followed
- No handprint names at all (Jay's decision): plain handprints only, no names layer.
- Text: sign letters, the style names, and the creed boards, whose words Jay's Manager asked for (read by eye from Jay's wall photos; `source/creed_text.json`; the full-size textures are in `source/textures/`). The two overlay layers stay blank.
- Jay's logo is his own file (`badges-trophies-a3c/source/jay-logo/logo-white.jpg`), cut out by `make_textures.py`. The old plain kick figure is gone from the main floor (the approved outside face is unchanged).
- Likeness reference photos were used for looking only. No photo or crop is in the repo.
- Daylight only. No glows. No weapons or blades in the pro shop. Mural silhouettes show poses only. The yellow men are plain torsos with no faces.
- Branded red (sign, chairs, the red square, red box, seats, banner stripe, flag stripes, door crosses, logo, creed titles, red bag) is Jay's real branding and an exception to the no-red-outside-danger rule. See DELIVERY_NOTE.

## Rebuild
```
cd incoming-art/action-zone-dojo/source
python3 make_textures.py # logo, Class Creed, belt creed and flag pictures into textures/ (needs Pillow, numpy, scipy)
python3 make_layout_diagram.py   # the labelled plan
./render_all.sh          # 3 scenes at 24 samples, writes ../samples, ../overlays, the .blend files, and the 1x copies
blender -b -P build_action_zone_dojo.py -- --scene outside|inside|seating [--samples 24] [--ppt 80]
```
Needs Blender 4.2 and `incoming-art/tools/toon_kit.py`. Letters use Be Vietnam Pro Black (OFL, system font); the script falls back to Blender's default font if it is missing.

## Photo versus description (what conflicted)
See the DELIVERY_NOTE ("Photo conflicts"). Short version: the photos put the yellow men and mural on the WEST side wall and the cubby is plain; I followed Jay's words and unfolded the side-wall art onto the north wall (a north-facing camera cannot see side walls).

## Restored version and the one change (PR #393, latest)
Jay pointed at a specific picture of the inside sample: pro shop on the left, handprint wall and crosses on the right, target wall top-left, bags top-right. That is the **12118dac** layout (checked element by element against the render of that commit). The later fold-out versions (`2ca1dd6`, `396e4ad`, `24b1eb6`) are superseded; they stay in history. Inside PNGs, diagram and `source/` were restored from 12118dac and exactly one thing was changed: **a gap at both ends of the red bag box**. 12118dac already had the left gap (x 7.0 to 9.6); the right gap (x 16.8 to 19.4, same 2.6 width, same threshold strip and arrow) is new. To make room the box was shortened from 9.6-19.4 to 9.6-16.8, its openings went from 7 to 5, and the yellow top bag moved from x 17.3 to 16.2 so it still sits on the box. The rest of the frame is pixel-identical to 12118dac (see the DELIVERY_NOTE). Outside and seating PNGs are byte-identical to before.
