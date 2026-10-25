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
    hurtShakeScale({ kind: 'hurt', beltTier, difficulty, reducedMotion });
  it('is off below rank 8 (Brown in the standard order) and on from it, whatever the ids are', () => {
    expect(s(7)).toBe(0);
    expect(s(8)).toBeCloseTo(0.65);
    expect(s(12)).toBeCloseTo(0.65);
  });
  it('a Block never shakes, at every rank, difficulty and motion setting (K25b)', () => {
    for (let beltTier = 1; beltTier <= 12; beltTier++)
      for (const difficulty of ['guided', 'standard', 'challenge'] as const)
        for (const reducedMotion of [false, true]) expect(hurtShakeScale({ kind: 'block', beltTier, difficulty, reducedMotion })).toBe(0);
  });
  it('a named wind-up follows the same rule as being hit', () => {
    for (let beltTier = 1; beltTier <= 12; beltTier++)
      for (const difficulty of ['guided', 'standard', 'challenge'] as const)
        for (const reducedMotion of [false, true])
          expect(hurtShakeScale({ kind: 'windup', beltTier, difficulty, reducedMotion })).toBe(hurtShakeScale({ kind: 'hurt', beltTier, difficulty, reducedMotion }));
  });
  it('is on at any rank on Challenge, and never with Reduced motion', () => {
    expect(s(1, 'challenge')).toBeCloseTo(0.65);
    expect(s(10, 'challenge', true)).toBe(0);
  });
});
