# R-T3-TUNE-3: tuning numbers for the 4 DECIDE items

Source: Tester's `drafts/qa/2026-10-26-b-t3-tune-2d.md` (bot-qa).
Method: balance-check skill. A throwaway sim (since deleted) ran `playRun` with ARTISTS.typical stats per belt: belts 1–10, all 3 settings, 40 seeds each (seeds 1000–1039).
Bots: kid = kid/novice, newer = smart/typical, careful = smart/sharp.
I simulated the multipliers by scaling ENEMY_TRAINING_SCALE Health and Power per setting. No wind-ups were shortened.

## Proposed numbers

| Setting | Enemy Health | Enemy Power | Wind-up window |
|---|---|---|---|
| Guided | ×1.0 | **×0.75** | 10 (no change) |
| Standard | ×1.0 | ×1.0 | 6 (no change) |
| Challenge | ×1.0 | ×1.0 | 4 (no change) |

Guided keeps enemy Health at ×1.0, so the R-BAL-12 hit-band minimums still hold.
This needs a new `enemyPowerScale` field on DIFFICULTY. That is a Programmer item.

## Before (today): full-run win % by belt

| Bot | Setting | b1 | b2 | b3 | b4 | b5 | b6 | b7 | b8 | b9 | b10 | All | Target | Pass |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| kid | Guided | 57 | 87 | 100 | 77 | 82 | 82 | 75 | 75 | 75 | 70 | 78 | most wins; white ≥75 | FAIL (b1 57) |
| kid | Standard | 30 | 60 | 100 | 60 | 67 | 65 | 45 | 50 | 50 | 47 | 57.5 | ≥50 overall | PASS |
| kid | Challenge | 7 | 25 | 100 | 20 | 15 | 15 | 7 | 7 | 17 | 10 | 22.5 | ~67 | FAIL (b3 too easy, the rest too hard) |
| newer | all 3 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | — | the 3 settings play the same |
| careful | all 3 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | — | the 3 settings play the same |

## After (proposed)

| Bot | Setting | b1 | b2 | b3 | b4 | b5 | b6 | b7 | b8 | b9 | b10 | All | Pass |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| kid | Guided | 90 | 95 | 100 | 95 | 95 | 95 | 95 | 95 | 95 | 95 | 95 | PASS |
| kid | Standard | 30 | 60 | 100 | 60 | 67 | 65 | 45 | 50 | 50 | 47 | 57.5 | PASS (unchanged) |
| kid | Challenge | 7 | 25 | 100 | 20 | 15 | 15 | 7 | 7 | 17 | 10 | 22.5 | FAIL (unchanged; see below) |
| newer, careful | all 3 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 100 | Guided damage taken drops |

Guided now plays differently from Standard. On belt 3, the kid loses 8.0% of Health per room on Guided against 13.5% on Standard, with 0 knockouts in room 1.

## Other candidates tried (all rejected)

| Candidate | Result |
|---|---|
| Challenge ×1.1 Health and Power | kid 14%; newer 100% |
| Challenge ×1.25 Health and Power | kid 9% overall and 0% on 9 of 10 belts; newer still 100% |
| Challenge ×1.5 Health and Power (the band limit) | kid 3.8%, with 304 room-1 knockouts; newer 97.5% |
| Standard Power ×1.1 | kid on Standard 35.5%, which breaks the ≥50% rule |
| Standard Health ×1.1 | kid 50.2%, right on the line; newer still 100% |
| Guided window 12 + Power ×0.75 | kid 97%, only 2 points better than window 10, so not needed |

## Jumps over 2x between neighbouring belts

- kid on Challenge: belt 2 → 3 goes 25 → 100 (4x), and belt 3 → 4 goes 100 → 20 (5x).
- kid on Standard: belt 1 → 2 goes 30 → 60 (2x), then belt 2 → 3 goes 60 → 100.
- On belt 3 (the Orange / great-hearth floor), the kid wins 100% on every setting. The problem is that floor, not the settings.

## Why these numbers disagree with earlier ones

- The kid's 56.5% on Standard was a full run over belts 1–10 with 20 seeds. This sim gets 57.5% with 40 seeds, which is the same result.
- The Tester measured only the belt 3 boss fight, with Orange gear. Belt 3 is the easiest floor in the game, and a boss-only win rate is always higher than a full-run one. So the 88–98% is true, but only for belt 3.
- In this sim, every bot wins the belt 3 boss 40/40. The kid loses 21% of Health in that fight on Standard and 25% on Challenge.

## The 4 DECIDE items

1. **Gear mismatch.** At belt 3, the browser uses the profile's stats (195/24/25), but the sims use ARTISTS.typical (333/46/34). Proposal: tune against the training-fed ARTISTS stats, and add an "Orange typical" fixture to the testing screen so the Tester plays the same numbers. This is a Programmer item.
2. **Standard is too easy for newer students.** No multiplier fixes this without breaking the kid's ≥50% rule: Power ×1.1 drops the kid to 35.5%. Proposal: keep Standard as it is. Newer students lose about 2% of Health per room, which suits the "most kids win" setting.
3. **Challenge is too easy.** Not met. Any Challenge multiplier up to ×1.5 crushes the kid on 9 of 10 belts and barely moves the newer student (97.5%). The easy part is the belt 3 floor. Proposal: fix the belt 3 content (its enemies or rooms) in a separate item, and leave the Challenge setting alone.
4. **Guided plays the same as Standard.** Met, with Guided enemy Power ×0.75.

## Targets not met

- Challenge wins about 2 in 3: not met by any bot with any multiplier up to ×1.5. The newer and careful bots win 95–100% on every setting, so they never come near 2 in 3.
- Standard for newer students: left unchanged on purpose.

## Limits kept

No wind-up changes. No stance, training or belt power changes. Nothing adds pressure.
