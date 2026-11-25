// Story Chapters (docs/superpowers/specs/2026-11-24-tutorial-overhaul-design.md, Jay Nov 24): the tutorial is told
// in six short chapters. Play-paced (Jay picked A): a chapter opens once the player has finished one Tower climb
// of their own since the last chapter. Chapter 1 (the opening and the tutorial floor) needs nothing.

/** The story chapters' save: chapters finished, climbs since the last one, and where an open chapter is. */
export interface StorySave {
  /** Chapters finished (0-6). */
  done: number;
  /** Tower climbs finished since the last chapter (real runs only). */
  climbs: number;
  /** The step inside the chapter in progress (e.g. "ch2-sweep"), so closing the app resumes it. */
  step: string | null;
}

export const STORY_CHAPTERS = 6;

/** A saved story, or a fresh one. A save that has already played starts with chapter 1 done. */
export function readStory(raw: unknown, played: boolean): StorySave {
  const o = raw as Partial<StorySave> | null | undefined;
  if (!o || typeof o !== 'object') return { done: played ? 1 : 0, climbs: 0, step: null };
  const n = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.min(Math.floor(v), max) : 0);
  return { done: n(o.done, STORY_CHAPTERS), climbs: n(o.climbs, 1000), step: typeof o.step === 'string' ? o.step : null };
}

/** The chapter that is ready to start, or null. */
export function chapterReady(s: StorySave): number | null {
  if (s.done >= STORY_CHAPTERS) return null;
  if (s.done === 0 || s.climbs >= 1) return s.done + 1;
  return null;
}

/** A Tower climb ended (cleared, rested or knocked out). Tutorial floors and test links don't count. */
export function noteClimb(s: StorySave, run: { test: boolean; tutorial: boolean }): void {
  if (run.test || run.tutorial) return;
  s.climbs++;
}

/** Chapter n is over: the next one waits for a new climb. */
export function finishChapter(s: StorySave, n: number): void {
  s.done = Math.min(STORY_CHAPTERS, Math.max(s.done, n));
  s.climbs = 0;
  s.step = null;
}
