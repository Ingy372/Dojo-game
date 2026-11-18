import { describe, expect, it } from 'vitest';
import { MOVEMENT, STONES, TICKS_PER_SECOND, createWorld, stepWorld, type PlayerInput, type Vec2, type WorldState } from '../src';
import { testContent } from './load-content';

// TUT-T2 (Jay, Nov 18): the Tower Path's stones come in 5 waves of 1, 3, 3, 4 and 5 stones, one always
// where the hero stands, with short pauses: growing chaos, but still kind (never hurts, help after misses).
const room = testContent().rooms.find((r) => r.id === 'tutorial-path')!;

/** The nearest floor tile centre clear of every circle now showing. */
function clearSpot(w: WorldState): Vec2 {
  const from = w.players.p1.pos;
  const need = STONES.radius + MOVEMENT.playerRadius;
  let best: Vec2 | null = null;
  for (let y = 0; y < room.height; y++)
    for (let x = 0; x < room.width; x++) {
      if (room.walls[y][x]) continue;
      const c = { x: x + 0.5, y: y + 0.5 };
      if (w.stones!.spots.some((s) => Math.hypot(c.x - s.x, c.y - s.y) <= need)) continue;
      if (!best || Math.hypot(c.x - from.x, c.y - from.y) < Math.hypot(best.x - from.x, best.y - from.y)) best = c;
    }
  return best!;
}

function play(input: (w: WorldState) => PlayerInput) {
  const w = createWorld(room, ['p1']);
  w.players.p1.pos = { ...room.goal! };
  let stumbles = 0;
  const warns: { spots: Vec2[]; at: Vec2 }[] = [];
  for (let t = 1; t < 200 * TICKS_PER_SECOND; t++) {
    const before = { ...w.players.p1.pos };
    stepWorld(w, room, { p1: input(w) });
    for (const e of w.events) {
      if (e.kind === 'stoneWarn') warns.push({ spots: e.spots, at: before });
      if (e.kind === 'stumble') stumbles++;
      if (e.kind === 'stonesDone') return { seconds: t / TICKS_PER_SECOND, stumbles, warns };
    }
  }
  throw new Error('the stones never finished');
}

const dodge = (w: WorldState): PlayerInput => (w.stones!.fillLeft > 0 ? { kind: 'moveTo', ...clearSpot(w) } : { kind: 'none' });
const stand = (): PlayerInput => ({ kind: 'none' });

describe('TUT-T2 stones that chase the hero', () => {
  it('has 5 waves of 1, 3, 3, 4 and 5 stones, each following the hero', () => {
    expect(room.stoneWaves.map((w) => w.spots.length + (w.onPlayer ? 1 : 0) + w.aroundPlayer.length)).toEqual([1, 3, 3, 4, 5]);
    expect(room.stoneWaves.every((w) => w.onPlayer)).toBe(true);
  });

  it('drops one stone where the hero stands every time, and every stone lands on the floor', () => {
    const { warns } = play(dodge);
    expect(warns.length).toBe(5);
    for (const { spots, at } of warns) {
      expect(spots.some((s) => Math.hypot(s.x - at.x, s.y - at.y) < 0.3)).toBe(true);
      for (const s of spots) expect(room.walls[Math.floor(s.y)][Math.floor(s.x)]).toBe(false);
    }
  });

  it('a kid who steps out of the red never stumbles, and it is quick (10-25 s)', () => {
    const { seconds, stumbles } = play(dodge);
    expect(stumbles).toBe(0);
    expect(seconds).toBeGreaterThanOrEqual(10);
    expect(seconds).toBeLessThanOrEqual(25);
  });

  it('a kid who never moves is never stuck: every wave passes after the misses', () => {
    const { stumbles } = play(stand);
    expect(stumbles).toBe(5 * STONES.passAfterMisses);
  });
});
