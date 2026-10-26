# Delivery Note: S1 follow-up - Guarding links (tether, foot glow, snap) + gold sparkle proposal, 2026-10-24

**ITEM:** Art ask in `drafts/planning/S1-tier2-name-and-guarding-aura.md` (PR #30): show who the Guarding elite protects. Also: Tier 2 working label -> "Sunrise Garden" (notes only).

**WHAT** (`elite-auras/sprites/`, listed in `static.json`)
- `guard-tether_beam.png`: thin blue line, 64 x 24, tiles along x (or stretch), 8 frames @ 10 fps; a soft light pulse travels guarder -> protected.
- `guard-tether_cap.png`: round end cap for both ends, 24 x 24.
- `<enemy>/guard-protected_glow.png` for swarmer, shield, brute, keeper: soft blue foot glow + thin ring, same frame size and anchor as the enemy (and as the existing auras), 8 frames @ 10 fps. Smaller and quieter than the elite's own aura, no dome.
- `guard-tether_snap.png`: 4 frames @ 12 fps, once: a little flash, blue chips and a ring puff, no scary shapes.
- `aura-sparkle-gold_front.png`: **PROPOSAL** - the gold sparkles removed from Swift, as their own layer for a possible future rare named monster. Not wired.
- Nothing above any head. Same blues as the approved Guarding aura.
- `preview/`: `guard-room-tier1-grey.gif` / `guard-room-tier2-cream.gif` (loop, then the guarder is defeated and the lines snap), matching PNG stills, `guard-parts-2x.png`. The red ellipse in the previews is a mock of the danger circle to check layering: it sits on top of the blue.
- Notes: NOTES-FOR-CLAUDE-CODE.md (layer order, how to stretch the line), SOURCES.md, Tier 2 label "Sunrise Garden" (folder `tower-rooms-t2/` unchanged).

**WHY**
- Kids need to see why their hits are weaker on protected enemies (planning doc §2). Separate layers keep the red danger circle readable on top.

**DECIDE (Jay)**
1. Tier 2 name: Sunrise Garden (used as the working label here) or a backup?
2. Guarding numbers (3 tiles, max 2, half damage) are the planner's starting numbers; art works with any values.
3. Keep the gold sparkle proposal for a future rare monster, or drop it?

**NEXT:** Claude Code wires the links using the layer order in the notes; check on a phone that the red circle stays on top.
