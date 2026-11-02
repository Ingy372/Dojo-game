# Room brief: The Summit (Tier 10, Black)

DRAFT for R-G2B-25/26/27 (the Artist kit items R-G2B-40 to 42 build from this). The data is in `summit.json`, which uses the `content/rooms/` format with the same legend and no new tile types, and carries `minBeltTier` 10 and `floorSet` `summit` on every room like the Giant's Steps set. Lore comes from `drafts/content/lore/`. First-band enemies: Storm Wisp and Rumble Brute. Second-band enemies: Echo Knight and Sky Sweeper. The Guardian is The Lost Lightbearer (`drafts/content/bosses/lost-lightbearer.json`).

## The feel

At the very top sits the empty stand where the great light once shone over the town. A brave traveler caught the last piece and held on. It should feel high, quiet and hopeful.

**Palette:** Night blue, charcoal and soft silver, with one warm gold glow ahead.

**Lighting and progress:** Each cleared room lets a little more light shine ahead, so the top feels closer.

**Combat space rule:** every prop on a `.` tile is flat decoration you can walk through. Anything solid is already a `#` tile in the data. Keep the middle of every room clear.

**Hazards come from enemies only, with no new floor tiles:**
- Storm Wisp: Quick storm-cloud wisps. Tell: Crackle, then red circle.
- Rumble Brute: A big storm-wrapped brute; gets winded like a Brute. Tell: Red circle (16 ticks).
- Echo Knight: Remembers every guard trick: shield, turn and copy. Tell: Red circle; shield shines.
- Sky Sweeper: A gust that sweeps an arc, then a lane. Tell: Dash-only: arc then lane, each + '!!', 20 ticks.

Make the floor art plain and light so red circles and purple stripes always stand out. Never use purple, white stripes or red rings anywhere in the floor or prop art.

## Rooms (8 to match a floor: 7 chosen through doors, then the boss)

| # | Room | Kind | Enemies (placeholder sizes) | Layout | Props | Sign |
|---|---|---|---|---|---|---|
| 1 | Summit Steps | battle | W1: 2 Storm Wisp, 1 Rumble Brute; W2: 3 Storm Wisp, 1 Rumble Brute | Open, with a few small blocks | The last wide steps with a soft glow at the top; wind-bent grass in the gaps. | "Almost at the top. One step more." |
| 2 | Wisp Walk | battle | W1: 3 Storm Wisp; W2: 1 Rumble Brute, 3 Storm Wisp | Scattered single stones | A walkway lined with tiny floating lights; rain-dark flagstones. | "Little lights dance in the wind." |
| 3 | Knight Terrace | battle (room 3+) | W1: 1 Echo Knight, 2 Storm Wisp; W2: 1 Rumble Brute, 2 Storm Wisp, 1 Echo Knight; W3: 3 Storm Wisp | Two corner blocks on each side | A terrace with old statues of helpers; each one holds a small lantern. | "Echoes of friends walk with you." |
| 4 | Sweeper Ridge | battle (room 3+) | W1: 1 Sky Sweeper, 1 Storm Wisp, 1 Rumble Brute; W2: 1 Echo Knight, 1 Rumble Brute, 2 Storm Wisp; W3: 1 Sky Sweeper, 1 Echo Knight, 2 Storm Wisp | Two long ledges split the room into lanes | A high ridge with two long wind walls; clouds roll past the open sides. | "The wind sweeps. You stay steady." |
| 5 | The Last Climb | challenge (room 4+) | W1: 2 Storm Wisp, 1 Rumble Brute, 1 Echo Knight; W2: 1 Sky Sweeper, 3 Storm Wisp, 1 Rumble Brute; W3: 1 Echo Knight, 1 Rumble Brute, 2 Storm Wisp | Corner blocks at the edges | A bright stone arch with the sky behind it; small lamps lit in the corners. | "Together, we bring the light home." |
| 6 | Bell Nook | treasure | none | Small room, four blocks | A small bronze bell on a hook; the chest is a travel trunk with a clean sash on top. | "Ring the bell for the whole town." |
| 7 | The Lamp Stand | rest | none | Small room, two blocks near the walls | An empty lamp stand glowing softly, two cushions, and a view of the whole town below. | "The great lamp waits. Rest first." |
| 8 | The Empty Lamp | boss | W1: 1 The Lost Lightbearer, 1 Storm Wisp; W2: 2 Storm Wisp, 1 Rumble Brute; W3: 3 Storm Wisp | Big open arena | The very top: an empty lamp stand under swirling clouds; the Lightbearer stands beside it, tired but holding on. | "Come, let us finish together." and "No one is to blame." |

Signs are wooden boards with painted words, one short line each. Treasure rooms have the chest `C` in the middle; rest rooms have the shrine `S`.

## Guardian arena

- **Room:** A wide open summit, 18 by 12 tiles, with nothing solid inside. The empty lamp stand is art on the top wall. Storm Wisps and a Rumble Brute join (placeholder sizes).
- **Where the relic appears:** on the `C` tile in the middle of the room, after The Lost Lightbearer is freed. The relic and its text come from the faith overlay under the key `lost-lightbearer`; the art and data here hold only the key, never the text. The light piece rises from the same spot.

## Teaching the newest move

**Newest-move room:** none. There is no new Seal or Strike for this tier in the plan, so nothing is built to show one off. Endless mode is not covered here.

## Notes for the Programmer and Tester

- Wave sizes are placeholders until balance work. No enemy stats are in the room file.
- The challenge room uses the existing challenge rules. Its 90 seconds is the Supper Rush number (placeholder), and its kid text has no digits, so the screen should show the number itself.
- Elites exist only for Brute, Swarmer and Shield, so none of these rooms has one (R-G2B-28 covers elites).

Check tools: `python3 drafts/content/tools/check-rooms-tier.py` (all tier sets) and `node --experimental-strip-types drafts/content/tools/check-rooms-load.mjs drafts/content/rooms/summit.json` (loads every room with the game's own `loadRoom`).
