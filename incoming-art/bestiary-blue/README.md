# Bestiary Blue: Puddle Frog, Side Crab, Splash Wave (R-G2B-33, SAMPLES, WORKING)

Three Blue-belt ("The Quiet River") enemies from `drafts/planning/R-GREEN-TO-BLACK.md` (R-G2B-33). One model render each: idle, wind-up and attack (the frog also has a hop). Not full sets: no move, hit or defeat animation yet. Same rig, eye style, layers (body / glow / telegraph / light), render script and camera as set 1, set 2 and Green A. Nothing is imported into the game.

| Folder | Data file | Look | Shape | Colours |
|---|---|---|---|---|
| `puddle-frog/` | `drafts/content/enemies/puddle-frog.json` | a round pond frog: wide soft body, flat head with two low eye bumps, cream chin, folded back legs with webbed feet, little front hands, darker spots, a gentle smile | squat and round | body `#4a9c68` (data `#4fa36b`), chin `#d3ebc8`, spots `#2f7049` |
| `side-crab/` | `side-crab.json` | a wide river crab: low oval shell, lighter belly plate, big googly eyes, three rounded legs a side, one BIG rounded mitten claw and a smaller one | very wide and low | slate-teal `#3f7d86`, sand claws `#eadfb4` (data colour is red-orange `#d0603f`: decided to keep the teal; the data colour should be updated to `#3f7d86`, see the Delivery Note) |
| `splash-wave/` | `splash-wave.json` | a friendly mound of water with a soft foam cap and curl, little flippers, a ring of foam beads where it meets the ground | round and wobbly | water `#4e86d0` / `#8fc2f0`, foam `#f0f9ff` (data `#5b8fd1`) |

All shapes are soft and rounded: no teeth, pincers' points or spikes. Nothing sits above the head except the wave's foam cap, which is part of its body (decided: keep). No red in any sprite (red is only the game-tinted telegraph layer, shown red in the previews; the Splash Wave's is shown house purple `#8a4fe6`, because it is dash-only). Mood: calm blue and teal, in line with `drafts/content/lore/05-blue.md`.

## What was made
- Idle (8 frames), wind-up and attack in 8 directions, 4 layers each, at the game's 80 px per tile. All three: 160 px frames at `--ortho 2.0`, `--anchor-y 0.74` (the feet sit at y 118 of 160, so a lunge toward the camera has room below).
- Wind-up lengths match the data: frog 18 ticks (9 frames), crab 18 ticks (9 frames), wave 24 ticks (12 frames, `dashOnly`). Attack recover: 18 / 18 / 24 ticks.
- **Puddle Frog (hop).** Wind-up: a crouch that squashes wide and low with the eyes up. `leap` (5 frames, optional, extra): the hop arc towards the red landing circle, played between the wind-up and the attack. Attack: the landing, a wide squash (the splash and red circle are drawn by the game, the sprite has no water and no red).
- **Side Crab (guard and side-walk, claw snap).** Wind-up: the big claw is cocked high and back (the tell). Attack: the claw snaps forward across the front. The crab is built to walk sideways: the legs and claws are symmetric about its heading, so the game plays the walk facing-relative; the crab does not turn its body (the move sheet is a later item).
- **Splash Wave (dash-only lane).** Wind-up: it draws back and swells tall, trembling. Attack: it surges forward as a low long wave. The tell is house purple: the purple-striped lane and the '!!' are drawn by the game (`incoming-art/dash-telegraph`).

## Previews (`preview/`)
- `lineup.png`: the three next to the player, Swarmer, Shield Guard, Brute, Floor Keeper and Pebble Pal on one ground line, in-game size (x0.6), 1x and 2x.
- `<enemy>_moves.png`: player, Brute, idle, wind-up (last frame), (the frog's hop apex) and attack (impact) in S, SE, E, N at 2x.
- `splash-wave_lane.png` / `.gif`: the wave's wind-up beside the purple-striped dash lane and the '!!' at the game's tile size, east- and south-facing.
- `<enemy>/`: 8-direction contact sheets and GIFs for idle, windup and attack (the frog's folder has the hop too).

## Rebuild (repo root; at most 2 Blender at once)
    blender -b -P incoming-art/bestiary-blue/source/build_blue.py -- --enemy puddle-frog --out incoming-art/bestiary-blue/source/bb_puddle-frog.blend
    blender -b incoming-art/bestiary-blue/source/bb_puddle-frog.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-blue/puddle-frog/sprites --name puddle-frog --size 160 --ortho 2.0 --anchor-y 0.74 --anims idle,windup,leap,attack
    # side-crab, splash-wave: same, --anims idle,windup,attack (always render ALL the anims; a partial list overwrites the json)
    python3 incoming-art/tools/make_creature_preview.py --sheets incoming-art/bestiary-blue/puddle-frog/sprites --out incoming-art/bestiary-blue/preview/puddle-frog
    python3 incoming-art/tools/make_creature_preview.py --sheets incoming-art/bestiary-blue/splash-wave/sprites --out incoming-art/bestiary-blue/preview/splash-wave --tele-tint '#8a4fe6'
    python3 incoming-art/bestiary-blue/source/make_blue_lineup.py   # also: lineup | moves | lane

`source/build_blue.py` is built from the Green A / set 2 build script with the three new types.

## Grounding
Every frame is checked so the lowest body pixel stays on the shared ground line: idle is constant for each direction, the frog's hop leaves the ground only in the air frames (it lands on the same line), and the moves toward the camera in the attacks are ground travel, not floating. The frog's crouch spreads its haunches 4 to 5 px toward the camera when it faces away (N, NE); that is the squash, not a float. No frame touches the edge of its 160 px frame.
