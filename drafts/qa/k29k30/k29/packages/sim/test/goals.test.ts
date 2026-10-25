// M7-P10: every profile sees exactly 3 goals; the real-world one names a real next technique.
import { describe, expect, it } from 'vitest';
import { NO_NEXT_TECHNIQUE, buildTraining, goalsDue, loadFeed, loadProfile, markGoalsShown, newProfile, nextGoals, noteRunDay, type Now } from '../src';
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
const FIXTURES = { newWhite, white3, yellow, green, young };
const PRESSURE = /only|hurry|left today|before it|streak|missed|don't lose|last chance|days? left/i;

describe('three next goals (M7-P10)', () => {
  for (const [name, f] of Object.entries(FIXTURES)) {
    it(`${name}: exactly 3 goals (game, collection, real-world), the real-world one a real next technique`, () => {
      const t = train(f);
      const goals = nextGoals(newProfile(), t, content);
      expect(goals.map((g) => g.kind)).toEqual(['game', 'collection', 'realWorld']);
      for (const g of goals) {
        expect(g.text.length).toBeGreaterThan(0);
        expect(g.text).not.toMatch(PRESSURE);
      }
      const next = t.path.next;
      if (next) {
        // A real technique name from the student's own curriculum.
        expect(t.requirements.some((r) => r.name === next.name && !r.signedOff)).toBe(true);
        expect(goals[2].text).toContain(next.name);
      } else expect(goals[2].text).toBe(NO_NEXT_TECHNIQUE);
    });
  }

  it("profile 2's goals read as in core-design ('Show Sensei Self-Defense #2 in class to unlock a Technique Seal')", () => {
    expect(nextGoals(newProfile(), train(white3), content).map((g) => g.text)).toEqual([
      'Reach level 2 in the Tower.',
      'Find a new decoration for your dojo in a Tower chest.',
      'Show Sensei Self-Defense #2 in class to unlock Technique Seal: Escape Step.',
    ]);
    expect(nextGoals(newProfile(), train(green), content)[2].text).toBe('Show Sensei Self-Defense #18 in class to unlock a new Technique Seal.');
  });

  it('with no next technique, the real-world goal is the exact kind line', () => {
    const t = train(white3);
    expect(nextGoals(newProfile(), { ...t, path: { ...t.path, next: null } }, content)[2].text).toBe('Keep practicing with Sensei, and your next test will come!');
  });

  it('a met but unbeaten named monster is the collection goal', () => {
    const p = newProfile();
    const m = content.named.monsters[0];
    p.monsterJournal[m.id] = { met: true, beaten: false };
    expect(nextGoals(p, train(yellow), content)[1].text).toBe(`Beat ${m.name} to earn its sticker.`);
  });

  it('shows at most once a day, only after a run, and the day is saved', () => {
    const p = newProfile();
    p.lessons.sessionDays = ['2026-10-20'];
    expect(goalsDue(p, '2026-10-24')).toBe(false);
    p.lastRun = { summary: {} as never, newBests: [] };
    expect(goalsDue(p, '2026-10-24')).toBe(true);
    markGoalsShown(p, '2026-10-24');
    expect(goalsDue(p, '2026-10-24')).toBe(false);
    expect(goalsDue(loadProfile(JSON.parse(JSON.stringify(p))), '2026-10-24')).toBe(false);
    expect(goalsDue(p, '2026-10-25')).toBe(true);
  });

  it('session 1 never shows the goals card; it starts at session 2 (M7-P13 C1)', () => {
    const p = newProfile();
    p.lastRun = { summary: {} as never, newBests: [] };
    noteRunDay(p.lessons, '2026-10-24');
    expect(goalsDue(p, '2026-10-24')).toBe(false);
    noteRunDay(p.lessons, '2026-10-25');
    expect(goalsDue(p, '2026-10-25')).toBe(true);
    markGoalsShown(p, '2026-10-25');
    expect(goalsDue(p, '2026-10-25')).toBe(false);
  });
});
