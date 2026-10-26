# S3-T1 Kata cards vs the school's sheets (2026-10-24)

## Delivery Note
- ITEM: S3-T1, kata cards check (main at 2920a2a, #169)
- WHAT: Compared all 4 kata cards (content/katas/) with the school sheets (/workspace/katas/*.md) for name, step count and arrows. Rendered every card on the Abilities tab with the green-belt test profile at 667x375 and 844x390. Ran the tests.
- WHY: Kids will practice from these arrows, so they must match what the school teaches and be easy to read.
- DECIDE: (a) the 3 sheet-vs-Jay conflicts below; (b) whether to make the arrows bigger before kids see them.
- NEXT: The Programmer makes the arrows bigger and crisp (bug 1). The Manager settles the conflicts with Jay. No code was edited.

Note: there is no `jayNotes` field in content/katas/. Jay's answers are in `jayNote` (one per step) and `finishNote` in drafts/content/katas/*.json. I checked those.

## Results
| Kata | Name | Steps (card / sheet) | Arrows vs sheet | 667x375 | 844x390 | Overall |
|---|---|---|---|---|---|---|
| Basic Form 1 | PASS ("Basic Form 1" / sheet "Basic Form One") | 8 / 8 PASS | PASS (L R R L R R L R) | PASS, arrows small | FAIL, arrows look like dots | FAIL (display) |
| Basic Form 2 | PASS ("Basic Form 2" / "Basic Form Two") | 8 / 8 PASS | Matches Jay's note; sheet differs at #5 and #8 (conflict 1) | PASS, arrows small | FAIL, arrows look like dots | FAIL (display) + decide |
| Keon | PASS (Jay's spelling, same as sheet) | 9 / 9 PASS | #3 "↑" is our reading; sheet gives no direction (conflict 2) | PASS, arrows small | FAIL, arrows look like dots | FAIL (display) + decide |
| David and Goliath | PASS | 12 / 12 PASS | PASS. #10 → and #11 ← follow the sheet's own footnote (school side, not student side). See conflict 3. | PASS, the 12-step line fits on one line | FAIL, arrows look like dots | FAIL (display) |

Other checks:
- Names and step counts show correctly on every card at both sizes.
- Nothing is cut off or overlapping.
- 0 page errors.
- Tests: 298 passed, 1 skipped.

Screenshots in /workspace/qa/s3t1/:
- kata-4-green-belt-{667,844}-p*.png
- zoom-*.png, close-ups of the arrows

## Bugs (most serious first)
1. ANNOYING: At 844x390, the arrows don't read as arrows.
   - What I did: opened Home → Abilities with the green-belt profile at 844x390 and paged to the kata cards.
   - What happened: ← and → show as tiny dots or ticks next to the step numbers, e.g. "1 ·  2 ·  3 ·" (zoom-kata-4-green-belt-844-p1.png). Only ↑ and ↓ are sort of visible. The data is right (the text is "1 ← 2 → …").
   - What should have happened: clear arrows, about as big as the numbers.
2. ANNOYING: The arrows are too small for a 6-year-old at both sizes.
   - What I did: looked at the same cards at 667x375.
   - What happened: the arrows show, but they are 11px and about half the height of the digits. ← and → are thin lines that are easy to mix up (zoom-kata-4-green-belt-667-p2.png).
   - What should have happened: big, bold arrows (or arrow icons), one per step, that a 6-year-old can read at a glance.
3. SMALL: The kata cards are spread over 9–10 Abilities pages.
   - What I did: paged through Abilities.
   - What happened: each kata card sits among Form, Strike and Seal cards. A kid has to press ▶ up to 3 times to find David and Goliath.
   - What should have happened: the kata cards are easy to find, e.g. together near the top.

## Sheet vs Jay's notes (for the Manager to decide; I did not change anything)
1. Basic Form 2, #5 and #8: the sheet says "180-degree turn … end facing **L**". Jay's note says "Directions copy Basic Form 1", so the card shows **→ (R)**. A 180° turn from facing L does end facing R, so the sheet may have a typo. That is for Jay or the Manager to confirm.
2. Keon, #3: the sheet gives no direction for this step. Jay's note says "No step … Facing F is our reading", so the card shows **↑ (front)**. The same moves in Basic Form 1 #3 keep facing R after #2, which would make it **→**. Keon #4 ("end facing R") fits better with ↑ at #3. Needs Jay to confirm.
3. David and Goliath, #10 and #11: the sheet text says "Pivot to **L**" (#10) and "end facing **R**" (#11), seen from facing the rear. The sheet's own footnote says these are the school's **R** and **L**, and the card shows those (#10 →, #11 ←). This is not a conflict with a Jay note. But a kid reading the sheet sees the opposite of the card, so the Manager should confirm the card should use school sides.
