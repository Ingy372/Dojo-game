# Dojo Ascent — Work Board

Last updated: 2026-10-26 4:00 PM EDT by Dojo-ascent Manager. Catch-up covers PRs #62–#319.

**What this file is:** the one list of open work. Every bot and Dojo-Ascent Programmer reads it. Each item has an ID, one owner, and what it's waiting on. Work only on items with your role as owner, in the order listed, and skip any item that is still waiting on something. Put the item ID (for example S2) in your Delivery Note.

**How it stays current:** Jay marks items done or changes them here. Decisions go into `docs/decisions.md`. If this file and `docs/decisions.md` disagree, `docs/decisions.md` wins.

**Owners:** Jay · Dojo-Ascent Programmer · Dojo-Ascent Researcher & Planner (drafts/planning/) · Learning & Engagement Designer · Content Writer · Art Director · QA & Playability Tester · DojoForge (outside this repository).

---

## 0. Jay decided Oct 25
- Launch is now a **Dec 15, 2026 beta for 5-10 tester families**; the store launch comes later (mid-January target, D-B4). Plan: `drafts/planning/BETA-DEC15-plan.md` (PR #232; replan PR #230).
- D1-D8 picks accepted (and the beta D-B1 to D-B5 picks).
- Faith direction approved; verse picks merged (C13-F, PR #229; cleanup PR #231).
- Menu polish: "make it feel premium", with the planner's picks; Jay fixes anything on inspection.
- Walk: Jay keeps the original walk. PR #199 samples closed (J14, A-WALK done).

## 0a. Dec 15 Beta (from `drafts/planning/BETA-DEC15-plan.md`)
| ID | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| B-ACCT | Jay | Ask Nic if Tarnished Labs has Apple Developer and Google Play **organization** accounts. Get access, or enrol new ones. | Jay can sign in to App Store Connect and Play Console and see the team. | — |
| B-LAW | Jay | Book the lawyer. Show them the parent note and privacy page. | A meeting date is on Jay's calendar, and the lawyer's notes are in `jay/`. | — (B-DOCS done, L4 fixes #240) |
| B-WRAP | Dojo-Ascent Programmer | **Merged (PR #243, Node 22 in #245; placeholder app id `com.placeholder.dojoascent`). Jay's phone check comes with the first B-CI build.** Capacitor 8 wrap (M8-a): landscape, safe areas, pause in background. | The Android build installs on Jay's phone, plays a full floor, and resumes after switching apps. | — |
| B-CI | Dojo-Ascent Programmer | Cloud builds: GitHub Actions makes a signed iPhone build (macOS runner) and Android build. | A push makes both builds, and they show up in TestFlight and Play internal testing. | B-ACCT, B-WRAP |
| B-BELT | Dojo-Ascent Programmer | **Done (PR #246, merged Oct 25; QA evidence on bot-qa).** Grown-up belt entry (D2), behind the grown-up gate. Plays the real reward moments. | A tester enters "Yellow, 2 stripes" after the gate question. The game shows Yellow, unlocks the right things, and still shows it after restarting. | — |
| B-SAFE | Dojo-Ascent Programmer | **Done (PR #249, merged Oct 25).** Kid-safety items: outside links behind the gate, a wipe-data button, a "saved on this phone" note. | Every outside link asks the gate question first. Wipe returns to a fresh start. The note shows on first launch. | — |
| B-MENU | Dojo-Ascent Programmer | **Done (P-MENU-a to f merged Oct 25).** P-MENU-a to e. | Every button is at least 44 pt, shows press feedback, and the grid doesn't jump (P-MENU checks). | P-MENU-a (#228), P-MENU-b to e |
| B-ART3 | Dojo-ascent Artist | **Samples approved and merged (#241, #242). Full set delivered: enemies #244, Hearth Cook Guardian #247, Ember Kitchens rooms #248; Jay approved Oct 25; all merged.** Tier 3 (Orange) room art, enemies and Guardian. | The art files are in `incoming-art/` and approved by Jay **by Nov 20**. | — |
| B-T3 | Dojo-Ascent Programmer | **Done (PR #278; tuning #279, #280, #282 at 549/17; boss levers #285). Supper Rush 90 s (#275).** Import tier 3, or set the "next floor opens soon" note. | An Orange-belt profile plays tier 3 to its Guardian, or sees the note if B-ART3 slipped. | — |
| B-DOCS | Dojo-Ascent Researcher & Planner | **Delivered (PR #236, merged Oct 25).** Parent beta note (one page), privacy page draft, TestFlight beta description, feedback email text. | All four drafts are in `drafts/planning/` for Jay and the lawyer. | — |
| B-TESTERS | Jay | Pick 5–10 families. Collect each parent's Apple email (iPhone) or Google email (Android), plus their OK. | A list with names, phone type, email and an OK for each family. | — (B-DOCS done) |
| B-BETAREV | Dojo-Ascent Programmer | Send the first build to TestFlight external testing (Beta App Review). | App Store Connect shows the build "Approved" for external testing. | B-CI, B-DOCS |
| B-QA | Dojo-Ascent Game Logic/systems Tester | Full beta pass on a small and a large phone, both platforms (or web). | A QA report says READY with no blocking bugs. | B-T3-TUNE-2 done (B-BELT, B-SAFE, B-T3 done) |
| B-T3-TUNE-2a | Dojo-Ascent Programmer | **Done (PR #285).** Pot lid blocks hits while sparks are out (from 66% health), rolling pin every phase. | As in `drafts/planning/B-T3-TUNE-2-boss-levers.md` (PR #284). | — |
| B-T3-TUNE-2c | Dojo-Ascent Programmer | **Done (PR #285).** About 1 s hold at 66% and 33%. | As in the plan. | — |
| B-T3-TUNE-2b | Dojo-Ascent Programmer | **Done (PR #309, merged Oct 25, 11:42 PM, after QA passed).** The #299 art is in the game. Empty lid frames are intentional (the body hides the lid). Possible later item: lid visible from behind, which would be Jay's choice. | Screenshot: lid up with sparks out; Reduced motion keeps the lid icon. | — |
| B-T3-TUNE-2b-art | Dojo-ascent Artist | **Done (PR #299; Jay gave a thumbs-up; in the game via #309).** | Jay OKs the look (lid colour, rolling pin vs ladle for the P3 bonk, lid icon); then the Programmer swaps it in. | — |
| B-T3-TUNE-2d | Dojo-Ascent Game Logic/systems Tester | Replay tier 3 with Orange gear, plus one Guided/young run if possible. | QA note reports time, HP lost and wins against the plan's target, and whether every hit felt fair. | — (#285 merged) |
| B-SEND | Jay | Freeze Dec 4. Invite testers Dec 7. Fall back to the web link where needed. (Manager runs it; Jay owns it) | Every tester family has the game installed and opened by Dec 15. | B-QA, B-TESTERS, B-BETAREV |
| B-FEEDBACK | Jay | Collect beta feedback into one place, weekly from Dec 15. (Manager runs it; Jay owns it) | One feedback file with each note, its date and an owner. | B-SEND |

## 0b. Menu polish P-MENU-a to h (from `drafts/planning/P-MENU-menu-polish.md`)
| ID | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| P-MENU-a | Dojo-Ascent Programmer | **Done (PR #228, merged Oct 25).** Section 2: spacing, type and motion tokens in `theme.ts`; shared `ui/button.ts` with press feedback, 44 pt hit areas and slide-off cancel; reduced-motion path | Every HomeScene tappable is ≥44×44 (a test walks the scene's interactive objects); pressing any button shows the scale-down; reduced motion shows no scale or slide | nothing |
| P-MENU-b | Dojo-Ascent Programmer | **Done (PR #253).** Split `render()` into shell and panel; the tab bar with sliding underline; `SWAP` on tab and page change | Tab taps redraw only the panel; the underline slides in 180 ms; a quick double tap never draws two panels | P-MENU-a |
| P-MENU-c | Dojo-Ascent Programmer | **Done (PR #254).** Section 3a hub left column (header row, character block, bars, buttons, Path card) | Matches the 3a table on 667×375 and 932×430 screenshots | P-MENU-a |
| P-MENU-d | Dojo-Ascent Programmer | **Done (PR #257).** Section 3b Gear: bigger cards, bottom sheet, Wear pop, Let go confirm in the sheet, page dots | Picking a card never moves the grid; Wear pops the slot; screenshots on 667×375 and 932×430 | P-MENU-b |
| P-MENU-e | Dojo-Ascent Programmer | **Done (PRs #258, #260).** Section 3c Gate: lock sizes, equal sundial and Seal cards, first-lit Seal pop once, no endless blinking | The Seal card never wraps past 2 lines on 667×375; the READY chip and lit locks don't loop | P-MENU-b |
| P-MENU-f | Dojo-Ascent Programmer | **Done (PR #260: 3c sizes, 96-tall Seal cards, first-lit pop + bell).** **Decided:** soft code-made tap sound (logged on #228); bow bell on first lit Seal: yes. Pick a soft tap sound for press and say whether the bow bell is OK for the first lit Seal | Sounds named in decisions.md | P-MENU-a |
| P-MENU-g | Dojo-Ascent Game Logic/systems Tester | Before and after phone check, small and large phones, reduced motion on and off | Notes posted; no tap missed by a 6-year-old in 10 tries per control | P-MENU-c, d, e |
| P-MENU-h | Jay | **Jay, Oct 25:** "make it feel premium"; planner/Manager picks accepted, fix on inspection. The taste calls below | Answers in decisions.md | this PR |

## 0b2. Training Board redesign P-MENU2-a to i (from `drafts/planning/P-MENU2-training-board-redesign.md`, PR #259). Jay picked mood A, warm dojo wood (Oct 25).
| ID | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| P-MENU2-a | Dojo-Ascent Programmer | **Done (PR #264).** Tab skins, segmented switch, new tokens. | Abilities shows the 2-part switch, both 44 tall; screenshots 667×375 and 932×430. | — |
| P-MENU2-b | Dojo-Ascent Programmer | **Done (PR #266).** Trophy Case: belt ribbon, shelves, cubbies, dot pages, detail sheet. | Earned cubbies with seals, not-yet ones with "Learn this at the dojo"; no lock icon, no counts. | — |
| P-MENU2-c | Dojo-Ascent Programmer | **Done (PR #269, QA passed).** Unlock moment, once per unlock. | Cubby lights once after a new sign-off; no replay; Reduced motion fades only. | — |
| P-MENU2-d | Dojo-Ascent Programmer | **Done (PR #270).** Fighting Style data: starting Form + chosen Virtue in the profile; default = today's behaviour. | Sim tests: default profile fights exactly as today; a chosen Virtue/Form is used next run. | — |
| P-MENU2-e | Dojo-Ascent Programmer | **Done (PR #272).** Fighting Style screen: slot cards, tray, tap-to-equip, drag, preview, "Always with you" row (drag + preview may slip past beta). | A 6-year-old changes the Stance in 2 taps; the choice survives a restart. | P-MENU2-d; A6, A7 (placeholders OK) |
| P-MENU2-f | Dojo-Ascent Programmer | **Done (PR #273).** Gear paper-doll, 3-column tiles, compare arrows. | As in the plan. | — |
| P-MENU2-g | Dojo-Ascent Programmer | **Done (PR #274).** Last run "Scroll of the Climb". | As in the plan. | — |
| P-MENU2-h | Dojo-ascent Artist | **Done: Jay approved Oct 25, merged #265.** Art swap-in is P-MENU2-i-art (PR #286). A1–A13 in mood A; premium full set, no rush. | Jay approves the samples; atlases in `incoming-art/`. | — |
| P-MENU2-i-art | Dojo-Ascent Programmer | **Done (PR #286, merged Oct 25 after QA retest at 5523ab9). Jay decided Legendary gets its own look: see A-LEGENDARY-swap.** #265 art in Trophies, Gear and Last run, with code-drawn fallbacks. **Manager OK'd the 4 calls:** Legendary uses Epic art; dark ink on paper stat tiles; "Everyday" in #6b5a48; lantern on the next cubby only. My Style art still held. | QA passes; tests pass. | — |
| P-MENU2-i | Dojo-Ascent Game Logic/systems Tester | **Done (#286 failed at 0b317b4, retest passed at 5523ab9; report 2026-10-25-pmenu2-i.md).** Phone pass on the new tabs (include #286 art): small and large, Reduced motion on/off, kid-tap test. | No missed tap in 10 tries; no text under 12; no guilt words. | — |
| P-MENU2-SPACE | Dojo-Ascent Programmer | **Done (PR #306, merged Oct 25, 10:04 PM, after QA retest).** Polish for later: bigger scroll arrow, the 4.6 px gate scroll at 320. | Nothing overlaps at 667×375 and at a short 667×320 viewport; QA passes; then the Manager merges. | — |
| ICONS2 | Dojo-ascent Artist | **PR #277: all 8 Forms/Strikes/Virtues icons (other 5 added Oct 25); Jay's 3 answers in (Strikes violet, bow kept, front kick); Manager first pass passed. Updated Oct 25 evening (1ab6a53): Open Leg Stance uses the old Beginner's art, Beginner's Stance redrawn as plain standing, Flowing retired, labels follow Jay's renames (Strong Discipline, Spin Kick Finish, Butterfly Flow).** | Jay gives final OK; then added to the menu2 icons64 set. | Jay's final OK on #277 |

## 0b3. Stances (from `drafts/planning/R-STANCE-stances-and-kata-rewards.md`, PR #281). Jay, Oct 25: 5 stances OK; Fighting keeps full attack speed; stances unlock by Sensei sign-off. **Placeholder:** rename only for the beta; kata powers after (Jay picks them tonight).
| ID | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| R-STANCE-a | Dojo-Ascent Programmer | **Done (PR #283, QA passed).** Forms renamed to Stances; old saves migrate. | As in the plan. | — |
| R-STANCE-b | Dojo-ascent Artist | **Drawing done (PR #300, merged; Horse reuses the #277 Rooted icon). Rename waits on #277.** Draw icons for Cat, Front, Fighting and Horse stances in the #277 style now; rename the #277 icons to stance ids after Jay's OK on #277. | Icons in `incoming-art/` with stance ids; Jay's final OK. | rename: Jay's OK on #277 |
| R-STANCE-c | Dojo-Ascent Researcher & Planner | **Stance numbers done (PR #290: Cat softer blocks, Horse cap +10%).** Numbers for the stances (Fighting keeps full attack speed, shorter Dash), with a sim inside the R-BAL bands. Kata reward numbers after Jay's picks. Kata power options are in `drafts/planning/R-KATA-POWERS.md` (PR #302, placeholders). | Sim passes the band tests; Rooted is capped. | kata rewards: Jay's picks (Toni Kennerson's kata descriptions will tune them) |
| R-STANCE-d1 | Dojo-Ascent Programmer | **Done (PR #293, QA passed).** Cat, Front, Fighting and Horse stances with numbers; Horse +10% final; old saves go to Ready; Horse uses the rooted idle; stance lines from R-STANCE-f included. | As in the plan. | — |
| R-STANCE-d2 | Dojo-Ascent Programmer (+ Nic) | **Done (PR #311, merged Oct 26, 12:35 AM, after QA).** Each stance unlocks only by sign-off. **Placeholder:** PLACEHOLDER-dojoforge-stance-* ids until Nic adds real ones. Polish for later: 1 tile per page at 667. | As in the plan. | real ids: Nic |
| R-STANCE-g | Dojo-Ascent Programmer | **Done (PR #313, merged Oct 26, 12:35 AM; lines from #312).** Beginner's = plain standing, no bonus, start for new players; Open Leg (Ready) needs sign-off; old saves keep Open Leg. | — | — |
| R-STANCE-READY-NUM | Dojo-Ascent Programmer | **Done (PR #315, merged Oct 26, 12:42 AM, after QA; plan #314).** Old saves keep Open Leg without a sign-off (Jay asked to confirm). Open Leg gets +3% power, -10% Dash recharge, blocks let 45% through, +8% Focus. Sims: kid 113→139/200, masher 59→85, 0 room-1 KOs. | QA passes. | — |
| R-STANCE-e | Dojo-Ascent Content Designer (+ Jay) | **Skeletons and stances.json done (PR #288); Pinon/Nahanchi spelling #289. Jay's answers in (#303, #305): Open Leg Stance = feet shoulder-width, fists at the stomach; Beginner's Stance = plain standing, the starting stance.** Steps and one-line character for Pinon 1–3, Nahanchi, Possi, and the dojo stance list; Jay checks. The repo has no kata steps. | Files in `drafts/content/katas/`. | Toni Kennerson's kata descriptions (Jay says they're coming); how to stand in Cat, Front, Fighting and Horse; other stances (back stance?) |
| R-STANCE-f | Dojo-Ascent Content Designer | **Done: lines copied into the game in #293; PR #294 merged Oct 25.** | Kid-friendly line for each stance. | — |
| L-STANCE-e-review | Learning & Engagement Designer | Learning-load review of the R-STANCE-e kata drafts. | Short pass/change note. | R-STANCE-e full draft |

## 0b4. Young players losing room 1 (B-MASHER, plan PR #291)
| ID | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| B-MASHER-a/b/c | Dojo-Ascent Programmer | **Done (PRs #295, #296).** Mash guard for all (fades after 3 Great Counters in a room, resets each room; "Sensei steps back" once per run), +6 Focus per shield bounce with glow, kid bot gate. | As in the plan. | — |
| B-MASHER-d | Learning & Engagement Designer (+ Jay) | **Jay decided (Oct 25): no "Try again". A knock-out ends the run and the player goes home (as decisions.md says).** **Done: Jay signed off (t513u); built as B-MASHER-d1 (PR #348).** | Jay signs off the lines. | — |
| B-T3-NUDGE | Dojo-Ascent Programmer | **Done (PR #287).** ROAR plus "Help me!" nudge. | — | — |
| B-CF-BUILD | Dojo-Ascent Programmer | **Done (PRs #297, #298).** Online build fixed; production deploy is `npx wrangler deploy`. | Main builds show Ready. | — |

## 0b6. Premium-feel review (Jay asked Oct 26, morning)
| ID | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| R-PREMIUM-audit | Dojo-Ascent Researcher & Planner | **Delivered (PR #318, items a–h; f already done by #315).** Systems polish audit. Questions sent to Jay: Great Counter camera kick + shake slider, recorded vs generated sounds, 56% kid win rate, particles and sound past Dec 15. | Jay answers; the Manager adds build items. | Jay's answers |
| L-PREMIUM-review | Learning & Engagement Designer | **Delivered (PR #317, items a–e, 5 questions for Jay).** First session, rewards, reasons kids come back. | Jay answers; the Manager adds build items. | Jay's answers |
| C-STORY-review | Dojo-Ascent Content Designer | **Delivered (PR #316, 12 items, 8 questions for Jay). Main finding: no story is in the game yet.** | Jay answers; the Manager adds build items. | Jay's answers |
| Q-PREMIUM-pass | Dojo-Ascent Game Logic/systems Tester | **Done (first pass on bot-qa #216; follow-up PR #319 merged Oct 26, 7:55 AM).** Still unverified: win screen and boss win. Jay's calls: a small heal between rooms (F3), a "Room clear!" moment (F3), the tutorial walk-spot fix (#1). | Report in `drafts/qa/Q-PREMIUM-pass.md`. | — |
| Q-PREM-F2 | Dojo-Ascent Programmer | **Manager call: routine fix.** Settings gets a clear X or "Done" in the corner, like Look and Scroll. | One tap closes Settings at 667×375 and 667×320 (44 pt target); QA passes. | **Done (PR #321, merged Oct 26, 8:46 AM).** |
| Q-PREM-COLOR | Dojo-Ascent Programmer | **Delivered (PR #328, waiting on QA).** **Manager call: routine fix.** Shared green #3aa57a (used 26 times) is too faint behind white text (3.07:1); switched to shared `GREEN` #277a56 (5.24:1). Manager calls on its 2 questions: make DASH solid, and fix the rest card's Back home height; both go in Q-PREM-F7. | All white-on-green text is at least 4.5:1; QA passes. | **Done (PR #328, merged Oct 26).** |
| Q-PREM-F1 | Dojo-Ascent Programmer | **Delivered (PR #322, rebased on main; waiting on QA rerun). Manager: 450 ms quiet window OK.** **Routine fix.** The Bow prompt (dojo entry and "Bow to begin the floor") fires on the first touch tap; taps on top-bar menus while the prompt is up pulse the Bow button. | 10 of 10 single taps bow at 667×375; QA passes. | **Done (PR #322, merged Oct 26).** |
| Q-PREM-F4 | Dojo-Ascent Programmer | **Delivered (PR #323, includes main; waiting on QA).** **Routine fix.** On a boss loss, "Ouch! The run is over." no longer overlaps the "Floor Keeper" label, and the fight controls hide. (Dim vs black and naming the boss bar wait for the art/taste pass.) | Screenshot of `?room=keepers-hall&seed=7&difficulty=guided` loss, Reduced motion on and off, nothing overlaps; QA passes. | **Done (PR #323, merged Oct 26).** |
| Q-PREM-F5 | Dojo-Ascent Programmer | **Jay's rule (t438u).** Remove 'Try again' from the run-over card (RunOverCard.ts:68 and GameScene's lost branch), leaving only 'Back home'. Also (Manager, from #323): Back home at least 44 px tall at 667×320, text at least 4.5:1. | No Try again after a knock-out or boss loss; Back home returns to the dojo and meets the size and contrast; QA passes. | **Done (PR #325, merged Oct 26).** |
| C-STORY-TRY | Dojo-Ascent Content Designer | **Delivered (PR #326): A "Nice work today. Let's rest at the dojo." or B "You learned a lot. Home we go!"** Replaces the guided-loss Sensei line 'Try again whenever you're ready.' (content/tutorial/first-session-lessons.json, same string in 10 other lessons). | Jay picks A or B together with #292; then the Programmer swaps the string. | **Done: Jay picked; the game text is in #343.** |
| Q-PREM-F6 | Dojo-Ascent Programmer | **Manager call: routine fix.** On the Training Board at 667x320, 'Again!' is clipped at the bottom of its panel. | 'Again!' fully visible at 667x320, 667x375 and 932x430; QA passes. | **Done (PR #327, merged Oct 26).** |
| Q-PREM-F8 | Dojo-Ascent Programmer | **Manager call: routine fix.** At 667x320 an 8 px strip of the New-for-you card shows just above Again!, so a slightly-high tap opens Abilities. End the scroll window a few px higher. | No other tappable item within 8 px above Again! at all 4 sizes; QA passes. | **Done (PR #329, merged Oct 26).** |
| Q-PREM-F9 | Dojo-Ascent Programmer | **Manager call: routine fix.** Ready COUNTER/STRIKE/VIRTUE fills are under 4.5:1 with white labels (4.22, 3.36, about 1.9), and the Decorate Done and Street Smarts buttons are 32 px tall. Keep each button's own colour family (Jay's call), just darker, or use a dark label. | All three readable at 4.5:1 or more; those buttons at least 44 px tall; QA passes. | **Done (PR #330, merged Oct 26 after QA retest).** |
| Q-PREM-F10 | Dojo-Ascent Programmer | **Manager call: routine fix.** At 47 px stat tiles (667x320, 667x375) the number and label touch, and the sparkle overlaps 'Basic'. | No overlap or touching at all 4 sizes; QA passes. | **Done (PR #331, merged Oct 26; 47 px label exception accepted).** |
| Q-PREM-BOSSWIN | Dojo-Ascent Programmer | **Jay t513u.** First Floor Keeper clear gets a one-time big celebration ('Floor Keeper defeated!'); re-clears show the normal room clear. A tutorial-only clear must not use up the celebration (Manager). | Plays once per save; Reduced motion respected; QA passes. | **Done (PR #336, merged Oct 26, 2:50 PM).** |
| Q-PREM-GRADE | Dojo-Ascent Programmer | **Jay t513u.** Letter grade shows only on the hardest difficulty. | Hidden on all other settings; QA passes. | **Done (PR #342, merged Oct 26, 2:51 PM).** |
| Q-PREM-TRY | Dojo-Ascent Programmer | **Jay changed the line:** every lesson's `retry` says "Nice work. Let's keep practicing." QA re-test PASS at a2824fdc (Oct 26, 4:05 PM). **Manager call:** lesson-counter-guided's "So close! Let's keep practicing." becomes "Nice work. Let's keep practicing." ("So close!" is on the knock-out spec's banned list). | No "try again", "rest at the dojo" or "So close!" in any lesson; branch includes main; QA passes; then the Manager merges. | **PR #343 now conflicts with main (after #348). Programmer: update from main and make the "So close!" change.** |
| B-MASHER-d1 | Dojo-Ascent Programmer | **Done (PR #348, merged Oct 26, 3:54 PM, after QA PASS).** Kind knock-out go-home flow per drafts/learning/b-masher-d-knockout-flow.md. | That doc's d1/d3 Done-when lines; QA passes. | — |
| C-STORY-TRY-rec | Dojo-Ascent Content Designer | Update `drafts/content/tutorial/C-STORY-TRY.json` so it matches what shipped: "Nice work. Let's keep practicing." in all lessons (it still says "rest at the dojo"). Docs only. | The draft file matches content/tutorial/first-session-lessons.json after #343. | — |
| L-PREMIUM-a | Dojo-Ascent Content Designer, then Programmer | 'How to earn it' hint on every locked Trophy, Decoration and Journal item (drafts/learning/L-PREMIUM-review.md). | Per that doc; QA passes. | **Content done (PR #333, merged Oct 26).** Programmer part comes with L-PREMIUM-b; Trophy slots use curriculum requirement ids, hints use stance/strike/self-defense ids, so they need mapping. **Placeholder:** which kata unlocks Cat Stance (waits on Toni). |
| L-PREMIUM-b | Dojo-Ascent Programmer | Soft Counter hint pulse after repeated misses (drafts/learning/L-PREMIUM-review.md). | Per that doc; QA passes. | — (B-MASHER-d1 merged). Programmer's next item after the #343 update. |
| L-PREMIUM-a2 | Dojo-Ascent Programmer | Wire the #333 locked-item hints into the game with a requirement-to-hint index (Trophy slots use curriculum requirement ids; hints use stance, strike and self-defense ids). | Every locked Trophy, Decoration and Journal item shows its hint; QA passes. | After L-PREMIUM-b. |
| Q-PREM-NOHEAL | Dojo-Ascent Programmer | **Closed: Jay keeps the 15% room-clear heal (t531u).** | — | — |
| R-PREMIUM-b2 | Dojo-ascent Artist | **Done (PRs #346, #347, merged Oct 26).** Curated CC0 sounds staged in incoming-art/audio/sfx (Jay's mix: soft Kenney UI, punchy Kenney impacts, a light touch of 8-bit). | — | — |
| R-PREMIUM-b3 | Dojo-Ascent Programmer | **Delivered (PR #349).** Sound files for 13 events. Follow-up: STEEL00 on Home levels gained. | Jay OKs the preview; QA passes; then the Manager merges. | **Waits on Jay** (listening to the preview). |
| C-STORY-f | Dojo-Ascent Content Designer | **Delivered (PR #344).** The town grows one visible change per belt (White lamps, Yellow flowers, Orange bakery, Green path, Blue river and dock, Red gold flame banner, Red/Black chime, Brown reading tree, Brown/Black Tower glow and window lantern). After approval the Artist makes 9 overlays. | Jay approves the list and order; merged. | **Waits on Jay** (list, order, gold flame for Red). |
| R-TOWN-CLUBPENGUIN | Dojo-Ascent Researcher & Planner | **Done (PR #345, merged Oct 26; Jay approved t539u).** Club Penguin as the model for the live town square. | — | — |
| R-PREMIUM-b | Dojo-ascent Artist | **Jay t513u.** Shortlist free sound packs that fit and whose license allows selling the app. | Shortlist with licenses in incoming-art/audio/; Jay OKs before import. | **Done (PR #332, merged Oct 26).** |
| Q-PREM-RETEST | Dojo-Ascent Game Logic/systems Tester | Check the win screen and a boss win (unverified in Q-PREMIUM), then retest F1, F2 and F4 as they land. | QA note with screenshots. | — (F1/F2/F4 parts wait on those PRs) |
| C-STORY-a | Dojo-Ascent Content Designer | **Delivered (PR #334).** Chapter 1 Sensei line becomes "Even a small light shines in the dark."; KJV John 1:5 moves to the faith layer. Then the Programmer shows storyScreens verses when the faith layer is on. | Jay approves; merged. | **Waits on Jay** |
| C-STORY-b | Dojo-Ascent Content Designer | **Delivered (PR #335, stacked on #334).** Mystery clue ladder; Sensei revealed at Brown/Black; Senpai's Blue hint. | Jay approves; merged. | **Waits on Jay** |
| C-STORY-d | Dojo-Ascent Content Designer | **Delivered (PR #337, stacked on #335).** Guardian arcs. | Jay approves; merged. | **Waits on Jay** |
| C-STORY-e | Dojo-Ascent Content Designer | **Delivered (PR #339, stacked on #337).** Gate scenes White to Brown/Black. Later the Programmer supports a 'senpai' speaker. Open question: creed line "Nobody climbs the Tower perfectly." | Jay approves; merged. | **Waits on Jay** |
| C-STORY-g | Dojo-Ascent Content Designer | **Delivered (PR #340, stacked on #339).** 19 Bestiary entries, Tiers 1–3; Programmer then copies them into each enemy's bestiary.lore. | Jay approves; merged. | **Waits on Jay** |
| C-STORY-h | Dojo-Ascent Content Designer | **Delivered (PR #341, stacked on #340).** Dojo ties, Kohai, Sensei reveal with Prov 17:17. | Jay approves; merged. | **Waits on Jay** |
| C-STORY-i, C-STORY-l | Dojo-Ascent Content Designer | Held until Jay approves #334–#341. | — | Jay's story approval |
| Q-PREM-F7 | Dojo-Ascent Programmer | **Manager call: routine fix (from #328).** Make the DASH button fill solid (it is see-through, so its label is only just 4.5:1), and give the rest card's Back home button (`restCard`, RunOverCard.ts) the same at-least-44 px height F5 gave `runOverCard`. | DASH label at least 4.5:1 on any floor at 667x320, 667x375, 844x390 and 932x430; rest card Back home at least 44 px tall at 667x320; QA passes. | **Done (PR #328, merged Oct 26).** |

## 0b5. Jay's renames and art calls (Oct 25 evening)
| ID | Owner | What | Done when | Waits on |
|---|---|---|---|---|
| C-RENAME-2 | Dojo-Ascent Content Designer | **Done (PR #305).** Open Leg Stance; Strong Discipline. | — | — |
| C-RENAME-3 | Dojo-Ascent Content Designer + Programmer | **Done (PRs #307 data, #308 code).** Spin Kick Finish, Butterfly Flow, Perfect Counter → Great Counter. Jay doesn't like "perfect" in game text. | — | — |
| A-LEGENDARY | Dojo-ascent Artist | **Done (PR #304; Jay approved the golden-orange Legendary frame).** | — | — |
| A-LEGENDARY-swap | Dojo-Ascent Programmer | **Done (PR #310, merged Oct 25, 11:58 PM, after QA passed).** Polish for later: the halo on a held ring, the 28 px icon, and 4 columns at 932. | Legendary items show the golden-orange frame wherever Epic did; screenshots at 667×375; QA passes. | — |
| A4 | Dojo-ascent Artist | **Done (PR #301; Jay approved day and dusk, Oct 25).** | — | — |
| A4-DOJO | Dojo-ascent Artist | Main dojo building modelled on the real Action Zone dojo, inside and out. **Placeholder:** the plain dojo in #301 stays until then. The shop building is a shop; the third building stays a plain placeholder until Jay decides. | Jay approves the building. | Jay's Action Zone photos (expected the morning of Oct 26) |

**Bug fixes from Jay's phone screenshot (Oct 25), all done:** B-GEAR-BUG #261, B-LASTRUN #262, B-POLISH-1 #263, B-NM-FIX #267, B-NM-FIX-2 #268.

## 0c. Done Oct 25
Evening: #294 R-STANCE-f, #299 lid art files, #300 R-STANCE-b, #301 A4, #302 R-KATA-POWERS, #303 C-STANCE-READY, #304 A-LEGENDARY, #305 C-RENAME-2, #307 and #308 C-RENAME-3.

P-MENU2-a #264, b #266, c #269, d #270, e #272, f #273, g #274, B-T3 #278–#280, #282, R-STANCE plan #281, R-STANCE-a #283, B-T3-TUNE-2 plan #284 and 2a/2c #285, A-MENU2 art #265, B-POLISH-2 #271, Supper Rush note #275, mood A note #276, P-MENU2 plan #259, P-MENU-b #253, c #254, d #257, e #258, f #260, B-SAFE #249, Celebrations #250 and #252, Orange art #244 #247 #248, Guardian concepts #211, charms #214, bestiary set 2 #256, kata icons #227, bug fixes #261–#263, #267, #268.

B-WRAP #243, Node 22 #245, B-BELT #246, R-BAL-14b #251, L4 beta-docs review #239 and fixes #240, B-ART3 samples #241 and room brief #242, bestiary set 1 #234 (Jay approved), P-MENU-a #228, B-DOCS #236, R-BAL-14 #237, C7 charm placeholders #233, K27 #218, K28 #219, K29 #220, K30 #221, K31 #222, K32 #226, R-BAL-12d #213, R-BAL-12e #210, K26 #215, R-BAL-13 #224, C14 #217, C13-F #229, A-BEST samples #207, dash telegraphs #209, P-MENU plan #225, Dec 15 replan #230 and beta plan #232. Walk #199 closed (original walk kept).

---

## 1. Decisions Jay has made (Dojo-Ascent Programmer: record these in docs/decisions.md)

1. **Bow question = recall.** Sensei shows a picture of one of the player's earned abilities and asks "What's this one called?" with 3 picture-and-word choices. After the answer, the character performs the move. A wrong answer warmly shows the right name; there is no penalty. Correct answers are counted forever, with awards at 5, 10, 20, 50 and 100 (may go higher). At most one question per day. It can always be skipped. This replaces the "Which felt best?" draft.
2. **Lore comes first.** The Tower's story and enemy lore are launch scope, and the game is built around them where it fits.
3. **The Bestiary is launch scope.** An enemy's entry fills in the first time the player defeats it; deeper lore unlocks with each real belt. Update the unlock schedule in core-design section 13.
4. **First movement lesson:** "Tap where you want to go, or use the stick."
5. **Real techniques decide game effects.** Each self-defense technique's callout and in-game effect must match what the real technique does to an opponent. Jay's descriptions of #1–30 are in `docs/self-defense.md`. The game shows outcomes (off-balance, trapped, thrown, disarmed, escaped), never injuries.
6. **The QA bot is active now.**
7. **A sixth bot, the Game Systems Designer, owns combat, items, Forms, power-ups, difficulty, achievements and rewards** (section 6 below). Answering the milestone 4 questions (powers, numbers, black belt degrees) moves from the Learning Designer to this bot; the Learning Designer reviews its work.

8. **Belt wording:** keep "Red/Black" and "Brown/Black" (PR #15).

---

## 2. Already answered in the design (no new decision needed)

These questions already have answers in the design docs. The bots build on these answers instead of starting over.

| Question | Where it's answered |
| --- | --- |
| Will cosmetics exist? | Yes, earned only and never bought, with looks kept separate from stats: core-design §5 "Style separate from stats" and §13 "Character customization". **Confirmed by Jay (Oct 23, J5):** from gear, in-game achievements and dojo achievements, never bought. |
| How are decorations earned outside real life? | Tower chests (built), Decoration sets, crafting, Challenge-only decorations: core-design §5, §11, §12. Item S7 turns this into a full list. |
| Gathering place / community | The dojo town square, in three steps (shared world → live town square → co-op runs): core-design §11. |
| Achievements | The trophy wall, collections, Bestiary, certified trophies: core-design §5 and §11. Item S6 turns this into a full list. |
| Why play on a harder difficulty? | core-design §12 "Difficulty levels" (better gear cap, Challenge-only cosmetics, certified trophies, rare materials, faster Mastery). Challenge unlocks at 4th belt (§13). Item S5 reviews it. |
| What brings kids back? | The five loops (moment, run, session, week, journey) and "always show the closest goal": core-design §2, §3, §5. Item L3 audits them against the built game. |
| Stances | Forms, one per kata: framework §4 "Forms give depth" and §5. Item S3 finishes the list. |
| Quest lines | Missions (§13), life-lesson quests at 3rd belt, the Tower story (§1). Items C3 and C4 write them. |

---

## 3. Waiting on Jay

| ID | What Jay provides | Unblocks |
| --- | --- | --- |
| J1 | ~~Self-defense list~~ **Mostly done:** `docs/self-defense.md` (#1–30) and the belt ladder in `docs/curriculum.md`. Jay gave #31–35 on Oct 23 (Programmer adding them under K1); **Deferred by Jay (Oct 24), not blocking:** #33's "party flex" wording, #36–40, the Brown/Black → Black requirements, and the attacks marked "(not stated)". Jay will fill these in later. | nothing (build around the gap) |
| J2 | ~~Kick combo list~~ **Done:** Jay gave combos 1–7 on Oct 23; the Programmer is adding them to the docs under K1. | ~~S4 kick combos~~ (no longer blocked) |
| J3 | ~~Kata list~~ **Names done** (`docs/curriculum.md`). ~~Spellings~~ done (commit 660c98d). Still needed (in progress): one line on each kata's character. | S3 |
| J4 | ~~Faith texts~~ **Done:** `docs/faith-and-creed.md`. Section 6 answered from Jay's wall photos (Oct 24): KJV text, the full Confidentiality line, and no covenant for Brown/Black → Black. | — |
| J5 | ~~Confirm cosmetics~~ **Done (Oct 23):** cosmetics come from gear, in-game achievements and dojo achievements, and are never bought. | ~~A1~~ (unblocked) |
| J6 | ~~Black belt to 2nd degree~~ **Done (Oct 23):** 2 years between 1st and 2nd degree. Code change done in PR #16. | ~~milestone 4~~ (unblocked) |
| J8 | ~~Named monster: before or after launch?~~ **Done (Oct 24):** before launch. | ~~M7-N1~~ (unblocked) |
| J9 | ~~Scripture read aloud~~ **Done (Oct 24):** the phone's voice reads verses; wording stays exactly as on the dojo sign (PR #42). | ~~spoken verses~~ (unblocked) |
| J10 | ~~Music licence~~ **Answered (Oct 24):** AI-assisted (Suno) WAFU music is OK. Jay emailed WAFU (11:53 AM) for a written OK on white-label builds for other dojos; **waiting on WAFU's reply.** | M7-P8a pick, M7-P8 |
| J11 | ~~Street Smarts safety review~~ **Done (Oct 24):** code word yes, kid says Mom/Dad, the "come with me" line is OK; Manager picked the safe helpers (worker with uniform or name tag, cashier, police officer, grown-up with kids) and a short reunion scene. Applied in PR #58. | ~~C1, K2~~ (unblocked) |
| J12 | **Not blocking (after-work glance):** the fixed warning moves are now in the game (PR #104). Jay can try them with `?named=old-thumper`, `?named=zippy-zoom` or `?named=captain-clank` on a yellow-belt run and say if anything looks off. | nothing (built) |
| J13 | **After-work list (not blocking, Jay will do later):** self-defense gaps for S4 (results and categories for #31–35, what "party flex" (#33) means, #36–40 for Brown, the attacks for #3/#4/#5/#15); kick combos 8–12; kata character lines (J3); for the C4 quests, the school's founding story, the arts blended in Yeshua's Ryu and what each belt colour means; whether to ask Nic for a total-classes field (PR #93); quick looks at the cosmetics (PR #78), Insight icons (PR #56) and the padded-staff enemy (PR #95); the A2 Rooted stance pick (PR #121); self-defense #36–40 attacks and student steps. | S3, S4 rest, C4 details |
| R-BAL-1 | **Done (Oct 24, recorded in PR #181):** expected player; bands OK (Standard 60–80% first try, Guided 90%+); Endless +3% per floor, no cap; Challenge 1.5×. | ~~R-BAL-2, R-BAL-6~~ |
| R-BAL-5 | **Done:** yes, last step 10 runs or fewer; built in PR #204. | — |
| J14 | **Decided Oct 25:** original walk kept; #199 closed. | — |
| J15 | **Art OKs (Jay gives final approval on all art):** A-BEST 1 bestiary sample v2 (PR #207), A-BEST 2 dash-only warning art (PR #209), A-BEST 3 Guardian concepts v2 (PR #211, concept only), charms without red (PR #214), ~~bestiary set 1 (PR #234)~~ approved and merged Oct 25; **B-ART3 full Orange set (#244, #247, #248): doughling look and pin colours**; **S3-A1 kata icons (#227): technique match, choke break, Front at top**. ~~Gear icons (PR #212)~~ approved Oct 24, merged Oct 25. | A-BEST full set, imports |
| J16 | **C14 Guardian form shifts (PR #217):** OK the 4 picks and new-form names (Pebble Heart, Bloom Gardener, Quiet Thunderhead, Cloud Lantern); add Ember Knight as a 5th?; shift at 33% (chosen) or 66%; invulnerable during the 1 s glow? | C14 art, wiring |
| J17 | **Decided:** lines OK'd; #213, #210, #215 merged. | — |
| J18 | **Decided Oct 25:** faith direction approved; C13-F merged (#229). | — |
| J7 | ~~Fonts~~ **Done (Oct 23, Jay delegated to the Manager):** Fredoka for headings + Andika for body text, because Andika is built for early readers (ages 6+). | ~~menu art~~ (unblocked) |

---

## 3a. Top fix waiting on assignment

| ID | Task | Waiting on |
| --- | --- | --- |
| G1 | **Done (PR #21, merged Oct 23).** Guided first Counter (Learning proposal 6). Final nudge text is in `drafts/content/text/guided-counter-nudge.json` (PR #23); the Programmer copies it in under K5. | — |

---

## 3b. Milestone 7 "Playtest ready" (plan: `drafts/planning/next-plan-milestone-7.md`, PR #33)

Start with **M7-P1, M7-P9 and M7-P11**. Full specs are in the plan file under the same P number.

**Manager decisions (Oct 24):** Guided is on by default for ages 6–9 **and** new white belts (0 sign-offs). Play-time limit is a parent setting: off / 15 / 30 / 45 / 60 minutes, default **off**. Music: the Researcher & Planner shortlists 3 free-licence packs (commercial use allowed) and the Manager picks.

| ID | Task | Owner | Waiting on | Done when |
| --- | --- | --- | --- | --- |
| M7-P1 | **Done (PR #108, merged Oct 24).** Default difficulty is Standard, with a difficulty choice screen (Manager call). Original: Guided on by default for new profiles aged 6–9 or white belt with 0 sign-offs; never switch a player off a mode they chose. | Programmer | nothing | Youngest fake profile starts on Guided; switching to Standard sticks after reload; an older profile starts on Standard. |
| M7-P2 | **Done (PR #139, merged Oct 24).** First Perfect Counter in about 40 s; can't lose; chest always Special or better. Original: Tutorial floor (first 10 minutes, can't lose). | Programmer | — | First Perfect Counter under 2 minutes from "Tap to start"; can't lose by doing nothing; chest always Uncommon or better. |
| M7-P3 | **Delivered (PRs #37, #49).** Tutorial lines for each P2 step. | Content Designer | — | Every P2 step has one line in a data file, each under 12 words. |
| M7-P4 | **Done (PR #145, merged Oct 24).** Cascade of unlocks on first return home. | Programmer | nothing (M7-P2 done) | Profile 2 sees 3 unlocks plus the stripe in order; profile 1 sees the preview; nothing plays twice. |
| M7-P5 | **Done (PR #142, merged Oct 24).** A session is a calendar day with at least one run; one new lesson per session and per room; Scroll button in the dojo replays seen lessons and the tutorial floor. | Programmer | — | Two sessions in a row show one new lesson each, never two; every seen lesson replays from the Scroll. |
| M7-P6 | **Delivered (PRs #37, #39, #44, #49, #50).** Lesson lines for first-session systems; `drafts/content/tutorial/first-session-lessons.json` is the only lesson file. | Content Designer | — | Each P5 lesson has its lines in a data file, one sentence per screen. |
| M7-P7 | **Done (PR #149, merged Oct 24).** Old saves skip Welcome Week. Gradual unlock schedule + Welcome Week. | Programmer | nothing (M7-P5 done); do after K18 | Yellow-belt profile gets all abilities on day 1 but meets one new system per session; "+1 day" moves it forward. |
| M7-P8 | **Done (PR #172, merged Oct 24).** WAFU music (Mountain Temple: Great Hall I for dojo and menus; Long Road: Grass Road I for the Tower), volume sliders. | Programmer | — | No main screen without sound; both volume sliders work and are remembered. |
| M7-P8a | **Done (PR #170, merged Oct 24): WAFU said yes; Mountain Temple for the dojo and menus, Long Road for the Tower.** Shortlist delivered (PRs #38, #43). Shortlist 3 free-licence music packs (commercial use allowed); Manager picks one. | Researcher & Planner | WAFU's reply (J10) | Shortlist in drafts/planning/ with licence links; Manager's pick recorded here. |
| M7-P9 | **Done (PR #110, merged Oct 24).** Grown-up gate is a math question; play time resets at midnight. Original: Play-time limit parent setting (off/15/30/45/60, default off); finish the room, friendly "Great training today!", go home. | Programmer | nothing | With `?playlimit=1` the run ends after the current room, nothing is lost, the message is friendly. |
| M7-P10 | **Done (PR #147, merged Oct 24).** Three next goals at session end (game, collection, real-world). | Programmer | M7-P4 | Every profile sees exactly 3 goals; the real-world one names a real next technique. |
| M7-P11 | **Done (PR #113, merged Oct 24):** a Tower run now survives the app closing. Original: Fix the open bug notes in `docs/progress.md` (for example, a run in progress isn't saved if the app closes). | Programmer | nothing | Each fixed note has a test or screenshot in the PR. |
| M7-P12 | **Done: READY (report merged Oct 24); fixes are K23.** Playtest-readiness check. | QA Tester | M7-P1 to M7-P11 | Report on each fake profile's first 30 minutes on a phone-sized screen: time to first Perfect Counter, screens over one sentence, ways to lose the tutorial, crashes. |
| M7-P13 | **Draft review done (PR #46), fixes merged (PR #49).** Learning and overwhelm review of P2–P7; re-check done (PR #151, merged Oct 24); fixes are K22. | Learning Designer | M7-P4 and M7-P7 builds | Short pass/change note on overwhelm, ethics and age 6+ reading level. |
| M7-N1 | **Done (PR #104, merged Oct 24):** small version, three named monsters from yellow belt, tells wired in, Monster Journal and stickers. Bigger version for later belts comes later. Original: **Ready to build (launch scope, J8).** Named monster (`drafts/planning/named-monster-proposal.md`, final spec PR #47). Text in `drafts/content/enemies/named-monsters.json` (PR #45); art in `incoming-art/named-monster/` (PRs #48, #51, #53, tells fixed in #60; brute stamp shake off with reduced motion). Build the monster now; wire the warning moves after J12. | Programmer | — | As the proposal's Done-when. |

---

## 4. Dojo-Ascent Programmer

| ID | Task | Waiting on |
| --- | --- | --- |
| K1 | **In progress (sent Oct 23).** Check that the game's belt list, kata names and requirement counts match `docs/curriculum.md` (fixtures and content/), and list any differences for Jay. Record section 1 in docs/decisions.md. In docs/GROK_BOTS.md, mark the QA bot active and move the milestone 4 recommendation task from the Learning Designer to the Dojo-Ascent Researcher & Planner. Fix one fact wherever it appears: Sensei's Lessons are built in milestone 7 and finished in milestone 10. Remove the black belt question from the Open questions list only after J6 is answered. Also add Jay's new curriculum text (self-defense #31–35, kick combos 1–7) to the docs, and replace remaining Claude Code references in the docs with the Dojo-Ascent Programmer. Also record Jay's Oct 23 decisions in docs/decisions.md: J5 (cosmetics from gear, in-game and dojo achievements, never bought), J6 (2 years from 1st to 2nd degree) and J7 (Fredoka headings + Andika body). Show Jay the changes before committing. | nothing |
| K4 | **Done (PRs #19 and #20, merged Oct 23).** S1 #1 (enemy mixes) and #2 (Perfect Counter chain). The "longest chain" record is deferred. | — |
| K5 | **Done (PR #22, merged Oct 23).** S1 #4 room twists, with the final twist text and guided-Counter nudge. Slide stays at 1.6x (Q4 found no real cost; drop to 1.3x if kids slide into danger on a real phone). | — |
| K6 | **Done (PR #26, merged Oct 23).** Twist banner no longer covers the room name or goal; `?twist=<id>` test link added (fixes Q4 bugs 1 and 3). | — |
| K7 | **Done (PR #41).** Tier 2 art (Sunrise Garden), 28 icons, elite aura preview. QA check in PR #55; new Insight icons in PR #56. | — |
| K7-fix | **Done (PR #62).** Fix the small-screen layout bugs in `drafts/qa/2026-10-24-k7-art-qa.md` (PR #55) and swap in the redrawn Insight icons from PR #56. | nothing |
| K8 | **Done (PR #59, merged Oct 24).** S1 #3 elites (Swift and Guarding) from 4th belt up. Typical player's green-belt win rate is 93% (7-point drop, target was 5). **Manager call:** keep the numbers for now and recheck after the playtest (M7-P12); all numbers are in `content/elites/elites.json`. | — |
| K2 | **Done (PRs #75, #82).** Street Smarts scene "Separated in a store", helper question trimmed to 4 choices. | — |
| K9 | **Done (PR #89).** Difficulty reaches elites, plus the elites QA fixes. | — |
| K10 | **Done (PR #105, merged Oct 24).** K9 retest fixes (COMBO off the boss bar, Sensei banner off door labels, `?elite=guarding` respects Guided). 197 tests pass. | — |
| K11 | **Done (PRs #108, #110, #113, merged Oct 24).** M7-P1, M7-P9, M7-P11. | — |
| K12 | **Done (PR #119, merged Oct 24).** Q3 named-monster fixes, reduced-motion switch, A7 swatch rim, Bopper art, named monsters about 1 in 30 runs. | — |
| K13 | **Done (PRs #131, #133, #134).** A6 Tier 1 decorations imported (#131); earning built (#133): class pieces (one every 2 class dates at White, every 3 after), Journal trophies, keeper statues, folding screen, S7 surprise drops; Rest-for-now refresh fix (#134). **Manager calls:** each piece keeps the belt it dropped on; classes count once per calendar date. | — |
| K13b | **Done (PR #135).** Monster Journal pages for the monster kinds, with plain enemy names. | — |
| K14 | **Done (PR #140).** Journal silhouettes for unmet Floor Keeper and Bopper cards, plus the A2 Form stance idles (Rooted = option A). | — |
| K15 | **Done (PR #139).** M7-P2 Tutorial floor. | — |
| K16 | **Done (PR #141).** C7 kid-facing rarity names from content: common is "Everyday", uncommon is "Special". | — |
| K17 | **Done (PR #142).** M7-P5 Sensei's Lessons and the Lesson Scroll. | — |
| K18 | **Done (PR #145).** M7-P4 unlock cascade on first return home. | — |
| K19 | **Done (PR #149).** M7-P7 gradual unlock schedule + Welcome Week. | — |
| K20 | **Done (PR #147).** M7-P10 Three next goals at session end (section 3b). One PR. | K19 |
| K22 | **Done (PRs #153, #154).** M7-P13 Learning Designer fixes. | — |
| K23 | **Done (PRs #157, #159, #167; QA retest PASS #160).** M7-P12 playtest fixes. | — |
| K24a | **Done (PR #192).** Jay's tutorial feedback: see-through tutorial box (about 65%, easy to read, doesn't block the game), tap to continue, then try the move; slower pace. Use the C12 draft (`drafts/content/tutorial/tutorial-floor.json`, PR #173) with data-driven tips; you may rename the `advance`/`waitFor` fields and set up the new tutorial waves. **Manager calls on C12:** keep "health never drops below 1" on the tutorial floor; lesson-dash becomes a short reminder at session 2 instead of a new lesson. One PR. | nothing |
| K24b | **Done (PR #194).** Clearer counter: wind-up ring, '!' and a COUNTER flash so kids know when to block (no new art). One PR. | K24a |
| K24c | **Done (PR #197).** Camera a bit closer (Tower about 6.75 tiles tall, not super zoomed in) at full retina resolution. One PR. | K24b |
| R-BAL-4 | **Done (PR #202).** Test that locks the bad-luck counter (guaranteed rare on run 5 or sooner). Plan: `drafts/planning/balance-research.md` (PR #176). | K24c |
| R-BAL-2 | **Done (PRs #203, #206, #208).** Per-tier enemy scaling (built at White belt, scaled per belt) and per-tier gear caps. | — |
| K25 | **Done (PRs #200, #205).** Slower tempo (about 12%), no shake on the player's strikes or Blocks, calmer hit shake. | — |
| S3-P1b | **Done (PR #201).** Readable kata arrows, kata group at top of Abilities. | — |
| R-BAL-12 | **Done (PR #208; 12d PR #213, 12e PR #210).** Real training adds Power, Health and Guard. | — |
| K26 | **Done (PR #215).** Sign-off names never run into the other column. | — |
| K27 | **Done (PR #218).** Tutorial fixes from Q5. | — |
| K28 | **Done (PR #219).** K25 feel fixes (wind-up sound timing, real-second timers, belt check by rank order). | — |
| K29 | **Done (PR #220).** End-of-run clock in real seconds. | — |
| K30 | **Done (PR #221).** HOME door label clear of the boss. | — |
| K31 | **Done (PR #222).** Boss name and small health bar kept together as one pair. | — |
| K32 | **Done (PR #226).** Gear icons in all 5 places; K32-1/K32-2 text cuts accepted. | — |
| R-BAL-6 | ~~Endless soft cap~~ **Dropped:** Jay kept +3% per floor with no cap (PR #181). | — |
| K21 | **Later (when the achievements and trophy screens are built).** Use the A3 bow badges as the achievement icons on the Goals page and the award pop-up, with the number drawn under each badge in the UI font; write the short date on the certified trophy's plate. | achievement screens |
| S4c-P1 | **After launch (first update).** Build the Injured status from break seals #31–40 (`drafts/planning/S4c-injured-status.md`, PR #120). Text is ready (S4c-C1 PR #128, S4c-C2 PR #129) and art is ready (S4c-A1 PRs #126, #130). You may adjust the proposed seal ids at import. | S4 locks built, launch |
| K3 | Run the balance-testing computer player whenever the QA bot or the Systems Designer asks, and send Jay the report. | requests |

---

## 5. QA & Playability Tester

| ID | Task | Waiting on |
| --- | --- | --- |
| Q1 | **Delivered (PR #17):** `drafts/qa/2026-10-23-q1-combat-report.md`. Headline: a player who never Counters wins 0% of runs on every difficulty. ~~**Full combat test** on the live link: all three difficulties, all three test profiles, every room type and the boss. Report bugs, then a playability report. Add one extra section: "What would make combat more varied and more rewarding?", thinking like a 6-year-old, a 12-year-old and an adult.~~ | — |
| Q2 | Test character creation and the newly imported art (Batches 4–7): readability on a phone, anything that looks wrong. | nothing |
| Q4 | **Delivered (PR #25):** `drafts/qa/2026-10-23-q4-room-twists-report.md`. Twists change the win rate by only about half a point; the earlier drop was from too few test runs. Banner fixes done in K6. Open note: banner text (17 px, two sentences plus a Sensei line) may be a lot for a new reader; revisit after Jay tries it on his phone. | — |
| S4c-T1 | **After launch.** Test the Injured status once S4c-P1 is built. | S4c-P1 |
| Q3 | **Delivered (PR #112):** named-monster QA; fixes in K12. Original: Ask Jay for a balance run from Dojo-Ascent Programmer (K3), compare it with your own play, and suggest specific number changes. Note: novice players on Standard currently win only 41% of runs. | K3 |
| R-BAL-3 | Balance fixtures for each tier; `npm run balance` reports win %, deaths and room times per tier. | R-BAL-2 |
| R-BAL-7 | Kid playtest against the balance targets. | R-BAL-3 |
| Q5 | **Done (report PR #216; fixes K27–K31, retests passed).** Check K24a once merged: tutorial pace, see-through box readable on a phone, every tip waits for the try. | K24a |

---

## 6. Dojo-Ascent Researcher & Planner (systems design: drafts/planning/)

Every proposal from the Dojo-Ascent Researcher & Planner (drafts/planning/) gets checked twice: by Dojo-Ascent Programmer's balance-testing player for the numbers, and by the Learning Designer (L4) for learning and ethics.

| ID | Task | Waiting on |
| --- | --- | --- |
**Owner:** Jay assigned S1–S8 to the Dojo-Ascent Researcher & Planner on Oct 23 (the separate Game Systems Designer bot was not set up).

| S1 | **Done (PR #12).** #1 and #2 built (K4); #4 room twists in PR #22 (K5). **Combat depth proposal.** Combat is fun but needs more variety and more reward. Review what's built, plus Q1 when it lands. Propose up to 6 changes, ranked by fun per cost. Ideas to weigh: enemy mixes that force different answers, elite enemy modifiers, room twists, Form-switching moments, Perfect Counter chains, combo finishers, risk-and-reward choices between rooms, better hit feedback. Each change must keep the core skill of reading the warning, then answering. | nothing (use Q1 when it arrives) |
| S2 | **Delivered (PR #84).** **Item system spec.** Gear slots, rarity, stat ranges inside the power budget, drop sources by tier, breaking duplicates down into materials, and how gear stats and cosmetic looks stay separate. What's in launch and what comes later. | nothing |
| S3 | **Forms (stances).** One Form per kata in `docs/curriculum.md` (8 known so far): its name, how it plays, and the reason to switch to it. Plus the switching rules (how, when, cooldown) and how Forms stay simple for a 6-year-old. | J3 (kata character lines) |
| S4 | **Self-defense #1–30 delivered (PR #70); #31–40 seals and attacks #3/#4/#5/#15 delivered as S4b (PR #117); Injured status as S4c (PR #120); kick combos 1–7 delivered (PR #100); padded-staff wording (PR #102).** Katas wait on S3; #31–40 and combos 8–12 wait on Jay (J13). **Power-ups from real training.** Start with self-defense: give each of #1–30 in `docs/self-defense.md` an in-game effect that matches what the real technique does, using its game category, and follow the rules at the bottom of that file. Techniques in the same category should build on each other (for example, #13, #14 and #24 all kick a weapon away, each a little stronger). Replace the current placeholder powers. Then do the kick combos (after J2) and the katas (after S3). Finally, give a recommendation for each milestone 4 open question (content/abilities/abilities.json, and the PROGRESSION and POWER settings in docs/decisions.md). | self-defense: nothing · kick combos: nothing (J2 done) |
| S5 | **Delivered (PR #88).** **Difficulty.** Review core-design §12: is there a clear, kid-understandable reason to choose Challenge? Should young beginners be offered Guided automatically, given the 41% novice win rate? What does Endless Ascent give at black belt? | nothing |
| S6 | **Delivered (PR #80).** **Achievements.** The full list: categories, thresholds, what each awards (titles, trophies, decorations, cosmetics), certified real-world trophies versus game trophies, and the bow-question awards (5/10/20/50/100). No achievement may reward daily logins or punish missed days. | nothing |
| S7 | **Delivered (PRs #67, #73, #85; L4 reviews #71, #77).** **Earning decorations in play.** A table of every in-game source (chests by tier, first floor clears, Bestiary entries, Decoration sets, Challenge, Open House events, crafting later), with rough rates so a student finds something new every few runs. | nothing |
| S9–S12 | **Delivered:** S9 closest-goal line, count-up streak and first Mission (PRs #74, #85); S10 cosmetic unlock rules (PRs #87, #96); S11 enemy warnings (PR #98); S12 Journal practice (PR #99). These are specs, not built yet. S13 and S14 are parked. | — |
| S8 | **Delivered (PRs #91, #94).** **Similar games study.** For each game below, what Dojo Ascent should borrow and what to avoid: Hades, Archero, Soul Knight, Ring Fit Adventure, Pokémon GO, Animal Crossing, Pokémon, Duolingo, Prodigy Math, Punch-Out!!, Sekiro. | nothing |
| R-BAL | **Done (PR #176).** Sourced balance research and sim; follow-ups R-BAL-1 to R-BAL-7. | — |
| R-BAL-8 to 12 | **Done (PRs #183, #185, #186, #188, #190, #191, #193, #195).** C13 enemy stats, gear caps, Guardian stats, training-to-power plan. | — |
| R-BAL-13 | **Done (PR #224).** C13 stats restated as White-belt bases. | — |
| P-MENU | **Plan done (PR #225).** Build items P-MENU-a to h are in section 0b. | — |

---

## 7. Learning & Engagement Designer

| ID | Task | Waiting on |
| --- | --- | --- |
| L1 | ~~Fix your audit: Sensei's Lessons are built in milestone 7, not 10.~~ **Done:** PR #8, merged by Jay. | — |
| L2 | **Done (PR #68).** Update proposal 2 to the recall bow question (section 1, item 1). | nothing |
| L3 | **Delivered (PR #64).** **Coming-back audit.** Check the five loops against the built game: does a student have a good reason to play a few times a week, without pressure? What's missing at white belt specifically? | nothing |
| L4 | Review every Dojo-Ascent Researcher & Planner systems proposal (S1–S8) for learning value, overwhelm and ethics. | S1–S8 |
| L5-new | **Delivered (PR #114).** P1 difficulty and play-time review. | — |
| L5 | **Delivered (PR #32, merged Oct 24).** Spoken scripture waits on J9; text only until then. Original task: **Faith and creed in the game.** Using `docs/faith-and-creed.md` and the research on spaced recall, propose where the verses, covenants, FAITH DOES life words and the Class Creed appear (for example: the bow, the Gate, the promotion ceremony, Sensei's lines, the Lamp Keeper's story, a FAITH DOES collection) so students learn them by heart without it feeling like a test. The words are never reworded. | nothing |

---

## 8. Content Writer

| ID | Task | Waiting on |
| --- | --- | --- |
| C1 | **Milestone 6 dialogue merged (PR #9).** **Assigned to the Content Designer (Jay, Oct 24):** draft the Street Smarts script. **Milestone 6 material:** dialogue for Sensei, Senpai, Kohai, the second instructor and the founder; plus one Street Smarts scenario script for Jay to approve. | **Done (PRs #34, #58):** Jay's J11 answers applied. |
| C2 | **Delivered (PRs #66, #69).** Redo `dojo/sensei-bow-questions.json` as recall questions, with Sensei's lines for a correct answer, a wrong answer, and each award. Change the first lesson to "Tap where you want to go, or use the stick." | nothing |
| C3 | **Delivered (PRs #65, #86):** storm ending adopted. **Lore bible (lore first).** The Tower's history, the shattered light, the Guardian of every belt tier (white to black), and the Relics. Keep it to one page per tier. This becomes the foundation every quest and enemy is built on. | nothing |
| C4 | **Delivered (PRs #72, #76).** School details wait on Jay (J13). **Quest lines.** After C3 is approved: an outline of the main story chapter for each tier, the life-lesson quests (3rd belt), and the manners and culture quests. Outlines first; full scripts after Jay approves. | C3 |
| C5 | **Delivered (PR #31, merged Oct 24).** Verses use the dojo sign wording (Manager call). Original task: Faith content drafts, in the places L5 proposes, using the exact text in `docs/faith-and-creed.md`. | **Unblocked (Oct 24):** J4 answered (see section 6 of `docs/faith-and-creed.md`). Uses KJV text, and the material is learned through play, not used as Gate locks. | L5 |
| C6 | **Delivered (PRs #81, #90, #92).** Names and text for achievements, items and A1 cosmetics; rarity names Everyday/Special. | — |
| C8 | **Delivered (PR #97).** Bouncy Bopper text (the padded-staff enemy, from yellow belt). | — |
| C9 | **Delivered (PR #115).** Wording check for #108, #110, #113. | — |
| C10 | **Delivered (PR #123).** A6 decoration names and story lines. | — |
| S4c-C1 | **Delivered (PR #128).** Injured pop-up, Sensei line, Journal tip, recover line and seal suffix. **Manager calls:** lines under 80 characters are fine; keep the recover line. | — |
| S4c-C2 | **Delivered (PR #129).** Effect text for break seals #31–40. **Manager calls:** proposed ids OK (Programmer may adjust); seal names as subtitles with the "Self-Defense #N!" callout OK; keep "and leaves them Injured" on all ten, including #32, #33, #37, as the plan says; `effectRef` as a text pointer is fine. | — |
| C11 | **Delivered (PR #132).** Unique keeper statue and Journal trophy names and lines; in the game via #133. | — |
| C7 | **Delivered (PRs #90, #96).** Redo the technique callouts so each subtitle matches the real technique in `docs/self-defense.md` (for example, #3 is a spinning back fist, not "Sweep"). Kid-safe subtitles only. | S4 |
| C12 | **Delivered (PR #173).** Tutorial floor rewrite with combat tips (13 steps). Built under K24a. | — |
| C13 | **Delivered (PRs #178–#189, #196).** Bestiary: 40 enemies, 10 Guardians, dash-only attacks, Guardian stats. | — |
| C13-F | **Done (PR #229, cleanup #231).** Faith overlay, KJV. | — |
| C14 | **Done (PR #217).** Guardian form shifts; Jay approved. | — |

---

## 9. Art Director

| ID | Task | Waiting on |
| --- | --- | --- |
| A0 | **Done (PR #10 merged; K7 wired it in).** Yellow belt Tower kit in B Bamboo Garden Hall (`incoming-art/tower-rooms-t2/`), all 28 icons (`incoming-art/icons/`), and the full elite aura set for S1 #3 (`incoming-art/elite-auras/`). Manager calls on the small questions: delete `tower-rooms-t2/proposals/` before merge (B is chosen); one blue rim for all Seals is fine. Tier 2 in-game name and whether Guarding shows which enemies it protects go to the Researcher & Planner (S1). Artist: delete the proposals folder and take "do not merge" off the PR title. | — |
| A1 | **Samples delivered (PR #78).** **Earned cosmetics:** headbands, hand wraps matching the gear (cloth, leather, tiger stripe), gi trims, and a soft aura. 3 samples first. | nothing (J5 done) |
| A2 | **Done (PR #121, merged Oct 24).** Rooted Form uses option A, the wide fighting stance; option B moved to `alternate-not-used/`. Use the stance idle in place of the guard idle while a Form is equipped, in fights and the Tower only. Wired in when Forms are built (after S3). Later Forms follow S3. | — |
| A3 | **Samples done (PR #138, merged Oct 24).** **Manager calls:** (1) yes, the badges are the achievement icons on the Goals page and the award pop-up, next to the reward; (2) the game draws the number under each badge in its UI font, nothing baked in; (3) the plate shows a short date, and the full "Earned {date}" line goes in the info pop-up; (4) **Jay (Oct 24):** the Certified seal uses Action Zone's logo or colours, built as a swappable school layer so other dojos can use their own (A3 follow-up with the Artist); (5) working ids are fine. | — |
| A3b | **Done (PRs #148, #158; seal #146, logo A3c #165).** Certified trophy set, S6 badge family, Student of the Month trophy. | — |
| A6 | **Done (PRs #122, #124, #125).** Tier 1 decoration set, 7 scrolls + 6 gear class pieces, White-belt fallback colour. Into the game under K13. | — |
| S4c-A1 | **Done (PRs #126, #130).** Cartoon bandage and dizzy stars for Injured: enemies only, stars at head height, 2 stars on the Floor Keeper. | — |
| A8 | **Done (PR #136).** Monster Journal silhouettes for the Floor Keeper and the Bouncy Bopper. Into the game under K14. | — |
| A5 | **Full set done (PR #111).** Samples PR #95. Padded-staff enemy (Bouncy Bopper) idle, wind-up and attack. Numbers in PR #102. Next: the full animation set (move, hit, stagger, defeat, staff drop). | nothing |
| A4 | **Done (PR #301, Jay approved Oct 25).** **Town square concept:** one picture of the dojo town (Student of the Month statue, doors to classmates' dojos, the Tower in the distance) for Jay to approve before any building. | nothing |
| A-WALK | **Closed (PR #199).** Jay keeps the original walk. | — |
| A-BEST | **Items 1–4 delivered:** bestiary sample v2 (PR #207, done), dash warning art (PR #209, done), dash-only warning art (PR #209), Guardian concepts v2 (PR #211), gear icons (PR #212, merged); charms without red (PR #214). Bestiary set 1 (PR #234) approved by Jay and merged; **Manager calls:** use the data id `buzz-bee` on import, soft nubs instead of thorns and no bee stinger are OK (kid-friendly), flyer hover height is OK. **Artist's current item (assigned Oct 25, 9:55 PM): the next bestiary set** (sample approved). Guardian concepts #211 and charms #214 still wait on Jay. | nothing (bestiary); J15 (#211, #214) |

---

## 10. DojoForge (outside this repository: Jay and Nic)

| ID | Task |
| --- | --- |
| F1 | **Instructor sign-off at 40–200 students.** The game only reads sign-offs from DojoForge; it never marks them. Make sure DojoForge's instructor screen has: tonight's class roster with "Ready to show Sensei" students on top; one-tap OK and Not yet, with no typing; **group sign-off** (pick a technique, tap everyone who passed, save once); undo for a few minutes; works on a tablet with weak Wi-Fi; and permissions so assistant instructors can sign off. The feed fields the game expects are in `fixtures/` (signedOff, signedOffOn, signedOffBy). |

---

## Appendix: Systems design

The systems design work (S1–S8) moved to the Dojo-Ascent Researcher & Planner (drafts/planning/) on Oct 23; the separate Bot 6 instructions are retired.

### S3 Forms from the school's kata sheets (plan: drafts/planning/S3-forms-kata-plan.md, PR #161)
| ID | Task | Owner | Waiting on | Done when |
| --- | --- | --- | --- | --- |
| S3-J1 | Jay answers kata questions Q1–16 (in the plan). Manager calls: D1 in-game shows names, step counts and arrows only; D2 practice room after launch; D3 Key On and D&G Forms in milestone 10. | Jay | nothing | Answers recorded in the plan. |
| S3-J2 | Jay's character lines for the Key On and D&G Forms. | Jay | nothing | Lines in the plan. |
| S3-K1 | **Done (PRs #163, #166, #168).** Kata data files; Keon spelling and #3/#4 from Jay. | Content Designer | — | As in the plan. |
| S3-P1 | **Done (PR #169).** Kata cards on the Abilities tab. | Programmer | — | As in the plan. |
| S3-A1 | **Delivered (PR #227); Manager first pass OK; waiting on Jay's 3 questions (J15).** Direction picture and kata icons. | Artist | nothing (walk samples PR #199 and A3c PR #165 done) | As in the plan. |
| S3-D1 | Design the two new Forms. | Researcher & Planner | S3-J2 | As in the plan. |
| S3-P2 | Calm practice room (after launch). | Programmer | launch | As in the plan. |
| S3-T1 | **Done (PR #174).** Kata cards checked against the sheets. | QA Tester | — | As in the plan. |
