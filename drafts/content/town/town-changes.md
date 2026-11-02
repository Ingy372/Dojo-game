# C-STORY-g: the town grows with every belt (draft, v4)

Data: `town-changes.json` (the same words; `tools/check-town-changes.py` checks they match). Text only. Nothing shipped is changed, and `story/gate-scenes.json` (PR #339) is not edited.

This rewrites C-STORY-f for Jay's new town arc (Oct 31) and his Nov 1 direction: **town visuals stop at Blue.** The art is in PR #396 (`incoming-art/town-growth`).

## Decided (Manager, Nov 1)
- **DECIDED (Manager, Nov 1):** The narrowed rule is accepted. Still banned: locks, coming-soon or belt signs, text on the town, and anything about other players' belts. Allowed: worn bits and the empty plinth before Green.
- **DECIDED (Manager, Nov 1; narrowed by Jay):** Tuck the Traveling Helper, with a dusk Tower story folded in. Jay then narrowed Tuck to the Red belt only (Nov 1 evening). Red/Black to Black each get a different PROPOSAL for Jay.
- **DECIDED (Manager, Nov 1):** A Tuck sprite is OK. The Blue cap covers scenery only.
- **DECIDED (Manager, Nov 1):** Dropped.

## The arc
- **White:** a little worn, and a hopeful fresh start.
- **Yellow:** cleaner.
- **Orange:** the approved base concept art.
- **Green:** the statue arrives.
- **Blue:** the first gentle, homely touches. **This is the last town picture.**
- **Red to Black:** no new art. The town shows the Blue picture. Red gets Tuck (placeholder name). Red/Black to Black each have a PROPOSAL.
- **Dusk** stays subtle.
- **One full picture per belt**, swapped whole. Nothing stacks.

Belt order (docs/curriculum.md): White, Yellow, Orange, Green, Blue, Red, Red/Black, Brown, Brown/Black, Black.

## Rules
- **stateKey:** player's own highest earned belt; the phone shows that belt's picture
- **structure:** one complete town picture per belt up to Blue, each in a day and a dusk version, swapped whole. Nothing stacks. Blue is the last picture.
- **cap:** town visuals stop at Blue (Jay, Nov 1). Red to Black show the Blue picture.
- **sharedSquare:** each phone renders its own town; other players are drawn on top and never change it
- **noShame:** no locks, 'coming soon' marks, signs or text on the town, and nothing about other players' belts. A worn or empty bit is allowed when it looks friendly. Words about the town are hopeful and never blame.
- **dusk:** subtle and cozy; every light has a source (a window, a lantern, a lamp post or the Tower)
- **colour:** no red in the town except the brand sign.

## What the Artist draws, White to Blue
Matches PR #396 (its README, `stages.json` and Delivery Note). Five full pictures, each in day and dusk.

| Belt | pictureId | Status | What you see | Reward message | Story tie-in | Fills gate placeholder |
|---|---|---|---|---|---|---|
| White | town-1-white | built (sample, PR #396) | A little worn but friendly: faded colours, a boarded window, a patched shop-awning stripe and a patched bridge plank, weedy empty flower beds, cloudy water with one koi, a few cracked stones near the empty statue plinth. At dusk the two lamp posts and the dojo and shop windows glow softly; the tall lantern posts stay dark. | Welcome home! This town has lots of room to grow, and you will help it shine. | Lamp Keeper / Lantern Halls: the lanterns are waiting, and the first small lights are on. | gate-white (unused alternate) - also covers chapter-1 screens 14-17 White Gate |
| Yellow | town-2-yellow | planned, not built yet | Cleaner and more normal than White. The boards and patches are gone, the flower beds are tidy, and the water is clearer. The plinth is still empty. | The town got a tidy-up! Fresh and neat, just for you. | Sun Gardener / Sunrise Garden: the garden is tidy and ready to wake up. | gate-yellow |
| Orange | town-3-orange | built (sample, PR #396) | The approved town concept art, our base look. Plus a shop chimney and a bread basket. The plinth is still empty. | Fresh bread at the shop! The town smells like home. | Hearth Cook / Ember Kitchens: the ovens are warm again. | gate-orange |
| Green | town-4-green | planned, not built yet | The statue arrives on the plinth. The rest is the Orange town. | The statue has arrived in the square! Come and take a look. | Stone Giant / Giant's Steps: big things stand tall one step at a time. | gate-green |
| Blue | town-5-blue | built (sample, PR #396) | The statue plus the first gentle, homely touches: a thin curl of chimney smoke, two more koi and two more lily pads, a warm tint, faint sun beams and a few floating specks by day, a few fireflies near the river at dusk. | The town feels cozy now. Koi are swimming and the sun is glowing. | River Watcher / Quiet River: calm water and a calm heart. | gate-blue |

Dusk (all belts): window and lantern glow about a quarter of the first approved dusk, ground pools about a third, a fainter Tower light, no firefly swarm. The day and dusk notes for each belt are in the JSON.

## Red to Black: no new picture
Red, Red/Black, Brown, Brown/Black and Black use the Blue picture. They keep their story tie-ins and gate placeholders (`gate-red`, `gate-red-black`, `gate-brown`, `gate-brown-black`; Black has none). Every art add-on idea is dropped. Red gets Tuck. Red/Black to Black have proposals, below.

## Red: Tuck the Traveling Helper (DECIDED)

**DECIDED (Manager, Nov 1), and Jay narrowed it to the Red belt only.** **"Tuck" is a placeholder name** (renames are proposals).

**Who:** A small traveler with a backpack that is far too big. Friendly, curious and a little shy.

**Where:** Sits by the bridge. Part of the player's own town, so nothing on screen shows anyone's belt. Once he arrives he stays.

**Rules:**
- The task is optional. Thanks is the only reward, and nothing is earned that changes how strong you are.
- No timers, streaks or counters. Skipping or saying 'later' costs nothing, and Tuck is just as glad to see you.
- The manners moment has no wrong answer. Tuck shows the kinder idea gently.
- No chat between players, no purchases, nothing about other players' belts.
- The dusk story can be heard again any time.

- **Arrival:** Tuck arrives at the bridge, puffing a little under the big backpack, and asks if he can sit.
- **Optional task (in-game visit):** Say hello to Sensei for Tuck.
  - Tuck asks: "Hi! I'm Tuck. Could you say hello to Sensei for me?"
  - Tuck thanks: "Thank you! Sensei sounds so kind."
- **Manners moment:** "Tuck is new. How could we say hello?" Choices: "Wave and smile" or "Say 'Hi, I'm here!'". Tuck says: "Both are friendly! A smile and a name make a new friend feel at home."
- **Dusk Tower story: The Forge of Courage.** "Long ago, smiths made shields for anyone who needed one." "They sang while they worked, and the forge felt warm." "Courage can be warm, like a small flame." Try this: "Try one brave, kind thing tomorrow."
- **Reward line:** "A new friend! Tuck the traveler has come to the bridge."

**Why it's fun:** One friend who is glad to see you, a tiny kind job where the kid gets to be the helper, and a story that points toward the Tower.

**Needs, in short:**
- **Artist:** A Tuck character sprite is needed (new NPC art; the Blue cap covers scenery only). A small traveler with a big backpack, drawn on top of the Blue town, not baked into the picture. Needs: sitting idle by the bridge, a wave, a small speech portrait, day and dusk lighting. No red.
- **Programmer:** Small and flagged, not part of this PR: one fixed NPC spot by the bridge (no walking), a dialogue box that reuses Sensei's, one optional visit task, one two-choice manners screen with no wrong answer, and the existing story-card viewer for the dusk story. Tuck shows when the player's own highest belt is Red or higher.

## Red/Black to Black: one PROPOSAL each, for Jay

Each is a different small, gentle idea. All of them: ages 6+, no chat, no purchases, no pressure, nothing about other players' belts, no power. Nothing here is decided, and none adds code to this PR.

### Red/Black: Townsfolk Walking and Waving (PROPOSAL)

**Pitch:** A few neighbours stroll the lanes and wave when you walk by. They are glad you are home.

**How it fits Red/Black:** Two or three townsfolk who walk slow loops and wave back. They fit the Hall of Echoes: kind greetings come back to you.

**Sample lines:** "Hello, neighbour! Lovely day." "I saw you training. Keep going!" "Thanks for waving back."

**Proposed reward line:** "Neighbours are out for a stroll. Wave hello as you pass!"

**Why it's fun:** The town feels alive, and a wave back is the best feeling.

**Scope flag:** MEDIUM: 2-3 new townsfolk sprites with a walk cycle, and simple looping paths on the Blue picture. Some code. Flagged, not part of this PR.

### Brown: Dusk Tales with Sensei (PROPOSAL)

**Pitch:** At dusk Sensei sits on the dojo step and tells a short Tower story. Nothing to do but listen.

**How it fits Brown:** One tale for the Root Library: old roots hold up a library, and every book tells how someone was helped. A kid can hear it again any time.

**Sample lines:** "Come and sit. I have a story about the Tower." "Everyone gets help, and everyone can give it." "Thank you for listening."

**Proposed reward line:** "Sensei has a story for you at dusk. Come and sit a while."

**Why it's fun:** A quiet, cozy moment with Sensei, and it adds a piece of the Tower story.

**Scope flag:** SMALL: reuses the story-card viewer and Sensei art. It may need one seated pose. If Tuck's dusk story already uses the same viewer, nothing new.

### Brown/Black: The Town Pup (PROPOSAL)

**Pitch:** A small friendly pup trots around the square. Tap to say hello. It naps at dusk.

**How it fits Brown/Black:** The pup needs nothing: no feeding, no chores, and nothing sad if you stay away. It fits the Storm Stair: it shakes off the rain and trots back out once the sky is clear.

**Sample lines:** "Woof! (That means hello.)" "The pup shakes off the rain. All clear!" "The pup curls up for a nap."

**Proposed reward line:** "A new little friend is trotting around the town square. Say hello!"

**Why it's fun:** Everyone loves a pup. It is just a friend: no care duties, no streaks.

**Scope flag:** SMALL to MEDIUM: one pup sprite (idle, trot, nap), a tap reaction and a simple wander. Some code. Flagged, not part of this PR.

### Black: The Lantern Walk (PROPOSAL)

**Pitch:** One calm dusk scene: townsfolk carry small lanterns to the square and gather. No tasks, just a gentle thank-you.

**How it fits Black:** It echoes the Lost Lightbearer, who carried a small light up the Tower. Sensei and Tuck stand together while the neighbours gather. A kid can watch it again any time.

**Sample lines:** "A little light from each of us." "Thank you for climbing with us." "Look how bright the square is together."

**Proposed reward line:** "Tonight the whole town carries lanterns. Come and watch at dusk!"

**Why it's fun:** A warm, shared goodbye to the long climb, with no pressure to do anything.

**Scope flag:** MEDIUM: a short scripted scene with the townsfolk sprites and small lantern props. It works best if the Red/Black townsfolk proposal is chosen. If not, it uses Sensei and Tuck only (SMALL). Flagged, not part of this PR.

## The 14 clashes from the Artist's note (PR #396), and how each was resolved
| # | Clash | What clashed | Resolution |
|---|---|---|---|
| 1 | Statue | Spec: the statue is not touched and is part of the start. New arc: the statue is absent until Green. | The statue arrives at Green. The plinth is empty at White, Yellow and Orange. The "statue is not touched" rule is dropped. |
| 2 | White start | Spec: a White-belt town looks complete, the start is the approved base. New arc: White is a little run down. | White is the fresh-start town, below the base. The approved base is Orange. White text is hopeful and says "room to grow", never shame. |
| 3 | No empty plots, locks or signs | Spec forbids them. The empty plinth, boarded window, patches and weedy beds break it. | The rule is narrowed. Still banned: locks, "coming soon" or belt signs, any text on the town, and anything about other players' belts. Allowed: worn bits and the empty plinth, drawn as friendly wear. DECIDED: accepted by the Manager (Nov 1). |
| 4 | Structure | Spec: nine add-on overlay layers that stack. New: one full background per belt. | Each belt up to Blue has one picture (`pictureId`). The phone shows the picture for the player's own highest belt and swaps it whole. Nothing stacks. "Changes add up" is replaced by "each picture is complete". |
| 5 | White lamps | Spec: lamp posts and a bridge lamp light up at White. New: no lamp reveal. | No lamp reveal. The lamp posts glow softly at dusk from White on. The tall lantern posts stay dark, which matches the Lamp Keeper story. |
| 6 | Yellow | Spec: beds bloom and a vine on the dojo porch. New: cleaner. | Yellow is cleaner: boards and patches gone, beds tidy, water clearer. No vine and no bloom reward. The approved flowers are in Orange. |
| 7 | Orange | Spec: bakery chimney, bread and a long table. New: the base plus a chimney and a basket. | Orange is the approved base plus a chimney and a bread basket. The long table and benches are dropped. The smoke moves to Blue. |
| 8 | Green | Spec: stone path and a stone bench. New: the statue arrives. | Green is the statue arriving. The path and bench are dropped. |
| 9 | Blue | Spec: the river turns clear, more koi and a sitting dock. New: statue and light effects, two more koi and lilies. | Blue is the first gentle homely touches. The dock is dropped. The river is clearer than White, but "turns clear" is no longer a Blue moment. |
| 10 | Effects only from Blue | Spec has effects at earlier belts. New: none before Blue, apart from the White lamp posts. | Agreed. Effects (smoke, beams, specks, fireflies) start at Blue and stay few. Dusk stays subtle: every glow has a source. |
| 11 | Red to Black | Spec: Red banners, dummy and brazier; Red/Black chime and bell; Brown tree and book box; Brown/Black glowing Tower, rainbow and window lantern; Black out of scope. New: gentle upgrades, none defined. | DECIDED (Manager, Nov 1): town visuals stop at Blue, so Red to Black have no new art and all the old art add-ons are dropped, including the Red banners. Red gets a character instead: Tuck the Traveling Helper (placeholder name). Red/Black to Black get a different PROPOSAL each. Red to Black show the Blue picture. |
| 12 | Reward messages and tie-ins | The old messages and changeIds point at the old changes. | Messages up to Blue are rewritten to match their pictures (Green brings the statue). The old changeIds are replaced by pictureIds. Red to Black lines are Tuck's reward lines. Story tie-ins keep the same story names. Bible references are removed from this file, since faith content lives only in `drafts/content/faith/`. |
| 13 | Open items | The Brown tree beside the placeholder and the placeholder building's use. | The Brown tree is gone with the art add-ons. The placeholder building's use is still open (A4-2). The boarded window in White is only wear. |
| 14 | Scope | The spec asked for nine overlays. The art has three of ten stages built. | The cap makes it five pictures in all: White, Yellow, Orange, Green, Blue. Built in PR #396: White, Orange, Blue. Planned: Yellow, Green. Red, Red/Black, Brown, Brown/Black and Black use the Blue picture. Until Yellow and Green are built, a belt shows the nearest earlier built picture (README of PR #396). |

## What the Artist needs
- Yellow and Green: one full town picture each, day and dusk, in the same frame as the PR #396 samples.
- **A Tuck sprite** (new NPC art; the Blue cap covers scenery only). Details are under Tuck above.
- Nothing else for Red to Black. Please mark Red, Red/Black, Brown, Brown/Black and Black in `stages.json` as "use Blue" instead of "planned". PR #396 still lists them as planned upgrades.
- No red except the brand sign.

## What the Programmer needs
- One lookup from the player's own highest belt to one picture (day or dusk to match the time). Red to Black map to the Blue picture. See `stages/stages.json` in PR #396 for file names. Show the reward message once, after the Gate scene.
- A belt with no built picture shows the nearest earlier built one.
- Other players are drawn on top and never change the town.
- Tuck and each proposal are new code scope. Each is flagged in its own section and none is part of this PR.

## Open
- The placeholder building's final use (A4-2) is still open.
- When the PR #339 stack merges, a follow-up fills each `visibleChange` in the gate scenes. For Red it is Tuck's arrival. For Red/Black to Black it follows the proposal Jay picks.
- "Tuck" is a placeholder name until Jay or the Manager picks one.
- Jay picks, or passes on, one idea each for Red/Black, Brown, Brown/Black and Black. The reward lines for those four are proposed and go with the idea.
