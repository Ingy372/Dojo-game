// Helpers for the Insight budget test (R-INSIGHT-BAL, layer 2). A computer player plays whole runs with a
// chosen set of Insights, and a card's strength is read as a Power-Equivalent (PE): the +% Power that gives the
// same result. Not part of the game.

import { ARTISTS } from '../r-bal-12-artists';
import { testContent } from '../load-content';
import { createRng, createRunWorld, currentRoom, startRun, type Content, type Difficulty, type InsightDef } from '../../src';
import { playRoom, SKILLS, type InsightPicker, type Skill, type Style } from './bot';

export type BotName = 'kid' | 'newer' | 'careful';
export const BOTS: Record<BotName, { style: Style; skill: Skill }> = {
  kid: { style: 'kid', skill: SKILLS.novice },
  newer: { style: 'smart', skill: SKILLS.typical },
  careful: { style: 'smart', skill: SKILLS.sharp },
};
export const BOT_NAMES = Object.keys(BOTS) as BotName[];
export const BELTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
/**
 * Seeds run are SEED_BASE .. SEED_BASE + N - 1, the range the spec tables were measured on. Seeds 1..N are not equivalent: on 150 pool runs per belt
 * they read 40-45% win at belts 7-10 against 52-57% for 1000+ (same bot, same content), so a small-seed set would fail B5 for no balance reason.
 */
export const SEED_BASE = 1000;

/** Virtue stand-ins for after the beta (R-INSIGHT-BAL section 5). They are added to the sim only while the real cards are not in the content. */
export const PLACEHOLDER_CARDS: InsightDef[] = [
  { id: 'calm-breath', name: 'Calm Breath', family: 'virtue', text: 'Focus fills 15% faster.', effect: { type: 'focusGain', amount: 0.15 } },
  { id: 'steady-start', name: 'Steady Start', family: 'virtue', text: 'Start each fight with a Strike ready.', effect: { type: 'startFocus', amount: 40 } },
];

/** What a run is given. */
export type Setup =
  | { kind: 'none' }
  /** The real pick screen over the game's own cards: random picks. */
  | { kind: 'pool' }
  /** These cards are held from room 1 and kept all run. */
  | { kind: 'held'; ids: string[] }
  /** A made-up +amount Power card held all run: the PE ruler. */
  | { kind: 'ruler'; amount: number }
  /** The real pick screen over every card (placeholders too), with a deliberate picker. */
  | { kind: 'picker'; pick: InsightPicker };

/** All cards the budget covers: the game's own, plus the placeholders that are not in the content yet. */
export function allCards(content: Content = testContent()): InsightDef[] {
  return [...content.insights, ...PLACEHOLDER_CARDS.filter((p) => !content.insights.some((i) => i.id === p.id))];
}

/** Picks the first offered card of one of these ids, else the first offered. */
export const leanPicker = (ids: string[]): InsightPicker => (_run, choices) => choices.find((c) => ids.includes(c)) ?? choices[0];

export interface Totals {
  n: number;
  won: number;
  cleared: number;
  fights: number;
  lostPct: number;
  fightTicks: number;
}
const zero = (): Totals => ({ n: 0, won: 0, cleared: 0, fights: 0, lostPct: 0, fightTicks: 0 });
export function sum(list: Totals[]): Totals {
  const t = zero();
  for (const x of list) for (const k of Object.keys(t) as (keyof Totals)[]) t[k] += x[k];
  return t;
}

export interface Reading {
  /** Share of runs cleared, 0-100. */
  win: number;
  /** Rooms cleared per run. */
  cleared: number;
  /** Health lost per fight, as % of max Health. */
  lost: number;
  /** Ticks per fight. */
  ticks: number;
}
export function read(t: Totals): Reading {
  return { win: (100 * t.won) / t.n, cleared: t.cleared / t.n, lost: (100 * t.lostPct) / Math.max(1, t.fights), ticks: t.fightTicks / Math.max(1, t.fights) };
}

function playOne(setup: Setup, bot: BotName, diff: Difficulty, tier: number, seed: number): Omit<Totals, 'n'> {
  const { style, skill } = BOTS[bot];
  const a = ARTISTS.typical[tier - 1];
  const base = { maxHealth: a.health, power: a.power, guard: a.guard };
  const c = testContent();
  let grant: string[] = [];
  let pickInsight: InsightPicker | undefined;
  if (setup.kind === 'none') c.insights = [];
  else if (setup.kind === 'held') {
    const cards = allCards(c);
    c.insights = cards.filter((i) => setup.ids.includes(i.id));
    grant = c.insights.map((i) => i.id);
  } else if (setup.kind === 'ruler') {
    c.insights = [{ id: 'ruler', name: 'ruler', family: 'power', text: 'ruler', effect: { type: 'powerScale', amount: setup.amount } }];
    grant = ['ruler'];
  } else if (setup.kind === 'picker') {
    c.insights = allCards(c);
    pickInsight = setup.pick;
  }
  const run = startRun(c, { seed, dryRuns: 0, difficulty: diff, tier });
  run.insights.push(...grant);
  const rng = createRng(seed * 7919 + 13);
  const rooms = [];
  while (run.status === 'playing' && rooms.length < 20) {
    const room = currentRoom(c, run);
    const world = createRunWorld(c, run, base, [], diff, undefined, undefined);
    rooms.push(playRoom(c, run, world, room, style, skill, rng, undefined, pickInsight));
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

const cache = new Map<string, Totals[]>();
/** Plays `seeds` seeds (from SEED_BASE) at every belt; returns the totals per belt (index 0 = belt 1). Repeats cost nothing. */
export function play(setup: Setup, bot: BotName, diff: Difficulty, seeds: number, belts: number[] = BELTS): Totals[] {
  const key = setup.kind === 'picker' ? '' : JSON.stringify([setup, bot, diff, seeds, belts]);
  const hit = key ? cache.get(key) : undefined;
  if (hit) return hit;
  const out = belts.map((tier) => {
    const t = zero();
    for (let i = 0; i < seeds; i++) {
      const r = playOne(setup, bot, diff, tier, SEED_BASE + i);
      t.n++;
      for (const k of ['won', 'cleared', 'fights', 'lostPct', 'fightTicks'] as const) t[k] += r[k];
    }
    return t;
  });
  if (key) cache.set(key, out);
  return out;
}

export const RULER_STEPS = [10, 20, 30, 40, 60];
export interface Ruler {
  amounts: number[];
  readings: Reading[];
}
/** The PE ruler for one bot and difficulty: no card, then +10/20/30/40/60% Power. */
export function buildRuler(bot: BotName, diff: Difficulty, seeds: number): Ruler {
  const readings = [read(sum(play({ kind: 'none' }, bot, diff, seeds)))];
  for (const p of RULER_STEPS) readings.push(read(sum(play({ kind: 'ruler', amount: p / 100 }, bot, diff, seeds))));
  return { amounts: [0, ...RULER_STEPS], readings };
}

function interp(v: number, xs: number[], ys: number[]): number {
  if (v <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) if (v <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (v - xs[i - 1])) / (xs[i] - xs[i - 1]);
  return ys[ys.length - 1];
}

/** PE of a reading: the mean of the rooms-cleared, Health-lost and ticks readings, each looked up on the ruler. Rooms cleared only counts when the ruler moves it. */
export function pe(r: Reading, ruler: Ruler): number {
  const col = (f: (x: Reading) => number) => ruler.readings.map(f);
  const parts: number[] = [];
  const cleared = col((x) => x.cleared);
  if (Math.max(...cleared) - Math.min(...cleared) > 1) parts.push(interp(r.cleared, cleared, ruler.amounts));
  parts.push(interp(-r.lost, col((x) => -x.lost), ruler.amounts));
  parts.push(interp(-r.ticks, col((x) => -x.ticks), ruler.amounts));
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

/** PE of a setup for one bot, pooled over belts 1-10. */
export function peOf(setup: Setup, bot: BotName, diff: Difficulty, seeds: number, ruler: Ruler): number {
  return pe(read(sum(play(setup, bot, diff, seeds))), ruler);
}
