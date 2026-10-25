import { describe, expect, it } from 'vitest';
import { TEMPO, TICKS_PER_SECOND, hurtShakeScale, realSecondsToTicks, realTicksPerSecond, ticksToRealMs } from '../src/config';

describe('K28 real-time conversion', () => {
  it('a wind-up of N ticks lasts N real ticks on screen (slower than the rules tick)', () => {
    expect(ticksToRealMs(TICKS_PER_SECOND)).toBeCloseTo(1000 / TEMPO.speed);
    expect(ticksToRealMs(20)).toBeGreaterThan(1000);
  });
  it('a 60 second Challenge is 60 real seconds', () => {
    const ticks = realSecondsToTicks(60);
    expect(ticksToRealMs(ticks) / 1000).toBeCloseTo(60, 1);
    expect(ticks).toBeLessThan(60 * TICKS_PER_SECOND);
    expect(Math.floor(ticks / realTicksPerSecond())).toBe(60);
  });
});

describe('K28 shake rule by belt rank, not belt id', () => {
  const s = (beltTier: number, difficulty: 'guided' | 'standard' | 'challenge' = 'standard', reducedMotion = false) =>
    hurtShakeScale({ beltTier, difficulty, reducedMotion });
  it('is off below rank 8 (Brown in the standard order) and on from it, whatever the ids are', () => {
    expect(s(7)).toBe(0);
    expect(s(8)).toBeCloseTo(0.65);
    expect(s(12)).toBeCloseTo(0.65);
  });
  it('is on at any rank on Challenge, and never with Reduced motion', () => {
    expect(s(1, 'challenge')).toBeCloseTo(0.65);
    expect(s(10, 'challenge', true)).toBe(0);
  });
});
