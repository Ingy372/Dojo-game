# Walk rework: arm-only samples (player, body A)

Samples A, B and C (new legs) are dropped: Jay keeps the current walk. These samples keep the current walk's legs
exactly and change only the arms.

- `source/arms.py`: rewrites only the `hand_ik.L` / `hand_ik.R` location keys of the rig's `walk` action (`ARMS=1|2|3`)
  and stops if any other curve changed (`LEGS_IDENTICAL True` in the log). Run it in front of the normal renderer:

      ARMS=1 blender -b incoming-art/player-custom/source/player_custom_a.blend \
          -P incoming-art/walk-rework/source/arms.py -P incoming-art/tools/render_sprites.py -- \
          --out $PWD/incoming-art/walk-rework/arms-1/sprites --name player-a --anims walk --height 160 --anchor-y 0.856

  For body B, use `player_custom_b.blend` with `--name player-b`.
- `arms-1|2|3/sprites/`: the full walk layer sheets + JSON (same 128 × 160 frames, 10 frames, 30 fps, ground motion).
- `source/make_walk_compare.py`: current vs sample GIF + strip.
- `source/restore_eyes.py`, `source/make_eyes_before_after.py`: the eye undo (see `DELIVERY_NOTE.md`).
