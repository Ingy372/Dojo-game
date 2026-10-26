import { describe, expect, it } from 'vitest';
import { lessonFor, loadLessons, loadProfile, markLessonSeen, newLessonLog, newProfile, noteRunDay, scrollLessons, sessionNumber, type LessonLog } from '../src';
import lessonsData from '../../../content/tutorial/first-session-lessons.json';

const LESSONS = loadLessons(lessonsData);
const day = (n: number) => `2026-11-${String(n).padStart(2, '0')}`;

/** Fires a trigger and, if a lesson comes up, shows it (marks it seen). */
function fire(log: LessonLog, key: string, today: string, room: string | null): string | null {
  const l = lessonFor(LESSONS, log, key, today, room);
  if (l) markLessonSeen(log, l.id, today, room);
  return l?.id ?? null;
}

/** Session 1: the tutorial floor's guided lessons, seen on the guide path. */
function afterTutorial(): LessonLog {
  const log = newLessonLog();
  noteRunDay(log, day(1));
  for (const [id, room] of [['lesson-warning', 'r1'], ['lesson-counter-guided', 'r1'], ['lesson-strike', 'r2']] as const) markLessonSeen(log, id, day(1), room);
  return log;
}

const NEW_KEYS = ['twoAttacksAtOnce', 'firstInsightChoice', 'firstDecoration', 'firstPerfectUnaided', 'firstBlock', 'firstStepOut'];

describe("Sensei's Lessons (M7-P5)", () => {
  it('every lesson has its own triggerKey', () => {
    const keys = Object.values(LESSONS).map((l) => l.triggerKey);
    expect(keys.length).toBe(12);
    expect(new Set(keys).size).toBe(keys.length);
    const dup = JSON.parse(JSON.stringify(lessonsData)) as { lessons: Array<{ triggerKey: string }> };
    dup.lessons[1].triggerKey = dup.lessons[0].triggerKey;
    expect(() => loadLessons(dup)).toThrow(/used twice/);
  });

  it('a session is a calendar day with a run: a second run that day is the same session', () => {
    const log = newLessonLog();
    expect(sessionNumber(log, day(1))).toBe(1);
    noteRunDay(log, day(1));
    noteRunDay(log, day(1));
    expect(sessionNumber(log, day(1))).toBe(1);
    // A day with no run is not a session.
    expect(sessionNumber(log, day(5))).toBe(2);
    noteRunDay(log, day(5));
    expect(log.sessionDays).toEqual([day(1), day(5)]);
  });

  it('two sessions in a row give one new lesson each, never two', () => {
    const log = afterTutorial();
    noteRunDay(log, day(2));
    // Session 2: only the Dash is due yet. Trying everything in different rooms gives one lesson.
    const s2 = NEW_KEYS.map((k, i) => fire(log, k, day(2), `room-${i}`)).filter(Boolean);
    expect(s2).toEqual(['lesson-dash']);
    // Session 3 and 4: every key fires again, more than once, in different rooms.
    for (const d of [3, 4]) {
      noteRunDay(log, day(d));
      noteRunDay(log, day(d)); // a second run the same day
      const shown = [...NEW_KEYS, ...NEW_KEYS].map((k, i) => fire(log, k, day(d), `room-${i}`)).filter(Boolean);
      expect(shown).toHaveLength(1);
    }
    expect(log.seen.map((s) => s.id).slice(3)).toEqual(['lesson-dash', 'lesson-insights', 'lesson-decorating']);
  });

  it('a lesson saved for later still comes the next session', () => {
    const log = afterTutorial();
    noteRunDay(log, day(3));
    noteRunDay(log, day(4)); // session 3 now
    expect(fire(log, 'twoAttacksAtOnce', day(4), 'a')).toBe('lesson-dash');
    expect(fire(log, 'firstInsightChoice', day(4), 'b')).toBeNull();
    noteRunDay(log, day(5));
    expect(fire(log, 'firstInsightChoice', day(5), 'a')).toBe('lesson-insights');
  });

  it('ignoresSessionLimit lessons show the same day, but still one per room', () => {
    const log = afterTutorial();
    for (let d = 2; d <= 7; d++) noteRunDay(log, day(d));
    expect(sessionNumber(log, day(7))).toBe(7);
    expect(fire(log, 'twoAttacksAtOnce', day(7), 'a')).toBe('lesson-dash');
    expect(fire(log, 'firstPerfectUnaided', day(7), 'a')).toBeNull(); // same room
    expect(fire(log, 'firstPerfectUnaided', day(7), 'b')).toBe('lesson-perfect');
    expect(fire(log, 'firstBlock', day(7), 'b')).toBeNull(); // same room
    expect(fire(log, 'firstBlock', day(7), 'c')).toBe('lesson-block');
    expect(fire(log, 'firstStepOut', day(7), 'd')).toBe('lesson-step-out');
    expect(fire(log, 'firstInsightChoice', day(7), 'e')).toBeNull(); // session limit
  });

  it('follow-ups and the welcome line ignore both limits', () => {
    const log = afterTutorial();
    expect(fire(log, 'secondWarning', day(1), 'r1')).toBe('lesson-counter-hint-2');
    expect(fire(log, 'thirdWarning', day(1), 'r1')).toBe('lesson-counter-hint-3');
    expect(fire(log, 'firstHomeReturn', day(1), null)).toBe('line-welcome-home');
    expect(fire(log, 'firstHomeReturn', day(1), null)).toBeNull(); // once only
  });

  it('every seen lesson is on the Scroll, except the follow-ups and the welcome line', () => {
    const log = afterTutorial();
    fire(log, 'secondWarning', day(1), 'r1');
    fire(log, 'firstHomeReturn', day(1), null);
    for (let d = 2; d <= 12; d++) {
      noteRunDay(log, day(d));
      NEW_KEYS.forEach((k, i) => fire(log, k, day(d), `room-${i}`));
    }
    const listed = scrollLessons(LESSONS, log).map((l) => l.id);
    const expected = Object.values(LESSONS).filter((l) => !l.fadingFollowUp).map((l) => l.id);
    expect(listed).toEqual(expected);
    // Each listed lesson replays: it has screens and a practice line.
    for (const l of scrollLessons(LESSONS, log)) {
      expect(l.screens.length).toBeGreaterThan(0);
      expect(l.practice).toBeTruthy();
    }
    expect(listed).not.toContain('lesson-counter-hint-2');
    expect(listed).not.toContain('line-welcome-home');
  });

  it('the profile keeps the lesson log, and an old save gets an empty one', () => {
    const p = newProfile();
    noteRunDay(p.lessons, day(1));
    markLessonSeen(p.lessons, 'lesson-dash', day(1), null);
    expect(loadProfile(JSON.parse(JSON.stringify(p))).lessons).toEqual(p.lessons);
    const old = JSON.parse(JSON.stringify(p));
    delete old.lessons;
    expect(loadProfile(old).lessons).toEqual(newLessonLog());
    expect(loadProfile({ ...old, lessons: { seen: 'x', sessionDays: [3] } }).lessons).toEqual(newLessonLog());
  });
});
