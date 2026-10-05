import { describe, expect, it } from 'vitest';
import { TICKS_PER_SECOND, secondsToTicks } from '../src';

describe('tick config', () => {
  it('runs at 20 ticks per second', () => {
    expect(TICKS_PER_SECOND).toBe(20);
    expect(secondsToTicks(1)).toBe(20);
    expect(secondsToTicks(0.3)).toBe(6);
  });
});
