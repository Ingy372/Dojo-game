import { describe, expect, it } from 'vitest';
import brute from '../../../content/enemies/brute.json';
import bopper from '../../../content/enemies/bopper.json';
import floorKeeper from '../../../content/enemies/floor-keeper.json';
import shield from '../../../content/enemies/shield.json';
import swarmer from '../../../content/enemies/swarmer.json';
import { DIFFICULTY, TEMPO, TICKS_PER_SECOND, hurtShakeScale, realMsPerTick, type Difficulty } from '../src/config';
import { telegraphTicks } from '../src/world';

const OLD_MS_PER_TICK = 1000 / TICKS_PER_SECOND;
const attacks: Array<{ enemy: string; attack: { telegraphTicks: number } }> = [];
const walk = (enemy: string, o: unknown): void => {
  if (Array.isArray(o)) o.forEach((x) => walk(enemy, x));
  else if (o && typeof o === 'object') {
    if (typeof (o as { telegraphTicks?: unknown }).telegraphTicks === 'number') attacks.push({ enemy, attack: o as { telegraphTicks: number } });
    Object.values(o).forEach((x) => walk(enemy, x));
  }
};
for (const [n, e] of Object.entries({ brute, bopper, floorKeeper, shield, swarmer })) walk(n, e);
const BELTS = ['white', 'yellow', 'orange', 'green', 'blue', 'red', 'red-black', 'brown', 'brown-black', 'black'];

describe('K25 tempo', () => {
  it('is about 12% slower (10–15%)', () => {
    expect(1 - TEMPO.speed).toBeGreaterThanOrEqual(0.1);
    expect(1 - TEMPO.speed).toBeLessThanOrEqual(0.15);
  });
  it('makes no wind-up or counter window shorter in real time, on any difficulty', () => {
    expect(attacks.length).toBeGreaterThan(0);
    for (const d of Object.keys(DIFFICULTY) as Difficulty[]) {
      for (const { attack } of attacks) {
        const t = telegraphTicks(attack as never, d);
        expect(t * realMsPerTick()).toBeGreaterThanOrEqual(t * OLD_MS_PER_TICK);
      }
      const w = DIFFICULTY[d].counterWindowTicks;
      expect(w * realMsPerTick()).toBeGreaterThanOrEqual(w * OLD_MS_PER_TICK);
    }
  });
});

describe('K25 being-hit shake', () => {
  const s = (beltId: string, difficulty: Difficulty, reducedMotion = false) => hurtShakeScale({ beltIds: BELTS, beltId, difficulty, reducedMotion });
  it('is off below Brown belt on Guided and Standard', () => {
    for (const b of BELTS.slice(0, 7)) for (const d of ['guided', 'standard'] as const) expect(s(b, d)).toBe(0);
  });
  it('is on at 65% from Brown belt up, on any difficulty', () => {
    for (const b of BELTS.slice(7)) for (const d of Object.keys(DIFFICULTY) as Difficulty[]) expect(s(b, d)).toBeCloseTo(0.65);
  });
  it('is on at 65% on Challenge at any belt', () => {
    for (const b of BELTS) expect(s(b, 'challenge')).toBeCloseTo(0.65);
  });
  it('is always off with Reduced motion', () => {
    for (const b of BELTS) for (const d of Object.keys(DIFFICULTY) as Difficulty[]) expect(s(b, d, true)).toBe(0);
  });
});
