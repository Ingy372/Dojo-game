# Tier 1 monsters, bright draft (Claude Code, Nov 18 2026)

Art audit item 1 (`docs/reviews/art-audit-2026-11-18.md`). **Draft: not in the game until Jay approves.**

- Same shapes, rig and animations as the Art Director bot's set (`incoming-art/enemies-tier1/`), so game timings and data don't change.
- Brighter bodies: Swarmer sky blue, Shield Guard green, Brute berry pink, Floor Keeper royal purple with a red cape. Rim glow colours kept.
- White eyes with dark pupils and a shine, pink cheeks on everyone, cream horns on the Brute.
- `source/build_enemy_bright.py` (a copy of the bot's `build_enemy.py`, plus the Blender 5 animation fix). Build and render like the bot's `render_all.sh`, with Blender 5.3.
- Preview: `preview/before-after-bright.png` (on the White belt stone floor colour, 3x).

Still to do once Jay picks: render every animation and direction, re-pack `enemies-t1` (and the Journal trophies and stickers that show these monsters), check on a phone.

## Version B: night (Nov 18, after Jay's feedback)

Jay on version A: "a bit too much and over the top ... 8+ would feel it's too kiddish". Version B keeps the shadow family
(glowing eyes, no pupils, no cheeks), lifts the body colours so they read on the floor (cobalt, deep teal, plum, royal indigo
with a dark red cape), makes the eyes a little bigger and adds angled brows so they look determined, not cute.
`source/build_enemy_night.py`, blends in `source/night/`, preview `preview/today-bright-night.png`.

## Version C: the Shades, a full redesign (Nov 18, Jay: "totally redesign the monsters ... forget Grok's design")

Jay liked Grok's colours more than mine, so C keeps them (deep indigo, one glowing accent each) with brand-new shapes.
**The idea:** the Shadow that poured into the Tower took shape as Shades, masked creatures of living ink, each carrying a
stolen shard of the shattered light in its chest. Beat one and the shard is set free (the existing dissolve-into-light).
Determined glowing eyes under a dark lid, no mouths, no teeth, no claws: rivals, not babies and not scary.

- **Inkling** (Swarmer): a small hooded imp with spiky hood tips, sly teal eyes and a smoky tail.
- **Sentinel** (Shield Guard): a squat armoured shade, samurai-style helmet with a gold V crest, shoulder plates, round shield.
- **Rumbler** (Brute): a huge sumo-like shade, magenta crystal horns and back spikes, stone fists, a face-guard.
- **Warden** (Floor Keeper): a tall robed monk, pointed hood, calm white mask with gold eyes, a crown of light-shards, halo.

Same rig, animations, layers and timings as before, so the game data does not change.
`source/build_shades.py`, blends in `source/shades/`, preview `preview/shades-lineup.png` (today / front / side).
Names are placeholders (game names stay Swarmer, Shield Guard, Brute, Floor Keeper until Jay says).
