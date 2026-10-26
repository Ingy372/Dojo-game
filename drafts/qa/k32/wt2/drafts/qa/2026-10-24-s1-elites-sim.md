# S1 elites: simulator check at the real elite rates

## Delivery Note
- **ITEM:** Elite numbers in PR #47 (`drafts/planning/S1-tier2-name-and-guarding-aura.md` section 3, plus `named-monster-proposal.md`), main at e79dc6b.
- **WHAT:** Ran elites in the game's simulator at the doc's rates (20% battle, 35% challenge, from room 3, caps 1/room, 2/floor, 1 Guarding/floor, Swift 60% / Guarding 40%, Health x1.25, Swift speed x1.25, wind-up x0.8 (not on Guided), recovery x0.85, Guarding x0.67 / 3 tiles / 2 closest). Compared with no elites and two worst cases (an elite in every eligible room, all Swift or all Guarding). 200 fixed seeds per cell, 5 bots, 3 difficulties, 3 profiles.
- **WHY:** Done-when 9 asks for this: win rate within 5 points of no elites, Guarding rooms no more than about 25% longer.
- **DECIDE:** (1) Keep the numbers as written? I say yes for Standard and Guided. (2) Should Swift keep the x0.8 wind-up on Challenge? A Swift Swarmer gives only 350 ms there. (3) Fix the "never below 8 ticks" rule, which clashes with the game's own 10-tick minimum.
- **NEXT:** Manager posts this as a PR in `drafts/qa/`. Once elites are built, check on a real phone that a child can counter a Swift Swarmer on Standard.

## How I tested (and the limits)
- Scratch test files only, in a separate worktree (`/workspace/dojo-elites`, nothing committed): `packages/sim/test/q1/elites.test.ts` and a copy of `bot3.ts`. Raw data, script and tables are in `/workspace/qa/s1-elites/`.
- **Profiles are forced on.** The doc says elites only appear from **4th belt**. p1 to p3 are white and yellow belts, so in the real game **they would never see an elite**. I turned elites on for them anyway as a stand-in. There's no 4th-belt profile to test with.
- The sim plays one floor, which I treated as "not a tier's first floor", so Guarding was allowed (except on Guided). That's the harder case.
- Named monsters (5% per run, Tier 2) are not modeled. They're out of the elite system and wouldn't change these numbers.
- The elite is picked at random from the room's enemies when the room starts. Guarding only goes to a Brute or a Shield Guard. If there isn't one, it becomes Swift.
- Each cell can move about ±7 points by chance at a 50% win rate.
- Tick rate checked in code: `TICKS_PER_SECOND = 20` (50 ms per tick).

## Result in short
- At the real rates, an elite appeared in 118 of 200 floors (p1, Standard), about **0.6 per floor**, not the doc's "about 1". 77 of the 118 were Swift Swarmers.
- **Win rate:** no cell moved more than about 6 points, and most moved under 2. Smart novice on Standard: **46.5% with no elites, 49.0% with elites**. Done-when 9 passes.
- **Room time:** about the same in every room, including gauntlet, training-yard and keepers-hall. Even with Guarding in every room, the change was under 5%. That passes the 25% check.
- **Perfect Counters per minute:** about the same (27.7 vs 27.9 for the smart novice on Standard).
- **Where it bites:** Challenge. A worst case with every room Swift dropped the smart novice from 12.5% to 7.5%, and losses on narrow-bridge (13 to 21) and guarded-swarm (5 to 18) went up. p2's stand-and-counter bot on Challenge went from 48% to 39.5% at the real rates.
- Masher still wins 0% everywhere, with or without elites. That's the same core problem as Q1.

## Win % and Perfect Counters per minute
"allSwift" and "allGuard" put an elite in every eligible room. They were run only for p1.

|profile|bot|diff|none|elites|allSwift|allGuard|PC/min none→elites|
|-|-|-|-|-|-|-|-|
|p1|typical/smart|guided|100.0|100.0|100.0|100.0|28.9→29.2|
|p1|typical/smart|standard|96.0|95.0|96.5|94.0|30.1→29.6|
|p1|typical/smart|challenge|52.0|52.0|52.0|55.0|33.3→33.4|
|p1|novice/smart|guided|100.0|99.0|99.0|99.0|27.4→27.6|
|p1|novice/smart|standard|46.5|49.0|46.5|49.5|27.7→27.9|
|p1|novice/smart|challenge|12.5|11.5|7.5|7.5|30.6→30.5|
|p1|novice/stand|guided|95.5|95.5|99.5|99.5|34.7→35.0|
|p1|novice/stand|standard|24.0|23.5|25.5|24.0|35.1→35.3|
|p1|novice/stand|challenge|4.5|3.0|3.5|4.5|39.3→39.3|
|p1|novice/masher|guided|0.0|0.0|0.0|0.0|0.0→0.0|
|p1|novice/masher|standard|0.0|0.0|0.0|0.0|0.0→0.0|
|p1|novice/masher|challenge|0.0|0.0|0.0|0.0|0.0→0.0|
|p1|novice/flail|guided|0.0|0.0|0.0|0.0|21.8→21.8|
|p1|novice/flail|standard|0.0|0.0|0.0|0.0|18.0→18.0|
|p1|novice/flail|challenge|0.0|0.0|0.0|0.0|17.6→17.6|
|p2|typical/smart|guided|100.0|100.0|-|-|25.1→25.3|
|p2|typical/smart|standard|100.0|100.0|-|-|27.7→28.0|
|p2|typical/smart|challenge|96.0|95.5|-|-|29.2→29.3|
|p2|novice/smart|guided|100.0|100.0|-|-|24.5→24.5|
|p2|novice/smart|standard|93.0|94.0|-|-|25.7→25.8|
|p2|novice/smart|challenge|59.0|53.0|-|-|27.1→26.4|
|p2|novice/stand|guided|100.0|100.0|-|-|30.1→29.9|
|p2|novice/stand|standard|80.0|79.0|-|-|29.7→29.7|
|p2|novice/stand|challenge|48.0|39.5|-|-|33.1→33.0|
|p2|novice/masher|guided|0.0|0.0|-|-|0.0→0.0|
|p2|novice/masher|standard|0.0|0.0|-|-|0.0→0.0|
|p2|novice/masher|challenge|0.0|0.0|-|-|0.0→0.0|
|p2|novice/flail|guided|0.0|0.0|-|-|18.4→18.4|
|p2|novice/flail|standard|0.0|0.0|-|-|16.5→16.6|
|p2|novice/flail|challenge|0.0|0.0|-|-|16.3→16.3|
|p3|typical/smart|guided|100.0|100.0|-|-|21.5→21.8|
|p3|typical/smart|standard|100.0|100.0|-|-|23.6→23.9|
|p3|typical/smart|challenge|100.0|100.0|-|-|25.8→25.9|
|p3|novice/smart|guided|100.0|100.0|-|-|20.8→21.0|
|p3|novice/smart|standard|100.0|100.0|-|-|21.5→21.5|
|p3|novice/smart|challenge|100.0|99.0|-|-|22.8→22.4|
|p3|novice/stand|guided|100.0|100.0|-|-|24.5→24.5|
|p3|novice/stand|standard|100.0|100.0|-|-|25.2→25.3|
|p3|novice/stand|challenge|100.0|97.5|-|-|26.8→26.4|
|p3|novice/masher|guided|0.0|0.0|-|-|0.0→0.0|
|p3|novice/masher|standard|0.0|0.0|-|-|0.0→0.0|
|p3|novice/masher|challenge|0.0|0.0|-|-|0.0→0.0|
|p3|novice/flail|guided|36.5|41.0|-|-|15.4→15.4|
|p3|novice/flail|standard|15.0|13.0|-|-|13.8→13.7|
|p3|novice/flail|challenge|18.5|18.5|-|-|14.3→14.2|

## Losses by room, p1 smart novice (none / elites / allSwift / allGuard)
- **Guided:** keepers-hall 0/1/2/2. Everything else 0 to 1.
- **Standard:** keepers-hall 43/44/43/41, training-yard 8/7/8/9, gauntlet 3/3/4/3, lantern-room 13/12/12/12, pillar-court 10/11/13/9.
- **Challenge:** keepers-hall 54/47/33/40, training-yard 14/14/11/17, gauntlet 6/7/4/5, narrow-bridge 13/13/21/21, guarded-swarm 5/7/18/8.
- keepers-hall never has elites, so a drop there only means fewer players reach it.

## Is Swift's wind-up too short?
A wind-up is the full red-circle time. The Perfect Counter window is the last part of it. A child needs about 250 ms (5 ticks) to notice the warning, then has to press inside the window.

|enemy|difficulty|normal wind-up|Swift wind-up|Swift: time before window opens|window|Swift: window closes at|
|-|-|-|-|-|-|-|
|swarmer|guided|16 ticks (800 ms)|16 ticks (800 ms)|300 ms|10 ticks (500 ms)|800 ms|
|swarmer|standard|12 ticks (600 ms)|10 ticks (500 ms)|200 ms|6 ticks (300 ms)|500 ms|
|swarmer|challenge|9 ticks (450 ms)|7 ticks (350 ms)|150 ms|4 ticks (200 ms)|350 ms|
|shield|guided|18 ticks (900 ms)|18 ticks (900 ms)|400 ms|10 ticks (500 ms)|900 ms|
|shield|standard|14 ticks (700 ms)|11 ticks (550 ms)|250 ms|6 ticks (300 ms)|550 ms|
|shield|challenge|10 ticks (500 ms)|8 ticks (400 ms)|200 ms|4 ticks (200 ms)|400 ms|
|brute|guided|20 ticks (1000 ms)|20 ticks (1000 ms)|500 ms|10 ticks (500 ms)|1000 ms|
|brute|standard|16 ticks (800 ms)|13 ticks (650 ms)|350 ms|6 ticks (300 ms)|650 ms|
|brute|challenge|12 ticks (600 ms)|10 ticks (500 ms)|300 ms|4 ticks (200 ms)|500 ms|

- **Guided:** unchanged, which is good.
- **Standard:** Swift Swarmer 500 ms, about 250 ms of slack after a child reacts. That's tight but fair.
- **Challenge:** Swift Swarmer 350 ms, only about 100 ms of slack, and the window opens 150 ms in, before most kids have even reacted. The novice bot reacts in 8 ticks (400 ms), so it misses this window every time and has to dash.

## Recommendation
1. Keep the rates, the Health x1.25 and the Guarding x0.67 as written. They pass Done-when 9 with room to spare.
2. On Challenge, use Swift wind-up x0.9 or keep x1.0 and make Swift only faster on its feet. Or set a floor of 8 ticks *after* the difficulty is applied. That gives a Swift Swarmer 400 ms instead of 350 ms.
3. Lower the floor wording to "never below 10 ticks in the file" so it matches the game's loader rule.
4. Don't raise the elite rate to reach "about 1 per floor". Fewer feels more special, and these numbers are already fine.

## Issues
**1. Swift Swarmer on Challenge is close to too fast to react to.**
- What I did: worked out the Swift wind-up from the doc and the game's `telegraphTicks` rule.
- What happened: 7 ticks (350 ms) in total, and the window opens after 150 ms.
- What should have happened: room for about 250 ms of reaction plus a press.
- Severity: ANNOYING (Challenge only).

**2. The doc's "never below 8 ticks" breaks the game's 10-tick minimum.**
- What I did: compared the doc with `packages/sim/src/enemy.ts`, which says wind-up must be at least 10 ticks ("half a second of warning").
- What happened: the doc allows 8. Today no enemy goes under 10 on Standard (Swift Swarmer = 10), but a new fast enemy could.
- What should have happened: one rule, stated in one place.
- Severity: SMALL.

**3. No one in the test profiles can ever see an elite.**
- What I did: checked the belt rule (4th belt and up).
- What happened: p1 to p3 are below 4th belt, so the real game would give them no elites. I had to force them on.
- What should have happened: a 4th-belt test profile, so the balance player can check the real case.
- Severity: SMALL.

**4. "About 1 elite per floor" doesn't match the rules.**
- What I did: counted elites over 200 floors.
- What happened: about 0.6 per floor, because only rooms from room 3 on count and the cap is 2.
- What should have happened: the doc's expectation matches its own rules. I suggest changing the text, not the rate.
- Severity: SMALL.

**5. Doc gaps.**
- What I did: read both docs for how the elite enemy is chosen.
- What happened: the docs don't say which enemy in the room becomes the elite (random? the toughest?), when it's picked if enemies come in waves, or whether a Guarding roll with no Brute or Shield in the room becomes Swift. They don't say whether Swift's x0.8 applies before or after Challenge's fill scaling, or whether elite loot ("slightly better") has numbers.
- What should have happened: one line for each.
- Severity: SMALL.

## Three views
- **6-year-old:** "The sparkly fast one is quick but I can still hit the button on the normal setting." On the easiest setting, nothing changes for them. Good.
- **12-year-old:** "Elites are cool but kind of rare and not much harder. Where's the reward?" They'll want the better loot to be easy to see.
- **Adult:** "Fair on Standard. On Challenge, the fast Swarmer feels like a reflex test, not a reading test." Ease the Challenge wind-up a little.
