# Import note - dash-only telegraph art (A-BEST 2)

**Do not import until the Manager has reviewed it and Jay has given the final OK.**

All art is top-down floor decals, at **96 px per tile** (2x the game's `TILE = 48`), so draw them at
`setScale(TILE / 96)` = 0.5 for the default size. Colours: purple `#8a4fe6`, white `#f6f2ff`, deep purple outline
`#4a2496`. There's no red and no tint; draw the layers as they are.

## Layers (draw order, bottom to top), all in `sprites/`
| Shape | Files (`dash-<shape>_<layer>.png`) | Canvas px | Default size (tiles) | Anchor (origin) |
|---|---|---|---|---|
| lane | glow, fill, edge | 576 x 192 | 5 long x 1 wide, rounded ends | centre (0.5, 0.5) = middle of the lane; lane runs along +x |
| arc | glow, fill, edge | 576 x 576 | outer radius 2.6, band 1.0, 120 deg | centre = the enemy; the arc opens toward screen-up (-y) at rotation 0 |
| arc180 | glow, fill, edge | 576 x 576 | outer radius 2.6, band 1.0, 180 deg | as arc |
| ring | glow, fill, gap, edge | 768 x 768 | outer radius 3.0, band 0.8, gap 40 deg | centre = the enemy; the gap points screen-down (+y) at rotation 0 |
| '!!' | `dash-bang.png` | 57 x 64 | about 0.6 tile tall at scale 0.5 | bottom-centre (0.5, 1), above the enemy's head, where the red '!' goes |
| stripe swatch | `dash-stripe-tile.png` | 96 x 96 | 1 tile, seamless both ways | for a TileSprite |

Order: glow, then fill, then gap (ring only), then edge. Put them on the floor (danger) depth, under the characters,
the same place as the red circle.

## Aiming and scaling
- **Rotate** each shape by the attack direction: lane `angle = atan2(dy, dx)`, arc `atan2(dy, dx) + 90 deg`,
  ring `atan2(dy, dx) - 90 deg` (where the gap points).
- **Uniform scale** works for any size, e.g. a 2-tile radius arc is `0.5 * 2 / 2.6`. The stripes and the band scale
  with it, which is fine for small changes (about 0.7x to 1.4x).
- **Exact sizes** (other lane lengths, an arc going from 120 to 180 deg at F5, other ring radii): use a TileSprite of
  `dash-stripe-tile.png` (tileScale 0.5) with a geometry mask drawn by Graphics in the shape. Then draw the outline
  with `lineStyle(3, 0xf6f2ff)` plus `lineStyle(2, 0x4a2496)` just outside it. That gives the same look at any size.
  `build_dash_telegraph.py` can also bake new sizes: edit `SHAPES` and run it.

## Animation (suggested; the preview GIF shows it)
- **Appear:** fade alpha 0 to 1 over 4 ticks (0.2 s).
- **Stripes scroll** toward the danger edge, 1 period per 0.5 s (the TileSprite `tilePositionX += 96 * dt / 0.5`). With
  the baked PNGs, scroll the swatch under a mask instead, or skip the scroll and just pulse.
- **Pulse:** alpha 0.85 to 1, 2 pulses per second. In the last 6 ticks it holds at 1 and the edge brightens.
- **Ring gap:** the `gap` layer pulses 0.6 to 1 a little faster, so the way out stands out.
- **'!!':** pop in at scale 1.3 to 1 over 3 ticks, then hold. It goes away when the attack lands.
- **On land:** a quick white flash of the edge layer, the same as the white ring the red circle uses.

The game owns all timing; the wind-up ticks come from the enemy data (20 to 30 ticks).
