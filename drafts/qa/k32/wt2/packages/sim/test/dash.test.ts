import { describe, expect, it } from 'vitest';
import { COMBAT, createWorld, loadRoom, stepWorld, type PlayerInput } from '../src';

function open() {
  const room = loadRoom({
    id: 'open',
    name: 'Open',
    tiles: ['##########', '#........#', '#..P.....#', '#........#', '##########'],
  });
  const world = createWorld(room, ['p1']);
  return { room, world, p: world.players.p1 };
}

const IDLE: PlayerInput = { kind: 'none' };

describe('Dash', () => {
  it('moves the set distance in the stick direction over the set ticks', () => {
    const { room, world, p } = open();
    const startX = p.pos.x;
    stepWorld(world, room, { p1: { kind: 'stick', x: 1, y: 0, action: 'dash' } });
    for (let i = 1; i < COMBAT.dash.ticks; i++) stepWorld(world, room, { p1: IDLE });
    expect(p.pos.x - startX).toBeCloseTo(COMBAT.dash.distanceTiles, 5);
    expect(p.dashTicks).toBe(0);
  });

  it('uses the facing direction when the stick is not pushed', () => {
    const { room, world, p } = open();
    p.facing = { x: 1, y: 0 };
    const startX = p.pos.x;
    stepWorld(world, room, { p1: { kind: 'none', action: 'dash' } });
    expect(p.pos.x).toBeGreaterThan(startX);
  });

  it('never goes through walls', () => {
    const { room, world, p } = open();
    for (let i = 0; i < 200; i++) {
      stepWorld(world, room, { p1: { kind: 'stick', x: -1, y: 0, action: i % 31 === 0 ? 'dash' : undefined } });
      expect(p.pos.x).toBeGreaterThanOrEqual(1.42 - 1e-9);
    }
  });

  it('has a cooldown', () => {
    const { room, world, p } = open();
    stepWorld(world, room, { p1: { kind: 'stick', x: 1, y: 0, action: 'dash' } });
    for (let i = 1; i < COMBAT.dash.ticks; i++) stepWorld(world, room, { p1: IDLE });
    const x = p.pos.x;
    stepWorld(world, room, { p1: { kind: 'none', action: 'dash' } });
    expect(p.dashTicks).toBe(0);
    expect(p.pos.x).toBe(x);
  });
});
