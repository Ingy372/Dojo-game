# Bosses

HP and XP are in data/monsters.csv and data/echoes.csv. HP comes from a damage model (tools/gen_tables.py): one prepared player's sustained DPS at the floor band × expected headcount × target kill time. Floor bosses: 8 players, 5 minutes. Field bosses: 8 players, 2.5 minutes. Echoes: 4 players, 4 minutes. Enrage time scales with the number of players who started the attempt: 8:00 for 8 or more, up to 60:00 for one player (05). Echoes always enrage at 8:00 because they are tuned for 4.

Every mechanic below uses only fields, summons, telegraphed area damage, conditions, and movement — all available in TFS Lua. Every heavy hit telegraphs with effect 207 for 600 ms.

## Floor 1

**Gate Hound (field boss, the pass).** Three-headed hound silhouette. Bites the highest-threat target. Every 20 s it howls (telegraph ring 2 tiles), fearing (forced 2-tile retreat) anyone inside; Shieldwall ignores fear. At 50% it summons 3 Meadow Wolves.

**Axe-Lord of the Stair (floor boss).** Phase 1 (100–60%): marks one tile under a random player, cleaves it 600 ms later (heavy). Phase 2 (60–25%): summons 2 Sentinel Captains; mark becomes 2 tiles. Phase 3 (below 25%): drops the axe and draws a long curved blade; the mark becomes a 3-tile line in the boss's facing and it turns to the furthest player before swinging. The seeded strategy book only describes phases 1 and 2. That gap is the "the beta notes were wrong" moment. Do not reveal phase 3 in any shipped text.

## Floor 2

**Horn Brute.** Stomps (radius 1 heavy) every 12 s, gores the tank, and at 40% enrages (+20% speed).

**Crowned Aurochs.** Every 15 s marks a straight charge line across the room (telegraph whole line), then charges; side tiles are safe; anyone hit is knocked 2 tiles and stunned 1 s. At 50%, two Herd Bulls join. The crown glows gold before each charge.

## Floor 3 (fog: vision radius reduced to 4 tiles in the boss room; Lanterns restore 6)

**Mossback Warden.** Roots (1.5 s) a random player every 15 s; spore cloud field 3×3 on its own tile every 25 s.

**Sleeping Trunk.** Starts asleep. While asleep it takes damage normally but attacks anyone who moves more than 2 tiles within any 3-second window inside a 6-tile radius (wake check every 1 s). Awake: slams the last mover (heavy), then falls asleep again after 2 seconds with no qualifying movement. Melee can step to engage; running around wakes it. Rivals in the PvP room can deliberately move to wake it — that is allowed.

## Floor 4

**Lake Knight.** Shield bash (1-tile knockback), lance thrust line 3 (heavy). Splash field (slow) under itself at 50%.

**Knight of the Closed Helm.** Every 20 s the helm visor shuts (telegraph: effect on the boss for 1 s), then silences all skills in the room for 4 s. Basic attacks, salves and bandages still work. At 30%, silence lasts 6 s and comes every 15 s.

## Floor 5

**Arena Warden.** Rotates three stances every 20 s: shield (−50% damage taken from front), spear (line 4 heavy), net (roots one player 2 s).

**Empty Colossus.** At 50% it splits into two bodies, each with half of the remaining HP. Both must die within 10 seconds of each other. If one dies alone, it rises after 10 s at 50% of its split HP. Last hit = killing blow on the second body.

## Echoes

Same scripts as the first kill, HP from echoes.csv, party of 1–4, instanced, 20 h lockout per character per floor. Echoes never show titles or glows.

## Optional and Underkeep bosses (party of 4, instanced or gated)

| Boss | Where | Mechanic |
|---|---|---|
| Old Tusk | s2 | Charge (2-tile telegraph), wallow mud field slows |
| Drain Matron | Underkeep W2 | Drains 5% max HP per second from players standing in water tiles; the room has 40% water |
| Ridge Alpha | s14 | Pounces to a random player at range ≥ 3 |
| Hollow Bull | s19 | Smaller Aurochs charge, no adds |
| Fir Rumor Beast | s21 | Snow field 3×3 slows; drops 1 Debt Chip to the top-damage party (bound) |
| Canopy Mother | s26 | Spawns 3 Spore Bats every 30 s |
| Waking Root | s31 | Sleeping Trunk rule at radius 4 |
| Eel King | s38 | Submerges (immune 4 s) and resurfaces at a random water edge |
| The Unhelmed | s41 | Silence aura 3 tiles, permanent |
| Deserter Captain | s50 | Calls 2 Deserters at 70% and 35% |
| Cracked Copy | s53 | Empty Colossus split rule, 10 s window, smaller |
| Vault Warden | Underkeep W5 | Chained lantern + tower shield (NOT a scythe). Lantern sweep: the room goes dark except a rotating 90° cone of light; standing in darkness 3 s applies a stacking 10% damage-taken debuff. Weekly chest: floor-5 materials and one Debt Chip (bound) |

## Credit, last hit, resets

05_WORLD_RULES governs: 90-second credit window, top-20 by contribution, field/bleed ownership, reset after 60 s without damage, empty-room reset after 30 s.
