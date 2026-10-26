# L-PREMIUM-review: premium polish review (engagement)

## Delivery Note
- **ITEM:** L-PREMIUM-review.
- **WHAT:** I compared Dojo Ascent's first session, onboarding, reward moments, home loop and reasons to come back with **Archero** (Habby, mobile) and two mobile Pokémon titles: **Pokémon GO** (Niantic) and **Pokémon Quest** (Game Freak; mobile and Switch). I did not use Pokémon Café Mix/ReMix because I found no design write-up of it I could cite. For each area the review covers what those games do well (from cited reviews and help pages), where we stand (from `docs/progress.md`), the gap, and the dark patterns we must not copy. It ends with 5 proposed board items (L-PREMIUM-a to e) and questions for Jay.
- **WHY:** Players will compare us with these games. We can copy their polish (fast first win, a mentor character, clear "how to earn this", a warm home) without their pressure (energy timers, paid revives, 7-day streaks, mood decay, gacha).
- **Decided:**
  - a, b and c are approved as launch-polish (the Manager's call, Oct 26, because Jay didn't answer them separately).
  - e is approved by Jay (relayed by the Manager: "Sure, not a bad idea") and stays post-launch. It's not in core-design §13 launch scope, and the Manager decides when it's scheduled.
  - d is still waiting on Jay (question 4).
- **NEXT:** The Manager adds a, b and c to the work board in the build order below. e waits for post-launch scheduling, and d waits for Jay. No game code was touched.

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

## Board items (final)

**Build order:** a → b → c (c waits for #292 to be built: B-MASHER-d1) → later e (post-launch). d is on hold until Jay answers.
a and b don't depend on anything, so they can be built side by side.

### L-PREMIUM-a: "How to earn it" on every locked thing — APPROVED, launch-polish
- **Idea:** every locked trophy, decoration slot and Journal card shows one line when tapped, using the locked-ability templates ("Show Sensei {X} in class", "Clear {floor}"). Copies GO's locked-badge hint [S6].
- **Helps:** turns curiosity into a real-class goal.
- **Evidence:** Ryan, Rigby & Przybylski 2006 on competence support (MODERATE); the L3 closest-goal reasoning (WEAK).
- **Cost:** small. **Owners:** Content Designer (lines) → Programmer (build) → Tester.
- **Done when:** in a test over all 5 fixtures, every locked item in Trophies, Decorations and the Journal returns one non-empty hint line of 7 words or fewer, from content data. No line has "only", "missing" or "lost" (checked by a test). The line is read aloud on tap. Checked at 667×375 with no wrap past 2 lines.

### L-PREMIUM-b: Idle COUNTER hint in real fights — APPROVED, launch-polish
- **Idea:** after 3 missed Counter windows in one room (no Counter tap during a telegraph), the COUNTER button pulses once and the existing tip shows. It happens at most once per room, never in Challenge mode, and is off for the rest of the run after 3 Perfect Counters. Copies GO's idle throw cue [S6].
- **Helps:** teaches the real skill instead of leaning on the Mash guard.
- **Evidence:** UX reviews of in-context teaching [S6, S7] (WEAK); the masher sim data in #291 (MODERATE for the need).
- **Cost:** small. **Owners:** Programmer → Tester.
- **Done when:** a sim test shows the kid bot gets 1 or fewer hints per room and the smart bot gets 0 hints in 200 runs. Challenge mode gets 0 hints. Reduced motion swaps the pulse for a static outline. Tester confirms on a phone that the hint never covers the enemy's red circle.

### L-PREMIUM-c: "Finds come home" for every run end — APPROVED, launch-polish (depends on #292)
- **Idea:** reuse the B-MASHER-d Screen 3 arrival for every run end: the finds drop into the dojo with a soft bell, then one pointer line in the decided order.
- **Helps:** a calm end that points to class, not straight into another run.
- **Evidence:** Mueller & Dweck 1998 (STRONG for the effect); Cimpian et al. 2007 (MODERATE).
- **Cost:** small. **Owners:** Programmer → Artist (only if the drop frames are new) → Tester.
- **Depends on:** B-MASHER-d1 (#292) being built first. c reuses its arrival code and lines.
- **Done when:** clearing a floor, resting (the play-time limit or "Rest for now") and a knock-out all end in the same arrival component (one code path, checked by a test). It's skippable with a tap, shows exactly one pointer line, and skips the "Next run" pointer when the play-time limit is reached.

### L-PREMIUM-d: Class piece progress on the wall — WAITING ON JAY (post-launch proposal)
- **Idea:** an empty wall spot shows a soft outline and "2 more classes" until the next class piece. It counts only up and has no timer.
- **Evidence:** Deci, Koestner & Ryan 1999 (STRONG, please check pages). It warns against expected tangible rewards, so *which* piece arrives stays a surprise.
- **Cost:** medium. **Owners (if approved):** Programmer, Artist; Learning reviews the wording.
- **Done when (if approved):** the count matches the fixtures' classes to the next piece, never goes down, and sends no notification.

### L-PREMIUM-e: Sensei's "Today in the dojo" card — APPROVED by Jay, post-launch (the Manager schedules it)
- **Idea:** a small card with 3 optional dojo things (bow, clean a spot, a run) that light up when done. Copies GO's "Today's Activities" shape [S8] without its mood or hunger decay.
- **Required guardrails:** it never dims or gets worse; there's no day count or streak; there's no bonus for doing all 3; nothing carries over to the next day.
- **Evidence:** Ryan et al. 2006 (MODERATE); the risk that it turns into a chore is reasoning only (WEAK).
- **Cost:** medium. **Owners:** Researcher & Planner (spec) → Content Designer (lines) → Programmer → Tester.
- **Done when:** tests show no visual state that dims, no stored day count, and the same rewards whether 0 or 3 are done. A Tester playtest with kids aged 6–9 finds no child describes it as something they "have to" do.

## Questions for Jay
1. (Still open, item d) After launch, would you like the wall to show "2 more classes" toward the next class piece? Or should class pieces stay a full surprise?

Answered: a, b and c (approved by the Manager), and e (approved by Jay: "Sure, not a bad idea").
