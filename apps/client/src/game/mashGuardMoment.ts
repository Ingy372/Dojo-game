// B-MASHER-2: "Sensei steps back" shows once per run, the first time Mash guard turns off in a room.
// The Manager's call: "seen" is saved with the run (RunState.mashGuardSeen), so a reload doesn't show it again.
import text from '../../../../content/settings/mash-guard.json';

export const MASH_GUARD_LINE: string = text.steppedBackLine;

/** True the first time it is called for a run, false after (also after the run is saved and restored). */
export function takeMashGuardMoment(run: { mashGuardSeen?: boolean }): boolean {
  if (run.mashGuardSeen) return false;
  run.mashGuardSeen = true;
  return true;
}
