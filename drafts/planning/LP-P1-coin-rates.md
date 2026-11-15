# LP-P1: coin rates and first-stage prices for the L13 coin shop

## Delivery Note
- **ITEM:** LP-P1 (L13 prep, docs only).
- **WHAT:** How many coins a run, a Class Chest and a Star Chest pay, and the prices for the Stage 1 shelf (54 items, 22,400 coins). Checked with balance-check on today's sim: belts 1–10, Guided / Standard / Challenge, all four bots (kid, newer, careful, masher), 100 seeds per cell (12,000 runs). **0 live cells fail.** No real-money path exists or is planned.
- **WHY:** L13 needs numbers before the Programmer builds the shop (R-OVERHAUL-LAUNCH row L13: earned coins only, looks only, never paid; Jay's Q8 answer).
- **DECIDE (Manager, routine):** (1) Class Chest = 150 coins. (2) Selling gear stays out of Stage 1. (3) Stage 1 alone is bought out within about 5–6 weeks of each new belt; Stage 2 art is the fix, not a payout change (section 5). Nothing here needs Jay unless the Manager calls the Class Chest amount a taste call.
- **NEXT:** if approved, the Programmer's L13 card uses section 2 and section 6 "Done when" lines; the Content Designer's catalog uses section 3. No new Nic asks (section 7).

All numbers are tagged **[MEASURED]** (from the sim run in `LP-P1-sim/`), **[CODE]** (read from the repo), **[PROPOSED]** (my choice) or **[PLANNING]** (a pace assumption, not measured from kids).

---

## 1. What changed since R-SHOP
R-SHOP (Nov 1) set the payout on an older sim and three bots, and paid most of the gap between bots through selling gear. Since then: crafting was cut, the Class Chest (L4) and Star Chest (L2b, Jay: "yes thats a fantastic idea") were added, the masher bot exists, and combat was retuned. So I re-measured everything on today's code and **dropped selling from Stage 1** (there is still no bag size in code, so "sell when the bag is full" has nothing to trigger it, and selling is the one source kids could grind). The run payout itself is unchanged from R-SHOP.

## 2. The rates [PROPOSED]

| Source | Coins | Notes |
|---|---|---|
| Any finished run, win **or lose** | 60 | A lost run still pays. This flat base keeps every bot close together. |
| Each fight room cleared (battle or challenge) | +3 | |
| Boss room cleared | +10 | |
| Run won | +10 | |
| **Class Chest** (L4, one per real class, no end) | **150** | Fixed amount, always the same. The chest's item is L4's business. |
| **Star Chest** (L2b, one per Star after the level cap) | **100** | Plus its sure looks item. A Star = 1,100 XP (about 10 typical runs; matches R-BAL-5's "last level step ≤ 10 runs" [CODE]). |
| Tower chests inside a run | 0 coins | They keep giving gear only. One run payout rule, nothing random. |
| Selling gear | not in Stage 1 | R-SHOP's sell ladder stays on file for later. |

Rules that go with the numbers:
- Coins are never bought, never expire, never shrink. No double-coin days, no daily bonus, no streaks, no "come back" rewards.
- Every coin amount is fixed. No random coin amounts anywhere (a random amount in a chest starts to feel like a loot box).
- The Star Chest's looks item comes in a fixed order (like the class pieces, C10), not a random roll.
- Test-link runs give nothing (same as decor earning today [CODE `earning.ts`]).

## 3. Stage 1 shelf prices (unchanged from R-SHOP 3.2 / 8.1)

| Group | Price | Items | Opens at belt |
|---|---|---|---|
| Gi dyes (solid, pass the belt-colour contrast check) | 200 | 12 | 1 (6), 2 (6) |
| Fun hair dyes | 200 | 8 | 1 (4), 2 (4) |
| Dash puffs | 200 | 4 | 1 (4) |
| Wall paint (Home Dojo) | 400 | 6 | 1 (3), 2 (3) |
| Walk trails | 400 | 10 | 1 (3), 2 (2), 3 (2), 4 (1), 5 (1), 6 (1) |
| Hit pops | 800 | 8 | 2 (1), 3 (2), 4 (2), 5 (2), 6 (1) |
| Victory bursts | 800 | 6 | 2 (1), 3 (1), 4 (1), 5 (1), 6 (2) |
| **Total** | | **54** | **22,400 coins** |

Shelf by belt: belt 1 opens 20 items (5,200), belt 2 opens 17 (5,600), belts 3–6 open 5 / 4 / 4 / 4 items (3,200 / 2,800 / 2,800 / 2,800).

Every item is looks only (power 0), fixed stock, fixed price, no timers, no rotation, no "only N left", no bundles, no text, nothing that looks like a belt or rank (R-SHOP 3.1 rules stand).

## 4. Balance check

Method: the balance-check skill. Tiers = belts 1–10 × 3 difficulties × 4 bots (120 cells). Challenge is locked before belt 4 [CODE], so those 12 cells are shown for information only. Targets were written into `LP-P1-sim/lp-p1-coins.py` **before** any number was computed:
- **T1** every live cell pays at least 60 a run; highest ÷ lowest ≤ 2x; neighbouring belts ≤ 2x.
- **T2** the cheapest item (200) takes 1–3 runs of play coins alone.
- **T3** the dearest item (800) takes at most 12 runs of play coins alone.
- **T4** owning all of Stage 1 takes 12–40 weeks at the planning pace.
- **T5** Class Chests are 20–40% of a week's coins for the Standard kid (real class matters, but play still pays).
- **T6** at the level cap, Star Chests add at most 15% to a run (Stars must not become a grind).

**Play coins per run [MEASURED], mean of 100 seeds** (Standard shows win % in brackets):

| Belt | Standard: kid / newer / careful / masher | Guided: kid / newer / careful / masher | Challenge: kid / newer / careful / masher |
|---|---|---|---|
| 1 | 85 (56%) / 101 / 101 / 72 (18%) | 99 / 101 / 101 / 91 | 74* / 101* / 101* / 66* |
| 2 | 85 (59%) / 101 / 101 / 74 (25%) | 99 / 101 / 101 / 95 | 72* / 101* / 101* / 68* |
| 3 | 88 (72%) / 101 / 101 / 86 (59%) | 99 / 101 / 101 / 99 | 76* / 101* / 101* / 72* |
| 4 | 81 (45%) / 101 / 101 / 72 (18%) | 98 / 101 / 101 / 92 | 75 / 101 / 101 / 69 |
| 5 | 84 (58%) / 101 / 101 / 70 (12%) | 99 / 101 / 101 / 92 | 78 / 101 / 101 / 72 |
| 6 | 84 (58%) / 101 / 101 / 71 (13%) | 99 / 101 / 101 / 91 | 77 / 101 / 101 / 72 |
| 7 | 84 (56%) / 101 / 101 / 71 (14%) | 97 / 101 / 101 / 92 | 75 / 101 / 101 / 70 |
| 8 | 83 (51%) / 101 / 101 / 72 (17%) | 98 / 101 / 101 / 92 | 76 / 101 / 101 / 72 |
| 9 | 86 (63%) / 101 / 101 / 73 (20%) | 97 / 101 / 101 / 93 | 76 / 101 / 101 / 72 |
| 10 | 83 (50%) / 101 / 101 / 72 (16%) | 97 / 101 / 101 / 94 | 75 / 101 / 101 / 72 |

Newer and careful win 100% in every live cell, so their coins are flat at 101. `*` = locked. Every cell, with every check, is in `LP-P1-sim/table.md`.

**Results [MEASURED + PROPOSED]:**

| Check | Target | Result | Pass |
|---|---|---|---|
| T1 floor | ≥ 60 | lowest live cell 69 (Challenge, masher, belt 4) | PASS |
| T1 spread | ≤ 2x | 101 ÷ 69 = 1.46x | PASS |
| T1 neighbour belts | ≤ 2x | biggest x1.20 (Standard masher, belt 3 to 4; belt 3 is easier for the masher, 59% win vs 18%) | PASS |
| T2 first item (200) | 1–3 runs | 2.0 to 2.9 runs | PASS |
| T3 dearest item (800) | ≤ 12 runs | 7.9 to 11.6 runs | PASS |
| T4 own Stage 1 | 12–40 weeks | 20.2 to 26.3 weeks (coins alone, ignoring belt gates) | PASS |
| T5 Class share (Standard kid) | 20–40% | 30% to 32% | PASS |
| T6 Star share at cap | ≤ 15% | at most 13% (about 10 coins a run) | PASS |
| **Live cells failing** | 0 | **0** (the only FAIL row is Challenge masher belt 1, which is locked) | **PASS** |

Why the masher and kid are lowest: they win less (12–72% on Standard). The flat 60 base and "a lost run still pays" are what keep them within 1.5x of the smart bots.

**Pace check [PLANNING].** How often kids play moves everything, so test it with students. Standard kid, belt 1:

| Runs / week | Classes / week | Coins / week | From class | Weeks to own Stage 1 |
|---|---|---|---|---|
| 4 | 2 | 639 | 47% | 35 |
| 8 | 1 | 828 | 18% | 27 |
| 8 | 2 | 978 | 31% | 23 |
| 8 | 3 | 1,128 | 40% | 20 |
| 12 | 2 | 1,317 | 23% | 17 |

A kid who plays less but trains more gets a bigger share from class, which is the right way round. Full 3 × 3 grid in `table.md`.

## 5. Finding: Stage 1 alone empties fast (not a payout problem)
At about 850–1,100 coins a week, a kid buys every belt 1 item in about **5 to 6 weeks** (4.7 to 6.1), and belt 2's in about the same time after promotion. Belts are 3+ months [CODE], so with only Stage 1 a kid has nothing new to buy for most of each belt and coins pile up. Coins are never lost, so nothing bad happens; there is just less to want. Cutting the payout would make the first item take 4–6 runs and break T2, so I kept it. The fix is shelf size: R-SHOP's Stage 2 (56 still pictures, 50,400 coins, a shelf through belt 7) is already planned. **Recommendation for the Manager:** treat "Stage 1 plus part of Stage 2" as the launch target, as R-SHOP 8.1 advised, and keep Stage 1 alone as the honest fallback. This is a proposal, not new scope.

## 6. "Done when" lines for the L13 build card [PROPOSED]
1. A sim test reproduces this table within 1 coin per cell (same seeds, same bots).
2. A lost run pays at least 60 coins; a Class Chest pays exactly 150; a Star Chest pays exactly 100.
3. Coin totals never go down except by a confirmed shop purchase (two-tap confirm showing the price).
4. **No real-money path:** no in-app purchase, billing or store plugin in any `package.json`; no price in dollars or any currency symbol in shop text; no "buy coins" screen or word (word check in the test). The shop sells for coins only.
5. Shop items have power 0: the sim hash is the same with and without every Stage 1 item equipped.
6. No timers, rotation, sales or "only N left" text (word check), and no random coin amounts.

## 7. OV-P3 (NIC-ASKS) check
Nothing new for Nic. Class Chests need per-class check-ins, which are already ask A2 (per-student feed) and A4 (classesInRank) in `NIC-ASKS.md`. No coin data ever goes to DojoForge (the game reads the feed only, framework section 14).

## 8. Files
- `LP-P1-sim/lp-p1-coins-sim.ts` and `vitest.lp-p1.config.ts`: the local measuring run (not game code). From the repo root: `COINS=1 SEEDS=100 OUT=/tmp/lp-coins.json npx vitest run -c drafts/planning/LP-P1-sim/vitest.lp-p1.config.ts` (about 2 minutes).
- `LP-P1-sim/lp-p1-coins.py`: the targets, the rates and the table. `python3 drafts/planning/LP-P1-sim/lp-p1-coins.py /tmp/lp-coins.json > drafts/planning/LP-P1-sim/table.md`.
- `LP-P1-sim/table.md`: all 120 cells and the pace grid.
