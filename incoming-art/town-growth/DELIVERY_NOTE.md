# Delivery Note: Town Growth, 9 belt add-on overlays (A-TOWN-GROWTH)

**ITEM:** A-TOWN-GROWTH (Jay approved C-STORY-f; spec `drafts/content/town/town-changes.md`, PR #344). The town grows as the student ranks up: one transparent add-on overlay per belt (White to Brown-Black), each in a **day and a dusk** version, on the approved town square (PR #301) with the Action Zone dojo in its slot (PR #393). Black belt is not in this set. Scope was changed from "3 samples" to the **complete set** tonight.

**WHAT:**
- **36 overlay PNGs** (9 belts x day/dusk x @2x 1864 x 860 and 1x 932 x 430) in `overlays/`, full-frame in the same frame as `action-zone-dojo/previews/town-slot-in-town-<day|dusk>[@2x].png` (draw at 0, 0, in stage order, cumulative), plus `overlays/overlays.json` (belt, changeId, what grows, reward message, files).
- **22 cumulative stage previews + 2 sheets** in `previews/` (`stage-0` = the town today, then stage 1 to 9 after each belt, day and dusk; `growth-sheet-day.png` / `growth-sheet-dusk.png` show all 10 stages together). Previews are 0.75 scale (1398 px wide) with a caption bar.
- The 9 add-ons: 1 White bigger gold lamps and a bridge lamp; 2 Yellow flower beds, vine, butterflies; 3 Orange chimney, bread, brick oven, long table; 4 Green stepping stones and a stone giant bench; 5 Blue clear river, koi, lilies, sitting dock; 6 Red **gold flame** banners, dummy, brazier; 7 Red-Black wind chime and welcome bell; 8 Brown reading tree, root bench, book-swap box; 9 Brown-Black Tower glow, rainbow, puddles, window lantern. Table with details: `README.md`.
- `source/` holds the render script (`build_town_growth.py`, Blender), `make_growth.py` (dusk, glow, previews) and `render_all.sh` (one command rebuilds everything, at most 2 Blender processes). `README.md` explains the stacking and the build.

**WHY:** The game needs one small layer per belt that drops onto the town it already has, so the town visibly grows with rank, and Jay and the Programmer can preview every stage before anything is wired. Each overlay is rendered from the **same Blender scene and camera** as the town square, with the town's own objects held out, so every piece sits behind the town's trees, bridge, walls and roofs exactly and lines up pixel for pixel. Nothing is repainted.

**Second pass and checks:**
- **Red check** (HSV hue < 0.03 or > 0.97, sat > 0.6, value > 0.4): **0 red px in all 36 overlays.** The stage previews carry the same red as stage 0 (the dojo's branded CMA sign and awning: day 1,905 px, dusk 1,389 px at the preview scale); stages 1 to 9 never add to it (stage 9 is slightly lower: the Tower glow and rainbow tint some existing red pixels). **Zero non-branded red.**
- **Lanes and statue:** checked on the day overlays: no opaque pixel on the statue or its ring, none on the statue's paving, and none in the front paving strip (rows 4.6 to 5.8) except on the flower beds (yellow, existing beds) and the river/bank (blue). Found and fixed in the pass: the Orange table touched the strip edge, so it moved up 0.08 tile. Puddles (stage 9) are flat decals in the four far paving corners.
- **Heads:** nothing is drawn over a walking space; the few high pieces (chimney smoke, Tower glow, rainbow, tree crown, butterflies at flower height, chime and bell on the dojo's front wall) are over walls, hills and sky.
- **Glows:** every dusk glow is on a real source (lantern, oven window, table lantern, brazier flame, dock lantern, book-box lamp, window lantern, the Tower lamp, the town's own lamps, fireflies). Pools only where there is a source.
- Phone and house number: a grep of `incoming-art/` for both real values finds nothing. No photo is committed. Only `incoming-art/` changed; `main`, game code, the town base and the statue are untouched.

**Review fixes (Manager, PR #396):**
- **Banner flames now have a light source (done).** At dusk each gold flame banner has a small lit lantern next to it: on a little bracket at the top of each of the four hill banner poles, and on a short arm beside each of the two yard banners. The lantern is the source of the glow; the flames themselves stay unlit. No red, nothing in a walking lane.
- **Brown tree moved in (done).** The tree and its crown moved 0.5 tile left (trunk at tile 22.45), the crown is lower and rounder, and the whole crown is inside the 23.3-tile frame. The four night lanterns now hang in front of the crown, the book-swap box moved in so it is not cropped, and the glow pool moved with it. The tree stands on the lawn above the front lane strip (rows 4.6 to 5.8).
- **Wording check (done, nothing to fix).** All 9 reward messages in `overlays.json` match `drafts/content/town/town-changes.md` (branch `bot-content-story-f`) word for word, and the 9 titles match the spec's Name / Title. The spec lists a 10th change (`wc-summit-great-lamp`, Black), which is not built (see Black belt below).
- Re-rendered: `6-red-dusk`, `8-brown-day`, `8-brown-dusk` (+ @2x) and the stage 6 to 9 previews that include them, plus both growth sheets. Re-run checks: red 0 px in all 36 overlays; previews carry only the branded CMA sign (day 1,905 px, dusk 1,389 px, never above stage 0); phone and house number grep finds nothing; statue box clear in every overlay except the yellow beds and the river (existing flowerbeds and water); front strip clear except the beds, the river/bank (blue) and the yard banner foot (red, 104 px at the yard edge, on the yard platform).

**DECIDED (Manager):**
1. **Rainbow OK** (no red band, day only).
2. **Corners fine:** the training dummy and brazier stay in the practice yard corners.
3. **Puddles kept** (flat decals in the four far paving corners).
4. **White is enough** for the first belt.
5. **Path as is** (the Green stepping stones and the stone bench).
6. **Banner flames:** a small lantern was added at dusk (see above).
7. **Brown tree:** moved in so the crown is not cropped (see above).
8. **Names and wording:** identical to the spec.

**STILL OPEN:**
1. **Black belt** (`wc-summit-great-lamp`) is out of scope, no art made.

**NEXT:**
1. Jay and the Manager look at the regenerated `previews/growth-sheet-day.png` and `-dusk.png` and the stage 6 and 8 previews, and merge if happy.
2. Any further changes: one command, `source/render_all.sh`, then push to this PR.
3. The Programmer imports the 36 overlays (stack in stage order on the town base) once the picture is approved; the content side wires them to the changeIds.
