// Sensei's lessons: short read-aloud lines from content/tutorial/sensei-lessons.json.

export interface Lesson {
  id: string;
  screens: string[];
  success?: string;
  retry?: string;
  /** Kind hint shown while the guided Counter waits for a tap. */
  nudge?: string;
}

/** The lessons the guided Counter uses, by guide step (0 guided, 1 hint, 2 pulse only). */
export const GUIDE_LESSONS = ['lesson-counter-guided', 'lesson-counter-hint-2', 'lesson-counter-hint-3'] as const;
/** Shown when the very first warning appears, before "Tap Counter... now!". */
export const WARNING_LESSON = 'lesson-warning';

/** Reads the lessons file and checks every lesson the game needs is there. */
export function loadLessons(data: unknown): Record<string, Lesson> {
  const list = (data as { lessons?: unknown })?.lessons;
  if (!Array.isArray(list)) throw new Error('Sensei lessons: "lessons" must be a list');
  const out: Record<string, Lesson> = {};
  for (const l of list as Lesson[]) {
    if (typeof l?.id !== 'string' || !Array.isArray(l.screens) || l.screens.some((s) => typeof s !== 'string')) {
      throw new Error(`Sensei lessons: lesson ${JSON.stringify(l?.id)} needs an id and a list of screens`);
    }
    out[l.id] = { id: l.id, screens: l.screens, success: l.success, retry: l.retry, nudge: l.nudge };
  }
  for (const id of [WARNING_LESSON, ...GUIDE_LESSONS]) if (!out[id]) throw new Error(`Sensei lessons: missing "${id}"`);
  return out;
}
