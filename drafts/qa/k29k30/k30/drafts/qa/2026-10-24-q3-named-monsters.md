# Q3: Named monsters (M7-N1, PR #104), QA report
Saturday 2026-10-24, America/New_York (EDT). Tested at main 6ebdce7. Playwright at 844x390 and 667x375, plus sim runs (5,000 floors per cell). Screenshots: /workspace/qa/q3/

## Delivery Note
- **ITEM:** Q3. Test the named monsters (Old Thumper, Zippy Zoom, Captain Clank).
- **WHAT:** Spawn rules match the spec. Fights, wind-ups, the first-win stamp and sticker, and "nothing extra on a second win" all work. The journal works at both sizes. No page errors.
- **WHY:** We need to know named monsters are safe for kids before the next release.
- **DECIDE:** (1) Should reduced motion get an in-game setting? Today it only follows the phone's OS setting, and only the brute's stamp shake turns off. (2) Is the uneven mix OK (Zippy shows up about 45% of the time)? (3) The Sensei line that should introduce the journal is never used.
- **NEXT:** Fix the cut-off "freed" Sensei line at 667. Make ?named= reliable for phone tests.

## Bugs (most serious first)
1. **Sensei "freed" line runs off the screen at 667x375.** *Did:* beat Old Thumper at 667x375. *Happened:* the line reads "ensei: The shadow is gone, and Old Thumper can res…" with both ends cut off. The gold "Decoration: Old Thumper Sticker" label also sits on top of the banner, and at 844 it covers Zippy's line too. *Should:* the whole line fits on screen, and the sticker label sits clear of it. **ANNOYING.** (667x375-old-thumper-freed.png, 844x390-zippy-zoom-freed.png)
2. **The ?named= test link doesn't reliably give that monster.** *Did:* ran ?named=X without &room=, 500 seeds each. *Happened:* old-thumper gave Old Thumper only about 70% of the time, and no named monster 28 times. captain-clank gave a different monster about 20% of the time. *Should:* always give the monster named in the link. Adding &room= works. **ANNOYING** (for Jay's phone tests).
3. **Reduced motion is OS-only and cuts very little.** *Did:* turned on prefers-reduced-motion and watched the wind-ups. *Happened:* only Old Thumper's stamp shake stops (3 shakes down to 1; the 1 left comes from hits). Sparkles, the dash trail, plate fades and tap flashes all stay. There's no in-game setting, so there's nothing to save. *Should:* match whatever the spec decides. Today a parent can't turn it on in the game. **ANNOYING / DECIDE.**
4. **The mix isn't equal.** *Did:* sim, about 1,100 spawns. *Happened:* Zippy Zoom about 45%, the other two about 27% each. The "swap to a type in the room" rule causes it, because swarmers are in most rooms. *Should:* the spec says equal chance. **SMALL** (or a design call).
5. **The Sensei journal-intro line is never shown.** senseiIntro is in named.json, but nothing uses it. *Should:* the spec says one Sensei line introduces the journal the first time. **SMALL.**
6. **Name plate overlaps.** The plate can sit over other enemies or the player (Zippy). At 667, a monster near the top edge can sit under the HUD. The plate stays on the spot after a defeat (it fades). With the tutorial guide on, the guide banner covers the plate. **SMALL.**
- **Known (not re-filed):** small fact text; Old Thumper's fact overlapping the stamp art; ?named= runs counting. On the last one, runsStarted stayed at 0 on ?named= runs in my tests.

## What passed
- **Spawns (sim):**
  - 4.1–5.0% per floor on tiers 2–8. 0% on tier 1, in the first 3 runs and on test-link runs.
  - The same on every difficulty, Guided included.
  - Never twice in a run, never before room 3, never in challenge, boss, treasure or rest rooms.
  - Never with an elite. The elite cap was never broken.
- **Health:** ×1.5 is right (270 / 60 / 135).
- **Wind-ups:** all three show at both sizes.
- **First win:** sets beaten, gives the stamp and one sticker each (3 stickers after all three).
- **Second win:** nothing extra (still 3 stickers, no decoration label).
- **Journal:**
  - One page with no scrolling, fits at 667.
  - Unmet card: grey silhouette, "?" and "Keep exploring!". No counts.
  - Nothing for sale. The tone is friendly with no pressure.
  - Closes with ✕ or by tapping outside it.
- **Journal button:** hidden at white belt, shown at yellow.
- **Errors:** no page errors in any run.

## Playability
- **Age 6:** The names and the sticker reward are exciting, and the journal is easy to read except the small facts (known). The cut-off Sensei line will confuse a new reader.
- **Age 12:** Wind-ups are easy to read. Seeing Zippy far more often than the others makes it feel less rare.
- **Adult:** Safe and kind, with no shop and no guilt. The parent-facing gap: reduced motion can't be turned on in the game.
