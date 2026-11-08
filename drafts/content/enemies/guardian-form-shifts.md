# Guardian form shifts (C14) - Artist brief

Shift: glow ~1 second (white-gold, soft chime), then the new form. Happens at the 33% phase change. During the glow the Guardian is invulnerable (it cannot be hit) and it does not attack. Each new form shows the shadow letting go a little: hopeful, never scarier. Nothing human-like. Ages 6+.

Jay approved a fifth shift, the Ember Knight, on these same rules (J16). No new attacks. No new tuning numbers.

## Pebble Heart (from Stone Giant, green)

- Why: The worry stones start to fall off. Underneath, a smaller giant of round, mossy stones is trying to be brave.
- Look: Shorter, rounder pile of smooth gray-green stones with moss tufts and one warm glowing crack in the middle like a heart. Big friendly eyes, no mouth. Loose pebbles bounce around its feet.
- Sensei: "Less worry. Same giant."

## Bloom Gardener (from Sun Gardener, yellow)

- Why: Its roots find the sun. The thorns drop away, and yellow flowers open all over its vines.
- Look: Same vine shape, but thorns are gone and replaced by big yellow sun-flowers and leaves. Softer green, a sunny glow at the center. Plant shape, no human face; two flower eyes.
- Sensei: "Look. It is reaching for the sun."

## Quiet Thunderhead (from Storm Herald, brown-black)

- Why: The storm runs out of shouting. It shrinks into one round cloud, and a little calm blue sky peeks through.
- Look: A single round puffy storm cloud, smaller than before, with a patch of blue sky and one star showing in its middle. Small sparks crackle on the edges. Two soft eyes in the cloud, no arms or body.
- Sensei: "Listen. The calm is getting louder."

## Cloud Lantern (from Lost Lightbearer (wrapped in storm clouds), black)

- Why: The storm clouds pull in tight around the last light. It shines through the cracks, showing there is still hope inside.
- Look: A tall, swirling storm cloud shaped like a lantern, with warm gold light shining out through cracks. The traveler stays hidden inside; show no person, face or body. Only the glow and two small light-eyes.
- Sensei: "The light is still there. Go to them."

## Warm Shield (from Ember Knight, red)

Working name, for Jay to OK. Same rules as the four above.

- Why: The shadow told this knight to guard the forge from everyone, so the armor burned hot. At a third of its health the armor cools. The round shield that kept people out becomes a warm light, like the Cool Ember: it glows, and it does not burn. Same knight, kinder. A child should feel "it wants to help."
- Look: Keep the concept knight's silhouette. Rounded body, smooth helm with no face inside it, two round shoulder plates, a round shield on one hand, a short blunt bar with a ball end on the other, and two glowing oval eyes. Same height as the phase-3 concept. Nothing sits above the helm. No mouth, teeth, brows, hair, or skin. The shadow wisps at its feet are gone.
  - Armor: the dark plates cool into copper metal, with thin honey lines along the seams (warm edges, like a hearth, not cracks or wounds). Shoulder plates stay round. The blunt bar rests down at its side, ball end no higher than the shoulder, and stays quieter than the shield. It stays a blunt bar.
  - Prop and glow: the round shield is the prop and the steady glow. It lowers to chest height and turns its face toward the student, like a welcome, still in the hand. The center boss is the concept's warm dot, only bigger: a coal you could hold. No flying sparks, no flame shape, and no circle on the floor. Floor circles and striped lanes stay attack warnings, not part of the body.
- Palette: colors already in the Ember Knight concept and the Ember Kitchens art. The new form uses the cooled set.
  - Cooled plates (helm, body, shoulders, resting bar): copper `#c9824a`.
  - Seams: honey `#f2c46a`.
  - Shield face (the glow): ember highlight `#ffd08a`.
  - Shield rim: `#ffa560` (the knight's own rim).
  - Shield center: `#fff1b8` (the concept's warm boss).
  - Eyes: `#ffe2c0`, white shine `#ffffff`.
  - Hot colors that stay on the old form: knight orange `#e8772e`, kitchen hot ember `#f08a3c`, draft `#d9532b`, visor black `#120e2a`.
  - The glow before the pop covers the whole knight in the same white-gold as the other four shifts: `#fff4cf`, soft halo `#ffecaa`. The shield palette shows after the pop.
- Shift: At 33% health, the forge phase, together with the attacks that phase already has (ember slash and shield rush). Telegraph: white-gold glow for about 1 second, then the new form pops in. Sound: the same soft chime, hopeful, not a clang or a roar. During the glow the knight is invulnerable and does not attack. After the pop, the slash still warns with its red circle and the rush still warns with its striped lane.
- Sensei: "Look. The armor cooled."

### Where this comes from

- Shape and the hot colors: `incoming-art/guardian-concepts/sheets/ember-knight_concept.png`, stills `incoming-art/guardian-concepts/renders/ember-knight_p1_SE.png`, `ember-knight_p2_SE.png`, `ember-knight_p3_SE.png` (and the matching `_S` stills), and `incoming-art/guardian-concepts/source/build_guardian_concepts.py`. Accent `#e8772e`, glow `#ffa560`, eyes `#ffe2c0`, warm boss `#fff1b8`, visor `#120e2a`, shadow body `#241e52`, helm `#3a3278`, height 1.4. Phase 2 already lights the shield. The sheet labels are in `incoming-art/guardian-concepts/source/make_guardian_sheets.py`. Draft `#d9532b` was left unused on the concept because it reads as danger-red (DECIDE 1 in `incoming-art/guardian-concepts/DELIVERY_NOTE.md`).
- Phase-3 body, so this form is a real change and not a repaint of phase 3. The script leans `#e8772e` 40% toward `#f4c95d` (amber `#ed9841`), then mixes indigo `#241e52` 46% toward that amber (`#80564a`) and the helm `#3a3278` 58% toward it (`#a26d58`). Phase-3 wisps are `#4a4478`. Those four hexes are the script's mix, written out so the before-and-after is concrete. They are not a new palette.
- White-gold glow: `incoming-art/guardian-concepts/source/make_form_shifts.py` (`#fff4cf`, halo `#ffecaa`). The about-1-second glow, the soft chime, the 33% timing, and invulnerable-during-the-glow are the rules at the top of this file and in `guardian-form-shifts.json`. Jay confirmed them for this knight.
- Cooled colors: `incoming-art/tier3-ember-kitchens/source/build_kitchen_t3.py` (`COPPER` `#c9824a`, `HONEY` `#f2c46a`, `EMBER_HI` `#ffd08a`, `EMBER` `#f08a3c`). Ember Kitchens is the orange kitchen. These are the gentle warm swatches in that file.
- Story: `drafts/content/lore/06-red.md` (a knight of glowing metal; "Shields are for helping."; the Cool Ember "glows but does not burn you."), `drafts/content/bosses/ember-knight.json` (forge phase at 33%, ember slash and shield rush), `drafts/content/rooms/forge-of-courage-brief.md` (the sign "Open your shield. Welcome a friend."), `drafts/content/town/town-changes.json` ("courage burns warm, not angry."). This entry replaces the old "easy add" line and D-F2 in the concept delivery note ("armor cools to a warm glow", not drawn).

### Proposals for Jay

The hex values are from the files above. These choices are new:

- The name Warm Shield.
- The Sensei line "Look. The armor cooled."
- The shield is the steady glow, lowered and turned toward the student. The plates are cooled copper with honey seams, not a lamp from head to toe.
- The black visor bar goes away. A thin honey line frames the eyes so the helm still reads as armor.
- The bar rests down and stays blunt.
- Same size as the phase-3 concept knight.
- No floor glow under the shield, so it cannot be read as an attack warning.

## Not shifting

Lamp Keeper, Hearth Cook, River Watcher (early tiers, keep fights simple), Echo Mask, Root Keeper (already summon helpers or copy moves; a shift would be too busy).
