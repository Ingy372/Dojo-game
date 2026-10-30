# Delivery Note: Action Zone dojo, A4-DOJO game-ready batch (PR #393)

**ITEM:** A4-DOJO. The approved Action Zone dojo (Jay, via the Manager) as game-ready art for the Programmer: the inside room, the outside entrance and the town-square dojo slot. Jay approved all three samples with ONE change, applied first and nothing else touched: the sofa in front of the handprint wall is removed (`8aed75d8`). (It was the only sofa; a teal `#2bb3b3` one, which Jay called light-blue.)

**WHAT:**
- **Inside, one wide scrolling room** (2272 x 1696 @2x): four full-frame layers (floor, walls, props, foreground), full layers only (no chunks), 17 cropped prop/wall-decal sprites with anchors and sort rows, and `inside-room.json` (walkable grid, blockers, spawn, exit, 11 interactables, 24 seat slots, draw order). Students walk BEHIND the foreground layer (the front wall) and, via 4 foreground sprites (`seats-back`, `bag-{black,blue,red}-top`), behind the seat backs and bag tops (drawn above a character only when its feet row < the sprite's `sortRow`).
- **Outside, entrance view** (1120 x 712 @2x), day and dusk: ground, building, blank phone and blank address overlays, plus dusk pools and glow; 12 scenery sprites (bin, 2 benches, 2 chairs, 2 beds, shrub, palm, 3 trees) in day and dusk; `outside-entrance.json` (front-door tap rect, blockers, spawn, light sources).
- **Town-square dojo slot**, day and dusk: 440 x 312 @2x (+ 1x), scale 0.55 of the entrance building, anchored on town tile (3.6, 4.4) where the old placeholder dojo stands in PR #301's town square. Tap rect and target in `static.json`. `previews/town-slot-in-town-{day,dusk}.png` show it placed.
- **Interactive prop sprites:** pro-shop counter, 3 bags, target wall, back doors, 2 cross doors, handprint wall, gear box, parent seats (the rest: bench, plant, trash can, whiteboard, wings).
- **Phone and address** stay blank swappable overlay layers; neither real value is in the repo.
- Files and frame sizes and anchors are explained in `README.md` ("Game-ready batch").

**WHY:** The samples are approved; the game needs layers it can scroll, sort and collide with, and a small version for the town. Every layer comes from the same Blender scene as the sample (same camera and toon look), rendered group by group, so nothing was repainted.

**Second pass and checks:**
- Stacked day layers versus the approved samples: inside 10,259 of 3.85 M px differ by more than 40 (0.27 percent, mean 0.388); outside 877 of 797,440 (mean 0.234). All thin outline/anti-alias lines where layers meet. The sofa is the only intended difference in the inside.
- Approved outside and seating PNGs are byte-identical to `12118dac`.
- Every file named in the JSON exists and has the stated size (every referenced file checked, none missing); all 8 outside entrance layers are 1120 x 712.
- a grep of `incoming-art/` for the real phone number and the real house number finds nothing (checked at the tip). No photo or crop is committed. Only `incoming-art/` changed (the town-square scripts got an opt-in `--no-dojo0` flag; their default output is byte-identical).
- **Red check** (branded red expected): 63 sprite files, 449,516 red px (about 408,977 unique: the seat-back and bag-red-top foreground copies repeat base pixels), all branded: red square (floor 238,966), gear-box 68,839, seats 52,062, crosses, handprints, red bag, chairs, building sign trim. The fire extinguisher is the one danger-red item, as in the approved inside. Nothing else is red.
- Glows: every dusk glow sits on a real source (two windows, door panes, wall lamp lens). Nothing floats free. The dojo building is graded about 15 percent lighter than the town at dusk (entrance and slot only); glows and pools are unchanged.
- Foreground sprites are pixel copies of their base sprites: the stacked inside composite is byte-identical with and without them.

**DECIDE:**
Decided by the Manager (applied):
- **Dusk look:** the dojo (town slot and entrance building) is slightly brighter than the town grade so it reads as the landmark. Subtle: about 15 percent lighter multiply on the building only; every glow stays on its real source.
- **Wall-lamp lens (dusk only):** keep as is.
- **Foreground, tall pieces:** seat backs and bag tops are foreground sprites (above walking students that are behind them). `inside-room.json` has the sort info and the rule.
- **Chunks vs full layers:** full layers only; the chunks are removed.
- **History scrub:** not needed (resolved). The old commit stays as is.

HOLD for Jay (left as they are):
1. **Town-slot scale 0.55.** Same width as the old placeholder (4.4 town tiles). Larger or smaller?
2. **Logo licence.** Jay's logo is his own file; is it cleared for this public repo?
3. **Creed typos.** The wording on the creed boards is as in Jay's photo, typos included. Fix them?

Still open from before:
4. **Branded red exception:** keep the red square, box, seats, sign, crosses and handprints red in the game?
5. **Edge lines between layers** are a few thin outline pixels (see the numbers above). Fine, or bake a tiny overlap?
6. **No phone/address overlay on the town slot** (they would be 3 px tall). OK?
7. "CMA / MARTIAL ARTS" sign wording.

**NEXT:** Programmer imports the layers by `static.json` and `inside-room.json`; the Manager passes Jay's answers; swap the blank phone/address layers from the local values file when Jay wants them shown.

Reference photos stayed outside the repo; no photo or crop is committed.

---

## Earlier note (the 3 samples)

### Delivery Note: Action Zone dojo, 3 samples (inside = Jay's preferred picture + gap at both box ends)

**ITEM:** The real Action Zone dojo for the town square (Jay, via the Manager). Three samples: outside face and parent seating (APPROVED, unchanged since PR review) and the inside main floor (REBUILT to Jay's description).

**WHAT:** `samples/inside-main-floor@2x.png` (2272 x 1696, one wide room) plus 1x, and `samples/inside-main-floor-layout-diagram.png` (labelled top-down plan). Layout, entry at the bottom: PRO SHOP on the left; two cross doors with the plain-handprint wall between them on the right; the parent seating straight ahead; beyond it the red gear-bag box with a gap at EACH end where students walk on (the right gap is the new change); on the mat the yellow target wall on the left with the styles mural and Jay's logo art beside it; punching bags on the right; blue mats around a big red square with the school logo in the middle. Real creed wording, Jay's real logo, US flag, styles named as on the wall. Nothing above the drywall. Phone and address stay blank placeholders. Approved outside and seating PNGs are byte-unchanged.

**RESTORED + ONE CHANGE (latest, Jay's correction):** Jay meant the picture with the pro shop on the left, handprint wall and crosses on the right, target wall top-left and bags top-right. That matches commit `12118dac`, so the inside PNGs, diagram and `source/` were restored from it. Only change: the red bag box now has a gap at both ends. The left gap (7.0 to 9.6) was already there; the new right gap (16.8 to 19.4) copies its width, threshold strip and arrow. To fit it the box is 9.6 to 16.8 (was 9.6 to 19.4), with 5 openings (was 7) and the yellow top bag moved from 17.3 to 16.2. The fold-out versions `2ca1dd6`, `396e4ad`, `24b1eb6` are superseded and stay in history. Diff check against the 12118dac render (same 2272 x 1696): the changed pixels all sit inside the box and gap area (x 823-1815, y 781-1092).

**WHY:** The first main floor did not match the real room. This one is built from one list of numbers (`source/layout_main_floor.py`) that the 3D scene and the diagram both read, so the diagram is the check on placement.

**Second pass, point by point against Jay's words:**
- Upon entry, look left: pro shop. YES (west wing, left of the door).
- Look right: two doors with crosses and the handprint wall between them. YES (east wing).
- Straight ahead: parent seating. YES (centred on the door).
- Beyond: red box for students' gear bags, and a gap for students to walk on the mat. YES (gap at BOTH ends of the box now).
- Onto the mat, yellow men (throwing-star wall) to the LEFT with the logo art and styles beside it. YES (north wall, left; mural next to it).
- Punching bags to the RIGHT. YES.
- Blue mats surrounding a big red square, school logo in the centre. YES.
- Approved outside face and seats not changed. YES (seat design reused; orientation flagged below).

**Red check** (branded red, expected): inside @2x 355,896 px, 1x 89,152; layout diagram 197,337; textures logo 63,142 / belt creed 102,756 / flag 199,345. Outside @2x 13,648 and seating @2x 76,158 are unchanged. Sources: red square, red box, seats, logo, door crosses, creed titles, flag stripes, red bag, gloves and shoes, extinguisher (danger red).

**Photo conflicts (photos versus Jay's description, and what I did):**
1. The yellow men and the styles mural are on the WEST SIDE wall in the photos. A north-facing camera cannot see side walls, so I unfolded them onto the north wall, left to right, as Jay described.
2. The red box in the photos is plain. I added bag openings, bags and books so it reads as a cubby (easy to remove).
3. The gap in the photos is at the left end of the box. Jay asked for a gap at both ends, so the right one is added.
4. The photo mat has red/blue striped strips and a raised platform at the left. I kept plain blue around the red square, as Jay said.
5. The photo red square is wider than deep with a lighter inner rectangle. Mine is a plain 8.2 x 6.3 tile rectangle with seams.
6. The seats face the mat in the photos. The approved sample faced the camera/entry. I turned them to face the mat in this room (same seat model).
7. The double doors with windows and the "THIS IS A BLACK BELT SCHOOL" banner are on the EAST wall in the photos. I put the double doors on the north wall; the banner is skipped.
8. The photo targets show faces and chests. I used plain faceless torsos (kid-friendly, no faces).
9. In the photos the Class Creed, flag and belt boards run above the drywall line. I kept everything below it.
10. The ropes and rings hang from the ceiling. I put the ropes on a short rail at drywall height.
11. The wall wording has typos ("falled", "Christ dies"). I corrected them to "fallen" and "Christ died"; "it's sound" is kept as written. I left out the signature.
12. The pro-shop case in the photos holds weapons. I show gloves, headgear, shoes and belts only.

**DECIDE:**
1. **Branded red exception.** Red square, red box, red seats, the logo, door crosses, creed titles and flag stripes are Jay's branding. Confirm it, in the game or only in the samples.
2. **Seat direction.** Seats now face the mat (as in the photos); the approved sample faced the entry. Keep?
3. **Unfolded side-wall features** (yellow men, mural, back doors on the north wall). OK, or should the game use a side-wall view?
4. **Right gap size and shorter box.** I gave the right gap the same 2.6 width as the left, which shortened the box to 7.2 tiles and 5 openings. Wider or narrower gap, or a longer box? Also the **red box openings I added**, and the pro-shop look. Keep or make it plain like the photo?
5. **Typos corrected** in the creed wording. Keep the corrections, or copy the wall exactly?
6. **Creed text size.** At the game size the creed boards are not readable; the full-size pictures are in `source/textures/`. Show them larger or in a popup?
7. **Logo use.** Jay's logo is his own file. Is it cleared for this public repo?
8. **One wide room**, 28 x 21 tiles at 80 ppt (2272 x 1696). Scroll it, or split it?
9. **Outside face** still has my plain kick-figure badge (approved as is). Swap to Jay's logo later?
10. **Phone and house number: scrub the history?** The real values are out of the branch tip (blank placeholders, read from a local git-ignored `source/local_overlay_values.json`) but still sit in the history of commit `af9fd2a`, and the repo is public. Scrubbing needs a history rewrite and force-push; none has been done. **Resolved: the Manager decided a scrub is not needed.**
11. **Sign wording** on the outside ("CMA / MARTIAL ARTS") and the **outside to town-square slot** question from the first note still stand.

**NEXT:** Once Jay answers, build the real game-scale tiles and props from this layout: mats and logo, wall art as swappable decals, the pro shop and cubby as interactable props.

Reference photos stayed outside the repo (`/workspace/dojo-photos/`); no photo or crop is committed. Only `incoming-art/` is touched.
