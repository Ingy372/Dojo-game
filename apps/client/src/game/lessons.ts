// Sensei's Lessons on the client (M7-P5): the lessons file, today's date, and showing a lesson once.

import { lessonFor, loadLessons, markLessonSeen, systemIntroducedOn, type SenseiLesson } from '@dojo/sim';
import lessonsData from '../../../../content/tutorial/first-session-lessons.json';
import { loadSave, writeSave } from './save';

export const LESSONS = loadLessons(lessonsData);

const DAY_OFFSET_KEY = 'dojo-ascent-dev-day-offset';

/** Days added by the dojo testing screen's "+1 day" (dev/test only; 0 for real players). */
export function devDayOffset(): number {
  const n = Number(localStorage.getItem(DAY_OFFSET_KEY) ?? 0);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

/** The testing screen's "+1 day": the session day really moves on (Manager call, M7-P7). */
export function addDevDays(days: number): void {
  localStorage.setItem(DAY_OFFSET_KEY, String(devDayOffset() + days));
}

/** Today on the player's own clock (YYYY-MM-DD), plus any testing-screen days: a session is a day with a run. */
export function localDay(real = new Date()): string {
  const now = new Date(real.getFullYear(), real.getMonth(), real.getDate() + devDayOffset());
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
  // One new thing per day in total: a Welcome Week system met today counts too (M7-P7).
  const lesson = lessonFor(LESSONS, profile.lessons, triggerKey, today, room, systemIntroducedOn(profile.welcomeWeek, today));
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
