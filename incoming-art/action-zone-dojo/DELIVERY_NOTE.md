# Delivery Note: Action Zone dojo, 3 samples

**ITEM:** The real Action Zone dojo for the town square (Jay, via the Manager). Three samples only: outside face, inside main floor, parent seating.

**WHAT:** `samples/outside-face`, `samples/inside-main-floor`, `samples/parent-seating` (each @2x and 1x), plus two swappable overlay layers (`overlays/outside-phone-layer`, `overlays/outside-address-layer`), the three `.blend` files and the render script in `source/`. Blender toon_kit style, same camera and scale as PR #301. Nothing is drawn above the drywall. All the wall art and decor from the photos are in (belt-creed boards, Class Creed sign, flag, paintings, martial-styles mural, target wall, trophies, photo frames), stylised with no real faces. Handprints are plain, with no names and no names layer.

**WHY:** Jay wants the main dojo modelled on the real building. The samples let him check the likeness and the style before we build the real tiles and props.
- Second pass: the first roof sat over the sign (wrong slab tilt), the first benches were inside the wall, the seat tiers hid each other, and the sign letters had a stray outline copy. All fixed. Added mural silhouettes, floor tile seams, downspouts, a bin, and the seating props.
- Red check: the branded red is expected. Counts of red-ish pixels at @2x: outside 13,648, inside 35,154 (1x) / 141,754 (@2x), seating 76,158 (@2x). Sources: the sign letters, red chairs, banner stripe, red mat half, seat backs and cushions, flag stripes. Both overlay layers: 0 px. Nothing else red.

**DECIDE:**
1. **Branded red exception.** The red on the sign, chairs, red mat half, red seats, banner stripe and flag stripes is Jay's real branding. That is an exception to the no-red-outside-danger rule. Confirm it, and say whether it applies in the game or only in these samples. Should red-mat and red-seat tints stay saturated, or be softened toward coral?
2. **Sign wording.** Keep "CMA MARTIAL ARTS"? Ours reads only "CMA / MARTIAL ARTS" (no "Action Zone").
3. **Creed text.** Blank lines (as drawn) or real words via the Content Designer? Real words would need a legible size, so the boards and the Class Creed sign would be shown larger or in a UI popup.
4. **Pro shop items.** Drawn as plain shapes: gloves, kick pads, folded uniforms, headgear, a belt case, no blades. Do you want real brands, a "shop" panel in the UI instead, or this look?
5. **How the outside connects to the town-square slot.** The outside face is 14 x 8.9 tiles at 80 ppt, much bigger than the 3-door row in the square. Options: replace the left dojo slot with this face scaled down; keep it as the Action Zone entrance screen after tapping the dojo; or use only the facade and doors as the slot.
6. **Phone number and house number overlays.** They are real. The repo is public. Keep the overlay PNGs, or drop them before merge? To drop them, delete the two overlay PNGs and the two `LAYER[0] = ...` lines in the script (git history will still hold them unless the commit is rewritten).
7. **Logo.** The sign badge and the mat centre use a plain white kick figure I drew. Jay's own logo is in `badges-trophies-a3c/source/jay-logo/`. Should the badge and mat use that instead (its red cross would be a second branded red)?
8. **Flag.** A US flag with red stripes. Keep it, or switch to a school flag in blue/gold?
9. **Mural.** Four plain silhouettes (kick, punch, block, bow). Does the real mural show specific styles (karate, taekwondo...) that should be named by the Content Designer?
10. **Cutaway and size.** The inside is a front-cut diorama, 22 tiles wide at 80 ppt (1840 px). Should it scroll sideways, or should the pro shop, mats and wall split into separate screens?

**NEXT:** Once Jay answers, build the real game-scale tiles and props: the outside face slot, the mats and logo, the wall art pieces as swappable decals, and the pro shop as an interactable prop.

Reference photos stayed outside the repo (`/workspace/dojo-photos/`). Only `incoming-art/` is touched.
