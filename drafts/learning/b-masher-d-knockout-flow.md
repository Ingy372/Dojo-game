# B-MASHER-d: kind knock-out flow (draft)

## Delivery Note
- **ITEM:** B-MASHER-d (plan: merged PR #291, `drafts/planning/B-MASHER-plan.md`, plan step 3).
- **WHAT:** Screens, exact text, Sensei lines, buttons, focus, timing and alternates for the knock-out (KO) flow: "Sensei helps you up", keep everything earned, then Try again (full health) or Head home. Covers the play-time limit, accessibility and evidence. Design only, no game code.
- **WHY:** The masher and kid bots get knocked out in room 1 a lot (#291). A young player's first KO must feel like a normal part of training, not a failure, so they choose to try again.
- **DECIDE (Jay):**
  1. **Conflict to settle first:** `docs/decisions.md` says *"Defeat during a run (Jay): the run ends and the player goes home with everything found so far"* and you'd prefer something harsher later. #291 and this draft add a **Try again** choice. Is offering Try again OK? (If no, Screen 2 drops to one button: Head home.)
  2. Try again restores **full health** (this brief) or **half health** (#291 decision 3)? I propose full.
  3. Does Try again restart **the room** (my proposal, matches the in-room "Ouch! Back to the start." rule) or the floor?
  4. Sign off the lines marked ✅ below (pick main or alternate): S1 title, S1 Sensei, S2 title, S2 Sensei, the two button labels, the resting-door line.
  5. Does the existing in-room line "Ouch! Back to the start." stay as is, or move to this new wording so there's one voice?
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
| Claim | Source | Rating |
|---|---|---|
| Praising effort/process after setbacks keeps kids persisting and enjoying the task more than praising ability. Supports "Good effort" lines, not "You're so good". | Mueller & Dweck 1998, *J. Personality and Social Psychology* 75(1), 33–52 | STRONG (classic, replicated in parts; later replications mixed in size — please check) |
| Small wording changes matter for young kids: "you are a good drawer" vs "you did a good job drawing" changed 4-year-olds' response to mistakes. Supports action words, no labels. | Cimpian, Arce, Markman & Dweck 2007, *Psychological Science* 18(4) (please check volume/pages) | MODERATE |
| How adults treat failure (as a chance to learn vs as harmful) shapes kids' mindsets. Supports "Every fall is part of training". | Haimovitz & Dweck 2016, *Psychological Science* (please check details) | MODERATE |
| Autonomy (a real choice, no pressure) supports lasting motivation in games. Supports two equal buttons, no timer. | Ryan, Rigby & Przybylski 2006, *Motivation and Emotion* 30 | MODERATE |
| Countdown/auto-retry raises pressure for young kids. | Design reasoning only, no study found | WEAK |
