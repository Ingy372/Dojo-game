# Delivery Note: Town Growth, 9 belt add-on overlays (A-TOWN-GROWTH)

**ITEM:** A-TOWN-GROWTH (Jay approved C-STORY-f; spec `drafts/content/town/town-changes.md`, PR #344). The town grows as the student ranks up: one transparent add-on overlay per belt (White to Brown-Black), each in a **day and a dusk** version, on the approved town square (PR #301) with the Action Zone dojo in its slot (PR #393). Black belt is not in this set. Scope was changed from "3 samples" to the **complete set** tonight.

**WHAT:**
- **36 overlay PNGs** (9 belts x day/dusk x @2x 1864 x 860 and 1x 932 x 430) in `overlays/`, full-frame in the same frame as `action-zone-dojo/previews/town-slot-in-town-<day|dusk>[@2x].png` (draw at 0, 0, in stage order, cumulative), plus `overlays/overlays.json` (belt, changeId, what grows, reward message, files).
- **22 cumulative stage previews + 2 sheets** in `previews/` (`stage-0` = the town today, then stage 1 to 9 after each belt, day and dusk; `growth-sheet-day.png` / `growth-sheet-dusk.png` show all 10 stages together). Previews are 0.75 scale (1398 px wide) with a caption bar.
- The 9 add-ons: 1 White bigger gold lamps and a bridge lamp; 2 Yellow flower beds, vine, butterflies; 3 Orange chimney, bread, brick oven, long table; 4 Green stepping stones and a stone giant bench; 5 Blue clear river, koi, lilies, sitting dock; 6 Red **gold flame** banners, dummy, brazier; 7 Red-Black wind chime and welcome bell; 8 Brown reading tree, root bench, book-swap box; 9 Brown-Black Tower glow, rainbow, puddles, window lantern. Table with details: `README.md`.
- `source/` holds the render script (`build_town_growth.py`, Blender), `make_growth.py` (dusk, glow, previews) and `render_all.sh` (one command rebuilds everything, at most 2 Blender processes). `README.md` explains the stacking and the build.

**WHY:** The game needs one small layer per belt that drops onto the town it already has, so the town visibly grows with rank, and Jay and the Programmer can preview every stage before anything is wired. Each overlay is rendered from the **same Blender scene and camera** as the town square, with the town's own objects held out, so every piece sits behind the town's trees, bridge, walls and roofs exactly and lines up pixel for pixel. Nothing is repainted.

**Second pass and checks:**
- **Red check** (HSV hue < 0.03 or > 0.97, sat > 0.6, value > 0.4): **0 red px in all 36 overlays.** The stage previews carry the same red as stage 0 (the dojo's branded CMA sign and awning: day 1,905 px, dusk 1,389 px at the preview scale); stages 1 to 9 never add to it (stage 9 is slightly lower because the rainbow/glow sit over a few sign pixels at the edge). **Zero non-branded red.**
- **Lanes and statue:** checked on the day overlays: no opaque pixel on the statue or its ring, none on the statue's paving, and none in the front paving strip (rows 4.6 to 5.8) except on the flower beds (yellow, existing beds) and the river/bank (blue). Found and fixed in the pass: the Orange table touched the strip edge, so it moved up 0.08 tile. Puddles (stage 9) are flat decals in the four far paving corners.
- **Heads:** nothing is drawn over a walking space; the few high pieces (chimney smoke, Tower glow, rainbow, tree crown, butterflies at flower height, chime and bell on the dojo's front wall) are over walls, hills and sky.
- **Glows:** every dusk glow is on a real source (lantern, oven window, table lantern, brazier flame, dock lantern, book-box lamp, window lantern, the Tower lamp, the town's own lamps, fireflies). Pools only where there is a source.
- Phone and house number: a grep of `incoming-art/` for both real values finds nothing. No photo is committed. Only `incoming-art/` changed; `main`, game code, the town base and the statue are untouched.

**DECIDE:**
1. **Gold flame** (Red belt): done as Jay chose, gold on the hill and yard banners. At dusk the **banner flames are not lit** (only the yard brazier flame is a real light), so they read a little murky in the dark. OK, or give the banners a small lantern source?
2. **Rainbow (Brown-Black):** no red band (orange, yellow, green, blue, violet) because of the no-red rule, and it is **day only** (dusk gets the stronger Tower glow, sparkles and warmer town lights instead). OK?
3. **Practice yard** (Red): the training dummy and brazier sit in the yard's left corners. If the yard platform counts as walkable, treat them as blockers or move them.
4. **Puddles** are flat decals in the four far paving corners. Walkable but only a decal; keep, or drop them to be safe?
5. **White:** the base dusk already lights the existing lamps, so stage 1 adds bigger gold glass lanterns, one bridge lamp and pools. Enough of a change for the first belt?
6. **Green path** is short (the right hill strip) plus the stone bench in the lawn gap at the hedge line; at preview size the stones are small. Bigger?
7. **Brown tree** sits at the right edge and its crown is cropped by the frame. Move it left onto the lawn (which crowds the market), or keep?
8. **Names and wording:** the 9 changeIds (as in the spec: `wc-lantern-halls-lamps` ... `wc-storm-stair-tower-glow`), titles (Lantern Halls, Sunrise Garden, Ember Kitchens, Giant's Steps, Quiet River, Forge of Courage, Hall of Echoes, Root Library, Storm Stair) and the nine kid reward messages in `overlays.json`. Wording needs Jay's or the Manager's eye.
9. **Black belt** is out of scope (no spec yet).

**NEXT:**
1. Jay looks at the previews (`previews/growth-sheet-day.png` and `-dusk.png` first, then each stage) and answers DECIDE.
2. I apply the changes (one command: `source/render_all.sh`) and push to this PR.
3. The Programmer imports the 36 overlays (stack in stage order on the town base) once the picture is approved; the content side wires them to the changeIds.
