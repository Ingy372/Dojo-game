// OV-P5 sim (planning only, not game code). Same bots, seeds (SEED_BASE 1000), setup and PE ruler as
// packages/sim/test/balance/insight-sim.ts, but the card list comes from a file, so candidate numbers can be tried without editing content.
// Env: CARDS=path to {insights:[...]}  OVMODE=pool|routes|held|pe  BOT=kid|newer|careful  BELTS=1,...,10  SEEDS=n  DIFF=standard
//      HELD=id,id (held: held together; pe: each id or id+id group measured, ruler seeds 40 kid / 20 others)  OUT=path
import { it } from 'vitest';
import { readFileSync, writeFileSync } from 'node:fs';
import { ARTISTS } from '../../../packages/sim/test/r-bal-12-artists';
import { testContent } from '../../../packages/sim/test/load-content';
import { createRng, createRunWorld, currentRoom, startRun, type Difficulty, type InsightDef } from '../../../packages/sim/src';
import { playRoom, SKILLS, type InsightPicker } from '../../../packages/sim/test/balance/bot';
import { BOTS, pe, read, type BotName, type Totals, type Reading } from '../../../packages/sim/test/balance/insight-sim';

declare const process: { env: Record<string, string | undefined> };
const env = process.env;
const cards: InsightDef[] = JSON.parse(readFileSync(env.CARDS!, 'utf8')).insights;
const belts = (env.BELTS ?? '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);
const diff = (env.DIFF ?? 'standard') as Difficulty;
const bot = (env.BOT ?? 'kid') as BotName;
type Mode = { kind: 'none' } | { kind: 'pool' } | { kind: 'held'; ids: string[] } | { kind: 'ruler'; amount: number } | { kind: 'picker'; pick: InsightPicker };

function one(mode: Mode, tier: number, seed: number): Omit<Totals, 'n'> {
  const { style, skill } = BOTS[bot];
  const a = ARTISTS.typical[tier - 1];
  const base = { maxHealth: a.health, power: a.power, guard: a.guard };
  const c = testContent();
  let grant: string[] = [];
  let pick: InsightPicker | undefined;
  if (mode.kind === 'none') c.insights = [];
  else if (mode.kind === 'held') { c.insights = cards.filter((i) => mode.ids.includes(i.id)); grant = c.insights.map((i) => i.id); }
  else if (mode.kind === 'ruler') { c.insights = [{ id: 'ruler', name: 'ruler', family: 'power', text: 'ruler', effect: { type: 'powerScale', amount: mode.amount } }]; grant = ['ruler']; }
  else { c.insights = cards.slice(); if (mode.kind === 'picker') pick = mode.pick; }
  const run = startRun(c, { seed, dryRuns: 0, difficulty: diff, tier });
  run.insights.push(...grant);
  const rng = createRng(seed * 7919 + 13);
  const rooms = [];
  while (run.status === 'playing' && rooms.length < 20) {
    const room = currentRoom(c, run);
    const world = createRunWorld(c, run, base, [], diff, undefined, undefined);
    rooms.push(playRoom(c, run, world, room, style, skill, rng, undefined, pick));
  }
  const fights = rooms.filter((r) => ['battle', 'challenge', 'boss'].includes(r.kind));
  return { won: run.status === 'cleared' ? 1 : 0, cleared: rooms.filter((r) => !r.died).length, fights: fights.length,
    lostPct: fights.reduce((s, r) => s + r.damage, 0) / base.maxHealth, fightTicks: fights.reduce((s, r) => s + r.ticks, 0) };
}
function totals(mode: Mode, seeds: number, bs = belts): Totals[] {
  return bs.map((t) => { const s: Totals = { n: 0, won: 0, cleared: 0, fights: 0, lostPct: 0, fightTicks: 0 };
    for (let i = 0; i < seeds; i++) { const r = one(mode, t, 1000 + i); s.n++; for (const k of ['won', 'cleared', 'fights', 'lostPct', 'fightTicks'] as const) s[k] += r[k]; } return s; });
}
const pooled = (ts: Totals[]): Reading => read(ts.reduce((a, b) => { for (const k of Object.keys(a) as (keyof Totals)[]) a[k] += b[k]; return a; }, { n: 0, won: 0, cleared: 0, fights: 0, lostPct: 0, fightTicks: 0 }));
const wins = (mode: Mode, seeds: number) => totals(mode, seeds).map((t) => t.won);

it('ov-p5', () => {
  const seeds = Number(env.SEEDS ?? 150);
  const out: Record<string, unknown> = { belts, seeds, diff, bot };
  if (env.OVMODE === 'pool') out.pool = wins({ kind: 'pool' }, seeds);
  else if (env.OVMODE === 'held') out.held = wins({ kind: 'held', ids: env.HELD!.split(',') }, seeds);
  else if (env.OVMODE === 'pe') {
    const rs = bot === 'kid' ? 40 : 20;
    const amounts = [0, 10, 20, 30, 40, 60];
    const ruler = { amounts, readings: amounts.map((p) => pooled(totals(p ? { kind: 'ruler', amount: p / 100 } : { kind: 'none' }, rs))) };
    for (const g of env.HELD!.split(',')) out[`pe:${g}`] = pe(pooled(totals({ kind: 'held', ids: g.split('+') }, seeds)), ruler);
  } else {
    for (const f of [...new Set(cards.map((c) => c.family))]) {
      const ids = cards.filter((c) => c.family === f).map((c) => c.id);
      out[`held:${f}`] = wins({ kind: 'held', ids }, seeds);
      out[`lean:${f}`] = wins({ kind: 'picker', pick: (_r, ch) => ch.find((x) => ids.includes(x)) ?? ch[0] }, seeds);
    }
  }
  writeFileSync(env.OUT!, JSON.stringify(out));
}, 3_600_000);
