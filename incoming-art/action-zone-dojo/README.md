# Action Zone dojo: 3 samples (outside face, inside main floor, parent seating)

Samples only, in the Blender toon top-down style of the approved town square (PR #301): `toon_kit` cel shading, inverted-hull outline, ortho camera looking north 35° down, ground on the game grid. 80 px per tile at @2x (the town square scale), 40 px at 1x.

| Sample | File | Size @2x |
|---|---|---|
| 1. Outside face | `samples/outside-face@2x.png` (+ 1x) | 1120 x 712 |
| 2. Inside main floor (rearranged to Jay's markup) | `samples/inside-main-floor@2x.png` (+ 1x) and `samples/inside-main-floor-layout-diagram.png` | 3504 x 1696 |
| 3. Parent seating | `samples/parent-seating@2x.png` (+ 1x) | 1008 x 736 |

## What is in each
1. **Outside:** tan ribbed metal building with a brown gable roof, red 3D "CMA / MARTIAL ARTS" letters, a small kick-figure badge above them, brown double doors with two glass panes and a push bar, two windows, banners, two blue accessibility plates, benches, two red metal chairs, two flower beds, shrubs, a palm and round trees, a gravel lot with yellow-on-black curb stops.
2. **Inside (rearranged to Jay's markup):** one wide room, top-down, entry at the bottom. Walls end at a flat drywall cap (nothing above it). A camera looking north cannot see a side wall, so **each side wall is folded out flat into its own margin** (hinged on the wall line, art face-up on a grey pad) and reads from above. Read it from the entry door up:
   - **Entry hall** (tan tile, welcome mat, open door leaves, plant, bin, shoe bench on the right, turquoise sofa on the left).
   - **LEFT side wall** (folded out into the left margin, three panels from the mat end to the lobby end): the **YELLOW target wall** (12 plain yellow torsos on wood); the **wall artwork** (styles mural with Jay's real logo and the styles named as on the wall: Karate, Kung Fu, Jiu Jitsu, Tae Kwon Do, Weapons); then the **TWO CROSS DOORS** (white doors, blue frames, red crosses; the right one has a blue restroom plate) with the **HANDPRINT WALL** between them (plain red and blue handprints, a wood plaque with the logo and a black belt, a fire extinguisher).
   - **RIGHT side wall** (folded out into the right margin): the **PRO SHOP** (blue cloud wall, "PRO SHOP" sign, grid wall with uniform bags and pads, belt rack, black tees, a stylised lion painting). Its glass counter (gloves, headgear, shoes, belts; no weapons) stands in the right lobby.
   - **Straight ahead: the PARENT SEATING**, the approved stadium seats (3 tiers of 8, blue and red), facing the mat.
   - **Beyond the seating: the RED BOX** for the students' gear bags, with a **GAP at EACH end** (left x 7.0-9.6, right x 17.4-20.0, the same 2.6 tiles wide, each with a threshold strip) where students walk onto the mat. The two plain wall blocks beside the gaps divide the lobby from the mat.
   - **North wall (mat room):** the unchanged items: grip ropes, back doors, US flag and gear shelf, Class Creed and belt creed. The left half of the north wall is now plain because the target wall and mural moved to the left side wall.
   - **On the mat, right:** three **punching bags** (black, blue, red), a whiteboard on a stand, a stack of crash mats (unchanged).
   - **Floor:** **blue mats** surrounding a big **red square** with **Jay's real school logo** in the centre (unchanged).
   - `samples/inside-main-floor-layout-diagram.png` is a labelled top-down plan drawn from the same numbers (`source/layout_main_floor.py`), so Jay can check placement. It shows both gaps and the folded-out side walls.
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
See the DELIVERY_NOTE ("Photo conflicts"). Short version: the photos put the yellow men, mural, cross doors and handprints on a side wall; Jay's markup confirms the LEFT wall (and Jay chose this folded-out version over a later reorder), and since a north-facing camera cannot see side walls I fold both side walls out flat into the margins.
