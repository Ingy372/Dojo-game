// LP-B4: the coins real runs pay match the LP-P1 table (#494, drafts/planning/LP-P1-coin-rates.md
// section 4), measured the way LP-P1 measured it (same bots, artists, seeds).
// Standard belt 1 runs every time; the whole table runs with BALANCE=1.
import { describe, expect, it } from 'vitest';

// The rules package has no browser or Node types; the test runner still has a console for the printed table.
declare const console: { log(...args: unknown[]): void };
import { ARTISTS } from '../r-bal-12-artists';
import { testContent } from '../load-content';
import { SKILLS, playRoom, type Skill, type Style } from './bot';
import { createRng, createRunWorld, currentRoom, runCoins, startRun, summarizeRun, type Difficulty } from '../../src';

const BOTS: Record<string, { style: Style; skill: Skill }> = {
  kid: { style: 'kid', skill: SKILLS.novice },
  newer: { style: 'smart', skill: SKILLS.typical },
  careful: { style: 'smart', skill: SKILLS.sharp },
  masher: { style: 'masher', skill: SKILLS.novice },
};
const ORDER = ['kid', 'newer', 'careful', 'masher'];
// LP-P1 table, belts 1-10 (kid / newer / careful / masher). Challenge before belt 4 is locked, so not checked.
const TABLE: Record<Difficulty, number[][]> = {
  // GP-6 (Nov 25): the whole table re-measured with BALANCE=1 after Jay's Nov 24 changes (no automatic blocking,
  // the damage shift, the Tool Belt). Kid and masher now lose most runs, so they sit near the 60-coin floor.
  standard: [[63, 101, 101, 60], [64, 101, 101, 60], [61, 101, 101, 60], [62, 101, 101, 60], [63, 101, 101, 60], [62, 101, 101, 60], [62, 101, 101, 60], [62, 101, 101, 60], [62, 101, 101, 60], [62, 101, 101, 60]],
  // Guided re-measured again after the Mash guard came back on Guided only (Jay, Nov 25) at enemy Power 0.75. Belt 2 re-measured
  // once more on the new Sunrise Garden floors and the Loom Keeper (merged to main, Nov 25).
  guided: [[100, 101, 101, 83], [100, 101, 101, 94], [96, 101, 101, 89], [98, 101, 101, 83], [96, 101, 101, 82], [96, 101, 101, 83], [97, 101, 101, 82], [98, 101, 101, 84], [99, 101, 101, 85], [99, 101, 101, 84]],
  challenge: [[], [], [], [61, 101, 101, 60], [61, 101, 101, 60], [61, 101, 101, 60], [61, 101, 101, 60], [61, 101, 101, 60], [61, 101, 101, 60], [61, 101, 101, 60]],
};

// Newer and careful win (nearly) every run, so they pin the formula (60 + 7 fight rooms x 3 + boss 10 + win 10).
// Kid and masher depend on how often they win: on main just before OV-B6 (#512, merged after #494, 10011b41)
// every cell was within 1 coin of the table; #512's Press the Advantage and Power-up pool moved them by up to
// 4.2 coins, so they get a 5-coin band, and T1 (#494: every live cell at least 60, highest / lowest at most 2x) must hold.
const WINS = new Set(['newer', 'careful']);
const near = (bot: string, got: number, want: number) => Math.abs(got - want) <= (WINS.has(bot) ? 1 : 5);

function meanCoins(diff: Difficulty, bot: string, tier: number, seeds = 100): number {
  const { style, skill } = BOTS[bot];
  const a = ARTISTS.typical[tier - 1];
  const base = { maxHealth: a.health, power: a.power, guard: a.guard };
  let total = 0;
  for (let i = 0; i < seeds; i++) {
    const seed = 1000 + i;
    const c = testContent();
    const run = startRun(c, { seed, dryRuns: 0, difficulty: diff, tier });
    const rng = createRng(seed * 7919 + 13);
    for (let n = 0; run.status === 'playing' && n < 20; n++) playRoom(c, run, createRunWorld(c, run, base, [], diff), currentRoom(c, run), style, skill, rng);
    total += runCoins(summarizeRun(run));
  }
  return total / seeds;
}

const cells = (all: boolean) =>
  (Object.keys(TABLE) as Difficulty[]).flatMap((diff) =>
    TABLE[diff].flatMap((row, t) => row.map((want, b) => ({ diff, tier: t + 1, bot: ORDER[b], want }))).filter((c) => all || (c.diff === 'standard' && c.tier === 1)),
  );

describe('LP-B4 coin rates match LP-P1 (#494)', () => {
  it.each(cells(false))('$diff belt $tier $bot pays $want a run (#494)', ({ diff, tier, bot, want }) => {
    const got = meanCoins(diff, bot, tier);
    expect(near(bot, got, want), `got ${got}`).toBe(true);
  });
  it.skipIf(!(import.meta.env as Record<string, string | undefined>).BALANCE)('every live cell of the table', () => {
    const all = cells(true).map((c) => ({ ...c, got: meanCoins(c.diff, c.bot, c.tier) }));
    // GP-6: print the measured table, one row per difficulty and belt (kid / newer / careful / masher), for re-tuning.
    for (const d of Object.keys(TABLE)) for (let t = 1; t <= 10; t++) { const row = all.filter((c) => c.diff === d && c.tier === t); if (row.length) console.log(`COINS ${d} ${t}: ${row.map((c) => c.got.toFixed(1)).join(' / ')}`); }
    expect(all.filter((c) => !near(c.bot, c.got, c.want))).toEqual([]);
    const got = all.map((c) => c.got);
    expect(Math.min(...got)).toBeGreaterThanOrEqual(60);
    expect(Math.max(...got) / Math.min(...got)).toBeLessThanOrEqual(2);
  }, 6_000_000);
});
