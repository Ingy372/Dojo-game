import { describe, expect, it } from 'vitest';
import { createWorld, ENEMY_TRAINING_SCALE, type EnemyDef } from '../src';
import { testContent } from './load-content';

// R-BAL-12e: an enemy weapon's disarmedPower scales with the belt's enemy Power, then rounds.
const content = testContent();
const bopper = content.enemies.bopper;
const room = Object.values(content.rooms).find((r) => r.enemySpawns.length > 0)!;
const allBopper = (): Record<string, EnemyDef> =>
  Object.fromEntries(Object.keys(content.enemies).map((id) => [id, bopper]));

describe('R-BAL-12e disarmedPower follows the enemy scale', () => {
  it('scales and rounds at every belt, like Power', () => {
    for (const sc of ENEMY_TRAINING_SCALE) {
      const w = createWorld(room, ['p1'], { enemyTypes: allBopper(), enemyScale: sc });
      const def = w.enemies[0].def;
      expect(def.weapon!.disarmedPower).toBe(Math.round(bopper.weapon!.disarmedPower * sc.power));
      expect(def.power).toBe(Math.round(bopper.power * sc.power));
      expect(Number.isInteger(def.weapon!.disarmedPower)).toBe(true);
      // A disarmed push still hits softer than the normal swing.
      expect(def.weapon!.disarmedPower).toBeLessThan(def.power);
    }
  });
  it('is unchanged with no scale, and the content file keeps its base number', () => {
    const w = createWorld(room, ['p1'], { enemyTypes: allBopper() });
    expect(w.enemies[0].def.weapon!.disarmedPower).toBe(bopper.weapon!.disarmedPower);
    expect(bopper.weapon!.disarmedPower).toBe(8);
  });
});
