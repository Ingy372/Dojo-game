# Tier 3 (Orange) enemies (B-ART3, group A)

Built with the same toon pipeline as the approved samples (#241). The builder is `source/build_t3b.py`, a copy of `tier3-orange-sample/source/build_t3.py` with new SPEC entries. Timings come from `drafts/content/enemies/<id>.json`; Doughling data comes from `dough-blob.json` → `variants.doughling`.
Render: `render_sprites.py --size 128 --ortho 1.6 --anims idle,move,windup,attack`, 8 directions, layers body / glow / telegraph.

| Enemy | Look | Anims |
|---|---|---|
| rolling-pin | wooden rolling pin lying sideways: wood #d9a86c, darker grain bands #b98450, brown handles and knobs #8a5a34, honey glow #f6d28a. Dark eyes, 3 flour dots, no arms | rocking idle / rumbling roll / back-up squash windup (26 ticks) / stretchy roll-forward attack |
| doughling | **stand-in:** a small copy of the Dough Blob (W .32, H .40, #f6e7c8) until Jay picks its look | same as Dough Blob, scaled |

**Spark Sprite recolour:** the merged sample is now re-rendered in **#ff8a3d** (the plan colour), in place under `tier3-orange-sample/spark-sprite/` and its previews (the colour is also changed in `build_t3.py`). The Ladle Lobber is unchanged: its handle still sits out the back and low.

Previews: `preview/lineup.png` (scale against the player, tier 1, the #207 bestiary samples and the tier 3 samples; tier 3 is marked "+") and `preview/<enemy>/` (contact sheets and GIFs; the preview tool tints the telegraph layer red, as the game does).
Sprites: `<enemy>/sprites/`. Blend files: `source/t3_<enemy>.blend`.

**Red check** (hue <15 or >237 out of 255, saturation >115, value >76; telegraph layer not counted): rolling pin 0 px, doughling 0 px. The spark shows 139 px out of all its sheets, all orange edge shading at the hue cut-off (for example 244,134,94, about 16°), not red. Nothing sits above the head. Silhouettes: a long sideways log (pin) vs a small round dome (doughling).
