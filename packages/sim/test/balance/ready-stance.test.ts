/// <reference types="vite/client" />
// R-STANCE-READY-NUM: smart, kid and masher bots in Open Leg (ready-stance) before (all 0) and after
// (#314's 4 bonuses). Same setup as the B-MASHER-c kid gate (test/b-masher-kid.test.ts): belts 1-10 x 20
// seeds, the typical model student's stats for each belt, that belt's tier, novice skill, standard;
// Mash guard and shield-bounce Focus are on as in play. Not part of the normal tests. Run it with:
//   BALANCE=1 npx vitest run test/balance/ready-stance   (in packages/sim)
import { describe, it } from 'vitest';
import type { StanceDef } from '../../src';
import { testContent } from '../load-content';
import { ARTISTS } from '../r-bal-12-artists';
import { SKILLS, playRun, type RunStats, type Style } from './bot';

declare const console: { log(...args: unknown[]): void };
const env = import.meta.env as Record<string, string | undefined>;
const SEEDS = Number(env.RUNS ?? 20);
const BELTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function runs(style: Style, stance: StanceDef): RunStats[] {
  return BELTS.flatMap((tier) => {
    const a = ARTISTS.typical[tier - 1];
    return Array.from({ length: SEEDS }, (_, i) => playRun(testContent(), 1000 + i, style, SKILLS.novice, 'standard', { maxHealth: a.health, power: a.power, guard: a.guard, stances: [stance] }, undefined, { tier }));
  });
}

function row(label: string, rs: RunStats[]): string {
  const rooms = rs.flatMap((r) => r.rooms);
  const fights = rooms.filter((r) => ['battle', 'challenge', 'boss'].includes(r.kind));
  const wins = rs.filter((r) => r.won).length;
  const room1 = rs.filter((r) => r.rooms[0]?.died).length;
  const kos = rooms.reduce((a, r) => a + r.kos, 0) / rs.length;
  return `${label.padEnd(26)} wins ${String(wins).padStart(3)}/${rs.length}  room-1 KOs ${room1}/${rs.length}  enemy KOs/run ${kos.toFixed(1)}  dealt/fight ${avg(fights.map((r) => r.dealt)).toFixed(0)}  taken/fight ${avg(fights.map((r) => r.damage)).toFixed(1)}`;
}

describe.skipIf(!env.BALANCE)('ready-stance report', () => {
  it('plays smart, kid and masher in Open Leg before and after', () => {
    const ready = testContent().abilities.stances.find((s) => s.id === 'ready-stance')!;
    const before: StanceDef = { ...ready, powerScale: 0, dashCooldownScale: 0, blockCut: 0, focusGain: 0 };
    for (const style of ['smart', 'kid', 'masher'] as Style[]) {
      console.log(row(`${style} / before (all 0)`, runs(style, before)));
      console.log(row(`${style} / after (#314)`, runs(style, ready)));
    }
  }, 1800000);
});
