// B-POLISH-2: unlock pop 1 → 1.06 → 1, a 3-line sheet description, even cubby side padding.
import { describe, expect, it } from 'vitest';
import { TROPHY_UI, cubbyIconSize, cubbyTextW, unlockPopScales } from '../../../apps/client/src/ui/tokens';

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

describe('B-POLISH-2 cubby label room', () => {
  it('keeps the full icon when the label is short, and shrinks it (not below iconMin) for 3 lines', () => {
    expect(cubbyIconSize(73, 13)).toBe(Math.round(73 * 0.42));
    const three = 3 * 13 - 2; // 3 lines of 12 px text, lineGap -1
    const icon = cubbyIconSize(73, three);
    expect(icon).toBeGreaterThanOrEqual(TROPHY_UI.iconMin);
    expect(TROPHY_UI.cubbyTop + icon + TROPHY_UI.cubbyGap + three + TROPHY_UI.cubbyBottom).toBeLessThanOrEqual(73);
    expect(TROPHY_UI.cubbyLines).toBe(3);
  });
});
