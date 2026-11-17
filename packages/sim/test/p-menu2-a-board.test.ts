import { describe, expect, it } from 'vitest';
import { BOARD, cubbySize } from '../../../apps/client/src/ui/tokens';

describe('P-MENU2-a', () => {
  it('cubbies are 96 on a small phone and 112 when four large ones fit', () => {
    expect(cubbySize(330)).toBe(BOARD.cubby.small);
    expect(cubbySize(472)).toBe(BOARD.cubby.large);
    expect(cubbySize(560)).toBe(112);
    expect(BOARD.slot).toEqual({ w: 140, h: 120 });
    expect(BOARD.tile).toBe(72);
  });
});
