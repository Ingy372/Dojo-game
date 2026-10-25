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

## DECIDE
1. Working looks and colours: snail plum + caramel shell + peach rim, vine deep teal + green vines + mint rim, pebble grey stone + moss + periwinkle rim. OK, or other colours? (open, for Jay)
2. The snail's extra `hide` anim (into the shell, eyes peek out). Keep it (does the game want a hide state?) or drop it?
3. No hide / extra anim on the Vine Sweeper. OK?
4. The moss patch on the pebble's back: keep, or plain stone?
5. The Vine Sweeper's green is close to the Thorn Sprout's green; the teal body and mint rim keep them apart. OK, or move the vine further (e.g. more blue)?
6. The Vine Sweeper's windup is tagged `dashOnly` (from the data: dash only, 28 ticks), and the sweep is drawn at 150 degrees. Is that the arc the game uses?
