# Delivery Note: bestiary set 2 (Shellback Snail, Vine Sweeper, Pebble Pal)

Delivered: sheets, blends, build script, contact sheets, GIFs and a line-up with every bestiary enemy on main (sample,
set 1, tier 3 Orange sample) plus the player and Tier 1. Built exactly like set 1 (#234). Only `incoming-art/bestiary-set2/`
is touched; no game code. The rest of the plan is not started.

Second pass: checked every contact sheet in 8 directions. Nothing goes above the head (the snail's feelers are short and
at head level, the vine's leaves lie flat, the pebble's moss sits low at the back). The faces are friendly from the front
and side views (round eyes, cheeks, no brows). The silhouettes are distinct from each other and from the lineup: a shell
on a long foot, a wide tangle with long arms, a tiny flat oval. No re-render was needed.

Red check on all body / glow / light sheets: 0 on the vine and pebble. 98 anti-aliased edge pixels on the snail
(rgb ~168,118,91 = caramel shell in shadow, brown, not visible as red). Red only in the telegraph layer / preview tint.

Lineup note: Rolling Pin and Doughling (PR #244) are not on main yet, so they are not in the lineup; the script adds them once merged.

## v2 (Manager review)
- Vine Sweeper recoloured toward teal-blue so it clearly stands apart from the Thorn Sprout's green: body `#1c3a52`, belly `#2a5670`, vines/leaves `#2f8fa6`, rim `#9fe0f5` (was teal `#1f4a4a` / green `#3f8a4f` / mint `#8fe3c0`). The game's data colour `#3f8a4f` is left alone (drafts are read only); use `#2f8fa6` if it should match the art.
- Sweep arc: checked `bestiary-plan.md` (Vine Sweeper row: "purple striped arc + '!!', 28 ticks", "Arc width fixed") and `vine-sweeper.json` (`attack` and `dashOnlyAttack`: shape "arc", reach 3.0, areaRadius 0.6, no angle). No arc angle is set anywhere, so the drawn sweep stays at 150 degrees. The arc the player sees is drawn by the game.
- Re-rendered the vine sheets, contact sheets, GIFs and `preview/lineup.png`. Snail and pebble unchanged.
- Second pass (v2): checked the vine in 8 directions; leaves still flat and below the head, friendly face, the teal-blue reads clearly apart from the sprout in the lineup. Red check on the vine: 0.

## DECIDE
1. Working looks and colours: snail plum + caramel shell + peach rim, vine blue-teal + teal-blue vines + ice-blue rim, pebble grey stone + moss + periwinkle rim. OK, or other colours? (open, for Jay)
2. DECIDED (Manager): keep the snail's `hide` animation.
3. DECIDED (Manager): no extra animation for the Vine Sweeper.
4. DECIDED (Manager): keep the moss on the pebble.
5. DECIDED (Manager): the vine colour moved to teal-blue (see v2).
6. Sweep arc: no angle in the plan or data, kept at 150 degrees. Tell me if the game uses a different arc width. (open)
