# Room brief: The Quiet River (Tier 5, Blue)

DRAFT for R-G2B-25/26/27 (the Artist kit items R-G2B-40 to 42 build from this). The data is in `quiet-river.json`, which uses the `content/rooms/` format with the same legend and no new tile types, and carries `minBeltTier` 5 and `floorSet` `quiet-river` on every room like the Giant's Steps set. Lore comes from `drafts/content/lore/`. First-band enemies: Puddle Frog and Mist Wisp. Second-band enemies: Side Crab and Splash Wave. The Guardian is The River Watcher (`drafts/content/bosses/river-watcher.json`).

## The feel

A wide river once ran through the Tower, and boats carried light from floor to floor. It went still and dark. It should feel hushed and floaty, not scary.

**Palette:** Cool blues, teal and silver on grey stone, with warm lantern-yellow on the boats.

**Lighting and progress:** Rooms warm up as they clear: a lantern lights, the water ripples again, and a boat starts to drift.

**Combat space rule:** every prop on a `.` tile is flat decoration you can walk through. Anything solid is already a `#` tile in the data. Keep the middle of every room clear.

**Hazards come from enemies only, with no new floor tiles:**
- Puddle Frog: Hops in an arc and lands with a splash. Tell: Red circle where it will land.
- Mist Wisp: Fades into mist, then reappears nearby. Tell: Always shimmers before it appears; red circle.
- Side Crab: Holds up its big claw and walks sideways. Tell: Claw snap: red circle.
- Splash Wave: A rolling wave across a lane of the river. Tell: Dash-only: purple striped wave lane + '!!', 24 ticks.
- Bouncy Bopper (padded staff, live Yellow enemy): a padded-staff swing with a warning before it lands; it is already in the game.

Make the floor art plain and light so red circles and purple stripes always stand out. Never use purple, white stripes or red rings anywhere in the floor or prop art.

## Rooms (8 to match a floor: 7 chosen through doors, then the boss)

| # | Room | Kind | Enemies (placeholder sizes) | Layout | Props | Sign |
|---|---|---|---|---|---|---|
| 1 | Ferry Landing | battle | W1: 2 Puddle Frog, 1 Mist Wisp; W2: 2 Puddle Frog, 2 Mist Wisp | Open, with a few small blocks | Wooden dock posts and a tied-up rowboat; flat stepping stones on the floor. | "Wade in slowly. The water is kind." |
| 2 | Reed Bank | battle | W1: 2 Mist Wisp, 1 Puddle Frog; W2: 3 Mist Wisp, 1 Puddle Frog | Scattered single stones | Tall soft reeds along both sides (the '#' blocks are reed clumps); lily pads on the floor. | "Still water, steady breath." |
| 3 | Crab Shallows | battle (room 3+) | W1: 1 Side Crab, 2 Puddle Frog; W2: 1 Side Crab, 1 Mist Wisp, 1 Bouncy Bopper; W3: 1 Puddle Frog, 2 Mist Wisp | Two square blocks on each side | Two sandbars with shells; shallow water ripples on the floor. | "Shells keep soft hearts safe." |
| 4 | Wave Lanes | battle (room 3+) | W1: 1 Splash Wave, 2 Puddle Frog; W2: 1 Side Crab, 1 Mist Wisp, 1 Bouncy Bopper; W3: 1 Splash Wave, 1 Puddle Frog, 2 Mist Wisp | Two long ledges split the room into lanes | Two long stone piers split the room into wide water lanes. | "Let the wave pass, then step in." |
| 5 | The Lantern Barge | challenge (room 4+) | W1: 1 Puddle Frog, 1 Mist Wisp, 1 Side Crab, 1 Bouncy Bopper; W2: 1 Splash Wave, 1 Puddle Frog, 2 Mist Wisp, 1 Bouncy Bopper; W3: 1 Side Crab, 1 Puddle Frog, 1 Mist Wisp, 1 Bouncy Bopper | Two corner blocks on each side | A wide barge with a row of unlit lanterns; two lantern posts in each corner. | "Many oars make the river easy." |
| 6 | Oar Locker | treasure | none | Small room, two blocks near the walls | A wall rack of worn oars; the chest is an old boat locker with a brass latch. | "Many hands rowed here before you." |
| 7 | Still Pool | rest | none | Small room, two blocks | A round pool as flat as glass, with two cushions and a hanging lantern. | "Rest by the water. You are welcome." |
| 8 | The Watching Pool | boss | W1: 1 The River Watcher, 1 Puddle Frog; W2: 1 Puddle Frog, 1 Mist Wisp; W3: 1 Mist Wisp, 1 Puddle Frog | Big open arena | A wide shallow pool with stepping stones; a tall water heron stands in the middle, its feathers streaked with mud. | "Be still, and the water clears." and "Even a heron needs a friend." |

Signs are wooden boards with painted words, one short line each. Treasure rooms have the chest `C` in the middle; rest rooms have the shrine `S`.

## Guardian arena

- **Room:** A wide shallow pool, 18 by 12 tiles of floor, with nothing solid inside. The River Wave lane (striped, with double marks) needs a straight clear run across the room. Puddle Frogs and Mist Wisps join in waves 2 and 3 (placeholder sizes).
- **Where the relic appears:** on the `C` tile in the middle of the room, after The River Watcher is freed. The relic and its text come from the faith overlay under the key `river-watcher`; the art and data here hold only the key, never the text. The light piece rises from the same spot.

## Teaching the newest move

**Newest-move room:** `crab-shallows` holds the Side Crab, where Hook Kick (#5) is wanted (taste call 1 on what "around a guard" means is still Jay's). Rooms 3-4 and the challenge room also hold a padded-staff **Bouncy Bopper** (the live Yellow enemy) so Disarm, X-Block, Turn It Back and Wrist Kick (#21, #23, #24) have something to answer. Splash Wave lanes are in `wave-lanes`.

## Notes for the Programmer and Tester

- Wave sizes are placeholders until balance work. No enemy stats are in the room file.
- The challenge room uses the existing challenge rules. Its 90 seconds is the Supper Rush number (placeholder), and its kid text has no digits, so the screen should show the number itself.
- Elites exist only for Brute, Swarmer and Shield, so none of these rooms has one (R-G2B-28 covers elites).

Check tools: `python3 drafts/content/tools/check-rooms-tier.py` (all tier sets) and `node --experimental-strip-types drafts/content/tools/check-rooms-load.mjs drafts/content/rooms/quiet-river.json` (loads every room with the game's own `loadRoom`).
