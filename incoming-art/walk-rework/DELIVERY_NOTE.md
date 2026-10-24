# Delivery Note: arm-only walk samples + earlier eyes put back

**ITEM:** Jay's feedback on #164. (1) Keep the current walk; the legs are fine, the arms are awkward: 3 arm-only samples. (2) Undo the "crazy eyes".

**WHAT (1), arms:** the legs, hips, chest twist, head and timing are the current walk, untouched (the script checks every non-hand curve is unchanged, and the lower-leg pixels of all 8 directions match the current sheets exactly). Only the hand positions change. In the current walk the hands are carried high near the chest and pumped a long way forward and back, which is what reads as awkward.
- **Arms 1, relaxed:** opposite-arm swing, soft elbows, hands down by the hips, a medium swing (±9.5 cm) that trails the legs slightly, with a small lift on the forward hand.
- **Arms 2, tidy:** a small swing (±5 cm), hands closer to the body and a little higher.
- **Arms 3, low fists:** loose fists carried low, a small swing (±4 cm).
Same size, layout, fps and ground motion as the current walk (body A; body B is the same script on `player_custom_b.blend`).

Previews (top row = current walk, bottom = sample; S, E, N, SE, 2x, floor grid scrolls at 4.5 tiles/s):
- `preview/compare-arms-1.gif`, `preview/strip-arms-1.png`
- `preview/compare-arms-2.gif`, `preview/strip-arms-2.png`
- `preview/compare-arms-3.gif`, `preview/strip-arms-3.png`

**WHAT (2), eyes:** the change came from our art, in **A7, PR #109** (commit 4e8da4c, "deep-skin face readability", from QA PR #83), not from the game code. A7 made the light ring around each eye larger (+0.013 / +0.015 instead of +0.007 / +0.007) and brighter (`#fff8f0` instead of `#f3e6dc`) and moved it nearer the surface, made the eye shine larger, added a second small shine under each eye, and lightened the mouth (`#d8695e` instead of `#a8473f`). On dark skin that bright white ring is what reads as "crazy eyes". It reached:
- the player, body A and body B: all 6 faces, all 13 animations;
- the A2 form stances (made after A7 from the same blends): faces 1-6 of `stance_rooted`, `stance_flowing`, and the unused `stance_rooted_back`;
- the kohai (the only NPC re-rendered after A7): all 6 sprite sheets and the 4 portraits.
The sensei, senpai, instructor-2 and founder were rendered before A7 and already have the earlier eyes. Nothing in `apps/client/src` or the import tool touches eyes.

Undo: the player face sheets are the exact pre-A7 files. `restore_eyes.py` put the pre-A7 eye meshes and eye-ring/mouth colours back into `player_custom_a/b.blend` and `kohai.blend` (a test render matches the pre-A7 sheets to the pixel), and `build_custom.py` is back to the earlier eyes. The stance faces and the kohai were re-rendered from those blends. Kept from A7: the softer black hair and the kohai top-knot with the teal tie.
- `preview/eyes-before-after-player.png`: per body, top row = A7 (main), bottom = earlier eyes; faces 1-6 on light and deep skin, 1x and 3x.
- `preview/eyes-before-after-kohai.png`: kohai heads in 4 directions and the neutral portrait, before (top) and after (bottom).

**SECOND PASS:** checked the strips at 1x (phone size) in S and E: legs identical frame for frame, hands don't cut into the body or the belt, nothing goes above the head, no red added. Eyes checked at 1x on light and deep skin.

**DECIDE:**
1. Which arms: 1 relaxed, 2 tidy or 3 low fists (or keep the current arms)? Then I'll render body B and drop the other samples.
2. With the earlier eyes, faces on the darkest skins are harder to read again (the QA #83 problem A7 was fixing). Leave them, or try something gentler later (for example a slightly bigger shine with no white ring)?

**NEXT:** Claude Code: re-import the files listed in NOTES-FOR-CLAUDE-CODE.md (player faces, form stances, kohai). Arm sample sprites are not for import until Jay picks one.
