import { describe, expect, it } from 'vitest';
import GAINS from '../../../content/settings/training-gains.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import { buildTraining, gainText, loadFeed, signOffGain, stripeGain, TRAINING_STATS } from '../src';
import { testContent } from './load-content';

// R-BAL-12d: gain words. Gains only, very simple, never a nag.
const content = testContent();
const feed = loadFeed(yellow);
const t = buildTraining(feed, content.abilities, { ms: Date.parse(feed.asOf), weekday: 3 });
const lines = [GAINS.signOff, GAINS.signOffs, GAINS.stripe];

describe('R-BAL-12d training gain words', () => {
  it('a white sign-off says +1 Power, +4 Health; a yellow stripe says +5 Guard', () => {
    expect(gainText(GAINS.signOff, signOffGain(t, [{ belt: t.belts[0].id }]))).toBe('You got stronger! +1 Power, +4 Health');
    expect(gainText(GAINS.stripe, stripeGain(t, t.belts[1].name))).toBe(`You got tougher! +${TRAINING_STATS[1].stripe.guard} Guard`);
  });
  it('several sign-offs add up', () => {
    const g = signOffGain(t, [{ belt: t.belts[0].id }, { belt: t.belts[1].id }]);
    expect(g).toEqual({ power: 2, health: 9, guard: 0 });
  });
  it('every line shows a gain (+) and has no nag, guilt, streak or missing words', () => {
    const banned = /miss|lost|lose|didn|don't|should|must|streak|hurry|only|left|yet|behind|forgot|again tomorrow|reminder|-\d/i;
    for (const l of lines) {
      expect(l).toMatch(/\+\{/);
      expect(l).not.toMatch(banned);
      expect(l.split(/\s+/).length).toBeLessThanOrEqual(8);
    }
  });
  it('fills every number (no {placeholders} left)', () => {
    for (const l of lines) expect(gainText(l, { power: 1, health: 2, guard: 3 })).not.toMatch(/[{}]/);
  });
});
