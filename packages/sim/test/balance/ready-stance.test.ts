/// <reference types="vite/client" />
// R-STANCE-READY-NUM: smart, kid and masher bots with Beginner's Stance vs Open Leg (ready-stance).
// Not part of the normal tests. Run it with:  BALANCE=1 npx vitest run test/balance/ready-stance
import { describe, it } from 'vitest';
import type { Difficulty } from '../../src';
import { testContent } from '../load-content';
import { SKILLS, playRun, type RunStats, type Style } from './bot';

declare const console: { log(...args: unknown[]): void };
const env = import.meta.env as Record<string, string | undefined>;
const RUNS = Number(env.RUNS ?? 60);
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function row(label: string, runs: RunStats[]): string {
  const rooms = runs.flatMap((r) => r.rooms);
  const fights = rooms.filter((r) => ['battle', 'challenge', 'boss'].includes(r.kind));
  const win = Math.round((100 * runs.filter((r) => r.won).length) / runs.length);
  const kos = rooms.reduce((a, r) => a + r.kos, 0) / runs.length;
  const downs = rooms.filter((r) => r.died).length / runs.length;
  const dealt = avg(fights.map((r) => r.dealt));
  const taken = avg(fights.map((r) => r.damage));
  const secs = avg(fights.map((r) => r.ticks / 20));
  return `${label.padEnd(34)} win ${String(win).padStart(3)}%  KOs/run ${kos.toFixed(1).padStart(5)}  player downs/run ${downs.toFixed(2)}  dealt/fight ${dealt.toFixed(0).padStart(4)}  taken/fight ${taken.toFixed(1).padStart(5)}  secs/fight ${secs.toFixed(1)}`;
}

describe.skipIf(!env.BALANCE)('ready-stance report', () => {
  it('plays smart, kid and masher with each stance', () => {
    const content = testContent();
    const stances = content.abilities.stances.filter((s) => s.id === 'beginners-stance' || s.id === 'ready-stance');
    const cases: Array<[string, Difficulty]> = [['sharp', 'standard'], ['typical', 'standard'], ['novice', 'standard'], ['novice', 'guided']];
    for (const [skill, difficulty] of cases) {
      console.log(`\n=== ${skill}, ${difficulty} (${RUNS} runs each) ===`);
      for (const style of ['smart', 'kid', 'masher'] as Style[]) {
        for (const st of stances) {
          const runs = Array.from({ length: RUNS }, (_, i) => playRun(content, 1000 + i, style, SKILLS[skill], difficulty, { maxHealth: 100, power: 10, guard: 0, stances: [st] }));
          console.log(row(`${style} / ${st.name}`, runs));
        }
      }
    }
  }, 900000);
});
