# icons2: Delivery Note (all 8 icons)

**ITEM:** follow-up icons for Forms, Strikes and Virtues: all 8 named items (3 Forms, 2 Strikes, 3 Virtues).

**WHAT:**
- `sprites/icon-<id>-64` for beginners-stance, rooted-form, flowing-form, follow-up-kick, quick-combo, shield-of-respect, second-wind and perfect-discipline, each at 64 px with an @2x, plus `sprites/icons2.json`.
- After Jay's answers, Strikes are recoloured violet and the 5 remaining icons are added in the same style. Their techniques are in the README. In the second pass the Flowing motion marks became wavy lines (they read as ticks before), Quick Combo's arc and chevrons got stronger, and the Perfect Discipline floor ripples became a floor line with side sparkles.
- `preview/icons2-preview-667x375` (+@2x): all 8 at 64 pt (real size) with a 32 pt strip, on a phone-size menu2 panel.
- Everything is built by script in `source/`.
- **Manager first pass:** Rooted Form read as a walking step, so it's redrawn as a symmetric horse-style stance (front view, both knees bent equally, back straight, guard up). In its second pass the thighs are flatter so the bend reads, and the fists sit beside the head, not on it.
- The earlier pass 2 made these changes:
  - the guard arms are separated from the torso with a thin halo
  - the root marks are stronger
  - the kick figure is centred and its foot is reshaped to show the ball of the foot
  - the bow figure is bigger and joined at the hips
  - the shield is kept inside the face
  - ink is clipped to the face
- The red check finds 0 px.

**WHY:** the names come from the repo, not invented: `content/abilities/abilities.json` and `docs/decisions.md` ("Forms (from kata)", "Strike upgrades", "Virtues").
- **Forms:** Beginner's Stance, Rooted Form and Flowing Form.
- **Strikes:** Follow-up Kick and Quick Combo.
- **Virtues:** Shield of Respect, Second Wind and Perfect Discipline.

I picked the first earned item of each group. The original icons brief says "Forms = the character in the stance, Virtues = gold", so the Forms icon shows the stance (Rooted, after the Manager's first pass: a wide, even, symmetric horse-style stance, front view) and the Virtues medallion is gold.

**DECIDED (Jay, 2026-10-25):**
1. **Strikes ring colour:** Strikes get their own colour, violet, which reads best at 64 px. It's clearly distinct from the Seal blue, Forms green and Virtue gold. No amber and no red.
2. **Shield of Respect:** the standing bow is fine.
3. **Follow-up Kick:** Kick Combo 1 is front kick, front kick, inside kick, outside kick, spin kick (this matches `docs/curriculum.md`). The icon keeps the front kick.

**DECIDED (Manager):**
- **Build method:** flat 2D (PIL), matching the seal medallions, is OK.
- **Unnamed Forms and Strikes:** wait for names before making icons for the later kata Forms and the Strikes past Kick Combo 2.

**NEXT:** after the OK, I'll add all 8 to the menu2 icons64 set. Later Forms and Strikes are still waiting for names.
