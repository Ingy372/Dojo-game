# Sources — Ember Knight shifted form

The artist brief is PR #449 (`bot-planner-ember-knight-shift`), file `drafts/content/enemies/guardian-form-shifts.md`. That PR was open and not merged when these pictures were drawn. This branch does not copy those doc edits. The rules below are the ones the pictures follow.

## Shape

- Model: `incoming-art/guardian-concepts/source/build_guardian_concepts.py`, the `ember-knight` block.
- Height 1.4. Body width 0.85. Helm, round shoulders, round shield, blunt bar, two oval eyes.
- Camera: orthographic, 35° down, 2.6 tiles across, 512 px. Same numbers as that script.
- Toon kit: `incoming-art/tools/toon_kit.py` (cel shading, outline `#14121c`).
- Phase-3 stills used on the review sheet: `incoming-art/guardian-concepts/renders/ember-knight_p3_S.png` and `ember-knight_p3_SE.png`.
- The rebuilt phase-3 file is `source/ember-knight-phase3.blend`. A check against the concept still was a close match (average pixel difference about 2, at a lower sample count).

## Colours on the new form

From the brief, which points at the Ember Knight concept and `incoming-art/tier3-ember-kitchens/source/build_kitchen_t3.py`:

| Use | Hex | Where the brief got it |
| --- | --- | --- |
| Cooled plates | `#c9824a` | kitchen `COPPER` |
| Honey seams | `#f2c46a` | kitchen `HONEY` |
| Shield face / straps on C | `#ffd08a` | kitchen `EMBER_HI` |
| Shield rim | `#ffa560` | knight concept glow |
| Shield center | `#fff1b8` | knight concept warm boss |
| Eyes | `#ffe2c0` | knight concept eyes |
| Eye shine | `#ffffff` | concept white shine |
| Soft halo on the shield only | `#ffecaa` | the 1 second glow halo in `make_form_shifts.py` |

The hearth-door straps on idea C use the shield-face hex `#ffd08a`, so the glow stays on the shield and still shows on a phone. Body seams stay honey.

## Colours that stay on the old form

Not used on A, B, or C:

- Knight orange `#e8772e`
- Kitchen hot ember `#f08a3c`
- Draft red `#d9532b` (left unused on the concept because it reads as danger)
- Visor black `#120e2a`

Phase-3 body mixes, written in the brief and not used as a new palette: `#ed9841`, `#80564a`, `#a26d58`, wisps `#4a4478`.

## Floor in the review pictures

Not a stand-in colour. These are the tiles the game draws.

| File | Game id |
| --- | --- |
| `incoming-art/tier3-ember-kitchens/sprites/floor-big_floor-big.png` | `floor-big` |
| `incoming-art/tier3-ember-kitchens/sprites/floor-quad_floor-quad.png` | `floor-quad` |
| `incoming-art/tier3-ember-kitchens/sprites/floor-worn_floor-worn.png` | `floor-worn` |

- Packed as `tower-t3` in `tools/art-import/approved.json` (Ember Kitchens, approved).
- `apps/client/src/art/tiers.ts`: a belt with no tower pack of its own uses the newest kit. That is `tower-t3`. The Ember Knight is the red guardian, and red has no tower pack yet.
- `apps/client/src/scenes/GameScene.ts`: `TILE = 48`. The mix is `pick = ((col * 73856093) ^ (row * 19349663)) % 100`, worn under 8, quad under 30, otherwise big. The review sheets use that rule.
- Each concept still is 512 px across 2.6 tiles, so at 48 px per tile it is drawn at 125 px.

## Effect layers (this review)

The Manager's new direction replaces, for this draft only, the copper-only plates and the ban on particles and floor glow. Jay has not approved the new hexes. Details are in `DELIVERY_NOTE.md`.

Armour `#4a5a72`. Copper accents `#c9824a`. Seams `#ffc14d`. Core `#fff1b8` / `#ffd08a`. Rim `#ffe08a`. Ground pool `#ffb25a`. Steam `#fff6e0`. Embers `#ffe7a8`. Shift glow `#fff4cf`. None of these is danger red `#ff3b30`.

| File | What it is |
| --- | --- |
| `layers/fx-core.png` | Centre glow, `#fff1b8` and `#ffd08a` |
| `layers/fx-rim.png` | Brighter rim, `#ffe08a` and `#ffc14d`, in the shield's plane |
| `layers/fx-ground.png` | Ground pool, `#ffb25a` and `#ffd08a`, under the shield |
| `layers/fx-steam-00.png` … `fx-steam-03.png` | One steam puff, `#fff6e0` and `#ffe08a` |
| `layers/fx-burst-00.png` … `fx-burst-03.png` | One ring that grows once, `#ffc14d` |
| `layers/fx-ember-00.png` … `fx-ember-04.png` | Three embers, `#ffe7a8`, fixed paths |
| `source/ember-knight-shift-b-fx.blend` | The same pieces in one Blender file |
| `source/build_b_fx.py` | Rebuilds the layers. Same camera as the knight. |
| `source/make_b_vfx_review.py` | Builds the strip, the 125 px floor picture, and the close-up. The idle pulse and the Reduced Motion still are done here from those layers. |

The white-gold of the 1 second shift is `#fff4cf` with halo `#ffecaa`, the same colours as the other four shifts. This draft does not use the 0.15 second flash from that older sample.

## Shading on draft B

Armour is `#4a5a72` with a deep shadow (about 0.22 of the colour) and a cool highlight (about 1.55). Copper accents stay `#c9824a`. This replaces the earlier all-copper shading. Body outline width is still 0.042. The house outline is 0.013. The concept script uses 0.026.

## Timing (unchanged)

From the top of the brief and `guardian-form-shifts.json`:

- Glow about 1 second, white-gold `#fff4cf`, soft halo `#ffecaa`.
- Then the new form.
- During the glow the knight cannot be hit and does not attack.
- After the glow, the forge-phase attacks stay (ember slash, shield rush). Those warnings stay the game's red circle and striped lane. They are not drawn on the body.

## Story lines that set the mood (not new words)

- `drafts/content/lore/06-red.md` — shields are for helping; the Cool Ember glows and does not burn.
- `drafts/content/rooms/forge-of-courage-brief.md` — "Open your shield. Welcome a friend."
- Sensei line in the brief, still to approve: "Look. The armor cooled."
