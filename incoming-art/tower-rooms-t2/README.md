# Yellow belt Tower room kit (Batch 9) - THEME PROPOSALS (samples only)

Three theme proposals for the Tier 2 (Yellow belt) Tower. Each is a small kit in the same format as Tier 1
(`tower-rooms/`): 3 floor tiles, wall face, wall block, pillar and the battle door. No creatures.
All three are brighter and warmer than Tier 1's cool grey stone, with a calm, medium-light floor.

| | theme | look |
|---|---|---|
| A | Sunlit Sandstone | warm honey sandstone walls, pale sand floor flags, pillars with gold rings |
| B | Bamboo Garden Hall | cream paper walls between green bamboo posts, woven straw-mat floor, three-stalk bamboo pillars |
| C | Sunrise Lacquer | soft coral walls with sunrise bands, peach floor, pillars with a sun disc |

(These names are only labels for the proposals, not game names.)

- `preview/themes-side-by-side.png`: Tier 1 plus the 3 themes, the same room layout each time.
- `preview/theme-<theme>-room.png`: each theme on its own.
- In the previews the treasure and rest doors, chest and shrine are the existing Tier 1 sprites; the player (yellow belt),
  a swarmer, a red danger circle and a gold star are dropped on top only to check they stand out. Those are not part of this kit.
- `sprites/<theme>/`: the rendered kit + `static.json` (same names and anchors as `tower-rooms/sprites`).
- Rebuild (from `incoming-art/`): `blender -b -P tower-rooms-t2/source/build_tower_t2.py -- --theme sandstone --out tower-rooms-t2/source/sandstone.blend`,
  `blender -b tower-rooms-t2/source/sandstone.blend -P tools/render_static.py -- --out tower-rooms-t2/sprites/sandstone`,
  then `python3 tower-rooms-t2/source/make_t2_preview.py`.

Findings from the previews:
- The Tier 1 treasure and rest doors keep their blue-grey stone surround, which looks out of place on warm walls. The chosen theme needs its own version of every door (only the battle door is re-themed here).
- C (Sunrise) has the weakest contrast with the red danger circle, because its floor is peach. A and B keep it clearer.
