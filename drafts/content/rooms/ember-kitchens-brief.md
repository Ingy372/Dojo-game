# Room brief: The Ember Kitchens (Tier 3, Orange)

DRAFT for B-ART3. The data is in `ember-kitchens.json`, which uses the `content/rooms/` format with the same legend and no new tile types. Lore comes from `drafts/content/lore/03-orange.md`. The enemies are Spark Sprite and Dough Blob (floors 1-2), and Ladle Lobber and Rolling Pin (floors 3-4). The Guardian is in `drafts/content/bosses/hearth-cook.json`.

## The feel

This is a big, warm kitchen that went cold. The ovens are dark, the long table is empty, and copper pots hang still. It should feel sleepy, not scary.

As the player clears each room, the kitchen warms up again: an oven glows, steam rises, and a lamp flickers on. Everything is soft and round: puffy dough, wooden spoons, chunky bricks.

**Palette:** warm oranges, honey and copper on deep brown brick, with cool blue-grey shadows in corners the light hasn't reached yet.

**Lighting:** low amber light from the embers. Each cleared room gets one step brighter.

**Combat space rule:** every prop on a `.` tile is flat decoration you can walk through, such as a rug, flour dust or floor tiles. Anything solid is already a `#` tile in the data. Keep the middle of every room clear.

**Hazards come from enemies only, with no new floor tiles:**
- Spark Sprites blink, then show a red circle.
- Dough Blob shows a squish circle, then splits into two Doughlings.
- Ladle Lobber shows a red circle where its soup lands.
- Rolling Pin shows purple-and-white stripes along a lane, with double marks.

Make the floor art plain, light flagstone so that red circles and purple stripes always stand out against it. Never use purple, white stripes or red rings anywhere in the floor or prop art.

## Rooms (8 to match a floor: 7 chosen through doors, then the boss)

| # | Room | Kind | Enemies | Layout | Props | Sign |
|---|---|---|---|---|---|---|
| 1 | Pantry Door | battle | Spark Sprites, then a Dough Blob | Open, with 4 flour-sack piles | Jar shelves on the walls, sacks, a hanging garlic braid | "Wash your hands, then help." |
| 2 | Oven Row | battle | Sparks, then 2 Dough Blobs | Open, with 2 small brick blocks | 3 cold ovens in the top wall; one glows when the room is cleared | "Warm ovens, warm hearts." |
| 3 | Long Table Hall | battle (room 3+) | Ladle Lobber behind the table, Sparks, then a Dough Blob | The empty long table is a wall across the top third with 3 gaps | Benches, a row of empty bowls | "Everyone gets a seat." |
| 4 | Baking Lanes | battle (room 3+) | 2 Rolling Pins, Sparks, a Lobber, a Dough Blob | Two short counters split the room into wide lanes | Floured counters, rolling boards, cookie cutters | "Clean as you go." |
| 5 | Supper Rush | challenge (room 4+) | 3 waves of all four enemies | Open, with 4 corner blocks | A big kitchen clock over the door, serving carts at the edges | "Supper is better together." |
| 6 | Spice Cupboard | treasure | none | Small room with a chest in the middle | The chest is an old bread box, with tiny spice jars around it | "A little goes a long way." |
| 7 | Warm Hearth | rest | none | Small room with the shrine in the middle | One small fire that never went out, a kettle, two cushions | "Rest here. You are welcome." |
| 8 | The Great Hearth | boss | The Hearth Cook | Big open arena | See below | "Save a bowl for the one who is late." and "Thank the cook!" |

Signs are wooden boards with painted words, one short line each. The Great Hearth's first sign quotes the Old Recipe Card relic in the lore.

## Guardian arena: The Great Hearth

- **Layout:** a wide-open room, 18 by 12 tiles of floor, with nothing solid inside. The Cook's rolling-pin lane (the striped lane plus double marks) needs a straight, clear run.
- **Props:** the giant cold oven fills the middle of the top wall. A huge soup pot sits beside it; sparks hop out of it during the "rush" phase. The long table and benches are pushed against the side walls, and copper pots hang along the top. There is a rug under the player's start.
- **Phases:** in phase 2 the pot bubbles and steams. In phase 3 the lane stripes run across the floor.
- **When freed:** the big oven lights warm gold, steam curls up, and the table glows as if supper is ready.
- **Where the relic appears:** on the `C` tile in the middle of the room, which becomes a small bread board on the floor. It shows up only after the Cook is freed. The Hearth Cook's relic and its text come from the faith overlay under the key `hearth-cook`. The art and data here hold only the key, never the text. The light piece rises from the same spot.

## Props list

Cold brick ovens (3, plus the giant one), jar shelves, flour sacks, a garlic braid, copper pots and pans, wooden spoons and ladles, the long table, benches, empty bowls, floured counters, rolling boards, cookie cutters, a kitchen clock, serving carts, spice jars, the bread-box chest, a kettle, cushions, the giant soup pot, a bread board (the relic spot), rugs, and wooden sign boards.

## Proposals (not in launch scope)

- Embers in each oven glow brighter after each room on the floor is cleared, as a visual progress bar.
- A "family supper" picture shows on the table once all the Orange relics are found.
- After the Guardian is freed, Spark Sprites gather in the Warm Hearth as friendly decoration.
