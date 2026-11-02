# G2B-11: learning Lock & Break Free + Brown belt Welcome Week (draft)

## Delivery Note
- **ITEM:** G2B-11 (board id `R-G2B-11` in `drafts/planning/R-GREEN-TO-BLACK.md`, PR #401, read from main at commit 91dd4bb7, which includes the Nov 1 note that S4 is the #1-15 template).
- **WHAT:** (1) The first-encounter lessons for **Lock** (Arm Bar, Self-Defense #17) and **Break Free** (Self-Defense #29), with exact short lines, kind handling of misses, and the link to class. (2) A **Welcome Week order** for a Brown belt: one new thing per session, in the order the student learned the techniques in class. Design only. No game code, no new technique, no launch scope added.
- **WHY:** A Brown belt arrives with up to 35 techniques at once. Section 13 of `docs/core-design.md` says systems arrive one per session so nobody is buried on day one. Lock and Break Free are new enemy states and new ideas (the plan says they don't exist yet), so a kid needs a calm, no-fail way to meet them.
- **DECIDE (Jay):** see "Decisions for Jay" (4). **Questions for the Manager:** see the end (9). None block writing the data, but Q1 and Q2 change the lines.
- **NEXT:** After sign-off, the Content Designer can turn the lessons into `content/tutorial/` lesson data (same keys as `first-session-lessons.json`) and the Programmer can add the order to `content/settings/unlock-schedule.json`. Both wait for the Lock and Break Free engine work (R-G2B-09 for Lock; Break Free is Batch 2). **G2B-05 is not started** (it waits for the Content Designer's G2B-02).

**Two small differences from the plan (please read).**
- The plan asks for a "day-by-day" list and a file in `drafts/planning/`. I wrote a **session-by-session** list, because `docs/decisions.md` (K17 and K19) defines a session as a calendar day with at least one run, and Welcome Week "resumes at the next session". A day-by-day list would punish a kid who plays twice a week. The file path is the one you gave me.
- The plan says a Brown belt "gets seals #1-40 on day one". `docs/curriculum.md` says Red/Black to Brown needs #31-35, and #36-40 are learned *while wearing* Brown. So a new Brown belt has **#1-35**; #36-40 arrive one at a time when Sensei signs them off (Q2).

## What the docs define (and what they don't)
| Thing | Defined by the docs | Source |
|---|---|---|
| **Lock** | Self-Defense #17, **Arm Bar** (Green, "Joint lock"). A Perfect Counter locks the attacker for 20 ticks. A locked enemy can't block or shield. Never a Guardian. | `S4-self-defense-powers.md`; plan R-G2B-09 |
| Real technique (class) | #17: outside block, snake the leg between the attacker's legs, set an arm bar, finish with an elbow strike. Result: "Arm locked, then struck." | `docs/self-defense.md` |
| **Break Free** | Self-Defense #29, **Break Free** (Red, "Choke escape"). When 2+ enemies are within 1 tile, a **Block** pushes them all back 1.5 tiles. #30 adds off-balance and a Dash refill. #39 includes it. | `S4-self-defense-powers.md` |
| Real technique (class) | #29 and #30: a two-hand choke from the front, with the escape steps in Jay's table. Result: "Choke broken." | `docs/self-defense.md` |
| Kid-safe rule | "Break" shows on screen only in "Break Free". No body-part words. Outcomes only (locked, pushed, off-balance, pinned, thrown). The game shows **Injured** only from #31-40. | `S4`, `S4c`, plan rules |
| Calls to class | Locked ability cards say "Show Sensei {X} in class to unlock". Callouts use the real number ("Self-Defense #17!") with a short subtitle. | K22b, `S4` |
| How lessons work | One sentence per screen, practice where the player can't fail, replay from the Lesson Scroll, never more than one new system per session. | core-design §13 |
| **Not defined** | Any Tower state where an enemy grabs or holds *the player*. Any "fail" for Break Free. What a Locked enemy looks like. Whether elites can be locked. How slots limit which seals are equipped at Brown. | see questions |

## Part 1: how players learn Lock and Break Free

### Rules for the lines
- Ages 6+, about US grade 1: words of 1-2 syllables, one sentence per screen, 8 words or fewer. Reuse words the game already uses (COUNTER, STRIKE, Great Counter, Block, "Nice work. Let's keep practicing.").
- Never: died, dead, game over, failed, fail, lost, lose, defeat, hurry, should have, try harder, don't give up. No injury or body-part words (hurt, pain, blood, bone, choke, throat, eyes, nose, groin). "Break" only inside "Break Free". No timer, no countdown, no score for the lesson.
- Sensei speaks. Every line can be read aloud, and every lesson goes on the Lesson Scroll.

### Beat plan (same for both lessons)
1. **Name it.** The move gets its real name first (Arm Bar, Break Free).
2. **See it.** The first time it happens in a fight, a short pop-up and the real-number callout show ("Locked!" with "Self-Defense #17!").
3. **Do it.** One practice try in a room where the player can't fail.
4. **Link to class.** One line says they learned it in class.
5. **Replay.** It's on the Lesson Scroll forever.

### Lesson 1: Lock (Arm Bar, #17)
- **Id / triggerKey (proposed):** `lesson-lock` / `firstLock`. Fires the first time a Perfect Counter with #17 locks an enemy.
- **Screens (one per tap):**
  1. "Your Arm Bar can lock an enemy."
  2. "A locked enemy can't block or shield."
  3. "You learned Arm Bar in class."
- **Pop-up in the fight:** "Locked!" (callout "Self-Defense #17!", subtitle "Arm Bar").
- **Practice:** "Make a Great Counter to lock one."
- **Success:** "Locked! Now tap STRIKE."
- **Nudge** (after two quiet tries, both lines already in the game): "Take your time. Tap the glowing COUNTER button!"
- **Retry:** "Nice work. Let's keep practicing." (copied from the other lessons)
- **Alts:** screen 1 "Arm Bar holds an enemy still." / screen 3 "Sensei showed you this in class."
- **Fields:** `earliestSession` 1, `ignoresSessionLimit` false, `fadingFollowUp` false, `scroll` true.

### Lesson 2: Break Free (#29)
- **Id / triggerKey (proposed):** `lesson-break-free` / `firstBreakFree`. Fires the first time a Block pushes 2 or more close enemies away.
- **Screens:**
  1. "When enemies crowd you, Break Free."
  2. "A Block pushes them all back."
  3. "You learned Break Free in class."
- **Pop-up in the fight:** "Break Free!" (callout "Self-Defense #29!", subtitle "Break Free").
- **Practice:** "Block when two enemies are close."
- **Success:** "Free! Now you have space."
- **Nudge:** "Take your time. Wait until both are close."
- **Retry:** "Nice work. Let's keep practicing."
- **Alts:** screen 1 "Use Break Free when enemies crowd you." / success "You made space!"
- **Fields:** `earliestSession` 1, `ignoresSessionLimit` false, `fadingFollowUp` false, `scroll` true.
- **#30 and #39:** no new lesson. Their seal cards already say the extra effects, and they are not a new idea.

### When a kid doesn't get it (kind, no punishment)
The docs define **no failure state** for either move, so I added none.
- **Practice room:** it can't be lost. A miss gets the existing line "Nice work. Let's keep practicing." After two quiet tries, the nudge appears. There's no counter of misses, no timer, and the room never ends on its own.
- **In a real run:** if Lock or Break Free doesn't fire, **nothing is shown**. There's no "you didn't break free" message, because any message would read as a scold. The fight goes on as it does today.
- **If a crowd knocks the kid out:** the kind send-home flow from #292 applies ("Sensei helps you up.", "You kept everything you found!"), with no new lines.
- **Street Smarts:** `docs/framework.md` says the Escape moment is a timing challenge, and a rough outcome is never shown. The story pauses with "Let's see what could have gone differently," and the player can try again right away. I reuse that wording and write nothing new there. Jay approves every Street Smarts script (§13), and whether it names Break Free is Q3.
- **Replay:** the Lesson Scroll replays both lessons at any time.

### Link to class
- Each lesson's last screen says they learned the move in class, and the callout shows the real number.
- The locked-card wording for a seal not yet signed off stays as built: "Show Sensei Self-Defense #17 in class to unlock."
- Nothing in the lessons says what the real technique does to a person. The real details stay in class and the technique videos (`docs/self-defense.md`).

## Part 2: Brown belt Welcome Week order

### How it works (built already, K17 and K19)
- Existing students get **every earned ability on session 1**. Only the **explanations** are spread out.
- One new thing per session (a lesson or a system card), shared budget. A session is a calendar day with at least one run.
- No countdown and no "you missed" message. If the kid stays away, the list just waits and **resumes at the next session**. Nothing expires.
- Each seal's card already says what it does in one sentence, so a lesson that comes later never leaves it a mystery.
- A lesson fires the first time its move happens in play, so a seal the kid hasn't equipped (slot rules, Q5) just waits.

### The order (one per session; "built" = already in the game)
| # | New thing | Kind | Status |
|---|---|---|---|
| 1 | Tutorial floor lessons (red circle, Counter, Strike, Bow), welcome home, the unlock cascade of everything earned | Session 1 only, not counted | Built (K17, K18) |
| 2 | **Sensei's Scroll** card: every lesson can be replayed | System | Built, but 3rd in today's file. I suggest moving it first (Decision 3) |
| 3 | Dash reminder (first time two attacks land together) | Lesson | Built (`lesson-dash`, session 2 or later) |
| 4 | Insights (first Insight choice) | Lesson | Built (`lesson-insights`, session 3 or later) |
| 5 | Decorating (first decoration) | Lesson | Built (`lesson-decorating`, session 4 or later) |
| 6 | **Street Smarts** card | System | Built |
| 7 | **Monster Journal** card | System | Built |
| 8 | Takedown / Throw (#11) | Lesson | Planned: R-G2B-05 writes it. Not mine, and not started |
| 9 | **Lock** (Arm Bar, #17) | Lesson | **This draft** |
| 10 | Pinned (#22, Lock and Pin) | Lesson | Not written. Waits for the Pinned state (Batch 2) |
| 11 | **Break Free** (#29) | Lesson | **This draft** |
| 12 | Release (#31, when a lock ends) | Lesson | Not written. Waits for `lockRelease` |
| 13 | Injured (#31-40 pop-up) | Lesson | Not written. S4c has the pop-up. The plan says Injured is after launch (Q6) |

Why this order: items 8-13 follow the order the student **learned them in class** (Orange #11, Green #17, Blue #22, Red #29, Red/Black #31). So each new idea builds on one the kid already saw. Items 2-7 stay as built, except the Scroll move.

Not scheduled because no card or lesson is defined: Challenge mode and elites (open from the 4th belt), Honor and quest stories (3rd belt), Virtues, Training Points and Missions (taught the first time they're earned, §13), and Path Perks (after launch).

### Pacing, and the twice-a-week player
| Sessions per week | Weeks to finish items 2-13 (12 things) |
|---|---|
| 1 | 12 |
| 2 | 6 |
| 3 | 4 |
| 5 | about 2.5 |

- At twice a week, Welcome Week takes about 6 weeks. It's slow, and that's safe: everything works from session 1 and nothing is lost by waiting.
- Some lessons only fire when the move happens, so they might come later than their place in the list. That's fine.
- Optional shortening (Decision 4): fold Pinned and Release into the Scroll and seal cards, with no lesson. That makes it 10 things (5 weeks at twice a week).

### What keeps it pressure-free
- No streaks, no day counts, no "Week 1 of 3" text. Players never see the words "Welcome Week" in a countdown, and the card wording stays "Something new in your dojo: …" (built).
- Nothing expires and nothing carries a reward for being on time. Skipping a week doesn't skip a lesson.
- Never two new things in one session, even after a long break.
- Everything is replayable from the Scroll. Nothing is bought or timed. No chat.
- Welcome Week doesn't touch the weekly attendance streak aura, which is a separate boost in `docs/core-design.md`.

### A student who earns Brown while already playing
They don't get Welcome Week (K19: existing students only). The promotion ceremony plays, and #31-35 arrive as Sensei signs them off. Each new idea (Release, Injured) uses the same rule: it gets its lesson the first time it happens, one per session, in the order above. Please check with the Programmer that a lesson held back by the one-per-session limit fires at the next first chance (Q7).

## Evidence
I checked these by web search on Nov 1, 2026 (DOI or publisher pages). Ratings are for **this use** (kids learning game mechanics), not for the study itself.

| Claim | Source | Rating |
|---|---|---|
| Learners understand more when a lesson comes in short, learner-paced chunks than all at once. This supports one idea per session and one sentence per screen. **Limits:** lab lessons, mostly college students, not games. | Mayer, R. E., & Moreno, R. (2003). Nine ways to reduce cognitive load in multimedia learning. *Educational Psychologist, 38*(1), 43-52. https://doi.org/10.1207/s15326985ep3801_6 | MODERATE |
| Working memory is limited, so teaching should limit how much is new at once. This is the theory behind "never more than one new system per session". | Sweller, J., van Merriënboer, J. J. G., & Paas, F. G. W. C. (1998). Cognitive architecture and instructional design. *Educational Psychology Review, 10*(3), 251-296. https://doi.org/10.1023/A:1022193728205 | MODERATE (theory plus many experiments, not about games) |
| People learn more deeply when they know the **names** of the main parts first. This supports naming the move (Arm Bar, Break Free) before doing it. | Mayer, R. E. (2005). Principles for managing essential processing in multimedia learning: Segmenting, pretraining, and modality principles. In R. E. Mayer (Ed.), *The Cambridge Handbook of Multimedia Learning* (pp. 169-182). https://doi.org/10.1017/cbo9780511816819.012 | MODERATE for adults; WEAK for kids. **Please check** the chapter number (sources say 11 and 13) |
| Spreading learning across days beats packing it into one, for later recall. The best gap grows with how long the memory must last. This supports separate sessions, and it does not favour a daily schedule. **Limit:** the studies are verbal recall, not motor or game skills. | Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354-380. https://doi.org/10.1037/0033-2909.132.3.354 | STRONG for recall; WEAK for this use |
| In games, feeling competent and in control goes with more enjoyment and more wish to play again. This supports a practice room that can't be lost and a pace the kid controls. **Limit:** correlational, mostly adults. | Ryan, R. M., Rigby, C. S., & Przybylski, A. (2006). The motivational pull of video games: A self-determination theory approach. *Motivation and Emotion, 30*(4), 344-360. https://doi.org/10.1007/s11031-006-9051-8 | MODERATE. **Please check** the pages: one PDF header says 347-363 |
| After a setback, 10-12 year olds praised for effort kept going and enjoyed the task more than those praised for being smart. This supports effort-based lines ("Nice work. Let's keep practicing."). | Mueller, C. M., & Dweck, C. S. (1998). Praise for intelligence can undermine children's motivation and performance. *Journal of Personality and Social Psychology, 75*(1), 33-52. https://doi.org/10.1037/0022-3514.75.1.33 | STRONG for the effect; MODERATE for ages 6-9 |
| Small wording changes matter for 4-year-olds after a mistake ("You did a good job drawing" versus "You are a good drawer"). This supports describing the action, not the child. | Cimpian, A., Arce, H.-M. C., Markman, E. M., & Dweck, C. S. (2007). Subtle linguistic cues affect children's motivation. *Psychological Science, 18*(4), 314-316. https://doi.org/10.1111/j.1467-9280.2007.01896.x | MODERATE (24 children) |
| Teaching in the order the student learned the moves in class, and showing nothing at all when a move doesn't fire, makes the game feel kinder. | Design reasoning only. No study | WEAK |
| About 6 weeks for a twice-a-week student is about right. | Arithmetic from the list only. No study | WEAK. Please test with real Brown belts (not 6-year-olds) |

## Decisions for Jay
1. **Approve the two lessons' lines** (Lock and Break Free), main wording or the alts.
2. **Name on screen for #29:** "Break Free" (S4, the plan and the word rules) or "Choke Escape" (the example in `docs/self-defense.md`). S4 left this open as its question 5. I used "Break Free".
3. **Teaching order:** the order you taught them in class (Throw, Lock, Pinned, Break Free, Release, Injured). Also whether the Scroll card goes first for a Brown belt (it's third today).
4. **Length:** keep Pinned and Release as their own lessons (12 things), or fold them into the Scroll and seal cards (10 things).
Not asked, but noted: the Brown steps for #36-40 are still "(not stated)", so I wrote nothing for them.

## Questions for the Manager
1. **What is Break Free in the Tower?** The docs say it is only the #29 Block that pushes crowds away. The plan says R-G2B-09 puts a "Break Free hook, switched off" in the lock code. Does that mean something more (for example, an enemy escaping the player's lock, or the player escaping being held)? No enemy holds the player in the docs. If you want one, I will write its lines and a kind miss rule.
2. **Brown has #1-35, not #1-40.** OK to plan for #1-35, with #36-40 coming in by sign-off?
3. **Street Smarts Escape:** should its options name Break Free? (`docs/framework.md` says signed-off techniques add escape options named after the real techniques.) That script is Jay's to approve.
4. **What does a Locked enemy look like?** The plan has no art for it. Who draws the "Locked!" tag and the effect? I assumed a soft ring and a text tag only.
5. **Slots at Brown.** R-PROGRESSION-BETA isn't in the repo. A lesson only fires if the seal is equipped. How many seals can a Brown belt carry?
6. **Injured:** the plan says Injured is after launch, but #31-40 are at launch. Is the Release and Injured lesson (items 12 and 13) after launch too?
7. **For the Programmer:** (a) How does a kid make a Block? My lines say "Block" as in `lesson-block`. (b) When a lesson and a system card are both due, which goes first? (c) Does a lesson held back by the one-per-session limit fire at the next chance? (d) Can elites be locked? I wrote "never a Guardian" only, as in the plan.
8. **Path and ids:** the plan names this note `drafts/planning/R-G2B-lock-and-welcome.md`. I used `drafts/learning/g2b-11-lock-breakfree-welcome-week.md` as asked. Please tell me if it should move.
9. **Word check:** I ran a script over these lines (8 words or fewer, no banned words, "break" only in Break Free) and all pass. Should `drafts/content/tools/check-lessons.py` cover these lesson files too?
