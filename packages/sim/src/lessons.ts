// Sensei's lessons: short read-aloud lines from content/tutorial/first-session-lessons.json,
// plus the tutorial floor's lines from content/tutorial/tutorial-floor.json (M7-P2).

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

/** The tutorial floor's steps (content/tutorial/tutorial-floor.json), in order. */
export const TUTORIAL_STEPS = ['tutorial-bow', 'tutorial-walk', 'tutorial-brute', 'tutorial-insight', 'tutorial-chest', 'tutorial-boss', 'tutorial-door'] as const;
export type TutorialStep = (typeof TUTORIAL_STEPS)[number];
/** Taught in the tutorial's boss room when Focus first fills (Manager call, M7-P2). */
export const STRIKE_LESSON = 'lesson-strike';

/** Reads the tutorial floor's lines and checks every step is there. */
export function loadTutorialLines(data: unknown): Record<TutorialStep, Lesson> {
  const list = (data as { lessons?: unknown })?.lessons;
  if (!Array.isArray(list)) throw new Error('Tutorial floor: "lessons" must be a list');
  const out: Partial<Record<TutorialStep, Lesson>> = {};
  for (const l of list as Lesson[]) {
    if (typeof l?.id !== 'string' || !Array.isArray(l.screens) || l.screens.some((s) => typeof s !== 'string')) {
      throw new Error(`Tutorial floor: step ${JSON.stringify(l?.id)} needs an id and a list of screens`);
    }
    out[l.id as TutorialStep] = { id: l.id, screens: l.screens, success: l.success, retry: l.retry, nudge: l.nudge };
  }
  for (const id of TUTORIAL_STEPS) if (!out[id]) throw new Error(`Tutorial floor: missing "${id}"`);
  return out as Record<TutorialStep, Lesson>;
}
