// B-MASHER-c: the kid bot (a young player who presses every button) as a young-player check.
// The full gate (belts 1-10 x 20 seeds) runs only with BALANCE set; a small fast case runs in CI.
import { describe, expect, it } from 'vitest';
import { testContent } from './load-content';
import { playRun, SKILLS, type RunStats } from './balance/bot';
import { ARTISTS } from './r-bal-12-artists';

const content = testContent();
const balance = !!(import.meta.env as Record<string, string | undefined>).BALANCE;

/** The typical model student's belt-average stats (as in the band test), so each belt plays at its real level. */
const student = (tier: number) => {
  const a = ARTISTS.typical[tier - 1];
  return { maxHealth: a.health, power: a.power, guard: a.guard };
};
/** The masher plays at novice skill in the balance report; the kid bot uses the same. */
const kidRuns = (belts: number[], seeds: number): RunStats[] =>
  belts.flatMap((tier) => Array.from({ length: seeds }, (_, i) => playRun(content, 1000 + i, 'kid', SKILLS.novice, 'standard', student(tier), undefined, { tier })));
const room1Kos = (runs: RunStats[]) => runs.filter((r) => r.rooms[0]?.died).length;

describe('B-MASHER-c kid bot', () => {
  it('plays a run, mashes through shields and uses Strikes (fast CI case)', () => {
    const runs = kidRuns([1], 3);
    for (const r of runs) expect(r.rooms.length).toBeGreaterThan(0);
    expect(runs.flatMap((r) => r.rooms).reduce((n, r) => n + r.strikes, 0)).toBeGreaterThan(0);
    // Repeats exactly from its seed.
    expect(kidRuns([1], 1)[0]).toEqual(runs[0]);
  }, 120000);

  it.runIf(balance)('gate: belts 1-10 x 20 seeds: room-1 KOs <= 20/200, wins >= 35%', () => {
    const runs = kidRuns([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 20);
    const wins = runs.filter((r) => r.won).length;
    const kos = room1Kos(runs);
    (globalThis as { console?: { log(s: string): void } }).console?.log(`B-MASHER-c gate: kid wins ${wins}/${runs.length} (${((100 * wins) / runs.length).toFixed(1)}%), room-1 KOs ${kos}/${runs.length}`);
    expect(kos).toBeLessThanOrEqual(20);
    expect(wins / runs.length).toBeGreaterThanOrEqual(0.35);
  }, 1800000);
});
