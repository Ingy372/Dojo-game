import { describe, expect, it } from 'vitest';
import { MOVEMENT, circleHitsWall, loadRoom, pushOutOfWalls } from '../src';

// Nov 24 (Jay): "the walk zones can be smoother, I'm getting a bit stuck". In the town, outside corners are rounded.
describe('rounded corners', () => {
  const tiles = ['#######', '#.....#', '#..#..#', '#.....#', '#######'];
  const square = loadRoom({ id: 'sq', name: 'Square', tiles: tiles.map((t, i) => (i === 1 ? '#P....#' : t)) });
  const round = { ...square, roundCorners: true };
  const r = MOVEMENT.playerRadius;
  // the lone block is tile (3, 2): its corner is at (3, 2); a body just off that corner, on the diagonal
  const nearCorner = { x: 3 - 0.27, y: 2 - 0.27 };

  it('a lone block is round: a body can stand closer to its corner than with a square', () => {
    expect(circleHitsWall(square, nearCorner, r)).toBe(true);
    expect(circleHitsWall(round, nearCorner, r)).toBe(false);
  });

  it('is never smaller than a circle as wide as the tile', () => {
    // straight beside the block's middle it blocks just like before
    expect(circleHitsWall(round, { x: 3.5, y: 2 - r + 0.01 }, r)).toBe(true);
    expect(circleHitsWall(round, { x: 3 - r + 0.01, y: 2.5 }, r)).toBe(true);
  });

  it('pushes a body out round the curve, never into the block', () => {
    const p = { x: 3.1, y: 1.9 };
    pushOutOfWalls(round, p, r);
    expect(circleHitsWall(round, p, r)).toBe(false);
    expect(Math.hypot(p.x - 3.5, p.y - 2.5)).toBeGreaterThanOrEqual(0.5 + r - 1e-6);
  });

  it('keeps inside corners square (walls that meet stay walls)', () => {
    expect(circleHitsWall(round, { x: 1 + r - 0.01, y: 1 + r + 0.2 }, r)).toBe(true);
  });

  it('walking straight at a lone block a little off its middle glides round it (a square stops you dead)', () => {
    const walk = (room: typeof square) => {
      const p = { x: 1.5, y: 2.3 };
      for (let i = 0; i < 40; i++) {
        p.x += 0.2;
        if (p.x > 5.4) p.x = 5.4;
        pushOutOfWalls(room, p, r);
      }
      return p.x;
    };
    expect(walk(square)).toBeLessThan(3);
    expect(walk(round)).toBeGreaterThan(4);
  });
});
