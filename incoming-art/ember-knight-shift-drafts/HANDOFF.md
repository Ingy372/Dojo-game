# Programmer handoff — do not import yet

These are concept pictures for a review. There is no sprite sheet and no JSON for the game.

## Leave alone until a look is chosen

- Do not copy anything here into `assets/` or `content/`.
- Do not add a new enemy, a new attack, or a new tuning number.
- Do not treat **Warm Shield** as a final name or as an id. The stable label is **Ember Knight — shifted form**.
- The Ember Knight id stays `ember-knight`. This is the same knight after the 33% shift, not a second boss.

## When a look is approved

The Blender file for the picture under review is `source/ember-knight-shift-b.blend` (shield centre glows). A and C are earlier ideas, kept beside it. Rebuild with the commands in `README.md`.

A later art pass would render the chosen model the usual way: transparent PNG, house camera, 80 px per tile, then the import script. That pass is not this delivery.

## Timing already in the draft data

Do not change it for these pictures.

- Shift at 33% health, forge phase.
- Glow about 1 second. White-gold `#fff4cf`, halo `#ffecaa`.
- During the glow: cannot be hit, does not attack.
- After the glow: the forge phase's existing attacks (ember slash, shield rush).
- The shield colours are the body after that glow. They are not a second timer.

The final boss's three forms are a separate plan and are not in these files.
