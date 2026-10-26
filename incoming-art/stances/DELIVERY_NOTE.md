# Delivery Note: R-STANCE-b stance icons

**ITEM:** R-STANCE-b. Icons for the Cat, Front, Fighting and Horse stances.

**WHAT:**
- Four 64 px icons, each with an @2x version, in `incoming-art/stances/`.
- A manifest, a phone-size preview, a README and the build script.
- Horse reuses the #277 Rooted icon unchanged.
- I did not rename any #277 files.

**WHY:**
- Each icon uses #277's Forms medallion so the stances sit with Ready/Beginner's.
- The technique in each one:
  - **Cat:** weight back, front foot on its ball.
  - **Front:** long stance, front knee bent, back leg straight.
  - **Fighting:** side-on, light, guard up.
  - **Horse:** wide and even.
- They read as clearly different at 64 px. Horse is the only front view, Front is long with a punch, Cat is short and tucked back, and Fighting has both fists up and a heel raised.
- Red check: 0 red pixels. Nothing is above the head.

**DECIDE (Jay):**
1. **Fighting vs Flowing:** Fighting and #277 Flowing Form are both a light side-on stance. If Flowing is renamed to a stance, should it be Fighting (one icon, drop one), or stay separate?
2. **File names:** `icon-stance-<id>-64` matches `stance.<id>`. The #277 renames (`rooted-form` → `stance-horse`?) wait on your OK.
3. **Front stance arms:** the front stance shows a punch. Would you rather it show a low block (Keon)?
4. **Cat stance hands:** the cat stance shows fists. Should they be open hands?

**NEXT:** Once you approve, rename the #277 icons and add the sprite keys in `approved.json` (Programmer, R-STANCE-a). Nothing else has been started.
