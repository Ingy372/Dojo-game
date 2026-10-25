# Bestiary set 2: Shellback Snail, Vine Sweeper, Pebble Pal (WORKING, waiting for the Manager, then Jay)

The next three entries in `drafts/content/enemies/bestiary-plan.md` that are not drawn yet (after the sample three, set 1
and the tier 3 Orange enemies). Same look and pipeline as set 1: same rig, eyes, layers (body / glow / telegraph / light),
defeat, render script, camera (`--size 128 --ortho 1.6`), 8 directions and sheet layout. Nothing is imported.

| Folder | Plan entry | Data file | Look | Shape | Colours (body / rim) |
|---|---|---|---|---|---|
| `shell-snail/` | Shellback Snail (Yellow) | `shell-snail.json` | plum snail with a big round caramel shell and a cream spiral, raised head, short feelers at head level, round friendly eyes and cheeks | long low foot + round shell | plum `#4a3a5c` (belly `#6a5680`), shell caramel `#c98d5b` (data colour), peach rim `#ffcf9a` |
| `vine-sweeper/` | Vine Sweeper (Yellow) | `vine-sweeper.json` | wide leafy tangle with vine loops, flat leaves lying on top, roots, two long low vine arms with leaf tips, friendly eyes | wide low tangle with long arms | deep blue-teal `#1c3a52` (belly `#2a5670`), vines teal-blue `#2f8fa6`, ice-blue rim `#9fe0f5` (the data colour `#3f8a4f` was moved to teal-blue on the Manager's review, to stand apart from the Thorn Sprout) |
| `pebble-pal/` | Pebble Pal (Green) | `pebble-pal.json` | small flat speckled pebble with a moss patch at the back, big round eyes | small flat oval | stone `#6e655c` / `#9c8f7e` (data colour), speckles `#b8ad9c`, moss `#7fa35a`, periwinkle rim `#b8c8ff` |

All feelers, leaves and moss stay at or below head height. No red anywhere except the telegraph layer (neutral white; the game tints it).

## Animations (all 8 directions)
| | idle | move | windup (= telegraphTicks) | attack (= recoverTicks) |
|---|---|---|---|---|
| Shellback Snail | slow breathing sway, feelers bob | slow glide on the foot | draws the head back, 20 ticks | head-bump forward, 18 ticks |
| Vine Sweeper | vines sway | shuffles on its roots | twists back (yaw -60), 28 ticks, `dashOnly` | 150 degree sweep (no arc angle set in the plan or data) with both arms over 5 frames, then recovers, 24 ticks |
| Pebble Pal | little hops | hops forward | crouch, 14 ticks | forward pounce, 16 ticks |

Extra: `shell-snail` also has a looping `hide` anim (pulls into the shell, eyes peek out on frames 3-4). See DECIDE.

## Files
- Art ids (folders, sprite names, `--enemy`): `shell-snail`, `vine-sweeper`, `pebble-pal` (match the data files).
- `<enemy>/sprites/` sheets + JSON (same format as set 1).
- `source/build_set2.py` (copy of `bestiary-set1/source/build_set1.py` with the three new types), `source/bs2_<enemy>.blend`.
- `source/make_set2_lineup.py` -> `preview/lineup.png` (player, Tier 1, sample, set 1, tier 3 Orange sample, set 2; 1x and 2x).
  Rolling Pin / Doughling are added automatically when `tier3-orange-enemies/` is on main (PR #244, not merged yet).
- `preview/<enemy>/` contact sheets and GIFs for idle, move, windup, attack (+ hide for the snail).

## Rebuild (repo root)
    blender -b -P incoming-art/bestiary-set2/source/build_set2.py -- --enemy shell-snail --out incoming-art/bestiary-set2/source/bs2_shell-snail.blend
    blender -b incoming-art/bestiary-set2/source/bs2_shell-snail.blend -P incoming-art/tools/render_sprites.py -- \
        --out incoming-art/bestiary-set2/shell-snail/sprites --name shell-snail --size 128 --ortho 1.6 --anims idle,move,windup,attack,hide
    python3 incoming-art/tools/make_creature_preview.py --sheets incoming-art/bestiary-set2/shell-snail/sprites --out incoming-art/bestiary-set2/preview/shell-snail
    python3 incoming-art/bestiary-set2/source/make_set2_lineup.py --out incoming-art/bestiary-set2/preview/lineup.png
