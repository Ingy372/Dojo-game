// Sensei's lessons: short read-aloud lines from content/tutorial/first-session-lessons.json,
// plus the tutorial floor's lines from content/tutorial/tutorial-floor.json (M7-P2).

export interface Lesson {
  id: string;
  screens: string[];
  success?: string;
  retry?: string;
  /** Kind hint shown while the guided Counter waits for a tap. */
  nudge?: string;
  /** The practice line shown after the screens (lessons file only). */
  practice?: string;
}

/** A first-session lesson with its rules (content/tutorial/first-session-lessons.json, M7-P5). */
export interface SenseiLesson extends Lesson {
  /** The game event that brings the lesson up (Manager call: one key per lesson). */
  triggerKey: string;
  order: number;
  /** The first session (calendar day with a run) the lesson may show in. */
  earliestSession: number;
  /** Shows the first time it comes up, even if a lesson was already new this session. */
  ignoresSessionLimit: boolean;
  /** A fading follow-up or plain line: never counts as a new lesson. */
  fadingFollowUp: boolean;
  /** Listed on the Lesson Scroll (false for follow-ups and the welcome line). */
  scroll: boolean;
}

/** The lessons the guided Counter uses, by guide step (0 guided, 1 hint, 2 pulse only). */
export const GUIDE_LESSONS = ['lesson-counter-guided', 'lesson-counter-hint-2', 'lesson-counter-hint-3'] as const;
/** Shown when the very first warning appears, before "Tap Counter... now!". */
export const WARNING_LESSON = 'lesson-warning';

/** Reads the lessons file and checks every lesson the game needs is there. */
export function loadLessons(data: unknown): Record<string, SenseiLesson> {
  const list = (data as { lessons?: unknown })?.lessons;
  if (!Array.isArray(list)) throw new Error('Sensei lessons: "lessons" must be a list');
  const out: Record<string, SenseiLesson> = {};
  const keys = new Set<string>();
  for (const l of list as SenseiLesson[]) {
    if (typeof l?.id !== 'string' || !Array.isArray(l.screens) || l.screens.some((s) => typeof s !== 'string')) {
      throw new Error(`Sensei lessons: lesson ${JSON.stringify(l?.id)} needs an id and a list of screens`);
    }
    if (typeof l.triggerKey !== 'string' || l.triggerKey === '') throw new Error(`Sensei lessons: "${l.id}" needs a triggerKey`);
    if (keys.has(l.triggerKey)) throw new Error(`Sensei lessons: triggerKey "${l.triggerKey}" is used twice`);
    keys.add(l.triggerKey);
    if (!Number.isInteger(l.order) || !Number.isInteger(l.earliestSession) || l.earliestSession < 1) throw new Error(`Sensei lessons: "${l.id}" needs a whole order and an earliestSession of 1 or more`);
    out[l.id] = {
      id: l.id,
      screens: l.screens,
      success: l.success,
      retry: l.retry,
      nudge: l.nudge,
      practice: l.practice,
      triggerKey: l.triggerKey,
      order: l.order,
      earliestSession: l.earliestSession,
      ignoresSessionLimit: l.ignoresSessionLimit === true,
      fadingFollowUp: l.fadingFollowUp === true,
      scroll: l.scroll !== false,
    };
  }
  for (const id of [WARNING_LESSON, ...GUIDE_LESSONS]) if (!out[id]) throw new Error(`Sensei lessons: missing "${id}"`);
  return out;
}

/** The tutorial floor's steps (content/tutorial/tutorial-floor.json), in order (13 since C12/K24a). */
export const TUTORIAL_STEPS = [
  'tutorial-bow',
  'tutorial-walk',
  'tutorial-space',
  'tutorial-brute',
  'tutorial-tip-warning',
  'tutorial-tip-swarmers',
  'tutorial-tip-tough',
  'tutorial-tip-space',
  'tutorial-tip-dash',
  'tutorial-insight',
  'tutorial-chest',
  'tutorial-boss',
  'tutorial-door',
] as const;
export type TutorialStep = (typeof TUTORIAL_STEPS)[number];
/** Taught in the tutorial's boss room when Focus first fills (Manager call, M7-P2). */
export const STRIKE_LESSON = 'lesson-strike';

/** What the game waits for after a 'move' step's tip (K24a). */
export const TUTORIAL_EVENTS = ['bow', 'reachSpot', 'walkAround', 'counter', 'defeatSwarmers', 'defeatBrute', 'keepSpace', 'dash', 'openChest', 'defeatBoss'] as const;
export type TutorialEvent = (typeof TUTORIAL_EVENTS)[number];

/**
 * One tutorial step (K24a). advance 'tap': done when Got it is tapped.
 * advance 'move': after Got it, the player tries the move; done when `waitFor` happens.
 */
export interface TutorialLine extends Lesson {
  advance: 'tap' | 'move';
  waitFor: TutorialEvent | null;
}

/** Reads the tutorial floor's steps and checks every step is there, with a valid advance and waitFor. */
export function loadTutorialLines(data: unknown): Record<TutorialStep, TutorialLine> {
  const list = (data as { lessons?: unknown })?.lessons;
  if (!Array.isArray(list)) throw new Error('Tutorial floor: "lessons" must be a list');
  const out: Partial<Record<TutorialStep, TutorialLine>> = {};
  for (const l of list as TutorialLine[]) {
    if (typeof l?.id !== 'string' || !Array.isArray(l.screens) || l.screens.some((s) => typeof s !== 'string')) {
      throw new Error(`Tutorial floor: step ${JSON.stringify(l?.id)} needs an id and a list of screens`);
    }
    if (l.advance !== 'tap' && l.advance !== 'move') throw new Error(`Tutorial floor: step "${l.id}" needs advance 'tap' or 'move'`);
    if (l.advance === 'tap' && l.waitFor != null) throw new Error(`Tutorial floor: tap step "${l.id}" must have waitFor null`);
    if (l.advance === 'move' && !(TUTORIAL_EVENTS as readonly string[]).includes(l.waitFor as string)) {
      throw new Error(`Tutorial floor: move step "${l.id}" waits for an unknown event ${JSON.stringify(l.waitFor)}`);
    }
    out[l.id as TutorialStep] = { id: l.id, screens: l.screens, success: l.success, retry: l.retry, nudge: l.nudge, advance: l.advance, waitFor: l.waitFor ?? null };
  }
  for (const id of TUTORIAL_STEPS) if (!out[id]) throw new Error(`Tutorial floor: missing "${id}"`);
  return out as Record<TutorialStep, TutorialLine>;
}

// ---- Tutorial step flow (K24a): no timers. A tip waits for Got it, then (move steps) for the try. ----

export type TutorialPhase = 'ready' | 'tip' | 'trying';

export interface TutorialFlow {
  /** Index in TUTORIAL_STEPS of the step now in play; TUTORIAL_STEPS.length when finished. */
  index: number;
  phase: TutorialPhase;
}

/** A flow starting at `from` (each tutorial room picks up at its own first step). */
export function tutorialFlow(from: TutorialStep = 'tutorial-bow'): TutorialFlow {
  return { index: TUTORIAL_STEPS.indexOf(from), phase: 'ready' };
}

/** The step now in play, or null when the flow is finished. */
export function currentStep(flow: TutorialFlow): TutorialStep | null {
  return TUTORIAL_STEPS[flow.index] ?? null;
}

/** Shows the current step's tip. Only from 'ready', and only for the step now in play. */
export function showTip(flow: TutorialFlow, id: TutorialStep): boolean {
  if (flow.phase !== 'ready' || currentStep(flow) !== id) return false;
  flow.phase = 'tip';
  return true;
}

/** Got it was tapped: a tap step is done; a move step now waits for the try. Returns the finished step, if any. */
export function gotIt(flow: TutorialFlow, lines: Record<TutorialStep, TutorialLine>): TutorialStep | null {
  const id = currentStep(flow);
  if (flow.phase !== 'tip' || !id) return null;
  if (lines[id].advance === 'tap') return finish(flow);
  flow.phase = 'trying';
  return null;
}

/** Something happened in the game. Returns the finished step when it was what the current step waits for. */
export function tutorialEvent(flow: TutorialFlow, lines: Record<TutorialStep, TutorialLine>, ev: TutorialEvent): TutorialStep | null {
  const id = currentStep(flow);
  if (flow.phase !== 'trying' || !id || lines[id].waitFor !== ev) return null;
  return finish(flow);
}

/** The step can no longer happen (e.g. its enemy is gone): it ends quietly, with no pressure. */
export function skipStep(flow: TutorialFlow, id: TutorialStep): boolean {
  if (currentStep(flow) !== id) return false;
  finish(flow);
  return true;
}

function finish(flow: TutorialFlow): TutorialStep {
  const id = TUTORIAL_STEPS[flow.index];
  flow.index++;
  flow.phase = 'ready';
  return id;
}

// ---- Sensei's Lessons: when a new lesson may show (M7-P5) ----
// A session is a calendar day (YYYY-MM-DD, the player's own clock) with at least one run (Manager call).
// Limits: at most one new lesson per session (unless ignoresSessionLimit) and one per room.
// Fading follow-ups and plain lines never count toward either limit.

/** One lesson the player has seen: the day, and the room it came up in (null at home). */
export interface SeenLesson {
  id: string;
  day: string;
  room: string | null;
}

/** What the profile keeps about lessons. */
export interface LessonLog {
  /** Lessons seen, in the order they were seen. */
  seen: SeenLesson[];
  /** Days with at least one run, oldest first: each is a session. */
  sessionDays: string[];
}

export function newLessonLog(): LessonLog {
  return { seen: [], sessionDays: [] };
}

/** A saved lesson log if it has the right shape, otherwise a fresh one. */
export function readLessonLog(data: unknown): LessonLog {
  const d = data as Partial<LessonLog> | null;
  if (!d || typeof d !== 'object') return newLessonLog();
  const seen = Array.isArray(d.seen) ? d.seen.filter((s) => s && typeof s.id === 'string' && typeof s.day === 'string').map((s) => ({ id: s.id, day: s.day, room: typeof s.room === 'string' ? s.room : null })) : [];
  const sessionDays = Array.isArray(d.sessionDays) ? d.sessionDays.filter((x): x is string => typeof x === 'string') : [];
  return { seen, sessionDays };
}

/** A run started today: today becomes (or stays) a session. */
export function noteRunDay(log: LessonLog, today: string): void {
  if (!log.sessionDays.includes(today)) log.sessionDays.push(today);
}

/** The session number today belongs to (1 = the first day with a run). */
export function sessionNumber(log: LessonLog, today: string): number {
  const before = log.sessionDays.filter((d) => d < today).length;
  return before + 1;
}

const counts = (l: SenseiLesson): boolean => !l.fadingFollowUp;

/**
 * The lesson to show for a game event, or null: not seen yet, its session has come, and the
 * limits allow it. `room` names the room it comes up in (null at home). `systemToday`: a
 * Welcome Week system was already met today.
 */
export function lessonFor(lessons: Record<string, SenseiLesson>, log: LessonLog, triggerKey: string, today: string, room: string | null, systemToday = false): SenseiLesson | null {
  const lesson = Object.values(lessons).find((l) => l.triggerKey === triggerKey);
  if (!lesson || log.seen.some((s) => s.id === lesson.id)) return null;
  if (sessionNumber(log, today) < lesson.earliestSession) return null;
  if (!counts(lesson)) return lesson;
  const counted = log.seen.filter((s) => lessons[s.id] && counts(lessons[s.id]));
  if (room !== null && counted.some((s) => s.room === room && s.day === today)) return null;
  if (!lesson.ignoresSessionLimit && counted.some((s) => s.day === today && !lessons[s.id].ignoresSessionLimit)) return null;
  // Welcome Week (M7-P7): a system met today uses up today's one new thing too (Manager call: shared budget).
  if (!lesson.ignoresSessionLimit && systemToday) return null;
  return lesson;
}

/** Remembers that a lesson was shown. */
export function markLessonSeen(log: LessonLog, id: string, today: string, room: string | null): void {
  if (!log.seen.some((s) => s.id === id)) log.seen.push({ id, day: today, room });
}

/** The Lesson Scroll: every seen lesson that's listed there, in lesson order. */
export function scrollLessons(lessons: Record<string, SenseiLesson>, log: LessonLog): SenseiLesson[] {
  return log.seen
    .map((s) => lessons[s.id])
    .filter((l): l is SenseiLesson => !!l && l.scroll)
    .sort((a, b) => a.order - b.order);
}
