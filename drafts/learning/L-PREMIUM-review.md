# L-PREMIUM-review: premium polish review (engagement)

## Delivery Note
- **ITEM:** L-PREMIUM-review.
- **WHAT:** I compared Dojo Ascent's first session, onboarding, reward moments, home loop and reasons to come back with **Archero** (Habby, mobile) and two mobile Pokémon titles: **Pokémon GO** (Niantic) and **Pokémon Quest** (Game Freak; mobile and Switch). I did not use Pokémon Café Mix/ReMix because I found no design write-up of it I could cite. For each area the review covers what those games do well (from cited reviews and help pages), where we stand (from `docs/progress.md`), the gap, and the dark patterns we must not copy. It ends with 5 proposed board items (L-PREMIUM-a to e) and questions for Jay.
- **WHY:** Players will compare us with these games. We can copy their polish (fast first win, a mentor character, clear "how to earn this", a warm home) without their pressure (energy timers, paid revives, 7-day streaks, mood decay, gacha).
- **DECIDE (Jay):** the questions at the end. None of the items adds launch scope: 3 are marked launch-polish (small changes to systems we already have) and 2 are post-launch proposals.
- **NEXT:** After Jay's answers, the Manager can put the approved items on the work board. I can write short specs for them. No game code was touched.

Competitor facts are brief context, taken from the sources cited. Numbers can change with game updates, so they are marked please check where noted.

---

## Sources used
- [S1] Scott Fine, "Finding the Fun: Archero Part 1 – Gameplay" (2019). http://scottfinegamedesign.com/design-blog/2019/7/2/archero-part-1-gameplay
- [S2] Scott Fine, "Finding the Fun: Archero Part 2 – Progression", Game Developer. https://www.gamedeveloper.com/design/finding-the-fun-archero-part-2---progression
- [S3] Scott Fine, "Finding the Fun: Archero Part 3 – Monetization" (2019). http://scottfinegamedesign.com/design-blog/2019/7/10/finding-the-fun-archero-part-3-monetization
- [S4] Deconstructor of Fun, "How Archero Shot to the Top…" (Aug 2019). https://www.deconstructoroffun.com/blog/2019/8/9/why-archero-banked-25m-but-leaves-25m-hanging-hlx9n
- [S5] Alexandre Macmillan, "Difference and repetition in Archero" (Jul 2019). https://alexandremacmillan.com/2019/07/04/difference-and-repetition-in-archero/
- [S6] Krystal Higgins, "Pokémon Go – First Run UX". https://first-run-ux.kryshiggins.com/pokemon-go-ios-first-time-user-experience-the/
- [S7] Chameleon, "Teardown: Pokémon GO first time user experience". https://www.chameleon.io/blog/ux-teardown-pokemon-go-takes-over-the-world
- [S8] Niantic Help Center, "Buddy Adventure". https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/2155-buddy-adventure/
- [S9] Niantic Help Center, "Daily Bonuses". https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/105-daily-bonuses/
- [S10] Pokémon.com, "Pokémon Quest". https://www.pokemon.com/us/pokemon-video-games/pokemon-quest
- [S11] Android Authority, "Pokémon Quest review". https://www.androidauthority.com/pokemon-quest-review-881686/
- [S12] Polygon, "Should you spend money on Pokémon Quest?" (Jun 2018). https://www.polygon.com/guides/2018/6/5/17429544/pokemon-quest-guide-spend-money/

Research (verified in PR #292 unless noted):
- Mueller & Dweck (1998), *JPSP* 75(1), 33–52, https://doi.org/10.1037/0022-3514.75.1.33
- Cimpian, Arce, Markman & Dweck (2007), *Psychological Science* 18(4), 314–316, https://doi.org/10.1111/j.1467-9280.2007.01896.x
- Ryan, Rigby & Przybylski (2006), *Motivation and Emotion* 30(4), 347–363, https://doi.org/10.1007/s11031-006-9051-8
- Deci, Koestner & Ryan (1999), *Psychological Bulletin* 125(6), 627–668: a meta-analysis that found expected, tangible rewards reduce intrinsic motivation. Cited from memory in my earlier files, so please check the pages.

---

## Area by area

### 1. First session
- **They do well:** Pokémon GO spawns 3 famous starters right next to you, so your first catch happens at once in the real catch mode [S6]. Archero's first room is simple: move to dodge, stop to shoot automatically [S5].
- **We stand:** the tutorial floor gives the first Perfect Counter about 40 s after "Tap to start", it can't be lost, and there's a guaranteed Uncommon-or-better chest (M7-P2). The first floor ends with a simple card (K23).
- **Gap:** small. Our first win is as fast as theirs. GO lets you choose which starter to catch [S6]. Our first real choice (an Insight) is automatic on purpose until session 3 (decided).
- **Don't copy:** forced sign-up before you can play (criticised in [S6]).

### 2. Onboarding and teaching
- **They do well:** a mentor character (Professor Willow) turns pop-ups into a conversation [S7]. If you hold the ball without throwing, an inline cue shows the throw path, so teaching happens in context [S6]. Tapping a locked badge shows how to earn it [S6].
- **They do badly:** Willow's opening is a long run of modal speech bubbles (8 screens), which players tap through [S6, S7].
- **We stand:** Sensei teaches one system per session, there's the Lesson Scroll, tips wait for the player (K24a), locked ability cards say "Show Sensei {X} in class to unlock" (K22b), and the unlock schedule and Welcome Week are built (K19).
- **Gap:** we're already close to their best practice. What's missing: (1) a *timed idle* cue like GO's throw path in real fights after the tutorial (please check whether K24a already covers fights); (2) "how to earn" on every locked thing, not only abilities (trophies, decorations, Journal).

### 3. Reward moments
- **They do well:** in Archero, each level-up offers a choice of 3 abilities, which keeps every run different and the power curve exciting [S1, S4, S5]. Pokémon Quest shows its finds coming back to camp and being turned into something (cooking) [S10, S11].
- **We stand:** reward moments are sized by importance, the 4-step promotion ceremony is built, loot uses kid-friendly rarity names (K16), there's the Legendary frame, and Insights unlock at belt 2.
- **Gap:** the moment you bank a run's finds on returning home is quiet. That's covered for knock-outs by B-MASHER-d (#292), but not for a normal run end.
- **Don't copy:** Archero's spin-the-wheel minigame and gems for watching ads [S3]. Deconstructor of Fun says the abilities you build up in a run make paying to continue after death tempting, a "very strong monetisation hook" [S4]. Our knock-out always ends kindly with everything kept (#292).

### 4. Home loop
- **They do well:** Pokémon Quest's Base Camp is a calm, decoratable home where expedition finds become new friends. Cooking time is counted in expeditions, not real-time hours [S11]. GO's Buddy has a "Today's Activities" list with hearts that fill from gray to pink [S8].
- **We stand:** the Home Dojo has decorating, cleaning, the bow, Journal pages, the Training Board and "Your next goals" once a day (K20). Class pieces arrive every 2–3 classes (Decor earning).
- **Gap:** the next class piece is earned by real classes but isn't visible as progress ("2 more classes").
- **Don't copy:** Quest sells extra cooking pots, and the paid bundles alone give 4× faster collecting [S11, S12]. Some reward-boosting decorations are paid only [S12]. GO's Buddy mood "decreases over time", and the hunger meter runs down, so you have to keep feeding it [S8]. Our dojo never gets worse while you're away.

### 5. Reasons to come back
- **They do well:** GO gives the Buddy perks tied to real walking [S8], and Niantic says it's built to get people moving [Niantic dev notes, please check the link]. The real-world action is the source of power, which is our own principle.
- **We stand:** the Dojo Blessing after real class, Missions, three next goals, streaks that only count up or pause (decided), and the play-time limit.
- **Gap:** the class link exists but isn't shown much on the home screen between classes.
- **Don't copy:** GO's 7-day catch and spin streaks give a bigger bonus on day 7, and the count resets afterwards [S9]. Archero's energy (5 per run, 1 back every 12 min, refills bought or watched as ads) [S3, please check, as the numbers are from 2019]. Quest's battery charges, refilled with tickets [S12].

---

## Proposed board items

### L-PREMIUM-a: "How to earn it" on every locked thing — launch-polish
- **Idea:** every locked trophy, decoration slot and Journal card shows one plain line when tapped, using the same "Show Sensei {X} in class" or "Clear {floor}" templates as the locked ability cards. Copies GO's locked-badge hint [S6].
- **Helps:** points kids to real training. The curiosity about a locked thing becomes a class goal.
- **Evidence:** visible goals and the closest-goal line (L3 audit), which is design reasoning (WEAK). Competence support in games: Ryan, Rigby & Przybylski 2006 (MODERATE).
- **Cost:** small. **Owner:** Content Designer (lines), then Programmer.
- **Done when:** tapping any locked item in Trophies, Decorations or the Journal shows one line of 7 words or fewer, read aloud, with no "only" or "missing" wording.

### L-PREMIUM-b: Idle hint in real fights — launch-polish
- **Idea:** if a COUNTER-ready moment passes 3 times in one room with no tap, the COUNTER button gives one soft pulse plus the existing tip. It happens once per room, never in Challenge mode, and is off once the player has 3 Perfect Counters that run. Copies GO's idle throw-path cue [S6].
- **Helps:** teaches the real skill (Counter) to the kid bot style of player (#291), so they need the Mash guard less.
- **Evidence:** in-context teaching beats front-loaded tutorials (UX reviews [S6, S7], WEAK). Masher sim data in #291 (MODERATE for the need).
- **Cost:** small. **Owner:** Programmer, Tester.
- **Done when:** the kid bot sees at most 1 pulse per room, a smart bot sees none, and Reduced motion swaps the pulse for an outline.

### L-PREMIUM-c: A warm "finds come home" moment for every run — launch-polish
- **Idea:** reuse the B-MASHER-d arrival (#292) for every run end: the finds drop into the dojo with a soft bell, then one pointer line in the decided order (an upgrade ready, then real class, then the next run). One flow for all run ends.
- **Helps:** a calm end that points to class, not to another run.
- **Evidence:** process wording, not trait praise (Mueller & Dweck 1998, STRONG; Cimpian et al. 2007, MODERATE).
- **Cost:** small (shares the #292 build). **Owner:** Programmer, Artist (drop and settle frames).
- **Done when:** clearing, resting and knock-out all end in the same arrival. It's skippable with a tap and shows one line.

### L-PREMIUM-d: Class piece progress on the Home Dojo — post-launch proposal
- **Idea:** an empty display spot on the wall shows a soft outline and "2 more classes" until the next class piece arrives. Progress is counted in real classes, like Quest counts cooking in expeditions [S11]. There's no timer, and it never goes down.
- **Helps:** makes the link between real class and the game visible every day.
- **Evidence:** an expected tangible reward can reduce interest (Deci, Koestner & Ryan 1999, STRONG, please check pages). So the piece should stay a surprise of *which* piece, and the count should be shown softly, not as a task.
- **Cost:** medium. **Owner:** Programmer, Artist; Learning reviews the wording.
- **Done when:** the outline shows the right count from the fixtures, counts only up, and has no notification.

### L-PREMIUM-e: Sensei's "Today in the dojo" card, with no decay — post-launch proposal
- **Idea:** a small card like GO's "Today's Activities" [S8] showing 3 optional dojo things (bow, clean a spot, a run), each lighting up when done. Nothing ever dims, there's no mood or hunger, and nothing is held over to the next day.
- **Helps:** a gentle shape for a short visit. The bow ties into the creed recall (Proposal 2).
- **Evidence:** autonomy and competence support (Ryan et al. 2006, MODERATE). The no-decay rule comes from our own guidelines; risk of turning into a chore (WEAK, reasoning).
- **Cost:** medium. **Owner:** Researcher & Planner (spec), then Programmer.
- **Done when:** a playtest (Tester) shows kids don't describe it as "I have to". There's no reward for doing all 3, and no count of days.

---

## Questions for Jay
1. Should every locked trophy and decoration say how to earn it (item a), even if that spoils a few surprises?
2. Can the COUNTER button pulse once in a room if a young player keeps missing Counters (item b)? Or should hints stay only in the tutorial?
3. Should every run end with the same warm "finds come home" moment as the knock-out flow (item c)?
4. After launch, would you like the wall to show "2 more classes" toward the next class piece (item d)? Or should class pieces stay a full surprise?
5. After launch, is a "Today in the dojo" card with 3 optional things OK (item e), as long as it never dims, never counts days and gives nothing extra for doing all 3? Or does it feel too much like a daily chore?
