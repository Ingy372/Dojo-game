// LOCAL ONLY (LP-P1). Re-measures the R-SHOP coin inputs on today's sim, with all four bots.
// Plays whole runs and writes one JSON row per run: rooms cleared by kind, win or loss, run ticks,
// and gear found by rarity. The sim has no coins; coins are worked out afterwards by lp-p1-coins.py.
// Run from the repo root: COINS=1 SEEDS=100 OUT=/tmp/lp-coins.json npx vitest run -c drafts/planning/LP-P1-sim/vitest.lp-p1.config.ts
import { writeFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import { ARTISTS } from '../../../packages/sim/test/r-bal-12-artists';
import { testContent } from '../../../packages/sim/test/load-content';
import { SKILLS, playRoom, type Skill, type Style } from '../../../packages/sim/test/balance/bot';
import { createRng, createRunWorld, currentRoom, startRun, type Difficulty } from '../../../packages/sim/src';

const SEED_BASE = 1000;
const BELTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
type BotName = 'kid' | 'newer' | 'careful' | 'masher';
const BOTS: Record<BotName, { style: Style; skill: Skill }> = {
  kid: { style: 'kid', skill: SKILLS.novice },
  newer: { style: 'smart', skill: SKILLS.typical },
  careful: { style: 'smart', skill: SKILLS.sharp },
  masher: { style: 'masher', skill: SKILLS.novice },
};

const env = process.env as Record<string, string | undefined>;
describe.skipIf(!env.COINS)('lp-p1 coins', () => {
  it('writes rows', () => {
    const seeds = Number(env.SEEDS ?? 30);
    const rows: unknown[] = [];
    for (const diff of ['guided', 'standard', 'challenge'] as Difficulty[])
      for (const bot of Object.keys(BOTS) as BotName[])
        for (const tier of BELTS)
          for (let i = 0; i < seeds; i++) {
            const seed = SEED_BASE + i;
            const { style, skill } = BOTS[bot];
            const a = ARTISTS.typical[tier - 1];
            const base = { maxHealth: a.health, power: a.power, guard: a.guard };
            const c = testContent();
            const run = startRun(c, { seed, dryRuns: 0, difficulty: diff, tier });
            const rng = createRng(seed * 7919 + 13);
            const cleared: string[] = [];
            let n = 0;
            while (run.status === 'playing' && n < 20) {
              const room = currentRoom(c, run);
              const world = createRunWorld(c, run, base, [], diff);
              const st = playRoom(c, run, world, room, style, skill, rng);
              if (!st.died) cleared.push(room.kind);
              n++;
            }
            rows.push({ diff, bot, tier, seed, won: run.status === 'cleared', ticks: run.ticks, cleared, loot: run.loot.map((x) => x.rarity) });
          }
    writeFileSync(env.OUT ?? '/tmp/lp-coins.json', JSON.stringify(rows));
  }, 6_000_000);
});
