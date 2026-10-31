# C-STORY-g: the town grows with every belt (draft, v2)

Data: `town-changes.json` (the same words; `tools/check-town-changes.py` checks they match). Text only. Nothing shipped is changed, and `story/gate-scenes.json` (PR #339) is not edited.

This rewrites C-STORY-f for Jay's new town arc (Oct 31). The art is in PR #396 (`incoming-art/town-growth`).

## The arc
- **White:** a little worn, and a hopeful fresh start.
- **Yellow:** cleaner.
- **Orange:** the approved base concept art.
- **Green:** the statue arrives.
- **Blue:** the first gentle, homely touches.
- **Red to Black:** gentle upgrades that never crowd the screen. Red keeps Jay's approved gold flame.
- **Dusk** stays subtle.
- **One full picture per belt**, swapped whole. Nothing stacks.

Belt order (docs/curriculum.md): White, Yellow, Orange, Green, Blue, Red, Red/Black, Brown, Brown/Black, Black.

## Rules
- **stateKey:** player's own highest earned belt; the phone shows that belt's picture
- **structure:** one complete town picture per belt, each in a day and a dusk version, swapped whole. Nothing stacks.
- **sharedSquare:** each phone renders its own town; other players are drawn on top and never change it
- **noShame:** no locks, 'coming soon' marks, signs or text on the town, and nothing about other players' belts. A worn or empty bit is allowed when it looks friendly. Words about the town are hopeful and never blame.
- **dusk:** subtle and cozy; every light has a source (a window, a lantern, a lamp post, a brazier or the Tower)
- **redToBlack:** one gentle add-on per belt, a small one, out of the walking lanes, never a screen full of effects
- **colour:** no red in the town except the brand sign. Any flame is gold.

## One picture per belt
| Belt | pictureId | Status | What you see | Reward message | Story tie-in | Fills gate placeholder |
|---|---|---|---|---|---|---|
| White | town-1-white | built (sample, PR #396) | The fresh-start town: a little worn and very friendly. Faded colours, a boarded window, a patched shop awning and bridge plank, weedy flower beds, cloudy water with one koi, an empty statue plinth. The two lamp posts and the windows glow softly at dusk; the tall lantern posts stay dark for now. | Welcome home! This town has lots of room to grow, and you will help it shine. | Lamp Keeper / Lantern Halls: the lanterns are waiting, and the first small lights are on. | gate-white (unused alternate) - also covers chapter-1 screens 14-17 White Gate |
| Yellow | town-2-yellow | planned, not built yet | Cleaner and more normal than White. The boards and patches are gone, the flower beds are tidy, and the water is clearer. The plinth is still empty. | The town got a tidy-up! Fresh and neat, just for you. | Sun Gardener / Sunrise Garden: the garden is tidy and ready to wake up. | gate-yellow |
| Orange | town-3-orange | built (sample, PR #396) | The approved town concept art, our base look. Plus a shop chimney and a bread basket. The plinth is still empty. | Fresh bread at the shop! The town smells like home. | Hearth Cook / Ember Kitchens: the ovens are warm again. | gate-orange |
| Green | town-4-green | planned, not built yet | The statue arrives on the plinth. The rest is the Orange town. | The statue has arrived in the square! Come and take a look. | Stone Giant / Giant's Steps: big things stand tall one step at a time. | gate-green |
| Blue | town-5-blue | built (sample, PR #396) | The statue plus the first gentle, homely touches: a thin curl of chimney smoke, two more koi and two more lily pads, a warm tint, faint sun beams and a few floating specks by day, a few fireflies near the river at dusk. | The town feels cozy now. Koi are swimming and the sun is glowing. | River Watcher / Quiet River: calm water and a calm heart. | gate-blue |
| Red | town-6-red | planned, not built yet | The Blue town plus a gold flame on the hill banners and the practice-yard banners. The flame is gold, never red, with no words. This was approved by Jay (t677u). One add-on from the options below may join it. | Be brave! A gold flame now shines on the town banners. | Ember Knight / Forge of Courage: courage burns warm, not angry. | gate-red |
| Red/Black | town-7-red-black | planned, not built yet | The Red town plus one gentle add-on chosen from the options below. | PROPOSAL: Jay picks an option below | Echo Mask / Hall of Echoes: kind voices answer back. | gate-red-black |
| Brown | town-8-brown | planned, not built yet | The Red/Black town plus one gentle add-on chosen from the options below. | PROPOSAL: Jay picks an option below | Root Keeper / Root Library: deep roots and steady growth. | gate-brown |
| Brown/Black | town-9-brown-black | planned, not built yet | The Brown town plus one gentle add-on chosen from the options below. | PROPOSAL: Jay picks an option below | Storm Herald / Storm Stair: calm after the storm. | gate-brown-black |
| Black | town-10-black | planned, not built yet | PROPOSAL ONLY. Black is a separate thing (Jay), so these are for Jay to pick from, or to leave out. One gentle add-on on the Brown/Black town. | PROPOSAL: Jay picks an option below | Lost Lightbearer / The Summit: the Great Lamp shines on the whole town (lore/10-black.md). | n/a |

The day and dusk notes for each belt are in the JSON.

## Add-on options for Jay (PROPOSALS)
Pick one per belt, or none. Each is small and stays out of the walking lanes. Red already has the gold flame.

### Red
PROPOSAL - Jay picks one (or none). The gold flame is already part of Red.

- **red-a: Practice dummy** (PROPOSAL). A friendly padded training dummy on the grass at the edge of the practice yard. Day: A little stuffed dummy with a cloth belt. It stands still and waits. Dusk: No glow of its own. The nearest lamp lights it a little. Reward line: "Be brave! A training buddy is waiting in the yard."
- **red-b: Brazier with a stone ring** (PROPOSAL). A small brazier with a gold glow, safe inside a ring of stones, at the yard edge. Day: A calm little flame in a stone ring. No sparks fly. Dusk: The brazier is the light source: a warm gold pool on the ground, small and gentle. Reward line: "Be brave! A warm gold light glows in the yard."
- **red-c: Practice mats** (PROPOSAL). A neat stack of folded practice mats and a water bucket by the yard fence. Day: Tidy blue and cream mats, ready to use. Dusk: No glow. Quiet and calm. Reward line: "Be brave! The yard has fresh mats ready for you."

### Red/Black
PROPOSAL - Jay picks one.

- **redblack-a: Wind chime** (PROPOSAL). A small wind chime by the main dojo door. Day: It turns and twinkles in the sun. Dusk: It catches the door-lamp light. No glow of its own. Reward line: "Listen! The dojo door sings hello."
- **redblack-b: Welcome bell** (PROPOSAL). A small brass welcome bell on a bracket by the dojo door. Day: A little gold bell, still and shiny. Dusk: It shines a bit in the door light. Reward line: "Ding! The dojo door has a welcome bell."
- **redblack-c: Cloth pennants** (PROPOSAL). A short string of small cloth pennants along the dojo porch rail (gold, cream and teal). Day: The pennants flutter in the breeze. Dusk: They hang quiet in the window light. Reward line: "Look up! Little flags cheer along the dojo porch."

### Brown
PROPOSAL - Jay picks one.

- **brown-a: Reading tree and book box** (PROPOSAL). A friendly young tree beside the placeholder building with a small book-swap box at its roots. Day: Leaves rustle and shade falls on a small bench. Dusk: A warm lamp glows inside the book box. That is the only glow. Reward line: "A reading tree grew! Its roots go deep, like yours."
- **brown-b: Vine arch by the beds** (PROPOSAL). A small wooden arch with green vines over the flower-bed path. It stays out of the walking lane. Day: Green leaves and a few small white flowers. Dusk: The leaves rest quiet in the lamp-post light. Reward line: "A green arch grew by the garden! Come see."
- **brown-c: Little free library** (PROPOSAL). A small wooden book box on a post near the bridge, no tree. Day: A tiny roof and a few colourful book spines. Dusk: A warm lamp inside the box is the only glow. Reward line: "A little book box opened by the bridge. Share a story!"

### Brown/Black
PROPOSAL - Jay picks one.

- **brownblack-a: Tower glows a little brighter** (PROPOSAL). The Tower light on the skyline shines a bit brighter and steadier. Day: A small bright spot at the Tower top. Dusk: The Tower is the light source: a soft glow like a gentle star. Reward line: "The storm is quiet. The Tower glows bright for you!"
- **brownblack-b: Soft rainbow** (PROPOSAL). A faint rainbow behind the Tower, as if after a passing rain. Day: A pale rainbow arc. No puddles in the walking lanes. Dusk: No rainbow at dusk. The sky stays calm. Reward line: "A soft rainbow shines over the Tower. The storm has passed!"
- **brownblack-c: Lantern in the dojo window** (PROPOSAL). A small lantern hangs in the main dojo window, like the one Sensei keeps. Works as a plain lantern if Sensei's reveal (PR #341, unmerged) changes. Day: A little lantern in the window. Dusk: The lantern is the light source: a warm glow in the window. Reward line: "A lantern is lit in the dojo window. It feels like home."

### Black
PROPOSAL - Jay picks one, or leaves Black out of this arc.

- **black-a: Tower light steady and gold** (PROPOSAL). The Tower top shines a steady gold light, like the Great Lamp. Day: A warm gold spot at the Tower top. Dusk: The Tower is the light source: a soft gold glow, not a beam. Reward line: "The Great Lamp shines! Its light reaches the whole town."
- **black-b: Gold lantern by the statue** (PROPOSAL). One small gold lantern on a post beside the statue. Day: A little gold lantern with a shiny glass. Dusk: The lantern is the light source: one soft gold pool by the plinth. Reward line: "A gold lantern shines beside the statue."
- **black-c: Gold specks drifting to the Tower** (PROPOSAL). A few tiny gold specks float slowly up toward the Tower. Day: Three or four specks only. Dusk: The same few specks, drifting slowly. Reward line: "Little gold lights float up toward the Tower."

## The 14 clashes from the Artist's note (PR #396), and how each was resolved
| # | Clash | What clashed | Resolution |
|---|---|---|---|
| 1 | Statue | Spec: the statue is not touched and is part of the start. New arc: the statue is absent until Green. | The statue arrives at Green. The plinth is empty at White, Yellow and Orange. The "statue is not touched" rule is dropped. |
| 2 | White start | Spec: a White-belt town looks complete, the start is the approved base. New arc: White is a little run down. | White is the fresh-start town, below the base. The approved base is Orange. White text is hopeful and says "room to grow", never shame. |
| 3 | No empty plots, locks or signs | Spec forbids them. The empty plinth, boarded window, patches and weedy beds break it. | The rule is narrowed. Still banned: locks, "coming soon" or belt signs, any text on the town, and anything about other players' belts. Allowed: worn bits and the empty plinth, drawn as friendly wear. This follows Jay's new arc and needs his OK (see DECIDE 1). |
| 4 | Structure | Spec: nine add-on overlay layers that stack. New: one full background per belt. | Each belt has one picture (`pictureId`). The phone shows the picture for the player's own highest belt and swaps it whole. Nothing stacks. "Changes add up" is replaced by "each picture is complete". |
| 5 | White lamps | Spec: lamp posts and a bridge lamp light up at White. New: no lamp reveal. | No lamp reveal. The lamp posts glow softly at dusk from White on. The tall lantern posts stay dark, which matches the Lamp Keeper story. |
| 6 | Yellow | Spec: beds bloom and a vine on the dojo porch. New: cleaner. | Yellow is cleaner: boards and patches gone, beds tidy, water clearer. No vine and no bloom reward. The approved flowers are in Orange. |
| 7 | Orange | Spec: bakery chimney, bread and a long table. New: the base plus a chimney and a basket. | Orange is the approved base plus a chimney and a bread basket. The long table and benches are dropped. The smoke moves to Blue. |
| 8 | Green | Spec: stone path and a stone bench. New: the statue arrives. | Green is the statue arriving. The path and bench are dropped. |
| 9 | Blue | Spec: the river turns clear, more koi and a sitting dock. New: statue and light effects, two more koi and lilies. | Blue is the first gentle homely touches. The dock is dropped. The river is clearer than White, but "turns clear" is no longer a Blue moment. |
| 10 | Effects only from Blue | Spec has effects at earlier belts. New: none before Blue, apart from the White lamp posts. | Agreed. Effects (smoke, beams, specks, fireflies) start at Blue and stay few. Dusk stays subtle: every glow has a source. |
| 11 | Red to Black | Spec: Red banners, dummy and brazier; Red/Black chime and bell; Brown tree and book box; Brown/Black glowing Tower, rainbow and window lantern; Black out of scope. New: gentle upgrades, none defined. | Red keeps Jay's approved gold flame. Red, Red/Black, Brown, Brown/Black and Black each get 2-3 PROPOSAL add-ons for Jay to pick one from. The old spec items are reused as options. One add-on per belt, so the screen never fills up. |
| 12 | Reward messages and tie-ins | The old messages and changeIds point at the old changes. | Every message is rewritten to match its picture (Green brings the statue). The old changeIds are replaced by pictureIds. Story tie-ins keep the same story names. Bible references are removed from this file, since faith content lives only in `drafts/content/faith/`. |
| 13 | Open items | The Brown tree beside the placeholder and the placeholder building's use. | Still open (A4-2). The boarded window in White is only wear. Every Brown option stays outside the building, so its use can be decided later. |
| 14 | Scope | The spec asked for nine overlays. The art has three of ten stages built. | The file now shows `pictureStatus` per belt. Built: White, Orange, Blue. Planned: the other seven. Until a picture is built, the belt shows the nearest earlier built one (README of PR #396). |

## What the Artist needs
- Yellow, Green, Red, Red/Black, Brown, Brown/Black (and Black if Jay wants it): one full town picture each, day and dusk, in the same frame as the PR #396 samples.
- No red except the brand sign. Any flame is gold. Keep every addition out of the walkable lanes.

## What the Programmer needs
- One lookup from the player's own highest belt to one `pictureId` (day or dusk to match the time). See `stages/stages.json` in PR #396 for file names. Show the reward message once, after the Gate scene.
- A belt with no built picture shows the nearest earlier built one.
- Other players are drawn on top and never change the town. No new launch scope: the live square stays post-launch (core-design §11).

## Open
- The placeholder building's final use (A4-2) is still open.
- The Brown/Black window lantern option relies on Sensei's reveal (PR #341, unmerged). It works as a plain lantern either way.
- When the PR #339 stack merges, a follow-up fills each `visibleChange` from this file.
- Reward lines for Red/Black to Black wait for Jay's pick.
