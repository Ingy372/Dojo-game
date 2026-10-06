import { describe, expect, it } from 'vitest';
import {
  MOVEMENT,
  TICKS_PER_SECOND,
  circleHitsWall,
  createWorld,
  loadRoom,
  stepWorld,
  type PlayerInput,
  type WorldState,
} from '../src';
import trainingRoom from '../../../content/rooms/training-room.json';

const room = loadRoom(trainingRoom);
const R = MOVEMENT.playerRadius;

function run(world: WorldState, ticks: number, input: (tick: number) => PlayerInput) {
  for (let i = 0; i < ticks; i++) {
    stepWorld(world, room, { p1: input(i) });
    expect(circleHitsWall(room, world.players.p1.pos, R - 1e-9)).toBe(false);
  }
}

describe('movement', () => {
  it('starts the player at the room start', () => {
    const world = createWorld(room, ['p1']);
    expect(world.players.p1.pos).toEqual(room.playerStart);
  });

  it('moves at walking speed with a full stick push', () => {
    const world = createWorld(room, ['p1']);
    run(world, TICKS_PER_SECOND, () => ({ kind: 'stick', x: 1, y: 0 }));
    expect(world.players.p1.pos.x).toBeCloseTo(room.playerStart.x + MOVEMENT.speedTilesPerSecond, 5);
    expect(world.players.p1.facing).toEqual({ x: 1, y: 0 });
    expect(world.tick).toBe(TICKS_PER_SECOND);
  });

  it('ignores a tiny stick push (dead zone)', () => {
    const world = createWorld(room, ['p1']);
    run(world, 20, () => ({ kind: 'stick', x: 0.1, y: 0 }));
    expect(world.players.p1.pos).toEqual(room.playerStart);
  });

  it('never walks through walls, in any direction', () => {
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [0.3, 0.9],
    ];
    for (const [x, y] of dirs) {
      const world = createWorld(room, ['p1']);
      run(world, 200, () => ({ kind: 'stick', x, y }));
    }
  });

  it('slides along a wall when pushing into it at an angle', () => {
    const world = createWorld(room, ['p1']);
    // Walk up into the top wall, then push up-right: should slide right along it.
    run(world, 20, () => ({ kind: 'stick', x: 0, y: -1 }));
    const x0 = world.players.p1.pos.x;
    run(world, 10, () => ({ kind: 'stick', x: 0.7, y: -0.7 }));
    expect(world.players.p1.pos.x).toBeGreaterThan(x0 + 0.5);
    expect(world.players.p1.pos.y).toBeCloseTo(1 + R, 5);
  });

  it('walks to a tapped spot, going around walls', () => {
    const world = createWorld(room, ['p1']);
    // Behind the long wall in row 6, from the start in the top-left.
    const target = { x: 8.5, y: 9.5 };
    run(world, 1, () => ({ kind: 'moveTo', ...target }));
    run(world, 200, () => ({ kind: 'none' }));
    expect(world.players.p1.pos.x).toBeCloseTo(target.x, 5);
    expect(world.players.p1.pos.y).toBeCloseTo(target.y, 5);
    expect(world.players.p1.path).toBeNull();
    expect(world.players.p1.moving).toBe(false);
  });

  it('tapping a wall walks to the nearest open spot', () => {
    const world = createWorld(room, ['p1']);
    run(world, 1, () => ({ kind: 'moveTo', x: 9.4, y: 3.5 }));
    run(world, 200, () => ({ kind: 'none' }));
    expect(world.players.p1.pos).toEqual({ x: 8.5, y: 3.5 });
  });

  it('the stick cancels a tapped destination', () => {
    const world = createWorld(room, ['p1']);
    run(world, 1, () => ({ kind: 'moveTo', x: 20.5, y: 2.5 }));
    run(world, 1, () => ({ kind: 'stick', x: 0, y: 0 }));
    expect(world.players.p1.path).toBeNull();
  });

  it('gives exactly the same result every time for the same inputs', () => {
    const script = (t: number): PlayerInput =>
      t === 0 ? { kind: 'moveTo', x: 22.2, y: 12.7 }
      : t > 60 && t < 90 ? { kind: 'stick', x: -0.6, y: 0.45 }
      : t === 90 ? { kind: 'moveTo', x: 2.1, y: 13.3 }
      : { kind: 'none' };
    const a = createWorld(room, ['p1']);
    const b = createWorld(room, ['p1']);
    run(a, 300, script);
    run(b, 300, script);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('keeps the world as plain saveable data', () => {
    const world = createWorld(room, ['p1', 'p2']);
    run(world, 5, () => ({ kind: 'moveTo', x: 10, y: 10 }));
    expect(JSON.parse(JSON.stringify(world))).toEqual(world);
  });
});
