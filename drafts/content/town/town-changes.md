# C-STORY-f: the town grows with every belt (draft)

Data: `town-changes.json`. Text only. Nothing shipped is changed, and `story/gate-scenes.json` (PR #339) is not edited.

## Jay's decision (t531u)
- The town starts as the approved A4 town-square concept (`incoming-art/town-square-concept`, day approved at A4-5): main dojo (teal noren), shop (gold and cream awning), placeholder building, Student of the Month statue, river with bridge, koi and stepping stones, practice yard, two lamp posts, and the Tower with one light.
- After each real belt test, there is **one** visible change that makes the town livelier and more homely.
- Night stays the cozy dusk version, and every light has a source.

## Shared-square rules (core-design §11, step 2)
- Each change is **per-player state keyed to the player's own highest earned belt**. Changes add up.
- Each phone draws its own town. Other players are drawn on top of it and never change it.
- **No shame:** there are no empty plots, locks, signs or "coming soon" marks. A White-belt town looks complete. Nothing in the town shows another player's belt.
- The statue (Student of the Month) is not touched.

## One change per belt
| Belt | changeId | What changes | Where | Reward message | Story tie-in | Fills gate placeholder |
|---|---|---|---|---|---|---|
| White | wc-lantern-halls-lamps | Lamp posts and a bridge lamp light up | Square and bridge | You brought light home! The town lamps are glowing. | Lamp Keeper | gate-white (alternate) / chapter-1 White Gate |
| Yellow | wc-sunrise-garden-blooms | Flower beds bloom, and a vine grows on the dojo porch | Flower beds, dojo porch | The garden woke up! Flowers are blooming everywhere. | Sun Gardener | gate-yellow |
| Orange | wc-ember-kitchens-chimney | The shop gets a bakery chimney, bread, and a long table | Shop | Supper smells so good! The town has a table for everyone. | Hearth Cook | gate-orange |
| Green | wc-giants-steps-path | A stone path to the pavilion, and a stone bench | Hill path | Step by step! A new path is ready to explore. | Stone Giant | gate-green |
| Blue | wc-quiet-river-clear | The river turns clear, with more koi and a sitting dock | River | The river is calm and clear. Come sit a while! | River Watcher | gate-blue |
| Red | wc-forge-courage-banners | A gold flame emblem on the banners, plus a dummy and a brazier | Practice yard | Be brave! The practice yard is ready for you. | Ember Knight | gate-red |
| Red/Black | wc-hall-echoes-bell | A wind chime and a welcome bell at the dojo door | Dojo door | Listen! The town sings hello to you. | Echo Mask | gate-red-black |
| Brown | wc-root-library-tree | A reading tree with a book-swap box | Beside the placeholder | A reading tree grew! Its roots go deep, like yours. | Root Keeper | gate-brown |
| Brown/Black | wc-storm-stair-tower-glow | The Tower glows bright with a rainbow, and a lantern hangs in the dojo window | Skyline, dojo window | The storm is quiet. The Tower glows bright for you! | Storm Herald | gate-brown-black |
| Black | wc-summit-great-lamp | Out of scope (placeholder only) | n/a | n/a | Lost Lightbearer | n/a |

The day and night notes for each belt are in the JSON.

## What the Artist needs
- Nine add-on overlay layers on top of the A4 base, each in a day and dusk version. No red (the Red-tier emblem is gold).
- Every addition must stay out of the walkable lanes so it looks fine with other players walking around.

## What the Programmer needs
- One lookup from the player's own belt to the list of changeIds that are on. Show the reward message once, after the Gate scene.
- Other players are rendered on top of the local town, and their belts never change it.
- No new launch scope: this reuses the town square already planned. The live square itself stays post-launch (core-design §11).

## Open
- The placeholder building's final use is still open (A4-2). The Brown tree sits beside it, not in it.
- The Brown/Black window lantern relies on Sensei's reveal (PR #341, unmerged). It works as a plain lantern either way.
- When the PR #339 stack merges, a follow-up fills each `visibleChange` from this file.
