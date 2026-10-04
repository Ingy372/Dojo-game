# Monsters and drops

All stats live in data/monsters.csv and data/echoes.csv. This doc gives the rules for turning rows into TFS monsters.

## Roles

| Role | Where | Respawn | Design intent |
|---|---|---|---|
| trash | camps, labyrinths, Underkeep | 60 s (patch P6 dynamic) | Hunting bread and butter |
| elite | 1 per camp, labyrinth level 3 | 10 min | Keen materials, recipe scraps |
| mini | secrets | 30 min | Party of 4, open world behind a secret gate |
| optional | secrets, instanced | per-character 20 h lockout | Party of 4, Spire Scrap chance |
| field_boss | the pass | never | World event, 8 to 20 players |
| floor_boss | boss room | never (Echo instead) | World event, 8 to 20 players |

## Converting a row

- hp, xp, melee_max straight from the CSV.
- armor = round(melee_max × 0.15) for trash, × 0.25 elites and bosses.
- speed: trash 180 + 4 × floor, elites +20, bosses 220.
- Attacks: melee every 2 s, damage 0..melee_max. Notes column adds one special each (charge, poison field, ranged, etc.), always telegraphed if it deals more than 25% of a band-mid player's HP.
- Looktype from assets.csv (placeholder until art).
- Names come from the CSV and pass tools/check_names.py.

## Drop logic

`server/data/spire/loot.lua` is generated from the drops column. Format:

```lua
LOOT[monsterId] = {
  col = {min, max},
  rolls = { {item=5102, chance=40.0, min=1, max=2, group="mat"}, ... }
}
```

Rules:
1. One roll per row, except rows sharing a `group` (one roll per group per kill).
2. Chances are percentages; the sim must hit them within ±10% over 10,000 kills.
3. Corpse loot belongs to the top damage dealer (or their party) for 10 s, then anyone (TFS default ownership).
4. Do not also define loot in monster XML. The XML gets an empty loot block; a Lua onDeath fills the corpse.
5. Elite recipe scraps and Spire Scraps are logged in `rare_drops(time, monster, item, player)`.
6. Floor-boss loot rows apply only on the first kill; Echo loot comes from echoes.csv.

## Population

Each camp in 11 lists spawn points; default density 1 trash per 24 walkable tiles of camp area, elites placed at the camp heart. Patch P6 shortens respawn as population rises.
