# Legendary rarity frame (A-LEGENDARY)

These are Legendary versions of the P-MENU2 rarity frames (`incoming-art/menu2/`, #265). They use the same files, sizes, draw rects and code as Common, Uncommon, Rare and Epic, made by importing `menu2/source/build_menu2.py`. Menu2 itself is not changed. Every file has an @2x twin.

| sprite | size (1x) | matches | notes |
|---|---|---|---|
| `gear/bag-tile-legendary` | 84×100, drawRect [6,6,72,88] | `bag-tile-epic` | Gilded gold frame, white-gold hairline, warm radiant halo in the 6 px margin, gold band, 4 gold corner stars and a crown sparkle on the top rail. Icon 56, centre y 40. |
| `found/found-tile-legendary` | 60×60, drawRect [4,4,52,52] | `found-tile-epic` | Same treatment at 52 px. Icon 40. |
| `gear/gear-ring-legendary` (`-glow`, `-pressed`) | 56×56 | `gear-ring-epic*` | Gold band with honey enamel, 8 white-gold star studs (Epic has 8 round gems), and 16 short gold rays around the edge. Icon 36. |
| `*-legendary-shine-0..5` | as base | — | EXTRA, optional: a 6-frame shine overlay at 16 fps, played once (same code as `slot-card-shine`). Epic has no shine, so this is extra. Skip it under Reduced motion. |

`sprites/legendary.json` lists them in the same format as `menu2.json`.

**9-slice:** in menu2 the rarity frames are fixed-size sprites, not 9-slice (only panels and bars are 9-slice). The Legendary frames follow the same rule.

**How it reads above Epic:**
- Colour family: Epic is violet enamel on wood, Legendary is all gold and white-gold.
- Extra ornament: it adds a crown sparkle, and the ring gets rays and star studs.
- It has a radiant edge.
- There's no red and nothing harsh.

## Previews
- `preview/mock-epic-vs-legendary-932x430.png` (and `@2x`): a phone mock on the menu2 panel. Epic is on the left and Legendary on the right, with bag tiles, rings (normal, glow, pressed) and found tiles. The icons come from `gear-drop-icons`.
- `preview/closeup-epic-vs-legendary-3x.png`: a close-up of the frames with no icons.

## Rebuild
```
python3 incoming-art/legendary-frame/source/build_legendary.py
python3 incoming-art/legendary-frame/source/make_preview.py
```

Red check (HSV: hue <0.03 or >0.97, saturation >0.6, value >0.4, alpha >20): 0 px across 37 PNGs.
