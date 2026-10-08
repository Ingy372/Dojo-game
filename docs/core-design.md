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
| **Run** | 5–7 minutes | Clear a floor room by room, pick Insights, beat the boss, collect loot | Anticipation |
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

## 10. Full progression: from first day to tenth-year black belt

### How a character starts

- **New students** create a character with their real name and belt pulled from DojoForge, choose a look, and start at level 1 with auto-attack, a basic Counter, and the Beginner's Stance, in the white belt tier.
- **Existing students get the legacy grant.** DojoForge may not have per-technique sign-offs for ranks earned years ago, so every requirement of every rank a student has already passed counts as signed off automatically. On first login, years of training unlock in one cascade of reward moments.
- **Catch-up experience.** Every player starts at level 1, but anyone below their rank's expected level earns double experience until they reach it. A veteran catches up in days, and still gets to feel the climb.

### Belts

Each real belt is one tier of the Tower. A promotion:

- opens the next tier (5 floors and a Guardian);
- raises the level cap by 10;
- makes room for that belt's ability package: 1 Form (kata), 1 Strike (kick combo), and 5 Technique Seals (self-defense);
- adds a room or area to the Home Dojo;
- unlocks the next story chapter and returns a fragment of the Tower's light;
- plays the promotion ceremony, the biggest moment in the game.

**Black belt degrees** each add a new summit tier above the black belt tier, with new enemies, master cosmetics, and higher level caps, so the game keeps growing with students for as long as they train.

### Stripes become Virtues

Every real character stripe grants a **Virtue**: a special power used with a full Focus meter. Up to 2 per belt, matching the real limit.

| Stripe word | Virtue | Effect |
| --- | --- | --- |
| **Respect** | Shield of Respect | A protective shield for you, or for your whole party in co-op |
| **Great Effort** | Second Wind | Refills Focus and some Health when you're in trouble |
| **Self-Discipline** | Perfect Discipline | For a few seconds, every Counter is a Perfect Counter |

- **Earning the same word again at a later belt ranks that Virtue up** (Respect II, Respect III), making it stronger and changing how it looks.
- **The character's belt shows the current belt's stripes,** like the real belt.
- **A Virtue banner in the Home Dojo** displays every stripe the student has ever earned, with dates.
- Other schools can add their own stripe words; each word is mapped to a Virtue in the game's data.

### Every way to earn power outside the game

| Real-world action | In-game result | Type |
| --- | --- | --- |
| Technique sign-offs | Forms, Strikes, Technique Seals | Power |
| Promotions | New tier, higher level cap, new dojo room, story chapter | Power |
| Character stripes | Virtues and Virtue ranks | Power |
| Attending class | Dojo Blessing: bonus experience and better loot for 48 hours | Boost |
| Weekly attendance streak | A growing aura and a small experience bonus | Boost |
| Parent-approved home practice | Training Points to upgrade abilities | Power |
| Watching technique videos | A small one-time bonus per video | Boost |
| Class milestones and anniversaries | Titles, certified trophies, cosmetics | Prestige |
| Student of the Month | A statue in the town square and a title | Prestige |
| Class goals | A special event floor for the class | Access |
| Real-life quests | Decorations, cleaning tools, titles | Prestige |

### Every way to earn power inside the game

- **Experience levels,** capped by real rank.
- **Gear,** capped by belt tier.
- **Ability Mastery** from using abilities.
- **Insights,** temporary upgrades within a run.
- **Crafting** upgrades from materials and recipes.
- **Decoration set bonuses** and **Calm Mind** from a clean dojo.
- **Honor** from manners and good choices, which unlocks quests and items.
- **Street Smarts power and location perks** (section 12), plus **Sensei's Scrolls and the Bestiary,** which give titles and small bonuses.

Real training still provides about two-thirds of a character's strength at every tier.

### End game

- **Summit tiers** for each black belt degree.
- **The Endless Ascent:** an infinite challenge climb that grows harder floor by floor. Players chase their own best floor, never a public ranking.
- **Mentorship:** black belts act as Senpai, leading parties of lower belts and earning Mentor rewards, mirroring their real role in the dojo.
- **Legendary sets, master crafting, and complete collections.**
- **The Hall of Masters:** every student who earns a real black belt gets a permanent plaque and statue in the school's Tower hall, showing their name, years trained, and black belt date. Younger students walk past it every day.

### The veteran black belt (8–12 years of training)

- A black belt with degree bars and the title **"Martial artist since [year],"** from their DojoForge start date.
- **An anniversary aura** that has grown with every year trained.
- **Every ability in the system:** every Form, every Strike, and dozens of Technique Seals; their Counter can throw, sweep, disarm, and escape.
- **Up to about 20 stripes** across their belts, giving several high-rank Virtues.
- **A full dojo estate** with courtyard and garden, plus legendary gear.
- **A plaque in the Hall of Masters.**

When a white belt sees that character in the town square, they see exactly where the journey leads.

## 11. Multiplayer and showing off

### Three steps to multiplayer

| Step | What students experience | When |
| --- | --- | --- |
| **1. Shared world (not live)** | Visit classmates' dojos and leave bows; see the Student of the Month statue; see classmates' characters in the town square as "echoes" | First release |
| **2. Live town square** | Classmates online at the same time see each other walking around the dojo town in real time, and wave, bow, and use preset emotes together | Second release |
| **3. Co-op Tower runs** | Parties of 2–4 classmates climb floors together in real time | After the game is proven |

The game server and the shared rules package are built from the start so these steps can be added without rewriting the game.

### Mentor play

When a higher belt joins a lower belt's run, the higher belt's power is scaled down to that floor's level, so the lower belt's contribution still matters. The higher belt keeps all their abilities, earns a **Mentor bonus**, and their Respect Virtue can shield the whole party. This mirrors senior students helping juniors in the real dojo.

### Showing off your dojo

Every decoration is earned, in the Tower or through real achievements. Nothing is ever bought.

- **Visiting:** classmates walk through your dojo and leave a bow. Only the owner sees their bow count, so it never becomes a popularity contest.
- **Certified trophies:** trophies for real achievements (promotions, anniversaries, Student of the Month, stripes) carry a seal with the date earned. Visitors can tell they're real, and they can't be earned any other way.
- **Featured Dojo of the Week:** chosen by an instructor and shown in the town square. A staff pick, never a vote.
- **Dojo photo card:** a shareable picture of the student's dojo for parents, like the promotion card.
- **Open House events:** a few times a year, every dojo in the school is open to tour.

### Safety and legal

This isn't legal advice; have a lawyer review the privacy policy and children's privacy (COPPA) compliance before public launch.

- **No free-text chat, ever.** Only preset emotes and phrases ("Nice counter!", "Follow me!"). Children can't share personal information, which removes most of the legal risk of multiplayer.
- **Same-school players only,** shown as first name and last initial or a school-approved nickname.
- **Parents control it:** they can turn multiplayer off, make their child's dojo private, and hide any player.
- **Consent runs through the parent's DojoForge account,** with a written privacy policy covering what the game stores.

### Costs

| Item | Estimated cost |
| --- | --- |
| Cloudflare (hosting, saves, live multiplayer) | About $5–15 a month for one school, on the Workers Paid plan ($5 minimum, with generous included usage); possibly $0 extra if DojoForge already pays for that plan. Tens of dollars a month across many schools. |
| Apple Developer Program | About $99 a year |
| Google Play Console | About $25, one time |
| Art, sound, and music packs | Roughly $20–100, one time |
| Lawyer review (privacy policy, COPPA) | One time; varies by lawyer |
| Claude usage after the $100 credit | The plan's regular usage |

Dojo layouts, bows, and showing off cost essentially nothing; they're tiny amounts of saved data. Live multiplayer is the only feature with a meaningful running cost, and it stays small at one school's size.

## 12. Power Rating, difficulty, perks, and maps

One number, the **Power Rating (PR)**, measures both players and monsters so everything can be compared. Numbers assume about 10 ranks from white to black belt; the formulas adjust automatically to each school's real belt list.

### The Power Rating scale

| Rank | Player max PR | Toughest normal content |
| --- | --- | --- |
| White belt (tier 1) | 1,000 | Guardian ≈ 900 |
| Each belt after that | +1,000 per belt | Guardian ≈ 90% of that tier's max |
| Black belt (tier 10) | 10,000 | Guardian ≈ 9,000 |
| Each black belt degree | +500 per degree | Summit Guardian ≈ 90% of that cap |

- **Player max is a hard cap per rank,** not one cap for everyone. Nobody can out-power their real rank.
- **Monster max in normal content** is the highest summit Guardian, just below the top player cap.
- **The Endless Ascent has no ceiling:** each floor is about 3% stronger than the last. It's where black belts test pure skill and chase a personal best.

### What makes up a player's PR

Every player at a rank shares the same cap, but how close they get varies. At any belt tier, the max PR is made of:

| Source | Share of tier max | What fills it |
| --- | --- | --- |
| Technique sign-offs | 40% | Forms, Strikes, Technique Seals, including catch-up items |
| Training Points | 17% | Parent-approved home practice; each ability upgrades to level 5, then it's maxed |
| Virtues | 10% | Character stripes (up to 2 per belt) and Virtue ranks |
| **Real training total** | **67%** | |
| Experience level | 18% | Playing; 10 levels per belt |
| Gear | 8% | Loot and crafting; capped by belt tier |
| Street Smarts | 5% | Real-world scenarios cleared and location sets completed (below) |
| Ability Mastery | 2% | Using abilities in combat |
| **Play and learning total** | **33%** | |

Every source has its own ceiling, including home practice, so no one can grind past the cap. A black belt with every stripe, regular home practice, and lots of play sits near 10,000; one who skipped stripes and home practice might sit around 7,500, still strong, and able to see exactly what's missing.

### Street Smarts power

Real-world scenarios add real power, so the lessons that matter most in life also matter in the game.

Scenarios are grouped into **locations** on the town map: the Park, the School, the Bus Stop, the Store, the Neighborhood, and (for ages 10 and up) Online. Each location holds a set of scenarios for the player's age band.

| Achievement | Reward |
| --- | --- |
| **Clear a scenario** (at least 1 star) | A small amount of power: +0.25% of the current tier's max PR, counted once per scenario |
| **3 stars on a scenario** | An extra +0.1% of tier max |
| **Complete a location set** (every scenario at that location with at least 2 stars) | +1% of tier max, the location's **badge**, and its **location perk** |

Street Smarts power is a share of the current tier's max, so it keeps its value as the student rises in rank. The total from Street Smarts is capped at 5% of the tier max.

**Location perks** match the real lesson each place teaches:

| Location | Perk | Effect |
| --- | --- | --- |
| **Bus Stop** | Situational Awareness | Enemy telegraphs appear 1 tick earlier |
| **Park** | Eyes Open | Secret rooms show on the floor map, and doors reveal what's behind them from farther away |
| **Store** | Stay Close | Healing teas restore more; in co-op, a bonus when near your party |
| **School** | Steady Voice | Virtues cost less Focus |
| **Neighborhood** | Safe Path | The escape dash from Technique Seals recovers faster |
| **Online** (ages 10+) | Guarded | Less damage from ranged enemies |

When a student moves into an older age band, each location gets a new, more mature set of scenarios. Completing a location again in the new age band ranks its perk up (Situational Awareness II), just like Virtues. Old scenarios still return for spaced review, but replaying them never removes or re-earns power.

### Difficulty levels

| Setting | Who it's for | Rewards |
| --- | --- | --- |
| **Guided** | Young kids and beginners: wider counter window, slower enemies | Same experience and loot as Standard. Young players are never punished for needing help. |
| **Standard** | Most players | Full progression |
| **Challenge** | Skilled players: enemies about 1.3–1.5× stronger, tighter timing | Everything in Standard, plus the extras below |
| **Endless Ascent** | End game | Personal-best floor and a milestone trophy every 10 floors |

Why choose Challenge, beyond the challenge itself:

- **Better gear:** Standard gear reaches about 90% of the tier's gear cap; Challenge gear can reach 100%. A small edge, never needed to progress.
- **Challenge-only cosmetics:** gi trims, auras, and decorations available nowhere else.
- **Certified "Challenge Clear" trophies** for the Home Dojo.
- **Rare crafting materials** for legendary sets, and better loot odds.
- **Faster ability Mastery** and harder titles.

Challenge monsters can be stronger than the player. Skill closes the gap (Perfect Counters, smart Form switching), not stats, the same way it does in martial arts.

### Perks and special powers

| System | What it is | Permanent? |
| --- | --- | --- |
| **Abilities** | Forms, Strikes, Technique Seals from sign-offs | Yes |
| **Virtues** | Special powers from character stripes | Yes |
| **Path Perks** | At each promotion, choose 1 of 3 permanent perks (for example, "Counters heal 5%" or "Strikes chain one extra hit"); can be re-picked anytime at the Home Dojo | Yes |
| **Location perks** | From completing Street Smarts location sets | Yes |
| **Insights** | Pick 1 of 3 upgrades after battle rooms | One run only |
| **Blessings** | Dojo Blessing (attending class), Calm Mind (clean dojo), streak aura | Temporary |
| **Set bonuses** | Completing gear or decoration sets | While equipped or displayed |
| **Mentor bonus** | Helping lower belts in co-op | Per run |
| **Titles** | Earned from achievements | Cosmetic only |

### Metrics for player power

- **Power Rating,** with its breakdown by source (visible to staff and the system only; see section 13).
- **Level** and **level cap.**
- **Core stats:** Health, Power, Guard, Speed, and Focus (meter size and refill rate).
- **Counter window bonus:** extra ticks from Forms, perks, and upgrades.
- **Training Power:** abilities unlocked, upgrade levels, Virtue ranks.
- **Street Smarts Rating:** scenarios cleared, stars, location sets completed, perk ranks.
- **Gear Rating:** combined gear strength against the tier cap.
- **Mastery levels** per ability.

Tracked but not counted as power: Perfect Counter rate, room grades, best Endless Ascent floor, floors cleared, Bestiary completion, and Honor.

### Metrics for monster power

- **Monster Rating,** on the same scale as player PR.
- **Rank:** normal, elite, boss, or Guardian.
- **Core stats:** Health, Power, Guard, Speed.
- **Telegraph time:** ticks of warning before each attack, the main difficulty lever for young players.
- **Aggression:** how often it attacks.
- **Poise:** how hard it is to stagger.
- **Attack patterns:** how many different moves it has.
- **Elite traits:** Swift, Shielded, Splitting, Guarding.
- **Loot tier:** what it can drop.

Within a tier, floor 1 enemies sit around 50% of the tier's max PR, rising to about 85% by floor 5, with the Guardian around 90%. Floors are tuned for a typical student at that point, not a perfect one, so nobody needs every stripe or every Street Smarts set to progress.

### Maps

There's no open world (expensive to build and easy for young kids to get lost in). Instead, three maps:

1. **The town map:** the hub, with the Home Dojo, town square, Hall of Masters, quest board, crafting workshop, the Tower entrance, and the Street Smarts locations. **New districts open as the Tower's light returns** with each real promotion, so the town grows as the student progresses.
2. **The Tower map:** every tier at a glance, with cleared floors, Guardians, and each Gate's requirement locks lit or unlit. It's the clearest picture of the student's real journey in the whole game.
3. **Floor maps:** rooms reveal as the player explores, doors ahead show what kind of room is behind them, and secret rooms appear as cracks or hidden paths.

## 13. Final build decisions

These decisions come from the final design review. **Where they differ from earlier sections, this section wins.**

### Systems unlock gradually, taught by Sensei

A new player never faces every system at once. Each system appears when it first matters, with a short lesson from Sensei.

| When | What unlocks |
| --- | --- |
| **First session (any rank)** | Moving, Counter and Perfect Counter, Strike, Focus, loot and equipping gear, the Home Dojo (placing, cleaning, the bow), the Gate and Path card, reward moments |
| **The first time it's earned (any rank)** | Form switching (first Form), Virtues (first stripe), Training Points (first approved home practice), Missions (first mission) |
| **2nd belt** | Insights, Street Smarts |
| **3rd belt** | Life-lesson quest stories and Honor |
| **4th belt** | Challenge mode and elite enemies |
| **5th belt and up** | Later systems as they ship: Path Perks, crafting, Sensei's Scrolls, the Bestiary |
| **Black belt** | Endless Ascent and Mentor play (after launch) |

**Sensei's Lessons** are how each system is taught:

- Short and hands-on: one sentence per screen, then practice in a safe training room where the player can't fail.
- **Never more than one new system per session.**
- Every lesson can be replayed anytime from the **Lesson Scroll** in the Home Dojo.
- **Existing students** receive their earned abilities right away, but their systems are introduced one per session over a **Welcome Week**, so a brown belt isn't buried on day one.

### Missions: every real-world goal spelled out

Every real-world goal that counts toward progress has a written **Mission** in the game with clear steps. Students arrive at class with the steps already done, and staff see them waiting in DojoForge.

| Real goal | Mission steps in the game | Who confirms |
| --- | --- | --- |
| **Technique sign-off** (kata, self-defense, kick combo) | Watch the technique video; log practice sessions (for example, 3, parent-approved); tap "Ready to show Sensei" | An instructor watches the student demonstrate in class, then taps OK or Not yet |
| **Character stripe** | Choose a word; the parent sets the 1–4 week period; the parent submits a short report | An instructor reviews the report, then taps OK or schedules a retry |
| **Belt test readiness** | All requirements signed off (or effort approval), time in rank complete | An instructor approves the student to test |
| **Home practice hours** | Log each session | Parent, one tap with Face ID |
| **Real-life quests** | Complete the task at home | Parent, one tap with Face ID |
| **Class milestones, anniversaries, streaks** | Automatic | No one; the system tracks them |
| **Street Smarts and in-game quests** | Complete them in the game | No one; the game tracks them |

**The staff side:** DojoForge gets a **"Ready for review" queue** listing students whose mission steps are complete, so approving takes one tap.

- **The standard never changes.** For techniques, the mission prepares the student; the sign-off still happens only after the student shows the technique in class.
- **"Not yet" stays private.** The student sees an encouraging message and a practice suggestion, never anything other players can see.
- **The game still never changes DojoForge records.** The "Ready to show Sensei" request goes through a request endpoint Nic builds, and only staff actions change a student's record.

### Power Rating is hidden from players

- **Players never see Power Rating or Monster Rating.** They see their belt, stripes, level, abilities, the Gate, and gear comparisons shown as simple better-or-worse arrows instead of numbers.
- **Staff accounts in DojoForge see each student's PR** and its breakdown. The system uses PR for balancing and measurement.
- **Personal-best skill stats stay visible to the player** (Perfect Counters, room grades), since they compare a student only to themselves.

### Experience pacing

- Experience for each tier is tuned so **a typical player reaches the tier's level cap at about 75% of the school's typical time in rank** for that belt (from DojoForge history or a school setting). Longer ranks get proportionally more to do.
- Higher belts, where ranks take longer, get more Challenge floors and events so the wait stays engaging.
- Catch-up double experience and the overflow into materials and Mastery stay in place.
- All experience numbers live in the tuning file and are reviewed after every playtest.

### Street Smarts format: illustrated story scenes

Scenarios are text-based scenes with multiple-choice answers, built so young readers can play them:

- **Each scene is one illustrated picture** (made with Grok, following the style guide), 1–3 short sentences, and 2–4 choices shown as large buttons.
- **Narration:** every line can be read aloud using the phone's built-in text-to-speech, which is free. It's on by default for ages 6–9, since many 6-year-olds can't read fluently yet. Jay can record his own voice for key scenes later.
- **A few interactive moments** where they fit naturally: tapping to spot exits and trusted adults, holding a button for the loud voice, and the escape timing challenge.
- **Branching:** each choice leads to a different next scene. The safest path earns the most stars, and Sensei reflects at the end.
- **About 6–10 scenes per scenario,** with backgrounds reused across scenarios at the same location.
- Claude drafts each script in plain language, ChatGPT can check the reading level, and **Jay approves every script before it's built.**

### Parents: as close to zero effort as possible

- **Nothing in the game requires a parent to play.** Parents only approve things that count as real progress.
- **One-tap Face ID approvals,** with "Approve all" when several entries are waiting.
- **At most one notification a day,** bundled together.
- **Stripe reports take a minute:** a few quick taps, then 1–2 sentences, with voice-to-text.
- **The weekly digest is automatic,** and every setting has a sensible default.

### Launch scope (6 months)

**At launch:**

- The Tower for every belt tier, using remixed rooms and enemy traits to keep content manageable, with a Guardian for each tier.
- Combat with Forms, Strikes, Technique Seals, and Virtues; loot and gear; Insights; Challenge mode.
- The Gate, the Path card, the promotion ceremony, the legacy grant, and Welcome Week.
- The Home Dojo: decorating, cleaning, the bow, certified trophies, visiting classmates' dojos, and the Hall of Masters.
- Missions and the staff approval queue; Training Points; the Dojo Blessing and streaks.
- Sensei's Lessons and the gradual unlock schedule.
- Street Smarts: 2–3 locations for ages 6–9 and 10–13.
- A starter set of manners quests and 2 life-lesson stories.
- Parent controls and approvals.

**After launch:** the live town square, co-op and Mentor play, the Endless Ascent, crafting, Path Perks, Sensei's Scrolls, the Bestiary, real-life quests, the Visitor's Pass, more Street Smarts locations, and more quest stories.

The month-by-month roadmap is in the framework, section 15.

### Legal timing

Talk with a lawyer **before milestone 8** (the store apps), not right before launch. App Store and Google Play rules for children's apps, and multiplayer for kids, are much easier to design around early than to fix later.

### Character customization

The player's character is a real martial artist, not a placeholder shape. Players build their own look in character creation and can change it anytime at the Home Dojo:

- **Built from layers** (body, skin tone, face, hair style and color, gi, belt). Each part is rendered separately from the same Blender model, so every combination animates correctly.
- **Gi colors** come from recoloring in code.
- **The belt is never customizable.** It's its own layer, recolored in code to always show the student's real rank and stripes.
- **Extra looks are earned, never bought:** headbands, hand wraps, gi trims, and auras from the Tower, Challenge mode, and real milestones.
- Every option is available to every player from the start except earned items, so no child feels left out by the basics.

### Art process: Blender, by the Art Director bot

No art pack is bought. The Art Director bot (Grok bot) is the game's artist and works in **Blender**, a free 3D program it can control with scripts:

1. **Build each character, enemy, and object once** as a low-poly 3D model in a bright, kid-friendly style with clear silhouettes that read at small size on a phone.
2. **Rig and animate it.** Mixamo (free) can add skeletons and provides martial arts animations; Jay judges every martial arts move like a student's technique.
3. **Render every animation frame** from one fixed camera angle (top-down three-quarter view) in 8 directions, as transparent PNG sprite sheets, using a reusable Blender script.
4. **Render icons, portraits, and scene pictures from the same models,** so everything in the game shares one style.
5. **Claude Code imports approved renders** with a repeatable script that trims, sizes, and packs them into texture atlases for Phaser.

Why this way: every frame comes from the same model, so animations stay perfectly consistent, which is the main thing that makes AI-made art look cheap when it's drawn picture by picture. Customization becomes swapping parts on one model. And a hired artist could later improve the same Blender files, so nothing is wasted.

The first step is a **one-character test** (a martial artist with idle, walk, strike, and counter animations). The full art plan starts only after Jay approves how it looks moving on his phone.
