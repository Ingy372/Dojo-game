import { describe, it, expect } from 'vitest';
import { bossTagLayout, BOSS_TAG } from '../src';

const gapOf = (l: { nameTop: number; barY: number }) => l.barY - BOSS_TAG.barH / 2 - (l.nameTop + BOSS_TAG.nameH);

describe('K31 boss name + small bar layout', () => {
  it('sits above the head with a fixed gap when there is room', () => {
    const l = bossTagLayout(200, 280, 34, 375);
    expect(l.below).toBe(false);
    expect(l.barY + BOSS_TAG.barH / 2).toBeLessThanOrEqual(200);
    expect(gapOf(l)).toBe(BOSS_TAG.gap);
  });
  it('moves both below the boss when the head is near the top, same gap, on screen', () => {
    for (const head of [-40, 0, 20, 40, 55]) {
      const l = bossTagLayout(head, head + 80, 34, 375);
      expect(l.below).toBe(true);
      expect(l.nameTop).toBeGreaterThanOrEqual(head + 80);
      expect(l.nameTop).toBeGreaterThanOrEqual(34);
      expect(gapOf(l)).toBe(BOSS_TAG.gap);
    }
  });
  it('never leaves the screen band, even at the bottom', () => {
    const l = bossTagLayout(10, 370, 34, 375);
    expect(l.barY + BOSS_TAG.barH / 2).toBeLessThanOrEqual(375);
    expect(gapOf(l)).toBe(BOSS_TAG.gap);
  });
});
