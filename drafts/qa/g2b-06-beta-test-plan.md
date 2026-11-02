# G2B-06 Beta test plan (Batch 1 builds and the Green-to-Black rules)

## Delivery Note
- ITEM: R-G2B-06 (the user calls it G2B-06). Beta test plan for the Batch 1 builds. The plan file is `drafts/planning/R-GREEN-TO-BLACK.md` (PR #401, head 50b3cd1f).
- WHAT: 34 numbered cases (TC-01 to TC-34). Each has an id, a goal, setup (profile, `?difficulty`, `?room`, `?seed`), steps, an expected result, phone sizes and a motion setting. Cases that need **R-G2B-01** (Strike order) or **R-G2B-04** (thrown state) are tagged `RUN WHEN MERGED`: 10 cases, listed in the table below. The other 24 can run today on main.
- HOW IT WAS CHECKED: every case marked "seen on main 5003a7fb" was checked on 2026-11-01 with a scripted touch-input browser at 667x375 and 932x430. The text, numbers and row order quoted for them are what the screen showed. I did **not** run any case at 667x320, and nothing here was run on a G2B-01 or G2B-04 build (neither is merged).
- WHY: The beta is Dec 15, 2026, with 5-10 tester families, White to Orange only. This is the list a tester (or I) works through the day both items merge.
- DECIDE: (1) Where this file lives: the planning doc names `drafts/planning/R-G2B-test-plan-1.md`, but the Manager asked for `drafts/qa/g2b-06-beta-test-plan.md`; I used the second. (2) Whether TC-25 and TC-26 (design-rule sweeps) should also run on the beta build (`npm run build:beta`). They can't use URL flags there, so they need a saved profile; see the Rig. (3) TC-29 lists the Insight card "Shield Breaker" against the rule that "Break" is only for "Break Free"; the Learning Designer should rule.
- NEXT: Run the 24 "run today" cases now if wanted; run the 10 tagged cases after G2B-01 and G2B-04 merge. No game code was changed.

## Cases that wait on the two builds

| Waits on | Cases |
|---|---|
| R-G2B-01 (Strike #2 Jumping Spins, Butterfly Flow becomes #3, old `quick-combo` saves still load) | TC-01, TC-02, TC-03, TC-04, TC-05 |
| R-G2B-04 (thrown state, `counterThrow` #11, `downBonus` #12, brutes and swarmers only) | TC-06, TC-07, TC-08, TC-09, TC-10 |

TC-10 (Throw on all three difficulties) is also tagged `RUN WHEN MERGED (R-G2B-04)`; its callout-name step also needs R-G2B-02. Every other case runs today.

## Rig (read once)

**Build.** A DEV build (`npm run dev` in `apps/client`, or the Vite server). `window.game` exists only in DEV. `npm run build:beta` turns off every URL flag, the dev day offset and the testing screens. Cases that use flags (`?room=`, `?seed=`, `?difficulty=`) run on DEV. Cases marked **BETA BUILD** repeat on the beta build with a saved profile.

**Phone sizes.** S1 = 667x375, S2 = 932x430, S3 = 667x320. Use a touch device profile (device scale 1.5 is fine). Every case lists the sizes it needs.

**Motion.** RM off = `localStorage['dojo.reducedMotion'] = 'off'`; RM on = `'on'`. The Settings screen button "Reduced motion: Off/On" sets the same key.

**Choosing a profile (the real way).** On Home, tap the "Training Board" title 5 times within 2.5 s. Wait about 2 s. The Testing screen opens. Its six rows, top to bottom (seen on main 5003a7fb):

| Row | Text on the row | Fixture |
|---|---|---|
| R1 | White Belt: 0 of 7 signed off | `1-white-belt-new` |
| R2 | White Belt: 3 of 7 signed off, 1 stripe | `2-white-belt-3-signoffs` |
| R3 | Yellow Belt: 7 of 7 signed off, 1 stripe | `3-yellow-belt` |
| R4 | Green Belt: 3 of 7 signed off, 1 stripe | `4-green-belt` |
| R5 | White Belt: 0 of 7 signed off (age 6-9) | `5-white-belt-age-6-9` |
| R6 | Orange Belt: 3 of 7 signed off | `6-orange-typical` |

Tapping a row switches the profile and rebuilds Home (the screen closes; the "Close" button, top left, also closes it). On a Green profile the panel reads "Power Rating: 1560 / 4000", Sign-offs 1371 / 1600, Training Points 121 / 680, Virtues 50 / 400, Level 18 / 720, Gear 0 / 320. A tap on "Forget what I've seen (replay welcome)" replays the welcome. At 667x375 that row is cut off by the bottom edge; scroll the list first. You can also start with `localStorage['dojo-ascent-test-student'] = '<fixture>'` before the first load.

**Link flags** (DEV only): `?room=<id>` (White has its own `w-*` copies of rooms; Orange has its own `ember-pantry`, `oven-row`, `great-hearth` set), `?seed=<n>`, `?difficulty=guided|standard|challenge`, `?elite=swift|guarding`, `?twist=`, `?named=`, `?force=<attack>`, `?tutorial=1`, `?playlimit=`.

**Setting difficulty (the real way).** Home, "Dojo" (the "◀ Dojo" button), then the "Settings" tab. The cards say Guided, Steady (this is Standard), Challenge, under "How do you like to train?". "Done" (top right) closes it. The first Dojo visit of a profile stacks up to 3 welcome cards (buttons "Let's go!", "Okay!", "Bow"); tap through them.

**Difficulty numbers (`packages/sim/src/config.ts`).** Counter window: Guided 10 ticks, Standard 6, Challenge 4 (1 tick = 50 ms). Enemy power: Guided 0.75, Standard 1, Challenge 1. Wind-up never below 10 ticks. In DEV, read a live value with `game.scene.getScene('Game').world`.

**Perfect Counter timing.** Press COUNTER while an enemy in `windup` has `modeTicks` at or below the window for the difficulty. A tester without DEV tools: watch the enemy's tell fill, tap COUNTER in the last blink.

**Room ids used.** `bamboo-hall`, `narrow-bridge`, `shield-wall`, `gauntlet`, `brute-and-swarm`, `guarded-swarm`, `keepers-hall` (the Guardian room), `pillar-court`, `twin-shields`; White copies `w-*`; Orange `ember-pantry`, `oven-row`, `great-hearth`.

**Pass lines.** Each case ends with one pass line. A case fails if any listed text, number or behaviour differs, or if the page logs an error other than the three known static 404s that show on every load of main today.

---

## Group A: Strikes and the old save (R-G2B-01)

### TC-01 Yellow profile has two Strikes in order
- TAG: RUN WHEN MERGED (R-G2B-01)
- GOAL: Strike #1 is Spin Kick Finish and #2 is Jumping Spins for a Yellow student.
- SETUP: Profile R3 (Yellow). `?difficulty=standard&seed=7`. No `?room`.
- STEPS: 1. Open Home. 2. Tap Abilities, then "Fighting Style". 3. Read the "Always with you" row, left to right. 4. Tap each Strike icon and read its card.
- EXPECT: Exactly two Strikes, in the order Spin Kick Finish, Jumping Spins. Both cards have one short sentence. No Butterfly Flow.
- SIZES: S1, S2, S3. MOTION: off.

### TC-02 Orange profile has three Strikes in order
- TAG: RUN WHEN MERGED (R-G2B-01)
- GOAL: Strike #3 Butterfly Flow shows only from Orange.
- SETUP: Profile R6 (Orange). `?difficulty=standard&seed=7`.
- STEPS: Same as TC-01.
- EXPECT: Three Strikes in order: Spin Kick Finish, Jumping Spins, Butterfly Flow. Butterfly Flow's text still says each STRIKE costs 8 less Focus unless Content changed it.
- SIZES: S1, S2, S3. MOTION: off.

### TC-03 White profiles show no new Strike
- TAG: RUN WHEN MERGED (R-G2B-01)
- GOAL: The change leaves White Belt screens as they are today.
- SETUP: Profiles R1, R2 and R5. Take a baseline screenshot of "Always with you" on main 5003a7fb first.
- STEPS: 1. For each profile open Abilities then Fighting Style. 2. Compare with the baseline.
- EXPECT: No Strike row differences. No Jumping Spins or Butterfly Flow for White.
- SIZES: S1, S2. MOTION: off.

### TC-04 An old save that holds `quick-combo` still loads
- TAG: RUN WHEN MERGED (R-G2B-01)
- GOAL: `quick-combo` (the old id of Butterfly Flow) never crashes or drops a Strike.
- SETUP: On main 5003a7fb, pick R6, play one room, close. Keep that browser storage. Then load the G2B-01 build on the same origin and storage. A second copy: edit `dojo-ascent-profile-v1` so a saved list holds `"quick-combo"`.
- STEPS: 1. Open the new build. 2. Pass the title. 3. Open Home, Abilities, Fighting Style. 4. Enter the Tower, clear room 1.
- EXPECT: No error in the console. The student keeps the same belt, level and Strikes. Butterfly Flow shows once, as #3. The run starts.
- SIZES: S1. MOTION: off.

### TC-05 Jumping Spins works in a fight
- TAG: RUN WHEN MERGED (R-G2B-01)
- GOAL: The new Strike fires, spends Focus and hits.
- SETUP: Profile R3. `?room=bamboo-hall&seed=7&difficulty=guided`.
- STEPS: 1. Bow, then fight until Focus is full. 2. Tap STRIKE. 3. Watch the enemies near the hero.
- EXPECT: The STRIKE plays its animation, Focus drops, enemies near the hero take damage, no console error, 
- SIZES: S1, S2. MOTION: off, then on (no shake and no sparkles with on).

## Group B: Throw (R-G2B-04)

### TC-06 Perfect Counter with Throw throws a brute
- TAG: RUN WHEN MERGED (R-G2B-04)
- GOAL: Seal #11 (`counterThrow`) throws a brute.
- SETUP: Profile R6 with seal #11 owned (use the build's test hook or the profile that has it). `?room=brute-and-swarm&seed=7&difficulty=standard`.
- STEPS: 1. Bow. 2. Wait for the brute's wind-up. 3. Tap COUNTER inside the Standard window (6 ticks). 4. Watch the brute for 2 seconds.
- EXPECT: The brute tumbles away and is down for a short set time, then gets up (distance and time as in the G2B-04 spec). Nothing else is thrown by mistake.
- SIZES: S1, S2, S3. MOTION: off.

### TC-07 Down bonus (#12)
- TAG: RUN WHEN MERGED (R-G2B-04)
- GOAL: A thrown enemy takes the extra hit while it is down.
- SETUP: As TC-06 with seals #11 and #12.
- STEPS: 1. Throw a brute. 2. Hit it while down with STRIKE. 3. Hit a standing brute once the same way.
- EXPECT: The hit on the downed brute is larger than on the standing one. Both numbers or health bars agree with the card text.
- SIZES: S1, S2. MOTION: off.

### TC-08 A Guardian is never thrown
- TAG: RUN WHEN MERGED (R-G2B-04)
- GOAL: Bosses ignore the Throw.
- SETUP: As TC-06. `?room=keepers-hall&seed=7`.
- STEPS: 1. Bow. 2. Counter the Guardian's wind-up 3 times with a Perfect Counter.
- EXPECT: The Guardian is staggered by the normal counter and is never thrown or knocked down.
- SIZES: S1. MOTION: off.

### TC-09 Elites are never thrown
- TAG: RUN WHEN MERGED (R-G2B-04)
- GOAL: Elites ignore the Throw.
- SETUP: Profile R4 (Green). Standard. `?room=guarded-swarm&elite=swift&seed=7`, then again with `elite=guarding`.
- STEPS: 1. Perfect Counter the elite 3 times.
- EXPECT: The elite never tumbles. A plain swarmer in the same room can be thrown.
- SIZES: S1. MOTION: off.

### TC-10 Throw reads the same on all three difficulties
- TAG: RUN WHEN MERGED (R-G2B-04) for the Throw steps; the callout step also needs G2B-02 names.
- GOAL: Difficulty changes only the counter window, not the Throw.
- SETUP: Profile R6 with #11. `?room=brute-and-swarm&seed=7`, once each with `difficulty=guided`, `standard`, `challenge`.
- STEPS: 1. Throw one brute per run. 2. Time the down state with a stopwatch (about the same for all). 3. Read any callout text that shows.
- EXPECT: Same tumble distance and down time on all three. The callout name equals the name in the seal text, is under one line on S3, and is not clipped.
- SIZES: S1, S2, S3. MOTION: off.

## Group C: Green-to-Black progression

### TC-11 Green profile Home is right
- TAG: runs today (seen on main 5003a7fb)
- GOAL: A Green student sees their own belt and next step.
- SETUP: Profile R4. No flags.
- STEPS: 1. Open Home. 2. Read the left card, then the Gate tab.
- EXPECT: "Kai M.", "Green Belt  ·  1 stripe", Level 1 of 40, "The Gate to Blue Belt", "3 of 7 locks lit. A real promotion opens the Gate.", ticks on David and Goliath, Defense #16 and #17; locks on Defense #18, #19, #20 and Kick 4. "YOUR NEXT STEP": "Self-Defense #18". "Classes done 15 of 24". "Sensei's Seal: Lit when Sensei says you're ready." Buttons "ENTER THE TOWER" and "Practice room".
- SIZES: S1, S2, S3. MOTION: off.

### TC-12 Trophy Case matches the Green belt
- TAG: runs today
- GOAL: The Trophy Case shows what a Green student has learned and what is next, with no prices.
- SETUP: Profile R4.
- STEPS: 1. Abilities, then Trophy Case. 2. Page through all pages with the arrows.
- EXPECT: Read it against the Green list in `fixtures/4-green-belt.json`: things this student has are ticked and the rest say they are for the dojo. Take screenshots of every page as the Green baseline. No money, price or "buy" on any page.
- SIZES: S1, S2. MOTION: off.

### TC-13 Stances and virtues at Green
- TAG: runs today (stance order seen on main 5003a7fb)
- GOAL: The Fighting Style page lets a Green student see the stances and virtues.
- SETUP: Profile R4.
- STEPS: 1. Fighting Style. 2. Tap the Stance card, then page through the stance arrows. 3. Tap the Virtue card and page through.
- EXPECT: Stances in this order: Beginner's, Open Leg, Front, Fighting, Horse, Cat. Virtues: Shield of Respect first, then the other two. "Everyone starts here." shows on Beginner's Stance. The helper line reads "Tap a card, then tap a pick." and "You can still switch Stance during a fight." Each detail card is 1-2 short sentences.
- SIZES: S1, S2. MOTION: off.

### TC-14 Belt Gate and next-belt line
- TAG: runs today
- GOAL: The Gate never promises a promotion the game can give.
- SETUP: Profiles R3 (Yellow, 7 of 7), R4, R6.
- STEPS: 1. Open the Gate tab for each. 2. Read the title, the count and the locks.
- EXPECT: R3: "The Gate to Orange Belt" with all locks lit. R4: as TC-11. R6: "The Gate to Green Belt". Each screen says a real promotion opens the Gate and "Lit when Sensei says you're ready." for the seal. No button in the game promotes the student.
- SIZES: S1, S2, S3. MOTION: off.

### TC-15 Challenge card is locked below Green
- TAG: runs today (code and card read on main)
- GOAL: A White, Yellow or Orange student sees Challenge locked, with a kind line.
- SETUP: Profiles R1, R3, R6. Settings.
- STEPS: 1. Home, Dojo, Settings tab. 2. Look at the Challenge card. 3. Tap it. 4. Tap it again with RM on.
- EXPECT: Dimmed, with a lock, and the line "Opens when you earn your Green Belt!" (belt name filled in). Tapping makes a soft sound and a pulse of the line, and a small shake only with RM off. It never selects. Steady shows as selected.
- SIZES: S1, S2, S3. MOTION: off, then on.

### TC-16 Challenge opens at Green
- TAG: runs today (seen on main 5003a7fb)
- GOAL: Green sees all three cards unlocked and a pick sticks.
- SETUP: Profile R4. Settings.
- STEPS: 1. Open Settings. 2. Tap Challenge, then Done. 3. Reopen Settings. 4. Reload the page and look again.
- EXPECT: Cards read "Guided: More time to COUNTER while you learn." / "Steady: The usual pace." / "Challenge: Faster enemies and less time to COUNTER." No lock. After the pick, Challenge shows the tick. It stays after the reload. The first run shows `difficulty: challenge` in DEV.
- SIZES: S1, S2, S3. MOTION: off.

### TC-17 A Challenge link wins at any belt
- TAG: runs today
- GOAL: `?difficulty=challenge` plays as Challenge even on a White profile.
- SETUP: Profile R1. `?difficulty=challenge&room=bamboo-hall&seed=7`.
- STEPS: 1. Bow. 2. Check the world difficulty in DEV and watch the first wind-up.
- EXPECT: `world.difficulty` is `challenge`, window 4 ticks, wind-up at least 10 ticks. Note whether Settings shows Challenge locked or ticked, and whether the link choice is saved after a reload (write the answer down; the code treats a link as a test override).
- SIZES: S1. MOTION: off.

### TC-18 Elites and the 4th belt
- TAG: runs today
- GOAL: Elites show from Green and not before.
- SETUP: Profiles R6 (Orange) and R4 (Green). `?seed=7`, three runs each, difficulty Standard, clear 4 rooms per run.
- STEPS: 1. Note any room that shows an elite marker or name. 2. Repeat on another seed.
- EXPECT: Orange: no natural elite in 12 rooms (elites start at belt 4, `minBeltTier` in `content/elites`). Green: elites can appear; Guarding elites never on Guided and never on the first floor of the belt. With `?elite=swift` or `guarding` the elite shows at either belt (a test link).
- SIZES: S1. MOTION: off.

### TC-19 Green plays on the shared rooms
- TAG: runs today (seen on main 5003a7fb)
- GOAL: Record what a Green run uses today, so Batch 2 can compare.
- SETUP: Profile R4, Standard, `?seed=7`.
- STEPS: 1. Play the first 4 rooms. 2. Note each room id and enemy.
- EXPECT: Rooms `bamboo-hall`, `shield-wall`, `gauntlet` and the other shared rooms with swarmer, brute and shield enemies; no Orange room names. This is the baseline; a change after G2B-07 is expected, not a failure.
- SIZES: S1, S2. MOTION: off.

## Group D: Difficulty settings

### TC-20 Counter window per difficulty
- TAG: runs today
- GOAL: The windows are 10, 6 and 4 ticks.
- SETUP: Profile R4. `?room=bamboo-hall&seed=7`, once per difficulty by link.
- STEPS: 1. In DEV read `world.difficulty` and the enemy `windupTotal` when a wind-up starts. 2. Press COUNTER with the delay in the Rig.
- EXPECT: Guided accepts a counter at `modeTicks` up to 10; Standard 6; Challenge 4. Every `windupTotal` is at least 10 ticks on all three.
- SIZES: S1. MOTION: off.

### TC-21 Guided hits for less
- TAG: runs today
- GOAL: Guided enemies deal 0.75 of the Standard damage.
- SETUP: Profile R4. `?room=bamboo-hall&seed=7`. One run on Standard, one on Guided. Do not press COUNTER.
- STEPS: 1. Let the first swarmer hit land. 2. Read the health bar change, or `players.p1.health`.
- EXPECT: The Guided hit is about 75% of the Standard hit. Same room, same seed, same first enemy.
- SIZES: S1, S2. MOTION: off.

### TC-22 Guided offer after two lost runs
- TAG: runs today
- GOAL: A kind offer shows once a day and never mentions losing.
- SETUP: Profile R2. Standard. `?room=gauntlet`. Lose twice in a row on the same floor (let health run out).
- STEPS: 1. After the 2nd loss go Home. 2. Read the offer. 3. Tap "No thanks". 4. Lose twice more the same day.
- EXPECT: Title "Want more time to COUNTER?", line "Try Guided, and change it any time in Settings.", buttons "Try it" and "No thanks". No word loss, fail or lose. It does not return on the same day. "Try it" switches to Guided and Settings shows Guided ticked.
- SIZES: S1, S2, S3. MOTION: off.

### TC-23 Difficulty survives a close and shows its line once
- TAG: runs today (line seen on main 5003a7fb)
- GOAL: A choice is kept, and the "You're on ..." line shows only once ever.
- SETUP: Profile R4.
- STEPS: 1. On the first Dojo visit read the line "You're on Steady, and you can change it in Settings." 2. Pick Guided. 3. Close the tab, reopen, go to the Dojo.
- EXPECT: The line shows once only, never again. Guided is still ticked.
- SIZES: S1, S2. MOTION: off.

### TC-24 Difficulty feel at Green (play notes)
- TAG: runs today
- GOAL: Check the three difficulties feel different but fair for the same Green student.
- SETUP: Profile R4. `?seed=7`. Play 3 rooms on each of Guided, Standard and Challenge, with a tester who counters about half the time.
- STEPS: 1. After each room write health left, time, counters landed. 2. Compare.
- EXPECT: Guided is the kindest and Challenge asks for more skill. No difficulty has a 1-hit loss, and none can be passed without COUNTER being useful. Write any difficulty that feels the same as another as a finding.
- SIZES: S1, S2. MOTION: off.

## Group E: Design rules

### TC-25 No Power Rating outside the testing screen
- TAG: runs today (seen on main 5003a7fb: "Power Rating: 18 / 1000" shows only on the Testing screen)
- GOAL: Players never see the rating.
- SETUP: Profiles R1, R4, R6. Also on the **BETA BUILD** with a saved profile (no testing screen exists there).
- STEPS: 1. Visit Title, Create, Dojo, Home (4 tabs), Settings, For grown-ups, Town, a full run, the Insight pick, results. 2. On each screen list all visible text (DEV: scan Phaser Text objects). 3. Search for "Power Rating", "/ 1000" and "rating".
- EXPECT: No match anywhere. Item stats like "+20% Power" and the word Power on a hero stat are allowed. On the beta build, five taps on the title do nothing.
- SIZES: S1, S2. MOTION: off.

### TC-26 No purchases, ads, chat or guilt
- TAG: runs today
- GOAL: Nothing to buy, no ads, no chat, no loot boxes, no pressure.
- SETUP: Profiles R1, R4. Also on the **BETA BUILD**.
- STEPS: 1. Sweep every screen from TC-25. 2. Search text for `$`, buy, price, gems, coin pack, ad, watch, chat, message, friend, chest, "don't miss", "streak", "you missed". 3. In DevTools Network, watch all requests while playing 2 rooms.
- EXPECT: No match. All network requests are to the app's own origin. No third-party scripts.
- SIZES: S1. MOTION: off.

### TC-27 Real training is the main source of power
- TAG: runs today (numbers seen on main 5003a7fb)
- GOAL: The Testing screen shows training is the larger part of strength, and play alone cannot buy it.
- SETUP: Profiles R1, R2, R3, R4, R6. Open the Testing screen for each.
- STEPS: 1. Write down the rows Sign-offs, Training Points, Virtues, Level, Gear for each profile. 2. For R4, play 3 rooms, reopen the Testing screen and read the rows again (use Profile R4's saved data, not a fresh one).
- EXPECT: The shares in `config.ts` are Sign-offs 40%, Training Points 17%, Virtues 10% (together 67% of the belt's max; the max is 1000 at White and 4000 at Green), Level 18%, Gear 8%, Street Smarts 5% and Mastery 2% (the last two say "not built yet"). On R4 today: Sign-offs 1371 / 1600, Training Points 121 / 680, Virtues 50 / 400, Level 18 / 720, Gear 0 / 320, total 1560 / 4000. Three played rooms may move Level and Gear but must not move Sign-offs, Training Points or Virtues. No screen in play lets a student buy points.
- SIZES: S1, S2. MOTION: off.

### TC-28 Cosmetics are never bought
- TAG: runs today
- GOAL: Decorations and looks only come from play.
- SETUP: Profile R4. Dojo, then Decorate and Look.
- STEPS: 1. Open the Decorate and Look tabs. 2. Tap a locked item. 3. Read every line.
- EXPECT: Every unlock is earned by play (the game's sources are starter, tower, named monster, random, class, keeper, trophy, bonus). No price, no coin count, no "buy".
- SIZES: S1, S2, S3. MOTION: off.

### TC-29 Word check
- TAG: runs today
- GOAL: "Break" only inside "Break Free"; no injury words.
- SETUP: Profiles R1, R3, R4, R6.
- STEPS: 1. Collect all on-screen text for Home, Abilities, Fighting Style, Settings, Insight cards, run HUD, results. 2. Search for break, broke, hurt, injur, kill, die, dead, blood, fail.
- EXPECT: No "break" outside the phrase "Break Free" (not in the game yet). Shield enemies say "Shield Breaker" in an Insight card today; list it as a finding for the Learning Designer to rule on (the rule says "Break" only in "Break Free"). No injury words.
- SIZES: S1. MOTION: off.

## Group F: Age 6 clarity and returning play

### TC-30 A 6-year-old can start a run
- TAG: runs today
- GOAL: A child aged 6-7 reaches their first Perfect Counter with only the on-screen help.
- SETUP: Profile R5. Tutorial on (`?tutorial=1`), Guided, S1.
- STEPS: 1. Hand the phone to a 6-7-year-old with a grown-up watching. 2. Say nothing except "play". 3. Record time to first Perfect Counter and every spot where they stop.
- EXPECT: Under 60 s to the first Perfect Counter. Every screen has one short sentence. Buttons are at least 44 px high. They can find COUNTER without help. Note any stop, any screen they could not read, any button they did not tap.
- SIZES: S1, S3. MOTION: off, then on.

### TC-31 Settings and difficulty without reading
- TAG: runs today
- GOAL: A young player can leave Settings and pick Guided.
- SETUP: Profile R5. Dojo, then Settings.
- STEPS: 1. Ask the child to "make it easier". 2. Then ask them to leave the screen.
- EXPECT: They tap the Guided card ("More time to COUNTER while you learn.") and "Done" in the top right. The "For grown-ups" button asks a simple sum first, so a child cannot open it by accident (do not solve it for them).
- SIZES: S1, S2, S3. MOTION: off.

### TC-32 Returning after a break
- TAG: runs today
- GOAL: A student who comes back after days finds a calm, kind screen.
- SETUP: Profile R4. After a run, set `localStorage['dojo-ascent-dev-day-offset']` to 3, then 8, then reload.
- STEPS: 1. Open Home each time. 2. Read every line. 3. Tap "Last run". 4. In the Testing screen tap "Forget what I've seen (replay welcome)", return Home.
- EXPECT: No streak, no missed-day text, no countdown, no reward for being back and none taken away. "Last run" shows the earlier run. After "Forget", Sensei's welcome plays once and is skipped on the next open.
- SIZES: S1, S2. MOTION: off.

### TC-33 Reduced motion keeps wind-ups readable
- TAG: runs today
- GOAL: With RM on there is no shake, sparkle or flash, but the wind-up tell is still clear.
- SETUP: Profile R4. `?room=bamboo-hall&seed=7&difficulty=challenge`. RM on.
- STEPS: 1. Bow. 2. Watch 3 wind-ups. 3. Take a screenshot at a wind-up. 4. Repeat with RM off and compare.
- EXPECT: RM on: no screen shake, sparkles, dash trail or flashes. The wind-up shape is the same size and colour as RM off, and a 10-tick wind-up still reads at S3. COUNTER still works.
- SIZES: S1, S2, S3. MOTION: on, then off.

### TC-34 The seed repeats
- TAG: runs today
- GOAL: A test link gives the same room twice.
- SETUP: Profile R4. `?seed=7&room=narrow-bridge`.
- STEPS: 1. Open, Bow, note the enemy kinds and positions at tick 0. 2. Reload and repeat.
- EXPECT: Same room, same enemies, same positions.
- SIZES: S1. MOTION: off.
