# Delivery Note: bestiary Green A (G2B-08: Cliff Goat, Stack Golem, Boulder Roller) SAMPLES

**ITEM:** G2B-08 from `drafts/planning/R-GREEN-TO-BLACK.md`. Three samples, one per monster. Only `incoming-art/bestiary-green-a/` is touched; no game code.

**WHAT:**
- Each monster is a model render in the same pipeline as set 1 and set 2: idle plus its key move, in 8 directions, with the body / glow / telegraph / light layers. The key move is the telegraph wind-up and the attack pose. Full animation sets (move, hit, defeat) are not started.
- `preview/lineup.png`: all three at in-game size next to the player and existing enemies (Swarmer, Shield Guard, Brute, Floor Keeper, Pebble Pal), for scale.
- `preview/<enemy>_moves.png`: idle, wind-up and attack in S, SE, E and N beside the player and a Brute.
- Cliff Goat: slate-blue, long and low, curled cream horns. The tell is a stamp of the front hooves with the head lowered; then a low lunge. The game draws the red circle at the end of the line.
- Stack Golem: tall tower of rounded stones with moss. The main sprites are the 4-stone version. The tell is a wobble that grows, then the upper stones tip forward. `preview/stack-golem_stones.png` shows 5 (full), 4 and 3 stones for the shrink per hit (5 and 3 are idle only).
- Boulder Roller: a small porter behind a big chipped boulder. Dash-only. The wind-up is 24 ticks: he leans back and hauls the boulder back, trembling. The tell is house purple, not red: `preview/boulder-roller_lane.png` / `.gif` shows the wind-up next to the purple-striped lane and the '!!'. Lane and '!!' are drawn by the game.
- Wind-up lengths follow the data files (goat 20, golem 20, Roller 24 ticks).

**WHY:** Green needs a Goat (quick, line charge), a Golem (slow, shrinks) and a Roller (dash-only) that are easy to tell apart at a glance. Silhouettes: a long low four-legged shape; a tall narrow stack; a round head over a big round ball. All are soft shadow-creature shapes with big friendly eyes and cheeks: a little spooky, never scary for a 6-year-old. No teeth, claws or sharp points. Nothing goes above a head. The only red is the game-tinted telegraph layer.

**Second pass:** checked all three in 8 directions on the contact sheets and the move sheets in S, SE, E, N.
- Fixed: the goat's lunge and the Roller's shove were cut off by the 128 px frame, so those two now use 160 px frames at the same 80 px per tile (the Brute already uses a bigger frame). The goat mesh was also moved and its lunge shortened.
- Fixed: the Roller's headband read as a halo or pot rim, so it is now a forehead band with a knot and tails at the back. Third pass, grounding: the Roller no longer floats in the S wind-up. The boulder is rocked back, not pulled or lifted, and the torso gets a small lift so its back stays off the floor. His lowest pixel is now the same on every wind-up frame in all 8 directions (S 143, SE/SW 141, E/NE/W/NW 138, N 135). The Cliff Goat's hind hooves were lifted 4-5 px by the forward pitch, so they now stay on the ground; the Stack Golem's attack pitch is halved so its base no longer sinks. All three measured on idle, wind-up and attack: the only lowest-pixel changes left are real ground travel (goat front-hoof stamp, Roller and goat moving toward the camera in the attack, golem lean).
- Fixed in the previews: the Brute was squashed beside the new frames, so every cell now shares one ground line; the lineup has no blank gap.
- Red check on all body / glow / light sheets: 0 red pixels. Red appears only in the preview telegraph tint (purple for the Roller). Phone and house number check on the folder: no hits. Temp files and frames/ folders removed.

**DECIDE:**
1. **Goat colour.** The data colour is a pale `#d8d2c4`. A pale body does not read as a shadow creature, so the body is slate-blue and the pale colour is the horns and tuft. OK, or paler?
2. **Goat horns.** Short, curled, cream, rounded. From the front they bunch up a little. Smaller or simpler?
3. **Golem stones.** Five when full, one off per hit; the wind-up and attack are on the 4-stone sprite. Should the game swap between the 5, 4 and 3-stone sprites (shown), and how many stones for each floor band?
4. **Roller tell colour.** The wind-up sprite carries a neutral white tell layer, tinted house purple (`#8a4fe6`) like the other dash-only tells, with '!!' and the lane drawn by the game. OK? The boulder is part of the sprite (it spins during the dash); the dash itself is the game moving him.
5. **Roller headband.** Gold band with a knot. It is the only gold on him, so he reads as a porter. Keep, or plain?
6. **Frame sizes.** Goat and Roller use 160 px frames, the golem 128 px (80 px per tile all three). OK for the Programmer?

**NEXT:** after your answers: full sets (move, hit, defeat "set free") for all three, the dash pose for the Roller, and the wind-up and attack sheets for the 5 and 3-stone golem.
