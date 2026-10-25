// M7-P7: the gradual unlock schedule and Welcome Week (core-design section 13).
// Existing students get every earned ability on day 1, but meet the dojo's systems one per
// day, in the order of content/settings/unlock-schedule.json. One new thing per day in total,
// shared with Sensei's Lessons (Manager call). New students aren't in Welcome Week: their
// systems open by belt as before. Nothing here counts down or mentions missed days.

import { GUIDE_LESSONS, STRIKE_LESSON, WARNING_LESSON, type LessonLog, type SenseiLesson } from './lessons';

/** Taught on the tutorial floor's own guide path (first-session core): they don't use up the day's new thing. */
const TUTORIAL_TAUGHT = new Set<string>([WARNING_LESSON, ...GUIDE_LESSONS, STRIKE_LESSON]);
import type { TrainingState } from './training';

export interface ScheduledSystem {
  id: string;
  name: string;
  /** The belt tier that opens it at all (1 = white). Lower belts skip it. */
  minTier: number;
  /** Sensei's introduction, one line per screen. */
  screens: string[];
}

/** One system met in Welcome Week, and the day (YYYY-MM-DD) it was introduced. */
export interface IntroducedSystem {
  id: string;
  day: string;
}

/** What the profile keeps about Welcome Week. `existing` is decided once, the first time it's checked. */
export interface WelcomeWeekLog {
  existing: boolean | null;
  introduced: IntroducedSystem[];
}

export function newWelcomeWeekLog(): WelcomeWeekLog {
  return { existing: null, introduced: [] };
}

export function readWelcomeWeekLog(data: unknown): WelcomeWeekLog {
  const d = data as Partial<WelcomeWeekLog> | null;
  if (!d || typeof d !== 'object') return newWelcomeWeekLog();
  const introduced = Array.isArray(d.introduced) ? d.introduced.filter((s) => s && typeof s.id === 'string' && typeof s.day === 'string').map((s) => ({ id: s.id, day: s.day })) : [];
  return { existing: typeof d.existing === 'boolean' ? d.existing : null, introduced };
}

export function loadUnlockSchedule(data: unknown): ScheduledSystem[] {
  const list = (data as { systems?: unknown })?.systems;
  if (!Array.isArray(list)) throw new Error('Unlock schedule: "systems" must be a list');
  const ids = new Set<string>();
  return (list as ScheduledSystem[]).map((s) => {
    if (typeof s?.id !== 'string' || ids.has(s.id)) throw new Error(`Unlock schedule: system ${JSON.stringify(s?.id)} needs a unique id`);
    ids.add(s.id);
    if (typeof s.name !== 'string' || !Number.isInteger(s.minTier) || s.minTier < 1) throw new Error(`Unlock schedule: "${s.id}" needs a name and a whole minTier of 1 or more`);
    if (!Array.isArray(s.screens) || s.screens.length === 0 || s.screens.some((x) => typeof x !== 'string')) throw new Error(`Unlock schedule: "${s.id}" needs screens`);
    return { id: s.id, name: s.name, minTier: s.minTier, screens: s.screens };
  });
}

/** An existing student (Manager call): any real sign-off, or a belt above white. */
export function isExistingStudent(t: TrainingState): boolean {
  return t.tier > 1 || t.requirements.some((r) => r.signedOff && !r.legacy);
}

/** Decides (once) whether this profile takes Welcome Week. Later sign-offs don't pull a new student into it. */
export function settleWelcomeWeek(log: WelcomeWeekLog, t: TrainingState): void {
  if (log.existing === null) log.existing = isExistingStudent(t);
}

/** The systems this student's belt opens, in schedule order. */
function forBelt(schedule: ScheduledSystem[], t: TrainingState): ScheduledSystem[] {
  return schedule.filter((s) => t.tier >= s.minTier);
}

/** Is this dojo system open? Its belt must allow it; in Welcome Week it must also have been introduced. */
export function systemOpen(schedule: ScheduledSystem[], log: WelcomeWeekLog, t: TrainingState, id: string): boolean {
  const s = schedule.find((x) => x.id === id);
  if (!s) return true;
  if (t.tier < s.minTier) return false;
  // Not settled yet (first look, before the dojo's Welcome Week check): decide from the training now.
  if (!(log.existing ?? isExistingStudent(t))) return true;
  return log.introduced.some((x) => x.id === id);
}

/** A system was introduced today (it uses up today's one new thing). */
export function systemIntroducedOn(log: WelcomeWeekLog, today: string): boolean {
  return log.introduced.some((x) => x.day === today);
}

/** A lesson that counts as new was seen today (it uses up today's one new thing). */
export function lessonNewOn(lessons: Record<string, SenseiLesson>, log: LessonLog, today: string): boolean {
  return log.seen.some((s) => s.day === today && !TUTORIAL_TAUGHT.has(s.id) && lessons[s.id] && !lessons[s.id].fadingFollowUp);
}

/**
 * Welcome Week's system for today, or null: the next one not yet met, if nothing new has been
 * met today (lesson or system). Saved as introduced. The week simply resumes on the next day
 * the student plays; nothing is lost by a gap.
 */
export function introduceToday(schedule: ScheduledSystem[], log: WelcomeWeekLog, t: TrainingState, lessons: Record<string, SenseiLesson>, lessonLog: LessonLog, today: string): ScheduledSystem | null {
  settleWelcomeWeek(log, t);
  if (log.existing !== true) return null;
  if (systemIntroducedOn(log, today) || lessonNewOn(lessons, lessonLog, today)) return null;
  const next = forBelt(schedule, t).find((s) => !log.introduced.some((x) => x.id === s.id));
  if (!next) return null;
  log.introduced.push({ id: next.id, day: today });
  return next;
}

/** Welcome Week is done when every system the belt opens has been met (or it never applied). */
export function welcomeWeekDone(schedule: ScheduledSystem[], log: WelcomeWeekLog, t: TrainingState): boolean {
  return log.existing !== true || forBelt(schedule, t).every((s) => log.introduced.some((x) => x.id === s.id));
}
