# Delivery Note: Action Zone dojo, 3 samples (inside main floor rebuilt)

**ITEM:** The real Action Zone dojo for the town square (Jay, via the Manager). Three samples: outside face and parent seating (APPROVED, unchanged since PR review) and the inside main floor (REARRANGED to Jay's markup of the PR diagram).

**WHAT:** `samples/inside-main-floor@2x.png` (3504 x 1696, one wide room, margins hold the folded-out side walls) plus 1x, and `samples/inside-main-floor-layout-diagram.png` (labelled top-down plan, same numbers). Layout, entry at the bottom: on the LEFT side wall (folded out into the left margin) the YELLOW target wall, the logo + styles mural, and the TWO CROSS DOORS with the plain-handprint wall between them; on the RIGHT side wall the PRO SHOP (counter in the right lobby); straight ahead the parent seating; beyond it the red gear-bag box with a GAP at EACH end onto the mat; punching bags on the right of the mat; blue mats around a red square with the school logo (floor and bags unchanged).

**WHY:** The first main floor did not match the real room. This one is built from one list of numbers (`source/layout_main_floor.py`) that the 3D scene and the diagram both read, so the diagram is the check on placement.

**Second pass, point by point against Jay's markup message (Jay reviewed this folded-out version, commit 2ca1dd6, and prefers it over a later attempt that made the side walls read as separate rooms; no back-wall fill was added):**
- Two cross doors with the handprint wall between them are on the LEFT side wall. YES (left margin, lobby end of the wall).
- Yellow star/target wall AND the wall artwork (logo + styles mural) are on the LEFT side wall too. YES (left margin, mat end of the wall, in that order from the north).
- Pro shop on the opposite (RIGHT) wall. YES (right margin; its counter is in the right lobby).
- Second gap into the mat at the RIGHT end of the red box, matching the left gap. YES (box now x 9.6-17.4, gaps 7.0-9.6 and 17.4-20.0, both 2.6 wide, both with a threshold; the box has 6 openings so it stays centred under the seats).
- Side walls unfolded so the art reads from above. YES (flat panels in the margins, drawn from the same numbers as the diagram).
- Punching bags and floor kept. YES (bags unchanged on the right of the mat; blue mats, red square and logo unchanged).
- Outside face and parent seating not touched. YES (PNG files byte-identical to the approved ones). No phone or address in the tree. Nothing above the drywall.

**Red check** (branded red, expected): inside @2x 358,066 px, 1x 89,752; layout diagram 199,807 (the tallies read the red square, red box, seats, door crosses, logo, creed titles, red bag and handprints). Outside @2x 13,648 and seating @2x 76,158 are unchanged.

**Photo conflicts (photos versus Jay's description, and what I did):**
1. The yellow men, the styles mural, the cross doors and the handprints are on a SIDE wall (Jay's markup: the LEFT wall). A north-facing camera cannot see side walls, so each side wall is folded out flat into a margin beside the room.
2. The red box in the photos is plain. I added bag openings, bags and books so it reads as a cubby (easy to remove).
3. The photo shows one gap at the left end of the box. Jay's markup adds a matching second gap at the right end; both are built.
4. The photo mat has red/blue striped strips and a raised platform at the left. I kept plain blue around the red square, as Jay said.
5. The photo red square is wider than deep with a lighter inner rectangle. Mine is a plain 8.2 x 6.3 tile rectangle with seams.
6. The seats face the mat in the photos. The approved sample faced the camera/entry. I turned them to face the mat in this room (same seat model).
7. The double doors with windows and the "THIS IS A BLACK BELT SCHOOL" banner are on the EAST wall in the photos. I kept the double doors on the north wall; the banner is skipped.
8. The photo targets show faces and chests. I used plain faceless torsos (kid-friendly, no faces).
9. In the photos the Class Creed, flag and belt boards run above the drywall line. I kept everything below it.
10. The ropes and rings hang from the ceiling. I put the ropes on a short rail at drywall height.
11. The wall wording has typos ("falled", "Christ dies"). I corrected them to "fallen" and "Christ died"; "it's sound" is kept as written. I left out the signature.
12. The pro-shop case in the photos holds weapons. I show gloves, headgear, shoes and belts only.

**DECIDE:**
1. **Branded red exception.** Red square, red box, red seats, the logo, door crosses, creed titles and flag stripes are Jay's branding. Confirm it, in the game or only in the samples.
2. **Seat direction.** Seats now face the mat (as in the photos); the approved sample faced the entry. Keep?
3. **Folded-out side walls** (left: target wall, mural, cross doors + handprints; right: pro shop; plus the back doors on the north wall). OK, or should the game use a side-wall view?
4. **Red box openings I added**, and the pro-shop look. Keep or make it plain like the photo?
5. **Typos corrected** in the creed wording. Keep the corrections, or copy the wall exactly?
6. **Creed text size.** At the game size the creed boards are not readable; the full-size pictures are in `source/textures/`. Show them larger or in a popup?
7. **Logo use.** Jay's logo is his own file. Is it cleared for this public repo?
8. **One wide room** with margins, 43.8 x 21.2 tiles at 80 ppt (3504 x 1696). Scroll it, or split it?
9. **Outside face** still has my plain kick-figure badge (approved as is). Swap to Jay's logo later?
10. **Phone and house number: scrub the history?** The real values are out of the branch tip (blank placeholders, read from a local git-ignored `source/local_overlay_values.json`) but still sit in the history of commit `af9fd2a`, and the repo is public. Scrubbing needs a history rewrite and force-push; none has been done. Jay decides.
11. **Sign wording** on the outside ("CMA / MARTIAL ARTS") and the **outside to town-square slot** question from the first note still stand.

**CONFIRMED:** Jay compared this version (2ca1dd6) with a later one (396e4ad: left-wall reorder, pro shop moved opposite the doors, back-wall photo row/mirror/banner) and prefers this one. That later commit stays in the history, and this commit restores the 2ca1dd6 inside files. The back-wall fill idea is dropped: the left half of the north wall stays plain.

**NEXT:** Once Jay answers, build the real game-scale tiles and props from this layout: mats and logo, wall art as swappable decals, the pro shop and cubby as interactable props.

Reference photos stayed outside the repo (`/workspace/dojo-photos/`); no photo or crop is committed. Only `incoming-art/` is touched.
