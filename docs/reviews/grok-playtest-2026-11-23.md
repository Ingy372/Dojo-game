# Dojo Ascent: Playtest Findings and Fix List (hand-off for Claude)

**Prepared for:** Jay Lindemuth, Action Zone CMA, to hand to Claude (the developer working in `github.com/Ingy372/Dojo-game`)

**Build tested:** live link https://dojo-ascent.jay-lindemuth.workers.dev/ on Monday, November 23, 2026 (all times Eastern Time, ET)

**Sources:** three AI persona playthroughs (Mia 6, Jordan 12, Sarah parent), one full "find the holes" playthrough (including higher-belt test profiles and difficulty modes), a sourced competitor brief on ABCmouse and Archero, and the game's own design document (`core-design.md`) and build log (`progress.md`). Nothing here is from real children yet. Anything that wasn't tested is labeled as untested.

**How to read each item:** *Where* it happens, *What* goes wrong, *Repro* (steps to make it happen again), *Why it matters*, *Fix* (a suggestion) and a size tag: **Quick fix** (hours), **Medium** (a day or a few days), **Big** (a larger feature or content job).

---

## 1. Summary

1. The core is promising. Boss wins, sparkly rare drops ("SPECIAL! Tap to keep it!"), the gold **Bow** button, the night town and the Red Panda pet all landed. A parent found it safe: nothing for sale, no ads, chat is 15 set phrases only.
2. **The biggest trust risk:** a **"Testing"** button on the player-facing Training Board opens the developer profile switcher. Any kid can give themselves levels, a higher belt and thousands of coins.
3. **The biggest fun risks:** players get lost in town with no way home. Losing a run shows "You learned this room!" and pays nothing at white belt. The character auto-strikes and auto-blocks, so skill barely matters. And at the level cap there is nothing left to chase in the game.
4. **Economy:** a new player has 239 coins after the tutorial. The only thing they can afford is a 300-coin lantern (after the first Home Dojo chest). Outfits and pets cost 1,500 to 2,000, and Tower runs showed no coin payout.
5. **Age fit:** the opening and Street Smarts suit ages 6 to 8 but are "for babies" at 12. Mia (6) drowns in text; Jordan (12) finds the Tower too easy, with no way to raise the difficulty himself.
6. **Do these 5 first:**
    - (a) Remove the Testing button from the live build. *Quick fix.*
    - (b) Add a Home button, a minimap and signs in town. *Medium.*
    - (c) Redo the defeat screen so it clearly says you lost and always pays something. *Quick fix.*
    - (d) Make Strike and Counter need real, readable input. *Medium.*
    - (e) Fix the dead taps: the door arrow, the TOWN mat, "Got it" moving the character, the jumping Next button. *Quick fix.*

---

## 2. Critical holes (ranked, worst first)

### C1. Kids can reach the developer "Testing" screen and give themselves belts, levels and coins

- **Where:** Home Dojo → Training Board → **"Testing"** button, which sits beside "Practice room."
- **What:** It opens a screen titled "Testing screen – Hidden from players. Fake students until DojoForge is connected." It has 6 profiles (White 0/7, White 3/7 with 1 stripe, Yellow 7/7 with 1 stripe, Green 3/7 with 1 stripe, a duplicate White 0/7, Orange 3/7), plus **"+1 level"**, "Back to level 1", "Forget what I've seen (replay welcome)", "Old save (show slot note again)" and the **Power Rating** breakdown ("Power Rating: 121 / 1000", Sign-offs 0/400, Training Points 0/100, Virtues 0/100, Level 25/250, Gear 96/150). Switching profiles back and forth paid **"Hard work pays off! … earned 4,150 coins"** (Orange) and **"2,350 coins"** (Green), plus **"2 Class Chests! +300 coins."** That's a coin farm.
- **Repro:** Open the Training Board, tap Testing, tap the Orange profile, then White, then Orange again. Watch the coin pop-ups.
- **Why it matters:** It breaks Jay's core promise that the game mirrors real rank and that a grown-up sets the belt. It also breaks the economy and shows the Power Rating, which the design says players should never see (*core-design §13 "Power Rating is hidden from players"*). A Jordan-age kid would find it in minutes and tell friends.
- **Note for Claude:** `progress.md` says the testing screen was meant to be hidden behind 5 taps on "Home Dojo," and that `npm run build:beta` turns off the hidden testing screens and URL test flags. The 2026-11-14 QA entry says "Testing now sits beside Practice room." So the live link appears to be the normal (non-beta) build, with the button visible.
- **Fix:** Deploy the live link with the testing screens off (a beta-style build), or keep the button only behind a developer flag that never ships. Add a test that fails if "Testing" is reachable in the production bundle. *Quick fix.*

### C2. Players get lost in town with no way home

- **Where:** The town, after the Home Dojo tour and after Street Smarts.
- **What:** The town is big, dark and mostly empty. The torii leads nowhere. The sign on the east empty lot does nothing when tapped. There are invisible walls near the pond, and a dark curb blocks the south, where the plaza is a dead end. There's no minimap, no signpost and no Home button. "Back to the dojo" on the Street Smarts end screen leaves you **inside the Street Smarts House**.
- **Repro:** Leave the Home Dojo for town after the tour and try to find the Pro Shop (it's inside the Action Zone building) or the Street Smarts House (west of it). Or finish a Street Smarts lesson, tap "Back to the dojo," then try to walk home.
- **Why it matters:** It hit all three testers. Mia (6) couldn't find the shop or the house and got bored. Jordan (12) couldn't find the house, then couldn't get home, so he quit before the harder Tower run he wanted. Even Sarah, who found the house by its sign, called the walk long.
- **Fix:** Add a house icon on the top bar that goes straight to the Home Dojo. Add a small corner map with icons for Home, Pro Shop and Street Smarts House. Put big picture signs over the doors. After Sensei's tour, show a glowing footprint trail to each place. Make "Back to the dojo" really go to the Home Dojo. *Medium.*

### C3. The defeat screen hides that you lost, and pays nothing at white belt

- **Where:** The end of a failed Tower run.
- **What:** Two of the reviewer's early white-belt runs ended after Room 1 with **"You learned this room!"**, "Sensei: Let's rest at the dojo.", "Head home", "You reached room 1 of 8!", 0 rooms, Combo 19, 0:20, **+0 XP**, nothing found. The run ended even though combos of 7 to 8 had shown during the fight. Nothing said the player had run out of health. On the Orange test profile, a loss showed "You kept everything you found!", Jade Charm x2 and +18 experience. So losses pay something at higher belts but nothing at white belt. A popup then offers "Want more time to COUNTER? Try Guided…" (good, and it matches *core-design §4 "Adapting to the player"*).
- **Repro:** Start a fresh white belt and enter the Tower. Let Room 1 wave 2 hit you until the run ends.
- **Why it matters:** A kid who loses doesn't know they lost, and gets zero for trying. The competitor brief's main Archero lesson is "a satisfying failure": "A lost Tower run should never feel like a wasted sitting." The design's own run loop ends with "Return home with loot, materials, and experience." This is the moment a beginner decides whether to try again.
- **Fix:** Show a clear but kind headline, such as "Out of energy! You made it to Room 1, Wave 2." Always pay something: XP for each wave cleared, plus any drops found. Show one "next time try…" tip based on what hit you. Offer Guided right on that screen. *Quick fix.*

### C4. Combat doesn't need much skill: auto-strike, auto-block, and mashing works

- **Where:** Every Tower fight.
- **What:** With no keys pressed, the character auto-strikes and auto-blocks ("BLOCK -14", "4 COMBO" and damage numbers with no input). On easy rooms, mashing J/Space clears waves. In the white-belt run "Pillar Court," many Strike/Counter taps only produced "BLOCK -6" or "BLOCK -4," and the tester never saw an enemy defeated. The timing wasn't clear. Sensei's hint "Take your time. Tap the glowing COUNTER button!" stays on screen during the fight, while Strike and Counter both glow whenever enemies are near. In a no-input test, a Guided character still had about 75% health at 16 seconds and fell at about 42 seconds; a Challenge character died in about 30 seconds.
- **Why it matters:** The design says starting auto-attack is intended (*§10 "How a character starts"*), but it also says the goal is to "defeat shadow creatures with skill, not button mashing." The moment loop (*§3*) "is the loop everything else depends on." Jordan wants a challenge. Mia needs to see that *her* tap caused the hit. If the game plays itself, neither gets that feeling.
- **Fix:** Keep the gentle auto-attack, but take blocking out of auto. Make Counter a clear timed window with a big flash and a "PERFECT!" when it lands. Give the Counter button an obvious "now!" pulse only during the window, rather than glowing whenever enemies are near. Hide Sensei's hint after the first successful counter. *Medium.*

### C5. Difficulty swings: one tester sails through, another dies in Room 1

- **What:** The persona testers cleared 5 rooms on their first run (Jordan: 5 rooms, 2 Great, combo 35, 4:28, +100 XP, "easy"). Sarah nearly lost the first boss. The holes tester died on Room 1 wave 2 again and again as a white belt. Challenge is locked ("Opens when you earn your Green Belt!"), and the belt can only be set by a grown-up, so a real green belt like Jordan stays on easy unless a parent sets it.
- **Why it matters:** Too easy reads as "for babies" to a 12-year-old. Losing with no explanation (C3) loses a 6-year-old.
- **Fix:** Find out why runs differ so much (the Blessing, room order, level). Put the "Guidance after two defeats" rule from *§4* where players see it. On the locked Challenge option, add "Green belt or higher? Ask a grown-up to set your belt." Offer a "Hard Floor" bonus after a no-hit clear. *Medium.*

### C6. Nothing to chase in the game between real promotions

- **Where:** My Path and the run summary at the level cap (Orange test profile).
- **What:** At Level 30 the game says "Top level! See My Path to climb higher." A run's +18 XP then does nothing. The only in-game goal left is "Next in the game: Beat your best combo of 35." The Monster Journal ("Sunrise Garden") shows all "?" with "Keep exploring!", even though Trophies show the Swarmer, Brute and Floor Keeper as earned. The design's "Always show the closest goal" items (crafting materials, decoration sets, Bestiary progress) were not seen in the build.
- **Why it matters:** Real ranks take months. The design says "Neither journey stalls": at the cap, extra experience should turn into crafting materials and ability Mastery. Without that, an Orange belt waiting on class sign-offs has no reason to open the game.
- **Fix:** Short term: at the cap, turn XP into coins or a "Mastery" bar with small cosmetic rewards, fix the Monster Journal, and show one nearest goal after every run (for example "2 more Brute counters to fill its Journal page"). Longer term: the Shifted Floor of the week and crafting from the design. *Medium (short term) / Big (long term).*

### C7. Economy gap: almost nothing a new player can buy

- **What:** A new player has 239 coins after the tutorial, and 359 after the first Home Dojo chest. The only affordable item is the Paper Lantern at 300 ("You have 359. After: 59."). Outfits cost 1,500, the Turtle pet 1,500, the Red Panda 2,000 ("1641 more coins to go"), Bonsai 800, Framed picture 500 and wall paint 400. No Tower coin payout was seen. Full numbers are in section 7.
- **Why it matters:** Jordan: "I want the red panda… But 2000 coins is a lot." If that goal sits ten-plus sessions away with no visible progress per run, it stops being a goal.
- **Fix:** See section 7. *Medium.*

### C8. Taps that do nothing or land in the wrong place

- **What:** The floor-clear "The door is open!" arrow ignores taps (only the keyboard up arrow worked). The Home Dojo TOWN exit mat doesn't trigger if you arrive standing on it. "Got it" taps also walk the character. Sensei's Next button moves height on every line. A quick Next tap in Street Smarts picks an answer that appears in the same spot. Settings ignores taps while the Bow prompt is up. Full repro steps are in section 9.
- **Why it matters:** On a phone, a dead button can leave a child stuck with no keyboard to fall back on. All three testers hit at least one of these.
- **Fix:** One tap-handling pass (see section 9). *Quick fix.*

### C9. Kata practice doesn't register

- **Where:** The kata mat in the Action Zone building.
- **What:** It shows "Step 1 of 8" with no prompt for what to press. Every press counted as a miss, and it felt laggy. The holes run did not re-test this; the Training Board's "Practice room" is a free fight area, not kata.
- **Why it matters:** This is the strongest link to real class. `progress.md` also says kata pays 250 coins once per kata's first clean run and 30 per clean run after that. If kata is broken, a major coin source is gone too, which feeds C7.
- **Fix:** Show the move for each step (a big arrow or button picture), slowed down for low belts. Confirm that correct presses count. Re-test on a real phone. *Medium.*

### C10. The parent lock is weak and the defaults start in the less safe position

- **What:** The grown-up gate is "Grown-ups: what is 15 + 7?" with the choices 20 / 21 / 22 / 32. Behind it are the play-time limit (**Off** by default), the belt and stripes setting, and **"Erase progress."** Party invites are **On** by default. Settings shows no privacy information. Details are in section 8.
- **Fix:** See section 8. *Quick fix / Medium.*

---

## 3. Onboarding and the first 30 minutes

The design's target (*core-design §7 "The first 30 minutes"*): under one minute to the first action, "No screen with more than one sentence of instructions," "No failure in the tutorial," "End on anticipation, never on a menu," the real name and belt from the first second, and a second run at 0:15.

| # | Finding | Where | Why it matters | Fix | Size |
|---|---|---|---|---|---|
| O1 | **The tutorial takes about 15 minutes and can't be skipped.** The town tour is forced too, and the town door stays blocked until the tutorial is done. | Opening, first town visit | Jordan: "Fine, I can skip some of this," but he couldn't. Bad for replays and shared family phones. The design puts the second run at 0:15. | After the first fight, ask "Played games like this before?" and let a yes skip ahead. Make the town tour skippable. | Medium |
| O2 | **Name locked as "Sam T."** Lessons then call the player "Sam." | Character creation | The design says "Welcome, Ava. Sensei says you're a Yellow Belt." Every tester noticed. | Let a grown-up set the name (and the belt) on first launch until DojoForge supplies them. | Quick fix |
| O3 | **The first tutorial shadows flee before a child can hit them.** | First fight | Mia: "I didn't even hit them. Nothing happened." The first fight should prove "I did that." | Keep the shadows until the player lands at least one hit. | Quick fix |
| O4 | **Four pop-ups in a row after the first floor:** "Floor cleared! You found: Mountain Gi"; "A Class Chest! … +150 coins"; "You earned a trophy! Golden Fist Trophy…"; then a long "Welcome home, Sam!" (Beginner's Stance, Basic Form 1, and Kata "reward arrives in a later update"). | Entering the Home Dojo | It breaks the design's one-sentence rule. Mia: "Box, box, box, box. So many words." Jordan: "later update" reads unfinished. | Make one picture reward screen with one big button. Move the explanation into Sensei's tour, one short line at a time. Remove "later update" text. | Medium |
| O5 | **Creed Scroll:** a full screen of text ("Say it with your class"), including "I AM MORE THAN A CONQUEROR THROUGH JESUS CHRIST!!!", then "Which line do you like best?" with nothing to tap. | Home Dojo | Mia: "like school." Jordan: "school-ish, I skip it." Sarah: fine for a Christian school, but parents should hear about it up front. | Keep the creed. Make the lines tappable, add read-aloud, keep it short, and mention it on the parent page. | Quick fix / Medium |
| O6 | **The "Got it" tutorial prompts also move the character,** and after the boss "Got it" needed a second tap. | Tutorial | Annoying, and it feels broken. | Stop taps on dialogs from reaching the movement handler. | Quick fix |
| O7 | **What worked:** "Surprise me!" in the look picker, the big gold Bow button, the gold arrows and rings in Sensei's tour, the tutorial boss ("decent… like Roblox but cleaner"), and the Floor Keeper win followed by the "SPECIAL!" Jade Charm. | | Don't lose these. | Keep them. | |
| O8 | **Not seen in the first session:** the endowed-progress cascade ("You've already earned these in the dojo"), an Insight choice at white belt, a guaranteed Uncommon at 0:06, or "three clear next goals" at 0:30. My Path does show one game goal and one class goal. | | These are the design's anticipation beats. | Check them against §7 once DojoForge data exists. | |

---

## 4. Tower and combat

| # | Finding | Repro / where | Fix | Size |
|---|---|---|---|---|
| T1 | Auto-strike, auto-block and mashing (C4). | Any fight with no input. | See C4. | Medium |
| T2 | Defeat screen (C3). | Lose in Room 1 at white belt. | See C3. | Quick fix |
| T3 | Difficulty swings (C5). Guided with no input fell at about 42 seconds; Challenge at about 30 seconds. | | See C5. | Medium |
| T4 | **The run timer keeps ticking while menus are open,** so "Bests" shows an inflated "Fastest floor: 3:38." | Open any menu mid-run and wait, then check Bests. | Pause the timer whenever a menu or dialog is open. | Quick fix |
| T5 | **The Blessing counter is stuck:** "✦ Blessing on for 3 more runs." still showed after 3 runs. | Note the count, play 3 runs, check the Training Board. | Decrement it per run and test it. (`progress.md`: "Nothing is shown when it runs out.") | Quick fix |
| T6 | **Loot arrives late, and its name may be inconsistent:** "Floor cleared! You found: Jade Charm" popped up after the Bow in the Home Dojo. Earlier the same drop seemed to be called "Crane Charm." The Gear screen lists both a Crane Charm (Epic) and a worn Jade Charm, so these may be two different items. Needs a check. | Clear a floor and watch for the item pop-up. | Show drops at the moment they're picked up, and use the same name on every screen. | Quick fix |
| T7 | **Gear effects are only text** ("Details ▸: Great Counters heal 6 health"). The "▲ Stronger than what you wear" arrow is good and matches the design. | Gear tab. | Show the effect in the fight (a heal number, a glow) the first time it triggers. | Medium |
| T8 | **Fighting Style is read-only:** Stance "Beginner's Stance," Strike "Spin Kick," empty Virtue and Kata slots, Seal slots "Learn this at the dojo." There are no stats and nothing to equip. Test profiles weren't cumulative (White: Spin Kick only; Orange: Spin Kick and Throw; Green: Shield of Respect, Butterfly Kick, Throw, Disarm, "Lock (arm)"); that's probably just test data. | Training Board → Fighting Style. | Tell a 6-year-old one thing per slot in pictures ("Learn Basic Form 1 in class → get this!"). | Medium |
| T9 | **What works (Orange profile):** "Choose an Insight" (Press the Advantage / Heavy Hands / Warm Up), "The doors are open! Pick one." TREASURE vs BATTLE, Room 2 "Oven Row" with "Lantern Dark: it's dim, but red circles still glow!", and the HUD "Room 1 of 8 • Wave 1 of 3." This is the Archero-style run variety the design wants. | | Make sure white belts see an Insight choice early (*design §7, 0:04*). The white-belt notes don't record one. | Quick fix (if it's only gating) |
| T10 | **Fast loot with rarity colors works:** "I got 5 items in 4 minutes… Rarity colors are cool." | | Keep it. | |
| T11 | `?difficulty=challenge` in the URL was ignored (Steady stayed). This may be intended, since Challenge is locked. A "Golden Hero Statue" trophy pop-up appeared on load. | | Low priority. | Quick fix |

---

## 5. Home Dojo, My Path, Decorate, Book

| # | Finding | Repro | Fix | Size |
|---|---|---|---|---|
| H1 | **Sensei's box "Ready? Walk to your Training Station." never goes away,** and it covers the Decorate storage tray. | Enter the Home Dojo (after the Bow), open Decorate. | Dismiss it once the player reaches the station, and hide it during Decorate. | Quick fix |
| H2 | **The Bow prompt shows on every entry,** and Settings ignores taps while it's up. | Enter the dojo, tap Settings. | Keep the Bow (it's loved), but let Settings open, or grey Settings out with a "Bow first" hint. | Quick fix |
| H3 | **The bought Paper Lantern wasn't in storage,** even though the shop said "It's yours! In your dojo storage!" | Buy the lantern in the Pro Shop, go home, open Decorate → storage. | Fix the inventory hand-off and add a test. | Quick fix |
| H4 | **The Decorate chooser ("How do you like to move decorations?" Tap to move / Arrow pad) reappears** after the first Done. | Open Decorate, choose, tap Done, open Decorate again. | Remember the choice. | Quick fix |
| H5 | **The "Welcome home! Train in class to grow stronger!" toast hides the Training Board tabs.** | Return from a run and open the Board. | Move the toast or shorten how long it shows. | Quick fix |
| H6 | **No characters to talk to besides Sensei** (in the holes run). The brief says Home Dojo characters give lessons on manners, culture and life. Sensei's tour lines did that for Mia. | | Add one or two characters with one short lesson each, or say which update brings them. | Medium / Big |
| H7 | **My Path is clear for adults but text-heavy for kids:** "The Gate to Yellow Belt," "0 of 7 lit," nodes (Basic Form 1, Defense #1-#5, Kick 1), "Classes 1 of 24," "YOUR NEXT CLASS STEP: Show Sensei Basic Form 1 in class. Next class: Today," "NEXT IN THE GAME: Reach level 2 in the Tower." Nothing says how a node gets lit (by a real sign-off through DojoForge). | Top bar → My Path. | Add one line, "Sensei lights these when you pass in class," and a picture per node. It matches *§9 "The Path card"*. | Quick fix |
| H8 | **Decorate works:** placing items saves, and storage held Speedy Swarmer, Gentle Brute and Kind Keeper Trophies, Brave Lion-Dog Statue, Scroll of the Bow and Golden Fist Trophy. **Look:** Mia loved turning her gi red. **Spotless tick:** Jordan called it "kind of neat." | | Keep them. | |
| H9 | **Book → Faith banner** ("A dojo banner. Each belt lights a letter."; on Orange, F = Forgiveness and A = Acceptance lit) and the banner "FAITH DOES" on My Path. These were seen, not judged by kids. | | Mention it on the parent page (section 8). | |
| H10 | **Monster Journal vs Trophies mismatch** (see C6). | Earn the Floor Keeper trophy, then open the Monster Journal: all "?". | Fill Journal entries when an enemy is seen or defeated, as in *§5 Collections, "The Bestiary"*. | Quick fix |
| H11 | **The Orange profile's Home Dojo shows a green "Street Smarts" button** at top right. The notes don't say whether white belts get it. If not, it's an easy fix for C2. | | Show it at every belt. | Quick fix |

---

## 6. Town, Pro Shop, Street Smarts

**Town and shop**

- **The night town looks great** to a 12-year-old ("It looks sick at night") but dark and empty to a 6-year-old. Navigation is covered in C2.
- **The Shop button** at top right works. Party and Say are crowded together at bottom right (Jordan).
- **The Pro Shop:** Miss Hannah at the counter inside the Action Zone building ("Welcome to the Pro Shop!"). Tabs: Skins, Colors, Effects, Pets, Dojo, Sell and "Wish." Mia's notes list Gear / Pets / Dojo instead, so check whether the shop shows different tabs in some state. Most skins are locked. "Crimson Dragon (Epic) – Comes with a new belt!" is a great tie to real promotion. On the Orange profile: Skins 3/11 locked, Effects 3 auras locked, Pets 1 locked. **Untested:** buying from Wish, selling (only the prices were seen), and Party with a real classmate (nobody was online).
- **Mia was drawn to Pets** but didn't understand Gear or the prices.

**Street Smarts House**

- **Finding it:** Mia and Jordan needed a hint (it's west of Action Zone). Sarah found it by its sign in 1 to 2 minutes. Inside, Grandmaster Michael is hard to spot at his top-left desk, and invisible walls block you before you reach him (tapping him directly works).
- **The lessons seen:** "Separated from your grown-up in a store" / the bookstore stranger (with Mom for some testers and Dad for others). Lines included: "When Sam looks up, Mom is gone." / "Take a big breath, Sam. You know what to do." / choices Stay right here / Run and look everywhere / Go outside to look / helper choices (name-tag worker, cashier, grown-up with kids, "Hide and wait alone") / "I can't find Mom. Can you help me?" / a stranger asking "Do they know your family's secret word?" / "No thank you. I'm staying with the worker." / "Strong choice, Sam." / the recap / "You earned 2 of 3 stars!"
- **Wrong answers are handled gently:** "Let's see what could have gone differently… If you both keep moving, can you find each other?… Let's try again."
- **Safety Tips bookshelf:** know your grown-up's phone number; if lost, stay put and find a helper like a name-tag worker; if something feels wrong, walk away and tell a trusted grown-up; always ask before going anywhere with anyone; keep two big steps of space from strangers. **Badges wall:** 8 empty spots.
- **Coins:** +180 for the first run, +10 for a repeat.

**Age fit**

| Age | Verdict | Evidence |
|---|---|---|
| 6 (Mia) | Works. Readable, not scary, and she learned the rules. | "Stay with a store worker, not go with a stranger, remember the secret word." She lost a star to a fast tap that landed on an answer (bug). |
| 8 (Sarah's child, judged by Sarah) | Works. "Suitable and not scary." | Gentle wrong answers, useful tips for parents. |
| 12 (Jordan) | Fails: **"This is for babies."** | A text slideshow with letter circles for faces, an obviously wrong unsafe option, and "Sam gives Dad a big hug" is cringe. He'd do it "once for the coins." |

**Gaps against the design** (*core-design §13, "Street Smarts format: illustrated story scenes"*): the design calls for one illustrated picture per scene, read-aloud that's on by default for ages 6 to 9, and interactive moments (tap to spot exits, hold for the loud voice, escape timing). The build uses the same bookshelf background with letter circles for speakers, and no tester noted any read-aloud or interactive moment.

**Ideas for tween scenarios** (suggestions, not features that exist): someone you don't know messaging you in a game chat and asking for your school or a photo; friends pressuring you to do something you know is wrong; someone following you on the walk home; a group chat turning mean. For older belts, write choices where the wrong answer is tempting (for example "just block them" vs "tell a grown-up and block them"), drop the hug ending, use a cooler tone ("Sensei's debrief") and give more stars for spotting the warning signs early. Gate these by belt or age so the lessons Mia gets stay as they are. *Big.*

**Quick Street Smarts fixes:** make answer buttons ignore taps for about half a second after they appear; put a glow or floating name tag over Michael; remove the invisible walls around his desk; make "Back to the dojo" go home. *Quick fix.*

---

## 7. Economy (every number observed)

| Item or activity | Coins |
|---|---|
| After the tutorial | 239 |
| After the first Home Dojo Bow and Class Chest | 359 (the chest said "+150 coins for the shop"; the observed change was about +120) |
| Class Chests on the test profiles | "2 Class Chests! +300 coins" |
| Street Smarts, first run | +180 |
| Street Smarts, repeat | +10 |
| Selling gear | Uncommon 15, Epic 100 |
| Tower run | No coin payout seen; first run +100 XP; failed white-belt runs +0 XP |
| Kata (from `progress.md`, untested because kata didn't work) | 250 once per kata's first clean run, 30 per clean run, 3 with mistakes |
| Test-profile switching (bug, C1) | +4,150 (Orange), +2,350 (Green) |
| **Prices:** Paper Lantern | 300 (the only thing a new player can afford) |
| Wall paint (x3) | 400 each |
| Framed picture | 500 |
| Bonsai | 800 |
| Outfits (the two buyable ones) | 1,500 |
| Turtle pet | 1,500 |
| Red Panda pet (Rare) | 2,000 |
| Crimson Dragon skin (Epic) | Locked, "Comes with a new belt!" |
| Other decor | About 10 locked |

**What's wrong:** after the lantern, the next goal is at least 400 coins away (wall paint), and the pets and outfits kids actually want are 1,500 to 2,000 away. The known repeatable sources are tiny (+10 for a Street Smarts repeat, 15 for selling an uncommon) or broken (kata). `progress.md` says the plan is "real training pays most, then clean kata and Street Smarts, then the Tower." Until DojoForge connects real training, the biggest source doesn't exist yet. The design also says "No wasted drops": duplicates should break down into materials. The build sells them for coins instead, which is fine, but crafting wasn't seen.

**Fixes:**

1. Show coins earned on every run summary, win or lose, even if it's small (for example 20 to 40 for a clear). *Quick fix.*
2. Add 2 or 3 starter items in the 100 to 300 range (a pet bowl, a small banner, a hat) so the first sessions each end with a purchase. *Quick fix.*
3. Add a "Saving for: Red Panda ███░░ 359 / 2000" goal bar on the Home Dojo that the player picks in the shop (this may be what "Wish" does; untested). *Medium.*
4. Fix kata so its planned coins actually flow (C9). *Medium.*
5. Until DojoForge is connected, run a temporary "came to class" grant so the economy matches the plan. *Medium.*

Keep an eye on the competitor lesson from ABCmouse: Common Sense Media criticizes that "learning is rewarded by shopping." Make sure mastery and real promotions stay the biggest rewards, ahead of shop items.

---

## 8. Parent trust and safety

**What already earns trust (keep it):** nothing for sale and no real money; no ads and no outside links; Say is 15 set phrases only ("Hello!", "Good job!", "See you in class!" and so on), with no typing; a play-time limit with kind wording ("your child finishes their room and returns to the dojo. Nothing is lost."); "A grown-up should set the belt, not the student"; Reduced motion; Guided pace; and the gentle Street Smarts. Sarah: she'd let her child play (8/10).

| # | Issue | Where | Fix | Size |
|---|---|---|---|---|
| P1 | **The Testing screen lets a child set their own belt and levels** (C1). It undoes the parent belt lock entirely. | Training Board | Remove it from the live build. | Quick fix |
| P2 | **The parent gate is "15 + 7" with four choices** (20/21/22/32). An 8-year-old can pass or guess it. Behind it: the time limit, belt and stripes, and **Erase progress**. | Settings → For grown-ups | Use a typed answer with no choices (for example "type the number: forty-seven"), or a 3-second hold plus a typed answer. Add a confirm step on Erase progress. | Quick fix |
| P3 | **The play-time limit starts Off.** | For grown-ups | On first launch, show a one-time grown-up card with 30 minutes pre-selected and the belt picker. This matches the design's "every setting has a sensible default." | Quick fix / Medium |
| P4 | **Party invites start On.** | Town → Party | Default to Off. The design says parents can turn multiplayer off (*§11 "Safety and legal"*). | Quick fix |
| P5 | **No privacy information** in Settings or For grown-ups: no policy text, no link, no school contact. A privacy notice appeared early in Sarah's first session, but its text wasn't recorded. | Settings | Add a "For parents" page: what's saved and where ("Saved on this phone"), no purchases, no ads, set phrases only, who can send invites, a privacy policy link and Action Zone's contact. The design says a lawyer should review the privacy policy and COPPA before public launch. | Medium |
| P6 | **The faith content isn't disclosed up front.** The Creed ("I AM MORE THAN A CONQUEROR THROUGH JESUS CHRIST!!!"), "FAITH DOES" and the Faith banner fit a Christian school, but parents should hear about it before they find it. | Home Dojo | Add one line on the parent page and the title or first-launch card: "Includes Action Zone's Christian creed and values." | Quick fix |
| P7 | **The game's text can't be read by screen readers** (it's all drawn on one canvas). | Everywhere | Read-aloud for Sensei and Street Smarts text covers most of this (the design already plans phone text-to-speech). | Medium |
| P8 | **No "what your child learned" summary** for parents. | | Add a one-screen digest: Street Smarts topics done, Safety Tips, manners (bowing, a clean dojo), time played. It matches *§13 "Parents: as close to zero effort as possible"* and ABCmouse's parent view. | Medium |

---

## 9. Full bug list (merged across all sessions)

"Possible test-tool issue" means it may have come from the testing setup (simulated touch, a slow test browser, or a desktop-size window) rather than the game. Check those on a real phone before fixing.

| # | Bug | Seen by | Steps to reproduce | Notes |
|---|---|---|---|---|
| B1 | **The Testing button is reachable by players** and grants belts, levels and coins | Holes run | Training Board → Testing → switch profiles back and forth | Critical (C1) |
| B2 | **The floor-clear "The door is open!" arrow ignores taps** | Mia | Clear the first floor, open the chest, tap the arrow. Only the keyboard up arrow works. | Mia's session used a mouse at desktop size. Confirm on a phone, but treat as real. |
| B3 | **Leaving the Home Dojo for town doesn't respond** | Mia, Jordan | Arrive standing on the TOWN mat and tap the TOWN label or the stick: nothing happens; you must walk off and tap the grey pad. Mia: after the Training Board, the exit stuck until she moved up then down. | Probably the exit doesn't trigger if you start on it. |
| B4 | **"Got it" taps also move the character**; after the boss it needed a second tap | Jordan | Tutorial: tap "Got it" | |
| B5 | **Sensei's Next button changes height every line** | Mia | Sensei's tour, tap Next repeatedly | Taps miss |
| B6 | **A quick Next tap picks a Street Smarts answer** | Mia | Tap Next fast as the choices appear in the same spot | Cost her a star |
| B7 | **Creed Scroll question has nothing to tap** | Mia | Open the Creed Scroll: "Which line do you like best?" | |
| B8 | **Practice Kata never counts a press** | Mia | Kata mat → "Step 1 of 8", no prompt, every press a miss | **The lag may be a test-tool issue**; the missing prompt is likely real. Not re-tested. |
| B9 | **"Back to the dojo" leaves you in the Street Smarts House** | Jordan | Finish a lesson, tap "Back to the dojo" | |
| B10 | **Invisible walls and dead ends in town** (pond, east lot sign does nothing, torii leads nowhere, dark south curb) | Mia, Jordan | Walk to each spot | |
| B11 | **Invisible walls around Michael's desk** | Mia (Sarah found him hard to spot) | Walk toward his desk at top left | Tapping him works |
| B12 | **Settings ignores taps while the Bow prompt shows** | Sarah | Enter the Home Dojo, tap Settings before bowing | May be intended; give feedback |
| B13 | **Name locked as "Sam T."** | Everyone | Character creation | May be a design choice for now |
| B14 | **Esc doesn't close Look** | Mia | Open Look, press Esc | Keyboard only, minor |
| B15 | **The defeat screen is unclear and pays nothing at white belt** | Holes run | Lose in Room 1 at white belt | C3 |
| B16 | **The run timer keeps ticking in menus** | Holes run | Open a menu mid-run, wait, check Bests | Inflates "Fastest floor" |
| B17 | **The Blessing counter doesn't count down** | Holes run | "Blessing on for 3 more runs" is unchanged after 3 runs | |
| B18 | **Sensei's box "Ready? Walk to your Training Station." never clears** and covers the Decorate tray | Holes run | Enter the dojo, open Decorate | |
| B19 | **The Decorate chooser reappears** after the first Done | Holes run | Decorate → choose → Done → Decorate | |
| B20 | **The bought lantern is missing from storage** | Holes run | Buy the Paper Lantern, then open Decorate → storage | The shop said "In your dojo storage!" |
| B21 | **The welcome toast hides the Training Board tabs** | Holes run | Return home, open the Board | |
| B22 | **The Monster Journal shows all "?"** while Trophies show bosses earned | Holes run (Orange) | Open the Monster Journal after earning the Floor Keeper trophy | |
| B23 | **The floor-clear item pop-up arrives late** (after the Bow at home); Jade vs Crane Charm naming needs a check | Holes run | Clear a floor and watch | |
| B24 | **The virtual joystick drag didn't move the character** (tap-to-walk worked) | Jordan | Phone-size touch emulation, drag the stick | **Possible test-tool issue** (simulated touch) |
| B25 | **Dropped taps right after a scene change** | Holes run | Tap immediately after entering a room | **Possible test-tool issue** (the test browser was slow) |
| B26 | **Browser lag ended Mia's second Tower run** | Mia | | **Possible test-tool issue** |
| B27 | **Reward pop-ups chain on load,** and "Last climb" carries across profiles | Holes run | Switch test profiles | Mostly a test-screen issue; matters only if C1 isn't fixed |
| B28 | `?difficulty=challenge` ignored | Holes run | Add it to the URL | May be intended (Challenge is locked) |

**Needs a second look (not confirmed bugs):** the shop tabs differed (Mia recorded Gear/Pets/Dojo; others saw Skins/Colors/Effects/Pets/Dojo/Sell/Wish). Street Smarts paid +10 on what Sarah's notes treat as her first lesson, so the save may not have been fully fresh (**possible test-tool issue**). And the holes run's part 1 asked for an 844x390 phone size but rendered about 560 px wide.

---

## 10. Competitive read: ABCmouse and Archero

*All facts below come from the sourced competitor brief (`2026-11-23-competitor-research.md`). Links are listed at the end of this section.*

**Honest answer:** **No, not as a mass-market rival.** ABCmouse sits inside a company valued at about $3 billion in 2021, with roughly three million monthly active users in early 2026 and 13,000+ activities. Archero has 50 million+ Google Play downloads and, by a third-party estimate, more than $263 million in lifetime in-app purchase revenue. **Yes, for Action Zone students' after-class time,** which is the only fight that matters here. Children ages 5 to 8 average 1 hour 4 minutes of gaming a day (Common Sense Census 2025), so the game needs to win a 15-to-30-minute slice of that, not the charts.

**Dojo Ascent's real edge (things neither giant can copy):**

1. **The real belt Gate.** "I earned my stripe in class" opens a floor. No other app can do that.
2. **Sensei, classmates and the school.** Belonging beats a global leaderboard (the Pokémon GO family study found cooperation mattered more than competition).
3. **Parent trust:** no ads, no purchases, no loot boxes for sale. After ABCmouse's $10 million FTC settlement over hard-to-cancel billing, and Archero's ads and packs, "nothing to buy" is a selling point. **But it only holds if C1 (the Testing screen) and P2 to P5 are fixed.**
4. **Values a parent can defend:** manners, culture, Street Smarts and a push back to the mat.

**Where the playtest says Dojo Ascent is losing right now:**

- **Against Archero (Jordan's age):** Archero's runs are "fun on their own," a failed run "still drops some rewards," and every session gives "two kinds of progress." Right now Dojo Ascent's combat partly plays itself (C4), a white-belt loss pays 0 (C3), and progress stops at the level cap (C6). Jordan's verdict was "Roblox but cleaner" for the combat but too easy, and "for babies" for Street Smarts. That's the brief's "gap in the middle" risk.
- **Against ABCmouse (Mia's age):** ABCmouse offers "a guided path plus freedom" and short sittings. Mia was fine on the guided path (gold arrows) but lost as soon as it ended (C2), and drowned in text (O4). ABCmouse also "ages out" around age 8; Dojo Ascent must not repeat that with Street Smarts at 12.

**Borrow (specific mechanics):**

| From | Mechanic | Where it goes in Dojo Ascent |
|---|---|---|
| Archero | **Three random skill picks after a room** | Insights already exist at Orange. Make sure white belts get them early. |
| Archero | **A failed run still pays,** and the next try is tempting | Redo the defeat screen (C3) |
| Archero | **Two layers of progress:** run power plus permanent gear and growth | XP overflow at the cap into Mastery or materials (C6), coins on every summary (section 7) |
| Archero | **Start simple, add depth later** (Habby found new players got lost when everything appeared at once) | Gradual unlocks; fewer first-day pop-ups (O4) |
| Archero | **About 5-minute attempts** | Keep the 5-to-7-minute run, and pause the timer in menus (T4) |
| ABCmouse | **A guided "do the next thing" path plus free wandering** | One glowing next goal on Home Dojo and run summary screens, and the town map (C2) |
| ABCmouse | **15–20-minute recommended sittings and a parent-set cap** | Time limit pre-set on first launch (P3) |
| ABCmouse | **A low-effort parent view** | "What your child learned" digest (P8) |
| ABCmouse | **Start at the child's level** | Guided by default for the youngest; name and belt set by a grown-up (O2) |

**Avoid:** energy or stamina timers and paid skips; loot boxes, gacha or any real-money randomness; ads of any kind (the brief notes ad networks are how inappropriate content leaks in); revives or power for money; limited-time "gone forever" rewards; late-night session extenders; public pay-to-win rankings or "your friend passed you" messages; open chat; hard-to-leave subscriptions if any parent account ever bills; and "learning is rewarded by shopping." Most of these are already banned by *core-design §8 "Where the hook stops"*. Keep it that way under any "boost retention" pressure.

**How to keep score** (from the brief): students still training and attending as much or more; kids choosing a run after class without being told; parents leaving the app on the family phone; and students who can name one Street Smarts or manners lesson they use. Don't score it by downloads or revenue.

**Key sources** (the full list is in the competitor brief):

- ABCmouse pricing: https://support.abcmouse.com/hc/en-us/articles/34385411866391-Subscription-Pricing-Options-for-ABCmouse
- Kidscreen, ABCmouse MAU (May 15, 2026): https://kidscreen.com/2026/05/15/abcmouse-rolls-out-its-first-animated-series-and-a-whole-new-strategy/
- Bloomberg via Yahoo Finance, $3 billion valuation: https://finance.yahoo.com/news/abcmouse-creator-valued-3-billion-110000764.html
- FTC $10 million settlement: https://content.govdelivery.com/accounts/USFTC/bulletins/29fb8f0 ; Chopra statement: https://search.ftc.gov/system/files/documents/public_statements/1579927/172_3086_abcmouse_-_rchopra_statement.pdf
- Common Sense Media, ABCmouse review: https://www.commonsensemedia.org/website-reviews/abcmousecom
- Archero on Google Play: https://play.google.com/store/apps/details?id=com.habby.archero ; App Store: https://apps.apple.com/us/app/archero/id1453651052
- Game World Observer / AppMagic estimates: https://gameworldobserver.com/2025/01/20/archero-2-revenue-8-million-in-11-days-vs-original-game
- Deconstructor of Fun on Habby: https://www.deconstructoroffun.com/blog/2025/7/31/habbys-hybridcasual-empire-the-template-that-built-a-powerhouse
- ThinkingAI Habby case study: https://thinkingai.io/customers/habby-archero/
- Common Sense Census 2025: https://www.commonsensemedia.org/sites/default/files/research/report/2025-common-sense-census-web-2.pdf
- Pokémon GO family study: https://pmc.ncbi.nlm.nih.gov/articles/PMC5772067/

---

## 11. Prioritized roadmap (top 15, ranked by how many players it helps and how much)

| Rank | Change | Fixes | Who it helps | Size |
|---|---|---|---|---|
| 1 | **Remove the Testing button and screens from the live build** (ship with testing screens off; add a test that fails if they're reachable) | C1, P1, B1, B27 | Everyone; parent trust; economy | Quick fix |
| 2 | **Town navigation:** a Home button, a minimap, door signs, a footprint trail after the tour, and "Back to the dojo" that really goes home | C2, B9, B10 | All three testers | Medium |
| 3 | **Tap pass:** the door arrow, TOWN mat, "Got it" moving the character, a fixed Next button position, a 0.5-second guard on answer buttons, Settings during Bow, Michael's walls | C8, B2-B6, B11, B12 | All three | Quick fix |
| 4 | **Defeat screen:** a clear "out of energy" headline, always pay XP and coins per wave, one tip, and a Guided offer | C3, B15 | Young and new players most | Quick fix |
| 5 | **Combat needs input:** no auto-block, a clear Counter window with a "PERFECT!" payoff, and Sensei's hint that clears | C4 | Everyone; Jordan most | Medium |
| 6 | **Parent safety defaults:** a typed gate, invites Off, a 30-minute limit pre-selected on first launch, a confirm on Erase | C10, P2-P4 | Parents (they decide whether anyone plays) | Quick fix |
| 7 | **Starter economy:** coins on every run summary, 2 or 3 items at 100-300, and a "Saving for" bar | C7 | Everyone after day 1 | Quick fix / Medium |
| 8 | **Cut first-day reading:** one picture reward screen instead of 4 pop-ups, the Creed made short and tappable, "later update" text removed, read-aloud on Sensei and Street Smarts | O4, O5, B7, P7 | Mia-age kids, Sarah | Medium |
| 9 | **Skippable tutorial and town tour**, plus a grown-up sets the real name and belt | O1, O2 | Jordan-age kids, replays, shared phones | Medium |
| 10 | **Something to chase at the cap:** XP overflow into Mastery or coins, a working Monster Journal, and "nearest goal" after every run | C6, B22 | Every student between promotions | Medium (then Big for crafting and the weekly Shifted Floor) |
| 11 | **Fix kata practice** (show each move, slow for low belts, correct presses count) so kata coins flow | C9, B8 | All belts; the strongest class tie | Medium |
| 12 | **"For parents" page:** privacy, what's stored, no purchases, set phrases, the faith disclosure, a contact, plus a "what your child learned" digest | P5, P6, P8 | Parents | Medium |
| 13 | **Difficulty path:** show how Challenge unlocks, a "Hard Floor" bonus after a no-hit clear, and look into the swings between runs | C5 | Jordan-age kids; struggling beginners | Quick fix / Medium |
| 14 | **Home Dojo polish:** the Sensei box clears, the bought lantern lands in storage, the Decorate chooser is remembered, the toast no longer covers tabs, the timer pauses in menus, the Blessing counts down, "how a node lights" on My Path | B16-B21, H1-H7, T4, T5 | Everyone | Quick fix |
| 15 | **Street Smarts for every age:** illustrated scenes (as the design says), plus tween scenarios (game-chat strangers, peer pressure, being followed home, group chats) gated by belt or age, and no hug ending for older kids | Section 6 | Jordan-age kids; keeps the safety value past age 8 | Big |

---

## 12. What was not tested, and how testing was done

**How:** All sessions were **AI playthroughs on November 23, 2026**, not real children. Grok Bot played three personas (Mia 6, Jordan 12, Sarah parent), then did a reviewer "find the holes" playthrough in three parts (10:31 to 11:03 PM ET), including the higher-belt test profiles and the difficulty modes.

| Session | Screen | Input |
|---|---|---|
| Mia | Desktop window about 1888x1030 (couldn't shrink it to phone size); the save wasn't cleared first | Arrow keys and mouse |
| Jordan, part 1 | Phone-size landscape 844x390 with touch emulation, fresh private window | Simulated touch |
| Jordan, part 2 (9:17-9:25 PM ET) | Not recorded | Not recorded |
| Sarah, part 1 (about 9:26-10:15 PM ET, cut out early) | Phone-size 844x390 | Simulated touch |
| Sarah, part 2 (10:17-10:28 PM ET) | Desktop 1888x1030, same save | Mouse and keyboard |
| Holes, part 1 (10:31-10:42 PM ET) | Asked for 844x390 but rendered about 560 px wide; fresh private window | Mixed |
| Holes, parts 2-3 (10:42-11:03 PM ET) | Desktop size | Keyboard (J = Strike, Space = Counter, L = Dash) and mouse |

**Not tested:**

- A real phone, real small fingers, the notch area and phone readability (only emulated).
- A belt Test or Gate opening with a real promotion (DojoForge isn't connected; the higher belts came from the developer test profiles).
- Party with a real classmate (nobody was online), Wish, actually selling gear (only the prices were seen), and letting the play-time limit run out.
- Challenge mode as a real green belt (only reached through the test profile, and only with no input).
- Jordan's harder second Tower run (he got lost in town). Mia's second Tower run (the browser lagged).
- Kata practice in the holes run (it was only tried by Mia).
- Crafting, the weekly Shifted Floor and quests (none seen).
- The text of the early privacy notice Sarah saw (not recorded).
- Any read-aloud option (none seen).
- Higher floors beyond Room 2 on the Orange profile.

**Final say:** real Action Zone students and parents should play this build (ideally a 6-to-7-year-old, a 10-to-12-year-old and one parent) before the bigger changes are locked in. Use this report as a list of things to watch for.

**Source files:** `/workspace/playtests/2026-11-23-holes-raw.md`, `2026-11-23-three-persona-report.md` (and `.pdf`), `2026-11-23-mia-raw.md`, `2026-11-23-jordan-raw.md`, `2026-11-23-sarah-raw.md`, `2026-11-23-competitor-research.md`, `core-design.md`, `progress.md`. Screenshot paths are listed in the raw notes and the three-persona report.
