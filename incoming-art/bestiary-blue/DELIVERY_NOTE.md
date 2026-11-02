# Delivery Note: bestiary Blue (R-G2B-33: Puddle Frog, Side Crab, Splash Wave) SAMPLES

**ITEM:** R-G2B-33 from `drafts/planning/R-GREEN-TO-BLACK.md` (the Blue-belt enemies, 3 samples). Only `incoming-art/bestiary-blue/` is touched; no game code.

**WHAT:**
- Three model renders in the same pipeline as set 1, set 2 and Green A: idle, wind-up and attack in 8 directions, with the body / glow / telegraph / light layers. 160 px frames at the game's 80 px per tile, feet at y 118. No export into the game.
- Puddle Frog: the hop. Crouch wind-up, an optional 5-frame `leap` arc, and a wide-squash landing. Round, soft, friendly.
- Side Crab: guard and side-walk build, with a claw snap. Cocks the big claw high and back (the tell), then snaps it across the front. One big rounded claw and one smaller.
- Splash Wave: the dash-only lane. It draws back and swells tall (24 ticks), then surges forward. The tell is house purple, with the lane and '!!' drawn by the game: `preview/splash-wave_lane.png` / `.gif`.
- `preview/lineup.png`: all three at in-game size next to the player and existing enemies. `preview/<enemy>_moves.png`: idle, wind-up, (hop) and attack in S, SE, E, N beside the player and a Brute. `preview/<enemy>/`: 8-direction contact sheets and GIFs.
- Wind-up lengths follow the data files (frog 18, crab 18, wave 24 ticks).

**WHY:** Blue ("The Quiet River") needs a hopper that lands on you, a sideways guard-and-snap enemy and a water dash that are easy to tell apart at a glance: a squat round shape, a very wide low shape with one big claw, and a wobbly mound with a white foam cap. All are soft shadow-creature shapes with big friendly eyes, in calm blue and teal: a little spooky, never scary for a 6-year-old. No teeth, points or spikes. The only red is the game-tinted telegraph layer.

**Second pass:** checked all three in 8 directions on the contact sheets and in S, SE, E, N on the move sheets.
- Fixed: a ring of gold dots (the Floor Keeper's halo) was leaking onto all three from the shared build script, and a keeper crown with it. Removed.
- Fixed: the frog's landing lunge was cut off at the bottom of the frame. The hop and landing are now 0.3 tile instead of 0.45, and the feet sit at y 118 instead of 131. No frame in any of the three touches the frame edge.
- Fixed: the frog's crouch pitched its back end 9 px below the ground line when it faced away. Pitch and shift were cut; what is left (4 to 5 px, a squash spreading toward the camera) is not a float.
- Fixed in the previews: every cell shares one ground line and the lineup has no blank gap.
- Red check on all body / glow / light sheets: 0 red pixels. Red appears only in the preview telegraph tint (purple for the wave). Phone and house number check on the folder: no hits. Temp files, `.blend1` files and frames/ folders removed.

**DECIDE:**
1. **Side Crab colour.** The data colour is red-orange `#d0603f`. Red is only for danger and orange only for ENTER THE TOWER, so the shell is slate-teal and only the claws are warm sand (`#eadfb4`). OK, or change the data colour to a teal?
2. **Splash Wave foam cap.** The foam cap and curl sit a little above the eyes, as part of its body (like the Pebble Pal's lump), not an add-on above the head. OK, or flatten it?
3. **Frog hop.** I added an optional 5-frame `leap` (the hop arc) between the wind-up and the landing; the data has no hop. Keep it, or drop it and let the game slide the wind-up sprite?
4. **Frame size.** All three use 160 px frames (80 px per tile), like the Goat and Roller. OK for the Programmer? They should read the size from each sprite's json.
5. **Side-walk.** The crab has no side-step art yet: the move set is facing-relative, so the game turns it to face the player and plays the walk along its side. OK, or a true sideways-facing walk with the body fixed?
6. **Crab guard.** The data has guard 20. The wind-up claw-up pose can double as the guard pose; or should I make a separate "claw up and shut" pose? (The glow or shield, if any, is drawn by the game.)
7. **Mist Wisp.** R-G2B-33 lists four Blue enemies. Only three are in the samples (frog, crab, wave); the Mist Wisp is left for the full set. OK?
8. **Wave lane.** The plan says the Splash Wave's lane is "drawn as a wave". The preview uses the house purple-striped dash lane, because the lane is game-drawn from `incoming-art/dash-telegraph`. Do you want a wave-patterned lane variant made as its own item, or is the stripe lane fine?

**NEXT:** after your answers: full sets (move, hit, defeat "set free") for all three, the Mist Wisp, and a sideways crab walk if wanted. Then R-G2B-34.
