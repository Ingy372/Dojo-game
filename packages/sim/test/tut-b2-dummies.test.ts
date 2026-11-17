import { describe, expect, it } from 'vitest';
import { COMBAT, ENEMY_TRAINING_SCALE, EnemyError, byTier, createWorld, loadContent, loadEnemy, loadRoom, newProfile, playerStats, strikeCost, stepWorld, type PlayerInput, type WorldState } from '../src';
import { testContent, testRawContent } from './load-content';
import dummyFile from '../../../content/enemies/practice-dummy.json';
import bigDummyFile from '../../../content/enemies/big-practice-dummy.json';

const content = testContent();
const tiles = ['#DDD#####', '#.......#', '#...P...#', '#.......#', '#.......#', '#.......#', '#########'];
const hall = (enemy: string, tutorial = true) =>
  loadRoom({ id: 'training-hall-test', name: 'Training Hall', kind: 'battle', tutorial, tiles, enemies: [{ enemy, column: 5, row: 5 }] });
// A starting hero (brand-new White belt profile), at the tutorial's enemy scale.
const hero = () => {
  const s = playerStats(newProfile());
  return { maxHealth: s.maxHealth, power: s.power, guard: s.guard };
};
const world = (enemy: string) =>
  createWorld(hall(enemy), ['p1'], { enemyTypes: content.enemies, respawnEnemies: false, player: hero(), enemyScale: byTier(ENEMY_TRAINING_SCALE, 1), minHealth: 1 });
const toDummy = (w: WorldState): PlayerInput => ({ kind: 'moveTo', x: w.enemies[0].pos.x, y: w.enemies[0].pos.y - 0.9 });

describe('TUT-B2 practice dummies', () => {
  it('loads both dummies as passive, with no attacks', () => {
    for (const id of ['practice-dummy', 'big-practice-dummy']) {
      expect(content.enemies[id]).toMatchObject({ passive: true, stationary: true, moveSpeedTilesPerSecond: 0, attacks: [] });
    }
    expect(content.enemies['big-practice-dummy'].maxHealth).toBeGreaterThan(content.enemies['practice-dummy'].maxHealth);
  });

  it('a dummy never moves or attacks, even with the hero right next to it', () => {
    for (const id of ['practice-dummy', 'big-practice-dummy']) {
      const w = world(id);
      const at = { ...w.enemies[0].pos };
      const kinds = new Set<string>();
      for (let i = 0; i < 20 * 20; i++) {
        stepWorld(w, hall(id), { p1: { kind: 'moveTo', x: 5.5, y: 5.5 } });
        w.events.forEach((e) => kinds.add(e.kind));
        if (w.enemies[0].mode === 'defeated') break;
        expect(w.enemies[0].pos).toEqual(at);
        expect(['waiting', 'chase']).toContain(w.enemies[0].mode);
      }
      expect(kinds.has('telegraph')).toBe(false);
      expect(kinds.has('hit')).toBe(false);
      expect(kinds.has('block')).toBe(false);
    }
  });

  it('auto-attack hits it, Focus rises the normal amount per hit, and it can be beaten', () => {
    const room = hall('practice-dummy');
    const w = world('practice-dummy');
    let hits = 0;
    for (let i = 0; i < 30 * 20 && w.enemies[0].mode !== 'defeated'; i++) {
      stepWorld(w, room, { p1: toDummy(w) });
      hits += w.events.filter((e) => e.kind === 'playerAttack').length;
    }
    expect(w.enemies[0].mode).toBe('defeated');
    expect(hits).toBeGreaterThan(1);
    expect(w.players.p1.focus).toBe(Math.min(COMBAT.focus.max, hits * COMBAT.focus.perHit));
  });

  it("a starting hero's auto-attack fills Focus for STRIKE before the big dummy falls", () => {
    const room = hall('big-practice-dummy');
    const w = world('big-practice-dummy');
    let ready = false;
    for (let i = 0; i < 60 * 20 && w.enemies[0].mode !== 'defeated'; i++) {
      stepWorld(w, room, { p1: toDummy(w) }); // basic attacks only, starting from 0 Focus (no bow)
      if (w.players.p1.focus >= strikeCost(w.players.p1)) {
        ready = true;
        break;
      }
    }
    expect(ready).toBe(true);
    expect(w.enemies[0].mode).not.toBe('defeated');
    // And STRIKE then lands on it.
    const focus = w.players.p1.focus;
    const health = w.enemies[0].health;
    for (let i = 0; i < 20; i++) stepWorld(w, room, { p1: { kind: 'none', action: i === 0 ? 'strike' : undefined } });
    expect(w.events.some((e) => e.kind === 'strikeRefused')).toBe(false);
    expect(w.players.p1.focus).toBeLessThan(focus);
    expect(w.enemies[0].health).toBeLessThan(health);
  });

  it('a passive enemy outside a tutorial room fails to load, and a passive file with an attack is refused', () => {
    const files = (room: object) => ({ ...testRawContent(), rooms: [...testRawContent().rooms, room] });
    expect(() => loadContent(files({ id: 'dummy-in-tower', name: 'X', kind: 'battle', tiles, enemies: [{ enemy: 'practice-dummy', column: 5, row: 5 }] }))).toThrow(/only tutorial rooms/);
    expect(() => loadContent(files({ id: 'dummy-in-tutorial', name: 'X', kind: 'practice', tutorial: true, tiles, enemies: [{ enemy: 'practice-dummy', column: 5, row: 5 }] }))).not.toThrow();
    expect(() => loadEnemy({ ...dummyFile, attack: { strength: 1, startRange: 1, reach: 0, areaRadius: 1, telegraphTicks: 12, recoverTicks: 12 } })).toThrow(EnemyError);
    expect(() => loadEnemy({ ...bigDummyFile, moveSpeedTilesPerSecond: 2 })).toThrow(EnemyError);
    // Every other enemy still needs a warned attack.
    expect(() => loadEnemy({ ...dummyFile, passive: false })).toThrow(/attack/);
  });
});
