# OV-P5: Power-up pool retune (R-INSIGHT-BAL B1-B10)

Status: proposal for the Manager. Docs only. No game code or live content changed. The data goes into OV-B6.
Inputs: `R-POWERUPS-15.md` (OV-P1), `R-INSIGHT-BAL.md` section 3 (limits B1-B10), `packages/sim/test/balance/insight-budget.test.ts` (the real gate).

## 1. Short answer

- **12 cards, every gate B1-B10 passes** in the real `BALANCE=1` test (7 of 7 tests pass).
- **B5 pool:** the kid wins **59.7%**. The gate is 59 ± 6, and the 13-card pool was at 46.1%.
- **B10 route spread:** **8.0** with every family card held (limit 14, target 10; it was 18.7). With the lean picker it's **2.7** (limit 10).
- **What changed:**
  - **Wind Step is dropped.** It's the weakest card for the kid, and every 13-card set I tried failed B5 or B1.
  - **3 live cards are raised:** Press the Advantage, Shield Breaker and Double Strike.
  - **3 of the 4 new cards are raised:** Steady Start, Lighter Strike and Softer Block. Calm Breath stays at 0.25.
  - **Heavy Hands stays at 0.2**, and no new effect types are used.

## 2. The numbers

| Card | Family | Effect | OV-P1 / live | OV-P5 | Kid PE (B1) |
|---|---|---|---|---|---|
| Ripple Counter | rooted | rippleCounter | 1.2 | 1.2 (same) | 24.4 |
| Iron Skin | rooted | blockReflect | 1.2 | 1.2 (same) | 22.8 |
| softer-block (Iron Block) | rooted | blockCut | 0.10 | **0.12** | 17.8 |
| Wind Step | flowing | comboSpeed | 0.3 | **dropped** | n/a |
| Double Strike | flowing | strikeExtraHit | 0.2 | **0.3** | 22.5 |
| Quick Hands | flowing | attackSpeed | 0.2 | 0.2 (same) | 24.7 |
| lighter-strike | flowing | strikeCost | 4 | **7** | 21.7 |
| Press the Advantage | power | staggerBonus | 0.3 | **0.4** | 24.8 |
| Shield Breaker | power | shieldBreaker focusOnBreak | 7 | **12** | 24.0 |
| Heavy Hands | power | powerScale | 0.2 | 0.2 (same) | 21.2 |
| Rally | virtue | lowHealthFocus | 0.75 | 0.75 (same) | 22.9 |
| calm-breath | virtue | focusGain | 0.25 | 0.25 (same) | 19.0 |
| steady-start | virtue | startFocus | 40 | **60** | 20.7 |

That gives 3 cards in each family. The data is in `OV-P5-data.json`.

**Why the pool dropped.** A run never offers a card you already hold, and the kid bot picks at random. So adding cards that are weaker than average waters down every run. Lowering numbers makes that worse, which is why the fix raises the weak cards up to the strong ones instead.

## 3. Balance check (balance-check skill) [MEASURED]

How I ran it: the real gate `BALANCE=1 npx vitest run test/balance/insight-budget` on main, with `content/insights/insights.json` swapped (locally, never committed) for `OV-P5-data.json`. The run covered belts 1-10, bots kid, newer and careful, and the test's own seeds (from 1000). The log is in `OV-P5-sim/results/insight-budget-P2.txt`.

**Check on the setup:** the bot-code/ov-b6 branch isn't on GitHub, so I rebuilt the 13-card pool from main plus the OV-P1 data. My sim gave exactly your ov-b6 numbers: pool 46.1, and routes 43.7 / 50.7 / 32.1 / 46.5.

| Gate | Limit | OV-P5 result | Pass |
|---|---|---|---|
| B1 single card, kid | PE 12-26 | 17.8 (softer-block) to 24.8 (Press) | PASS |
| B1 cap, all bots | PE ≤ 26 | highest skilled 23.0 (newer, Ripple) | PASS |
| B2 skilled cap | PE ≤ 30 | 23.0 | PASS |
| B3 pairs (66) | ≤ 50; kid ≥ 20 | highest 49.3 (newer, Heavy Hands + Ripple, both unchanged); kid lowest 26.4 | PASS (the top pair is close, but it isn't a card I changed) |
| B4 route PE per card | 11.7-19.5; route ≤ 55 | 14.9 / 16.2 / 15.9 / 15.3; routes 44.7-48.5 | PASS |
| B5 pool, kid Standard | 59 ± 6; each belt within 15 of before, none under 45 | mean 59.7; belts 64 70 63 55 63 64 53 55 53 57 | PASS |
| B5 Guided (info) | ≥ 90 | 96.8 | PASS |
| B5 Challenge (info) | 30 ± 10 | 36.7 | PASS |
| B6 picking gap | ≤ 25 | 0.2 (63.5 vs 63.3) | PASS |
| B7 neighbour jump | ≤ 2x | 24.8 / 17.8 = 1.4 | PASS |
| B9 Guided / Challenge (info) | ≤ 32 | Guided max 28.9; Challenge max 31.5 (Iron Skin, unchanged) | PASS |
| B10 held routes | spread ≤ 14 (target 10) | rooted 48.3, flowing 49.9, power 42.7, virtue 50.7: **8.0** | PASS |
| B10 lean picker | spread ≤ 10 | 61.2, 58.5, 59.5, 60.9: **2.7** | PASS |

**B5 per belt** (kid, Standard, 150 seeds per belt)

| Belt | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Before (gate) | 60 | 67 | 67 | 61 | 57 | 57 | 47 | 50 | 53 | 51 |
| 13-card OV-P1 | 59 | 53 | 68 | 42 | 41 | 40 | 35 | 41 | 39 | 41 |
| **OV-P5 (12)** | 64 | 70 | 63 | 55 | 63 | 64 | 53 | 55 | 53 | 57 |

The biggest neighbour-belt step is 11 points (belts 6 to 7), the same shape as before.

**What I tried that failed** (pool mean / held spread / lean spread; details in the sim folder):
- 13 cards with the new cards raised: the pool reached 58-59 only once Press went to 0.75 or Quick Hands to 0.25, and those break B1 (kid PE 36.0 and 35.4).
- 13 cards with B1-safe numbers: the best pool was 54.5, and the held spread was 20.8.
- Moving Lighter Strike into power fixed power but sank flowing to 37.6.

**Not covered:** the masher bot isn't part of the R-INSIGHT-BAL gate, so I didn't run it.

## 4. Follow-ups for OV-B6 (Programmer)

- Copy the 12 numbers into `insights.json` and remove Wind Step from the pool. Its art and old saves are the Programmer's call; a saved run holding `wind-step` should just drop it.
- In `test/insight-budget.test.ts`:
  - Update the CAPS table to the new numbers (Press 0.4, Shield Breaker 12, Double Strike 0.3, steady-start 60, lighter-strike 7, softer-block 0.12, calm-breath 0.25).
  - Remove the wind-step row.
  - Retire the "Virtue has fewer than 2 cards" exception.
- Press the Advantage card text: "30% harder" becomes "**40%** harder" (Content Designer, one word).

## 5. Work items

| Item | Owner | Done when | Waits on |
|---|---|---|---|
| OV-B6 (updated) | Programmer | `insights.json` matches `OV-P5-data.json` (12 cards), the layer-1 CAPS test is updated, and `BALANCE=1 insight-budget` passes 7/7 with B5 mean 59.7 and B10 8.0 / 2.7 | this plan, Manager OK |
| OV-C1c | Content Designer | Press the Advantage text says 40% | this plan |

## 6. Decision needed (for the Manager)

1. **The pool goes to 12, not 13** (Wind Step dropped). I couldn't find a 13-card set that passes B1 and B5 together. Getting back to 13 would need a new effect type, which is a scope call.

## 7. Reproduce

- Sim: `OV-P5-sim/ov-p5-sim.ts` with `vitest.ov-p5.config.ts`. It uses the same bot, seeds and PE ruler as the gate, but takes the card list from a file.
- `ovp5run.sh CARDS pool|routes TAG` gives the B5 and B10 numbers in about 30 seconds.
- `ovp5pe.sh CARDS TAG ids` gives the B1 PE per card.
- `ovp5mk.py` builds candidate files.
- The final proof is the real gate run in section 3.
