# R-INSIGHT-BAL sim reference (local experiment, not game code)

Supports `drafts/planning/R-INSIGHT-BAL.md`. Nothing here is compiled or run by CI.

- `zz-insight-bal.test.ts.txt`: copy to `packages/sim/test/balance/zz-insight-bal.test.ts`. Needs `experiment-bot-hook.patch` (the `HOOKS.pick` seam) applied to `packages/sim/test/balance/bot.ts`. `experiment-world.patch` adds the two rule tweaks behind `PRESS_WIDE=1` and `WIND_ATK=1`.
- Run: `BALANCE=1 CONFIGS=SOLO BOTS=kid DIFFS=standard SEEDS=30 OUT=/tmp/x.jsonl npx vitest run test/balance/zz-insight-bal.test.ts` in `packages/sim`. `source prop3.sh` first for the final proposal (card numbers and the two Virtue cards). `KATA='{"type":"powerScale","amount":0.12}'` adds the stand-in kata slot.
- Python scripts read `/tmp/insight-bal/*.jsonl`: unpack `data.tar.gz` there. `python3 pe_table.py '<glob>' new` prints PE per card; `pairs2.py '<glob>' standard` prints pairs; `solo3.py v3pair standard` prints the per-card table and writes the picker scores.
- Config names: `none`, `pool`, `pool9` (original 9 cards only), `offer:ID`, `start:a+b`, `SOLO`, `PAIRS`, `OFFER`, `syn:TYPE:AMT`, `pick:greedy:`, `pick:worst:` (needs `SCORES=scores3.json`).
