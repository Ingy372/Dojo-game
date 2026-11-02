# Delivery Note: bestiary Green A (G2B-08: Cliff Goat, Stack Golem, Boulder Roller) SAMPLES

**ITEM:** G2B-08 from `drafts/planning/R-GREEN-TO-BLACK.md`. Three samples, one per monster. Only `incoming-art/bestiary-green-a/` is touched; no game code.

**WHAT:**
- Each monster is a model render in the same pipeline as set 1 and set 2: idle plus its key move, in 8 directions, with the body / glow / telegraph / light layers. The key move is the telegraph wind-up and the attack pose. Full animation sets (move, hit, defeat) are not started.
- `preview/lineup.png`: all three at in-game size next to the player and existing enemies (Swarmer, Shield Guard, Brute, Floor Keeper, Pebble Pal), for scale.
- `preview/<enemy>_moves.png`: idle, wind-up and attack in S, SE, E and N beside the player and a Brute.
- Cliff Goat: slate-blue, long and low, two simple cream horns. The tell is a stamp of the front hooves with the head lowered; then a low lunge. The game draws the red circle at the end of the line.
- Stack Golem: tall tower of rounded stones with moss, now as three full sets: 5, 4 and 3 stones, each with idle, wind-up and attack in 8 directions (same 128 px frame, same feet line, so the game can swap between them as stones fall off). The tell is a wobble that grows, then the upper stones tip forward. `preview/stack-golem_stones.png` shows all three side by side. How many stones per floor band is a content call; the README notes a placeholder (3 low, 4 mid, 5 high).
- Boulder Roller: a small porter behind a big chipped boulder, with a plain headband. Dash-only. The wind-up is 24 ticks: he leans back and hauls the boulder back, trembling. The tell is house purple, not red: `preview/boulder-roller_lane.png` / `.gif` shows the wind-up next to the purple-striped lane and the '!!'. Lane and '!!' are drawn by the game.
- Wind-up lengths follow the data files (goat 20, golem 20, Roller 24 ticks).

**WHY:** Green needs a Goat (quick, line charge), a Golem (slow, shrinks) and a Roller (dash-only) that are easy to tell apart at a glance. Silhouettes: a long low four-legged shape; a tall narrow stack; a round head over a big round ball. All are soft shadow-creature shapes with big friendly eyes and cheeks: a little spooky, never scary for a 6-year-old. No teeth, claws or sharp points. Nothing goes above a head. The only red is the game-tinted telegraph layer.

**Manager's calls applied (#427):** goat kept slate-blue; goat horns simplified (one smooth rounded horn a side, clean V from the front); golem rendered as full 5-, 4- and 3-stone sets; purple tell kept on the Roller; Roller's headband made plain (no knot, no gold); frame sizes kept as they were (goat and Roller 160 px, golem 128 px).

**Second pass:** checked all three in 8 directions on the contact sheets and the move sheets in S, SE, E, N.
- Fixed: the goat's lunge and the Roller's shove were cut off by the 128 px frame, so those two now use 160 px frames at the same 80 px per tile (the Brute already uses a bigger frame). The goat mesh was also moved and its lunge shortened.
- Fixed: the Roller's headband read as a halo or pot rim, so it is now a forehead band with a knot and tails at the back. Third pass, grounding: the Roller no longer floats in the S wind-up. The boulder is rocked back, not pulled or lifted, and the torso gets a small lift so its back stays off the floor. His lowest pixel is now the same on every wind-up frame in all 8 directions (S 143, SE/SW 141, E/NE/W/NW 138, N 135). The Cliff Goat's hind hooves were lifted 4-5 px by the forward pitch, so they now stay on the ground; the Stack Golem's attack pitch is halved so its base no longer sinks. All three measured on idle, wind-up and attack: the only lowest-pixel changes left are real ground travel (goat front-hoof stamp, Roller and goat moving toward the camera in the attack, golem lean).
- Fixed after the Manager's calls: re-rendered the goat, the Roller and the golem's 5- and 3-stone sets. From the front the goat's horns read as a clean V; the Roller's band is one plain strip with nothing at the back. The 5- and 3-stone golems are grounded like the 4-stone one (lowest pixel within about 2 px of the anchor row in every frame) and nothing touches the frame edge, including the 5-stone topple.
- Fixed in the previews: the Brute was squashed beside the new frames, so every cell now shares one ground line; the lineup has no blank gap.
- Red check on all body / glow / light sheets: 0 red pixels. Red appears only in the preview telegraph tint (purple for the Roller). Phone and house number check on the folder: no hits. Temp files and frames/ folders removed.

**DECIDE:**
1. ~~Goat colour~~ Decided (Manager, #427): keep the slate-blue body.
2. ~~Goat horns~~ Decided: simplified, and applied.
3. **Golem stone counts (content call).** The art now has full 5-, 4- and 3-stone sets that the game swaps between as stones fall off. How many stones per floor band is a content decision; the placeholder in the README is 3 low, 4 mid, 5 high. Who sets the real numbers?
4. ~~Roller tell colour~~ Decided: keep purple.
5. ~~Roller headband~~ Decided: plain, with no gold knot. Applied.
6. ~~Frame sizes~~ Decided: kept as they are (goat and Roller 160 px, golem 128 px). The Programmer should read the frame size from each sprite's json.

**NEXT:** full sets (move, hit, defeat "set free") for all three, and the dash pose for the Roller. The golem's move, hit and defeat sets would be needed at 5, 4 and 3 stones too, once the stone counts are set.
