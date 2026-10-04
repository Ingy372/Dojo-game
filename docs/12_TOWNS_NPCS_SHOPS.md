# Towns, NPCs, shops

Shop contents and prices: data/shops.csv (generated). NPCs are built with the TFS NPC system plus one shared Lua module `spire_npc.lua` that reads shop lists and keyword tables from `server/data/spire/npcs.lua`. Every NPC answers: hi, bye, job, name, and the keywords listed. Names below are original and must pass check_names.

## Hearthgate (floor 1, the hub)

| NPC | Role | Keywords / services |
|---|---|---|
| Sister Ilse | Temple keeper | heal (free below level 20), debt (clears XP debt for 0.5 col/point), tower (lore) |
| Orm the Registrar | Paths and spec | path (explains paths), spec (Brand/Ward at 20; 25,000 to switch), respec (free once lv 20–25, then 2,000 × floor) |
| Smith Garron | Weapons, upgrades | trade (Hearth weapons), upgrade (smithy window), recipes |
| Talia the Armorer | Armor | trade |
| Marra the Quartermaster | Supplies | trade (food, salves, tonics, arrows, tools) |
| Banker Hobb | Bank | deposit, withdraw, balance, transfer, change |
| Postmistress Wren | Mail | mailbox and parcels (TFS) |
| Clerk Abney | Houses | houses (lists for sale on this floor), buy (at the door), rent, leave |
| Guildwarden Sela | Guilds | found guild (20,000), war (contract: both leaders, 10,000 each, break fee set at signing 10,000–500,000, ends at 7 days or on payment) |
| Vesper | Secret broker | sell, copies, board, tell (buys a strategy tell 200 col, once per boss per character) |
| Gatekeeper Holm | Teleport | travel (lists opened floors and fees), attune |
| Dye Merchant Lisbet | Cosmetic sink | dyes, recolor, plaques (monument plaque engraving 50,000) |
| Crier Benno | News | news (last world-first, open floors, server save time) |
| Captain Dorrow | Guards / skulls | skulls (explains rules), guards. Guards at each gate attack black skulls only |
| Task board (object) | Daily tasks | 3 tasks/day/floor (13) |
| Monument (object) | Records | read: credited names per floor, Last Blow names |

## Millcross (floor 1 village)

| NPC | Role | Keywords / services |
|---|---|---|
| Pell the Innkeeper | supplies (small markup) | trade, rumor (hints at 2 floor-1 secrets per day, rotating) |
| Miller Agna | quest giver | flour, mill (quest Q1-3) |
| Old Fenn | strategy-board keeper | board, tell (read-only seeded book + writable book) |

## Floor towns 2–5

Each has: temple keeper, smith, armorer, quartermaster, banker (floors 3 and 5 only), house clerk, gatekeeper, Vesper stall, strategy-board keeper, task board, and one or two quest givers (13). Names:

| Floor | Town | Smith | Armorer | Quartermaster | Clerk | Board keeper | Quest givers |
|---|---|---|---|---|---|---|---|
| 2 | Highrest | Brannoc | Yeva | Tobb | Clerk Harl | Herdmother Sade | Drover Kel, Shrine-keeper Ona |
| 3 | Rootwell | Ashwen | Moss-tailor Bree | Fennick | Clerk Ivo | Lamplighter Rue | Barkreader Tam, Woodward Lin |
| 4 | Lakehold | Halvard | Ness | Quill | Clerk Marlo | Ferryman Os | Castellan Ruta, Fisher Pim |
| 5 | Ringhold | Korra | Dane | Sutter | Clerk Vasha | Old Champion Ytz | Arena Master Coll, Quartermaster's clerk Ebb |

## Shop rules

- NPC sell prices: data/shops.csv. Village markups are intentional (Millcross +5–10%).
- NPC buy prices: only items with npc_buy_price > 0 in weapons.csv, armor.csv, materials.csv. Keen and Tempered materials are never bought by NPCs.
- NPCs sell the worst arrow and the weakest consumables above craft cost, so a broke player can always function and crafters still have a market.
- No NPC sells anything with an attack value above that floor's Common base.
