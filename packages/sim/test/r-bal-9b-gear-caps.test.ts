import { describe, expect, it } from 'vitest';
import { GEAR_CAPS, gearCapsForTier, RARITIES } from '../src/config';
import { makeItem } from '../src/loot';
import { maxGearScore } from '../src/power';
import { createRng } from '../src/rng';
import { testContent } from './load-content';

// R-BAL-9b (#188, Manager's call): per-tier gear caps; white cut to 1 / 10 / 3 / 4%.
describe('R-BAL-9b gear caps', () => {
  it('has #188 caps for white and black', () => {
    expect(GEAR_CAPS.white).toEqual({ power: 1, maxHealth: 10, guard: 3, powerScale: 0.04 });
    expect(gearCapsForTier(10)).toEqual(GEAR_CAPS.black);
    expect(gearCapsForTier(14)).toEqual(GEAR_CAPS.black);
  });
  it('caps grow every tier, and the best gear score grows with them', () => {
    for (let t = 2; t <= 10; t++) {
      const a = gearCapsForTier(t - 1), b = gearCapsForTier(t);
      for (const k of ['power', 'maxHealth', 'guard', 'powerScale'] as const) expect(b[k]).toBeGreaterThanOrEqual(a[k]);
      expect(maxGearScore(t)).toBeGreaterThan(maxGearScore(t - 1));
    }
  });
  it('white drops never pass the white caps', () => {
    const loot = testContent().loot;
    const rng = createRng(7);
    for (let n = 0; n < 400; n++) {
      const it = makeItem(rng, loot, RARITIES[n % 4], `u${n}`);
      expect(it.stats.power).toBeLessThanOrEqual(1);
      expect(it.stats.maxHealth).toBeLessThanOrEqual(10);
      expect(it.stats.guard).toBeLessThanOrEqual(3);
      if (it.effect?.type === 'powerScale') expect(it.effect.amount).toBeLessThanOrEqual(0.04);
    }
  });
});
