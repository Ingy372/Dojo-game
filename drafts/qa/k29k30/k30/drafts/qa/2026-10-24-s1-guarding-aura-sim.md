# S1 Guarding aura: simulator check

## Delivery Note
- **ITEM:** Guarding aura numbers from PR #30 (`drafts/planning/S1-tier2-name-and-guarding-aura.md`, merged to main as a3a3c41).
- **WHAT:** I tested the aura in the game's own simulator, with and without it. I used 200 runs per setting with the same starting seeds, 5 practice players, 3 difficulties and 3 student profiles, plus 5 alternative numbers.
- **WHY:** To see whether the aura makes the game too hard for new players, or makes Counter less useful.
- **DECIDE:** (1) Keep half damage, or use my suggestion of 1/3 less damage (×0.67)? (2) Should Guarding elites stay out of Guided and the first rooms? (3) How often should a Guarding elite show up? The doc doesn't say.
- **NEXT:** Check it on a phone once elites are built. The aura isn't in the game yet. After that, QA the K7 art.

## How I tested (and the limits)
- The game has no elites yet, so I added the aura in a scratch test file only. No game code was changed or committed. Files: `packages/sim/test/q1/bot3.ts`, `aura.test.ts` (untracked), `/workspace/qa/s1-aura/` (raw.json, analyze.py, table.md).
- **The aura weakens the player's hits on enemies.** It doesn't change the damage the player takes. The doc says the protected enemies take half damage, so the harm is that rooms take longer and the player gets hit more often.
- **Who is the guarder:** in every battle and challenge room, I made the toughest normal enemy the guarder (a Brute, or a Shield Guard if there's no Brute). Its own stats were not raised. The boss room has no guarder, because the boss is never protected.
- **This is a worst case.** In real play, a Guarding elite would not be in every room.
- **How the aura works in the sim:** it checks every tick and protects up to N of the closest enemies within R tiles. The 50% cut is applied by doubling a protected enemy's health while it's protected. This gives the same result as halving every hit.
- **Profiles:** the aura is on enemies, so it applies to every student. p1 = new white belt (same stats as the starting character). For p2 and p3, I guessed the level and gear the same way as in the Q1 report.
- **Bots:** the bots don't try to pull enemies away from the guarder. Real kids who learn that trick will do better than these numbers.
- **Accuracy:** at a win rate around 50%, a single result can move about ±7 points by chance. Small differences mean little.

## Main results: win %, new white belt (p1)
| bot | difficulty | no aura | proposed (½, 3 tiles, 2) | ⅓ cut | 2 tiles | 4 tiles | 1 enemy | 3 enemies |
|---|---|---|---|---|---|---|---|---|
| typical/smart | guided | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 |
| typical/smart | standard | 96.0 | 93.5 | 93.0 | 92.5 | 91.5 | 94.0 | 96.5 |
| typical/smart | challenge | 52.0 | 46.0 | 50.0 | 43.5 | 43.5 | 49.5 | 45.5 |
| novice/smart | guided | 100.0 | 99.0 | 100.0 | 97.0 | 97.0 | 99.5 | 98.0 |
| novice/smart | standard | 46.5 | 41.5 | 46.0 | 35.5 | 37.5 | 42.0 | 41.5 |
| novice/smart | challenge | 12.5 | 8.0 | 9.5 | 10.0 | 6.5 | 11.0 | 9.0 |
| novice/stand | guided | 95.5 | 93.5 | 91.5 | 91.0 | 90.5 | 93.5 | 91.5 |
| novice/stand | standard | 24.0 | 17.5 | 22.0 | 24.5 | 20.0 | 17.0 | 21.5 |
| novice/stand | challenge | 4.5 | 6.5 | 9.5 | 2.0 | 6.0 | 4.5 | 5.5 |
| novice/masher | guided | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| novice/masher | standard | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| novice/masher | challenge | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| novice/flail | guided | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| novice/flail | standard | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |
| novice/flail | challenge | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 |

**What it means**
- The proposed aura costs new players about 4 to 7 points on Standard and Challenge. For example, a smart novice on Standard wins 46.5% → 41.5%, and a stand-and-counter novice wins 24% → 17.5%. On Guided the change is 0 to 2 points.
- The 2- vs 4-tile and 1- vs 3-enemy versions all land within chance of each other. The damage cut is the number that matters. The ⅓ cut puts the smart novice back to 46%.
- The masher and the flail (a 6-year-old who mostly mashes Strike) lose every run either way, all in Training Yard. Time survived per run barely changes: masher 12 → 11 s on Guided and 10 → 10 s on Standard; flail 18 → 18 s on Guided. Those players are blocked by Counter, not by the aura.

## Other profiles (none → proposed, win %)
| bot | difficulty | p2 (3 sign-offs) | p3 (yellow belt) |
|---|---|---|---|
| typical/smart | standard | 100 → 99.5 | 100 → 100 |
| novice/smart | standard | 93 → 87.5 | 100 → 100 |
| novice/stand | standard | 80 → 72 | 100 → 100 |
| typical/smart | challenge | 96 → 90.5 | 100 → 100 |
| novice/smart | challenge | 59 → 51.5 | 100 → 99.5 |
| novice/stand | challenge | 48 → 40.5 | 100 → 99.5 |
| novice/flail | guided | 0 → 0 | 36.5 → 32.5 |
| novice/masher | all | 0 → 0 | 0 → 0 |

## Deaths per room, smart novice, p1 (deaths ÷ times reached)
| difficulty | aura | training-yard | gauntlet | keepers-hall (boss) |
|---|---|---|---|---|
| standard | none | 7% | 14% | 32% |
| standard | proposed | 12% | 25% | 31% |
| standard | ⅓ cut | 12% | 17% | 31% |
| challenge | none | 15% | 29% | 68% |
| challenge | proposed | 22% | 53% | 77% |
| challenge | ⅓ cut | 18% | 44% | 73% |

The gauntlet sample is small (about 20 visits per setting). The boss has no aura, but players reach it weaker.

## Does it make Counter pointless?
No. The aura makes enemies tougher, so it can't replace Counter. Good bots used Counter the same amount or a little more: typical/smart on Standard made 71 → 75.5 Perfect Counters per run, at about 33 per minute either way. Perfect Counters still stagger protected enemies, so reading the "!" is still the best way through.

## Room length (the doc's "no more than 25% longer" rule)
For a room the player wins, the average time goes from about 16.5 s to 17.7 s with the proposed numbers (+6–10%). It passes easily.

## Recommendation
- Start with **⅓ less damage (×0.67), 3 tiles, 2 closest enemies**. Raise it to half later if the elite feels too easy. Radius and enemy count barely change difficulty, so keep 3 and 2. Those numbers keep the screen simple.
- **Keep Guarding elites out of Guided and the first floor.** New white belts are already at about 46% on Standard, and the aura pushes them lower.
- None of these numbers helps the 6-year-old masher. The guided first Counter lesson is still the fix for that player.

## Issues
1. **How often elites appear isn't written down.** What I did: I looked in the doc and in S1 #3 for how often a Guarding elite shows up. What happened: they say "at most 1 per room", but nothing about how often, on which floors, or on which difficulties. What should have happened: there should be a rate, so the balance numbers can be checked against it. Severity: SMALL (it blocks exact tuning).
2. **The elite's own stats aren't given.** What I did: I tried to model the guarder itself. What happened: the doc doesn't say whether it has more health or power, so I left it as a normal enemy. What should have happened: elite stats should sit next to the aura numbers. Severity: SMALL.
3. **Some damage types aren't covered.** What I did: I checked which kinds of damage get cut. What happened: the doc says "after the normal damage formula" but doesn't mention ripple, Iron Skin bounce-back, or other special damage. I cut everything. What should have happened: the doc should say which damage is cut. Severity: SMALL.
4. **The sim can't check the look and feel.** Tether lines, the glow, the 0.2 s fade, the red circle staying on top, and the phone screen all need the real build. Severity: none yet. This is for a phone check once the aura is built.

## How it feels
- **6-year-old:** "Why are my hits small?" The blue lines help, but this player is still stuck in the first room for other reasons (no Counter). Keep elites away from them.
- **12-year-old:** It's a fun puzzle: drag the Brute away or beat the guarder first. Half damage might feel like a wall on Challenge, where gauntlet deaths go from 29% to 53%.
- **Adult:** Fair and readable, and it adds only about a second per room. The damage cut is the one number to tune, and ⅓ is the safer start.

## Full data
| aura | profile | diff | bot | win% | deaths: training-yard | gauntlet | keepers-hall | sec played/run | perfects/run | perfects/min | timeouts |
|---|---|---|---|---|---|---|---|---|---|---|---|
| none | p1 | guided | typical/smart | 100.0 | 0% (136) | 0% (52) | 0% (200) | 152 | 73.1 | 31.9 | 1 |
| none | p1 | guided | novice/smart | 100.0 | 0% (142) | 0% (48) | 0% (200) | 154 | 70.4 | 30.0 | 2 |
| none | p1 | guided | novice/stand | 95.5 | 1% (131) | 0% (41) | 2% (195) | 128 | 73.9 | 38.6 | 0 |
| none | p1 | guided | novice/masher | 0.0 | 100% (33) | - | - | 12 | 0.0 | 0.0 | 0 |
| none | p1 | guided | novice/flail | 0.0 | 100% (35) | - | - | 18 | 6.5 | 21.9 | 0 |
| none | p1 | standard | typical/smart | 96.0 | 0% (136) | 2% (44) | 3% (198) | 142 | 71.0 | 33.3 | 1 |
| none | p1 | standard | novice/smart | 46.5 | 7% (110) | 14% (21) | 32% (136) | 110 | 50.7 | 30.6 | 0 |
| none | p1 | standard | novice/stand | 24.0 | 26% (81) | 33% (18) | 38% (77) | 69 | 40.1 | 39.0 | 0 |
| none | p1 | standard | novice/masher | 0.0 | 100% (33) | - | - | 10 | 0.0 | 0.0 | 0 |
| none | p1 | standard | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.3 | 18.0 | 0 |
| none | p1 | challenge | typical/smart | 52.0 | 9% (110) | 4% (26) | 30% (149) | 105 | 58.3 | 37.1 | 0 |
| none | p1 | challenge | novice/smart | 12.5 | 15% (92) | 29% (21) | 68% (79) | 79 | 40.5 | 33.9 | 0 |
| none | p1 | challenge | novice/stand | 4.5 | 21% (82) | 62% (16) | 82% (49) | 53 | 34.5 | 43.8 | 0 |
| none | p1 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 10 | 0.0 | 0.0 | 0 |
| none | p1 | challenge | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.0 | 17.6 | 0 |
| none | p2 | guided | typical/smart | 100.0 | 0% (137) | 0% (55) | 0% (200) | 132 | 55.1 | 28.1 | 1 |
| none | p2 | guided | novice/smart | 100.0 | 0% (149) | 0% (45) | 0% (200) | 133 | 54.4 | 27.3 | 1 |
| none | p2 | guided | novice/stand | 100.0 | 0% (137) | 0% (54) | 0% (200) | 113 | 56.8 | 34.1 | 0 |
| none | p2 | guided | novice/masher | 0.0 | 100% (33) | - | - | 13 | 0.0 | 0.0 | 0 |
| none | p2 | guided | novice/flail | 0.0 | 92% (39) | - | - | 23 | 7.1 | 19.0 | 0 |
| none | p2 | standard | typical/smart | 100.0 | 0% (139) | 0% (52) | 0% (200) | 124 | 57.4 | 31.1 | 0 |
| none | p2 | standard | novice/smart | 93.0 | 0% (128) | 5% (39) | 5% (196) | 123 | 52.8 | 28.8 | 0 |
| none | p2 | standard | novice/stand | 80.0 | 3% (124) | 0% (34) | 10% (177) | 99 | 48.7 | 33.6 | 0 |
| none | p2 | standard | novice/masher | 0.0 | 100% (33) | - | - | 12 | 0.0 | 0.0 | 0 |
| none | p2 | standard | novice/flail | 0.0 | 97% (37) | - | - | 17 | 4.8 | 16.7 | 0 |
| none | p2 | challenge | typical/smart | 96.0 | 1% (132) | 0% (46) | 3% (197) | 118 | 57.3 | 32.9 | 1 |
| none | p2 | challenge | novice/smart | 59.0 | 4% (126) | 14% (29) | 27% (162) | 104 | 46.9 | 30.4 | 0 |
| none | p2 | challenge | novice/stand | 48.0 | 7% (117) | 23% (31) | 34% (145) | 81 | 44.8 | 37.8 | 0 |
| none | p2 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 11 | 0.0 | 0.0 | 0 |
| none | p2 | challenge | novice/flail | 0.0 | 89% (35) | - | - | 17 | 4.7 | 16.6 | 0 |
| none | p3 | guided | typical/smart | 100.0 | 0% (138) | 0% (40) | 0% (200) | 96 | 34.5 | 25.0 | 0 |
| none | p3 | guided | novice/smart | 100.0 | 0% (136) | 0% (52) | 0% (200) | 97 | 33.7 | 24.2 | 0 |
| none | p3 | guided | novice/stand | 100.0 | 0% (138) | 0% (48) | 0% (200) | 87 | 35.3 | 28.8 | 0 |
| none | p3 | guided | novice/masher | 0.0 | 100% (33) | - | - | 16 | 0.0 | 0.0 | 0 |
| none | p3 | guided | novice/flail | 36.5 | 19% (108) | 17% (24) | 33% (109) | 72 | 18.5 | 17.6 | 0 |
| none | p3 | standard | typical/smart | 100.0 | 0% (138) | 0% (40) | 0% (200) | 91 | 35.9 | 27.7 | 0 |
| none | p3 | standard | novice/smart | 100.0 | 0% (137) | 0% (49) | 0% (200) | 94 | 33.7 | 25.1 | 0 |
| none | p3 | standard | novice/stand | 100.0 | 0% (145) | 0% (49) | 0% (200) | 84 | 35.1 | 29.8 | 0 |
| none | p3 | standard | novice/masher | 0.0 | 100% (33) | - | - | 15 | 0.0 | 0.0 | 0 |
| none | p3 | standard | novice/flail | 15.0 | 29% (90) | 67% (12) | 47% (57) | 50 | 11.6 | 15.7 | 0 |
| none | p3 | challenge | typical/smart | 100.0 | 0% (135) | 0% (55) | 0% (200) | 88 | 38.0 | 30.4 | 0 |
| none | p3 | challenge | novice/smart | 100.0 | 0% (142) | 0% (36) | 0% (200) | 90 | 34.3 | 26.8 | 0 |
| none | p3 | challenge | novice/stand | 100.0 | 0% (144) | 0% (36) | 0% (200) | 79 | 35.5 | 32.1 | 0 |
| none | p3 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 13 | 0.0 | 0.0 | 0 |
| none | p3 | challenge | novice/flail | 18.5 | 16% (89) | 56% (16) | 44% (66) | 53 | 12.5 | 16.4 | 0 |
| proposed | p1 | guided | typical/smart | 100.0 | 0% (139) | 0% (48) | 0% (200) | 160 | 78.1 | 32.1 | 1 |
| proposed | p1 | guided | novice/smart | 99.0 | 1% (143) | 0% (55) | 1% (199) | 159 | 75.6 | 31.4 | 0 |
| proposed | p1 | guided | novice/stand | 93.5 | 5% (131) | 0% (45) | 1% (189) | 131 | 76.5 | 38.6 | 0 |
| proposed | p1 | guided | novice/masher | 0.0 | 100% (33) | - | - | 11 | 0.0 | 0.0 | 0 |
| proposed | p1 | guided | novice/flail | 0.0 | 100% (33) | - | - | 18 | 6.9 | 22.8 | 0 |
| proposed | p1 | standard | typical/smart | 93.5 | 0% (133) | 4% (46) | 2% (190) | 148 | 75.5 | 33.7 | 2 |
| proposed | p1 | standard | novice/smart | 41.5 | 12% (103) | 25% (24) | 31% (120) | 108 | 51.9 | 31.8 | 0 |
| proposed | p1 | standard | novice/stand | 17.5 | 30% (80) | 36% (14) | 46% (65) | 66 | 40.1 | 40.0 | 0 |
| proposed | p1 | standard | novice/masher | 0.0 | 100% (33) | - | - | 10 | 0.0 | 0.0 | 0 |
| proposed | p1 | standard | novice/flail | 0.0 | 100% (33) | - | - | 15 | 4.8 | 19.5 | 0 |
| proposed | p1 | challenge | typical/smart | 46.0 | 15% (108) | 20% (20) | 27% (126) | 101 | 58.3 | 38.3 | 0 |
| proposed | p1 | challenge | novice/smart | 8.0 | 22% (83) | 53% (17) | 77% (69) | 78 | 41.3 | 35.0 | 0 |
| proposed | p1 | challenge | novice/stand | 6.5 | 25% (75) | 71% (17) | 73% (49) | 53 | 35.9 | 44.9 | 0 |
| proposed | p1 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 9 | 0.0 | 0.0 | 0 |
| proposed | p1 | challenge | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.3 | 18.5 | 0 |
| proposed | p2 | guided | typical/smart | 100.0 | 0% (147) | 0% (45) | 0% (200) | 134 | 58.4 | 29.0 | 0 |
| proposed | p2 | guided | novice/smart | 100.0 | 0% (143) | 0% (53) | 0% (200) | 139 | 58.5 | 28.0 | 1 |
| proposed | p2 | guided | novice/stand | 100.0 | 0% (139) | 0% (50) | 0% (200) | 118 | 60.5 | 34.5 | 0 |
| proposed | p2 | guided | novice/masher | 0.0 | 100% (33) | - | - | 13 | 0.0 | 0.0 | 0 |
| proposed | p2 | guided | novice/flail | 0.0 | 98% (43) | - | - | 24 | 7.6 | 19.8 | 0 |
| proposed | p2 | standard | typical/smart | 99.5 | 0% (140) | 0% (49) | 0% (199) | 129 | 60.5 | 31.5 | 0 |
| proposed | p2 | standard | novice/smart | 87.5 | 1% (139) | 6% (34) | 6% (186) | 125 | 54.0 | 29.0 | 0 |
| proposed | p2 | standard | novice/stand | 72.0 | 9% (116) | 3% (32) | 10% (160) | 96 | 49.6 | 35.0 | 0 |
| proposed | p2 | standard | novice/masher | 0.0 | 100% (33) | - | - | 12 | 0.0 | 0.0 | 0 |
| proposed | p2 | standard | novice/flail | 0.0 | 97% (33) | - | - | 17 | 4.9 | 17.0 | 0 |
| proposed | p2 | challenge | typical/smart | 90.5 | 2% (125) | 0% (43) | 4% (189) | 120 | 59.5 | 33.5 | 1 |
| proposed | p2 | challenge | novice/smart | 51.5 | 4% (113) | 18% (17) | 33% (154) | 101 | 46.8 | 31.1 | 0 |
| proposed | p2 | challenge | novice/stand | 40.5 | 12% (103) | 40% (20) | 38% (130) | 78 | 43.6 | 38.0 | 0 |
| proposed | p2 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 10 | 0.0 | 0.0 | 0 |
| proposed | p2 | challenge | novice/flail | 0.0 | 100% (34) | - | - | 17 | 5.1 | 18.0 | 0 |
| proposed | p3 | guided | typical/smart | 100.0 | 0% (133) | 0% (48) | 0% (200) | 99 | 36.7 | 25.6 | 0 |
| proposed | p3 | guided | novice/smart | 100.0 | 0% (139) | 0% (48) | 0% (200) | 100 | 35.3 | 24.5 | 0 |
| proposed | p3 | guided | novice/stand | 100.0 | 0% (136) | 0% (40) | 0% (200) | 87 | 36.0 | 29.1 | 0 |
| proposed | p3 | guided | novice/masher | 0.0 | 100% (33) | - | - | 16 | 0.0 | 0.0 | 0 |
| proposed | p3 | guided | novice/flail | 32.5 | 15% (99) | 29% (21) | 28% (90) | 67 | 17.3 | 17.5 | 0 |
| proposed | p3 | standard | typical/smart | 100.0 | 0% (137) | 0% (55) | 0% (200) | 93 | 38.5 | 29.0 | 0 |
| proposed | p3 | standard | novice/smart | 100.0 | 0% (141) | 0% (41) | 0% (200) | 96 | 36.1 | 26.2 | 0 |
| proposed | p3 | standard | novice/stand | 100.0 | 0% (129) | 0% (46) | 0% (200) | 86 | 36.1 | 29.9 | 0 |
| proposed | p3 | standard | novice/masher | 0.0 | 100% (33) | - | - | 15 | 0.0 | 0.0 | 0 |
| proposed | p3 | standard | novice/flail | 14.5 | 35% (77) | 54% (13) | 36% (45) | 46 | 11.0 | 16.0 | 0 |
| proposed | p3 | challenge | typical/smart | 100.0 | 0% (136) | 0% (51) | 0% (200) | 90 | 39.7 | 31.0 | 0 |
| proposed | p3 | challenge | novice/smart | 100.0 | 0% (149) | 0% (42) | 0% (200) | 93 | 36.1 | 27.2 | 0 |
| proposed | p3 | challenge | novice/stand | 99.5 | 0% (144) | 0% (48) | 0% (199) | 81 | 36.6 | 32.3 | 0 |
| proposed | p3 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 13 | 0.0 | 0.0 | 0 |
| proposed | p3 | challenge | novice/flail | 14.0 | 30% (93) | 38% (13) | 49% (55) | 50 | 12.6 | 17.1 | 0 |
| cut33 | p1 | guided | typical/smart | 100.0 | 0% (149) | 0% (48) | 0% (200) | 160 | 74.3 | 30.6 | 3 |
| cut33 | p1 | guided | novice/smart | 100.0 | 0% (142) | 0% (46) | 0% (200) | 158 | 73.8 | 30.8 | 0 |
| cut33 | p1 | guided | novice/stand | 91.5 | 3% (130) | 0% (49) | 3% (189) | 128 | 74.3 | 38.7 | 0 |
| cut33 | p1 | guided | novice/masher | 0.0 | 100% (33) | - | - | 12 | 0.0 | 0.0 | 0 |
| cut33 | p1 | guided | novice/flail | 0.0 | 100% (35) | - | - | 18 | 6.9 | 23.1 | 0 |
| cut33 | p1 | standard | typical/smart | 93.0 | 1% (137) | 2% (44) | 2% (190) | 147 | 73.0 | 32.9 | 3 |
| cut33 | p1 | standard | novice/smart | 46.0 | 12% (117) | 17% (30) | 31% (133) | 113 | 52.8 | 30.8 | 1 |
| cut33 | p1 | standard | novice/stand | 22.0 | 24% (92) | 19% (16) | 44% (78) | 71 | 41.9 | 39.4 | 0 |
| cut33 | p1 | standard | novice/masher | 0.0 | 100% (33) | - | - | 10 | 0.0 | 0.0 | 0 |
| cut33 | p1 | standard | novice/flail | 0.0 | 100% (33) | - | - | 15 | 4.7 | 19.3 | 0 |
| cut33 | p1 | challenge | typical/smart | 50.0 | 10% (118) | 12% (26) | 25% (134) | 103 | 58.4 | 37.6 | 0 |
| cut33 | p1 | challenge | novice/smart | 9.5 | 18% (82) | 44% (18) | 73% (70) | 75 | 38.0 | 33.5 | 0 |
| cut33 | p1 | challenge | novice/stand | 9.5 | 25% (83) | 29% (14) | 63% (51) | 55 | 36.5 | 44.4 | 0 |
| cut33 | p1 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 9 | 0.0 | 0.0 | 0 |
| cut33 | p1 | challenge | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.4 | 18.6 | 0 |
| r2 | p1 | guided | typical/smart | 100.0 | 0% (138) | 0% (45) | 0% (200) | 159 | 76.6 | 31.7 | 1 |
| r2 | p1 | guided | novice/smart | 97.0 | 1% (145) | 2% (50) | 1% (195) | 156 | 73.8 | 31.2 | 0 |
| r2 | p1 | guided | novice/stand | 91.0 | 2% (137) | 0% (42) | 2% (185) | 127 | 75.0 | 39.2 | 0 |
| r2 | p1 | guided | novice/masher | 0.0 | 100% (33) | - | - | 11 | 0.0 | 0.0 | 0 |
| r2 | p1 | guided | novice/flail | 0.0 | 100% (33) | - | - | 18 | 6.8 | 22.7 | 0 |
| r2 | p1 | standard | typical/smart | 92.5 | 1% (130) | 2% (48) | 4% (192) | 144 | 74.4 | 34.3 | 0 |
| r2 | p1 | standard | novice/smart | 35.5 | 16% (103) | 9% (22) | 39% (116) | 103 | 49.0 | 31.4 | 0 |
| r2 | p1 | standard | novice/stand | 24.5 | 36% (87) | 25% (12) | 29% (69) | 66 | 39.8 | 39.8 | 0 |
| r2 | p1 | standard | novice/masher | 0.0 | 100% (33) | - | - | 10 | 0.0 | 0.0 | 0 |
| r2 | p1 | standard | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.5 | 18.7 | 0 |
| r2 | p1 | challenge | typical/smart | 43.5 | 18% (114) | 23% (22) | 29% (123) | 100 | 56.9 | 37.7 | 0 |
| r2 | p1 | challenge | novice/smart | 10.0 | 17% (78) | 45% (20) | 70% (67) | 75 | 39.7 | 35.1 | 0 |
| r2 | p1 | challenge | novice/stand | 2.0 | 36% (81) | 56% (9) | 91% (46) | 52 | 35.0 | 45.1 | 0 |
| r2 | p1 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 9 | 0.0 | 0.0 | 0 |
| r2 | p1 | challenge | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.2 | 18.0 | 0 |
| r4 | p1 | guided | typical/smart | 100.0 | 0% (142) | 0% (48) | 0% (200) | 161 | 77.7 | 31.7 | 1 |
| r4 | p1 | guided | novice/smart | 97.0 | 1% (144) | 0% (50) | 1% (195) | 159 | 75.3 | 31.1 | 1 |
| r4 | p1 | guided | novice/stand | 90.5 | 3% (134) | 0% (43) | 2% (184) | 131 | 76.3 | 38.7 | 0 |
| r4 | p1 | guided | novice/masher | 0.0 | 100% (33) | - | - | 11 | 0.0 | 0.0 | 0 |
| r4 | p1 | guided | novice/flail | 0.0 | 100% (33) | - | - | 18 | 6.9 | 22.8 | 0 |
| r4 | p1 | standard | typical/smart | 91.5 | 0% (129) | 5% (40) | 4% (190) | 148 | 74.6 | 33.2 | 2 |
| r4 | p1 | standard | novice/smart | 37.5 | 14% (102) | 19% (27) | 38% (121) | 107 | 51.7 | 31.7 | 0 |
| r4 | p1 | standard | novice/stand | 20.0 | 32% (81) | 40% (10) | 42% (69) | 67 | 40.0 | 39.5 | 0 |
| r4 | p1 | standard | novice/masher | 0.0 | 100% (33) | - | - | 10 | 0.0 | 0.0 | 0 |
| r4 | p1 | standard | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.6 | 19.0 | 0 |
| r4 | p1 | challenge | typical/smart | 43.5 | 12% (112) | 24% (21) | 31% (126) | 102 | 59.0 | 38.5 | 0 |
| r4 | p1 | challenge | novice/smart | 6.5 | 18% (80) | 52% (21) | 80% (66) | 76 | 40.0 | 34.7 | 0 |
| r4 | p1 | challenge | novice/stand | 6.0 | 27% (77) | 74% (19) | 74% (46) | 53 | 36.4 | 45.4 | 0 |
| r4 | p1 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 9 | 0.0 | 0.0 | 0 |
| r4 | p1 | challenge | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.3 | 18.5 | 0 |
| n1 | p1 | guided | typical/smart | 100.0 | 0% (143) | 0% (41) | 0% (200) | 156 | 75.7 | 31.9 | 0 |
| n1 | p1 | guided | novice/smart | 99.5 | 1% (135) | 0% (64) | 0% (199) | 160 | 74.7 | 30.7 | 1 |
| n1 | p1 | guided | novice/stand | 93.5 | 2% (144) | 2% (45) | 2% (190) | 130 | 76.0 | 38.9 | 0 |
| n1 | p1 | guided | novice/masher | 0.0 | 100% (33) | - | - | 12 | 0.0 | 0.0 | 0 |
| n1 | p1 | guided | novice/flail | 0.0 | 100% (35) | - | - | 18 | 6.9 | 22.8 | 0 |
| n1 | p1 | standard | typical/smart | 94.0 | 1% (122) | 0% (46) | 2% (192) | 145 | 74.3 | 33.9 | 1 |
| n1 | p1 | standard | novice/smart | 42.0 | 18% (104) | 16% (31) | 28% (117) | 104 | 48.9 | 31.1 | 0 |
| n1 | p1 | standard | novice/stand | 17.0 | 40% (89) | 31% (13) | 51% (69) | 68 | 39.2 | 38.2 | 1 |
| n1 | p1 | standard | novice/masher | 0.0 | 100% (33) | - | - | 10 | 0.0 | 0.0 | 0 |
| n1 | p1 | standard | novice/flail | 0.0 | 100% (33) | - | - | 15 | 4.6 | 18.7 | 0 |
| n1 | p1 | challenge | typical/smart | 49.5 | 19% (110) | 20% (25) | 24% (130) | 100 | 57.1 | 37.8 | 0 |
| n1 | p1 | challenge | novice/smart | 11.0 | 15% (84) | 45% (20) | 65% (63) | 76 | 40.6 | 35.1 | 0 |
| n1 | p1 | challenge | novice/stand | 4.5 | 28% (85) | 75% (12) | 79% (43) | 50 | 34.0 | 45.4 | 0 |
| n1 | p1 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 9 | 0.0 | 0.0 | 0 |
| n1 | p1 | challenge | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.2 | 17.8 | 0 |
| n3 | p1 | guided | typical/smart | 100.0 | 0% (142) | 0% (50) | 0% (200) | 166 | 77.9 | 30.8 | 4 |
| n3 | p1 | guided | novice/smart | 98.0 | 0% (145) | 0% (55) | 2% (199) | 159 | 76.0 | 31.4 | 0 |
| n3 | p1 | guided | novice/stand | 91.5 | 4% (132) | 0% (45) | 2% (187) | 131 | 76.3 | 38.6 | 0 |
| n3 | p1 | guided | novice/masher | 0.0 | 100% (33) | - | - | 11 | 0.0 | 0.0 | 0 |
| n3 | p1 | guided | novice/flail | 0.0 | 100% (33) | - | - | 18 | 7.2 | 23.5 | 0 |
| n3 | p1 | standard | typical/smart | 96.5 | 0% (130) | 2% (45) | 1% (195) | 147 | 76.5 | 34.4 | 1 |
| n3 | p1 | standard | novice/smart | 41.5 | 18% (102) | 23% (26) | 35% (128) | 108 | 52.2 | 31.9 | 0 |
| n3 | p1 | standard | novice/stand | 21.5 | 30% (82) | 33% (15) | 33% (64) | 68 | 41.0 | 40.2 | 0 |
| n3 | p1 | standard | novice/masher | 0.0 | 100% (33) | - | - | 10 | 0.0 | 0.0 | 0 |
| n3 | p1 | standard | novice/flail | 0.0 | 100% (33) | - | - | 15 | 4.8 | 20.0 | 0 |
| n3 | p1 | challenge | typical/smart | 45.5 | 16% (112) | 17% (18) | 28% (126) | 102 | 58.6 | 38.2 | 0 |
| n3 | p1 | challenge | novice/smart | 9.0 | 24% (85) | 47% (19) | 72% (64) | 76 | 40.6 | 35.1 | 0 |
| n3 | p1 | challenge | novice/stand | 5.5 | 30% (74) | 71% (17) | 77% (47) | 53 | 35.4 | 44.8 | 0 |
| n3 | p1 | challenge | novice/masher | 0.0 | 100% (33) | - | - | 9 | 0.0 | 0.0 | 0 |
| n3 | p1 | challenge | novice/flail | 0.0 | 100% (33) | - | - | 14 | 4.4 | 18.8 | 0 |
