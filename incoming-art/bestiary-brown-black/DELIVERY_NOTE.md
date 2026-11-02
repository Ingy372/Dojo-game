# Delivery Note: bestiary Brown/Black (R-G2B-37: Gust Sprite, Thunder Drum, Zap Kite) SAMPLES

**ITEM:** R-G2B-37 from `drafts/planning/R-GREEN-TO-BLACK.md` (the Brown/Black enemies: Cloud Puff, Gust Sprite, Thunder Drum, Zap Kite). Three samples only. Only `incoming-art/bestiary-brown-black/` is touched; no game code. Picked as the next free Artist item after G2B-36 (#436). **Cloud Puff is left for the full set** (it splits into the Cloudlet and needs a split effect). Still free for later: G2B-38 (Black).

**WHAT:**
- Three model renders in the same pipeline as Green A, Blue, Red, Red/Black and Brown: idle, wind-up and attack in 8 directions, with the body / glow / telegraph / light layers. 160 px frames at the game's 80 px per tile, feet at y 118. No export into the game.
- Gust Sprite: a small pale-blue floating cloud with big eyes in dark sockets, pink cheeks, a round "o" mouth, two puff hands, a curling tail and soft swirl lines. Idle: a slow float with a gentle swirl, one blink. Wind-up: one full turn on the spot, arms wide (10 frames). Attack: it leans in and puffs a gust forward (12 frames). Its colour is the data colour.
- Thunder Drum: a friendly purple drum with a cream skin top, a yellow lightning bolt, cream studs (the glow source), gold hoops and lugs, two felt feet and arms with drumsticks. Idle: a slow bounce on the beat, sticks tap lightly, one blink. Wind-up: sticks up, trembling (10 frames). Attack: three beats, boom, boom, BOOM (frames 0, 2, 4; 16 frames in all).
- Zap Kite: a rounded yellow diamond kite that floats, with a lighter face panel, big eyes, cheeks, a smile, a soft zig-zag cream tail with blue bows and two blue streamer arms. Dash-only. Idle: a kite-like sway, one blink. Wind-up: it quivers and tilts (10 frames); the tell is house purple. Attack: a quick dart (14 frames).
- Frame counts follow the data files: wind-up 10 / 10 / 10 frames (all 20 ticks), attack 12 / 16 / 14 frames (recovers 20 / 20 / 24 ticks). Idle is 8 frames for all three.
- `preview/lineup.png`: the three at in-game size next to the player and existing enemies. `preview/<enemy>_moves.png`: player, Brute, idle, wind-up (last frame, telegraph tinted) and attack (impact) in S, SE, E, N. `preview/zap-kite_lane.png` / `.gif`: the wind-up beside a zig-zag lane and '!!'.

**WHY:** Brown/Black needs a harmless pusher, a rhythm brawler and a fast zig-zag darter that read apart at a glance: a pale cloud, a purple drum, a yellow diamond. All are friendly, round, big-eyed shapes for a 6-year-old: no teeth, points or spikes (the kite's corners are rounded). No red and no orange in any sprite. The telegraph layer is neutral white and tinted by the game. Every glow has a source (the soft white rim of the cloud, the drum's cream studs, the kite's face panel); nothing is above a head (the drumsticks stay at head height).

**Second pass:** checked all three in 8 directions on the contact views and in S, SE, E, N at 2x on the move sheets.
- Fixed: the Zap Kite read as a round lens. It is now a rounded diamond, narrower and taller, with the face lower down and a longer tail.
- Fixed: the Gust Sprite swirl lines were faint dots. They are now short soft lines that read on the back and sides.
- Fixed: the Thunder Drum's wind-up crashed on the arm values; the sticks now rise with the whole arm. The attack's key frames are named `beat1`, `beat2`, `impact`, matching the tags.
- No frame touches the frame edge (0 clipped frames); idle is constant per direction.
- Red check on all body / glow / light sheets: 0 red pixels. Phone and house number check on the folder: no hits. Temp files, `.blend` / `.blend1` files and frames/ folders removed.

**DECIDED (Manager's calls on #438, Nov 2, 2026):** all five questions are answered. No export.
1. **Cloud Puff waits for the full set.** The three samples stay Gust Sprite, Thunder Drum and Zap Kite.
2. **The pale blue tell is good.** The Gust Sprite telegraph is tinted pale blue `#a9c6d8`, not red.
3. **Floating is OK.** The Gust Sprite and Zap Kite float with no feet; the game draws their shadows.
4. **The three beats are OK.** The Thunder Drum's boom, boom, BOOM attack stays as made.
5. **Zig-zag lane: a Programmer follow-up** (not done in this PR; only `incoming-art/` is touched). The Zap Kite's zig-zag lane shape does not exist yet in `incoming-art/dash-telegraph`. Programmer: draw a purple-and-white zig-zag lane for the Zap Kite dash. The preview lane (`preview/zap-kite_lane.png` / `.gif`) is only a stand-in.

**DECIDE:** nothing open on this PR.

**NEXT:** full sets (move, hit, defeat "set free") for the three plus Cloud Puff and the Cloudlet. Programmer: the zig-zag lane (DECIDED 5). Then G2B-38 (Black).
