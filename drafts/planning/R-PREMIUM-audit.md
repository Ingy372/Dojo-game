# R-PREMIUM audit: what keeps Dojo Ascent from feeling premium

We copy the polish of the big hits, not how they make money. That means no purchases, ads, loot boxes, pressure, streak punishment or guilt. The game is for ages 6+ and stays hopeful. Real training stays the main source of power, wind-ups are never shortened, and the R-BAL-12 bands must keep passing.

## How I checked
- **Live build** (https://dojo-ascent.jay-lindemuth.workers.dev, version "Oct 26, 12:43 AM"): headless Chrome on the box, landscape phone size (844×390). The screenshots are in `r-premium-audit/`.
  - **Reached:** the privacy screen (1), the title (2), character creation (3), the Bow step (4), and room 1 with Sensei's tip card (5).
  - **Not reached:** a real fight. After the first card, my scripted taps on "Got it" did nothing (screenshot 5 shows the same card for about 20 s). This may be my tap method rather than a bug, so a Tester should check it on a phone (R-PREMIUM-d).
- **Repo:** `apps/client` (the game screens) and `packages/sim` (the game rules). The look and feel of hits, music and menus during a fight come only from reading the code.
- **Systems:** evidence from the merged plans R-BAL-12, R-BAL-9, R-STANCE-c, B-MASHER and B-MASHER-2, plus my open #302 and #314.

## Already strong (keep)
- **Hitstop (a short freeze on hits) scaled by hit strength:** basic 20 ms, Strike 95 ms, Great Counter 180 ms, enemy down 120 ms (`GameScene.ts` lines 143–148). This matches Sakurai's rule that stronger hits freeze longer ([Famitsu column](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/)).
- **Hit feedback:** damage numbers, a hit flash, and kind words such as "BLOCK", "Ding! Bonus prize!" and "WIND STEP!" (`floatText` calls in `GameScene.ts`).
- **Open Leg Stance now has its reward:** merged in #315 (`content/abilities/abilities.json` `ready-stance`): power +3%, dash recharge −10%, blockCut 0.05, focus +8%. This was item f, now done; the other item letters are kept as they were (no f).
- **Calm, honest first screen:** "Saved on this phone… no accounts, no ads, no purchases" (screenshot 1). The hits can't say this.
- **Character creation** is quick and friendly, with Sensei naming your real belt (screenshot 3).

## Gaps, ranked by felt impact per effort
| # | Gap | Now (evidence) | What the hits do (source) | Item · Owner | Done when | Waits on |
|---|---|---|---|---|---|---|
| 1 | **No particles** | No particle or emitter code in `apps/client/src` (search finds 0 hits). A hit is a number, a flash and a freeze only. | "Juice It or Lose It" adds particles as one of its core layers ([GDC Vault](https://gdcvault.com/play/1016789/Juice-It-or-Lose), [summary](https://gdad.wiki/wiki/sources/source-juice-it-or-lose-it)). Nijman's 30 tweaks include impact effects ([Game Developer](https://www.gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games)). | **R-PREMIUM-a** · Programmer | Basic hit, Strike, Great Counter, Block and enemy down each show a small spark or dust burst. Great Counter is the biggest. Reduced motion shows fewer. Phone frame rate stays smooth (Tester checks on Jay's phone). | Artist spark sprites (can start with simple shapes) |
| 2 | **Sounds are all made in code** | `audio/Sfx.ts`: "Simple sounds made in code… no sound files". Only 2 music loops (`assets/audio/music`). | Purho: sound is "the most cost effective thing you can add" (same source as gap 1). | **R-PREMIUM-b** · Artist | A licensed (for example CC0) hit, block, Great Counter, Strike, room-clear and belt-reward sound set replaces the code sounds. Volume settings still work, and licenses are in `assets/audio`. | Question for Jay: keep the soft sounds made in code, or use recorded ones? |
| 3 | **Your own hits never shake the screen** | K25 (`docs/decisions.md`): no shake when you attack; being hit shakes only at Brown belt and up or on Challenge. This was Jay's call after his phone playtest. | Nijman shakes the screen against your own shots ([talk](https://www.youtube.com/watch?v=AJdEqssNZ-U)). Soul Knight makes shake a setting ([TouchArcade review](https://toucharcade.com/2017/03/10/soul-knight-review), [players on shake levels](https://www.reddit.com/r/SoulKnight/comments/hr0m7k/what_screen_shake_level_do_you_use/)). | **R-PREMIUM-c** · Programmer | A tiny camera kick on a Great Counter only (never on basic hits), off with Reduced motion, plus a Settings slider for shake (off, low, normal). | **Question for Jay** (it reverses part of K25) |
| 4 | **Onboarding cards stop the action** | First room: a Bow step, then a card, then another card ("This room is big…"). In my headless run the second card wouldn't close (screenshot 5). | Archero teaches with one thumb and no reading: "stop to shoot, move to evade" ([Game Developer: Finding the Fun](https://www.gamedeveloper.com/design/finding-the-fun-archero-part-1---gameplay)). Supercell found extra tutorial steps added friction without improving next-day return ([GrowthBook podcast](https://www.growthbook.io/podcast/episode/1-36)). | **R-PREMIUM-d** · Tester, then Learning & Engagement Designer | Tester: on a real phone, every card closes on the first tap (pass or bug filed). Designer: the first room teaches move, Counter and Strike by doing, with at most 1 card that has to be dismissed. | Tester result |
| 5 | **Kid bot (age 6) still loses often; masher rarely wins** | B-MASHER-2 (E3, now built): kid bot wins 56.5% with 0 KOs in room 1. Masher bot won 6–8% before the fixes (R-STANCE-c); not yet re-measured after E3. Smart-bot damage is −12% to −15% (target was within about 10%). | Archero's "Angel and Devil" helps weaker players and adds challenge for skilled ones (Finding the Fun, above). | **R-PREMIUM-e** · Tester | A fresh sim (kid, masher, smart bots, belts 1–10) is posted. Jay sees the numbers and picks the kid target. Band test passes. | Question for Jay: is a 56% kid win rate enough, or aim higher? |
| 6 | **Kata rewards are placeholders** | #302: 9 katas, 2 options each, untested. | — | **R-PREMIUM-g** · Content Designer | Each kata has 1 picked reward with kid words and an icon request. | Toni's kata descriptions; Jay's picks |
| 7 | **Boss defeat feels like any other enemy** | Enemy down is 120 ms, the same for every enemy (`GameScene.ts` line 148). I found no separate boss moment in the code (unconfirmed). | Sakurai's "boss-stop": freeze and flash the instant a boss falls ([Sakurai on Creating Games](https://en.senkohome.com/sakurai-game-dev-specification/)). | **R-PREMIUM-h** · Programmer | Guardian or boss defeat: a longer freeze (no more than 300 ms), a white flash (soft with Reduced motion) and a cheer line. No timing change before the KO. | none |

## Scope vs the Dec 15 beta
- **Fits the beta** (small, low risk): c, d (Tester half), h.
- **Medium:** a, b. Each is a few days and needs an art or sound source.
- **Scope creep, do after the beta unless Jay says otherwise:** the redesign half of d, plus g, and any new gear or progression systems. I found no evidence from the hits that our gear and progression *structure* is the problem. The R-BAL-9 gear caps hold.

## Questions for Jay
1. **Shake (c):** OK to add a tiny kick on Great Counter only, plus a shake slider? This changes part of K25.
2. **Sound (b):** recorded sound effects, or keep the soft ones made in code?
3. **Kid target (e):** is a 56% kid win rate enough?
4. **Beta scope:** confirm a and b can wait until after Dec 15 if time is short.

## Delivery Note
- **ITEM:** R-PREMIUM-audit
- **WHAT:** a ranked list of 7 gaps (feel and systems) with sources, owners and "Done when" lines. Live screenshots from the title through the first room, but not a fight.
- **WHY:** Jay wants the game to feel premium without copying how the hits make money.
- **DECIDE:** the 4 questions above.
- **NEXT:** the Manager puts R-PREMIUM-a to h (no f; f was done in #315) on the board. The Tester runs d first on a real phone.
