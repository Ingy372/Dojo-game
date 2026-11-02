# Bestiary Brown: Page Flutter, Bookworm, Root Snapper (R-G2B-36, SAMPLES, WORKING)

Three Brown-belt enemies from `drafts/planning/R-GREEN-TO-BLACK.md` (R-G2B-36). One model render each: idle, wind-up and attack in 8 directions. Not full sets: no move, hit or defeat animation yet. **Ink Blot is left for the full set.** Same rig, eye style, layers (body / glow / telegraph / light), render script and camera as Blue, Red and Red/Black (#429, #432, #435). Nothing is imported into the game.

| Folder | Data file | Look | Shape | Colours |
|---|---|---|---|---|
| `page-flutter/` | `drafts/content/enemies/page-flutter.json` | a flat rounded cream page that floats: yellow eyes in dark sockets, peach cheeks, a smile, three brown ink lines, a dog-eared corner, two small page wings with tan tips. No feet | small, flat | cream `#efe6cf` (matches data), tan `#c9a870`, glow `#fff3c8` |
| `bookworm/` | `bookworm.json` | a friendly green worm rising from a soil mound: three segments and a head, round brown glasses, a small book held in its mitts | small, upright | green `#9bbf5a` (matches data), belly `#d9e8a6`, glasses `#6b4a2b`, book `#a7743f` |
| `root-snapper/` | `root-snapper.json` | a squat friendly stump: cut-wood top with growth rings and a moss patch, a lighter face patch, two root arms with knobs and leaf sprouts, root feet | wide, squat | wood `#7b5a38` (data colour `#6b4a2b`), bark `#5a3d24`, face `#c9a06a`, moss `#6aa04a` |

No teeth, points or spikes. No red or orange in any sprite (red is only the game-tinted telegraph layer, shown red in the previews; the Root Snapper's is shown house purple `#8a4fe6`, because it is dash-only).

## What was made
- Idle (8 frames), wind-up and attack in 8 directions, 4 layers each, 160 px frames at `--ortho 2.0`, `--anchor-y 0.74` (feet at y 118 of 160).
- Frame counts: Page Flutter wind-up 7 / attack 10; Bookworm 10 / 12; Root Snapper 10 / 14 (data wind-ups 14, 20, 20 ticks; recovers 16, 20, 24).
- **Page Flutter.** Wind-up: the wings beat fast and it rises (a rustle). Attack: a forward flap. The red circle is drawn by the game.
- **Bookworm.** Wind-up: squashes down into the mound while the mound heaves. Attack: pops up tall. The red circle is drawn by the game.
- **Root Snapper (dash-only, lane).** Wind-up: leans back with the root arms pulled back and up, trembling. Attack: a soft root slam. The purple lane and '!!' are drawn by the game.

## Previews (`preview/`)
- `lineup.png`: the three next to the player, Swarmer, Shield Guard, Brute, Floor Keeper and Pebble Pal on one ground line, in-game size (x0.6), 1x and 2x.
- `<enemy>_moves.png`: player, Brute, idle, wind-up (last frame) and attack (impact) in S, SE, E, N at 2x.
- `root-snapper_lane.png` / `.gif`: the wind-up with the house lane and '!!' at the game's tile size.

## Rebuild (repo root; at most 2 Blender at once)
    blender -b -P incoming-art/bestiary-brown/source/build_brown.py -- --enemy page-flutter --out incoming-art/bestiary-brown/source/bn_page-flutter.blend
    blender -b incoming-art/bestiary-brown/source/bn_page-flutter.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-brown/page-flutter/sprites --name page-flutter --size 160 --ortho 2.0 --anchor-y 0.74 --anims idle,windup,attack
    # bookworm, root-snapper: same (always render ALL the anims; a partial list overwrites the json)
    python3 incoming-art/bestiary-brown/source/make_brown_lineup.py   # lineup, moves and lane

`source/build_brown.py` is built from the Red/Black build script with the three new types. The `.blend` files are not kept; the script rebuilds them.

## Decided (Nov 2, 2026)
Ink Blot waits for the full set. The Root Snapper data colour follows the art, `#7b5a38` (follow-up note in `DELIVERY_NOTE.md`, no data edit here). Page Flutter floats with no feet: OK. Bookworm: OK. The Root Snapper's soft root slam: OK.

## Grounding
Idle is constant per direction. Page Flutter floats on purpose (it has no feet); the game draws its shadow. The Bookworm rises from its own mound. The Root Snapper's slam is ground travel, not floating. No frame touches the edge of its 160 px frame.
