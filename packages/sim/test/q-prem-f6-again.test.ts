import { describe, expect, it } from 'vitest';
import { AGAIN_CLEAR, lastRunLayout, pinnedAgain } from '../../../apps/client/src/ui/lastRun';
import { MIN_TAP, S1, S2 } from '../../../apps/client/src/ui/tokens';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;

// HomeScene (Q-PREM-F6, Q-PREM-F8): pad = 8 under LEFT_FULL_H tall (else 16), panel top = pad + 46, panelH = height - top - pad,
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
        // The scroll window ends AGAIN_CLEAR above Again!, and scrolling all the way shows the last row there.
        expect(pin.footer).toBe(16 + pin.again.h + AGAIN_CLEAR);
        // The window's bottom (visible + 16 - footer) is AGAIN_CLEAR above Again!'s top.
        expect(visible + 16 - pin.footer).toBe(pin.again.y - AGAIN_CLEAR);
        // Scrolled all the way, the last row ends 16 above the window's bottom, as before.
        expect(ch - pin.scrollMax).toBe(visible + 16 - pin.footer - 16);
      } else {
        expect(pin.footer).toBe(0);
        expect(pin.scrollMax).toBe(0);
        expect(pin.again).toEqual(L.again);
      }
    });

    it(`${z.name}: Q-PREM-F8 nothing tappable sits within 8 px above Again!, scrolled or not`, () => {
      const panelH = z.height - (z.pad + 46) - z.pad;
      const inner = panelH - 20;
      const ch = Math.max(inner, 277) - ROD;
      const visible = inner - ROD;
      const L = lastRunLayout(z.cw, ch, 9, 5, 3);
      const pin = pinnedAgain(L.again, ch, visible, 16);
      const a = pin.again;
      // Every tappable box in the contents (chips row and bar aren't taps): banner, bests, tiles, found, New for you.
      const taps = [L.banner, L.bests, ...L.tiles, L.found, L.newCard];
      const over = (b: { x: number; w: number }) => b.x < a.x + a.w && b.x + b.w > a.x;
      if (ch > visible) {
        // Scrolled to any y, taps are clipped to the window, whose bottom is at least 8 above Again!.
        const winBottom = visible + 16 - pin.footer;
        expect(a.y - winBottom).toBeGreaterThanOrEqual(8);
        expect(AGAIN_CLEAR).toBeGreaterThan(8);
      } else {
        for (const b of taps.filter(over)) {
          if (b.y >= a.y + a.h) continue;
          expect(a.y - (b.y + b.h), JSON.stringify(b)).toBeGreaterThanOrEqual(8);
        }
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

// Q-PREMIUM-2 H2: on the short 667x320 phone the loot comes first, so Found and New for you show without scrolling.
describe('Q-PREMIUM-2 H2 loot first when only part of the contents show', () => {
  const ch = 257;
  const visible = 320 - 54 - 8 - 20 - ROD;
  it('667x320: Found and New for you sit right under the banner, above the chips', () => {
    const L = lastRunLayout(375, ch, 9, 5, 3, visible);
    expect(L.foundLabelY).toBe(MIN_TAP + S1);
    expect(L.newLabelY).toBe(L.foundLabelY);
    expect(L.found.y).toBeLessThan(L.chipsY);
    expect(L.newCard.y).toBeLessThan(L.chipsY);
    // inside the part that shows before any scrolling (window ends AGAIN footer above the bottom)
    const pin = pinnedAgain(L.again, ch, visible, 16);
    expect(L.found.y + L.found.h).toBeLessThanOrEqual(visible - pin.footer);
    expect(L.newCard.y + L.newCard.h).toBeLessThanOrEqual(visible - pin.footer);
  });
  it('everything still fits the contents, taps >= 44, Always keeps a row, nothing tappable near Again!', () => {
    for (const found of [0, 3, 30]) {
      const L = lastRunLayout(375, ch, 9, 5, found, visible);
      for (const b of [L.banner, L.bests, ...L.tiles, L.bar, L.found, L.newCard, L.again]) expect(b.y + b.h).toBeLessThanOrEqual(ch + 0.01);
      for (const b of [L.bests, L.newCard, L.again]) expect(Math.min(b.w, b.h)).toBeGreaterThanOrEqual(MIN_TAP);
      expect(L.found.h).toBeGreaterThanOrEqual(MIN_TAP);
      expect(L.perAlways).toBeGreaterThan(0);
      expect(L.alwaysY + L.alwaysIcon).toBeLessThanOrEqual(ch);
      expect(L.found.x + L.found.w).toBeLessThan(L.newCard.x);
      expect(L.newCard.y + L.newCard.h + AGAIN_CLEAR).toBeLessThanOrEqual(L.again.y);
    }
  });
  it('a phone with room (the whole contents show) keeps the old order', () => {
    const L = lastRunLayout(359, ch, 9, 5, 3, ch);
    expect(L.found.y).toBeGreaterThan(L.bar.y);
  });
  it('the Board passes the visible height to the layout', () => {
    expect(src).toMatch(/lastRunLayout\(cw, ch, m\.chips\.length, m\.stats\.length, m\.found\.length, visibleH - 2 \* \(6 \+ S1\)\)/);
  });
});

describe('Q-PREMIUM-2 H2 / M6 short-phone Trophy Case and kata icons', () => {
  it('a short one-row Trophy Case slims the ribbon so cubbies reach the two-line width', async () => {
    const { trophyLayout, CUBBY_ONE_ROW } = await import('../../../apps/client/src/ui/trophyCase');
    const L = trophyLayout(359, 186);
    expect(L.rowsPerPage).toBe(1);
    expect(L.cubby).toBeGreaterThanOrEqual(CUBBY_ONE_ROW);
    expect(L.ribbonH).toBeLessThan(40);
    const tall = trophyLayout(529, 300);
    expect(tall.ribbonH + tall.rowsPerPage * tall.rowH + tall.pagerH).toBeLessThanOrEqual(300);
  });
  it('a trophy with no icon art draws a placeholder star, in the cubby and on New for you', () => {
    expect(src).toMatch(/function placeholderIcon\(/);
    expect(src).toMatch(/icon \?\? placeholderIcon\(this, ix, iy, is, true\)/);
    expect(src).toMatch(/else v\.add\(placeholderIcon\(this, 0, iy, iconS, c\.earned\)\)/);
  });
});
