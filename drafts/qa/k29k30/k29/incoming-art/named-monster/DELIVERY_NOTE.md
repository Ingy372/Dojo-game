# Delivery Note: K-tells-fix, the named-monster warning moves, 2026-10-24

**ITEM:** Jay on PR #53: "Warning moves is broken. The characters are doing crazy things."

**WHAT was broken (plain words)**
- The monsters in the preview GIF were being **cut in half**. On every other GIF frame the script asked for "frame 1.5" of a creature. That made it cut the sprite sheet halfway between two pictures, so you saw the right half of one pose next to the left half of the next. The monsters looked like they were splitting, sliding and flickering.
- The calm "idle" breathing also played about **twice as fast** as it should, because it followed the GIF's speed instead of the creature's own speed.
- After each warning the monster **snapped straight back to idle** with no attack, so the warning didn't lead anywhere.
- The brute was also **bounced up and down 2 px** on its stamps. That shake belongs to the game camera and is off with reduced motion, so it shouldn't be baked into the creature.
- **Two small alignment slips:**
  - The swarmer's long-dash trail pieces sat 8 px below the main trail line.
  - The shield flash used the shield's spot from the first frame only, but the shield rises during the wind-up, so the flash drifted off it.
- The three tell sprite sheets themselves were fine: same frame sizes, anchors, frame order and direction rows as the creatures. I checked each one frame by frame.

**WHAT I fixed** (`incoming-art/named-monster/` only, in the generating script `source/make_tells.py`)
- Every creature and effect now picks a **whole frame from real time, at that animation's own speed**: idle at 8-10 fps, wind-up and attack at 10 fps, sparkles at 10 fps.
- Each monster now does a full, believable move in turn:
  - It waits calmly.
  - It winds up. The warning circle grows and its tell plays: 2 dust stamps, the sparkle trail, or 3 shield taps.
  - It attacks. The swarmer actually dashes along its trail and hops back.
  - It goes back to calm.
- I removed the brute bounce, so reduced motion keeps working: the game owns the shake and turns it off with reduced motion.
- I lined the trail pieces up with the trail.
- The shield flash now follows the shield on every wind-up frame (new `offsetPerFramePx` in `static.json`; the old `offsetPerDirectionPx` is still there).
- Re-rendered `preview/tells-room.gif` (7 s loop) and `preview/tells-keyframes-greyscale.png`.
- **Checked:** I pulled frames out of the new GIF. The feet stay on the same line (only the real wind-up and attack poses move them a few px), no frame is cut, and the sizes change only with the real poses.
- The name tag, Insight icons, sheets, frame sizes, anchors and timings are unchanged.

**WHY:** The warning moves have to be easy for a 6-year-old to read. A monster that flickers or splits looks broken and hides the real warning.

**DECIDE (Jay):** Does the new GIF now look right to you? If yes, the tells are ready to wire in.

**NEXT:** After your OK, Claude Code wires the tells using the notes, which now also say: "always use whole frame numbers from each animation's own speed".
