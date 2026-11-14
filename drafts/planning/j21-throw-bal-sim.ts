/**
 * J21-THROW-BAL: measure the written #34 / #38 / #40 amounts on the live thrown state.
 * Planning only. Same harness as j21-seal-sim.ts (startRun, createRunWorld, the balance bot).
 *
 *   J21_BOT=newer J21_DIFF=standard J21_SEEDS=20 J21_MODE=throw \
 *     npx vitest run --config drafts/planning/vitest.j21-throw-bal.config.ts
 *
 * Results: drafts/planning/j21-throw-bal-out/<bot>-<diff>-throw.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import { ARTISTS } from '../../packages/sim/test/r-bal-12-artists';
import { testContent } from '../../packages/sim/test/load-content';
import { SKILLS, playRoom, type Skill, type Style } from '../../packages/sim/test/balance/bot';
import {
  ENEMY_TRAINING_SCALE,
  byTier,
  createRng,
  createRunWorld,
  currentRoom,
  damage,
  startRun,
  type Difficulty,
  type Effect,
} from '../../packages/sim/src';

const SEED_BASE = 1000;
const BELTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
type BotName = 'kid' | 'newer' | 'careful' | 'masher';
const BOTS: Record<BotName, { style: Style; skill: Skill }> = {
  kid: { style: 'kid', skill: SKILLS.novice },
  newer: { style: 'smart', skill: SKILLS.typical },
  careful: { style: 'smart', skill: SKILLS.sharp },
  masher: { style: 'masher', skill: SKILLS.novice },
};

interface Totals {
  n: number;
  won: number;
  cleared: number;
  fights: number;
  lostPct: number;
  fightTicks: number;
}
const zero = (): Totals => ({ n: 0, won: 0, cleared: 0, fights: 0, lostPct: 0, fightTicks: 0 });

function playOne(effects: Effect[], bot: BotName, diff: Difficulty, tier: number, seed: number, insights: string[]): Omit<Totals, 'n'> {
  const { style, skill } = BOTS[bot];
  const a = ARTISTS.typical[tier - 1];
  const base = { maxHealth: a.health, power: a.power, guard: a.guard };
  const c = testContent();
  c.insights = insights.length ? c.insights.filter((i) => insights.includes(i.id)) : [];
  const run = startRun(c, { seed, dryRuns: 0, difficulty: diff, tier });
  run.insights.push(...insights);
  const rng = createRng(seed * 7919 + 13);
  const rooms = [];
  while (run.status === 'playing' && rooms.length < 20) {
    const room = currentRoom(c, run);
    const world = createRunWorld(c, run, base, effects, diff);
    rooms.push(playRoom(c, run, world, room, style, skill, rng));
  }
  const fights = rooms.filter((r) => ['battle', 'challenge', 'boss'].includes(r.kind));
  return {
    won: run.status === 'cleared' ? 1 : 0,
    cleared: rooms.filter((r) => !r.died).length,
    fights: fights.length,
    lostPct: fights.reduce((s, r) => s + r.damage, 0) / base.maxHealth,
    fightTicks: fights.reduce((s, r) => s + r.ticks, 0),
  };
}

function play(effects: Effect[], bot: BotName, diff: Difficulty, seeds: number, belts: number[], insights: string[] = []): Totals[] {
  return belts.map((tier) => {
    const t = zero();
    for (let i = 0; i < seeds; i++) {
      const r = playOne(effects, bot, diff, tier, SEED_BASE + i, insights);
      t.n++;
      for (const k of ['won', 'cleared', 'fights', 'lostPct', 'fightTicks'] as const) t[k] += r[k];
    }
    return t;
  });
}

interface Reading {
  win: number;
  cleared: number;
  lost: number;
  ticks: number;
}
function read(t: Totals): Reading {
  return {
    win: (100 * t.won) / t.n,
    cleared: t.cleared / t.n,
    lost: (100 * t.lostPct) / Math.max(1, t.fights),
    ticks: t.fightTicks / Math.max(1, t.fights),
  };
}
function sum(list: Totals[]): Totals {
  const t = zero();
  for (const x of list) for (const k of Object.keys(t) as (keyof Totals)[]) t[k] += x[k];
  return t;
}

const RULER = [0, 10, 20, 30, 40, 60];
function interp(v: number, xs: number[], ys: number[]): number {
  if (v <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) if (v <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (v - xs[i - 1])) / (xs[i] - xs[i - 1]);
  return ys[ys.length - 1];
}
function pe(r: Reading, readings: Reading[], amounts: number[]): number {
  const col = (f: (x: Reading) => number) => readings.map(f);
  const parts: number[] = [];
  const cleared = col((x) => x.cleared);
  if (Math.max(...cleared) - Math.min(...cleared) > 1) parts.push(interp(r.cleared, cleared, amounts));
  parts.push(interp(-r.lost, col((x) => -x.lost), amounts));
  parts.push(interp(-r.ticks, col((x) => -x.ticks), amounts));
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}
const round1 = (n: number) => Math.round(n * 10) / 10;

interface Setup {
  name: string;
  effects: Effect[];
  insights?: string[];
}

/** Live thrown hooks only. counterThrow uses Math.max; downBonus adds. */
const THROW30: Effect = { type: 'counterThrow', amount: 30 };
const THROW45: Effect = { type: 'counterThrow', amount: 45 };
const DOWN25: Effect = { type: 'downBonus', amount: 0.25 };
const DOWN50: Effect = { type: 'downBonus', amount: 0.5 };
const THROW: Setup[] = [
  { name: 'throw30', effects: [THROW30] },
  { name: 'throw45', effects: [THROW45] },
  { name: 'down25', effects: [DOWN25] },
  { name: 'throw30+down25', effects: [THROW30, DOWN25] },
  { name: 'throw30+down50', effects: [THROW30, DOWN50] },
  { name: 'throw45+down25', effects: [THROW45, DOWN25] },
  { name: 'throw45+down50', effects: [THROW45, DOWN50] },
];
const THROW_CEIL: Setup[] = [
  { name: 'hh', effects: [], insights: ['heavy-hands'] },
  { name: 'hh+throw45', effects: [THROW45], insights: ['heavy-hands'] },
  { name: 'hh+throw30+down25', effects: [THROW30, DOWN25], insights: ['heavy-hands'] },
  { name: 'hh+throw30+down50', effects: [THROW30, DOWN50], insights: ['heavy-hands'] },
  { name: 'pair', effects: [], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+throw45', effects: [THROW45], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+throw30+down50', effects: [THROW30, DOWN50], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'power+throw45', effects: [THROW45], insights: ['press-the-advantage', 'shield-breaker', 'heavy-hands'] },
  { name: 'power+throw30+down50', effects: [THROW30, DOWN50], insights: ['press-the-advantage', 'shield-breaker', 'heavy-hands'] },
];


function beltsFor(diff: Difficulty): number[] {
  return diff === 'challenge' ? BELTS.filter((b) => b >= 4) : BELTS;
}

function bandLines(): string[] {
  const content = testContent();
  const lines: string[] = [];
  for (const id of ['floor-keeper', 'hearth-cook']) {
    const base = content.enemies[id];
    for (let belt = id === 'hearth-cook' ? 3 : 1; belt <= 10; belt++) {
      const sc = byTier(ENEMY_TRAINING_SCALE, belt);
      const H = Math.max(1, Math.round(base.maxHealth * sc.maxHealth));
      const P = Math.round(base.power * sc.power);
      for (const student of ['typical', 'trainsMore', 'playsOnly'] as const) {
        const a = ARTISTS[student][belt - 1];
        const basic = damage(a.power, 1, base.guard);
        const ko = Math.ceil(a.health / damage(P, 1, a.guard));
        // The /1.5 column is the historical D5 Challenge model, not the live baseline
        // (enemyPowerScale 1, Health unscaled). Optional J21_BAND diagnostic only.
        const koC = Math.ceil(a.health / damage(P * 1.5, 1, a.guard));
        lines.push(
          `${id} b${belt} ${student} basic ${Math.ceil(H / basic)}/${Math.ceil((H * 1.5) / basic)} KO ${ko}/${koC}`,
        );
      }
    }
  }
  return lines;
}

function measure(bot: BotName, diff: Difficulty, seeds: number, setups: Setup[]) {
  const belts = beltsFor(diff);
  const none = play([], bot, diff, seeds, belts);
  const rulers = RULER.map((p) => (p === 0 ? none : play([{ type: 'powerScale', amount: p / 100 }], bot, diff, seeds, belts)));
  const pooledRuler = rulers.map((rows) => read(sum(rows)));
  const out = setups.map((s) => {
    const rows = play(s.effects, bot, diff, seeds, belts, s.insights ?? []);
    const pooled = read(sum(rows));
    const perBelt = rows.map((one, i) => {
      const rr = rulers.map((rt) => read(rt[i]));
      const pr = read(one);
      const plus0 = rr[0];
      const plus60 = rr[rr.length - 1];
      return {
        belt: belts[i],
        pe: round1(pe(pr, rr, RULER)),
        win: round1(pr.win),
        lost: round1(pr.lost),
        ticks: Math.round(pr.ticks),
        rulerLost: round1(plus0.lost - plus60.lost),
      };
    });
    return {
      name: s.name,
      pe: round1(pe(pooled, pooledRuler, RULER)),
      win: round1(pooled.win),
      lost: round1(pooled.lost),
      ticks: Math.round(pooled.ticks),
      perBelt,
    };
  });
  const base = read(sum(none));
  return {
    bot,
    diff,
    seeds,
    base: { pe: 0, win: round1(base.win), lost: round1(base.lost), ticks: Math.round(base.ticks) },
    rows: out,
  };
}

const botEnv = process.env.J21_BOT as BotName | 'all' | undefined;
const diffEnv = process.env.J21_DIFF as Difficulty | 'all' | undefined;
const seeds = Number(process.env.J21_SEEDS ?? 20);
const mode = process.env.J21_MODE ?? 'throw';
const bots: BotName[] = !botEnv || botEnv === 'all' ? ['kid', 'newer', 'careful', 'masher'] : [botEnv];
const diffs: Difficulty[] = !diffEnv || diffEnv === 'all' ? ['guided', 'standard', 'challenge'] : [diffEnv];

const setups = mode === 'ceil' ? THROW_CEIL : THROW;

describe('j21 throw-bal amounts', () => {
  it('measures', () => {
    mkdirSync('drafts/planning/j21-throw-bal-out', { recursive: true });
    if (process.env.J21_BAND === '1') {
      writeFileSync('drafts/planning/j21-throw-bal-out/band.txt', bandLines().join('\n') + '\n');
    }
    for (const bot of bots) {
      for (const diff of diffs) {
        const result = measure(bot, diff, seeds, setups);
        writeFileSync(`drafts/planning/j21-throw-bal-out/${bot}-${diff}-${mode}.json`, JSON.stringify(result));
        console.log(JSON.stringify({ bot, diff, base: result.base, rows: result.rows.map((r) => ({ name: r.name, pe: r.pe, win: r.win, lost: r.lost, ticks: r.ticks })) }));
      }
    }
  });
});
