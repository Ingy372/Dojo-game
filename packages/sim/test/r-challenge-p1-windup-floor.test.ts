// R-CHALLENGE P1: no Challenge wind-up under the 10-tick floor; Guided and Standard unchanged.
import { describe, expect, it } from 'vitest';
import { DIFFICULTY, MIN_WINDUP_TICKS, ELITE_KINDS, eliteWindup, telegraphTicks, type Difficulty } from '../src';
import { testContent } from './load-content';

const content = testContent();
const attacks = Object.values(content.enemies).flatMap((e) => e.attacks.map((a) => ({ id: e.id, a })));
/** The formula before P1, for proving Guided and Standard didn't move. */
const oldFormula = (t: number, d: Difficulty) => Math.round((t - DIFFICULTY.standard.counterWindowTicks) * DIFFICULTY[d].fillScale) + DIFFICULTY[d].counterWindowTicks;

describe('R-CHALLENGE P1 wind-up floor', () => {
  it('every Challenge wind-up is at least 10 ticks', () => {
    expect(MIN_WINDUP_TICKS).toBe(10);
    expect(attacks.length).toBeGreaterThan(0);
    for (const { a } of attacks) expect(telegraphTicks(a, 'challenge')).toBeGreaterThanOrEqual(MIN_WINDUP_TICKS);
  });
  it('raises the swarmer jab and spark-sprite dart from 9 to 10 on Challenge', () => {
    for (const [id, name] of [['swarmer', 'jab'], ['spark-sprite', 'dart']]) {
      const a = content.enemies[id].attacks.find((x) => x.name === name)!;
      expect(oldFormula(a.telegraphTicks, 'challenge')).toBe(9);
      expect(telegraphTicks(a, 'challenge')).toBe(10);
    }
  });
  it('Guided and Standard wind-ups are exactly the old formula', () => {
    for (const { a } of attacks) for (const d of ['guided', 'standard'] as Difficulty[]) expect(telegraphTicks(a, d)).toBe(oldFormula(a.telegraphTicks, d));
  });
  it('every elite Challenge wind-up is at least 10 ticks', () => {
    for (const { a } of attacks) for (const k of ELITE_KINDS) {
      const t = eliteWindup(telegraphTicks(a, 'challenge'), k, 'challenge', content.elites, DIFFICULTY.challenge.counterWindowTicks);
      expect(t).toBeGreaterThanOrEqual(MIN_WINDUP_TICKS);
    }
  });
});
