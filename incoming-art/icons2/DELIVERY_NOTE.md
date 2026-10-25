# icons2: Delivery Note (3 samples)

**ITEM:** follow-up icons for Forms, Strikes and Virtues. These are samples only: 1 icon from each group.

**WHAT:**
- `sprites/icon-rooted-form-64`, `icon-follow-up-kick-64` and `icon-shield-of-respect-64`, each at 64 px with an @2x, plus `sprites/icons2.json`.
- `preview/icons2-preview-667x375`, showing the icons at 64 pt (real size), 96 pt and 32 pt on a phone-size menu2 panel.
- Everything is built by script in `source/`.
- Pass 2 made these changes:
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

I picked the first earned item of each group. The original icons brief says "Forms = the character in the stance, Virtues = gold", so the Forms icon shows the stance (Rooted = A2 option A, the wide fighting stance) and the Virtues medallion is gold.

**DECIDE:**
1. **Family ring colours:** Forms jade green, Strikes seal blue (the same as Technique Seals), Virtues gold. Should Strikes get their own colour so they don't read as Seals? One option is warm amber.
2. **Shield of Respect symbol:** a standing bow (rei) on the shield. The other option is the fist-in-palm salute, which is harder to read at 64.
3. **Follow-up Kick:** it's shown as a front kick, with a ghost first kick plus an arrow. Which kicks are in the school's actual Kick Combo 1? That isn't in the repo, so the kick type is a placeholder.
4. **Build method:** these are flat 2D (PIL), matching the seal medallions' look, rather than the Blender toon kit. OK, or should I rebuild them in Blender to match exactly?
5. **Names not defined yet:** Forms for later kata (Keon, David and Goliath, Penon 1–3, Nihanchi, Possi) and Strikes past Kick Combo 2 have no names yet, so no icons can be made for them. They need names first.

**NEXT:** after the OK, I'll do the remaining 5 defined icons: Beginner's Stance, Flowing Form, Quick Combo, Second Wind and Perfect Discipline. Then I'll add all 8 to the menu2 icons64 set.
