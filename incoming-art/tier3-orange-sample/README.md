# Tier 3 (Orange) — sample batch (B-ART3)

Three sample enemies for the Orange tier, built with the same toon pipeline as bestiary set 1
(`source/build_t3.py`, a copy of `build_set1.py` with new SPEC entries; timings from
`drafts/content/enemies/<id>.json`). Render: `render_sprites.py --size 128 --ortho 1.6 --anims idle,move,windup,attack`, 8 directions.

| Enemy | Look | Anims |
|---|---|---|
| spark-sprite | small bright orange ball, 5 round flicks, dark eyes, no arms | crackle idle / zig-zag dart / blink-shrink windup / dart attack |
| dough-blob | big lumpy cream dome, top swirl, flour dots | wobble / squishy bounce / squish-flat windup / wide plop |
| ladle-lobber | copper bowl with rim and soup, low handle out the back | rocking / waddle-hop / tip-back windup / fling |

Previews: `preview/lineup.png` (scale vs player, tier 1, #207 sample; tier 3 marked "+"), and `preview/<enemy>/` contact sheets + GIFs.
Sprites: `<enemy>/sprites/`. Blend files: `source/t3_<enemy>.blend`-style files beside the builder.

Red check: dough 0 px; spark/ladle hits are only dark-brown shading (~#50 2e 1e), not red. No red outside telegraphs. Nothing above heads.
