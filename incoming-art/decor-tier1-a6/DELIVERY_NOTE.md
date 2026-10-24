## Delivery Note

**ITEM:** A6 fix, a follow-up to #124 for the Tier 1 decor in `incoming-art/decor-tier1-a6/`. No new art; ids, names, rules and one preview row.

**WHAT:**
1. **C10 ids and names (PR #123).** `sprites/static.json` ids and the sprite file names are now the C10 ids. Each entry has `info.name`, `info.description` and `info.textFrom`. `source/rename_c10.py` does the rename after `render_static.py` (the Blender build ids stay `decor-t1-*` inside the source).
   - Statues and trophies: C10 has one id each, so the variants are `decor-a6-keeper-statue-floor1..3` and `decor-a6-journal-trophy-<monster>`, and they share the C10 name ("Floor Keeper Statue", "Journal Friend Trophy"). The shared layers are `decor-a6-keeper-statue-base` and `decor-a6-journal-trophy-stand`.
   - Scroll pictures are matched to C10 subjects in order (sun and hills → Bow, moon → Form 1, bamboo → Form 2, blossom → Key On, waves → Kicks, peak → Defense, koi → Kindness).
2. **White-belt fallback:** on White-belt floors, colour 2 is soft wood tan **`#d2a878`**, which sits between the Home Dojo's light floor boards and the stand wood. It's in `placement.whiteBeltFallback` and in each random piece's `info.colour2WhiteFallback`. The preview has a new row.
3. **Folding screen is bonus-only:** `info.bonusOnly = true`, `info.pool` = "bonus only (not in the random pool)", plus `placement.bonusOnly`.
4. **Parked:** gold-plate trophies for Tier 2+ named monsters wait until Tier 2 is planned (`placement.parked`, NOTES).

**FOR THE PROGRAMMER, id change.** `decor-t1-*` from #124 was renamed as below (the `-tint` layers follow their piece). Nothing on main outside `incoming-art/` used the old ids. Some new ids match ids in the A6 samples in `decor-pool-a6/`: load only `decor-tier1-a6/`.

| old (#124) | new (C10) |
|---|---|
| `decor-t1-scroll-sun-hills` | `decor-a6-class-scroll-bow` |
| `decor-t1-scroll-moon-clouds` | `decor-a6-class-scroll-form1` |
| `decor-t1-scroll-bamboo` | `decor-a6-class-scroll-form2` |
| `decor-t1-scroll-blossom` | `decor-a6-class-scroll-key-on` |
| `decor-t1-scroll-waves` | `decor-a6-class-scroll-kicks` |
| `decor-t1-scroll-peak` | `decor-a6-class-scroll-defense` |
| `decor-t1-scroll-koi` | `decor-a6-class-scroll-kindness` |
| `decor-t1-gear-kick-pad` | `decor-a6-kick-pad` |
| `decor-t1-gear-focus-mitts` | `decor-a6-focus-mitt` |
| `decor-t1-gear-belt-rack` | `decor-a6-belt-rack` |
| `decor-t1-gear-helmet` | `decor-a6-sparring-helmet` |
| `decor-t1-gear-water-bottle` | `decor-a6-water-bottle` |
| `decor-t1-gear-bow-mat` | `decor-a6-bow-mat` |
| `decor-t1-fan` | `decor-a6-fan-stand` |
| `decor-t1-lantern` | `decor-a6-lantern-small` |
| `decor-t1-bonsai` | `decor-a6-bonsai-small` |
| `decor-t1-cushion` | `decor-a6-cushion` |
| `decor-t1-banner` | `decor-a6-banner-small` |
| `decor-t1-folding-screen` | `decor-a6-folding-screen` |
| `decor-t1-statue-*` | `decor-a6-keeper-statue-*` |
| `decor-t1-trophy-*` | `decor-a6-journal-trophy-*` |

**Preview:** [random pieces: colour 1 / White raw / White, wood-tan fallback / Yellow / Orange](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-fix/incoming-art/decor-tier1-a6/preview/review-2-random-colour1-white-raw-white-fallback-tan-yellow-orange-2x.png) (it replaces the old review-2 file). Other previews: [class](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-fix/incoming-art/decor-tier1-a6/preview/review-1-class-pieces-2x.png), [statues and trophies](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-fix/incoming-art/decor-tier1-a6/preview/review-3-statues-trophies-screen-2x.png), [room](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-fix/incoming-art/decor-tier1-a6/preview/review-4-room-1x.png). Data: [static.json](https://github.com/Ingy372/Dojo-game/blob/bot-art-a6-fix/incoming-art/decor-tier1-a6/sprites/static.json).

**DECIDE:** Confirm the scroll picture-to-subject pairing (Content Designer) and the keeper figures for floors 1–3.
