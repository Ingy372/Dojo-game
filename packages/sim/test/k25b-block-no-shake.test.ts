import { describe, expect, it } from 'vitest';
import { eventShakeScale, hurtShakeScale } from '../src/config';

// K25b (Manager's call): a Block is a success moment and never shakes the screen.
const cases = [
  { beltTier: 1, difficulty: 'standard' as const, reducedMotion: false },
  { beltTier: 10, difficulty: 'standard' as const, reducedMotion: false },
  { beltTier: 1, difficulty: 'challenge' as const, reducedMotion: false },
  { beltTier: 8, difficulty: 'challenge' as const, reducedMotion: false },
];

describe('K25b block never shakes', () => {
  it('gives 0 shake for a Block at every belt and difficulty', () => {
    for (const c of cases) expect(eventShakeScale('block', c)).toBe(0);
  });
  it('leaves being hit as K25 set it', () => {
    for (const c of cases) expect(eventShakeScale('hurt', c)).toBe(hurtShakeScale(c));
    expect(eventShakeScale('hurt', cases[1])).toBeGreaterThan(0);
  });
});
