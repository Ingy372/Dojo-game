# Bestiary set 1: Lantern Moth, Buzzy Bee, Thorn Sprout (WORKING, waiting for the Manager, then Jay)

The first three entries in `drafts/content/enemies/bestiary-plan.md` after the #207 sample (Wick Wisp, Dust Bunny,
Sleepy Sentry) and the existing Tier 1 enemies. Same look as #207 v2: same rig, eyes, layers (body / glow / telegraph /
light), defeat, render script, camera (`--size 128 --ortho 1.6`), 8 directions and sheet layout. Nothing is imported.

| Folder | Plan entry | Data file | Look | Shape | Colours (body / rim) |
|---|---|---|---|---|---|
| `moth/` | Lantern Moth (White, ranged) | `lantern-moth.json` | soft fuzzy moth, wide wings with a pale spot, short feathery antennae swept to the sides | wide "bow" of wings | navy `#24406e` / lilac `#e8c9f0` (data colour) |
| `bee/` | Buzzy Bee (Yellow, swarm) | `buzz-bee.json` | small round honey bee, two soft dark stripes, dark face patch with glowing eyes, round tail nub (no stinger), small pale wings | small egg | honey `#c98a1e` / sky `#bfe6ff` |
| `sprout/` | Thorn Sprout (Yellow, turret) | `thorn-sprout.json` | grumpy green bulb with a closed bud, rounded nubs (no points), two side leaves, sitting in a soil mound with roots | bulb in a mound | deep green `#2f5a3a` / lime `#c8ec8a`, leaves `#6fae4a` (data colour) |

Sample three for comparison: tall flame (violet / gold), wide fluffball (mauve / pink), square block (slate / teal).
All wings, leaves and antennae stay at the sides, at or below head height. No red anywhere except the telegraph layer.

## Animations (all 8 directions)
| | idle | move | windup (= telegraphTicks) | attack (= recoverTicks) |
|---|---|---|---|---|
| Moth | slow flutter + hover, 8 f @ 10 fps | flutter flight, wings flap | rears back, wings raised, 18 ticks | wing sweep forward = the toss, 20 ticks |
| Bee | busy buzz, 6 f @ 12 fps | leans forward, fast wing beats | short hover drawing back, 14 ticks | quick stretchy zip forward, 16 ticks |
| Sprout | grumpy sway, 8 f @ 8 fps | wiggle in place (speed 0, rooted) | puffs its cheeks (bulb swells), 18 ticks | leans forward = seed spit, 20 ticks |

The glow pebble, the seed and their landing circles are drawn by the game, not in these sheets.

## Files
- `<enemy>/sprites/` sheets + JSON (same format as `bestiary-sample/`).
- `source/build_set1.py` (copy of `bestiary-sample/source/build_sample.py` with the three new types), `source/bs1_<enemy>.blend`.
- `source/make_set1_lineup.py` -> `preview/lineup.png` (player, Tier 1, the sample three, the new three; 1x and 2x).
- `preview/<enemy>/` contact sheets and GIFs for idle, move, windup, attack.

## Rebuild (repo root)
    blender -b -P incoming-art/bestiary-set1/source/build_set1.py -- --enemy moth --out incoming-art/bestiary-set1/source/bs1_moth.blend
    blender -b incoming-art/bestiary-set1/source/bs1_moth.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-set1/moth/sprites --name moth --size 128 --ortho 1.6 --anims idle,move,windup,attack
    python3 incoming-art/tools/make_creature_preview.py --sheets incoming-art/bestiary-set1/moth/sprites --out incoming-art/bestiary-set1/preview/moth
    python3 incoming-art/bestiary-set1/source/make_set1_lineup.py --out incoming-art/bestiary-set1/preview/lineup.png
