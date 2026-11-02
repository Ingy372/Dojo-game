# Room brief: The Hall of Echoes (Tier 7, Red/Black)

DRAFT for R-G2B-25/26/27 (the Artist kit items R-G2B-40 to 42 build from this). The data is in `hall-of-echoes.json`, which uses the `content/rooms/` format with the same legend and no new tile types, and carries `minBeltTier` 7 and `floorSet` `hall-of-echoes` on every room like the Giant's Steps set. Lore comes from `drafts/content/lore/`. First-band enemies: Masklet. Second-band enemies: Copycat Shade and Hush Guard and Echo Bell. The Guardian is The Echo Mask (`drafts/content/bosses/echo-mask.json`).

## The feel

This hall repeats whatever you say. Teachers used it to share words of courage with the Tower, but now it only echoes fears. It should feel hushed and curious, not creepy.

**Palette:** Dark charcoal and deep red with soft silver mirrors and masks; a warm gold lamp as each room clears.

**Lighting and progress:** Each cleared room brings one kind word back: a bell rings softly, and the echo says something nice.

**Combat space rule:** every prop on a `.` tile is flat decoration you can walk through. Anything solid is already a `#` tile in the data. Keep the middle of every room clear.

**Hazards come from enemies only, with no new floor tiles:**
- Masklet: Little floating masks that giggle and gather. Tell: Spin, then red circle.
- Copycat Shade: Copies your last move a moment later. Tell: Your move's shape in red, then it hits.
- Hush Guard: Silent shield-bearer who turns to face you. Tell: Red circle; shield turns.
- Echo Bell: A bell that rings a purple striped ring outward with one gap. Tell: Dash-only: striped ring + '!!', 22 ticks; gap glows.

Make the floor art plain and light so red circles and purple stripes always stand out. Never use purple, white stripes or red rings anywhere in the floor or prop art.

## Rooms (8 to match a floor: 7 chosen through doors, then the boss)

| # | Room | Kind | Enemies (placeholder sizes) | Layout | Props | Sign |
|---|---|---|---|---|---|---|
| 1 | Whisper Gate | battle | W1: 3 Masklet; W2: 4 Masklet | Open, with a few small blocks | A tall arched gate with a stone ear on each side; soft sound-wave rings on the floor. | "Say something kind. Hear it come back." |
| 2 | Split Mirrors | battle | W1: 3 Masklet; W2: 5 Masklet | One tall wall on each side | Two tall mirror frames on the top wall; a faint line down the middle of the floor. | "Two mirrors, one you." |
| 3 | Shade Gallery | battle (room 3+) | W1: 1 Copycat Shade, 2 Masklet; W2: 3 Masklet, 1 Copycat Shade; W3: 3 Masklet | Two corner blocks on each side | Picture frames with soft shadows moving in them; low lamps along the walls. | "Your shadow just copies. You choose." |
| 4 | Masklet Circle | battle (room 3+) | W1: 6 Masklet; W2: 1 Hush Guard, 1 Copycat Shade, 2 Masklet | Open floor with the student in the middle | A round ring of floor tiles in the middle; echo bells hung quietly round the walls. | "A ring of friends. Turn and say hello." |
| 5 | The Echo Chamber | challenge (room 4+) | W1: 3 Masklet, 1 Copycat Shade; W2: 1 Hush Guard, 3 Masklet, 1 Echo Bell; W3: 1 Copycat Shade, 2 Masklet, 1 Hush Guard | Scattered single stones | A round chamber of curved walls with a big hanging bell; a stone ear in each corner. | "Kind words travel far." |
| 6 | Kind Word Nook | treasure | none | Small room, two blocks | A smooth stone with a hollow for whispers; the chest is a small music box. | "Whisper a kind word to the stone." |
| 7 | Quiet Corner | rest | none | Small room, two flat blocks | Thick soft rugs that hush every sound, two cushions and a single candle. | "No echo here. Just rest." |
| 8 | The Echo Hall | boss | W1: 1 The Echo Mask, 2 Masklet; W2: 3 Masklet; W3: 4 Masklet | Big open arena | A grand hall of mirrors and bells; a floating mask hangs in the middle, copying the student. | "Be the same inside and out." and "Say a kind word to the mask." |

Signs are wooden boards with painted words, one short line each. Treasure rooms have the chest `C` in the middle; rest rooms have the shrine `S`.

## Guardian arena

- **Room:** A grand open hall, 18 by 12 tiles, with nothing solid inside. The mask copies the student's move, so keep the floor plain. Masklets join in waves 2 and 3 (placeholder sizes).
- **Where the relic appears:** on the `C` tile in the middle of the room, after The Echo Mask is freed. The relic and its text come from the faith overlay under the key `echo-mask`; the art and data here hold only the key, never the text. The light piece rises from the same spot.

## Teaching the newest move

**Newest-move room:** `masklet-circle` starts with six Masklets in a ring around the student (four to six tiles out), so Spinning Finisher (#7) has a clear use. Catch the Hand (#35) needs a quick attacker and Masklet's wind-up is not known yet, so it may not fire in this tier (R-G2B-32).

## Notes for the Programmer and Tester

- Wave sizes are placeholders until balance work. No enemy stats are in the room file.
- The challenge room uses the existing challenge rules. Its 90 seconds is the Supper Rush number (placeholder), and its kid text has no digits, so the screen should show the number itself.
- Elites exist only for Brute, Swarmer and Shield, so none of these rooms has one (R-G2B-28 covers elites).

Check tools: `python3 drafts/content/tools/check-rooms-tier.py` (all tier sets) and `node --experimental-strip-types drafts/content/tools/check-rooms-load.mjs drafts/content/rooms/hall-of-echoes.json` (loads every room with the game's own `loadRoom`).
