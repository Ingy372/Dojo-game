# B-MASHER-d: kind knock-out flow (draft)

## Delivery Note
- **ITEM:** B-MASHER-d (plan: merged PR #291, `drafts/planning/B-MASHER-plan.md`, step 3).
- **WHAT:** A kind send-home moment for a knock-out (KO). Sensei helps you up, you keep everything you found, you head home, and the Home Dojo welcomes you with a gentle pointer to what's next. Exact text, Sensei lines, buttons, timing and alternates for every line, plus the play-time path, accessibility and evidence. Design only, no game code.
- **WHY:** Young players get knocked out in room 1 a lot (#291). The run still ends (Jay's rule in `docs/decisions.md`: "the run ends and the player goes home with everything found so far"), but it should feel like the end of a good training day, not a failure, so they come back.
- **DECIDE (Jay):** sign off each line marked ✅ (main or Alt A/B). No open questions remain.
- **NEXT:** After sign-off, the Programmer builds it, and QA checks it in B-MASHER-e with a 6–8 year-old.

### Decided (Manager, Oct 26)
- The in-room reset line "Ouch! Back to the start." is retired. A knock-out always ends the run.
- Pointer order on the Home Dojo arrival: an upgrade ready first, then real class, then the next run.

## Word rules
- Never: died, dead, game over, failed, fail, lost, lose, defeat (on screen), try harder, don't give up, only, almost, so close, hurry, should have.
- Use: helps you up, catch your breath, you kept, home, rest, next.
- Reading level: words of 1–2 syllables, lines of 7 words or fewer, present tense, about US grade 1. Please check this with a readability tool after sign-off; formulas are rough for very short text. Font is Andika (J7).

## Screen 1: Sensei helps you up
- **Trigger:** health reaches 0. The fight pauses at once and the enemies stop.
- **Visual:** soft fade (no red flash, no shake, no sad sound). Sensei walks in and offers a hand, and the player stands up. Warm chime.
- ✅ **On-screen text:** "Sensei helps you up."
  - Alt A: "Up you get!"
  - Alt B: "Take Sensei's hand."
- ✅ **Sensei says:** "Every fall is part of training."
  - Alt A: "Good effort. Let's catch our breath."
  - Alt B: "Black belts fall too. They get up."
- **Buttons:** none. A tap skips the animation.
- **Timing:** about 2.5 s, never shorter than the read-aloud line, then Screen 2.

## Screen 2: You kept everything
- ✅ **Title:** "You kept everything you found!"
  - Alt A: "Your treasure is safe."
  - Alt B: "All your finds are yours."
- **Shows:** this run's finds (loot, XP, decorations), each with a small sparkle.
- ✅ **If there are no finds:** "You learned this room!"
  - Alt A: "Now you know this room."
  - Alt B: "Training makes you stronger."
- ✅ **Sensei says:** "Let's rest at the dojo."
  - Alt A: "Time to head home, student."
  - Alt B: "Come, the dojo is waiting."
- ✅ **One button:** "Head home" (door icon). A tap anywhere also continues.
  - Alt A: "Go home"
  - Alt B: "To the dojo"
- **Timing:** waits until tapped. No countdown, no timer bar, no auto-continue. Leaving the app and coming back shows the same screen.

## Screen 3: Home Dojo arrival
- **Visual:** the dojo lights warm up and the finds drop into place. A soft bell.
- ✅ **Sensei greets:** "Welcome home!"
  - Alt A: "Good to see you home."
  - Alt B: "The dojo is glad you're back."
- ✅ **Pointer line** (one only, in the decided order: upgrade ready, then real class, then next run). It's a hint, never a task:
  - Upgrade ready: "Your new gear is ready to try!"
    - Alt A: "Something new is ready for you."
    - Alt B: "Let's look at your new finds."
  - Real class: "Train in class to grow stronger!"
    - Alt A: "Class makes your Counters sharper."
    - Alt B: "Show Sensei your moves in class!"
  - Next run: "The Tower is ready when you are."
    - Alt A: "The Tower will be here."
    - Alt B: "Ready for another climb?"
- **Buttons:** none extra. The normal Home Dojo screen is underneath, and the line fades after about 4 s or on a tap.

## Play-time limit reached
- If the daily limit has been reached, Screen 2 uses the resting line, then the "Your dojo is resting for today" door (M7-P9) and the Home Dojo arrival without the "Next run" pointer.
- ✅ **Resting line:** "Great training today! Your dojo is resting."
  - Alt A: "Time to rest. See you tomorrow!"
  - Alt B: "What a day! Rest well, student."
- No "time's up" or clock wording, and no hint of what they "could have" done.

## Accessibility
- Every line is read aloud by the phone's voice (the same voice as the verses), with a speaker button to replay it. Text stays on screen until tapped (except the fading pointer line, which stays while it's being read).
- Tap targets are at least 48×48 dp (aim for 64 for ages 6+). The button has an icon and a word.
- Reduce-motion shows a fade only. Works in high contrast, and nothing relies on color or sound alone.
- Fits 667×375 with no line wrapping past 2 lines.

## Evidence
I checked these by web search and the DOI or publisher pages on Oct 25, 2026. I dropped Ryan, Rigby & Przybylski (2006) because it only supported the retry choice, which is gone.

| Claim | Source | Rating |
|---|---|---|
| After a setback, children who had been praised for effort persisted longer, enjoyed the task more and did better than children praised for intelligence. This supports effort lines ("Good effort") over trait praise. **Limit:** the children were fifth graders (about 10–12). | Mueller, C. M., & Dweck, C. S. (1998). Praise for intelligence can undermine children's motivation and performance. *Journal of Personality and Social Psychology, 75*(1), 33–52. https://doi.org/10.1037/0022-3514.75.1.33 | STRONG for the effect; MODERATE for ages 6–8 |
| Very small wording changes matter. 4-year-olds praised with "You did a good job drawing" coped better with later mistakes than those told "You are a good drawer". This supports describing actions, not labelling the child. | Cimpian, A., Arce, H.-M. C., Markman, E. M., & Dweck, C. S. (2007). Subtle linguistic cues affect children's motivation. *Psychological Science, 18*(4), 314–316. https://doi.org/10.1111/j.1467-9280.2007.01896.x | MODERATE (right age, but a short report with 24 children) |
| When parents see failure as harmful, their children tend to believe ability is fixed. This is indirect support for framing a fall as part of learning ("Every fall is part of training"). | Haimovitz, K., & Dweck, C. S. (2016). Parents' views of failure predict children's fixed and growth intelligence mind-sets. *Psychological Science, 27*(6), 859–869. https://doi.org/10.1177/0956797616639727 | WEAK for this use (indirect, about parents) |
| A countdown or auto-continue adds pressure for young kids. | Design reasoning only, no study cited | WEAK |
