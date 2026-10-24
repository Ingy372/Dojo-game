# Delivery Note: A5 padded-weapon enemy (samples)

**ITEM:** A5. A weapon-carrying enemy for the S4 Technique Seals (PR #70).

**WHAT:** A small, bouncy shadow creature with floppy ear tufts and lime accents. It holds a padded foam training staff with big soft ends. There are 3 sample animations in 8 directions:
- idle: a bouncy sparring stance
- wind-up: the staff is raised over the shoulder and the telegraph glow builds. This is the "tell".
- attack: a soft overhead bonk

The staff is on its own layer, so the game can show "disarmed" by not drawing it. Previews, a lineup next to the Tier 1 enemies, a phone-size check and a greyscale check are in `preview/`.

**WHY:** About half of the S4 seals need an enemy with a weapon, for disarm, block-reflect and dodge. A foam staff keeps it friendly, with nothing sharp or realistic. It uses the same build tools, layers and telegraph system as Tier 1, so it fits that family. Lime is a colour no other enemy uses, and it isn't red, so it can't be confused with the danger tint.

**DECIDE:**
1. The enemy's name. It is a placeholder for now. This is for the Content Writer.
2. Speed, damage and timings. The numbers in the script are placeholders only.
3. Which seals face it. PR #70 suggests #13, #14, #18, #19, #21-24 and #28.
4. Should PR #70's wording change from "shadow blade or staff" to "padded staff"? This also answers spec DECIDE #4.
5. Is hiding the staff enough to show disarmed, or do you want a "staff drops" animation?
6. Is the 192 px frame OK? (Tier 1 is 160 and the Brute is 208.)
7. Is lime OK as its colour?
8. Should a `content/enemies/*.json` entry be added?
9. Should I make the full animation set next?

**NEXT:** Once these are approved, make the full set: move, hit, stagger, defeat, and a disarmed or staff-drop moment if wanted.
