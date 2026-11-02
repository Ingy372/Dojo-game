# Delivery Note: bestiary Brown (R-G2B-36: Page Flutter, Bookworm, Root Snapper) SAMPLES

**ITEM:** R-G2B-36 from `drafts/planning/R-GREEN-TO-BLACK.md` (the Brown enemies: Page Flutter, Bookworm, Ink Blot, Root Snapper). Three samples only. Only `incoming-art/bestiary-brown/` is touched; no game code. Picked as the next free Artist item after G2B-35 (#435): it waits on nothing and had no branch, PR or folder. **Ink Blot is left for the full set** (it needs a floor puddle decal and a slow zone, and its navy sits close to the shadow family). Others free for later: G2B-37 (Brown/Black), G2B-38 (Black).

**WHAT:**
- Three model renders in the same pipeline as Green A, Blue, Red and Red/Black: idle, wind-up and attack in 8 directions, with the body / glow / telegraph / light layers. 160 px frames at the game's 80 px per tile, feet at y 118. No export into the game.
- Page Flutter: a flat, rounded cream page that floats, with yellow eyes in dark sockets, peach cheeks, a smile, three brown ink lines, a dog-eared corner and two small page wings with tan tips. Idle: floats and bobs, wings flutter, one blink. Wind-up: the wings beat fast and it rises, a rustle (7 frames, the tell). Attack: a forward flap.
- Bookworm: a friendly green worm rising from a soil mound (three segments and a head), round brown glasses, a small brown book held in its mitts. Idle: sways, one blink. Wind-up: it squashes down into the mound while the mound heaves (10 frames). Attack: it pops up tall.
- Root Snapper: a squat, friendly tree stump: a cut-wood top with growth rings and a moss patch, a lighter face patch, two root arms with knobs and leaf sprouts, and root feet. Dash-only: the wind-up leans back with the root arms pulled back and up, trembling (10 frames). The attack is a soft root slam (14 frames). The tell is house purple; the lane and '!!' are drawn by the game (`preview/root-snapper_lane.png` / `.gif`).
- Frame counts follow the data files: wind-up 7 / 10 / 10 frames (data wind-ups 14 / 20 / 20 ticks), attack 10 / 12 / 14 frames (recovers 16 / 20 / 24 ticks). Idle is 8 frames for all three.
- `preview/lineup.png`: the three at in-game size next to the player and existing enemies. `preview/<enemy>_moves.png`: player, Brute, idle, wind-up (last frame, telegraph tinted) and attack (impact) in S, SE, E, N. `preview/root-snapper_lane.png` / `.gif`: the wind-up with the house lane and '!!'.

**WHY:** Brown needs a floating leaf-like flapper, a mound-popping ambusher and a dash-only brawler that read apart at a glance: a flat pale page, a green worm half-buried, a wide brown stump. All are friendly, round, big-eyed shapes for a 6-year-old: no teeth, points or spikes. No red and no orange in any sprite: red is only the game-tinted telegraph layer (shown red for Page Flutter and Bookworm, house purple for the dash-only Root Snapper). Every glow has a source (the soft warm rim and the page glow); nothing is above a head.

**Second pass:** checked all three in 8 directions on the contact views and in S, SE, E, N at 2x on the move sheets.
- Fixed: the Bookworm's wind-up poked its body through the mound. It is now a squash into the mound (shorter, a little wider) while the mound heaves.
- Fixed: a thicker Page Flutter buried its face features; the thickness stays thin, only the width and height grew.
- Fixed: the Root Snapper's face was cramped and its mouth tiny. The face patch is larger, the eyes smaller and the mouth wider.
- Fixed: the Root Snapper's attack slam clipped three glow frames at the bottom edge (S view). The slam is softer, and a full re-render clips none.
- No frame touches the frame edge (0 clipped frames); idle is constant per direction.
- Red check on all body / glow / light sheets: 0 red pixels. Phone and house number check on the folder: no hits. Temp files, `.blend` / `.blend1` files and frames/ folders removed.

**DECIDED (Manager's calls on #436, Nov 2, 2026):** all five questions are answered. No export.
1. **Ink Blot waits for the full set.** The three samples stay Page Flutter, Bookworm and Root Snapper.
2. **The Root Snapper data follows the art.** **Follow-up for the Content Designer or Programmer** (not done in this PR; only `incoming-art/` is touched): in `drafts/content/enemies/root-snapper.json`, change the colour from `#6b4a2b` to `#7b5a38`.
3. **Page Flutter floating with no feet: OK.** The game draws its shadow.
4. **Bookworm: OK.**
5. **Root Snapper's soft root slam: OK.**

**DECIDE:** nothing open on this PR.

**NEXT:** full sets (move, hit, defeat "set free") for the three plus Ink Blot. Content Designer or Programmer: the Root Snapper data colour (DECIDED 2). Then G2B-37 (Brown/Black) and G2B-38 (Black).
