import { describe, expect, it } from 'vitest';
import { TICKS_PER_SECOND, createWorld, stepWorld, type PlayerInput, type WorldState } from '../src';
import { testContent } from './load-content';

// TUT-B4: the Tower Path's stones beat lasts 30-60 s for a kid on Guided (TUT-P1 target, Tester timing in #536).
const room = testContent().rooms.find((r) => r.id === 'tutorial-path')!;

function secondsUntilDone(input: (w: WorldState) => PlayerInput): number {
  const w = createWorld(room, ['p1']);
  w.players.p1.pos = { ...room.goal! };
  for (let t = 1; t < 200 * TICKS_PER_SECOND; t++) {
    stepWorld(w, room, { p1: input(w) });
    if (w.events.some((e) => e.kind === 'stonesDone')) return t / TICKS_PER_SECOND;
  }
  throw new Error('the stones never finished');
}
const safe = (w: WorldState): PlayerInput => ({ kind: 'moveTo', ...room.stoneWaves[w.stones!.wave].safeSpot! });

describe('TUT-B4 stones timing', () => {
  it('has 6 waves of 1, 1, 2, 2, 3 and 3 stones', () => {
    expect(room.stoneWaves.map((w) => w.spots.length)).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('takes 30-60 s whether every wave is dodged or every other wave is missed once', () => {
    const clean = secondsUntilDone(safe);
    const someMisses = secondsUntilDone((w) => {
      const st = w.stones!;
      return st.wave % 2 === 0 && st.misses === 0 ? { kind: 'moveTo', ...room.stoneWaves[st.wave].spots[0] } : safe(w);
    });
    expect(clean).toBeGreaterThanOrEqual(30);
    expect(someMisses).toBeGreaterThan(clean);
    expect(someMisses).toBeLessThanOrEqual(60);
  });
});
