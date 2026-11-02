# Room brief: The Storm Stair (Tier 9, Brown/Black)

DRAFT for R-G2B-25/26/27 (the Artist kit items R-G2B-40 to 42 build from this). The data is in `storm-stair.json`, which uses the `content/rooms/` format with the same legend and no new tile types, and carries `minBeltTier` 9 and `floorSet` `storm-stair` on every room like the Giant's Steps set. Lore comes from `drafts/content/lore/`. First-band enemies: Cloud Puff and Gust Sprite. Second-band enemies: Thunder Drum and Zap Kite. The Guardian is The Storm Herald (`drafts/content/bosses/storm-herald.json`).

## The feel

Wind and rain once washed this stair clean each spring. Now a storm spins without stopping. It should feel windy and exciting, not frightening.

**Palette:** Slate greys, deep brown and dark teal, with pale gold lightning that is soft, never harsh.

**Lighting and progress:** Each cleared room lets in a little more calm: the rain thins and a patch of sky shows.

**Combat space rule:** every prop on a `.` tile is flat decoration you can walk through. Anything solid is already a `#` tile in the data. Keep the middle of every room clear.

**Hazards come from enemies only, with no new floor tiles:**
- Cloud Puff: Fluffy clouds; a big one splits into two small ones. Tell: Puff up, then red circle.
- Gust Sprite: Spins and blows you sideways. Tell: Spins; pale gust arrow (no damage).
- Thunder Drum: Beats a steady rhythm: boom, boom, BOOM. Tell: Three red circles in a beat.
- Zap Kite: A kite that drags a zig-zag lightning stripe. Tell: Dash-only: purple zig-zag stripe + '!!', 20 ticks.

Make the floor art plain and light so red circles and purple stripes always stand out. Never use purple, white stripes or red rings anywhere in the floor or prop art.

## Rooms (8 to match a floor: 7 chosen through doors, then the boss)

| # | Room | Kind | Enemies (placeholder sizes) | Layout | Props | Sign |
|---|---|---|---|---|---|---|
| 1 | Rainy Landing | battle | W1: 2 Cloud Puff, 1 Gust Sprite; W2: 2 Cloud Puff, 2 Gust Sprite | Open, with a few small blocks | A wide wet stone landing with puddles on the floor and a tipped umbrella. | "Rain washes the stair clean." |
| 2 | Breezy Bend | battle | W1: 2 Gust Sprite, 1 Cloud Puff; W2: 3 Gust Sprite, 1 Cloud Puff | A V of small blocks on each side | A bend in the stair with fluttering flags; leaves swirl along the walls. | "Lean into the wind. Stay steady." |
| 3 | Drum Landing | battle (room 3+) | W1: 1 Thunder Drum, 2 Cloud Puff; W2: 2 Gust Sprite, 1 Cloud Puff, 1 Thunder Drum; W3: 2 Cloud Puff, 1 Gust Sprite | Two square blocks on each side | Two big storm drums on stone stands; rain streaks down the windows. | "Count the beat. Then step." |
| 4 | Zig-Zag Steps | battle (room 3+) | W1: 1 Zap Kite, 1 Cloud Puff, 1 Gust Sprite; W2: 1 Thunder Drum, 2 Gust Sprite, 1 Cloud Puff; W3: 1 Zap Kite, 1 Thunder Drum, 2 Cloud Puff | A diagonal line of blocks on each side | Steps that zig-zag up the walls; kite ribbons tied to the posts. | "The wind turns left, then right." |
| 5 | The Storm Gate | challenge (room 4+) | W1: 1 Cloud Puff, 2 Gust Sprite, 1 Thunder Drum; W2: 1 Zap Kite, 2 Cloud Puff, 2 Gust Sprite; W3: 1 Thunder Drum, 2 Gust Sprite, 1 Cloud Puff | Two corner blocks on each side | A tall iron gate swirled with cloud; a lightning rod in each corner. | "Even storms pass." |
| 6 | Feather Nook | treasure | none | Small room, two flat blocks | A single feather hanging in the air, very still; the chest is a wind-worn trunk. | "A calm feather floats here." |
| 7 | Dry Alcove | rest | none | Small room, two tall blocks | A snug stone alcove with a roof, two cushions and a warm lamp. | "Rest out of the rain." |
| 8 | The Herald's Landing | boss | W1: 1 The Storm Herald, 1 Cloud Puff; W2: 1 Cloud Puff, 2 Gust Sprite; W3: 2 Cloud Puff, 1 Gust Sprite | Big open arena | A wide windy platform in the clouds; the Storm Herald stands tall in the middle with ribbons of wind. | "Listen for the calm." and "Someone is calling from the top." |

Signs are wooden boards with painted words, one short line each. Treasure rooms have the chest `C` in the middle; rest rooms have the shrine `S`.

## Guardian arena

- **Room:** A wide open platform, 18 by 12 tiles, with nothing solid inside. Lightning lanes (striped, with double marks) need straight clear runs. Cloud Puffs and Gust Sprites join (placeholder sizes).
- **Where the relic appears:** on the `C` tile in the middle of the room, after The Storm Herald is freed. The relic and its text come from the faith overlay under the key `storm-herald`; the art and data here hold only the key, never the text. The light piece rises from the same spot.

## Teaching the newest move

**Newest-move room:** none. There is no new Seal or Strike for this tier in the plan, so nothing is built to show one off.

## Notes for the Programmer and Tester

- Wave sizes are placeholders until balance work. No enemy stats are in the room file.
- The challenge room uses the existing challenge rules. Its 90 seconds is the Supper Rush number (placeholder), and its kid text has no digits, so the screen should show the number itself.
- Elites exist only for Brute, Swarmer and Shield, so none of these rooms has one (R-G2B-28 covers elites).

Check tools: `python3 drafts/content/tools/check-rooms-tier.py` (all tier sets) and `node --experimental-strip-types drafts/content/tools/check-rooms-load.mjs drafts/content/rooms/storm-stair.json` (loads every room with the game's own `loadRoom`).
