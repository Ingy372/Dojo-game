// Q-P4 QA: every Sensei line sits at max(senseiTop, topBarBottom + 6), never over the top bar.
import { describe, expect, it } from 'vitest';
import { senseiFloorY, senseiHomeY } from '../../../apps/client/src/ui/senseiPlace';

describe('Q-P4 QA: Sensei placement floor', () => {
  it('a banner asked for y=8 drops under a 35 px top bar', () => {
    expect(senseiFloorY(35)).toBe(41);
    expect(senseiHomeY(8, 35)).toBe(41);
  });
  it('a lower home stays where it was', () => {
    expect(senseiHomeY(120, 35)).toBe(120);
  });
});
