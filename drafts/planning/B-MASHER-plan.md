# B-MASHER: help the youngest players

## What is going wrong

The masher bot (a 6-year-old who never Counters) wins only 6–10% of runs. Most of those runs end in room 1. This happens with every stance, so stances are not the cause.

**Root cause:** at most belts, room 1 is **Pillar Court**, which has 2 shield enemies and 2 swarmers.
- Basic attacks bounce off a shield. A bounce gives no damage and no Focus.
- Only a Strike breaks a shield, and a Strike costs 30 Focus.
- Focus only comes from hits that land. After the 2 swarmers are gone, the masher keeps tapping the shields, gains nothing and never Strikes. The shields hit back 13–14 times and knock it out in about 15 s.
- The probe showed this at every belt except belt 3. The masher threw **0 Strikes** and did **0 damage** to the shields. The smart bot cleared the same room with 11 Strikes.
- **Belt 3 is the exception.** It uses Ember Kitchens, where room 1 has no shields, and the masher wins 65–75% there.
- Belt scaling (#208) is not the cause. It scales Health and Power evenly, and wind-ups already stay at base values ("timings never scale"), so a wind-ups fix has nothing to change.
- Starting HP and gear are not the cause. The smart bot uses the same numbers and takes only about 8% damage in that room.

**Sim artifact or real problem? Mostly a real game problem.**
- The masher bot is a bit too strict: it never presses anything but Strike, and only when Focus is ready. Real 6-year-olds press every button.
- So I tested a more realistic **"kid" bot**. It mashes like the masher, but on about 12% of ticks it presses a random button (Counter or Strike) aimed at a random enemy.
- The kid bot still wins only **9%** and dies in room 1 in about half of runs. A real young player hits the same shield dead end.

## Fixes tested

I tested these with the sim only, through a probe change that was thrown away afterwards. Each case ran on belts 1–10 with 20 seeds, on Standard. Smart bots played typical, trainsMore and playsOnly.

| Fix | What it does | Masher (typical) win | Kid bot win | Kid room-1 KOs | Smart bots |
|---|---|---|---|---|---|
| Today | – | 8% | 9% | 102/200 | 100% win |
| F1 Shield sparks | Each bounce off a shield gives +6 Focus, so mashing fills a Strike in about 5 taps | 8% | 9% | 91/200 | 100% win, boss time about the same |
| F2 Mash guard | While you are in an attack swing, an enemy hit counts as a block (half damage) | 10% | 25% | 17/200 | 100% win, same |
| F3 Gentle room 1 | Room 1 enemies hit at 60% power | 8% | 10% | 37/200 | 100% win, same |
| **F1 + F2** | Both | **34%** | **42%** | **10/200** | 100% win, boss 12.8–13.5 s against 13.0–13.2 s today |

- **F1 alone doesn't help** the masher bot, because it only Strikes when Focus is ready. It still needs F2 to live long enough.
- **F1 + F2 together fix the dead end.** Masher room-1 KOs drop from 156/200 to 0/200. Wins now come from clearing floors, and the bot uses Strikes (about 25 per run).
- Smart players barely change, because they Counter instead of using swing blocks.
- **Band test:** `r-bal-12-bands.test.ts` still passes, 293 of 293. No content numbers change, and the fixes are assists, not stats.

## Plan

1. **F1 Shield sparks:** each bounce gives +6 Focus. The shield also glows, which hints "use your Strike!".
2. **F2 Mash guard:** a hit during your own swing is blocked, so the player takes half damage. A Counter is still much better: no damage, a stagger and Focus. So real training stays the main source of power.
3. **Kinder knock-out (design only, not simmed):** "Sensei helps you up". You keep everything you earned on the floor and get a choice: "Try this room again" or "Head home". No "you lost" wording and no lost progress.
4. Keep F3 in reserve. It is only needed if F1 + F2 test badly with real kids.
5. Add the kid bot to the balance tests as a young-player check.

## Work-board items

| Item | Owner | Done when |
|---|---|---|
| B-MASHER-a Shield sparks (F1) | Dojo-Ascent Programmer | A basic hit on a shield gives +6 Focus and a glow. The band test passes 293/293. |
| B-MASHER-b Mash guard (F2) | Dojo-Ascent Programmer | A hit that lands during the player's swing counts as a block. The smart bot sims are unchanged (±5%). |
| B-MASHER-c Kid bot in sim | Dojo-Ascent Programmer | A `kid` style exists in bot.ts. With F1 + F2 it has 20 or fewer room-1 KOs per 200 runs and wins 35% or more across belts 1–10. |
| B-MASHER-d Kind KO flow | Dojo-Ascent Designer | The KO screen keeps floor progress, offers "Try again" or "Head home", and uses no loss or guilt words. Jay signs off. |
| B-MASHER-e Playtest | Dojo-Ascent QA | A young player (6–8) clears room 1 at belt 1 and belt 4 without help. |

## Decisions for Jay

1. Should Mash guard be on for everyone, or only with an "Easy hands" assist setting? I propose on for everyone, because it doesn't change smart play.
2. Is +6 Focus per shield bounce OK, or should it be smaller?
3. For the kind KO flow: retry the room with full health, or with half health?
4. Should Pillar Court stay as room 1? Moving shields to room 2 or later would also help.
