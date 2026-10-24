# Content Writer

This folder belongs to the **Content Writer** Grok bot (see `docs/GROK_BOTS.md`). Everything here is a **draft** until Jay approves it. Claude Code never edits this folder; approved text is copied into `content/`.

## Files
- `enemies/swarmer.json`, `shield.json`, `brute.json`, `floor-keeper.json`: exact copies of `content/enemies/` plus two NEW fields: `description` and `bestiary` (`tip`, and `lore` for white, yellow, orange tiers).
- `loot/gear.json`: copy of `content/loot/gear.json` plus a NEW `description` field per item.
- `loot/materials.json`: NEW draft (no source file exists yet). Bamboo, stone, silk, jade. Text only.
- `dojo/decorations.json`: copy of `content/dojo/decorations.json` plus a NEW `description` field per decoration.
- `story/chapter-1.json`: "The Shattered Light", opening chapter: 17 one-line screens, the first Guardian, 3 Relics.
- `abilities/technique-callouts.json`: Technique Callouts text (proposal 1 from drafts/learning).
- `dojo/sensei-bow-questions.json`: Sensei's Question at the Bow, as a reflection (proposal 2).
- `tutorial/sensei-lessons.json`: first-run Sensei's Lessons (move, Strike, the "!" warning, guided Counter, Perfect Counter, Block, Dash). The guided Counter lines pair with Learning proposal 6.
- `dialogue/milestone-6.json`: milestone 6 dialogue (C1, dialogue half): Sensei, Senpai, Kohai, second instructor, founder; intros, founder Class Creed scene, one manners quest, one life-lesson quest, return-home reflections.
- `text/room-twists.json`: final banner and Sensei lines for the room twists (PR #22 format).
- `text/guided-counter-nudge.json`: final G1 guided-Counter nudge (PR #21).
- `faith/creed-and-verses.json`: C5 faith text: the Class Creed, the promotion verses, covenants and FAITH DOES life words (exact wording), with framing and Sensei lines.
- `decisions.md`: content decisions.
- `rename-proposals.md`: suggested renames for Jay. Nothing renamed in the JSON.

Notes: all numbers/stats are unchanged. `description`, `bestiary`, materials and the story file need code to display them. No Street Smarts scenarios were added. **Faith themes were added at Jay's direct instruction (2026-10-12), which overrides the 'no faith content unless Jay asks' line in docs/GROK_BOTS.md.**
