# Delivery Note - bestiary sample (A-BEST step 1)

**Status: SAMPLE. Not for the game yet - stop here for Jay's OK before any more bestiary art.**

Delivered: Wick Wisp, Dust Bunny, Sleepy Sentry (sheets, blends, build script, GIFs, lineup). See README.md.
No game code touched; nothing outside `incoming-art/bestiary-sample/`.

## v2 - distinct look (Jay's review, 24 Oct 2026)
Jay asked for each of the three to have its own outline/silhouette and its own colour, and a darker slate Sentry.
In `source/build_sample.py`, shape and colour only (same rig, animations, timings and layers):

| Enemy | Silhouette | Body | Rim / outline glow |
|---|---|---|---|
| Wick Wisp | tall and slim: a narrow teardrop, a bigger flame tip (H 0.46 -> 0.56) | violet #3b2878 | gold #ffd36b |
| Dust Bunny | wide and low: big ears splayed out to the sides, fluff all round | dusty mauve #5b5083, cream fluff tips #efe3cf | soft pink #f3d6e4 |
| Sleepy Sentry | square: a blocky rounded-box stone body, flat cap | darker slate #343d4a, stone plates #6f7c8a | cool teal-grey #9fc9d2 |

So you can tell them apart by outline shape (tall / wide / square), body colour (violet / mauve / slate) and rim colour
(gold / pink / teal) even in greyscale. All sheets, GIFs, contact sheets and `preview/lineup.png` are re-rendered.

Second pass (v2): checked every contact sheet in 8 directions; red-pixel check on all body and glow sheets = 0 (red only
in the preview telegraph tint, the game's danger colour); nothing above the head (the ears are now lower, at the sides);
the Sentry's box body animates cleanly through the yawn and stomp; feet on the ground line in the lineup.
DECIDE item 1 is answered by this change (bodies now take their own colour; Wick stays in the shadow-violet family).

## Second pass (v1, checked)
- Every contact sheet checked in all 8 directions: no red in the art (only the preview telegraph tint), no
  teeth/claws/spikes, nothing above the head (Wick's flame is the top of its body; the bunny's ears sit at
  head height), eye style matches the Tier 1 enemies.
- Fixed in the second pass: Dust Bunny's roll pivoted on its base and sank below the frame in frames 2-4;
  it now rolls about its centre and stays on the ground.
- Sizes and colours come from the draft json (`radius`, `color`); timings follow `telegraphTicks`.
- Lineup: all feet on one ground line, same scale as the player.

## DECIDE (for Jay)
1. Colour: I used each draft `color` as the rim/accent and kept the body indigo (shadow family). Or should
   the whole body take the draft colour (e.g. a grey Dust Bunny, a stone-grey Sentry)?
2. Sleepy Sentry is mostly stone with indigo showing through - is that still "shadow creature" enough?
3. Wick Wisp's flame is warm yellow (#f6d77a). OK, or keep flames out of the shadow family?
4. Dust Bunny roll: a full roll hides the face for half the cycle. Keep, or a half-roll/bounce instead?
5. Sizes: the three are small next to the player (see lineup) - matches the draft radii; bigger?
6. Go/no-go for the rest of the bestiary in this style.
