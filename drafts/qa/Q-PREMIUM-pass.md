# Q-PREMIUM pass: premium-feel playthrough of the live build

**Delivery Note**
- **ITEM:** Q-PREMIUM. Premium-feel QA of the live build at https://dojo-ascent.jay-lindemuth.workers.dev (version shown on the title: "Oct 26, 12:43 AM"), plus a check for any player-visible "Perfect".
- **WHAT:** I played it through with Playwright and real touch at 667x375 and 932x430, Reduced Motion off. I covered first launch, the create screen, the tutorial, the dojo modals, the Training Board (all 4 tabs), the testing screen, room 1 of the tower (guided, green-belt profile), the keepers-hall boss and the lose screen. I found 22 items: 0 BLOCKS PLAY, 8 ANNOYING and 14 SMALL (plus 1 item marked intended). **"Perfect" check: CLEAN.** No player-visible text says "Perfect". Every hit is in a code comment, an internal key or the docs.
- **WHY:** We want the game to feel like Archero or Pokémon. The biggest gaps are tutorial clarity (the walk step), Sensei dialog placement, boss presence and the lose and transition screens.
- **DECIDE:** Should the walk step name the spot ("Walk to the glowing circle") and move it away from the door labels?
- **NEXT:** These areas still need a pass: a win or room-clear screen (my bot never cleared past room 1), the stance picker, Settings/Look/Decorate/Scroll, Practice room, a 667x320 spot check, a Reduced Motion 'on' pass, and sound (it can't be judged headless).

Times are ET. The run was on Oct 26, 2026, about 5:45–6:35 AM ET. Screenshots are in `q-premium/`.

## Findings (most serious first)

| # | Sev | Where | Repro | What feels off | Premium version | Shot |
|---|---|---|---|---|---|---|
| 1 | ANNOYING (near BLOCKS PLAY for age 6) | Tutorial walk step | Fresh profile → create → bow → step "walk to the glowing spot" | The yellow ring sits under the TREASURE door label and reads as part of the door. The text says only "Tap where you want to go, or use the stick" and never mentions a spot. Bots stayed stuck for 90 s to 4 min at 667, 844 and 932. | Name the target in the text. Put a pulsing ring with an arrow or bounce clear of the labels. After about 10 s, add a hint (Sensei points, a dotted path). | h01.jpg, h04.jpg, i03.jpg, k02.jpg |
| 2 | ANNOYING | Sensei dialog, tutorial and room 1 | Play the tutorial, then the first tower room | The box jumps between bottom-left, top and top-right. It covers "Room x of y", the joystick and the player. "Got it" floats away from the box and once showed alone. "Three great counters! Your timing can fly on its own now." stays up for minutes and never auto-dismisses. | One fixed spot (a top banner with a portrait) that never covers the stick or player. Auto-fade after a few seconds unless input is needed. | e-3.jpg, e-6.jpg, o-6.jpg, o-12.jpg |
| 3 | — (intended, per Manager) | Training Board testing screen | Tap the "Training Board" title 5 times | Shows Power Rating. This is intended, per Manager: the testing screen is meant to show it. Not a bug. | — | n05.jpg |
| 4 | ANNOYING | Board → Game | Tap Enter the Tower | A full black frame, a loading flash between scenes. | A short fade or door-slide transition with a room-name card. | f01.jpg, d01.jpg |
| 5 | ANNOYING | Lose screen | Lose a room (keepers-hall guided is easy to lose) | The room goes black behind a plain "Good effort!" card. The controls ghost through it, and a Sensei line shows behind. There's no character or animation. The wording is no-guilt ✓. | Dim instead of black, hide the controls, show a Sensei portrait with an encouraging pose, give one big "Try again" and animate it in. | f03.jpg, mend.jpg |
| 6 | ANNOYING | Boss (keepers-hall) | `?room=keepers-hall&difficulty=guided` | The Floor Keeper is about the size of a normal enemy. The intro is plain text ("Floor Keeper awaits."). Floating text piles up ("SHIELD BROKEN!", "BLOCK -10", "TINK", "!") and can't be read. | A bigger sprite, a boss intro card with a name bar, a dedicated boss HP bar, and floating text that is capped and staggered. | f-2.jpg, f-5.jpg, f-7.jpg |
| 7 | ANNOYING | First visit to the dojo | Fresh profile → finish the tutorial → dojo | Four modals in a row: saved note → Home Dojo intro → Welcome card → "Pick up your climb?". The Home Dojo intro comes back on every launch until you dismiss it. The prompt says "You'll start again at room 1", which contradicts "pick up". | One welcome sequence, shown once. Reword the prompt ("Start a new climb?"). | a03.jpg, c01.jpg, c02.jpg, d00.jpg |
| 8 | ANNOYING | Room exits | Clear room 1 | No "Room clear!" moment that I saw. Door labels (REST, BATTLE, CHALLENGE, TREASURE) sit at the top and edges, and some are clipped ("BATT", "EST"). It's not clear you walk into a door. | A clear banner, the doors light up, and an arrow nudges you. Keep the labels inside the safe area. | o-3.jpg, p01.jpg, p05.jpg |
| 9 | ANNOYING | Right edge of the room at 667 | Walk to the right side | The player disappears behind the COUNTER and DASH buttons. | Keep the play area clear of the thumb zone, or fade the buttons when the player is under them. | p02.jpg, p04.jpg |
| 10 | SMALL | Title | Launch | Plain text on black, with no art or music cue. Debug text "Version: Oct 26, 12:43 AM" is visible. | Key art, a logo and a tap-to-start pulse. Hide the version text. | a02.jpg |
| 11 | SMALL | Welcome card | First dojo visit | "Kata (its reward arrives in a later update)" is placeholder text. | Hide it until it ships. | c02.jpg |
| 12 | SMALL | Board → next step | Board | "▶ Video soon" is placeholder text. | Hide it until there's a video. | c03.jpg, o00.jpg |
| 13 | SMALL | Gear tab | Board → Gear | The text "Strikes and Seals you earn show…" is cut off. Both items are named "Everyday". | Wrap the text. Give each item a distinct name. | n02.jpg |
| 14 | SMALL | Trophy Case (Abilities) | Board → Abilities | The belt strip is tiny and overlapping. The "Learn this at the dojo" tiles look faded and unfinished. | Bigger belts. Locked tiles with silhouettes and a lock icon. | n03.jpg |
| 15 | SMALL | Last run | Board after a loss | "You reached room 1 of 8!" sits next to "0 Rooms", which contradicts it. | Make them consistent ("Rooms cleared: 0", "Reached room 1"). | n01.jpg |
| 16 | SMALL | Tutorial | Chase or winded state | "huff... huff..." is clipped at the right edge. | Keep floating text inside the screen. | e-8.jpg |
| 17 | SMALL | Charm pickup | Treasure | "Everyday Crane Charm" overlaps the TREASURE label. | Offset or stack the labels. | e-9.jpg |
| 18 | SMALL | Dojo | Enter the dojo | "You're on Steady, and you can c…" is clipped at the left edge. | Wrap it in a safe area. | a06.jpg |
| 19 | SMALL | Dojo | Every entry | The bow is required on every dojo entry, which is friction after the first time. | Bow once per session, or auto-bow with a short animation. | o00.jpg |
| 20 | SMALL | Fonts | Everywhere | A serif for titles and sans for body. HUD text renders differently between frames. Floating "Get closer!" stays faint. | One type system and one HUD font. | o-9.jpg |
| 21 | SMALL | Art scale | Rooms | The player and enemy sprites are small and the floor tiles plain, compared with Archero. | Bigger sprites, floor detail, light and shadow. | p05.jpg |
| 22 | SMALL | HUD | Room 1 | The "Beginner's Stance" label sits under STANCE, very close to STRIKE. VIRTUE looks disabled with no hint why. | Add spacing. Explain the locked state with a tooltip or icon. | p01.jpg |
| 23 | SMALL | Audio | First load | AudioContext warning before the first gesture (expected). I couldn't judge sound in headless. | Check by hand on a device. | — |

Load time: about 0.3–0.7 s. No page errors.

## "Perfect" visible-text audit (Manager request)

I grepped `content/`, `apps/client/src/` and `packages/sim/src/` on origin/main 3f7a5d64, and checked every screenshot I captured.

| Place | What it is | Player-visible? | Severity |
|---|---|---|---|
| content/abilities/abilities.json:216 `"id": "perfect-discipline"` | Internal id. The shown name is "Strong Discipline" and the text says "Great Counter". | No | none (OK) |
| content/abilities/abilities.json:133 and content/loot/gear.json:37 `healOnPerfect` | Effect type key | No | none |
| content/tutorial/first-session-lessons.json:150–151 `lesson-perfect`, `firstPerfectUnaided` | Keys. The label in lessons.ts:64 reads "Great Counter". | No | none |
| content/settings/last-run.json:21 `mostPerfects` | Key. The value is "Most Great Counters". | No | none |
| apps/client/src (Sfx.ts, GameScene.ts, HomeScene.ts, menu2Frames.ts `stat-perfect`) | Comments, event kind `perfectCounter`, art frame key | No | none |
| packages/sim/src/* | Comments and keys | No | none |
| docs/core-design.md, docs/MILESTONE_PROMPTS.md | Design docs say "Perfect Counter" | No (not shipped) | SMALL (optional doc tidy) |

In game I saw "GREAT x4" and "Great" (Last run tile). **I found no player-visible "Perfect".**

## Playability
- **Age 6:** The biggest risk is the walk step (#1). There's a lot of reading in the Sensei boxes and many modals before play. The controls are big and friendly. The lose screen is kind.
- **Age 12:** Learns fast. Will notice the plain boss, the text pile-up and the placeholders, and may find the 5-tap testing screen.
- **Adult:** The counter loop works. The transitions and lose screen feel unfinished next to Archero. The dialog covering the play area is irritating.

## Design-rules check
- No Power Rating in normal UI ✓. The hidden testing screen shows it, which is intended, per Manager (#3).
- Nothing for sale, no shop ✓. The saved note says no accounts, ads, purchases or chat ✓.
- No chat ✓.
- No guilt ✓ ("Good effort!", "Every climb makes you stronger").
- "+10% power" under the combo counter is a buff label, not Power Rating.

## Not covered
I didn't reach a win or room-clear screen (my bot couldn't clear past room 1, and I ran out of time). Also not covered: the stance picker, Settings/Look/Decorate/Scroll, Practice room, the other rooms through `?room=`, a 667x320 check, a Reduced Motion 'on' pass, and sound.
