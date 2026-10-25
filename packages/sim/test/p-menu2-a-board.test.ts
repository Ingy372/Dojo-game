import { describe, expect, it } from 'vitest';
import { BOARD, MIN_TAP, abilitiesSwitch, cubbySize, tapArea } from '../../../apps/client/src/ui/tokens';

describe('P-MENU2-a', () => {
  it('the Abilities switch has two equal segments, 44 tall, at most 120 wide, that fit the panel', () => {
    // Panel widths from 667x375 (about 330) to 932x430 (about 560), plus a narrow edge case.
    for (const w of [300, 330, 400, 560]) {
      const s = abilitiesSwitch(w);
      expect(s.h).toBe(MIN_TAP);
      expect(s.segW).toBeLessThanOrEqual(BOARD.switchW);
      expect(s.x0).toBeGreaterThanOrEqual(0);
      expect(s.x0 + s.segW * 2 + s.gap).toBeLessThanOrEqual(w);
      const tap = tapArea(s.segW, s.h);
      expect(tap.w).toBeGreaterThanOrEqual(MIN_TAP);
      expect(tap.h).toBeGreaterThanOrEqual(MIN_TAP);
    }
    expect(abilitiesSwitch(560).segW).toBe(120);
  });

  it('cubbies are 96 on a small phone and 112 when four large ones fit', () => {
    expect(cubbySize(330)).toBe(BOARD.cubby.small);
    expect(cubbySize(472)).toBe(BOARD.cubby.large);
    expect(cubbySize(560)).toBe(112);
    expect(BOARD.slot).toEqual({ w: 140, h: 120 });
    expect(BOARD.tile).toBe(72);
  });
});
