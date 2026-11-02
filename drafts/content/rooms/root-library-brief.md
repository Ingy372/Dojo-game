# Room brief: The Root Library (Tier 8, Brown)

DRAFT for R-G2B-25/26/27 (the Artist kit items R-G2B-40 to 42 build from this). The data is in `root-library.json`, which uses the `content/rooms/` format with the same legend and no new tile types, and carries `minBeltTier` 8 and `floorSet` `root-library` on every room like the Giant's Steps set. Lore comes from `drafts/content/lore/`. First-band enemies: Page Flutter and Bookworm. Second-band enemies: Ink Blot and Root Snapper. The Guardian is The Root Keeper (`drafts/content/bosses/root-keeper.json`).

## The feel

Old tree roots hold up this library, and every book tells how someone was helped on their climb. Dust covers the books. It should feel cozy and old, like a quiet attic.

**Palette:** Warm browns, leather and parchment gold, with soft green leaves in the roots.

**Lighting and progress:** Each cleared room is dusted a little: a book glows, a lamp lights, and pages settle.

**Combat space rule:** every prop on a `.` tile is flat decoration you can walk through. Anything solid is already a `#` tile in the data. Keep the middle of every room clear.

**Hazards come from enemies only, with no new floor tiles:**
- Page Flutter: Loose pages that flap like birds. Tell: Rustle, then red circle.
- Bookworm: Tunnels under the floor and pops up. Tell: A dirt bump moves toward you; red circle.
- Ink Blot: Leaves sticky ink puddles that slow you about 30% (15% on Guided; no damage; ends when you step out). Tell: Puddle drawn as a dark blue blot.
- Root Snapper: Roots poke up along a line, one after another. Tell: Dash-only: purple stripe lane + '!!', 20 ticks.

Make the floor art plain and light so red circles and purple stripes always stand out. Never use purple, white stripes or red rings anywhere in the floor or prop art.

## Rooms (8 to match a floor: 7 chosen through doors, then the boss)

| # | Room | Kind | Enemies (placeholder sizes) | Layout | Props | Sign |
|---|---|---|---|---|---|---|
| 1 | Dusty Entry | battle | W1: 2 Page Flutter, 1 Bookworm; W2: 2 Page Flutter, 2 Bookworm | Open, with a few small blocks | Tall shelves with dusty books along the walls; a round welcome rug. | "Every book began with a helper." |
| 2 | Reading Roots | battle | W1: 3 Page Flutter; W2: 2 Bookworm, 2 Page Flutter | Scattered single stones | Thick tree roots curl round the shelves (the '#' blocks are root knots); loose pages on the floor. | "Roots hold up the tallest shelves." |
| 3 | Inkwell Aisle | battle (room 3+) | W1: 1 Ink Blot, 2 Page Flutter; W2: 2 Bookworm, 1 Page Flutter, 1 Ink Blot; W3: 2 Page Flutter, 1 Bookworm | One tall wall on each side | A row of giant inkwells and quills; the floor shows faint ink dots. | "A blot is a story waiting to start." |
| 4 | Root Stacks | battle (room 3+) | W1: 1 Root Snapper, 1 Page Flutter, 1 Bookworm; W2: 1 Ink Blot, 2 Bookworm, 1 Page Flutter; W3: 1 Root Snapper, 1 Ink Blot, 2 Page Flutter | Two long ledges split the room into lanes | Two huge shelves grown through with roots split the room into reading lanes. | "Take one book at a time." |
| 5 | The Reading Room | challenge (room 4+) | W1: 2 Page Flutter, 1 Bookworm, 1 Ink Blot; W2: 1 Root Snapper, 2 Page Flutter, 2 Bookworm; W3: 1 Ink Blot, 2 Page Flutter, 1 Bookworm | Corner blocks at the edges | A round reading room with a glowing lamp over the door; tall stacks in each corner. | "Every story needs a reader." |
| 6 | Story Shelf | treasure | none | Small room, two blocks near the walls | A shelf of helper stories; the chest is a thick old book with a clasp. | "The last page is for you." |
| 7 | Reading Nook | rest | none | Small room, two blocks | A big armchair-shaped root, two cushions, and a warm reading lamp. | "Rest and read. You belong here." |
| 8 | The Root Hall | boss | W1: 1 The Root Keeper, 1 Page Flutter; W2: 2 Page Flutter, 1 Bookworm; W3: 1 Page Flutter, 2 Bookworm | Big open arena | A huge hall held up by one giant tree; the Root Keeper sits among its roots with a book. | "Strong roots keep you standing." and "Share a story with the old tree." |

Signs are wooden boards with painted words, one short line each. Treasure rooms have the chest `C` in the middle; rest rooms have the shrine `S`.

## Guardian arena

- **Room:** A big open hall, 18 by 12 tiles, with nothing solid inside. The roots are art on the walls only. The Keeper's Root Snapper-style lane (striped, with double marks) needs a straight clear run. Page Flutters and Bookworms join (placeholder sizes).
- **Where the relic appears:** on the `C` tile in the middle of the room, after The Root Keeper is freed. The relic and its text come from the faith overlay under the key `root-keeper`; the art and data here hold only the key, never the text. The light piece rises from the same spot.

## Teaching the newest move

**Newest-move rooms:** `reading-roots` and `the Reading Room` put Page Flutter packs with Bookworms, so a held enemy can sit next to a crowd and Wide Release (#36) has someone to bump. This layout is a proposal.

## Notes for the Programmer and Tester

- Wave sizes are placeholders until balance work. No enemy stats are in the room file.
- The challenge room uses the existing challenge rules. Its 90 seconds is the Supper Rush number (placeholder), and its kid text has no digits, so the screen should show the number itself.
- Elites exist only for Brute, Swarmer and Shield, so none of these rooms has one (R-G2B-28 covers elites).

Check tools: `python3 drafts/content/tools/check-rooms-tier.py` (all tier sets) and `node --experimental-strip-types drafts/content/tools/check-rooms-load.mjs drafts/content/rooms/root-library.json` (loads every room with the game's own `loadRoom`).
