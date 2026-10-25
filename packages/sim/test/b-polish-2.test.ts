// B-POLISH-2: unlock pop 1 → 1.06 → 1, a 3-line sheet description, cubby label padding and fit.
import { describe, expect, it } from 'vitest';
import { TROPHY_UI, cubbyIconSize, cubbyLabelRoom, cubbyTextW, unlockPopScales } from '../../../apps/client/src/ui/tokens';

// Cubby sizes the Trophy Case uses at 667, 844 and 932 wide.
const SIZES = [73, 93, 96];
// 3 lines of 12 px text: ~13 px per line in the client font, less the (negative) line gap.
const threeLines = 3 * 13 + 2 * TROPHY_UI.cubbyLineGap;

describe('B-POLISH-2 Trophy Case polish', () => {
  it('pops 1 → 1.06 → 1 and never dips below 1', () => {
    expect(unlockPopScales()).toEqual([1, 1.06, 1]);
    expect(Math.min(...unlockPopScales())).toBe(1);
  });
  it('lets the sheet description run 3 lines', () => {
    expect(TROPHY_UI.effectLines).toBe(3);
  });
  it('keeps 8 px clear inside the 2 px stroke on each side', () => {
    for (const s of SIZES) expect((s - TROPHY_UI.stroke - cubbyTextW(s)) / 2).toBeGreaterThanOrEqual(8);
  });
  it('fits a 3-line label under a full-size icon, inside the bottom stroke', () => {
    for (const s of SIZES) expect(cubbyLabelRoom(s)).toBeGreaterThanOrEqual(threeLines);
  });
  it('uses one full-size icon for every cubby (31 px at 73)', () => {
    expect(cubbyIconSize(73)).toBe(31);
    expect(new Set(SIZES.map((s) => cubbyIconSize(s) / s >= 0.41)).size).toBe(1);
  });
});
