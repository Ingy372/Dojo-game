// Star Wall (Jay, Nov 20): the throwing star game's scoring and timing.
import { describe, expect, it } from 'vitest';
import { STAR_WALL, createRng, hitScore, litTicksAt, pickTargets, streakMultiplier } from '../src';

describe('Star Wall', () => {
  it('targets stay lit for less time as the round goes on', () => {
    expect(litTicksAt(0)).toBe(STAR_WALL.litStartTicks);
    expect(litTicksAt(STAR_WALL.roundTicks)).toBe(STAR_WALL.litEndTicks);
    expect(litTicksAt(300)).toBeLessThan(litTicksAt(100));
  });

  it('quick hits score more, gold scores most, and a streak multiplies', () => {
    expect(hitScore(0, 30, 1, false)).toBe(STAR_WALL.hitPoints + STAR_WALL.quickBonus);
    expect(hitScore(30, 30, 1, false)).toBe(STAR_WALL.hitPoints);
    expect(hitScore(10, 30, 1, true)).toBe(STAR_WALL.goldPoints);
    expect(streakMultiplier(1)).toBe(1);
    expect(streakMultiplier(4)).toBe(2);
    expect(streakMultiplier(100)).toBe(STAR_WALL.streakMax);
    expect(hitScore(30, 30, 4, false)).toBe(STAR_WALL.hitPoints * 2);
  });

  it('lights one target early, sometimes two later, never one that is already lit', () => {
    const rng = createRng(7);
    for (let i = 0; i < 50; i++) expect(pickTargets(rng, 0, [])).toHaveLength(1);
    let doubles = 0;
    for (let i = 0; i < 200; i++) {
      const p = pickTargets(rng, 400, [3]);
      if (p.length === 2) doubles++;
      expect(p.some((t) => t.index === 3)).toBe(false);
      expect(new Set(p.map((t) => t.index)).size).toBe(p.length);
      for (const t of p) expect(t.index).toBeLessThan(STAR_WALL.rows * STAR_WALL.cols);
    }
    expect(doubles).toBeGreaterThan(20);
  });
});
