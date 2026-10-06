/// <reference types="vite/client" />
// Balance report: the computer player plays many full runs and prints a summary.
// Not part of the normal tests. Run it with:  npm run balance
import { describe, it } from 'vitest';

declare const console: { log(...args: unknown[]): void };
import type { Difficulty } from '../../src';
import { testContent } from '../load-content';
import { SKILLS, playRun, type RunStats, type Style } from './bot';

const enabled = !!(import.meta.env as Record<string, string | undefined>).BALANCE;
const RUNS = Number((import.meta.env as Record<string, string | undefined>).RUNS ?? 60);

const pct = (n: number, d: number) => `${Math.round((100 * n) / Math.max(1, d))}%`;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const f1 = (n: number) => n.toFixed(1);

function summarize(label: string, runs: RunStats[]): void {
  const won = runs.filter((r) => r.won);
  const rooms = runs.flatMap((r) => r.rooms);
  const fights = rooms.filter((r) => ['battle', 'challenge', 'boss'].includes(r.kind));
  const deaths: Record<string, number> = {};
  for (const r of rooms) if (r.died) deaths[r.roomId] = (deaths[r.roomId] ?? 0) + 1;
  const grades = { S: 0, A: 0, B: 0 } as Record<string, number>;
  for (const r of fights) if (r.grade) grades[r.grade]++;
  console.log(`\n=== ${label} ===`);
  console.log(`win ${pct(won.length, runs.length)}   run time (won) ${f1(avg(won.map((r) => r.ticks / 20 / 60)))} min   items/run ${f1(avg(runs.map((r) => r.items)))}`);
  console.log(`grades S ${pct(grades.S, fights.length)}  A ${pct(grades.A, fights.length)}  B ${pct(grades.B, fights.length)}`);
  console.log(`deaths by room: ${Object.entries(deaths).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}`);
  const byRoom = new Map<string, typeof fights>();
  for (const r of fights) byRoom.set(r.roomId, [...(byRoom.get(r.roomId) ?? []), r]);
  console.log('room            n   secs  dmg   P/B/H         crowd peak winded');
  for (const [id, list] of [...byRoom].sort()) {
    console.log(
      `${id.padEnd(15)} ${String(list.length).padStart(3)} ${f1(avg(list.map((r) => r.ticks / 20))).padStart(6)} ${f1(avg(list.map((r) => r.damage))).padStart(5)}   ${f1(avg(list.map((r) => r.perfects)))}/${f1(avg(list.map((r) => r.blocks)))}/${f1(avg(list.map((r) => r.hits)))}`.padEnd(52) +
        `${f1(avg(list.map((r) => r.crowd))).padStart(5)} ${f1(avg(list.map((r) => r.peakCrowd))).padStart(4)} ${f1(avg(list.map((r) => r.winded))).padStart(6)}`,
    );
  }
}

describe.skipIf(!enabled)('balance report', () => {
  it('plays full runs', () => {
    const content = testContent();
    const cases: Array<[string, Difficulty]> = [['sharp', 'standard'], ['typical', 'standard'], ['novice', 'standard'], ['novice', 'guided']];
    for (const [skill, difficulty] of cases) {
      for (const style of ['smart', 'stand'] as Style[]) {
        const runs = Array.from({ length: RUNS }, (_, i) => playRun(content, 1000 + i, style, SKILLS[skill], difficulty));
        summarize(`${skill} player, ${style}, ${difficulty}`, runs);
      }
    }
  }, 600000);
});
