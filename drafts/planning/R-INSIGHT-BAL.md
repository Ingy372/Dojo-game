# R-INSIGHT-BAL: Balance the between-room Insight cards

Status: proposal for Jay, the Programmer, the Content Designer and the Tester. No game code, content or work board changed. Sim code stays local; a reference copy is in `R-INSIGHT-BAL-sim/` (section 9).
Labels: **[MEASURED]** from the sim, **[CODE]** read from main, **[PROPOSED]** my numbers, **[GUESS]** not measured.

## Read this first

- **The ask:** no Insight family or route should be much stronger than another. Real training stays the main source of power. Nothing here costs money or adds pressure.
- **What was wrong [MEASURED]:** a kid-bot run with one card held all run is worth **35 Power-points (PE) for Ripple Counter, 33 Double Strike, 31 Quick Hands, 28 Rally**, but **9 for Iron Skin, 5 for Press the Advantage, 2 for Wind Step**. The Power family has no strong card, so the Power route is the weakest. Virtue has only 1 card (Rally).
- **What I propose [PROPOSED]:** 6 number changes in `content/insights/insights.json` and 2 small rule tweaks (Press the Advantage and Wind Step) so those two cards stop being near-zero. Re-sim: every card lands in **PE 13–22** (target band 12–26), no pair is above PE 50 on any bot, the random pool is as hard as before (**kid Standard 59% → 58%** (57.5) on the 9 old cards, 120 seeds), and the best-vs-worst card picking gap for the kid bot falls from **48 points to 20**.
- **Virtue:** two new data-only cards (Calm Breath, Steady Start) measure inside the band. They are a **proposal** with a scope risk for the Dec 15 beta and the April 2027 launch (section 5). My advice: do the number changes before the beta, and decide on the new cards after the beta unless the art is cheap.
- **New fact (after the beta): one kata power in the run.** Each signed-off kata unlocks one power (a passive or a single activated one), and the player brings exactly one into the tower. A white belt only has Basic Form 1; an orange belt picks from 3. Jay will send the powers, so **I did not pick or tune any**. The budgets below keep a reserve for one kata power stacking with the cards (section 6, test in section 7).

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

**Family budget:** a family has no budget of its own beyond B1 and B3 for its cards. B4 keeps the families level against each other. Rooted (2 cards) is judged per card, so it is not punished for having only two.

**Why skilled bots are not held to the floor (named reasons, measured in 4b):** most cards read under 12 for newer and careful. That is a bot limit, not a weak card.
- **Rally:** only works under half Health, which skilled bots rarely reach.
- **Iron Skin:** needs blocks; skilled bots block rarely in the sim.
- **Wind Step, Quick Hands:** speed cards; the sim sees little value in speed for skilled bots.
- **Shield Breaker:** a switch with no number; it only matters in shield rooms. Kid reads 12.9, just over the floor and inside the ±5 noise.
- **Calm Breath, Steady Start:** Focus cards; skilled bots read 5–11.
- A card that falls under 12 on the kid is a FAIL; the only way out is a change to the card, not a waiver.

## 4. Proposed changes and re-sim

### 4a. The changes [PROPOSED]

| Card | Before | After | Card text after | Why |
|---|---|---|---|---|
| Ripple Counter | `amount` 1.5 | **1.2** | unchanged | top card for the kid (PE 35) |
| Double Strike | `amount` 0.6 | **0.3** | unchanged | second top card, and the strongest Rally partner (PE 33) |
| Quick Hands | `attackSpeed` 0.25 | **0.2** | "Your basic attacks are 20% faster." | PE 31. Note: the 12-tick attack rounds, so 0.15 and 0.2 are the same speed. 0.2 is the smallest value that changes anything |
| Rally | `amount` 1 (×2) | **0.75 (×1.75)** | "Focus fills 75% faster when your health is below half." | PE 28 to 22 |
| Iron Skin | `blockReflect` 0.5 | **1.0** | "Blocks bounce the whole hit back at the attacker." | PE 9, kid-leaning |
| Wind Step | 0.4 burst, every 10 hits, 3 s | **0.4 burst, every 5 hits, 4 s** + rule tweak A | "Every 5 combo hits gives you a 4-second burst of speed." | PE 2; number changes alone could not lift it |
| Press the Advantage | `staggerBonus` 0.3 | 0.3 + rule tweak B | "Staggered, winded or recovering enemies take 30% more damage." | PE 5; stagger is rare (only after a Perfect Counter, 20 ticks) |
| Shield Breaker, Heavy Hands | unchanged | unchanged | unchanged | already inside the band |
| **Calm Breath** (new, Virtue) | n/a | `focusGain` 0.3 | "Focus fills 30% faster." | proposal, section 5 |
| **Steady Start** (new, Virtue) | n/a | `startFocus` 70 | "Start each fight with 2 Strikes ready." | proposal, section 5 |

**Rule tweaks (code, small) for the Programmer.** Both were measured locally with env switches; the exact lines are in `R-INSIGHT-BAL-sim/experiment-world.patch`.
- **A. Wind Step:** while the speed burst runs, basic attacks also get half of the burst's bonus (`world.ts`, the attack-speed line around 821).
- **B. Press the Advantage:** the bonus also applies while the enemy is winded or recovering, not only staggered (`world.ts`, `landHit`, around 949).

I ran three rounds. Round 1 had Double Strike 0.35; round 2 added Heavy Hands 0.25; round 3 (final) is the table above. Heavy Hands 0.25 lifts the Power route (kid wins 23% to 40% on the Power route) but pushes **Ripple Counter + Heavy Hands to PE 56 for the newer bot**, over B3, so I kept Heavy Hands at 0.2. Double Strike 0.35 (round 1) was cut to 0.3 in rounds 2 and 3 together with the Virtue numbers; I did not test 0.3 on its own.

### 4b. Per card, after, held all run, Standard, PE (win % for the kid) [MEASURED, 30 seeds × 10 belts]

| Card | kid | newer | careful | In band 12–26? |
|---|---|---|---|---|
| Rally | 22.4 (19%) | 0.0 | 0.2 | PASS |
| Heavy Hands | 21.3 (16%) | 18.0 | 20.3 | PASS |
| Double Strike | 19.6 (13%) | 17.7 | 18.2 | PASS |
| Quick Hands | 19.5 (15%) | 2.4 | 6.4 | PASS |
| Steady Start (new) | 19.4 (8%) | 8.5 | 10.7 | PASS |
| Ripple Counter | 18.0 (13%) | 21.1 | 20.4 | PASS |
| Calm Breath (new) | 17.2 (12%) | 9.0 | 4.8 | PASS |
| Iron Skin | 16.8 (12%) | 1.2 | 0.3 | PASS |
| Wind Step | 15.3 (14%) | 5.2 | 3.0 | PASS |
| Press the Advantage | 14.7 (10%) | 11.0 | 22.2 | PASS |
| Shield Breaker | 12.9 (7%) | 1.8 | 4.1 | PASS (just over 12) |

- **Kid range 12.9–22.4: biggest ratio 1.7x. B7 PASS.** Before it was 35 to 2 (17x).
- **Skilled cap B2:** highest is 22.2 (careful, Press). PASS.
- **Offered alone (the real pick screen), kid, Standard, belts 2/4/6/8/10, 30 seeds:** before 3–30%, after **5–18%** (Ripple 9, Iron Skin 8, Wind Step 10, Double 5, Quick 11, Press 11, Shield Breaker 7, Heavy 7, Rally 18, Calm Breath 9, Steady Start 8).

### 4c. Per card, Guided and Challenge, after, PE (kid / newer / careful) [MEASURED, informational]

| Card | Guided | Challenge |
|---|---|---|
| Ripple Counter | 29.5 / 6.6 / 38.5 | 24.4 / 17.4 / 26.6 |
| Iron Skin | 7.7 / 0.4 / 0.6 | 28.0 / 5.5 / 8.1 |
| Wind Step | 9.0 / 22.5 / 7.3 | 25.6 / 11.2 / 13.1 |
| Double Strike | 22.2 / 30.7 / 11.7 | 23.4 / 23.3 / 29.1 |
| Quick Hands | 26.1 / 20.8 / 5.3 | 28.5 / 20.3 / 11.2 |
| Press the Advantage | 9.7 / 30.7 / 10.5 | 18.3 / 18.9 / 14.0 |
| Shield Breaker | 6.6 / 19.4 / 3.8 | 18.0 / 4.9 / 8.4 |
| Heavy Hands | 20.4 / 30.6 / 10.6 | 21.1 / 23.7 / 14.8 |
| Rally | 20.0 / 4.6 / 0.6 | 27.1 / 0.5 / 0.0 |
| Calm Breath | 21.1 / 25.7 / 37.4 | 16.2 / 20.0 / 10.2 |
| Steady Start | 17.0 / 20.9 / 0.0 | 28.1 / 25.2 / 27.2 |

- **B9 PASS for the kid:** highest 29.5 on Guided and 28.5 on Challenge, both under 32.
- **Flag:** the careful bot on Guided reads 38.5 (Ripple) and 37.4 (Calm Breath). It loses about 1% Health per fight there, so the reading is mostly noise; Guided is 100% wins for the skilled bots. I did not use it to tune.
- On Guided the kid pool wins about 95% with or without changes; cards matter little there by design.

### 4d. Pairs and routes, after, Standard [MEASURED]

| Check | Before | After | Target | Result |
|---|---|---|---|---|
| Pairs over PE 45, kid | 6 of 36 | **0 of 55** (max 43.5, Wind Step + Quick Hands) | none over 50 | PASS |
| Highest pair, newer | 57.5 | **49.3** (Double Strike + Heavy Hands) | ≤ 50 | PASS, thin margin |
| Highest pair, careful | 59.5 | **42.2** | ≤ 50 | PASS |
| Lowest pair, kid | 3 (Wind Step + Press) | **30** (Iron Skin + Calm Breath) | none under 20 on the kid | PASS |
| Pair mean, kid | 33.1 | 35.3 | n/a | n/a |

| Route (all cards held) | kid PE (win %) | newer PE | careful PE | kid PE per card |
|---|---|---|---|---|
| Rooted (2 cards) | 36.1 (22%) | 21.9 | 20.5 | 18.0 |
| Flowing (3) | 50.7 (56%) | 38.0 | 27.5 | 16.9 |
| Power (3) | 39.2 (**23%**) | 27.3 | 26.9 | 13.1 |
| Virtue (3, with the new cards) | 48.2 (52%) | 15.2 | 21.1 | 16.1 |

- **B4:** per-card mean 16.0, so ±25% is 12–20. All four pass; **Power is still lowest (13.1, -18%)** and Flowing is still the best route in kid wins (56% vs 23% on the Power route). Before: Power 10 per card against 16 for Flowing.
- On Guided and Challenge (kid wins): Flowing route 96% / 40%, Power route 80% / 25%, Virtue route 95% / 39%, Rooted 76% / 15%. Same order, smaller gaps than before.
- **Remaining gap, honestly:** the Power route is still about half the kid wins of Flowing on Standard (23% vs 56%). Closing it with numbers only breaks B3 (Heavy Hands 0.25). Shield Breaker has no number to turn. This is a taste call (section 8, call 3).

### 4e. Random pool and picking, kid, Standard [MEASURED]

| Check | Before | After | Target | Result |
|---|---|---|---|---|
| Pool, 9 old cards, 120 seeds, win % | 59.1 | **57.5** (11 cards: 54.6) | mean within 6 | PASS |
| Pool, per belt 1–10 (9 old cards) | 60 / 67 / 67 / 61 / 57 / 57 / 47 / 50 / 53 / 51 | 56 / 55 / 69 / 59 / 53 / 54 / 58 / 53 / 62 / 57 | each within 15, none under 45 | PASS |
| Pool, per belt 1–10 (11 cards) | n/a | 58 / 52 / 73 / 54 / 50 / 49 / 47 / 51 / 58 / 53 | same | PASS (belt 2 is 15 under, at the edge) |
| Pool, Guided | 96 | 97 (11 cards: 95) | ≥ 90 | PASS |
| Pool, Challenge | 30 | 34 (11 cards: 25) | within 10 | PASS |
| Best-pick win % / PE | 77 / 50 | **64** / 44 | gap ≤ 25 | PASS |
| Worst-pick win % / PE | 29 / 21 | **44** / 34 | n/a | n/a |
| Best-vs-worst gap | 48 points | **20 points** | ≤ 25 | PASS |
| Skilled best-pick PE | 57–60 | 57–60 (ruler ceiling) | n/a | see note |

- The shape got flatter: belts 7–10 got a bit easier (+6 to +9), belt 2 a bit harder. Belt 3 is the already easy belt (#354); it stays easy.
- **Skilled best-pick sits at the ruler's top (about 57–60).** A skilled player who always picks the best pair gets much more power than a random picker. Their wins are 100% either way and health lost is about 1%, so this is not a difficulty risk. It is the reason B3 exists.
- **Per-belt solo cards (kid, Standard, 30 seeds):** noisy (3–60%, ±8 per cell), belt 3 always high. I judged cards by PE pooled across belts, not per belt. The pool per belt above is the per-belt check.
- Adding the 2 Virtue cards makes the 11-card pool about 3 points harder than the 9-card pool. That is inside B5.

## 4f. Round 4: closing the gap between routes (INTERIM, full tables follow) [MEASURED, kid, Standard]

Manager decisions recorded: (1) Virtue cards come after the beta, as a placeholder until Jay says otherwise. (2) Press the Advantage and Wind Step may change what they do. (4) Double Strike halved (0.6 to 0.3) and Rally x1.75 approved. (5) "20% faster" text approved. (6) PE 12 kata reserve kept.

Correction: the "Power 40% vs Flowing 59%" quoted earlier mixed rounds. Round 2 (Heavy Hands 0.25) gave Power 40%. The v3 numbers in 4d were Power 23% vs Flowing 56% at 30 seeds; at 100 seeds the same v3 setup reads Rooted 23 / Flowing 59 / Power 31 / Virtue 52.

Setup tested (Heavy Hands untouched at 0.2): Iron Skin 1.2, Wind Step 0.3 every 7 hits for 3 s + tweak A, Double Strike 0.2, Quick Hands 0.2, Press 0.3 + tweak B, new tweak C (Shield Breaker: breaking a shield gives 7 Focus), Calm Breath 0.15, Steady Start 40.

Scan results at 120-200 seeds (win %): held-all-family routes Rooted 28, Flowing 38, Power 32, Virtue 34 (spread 10). Real pick screen (lean picker, 150 seeds, earlier near-final setup): 50 / 47 / 48 / 47 (spread 3). Full validation tables are being re-run and will replace this section.

## 5. Does Virtue need more cards? Proposal and scope risk

- **Today:** Virtue = 1 card (Rally), skill-gated (PE 0 for skilled bots). A kid who likes Virtue has no choice and no route.
- **Proposal (data-only, both effect types already exist [CODE]):**
  - **Calm Breath:** "Focus fills 30% faster." `focusGain` 0.3. Kid PE 17.2.
  - **Steady Start:** "Start each fight with 2 Strikes ready." `startFocus` 70 (a Strike costs 30 Focus, max 100 [CODE]). Kid PE 19.4.
  - With Rally the Virtue route is kid PE 48.2 (52% wins), level with Flowing and Rooted.
- **Why it is cheap:** no new rule, no new sim code, two JSON entries with a name and text. It is still real content work.
- **Scope risk [GUESS]:**
  - **Needs art (icons), names and text, and a client check.** I did not check whether the card art can be reused.
  - **Tests change:** `packages/sim/test/run.test.ts` line 67 expects exactly 9 Insights (becomes 11); lines 152–155 expect one Insight per fight room.
  - **Dec 15 beta:** every new card is another thing to playtest before TestFlight.
  - **April 2027 launch:** none at risk, but it is also not needed for launch.
- **Overlap to check [GUESS]:** the **Bow** gives +15 Focus at each floor and **Calm Mind** (a dojo reward) gives +20% Focus gain for 3 runs [CODE, `config.ts`]. Calm Breath stacks with Calm Mind (+50% total for those runs), and Steady Start stacks with the Bow. The slow test should cover both stacks. Steady Start at 70 is a lot to *feel* (two Strikes at every fight start), even though it measures at PE 19; Content Designer may want 60 (exactly 2 Strikes).
- **My recommendation:** ship the 6 number changes and 2 rule tweaks before the beta (they are tuning, not content). Add Calm Breath and Steady Start after the beta, unless art and text are already free. Jay decides (section 8).

## 6. Room for one kata power (new, after the beta)

**The fact:** after the beta each signed-off kata unlocks one power, a passive or a single activated one. The player brings exactly one into the tower. A white belt only has Basic Form 1; an orange belt picks from 3. **Jay sends the powers; I did not choose or size any.**

**What I did:**
- **Reserve [PROPOSED]:** budgets B1–B3 above are for the cards only. B8 holds back **PE 12** for a kata power. That is the R-KATA-POWERS damage cap (+12% for stance and kata together); on the ruler, +12% Power is PE 12 by definition. If Jay's powers are bigger or smaller, only this one number changes. The cards-plus-power ceilings are **single card + power ≤ 38, pair + power ≤ 62, route + power ≤ 67**.
- **Proxy run [MEASURED, 30 seeds × 10 belts, Standard]:** I added a stand-in "+12% Power" slot to the run (not a real power) and re-ran the key cases. Numbers are PE (kid win %):

| Case | kid, cards only | kid, + slot | newer, cards only | newer, + slot | careful, cards only | careful, + slot |
|---|---|---|---|---|---|---|
| Slot alone | 0 | 12.2 (15%) | 0 | 6.9 | 0 | 12.9 |
| Random pool | 39.8 (55%) | 46.3 (64%) | n/a | 42.2 | n/a | 35.2 |
| Flowing route | 50.7 (56%) | 54.9 (69%) | 38.0 | 59.6 | 27.5 | 30.0 |
| Ripple + Heavy Hands | 42.6 (36%) | 49.2 (55%) | 41.4 | **60.0** | 36.9 | **56.8** |
| Double Strike + Heavy Hands | 31.7 (22%) | 40.7 (37%) | 49.3 | 55.6 | 31.3 | 33.9 |
| Double Strike + Rally | 41.1 (47%) | 44.4 (53%) | 17.7 | 31.9 | 18.2 | 27.6 |
| Power route | 39.2 (23%) | 45.8 (49%) | 27.3 | 35.2 | 26.9 | 29.9 |
| Virtue route | 48.2 (52%) | 53.1 (70%) | 15.2 | 29.6 | 21.1 | 25.2 |

  (The random pool "cards only" kid cell is the 11-card pool from the 120-seed run, 54.6% wins by belt average and PE 39.8 over all rows; the "+ slot" cells are 30 seeds.)
- **Read-out:**
  - The kid pool goes from about 55% to 64% wins with a +12% power. That is about today's Standard pool (59–64%), so a +12% power brings back today's feel rather than making runs easy. (30 seeds, ±3 points.)
  - **Everything stays under pair + power ≤ 62 for the kid** (top 54.9). **Skilled Ripple + Heavy Hands reaches 57–60, the ruler's top**, so it is the first combo that would break B8 if a power is bigger than +12% or stacks Focus. Lever if it does: lower Ripple Counter from 1.2 (data only; not measured).
  - The newer bot's jumps (+14 to +22 where the slot should add about 12) are inside the ±5 noise plus the ruler's saturation near 60. They are not a card problem; I flag them so the Tester does not chase them.
- **Not covered, because no powers exist yet [GUESS]:** an **activated** power needs the sim bot to fire it (it can't today); a passive that adds Focus, speed or guard needs its own proxy. Section 7, layer 3 says how.

## 7. Test spec

Tests live in the repo's normal places. Layer 1 runs always; layers 2 and 3 run with `BALANCE=1` like `balance.test.ts`.

**Layer 1: data caps, fast (`packages/sim/test/insight-budget.test.ts`).** No sim.
1. For each card in `content/insights/insights.json`, the effect amount is **at most the proven cap** in one table in the test (Ripple 1.2, Iron Skin 1.0, Wind Step 0.4 / every 5 / 4 s, Double Strike 0.3, Quick Hands 0.2, Rally 0.75, Heavy Hands 0.2, Press 0.3, Calm Breath 0.3, Steady Start 70). Failure text: "re-run `BALANCE=1 insight-budget-sim` and update the table with the new PE".
2. Every family has **at least 2 cards** (after the Virtue cards ship; before, the test names Virtue as an expected exception).
3. Card ids are unique and every id in the table exists (and vice versa).
4. Stacking sanity from `effects.ts`: the sum of all `attackSpeed` stays under the 0.6 cap, and no combination of cards in the family tables can reach a limit (e.g. `disarm` 0.9).
5. `r-bal-14b-charms.test.ts` line 20: update Rally from ×2 to ×1.75; `run.test.ts` line 67: update the card count.

**Layer 2: sim budget, slow (`packages/sim/test/balance/insight-budget.test.ts`, `BALANCE=1`).** Fixed seeds (1..30), belts 1–10, Standard, bots kid, newer and careful. Same harness as the reference copy.
1. Build the PE ruler (powerScale +10/20/30/40/60, same seeds).
2. **B1:** every single card: PE ≤ 26 on all bots; PE ≥ 12 on the kid (no waivers) and ≥ 12 on at least one bot. Skilled floors are not tested; the reasons are written in the test file's comments.
3. **B2:** every single card PE ≤ 30 on newer and careful.
4. **B3:** all pairs (55 today, `n(n-1)/2`) PE ≤ 50 on all bots, and the kid has no pair under 20.
5. **B4:** the four family routes: per-card PE within ±25% of the mean, route PE ≤ 55.
6. **B5:** random pool, kid, 100 seeds per belt (the 30-seed runs are too noisy): mean win % within 6 points of 59, each belt within 15, none under 45.
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

## 8. Taste calls for Jay (only these)

1. **Virtue cards now or after the beta?** Calm Breath and Steady Start measure level with the rest. They need art, names and a playtest. My lean: after the beta. Worth adding either way: the Virtue family has 1 card.
2. **Two identity changes for cards that were near-zero:** Press the Advantage also works on winded or recovering enemies; Wind Step's burst also speeds up basic attacks. Both are small rule tweaks. Without them those two cards stay at PE 2–5 whatever number we pick. OK?
3. **The Power route is still the weakest (about half the kid wins of Flowing on Standard).** Option: lift Heavy Hands from +20% to +25% Power, which closes most of the gap but makes Ripple Counter + Heavy Hands very strong for skilled players (PE 56). I lean to leave it. Do you want it lifted?
4. **Rally ×2 to ×1.75 and Double Strike 0.6 to 0.3:** Double Strike's extra hit chance halves. It was the second strongest card; it stays a good card (PE 20) but kids who loved it will notice. Fine?
5. **Quick Hands text becomes "20% faster"** (a bit smaller than 25%).
6. **Kata powers:** the PE 12 reserve comes from the R-KATA +12% damage cap. When you send the powers, tell me if you want a bigger reserve; it only moves one number in the test.

## 9. Board items (for the Manager; work board not edited)

| ID | Owner | Task | Done when | Waits on |
|---|---|---|---|---|
| R-INSIGHT-BAL-a | Programmer | Apply the 6 number changes in 4a to `content/insights/insights.json` (text too), plus rule tweaks A (Wind Step attack speed) and B (Press also on winded or recovering). Update `r-bal-14b-charms.test.ts` (Rally ×1.75). | `npm test` is green, and the card table in 4b (kid, Standard) reproduces within ±3 PE with the layer-2 harness | Jay's calls 2, 3 and 4 |
| R-INSIGHT-BAL-b | Programmer | Build layer 1 (`insight-budget.test.ts`) and layer 2 (`balance/insight-budget.test.ts`) from section 7, using `R-INSIGHT-BAL-sim/` as the starting point (no env flags or `HOOKS` patch in the committed code; the pick hook needs a proper test-only seam). | Layer 1 runs in the normal suite; layer 2 passes under `BALANCE=1`; raising any card past its cap makes the right line fail (shown once with a deliberate bad number) | R-INSIGHT-BAL-a |
| R-INSIGHT-BAL-c | Content Designer | Write card text for the 6 changes (kid-readable, ages 6+, hopeful, no pressure). If Jay says yes to Virtue: names, text and icon brief for Calm Breath and Steady Start, and a check of the Calm Mind and Bow overlap. Consider 60 vs 70 for Steady Start. | Texts match 4a; run.test count updated to 11 if the Virtue cards ship; icon brief handed to the Artist | Jay's call 1 (for the Virtue part only) |
| R-INSIGHT-BAL-d | Tester | Re-run the whole report on the real build: belts 1–10 × Guided, Standard, Challenge × kid, newer, careful, and a 60-seed kid pool run. Also a human playtest of 3 kid runs picking only Power cards, and 3 picking only Flowing. | The B1–B9 table passes; the Power-only playtest clears at least as often as it did before the changes; any miss is reported with the table | R-INSIGHT-BAL-a, R-INSIGHT-BAL-b |
| R-INSIGHT-BAL-e | Programmer | Layer 3 (kata power stacking) and an activated-power rule for the sim bot. | Layer 3 runs once per power in the list from Jay; the budget lines in section 7 pass or the failing power is named | Jay's kata powers; R-INSIGHT-BAL-b |

## 10. Reference copy and how to repeat the run

Folder `drafts/planning/R-INSIGHT-BAL-sim/` (not compiled, not part of `packages/`):
- `zz-insight-bal.test.ts.txt`: the harness (copy to `packages/sim/test/balance/zz-insight-bal.test.ts` to run). Env: `CONFIGS` (`none`, `pool`, `pool9`, `offer:ID`, `start:a+b`, `SOLO`, `PAIRS`, `OFFER`, `syn:TYPE:AMT`, `pick:greedy:` / `pick:worst:` with `SCORES`), `BOTS`, `DIFFS`, `BELTS`, `SEEDS`, `OUT`, `OVR` (overrides), `NEW` (new cards), `KATA` (the stand-in power slot), `BALANCE=1`.
- `experiment-world.patch` (rule tweaks A and B behind env switches) and `experiment-bot-hook.patch` (the pick hook). Local experiment only.
- `prop3.sh`: the final proposal as env values. `run3.sh`, `pe2.py`, `pe_table.py`, `pairs2.py`, `solo3.py`, `belts.py`, `an.py`: the analysis scripts (paths point at `/tmp/insight-bal`).
- `data.tar.gz`: the raw rows (baseline, final proposal, rulers, pickers, offered-alone).

## Delivery Note
- **ITEM:** R-INSIGHT-BAL
- **WHAT:** a before/after report on the 9 Insight cards, a power budget per family, 6 number changes and 2 small rule tweaks that bring every card to PE 13–22, a proposal for 2 Virtue cards, a headroom reserve for one kata power, a test spec, and board items. No game code, content or work board changed.
- **WHY:** Ripple Counter, Double Strike and Quick Hands were worth 6–17x more than Iron Skin, Press and Wind Step, so the Power route won 10% of kid runs against 53% for Flowing, and Virtue had one card.
- **DECIDE:** (1) Virtue cards now or after the beta. (2) OK to change what Press the Advantage and Wind Step do. (3) Lift Heavy Hands to close the Power route gap, or leave it. (4) OK to halve Double Strike. (5) Quick Hands text "20% faster". (6) The kata power reserve of PE 12 when you send the powers.
- **NEXT:** after Jay's calls the Programmer applies the changes and builds the tests; the Content Designer writes the text; the Tester re-runs the report on the real build. Jay sends the kata powers and layer 3 gets built then.
