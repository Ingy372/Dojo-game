# M7-P13: Learning and overwhelm review of the M7 tutorial and lesson drafts

## Delivery Note
- **ITEM:** M7-P13 (review of the M7-P3 and M7-P6 drafts merged in PRs #37 and #39).
- **WHAT:** A step-by-step check of `drafts/content/tutorial/tutorial-floor.json`, `first-session-lessons.json` and `sensei-lessons.json` for fun, overload for a 6-year-old, reading load and ethics, with fixes ranked MUST / SHOULD / NICE.
- **WHY:** The first 10 minutes decide whether a white belt keeps playing. The team agreed run 1 teaches only Move, Strike, the "!" warning and the guided Counter, with one new lesson per room.
- **DECIDE:** Jay (through the Manager): which lesson file is the real one (fix M1), and whether the Insight pick and chest stay on the tutorial floor (fix M2).
- **NEXT:** The Content Designer applies the text fixes, the Programmer reads the one file we keep, and I re-check after.

## Overall: PASS WITH CHANGES
Ethics pass: no tests, locks, guilt, timers or pressure. Every retry line is kind, and Health never drops below 1. The writing is short and warm. The problems are mostly about **how much shows up in session 1** and **two lesson files that disagree**.

## Top findings
1. **Two lesson lists disagree.** `first-session-lessons.json` (session-based) and `sensei-lessons.json` (run-based) give different orders, triggers and wording for Move, Counter, Strike, Dash and the rest. The Programmer needs one.
2. **The tutorial floor teaches too much at once.** It has Bow, Walk, guided Counter, Insight pick, chest and boss, and then the Bow lesson plays again at home. Insights were the top overload flag in my M0-4 audit, and the team agreed to hold them until later (session 3 in `first-session-lessons.json`).
3. **The session-1 Counter line teaches Perfect timing** ("when the circle is almost full") instead of the guided "now!" from Proposal 6. That makes the first Counter harder for 6-year-olds.

## Step-by-step: tutorial floor (`tutorial-floor.json`)
| Step | Teaches | Fun? | Overload risk (age 6) | Reading load | Note |
|---|---|---|---|---|---|
| tutorial-bow | Respect, the Bow button | Calm, real dojo habit | Low | 6 words, "respect" is a known dojo word | Good. The Bow lesson then plays again at home (duplicate). |
| tutorial-walk | Moving | Yes, glowing goal | Low | 9 words, 2 choices (tap or stick) | Two ways to move in one line. Fine, but say one. |
| tutorial-brute | "!" + guided Counter | Yes, the big moment | Medium, managed by the slowdown | 6 words | Good match to Proposal 6. "blue COUNTER button" depends on color; also point at it (arrow or pulse). |
| tutorial-insight | Insights | Choice is fun | **High**: new menu, 3 cards to read | 8 words plus 3 cards of text | Against the run-1 agreement. Move to session 3 or later, or auto-pick one with no menu. |
| tutorial-chest | Chests | Very fun | Low | 7 words | Keep. Rewards are motivating, and it isn't a new skill. |
| tutorial-boss | Using Counter again | Yes | Medium | "foe" is a hard word at 6 | Say "A big one! Watch the red circles." |
| tutorial-door | Going home | Calm ending | Low | Reflection question | Good. Open question, no wrong answer (matches Proposal 2 style). |

Strike has no tutorial step. Fine if the boss fills Focus, but check that Strike's lesson can only play in a room with no other new lesson.

## Step-by-step: lessons (`first-session-lessons.json` vs `sensei-lessons.json`)
| Lesson | Session file | Run file | Review |
|---|---|---|---|
| Move | Session 1, before the floor | Run 1, room 1 | Repeats tutorial-walk. Keep one. |
| Counter | Session 1, "Tap COUNTER when the circle is almost full." | Guided: "Look! A red circle." / "Tap Counter... now!" then fading hints | **Run file is better** for age 6 (Proposal 6). Teach "almost full" later with lesson-perfect. |
| Strike | Session 1 | Run 1 | Fine. Lines match. |
| Bow | Session 1, at home | Not there | Repeats tutorial-bow. Drop or change to a "welcome home" line. |
| Dash | Session 2 | Run 2, first real need | Fine either way. "Too many circles?" is clear. |
| Insights | Session 3 | Not listed | Good timing. Conflicts with the tutorial floor showing Insights in run 1. |
| Decorating | Session 4 | Not listed | Fine. Low-pressure, creative. |
| Perfect / Block / Step-out | Sessions 5-7 | Run 2+ | Fine. "That was a Block. Good guarding!" turns an early tap into praise, great. |

Capitals: session file says COUNTER/STRIKE/DASH, run file says Counter/Strike/Dash. Pick the one that matches the button.

## Fixes
**MUST**
- M1. Keep one lesson file. Suggest: use the session file's structure (one new lesson per session, matches M7-P5/P7) with the run file's guided Counter lines and fading hints. Delete or archive the other.
- M2. Take the Insight pick off the tutorial floor, or make it automatic with one line ("Sensei gave you a gift!"). Insights get taught in session 3 as planned.
- M3. Replace session 1 Counter text with the guided lines (slowdown, pulse, "now!", hints fade over the next two "!").

**SHOULD**
- S1. Teach Bow once: keep tutorial-bow, and on first return home say "Welcome home!" instead of a second Bow lesson.
- S2. Teach Move once (tutorial-walk), and drop the separate lesson-move screen before the floor.
- S3. Replace "foe" with "big one"; replace "this climb" with "until you go home".
- S4. Don't rely on color alone: "Tap the glowing COUNTER button!"
- S5. Match button capitals in all lines.

**NICE**
- N1. Say one way to move in the first line ("Use the stick to move"); mention tapping later.
- N2. Add a Technique Callout (Proposal 1) on the first Counter so the real dojo name appears early.

## Evidence
- Cognitive load: young learners do better with fewer new things at once. Sweller, *Cognitive Load Theory* (1988 and later). **STRONG.** Cited from memory, please check.
- Segmenting and signaling (one step at a time, point at what matters): Mayer, *Multimedia Learning* (2nd ed., 2009). **STRONG** for adults, **MODERATE** for 6-year-olds. Cited from memory, please check.
- Guided practice with help that fades over time (scaffolding): Wood, Bruner & Ross (1976), "The role of tutoring in problem solving." **MODERATE** (classic, small study). Cited from memory, please check.
- Kind failure lines and reflection questions: see sources in `proposals-top5.md`, same checks apply.
