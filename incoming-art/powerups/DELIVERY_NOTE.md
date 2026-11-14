# OV-A1 / OV-A1b: Power-up icons (Quiet Mind, Warm Up, Swift Strikes, Iron Block)

**ITEM:** OV-A1 on board section 000. These are icons for the 4 new Power-ups in `drafts/planning/R-POWERUPS-15.md`. The names come from `drafts/content/insights/OV-C1-powerups.json`.

**WHAT:** 4 icons with no text, in the approved Power-up style. They use the same glowing scroll frame, wooden rods and cream paper as the 9 existing icons in `incoming-art/icons/sprites/`. Each has one big symbol and its own colour. No red is used.

| id | Name | Symbol | Accent RGB |
|---|---|---|---|
| calm-breath | Quiet Mind | three calm breath swirls and a sparkle | 226,96,196 (pink) |
| steady-start | Warm Up | a Focus orb that is already glowing | 88,100,214 (indigo) |
| lighter-strike | Swift Strikes | a light feather with speed lines | 120,196,250 (sky) |
| softer-block | Iron Block (Jay's new name; was Firm Guard) | the same rising forearm block, with the forearm and fist now polished steel (sheen line and a glint) below a white gi sleeve and sand cuff, and the hit bouncing off the top of the forearm | 226,180,104 (sand) |

**Files**
- `sprites/icon-<id>.png` are 128 x 128.
- `sprites/icon-<id>@2x.png` are 256 x 256.
- The anchor is the centre. All corners are transparent.
- `sprites/static.json`
- `source/make_powerups.py` is the script that draws the icons. It reuses the frame code from `icons/source/make_insights_v2.py`. To run it from `incoming-art/`: `python3 powerups/source/make_powerups.py`
- Previews:
  - `preview/sizes-30-36-40.png`: true size, in colour and greyscale, on the menu colour and on a cream card.
  - `preview/family-36px.png`: the 9 existing icons, a divider, then the 4 new ones, at 36 px in colour and greyscale.
  - `preview/closeup-256.png`
  - `preview/firm-guard-before-after.png`: the skin-tone forearm block from 8f71d625 (top) and the steel Iron Block (bottom). Each is shown at 128 px, at 36 px in colour and greyscale, and at 36 px next to Iron Skin (shield) and Heavy Hands (kettlebell).

**Checks**
- 0 danger-red pixels in all 8 PNGs.
- At 30, 36 and 40 px, every symbol stays a distinct shape. It also reads in greyscale.
- No new icon matches an existing icon's symbol or colour.

**WHY:** The Programmer needs these for OV-B6, when the 4 cards go into `insights.json`. Drop them in next to the existing icon files under the same ids.

**OV-A1b:** Jay asked for Firm Guard to become Iron Block, with a metal arm. The icon id stays `softer-block`. The card name is the Content Designer's to update. The sand glow and frame keep it distinct from the grey Iron Skin shield.

**ART GATE:** The Manager passed Quiet Mind, Warm Up and Swift Strikes at 11c1edde. Their files are byte-identical in this update. Firm Guard failed at that commit because it read as a barrel. It is now a forearm block, so it no longer looks like gym gear and differs from the Iron Skin shield.

**NEXT:** The Manager checks the art. After that it goes to Jay. Do not import before approval.
