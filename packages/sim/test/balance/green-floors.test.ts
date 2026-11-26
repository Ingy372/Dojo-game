/// <reference types="vite/client" />
// Green floors (Nov 26): the Giant's Steps (belt 4) played by the bots next to the Ember Kitchens (belt 3)
// and the Sunrise Garden (belt 2), each at its own belt's typical student. The set is still off in the live game,
// so this switches it on in test content only. Prints the table with BALANCE=1; the gate below runs every time.
import { describe, expect, it } from 'vitest';

declare const console: { log(...args: unknown[]): void };
import { createRng, createRunWorld, currentRoom, loadContent, runCoins, startRun, summarizeRun, type Content, type Difficulty } from '../../src';
import { testRawContent } from '../load-content';
import { ARTISTS } from '../r-bal-12-artists';
import { SKILLS, playRoom, playRun, type RunStats, type Skill, type Style } from './bot';

const BALANCE = !!(import.meta.env as Record<string, string | undefined>).BALANCE;

/** Test content with the Giant's Steps switched on (the live file keeps it off). */
export function greenContent(): Content {
  const raw = testRawContent();
  return loadContent({ ...raw, floorSets: { ...raw.floorSets, sets: { ...raw.floorSets.sets, 'giants-steps': true } } });
}

const BOTS: Record<string, { style: Style; skill: Skill }> = {
  kid: { style: 'kid', skill: SKILLS.novice },
  newer: { style: 'smart', skill: SKILLS.typical },
  careful: { style: 'smart', skill: SKILLS.sharp },
  masher: { style: 'masher', skill: SKILLS.novice },
};

const student = (tier: number) => {
  const a = ARTISTS.typical[tier - 1];
  return { maxHealth: a.health, power: a.power, guard: a.guard };
};

export function runs(content: Content, tier: number, bot: string, diff: Difficulty, seeds: number): RunStats[] {
  const { style, skill } = BOTS[bot];
  return Array.from({ length: seeds }, (_, i) => playRun(content, 1000 + i, style, skill, diff, student(tier), undefined, { tier }));
}

/** Coins a run pays on average, measured like coin-rates.test.ts (same bots, typical student, seeds 1000 on). */
export function meanCoins(content: Content, diff: Difficulty, bot: string, tier: number, seeds: number): number {
  const { style, skill } = BOTS[bot];
  let total = 0;
  for (let i = 0; i < seeds; i++) {
    const seed = 1000 + i;
    const run = startRun(content, { seed, dryRuns: 0, difficulty: diff, tier });
    const rng = createRng(seed * 7919 + 13);
    for (let n = 0; run.status === 'playing' && n < 20; n++) playRoom(content, run, createRunWorld(content, run, student(tier), [], diff), currentRoom(content, run), style, skill, rng);
    total += runCoins(summarizeRun(run));
  }
  return total / seeds;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const FIGHTS = ['battle', 'challenge', 'boss'];

/** Win %, health lost per fight room (share of max health), minutes per won floor, and the hardest room. */
export function summary(list: RunStats[], tier: number) {
  const hp = student(tier).maxHealth;
  const won = list.filter((r) => r.won);
  const fights = list.flatMap((r) => r.rooms).filter((r) => FIGHTS.includes(r.kind));
  const byRoom = new Map<string, number[]>();
  for (const r of fights) byRoom.set(r.roomId, [...(byRoom.get(r.roomId) ?? []), r.damage / hp]);
  const worst = [...byRoom].map(([id, xs]) => [id, avg(xs)] as const).sort((a, b) => b[1] - a[1])[0];
  return {
    win: Math.round((100 * won.length) / list.length),
    lost: Math.round(100 * avg(fights.map((r) => r.damage / hp))),
    minutes: +avg(won.map((r) => r.ticks / 20 / 60)).toFixed(1),
    worst: worst ? `${worst[0]} ${Math.round(100 * worst[1])}%` : '-',
    deaths: fights.filter((r) => r.died).length,
  };
}

describe('Green floors: the Giant\'s Steps', () => {
  it('a typical Green student clears a Standard floor (fast CI case)', () => {
    const s = summary(runs(greenContent(), 4, 'newer', 'standard', 4), 4);
    expect(s.win).toBe(100);
  });

  it.runIf(BALANCE)('prints Yellow, Orange and Green side by side', () => {
    const live = loadContent(testRawContent());
    const green = greenContent();
    const SEEDS = Number((import.meta.env as Record<string, string | undefined>).RUNS ?? 40);
    for (const diff of ['guided', 'standard', 'challenge'] as Difficulty[]) {
      for (const bot of Object.keys(BOTS)) {
        const row = [2, 3, 4].map((t) => (t === 4 ? summary(runs(green, 4, bot, diff, SEEDS), 4) : summary(runs(live, t, bot, diff, SEEDS), t)));
        console.log(`GREEN ${diff.padEnd(9)} ${bot.padEnd(7)} | ` + row.map((s, i) => `b${i + 2} win ${String(s.win).padStart(3)}% lost/room ${String(s.lost).padStart(3)}% ${String(s.minutes).padStart(4)} min worst ${s.worst}`).join(' | '));
      }
    }
    // The belt-4 row of the coin table (coin-rates.test.ts), measured on the Green floors.
    for (const diff of ['standard', 'guided', 'challenge'] as Difficulty[]) {
      console.log(`GREEN COINS ${diff} 4: ${Object.keys(BOTS).map((b) => meanCoins(green, diff, b, 4, SEEDS).toFixed(1)).join(' / ')}`);
    }
  }, 6_000_000);
});
