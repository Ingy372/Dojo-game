# Dojo Ascent — Core Game Design

This is the companion to the Dojo Ascent Game Design Framework. The framework covers the whole project; this document defines the game itself: what players do, why it's fun, and the specific game logic that keeps them coming back.

## 1. The short answer

### What kind of game is it?

Dojo Ascent is a **2D top-down action RPG**: a dungeon crawler at its core, with loot, levels, skills, and treasure that fills a Home Dojo you design and show off to friends. Think of it as three familiar kinds of fun combined:

| Part | Feels like | What it gives the player |
| --- | --- | --- |
| **The Tower** (core) | An action dungeon crawler with loot | Skill, excitement, rewards |
| **The Home Dojo** (meta) | A home-building and collecting game | Ownership, creativity, something to show off |
| **Story and Street Smarts** (meaning) | A light adventure story with choices | Purpose, characters to care about, real-life lessons |

### Why 2D, not 3D?

A 3D open world would be the wrong choice for this team and this audience, for three reasons:

- **Cost.** 3D art, animation, cameras, and physics cost many times more to make. An AI-only team can produce a polished 2D game; it can't produce a polished 3D one, and a rough 3D game is exactly the cheesy result we're trying to avoid.
- **Readability for kids.** Top-down 2D shows the whole fight at once. Telegraphs, counters, and enemy positions are easy for a 6-year-old to read on a phone. 3D cameras are a common source of frustration for young players.
- **It's proven.** Many of the games kids play for years are 2D: Stardew Valley, Terraria, classic Zelda, Pokémon. Depth and polish matter far more than the third dimension.

### What is the point?

Players have a clear purpose at three levels, which is what separates a game people play for years from one they try once:

- **Right now (seconds):** defeat shadow creatures with skill, not button mashing. Read the attack, counter at the right moment.
- **This session (minutes):** clear a floor and bring treasure home to grow your character and your dojo.
- **The long journey (months to years):** climb the Tower to its summit, restore its light, and uncover where the shadow came from, while building the greatest dojo you can.

### The story that ties it together

The Tower once held a great light that protected the town at its base. The light was shattered, and shadow poured into the Tower. **Each belt tier's Guardian holds a fragment of that light.** Every time a player defeats a Guardian and opens the next Gate with a real promotion, a fragment returns and the world visibly changes: the town gets brighter, new shops and characters return, and the Tower above glows a little more.

Players see their progress changing the world, not just a number going up. Seeing your actions make a lasting, visible difference is one of the strongest sources of meaning in games. And the mystery of what shattered the light, revealed piece by piece as players rise in rank, gives them a story reason to keep climbing, alongside the real-world reason of earning their next belt.

## 2. Why players keep coming back

### The answer in one line

If we had to name the single factor that keeps students hooked: **every session makes their character and their dojo more theirs, and the next upgrade, item, or discovery is always just within reach.** Three hooks work together to create that feeling:

1. **Mastery:** "I'm getting better at this." Combat that rewards real skill and visibly improves with practice.
2. **Ownership:** "This is mine, and I built it." A character and dojo shaped by the player's choices, play, and real training.
3. **Anticipation:** "Something good is coming." The next loot drop, the next set piece, the next Gate, the next chapter of the story.

Every system below feeds at least one of these.

### The research, mapped to systems

| What the research shows | Source | Where it lives in the game |
| --- | --- | --- |
| **Competence, autonomy, and belonging** are what make games enjoyable and keep people playing, more than graphics or genre | Player Experience of Need Satisfaction research (Rigby & Ryan, building on Self-Determination Theory) | Skill-based combat; choices in loadout, path, and Insights; co-op, visiting, and class events |
| **Flow** happens when challenge matches skill; too easy is boring, too hard is frustrating | Csikszentmihalyi's flow research | Difficulty that rises tier by tier, Guided mode that adjusts after repeated defeats, optional Challenge mode |
| **Unpredictable rewards** keep behavior going longer than predictable ones | Operant conditioning research on variable reward schedules | Loot drops, rare items, Insight choices. Used only inside the game, never for anything bought, with bad-luck protection (section 5) |
| **Unfinished goals stick in the mind,** and effort rises as a goal gets close | The Zeigarnik effect; the goal-gradient effect | Collections, item sets, and the Bestiary, always showing the closest incomplete goal ("4 of 5 Bamboo Garden pieces") |
| **People value what they build themselves** far more than what they're given | The IKEA effect (Norton, Mochon & Ariely) | The Home Dojo, character customization, and crafting |
| **Curiosity grows when people know a gap exists** in what they know | Information-gap theory of curiosity (Loewenstein) | The visible Gate, locked tiers you can glimpse, secret rooms, and the mystery of the shattered light |
| **Habits form around a trigger, an action, a variable reward, and an investment** that makes the next return more likely | The Hook Model (Eyal), a product design framework | Real class gives a reason to play (Dojo Blessing); a quick run; loot and Insights; decorating and upgrades that make the player more invested |
| **Immediate, clear feedback** makes actions feel good and learnable | Game feel research and design practice | Hit effects, sounds, combo counters, room grades, and instant reward moments |

### What this means in practice

- **Fun first, rewards second.** Rewards keep players returning, but only if the core activity is satisfying on its own. Combat feel (section 4) is the foundation, which is why it's the first real milestone.
- **Always show the next goal.** At the end of every run and every screen, the player should see one specific, nearly finished thing to aim for.
- **Investment compounds.** The more a player has built (a decorated dojo, a growing collection, upgraded abilities), the more reasons they have to return. That's also why nothing they build is ever taken away.

## 3. The five loops

Good games are built from loops nested inside each other: a satisfying action repeated every few seconds, inside a goal that takes minutes, inside goals that take weeks and years. Each loop ends by feeding the next one, so there's never a moment with nothing to do or look forward to.

| Loop | Time scale | What the player does | Main hook |
| --- | --- | --- | --- |
| **Moment** | Seconds | Read an enemy's telegraph, counter or strike, see and hear the impact | Mastery |
| **Run** | 10–15 minutes | Clear a floor room by room, pick Insights, beat the boss, collect loot | Anticipation |
| **Session** | 20–60 minutes | Return home, upgrade, craft, decorate, clean, take a quest or scenario, then start another run | Ownership |
| **Week** | Days | Real class grants the Dojo Blessing; home practice earns Training Points; the quest board refreshes; class events | Anticipation |
| **Journey** | Months to years | Earn belts, open Gates, restore the Tower's light, expand the dojo, follow the story | All three |

### The moment loop

This is the loop everything else depends on. Every few seconds: **an enemy telegraphs → the player decides (counter, dodge, or strike) → the result lands with a hit flash, sound, and number.** A Perfect Counter fills the Focus meter and builds the combo counter. If this loop isn't satisfying on its own, no amount of loot will save the game.

### The run loop

1. **Enter a floor** with a chosen loadout.
2. **Pick a door.** Each door shows what's behind it: a battle, a treasure room, a challenge, a rest shrine, or a question mark.
3. **Clear the room** and earn a room grade (S, A, B) based on Perfect Counters, damage taken, and time.
4. **Choose an Insight** after each battle room: one of three temporary upgrades for this run (section 6).
5. **Repeat** for 5–8 rooms, with the player's build getting stronger and more interesting as Insights stack.
6. **Defeat the Guardian or floor boss** for a guaranteed treasure chest.
7. **Return home** with loot, materials, and experience, and see the summary: personal bests, items found, and the next goal.

### The session loop

Back at the Home Dojo, the player always has meaningful things to do with what they brought back: equip new gear, craft from materials, place new decorations, clean, upgrade abilities with Training Points, check the quest board, or play a Street Smarts scenario. Each of these points back toward another run: a crafted item that needs one more material, a quest on a specific floor, an upgrade that makes the next boss easier.

### The week loop

The week loop is where the game connects to real life. Attending class grants the **Dojo Blessing** (bonus experience and better loot for 48 hours), so playing after class is the best time to play. Home practice adds Training Points, new quests appear on the board, and class goals can unlock event floors. This gives students a natural rhythm: train, then play, without any daily-login pressure.

### The journey loop

The longest loop matches the real martial arts journey: belt by belt, Gate by Gate, fragment by fragment of the Tower's light, room by room of the dojo. It's designed to last as long as a student trains, years rather than weeks.

## 4. Combat logic and the numbers behind it

All numbers here are **starting values for the prototype**, to be tuned by watching real students play. What matters now is the logic; the exact numbers will change.

### Character stats

Five stats, simple enough for a 6-year-old to understand:

| Stat | What it does |
| --- | --- |
| **Health** | How much damage you can take before returning home |
| **Power** | How hard your strikes and counters hit |
| **Guard** | Reduces damage taken |
| **Speed** | Movement and recovery speed |
| **Focus** | A meter (0–100) that fills during combat and powers Strikes and Virtues |

Damage uses one simple formula: **damage = Power × move strength × 100 ÷ (100 + target's Guard).** Guard always helps but never makes a character invincible.

### Timing

The game runs at 20 ticks per second. Every timing below is measured in ticks, which keeps combat consistent on every device and ready for co-op.

| Setting | Perfect Counter window | Enemy telegraph time |
| --- | --- | --- |
| **Guided** | 10 ticks (0.5 s) | 1.5× longer |
| **Standard** | 6 ticks (0.3 s) | Normal (about 0.6–1.0 s) |
| **Challenge** | 4 ticks (0.2 s) | 0.8× shorter |

The Rooted Form adds 2 ticks to the counter window, so beginners have an ability that makes the core skill easier while they learn.

### The counter

| Result | When | Effect |
| --- | --- | --- |
| **Perfect Counter** | Counter pressed inside the window | No damage taken; enemy staggered for 1 second; counter hit for 2× Power; +25 Focus; big flash and sound |
| **Block** | Counter pressed outside the window | Damage cut in half; no stagger |
| **Hit** | No counter | Full damage; combo counter resets |

Technique Seals from real self-defense sign-offs add effects to Perfect Counters: a throw that knocks the enemy into others, a disarm that removes a ranged enemy's weapon, a sweep that knocks it down, an escape that dashes the player clear.

### Focus and combos

- **Each hit** adds 5 Focus; **each Perfect Counter** adds 25.
- **Strike combos** cost 30–50 Focus and are performed by tapping in rhythm, chaining 3–5 hits.
- **Virtues** need a full 100 Focus.
- **The combo counter** rises with each hit landed without being hit. At 10, 20, and 30, damage rises by 5%, 10%, and 15%. Taking a hit resets it.

This makes skill pay off in a visible, escalating way: a player who reads attacks well builds Focus faster, uses Strikes more often, and hits harder.

### Rules that keep fights fair and readable

- **Every enemy attack is telegraphed.** No unavoidable damage, ever.
- **Only two enemies attack at once.** The rest circle and wait their turn. Game designers call this the "kung fu circle," after martial arts movies where enemies attack one at a time. It keeps crowded fights readable and makes the player feel skilled instead of overwhelmed.
- **Enemies flash and pause when hit,** so every hit feels like it landed.
- **Healing is limited:** a few healing teas per run plus the rest shrine. Health matters, so skill matters.

### Room grades

Each battle room is graded S, A, or B based on Perfect Counters landed, damage taken, and time. Grades feed personal bests and some collection goals, giving skilled players a reason to replay and every player a clear sense of improvement.

### Adapting to the player

If a player is defeated twice on the same floor in a day, Sensei offers **Guidance** for the next attempt: extra Health and a wider counter window. It's optional and never shown to other players. This keeps frustrated players in flow instead of quitting, which is when most players leave a game.

## 5. Loot, gear, crafting, and collections

Loot is the anticipation hook: the reason a player wants to open one more door. The design goal is for every drop to be worth something, rare drops to feel exciting, and bad luck never to drag on long enough to frustrate.

### What drops

| Category | Examples | Purpose |
| --- | --- | --- |
| **Gear** | Hand wraps (Power), gi (Guard and Health), charms (special effects) | Character strength from play |
| **Decorations** | Banners, lanterns, plants, training dummies, weapon racks, furniture | Filling and showing off the Home Dojo |
| **Materials** | Bamboo, stone, silk, jade (different on each tier) | Crafting |
| **Recipe scrolls** | Instructions for crafting a specific item | Targeted goals |
| **Relics** | Rare story items from secret rooms | The mystery of the shattered light |
| **Healing teas** | Restore Health during a run | Survival |

The player's **belt is never loot.** It always shows their real rank.

### Rarity

| Rarity | Approximate drop share | Feel |
| --- | --- | --- |
| Common | 70% | Useful, steady |
| Uncommon | 22% | A nice upgrade |
| Rare | 7% | Exciting |
| Epic | About 1% | A story to tell friends |
| Legendary | Guardians and special challenges only | A goal worth chasing |

Each rarity has its own color, sound, and drop effect, so a rare drop is felt before it's read. The Dojo Blessing from attending class raises the odds of better rarities.

### Bad-luck protection

Random rewards are exciting, but long dry streaks make kids quit. So every run without a Rare item raises the chance of one, and **a Rare is guaranteed after five runs without one.** Legendaries have a similar guarantee after a set number of Guardian victories. Players get the excitement of chance without the frustration of endless bad luck.

### Style separate from stats

Every piece of gear can be worn for its look independently of its stats. A player can keep the gi they love while equipping stronger gear underneath. Kids get attached to how their character looks; forcing them to choose between looks and power undermines ownership.

### Gear stays within the power budget

Gear strength is capped by belt tier, so the best gear from play never outweighs what real training provides (see the framework's power budget). Gear makes a character stronger and more personal, but the Gate still opens only in the dojo.

### No wasted drops

Duplicates and unwanted gear break down into materials, so nothing a player finds is ever worthless.

### Crafting

The Home Dojo has a workshop where materials and recipe scrolls become decorations and gear upgrades. Crafting turns random drops into **targeted goals**: "I need three more jade from the Yellow tier for the Lantern Gate." Specific goals with a clear path are among the strongest reasons to start another run.

### Collections

- **The Bestiary:** an entry for every enemy, filling in as the player sees it, defeats it 10 times, and lands 10 Perfect Counters on it. Completed entries reveal lore and earn titles.
- **Decoration sets:** themed sets such as Bamboo Garden, Temple Lanterns, and Mountain Retreat. Completing a set unlocks a small bonus (for example, Calm Mind lasting longer) and a special display.
- **Relics:** rare story items that reveal the history of the Tower and the shattered light, piece by piece.
- **The trophy wall:** fills automatically from game achievements and real-world milestones.

### Always show the closest goal

After every run and on the Home Dojo screen, the game shows the **one nearest incomplete goal**: "1 more Bamboo Garden piece," "2 Perfect Counters until the Brute entry is complete," "3 jade to craft the Lantern Gate." A nearly finished goal is one of the most reliable reasons to play one more run.

## 6. Run variety: Insights, elites, and remixed floors

The biggest threat to a game's lifespan is sameness. People adapt to any repeated reward, and once runs feel identical, players drift away. A small team can't hand-build endless content, so variety comes from **systems that combine in different ways every run**.

### Insights (a different build every run)

After each battle room, the player chooses **one of three Insights**: temporary upgrades that last for that run only. Insights come in families tied to the Forms and Virtues:

| Family | Style | Examples |
| --- | --- | --- |
| **Rooted** | Defense and counters | Perfect Counters also hit nearby enemies; Blocks reflect some damage |
| **Flowing** | Speed and combos | Each 10-hit combo grants a burst of speed; Strikes chain one extra hit |
| **Power** | Heavy hits | Staggered enemies take 30% more damage; Strikes break shields instantly |
| **Virtue** | Special effects | Focus fills faster at low Health; a Virtue can be used twice per run |

Insights are designed to combine. Picking "Perfect Counters hit nearby enemies" and then "staggered enemies take more damage" creates a build where one well-timed counter clears a room. Discovering these combinations is a big part of the fun for older players, and every run plays differently.

Why it works: choosing between meaningful options supports autonomy, figuring out strong combinations builds mastery, and the uncertainty of which three will appear adds anticipation. Every Insight a player discovers is added to a **Scroll of Insights** collection, so even temporary upgrades leave a permanent mark.

### Elite enemies

Ordinary enemies can appear as **elites** with one added trait, shown by a colored aura:

| Trait | Effect |
| --- | --- |
| **Swift** | Moves and attacks faster |
| **Shielded** | Must be countered or hit with a Power strike first |
| **Splitting** | Breaks into two smaller enemies when defeated |
| **Guarding** | Protects nearby enemies until defeated |

Elites drop better loot. A handful of traits combined with a handful of enemy types creates far more variety than new enemies alone, at a fraction of the art cost.

### Remixed floors

Each tier has a library of **30–40 hand-designed rooms**, assembled in a different order and with different doors on every run. Handmade rooms keep quality high; random assembly keeps them fresh. AI can draft new room layouts quickly, so the library grows steadily.

### The Shifted Floor of the week

Each week, one floor gets a special rule, such as "Perfect Counters heal you," "double elites, double loot," or "Insights are all Rare." It gives players a reason to check in each week and try something new, without any pressure to play daily.

### Secrets

Hidden walls, puzzle rooms, and rare events (a wandering merchant, a lost Kohai who needs rescuing) appear occasionally. Secrets reward exploration and give kids something to talk about at the dojo: "Did you find the room behind the waterfall?"

## 7. The first 30 minutes

Across the game industry, a large share of players who quit a game do so during their first session. The first 30 minutes have one job: get the player to their first moments of mastery, ownership, and anticipation as fast as possible, teaching by doing instead of with walls of text.

| Time | What happens | Why |
| --- | --- | --- |
| **0:00** | Character creation pulls in the student's real name and belt: *"Welcome, Ava. Sensei says you're a Yellow Belt."* Choose a look in under a minute. | Instant personal connection; the real belt appears from the first second |
| **0:01** | Bow into the tutorial floor and move around. | The ritual starts immediately |
| **0:02** | A slow brute telegraphs a big attack. A prompt shows when to press Counter. First Perfect Counter, with a huge flash and sound. | Mastery in the first two minutes |
| **0:04** | First Insight choice from three options. | Autonomy and a taste of build variety |
| **0:06** | A guaranteed Uncommon drop, with its color, sound, and effect. | The first anticipation hit |
| **0:08** | Tutorial boss. Easy to beat, but it looks and sounds big. | An early win that feels earned |
| **0:10** | Return home. **Real training unlocks in a cascade:** every sign-off, Form, and stripe the student has already earned in the dojo unlocks one after another. *"You've already earned these in the dojo."* A brand-new white belt gets the Beginner's Stance and a preview of what their first sign-off unlocks. | The signature moment: endowed progress and the training link, felt rather than explained |
| **0:12** | Meet Sensei. Place the first decoration. Accept the first quest. | Ownership begins; characters to care about |
| **0:15** | A second run with the new abilities, on a real floor. | The new power is felt in play |
| **0:30** | The session wraps with three clear next goals: one in the game, one collection goal, one real-world goal ("Get Self-Defense #2 signed off to unlock a Technique Seal"). | Open goals bring players back; the real-world goal points to the dojo |

### Rules for the first session

- **Under one minute to the first action,** under two minutes to the first Perfect Counter.
- **No screen with more than one sentence of instructions.** Teach through play and short prompts.
- **No failure in the tutorial.** It should be impossible to lose the first fight.
- **End on anticipation,** never on a menu.

## 8. Where the hook stops: ethical limits

The same science that makes games engaging can be used to exploit kids. The line we draw: **the game earns attention by being good and by sending players back to the dojo, never by pressure, fear of missing out, or anything bought.**

| We use | We refuse |
| --- | --- |
| Random loot inside the game, with bad-luck protection | Loot boxes, paid randomness, or anything purchasable |
| A weekly rhythm (quest board, Shifted Floor, Dojo Blessing after class) | Daily login streaks that are lost if a day is missed |
| Collections and nearly finished goals | Energy timers that force waiting or reward paying to skip |
| Event rewards that return in later years | Limited-time rewards that are gone forever |
| Bows, visiting, and cooperation | Public rankings, or messages like "your friend passed you" |
| Natural stopping points after every run | Automatically starting the next run, or endless sessions |
| Notifications through DojoForge, controlled by the school and parents | Late-night notifications, or guilt-based reminders |

### Designed for healthy play

- **Every run ends at a natural stopping point** with a summary, and after a long session the summary suggests a break: *"Great session! Your character could use some rest. How about practicing your kata?"*
- **The best time to play is after class,** because of the Dojo Blessing. The game rewards training first, play second.
- **Parents control play limits and quiet hours** (see the framework).

### How we'll know the hook is healthy

The test isn't how many hours students play; it's what happens in the dojo. Healthy signs: steady sessions of reasonable length, and students who play attending as much or more than before. **If game time rises while attendance falls, the design is wrong and we change it.** The game exists to serve the training, never the other way around.

## 9. Lining up the two journeys

This is the final check on the whole design. Three rules must always hold:

1. **Every real step has a matching game moment,** felt within a day.
2. **Every wall in the game points to a specific real step.**
3. **Neither journey ever stalls,** whether a student trains more than they play or plays more than they train.

### One belt cycle, side by side

| Real journey | Game journey | How the game points forward |
| --- | --- | --- |
| **Promotion day:** new belt, new requirements | Promotion ceremony; the Gate opens; a new tier, a higher level cap, and a new room in the Home Dojo | The new tier's Gate shows the next belt's requirements as unlit locks; the Path card shows the first one with its video |
| **First weeks:** attending class, learning new techniques | The Dojo Blessing after every class; first floors of the new tier; each sign-off unlocks a Form, Strike, or Technique Seal | Each sign-off lights one lock on the Gate with a reward moment naming the real technique |
| **Middle of the rank:** home practice, a stripe goal | Training Points upgrade abilities; an earned stripe grants its Virtue; Training Quests; Sensei's Scrolls | The Path card always shows the next unsigned requirement; quests ask for real practice |
| **Approaching the test:** requirements done, time in rank nearly complete | The Guardian floor; the Gate almost fully lit; a test-date countdown on the Gate | Test-prep quests: Scrolls covering the whole rank, Training Quests for the kata |
| **Test day** | Nothing in the game competes with it | The next login plays the promotion ceremony |

For students on a regular M/W or T/TH schedule, the 48-hour Dojo Blessing means **consistent attendance keeps them blessed almost all the time.** Showing up is always the strongest thing a player can do for their character.

### The Gate mirrors the real requirements exactly

Each tier's Gate has:

- **A lock for every requirement** of the student's current rank: the kata, each of the five self-defense techniques, and the kick combo. Each one lights up when it's signed off in class.
- **A sundial for time in rank** that fills a little with every class attended.
- **Sensei's Seal,** which lights when an instructor approves the student to test, and shows the test date once it's scheduled.

When the real promotion happens, the Gate opens. Catch-up items never appear on the Gate, because they never block testing in real life; they show as unfinished Technique Seals on the character instead. If a student isn't approved to test, the Gate simply stays as it is. **The game never displays or guesses at why;** that conversation belongs to the instructor and the family.

### Real achievements are always the biggest moments

Celebrations are ranked so that real training always feels most important:

1. **Promotion ceremony** (the biggest moment in the game)
2. **Character stripe** earned, granting its Virtue
3. **Requirement signed off,** with its reward moment
4. **Real milestones:** class milestones, anniversaries, Student of the Month
5. **Guardian victory**
6. **Rare loot and completed sets**

No game-only event is ever celebrated more than a real one.

### Neither journey stalls

- **Training faster than playing:** a real promotion always opens the next Gate, even if the player hasn't cleared their current tier. Players below the new tier's expected level earn double experience until they catch up, so students who train a lot but play a little are never left behind.
- **Playing faster than training:** at the tier's level cap, extra experience turns into crafting materials and ability Mastery, so play is always rewarded. Challenge floors, collections, the Shifted Floor, Street Smarts, and quests keep the game exciting, while the Gate shows exactly what's needed in the dojo to go higher.
- **Waiting for the test:** when everything is signed off and the student is only waiting on time in rank or the test date, the Gate glows "Ready," and test-prep quests keep practice going.

### The Path card: the next real step, always visible

In the Home Dojo and at the end of every run, a **Path card** shows the student's next real step: the next unsigned requirement with its video, their next class day, a quick link to log home practice, and the test date when it's set. Game goals appear beside it but never replace it.

### Meaning on both sides

- **Real to game:** every real step produces a visible, specific change in the game, named after the real technique and the instructor who signed it off.
- **Game to real:** every Gate lock, quest, Scroll, and Path card points to a specific real action: a technique to learn, a video to watch, a session to practice, a class to attend.
- **One ending for both journeys:** the Tower's light returns one fragment per real promotion, the summit is black belt, and the story's mystery resolves as the student's real journey matures. The game's greatest achievement and the real goal are the same moment.
