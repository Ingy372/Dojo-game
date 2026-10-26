# Delivery Note: body B ear fix

**Bug (reported by Jay):** body B's ears sat on her shoulders instead of on the sides of her head.

**Cause:** `build_custom.py` made body B's ears smaller by setting the ear objects' scale to 0.85. Those objects have their origin at the rig origin, at floor level, so the scale also moved the ears 15 % closer to the floor. The ear centre ended up at z 0.906 instead of 1.069, which is shoulder height.

**Fix:**
- `build_custom.py` now scales the ear meshes (and their outlines) by 0.85 around each ear's own centre.
- `source/fix_ears_b.py` applies the same fix to the saved `player_custom_b.blend`.
- The ear centres now match body A exactly: (±0.171…0.195, ~0, 1.06–1.07).
- The eyes were not changed. They are still the original pre-A7 eyes that were restored in #175.

**What was re-rendered**, all frames in all 8 directions:
- `player-custom/sprites/body-b`: all 13 animations. 248 of the 416 sheets changed. These are the layers where the ears show or block something: body, skin, gi, every hair, the faces, and some of the belt/prop layers. The other sheets came out pixel-identical, so they are left as they were.
- `form-stances-a2/sprites/body-b` (stance_rooted, stance_flowing), `alternate-not-used/sprites/body-b` (stance_rooted_back), and the stance preview GIFs.

**Checked and not affected:**
- senpai and instructor-2 (base "b"): build_people rebuilds their heads, and their ears already sit at head height (verified in their blends).
- kohai and the other NPCs use base "a".
- walk-rework/arms-* is body A only.
- No portrait is built from body B, so no portrait changes.

**Checks:**
- Every skin-layer frame in all of the sheets above was compared with main: 1448 frames, 0 empty, all of them changed where the ears moved.
- Visual review: `preview/ears-fix/ears-before-after-<anim>.png` (every frame, before on the left and after on the right) and `ears-closeup-walk-frame1.png` (S, E, N and SE at 3x).
- From the game's 3/4 camera the ears now read the same as body A's: a small bump at the side of the head.

DECIDE: none.
