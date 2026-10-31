# Town Growth: 9 belt add-on overlays on the town square (A-TOWN-GROWTH)

The town grows as the student ranks up. Each belt adds one transparent overlay on top of the approved town square (PR #301) with the Action Zone dojo in its slot (PR #393), in a **day** and a **dusk** version. Spec: `drafts/content/town/town-changes.md` (PR #344, branch `bot-content-story-f`). Art only: nothing outside `incoming-art/` changed, no game code, no change to the town base or the statue.

Jump to: [What is here](#what-is-here) | [How the game stacks them](#how-the-game-stacks-them) | [The 9 add-ons](#the-9-add-ons) | [How it is built](#how-it-is-built) | [Rules and checks](#rules-and-checks)

## What is here
| Folder | Contents |
|---|---|
| `overlays/` | 9 add-ons x day/dusk x (@2x 1864 x 860, 1x 932 x 430) = **36 transparent PNGs** named `<stage>-<id>-<day or dusk>[@2x].png`, and `overlays.json` (belt, changeId, reward message, files) |
| `previews/` | `stage-<0..9>-<id>-<day or dusk>.png`: the **cumulative** town after each belt (stage 0 = the town today), each with a caption bar; `growth-sheet-day.png` / `growth-sheet-dusk.png`: all 10 stages on one sheet (watch the town grow) |
| `source/` | `build_town_growth.py` (Blender, the 3D add-ons), `make_growth.py` (Pillow: dusk grade, glow, pools, fireflies, the 2D sky layers, previews), `render_all.sh` (rebuilds everything) |
| `DELIVERY_NOTE.md` | ITEM / WHAT / WHY / DECIDE / NEXT |

## How the game stacks them
- Every overlay is a **full-frame** PNG in the same frame as `action-zone-dojo/previews/town-slot-in-town-<day|dusk>[@2x].png` (1864 x 860 @2x = 23.3 x 10.75 tiles; the town is shifted down 0.95 tile like the approved concept, so a ground point at tile (c, r) is at px (c x 80, r x 80 + 76) @2x). No anchors or offsets: draw each at (0, 0).
- Draw order: the town base (with the dojo sprite), then the overlays **in stage order** (1 White ... 9 Brown-Black) for every belt the student has reached. The rank is cumulative, so a Blue belt shows stages 1 to 5.
- Match the town's time of day (day overlays on the day town, dusk on the dusk town).
- The overlays are flat pictures with no sprites to sort: everything in them sits on lawn, flower beds, hedges, walls, hills, water, the bank, the yard corners, the sky or the dojo's front wall. They never cover a walking lane (see Rules and checks).

## The 9 add-ons
| # | Belt | changeId | What grows (day) | At dusk |
|---|---|---|---|---|
| 1 | White | `wc-lantern-halls-lamps` | the two lamp posts get bigger gold glass lanterns; a new lamp on the bridge's back rail; glints and one rising gold spark | the lanterns, with a warm pool under each source |
| 2 | Yellow | `wc-sunrise-garden-blooms` | both flower beds overflow with gold, white and pink blooms and sunflowers; lawn tufts; a flowering vine on the dojo's left corner; three butterflies | flowers close into buds; fireflies drift round the vine and beds |
| 3 | Orange | `wc-ember-kitchens-chimney` | shop chimney with smoke; a bread basket on the counter; a brick oven; a long table with two benches, plates and bread; a lantern post | the oven window, the table's lantern and a chimney glow |
| 4 | Green | `wc-giants-steps-path` | smooth stepping stones up the right hill; a giant stone bench in the lawn gap by the shop (and a worry stone) | three small stone lanterns light the path |
| 5 | Blue | `wc-quiet-river-clear` | the river runs clear: pebbles on the bed, more koi, lily pads with blooms, sparkles, a small wooden sitting dock with a lantern | the dock lantern and its pool |
| 6 | Red | `wc-forge-courage-banners` | **gold flame** emblems on the hill banners and the two yard banners; a padded training dummy and a brazier in the yard corners | the brazier is lit (a warm pool on the yard) |
| 7 | Red-Black | `wc-hall-echoes-bell` | a wind chime and a welcome bell by the dojo door | the chime tubes glimmer faintly |
| 8 | Brown | `wc-root-library-tree` | a big reading tree on the right with two little birds, a root bench and a book-swap box | the box lamp and four hanging lanterns |
| 9 | Brown-Black | `wc-storm-stair-tower-glow` | the Tower lamp glows gold with soft sparkles; a rainbow; puddles in open paving corners; a lantern in the dojo window | the Tower glows stronger, the town's lamps glow a little warmer |

**No red anywhere.** Red belt = **gold flame** (Jay's choice). The rainbow has five bands (orange, yellow, green, blue, violet), no red band. The only red in the previews is the dojo's existing branded CMA sign and the awning stripe.

## How it is built
The overlays come from the **same Blender scene and camera** as the town square, so they line up pixel for pixel.
1. `build_town_growth.py` loads the town square script (`--no-dojo0 --clear-dojo-trees`, the PR #393 slot setup), turns every existing town object into a **holdout** (so each add-on is hidden behind the town's own trees, bridge, walls and roofs), adds only that belt's objects, and renders a colour pass and a "lit" pass (the emissive objects) at 1864 x 860. Same toon look and outline (`tools/toon_kit.py`).
2. `make_growth.py` holds each overlay out of the dojo sprite's silhouette (except the few pieces that stand in front of the dojo: the vine, the chime and bell, the window lantern). **Dusk** follows the town square's recipe: multiply (120, 112, 165), 10 percent toward (60, 45, 70), lit pixels warm (255, 226, 170), a glow = the blurred lit mask, and a warm pool on the ground right under each source. The sky layers of stage 9 (rainbow, Tower glow, sparkles) and the puddles are drawn here, hidden behind the town, the dojo and the Tower.
3. `render_all.sh` runs everything (at most 2 Blender processes at once) and then the previews.

Rebuild from the repo root: `bash incoming-art/town-growth/source/render_all.sh /tmp/passes`.

## Rules and checks
- **Red check** (HSV hue < 0.03 or > 0.97, saturation > 0.6, value > 0.4): **0 red px in all 36 overlay files.** The stage previews carry the same red count as stage 0 (the dojo's branded sign), never more.
- **Lanes and statue:** the overlays have no opaque pixel on the statue or its ring, and none in the plaza's walkable paving: the only objects there sit on the lawn line, the beds, the water and bank, the yard corners, hills and walls. Puddles are flat decals in open corners. Nothing is drawn above a character's walking space.
- **Glows:** every dusk glow is on a real source (lamp lanterns, oven window, lanterns, brazier flame, the Tower lamp, the window lantern, the existing town lights, fireflies). Warm pools are drawn only right under a source.
- **Kid-friendly:** soft shapes, no weapons, no sharp props.
- The real phone and house number are not in the repo (grep of `incoming-art/` finds nothing). No reference photo is committed.
