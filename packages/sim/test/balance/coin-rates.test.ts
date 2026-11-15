// LP-B4: the coins real runs pay match the LP-P1 table (#494, drafts/planning/LP-P1-coin-rates.md
// section 4), measured the way LP-P1 measured it (same bots, artists, seeds).
// Standard belt 1 runs every time; the whole table runs with BALANCE=1.
import { describe, expect, it } from 'vitest';
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
  standard: [[85, 101, 101, 72], [85, 101, 101, 74], [88, 101, 101, 86], [81, 101, 101, 72], [84, 101, 101, 70], [84, 101, 101, 71], [84, 101, 101, 71], [83, 101, 101, 72], [86, 101, 101, 73], [83, 101, 101, 72]],
  guided: [[99, 101, 101, 91], [99, 101, 101, 95], [99, 101, 101, 99], [98, 101, 101, 92], [99, 101, 101, 92], [99, 101, 101, 91], [97, 101, 101, 92], [98, 101, 101, 92], [97, 101, 101, 93], [97, 101, 101, 94]],
  challenge: [[], [], [], [75, 101, 101, 69], [78, 101, 101, 72], [77, 101, 101, 72], [75, 101, 101, 70], [76, 101, 101, 72], [76, 101, 101, 72], [75, 101, 101, 72]],
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
    expect(all.filter((c) => !near(c.bot, c.got, c.want))).toEqual([]);
    const got = all.map((c) => c.got);
    expect(Math.min(...got)).toBeGreaterThanOrEqual(60);
    expect(Math.max(...got) / Math.min(...got)).toBeLessThanOrEqual(2);
  }, 6_000_000);
});
