# Quests

Three kinds per floor, plus one cross-floor chain. Rewards never include finished weapons above Common or permanent stats. All quest state uses storage values defined in `server/data/spire/storages.lua` (one block per quest, documented).

## 1. Task board (every floor)

Rotating daily list of 6 tasks per floor; a character may complete 3 paid tasks per floor per day (server save resets).
- Cull: kill 40–80 of one trash type. Pay: 25 × floor-trash average col + 1 common mat bundle.
- Salvage: hand in 20 of a common material. Pay: 1.5 × NPC buy value + small XP.
- Camp elite: kill the named elite of a given camp. Pay: 3 Keen mats of the floor.
Tasks rotate so botting one camp all day does not complete them (R5).

## 2. Labyrinth puzzle (every floor, required to reach the boss room)

| Floor | Puzzle |
|---|---|
| 1 | Bridge levers: three levers on labyrinth level 1 must be set to the pattern carved on the bridge pillar (random each server save) |
| 2 | Burn three blight markers with a torch lit at the labyrinth entrance brazier |
| 3 | Light six lanterns in the order shown by glyphs on level 2 |
| 4 | Great-hall pressure plates: four plates must be weighted at once — by players or by pushing the four stone weights in the hall onto them (solo-capable) |
| 5 | Two side doors: two levers on opposite walls; each stays down 25 s (solo-capable) |

The puzzle resets at server save; once opened it stays open until then.

## 3. Floor story quests

| ID | Floor | Name | Steps | Reward |
|---|---|---|---|---|
| Q1-1 | 1 | Bread for the Road | Miller Agna: deliver 10 Hearthroot to Pell; collect flour; bring to Marra | 300 col, Hearth Stew recipe preview (3 stews) |
| Q1-2 | 1 | The Lost Patrol | Captain Dorrow: find 3 patrol tags in Bandit Road camps (elites drop them 100% once per character) | 800 col, Wayfarer cloak dye |
| Q1-3 | 1 | Millstone | Agna: kill Thornsnaps until 5 Mill Gears drop (25%); repair the mill | 600 col, access to the windmill roof vista (title "Millhand") |
| Q2-1 | 2 | Stampede | Drover Kel: kill 3 Herd Bulls, return their brands | 2,500 col, 2 Blightglass |
| Q2-2 | 2 | Shrine Water | Shrine-keeper Ona: fill a flask at 3 springs across camps | 1,500 col, Tonic ×10 |
| Q3-1 | 3 | Lamplighter's Debt | Lamplighter Rue: escort her through Lurker Fog to relight 4 lamps | 4,000 col, Lantern upgrade (radius 5) |
| Q3-2 | 3 | Barkreading | Barkreader Tam: collect 6 bark pages from Mantis Glade (drop 20%) | 3,500 col, a page for the chain quest |
| Q4-1 | 4 | Drowned Roll Call | Castellan Ruta: kill 60 Drowned Footmen, return 1 Helm Splinter from Drowned Sergeant | 6,000 col, helm splinter for chain |
| Q4-2 | 4 | Pim's Net | Fisher Pim: retrieve his net from Eel Shallows B (guarded) | 4,500 col, Fish Pier hint (not the secret itself) |
| Q5-1 | 5 | Deserter's Badge | Arena Master Coll: kill 5 Deserter Lieutenants for badges | 9,000 col, 3 Champion Seals |
| Q5-2 | 5 | Ring Rite | Coll: defeat the Arena Warden's trial (solo instance with a weakened copy, 3 tries per day) | 8,000 col, title "Ringwalker Initiate" |

## 4. Chain quest — The Builder's Ledger (floors 1→5)

1. Builder's chit: drops from Axe-Lord's first kill (all credited) or its Echo (100% once per character).
2. Bark page: Q3-2 reward.
3. Helm splinter: Q4-1 reward.
4. Turn in all three at the Hearthgate monument (an inscription asks for them).
Reward: the Builder's Cloak (cosmetic, account-bound), recipe for a Signal Arrow variant with better yield, title "Ledger-keeper". No stats.

## 5. The Underkeep (floor 1, grows with the tower)

Not a quest chain; content in 14. Wing chests: W1 daily common chest, W2 daily keen chest + Drain Matron, W3 trap-room chests (a chest that locks the room and spawns a wave; clearable), W4 hidden smithy bench (one recipe), W5 Vault Warden weekly chest.

No other quest types in the proof.

## Guidance rules (OWNER: no unexplained or hour-long puzzles)

- Every quest step has a quest-log entry stating what to do next and where (17: spire_questlog). NPCs repeat the current step if asked "quest".
- No required puzzle (labyrinth or story quest) should take more than about 15 minutes once understood. Each puzzle has an in-world hint (carved pillar, NPC line, book).
- The website guide explains every story quest step (secrets excluded).
- Completing both story quests on a floor unlocks the floor's perk choice (06).
