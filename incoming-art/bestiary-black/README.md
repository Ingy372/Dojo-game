# Bestiary Black: Storm Wisp, Rumble Brute, Sky Sweeper (R-G2B-38, SAMPLES, WORKING)

Three Black enemies from `drafts/planning/R-GREEN-TO-BLACK.md` (R-G2B-38). One model render each: idle, wind-up and attack in 8 directions. Not full sets: no move, hit or defeat animation yet. **Echo Knight is left for the full set** (it mixes three tells and needs a shield-shine and a copy effect). Same rig, eye style, layers (body / glow / telegraph / light), render script and camera as Blue, Red, Red/Black, Brown and Brown/Black (#429, #432, #435, #436, #438). Nothing is imported into the game.

| Folder | Data file | Look | Shape | Colours |
|---|---|---|---|---|
| `storm-wisp/` | `drafts/content/enemies/storm-wisp.json` | a small slate storm cloud that floats: big eyes in sockets, pink cheeks, a smile, side puffs, tiny hands, a curling cloud tail and a small yellow zig-zag bolt at its side. No feet | small, round | slate `#8c96b0` (matches data), bolt yellow |
| `rumble-brute/` | `rumble-brute.json` | a big, soft thundercloud-bellied brute: a ring of cloud-scarf puffs, a belly patch with a yellow bolt, thick arms with cloud mitts, dark stubby feet, big eyes, a smile | wide, heavy | dark slate `#4d5466` (matches data), bolt yellow |
| `sky-sweeper/` | `sky-sweeper.json` | a periwinkle ball with a gold sash and a skirt of five flat cloth ribbons of uneven length, set round the sides and back and bent one way (pale cloth; three long forked swallow-tail ends with a blue stripe, two short plain square-cut), a straw broom in one hand and a paper lantern on a cord in the other, big eyes, a smile. No feet | tall, light | periwinkle `#9fb4e8` (matches data), straw and gold, lantern |

No teeth, points or spikes. No red or orange in any sprite. The telegraph layer is neutral white and is tinted by the game: red for the Storm Wisp and the Rumble Brute, and house purple `#8a4fe6` for the dash-only Sky Sweeper.

## What was made
- Idle (8 frames), wind-up and attack in 8 directions, 4 layers each, 160 px frames at `--ortho 2.0`, `--anchor-y 0.74` (feet at y 118 of 160).
- Frame counts (Storm Wisp / Rumble Brute / Sky Sweeper): wind-up 7 / 8 / 10, attack 10 / 11 / 22.
- **Storm Wisp (crackle).** Wind-up: it fluffs up and shivers, hands out. Attack: a quick forward zap-squash. The yellow bolt is its glow source. The red circle is drawn by the game.
- **Rumble Brute (rumble slam).** Wind-up: both arms rise to chest height and tremble. Attack: a soft cloud-mitt slam forward. The belly bolt patch is its glow source. The red circle (area radius 0.95) is drawn by the game.
- **Sky Sweeper (dash-only, arc then lane).** Wind-up: it turns and holds the broom out; the tell is house purple. Attack: the sweep (frames 0-4, tag `sweep`), a short gap (5-6), then the thrust (7-9, tag `lane`), then recover. The purple arc, lane and '!!' are drawn by the game from `incoming-art/dash-telegraph`. The paper lantern is its glow source.

## Previews (`preview/`)
- `lineup.png`: the three next to the player, Swarmer, Shield Guard, Brute, Floor Keeper and Pebble Pal on one ground line, in-game size (x0.6), 1x and 2x.
- `<enemy>_moves.png`: player, Brute, idle, wind-up (last frame) and attack in S, SE, E, N at 2x. The Sky Sweeper sheet shows both the sweep and the thrust.
- `sky-sweeper_arc_lane.png` / `.gif`: the wind-up, the sweep with the purple arc, and the thrust with the purple lane and '!!', at the game's tile size (drawn with the real `dash-telegraph` art).

## Rebuild (repo root; at most 2 Blender at once)
    blender -b -P incoming-art/bestiary-black/source/build_black.py -- --enemy storm-wisp --out incoming-art/bestiary-black/source/bn_storm-wisp.blend
    blender -b incoming-art/bestiary-black/source/bn_storm-wisp.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-black/storm-wisp/sprites --name storm-wisp --size 160 --ortho 2.0 --anchor-y 0.74
    # rumble-brute, sky-sweeper: same (always render ALL the anims; a partial list overwrites the json)
    python3 incoming-art/bestiary-black/source/make_bk_lineup.py   # lineup, moves and arc/lane

`source/build_black.py` is built from the Brown/Black build script with the three new types. The `.blend` files are not kept; the script rebuilds them.

## Grounding
Idle is constant per direction. The Storm Wisp and Sky Sweeper float on purpose (no feet); the game draws their shadows. The Rumble Brute stands on two stubby feet. No frame touches the edge of its 160 px frame.

## Decided (Nov 2, 2026)
Samples, the Sky Sweeper arc-then-lane and purple tell, floating, the Rumble Brute slam and the Storm Wisp crackle: all OK. Sky Sweeper's streamers get a second pass: now flat cloth ribbons with square or forked ends and a stripe (no rounded tips, taper or curl). A third and fourth pass cut them to 5 uneven ribbons that bend gently one way and flutter a little per frame (idle, wind-up, attack). See `DELIVERY_NOTE.md`.
