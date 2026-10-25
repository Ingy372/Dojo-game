import { describe, expect, it } from 'vitest';
import { LOOT } from '../src/config';

// R-BAL-4 (drafts/planning/balance-research.md): the bad-luck counter must promise a rare
// by run 5 at the latest. Raising guaranteedRareOnRun above 5 breaks that promise.
describe('R-BAL-4 bad-luck counter', () => {
  it('guarantees a rare on run 5 or sooner', () => {
    expect(Number.isInteger(LOOT.guaranteedRareOnRun)).toBe(true);
    expect(LOOT.guaranteedRareOnRun).toBeGreaterThanOrEqual(1);
    expect(LOOT.guaranteedRareOnRun).toBeLessThanOrEqual(5);
  });
});
