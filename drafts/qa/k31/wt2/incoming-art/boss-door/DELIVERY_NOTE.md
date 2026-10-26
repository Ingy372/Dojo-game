# Delivery Note: Batch 5, the boss door, 2026-10-16

**WHAT**
- **The door:** the boss door in look A (the stone gate), closed and open. The doors slide apart and the doorway glows warm.
- **The glow:** an 8-frame glow loop (1 s) around the crown medallion and the gold frame.
- **The icon:** the crown medallion on its own (`icon-boss`).
- **The JSON:** `sprites/static.json` entries in the same format as the Tower doors.
- **Previews in `preview/`:**
  - `review-1-room.png` (start here)
  - `review-2-pieces-3x.png`
  - `door-boss_glow.gif`
  - `door-boss_open.gif`
- **Removed:** samples B and C. They stay in git history.

**WHY:** Jay picked look A. The room before the Floor Keeper should have a special "Keeper's door" (brief, Batch 5).

**DECIDE (Jay)**
1. **Medallion face:** kept cream, like the other doors. *Defaulted, easy to change.*
2. **Glow loop:** it pulses only the medallion and the gold frame, not the edges of the doorway. *Defaulted, easy to change.*
3. Approve Batch 5 so Claude Code can put it in the game.

No names or words were needed.

**NEXT**
- Claude Code replaces the borrowed battle door on the boss room's door with `door-boss`, and plays `door-boss-glow` while the room is being fought.
- Then Batch 6 (the customizable player character), only after Jay's OK.

**Conflicts with the docs:** none.
