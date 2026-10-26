# C-STORY-b: Mystery clue ladder (draft)

Data: `mystery-ladder.json`. Spec: `C-STORY-review.md` (C-STORY-b, W1, W2). Black belt is out of scope (Jay). Nothing shipped is changed.

**Rules kept:** one *new* fact per tier; no fact repeats; the "who" (a student, Sensei's friend) can't be pieced together before Brown (W2); Sensei is hinted at White, Orange, Blue and Red/Black and revealed after Brown (W1). The shadow is "many little fears", never a person, and not crazy dark. Scripture lives only in `faithNote` (exact KJV, swappable). Place names stay PLACEHOLDERs awaiting Jay.

## Ladder

| Tier | New fact | Found in | Kid line | Older-reader line | Sensei hint | Faith note |
|---|---|---|---|---|---|---|
| 1 white | The light broke into pieces, and the pieces are still in the Tower. | Relic: Cracked Lamp Glass | The light broke, but it is still here! | Glass this warm was never meant for the dark. Light that broken still shines. | Dojo: an old lantern on Sensei's shelf: Sensei glances at an old lantern, then smiles. "Let's train." | John 1:5: "And the light shineth in darkness; and the darkness comprehended it not." |
| 2 yellow | A storm broke the light. Nobody broke it on purpose. | Bestiary: Sun Gardener (freed) | A big storm broke the light. It was no one's fault. | Storms don't choose. Only what we do after them is ours. |  |  |
| 3 orange | On the storm night, one seat at supper was left empty. | Relic: Empty Bowl + Recipe Card | Someone left supper early. A bowl is saved for them. | Soup for everyone, and one bowl kept warm. Someone here is still expected home. | Dojo: Sensei after the Orange Gate: Sensei sets out one extra cup of tea, just in case. |  |
| 4 green | The shadow is many small fears stacked up, not one monster. | Bestiary: Stone Giant (older-reader entry) | The shadow is made of little worries. | Fear grows when you stack it alone. Name each one, and the stack falls. |  | Psalms 56:3: "What time I am afraid, I will trust in thee." |
| 5 blue | The light was not lost. Someone carried it up through the rain to keep it safe. | Relic: Boat Log | Someone is keeping the light safe! | The log has one line for that night: carried, not lost. Someone chose the stairs over shelter. | Dojo: Senpai's line after the Blue Gate: Senpai: "Sensei used to climb with a friend. Sensei never says who." | Isaiah 43:2 (part): "When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee:" |
| 6 red | The carrier used a shield to cover the light, and the shield cracked. | Relic: Cracked Shield | They kept the light safe with a shield. | A cracked shield means it held. Someone took the rain so the light wouldn't. |  | Psalms 28:7 (part): "The LORD is my strength and my shield; my heart trusted in him, and I am helped:" |
| 7 red-black | The carrier is still up there, holding on and waiting for help. | Relic: Traveler's Note | They are waiting for help. Let's keep climbing! | The echoes said give up. One voice kept answering: "I will hold the light until help comes." | Dojo: Sensei after the Red/Black Gate: Sensei rereads an old note, then tucks it away. "Keep climbing." |  |
| 8 brown | The carrier was once a student of this Tower, who trained the same forms you do. | Relic: Student Sash + Root Library page | The helper was a student, just like you! | An old practice sash, its name too faded to read. Same forms, same stairs, same door you came in by. |  | Psalms 119:105: "Thy word is a lamp unto my feet, and a light unto my path." |
| 9 brown-black | Sensei trained with the carrier long ago, and has hoped every day they would come home. | Sensei scene after the Brown/Black Gate (C-STORY-h) | Sensei knows them! Sensei kept hoping. | "We trained side by side. I kept a lantern lit for them every night." | Dojo: reveal scene: Sensei: "They were my friend. Let's bring them home together." | Luke 15:20 (part): "But when he was yet a great way off, his father saw him, and had compassion, and ran, and fell on his neck, and kissed him." |

## What a player knows by each point

- **By Green:** the light broke in a storm (no blame), someone left supper that night, and the shadow is stacked-up fears. Nothing says who left or that they're still alive, so the ending isn't guessable yet.
- **Blue to Red/Black:** someone carried the light, shielded it, and is still waiting for help. Older kids now know there's a person to rescue, but not who.
- **Brown:** the carrier was a student here, training the same forms. Together with the empty bowl and Sensei's hints, an attentive 12-14 reader can guess (W2).
- **Brown/Black:** Sensei's reveal (W1), hopeful, no guilt. The summit stays the full payoff.

## Suggested changes to existing draft lines (not applied)

These remove facts that now give the "who" away too early, or repeat another tier. Exact replacements:

| File | Current | Suggested |
|---|---|---|
| `lore/00-index.md` row 2 + `guardians-and-relics.json` yellow `clue` | The pieces of light fell in a circle around the Tower. Someone was standing in the middle, trying to catch them. | A storm broke the light. Nobody broke it on purpose. |
| `lore/00-index.md` row 3, `03-orange.md:32`, orange `clue` | The night the storm came, one student left supper and ran up the Tower to help. | On the storm night, one seat at supper was left empty. |
| `lore/00-index.md` row 5, `05-blue.md`, blue `clue` | A boat's log says one brave traveler carried the great light through the rain. | The light was not lost. Someone carried it up through the rain to keep it safe. |
| `lore/00-index.md` row 6, `06-red.md:32`, red `clue` | The traveler who carried the light wore red. Their shield kept the rain off it. | The carrier used a shield to cover the light, and the shield cracked. |
| `lore/00-index.md` row 7, `07-red-black.md`, red-black `clue` | The echoes told the traveler to give up. The traveler kept holding on. | The carrier is still up there, holding on and waiting for help. |
| `lore/00-index.md` row 8, `08-brown.md:32`, brown `clue` | The last book has a page about the traveler. It says they were once a student of this very Tower. | The carrier was once a student of this Tower, who trained the same forms you do. |
| `lore/00-index.md` row 9, `09-brown-black.md`, brown-black `clue` | The storm still spins at the top. The traveler is there, holding the last of the light. | Sensei trained with the carrier long ago, and has hoped every day they would come home. |
| `lore/00-index.md` line 13 | The full answer arrives only at black belt. | Attentive players can guess around Brown; the full answer arrives at the top. |
| `04-green.md:26` + `guardians-and-relics.json` smooth-stone | It fits perfectly in your hand. | It fits just right in your hand. (removes "perfect") |
| `guardians-and-relics.json` white `faded-map` sensei | Someone else climbed before you. You are not alone on this path. | Keep (fits the ladder). |

White and Green clues stay as they are.

## Questions

- **For Jay (tone):** Is Senpai's Blue line, "Sensei used to climb with a friend. Sensei never says who.", the right amount of hint, or too early?
- **For the Manager:** C-STORY-h (dialogue) and C-STORY-e (Gate scenes) should reuse the `senseiHint` lines here; OK to treat this file as their source?
