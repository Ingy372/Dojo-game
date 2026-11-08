# R-BENCHMARK: Training Board and gameplay, held up against five hit games

Status: plan for Jay, the Artist, the Programmer and the Content Designer. No game code or work board changed.
Labels: **[SHOT]** seen in a screenshot I took, **[CODE]** read from main (`00c5bf6d`), **[SOURCE]** said by a page I opened this pass, **[OBS]** my own observation or reading, not proven, **[LINK]** a link I found but could not open this pass.

## Delivery Note
- **ITEM:** R-BENCHMARK, Jay's Nov 1 bar: the Training Board and the moment-to-moment play must be on par with or better than Archero, Slay the Spire, Pokémon, Survivor.io and Club Penguin, or they fail inspection. Jay has no time to test, so this pass replaces his look.
- **WHAT:** 10 screenshots of today's game, a scorecard (§2), a Board redesign spec (§3, 8 items), a ranked list of play and look items (§4, 9 items), the ideas I skipped on purpose (§5), scope risk against Dec 15, 2026 and April 2027 (§6), and 6 taste calls for Jay (§7).
- **WHY:** Honest grade today: the Board is **behind** (small hero, 9 identical dots, 3 of 4 tabs in dark colours that don't match the warm wood). Play feel is **on par** on the basics (hit-stop, shake, telegraph, one-finger controls) and **behind** on readability, reward polish, haptics and look.
- **DECIDE:** T1 to T6 in §7. Only T1 (bigger hero) and T3 (phone buzz) change what the game feels like; the rest are small.
- **NEXT:** Artist and Programmer start B1 to B4 (beta-critical Board items). Programmer starts G1 (counter readability). The Manager puts the items on the work board; I did not touch `docs/work-board.md`.

## Update — Jay, Nov 8, 2026 (J26)

- **T1:** try the zoom. The test values already written in G3 stay (1.0, 1.15, 1.25). No zoom is chosen. No new number.
- **T2:** the GREAT popup gets smaller after the first one in a room. The sizes already written in G1 stay. No new size.
- **T3:** vibration is a question for playtesters. The placeholder is light, on by default, with an off switch. No new strength.

---

## 0. How I judged, and what I could not see
- **Screenshots** (in `docs/shots/r-benchmark/`): Playwright with Chrome, 844×390 landscape, test student "4-green-belt", motion slider off. Board: all tabs (Last run, Gear, Abilities > Trophy Case and Fighting Style, Gate). Play: a 30-frame Tower fight, with the GREAT! moment, plus the Insight picker. Re-run the same way after the builds to compare.
- **Limits:** one phone size only. The Last-run data is test data, so numbers are fake (the dots are plain on purpose: grade letters are hidden outside Challenge, Q-PREM-GRADE). I did not capture Guardian or boss fights, the Home Dojo walk-around or the Town. Those are **not graded** here. Haptics and sound cannot be seen in a screenshot, so I read code for those. The Board shots show 3 browser "404" console lines; I did not trace them and I make no claim from them.
- **Sources:** I opened Archero (Game Developer), Slay the Spire map (Hexagarden), Survivor.io (Naavik) and Pokémon XY UI (eev.ee) in full. The rest are search results or earlier planning docs. The Club Penguin wiki page returned 403 to me, so Club Penguin grades are **[OBS]** plus the older `R-TOWN-CLUBPENGUIN.md`. Reddit and Fandom pages are lower trust.
- **Stale doc:** `docs/work-board.md` is from Oct 25. I used `docs/decisions.md` and `docs/progress.md` for what is decided.

## 1. Rules I kept
- Ages 6+, hopeful. No purchases, ads, chat, loot boxes, streak punishment or pressure. See §5 for ideas I dropped for that reason.
- No Great Counter camera kick (decided). Hit-flinch stays on the motion slider (R-PREMIUM-c). Every new moving effect below has a **reduced-motion version** (it shows the end state at once).
- Particles and sound may slip past Dec 15 (decided). They are marked, not hidden.
- Warm dojo wood is the Board mood (Jay's D1 pick, mood A).
- No new tuning numbers are proposed, so `balance-check` does not apply.

---

## 2. Scorecard: copy these, grade us
Grade = **on par**, **behind**, or **ahead** of the best of the five at that one thing.

| # | Technique | Who does it (source) | Dojo Ascent today | Grade |
|---|---|---|---|---|
| 1 | The map is readable at a glance: each room type has its own **shape and colour** | Slay the Spire's map is criticised for the opposite: small symbols "none of which are distinct in either size or color", so it needs a legend, "a design smell". Cobalt Core fixed it with colour-coded icons: cool-blue fights, warm-purple elites, red-hot bosses [SOURCE: [Hexagarden](https://www.thehexagarden.com/blog/lets-make-a-map-1)] | Last run shows **9 identical brown dots** [SHOT `board-lastrun`] | **Behind** |
| 2 | A sense of climbing and a place: each zone has its own look; a rising feel between floors | Same article: Spire gets no rising animation and little sense of the tower; Cobalt Core's backdrop changes by zone [SOURCE: Hexagarden] | The Tower has no map or ascent view. Rooms are one pale tile floor [SHOT `fight-early`, `fight-great`] | **Behind** |
| 3 | Short rooms, then a break, then a pick | Archero: intro, 4 enemy stages, an angel (pick), 4 more, boss; each under about a minute; "tension upon entering then release" [SOURCE: [Game Developer, Finding the Fun: Archero 1](https://www.gamedeveloper.com/design/finding-the-fun-archero-part-1---gameplay)]. Naavik adds that splitting combat into rooms "provided a more substantial feeling of progression" than Survivor.io's one long timer [SOURCE: [Naavik](https://naavik.co/deep-dives/survivorio-archeros-footsteps/)] | Rooms, then one Insight pick per room, doors, Guardian [CODE `tower.ts`, core-design §13] | **On par** |
| 4 | Pick 1 of 3 after a fight | Archero: choice of three, random each time [SOURCE: Game Developer]. Survivor.io: level-ups give new abilities [SOURCE: Naavik] | Insight picker, 3 cards [SHOT `insight-picker`] | **On par** in idea, **behind** in polish (flat navy cards, off-mood, no reveal, no list of what you already hold) |
| 5 | See the attack before it lands | Archero ranged enemies show "a red line… for a few seconds before the attack" [SOURCE: Game Developer]. Slay the Spire added enemy intent icons after testers were confused by hidden behaviour [SOURCE: [Ars Technica](https://arstechnica.com/gaming/2019/05/video-slay-the-spire-is-a-friendly-game-of-death-but-it-was-hard-to-get-it-right/), via search summary] | Red ground ring plus "!" icon above each attacker, counter window 10/6/4 ticks by difficulty [SHOT `fight-great`, CODE] | **On par** |
| 6 | One-finger control, aim for you | Archero and Survivor.io: "controlled by one finger, use auto-aim" [SOURCE: Naavik] | Stick appears under the left thumb; Strike, Counter, Dash, Virtue, Stance buttons on the right [SHOT `fight-great`, CODE `TouchControls.ts`] | **On par** (5 buttons is more than they have; fine for a counter game) |
| 7 | Hit-stop and shake that feel good | Juice talks and Sakurai on hit-stop: [GDC Juice It or Lose It](https://gdcvault.com/play/1016789/Juice-It-or-Lose), [Vlambeer on action games](https://www.gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games), [Sakurai Famitsu col. 490](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/) [LINK] | `FEEL` table: hit-stop and shake per hit type, all through the motion slider [CODE `GameScene.ts:159-167`] | **On par** (cannot judge by still shots; needs a play pass) |
| 8 | Numbers you can read | Archero-style damage numbers: **[OBS]** they are short, one per hit, and spread out | Floating numbers pile up in one spot ("28 / 24 / 11" ghosted over the "!" icons) and the **GREAT! banner sits on top of the hero and the telegraph** [SHOT `fight-great`] | **Behind** |
| 9 | Phone buzz on hits | Capacitor has it ready: `Haptics.impact({style})` and `Haptics.notification({type})` [SOURCE: [Capacitor Haptics docs](https://capacitorjs.com/docs/apis/haptics), via search summary] | None. No haptics code in `apps/client/src`; `@capacitor/haptics` is not in `package.json` [CODE] | **Behind** |
| 10 | Rewards you collect | Survivor.io: dead enemies drop XP dots you walk over; "collecting that XP… is a crucial dynamic" [SOURCE: Naavik] | Freed monsters give a star burst ("set free"); XP is banked at the end of the run [CODE `setFree`, `bankRun`] | **Behind** on a pickup moment; **ahead** on tone (no killing). See T4 |
| 11 | Mark the moment you beat your best | Naavik: it "would greatly help to mark the moment when you pass the previous high score"; Archero shows progress as a clear number [SOURCE: Naavik] | New bests are tracked and flagged on the Board (`newBests`) [CODE `ui/lastRun.ts`]. Nothing during the run | **Behind** in-run, on par after |
| 12 | A hero-first player card | Club Penguin player card and Pokémon trainer card put the avatar first: **[OBS]** from memory of both games; CP wiki page [LINK](https://clubpenguin.fandom.com/wiki/Player_Card) could not be opened; older notes in `R-TOWN-CLUBPENGUIN.md` | Hero is about 50 px tall in the left column, next to small text [SHOT `board-lastrun`] | **Behind** |
| 13 | Icons next to labels, group icons for scanning | Pokémon XY players complained when item icons and group icons were removed from the bag [SOURCE: [eev.ee](https://eev.ee/blog/2013/10/17/xy-ui-nitpicks/)] | Tabs are text only: "Last run", "Gear (0)", "Abilities", "Gate". Trophy Case and Gear slots do use icons [SHOT] | **Behind** on tabs, **on par** inside Trophy Case |
| 14 | One material, one mood | Club Penguin and Pokémon keep one look across menus: **[OBS]** | Last run is cream paper in a wood frame (good). Gear, Gate, the Next-step card and Practice room button are **dark brown or navy** [SHOT `board-gear`, `board-gate`, `board-lastrun`] | **Behind** (warm frame **on par**) |
| 15 | Sound on every key moment | Kenney impact sounds as the base (decided) [LINK: [kenney.nl](https://kenney.nl/assets/impact-sounds)] | `sfx.json` has files for 13 events (hit, strike, block, whoosh, dash, tap, chest, loot0-2, insight, levelUp, promotion). **Great Counter, hurt, wind-up, enemy-down, room-clear, grade** are code-made tones [CODE `Sfx.ts`] | **Behind** (can't hear it here; **[OBS]** from the file list) |
| 16 | No pause fatigue | A Survivor.io Reddit thread complains of too many pauses [LINK, low trust](https://www.reddit.com/r/Survivorio/comments/147l3po/) | One Insight pick per room [CODE] | **Ahead** |
| 17 | Gentle for little kids | Not a feature of any of the five | Guided / Standard / Challenge windows, no streak or energy, "Learn this at the dojo" locks, real belt gates [CODE, decisions.md] | **Ahead** |
| 18 | Hero big enough to love | Archero and Survivor.io show a large, bright hero; Survivor.io zooms out for crowds [SOURCE: Naavik for the zoom]; Archero's maps "fit within a phone screen" so you see every enemy [SOURCE: Game Developer] | Hero about 45 px tall on 844×390; room is wide [SHOT `fight-great`] | **Behind** on presence (taste call T1) |

**Reading the table:** 5 behind-on-look gaps cluster on the Board (rows 1, 12, 13, 14, plus 2). On play, the core loop is on par; the gaps are readability (8), polish (4), phone feel (9, 15) and presence (18).

---

## 3. Board redesign (do first)
The Board is `HomeScene`. This builds on the earlier `P-MENU2-training-board-redesign.md` (Scroll of the Climb, Trophy Case, Fighting Style, Gear paper-doll) and does not replace it. Where an item below overlaps a P-MENU2 item, **P-MENU2 stays the owner of the detail** and this item sets the bar a tester checks.

### 3.0 The picture
One glance on the Board must answer four things: **who am I** (big hero, belt, name), **how far to the next step** (level bar with a visible fill), **what do I do now** (one big ENTER THE TOWER, then my next belt step), **what did I earn** (climb strip and reveal).

Layout at 844×390 (and 667×375, 932×430):
- **Left, about 36% wide, the "stage":** hero stands on a mat in front of the wood wall, as big as fits (target at least 96 px tall, about 2× today). Name and belt on one wood sign under the hero. Level bar under that, with a **visible fill and a label** ("Level 1 · 0 of 40" reads as an empty black slot today). ENTER THE TOWER is the only orange thing on the screen. Practice room and Next step are wood/paper, smaller.
- **Right, the wall:** icon + label tabs (B3), all panels paper-on-wood (B2). First tab is the Climb (B4).
- **Corner:** Sensei with one hopeful line (B7), only after a run.

### Items (each: one owner, a Done-when a tester can check from screenshots, waits-on, beta flag)

**R-BENCH-B1 · Hero stage (left column)** · Owner: **Artist** (mat, wall light, sign, hero crop) then **Programmer** (layout, level-bar fill, idle) · **Beta-critical**
- Do: hero at least 96 px tall, standing on a mat; belt colour and stripes shown on the belt; name and belt on one wood sign; level bar fill visible at 0 and a "x of y" label; hero idle breathes (a still pose under reduced motion).
- Done when: at 844×390 the shot shows the hero at least 96 px tall, the level bar has a colour fill or a clear empty-track style plus a label, and nothing overlaps at 667×375 and 932×430. Reduced motion on: hero is still.
- Waits on: Artist checks that the hero sprite holds up at 2×. If not, they redraw the pose (adds Artist time). Taste call **T1**.

**R-BENCH-B2 · One material on every tab** · Owner: **Artist** (paper and wood tokens) + **Programmer** · **Beta-critical**
- Do: replace the near-black Board background with the warm wood wall. Gear, Abilities and Gate interiors use the same cream paper as Last run. Practice room button and Next-step card move from navy to wood and paper. Keep the family colours (Rooted blue, Flowing green) as small ribbons only.
- Done when: the 5 tab shots side by side show one paper tone inside one wood frame, and no navy or near-black block bigger than a button remains.
- Waits on: nothing. Uses P-MENU-a tokens.

**R-BENCH-B3 · Icon tabs with a "new" dot** · Owner: **Artist** (4 icons: scroll, bag, belt-star, gate) + **Programmer** · **Beta-critical** (cheap)
- Do: each tab gets an icon (at least 24 px) and a label. Remove "(0)". A small gold dot means "something new for you" and clears when the tab is opened. No numbers, no red, no daily nag.
- Done when: shot shows 4 icon+label tabs; with a new item the right tab has a dot; after opening it, the dot is gone; zero items shows no count.
- Why: [SOURCE: eev.ee] icons help players scan lists; row 13.

**R-BENCH-B4 · Tower Climb strip (replaces the 9 dots)** · Owner: **Artist** (5 room icons) + **Programmer** · **Beta-critical**
- Do: each room shows an icon with its **own shape and colour**: fight, chest, shrine, door pick, Guardian. Filled means cleared, a ring means not reached. A rising "step" line under the strip so it reads as a climb. Same icons later reused in the in-run HUD (G6).
- Done when: shot of Last run shows at least 4 different icon shapes, each readable at 30 px, and the colours still tell apart in greyscale (shape does the work). Legend is not needed.
- Why: rows 1 and 2; Hexagarden's lesson is size, shape and colour, with no legend.
- Waits on: P-MENU2 "Scroll of the Climb" art. This item sets its icon rule.

**R-BENCH-B5 · Reveal, one thing at a time** · Owner: **Programmer** · Beta if capacity
- Do: after a run, "Found" items and "New for you" cards pop in one by one (about 0.25 s apart) with the existing `loot` sound; "Again!" shows once the last one lands; a tap skips the wait. **Reduced motion:** everything appears at once.
- Done when: a 3-frame shot at 0.3 s, 0.6 s and 0.9 s shows items arriving one by one; with motion off the first frame already has them all.

**R-BENCH-B6 · Gear: a welcome, not a blank** · Owner: **Artist** (ghost slot art) + **Programmer** · Beta if capacity
- Do: with an empty bag show the three worn slots as ghost shapes with "Find your first gear in the Tower" and a chest icon; the picked item gets a gold border and a small lift; newest items first.
- Done when: empty-bag shot has the ghost slots plus the line and no dark text-on-dark. A shot with 2 items shows the newest first and one selected with a gold border.

**R-BENCH-B7 · Sensei corner line** · Owner: **Content Designer** (at least 12 lines) + **Programmer** (place) · Post-beta is fine
- Do: after a run, Sensei says one sentence picked from the run ("Seven Great Counters. Nice timing!"). Rules: never mention missed days, losses or what you "should" do; short words.
- Done when: 12 lines pass the kid-safe check (no pressure words); a shot after a run shows the line; none after a fresh start.
- Waits on: Sensei portrait exists in the Gate card [OBS]; Artist confirms it fits a small bubble.

**R-BENCH-B8 · Type and touch pass** · Owner: **Programmer** · **Beta-critical**
- Do: body text on the Board at least 14 px; captions at least 12 px; every tab, card and button has a 44-pt hit area (the repo's `ui/button.ts` promises this; P-MENU2 recorded tabs as 34 px tall, so check).
- Done when: a tap test at 667×375 hits each tab with a 44-pt target; the shots show no text under 12 px.

---

## 4. Play and look, ranked by impact
Ranked by how much a first-time viewer would notice in the first 30 seconds. Each: owner, Done-when, waits-on, beta flag.

**1. R-BENCH-G1 · Counter and number readability** · **Programmer** · **Beta-critical**
- Today: the GREAT! banner is big and sits **over the hero and the telegraph**; floating numbers stack in one spot [SHOT `fight-great`].
- **Jay, Nov 8 (J26, T2):** yes. The big GREAT shows the first time in a room. After that, the popup gets smaller. The sizes already written below stay. No new size.
- Do: shrink GREAT! to a quick pop above the hero's head (about a third of today's size, gone in about 0.5 s) and keep the large version for the **first Great of a room** only; put combo and "GREAT x2" in the top strip (already there). Offset each damage number a little left or right and fade older ones sooner; cap at 3 on screen; bigger and warmer for a Great, plain for a normal hit. No camera kick (decided). **Reduced motion:** no pop scale, just a short fade.
- Done when: in a play pass at 844×390, during a Great Counter you can still see the hero, the "!" icons and the red ring in every frame of the 30-frame capture; no more than 3 numbers are readable at once.

**2. R-BENCH-G2 · Insight picker, dressed and clear** · **Artist** (card frame, pick flourish) + **Programmer** · **Beta-critical**
- Today: flat navy cards with a blue/green top strip; the HUD behind shows through; no sign of what you already hold [SHOT `insight-picker`].
- Do: warm paper cards in the wood mood (B2), with a coloured family ribbon; cards slide in one by one; a tapped card lifts and stamps, with a star burst and the `insight` sound; a small row of the Insights taken **this run** under the cards. One pick per room stays (row 16).
- Done when: shot shows paper cards, the family ribbon, and a row of held Insights after the first pick; a 3-frame shot of a pick shows lift, stamp, close. Reduced motion: no slide, no lift, just a highlight.
- Waits on: B2 tokens.

**3. R-BENCH-G3 · Hero and enemy presence** · **Programmer** (a zoom value) + **Artist** (outline and ground shadow check) · Taste call **T1**, decide by **Nov 24** to keep Dec 15 safe
- Today: hero about 45 px tall; Archero's rooms "fit within a phone screen" so every enemy is visible [SOURCE: Game Developer]. We must keep that.
- **Jay, Nov 8 (J26, T1):** try the zoom. Do not pick a winner yet.
- Do: a single camera zoom value, test 1.0, 1.15 and 1.25 at 844×390 and 667×375; pick the biggest that keeps all attackers and the telegraph on screen. Those three values are the test already written. No new zoom number. Check the dark outline reads on the pale floor.
- Done when: three side-by-side shots at the same moment, and a play pass where Jay or the Manager picks one. The chosen zoom never clips an attacker's "!" icon at the smallest phone size.
- Waits on: the try-out, then a pick. Do not ship without a phone look.

**4. R-BENCH-G4 · Sounds for the key moments** · **Programmer** (wire) with picks from Kenney CC0 · May slip past Dec 15 (decided)
- Do: add file-backed sounds for Great Counter, hurt, wind-up, enemy-down, room-clear and grade, using the same `sfx.json` path as the other 13. Keep the code tones as the fallback.
- Done when: `sfx.json` has an entry for each of the 6; a play pass has no silent key moment; volume slider still scales all of them. Jay or the Manager approves the six sounds by ear (T5).
- Waits on: the sound picks.

**5. R-BENCH-G5 · Phone buzz** · **Programmer** · Beta-nice; playtesters decide if it stays
- **Jay, Nov 8 (J26, T3):** vibration is a playtester question, not a yes. The placeholder is light, on by default, with an off switch. No new strength. The earlier Light / Medium / Warning list is not this answer.
- Do: add `@capacitor/haptics` as a placeholder only. One light buzz. A Settings switch "Vibration", on by default. The off switch stops it. No-op on the web build.
- Done when: a test shows the light buzz fires when the switch is on and never fires when it is off; playtesters say whether the buzz stays. A screenshot cannot show it.
- Waits on: one real phone, then the playtester answer.

**6. R-BENCH-G6 · Climb pips in the HUD** · **Artist** (reuse B4 icons) + **Programmer** · **Beta-critical** (cheap)
- Today: small text "Room 1 of 8 · Wave 3 of 3" at top right [SHOT].
- Do: a row of the B4 room icons across the top: cleared filled, current glowing, rest rings. Rising feel: the current icon bobs up one step when you clear a room. **Reduced motion:** no bob.
- Done when: a mid-run shot shows the pip row with the right fill; clearing a room advances it; at 667×375 it does not overlap the boss bar or the item name.
- Waits on: B4 icons.

**7. R-BENCH-G7 · Room mood** · **Artist** · Vignette is beta; the rest is **post-beta**
- Today: one pale tile floor [SHOT].
- Do: 3 floor tints by Tower tier (warm, cool, dusk), a soft edge vignette, and 4 to 6 small props per tier at the walls, none in the fighting space. Cobalt Core's changing zone backdrop is the model [SOURCE: Hexagarden].
- Done when: three shots from three tiers look clearly different at a glance and the "!" icon and red ring still stand out on every floor (checked in shots).

**8. R-BENCH-G8 · One shared particle emitter** · **Programmer** · May slip past Dec 15 (decided)
- Do: replace the hand-made tween sparks with one pooled emitter used for hit sparks, dash dust and set-free stars; the pool caps at a fixed count. **Reduced motion:** fewer, shorter, no screen-wide bursts.
- Done when: no frame-time rise on a mid-range phone in a swarm room (one number from the profiler), and the hit and set-free shots look the same or better.

**9. R-BENCH-G9 · Spirit spark pickup** · **Programmer** + **Artist** · Post-beta · Taste call **T4**
- Do: when a monster is set free, a small gold star floats toward the combo counter. No pause, no count to chase, no timer.
- Done when: a shot sequence shows the star leaving the freed monster and landing at the counter; with motion off it just pops.
- Why: Survivor.io's XP dots [SOURCE: Naavik]. We take only the "feel", not the grind.

---

## 5. Ideas I skipped on purpose
- **Archero energy timers, ad rewards, gem chests, wheel of fortune for coins, devil deals that cut max HP** (the devil takes health for power; this is a pressure trade). Rules: no purchases, ads, loot boxes or pressure. Source for the money side: [Finding the Fun: Archero 3, Monetization](https://www.gamedeveloper.com/design/finding-the-fun-archero-part-3---monetization).
- **Survivor.io gacha and the 15-minute run** [SOURCE: Naavik]: a gambling-style meta and a long forced session. Rooms stay short.
- **Any streak, daily chain or "come back or lose it" pressure** from any of the five.
- **Great Counter camera kick**: decided no. G1 uses a small pop instead.
- **Slay the Spire's branching map as a screen between rooms**: Spire's map exists for deck planning; our door pick already gives the choice. I use the *icon rules* (B4) but not a new map screen. Revisit after beta if players ask for planning.

## 6. Scope risk
Dates: beta **Dec 15, 2026**; launch **April 2027**.

| Item | Beta-critical? | Size (my guess, **[OBS]**) | Risk |
|---|---|---|---|
| B1 hero stage | **Yes** | M | Hero art at 2× may need redrawing. Jay, Nov 8, said try the fight zoom. The Board 2× size is still a proposal |
| B2 one material | **Yes** | S-M | Low; reuses tokens |
| B3 icon tabs | **Yes** | S | Needs 4 icons; low |
| B4 climb icons | **Yes** | M | 5 icons; blocks G6 |
| B8 type and touch | **Yes** | S | Low |
| G1 counter readability | **Yes** | S-M | Low; code only |
| G2 Insight picker | **Yes** | M | Needs B2 first |
| G6 HUD pips | **Yes** | S | Needs B4 icons |
| G3 presence / zoom | Try it (Jay, Nov 8). The pick is still open | S code, test time | Clipping at small phones; needs a phone look. Test values stay 1.0, 1.15, 1.25 |
| B5 reveal, B6 gear welcome | If capacity | S each | Low |
| G5 haptics | If capacity | S | Placeholder only (light, on, with an off switch). Playtesters decide if it stays. Needs a real phone |
| G4 sounds, G8 emitter | May slip (decided) | M | Fine to slip; code fallbacks exist |
| B7 Sensei line, G7 room mood (beyond vignette), G9 spark | Post-beta | M | Content and art time |

**Order I would build:** B2, B3, B4, B8 (Artist icons first) in week 1; G1 in parallel; B1 and G6 next; G2 after B2. That is eight beta-critical items; seven of them are small or medium.

## 7. Taste calls for Jay
- **T1 · Bigger hero, on the Board and in play?** **Jay, Nov 8: try the zoom.** Today about 50 px (Board) and 45 px (fights). The fight test stays 1.0, 1.15 and 1.25. No zoom is chosen. The Board's 2× hero (at least 96 px in B1) was not separately answered, so it stays a proposal.
- **T2 · How loud is GREAT!?** **Jay, Nov 8: the GREAT popup gets smaller after the first one** in a room. The sizes already in G1 stay. No new size.
- **T3 · Phone buzz?** **Jay, Nov 8: this is a playtester question.** The placeholder is light, on by default, with an off switch. No new strength.
- **T4 · A star that floats to the counter when a monster is set free?** Cute and clear, but one more thing to look at. My pick: post-beta.
- **T5 · Who picks the six new sounds?** I suggest Jay or the Manager listens and says yes or no; Kenney CC0 first (decided).
- **T6 · Room mood.** Warm, cool, dusk floors by Tower tier. Do you want the Tower to look different as you climb, or the same tidy dojo floor all the way? My pick: different.

## 8. Links to related plans
`P-MENU2-training-board-redesign.md` (Board detail), `R-PREMIUM-audit.md` (earlier polish list), `S8-similar-games.md` (earlier game comparison), `R-TOWN-CLUBPENGUIN.md` (Club Penguin notes).

## 9. Screenshots (`docs/shots/r-benchmark/`)
`board-lastrun`, `board-gear`, `board-gate`, `board-trophies`, `board-style`, `dojo`, `fight-early`, `fight-great`, `fight-contact-sheet`, `insight-picker` (all `-844x390.jpg`). Method: Playwright + Chrome, test student `4-green-belt`, motion off. Repeat after each build.

## 10. Sources
- Archero: [Game Developer, Finding the Fun 1](https://www.gamedeveloper.com/design/finding-the-fun-archero-part-1---gameplay) (opened); [Part 3, monetization](https://www.gamedeveloper.com/design/finding-the-fun-archero-part-3---monetization) (link only).
- Slay the Spire and maps: [Hexagarden, Let's Make a Map](https://www.thehexagarden.com/blog/lets-make-a-map-1) (opened); [Ars Technica video note](https://arstechnica.com/gaming/2019/05/video-slay-the-spire-is-a-friendly-game-of-death-but-it-was-hard-to-get-it-right/) and [Game Design Lab on intent](https://teemo.dev/game-design/slay-the-spire/systems/combat-energy-block-and-enemy/) (search summaries; the second is a fan-run site, lower trust).
- Survivor.io: [Naavik](https://naavik.co/deep-dives/survivorio-archeros-footsteps/) (opened).
- Pokémon: [eev.ee, XY UI nitpicks](https://eev.ee/blog/2013/10/17/xy-ui-nitpicks/) (opened).
- Club Penguin: [Player Card wiki](https://clubpenguin.fandom.com/wiki/Player_Card) (403, not opened), plus `R-TOWN-CLUBPENGUIN.md`.
- Feel: [GDC Juice It or Lose It](https://gdcvault.com/play/1016789/Juice-It-or-Lose), [Vlambeer](https://www.gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games), [Sakurai on hit-stop](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/) (from `R-PREMIUM-audit.md`, not re-opened).
- Haptics: [Capacitor Haptics docs](https://capacitorjs.com/docs/apis/haptics) (search summary).
- Sound: [Kenney impact sounds](https://kenney.nl/assets/impact-sounds).
