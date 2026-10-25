# Delivery Note — S3-A1 kata direction picture + move icons

**ITEM:** S3-A1 (drafts/planning/S3-forms-kata-plan.md): "Direction picture + move icons". Done-when: icons for every move in `moves.json` for the first 4 katas, readable at phone size.

**WHAT:** 21 move icons (all 20 ids in `drafts/content/katas/moves.json` + kiai), 128 px, round medallions with a warm wood rim (own family next to the blue Seals); 5 direction pictures (school-map base + facing Front/Back/Left/Right), 192 px. Previews, greyscale, phone mock, README for the Programmer. Source: `source/build_kata_icons.py` (reuses icons/build_icons.py helpers, same camera/toon/outline).

**WHY:** The kata card and practice view need a direction picture and one icon per move. The spec doesn't ask for poses, so these are symbol icons (hands, feet, arrows) — no character renders, no eyes needed. No text baked in, so names/letters stay in game text.

**Checks (2nd pass):** symbols made 22% bigger after pass 1 for phone size; red check: 0 red areas (only 1–3 anti-aliased edge pixels on skin outlines); no red used — impacts are orange, arrows blue; nothing above heads (no characters).

**v2 (Manager review, Oct 25):** hand icons simplified for 40 px: impact/speed lines removed (each block/punch keeps ONE blue motion arrow), fists bolder (thicker outline, 2 bold finger lines instead of 3, bigger in the frame), sleeves kept inside the rim. New `preview/check-40px.png` (+ 3x zoom). Second pass: re-checked at 40 px and 2x; red check still clean (only anti-aliased skin-edge pixels).

**v3 (Jay's feedback, Oct 25):** Jay likes the icons and says the moves look right.
- Labels: every icon gets a short name, drawn by the game as text under the icon (not baked in). Label table (icon id -> moves.json id -> name) in the README and `sprites/labels.json`. Names are from `moves.json`; ALL are placeholders pending the Content Designer. Flagged: "Double knife-hand block" (long, 23 characters; wraps to 2 lines) and "Kiai!" (kiai is not in moves.json). New `preview/sheet-labeled.png`; optional icon+label PNGs in `sprites/labeled/` (cheap, made by the same script).
- Choke break redrawn: two open hands, back to back with the fingers up, pushing OUT through a soft orange ring (the grip) that is broken at the sides, with a big blue arrow out through each break. No neck and no grabbing shown. New `preview/choke-break-closeup.png` (512, 128 and 40 px + 4x zoom of the 40 px).
- Second pass (v3): checked the choke break at 512, 128 and 40 px (it still reads as "hands breaking out" at 40 px) and the labeled sheet; no other icon changed. Red check: 0 red areas (1 anti-aliased skin-edge pixel on the high block, unchanged).

**DECIDED (by the Manager):**
1. Kiai: id `kiai`, starburst, no text.
4. Big special turn: no set angle (loop + gold star stays).
6. Kata rim colour: wood #b07a3a stays.
7. Hand icons: simplified (see v2 above).
5. DECIDED (Jay): Front stays at the top of the direction pictures (Left = left side, student in the middle facing Front). Marker letters/words are game text.

**DECIDE (Jay):**
2. Technique reads — please check each matches the school: cat stance (back foot flat & turned out, front foot on toes), front stance (back foot ~30° out), attention (heels together, toes in V), low block (sweeping down/out), inside block, high block, double knife-hand, front kick vs straight kick (rising arc vs straight line) and reverse punch/kick (curved hip arrow = back hand/leg).
3. Choke break redrawn (v3): two open hands pushing out through a broken ring, outward arrows. Does it read now?
8. Label names: all placeholders from moves.json, pending the Content Designer (shorter name for "Double knife-hand block"? add kiai to moves.json as "Kiai!"?).

**NEXT:** Manager review, then Jay's OK; after that the Programmer wires them (README). Any DECIDE changes = rebuild with the commands in the README.
