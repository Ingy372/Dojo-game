# G2B-12 — Green belt playthrough (Guided, Standard, Challenge)

## Delivery Note

- **ITEM:** G2B-12, a Green-student playthrough of today's main. Plan: PR #401, `drafts/planning/R-GREEN-TO-BLACK.md`.
- **WHAT:** I picked the Green profile on the hidden testing screen (profile row 4, "Green Belt: 3 of 7 signed off, 1 stripe", Kai M., tier 4). I played Guided, Standard and Challenge with a bot that uses real touch input at 667x375. Standard also ran at 932x430. This report has three short play logs, the shared white-belt content, ranked findings tagged `routine` or `needs Jay`, and the bugs. Screenshots are in `drafts/qa/g2b-12/`.
- **WHY:** G2B-07 to G2B-11 need to know what a Green student actually gets today. The answer is: almost the same game as a White student.
- **DECIDE (Jay):** Findings 1 to 4 below are `needs Jay`. They set the scope of the Green content work. I did not change any game code.
- **NEXT:** Re-run this on the G2B-01 / G2B-04 builds once they merge (not covered here). Do the `routine` fixes (findings 5 to 9) with the next UI pass.
- **Not covered:** nothing was run at 667x320. Play was not done by a person. The box was heavily loaded (load average about 14), so counter timing was noisy. Treat the damage numbers as rough.

## How it was run

- Build: fresh `origin/main` at `5003a7fb`, dev server (not the beta build, because the beta build removes the testing screen).
- Profile: open Home, dismiss the welcome, tap the "Training Board" title 5 times, choose row 4 (Green), Close. The same profile was used for every run. `?seed=7` for repeatability.
- Difficulty: set through the real Settings screen cards (Guided, Steady, Challenge). The Challenge card is unlocked for Green (tier 4).
- Player: a bot driving the page over CDP touch events. Skill levels: **skilled** (counters on the wind-up), **casual** (counters about half the time, mashes strikes), **none** (never counters). Reduced motion off, except one Challenge run with it on.
- Each run was capped at 120 to 170 seconds. The player starts each run at HP 236.
- Room names in my raw logs lag after the door choice. I use the HUD "Room N of 8" number below.

## Green profile at the start (testing screen)

- Power Rating 1560 / 4000 (hidden from players). Sign-offs 24 of 28 (1371 / 1600), Training Points 20 of 112 (121 / 680), Virtues 1 of 8 stripes (50 / 400).
- **Level 1 of 40, experience 0 / 718, Level counts 18 / 720. Gear 0 / 320 (gear score 0 of 82), bag "Gear (0)". Street Smarts and Mastery "not built yet". "Dojo Blessing: off · expected level 30".**
- Home shows "Level 1 … of 40", "Your next step: Self-Defense #18 ▶ Video soon". The Gate shows 3 of 7 locks lit (David and Goliath, Defense #16, #17). Locked: Defense #18, #19, #20 and Kick 4. Classes done 15 of 24.
- Shots: `667x375-testing-green.jpg`, `932x430-testing-green.jpg`, `667x375-home-gate.jpg`, `932x430-home-gate.jpg`.

## Play log 1: Guided (667x375)

- **Skilled:** 3 rooms in 121 s, total damage 62 (0 in room 1, 53 in room 2, 9 in room 3). 20 counters, 6 perfect.
- **Casual:** 5 rooms in 170 s, damage 177. Room 2 took 120 (HP 236 to 122). Still alive at the cap.
- **No counters:** KO in room 2. Room 1 cost 225 of 236 HP (HP 11 left). The KO was at 45 s.
- Feel: a child who counters sometimes survives. A child who never counters still dies fast.
- Shots: `667x375-play-guided-casual-windup.jpg`, `667x375-play-guided-none-ko.jpg`.

## Play log 2: Standard / "Steady" (667x375 and 932x430)

- **Skilled (667):** 5 rooms in 170 s, damage 315. Room 1 cost 36. **Room 2 cost 208 (HP 34 left).** Room 4 cost 71 and left HP 13.
- **Skilled (932x430):** 6 rooms in 80 s, damage 250. Room 1: 71, room 2: 12, room 4: 47. No KO. Bopper enemies appeared here.
- **Casual:** KO in room 4 after 67 s. Damage 324. Room 1 cost 138, room 2 cost 133 (HP down to 21).
- **No counters:** KO in room 1 at 20 s. All 236 HP gone in one room.
- Feel: a good player is fine until a swarm stack hits (one second of hits took 58 and then 100 HP in my logs). Casual players do not last 4 rooms.
- Shots: `667x375-play-standard-skilled-windup.jpg`, `667x375-play-door-choice.jpg`, `667x375-play-standard-casual-ko.jpg`, `932x430-play-standard-skilled-windup.jpg`, `932x430-play-door-choice.jpg`, `932x430-play-standard-skilled-final.jpg`.

## Play log 3: Challenge (667x375)

- **Skilled:** 5 rooms in 170 s, damage 341, 28 counters. One room left HP at 1 (room 4: damage 222).
- **Casual:** KO in room 2 at 36 s. Damage 289. Room 1 cost 142. With Reduced motion on, the same run was KO'd at 32 s (room 1 cost 228, so about the same).
- **No counters:** KO in room 1 at 20 s (236 damage).
- Feel: for a skilled player Challenge looked about the same as Standard (341 vs 315 damage over 5 rooms, run-to-run noise is as big as that gap). For casual players Challenge is a room faster to die. The card text ("Faster enemies and less time to COUNTER.") is accurate.
- Shots: `667x375-play-challenge-skilled-windup.jpg`, `667x375-play-challenge-casual-ko.jpg`.

## Shared white-belt content (what Green re-uses today)

- **Rooms:** Green plays the generic room set. Its maps are tile-for-tile the same as the White copies (`w-bamboo-hall`, `w-stone-garden`, `w-gauntlet`, `w-shield-wall`, `w-narrow-bridge`, `w-keepers-hall`, `w-training-yard` all have identical tiles). Only some enemy lists differ. Shield Wall and Keeper's Hall are identical to White. The one tier-gated set is Orange's `ember-kitchens` (tier 3). **There is no room set for tier 4.**
- **Enemies:** swarmer, brute and shield in every run, bopper in the 932x430 run. Elites exist from tier 4 (no Guarding elites on Guided or the first floor of a tier) and named monsters from tier 2; I did not see either in the runs.
- **Abilities:** the same two Strikes, the same seals, Virtues and stances as Orange (Beginner's Stance on screen). The Insight offers (e.g. Double Strike, Wind Step, Ripple Counter) come from that same pool.
- **Screens:** Home, Gate, Last run, Gear, Abilities, Settings, Dojo are shared by every belt.
- **Loot:** the same drops ("Everyday: Jade Charm" appeared in room 2).

## Findings, ranked by impact

1. **[needs Jay] Green has no content of its own.** Green runs on the generic floors and the same enemy types as White to Orange (swarmer, brute, shield, bopper). No tier-4 rooms, enemies or art. Nothing tells a student they moved up. Evidence: all play logs, `667x375-play-*-windup.jpg`.
2. **[needs Jay] Green has nothing new to use: abilities, gear, stances.** Same Strikes, seals, Virtues and stances as Orange. The gear bag is empty at Green (Gear 0), so a Green student starts with no belt-level gear. Evidence: `667x375-home-gate.jpg`, `667x375-abilities-style.jpg`, `667x375-gear.jpg` (and 932x430 versions).
3. **[needs Jay] Difficulty feel is uneven and the three settings are not clearly different.**
   - Standard: damage spikes (58 and 100 HP in about a second from swarm stacks); casual players are KO'd by room 4.
   - Challenge: about the same as Standard for skilled play; casual players KO by room 2.
   - Guided: helps casual players but a player who never counters still dies in room 2.
   - There is no gentler path for a child who cannot counter yet.
4. **[needs Jay] Level and power do not match the profile.** A Green student with 24 of 28 requirements signed off is Level 1 of 40, with 0 gear and "Dojo Blessing: off · expected level 30". Level shows 18 / 720. This may only be the fake profile, but if real Green students arrive near Level 1 the design should say so. Evidence: `667x375-testing-green.jpg`.
5. **[routine] Door banner is hard to read at 667x375.** "The doors are open! Pick one." is faded and sits under the "GREAT!" text and the HP bars. Evidence: `667x375-play-door-choice.jpg` (compare 932x430).
6. **[routine] Placeholder text is shown to students.** "Your next step: Self-Defense #18 ▶ Video soon". Evidence: `667x375-home-gate.jpg`.
7. **[routine] Door names.** A door labelled CHALLENGE sits next to Battle and Rest, which collides with the "Challenge" difficulty name (seen in one scratch run; the door screen then listed BATTLE, REST and CHALLENGE). Needs a wording check for age 6.
8. **[routine] First-visit modals stack.** The first Dojo visit shows three modals in a row (Let's go!, Okay!, Bow). The Settings overlay lets the Dojo header show through at the top. Evidence: `667x375-settings-green.jpg`.
9. **[routine] Testing screen is cut off at 667x375.** The last row ("Forget what I've seen") is clipped at the bottom. Hidden screen, so low impact. Evidence: `667x375-testing-green.jpg`.

## Bugs found

- `GET /favicon.ico` returns 404 (curl confirmed). The browser console showed 3 404 errors per page load; I only confirmed the favicon, not the other two.
- Findings 5, 6, 8 and 9 above are layout or text bugs, not crashes. No crash, no stuck state, no console exception in the game itself over about 20 runs. One of my earlier bot attempts stuck on the Insight screen. That was my bot (it needed to tap the middle card), not the game.

## Not done / limits

- 667x320 not run. G2B-01 (Strike #2 Jumping Spins) and G2B-04 (thrown state) are not on main, so not covered.
- Bot play is not a child. Damage numbers move a lot run to run under load.
- Guided and Standard "feel" for age 6 needs a real person; see TC-24, TC-30 and TC-31 in `g2b-06-beta-test-plan.md`.

## Shots in `drafts/qa/g2b-12/`

`<size>-testing-green`, `-home-gate`, `-abilities-style`, `-settings-green`, `-dojo`, `-gear` for both 667x375 and 932x430. Play shots: `667x375-play-guided-casual-windup`, `-standard-skilled-windup`, `-challenge-skilled-windup`, `-door-choice`, KO cards (`-standard-casual-ko`, `-challenge-casual-ko`, `-guided-none-ko`), and 932x430 `-play-standard-skilled-windup`, `-door-choice`, `-final`.
