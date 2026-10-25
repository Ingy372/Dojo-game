// B-POLISH-2: unlock pop 1 → 1.06 → 1, a 3-line sheet description, even cubby side padding.
import { describe, expect, it } from 'vitest';
import { TROPHY_UI, cubbyTextW, unlockPopScales } from '../../../apps/client/src/ui/tokens';

describe('B-POLISH-2 Trophy Case polish', () => {
  it('pops 1 → 1.06 → 1 and never dips below 1', () => {
    expect(unlockPopScales()).toEqual([1, 1.06, 1]);
    expect(Math.min(...unlockPopScales())).toBe(1);
  });
  it('lets the sheet description run 3 lines', () => {
    expect(TROPHY_UI.effectLines).toBe(3);
  });
  it('keeps even side padding inside a 73-wide cubby', () => {
    expect(cubbyTextW(73)).toBe(73 - 2 * TROPHY_UI.cubbyPadX);
    expect(TROPHY_UI.cubbyPadX).toBeGreaterThanOrEqual(8);
  });
});
