import { describe, expect, it } from 'vitest';
import { eventShakeScale, hurtShakeScale } from '../src/config';

// K25b (Manager's call): a Block is a success moment and never shakes the screen.
const beltIds = ['white', 'yellow', 'brown', 'black'];
const cases = [
  { beltIds, beltId: 'white', difficulty: 'standard' as const, reducedMotion: false },
  { beltIds, beltId: 'black', difficulty: 'standard' as const, reducedMotion: false },
  { beltIds, beltId: 'white', difficulty: 'challenge' as const, reducedMotion: false },
  { beltIds, beltId: 'brown', difficulty: 'challenge' as const, reducedMotion: false },
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
