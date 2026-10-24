# A1 earned cosmetics: SAMPLES (body A, idle only)

Extra looks for the player that are earned and never bought (core-design section 13, J5). These are **samples for review**. Names, unlock rules and final colours are still open (see DECIDE in DELIVERY_NOTE.md).

## What's here
| Sample | Layer(s) in `sprites/body-a/player-a.json` | Tint |
|---|---|---|
| 1. Headband | `headband` | yes, multiply (neutral #f2f2f2 art) |
| 1. Hand wraps (pick one) | `wraps-cloth`, `wraps-leather`, `wraps-tiger` (group `wraps`) | no, the colours match the gear icons |
| 2. Gi trim | `gi-trim` (lapels, back collar, sleeve cuffs, trouser cuffs, jacket hem) | yes, multiply, so it works on any gi colour |
| 3. Soft aura | `aura-back` + `aura-front` in `sprites/body-a/aura.json` | yes, multiply |

- Frames match the player exactly: 128 × 160, anchor (64, 136.96), 8 directions, idle 8 frames at 8 fps, same row and column layout as `player-custom/sprites/body-a`.
- **Draw order:** aura-back, then the normal player layers (body, skin, gi, belt, face, hair, props), then gi-trim, headband, wraps, then aura-front. `source/cosm_lib.py: compose()` is the reference.
- The belt is untouched and stays its own layer. The trim never covers the belt.
- **Nothing goes above the head.** The headband sits on the forehead, and the aura fades out before the top of the head and is cut at the head's top row.
- **Reduced motion:** the aura is fine on frame 0 alone (no pulse, no motes). The other layers just follow the player animation.

## Previews (`previews/`)
- `sample-1-headband-wraps.png` / `.gif`: three kids, one wrap each, all 8 directions
- `sample-2-gi-trim.png`, `sample-2-gi-trim-before-after.png`, `sample-2-gi-trim.gif`: 5 gi colours with 5 belts
- `sample-3-aura.gif`, `sample-3-aura-directions.png`: three suggested aura tints
- `check-phone-1x.png` / `-2x.png` (true size), `check-greyscale-wraps.png`, `check-headband-all-hair.png` (all 12 hairstyles, front and back)

## Rebuild
```
blender -b player-custom/source/player_custom_a.blend -P cosmetics-a1/source/build_cosmetics.py -- --out /tmp/pc_a.blend
blender -b /tmp/pc_a.blend -P tools/render_sprites.py -- --out $PWD/cosmetics-a1/sprites/body-a --name player-a --height 160 --anchor-y 0.856 --anims idle --layers headband,wraps-cloth,wraps-leather,wraps-tiger,gi-trim
python3 cosmetics-a1/source/make_aura.py --anims idle
python3 cosmetics-a1/source/make_cosmetics_preview.py
```
The aura is made from the player's own silhouette frames, so `make_aura.py --anims idle,walk,...` makes it for any animation. The other layers need `render_sprites.py` with more `--anims`, plus a body-B build.

## Known limits (for the full set)
- Body A only; body B needs the same build run on `player_custom_b.blend`.
- The headband is drawn over the hair. With big hair (hair-04 afro, hair-10) it sits on the hair from behind, which looks like a band worn over the hair.
- The gi-trim lapels are mostly hidden behind the guard fists in idle. The cuffs and hem carry the look, and the lapels show in other poses.
