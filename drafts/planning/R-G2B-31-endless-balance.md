# R-G2B-31 — Endless balance after Black Summit

## Delivery Note

| | |
|---|---|
| **ITEM** | R-G2B-31 (`drafts/planning/R-GREEN-TO-BLACK.md`; not on `docs/work-board.md`) |
| **WHAT** | Endless after Black Summit: **+3%/floor, no cap** (D4 / bestiary). When is it too hard, and what cap (if any) lets **every** tier pass? |
| **WHY** | Prior note wrongly claimed a floor-10 / floor-14 cap kept all cells inside bands. Challenge already fails by floor 1 for weak/strong. |
| **DECIDE** | **Cap Guided + Standard at floor 13 (×1.4685).** **Freeze Challenge Endless at floor-0 scale** (keep Summit ×1.5, no further +3%). Sharing the same +3% curve with Challenge needs mult **X ≤ 1.02** (or per-floor **r ≈ 1.0004**) — not a real Challenge mode. |
| **NEXT** | Jay: accept floor-13 GS cap + Challenge freeze, or drop Challenge Endless. Programmer: `scale = min(1.03^f, 1.03^13)` on Guided/Standard; Challenge uses `scale = 1.0` (Summit) ×1.5. |

**Checkout / method:** `origin/main` **`dc926cb5`**. Same formulas as `r-g2b-balance-check.py` (Black `ENEMY_TRAINING_SCALE`, Artists, bands) + Endless **H&P × 1.03^f**. No full `playRun` (scripts don’t model Endless rooms).

---

## One-line answer

**Cap Guided/Standard Endless at floor 13 (×1.47); freeze Challenge Endless at the Summit baseline — Challenge is already on the KO/band edge at floor 0 and fails by floor 1 for weak and strong.**

---

## Challenge at the Summit (plain)

| Floor | Scale | weak Challenge | typical Challenge | strong Challenge |
|---|---|---|---|---|
| **0** (Summit) | ×1.00 | **PASS** (swarm KO **12** exact min; boss beat 75) | PASS (swarm KO 15; boss 75) | **PASS** (swarm KO 16; boss beat **80** exact band top) |
| **1** | ×1.03 | **FAIL** (swarm KO **11** < 12) | PASS | **FAIL** (boss beat **82** > 80) |

**Yes — Challenge is already on the edge at floor 0.** One +3% step tips weak (swarm KO) and strong (boss sponge). Typical lasts only to floor 2 before the boss leaves 40–80 (fails at floor 3).

---

## (1) Highest Guided+Standard cap (every weak/typical/strong cell)

Search: max **F** where at scale **×1.03^F**, all 6 cells (3 skills × Guided/Standard) pass bands + KO mins on the full Black cast.

| F | Scale | Result |
|---|---|---|
| 0–12 | ×1.00–×1.43 | PASS |
| **13** | **×1.4685** | **PASS** ← max |
| 14 | ×1.5126 | FAIL — strong Guided, Lightbearer beat 81 > 80 |
| 15 | ×1.558 | FAIL — weak Standard, storm-wisp KO 11 < 12 |

**Verified max cap = floor 13** (matches the ~13 expectation). Floor 10 and 14 are **not** valid “every tier” caps.

---

## (2) Challenge up to that same floor 13

At ×1.03^13 with Challenge ×1.5: **all three skills FAIL** (swarm KO under 12).

| Lever | Solved value | Reasonable? |
|---|---|---|
| Drop Challenge mult ×1.5 → **X** (same +3% to f13) | **X ≤ 1.02** | **No** — Challenge ≈ Standard |
| Smaller Challenge per-floor rate **r** (keep ×1.5, grow to f13) | **r ≤ ≈1.0004** | **No** — growth is cosmetic |
| **Freeze Challenge at floor-0 scale** (keep ×1.5) | scale = 1.0 | **Yes** — only honest option |
| Exclude Challenge Endless | — | Also fine |

---

## Pass/fail at the proposal (all 9 cells)

**Proposal:** Guided/Standard at **floor-13 freeze (×1.4685)**; Challenge at **floor-0 scale ×1.5**. Boss beat = Lost Lightbearer hits-to-beat; swarm KO = storm-wisp hits-to-KO player.

| Skill | Diff | Scale used | Boss beat | Swarm KO | Band / KO min | Result |
|---|---|---|---|---|---|---|
| weak | Guided | ×1.4685 | 73 | 16 | boss 40–80; swarm KO≥12 | **PASS** |
| weak | Standard | ×1.4685 | 73 | 12 | same | **PASS** |
| weak | Challenge | ×1.00 (×1.5) | 75 | 12 | same | **PASS** |
| typical | Guided | ×1.4685 | 73 | 20 | same | **PASS** |
| typical | Standard | ×1.4685 | 73 | 15 | same | **PASS** |
| typical | Challenge | ×1.00 (×1.5) | 75 | 15 | same | **PASS** |
| strong | Guided | ×1.4685 | 78 | 22 | same | **PASS** |
| strong | Standard | ×1.4685 | 78 | 17 | same | **PASS** |
| strong | Challenge | ×1.00 (×1.5) | 80 | 16 | same | **PASS** |

All **9/9 PASS**. (If Challenge shared ×1.4685 with X=1.02, the three Challenge rows also PASS — but X=1.02 is not recommended.)

---

## Kids’ view

Endless = “how high can I get.” Cap growth on Guided/Steady at 13 so fights stay fair. Challenge is already Summit-hard; stacking +3% on top turns it into a wall by floor 1 — freeze it or don’t ship Challenge Endless.
