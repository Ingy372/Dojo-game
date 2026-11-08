/**
 * PB-11 kata passives: measure existing effect hooks on the real sim.
 * Not part of the game. From the repo root:
 *   PB11_BOT=kid PB11_MODE=table PB11_SEEDS=30 npx vitest run --config drafts/planning/vitest.pb11.config.ts
 * PB11_BOT is kid, newer, careful, or masher. PB11_MODE is confirm (size sweep, Standard) or table
 * (Guided, Standard, Challenge). Results land in drafts/planning/pb11-sim-out/.
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
  perfects: number;
  blocks: number;
}
const zero = (): Totals => ({ n: 0, won: 0, cleared: 0, fights: 0, lostPct: 0, fightTicks: 0, perfects: 0, blocks: 0 });

function playOne(effects: Effect[], bot: BotName, diff: Difficulty, tier: number, seed: number, insights: string[]): Omit<Totals, 'n'> {
  const { style, skill } = BOTS[bot];
  const a = ARTISTS.typical[tier - 1];
  const base = { maxHealth: a.health, power: a.power, guard: a.guard };
  const c = testContent();
  if (insights.length) c.insights = c.insights.filter((i) => insights.includes(i.id));
  else c.insights = [];
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
    perfects: fights.reduce((s, r) => s + r.perfects, 0),
    blocks: fights.reduce((s, r) => s + r.blocks, 0),
  };
}

function play(effects: Effect[], bot: BotName, diff: Difficulty, seeds: number, belts: number[], insights: string[] = []): Totals[] {
  return belts.map((tier) => {
    const t = zero();
    for (let i = 0; i < seeds; i++) {
      const r = playOne(effects, bot, diff, tier, SEED_BASE + i, insights);
      t.n++;
      for (const k of ['won', 'cleared', 'fights', 'lostPct', 'fightTicks', 'perfects', 'blocks'] as const) t[k] += r[k];
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

/** Official R-BAL-12 band on strength-1 hits, plus the same math if every hit were a Perfect Counter. */
function bandNote(counterStrength: number) {
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
        const ctr = damage(a.power, 2 + counterStrength, base.guard);
        const ko = Math.ceil(a.health / damage(P, 1, a.guard));
        const koC = Math.ceil(a.health / damage(P * 1.5, 1, a.guard));
        lines.push(
          `${id} b${belt} ${student} basicHits ${Math.ceil(H / basic)}/${Math.ceil((H * 1.5) / basic)} counterHits ${Math.ceil(H / ctr)}/${Math.ceil((H * 1.5) / ctr)} KO ${ko}/${koC}`,
        );
      }
    }
  }
  return lines;
}

interface Setup {
  name: string;
  effects: Effect[];
  /** Held from room 1. Empty means no Insight cards at all. */
  insights?: string[];
}

const TABLE: Setup[] = [
  { name: 'cs0.5', effects: [{ type: 'counterStrength', amount: 0.5 }] },
  { name: 'ch0.4', effects: [{ type: 'counterHits', hits: 1, amount: 0.4 }] },
  { name: 'dis0.4', effects: [{ type: 'disarm', amount: 0.4 }] },
  { name: 'palmStack', effects: [{ type: 'counterStrength', amount: 1 }] },
  { name: 'lineOnly', effects: [{ type: 'counterHits', hits: 2, amount: 0.3 }] },
  { name: 'lineStack', effects: [{ type: 'counterHits', hits: 3, amount: 0.4 }] },
  { name: 'disarmStack', effects: [{ type: 'disarm', amount: 0.9 }] },
];

const CONFIRM: Setup[] = [
  { name: 'cs0.4', effects: [{ type: 'counterStrength', amount: 0.4 }] },
  { name: 'cs0.5', effects: [{ type: 'counterStrength', amount: 0.5 }] },
  { name: 'cs0.6', effects: [{ type: 'counterStrength', amount: 0.6 }] },
  { name: 'ch0.35', effects: [{ type: 'counterHits', hits: 1, amount: 0.35 }] },
  { name: 'ch0.4', effects: [{ type: 'counterHits', hits: 1, amount: 0.4 }] },
  { name: 'ch0.5', effects: [{ type: 'counterHits', hits: 1, amount: 0.5 }] },
  { name: 'dis0.4', effects: [{ type: 'disarm', amount: 0.4 }] },
  { name: 'dis0.5', effects: [{ type: 'disarm', amount: 0.5 }] },
  { name: 'stg4', effects: [{ type: 'staggerTicks', amount: 4 }] },
  { name: 'stg8', effects: [{ type: 'staggerTicks', amount: 8 }] },
  { name: 'keonSplit', effects: [{ type: 'counterHits', hits: 1, amount: 0.2 }, { type: 'staggerTicks', amount: 4 }] },
  { name: 'hh', effects: [], insights: ['heavy-hands'] },
  { name: 'hh+cs0.5', effects: [{ type: 'counterStrength', amount: 0.5 }], insights: ['heavy-hands'] },
  { name: 'pair', effects: [], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+cs0.5', effects: [{ type: 'counterStrength', amount: 0.5 }], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+ch0.4', effects: [{ type: 'counterHits', hits: 1, amount: 0.4 }], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'pair+dis0.5', effects: [{ type: 'disarm', amount: 0.5 }], insights: ['ripple-counter', 'heavy-hands'] },
  { name: 'ds+hh', effects: [], insights: ['double-strike', 'heavy-hands'] },
  { name: 'ds+hh+ch0.4', effects: [{ type: 'counterHits', hits: 1, amount: 0.4 }], insights: ['double-strike', 'heavy-hands'] },
  { name: 'rooted+cs0.5', effects: [{ type: 'counterStrength', amount: 0.5 }], insights: ['ripple-counter', 'iron-skin'] },
  { name: 'flowing+ch0.4', effects: [{ type: 'counterHits', hits: 1, amount: 0.4 }], insights: ['wind-step', 'double-strike', 'quick-hands'] },
  { name: 'power+cs0.5', effects: [{ type: 'counterStrength', amount: 0.5 }], insights: ['press-the-advantage', 'shield-breaker', 'heavy-hands'] },
];

function beltsFor(diff: Difficulty): number[] {
  return diff === 'challenge' ? BELTS.filter((b) => b >= 4) : BELTS;
}

function measureBot(bot: BotName, diff: Difficulty, seeds: number, setups: Setup[]) {
  const belts = beltsFor(diff);
  const none = play([], bot, diff, seeds, belts);
  const rulers = RULER.map((p) => (p === 0 ? none : play([{ type: 'powerScale', amount: p / 100 }], bot, diff, seeds, belts)));
  const pooledRuler = rulers.map((rows) => read(sum(rows)));
  const row = (name: string, rows: Totals[]) => {
    const t = sum(rows);
    const r = read(t);
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
          perfects: round1(one.perfects / Math.max(1, one.fights)),
          blocks: round1(one.blocks / Math.max(1, one.fights)),
          rulerLost: round1(plus0.lost - plus60.lost),
          rulerTicks: Math.round(plus0.ticks - plus60.ticks),
        };
    });
    return {
      name,
      pe: round1(pe(r, pooledRuler, RULER)),
      win: round1(r.win),
      lost: round1(r.lost),
      ticks: Math.round(r.ticks),
      perfects: round1(t.perfects / Math.max(1, t.fights)),
      blocks: round1(t.blocks / Math.max(1, t.fights)),
      belts: perBelt,
    };
  };
  const out = [row('none', none)];
  for (const s of setups) out.push(row(s.name, play(s.effects, bot, diff, seeds, belts, s.insights ?? [])));
  return { bot, diff, seeds, belts, ruler: pooledRuler.map((r, i) => ({ plus: RULER[i], win: round1(r.win), lost: round1(r.lost), ticks: Math.round(r.ticks) })), rows: out };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** R-BAL-12 official band: strength-1 hits. Counter columns are a sensitivity check, not the band. */
function bands(counterStrength: number) {
  const content = testContent();
  const rows = [];
  for (const id of ['floor-keeper', 'hearth-cook'] as const) {
    const base = content.enemies[id];
    for (let belt = id === 'hearth-cook' ? 3 : 1; belt <= 10; belt++) {
      const sc = byTier(ENEMY_TRAINING_SCALE, belt);
      const H = Math.max(1, Math.round(base.maxHealth * sc.maxHealth));
      const P = Math.round(base.power * sc.power);
      for (const student of ['typical', 'trainsMore', 'playsOnly'] as const) {
        const a = ARTISTS[student][belt - 1];
        const basic = damage(a.power, 1, base.guard);
        const ctr = damage(a.power, 2 + counterStrength, base.guard);
        rows.push({
          id,
          belt,
          student,
          basicStd: Math.ceil(H / basic),
          basicChal: Math.ceil((H * 1.5) / basic),
          counterStd: Math.ceil(H / ctr),
          counterChal: Math.ceil((H * 1.5) / ctr),
          koStd: Math.ceil(a.health / damage(P, 1, a.guard)),
          koChal: Math.ceil(a.health / damage(P * 1.5, 1, a.guard)),
        });
      }
    }
  }
  return rows;
}

describe('pb11 measure', () => {
  it('runs the bot named in PB11_BOT', () => {
    const bot = (process.env.PB11_BOT ?? 'kid') as BotName;
    if (!BOTS[bot]) throw new Error(`unknown bot ${bot}`);
    const seeds = Number(process.env.PB11_SEEDS ?? 40);
    const mode = process.env.PB11_MODE ?? 'confirm';
    const diffs: Difficulty[] = mode === 'table' ? ['guided', 'standard', 'challenge'] : ['standard'];
    const setups = mode === 'table' ? TABLE : CONFIRM;
    const t0 = Date.now();
    const reports = diffs.map((diff) => measureBot(bot, diff, seeds, setups));
    const payload = { bot, mode, seeds, ms: Date.now() - t0, reports, bands: bot === 'kid' ? { atCounterBonus0: bands(0), atCounterBonus05: bands(0.5) } : undefined };
    const dir = '/workspace/drafts/planning/pb11-sim-out';
    mkdirSync(dir, { recursive: true });
    const file = `${dir}/${bot}-${mode}.json`;
    writeFileSync(file, JSON.stringify(payload));
    for (const rep of reports) {
      console.log(`\n## ${rep.bot} ${rep.diff} seeds ${rep.seeds}`);
      for (const row of rep.rows) console.log(`${row.name} PE ${row.pe} win ${row.win} lost ${row.lost} tick ${row.ticks} P ${row.perfects} B ${row.blocks}`);
    }
    console.log('WROTE', file, 'ms', Date.now() - t0);
  }, 900_000);
});
