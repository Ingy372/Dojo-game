# Dojo Ascent: progression overhaul review

**For:** Jay. **From:** Claude (Fable), acting as lead designer for one review. **Written:** Nov 14, 2026, against `main` at commit `1b07659f`.
**What this is:** a design review and a proposal. No game code, content or other doc was changed.

**How I checked.** I read `CLAUDE.md`, `docs/core-design.md`, the school files (`curriculum.md`, `self-defense.md`, `faith-and-creed.md`), the parts of `docs/framework.md`, `docs/decisions.md` and `docs/progress.md` that deal with progression, the rules code in `packages/sim/src/`, the data in `content/`, the six fake students in `fixtures/`, and the planning files on progression, the beta, premium feel and the shop. I did not read art, QA folders or most tests, and I did not play the game on a phone. Where I say "I found no…", I mean in the live folders (`content/`, `packages/sim/src/`, `apps/client/src/`), not in drafts. Numbers I propose are starting points for playtesting.

---

## 1. The verdict

**Yes, the game is on the right track.** The heart of it is sound and worth protecting: a fight built on reading an attack and countering, a Gate that mirrors the real belt requirements exactly, real training that only ever adds, and a team habit of testing numbers with a bot before shipping. The Oct 30 redesign (moves go in a few slots instead of all stacking) was the right call, and this review builds on it.

The trouble is not that any one system is bad. It is that there are too many of them, several do the same job, and some of the most important ones are still only on paper.

### The 3 biggest problems

1. **The game is hard to explain, and the surface is too wide for a 6-year-old.** A kid today meets five fight buttons plus a stick, five kinds of loadout slot, three gear slots with five rarities, a bag, Insights, and about a dozen dojo screens (Gate, Path card, goals card, Fighting Style, Gear, Bag, Trophy Case, Journal, Scroll, Street Smarts, Last run, and more). Four different things are called a "scroll". Behind that sit systems that exist only in the docs: Training Point spending, Mastery, Honor, crafting, Path Perks, location perks, Missions.
2. **The link from "I learned this in class" to "I got this in the game" has broken in three places.**
   - **Kata**, the biggest requirement on every belt, unlocks nothing in a fight right now (`content/katas/*.json` all say `"stance": null`; the card says its reward comes later).
   - **A new move is not put into the fight automatically.** The rules say a family earned after the first setup "is not auto-equipped" (decisions, PB-02). A kid can earn a move and never use it.
   - **From Green up, most self-defense techniques fall into one family** (joint locks). At Red/Black and Brown, all ten techniques in a row (#31–40, about 15 months) rank up the same Seal, whose main effect is already capped (`holdCapTicks: 24`). That is the "new move gets ignored" problem, and it lands exactly on the two-year dropout mark.
3. **There are dead zones in the long game, and they get worse as belts get longer.**
   - At the level cap, experience is thrown away (`gainXp` sets `xp = 0`). By design that is the last quarter of every belt, and longer for keen players.
   - At Brown/Black a level takes about a month of play and gives +3 Health.
   - Attendance gifts stop after 13 pieces (`decorations.json` has 13 `class` pieces), which is under five months of classes.
   - Brown/Black, a 12-month belt, has one new requirement (the kata Possi) if the #40 cap stands, so its Gate has one lock for a whole year.
   - An existing brown belt starts at level 1 and, by my arithmetic, needs about 350 runs to catch up, not "days" (see 8.2).

### The 3 biggest opportunities

1. **One rule for every move.** "Every technique you show Sensei becomes a card in your Move Book. A new card either gives you a new move or powers up one you have, and it carries the real name." Kata, kick combos and self-defense all follow it. This removes a slot, removes a set of sign-offs staff would have to do, and gives the game its "evolution" moment.
2. **One Path screen.** Replace the Gate tab, the Path card, the three-goals card and the Tower map with a single picture of the climb: where you are, the next real step, the next game step. This is what ABCmouse and every good kids' game does, and Dojo Ascent already has all the data for it.
3. **FAITH DOES is a ready-made collection and story spine that the game is not using.** Nine letters, one per belt, nine verses, eight covenants, a creed. I found none of it in the live game. It can be the most meaningful collection in the game for almost no art.

---

## 2. The new game in one paragraph

Dojo Ascent is a game where your child's character is a martial artist climbing a Tower, and the character can only do what your child has really learned. When Sensei signs off a technique in class, that move appears in the game the same night, with its real name, and the Tower opens a little further. Showing up to class brings a gift every time. Practicing at home makes the character tougher. A character stripe gives a special power named after the word they earned. Each real belt opens a new part of the Tower and lights one letter of FAITH DOES. Between classes, your child plays short runs, collects gear and decorations for their own dojo, and gets better at reading attacks and countering them. Nothing is ever bought, nothing is ever taken away, and nothing in the game counts toward a real belt.

## 3. The two promises

**For a 6-year-old (one sentence):** "Learn a move at the dojo, get that move in the game, and use it to light up the Tower."

**For a 12-year-old:** "There are more moves than slots. Which ones you bring, how you combine them with the power-ups you find in a run, and how clean your counters are is up to you, and the hard mode is waiting when you think you're good."

---

## 4. System audit

**Verdict key:** Keep (as is), Simplify (same job, less of it), Merge (fold into another system), Cut (remove from the design), Delay (after launch).
**Built?** is what I found in the live code and content.

### Fighting and moves

| System | What it does | Real thing it stands for | For whom | Built? | Verdict | Why |
| --- | --- | --- | --- | --- | --- | --- |
| Counter / Great Counter / Block | Read the warning, tap in time | Self-defense timing | Both | Yes | **Keep** | The best thing in the game. Do not touch the feel. |
| Auto-attack, Dash | Basic hits, quick step | Movement | Both | Yes | **Keep** | |
| Focus meter | Fills from hits; pays for Strike and Virtue | Concentration | Both | Yes | **Keep** | One meter is fine. |
| Combo counter (+5/10/15%) | Rewards not getting hit | — | 10+ | Yes | **Keep, hidden depth** | Never teach it to young kids; let them find it. |
| Strike (one per kick combo) | The big button | Kick combos | Both | 3 of 7 | **Keep** | Clear mapping. Sidegrades are right. |
| Seal families (self-defense) | Upgrade the Counter | Self-defense #1–40 | Both | 6 live, Lock empty | **Simplify** | Keep families and slots. Add auto-equip, evolutions at rank 3/6/9, and rename for kids (section 6). |
| Stances (5, own sign-offs) | Pick a fighting posture | Real stances | 10+ | Yes, with placeholder DojoForge ids | **Merge with Kata** | Stances need sign-offs the curriculum doesn't have. Make each kata unlock or rank up a stance. |
| Kata slot and 9 kata powers | A passive power per kata | Kata | 10+ | Slot only; no powers | **Merge into Stance** | Removes a slot and nine powers nobody has written. |
| Stance switching in a fight (STANCE button) | Swap stance mid-fight | — | 12+ | Yes | **Cut from the fight** | Pick a stance before the run. One fewer button. |
| Virtues (3 words, ranks) | Full-Focus special | Character stripes | Both | Yes | **Keep** | Simple and meaningful. |
| 5-slot loadout screen | Choose what to bring | — | 10+ | Data yes, screen partly | **Simplify** | 3 slot kinds, "Sensei's Pick" on by default. |
| Insights (pick 1 of 3) | Run-only power-ups | — | Both | Yes, only 9 | **Keep, grow** | 9 cards with about 7 picks a run means every run ends the same. Needs 24+. Rename "Power-ups". |
| Elites, twists, named monsters | Variety in rooms | — | Both | Yes | **Keep** | Cheap variety. Stop adding kinds before launch. |
| Room grades (S/A/B) | Skill score | — | 12+ | Yes, Challenge only | **Keep** | Already scoped correctly. |
| Difficulty (Guided/Standard/Challenge) | Timing and enemy strength | — | Both | Yes | **Keep, change defaults** | Ages 6–9 should start on Guided (8.5). |

### Growing stronger

| System | What it does | Real thing | For whom | Built? | Verdict | Why |
| --- | --- | --- | --- | --- | --- | --- |
| Sign-off stats (+Power, +Health) | Every sign-off makes you stronger | Sign-offs | Both | Yes | **Keep** | "You got stronger!" is the right message. |
| Levels (10 per belt, cumulative) | Play makes you stronger, up to the belt's cap | — | Both | Yes | **Simplify** | Make it "Belt Level 1–10" per belt, then Stars (5.4). |
| Catch-up double XP | Helps veterans climb | — | — | Yes | **Cut** | Not needed once levels are per belt. |
| Training Points | Home practice adds Health; spending planned | Home practice | Both | Adds Health only; no spending, not shown | **Simplify** | Keep the automatic Health. Show it as Practice Hearts. Never build the spending screen. |
| Ability Mastery | Use a move to strengthen it | — | 12+ | No | **Cut** | A fourth way to make the same move stronger. |
| Gear (3 slots, 5 rarities, bag) | Small stats, looks | — | Both | Yes | **Simplify** | At White an Epic hand wrap gives the same +1 Power as a Common (R-BAL-9b). Make rarity mean a visible look and one perk line; auto-wear the better one for young kids. |
| Bad-luck protection | Rare by run 5 | — | — | Yes | **Keep** | |
| Power Rating (7 hidden sources) | Staff-only strength score | — | Staff | Yes, 2 sources fixed at 0 | **Simplify** | It no longer drives combat. Turn it into a plain staff progress report with 5 rows (5.5). |
| Crafting, materials, recipe scrolls | Make items from drops | — | 12+ | No | **Cut** | The coin shop does the same job with one currency. |
| Path Perks (pick 1 of 3 per belt) | Permanent perk | — | 12+ | No | **Cut** | Seal choice already gives permanent build choices. |
| Coin shop (R-SHOP) | Spend earned coins on looks | — | Both | No | **Keep, smaller, as the only currency** | Good sink for play after the level cap. Ship the 54-item first stage. Drop the "paid store later" idea (8.9). |

### Real-life links

| System | What it does | Real thing | For whom | Built? | Verdict | Why |
| --- | --- | --- | --- | --- | --- | --- |
| The Gate (locks, sundial, Sensei's Seal) | Shows the real requirements | The belt test | Both | Yes | **Keep, move onto the Path screen** | The clearest idea in the design. |
| Path card, three-goals card, Tower map | "What's next" | — | Both | Yes / yes / no | **Merge into one Path screen** | Four answers to one question. |
| Reward moments and promotion ceremony | Celebrate real steps | Promotion, stripe, sign-off | Both | Yes | **Keep** | Ranking of celebrations is right. |
| Legacy grant | Old ranks count as signed off | Past training | Both | Yes | **Keep, fix level** | See 8.2. |
| Welcome Week | Systems arrive one a day | — | Existing students | Yes | **Keep** | Good. Gets shorter as systems are cut. |
| Sensei's Lessons, Lesson Scroll | Teach one thing at a time | — | Both | Yes | **Keep** | |
| Dojo Blessing (48 h, +50% XP, better loot) | Play after class is best | Attendance | Both | Yes | **Simplify** | Count it in runs, not hours, so there is no clock (8.6). |
| Class pieces (decor every 2–3 classes) | Gift for showing up | Attendance | Both | Yes, stops at 13 | **Simplify** | A Class Chest for every class, with no end. |
| Streak aura | Grows with weekly streak | Streaks | Both | Feed only | **Simplify** | Use best-ever streak so it never shrinks (8.6). |
| Missions and the staff review queue | Steps before "Ready to show Sensei" | Sign-offs | Both | No | **Delay** | Adds parent taps and a staff queue, and needs Nic. One "I'm ready to show Sensei" button is enough for launch. |
| Bow and Sensei's bow question | Ritual, recall of real names | Manners, curriculum | Both | Yes | **Keep** | This *is* the manners system. |
| Honor | Points for manners | Manners | — | No | **Cut** | A score for manners turns manners into a currency. The bow and story choices carry it. |
| Life-lesson quests, manners quests | Short stories with choices | Character | Both | 1 sample | **Delay most** | Ship 2 stories at launch as planned; no meter behind them. |
| Street Smarts scenarios | Safety stories | Awareness | Both | 1 scenario | **Keep** | Core to the mission. |
| Street Smarts power (5%) and location perks | Combat bonus for clearing scenarios | — | — | No | **Cut power, delay perks** | Kids should replay safety lessons to learn, not to farm stats. Give badges and light up the town instead. |
| FAITH DOES, verses, covenants, creed | — | Faith curriculum | Both | Drafts only | **Build** | The biggest missing piece of the school (5.3). |

### Home and collecting

| System | What it does | For whom | Built? | Verdict | Why |
| --- | --- | --- | --- | --- | --- |
| Home Dojo decorating | Place earned things | Both | Yes | **Keep** | Ownership. |
| Dust and cleaning | Tidy up after time away | Both | Yes | **Keep, small** | Already capped and kind. Add nothing to it. |
| Calm Mind (clean dojo = faster Focus for 3 runs) | Buff | — | Yes | **Merge into the bow** | A third timed buff next to Blessing and streak. Make it "a tidy dojo makes your bow stronger" and stop teaching it as a system. |
| Decoration set bonuses | Stat bonus for sets | 12+ | No | **Cut the bonus** | Keep sets as a collection goal with a display. No stats from furniture. |
| Monster Journal / Bestiary | Monster pages | Both | Journal yes | **Merge** | They are the same thing. The Journal is the Bestiary. |
| Trophy Case, Virtue banner, Scroll of Insights, relics | Collections | Both | Trophy Case yes | **Merge into one Book** | One book with four tabs: Moves, Monsters, Faith, Trophies. |
| Visiting dojos, Hall of Masters | Show off | Both | No | **Delay visiting; keep Hall simple** | Visiting needs a server and consent. A local Hall of Masters picture is cheap. |
| Endless Ascent, co-op, Mentor play, live town, Sensei's Scrolls quiz, Visitor's Pass, real-life quests | — | — | No | **Delay** | Already agreed. |

**Count:** about 45 systems named in the docs. After this pass a player meets **nine**: Counter fighting, Moves, Virtue, Power-ups, Belt Level, Gear, the Path, the Dojo, the Book. Everything else is either inside one of those or gone.

---

## 5. The proposed progression model

### 5.1 What the player sees: four words

| Word | What it is | Who gives it |
| --- | --- | --- |
| **Belt** | Your real belt. It decides which part of the Tower is open. | Sensei, on test day |
| **Moves** | Everything Sensei has signed off, as cards in your Move Book. | Sensei, in class |
| **Level** | Belt Level 1 to 10, then Stars. | Playing |
| **Dojo** | Your room, your trophies, your Book. | Both |

A 6-year-old needs only these. Everything in 5.2 hangs off one of them.

### 5.2 How each real-world input shows up

| Real thing | In the game (proposed) | Replaces or changes |
| --- | --- | --- |
| **Self-defense sign-off** | A Move card with the real number and name. First of a family: a new Defense. Later ones: that Defense ranks up, and **evolves at ranks 3, 6 and 9** with a new look and a new twist. "You got stronger!" stats. One lock lit on the Gate. A one-room Sensei's Trial built for that move. | Seal families as built; adds evolutions and auto-equip |
| **Kick combo sign-off** | A new Kick (Strike) card. Same moment, same Trial. | As built |
| **Kata sign-off** | A Stance: the first five katas each unlock one stance; later katas rank a stance up (Jay maps which). | Replaces separate stance sign-offs (`PLACEHOLDER-dojoforge-stance-*`) and the empty Kata slot |
| **Promotion** | The ceremony (biggest moment). New belt, new part of the Tower, Belt Level back to 1 with all earlier strength kept, one FAITH DOES letter, the verse scroll for the wall, a new dojo room. | Adds the faith items; changes levels |
| **Character stripe** | A Virtue, or a rank on one. Stripe shows on the belt. Guard goes up. | As built |
| **Attending class** | A **Class Chest** every class (one sure item or decoration). The Blessing for the next 5 runs. The sundial moves. | Class pieces (stop at 13); Blessing hours |
| **Streak** | An aura from your **best** streak. It never shrinks. | Current-streak aura |
| **Home practice (parent tap)** | **Practice Hearts**: every 15 approved minutes adds a little Health, shown as a heart meter that fills. | Training Points number; cancels the spending screen and Mastery |
| **Technique videos** | A small one-time coin gift per video, watched inside the game. | "Video soon" placeholder |
| **Milestones, anniversaries, Student of the Month** | Certified trophies with the date; titles. | As designed |
| **FAITH DOES, verses, covenants, creed** | See 5.3. | New |
| **Manners** | The bow before every climb; Sensei's question; bowing to a restored Guardian. | Cancels Honor |
| **Street Smarts** | A badge per location; the town lights up around that place. No fight bonus. | Street Smarts power and perks |

### 5.3 Faith, creed and life words, woven in

The Manager's earlier call stands and is right: these are never Gate locks and never a quiz.

| Piece | Where it lives | Why it feels natural |
| --- | --- | --- |
| **Life word letter** | A FAITH DOES banner in the dojo with nine empty places. Each promotion lights one. It also sits at the top of the Path screen. | A collection the child can read aloud. By year two it says "FAIT_ ____" and is half done. |
| **The life word as each tier's story** | Each Guardian is not destroyed; it is **restored**, and the tier's life word names how. The White tier's Guardian is forgiven (Forgiveness); Yellow's is welcomed back (Acceptance); and so on to Servanthood. One or two lines from Sensei after the fight. | The game already says the Tower's light returns one piece per belt. This gives each piece a meaning that comes from the school. Text only. |
| **The verse** | A scroll that goes on the dojo wall at promotion, as a certified trophy with the date. Tap to read; tap again to hear it. KJV, exactly as on the school wall. | It is a gift at the biggest moment, not homework. |
| **The covenant** | Sensei says the "I will…" line once at the ceremony, and it is written on the back of the verse scroll. | A promise is said out loud, once, at the right moment. |
| **The creed** | A creed scroll by the dojo door from day one. Tap to hear it (Jay's own voice, if he records it). **"More Than a Conqueror"** appears as the banner when a Guardian is restored and at the promotion ceremony. | Kids already say it in class; hearing Sensei say it at home is warm, not preachy. |
| **Other schools** | All of it is one data pack that a school can leave out. | Keeps rule 7 (no school hardcoded). |

### 5.4 Levels, Stars and coins

| Now | Proposed | Why |
| --- | --- | --- |
| Level 1 to 100, 10 per belt, never resets. Cap reached at 75% of time in rank. | **Belt Level 1 to 10** on every belt. Starts again at 1 with each promotion; all strength from earlier belts is kept as a "belt bonus". | A small number a 6-year-old can hold. A new student and a 20-year veteran both start a belt the same way, so catch-up XP and "expected level" can be deleted. |
| At the cap, XP is thrown away. | After Belt Level 10, XP fills **Stars**. Each Star gives a Star Chest (coins and a sure cosmetic or decoration). Stars give no power. | Play is always rewarded; power still cannot pass the belt. |
| Each tier's XP scales with months in rank, so one level at Brown/Black is about 31 runs. | Every belt uses the same level track. Long belts simply earn more Stars. | No more month-long levels exactly where kids drop out. |
| No coins. Crafting materials planned. | **Coins** are the only currency: from runs, Star Chests, Class Chests and letting go of spare gear. Spent on looks only. | One currency instead of coins, materials, Training Points, Honor and Mastery. |

Starting numbers (to be checked by the balance bot):

| Item | Starting value | Note |
| --- | --- | --- |
| XP for Belt Level 1 → 10 | 5,500 in total | About 50 typical runs (110 XP each): six to seven weeks at 8 runs a week, a bit faster with the Blessing |
| XP per level step | 400 rising to 800 | Early levels quick, last ones slower |
| Health / Power per level | Scaled by belt so 10 levels are worth what 10 levels are worth today at that belt | Keeps the tested enemy bands (`ENEMY_TRAINING_SCALE`) valid |
| XP per Star | 1,100 (about 10 runs) | Flat forever |
| Blessing | Next 5 runs after a class: +50% XP, better loot. Holds at most 10 runs. | Replaces 48 hours |
| Class Chest | 1 per class attended: 1 item of Uncommon or better, or a class decoration, plus coins | No end |
| Practice Heart | 15 approved minutes = 1 point; cap 28 per belt (as today) | Unchanged numbers, now visible |

**Simple fallback** if the level change is too big before launch: keep today's levels, and make the legacy grant set a returning student's level to the cap of the belt below theirs. That is a few lines in `beltEntry.ts`/`progression.ts` and fixes the worst case.

### 5.5 What stays hidden

| Hidden thing | Now | Proposed |
| --- | --- | --- |
| **Power Rating** | Seven weighted sources. Street Smarts and Mastery are fixed at 0, so nobody can pass 93%. Combat does not use it; it uses `TRAINING_STATS`, levels and gear directly. | Keep it hidden and staff-only. Reduce it to five rows that match what really makes a character strong (below). |
| **Real-training share** | The docs say two-thirds (`CLAUDE.md` rule 10, core-design 12). Jay's later decision (R-BAL-12, Decision A) says 40–60%, and the code gives 51–54%. | Write down one number: **about 60% from real training.** |
| Enemy scaling, drop odds, bad-luck counter, balance bands | Hidden | Stay hidden |

Proposed staff report split (starting point):

| Source | Share |
| --- | --- |
| Sign-offs | 40% |
| Character stripes | 10% |
| Home practice | 10% |
| **Real training** | **60%** |
| Belt Level | 25% |
| Gear | 15% |
| **Play** | **40%** |

### 5.6 Surface and depth

Pokémon is the model: a small child picks the monster they like and presses the strong move; an older one learns types and builds a team. Same game.

| Layer | Who | What they deal with | How it opens |
| --- | --- | --- | --- |
| **Surface** | Everyone, from age 6 | Move, Counter, Kick, Dash. Sensei's Pick fills the loadout. Better gear goes on by itself. Guided timing. Pictures and voice, almost no reading. | Always |
| **Choices** | About age 8+, or from Orange | Pick 1 of 3 Power-ups (already there). Choose a Virtue. Decorate. Street Smarts. | Shown by Sensei's Lessons, as today |
| **Builds** | About age 10+, or from Green | Turn off Sensei's Pick and choose Stance, Kick and Defenses by hand. See how Defenses and Power-ups combine. Gear perks. | A lesson at Green, or any time a player opens the loadout and flips the switch |
| **Mastery** | 12+ | Challenge mode, room grades, combo bonus, personal bests, later the Endless Ascent | Challenge from the 4th belt, as built |

Difficulty modes should do more of this work: **Guided also turns on Sensei's Pick and auto-wear**, so "Guided" means "the game handles the menus". Standard asks once whether you want to pick for yourself. Challenge assumes you do.

### 5.7 Between promotions

The Tower may never run ahead of the real belt, but inside a belt it should open in steps the child causes by training.

- **Each tier is split into five chapters.** Chapter 1 opens with the belt. Each later chapter opens when the student earns a **Gate light**. A light comes from any sign-off, or from every fifth of the classes needed for that belt, whichever comes first. So a young student who simply shows up still moves forward, and a student who gets a technique signed off moves forward that night.
- **The Guardian opens when Sensei's Seal is lit** (approved to test) or every lock is lit. It becomes the "practice test" the framework describes.
- **Between lights:** Class Chests, Stars, Sensei's Trials, the weekly remix, Street Smarts, the dojo.
- **This keeps the 75% idea but changes what it measures.** Instead of "reach the level cap at 75% of the rank", the rule becomes "the last chapter opens at about 75% of the rank for a typical student, and there is always something to earn after it".

### 5.8 First day to year five

| When | Real life | What the child sees and feels (proposed) | Dead zone today |
| --- | --- | --- | --- |
| **Day 1** | New white belt | Name and belt appear. Tutorial: first Great Counter in two minutes. First chest. Dojo with a creed scroll and an empty FAITH DOES banner. The Path shows "Show Sensei Self-Defense #1". | White-belt kid bot wins 20% on Standard (R-PREMIUM audit) and everyone starts on Standard. |
| **Week 1** | Two classes | Two Class Chests. Blessing for the next runs. Belt Level 3 or 4. First sign-off: first Move card, a Trial room, chapter 2 opens. | New move is not auto-equipped. |
| **First 90 days** | White → Yellow | Seven Move cards, maybe a stripe and first Virtue, Belt Level 10 and a few Stars, Guardian restored (Forgiveness). Test day: ceremony, letter F, John 3:16 scroll. | Kata gives nothing. |
| **Year 1** | Yellow, Orange, Green | A new tier every three months. Throw arrives at Orange, Challenge mode and builds at Green. Defenses start to evolve. Banner reads FAI. | Insight pool of 9 is worn out. |
| **Year 2** | Blue, then Red (belts now take 6 months) | See 5.9. | Levels crawl; attendance gifts ended long ago; every new technique is another lock. |
| **Year 5** | Brown/Black to Black | Banner reads FAITH DOE_. Every stance, seven Kicks, evolved Defenses. Their statue stands in the Hall of Masters on black belt day. | One Gate lock for twelve months. |

### 5.9 The year-two plan

The dropout point is not random. From the school's own numbers (`decisions.md`, Milestone 4): belts take 3 months through Blue, then **6 months** at Red and Red/Black, 9 at Brown, 12 at Brown/Black. A student hits Red at about month 15. So "around two years" is exactly when promotions drop from four a year to two and the techniques turn into ten joint locks in a row. The game has to carry more weight there, not less.

| What | How | Cost |
| --- | --- | --- |
| **Something new opens every 3–4 weeks even on a 6-month belt** | Five chapters and seven sign-offs per belt (5.7). On a 6-month belt that is a Gate light about every five weeks from classes alone, sooner with sign-offs. | Medium |
| **Lock techniques feel different from each other** | Split joint control into two families Jay names (for example arm locks and wrist locks), and use evolutions at ranks 3, 6, 9 so #31–40 produce at least three visible "it changed!" moments instead of ten small ones. | Medium; needs Jay's mapping |
| **Red is where the game "opens up"** | The fourth Defense slot (already planned at Red), Challenge-only looks, and the first "Senpai" title. Make Red feel like a second beginning. | Small |
| **Old moves matter again** | Real requirements are cumulative (a brown belt must know #1–40). Add **Review Trials** on the long belts: Trial rooms that hand you an old move. They also give Brown/Black a reason to open the game during its one-lock year. | Small once Trials exist |
| **The banner is half full** | FAITH DOES at five of nine letters. Nearly-finished goals pull hard. | Small |
| **A weekly remix floor** | One floor a week with a twist rule from the existing `content/twists`. No streak, no "missed it". | Small |
| **The anniversary** | A certified two-year trophy and aura from the real start date. | Small |
| **After launch: being looked up to** | Mentor play, visiting, the Hall of Masters walk. Belonging is what keeps teenagers; build it second, after launch. | Large |

---

## 6. Combat and abilities overhaul

### 6.1 What a fight asks of a child today

Stick plus five buttons (`apps/client/src/input/ActionButtons.ts`): COUNTER, STRIKE, DASH, STANCE, VIRTUE. Two meters (Health, Focus), a combo counter, and on Challenge a grade. `CLAUDE.md` itself says "four ability buttons".

| Change | Replaces | Why |
| --- | --- | --- |
| **Remove STANCE from the fight.** Stance is chosen before the run. | Mid-fight stance switching (`stanceSwitchTicks`) | Four buttons. Almost no 6-year-old will switch stance mid-fight, and for older players the choice still matters before the run. |
| **VIRTUE only appears when Focus is full**, glowing. | Always-visible button | Three buttons most of the time. |
| **Ages 6–9 start on Guided.** | "Everyone starts on Standard" (M7-P1 update) | The feed carries an age band for exactly this. Standard is one tap away. |
| **Set a win-rate target for young beginners.** | No target for Guided | Suggest: a White-belt beginner on Guided clears the floor about 7 times in 10. Today the kid bot manages 5 in 10 on Guided and 2 in 10 on Standard. |

### 6.2 One rule for every move

> **Every technique you show Sensei becomes a card. A new card either gives you a new move or powers up one you have.**

| Real technique | Card type | New or power-up? |
| --- | --- | --- |
| Kick combo | **Kick** | Always new (7 by Brown) |
| Self-defense | **Defense** | New if it starts a family; otherwise a rank on that family |
| Kata | **Stance** | New for the first five; a rank after that |
| Character stripe | **Virtue** | New word: new Virtue. Same word: rank |

Kid-facing names: Kick, Defense, Stance, Virtue, Power-up. "Technique Seal", "family" and "Insight" stay in the code and the staff view. Callouts keep the real number ("Self-Defense #17!").

### 6.3 Making a new move exciting but not overpowered

The Oct 30 redesign already has the right four pieces (unlock screen, Sensei's Trial, floors that favor the newest move, real names on ranks). Three additions make them land:

| Addition | What it is | Why |
| --- | --- | --- |
| **New moves go in automatically** | Sensei's Pick equips the newest Kick and the newest Defense family unless the player has turned picking on. If slots are full it swaps out the oldest and says so in one line. | Fixes "earned but never used" (PB-02 interim note). |
| **Evolutions** | At ranks 3, 6 and 9 a Defense changes its look and gains one twist (the redesign already says "every third rank adds a small twist"). Give it a name and a 5-second moment: "Your Counter Defense became **Swift Counter**!" | This is Pokémon's evolution beat, tied to real sign-offs. It also solves the Lock pile-up. |
| **Every sign-off gives something you can feel that night** | Stats (built), a Gate light (new chapter, 5.7), a Trial with a small chest. | Even a rank that adds 2% is worth showing Sensei. |

Balance stays with the bot and the four tests in the redesign. Nothing here adds power outside those bands: evolutions are the "every third rank" twists already budgeted, and Trial chests are one-time.

### 6.4 Keeping 40 techniques from becoming a menu chore

| Risk | Fix |
| --- | --- |
| Too many things to equip | Three slot kinds, not five: **Stance (1), Kick (1), Defenses (2 to 4)**. Virtue is picked on the same screen but only matters once you have two. |
| Scrolling a long list | The loadout shows at most 7 Kicks, 5 Stances, and 7 to 8 Defense families. Forty techniques never appear as forty choices; they appear as ranks inside the families. |
| Young kids stuck in menus | Sensei's Pick is on by default and is the whole experience on Guided. |
| Older kids want control | One switch turns it off. That is the "there's more to discover" door. |
| Family sizes are lopsided | Counter already holds 5 of the first 15 techniques; Lock would hold about 16 of #16–40. Ask Jay to split Lock (6.5) and let the bot set rank sizes so no family runs past its cap. |

### 6.5 Things only Jay can supply

- Which stance each of the first five katas teaches, and which stance later katas strengthen.
- A split of the joint-control techniques (#17, #21, #22, #26, #28, #31–40) into two or three families by what the body does.
- Descriptions for #36–40, and a ruling on #41–45 (8.1).

---

## 7. Premium feel

### 7.1 What the reference games do, and where Dojo Ascent stands

I describe these games from general knowledge of them; I did not research them again for this review.

| Game | What makes it work | Dojo Ascent today |
| --- | --- | --- |
| **Archero 2** | Pick 1 of 3 skills every room, from a big pool, so runs differ | **Weak.** The mechanic is there; the pool is 9. |
| | Chapters with a clear "next chapter" | **Weak.** Only tiers 1–3 are built, and there are no chapter steps inside a belt. |
| | A visible next upgrade at all times | **Weak.** Three screens share the job. |
| | Punchy hits, rarity reveals | **Good and improving.** Hit-stop is tuned; particles and recorded sound are on the R-PREMIUM list. Rarity reveal is undercut because rarities barely differ in stats at low belts. |
| **Pokémon** | Collect them all | **Split.** Journal, Trophy Case, decorations and the planned Bestiary are four half-collections. |
| | Evolution | **Nothing yet.** Seal ranks exist but have no moment. |
| | Badges as milestones | **Strong in concept** (belts, Gate, Guardian). FAITH DOES letters would make it visible. |
| | Simple start, deep later | **Weak.** Depth is on the surface (five slots, five buttons). |
| **ABCmouse** | A path you watch yourself move along | **Nothing as one screen.** The Gate and Path card are separate. |
| | Tickets for learning, spent in a shop | **Nothing yet.** The coin shop plan fits. |
| | A room filled with earned things | **Good.** The Home Dojo. |
| | No reading needed | **Partly.** Street Smarts has voice. The loadout, gear and cards rely on text. |
| **Brawl Stars / Clash Royale** (reward pacing) | A track of rewards where the next prize is always visible | **Nothing.** Stars would be this, without anything paid. |

### 7.2 Upgrades, ranked by felt impact for the effort

| # | Upgrade | What it replaces or adds | Effort |
| --- | --- | --- | --- |
| 1 | **New moves auto-equip, with a 5-second "new move" moment** | PB-02 interim gap | Small |
| 2 | **The Path screen**: one scrolling picture of the Tower with your character on it, Gate locks beside the current tier, the next real step as a big card, FAITH DOES across the top | Gate tab, Path card, goals card, planned Tower map | Medium |
| 3 | **Power-up pool to 24+**, each with an icon that reads without text, a few that only appear when a matching Defense is equipped | `content/insights/insights.json` (9) | Small to medium, data and bot runs |
| 4 | **Stars after Belt Level 10** with a chest each | XP thrown away at the cap | Small |
| 5 | **Class Chest every class** with its own opening sound and Sensei's wave | 13 class pieces | Small |
| 6 | **Evolution moments** at Defense ranks 3/6/9 | Silent rank-ups | Medium (needs medallion art per stage) |
| 7 | **Guardian restored** beat with the life word and "More Than a Conqueror" | Plain boss win | Small (text, one banner) |
| 8 | **The Book** with four tabs and silhouettes for what you have not found | Trophy Case, Journal, Scroll of Insights, planned Bestiary and Creed Wall | Medium (mostly moving screens) |
| 9 | **Rarity you can see**: each rarity changes the look of the item on the character and adds one perk line; fewer, clearer drops | Gear whose rarities share the same stat at White | Medium |
| 10 | **Voice on every card** for ages 6–9, using the phone's free text-to-speech as Street Smarts does | Text-only cards | Small |
| 11 | Particles and recorded sound | R-PREMIUM-a and -b, already planned | Planned |
| 12 | **Weekly remix floor** | Shifted Floor (designed, not built) | Small |
| 13 | **Coin shop, first stage only** | Crafting | Medium; art is the risk |

All of these stay inside the hard rules: nothing bought, no loot boxes, no timers, no streak that can be lost, no "your friend passed you".

---

## 8. Holes and fixes

### 8.1 Docs, decisions and code that disagree

| # | Disagreement | Fix |
| --- | --- | --- |
| 1 | **Real-training share.** `CLAUDE.md` rule 10 and core-design 12 say 67%. R-BAL-12 Decision A (Jay) says 40–60%; the code gives 51–54%. The redesign doc repeats "two-thirds". | Pick one (I suggest about 60%) and correct all three places. |
| 2 | **Power Rating can never be full.** `power.ts` fixes Street Smarts and Mastery at 0 ("not built yet"), so 7% is unreachable, while Guardians are described as 90% of the tier max. | Drop those two rows (5.5). |
| 3 | **Self-defense count.** `curriculum.md` lists #41–45 for Brown/Black → Black. `self-defense.md` says students cap at #40. | Jay rules. If the cap is 40, Brown/Black needs Review Trials (5.9) because it has one lock. |
| 4 | **Launch date.** `CLAUDE.md` says launch by early April 2027. `BETA-DEC15-plan.md` says "the full store launch date is now open". | Jay rules; see the build plan. |
| 5 | **Bestiary.** `CLAUDE.md` says do not build it before launch. Jay's Oct 18 decision says it is launch scope. A Monster Journal is already built. | Call the Journal the Bestiary and close the question. |
| 6 | **When Insights unlock.** Core-design 13 says the 2nd belt. Core-design 7 shows the first Insight four minutes into the first session, and I found no belt check in `run.ts`. | Keep them from day one (they are fun) and fix section 13. |
| 7 | **Catch-up items.** The legacy grant says every requirement of a passed rank counts as signed off. Fixture 3 (yellow) still carries White's Self-Defense #4 as an unsigned catch-up item, and the Gate text says catch-up shows as "unfinished Seals". | For a child promoted on effort, the move should unlock with the belt. Show catch-up only on the Path as "polish this with Sensei". |
| 8 | **Kata.** Core-design, framework and `curriculum.md` say kata unlocks a Form. The live game says kata unlocks nothing and stances have their own sign-offs. | Section 6.2. |
| 9 | **Four "scrolls".** Sensei's Scroll (lessons, built), Sensei's Scrolls (quiz, later), Scroll of Insights, Scroll of the Climb (last run). | Lessons live in the Book; rename the last-run screen "Last climb"; drop the others. |
| 10 | **Insight families** are still named Rooted and Flowing after Forms that were renamed away on Oct 25. | Rename when the pool grows. |
| 11 | **"No timers, streaks or decay"** (R-BAL-12 Decision C) sits beside a Blessing that shows hours left and a streak aura. | 8.6. |
| 12 | **Training Point ceiling.** Stats count 28 per belt; the Power Rating counts 4 per requirement, which is 24 on belts with no kick combo. | One number. |

### 8.2 Exploits and grind paths

| # | Hole | Fix |
| --- | --- | --- |
| 1 | **A child can enter their own belt.** The grown-up gate is a sum question; behind it anyone can set the belt to Black, and by design the entry "only goes up", so it cannot be undone (B-BELT). | Acceptable for a 5–10 family beta if parents are told. Add a parent-set PIN and a "fix a mistake" path behind it. Remove belt entry when the DojoForge feed arrives. |
| 2 | **Veterans start far too weak.** Every profile starts at level 1 (pinned by `start-level-pin` tests). A brown belt needs levels 1–70 before normal XP. Tiers 1–7 total about 77,500 XP (27 months × 4.35 × 0.75 × 8 × 110); at double XP that is about 350 runs, close to a year at 8 runs a week, against enemies scaled about 13× for Brown. | Belt Levels (5.4), or the fallback: start returning students at the level cap of the belt below. |
| 3 | **Level cap wastes play.** | Stars (5.4). |
| 4 | **Selling gear for coins** could be farmed. | R-SHOP already keeps selling under 35% of income with a flat per-run base; keep that. |
| 5 | **Home practice is whatever a parent taps.** | Already capped at 28 points per belt and worth Health only. Leave it. |
| 6 | **Street Smarts for stats** would reward guessing through scenarios. | Remove the power link (section 4). |
| 7 | **Out-powering the rank.** Gear caps, level caps and sign-off stats are all per belt and tested. | None found. Keep the bands test. |

### 8.3 Work that lands on parents or staff

| # | Hole | Fix |
| --- | --- | --- |
| 1 | **Stance sign-offs** are five new things for instructors to sign and for Nic to add to the feed. | Fold stances into kata sign-offs, which already exist. |
| 2 | **Missions** ask a parent to approve practice sessions before each of seven sign-offs per belt, and add a review queue for staff. | Delay. Launch with one "I'm ready to show Sensei" button that only tells the child to raise their hand in class. |
| 3 | **Stripe reports in the game** duplicate what the school already does on paper or in DojoForge. | Leave the report where it is; the game only celebrates the result. |
| 4 | **Featured Dojo of the Week** needs a weekly staff pick. | Delay with visiting. |

### 8.4 App Store Kids and Google Play Families

This is not legal advice; the lawyer review already planned should cover it.

| # | Risk | Fix |
| --- | --- | --- |
| 1 | **"Room for a parent-gated paid store later"** (R-SHOP) conflicts with the hard rule against anything bought, and paid items in a kids' app draw the strictest review. | Strike the sentence. Coins are earned only, permanently. |
| 2 | **"Watch the real technique" opens the DojoForge student app.** Kids-category apps need a parent gate before any link that leaves the app, so a 6-year-old cannot watch alone. | Play the video inside the game. |
| 3 | **Children's first names and dojos visible to other children** (visiting, echoes, Hall of Masters) need verifiable parental consent. | Keep these off until the consent flow through the parent's DojoForge account exists. A Hall of Masters that only shows black belts whose families agreed is fine at launch. |
| 4 | **Faith content** is allowed, but the store listing must describe it honestly. | Say it plainly in the listing and keep it as a pack other schools can leave out. |
| 5 | **The public GitHub repo** and licensed sound files (already flagged in R-PREMIUM). | Use CC0 packs only, as recommended there. |

### 8.5 Fairness for the youngest

| # | Hole | Fix |
| --- | --- | --- |
| 1 | White-belt kid bot: 20% wins on Standard, 50% on Guided; everyone starts on Standard. | Ages 6–9 start on Guided; set a Guided target (6.1). |
| 2 | Orange is an outlier (kid bot wins 20 of 20 even on Challenge). | R-PREMIUM-e already asks for a report; make it a beta blocker. |
| 3 | Loadout, gear and cards need reading. | Sensei's Pick, auto-wear, voice on cards. |

### 8.6 Quiet pressure that bends the no-punishment rule

| # | Hole | Fix |
| --- | --- | --- |
| 1 | **Blessing counts down in hours.** A child who has class at 6 pm and a bedtime sees "hours left" tick away. | Count it in runs, as Calm Mind already does. |
| 2 | **A streak aura that shrinks** when a week is missed takes something away for absence. | Aura from best-ever streak. |
| 3 | **Class pieces stop** after 13. Not a punishment, but the reward for showing up silently ends. | Class Chest every class. |

### 8.7 Too big for April 2027 with this team

Today the Tower has tiers 1–3, the beta freezes Dec 4, and there is no server, no DojoForge link, one Street Smarts scenario and no faith content in the game.

| Planned for launch | My view |
| --- | --- |
| Tower for all ten tiers with new monsters, rooms and Guardians each | Too much new art. Ship tiers 4–10 as **remixes**: existing rooms and enemies with scaling, elites and twists, plus one new Guardian and one new enemy idea per tier. Add bespoke content tier by tier after launch, starting where most current students are. |
| Real DojoForge connection, server saves, Missions, staff queue | Connection and saves: must have. Missions and queue: delay. |
| Street Smarts, 2–3 locations for two age bands | One location per age band at launch, more after. Each script needs Jay's approval, so Jay's time is the limit. |
| 148-item coin shop with 90 new pictures | First stage only (54 items, almost no new pictures). |
| Visiting, Hall of Masters, Featured Dojo | Local Hall of Masters only. |
| Kata powers (9), stance sign-offs, Lock and Break Free mechanics, Path Perks, crafting | Replaced or cut by this proposal. |
| Lock family for 16 techniques | One new mechanic (hold) is fine; split the family by data. |

---

## 9. What not to change

- **The Counter.** Warning circle, Great Counter window, Block as a safe miss, the guided first Counter that slows time for a new player, the 0.88 tempo from Jay's phone test. This is the game.
- **Every attack is telegraphed; only two enemies attack at once.**
- **The Gate mirrors the real requirements exactly and never guesses why a student was not approved.**
- **Real training only adds.** Sign-off stats as built (`TRAINING_STATS`), "You got stronger!", nothing taken for absence.
- **The celebration ranking,** with the promotion ceremony on top and a game level-up as one line.
- **The Oct 30 redesign's seven rules,** especially "equip, don't stack" and "sidegrades, not upgrades".
- **Real numbers and names on every move** ("Self-Defense #17"), and effects that match what the technique does.
- **The balance bot and its bands.** Numbers are set by test, not by feel. This is rare and valuable.
- **The bow and Sensei's question.** A ritual with a tiny reward teaches manners better than a meter.
- **Sensei's Lessons and "one new thing per day".**
- **Kind wording everywhere:** no "you missed", no counts of what is left, no guilt.
- **Content as data, rules in one deterministic package.** It is why changes like these are affordable.
- **Rarity shares and bad-luck protection.**
- **Power Rating hidden from players.**

---

## 10. Build plan

Effort: Small is a day or two of bot work, Medium about a week, Large several weeks. The beta freezes Dec 4, three weeks from this review, so the first list is deliberately short and avoids anything that needs new art.

### Before the beta (freeze Dec 4, 2026)

| # | Item | Effort | Touches | Risk if skipped |
| --- | --- | --- | --- | --- |
| B1 | Auto-equip new Kicks and Defenses (Sensei's Pick, default on) | Small | `loadout.ts`, `progression.ts` (`normalizeLoadout`), `student.ts` seed, PB-05 screen | Testers earn moves and never use them; the main idea of the game is not tested |
| B2 | Returning students start at the level cap of the belt below (fallback from 5.4) | Small | `beltEntry.ts`, `progression.ts`, `start-level-pin` tests | Any tester above White is badly underpowered |
| B3 | Ages 6–9 start on Guided; set a Guided win target for White | Small | `content/settings/difficulty.json`, balance test | Youngest testers lose their first runs |
| B4 | Kata: beta cards say which stance it gives (Jay maps three katas), instead of "Power coming soon" | Small | `content/katas/*.json`, `abilities.json` stances, `training.ts` | The biggest requirement still gives nothing; also unblocks the late kata-power list |
| B5 | Blessing counted in runs | Small | `config.ts` (`BLESSING`), `training.ts`, dojo text | Bedtime pressure in the first family test |
| B6 | Grow Power-ups from 9 to about 15 using existing effect types | Small | `content/insights/insights.json`, R-INSIGHT-BAL tests | Runs feel the same by day three |
| B7 | Parent note: who may enter the belt; add a way to correct a wrong entry | Small | `beltEntry.ts`, belt-entry screen | A child sets Black belt and it cannot be undone |
| B8 | Finish R-PREMIUM-e (why Orange wins everything) | Small | Balance report | A beta belt is trivially easy |

### Before launch (April 2027)

| # | Item | Effort | Touches | Risk if skipped |
| --- | --- | --- | --- | --- |
| L1 | The Path screen (merges Gate tab, Path card, goals card, Tower map) | Medium | `path.ts`, `goals.ts`, `HomeScene.ts`, new scene | The game stays hard to explain |
| L2 | Belt Levels and Stars; delete catch-up XP | Medium | `progression.ts`, `config.ts` (`PROGRESSION`), `training.ts`, fixtures, tests | Dead zones at the cap and month-long levels on long belts |
| L3 | Five chapters per tier opened by Gate lights | Medium | `run.ts`, `room.ts`, `training.ts` (gate), room data | Nothing new opens between promotions |
| L4 | Class Chest every class; best-streak aura | Small | `earning.ts`, `decorations.json`, `loot.ts` | Attendance reward ends in month five |
| L5 | FAITH DOES banner, verse scrolls, creed scroll, Guardian-restored lines | Small to medium | New `content/faith/` pack, `rewards.ts`, ceremony, dojo; Jay approves every line | The faith side of the school is absent from its own game |
| L6 | Kata → Stance for all nine katas; remove stance sign-offs and the Kata slot | Medium | `abilities.json`, `katas.ts`, `training.ts`, `loadout.ts`, `profile.ts` migration, feed shape for Nic | Staff sign-off work; nine unwritten kata powers |
| L7 | Remove STANCE from the fight; Virtue button only when full | Small | `ActionButtons.ts`, `world.ts`, lessons | Five buttons for 6-year-olds |
| L8 | Evolutions at Defense ranks 3/6/9; split Lock; one hold mechanic | Medium | `seal-families.json`, `sealFamilies.ts`, `world.ts`, medallion art | Year-two techniques feel like nothing |
| L9 | Sensei's Trial for every sign-off; Review Trials for long belts | Medium | PB-13 work, room template | New moves are not felt; Brown/Black is empty |
| L10 | The Book (Moves, Monsters, Faith, Trophies) | Medium | Trophy Case, Journal, Lesson Scroll screens | Four half-collections |
| L11 | Tiers 4–10 as remixes with one Guardian each | Large | `content/rooms`, `content/enemies`, `ENEMY_TRAINING_SCALE` | Students above Orange have nothing to play |
| L12 | DojoForge feed, login and server saves (with Nic) | Large | `feed.ts`, `apps/server`, client sync | No launch without it |
| L13 | Coin shop, first stage; coins from runs, Stars, chests | Medium | New `shop` rules and data, `loot.ts` | No sink for long-term play |
| L14 | Power-ups to 24+; rename families | Small | `insights.json`, `insight.ts` | Variety |
| L15 | Gear: rarity shows on the character, one perk line, auto-wear on Guided | Medium | `loot.ts`, `gear.json`, gear screens | Rare drops feel like common ones |
| L16 | Staff Power report reduced to five rows; docs corrected to one training share | Small | `power.ts`, `config.ts` (`POWER`), `CLAUDE.md`, core-design 12 | Staff see a number that cannot fill |
| L17 | Street Smarts: one location per age band, badges, town lights | Medium | `streetSmarts.ts`, scripts (Jay approves each) | A pillar of the game ships as a sample |
| L18 | In-game technique videos | Small to medium | Path screen, feed video ids | Parent gate blocks young kids |
| L19 | Voice on cards for ages 6–9 | Small | Client text-to-speech helper | Non-readers need a parent beside them |
| L20 | Doc clean-up: every contradiction in 8.1 | Small | `CLAUDE.md`, `core-design.md`, `framework.md`, `curriculum.md` | Bots keep building from stale text |

### After launch

| Item | Effort | Note |
| --- | --- | --- |
| Bespoke rooms, monsters and art for tiers 4–10, one tier at a time | Large | Start with the belts most students wear |
| Missions and the staff review queue | Medium | Only if staff ask for it |
| Visiting dojos, echoes, Featured Dojo | Large | Needs the consent flow |
| More Street Smarts locations and life-lesson stories | Medium each | Jay's approval time is the limit |
| Location perks, if still wanted | Small | Re-ask after seeing how kids use Street Smarts |
| Weekly remix floor, if not done as L-stretch | Small | |
| Endless Ascent, live town, co-op and Mentor play | Large | The teenage-retention layer |
| Black belt Kicks #8–12 and degree tiers | Medium | Waits on Jay's content |

**If the team can only do five things before launch beyond the must-haves (L11, L12):** L1 the Path, L2 Belt Levels and Stars, L5 faith, L6 kata to stance, L8 evolutions.

---

## 11. Questions for Jay

Each is a simple choice. My pick is first.

| # | Question | Choices | My recommendation and why |
| --- | --- | --- | --- |
| 1 | **What should a kata give in the game?** | (a) A stance: each kata unlocks or strengthens one. (b) Keep stances as their own sign-offs and write nine separate kata powers. | **(a).** One rule for every move, no new sign-offs for staff, nothing left "coming soon". You would tell us which stance goes with which kata. You earlier said kata powers must ship in the beta; under (a) the stance is the kata's power. |
| 2 | **Should the level number start over at each belt?** | (a) "Yellow Belt, Level 1 to 10", then Stars; strength is kept. (b) One number that climbs to 100. | **(a).** Small numbers for small kids, no catch-up needed for veterans, no dead time at the cap. |
| 3 | **Can joint-lock techniques be split into two or three groups?** | (a) Yes, you name them (for example arm locks, wrist locks, takedowns from a lock). (b) Keep one Lock group. | **(a).** Otherwise ten sign-offs in a row at Red/Black and Brown all do the same small thing. |
| 4 | **Is the launch still early April 2027?** | (a) April, with tiers 4–10 as remixes and the cuts in section 10. (b) Move the date and build more. | **(a).** A smaller game that is clear beats a bigger one that is late. The beta plan currently says the date is open. |
| 5 | **Self-defense at Brown/Black: #41–45 or stop at #40?** | (a) Stop at #40 and use Review Trials for that year. (b) Add #41–45. | Your call; it is your curriculum. The two school files disagree. |
| 6 | **Should Street Smarts make the character stronger in fights?** | (a) No: badges and a brighter town. (b) Yes: a small fight bonus. | **(a).** Children should replay safety lessons to learn them, not to collect power. |
| 7 | **How much of the faith content should the game show at launch?** | (a) All four pieces in 5.3 (letters, verse scrolls, creed scroll, Guardian-restored lines). (b) Letters and creed only. (c) Wait. | **(a).** It is mostly words you already have, and you approve each line. Would you record the creed and verses in your own voice? |
| 8 | **Coins and a shop for looks only: in, and never paid?** | (a) Yes, small first stage, earned coins only, forever. (b) No shop at launch. | **(a).** It replaces crafting. This would also settle the "paid store later" note, which breaks your own hard rule. |
| 9 | **Should the youngest students (6–9) start on the easy setting?** | (a) Yes, Guided by default with Standard one tap away. (b) Everyone on Standard. | **(a).** The test bot that plays like a young beginner wins 2 in 10 on Standard at White belt. |
| 10 | **Is about 60% the right share of strength from real training?** | (a) About 60%. (b) Two-thirds as the old docs say. (c) Half as the code does now. | **(a).** It matches your later decision (40–60%) and keeps "train to get strong" true. The docs just need one number. |

### One rule I would ask you to look at (not built into this proposal)

**"Every decoration is earned in the Tower or through real achievements."** A coin shop that sells decorations bends this wording even though coins are earned in the Tower. R-SHOP already notes the line would need to change. I have assumed you are comfortable with "earned, never bought" as the real meaning, because you approved the shop on Nov 1. If not, the shop should sell character looks only.
