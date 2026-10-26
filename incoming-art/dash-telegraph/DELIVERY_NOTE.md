# Delivery Note - dash-only telegraph art (A-BEST 2)

**Status: final piece, for the Manager's review, then Jay's final OK. Nothing is to be imported before that.**
Only `incoming-art/dash-telegraph/` changed; no game code.

## What
Purple-and-white diagonal floor stripes in the three shapes from bestiary-plan.md: a **lane**, an **arc** (120 deg and
180 deg) and a **ring with a gap** (the gap glows). Plus the **'!!'** mark. Layers: glow, fill, edge (and gap on the
ring), plus a seamless stripe swatch for any size. See IMPORT_NOTE.md for sizes, anchors, aiming, scaling and animation.

## Previews (`preview/`)
- `scene_phone.png`: phone size (TILE 48) on the tower floor, with the player, a Brute with its red circle drawn the way
  GameScene draws it, and all three stripe shapes with '!!'.
- `scene_phone_grey.png`: the same in greyscale. The stripes still read as their own thing (banded, not a filled disc).
- `scene_2x.png`: 2x zoom. `dash_anim.gif`: the suggested fade, scroll and pulse. `layers_sheet.png`: every layer.

## Plan rules checked (second pass)
- Stripes on the floor, lane / arc / ring with a gap only. Never a full circle, never red. Purple and white,
  not yellow or blue, so they can't be mixed up with Calm Mind aqua or gold loot.
- '!!' (two marks) against the red circle's single '!'. Same placement (above the enemy).
- Readable in greyscale: the banded pattern plus the outline are distinct from the red circle's solid fill.
- Kid-safe: soft rounded ends, no sharp corners. The ring gap is lit so the way out is obvious.
- Fixed in the second pass: the sizes were in tiles rather than px (empty layers); the arc and ring ends were square
  (now rounded); the ring's gap glow was clipped by the canvas (the canvas is now 8 tiles).

## DECIDE
1. Stripe width: 1 purple and 1 white band per 0.5 tile on the diagonal. Thinner or wider?
2. Scroll the stripes during the wind-up, or only pulse? (Scrolling needs the TileSprite route.)
3. Zap Kite's zig-zag and Splash Wave's "wave lane" are lanes in the plan. Use the lane as-is, or make extra baked shapes later?
