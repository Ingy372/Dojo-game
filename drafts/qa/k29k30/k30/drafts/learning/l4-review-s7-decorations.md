# L4 review: S7 decoration sources, rates and pacing (PR #67)

## Delivery Note
- **ITEM:** L4, review of S7 (`drafts/planning/S7-decoration-sources.md`, PR #67).
- **WHAT:** A learning and ethics review of S7: link to real training, reasons to come back, fun, dark patterns, overload for ages 6+, and fit with §13 and `decisions.md`.
- **WHY:** S7 changes most decoration drops from sure things to chance rolls. Chance rewards for kids need care.
- **DECIDE:** (1) Add a sure "class piece" tied to real training? (2) Replace the odds screen with a visible "next piece" meter? (3) Keep random chest rolls as a small extra rather than the main source?
- **NEXT:** The Researcher updates S7 if the Manager agrees, then the Programmer's balance player checks the numbers. After that I review S4 when its PR is up.

## Verdict: **pass with changes**

S7 is careful. Everything is earned, nothing can be bought, nothing is lost when a run is lost, and there are no timers or streaks. It has bad-luck protection, and Open House has a catch-up rule. The math problem it fixes is real: today a White belt owns every tower piece after about 5 runs. But the plan makes **random chest rolls the main way to get something new**, and **none of the in-game sources point back to real training** before milestone 12. Both are fixable without changing the scope.

## Checks
| Check | Result | Notes |
| --- | --- | --- |
| Points back to real training, with training the main power source | **Partial** | Only row 10 (real achievements, milestone 12) is tied to class. Decorations are cosmetic, so they don't take power away from training. But they also miss a cheap chance to celebrate it. |
| Pressure-free reason to come back a few times a week | **Yes, mostly** | "Something new about every 3 runs" at about 8 runs a week means new pieces 2–3 times a week. Nothing can be missed. |
| Fun | **Yes** | Themed first-clear pieces, monster trophies and medals are great: you can see them, and they mark real moments in play. |
| Loot-box feel | **Risk** | Rows 1–4 are a variable-ratio schedule. They are cosmetic and can't be bought, and the pity timer is good, but a "1 in 10" odds screen teaches kids to think in gambling terms. |
| FOMO or limited time | **OK** | Open House has catch-up, and old banners return. Keep "never 'Only 2 days left'". |
| Grind | **Watch** | Long belts: about 25–50 runs between new pieces unless D is about 0.15. Agree with the lower rate. |
| Streak punishment | **None** | Fits `decisions.md`, where streaks only count up or pause. |
| Purchases or comparing kids | **None** | Classmates visiting dojos (shared world) later could invite "who has more". See should-fix 5. |
| Overload for ages 6+ | **Risk** | 11 sources, an odds screen and duplicate rules are a lot. A 6-year-old needs one idea: "Play and train, and new things come." |
| Fit with §13 and decisions | **OK** | Elites, Challenge medals at 4th belt and later, crafting after launch, and Open House after launch all fit. No Shifted Floor. Sets are flagged as a scope risk, which is correct. |

## Fixes

### Must
1. **Add a sure piece tied to real training.** For example, after class check-in (the existing after-class blessing moment), every few classes add one "Class Piece" to a short, visible path such as a scroll for every 3 classes. This keeps training the main source of what matters and gives a reason to come back that comes from the dojo, not from chance. Don't count days in a row, and never take anything away.
2. **Make sure rewards the main source and chance the extra.** Show a "next piece" meter on the run summary that fills from first clears, Bestiary entries and class pieces. It should fit the agreed closest-goal line: "2 more monsters for a new trophy!" Random chest drops stay as a small bonus surprise. A known, effort-based path supports a sense of competence, and it avoids making the chance roll the hook.
3. **Drop the "1 in 10" odds screen for kids.** Keep the odds in data and in a parent or teacher info view. Kids see the sure path ("How to earn decorations: clear floors, fill your Monster Journal, train in class"). Showing odds is good practice for adults, but for 6-year-olds it frames chests as gambling and adds reading.

### Should
4. **Hide duplicate mechanics.** A third copy and quiet skips are fine. Never show "duplicate" in the interface.
5. **No counts or rankings on visited dojos.** When classmates visit, don't show "34/40 decorations" or "rarest" labels. Showing the owner's favorite piece is fine.
6. **Teach sources a little at a time.** White belt hears about only two sources (first floor clear and Monster Journal). Medals and elites come in with 4th belt, matching §13's one-new-thing pacing.
7. **Accept the long-belt rate (D ≈ 0.15)** and let class pieces fill the gap, so high belts aren't stuck grinding.

### Nice
8. Write a short "story" line on each themed piece ("Floor Keeper statue — you cleared Floor 1!"), so decorations work as a memory journal.
9. Let a student pick one of two colours on a sure drop. Small choices support autonomy at no extra art cost.

## Evidence
| Claim | Source | Rating |
| --- | --- | --- |
| Expected, tangible rewards that depend on doing a task can reduce intrinsic motivation; unexpected rewards and verbal praise don't. | Deci, Koestner & Ryan (1999), *Psychological Bulletin* 125(6), meta-analysis of 128 studies. **Cited from memory, please check.** | STRONG |
| Overjustification: kids rewarded for drawing later drew less on their own. | Lepper, Greene & Nisbett (1973), *JPSP* 28(1). **Cited from memory, please check.** | MODERATE (a single classic study) |
| Competence, autonomy and relatedness drive lasting game motivation. | Ryan, Rigby & Przybylski (2006), *Motivation and Emotion* 30. **Cited from memory, please check.** | MODERATE |
| Chance-based reward features in games (loot boxes) are linked to problem gambling, and young people are a concern. | Zendle & Cairns (2018), *PLoS ONE*. Also the UK House of Lords Gambling Harm report (2020). **Cited from memory, please check.** | MODERATE (correlational; our case is cosmetic, can't be bought and has no paid currency, so the risk is lower) |
| Visible progress toward a goal increases effort near the end (goal-gradient). | Kivetz, Urminsky & Zheng (2006), *JMR* 43. **Cited from memory, please check.** | MODERATE |

Why this matters here: decorations are a mild reward, so the overjustification risk is small, which is why the verdict is not rework. The concern is that chance rolls become the hook. Making the effort-based sure path the main source keeps it fair.

## Questions (for the Manager)
1. Should real class check-in give a sure decoration path (must-fix 1)? It touches the after-class blessing flow.
2. Should the odds go in a parent or teacher view instead of the kids' Dojo screen?
