# Delivery Note: bestiary Red/Black (R-G2B-35: Masklet, Hush Guard, Echo Bell) SAMPLES

**ITEM:** R-G2B-35 from `drafts/planning/R-GREEN-TO-BLACK.md` (the Red/Black enemies, 3 samples). Only `incoming-art/bestiary-red-black/` is touched; no game code. Picked as the lowest-numbered Artist item (after G2B-34) that waits on nothing and has no branch, PR or folder yet. Others that are free for later: G2B-36 (Brown), G2B-37 (Brown/Black), G2B-38 (Black). G2B-39 waits on the concept-sheet OK, G2B-40 to 42 wait on G2B-25 to 27, G2B-43 waits on PB-07 and G2B-22, G2B-44 waits on PB-07. Copycat Shade is left for the full set.

**WHAT:**
- Three model renders in the same pipeline as set 1, set 2, Green A, Blue and Red: idle, wind-up and attack in 8 directions, with the body / glow / telegraph / light layers. 160 px frames at the game's 80 px per tile, feet at y 118. No export into the game.
- Masklet: a small floating lilac theatre mask with a gold rim, glowing eyes in dark eye holes, a smile and two teal ribbon ties. Idle: floats and bobs, ribbons sway, one blink. Wind-up: one full spin on the spot, rising a little (7 frames, the tell). Attack: a quick bump forward.
- Hush Guard: a round slate-violet guard in a soft hood with a silver scarf and a big round silver-rimmed shield. Idle: slow breaths, the shield rocks a little, one blink. Wind-up: the shield turns round to face you and trembles (9 frames). Attack: a slow soft shove with the shield.
- Echo Bell: a round-shouldered brass bell on little felt feet, with twelve lit studs round the lip (the glow's real source). Dash-only: the wind-up draws back and swells tall (11 frames), the attack is a 5-frame ring swing, then a recover. The tell is house purple; the ring with a gap and '!!' are drawn by the game (`preview/echo-bell_ring.png` / `.gif`).
- Wind-up lengths follow the data files (Masklet 14 ticks = 7 frames, Hush Guard 18 = 9, Echo Bell 22 = 11). Attack recover: 16 / 18 / 24 ticks.
- `preview/lineup.png`: all three at in-game size next to the player and existing enemies. `preview/<enemy>_moves.png`: player, Brute, idle, wind-up (last frame, telegraph tinted) and attack (impact) in S, SE, E, N. `preview/echo-bell_ring.png` / `.gif`: the bell's wind-up inside the dash ring.

**WHY:** Red/Black needs a spinning bumper, a shield pusher and a dash-only ring caster that are easy to tell apart at a glance: a small flat floating mask, a small round hooded guard with a big shield, and a wide squat bell. All are soft shadow-creature shapes with big friendly eyes, a little spooky and never scary for a 6-year-old: no teeth, points or spikes, and the shield is a round soft-edged disc. No red and no orange in any sprite: red is only the game-tinted telegraph layer (shown red for the Masklet and Hush Guard, house purple for the Echo Bell). Every glow has a source (the bell's studs); nothing is above a head.

**Second pass:** checked all three in 8 directions on the contact views and in S, SE, E, N at 2x on the move sheets.
- Fixed: the Masklet was too small at 160 px; the model is now 1.2x larger (0.53 wide) and its ribbon ties are wider so they read as arms, not sticks.
- Fixed: the Hush Guard's wind-up eyes poked above the hood in the N view (the camera looks down on a front object). The hood is taller and the eyes lower and smaller.
- Fixed: the Hush Guard's shield looked flat in the N view in the wind-up, because the arm swing tilted it. The arm swing is smaller, so the shield faces you cleanly.
- Fixed: the Echo Bell's eye sockets were buried inside the bell and its cream belly hid the cream eyes. The sockets are now on the surface, dark brown, and the belly patch is removed.
- Fixed: the Echo Bell's raised hands rose above the bell in the E view; the wind-up arms are lower.
- No frame touches the frame edge; idle is constant per direction; the attack lunges toward the camera are ground travel, not floating.
- Red check on all body / glow / light sheets: 0 red pixels. Phone and house number check on the folder: no hits. Temp files, `.blend1` files and frames/ folders removed.

**DECIDED (Manager's calls on #435, Nov 2, 2026):** all five questions are answered. No export.
1. **Copycat Shade waits for the full set.** The three samples stay Masklet, Hush Guard and Echo Bell.
2. **The data follows the art.** **Follow-up for the Content Designer or Programmer** (not done in this PR; only `incoming-art/` is touched):
   - `drafts/content/enemies/masklet.json`: change the colour from `#c7b8e0` to `#b9a6dc`.
   - `drafts/content/enemies/hush-guard.json`: change the colour from `#6c6f8a` to `#6f7391`.
   - `drafts/content/enemies/echo-bell.json`: change the colour from `#b8a04a` to `#c2a548`.
3. **Masklet floating with no feet: OK.** The game draws its shadow.
4. **Hush Guard's soft shield shove: fine for ages 6+.**
5. **Echo Bell's small top button: KEEP.**

**DECIDE:** nothing open on this PR.

**NEXT:** full sets (move, hit, defeat "set free") for all three, plus Copycat Shade. Content Designer or Programmer: the three data colours (DECIDED 2). Then G2B-36 (Brown), G2B-37 (Brown/Black) and G2B-38 (Black).
