import { describe, expect, it } from 'vitest';
import { COMBAT, createWorld, loadEnemy, loadRoom, stepWorld, type WorldState } from '../src';
import bruteData from '../../../content/enemies/brute.json';

// T5 (fix A, Jay Nov 18): after a Perfect Counter, STRIKE is a free finisher that knocks the enemy back.
const brute = loadEnemy(bruteData);
const room = loadRoom({
  id: 't5-room',
  name: 'T5 room',
  kind: 'practice',
  tiles: ['#########', '#.......#', '#.......#', '#...P...#', '#.......#', '#.......#', '#########'],
  enemies: [{ enemy: 'brute', column: 6, row: 4 }],
});

function setup(): WorldState {
  const w = createWorld(room, ['p1'], { enemyTypes: { brute }, respawnEnemies: false });
  const e = w.enemies[0];
  e.mode = 'stagger';
  e.modeTicks = 20;
  w.players.p1.pos = { x: 4.5, y: 3.5 };
  e.pos = { x: 5.4, y: 3.5 };
  w.players.p1.opening = { enemyId: e.id, ticks: COMBAT.opening.ticks };
  w.players.p1.focus = 0;
  return w;
}

describe('T5 the Opening', () => {
  it('a Strike during the Opening costs no Focus, hits and knocks the enemy back', () => {
    const w = setup();
    const before = w.enemies[0].health;
    stepWorld(w, room, { p1: { kind: 'none', action: 'strike' } });
    expect(w.events.some((e) => e.kind === 'openingFinisher')).toBe(true);
    expect(w.events.some((e) => e.kind === 'strikeRefused')).toBe(false);
    expect(w.enemies[0].health).toBeLessThan(before);
    expect(w.enemies[0].pos.x).toBeGreaterThan(5.4 + COMBAT.opening.knockTiles * 0.5);
    expect(w.players.p1.opening).toBeNull();
  });

  it('never knocks an enemy through a wall', () => {
    const w = setup();
    w.players.p1.pos = { x: 6.5, y: 3.5 };
    w.enemies[0].pos = { x: 7.4, y: 3.5 };
    stepWorld(w, room, { p1: { kind: 'none', action: 'strike' } });
    expect(w.enemies[0].pos.x).toBeLessThan(8 - w.enemies[0].def.radius + 0.01);
  });

  it('runs out after its time, and then STRIKE needs Focus again', () => {
    const w = setup();
    for (let i = 0; i < COMBAT.opening.ticks; i++) stepWorld(w, room, { p1: { kind: 'none' } });
    expect(w.players.p1.opening).toBeNull();
    stepWorld(w, room, { p1: { kind: 'none', action: 'strike' } });
    expect(w.events.some((e) => e.kind === 'openingFinisher')).toBe(false);
  });
});
