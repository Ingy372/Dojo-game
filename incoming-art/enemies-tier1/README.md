# Tier 1 shadow creatures (Batch 2, review redesign): technical sheet

**Status: design sample, waiting for Jay's approval of the new designs.**
- Only the **Swarmer** has its full set rendered.
- The Shield Guard, Brute and Floor Keeper have just idle, wind-up and attack (the Keeper: idle, slam wind-up, slam). Their full sets get rendered once the designs are approved.
- The old designs are in git history only.

All four come from one script (`source/build_enemy.py --enemy <id>`) and the shared `tools/render_sprites.py`: same camera, 8 directions N..NW, 80 px per tile, the toon look from `tools/toon_kit.py`. Sizes and timings come from `content/enemies/*.json` (20 ticks per second).

```bash
bash incoming-art/enemies-tier1/source/render_all.sh swarmer      # build + full render + previews of one enemy
# the sample renders of the others (after building their .blend with build_enemy.py):
blender -b incoming-art/enemies-tier1/source/brute.blend -P incoming-art/tools/render_sprites.py -- \
    --out incoming-art/enemies-tier1/brute/sprites --name brute --size 160 --ortho 2.0 --anims idle,windup,attack
python3 incoming-art/tools/make_enemy_lineup.py --root incoming-art/enemies-tier1 --out incoming-art/enemies-tier1/preview/lineup-redesign.png
python3 incoming-art/tools/make_anim_gif.py --sheets incoming-art/enemies-tier1/swarmer/sprites --out incoming-art/enemies-tier1/preview/swarmer_anim.gif
python3 incoming-art/tools/make_anim_gif.py --windups incoming-art/enemies-tier1 --out incoming-art/enemies-tier1/preview/windup_compare.gif
```

## The four designs

**Family traits:** deep indigo bodies, glowing eyes, a soft coloured rim, and the same defeat (they dissolve into light and sparkles, unchanged). No teeth, claws or anything sharp.

**Telling them apart:** each type has its own silhouette, accent colour, features and way of moving:

| Enemy | Shape and features | Accent (glow rim, eyes, details) | Moves like | Frame |
| --- | --- | --- | --- | --- |
| **Swarmer** (0.30 tiles) | A small round wisp with a soft three-lick flame tuft (teal tips), a little tail, no feet (it floats) | Teal `#3fe6d2`, rim `#5fe8ff`, eyes `#aefcf2` | **Quick, high bouncing hops** (stretch in the air, squash on landing). A restless flicker when idle | 128 px |
| **Shield Guard** (0.42) | An upright beetle sentinel: a domed shell with an amber stripe, a helmet ridge with an amber visor, two antennae with glowing tips, a **big round shield** with an amber rim and a sun-star | Amber `#ffaa33`, rim `#ffc266`, eyes `#ffe0a0` | **A steady march**, upright, with small even steps. Stands stiffly at attention | 128 px |
| **Brute** (0.48) | Wide and low, an ox-like hulk: a shoulder hump, a heavy brow, a soft snout, **big fists** with magenta bands, rounded **horn stubs** with magenta tips | Crimson-magenta `#e8337a`, rim `#ff5c9d`, eyes `#ffb3d6` | **Heavy stomps** with a big sway. Heavy breathing when idle | **160 px** (was 128: the wide body and fists need room) |
| **Floor Keeper** (0.85) | Tall and regal: a pale **mask**, a gold **crown**, a dotted gold **halo**, a gold sash and cuffs, a **flowing cape** to the floor | Gold `#ffc83d`, rim `#ffd86b`, eyes `#fff0b0` | **A smooth glide** (no steps). Floats slowly up and down when idle | 256 px |

## Wind-up glow (telegraph) ramps and fades

The `telegraph` layer is the same neutral rim as before; the game tints it, for example `#ff3b30`. Each animation's json entry now has `telegraphIntensity`, one alpha value (0–1) per frame:

| Animation | Telegraph intensity |
| --- | --- |
| `windup` / `windup_slam` / `windup_sweep` | Ramps up from 0.25 to 1.0, eased, over the telegraph time. In Guided mode, hold the last frame at 1.0 |
| `attack` / `slam` / `sweep` | Starts at 1.0 on the impact and **dims smoothly over the first half of the attack** to 0 (for example the Swarmer: 1.0, 0.91, 0.66, 0.35, 0.1, then 0). No hard cut |
| everything else | No telegraph (no list = 0) |

Multiply the value into the tinted layer's alpha, as `tools/make_creature_preview.py` and the GIFs do. The game can still pulse or flash on top.

## Layers (bottom to top)

| Layer | Tint | Draw | What |
| --- | --- | --- | --- |
| `body` | none | always | The creature |
| `shield`, `shield-broken` | none | Shield Guard: exactly one of them | The intact shield or the cracked one. The broken one is re-rendered with the full set |
| `glow` | none | always | The soft rim in the type's accent colour |
| `telegraph` | **yes** (neutral white) | wind-ups and attacks, at `telegraphIntensity` | The danger rim |
| `light` | none | always (only the defeat has anything) | The defeat light orb and sparkles |

## Previews (`preview/`)

- `lineup-redesign.png`: all four at 1x (true size) and 2x, S and E, idle and wind-up.
- `swarmer_anim.gif`: the Swarmer's full set in sequence, real fps, S/E/SE, with the glow fade.
- `windup_compare.gif`: all four wind-ups into their attacks, same scale, showing the ramp and the fade.
- The Swarmer's per-animation GIFs and contact sheets are in `swarmer/preview/`.

## Known (to fix in the full render)

The Brute's widest rims (glow and telegraph) touch the bottom edge of the 160 px frame for the first 5 frames of the attack in SE/SW. The body itself is inside. If the design is approved, I'll give him a 176 px frame.
