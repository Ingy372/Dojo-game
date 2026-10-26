# A3b: certified trophy set + badge family (S6)

Rebuild: `python3 badges-trophies-a3b/source/make_a3b.py` (run from `incoming-art/`). Needs the A3 seal layers from #146 (`badges-trophies-a3/sprites/trophies/certified-layers/`).

## Certified trophies (29), `sprites/trophies/`
Made only for the S6 IDs whose reward is **CT**: promotion ×9, stripes 1/5/10/20, classes 10–500, weeks 50/100, anniversary 1/2/3/5/10, signoffs 1/50, and one accolade template.
- **Layers, bottom to top, all 104×166 with anchor [52,156]:**
  1. `layers/halo-…`
  2. `layers/stand-pipsN` (plinth, blank plate, tier pips)
  3. `layers/ct-<cat>[-n]-topper`
  4. promotion only: `ct-promotion-beltband-<belt>`, or the neutral `-TINT` mask
  5. the A3 seal backing for the school's palette
  6. the school mark
- `ct-<cat>-<n>.png` is a baked preview with the default seal. In the game, stack the layers with the school's seal instead.
- **One silhouette per category:**
  - promotion: a handled cup with the belt band;
  - stripes: a column with 1–4 white tape bands;
  - classes: a big star on a post;
  - weeks: a slim goblet with a sun;
  - anniversary: a ring wreath with a gem;
  - signoffs: a scroll on posts with a sky-blue tick;
  - accolade: a shield plaque.
- **Tiers:**
  - metal goes bronze → silver → gold, using the item's position in its whole S6 family (so weeks 50/100 are gold);
  - star pips on the plinth, one per tier;
  - the top tier gets a sky-blue gem and an extra sparkle;
  - promotions are all gold, and the belt band carries the rank.
- The date plate `[26,134,62,148]` stays blank. The game writes "Earned {date}".

## Badges (57), `sprites/badges/`
Same medallion as the bow badges:
- rim metal shows the tier;
- 1–5 star pips;
- sky-blue ribbons from silver up;
- rays on gold;
- a gem on the top tier of families with 4 or more tiers.

They cover:
- Tower: floors, perfects, combo, allS, elites, challenge, and guardian ×10 (the gem is the tier's belt colour);
- Journal: entries, plus a `master` template;
- Home: placed, tidy;
- Street Smarts: a `location` template, and stars;
- Life quests;
- the non-CT Dojo tiers: weeks 5/10/20, signoffs 10/25, practice ×5.

`static.json` maps every sprite to its `achievement` ID.
