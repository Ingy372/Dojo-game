import { describe, expect, it } from 'vitest';
import { PROGRESSION } from '../src/config';
import { tierXp, xpToNext } from '../src/progression';
type FeedBelt = Parameters<typeof tierXp>[0];

// R-BAL-5 (D3): level steps weighted step + 11, matching drafts/planning/balance-sim.py section 3.
const belt = { typicalMonthsInRank: 3 } as FeedBelt;
const belts = [belt, belt, belt];

describe('R-BAL-5 softened XP steps', () => {
  const steps = Array.from({ length: 10 }, (_, i) => xpToNext(PROGRESSION.levelsPerTier + i, belts));
  it('matches the balance sim for a 3-month tier', () => {
    expect(tierXp(belt)).toBe(8613);
    expect(steps).toEqual([626, 679, 731, 783, 835, 887, 940, 992, 1044, 1096]);
  });
  it('keeps every step at 10 typical runs or fewer', () => {
    for (const s of steps) expect(s / PROGRESSION.typicalRunXp).toBeLessThanOrEqual(10.05);
  });
  it('leaves the tier total unchanged (within rounding)', () => {
    expect(Math.abs(steps.reduce((a, b) => a + b, 0) - tierXp(belt))).toBeLessThanOrEqual(10);
  });
});
