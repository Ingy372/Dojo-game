# R-PREMIUM audit: final board items

Goal: make it feel premium. Copy the polish of the hit games, never how they make money: no purchases, ads, loot boxes, pressure or guilt. For ages 6+. Wind-ups stay as they are and R-BAL-12 bands must keep passing.

Tester findings are folded in from Q-PREMIUM (`drafts/qa/Q-PREMIUM-pass.md`, PR #319 and its retest). Credit to the Tester. Each item below cites the Tester's number (Q#, or F# for follow-up findings).

Jay's answers (via the Manager, Oct 26):
- no camera kick on Great Counter; use a motion slider for the hit-flinch instead
- free sound packs are fine if the license allows selling the app
- particles (a) and sound (b) may slip past Dec 15

## How I checked
- **Live:** headless Chrome at 844×390 got from the title to room 1 (shots in `r-premium-audit/`). The Tester covered fights, the boss, losing and winning by real touch.
- **Repo:** main at 66c503f.
- **Numbers:** the balance-check skill (`/home/box/agent-data/workflows/balance-check/SKILL.md`), run across every belt and difficulty. See the table below.

## Already strong or already fixed (no item)
- **Hitstop by hit strength:** basic 20 ms, Strike 95 ms, Great Counter 180 ms (`GameScene.ts` lines 143–148). This matches Sakurai ([column](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/)).
- **Damage numbers, hit flash, kind wording** ("Good effort!", "You keep everything you found").
- **Open Leg Stance reward:** done in #315 (`ready-stance`: power +3%, dash recharge −10%, blockCut 0.05, focus +8%). This was item f.
- **Settings exit (Tester F2):** a Done button, merged in Q-PREM-F2.
- **Bow first tap and menu taps pointing at Bow (Tester F1):** fixed in Q-PREM-F1. Tester to retest 10 of 10 taps.
- **Loss screen shows only Back home with controls hidden (Tester F4, run-over card):** merged in Q-PREM-F4 and F5.

## Balance check (kid 56.5% question)
**Which difficulty:** the 56.5% was **Standard**, the middle setting, not the easiest.
- Source: `packages/sim/test/b-masher-kid.test.ts` line 18: `playRun(content, 1000 + i, 'kid', SKILLS.novice, 'standard', student(tier), …)`.
- The B-MASHER-2 doc says "belts 1–10, 20 seeds, Standard".
- The settings are guided (easiest), standard and challenge (`config.ts` line 45: default `'standard'`).

**My re-run reproduces it exactly** (main at 66c503f, the same bots, 20 seeds per belt, typical student stats per belt). Wins are out of 20 per belt:

| Difficulty | Bot | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | B10 | Total | Room-1 KOs | Target | Pass |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Guided | kid | 10 | 17 | 20 | 14 | 15 | 15 | 11 | 13 | 13 | 11 | 69.5% | 0 | none set (untested) | ? |
| Standard | kid | 4 | 12 | 20 | 10 | 13 | 13 | 9 | 11 | 11 | 10 | **56.5%** | 0 | ≥50%, 0 KOs (B-MASHER-2 gate) | pass overall; **B1 20% fails** |
| Challenge | kid | 3 | 6 | 20 | 3 | 3 | 3 | 1 | 1 | 3 | 3 | 23.0% | 17 | none set | ? |
| All three | smart (typical) | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 20 | 100% | 0 | none set | ? |

Flags from the check:
- **The White belt kid wins least.** Belt 1 is 20% on Standard and 50% on Guided, worse than every other belt.
- **Belt 3 is an outlier:** 20/20 on every setting, including Challenge, where its neighbors win 3–6. These are jumps of more than 2× between neighboring belts.
- **The smart bot wins 100% everywhere,** so the top of the ramp is flat. That matches R-STANCE-c.

I propose no new numbers. The Guided and Challenge targets are **untested**, because none are defined.

## Final items
Order: biggest felt impact per effort first. Item letters are kept (no f). New items continue from i.

| ID | What | Owner | Done when (a tester checks) | Waits on | Beta (Dec 15)? |
|---|---|---|---|---|---|
| **R-PREMIUM-d** | Tutorial walk step: name the glowing spot in the text ("Walk to the glowing circle"), move it clear of door labels, and add a hint after about 10 s (Tester Q1). | Learning & Engagement Designer | On a fresh profile at 667 and 932 by touch, a new player reaches the spot in under 30 s. The ring touches no label. | none | Beta |
| **R-PREMIUM-i** | Sensei dialog: one fixed banner spot with a portrait. It never covers the stick, the player or "Room x of y". Lines with no button fade after a few seconds (Tester Q2). | Programmer | In the tutorial and room 1, every Sensei line shows in the same spot. A line with no button is gone within 6 s. Nothing covers the stick. | Artist portrait (a placeholder is fine) | Beta |
| **R-PREMIUM-j** | Room-clear beat: a readable "Room clear!" banner, exit doors light up with an arrow, door labels stay inside the safe area, and a short fade instead of the black frame between scenes (Tester Q4, Q8, F3, retest 2–3). | Programmer | After clearing room 1 at 667×320 and 932×430: the banner is readable for at least 2 s with no overlap, the doors glow, no label is clipped, and there is no all-black frame on Board → Game. | none | Beta |
| **R-PREMIUM-h** | Boss presence: an intro card with the name, a named boss bar, a larger sprite, floating text capped and staggered, and a defeat moment (a freeze of no more than 300 ms, a soft flash, "Floor Keeper defeated!"). Timing before the KO is unchanged (Tester Q6, retest 1). Source: Sakurai's boss-stop ([summary](https://en.senkohome.com/sakurai-game-dev-specification/)). | Programmer | In keepers-hall: the name shows on entry and on the bar, at most 3 floating texts at once, and the win shows a boss line, not the plain "Room clear!". The flash is soft with Reduced motion. | Artist larger sprite (the scale can go first) | Beta (sprite may slip) |
| **R-PREMIUM-n** | Show the letter grade only on Challenge. Right now `showGrade` runs for every graded room on every setting (`GameScene.ts` line 1559; `run.ts` line 26). | Programmer | Clearing a battle room on Guided and Standard shows no letter. On Challenge it does. The "Room clear!" line still shows on all three. | none | Beta |
| **R-PREMIUM-o** | Hide placeholder text: "(its reward arrives in a later update)", "Its power arrives in a later update" and "▶ Video soon" (Tester Q11, Q12, F6). Fits with g. | Programmer | A search of the player-visible strings in `content/` and `apps/client` finds none of these lines. Welcome card, Board and Trophy Case screenshots are clean. | none | Beta |
| **R-PREMIUM-l** | First visit: one welcome sequence shown once, instead of 4 pop-ups in a row. Reword "Pick up your climb?" because it contradicts "start again at room 1" (Tester Q7). | Learning & Engagement Designer | On a fresh profile, at most 2 pop-ups before the dojo. The Home Dojo intro doesn't return on the next launch. The wording matches what happens. | none | Beta |
| **R-PREMIUM-k** | Lose screen: dim the room instead of black, show a Sensei portrait with a cheering pose, and one big "Try again" (Tester Q5, F4). | Artist | A boss loss at 667×375 shows the room dimmed (not black), a portrait and one large button. The wording stays no-guilt. | i (portrait) | Beta |
| **R-PREMIUM-m** | "What is this for" framing: a one-line goal banner in the Practice room ("Practice your Counter. No score here."), and short preview cards on Scroll (Tester F7, F8). | Content Designer | Opening the Practice room and Scroll each shows one sentence saying what it's for, readable at 667×320. | none | Beta |
| **R-PREMIUM-c** | Motion slider for the hit-flinch when an enemy hits you (off, low or normal), plus Reduced motion stays fully off. There is no camera kick on your own hits (Jay). Today the hurt-shake is 0 below Brown belt and off-Challenge (`config.ts` line 422, K25b). | Programmer | Settings has the slider. On "off" there is no hurt-shake or flinch. Reduced motion forces it off. The setting survives a reload. | none | Beta |
| **R-PREMIUM-e** | Balance follow-up from the table: why White belt kids win only 20% on Standard, and why belt 3 wins 20/20 even on Challenge. Report only, no numbers changed. | Tester | A short report explains both, with a re-run of the table above. | none | Beta |
| **R-PREMIUM-a** | Hit particles: small sparks or dust on basic, Strike, Great Counter, Block and enemy down. There is no particle code in `apps/client/src` today. Sources: "Juice It or Lose It" ([GDC Vault](https://gdcvault.com/play/1016789/Juice-It-or-Lose)) and Nijman ([summary](https://www.gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games)). | Programmer | Each of the 5 events shows a burst. Reduced motion shows fewer. Jay's phone stays smooth (Tester). | Artist sprites (simple shapes are fine) | May slip past Dec 15 (Jay OK) |
| **R-PREMIUM-b** | Recorded sound effects from a license-checked pack (see the sound packs section) to replace the made-in-code ones in `audio/Sfx.ts`. | Artist | Hit, block, Great Counter, Strike, room-clear and reward use pack sounds. The pack's license file is in `assets/audio`. Volume settings still work. | none | May slip past Dec 15 (Jay OK) |
| **R-PREMIUM-g** | Kata rewards: pick 1 of the 2 options in #302 for each kata, with kid wording. | Content Designer | Each of the 9 katas has one reward in content. Its placeholder line is gone (with o). | Toni's kata text; Jay's picks in #302 | Post-beta (scope creep) |

## Sound packs (licenses read from their own pages, Oct 26)
| Pack | License (quoted from the source) | Credit needed? | Selling the app OK? | Caveats |
|---|---|---|---|---|
| **Kenney** (for example [Impact Sounds](https://kenney.nl/assets/impact-sounds)) | "all game assets on the asset pages are public domain licensed (CC0)… even in commercial projects" ([kenney.nl/support](https://kenney.nl/support)) | No. Optional "Kenney". Don't use the Kenney logo. | Yes | Safe in our public repo. **Best first pick.** |
| **OpenGameArt**, only items marked CC0 | CC0 means "used in anyway without asking, crediting or notifying"; "commercial use is ok" ([OGA FAQ](https://opengameart.org/content/faq)) | No for CC0. CC-BY, CC-BY-SA and OGA-BY need credit. | Yes for CC0 | Check each item's own license. The FAQ says CC-BY and CC-BY-SA conflict with DRM and Apple's App Store terms. **Use CC0 only.** Preview clips may be "All rights reserved". |
| **Sonniss #GameAudioGDC** | "royalty-free… for personal and commercial projects without attribution"; may be "sold as incorporated into licensee project" ([license v2.0](https://sonniss.com/gdc-bundle-license/)) | No | Yes, inside the game | You may not "distribute, publish… or otherwise supply the sound effects as sound effects to any other person". **Our repo is public on GitHub,** so committing the raw files could count as supplying them. A Programmer or Jay must decide where the files live before use. No AI training with them. The terms are English law. |

**Kids:** none of these licenses mention children or kids' apps. The only kids caveat is ours: listen to every sound for anything scary or harsh before it ships. I invented no terms; everything above is quoted from the linked pages.

## Questions for Jay (still open)
1. **Heal between rooms:** health carries over today (`run.ts` line 51; Tester F3: room 2 "starts in the red"). Add a small heal between rooms **on Guided only**? This is a question, not an item.
2. **Targets for Guided and Challenge:** the balance check found none. What kid win rate do you want on Guided, and does White belt need its own target?

## Delivery Note
- **ITEM:** R-PREMIUM-audit (final)
- **WHAT:** 14 board items (a–e and g–o, no f), each with one owner, a "Done when" line, what it waits on and whether it fits the beta. Includes the Tester's Q-PREMIUM findings (credited), a balance-check table across every belt and difficulty, and sound-pack licenses verified from their own pages.
- **WHY:** Jay wants the game to feel premium without copying how the hits make money.
- **DECIDE:** the heal on Guided only, and the Guided and Challenge kid targets.
- **NEXT:** the Manager boards the items, starting with d, i, j and h. Tester runs e. a and b may slip past Dec 15.
