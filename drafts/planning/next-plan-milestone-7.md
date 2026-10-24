# Next plan: Milestone 7 (Playtest ready), broken into small items

**For:** Jay · **Date:** 2026-10-24 · **Status:** Plan only. The Manager copies items onto the work board if you approve.

## Why milestone 7, not S1 #5

- S1 #1, #2 and #4 are built (K4, K5, K6). #3 elites are in K7, waiting on PR #10 art.
- **#5 Form-switch moments is blocked:** it needs S3 (Forms), and S3 waits on J3 (one line per kata).
- **#6 brave door is after launch** (not in core-design §13).
- **Milestone 6 is already moving** (C1 script, then K2 after you approve it). Its gate is your approval, not programmer time.
- **So the next milestone to plan is 7: Playtest ready** (`docs/MILESTONE_PROMPTS.md`). Its goal: ready to hand to 3–5 students at the dojo.

Item IDs below (P1, P2, ...) are suggestions. The Manager picks the real IDs.
"Programmer" = Dojo-Ascent Programmer (Claude Code).

## The items

| ID | Item | Owner | Waits on | Size |
| --- | --- | --- | --- | --- |
| P1 | Guided on by default for young / new players | Programmer | S5 answer (or your call) | S |
| P2 | Tutorial floor (first 10 minutes) | Programmer | P3 lines | M |
| P3 | Tutorial lines | Content Designer | nothing | S |
| P4 | Cascade of unlocks on first return home | Programmer | P2 | S–M |
| P5 | Sensei's Lessons system + Lesson Scroll | Programmer | P6 lines | M–L |
| P6 | Lesson lines for first-session systems | Content Designer | nothing | S |
| P7 | Gradual unlock schedule + Welcome Week | Programmer | P5 | M |
| P8 | Sound and music on every main screen | Programmer (+ music pick by you) | your music pick | M |
| P9 | Play-time limit setting | Programmer | nothing | S |
| P10 | Three next goals at session end | Programmer | P4 | S |
| P11 | Fix open notes in progress.md | Programmer | nothing | S |
| P12 | Playtest-readiness check | QA bot | P1–P11 | S |
| P13 | Learning and overwhelm review of P2–P7 | Learning Designer | P2–P7 drafts | S |

### P1. Guided on by default for young / new players
- **Spec:** When a profile is new (no runs yet) **and** age 6–9 **or** white belt with 0 sign-offs, start on Guided. Show one line on the Home Dojo: "You're on Guided. Change anytime in Settings." Never switch someone *off* a mode they chose. Store `difficultyChosenByPlayer: true` once they change it.
- **Why:** novices win 41% on Standard, 99% on Guided (`docs/decisions.md`).
- **Done when:** the youngest fake profile starts on Guided; switching to Standard sticks after reload; an older profile starts on Standard.

### P2. Tutorial floor (first 10 minutes, core-design §7)
- **Spec:** A short floor: bow → walk → one slow brute with a "Counter now!" prompt → Insight choice (1 of 3) → guaranteed Uncommon chest → easy tutorial boss → door home. **You can't lose:** Health can't drop below 1. Played once per profile; replay from the Lesson Scroll. One sentence per screen, max.
- **Done when:** a tester's first Perfect Counter happens in under 2 minutes from "Tap to start"; the tester can't lose even by doing nothing; the chest is always Uncommon or better.

### P3. Tutorial lines (Content Designer)
- **Spec:** Sensei's lines for each P2 step, max one sentence each, ages 6+.
- **Done when:** every P2 step has one line in a data file, each under 12 words.

### P4. Cascade of unlocks on first return home
- **Spec:** After the tutorial, play each earned thing one after another using the existing reward moments: sign-offs, Forms, stripes. Line: "You've already earned these in the dojo." A new white belt gets the Beginner's Stance and a preview of what the first sign-off unlocks.
- **Done when:** profile 2 (3 sign-offs) sees 3 unlocks plus the stripe in order; profile 1 sees the preview; nothing plays twice on a second visit.

### P5. Sensei's Lessons + Lesson Scroll (core-design §13)
- **Spec:** A lesson = 1 sentence per screen + practice in a safe room (can't fail). Data-driven (`content/lessons/`). **Never more than one new system per session** (a session = app open after 30+ minutes away). Lesson Scroll in the Home Dojo lists every lesson seen, tap to replay.
- **First-session lessons:** Move, Counter, Strike, Dash, Insights, Bow, Decorating.
- **Done when:** a test that opens 2 sessions in a row sees one new lesson each, never two; every seen lesson replays from the Scroll.

### P6. Lesson lines (Content Designer)
- **Done when:** each P5 lesson has its lines in a data file, one sentence per screen.

### P7. Gradual unlock schedule + Welcome Week
- **Spec:** A data list of systems in unlock order. Existing students get their abilities right away, but each new *system* is introduced one per session over a Welcome Week (core-design §13).
- **Done when:** the yellow-belt profile gets all abilities on day 1 but meets one new system per session; the testing screen's "+1 day" moves it forward.

### P8. Sound and music
- **Spec:** Sounds on every button, door, chest and menu; one calm music loop for the dojo and one for the Tower. Music from a royalty-free pack licensed for commercial use (`docs/framework.md`). Music and sound volume sliders, music off by default during the play-time-limit warning.
- **Done when:** a tester can name no main screen without sound; both sliders work and are remembered.
- **Your call:** pick the music pack (or let the Manager shortlist 3).

### P9. Play-time limit
- **Spec:** A parent setting: off / 15 / 30 / 45 / 60 minutes. When time is up, the game finishes the current room, then shows a kind "Great training today!" screen and goes home. No timers shown to the child in a scary way; no lost progress.
- **Done when:** with 15 minutes set (testable with a `?playlimit=1` link for 1 minute), the run ends after the current room, nothing is lost, and the message is friendly.

### P10. Three next goals at session end
- **Spec:** Before leaving, show three goals: one game goal, one collection goal, one real-world goal (from the Path card). End on that, not a menu.
- **Done when:** every profile sees exactly 3 goals, and the real-world one names a real next technique.

### P11. Fix open notes
- **Spec:** Close the open "Next" notes in `docs/progress.md` that are bugs (for example, a run in progress isn't saved if the app closes).
- **Done when:** each fixed note has a test or a screenshot in the PR.

### P12. Playtest-readiness check (QA)
- **Done when:** the QA bot plays the first 30 minutes on each fake profile on a phone-sized screen and reports: time to first Perfect Counter, any screen with more than one sentence, any way to lose the tutorial, any crash.

### P13. Learning review (Learning Designer, L4 style)
- **Done when:** a short note says pass / change for overwhelm, ethics and age 6+ reading level.

## April 2027 scope check

- Everything here **is launch scope** (Guided, first 30 minutes, Sensei's Lessons, unlock schedule, Welcome Week are in core-design §13 or milestone 7).
- **Biggest risk: P5 + P7** (lessons and unlock schedule). They touch every system. Keep lessons to the 7 first-session ones now; later systems plug in at milestone 10.
- **P8 music** needs a licensing pick from you; that can slow things if it waits.
- **Order:** P1, P9, P11 first (small, no waiting). P3/P6 lines in parallel. Then P2 → P4 → P10, then P5 → P7. P8 any time after the pick. P12 and P13 last.

## Decisions for you
1. Approve milestone 7 as the next milestone (milestone 6 continues as soon as you approve the C1 script)?
2. P1: auto-Guided for ages 6–9 **and** new white belts, or ages 6–9 only? (S5 will look at this too.)
3. P9: limit choices off / 15 / 30 / 45 / 60 minutes OK?
4. P8: pick a music pack, or ask the Manager to shortlist 3?
