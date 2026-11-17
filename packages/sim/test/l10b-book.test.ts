// L10-B: the Book replaces the Trophy Case, Sensei's Scroll and the Monster Journal. An old save
// (from before the Book) must show the same things it showed before, and the save is never changed.
import { describe, expect, it } from 'vitest';
import { buildTraining, journalKinds, loadFeed, loadLessons, loadProfile, scrollLessons, type Now, type TrainingState } from '../src';
import green from '../../../fixtures/4-green-belt.json';
import lessonsData from '../../../content/tutorial/first-session-lessons.json';
import { buildCubbies, shelfRows } from '../../../apps/client/src/ui/trophyCase';
import { bookCubbies, tabCubbies } from '../../../apps/client/src/ui/book';
import { testContent } from './load-content';

const content = testContent();
const LESSONS = loadLessons(lessonsData);
const feed = loadFeed(green);
const now: Now = { ms: Date.parse(feed.asOf), weekday: new Date(feed.asOf).getUTCDay() };
const t: TrainingState = buildTraining(feed, content.abilities, now);

// A save written before the Book: lessons seen, two monster trophies given, the Journal and Scroll open.
const oldSave = {
  ...loadProfile(null),
  runsPlayed: 12,
  lessons: { seen: ['lesson-warning', 'lesson-strike', 'lesson-dash', 'lesson-block'].map((id) => ({ id, day: '2026-11-01' })), sessionDays: ['2026-11-01'] },
  monsterJournal: { swarmer: { met: true, beaten: true }, shield: { met: true, beaten: false } },
  decorEarning: { ...loadProfile(null).decorEarning, given: ['decor-a6-journal-trophy-swarmer', 'decor-a6-journal-trophy-shield'] },
  welcomeWeek: { existing: false, introduced: [] },
};
const saved = JSON.stringify(oldSave);
const profile = loadProfile(JSON.parse(saved));

const caseCubbies = buildCubbies({
  abilities: t.abilities,
  virtues: t.virtues,
  beltName: (id) => t.belts.find((b) => b.id === id)?.name ?? id,
  virtueName: (v) => v.def.name,
  virtueEffect: (v) => v.def.text,
  kataLine: () => undefined,
});
const scroll = scrollLessons(LESSONS, profile.lessons);
const kinds = journalKinds(content, profile.decorEarning.given);
const all = bookCubbies({
  cubbies: caseCubbies,
  lessons: scroll,
  scrollOpen: true,
  lessonTitle: (l) => l.screens[0],
  kinds,
  journalOpen: true,
  monsterName: (k) => k.trophy.name,
  unknown: { name: '?', fact: '' },
});
const moves = tabCubbies(all, 'moves');
const trophies = tabCubbies(all, 'trophies');

describe('L10-B the Book keeps an old save', () => {
  it('the save still has its lessons and monsters', () => {
    expect(scroll.map((l) => l.id)).toEqual(['lesson-warning', 'lesson-strike', 'lesson-dash', 'lesson-block'].filter((id) => LESSONS[id]?.scroll).sort((a, b) => LESSONS[a].order - LESSONS[b].order));
    expect(scroll.length).toBeGreaterThan(0);
    expect(kinds.filter((k) => k.met).map((k) => k.trophy.id).sort()).toEqual(['decor-a6-journal-trophy-shield', 'decor-a6-journal-trophy-swarmer']);
  });

  it('every Trophy Case cubby is on a Moves or Trophies shelf, once', () => {
    const shown = [...moves, ...trophies].map((c) => c.id);
    for (const c of caseCubbies) expect(shown.filter((id) => id === c.id)).toHaveLength(1);
  });

  it("Moves shows every lesson Sensei's Scroll showed, and the tutorial replay", () => {
    const lessons = moves.filter((c) => c.shelf === 'lessons');
    expect(lessons.map((c) => c.id)).toEqual([...scroll.map((l) => `lesson-${l.id}`), 'lesson-tutorial']);
    expect(lessons.at(-1)!.action).toBe('replayTutorial');
  });

  it('Trophies shows every monster the Journal showed, met ones with their trophy art', () => {
    const monsters = trophies.filter((c) => c.shelf === 'monsters');
    expect(monsters).toHaveLength(kinds.length);
    for (const k of kinds) {
      const c = monsters.find((m) => m.id === `trophy-${k.trophy.id}`)!;
      expect(c.earned).toBe(k.met);
    }
  });

  it('monster trophies start their own shelf row, and a wrapped row is marked so its label is not repeated', () => {
    const rows = shelfRows(trophies, 4);
    const first = rows.findIndex((r) => r.segments.some((sg) => sg.shelf === 'monsters'));
    expect(rows[first].segments.map((sg) => sg.shelf)).toEqual(['monsters']);
    for (const r of rows.slice(first + 1)) expect(r.segments.every((sg) => sg.shelf === 'monsters' && sg.cont)).toBe(true);
    expect(rows[first].segments[0].cont).toBeUndefined();
  });

  it('nothing in the save changes', () => {
    expect(JSON.stringify(oldSave)).toBe(saved);
    expect(loadProfile(JSON.parse(saved))).toEqual(profile);
  });
});
