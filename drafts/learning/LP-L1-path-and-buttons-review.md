# LP-L1: learning review of L1 (one Path screen) and L7 (fewer fight buttons) for ages 6–9

**Delivery Note**
- ITEM: LP-L1 (work board).
- WHAT: Which lessons and Sensei lines change for L1 and L7, with at most one new idea per session.
- WHY: Both items cut what a 6-year-old has to hold in their head. The words need to match, or the game will teach a button or a screen that no longer exists.
- DECIDE: Manager, on the 3 line changes and the 2 behavior notes. Nothing for Jay.
- NEXT: The Content Designer writes the final words, the Programmer builds L7 and later L1, and the Tester checks them.

## L7: no STANCE button in the fight, Virtue button only when Focus is full

### Lines that change

| Where | Now | Change |
|---|---|---|
| `content/abilities/fighting-style.json` `switchLine` | "You can still switch Stance during a fight." | **Remove**, or replace with "Pick your stance before you climb." (6 words). The old line becomes false. |
| `virtueLine` | "Comes out when your Focus is full." | **Keep.** L7 makes it literally true. |
| `GameScene` float text when Virtue is tapped too early | "Fill your Focus first" | **Goes away** with the button. Good: one less "you can't" message. "Already active" can stay. |

### One new lesson, the first time Virtue appears

The first-session lessons have no Virtue lesson today. When the button first pops in, show one line, counted as that session's one new thing:
- "Your Focus is full. Tap VIRTUE!" (6 words)

Then it never shows again. It goes on the Scroll if a practice room exists; otherwise leave it off, like `lesson-sensei-pick`.

### Behavior notes (Programmer/Tester)

1. **Same spot every time.** Virtue should always appear where it lives now. A button that moves around can't be learned by feel.
2. **Calm entrance.** A short fade or grow, no flashing. With Reduced motion on, it just appears. The Focus meter keeps showing the filling, since the ring on the button goes away with it.
3. **Stance before the run.** With Sensei's Pick on (Guided), the newest signed-off stance is already picked, so a 6-year-old never has to choose. With it off, the stance is chosen on the screen before a run. No lesson is needed for that; the picker already has its own lines.

## L1: one Path screen instead of Gate tab, Path card, goals card and Tower map

### What the screen should teach, top to bottom
1. **The next real step, biggest.** For example, the next sign-off or Gate lock. Real training is the main source of power, so it comes first.
2. **The next game step, smaller.** For example, the next floor or Guardian.
3. **Where you are**: the character on the Tower picture.

Kid lines are 8 words or fewer, a picture before any text, no percent numbers, and no bar that can go down. Gate locks are shown as pictures that light up, never as "missing" items.

### One new idea per session

For an existing player, four screens becoming one is a change. Show one intro card the first time, counted as that session's new thing:
- "This is your Path." / "Your next step is here." (2 lines, 4 and 5 words)

New players meet only the Path screen, so they skip the card. FAITH DOES on top of the Path is L5, so don't show it until L5 is approved, so the first visit teaches only one thing.

### Lines that must follow the change
- Any Sensei, celebration, or Welcome Week line that says "Gate tab", "Board" or "goals card" must point to the Path instead. Code comments, like the one in `Celebrations.ts`, are the Programmer's. The Content Designer should search `content/` for kid-facing strings with those names when L1 is built.
- The Path card line "the next real step, always visible" (core-design section 9) carries over to the new screen. Same promise, one place.

## Evidence

| Claim | Rating | Source |
|---|---|---|
| Fewer things on screen and cues pointing at what matters help learning | MODERATE | Signaling meta-analysis: Schneider, Beege, Nebel & Rey, 2018, *Educational Research Review* 23, 1–24 (mostly older learners) |
| One new thing at a time | MODERATE | Segmenting meta-analysis: Rey et al., 2019, *Educational Psychology Review* 31, 389–419 |
| Seeing the next step and how close it is keeps people going | WEAK for children | Goal-gradient effect: Kivetz, Urminsky & Zheng, 2006, *Journal of Marketing Research* 43, 39–58 (adults, reward cards) |
| Four buttons are easier than five for 6-year-olds | WEAK | Design reasoning, plus the review's own count. No direct study found. |

No launch scope added. No game code touched.
