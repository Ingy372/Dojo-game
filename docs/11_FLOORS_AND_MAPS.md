# Floors and maps

Players want to see each other (R7), and the whole server is on floor 1 until the first clear. So floor 1 is the largest floor, Hearthgate is the single social hub, and later floor towns are small.

## Coordinate plan (one OTBM)

| Region | Origin (x, y) | Size | Surface z |
|---|---|---|---|
| Floor 1 | 1000, 1000 | 400 × 400 | 7 |
| Floor 2 | 1500, 1000 | 300 × 300 | 7 |
| Floor 3 | 1900, 1000 | 300 × 300 | 7 |
| Floor 4 | 2300, 1000 | 300 × 300 | 7 |
| Floor 5 | 2700, 1000 | 300 × 300 | 7 |
| Echo and optional-boss instance copies | 4000, 1000 | 30 copies × each room, 40-tile spacing | 7 |
| GM / test area | 5000, 5000 | 60 × 60 | 7 |

Labyrinths rise inside their floor region: levels on z 7, 6, 5; boss room on z 4. The Underkeep lies under Hearthgate on z 8–10. Floors are linked only by stairs at labyrinth tops and teleport gates in town plazas; the stair to floor N+1 is a teleport tile in the boss room's back chamber, sealed until first kill.

## Map authoring format (AI-editable, no GUI)

```
/maps/src/floor_01/z07_ground.txt   one char per tile (legend.csv: '.' grass, ',' path, '=' cobble, '~' water, '#' stone wall, 'T' tree, 'r' rock, ' ' void)
/maps/src/floor_01/z07_objects.txt  same grid; furniture, doors, stairs, decorations (or '.' for none)
/maps/src/floor_01/points.csv       type,x,y,z,ref,params  (npc, spawn, door, house_rect, trigger, sign, chest, zone_rect)
/maps/src/legend.csv                char,layer,item_id,notes
```

- `zone_rect` types: town, pz, house, camp, labyrinth, bossroom (sets tile flag spire_bossroom), pass, underkeep_wing_N, secret_gate, instance.
- `house_rect` rows produce houses.xml with the house_id from data/houses.csv; door tiles are listed explicitly.
- compile_map.py validates: every walkable region reachable from the temple (except instances and secret interiors), every house has a door, every spawn sits on walkable ground, no secret gate on the main route.
- render_map.py writes `maps/preview/floor_XX_zYY.png` (1 px or 4 px per tile, colored by legend and zone). Attach previews to STATUS.md at each mapping gate.

## Floor template

Every floor: one town with temple, depot, smith, armorer, quartermaster, teleport plaza, Vesper stall, house district, task board, strategy-board square; 6–14 camps; a pass arena with the field boss; a labyrinth of 3 levels with a puzzle; a boss room; 12 secret gates. The stair is signposted. Secrets are not.

## Floor 1 — Hearthgate plains (400 × 400)

Biome: grass, broken ruins, windmills, a river running north–south.

| Area | Approx. position (relative to origin) | Size | Contents |
|---|---|---|---|
| Hearthgate | (160, 260) | 90 × 80 | Walled town; temple, depot + market hall, monument square, bank, inn (8 inn rooms), smith, armorer, quartermaster, registrar, guild hall office, Vesper's main board, teleport plaza, 24 cottages in two streets |
| Millcross | (40, 180) | 50 × 40 | Windmill village; inn, strategy-board square, 6 cottages |
| Camps 1–14 | ring around both towns | 25–35 tiles each | See table |
| The Pass | (300, 90) | road through cliffs; arena 24 × 20 with door | Gate Hound |
| Labyrinth | (320, 20) | 60 × 60 per level, 3 levels | Corridors 2–3 tiles; level 3 has Sentinel Captain; lever puzzle on level 1 (bridge levers) |
| Boss room | labyrinth z4 | 30 × 24 + back chamber | Axe-Lord, stair to floor 2 |
| Underkeep | under Hearthgate, z8–10 | see 14 | Grate entry (s1) |

Floor 1 camps (14, sized for launch crowding):

| # | Name | Monsters | Elite |
|---|---|---|---|
| 1–3 | Boar Meadow A/B/C | Bristle Boar | — |
| 4–5 | Wolf Copse A/B | Meadow Wolf | Grey Alpha (B) |
| 6–7 | Shard Fields A/B | Field Shardling | — |
| 8–9 | Bandit Road North/East | Road Bandit | Bandit Captain (both) |
| 10–11 | Thornsnap Hollow A/B | Thornsnap, Bristle Boar | — |
| 12 | Ruin Fringe | Ruin Sentinel, Road Bandit | — |
| 13 | River Bend | Meadow Wolf, Thornsnap | — |
| 14 | Old Quarry | Field Shardling, Ruin Archer | — |

Hunting capacity at launch (party of 4 + 1 per pocket): 14 camps × 2 pockets ≈ 140 players, labyrinth 3 levels × 4 pockets ≈ 60, Underkeep wing 1 ≈ 30 → about 230 hunting slots on floor 1. With typical town idling, that carries 350–500 online before floor 2 opens; patch P6 shortens respawn as population rises.

## Floor 2 — Highrest highlands (300 × 300)

Table-topped hills, dry grass, herds. Town Highrest sits in a crater (60 × 50): 20 houses on terraces. 8 camps: Grazer Flats A/B, Cat Ledges A/B, Strider Run, Cutthroat Gully, Wasp Thicket, North Camp (reached normally; s17 is a one-way shortcut into it). Pass: Horn Brute arena. Labyrinth puzzle: burn three blight markers (use a lit torch from the labyrinth entrance on three marker tiles). Boss room: Crowned Aurochs (long room 34 × 20 for charge lines).

## Floor 3 — Rootwell fog wood (300 × 300)

Dense forest, permanent light reduction on surface (TFS world light low; Lanterns matter). Town Rootwell is built in a giant tree (multi-z 7–5), 16 treehouses + guild hall. 8 camps: Bat Roost, Crawler Bog A/B, Lurker Fog, Mantis Glade, Wisp Hollow, Root Maze, Deepwood. Pass: Mossback Warden. Labyrinth puzzle: light 6 lanterns in the correct order shown by carved glyphs (distinct from secret s27). Boss room: Sleeping Trunk (round room radius 12).

## Floor 4 — Lakehold (300 × 300)

A lake with a castle on the far shore; town Lakehold under the castle walls: 16 houses on the waterfront. 8 camps: Eel Shallows A/B, Drowned Causeway, Reed Marsh, Crab Beach, Hound Kennels, Castle Approach, Sunken Road. Pass: Lake Knight on the causeway gate. Labyrinth (inside the castle) puzzle: pressure plates in the great hall (distinct from secret s44's bells). Boss room: Knight of the Closed Helm (throne hall).

## Floor 5 — Ringhold (300 × 300)

Stone ring-city around a colosseum. Town Ringhold on the outer ring: 12 houses + guild hall. 8 camps: Deserter Barracks A/B, Construct Yard, Hound Pits, Brawler Ring, Archer Walls, Sand Pits, Broken Aqueduct. Pass: Arena Warden at the inner gate. Labyrinth: the colosseum undercroft; open two side doors before the hall: two levers on opposite walls must both be down at the same time; each lever stays down for 25 s, and the walk between them takes about 15 s, so one player can do it alone and two players do it easily. Boss room: Empty Colossus (arena floor 36 × 36).

## Teleport gates

Each town plaza has a gate. A gate lights when its floor opens. Using a gate costs col (07). Floor 1's gate exists at launch but only lists opened floors.
