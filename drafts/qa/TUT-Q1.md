# TUT-Q1: Tutorial timing (before and after)

The before-timing of the old floor is unchanged below. The after-timing of the new tutorial on main `36efd186` is in [After (main 36efd186)](#after-main-36efd186).

## Delivery Note

- **ITEM:** TUT-Q1 (before-run). Work board commit 1f50a451. Owner: Game Logic/systems Tester.
- **WHAT:** Timed today's tutorial on the live main build, in seconds per TUT-P1 beat, and noted stuck spots for a new 6-year-old.
- **WHY:** TUT-P1 needs a real before, so the after-run (once TUT-B3 lands) can pass or fail against the targets ±30%.
- **DECIDE:** This is a baseline, not a pass or fail of the new tutorial. Today's floor is short (median 1 min 35 s, range 1:33–2:19) and still leads with "wait for the warning and tap COUNTER." First Counter is at 12–43 s (median 20 s), well under the old two-minute rule and the five-minute rule.
- **NEXT:** After TUT-B3, time the new tutorial on Guided and Standard, same beats, and pass or fail against TUT-P1 targets ±30%.

## Build

- Live main: https://dojo-ascent.jay-lindemuth.workers.dev/
- **BUILD_TIME:** `2026-11-17T04:50:38.314Z` (Nov 16, 11:50:38 PM ET), bundle `index-DyTHfi32.js`. That matches the Version stamp on pass 3. Passes 1 and 2 showed Version: Nov 16, 11:46 PM ET.
- **Commit:** `d55704f` (L11-S, #528), which already includes #516 (`a3f3a34`). That docs commit does not change the tutorial floor. Later main commits from 11:51 PM ET on were not yet live during these passes.

## Method

- Fresh Playwright contexts and a fresh new-player save. Profile: Mia, ages 6–9, Guided (fixture `5-white-belt-age-6-9`).
- Viewports 667×375 and 932×430. Reduced motion On and Off, read back from `dojo.reducedMotion` in each context (on / off / on). Settings was not opened after the floor; the Floor cleared card covers the Dojo.
- Three timed passes. The clock starts at the Bow prompt, after Title and Create (those are setup, not in the total).
- Pass 1: ideal player, 667×375, Reduced motion On, 92.6 s.
- Pass 2: kid-like player (short pauses, a missed glow, a wrong tap on the first COUNTER), 667×375, Reduced motion Off, 138.8 s.
- Pass 3: ideal player, 932×430, Reduced motion On, 95.3 s.
- Screenshots of each beat and each stuck spot are on the QA box at `/workspace/evidence/tutq1/` (not in this PR). Game code was not changed.

## Per-beat times

Times are wall-clock seconds from the Bow prompt, rolled up to the beats TUT-P1 defines. Median and range are across the three passes. Beats that do not exist on today's floor are 0 s.

| Beat | What the player does today | Seconds | Notes |
|---|---|---|---|
| 0 Story opening | Nothing. This beat is not on today's floor. | 0 | Absent. Target for the new opening is 20–30 s. |
| 1 The path / Move | Tap Got it, walk to the glowing spot, then walk around for the space tip. | **5.8 s** (4.3–13.9) | Today this is walk + space. Target for the new path is 15–20 s. |
| 2 Falling stones | Nothing. This beat is not on today's floor. | 0 | Absent. Target 45–60 s. |
| 3 Bow | Bow at the door. Today this comes first, before the walk. | **1.9 s** (1.9–6.2) | Target 10 s. The kid-like pass tapped the floor once before bowing. |
| 4 Practice dummies | Nothing taught as its own beat. Auto-attack just happens. | 0 | Absent. Target 30–45 s. |
| 5 Big dummy / STRIKE | Not taught here. | 0 | Strike is taught later, in beat 10, when Focus fills in the Keep. Target 15–20 s. |
| 6 Swarmers | Tap Got it, then fight the wave (3 Swarmers; a leftover Brute can still be up). | **17.1 s** (14.6–17.3) | Target for 2 Swarmers is 30–40 s. Today's wave is bigger. |
| 7 Brute / COUNTER | First Brute (guided Counter), the warning tip, then the leftover / tough Brute. | **28.1 s** (23.9–44.7) | This is today's first fight. Time to first Counter from clock start: **19.9 s** (11.5–43.0). Target for the new Brute beat is 40–60 s, and it is meant to come later. |
| 8 Crowd / DASH | Space tip, then the DASH tip. | **7.0 s** (6.2–17.0) | On both ideal passes the DASH tip appeared after the wave was already dead (~1 s of the dash step; no need to actually dash). The kid-like pass did use the cue (8.3 s for that step). Target 30–45 s. |
| 9 Rewards / chest / Insight | Tap the Insight, then open the chest. | **14.9 s** (14.7–18.6) | Includes mopping up leftover hall enemies before the vault. Target 30 s. |
| 10 Floor Keeper | Fight the Keeper. Strike is taught when Focus fills. | **18.8 s** (18.1–21.7) | Target 60–90 s. Today's Keeper is short. Strike lesson at 75–125 s from clock start (median 82 s). |
| 11 Story close / door home | Walk into the HOME door. | **2.4 s** (2.1–5.0) | No story wrap. The "door home is open" Got it tip often never shows. Target 10–15 s. |

**Total (Bow to Home): median 95.3 s (1 min 35 s), range 92.6–138.8 s (1:33–2:19).**

TUT-P1's target for the new tutorial is about 6–8 minutes. Today's before is much shorter.

## Stuck spots

1. **High — first Brute, no new line.** After the space tip succeeds, a Brute is already in the room and Sensei still says "Lots of room to move!" Nothing new is said until the red circle / yellow ! and "Look! A red circle. It's coming!" A new 6-year-old does not know to wait and tap COUNTER. This is the stall Jay described: "wait till you see a yellow ! and hit block." Shot: `p1-ideal-667-on-beat7-tutorial-brute.png`.

2. **Medium — first COUNTER, wrong button.** On the kid-like pass, the first cue was up (red circle, COUNTER pulsing) and the player tapped STRIKE and the floor first. COUNTER is one of three round buttons. Shot: `p2-kid-667-off-stuck-wrong-button-on-counter.png`.

3. **Medium — door home is easy to miss.** After the Keeper falls, Sensei says "You stayed calm. Well done!" The exit is a small HOME door at the top of the Keep. The tip "The door home is open" often never appears (the doors-open event can fire before the boss step is marked done). Walking in still works. A 6-year-old may stall here. Shots: `p1-ideal-667-on-beat11-tutorial-door.png`, `p1-ideal-667-on-stuck-tutorial-door-boss-ready.png`.

4. **Mild — glowing walk spot.** A kid can tap the floor away from the glow first. Shot: `p2-kid-667-off-stuck-missed-glow.png`.

5. **Mild — first Bow.** A kid can tap the floor before finding the bow.

Not a stall for a slower player, but a gap: a fast player can see the DASH tip and never have to dash, because the wave is already gone.

## Kid read

**Age 6.** You bow, walk to a shiny spot, then a big enemy is already there. The game still talks about walking. Then a red circle shows up, and you have to find the blue COUNTER button in time. That is the hard part. After the last fight, look up for the little door that says HOME.

**Age 12.** The floor is short, about two minutes if you know what to tap. The first real lesson is Counter, and it comes before you have won anything. Dash can be skipped if you clear the room too fast. The home door is easy to miss if you stay mid-room.

**Adult.** Today's tutorial is a compressed combat lesson, not the 6–8 minute story-led path in TUT-P1. Beats 0, 2 and 4 are missing. Bow is first. Counter is the first fight, at about 20 seconds. Strike is taught on the Floor Keeper. There is no story close. The two real stalls for a new 6-year-old are the silent Brute after the walk lesson, and the weakly cued HOME door.

---

## After (main 36efd186)

### Delivery Note

- **ITEM:** TUT-Q1 after timing. Owner: Game Logic/systems Tester.
- **WHAT:** Timed the new tutorial (TUT-P1 beats 0–11, as shipped in TUT-B3/B4) on the live main build, on Guided and Standard, with clean and kid-like bot play at phone sizes. Compared those times to the TUT-P1 targets ±30% and to the before numbers above.
- **WHY:** TUT-Q1 is done when we have both timings and a pass or fail against the targets.
- **DECIDE:** Against TUT-P1's targets ±30%, the measured times **fail short** on the total and on most beats. A clean bot finishes in about 2 min 34 s, and a kid-like bot (read pauses, a missed walk, a missed Bow, a wrong first COUNTER) finishes in about 3 min 22 s. The 6–8 minute target, even with the ±30% floor of 4 min 12 s, is not met by any measured run. The new floor does fix the old shape: every beat 0–11 is present, Counter is no longer the first fight, and time to first Counter is about 1 min 29 s (clean) or 2 min 6 s (kid-like bot), well under five minutes. Guided and Standard are the same length here. The top new stuck spot is the HOME door sitting off-screen above a mid-room Keep chest. A real 6-year-old estimate (not measured) is about 5–6 minutes if they keep moving, or up to the 6–8 minute target if they stall on COUNTER or the unseen door.
- **NEXT:** The Manager decides whether 6–8 minutes is still the bar, whether the HOME door needs an on-screen cue, and whether the opening Sensei line may keep sharing one card with the path tip (the close already stays one card).

### Build

- Live main: https://dojo-ascent.jay-lindemuth.workers.dev/
- **BUILD_TIME:** `2026-11-17T09:57:07.720Z` (Nov 17, 4:57:07 AM ET), Version: Nov 17, 4:57 AM, bundle `index-DeBDJLGg.js`.
- **Commit:** `36efd186` (TUT-B4, #537), authored at `2026-11-17T09:56:02Z` (Nov 17, 4:56:02 AM ET). BUILD_TIME is after that commit. Timed on Nov 17, 5:05–5:45 AM ET.

### Method

- Fresh Playwright contexts and a fresh new-player save on every pass. Real taps only (no teleport). Title and Create are setup and are not in the clock.
- The tutorial clock starts at the first story card. Bow-to-Home is also recorded so it can be compared with the before total (the before clock started at the Bow prompt, which was then the first beat).
- **Guided:** fixture `5-white-belt-age-6-9` (Mia, ages 6–9). **Standard:** fixture `1-white-belt-new` (Sam, ages 10–13, starts Steady). Difficulty was read back from the run on every pass and matched the fixture.
- Viewports 844×390 and 667×375. Reduced motion On and Off, read back from `dojo.reducedMotion`.
- Ten full-floor bot passes: three Guided clean, three Guided kid-like, two Standard clean, two Standard kid-like. All ten reached Home.
- Clean play taps promptly (~0.5–0.7 s on cards and tips) and dodges every stone wave.
- Kid-like full-floor play waits ~3.8 s on each story card and ~3.2 s on each Got it, taps away from the glowing path spot once, taps the floor before Bow once, and taps STRIKE and the floor on the first COUNTER cue. Those full-floor kid-like passes did **not** actually miss the stones (the bot still walked out of the red). Two-miss stone times were measured in three dedicated bot runs instead.
- Three dedicated 2-miss stone timings (Guided 667, Guided 844, Standard 667): stand in wave 0 until two misses and the help arrow, then dodge the rest.
- Screenshots of each beat and each stuck spot are on the QA box at `/workspace/evidence/tutq1-after/` (not in this PR). Game code was not changed.

### Which times are bot, and which are kid estimates

Every number in the tables below is a **bot measurement**, stopwatch from the live build.

- **Clean bot** is a lower bound: a player who already knows what to tap and never misses.
- **Kid-like bot** adds read pauses and a few scripted mistakes, but it still finds buttons and pathing quickly after those pauses, and in the full-floor runs it still dodged every stone. Those times are not real-kid times.
- **Dedicated 2-miss stone times** are also bot measurements.
- **Kid estimates** are called out in their own section. They were not used for the pass/fail.

### Per-beat times

Times are wall-clock seconds from the first story card to Home, split on the TUT-P1 beats. Median and range are across the full-floor passes in that group. Beat 0 includes the four opening cards and the shared opening-plus-path Got it card (see stuck spots). Beat 1 starts after that Got it, when the kid walks. Beat 2 in the full-floor table is clean dodges plus, for kid-like, a longer tip read — not two misses. The 2-miss stone time is in a note under beat 2.

±30% around a target of *lo–hi* is `0.7×lo` to `1.3×hi`. For a single-number target (Bow 10 s, Rewards 30 s), that is 7–13 s and 21–39 s. For the 6–8 minute total, ±30% is 4 min 12 s–10 min 24 s.

| Beat | Target | Guided clean (bot) | Guided kid-like (bot) | Standard clean (bot) | Standard kid-like (bot) | Notes |
|---|---|---|---|---|---|---|
| 0 Story opening | 20–30 s | **6.4 s** (6.4–6.6) short | **21.4 s** (21.3–21.6) in ±30% | **6.5 s** (6.5–6.5) short | **21.6 s** (21.5–21.7) in ±30% | Four cards, then one shared Got it with the path tip. Kid-like read pauses bring this into the target. Before: absent (0 s). |
| 1 The path / Move | 15–20 s | **3.5 s** (3.5–3.6) short | **6.0 s** (6.0–6.1) short | **3.6 s** (3.6–3.6) short | **6.0 s** (6.0–6.0) short | Walk to the glowing spot. Short even with a missed first tap. Before (old walk + space tip): 5.8 s (4.3–13.9). |
| 2 Falling stones | 45–60 s | **36.0 s** (35.9–36.8) in ±30%, under 45–60 | **39.0 s** (38.6–39.2) in ±30% | **36.0 s** (36.0–36.1) in ±30%, under 45–60 | **39.3 s** (38.8–39.8) in ±30% | Full-floor runs are clean dodges (wave time ~34.5–35.6 s, plus the tip). TUT-B4 retuned this toward 30–60 s kid-like. Dedicated 2-miss bot runs: **48.2 s** (48.2–48.5) for the waves themselves, in the 45–60 target; plus the tip that is about 49–53 s for the whole beat. Before: absent (0 s). |
| 3 Bow | 10 s | **5.3 s** (5.3–5.3) short | **8.9 s** (8.9–9.0) in ±30% | **5.3 s** (5.3–5.3) short | **9.0 s** (8.9–9.0) in ±30% | Includes the short walk into the Training Hall. Kid-like includes one missed floor tap. Before (Bow was first): 1.9 s (1.9–6.2). |
| 4 Practice dummies | 30–45 s | **16.0 s** (15.9–16.2) short | **18.7 s** (18.5–19.3) short | **16.2 s** (16.1–16.3) short | **18.9 s** (18.7–19.1) short | Auto-attack on 3 straw dummies. Before: absent (0 s). |
| 5 Big dummy / STRIKE | 15–20 s | **8.9 s** (8.8–9.1) short | **11.6 s** (11.5–11.9) in ±30% | **9.1 s** (9.0–9.2) short | **10.9 s** (10.0–11.7) in ±30% | Taught here, not on the Keeper. Before: taught in beat 10. |
| 6 Swarmers | 30–40 s | **9.1 s** (8.7–9.7) short | **11.4 s** (11.3–12.6) short | **9.0 s** (8.9–9.1) short | **11.6 s** (11.5–11.8) short | 2 Swarmers, then the walk into First Steps. Before (bigger wave, often with a leftover Brute): 17.1 s (14.6–17.3). |
| 7 Brute / COUNTER | 40–60 s | **21.9 s** (20.7–22.2) short | **23.6 s** (23.3–25.4) short | **22.0 s** (21.6–22.4) short | **26.4 s** (n=1) short | Now the later fight, with "Red circle again! This time, tap COUNTER!" Standard kid-like n=1: the other Standard kid pass had no separate DASH tip mark, so beats 7–8 were not split. Before (this was the first fight): 28.1 s (23.9–44.7). |
| 8 Crowd / DASH | 30–45 s | **13.7 s** (12.9–13.8) short | **16.6 s** (16.4–16.7) short | **13.8 s** (13.4–14.2) short | **15.7 s** (n=1) short | One Standard kid-like pass stalled ~28 s with two Swarmers still up (see stuck spots). Before: 7.0 s (6.2–17.0), and a fast player could skip DASH. |
| 9 Rewards / chest / Insight | 30 s | **7.9 s** (7.8–8.9) short | **13.2 s** (13.2–14.2) short | **8.4 s** (8.0–8.9) short | **13.3 s** (13.3–13.3) short | Insight plays at the end of First Steps; the vault is the chest. Before: 14.9 s (14.7–18.6), which included mopping up leftover hall enemies. |
| 10 Floor Keeper | 60–90 s | **20.9 s** (19.8–22.9) short | **23.1 s** (22.7–26.1) short | **22.3 s** (21.6–23.1) short | **23.2 s** (22.7–23.8) short | No new skill. Strike is no longer taught here. Before: 18.8 s (18.1–21.7). |
| 11 Story close / door home | 10–15 s | **4.0 s** (3.1–4.1) short | **5.9 s** (5.9–5.9) short | **3.7 s** (3.3–4.1) short | **6.8 s** (6.7–6.9) short | One card: "The door home is open." + "Train in class. Your belt opens the Gate." A bot that walks straight up finishes quickly; see the stuck spot if the player stays mid-room. Before: 2.4 s (2.1–5.0), often with no close tip. |

**Total (first story card to Home):**

- Guided clean (bot): **154.1 s (2 min 34 s)**, range 152.2–155.4 s (2:32–2:35).
- Guided kid-like (bot): **201.7 s (3 min 22 s)**, range 199.4–203.9 s (3:19–3:24).
- Standard clean (bot): **156.0 s (2 min 36 s)**, range 155.9–156.2 s (2:36–2:36).
- Standard kid-like (bot): **198.4 s (3 min 18 s)**, range 194.4–202.4 s (3:14–3:22).

TUT-P1's target is about 6–8 minutes (360–480 s). All measured totals are well under that, and under the ±30% floor of 252 s (4 min 12 s).

**Bow to Home** (beats 3–11 only, for comparison with the before total, which started at Bow):

- Guided clean: **107.3 s** (106.2–109.6). Guided kid-like: **135.1 s** (133.4–137.3).
- Standard clean: **109.9 s** (109.7–110.1). Standard kid-like: **131.5 s** (128.1–134.8).
- Before, the whole tutorial was **95.3 s** (92.6–138.8). After Bow, the new floor is a little longer because more is taught after the bow (dummies, STRIKE, Swarmers, Brute, DASH, Insight, chest, Keeper, close). Beats 0–2 add about 46 s (clean) or 67 s (kid-like bot) *before* Bow.

**Time to first Counter** from the first story card (under-five-minutes rule):

- Guided clean: **88.7 s** (87.6–89.5), about 1 min 29 s.
- Guided kid-like: **126.1 s** (124.1–126.3), about 2 min 6 s.
- Standard clean: **88.7 s** (88.6–88.7). Standard kid-like: **125.1 s** (124.8–125.3).
- Before, first Counter was **19.9 s** (11.5–43.0) from the Bow prompt, and it was the first fight. After, it comes after the path, stones, bow, dummies, STRIKE, and Swarmers, and it is still well under five minutes.

Guided and Standard were effectively the same length. Standard did not make the stones or the Keeper noticeably longer. The one longer DASH fight was a single Standard kid-like pass.

### Stuck spots

1. **Medium — HOME door is off-screen after the close.** After the Keeper falls, Sensei says "You stayed calm. Well done!" and then the one-card close. The hero is mid-room, often on a glowing Keep chest. The banner "The door is open!" is at the top of the screen, but the HOME door and its label are off the top of the camera at both 844×390 and 667×375 (the door's screen y was about −33 px). This happened on all ten full-floor passes. A bot that walks straight up finds the door in about 3–7 s. A new 6-year-old who stays on the chest, or who does not know to walk up, can stall here. This is the same family of problem as the before "door home is easy to miss," still true on the new floor. Shots: `g-clean-844-on-11-home-door.png`, `g-clean-667-on-11-close.png`.

2. **Medium — first COUNTER, wrong button.** On every kid-like pass the first cue was up and the player tapped STRIKE and the floor first. COUNTER is still one of three round buttons. This is a real risk, but it is no longer the first fight, and Sensei now says "Red circle again! This time, tap COUNTER!" Shot: `g-kid-667-off` / `s-kid-844-on` wrong-button shots.

3. **Medium, one pass — DASH fight ran long on Standard.** On `s-kid-844-on`, after the DASH tip, two Swarmers were still up and the step did not change for about 28 s. The pass still finished. Not seen on Guided, and not seen on the other Standard kid-like pass (that one never recorded a separate DASH tip). A kid who does not dash can take longer here; they are not stuck with no way out.

4. **Mild — glowing path spot, and first Bow.** A kid can tap the floor away from the glow, or before finding Bow. Same as the before mild notes, and the bot recovered quickly.

The old **high** stuck spot is gone: there is no longer a silent Brute already in the hall after a walk-space tip. The stones help arrow after two misses worked in the dedicated 2-miss runs ("Watch the red. Step where I point.").

Not a stall, but a packaging note: the opening Sensei line ("The Tower is waking up. Come with me.") shares one Got it card with the path tip ("Tap to walk, or use the stick."), two lines, like the accepted close card.

### Kid estimate (not measured)

These are estimates for a new 6-year-old, not stopwatch times.

A child who reads the cards (beat 0 already lands in the 20–30 s target once you add read pauses), misses the first stone wave twice (~48 s of waves, in the 45–60 s target), hunts a little for COUNTER and DASH, and spends 10–20 s looking for the unseen HOME door, might finish in about **5–6 minutes**. A child who stalls longer on the first COUNTER or stands on the Keep chest could reach the **6–8 minute** target. A child who taps through quickly will land closer to the kid-like bot time (~3.5 minutes) than to the plan.

### Kid read

**Age 6.** You read a short story, walk up a path, and step out of red circles when stones fall. Then you bow, walk up to straw dummies and they get hit on their own, tap the glowing STRIKE, and chase two little shadows. Later a bigger enemy shows a red circle again, and that is when you tap COUNTER. After the last fight, don't stay on the chest in the middle — walk up. The door home is at the top, even if you can't see it yet.

**Age 12.** The new floor has all the planned beats and takes a couple of minutes if you know what to tap, or maybe twice that if you read and miss some stones. Counter is no longer the first fight. The easy place to get stuck is the exit: the close says the door is open, but from mid-room you only see a banner and a chest.

**Adult.** The after floor matches TUT-P1's shape and order. It is still much shorter than the 6–8 minute target for anyone who keeps moving. Stones landed in the retuned 30–60 s window (clean ~35 s, two misses ~48 s). First Counter is around minute 1.5–2. The two things still in the way of a calm close are the off-screen HOME door behind a mid-room chest, and how short the later combat beats are against the written targets.

### Pass or fail against TUT-P1 targets ±30%

**FAIL short** on the total, on both difficulties, for every measured bot run.

Beats that pass ±30% only on kid-like bot (read pauses): 0 (story), 3 (Bow), and 5 (STRIKE). Beat 2 (stones) passes ±30% on clean dodges (~36 s, also inside TUT-B4's 30–60 s retune) and passes the written 45–60 s target on dedicated 2-miss bot runs (~48 s). Every other beat is short of even the ±30% floor on the measured runs. Guided and Standard do not change that result.
