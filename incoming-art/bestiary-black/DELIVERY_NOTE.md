# Delivery Note: bestiary Black (R-G2B-38: Storm Wisp, Rumble Brute, Sky Sweeper) SAMPLES

**ITEM:** R-G2B-38 from `drafts/planning/R-GREEN-TO-BLACK.md` (the Black enemies: Storm Wisp, Rumble Brute, Echo Knight, Sky Sweeper). Three samples only. Only `incoming-art/bestiary-black/` is touched; no game code. **Echo Knight is left for the full set** (it mixes three tells and needs a shield-shine and a copy effect).

**WHAT:**
- Three model renders in the same pipeline as the earlier batches: idle, wind-up and attack in 8 directions, with the body / glow / telegraph / light layers. 160 px frames at the game's 80 px per tile, feet at y 118. No export into the game.
- Storm Wisp: a small slate storm cloud that floats, with big eyes in dark sockets, pink cheeks, a smile, side puffs, tiny hands, a curling tail and a small yellow zig-zag bolt (the glow source). Idle: a slow float, one blink. Wind-up: it fluffs up and shivers, hands out. Attack: a quick forward zap-squash. Its colour is the data colour.
- Rumble Brute: a big soft brute in dark slate with a cloud-scarf ring, a belly patch with a yellow bolt (the glow source), thick arms with cloud mitts and stubby dark feet. Idle: a slow heavy breath, one blink. Wind-up: both arms up to chest height, trembling. Attack: a soft cloud-mitt slam.
- Sky Sweeper: a periwinkle ball with a wind skirt of streamers, a straw broom and a paper lantern on a cord (the glow source). Dash-only: purple tell. Wind-up: it turns and holds the broom out. Attack: the sweep (frames 0-4), a short gap, then the thrust (frames 7-9). The key frames are tagged `sweep` and `lane`.
- Frame counts follow the data files (Storm Wisp / Rumble Brute / Sky Sweeper): wind-up 7 / 8 / 10 frames (14, 16, 20 ticks); attack 10 / 11 / 22 frames (recovers 16, 18, 24 ticks). Idle is 8 frames for all three.
- `preview/lineup.png`: the three at in-game size next to the player and existing enemies. `preview/<enemy>_moves.png`: player, Brute, idle, wind-up and attack in S, SE, E, N. `preview/sky-sweeper_arc_lane.png` / `.gif`: the wind-up, the sweep with the purple arc, and the thrust with the purple lane and '!!', using the real `dash-telegraph` art.

**WHY:** Black needs a small zapper, a heavy slammer and a long-reach sweeper that read apart at a glance: a small slate cloud, a big dark brute, a tall periwinkle ball with a broom. All are friendly, round, big-eyed shapes for a 6-year-old: no teeth, points or spikes. No red and no orange in any sprite. The telegraph layer is neutral white and tinted by the game. Every glow has a source (the Storm Wisp's bolt, the Rumble Brute's belly bolt, the Sky Sweeper's lantern); nothing is above a head.

**Second pass:** checked all three in 8 directions on the contact views and in S, SE, E, N at 2x on the move sheets.
- Fixed: the Storm Wisp's bolt was hidden behind its cloud. It now sits at its left side.
- Fixed: the Rumble Brute's wind-up mitts rose above its head from the side. They now stop at chest height.
- Fixed: the Sky Sweeper's broom read as a spoon and its lantern as a hand. The broom now has a flared straw head, a gold band and strands; the lantern is bigger with ribs and gold caps.
- Note: the Sky Sweeper's streamers read a little like tentacles; I kept them as a "wind skirt" and shortened them.
- No frame touches the frame edge (0 clipped frames); idle is constant per direction.
- Red check on all body / glow / light sheets: 0 red pixels. Phone and house number check on the folder: no hits. Temp files, `.blend` / `.blend1` files and frames/ folders removed.

**DECIDE:**
1. **Which three samples?** I made Storm Wisp, Rumble Brute and Sky Sweeper and left Echo Knight for the full set. OK?
2. **Sky Sweeper's arc-then-lane attack and purple tell.** The sprite only supplies the sweep (frames 0-4) and thrust (7-9) poses. The arc, lane and '!!' are game-drawn from `dash-telegraph`. OK?
3. **Floating.** The Storm Wisp and Sky Sweeper float with no feet; the game draws their shadows. OK?
4. **Rumble Brute's size and soft cloud-mitt slam**, to match the game-drawn red circle (area radius 0.95). OK?
5. **Storm Wisp's crackle.** The yellow bolt is the glow source; the red circle is game-drawn. OK?

**NEXT:** full sets (move, hit, defeat "set free") for the three plus Echo Knight (shield-shine and copy effect). Then the next item.
