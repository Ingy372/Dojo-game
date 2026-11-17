# TUT-P1: The tutorial redo (plan)

Board item c7ad28c0. Owner: Dojo-Ascent Researcher & Planner. Docs only.

## What Jay said (exact)

> "i feels choppy and bad. very rushed. yes it teaches the core of the game, but theres a lot more that could be done. for example, let the character start with a fun story while learning to move. suddenly rocks start falling and you have to get out of the way (teaching movement) then a little time goes on and you blend a nice way to teach about always striking (auto attack) on some boxes or dummies. then a bad guy pops up. these are all examples, not hard rules to follow. but the tutorial needs some love. the beginning currently feels like ignore everything else and wait till you see a yellow ! and hit block."

## The problem in one line

Today the first real thing the game asks for is "wait for the warning and tap COUNTER". The kid never feels the fun part first: moving, hitting things and winning a small fight.

## What the research says

- **Teach by playing, one step at a time.** Apple's game onboarding guide says to "teach one step at a time using short and clear instructions" and to let players "demonstrate competency before moving on". It also says to start "self-directed gameplay as soon as possible". ([Apple: Onboarding for Games](https://developer.apple.com/app-store/onboarding-for-games/))
- **Keep the tutorial to the core loop.** Everything else can be discovered later. Kids are smart, so don't repeat directions. ([WWDC17 "Design Tips for Great Games"](https://developer.apple.com/videos/play/wwdc2017/811/))
- **Practice safely, then use the skill for real.** In Mario's World 1-1, a gap with a safe floor comes right before a real one, so players learn the long jump without risk. Miyamoto wanted players to "gradually and naturally understand what they're doing". ([Creative Bloq on the 2015 Eurogamer interview](https://www.creativebloq.com/3d/video-game-design/why-super-mario-bros-is-still-a-fantastic-lesson-in-game-design), [Game Developer](https://www.gamedeveloper.com/design/how-miyamoto-built-i-super-mario-bros-i-legendary-world-1-1))
- **Make it optional and replayable.** Apple's HIG says to consider letting players skip, then make the tutorial easy to find later. ([HIG onboarding, mirror](https://appstoreguidelines.com/human-interface-guidelines/version/30/onboarding/)) We already have the replay: Lesson Scroll, "Replay the tutorial floor".

The plan below follows all four. The falling stones are the safe practice for the red circle. Later, the Brute's red circle means the same thing: something is coming, so get ready.

## What we keep from today (it works)

- The bow at the door (dojo manners).
- "Doing nothing can't lose": health never drops below 1, and enemies wait for Sensei's step.
- Got it tips that pause the game, then wait for the kid to try (K24a). No timers.
- The guided Counter (G1), the automatic Insight, the Special-or-better chest, the easy Floor Keeper and the door home.
- Only brand-new profiles get it, and the Lesson Scroll replays it.

## The new beats (one skill each)

Times are targets for a 6–9 year old on Guided (ages 6–9 start there, OV-B3). They are not measured. TUT-Q1 times today's floor first, so we have a real "before".

| # | Beat (story) | The one skill | Target length | Room |
|---|---|---|---|---|
| 0 | **Story opening.** 4 short narrator cards from the C3 lore ("Long ago, a great light..."). Then Sensei: "The Tower is waking up. Come with me." | None (just listen, tap to go on) | 20–30 s | Card over the Tower path |
| 1 | **The path.** The hero walks behind Sensei to the Tower door. | Move (tap or stick) | 15–20 s | New room 1: Tower Path |
| 2 | **Falling stones.** The Tower rumbles. Loose stones fall, and a red circle shows on the ground first. Get out of it. 3 small waves: 1 stone, then 2, then 3. | Move away from a red circle | 45–60 s | Tower Path |
| 3 | **Bow at the door.** Same as today. | Bow | 10 s | Tower Path, at the door |
| 4 | **Practice dummies.** 3 straw dummies in the first hall. "Walk close. You strike on your own!" | Auto-attack (just get close) | 30–45 s | New room 2: Training Hall |
| 5 | **The big dummy.** Focus is full from the dummies, and STRIKE glows. | STRIKE | 15–20 s | Training Hall |
| 6 | **A shadow slips in.** 2 Swarmers come out of a crack. The kid beats them the same way, by getting close. | Auto-attack on a target that moves | 30–40 s | Training Hall |
| 7 | **The Brute.** A slow Brute. The red circle comes back, like the stones. Guided Counter, same as today. | COUNTER | 40–60 s | New room 3: First Steps Hall (today's room, cut down) |
| 8 | **A crowd.** Swarmers from two sides, and DASH glows. | DASH | 30–45 s | First Steps Hall |
| 9 | **Rewards.** The automatic Insight, then the chest, as today. | Open a chest | 30 s | Vault (today) |
| 10 | **The Floor Keeper.** No new skill. Sensei says one line, then stays quiet. Everything together. | Use it all | 60–90 s | Keep (today) |
| 11 | **Story close.** The door home opens. Sensei says one line tying back to beat 0 (no light piece; only the real belt opens the Gate). | None | 10–15 s | Keep |

**Target total: about 6–8 minutes**, spread over 5 rooms instead of 3. Each room is a resume point, so a kid who has to stop doesn't start over (room resume, M7-P11).

## What changes from today

| Today | New |
|---|---|
| The first fight is the guided Counter. | The first fight is auto-attack on dummies (beat 4). Counter comes after the kid has already won a fight (beat 7). |
| No story. | A short opening and close (beats 0 and 11). They use the C3 lore and chapter-1 lines, which are drafts, so Jay's okay on them is needed. |
| Moving is taught by "walk to the glowing spot" and "walk around". | Moving is taught by the path and the falling stones (beats 1–2). The glowing spot and "This room is big. Use all of it." go away. |
| Strike is taught in the boss room when Focus fills. | Strike is taught on the big dummy (beat 5). The boss room teaches nothing new (M7-P2 call 4, made stricter). |
| 3 rooms: battle, vault, boss. | 5 rooms: Tower Path, Training Hall, First Steps Hall, vault, boss. |
| 13 tips, plus 2 fight tips ("Little Swarmers first", "Now the Brute") and "Keep some space". | About 12 tips, one per beat. The two fight tips and "Keep some space" are cut (they aren't one skill each). |
| Wave 2 (3 Swarmers + a Brute) and wave 3. | Gone. Beat 6 is 2 Swarmers, beat 7 is 1 Brute and beat 8 is the Dash crowd. |

## New pieces (both tutorial-only)

1. **Falling stones (sim hazard).** A room can list stone drops in waves. Each one shows a red ground circle that fills, then the stone lands. If the hero is still inside, they stumble briefly (stars, a short pause). It does no damage, and that wave drops again. Beat 2 is done when the kid has stepped out of 3 waves. The circle uses the same red circle art as enemy warnings, so stones and enemies teach the same signal. Tutorial-only: normal rooms can't list stones (the loader refuses).
2. **Practice dummies (passive enemy).** They never move and never attack, but they take hits and give Focus like a normal enemy. One is big, with more health, so it lasts until STRIKE. Today every enemy must have a warned attack (`MIN_WINDUP_TICKS`). A `passive: true` enemy skips that check and is allowed only in `tutorial: true` rooms.

**Scope flag:** both are small and tutorial-only, with no effect on normal floors, balance or rewards. Using stones in real Tower rooms later would be a new feature, so it isn't in this plan.

**Tuning:** this plan changes no damage, health, XP, coins or rewards. Stones do nothing to health, and the dummies give the normal Focus per hit. So the balance-check skill has nothing to check here. The stone fill times are playtest settings in a content file. They start at 1.5 s for wave 1 and 1.2 s for waves 2–3, and TUT-Q1 adjusts them.

## Work items (small PRs)

| Id | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| TUT-C1 | Content Designer | Lines for beats 0–11 in `drafts/content/tutorial/TUT-C1.json`: 4 opening cards (taken from chapter-1 screens 1–4 if they fit), one tip and one success line per beat, the stumble line, and the close. Every line under 12 words and kid-safe; `check-tutorial.py` passes. | The file exists and the checker passes. | This plan |
| TUT-L1 | Learning & Engagement Designer | Review the beat order and lengths for ages 6–9 in `drafts/learning/TUT-L1-review.md`. Is one skill per beat right? Is 6–8 minutes too long for one sitting? Do the stones scare anyone? | The review names a yes or a change for each beat. | TUT-C1 draft |
| TUT-A1 | Artist | A falling stone plus its landing dust (cartoon, no cracks on characters), a straw practice dummy (small and big), stumble stars, the Tower Path background. The red ground circle is reused, not new. | Assets are in the repo at the game's sizes. | This plan |
| TUT-B1 | Programmer | Sim: falling-stone hazard (room `hazards`, waves, the stumble event, `tutorial`-only loader check) plus tests. | Tests show a stone lands after its fill time, the hero inside stumbles with no health change, the wave repeats, the step completes after 3 dodged waves, and a non-tutorial room with stones fails to load. | This plan |
| TUT-B2 | Programmer | Sim: `passive` practice dummies (small and big) plus tests. | Tests show a dummy never moves or attacks, auto-attack hits it and Focus rises, and a passive enemy outside a tutorial room fails to load. | This plan |
| TUT-B3 | Programmer | Content and client: new rooms `tutorial-path` and `training-hall`, cut-down `tutorial-hall`, `TUTORIAL_FLOOR.rooms` = 5, the new step list in `tutorial-floor.json`, the opening and closing cards, the stumble visuals, and removal of the cut tips and waves. | On a fresh profile at 844x390 and 667x375, the floor plays beats 0–11 in order, each tip waits for its try, closing the app mid-floor resumes at the room start, and existing tutorial tests are updated or replaced. | TUT-B1, TUT-B2, TUT-C1 (placeholder art is fine until TUT-A1) |
| TUT-Q1 | QA Tester | Time today's tutorial first (the before), then the new one on Guided and Standard. Record seconds per beat and any spot where the kid is stuck or waiting. | A report with both timings, plus a pass or fail against the targets above (±30%). | Before: none. After: TUT-B3 |

Order: TUT-C1, TUT-A1, TUT-B1 and TUT-B2 can start together. TUT-Q1's "before" timing can run now.

## DECIDE (for the Manager; Jay for taste)

1. **Story wording (Jay).** The opening uses the C3 lore and the chapter-1 draft. Both are still drafts waiting on Jay. Is it okay to show them on day one?
2. **Skip (Manager).** Apple suggests offering a skip. My pick is to let the kid tap through the story cards but not skip the play beats. Kids 6+ are the ones who need the play, and the Scroll replays it anyway. Existing students (Welcome Week) get the same floor.
3. **Length (Manager, after TUT-L1).** Is 6–8 minutes in one sitting okay? If not, the fallback is to end session 1 after the Training Hall (beat 6) and play the rest next session. That fits "one new system per session" even better, but the first session ends before the Brute.

## Not in this plan

Learning-science claims (Learning & Engagement Designer owns those), the stones outside the tutorial, new rewards, and anything that touches balance.
