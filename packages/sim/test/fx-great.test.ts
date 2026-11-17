import { describe, expect, it } from 'vitest';
import { CUE_COLORS, RATING, ratingWordTop } from '../../../apps/client/src/ui/ratingWord';

const hue = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

describe('FX-GREAT rating words', () => {
  it('are never the "!" cue colour: at least 90 degrees of hue away from gold and red', () => {
    for (const cue of CUE_COLORS)
      for (const c of [RATING.color, RATING.bright]) {
        const gap = Math.abs(hue(c) - hue(cue));
        expect(Math.min(gap, 360 - gap)).toBeGreaterThanOrEqual(90);
      }
  });

  it('are smaller and see-through but still readable', () => {
    expect(RATING.great).toBeLessThan(54);
    expect(RATING.alpha).toBeGreaterThanOrEqual(0.7);
    expect(RATING.alpha).toBeLessThan(1);
  });

  const word = { x0: 280, x1: 380, h: 40 };
  it('stays at its spot when nothing is in the way', () => {
    expect(ratingWordTop(100, word, 20, [{ x0: 0, x1: 100, y0: 90, y1: 150 }], 4, 371)).toBe(100);
  });

  it('moves off an enemy or "!" box, to the nearest clear spot, drift included', () => {
    const enemy = { x0: 300, x1: 360, y0: 110, y1: 170 };
    const top = ratingWordTop(100, word, 20, [enemy], 4, 371);
    expect(top + word.h < enemy.y0 || top - 20 > enemy.y1).toBe(true);
    expect(top).toBe(enemy.y0 - 6 - word.h);
  });

  it('keeps on screen, and stays put when no spot is clear', () => {
    const wall = { x0: 0, x1: 667, y0: 0, y1: 375 };
    expect(ratingWordTop(100, word, 20, [wall], 4, 371)).toBe(100);
    const top = ratingWordTop(20, word, 20, [{ x0: 300, x1: 360, y0: 10, y1: 80 }], 4, 371);
    expect(top - 20).toBeGreaterThanOrEqual(4);
  });
});
