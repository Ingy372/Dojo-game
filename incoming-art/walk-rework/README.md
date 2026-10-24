# Walk rework samples (player, body A)

- `source/make_walk.py`: replaces the rig's `walk` action with sample A, B or C (`WALK_VARIANT`) and checks foot contact. Run it in front of the normal renderer:

      WALK_VARIANT=A blender -b incoming-art/player-custom/source/player_custom_a.blend \
          -P incoming-art/walk-rework/source/make_walk.py -P incoming-art/tools/render_sprites.py -- \
          --out $PWD/incoming-art/walk-rework/sample-A/sprites --name player-a --anims walk --height 160 --anchor-y 0.856

  For body B, use `player-custom/source/player_custom_b.blend` with `--name player-b`.
- `source/make_walk_compare.py`: current vs sample GIF + strip (`--old ../player-custom/sprites/body-a --new sample-A/sprites --dirs S,E,N,SE`). It handles 128 × 160 frames and draws one face and one hair (the shared `tools/make_compare.py` assumes square frames).
- `sample-A|B|C/sprites/`: the full walk layer sheets + JSON.
- See `DELIVERY_NOTE.md`.
