# S12: Practice each enemy from the Monster Journal

Manager item S12 (Oct 24): a calm practice space for each enemy, opened from its Monster Journal page.

Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only; no game code or work-board edits. Numbers marked (guess) are mine. No learning-science claims; the Learning Designer owns why practice helps and reviews the flow.

## What exists today

- **Monster Journal (Bestiary):** an entry for every enemy. It fills as you see it, beat it 10 times, and land 10 Perfect Counters on it (`core-design.md` line 223). The S6 IDs are `ach.journal.entries.<n>` and `ach.journal.master.<enemyId>`. S7 source C gives decoration progress for new entries.
- **Named monsters** (draft) add a one-screen Journal with `monsterJournal: { [id]: { met, beaten } }` (`named-monster-proposal.md`).
- **Enemy text:** every enemy file has `bestiary.tip` and lore per belt (`drafts/content/enemies/*.json`).
- **Guided first Counter:** the sim already has Sensei's guided Counter (slowdown, pulsing button, help fading over 3 steps), using the `guideStart`, `guideNudge` and `guideDone` events (`packages/sim/src/world.ts` line 168).
- **S11** (PR #98) gives each enemy its own sight and sound warning.

## The idea

On each Journal page the kid has **met**, a **"Practice"** button opens a small, calm room with that one enemy. The kid can try as many times as they like. Nothing is lost, and nothing is at stake.

## Rules

- **Opens after meeting.** The button shows once the enemy is seen (the first Journal step). Enemies not met yet show "?" with "Keep exploring!" (same as the named-monster draft).
- **No fail state.** The player can't be beaten in practice. Health stays on screen but can't drop below 1 (guess). Being hit shows the normal hit flash, then Sensei says something kind.
- **No rewards, no costs.** No XP, loot, materials, decoration progress or Training Points. Practice never touches the run, the Gate or any belt rule. (This keeps practice calm and stops it from becoming a grind; see decision 1.)
- **No timers, no scores, no counts on screen.** No grades, no "best", no streaks.
- **One enemy at a time.** One copy of the enemy, in an open room. For the Floor Keeper, its summons are off (guess), so the kid can focus on the slam and sweep.
- **Leave any time.** A big "Done" button goes back to the Journal. Leaving is never asked twice.
- **Real enemy timing.** The enemy uses its real attacks and the S11 tell. Its timing follows the kid's difficulty setting, with no secret changes.

## Helpers inside practice

| Helper | What it does | Default |
| --- | --- | --- |
| **Slow** | Uses the Guided (Steady) counter window, 10 ticks, whatever the game setting is | Off (guess) |
| **Sensei watches** | Runs the existing guided Counter (slowdown, pulsing Counter, help fades) for this enemy | On for the first visit, then off (guess) |
| **Show the tell** | Plays the S11 pose, floor shape and sound once on their own before the fight, with the `bestiary.tip` line | On the first visit only |
| **Calm enemy** | The enemy waits after each attack until the kid moves (guess) | Off |

The Slow helper is the only one that changes timing, and only inside practice.

## What Sensei says (examples for C7 or the Content Writer to write)

- At the start: the enemy's `bestiary.tip` (already written).
- After a Perfect Counter: a short cheer (for example, "That's it!").
- After being hit: a kind line (for example, "Watch for the warning, then try again.").
- After 3 Perfect Counters in a row (guess): "You've got it! Practice more or head back." This is said once. It never ends the session.

The Content Writer writes the final lines. They must be one short sentence each, for ages 6+, and never mocking.

## Data

- No new saved field is needed for the room. One optional field: `journalPracticeSeen: { [enemyId]: true }`, so the first-visit helpers show only once. Old saves load as empty.
- The room is a fixed layout from `content/rooms` (guess: one open "practice mat" room). Named monsters use their base enemy plus their extra tell.

## Done-when

- Every met enemy's Journal page shows "Practice". Unmet enemies show "?" and no button (test).
- In practice the player can't be beaten. Health never drops below 1 (test).
- Practice gives no XP, loot, materials, decoration progress or Journal progress. A test runs 100 practice counters and checks that the profile is unchanged except `journalPracticeSeen`.
- No timer, score, grade or count shows in practice (screenshot check).
- Slow sets the counter window to 10 ticks only inside practice. The main game setting is unchanged afterwards (test).
- Sensei watches reuses the existing guide events, with no new sim mode (code check).
- "Done" always returns to the Journal in one tap (test).
- A Guardian's Practice button is hidden until the player has beaten that Guardian (test).
- The Learning Designer reads the flow and the Sensei lines.

## Scope flags

- **Sim:** small. It needs a practice flag on the world (no loss, no rewards) and a way to force the counter window. The guided Counter already exists.
- **Client:** a Practice button on the Journal page, a Done button, and a helper toggles panel.
- **Content:** one practice room, and about 4 Sensei lines.
- **Depends on** the Journal screen being built (named monsters M7-N1, or the full Bestiary). If only the small named-monster Journal is built at launch, practice opens from those 3 pages plus a basic page for each of the 4 base enemies (guess).
- Guardians: practice could come later. A Guardian's Practice button shows only after the player has beaten one (decided).

## Decisions (decided, Manager, Oct 24)

1. **Decided:** practice does **not** count toward the Journal (no defeats or Perfect Counters counted).
2. **Decided:** the helper defaults are OK: Slow off, Sensei watches on for the first visit only, Show the tell on the first visit only, Calm enemy off.
3. **Decided:** a Guardian can be practised only **after the player has beaten one**.
