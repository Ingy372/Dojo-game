# G2B-11: learning Lock & Break Free + Brown belt Welcome Week (draft, v3)

## Delivery Note
- **ITEM:** G2B-11 (board id `R-G2B-11` in `drafts/planning/R-GREEN-TO-BLACK.md`). v2 applies Jay's Power & Progression Redesign (Oct 30) and the Manager's answers of Nov 1.
- **WHAT:** (1) Two first-encounter lessons: **Lock** (Arm Bar, Self-Defense #17, in the Lock Seal) and **Break Free** (Self-Defense #29, in the **Escape Seal**: Blocks or Dashes make space and give Dash back). Exact lines, kind handling of misses, link to class, and what happens when the seal isn't equipped (Brown has **4 Seal slots**). (3) A short **equip tip** for the seal unlock screen, so a kid learns to put a Seal in a slot. (2) A **10-item Welcome Week order** for a Brown belt. Design only: no game code, no new technique, no launch scope added.
- **WHY:** A Brown belt arrives with #1-35 and now chooses 4 Seals to carry. Section 13 of `docs/core-design.md` says systems arrive one per session so nobody is buried on day one. Lock and Break Free are new ideas, so a kid needs a calm, no-fail way to meet them.
- **DECIDE (Jay):** one taste check: do the lines in Lessons 1 and 2 and the equip tip sound right (main wording or the alternates)? Nothing else is waiting on Jay. One question for the Manager is at the end. Questions for the Programmer are in "Open for Programmer".
- **NEXT:** After Jay's taste check, the Content Designer can turn the lessons into lesson data (same keys as `first-session-lessons.json`) and the Programmer can add the order to `content/settings/unlock-schedule.json`. The Lock and Break Free lessons sit ready until after the beta (decided). **G2B-05 is not started** (it waits for the Content Designer's G2B-02).

**Decisions recorded (Jay, Nov 1).** (a) Jay teaches equipping through the equip tip below. (b) Sensei's Trial runs **only for new unlocks**, not for ranks a student already holds. (c) The Lock and Break Free lessons sit ready until after the beta.

**Answers applied (Manager, Nov 1).** (1) Break Free lives in the Escape Seal, and no state holds the player, so the lesson teaches the Escape Seal. (2) Brown has #1-35. (3) Street Smarts stays as built. (4) The Artist draws the Locked enemy and its tag. (5) Brown has 4 Seal slots. (6) Pinned, Release and Injured are post-launch. (7) Open items go to the Programmer. (8) The file stays in `drafts/learning/`. (9) `check-lessons.py` is not edited; the spec is below. The plan asked for "day-by-day", but K17 and K19 define a session as a calendar day with a run, so the order is **session by session**.

## What the docs define (and what they don't)
| Thing | Defined by the docs | Source |
|---|---|---|
| Loadout | Seals are equipped, not stacked. Nothing is active unless equipped. **4 Seal slots from Red up** (a starting proposal, the test bot confirms). 6 Seal families, so nobody equips them all. A family's first technique unlocks its Seal, and each later one ranks it up and is named on the rank. | Redesign doc, `R-GREEN-TO-BLACK.md` |
| **Lock Seal** | "Counters hold an enemy in place." #17 **Arm Bar** (Green): a Perfect Counter locks the attacker for 20 ticks. A locked enemy can't block or shield. Never a Guardian. Not built yet. | Redesign doc, `S4-self-defense-powers.md` |
| **Escape Seal** | "Blocks or dashes create space and refill Dash." Rank names include Escape Step, Slide Away, **Break Free** (#29, Red), Escape from Behind. Partly built (`dashOnBlock`, plus `breakFree`). | Redesign doc, `S4` |
| Real techniques | #17: outside block, snake the leg, set an arm bar, elbow strike ("Arm locked, then struck"). #29: the real escape from a two-hand front choke ("Choke broken"). | `docs/self-defense.md` |
| Kid-safe rule | "Break" shows only in "Break Free". No body-part or injury words. Outcomes only. | `S4`, plan rules |
| Calls to class | Callouts use the real number ("Self-Defense #17!") with a short subtitle. Locked cards say "Show Sensei {X} in class to unlock". | K22b, `S4` |
| How lessons work | One sentence per screen, a practice try that can't be lost, replay from the Lesson Scroll, never more than one new system per session. | core-design §13 |
| Never punish | "Unlocks never expire and the game never takes power away." | Redesign doc, rule 7 |
| **Not defined** | Whether elites can be locked. Whether the Locked enemy has a tag or ring (the Artist decides). How a kid makes a Block. | Open for Programmer |

## Part 1: how players learn Lock and Break Free

### Rules for the lines
- Ages 6+, about US grade 1: short words, one sentence per screen, **8 words or fewer**. Reuse game words (COUNTER, STRIKE, Dash, Block, Great Counter, "Nice work. Let's keep practicing.").
- Never: died, dead, game over, failed, fail, lost, lose, defeat, hurry, should have, try harder, don't give up. No injury or body-part words. "Break" only inside "Break Free". No timer, no score, no countdown.
- Sensei speaks. Every lesson goes on the Lesson Scroll.

### Beat plan (both lessons)
1. **Name it:** the real name first (Arm Bar, Break Free).
2. **See it:** the first time it happens in a fight, a short pop-up and the real-number callout.
3. **Do it:** one practice try in a room that can't be lost.
4. **Link to class:** one line says they learned it in class.
5. **Replay:** it stays on the Lesson Scroll.

### Lesson 1: Lock (Arm Bar, #17)
- **Id / triggerKey (proposed):** `lesson-lock` / `firstLock`. Fires the first time an **equipped** Lock Seal locks an enemy.
- **Screens (one per tap):**
  1. "Your Arm Bar can lock an enemy."
  2. "A locked enemy can't block or shield."
  3. "You learned Arm Bar in class."
- **Pop-up in the fight:** "Locked!" (callout "Self-Defense #17!", subtitle "Arm Bar").
- **Practice:** "Make a Great Counter to lock one."
- **Success:** "Locked! Now tap STRIKE."
- **Nudge** (after two quiet tries; the line is already in the game): "Take your time. Tap the glowing COUNTER button!"
- **Retry:** "Nice work. Let's keep practicing." (same as the other lessons)
- **Alts:** screen 1 "Arm Bar holds an enemy still." / screen 3 "Sensei showed you this in class."
- **Fields:** `earliestSession` 1, `ignoresSessionLimit` false, `fadingFollowUp` false, `scroll` true.
- **Art note:** the Artist draws the Locked enemy and its "Locked!" tag. This file only records the line.

### Lesson 2: Break Free (#29, Escape Seal)
- **Id / triggerKey (proposed):** `lesson-break-free` / `firstEscape`. Fires the first time an **equipped** Escape Seal makes space with a Block or a Dash.
- **Screens:**
  1. "Your Escape Seal helps you get away."
  2. "A Block or Dash makes space."
  3. "It gives your Dash back."
  4. "You learned Break Free in class."
- **Pop-up in the fight:** "Break Free!" (callout "Self-Defense #29!", subtitle "Break Free").
- **Practice:** "Block or Dash to make space."
- **Success:** "Space! Your Dash is back."
- **Nudge:** "Take your time. Try a Block or Dash."
- **Retry:** "Nice work. Let's keep practicing."
- **Alts:** screen 1 "Break Free is part of your Escape Seal." / success "You made space!"
- **Fields:** same as Lesson 1, with `scroll` true.
- **No held-player state:** nothing in the game grabs or holds the player, so the lesson never shows a hold. It teaches getting away.

### Equip tip (seal unlock screen)
Equipping is taught by this tip (decided). It sits under the Seal's name and rank on the unlock screen, as two short lines.
- **Main:**
  1. "Put this Seal in a slot."
  2. "Then it helps you in fights."
- **Alt A:** "Pick a slot for this Seal." / "You can swap it any time."
- **Alt B:** "Slots hold the Seals you use." / "Change them whenever you like."
- **Note:** the example "Put a Seal in a slot to use it." is 9 words, so I cut it to the 8-word limit.
- **No pressure:** no "must", no "need", no timer. The tip is shown **once per session**, on the first Seal unlock screen (not on every Seal in the session 1 cascade), and it never comes back as a nag. Nothing is lost if the kid ignores it. The "swap" lines also tell a Brown with 4 full slots that they can change.
- **Who:** the Content Designer places it in the unlock screen data. Jay approves the wording (taste check).

### Four Seal slots: when do the lessons fire?
Brown has 6 Seal families and 4 slots, so a Brown can never carry them all. A lesson needs its move to happen, so the move must be equipped.
| What the kid equips | What happens |
|---|---|
| Lock and Escape both equipped | Each lesson fires the first time its move happens. The order list puts Lock first, so they come in different sessions (one new thing per session). |
| Only one of the two equipped | That lesson fires when its move first happens. The other waits quietly. |
| Neither equipped | Both wait. **No message, no nudge to equip, nothing lost.** Both are on the Lesson Scroll. |
| Equips it weeks later | The lesson fires the first time the move happens, as long as no other new thing is due that session. |
- A lesson that is waiting **never blocks** the next item in the order (the same rule the engine uses to skip systems a belt hasn't opened).
- From the Scroll, the practice try should auto-equip the seal for that room. Sensei's Trial only runs for new unlocks (decided), so this is a Programmer question (item 5 below).
- Equipping is taught by the equip tip above.

### When a kid doesn't get it (kind, no punishment)
The docs define **no failure state** for Lock or Break Free, so none is added.
- **Practice room:** it can't be lost. A miss gets "Nice work. Let's keep practicing." After two quiet tries, the nudge appears. No miss counter, no timer, and the room never ends on its own.
- **In a real run:** if Lock or Escape doesn't happen, **nothing is shown**. A message like "you didn't make space" would read as a scold. The fight goes on as it does today.
- **If a crowd knocks the kid out:** the kind send-home flow from #292 applies, with no new lines.
- **Street Smarts** is unchanged and is not part of this item.

### Link to class
- Each lesson's last screen says they learned the move in class, and the callout shows the real number (#17, #29).
- A seal not yet signed off keeps the built wording: "Show Sensei Self-Defense #17 in class to unlock."
- No line says what the real technique does to a person. Those details stay in class and the technique videos.

## Part 2: Brown belt Welcome Week order

### How it works (already built, K17 and K19)
- A student joining at Brown gets **every earned ability on session 1**. Only the **explanations** are spread out.
- One new thing per session (a lesson or a system card), one shared budget. A session is a calendar day with at least one run.
- No countdown and no "you missed" message. If the kid stays away, the order **resumes at the next session**. Nothing expires.
- Each seal's card already says what it does in one sentence, so a waiting lesson never leaves it a mystery.

### The 10-item order (one per session after item 1; "built" = already in the game)
| # | New thing | Kind | Status |
|---|---|---|---|
| 1 | Tutorial floor lessons, welcome home, the unlock cascade of everything earned (#1-35 and the rest) | Session 1 only, not counted | Built (K17, K18) |
| 2 | **Sensei's Scroll** card: every lesson can be replayed | System | Built, but 3rd in today's `unlock-schedule.json`. **Moved first** (data order only) |
| 3 | Dash reminder (first time two attacks land together) | Lesson | Built (`lesson-dash`, session 2 or later) |
| 4 | Insights (first Insight choice) | Lesson | Built (`lesson-insights`, session 3 or later) |
| 5 | Decorating (first decoration) | Lesson | Built (`lesson-decorating`, session 4 or later) |
| 6 | **Street Smarts** card | System | Built, unchanged |
| 7 | **Monster Journal** card | System | Built |
| 8 | Takedown / Throw (#11, Throw Seal) | Lesson | Planned: R-G2B-05 writes it. Not started |
| 9 | **Lock** (Arm Bar, #17) | Lesson | **This draft** (ready, waits until after the beta) |
| 10 | **Break Free** (#29, Escape Seal) | Lesson | **This draft** (ready, waits until after the beta) |

Why this order: items 8-10 follow the order the student **learned them in class** (Orange #11, Green #17, Red #29), so each idea comes after the one before it. Items 2-7 are as built, with only the Scroll moved first so every later lesson can be replayed.

**Post-launch (not in Welcome Week):** Pinned (#22, Lock and Pin), Release (#31, when a lock ends) and the Injured status (#31-40). They join the order after launch, in class order, after item 10. Also not scheduled because no card or lesson is defined: Challenge mode and elites, Honor and quest stories, Virtues, Training Points and Missions (taught when first earned, §13), and Path Perks. Brown's #36-40 arrive by sign-off and the docs don't state their steps, so nothing is written for them.

### Pacing, and the twice-a-week player
Item 1 is session 1. Items 2-10 are 9 more sessions with a new thing.
| Sessions per week | Weeks for items 2-10 |
|---|---|
| 1 | 9 |
| 2 | about 4.5 |
| 3 | 3 |
| 5 | about 2 |
- At twice a week it takes about 4-5 weeks. That's slow and it's safe: everything works from session 1, and nothing is lost by waiting.
- Lessons fire when the move first happens, so some come later than their place in the list. That's fine.

### What keeps it pressure-free
- No streaks, no day counts, no "Week 1 of 3". The card wording stays "Something new in your dojo: …" (built).
- Nothing expires and nothing is rewarded for being on time. A missed week doesn't skip a lesson.
- Never two new things in one session, even after a long break.
- Everything is replayable from the Scroll. Nothing is bought or timed. No chat.
- Welcome Week never uses the weekly attendance streak aura.

### A student who earns Brown while already playing
They don't get Welcome Week (K19: existing students only). The promotion ceremony plays and Sensei signs off #31-35 one at a time. A new seal's lesson fires the first time its move happens while equipped, one per session, in the order above.

## Open for Programmer
1. **How does a kid make a Block?** Lessons say "Block" as in `lesson-block`. Please give the exact button or gesture so the lines can match it.
2. **Order when both are due:** when a lesson and a system card are both due in the same session, which one goes first? My assumption: the order table above, top to bottom.
3. **Does a held-back lesson roll over?** My assumption: a lesson held back by the one-per-session limit, or by an unequipped seal, fires at the next first chance, and never blocks the next item.
4. **Can elites be locked?** The docs say only "never a Guardian". Lines don't change, but a Locked elite needs an art and rule decision.
5. **Practice from the Scroll:** can the practice try auto-equip the seal for that room? Sensei's Trial won't do it, because it runs only for new unlocks. If it can't, the replay can't be done with an unequipped seal.
6. **Callout number:** the Escape pop-up says "Self-Defense #29!". Should the number be the rank's own technique (could be #30 or later) rather than always #29?
7. **Escape wording:** the Redesign says "blocks or dashes create space and refill Dash". Please confirm that a Dash (not only a Block) refills Dash, since my screen 3 says so.

### Spec: what `check-lessons.py` should also cover (I did not edit the script)
The script today is hardcoded to `dash-only-lesson.json`. For these lessons it should:
1. Take any lesson file as an argument, and also read lessons from `drafts/learning/*.md` if that's easy.
2. Fail any line (screens, practice, success, nudge, retry, pop-up) with more than 8 words, or more than one sentence per screen.
3. Fail banned words: died, dead, game over, failed, fail, lost, lose, defeat, hurry, should have, try harder, don't give up, only. Fail injury and body-part words (hurt, pain, blood, bone, choke, throat, eyes, nose, groin, broken).
4. Fail "break" or "broke" anywhere except inside "Break Free".
5. Fail pressure words in any lesson or unlock card: streak, expire, countdown, "days left", "missed", "last chance", "hurry".
6. Check `retry` equals "Nice work. Let's keep practicing." and that each lesson ends with a class-link screen that names the move.
7. Check each callout has the "Self-Defense #N!" form, and that the equip tip is 2 lines of 8 words or fewer with no "must" or "need".
8. Check the Welcome Week list: no repeated id, every id exists, and no two items share a session.

## Evidence
Checked by web search on Nov 1, 2026 (DOI or publisher pages). Ratings are for **this use** (kids learning game mechanics), not for the study itself.

| Claim | Source | Rating |
|---|---|---|
| Learners understand more when a lesson comes in short, learner-paced chunks than all at once. This supports one idea per session and one sentence per screen. **Limits:** lab lessons, mostly college students, not games. | Mayer, R. E., & Moreno, R. (2003). Nine ways to reduce cognitive load in multimedia learning. *Educational Psychologist, 38*(1), 43-52. https://doi.org/10.1207/s15326985ep3801_6 | MODERATE |
| Working memory is limited, so teaching should limit how much is new at once. This is the theory behind "never more than one new system per session". | Sweller, J., van Merriënboer, J. J. G., & Paas, F. G. W. C. (1998). Cognitive architecture and instructional design. *Educational Psychology Review, 10*(3), 251-296. https://doi.org/10.1023/A:1022193728205 | MODERATE (theory plus many experiments, not about games) |
| People learn more deeply when they know the **names** of the main parts first. This supports naming the move (Arm Bar, Break Free) before doing it. | Mayer, R. E. (2005). Principles for managing essential processing in multimedia learning: Segmenting, pretraining, and modality principles. In R. E. Mayer (Ed.), *The Cambridge Handbook of Multimedia Learning* (pp. 169-182). https://doi.org/10.1017/cbo9780511816819.012 | MODERATE for adults; WEAK for kids. **Please check** the chapter number (sources say 11 and 13) |
| Spreading learning across days beats packing it into one, for later recall. The best gap grows with how long the memory must last. This supports separate sessions, and it does not favour a daily schedule. **Limit:** verbal recall studies, not motor or game skills. | Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354-380. https://doi.org/10.1037/0033-2909.132.3.354 | STRONG for recall; WEAK for this use |
| In games, feeling competent and in control goes with more enjoyment and more wish to play again. This supports a practice room that can't be lost and a pace the kid controls. **Limit:** correlational, mostly adults. | Ryan, R. M., Rigby, C. S., & Przybylski, A. (2006). The motivational pull of video games: A self-determination theory approach. *Motivation and Emotion, 30*(4), 344-360. https://doi.org/10.1007/s11031-006-9051-8 | MODERATE. **Please check** the pages: one PDF header says 347-363 |
| After a setback, 10-12 year olds praised for effort kept going and enjoyed the task more than those praised for being smart. This supports effort-based lines ("Nice work. Let's keep practicing."). | Mueller, C. M., & Dweck, C. S. (1998). Praise for intelligence can undermine children's motivation and performance. *Journal of Personality and Social Psychology, 75*(1), 33-52. https://doi.org/10.1037/0022-3514.75.1.33 | STRONG for the effect; MODERATE for ages 6-9 |
| Small wording changes matter for 4-year-olds after a mistake ("You did a good job drawing" versus "You are a good drawer"). This supports describing the action, not the child. | Cimpian, A., Arce, H.-M. C., Markman, E. M., & Dweck, C. S. (2007). Subtle linguistic cues affect children's motivation. *Psychological Science, 18*(4), 314-316. https://doi.org/10.1111/j.1467-9280.2007.01896.x | MODERATE (24 children) |
| Teaching in class order, and showing nothing at all when a move doesn't fire, makes the game feel kinder. | Design reasoning only. No study | WEAK |
| About 4-5 weeks for a twice-a-week student is about right. | Arithmetic from the list only. No study | WEAK. Please test with real Brown belts (not 6-year-olds) |

## Decisions for Jay
Remaining: **a taste check** on Lessons 1 and 2 and the equip tip (main wording or the alternates).

**Decided (Nov 1):**
- Jay teaches equipping, through the equip tip on the seal unlock screen.
- Sensei's Trial runs only for new unlocks, not for ranks a student already holds.
- The Lock and Break Free lessons sit ready until after the beta.

## Questions for the Manager
1. **Slot numbers:** "4 Seal slots at Red and above" is a starting proposal that the test bot confirms. If it changes, the "what happens" table above still holds.
