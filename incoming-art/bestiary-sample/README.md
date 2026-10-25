# Bestiary sample (A-BEST step 1) - SAMPLE, waiting for Jay's OK

Three sample enemies from `drafts/content/enemies/` (bestiary-plan.md), drawn with the Tier 1 enemy pipeline
so they sit in the same shadow-creature family: deep indigo body, glowing eyes with a shine (same eye style as
the Tier 1 enemies), a soft rim in each enemy's draft `color`, nothing sharp, nothing floating above the head.

| Enemy | Draft id | Size (tiles W x H) | Look | Anims |
|---|---|---|---|---|
| Wick Wisp | wick-wisp | 0.30 x 0.46 | teardrop shadow with a warm flame lick on top (part of the body), wax collar with drips, wisp tail | idle flicker, move wavy drift, windup flicker-back, attack bump |
| Dust Bunny | dust-bunny | 0.35 x 0.40 | fluffy ball of puffs, floppy ears at head height, little nose | idle wobble, move forward roll, windup wiggle + puff up, attack sneeze |
| Sleepy Sentry | sleepy-sentry | 0.45 x 0.70 | indigo body in a stone cap, chest plate, pauldrons and base; half-shut sleepy eyes | idle dozing nod, move shuffle in place (speed 0), windup yawn, attack stomp |

Sheets: `<enemy>/sprites/` (8 directions, layers body / glow / telegraph / light, same json format as
enemies-tier1, 128 px frames, 80 px per tile). The red/purple circles and stripes are drawn by the game; the
red in the previews is only the preview tint on the neutral `telegraph` layer.

Previews: `preview/<enemy>_anim.gif` (all four anims, S/E/SE, 2x), `preview/<enemy>/` (per-anim GIFs and
contact sheets), `preview/lineup.png` (player body-a, the 4 Tier 1 enemies and the 3 samples, idle S, feet on
one ground line, 1x and 2x).

Rebuild (repo root):
    blender -b -P incoming-art/bestiary-sample/source/build_sample.py -- --enemy wick|dust|sentry --out X.blend
    blender -b X.blend -P incoming-art/tools/render_sprites.py -- --out DIR --name wick --size 128 --ortho 1.6 --anims idle,move,windup,attack
    python3 incoming-art/bestiary-sample/source/make_bestiary_lineup.py --out lineup.png
