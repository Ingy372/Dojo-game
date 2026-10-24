# Delivery Note: A5 Bouncy Bopper, full set

**ITEM:** A5. The Bouncy Bopper, a padded-weapon enemy (name from PR #97 C8, numbers from PR #102). It builds on the merged samples (PR #95).

**WHAT:** 7 animations in 8 directions at 192 px, with body, glow, telegraph, light and weapon layers:
- idle 8 frames at 8 fps
- windup 8 frames at 10 fps (16 ticks)
- attack 11 frames at 10 fps, with impact on frame 0
- move 6 frames at 10 fps, springy hops, 2.2 tiles/s
- hit 3 frames at 12 fps
- stagger 8 frames at 10 fps, looping
- defeat 14 frames at 12 fps: a poof into a light orb and soft sparkles (light 3, gone 13)

Previews and GIFs for every animation are in `preview/`, plus `review-4-before-after-S-attack-and-body.png`.

**WHY:**
- The front (S) attack read as compact, so it is now a diagonal bonk with the staff reaching out.
- The body was small and dark next to Tier 1, so it is about 7% bigger, with a brighter blue and bigger eyes.
- Disarmed just hides the staff, as approved, so there is no drop animation.
- Defeat is kid-safe, like Tier 1.

**DECIDE:**
1. HP 110 and power 16 still wait on the balance run (#102).
2. When disarmed: push-paw (same pose, no staff) or no attack?
3. The asset id stays `padded` while the content id is `bopper`. Rename or keep?
4. Idle, windup and attack changed slightly with the redraw, so they need to be re-imported (not just the new 4).

**NEXT:** Re-import all of `sprites/` and use the name Bouncy Bopper. After the decisions above, I can make a push-paw variant if you want it.
