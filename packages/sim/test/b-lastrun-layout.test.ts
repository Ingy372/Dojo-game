import { describe, expect, it } from 'vitest';
import { S1, S2, lastRunItemsFit, stackTops } from '../../../apps/client/src/ui/tokens';

const src = Object.values(import.meta.glob(['../../../apps/client/src/scenes/HomeScene.ts'], { query: '?raw', import: 'default', eager: true }))[0] as string;
const run = src.slice(src.indexOf('private renderRun('), src.indexOf('private bestsRows('));

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

  it('stacks by measured height, not fixed offsets, and bests are not pinned over content', () => {
    expect(run).not.toMatch(/y \+= 22;/);
    expect(run).toMatch(/Math\.max\(y, bottom - this\.bestsHeight\(w\)\)/);
    expect(run).not.toMatch(/panelBottom\(h\) - 44/);
  });
});
