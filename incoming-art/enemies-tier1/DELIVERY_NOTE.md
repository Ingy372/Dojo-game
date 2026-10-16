# Delivery Note: Batch 2 (Tier 1 shadow creatures), 2026-10-16

**WHAT**
- Four shadow creatures, each in 8 directions with transparent PNG sheets and json:
  - Swarmer
  - Shield Guard (with an intact and a broken shield layer)
  - Brute
  - Floor Keeper (256 px frames, same 80 px per tile)
- Every creature has idle, move, wind-up, attack, hit flinch, stagger and defeat.
- Specials:
  - Swarmer jab
  - Shield Guard shield bash and broken shield
  - Brute winded
  - Floor Keeper slam, sweep and "calling for help"
- Each has a separate `telegraph` layer (a neutral rim the game tints and flashes) and a soft `glow` layer.
- Everything is script-built: `source/build_enemy.py` + `source/render_all.sh`.

**WHY**
- Soft, rounded blobs with big glowing eyes and no teeth or claws: a little spooky, friendly underneath, right for ages 6+.
- The wind-up is the biggest pose they make: they stretch tall, lean back and pull the arm far back, with a red rim. It lasts exactly the docs' telegraph time:
  - Swarmer 0.6 s
  - Shield Guard 0.7 s
  - Brute 0.8 s
  - Keeper slam 0.9 s, sweep 1.1 s
- Attack recovery follows the data's `recoverTicks`.
- Defeat is a happy blink into a ball of light that floats up in sparkles: the creature is set free, not hurt.
- Body widths match the data radii (0.30 / 0.42 / 0.48 / 0.85 tiles).

**DECIDE (Jay)**
1. Approve the creature look: indigo bodies, lavender glow, cyan eyes; the Floor Keeper has a little gold crown-gem.
2. Approve the wind-up style: stretch tall + red rim. Is it readable enough for kids?
3. Approve the broken shield (cracked in two halves).
4. Swarmer was the sample: is its look the right base for the others?

**NEXT**
- Batch 3 (Home Dojo), then Batch 4 (Tower rooms).
- After approval, Claude Code swaps these in for the placeholder shapes.

**Doc conflicts / notes (not blocking)**
- **Telegraph lengths:** all match `content/enemies/*.json`. On Guided/Challenge difficulty the danger circle holds near full for a different time (decisions.md, "Guided timing, second version"), so the game should **hold the last wind-up frame** while that hold lasts rather than stretch the animation. The wind-up sheets end on a held pose (with a tiny tremble) for that.
- **Brute colour:** decisions.md says the brute "swells and turns red" during its wind-up. The art swells; the red comes from tinting the `telegraph` rim (and optionally the body tint in-game), so the base art stays purple.
- **Floor Keeper wind-up (slam):** from the front, the raised fists are partly hidden behind his head. The silhouette still changes a lot (stretch + rim). Say if you want the arms to show more.

**Review these first** (in `preview/`):
- `review-1-windups-and-attacks.png`
- `review-2-specials.png`
- `review-3-defeat-sparkle.png`
