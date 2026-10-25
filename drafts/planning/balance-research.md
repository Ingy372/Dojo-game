# R-BAL: Balance research (sourced)

Owner: Researcher · Status: draft for Jay · Date: Oct 24, 2026
Ask (Jay, via Manager): "Nothing should be on guesses, it should be hard science... piggy back off the work others have already done."

## Read this first (honest summary)

- **Some of this is real maths.** The damage formula, effective health, pseudo-random drops and XP curve shapes are exact. We can prove them with a script.
- **Some of it is borrowed from games that worked.** Pokémon, League of Legends, Dota 2, Hades and Stardew have documented formulas. They are proven in shipped games, but not proven as science.
- **"How hard should it feel?" has no hard science.** Even the book on this topic calls balance "a black art" (Schreiber & Romero, publisher page). Schreiber says plainly: "no one ever gets game balance right on the first try." For feel, this doc gives **playtest targets**, marked as targets, not facts.
- **Labels used:** **[MATH]** = provable. **[SHIPPED]** = a documented formula from a released game. **[COMMUNITY]** = worked out by fans, not the studio. **[TARGET]** = our pick, to check by playtest. **(guess)** = a number nobody has proven.

## Sources (every link opened on Oct 24, 2026)

| # | Source | Type | What we use |
|---|---|---|---|
| S1 | Schreiber & Romero, *Game Balance*, CRC Press 2021 — https://www.routledge.com/Game-Balance/Schreiber-Romero/p/book/9781498799577 | Book (publisher page checked; book text not read) | Chapters exist on "Progression in PvE Games", "Pseudorandom Numbers", "Managing Luck and Skill", "Transitive Mechanics and Cost Curves". Quote: "game balance can best be described as a black art". |
| S2 | Schreiber, "Level 3: Transitive Mechanics and Cost Curves", Game Balance Concepts, 2010 — https://gamebalanceconcepts.wordpress.com/2010/07/21/level-3-transitive-mechanics-and-cost-curves/ | Designer write-up | Cost curves; "it's better to make an object too weak than to make it too strong"; "you have to plan on doing a lot of heavy playtesting". |
| S3 | League of Legends Wiki, "Armor" — https://leagueoflegends.fandom.com/wiki/Armor | [SHIPPED] (fan wiki of Riot's formula) | Damage × 100/(100+armor). Each point adds 1% effective health, linear, no diminishing returns. |
| S4 | Bulbapedia, "Damage" — https://bulbapedia.bulbagarden.net/wiki/Damage | [COMMUNITY] | Gen V+ damage formula; random 0.85–1.00; a 0 result still deals 1. |
| S5 | Bulbapedia, "Experience" — https://bulbapedia.bulbagarden.net/wiki/Experience | [COMMUNITY] | Six XP groups (Fast 4n³/5 … Slow 5n³/4). Gen V and VII+ give lower-level winners more XP. |
| S6 | Stardew Valley Wiki, "Skills" — https://stardewvalleywiki.com/Skills | [COMMUNITY] (table read from game data) | 10 levels, totals 100 → 15,000 XP, each step bigger than the last. |
| S7 | Dota 2 Wiki, "Random Distribution" — https://dota2.fandom.com/wiki/Random_Distribution | [SHIPPED] (fan wiki of Valve's system) | PRD: P(N) = C·N, resets on success. "Rarely proc many times in a row, or go a long time without happening." |
| S8 | Hades Wiki, "God Mode" — https://hades.fandom.com/wiki/God_Mode | [SHIPPED] | 20% damage resistance, +2% per death, max 80%, toggle any time. |
| S9 | Sid Meier, "The Psychology of Game Design (Everything You Know Is Wrong)", GDC 2010 keynote — session page https://www.gdcvault.com/play/1012186/The-Psychology-of-Game-Design (vault was down for maintenance when checked; session text confirmed via search snapshot). Reports: GameSpot live blog https://www.gamespot.com/articles/meier-on-crafting-the-epic-journey-full-keynote-video-inside/1100-6253256/ , Game Informer https://gameinformer.com/b/news/archive/2010/03/12/sid-meier-gamers-arent-logical , Meier's own account (Ars Technica, 2020) https://arstechnica.com/gaming/2020/09/from-pong-to-civilization-how-i-made-one-more-turn-work-on-consoles/ | GDC talk + designer write-up | Players felt a 3-to-1 loss was unfair; two 2-to-1 losses in a row made them angry, so "Civilization games now take into account past battles" (GameSpot). |
| S10 | Hunicke, "The case for dynamic difficulty adjustment in games", ACE 2005 — https://doi.org/10.1145/1178477.1178573 (abstract confirmed via search; ACM page timed out on direct fetch) | Paper | Adjustment "must be performed without disrupting or degrading the core player experience." Results were "preliminary". |
| S11 | Jenova Chen, *Flow in Games* site — https://www.jenovachen.com/flowingames/ (lists the CACM paper "Flow in Games (and Everything Else)", Vol 50, No 4, p31, Apr 2007) | Thesis/paper | Background only. Not used for any number. |

**Looked for, not used:**
- **Zelda, Diablo:** I found no documented formula I could verify, so they are left out rather than guessed.
- **Kongregate "Math of Idle Games":** the link I had returns 404, so it is dropped.
- **Research on children:** I found no study of children and game difficulty numbers. **No claim about how kids learn or feel is made here.**

---

## System 1 — Damage, health, defence

**1. Now.**
- `packages/sim/src/combat.ts:10-13`: `max(1, round(power × strength × 100/(100+guard) × (1+bonus)))`.
- Player starts with Health 100, Power 10, Guard 0 (`config.ts:50`).
- Moves: Basic strength 1, cooldown 12 ticks (`config.ts:71-77`); Strike strength 2.5 for 30 Focus (`config.ts:80-89`); Perfect Counter strength 2; Block ×0.5 (`config.ts:99-103`).
- Combo +5/10/15% at 10/20/30 hits (`config.ts:64-68`).

**2. Cited options.**
- (a) LoL armor 100/(100+R) [SHIPPED, S3].
- (b) Pokémon ratio A/D inside a level formula, with a random 0.85–1.00 [COMMUNITY, S4].
- (c) Flat subtraction (power − guard). This is not cited and is shown only to be ruled out: it can hit 0, so it needs a floor.

**3. Recommend: keep (a), the formula we already have.**
- **[MATH]** With this formula, effective health = Health × (1 + Guard/100), exactly. Each Guard point is worth the same 1% every time (S3). Kids can't stack Guard into being unhittable, and Guard never becomes worthless.
- No random spread: we don't add Pokémon's 0.85–1.00 roll. The same hit always does the same damage, which is easier to read at 6+. This is a design choice, not science.
- The `max(1, …)` floor matches Pokémon's "0 deals 1" rule (S4).

**4. Change.** Formula: none. Use **EHP** as the single number for comparing enemies and gear (see Systems 2 and 3).

**5. Test.** `balance-sim.py` section 6 prints EHP. Pass: the sim's EHP equals health ÷ (damage at guard g ÷ damage at guard 0) within rounding.

## System 2 — Enemy scaling across belts and Tower floors (the big gap)

**1. Now.**
- Enemies have **fixed stats** (`content/enemies/*.json`): swarmer 40/8/0, shield 90/15/15, bopper 110/16/10, brute 180/25/25, floor-keeper 700/26/30 (health/power/guard).
- Elites only multiply these stats (`elite.ts:99-120`; e.g. health ×1.25). Nothing scales by tier or floor.
- The plan says a Guardian is about 90% of the tier max, Endless is +3% per floor, and Challenge is about 1.3–1.5× (`docs/core-design.md` §12). **None of this is in the code.**
- Sim section 1 (basic hits only):

  | Player level | Hits to beat a brute | Brute hits to knock the player out |
  |---|---|---|
  | 1 | 23 | 4 |
  | 50 | 8 | 10 |
  | 100 (black) | 5 | 16 |

  Late belts get trivial, which means real training stops mattering in fights.

**2. Cited options.**
- (a) Scale enemies to the *expected* player at that point. This is the cost-curve idea: tie every stat to one shared yardstick (S2; S1 has a chapter on "Progression in PvE Games").
- (b) Scale enemies to the *actual* player, live. That is DDA (S10), and the paper's own results are preliminary.
- (c) Exponential growth per floor (our Endless +3%). **No source found.** Sim section 5: ×4.4 at floor 50, ×19.2 at floor 100.

**3. Recommend (a).**
- Each belt tier gets an "expected Artist": the stats a typical kid has at that tier with Standard gear, built from the Power Rating shares in `config.ts:244-258`.
- Enemy stats per tier = base stat × tier multiplier. Pick the multiplier so the **hits-to-beat** and **hits-to-knock-out** counts stay inside the target bands below at every tier.
- Do **not** scale to the actual player. Extra real training then shows up as fights getting easier, which keeps real training the main source of power. It also avoids the "cheated" feeling Hunicke names (S10).
- **[TARGET]** bands (no science; pick by playtest):

  | Enemy | Hits to beat (Standard) | Hits it takes to knock out the expected Artist |
  |---|---|---|
  | Swarmer | 2–4 | ≥ 12 |
  | Brute | 10–20 | ≥ 5 |
  | Floor-keeper | 40–80 (basic hits; Strike and Counter shorten this) | ≥ 5 |

  These are taken from today's level-1 numbers, which the existing balance bot already plays.
- Endless +3%: **decided (D4): +3% per floor with no cap.** Maths note only (not the plan): a soft cap such as ×1.5 would stop growth at floor 14; with no cap, floor 25 is ×2.1 and floor 50 is ×4.4 (sim section 5). There is no science for a per-floor rate.

**4. Change (Programmer).**
- Add `ENEMY_SCALE` by tier to `config.ts`, applied when an enemy spawns.
- Keep wind-ups as they are: never scale ticks (wind-up ≥ 10 ticks).
- Challenge multiplier is **1.5× (decided, D5)**, the high end of §12.

**5. Test.**
- Extend `balance-sim.py` with the multiplier table.
- Pass: for tiers 1–10, every enemy is inside its band for the expected Artist.
- Then run `npm run balance` with a fixture for each tier. Pass: Standard win rate stays inside the band in System 6.

## System 3 — Gear and item stats

**1. Now.**
- White-belt caps: Power 4, Health 30, Guard 8 (`config.ts:193-195`).
- Slot stats in `content/loot/gear.json`: hands Power 1/2/3/4; gi Health 8/14/20/28 and Guard 2/3/5/7.
- Gear share is 8% of the tier max (`config.ts:244-258`). Standard gear reaches about 90% of the cap and Challenge gear 100% (§12).

**2. Cited options.**
- Cost curve: every stat converted into one shared unit (S2).
- LoL-style linear armor value (S3).

**3. Recommend.**
- Convert every gear stat into EHP or damage share, using one yardstick: **1 Guard = 1% EHP [MATH]**.
- Check that each rarity step adds the same share, so no slot is "above the curve" (S2).
- Follow S2's rule of thumb: if unsure, make an item **too weak rather than too strong**.
- Keep gear at or below its 8% share, so gear can never beat training.

**4. Change.** Scale the caps per tier in proportion to the tier max. Today only white-belt caps exist.

**5. Test.** A sim row for each tier and rarity. Pass:
- Full Epic gear ≤ 8% of the tier max.
- Each rarity step changes EHP or damage by a similar amount (within ±25%, guess).

## System 4 — XP and level curves

**1. Now.**
- `progression.ts:14-34`: tier XP = months in rank × 4.35 × 0.75 × 8 runs × 110 XP. Inside a tier, step k needs tierXp·k/55, so XP grows in a straight line.
- Sim section 3: 3 months in rank (confirmed by Jay as the typical case; the real value still comes from the school feed) gives 8,613 XP, about 9.8 weeks to the cap. Steps run from 1.4 to 14.2 runs.
- The catch-up rule doubles XP (×2) (`config.ts:200-221`).

**2. Cited options.**
- Pokémon cubic groups [COMMUNITY, S5].
- Stardew's 10-level table, steps growing roughly ×1.3–×1.6 each (S6).
- Pokémon Gen V/VII+ give lower-level winners more XP (S5).

**3. Recommend: keep our curve.**
- Pokémon's cubic curves assume one level ladder to 100. Our level cap resets per belt and follows real time in rank, which is closer to Stardew's short 10-level ladder.
- The last step (14 runs, about 1.8 weeks) is a long wait for a 6-year-old. **[TARGET]** last step ≤ 10 runs. This is a playtest call; the ratio is a design choice.
- The catch-up ×2 follows the same idea as Pokémon's level-difference XP (S5) and is a sourced pattern.

**4. Change (decided, D3).** The last step must be ≤ 10 runs. Soften the step weights from k to (k+11) (guess); steps then run from 5.7 to 10.0 runs (sim section 3). Note: the earlier idea of (k+5) still gives an 11.2-run last step, so it is not enough.

**5. Test.** Sim section 3. Pass:
- No step over 10 runs.
- The tier total is unchanged (pacing stays tied to time in rank).

## System 5 — Rewards, drop rates, bad-luck counter

**1. Now.**
- Rarity 70/22/7/1 (`config.ts:182`).
- +3 Rare weight per run without a Rare; a Rare is guaranteed on the 5th such run (`config.ts:184,186`; `loot.ts:160-172`; `profile.ts:249`).
- Drop chances and chests are set in `content/loot/drops.json`.
- No loot boxes and nothing to buy.

**2. Cited options.**
- Dota PRD: chance rises by C after each miss and resets on a hit (S7).
- Meier: players get angry at repeated bad luck, so Civ "take[s] into account past battles" (S9).
- *Game Balance* has a "Pseudorandom Numbers" chapter (S1).

**3. Recommend: keep our counter.**
- It is the same idea as PRD (S7) with a hard cap, which matches Meier's lesson (S9).
- Sim section 4, with 2 to 6 rolls per run (guess):

  | | Average runs to a Rare | Worst case |
  |---|---|---|
  | Without the counter | 2.5–6.5 | 21–58 runs |
  | With the counter | 2.1–3.3 | **always 5** |

  That cap is the whole point.

**4. Change.** None to the rule. Add a test that fails if the cap is ever raised above 5.

**5. Test.** Sim section 4. Pass: the worst case is ≤ 5 runs and the average stays ≥ 2 runs, so Rares still feel special.

## System 6 — Difficulty curves and help

**1. Now.**
- Counter windows: Guided 10, Standard 6, Challenge 4 ticks; Challenge fill speed ×0.8 (`config.ts:31-36`).
- Guided is offered after 2 lost runs in a row, at most once a day (`content/settings/difficulty.json`).
- Healing: 15% per room cleared, 60% at a rest shrine (`config.ts:133-135`).

**2. Cited options.**
- Hades God Mode: opt-in, grows after each death, toggle any time (S8).
- Hunicke DDA: hidden, live adjustment (S10).
- Meier: avoid losing streaks (S9).

**3. Recommend.**
- Keep Guided as an **offer the kid chooses**, like God Mode (S8). Don't adjust silently: S10 notes players may feel "cheated", and its counter-evidence is preliminary.
- Let Guided be turned off or on any time, with no lockout (same as S8).
- **[TARGET]** Standard first-try clear rate per floor 60–80% (guess). Guided ≥ 90% (guess). These are playtest targets only, not science.

**4. Change.** None to the code before playtest. The balance bot reports win rates already.

**5. Test.** Run `npm run balance` (RUNS=60) for each tier fixture once System 2 lands. Pass: Standard win rate is inside the target band, and Guided is ≥ 90%.

## Other systems checked

- **Training Points:** 15 minutes per point (`config.ts:233-237`).
- **Virtue rank:** +25% per rank (`config.ts:261`).
- **Power shares:** match §12.
- These are tied to real training, not the game's maths, so there is nothing to source. Keep them.

## Playtest targets in one place (not science)

| Target | Value |
|---|---|
| Hits-to-beat bands | System 2 table |
| Standard clear rate | 60–80% |
| Guided clear rate | ≥ 90% |
| Longest level step | ≤ 10 runs |
| Worst case for a Rare | ≤ 5 runs |
| Endless | +3% per floor, no cap (D4) |
| Challenge | ×1.5 enemy Health and Power (D5) |

All of these are (guess) until kids play.

## Proposed board items (for the Manager; work board not edited)

| ID | Owner | What | Done when | Waits on | Scope (April 2027) |
|---|---|---|---|---|---|
| R-BAL-1 | Jay | Approve the approach: expected-Artist scaling, the target bands, keeping the damage formula | **Done: approved Oct 24 (D1, D2)** | this PR | Launch |
| R-BAL-2 | Programmer | Add per-tier enemy scaling (`ENEMY_SCALE`) and per-tier gear caps; no tick scaling | Sim and `npm run balance` show every tier inside its bands | R-BAL-1 | Launch |
| R-BAL-3 | Tester | Balance fixtures for each tier; `npm run balance` reports per tier | A table of win %, deaths and room times for tiers 1–10 is in the PR | R-BAL-2 | Launch |
| R-BAL-4 | Programmer | Test that locks the bad-luck counter (guaranteed on run ≤ 5) | Test fails if `guaranteedRareOnRun` > 5 | none | Launch |
| R-BAL-5 | Programmer | Soften XP step weights to (k+11) (D3) | Sim section 3 shows no step over 10 runs and the tier total unchanged | none (decided) | Launch (one config line) |
| R-BAL-8 | Researcher | Fill C13 enemy stats with expected-Artist scaling, Challenge 1.5×, Endless uncapped | Every new enemy inside its bands on Standard and Challenge | D1–D5 | Launch (tiers 1–3 first, 4–6 in C13-2) |
| R-BAL-7 | Tester | Kid playtest against the targets | Clear rates logged for each difficulty and compared with the targets | R-BAL-3 | Launch |

## Decided (Jay via Manager, Oct 24)

1. **D1:** Scale enemies to the *expected* Artist for each tier, not the actual Artist.
2. **D2:** The target bands in System 2 are OK as written.
3. **D3:** Soften XP steps so the last step is ≤ 10 runs. Plan: weights (k+11) (guess), which gives 5.7 to 10.0 runs per step.
4. **Months in rank:** 3 months is confirmed as the typical case.
5. **D4:** Endless keeps +3% per floor with **no cap**. The soft cap is dropped as a plan (R-BAL-6 removed); its maths stays only as a note in System 2.
6. **D5:** Challenge multiplier is 1.5×.

## How to run the check

`python3 drafts/planning/balance-sim.py` (Python 3, no packages). Output as of this PR:

```
== 1. Hits for the player to beat each enemy (basic hit, strength 1, no gear) ==
level       swarmer        shield        bopper         brute  floor-keeper
    1             4            10            13            23            88
   10             3             8            10            17            70
   20             3             6             7            13            50
   50             2             4             5             8            31
  100             1             3             3             5            19

== 2. Enemy hits to knock out the player (no Block, no gear) ==
    1            13             7             7             4             4
   10            16             9             8             6             5
   50            31            17            16            10            10
  100            50            27            25            16            16

== 3. XP per belt tier (typical 3 months in rank) ==
tier XP 8613, about 9.8 weeks at 8 runs/week to reach the cap
XP per level step (tier 2+): [157, 313, 470, 626, 783, 940, 1096, 1253, 1409, 1566]  runs per step: [1.4, 2.8, 4.3, 5.7, 7.1, 8.5, 10.0, 11.4, 12.8, 14.2]
softened (k+11): [626, 679, 731, 783, 835, 887, 940, 992, 1044, 1096]  runs per step: [5.7, 6.2, 6.6, 7.1, 7.6, 8.1, 8.5, 9.0, 9.5, 10.0]
D3 check (no step over 10 runs, total unchanged): PASS

== 4. Bad-luck counter: runs until the first Rare-or-better ==
2 rolls/run  no counter: mean 6.49, 90% by 14, worst 58   with counter: mean 3.34, 90% by 5, worst 5
4 rolls/run  no counter: mean 3.54, 90% by 7, worst 27   with counter: mean 2.53, 90% by 5, worst 5
6 rolls/run  no counter: mean 2.54, 90% by 5, worst 21   with counter: mean 2.07, 90% by 4, worst 5

== 5. Endless Ascent: 3% stronger per floor, no cap (D4 decided) ==
floor  10: x1.3
floor  25: x2.1
floor  50: x4.4
floor 100: x19.2
Challenge (D5): enemy Health and Power x1.5; Endless and Challenge multiply.

== 6. Effective health (EHP = Health x (1 + Guard/100)), exact for our damage formula ==
     swarmer: 40
      shield: 103
      bopper: 121
       brute: 225
floor-keeper: 910
```
