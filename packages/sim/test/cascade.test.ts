// M7-P4: the unlock cascade on the first return home. Done when profile 2 sees 3 unlocks plus
// the stripe in order, profile 1 sees the preview, and nothing plays twice.
import { describe, expect, it } from 'vitest';
import { buildTraining, loadFeed, rewardMoments, snapshot, type Now, type RewardMoment } from '../src';
import newWhite from '../../../fixtures/1-white-belt-new.json';
import white3 from '../../../fixtures/2-white-belt-3-signoffs.json';
import yellow from '../../../fixtures/3-yellow-belt.json';
import green from '../../../fixtures/4-green-belt.json';
import young from '../../../fixtures/5-white-belt-age-6-9.json';
import { testContent } from './load-content';

const content = testContent();
const train = (data: unknown) => {
  const feed = loadFeed(data);
  const now: Now = { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() };
  return buildTraining(feed, content.abilities, now);
};
const STANCE = content.abilities.stances[0].name;
const step = (m: RewardMoment): string =>
  m.kind === 'signOff' ? `signOff:${m.requirement.name}` : m.kind === 'stripe' ? `stripe:${m.word}` : m.kind;

describe('unlock cascade (M7-P4)', () => {
  it('profile 2 sees the opening card, then its 3 sign-offs in the order earned, then the stripe', () => {
    const m = rewardMoments(null, train(white3), STANCE);
    expect(m.map(step)).toEqual(['welcome', 'signOff:Self-Defense #1', 'signOff:Basic Form 1', 'signOff:Self-Defense #3', expect.stringMatching(/^stripe:/)]);
    const w = m[0];
    expect(w.kind === 'welcome' && w.count).toBe(4);
    expect(w.kind === 'welcome' && w.preview).toBeNull();
    const stance = m[2];
    expect(stance.kind === 'signOff' && stance.ability).toBe('Stance: Rooted Stance');
  });

  it("profile 1 (nothing signed off yet) sees the preview: the Beginner's Stance and what the first sign-off unlocks", () => {
    const m = rewardMoments(null, train(newWhite), STANCE);
    expect(m).toHaveLength(1);
    const w = m[0];
    if (w.kind !== 'welcome' || !w.preview) throw new Error('expected a preview');
    expect(STANCE).toBe("Beginner's Stance");
    expect(w.preview.stance).toBe("Beginner's Stance");
    expect(w.preview.next?.name).toBeTruthy();
    expect(w.preview.ability).not.toBe('');
  });

  it('nothing plays twice, for every fake profile', () => {
    for (const f of [newWhite, white3, yellow, green, young]) {
      const t = train(f);
      expect(rewardMoments(null, t, STANCE)[0].kind).toBe('welcome');
      expect(rewardMoments(snapshot(t), t, STANCE)).toEqual([]);
    }
  });

  it('a long list is shown together, so a green belt is not buried in cards', () => {
    const m = rewardMoments(null, train(green), STANCE);
    expect(m.filter((x) => x.kind === 'signOff')).toHaveLength(0);
    expect(m[1].kind).toBe('signOffs');
  });
});
