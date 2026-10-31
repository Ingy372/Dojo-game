# R-INSIGHT-BAL: Balance the between-room Insight cards

Status: proposal for Jay, the Programmer, the Content Designer and the Tester (round 4, updated after the Manager's review of PR #386). No game code, content or work board changed. Sim code stays local; a reference copy is in `R-INSIGHT-BAL-sim/` (section 10).
Labels: **[MEASURED]** from the sim, **[CODE]** read from main, **[PROPOSED]** my numbers, **[GUESS]** not measured.

## Read this first

- **The ask:** no Insight family or route should be much stronger than another. Real training stays the main source of power. Nothing here costs money or adds pressure.
- **Decisions already made by the Manager (recorded):** (1) the Virtue cards come after the beta, as a placeholder until Jay says otherwise; (2) Press the Advantage and Wind Step may change what they do; (4) Double Strike halved (0.6 to 0.3) and Rally x1.75 are approved; (5) the "20% faster" Quick Hands text is approved; (6) the PE 12 kata reserve stays.
- **Round 5 (on PR #389) [MEASURED]:** B-T3-TUNE-2 masher "drop" (83.9 to 55.0% at 60 seeds) is mostly small-sample luck; the true rate is about 74% on main and F. Data-only tune: Wind Step 0.3 / every 5 / 2 s (true rate 81.6%), plus a masher seed count of 600 (floor stays 75%). P5 step-out is a wash on any card numbers; it needs a method or bot fix. See section 4f.
- **What was wrong [MEASURED]:** one card held all run was worth 35 PE (Ripple Counter) down to 2 PE (Wind Step), and the Power route won 10% of kid runs against 53% for Flowing.
- **Route result, kid, Standard, 150 seeds [MEASURED], Heavy Hands untouched at 0.2:**

| Measure | Rooted | Flowing | Power | Virtue (placeholder) | Spread |
|---|---|---|---|---|---|
| Before (main), all family cards held all run | 21% | 53% | 10% | n/a (1 card) | 43 |
| Round 3 (this PR before today), held (100 seeds) | 23% | 59% | 31% | 52% | 36 |
| **Now, held all run** | **28%** | **38%** | **32%** | **34%** | **10** |
| Round 3, real pick screen (lean picker) | 52% | 55% | 53% | 61% | 9 |
| **Now, real pick screen (lean picker)** | **50%** | **46%** | **47%** | **48%** | **4** |

  The "Power 40% vs Flowing 59%" figure quoted earlier mixed rounds: 40% was the round-2 Power route with Heavy Hands 0.25. The round-3 figures in the old 4d table were Power 23% vs Flowing 56% at 30 seeds; at 100 seeds the same setup reads 31% vs 59%.
- **How the gap closed (all in-route levers):** Flowing comes down (Wind Step lighter and rarer, Double Strike 0.2); Power goes up through Shield Breaker (new small rule: breaking a shield gives 7 Focus) and the Press the Advantage widening already in round 3; Rooted goes up a little (Iron Skin 1.2); Virtue placeholders go down (Calm Breath 0.15, Steady Start 40).
- **Caps [MEASURED]:** all 55 pairs under PE 50 on every bot (max kid 43.2, newer 46.5, careful 36.9); kata ceilings 38 / 62 / 67 hold (max 36.1 / 60.0 / 49.5); every card PE 15.4-24.4 for the kid (two cards, Ripple Counter 24.2 and Quick Hands 24.4, sit 1 over the "about 23" line, inside the +/-5 noise); the 9-card pool is 56% (was 59%); Guided pool 96%, Challenge pool 32% (was 96 and 30).
- **Open items:** (a) held-route spread is 10 only with Double Strike 0.2, a deeper cut than the approved 0.3; with 0.25 it measured 12 and at 0.3 I expect about the same or a little more (not measured). (b) The 11-card pool (with the Virtue placeholders) reads 45%, under the 45-70% band at belts 5-8; stronger placeholders fix that but push the Virtue route above the others (section 4e). Both are in section 8.
- **New fact (after the beta): one kata power in the run.** Each signed-off kata unlocks one power, and the player brings exactly one into the tower. A white belt only has Basic Form 1; an orange belt picks from 3. Jay will send the powers, so **I did not pick or tune any**. The budgets keep a reserve for one kata power (section 6, test in section 7).

## 1. Method

- **Docs first:** `docs/core-design.md` (section 13 wins), `docs/decisions.md` Insight lines, `drafts/planning/R-KATA-POWERS.md` (+12% damage cap), R-BAL-12.
- **Code read [CODE]:** `content/insights/insights.json` (9 cards, 4 families: Rooted, Flowing, Power, Virtue), `packages/sim/src/{insight,effects,run,world}.ts`. After each battle or challenge room the player picks 1 of 3. A run has 8 rooms, so up to 7 picks. A card is kept for the run and never offered twice.
- **Balance-check skill** followed: tiers = belts 1–10 × Guided / Standard / Challenge; every tier gets inputs, a result, a target and PASS/FAIL; neighbour jumps over about 2x are flagged; numbers are only proposed where every tier passes.
- **Bots** (all use `ARTISTS.typical` stats for the belt, same seeds for every config):
  - **kid** = kid style, novice skill, 12% random presses.
  - **newer** = smart style, typical skill.
  - **careful** = smart style, sharp skill.
- **Challenge is locked until belt 4 [CODE, P6]**, so Challenge belts 1–3 are informational only.
- **Cross-check with the Manager's table [MEASURED]:** I re-ran "each card offered alone", kid, Standard, belts 2/4/6/8/10, 30 seeds. All 9 cards and the random pool match the Manager's numbers exactly (30 / 25 / 21 / 9 / 7 / 7 / 6 / 5 / 3, pool 64, none 2).
- **Careful and newer win 100% almost everywhere.** Win rate cannot separate cards for them, so I used **health lost per fight and ticks per fight** (and rooms cleared where it varies). The kid bot is the only one whose win rate moves, so it carries the win-rate checks.
- **Power-Equivalent (PE), the ruler [MEASURED]:** I ran synthetic cards of "+10 / 20 / 30 / 40 / 60% Power" on every bot and setting. A card's **PE = the mean of three readings, each looked up on that ruler: rooms cleared, health lost per fight, ticks per fight.** Heavy Hands (+20% Power) is PE 20 by definition. Noise is about **±5 PE** (30–40 seeds × 10 belts). PE tops out at 60 (the ruler's last point); I also ran +80/100/150%: the skilled bots barely move past 60 (newer ticks per fight go 206 → 185 from +60% to +150%, health lost stays flat), so a skilled PE near 60 means "at the ceiling".
- **"Held" vs "offered":** the PE grid gives the card from the first room (held all run) to measure its size cleanly. The "offered alone" and pool runs use the real pick screen.
- **Two route measures (new):** (a) **held:** the family's cards are given from room 1 and kept all run (the Manager's measure, an upper bound); (b) **lean picker:** the real pick screen, the bot takes a card of its target family whenever one is offered, otherwise a random card. (b) is fairer to Rooted, which has only 2 cards. Route runs use 150 seeds (kid) because 30-seed route win rates move +/-8 points.
- **Extra bots:** a **best-pick bot** (greedy: picks the card with the best solo + pair PE for the cards it already holds), a **worst-pick bot** (the reverse) and the random pool (the real game, bots pick randomly).

## 2. Report (before: main today)

### 2a. Per card, held all run, Standard, PE [MEASURED]

| Card | Family | kid | newer | careful | Kid win % if offered alone (Manager's table) |
|---|---|---|---|---|---|
| Ripple Counter | Rooted | **35** | 20 | 26 | 30 |
| Double Strike | Flowing | **33** | 33 | 26 | 25 |
| Quick Hands | Flowing | **31** | 6 | 3 | 9 |
| Rally | Virtue | **28** | 0 | 0 | 21 |
| Heavy Hands | Power | 20 | 17 | 18 | 7 |
| Shield Breaker | Power | 14 | 1 | 4 | 7 |
| Iron Skin | Rooted | 9 | 1 | 0 | 5 |
| Press the Advantage | Power | 5 | 4 | 5 | 6 |
| Wind Step | Flowing | 2 | 0 | 0 | 3 |

Why the skilled bots read near 0 for some cards [MEASURED, partly GUESS]: Rally only works below half Health, and the skilled bots rarely get there. Iron Skin needs blocks. Quick Hands and Wind Step are speed, which those bots do not turn into much. These are **skill-gated or kid-leaning** cards so the floor is only checked on the kid (section 3).

### 2b. Per family and route, Standard, PE (win % for the kid) [MEASURED]

| Route (all cards of the family held) | kid | newer | careful | per card (kid) |
|---|---|---|---|---|
| Rooted (Ripple + Iron Skin) | 38 (21%) | 24 | 42 | 19 |
| Flowing (Wind Step + Double Strike + Quick Hands) | 49 (53%) | 41 | 38 | 16 |
| Power (Press + Shield Breaker + Heavy Hands) | 31 (**10%**) | 23 | 24 | **10** |
| Virtue (Rally alone) | 28 (n/a) | 0 | 0 | 28 |

**Power is 3x behind Flowing in kid wins (10% vs 53%)**, and Virtue cannot be a route.

### 2c. Top pairs, before [MEASURED]

- 36 pairs of the 9 cards. Over PE 45 for the kid: **6 pairs** (Double Strike + Rally 50, Ripple + Double 48, Double + Quick 48, Ripple + Quick 48, Quick + Rally 48, Ripple + Heavy 45). Skilled bots: **Ripple + Double Strike reaches PE 57 (newer) and 60 (careful)**.
- Bottom: Wind Step + Press 3, Iron Skin + Wind Step 6, Iron Skin + Press 9, Wind Step + Shield Breaker 10 (all kid).
- **Rally multiplies Focus-hungry cards:** Double Strike + Rally is the strongest kid pair (PE 50, 68% wins).

### 2d. Picking well vs badly, Standard, 60 seeds [MEASURED]

| Bot | Best-pick win % (PE) | Worst-pick win % (PE) |
|---|---|---|
| kid | 77% (50) | 29% (21) |
| newer | 100% (60) | 100% (17) |
| careful | 100% (57) | 100% (7) |

Random pool for the kid is about 59–62% (120 seeds). So a kid who picks well wins 48 points more of their runs than one who picks badly (77% vs 29%). **That gap is the "some routes are overpowered" problem.**

## 3. Power budget per family [PROPOSED]

Rule: **real training stays the main source of power.** All Insights together are temporary and about 41 PE of kid pool power today; they must not grow.

| # | Budget line | Limit | Applies to |
|---|---|---|---|
| B1 | **Single card, held all run, Standard** | **PE 12–26** (target about 20) | the **cap** (26) applies to all bots; the **floor** (12) applies to the **kid only**, because only the kid bot uses every card. Each card must also reach PE 12 on at least one bot |
| B2 | **Skilled-bot single-card cap** | PE ≤ 30 | newer, careful, Standard |
| B3 | **Any pair** | PE ≤ **50** | all bots, Standard |
| B4 | **Full-family route, per card** | each route's PE ÷ cards within **±25%** of the 4-route mean; route PE ≤ 55 | kid, Standard |
| B5 | **Random pool** | kid Standard win % in **45–70%**, mean within **6 points** of today's 59%, each belt within 15 points; Guided pool ≥ 90%; Challenge pool within 10 points of today's 30% | kid |
| B6 | **Best-vs-worst picking gap** | kid win % gap ≤ 25 points (today 48) | kid, Standard |
| B7 | **Neighbour jump** | no card is more than 2x another card's PE (floor card to top card) | kid, Standard |
| B8 | **Kata-power reserve** | **PE 12** held back (see section 6). Cards + one kata power must stay under **B1–B3 + 12** | all bots |
| B9 | Guided and Challenge | informational: single card PE ≤ 32 for the kid | kid |
| B10 | **Route spread (new)** | kid, Standard, 150 seeds, all family cards held from room 1: highest minus lowest route win rate **about 10 points or less** (noise +/-4, so the test fails above 14). On the real pick screen (lean picker) the spread must also be 10 or less. Heavy Hands stays at 0.2 | kid, Standard |

**Family budget:** a family has no budget of its own beyond B1 and B3 for its cards. B4 keeps the families level against each other. Rooted (2 cards) is judged per card, so it is not punished for having only two.

**Why skilled bots are not held to the floor (named reasons, measured in 4b):** most cards read under 12 for newer and careful. That is a bot limit, not a weak card.
- **Rally:** only works under half Health, which skilled bots rarely reach.
- **Iron Skin:** needs blocks; skilled bots block rarely in the sim.
- **Wind Step, Quick Hands:** speed cards; the sim sees little value in speed for skilled bots.
- **Shield Breaker:** a switch with no number; it only matters in shield rooms. Kid reads 12.9, just over the floor and inside the ±5 noise.
- **Calm Breath, Steady Start:** Focus cards; skilled bots read 5–11.
- A card that falls under 12 on the kid is a FAIL; the only way out is a change to the card, not a waiver.

## 4. Proposed changes and re-sim (round 4)

### 4a. The changes [PROPOSED]

Numbers in bold are new this round. Heavy Hands is unchanged at 0.2.

| Card | Before (main) | After | Card text after | Why |
|---|---|---|---|---|
| Ripple Counter | `amount` 1.5 | **1.2** | unchanged | top card for the kid (PE 35) |
| Iron Skin | `blockReflect` 0.5 | **1.2** (round 3: 1.0) | "Blocks bounce the hit back at the attacker, and then some." | lifts the Rooted route (28% held); kid-leaning card (PE 0-1 for skilled bots) |
| Wind Step | 0.4 burst, every 10 hits, 3 s | **0.3 burst, every 5 hits, 2 s** + rule tweak A (round 4: every 7 / 3 s; round 3: 0.4 / 5 / 4 s) | "Every 5 combo hits gives you a 2-second burst of speed." | with tweak A it is a real card; the lighter number brings the Flowing route down |
| Double Strike | `amount` 0.6 | **0.2** (approved: 0.3) | unchanged | Flowing route; needs the Manager's OK because it is below the approved 0.3 (section 8) |
| Quick Hands | `attackSpeed` 0.25 | 0.2 (approved) | "Your basic attacks are 20% faster." | the 12-tick attack rounds, so 0.15 and 0.2 are the same speed (re-checked: identical results) |
| Rally | `amount` 1 (x2) | 0.75 (x1.75, approved) | "Focus fills 75% faster when your health is below half." | PE 28 to 23 |
| Press the Advantage | `staggerBonus` 0.3 | 0.3 + rule tweak B | "Staggered, winded or recovering enemies take 30% more damage." | PE 5 to 18 |
| **Shield Breaker** | no number | **+ rule tweak C: 7 Focus when a hit breaks a shield** | "Any hit breaks shields, and breaking one gives you a little Focus." | PE 14 to 18 and lifts the Power route without touching Heavy Hands |
| Heavy Hands | unchanged | unchanged (0.2) | unchanged | |
| **Calm Breath** (placeholder, Virtue, after the beta) | n/a | `focusGain` **0.15** | "Focus fills 15% faster." | route balance (round 3: 0.3) |
| **Steady Start** (placeholder, Virtue, after the beta) | n/a | `startFocus` **40** | "Start each fight with a Strike ready." (a Strike costs 30 Focus [CODE]) | route balance (round 3: 70) |

**Rule tweaks (code, small) for the Programmer.** All three were measured locally behind env switches; the exact lines are in `R-INSIGHT-BAL-sim/experiment-world.patch`.
- **A. Wind Step:** while the speed burst runs, basic attacks also get half of the burst's bonus (`world.ts`, attack-speed line).
- **B. Press the Advantage:** the bonus also applies while the enemy is winded or recovering, not only staggered (`landHit`).
- **C. Shield Breaker (new):** when a hit lands on a shielded enemy and the player has Shield Breaker, add 7 Focus (`landHit`, switch `SB_FOCUS=7`). Two other levers, stagger after the break and bonus damage on shielded enemies, are in the patch but not used.

**What I tried for the routes and why this setup [MEASURED, kid, Standard, 120-200 seeds, held routes].**
- Power route: Press 0.3 alone read 31%; Press 0.5 (no Shield Breaker change) read 38%; Press 0.8 read 53%; Shield Breaker Focus 10-15 read 44-47% (too high once Flowing comes down); Focus 5-7 read 32-34%, and Focus 10-15 puts the Shield Breaker card at PE 24, over the line. With 7 Focus the Shield Breaker card is PE 17.7 (before 14).
- Flowing route: with Wind Step 0.4 / every 5 / 4 s but no tweak A the route read 29% (Wind Step alone PE 3, under the floor), so tweak A is what makes it a card; Wind Step 0.3 / every 7 / 3 s with Double Strike 0.2 read 38% (round 5 setting 0.3 / every 5 / 2 s reads 37%); Double Strike 0.25 read 40%.
- Rooted route: has only 2 cards and saturates near 28% held (Ripple 1.2-1.3 and Iron Skin 1.15-1.25 all read 24-28%); Iron Skin 1.5 pushes the card past PE 30. The real pick screen is the fairer measure for Rooted (50% there).
- Virtue placeholders: Calm Breath 0.3 + Steady Start 70 read 52% held; 0.3 + 40 read 47%; 0.25 + 50 read 48%; 0.15 + 40 reads 34%.
- Heavy Hands 0.25 was rejected in round 2 (Ripple + Heavy Hands reached PE 56 for the newer bot) and is not used.

### 4b. Per card, after, held all run, Standard, PE (win % for the kid) [MEASURED, kid 100 seeds, newer and careful 50 seeds, belts 1-10]

| Card | kid | newer | careful | In band? |
|---|---|---|---|---|
| Quick Hands | 24.4 (13%) | 1.1 | 2.6 | PASS (1 over 23, inside noise) |
| Ripple Counter | 24.2 (14%) | 16.7 | 18.9 | PASS (1 over 23, inside noise) |
| Iron Skin | 23.2 (14%) | 0.4 | 1.0 | PASS |
| Rally | 22.7 (17%) | 0.0 | 0.0 | PASS |
| Heavy Hands | 20.9 (12%) | 16.1 | 16.0 | PASS |
| Wind Step | 14 (9%) (round 5; round 4 every 7 / 3 s: 18.3) | 2 | 3 | PASS |
| Shield Breaker | 17.7 (9%) | 3.0 | 4.0 | PASS |
| Press the Advantage | 17.6 (10%) | 10.6 | 17.6 | PASS |
| Steady Start (placeholder) | 17.2 (9%) | 4.5 | 5.7 | PASS |
| Double Strike | 15.9 (10%) | 12.7 | 15.6 | PASS |
| Calm Breath (placeholder) | 15.4 (9%) | 7.3 | 8.6 | PASS |

- **Kid range 15.4-24.4: biggest ratio 1.6x. B7 PASS.** Before it was 35 to 2 (17x). No card under the PE 12 floor on the kid.
- **Skilled cap B2:** highest is 18.9 (careful, Ripple Counter). PASS.

### 4c. Per card, Guided and Challenge, after, PE (kid / newer / careful) [MEASURED, informational, 60 / 30 / 30 seeds]

| Card | Guided | Challenge |
|---|---|---|
| Ripple Counter | 29.1 / 6.6 / 38.5 | 24.0 / 17.4 / 26.6 |
| Iron Skin | 5.6 / 0.7 / 0.6 | 31.8 / 5.3 / 8.2 |
| Wind Step | 7.0 / 2.5 / 2.9 | 18.6 / 15.0 / 10.1 |
| Double Strike | 12.7 / 7.4 / 8.4 | 20.8 / 17.6 / 26.5 |
| Quick Hands | 22.4 / 20.8 / 5.3 | 30.1 / 20.3 / 11.2 |
| Press the Advantage | 10.0 / 30.7 / 10.5 | 17.4 / 18.9 / 14.0 |
| Shield Breaker | 9.0 / 17.9 / 3.2 | 25.7 / 6.6 / 9.8 |
| Heavy Hands | 16.5 / 30.6 / 10.6 | 21.4 / 23.7 / 14.8 |
| Rally | 17.8 / 4.6 / 0.6 | 27.7 / 0.5 / 0.0 |
| Calm Breath | 8.0 / 20.1 / 0.8 | 23.5 / 13.0 / 12.5 |
| Steady Start | 10.8 / 20.8 / 31.8 | 22.5 / 7.9 / 11.5 |

- **B9 PASS for the kid:** highest 29.1 on Guided and 31.8 on Challenge (Iron Skin, 0.2 under the 32 line; Challenge belts 1-3 are locked and informational).
- **Flag:** careful on Guided reads 38.5 (Ripple) and 31.8 (Steady Start) with about 0.2% Health lost per fight; mostly noise, Guided is 100% wins for the skilled bots. Not used to tune.
- **Guided and Challenge routes, kid wins (held):** Guided Rooted 77 / Flowing 86 / Power 86 / Virtue 85; Challenge Rooted 16 / Flowing 32 / Power 28 / Virtue 26. Rooted is lowest there too; these tiers are informational.

### 4d. Pairs and routes, after, Standard [MEASURED, pairs: kid 60, newer and careful 30 seeds; routes: 150 / 60 / 60]

| Check | Before (main) | After | Target | Result |
|---|---|---|---|---|
| Pairs over PE 45, kid | 6 of 36 | **0 of 55** (max 43.2, Ripple + Heavy Hands) | none over 50 | PASS |
| Highest pair, newer | 57.5 | **46.5** (Double Strike + Heavy Hands) | at most 50 | PASS |
| Highest pair, careful | 59.5 | **36.9** (Ripple + Heavy Hands) | at most 50 | PASS |
| Lowest pair, kid | 3 | **22.0** (Double Strike + Steady Start) | none under 20 | PASS |
| Pair mean, kid | 33.1 | 33.1 | n/a | n/a |

| Route (all cards held) | kid PE (win %) | newer PE | careful PE | kid PE per card |
|---|---|---|---|---|
| Rooted (2 cards) | 39 (28%) | 17 | 21 | 19.5 |
| Flowing (3) | 45 (37%) | 28 | 15 | 15.0 |
| Power (3) | 45 (32%) | 27 | 27 | 15.0 |
| Virtue placeholder (3) | 41 (34%) | 10 | 10 | 13.7 |

| Route, real pick screen (lean picker) | kid PE (win %) | newer PE | careful PE |
|---|---|---|---|
| Rooted | 39 (49%) | 32 | 25 |
| Flowing | 36 (43%) | 29 | 23 |
| Power | 38 (49%) | 32 | 26 |
| Virtue placeholder | 35 (48%) | 24 | 19 |

- **B10 held spread: 9 points (28 to 37), PASS at the target (noise +/-4).** Pick-screen spread: 6 points (43 to 49). (Tables in 4b and 4d show the round 5 Wind Step, 0.3 / every 5 / 2 s; section 4f has the round 4 comparison.)
- **B4:** per-card mean 15.8, so +/-25% is 11.9-19.8. All four pass (13.7-19.5), route PE at most 45 (limit 55).
- **Not reached, said plainly:** no setup inside the limits gets Rooted equal to the others when all family cards are held, because Rooted has 2 cards and no pair under PE 50 with both cards under about 24 gets past 28-30% (Ripple 1.3 and Iron Skin 1.25 were tried). The route spread is closed by bringing the 3-card families down towards it. The held spread of 10 uses Double Strike 0.2; with 0.25 it measured 12.

### 4e. Random pool and picking, kid, Standard [MEASURED, 150 seeds; pickers 60 seeds]

| Check | Before (main) | Round 3 | Round 4 (now) | Target | Result |
|---|---|---|---|---|---|
| Pool, 9 old cards, win % | 59.1 | 58 | **56** | mean within 6 of 59 | PASS |
| Pool, per belt 1-10 (9 old cards) | 60 / 67 / 67 / 61 / 57 / 57 / 47 / 50 / 53 / 51 | n/a | 56 / 59 / 69 / 49 / 55 / 53 / 54 / 53 / 57 / 53 | each within 15 of before, none under 45 | PASS |
| Pool, 11 cards (with the placeholders), win % | n/a | 55 | **45** | 45-70 | **FAIL at the edge** (belts 5-8 are 35-39) |
| Pool, per belt 1-10 (11 cards) | n/a | 58 / 52 / 73 / 54 / 50 / 49 / 47 / 51 / 58 / 53 | 47 / 49 / 69 / 45 / 37 / 39 / 35 / 41 / 48 / 41 | same | see below |
| Pool, Guided (9 / 11 cards) | 96 | 97 / 95 | 96 / 94 | at least 90 | PASS |
| Pool, Challenge (9 / 11 cards) | 30 | 34 / 25 | 32 / 26 | within 10 of 30 | PASS |
| Best-pick win % (PE) | 77 (50) | 64 (44) | **58** (41) | gap at most 25 | PASS |
| Worst-pick win % (PE) | 29 (21) | 44 (34) | **38** (33) | n/a | n/a |
| Best-vs-worst gap | 48 | 20 | **20** | at most 25 | PASS |
| Skilled best-pick PE (newer / careful) | 57-60 | 57-60 | 37 / 38 (worst 11 / 8) | n/a | note |

- **The beta pool (9 cards) passes every line.** The 11-card pool is a placeholder for after the beta. It reads 45%, 10 under round 3's 55, because Calm Breath and Steady Start are weaker than the cards they replace in the pool, by design (to keep the Virtue route level). Measured alternatives: Calm Breath 0.3 + Steady Start 40 gives pool 48%, but the Virtue route reads 47% held (spread 19); 0.25 + 50 gives pool 48% and Virtue 48%. So the pool and the route spread pull against each other for the placeholders; Jay or the Manager picks when Virtue is designed for real.
- The shape is flatter: belt 4 got 12 points harder, belts 7-10 a little easier. Belt 3 is the already easy belt (#354); it stays easy.
- **Skilled best-pick** is now PE 37-38 (before and in round 3: 57-60, from the old 4e table); the pair cap B3 still holds with room (newer max 46.5).
- Per-belt solo cells are noisy (+/-8); cards are judged by PE pooled across belts.

## 4f. Round 5: B-T3-TUNE-2 masher drop and P5 flip [MEASURED]

Found on the Programmer's draft PR #389 (R-INSIGHT-BAL-a, setup "F" = section 4a as merged in #386). Two tests went red: `b-t3-tune-2-boss-levers` (masher 55%, floor 75%) and `r-challenge-p5` (step-out cost 1.1% more Health than Countering). I reproduced both on the real #389 build, and the numbers match my sim to the run (masher 22/40 on #389; 27/38 with the tune below).

**Cause of the masher drop.**
- The Programmer's one-at-a-time bisect (60 / 600 seeds): main 83.9 / 72.4; Quick Hands 0.2 alone 68.8 / 57.1 (the one real drop); rule A 71.4 / 71.8; Iron Skin 1.2 85.7 / 81.2; all together 55.0 / 73.1.
- Why Quick Hands: the attack cooldown is `max(1, round(12 x (1 - speed)))` ticks. Quick Hands 0.25 gives 9 ticks, 0.2 gives 10. The masher (random Insight picks, mashes attack) wins boss fights through the faster swing: with only Quick Hands offered it wins 98.8% at 9 ticks and 0% at 10 ticks [MEASURED, per-fight]. Iron Skin 1.2 gives some of it back.
- **Why 60 seeds hides the truth:** only 31-43 of the 60 runs reach the boss, so one run changes the rate by 2-3 points and the standard error is 5-7 points. Any card change reshuffles which seeds reach the boss, so main passing at 83.9 is luck. At 4000 seeds the true masher rate is **main 74.5%, setup F 73.7%**. Main was already under 75; F is about the same as main. So the 60-seed test did not measure a drop, it measured luck. A seed change alone makes main and F both fail at about 73%; the cards still need a small lift.
- Tick rounding makes card numbers non-monotonic: Quick Hands 0.21 (9 ticks) reads 82.0% for the masher but kid PE 35 (cap 24); 0.25 reads 75.8% at PE 31. So Quick Hands cannot be the data-only lever.

**The data-only tune: Wind Step 0.3 / every 5 hits / 2 s** (was every 7 / 3 s), everything else as in F, same rules A, B, C. Only `everyHits` 7 to 5 and `seconds` 3 to 2.

Masher (boss reached, Orange gear = belt 3 gear), seeds 1..N, same test code on the #389 build:

| Seeds | main | setup F (#389) | **Wind Step 0.3 / 5 / 2 s** | Floor |
|---|---|---|---|---|
| 60 (today's test) | 83.9 | 55.0 (22/40) | **71.1 (27/38), still fails** | 75 |
| 240 | 70.9 | 73.0 | **78.9** | 75 |
| 600 | 72.4 | 73.1 (312/427) | **79.6** | 75 |
| 1000 | n/a | n/a | **80.1** | 75 |
| 4000 (true rate, all boss reaches) | 74.5 | 73.7 | **81.6 (58.4% of all runs)** | 75 |

Run-to-run swing of the tuned masher rate (blocks of different seeds): 60 seeds SD 5.0 points (88% of blocks at 75 or more); 240 seeds SD 2.3 (100%); 600 seeds SD 1.5 (100%, worst block 78.8); 1000 seeds SD 1.8 (100%). Typical bot still wins 60/60 (also at 600/600), timings 13.4 s without pauses and 15.2 s with (limits 12-15 and 14-20), smart-novice 60/60, Challenge masher 14/16. The whole `b-t3-tune-2-boss-levers` file passes on #389 with the tune at N=240 and N=600 (5 of 5).

**Honest answer: the number tune and the seed change are both needed.** The tune moves the true rate from about 74 to about 81, so the 75% floor has about 6 points of room. At 60 seeds the tune still fails (71.1: the 60-seed SD of 5 means even a true rate of 79 to 81 fails about one block in eight), so the masher assertion must run on more seeds. The floor stays 75%.

Why Wind Step: it is the data-only lever I found that raises the masher without breaking a cap (the others are listed below). A burst that comes more often (every 5 hits) and ends sooner (2 s) suits a bot that hits constantly [GUESS on the reason; the numbers are measured]. Kid Wind Step PE falls from 18 to 14 (still in 12-24).

**Rejected [MEASURED, 4000-seed masher; caps on the kid]:**
- Quick Hands 0.21: masher 82%, kid PE 35 (cap 24). Quick Hands 0.25: PE 31. Both fail.
- Wind Step 0.3 / 5 / 3 s: masher passes, Flowing route 42, route spread 14. Wind Step 0.25 / 5 / 3, 0.25 / 5 / 4, 0.2 / 4 / 3: Flowing route 42-45.
- Iron Skin 1.6: kid PE 31. Rally 0.9: kid PE 25 and Rally route 41 (spread 13). Double Strike 0.1: halves how many masher runs reach the boss. Heavy Hands 0.25: the Manager asked for no Heavy Hands change.

**Caps with the tune [MEASURED, Standard, same seeds as 4b to 4e]:**

| Check | Target | Setup F | **Tune** | Result |
|---|---|---|---|---|
| Kid card PE range | 12-24 | 15-24.4 | **14-24.4** (Wind Step 14, Quick Hands 24.4, Ripple 24; the rest identical) | PASS (24.4 is the old 1-over-noise) |
| Held route win %, kid, 150 seeds (Rooted / Flowing / Power / Virtue) | spread about 10 or less | 28 / 38 / 32 / 34 (10) | **28 / 37 / 32 / 34 (9)** | PASS |
| Lean picker routes, kid | none stands out | 50 / 46 / 47 / 48 | 49 / 43 / 49 / 48 (6) | PASS |
| Highest pair PE, kid / newer / careful | under 50 | 43.2 / 46.5 / 36.9 | **43.2 / 46.5 / 36.9** | PASS |
| Kata class maxima, kid / newer / careful (solo / pair / route) | 38 / 62 / 67 | 36.1 / 49.0 / 49.5 and 31.6 / 60.0 / 56.4 and 27.3 / 56.8 / 30.8 | same (max 36.1 / 60.0 / 49.5 over the classes) | PASS |
| 9-card pool, kid | 56-59 | 56 | **56** | PASS |
| 11-card pool (placeholder) | 45-70 | 45 | 45 | unchanged (edge) |
| Guided / Challenge 9-card pool | unchanged | 96 / 32 | **95 / 31** | PASS (inside noise) |

**Balance check across belts and difficulties (kid, 9-card pool, win %, belts 1 to 10, Standard 150 seeds per belt, Guided and Challenge 60):**

| Tier | Belts 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / 9 / 10 | Mean | Target | Biggest neighbour jump | Result |
|---|---|---|---|---|---|
| Standard, F | 56 / 59 / 69 / 49 / 55 / 53 / 54 / 53 / 57 / 53 | 56 | mean 56-59; none under 45 | 1.39x | PASS |
| **Standard, tune** | 58 / 59 / 66 / 46 / 55 / 53 / 55 / 55 / 60 / 57 | 56 | same | 1.43x | PASS |
| Guided, F | 98 / 93 / 98 / 95 / 95 / 95 / 95 / 97 / 97 / 97 | 96 | at least 90 | 1.05x | PASS |
| **Guided, tune** | 98 / 95 / 100 / 95 / 97 / 97 / 92 / 95 / 92 / 93 | 95 | at least 90 | 1.05x | PASS |
| Challenge, F | 35 / 18 / 47 / 35 / 43 / 42 / 23 / 28 / 18 / 27 | 32 | within 10 of 30 | 2.55x | PASS (see note) |
| **Challenge, tune** | 33 / 17 / 42 / 33 / 40 / 38 / 25 / 28 / 25 / 27 | 31 | same | 2.50x | PASS (see note) |

- The one Challenge jump above 2x (belt 2 to 3: 18 to 47 in F, 17 to 42 with the tune) is in F too, and Challenge is inside the +/-6 noise of 60 seeds per belt. The tune does not add a new one; its biggest is 2.50x, F's 2.55x. Flagged, not fixed here (Challenge is unchanged by this task).
- The masher check applies to one tier only: belt 3 (Orange gear) with its Hearth Cook boss, Standard and Challenge. The tune lifts both (Standard 79.6% at 600 seeds, Challenge 14/16 at 60 seeds, F 18/19).
- The tune only changes Wind Step, so the changes outside the Flowing and Wind Step cells are within noise.

**P5: step-out cost vs Countering (`r-challenge-p5`).** Rule: total Health lost over all rooms with `stepOutOfLanding` on must be under the total with it off (newer bot, Challenge, belts 4 / 6 / 8 / 10, seeds 501-560).
- On cards, **no data-only change makes step-out clearly cheaper.** Over 2000 seeds the difference (on minus off, % of total damage) is main +0.2, F -0.4, tune +0.2 as the mean of 60-seed blocks (block SD 1.7-1.9 points; the sign is a coin flip, 48-55% of blocks under 0). At 1000 seeds: main +0.27, F +0.33, tune +0.44 (SE 0.40-0.49), so step-out is a wash. With no Insight cards at all it is the same (-0.09 at 1000 seeds, SE 0.47), so the cause is the bot and the Challenge landing logic (`PATTERN_ANSWERS`, `bot.ts` about lines 215-245), not the cards.
- Main passed at 60 seeds only because 501-560 fell the lucky way. The flip to +1.1% is noise (SE 1.1-2.8 points at 60 seeds).
- Fix options (none touch card numbers): (1) a **paired, targeted test**: same seeds, fixed cards, count only landing-circle damage (removes most of the 1.7-1.9 point noise); (2) a **non-inferiority rule**: step-out total at most Counter total x 1.01 at 1000 or more seeds (SE 0.4-0.5); (3) the Programmer improves the step-out answer so it is really cheaper, then keep the current strict rule on at least 1000 seeds. If "clearly cheaper" is a product requirement, (3) is the only one that delivers it; today the bot shows no saving.

**Seed counts to use [MEASURED swing].**
| Test | Today | Use | Swing at that size |
|---|---|---|---|
| B-T3-TUNE-2 masher floor (75%) | 60 | **600** (240 is enough, 10 s) | SD 1.5 points, worst block 78.8, 3 SD above the floor for the tune; at 60 SD is 5.0 |
| B-T3-TUNE-2 typical wins, timing | 60 | keep 60 (typical wins 600/600 too) | no swing: all run |
| P5 | 60 | **1000 or more**, paired or non-inferior metric | SE 0.4-0.5 points of total damage; at 60 it is 1.1-2.8 |

Cost: on #389 the whole masher file ran in about 4 s at N=60; two tuned runs (N=240 and N=600) plus one untuned N=600 run took 112 s in total. P5 at 1000 seeds was not timed; if it is too slow for the normal suite, run it under `BALANCE=1` (a choice for the Programmer).

**Changes for the Programmer's #389 (data only):** `content/insights/insights.json` Wind Step `everyHits` 5, `seconds` 2; card text "Every 5 combo hits gives you a 2-second burst of speed."; `r-insight-bal-a.test.ts` Wind Step expectation and the section 7 cap table; the masher seed count in `b-t3-tune-2-boss-levers.test.ts`; the P5 method as above. Content Designer text for Wind Step changes (R-INSIGHT-BAL-c).

## 5. Virtue placeholder: Calm Breath and Steady Start (after the beta)

**Decision (Manager):** the Virtue cards come after the beta, as a placeholder until Jay says otherwise. The beta ships with 9 cards; every beta number above (pool 9 cards, pairs of the 9, routes Rooted / Flowing / Power) stands without them. The Virtue route and the 11-card pool below are the placeholder.

- **Today:** Virtue = 1 card (Rally), skill-gated (PE 0 for skilled bots). A kid who likes Virtue has no choice and no route.
- **Placeholder (data-only, both effect types exist [CODE]):**
  - **Calm Breath:** "Focus fills 15% faster." `focusGain` 0.15. Kid PE 15.4.
  - **Steady Start:** "Start each fight with a Strike ready." `startFocus` 40 (a Strike costs 30 Focus, max 100 [CODE]). Kid PE 17.2.
  - With Rally the Virtue route is kid PE 41 (34% held, 48% on the pick screen), level with the other routes (section 4d).
- **Why the numbers are lower than round 3 (0.3 / 70):** at 0.3 / 70 the Virtue route read 52% held, 17 points above Rooted. With Flowing and Power brought level, the placeholders had to come down too. The price is the 11-card pool at 45% (section 4e).
- **Scope risk [GUESS]:** needs art, names, text and a client check; `packages/sim/test/run.test.ts` line 67 expects exactly 9 Insights (becomes 11); every new card is more to playtest. Not needed for the April 2027 launch.
- **Overlap to check [GUESS]:** the **Bow** gives +15 Focus at each floor and **Calm Mind** (a dojo reward) gives +20% Focus gain for 3 runs [CODE, `config.ts`]. Calm Breath stacks with Calm Mind (+35% total for those runs), and Steady Start stacks with the Bow. The slow test should cover both stacks.

## 6. Room for one kata power (new, after the beta)

**The fact:** after the beta each signed-off kata unlocks one power, a passive or a single activated one. The player brings exactly one into the tower. A white belt only has Basic Form 1; an orange belt picks from 3. **Jay sends the powers; I did not choose or size any.**

**What I did:**
- **Reserve [PROPOSED]:** budgets B1–B3 above are for the cards only. B8 holds back **PE 12** for a kata power. That is the R-KATA-POWERS damage cap (+12% for stance and kata together); on the ruler, +12% Power is PE 12 by definition. If Jay's powers are bigger or smaller, only this one number changes. The cards-plus-power ceilings are **single card + power ≤ 38, pair + power ≤ 62, route + power ≤ 67**.
- **Proxy run [MEASURED, round 4 setup, kid 60 seeds, newer and careful 30 seeds, Standard, belts 1-10]:** I added a stand-in "+12% Power" slot to the run (not a real power) and re-ran solos, all pairs, the routes and "no cards". Numbers are PE (kid win %):

| Case | kid, cards only | kid, + slot | newer, cards only | newer, + slot | careful, cards only | careful, + slot |
|---|---|---|---|---|---|---|
| Slot alone | 0 | 13.2 (13%) | 0 | 6.9 | 0 | 12.9 |
| Ripple + Heavy Hands | 43.2 (37%) | 49.0 (51%) | 41.4 | **60.0** | 36.9 | **56.8** |
| Double Strike + Heavy Hands | 31.9 (20%) | 38.2 (31%) | 46.5 | 48.7 | 28.7 | 32.7 |
| Double Strike + Rally | 37.7 (44%) | 43.1 (53%) | 15.7 | 26.2 | 17.1 | 24.7 |
| Rooted route | 39.0 (28%) | 45.9 (42%) | 18.7 | 33.4 | 21.0 | 27.2 |
| Flowing route | 45.2 (38%) | 48.5 (45%) | 26.1 | 42.8 | 18.8 | 33.9 |
| Power route | 45.0 (32%) | 49.5 (48%) | 26.9 | 35.9 | 26.5 | 30.8 |
| Virtue route (placeholder) | 40.6 (34%) | 45.3 (47%) | 10.2 | 23.0 | 10.1 | 19.3 |

  Highest single card + slot: kid 36.1 (Ripple), newer 31.6, careful 27.3 (limit 38). Highest pair + slot: kid 49.0, newer 60.0, careful 56.8 (limit 62). Highest route + slot: 49.5 (limit 67). With the slot the kid route spread is 42 to 48 wins (6 points). A random-pool run with the slot was not re-run this round.
- **Read-out:**
  - **All three ceilings hold** (38 / 62 / 67 for card / pair / route plus power).
  - **Skilled Ripple + Heavy Hands reaches 60.0 (newer) and 56.8 (careful)**, the ruler's top (60), so it is the first combo that would break B8 if a power is bigger than +12% or stacks Focus. Lever if it does: lower Ripple Counter from 1.2 (data only; not measured).
  - The newer bot's jumps with the slot (+13 to +19 where the slot should add about 7-12) are inside the +/-5 noise plus the ruler's saturation near 60. They are not a card problem; flagged so the Tester does not chase them.
- **Not covered, because no powers exist yet [GUESS]:** an **activated** power needs the sim bot to fire it (it can't today); a passive that adds Focus, speed or guard needs its own proxy. Section 7, layer 3 says how.

## 7. Test spec

Tests live in the repo's normal places. Layer 1 runs always; layers 2 and 3 run with `BALANCE=1` like `balance.test.ts`.

**Layer 1: data caps, fast (`packages/sim/test/insight-budget.test.ts`).** No sim.
1. For each card in `content/insights/insights.json`, the effect amount is **at most the proven cap** in one table in the test (Ripple 1.2, Iron Skin 1.2, Wind Step 0.3 / every 5 / 2 s, Double Strike 0.2, Quick Hands 0.2, Rally 0.75, Heavy Hands 0.2, Press 0.3, Shield Breaker focus 7, and for the placeholders Calm Breath 0.15, Steady Start 40). Failure text: "re-run `BALANCE=1 insight-budget-sim` and update the table with the new PE".
2. Every family has **at least 2 cards** (after the Virtue cards ship; before, the test names Virtue as an expected exception).
3. Card ids are unique and every id in the table exists (and vice versa).
4. Stacking sanity from `effects.ts`: the sum of all `attackSpeed` stays under the 0.6 cap, and no combination of cards in the family tables can reach a limit (e.g. `disarm` 0.9).
5. `r-bal-14b-charms.test.ts` line 20: update Rally from ×2 to ×1.75; `run.test.ts` line 67: update the card count.

**Layer 2: sim budget, slow (`packages/sim/test/balance/insight-budget.test.ts`, `BALANCE=1`).** Fixed seeds (1..30), belts 1–10, Standard, bots kid, newer and careful. Same harness as the reference copy.
1. Build the PE ruler (powerScale +10/20/30/40/60, same seeds).
2. **B1:** every single card: PE ≤ 26 on all bots; PE ≥ 12 on the kid (no waivers) and ≥ 12 on at least one bot. Skilled floors are not tested; the reasons are written in the test file's comments.
3. **B2:** every single card PE ≤ 30 on newer and careful.
4. **B3:** all pairs (55 today, `n(n-1)/2`) PE ≤ 50 on all bots, and the kid has no pair under 20.
5. **B4 and B10:** the four family routes (held all run, kid, 150 seeds): per-card PE within ±25% of the mean, route PE ≤ 55, **and win-rate spread (highest minus lowest) at most 14 (target 10)**. Also the lean-picker routes: spread at most 10. Heavy Hands stays 0.2 in the table.
6. **B5:** random pool (9 cards for the beta; 11 once Virtue ships), kid, 100 seeds per belt (the 30-seed runs are too noisy): mean win % within 6 points of 59, each belt within 15, none under 45.
7. **B6:** best-pick bot vs worst-pick bot, kid, gap ≤ 25 points.
8. **B7:** highest single-card PE ÷ lowest (kid) ≤ 2.
9. **Failure output:** print the table (card or combo, bot, PE, limit) and name the line that failed.
10. Determinism: the fixed seeds make the result repeatable. If a sim change moves a result by more than 3 PE, the Tester re-runs at 60 seeds before changing a limit. Noise is about ±5 PE.
11. Guided and Challenge: print the B9 table but do not fail on it (informational).

**Layer 3: one kata power stacking with the cards (new; build when Jay's powers exist).**
- **Input:** one list of kata powers from content (id, belt, type: passive or activated, effect). The test loops over it. **Run one power at a time, because the player brings exactly one.**
- **Belts:** white = Basic Form 1 only (forced, no choice); orange = each of its 3 options separately; all other belts = every unlocked option separately. Where a belt has several, test each; do not average them.
- **Matrix per power:** {no cards, random pool, the top 5 pairs, the 4 routes, best-pick bot} × {kid, newer, careful}, Standard.
- **Assertions:**
  - The power alone is PE ≤ the reserve in B8 (12 until Jay changes it); if it is bigger the test names the new reserve it needs.
  - Power + any card or pair stays under **B1–B3 + reserve** (38 / 62 / 67 with 12).
  - The random pool with the power stays in B5's kid band 45–70%, and the power adds no more than 12 points of kid pool win rate.
  - No card falls to PE 0 on the kid because of the power (a power must not make a card dead).
  - Calm Breath + Calm Mind and Steady Start + Bow stacks stay under B1.
- **Activated powers:** the sim bot needs a rule to use them (when, how often). Without it the test undercounts the power and gives false headroom. Programmer builds that bot rule first; the test refuses to run an activated power with no bot rule.
- **Passive powers that touch Focus, speed or guard:** add a stand-in effect in the harness for each type (the same way `powerScale` was used here) before the real power is tuned.
- **Floor and cap:** a power may be skill-gated like Rally, so its skilled-bot floor is not tested (the reason goes in the test file). Its cap is always tested.

## 8. Taste calls still open (decided ones removed)

Decided by the Manager and recorded in "Read this first": Virtue after the beta as a placeholder; Press the Advantage and Wind Step may change; Double Strike halved and Rally x1.75; "20% faster" text; kata reserve PE 12. Heavy Hands stays 0.2 (the Manager asked for no Heavy Hands change), so the old call 3 is closed.

1. **Double Strike 0.2 instead of the approved 0.3.** The held-route spread reaches 10 with 0.2 (Flowing 38%). With 0.25 it measured 12, and 0.3 was not measured with the final Wind Step (I expect 12-13). The card text has no number, so kids see no change in text; it is a little weaker (PE 15.9, still above the floor). Keep 0.2, or keep 0.3 and accept a spread of about 12-13?
2. **Virtue placeholder strength, for when Virtue is designed.** Weak placeholders (Calm Breath 0.15, Steady Start 40) keep the Virtue route level (34% held) but make the 11-card pool 45% (belts 5-8 at 35-39%). Stronger ones (0.25 / 50) give pool 48% and Virtue 48% held, 14 points above Rooted. Nothing to decide before the beta (9 cards pass everything); pick the side when the cards are real.

Also for the Content Designer, not taste calls: new text for Iron Skin, Wind Step, Shield Breaker (section 4a), and the Shield Breaker Focus reward is a small rule tweak the Manager asked me to try.

## 9. Board items (for the Manager; work board not edited)

| ID | Owner | Task | Done when | Waits on |
|---|---|---|---|---|
| R-INSIGHT-BAL-a | Programmer | Apply the number changes in 4a to `content/insights/insights.json` (text too), plus rule tweaks A (Wind Step attack speed), B (Press also on winded or recovering) and C (Shield Breaker gives 7 Focus when it breaks a shield). Update `r-bal-14b-charms.test.ts` (Rally x1.75). | `npm test` is green, and the card table in 4b and the route table in 4d (kid, Standard) reproduce within +/-3 PE / +/-5 win points with the layer-2 harness | Call 1 in section 8 (Double Strike value) |
| R-INSIGHT-BAL-b | Programmer | Build layer 1 and layer 2 from section 7 (including the B10 route-spread check), using `R-INSIGHT-BAL-sim/` as the starting point (no env flags or `HOOKS` patch in the committed code; the pick hook needs a proper test-only seam). | Layer 1 runs in the normal suite; layer 2 passes under `BALANCE=1`; raising any card past its cap, or lowering Rooted, makes the right line fail (shown once with a deliberate bad number) | R-INSIGHT-BAL-a |
| R-INSIGHT-BAL-c | Content Designer | Write card text for the changed cards (kid-readable, ages 6+, hopeful, no pressure): Iron Skin, Wind Step, Shield Breaker, Press the Advantage, Rally, Quick Hands. After the beta: names, text and icon brief for Calm Breath and Steady Start, and a check of the Calm Mind and Bow overlap. | Texts match 4a; run.test count updated to 11 when the Virtue cards ship | Virtue part waits for Jay |
| R-INSIGHT-BAL-d | Tester | Re-run the whole report on the real build: belts 1-10 x Guided, Standard, Challenge x kid, newer, careful, plus a 150-seed kid route run. Also a human playtest of 3 kid runs picking only Power cards, 3 only Flowing and 3 only Rooted. | The B1-B10 table passes; the three playtests clear about equally often; any miss is reported with the table | R-INSIGHT-BAL-a, R-INSIGHT-BAL-b |
| R-INSIGHT-BAL-e | Programmer | Layer 3 (kata power stacking) and an activated-power rule for the sim bot. | Layer 3 runs once per power in the list from Jay; the budget lines in section 7 pass or the failing power is named | Jay's kata powers; R-INSIGHT-BAL-b |

## 10. Reference copy and how to repeat the run

Folder `drafts/planning/R-INSIGHT-BAL-sim/` (not compiled, not part of `packages/`; see its README):
- `zz-insight-bal.test.ts.txt`: the harness (copy to `packages/sim/test/balance/zz-insight-bal.test.ts`). Env: `CONFIGS` (`none`, `pool`, `pool9`, `offer:ID`, `start:a+b`, `pick:lean:a+b+c` (the lean picker), `pick:greedy:` / `pick:worst:` with `SCORES`, `SOLO`, `PAIRS`, `OFFER`, `syn:TYPE:AMT`), `BOTS`, `DIFFS`, `BELTS`, `SEEDS`, `OUT`, `OVR`, `NEW`, `KATA`, `BALANCE=1`.
- `experiment-world.patch`: rule tweaks A, B and C behind `WIND_ATK=1`, `PRESS_WIDE=1`, `SB_FOCUS=7` (plus the unused `SB_DMG`, `SB_STAG`). `experiment-bot-hook.patch`: the pick hook. Local experiment only.
- `prop4.env`: the round-4 proposal as env values; `drv.py` (launcher), `full.py` and `fullpick.py` (the validation runs), `pe_any.py`, `ssum.py` (summaries), plus the older scripts.
- `data.tar.gz`: raw rows (rulers, round 3, all round-4 scans and the final validation `F*` files).

## Delivery Note
- **ITEM:** R-INSIGHT-BAL (round 5: B-T3-TUNE-2 masher drop and P5 flip on PR #389)
- **WHAT:** found the cause and a data-only tune, section 4f. The masher 83.9 to 55.0 "drop" is mostly 60-seed luck: true rate at 4000 seeds main 74.5%, F 73.7% (Quick Hands 0.25 to 0.2 changes the swing from 9 to 10 ticks, and the masher needs the fast swing). Tune: Wind Step 0.3 / every 5 hits / 2 s (was 7 / 3 s), nothing else. Masher: 4000 seeds 81.6%; 240 seeds 78.9, 600 seeds 79.6, 1000 seeds 80.1; at 60 seeds 71.1% (still red, SD 5). Caps hold: kid card PE 14-24.4, held routes 28 / 37 / 32 / 34 (spread 9), pairs under 50 (max 43.2 / 46.5 / 36.9), kata ceilings 38 / 62 / 67 (max 36.1 / 60.0 / 49.5), 9-card pool 56, Guided 95, Challenge 31. P5: step-out vs Countering is a wash (+0.3 to +0.4%, SE 0.45 at 1000 seeds) on main, F and the tune, and also with no Insights at all, so no card number can make it clearly cheaper. Only docs changed; no game code, content or work board.
- **WHY:** B-T3-TUNE-2 and P5 went red in the Programmer's #389; the Manager does not want the 75% floor lowered or step-out to be only a wash.
- **DECIDE:** (1) Manager: accept the seed change (masher floor at 600 seeds, floor still 75%) with the Wind Step tune; it needs the Wind Step card text change. (2) Manager: for P5, pick a fix: paired targeted test, non-inferiority at 1000+ seeds, or the Programmer improves the bot's step-out answer. "Clearly cheaper" cannot come from card numbers. (3) Taste, small, for Jay: Wind Step is now "every 5 hits, 2 s" (more often, shorter).
- **NEXT:** Programmer edits #389 (Wind Step 5 / 2, text, `r-insight-bal-a.test.ts`, masher seeds 600, P5 method); Content Designer updates the Wind Step text; Tester re-runs section 4f on the real build. Earlier next steps from round 4 stand (Jay's kata powers for layer 3).
