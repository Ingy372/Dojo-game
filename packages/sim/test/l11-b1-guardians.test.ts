import { describe, expect, it } from 'vitest';
import { MIN_WINDUP_TICKS } from '../src';
import { testContent } from './load-content';

/** L11-B1 (drafts/planning/L11-SPEC.md section 3): one Guardian per belt 4-10, each met only in its own tier's Guardian room. */
const GUARDIAN_BELT: Record<string, number> = {
  'stone-giant': 4,
  'river-watcher': 5,
  'ember-knight': 6,
  'echo-mask': 7,
  'root-keeper': 8,
  'storm-herald': 9,
  'lost-lightbearer': 10,
};
const HELPER: Record<string, string> = {
  'stone-giant': 'swarmer',
  'river-watcher': 'spark-sprite',
  'ember-knight': 'swarmer',
  'echo-mask': 'swarmer',
  'root-keeper': 'spark-sprite',
  'storm-herald': 'swarmer',
  'lost-lightbearer': 'spark-sprite',
};
const SIZE: Record<string, number> = { 'stone-giant': 1.75, 'lost-lightbearer': 1.75 };

const content = testContent();

describe('L11-B1: the seven belt Guardians', () => {
  for (const [id, belt] of Object.entries(GUARDIAN_BELT)) {
    const d = content.enemies[id];
    it(`${id} is a Guardian built from the Hearth Cook's parts`, () => {
      expect(d.boss).toBe(true);
      expect([d.maxHealth, d.power, d.guard]).toEqual([495, 17, 30]);
      expect(d.attacks.filter((a) => a.counterable !== false)).toHaveLength(2);
      expect(d.attacks.filter((a) => a.counterable === false)).toHaveLength(1);
      expect(d.summon).toEqual({ enemy: HELPER[id], count: 2, atHealthFraction: 0.66 });
      expect(d.scale).toBe(SIZE[id] ?? 1.5);
    });

    it(`${id} gives at least ${MIN_WINDUP_TICKS} ticks of warning on every attack`, () => {
      for (const a of [...d.attacks, ...(d.challenge?.attacks ?? [])]) expect(a.telegraphTicks, a.name).toBeGreaterThanOrEqual(MIN_WINDUP_TICKS);
    });

    it(`${id} appears only in a belt ${belt} Guardian room`, () => {
      for (const r of content.rooms.filter((r) => r.enemySpawns.some((s) => s.enemy === id))) {
        expect(r.kind, r.id).toBe('boss');
        expect(r.minBeltTier, r.id).toBe(belt);
      }
    });
  }
});
