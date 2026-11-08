/**
 * J21 seal amounts: measure the written effects on the real fight rules.
 * Not part of the game. Same harness as PB-11 (startRun, createRunWorld, the balance bot).
 *
 *   J21_BOT=newer J21_DIFF=standard J21_SEEDS=20 J21_MODE=table \
 *     npx vitest run --config drafts/planning/vitest.j21.config.ts
 *
 * J21_BOT: kid, newer, careful, masher (default: all, one after another).
 * J21_DIFF: guided, standard, challenge (default: all).
 * J21_MODE: table (the five written amounts) or ceil (card, pair, route stacks).
 * Results: drafts/planning/j21-sim-out/<bot>-<diff>-<mode>.json
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

/** Written amounts only. Shrink candidates are amounts already in the plans or the live insight file. */
const TABLE: Setup[] = [
  { name: 'push1.5', effects: [{ type: 'counterPush', amount: 1.5 }] },
  { name: 'push1.0', effects: [{ type: 'counterPush', amount: 1 }] },
  { name: 'push0.5', effects: [{ type: 'counterPush', amount: 0.5 }] },
  { name: 'escape', effects: [{ type: 'dashOnBlock', amount: 1 }] },
  { name: 'extra0.3', effects: [{ type: 'strikeExtraHit', amount: 0.3 }] },
  { name: 'extra0.2', effects: [{ type: 'strikeExtraHit', amount: 0.2 }] },
  { name: 'block0.15', effects: [{ type: 'blockCut', amount: 0.15 }] },
  { name: 'block0.1', effects: [{ type: 'blockCut', amount: 0.1 }] },
  { name: 'window1', effects: [{ type: 'counterWindow', amount: 1 }] },
];

const CEIL: Setup[] = [
  { name: 'hh', effects: [], insights: ['heavy-hands'] },
  { name: 'hh+push1.5', effects: [{ type: 'counterPush', amount: 1.5 }], insights: ['heavy-hands'] },
  { name: 'hh+escape', effects: [{ type: 'dashOnBlock', amount: 1 }], insights: ['heavy-hands'] },
  { name: 'hh+extra0.3', effects: [{ type: 'strikeExtraHit', amount: 0.3 }], insights: ['heavy-hands'] },
  { name: 'hh+block0.02', effects: [{ type: 'blockCut', amount: 0.02 }], insights: ['heavy-hands'] },
  { name: 'hh+window1', effects: [{ type: 'counterWindow', amount: 1 }], insights: ['heavy-hands'] },
  { name: 'pair', effects: [], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+push1.5', effects: [{ type: 'counterPush', amount: 1.5 }], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+escape', effects: [{ type: 'dashOnBlock', amount: 1 }], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+extra0.3', effects: [{ type: 'strikeExtraHit', amount: 0.3 }], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+block0.02', effects: [{ type: 'blockCut', amount: 0.02 }], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+window1', effects: [{ type: 'counterWindow', amount: 1 }], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'ds+hh', effects: [], insights: ['double-strike', 'heavy-hands'] },
  { name: 'ds+hh+extra0.3', effects: [{ type: 'strikeExtraHit', amount: 0.3 }], insights: ['double-strike', 'heavy-hands'] },
  { name: 'rooted+push1.5', effects: [{ type: 'counterPush', amount: 1.5 }], insights: ['ripple-counter', 'iron-skin'] },
  { name: 'flowing+escape', effects: [{ type: 'dashOnBlock', amount: 1 }], insights: ['wind-step', 'double-strike', 'quick-hands'] },
  { name: 'power+window1', effects: [{ type: 'counterWindow', amount: 1 }], insights: ['press-the-advantage', 'shield-breaker', 'heavy-hands'] },
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
const mode = process.env.J21_MODE ?? 'table';
const bots: BotName[] = !botEnv || botEnv === 'all' ? ['kid', 'newer', 'careful', 'masher'] : [botEnv];
const diffs: Difficulty[] = !diffEnv || diffEnv === 'all' ? ['guided', 'standard', 'challenge'] : [diffEnv];
/** Smaller steps, measured only because 0.3 and 0.15 came out over PE 12. */
const SHRINK: Setup[] = [
  { name: 'extra0.15', effects: [{ type: 'strikeExtraHit', amount: 0.15 }] },
  { name: 'extra0.1', effects: [{ type: 'strikeExtraHit', amount: 0.1 }] },
  { name: 'extra0.05', effects: [{ type: 'strikeExtraHit', amount: 0.05 }] },
  { name: 'block0.05', effects: [{ type: 'blockCut', amount: 0.05 }] },
  { name: 'block0.02', effects: [{ type: 'blockCut', amount: 0.02 }] },
];

/**
 * #16 on the kata-kick hook: one extra hit after a Great Counter, strength 0.3.
 * The fight adds the hit counts and keeps the higher strength (effects.ts).
 * Two copies are #16 plus the kata kick. The amount is the same on every difficulty.
 */
const KICK03: Effect = { type: 'counterHits', hits: 1, amount: 0.3 };
const C16: Setup[] = [
  { name: 'cue', effects: [] },
  { name: 'c16', effects: [KICK03] },
  { name: 'both', effects: [KICK03, { type: 'counterHits', hits: 1, amount: 0.3 }] },
  { name: 'hh', effects: [], insights: ['heavy-hands'] },
  { name: 'hh+c16', effects: [KICK03], insights: ['heavy-hands'] },
  { name: 'hh+both', effects: [KICK03, { type: 'counterHits', hits: 1, amount: 0.3 }], insights: ['heavy-hands'] },
  { name: 'pair', effects: [], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+c16', effects: [KICK03], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+both', effects: [KICK03, { type: 'counterHits', hits: 1, amount: 0.3 }], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'rooted+c16', effects: [KICK03], insights: ['ripple-counter', 'iron-skin'] },
  { name: 'flowing+c16', effects: [KICK03], insights: ['wind-step', 'double-strike', 'quick-hands'] },
  { name: 'power+c16', effects: [KICK03], insights: ['press-the-advantage', 'shield-breaker', 'heavy-hands'] },
  { name: 'power+both', effects: [KICK03, { type: 'counterHits', hits: 1, amount: 0.3 }], insights: ['press-the-advantage', 'shield-breaker', 'heavy-hands'] },
];

const setups = mode === 'ceil' ? CEIL : mode === 'shrink' ? SHRINK : mode === 'c16' ? C16 : TABLE;

describe('j21 seal amounts', () => {
  it('measures', () => {
    mkdirSync('drafts/planning/j21-sim-out', { recursive: true });
    if (process.env.J21_BAND === '1') {
      writeFileSync('drafts/planning/j21-sim-out/band.txt', bandLines().join('\n') + '\n');
    }
    for (const bot of bots) {
      for (const diff of diffs) {
        const result = measure(bot, diff, seeds, setups);
        writeFileSync(`drafts/planning/j21-sim-out/${bot}-${diff}-${mode}.json`, JSON.stringify(result));
        console.log(JSON.stringify({ bot, diff, base: result.base, rows: result.rows.map((r) => ({ name: r.name, pe: r.pe, win: r.win, lost: r.lost, ticks: r.ticks })) }));
      }
    }
  });
});
