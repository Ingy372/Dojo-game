# B-MASHER-d: kind knock-out flow (draft)

## Delivery Note
- **ITEM:** B-MASHER-d (plan: merged PR #291, `drafts/planning/B-MASHER-plan.md`, plan step 3).
- **WHAT:** Screens, exact text, Sensei lines, buttons, focus, timing and alternates for the knock-out (KO) flow: "Sensei helps you up", keep everything earned, then Try again (full health) or Head home. Covers the play-time limit, accessibility and evidence. Design only, no game code.
- **WHY:** The masher and kid bots get knocked out in room 1 a lot (#291). A young player's first KO must feel like a normal part of training, not a failure, so they choose to try again.
- **DECIDE (Jay):**
  1. **Conflict to settle first:** `docs/decisions.md` says *"Defeat during a run (Jay): the run ends and the player goes home with everything found so far"* and you'd prefer something harsher later. #291 and this draft add a **Try again** choice. Is offering Try again OK? (If no, Screen 2 drops to one button: Head home.)
  2. Health on Try again: **Proposed default (Manager guidance, pending Jay): full health.** Alternative: half health (#291 decision 3).
  3. What Try again restarts: **Proposed default (Manager guidance, pending Jay): the room**, matching the in-room defeat rule. Alternative: the floor.
  4. Sign off the lines marked ✅ below (pick main or alternate): S1 title, S1 Sensei, S2 title, S2 Sensei, the two button labels, the resting-door line.
  5. **One Sensei voice (Manager guidance, pending Jay):** replace the in-room line "Ouch! Back to the start." (decisions.md) with:
     - Proposed: "Sensei helps you up. Try the room again!"
     - Alt A: "Up you get! Back to the room's start."
     - Alt B: "Catch your breath. Let's go again!"
     Same rules as below: no loss words, 7 words or fewer per line, read aloud.
- **NEXT:** After sign-off, the Programmer builds it; QA checks it in B-MASHER-e with a 6–8 year-old.

## Word rules
- Never: died, dead, game over, failed, fail, lost, lose, defeat (on screen), try harder, don't give up, only, almost, so close, hurry.
- Use: helps you up, catch your breath, you kept, ready, again, home.
- Reading level: words of 1–2 syllables, lines of 7 words or fewer, present tense, about US grade 1 (please check with a readability tool after sign-off; formulas are rough for very short text). Font is Andika (J7).

## Screen 1: Sensei helps you up
- **Trigger:** health reaches 0. Fight pauses at once; enemies step back and stop (no attacks during the flow).
- **Visual:** soft fade (no red flash, no shake, no sad sound). Sensei walks in and offers a hand; the player stands up. Warm chime.
- ✅ **On-screen text:** "Sensei helps you up."
  - Alt A: "Up you get!" · Alt B: "Take Sensei's hand."
- ✅ **Sensei says:** "Every fall is part of training."
  - Alt A: "Good effort. Let's breathe." · Alt B: "Black belts fall too. They get up."
- **Buttons:** none. Tap anywhere skips the animation.
- **Timing:** about 2.5 s, then Screen 2. Never shorter than the line takes to read aloud.

## Screen 2: Your choice
- ✅ **Title:** "You kept everything you found!"
  - Alt A: "Your treasure is safe." · Alt B: "All your finds are yours."
- **Shows:** a row of this run's finds (loot, XP, decorations) with a small sparkle each. If none: "You learned the room!" (alt: "Now you know this room.")
- ✅ **Sensei says:** "Try again, or rest at home?"
  - Alt A: "What would you like to do?" · Alt B: "Your choice, student."
- ✅ **Buttons (both same size, same color weight, side by side):**
  - **Try again** (alt: "Go again") – back to the room start, full health, room enemies reset, Focus and combo reset (same as the in-room rule).
  - **Head home** (alt: "Go home") – to the Home Dojo with everything found.
- **Default focus:** none highlighted; neither choice is pushed. For controller/keyboard, focus starts on Try again but with no glow difference (please check with QA if this reads as pushing).
- **Timing:** waits forever. **No auto-retry, no countdown, no timer bar, no "Retry in 3…".** Leaving the app and coming back shows the same screen.
- **Guidance tie-in:** if this is the 2nd KO on this floor today, Try again shows the existing Guidance offer as a small extra line, "Sensei can help next time. Want help?" with [Yes please] [No thanks] — optional, never shown to others (core-design §5). Please check this doesn't clash with the P1 Steady offer (once a day max).

## Play-time limit reached
- The KO counts as the room ending. If the daily limit has been reached, Screen 2 shows only **Head home**, with: ✅ "Great training today! Your dojo is resting." (alt: "Time to rest. See you tomorrow!")
- Then the normal "Your dojo is resting for today" door (M7-P9). No "time's up" or clock-running-out wording, and no hint of what they "could have" done.

## Accessibility
- Every line read aloud by the phone voice (same voice as the verses), with a speaker button to replay. Text stays until a button is pressed.
- Tap targets at least 48×48 dp (aim for 64 for ages 6+), 16 dp apart; icons with words (door icon on Head home, circle arrow on Try again).
- Works with reduce-motion (fade only, no hand animation), high contrast, and no reliance on color or sound alone.
- Fits 667×375 with no wrapping past 2 lines.

## Evidence
All four sources were checked by web search on Oct 25, 2026 against the publisher or DOI page and the abstract.

| Claim | Source | Rating |
|---|---|---|
| After a setback, children who had been praised for effort persisted longer, enjoyed the task more and did better than children praised for intelligence. This supports effort lines like "Good effort" rather than "You're so smart". **Limit:** the children were fifth graders (about 10–12), not 6-year-olds. | Mueller, C. M., & Dweck, C. S. (1998). Praise for intelligence can undermine children's motivation and performance. *Journal of Personality and Social Psychology, 75*(1), 33–52. https://doi.org/10.1037/0022-3514.75.1.33 | STRONG for the effect (six studies, 412 children); MODERATE for ages 6–8 |
| Very small wording changes matter. 4-year-olds praised with "You did a good job drawing" coped better with later mistakes than those told "You are a good drawer". This supports describing actions and not labelling the child. | Cimpian, A., Arce, H.-M. C., Markman, E. M., & Dweck, C. S. (2007). Subtle linguistic cues affect children's motivation. *Psychological Science, 18*(4), 314–316. https://doi.org/10.1111/j.1467-9280.2007.01896.x | MODERATE (right age range, but a short report with 24 children) |
| When parents see failure as harmful, their children tend to believe ability is fixed. This is *indirect* support for framing a knock-out as a normal part of learning ("Every fall is part of training"). It is about parents, not game messages. | Haimovitz, K., & Dweck, C. S. (2016). Parents' views of failure predict children's fixed and growth intelligence mind-sets. *Psychological Science, 27*(6), 859–869. https://doi.org/10.1177/0956797616639727 | WEAK for this use (indirect; mostly correlational, about parents) |
| Players' sense of autonomy and competence in a game goes with enjoyment and wanting to play again. This *indirectly* supports a real, unpressured choice between two equal buttons. It doesn't test timers, and the players were not young children. | Ryan, R. M., Rigby, C. S., & Przybylski, A. (2006). The motivational pull of video games: A self-determination theory approach. *Motivation and Emotion, 30*(4), 347–363. https://doi.org/10.1007/s11031-006-9051-8 | MODERATE for autonomy and enjoyment; WEAK as support for no-timer |
| A countdown or auto-retry adds pressure for young kids. | Design reasoning only, no study cited | WEAK |

Notes on checking:
- Haimovitz & Dweck: the volume and issue (27(6), June 2016) and the DOI were confirmed on the APS page. The page range 859–869 was confirmed in the Crossref record.
- Ryan et al.: the article PDF and the Ewha record give pages 347–363, but Springer's "cite this article" box shows 344–360. I used 347–363, as printed on the article.
- The earlier version said later replications of Mueller & Dweck were "mixed". I couldn't confirm that, so I removed it.
