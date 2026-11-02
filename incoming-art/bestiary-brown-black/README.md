# Bestiary Brown/Black: Gust Sprite, Thunder Drum, Zap Kite (R-G2B-37, SAMPLES, WORKING)

Three Brown/Black enemies from `drafts/planning/R-GREEN-TO-BLACK.md` (R-G2B-37). One model render each: idle, wind-up and attack in 8 directions. Not full sets: no move, hit or defeat animation yet. **Cloud Puff is left for the full set** (it splits into the Cloudlet and needs a split effect). Same rig, eye style, layers (body / glow / telegraph / light), render script and camera as Blue, Red, Red/Black and Brown (#429, #432, #435, #436). Nothing is imported into the game.

| Folder | Data file | Look | Shape | Colours |
|---|---|---|---|---|
| `gust-sprite/` | `drafts/content/enemies/gust-sprite.json` | a small pale-blue cloud that floats: big yellow-cream eyes in dark sockets, pink cheeks, a round "o" mouth, two puff hands, a curling little tail and soft white swirl lines. No feet | small, round | blue `#a9c6d8` (matches data), belly `#e6f1f8`, glow `#e8f6ff` |
| `thunder-drum/` | `thunder-drum.json` | a friendly purple drum: cream drum-skin top with a yellow lightning bolt and cream studs, gold hoops and lugs, big eyes in sockets, a smile, two small felt feet, two arms holding drumsticks | wide, squat | purple `#7a5a9e` (matches data), skin `#f1e6c8`, gold `#d9b84a` |
| `zap-kite/` | `zap-kite.json` | a rounded yellow diamond kite that floats: a lighter face panel, big eyes in sockets, cheeks, a smile, a soft zig-zag cream tail with blue bows, two blue streamer arms. No feet | tall, light | yellow `#f0d040` (matches data), rim `#c9a022`, tail `#fbe98a` |

No teeth, points or spikes (the kite's corners are rounded). No red or orange in any sprite. The telegraph layer is neutral white and is tinted by the game: red for the Thunder Drum, **pale blue `#a9c6d8` for the Gust Sprite** (its push does no damage; shown pale in the previews), and house purple `#8a4fe6` for the dash-only Zap Kite.

## What was made
- Idle (8 frames), wind-up and attack in 8 directions, 4 layers each, 160 px frames at `--ortho 2.0`, `--anchor-y 0.74` (feet at y 118 of 160).
- Frame counts: Gust Sprite wind-up 10 / attack 12; Thunder Drum 10 / 16; Zap Kite 10 / 14 (data wind-ups 20, 20, 20 ticks; recovers 20, 20, 24).
- **Gust Sprite.** Wind-up: one full turn on the spot, arms wide. Attack: it leans in and puffs a gust forward. The pale gust arrow is drawn by the game; the sprite has no wind lines.
- **Thunder Drum.** Wind-up: the sticks go up and tremble. Attack: three beats, boom (frame 0), boom (frame 2), BOOM (frame 4, biggest), to match the three circles in a beat. The circles are drawn by the game. Tags: `beat1`, `beat2`, `impact`.
- **Zap Kite (dash-only, zig-zag lane).** Wind-up: it quivers and tilts, ready to dart. Attack: a quick dart forward. The purple zig-zag lane and '!!' are drawn by the game.

## Previews (`preview/`)
- `lineup.png`: the three next to the player, Swarmer, Shield Guard, Brute, Floor Keeper and Pebble Pal on one ground line, in-game size (x0.6), 1x and 2x.
- `<enemy>_moves.png`: player, Brute, idle, wind-up (last frame) and attack (impact) in S, SE, E, N at 2x.
- `zap-kite_lane.png` / `.gif`: the wind-up beside a purple-and-white zig-zag lane and '!!' at the game's tile size. The zig-zag lane does not exist in `dash-telegraph` yet, so the lane is a stand-in bent from the lane art.

## Rebuild (repo root; at most 2 Blender at once)
    blender -b -P incoming-art/bestiary-brown-black/source/build_bb.py -- --enemy gust-sprite --out incoming-art/bestiary-brown-black/source/bn_gust-sprite.blend
    blender -b incoming-art/bestiary-brown-black/source/bn_gust-sprite.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-brown-black/gust-sprite/sprites --name gust-sprite --size 160 --ortho 2.0 --anchor-y 0.74 --anims idle,windup,attack
    # thunder-drum, zap-kite: same (always render ALL the anims; a partial list overwrites the json)
    python3 incoming-art/bestiary-brown-black/source/make_bb_lineup.py   # lineup, moves and lane

`source/build_bb.py` is built from the Brown build script with the three new types. The `.blend` files are not kept; the script rebuilds them.

## Grounding
Idle is constant per direction. The Gust Sprite and Zap Kite float on purpose (no feet); the game draws their shadows. The Thunder Drum stands on two felt feet. The Zap Kite's dart is ground travel along the lane. No frame touches the edge of its 160 px frame.
