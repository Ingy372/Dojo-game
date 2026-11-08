# Explicit tutorial lessons: Sensei says the real-life lesson out loud (draft)

Draft for Manager review. Jay has not approved these words. This file does not change game code, content files, scripts, or the work board, and it does not add a build task.

Sources were read on `main` at `f21b58c3` (Nov 8, 2026). Where docs disagree, `docs/core-design.md` section 13 wins.

## Delivery Note

- **ITEM:** Explicit tutorial lessons (Jay, Nov 8, relayed by the Manager): tutorial pop-ups that pause play and say the real-life lesson plainly. The wording below is a proposal, not a sign-off.
- **WHAT:** 7 teaching beats. Each one has a Sensei pop-up of one sentence (8 words or fewer), a short try that cannot be failed, and an "In class" card that is also one sentence of 8 words or fewer. That is 14 reading cards. **Pacing risk:** 14 reading cards on the first floor can push back the first Perfect Counter (M7-P2 measured about 40 seconds). Each beat shows once and is saved for rereading. Read-aloud is optional and never starts by itself. Beat 2 (auto-attack) stays proposed until Jay says yes. After a card, play continues at the pace it already had. This proposal adds no slowdown.
- **WHY:** Jay wants kids to hear the lesson in words, so they don't have to work it out alone. Section 13 already asks for one sentence per screen, then practice in a safe training room where the player can't fail.
- **DECIDE (Jay, through the Manager):** the name of the reread book, whether to add the proposed auto-attack beat, how existing players get the cards, and sign-off of the exact lines. None of these is decided yet.
- **NEXT:** Jay answers section 7. The Programmer answers the technical questions in section 8. Nobody moves lines into the game until Jay signs them.

## 1. Sources read

- `docs/core-design.md` **§13** (overrides earlier sections): Sensei's Lessons are short and hands-on, "one sentence per screen, then practice in a safe training room where the player can't fail." "Never more than one new system per session." "Every lesson can be replayed anytime from the **Lesson Scroll** in the Home Dojo." Existing students meet systems one per session over a Welcome Week.
- `docs/core-design.md` **§7** (not overridden by §13): "No failure in the tutorial."
- `docs/core-design.md` **§10** (not overridden by §13): new students start "with auto-attack, a basic Counter, and the Beginner's Stance." Auto-attack is already how a new character starts. This draft does not add a new system.
- `docs/framework.md`: **Sensei's Scrolls** (plural) are a later recall activity, listed after launch. That is a different feature from the Lesson Scroll. This draft does not design it and does not rename it.
- `docs/decisions.md`:
  - G1: on a new profile, the first warning slows the game, and the guided Counter then holds still until COUNTER is tapped.
  - M7-P2: the tutorial floor is for brand-new profiles only, and tutorial worlds have minHealth 1.
  - M7-P5 / K17: lessons are shown once and listed on the Lesson Scroll. Lines with `scroll: false` stay off the Scroll. The button row is written as "Scroll".
- `docs/progress.md`:
  - K17: the Home Dojo screen is called "Sensei's Scroll". It lists lessons seen and can replay the tutorial floor.
  - K24a: tutorial tips wait for Got it, then for the player to try the move. No timers. The same note records `enemyHold` / `waveHold` in the tutorial flow. Whether every tip already freezes enemies is a Programmer question (section 8).
  - Q-PREM-TRY fix: the 11 lesson-file retry lines are "Nice work. Let's keep practicing." Tutorial-floor steps keep their own retry lines. This draft does not change either set.
  - P-MENU-e calls the screen "Sensei's Scroll".
- `docs/work-board.md` (read only, not edited): M7-P2, M7-P5, and K24a are **Done**. M7-P3 and M7-P6 are **Delivered**. M7-P2's done line includes a first Perfect Counter in about 40 seconds.
- `content/tutorial/tutorial-floor.json`: 13 steps. Its note says: "No timers: every tip waits for a Got it tap." The same 13 ids are listed as `TUTORIAL_STEPS` in `packages/sim/src/lessons.ts`. The file's note also says the brute step uses the guided Counter lines from the lessons file, not the brute step's own screen line.
- `content/tutorial/first-session-lessons.json`: the file's own note calls it the only lesson file. `scroll: false` is set on `lesson-counter-hint-2`, `lesson-counter-hint-3`, and `line-welcome-home`. `lesson-warning` has two screens ("Look! A red circle." / "It's coming!"). `lesson-strike` practice says "STRIKE the practice bag." The `tutorial-space` trigger note mentions practice bags. Whether a bag is actually in the room is a Programmer question.
- `apps/client/src/game/lessons.ts` (file contents only): `takeLesson` marks a lesson seen straight away. `noteLessonSeen`'s comment says a tutorial-floor guide lesson is saved so the Scroll lists it. Which ids are passed today is a Programmer question. `TITLES` has these 9 keys and no `tutorial-*` key: `lesson-warning`, `lesson-counter-guided`, `lesson-strike`, `lesson-dash`, `lesson-insights`, `lesson-decorating`, `lesson-perfect`, `lesson-block`, `lesson-step-out`.
- `drafts/content/tools/check-tutorial.py`: flags a tutorial line of 12 words or more. It does not enforce 8 words. This draft does not change that script.

### The book that already exists

| Name in the docs | What it is |
|---|---|
| **Lesson Scroll** (§13) | The built reread book in the Home Dojo. |
| **Sensei's Scroll** (progress K17, P-MENU-e, unlock schedule) | The same book, under the name the progress log uses. The K17 decision also says the button row includes "Scroll". |
| **"Dojo Lessons book"** | A possible name for that same book. Not approved. Not a second book. |
| **Sensei's Scrolls** (framework, plural, after launch) | A different, later feature. Out of scope. |

## 2. Required behavior vs what the docs already record

Required behavior comes from Jay's request. How the game does it today, where the files do not say, stays in section 8.

| Required (Jay) | Already recorded | Still open |
|---|---|---|
| Gameplay pauses while a card is open | Tips wait for a tap (K24a). The guided Counter holds still until COUNTER is tapped (G1). | Whether non-Counter tips already freeze enemies. A full pause on these cards if they do not. |
| One short sentence per pop-up | One sentence per screen (M7-P6). `lesson-warning` is two screens. | The 14 lines in section 4. Do not stack a new sentence on top of the old one. |
| A short try that never punishes | minHealth 1 (M7-P2). Lesson retries use "Nice work. Let's keep practicing." | Nothing new for 6 beats. Beat 2 is proposed only. This draft does not rewrite existing retry lines. |
| An "In class" tie | Not in the lesson files | The class sentence in section 4 |
| Shown once, then rereadable | `lessons.seen` and the Lesson Scroll | Show the class sentence in that same book |
| Optional read-aloud, never automatic, no timer that closes the card | Scroll replay and tap-to-continue exist. Street Smarts narration is on by default for ages 6–9 (§13). This draft does not copy that default. | A control the player may tap. It stays quiet until then. |

## 3. Flow for each beat

1. Play pauses. One Sensei sentence shows, with **Got it**. A read-aloud control is optional. The phone stays quiet until the player taps it. That tap reads the same sentence, does not close the card, and does not start the try.
2. **Try it now.** The try is a short action, not another page to read. Play continues at the pace it already had. This proposal adds no slowdown. A miss is not a fail, and the try comes again. The step keeps the retry line already in its file.
3. The step's existing success line shows. This draft does not rewrite success lines.
4. **In class:** one sentence. Play pauses again until the player taps. The card shows that sentence only (it already starts with "In class,"). It shows once and is saved in the same book.

The guided Counter's existing slowdown and hold (G1) stay as decisions.md records them. After a card, play continues at the pace it already had.

**Safety.** Every class card points to practice at the dojo with Sensei. No card says that winning, countering, or dashing in the game means a child can defend themselves. No card says that striking solves a real conflict. No card says a move keeps a child safe. No card uses guilt, a streak, a hurry, or a penalty for missing class or skipping a card. Closing a card does not take anything away.

**Meaningful practice, using actions the floor already has.**

| Beat | Short try | Already in the files |
|---|---|---|
| 1 | Bow | `waitFor` `bow` |
| 2 | Let the character's hits land | Proposed only. No new button and no new move. See section 8. |
| 3 | Watch the red circle | G1 warning |
| 4 | Tap COUNTER | G1 hold |
| 5 | Defeat the Swarmers | `waitFor` `defeatSwarmers` |
| 6 | Keep some space | `waitFor` `keepSpace` |
| 7 | DASH | `waitFor` `dash` |

Beat 4's COUNTER line is a reminder to balance offense with defense. Tapping a button is not a real block. The real technique is learned in class.

**Pacing risk of 14 reading cards.** A pop-up plus a class card on all 13 tutorial steps would be about 26 pauses. This draft keeps 7 beats: 7 Sensei sentences + 7 class sentences = **14 reading cards**. The success lines already in the files still show, and they are not part of those 14. Even 14 reading cards is a pacing risk, because beats 1 and (if Jay says yes) 2 happen before the first Perfect Counter. QA should time a fresh profile against M7-P2's about 40 seconds (EXPL-e). If Jay drops beat 2, the set is 12 reading cards.

These tutorial steps get **no** new sentence: `tutorial-walk`, `tutorial-space`, `tutorial-tip-warning`, `tutorial-tip-tough`, `tutorial-insight`, `tutorial-chest`, `tutorial-boss`, `tutorial-door`. `lesson-strike` also stays as it is. `tutorial-brute` does not get a sentence of its own. The floor note says that step uses the guided Counter lines from the lessons file. Beats 3 and 4 are those lesson ids.

This proposal does not add a new system, so it stays inside §13's rule of one new system per session. It does not reopen every existing line to the 8-word cap. The cap applies to the 14 sentences in section 4.

## 4. Proposed lines (not signed off)

Jay has not approved these sentences. They are the lines this draft asks him to sign.

| # | Beat (file id) | Sensei pop-up | Try it now (builder note, not a child sentence) | In class |
|---|---|---|---|---|
| 1 | tutorial-bow | We bow to show respect. | Bow at the door (`bow`, existing) | In class, we bow to Sensei and partners. |
| 2 | NEW auto-attack (proposed, needs Jay's yes) | Keep striking to stay in control. | Proposed: let the character's hits land. No new button, move, or event name in this draft. | In class, we strike pads with Sensei watching. |
| 3 | lesson-warning | Good martial artists watch before they move. | Watch the red circle (existing G1) | In class, we watch our partner carefully. |
| 4 | lesson-counter-guided | Good martial artists balance offense with defense. | Tap COUNTER (existing G1 hold) | In class, Sensei teaches defense alongside striking. |
| 5 | tutorial-tip-swarmers | Handle one small problem at a time. | Defeat the Swarmers (`defeatSwarmers`, existing) | In class, we learn step by step. |
| 6 | tutorial-tip-space | When it gets busy, step back calmly. | Keep space (`keepSpace`, existing) | In class, Sensei teaches us to make distance. |
| 7 | tutorial-tip-dash | When crowded, move to open space. | DASH (existing) | In class, we practice moving away from trouble. |

The seven pairs, in order:

1. We bow to show respect. / In class, we bow to Sensei and partners.
2. Keep striking to stay in control. / In class, we strike pads with Sensei watching.
3. Good martial artists watch before they move. / In class, we watch our partner carefully.
4. Good martial artists balance offense with defense. / In class, Sensei teaches defense alongside striking.
5. Handle one small problem at a time. / In class, we learn step by step.
6. When it gets busy, step back calmly. / In class, Sensei teaches us to make distance.
7. When crowded, move to open space. / In class, we practice moving away from trouble.

### Changes from the example wording (for the Manager)

- **"The best defense is a good offense, keep striking."** That example is over 8 words, and it is a hard saying for a 6-year-old. Said as a real-life lesson, it can be heard as "hitting solves a conflict." Proposed line: "Keep striking to stay in control." It keeps "keep striking," and it is about the character's hits in the game. The class card is pad work with Sensei watching. It does not say the child can control a real fight. This beat is still proposed, not approved.
- **"If all we do is strike, we take too much damage. A good martial artist…"** That example is two sentences, and the second one is unfinished. Proposed line: "Good martial artists balance offense with defense."
- No new mechanics and no new techniques are added. The auto-attack beat is the one new beat, and it stays proposed pending review. The try does not invent a practice-bag spawn. The floor notes already mention bags; section 8 asks the Programmer whether a bag is in the room.

## 5. Word and sentence check

Counted by splitting each learner sentence on spaces. A comma or a period stays on its word and does not add a word. One sentence means the line ends with a single period and contains no other `.` `!` or `?`.

| # | Pop-up words | In class words |
|---|---|---|
| 1 | 5 | 8 |
| 2 | 6 | 8 |
| 3 | 7 | 7 |
| 4 | 7 | 7 |
| 5 | 7 | 7 |
| 6 | 7 | 8 |
| 7 | 6 | 8 |

- **Learner sentences:** 14. Each is exactly one sentence.
- **Length:** every learner sentence is 8 words or fewer. The longest is 8 words.
- **Banned words:** none of the 14 sentences contains "try again", "so close", "hurry", "lose", "don't miss", "safe", "streak", or "guilt".

The "Try it now" column is a note for the builder. It is not a sentence the child reads, and it is not part of the 14.

## 6. Suggested checks after sign-off

These are not on the work board. Nobody starts them until Jay signs the lines in section 4. This draft does not add them to `docs/work-board.md`.

| Item | Owner | Done when |
|---|---|---|
| EXPL-a: lines into content | Content Designer | The signed beats use the section 4 pop-up as the one screen sentence, and the class sentence in a field the Programmer names. Wording matches section 4. Beat 2 is included only if Jay said yes. |
| EXPL-b: length check | Programmer | The tutorial check and the lessons check fail a new `screens` or class line that is over 8 words or is more than one sentence. Today's `check-tutorial.py` only flags 12 words or more. |
| EXPL-c: pause | Programmer | While a pop-up or class card is open on these beats, enemies, warnings, and timers don't move, and no damage happens (shown by a test). No card closes itself. No new slowdown is added. |
| EXPL-d: once and reread | Programmer | Each beat's cards show once. The existing book replays the pop-up, the practice the step already has, and the class sentence. Until Jay picks short titles, the Sensei sentence is the title. This draft adds no extra title lines. Read-aloud, if added, speaks only after a tap and never advances the card. |
| EXPL-e: QA | QA Tester | On a fresh profile at 667×375 and 844×390, every new card waits for a tap. Nothing is lost while reading. Report the first Perfect Counter time against M7-P2's about 40 seconds, and say how the 14 reading cards changed it. |

## 7. Questions for Jay (through the Manager)

1. **Name:** keep the built book (Lesson Scroll in §13, Sensei's Scroll in the progress log), or rename that same book "Dojo Lessons book"? I recommend one book, not a second one. The name is Jay's choice.
2. **Auto-attack:** should beat 2 be added? It stays proposed until you say yes. If you say no, the other six beats remain, and the reading cards drop from 14 to 12.
3. **Existing players:** they have already done the tutorial. Should the class sentences appear in their book, with no pop-ups during play?
4. **Sign-off:** do you approve the 14 lines in section 4? They are not approved yet.

## 8. Technical questions (Programmer / Manager, not Jay)

These are unknowns. This draft does not assert the answers.

- Does the K24a tip already freeze enemies, warnings, and damage on steps that are not the guided Counter?
- Which ids does `noteLessonSeen` record today, and which `tutorial-*` steps show in the Scroll?
- For each beat, does the new sentence replace that step's current screen, or does it come before it? `lesson-warning` currently has two screens. This draft does not ask to delete the G1 cues ("Look! A red circle." / "It's coming!" / "Tap COUNTER... now!"). How the new sentence sits next to those cues is open. Please do not stack them into a paragraph.
- Will `tutorial-tip-warning` also show the beat 3 card? This draft gives that step no new sentence, so the two should not both appear.
- Is a phone-voice control available for lesson cards? It must stay off until the player taps it. It must not use the Street Smarts default-on setting. If voice on a lesson card needs a privacy review, say so. This draft does not treat any pull request as that review.
- What does the built button read today: "Scroll", "Sensei's Scroll", or something else?
- The tutorial `waitFor` list has no auto-attack event (`bow`, `reachSpot`, `walkAround`, `counter`, `defeatSwarmers`, `defeatBrute`, `keepSpace`, `dash`, `openChest`, `defeatBoss`). If Jay approves beat 2, which existing event can mark the try done? Do not invent a new mechanic in order to answer. Are practice bags actually in the tutorial room, or only named in the floor notes and in the Strike practice line?
- Where would beat 2 sit in the 13 steps? The teaching order puts it after the bow and before the warning. That is a suggestion only.

## 9. Evidence

No studies are cited. The design rests on Jay's direction and the repo's own decisions. Any later citation must be checked against the real paper first. A citation would only support learning inside the game. It would not support a claim that game play makes a child able to defend themselves in real life.

## 10. Counts

Same whitespace split as section 5, checked against the 14 sentences in section 4. Correct these numbers if a later edit changes a line.

- Teaching beats: 7 (beat 2 proposed, not approved).
- Learner sentences: 14 (7 pairs).
- Reading cards proposed: 14. Pacing risk stands.
- Longest learner sentence: 8 words.
- Tutorial steps in the floor file: 13.
- Scroll title keys in `apps/client/src/game/lessons.ts`: 9, with no `tutorial-*` key.
- `scroll: false` entries in the lessons file: 3.
- File line count (`wc -l`): 186
