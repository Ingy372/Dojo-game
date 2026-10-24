# Delivery Note: A0 - elite auras FULL SET (S1 #3 Swift / Guarding), 2026-10-24

**ITEM:** S1 combat-depth #3 (elites): aura art. Jay approved the samples ("the enemies are approved"), so this is the full set.

**WHAT**
- `sprites/<enemy>/aura-<kind>_<layer>.png` for all 4 tier-1 enemies (swarmer, shield, brute, keeper) x Swift / Guarding x back / front.
  - Each sheet is 8 frames in a row, loop at 10 fps, at the **same frame size and anchor as that enemy** (swarmer/shield 128 x 128 @ (64, 104.96), brute 208 x 208 @ (104, 170.56), keeper 256 x 256 @ (128, 209.92)). Stack 1:1 with the enemy frame, no scaling.
  - Draw order: aura back -> enemy -> aura front.
  - `aura-swift`: gold. Soft ground glow and 3 swooshes circling the enemy. Reads as "fast".
  - `aura-guarding`: blue. Soft see-through dome with a slow pulse and a ground ring. Reads as "protected".
  - Nothing above the head: no badges, and the small Swift sparkles that drifted up over the head were also removed (they read as badges in the room GIF).
- `sprites/aura-<kind>_<layer>.png` (256 masters, ground point (128, 210)) are kept for reference; `static.json` lists the masters and the per-enemy entries `aura-<kind>-<enemy>`.
- `preview/`: re-rendered without badges or sparkles (checked frame by frame).
- `source/make_auras.py` (Pillow) rebuilds everything.

**WHY**
- S1: Swift = gold aura, Guarding = blue aura, at most 1 elite per room. Separate overlay layers work on every existing enemy without redrawing them.

**DECIDE (Jay)**
1. Should Guarding also show which nearby enemies it protects (e.g. a faint blue link)? That depends on the game rule for "nearby", so not drawn.
2. Names "Swift" / "Guarding" are from the S1 proposal; no on-screen text is drawn.
