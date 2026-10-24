# A6 full: Tier 1 decoration set (S7-rev pool)

The full Tier 1 decoration set in the Home Dojo style. See DELIVERY_NOTE.md for the list, the tint rule, previews and DECIDE.

- `sprites/` PNGs + `static.json` (Home Dojo rules, plus `placement`, `info.mustTouchWall` and `info.tintLayer`/`colour1`)
- `preview/` review sheets, the room at 1x and at phone width
- `source/build_decor_t1.py` builder, `source/make_t1_preview.py` previews (it also writes the `placement` block)

Rebuild:

    blender -b -P incoming-art/decor-tier1-a6/source/build_decor_t1.py -- --out /tmp/t1.blend
    blender -b /tmp/t1.blend -P incoming-art/tools/render_static.py -- --out incoming-art/decor-tier1-a6/sprites
    python3 incoming-art/decor-tier1-a6/source/make_t1_preview.py
