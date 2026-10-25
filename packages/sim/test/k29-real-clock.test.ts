import { describe, expect, it } from 'vitest';
import { realClock, realSecondsToTicks, ticksToRealMs, TICKS_PER_SECOND } from '../src';

describe('K29: end-of-run clock reads real seconds', () => {
  it('1200 ticks (60 s of game time) is about 68 real seconds at tempo 0.88', () => {
    expect(ticksToRealMs(1200) / 1000).toBeCloseTo(68.18, 1);
    expect(realClock(1200)).toBe('1:08');
  });
  it('the ticks in 60 real seconds show as 1:00 (same conversion as the Challenge timer)', () => {
    expect(realClock(realSecondsToTicks(60))).toBe('1:00');
  });
  it('is never shorter than the game-time clock', () => {
    for (const t of [0, 19, 20, 600, 1199, 1200, 5000]) expect(ticksToRealMs(t)).toBeGreaterThanOrEqual((t / TICKS_PER_SECOND) * 1000);
  });
});
