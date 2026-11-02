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

**DECIDED (Jay's calls on #429, Nov 2, 2026):** all eight earlier questions are answered. No export.
1. **Side Crab colour: KEEP the slate-teal shell with sand claws.** **Follow-up for the Content Designer or Programmer:** update the crab's data colour in `drafts/content/enemies/side-crab.json` from the red-orange `#d0603f` to the teal `#3f7d86` (the sprite shell; the sand claws are `#eadfb4`) so the data matches the art. This is not done in this PR (only `incoming-art/` is touched).
2. **Splash Wave foam cap: KEEP** (part of the body, slightly above eye height).
3. **Frog `leap`: KEEP** (the optional 5-frame hop arc).
4. **160 px frames (feet at y 118): OK.** The Programmer reads the size and anchor from each sprite's json.
5. **Crab side-walk: facing-relative is OK.**
6. **Crab guard: the claw-up wind-up pose is the guard pose.** No separate pose.
7. **Mist Wisp: waits for the full set.**
8. **Wave lane: keep the house purple stripes.** No wave-patterned lane.

**DECIDE:** nothing open on this PR.

**NEXT:** full sets (move, hit, defeat "set free") for all three, the Mist Wisp, (the crab uses the facing-relative walk). Content Designer or Programmer: the crab data colour (see DECIDED 1).
