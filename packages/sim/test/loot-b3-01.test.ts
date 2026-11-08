import { describe, expect, it } from 'vitest';
import { startRun, updateRun, type WorldState } from '../src';
import { testContent } from './load-content';

const content = testContent();
const table = content.loot.enemyDropChance;

const EMBER = { 'spark-sprite': 0.025, doughling: 0.02, 'dough-blob': 0.07, 'ladle-lobber': 0.07, 'rolling-pin': 0.07, brute: 0.15 } as const;

/** Defeats one enemy of this kind in a fresh belt-3 run and returns how many enemy-source gear drops came out. */
function drops(enemyId: string, seed: number): number {
  const run = startRun(content, { seed, dryRuns: 0, tier: 3 });
  const fake = {
    events: [{ kind: 'playerAttack', playerId: 'p1', enemyId: 'e1', move: 'basic', damage: 5, defeated: true }],
    players: { p1: { health: 100, pos: { x: 1, y: 1 } } },
    progress: { bestCombo: 0 },
    enemies: [{ id: 'e1', def: content.enemies[enemyId], pos: { x: 2, y: 2 }, elite: null }],
  } as unknown as WorldState;
  return updateRun(content, run, fake).filter((ev) => ev.kind === 'loot' && ev.source === 'enemy').length;
}

describe('LOOT-B3-01: Ember Kitchens drops are live', () => {
  it('the five new keys load with the #431 chances, and the live four are unchanged', () => {
    for (const [id, p] of Object.entries(EMBER)) expect(table[id], id).toBe(p);
    expect(table).toMatchObject({ swarmer: 0.035, shield: 0.1, bopper: 0.1 });
    expect(Object.keys(table).sort()).toEqual(['bopper', 'brute', 'dough-blob', 'doughling', 'ladle-lobber', 'rolling-pin', 'shield', 'spark-sprite', 'swarmer']);
  });

  it('every key is a real enemy, and the two Guardians have no entry', () => {
    for (const id of Object.keys(table)) expect(content.enemies[id], id).toBeDefined();
    expect(table['floor-keeper']).toBeUndefined();
    expect(table['hearth-cook']).toBeUndefined();
  });

  it('every non-boss enemy in the Ember Kitchens rooms has a chance', () => {
    const ember = content.rooms.filter((r) => r.floorSet === 'ember-kitchens');
    expect(ember.length).toBeGreaterThan(0);
    for (const room of ember) {
      for (const s of room.enemySpawns) {
        const def = content.enemies[s.enemy];
        if (!def.boss) expect(table[s.enemy], `${room.id}: ${s.enemy}`).toBeGreaterThan(0);
        if (def.split) expect(table[def.split.into], `${room.id}: ${s.enemy} splits into ${def.split.into}`).toBeGreaterThan(0);
      }
    }
  });

  it.each(Object.entries(EMBER))('%s really drops gear, at about its chance', (id, p) => {
    const N = 6000;
    let got = 0;
    for (let seed = 1; seed <= N; seed++) got += drops(id, seed) > 0 ? 1 : 0;
    const sigma = Math.sqrt((p * (1 - p)) / N);
    expect(got).toBeGreaterThan(0);
    expect(Math.abs(got / N - p)).toBeLessThan(4 * sigma);
  });

  it('a Guardian never drops gear from the kill itself', () => {
    for (let seed = 1; seed <= 300; seed++) {
      expect(drops('hearth-cook', seed)).toBe(0);
      expect(drops('floor-keeper', seed)).toBe(0);
    }
  });
});
