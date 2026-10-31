# Q-PREMIUM-2: premium quality audit (main 69c3abaf)

## Delivery Note

- **ITEM:** Q-PREMIUM-2. Premium quality audit of main `69c3abaf`, Sat Oct 31 2026 (ET). No code was written. Updated Oct 31 with the Manager's corrections: board ID fixed, 932x430 shots added, every finding tagged, gaps filled.
- **WHAT:** I played every screen I could reach on a phone-shaped browser (real touch, DPR 1.5) at the two required sizes, **667x375 and 932x430**, with reduced motion off. Earlier I also ran 844x390 and 667x320 (the Board at all of them, with reduced motion on and off). Every finding below links a 667x375 and a 932x430 shot (L8 is numbers only). **28 findings: High 5, Medium 12, Low 11.** Gaps now covered: the boss fight and knock-out flow (`?room=keepers-hall`), levels gained, the Practice room, the "For grown-ups" gate, Journal and Scroll, and the hidden testing screen. The Board has a full redesign proposal and a mockup.
- **WHY:** Jay says the in-game "board" looks messy. He is right. It is the **Training Board** (the Dojo's "Board" button). It has about 12 things on the left, 4 tabs with 3 different frame styles, text from 10 px to 30 px, and it clips at 667x320.
- **DECIDE:** 12 findings are tagged **needs Jay** (taste, redesign or scope calls): H1 Board redesign direction, H3 gear naming and effects, H4 fight screen layout, H5 Floor Keeper boss presence, M1 first-visit modals, M2 title screen, M4 sound loudness and default, M5 "Video soon" placeholder, M8 welcome-home overlay and the "29 things" number, M11 level-up moment, L1 Street Smarts start screen, L6 "You learned this room!" flourish. The other 16 are **routine** (clear bugs and fixes) and can go straight to a code job.
- **NEXT:** After Jay's calls on the 12 items, one code job for the routine fixes plus the Board redesign. Then a second pass of the same checks on the result. Still not seen: a boss win, boss loot and the insight picker (my auto-player could not beat the boss), and the sounds by ear (see "Not covered").

**Tag legend:** *routine* = a clear bug or fix, can go to a code job without a decision. *needs Jay* = a taste, redesign or scope call.

| Tag | Findings |
|---|---|
| needs Jay (12) | H1, H3, H4, H5, M1, M2, M4, M5, M8, M11, L1, L6 |
| routine (16) | H2, M3, M6, M7, M9, M10, M12, L2, L3, L4, L5, L7, L8, L9, L10, L11 |

**What works well:** the knock-out flow is kind ("Sensei helps you up.", "Every fall is part of training.", "You learned this room!" and "Let's rest at the dojo."); the red telegraph circles with the "!" icon; Sensei's hint with the glowing COUNTER button; Town, Outside and Inside have no overlap; Power Rating stays on the hidden screen only.

How I tested: local dev build of `69c3abaf`, fixtures from `fixtures/`, a seeded profile to fill the Gear and Last run tabs (and, for the Journal and Scroll, a profile that has finished Welcome Week). Screenshots are JPEGs in `premium-pass/shots/` (names carry the size, e.g. `pop-932x430-off-run.jpg`). Frame times were measured in the page over 3 s windows, run alone on the box.

Design-rule check: Power Rating appears **only** on the hidden testing screen (it never appeared in any text dump of any other screen). No purchases, chat, ads or guilt wording was found.

---

## 1. PRIORITY ONE: the "board" screen

### Which screen Jay means

I searched code and UI for "board". Candidates, most likely first:

1. **Training Board** (`HomeScene.ts`). Dojo top-right button "Board", then a screen titled "Training Board". It is the hub with Enter the Tower, Practice room, Next step, and 4 tabs (Last run, Gear, Abilities, Gate). **This is the one.** It is the screen every kid opens after every run, it is the busiest, and "board" is its name in both the button and the title.
2. **Gear tab** of the Board. The most crowded tab, with unnamed items.
3. **Abilities tab** (Trophy Case and Fighting Style). Tiny belts, empty kata icons, clipped card text.
4. **Gate tab**. Cleaner, but a third frame style.
5. The wall "BOARD" sign in the Home Dojo and the "Board" button label. This is only a word; it is not a screen. (Its text also sits at y=-132 off-screen in the Dojo text dump, so check it is not a stray label.)

I audited 1 to 4 below. The redesign applies to all of them.

### What is wrong (Training Board, 667x375)

![Board before and after](premium-pass/shots/board-redesign-mockup.png)

Left of the picture is the real game with problems numbered. Right is the proposed layout (a sketch, not game art).

1. **Hierarchy is flat.** Title, Dojo button, avatar, level bar, Play, Practice room and Next step all have similar weight. A 6-year-old has to read everything to find "play". Play is the biggest thing but sits third.
2. **The player card is tiny.** Avatar about 30 px, the level bar is empty and nearly black, and "cap 40" is adult jargon that means nothing to a child.
3. **Practice room and Next step look as loud as Play.** Three stacked, full-width, rounded rectangles in the same dark colour.
4. **A placeholder is on the main screen.** "▶ Video soon" appears next to "Self-Defense #18". Kids read it as a broken button.
5. **Tabs are small and text-only.** 12 to 14 px, no icons. "Abilities" and "Gear (7)" are hard for a non-reader to tell apart.
6. **Three different frame styles across the four tabs.** Last run is a parchment frame with brown tiles. Gear is a dark frame with gold. Abilities is tan cards. Gate is a dark rounded panel with blue circles. The screen changes style when you change tab, which reads as "messy".
7. **Text sizes jump around.** Seen on one screen: 10, 12, 13, 14, 17, 19, 22 and 30 px. Most of the right panel is 12 px.
8. **Two big buttons fight each other on Last run** ("Bests" top right, "Again!" bottom right), plus a small play arrow and a "New for you" tile. Four calls to action in one 300 px panel.
9. **Content hidden by size.** At 667x320 the Last run "Found" row is cut off by the Again! button (it is partly behind a fade), Gear shows only 2 of 4 gear cards, kata names wrap to 3 lines ("David and Goliath").

Per tab:

- **Last run:** ![Last run](premium-pass/shots/pop-667x375-off-run.jpg) Nine empty dots, four stat tiles, "Found", "Always with you", "New for you", two buttons. Too much for one panel.
- **Gear:** ![Gear](premium-pass/shots/pop-667x375-off-gear.jpg) Gear is shown only by a rarity word (Everyday, Special, Rare, Epic). No item names, no "what does it do". See H3.
- **Abilities / Fighting Style:** ![Style](premium-pass/shots/pop-667x375-off-style.jpg) "Beginner's Stance" is written 3 times. Card text is clipped at the bottom ("Beginner's Stance", "Shield of Respect"). "Always with you" has 7 tiny circles.
- **Gate:** ![Gate](premium-pass/shots/pop-667x375-off-gate.jpg) The cleanest tab. Labels are 12 px, "SD #16" is unexplained, "Kick 4" is unclear.

### Redesign proposal

**Rule of the screen:** the left column says *who I am and PLAY*. The right panel says *what I have*. Nothing else.

Left column (about 38% of the width):
- **Back button** "◀ Dojo": top-left, 44 px tall, quiet colour. Drop the "Training Board" title (the tab tells you where you are), or keep it very small.
- **Player card:** one rounded card with a 64 px avatar, name at 20 px, belt line at 16 px, and one thick level bar (14 px tall, gold fill) with "Level 1" at 16 px. **Remove "cap 40".**
- **ENTER THE TOWER:** 72 px tall, orange, 24 px text. The only loud button on the screen.
- **One row of two quiet buttons:** "Practice" and "Next lesson". They are half width each and the same dark colour. "Next lesson" shows the lesson name only; hide the "Video soon" until a video exists.

Right panel (about 62%):
- **Tab bar:** 4 tabs, 44 px tall, each with an icon and a label of 16 px or more: Last run (flag), Gear (shield), Skills (star), Gate (door). Rename "Abilities" to "Skills".
- **One panel style for all 4 tabs** (dark parchment with a gold edge). The parchment of Last run becomes the shared style.
- **Minimum text 15 px** everywhere; headers 22 px.
- **Last run:** "Floor cleared!" 24 px, then 3 tiles (Rooms, Great, Time; drop Combo to the Bests screen), then "You found" with item **names** under the icons, then one big "Play again" button. "Bests" becomes a small text link under the panel. The 9 dots become a single line, "9 of 9 rooms".
- **Gear:** 3 big slot cards (Hands, Gi, Charm). Each shows the item name, a coloured rarity tag and one line of what it does ("+4% Power" in kid words, e.g. "Hits a bit harder"). Tap a card for the list. "Always with you" moves to the Skills tab (it is shown twice today).
- **Skills:** Trophy Case and Fighting Style become two big toggle buttons at 16 px. Stance card names get 2 lines max and are not clipped.
- **Gate:** keep, but 14 px labels, replace "SD #16" with the lesson's short name or an icon, and keep the lock row.
- **Small phone (667x320):** the right panel must fit without a scroll. Use a 2-column Gear layout of 3 cards and cut Last run to 3 tiles plus one button. Test all four tabs at 667x320 as the acceptance check.
- **Motion:** with reduced motion on, the sparkle next to "New for you" is already removed. Keep that.

Acceptance: 4 tabs x 3 sizes x motion on/off, no text under 14 px (Gate row labels excepted), nothing clipped, one frame style, Play the biggest and first thing a kid sees.

---

## 2. Findings

### HIGH

**H1. The Training Board is crowded and uneven (priority one).**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/pop-667x375-off-run.jpg)
Shot 932x430: ![](premium-pass/shots/pop-932x430-off-run.jpg)
Wrong: see section 1 (items 1 to 8).
Kids: a 6-year-old cannot find "play" fast, and the screen is the one they see after every fight.
Fix: the layout proposal in section 1.

**H2. Board clips content at 667x320.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/pop-667x375-off-run.jpg) ![](premium-pass/shots/pop-667x375-off-gear.jpg) ![](premium-pass/shots/pop-667x375-off-abilities.jpg)
Shot 932x430: ![](premium-pass/shots/pop-932x430-off-run.jpg) ![](premium-pass/shots/pop-932x430-off-gear.jpg) ![](premium-pass/shots/pop-932x430-off-abilities.jpg)
Wrong: this happens at 667x320 only (evidence below). The 667x375 and 932x430 shots above show the same tabs unclipped, as the comparison. At 667x320, on Last run the "Found" row and "New for you" are cut by the Again! button. On Gear only 2 of 4 gear cards and 3 of 4 slot icons show. Kata names wrap to 3 lines ("David and Goliath"): ![](premium-pass/shots/pop-667x320-off-abilities.jpg).
Kids: loot is the reward for a run; it is the part they cannot see on a smaller phone.
Fix: design the panel for 320 px first (fewer tiles, one button), as in section 1.

**H3. Gear shows a rarity word, not a name or an effect.**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/pop-667x375-off-gear.jpg)
Shot 932x430: ![](premium-pass/shots/pop-932x430-off-gear.jpg) ![](premium-pass/shots/pop-932x430-off-gear2.jpg)
Wrong: cards read "Rare", "Everyday", "Epic", "Special". The item name (Mountain Gi, Jade Charm) and what it does only appear after a tap, and only in small text. The 3 round icons on the left and the 4 small circles under "Always with you" have no labels. An earlier Q-PREMIUM finding (Gear text cut off) is partly still there.
Kids: a child cannot tell what they are wearing. Equipping feels random.
Fix: show the item name and a one-line effect on every card; move "Always with you" to the Skills tab.

**H4. Fight screen: 40% of the width is round buttons and the HUD stacks in the corner.**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/f1-keepers-hall-667x375-off-t25.jpg) ![](premium-pass/shots/f1-keepers-hall-667x375-off-t0.jpg)
Shot 932x430: ![](premium-pass/shots/h1-ko-932x430-off-t8.jpg) ![](premium-pass/shots/h1-ko-932x430-off-t5.jpg)
Wrong: five round buttons (STRIKE, COUNTER, DASH, VIRTUE, STANCE) at 12 to 17 px labels fill the right side; the hero and enemy are about 30 px tall on a 375 px screen. The Sensei hint box (two lines) covers the lower left. At t0 the Bow button sits on the enemy's spot. "GREAT!" at 54 px covers the enemy ![](premium-pass/shots/f1-keepers-hall-667x375-off-t0.jpg).
Kids: the first fight is the first impression, and the thing they are fighting is hard to see.
Fix: move VIRTUE and STANCE into a smaller secondary group, make "GREAT!" smaller (about 32 px) and put it above the hero, zoom the camera in 10 to 15% so the hero and enemy are bigger.

**H5. The Floor Keeper does not read as a boss.**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/h1-ko-667x375-off-t8.jpg) ![](premium-pass/shots/h1-ko-667x375-off-t14.jpg)
Shot 932x430: ![](premium-pass/shots/h1-ko-932x430-off-t1.jpg) ![](premium-pass/shots/h1-ko-932x430-off-t12.jpg) ![](premium-pass/shots/h1-ko-932x430-off-t14.jpg)
Wrong: reached with `?room=keepers-hall`, which is the boss room of the first floor (the earlier version of this report wrongly called it an ordinary room). The Keeper is the same size as the hero (about 45 px tall at 932x430, about 35 px at 667x375) and dark navy on a busy floor. Its name tag is 13 px. The boss health bar is a long purple bar at the top with no label. The intro text "Keeper's Hall / Floor Keeper awaits." is drawn over the hero and the VIRTUE button. What works: the red telegraph circle with the "!" icon, and Sensei's hint "Take your time. Tap the glowing COUNTER button!" with the glowing COUNTER button.
Kids: the first boss should feel big and special. Today it feels like a normal enemy with a long bar.
Fix: draw the boss 1.6 to 2 times bigger, give it a name plate with a labelled health bar, and keep the intro short and away from the hero. Keep the telegraph and the Sensei hint as they are.


### MEDIUM

**M1. First-visit modals stack up (Title, then the Dojo).**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/d1-667x375-off-title0.jpg) ![](premium-pass/shots/dojo-667x375-off-settings.jpg)
Shot 932x430: ![](premium-pass/shots/d1-932x430-off-title0.jpg) ![](premium-pass/shots/dojo-932x430-off-settings.jpg)
Wrong: the title opens with a 4-paragraph "Saved on this phone" box. In the Dojo, a 3-card "How do you like to train?" chooser covers the screen and the Music/Sound/Reduced motion row is jammed against the bottom edge. A third modal (decoration help) follows. This was an earlier finding and is **still open (3 modals)**.
Kids: a child taps "OK" on everything without reading, and may pick a difficulty by accident.
Fix: show one modal at a time, spaced out. Move the privacy text behind "For grown-ups". Show the difficulty chooser on the Board the first time Enter the Tower is pressed.

**M2. Title screen is plain and shows a debug version line.**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/d1-667x375-off-title1.jpg)
Shot 932x430: ![](premium-pass/shots/d1-932x430-off-title1.jpg)
Wrong: black background, a white serif title and "Tap to start". "Version: Oct 31, 7:42 AM" in tiny type top-left (still open from the earlier pass; it may be dev-only, please check the release build).
Kids: no art, no character, no sound cue. The first screen feels unfinished.
Fix: put the hero and a dojo backdrop behind the title, gently pulse "Tap to start" (still when reduced motion is on), hide the version outside dev.

**M3. Character creation controls are tiny.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/d1-667x375-off-create0.jpg)
Shot 932x430: ![](premium-pass/shots/d1-932x430-off-create0.jpg)
Wrong: skin, hair and gi colour circles are about 16 px. The hairstyle row is 12 dots. Hit areas are far under a finger.
Kids: small fingers miss and pick the wrong colour.
Fix: 36 to 44 px swatches in 2 rows, hairstyle as 4 to 6 big tiles or a bigger arrows control.

**M4. Sound loudness is uneven (from `content/settings/sfx.json`).**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/dojo-667x375-off-settings.jpg)
Shot 932x430: ![](premium-pass/shots/dojo-932x430-off-settings.jpg)
Wrong: gains run from -20.7 dB to +3.3 dB. Whoosh and dash cloth sounds are +2.7 and +3.3 dB while strike is -5 dB and hit about -8 dB. So a whoosh is louder than a punch, and it plays all the time. The "insight" power-up is -16.5 dB. Promotion is +0.5 dB. I could not listen on the box, so this is from the numbers only.
Kids: the loudest sound is the least important one. Sound defaults to full.
Fix: bring whoosh and dash to about -8 dB, lift insight to about -8 dB, set the Sound default to 3 of 5, and listen at phone speaker volume.

**M5. The Board's "Video soon" placeholder.**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/pop-667x375-off-gate.jpg)
Shot 932x430: ![](premium-pass/shots/pop-932x430-off-gate.jpg)
Wrong: "▶ Video soon" shows beside the next lesson on every tab. Earlier "Kata (its reward arrives in a later update)" text was not seen this time.
Kids: looks like a broken play button.
Fix: hide until a video exists, or show a lock with "Coming soon" only in the grown-ups gate.

**M6. Abilities: card text clipped and kata icons empty.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/pop-667x375-off-abilities.jpg) ![](premium-pass/shots/pop-667x375-off-style.jpg)
Shot 932x430: ![](premium-pass/shots/pop-932x430-off-abilities.jpg) ![](premium-pass/shots/pop-932x430-off-style.jpg)
Wrong: the kata cards ("Basic Form 1", "Basic Form 2", "Keon") show a plain gold circle where an icon should be. Belts in the Trophy Case strip are tiny (an earlier finding, still open). Stance and Virtue names are cut at the bottom of the card.
Kids: empty circles look like missing art.
Fix: a simple placeholder icon per kata, a bigger belt strip, and 2-line max names with a bigger card.

**M7. Fight: the "HOME" door label floats inside the arena and collides with loot text.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/f1-keepers-hall-667x375-off-t58.jpg)
Shot 932x430: ![](premium-pass/shots/h1-ko-932x430-off-t14.jpg)
Wrong: "HOME" (13 px) drifts across the floor as the camera moves, and the loot toast "Rare: Mountain Gi" lands on top of it. "Room 1 of 8 · Wave 3 of 3" stays after the last enemy dies, so it reads as an unfinished fight.
Kids: confusing words on the floor; "Wave" and "Room" are two counters.
Fix: pin the door label to the door only and hide it while enemies are alive; stack loot toasts under the HUD; show one counter ("Room 1 of 8") and hide "Wave" when no enemy is left.

**M8. Welcome-home overlay is off-centre and the number is odd.**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/board-667x375-off-welcome.jpg)
Shot 932x430: ![](premium-pass/shots/board-932x430-off-welcome-overlay.jpg)
Wrong: (the overlay shows once per profile: on the Board at 667x375, over the Dojo after the gift modal at 932x430) "Welcome home, Kai! You've already earned these in the dojo. 29 things to unlock!" The hero is drawn behind the text, "Tap to continue" is tiny at the bottom, and "29 things to unlock!" is a big unexplained number with no way to see them. It is a count to chase, so it edges toward pressure.
Kids: a big number with no meaning.
Fix: centre the hero above the text, drop the number, and say "Look at your new things!" with a button to the Gear tab.

**M9. Decorate: hint text collides with the heading.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/c2-667x375-off-deco1.jpg) ![](premium-pass/shots/c2-667x375-off-deco2.jpg)
Shot 932x430: ![](premium-pass/shots/c2-932x430-off-deco1.jpg) ![](premium-pass/shots/c2-932x430-off-deco2.jpg)
Wrong: in the "How do you like to move decorations?" modal, "Tap a decoration to pick it" is drawn on top of the heading. In the placement view, "Now tap where it should go" is white text on the busy floor with a thin outline and covers the wall items. "BOARD" on the wall is 10 px.
Kids: the instruction is the hardest thing to read.
Fix: a solid dark pill behind the hint, 16 px, at the bottom; remove the overlap in the modal.

**M10. See-through Dojo panels (Scroll, Journal, grown-ups, difficulty).**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/i3-667x375-off-gu2.jpg) ![](premium-pass/shots/i3-667x375-off-scroll.jpg)
Shot 932x430: ![](premium-pass/shots/i3-932x430-off-gu2.jpg) ![](premium-pass/shots/i3-932x430-off-scroll.jpg)
Wrong: the Scroll, Journal, "For grown-ups" and difficulty panels let the Dojo buttons and text show through (ghosted "Settings", "Look", "Board" and the player behind). The grown-ups "Play-time limit" panel is dense: a 4-line paragraph in small type, a row of five time buttons, and "Erase progress" (pink) at the bottom-left edge of the screen. The Scroll for a student with no lessons shows only "Replay the tutorial floor".
Kids: ghost text behind a panel makes it hard to read and looks unfinished.
Fix: a solid dark backdrop behind every Dojo panel; trim the grown-ups paragraph to 2 lines; move "Erase progress" away from the edge, and keep its confirmation.


**M11. Levels gained has no visible moment.**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/pop-667x375-off-run.jpg)
Shot 932x430: ![](premium-pass/shots/pop-932x430-off-run.jpg)
Wrong: `levelsGained` only moves the XP bar and plays a quiet level-up sound. The content text "Level up!" exists but is not shown anywhere. The Last run tab (shots) shows the bar and nothing else.
Kids: levelling up is the reward they want to see. Today it passes without a moment.
Fix: a short "Level 2!" pop on the Last run tab and the player card, static when reduced motion is on. How big it should be is a taste call.


**M12. Floating text piles on the hero in the boss fight.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/h1-ko-667x375-off-t14.jpg)
Shot 932x430: ![](premium-pass/shots/h1-ko-932x430-off-t12.jpg)
Wrong: damage and combo numbers ("BLOCK -12", "6", "43", "COMBO") stack on and around the hero in the same spot, so the hero is hidden for a moment.
Kids: they lose sight of their own character in the middle of a hit.
Fix: raise the hero's numbers above the head, offset each new number sideways, and cap the number visible at once at 3.


### LOW

**L1. Street Smarts start screen is very empty.**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/c2-667x375-off-ss1.jpg)
Shot 932x430: ![](premium-pass/shots/c2-932x430-off-ss1.jpg)
Wrong: "Who are you at the store with?" with two buttons in a large black screen, a "Sound on" button top right. It looks like a form.
Fix: add the Sensei and a store backdrop; larger buttons. Keep the question.

**L2. Dojo home labels are tiny.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/dojo-667x375-off-home.jpg)
Shot 932x430: ![](premium-pass/shots/dojo-932x430-off-home.jpg)
Wrong: "TOWER" is 11 px at the door, "BOARD" 10 px on the wall, the 4 top buttons are 14 px. The player stands on the Tower mat. Home Dojo and "✓ Spotless" in the top-left are 13 to 20 px serif on busy wood.
Fix: 14 px minimum for door and sign labels; a dark pill behind them.

**L3. Jargon in small text.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/pop-667x375-off-gate.jpg)
Shot 932x430: ![](premium-pass/shots/pop-932x430-off-gate.jpg)
Wrong: "cap 40", "SD #16/#17/#18", "Kick 4", "Time in rank", "Sensei's Seal" (the explanation is 12 px: "Lights when Sensei approves you to test."), "Room 1 of 8 · Wave 3 of 3", "Training Points" (hidden screen only).
Fix: use the lesson's short name, drop "cap", and say "Classes with Sensei: 15 of 24".

**L4. Town, Outside and Inside look good; labels are small.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/c3-667x375-off-town1.jpg) ![](premium-pass/shots/c3-667x375-off-out1.jpg) ![](premium-pass/shots/c3-667x375-off-in1.jpg)
Shot 932x430: ![](premium-pass/shots/c3-932x430-off-town1.jpg) ![](premium-pass/shots/c3-932x430-off-out1.jpg) ![](premium-pass/shots/c3-932x430-off-in1.jpg)
Wrong: Town has a small "Home" button and building labels you cannot read; the Outside arrows are fine. Inside, the door arrow is easy to miss. No overlap or clipping seen.
Fix: 14 px minimum on labels; add a short pulse on the door arrow (static when reduced motion is on).

**L5. Tutorial: the Sensei box covers the walking space.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/e1-667x375-off-t2.jpg)
Shot 932x430: ![](premium-pass/shots/e1-932x430-off-t2.jpg)
Wrong: the two-line dialog sits upper-left over the area the child is told to walk into ("Tap where you want to go"). The "Got it" button is small and yellow. The earlier "walk step unclear" finding is better (the text now names both ways to move). "Room 1 of 3 · Wave 1 of 4" appears in the tutorial.
Fix: dock the dialog at the bottom, bigger "Got it", hide Room/Wave in the tutorial.

**L6. "You learned this room!" card.**
**Tag: needs Jay**
Shot 667x375: ![](premium-pass/shots/f1-keepers-hall-667x375-off-t39.jpg) ![](premium-pass/shots/h1-ko-667x375-off-t18b.jpg)
Shot 932x430: ![](premium-pass/shots/h1-ko-932x430-off-t17b.jpg)
Wrong: it is a plain dark box with a "Head home" button; the earlier "plain lose screen / no room-clear moment" finding is the same. It is kind in tone ("Let's rest at the dojo.").
Fix: a small flourish (stars, gi bow) and the loot shown here, not only on the Board.

**L7. Hidden testing screen: the bottom is off-screen and the Board shows through.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/g1-667x375-off-testing.jpg)
Shot 932x430: ![](premium-pass/shots/g1-932x430-off-testing.jpg) ![](premium-pass/shots/g1-932x430-off-testing2.jpg)
Wrong: at 667x375 "Close" is at y=429 and "+1 level" at y=390 on a 375 px tall screen (at 932x430 "Close" at y=429 just fits), and dragging does not scroll it. The panel is see-through, so Board text shows behind. It is hidden from players, so it only affects testers. Power Rating is shown here only, as the rule says.
Fix: make the panel scroll, or put Close at the top.

**L8. Frame time.**
**Tag: routine**
Shot 667x375: none (numbers only, see Wrong)
Shot 932x430: none (numbers only, see Wrong)
Wrong: re-run alone on the box. At 667x375 the mean is 16.6 to 17.1 ms, with occasional single frames of 33 to 50 ms (Board: 7 of 235 over 20 ms). At 932x430 the Dojo, Town, Outside and fight are 16.75 to 17.55 ms, Inside is 20.6 to 21.9 ms, and the **Board is 25 to 28 ms mean with a median of 33 ms in 3 of 3 runs (about 30 fps)**. The box has no GPU and the load was high (other jobs were running), so this may be the box and not the phone.
Fix: confirm the 932x430 Board on a real phone. If it holds, look at what the Board redraws each frame (it is the busiest screen).

**L9. Journal text is small and the cards repeat.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/i1-667x375-off-journal.jpg)
Shot 932x430: ![](premium-pass/shots/i1-932x430-off-journal.jpg)
Wrong: the title is 12 px and the subtitle 11 px. All three cards read "Keep exploring!". The left page is narrow. It needs a green belt or higher, and Welcome Week must be over (otherwise the button is hidden).
Kids: three identical cards look like a loading state.
Fix: 16 px title, a different hint per card (where to find it), a wider left page.


**L10. The Practice room is bare.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/i1-667x375-off-prac3000.jpg)
Shot 932x430: ![](premium-pass/shots/i1-932x430-off-prac3000.jpg)
Wrong: no label and no hint. One small enemy on an empty floor and only a "◀ Home" button. A child does not know what the room is for.
Kids: it feels like a wrong turn.
Fix: a title "Practice room", one line of what to try ("Hit it, block it, dash"), and 2 or 3 targets.


**L11. The "Welcome home!" pointer box covers the player card and the ENTER button.**
**Tag: routine**
Shot 667x375: ![](premium-pass/shots/h1-ko-667x375-off-t18home.jpg)
Shot 932x430: ![](premium-pass/shots/h1-ko-932x430-off-t17home.jpg)
Wrong: after a knock-out, the box "Train in class to grow stronger!" shows for about 4 seconds over the player card and the ENTER THE TOWER button.
Kids: they tap while it is still there and it blocks the button.
Fix: move it to the top strip of the right panel, or let a tap dismiss it.


---

## 3. Earlier Q-PREMIUM (Oct 26) items re-checked on main 69c3abaf

| Item | Status now |
|---|---|
| Tutorial walk step unclear | Better (text names both ways to move), L5 |
| Sensei dialog placement | Better, still over walk space (L5) |
| Stacked first-visit modals | **Still open** (M1) |
| Plain title with debug version text | **Still open** (M2) |
| "Video soon" placeholder | **Still open** (M5) |
| Trophy Case belts tiny, kata icons empty | **Still open** (M6) |
| Gear tab text cut off | Partly open (H2, H3) |
| Player hidden behind buttons | Not seen in fights I played |
| Black frames between scenes | Not re-measured |
| Plain lose screen, boss presence, floating text piles | **Still open.** The knock-out screens are kind but plain (L6). The boss does not stand out (H5). Numbers pile on the hero (M12). |
| Last-run text contradictions | Not seen on the seeded run tab |

## 4. Not covered (honest list)

**Now covered (this update):** the boss fight and knock-out flow (H4, H5, M12, L6, L11), levels gained (M11, from the code plus a seeded run), the Practice room (L10), the "For grown-ups" gate (M10), Journal and Scroll (L9, M10), and the hidden testing screen (L7).

**Still not covered:**
- **Boss win, boss loot, insight picker, lose screen after a boss.** My auto-player stood still and did not attack, so I saw the boss intro and the knock-out, but not a win. A tester playing by hand should beat the Keeper once.
- **Sound by ear.** The box has no speakers; M4 is from the sound configuration only.
- **Reduced motion for non-Board screens.** Only the Board was run with reduced motion on. Other screens were checked with it off.
- **844x390 and 667x320 for non-Board screens.** These were done at the two required sizes only.
- **The "Erase progress" confirmation.** I did not press it.
- **Frame time on a real phone.** The box has no GPU (see L8).

Scratch scripts and the other shots are in `/workspace/qa/qp/` on the box (not committed).
