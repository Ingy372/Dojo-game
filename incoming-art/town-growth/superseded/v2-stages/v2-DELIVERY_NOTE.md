# Delivery Note: Town Growth v2, sample stages White / Orange / Blue (A-TOWN-GROWTH)

**ITEM:** A-TOWN-GROWTH, redo of PR #396 after Jay's verdict "too messy and cluttered". Samples only: White, Orange and Blue, each in day and dusk, as full town backgrounds. The first overlay set is moved to `superseded/` (nothing deleted).

**WHAT:**
- New arc: White a little run down (faded, boarded window, patched awning and bridge plank, weedy beds, murky water, empty plinth), Yellow cleaner (planned), Orange = the approved town (empty plinth, plus a chimney and a bread basket), Green the statue arrives (planned), Blue statue plus the first light effects (thin smoke, extra koi and lilies, faint sun shafts, motes, a few dusk fireflies), Red to Black gentle upgrades (planned).
- New structure: **one full background per belt and time of day, swapped whole by belt, no stacking** (explained in `README.md`). Add-ons cannot go below the base, so they no longer fit.
- Dusk light is turned way down: window and lantern glow about 1/4 of the approved dusk, ground pools about 1/3, fainter Tower light, no firefly swarm, the dojo sprite's door pools softened.
- Far fewer props: White has a few small worn details, Orange adds only 2 things (chimney, basket), and Blue adds a few soft touches. The first set had 36 overlay pictures.
- Files: `stages/` (6 pictures at @2x and 1x, plus `stages.json`), `previews/samples-sheet.png` (3 stages, day on top, dusk below), `source/`, `superseded/`.

**WHY:** Jay wants a calmer, homelier town that earns its charm instead of piling on props, and wants the early town to look a bit tired so each belt feels like an improvement. A full background per belt is the simplest thing for the Programmer to use and is the only structure that can look worse than the base.

**Checks (second pass):**
- Red check (1x, hue/saturation/value rule): White 731 day / 349 dusk, Orange 837 / 583, Blue 837 / 583. Approved base is 1905 / 1389. All red pixels sit inside the CMA sign box (x 76-194, y 147-180) and nowhere else. Only the branded sign is red.
- Lanes: the added-objects masks have 0 pixels in the walkable lane strip (outside the river and the flower beds) for all three stages. White's weeds and cracks are only on the beds and around the plinth; the boards and awning patch sit above the lane strip. Blue's koi and lilies are in the river.
- Heads: no prop or effect is drawn over the lane space where characters stand. Backgrounds sit behind characters, and the Blue shafts and motes stay above the lane strip (y under 444 at @2x).
- Glow sources: every dusk glow is a lit window, a lantern or lamp post, the shop interior or the Tower light. The White tall lantern posts are off. Blue fireflies are small and sit by the river and hedges.
- Statue: the approved statue is unchanged in Blue and absent (empty plinth, no star) in White and Orange. The approved day picture is reproduced pixel for pixel by the pipeline with no changes.
- Phone and house-number strings from the dojo sign are not in `town-growth` (0 hits, checked without printing them).
- Only `incoming-art/` changed. No game code, no `main`, no .blend files, no history rewrite.

**Mismatches against `drafts/content/town/town-changes.md` (branch `bot-content-story-f`, PR #344):**
1. **Statue.** Spec: the statue "is not touched" and is part of the starting town. New arc: the statue is absent until Green.
2. **White start.** Spec: "No shame ... a White-belt town looks complete" and the town starts as the approved A4 base. New arc: White is run down, below the base.
3. **No empty plots, locks or signs.** Spec forbids them. The empty plinth, the boarded window, the patches and the weedy beds break that rule. The look is friendly, but the rule is broken on purpose.
4. **Structure.** Spec: "nine add-on overlay layers on top of the A4 base". New: full per-belt backgrounds, no overlays. This also changes the Programmer's lookup: spec says belt to a list of changeIds that stack, new is belt to one picture. "Changes add up" no longer holds literally.
5. **White change.** Spec: lamp posts and a bridge lamp light up (wc-lantern-halls-lamps). New: no lamp reveal. The lamp posts are lit at dusk from White on as a gentle tie; the tall lantern posts are off.
6. **Yellow.** Spec: beds bloom and a vine on the dojo porch (wc-sunrise-garden-blooms). New: "cleaner and more normal"; no vine, and the blooming beds are not a reward any more (the beds are tidy in Yellow and the approved flowers are in Orange).
7. **Orange.** Spec: bakery chimney, bread and a long table (wc-ember-kitchens-chimney). New: the approved base with only a chimney and one bread basket. The long table and benches are dropped. The spec's smoke moved to Blue.
8. **Green.** Spec: stone path to the pavilion and a stone bench on the hill path (wc-giants-steps-path). New: the statue arrives and the path and bench are dropped.
9. **Blue.** Spec: the river turns clear, more koi and a sitting dock (wc-quiet-river-clear). New: statue, light effects, two more koi and lilies. The dock is dropped; the river is clearer than White but the "turns clear" moment is not at Blue.
10. **Effects only from Blue.** Spec has effects at earlier belts (the lamp glow at White, the oven glow and smoke at Orange). New: none before Blue, apart from the White lamp posts.
11. **Red to Black.** Spec: Red gold-flame banners, a dummy and a brazier; Red/Black wind chime and bell; Brown reading tree and book box; Brown/Black glowing Tower, rainbow and a dojo-window lantern; Black out of scope. New arc: "gentle upgrades" only, with no content defined yet. Spec has 10 rows (9 changes plus Black), and the new arc names no changes for them.
12. **Reward messages.** The spec messages are tied to the old changes. White "The town lamps are glowing", Yellow "Flowers are blooming everywhere", Orange "The town has a table for everyone", Green "A new path is ready to explore" and Blue "The river is calm and clear" no longer match what changes. Green especially now means the statue arrives. The changeIds and story tie-ins (Lamp Keeper and so on) also point at the old changes.
13. **Open items in the spec.** "Brown tree sits beside the placeholder" and "the placeholder building's final use" are unaffected. The placeholder building now has a boarded window in White; its use is still open.
14. **Scope.** The spec art need is nine overlays. New: three of ten stages are built as samples.

**DECIDE (Jay):**
1. Is the White look (worn, boarded window, patched bits, weedy beds, empty plinth) the right level, or still too much or too little?
2. Is the Blue level of effect right: a thin smoke curl, faint shafts and motes by day, a few fireflies at dusk? And is the toned-down dusk gentle enough?
3. OK to update the content spec (PR #344) to the new arc, including the mismatches above (the statue, "No shame", reward messages)? This note does not change it.
4. Are full per-belt backgrounds OK as the structure? The cost is 20 pictures at 10 belts instead of small overlays.
5. After this: build the other seven (Yellow, Green, Red, Red/Black, Brown, Brown/Black, Black), and what do Red to Black add?

**NEXT:** After Jay's decision, build Yellow and Green (cleaner White, and the statue on the Orange base), then draft gentle Red to Black upgrades for approval. Keep the pictures in the same frame so the Programmer can swap them by belt with no code change. The old overlay set stays in `superseded/` until Jay says to delete it.
