# Bestiary Green A: Cliff Goat, Stack Golem, Boulder Roller (G2B-08, SAMPLES, WORKING)

Three Green-belt ("The Giant's Steps") enemies from `drafts/planning/R-GREEN-TO-BLACK.md` (G2B-08). One model render each: idle, wind-up and attack (the golem in three stone counts). Not full sets: no move, hit or defeat animation yet. Same rig, eye style, layers (body / glow / telegraph / light), render script and camera as set 1 and set 2. Nothing is imported into the game.

| Folder | Data file | Look | Shape | Colours |
|---|---|---|---|---|
| `cliff-goat/` | `drafts/content/enemies/cliff-goat.json` | slate-blue goat with two simple cream horns (one smooth rounded horn a side, a clean V from the front), floppy ears, a beard and tail tuft, small dark hooves | long and low, horns at head level | body `#3b4c6b` / belly `#566b90`, horns and tuft `#e6dcc4` (data colour is pale `#d8d2c4`; the body stays slate-blue, a Manager call on #427) |
| `stack-golem/` | `stack-golem.json` | a tower of rounded stones, rendered as full 5-, 4- and 3-stone sets (idle, wind-up and attack, 8 directions each) with moss on the ledges, a dark face patch, soft stone fists | tall and narrow | warm greys, moss green, mint rim |
| `boulder-roller/` | `boulder-roller.json` | a small porter behind a big chipped boulder, a plain forehead work-band (no knot, no gold), cheeks, mitts | round head over a big round boulder | umber body `#5c473b`, boulder `#8b7355` (data colour), plain band `#8d6f58` |

All shapes are soft and rounded, no teeth, claws or sharp points. Nothing sits above the head. No red in any sprite (red is only the game-tinted telegraph layer, shown red in the previews; the Boulder Roller's is shown house purple `#8a4fe6`).

## What was made
- Idle (8 frames, 10 for the golem), wind-up and attack in 8 directions, 4 layers each, at the game's 80 px per tile.
  - Goat and Roller: 160 px frames at `--ortho 2.0`. Golem: 128 px at `--ortho 1.6`. (Bigger frames, as the Brute has 208, so the lunges are not cut off.)
  - Wind-up lengths match the data: goat 20 ticks (10 frames), golem 20 ticks (10 frames), Roller 24 ticks (12 frames, `dashOnly`).
- Stack Golem shrink: three full sets, each with idle, wind-up and attack in 8 directions: `stack-golem/stones-5/sprites` (full, 5 stones), `stack-golem/sprites` (4 stones, the build default) and `stack-golem/stones-3/sprites` (3 stones). The game swaps between them as stones fall off (one per hit you land). All three use the same 128 px frame and anchor, so the swap does not move the feet.
- **Content call (not an art call):** how many stones the golem has on each floor band is a content decision. The placeholder is **3 stones on low floors, 4 on mid floors, 5 on high floors**. The art supports any of the three on any floor.

## Previews (`preview/`)
- `lineup.png`: the three next to the player, Swarmer, Shield Guard, Brute, Floor Keeper and Pebble Pal on one ground line, in-game size (x0.6), 1x and 2x.
- `<enemy>_moves.png`: player, Brute, idle, wind-up (last frame) and attack (impact) in S, SE, E, N at 2x.
- `boulder-roller_lane.png` / `.gif`: the Roller's wind-up beside the house purple-striped dash lane and the '!!' at the game's tile size. The lane and '!!' are drawn by the game (`incoming-art/dash-telegraph`); the sprite only gives the wind-up pose and a neutral white telegraph layer to tint purple.
- `stack-golem_stones.png`: 5, 4 and 3 stones side by side: idle, wind-up and attack, facing S and SE.
- `<enemy>/`: 8-direction contact sheets and GIFs for idle, windup and attack. The golem has three sets: `stack-golem/` (4 stones), `stack-golem-5-stones/` and `stack-golem-3-stones/`.

## Rebuild (repo root; at most 2 Blender at once)
    blender -b -P incoming-art/bestiary-green-a/source/build_green_a.py -- --enemy cliff-goat --out incoming-art/bestiary-green-a/source/bga_cliff-goat.blend
    blender -b incoming-art/bestiary-green-a/source/bga_cliff-goat.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-green-a/cliff-goat/sprites --name cliff-goat --size 160 --ortho 2.0 --anims idle,windup,attack
    # boulder-roller: same, --size 160 --ortho 2.0.  stack-golem: --size 128 --ortho 1.6  (--stones 3|4|5 on the build step; default 4; render stones 3 and 5 to stack-golem/stones-N/sprites)
    python3 incoming-art/tools/make_creature_preview.py --sheets incoming-art/bestiary-green-a/cliff-goat/sprites --out incoming-art/bestiary-green-a/preview/cliff-goat
    python3 incoming-art/tools/make_creature_preview.py --sheets incoming-art/bestiary-green-a/boulder-roller/sprites --out incoming-art/bestiary-green-a/preview/boulder-roller --tele-tint '#8a4fe6'
    python3 incoming-art/bestiary-green-a/source/make_green_a_lineup.py lineup   # also: moves | stones | lane

`source/build_green_a.py` is built from the set 2 build script with the three new types, extra bones (`top` for the golem's upper stones, `prop` for the boulder) and a `--stones` option.

## Grounding
Every frame is checked so the lowest body pixel stays on the shared ground line: the Roller's wind-up is constant per direction and equal to idle; the Cliff Goat's hind hooves are compensated for body pitch (`HIND_Y` in `build_green_a.py`); the Stack Golem's attack pitch is 5 deg. Moves toward the camera in the attack are ground travel, not floating.
The golem at 5, 4 and 3 stones was measured the same way (lowest body pixel within about 2 px of the anchor row in every frame) and none of the frames touches the edge of its 128 px frame, including the 5-stone topple.
