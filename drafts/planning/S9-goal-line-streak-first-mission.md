# S9: Closest-goal line, count-up streak, first Mission

From the L3 coming-back audit (PR #64, `drafts/learning/l3-coming-back-audit.md`): Must #1, Must #2 and Should #5.
Author: Dojo-Ascent Researcher & Planner, 2026-10-24. A short spec only; no game code or work-board edits.

- **The Learning Designer reviews this.** It owns the learning-science reasoning; this spec makes no research claims.
- Numbers marked (guess) are mine.

## 1. The "closest goal" line (run summary and Home Dojo)

**Where:** one line under the grades on the run-over card (`apps/client/src/ui/RunOverCard.ts`). The same line also shows on the Home Dojo.

**How the game picks one goal:**

1. Build a list of candidate goals. Each one has a `left` value (steps to go) and a `total`. Candidates, all from things that already exist:
   - **Next piece meters** from S7-rev (PR #73): class pieces, Monster Journal trophies, unvisited floors (first clears).
   - **Personal bests** in reach (`PersonalBests` in `packages/sim/src/profile.ts`):
     - `mostPerfects`, `longestCombo` or `mostSGrades`, if this run came within 2 of the best.
     - `fastestClearTicks`, if this run was within 10% of the best.
   - **Level:** if 1 level-up is less than 30% away (guess).
   - **Next real step:** `PathCard.next` from `packages/sim/src/training.ts` (the next technique), with `nextClassDay`.
2. Score each candidate as `left / total`, smallest first. Ties go in this order: real step, class piece, Journal, first clear, best, level. The real step comes first so training stays on top.
3. Show only the top one. Never show two lines.

**Wording:** short, hopeful, no numbers bigger than 10 if possible, and no "only", "hurry" or "don't lose".

| Goal | Line |
| --- | --- |
| Class piece | "1 more class for a new dojo piece!" |
| Journal | "2 more monsters for a new trophy!" |
| First clear | "Clear Floor 2 for its statue!" |
| Best | "1 more Perfect to beat your best!" |
| Level | "Almost level 5!" |
| Real step | "Next in class: Self-Defense #2. See you Wednesday!" |

**Fallbacks:**

1. No candidate with `left ≤ 3` (guess): show the real step line.
2. No `PathCard.next` (everything signed): "You've learned every move for this belt. Great work!"
3. No class days set (`nextClassDay` null): drop the "See you…" part.
4. Nothing at all (for example a brand-new profile with no feed): "Every run makes you stronger."

## 2. Streak display: counts up or pauses only

**What counts:**

- A **training week** is a Monday–Sunday week (student's local time) with **at least one real class** in `attendance.recentClasses` from the feed (`packages/sim/src/feed.ts`).
- Game sessions and logins **never** count, so playing the game can't build or protect a streak.
- A **class day** is any date in `recentClasses`; several classes in one week still count as one week.

**The number shown:** "Weeks trained: 14".

- It's a new saved counter, `weeksTrained`, that only goes up. Each new training week adds 1, including weeks that arrive late in the feed.
- The feed's existing `streak.weeks` (DojoForge's in-a-row count) is **not shown**.
  - It's used only as a one-time starting value for old saves: `weeksTrained = max(0, streak.weeks)`.
  - If DojoForge resets its number, the game ignores the drop.

**How it shows:**

- A small banner on the Home Dojo, next to the Path card, in calm colours (no red, no fire or "danger" icons).
- The streak aura from `core-design.md` line 427 grows with `weeksTrained` and **never shrinks**.
- Milestones (5, 10, 20, 50, 100 weeks) get a warm moment: "10 weeks of training! Your aura grows."

**A missed week:**

- The number simply stays the same. No message, no warning, no countdown, no "days left", and no change of colour.
- The next class adds 1 as usual.

**Not allowed anywhere:** reset to 0 on screen, "streak lost", "keep your streak", timers, push reminders about streaks, or guilt words.

**The streak XP bonus** (`framework.md` line 81) is tied to `weeksTrained` milestones, so it also only goes up. Its size is a Manager or Jay decision (guess: +2% per 10 weeks, capped at +10%).

## 3. The first Mission: the white belt's weekly thing to do

**What it is:** one Mission card for the next real technique, `PathCard.next` (for a new white belt: Self-Defense #1). It shows on the Home Dojo as "This week's Mission". It follows the Missions table in `core-design.md` lines 674–686, with game-only steps until milestone 9.

**Steps (no real student data needed):**

1. **Watch Sensei.** A short in-game card shows the matching seal's move and its kid-safe subtitle (from S4, PR #70). It's done when the card is closed.
2. **Try it in the Tower.** Use the matching game action 3 times (guess) in any runs. For example: Self-Defense #1 "Off the Line" = 3 Perfect Counters; kicks = 3 Strikes. The game tracks this itself.
3. **"Ready to show Sensei!"** Tap the button. Sensei says: "Great! Show me in class."

**How it completes:**

- **The game part:** step 3 marks the Mission "Ready" (saved locally). It shows a small celebration and a "Ready" stamp. No reward depends on class yet.
- **The real finish:** when the feed shows the technique signed off, the existing sign-off reward moment plays (`rewards.ts`), the seal unlocks, and the next Mission appears.
  - Until milestone 9, this is tested with fake profiles in `fixtures/` and the testing screen.
  - After milestone 9, step 3 also sends a request to Nic's request endpoint for the staff "Ready for review" queue. The game never changes DojoForge records.
- **"Not yet" from Sensei** stays private: "Keep practicing. You've got this!" Steps 1–2 stay done.

**No pressure if missed:**

- "This week's" is only a friendly label. There is no deadline, no expiry, no penalty and no reminder push.
- An unfinished Mission simply stays.
- If the real sign-off comes before the steps are done, the Mission completes anyway, because class always wins.

**Unlock pacing:** the first time a Mission appears, it uses the existing "first time it's earned" teaching moment (`core-design.md` line 656).

## Scope flags

- New saved fields: `weeksTrained`, `missionProgress` (id, step, count, ready), plus `classesCounted` from S7-rev. All need old-save migrations.
- Mission card UI, the Sensei demo card, and the closest-goal line (small).
- Step 2 needs a mapping from each technique to a trackable game action. S4 gives #1–30; kick combos and katas wait on J2 and S3.
- The "Ready to show Sensei" request to DojoForge is milestone 9 (Nic). Until then it's local only.
- The streak XP bonus size needs a decision.
- **Open question for the Manager (L3):** confirm Insights stay at 2nd belt, so the summary doesn't get crowded.

## Done-when

**Goal line:**

- Exactly one line on every run-over card and on the Home Dojo.
- A table-driven test gives fixed inputs and checks the chosen goal and wording, including all 4 fallbacks.
- The real step wins ties.
- A word check finds no "only", "hurry", "lose" or "left!" timers.

**Streak:**

- A test with feed weeks [class, class, none, class] shows 1, 2, 2, 3. It never shows 0 after a gap.
- A DojoForge `streak.weeks` drop doesn't lower `weeksTrained`.
- Game sessions without class add nothing.
- No red colour or warning text in the streak UI (review checklist).
- The aura never shrinks.

**Mission:**

- A new white-belt fake profile sees "This week's Mission: Self-Defense #1".
- Steps 1–3 complete in play and show "Ready".
- A sign-off in the fixture completes the Mission and shows the next one.
- Leaving it untouched for weeks of fake time changes nothing and sends no messages.
- A sign-off before the steps are done still completes it.

**Review:** the Learning Designer reviews the wording and the streak rules before build.
