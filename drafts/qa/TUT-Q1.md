# TUT-Q1: Today's tutorial, before-timing

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
