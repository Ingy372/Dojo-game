# Room brief: The Forge of Courage (Tier 6, Red)

DRAFT for R-G2B-25/26/27 (the Artist kit items R-G2B-40 to 42 build from this). The data is in `forge-of-courage.json`, which uses the `content/rooms/` format with the same legend and no new tile types, and carries `minBeltTier` 6 and `floorSet` `forge-of-courage` on every room like the Giant's Steps set. Lore comes from `drafts/content/lore/`. First-band enemies: Coal Cub and Anvil Imp. Second-band enemies: Bellows Puff and Forge Sweeper. The Guardian is The Ember Knight (`drafts/content/bosses/ember-knight.json`).

## The feel

Smiths once made shields here for anyone who needed protecting, and they sang while they worked. The fires burned too wild and the song was forgotten. It should feel hot and busy but friendly.

**Palette:** Deep reds and warm iron-greys, with gold glints; cool blue steam in the corners.

**Lighting and progress:** Each cleared room cools a little: one fire glows steady, and a bar of the smiths' song comes back.

**Combat space rule:** every prop on a `.` tile is flat decoration you can walk through. Anything solid is already a `#` tile in the data. Keep the middle of every room clear.

**Hazards come from enemies only, with no new floor tiles:**
- Coal Cub: Warm, playful little coal pups that pounce. Tell: Wiggle, then red circle.
- Anvil Imp: A small strong worker who taps a big hammer. Tell: Hammer up; red circle.
- Bellows Puff: Huffs gusts that nudge you across the room. Tell: Inflates; a pale gust arrow (no damage).
- Forge Sweeper: A big glowing broom that sweeps a wide arc. Tell: Dash-only: purple striped arc + '!!', 22 ticks.

Make the floor art plain and light so red circles and purple stripes always stand out. Never use purple, white stripes or red rings anywhere in the floor or prop art.

## Rooms (8 to match a floor: 7 chosen through doors, then the boss)

| # | Room | Kind | Enemies (placeholder sizes) | Layout | Props | Sign |
|---|---|---|---|---|---|---|
| 1 | Bellows Door | battle | W1: 3 Coal Cub; W2: 2 Coal Cub, 1 Anvil Imp | Short stair-shaped blocks on each side | Two huge leather bellows by the door; cool coals in baskets. | "Warm hands, kind hearts." |
| 2 | Cub Crowd | battle | W1: 3 Coal Cub; W2: 4 Coal Cub, 1 Anvil Imp | Corner blocks at the edges | A cozy corner cushion pile; small cool ember piles on the floor. | "Many little friends. Step with care." |
| 3 | Anvil Alley | battle (room 3+) | W1: 3 Coal Cub, 1 Bellows Puff; W2: 1 Anvil Imp, 3 Coal Cub; W3: 1 Bellows Puff, 2 Coal Cub, 1 Anvil Imp | Two square blocks on each side | Two big anvils with hammers on racks; sparks in jars along the walls. | "Hammers ring. Hearts sing." |
| 4 | Sweeping Hall | battle (room 3+) | W1: 1 Forge Sweeper, 2 Coal Cub; W2: 1 Bellows Puff, 1 Anvil Imp, 2 Coal Cub; W3: 1 Forge Sweeper, 1 Bellows Puff, 2 Coal Cub | Two long ledges split the room into lanes | Two long work benches with brooms; a bright clean floor for the sweep lanes. | "Wide sweeps, wide smiles. Step aside." |
| 5 | Smith's Rush | challenge (room 4+) | W1: 3 Coal Cub, 1 Anvil Imp; W2: 1 Bellows Puff, 3 Coal Cub, 1 Anvil Imp; W3: 1 Forge Sweeper, 3 Coal Cub | Two corner blocks on each side | A big forge clock above the door, a bucket of cool water in each corner. | "Strong hands, kind heart." |
| 6 | Shield Rack | treasure | none | Small room, two tall blocks | A rack of round shields; the chest is a smith's tool chest with a red lid. | "Shields are for helping." |
| 7 | Cool Embers | rest | none | Small room, four blocks | A bed of glowing coals that do not burn, two cushions and a kettle. | "Rest by the coals. They are gentle." |
| 8 | The Knight's Forge | boss | W1: 1 The Ember Knight, 2 Coal Cub; W2: 3 Coal Cub; W3: 1 Anvil Imp, 2 Coal Cub | Big open arena | A huge round forge with a glowing mouth; the Ember Knight stands before it with a raised shield. | "Open your shield. Welcome a friend." and "Strong hands, kind heart." |

Signs are wooden boards with painted words, one short line each. Treasure rooms have the chest `C` in the middle; rest rooms have the shrine `S`.

## Guardian arena

- **Room:** A wide open forge floor, 18 by 12 tiles, with nothing solid inside. The big round forge fills the top wall. Coal Cubs and an Anvil Imp join in waves 2 and 3 (placeholder sizes). The Knight's Spark Shield is the one designed place where Strikes break shields.
- **Where the relic appears:** on the `C` tile in the middle of the room, after The Ember Knight is freed. The relic and its text come from the faith overlay under the key `ember-knight`; the art and data here hold only the key, never the text. The light piece rises from the same spot.

## Teaching the newest move

**Newest-move rooms:** the crowd rooms (`cub-crowd`, `anvil-alley` and `smiths-rush`) put three or more Coal Cubs close together, and `smiths-rush` adds an Anvil Imp, so Break Free (two or more enemies within one tile while you Block) has a reason to be used. `sweeping-hall` holds the Forge Sweeper's long striped lanes, where Lunge (#6) helps cross the room. Tester: check Bellows Puff's gust and Break Free's push-back do not cancel in a confusing way.

## Notes for the Programmer and Tester

- Wave sizes are placeholders until balance work. No enemy stats are in the room file.
- The challenge room uses the existing challenge rules. Its 90 seconds is the Supper Rush number (placeholder), and its kid text has no digits, so the screen should show the number itself.
- Elites exist only for Brute, Swarmer and Shield, so none of these rooms has one (R-G2B-28 covers elites).

Check tools: `python3 drafts/content/tools/check-rooms-tier.py` (all tier sets) and `node --experimental-strip-types drafts/content/tools/check-rooms-load.mjs drafts/content/rooms/forge-of-courage.json` (loads every room with the game's own `loadRoom`).
