# Delivery Note: bestiary Red (R-G2B-34: Anvil Imp, Bellows Puff, Forge Sweeper) SAMPLES

**ITEM:** R-G2B-34 from `drafts/planning/R-GREEN-TO-BLACK.md` (the Red-belt enemies for the Forge of Courage, 3 samples). Only `incoming-art/bestiary-red/` is touched; no game code. Picked as the first Artist item in G2B-34 to G2B-44 that waits on nothing: G2B-39 waits on the concept-sheet OK, G2B-40 to 42 wait on G2B-25 to 27, G2B-44 waits on PB-07. Coal Cub is left for the full set.

**WHAT:**
- Three model renders in the same pipeline as set 1, set 2, Green A and Blue: idle, wind-up and attack in 8 directions, with the body / glow / telegraph / light layers. 160 px frames at the game's 80 px per tile, feet at y 118 (same as Blue). No export into the game.
- Anvil Imp: a small grey, round forge-helper with a leather apron and a soft leather-capped wooden mallet. Idle: breathing and a gentle mallet tap. Wind-up: lifts the mallet to head height beside its head and trembles (the COUNTER tell). Attack: bonks the mallet down in front of it.
- Bellows Puff: a stack of soft tan leather folds on a wooden board, with a small iron nozzle in front, a rear handle and wooden paddle-hands. Idle: slow breathing, paddles flap. Wind-up: swells up fat, paddles out. Attack: squashes forward and puffs out (the gust arrow is drawn by the game).
- Forge Sweeper: a round straw-and-wood hearth broom with a face, standing on its bristles. The bristle tips glow warm gold (the glow's real source). Dash-only: the wind-up turns it away and leans back (11 frames), the attack is a 5-frame sweep through about 140 degrees, then a recover. The tell is house purple; the arc and '!!' are drawn by the game (`preview/forge-sweeper_arc.png` / `.gif`).
- Wind-up lengths follow the data files (imp 18 ticks = 9 frames, puff 20 = 10, sweeper 22 = 11). Attack recover: 18 / 20 / 24 ticks.
- `preview/lineup.png`: all three at in-game size next to the player and existing enemies. `preview/<enemy>_moves.png`: player, Brute, idle, wind-up (last frame, telegraph tinted) and attack (impact) in S, SE, E, N. `preview/forge-sweeper_arc.png` / `.gif`: the sweeper's wind-up inside the dash arc.

**WHY:** Red ("The Forge of Courage") needs a COUNTER enemy with a clear raised-hammer tell, a pusher, and a dash sweeper that are easy to tell apart at a glance: a small grey round shape holding a hammer, a wide squat tan drum with a nozzle, and a flat wide broom with a glowing hem. All are soft shadow-creature shapes with big friendly eyes, a little spooky and never scary for a 6-year-old: no teeth, points or spikes, and the hammer has soft leather caps. No red and no orange in any sprite: red is only the game-tinted telegraph layer (shown red for the imp and puff, house purple for the sweeper). Every glow has a source (sweeper bristle tips); nothing is above a head except the imp's raised hammer in the N view (see DECIDE 3).

**Second pass:** checked all three in 8 directions on the contact views and in S, SE, E, N at 2x on the move sheets.
- Fixed: the puff first read like a pot or a hat (a dark top board dominated, from the elevated camera). It is now four pear-shaped folds, a small light top board with a ring, a lighter tan, and the cream belly was removed because it hid the cream eyes.
- Fixed: the sweeper's dark board hid the straw and matched the body. The board is smaller and inset, the straw and body are lighter, and the glow tips are bigger.
- Fixed: the sweeper's eyes floated in front of its narrow body; moved onto the face.
- Fixed: the imp's mallet at a 52 degree lift rose above the head; it is now 44 degrees, so it sits beside the head in S, SE and E (still pokes about 8 px above the head silhouette in N only, because the camera looks down on a front object; DECIDE 3).
- Fixed: the keeper's gold halo and crown from the shared build script do not appear on any of the three.
- No frame touches the frame edge; idle is constant per direction; attack lunges toward the camera are ground travel, not floating.
- Red check on all body / glow / light sheets: 0 red pixels. Phone and house number check on the folder: no hits. Temp files, `.blend1` files and frames/ folders removed.

**DECIDE:**
1. **Bellows Puff colour: tan leather and wood, not the data colour.** The data colour is `#c46a4a` (red-orange), which breaks "no red except danger". The sprite uses tan `#b98e57` with a dark wood accent `#7a573a`. If you agree, update `drafts/content/enemies/bellows-puff.json` colour to `#b98e57` (Content Designer or Programmer; same kind of follow-up as the Side Crab). Not done in this PR.
2. **Forge Sweeper colour: straw and gold embers, no amber or orange.** The data colour is `#e0a03a` (amber, close to the orange reserved for ENTER THE TOWER). The sprite is straw `#a07a4a` / `#d4b064` with gold tips `#f2cb62`. Suggested data colour: `#a07a4a`. Same follow-up. Keep it?
3. **Imp hammer height cap.** The raised hammer is held at head height and, in the N (facing away) view only, pokes about 8 px above the head. Same camera effect as the Side Crab's claw-up in #429. Keep it as the COUNTER tell, or lower it for N?
4. **Soft leather-capped mallet.** A wooden mallet with leather end caps (not an iron hammer or anvil). OK for the kid-friendly rule?
5. **Forge Sweeper is dash-only**, purple tell with the house stripes on the dash arc, as for the Vine Sweeper. Its data id is `forge-sweep` (the folder here is `forge-sweeper`, the json `enemy` field is `forge-sweep`). OK?
6. **Coal Cub** is not part of these samples and waits for the full set. OK?
7. **160 px frames (feet at y 118)** as in #429 and Blue (the Programmer reads size and anchor from each sprite json). Assumed OK, no change unless you say.

**NEXT:** full sets (move, hit, defeat "set free") for all three, plus the Coal Cub. Content Designer or Programmer: the puff and sweeper data colours (DECIDE 1 and 2) once you decide.
