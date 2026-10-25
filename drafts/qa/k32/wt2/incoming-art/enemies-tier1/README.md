# Tier 1 shadow creatures (Batch 2, review redesign): technical sheet

**Status: full sets, after Jay approved the redesign and the glow fade.** All four have every animation in 8 directions. The old designs are in git history only.

| Enemy | Frame | Feet anchor (px) | Animations |
| --- | --- | --- | --- |
| Swarmer | 128 × 128 | (64, 105) | idle, move, windup, attack (jab), hit, stagger, defeat |
| Shield Guard | 128 × 128 | (64, 105) | idle, move, windup, attack (shield bash), hit, stagger, defeat, plus `shield` / `shield-broken` layers on every animation |
| Brute | **208 × 208** | (104, 170.6) | idle, move, windup, attack (smash), hit, stagger, **winded**, defeat |
| Floor Keeper | 256 × 256 | (128, 210) | idle, move, windup_slam, slam, windup_sweep, sweep, **call** (calling for help), hit, stagger, defeat |

**Frame sizes:**
- Every frame is at **80 px per tile**, with the feet at the same 82% height of the frame (`anchor` in each json).
- The Brute's frame grew from 128 to 208 px so his wide body, fists and glow and telegraph rims never touch the edge.
- Claude Code should position each sprite by its json `anchor` and `frameWidth`/`frameHeight`, not by a fixed 128.

All four come from one script (`source/build_enemy.py --enemy <id>`) and the shared `tools/render_sprites.py`: same camera, 8 directions N..NW, 80 px per tile, the toon look from `tools/toon_kit.py`. Sizes and timings come from `content/enemies/*.json` (20 ticks per second).

```bash
bash incoming-art/enemies-tier1/source/render_all.sh                    # all four: build + full render + previews (about 25 min)
bash incoming-art/enemies-tier1/source/render_all.sh brute              # one
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
| **Brute** (0.48) | Wide and low, an ox-like hulk: a shoulder hump, a heavy brow, a soft snout, **big fists** with magenta bands, rounded **horn stubs** with magenta tips | Crimson-magenta `#e8337a`, rim `#ff5c9d`, eyes `#ffb3d6` | **Heavy stomps** with a big sway. Heavy breathing when idle | **208 px** |
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
| `shield`, `shield-broken` | none | Shield Guard: exactly one of them | The intact shield or the same shield cracked in two halves. Draw `shield-broken` for a moment when it breaks, then neither until it grows back (6 s) |
| `glow` | none | always | The soft rim in the type's accent colour |
| `telegraph` | **yes** (neutral white) | wind-ups and attacks, at `telegraphIntensity` | The danger rim |
| `light` | none | always (only the defeat has anything) | The defeat light orb and sparkles |

## Previews (`preview/`)

- `swarmer_anim.gif`, `shield_anim.gif`, `brute_anim.gif` and `keeper_anim.gif`: every animation in sequence at its real fps, S/E/SE, with the glow ramp and fade. The Shield Guard GIF ends with idle and move holding the broken shield.
- `windup_compare.gif`: all four wind-ups into their attacks, on the same scale.
- `lineup-redesign.png`: all four at 1x and 2x, S and E, idle and wind-up.
- `review-1-windups-and-attacks.png`, `review-2-specials.png` and `review-3-defeat-sparkle.png`: review these first.
- Each enemy's per-animation GIFs and contact sheets (all 8 directions) are in `<enemy>/preview/`.

## Checks done

- **Clipping:** every animation, layer, direction and frame was checked for pixels on the frame edge. None of the four has any.
- **Looks:** checked by eye in all 8 directions (contact sheets).
- **Intersections:** the bodies are soft blobs, and the arms are meant to tuck into them. No prop or shield passes through the body.
