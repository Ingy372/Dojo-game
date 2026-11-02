# C-STORY-g: the town grows with every belt (draft, v3)

Data: `town-changes.json` (the same words; `tools/check-town-changes.py` checks they match). Text only. Nothing shipped is changed, and `story/gate-scenes.json` (PR #339) is not edited.

This rewrites C-STORY-f for Jay's new town arc (Oct 31) and his Nov 1 direction: **town visuals stop at Blue.** The art is in PR #396 (`incoming-art/town-growth`).

## The arc
- **White:** a little worn, and a hopeful fresh start.
- **Yellow:** cleaner.
- **Orange:** the approved base concept art.
- **Green:** the statue arrives.
- **Blue:** the first gentle, homely touches. **This is the last town picture.**
- **Red to Black:** no new art. The town shows the Blue picture. What grows is a mechanic, pitched below for Jay.
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

## Red to Black: no art
Red, Red/Black, Brown, Brown/Black and Black use the Blue picture. They keep their story tie-ins and gate placeholders (`gate-red`, `gate-red-black`, `gate-brown`, `gate-brown-black`; Black has none). Their reward lines wait for Jay's mechanic pick.

**Gold flame for Red: superseded by the Blue cap (unconfirmed).** Jay approved a gold flame on the banners (t677u). That was an art change, so with no art after Blue it has no home. Note for the Manager: please confirm it is dropped, or ask Jay whether he wants it somewhere else (for example as a small icon on the Red reward line).

The old art add-on options (dummy, brazier, mats, chime, bell, pennants, reading tree, vine arch, book box, Tower glow, rainbow, window lantern, gold lantern, gold specks) are all dropped.

## From Red up: mechanic proposals (PROPOSALS for Jay)

With no new art after Blue, Red to Black can still feel like growing. These are three charming ideas for what the town does from Red up. **All three are PROPOSALS. Jay picks one, a mix, or none.** Names such as Bea and Tuck are placeholder names.

**Rules for all three:**
- Each phone shows only the player's own story. No chat between players, no purchases, no timers, no streaks, no "come back" pressure, and nothing that mentions another player's belt.
- Nothing here changes how strong you are. Real training stays the source of power. These are for warmth, stories and kindness.
- Everything is skippable, and a kid who skips loses nothing.
- Every line is short, hopeful and kind. No Bible text here (faith content stays in `drafts/content/faith/`).

| | Option | Feel | Launch scope |
|---|---|---|---|
| 1 | Neighbours Wake Up | A town that comes alive | **Heavy.** New townsfolk sprites (art, so it goes beyond the Blue cap and needs Jay's OK), walking paths, a wave and hello. Start with one or two walkers. |
| 2 | Tuck the Traveling Helper | One new friend with a purpose | **Medium.** One new character sprite (art, needs Jay's OK), a small dialogue screen, optional tasks. |
| 3 | Dusk Tales with Sensei | A bedtime story that leads to the Tower | **Light.** Reuses the existing story cards and Sensei's voice. Content only, plus one "Tales" entry. No new art. |

### Option 1: Neighbours Wake Up (PROPOSAL)
**Pitch:** The town has been quiet and cozy. From Red up, the neighbours start strolling about, one new friend at each belt. They wave when you walk by. Everyone sees their own town, so nothing hints at anyone else's.

| Belt | What grows | Sample lines |
|---|---|---|
| Red | Bea the baker strolls between the shop and the bridge. | "Good morning! Fresh bread today." |
| Red/Black | A gardener and a kid with a kite join the walk. They stop to say hello. | "Look how high my kite goes!" |
| Brown | The koi keeper feeds the fish at the river. Neighbours bow back when you bow. | "A kind bow! I'll bow right back." |
| Brown/Black | At dusk the neighbours stroll by the statue and look up at the Tower. | "The Tower light looks warm tonight." |
| Black | The whole town takes a slow evening walk toward the Tower light. | "Thank you for helping our town shine." |

**Why it's fun:** The town feels alive, and kids get a wave back. Waving and bowing is gentle and costs nothing.

### Option 2: Tuck the Traveling Helper (PROPOSAL)
**Pitch:** At Red, a small traveler named Tuck arrives with a backpack that is far too big. Tuck sits by the bridge and has a real purpose: a small helpful task, a Tower story to share, and a chance to practice kind manners. Tasks are always optional. Thanks is the only reward.

| Belt | What Tuck does | Sample lines |
|---|---|---|
| Red | Arrives and asks for one small, helpful thing: say hello to Sensei for Tuck. | "Hi! I'm Tuck. Could you say hello to Sensei for me?" |
| Red/Black | Shares a story from the Tower, one piece at a time. | "I heard a hall up there repeats kind words. Want to hear?" |
| Brown | Manners practice. Tuck asks how to be kind, and both answers are fine; Tuck shows the kinder one. | "Someone dropped their pencil. What could we do?" |
| Brown/Black | Tuck shares a story about calm after a storm, and asks for help carrying a small lantern to the dojo. | "Storms pass. Want to carry this lantern with me?" |
| Black | Tuck waves at the Tower and cheers you on. | "See you at the top! I'm cheering for you." |

**Why it's fun:** A friend who is glad to see you, a story that gets bigger each belt, and tiny kind jobs. Kids get to be the helper.

### Option 3: Dusk Tales with Sensei (PROPOSAL)
**Pitch:** When the town lights come up at dusk, Sensei has a short story card, one new tale per belt from Red up, each from the Tower's own history. Each ends with a tiny, kind thing to try. Nothing is counted and nothing is earned. It is the story the Tower has been waiting to tell.

| Belt | The tale | Sample lines |
|---|---|---|
| Red | The Forge of Courage: the smiths who sang while they worked. | "Courage can be warm, like a small flame." |
| Red/Black | The Hall of Echoes: a hall that once repeated kind words. | "What kind thing could you say today?" |
| Brown | The Root Library: every book tells how someone was helped. | "Who helped you once? You could say thanks." |
| Brown/Black | The Storm Stair: wind and rain that wash the Tower clean. | "After the storm, the air feels fresh." |
| Black | The Summit: the empty stand where the great light once shone. | "A little light from each of us can shine far." |

**Why it's fun:** It feels like a bedtime story from Sensei, it builds toward the Tower story, and each tale gives a small kindness idea for real life. It is also the easiest to build.

### Which one first?
My suggestion is **Option 3** for launch because it needs no new art and little code. **Option 2** could come later, with Tuck telling the Dusk Tales. **Option 1** is the biggest and fits best after launch. These can combine, and none is decided.

## The 14 clashes from the Artist's note (PR #396), and how each was resolved
| # | Clash | What clashed | Resolution |
|---|---|---|---|
| 1 | Statue | Spec: the statue is not touched and is part of the start. New arc: the statue is absent until Green. | The statue arrives at Green. The plinth is empty at White, Yellow and Orange. The "statue is not touched" rule is dropped. |
| 2 | White start | Spec: a White-belt town looks complete, the start is the approved base. New arc: White is a little run down. | White is the fresh-start town, below the base. The approved base is Orange. White text is hopeful and says "room to grow", never shame. |
| 3 | No empty plots, locks or signs | Spec forbids them. The empty plinth, boarded window, patches and weedy beds break it. | The rule is narrowed. Still banned: locks, "coming soon" or belt signs, any text on the town, and anything about other players' belts. Allowed: worn bits and the empty plinth, drawn as friendly wear. This follows Jay's new arc and needs his OK (see DECIDE 1). |
| 4 | Structure | Spec: nine add-on overlay layers that stack. New: one full background per belt. | Each belt up to Blue has one picture (`pictureId`). The phone shows the picture for the player's own highest belt and swaps it whole. Nothing stacks. "Changes add up" is replaced by "each picture is complete". |
| 5 | White lamps | Spec: lamp posts and a bridge lamp light up at White. New: no lamp reveal. | No lamp reveal. The lamp posts glow softly at dusk from White on. The tall lantern posts stay dark, which matches the Lamp Keeper story. |
| 6 | Yellow | Spec: beds bloom and a vine on the dojo porch. New: cleaner. | Yellow is cleaner: boards and patches gone, beds tidy, water clearer. No vine and no bloom reward. The approved flowers are in Orange. |
| 7 | Orange | Spec: bakery chimney, bread and a long table. New: the base plus a chimney and a basket. | Orange is the approved base plus a chimney and a bread basket. The long table and benches are dropped. The smoke moves to Blue. |
| 8 | Green | Spec: stone path and a stone bench. New: the statue arrives. | Green is the statue arriving. The path and bench are dropped. |
| 9 | Blue | Spec: the river turns clear, more koi and a sitting dock. New: statue and light effects, two more koi and lilies. | Blue is the first gentle homely touches. The dock is dropped. The river is clearer than White, but "turns clear" is no longer a Blue moment. |
| 10 | Effects only from Blue | Spec has effects at earlier belts. New: none before Blue, apart from the White lamp posts. | Agreed. Effects (smoke, beams, specks, fireflies) start at Blue and stay few. Dusk stays subtle: every glow has a source. |
| 11 | Red to Black | Spec: Red banners, dummy and brazier; Red/Black chime and bell; Brown tree and book box; Brown/Black glowing Tower, rainbow and window lantern; Black out of scope. New: gentle upgrades, none defined. | Updated Nov 1: town visuals now stop at Blue (Jay, via the Manager). Red to Black have no new art, so all the old art add-ons and my art options are dropped. From Red up, the md pitches mechanics instead, as PROPOSALS for Jay. Red to Black show the Blue picture. |
| 12 | Reward messages and tie-ins | The old messages and changeIds point at the old changes. | Messages up to Blue are rewritten to match their pictures (Green brings the statue). The old changeIds are replaced by pictureIds. Red up has no line until Jay picks a mechanic. Story tie-ins keep the same story names. Bible references are removed from this file, since faith content lives only in `drafts/content/faith/`. |
| 13 | Open items | The Brown tree beside the placeholder and the placeholder building's use. | The Brown tree is gone with the art add-ons. The placeholder building's use is still open (A4-2). The boarded window in White is only wear. |
| 14 | Scope | The spec asked for nine overlays. The art has three of ten stages built. | The cap makes it five pictures in all: White, Yellow, Orange, Green, Blue. Built in PR #396: White, Orange, Blue. Planned: Yellow, Green. Red, Red/Black, Brown, Brown/Black and Black use the Blue picture. Until Yellow and Green are built, a belt shows the nearest earlier built picture (README of PR #396). |

## What the Artist needs
- Yellow and Green: one full town picture each, day and dusk, in the same frame as the PR #396 samples.
- Nothing for Red to Black. Please mark Red, Red/Black, Brown, Brown/Black and Black in `stages.json` as "use Blue" instead of "planned". PR #396 still lists them as planned upgrades.
- No red except the brand sign.

## What the Programmer needs
- One lookup from the player's own highest belt to one picture (day or dusk to match the time). Red to Black map to the Blue picture. See `stages/stages.json` in PR #396 for file names. Show the reward message once, after the Gate scene.
- A belt with no built picture shows the nearest earlier built one.
- Other players are drawn on top and never change the town. No new launch scope in this file. The mechanic proposals below say what code each one would need; none is decided.

## Open
- The placeholder building's final use (A4-2) is still open.
- When the PR #339 stack merges, a follow-up fills each `visibleChange` in the gate scenes. For Red up it follows the mechanic Jay picks.
- Red to Black reward lines wait for Jay's pick.
