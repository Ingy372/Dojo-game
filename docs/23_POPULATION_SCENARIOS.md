# Population scenarios: 50–100 vs 500

Most OT servers live at 50–150 players (R6). The design must feel alive there and survive 500. This doc checks every system at both ends and defines the switches that change with population.

## Population mode

`spire_population.lua` computes the 7-day average of online players every server save:

| Mode | 7-day average online |
|---|---|
| LOW | under 100 |
| NORMAL | 100–300 |
| HIGH | over 300 |

Patch P6 (respawn speed) uses the current online count, not the mode.

## System by system

| System | At 50–100 | At 500 | Switch or fix |
|---|---|---|---|
| Floor progression | Raid of 8 may take days to assemble | Fast race, PvP in the room | Enrage scales with headcount (05). Tower weakening: if a floor boss or field boss is still alive 21 days after its floor opened, it loses 10% max HP per additional week (cap −30%) so a small server never stalls |
| Hunting space, floor 1 | Plenty | ~230 camp slots + Starter Fields ~150 + Guarded roads | Starter Fields (22), dynamic respawn (P6) |
| Seeing other players | Risk of an empty world | Crowds | World events in LOW mode every 2 h on the floor with the most players; all paths of travel run through Hearthgate's plaza |
| World events | — | — | LOW: every 2 h, most-populated floor. NORMAL: every 3 h, random opened floor weighted by players present. HIGH: every 3 h, two events at once on different floors |
| Party finding | Hard | Easy | LFG window and raid calls (17); Mentor sharing (05) |
| Contested zones | Few fights; still the best XP | Constant fights | No switch. Blood Mark anti-farm rules always on |
| Market liquidity | Thin | Deep | NPC floor prices for commons and Keen mats (07) |
| Houses | Floor-1 supply (38) may exceed demand | Scarce | Fine either way; rent is a sink. Guild halls require 10 members in NORMAL/HIGH, 6 in LOW |
| Head start | Few credited players | Up to 20 | Half-district cap always applies |
| Echoes | Plenty of copies | 30 copies × 4 = 120 players per floor at once | If all copies are busy, a queue at the portal shows position |
| Boss room | Rarely full | Full, contested | Cap 20 living; slots free on death |
| Secrets | Many undiscovered for weeks | Found fast; crowd risk | Trigger placement rule below |
| Chat | Quiet | Spam risk | Level 10 + rate limits (22) |
| Economy | Money supply per player matters more than total | Inflation risk | Alarms use per-active-player money supply (07) |
| Staff load | Owner can keep up | Owner can't | Automated first, tutors from week 2, moderator past ~150 average (16) |
| Hearthgate performance | Fine | 300+ players in one town | Three depot halls, two temple exits, duplicated quartermaster and smith NPCs, no heavy animated decorations in the plaza |
| Login at launch | Fine | Login flood | maxPlayers 600, login queue message, rate-limited logins |

## Secret trigger placement (crowd rule)

Because everyone on screen when a secret is found gets a packet, a trigger in a crowded spot is not a secret. Map rule, checked by tools/compile_map.py:
- No trigger tile may be visible (within 8 × 6 tiles on the same z) from any road, plaza, depot, temple, teleport gate, or camp heart tile.
- Floor-1 changes: s1 Underkeep grate moves to a dead-end drainage alley behind the old tannery; s4 Inn Smith's pantry is reached through the inn's back kitchen (not the common room); s10 Well Vein uses the ruined well in the abandoned east yard, not a town well; s12 Gate Balcony moves to the broken side tower.

## Blood Mark anti-farm (tightened)

A Contested kill awards a Blood Mark only if all are true:
- killer and victim are not guildmates, party members, or on the same IP;
- the same killer has not marked the same victim in the last 30 minutes;
- the victim is no more than 30 levels below the killer;
- the victim took or dealt damage to a monster in the last 2 minutes (they were actually hunting).

## Population tests (added to phase 8 and 9 gates)

- 60-player loadbot scenario (40 hunting, 20 in town): a world event fires on the most-populated floor in LOW mode; the market NPC floor prices work; nothing depends on a crowd to function.
- 500-player loadbot scenario (existing load test) plus 150 bots in the Starter Fields and 200 in Hearthgate: tick targets still met.
- Tower weakening: a GM time-skip of 28 days with a living floor boss reduces its HP by 10%.
