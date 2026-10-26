# L5 (new): P1 difficulty and play-time review

## Delivery Note
- **ITEM:** L5 (new), a review of M7-P1 (PR #108, difficulty and Settings) and M7-P9 (PR #110, play-time limit). It's a new item, not the creed L5 that merged in PR #32.
- **WHAT:** I checked the strings, UI copy and logic in both diffs for pressure, guilt, labels, nagging, reversibility, who controls what, the stop experience and reading load.
- **WHY:** A 6-year-old can easily feel that an easier mode makes them "the baby one", and a stop that feels like a punishment teaches kids to resent the game. Both have to feel kind.
- **DECIDE:** (1) Is "after 2 losses, kindly offer Steady" (from the Manager's brief) in scope for P1? It isn't in #108. (2) Should the session reset after a 30-minute break, as built, or once a day, as the brief says? (3) If time is already up, should a new run start at all?
- **NEXT:** The Programmer applies the must fixes. The Content Designer reviews the copy rewrites. I re-check once they land.

## Verdicts
| PR | Verdict |
| --- | --- |
| #108 P1 difficulty | **Pass with changes.** The kid controls it, it can always be undone, and the game never overrides a choice. Two copy problems give Guided a stigma, and one brief item is missing. |
| #110 P9 play-time limit | **Pass with changes.** It's warm, never cuts off mid-fight, loses nothing, and shows no countdown. The reset rule doesn't match the brief, and the stop doesn't point kids back to class or rest. |

## PR #108: findings
**Good:** The kid chooses, and `difficultyChosenByPlayer` means the game never switches them back. "You can change this any time" is on the choice screen. There's no difficulty reward or penalty in the diff. The names Guided / Steady / Challenge are all neutral words.

### MUST
1. **"The normal way to train."** (Steady card). This makes Guided "not normal" by implication, so a kid on Guided can feel labeled.
   Rewrite: **"Steady timing. A good middle."** or **"The usual pace."**
2. **Home line shown on every visit:** "You're on Guided. Change anytime in Settings." It's a permanent tag on the kid's home screen and, after a while, a nudge to leave Guided. Show it **once** (first Home visit), or not at all.
   Rewrite if kept: **"Training on Guided. Your choice in Settings."**
### SHOULD
3. **"After 2 losses, Steady is offered kindly" isn't built.** The brief describes it, but the diff has no loss trigger. If it's added: offer only **Guided** (the easier mode), at most **once per day**, with no wording about losing. For example, Sensei says **"Want more time to counter? You can try Guided."** with the buttons [Try it] [No thanks]. "No thanks" never brings it back that day. Never auto-switch.
4. **Guided card:** "More time to counter. Great for learning the moves." This one is fine. Optional: **"More time to counter. Great for learning."**
5. **Challenge card:** "Enemies wind up faster. Less time to counter." This is fine. There's no bragging copy and no extra rewards, so keep it that way. Rewards must not be bigger on Challenge, or Guided becomes "lesser".
### NICE
6. Add one 6–9 age-band fixture (the Programmer's question a). That's a QA item, not mine to decide.

## PR #110: findings
**Good:** A grown-up controls it, and it's off by default. A press-and-hold gate keeps kids out. The stop comes at a room boundary, never mid-fight. `finishRun` keeps every item. The child never sees a timer. Every string is warm. A `rested` result is shown in gold, like a clear, not like a loss.

### MUST
1. **The reset doesn't match the brief.** It's built as "a 30-minute break starts a new session", but the brief says daily. With a 30-minute break, a 15-minute limit allows play, wait 30, play again, all day, so the limit doesn't do what parents expect. Recommend a **daily total** (resets at local midnight), or make it a grown-up choice: "per day" or "per sitting". Neither has anything streak-like for the kid, because the kid never sees the reset.
2. **If time is already up, don't start a new run.** As built, the kid starts a run, plays one room, and is stopped again. Being stopped repeatedly feels like nagging. Instead, the Tower door shows **"Your dojo is resting for today. See you next time!"**, and the dojo itself stays open (looking at gear, the Creed Wall).
### SHOULD
3. **Point kids to real training and rest.** "You trained hard today." is a little generic. Rewrite restLines[0] as **"Great job! Now rest, and bring your best to class."** Keep "Everything you found is safe in your dojo."
4. **"Nice work! Let's finish this room, then rest."** This is good. It runs 2.2 s with no repeat, so make sure the 2 s check fires it only once (the `wrapUp` guard looks right).
5. **No "come back tomorrow" wording** anywhere. It's absent now, so keep it that way. The rest card shouldn't mention a time to return.
### NICE
6. **Grown-up help text** is clear. Add "Your child won't see a timer." to reassure parents.
7. Press-and-hold is enough for ages 6–9. A PIN or math question is optional for older kids. Jay's call (Programmer question a).

## Reading load (6+)
Most strings are 4–9 short words, which is fine. The parent help text is long but for adults. The rest card has 3 lines plus a button, which is the limit. Don't add more.

## Evidence
- Self-determination theory: choice and autonomy support motivation, and controlling language undermines it. Ryan & Deci 2000, *American Psychologist*. **STRONG.** Cited from memory, please check.
- Labeling and person-praise can make kids avoid challenge. Mueller & Dweck 1998, *J. Personality & Social Psychology*. **MODERATE** for this case (praise, not difficulty labels). Cited from memory, please check.
- Parents set media limits, with a co-made plan. AAP 2016, "Media and Young Minds", *Pediatrics*. **MODERATE.** Cited from memory, please check.
- Ending at a natural break point instead of mid-task softens transitions. This is design practice, not a study. **WEAK.**
