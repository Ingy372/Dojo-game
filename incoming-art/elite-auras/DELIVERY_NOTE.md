# Delivery Note: A0 - elite auras SAMPLES (S1 #3 Swift / Guarding), 2026-10-24

**ITEM:** S1 combat-depth #3 (elites): aura art. SAMPLE step only. Stopped here for Jay's OK.

**WHAT**
- `sprites/`: overlay layers, 8 frames at 10 fps, 256 x 256 frame with ground point (128, 210); scale to the enemy (swarmer/shield 0.5, brute 0.8125, keeper 1.0).
  - `aura-swift_back/front`: gold. Soft ground glow, 3 swooshes circling the enemy, little sparkles rising. Reads as "fast".
  - `aura-guarding_back/front`: blue. Soft see-through dome with a slow pulse and a ground ring. Reads as "protected".
  - `badge-swift` (gold double chevron) and `badge-guarding` (blue shield) bobbing above the head, so the two differ by shape too, not only colour.
- `preview/`: `sample-1-all-enemies.png` (normal / Swift / Guarding on all 4 tier-1 enemies), `sample-2-phone-size.png` (phone-width room + greyscale check), `sample-3-room.gif` (animated).
- `source/make_auras.py` (Pillow) rebuilds everything.

**WHY**
- S1: Swift = gold aura, Guarding = blue aura, at most 1 elite per room. Soft, kid-friendly, separate overlay layers so they work on every existing enemy without redrawing them.

**DECIDE (Jay)**
1. Approve the two looks (motion swooshes vs dome)?
2. Keep the badges above the head, or aura only?
3. Should Guarding also show which nearby enemies it protects (e.g. a faint blue link)? That depends on the game rule for "nearby", so not drawn.
4. Names "Swift" / "Guarding" are from the S1 proposal; no on-screen text is drawn.

**NEXT:** after OK, final polish, per-enemy tuned sizes, and hand-off notes for Claude Code.
