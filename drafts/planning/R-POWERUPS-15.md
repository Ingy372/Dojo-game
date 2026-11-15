# R-POWERUPS-15: Power-up pool plan (OV-P1)

Status: proposal for the Manager. Docs only. No game code, content or work board changed.
Source: `docs/reviews/fable-progression-overhaul.md` (B6, L14, section 8.1 #10). Limits: `R-INSIGHT-BAL.md` section 3 (B1-B9).

## 1. Short answer

- I tested **8** new Power-ups built only from effect types the game already has.
- **4 pass every limit** on every bot, difficulty and belt. They go in the data draft `R-POWERUPS-15-data.json`.
- **4 fail.** Two only help skilled players (or are too strong for them), two do almost nothing.
- So the pool can grow from **9 to 13** with no new code. Getting to about 15 needs either new effect types (new code, a scope call) or accepting 13 for now. See section 6.

## 2. The 4 that pass (go into OV-B6)

| id | Effect (already in the game) | Family today | Kid PE, Standard | Why it's good |
|---|---|---|---|---|
| calm-breath | `focusGain` 0.25 (+25% Focus gains) | virtue | 17.4 | Helps every style, strongest for the kid |
| steady-start | `startFocus` 40 | virtue | 16.1 | Simple, reads well for young kids |
| lighter-strike | `strikeCost` 4 (Strikes cost 4 less Focus) | flowing | 15.5 | More Strikes, fits the Flowing family |
| softer-block | `blockCut` 0.1 (Blocks take 10% less) | rooted | 12.9 | Gives Rooted a 3rd card (it had only 2) |

Families after: rooted 3, flowing 4, power 3, virtue 3 (was 2 / 3 / 3 / 1). That makes the families more even.

Names and card text are **OPEN** for the Content Designer (OV-C1). Icons go to the Artist (OV-A1).

## 3. The 4 that fail (not proposed)

| id | Effect | Result |
|---|---|---|
| wider-window | `counterWindow` 1 | Kid PE 1.1 (under the 12 floor), but careful 32.7 Standard and 39.4 Challenge (over the 26 / 30 caps). Helps experts, not kids. 1 tick is the smallest step, so it can't be tuned down. |
| longer-stagger | `staggerTicks` 10 | Kid PE 3.3. Tried 20 too: same result, because the stagger hold cap (`COMBAT.counter.holdCapTicks`) already limits it. |
| heal-on-perfect | `healOnPerfect` 3 | Kid PE 1.1, skilled bots 0. Too weak to matter. |
| block-then-dash | `dashOnBlock` | PE 0 on every bot. The sim bots never use the Dash it gives. |

## 4. Balance check (balance-check skill) [MEASURED]

Method: same as R-INSIGHT-BAL. PE = Power-Equivalent, read on a +0/10/20/30/40/60% Power ruler (Heavy Hands +20% = PE 20). Card held all run. 4 bots (kid, newer, careful, masher) x 3 difficulties (Guided, Standard, Challenge) x belts 1-10, **20 seeds per belt**. Noise is about +/-5 PE at 30-40 seeds, so a bit more here; nothing passes by less than that except where noted.

### 4a. Single card: mean PE (highest single belt in brackets)

| Bot | Difficulty | No card win % | calm-breath | steady-start | lighter-strike | softer-block | wider-window | longer-stagger | heal-on-perfect | block-then-dash |
|---|---|---|---|---|---|---|---|---|---|---|
| kid | guided | 46 | 21.7 (24.1) | 14.5 (21.5) | 9 (14.5) | 9.8 (15.5) | 0.5 (5.3) | 0 (11.3) | 2.3 (10.4) | 0 (0) |
| kid | standard | 3.5 | 17.4 (22.7) | 16.1 (20.3) | 15.5 (19.7) | 12.9 (15.2) | 1.1 (9) | 3.3 (12.3) | 1.1 (4.6) | 0 (0) |
| kid | challenge | 1.4 | 25.1 (28.3) | 26.5 (30.7) | 22.3 (28.5) | 21.6 (23.2) | 21.5 (26.2) | 4.5 (8.8) | 4.4 (6.4) | 0 (0) |
| newer | guided | 100 | 3 (30.8) | 2.1 (9.2) | 2 (25.3) | 13 (19.7) | 30 (30.9) | 0.3 (30) | 0 (0) | 0 (0) |
| newer | standard | 100 | 15.6 (19.1) | 15.7 (26.5) | 13.8 (23.3) | 9.6 (20.3) | 26.1 (33) | 0.5 (10.8) | 0 (0) | 0 (0) |
| newer | challenge | 100 | 13.2 (18.9) | 5.8 (12) | 8.5 (18.1) | 4.4 (6) | 17.5 (24.7) | 0 (7.2) | 0 (0) | 0 (0) |
| careful | guided | 100 | 20.2 (43.3) | 20.4 (30.7) | 5.2 (38.4) | 14.7 (30) | 13.9 (16.5) | 15 (31.9) | 0 (0) | 0 (0) |
| careful | standard | 100 | 2.7 (21.3) | 13.2 (24.3) | 12 (21.7) | 17 (23.5) | 32.7 (37.9) | 1.1 (8.5) | 0 (0) | 0 (0) |
| careful | challenge | 100 | 24.3 (26) | 23.4 (25.6) | 7.4 (23.7) | 28.3 (29.7) | 39.4 (39.9) | 10.4 (26.1) | 0 (0) | 0 (0.1) |
| masher | guided | 28 | 17.8 (26.1) | 5.8 (17.6) | 12.2 (15.4) | 22 (25.6) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| masher | standard | 3 | 12.8 (27.5) | 9.9 (12.1) | 9.1 (22.4) | 22.2 (24.9) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |
| masher | challenge | 0.7 | 28.6 (34) | 18.6 (24.2) | 26.1 (30.8) | 24.2 (28.1) | 0 (0) | 0 (0) | 0 (0) | 0 (0) |

Masher scores 0 on counter cards because the masher bot never counters. Skilled bots win 100% on every setting, so their PE reads speed and health only.

### 4b. Pairs and kata, Standard: PE

| Bot | Pairing | calm-breath | steady-start | lighter-strike | softer-block | wider-window | longer-stagger |
|---|---|---|---|---|---|---|---|
| kid | + Heavy Hands | 32.4 | 34.1 | 28.4 | 29.1 | 16.6 | 20 |
| kid | + Ripple Counter | 34.3 | 30.1 | 34 | 26.1 | 25.2 | 17.3 |
| kid | + Double Strike | 34.9 | 15.4 | 23.8 | 23 | 14.7 | 15.5 |
| kid | + kata | 30.4 | 19.7 | 26.4 | 23 | 11.2 | 14.5 |
| kid | + Heavy Hands + kata | 40.1 | 38.3 | 39.3 | 35.1 | 35.1 | 32.7 |
| kid | + Ripple + kata | 41.9 | 40.7 | 38.2 | 43 | 39.1 | 36.6 |
| newer | + Heavy Hands | 28.2 | 27.6 | 25.1 | 23.3 | 41.9 | 21.8 |
| newer | + Ripple Counter | 25.6 | 19.9 | 40.3 | 38.6 | 42.2 | 25.5 |
| newer | + Double Strike | 33.2 | 38.7 | 19.5 | 32.9 | 38.2 | 18.3 |
| newer | + kata | 21.4 | 23.1 | 19.8 | 15.2 | 31.1 | 10.9 |
| newer | + Heavy Hands + kata | 49.7 | 46.9 | 49.2 | 45.8 | 48.2 | 28.4 |
| newer | + Ripple + kata | 31.1 | 33.2 | 51.8 | 49.7 | 51.2 | 34 |
| careful | + Heavy Hands | 20.3 | 12.4 | 18.8 | 40 | 41.4 | 24.5 |
| careful | + Ripple Counter | 14 | 20.5 | 13.1 | 16.6 | 41.4 | 16.7 |
| careful | + Double Strike | 23.7 | 14.1 | 11.6 | 18.9 | 36.4 | 9.3 |
| careful | + kata | 18.9 | 11.5 | 11.4 | 18.8 | 37.2 | 10.2 |
| careful | + Heavy Hands + kata | 33.4 | 24.4 | 27.4 | 45.9 | 45.5 | 28.2 |
| careful | + Ripple + kata | 41.3 | 25.5 | 27.7 | 21.5 | 48 | 22.8 |
| masher | + Heavy Hands | 29.4 | 20.7 | 29.3 | 24.9 | 13.3 | 13.3 |
| masher | + Ripple Counter | 12.1 | 10.4 | 10.8 | 22.6 | 0 | 0 |
| masher | + Double Strike | 33.6 | 13.3 | 20.3 | 24.2 | 10.9 | 10.9 |
| masher | + kata | 17.2 | 13.3 | 14.8 | 23.1 | 7 | 7 |
| masher | + Heavy Hands + kata | 37.2 | 38.2 | 34.6 | 37.4 | 31.6 | 31.6 |
| masher | + Ripple + kata | 17.2 | 13.3 | 14.8 | 23.1 | 7 | 7 |

Kata = one kata power (powerScale 0.12).

### 4c. Limits, the 4 passing cards

| Limit (R-INSIGHT-BAL) | Needed | Worst reading | Result |
|---|---|---|---|
| B1 single card, kid Standard | PE 12-26 | 12.9 (softer-block) to 17.4 (calm-breath) | PASS (softer-block is close to the floor, inside noise) |
| B1 cap, all bots Standard | PE <= 26 | 17.0 (careful, softer-block) | PASS |
| B2 skilled single card | PE <= 30 | 17.0 | PASS |
| B9 kid Guided / Challenge (info) | PE <= 32 | 26.5 (steady-start, Challenge) | PASS; one belt reads 30.7 |
| B3 any pair, Standard | PE <= 50 | 40.3 (newer, lighter-strike + Ripple) | PASS |
| B8 card + kata | <= 38 | 30.4 (kid, calm-breath + kata) | PASS |
| B8 pair + kata | <= 62 | 51.8 (newer, lighter-strike + Ripple + kata) | PASS |
| B7 neighbour jump, kid | top / bottom < 2x | 24.4 / 12.9 = 1.9 | PASS, but close |

Not measured here (needs the real 13-card pool in the game): **B5 random pool win %, B6 picking gap, B10 route spread.** These must be re-run by the existing R-INSIGHT-BAL tests when OV-B6 imports the cards. If B5 moves more than 6 points, the fix is to lower a number in this draft, not to add cards.

Pairs between two new cards were not run (saves usage). Every new card is weaker than Heavy Hands, Ripple and Double Strike, which were the pairs tested, so new + new pairs should sit lower.

## 5. Rename Rooted / Flowing (review 8.1 #10) [PROPOSAL]

The families are still named after old Forms that were renamed on Oct 25. Kids never see family names (review: only "Power-up" is kid-facing), so this is a code and staff-view rename.

- Proposal: **rooted -> "guard"** (blocks and counters), **flowing -> "speed"** (fast hits and Focus for Strikes). Power and virtue stay.
- Touches: `packages/sim/src/insight.ts` (family list), `insights.json`, R-INSIGHT-BAL tests. Small. Programmer, inside OV-B6.
- Taste call for the Manager (or Jay). Any two plain words work; these are just my pick.

## 6. Work items

| Item | Owner | Done when | Waits on |
|---|---|---|---|
| OV-B6 | Programmer | The 4 cards in `R-POWERUPS-15-data.json` are in `insights.json` (pool = 13), and R-INSIGHT-BAL tests (B1-B10) pass on main | OV-C1 names, Manager OK |
| OV-B6a | Programmer | Families renamed per section 5 (if approved), tests pass | rename decision |
| OV-C1 | Content Designer | Each of the 4 cards has a name and one short kid-safe sentence | this plan |
| OV-A1 | Artist | 4 icons that read without text | OV-C1 |

## 7. Decision needed (for the Manager)

1. Accept a 13-card pool now (only 4 of 8 candidates passed), or ask for new effect types to reach about 15? New effect types are new code, so that is a scope call against April 2027. My advice: take 13 now; the review's "24+" (L14) is post-launch.
2. Family rename words (section 5).

## 8. Reproduce

Sim: `drafts/planning/R-POWERUPS-15-sim/ov-p1-powerups-sim.ts`. Copy it and its vitest config into `drafts/planning/` on a checkout, then run for example:
`OV_BOT=kid OV_DIFF=standard OV_SEEDS=20 OV_MODE=solo npx vitest run --config drafts/planning/vitest.ov-p1.config.ts`
Modes: solo, hh, ripple, ds, kata, hh+kata, ripple+kata. Raw results are in `R-POWERUPS-15-sim/results/`.
