# Delivery Note: Action Zone dojo, 3 samples (inside = Jay's preferred picture + gap at both box ends)

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
10. **Phone and house number: scrub the history?** The real values are out of the branch tip (blank placeholders, read from a local git-ignored `source/local_overlay_values.json`) but still sit in the history of commit `af9fd2a`, and the repo is public. Scrubbing needs a history rewrite and force-push; none has been done. Jay decides.
11. **Sign wording** on the outside ("CMA / MARTIAL ARTS") and the **outside to town-square slot** question from the first note still stand.

**NEXT:** Once Jay answers, build the real game-scale tiles and props from this layout: mats and logo, wall art as swappable decals, the pro shop and cubby as interactable props.

Reference photos stayed outside the repo (`/workspace/dojo-photos/`); no photo or crop is committed. Only `incoming-art/` is touched.
