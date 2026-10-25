# Delivery Note - A-BEST 4: gear drop icons (loot screen)

The order is Manager review first, then Jay's final OK. Nothing has been imported yet.

## What is here
- `sprites/drop-<slot>-<rarity>.png`: 15 icons, 128x128, transparent, anchored at the centre (64,64), with at least 8 px of margin (checked by script).
- **Slots** come from `content/loot/gear.json` items: `hands`, `gi`, `charm`.
- **Rarities** are the `rarityNames` keys: `common` (Everyday), `uncommon` (Special), `rare`, `epic`, `legendary`.
- `sprites/manifest.json` maps each `"slot:rarity"` to its file, rarity name, frame shape and pip count.
- `source/make_gear_drop_icons.py` is PIL only and rebuilds everything from the repo root.
- `preview/`:
  - `sheet_1x.png`, the full grid;
  - `sheet_grey.png`, the greyscale grid;
  - `phone_1x.png` and `phone_2x.png`, a loot-screen mock at phone size with 56 pt rows and 48 pt grid slots;
  - `phone_grey.png`, the same mock in greyscale.

## Style
- **A3 badge family:** dark outline, a lit rim (light from the top left), an inner disc in lifted menu indigo, and cream pips.
- **The glyph inside is the existing gear icon** (Batch 8 gear pieces): `cloth-wraps` for hands, `training-gi` for gi, `jade-charm` for charm.
- **Rarity reads three ways,** so it never relies on colour alone:

  | Rarity | Colour | Frame shape | Pips |
  |---|---|---|---|
  | common | #d8d2c4 | circle | 1 |
  | uncommon | #5cd65c | rounded square | 2 |
  | rare | #4ea3ff | hexagon | 3 |
  | epic | #b46cff | scalloped | 4 |
  | legendary | #ffb02e | soft 8-point star | 5 |

  The colours are the game's `RARITY_COLOR` in `apps/client/src/ui/theme.ts`.
- **No red.** The jade charm's red cord and tassel are shifted to gold in these icons only. The original icon is untouched.
- Kid-friendly: soft, rounded points, nothing sharp.

## Second pass (fixed)
- At 48 pt the epic (scalloped) and legendary (12-ray sunburst) frames looked alike. Legendary is now a soft 8-point star, which reads differently in greyscale too.
- The pips crowded the glyphs. The glyph is now smaller and sits higher, and the pips are tighter.
- The hexagon and star points broke the 8 px margin. The whole badge is now fitted into 110 px.
- The star and hexagon rims were too thin. The inner disc is smaller, so the rim shows more.
- Greyscale check: shape and pip count separate all 5 rarities.

## DECIDE
1. **One icon per item instead?** The brief asked for one icon per slot and rarity, so I made 15. A per-item set (9 items x 5 rarities = 45) would be a small script change, because the frames are generic.
2. **Legendary:** `S2-item-system.md` says Legendary comes "from Guardians only, later", and the stat lists only cover 4 rarities. I made legendary icons anyway. Keep them or drop them?
3. **Representative glyph per slot:** I used the first item in each slot (cloth-wraps, training-gi, jade-charm). Is that OK?
4. **The jade charm's red cord** in the existing Batch 8 icon also breaks the no-red rule. Should that icon get the same gold fix?
