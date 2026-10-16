# Delivery Note: Batch 2 review redesign (sample check), 2026-10-16

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
