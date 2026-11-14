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

**UPDATE (Jay via Manager, 2026-10-25): Ready, Beginner's Stance and Flowing**
- `icon-stance-ready-64` (+@2x) is new. It is a pixel-identical copy of the old Beginner's Stance art, which shows the open leg stance (Jay: that is Ready). It is built from the same code (`ready_stance()`), and a diff against the old PNGs is empty.
- `icon-beginners-stance-64` (+@2x) is a new drawing: plain relaxed standing, front view, feet together and natural, arms relaxed at the sides with open hands.
  - Second pass: the legs were narrowed so a gap shows between them, and the arms sit clear of the body with a halo.
  - At 64 px it reads clearly differently from Ready (hands down at the sides vs. fists in front, narrow feet vs. wide feet).
- **Flowing Form is RETIRED.** Fighting (#300) replaces it. Its file is kept, and the preview labels it "(retired)".
- The preview is updated with all 9 icons. Red check: 0 px.
- No files deleted or renamed.

**DECIDE (new):**
1. Final file names: `icon-stance-ready-64` follows the #300 `icon-stance-*` pattern, while #277 uses `icon-<id>-64`. Should `beginners-stance` become `icon-stance-beginner-64`, and should `flowing-form` be deleted? Renames wait on Jay.
2. Beginner's Stance: should the feet be fully together (heels touching, like attention), or the natural slight gap as drawn? Open hands as drawn, or loose fists?

**NEXT:** after the OK, I'll add all 8 to the menu2 icons64 set. Later Forms and Strikes are still waiting for names.

---
## NOTE: label renames (Jay, Oct 25)
- "Ready" is now **Open Leg Stance**. The file is still `icon-stance-ready-*`.
- "Perfect Discipline" is now **Strong Discipline**.
Labels are game text, so they are recorded here only. No files were renamed yet. DECIDE: whether to rename the files to match (for example `icon-stance-open-leg`).
