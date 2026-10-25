# Delivery Note — S3-A1 kata direction picture + move icons

**ITEM:** S3-A1 (drafts/planning/S3-forms-kata-plan.md): "Direction picture + move icons". Done-when: icons for every move in `moves.json` for the first 4 katas, readable at phone size.

**WHAT:** 21 move icons (all 20 ids in `drafts/content/katas/moves.json` + kiai), 128 px, round medallions with a warm wood rim (own family next to the blue Seals); 5 direction pictures (school-map base + facing Front/Back/Left/Right), 192 px. Previews, greyscale, phone mock, README for the Programmer. Source: `source/build_kata_icons.py` (reuses icons/build_icons.py helpers, same camera/toon/outline).

**WHY:** The kata card and practice view need a direction picture and one icon per move. The spec doesn't ask for poses, so these are symbol icons (hands, feet, arrows) — no character renders, no eyes needed. No text baked in, so names/letters stay in game text.

**Checks (2nd pass):** symbols made 22% bigger after pass 1 for phone size; red check: 0 red areas (only 1–3 anti-aliased edge pixels on skin outlines); no red used — impacts are orange, arrows blue; nothing above heads (no characters).

**DECIDE (Jay):**
1. Kiai: not in moves.json — add id `kiai`? Icon is a shout burst with no letters ("KIAI!" text?).
2. Technique reads — please check each matches the school: cat stance (back foot flat & turned out, front foot on toes), front stance (back foot ~30° out), attention (heels together, toes in V), low block (sweeping down/out), inside block, high block, double knife-hand, front kick vs straight kick (rising arc vs straight line) and reverse punch/kick (curved hip arrow = back hand/leg).
3. "Choke break" drawn as two forearms pushing up and out (no neck shown, kid-safe). OK?
4. Turn icons: 90° arrow (turn), 180° (half turn), almost-full loop + gold star (big special turn), foot + small arc (pivot). Should the big special turn show a fixed angle?
5. Direction picture: no school-map.png on main — I assumed Front top, Left = left side of the picture, student in the middle facing Front. Letters/words on the markers (F/B/L/R vs Front/Back/...) are game text.
6. Kata rim colour #b07a3a (wood) for the family — or another colour?
7. Hand icons (blocks/punches) are the busiest at 40 px — OK, or simplify further?

**NEXT:** Manager review, then Jay's OK; after that the Programmer wires them (README). Any DECIDE changes = rebuild with the commands in the README.
