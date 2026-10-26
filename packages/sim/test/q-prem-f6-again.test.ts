import { describe, expect, it } from 'vitest';
import { lastRunLayout, pinnedAgain } from '../../../apps/client/src/ui/lastRun';
import { MIN_TAP, S1, S2 } from '../../../apps/client/src/ui/tokens';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;

// HomeScene: pad = 8 under LEFT_FULL_H tall (else 16), panel top = pad + 46, panelH = height - top - pad,
// the scroll window is panelH - 20, Last run contents get at least PANEL_FULL_H (277), and the scroll
// sits inside 6 + S1 of rod on each end. Panel widths from the shots (rw - 24 - 2 * S2).
const SIZES = [
  { name: '667x320', height: 320, pad: 8, cw: 375 },
  { name: '667x375', height: 375, pad: 16, cw: 359 },
  { name: '844x390', height: 390, pad: 16, cw: 477 },
  { name: '932x430', height: 430, pad: 16, cw: 529 },
];
const ROD = 2 * (6 + S1);

describe('Q-PREM-F6 Again! is never cut off on the Last run panel', () => {
  for (const z of SIZES) {
    it(`${z.name}: Again! sits fully inside the visible panel, with the scroll window above it`, () => {
      const panelH = z.height - (z.pad + 46) - z.pad;
      const inner = panelH - 20;
      const h = Math.max(inner, 277);
      const ch = h - ROD;
      const visible = inner - ROD;
      const L = lastRunLayout(z.cw, ch, 9, 5, 3);
      // The scroll window's bottom is 16 below the visible contents' bottom (HomeScene: panel - 4 vs rods).
      const pin = pinnedAgain(L.again, ch, visible, 16);
      // Fully visible: top at or below 0, bottom at or above the visible bottom.
      expect(pin.again.y).toBeGreaterThanOrEqual(0);
      expect(pin.again.y + pin.again.h).toBeLessThanOrEqual(visible);
      expect(pin.again.h).toBeGreaterThanOrEqual(MIN_TAP);
      expect(pin.again.w).toBeGreaterThanOrEqual(MIN_TAP);
      // At least 8 from the panel's right edge (contents start S2 inside the scroll).
      expect(z.cw - (pin.again.x + pin.again.w)).toBeGreaterThanOrEqual(0);
      if (ch > visible) {
        // The scroll window ends S1 above Again!, and scrolling all the way shows the last row there.
        expect(pin.footer).toBe(16 + pin.again.h + S1);
        // The window's bottom (visible + 16 - footer) is S1 above Again!'s top.
        expect(visible + 16 - pin.footer).toBe(pin.again.y - S1);
        // Scrolled all the way, the last row ends 16 above the window's bottom, as before.
        expect(ch - pin.scrollMax).toBe(visible + 16 - pin.footer - 16);
      } else {
        expect(pin.footer).toBe(0);
        expect(pin.scrollMax).toBe(0);
        expect(pin.again).toEqual(L.again);
      }
    });
  }

  it('667x320 is the short one: the contents scroll and Again! stays put', () => {
    const visible = 320 - 54 - 8 - 20 - ROD;
    const ch = 277 - ROD;
    expect(pinnedAgain(lastRunLayout(375, ch, 9, 5, 3).again, ch, visible, 16).scrollMax).toBeGreaterThan(0);
    expect(S2).toBe(8);
  });

  it('HomeScene draws Again! on the panel (not the scrolling contents) and passes the footer to the scroll', () => {
    expect(src).toMatch(/pinnedAgain\(L\.again, ch, visibleH - 2 \* \(6 \+ S1\), /);
    expect(src).toMatch(/onTap: \(\) => this\.enterTower\(\) \}, this\.panel \?\? this\.ui\)/);
    expect(src).toMatch(/makePanelScroll\(content, h > inner \? h - inner \+ this\.runFooter : 0, this\.runFooter\)/);
  });
});
