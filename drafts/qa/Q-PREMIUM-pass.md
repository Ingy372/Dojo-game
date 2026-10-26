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

## Follow-up pass (Oct 26, 2026, about 6:40–7:20 AM ET)

**Delivery Note**
- **ITEM:** Q-PREMIUM follow-up pass of the live build.
- **WHAT:** Covered Settings, Look, Decorate, Scroll, Journal, Street Smarts, Trophy Case, the stance picker (Fighting Style), the Practice room, a full 667x320 sweep with Reduced Motion **on**, a tower run into room 2, and the keepers-hall boss with RM on. 9 new items: 0 BLOCKS PLAY, 4 ANNOYING, 5 SMALL. **Not reached: the win screen and a full boss win.** My scripted player beat room 1 on guided, then lost in room 2 and lost to the Floor Keeper both times.
- **WHY:** These areas were left uncovered by the first pass.
- **DECIDE:** Should Settings get a visible Close/Back button (#F2)? Should a "Room clear!" beat be added (#F3)?
- **NEXT:** The win screen and boss win need a human playtest or a DEV-build run with `window.game`. I can't drive the counter timing well enough on the live build.

| # | Sev | Where | Repro | What feels off | Premium version | Shot |
|---|---|---|---|---|---|---|
| F1 | ANNOYING | "Bow" prompt (dojo entry and "Bow to begin the floor") | Load the dojo and tap Bow once | A single touch tap often does nothing. I needed 2–3 taps every time at 667. While the bow prompt is up, every top-bar menu (Settings, Look, Board…) is dead with no feedback. | Bow fires on the first tap. Menu taps under the shade should nudge the Bow button (they pulse it now only if you tap the shade, not the menus). | fu-bow-ignored.jpg, fu-bow-3taps.jpg |
| F2 | ANNOYING | Settings | Dojo → Settings | No visible Close/Back/X. The panel floats over a half-visible dojo top bar. A 6-year-old may not know how to leave. | A clear X or "Done" in the corner, as on Look and Scroll. | fu-settings-667.jpg, fu-settings-320-rm.jpg |
| F3 | ANNOYING | Room clear → exit | Clear room 1 on guided | No "Room clear!" banner or fanfare. Door labels just sit at the walls (one was off-screen to the right). The player only left room 1 by walking blindly right. Health is not topped up between rooms, so room 2 starts in the red and ends fast. | A clear banner, the doors light up with an arrow, and an optional small heal at a Rest door. | fu-room1-cleared.jpg, fu-room1-exit-right.jpg, fu-room2-ouch.jpg |
| F4 | ANNOYING | Boss loss with RM on | `?room=keepers-hall&seed=7&difficulty=guided`, Reduced Motion on | "Ouch! The run is over." overlaps the "Floor Keeper" label. The screen turns black with the controls still bright and tappable-looking. (A purple boss HP bar does exist at the top, which is an improvement on my first-pass note #6, but it has no name or icon.) | Dim instead of black, hide the controls, name the boss bar. | fu-boss-intro-rm.jpg, fu-boss-lose-rm.jpg |
| F5 | SMALL | Decorate | Dojo → Decorate | The first-time "How do you like to move decorations?" chooser is see-through. The text behind it ("Tap a decoration to pick it", "In storage tap to place") shows through, and there's no back button. | An opaque panel and a Back option. | fu-decorate-667.jpg, fu-decorate-320-rm.jpg |
| F6 | SMALL | Trophy Case → kata | Board → Abilities → tap a kata | "Its power arrives in a later update" is placeholder text. At 667x320, "David and Goliath" spills out of its tile. The belt strip is still tiny. | Hide unfinished text. Fit labels inside tiles. | fu-kata-placeholder.jpg, fu-trophy-320-rm.jpg |
| F7 | SMALL | Practice room | Board → Practice room | No intro or goal text. It drops you into a bare room with dark pits and one enemy, plus a "Home" button. | A one-line "Practice your Counter, no score here" banner and a dummy target. | fu-practice-667.jpg, fu-practice2-320-rm.jpg |
| F8 | SMALL | Scroll | Dojo → Scroll | Three buttons in a large empty dark panel. It feels unfinished. | Illustrated scroll cards with a short preview. | fu-scroll-667.jpg |
| F9 | SMALL | Stance picker | Board → Abilities → Fighting Style | Clear text ("Tap a card, then tap a pick"), but the cards are small (about 45 px) at 667, and only Beginner's Stance is available, with no locked-preview of later stances. | Bigger cards, plus silhouettes of upcoming stances. | fu-stance-667.jpg |

**Good, no issue:** Look (character editor) is clean and polished, with clear Back/Done. Journal (Monster Journal with "?" silhouettes) reads well. Street Smarts is clean. The room name card ("Training Yard") works. The lose card ("Good effort! You reached room 2 of 8. You keep everything you found: 1 treasure. +24 experience") is kind and clear. **The 667x320 sweep** fit every screen with no clipping except F6. **Reduced Motion on** turns the toggle "On", I saw no shake or flash, and everything else behaved the same. Load times rose to 2–6 s only while I ran 3–4 sessions in parallel (not a game issue).

**Still not covered:** the win and boss-win screens (see NEXT) and a sound check on a device.

---

## Retest (Q-PREM-RETEST, Mon Oct 26 2026, ~8:30 AM ET)

**Delivery Note**
- ITEM: Q-PREM-RETEST (room-clear/win screen + Floor Keeper boss win)
- WHAT: The boss win was reached on current main (42d54ed0) at 667x375 (RM off) and 667x320 (RM on). The win reuses the plain room-clear: a big "A" grade, the line "Room clear! N Great · no damage · 0:16", a loot list and a chest. There is no Floor Keeper victory moment. There is no Power Rating and no guilt. Text overlaps at 667x320. 932x430 was not reached (see Coverage gaps).
- WHY: Recheck the win moments for premium feel before playtest.
- DECIDE: Should the boss win get its own celebration ("Floor Keeper defeated!")? Should the "A" grade stay for kids?
- NEXT: Retest F1/F2/F4 when PRs land. None are open yet.

**Setup and hooks (disclosure)**
- Build: worktree at origin/main 42d54ed0, vite on 127.0.0.1:5363, URL `?difficulty=guided&room=keepers-hall`.
- No game code was edited. **There is no win or god-mode hook in the code.** I used the existing DEV-only `window.game` (main.ts) at runtime. Every 150 ms it reset player HP to max and set each living enemy's HP to 1. So the boss **skipped its phases**, and this retest does not judge boss pacing.
- Work board: section 0b6 is **not on origin/main's docs/work-board.md**. It is only on origin/bot-manager (e5c9be3b). What it lists:
  - F1: the Bow prompt fires on the first tap, and taps on top-bar menus pulse Bow. Pass bar: 10 of 10 taps.
  - F2: Settings gets an X or Done button with a 44 pt target at 667×375 and 667×320.
  - F4: on a boss loss, "Ouch! The run is over." no longer overlaps "Floor Keeper", and the fight controls hide.
- `gh pr list`: there are **no F1/F2/F4 PRs**. Open PRs are 318, 317, 316, 292, 277 and 216. There was nothing to QA. The F1 bug still reproduces: the Bow still needs 2–3 taps.

**Findings (most serious first)**
1. **ANNOYING: the boss win has no boss moment.** Beating the Floor Keeper shows the same "A" + "Room clear!" as any room. There's no "Floor Keeper defeated!", no boss name and no fanfare beat. The HUD still reads "Room 1 of 8" (that's because of `?room`). For a kid, the biggest win of the floor feels like a normal room. Shots: rt-W1-5, rt-W1a.
2. **ANNOYING: the win text overlaps at 667x320 (RM on).** The "A" grade sits on top of the Sensei banner ("Sensei: G… timing!"). The "Room clear!" line runs through the player sprite and the STRIKE button. Shot: rt-W3-6.
3. **ANNOYING: the "Room clear!" stat line is small, white and fades fast.** It also overlaps the chest and player at 667x375. It's hard to read on the tan floor. Within about 1 s it's semi-transparent (rt-W1a).
4. **SMALL: the loot list stacks top-right next to DASH.** It shows four lines of green "Special: …" text. It's readable, but it crowds the controls. Loot only showed at 667x375. In the 667x320 run, no list was seen in the captured frames.
5. **SMALL: stale tips after the win.** "Sensei: Wait for it… COUNTER!" (in the earlier W1 run) and "GREAT x2" (rt-W3a) stay on screen in the empty room after the clear.
6. **SMALL: the player sprite hides under the STRIKE/COUNTER buttons** near the right wall at 667x375 and 932x430 (rt-W4-9). I can't tell what's happening there mid-fight.
7. Positive: there's no Power Rating, no guilt or loss language, and the "no damage" and time stats are framed positively. The HOME door with its green badge appears after the clear, and the chest pops.

**Coverage gaps**
- 932x430 (RM on and off) and 667x375 RM on: my auto-bot stalled at the right wall in wave 2–3 and never reached the win (rt-W5b). So these win screens are **not verified**. They need a manual pass or a real teleport/win hook.
- A non-boss room-clear was not run separately. The boss win uses the same room-clear UI.
- I didn't step through the door to the floor-complete screen. My scripted walk didn't reach HOME.
