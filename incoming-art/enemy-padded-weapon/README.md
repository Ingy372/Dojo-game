# Padded-weapon enemy (sample set)

A kid-safe shadow creature with a padded foam training staff, for the S4 weapon seals in PR #70. This is a sample set only: idle, wind-up (the tell) and attack, in 8 directions.

## Files
- `sprites/padded_<layer>_<anim>.png`: rows are 8 directions in the same order as Tier 1. `padded.json` has the frame data and the per-frame `telegraphIntensity`.
- Layers: `body`, `glow`, `telegraph`, `light`, and the new **`weapon`** layer (the staff by itself).
- Frame is **192 x 192** and the anchor (feet) is at **(96, 142)**. Tier 1 uses 160 and the Brute uses 208. The bigger frame gives the staff room.
- Draw order: telegraph, body, weapon, glow, light. This is the same as Tier 1 with weapon added after body.
- Telegraph: same as Tier 1. Tint the telegraph layer red, with strength from `telegraphIntensity` (it rises during the wind-up).
- **Disarmed:** stop drawing the `weapon` layer. The body looks right with empty mitts (see `preview/review-2-with-and-disarmed.png`).

## Rebuild
```
blender -b -P enemy-padded-weapon/source/build_padded.py -- --enemy padded --out $PWD/enemy-padded-weapon/source/padded.blend
blender -b enemy-padded-weapon/source/padded.blend -P tools/render_sprites.py -- --out enemy-padded-weapon/sprites --name padded --size 192 --ortho 2.4 --anchor-y 0.74 --anims idle,windup,attack
python3 tools/make_creature_preview.py --sheets enemy-padded-weapon/sprites --out enemy-padded-weapon/preview --with weapon
python3 enemy-padded-weapon/source/make_review.py
```
The move, hit, stagger and defeat poses are already in the build script. To render them later, add them to `--anims`.
