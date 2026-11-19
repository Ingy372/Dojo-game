# Action Zone inside room, v2 (draft for Jay, Nov 19 2026)

Detail pass on the real dojo's inside room, from Jay's photos, on top of the bot's layout (same grid, groups and footprints, so the
game's room file and the import step stay the same). Not in the game yet: waits on Jay's OK.

- `samples/inside-main-floor@2x.png`: the full room. `previews/before-after.png`: the old room (left) and this draft (right).
- Rebuild: `blender -b -P source/build_action_zone_dojo.py -- --scene inside --samples 8 --outdir <this folder>`
  (game pieces: add `--game <dir>`, then `python source/make_game_inside.py <dir>`).
- Faith texts (Class Creed, belt creed board) are the same approved pictures, unchanged. Handprints carry no names.
- Mural figures: `source/make_silhouettes.py` cuts the kicker out of the school logo and draws the stance and split figures in the same style (`source/textures/sil-*.png`).
