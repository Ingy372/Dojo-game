# C-STORY-g: Bestiary entries, Tiers 1-3 (draft)

Data: `bestiary-tiers-1-3.json`, with 19 entries: 16 regular enemies from `bestiary-plan.json` (White, Yellow, Orange) plus the 3 Tier 2 named monsters from `named-monsters.json`. Guardians are in `story/guardian-arcs.json`.

- **kidLine** (ages 6-9, 8-12 words): what it does and how to handle it, taken from its `behaviour`/`tell`.
- **olderReaderLine** (ages 12-14, at most 2 short sentences): unlocks at that tier's belt. It hints at that tier's mystery-ladder fact and goes no further. White: the light broke into pieces. Yellow: a storm broke it, and it was nobody's fault. Orange: one bowl is kept warm for someone. No Scripture and no reveal of who.
- Every creature is confused, never evil. No guilt, no new mechanics or technique names.
- Check: `python3 drafts/content/tools/check-bestiary-lines.py` (word counts, sentence count, banned words perfect/only/missing/lost except "Lost Lightbearer", and coverage against the plan).

No shipped or existing enemy file is changed. The Programmer can copy these into each enemy's `bestiary.lore` when wiring.
