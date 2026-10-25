# QA review of the 2026-10-18 balance report (commit 586641d)

Most of the report holds up: the cliff between Guided and Standard, and the walls at Keeper's Hall and the Training Yard, are real. The likely problem is that the simulation is more optimistic than real kids will be.

1. **The computer player doesn't play like a young child.** It wins 93–98% on Guided as a novice. In a real Guided playtest on Oct 12, though, mashing Strike lost the run in room 1 after about 14 seconds. Ask Claude to add a third "masher" style to `packages/sim/test/balance/bot.ts` that presses only Strike and never counters or dodges, then re-run the report. That is probably the real floor for a new white belt.
2. **Run length doesn't match the target.** A won run takes about 2–2.5 minutes, but the target is 5–7 minutes. Check whether the bot is just much faster than a person or the runs really are shorter than intended, before tuning anything else.
3. **Keep the bare-white-belt numbers alongside the re-run.** Re-running with real student strength is a good idea. But a brand-new white belt really does start with no gear, Seals, Virtues, or Insights, and the first few runs are where you lose them, so tune for both.

## Recommendations
- **Start new players on Guided.** Have Sensei offer "Ready for Standard?" after their first win. Skip "offer Guided after two losses", because it can feel like being sent down.
- **Restart at the boss.** Let a player who loses at Keeper's Hall restart there instead of at the beginning of the run. This is the simplest fix for the worst moment in the game.
- **Training Yard:** make it easier or move it later in the run.
- **Loot gap:** losing runs already keep everything they found. The real gap is that weaker players collect fewer items, so give them more drops or a small reward when any run ends.
- **Guided grades:** hide S grades for younger players instead of making Guided harder.
