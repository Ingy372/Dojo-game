# Bestiary Red: Anvil Imp, Bellows Puff, Forge Sweeper (R-G2B-34, SAMPLES, WORKING)

Three Red-belt ("The Forge of Courage") enemies from `drafts/planning/R-GREEN-TO-BLACK.md` (R-G2B-34). One model render each: idle, wind-up and attack in 8 directions. Not full sets: no move, hit or defeat animation yet. The Coal Cub is left for the full set. Same rig, eye style, layers (body / glow / telegraph / light), render script and camera as Blue. Nothing is imported into the game.

| Folder | Data file | Look | Shape | Colours |
|---|---|---|---|---|
| `anvil-imp/` | `drafts/content/enemies/anvil-imp.json` | a small grey round imp: bear-like ears, pale belly and muzzle, leather apron, soft wooden mallet with leather end caps in the right hand | small, round | grey `#7a8494`, belly `#b4bdca` (data `#8a8f99`), leather and wood browns |
| `bellows-puff/` | `bellows-puff.json` | four soft leather folds on a wooden board, small light top board, iron nozzle in front, rear handle, wooden paddle hands, cream googly eyes | wide, squat drum | tan `#b98e57`, wood `#7a573a` (data colour is red-orange `#c46a4a`: not used, see the Delivery Note) |
| `forge-sweeper/` | `forge-sweep.json` (the data id is `forge-sweep`) | a hearth broom with a face: straw bristle block, wood head-board, rope band, round handle body with arms; seven gold bristle tips glow warm | very wide, flat | straw `#a07a4a` / `#d4b064`, gold `#f2cb62` (data colour is amber `#e0a03a`: not used, see the Delivery Note) |

No teeth, points or spikes. No red or orange in any sprite (red is only the game-tinted telegraph layer, shown red in the previews; the Forge Sweeper's is shown house purple `#8a4fe6`, because it is dash-only). Glow sources: the sweeper's gold bristle tips; the imp and puff have only the soft rim.

## What was made
- Idle (8 frames), wind-up and attack in 8 directions, 4 layers each, 160 px frames at `--ortho 2.0`, `--anchor-y 0.74` (feet at y 118 of 160).
- Frame counts: imp wind-up 9 / attack 11; puff 10 / 12; sweeper 11 / 17 (data wind-ups 18, 20, 22 ticks; recovers 18, 20, 24).
- **Anvil Imp (COUNTER).** Wind-up: lifts the mallet to head height beside its head and trembles. Attack: a quick bonk down in front.
- **Bellows Puff (push).** Wind-up: swells up fat with the paddles out. Attack: squashes forward and puffs. The gust arrow is drawn by the game.
- **Forge Sweeper (dash-only arc).** Wind-up: turns away and leans back. Attack: a 5-frame sweep (about 140 degrees), then a recover. The purple arc and '!!' are drawn by the game (`incoming-art/dash-telegraph`).

## Previews (`preview/`)
- `lineup.png`: the three next to the player, Swarmer, Shield Guard, Brute, Floor Keeper and Pebble Pal on one ground line, in-game size (x0.6), 1x and 2x.
- `<enemy>_moves.png`: player, Brute, idle, wind-up (last frame) and attack (impact) in S, SE, E, N at 2x.
- `forge-sweeper_arc.png` / `.gif`: the wind-up inside the purple dash arc with the '!!' at the game's tile size, south- and east-facing.

## Rebuild (repo root; at most 2 Blender at once)
    blender -b -P incoming-art/bestiary-red/source/build_red.py -- --enemy anvil-imp --out incoming-art/bestiary-red/source/br_anvil-imp.blend
    blender -b incoming-art/bestiary-red/source/br_anvil-imp.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-red/anvil-imp/sprites --name anvil-imp --size 160 --ortho 2.0 --anchor-y 0.74 --anims idle,windup,attack
    # bellows-puff, forge-sweeper: same (always render ALL the anims; a partial list overwrites the json)
    python3 incoming-art/bestiary-red/source/make_red_lineup.py   # also: lineup | moves | arc

`source/build_red.py` is built from the Blue build script with the three new types.

## Grounding
Idle is constant per direction. The attack lunges toward the camera are ground travel (the imp, puff and sweeper stay on the shared ground line), not floating. The imp's mallet rests on the ground in front of it, so it reads lower on screen. No frame touches the edge of its 160 px frame.
