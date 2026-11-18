# Playtest notes for Jay (Nov 18, 2026)

Claude played the new-student start, the Home Dojo, the town, the Training Board, the new Equipment screen and the practice room, on phone size and on a desktop window. Nothing in this file has been built. It is for us to talk through in the morning.

## 1. "Looking for the yellow !" instead of a fun, reactive fight

### What's causing it

1. **The hero attacks by itself.** Basic hits happen automatically, so between enemy attacks there is nothing to decide. The only real choice in a fight is "press Counter when the warning shows".
2. **Counter is the answer to almost everything, and it pays the most.** A Great Counter takes no damage, stuns the enemy, hits twice as hard and fills a quarter of Focus. One Great Counter killed the practice-room swarmer outright. So the best plan is to stand near enemies and wait.
3. **The warning is a symbol, not the opponent.** A big yellow "!" badge, a red circle and a sound all pop up together. Kids learn to watch for the badge, not for the enemy's body. Real sparring is the opposite: you read the opponent.
4. **The game teaches exactly this habit.** The guided first Counter freezes the whole fight with "Take your time. Tap the glowing COUNTER button!" until you press it.
5. **Each enemy has one attack until 4th–5th belt.** Same warning, same answer, every time. The second attacks only arrive on Challenge.
6. **Strike and Dash are rarely needed.** Strike is a big hit when Focus is full; Dash is only for the few dash-only attacks.

### Ideas to fix it (ranked by how much fun they add for the work)

| # | Idea | What changes for the player | Work |
|---|---|---|---|
| A | **The Opening.** After a Great Counter the enemy is dizzy for about 1 second and STRIKE glows gold. Tap it for a finisher that knocks the enemy back (into others, for bonus damage). | Counter becomes the start of a combo, not the end. React, then attack. | Small–medium |
| B | **Different answers from white belt.** Give each common enemy a second attack with a different right answer: a ground slam you must step or dash out of (red ground, no Counter), a shove you must Strike through, a feint that pauses before landing. Gold warning = Counter; red ground = move. | You have to read which attack is coming, not just react to "!". The dash-only rules already exist. | Medium (mostly data) |
| C | **Read the body, not the badge.** Make the "!" small (or only on Guided). The enemy's wind-up pose, glow and the ground circle carry the warning. | Watching the opponent, like real sparring. Still fair: every attack keeps its full warning time. | Small |
| D | **Shorter freeze.** Only the very first Counter in the tutorial freezes. After that, a short slow-motion instead. | The fight never stops to wait for one button. | Small |
| E | **Your own attack button.** Tap STRIKE for a quick 3-hit chain any time (with a short rest after), and auto-attack becomes weaker or only happens while standing still. | Always something to do; skill shows in when you attack. | Medium–large (rebalances combat) |
| F | **Flow.** Hitting, countering and dodging without getting hit builds a Flow meter that adds damage and a glow, and slowly drains if you just stand there. | Rewards staying active instead of waiting. | Medium |
| G | **Reasons to move.** More rooms with ranged enemies, falling-stone hazards (already built for the tutorial) and small goals like "light the 3 lanterns". | Positioning matters, not just timing. | Medium |

**My recommendation:** start with **A, C and D** together. They change the feel the most for the least work and don't upset the balance much. Add **B** next. Try **E** only if fights still feel passive after that.

## 2. Other weak spots

1. **Too many pop-ups when you arrive.** Opening the game can mean the bow, a welcome card, a Class Chest card, a Sensei news card, the Creed and a list of celebrations, up to about six taps before you can move. Idea: one arrival summary card, with the real promotion moments kept big.
2. **The bow comes every time the app opens,** even after a quick switch away. Idea: once a day.
3. **A lot of systems for a 6-year-old:** coins, level, Blessing runs, Calm Mind runs, Class Chests, Insights and power-ups, stances, Seals, kata powers, Virtues, Strikes, gear, the Book, the Shop, the Path and the faith letters. Idea: hide more of them until later belts.
4. **The Home Dojo is a big, plain room.** With the dojo now the hub, it needs to feel alive: a smaller, cozier room or more furniture, and real art for the new training station (it's drawn in code for now).
5. **The town has nothing to do yet,** beyond your dojo door and the Action Zone door. It's the natural home for Street Smarts, classmates' dojos and the Hall of Masters.
6. ~~**Text that overlaps:** the combo counter on top of the practice room's title, and "…and 5 more!" over "You got stronger!" on the welcome-back list.~~ **Fixed Nov 18.**
7. **Four separate menus** (My Path, Board, Book, Shop). Idea: make the Book and the Shop places too, like a bookshelf in the dojo and a shop stall in town.
8. **Run results still show on the Training Board after a run,** not in the dojo. Idea: a short results card, then back to the dojo.
9. **Placeholder words are still in the game:** Guardian lines, Seal stage names, Lock names, kata powers and Class Chest words.
10. **The download is about 59 MB.** It needs checking that art loads one belt at a time.
11. **The old gear screen code is still in the project** (unused now). It's safe to remove later, along with splitting up the two huge screen files.
