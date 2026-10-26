# Q1 headless combat sim — Dojo Ascent

- Repo: https://github.com/Ingy372/Dojo-game, cloned to /workspace/dojo-game. **HEAD is 15e0c72** (Merge PR #8 bot-learning), two commits after the expected e3f5125. Neither newer commit touches packages/sim or content/ combat data, so the sim is the same. Nothing was committed or pushed, and no game code changed.
- Scratch files (inside the clone, untracked): `packages/sim/test/q1/bot2.ts` (copy of `test/balance/bot.ts` + `masher`/`flail` styles + extra stats), `q1.test.ts`, `flail.test.ts`, `doors.test.ts`. Analysis: `/workspace/qa/q1-sim/analyze.py`. Raw data: `raw.json`, `flail.json`.

## Commands
```
cd /workspace && git clone https://github.com/Ingy372/Dojo-game dojo-game && cd dojo-game && npm ci
cd packages/sim
RUNS=200 npx vitest run test/q1/q1.test.ts      # full grid + single rooms (~70 s)
npx vitest run test/q1/flail.test.ts            # flail style + masher at higher stats
npx vitest run test/q1/doors.test.ts --silent=false   # door offers, ?room= handling
python3 /workspace/qa/q1-sim/analyze.py
```

## Bots
- sharp/typical/novice × smart/stand: unchanged from bot.ts (reaction 4/6/8 ticks, timing SD 1.5/2.5/4 ticks).
- **masher** (stands in for a 6-year-old): walks straight at the nearest enemy and presses Strike whenever one is in Strike reach. It never counters, blocks, or dashes. The automatic basic attack still runs.
- **flail**: a masher that also presses Counter on 15% of ticks while a danger circle covers it, with no timing (a kid hitting every button).
- No bot uses Forms or the Virtue, so the p2 and p3 numbers understate those profiles.

## Profiles (how the stats were derived)
Each fixture went through `loadFeed` → `buildTraining(now = feed.asOf)` → `characterSetup(newProfile with an assumed level)`, plus assumed gear. The earned perk effects were passed in as gear effects, and the Forms/Virtue went into the player setup.
| profile | assumed level / gear | result |
|---|---|---|
| bare | none | 100 HP / 10 Power / 0 Guard (COMBAT.player) |
| p1 1-white-belt-new | L1, no gear | identical to bare (no sign-offs → no perks), so its rows match bare exactly |
| p2 2-white-belt-3-signoffs | L4 (cap 10), common wraps + gi (+1 P, +8 HP, +2 G) | 117 HP / 12.2 P / 2 G, Rooted Form, Shield virtue, staggerTicks+10, rippleCounter |
| p3 3-yellow-belt | L14 (cap 20), uncommon wraps + gi (+2 P, +14 HP, +3 G) | 153 HP / 17.2 P / 3 G, 2 Forms, 11 perks incl. counterWindow+1, strikeCost−8, counterStrength+0.5 |
The levels and gear are my guesses, since the fixtures only carry rank and sign-offs, not game level or loot.

## Full runs (seeds 1000-1199)

| profile | diff | bot | win% | won-run min | rooms reached | perfects/run | items/run (all) | items won/lost | timeouts | NaN | top death rooms |
|---|---|---|---|---|---|---|---|---|---|---|---|
| bare | guided | sharp/smart | 100% | 2.7 | 8.0 | 78.2 | 16.9 | 16.9/0.0 | 0 | 0 |  |
| bare | guided | typical/smart | 100% | 2.6 | 8.0 | 81.5 | 16.7 | 16.7/0.0 | 0 | 0 |  |
| bare | guided | novice/smart | 99% | 2.6 | 8.0 | 78.3 | 14.5 | 14.6/9.5 | 0 | 0 | narrow-bridge 1, keepers-hall 1 |
| bare | guided | novice/stand | 95% | 2.3 | 7.9 | 79.8 | 13.4 | 13.8/6.0 | 0 | 0 | training-yard 4, keepers-hall 3, lantern-room 2, bamboo-hall 1 |
| bare | guided | typical/stand | 100% | 2.3 | 8.0 | 83.9 | 16.7 | 16.7/0.0 | 0 | 0 |  |
| bare | guided | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.1 | 0.0/0.1 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| bare | standard | sharp/smart | 100% | 2.4 | 8.0 | 83.8 | 16.3 | 16.3/0.0 | 3 | 0 |  |
| bare | standard | typical/smart | 94% | 2.3 | 7.9 | 78.4 | 12.7 | 13.1/5.9 | 0 | 0 | keepers-hall 6, pillar-court 2, training-yard 2, shield-wall 1 |
| bare | standard | novice/smart | 34% | 2.1 | 6.2 | 52.4 | 6.1 | 9.6/4.3 | 0 | 0 | keepers-hall 49, training-yard 24, pillar-court 23, lantern-room 17 |
| bare | standard | novice/stand | 18% | 1.9 | 4.8 | 41.7 | 4.2 | 9.2/3.1 | 0 | 0 | training-yard 46, keepers-hall 29, pillar-court 25, lantern-room 19 |
| bare | standard | typical/stand | 82% | 2.1 | 7.5 | 74.1 | 10.7 | 12.0/4.8 | 0 | 0 | keepers-hall 11, training-yard 9, pillar-court 7, lantern-room 4 |
| bare | standard | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.1 | 0.0/0.1 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| bare | challenge | sharp/smart | 86% | 2.2 | 7.7 | 75.2 | 10.8 | 11.6/5.6 | 0 | 0 | keepers-hall 15, training-yard 5, pillar-court 3, narrow-bridge 2 |
| bare | challenge | typical/smart | 34% | 2.0 | 6.2 | 56.8 | 6.3 | 10.4/4.2 | 0 | 0 | keepers-hall 47, training-yard 28, pillar-court 20, lantern-room 14 |
| bare | challenge | novice/smart | 10% | 1.9 | 5.0 | 41.1 | 3.8 | 8.8/3.3 | 0 | 0 | keepers-hall 56, pillar-court 28, lantern-room 26, bamboo-hall 23 |
| bare | challenge | novice/stand | 5% | 1.7 | 4.2 | 36.1 | 2.9 | 8.6/2.6 | 0 | 0 | training-yard 35, pillar-court 34, keepers-hall 33, lantern-room 25 |
| bare | challenge | typical/stand | 24% | 1.8 | 5.2 | 48.2 | 5.0 | 10.2/3.3 | 0 | 0 | training-yard 32, keepers-hall 32, pillar-court 23, lantern-room 21 |
| bare | challenge | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.1 | 0.0/0.1 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| p1 | guided | novice/smart | 99% | 2.6 | 8.0 | 78.3 | 14.5 | 14.6/9.5 | 0 | 0 | narrow-bridge 1, keepers-hall 1 |
| p1 | guided | novice/stand | 95% | 2.3 | 7.9 | 79.8 | 13.4 | 13.8/6.0 | 0 | 0 | training-yard 4, keepers-hall 3, lantern-room 2, bamboo-hall 1 |
| p1 | guided | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.1 | 0.0/0.1 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| p1 | standard | novice/smart | 34% | 2.1 | 6.2 | 52.4 | 6.1 | 9.6/4.3 | 0 | 0 | keepers-hall 49, training-yard 24, pillar-court 23, lantern-room 17 |
| p1 | standard | novice/stand | 18% | 1.9 | 4.8 | 41.7 | 4.2 | 9.2/3.1 | 0 | 0 | training-yard 46, keepers-hall 29, pillar-court 25, lantern-room 19 |
| p1 | standard | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.1 | 0.0/0.1 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| p1 | challenge | novice/smart | 10% | 1.9 | 5.0 | 41.1 | 3.8 | 8.8/3.3 | 0 | 0 | keepers-hall 56, pillar-court 28, lantern-room 26, bamboo-hall 23 |
| p1 | challenge | novice/stand | 5% | 1.7 | 4.2 | 36.1 | 2.9 | 8.6/2.6 | 0 | 0 | training-yard 35, pillar-court 34, keepers-hall 33, lantern-room 25 |
| p1 | challenge | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.1 | 0.0/0.1 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| p2 | guided | novice/smart | 100% | 2.1 | 8.0 | 59.5 | 14.4 | 14.4/0.0 | 0 | 0 |  |
| p2 | guided | novice/stand | 100% | 2.0 | 8.0 | 60.5 | 14.1 | 14.1/15.0 | 0 | 0 | keepers-hall 1 |
| p2 | guided | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.1 | 0.0/0.1 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| p2 | standard | novice/smart | 87% | 2.0 | 7.7 | 54.2 | 10.9 | 11.7/5.4 | 0 | 0 | keepers-hall 11, pillar-court 6, training-yard 5, lantern-room 3 |
| p2 | standard | novice/stand | 68% | 1.9 | 7.2 | 49.1 | 9.2 | 11.0/5.1 | 0 | 0 | keepers-hall 22, training-yard 15, pillar-court 10, narrow-bridge 7 |
| p2 | standard | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.1 | 0.0/0.1 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| p2 | challenge | novice/smart | 46% | 1.8 | 6.9 | 47.4 | 8.0 | 10.8/5.6 | 0 | 0 | keepers-hall 53, pillar-court 17, lantern-room 12, bamboo-hall 9 |
| p2 | challenge | novice/stand | 43% | 1.7 | 6.7 | 45.5 | 7.7 | 11.1/5.2 | 0 | 0 | keepers-hall 50, training-yard 15, pillar-court 14, narrow-bridge 12 |
| p2 | challenge | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.1 | 0.0/0.1 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| p3 | guided | novice/smart | 100% | 1.6 | 8.0 | 37.1 | 11.3 | 11.3/0.0 | 0 | 0 |  |
| p3 | guided | novice/stand | 100% | 1.5 | 8.0 | 37.5 | 11.2 | 11.2/0.0 | 0 | 0 |  |
| p3 | guided | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.2 | 0.0/0.2 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| p3 | standard | novice/smart | 100% | 1.5 | 8.0 | 37.0 | 11.3 | 11.3/0.0 | 0 | 0 |  |
| p3 | standard | novice/stand | 100% | 1.5 | 8.0 | 37.2 | 10.9 | 10.9/0.0 | 0 | 0 |  |
| p3 | standard | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.2 | 0.0/0.2 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |
| p3 | challenge | novice/smart | 100% | 1.4 | 8.0 | 37.1 | 10.6 | 10.6/0.0 | 0 | 0 |  |
| p3 | challenge | novice/stand | 100% | 1.4 | 8.0 | 37.2 | 10.5 | 10.5/4.0 | 0 | 0 | keepers-hall 1 |
| p3 | challenge | novice/masher | 0% | 0.0 | 1.0 | 0.0 | 0.2 | 0.0/0.2 | 0 | 0 | narrow-bridge 48, bamboo-hall 42, training-yard 38, pillar-court 37 |

## Per-room death rate in full runs (bare white belt): deaths / times entered

| diff | bot | bamboo-hall | gauntlet | keepers-hall | lantern-room | narrow-bridge | pillar-court | shield-wall | training-yard |
|---|---|---|---|---|---|---|---|---|---|
| guided | sharp/smart | 0% (262) | 0% (52) | 0% (200) | 0% (266) | 0% (253) | 0% (244) | 0% (49) | 0% (265) |
| guided | typical/smart | 0% (254) | 0% (42) | 0% (200) | 0% (263) | 0% (254) | 0% (256) | 0% (56) | 0% (269) |
| guided | novice/smart | 0% (257) | 0% (41) | 1% (199) | 0% (253) | 0% (257) | 0% (261) | 0% (50) | 0% (250) |
| guided | novice/stand | 0% (254) | 0% (49) | 2% (193) | 1% (233) | 0% (249) | 0% (243) | 0% (44) | 2% (249) |
| guided | typical/stand | 0% (252) | 0% (39) | 0% (200) | 0% (271) | 0% (259) | 0% (253) | 0% (52) | 0% (266) |
| guided | novice/masher | 100% (42) | - | - | 100% (35) | 100% (48) | 100% (37) | - | 100% (38) |
| standard | sharp/smart | 0% (254) | 0% (38) | 0% (200) | 0% (278) | 0% (249) | 0% (255) | 0% (59) | 0% (263) |
| standard | typical/smart | 0% (238) | 0% (43) | 3% (193) | 0% (255) | 0% (246) | 1% (242) | 3% (37) | 1% (253) |
| standard | novice/smart | 5% (172) | 12% (24) | 42% (117) | 9% (187) | 4% (181) | 13% (178) | 6% (17) | 13% (184) |
| standard | novice/stand | 11% (147) | 55% (20) | 44% (66) | 14% (138) | 12% (136) | 18% (138) | 6% (16) | 31% (150) |
| standard | typical/stand | 0% (225) | 10% (29) | 6% (175) | 2% (225) | 0% (232) | 3% (232) | 0% (32) | 4% (227) |
| standard | novice/masher | 100% (42) | - | - | 100% (35) | 100% (48) | 100% (37) | - | 100% (38) |
| challenge | sharp/smart | 0% (229) | 4% (24) | 8% (188) | 0% (235) | 1% (241) | 1% (228) | 0% (41) | 2% (250) |
| challenge | typical/smart | 5% (177) | 19% (21) | 41% (115) | 8% (173) | 6% (179) | 11% (183) | 0% (21) | 15% (185) |
| challenge | novice/smart | 16% (147) | 44% (18) | 74% (76) | 19% (137) | 11% (151) | 20% (139) | 13% (15) | 15% (137) |
| challenge | novice/stand | 21% (119) | 89% (19) | 77% (43) | 20% (125) | 14% (125) | 28% (123) | 30% (10) | 29% (119) |
| challenge | typical/stand | 12% (147) | 34% (29) | 40% (80) | 14% (151) | 10% (145) | 16% (148) | 6% (18) | 20% (157) |
| challenge | novice/masher | 100% (42) | - | - | 100% (35) | 100% (48) | 100% (37) | - | 100% (38) |

## Damage taken by enemy type, mechanics use (avg per run; bare)

| diff | bot | dmg swarmer | dmg shield | dmg brute | dmg keeper | shield bounces | shield breaks | brute winded | hits on winded | grades S/A/B |
|---|---|---|---|---|---|---|---|---|---|---|
| guided | sharp/smart | 8 | 7 | 2 | 4 | 4.7 | 13.6 | 8.2 | 28.9 | 91/9/0% |
| guided | typical/smart | 8 | 10 | 10 | 6 | 5.4 | 13.8 | 7.8 | 27.1 | 90/10/0% |
| guided | novice/smart | 32 | 17 | 41 | 20 | 4.9 | 13.2 | 7.6 | 26.7 | 64/35/1% |
| guided | novice/stand | 27 | 18 | 60 | 20 | 7.7 | 11.9 | 3.9 | 6.1 | 57/42/1% |
| guided | typical/stand | 6 | 9 | 15 | 4 | 8.4 | 12.5 | 3.7 | 5.9 | 91/9/0% |
| guided | novice/masher | 76 | 23 | 10 | 0 | 2.0 | 0.0 | 0.4 | 0.0 | 0/0/0% |
| standard | sharp/smart | 20 | 11 | 10 | 6 | 11.3 | 13.4 | 6.8 | 25.2 | 88/11/0% |
| standard | typical/smart | 37 | 42 | 45 | 20 | 5.6 | 12.4 | 6.8 | 25.2 | 49/50/0% |
| standard | novice/smart | 61 | 31 | 81 | 24 | 3.6 | 8.5 | 5.2 | 18.6 | 20/76/3% |
| standard | novice/stand | 46 | 28 | 88 | 14 | 4.1 | 6.0 | 2.2 | 3.5 | 17/81/2% |
| standard | typical/stand | 30 | 41 | 69 | 19 | 8.6 | 10.5 | 3.5 | 5.7 | 41/58/1% |
| standard | novice/masher | 86 | 19 | 0 | 0 | 0.9 | 0.0 | 0.2 | 0.0 | 0/0/0% |
| challenge | sharp/smart | 67 | 38 | 41 | 18 | 4.7 | 11.4 | 6.1 | 23.4 | 36/63/1% |
| challenge | typical/smart | 58 | 29 | 85 | 22 | 3.2 | 8.2 | 4.4 | 16.5 | 24/75/1% |
| challenge | novice/smart | 90 | 38 | 45 | 16 | 1.9 | 6.2 | 3.7 | 13.4 | 10/88/2% |
| challenge | novice/stand | 68 | 36 | 62 | 10 | 2.8 | 4.8 | 1.7 | 2.5 | 9/91/0% |
| challenge | typical/stand | 47 | 26 | 94 | 14 | 3.8 | 6.5 | 2.1 | 3.3 | 19/81/0% |
| challenge | novice/masher | 88 | 19 | 0 | 0 | 0.7 | 0.0 | 0.2 | 0.0 | 0/0/0% |

## Single-room runs (bare white belt, full health, 100 seeds each, seeds 5000-5099): clear% / avg secs / avg dmg taken

| room | guided typical/smart | guided novice/smart | guided novice/masher | standard typical/smart | standard novice/smart | standard novice/masher | challenge typical/smart | challenge novice/smart | challenge novice/masher |
|---|---|---|---|---|---|---|---|---|---|
| bamboo-hall | 100% / 20s / 3 | 100% / 19s / 10 | 0% / 13s / 100 | 100% / 18s / 16 | 98% / 19s / 30 | 0% / 11s / 100 | 99% / 17s / 35 | 96% / 17s / 56 | 0% / 12s / 100 |
| gauntlet | 100% / 37s / 8 | 100% / 38s / 25 | 0% / 14s / 100 | 99% / 35s / 37 | 81% / 37s / 60 | 0% / 12s / 100 | 85% / 32s / 63 | 64% / 32s / 80 | 0% / 11s / 100 |
| keepers-hall | 100% / 32s / 14 | 96% / 34s / 44 | 0% / 12s / 100 | 90% / 33s / 59 | 31% / 30s / 94 | 0% / 11s / 100 | 32% / 29s / 91 | 1% / 21s / 100 | 0% / 11s / 100 |
| lantern-room | 100% / 19s / 4 | 100% / 19s / 15 | 0% / 11s / 100 | 100% / 16s / 20 | 97% / 18s / 50 | 0% / 11s / 100 | 97% / 16s / 42 | 92% / 16s / 55 | 0% / 10s / 100 |
| narrow-bridge | 100% / 20s / 6 | 100% / 20s / 10 | 0% / 15s / 100 | 100% / 18s / 24 | 100% / 19s / 34 | 0% / 11s / 100 | 100% / 17s / 37 | 98% / 16s / 48 | 0% / 10s / 100 |
| pillar-court | 100% / 20s / 6 | 100% / 20s / 18 | 0% / 10s / 100 | 100% / 20s / 29 | 88% / 20s / 55 | 0% / 9s / 100 | 96% / 18s / 50 | 84% / 18s / 67 | 0% / 9s / 100 |
| shield-wall | 100% / 23s / 9 | 100% / 22s / 15 | 0% / 13s / 100 | 100% / 22s / 33 | 96% / 22s / 42 | 0% / 11s / 100 | 97% / 19s / 38 | 76% / 20s / 68 | 0% / 10s / 100 |
| training-yard | 100% / 26s / 8 | 100% / 26s / 17 | 0% / 13s / 100 | 100% / 24s / 24 | 91% / 25s / 51 | 0% / 12s / 100 | 92% / 23s / 52 | 91% / 23s / 51 | 0% / 12s / 100 |

## Room mix (bare/guided/sharp-smart): rooms-per-run distribution {8: 200}; kinds visited {'battle': 1290, 'challenge': 101, 'boss': 200, 'rest': 5, 'treasure': 4}
First room distribution: {'pillar-court': 37, 'bamboo-hall': 42, 'narrow-bridge': 48, 'lantern-room': 35, 'training-yard': 38}
## Masher / flail extra (200 full runs, seeds 1000-1199; masher narrow-bridge alone, 100 seeds)
| base | diff | flail win | flail survives (s) | flail perfects | masher narrow-bridge alone: clear / secs |
|---|---|---|---|---|---|
| bare | guided | 0% | 18.9 | 6.9 | 0% / 15.3 |
| bare | standard | 0% | 15.0 | 4.6 | 0% / 10.8 |
| bare | challenge | 0% | 14.8 | 4.6 | 0% / 9.9 |
| p3 stats | guided | 1% | 41.0 (2.75 rooms) | 10.9 | 0% / 17.9 |
| p3 stats | standard | 0% | 28.2 | 6.5 | 0% / 15.7 |
| p3 stats | challenge | 0% | 27.9 | 6.6 | 0% / 14.3 |

## Findings
1. **A 6-year-old masher can't clear a single room on any difficulty or profile.** Masher: 0% win in 200 runs × 3 difficulties × 4 profiles, and it dies in room 1 after 10–15 s, which matches the ~14 s room-1 loss from live play on Oct 12. Every single room is 0% too. Flail (random Counter presses) also scores 0%, and yellow-belt stats only stretch survival to 28–41 s. Guided doesn't help a player who never counters: its only change is a longer counter window, so the only effect is about 0.25 s slower enemy swings. Damage the masher takes comes ~80% from swarmers (crowding).
2. Anyone who counters wins Guided easily: 95–100% for every non-masher bot, and S grades on ~90% of rooms for typical+. The cliff is between "counters at all" and "doesn't", not between difficulties.
3. Standard novice: 34% (smart) / 18% (stand). Challenge novice: 10% / 5%.
4. **Keeper's Hall is the run killer** above Guided: 42–44% of standard novice entries die there, and 74–77% on challenge. Alone at full HP, standard novice clears it 31% and challenge novice 1%.
5. **Training Yard, a first-room candidate, is the hardest normal battle room for "stand" players** (31% standard death rate vs 11–18% elsewhere). It's the only battle room with a **Brute in wave 1**.
6. Gauntlet is deadly for stand players (55% standard, 89% challenge) but it's rarely entered.
7. **Profile strength matters a lot.** Standard novice/smart: p1 34% → p2 87% → p3 100%. Challenge: 10% → 46% → 100%. Yellow-belt stats (+53% HP, +72% Power, perks) remove all difficulty for a novice who counters, even on Challenge, but don't save a masher.
8. Run length: won runs take 1.4–2.7 sim minutes (p3 ~1.5) vs the 5–7 min target. Rooms take 16–38 s each and a floor is always exactly 8 rooms.
9. Items: winners get 11–17 items/run, losers 3–6. Losing early (masher) gives ~0.1 items. A weak player gets almost nothing per run.
10. Perfect counters per run: 75–84 for good bots on Guided/Standard, ~37 for p3 (enemies die faster). The grade's perfect-counter point is trivial for anyone who counters.

## Bugs / oddities
| what | what happened | expected | severity |
|---|---|---|---|
| Unknown `?room=` value | `startRun` with firstRoomId `nope` silently starts a random room (pillar-court for seed 1) but still flags the run `test` (no personal bests) | ignore an unknown id (test=false), or show "room not found" | low |
| `?room=training` with the Tower | TitleScene sends `room=training` to the practice scene. If the Tower starts with the param still in the URL, tower.ts passes 'training' (the room id is `training-room`), so it falls into the case above | match ids, or have tower.ts ignore 'training' | low |
| `?room=keepers-hall` | skips straight to the boss at depth 0. Doors = ['home'], so beating it ends the run as "cleared" (flagged test). Works as a test link. | OK; note it's a one-room "floor" | info |
| `?room=` does skip in | `?room=<valid id>` → `startRun({firstRoomId})` starts in that room; `?seed=` positive numbers are used, others → random | as designed | – |
| Counter window | `counterWindowTicks` = DIFFICULTY window (10/6/4) + bonuses; windup = round(fill×fillScale)+window, matches config (guided/standard same fill, challenge 0.8×) | – | OK |
| Timeouts / NaN | 3 rooms hit the bot's 6-min cap (all sharp/smart, standard) across 7,200 full runs. I didn't trace the cause; those runs still finished as wins. 0 NaN. | – | info |
| Bot door choice | Treasure/rest doors are offered often (depth 0: treasure 197, rest 272 offers in 500 seeds) but bots took them only 9 times in 1,600 rooms, because chooseDoor re-rolls its random pick every tick. Balance bot only, so the existing balance report under-counts rest/treasure (and over-counts fights). | pick the door once per room | low (tooling) |

## For "more varied and rewarding combat"
- **Enemies feel alike to a masher.** All four attack with strength 1 and one circle telegraph. Only the numbers differ (12/14/16/18–22-tick telegraphs). The only distinct mechanics are the Shield (bounces basic attacks) and the Brute's winded state.
- **Winded matters, but only if you know it.** Brutes get winded ~7×/run. Smart bots land ~25 hits on winded brutes per run vs ~6 for stand bots, and stand bots take 1.5–2× more Brute damage. That's a good mechanic, but nothing in the game teaches it.
- **Shield mechanics barely show up:** 1–11 bounces per run. Strikes and Perfect Counters break shields ~12×/run without the player ever planning around it.
- **Room mixes are one template.** Every battle room is ~4 swarmers, then 1 Brute or Shield + 3 swarmers, then the other + 2–4 swarmers. The rooms differ mainly in layout. Ideas: rooms built around one mechanic (all-Brute "winded" room, a shield ring), a swarmer-free duel room, and a second boss pattern.
- Rest and treasure rooms are offered often but give no combat variety. Challenge rooms are the only variant, and the bot rarely sees them.
- **The reward floor for a non-counter player is zero.** A masher can't clear room 1, so it never sees loot, Insights, or doors. A guided first Counter (Learning proposal 6) or any assist mode that lets a first-time player land counters looks like the single biggest lever.
