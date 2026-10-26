/// <reference types="vite/client" />
// Balance report: the computer player plays many full runs and prints a summary.
// Not part of the normal tests. Run it with:  npm run balance
import { describe, it } from 'vitest';

declare const console: { log(...args: unknown[]): void };
import type { Difficulty, EliteKind } from '../../src';
import { testContent } from '../load-content';
import { buildTraining, loadFeed } from '../../src';
import green from '../../../../fixtures/4-green-belt.json';
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
  console.log(`strikes per fight room ${f1(avg(fights.map((r) => r.strikes)))}   perfects per fight room ${f1(avg(fights.map((r) => r.perfects)))}`);
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
    // Elites (S1 #3): 4th belt with elites rolled as in play, and every fight room forced to have one.
    const fightSecs = (runs: RunStats[]) => {
      const m = new Map<string, number[]>();
      for (const r of runs.flatMap((x) => x.rooms)) if (['battle', 'challenge'].includes(r.kind) && r.roomId !== 'tutorial') m.set(r.roomId, [...(m.get(r.roomId) ?? []), r.ticks / 20]);
      return m;
    };
    // The 4th-belt test profile (fixtures/4-green-belt.json) sets the tier, so elites come at their real rate.
    const greenFeed = loadFeed(green);
    const greenTier = buildTraining(greenFeed, content.abilities, { ms: Date.parse(greenFeed.asOf), weekday: new Date(greenFeed.asOf).getUTCDay() }).belt.tier;
    for (const [skill, difficulty] of cases) {
      const plain = Array.from({ length: RUNS }, (_, i) => playRun(content, 1000 + i, 'smart', SKILLS[skill], difficulty, undefined, undefined, { tier: 1 }));
      const natural = Array.from({ length: RUNS }, (_, i) => playRun(content, 1000 + i, 'smart', SKILLS[skill], difficulty, undefined, undefined, { tier: greenTier }));
      const strikes = (runs: RunStats[]) => f1(avg(runs.flatMap((r) => r.rooms).filter((r) => ['battle', 'challenge', 'boss'].includes(r.kind)).map((r) => r.strikes)));
      const wins = (runs: RunStats[]) => pct(runs.filter((r) => r.won).length, runs.length);
      const eliteRooms = natural.flatMap((r) => r.rooms).filter((r) => r.elite);
      console.log(`\n=== elites, ${skill} player, smart, ${difficulty} ===`);
      console.log(`no elites (1st belt): win ${wins(plain)}  strikes/fight room ${strikes(plain)}`);
      console.log(`elites as rolled (4th-belt profile): win ${wins(natural)}  strikes/fight room ${strikes(natural)}  elite rooms ${eliteRooms.length} (swift ${eliteRooms.filter((r) => r.elite === 'swift').length}, guarding ${eliteRooms.filter((r) => r.elite === 'guarding').length}) over ${RUNS} runs`);
      const base = fightSecs(plain);
      for (const kind of ['swift', 'guarding'] as EliteKind[]) {
        const forced = Array.from({ length: RUNS }, (_, i) => playRun(content, 1000 + i, 'smart', SKILLS[skill], difficulty, undefined, undefined, { tier: 4, forcedElite: kind }));
        const secs = fightSecs(forced);
        const ratios = [...secs].filter(([id]) => base.has(id)).map(([id, xs]) => avg(xs) / avg(base.get(id)!));
        console.log(`every fight room ${kind}: win ${wins(forced)}  strikes/fight room ${strikes(forced)}  room time x${avg(ratios).toFixed(2)} vs same rooms without (worst x${Math.max(...ratios).toFixed(2)})`);
      }
    }
    // First run with and without Sensei's guided Counter (G1), for players who never Counter.
    for (const difficulty of ['standard', 'guided'] as Difficulty[]) {
      for (const style of ['masher', 'smart'] as Style[]) {
        for (const guide of [undefined, 0]) {
          const runs = Array.from({ length: RUNS }, (_, i) => playRun(content, 1000 + i, style, SKILLS.novice, difficulty, undefined, guide));
          summarize(`novice player, ${style}, ${difficulty}, guide ${guide === undefined ? 'off' : 'on'}`, runs);
        }
      }
    }
  }, 600000);
});
