/// <reference types="vite/client" />
// C430: Bellows Puff before and after the sim models its no-damage push. "Before" = the push block dropped, so the gust is
// an ordinary 11-power hit (what the sim did); "after" = loadEnemy keeps the push. The w-bamboo-hall room with every enemy swapped for a Puff, belt 1, 100 Health.
// Production content/ has no Bellows Puff yet, so `npm run balance` is unchanged; this is the Puff's own table.
// Not part of the normal tests. Run it with:  BALANCE=1 npx vitest run test/balance/puff-push   (in packages/sim)
import { describe, it } from 'vitest';
import { loadEnemy } from '../../src';
import puffData from '../../../../drafts/content/enemies/bellows-puff.json';
import { testContent } from '../load-content';
import { SKILLS, playRun, type RoomStats, type Style } from './bot';

declare const console: { log(...args: unknown[]): void };
const env = import.meta.env as Record<string, string | undefined>;
const enabled = !!env.BALANCE;
const SEEDS = Number(env.RUNS ?? 100);
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

/** The most-visited belt-1 room (w-bamboo-hall) with every enemy swapped for a Bellows Puff. */
const ROOM = 'w-bamboo-hall';

function play(withPush: boolean, style: Style, skill: string): RoomStats[] {
  const base = testContent();
  const raw: Record<string, unknown> = clone(puffData);
  if (!withPush) delete raw.push;
  const puff = loadEnemy(raw);
  const content = {
    ...base,
    enemies: { ...base.enemies, 'bellows-puff': puff },
    rooms: base.rooms.map((r) => (r.id === ROOM ? { ...r, enemySpawns: r.enemySpawns.map((s) => ({ ...s, enemy: 'bellows-puff' })) } : r)),
  };
  const out: RoomStats[] = [];
  for (let i = 0; i < SEEDS; i++) {
    const run = playRun(content, 1000 + i, style, SKILLS[skill], 'standard', { maxHealth: 100, power: 10, guard: 0 }, undefined, { tier: 1 });
    out.push(...run.rooms.filter((r) => r.roomId === ROOM));
  }
  return out;
}

describe.skipIf(!enabled)('Bellows Puff push report', () => {
  it('prints the Puff room before and after', () => {
    console.log('\n=== Bellows Puff in w-bamboo-hall: push ignored (before) vs modelled (after) ===');
    console.log('skill/style          sim      alive  secs  dmg taken  P/B/H');
    for (const skill of ['sharp', 'typical', 'novice']) {
      for (const style of ['smart', 'stand'] as Style[]) {
        for (const withPush of [false, true]) {
          const rs = play(withPush, style, skill);
          const win = rs.filter((r) => !r.died).length;
          console.log(
            `${`${skill}/${style}`.padEnd(20)} ${(withPush ? 'after' : 'before').padEnd(8)} ${`${Math.round((100 * win) / rs.length)}%`.padStart(4)} ${avg(rs.map((r) => r.ticks / 20)).toFixed(1).padStart(6)} ${avg(rs.map((r) => r.damage)).toFixed(1).padStart(9)}  ${avg(rs.map((r) => r.perfects)).toFixed(1)}/${avg(rs.map((r) => r.blocks)).toFixed(1)}/${avg(rs.map((r) => r.hits)).toFixed(1)}`,
          );
        }
      }
    }
  }, 600000);
});
