# Stance icons (R-STANCE-b)

Four stance icons drawn in the #277 icons2 Forms style: a flat medallion with a green Forms ring, a cream face and a flat ink figure. There is no baked text; the game draws the labels.

| File (64 px plus @2x 128 px) | Stance id | Pose |
|---|---|---|
| `sprites/icon-stance-cat-64.png` | `stance.cat` | Side view. Weight on the bent back leg with the back foot flat. The front foot rests on its ball with the heel up. A soft mark under the back foot shows the weight. |
| `sprites/icon-stance-front-64.png` | `stance.front` | Side view, long forward stance. The front knee is bent over the ankle and the back leg is straight. The figure punches at chest height. |
| `sprites/icon-stance-fighting-64.png` | `stance.fighting` | Side-on, light, with the back heel up. Both fists are up at chin height. Small ticks by the feet show it is bouncy. |
| `sprites/icon-stance-horse-64.png` | `stance.horse` | **Pixel-identical to #277 `icon-rooted-form`** (Jay: "horse stance is rooted stance"). Front view, wide and even. |

The ids come from `drafts/content/katas/stances.json`. `sprites/stances.json` is the manifest. I have not renamed the #277 files; that waits on Jay's OK.

- **Red check:** 0 red pixels.
- **Above the head:** nothing.
- **Preview:** `preview/stances-preview-667x375@2x.png`.
- **Rebuild:** `python3 incoming-art/stances/source/build_stances.py && python3 incoming-art/stances/source/make_preview.py`. The style helpers are copied from the #277 script.
