# R-INSIGHT-BAL sim reference (local experiment, not game code)

Supports `drafts/planning/R-INSIGHT-BAL.md` (round 4). Nothing here is compiled or run by CI.

- `zz-insight-bal.test.ts.txt`: copy to `packages/sim/test/balance/zz-insight-bal.test.ts`. Apply `experiment-bot-hook.patch` (the `HOOKS.pick` seam) to `packages/sim/test/balance/bot.ts` and `experiment-world.patch` (rule tweaks) to `packages/sim/src/world.ts`.
- Switches in the world patch: `WIND_ATK=1` (tweak A, Wind Step also speeds basic attacks), `PRESS_WIDE=1` (tweak B, Press also on winded/recovering), `SB_FOCUS=7` (tweak C, Shield Breaker gives Focus on a shield break). `SB_DMG` and `SB_STAG` exist but are not in the proposal.
- `source prop4.env` sets the round-4 proposal (card numbers and the two Virtue placeholders). `KATA='{"type":"powerScale","amount":0.12}'` adds the stand-in kata slot.
- Run one: `BALANCE=1 CONFIGS=SOLO BOTS=kid DIFFS=standard SEEDS=30 OUT=/tmp/x.jsonl npx vitest run test/balance/zz-insight-bal.test.ts` in `packages/sim`.
- Config names: `none`, `pool`, `pool9` (original 9 cards), `offer:ID`, `start:a+b` (held all run), `pick:lean:a+b+c` (real pick screen, takes the family when offered), `SOLO`, `PAIRS`, `OFFER`, `syn:TYPE:AMT`, `pick:greedy:` / `pick:worst:` (need `SCORES`, see `scoresF.json`).
- `drv.py` (launcher: `launch`, `batch`, `BASE_OVR` and `NEW` there are the round-3 base; the round-4 overrides are in `full.py` and `prop4.env`), `full.py` and `fullpick.py` (the final validation runs, tags `Fsolo`, `Fpair`, `Froute`, `Fgc`, `Fkata`, `Fpick`), `pe_any.py` and `ssum.py` (PE and win summaries), `pe2.py`, `pe_table.py`, `pairs2.py`, `solo3.py`, `belts.py`, `an.py` (older analysis scripts). Paths point at `/tmp/insight-bal`: unpack `data.tar.gz` there (it holds `r4/` with every round-4 scan and the `F*` validation rows, plus the rulers and round-3 data). The rulers are in `rul/`, `ruler-kid.jsonl` and `solo-*.jsonl`.
