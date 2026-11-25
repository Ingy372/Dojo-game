import { describe, expect, it } from 'vitest';
import { floorEnemyIds, floorRooms } from '../src';
import { testContent } from './load-content';

/** CW-4: a fight loads only the art for enemies its belt's floors can bring. */
const content = testContent();

describe('floorEnemyIds', () => {
  it('lists every enemy in every room of the tier, with no repeats', () => {
    for (const tier of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const ids = floorEnemyIds(content, tier);
      expect(new Set(ids).size).toBe(ids.length);
      for (const room of floorRooms(content, tier)) for (const s of room.enemySpawns) expect(ids).toContain(s.enemy);
    }
  });

  it('adds the helpers a boss calls in and the pieces a split enemy breaks into', () => {
    for (const tier of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const ids = floorEnemyIds(content, tier);
      for (const id of ids) {
        const def = content.enemies[id];
        if (def?.summon) expect(ids).toContain(def.summon.enemy);
        if (def?.split) expect(ids).toContain(def.split.into);
      }
    }
  });

  it('keeps the Orange belt kitchen enemies off a White belt floor', () => {
    const white = floorEnemyIds(content, 1);
    expect(white).toContain('floor-keeper');
    expect(white).not.toContain('hearth-cook');
    expect(white).not.toContain('dough-blob');
    expect(floorEnemyIds(content, 3)).toContain('doughling');
  });

  it('uses the tutorial rooms for the tutorial floor, plus any extra room', () => {
    const tut = floorEnemyIds(content, 1, true);
    const tutRooms = content.rooms.filter((r) => r.tutorial);
    for (const room of tutRooms) for (const s of room.enemySpawns) expect(tut).toContain(s.enemy);
    const kitchen = content.rooms.find((r) => r.enemySpawns.some((s) => s.enemy === 'dough-blob'))!;
    expect(floorEnemyIds(content, 1, false, [kitchen])).toContain('doughling');
  });
});
