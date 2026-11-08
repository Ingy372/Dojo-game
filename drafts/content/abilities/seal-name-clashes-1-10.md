# Seal names #1-10: clashes with the real techniques (R-G2B-02)

DRAFT for the Manager and Jay. Nothing is renamed here. Every rename below is a PROPOSAL.
Written 2026-11-01 by the Content Writer.

## What was compared

- **Callout now.** The callout names in `drafts/content/abilities/technique-callouts.json` and the matching names in `content/abilities/abilities.json`. The callout line is always the real number ("Self-Defense #1!"), which is fine. The clash is in the small **subtitle** under it, which is the placeholder game name.
- **S4 name.** The proposed names in `drafts/planning/S4-self-defense-powers.md`. They are proposals, not built.
- **Real technique.** What `docs/self-defense.md` says #1-10 actually are.

## Table: every one of #1-10 clashes with its real technique

| # | Callout now (subtitle and id) | S4 proposed name | Real technique (docs/self-defense.md) | Clash |
| --- | --- | --- | --- | --- |
| 1 | Off-Balance (`off-balance`) | Off the Line | Step off the line, double punch | **Clash.** The docs say "Partly". "Off-Balance" names a status the enemy gets, not what the student does. Near-clash with S4 "Off the Line". |
| 2 | Escape Step (`escape-step`) | Other Side | Same as #1, other direction | **Name clash**, effect fits ("Yes, avoidance"). Near-clash with S4 #25 "Escape from Behind" and S4 #18 "Slide Away". |
| 3 | Sweep (`sweep`) | Spin Back Fist | Inside block, spin, back fist | **Clash.** The docs say the name is wrong: #3 is not a sweep. |
| 4 | Steady Breath (`steady-breath`) | Drive Back | Advancing combo | **Clash.** The docs say "No". **Update (J27, Nov 8):** Drive Back is retired. #4's name is OPEN and its family is Advancing (see `J27-seal-renames.md`). |
| 5 | Strong Block (`strong-block`) | Spin Elbow | Spin strike with an elbow | **Clash.** The docs say "No". The "less Block damage" effect of "Strong Block" returns at S4 #26 as "Shoulder Control", so "Strong Block" is retired. |
| 6 | Sharp Eyes (`sharp-eyes`) | Arm Wrap | Trap and combo | **Clash.** The docs say "No". |
| 7 | Create Distance (`create-distance`) | Palm Heel | A trap and one strong strike | **Clash.** The docs say "No". |
| 8 | Disarm (`disarm`) | Block and Strike | Block and strike together | **Clash.** Real disarms start at #13 (S4 "Kick the Weapon"). |
| 9 | Throw (`throw`) | High Block Strike | Block and strike together, high | **Clash.** #9 has no throw. The first real throw is #11 (S4 "Outside Reap"). |
| 10 | Follow Through (`follow-through`) | Grab and Strike | Grab the arm, back fist | **Name clash**, effect is "close". Near-clash with the Strike called "Spin Kick Finish" (`follow-up-kick`): both read as a "follow" move. |

## Near-clashes between names (callout now against callout now, or S4 against S4)

1. **"Sweep" is used twice.** The callout for #3 is "Sweep" (`sweep`), and S4 gives the name "Sweep" to #27 (a real sweep, Red belt). If #3 is not renamed first, there are two seals called Sweep with the same id.
2. **"Block and Strike" (#8), "High Block Strike" (#9), "Grab and Strike" (#10), "Low-High Strike" (#16).** Four S4 names that end in "Strike". A 6-year-old will mix them up, and one of them (#16) is also the name of an effect that Spin Kick Finish already gives.
3. **"Off-Balance" against "Off the Line".** Both are about #1. "Off-Balance" is also the status word used in other seal texts (S4 #4, #9, #10, #30, #31, #39), so it reads like a status, not a technique.
4. **"Escape Step" (#2), "Escape from Behind" (S4 #25), "Slide Away" (S4 #18), "Slide to the Wrist" (S4 #32).** Escape and Slide words repeat across four seals.
5. **"Disarm" (#8 now) against "Kick the Weapon" (#13), "Wrist Kick" (S4 #24) and "Wrist Lock" (#19).** The Disarm effect moves to #13 in S4. Until then the callout for #8 teaches a word that belongs to #13-14 and #19.
6. **"Break Free" family.** S4 #29 "Break Free", #30 "Break Free and Go", #39 "Release and Go". This is a deliberate family, but the three must stay readable as three. The word rule allows "Break" only in "Break Free".
7. **"Arm Bar" (#17) and "Arm Bar Release" (#31).** Intended as a pair. The two names share a prefix; a short callout may cut them to "Arm Bar".

## Other things to decide (not renames)

- **Spelling.** `docs/self-defense.md` writes "osotogari" (one word). S4 writes "Outside Reap (Osoto Gari)" (two words). I used the kid name "Outside Reap" only and kept the real spelling out of the kid text. Pick one spelling for any internal label.
- **"Perfect Counter" in S4.** S4 still says "Perfect Counter". Kid text says "Great Counter" (the rename was already made in abilities.json). The S4 table could be updated.
- **Effect against name.** The seal *effects* in `abilities.json` for #1-10 are moving to other numbers in S4 (for example `disarm` moves from #8 to #13, `blockReflect` from #7 to #8). When the Programmer imports S4, the ids and the callout subtitles for #1-10 must change in one step, or the callout names a power that is now at a different number.
- **Callouts for #11-20.** `technique-callouts.json` has no Orange or Green seal callouts yet. The new names fit the callout rule (3 words or fewer): Outside Reap, Reap and Finish, Kick the Weapon, Kick and Spin, Slip and Double (#11-15); Low-High Strike, Arm Bar, Slide Away, Wrist Lock, Hold and Combo (#16-20).

## Proposed renames (for a decision, not applied)

Apply the S4 name from the table to every seal #1-10, in one change. If Jay wants fewer changes, the two that matter most are **#3 "Sweep"** (docs say it is wrong, and "Sweep" is reused at #27) and **#9 "Throw"** (promises a throw before the first real throw at #11).
