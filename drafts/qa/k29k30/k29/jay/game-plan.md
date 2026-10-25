# Dojo Ascent: Jay's Game Plan

**For Jay only.** Bots: this file isn't for you. Your work list is `docs/work-board.md`.

Written 2026-10-19. Launch target: **early April 2027** (about 24 weeks away).

---

## Where we are, in one minute

**Built and working on the live link:**
- Moving, fighting, the Perfect Counter, Dash, 4 enemy types and the Floor Keeper boss (milestones 1–3)
- A full 8-room floor with doors, loot, Insights, grades and a 5–7 minute run (milestone 3)
- The link to real training with fake students: belts, levels, the Gate, abilities from sign-offs, the promotion ceremony (milestone 4, **still marked "paused"**)
- The Home Dojo: the bow, cleaning, decorating (milestone 5)
- Real art from the Art Director bot (Batches 1–6) and the character creation screen
- 132 automated checks, all passing

**Delivered but not in the game yet:**
- Batch 7 art: Sensei, Senpai, Kohai, the second instructor, the founder, and their portraits (**waiting for your approval**)
- Content Writer drafts: story chapter 1, Sensei's first lessons, technique callouts, bow questions, enemy and item descriptions
- Learning bot audit and 6 proposals
- QA report from Oct 18 with 10 bugs
- Your new docs: curriculum, self-defense #1–30, faith and creed, work board. (They never got pushed. I added them today.)

**Ahead of schedule or behind?** About on schedule. The roadmap had milestones 0–4 done by Nov 4. We're at 0–5 plus art, with 2 weeks to spare. The risks are elsewhere: the launch list keeps growing (see "Watch out" at the bottom), and the DojoForge connection depends on Nic.

---

## The plan: 8 phases

Each phase ends with something you can test on your phone. Check the boxes as we go.

### Phase 1: Tidy up and lock in (this week, 1 session)

Get the repository and the logs to match what you've decided, so every bot and every session starts from the same facts.

- [ ] Record your 7 work-board decisions in the decisions log (bow recall question, lore first, Bestiary at launch, first lesson wording, real techniques decide effects, QA bot active, new Systems Designer bot)
- [ ] Add the Game Systems Designer to the bot instructions and create its folder
- [ ] Fix the game's curriculum to match your belt ladder (differences listed in "Questions for you" below)
- [ ] Fix the QA bugs in what's already built:
  - a loss shows a short, encouraging "Try again" screen (right now it just jumps to the Board)
  - the promotion ceremony goes from 8 screens down to 2–3; the rest can be viewed later from the Board
  - friendlier dust wording ("Your dojo is ready for a fresh sweep!"), and the hours counter is hidden
  - mouse clicks work too, so previews open on a computer
- [ ] Decide on milestone 4: sign it off now, with the real-technique powers coming in Phase 3

**You test:** lose a run, get promoted, come back to a dusty dojo.

### Phase 2: Milestone 6, Story and Street Smarts sample (late October)

The first time the dojo characters talk to you.

- [ ] A dialogue system: portrait, name, 1–3 short lines, big choice buttons, read-aloud voice
- [ ] Sensei and Kohai in the Home Dojo (Batch 7 art)
- [ ] Story chapter 1 ("The Shattered Light") when you first enter the Tower
- [ ] One manners quest and one life-lesson quest
- [ ] One Street Smarts scenario for ages 6–9

**Waiting on:** your approval of Batch 7 art, the Content Writer's dialogue and scenario (C1), and your approval of that scenario script.
**You test:** talk to Sensei, play the scenario, and check whether a student can explain what they'd do.

### Phase 3: Real techniques become real powers (early November)

This finishes milestone 4 properly. The current powers were placeholders, and most don't match your techniques (your self-defense file shows which).

- [ ] Self-defense #1–10 get powers that do what the real technique does (#3 is a spinning back fist, #7 a trap, and so on)
- [ ] Kick Combos 1–2 and Basic Forms 1–2 updated the same way
- [ ] Technique callouts in fights: "Self-Defense #3!" pops up when it fires
- [ ] The bow recall question ("What's this one called?") with its 5 / 10 / 20 / 50 / 100 awards

**Waiting on:** the Systems Designer's power list (S4), the learning bot's review, your approval. Kick combos also need your kick combo list (J2).
**You test:** fight with a white belt and a yellow belt, and see whether each power matches the technique.

### Phase 4: Milestone 7, Playtest ready (November)

Make it ready to hand to kids without you explaining anything.

- [ ] Sensei's first lessons, including the guided first Counter (the game slows down and the button pulses)
- [ ] New players start on Guided; Sensei offers "Ready for Standard?" after their first win
- [ ] Insights hidden until 2nd belt (the unlock schedule)
- [ ] A run summary that leads with one great moment
- [ ] Parent play limit
- [ ] Balance re-check with a "button masher" computer player (the QA bot's request)
- [ ] **The real playtest:** 3–5 students of different ages, at least one aged 6–8

**You test:** hand your phone to a student, say only "try this," and watch.

### Phase 5: Milestone 8, iPhone and Android apps (December)

- [ ] Wrap the game as real apps (Capacitor), with iPhone builds made in the cloud since you don't have a Mac
- [ ] Test versions on your phone through TestFlight (iPhone) and Google Play internal testing
- [ ] Check against the Kids Category and Families rules

**You need first:** a lawyer talk, an Apple Developer account (about $99 a year), a Google Play account (about $25, one time), and the game's name.

### Phase 6: Milestone 9, real DojoForge connection (January)

- [ ] Real students log in and see their real belt and sign-offs
- [ ] Progress saved on our server, not just the phone
- [ ] Missions and the "Ready for review" queue in DojoForge

**Nic needs to build:** the progress feed, the request endpoint, the approval queue, and the fast instructor sign-off screen (work board F1). **He should see the feed shape in November** so January isn't a surprise.

### Phase 7: Milestones 10 and 11, the whole Tower and the stories (February)

- [ ] A Tower tier for every belt, each with its own Guardian, built from remixed rooms and enemy twists
- [ ] Powers for every technique up to black belt
- [ ] Sensei's Lessons for every system, the Lesson Scroll, Welcome Week for existing students
- [ ] The Bestiary (now a launch feature)
- [ ] Street Smarts: 2–3 locations, for ages 6–9 and 10–13
- [ ] Manners quests, 2 life-lesson stories, the story chapter for each tier
- [ ] Faith content wherever you approve it (FAITH DOES, verses, the Creed)

**Waiting on:** the lore bible (C3), tier art from the Art Director, your remaining curriculum answers, and approval of every scenario and quest. This is the heaviest month for your approvals.

### Phase 8: Milestone 12, launch (March to early April)

- [ ] Visiting classmates' dojos, certified trophies, the Hall of Masters
- [ ] Parent controls (multiplayer off, private dojo, hide players)
- [ ] Final polish, then App Store and Google Play review. **Submit by mid-March:** first reviews of kids' apps can take a while.

---

## Questions for you

Answer any time. They don't all block the next step.

**Curriculum (blocks Phase 1's curriculum fix):** the game's data differs from your new belt ladder.
1. **Spellings:** the game says "Keon", "Penon 1–3", "Nihanchi"; your new file says "Key On", "Pinon 1–3", "Nahanchi". Which should students see?
2. **Brown/Black:** the game has kata "Possi" and Self-Defense #41–45. Your file says "Jay to provide." Is it Possi?
3. **Kick combos:** the game has #7 at red/black, none at brown or brown/black, and #8–12 at black. Your file has #8 at brown. Which is right?

**Before Phase 3:** your kick combo list (J2), and one line on each kata's character (J3).

**Before Phase 7:** self-defense #31–40 and the brown/black → black requirements (J1), plus the 5 questions at the bottom of `docs/faith-and-creed.md` (J4).

**Smaller ones:** cosmetics are earned only (J5)? The wait from 1st to 2nd degree black (J6)? Fonts (J7)?

**Still open from the original design:** the game's real name (needed for the app stores), whether adult students play, and whether the game is its own app, inside the DojoForge app, or both.

---

## Your to-do list (outside the game)

- [ ] Approve or send back **Batch 7 art** (dojo people)
- [ ] Set up the **Game Systems Designer** bot (instructions in the work board appendix)
- [ ] **Talk to Nic** in November: the feed shape (`fixtures/` and framework section 14) and the sign-off screen (F1)
- [ ] **Book the lawyer** before December
- [ ] **Apple and Google developer accounts** before December
- [ ] Line up **3–5 students** for the late-November playtest

---

## Watch out

- **The launch list is growing.** Since the original plan, these were added: lore first, the Bestiary, bow-question awards, achievements, faith content, and real powers for 40+ techniques. Each is good, but together they could push launch. If February gets tight, the first things I'd move to after launch are the Bestiary's deeper lore, the higher-belt achievements, and the 3rd Street Smarts location.
- **You are the bottleneck for approvals,** not the building. Six bots are producing drafts. A weekly 30-minute "approve or send back" slot would keep everything moving.
- **Nic's work is the one thing we can't speed up from here.** Everything until January runs on fake students, so nothing waits on him before then.

---

## How each session works (reminder)

1. Tell me which phase or milestone we're on.
2. I give you a short plan; you say "go" or what to change.
3. I build in small steps and save each one.
4. You test on your phone and tell me what feels off.
5. I update the logs before we stop.
