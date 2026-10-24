# Batch 9 - Yellow belt Tower kit (Bamboo Garden Hall)

Same format as `incoming-art/tower-rooms/` and `incoming-art/boss-door/`: `sprites/static.json` lists every sprite with `files`, `layers`, `size`, `anchorPx`, `frames`.

Rebuild (from `incoming-art/`):
    blender -b -P tower-rooms-t2/source/build_tower_t2.py          # -> source/tower_t2.blend (theme bamboo)
    blender -b -P tower-rooms-t2/source/build_boss_door_t2.py      # -> source/boss_door_t2.blend
    blender -b tower-rooms-t2/source/tower_t2.blend -P tools/render_static.py -- --out <dir>
    (same for boss_door_t2.blend; merge its static.json "sprites" into sprites/static.json)
    python3 tower-rooms-t2/source/make_t2_preview.py

`proposals/` holds the A/B/C theme samples from the earlier step. See DELIVERY_NOTE.md.
