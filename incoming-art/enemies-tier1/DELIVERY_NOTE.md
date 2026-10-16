# Delivery Note: Batch 2 full sets (approved redesign), 2026-10-16

**WHAT**
- Full sets for the Shield Guard, Brute and Floor Keeper with the approved designs and glow fade. The Swarmer was already complete.
- Every enemy has idle, move, wind-up, attack, hit flinch, stagger and defeat into light, in 8 directions.
- Specials:
  - **Shield Guard:** bash, plus the `shield` and `shield-broken` layers on every animation. The broken shield is now the same blue-grey shield cracked in two, instead of solid amber.
  - **Brute:** winded.
  - **Floor Keeper:** slam, sweep and calling for help.
- `telegraphIntensity` (per frame) is in the json for every wind-up and attack.
- **New previews in `preview/`:**
  - all four `<enemy>_anim.gif`
  - `windup_compare.gif`
  - `lineup-redesign.png`
  - 3 review pictures

**WHY:** Jay approved the four redesigns and the glow fade.

**DECIDE (Jay):** approve the full sets. Start with `preview/review-1-windups-and-attacks.png`, `review-2-specials.png`, `review-3-defeat-sparkle.png` and the four GIFs.

**NEXT:** Claude Code swaps out the placeholder enemies. Use each json's `anchor` and frame size; the Brute is now 208 px.

**Issues / notes**
- **Brute frame size:** a 176 px frame still clipped the telegraph rim in SE/SW on the attack's impact, so the Brute is now **208 × 208** (80 px per tile, feet anchor at 82%, recorded in `brute.json`).
- **Clipping:** the check finds no clipped frames in any enemy.
- **Doc conflicts:** none. The telegraph timings match `content/enemies/*.json`.

# Earlier: Batch 2 review redesign (sample check), 2026-10-16

**WHAT**
- **New designs for all four creatures.** They are the same shadow family (glowing eyes, soft rim, dissolve into light), but each has its own silhouette, features, accent colour and movement:
  - **Swarmer:** a teal flame-tufted wisp that bounces.
  - **Shield Guard:** an amber beetle sentinel with a big round shield that marches.
  - **Brute:** a wide, low, crimson-magenta ox-hulk with horns and big fists that stomps.
  - **Floor Keeper:** a tall, gold, masked, crowned, haloed and caped guardian that glides.
- **Wind-up glow:** it ramps up through the wind-up and dims smoothly over the first half of the attack. The per-frame `telegraphIntensity` is in the json.
- **Defeat:** unchanged.
- **Rendered as a sample only:** the Swarmer's full set, plus idle, wind-up and attack for the other three.
- **Previews:**
  - `preview/lineup-redesign.png`
  - `preview/swarmer_anim.gif`
  - `preview/windup_compare.gif`

**WHY**
- Jay's review: the creatures were too similar, so each now reads at a glance on a phone by silhouette and colour, not just size.
- The red rim used to be on at full and then cut instantly at the attack.

**DECIDE (Jay)**
1. Approve the four designs (or name changes per creature). On approval I'll render the full sets for the Shield Guard, Brute and Floor Keeper:
   - all animations;
   - the broken shield;
   - winded;
   - sweep;
   - calling for help.
2. Approve the glow ramp and fade.
3. Does the Brute's bigger 160 px frame suit Claude Code? Same 80 px per tile and the same feet anchor.

**NEXT:** stopped here as asked. After approval: full re-render, then new GIFs and review pictures.

**Doc conflicts:** none. The telegraph timings still match `content/enemies/*.json`.
