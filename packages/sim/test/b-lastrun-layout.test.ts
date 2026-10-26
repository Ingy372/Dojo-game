import { describe, expect, it } from 'vitest';
import { MIN_TAP, S1, S2, lastRunItemsFit, stackTops } from '../../../apps/client/src/ui/tokens';
import { AGAIN_CLEAR, SPARKLE_W, headingSparkle, lastRunLayout, sparkleStars, statStack } from '../../../apps/client/src/ui/lastRun';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const run = src.slice(src.indexOf('private renderRun('), src.indexOf('private turnFound('));

describe('B-LASTRUN Last run layout', () => {
  it('each block top is at or below the previous block bottom', () => {
    const heights = [26, 30, 34, 18, 52, 20, 19, 19];
    const tops = stackTops(10, heights);
    for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThanOrEqual(tops[i - 1] + heights[i - 1]);
    expect(tops[1] - (tops[0] + heights[0])).toBe(S1);
  });

  it('item rows never reach the Personal bests block', () => {
    for (let top = 100; top < 400; top += 7) {
      for (const count of [0, 1, 6, 12]) {
        const bestsTop = 330;
        const fit = lastRunItemsFit(top, bestsTop, 19, count);
        expect(fit).toBeGreaterThanOrEqual(0);
        expect(fit).toBeLessThanOrEqual(count);
        const more = fit < count && top + (fit + 1) * 19 <= bestsTop - S2 ? 1 : 0;
        if (fit > 0) expect(top + fit * 19).toBeLessThanOrEqual(bestsTop - S2);
        if (fit + more > 0) expect(top + (fit + more) * 19).toBeLessThanOrEqual(bestsTop - S2);
      }
    }
  });

  it('places blocks from lastRunLayout (P-MENU2-g), not fixed offsets; bests live in their own sheet', () => {
    expect(run).not.toMatch(/y \+= 22;/);
    expect(run).toMatch(/lastRunLayout\(/);
    expect(run).toMatch(/this\.openBests\(\)/);
    expect(run).not.toMatch(/panelBottom\(h\) - 44/);
  });
});

// Q-PREM-F10: short (47 px) stat tiles at 667x320 / 667x375 keep >= 4 px between number and label,
// and the short New for you card's sparkle sits before its heading (clear of label, icon and heading).
describe('Q-PREM-F10 stat tiles and sparkle do not touch or overlap', () => {
  const homeSrc = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
  // Drawn text heights (system-ui bold, measured in the browser): 14 px -> 17, 12 px -> 15.
  const NUM_H = 17, LAB_H = 15, RIM = 3;
  // Contents heights at the four phone sizes (as in q-prem-f6-again: max(panelH - 20, 277) - 20).
  const sizes = [
    { name: '667x320', cw: 375, ch: 257 },
    { name: '667x375', cw: 359, ch: 257 },
    { name: '844x390', cw: 477, ch: 272 },
    { name: '932x430', cw: 529, ch: 312 },
  ];
  for (const z of sizes) {
    it(`${z.name}: number and label sit inside the rim, ${S1} px apart`, () => {
      const L = lastRunLayout(z.cw, z.ch, 9, 5, 3);
      const h = L.tiles[0].h;
      expect(h).toBeGreaterThanOrEqual(MIN_TAP);
      if (z.name.startsWith('667')) expect(h).toBe(47); // the short tiles QA saw
      if (h >= 56) return; // tall tiles: number at the top, label 8 px inside the rim (room to spare)
      const st = statStack(h, RIM, NUM_H, LAB_H) ?? statStack(h, RIM, LAB_H, LAB_H);
      expect(st).not.toBeNull();
      const numH = statStack(h, RIM, NUM_H, LAB_H) ? NUM_H : LAB_H;
      expect(st!.labY - (st!.numY + numH)).toBeGreaterThanOrEqual(4);
      expect(st!.numY).toBeGreaterThanOrEqual(RIM);
      expect(st!.labY + LAB_H).toBeLessThanOrEqual(h - RIM);
    });
  }
  it('statStack: 47 keeps the 14 px number; 44 still parts them (number may step to 12)', () => {
    expect(statStack(47, RIM, NUM_H, LAB_H)).not.toBeNull();
    const s44 = statStack(44, RIM, NUM_H, LAB_H) ?? statStack(44, RIM, LAB_H, LAB_H)!;
    expect(s44).not.toBeNull();
  });
  it('short card sparkle: SPARKLE_W wide and ends S1 before the heading', () => {
    const head = 300; const x0 = head - S1 - SPARKLE_W;
    const stars = headingSparkle(x0, 50);
    const right = Math.max(...stars.map(([x, , r]) => x + r)); const left = Math.min(...stars.map(([x, , r]) => x - r));
    expect(left).toBe(x0);
    expect(right).toBe(x0 + SPARKLE_W);
    expect(head - right).toBe(S1);
    // the tall card keeps its three corner stars
    expect(sparkleStars(120, 96)).toHaveLength(3);
  });
  it('HomeScene uses them, and F8 still keeps 12 px above Again!', () => {
    expect(homeSrc).toMatch(/statStack\(b\.h, r, num\.height, lab\.height\)/);
    expect(homeSrc).toMatch(/headingSparkle\(sx0/);
    expect(homeSrc).toMatch(/const sx0 = head\.x - S1 - SPARKLE_W/);
    expect(homeSrc).not.toMatch(/\[-nc\.w \/ 2 \+ 8, nc\.h \/ 2 - 9, 3\]\]\.forEach/);
    expect(AGAIN_CLEAR).toBe(12);
  });
});
