# Street Smarts as a cut scene: "Lost in the store" (design, Nov 24)

## Why
Jay (Nov 24): the first Street Smarts lesson is too long (about 35 lines, roughly 30 Next taps)
and too static (a flat drawn aisle with a coloured circle for the speaker). He wants it to play
like a cut scene that shows what is happening, stopping only when the player has to decide or do
something.

## Goals
- About 12 to 14 spoken lines instead of 35. Story parts play by themselves (voice and caption);
  a tap skips ahead. The player is stopped only at the 3 choices and 1 tap moment.
- The real game look: a Blender store room and Blender characters on the hero v2 model (Jay picked A).
- The same lesson: stay put, find a safe helper, use your voice, the family's secret word.
- The same rewards: 3 stars (stay, helper, offer), coins as now, the badge in the Street Smarts House.

## Not goals
- Other scenarios, new topics, or the Tool Belt work.
- Free movement with the stick inside the scenario (the one "do something" moment is a tap on a person).

## Must not happen
- Anything scary: the shopper looks ordinary, never mean, never grabs or follows. A wrong choice is
  never acted out; Sensei talks it over in one line and the player tries again.
- Words or art go in without Jay's OK.

## Approaches considered
- **A. Blender store room and characters (picked by Jay).** Matches the rest of the game; more work; art previews for Jay first.
- B. Store drawn in code with recoloured existing characters. Faster, plainer.
- (Rejected) Keep the current screen and only cut lines: fixes the length but not the "show what's happening".

## How it works
- **Script stays data** (`content/street-smarts/store-separated.json`). Each line can carry stage
  directions (who walks where, who faces whom, an emote bubble such as "?" or hearts, who appears or leaves).
  A choice can be a **tap** choice: its answers are people or spots in the room instead of buttons.
- **The rules package** (`packages/sim/src/streetSmarts.ts`) still walks the script, stars and retries;
  it learns the new fields but never draws anything.
- **The scene** draws the store room, places the actors, plays each line's stage directions, shows a
  one-line caption with the speaker's name, reads it aloud, and moves on when the voice ends
  (or after a reading time when sound is off). A tap finishes the current line early.
  Choices show 2 to 4 big buttons over the bottom of the room. Sensei is a small portrait bubble in a
  corner (he is not in the store). On replays a Skip button jumps to the next choice.
- **Mom or Dad** follows the player's pick, as now.

## Art (Blender, approved by Jay before it goes in)
- **Store room** at the town's camera angle: aisles, a toy shelf, the counter with a register, the
  front door, a ceiling speaker. Built like the Street Smarts House (`incoming-art/claude-street-house`).
- **People** on the hero v2 model like the staff (`incoming-art/claude-staff`): Mom, Dad, a store
  worker (vest and name tag), a cashier, a shopper (ordinary clothes), and a grown-up with a kid.
  Animations: idle, walk (4 directions), wave. The hug and emotes are drawn in code.
- A preview sheet for Jay first; then the import step packs them.

## Draft script (needs Jay's OK)
1. *(cut scene)* Caption: "{player} is at the store with {grownup}." / "When {player} looks up, {grownup} is gone." / Sensei: "Take a big breath. You know what to do."
2. *(choice)* "What do you do first?" Stay right here. ★ / Run and look everywhere. / Go outside to look.
   Good: Sensei "Good. Staying close helps {grownup} find you." Run: "If you both keep moving, can you find each other?" Outside: "Where is {grownup} most likely to be?"
3. *(tap)* "Who can help? Tap them." Worker ★ / cashier ★ / grown-up with kids ★ / hiding spot.
   Good: Sensei "Yes! That's a safe helper." The hero walks over; the worker comes to help. Hide: "If you hide, who will know you need help?"
4. *(choice)* Worker: "Hi there. Are you okay?" "I can't find {grownup}. Can you help me?" / Say nothing.
   Good: Worker "I'll call {grownup} on the store speaker. Let's wait here together." Retry: "Helpers can only help when they know what's wrong."
5. *(choice)* Shopper: "I saw your grown-up outside. Come with me." Caption: "Do they know your family's secret word?" "No thank you. I'm staying with the worker." ★ / Go with them.
   Good: Sensei "Strong choice, {player}." Retry: "Only safe grown-ups know your family's secret word."
6. *(cut scene)* {grownup} hurries in: "There you are! I'm so glad you stayed." Hug and hearts.
7. Sensei: "You stayed close, found a helper and used your voice. That's how you get home safe."

## Left to the builder
Exact stage positions and timings, the reading time when sound is off, the caption style, file names.

## Order of work
1. Script format and rules (tests). 2. Store room and people in Blender, previews for Jay.
3. The cut-scene screen with placeholder art, testable on the phone. 4. Swap in the approved art. 5. Preview link.
