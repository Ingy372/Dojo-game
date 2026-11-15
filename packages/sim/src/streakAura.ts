// LP-B3 (L4): the aura around the hero comes from the best weekly class streak the student
// ever had, so it only grows. A shorter streak now never shrinks it, and nothing warns.

import type { Profile } from './profile';

/** Remembers a new best streak. Returns true when it grew (so the caller saves). */
export function noteBestStreak(profile: Profile, weeks: number): boolean {
  if (!(weeks > profile.bestStreakWeeks)) return false;
  profile.bestStreakWeeks = Math.floor(weeks);
  return true;
}

/** How many aura rings the best streak has reached (0 = no aura). `steps` go up in weeks. */
export function auraRings(bestWeeks: number, steps: readonly number[]): number {
  return steps.filter((s) => bestWeeks >= s).length;
}
