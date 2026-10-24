# S4: Kick combos → Strikes

Manager item S4, part 2 (Oct 24). This turns the template in `S4-self-defense-powers.md` ("Kick combos and katas") into one Strike for each real combo.

Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only. No game code changes and no work-board edits. **Source:** only Jay's combo descriptions 1–7 in `docs/curriculum.md` (2026-10-23). Nothing is invented about the real combos. Combos 8–12 (black belt) are still to come from Jay, so they are not covered here. All amounts are marked (guess) until they have been through a balance run.

## Rules

- Each belt's kick combo unlocks the next Strike (`abilities.json` notes; `curriculum.md` line 37). That gives 7 Strikes: White to Red/Black. The last two belts before black belt add no new combo.
- A Strike's power should **copy the real kick order** (S4 rule). The name comes from the real kicks. The effect matches how the combo builds: more kicks give more hits, spins hit all around, and a block at the start gives a guard.
- Strikes stack as you earn them. Nothing is ever taken away.
- Only the 7 Strikes are added. The Strike button stays the same, and Focus still pays for it (Strike costs 30, minimum 10).
- The 2 current Strikes are folded in (marked in the table), so there's no wasted work.

## Table

| # | Belt | Real combo (Jay's words, short) | Game Strike | Effect | Effect type | New? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | White | front, front, inside, outside, spinning outside kick | **Spin Kick Finish** | Strike adds a second kick (50%) | `strikeExtraHit` 0.5 | No: this is today's "Follow-up Kick", renamed |
| 2 | Yellow | combo 1 + 3 jumping spin kicks | **Jumping Spins** | The Strike's last kick also hits enemies close by (40% within 1.2 tiles) (guess) | **new** `strikeRipple` amount / radius (same shape as `rippleCounter`) | New |
| 3 | Orange | combo 2 + round kick and butterfly kick | **Butterfly Flow** | Practised combos flow: Strikes cost 8 less Focus | `strikeCost` 8 | No: today's "Quick Combo", renamed |
| 4 | Green | step-behind side kicks both ways, roundhouse, spin kicks, left and right | **Both Sides** | The Strike's extra kick can turn to hit an enemy behind you (guess) | **new** flag `strikeBothSides` | New |
| 5 | Blue | combo 4 + low roundhouses, step-behind hook kicks, then front kick left, right, left | **Low-High Kicks** | Adds a third quick hit (30%) and makes the target off-balance | `strikeExtraHit` +0.3, plus **new** flag `strikeStaggers` | New flag |
| 6 | Red | palm-down block, reverse punch, jumping spin kick ... ends stepping back twice and lunging in with a jumping front kick | **Block, Punch, Lunge** | For 0.5 s after a Strike starts, a hit is Blocked automatically; the Strike ends with a short lunge forward (guess: 1 tile) | **new** `strikeGuard` ticks 10, **new** `strikeLunge` tiles 1 | New |
| 7 | Red/Black | front, axe, round, butterfly, spinning heel, cross centre line, spinning hook kick | **Axe and Hook** | Strikes break guards (hit through the Guardian/elite guard) | `shieldBreaker` (existing), limited to Strikes (guess) | Existing type; needs a Strike-only check |

Notes:
- #1 and #3 only need a name change and new text. The effects already work.
- #4 to #6 need new effect types. In total that is 5 new effect types or flags: `strikeRipple`, `strikeBothSides`, `strikeStaggers`, `strikeGuard`, `strikeLunge`.
- #7: please check that `shieldBreaker` works on Strikes in `effects.ts`. If it only works on Counters, a "Strike only" option is needed.
- My game summaries cut down Jay's words. The full real text stays in `curriculum.md` and should show on the Strike's info page ("In the dojo:" plus Jay's line).

## Player-facing text (draft for the Content Writer)

One short sentence each, ages 6+:
1. "Your Strike ends with a spin kick!"
2. "Jump and spin: your last kick hits enemies close by."
3. "Your kicks flow: Strikes cost less Focus."
4. "Kick both ways: your Strike can hit behind you."
5. "Low, then high: one more kick, and they wobble."
6. "Block first, then lunge in with a jumping kick."
7. "Axe kick and hook kick break through guards."

## Done-when

- `abilities.json` `strikes` has 7 entries in belt order, with names and text from this table. Today's 2 Strikes become #1 and #3 (test: the list length is 7, and old saves keep the Strikes they had).
- Each new effect type is in `effects.ts`, with a unit test showing it fires only on Strikes.
- No Strike changes Focus cost apart from #3. Strike cost never goes below 10 (test).
- A balance run (Standard, each belt tier) shows that win rates move by no more than the S2 charm limit (guess: within 5 points) when the new Strike is added.
- Each Strike's info page shows Jay's real combo words under "In the dojo:".
- Jay (through the Manager) confirms the 7 names don't misdescribe the real combos.

## Scope flags

- **Content:** small (7 entries and their text).
- **Sim:** medium (5 new effect types or flags; #6 is the biggest: a timed auto-Block plus a lunge).
- **Client:** small (Strike info page line). The animation for each Strike is optional; it can be done later by the Artist.
- **Out of scope:** combos 8–12 and katas.

## Decisions needed (for the Manager, and for Jay where marked)

1. Can today's 2 Strikes be renamed to #1 "Spin Kick Finish" and #3 "Butterfly Flow"? (Their effects stay the same.)
2. #6 is the strongest and most complex. Should it be cut down to the lunge only (drop the auto-Block)?
3. **Jay:** are the names OK, and is "butterfly kick" the right word for kids to see (he wrote "tornado kick (we call it butterfly kick)")?
