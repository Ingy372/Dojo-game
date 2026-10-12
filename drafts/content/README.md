# Content Writer

This folder belongs to the **Content Writer** Grok bot (see `docs/GROK_BOTS.md`). Everything here is a **draft** until Jay approves it. Claude Code never edits this folder; approved text is copied into `content/`.

## Files
- `enemies/swarmer.json`, `shield.json`, `brute.json`, `floor-keeper.json`: exact copies of `content/enemies/` plus two NEW fields: `description` and `bestiary` (`tip`, and `lore` for white, yellow, orange tiers).
- `loot/gear.json`: copy of `content/loot/gear.json` plus a NEW `description` field per item.
- `loot/materials.json`: NEW draft (no source file exists yet). Bamboo, stone, silk, jade. Text only.
- `dojo/decorations.json`: copy of `content/dojo/decorations.json` plus a NEW `description` field per decoration.
- `story/chapter-1.json`: "The Shattered Light", opening chapter: 15 one-line screens, the first Guardian, 2 Relics.
- `rename-proposals.md`: suggested renames for Jay. Nothing renamed in the JSON.

Notes: all numbers/stats are unchanged. `description`, `bestiary`, materials and the story file need code to display them. No faith content and no Street Smarts scenarios were added.
