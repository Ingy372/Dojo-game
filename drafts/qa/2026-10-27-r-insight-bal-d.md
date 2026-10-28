# R-INSIGHT-BAL-d QA: Insight budget on main

## Delivery Note
- **ITEM:** R-INSIGHT-BAL-d, full Insight balance run on main @ eefcb1ec (includes #389 and #392). Checked Tue Oct 27 2026, 9:20 to 10:37 PM ET.
- **WHAT:** All seven layer-2 tests (B1+B2, B3, B4+B10, B5, B6, B7, B9) pass under `BALANCE=1`, with every table printed (7 tests passed, 3160 s). Normal suite, typecheck and build are green. The automated half of Done when is a **PASS**. The human playtest half (3 runs each of Power-only, Flowing-only and Rooted-only) was **not done**: I cannot play as a human. So the Done-when line is only partly met.
- **WHY:** Nothing broke a limit. Five lines are within 10% of a limit; Belt 4 and the Rooted per-card band are the tightest (listed below).
- **DECIDE:** Jay or the Tester must do (or waive) the 9 human playtest runs. Whether the Belt 4 and Rooted-band edges need a tune is a Manager call. Neither is a failure.
- **NEXT:** Human playtest, then close R-INSIGHT-BAL-d. R-INSIGHT-BAL-e (layer 3) still waits on Jay's kata powers.

## Head and ancestry
- `git fetch origin main` at 9:20 PM ET and again at 10:10 PM ET: origin/main = `eefcb1eca72b7846d8ca147e814c7d99635b0fca` both times. **Main did not move.**
- eefcb1ec is "Merge pull request #392 (R-INSIGHT-BAL-b)". Its first parent chain contains a1d3b05c (the #392 head), a9e5181c "Merge pull request #389 (R-INSIGHT-BAL-a)", 8e605c39 (#389 head), and f7e0e7b2 "Merge pull request #391". #389 and #392 are both in main.
- Tested in a fresh detached worktree of that SHA (`/workspace/wt-ibd`, `npm ci`).

## Done when (quoted)
Source: drafts/planning/R-INSIGHT-BAL.md section 9, row R-INSIGHT-BAL-d (owner Tester, waits on -a and -b).
> Task: Re-run the whole report on the real build: belts 1-10 x Guided, Standard, Challenge x kid, newer, careful, plus a 150-seed kid route run. Also a human playtest of 3 kid runs picking only Power cards, 3 only Flowing and 3 only Rooted.
> Done when: The B1-B10 table passes; the three playtests clear about equally often; any miss is reported with the table

Work-board entry: I found no separate work-board file mentioning R-INSIGHT-BAL-d in /workspace (only the plan table row and ib-pr.md line 17, which says "Tester (R-INSIGHT-BAL-d) can run the layer-2 command `BALANCE=1 npx vitest run test/balance/insight-budget`"). I used those two.

## Grade of each clause
| Clause | Result | Numbers |
|---|---|---|
| The B1-B10 table passes | **PASS** | B1: kid 14.1 to 24.4 (limit 12 to 26), skilled max 18.9 (26). B2: newer/careful max 18.9 (30). Every card reaches PE 12 on the kid. B3: 55 pairs, max 46.5 (50), kid min 22.0 (20). B4: per-card 19.5 / 14.9 / 15.0 / 13.5, band 11.8 to 19.7; route PE 39.1 / 44.6 / 45.0 / 40.6 (max 55). B10: held spread 9.5 (14, target 10), lean spread 5.9 (10). B5: mean 56.4 (59 +/- 6), belts 46.0 to 66.0, min 46.0 (45). B6: gap 16.2 (25). B7: ratio 1.7 (2). B9 printed only. |
| The three playtests clear about equally often | **NOT RUN** | Needs a human. Bot stand-in only (not a replacement): lean-picker win % Rooted 49.0, Flowing 43.4, Power 49.3 (spread 5.9). Route held all run: Rooted 27.5, Flowing 37.1, Power 32.3, Virtue 34.3. |
| Any miss is reported with the table | **PASS** | No misses. Full tables in the appendix. |

Other checks:
- `npm test` (packages/sim): 110 files passed, 3 skipped; 1165 tests passed, 11 skipped (layer 2 and the BALANCE-only files are skipped without the flag). Layer 1 on its own: 14 of 14 passed. Typecheck exit 0. Build exit 0.
- BALANCE-only `balance.test.ts` and `ready-stance.test.ts`: 2 of 2 passed (run at 9:21 PM ET).

## Lines within 10% of their limit
| Line | Value | Limit | Room |
|---|---|---|---|
| B5 belt 4 win, drop from old 61 | 15.0 (46.0 vs 61) | within 15 | 0.0%, at the limit |
| B5 belt 4 win, floor | 46.0 | at least 45 | 2.2% |
| B4 Rooted route per card (kid) | 19.5 | band top 19.7 (1.25 x mean 15.7) | 1.0% |
| B1 quick-hands (kid) | 24.4 | max 26 | 6.2% |
| B1 ripple-counter (kid) | 24.2 | max 26 | 6.9% |
| B3 double-strike + heavy-hands (newer) | 46.5 | max 50 | 7.0% |
| B3 double-strike + steady-start (kid) | 22.0 | floor 20 | 10.0% (right on the line) |
| B10 held spread | 9.5 | target 10 (limit 14) | 5% from target; 32% from the limit |
| B9 info only: iron-skin Challenge 31.5, quick-hands Challenge 30.1, ripple-counter Guided 29.5 | | flag at 32 | 1.6%, 5.9%, 7.8% (not a pass/fail line) |

Not flagged but near: B1 kid floor min is wind-step at 14.1 (17.5% over 12); B7 ratio 1.73 (13.5% under 2); B4 route PE max 45.0 (18% under 55); B5 belt 7 is 7.7 above its old 47 (limit 15).

## Disclosures
- The layer-2 harness only runs: kid, newer and careful on Standard for singles and pairs (B1 to B3); kid only for routes, pool, B6, B7 and B9. It does not run the full "belts 1-10 x Guided, Standard, Challenge x kid, newer, careful" grid the plan row describes. Guided and Challenge show up as B9 (single cards) and the B5 pool lines (Guided 95.3%, Challenge 30.8%, goals 90 or more, 30 +/- 10). I ran the harness as built and did not add tests.
- B5 pool is 9 cards; B1/B3/B9 list 11 cards, so calm-breath and steady-start (the Virtue ones) are in the singles and pairs but not in the random pool.
- The layer-2 run took 3160 s (about 53 min) because the normal suite, typecheck, build and the other balance files ran on the same box during it. Numbers are the same as in the #392 QA for B4, B5, B6, B7 and B10 (deterministic seeds).
- The job was interrupted once at about 10:00 PM ET. The background run survived, so I did not restart it.
- Newer-bot lines at 0.0 (iron-skin, rally) are real readings, not errors; they only matter for the caps.
- Nothing posted, sent or created outside the box.

## Clean-up
Removed `/workspace/wt-ibd` (git worktree remove, prune), the scratch logs (`/workspace/qa/ibd/`, `/workspace/qa-ibd-npmci.log`) after copying the full layer-2 output below. No vitest processes left. Other agents' worktrees were not touched.

## Appendix: full layer-2 output (`BALANCE=1 vitest run test/balance/insight-budget --silent=false`, main @ eefcb1ec)
```

 RUN  v5.0.3 /workspace/wt-ibd/packages/sim

stdout | test/balance/insight-budget.test.ts > Insight budget (R-INSIGHT-BAL layer 2) > B1 and B2: every single card

=== B1 single card, held all run, Standard ===
card or combo                    bot      PE     limit
ripple-counter                   kid      24.2   12 to 26          
ripple-counter                   newer    16.7   max 26            
ripple-counter                   careful  18.9   max 26            
iron-skin                        kid      23.2   12 to 26          
iron-skin                        newer    0.0    max 26            
iron-skin                        careful  3.6    max 26            
wind-step                        kid      14.1   12 to 26          
wind-step                        newer    1.8    max 26            
wind-step                        careful  3.5    max 26            
double-strike                    kid      15.9   12 to 26          
double-strike                    newer    12.7   max 26            
double-strike                    careful  15.6   max 26            
quick-hands                      kid      24.4   12 to 26          
quick-hands                      newer    1.4    max 26            
quick-hands                      careful  4.2    max 26            
press-the-advantage              kid      17.6   12 to 26          
press-the-advantage              newer    7.4    max 26            
press-the-advantage              careful  17.6   max 26            
shield-breaker                   kid      17.7   12 to 26          
shield-breaker                   newer    1.7    max 26            
shield-breaker                   careful  4.6    max 26            
heavy-hands                      kid      20.9   12 to 26          
heavy-hands                      newer    16.1   max 26            
heavy-hands                      careful  16.0   max 26            
rally                            kid      22.7   12 to 26          
rally                            newer    0.0    max 26            
rally                            careful  3.0    max 26            
calm-breath                      kid      15.4   12 to 26          
calm-breath                      newer    6.9    max 26            
calm-breath                      careful  8.7    max 26            
steady-start                     kid      17.2   12 to 26          
steady-start                     newer    3.1    max 26            
steady-start                     careful  8.4    max 26            

=== B2 skilled-bot single card cap ===
card or combo                    bot      PE     limit
ripple-counter                   newer    16.7   max 30            
ripple-counter                   careful  18.9   max 30            
iron-skin                        newer    0.0    max 30            
iron-skin                        careful  3.6    max 30            
wind-step                        newer    1.8    max 30            
wind-step                        careful  3.5    max 30            
double-strike                    newer    12.7   max 30            
double-strike                    careful  15.6   max 30            
quick-hands                      newer    1.4    max 30            
quick-hands                      careful  4.2    max 30            
press-the-advantage              newer    7.4    max 30            
press-the-advantage              careful  17.6   max 30            
shield-breaker                   newer    1.7    max 30            
shield-breaker                   careful  4.6    max 30            
heavy-hands                      newer    16.1   max 30            
heavy-hands                      careful  16.0   max 30            
rally                            newer    0.0    max 30            
rally                            careful  3.0    max 30            
calm-breath                      newer    6.9    max 30            
calm-breath                      careful  8.7    max 30            
steady-start                     newer    3.1    max 30            
steady-start                     careful  8.4    max 30            

stdout | test/balance/insight-budget.test.ts > Insight budget (R-INSIGHT-BAL layer 2) > B3: every pair

=== B3 pairs (55 pairs) ===
card or combo                    bot      PE     limit
iron-skin|ripple-counter         kid      38.7   20 to 50          
iron-skin|ripple-counter         newer    21.9   max 50            
iron-skin|ripple-counter         careful  21.0   max 50            
ripple-counter|wind-step         kid      30.4   20 to 50          
ripple-counter|wind-step         newer    19.7   max 50            
ripple-counter|wind-step         careful  21.4   max 50            
double-strike|ripple-counter     kid      35.9   20 to 50          
double-strike|ripple-counter     newer    34.8   max 50            
double-strike|ripple-counter     careful  27.7   max 50            
quick-hands|ripple-counter       kid      37.2   20 to 50          
quick-hands|ripple-counter       newer    21.7   max 50            
quick-hands|ripple-counter       careful  18.6   max 50            
press-the-advantage|ripple-counter kid      38.0   20 to 50          
press-the-advantage|ripple-counter newer    34.1   max 50            
press-the-advantage|ripple-counter careful  27.2   max 50            
ripple-counter|shield-breaker    kid      34.7   20 to 50          
ripple-counter|shield-breaker    newer    18.9   max 50            
ripple-counter|shield-breaker    careful  24.0   max 50            
heavy-hands|ripple-counter       kid      43.2   20 to 50          
heavy-hands|ripple-counter       newer    41.4   max 50            
heavy-hands|ripple-counter       careful  36.9   max 50            
rally|ripple-counter             kid      37.8   20 to 50          
rally|ripple-counter             newer    21.1   max 50            
rally|ripple-counter             careful  20.4   max 50            
calm-breath|ripple-counter       kid      35.1   20 to 50          
calm-breath|ripple-counter       newer    19.2   max 50            
calm-breath|ripple-counter       careful  24.2   max 50            
ripple-counter|steady-start      kid      33.5   20 to 50          
ripple-counter|steady-start      newer    20.3   max 50            
ripple-counter|steady-start      careful  25.5   max 50            
iron-skin|wind-step              kid      29.6   20 to 50          
iron-skin|wind-step              newer    3.5    max 50            
iron-skin|wind-step              careful  4.1    max 50            
double-strike|iron-skin          kid      33.2   20 to 50          
double-strike|iron-skin          newer    15.8   max 50            
double-strike|iron-skin          careful  19.2   max 50            
iron-skin|quick-hands            kid      37.5   20 to 50          
iron-skin|quick-hands            newer    2.2    max 50            
iron-skin|quick-hands            careful  5.9    max 50            
iron-skin|press-the-advantage    kid      35.4   20 to 50          
iron-skin|press-the-advantage    newer    15.7   max 50            
iron-skin|press-the-advantage    careful  19.3   max 50            
iron-skin|shield-breaker         kid      36.5   20 to 50          
iron-skin|shield-breaker         newer    4.3    max 50            
iron-skin|shield-breaker         careful  5.5    max 50            
heavy-hands|iron-skin            kid      40.3   20 to 50          
heavy-hands|iron-skin            newer    21.4   max 50            
heavy-hands|iron-skin            careful  20.7   max 50            
iron-skin|rally                  kid      37.3   20 to 50          
iron-skin|rally                  newer    0.0    max 50            
iron-skin|rally                  careful  3.4    max 50            
calm-breath|iron-skin            kid      31.9   20 to 50          
calm-breath|iron-skin            newer    10.6   max 50            
calm-breath|iron-skin            careful  8.7    max 50            
iron-skin|steady-start           kid      35.0   20 to 50          
iron-skin|steady-start           newer    4.3    max 50            
iron-skin|steady-start           careful  7.0    max 50            
double-strike|wind-step          kid      30.8   20 to 50          
double-strike|wind-step          newer    19.4   max 50            
double-strike|wind-step          careful  13.6   max 50            
quick-hands|wind-step            kid      38.0   20 to 50          
quick-hands|wind-step            newer    16.7   max 50            
quick-hands|wind-step            careful  11.5   max 50            
press-the-advantage|wind-step    kid      26.5   20 to 50          
press-the-advantage|wind-step    newer    15.8   max 50            
press-the-advantage|wind-step    careful  17.4   max 50            
shield-breaker|wind-step         kid      28.7   20 to 50          
shield-breaker|wind-step         newer    10.1   max 50            
shield-breaker|wind-step         careful  9.3    max 50            
heavy-hands|wind-step            kid      30.5   20 to 50          
heavy-hands|wind-step            newer    23.6   max 50            
heavy-hands|wind-step            careful  14.4   max 50            
rally|wind-step                  kid      28.7   20 to 50          
rally|wind-step                  newer    2.0    max 50            
rally|wind-step                  careful  3.7    max 50            
calm-breath|wind-step            kid      23.8   20 to 50          
calm-breath|wind-step            newer    7.3    max 50            
calm-breath|wind-step            careful  8.1    max 50            
steady-start|wind-step           kid      22.7   20 to 50          
steady-start|wind-step           newer    15.8   max 50            
steady-start|wind-step           careful  8.1    max 50            
double-strike|quick-hands        kid      36.6   20 to 50          
double-strike|quick-hands        newer    20.0   max 50            
double-strike|quick-hands        careful  16.1   max 50            
double-strike|press-the-advantage kid      24.9   20 to 50          
double-strike|press-the-advantage newer    25.8   max 50            
double-strike|press-the-advantage careful  25.4   max 50            
double-strike|shield-breaker     kid      27.4   20 to 50          
double-strike|shield-breaker     newer    19.2   max 50            
double-strike|shield-breaker     careful  21.6   max 50            
double-strike|heavy-hands        kid      31.9   20 to 50          
double-strike|heavy-hands        newer    46.5   max 50            
double-strike|heavy-hands        careful  28.7   max 50            
double-strike|rally              kid      37.7   20 to 50          
double-strike|rally              newer    15.7   max 50            
double-strike|rally              careful  17.1   max 50            
calm-breath|double-strike        kid      32.0   20 to 50          
calm-breath|double-strike        newer    24.7   max 50            
calm-breath|double-strike        careful  23.8   max 50            
double-strike|steady-start       kid      22.0   20 to 50          
double-strike|steady-start       newer    22.5   max 50            
double-strike|steady-start       careful  21.2   max 50            
press-the-advantage|quick-hands  kid      34.5   20 to 50          
press-the-advantage|quick-hands  newer    14.3   max 50            
press-the-advantage|quick-hands  careful  12.7   max 50            
quick-hands|shield-breaker       kid      37.4   20 to 50          
quick-hands|shield-breaker       newer    3.4    max 50            
quick-hands|shield-breaker       careful  7.2    max 50            
heavy-hands|quick-hands          kid      37.6   20 to 50          
heavy-hands|quick-hands          newer    24.1   max 50            
heavy-hands|quick-hands          careful  17.6   max 50            
quick-hands|rally                kid      37.6   20 to 50          
quick-hands|rally                newer    1.5    max 50            
quick-hands|rally                careful  6.5    max 50            
calm-breath|quick-hands          kid      32.1   20 to 50          
calm-breath|quick-hands          newer    16.8   max 50            
calm-breath|quick-hands          careful  5.0    max 50            
quick-hands|steady-start         kid      32.5   20 to 50          
quick-hands|steady-start         newer    13.2   max 50            
quick-hands|steady-start         careful  8.6    max 50            
press-the-advantage|shield-breaker kid      28.9   20 to 50          
press-the-advantage|shield-breaker newer    12.6   max 50            
press-the-advantage|shield-breaker careful  18.9   max 50            
heavy-hands|press-the-advantage  kid      36.4   20 to 50          
heavy-hands|press-the-advantage  newer    28.0   max 50            
heavy-hands|press-the-advantage  careful  27.6   max 50            
press-the-advantage|rally        kid      34.4   20 to 50          
press-the-advantage|rally        newer    8.9    max 50            
press-the-advantage|rally        careful  22.2   max 50            
calm-breath|press-the-advantage  kid      27.8   20 to 50          
calm-breath|press-the-advantage  newer    19.0   max 50            
calm-breath|press-the-advantage  careful  19.5   max 50            
press-the-advantage|steady-start kid      27.8   20 to 50          
press-the-advantage|steady-start newer    12.9   max 50            
press-the-advantage|steady-start careful  21.4   max 50            
heavy-hands|shield-breaker       kid      34.6   20 to 50          
heavy-hands|shield-breaker       newer    19.4   max 50            
heavy-hands|shield-breaker       careful  22.2   max 50            
rally|shield-breaker             kid      35.5   20 to 50          
rally|shield-breaker             newer    2.3    max 50            
rally|shield-breaker             careful  4.6    max 50            
calm-breath|shield-breaker       kid      29.8   20 to 50          
calm-breath|shield-breaker       newer    12.6   max 50            
calm-breath|shield-breaker       careful  12.9   max 50            
shield-breaker|steady-start      kid      23.3   20 to 50          
shield-breaker|steady-start      newer    10.1   max 50            
shield-breaker|steady-start      careful  3.5    max 50            
heavy-hands|rally                kid      37.1   20 to 50          
heavy-hands|rally                newer    18.0   max 50            
heavy-hands|rally                careful  20.3   max 50            
calm-breath|heavy-hands          kid      32.2   20 to 50          
calm-breath|heavy-hands          newer    22.6   max 50            
calm-breath|heavy-hands          careful  26.0   max 50            
heavy-hands|steady-start         kid      31.6   20 to 50          
heavy-hands|steady-start         newer    22.3   max 50            
heavy-hands|steady-start         careful  16.4   max 50            
calm-breath|rally                kid      35.0   20 to 50          
calm-breath|rally                newer    9.1    max 50            
calm-breath|rally                careful  8.7    max 50            
rally|steady-start               kid      31.0   20 to 50          
rally|steady-start               newer    4.2    max 50            
rally|steady-start               careful  9.8    max 50            
calm-breath|steady-start         kid      26.5   20 to 50          
calm-breath|steady-start         newer    11.0   max 50            
calm-breath|steady-start         careful  11.5   max 50            

stdout | test/balance/insight-budget.test.ts > Insight budget (R-INSIGHT-BAL layer 2) > B4 and B10: the four family routes

=== B4 route PE per card (route PE in the next table) ===
card or combo                    bot      PE     limit
rooted route (2 cards, win 27.5%) kid      19.5   11.8-19.7, route <= 55
flowing route (3 cards, win 37.1%) kid      14.9   11.8-19.7, route <= 55
power route (3 cards, win 32.3%) kid      15.0   11.8-19.7, route <= 55
virtue route (3 cards, win 34.3%) kid      13.5   11.8-19.7, route <= 55

=== B4 route PE ===
card or combo                    bot      PE     limit
rooted                           kid      39.1   max 55            
flowing                          kid      44.6   max 55            
power                            kid      45.0   max 55            
virtue                           kid      40.6   max 55            

B10 route win % (kid, Standard, 150 seeds): rooted held 27.5 / lean 49.0,  flowing held 37.1 / lean 43.4,  power held 32.3 / lean 49.3,  virtue held 34.3 / lean 47.7
B10 held spread 9.5 (limit 14, target 10)   lean-picker spread 5.9 (limit 10)

stdout | test/balance/insight-budget.test.ts > Insight budget (R-INSIGHT-BAL layer 2) > B5: random pool

=== B5 random pool (9 cards), kid, Standard, 150 seeds per belt ===
belt   1    2    3    4    5    6    7    8    9    10   
win %  58.0 58.7 66.0 46.0 55.3 53.3 54.7 54.7 60.0 57.3 
before 60   67   67   61   57   57   47   50   53   51   
mean 56.4 (limit 59 +/- 6)
B5 (info only) guided pool win 95.3%, goal >= 90
B5 (info only) challenge pool win 30.8%, goal about 30 +/- 10

stdout | test/balance/insight-budget.test.ts > Insight budget (R-INSIGHT-BAL layer 2) > B6: best-pick against worst-pick

=== B6 best-pick 57.2% against worst-pick 41.0%, kid, Standard, 60 seeds per belt: gap 16.2 (limit 25) ===

stdout | test/balance/insight-budget.test.ts > Insight budget (R-INSIGHT-BAL layer 2) > B7: neighbour jump

=== B7 kid single cards: highest quick-hands 24.4, lowest wind-step 14.1, ratio 1.7 (limit 2) ===

stdout | test/balance/insight-budget.test.ts > Insight budget (R-INSIGHT-BAL layer 2) > B9: Guided and Challenge single cards (printed only)

=== B9 (information only) guided single card ===
card or combo                    bot      PE     limit
ripple-counter                   kid      29.5   info, max 32      
iron-skin                        kid      8.0    info, max 32      
wind-step                        kid      6.9    info, max 32      
double-strike                    kid      17.0   info, max 32      
quick-hands                      kid      23.3   info, max 32      
press-the-advantage              kid      14.1   info, max 32      
shield-breaker                   kid      13.4   info, max 32      
heavy-hands                      kid      20.0   info, max 32      
rally                            kid      19.3   info, max 32      
calm-breath                      kid      11.9   info, max 32      
steady-start                     kid      14.8   info, max 32      

=== B9 (information only) challenge single card ===
card or combo                    bot      PE     limit
ripple-counter                   kid      22.5   info, max 32      
iron-skin                        kid      31.5   info, max 32      
wind-step                        kid      20.6   info, max 32      
double-strike                    kid      18.3   info, max 32      
quick-hands                      kid      30.1   info, max 32      
press-the-advantage              kid      15.7   info, max 32      
shield-breaker                   kid      24.2   info, max 32      
heavy-hands                      kid      20.0   info, max 32      
rally                            kid      27.7   info, max 32      
calm-breath                      kid      21.4   info, max 32      
steady-start                     kid      21.7   info, max 32      


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  21:21:19
   Duration  3160.41s (tests 100%)

```
