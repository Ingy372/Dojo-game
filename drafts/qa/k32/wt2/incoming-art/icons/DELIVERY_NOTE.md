# Delivery Note: K7-art2, distinct Insight icons, 2026-10-24

**ITEM:** K7-art2. Tester report `2026-10-24-k7-art-qa.md`, bug 3: the 9 Insight icons were hard to tell apart (the symbol was only about 10-12 px on screen).

**WHAT** (`incoming-art/icons/` only)
- I redrew the 9 Insight icons. Each one keeps the family cue, a glowing scroll (wooden rods, cream paper, soft glow), but the scroll is now squarer and the symbol fills it (about 60 of 128 px, about 5x the area it had before).
- Each Insight has its own symbol and its own glow/accent colour (glow, paper edge, rod caps), with no red. The 9 differ in silhouette, and in colour and brightness too.
- Ids, file names, size 128 x 128, anchor (64, 64) and `static.json` are unchanged. A margin of 11 px or more is kept.
- Colour key: in `README.md` and `NOTES-FOR-CLAUDE-CODE.md`.
- Previews:
  - `preview/insights-v2-before-after.png` (before/after, colour and greyscale, at 128 px)
  - `preview/insights-v2-48px-greyscale-check.png` (48 px on the menu colour and a cream card, in colour and greyscale; the old ones at 48 px; the colour key)
  - Rebuilt: `sheet-insights-1x/2x.png`, `phone-mock.png`.
- Source: `source/make_insights_v2.py`.

**WHY:** At 48 px each Insight should be told apart at a glance by shape alone (it works in greyscale), and colour is a second cue. Red stays reserved for danger.

**DECIDE (Jay)**
1. Symbol choices. The ones that changed meaning from the old pictures:
   - `iron-skin`: a plain shield, without the arrow.
   - `double-strike`: two bolts instead of two bursts.
   - `heavy-hands`: a kettlebell instead of the spiky sun.
   - `rally`: a flag instead of the heart + arrow (a heart read as red/health).
   Do these fit what each Insight does?
2. Should the UI also use the accent colours (for example, a card border)? They are listed in the notes, but nothing requires it.

**NEXT:** after OK, Claude Code just reloads the PNGs (no code change needed). Bugs 1 and 2 (text overlap at 667) belong to the Programmer, not art.

---

# Delivery Note: A0 - Batch 8 icons (full set), 2026-10-24

**ITEM:** A0 (work board): Batch 8, all remaining gear, Insight and Seal icons.

**WHAT**
- `sprites/icon-<id>.png`, 128 x 128, 28 icons, `static.json` (frames 1), ids exactly as in the brief:
  - Gear (9): cloth-wraps, leather-wraps, tiger-wraps, training-gi, padded-gi, mountain-gi, jade-charm, lotus-charm, crane-charm.
  - Insights (9, glowing scroll): ripple-counter, iron-skin, wind-step, double-strike, quick-hands, press-the-advantage, shield-breaker, heavy-hands, rally.
  - Seals (10, blue-rim medallion): off-balance, escape-step, sweep, steady-breath, strong-block, sharp-eyes, create-distance, disarm, throw, follow-through.
- Sample styles kept; cloth-wrap loose end is now a smooth curved ribbon.
- Second pass after Jay's review (2026-10-24):
  - strong-block: redrawn as a clear blocking forearm: white gi sleeve with a cuff, the forearm at the rising-block angle, a closed fist with 4 knuckles, finger creases and the thumb, and orange impact lines on top.
  - mountain-gi: a lighter slate gi with a big round chest crest showing a snowy two-peak mountain.
  - crane-charm: a proper folded paper crane (red-pink paper, wings up, long neck, tail) on a gold cord and tassel.
  - The dizzy-star trio now reads as three different things: off-balance = a little round fighter tipping over (wobble lines, dizzy swirl); press-the-advantage = two red chevrons charging at a dazed target; follow-through = a fist that keeps going through a hit burst, with a long swoosh.
  - sweep (it looked like a smile): a foot sweeping low along a floor line with a curved arrow. escape-step (it matched wind-step): a footprint hopping back along a curved arrow.
- `preview/`: per-set sheets at 1x and 2x on the menu colour and rarity colours, and a phone mock (48 px).

**WHY**
- Jay approved the 3 sample looks; this completes the brief's list in the same style. No text in any icon.

**DECIDE (Jay)**
1. Symbol picks are mine (e.g. cracked shield = shield-breaker, heart + arrow = rally). Change any after the second pass?
2. Seal rim stays one blue for all Seals (no per-type colour yet).
3. Rarity background colours in the preview are placeholders; the game's own colours apply.

**NEXT:** Claude Code maps `icon-<id>` to the existing gear / Insight / Seal ids.
