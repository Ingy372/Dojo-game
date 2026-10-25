// B-POLISH-2: unlock pop 1 → 1.06 → 1, a 3-line sheet description, cubby label padding and fit.
import { describe, expect, it } from 'vitest';
import { styleLayout } from '../../../apps/client/src/ui/fightingStyle';
import { TROPHY_UI, cubbyIconSize, cubbyLabelRoom, cubbyTextW, unlockPopScales } from '../../../apps/client/src/ui/tokens';

// Cubby sizes the Trophy Case uses at 667, 844 and 932 wide.
const SIZES = [73, 93, 96];
// 3 lines of 12 px text: Phaser's measured box is ~15 px per line in the client font (42 px for
// 3 lines at a -2 gap, measured at 844), less the (negative) line gap, plus 1 px to spare.
const threeLines = 3 * 15 + 2 * TROPHY_UI.cubbyLineGap + 1;

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
  it('gives Fighting Style tray labels the same 8 px padding and wrap rules', () => {
    // Panel widths at 667, 844, 932, and the widest tray word ("Beginner's", 67 px bold 12 px, measured).
    const min = 67 + 2 * TROPHY_UI.cubbyPadX + TROPHY_UI.stroke;
    for (const [w, h] of [[343, 300], [472, 310], [560, 350]]) {
      const L = styleLayout(w, h, min);
      expect((L.tileW - TROPHY_UI.stroke - cubbyTextW(L.tileW)) / 2).toBeGreaterThanOrEqual(8);
      expect(cubbyTextW(L.tileW)).toBeGreaterThanOrEqual(67);
    }
    const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
    expect(src).toMatch(/labelWrap: cubbyTextW\(L\.tileW\)/);
    expect(src).toMatch(/wrapLikeCubby\(tile, p\.name, cubbyTextW\(L\.tileW\)\)/);
  });
});
