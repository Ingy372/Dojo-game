# Dojo Ascent — Game Design Framework

Dojo Ascent (working title) is a true adventure RPG for martial arts students: a game kids choose to spend their free time on, where their character grows stronger as they progress in real training. Alongside the adventure, it teaches real self-defense and how to handle dangerous situations, builds martial arts manners and culture through quests, and gives every student a Home Dojo to build and care for. It exists to keep students training longer and more interested in their curriculum, and it has to be genuinely fun to do that.

## 1. Purpose, design pillars, and hard rules

### Why the game exists

The game is a retention tool that happens to be fun, not a game that happens to mention martial arts. Every system in it has to answer yes to one question: **does this make a student more likely to come to class, practice at home, or stay enrolled longer?** If a feature is fun but doesn't serve that, it waits.

Most martial arts games fail because they're one of two things: a cheap reskin of a generic mobile game with no real connection to training, or an educational app that feels like homework. Dojo Ascent avoids both by making real training the main source of power in the game, and by making the game itself good enough that kids want that power.

### Design pillars

1. **The dojo is the power source.** The biggest jumps in a character's strength come from real training: sign-offs, rank promotions, stripes, attendance, and home practice. Playing the game refines that power but never replaces it.
2. **Easy to learn, satisfying to master.** A 6-year-old can play from the first minute. A 15-year-old or adult still finds depth in timing, ability choices, and harder floors.
3. **A real game worth their free time.** Most kids already spend free time on games; this should be the one they choose. There's enough depth for a long afternoon, and every activity has a natural stopping point, so it also fits a quick ten minutes before dinner.
4. **Belonging over competition.** Students compare themselves to their own past and cooperate with classmates. No public leaderboards, matching the rest of the student app.
5. **The game points back to the dojo.** Every wall a player hits in the game has a clear real-world answer: "Get your kata signed off to unlock this," "Earn your yellow belt to open the next gate."

### Hard rules (never break these)

- **The game never affects real rank.** Nothing in the game counts toward a belt, stripe, or test. Real progress flows into the game, never the other way.
- **Game progress is capped by real rank.** A student who grinds the game but skips class can't out-power a student who trains.
- **No purchases, ads, loot boxes, or gambling mechanics.** It's included with the school's membership.
- **No punishment for missing class.** Training adds power; absence never removes it. No loss of power, no lost items, no guilt messages. (The Home Dojo gathering dust while a player is away is cosmetic, capped, and never costs anything; see section 7.)
- **No free-text chat.** Players communicate only with preset emotes and callouts.
- **Parents stay in control** of playtime limits and can see what their child does in the game.

## 2. The game at a glance

| | |
| --- | --- |
| **Genre** | Top-down 2D adventure RPG with three parts: the Tower (dungeon crawling), Street Smarts (real-world scenarios), and the Home Dojo (build, care for, and take on quests) |
| **Look** | Clean pixel art, readable on a phone screen |
| **Session length** | Flexible: a 5–7 minute Tower run (sessions of 15–30 minutes are several runs), a 3–5 minute scenario, or a whole afternoon |
| **Players** | A shared world from the start (visit classmates' dojos, see classmates in the town square), then a live town square, then co-op parties of 2–4 classmates; same school only |
| **Who plays** | Every student, age 6 through adult, with assist options for young kids |
| **Platform** | iPhone and Android apps on the App Store and Google Play, built from one codebase; the same game also runs in a phone browser and inside the DojoForge student app |
| **Cost to families** | Included with membership: no purchases, no ads |

### The world

At the center of the world stands **the Tower**, a great structure of many floors that has been overrun by shadow creatures. Martial artists climb it floor by floor to drive the shadow out. The tower is divided into **belt tiers**: groups of floors that match the real belt ranks, each sealed by a great gate that only opens for students who have earned that rank in the dojo.

The tone is adventurous and hopeful, not dark or violent. Enemies are shadow creatures that dissolve when defeated, not people. The core theme is that **discipline, effort, and respect are real power**, the same values taught in class. The character stripe words students earn in real life (Self-Discipline, Great Effort, Respect) exist in the game as **Virtues**, special powers only a student who has earned them can wield.

### The player's character

Each student's character is a young martial artist who **wears the student's real belt color** and shows their real stripes. When a student is promoted at the dojo, their character's belt changes too. This is the most important visual in the game: every time a kid sees their character, they see their real rank.

### Three ways to play

- **The Tower** (sections 3–6): the main adventure. Climb floors, fight shadow creatures, and grow stronger through real training.
- **Street Smarts** (section 8): short real-world scenarios that teach awareness, avoidance, de-escalation, escape, and getting help.
- **The Home Dojo** (sections 7 and 9): a space to decorate and keep clean, home to the dojo's characters and the quests that teach manners, culture, and life lessons.

## 3. Dual progression: how real training powers the game

This is the heart of the design. A character gets stronger in two ways: **training in the dojo** and **playing the game**. They are not equal. Real training sets how powerful a character *can* become; playing decides how much of that potential they reach.

**The loop:** Train in the dojo (class, home practice, stripes) → DojoForge records it (sign-offs, rank, hours, attendance) → the character grows stronger (new abilities, Virtues, a higher level cap) → the player plays and climbs until they hit a Gate in the Tower that needs a real sign-off or rank → motivation to train → back to the dojo.

The loop always closes back at the dojo. When a player gets stuck, the answer isn't "grind more," it's "get your next technique signed off." That turns the game into a constant, positive reason to train.

### The power budget

As a design target, about **two-thirds of a character's strength at any belt tier comes from real training**, and about one-third from play (levels, gear, mastery). A student who trains hard but plays little is still strong. A student who plays a lot but rarely trains hits a ceiling quickly and sees exactly what would raise it.

### What each piece of real training does in the game

| Real-world progress (from DojoForge) | What happens in the game |
| --- | --- |
| **Belt promotion** | The next belt tier's gate opens, the level cap rises, and the character's belt changes color. Triggers a full promotion ceremony (section 6). |
| **Kata signed off** | Unlocks a new **Form**: a stance that changes how the character fights (section 5). |
| **Kick combo signed off** | Unlocks or upgrades a **Strike** combo, the character's main damage. |
| **Self-defense technique signed off** | Unlocks a **Technique Seal**, an upgrade to the character's Counter and defensive skills. Five per belt, matching the five real techniques. |
| **Catch-up items** | Appear as locked seals with a clear label ("Sign off Self-Defense #4 to unlock"). Finishing catch-up items in class instantly unlocks them. |
| **Character stripe earned** | Grants the matching **Virtue**, a special power named after the word (e.g. Respect, Great Effort). Up to two per belt, like the real stripes. Earning the same word again at a later belt ranks the Virtue up. |
| **Attending class** | Grants the **Dojo Blessing**: bonus XP and better loot for the next 48 hours. Playing after class feels great; nothing is taken away when you miss. |
| **Weekly training streak** | A cosmetic aura that grows with the streak, plus a small XP bonus. When Jay restores a streak, the aura comes back too. |
| **Home practice hours (parent-approved)** | Earns **Training Points**, spent to upgrade unlocked abilities. The more a student practices at home, the further they can sharpen what they've learned. |
| **Milestones and anniversaries** | Titles, gi colors, banners, and trophies for the Home Dojo. |
| **Student of the Month** | A statue of that student's character stands in the Tower's entrance hall for the month, visible to every player at the school. |
| **Class goal reached** | A special event floor opens for everyone in that class for a week. |

### What playing the game adds

- **Experience levels,** up to the cap set by the student's real belt.
- **Gear and loot** with modest stat bonuses and lots of cosmetic variety.
- **Ability mastery:** using an ability often makes it slightly stronger and unlocks visual flourishes.
- **Floors cleared and secrets found** within the tiers they've unlocked.
- **Collections:** enemies defeated, items found, and Home Dojo decorations.

### Rewards land immediately and visibly

When DojoForge records new progress, the next time the student opens the game it plays a reward moment: *"Sensei Jay signed off Self-Defense #3 — new Technique Seal unlocked!"* The faster and clearer the link between the real action and the in-game reward, the stronger the motivation it builds. A kid who gets a technique signed off on Tuesday night should see it in the game that same evening.

## 4. Combat and how the game is fun

A game isn't fun because of its theme; it's fun because of what the player *does* every few seconds. The core action in Dojo Ascent is the same skill martial arts teaches: **read the attack, respond at the right moment.**

### Controls (phone-first)

- **Move** by tapping where to go, or with an on-screen stick.
- **Basic attacks happen automatically** against the nearest enemy, so young kids are never stuck.
- **Four ability buttons:** Strike (combo damage), Counter (defense), Form (switch stance), and Virtue (special power, on a long cooldown).

### The game runs on ticks

The game world updates in small steady steps called ticks (a fraction of a second each), the same model RuneScape uses. This makes combat readable and fair for kids, keeps the game simple to build, and means co-op can be added later without rewriting combat.

### The core skill: telegraphs and counters

Every enemy **telegraphs** its attacks: it glows, winds up, or shows a marker on the ground before striking. Pressing Counter during that window is a **Perfect Counter**: the attack is blocked, the enemy is staggered, and the hit lands with a big, satisfying impact. Mistimed, it's a normal block.

This mirrors self-defense directly. Players learn to watch, wait, and respond instead of mashing buttons, and the Technique Seals from real self-defense sign-offs make counters stronger and add new counter effects (throws, disarms, sweeps).

### Forms give depth

Forms, unlocked by real kata, are stances that change how the character fights. Examples:

| Form | Plays like |
| --- | --- |
| Rooted | Slower, sturdier, wider Perfect Counter window. Good for learning. |
| Flowing | Faster movement, Strike combos chain longer |
| Power | Slower Strikes that hit hard and break enemy shields |

Switching forms mid-fight to answer different enemies is where older and more skilled players find depth.

### Enemies teach one idea at a time

A small set of enemy types, each with a clear role: **swarmers** (many weak enemies), **brutes** (big, slow, obvious telegraphs, perfect for practicing counters), **shields** (must be countered or hit with a Power strike), and **ranged** enemies. Each new belt tier introduces one new enemy mechanic, so players always have something new to learn without being overwhelmed.

### How a run works

1. **Choose a floor** from the tiers unlocked by your real rank.
2. **Move through 5–8 rooms,** choosing between doors: battle rooms, treasure rooms, challenge rooms (a timed or no-damage test), a rest shrine, and the occasional secret room.
3. **Face the floor's boss.**
4. **Return to the Home Dojo** with experience, loot, and progress.

If a player is defeated, they return home **keeping their experience and anything found so far**; only the run ends. Losing never costs real progress, so frustration stays low and kids try again.

### Where the fun comes from

- **Mastery:** landing Perfect Counters and chaining combos feels better the more you practice, just like in class.
- **Choice:** which form to use, which door to take, which ability to upgrade with Training Points.
- **Discovery:** secret rooms, new enemies, and a new tier opening at every promotion.
- **Expression:** gi colors, titles, and a Home Dojo that's yours.
- **Feel ("juice"):** impact flashes, small screen shakes, punchy sounds, and enemies that react to hits. This is the cheapest thing to add and the biggest difference between a game that feels cheap and one that feels good. It's a priority from the first prototype.
- **Friends (later phase):** running floors with classmates.

### Built for ages 6 through adult

**Guided mode** (on by default for young players, adjustable by parents) widens counter windows, slows enemies, and can auto-counter. It's never called "easy mode" or shown to other players. Older players can turn on **Challenge mode** for harder floors and cosmetic-only rewards.

## 5. Ability system mapped to the curriculum

Every belt in the real curriculum has the same structure: 1 kata, 5 self-defense techniques, 1 kick combo. The game mirrors that structure exactly, so each belt unlocks a matching **ability package**.

### One belt = one ability package

| Real requirement | Game ability | Count per belt |
| --- | --- | --- |
| Kata | 1 new **Form** (stance) | 1 |
| Kick combo | 1 new **Strike** combo | 1 |
| Self-defense techniques | **Technique Seals** that upgrade the Counter | 5 |
| Character stripes (optional) | **Virtues** (special powers) | Up to 2 |

The seals add real variety to the Counter: one adds a stagger, another an escape dash, another a sweep, a disarm, or a throw. By black belt, a student's Counter reflects every self-defense technique they've earned.

### Each ability carries the real technique

Every ability card in the game shows:

- **The real technique's name** as taught at the school (e.g. the kata's actual name).
- **When it was signed off,** and by whom.
- **A "Watch the real technique" button** that opens its video in the student app's library.

This keeps the real technique at the center. Kids learn their curriculum names by using them in the game, and every ability is one tap from practicing the real thing.

### Loadout: making choices

Players collect far more abilities than they can use at once, so they build a loadout before each run:

- **1 Strike** combo
- **Up to 3 Forms** to switch between in a fight
- **The Counter** (with all earned seals active)
- **1 Virtue**

Choosing a loadout for a floor's enemies gives older players real strategy, while younger players can use the recommended loadout.

### Upgrading with Training Points

Parent-approved home practice earns Training Points, which upgrade unlocked abilities through five levels each (more damage, faster recovery, a bigger counter window, a new visual effect). This is the direct reward for home practice, and it gives a clear reason to practice: *"20 more minutes of practice and my Flowing Form hits level 3."*

The exact conversion (for example, 15 approved minutes = 1 Training Point) will be tuned in playtesting. The Training Log's daily cap keeps it from being gamed.

### Configurable for every school

The game never hardcodes Action Zone's curriculum. Each school's requirement list in DojoForge maps to the same ability slots, and the ability names come from that school's technique names. The art for forms, strikes, and seals is generic, so a new school only needs its curriculum entered in DojoForge for the game to work. This is what lets the game ship to other DojoForge schools without new art.

## 6. The Tower: floors, belt tiers, trials, and promotion

### Structure

The Tower has **one tier for each rank in the school's belt system**, read from DojoForge. Each tier contains:

- **5 floors,** unlocked one after another by playing (clear a floor to open the next).
- **A Guardian floor** at the top, with a tier boss.
- **The Gate** above the Guardian, which opens only when the student earns the next real belt.

Each tier has its own look and enemies, loosely themed around its belt color, and introduces one new enemy mechanic. Every tier also raises the **level cap** (for example, 10 more levels per tier), so a promotion always means room to grow.

### The Gate is always visible

From the first floor of a tier, players can see the Gate at the top. Tapping it shows the same information as the student app's progress card: requirements signed off (e.g. 5 of 7), classes until test eligibility, and the next test date. The Gate is a constant, friendly reminder that the next big step happens in the dojo.

The Gate shows one lock for each real requirement, which lights when it's signed off, plus a sundial for time in rank and Sensei's Seal for test approval. A real promotion always opens it, even if the player hasn't cleared every floor of their current tier. The full alignment rules, including the Path card and the order of celebrations, are in the Core Game Design doc, section 9.

### The Guardian is a practice test

Each tier's Guardian boss tests everything that tier taught: its enemy mechanic, the Forms and Strikes unlocked so far, and timing. Defeating the Guardian earns a trophy for the Home Dojo and a "Tier Champion" title, **but never opens the Gate**. Only the real belt does. Players who beat the Guardian before their promotion are ready and waiting, and the Gate's requirements are right there.

### The promotion ceremony

The first time a student opens the game after a real promotion, the game plays a short ceremony:

1. The character bows, and their belt is tied in the new color.
2. The Gate opens, and the new tier is revealed.
3. A preview of the new tier's enemy and the abilities waiting to be earned.
4. Promotion rewards: a cosmetic, a Home Dojo trophy, and the raised level cap.
5. A **promotion card** parents can save or share (see section 11).

This is the single biggest moment in the game, and it's deliberately tied to the single biggest moment in real training. It turns test day into something kids look forward to twice.

### Earlier tiers stay useful

All unlocked tiers stay playable. Earlier floors are good for collecting, finishing secret rooms, and practicing, and each has a **Challenge version** with harder enemies and cosmetic-only rewards for skilled players.

### The summit and beyond

Black belt reaches the top of the Tower. Advanced degrees beyond black belt can add new summit tiers later, so the game keeps growing with long-term students rather than ending.

## 7. Home Dojo: decorate, maintain, and take pride in your space

The Home Dojo is each player's own training space and the heart of the game between adventures. It's where the long-term attachment forms: games where kids build and care for a space of their own are among the ones they return to for years.

### Decorating

Players arrange their dojo however they like: floors, walls, mats, lighting, banners, plants, training equipment, and weapon racks for the traditional weapons taught in class. Decorations come from three places, and none are ever bought:

- **The Tower:** loot and boss rewards.
- **Quests:** manners, culture, and life-lesson quests (section 9).
- **Real training:** trophies for class milestones, anniversaries, promotions, and Student of the Month that can only be earned in the real dojo.

### The dojo grows with your rank

The space expands with real promotions. A white belt starts with a single small training room; higher belts add a second room, a courtyard, a garden, and finally a full dojo at black belt. Each promotion ceremony ends with the new space being revealed. Kids can see what a higher rank's dojo looks like, which gives them one more reason to aim for it.

### Keeping it clean

In real dojos, students clean the training space together, a tradition of respect for the place you train and humility before the work. The Home Dojo carries that lesson.

While a player is away from the game, the dojo slowly gathers dust, fallen leaves, scuffed mats, and scattered equipment. Cleaning it is a quick, satisfying routine: sweep the floor, wipe down the mats, straighten the weapon rack, water the plants. A full clean takes a minute or two.

A clean dojo grants **Calm Mind**, a small bonus for the next Tower runs, and visitors see it shine. Keeping the dojo clean over time earns cosmetic rewards and titles.

**Guardrails, so this teaches responsibility without becoming a guilt machine:**

- **Mess builds slowly and stops at a limit,** reached after about a week away. It never gets worse than "needs a good cleaning."
- **Mess never damages or removes anything** and never blocks playing the Tower.
- **Planned absences pause it.** Vacations and illnesses marked in the student app don't make the dojo messier.
- **The welcome back is always warm:** "Welcome back! Let's get your dojo ready," never "look what you let happen."

### Real-life responsibility quests

Parents can approve real-world tasks that pay off in the Home Dojo, using the same quick Face ID approval as the Training Log: helping clean the real dojo after class, cleaning their room at home, or helping with a chore. These earn special cleaning tools, decorations, and titles. It's optional for families, and it carries the lesson from the game back into real life.

### Visiting classmates

From the first release, students can visit classmates' dojos (same school only), look around, and leave a bow as a sign of respect. There's no text and no rating, and only the owner sees their bow count. Certified trophies, the Featured Dojo of the Week, dojo photo cards, and Open House events are in the Core Game Design doc, section 11. Showing off a space you're proud of is one of the most motivating social features in games for kids.

## 8. Street Smarts: real self-defense and dangerous situations

The Tower is fantasy. **Street Smarts** is a separate mode set in the real world: short, story-based scenarios where the player navigates difficult or dangerous situations at a park, school, bus stop, store, or neighborhood. It's where the game teaches the self-defense that matters most, which is usually the fight that never happens.

### The lesson behind every scenario

Every scenario follows the same self-defense priorities taught in class:

1. **Awareness:** notice what's around you, the exits, and the warning signs.
2. **Avoidance:** stay out of the bad situation in the first place.
3. **Boundaries and voice:** say no firmly, use a loud voice, draw attention.
4. **De-escalation:** calm a conflict down instead of feeding it.
5. **Escape:** break away and get to safety.
6. **Get help:** find a trusted adult or a safe place.
7. **Physical self-defense,** only as a last resort, and only enough to get away.

The best outcome in every scenario is the one that ends safely with the least fighting. Players learn that the real win is going home safe.

### How scenarios play

Each scenario takes about 3–5 minutes and mixes a few kinds of moments:

| Moment | What the player does |
| --- | --- |
| **Awareness** | Scan a scene and spot the important things within a time limit: the exits, the trusted adults, the warning signs |
| **Choice** | Pick what to say or do from a few options, with a timer when the situation is moving fast |
| **Voice** | Choose the strongest, clearest boundary statement, then "use your loud voice" by holding a button |
| **Escape** | A timing challenge for breaking a grab, using the same telegraph-and-respond skill as the Tower. Signed-off self-defense techniques add escape options named after the real techniques. |
| **Get help** | Find the right person or safe place to go to |

After each scenario, the Sensei character walks through what happened and why the best choices worked. Players earn up to three **Street Smarts stars** per scenario based on how safely they handled it. A rough outcome is never shown graphically. The story pauses with "Let's see what could have gone differently," and the player can try again right away.

### Scenarios by age

Scenarios are grouped by age band, so a 6-year-old and a teenager get situations that fit their lives. Examples:

| Ages | Example situations |
| --- | --- |
| **6–9** | Getting separated from a parent in a store; a stranger offering a treat or a ride; a playground bully; someone grabbing your arm |
| **10–13** | Ongoing bullying and group pressure; someone following you home; standing up for a friend; a stranger messaging you online |
| **14+** | De-escalating an argument that's turning physical; walking alone at night; a party situation that feels wrong; helping someone else who's in danger |
| **Adults** | Parking lot awareness, travel safety, de-escalation, protecting family |

### Keeping it safe and right

- **Jay approves every scenario before release.** AI drafts scenarios from the school's curriculum, but nothing reaches students until Jay has reviewed it and confirmed it matches what's taught in class.
- **Never graphic or frightening.** Threats are implied, not shown. No injuries, no depictions of kidnapping. The tone is calm and confident: "Here's what you know how to do."
- **Parents see every topic** and can turn specific topics off for their child.

### Why it works, and its limits

Research on teaching children safety skills shows that knowing the right answer isn't enough; kids need instruction, a model of the right behavior, rehearsal, and feedback, and they need to practice in realistic settings. Street Smarts provides the rehearsal and feedback in a safe, repeatable form. It works best alongside class, not instead of it. A **Scenario of the Month** lets Jay teach the same situation in class that week, so students practice it physically and in the game, which helps the skill carry over to real life.

### Rewards

Street Smarts stars and badges are displayed in the Home Dojo, and completing a set of scenarios earns special decorations and titles. Each cleared scenario also adds a little power, and completing every scenario at a location (such as the Bus Stop) earns more power plus a location perk tied to that place's lesson. The full system, including how Street Smarts fits the power budget, is in the Core Game Design doc, section 12. Scenarios can be replayed for more stars, and older ones come back on a spaced schedule so the lessons stay fresh.

## 9. Quests: manners, culture, and life lessons

Quests give the game its story and its heart. They're where students learn how a martial artist carries themselves, where the school's culture comes alive, and where life lessons are practiced through choices instead of lectures.

### The people of the dojo

Quests come from a small cast of recurring characters, mirroring real dojo relationships:

- **Sensei:** the wise teacher and main quest giver, who reflects with the player after important moments.
- **Senpai:** an older student who mentors the player and models good character.
- **Kohai:** a younger, newer student the player helps and mentors as they rise in rank.
- **Neighbors and townsfolk** who bring everyday problems: a lost item, a conflict, someone who needs help.

The cast grows familiar over time. Kids get attached to characters, which is a big part of what makes a game feel like a world instead of a menu.

### Kinds of quests

| Quest type | What it teaches | Examples |
| --- | --- | --- |
| **Dojo manners** | How a martial artist behaves in the dojo | Bowing when entering and leaving, greeting Sensei properly, lining up by rank, caring for equipment, addressing others respectfully |
| **Culture** | Where martial arts and the school come from | The school's terms, the meaning of the belts, the arts blended in the school's style, the school's founding story |
| **Mentorship** | Leadership and helping others | Teaching the Kohai a technique, helping a new student find their way, carrying gear for someone who needs it |
| **Life lessons** | Character, through choices with consequences | Multi-part stories about honesty, perseverance, handling anger, kindness, winning and losing gracefully, self-control |
| **Real-life quests** | Carrying lessons into real life | Parent-approved tasks: helping at home, an act of kindness, cleaning the real dojo after class |

### Manners are built into everyday play

Some manners aren't quests at all; they're how the game works. Players **bow when entering their Home Dojo and each Tower floor**, and the bow is a short, satisfying animation with a small Respect bonus. Sensei is always addressed properly in dialogue. Equipment is returned to the rack after training. Repeated every session, these rituals become second nature, the same way they do in class.

### Life lessons through choices

Life-lesson stories put the player in situations with real choices. A few examples:

- **Honesty:** the player finds a classmate's lost wallet with money in it.
- **Handling anger:** a rival keeps provoking the player before a Tower challenge.
- **Perseverance:** the player fails a Guardian trial and must decide whether to quit or train and try again.
- **Kindness:** a new kid is being left out at the dojo.
- **Humility:** after a big win, the player can brag or encourage others.

Choices change how the story unfolds and how characters respond. Afterward, Sensei reflects on the choice and what it means, without lecturing. Choosing well earns **Honor**.

### Honor

Honor is a character stat earned through manners, mentorship, and good choices in life-lesson stories. It unlocks Sensei's advanced quests, special Home Dojo items, and new story chapters. In keeping with the no-punishment rule, poor choices don't take Honor away. They simply don't earn it, and they lead the story somewhere less good, which Sensei helps the player think through.

### Mentorship in co-op

When co-op arrives, it reinforces the senpai-kohai relationship with real classmates. Higher belts who party with lower belts earn a **Mentor bonus**, and the lower belt gets help climbing. This mirrors how senior students help juniors in a real dojo and encourages students across ranks to bond.

### The quest board

A few new quests appear on the Home Dojo's quest board each week and stay for several weeks, so there's always something new without daily pressure. Story chapters unlock with rank, so new arcs open as students progress in real life.

### Each school's own content

Culture quests and values content come from each school as a content pack. Action Zone's pack can include its founding story and the values and faith of Yeshua's Ryu; another school can supply its own. AI drafts quests from the school's material, and the school owner approves them before release.

## 10. Learning science built into the game

The game uses the same research principles as the student app, applied through gameplay. Each mechanic below exists because it measurably improves learning or motivation.

| Principle | What the research says | How the game uses it |
| --- | --- | --- |
| **Retrieval practice** | Recalling something from memory builds it far more than re-watching or re-reading | Sensei's Scrolls (below): short recall challenges about real techniques |
| **Spacing** | Reviewing material at growing intervals keeps it from fading | Scrolls for older techniques return on a schedule, so a white belt kata still gets reviewed at green belt |
| **Fast, clear reinforcement** | A reward that follows the real action quickly and clearly strengthens that behavior most | Sign-offs, promotions, and attendance appear in the game the same day, with a reward moment naming exactly what was earned |
| **Goal gradient** | Effort rises as people get closer to a goal | Progress bars on every seal, upgrade, floor, and the Gate |
| **Endowed progress** | People who start with some progress already credited are more likely to finish | New players start with the tutorial floor cleared and a Beginner's Stance already unlocked |
| **Self-comparison** | Comparing to your own past motivates everyone; comparing to others discourages most | Run summaries highlight personal bests ("12 Perfect Counters, your best yet"), never rankings |
| **Autonomy, competence, belonging** | The three drivers of long-term motivation | Loadout and path choices; visible skill growth; Home Dojo, class events, and co-op |

### Sensei's Scrolls (retrieval practice)

At rest shrines inside the Tower, players can open a Sensei's Scroll: a 30–60 second challenge about their real curriculum. Examples:

- **Kata order:** put still frames from their kata video in the correct order.
- **Name it:** match a technique's name to its picture.
- **Dojo words:** match the school's terms to their meanings.

Correct answers earn bonus XP or open secret rooms. Scrolls are always optional and never block progress. Questions come from the student's current and previous ranks, with older material resurfacing on a spaced schedule.

### The game sends kids back to real practice

- **"Watch the real technique"** appears on every new ability. The first full watch of a technique's video earns a small bonus.
- **Training Quests** ask for real-world practice, such as "Practice your kick combo three times this week." They're completed through parent-approved Training Log entries, not by playing.
- **The Gate** always shows what's left to earn in class.

### Rewards that inform, not control

Research shows that expected rewards for doing something can weaken a person's own motivation, while rewards that recognize real competence strengthen it. So in-game rewards for real training are always framed as recognition of what the student learned ("You earned this Technique Seal by mastering Self-Defense #3"), never as payment for showing up. The game should make kids proud of their training, not make training feel like a chore done for loot.

## 11. Retention and marketing loops

The game should grow the school, not just entertain current students. These loops connect it to enrollment and retention, and they all run through tools DojoForge already has.

### Promotion cards (word of mouth)

After every promotion ceremony, parents get a **promotion card**: the student's character in their new belt, the school's name and logo, and the date. Parents can save it or share it to social media. Proud parents already post belt photos; this gives them a polished, branded image that puts Action Zone in front of their friends. Cards show first name only by default, and sharing is always the parent's choice.

### Visitor's Pass (new leads)

A free, browser-playable **first floor** linked from the school website. A prospective student creates a character, learns the controls, and plays one floor. It ends with: *"Your character is ready to train. Book a free trial class to earn your white belt and continue the climb."* The booking goes straight into the DojoForge Leads pipeline, and when the student enrolls, their guest character carries over. A kid asking their parent to go back to a game they enjoyed is a powerful lead.

### Bring a friend (referrals)

When a student refers a friend who enrolls, both get a matching cosmetic (for example, a pair of banners for their Home Dojos). Matching rewards emphasize the friendship rather than the transaction, and friends who train together tend to stay longer.

### Events tied to the real dojo calendar

Limited event floors follow real school events: a "Trial Week" event during belt exam season, tournament events, holiday events, and summer camp events. They give everyone something new to look forward to and connect the game's calendar to the dojo's. Event rewards come back in later years, so no one feels punished for missing one.

### Class goals become class events

When a class reaches a shared goal in the student app (like everyone logging an hour of home practice), the game opens a special event floor for that class. The whole class sees that their combined effort unlocked it.

### Gentle re-engagement

For students flagged at risk in DojoForge's Retention page, the game can send positive nudges on their assigned class days: *"Your Dojo Blessing is waiting — see you in class tonight."* Never guilt, never "you're falling behind." These go out through DojoForge's notifications, so the school controls how many families receive.

### A selling point for DojoForge

For other schools, the game is a major reason to choose DojoForge: a retention tool no competitor has, powered entirely by data they already enter. A demo floor for school owners is part of the sales kit.

## 12. Safety, ethics, and parent controls

Many players will be under 13, and the game comes from a school parents trust. That trust is worth more than any engagement number, so safety is designed in from the start.

### Children's privacy

- **Accounts come through DojoForge.** Students don't sign up for the game separately; it uses the account and parent relationship the school already has, so parental consent runs through the parent's DojoForge account.
- **Collect only what the game needs:** game progress and the training data DojoForge already holds. No location, contacts, or photos.
- **No third-party ads or tracking tools** in the game.
- **Before launch, have a lawyer review** compliance with COPPA (the US children's privacy law), and with App Store rules for kids' apps if the game is ever released as its own app.

### Social safety

- **No free-text chat.** Players communicate only through preset emotes and callouts ("Nice counter!", "Help!", "Let's go!").
- **Co-op parties form only between students at the same school,** from a list of classmates or a parent-approved friend list.
- **Player names are first name plus last initial,** or a school-approved nickname. Parents can turn multiplayer off, make their child's dojo private, and hide any player.

### Parent controls

In the parent's view of the student app:

- **Daily play limit** (set by parents if they want one) and **quiet hours** (no play after bedtime or before school).
- **Guided mode** on or off for their child, and which Street Smarts topics are turned on.
- **A simple activity summary:** time played, floors cleared, and what was unlocked from real training.

When a play limit is reached, the game finishes the current room or run instead of cutting off mid-fight, then sends the character home to rest with a friendly message. Kids learn the limit as part of the game, not as a punishment.

### Ethical design commitments

- **No purchases, loot boxes, or ads,** ever.
- **No fear-of-missing-out pressure:** limited event rewards return in later years, and nothing expires in a way that pushes kids to play daily.
- **No guilt messages or penalties** for missing class or not playing.
- **The game should never compete with class.** Any feature that would make a student rather play than train gets removed.

## 13. Art, audio, and how an AI-only team makes it

Art is the biggest risk for an AI-built game. AI image tools make good single pictures but struggle to make dozens of matching characters and smooth animation frames. The plan works around that instead of fighting it.

### Visual style

**Top-down pixel art** at a small, fixed sprite size, with a limited color palette. Pixel art is readable on phones, forgiving, and widely available as professional asset packs. It looks intentional rather than cheap when it's consistent.

### Where the art comes from

| Need | Source |
| --- | --- |
| Characters, enemies, tiles, animations | **One professional pixel-art asset pack** (typically $10–40 on itch.io), all from the same artist so everything matches. Check that the license allows use in a commercial product. |
| Belt colors and gi colors | **Recolored in code** from one character sprite (a "palette swap"), so every belt and cosmetic color needs zero new art |
| Hit flashes, sparks, screen shake, particles | **Generated in code** by Claude |
| Icons, portraits, menu backgrounds, promotion card frames, tier concept art | **Grok image generation**, guided by the style guide |
| Sound effects | Free code-based sound generators plus a royalty-free sound pack |
| Music | A royalty-free music pack licensed for commercial use |

Street Smarts and the Home Dojo need modern scenes as well as fantasy ones: streets, parks, stores, schools, interiors, and furniture. Choose an artist whose packs cover both fantasy dungeons and modern town and interior settings, or two packs with the same sprite size and a matching palette.

### The style guide keeps AI output consistent

The repository includes a short style guide: the palette, sprite size, fonts, and example images. Every request to Grok for new art includes it, and Claude Code follows it for UI. Consistency matters more than any single beautiful image.

### Who does what

| Who | Role |
| --- | --- |
| **Jay** | Vision, decisions, curriculum content, playtesting with students, final approval |
| **Claude (chat)** | Design framework, system design, balancing math, writing (lore, Scrolls, UI text), reviewing plans |
| **Claude Code** | Writing, testing, and fixing all game code in the GitHub repository |
| **Grok** | Grok and Grok bot: generating icons, portraits, backgrounds, and Street Smarts scene illustrations; backup help when Claude can't do something |
| **Nic** | The DojoForge side: the progress feed the game reads and student login |

**ChatGPT** (free account) is a second opinion: checking that scenario and quest text reads at the right level for young kids, proofreading, and brainstorming ideas. Code always stays with Claude Code, so there's one source of truth for the game.

## 14. Technical architecture

This section is written for Nic and Claude Code. Nic should confirm it fits the existing DojoForge stack before building starts.

**How the parts connect:** DojoForge (Nic's backend: rank, sign-offs, stripes, attendance, hours, streaks) → read-only feed → **Game server** (Cloudflare Workers + D1; saves game progress) ↔ login and progress ↔ **Game client** (the Phaser game inside the phone app or a browser). In a later phase, **co-op rooms** (Cloudflare Durable Objects) run 2–4 player parties off the game server.

DojoForge stays the source of truth for everything real. The game keeps only its own progress (levels, loot, Home Dojo, settings) and never writes back to DojoForge.

### Technology choices

| Part | Choice | Why |
| --- | --- | --- |
| Game engine | **Phaser 3 + TypeScript**, built with Vite | Mature 2D web engine with huge documentation, so AI writes it well; runs anywhere a browser runs |
| Hosting | **Cloudflare Pages** | DojoForge already uses Cloudflare; nearly free at this scale |
| Game server | **Cloudflare Workers** with a **D1** database | Same platform; stores game progress; checks the student's DojoForge login |
| Co-op (later) | **Cloudflare Durable Objects** | Each party runs in one room on the server, which fits the tick-based design |
| Mobile | Standalone iPhone and Android apps made with Capacitor from the same code, which can also be embedded in the DojoForge student app | One codebase covers both phones; iOS builds run on GitHub Actions, so no Mac is needed |

### Five architecture rules

1. **Read-only from DojoForge.** The game reads a student's progress through one feed and never changes anything in DojoForge.
2. **Game rules live in one shared package.** Combat, abilities, and progression math are pure code with no graphics, so the same rules run in the player's browser now and on the server for co-op and cheat prevention later.
3. **Content is data, not code.** Abilities, enemies, floors, loot, Sensei's Scrolls, quests, dialogue, and Street Smarts scenarios are defined in data files, so new content doesn't require programming changes.
4. **Mock data first.** The prototype uses fake student profiles shaped exactly like the real feed, so the game can be built and tested while Nic builds the real feed in parallel.
5. **Every DojoForge school works automatically.** Belt tiers, ability names, and Scroll content come from each school's curriculum in DojoForge.

### The progress feed (what the game needs from DojoForge)

One read-only endpoint per student returning:

- **Identity:** student ID, first name and last initial, school ID, age band (for Guided mode defaults).
- **Rank:** current belt, belt history with dates (including ranks earned before DojoForge, for the legacy grant), the student's training start date (for anniversaries), and the school's full ordered belt list.
- **Requirements:** each requirement for the current rank with its type (kata, kick combo, self-defense), name, signed-off status and date, plus catch-up items.
- **Stripes:** earned stripe words with dates.
- **Attendance:** recent class dates and assigned class days.
- **Streak:** current weekly streak.
- **Home practice:** total approved Training Log minutes, with recent entries.
- **Accolades:** earned accolades with dates.
- **Class goals:** active and completed goals for the student's class.
- **Videos:** the video ID linked to each requirement, for the "Watch the real technique" button.

The student logs in with their DojoForge account, and the game server checks that login with DojoForge.

### Repository layout

```
dojo-ascent/
  CLAUDE.md          instructions Claude Code reads first
  docs/              this framework, style guide, decisions log
  packages/sim/      shared game rules (combat, abilities, progression)
  apps/client/       Phaser game
  apps/server/       Cloudflare Worker + D1
  content/           abilities, enemies, floors, scrolls (data files)
  fixtures/          fake student profiles for testing
  assets/            licensed art and sound
```

## 15. Build plan for Claude Code and the $100 credit

The goal for the $100 credit is a **playable prototype**: one complete floor, the core combat, and the training link working with fake student data. That's enough to put in front of students at the dojo and to show Nic. Everything after it builds on a proven foundation.

### Milestones

Each milestone ends with something Jay can check himself, without reading code.

| # | Milestone | What gets built | Done when |
| --- | --- | --- | --- |
| 0 | **Setup** | GitHub repo, CLAUDE.md, this framework in docs/, a blank Phaser game deployed to Cloudflare Pages | A link opens the game on your phone |
| 1 | **Movement** | One room, the character moving by tap or stick, walls and collision | Moving around feels smooth on a phone |
| 2 | **Combat core** | Tick-based rules package, one brute enemy, auto-attack, Strike, Counter with telegraphs and Perfect Counter, health, defeat, impact effects | Landing a Perfect Counter feels satisfying, and a student can play for two minutes without help |
| 3 | **A full floor** | 5–8 rooms with door choices, three enemy types, a boss, loot, a return to the Home Dojo | A full run takes 5–7 minutes and feels complete |
| 4 | **Training link (mock data)** | Fake student profiles; abilities, Forms, and seals unlock from profile data; level cap; the Gate; Dojo Blessing; reward moments; the promotion ceremony | Switching the fake profile from white belt to yellow belt visibly changes the character and opens the Gate |
| 5 | **Home Dojo basics** | A small room, placing and moving about ten decorations, mess that builds while away, the cleaning routine, the bow ritual | A student decorates and cleans their dojo without help |
| 6 | **Story and Street Smarts sample** | Dialogue and choice system, Sensei and Kohai, one manners quest, one life-lesson quest, one Street Smarts scenario for ages 6–9 | Jay approves the scenario, and a student completes it and can explain what they'd do |
| 7 | **Playtest ready** | Belt colors by palette swap, Guided mode, sound, run and scenario summaries, parent play limit | Ready to hand to 3–5 students at the dojo |

My best guess is that the $100 credit covers milestones 0–4. The Home Dojo and story systems (5–6) are new systems and will likely need additional credit. If the credit runs short, milestones 2, 4, and 6 prove the idea best: combat that feels good, the link to real training, and real-world lessons.

**Milestone 8 — iPhone and Android apps** follows the playtest build: the game is wrapped with Capacitor, test builds go out through TestFlight and Google Play internal testing, and the app is checked against App Store Kids Category and Google Play Families rules. It requires an Apple Developer Program membership and a Google Play Console account. The game is phone-first from milestone 0, so this step packages it rather than reworking it.

### Milestones after the prototype

| # | Milestone | What gets built | Done when |
| --- | --- | --- | --- |
| 9 | **Real DojoForge connection** (with Nic) | The real progress feed, student login, saving game progress on the server, Missions, and the staff "Ready for review" queue | A real Action Zone student logs in, sees their real belt and sign-offs, and a completed mission shows up in Jay's queue |
| 10 | **Every belt tier and Sensei's Lessons** | Tower tiers for every rank using remixed rooms and enemy traits, a Guardian per tier, the gradual unlock schedule, Sensei's Lessons, Welcome Week | A white belt and a brown belt can each play their full rank and learn every system they've unlocked |
| 11 | **Street Smarts and quests** | Illustrated scene scenarios for 2–3 locations (ages 6–9 and 10–13), location perks, a starter set of manners quests and 2 life-lesson stories | Jay has approved every scenario and quest, and students complete them without help |
| 12 | **Launch** | Visiting classmates' dojos, certified trophies, the Hall of Masters, parent controls, final polish, App Store and Google Play release | The game is live for Action Zone families on both stores |

### Six-month roadmap (October 2026 – March 2027)

| Month | Milestones | Also that month |
| --- | --- | --- |
| **1: Oct 6 – Nov 4** (cloud credit) | 0–4 | Agree on the progress feed and approval queue with Nic before milestone 4 |
| **2: November** | 5–7 | Buy the art pack; first playtest with students at the dojo |
| **3: December** | 8 | Lawyer consultation before milestone 8; Apple and Google developer accounts |
| **4: January** | 9 | Nic builds the feed, request endpoint, and approval queue in DojoForge |
| **5: February** | 10–11 | Jay reviews and approves scenarios and quests each week |
| **6: March** | 12 | Store review and launch at Action Zone by early April 2027 |

After the cloud credit runs out on November 4, Claude Code uses the plan's regular usage. Everything not on the launch list (live town square, co-op, Endless Ascent, crafting, Path Perks, Sensei's Scrolls, the Bestiary, real-life quests, the Visitor's Pass) comes in updates after launch. The full launch scope is in the Core Game Design doc, section 13.

### After launch

Updates after launch, in rough order: real-life quests, Sensei's Scrolls, more Street Smarts locations and quest stories, crafting and Path Perks, the Bestiary, the Visitor's Pass, the live town square, the Endless Ascent, and finally co-op with Mentor play.

### How to work with Claude Code (to stretch the credit)

1. **One milestone per session.** Start each session with: *"Read CLAUDE.md and docs/framework. We're working on milestone 2. Plan it first, then build it."*
2. **Ask for a plan before code.** Review the plan in plain language; fixing a plan is far cheaper than fixing code.
3. **Keep requests small and specific.** "Add the Perfect Counter timing window" costs much less than "make combat better."
4. **Save working versions often.** Ask Claude Code to commit to GitHub after each thing that works, so a bad change can always be undone.
5. **Test on your phone after each step,** and describe what feels wrong in plain words ("the counter window feels too short").
6. **Keep a decisions log** in docs/ so future sessions don't re-debate settled questions.
7. **Bring design questions back to this chat** instead of spending credit on them in Claude Code.

## 16. Playtesting and metrics

### Prototype playtest (after milestone 7)

Hand the prototype to **3–5 students of different ages**, including at least one 6–8 year old. Give each a phone, say only "try this," and watch without helping for the first few minutes.

What to watch for:

- **Do they figure out the controls and the Perfect Counter on their own** within a couple of minutes?
- **Where do they get stuck or frustrated?** Write down the exact moment.
- **Do they ask to play again** after the run ends? This is the single most important sign.
- **Do they connect the game to training on their own?** Comments like "I need my kata signed off" mean the core idea works.

Afterward, ask them three questions: what was the best part, what was confusing, and what would make them want to play more. Bring the notes back to this chat to adjust the design before spending more credit.

### Metrics after launch

The game is measured by the same goal as the student app: students who stay longer and train more. Game-specific numbers to track:

| Metric | What it tells us |
| --- | --- |
| **Weekly active players** | How many students play each week |
| **Sessions per week and session length** | Healthy play looks like a few 10–20 minute sessions a week, not hours a day |
| **"Watch the real technique" taps** | Whether the game drives students to the training videos |
| **Training Quests completed** | Whether the game drives real home practice |
| **Scroll accuracy over time** | Whether students are actually learning their curriculum |

### The real test: does the game improve retention?

The key question is whether students who play attend more and stay enrolled longer. But kids who are already engaged may simply play more, which would make the game look better than it is. To get an honest answer, **roll the game out to some classes before others** (for example, Tuesday/Thursday classes for the first month), then compare attendance and retention between the groups. Once more DojoForge schools use the game, the same comparison across schools becomes strong proof for selling it.

## 17. Open decisions for Jay

None of these block milestones 0–3. They should be settled before milestone 4 or the playtest.

- [ ] **The game's name.** "Dojo Ascent" is a working title.
- [ ] **Faith in the story.** Should the world and lore openly reflect Yeshua's Ryu and Christian themes, or stay values-based (discipline, effort, respect) with the faith carried by the dojo itself? This also matters for other DojoForge schools, which may not share it.
- [ ] **Do adult students play?** The design supports it, but the tone and marketing lean toward kids and teens.
- [ ] **Default daily play limit:** suggest one to parents, or leave it fully up to them.
- [ ] **Which art pack.** Claude can help compare a few options against the style guide before buying.
- [ ] **When to bring Nic in.** He needs to agree on the progress feed before milestone 4 so the fake data matches what DojoForge will really send.
- [ ] **Tuning values to test in the playtest:** Dojo Blessing length (48 hours proposed), Training Point conversion, levels per tier, and the Perfect Counter window for each age group.
- [ ] **Street Smarts topics.** Approve the list of situations for each age band before any scenarios are written, and decide which match what's taught in class.
- [ ] **Real-life quests:** offer them at launch, or add them once the rest is working?
- [ ] **Home Dojo mess rate:** how quickly dust builds and how long until it hits the limit (about a week proposed).
- [ ] **Where the game lives:** its own app on the App Store and Google Play, inside the DojoForge student app, or both. A standalone app is easier for families to find and supports the Visitor's Pass; living inside DojoForge keeps one login. The same build supports either.
- [ ] **Virtues for each stripe word:** confirm or change the proposed Virtues (Respect, Great Effort, Self-Discipline) and add any other stripe words.
- [ ] **Rank history before DojoForge:** how far back DojoForge has each student's belt dates and start date, so the legacy grant and anniversaries are accurate.
- [ ] **Featured Dojo of the Week:** who picks it, and how often.
- [ ] **Street Smarts locations and perks:** confirm the locations (Park, School, Bus Stop, Store, Neighborhood, Online for ages 10+) and the perk for each.
- [ ] **Path Perks:** approve the list of permanent perks offered at each promotion.
