# OV-A1: Power-up icons (Quiet Mind, Warm Up, Swift Strikes, Firm Guard)

**ITEM:** OV-A1 on board section 000. These are icons for the 4 new Power-ups in `drafts/planning/R-POWERUPS-15.md`. The names come from `drafts/content/insights/OV-C1-powerups.json`.

**WHAT:** 4 icons with no text, in the approved Power-up style. They use the same glowing scroll frame, wooden rods and cream paper as the 9 existing icons in `incoming-art/icons/sprites/`. Each has one big symbol and its own colour. No red is used.

| id | Name | Symbol | Accent RGB |
|---|---|---|---|
| calm-breath | Quiet Mind | three calm breath swirls and a sparkle | 226,96,196 (pink) |
| steady-start | Warm Up | a Focus orb that is already glowing | 88,100,214 (indigo) |
| lighter-strike | Swift Strikes | a light feather with speed lines | 120,196,250 (sky) |
| softer-block | Firm Guard | a firm dojo blocking pad, with hits bouncing off | 226,180,104 (sand) |

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

**Checks**
- 0 danger-red pixels in all 8 PNGs.
- At 30, 36 and 40 px, every symbol stays a distinct shape. It also reads in greyscale.
- No new icon matches an existing icon's symbol or colour.

**WHY:** The Programmer needs these for OV-B6, when the 4 cards go into `insights.json`. Drop them in next to the existing icon files under the same ids.

**DECIDE (Manager):**
1. Is the Firm Guard pad clear enough? At 30 px it can look a little like a barrel.
2. Warm Up uses a glowing orb rather than a sunrise. I didn't want it to look like the yellow Quick Hands icon.

**NEXT:** The Manager checks the art. After that it goes to Jay. Do not import before approval.
