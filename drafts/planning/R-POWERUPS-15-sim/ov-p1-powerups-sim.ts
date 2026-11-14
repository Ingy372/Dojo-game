/**
 * OV-P1: measure candidate Power-ups built only from existing effect types.
 * Planning only. Same PE harness idea as j21-seal-sim / R-INSIGHT-BAL
 * (startRun, createRunWorld, the balance bot, typical-artist stats).
 * Live Challenge: Power x1, Health unscaled (DIFFICULTY.challenge.enemyPowerScale = 1).
 *
 *   OV_BOT=kid OV_DIFF=standard OV_SEEDS=20 OV_MODE=solo \
 *     npx vitest run --config drafts/planning/vitest.ov-p1.config.ts
 *
 * Results: drafts/planning/ov-p1-out/<bot>-<diff>-<mode>.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import { ARTISTS } from '../../packages/sim/test/r-bal-12-artists';
import { testContent } from '../../packages/sim/test/load-content';
import { SKILLS, playRoom, type Skill, type Style } from '../../packages/sim/test/balance/bot';
import {
  createRng,
  createRunWorld,
  currentRoom,
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

export interface Card {
  id: string;
  family: 'rooted' | 'flowing' | 'power' | 'virtue';
  effect: Effect;
  extra?: Effect[];
}

export const CANDIDATES: Card[] = [
  { id: 'calm-breath', family: 'virtue', effect: { type: 'focusGain', amount: 0.25 } },
  { id: 'steady-start', family: 'virtue', effect: { type: 'startFocus', amount: 40 } },
  { id: 'lighter-strike', family: 'flowing', effect: { type: 'strikeCost', amount: 4 } },
  { id: 'softer-block', family: 'rooted', effect: { type: 'blockCut', amount: 0.1 } },
  { id: 'longer-stagger', family: 'power', effect: { type: 'staggerTicks', amount: 10 } },
  { id: 'wider-window', family: 'rooted', effect: { type: 'counterWindow', amount: 1 } },
  { id: 'heal-on-perfect', family: 'virtue', effect: { type: 'healOnPerfect', amount: 3 } },
  { id: 'block-then-dash', family: 'flowing', effect: { type: 'dashOnBlock', amount: 0 } },
  { id: 'longer-stagger-20', family: 'power', effect: { type: 'staggerTicks', amount: 20 } },
];

const EXISTING: Record<string, Effect> = {
  'heavy-hands': { type: 'powerScale', amount: 0.2 },
  'ripple-counter': { type: 'rippleCounter', amount: 1.2, radius: 2.2 },
  'double-strike': { type: 'strikeExtraHit', amount: 0.2 },
};
const KATA: Effect = { type: 'powerScale', amount: 0.12 };

function playOne(effects: Effect[], bot: BotName, diff: Difficulty, tier: number, seed: number): Omit<Totals, 'n'> {
  const { style, skill } = BOTS[bot];
  const a = ARTISTS.typical[tier - 1];
  const base = { maxHealth: a.health, power: a.power, guard: a.guard };
  const c = testContent();
  c.insights = effects.map((effect, i) => ({
    id: `ov-${i}`,
    name: 'ov',
    family: 'power' as const,
    text: 'ov',
    effect,
  }));
  const run = startRun(c, { seed, dryRuns: 0, difficulty: diff, tier });
  run.insights.push(...c.insights.map((x) => x.id));
  const rng = createRng(seed * 7919 + 13);
  const rooms = [];
  while (run.status === 'playing' && rooms.length < 20) {
    const room = currentRoom(c, run);
    const world = createRunWorld(c, run, base, [], diff);
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

function play(effects: Effect[], bot: BotName, diff: Difficulty, seeds: number, belts: number[]): Totals[] {
  return belts.map((tier) => {
    const t = zero();
    for (let i = 0; i < seeds; i++) {
      const r = playOne(effects, bot, diff, tier, SEED_BASE + i);
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

function beltsFor(diff: Difficulty): number[] {
  return diff === 'challenge' ? BELTS.filter((b) => b >= 4) : BELTS;
}

function setupsFor(mode: string): { name: string; effects: Effect[] }[] {
  if (mode === 'solo') return CANDIDATES.map((c) => ({ name: c.id, effects: [c.effect] }));
  if (mode === 'hh') return CANDIDATES.map((c) => ({ name: `${c.id}+heavy-hands`, effects: [c.effect, EXISTING['heavy-hands']] }));
  if (mode === 'ripple') return CANDIDATES.map((c) => ({ name: `${c.id}+ripple-counter`, effects: [c.effect, EXISTING['ripple-counter']] }));
  if (mode === 'ds') return CANDIDATES.map((c) => ({ name: `${c.id}+double-strike`, effects: [c.effect, EXISTING['double-strike']] }));
  if (mode === 'kata') return CANDIDATES.map((c) => ({ name: `${c.id}+kata`, effects: [c.effect, KATA] }));
  if (mode === 'hh+kata') return CANDIDATES.map((c) => ({ name: `${c.id}+heavy-hands+kata`, effects: [c.effect, EXISTING['heavy-hands'], KATA] }));
  if (mode === 'ripple+kata') return CANDIDATES.map((c) => ({ name: `${c.id}+ripple-counter+kata`, effects: [c.effect, EXISTING['ripple-counter'], KATA] }));
  throw new Error(`unknown OV_MODE ${mode}`);
}

function measure(bot: BotName, diff: Difficulty, seeds: number, setups: { name: string; effects: Effect[] }[]) {
  const belts = beltsFor(diff);
  const none = play([], bot, diff, seeds, belts);
  const rulers = RULER.map((p) => (p === 0 ? none : play([{ type: 'powerScale', amount: p / 100 }], bot, diff, seeds, belts)));
  const pooledRuler = rulers.map((rows) => read(sum(rows)));
  const out = setups.map((s) => {
    const rows = play(s.effects, bot, diff, seeds, belts);
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
    const star = perBelt.every((b) => b.rulerLost < 1);
    return {
      name: s.name,
      pe: round1(pe(pooled, pooledRuler, RULER)),
      win: round1(pooled.win),
      lost: round1(pooled.lost),
      ticks: Math.round(pooled.ticks),
      star,
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

const botEnv = process.env.OV_BOT as BotName | 'all' | undefined;
const diffEnv = process.env.OV_DIFF as Difficulty | 'all' | undefined;
const seeds = Number(process.env.OV_SEEDS ?? 20);
const mode = process.env.OV_MODE ?? 'solo';
const only = process.env.OV_ONLY;
const bots: BotName[] = !botEnv || botEnv === 'all' ? ['kid', 'newer', 'careful', 'masher'] : [botEnv];
const diffs: Difficulty[] = !diffEnv || diffEnv === 'all' ? ['guided', 'standard', 'challenge'] : [diffEnv];
let setups = setupsFor(mode);
if (process.env.OV_SET === 'new') setups = setups.filter((s) => /^(longer-stagger|wider-window)/.test(s.name));
if (process.env.OV_SET === 'r3') setups = setups.filter((s) => /^(heal-on-perfect|block-then-dash|longer-stagger-20)/.test(s.name));
if (only) setups = setups.filter((s) => s.name === only || s.name.startsWith(`${only}+`));

describe('ov-p1 power-up candidates', () => {
  it('measures', () => {
    mkdirSync('drafts/planning/ov-p1-out', { recursive: true });
    for (const bot of bots) {
      for (const diff of diffs) {
        const result = measure(bot, diff, seeds, setups);
        const path = `drafts/planning/ov-p1-out/${bot}-${diff}-${mode}.json`;
        writeFileSync(path, JSON.stringify(result, null, 2) + '\n');
        console.log(path, result.rows.map((r) => `${r.name}:${r.pe}${r.star ? '*' : ''}`).join(' '));
      }
    }
  });
});
