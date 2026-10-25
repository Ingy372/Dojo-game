# Ember Kitchens rooms (B-ART3 group C)

This kit follows `drafts/content/rooms/ember-kitchens-brief.md` and `ember-kitchens.json`. It reuses the tower-rooms-t2 helpers, doors and chest, recoloured with a kitchen palette.

- **Source:** `source/build_kitchen_t3.py` (37 targets) and `source/build_boss_door_t3.py`, rendered with `tools/render_static.py`. That gives 40 sprites in `sprites/static.json`.
- **Floor:** cream flagstone with flour-dust specks.
- **Walls:** brick, with a honey cap and a brick-brown top.
- **Accents:** copper.
- **Wall pieces:** wall-oven (cold and lit), wall-giant-oven (3 cells wide, cold and lit), soup-pot plus a soup-pot-steam loop, shelf, pots, garlic, clock, and a blank sign-board.
- **Solid props:** flour sacks, table, table with bowls, counter, counter with tools, cart, spice.
- **Flat pieces:** rug (2x2, rectangular), flour-dust, and the bread-board relic spot.
- **Bread-box chest:** opens with an animation.
- **Warm Hearth shrine:** a brick fire ring with a kettle and two cushions, plus an 8-frame glow.
- **Previews (`preview/`):**
  - `room-<n>-<id>.png` for all 8 rooms. These include the player for scale, plus the red circle and purple lane checks in pin-lanes and supper-rush.
  - `rooms-all.png`, `kit-sheet-2x.png`
  - `breadbox_open.gif`, `warm-hearth_glow.gif`, `soup-pot_bubble.gif`
- **Red check:**
  - The floor and props are clean.
  - **wall-block:** flagged because of the brick-brown top (#a0684a, hue 20°), which is brown and not red.
  - **door-battle and icon-battle:** red is carried over from the T2 door trims (see DECIDE).
- **Second pass done:**
  - Fixed the wall row offset.
  - Shadows are smaller and lighter.
  - The wall-block top was changed from honey to brick, so the edges read as walls.
