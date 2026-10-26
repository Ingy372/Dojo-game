// M7-P11: the run in progress is saved at the start of each room, so closing the app
// doesn't lose the climb. It's cleared when the run ends.

import {
  bankRunDecorations,
  finishRun,
  recordFloorResult,
  gainXp,
  restoreRun,
  runXp,
  summarizeRun,
  type Profile,
  type RunState,
  type RunSummary,
  type TrainingState,
} from '@dojo/sim';
import { homeDojo } from './dojo';
import { loadSave, writeSave } from './save';
import { CONTENT } from './content';

const KEY = 'dojo-ascent-run-in-progress';

export function saveRunInProgress(run: RunState): void {
  try {
    if (run.status === 'playing') localStorage.setItem(KEY, JSON.stringify(run));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage full or blocked: the run just can't be resumed.
  }
}

export function clearRunInProgress(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

/** The saved run, or null (none, unreadable, or from content that changed). */
export function savedRun(): RunState | null {
  try {
    const run = restoreRun(CONTENT, JSON.parse(localStorage.getItem(KEY) ?? 'null'));
    if (!run) localStorage.removeItem(KEY);
    return run;
  } catch {
    return null;
  }
}

/**
 * Adds a finished run to the save: items, decorations, experience. The saved run is cleared
 * first, so a run can never be banked twice. Used when a run ends, and for "Rest for now".
 */
export function bankRun(
  run: RunState,
  training: TrainingState,
  result: 'cleared' | 'lost' | 'rested',
): { summary: RunSummary; xp: ReturnType<typeof gainXp>; profile: Profile } {
  clearRunInProgress();
  const profile = loadSave();
  const summary = summarizeRun(run);
  finishRun(profile, summary);
  recordFloorResult(profile, run.tier, result);
  // Surprise pieces keep their colour roll; all remember this floor's belt. One-time pieces
  // (Journal trophies, keeper statues, the folding screen) are added too. Test runs add nothing.
  const belt = training.belts[run.tier - 1] ?? training.belt;
  const earned = bankRunDecorations(profile, homeDojo(profile), CONTENT, summary, { tier: run.tier, color: belt.color });
  if (profile.lastRun) profile.lastRun.earned = earned;
  // Experience, capped by the real belt (with the Blessing and catch-up bonuses).
  const xp = gainXp(profile, training, runXp(summary));
  if (profile.lastRun) profile.lastRun.xp = xp;
  writeSave(profile);
  return { summary, xp, profile };
}
