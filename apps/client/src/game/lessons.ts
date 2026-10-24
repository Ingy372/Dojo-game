// Sensei's Lessons on the client (M7-P5): the lessons file, today's date, and showing a lesson once.

import { lessonFor, loadLessons, markLessonSeen, type SenseiLesson } from '@dojo/sim';
import lessonsData from '../../../../content/tutorial/first-session-lessons.json';
import { loadSave, writeSave } from './save';

export const LESSONS = loadLessons(lessonsData);

/** Today on the player's own clock (YYYY-MM-DD): a session is a day with a run. */
export function localDay(now = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

/**
 * A game event happened: the lesson it brings up, if the session and room limits allow it.
 * The lesson is saved as seen straight away (it shows once).
 */
export function takeLesson(triggerKey: string, room: string | null): SenseiLesson | null {
  const profile = loadSave();
  const today = localDay();
  const lesson = lessonFor(LESSONS, profile.lessons, triggerKey, today, room);
  if (!lesson) return null;
  markLessonSeen(profile.lessons, lesson.id, today, room);
  writeSave(profile);
  return lesson;
}

/** A lesson taught on the tutorial floor's own guide path: saved as seen so the Scroll lists it. */
export function noteLessonSeen(id: string, room: string | null): void {
  const profile = loadSave();
  if (profile.lessons.seen.some((s) => s.id === id)) return;
  markLessonSeen(profile.lessons, id, localDay(), room);
  writeSave(profile);
}

/** Short names for the Lesson Scroll. */
const TITLES: Record<string, string> = {
  'lesson-warning': 'The red circle',
  'lesson-counter-guided': 'Counter',
  'lesson-strike': 'Strike',
  'lesson-dash': 'Dash',
  'lesson-insights': 'Insights',
  'lesson-decorating': 'Decorating',
  'lesson-perfect': 'Perfect Counter',
  'lesson-block': 'Block',
  'lesson-step-out': 'Stepping out',
};

export function lessonTitle(l: SenseiLesson): string {
  return TITLES[l.id] ?? l.screens[0];
}
