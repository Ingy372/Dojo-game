# P-MENU: polish for the Training Board (hub), Gear and Sensei's Seal

Status: plan for the Programmer. No game code, content or work board changed.
Jay (Oct 24): "The main one you sit at and tap through gear, the page with sensei seal, looks a bit clunky and not tight and smooth like the rest of the game."
Labels: **[CODE]** what main does today (file:line), **[PLAN]** the fix, **[TASTE]** Jay's call.

All three screens are one scene: `apps/client/src/scenes/HomeScene.ts` ("Training Board"). Gear is the `gear` tab (`renderGear`, line 557). Sensei's Seal sits on the `gate` tab (`renderGate`, line 500).
No new systems. No purchases, no ads, no pressure. Same content, same words, same rules.

## 1. Why it feels clunky (what the code does today)

1. **Every tap rebuilds the whole screen with no motion.** `render()` calls `this.ui.removeAll(true)` and redraws everything (line 219). Switching a tab, turning a page, picking a gear card, Wear and Let go all call `render()` (lines 613, 710, 716, 724, 737). So everything pops in one frame. The rest of the game eases things in: Celebrations use `Back.Out` at 220-450 ms (`Celebrations.ts:120, 226`), and RunOverCard fades in over 260 ms (`RunOverCard.ts:72`).
2. **Buttons give no press feedback.** `button()` (line 778) is a flat rectangle that fires on finger-up and never changes look. Gear cards (line 610) are the same.
3. **Tap targets are below 44 pt:**

   | Control | Line | Height now |
   |---|---|---|
   | ◀ Dojo | 232 | 30 |
   | Practice room | 266 | 30 |
   | Tabs | 281 | 34 |
   | Page ◀ ▶ | 493-495, 619-621 | 28 |
   | Wear / Let go | 629-630 | 30 |
   | Gear cards | 585 | 42 |
   | Run chips | 335-342 | 30 (not tappable, fine) |

4. **No spacing grid.** Gaps in one screen are 4, 6, 7, 8, 10, 12, 14, 16, 20 and 22 pt, and padding inside panels is 10 or 12 depending on the tab (lines 286-289).
5. **Too many text sizes:** 10, 11, 12, 13, 14, 15, 16, 17, 19, 20 and 22 px in one scene. Lock labels are 10 px (line 529).
6. **Hard boxes.** Every panel and button is a square-cornered `rectangle` with a 2 pt stroke. The dojo and cards elsewhere feel softer.
7. **Gear detail shoves the grid.** Picking a card adds a 64 pt detail block under the pager, which changes how many rows fit (`detailH`, line 583), so the cards jump.
8. **Sensei's Seal is small and squeezed.** The Seal and sundial radius is 16-24 pt (line 534), fitted into whatever height is left under the locks. Text wraps into `half - sr*2 - 16` (line 554), so on small phones it wraps into 3 lines next to a small circle.
9. **Some things loop forever:** the READY chip blinks forever (line 509) and the Blessing glow pulses forever (line 238). Endless blinking reads as "hurry" and adds noise.

## 2. Shared rules (apply to all three screens)

Put these in `apps/client/src/ui/theme.ts` as constants so every screen uses them. **[PLAN]**

- **Grid:** 8 pt. Spacing tokens: `S1 = 4` (only inside a line), `S2 = 8`, `S3 = 16`, `S4 = 24`.
  - Screen margin is 16. The gap between the left column and the panel is 16. Panel padding is 16 on every tab. The gap between cards is 8.
- **Tap size:** every tappable thing is **at least 44 × 44 pt**. If the drawing is smaller, give it an invisible hit area that big (`setInteractive(new Phaser.Geom.Rectangle(...))`).
  - Main action (ENTER THE TOWER) is 52 tall. Normal buttons and tabs are 44. Page arrows are 44 × 56.
- **Type scale (4 sizes + one title):**

  | Use | Size |
  |---|---|
  | Labels, small notes | 12 bold |
  | Body text | 14 |
  | Card titles, buttons | 17 bold |
  | Panel headings | 22 (Georgia, as today) |
  | Grade letters / big moments | as today |

  Nothing goes below 12. The `oneLine` minimums (9-10, lines 569-609) go up to 12, and long names cut with "…" instead.
- **Corners:** 10 pt radius on panels and cards and 8 on buttons, drawn with `Graphics.fillRoundedRect` (already used for the XP bar, line 254). Keep the 2 pt stroke.
- **Colours:** no changes. Use the same panel `0x221d2e`, deep panel `0x14121c` and gold `0xffd166`.
- **Motion tokens:**

  | Name | Time | Ease | Use |
  |---|---|---|---|
  | `PRESS` | 70 ms | `Cubic.Out` | press down: scale to 0.96, brighten fill 10% |
  | `RELEASE` | 140 ms | `Back.Out` | back to 1.0 on release |
  | `SWAP` | 180 ms | `Cubic.Out` | tab content and page change |
  | `SHEET` | 220 ms | `Cubic.Out` (in) / `Cubic.In` 160 ms (out) | Gear detail sheet |
  | `POP` | 220 ms | `Back.Out` | something earned or worn (same as Celebrations) |

  - **Reduced motion** (`game/motion.ts`): no scale or slide; just change the look instantly and fade over 120 ms.
  - Keep the scene fades as they are (400 in, 300 out).
- **Press feedback:** a new shared `button()` lives in `ui/button.ts` and HomeScene uses it.
  - On finger-down: scale 0.96 (`PRESS`) plus a soft tap sound (the existing `sfx.unlock()` path; Sfx owner picks the sound).
  - On finger-up inside the button: run the action, then `RELEASE`. If the finger slides off, cancel and go back to normal without acting.
  - Keep acting on finger-up (safer for kids than finger-down).
- **Redraw only what changed.** Split `render()` into:
  - `renderShell()`: background, left column and tab bar. Drawn on create and on resize.
  - `renderPanel()`: the panel contents only, in their own container.
  - Tab, page and gear taps only redraw the panel. This is a refactor of existing code, not a new system.
- **Endless loops off:**
  - The READY chip does one `POP` when the Gate tab opens, then stays still and bright.
  - The Blessing glow breathes slowly (2400 ms yoyo, alpha 0.25 to 0.15, no scale).
  - **[TASTE]** whether to keep any breathing glow at all.

## 3. Screen by screen

### 3a. Training Board (hub shell, left column and tabs)

| | Before (`HomeScene.ts`) | After |
|---|---|---|
| Header | Title 22 at y 12; "◀ Dojo" 84×30 at the column's right edge (230-232) | Title and ◀ Dojo on one 44 tall row at y 16. ◀ Dojo is 96×44 and a rounded button. |
| Character block | Uneven: cy = pad+58; name at cy-22, belt at cy (234-243) | 64 pt row: avatar at x 16, name 17 bold and belt 14 stacked, 4 pt apart, centred on the avatar. |
| Level + bar | Label 15, cap 11-12, 8 tall bar (249-256) | Label 14 bold and cap 12 on one line; bar 10 tall, radius 5; 8 below the label. When XP grows after a run, the bar fills over 400 ms `Cubic.Out` from the old value to the new (no sound loop). |
| Buttons | ENTER 46 tall; Practice room 30 tall (264-266) | ENTER 52 tall, radius 8. Practice room 44 tall. 8 apart. |
| Path card | Padding 7-10; text at 11 and 16 (293-315) | Padding 16, radius 10; "YOUR NEXT STEP" 12 bold gold; step name 17 bold; details 14. |
| Tabs | 4 separate 34 tall boxes, 6 apart; the active tab is just a different fill (279-282) | One 44 tall rounded tab bar. A gold underline 3 pt tall sits under the active tab and **slides** to the tapped tab in `SWAP` (180 ms). The labels stay; the active one is white, the others `#b9ad99`. |
| Tab change | Instant full redraw | The old content fades out over 90 ms, then the new content fades in and moves up 8 pt over 180 ms (`SWAP`). Taps are blocked for those 180 ms so a double tap can't stack. |
| Panel | Square, padding 10 or 12 (285-289) | Radius 10, padding 16 on every tab. |

### 3b. Gear tab (`renderGear`, 557-632)

| | Before | After |
|---|---|---|
| Worn slots | 3 boxes, 54 tall, 8 apart; slot name 11; icon 22 squeezed in a corner (559-571) | 3 cards, 72 tall, 8 apart, radius 10. Icon 32 on the left; slot name 12; item name 14 bold; stats 12. The whole card is tappable (shows that item in the sheet). |
| Bag cards | 42 tall, 6 apart; ▲▼= arrow 18 then icon then two lines (585-609) | **56 tall**, 8 apart, radius 10. Icon 36, then name 14 bold over `Hands · stats` 12, then the ▲ ▼ = mark on the **right** in a 28 pt circle (green, red, grey). |
| Picking a card | Detail block is added under the pager and the grid jumps (583, 624-631) | A **bottom sheet** slides up over the bottom of the panel in `SHEET` (220 ms); the grid never moves. The picked card gets a 3 pt gold outline and a `POP`. Tap the card again or tap outside the sheet to close it (160 ms). |
| Sheet contents | Two text lines, Wear 110×30, Let go 120×30 | Row 1: the item vs **Now wearing**, side by side (two mini cards with icons). Row 2: **Wear** (green, 44 tall, wide) and **Let go** (44 tall, quieter). Let go asks again inside the sheet ("Let it go?" with Yes / Keep) instead of renaming the button. |
| Wear | Instant redraw (719-725) | The slot card the item goes into does a `POP` and a short gold flash (off in reduced motion); the sheet closes; the bag re-sorts with a 180 ms fade. Same `sfx.insight()`. |
| Paging | 28 tall ◀ ▶ (617-622) | 44×56 arrows, the page dots in the middle (one 8 pt dot per page; the current one is gold). The new page slides 24 pt sideways over 180 ms. **[TASTE]** a scrolling list instead of pages (more code; pages are fine for small hands). |
| Empty bag | One line, 14 | Same words, centred in the panel, with a faint bag icon above. |

### 3c. Gate tab and Sensei's Seal (`renderGate`, 500-555)

| | Before | After |
|---|---|---|
| Heading | "The Gate to X" 19 and a READY chip that blinks forever (506-510) | Heading 22. READY chip: one `POP` when the tab opens, then still. |
| Locks | Up to 20 pt radius, labels 10 px, spacing = width ÷ n (514-530) | Radius 22 (smaller on tiny phones: at least 18). Labels 12, max 2 lines, centred. A lit lock keeps its halo but it is drawn once (no loop). |
| Sundial + Seal row | Squeezed under the locks; radius 16-24 from the leftover height; text wraps beside it (533-554) | Two **equal cards** side by side, each 50% of the panel width minus 8, at least 96 tall, radius 10. Each card has the circle (radius 28) on top-left and the title 17 bold plus one line of 14 beside it. The cards sit at the panel's bottom with 16 margin, so their place never moves. |
| Seal lit | Red circle with 師, gold stroke | Same look, plus a soft gold ring (4 pt, alpha 0.35) around it. The first time it is seen lit, it does one `POP` and a single bell (use the existing bow bell if Sfx agrees). Never repeats on later visits (use the `seen` snapshot, as rewardMoments does). |
| Seal not lit | "Lights when Sensei approves you to test." | Same words (they never guess a reason; keep that). Grey circle, no animation. |

### 3d. Last run and Abilities tabs (only the shared rules)

Apply the grid, the type scale, the corners, the 44 pt pager and `SWAP`. No layout change beyond that. This keeps the board consistent without growing this item.

## 4. Board items (for the Manager; the work board is not edited)

| ID | Owner | Task | Done when | Waits on |
|---|---|---|---|---|
| P-MENU-a | Programmer | Section 2: spacing, type and motion tokens in `theme.ts`; shared `ui/button.ts` with press feedback, 44 pt hit areas and slide-off cancel; reduced-motion path | Every HomeScene tappable is ≥44×44 (a test walks the scene's interactive objects); pressing any button shows the scale-down; reduced motion shows no scale or slide | nothing |
| P-MENU-b | Programmer | Split `render()` into shell and panel; the tab bar with sliding underline; `SWAP` on tab and page change | Tab taps redraw only the panel; the underline slides in 180 ms; a quick double tap never draws two panels | P-MENU-a |
| P-MENU-c | Programmer | Section 3a hub left column (header row, character block, bars, buttons, Path card) | Matches the 3a table on 667×375 and 932×430 screenshots | P-MENU-a |
| P-MENU-d | Programmer | Section 3b Gear: bigger cards, bottom sheet, Wear pop, Let go confirm in the sheet, page dots | Picking a card never moves the grid; Wear pops the slot; screenshots on 667×375 and 932×430 | P-MENU-b |
| P-MENU-e | Programmer | Section 3c Gate: lock sizes, equal sundial and Seal cards, first-lit Seal pop once, no endless blinking | The Seal card never wraps past 2 lines on 667×375; the READY chip and lit locks don't loop | P-MENU-b |
| P-MENU-f | Sfx owner | Pick a soft tap sound for press and say whether the bow bell is OK for the first lit Seal | Sounds named in decisions.md | P-MENU-a |
| P-MENU-g | Tester | Before and after phone check, small and large phones, reduced motion on and off | Notes posted; no tap missed by a 6-year-old in 10 tries per control | P-MENU-c, d, e |
| P-MENU-h | Jay | The taste calls below | Answers in decisions.md | this PR |

## 5. Taste calls for Jay (DECIDE)

1. **Rounded corners** (10 pt on panels, 8 on buttons) instead of square boxes. Recommended: yes.
2. **Gear paging:** keep pages (with dots) or switch to a scrolling list. Recommended: keep pages for now.
3. **Breathing glow** on Dojo Blessing: keep a slow, quiet breath, or make it fully still. Recommended: slow breath.
4. **Tap sound** on every button press, or silent presses with sound only on Wear and big moments. Recommended: a very soft tap.
5. **Fonts:** the style guide suggests Fredoka and Nunito (`docs/style-guide.md` section 9, still Jay's choice). This plan works with the system font; a font switch would be a separate item.

## Flags

- I haven't measured how it feels on a device. The timings come from what the game already uses (`Back.Out` 220 ms, fades 260-400 ms) and should be checked in P-MENU-g.
- `panelBottom()` (line 377) hard-codes 16 + 46 + 10. With the new tokens it must read the real panel top, or Personal bests will sit in the wrong place.
- The hidden testing screen (5 taps on the title, line 652) must keep working after the header changes. Keep the title as its own hit area.
