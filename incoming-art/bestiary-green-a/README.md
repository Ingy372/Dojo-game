# Bestiary Green A: Cliff Goat, Stack Golem, Boulder Roller (G2B-08, SAMPLES, WORKING)

Three Green-belt ("The Giant's Steps") enemies from `drafts/planning/R-GREEN-TO-BLACK.md` (G2B-08). One model render each, with idle and the key move or telegraph. Not full sets: no move, hit or defeat animation yet. Same rig, eye style, layers (body / glow / telegraph / light), render script and camera as set 1 and set 2. Nothing is imported into the game.

| Folder | Data file | Look | Shape | Colours |
|---|---|---|---|---|
| `cliff-goat/` | `drafts/content/enemies/cliff-goat.json` | slate-blue goat with cream curled horns, floppy ears, a beard and tail tuft, small dark hooves | long and low, horns at head level | body `#3b4c6b` / belly `#566b90`, horns and tuft `#e6dcc4` (data colour is pale `#d8d2c4`, see DECIDE) |
| `stack-golem/` | `stack-golem.json` | a tower of four rounded stones (the 5- and 3-stone versions are idle-only variants) with moss on the ledges, a dark face patch, soft stone fists | tall and narrow | warm greys, moss green, mint rim |
| `boulder-roller/` | `boulder-roller.json` | a small porter behind a big chipped boulder, a forehead work-band tied at the back, cheeks, mitts | round head over a big round boulder | umber body `#5c473b`, boulder `#8b7355` (data colour), band `#d9b36a` |

All shapes are soft and rounded, no teeth, claws or sharp points. Nothing sits above the head. No red in any sprite (red is only the game-tinted telegraph layer, shown red in the previews; the Boulder Roller's is shown house purple `#8a4fe6`).

## What was made
- Idle (8 frames, 10 for the golem), wind-up and attack in 8 directions, 4 layers each, at the game's 80 px per tile.
  - Goat and Roller: 160 px frames at `--ortho 2.0`. Golem: 128 px at `--ortho 1.6`. (Bigger frames, as the Brute has 208, so the lunges are not cut off.)
  - Wind-up lengths match the data: goat 20 ticks (10 frames), golem 20 ticks (10 frames), Roller 24 ticks (12 frames, `dashOnly`).
- Stack Golem shrink: `stack-golem/sprites` is the 4-stone golem (build default, full idle, wind-up, attack). `stack-golem/stones-5` and `stones-3` are idle-only variants. The strip shows 5 (full), 4, 3. The game swaps the sprite as stones fall off (one per hit you land).

## Previews (`preview/`)
- `lineup.png`: the three next to the player, Swarmer, Shield Guard, Brute, Floor Keeper and Pebble Pal on one ground line, in-game size (x0.6), 1x and 2x.
- `<enemy>_moves.png`: player, Brute, idle, wind-up (last frame) and attack (impact) in S, SE, E, N at 2x.
- `boulder-roller_lane.png` / `.gif`: the Roller's wind-up beside the house purple-striped dash lane and the '!!' at the game's tile size. The lane and '!!' are drawn by the game (`incoming-art/dash-telegraph`); the sprite only gives the wind-up pose and a neutral white telegraph layer to tint purple.
- `stack-golem_stones.png`: 5, 4 and 3 stones.
- `<enemy>/`: 8-direction contact sheets and GIFs for idle, windup and attack.

## Rebuild (repo root; at most 2 Blender at once)
    blender -b -P incoming-art/bestiary-green-a/source/build_green_a.py -- --enemy cliff-goat --out incoming-art/bestiary-green-a/source/bga_cliff-goat.blend
    blender -b incoming-art/bestiary-green-a/source/bga_cliff-goat.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-green-a/cliff-goat/sprites --name cliff-goat --size 160 --ortho 2.0 --anims idle,windup,attack
    # boulder-roller: same, --size 160 --ortho 2.0.  stack-golem: --size 128 --ortho 1.6  (--stones 3|4|5 on the build step; default 4)
    python3 incoming-art/tools/make_creature_preview.py --sheets incoming-art/bestiary-green-a/cliff-goat/sprites --out incoming-art/bestiary-green-a/preview/cliff-goat
    python3 incoming-art/tools/make_creature_preview.py --sheets incoming-art/bestiary-green-a/boulder-roller/sprites --out incoming-art/bestiary-green-a/preview/boulder-roller --tele-tint '#8a4fe6'
    python3 incoming-art/bestiary-green-a/source/make_green_a_lineup.py lineup   # also: moves | stones | lane

`source/build_green_a.py` is built from the set 2 build script with the three new types, extra bones (`top` for the golem's upper stones, `prop` for the boulder) and a `--stones` option.
