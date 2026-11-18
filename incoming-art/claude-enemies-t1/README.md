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
