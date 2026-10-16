# Delivery Note: Batch 3 (Home Dojo), 2026-10-16

**WHAT**
- The Home Dojo room, 15 × 10 tiles, as 3 layers:
  - the floor and back wall;
  - the notice board on the top wall;
  - the front wall with the door at the bottom centre, drawn above the characters for depth.
- All 11 decorations at their exact footprints.
- Mess overlays, each with a clean version: 3 dust, 3 leaves, scuffed versions of both mats, and the weapon rack crooked at 3 levels.
- Footprints and anchors are in `sprites/static.json`. Everything is script-built (`source/build_home_dojo.py` + `tools/render_static.py`).

**WHY**
- The room uses the same 35° camera, toon look and 80 px tiles as the characters, so the player and decorations sit on the grid exactly.
- Sizes and the decoration list come from `content/dojo/*.json` and `docs/decisions.md`.
- The weapons are wooden practice weapons only (bokken and jo).
- The kanji are 心 (heart/spirit) on the banner and 道 (the way) on the scroll.

**DECIDE (Jay)**
1. Approve the room look: warm wood and plaster panels.
2. Approve the kanji choices (心 on the banner, 道 on the scroll) and the font, BIZ UDPMincho Bold (OFL).
3. Are the mess pieces readable enough for kids to spot and tap? Dust bunnies are soft grey, leaves are autumn colours, scuffs are light streaks.

**NEXT**
- Batch 4 (tower rooms).
- After approval, Claude Code wires these in, replacing the placeholder rectangles.

**Doc conflicts:** none. Small notes:
- The door is at the true centre: column 8 counting from 1, matching the `D` in `home-dojo.json`.
- The wall items are drawn on the top wall's bottom edge, because the docs only say "wall".

**Review these first:**
- `preview/review-1-room-all-decorations.png`
- `preview/review-2-decorations-2x.png`
- `preview/review-3-room-messy.png`
