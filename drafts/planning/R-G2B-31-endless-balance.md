# R-G2B-31 — Endless balance after Black Summit

## Delivery Note

| | |
|---|---|
| **ITEM** | R-G2B-31 (`drafts/planning/R-GREEN-TO-BLACK.md`; not on `docs/work-board.md`) |
| **WHAT** | Adopt this note as the Endless plan: Guided/Standard scaling stops at floor 13 (×1.4685, written as ×1.47); Challenge Endless stays at the existing Summit baseline, with no further +3% floor scaling. Floors can continue past 13; only the scale is capped. This is the Manager-requested replacement for D4's no-cap call. Manager reports Jay approved on Nov 10: “Yes, cap endless at floor 13 like the Tester suggests.” Prepared for Manager review and publication; unpublished. The active Challenge baseline is not ×1.5. |
| **WHY** | Guided and Standard stay inside every checked cell through floor 13 and fail at 14. Challenge Endless is frozen at the existing Summit baseline so it does not stack +3% per floor. A later check that used the dropped D5 ×1.5 Health and Power multiplier is historical only; it does not validate the live Challenge baseline. |
| **DECIDE** | **Manager-requested decision text (unpublished):** cap Guided + Standard at floor 13 (×1.4685). Challenge Endless stays at the existing Summit baseline, with no further +3%. D4's no-cap call is superseded in this text. Do not reassert D5's Challenge ×1.5. Manager reports Jay approved on Nov 10: “Yes, cap endless at floor 13 like the Tester suggests.” This note does not assert independently verified Jay approval. The Manager owns recording the D4 replacement. |
| **NEXT** | Prepared for Manager review and publication; unpublished. After the Manager records the D4 replacement, Programmer: `scale = min(1.03^f, 1.03^13)` on Guided/Standard; Challenge uses `scale = 1.0` at the existing Summit baseline (no further floor scaling, and no ×1.5). Leftover no-cap lines in the bestiary, work-board, core-design §12, and balance-research wait on that publication (this note does not edit them). There is no need to ask Jay again. |

**Status:** Manager reports Jay approved on Nov 10: “Yes, cap endless at floor 13 like the Tester suggests.” This is the Manager-requested replacement of D4. Prepared for Manager review and publication; unpublished. The no-cap call is no longer the active recommendation in this note. History of the original question (when does uncapped +3% get too hard, and what cap lets every checked cell pass) stays in the sections below.

**Checkout / method:** `origin/main` **`dc926cb5`**. Same formulas as `r-g2b-balance-check.py` (Black `ENEMY_TRAINING_SCALE`, Artists, bands) + Endless **H&P × 1.03^f**. No full `playRun` (scripts don’t model Endless rooms). Artist, config and enemy inputs for Guided/Standard are unchanged on current main (`1b07659f`). The Challenge rows in the tables below used that script's hardcoded `CHALLENGE = 1.5` (old D5). That is not the live Challenge baseline (see the conflict note).

**Conflict (Challenge baseline).** The current `bot-manager` board records Q-CHALLENGE as done: the hardest setting uses new attack patterns, judged in real playtests, instead of bigger numbers, and the plan merged as #363 (belt fix #369). The same board's G2B-18 Manager note (Nov 1) says the Manager dropped D5 (Challenge ×1.5), per that Oct 27 call. `drafts/planning/R-CHALLENGE-PATTERNS.md` records the same Oct 27 plan: patterns instead of bigger numbers; Guided and Standard stay exactly as they are. This note cites those Manager-recorded sources; it does not assert an independently verified Jay quote. Live runtime on this checkout, read-only: `packages/sim/src/config.ts` `DIFFICULTY.challenge.enemyPowerScale` is **1** (same as Standard); Health is not multiplied by difficulty (`world.ts` scales Health only by the belt's `ENEMY_TRAINING_SCALE`, and the Guided comment says Health never changes). Challenge instead uses a tighter window (`counterWindowTicks` 4, `fillScale` 0.8) and Challenge attack patterns. Historical D5 in `docs/decisions.md` (R-BAL-9c, 2026-10-24) still says Challenge is ×1.5 Health and Power; that conflicts with the Oct 27 record and with live values.

---

## One-line answer

**Manager reports Jay approved on Nov 10: “Yes, cap endless at floor 13 like the Tester suggests.” Cap Guided/Standard Endless growth at floor 13 (×1.47). Challenge Endless stays at the existing Summit baseline, with no further +3%. Floors can continue past 13. Prepared for Manager review and publication; unpublished. The old Challenge “already on the edge at floor 0” finding used the dropped D5 ×1.5 multiplier and is not a check of the live Challenge baseline.**

---

## Challenge at the Summit (historical check, D5 ×1.5)

The table and the “already on the edge” line below are the original check, run with the dropped D5 ×1.5 Health and Power multiplier (`r-g2b-balance-check.py` `CHALLENGE = 1.5`). They are kept as history. They are **not** a validation of the current live Challenge baseline (Power ×1, Health unscaled, patterns instead of bigger numbers). Current Challenge cells were not re-measured here, and this note does not claim that live Challenge at the Summit passes or fails those bands.


| Floor | Scale | weak Challenge | typical Challenge | strong Challenge |
|---|---|---|---|---|
| **0** (Summit) | ×1.00 | **PASS** (swarm KO **12** exact min; boss beat 75) | PASS (swarm KO 15; boss 75) | **PASS** (swarm KO 16; boss beat **80** exact band top) |
| **1** | ×1.03 | **FAIL** (swarm KO **11** < 12) | PASS | **FAIL** (boss beat **82** > 80) |

**Historical reading, under ×1.5 only:** that check put Challenge on the edge at floor 0. One +3% step tipped weak (swarm KO) and strong (boss sponge). Typical lasted only to floor 2 before the boss left 40–80 (failed at floor 3). This must not be read as a current live Challenge result.

---

## (1) Highest Guided+Standard cap (every weak/typical/strong cell)

This search uses only Guided and Standard cells. It does not use the Challenge ×1.5 multiplier, so the floor-13 cap figures below are left as the current Guided/Standard evidence. They were not re-run in this correction.

Search: max **F** where at scale **×1.03^F**, all 6 cells (3 skills × Guided/Standard) pass bands + KO mins on the full Black cast.

| F | Scale | Result |
|---|---|---|
| 0–12 | ×1.00–×1.43 | PASS |
| **13** | **×1.4685** | **PASS** ← max |
| 14 | ×1.5126 | FAIL — strong Guided, Lightbearer beat 81 > 80 |
| 15 | ×1.558 | FAIL — weak Standard, storm-wisp KO 11 < 12 |

**Verified max cap = floor 13** (matches the ~13 expectation). Floor 10 and 14 are **not** valid “every tier” caps.

---

## (2) Challenge up to that same floor 13 (historical, D5 ×1.5)

The lever table below was solved under the dropped D5 ×1.5 multiplier. It is history, not a check of live Challenge (Power ×1, Health unscaled). No new Challenge multiplier or per-floor rate is proposed here.

At ×1.03^13 with the old Challenge ×1.5: **all three skills FAIL** (swarm KO under 12).

| Lever | Solved value | Reasonable? |
|---|---|---|
| Drop Challenge mult ×1.5 → **X** (same +3% to f13) | **X ≤ 1.02** | **No** — Challenge ≈ Standard |
| Smaller Challenge per-floor rate **r** (keep ×1.5, grow to f13) | **r ≤ ≈1.0004** | **No** — growth is cosmetic |
| **Freeze Challenge at floor-0 scale** (keep the then-assumed ×1.5) | scale = 1.0 | Historical option, under ×1.5. The active rule now is: freeze at the *existing* Summit baseline, with no ×1.5 and no further +3%. |
| Exclude Challenge Endless | — | Also fine |

---

## Pass/fail at the proposal

**Active proposal:** Guided/Standard at **floor-13 freeze (×1.4685)**; Challenge at the **existing Summit baseline**, scale = 1.0, with no further +3% and no ×1.5. Floors can continue past 13; only the scale is capped.

The Guided and Standard rows below are the current evidence for that Guided/Standard cap. The Challenge rows, and the old “9/9 PASS” line, used ×1.00 times the dropped D5 ×1.5 multiplier. Those Challenge numbers are historical and are **not** a pass/fail check of the live Challenge baseline. Current Challenge was not re-measured; this note does not claim that every current Challenge tier passes.

Boss beat = Lost Lightbearer hits-to-beat; swarm KO = storm-wisp hits-to-KO player.

| Skill | Diff | Scale used | Boss beat | Swarm KO | Band / KO min | Result |
|---|---|---|---|---|---|---|
| weak | Guided | ×1.4685 | 73 | 16 | boss 40–80; swarm KO≥12 | **PASS** |
| weak | Standard | ×1.4685 | 73 | 12 | same | **PASS** |
| weak | Challenge | ×1.00 (historical D5 ×1.5) | 75 | 12 | same | historical only |
| typical | Guided | ×1.4685 | 73 | 20 | same | **PASS** |
| typical | Standard | ×1.4685 | 73 | 15 | same | **PASS** |
| typical | Challenge | ×1.00 (historical D5 ×1.5) | 75 | 15 | same | historical only |
| strong | Guided | ×1.4685 | 78 | 22 | same | **PASS** |
| strong | Standard | ×1.4685 | 78 | 17 | same | **PASS** |
| strong | Challenge | ×1.00 (historical D5 ×1.5) | 80 | 16 | same | historical only |

The six Guided/Standard cells **PASS** at ×1.4685. The three Challenge cells were a historical ×1.5 check only. (A historical aside: if Challenge had shared ×1.4685 with X=1.02, those old ×1.5 rows also passed — but X=1.02 was not recommended, and that aside is not a live-baseline result.)

---

## Kids’ view

Endless = “how high can I get.” Growth on Guided/Standard stops at 13 so fights stay fair, but floors can still go past 13. Challenge Endless stays at the existing Summit baseline (patterns, not bigger Health or Power numbers), with no further +3%.
