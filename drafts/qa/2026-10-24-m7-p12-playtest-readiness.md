# M7-P12 Playtest-readiness check — 2026-10-24

## Delivery Note
- ITEM: M7-P12 playtest-readiness check (plus K12 re-check)
- WHAT: 5 fake profiles played through the first session in a browser bot at phone sizes 375x667 and 390x844. Tutorial simulated 3,000 times. Named-monster rate checked over 30,000 seeds. All 290 tests pass.
- WHY: To find out whether a real kid can sit down and play the first 30 minutes without getting stuck, lost, or crashed.
- DECIDE: Whether to start the playtest now and fix the SMALL items later.
- NEXT: Someone with push access opens a PR with this report under drafts/qa/ (my pushes return 403). One short browser look at the named-monster name plate is still needed (see open items).

## Verdict: READY (with small fixes suggested)
No crashes, no way to lose the tutorial, and the first Perfect Counter comes in under 25 s for every profile. Nothing BLOCKS PLAY.

## Checklist
| Check | Result |
|---|---|
| Crashes / page errors (10 browser runs, 2 crawls, 3 named runs) | PASS (0) |
| Time to first Perfect Counter (wall clock from page load) | PASS: 16–20 s at 667, 22–23 s at 844 |
| Tutorial finished, back at Home | PASS: 10/10, 40–52 s |
| Ways to lose the tutorial | PASS: none (health floor 1; 200/200 clears for plain, late and flailing players on all 3 difficulties) |
| Kid who never taps Counter | PASS: waits forever, but a nudge ("Take your time. Tap the blue COUNTER button!") plus a pulsing button are wired up (GameScene.ts:1029) |
| One sentence per screen | MOSTLY: most lines are 2 very short sentences; see SMALL bugs |
| No Power Rating outside test screen | PASS (only item stats like "+9% Power") |
| Nothing for sale | PASS in spirit; "$" door icon is the only worry |
| No chat | PASS |
| No guilt | PASS (retry lines are kind) |
| K12: named rate about 1 in 30 | PASS: 3.33% at belt tiers 2–4, 0% at tier 1, never in the tutorial |
| K12: reduced-motion toggle, Q3 named fixes | Sim and tests PASS; browser view of the name plate NOT confirmed (see open items) |

## Bugs (most serious first)
1. ANNOYING: The results card after the first floor is very dense for a 6-year-old.
   - I did: finished the tutorial.
   - It did: Home shows a Sensei popup over a card with grades, combo, time, XP, trophies, 5–7 items with stats, and personal bests.
   - It should: show one simple win line first ("Floor cleared!") and let the details come later.
2. SMALL: A "$" marks the treasure door on the Last-run path (HomeScene.ts:61 `KIND_MARK`).
   - I did: looked at Home after a run.
   - It did: showed "$", which reads like money in a game that has nothing for sale.
   - It should: use a chest or star icon.
3. SMALL: Several screens use two sentences or are long.
   - Title: "Climb the Tower. Train in the dojo."
   - Create: "Sensei says you're a White Belt. Make your character!"
   - Guided offer: "You can try Guided. You can change it any time in Settings." (12 words)
   - Street Smarts unlock: 13 words.
4. SMALL: The room-clear text says "-100 health". That may sound harsh to kids; "Lost 100 health" or hiding it would be softer.
5. SMALL: At 375x667, the Sensei banner "It will help you on this climb." sits over the only treasure door.
6. SMALL: "3 COMBO" stays on screen after the fight ends.

## Playability by player
- Age 6: The first Perfect Counter comes fast (about 16–20 s) and you can't fail, which is great. The post-floor card has too much reading. A "$" may confuse them.
- Age 12: Short, punchy tutorial (about 30 s of play). Loot and trophies give good reasons to come back. Gear numbers are fine at this age.
- Adult/parent: No shop, no chat, no guilt. Real training shows up first ("YOUR NEXT STEP", next class, test day). The play-time limit help text is long, but it is a grown-up screen, so that's OK.
- Balance: tutorial median 18–31 s of sim time; even a flailing player clears it.

## Open items
- The named-monster name plate and freed line were not caught by the bot at 375x667. Three runs (`?named=old-thumper&room=brute-and-swarm`, `captain-clank&room=shield-escort`, `zippy-zoom`) finished with 0 errors, but the bot saw no name text. Either the bot missed it or those runs went through the tutorial. A person should look once.

## Files
- /workspace/qa/m7p12/: sim.json, named.txt, drive.jsonl, named.jsonl, crawl.json, plus about 370 screenshots
- Scripts: drive.mjs, drive2.mjs, crawl.mjs; sim tests p12*.test.ts (untracked, not committed)
