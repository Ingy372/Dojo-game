import { describe, expect, it } from 'vitest';
import { lessonFor, loadLessons, markLessonSeen, newLessonLog, noteRunDay, scrollLessons, type LessonLog } from '../src';
import lessonsData from '../../../content/tutorial/first-session-lessons.json';
import style from '../../../content/abilities/fighting-style.json';

const LESSONS = loadLessons(lessonsData);
const day = (n: number) => `2026-11-${String(n).padStart(2, '0')}`;

function fire(log: LessonLog, key: string, today: string, room: string | null): string | null {
  const l = lessonFor(LESSONS, log, key, today, room);
  if (l) markLessonSeen(log, l.id, today, room);
  return l?.id ?? null;
}

describe('LP-B5 (L7): the first time VIRTUE appears', () => {
  it('shows the one line once, counted as the session\'s new thing, and not on the Scroll', () => {
    const log = newLessonLog();
    noteRunDay(log, day(2));
    expect(LESSONS['lesson-virtue-ready'].screens).toEqual(['Your Focus is full. Tap VIRTUE!']);
    expect(fire(log, 'firstVirtueReady', day(2), 'r1')).toBe('lesson-virtue-ready');
    expect(fire(log, 'firstVirtueReady', day(2), 'r2')).toBeNull();
    noteRunDay(log, day(9));
    expect(fire(log, 'firstVirtueReady', day(9), 'r1')).toBeNull();
    expect(scrollLessons(LESSONS, log).map((l) => l.id)).not.toContain('lesson-virtue-ready');
  });

  it('waits when the session already had its new thing, then shows next session', () => {
    const log = newLessonLog();
    noteRunDay(log, day(2));
    markLessonSeen(log, 'lesson-dash', day(2), 'r1');
    expect(fire(log, 'firstVirtueReady', day(2), 'r2')).toBeNull();
    noteRunDay(log, day(3));
    expect(fire(log, 'firstVirtueReady', day(3), 'r1')).toBe('lesson-virtue-ready');
  });

  it('the Style screen no longer says Stance can be switched in a fight', () => {
    expect(style.switchLine).toBe('Pick your stance before you climb.');
  });
});
