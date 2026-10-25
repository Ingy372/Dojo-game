# Menu icons (Batch 8) - SAMPLES ONLY

All 28 icons (9 gear, 9 Insights, 10 Seals), 128 x 128, in the approved family styles. Second pass 2026-10-24: strong-block, mountain-gi, crane-charm, off-balance, press-the-advantage, follow-through, sweep and escape-step redrawn. Rebuild: build_icons.py -> render_static.py -> finalize_icons.py -> make_icon_preview.py (see DELIVERY_NOTE.md).

## Insight colour key (K7-art2, 2026-10-24)
All 9 Insights keep the family cue (a glowing scroll: two wooden rods, cream paper, soft glow) but now each has its own big symbol (about 60 of 128 px) and its own accent colour (glow, paper edge, rod caps). No red (red means danger). Rebuild: `python3 icons/source/make_insights_v2.py` (overrides the Blender render for these 9), then `make_icon_preview.py`. The table below describes the old Insight pictures; this key replaces it for Insights.

| Insight id | accent / glow colour | symbol |
|---|---|---|
| `ripple-counter` | sky blue `#4096eb` | a water drop falling into rings |
| `iron-skin` | slate grey `#6e7c96` | a solid riveted shield |
| `wind-step` | mint `#3cc896` | a footprint with wind lines |
| `double-strike` | orange `#ff921e` | two lightning bolts |
| `quick-hands` | sunny yellow `#fad628` | an open hand with speed lines |
| `press-the-advantage` | violet `#9660e6` | a double forward chevron |
| `shield-breaker` | cyan `#1ebace` | a shield cracked in two |
| `heavy-hands` | brown `#965c32` | a round kettlebell weight |
| `rally` | lime green `#82cd32` | a flag with a star |

| file | id (existing) | family | what it shows |
|---|---|---|---|
| `sprites/icon-cloth-wraps.png` | gear `cloth-wraps` | Gear = the object itself | a rolled cream hand wrap with its loose end |
| `sprites/icon-ripple-counter.png` | Insight `ripple-counter` | Insights = a glowing scroll | open scroll, soft gold glow, ripples spreading from one point |
| `sprites/icon-strong-block.png` | Seal `strong-block` | Seals = round medallion + one simple symbol | blue-rimmed medallion with a forearm raised in a block |

- 128 x 128 px, transparent, at least 8 px margin (`preview/margin-check.png`), no frame, background, border or text.
- `sprites/static.json`: frames 1, anchor = centre (64, 64).
- Built by script with the house toon kit (same light, toon ramp and outline colour as everything else). The outline is
  thicker than on world sprites (about 2 px at 128 px) so the icons still read at 48-64 pt on a phone.
- Previews: `preview/icons-on-backgrounds-1x.png` / `-2x.png` (menu #221d2e and the five rarity colours),
  `preview/icons-phone-size-1x.png` / `-2x.png` (true phone size, 64 pt list rows and 48 pt grid slots; grey bars stand in for text).
- Rebuild (from `incoming-art/`):
  `blender -b -P icons/source/build_icons.py -- --out icons/source/icons.blend`,
  `blender -b icons/source/icons.blend -P tools/render_static.py -- --out icons/sprites`,
  `python3 icons/source/finalize_icons.py`, `python3 icons/source/make_icon_preview.py`.
