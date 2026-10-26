# M7-P13 re-check: built P2–P7 vs. my review (PR #46)

## Delivery Note
- **ITEM:** M7-P13 re-check (P2 #139, P3/P6 text, P4 #145, P5 #142, P7 #149; goals #147).
- **WHAT:** Pass/change per item on overwhelm, ethics and age 6+ reading, read from `main` (content files + UI strings). Read-only; no game code touched.
- **WHY:** The first session decides if a white belt comes back. Checking the build, not the drafts.
- **DECIDE:** Manager: the first-return-home pile-up (C1) and the blue-colour nudge (C2).
- **NEXT:** Content Designer fixes the strings below; Programmer gates the goals card (C1). I re-read after, and the QA playtest (M7-P12) confirms timing on a phone.

## Verdicts
| Item | Overwhelm | Ethics | Reading 6+ | Verdict |
|---|---|---|---|---|
| P2 tutorial floor | Pass (auto Insight, no menu) | Pass (can't lose) | Change (C2, C3) | **PASS WITH CHANGES** |
| P3 tutorial lines | Pass | Pass | Change (C2, C3) | **PASS WITH CHANGES** |
| P4 unlock cascade | Change (C1) | Pass | Pass | **PASS WITH CHANGES** |
| P5 lessons + Scroll | Pass (1 per session/room) | Pass | Pass | **PASS** |
| P6 lesson lines | Pass | Pass | Change (C2, C4) | **PASS WITH CHANGES** |
| P7 Welcome Week | Pass (shares the one-a-day budget) | Pass | Pass | **PASS** |
| Goals card (#147) | Change (C1) | Pass (no counts of what's missing) | Change (C5) | **PASS WITH CHANGES** |

No guilt, timers, FOMO or tests anywhere. Every retry line is kind.

## Changes
**MUST**
- **C1. First return home stacks up.** A brand-new white belt gets the welcome line, the cascade (Beginner's Stance + preview) and then "Your next goals" with 3 goals, all in session 1. Fix: skip the goals card on session 1 (show it from session 2), or show only the real-dojo goal on session 1.
- **C2. Colour-only pointer (agreed fix S4 not landed).** `tutorial-floor.json` tutorial-brute `nudge` and `first-session-lessons.json` lesson-counter-guided `nudge`: "Take your time. Tap the blue COUNTER button!" → **"Take your time. Tap the glowing COUNTER button!"**

**SHOULD**
- **C3.** tutorial-insight `success`: "It will help you on this climb." → **"It will help you until you go home."** ("this climb" was in fix S3; matches lesson-insights.)
- **C4.** Button capitals mostly match (COUNTER/STRIKE/DASH), but check the in-game button labels say the same, and "Focus" in lesson-perfect is fine since it's session 5+.
- **C5.** Goals card real-dojo line: "Get {X} signed off to unlock …" → **"Show Sensei {X} in class to unlock …"** ("signed off" is grown-up talk). Same for "Get {X} signed off in class." → **"Show Sensei {X} in class."**
- **C6.** Celebration line "You are approved to test." is fine for older kids, but it's the only "test" word kids see; consider **"You're ready for your next belt test!"** (hopeful, not a quiz).

## Earlier fixes (PR #46)
| Fix | Status |
|---|---|
| M1 one lesson file (`first-session-lessons.json`) | **Landed** (sensei-lessons.json retired) |
| M2 tutorial Insight auto-picked, no menu; choice in session 3 | **Landed** |
| M3 guided "Tap COUNTER... now!" with fading hints | **Landed** ("almost full" moved to session 5) |
| S1 Bow once; "Welcome home" line | **Landed** |
| S2 Move once (lesson-move dropped) | **Landed** |
| S3 "foe" → "big one" | **Landed**; "this climb" **not landed** (C3) |
| S4 no colour-only pointer | **Not landed** (C2) |
| S5 same button capitals | **Landed** in lesson files |
| Run 1 = Move, Strike, "!", guided Counter | **Landed** (chest and auto Insight are rewards, not lessons) |
| One new system per session | **Landed** (P5 + P7 share the budget) |
| Closest-goal line on run summary | **Not in these PRs** (#147 is the 3-goals card; separate item) |
| Mission at session 2 / first class; streaks count up or pause | **Not built yet** (S9 work; nothing to re-check here) |
| N1 one way to move / N2 Technique Callout | Not landed (NICE, optional) |
